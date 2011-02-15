/*
Name:
    vdf.gui.Scrollbar
Type:
    Prototype
Revisions:
    2005/07/01  Created the first version of the scrollbar (HW, DAE)
    2008/09/17  Updated to the 2.0 structure and complete rewrite of the 
    internal working according to new techniques (HW, DAE)

*/

//  Includes the CSS file that belongs to the scrollbar
//  @requireCSS Scrollbar.css

/*
Constant defining the scroll to top action.
*/
vdf.gui.SCROLL_TOP = -3;
/*
Constant defining the scroll up action.
*/
vdf.gui.SCROLL_UP = -2;
/*
Constant defining the scroll step up action.
*/
vdf.gui.SCROLL_STEP_UP = -1;
/*
Constant defining the scroll step down action.
*/
vdf.gui.SCROLL_STEP_DOWN = 1;
/*
Constant defining the scroll down action.
*/
vdf.gui.SCROLL_DOWN = 2;
/*
Constant defining the scroll to bottom action.
*/
vdf.gui.SCROLL_BOTTOM = 3;

/*
The constructor which is prepared for the initializer interface.

@param  eElement        DOM table of the scrollbar
@param  oParentControl  Parent control
*/
vdf.gui.Scrollbar = function ScrollBar(eElement, oParentControl){
    this.Control(eElement, oParentControl);
    
    /*
    Reference to the element that is scrolled (used for positioning).
    */
    this.eScrollElement = null;
    /*
    The CSS class that is set to the table DOM element.
    */
    this.sCssClass = this.getVdfAttribute("sCssClass", "scrollbar", false);
    
    /*
    If true the scrollbar is displayed on top of the eScrollElement using a 
    negative margin and a float left.
    */
    this.bOverLay = this.getVdfAttribute("bOverLay", false, false);
    /*
    The top margin of the the scrollbar.
    */
    this.iMarginTop = this.getVdfAttribute("iMarginTop", 0, false);
    /*
    The right margin of the scrollbar.
    */
    this.iMarginRight = this.getVdfAttribute("iMarginRight", 0, false);
    /*
    The bottom margin of the scrollbar.
    */
    this.iMarginBottom = this.getVdfAttribute("iMarginBottom", 0, false);
    
    /*
    If true the scrollbar will keep on firing the onScroll if the user holds the 
    down the down or up button.
    */
    this.bAutoScroll = this.getVdfAttribute("bAutoScroll", true, false);
    /*
    Milliseconds to wait between the autoscroll actions.
    */
    this.iAutoScrollWait = parseInt(this.getVdfAttribute("iAutoScrollWait", 60, false), 10);
    /*
    Milliseconds to wait before the autoscroll starts.
    */
    this.iAutoScrollStart = parseInt(this.getVdfAttribute("iAutoScrollStart", 500, false), 10);
    /*
    The number of pixels in the center that the user can use to drop the slider 
    without performing a scroll action.
    */
    this.iDeadZone = parseInt(this.getVdfAttribute("iDeadZone", 5, false), 10);
    
    //  Events
    /*
    Fired if the user scrolls.
    
    @prop   iDirection  One of the scrollactions defined in the constants.
    */
    this.onScroll = new vdf.events.JSHandler();
    
    // @privates
    this.iLastWidth = 0;
    this.iValue = -1;
    this.iSpaceTotal = 0;
    this.iSpaceBefore = 0;
    this.iSpaceAfter = 0;
    this.iStartDragY = 0;
    this.iStartDragBefore = 0;
    this.tScrollTimeout = null;
    
    this.eBtnDown = null;
    this.eBtnUp = null;
    this.eSpaceBefore = null;
    this.eSpaceAfter = null;
    this.eSlider = null;
};
/*
Contains the scrollbar component. The scrollbar is a VDF style scrollbar that 
works without knowing how long the scrolled data is. This means that it throws 
a scroll action event with 6 different modes that define how it should be 
scrolled. The scrollbar also has three display modes (top, center & bottom) to
which it returns after each action.
*/
vdf.definePrototype("vdf.gui.Scrollbar", "vdf.core.Control", {

/*
Initializes the scrollbar by creating of searching the DOM element and 
attaching the events.
*/
init : function(){
    if(this.eElement === null){
        this.createScrollbar();
    }else{
        //  TODO: Find references
    }
    
    //  Init DOM reference
    this.eElement.oVdfControl = this;
    
    this.attachEvents();
},

/*
Creates all the scrollbar elements.

@private
*/
createScrollbar : function(){
    var eTable, eRow, eBtnUp, eSpaceBefore, eSlider, eSpaceAfter, eBtnDown, eClearDiv;

    //  TABLE
    eTable = document.createElement("table");
    eTable.className = this.sCssClass;
    eTable.cellPadding = 0;
    eTable.cellSpacing = 0;
    
    //  Button up
    eRow = eTable.insertRow(eTable.rows.length);
    eBtnUp = eRow.insertCell(0);
    eBtnUp.innerHTML = "";
    eBtnUp.className = "btnup";
    
    //  Space before
    eRow = eTable.insertRow(eTable.rows.length);
    eSpaceBefore = eRow.insertCell(0);
    eSpaceBefore.innerHTML = "";
    eSpaceBefore.className = "before";
    
    //  Slider
    eRow = eTable.insertRow(eTable.rows.length);
    eSlider = eRow.insertCell(0);
    eSlider.innerHTML = "";
    eSlider.className = "slider";
    
    //  Space after
    eRow = eTable.insertRow(eTable.rows.length);
    eSpaceAfter = eRow.insertCell(0);
    eSpaceAfter.innerHTML = "";
    eSpaceAfter.className = "after";
    
    //  Button down
    eRow = eTable.insertRow(eTable.rows.length);
    eBtnDown = eRow.insertCell(0);
    eBtnDown.innerHTML = "";
    eBtnDown.className = "btndown";
    
    //  Insert into the DOM
    if(this.eScrollElement !== null){
        vdf.sys.dom.insertAfter(eTable, this.eScrollElement);
        
        //  Usually the scrollbar is displayed above the element it scrolls
        //  which is done making them both float and adding a clear div below.
        if(this.bOverLay){
            if(typeof(eTable.style.cssFloat) !== "undefined"){
                eTable.style.cssFloat = "left";
                this.eScrollElement.style.cssFloat = "left";
            }else{
                eTable.style.styleFloat = "left";
                this.eScrollElement.style.styleFloat = "left";
            }
            
            eClearDiv = document.createElement("div");
            eClearDiv.style.clear = "both";
            vdf.sys.dom.insertAfter(eClearDiv, eTable);
        }
    }else{
        document.body.appendChild(eTable);
    }
    
    //  Store references
    this.eElement = eTable;
    this.eBtnDown = eBtnDown;
    this.eBtnUp = eBtnUp;
    this.eSpaceBefore = eSpaceBefore;
    this.eSpaceAfter = eSpaceAfter;
    this.eSlider = eSlider;
},

/*
Attaches the events to the DOM elements.

@private
*/
attachEvents : function(){
    //    Attach event listeners
    if(this.bAutoScroll){
        vdf.events.addDomListener("mousedown", this.eBtnUp, this.onBtnUpStart, this);
        vdf.events.addDomListener("mouseup", this.eBtnUp, this.onBtnUpStop, this);
        vdf.events.addDomListener("mouseout", this.eBtnUp, this.onBtnUpStop, this);

        vdf.events.addDomListener("mousedown", this.eBtnDown, this.onBtnDownStart, this);
        vdf.events.addDomListener("mouseup", this.eBtnDown, this.onBtnDownStop, this);
        vdf.events.addDomListener("mouseout", this.eBtnDown, this.onBtnDownStop, this);
    }else{
        vdf.events.addDomListener('click', this.eBtnUp, this.onBtnUpClick, this);
        vdf.events.addDomListener('click', this.eBtnDown, this.onBtnDownClick, this);
    }

    vdf.events.addDomListener('mousedown', this.eSlider, this.onSliderMouseDown, this);
    vdf.events.addDomListener('click', this.eSpaceAfter, this.onSpaceAfterClick, this);
    vdf.events.addDomListener('click', this.eSpaceBefore, this.onSpaceBeforeClick, this);
},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    //    Remove event listeners
    if(this.eElement){
        vdf.events.clearDomListeners(this.eElement);
    }
    
    //  Destroy references
    this.eElement.oVdfControl = null;    
    this.eElement = null;
    this.eBtnDown = null;
    this.eBtnUp = null;
    this.eSpaceBefore = null;
    this.eSpaceAfter = null;
    this.eSlider = null;
},

/*

*/

/*
Called to recalculate the sizes & position. Usually fired by an element that has 
resized (for some reason). Usually bubbles up / down but for the scrollbar it 
doesn't. (re)calculates the position & length of the scrollbar and the slider.

@param bDown    If true it bubbles up to parent components.
@private
*/
recalcDisplay : function(bDown){
    var iHeight, iSpace, iLeft = 0, iBefore, iAfter;

    //  Determine height
    if(this.eScrollElement !== null){
        iHeight = this.eScrollElement.offsetHeight - this.iMarginTop - this.iMarginBottom; // - (vdf.sys.isMoz ? this.eScrollElement.offsetTop : 0)
    }else{
        iHeight = this.eElement.clientHeight;
    }
    
    if(iHeight > 0){
        //  Determine & set space before and after slider
        iSpace = iHeight - this.eBtnDown.offsetHeight - this.eBtnUp.offsetHeight - this.eSlider.offsetHeight; // Use offsetHeight because clientHeight doesn't work here with Safari engine
        iSpace = (iSpace > 0 ? iSpace : 10);
        if(this.iValue < 0){
            iBefore = 1;
            iAfter = iSpace - 1;
        }else if(this.iValue > 0){
            iBefore = iSpace - 1;
            iAfter = 1;
        }else{
            iBefore = Math.round(iSpace / 2);
            iAfter = Math.round(iSpace / 2);
            if(iSpace > 0 && iSpace%2){
                iAfter--;
            }
        }
        
        this.iSpaceTotal = iSpace;
        this.iSpaceBefore = iBefore;
        this.iSpaceAfter = iAfter;
        
        this.eSpaceBefore.style.height = iBefore + "px";
        this.eSpaceAfter.style.height = iAfter + "px";
        
        //  Calculate the position of the scrollbar
        if(this.bOverLay){
            iLeft = 0 - this.determineWidth() - this.iMarginRight;
            
            this.eElement.style.marginLeft = iLeft + "px";
            this.eElement.style.marginTop = this.iMarginTop + "px";
        }
        this.eElement.style.height = iHeight + "px";
    }
},

/*
Ugly workarround that saves the width the first time it is called and returns 
this value if no width is available with FF =< 1.5.

@return The width of the scrollbar in pixels.
*/
determineWidth : function(){
    if(this.eElement.offsetWidth > 0){
        this.iLastWidth = this.eElement.offsetWidth;
        return this.eElement.offsetWidth;
    }else{
        return this.iLastWidth;
    }
},

/*
Handles the slider mousedown event and initiates the "sliding" by saving the 
current position and attaching the mousup & mousemove event handlers.

@param  oEvent  Event object.
    
@private
*/
onSliderMouseDown : function(oEvent){
    if(this.bDisabled){
        return;
    }
    
    //  Update display
    this.eSlider.className = "slider_down";
    
    //  Save values
    this.iStartDragY = oEvent.getMouseY();
    this.iStartDragBefore = this.iSpaceBefore;
    
    //  Attach listeners
    vdf.events.addDomListener("mouseup", document, this.onSliderMouseUp, this);
    vdf.events.addDomListener("mousemove", document, this.onSliderMouseMove, this);
    
    oEvent.stop();
},

/*
Handles the mousemove event when sliding. It recalculates the slider position 
using the stored positions and the current positions of the mouse and the 
slider.

@param  oEvent  Event object.

@private
*/
onSliderMouseMove : function(oEvent){
    var iBefore, iAfter;

    if(this.bDisabled){
        return;
    }
        
    //  Calcuate positions
    iBefore = this.iStartDragBefore - (this.iStartDragY - oEvent.getMouseY());
    
    iBefore = (iBefore < 1 ? 1 : (iBefore > this.iSpaceTotal - 1 ? this.iSpaceTotal - 1 : iBefore));
    iAfter = this.iSpaceTotal - iBefore;
    
    //  Update display
    this.eSpaceBefore.style.height = iBefore + "px";
    this.eSpaceAfter.style.height = iAfter + "px";
    this.iSpaceBefore = iBefore;
    this.iSpaceAfter = iAfter;
    
    oEvent.stop();
},

/*
Handles the mouseup event when sliding. It stops the sliding by removing the 
listeners, calcuating the action and recalcating the positions.

@param  oEvent  Event object.

@private
*/
onSliderMouseUp : function(oEvent){
    var iDiff;

    //  Remove listeners
    vdf.events.removeDomListener("mouseup", document, this.onSliderMouseUp);
    vdf.events.removeDomListener("mousemove", document, this.onSliderMouseMove);
    
    if(!this.bDisabled){
        //  Update display
        this.eSlider.className = "slider";
    
        //  Calculate & perform the action
        iDiff = this.iSpaceBefore - this.iSpaceAfter;
        if(this.iDeadZone < iDiff || iDiff < -this.iDeadZone){
            if(iDiff < 0){
                this.notifyScrolled((this.iSpaceBefore < this.iDeadZone ? vdf.gui.SCROLL_TOP : vdf.gui.SCROLL_UP));
            }else{
                this.notifyScrolled((this.iSpaceAfter < this.iDeadZone ? vdf.gui.SCROLL_BOTTOM : vdf.gui.SCROLL_DOWN));
            }
        }
    }

    //  Reset the display
    this.recalcDisplay(false);
    
    oEvent.stop();
},

/*
Handles the mousedown of the up button. It initiates the automatic timed 
scrolling by setting a timer that fires the scroll action.

@param  oEvent  Event object.

@private
*/
onBtnUpStart : function(oEvent){
    var oScroll = this, fScrollUp;
    
    if(this.bDisabled){
        return;
    }

    this.eBtnUp.className = "btnup_down";
    
    fScrollUp = function(){
        oScroll.notifyScrolled(vdf.gui.SCROLL_STEP_UP);
        oScroll.tScrollTimeout = setTimeout(fScrollUp, oScroll.iAutoScrollWait);
    };
    
    this.notifyScrolled(vdf.gui.SCROLL_STEP_UP);
    this.tScrollTimeout = setTimeout(fScrollUp, this.iAutoScrollStart);
},

/*
Handles the mousup & mouseout event of the of the button up. It stops the timed
scrolling by clearing the timeout.

@param  oEvent  Event object.

@private
*/
onBtnUpStop : function(oEvent){
    if(!this.bDisabled){
        this.eBtnUp.className = "btnup";
    }
    
    if(this.tScrollTimeout !== null){
        clearTimeout(this.tScrollTimeout);
        this.tScrollTimeout = null;
    }
},

/*
Handles the mousedown of the down button. It initiates the automatic timed 
scrolling by setting a timer that fires the scroll action.

@param  oEvent  Event object.

@private
*/
onBtnDownStart : function(oEvent){
    var oScroll = this, fScrollUp;
    
    if(this.bDisabled){
        return;
    }

    this.eBtnDown.className = "btndown_down";
    
    fScrollUp = function(){
        oScroll.notifyScrolled(vdf.gui.SCROLL_STEP_DOWN);
        oScroll.tScrollTimeout = setTimeout(fScrollUp, oScroll.iAutoScrollWait);
    };
    
    this.notifyScrolled(vdf.gui.SCROLL_STEP_DOWN);
    this.tScrollTimeout = setTimeout(fScrollUp, this.iAutoScrollStart);

},

/*
Handles the mousup & mouseout event of the of the down button up. It stops the 
timed scrolling by clearing the timeout.

@param  oEvent  Event object.

@private
*/
onBtnDownStop : function(oEvent){
    if(!this.bDisabled){
        this.eBtnDown.className = "btndown";
    }
    
    if(this.tScrollTimeout !== null){
        clearTimeout(this.tScrollTimeout);
        this.tScrollTimeout = null;
    }
},

/*
Handles the click event of the up button. It fires one step up scroll event.

@param  oEvent  Event object.

@private
*/
onBtnUpClick : function(oEvent){
    if(!this.bDisabled){
        this.notifyScrolled(vdf.gui.SCROLL_STEP_UP);
        oEvent.stop();
    }
},

/*
Handles the click event of the down button and fires one step down scroll 
event.

@param  oEvent  Event object.

@private
*/
onBtnDownClick : function(oEvent){
    if(!this.bDisabled){
        this.notifyScrolled(vdf.gui.SCROLL_STEP_DOWN);
        oEvent.stop();
    }
},

/*
Handles the click event of the space below the slider and fires one scroll down
event.

@param  oEvent  Event object.
    
@private
*/
onSpaceAfterClick : function(oEvent){
    if(!this.bDisabled){
        this.notifyScrolled(vdf.gui.SCROLL_DOWN);
        oEvent.stop();
    }
},

/*
Handles the click event of the space above the slider and fires one scroll up
event.

@param  oEvent  Event object.
    
@private
*/
onSpaceBeforeClick : function(oEvent){
    if(!this.bDisabled){
        this.notifyScrolled(vdf.gui.SCROLL_UP);
        oEvent.stop();
    }
},

/*
Centers the slider.
*/
center : function(){
    this.iValue = 0;
    this.recalcDisplay(false);
},

/*
Positions the slider at the bottom.
*/
scrollBottom : function(){
    this.iValue = 1;
    this.recalcDisplay(false);
},

/*
Positions the slider at the top.
*/
scrollTop : function(){
    this.iValue = -1;
    this.recalcDisplay(false);
},

/*
Enables the scrollbar.
*/
enable : function(){
    if(this.bDisabled){
        this.bDisabled = false;
        
        this.eBtnUp.className = "btnup";
        this.eBtnDown.className = "btndown";
        this.eSpaceBefore.className = "before";
        this.eSpaceAfter.className = "after";
        this.eSlider.className = "slider";
    }
},

/*
Disables the scrollbar.
*/
disable : function(){
    if(!this.bDisabled){
        this.bDisabled = true;
        
        this.eBtnUp.className = "btnup_disabled";
        this.eBtnDown.className = "btndown_disabled";
        this.eSpaceBefore.className = "before_disabled";
        this.eSpaceAfter.className = "after_disabled";
        this.eSlider.className = "slider_disabled";
    }
},

/*
Fires the onScroll event with the given direction value.

@param  iValue  The scroll direction.
    
@private
*/
notifyScrolled : function(iValue){
    this.onScroll.fire(this, { iDirection : iValue });
}

});