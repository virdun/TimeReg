/*
Graphical effects classes.

@private
*/
vdf.sys.fx = {

/*
Regular expression that can be used to get the value and the unit from a string.
@private
*/
valRegex : /^([+\-]=)?([\d+\-.]+)(.*)$/,

/*
The animAddClass and animRemoveClass methods will skipp these styles. Mostly because in some 
browsers these styles behave "strange" when other styles are set.

@private
*/
skipStyles : {
    outlineColor : true,
    scrollbarBaseColor : true
},

/*
Creates an effect object. Looks at the given JSON configuration object to 
determine the correct class to use.

@private
*/
createEffect : function(oProps, oSet){
    if(oProps.sType.toLowerCase().indexOf("color") >= 0){
        return new vdf.sys.fx.FadeColor(oProps, oSet);
    }else{
        return new vdf.sys.fx.Fade(oProps, oSet);
    }
},

/*
Performs one effect or more effects based on a JSON style effect descriptor. An 
reference to the vdf.sys.fx.Set object is returned. The effect is started 
immediately. More information on the definition object of the animation can be 
found on the vdf.sys.fx.Effect class or its subclasses.

@code
//  Animates the width of the "mydiv" element to 300px in 1,5 second.
vdf.sys.fx.doEffect({
   eTarget : document.getElementById("mydiv"),
   sType : "width",
   sTo : "300px",
   iDuration : 1500
});
@code

@param  oProps  Object describing the animation to perform. By passing an array 
            with effect definition objects multiple effects can be executed at 
            once. 
@param  iLoop   (default: 1) Number of times the animation is repeated, -1 will 
            cause an infinite loop.
@param  iDelay  (default: vdf.settings.iFxSpeed) The number of milliseconds 
            between the frames.
@return Reference to the vdf.sys.fx.Set object.

*/
doEffect : function(oProps, iLoop, iDelay){
    return this.doSet({ aEffects : (oProps instanceof Array ? oProps : [ oProps ]), iLoop : iLoop, iDelay : iDelay });
},

/*
Performs a set of effects based on a JSON style definition. The set of effects 
is started immediately. More information on the definition object of the 
animation can be found on the vdf.sys.fx.Set class or its subclasses.

@param  oProps  Object describing the set of effects to perform.
@return Reference to the vdf.sys.fx.Set object.
*/
doSet : function(oProps){
    var oSet = new vdf.sys.fx.Set(oProps);
    oSet.run();
    return oSet;
},

doAnimation : function(oProps){
    var oAni = new vdf.sys.fx.Animation(oProps);
    oAni.run();
    return oAni;
},

copyAniStyles : function(eElem){
    var oResult = { }, oStyle, sProp, aParts;
    
    oStyle = vdf.sys.gui.getPropCurrentStyle(eElem);
    
    for(sProp in oStyle){
        if(sProp == "backgroundPosition"){
            aParts = (oStyle[sProp] || "").split(" ");
            if(aParts.length > 1){
                oResult.backgroundx = aParts[0];
                oResult.backgroundy = aParts[1];
            }
        }else if(oStyle[sProp] && 
                (!isNaN(parseFloat(oStyle[sProp])) || sProp.toLowerCase().indexOf("color") >= 0) && 
                (sProp.substr(0, 3) !== "Moz")){
            
            oResult[sProp] = oStyle[sProp];
        }
    }
    
    oResult.opacity = this.defaults.opacity(eElem);
    
    return oResult;
},

animDiffClass : function(eElem, sClass, iType, iDuration, fFinished, oFinishEnv){
    var sCurStyle, sCurClass, oFrom, oTo, sProp, aEffects = [], bSkip, fFinal, oSet;
    
    sCurStyle = eElem.getAttribute("style") || " ";
    sCurClass = eElem.className;
    oFrom = this.copyAniStyles(eElem);
    
    if(iType === 0){
        vdf.sys.gui.addClass(eElem, sClass);
    }else if(iType === 1){
        vdf.sys.gui.removeClass(eElem, sClass);
    }else{
        eElem.className = sClass;
    }
    
    oTo = this.copyAniStyles(eElem);
    eElem.className = sCurClass;
    
    for(sProp in oTo){
        if(oTo.hasOwnProperty(sProp) && oTo[sProp] !== oFrom[sProp]){
            bSkip = this.skipStyles.hasOwnProperty(sProp) && this.skipStyles[sProp];
            
            //  If the right or bottom changes this is probably caused by a change in width / height, since we want to do this without defining a from (to make a pause more flexible) we check for this
            if(sProp == "right"){
                bSkip = ((parseInt(oTo.width, 10) - parseInt(oFrom.width, 10)) === (parseInt(oFrom.right, 10) - parseInt(oTo.right, 10)));
            }       
            if(sProp == "bottom"){
                bSkip = ((parseInt(oTo.height, 10) - parseInt(oFrom.height, 10)) === (parseInt(oFrom.bottom, 10) - parseInt(oTo.bottom, 10)));
            }
            
            if(!bSkip){
                aEffects.push({
                    sType : sProp,
                    eTarget : eElem,
                    sTo : oTo[sProp],
                    iDuration : iDuration || 1000
                });
            }
        }
    }
    
    fFinal = function(){
        if(iType === 0){
            vdf.sys.gui.addClass(eElem, sClass);
        }else if(iType === 1){
            vdf.sys.gui.removeClass(eElem, sClass);
        }else{
            eElem.className = sClass;
        }
        if(typeof(eElem.getAttribute("style")) == "object"){
            eElem.style.cssText = "";
            eElem.style.cssText = sCurStyle;
        }else{
            eElem.setAttribute("style", sCurStyle);
        }
        if(fFinished){
            fFinished.call(oFinishEnv);
        }
    };
    
    if(aEffects.length > 0){
        oSet = new vdf.sys.fx.Set({
            aEffects : aEffects,
            fFinished : fFinal
        });
        return oSet;
    }else{
        fFinal();
        return null;
    }
},

animAddClass : function(eElem, sClass, iDuration, fFinished, oFinishEnv){
    return this.animDiffClass(eElem, sClass, 0, iDuration, fFinished, oFinishEnv);
},
animRemoveClass : function(eElem, sClass, iDuration, fFinished, oFinishEnv){
    return this.animDiffClass(eElem, sClass, 1, iDuration, fFinished, oFinishEnv);
},
animSetClass : function(eElem, sClass, iDuration, fFinished, oFinishEnv){
    return this.animDiffClass(eElem, sClass, 2, iDuration, fFinished, oFinishEnv);
},

workers : {
    opacity : function(eElem, oOpts, iVal){
        vdf.sys.gui.setOpacity(eElem, iVal);
    },
    
    backgroundx : function(eElem, oOpts, iVal){
        var aParts, x = 0, y = 0;
        
        aParts = (eElem.style.backgroundPosition + '').split(" ");
        if(aParts.length >= 2){
            x = parseInt(aParts[0], 10);
            y = parseInt(aParts[1], 10);
        }
        
        eElem.style.backgroundPosition = iVal + oOpts.sUnit + ' ' + y + oOpts.sUnit;  
    },
    
    backgroundy : function(eElem, oOpts, iVal){
        var aParts, x = 0, y = 0;
        
        aParts = (eElem.style.backgroundPosition + '').split(" ");
        if(aParts.length >= 2){
            x = parseInt(aParts[0], 10);
            y = parseInt(aParts[1], 10);
        }
        
        eElem.style.backgroundPosition = x + oOpts.sUnit + ' ' + iVal + oOpts.sUnit;  
    },
    
    _default : function(eElem, oOpts, iVal){
        eElem.style[oOpts.sType] = Math.ceil(iVal) + oOpts.sUnit;
    }
},

defaults : {
    width : function(eElem){
        return parseInt(eElem.offsetWidth, 10);
    },
    height : function(eElem){
        return parseInt(eElem.offsetHeight, 10);
    },
    left : function(eElem){
        return vdf.sys.gui.getAbsoluteOffsetLeft(eElem);
    },
    top : function(eElem){
        return vdf.sys.gui.getAbsoluteOffsetTop(eElem);
    },
    opacity : function(eElem){
        return vdf.sys.gui.getOpacity(eElem, true);
    },
    backgroundx : function(eElem){
        var aParts = (vdf.sys.gui.getCurrentStyle(eElem).backgroundPosition + '').split(" ");

        return (aParts.length >= 2 ?parseInt(aParts[0], 10) : 0);
    },
    
    backgroundy : function(eElem){
        var aParts = (vdf.sys.gui.getCurrentStyle(eElem).backgroundPosition + '').split(" ");
        
        return (aParts.length >= 2 ?parseInt(aParts[1], 10) : 0);
    },
    _default : function(eElem, oOpts){
        return parseInt(vdf.sys.gui.getCurrentStyle(eElem)[oOpts.sType], 10);
    }
}

};

