/*
Name:
    vdf.gui.TabContainer
Type:
    Prototype
Revisions:
    2006/07/11  Created (HW, DAE)
    2008/09/19  Upgraded to the 2.0 structure and rewrote with keyboard & 
    multiple tabs per page support. (HW, DAE)
*/

//  Include style sheet
//  @requireCSS TabContainer.css

/*
Constructor with the initializer interface.

@param  eElement        Reference to the table dom element.
@param  oParentControl  (Optional) Parent object.
*/
vdf.gui.TabContainer = function TabContainer(eElement, oParentControl){
    this.Control(eElement, oParentControl);
    
    /*
    The CSS class set to the DOM element.
    */
    this.sCssClass          = this.getVdfAttribute("sCssClass", "tabcontainer", false);
    /*
    If true the engine tries to hide the focus on the tab buttons if they 
    contain an anchor element.
    */
    this.bHideTabFocus      = this.getVdfAttribute("bHideTabFocus", true, false);
    /*
    If true the engine will automatically switch to the next tab if the user 
    tabs out of the last element in the tab.
    */
    this.bAutoNextTab       = this.getVdfAttribute("bAutoNextTab", true, false);
    /*
    If true the width of the tab container is determined by the content.
    */
    this.bDetermineWidth    = this.getVdfAttribute("bDetermineWidth", false, false);
    /*
    If true the height of the tab container is determined by the content.
    */
    this.bDetermineHeight   = this.getVdfAttribute("bDetermineHeight", true, false);
    
    /*
    Fired before the current tab is switched. If the event is stopped the tab 
    change is canceled.
    
    @prop   oCurrentTab     Internal object representing a tab.
    @prop   oNewTab         Internal object representing a tab.
    */
    this.onBeforeChange     = new vdf.events.JSHandler();    
    /*
    Fired after the current tab is switched.
    
    @prop   oNewTab         Internal object representing a tab.
    */
    this.onAfterChange      = new vdf.events.JSHandler();    
    
    //  @privates
    this.aTabs              = [];
    this.oDisplayedTab      = null;
    this.bIsTabContainer    = true;
    this.aChildren          = [];
    
    this.oFirst             = null;
    this.eHeader = null;
    this.eContainer = null;
    this.eContainerDiv = null;
    
    this.iInitWaitForChildren = 0;
    this.iHeight = 0;
    this.iWidth = 0;
    
    //  Set classname
    vdf.sys.gui.addClass(this.eElement, this.sCssClass);};
