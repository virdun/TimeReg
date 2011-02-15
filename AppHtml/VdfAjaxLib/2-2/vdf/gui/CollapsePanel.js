/*
Name:
    vdf.gui.TreeView
Type:
    Prototype

Revisions:
    2009/10/07  Created the initial version. (HW, DAE)
*/




/*
Constructor of the CollassePanel component which applies to the API for automatic initialization 
(See: vdf.core.init).

@param  eElement    The DOM element defining the menu.
@param  oParent     Reference to the parent control if the control is nested.
*/
vdf.gui.CollapsePanel = function CollapsePanel(eElement, oParent){
    this.Control(eElement, oParent);
    
    /*
    The CSS class set to the DOM element.
    */
    this.sCssClass          = this.getVdfAttribute("sCssClass", "collapsepanel", false);
    
    /*
    This property contains the current state of the panel (true if expanded, false if collapsed). 
    The property can be set from HTML to determine the initial state of the component.
    */
    this.bExpanded          = this.getVdfAttribute("bExpanded", true, false);
    /*
    This property can be used the disable the animation that is displayed when the panel is expanded 
    or collapsed. By default this animation is enabled.
    */
    this.bAnimate    = this.getVdfAttribute("bAnimate", true, true);
    /*
    This property determines the duration of the animation in milliseconds.
    */
    this.iAnimDuration    = this.getVdfAttribute("iAnimDuration", 400, false);
    /*
    This property determines the delay between the frames of the animation.
    */
    this.iAnimDelay    = this.getVdfAttribute("iAnimDelay", 40, false);
    /*
    If this property is set to true the system will try to lock the width of the panel while it is 
    collapsed.
    */
    this.bLockWidth    = this.getVdfAttribute("bLockWidth", false, false);
    
    /*
    This property contains a reference to the content DOM element.
    */
    this.eContent = null;
    /*
    This property contains a reference to the title DOM element.
    */
    this.eTitle = null;
    /*
    This property contains a reference to the generated button DOM element.
    */
    this.eSwitchBtn = null;
    
    //  @privates
    this.oAnim = null;
    this.iTotalHeight = 0;
    
    //  Container stuff
    this.aChildren          = [];
    
    
    //  Set classname
    vdf.sys.gui.addClass(this.eElement, this.sCssClass);
};
/*
This component will display an expandable panel. It is designed to have a title and a block of 
content that can be any kind of HTML content. To define the panel you define a div element that has 
to contain another div element containing the content, optionally an h1 / h2 / h3 / h4 element 
containing the title can be defined. The system will add the button that can be used to collapse / 
expand the panel.

@code
<div vdfControlType="vdf.gui.CollapsePanel" vdfExpanded="false"><h2>Vendor details</h2>
    <div>
        ...
    </div>
</div>
@code
*/
vdf.definePrototype("vdf.gui.CollapsePanel", "vdf.core.Control",{

/*
This method initializes the control by searching for the needed DOM elements. The switch button is 
generated and the required event listeners are attached.
*/
init : function(){
    var eSwitch;
    
    //  Find the content & title eElement
    vdf.sys.dom.loopChildren(this.eElement, function(eElement){
        if(!this.eContent && eElement.tagName === "DIV"){
            this.eContent = eElement;
        }else if(vdf.getDOMAttribute(eElement, "sElement") === "content"){
            this.eContent = eElement;
        }else if(!this.eTitle && (eElement.tagName === "H1" || eElement.tagName === "H2" || eElement.tagName === "H3" || eElement.tagName === "H4")){
            this.eTitle = eElement;
        }else if(vdf.getDOMAttribute(eElement, "sElement") === "title"){
            this.eTitle = eElement;
        }
    }, this);
    
    if(!this.eContent){
        throw new vdf.errors.Error(5149, "No content element found!", this, [ "content", "vdf.gui.CollapsePanel" ]);
    }
    vdf.sys.gui.addClass(this.eContent, "cp_content");
    
    //  Set CSS
    if(this.eTitle && this.eTitle.className.match(this.sCssClass) === null){
        this.eTitle.className = "cp_title";
    }
    
    //  Create switch button
    eSwitch = document.createElement("A");
    eSwitch.className = "cp_button"; //(this.bExpanded ? "cp_btn_collapse" : "cp_btn_expand");
    eSwitch.href = "javascript: vdf.sys.nothing();";
    eSwitch.innerHTML = "&nbsp;";
    this.eElement.insertBefore(eSwitch, (this.eTitle ? this.eTitle : this.eElement.firstChild));        
    vdf.events.addDomListener("click", eSwitch, this.toggle, this);
    this.eSwitchBtn = eSwitch;
    
    if(this.bLockWidth){
        this.eElement.style.width = this.eElement.clientWidth + "px";
    }
    
    this.sPrevOverflow = this.eContent.style.overflowY;
    this.sPrevDisplay = this.eContent.style.visibility;
    
    if(!this.bExpanded){
        this.collapse(true);
    }else{
        this.expand(true);
    }
    
    
},

/*
This method will expand or collapse the panel based on its current state.
*/
toggle : function(){
    if(this.bExpanded){
        this.collapse();
    }else{
        this.expand();
    }
},

/*
This method will collapse the panel.

@param  bOptNoAnim  (optional) If true the animation is skipped.
*/
collapse : function(bOptNoAnim){
    var that = this, fFinished;

    this.bExpanded = false;
    vdf.sys.gui.removeClass(this.eElement, "cp_expanded");
    //this.eSwitchBtn.className = "cp_btn_expand";
    
    fFinished = function(){
        that.oAnim = null;
        that.eContent.style.height = "0px";
        that.eContent.style.visibility = "hidden";
    };
    
    
    if(!this.bAnimate || bOptNoAnim){
        this.sPrevOverflow = this.eContent.style.overflowY;
        this.sPrevDisplay = this.eContent.style.visibility;
        fFinished();
    }else{
        if(this.oAnim){
            this.oAnim.stop();
        }else{
            this.sPrevOverflow = this.eContent.style.overflowY;
            this.sPrevDisplay = this.eContent.style.visibility;
            this.eContent.style.overflowY = "hidden";

        }
        this.oAnim = vdf.sys.fx.doEffect({
            eTarget : this.eContent,
            
            sType : "height",
            sTo : "0px",
            iDuration : this.iAnimDuration,
            
            fFinished : fFinished
        }, 1, this.iAnimDelay);
    }
},

/*
This method will expand the panel.

@param  bOptNoAnim  (optional) If true the animation is skipped.
*/
expand : function(bOptNoAnim){
    var that = this, fFinished;

    this.bExpanded = true;
    vdf.sys.gui.addClass(this.eElement, "cp_expanded");
    //this.eSwitchBtn.className = "cp_btn_collapse"
    
    fFinished = function(){
        that.oAnim = null;
        that.eContent.style.height = "";
        that.eContent.style.overflowY = that.sPrevOverflow;
    };
    
    if(!this.bAnimate || bOptNoAnim){
        fFinished();
    }else{
        if(this.oAnim){
            this.oAnim.stop();
        }else{
            this.eContent.style.overflowY = "hidden";
            this.eContent.style.visibility = this.sPrevDisplay;
        }
        this.oAnim = vdf.sys.fx.doEffect({
            eTarget : this.eContent,
            
            sType : "height",
            sTo : this.eContent.scrollHeight + "px",
            iDuration : this.iAnimDuration,
            
            fFinished : fFinished
        }, 1, this.iAnimDelay);
    }
},

// - - - - - - - - - - CONTAINER FUNCTIONALITY - - - - - - - - - - 

/*
Called by the initializer if a nested control is found. Adds the control into 
the aChildren array so it will get bubbling event messages.

@param  oControl    Reference to the control object.
*/
addChild : function(oControl){
    this.aChildren.push(oControl);
},

/*
Forwards the addDEO call to the parent control if this supports the addDEO 
call.

@param  oDeo    Data Entry Object that wants to register itself.
*/
addDEO : function(oDeo){
    if(this.oParentControl !== null && typeof(this.oParentControl.addDEO) === "function"){
        this.oParentControl.addDEO(oDeo);
    }
},

/*
Calls the formInit function on the children so they can do their intialization.
Usually used if the childs initialization requires meta data to be loaded or DD
structures to be initialized.

@private
*/
formInit : function(){
    var iChild;
    
    for(iChild = 0; iChild < this.aChildren.length; iChild++){
        if(typeof(this.aChildren[iChild].formInit) === "function"){
            this.aChildren[iChild].formInit();
        }
    }
},

/*
@return A reference to a form object if the control is nested inside a form.
@private
*/
getForm : function(){
    //  Find reference to form
    if(this.oParentControl !== null && this.oParentControl.bIsForm){    
        return this.oParentControl;
    }else if(this.oParentControl !== null && typeof(this.oParentControl.getForm) === "function"){
        return this.oParentControl.getForm();
    }
    
    return null;
}

});