vdf.sys.fx.Effect = function Effect(oProps, oSet){
     this.eTarget = oProps.eTarget;
    if(!this.eTarget){
        throw new vdf.errors.Error(0, "The eTarget is a required property.", this);
    }

    this.fFinished = oProps.fFinished || null; 
    this.oFinishEnv = oProps.oFinishEnv || null; 
    
    this.iHold = (isNaN(oProps.iHold) ? 0 : oProps.iHold);
    this.iGear = (isNaN(oProps.iGear) ? 1 : oProps.iGear);
    
    this.iCur = 0;
    this.iDelay = oSet.iDelay;
    this.bDone = false;
    this.bPaused = false;
};
vdf.definePrototype("vdf.sys.fx.Effect",{

process : function(oSet, iMill){
    if(iMill >= this.iHold && !this.bDone && !this.bPaused){
        this.iCur++;
        if(this.iCur >= this.iGear){
            this.iCur = 0;
            
            this.doEffect(oSet, iMill);
        }
    }
},

finish : function(oSet, iMill){
    //vdf.log("Finished at tick: " + iMill + " With step: " + this.iStep);
    this.bDone = true;
    oSet.iDone++;
    
    if(this.fFinished){
        this.fFinished.call(this.oFinishEnv);
    }
},

prepare : function(){
    this.bDone = false;
},

doEffect : function(iMill){

},

stop : function(){
    if(!this.bDone){
        this.finish();
    }
},

pause : function(){
    this.bPaused = true;
},

resume : function(){
    this.bPaused = false;
}

});