/*
Tabcontainer engine that generates a tab container from the folowing HTML:
@code
<table cellpadding="0" cellspacing="0" vdfControlType="tabcontainer">
    <tr>
        <td vdfElement="tabHeader">
            <div>
                <ul>
                    <li vdfTabName="address"><a href="javascript: vdf.sys.nothing();">...</a></li>
                    <li vdfTabName="balances"><a href="javascript: vdf.sys.nothing();">...</a></li>
                    <li vdfTabName="comments"><a href="javascript: vdf.sys.nothing();">....</a></li>
                </ul>
            </div>
        </td>
    </tr>
    <tr>
        <td vdfElement="container">
            <div vdfTabName="address">
                ...
            </div>
            <div vdfTabName="balances">
                ...
            </div>
            <div vdfTabName="comments">
                ...
            </div>
        </td>
    </tr>
</table>
@code
*/
vdf.definePrototype("vdf.gui.TabContainer", "vdf.core.Control", {

/*
Initializes the tab engine by searching the required elements, adding event 
listeners and initializing the display. Usually called by the initializer.
*/
init : function(){

    this.scan(this.eElement);
    
    this.initialize();
    
    this.iInitWaitForChildren = this.waitForCalcDisplay();
    
    if(this.iInitWaitForChildren <= 0){
        this.iInitWaitForChildren = 1;
        this.recalcDisplay(false);
    }
},

/*
Scans the DOM from the given element searching for the header and the container
element.

@param  eElement    Reference to the DOM element to scan.
    
@private
*/
scan : function(eElement){
    var sElement = vdf.getDOMAttribute(eElement, "sElement", null);
    
    if(sElement !== null){ 
        sElement = sElement.toLowerCase();
    }
    
    switch(sElement){
        case "header":
            this.eHeader = eElement;
            this.eHeader.className = "tabHeader";
            this.scanTabs(eElement, true);
            break;
        case "container":
            this.eContainer = eElement;
            this.eContainer.className = "container";
            this.scanTabs(eElement, false);
            break;
        default:
            vdf.sys.dom.loopChildren(eElement, function(eChild){
                 this.scan(eChild);
            }, this);
    }
},

/*
Searches the given element for tab pages and stores the required references in 
the admninistration.

@param  eElement    Reference to the scanned DOM element.
    bHeader     If true we are searching the header.
    
@private
*/
scanTabs : function(eElement, bHeader){
    var oTab, sTabName;

    sTabName = vdf.getDOMAttribute(eElement, "sTabName", null);
    
    if(sTabName !== null){
        sTabName = sTabName.toLowerCase();
        oTab = this.getTab(sTabName);
        
        if(oTab === null){
            oTab = { "sTabName" : sTabName, eButton : null, eContainer : null, eNextAnchor : null, iLastHeight : 0, iLastWidth : 0 };
            this.aTabs.push(oTab);
        }
        
        if(bHeader){
            oTab.eButton = eElement;
        }else{
            oTab.eContainer = eElement;
            if(oTab.eContainer.className.indexOf("tabcontent") < 0){
                oTab.eContainer.className += " tabcontent";
            }
        }
        
    }else{
        vdf.sys.dom.loopChildren(eElement, function(eChild){
            this.scanTabs(eChild, bHeader);
        }, this);
    }
},

/*
Initializes the engine by attaching listeners, throwing errors and hiding and 
displaying the tabs to the initial position.

@private
*/
initialize : function(){
    var iTab, oTab, aAnchors, iAnchor, eAnchor;
    
    
    for(iTab = 0; iTab < this.aTabs.length; iTab++){
        oTab = this.aTabs[iTab];
        
        //  Check if complete
        if(oTab.eButton === null && typeof(oTab.eButton) !== "undefined"){
            throw new vdf.errors.Error(5141, "Tab without button", this, [ oTab.sTabName ]);
        }
        if(oTab.eContainer === null  & typeof(oTab.eContainer) !== "undefined"){
            throw new vdf.errors.Error(5142, "Button without tab", this, [ oTab.sTabName ]);
        }
        
        //  Add listener
        vdf.events.addDomListener("click", oTab.eButton, this.onButtonClick, this);
        
        //  Add anchor if needed
        if(this.bAutoNextTab && iTab !== this.aTabs.length - 1){
            eAnchor = document.createElement("a");
            oTab.eContainer.appendChild(eAnchor);
            eAnchor.href = "javascript: vdf.sys.nothing();";
            eAnchor.hideFocus = true;
            vdf.events.addDomListener("focus", eAnchor, this.onNextTabFocus, this);
            oTab.eNextAnchor = eAnchor;
            eAnchor.innerHTML = "&nbsp;";
            eAnchor.style.position = "absolute";
            eAnchor.style.left = "-2000px";
            eAnchor.style.top = "-2000px";
        }
        
        //  If first of attribute bFirst set display this tab after initialization
        if(this.oFirst === null || vdf.getDOMAttribute(oTab.eButton, "bFirst", false)){
            this.oFirst = oTab;
        }
    }
    
    
    
    //  Tries to hide the focus for the tab (the dotted line arround the anchor)
    if(this.bHideTabFocus){
        aAnchors = this.eHeader.getElementsByTagName("a");
        for(iAnchor = 0; iAnchor < aAnchors.length; iAnchor++){
            aAnchors[iAnchor].hideFocus = true;
        }
    }
    
},

/*
Displays the tab with the given name.

@param  sName   Name of the tab to display.
@param  bFocus  (optional) If true the first focusable element receives the focus.
@return True if succesfull (tab does exist)
*/
displayTab : function(sName, bFocus){
    var oTab = this.getTab(sName.toLowerCase());
    
    if(oTab !== null){
        this.display(oTab, (bFocus));
        
        this.recalcDisplay(true);
        
        return true;
    }
    
    return false;
},

/*
Displays the tab that contains the given element. 

@param  eElement    Reference to a DOM element inside the tab container or header.
@param  bFocus      (optional) If true the first focusable element receives the focus.
@return True if succesfull (the element was in a tab which is displayed).
*/
displayTabWithElement : function(eElement, bFocus){
    var sTabName = null;
        
    while(sTabName === null && eElement !== null && eElement !== document){
        sTabName = vdf.getDOMAttribute(eElement, "sTabName", null);
        eElement = eElement.parentNode;
    }

    if(sTabName !== null){
        return this.displayTab(sTabName, (bFocus));
    }
    
    return false;
},

/*
Displays the given tab and fires the onChange event (if changed).

@param  oTab    Tab object { sTabName : .., eButton : .., eContainer : .. }
@param  bFocus  (optional) If true the first focusable element receives the focus.

@private
*/
display : function(oTab, bFocus){
    var iTab, eElement;
    
    if(oTab === this.oDisplayTab || this.onBeforeChange.fire(this, { oCurrentTab : this.oSelectedTab, oNewTab : oTab })){
    
        for(iTab = 0; iTab < this.aTabs.length; iTab++){
            if(this.aTabs[iTab] !== oTab){
                this.aTabs[iTab].eButton.className = "inactive";
                this.aTabs[iTab].eContainer.style.display = "none";
                //this.aTabs[iTab].eContainer.style.visibility = "hidden";
            }
        }
        
        oTab.eButton.className = "active";
        oTab.eContainer.style.display = "";
        //oTab.eContainer.style.visibility = "";
        
        if(bFocus){
            eElement = vdf.sys.dom.getFirstFocusChild(oTab.eContainer);
            if(eElement !== null && eElement !== oTab.eNextAnchor){
                vdf.sys.dom.focus(eElement, true);
            }
        }
        
        if(this.oDisplayedTab !== oTab){
            this.oDisplayedTab = oTab;
            
            this.onAfterChange.fire(this, { oNewTab : oTab });
        }
    }
},

/*
Searched the administration for a tab with the given name.

@return Tab with the given name (null if not found).
    
@private
*/
getTab : function(sName){
    var iTab;
    
    sName = sName.toLowerCase();
    
    for(iTab = 0; iTab < this.aTabs.length; iTab++){
        if(this.aTabs[iTab].sTabName === sName){
            return this.aTabs[iTab];
        }
    }
    
    return null;
},

/*
Determines the name of the currently selected tab.

@return The name of the currently selected tab.
*/
getCurrentTabName : function(){
    return (this.oDisplayedTab !== null ? this.oDisplayedTab.sTabName : null);
},

/*
Handles the header tab button click and displays the clicked tab.

@param  oEvent  vdf.events.DOMEvent object.

@private
*/
onButtonClick : function(oEvent){
    this.displayTabWithElement(oEvent.getTarget(), true);
},

/*
Handles the focus event of the eNextAnchor which is inserted at the bottom of 
the tab container. It calls the display method for the next tab page.

@param  oEvent  Event object.

@private
*/
onNextTabFocus : function(oEvent){
    var iTab, eSource = oEvent.getTarget();

    for(iTab = 0; iTab < this.aTabs.length; iTab++){
        if(this.aTabs[iTab].eNextAnchor === eSource && iTab + 1 < this.aTabs.length ){
            this.display(this.aTabs[iTab + 1], true);
            oEvent.stop();
        }
    }
},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    var iTab, oTab;
    
    if(this.eElement){
        //  Go through all tavs and remove the hidden next anchor's and clear the listeners
        for(iTab = 0; iTab < this.aTabs.length; iTab++){
            oTab = this.aTabs[iTab];
            vdf.events.clearDomListeners(oTab.eButton);
            
            if(oTab.eNextAnchor){
                vdf.events.clearDomListeners(oTab.eNextAnchor);
                oTab.eNextAnchor.parentNode.removeChild(oTab.eNextAnchor);
            }
            oTab.eNextAnchor = null;
            oTab.eButton = null;
        }
    
        vdf.events.clearDomListeners(this.eElement, true);
    }
    
    this.aTabs  = [];
    this.eHeader = null;
    this.eContainer = null;
    this.eContainerDiv = null;
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
},

/*
Called to recalculate the sizes & position. Usually fired by an element that has 
resized (for some reason). Can bubble up and down. Resizes the tab component 
according to its content (if the children have calculated their sizes.

@param bDown    If true it bubbles up to parent components.
@private
*/
recalcDisplay : function(bDown){
    var iTab, iMaxHeight = this.iHeight, iMaxWidth = this.iWidth, oCurrent, iWidth, iHeight, iChild;
    //  Call initialize method if it was waiting for children
    this.iInitWaitForChildren--;

    
    if(this.iInitWaitForChildren <= 0){
        
        //  Loop through the tabs determining their width and height.
        for(iTab = 0; iTab < this.aTabs.length; iTab++){
            oCurrent = vdf.sys.gui.getCurrentStyle(this.aTabs[iTab].eContainer);
            
            //  Measure size (use size from previous measurement if zero (which happens if elements are invisible)
            iHeight = this.aTabs[iTab].eContainer.offsetHeight;
            this.aTabs[iTab].iLastHeight = iHeight = (iHeight > 0 ? iHeight : this.aTabs[iTab].iLastHeight);
            
            iWidth = this.aTabs[iTab].eContainer.offsetWidth;
            this.aTabs[iTab].iLastWidth = iWidth = (iWidth > 0 ? iWidth : this.aTabs[iTab].iLastWidth);
            
            //  Remember the highest
            if(iHeight > iMaxHeight){
                iMaxHeight = iHeight;
            }
            if(iWidth > iMaxWidth){
                iMaxWidth = iWidth;
            } 
        }
    
    
        //  Set the calculated sizes to the container
        if(this.bDetermineHeight){
            this.eContainer.style.height = iMaxHeight + "px";
        }
        if(this.bDetermineWidth){
            this.eContainer.style.width = iMaxWidth + "px";
        }
        
        //  If this is the first time (that we are not waiting for children) we display the first tab
        if(this.iInitWaitForChildren === 0){
            //  Display the first tab
            this.display(this.oFirst, false);
        }
    }
    
    //  Bubble up or down
    if(bDown){
        for(iChild = 0; iChild < this.aChildren.length; iChild++){
            if(typeof this.aChildren[iChild].recalcDisplay === "function"){
                this.aChildren[iChild].recalcDisplay(bDown);
            }
        }
        this.recalcDisplay(false);
    }else{
        if(this.oParentControl !== null && typeof(this.oParentControl.recalcDisplay) === "function"){
            this.oParentControl.recalcDisplay(bDown);
        }
    }
},

/*
(Recursive) Called to determine if parent elements need to wait with messing 
with the DOM (especially hiding stuff) because the children are still 
initializing and need to do some pixel calculation.

@return Amount of children that need waiting.
*/
waitForCalcDisplay : function(){
    var iChild, iWait = 0;
    
    for(iChild = 0; iChild < this.aChildren.length; iChild++){
        if(typeof(this.aChildren[iChild].waitForCalcDisplay) === "function"){
            iWait =  iWait + this.aChildren[iChild].waitForCalcDisplay();
        }
    }
    
    return iWait;
}

});

/*
Makes sure the element is displayed by displaying eventuall tabs where it is 
on. It does this by looping up in the DOM and calling all the TabContainer 
controls it runs into.

@param  eElement    The element that needs to be visible.
*/
vdf.gui.displayTabsWithElement = function(eElement){
    var sTabName = null;


    while(eElement !== null && eElement !== document){
        if(sTabName === null){
            sTabName = vdf.getDOMAttribute(eElement, "sTabName", null);
        }
        if(sTabName !== null){
            if(typeof(eElement.oVdfControl) === "object" && eElement.oVdfControl.bIsTabContainer){
                eElement.oVdfControl.displayTab(sTabName);
                sTabName = null;
            }
        }
        eElement = eElement.parentNode;
    }
};