/*
Name:
    vdf.gui.TreeView
Type:
    Prototype

Revisions:
    2009/10/07  Created the initial version. (HW, DAE)
*/




/*
Constructor of the TreeView component which applies to the API for automatic 
initialization (See: vdf.core.init).

@param  eElement        The DOM element defining the menu.
@param  oParentControl  Reference to the parent control if the control is nested.
*/
vdf.gui.TreeView = function TreeView(eElement, oParentControl){
    var sKey;
    
    this.Control(eElement, oParentControl);
    
    /*
    The CSS class set to the DOM element.
    */
    this.sCssClass          = this.getVdfAttribute("sCssClass", "treeview", false);
    /*
    If true the list we be able to have the focus.
    */
    this.bHoldFocus         = this.getVdfAttribute("bHoldFocus", true, true);
    /*
    If true the list will take the focus after initialization.
    */
    this.bFocus             = this.getVdfAttribute("bFocus", false, true);
    /*
    If true the 
    */
    this.bDisplayIcons = this.getVdfAttribute("bDisplayIcons", true, false);
    /*
    Name of the initializer method. Might be encapsulated inside an global 
    object (like myObj.mySub.myFunct). This method is called during the 
    initialization of the tree before the tree is going to generate its DOM 
    elements.
    
@code
<script type="text/javascript">
    function buildTree(oTree){
        ...
    }
</script>

<div vdfControlType="vdf.gui.TreeView" vdfControlName="my_tree" vdfInitializer="buildTree">
    ...
</form>
@code
    */
    this.sInitializer           = this.getVdfAttribute("sInitializer", null);
    /*
    Object containing the action key settings which are copied during 
    initialization from the vdf.settings.treeKeys object. Available keys are: 
    moveUp, moveDown, collapse, extend, moveFirst, moveLast, enter.
    
    Settings the keys for a single instance can be done after initialization:
    @code
    function myInitForm(oForm){
        var oTree = oForm.getControl("my_tree");
        
        //  Switching the up and down arrow keys
        oTree.oActionKeys.moveUp.iKeyCode = 40;
        oTree.oActionKeys.moveDown.iKeyCode = 38;
        
        //  Completely reset the moveLast to alt - end
        oTree.oActionKeys.moveLast = {
            iKeyCode : 35,
            bAlt : true,
            bCtrl : false,
            bShift : false
        }
    }
    @code
    
    Setting the keys for all instances on a page can be done before initialization:
    @code
    //  Disabling the moveLast and moveFirst keys
    vdf.settings.treeKeys.moveLast.iKeyCode = -1;
    vdf.settings.treeKeys.moveFirst.iKeyCode = -1;
    @code
    */
    this.oActionKeys        = {};
    
    /*
    This event is fired if the user selects one a node of the tree (using the 
    mouse or the keyboard). Note that the event is fired before the selected 
    node is actually changed. By stopping or cancelling the event the select 
    action will be cancelled. 

    @prop   sNodeId         The unique ID of the node.
    @prop   sParentNodeId   The unique ID of the parent node ("" if the selected 
                node is on the root level).
    @prop   sNodeValue      The value of the node.
    @prop   tNode           Node struct object (see: vdf.dataStructs.TAjaxTreeNode).
    */
    this.onSelect = new vdf.events.JSHandler();
    /*
    Fired if the user presses enter or double clicks an item.
    */
    this.onEnter            = new vdf.events.JSHandler();
    
    
    
    
    //  @privates
    this.eRootTable = null;
    this.aRootItems = [];
	this.aItems = [];
    this.tSelectedNode = null;
    this.eFocus = null;
    this.bFocussed = false;
    this.bLozingFocus = false;
    
    //  Copy settings
    for(sKey in vdf.settings.treeKeys){
        if(typeof(vdf.settings.treeKeys[sKey]) == "object"){
            this.oActionKeys[sKey] = vdf.settings.treeKeys[sKey];
        }
    }
    
    //  Set classname
    vdf.sys.gui.addClass(this.eElement, this.sCssClass);
};
/*
The AJAX Library treeview component is a rich tree that can be controlled using 
the mouse and the keyboard. It can be created declarative using the HTML API 
where the nodes are defined using <ul> and <li> elements inside the tree div. It 
can also be manipulated from the complete JavaScript API available. This means 
elements can be added and removed at dynamically at runtime.

The following example shows a basic tree with items declared in HTML. Note that 
the properties of the vdf.dataStructs.TAjaxTreeNode can be set on the <li 
elements.
@code
<div vdfControlType="vdf.gui.TreeView" vdfControlName="my_tree" vdfDisplayIcons="true">
    <ul>
        <li vdfIcon="file" vdfAltText="Main package">Invt.wo
            <ul>
                <li>dfClient.pkg</li>
                <li>Includes.pkg</li>
                <li>DataDict.pkg</li>
                <li vdfAltText="Package dfEntry.pkg">dfEntry.pkg</li>
                <li>Vendor.DD</li>
                <li>Invt.DD</li>
                <li>Windows.pkg</li>
                <li vdfExpanded="true">oInventoryView
                    <ul>
                        <li>Vendor_DD</li>
                        <li>Invt_DD</li>
                        <li vdfIcon="object">oDbCont
                            <ul>
                                <li>oInvt_Item_ID</li>
                                <li>oInvt_Description</li>
                                <li>oVendorGroup
                                    <ul>
                                        <li>oInvt_Vendor_ID</li>
                                        <li>oVendor_Name</li>
                                        <li>oInvt_Vendor_Part_ID</li>
                                    </ul>
                                </li>
                                <li>oUnitGroup</li>
                                <li>oForm1</li>
                                <li>oForm2</li>
                        </li>
                    </ul>
                </li>
            </ul>
        </li>
    </ul>
</div>
@code

The following example shows how the same tree being filled from JavaScript 
(in the vdfInitializer method of the tree):
@code
function myBuildTree(oTree){
    oTree.addNode("1", "", "dfClient.pkg");
    oTree.addNode("2", "", "DataDict.pkg");
    oTree.addNode("3", "", "dfEntry.pkg", "Package dfEntry.pkg");
    oTree.addNode("4", "", "Vendor.DD");
    oTree.addNode("5", "", "Invt.DD");
    oTree.addNode("6", "", "Windows.pkg");
    oTree.addNode("7", "", "oInventoryView", null, null, true);
        oTree.addNode("8", "7", "Vendor_DD");
        oTree.addNode("9", "7", "Invt_DD");
        oTree.addNode("10", "7", "oDbCont", null, "object");
            oTree.addNode("11", "10", "oInvt_Item_ID");
            oTree.addNode("12", "10", "oInvt_Description");
            oTree.addNode("13", "10", "oVendorGroup");
                oTree.addNode("14", "13", "oInvt_Vendor_ID");
                oTree.addNode("15", "13", "oVendor_Name");
                oTree.addNode("16", "13", "oInvt_Vendor_Part_ID");
            oTree.addNode("17", "10", "oUnitGroup");
            oTree.addNode("18", "10", "oForm1");
            oTree.addNode("19", "10", "oForm2");
    oTree.refresh();
}

...

<div vdfControlType="vdf.gui.TreeView" vdfControlName="my_tree"></div>
@code
*/
vdf.definePrototype("vdf.gui.TreeView", "vdf.core.Control", {

/*
Initializes the tree. First it scans for node definitions in the HTML (using the 
<ul & <li elements). Then it refreshes the tree and creates global elements and 
event listeners.
*/
init : function(){
    var eFocus;

    this.scanHTMLTree(this.eElement, "");
    
    this.eElement.innerHTML = "";
    
    this.callInitializers();
        
    //  Insert & initialize focus holder (A Element) (if needed)
    if(this.bHoldFocus){
        eFocus = document.createElement("a");
        this.eFocus = eFocus;
        eFocus.href = "javascript: vdf.sys.nothing();";
        eFocus.style.textDecoration = "none";
        eFocus.hideFocus = true;
        eFocus.innerHTML = "&nbsp;";
        eFocus.style.position = "absolute";
        eFocus.style.left = "-3000px";
        
        vdf.events.addDomKeyListener(eFocus, this.onKey, this);
        vdf.events.addDomListener("focus", eFocus, this.onFocus, this);
        vdf.events.addDomListener("blur", eFocus, this.onBlur, this);
        this.eElement.parentNode.insertBefore(eFocus, this.eElement);
        
        vdf.events.addDomListener("click", this.eElement, this.onGlobalClick, this);
        
        if(this.bFocus){
            vdf.sys.dom.focus(eFocus);
        }
    }
    
    if(this.aItems.length > 0 && !this.eRootTable){
        this.refresh();
    }
},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    if(this.eElement){
        vdf.events.clearDomListeners(this.eElement);
    }
    this.eRootTable = null;
    this.tSelectedNode = null;
    this.eFocus = null;
},

/*
Calls the initializer if one is set (throws an error if not found).

@private
*/
callInitializers : function(){
    var fInitializer  = null;
    
    if(typeof this.sInitializer === "string"){
        fInitializer = vdf.sys.ref.getNestedObjProperty(this.sInitializer);
        
        //  Call the function
        if(typeof fInitializer === "function"){
            fInitializer(this);
        }else{
            throw new vdf.errors.Error(5134, "Init method not found '{{0}}'", this, [ this.sInitializer ]);
        }
    }
},

/*
Adds a new item (node) to the tree. This doesn't refresh the tree currently 
displayed but that needs to be done manually by calling the refresh method. 

@code
oTree.addNode("7", "", "Parent", "The parent node", "object", false);
oTree.addNode("8", "7", "Child", "Child node of parent", "object", true);
@code

@param  sId         Unique ID.
@param  sParentId   ID of the parent ("" if the node is a root element)
@param  sName       Name displayed in the tree.
@param  sAltText    (optional) Text displayed in the tooltip if the mouse hovers 
            the node.
@param  sIconClass  (optional) CSS class that defines the icon image.
@param  bExpanded   (optional) If the the node will be expanded.
@param  sValue      (optional) Extra element for external usage.
@param  fSelectHandler   (optional) Event handler method if the item is selected.
@param  oSelectEnv  (optional) Environent object for the select handler.
*/
addNode : function(sId, sParentId, sName, sAltText, sIconClass, bExpanded, sValue, fSelectHandler, oSelectEnv){
    var tNode = new vdf.dataStructs.TAjaxTreeNode();
    
    tNode.sId = sId;
    tNode.sValue = sValue || "";
    tNode.sParentId = sParentId;
    tNode.sName = sName;
    tNode.sAltText = sAltText || "";
    tNode.sIconClass = sIconClass || null;
    tNode.bExpanded = bExpanded || null;
    
    tNode.__fSelectHandler = fSelectHandler || null;
    tNode.__oSelectEnv = oSelectEnv || null;
    
    this.insertNode(tNode);
},

/*
The node with the ID will be removed from the tree together with all its sub 
nodes. The display is updated. 

@param  sId     The unique ID of the node.
*/
removeNodeById : function(sId){
    var tNode = this.getNodeById(sId);
    
    if(tNode){
        this.removeNode(tNode);
    }
},

/*
The node will be removed from the tree together with all its sub nodes. The 
display is updated. 

@param  tNode   Node structure that is known by the tree and needs to be removed 
    (see: vdf.dataStructs.TAjaxTreeNode).
*/
removeNode : function(tNode){
    var eTable, aList, fRemove, iNode;

    fRemove = function(tNode, bSub){
        var iSub;
        //  Move into subnodes
        for(iSub = 0; iSub < tNode.__aSubItems.length; iSub++){
            fRemove.call(this, tNode.__aSubItems[iSub], true);
        }
        
        //  Remove DOM <-> JS references
        if(tNode.__eElement){
            vdf.events.clearDomListeners(tNode.__eElement, true);
            tNode.__eElement.tNode = null;
        }
        tNode.__eElement = null;
        tNode.__eSubMenuRow = null;
        tNode.__eSubMenuTable = null;
        
        if(tNode === this.tSelectedNode){
            this.tSelectedNode = null;
        }
        
        //  Remove from global list
        vdf.sys.data.removeFromArray(this.aItems, tNode);
    };
    
    //  Remove from DOM
    if(tNode.__eElement){
        vdf.events.clearDomListeners(tNode.__eElement, true);
        
        eTable = (tNode.__tParent ? tNode.__tParent.__eSubMenuTable : this.eRootTable);
        
        if(tNode.__eSubMenuRow){
            eTable.deleteRow(tNode.__eSubMenuRow.rowIndex);
        }
        eTable.deleteRow(tNode.__eElement.rowIndex);
    }
    
    fRemove.call(this, tNode, false);
    
    aList = (tNode.__tParent ? tNode.__tParent.__aSubItems : this.aRootItems);
    if(aList){
        //  Remove from structure
        vdf.sys.data.removeFromArray(aList, tNode);
        
        //  Update other nodes on this level
        for(iNode = 0; iNode < aList.length; iNode++){
            this.updateNodeCSS(aList[iNode]);
        }
    }
    
    //  Reselect a node if needed
    if(this.aItems.length > 0){
        this.select((aList && aList.length > 0 && aList[0].__tParent) || this.aItems[0]);
    }
},

/*
All the nodes will be removed from the tree. The display is updated.
*/
clear : function(){
    var iItem;

    if(this.eRootTable){
        vdf.events.clearDomListeners(this.eRootTable, true);
        this.eElement.removeChild(this.eRootTable);
        
        for(iItem = 0; iItem < this.aItems.length; iItem++){
            if(this.aItems[iItem].__eElement){
                this.aItems[iItem].__eElement.tNode = null;
            }
            this.aItems[iItem].__eElement = null;
            this.aItems[iItem].__eSubMenuRow = null;
            this.aItems[iItem].__eSubMenuTable = null;
        }
    }
    
    this.tSelectedNode = null;
    this.aItems = [];
    this.aRootItems = [];
    this.eRootTable = this.constructTable();
    this.eRootTable.className = (this.bHasFocus ? "treeFocussed" : "");
    
    this.eElement.appendChild(this.eRootTable);
},

/*
The node will be inserted into the tree based on its settings. If no (correct) 
parent ID is found it will be added to the root. The display won't be updated so 
the refresh method should be called.

@param  tNode   New node (see: vdf.dataStructs.TAjaxTreeNode).
*/
insertNode : function(tNode){
    var tParent, sParentId;
    
    //  Determine parent id
    sParentId = tNode.sParentId;
    
    //  Check if item doesn't already exist
    if(this.getNodeById(tNode.sId)){
        throw new vdf.errors.Error(5151, "Node ID's must be unique", this, [ tNode.sId ]);
    }
    
    //  Search for parent
    if(sParentId){
        tParent = this.getNodeById(sParentId);
    }
    
    //  Add to its parent
    if(tParent){
        tNode.__tParent = tParent;
        tParent.__aSubItems.push(tNode);
    }else{
        this.aRootItems.push(tNode);
    }
    
    //  Add to the full item list
    this.aItems.push(tNode);
    
    //  If no node selected select this node
    if(!this.tSelectedNode){
        this.select(tNode);
    }
},

/*
This is a recursive method that loops through the child elements of the tree and 
searches for LI elements. For each LI element found a node will be created and 
attached to its parent node (the LI element in which the LI element is nested). 
It calls itself for all the children of the element.

@param  eElement    Current element.
@param  sParentId   ID of the current parent element.

@private
*/
scanHTMLTree : function(eElement, sParentId){
    var tNode;
    
    //  Generate node if found
    if((eElement.tagName && eElement.tagName.toUpperCase()) === "LI"){
        tNode = new vdf.dataStructs.TAjaxTreeNode();
    
        tNode.sId = vdf.getDOMAttribute(eElement, "sId", String(this.aItems.length));
        tNode.sValue = vdf.getDOMAttribute(eElement, "sValue", "");
        tNode.sParentId = sParentId || "";
        tNode.sName = (eElement.firstChild && (eElement.firstChild.textContent || eElement.firstChild.nodeValue)) || "New node " + tNode.sId;
        tNode.sAltText = vdf.getDOMAttribute(eElement, "sAltText", "");
        tNode.sIconClass = vdf.getDOMAttribute(eElement, "sIconClass", null);
        tNode.bExpanded = vdf.getDOMAttribute(eElement, "bExpanded", false);
    
        this.insertNode(tNode);

        sParentId = tNode.sId;
    }
    
    //  Go into children
    vdf.sys.dom.loopChildren(eElement, function(eChild){
        this.scanHTMLTree(eChild, sParentId);
    }, this);
},


/*
Updates the display based on the internal node structure. Newly inserted nodes 
will be displayed correctly. Expanded items stay expanded and the selected node 
will still be selected.
*/
refresh : function(){
    var iItem;
    
    if(this.eRootTable){
        vdf.events.clearDomListeners(this.eRootTable, true);
        this.eElement.removeChild(this.eRootTable);
        
        for(iItem = 0; iItem < this.aItems.length; iItem++){
            if(this.aItems[iItem].__eElement){
                this.aItems[iItem].__eElement.tNode = null;
            }
            this.aItems[iItem].__eElement = null;
            this.aItems[iItem].__eSubMenuRow = null;
            this.aItems[iItem].__eSubMenuTable = null;
        }
    }
    this.eRootTable = this.constructTable();
    this.eRootTable.className = (this.bHasFocus ? "treeFocussed" : "");
    
    this.eElement.appendChild(this.eRootTable);
    
    this.constructMenu(this.aRootItems, this.eRootTable);
},

/*
Constructs a tree table (root or subitems).

@private
*/
constructTable : function(){
    var eTable = document.createElement("table");
    
    eTable.cellPadding = 0;
    eTable.cellSpacing = 0;
    
    return eTable;
},

/*
Constructs a node row at the given position in the table.

@param  tNode       Node struct.
@param  eTable      Table element to which the node row needs to be added.
@param  iPos        Position in the table.
@param  bIsStart    True if the node is the first node on his level.
@param  bIsLast     True if the node is the last node on his level.
@private
*/
constructNode : function(tNode, eTable, iPos, bIsStart, bIsLast){
    var bDoSub, eRow, eCell, eSpan;
    
    //  Determine if node has sub menu
    bDoSub = this.hasChildren(tNode);
    
    //  Determine tree CSS class
    
    //  Create row
    eRow = eTable.insertRow(iPos);
    tNode.__eElement = eRow;
    eRow.tNode = tNode;
    
    //  Tree cell
    eCell = eRow.insertCell(0);
    eCell.innerHTML = "<div>&nbsp;</div>";
    
    //  Content cell
    eCell = eRow.insertCell(eRow.cells.length);
    
    //  Text span
    eSpan = document.createElement("span");
    eSpan.title = (tNode.sAltText ? tNode.sAltText : "");
    eSpan.className = "treeText";
    vdf.sys.dom.setElementText(eSpan, tNode.sName);
    eCell.appendChild(eSpan);
    
    
    vdf.events.addDomListener("click", eCell, this.onItemClick, this);
    vdf.events.addDomListener("dblclick", eCell, this.onEnterAction, this);
    
    this.updateNodeCSS(tNode);
    
    //  Add listener(s)
    if(bDoSub){
        vdf.events.addDomListener("click", eRow, this.onExpandClick, this);
        
        if(tNode.bExpanded){
            iPos++;
            this.constructSubmenu(tNode, eTable, iPos, bIsLast);
        }
    }
    
    return iPos;
},

/*
Generates the DOM elements for the given list of nodes on the given table.

@param  aNodes  Array with nodes.
@param  eTable  Table element.
@private
*/
constructMenu : function(aNodes, eTable){
    var iNode, iPos = 0;

    for(iNode = 0; iNode < aNodes.length; iNode++){
        iPos = this.constructNode(aNodes[iNode], eTable, iPos, (iNode === 0 && eTable === this.eRootTable), (iNode == aNodes.length - 1));
        iPos++;
    }
},

/*
Constructs the submenu that belongs to the given node.

@param  tNode       Node element.
@param  eTable      Table element in which the node is located.
@param  iPos        Position to generate submenu on.
@param  bIsLast     Determines wether the node is the last on this level.
@private
*/
constructSubmenu : function(tNode, eTable, iPos, bIsLast){
    var eRow, eCell, eNewTable;

    eRow = eTable.insertRow(iPos);

    eCell = eRow.insertCell(0);
    eCell.className = (bIsLast ? "treeConLast" : "treeCon");
    
    eCell = eRow.insertCell(1);
    eNewTable = this.constructTable();
    eCell.appendChild(eNewTable);
    
    tNode.__eSubMenuRow = eRow;
    tNode.__eSubMenuTable = eNewTable;
    
    this.constructMenu(tNode.__aSubItems, eNewTable, false);
},

/*
The node above the currently selected node will be selected.
*/
moveUp : function(){
    var aList, iPos, tNode;
    
    if(this.tSelectedNode){
        tNode = this.tSelectedNode;
        iPos = this.getPosition(tNode);
        if(iPos > 0){   //  Select the previous node on this level
            aList = (tNode.__tParent ? tNode.__tParent.__aSubItems : this.aRootItems);
            
            //  If this node is expanded move down till the last end node
            tNode = aList[iPos - 1];
            while(tNode.bExpanded && tNode.__aSubItems.length > 0){
                tNode = tNode.__aSubItems[tNode.__aSubItems.length - 1];
            }
            
            this.select(tNode);
        }else{  //  Select the parent if available
            if(tNode.__tParent){
                this.select(tNode.__tParent);
            }
        }
    }
},

/*
The node below the currently selected node will be selected.
*/
moveDown : function(){
    var tNode, aList, iPos;
    
    if(this.tSelectedNode){
        tNode = this.tSelectedNode;
        if(tNode.bExpanded && tNode.__aSubItems.length > 0){  //  Select the first child
            this.select(tNode.__aSubItems[0]);
        }else{  
            while(tNode){   //  Keep on moving levels up until a next node on the level is available or the root is reached
                aList = (tNode.__tParent ? tNode.__tParent.__aSubItems : this.aRootItems);
                iPos = this.getPosition(tNode);
            
                if(iPos < aList.length - 1){
                    this.select(aList[iPos + 1]);
                    break;
                }else{
                    tNode = tNode.__tParent;
                }
            }
        }
    }

},

/*
The currently selected node will be collapsed. 
*/
collapse : function(){
    var tNode;
    
    if(this.tSelectedNode){
        tNode = this.tSelectedNode;
        
        if(tNode.bExpanded && this.hasChildren(tNode)){
            this.doCollapse(tNode);
        }else{
            if(tNode.__tParent){
                this.select(tNode.__tParent);
            }
        }
    }
},

/*
The currently selected node will be extended.
*/
extend : function(){
    var tNode;
    
    if(this.tSelectedNode){
        tNode = this.tSelectedNode;
        
        if(!tNode.bExpanded && this.hasChildren(tNode)){
            this.doExpand(tNode);
        }else{
            if(tNode.__aSubItems.length > 0){
                this.select(tNode.__aSubItems[0]);
            }
        }
    }
},

/*
The first node will be selected.
*/
moveFirst : function(){
    if(this.aRootItems.length > 0){
        this.select(this.aRootItems[0]);
    }
},

/*
The last node will be selected.
*/
moveLast : function(){
    var tNode;
    
    if(this.aRootItems.length > 0){
        tNode = this.aRootItems[this.aRootItems.length - 1];
        
        while(tNode.bExpanded && tNode.__aSubItems.length > 0){
            tNode = tNode.__aSubItems[tNode.__aSubItems.length - 1];
        }
        
        this.select(tNode);
    }
},

/*
If the node is expanded it will be collapsed or the other way around.

@param  tNode   Node to toggle (see: vdf.dataStructs.TAjaxTreeNode).
*/
toggle : function(tNode){
    if(tNode.bExpanded){
        this.doCollapse(tNode);
    }else{
        this.doExpand(tNode);
    }
},

/*
The node will be expanded.

@param  tNode   Node to expand (see: vdf.dataStructs.TAjaxTreeNode).
*/
doExpand : function(tNode){
    tNode.bExpanded = true;
    
    if(tNode.__eSubMenuRow){ //  Unhide if DOM elements are already there
        tNode.__eSubMenuRow.style.display = "";
    }else{  //  Generate DOM elements
        this.constructSubmenu(tNode, (tNode.__tParent ? tNode.__tParent.__eSubMenuTable : this.eRootTable), tNode.__eElement.rowIndex + 1, this.isLast(tNode));
    }
    
    this.updateNodeCSS(tNode);
},


/*
The node will be collapsed.

@param  tNode   Node to toggle (see: vdf.dataStructs.TAjaxTreeNode).
*/
doCollapse : function(tNode){
    tNode.bExpanded = false;

    if(tNode.__eSubMenuRow){ 
       tNode.__eSubMenuRow.style.display = "none";
    }
    
    //  If the selected item is now hidden we select the collapsed one
    if(this.isParent(this.tSelectedNode, tNode)){
        while(tNode && !this.select(tNode)){
            tNode = tNode.__tParent;
        }
    }
    
    this.updateNodeCSS(tNode);
},

/*
Redefines the CSS classes set on the node elements.

@private
*/
updateNodeCSS : function(tNode){
    var bFirst, bLast, bRoot, bSub;

    if(tNode.__eElement){
        //  Update node CSS
        tNode.__eElement.className = (tNode.bExpanded ? "treeExpanded" :  "treeCollapsed") + (tNode === this.tSelectedNode ? " treeSelected" : "");
        
        bFirst = this.isFirst(tNode);
        bLast = this.isLast(tNode);
        bRoot = this.isRoot(tNode);
        bSub = this.hasChildren(tNode);
        
        tNode.__eElement.cells[0].className = "treeItem tree" + (bFirst && bRoot || bLast ? (bFirst && bRoot ? "Start" : "") + (bLast ? "End" : "") : "Entry") + (bSub ? "Sub" : "");
        
        if(this.bDisplayIcons){
            tNode.__eElement.cells[1].className = (tNode.__aSubItems.length > 1 || tNode.bHasChildren ? "treeFolder " : "treeIcon ") + (tNode.sIconClass || "");
        }
    }
},

/*
All nodes will be expanded.
*/
expandAll : function(){
    var iItem;

	for(iItem = 0; iItem < this.aItems.length; iItem++){
        this.aItems[iItem].bExpanded = true;
    }
    
    this.refresh();
},

/*
All nodes will be collapsed.
*/
collapseAll : function(){
    var iItem;

	for(iItem = 0; iItem < this.aItems.length; iItem++){
        this.aItems[iItem].bExpanded = false;
    }
    
    this.refresh();
},

/*
The node will be selected.

@param  tNode   Node to select (see: vdf.dataStructs.TAjaxTreeNode).
@return True if the node was succesfully selected.
*/
select : function(tNode){
    var bContinue = true, oEventInfo, tPrevSelected, oEvent;
    
    oEventInfo = { tNode : tNode, sNodeId : tNode.sId, sParentNodeId : tNode.sParentId, sNodeValue : tNode.sValue };
    
    //  Call the select handler method of the node (if available) with an official event method
    if(typeof tNode.__fSelectHandler == "function"){
        oEvent = new vdf.events.JSEvent(this, oEventInfo);
        if(tNode.__fSelectHandler.call((tNode.__oSelectEnv || null), oEvent) === false){
            bContinue = false;
        }
        
        bContinue = (bContinue && !oEvent.bCanceled);
    }
    
    //  If select handler method wasn't canceled 
    if(bContinue && this.onSelect.fire(this, oEventInfo)){
        tPrevSelected = this.tSelectedNode;
    
        //  Select the new node
        this.tSelectedNode = tNode;
        
        if(tPrevSelected){
            this.updateNodeCSS(tPrevSelected);
        }
        this.updateNodeCSS(tNode);
        
        if(tNode.__eElement){
            this.scrollToElement(tNode.__eElement);
        }
        
        return true;
    }
    
    return false;
},

/*
The node with the given ID will be selected.

@param  sId     The unique ID of the node.
*/
selectById : function(sId){
    var tNode = this.getNodeById(sId);
    
    if(tNode){
        this.select(tNode);
    }
},

/*
Scrolls to the element if the

@private
*/
scrollToElement : function(eElement){
    var iTop, iLeft, oElem, oDiv;
    
    oElem = vdf.sys.gui.getAbsoluteOffset(eElement);
    oDiv = vdf.sys.gui.getAbsoluteOffset(this.eElement);
    
    iTop = oElem.top - oDiv.top;
    
    if(iTop < this.eElement.scrollTop){
        this.eElement.scrollTop = iTop;
    }else if(iTop + eElement.clientHeight > this.eElement.scrollTop + this.eElement.clientHeight){
        this.eElement.scrollTop = iTop + eElement.clientHeight - this.eElement.clientHeight;
    }
},

/*
Determines the position of the nod on its level.

@param  tNode   Node
@return Position of the node on its level (-1 if not in the structure).
@private
*/
getPosition : function(tNode){
    var aList, iPos;
    
    aList = (tNode.__tParent ? tNode.__tParent.__aSubItems : this.aRootItems);
    
    for(iPos = 0; iPos < aList.length; iPos++){
        if(aList[iPos] === tNode){
            return iPos;
        }
    }
    
    return -1;
},

/*
Determines if the node is the last of its level.

@param  tNode   Node
@return True if the node is the last.
@private
*/
isLast : function(tNode){
    var aList = (tNode.__tParent ? tNode.__tParent.__aSubItems : this.aRootItems);
    
    return (aList[aList.length - 1] === tNode);
},

/*
Determines if the node is the first of its level.

@param  tNode   Node
@return True if the node is the first.
@private
*/
isFirst : function(tNode){
    var aList = (tNode.__tParent ? tNode.__tParent.__aSubItems : this.aRootItems);
    
    return (aList[0] === tNode);
},

/*
Determines if the node is in the root of the tree.

@param  tNode   Node
@return True if the node is in the root.
@private
*/

isRoot : function(tNode){
    return (tNode.__tParent ? false : true);
},

/*
Determines if the node is a child of the parent node.

@param  tNode   Node.
@param  tParent Parent to determine.
@returns    True if the parent is a parent of the child.
@private
*/
isParent : function(tNode, tParent){
    while(tNode){
        if(tNode === tParent){
            return true;
        }
        
        tNode = tNode.__tParent;
    }

    return false;
},

/*
Determines the level of the node in the tree.

@param  tNode   Node.
@return Level (first level is 1).
@private
*/
getLevel : function(tNode){
    var iLevel = 1;
    
    while(tNode.__tParent){
        iLevel++;
        tNode = tNode.__tParent;
    }
    
    return iLevel;
},

/*
Can be used to obtain a reference to a node struct.

@param  sNodeId     Unique ID of the node.
@return Reference to the node struct (see: vdf.dataStructs.TAjaxTreeNode).
*/
getNodeById : function(sNodeId){
	var iItem;

	for(iItem = 0; iItem < this.aItems.length; iItem++){
		if(this.aItems[iItem].sId === sNodeId){
            return this.aItems[iItem];
        }
	}
    
    return null;
},

/*
Determines if the node has children.

@param  tNode   Node
@return True if the node has children.
@private
*/
hasChildren : function(tNode){
    return tNode.__aSubItems.length > 0;
},

/*
Can be used to obtain a reference to the node struct of the currently selected 
node.

@return Reference to the node struct (see: vdf.dataStructs.TAjaxTreeNode).
*/
getSelectedNode : function(){
    return this.tSelectedNode;
},

/*
Can be used to obtain the unique ID of the currently selected node.

@return Node ID.
*/
getSelectedNodeId : function(){
    return (this.tSelectedNode ? this.tSelectedNode.sId : null);
},
/*
Can be used to obtain the value of the currently selected node.

@return Node value (string).
*/
getSelectedNodeValue : function(){
    return (this.tSelectedNode ? this.tSelectedNode.sValue : null);
},


/*
Returns the focus to the tree.
*/
returnFocus : function(){
    if(this.eFocus){
        vdf.sys.dom.focus(this.eFocus);
    }
},

/*
Handles the onclick event of the text cell of the node.

@param  oEvent  Event object.
@private
*/
onItemClick : function(oEvent){
    var tNode = (oEvent.eSource && vdf.sys.dom.searchParent(oEvent.eSource, "tr")).tNode;
    
    if(tNode){
        if(this.tSelectedNode !== tNode){
            this.returnFocus();
            if(this.select(tNode)){
                //  Expand the node if we want to
                if(!tNode.bExpanded && this.hasChildren(tNode)){
                    this.doExpand(tNode);
                }
                oEvent.stop();
            }
        }
    }
},

/*
Fires the onEnter event of the tree and if it isn't stopped of the form.

@return True if onEnter event was stopped.
@private
*/
onEnterAction : function(){
    if(!this.onEnter.fire(this, null)){
        return true;
    }else if(this.oParentControl && this.oParentControl.onEnter && this.oParentControl.onEnter.fire && !this.oForm.onEnter.fire(this, null)){
        return true;
    }
    
    return false;
},

/*
Handles the keypress event of the hidden focus anchor. Compares the event 
details to the oKeyActions and executes the action if a match is found.

@param  oEvent  Event object.
@private
*/
onKey : function(oEvent){
    var oPressedKey = {
        iKeyCode : oEvent.getKeyCode(),
        bCtrl : oEvent.getCtrlKey(),
        bShift : oEvent.getShiftKey(),
        bAlt : oEvent.getAltKey()
    };

    try{
        if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.moveUp)){ 
            this.moveUp();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.moveDown)){ 
            this.moveDown();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.collapse)){ 
            this.collapse();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.extend)){ 
            this.extend();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.moveFirst)){ 
            this.moveFirst();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.moveLast)){ 
            this.moveLast();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.enter)){
            if(this.onEnterAction()){
                oEvent.stop();
            }
        }
    }catch (oError){
        vdf.errors.handle(oError);
    }
},