vdf.sys.fx.Fade = function Fade(oProps, oSet){
    var aParts;
    
    this.Effect(oProps, oSet);

    //  Determine type
    this.sType = oProps.sType || "function";
    
    //  Determine worker
    if(typeof(oProps.fWorker) == "function"){
        this.fWorker = oProps.fWorker;
    }else{
        if(vdf.sys.fx.workers[this.sType]){
            this.fWorker = vdf.sys.fx.workers[this.sType];
        }else{
            this.fWorker = vdf.sys.fx.workers._default;
        }
    }
    if(typeof(this.fWorker) !== "function"){
        throw new vdf.errors.Error(0, "No worker method found!", this);
    }
    
    
    aParts = vdf.sys.fx.valRegex.exec((oProps.sFrom ? oProps.sFrom : ""));
    this.iFrom = (aParts ? parseInt(aParts[2], 10) : (isNaN(oProps.iFrom) ? null : oProps.iFrom));
    
    aParts = vdf.sys.fx.valRegex.exec((oProps.sTo ? oProps.sTo : ""));
    this.iTo = (aParts ? parseInt(aParts[2], 10) : (isNaN(oProps.iTo) ? 100 : oProps.iTo));
    this.sUnit = oProps.sUnit || (aParts && aParts[3] ? aParts[3] : "px");
    this.iStep = (isNaN(oProps.iStep) ? null : oProps.iStep);
    
    this.iDuration = (isNaN(oProps.iDuration) ? 1000 : oProps.iDuration);
    
    //  @privates
    this.iVal = 0;
    this.iStartFrom = this.iFrom;
    this.iStartStep = this.iStep;
};
vdf.definePrototype("vdf.sys.fx.Fade", "vdf.sys.fx.Effect", {

doEffect : function(oSet, iMill){
    this.iVal = (this.iStep < 0 ? Math.floor(this.iVal + this.iStep) : Math.ceil(this.iVal + this.iStep));
            
    if((this.iTo >= this.iFrom && this.iVal >= this.iTo) || (this.iTo < this.iFrom && this.iVal <= this.iTo)){
        this.iVal = this.iTo;
        this.fWorker(this.eTarget, this, this.iVal);
        //vdf.log("Effect: " + this.sType + " Finished at: " + this.iVal);
        this.finish(oSet, iMill);
    }else{
        this.fWorker(this.eTarget, this, this.iVal);
    }
},

prepare : function(){
    this.Effect.prototype.prepare.call(this);

    //  Determine start value 
    if(this.iStartFrom === null){
        this.iFrom = this.getCurrent();
        
        if(this.sUnit !== "px"){
            this.fWorker(this.eTarget, this, this.iTo);
            this.iFrom = this.iTo / this.getCurrent() * this.iFrom;
            if(isNaN(this.iFrom)){
                this.iFrom = 0;
            }
        }
    }
    this.fWorker(this.eTarget, this, this.iFrom);
    this.iVal = this.iFrom;
    
    //  Determine the step size
    if(this.iStartStep === null){
        this.iStep = (this.iTo - this.iFrom) / (this.iDuration / (this.iDelay * this.iGear));
    }
},

getCurrent : function(){
    var i;
    
    if(vdf.sys.fx.defaults[this.sType]){
        i = vdf.sys.fx.defaults[this.sType](this.eTarget, this);
    }else{
        i = vdf.sys.fx.defaults._default(this.eTarget, this);
    }
    
    return (isNaN(i) ? 0 : i);
}


});


