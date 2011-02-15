/*
Name:
    vdf.gui.DropDownMenu
Type:
    Prototype
Revisions:
    2009/05/04  Extended with isFirst, isLast, hasSub, noSub CSS class and 
        multi-level functionality. (HW, DAE)
    2008/02/05  Upgraded to 2.0 style and renamed to vdf.gui.DropDownMenu. 
        (HW, DAE)
    2006/11/02  Created the initial version.
*/

//  @requireCSS DropDownMenu.css

/*
Constructor of the DropDownMenu which contains the interface required by the 
initializer (see: vdf.core.init).

@param  eUL             The DOM element defining the menu.
@param  oParentControl  Reference to the parent control if the control is nested.
*/
vdf.gui.DropDownMenu = function DropDownMenu(eUL, oParentControl){
    this.Control(eUL, oParentControl);
    /*
    The CSS class set to the DOM element.
    */
    this.sCssClass      = this.getVdfAttribute("sCssClass", "DropDownMenu", false);
    
    //  @privates
    
    //  Set classname
    if(eUL.className.match(this.sCssClass) === null){
        eUL.className = this.sCssClass;
    }
    
    //  Reserve z-Index
    eUL.style.zIndex = vdf.gui.reserveZIndex();
};
/*
Engine for easilly generating drop down menu's.

@code
<ul vdfControlType="vdf.gui.DropDownMenu" class="DropDownMenu">
    <li><a href="Default.asp">Home</a></li>
    <li><a href="Login.asp">Login</a><li>
    <li><a href="">Data Entry</a>
        <ul>
            <li><a href="Customer.asp">Customers</a></li>
            <li><a href="CustomerPopup.asp">Customers (List)</a></li>
            <li><a href="SalesPerson.asp">Sales People</a>
                <ul>
                    <li><a href="Sub.asp">Submenu 1</a></li>
                    <li><a href="Sub.asp">Submenu 2</a></li>
                    <li><a href="Sub.asp">Submenu 3</a></li>
                </ul>
            </li>
            <li><a href="Order.asp">Order</a></li>
            <li><a href="Vendor.asp">Vendors</a></li>
            <li><a href="Invt.asp">Inventory Items</a></li>
        </ul>
    </li>
    <li><a href="">Reporting</a>
        <ul>
            <li><a href="CustomerReport.asp">Customer list</a></li>
            <li><a href="OrderReport.asp">Order list</a></li>
        </ul>
    </li>
</ul>
@code
*/
vdf.definePrototype("vdf.gui.DropDownMenu", "vdf.core.Control", {

/*
Walks through the elements of the tree searching for sub menu's and menu items. 
It remembers if an menu item has a sub menu and if it is the first / last menu 
item. It calls initMenuItem for each item.

@param  eElement    The current element.
@param  bFirst      True if the current element was the first.
@param  bLast       Fals if the current element was the last.
@private
*/
walkTree : function(eElement, bFirst, bLast){
    var bSub = false, iChild, aChildren = [];
    
    //  Scan child elements
    vdf.sys.dom.loopChildren(eElement, function(eChild){
        aChildren.push(eChild);
    }, this);
    
    for(iChild = 0; iChild < aChildren.length; iChild++){
        bSub = this.walkTree(aChildren[iChild], iChild === 0, iChild === (aChildren.length - 1)) || bSub;
    }
    
    
    if(eElement.nodeName == "UL"){
        bSub = true;
    }
    
    if(eElement.nodeName == "LI"){
        this.initMenuItem(eElement, bSub, bFirst, bLast);
    }
    
    return bSub;
},

/*
Initializes a menu item by attaching the nessecary styles and for IE 6 it adds 
the listeners that manually add / remove the hover styles.

@param  eElement    LI element representing a menu item.
@param  bSub        True if the menu item has sub menu's.
@param  bFirst      True if the menu item is the first in its menu.
@param  bLast       True if the menu item is the last in its menu.
@private
*/
initMenuItem : function(eElement, bSub, bFirst, bLast){
    if(bSub){
        if(eElement.className.indexOf("hasSub") < 0){
            eElement.className = eElement.className + " hasSub";
        }
    }else{
        if(eElement.className.indexOf("noSub") < 0){
            eElement.className = eElement.className + " noSub";
        }
    }
    
    if(bFirst && eElement.className.indexOf("isFirst") < 0){
        eElement.className = eElement.className + " isFirst";
    }
    
    if(bLast && eElement.className.indexOf("isLast") < 0){
        eElement.className = eElement.className + " isLast";
    }

    
    if (vdf.sys.isIE && vdf.sys.iVersion <= 6) {
        //  Attach onmouseover & onmouseout events
        if (eElement.nodeName == "LI") {
            vdf.events.addDomListener("mouseover", eElement, this.onMenuMouseOver, this);
            vdf.events.addDomListener("mouseout", eElement, this.onMenuMouseOut, this);
        }
    }
},

/*
Handles the mouseover for IE 6 and manually sets the hover class and hides 
the select boxes under the submenu's.

@param  oEvent  Event object.
@private
*/
onMenuMouseOver : function(oEvent){
    var iChild, eLI = oEvent.eSource;
    
    //  Check if the previously hovered element isn't inside the element of 
    //  which we catched the element (if this is the case the event has bubbled 
    //  and the hover is already set)
    
    //  Note that contains and fromElement are IE only functions / properties
    if(!eLI.contains(oEvent.e.fromElement)){
        eLI.className = eLI.className + " hover";
        
        //  Hide the select boxes for child menu's
        for(iChild = 0; iChild < eLI.childNodes.length; iChild++){
            if(eLI.childNodes[iChild].tagName === "UL"){
                vdf.sys.gui.hideSelectBoxes(eLI.childNodes[iChild]);
            }
        }
        
    }
},

/*
Handles the mouseout for IE 6 and manually removes the hover class and displays 
the select boxes again.

@param  oEvent  Event object.
@private
*/
onMenuMouseOut : function(oEvent){
    var iChild, eLI = oEvent.eSource;
    
    //  Check if the newly hovered element isn't inside this element which would 
    //  mean that the class doesn't need to change.
    
    //  Note that contains and fromElement are IE only functions / properties
    if(!eLI.contains(oEvent.e.toElement)){
        //  Display the select boxes again
        for(iChild = 0; iChild < eLI.childNodes.length; iChild++){
            if(eLI.childNodes[iChild].tagName === "UL"){
                vdf.sys.gui.displaySelectBoxes(eLI.childNodes[iChild]);
            }
        }
        
        eLI.className = eLI.className.replace(" hover", "");
    }
},


/*
Initializes the menu.
*/
init : function(){
    this.walkTree(this.eElement);
},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    if(this.eElement && vdf.sys.isIE && vdf.sys.iVersion <= 6){
        vdf.events.clearDomListeners(this.eElement, true);
    }
}

});