/*
Name:
    vdf.gui.Balloon
Type:
    Prototype
Revisions:
    2009/01/22  Created the initial version (HW, DAE)
*/


//  @requireCSS Balloon.css

/*
Constructor that confirms with the required vdf.core.init system.

@param  eElement        Element used to line out the balloon and attach events on.
@param  oParentControl  Reference to an parent control.
*/
vdf.gui.Balloon = function(eElement, oParentControl){
    this.Control(eElement, oParentControl);
    
    /*
    The CSS class that is set to the generated balloon element.
    */
    this.sCssClass          = this.getVdfAttribute("sCssClass", "balloon", false);
    /*
    Optional, the horizontal position of the balloon.
    */
    this.iLeft              = this.getVdfAttribute("iLeft", 0, false);
    /*
    Optional, the vertical position of the balloon.
    */
    this.iRight             = this.getVdfAttribute("iRight", 0, false);
    /*
    Optional, the width of the balloon.
    */
    this.iWidth             = this.getVdfAttribute("iWidth", 0, false);
    /*
    The offset of the tute of the balloon in the upper left corner.
    */
    this.iTuteOffset        = this.getVdfAttribute("iTuteOffset", 12, false);
    /*
    The HTML content of the balloon.
    */
    this.sContent           = this.getVdfAttribute("sContent", "&nbsp;", false);
    
    /*
    This property determines how the balloon will align itself horizontally 
    relative to the this.eElement DOM element. The options are "left", "center" 
    and "right". If this property is set after initialization the 
    calculatePosition method should be called to apply it if the balloon is 
    currently displayed.
    */
    this.sAlignHoriz        = this.getVdfAttribute("sAlignHoriz", "center", false);
    /*
    This property determines the offset relatively to the right corner of the 
    this.eElement DOM element. Note that this property only is applied if 
    sAlignHoriz is set to "right". If this property is set after the 
    initialization the calculatePosition method should be called to apply its 
    new value if the balloon is currently displayed.
    */
    this.iOffsetRight       = this.getVdfAttribute("iOffsetRight", 12, false);
    /*
    This property determines the offset relatively to the left corner of the 
    this.eElement DOM element. Note that this property only is applied if 
    sAlignHoriz is set to "left". If this property is set after the 
    initialization the calculatePosition method should be called to apply 
    its new value if the balloon is currently displayed.
    */
    this.iOffsetLeft       = this.getVdfAttribute("iOffsetLeft", 12, false);
    /*
    If true the balloon is displayed after initalization.
    */
    this.bDisplay           = this.getVdfAttribute("bDisplay", true, false);
    /*
    If true the balloon will display if mouse pointer hovers over the element. 
    The iTimeout property defines how long the balloon should stay visible after 
    the mouse pointer leaves the element.
    */
    this.bAttachHover       = this.getVdfAttribute("bAttachHover", true, false);
    /*
    If true a click on the element will display the balloon.
    */
    this.bAttachClick       = this.getVdfAttribute("bAttachClick", true, false);
    /*
    The amount of miliseconds that the balloon stays displayed after the mouse 
    pointer leaves the element when using the hover.
    */
    this.iTimeout           = this.getVdfAttribute("iTimeout", 2500, false);
    
    // @privates
    this.tTimeout = null;
    this.eTable = null;
    this.eContent = null;
    this.bDisplayed = false;
    this.bClicked = false;
    
};
/*
The balloon is popup component that can be used to display extra information 
that the user can see when hovering or clicking an element. The balloon is also 
used to display errors inside the page. Generic idea behind the vdf.gui.Balloon 
component is that it is attached to the component that the user should click or 
hover to see the component. The message can contain HTML and can be set using 
the vdfContent property or the setContent method. The example below shows an 
example of this can be done where the vdfDisplay is set to false to make sure it 
doesn't popup right away after page load but initializes hidden.

@code
<img src="Images/PoweredByVisualDataFlex.gif" 
    vdfControlType="vdf.gui.Balloon" vdfName="vdfinfo_balloon"
    vdfContent="<b>Visual DataFlex</b><p>Build great windows and web applications!</p><a href='www.visualdataflex.com'>www.visualdataflex.com</a>" 
    vdfDisplay="false">
@code
*/
vdf.definePrototype("vdf.gui.Balloon", "vdf.core.Control", {

/*
Initializes the balloon by creating the elements (and optionally displaying it 
right away). Usually called by the initialization system.
*/
init : function(){
    this.createBalloon();
    this.recalcDisplay(false);
    
    if(this.bDisplay){
        this.display();
    }
},

/*
Displays the balloon.

@param  bNoTimeout (optional) If true the auto hide timeout is not set!
*/
display : function(bNoTimeout){
    this.recalcDisplay(false);
    this.bDisplayed = true;
    if(this.eTable){
        this.eTable.style.display = "";
    }
    
    if(!(bNoTimeout)){
        this.setTimeout();
    }
},

/*
Hides the balloon.
*/
hide : function(){
    this.clearTimeout();
    this.bDisplayed = false;
    if(this.eTable){
        this.eTable.style.display = "none";
    }
},

/*
Sets / updates the content of the balloon.

@param  sNewContent String with the HTML content.
*/
setContent : function(sNewContent){
    this.sContent = sNewContent;
    
    if(this.eContent){
        this.eContent.innerHTML = sNewContent;
    }
},

/*
Sets the timeout to hide the balloon.
*/
setTimeout : function(){
    var oBalloon = this;
    
    this.clearTimeout();

    this.tTimeout = setTimeout(function(){
        oBalloon.hide();
    }, this.iTimeout);
},

/*
Clears the timeout that might hide the balloon.
*/
clearTimeout : function(){
    if(this.tTimeout){
        clearTimeout(this.tTimeout);
        this.tTimeout = null;
    }
},

/*
Creates the balloon by creating and adding the elements to the DOM. The 
elements are inserted near to the reference element or directly on the body if 
no element is available.

@private
*/
createBalloon : function(){
    var eTable, eRow, eCell, eContent;

    eTable = document.createElement("table");
    eTable.className = this.sCssClass;
    eTable.cellPadding = 0;
    eTable.cellSpacing = 0;
    eTable.style.display = "none";
    
    if(this.eElement){
        vdf.sys.dom.insertAfter(eTable, this.eElement);
    }else{
        document.body.appendChild(eTable);
    }
    
    //  Header
    eRow = eTable.insertRow(0);
    eCell = eRow.insertCell(0);
    eCell.className = "topleft";
    
    eCell = eRow.insertCell(1);
    eCell.className = "topmid";
    
    eCell = eRow.insertCell(2);
    eCell.className = "topright";
    
    //  Middle
    eRow = eTable.insertRow(1);
    eCell = eRow.insertCell(0);
    eCell.className = "midleft";
    
    eContent = eRow.insertCell(1);
    eContent.className = "bln_content";
    if(this.iWidth){
        eContent.style.width = this.iWidth + "px";
    }
    eContent.innerHTML = this.sContent;
    
    eCell = eRow.insertCell(2);
    eCell.className = "midright";
    
    //  Bottom
    eRow = eTable.insertRow(2);
    eCell = eRow.insertCell(0);
    eCell.className = "bottomleft";
    
    eCell = eRow.insertCell(1);
    eCell.className = "bottommid";
    
    eCell = eRow.insertCell(2);
    eCell.className = "bottomright";
    
    this.eTable = eTable;
    this.eContent = eContent;
    
    if(this.eElement){
        if(this.bAttachClick){
            vdf.events.addDomListener("click", this.eElement, this.onClick, this);
        }
        if(this.bAttachHover){
            vdf.events.addDomListener("mouseover", this.eElement, this.onMouseOver, this);
            vdf.events.addDomListener("mouseout", this.eElement, this.onMouseOut, this);
            
        }
    }
},

/*
Handles the click event of the element. Displays / hides the balloon.

@param  oEvent  Event object.
@private
*/
onClick : function(oEvent){
    if(this.bDisplayed && (this.bClicked || !this.bAttachHover)){
        this.hide();
        this.bClicked = false;
    }else{
        this.display(true);
        this.clearTimeout();
        this.bClicked = true;
    }
},

/*
Handles the mouseover event of the element. It displays the balloon.

@param  oEvent  Event object.
@private
*/
onMouseOver : function(oEvent){
    if(!this.bDisplayed){
        this.display(true);
    }
    this.clearTimeout();
},

/*
Handles the mouseout event of the element. Sets the timeout to hide the 
balloon.

@param  oEvent  Event object.
@private
*/
onMouseOut : function(oEvent){
    if(!this.bClicked){
        this.setTimeout();
    }
},

/*
This method will cause the balloon to recalculate its position which can be 
useful if surrounding components are resized or if properties are changed.
*/
calculatePosition : function(){
    this.recalcDisplay(false);
},

/*
Called to recalculate the sizes & position. Usually fired by an element that has 
resized (for some reason). Can bubble up and down.

@param bDown    If true it bubbles up to parent components.
@private
*/
recalcDisplay : function(bDown){
    var oOffset, iLeft = this.iLeft || 0, iTop = this.iTop || 0;

    if(this.eElement){
        oOffset = vdf.sys.gui.getAbsoluteOffset(this.eElement);
        if(this.sAlignHoriz === "left"){
            iLeft += oOffset.left + this.iOffsetLeft;
        }else if(this.sAlignHoriz === "right"){
            iLeft += oOffset.left + parseInt(this.eElement.offsetWidth, 10) - this.iOffsetRight;
        }else{
            iLeft += oOffset.left + parseInt((this.eElement.offsetWidth / 2), 10);
        }
        iTop += oOffset.top + parseInt(this.eElement.offsetHeight, 10);
    }
    iLeft = iLeft - this.iTuteOffset;

    this.eTable.style.left = iLeft + "px";
    this.eTable.style.top = iTop + "px";
    
    if(!bDown && this.oParentControl !== null && typeof(this.oParentControl.recalcDisplay) === "function"){
        this.oParentControl.recalcDisplay(bDown);
    }
},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    this.clearTimeout();
    
    if(this.eElement){
        //  Do this manually since the element could very well be used otherwise
        vdf.events.removeDomListener("click", this.eElement, this.onClick);
        vdf.events.removeDomListener("mouseover", this.eElement, this.onMouseOver);
        vdf.events.removeDomListener("mouseout", this.eElement, this.onMouseOut);
    }
    if(this.eTable && this.eTable.parentNode){
        this.eTable.parentNode.removeChild(this.eTable);
    }
    this.eContent = null;
    this.eTable = null;
}
    
});