vdf.sys.fx.FadeColor = function FadeColor(oProps, oSet){
    this.Effect(oProps, oSet);

    //  Determine type
    this.sType = oProps.sType || "function";
    
    this.oFrom = (oProps.sFrom ? vdf.sys.gui.parseColor(oProps.sFrom) : null);
    this.oTo = vdf.sys.gui.parseColor(oProps.sTo);
    
    this.iR = 0;
    this.iG = 0;
    this.iB = 0;    
    
    this.iSR = 0;
    this.iSG = 0;
    this.iSB = 0;

    this.iDuration = (isNaN(oProps.iDuration) ? 1000 : oProps.iDuration);
    
    
    //  @privates
    this.oStartFrom = (oProps.sFrom ? vdf.sys.gui.parseColor(oProps.sFrom) : null);
};
vdf.definePrototype("vdf.sys.fx.FadeColor", "vdf.sys.fx.Effect", {


doEffect : function(oSet, iMill){
    this.iR += this.iSR;
    this.iG += this.iSG;
    this.iB += this.iSB;
    
    this.eTarget.style[this.sType] = 'rgb(' + parseInt(this.iR, 10) + ', ' + parseInt(this.iG, 10) + ', ' + parseInt(this.iB, 10) + ')';
    
    if((this.iSR < 0 ? this.iR <= this.oTo.iR : this.iR >= this.oTo.iR) && 
            (this.iSG < 0 ? this.iG <= this.oTo.iG : this.iG >= this.oTo.iG) && 
            (this.iSB < 0 ? this.iB <= this.oTo.iB : this.iB >= this.oTo.iB)){
        
        this.finish(oSet, iMill);
    }

},

prepare : function(){
    this.Effect.prototype.prepare.call(this);

    if(this.oStartFrom === null){
        if(vdf.sys.fx.defaults[this.sType]){
            this.oFrom = vdf.sys.fx.defaults[this.sType](this.eTarget);
        }else{
            this.oFrom = vdf.sys.gui.parseColor(vdf.sys.gui.getCurrentStyle(this.eTarget)[this.sType]); //vdf.sys.gui.parseColor((typeof(window.getComputedStyle) === "function" ? window.getComputedStyle(this.eTarget, null) : this.eTarget.currentStyle)[this.sType]); //
        }
    }
    
    this.iR = this.oFrom.iR;
    this.iG = this.oFrom.iG;
    this.iB = this.oFrom.iB;
    
    this.eTarget.style[this.sType] = 'rgb(' + parseInt(this.iR, 10) + ', ' + parseInt(this.iG, 10) + ', ' + parseInt(this.iB, 10) + ')';

    this.iSR = (this.oTo.iR - this.oFrom.iR) / (this.iDuration / (this.iDelay * this.iGear));
    this.iSG = (this.oTo.iG - this.oFrom.iG) / (this.iDuration / (this.iDelay * this.iGear));
    this.iSB = (this.oTo.iB - this.oFrom.iB) / (this.iDuration / (this.iDelay * this.iGear));
}


});