/*
Handles the focus event of the focus holder element. It changes the display to 
"focussed".

@param  oEvent  Event object.
@private
*/
onFocus : function(oEvent){

    this.bHasFocus = true;
    this.bLozingFocus = false;
    if(this.eRootTable){
        this.eRootTable.className = "treeFocussed";
    }
},

/*
Handles the blur event of the focus holder element. It changes the display to
"not focussed" after a little timeout. This timeout is because the focus 
sometimes flashes away and comes back.

@param  oEvent  Event object.
    
@private
*/
onBlur : function(oEvent){
    var oTree = this;
    
    this.bLozingFocus = true;

    setTimeout(function(){
        if(oTree.bLozingFocus){
            oTree.bHasFocus = false;
            if(oTree.eRootTable){
                oTree.eRootTable.className = "";
            }
        }
    }, 200);
},

/*
Handles the onclick event if the outermost element and returns the focus to the 
tree so clicking on the white space also gives the focus to the tree.

@param  oEvent  Event object.
@private
*/
onGlobalClick : function(oEvent){
    this.returnFocus();
},

/*
Handles the click on of the row element and toggles the element.

@param  oEvent  Event object.
@private
*/
onExpandClick : function(oEvent){
    var tNode = oEvent.eSource.tNode;
    
    if(tNode){
        this.returnFocus();
        //  Switch expanded
        this.toggle(tNode);
    }
}

});