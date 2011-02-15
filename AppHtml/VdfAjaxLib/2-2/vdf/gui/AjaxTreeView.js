/*
Name:
    vdf.gui.AjaxTreeView
Type:
    Prototype
Extends:
    vdf.gui.TreeView

Revisions:
    2009/10/19  Created the initial version. (HW, DAE)
*/


/*
Constructor of the AjaxTreeView component which applies to the API for automatic 
initialization (See: vdf.core.init).

@param  eElement        The DOM element defining the menu.
@param  oParentControl  Reference to the parent control if the control is nested.
*/
vdf.gui.AjaxTreeView = function(eElement, oParentControl){
    this.TreeView(eElement, oParentControl);
    
    /*
    The Web Object to which contains the server-side implementation of the tree.
    */
    this.sWebObject = this.getVdfAttribute("sWebObject", null, true);
    /*
    The Web Service URL that can be used to access the server.
    */
    this.sWebServiceUrl = this.getVdfAttribute("sWebServiceUrl", "WebService.wso", true);
    
    /*
    If set to false the tree engine assumes that each tree node received from 
    the server can have children. If it is true (the default) it will not try to 
    load children for nodes that have bHasChildren set to false.
    */
    this.bKnowChildren = this.getVdfAttribute("bKnowChildren", true, false);
    
    /*
    If set to false the tree engine will not try to load the root items after 
    initialization. These items then need to be added using HTML or JavaScript.
    */
    this.bLoadRoot = this.getVdfAttribute("bLoadRoot", true, false);
    
    /*
    
    This event is fired when child nodes are needed. It is fired before the AJAX 
    Call to load nodes is being send. The purpose of this event is to provide a 
    hook for the developer to add custom code to load child nodes on the fly. If 
    this event is stopped / cancelled the automatic AJAX Call to load nodes will 
    not be send any more. Note that parent node will (visually) keep the status 
    loading until the loadingFinished method is called. 
@code
function myInitTreeView(oTreeView){
    oTreeView.onLoadNodes.addListener(onTreeView_LoadNodes);
}

function onTreeView_LoadNodes(oEvent){
    var oVdfCall;
    
    //  Stop the event to stop the default loading functionality
    oEvent.stop();
    
    //  Send a custom AJAX call to load nodes
    oVdfCall = new vdf.ajax.VdfCall("oCustomer", "get_GiveNodes");
    oVdfCall.addParameter(oEvent.sParentValue);
    oVdfCall.addParameter(oEvent.sParentId);
    oVdfCall.onFinished.addListener(handle_LoadNodes);
    oVdfCall.__tNode = oEvent.tNode; // Secretly store the reference to the node on the call obect
    oVdfCall.send(true);
}

function handle_LoadNodes(oEvent){
    var sResult, aNodes, tParent, tNew, oTree, iNode;
    
    //  Get references
    oTree = vdf.getControl("myTree");
    tParent = oEvent.oSource.__tNode; // Get the reference to the node back again
    sResult = oEvent.oSource.getReturnValue();
    
    //  Split the result string
    if(sResult){
        aNodes = sResult.split("|");
        for(iNode = 0; iNode < aNodes.length; iNode++){
            //  Add the new node to the tree
            if(tParent){
                oTree.addNode(tParent.sId + "_" + iNode, tParent.sId, aNodes[iNode], "", "", false, true, aNodes[iNode]);
            }else{
                oTree.addNode(iNode, "", aNodes[iNode], "", "", false, true, aNodes[iNode]);
            }
        }
    }
    
    //  Notify the tree that we have finished the loading of the child nodes
    oTree.loadingFinished(tParent, true);
}
...
<div vdfControlType="vdf.gui.AjaxTreeView" vdfControlName="mytree" vdfInitializer="myInitTreeView">
</div>
@code

    The example above shows the JavaScript needed to load nodes using a custom 
    AJAX Call instead of the default API. It stops the default functionality by 
    stopping the event and sends a VdfCall to the server. It assumes that this 
    function will return a string containing the child nodes separated by a "|" 
    character.
    
    @prop   tNode   Reference to the node object of the parent node (see 
                vdf.dataStructs.TAjaxTreeNode).
    @prop   sParentId       The unique ID of the parent node.
    @prop   sParentValue    The value of the parent node.
    */
    this.onLoadNodes = new vdf.events.JSHandler();
    
};
/*
The vdf.gui.AjaxTreeView extends the vdf.gui.TreeView with the functionality to 
dynamically load tree nodes using AJAX calls.  These AJAX calls are being sent 
to a Visual DataFlex Web Service which responds using the JSON format. To load 
the nodes it uses the LoadTreeNodes method defined in the 
cAjaxWebServiceInterface class on the server. This method will call the 
AjaxLoadTreeNodes defined in the Web Object corresponding with the tree. This 
method only has to return a filled array of TAjaxTreeNode structs based on a 
received sParentId or sParentValue. A stub for this method is defined in the 
cAjaxWebBusinessProcess so the developer only has to override this method in the 
Web Object. 

The example below shows an example of how to declare the AjaxTreeView in HTML:
@code
<div vdfControlType="vdf.gui.AjaxTreeView" vdfControlName="my_customertree" vdfKnowChildren="true" vdfWebObject="oCustomerTree">
</div>
@code

The example below shows the server-side implementation:
@code
Object oCustomerTree is a cAjaxWebBusinessProcess
    Object oVendor_DD is a Vendor_DataDictionary
    End_Object

    Object oInvt_DD is a Invt_DataDictionary
        Set DDO_Server to oVendor_DD
    End_Object

    Object oSalesp_DD is a Salesp_DataDictionary
    End_Object

    Object oCustomer_DD is a Customer_DataDictionary
    End_Object

    Object oOrderhea_DD is a Orderhea_DataDictionary
        Set DDO_Server to oSalesp_DD
        Set Constrain_file to CUSTOMER.File_number
        Set DDO_Server to oCustomer_DD
    End_Object

    Object oOrderdtl_DD is a Orderdtl_DataDictionary
        Set DDO_Server to oInvt_DD
        Set Constrain_file to ORDERHEA.File_number
        Set DDO_Server to oOrderhea_DD
    End_Object

    Set Main_DD to oCustomer_DD
    
    //
    //  Called by the AJAX Library vdf.gui.AjaxTreeView to load tree nodes. 
    //  This example tree knows two levels (customers and its orders).
    //
    Function AjaxLoadTreeNodes String sObjectName String sParentId String sParentValue Integer iLevel Returns TAjaxTreeNode[]
        TAjaxTreeNode[] aResult
         
        If (iLevel = 0) Begin
            Get CustomerNodes sParentId to aResult
        End
        Else If (iLevel = 1) Begin
            Get OrderNodes sParentId sParentValue to aResult
        End
        
        Function_Return aResult
    End_Function

    //
    //  On the first level we show all the customers.
    //
    Function CustomerNodes  String sParentId Returns TAjaxTreeNode[]
        TAjaxTreeNode[] aResult
        Integer iCur
      
        Send Clear of oCustomer_DD
        Move 0 to iCur
        
        Send Find of oCustomer_DD FIRST_RECORD Index.1
        
        While (Found)

            Move (Trim(CUSTOMER.NAME)) to aResult[iCur].sName
            
            Move (String(CUSTOMER.CUSTOMER_NUMBER))                     to aResult[iCur].sId
            Move sParentId                                              to aResult[iCur].sParentId
            Move (SerializeRowID(GetRowID(CUSTOMER.File_Number)))       to aResult[iCur].sValue
            Move ("Customer number" * String(CUSTOMER.CUSTOMER_NUMBER)) to aResult[iCur].sAltText
            Move True                                                   to aResult[iCur].bHasChildren
            
            Increment iCur
            Send Find of oCustomer_DD GT Index.1
        Loop
        
        
        Function_Return aResult
    End_Function

    //
    //  On the second level we show all the orders of all the customer on the first 
    //  level.
    //
    Function OrderNodes  String sParentId String sParentValue Returns TAjaxTreeNode[]
        TAjaxTreeNode[] aResult
        Integer iIndex iCur
        
        Send Clear_All of oCustomer_DD
        Move 0 to iCur
        
        Send FindByRowId of oCustomer_DD CUSTOMER.File_Number (DeserializeRowID(sParentValue))
        
        If (Found) Begin
            Send Find of oOrderhea_DD FIRST_RECORD Index.2
            
            While (Found)
                Move (String(ORDERHEA.ORDER_NUMBER))                    to aResult[iCur].sName
                Move (sParentId + "_" + String(ORDERHEA.ORDER_NUMBER))  to aResult[iCur].sId
                Move sParentId                                          to aResult[iCur].sParentId
                Move (SerializeRowID(GetRowID(ORDERHEA.File_Number)))   to aResult[iCur].sValue
                Move ("Date:" * String(ORDERHEA.ORDER_DATE) * "Sales person:" * Trim(SALESP.NAME) * "Total price: " * FormatCurrency(ORDERHEA.ORDER_TOTAL, 2))  to aResult[iCur].sAltText
                
                Move False                                              to aResult[iCur].bHasChildren
                
                Increment iCur
                Send Find of oOrderhea_DD GT Index.2
            Loop
        End

        Function_Return aResult
    End_Function
End_Object
@code
*/
vdf.definePrototype("vdf.gui.AjaxTreeView", "vdf.gui.TreeView", {

/*
Initialization method of the tree. It will call the init method of the super 
class and will load root nodes. 
*/
init : function(){
    this.TreeView.prototype.init.call(this);
    
    if(this.bLoadRoot){
        this.loadChildren(null);
    }
},

/*
Overrides the hasChildren method with the logic needed for nodes that are not 
loaded yet.

@param  tNode   Node
@return True if the node has children.
@private
*/
hasChildren : function(tNode){
    return (tNode.__aSubItems.length > 0 || (this.bKnowChildren ? tNode.bHasChildren && !tNode.__bChildrenLoaded : !tNode.__bChildrenLoaded));
},

/*
This method will completely clear the tree and then reload the root nodes from 
the server. 
*/
reload : function(){
    this.clear();
    
    this.loadChildren(null);
},

/*
This method augments the doExpand method of the super class with the 
functionality to load unloaded children first. If the children need to be 
loaded this will done using an asynchronous call and the expanding will wait 
until the response is received.

@param  tNode   Node to expand (see: vdf.dataStructs.TAjaxTreeNode).
*/
doExpand : function(tNode){
    if(tNode.__bIsLoading){
        return;
    }

    //  Determine if subnodes need to be loaded
    if(tNode.__aSubItems.length === 0 && !tNode.__bChildrenLoaded && (!this.bKnowChildren || tNode.bHasChildren)){
        this.loadChildren(tNode);
    }else{
        //  Call the orrigional 
        this.TreeView.prototype.doExpand.call(this, tNode);
    }
},

/*
Overrides the expandAll method with an empty stub because this functionality 
conflicts with the dynamic loading system.
*/
expandAll : function(){
    //  TODO: Add load the complete tree functionallity
    
},

/*
Adds a new item (node) to the tree. This doesn't refresh the tree currently 
displayed but that needs to be done manually by calling the refresh method. 
Overrides the orrigional addNode of vdf.gui.TreeView with the extra bHasChildren 
parameter.

@code
oTree.addNode("7", "", "Parent", "The parent node", "object", false, true);
oTree.addNode("8", "7", "Child", "Child node of parent", "object", true, false);
@code

@param  sId         Unique ID.
@param  sParentId   ID of the parent ("" if the node is a root element)
@param  sName       Name displayed in the tree.
@param  sAltText    (optional) Text displayed in the tooltip if the mouse hovers 
            the node.
@param  sIconClass  (optional) CSS class that defines the icon image.
@param  bExpanded   (optional) If the the node will be expanded.
@param  bHasChildren     (optional) Defines wether the engine should assume this 
@param  sValue      (optional) Extra element for external usage.
            item has children.
@param  fSelectHandler   (optional) Event handler method if the item is selected.
@param  oSelectEnv  (optional) Environent object for the select handler.
*/
addNode : function(sId, sParentId, sName, sAltText, sIconClass, bExpanded, bHasChildren, sValue, fSelectHandler, oSelectEnv){
    var tNode = new vdf.dataStructs.TAjaxTreeNode();
    
    tNode.sId = sId;
    tNode.sValue = sValue || "";
    tNode.sParentId = sParentId;
    tNode.sName = sName;
    tNode.sAltText = sAltText || "";
    tNode.sIconClass = sIconClass || null;
    tNode.bExpanded = bExpanded || null;
    tNode.bHasChildren = bHasChildren || null;
    
    tNode.__fSelectHandler = fSelectHandler || null;
    tNode.__oSelectEnv = oSelectEnv || null;
    
    this.insertNode(tNode);
},

/*
This method sends an asynchronous loading call out to load the children of this 
node. If the response is received it will expand this node.

@param  tNode   Node struct.
@private
*/
loadChildren : function(tNode){
    var oCall;

    if(tNode){
        tNode.__bIsLoading = true;
    }
    this.displayLoading(tNode);
    
    //  Give the application developer a change to append custom node loading code
    if(this.onLoadNodes.fire(this, { tNode : tNode, sParentId : (tNode && tNode.sId), sParentValue : (tNode && tNode.sValue) })){
        //  Send the call
        oCall = new vdf.ajax.JSONCall("LoadTreeNodes", null, this.sWebServiceUrl);
        oCall.addParam("sWebObject", this.sWebObject);
        oCall.addParam("sSessionKey", vdf.sys.cookie.get("vdfSessionKey"));
        oCall.addParam("sObjectName", this.sName);
        oCall.addParam("sParentId", (tNode ? tNode.sId : ""));
        oCall.addParam("sParentValue", (tNode ? tNode.sValue : ""));
        oCall.addParam("iLevel", (tNode ? this.getLevel(tNode) : 0));
        
        oCall.onFinished.addListener(this.handleLoadChildren, this);
        oCall.onError.addListener(this.handleLoadChildrenError, this);
        oCall.__tNode = tNode;
        
        oCall.send(true);
    }
},

/*
Handles the response of the JSON call send by loadChildren.

@param  oEvent  Event object.
@private
*/
handleLoadChildren : function(oEvent){
    var tResult, tParent, tNode, iNode;
    
    tResult = oEvent.oSource.getResponseValue();
    tParent = oEvent.oSource.__tNode;
    
    if(vdf.errors.checkServerError(tResult.aErrors, this)){
        //  Insert the new nodes into the tree
        for(iNode = 0; iNode < tResult.aNodes.length; iNode++){
            tNode = this.transformObjToStruct(tResult.aNodes[iNode]);
        
            //  Add autonumbers if needed
            tNode.sId = tResult.aNodes[iNode].sId || this.aItems.length;
            tNode.sParentId = tNode.sParentId || (tParent ? tParent.sId : "");
        
            this.insertNode(tNode);
        }
        
        this.loadingFinished(tParent, true);
    }else{
        this.loadingFinished(tParent, false);
    }
},

/*
This method should be called when the loading of child nodes is completed. It 
removes the loading state from the given node and expands it. If no node is 
given the global loading state is removed and the tree is refreshed. The 
application developer needs to call this method manually if the onLoadNodes 
event is stopped.

@param  tParent     Reference to the parent node for which child nodes are loaded.
@param  bSuccess    If true the engine assumes that the child nodes are properly 
            loaded and it will not attemp to load them again.
*/
loadingFinished : function(tParent, bSuccess){
    if(tParent){
        if(bSuccess){
            //  Update the node's display and expand it
            tParent.__bIsLoading = false;
            this.hideLoading(tParent);

            this.updateNodeCSS(tParent);
            tParent.__bChildrenLoaded = true;
            
            this.TreeView.prototype.doExpand.call(this, tParent);
        }else{
            tParent.__bIsLoading = false;
            this.hideLoading(tParent);
        }
    }else{
        //  Update the global display and refresh
        this.hideLoading(null);
        this.refresh();
    }
},

/*
Handles the onError event of the JSON call send by loadChildren. Unlocks the 
tree node.

@param  oEvent  Event object.
@private
*/
handleLoadChildrenError : function(oEvent){
    var tParent = oEvent.oSource.__tNode;
    
    if(tParent){
        tParent.__bIsLoading = false;
        this.hideLoading(tParent);
    }
},

/*
The JSON serializer returns plain objects (not based on a class or 
vdf.dataStructs method) so we need to "transform" the plain ojbect into a 
dataStruct object for the extra hidden properties.

@param  oObj    Plain object.
@return Struct object based on vdf.dataStructs.TAjaxTreeNode.
*/
transformObjToStruct : function(oObj){
    var tNode = new vdf.dataStructs.TAjaxTreeNode();
    
    tNode.sName = oObj.sName;
	tNode.sAltText = oObj.sAltText;
    
    tNode.sId = oObj.sId;
    tNode.sValue = oObj.sValue;
    tNode.sIconClass = oObj.sIconClass;
    tNode.sParentId = oObj.sParentId;
    tNode.bExpanded = oObj.bExpanded;
    
    tNode.bHasChildren = oObj.bHasChildren;
    
    return tNode;
},

/*
Determines wether this tree still has unloaded items.

@return True if the tree still has unloaded items.
@private
*/
hasUnloadedItems : function(){
    var iNode;
    
    for(iNode = 0; this.aItems.length; iNode++){
        if(!this.aItems[iNode].__bChildrenLoaded){
            return true;
        }
    }
    
    return false;
},

/*
Updates the node CSS and if null is received globally display loading.

@param  tNode   Node struct.
@private
*/
displayLoading : function(tNode){
    if(tNode){
        this.updateNodeCSS(tNode);
    }else{
        this.eElement.className += " treeLoading";
    }    
},

/*
Updates the node CSS and if null is received globally hide loading.

@param  tNode   Node struct.
@private
*/
hideLoading : function(tNode){
    if(tNode){
        this.updateNodeCSS(tNode);
    }else{
        this.eElement.className = this.eElement.className.replace("treeLoading");
    }
},

/*
Augments the updateNodeCSS method with the functionality to display a node as 
"loading" by setting its className to treeIconLoading. 

@param  tNode   Node struct.
@private
*/
updateNodeCSS : function(tNode){
    this.TreeView.prototype.updateNodeCSS.call(this, tNode);
    
    if(tNode.__bIsLoading && tNode.__eElement){
        tNode.__eElement.cells[1].className = "treeIconLoading";
    }
}
    
});