vdf.sys.fx.Set = function Set(oProps, oTime){
    var i;
    
    this.fFinished = oProps.fFinished || null; 
    this.oFinishEnv = oProps.oFinishEnv || null; 
    
    this.iLoops = (isNaN(oProps.iLoops) ? 1 : oProps.iLoops);
    this.iDelay = (isNaN(oProps.iDelay) ? (oTime ? oTime.oAni.iDelay : 80) : oProps.iDelay);
    
    this.iDone = 0;
    this.iLoop = 0;
    this.iTicks = 0;
    this.bPaused = false;
    this.bStopped = false;
    this.bRunning = false;
    
    this.aEffects = [];
    this.oTime = oTime || null;
    
    if(oProps.aEffects){
        for(i = 0; i < oProps.aEffects.length; i++){
            this.aEffects.push(vdf.sys.fx.createEffect(oProps.aEffects[i], this));
        }
    }
};
vdf.definePrototype("vdf.sys.fx.Set",{

run : function(){
    var fTick, that = this;
    
    if(!this.bRunning){
        this.bRunning = true;
        this.prepare();
        
        fTick = function(){
            that.process();
            
            if(!that.bStopped){
                setTimeout(fTick, that.iDelay);
            }
        };

        setTimeout(fTick, this.iDelay);
    }else{
        this.resume();
    }
},

prepare : function(){
    var i;
    
    this.bStopped = false;
    this.iDone = 0;
    this.iTicks = 0;
    
    for(i = 0; i < this.aEffects.length; i++){
        this.aEffects[i].prepare();
    }
},

process : function(oTime){
    var iMill, i;

    if(!this.bPaused && !this.bStopped){
        this.iTicks++;
        if(this.iDone >= this.aEffects.length){
            this.iLoop++;
            
            if(this.iLoops < 0 || this.iLoop < this.iLoops){
                this.prepare();
            }else{
                this.finish(oTime);
            }
        }else{
            iMill = this.iTicks * this.iDelay;
            
            for(i = 0; i < this.aEffects.length; i++){
                this.aEffects[i].process(this, iMill);
            }
        }
    }
},

pause : function(){
    this.bPaused = true;
},

resume : function(){
    this.bPaused = false;
},

finish : function(oTime, bNoFinish){
    if(oTime){
        oTime.setFinished();
    }else if(this.oTime){
        this.oTime.setFinished();
    }
    this.bStopped = true;
      
    if(!bNoFinish && this.fFinished){
        this.fFinished.call(this.oFinishEnv);
    }
},

stop : function(bNoFinish){
    this.bStopped = true;
    this.finish(null, bNoFinish);
},

addEffect : function(oEffect){
    this.aEffects.push(oEffect);
}

});


vdf.sys.fx.Timeline = function Timeline(oProps, oAni){
    var i;
    
    this.iLoops = (isNaN(oProps.iLoops) ? 1 : oProps.iLoops);
    this.iLoop = 0;
    
    this.bDone = false;
    this.iCurrent = 0;
    this.aQueue = [];
    this.oAni = oAni;
    
    if(oProps.aQueue){
        for(i = 0; i < oProps.aQueue.length; i++){
            this.aQueue.push(new vdf.sys.fx.Set(oProps.aQueue[i], this));
        }
    }
};
vdf.definePrototype("vdf.sys.fx.Timeline",{

prepare : function(){
    this.bDone = false;
    this.iCurrent = 0;
    
    if(this.aQueue.length > 0){
        this.aQueue[0].prepare();
    }
},

process : function(){
    if(!this.bDone && this.iCurrent < this.aQueue.length){
        this.aQueue[this.iCurrent].process(this);
    }
},

setFinished : function(){
    this.iCurrent++;
    
    if(this.iCurrent >= this.aQueue.length){
        this.iLoop++;
        if(this.iLoops < 0 || this.iLoop < this.iLoops){
            this.prepare();
        }else{
            this.bDone = true;
            if(this.oAni){
                this.oAni.iDone++;
            }
        }
    }else{
        this.aQueue[this.iCurrent].prepare();
    }
},

addSet : function(oSet){
    oSet.oTime = this;
    this.aQueue.push(oSet);
}

});


vdf.sys.fx.Animation = function Animation(oProps){
    var i;

    this.fFinished = oProps.fFinished || null; 
    this.oFinishEnv = oProps.oFinishEnv || null; 
    
    this.aTimelines = [];
    this.iDone = 0;
    this.iLoop = 0;
    this.iLoops = (isNaN(oProps.iLoops) ? 1 : oProps.iLoops);
    this.iDelay = (isNaN(oProps.iDelay) ? 80 : oProps.iDelay);
    this.bRunning = false;
    this.bStopped = false;
    
    if(oProps.aTimelines){
        for(i = 0; i < oProps.aTimelines.length; i++){
            this.aTimelines.push(new vdf.sys.fx.Timeline(oProps.aTimelines[i], this));
        }
    }
};
vdf.definePrototype("vdf.sys.fx.Animation",{

run : function(){
    var fTick, that = this;
    
    if(!this.bRunning){
        this.bRunning = true;
        this.bStopped = false;
        
        this.prepare();
        
        fTick = function(){
            that.process();
            
            if(!that.bStopped){
                setTimeout(fTick, that.iDelay);
            }
        };

        setTimeout(fTick, this.iDelay);
    }else{
        this.resume();
    }
},

prepare : function(){
    var i;
    
    this.bStopped = false;
    this.iDone = 0;
    
    for(i = 0; i < this.aTimelines.length; i++){
        this.aTimelines[i].prepare();
    }
},

process : function(){
    var i;

    if(!this.bPaused && !this.bStopped){
        if(this.iDone >= this.aTimelines.length){
            this.iLoop++;
            
            if(this.iLoops < 0 || this.iLoop < this.iLoops){
                this.prepare();
            }else{
                this.finish();
            }
        }else{
            for(i = 0; i < this.aTimelines.length; i++){
                this.aTimelines[i].process(this);
            }
        }
    }
},

pause : function(){
    this.bPaused = true;
},

resume : function(){
    this.bPaused = false;
},

finish : function(){
    this.bRunning = false;
    this.bStopped = true;
    if(this.fFinished){
        this.fFinished.call(this.oEnvironment);
    }
},

stop : function(){
    if(!this.bStopped){
        this.finish();
    }
},

addTimeline : function(oTimeline){
    oTimeline.oAni = this;
    this.aTimelines.push(oTimeline);
},

addSet : function(oSet){
    var oTimeline = new vdf.sys.fx.Timeline({}, this);
    
    this.addTimeline(oTimeline);
    oTimeline.addSet(oSet);
}

});

