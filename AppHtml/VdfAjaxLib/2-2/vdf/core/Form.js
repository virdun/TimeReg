/*
Name:
    vdf.core.Form
Type:
    Prototype
Revisions:
    2005/10/24  Created the initial version (HW, DAE).
    2008/05/10  Remodelled it into the 2.0 model. It is now called 
    vdf.core.Form. (HW, DAE)
*/

/*
@require    vdf/core/MetaData.js
@require    vdf/core/ClientDataDictionary.js
@require    vdf/core/Action.js
*/

/*
Bubbles up in the DOM to search for the Form control or the Toolbar control 
(which points to the correct Form).

@param  eElement   Reference to a DOM element to start with.
@return Reference to the Form object (null if not found).
*/
vdf.core.findForm = function findForm(eElement){
    //  Bubble up in the DOM searching for VDF controls
    while(eElement !== null && eElement !== document){
        if(typeof(eElement.oVdfControl) === "object"){
            if(eElement.oVdfControl.sControlType === "vdf.core.Form" || eElement.oVdfControl.sControlType === "vdf.core.FormMeta" || eElement.oVdfControl.sControlType === "vdf.core.FormBase"){
                return eElement.oVdfControl;
            }else if(eElement.oVdfControl.sControlType === "vdf.core.Toolbar" && eElement.oVdfControl.oForm !== null){
                return eElement.oVdfControl.oForm;
            }
        }

        eElement = eElement.parentNode;
    }

    return null;
};


/*
Constuctor that has interface required by the vdf.core.Initializer. It 
initializes the properties and starts the initialization proces which 
creates the meta data object and DDO structure.

@param  eElement        Reference to the form DOM element.
@param  oParentControl  Reference to a parent control (if available).
*/
vdf.core.Form = function Form(eElement, oParentControl){
    this.FormMeta(eElement, oParentControl, true);
    
    var sKey;
    
    
    /*
    Reference to the server data dictionary. Can be set from the HTML API using 
    the sServerTable (html: vdfServerTable) property.
    */
    this.oServerDD = null;
    /*
    Property used during initialization to determine the server data dictionary 
    (see: oServerDD property).
    
    @html
    @htmlbubble
    */
    this.sServerTable = null;
    
    /*
    TODO: Implement!
    @private
    */
    this.bAutoClearDeoState     = this.getVdfAttribute("bAutoClearDeoState", true);
    /*
    Can be used to disable the autofill method. The autofill method 
    automatically performes find by RowID for each rowid that are available in 
    the status fields before initialization. When using lookups inside the Form 
    it is adviced to leave this option.
    
    The example shows how a record can be loaded into the buffer directly after 
    the page load by setting the rowid in the html.
@code
<input type="hidden" name="customer__rowid" value="05000000" />
@code
    */
    this.bAutoFill              = this.getVdfAttribute("bAutoFill", true);
    /*
    Switches the default key actions (like find, save, clear, delete) on and 
    off.
    */
    this.bAttachKeyActions      = this.getVdfAttribute("bAttachKeyActions", true);
    
    /*
    Fired before the initial fill is performed. The initial fill can be canceled 
    using event.stop(). The initial fill can also be switched of using the 
    bAutoFill property. Note that the initial fill can send an AJAX call with 
    findByRowIds but the onBeforeFindByRowId and onAfterFindByRowId of the 
    ClientDataDictionary objects are not fired.
    */
    this.onBeforeInitialFill    = new vdf.events.JSHandler();
    /*
    Fired after the initial fill is completed. The initial fill can have 
    performed a server request (AJAX Call).
    
    @prop   bAccessedServer If true the server is accessed.
    @prop   bError          If true an error occurred on the server.
    @prop   iErrorNr        The error number if an error occurred on the server.
    @prop   aResponseSets   Array with responsesets received from the server (if 
                the server is accessed).
    */
    this.onAfterInitialFill     = new vdf.events.JSHandler();
    /*
    The onBeforeDbCall event is fired before a DbCall is send to the server. If 
    this event is stopped the DbCall won’t be send to the server.
    
    @prop   sMethod     The name of the method that will be called on the 
                server.
    @prop   asParams    Array with the parameters that will be passed to this 
                method.
    */
    this.onBeforeDbCall         = new vdf.events.JSHandler();
    /*
    The onAfterDbCall event is fired after a DbCall was send to the server.
    
    @prop   bError          True if any errors occurred during the find.
    @prop   iErrorNr        Error number of the first error that occurred.
    @prop   tResponseSet    Data object (struct) with response data 
                (see vdf.dataStructs.TResponseSet).
    @prop   sReturnValue    The value returned by the server-side method.
    @prop   sMethod         The name of the method that is called on the server.
    @prop   asParams        The parameters that are be passed to the method.
    */
    
    this.onAfterDbCall         = new vdf.events.JSHandler();
    
    //  @privates
    this.oDDs                   = {};
    this.oUserDataFields        = {};
    this.oActionKeys            = {};
	
    //  Copy settings
    for(sKey in vdf.settings.formKeys){
        if(typeof(vdf.settings.formKeys[sKey]) == "object"){
            this.oActionKeys[sKey] = vdf.settings.formKeys[sKey];
        }
    }
    
    this.iInitFinishedStage     = 6;
    
    //  Start the loading proces
    this.initStage();
};
/*
The Form is the core of data entry pages within the AJAX Library. The Form 
component contains the functionality to create the client-side DDO structure 
that performs the data binding. It builds this structure using the meta 
information which is loaded by the super class vdf.core.FormMeta using the 
vdf.core.MetaData class. During the initialization the Form creates instances of 
the vdf.core.ClientDataDictionary class for all the DDO objects that are defined 
in the Web Object on the server. These objects contain the logic for performing 
operations like finds and saves. All data entry objects that are bound to 
database fields will register themselves so they will receive updates of the 
DDs. 

Within the application the Form can be seen as a container that maintains its 
nested objects. For data entry objects it will initialize the validation 
systems. It also has an API for getting references to its child elements so 
multiple forms can be maintained in a single page without problems. Important 
settings like the sWebOject, sWebServiceUrl and sServerTable will be inherited 
by its child elements during initialization.

The following example defines a (simplified) inventory form:
@code
<form vdfControlType="vdf.core.Form" vdfName="myForm" vdfWebObject="oInvt" vdfServerTable="invt">
    ID: <input type="text" value="" name="invt__item_id" size="10" /><br/>
    Description: <input type="text" value="" name="invt__description" size="35" vdfSuggestSource="find" /><br/>
    Vendor ID: <input type="text" value="0" name="vendor__id" size="6" /><br/>
    Vendor Name: <input type="text" value="" name="vendor__name" size="30" vdfSuggestSource="find" /><br/>
    Part ID: <input type="text" value="" name="invt__vendor_part_id" size="15" /><br/>
    Price: <input type="text" value="0" name="invt__unit_price" size="8" /><br/>
    On hand: <input type="text" value="0" name="invt__on_hand" size="6" /><br/>
</form>
@code
*/
vdf.definePrototype("vdf.core.Form", "vdf.core.FormMeta", {

// - - - - - - - - - - INITIALIZATION - - - - - - - - - - -

/*
Loads the field meta data and starts building the DDO structure.

@private
*/
initStageFieldMetaDDO : function(){
    //vdf.log("Form: Loading stage " + this.iInitStage + ": Field Meta Load & DD Structure");
    
    //  Load field meta data
    this.loadFieldMeta();
    //  Build DD structure
    this.buildDDStructure();
},

/*
Finalizes the initialization by calling the application initialization and 
performing the initial fill.

@private
*/
initStageFinalize : function(){
    //vdf.log("Form: Loading stage " + this.iInitStage + ": Calls initializers & do autofill");
    this.callInitializers();
    
    //  Do initial fill
    if(this.bAutoFill){
        this.oServerDD.initialFill();
    }
    
    if(this.oActiveField && this.bAutoFocusFirst){
        this.oActiveField.focus();
    }
},

/*
Initialization is done in three stages where stages can contain multiple tasks.

Stage 1:
    1 - The global meta data is loaded ASynchronously from the server.
    2 - The document is scanned further and fields are added to the form.
    
Stage 2:
    3 - The field meta data is loaded ASynchronously from the server.
    4 - The DDO structure is created.
Stage 3:
    5 - Child objects (lists / grids / lookups) can initialize themself
    
Stage 4:
    6 - Initial fill requests are made ASynchronously
    7 - The initialized are fired

@private
*/
initStage : function(){
    switch(this.iInitStage){
        case 1:
            this.initStageGlobalMetaFields();
            break;
        case 3:
            this.initStageFieldMetaDDO();
            break;
        case 5:
            this.initStageChildren();
            break;
        case this.iInitFinishedStage:
            this.initStageFinalize();
            
            
    }
},



/*
Is called after the intial meta data request is made and the fields are all 
found. It initializes the DDO structure by creating the ClientDataDictionary 
objects.

@private
*/
buildDDStructure : function(){
    var tMeta = this.oMetaData.getMetaData(), iDD, iDEO, sServerTable;
    
    //  Create DDs
    for(iDD = 0; iDD < tMeta.aDDs.length; iDD++){
        this.oDDs[tMeta.aDDs[iDD].sName] = new vdf.core.ClientDataDictionary(tMeta.aDDs[iDD].sName, this);  
    }
    
    //  Initialize DD structure
    for(iDD = 0; iDD < tMeta.aDDs.length; iDD++){
        this.oDDs[tMeta.aDDs[iDD].sName].buildStructure(tMeta.aDDs[iDD]);
    }
    
    //  Find the ServerDD
    sServerTable = this.getVdfAttribute("sServerTable", null, true);
    if(sServerTable !== null){
        this.oServerDD = this.oDDs[sServerTable.toLowerCase()];

        if(!this.oServerDD){
			throw new vdf.errors.Error(5137, "Unknown table '{{0}}'", this, [sServerTable, "vdf.core.Form[sServerTable]"]);
        }
    }
    if(this.oServerDD === null && this.aDEOs.length > 0){
        throw new vdf.errors.Error(5144, "Form with fields must have a server DD!", this);
    }
    
    
    //  Initialize data bindings
    for(iDEO = 0; iDEO < this.aDEOs.length; iDEO++){
        this.aDEOs[iDEO].bindDD();
    }    
    
    //  Move to next step / stage
    this.iInitStage++;
    this.initStage();
},



// - - - - - - - - - - CENTRAL FUNCTIONALITY - - - - - - - - - - 

/*
Searches for the data dictionary object with the given name. 

@param  sName   Name of the DD.
@return Reference to the ClientDataDictionary object (null if not found).
*/
getDD : function(sName){
    sName = sName.toLowerCase();
    if(typeof(this.oDDs[sName]) === "object" && this.oDDs[sName].bIsDD){
        return this.oDDs[sName];
    }
    return null;
},

/*
Searches for the given databinding in the buffer (for userdata fields it 
returns the field value).

@param  sBinding    Data binding from the field.
@return Buffer value (null if not found).
*/
getBufferValue : function(sBinding){
    var aParts, sTable, sField, oDD, oField, sDD, sValue;

    sBinding = sBinding.toLowerCase().replace("__", ".");
    if(sBinding.replace("__", ".").match(/^[a-zA-Z][a-zA-Z0-9_@#]*\.[a-zA-Z][a-zA-Z0-9_@#]*$/)){
        //  It is a regular database field
        
        //  Split into table and field name
        aParts = sBinding.split(".");
        sTable = aParts[0];
        sField = aParts[1];
        
        //  Find the DD for this table
        oDD = this.oDDs[sTable];
        if(typeof(oDD) === "object" && oDD.bIsDD){
            return oDD.getFieldValue(sTable, sField);
        }
    }else if(sBinding.match(/^[eE]\:[a-zA-Z][a-zA-Z0-9_@#]*$/)){
        //  It is an expression field
        
        //  Cut of the e: part
        sBinding = sBinding.substr(2);
        
        //  We go through the DD's untill we find the value (we simply don't know which DD to use)
        for(sDD in this.oDDs){
            if(this.oDDs.hasOwnProperty(sDD)){
                sValue = this.oDDs[sDD].getExpressionValue(sBinding);
                
                if(sValue !== null){
                    return sValue;
                }
            }
        }
    }else{
        //  User data fields are not in buffer, but for the ease of use we also return this values
        oField = this.oUserDataFields[sBinding];
        if(typeof(oField) === "object" && oField.bIsField){
            return oField.getValue();
        }        
    }
       
    return null;
},

/*
Sets a new value to the buffer. If databinding points to a userdata field it 
directly sets the value to this field.

@param  sDataBinding    The data binding.
@param  sValue          The new value for the field.
*/
setBufferValue : function(sDataBinding, sValue){
    var aParts, sTable, sField, oDD;

    sDataBinding = sDataBinding.toLowerCase().replace("__", ".");
    
    aParts = sDataBinding.split(".");
    if(aParts.length >= 2){
        sTable = aParts[0];
        sField = aParts[1];
        
        //  Search DD
        oDD = this.oDDs[sTable];
        if(typeof(oDD) === "object" && oDD.bIsDD){
            oDD.setFieldValue(sTable, sField, sValue, false);
        }else{
            throw new vdf.errors.Error(5138, "Table {{0}} not found!", this, [ sTable, sField, "vdf.core.Form(setBufferValue)" ]);
        }
    }else{
        //  User data fields are not in buffer, but for the ease of use we also set this values
        if(this.oUserDataFields.hasOwnProperty(sDataBinding)){
            this.oUserDataFields[sDataBinding].setValue(sValue);
        }else{
            throw new vdf.errors.Error(5145, "Unknown data binding {{0}}", this, [ sDataBinding, "vdf.core.Form(setBufferValue)" ]);
        }
    }
},

/*
Checks if a DD with the given name is available.

@param  sTableName  Name of the DD object.
@return True if the DD is found (false if it is not).
*/
containsDD : function(sTableName){
    return (typeof(this.oDDs[sTableName]) === "object" && this.oDDs[sTableName].bIsDD);
},

// - - - - - - - - - - USER DATA - - - - - - - - - -

/*
Called by a field/DEO to register itself as user data field.

@param  oField  Reference to the field.
*/
registerUserDataField : function(oField){
    this.oUserDataFields[oField.sDataBinding.toLowerCase()] = oField;
},

/*
Gathers the user data with so it can be sent with a request.

@return Array containing vdf.dataStructs.TAjaxUserdata objects that represent the 
        user data fields.

@private
*/
getUserData : function(){
    var sField, tField, aResult = [];
    
    for(sField in this.oUserDataFields){
        if(this.oUserDataFields[sField].bIsField){
            tField = new vdf.dataStructs.TAjaxUserData();
            tField.sName = this.oUserDataFields[sField].sDataBinding;
            tField.sValue = this.oUserDataFields[sField].getValue();
            aResult.push(tField);
        }
    }
    
    return aResult;
},

/*
Updates the user data fields with the given values. Called by a vdf.core.Action
object.

@param  aUserData   Array with vdf.dataStruct.TAjaxUserData objects.
@private
*/
setUserData : function(aUserData){
    var iField, tField;
    
    for(iField = 0; iField < aUserData.length; iField++){
        tField = aUserData[iField];
        
        if(this.oUserDataFields.hasOwnProperty(tField.sName.toLowerCase())){
            this.oUserDataFields[tField.sName.toLowerCase()].setValue(tField.sValue);
        }
    }
},

// - - - - - - - - - - (DATA BOUND) VDFCALL - - - - - - - - - - -

/*
This method sends a VdfCall to the server using the vdf.ajax.VdfCall class which 
and takes settings like the Web Object and Web Service URL from the form. Using 
this method instead of the class will result in a shorter notation in the same 
style as the dbCall method.  Difference with the dbCall method is that the 
vdfCall method, like vdf.ajax.VdfCall class, doesn’t synchronize the buffers in 
any way. This means that when working with data on the server the developer 
himself is responsible for sending data (like rowid’s and field values) to and 
from the server.

@code
function calculate(){
    vdf.getForm("orderhead_form").vdfCall("get_Sum", [ 12, 14.4, 11 ], function(oEvent){
        vdf.gui.alert("The server responded with: " + oEvent.sReturnValue);
    });
}
@code

The sample above shows how the 'get_sum' function on the server is called 
displaying the result after the call is finished. Note the handler method is 
defined as an anonymous inline method. This way of defining handler methods can 
keep the code smaller and so easier to read but it can also be experienced as 
difficult and more complex. The example at dbCall method of the vdf.core.Form 
class shows how a normal method can be passed as handler method.
*/
vdfCall : function(sMethod, asParams, fHandler, oEnv){
    var oCall = new vdf.ajax.VdfCall(this.sWebObject,  sMethod, asParams, this.sWebServiceUrl, this.sXmlNS);
    if(typeof(fHandler) == "function"){
        oCall.onFinished.addListener(fHandler, oEnv);
    }
    oCall.send(true);
},
    
    
/*
The dbCall method can be used to call a published method in the Web Object of 
this Form. An  AJAX Call is used to communicate with the server. The AJAX 
Library will take care of the synchronization of the client and server-side data 
buffers before and after this call. Note that this makes the dbCall heavier and 
slower than the vdfCall which doesn’t synchronize the buffers. The call is made 
asynchronously which means that the next line of code will be executed before 
the call is finished. During the call the DD buffers will be locked and other DD 
actions will not be executed.

@code
function duplicateOrder(){
    //  Send a dbCall
    vdf.getForm("orderhead_form").dbCall("get_DuplicateOrder", [ 11, "NONE" ], handleDuplicate);
}
    
//  Handler that is called if the response is finished
function handleDuplicate(oEvent){
    vdf.gui.alert("Server returned response: " + oEvent.sReturnValue);
}
@code

In the sample above the 'get_DuplicateOrder' is called with two parameters 
(11 and "NONE"). The 'handleDuplicate' function is given as a listener that will 
be called if the call is finished.

@param  sMethod     The name of the method (including 'get_' or 'msg_'). 
@param  asParams    Array with the parameters.
@param  fHandler    (optional) Reference to the method that will be called if 
            the response is received.
@param  oEnv        (optional) Reference to the object that will be the 
            environment when the fHandler method is called.
*/
dbCall : function(sMethod, asParams, fHandler, oEnv){
    var tRequestSet, tRow, oAction;
    
    //  TODO:   Add a "has record" check here
    if(this.onBeforeDbCall.fire(this, { sMethod : sMethod, asParams : asParams })){
        oAction = new vdf.core.Action("dbcall", this, this, this.oServerDD, true);
        
        //  Generate request objects & collect fields
        tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
        tRequestSet.sName = "DbCall";
        tRequestSet.sRequestType = "dbcall";
        tRequestSet.iMaxRows = 1;
        tRequestSet.bReturnCurrent = false;
        
        tRequestSet.sMethod = sMethod;
        tRequestSet.asParams = asParams;
        
        tRow = new vdf.dataStructs.TAjaxSnapShot();
        tRequestSet.aRows.push(tRow);
        
        this.oServerDD.crawlAll(function(oDD){
            var iDeo;

            oDD.onUpdate.fire(oDD, { sAction : "dbcall", oAction : oAction } );
            
            //  Lock DD
            oAction.lock(oDD);
            
            //  Visit DEO for update and lock
            for(iDeo = 0; iDeo < oDD.aDEO.length; iDeo++){
                vdf.errors.clearByField(oDD.aDEO[iDeo]);
                oDD.aDEO[iDeo].update();
                oAction.lock(oDD.aDEO[iDeo]);
            }
            
            //  Create snapshot
            tRow.aDDs.push(oDD.createSnapshot());
        });
        
        oAction.addRequestSet(tRequestSet);

        oAction._oContext = {
            fHandler : fHandler,
            oEnv : oEnv,
            sMethod : sMethod,
            asParams : asParams
        };
        
        //  Send request
        oAction.onResponse.addListener(this.handleDbCall, this);
        oAction.send();
    }
},

/*
Handles the delete response by loading the snapshot into the buffer. Note that 
this function works asynchronously!

@param  oEvent  Event object.
@private
*/
handleDbCall : function(oEvent){
    var oAction = oEvent.oSource, tResponseSet, oEventInfo; 

    tResponseSet = (oEvent.tResponseData && oEvent.tResponseData.aDataSets.length > 0 ?  oEvent.tResponseData.aDataSets[0] : null);
    
    oEventInfo = { 
        bError : false, 
        iErrorNr : 0, 
        tResponseSet : tResponseSet ,
        sReturnValue : (tResponseSet ? tResponseSet.sReturnValue : null),
        sMethod : oAction._oContext.sMethod,
        asParams : oAction._oContext.asParams
    };
    
    if(tResponseSet.aRows.length > 0){
        this.oServerDD.loadSnapshot(oEvent.oSource, tResponseSet.aRows[0]);
    }
    if(oEvent.bError){
        oEventInfo.bError = true;
        oEventInfo.iErrorNr = oEvent.iErrorNr;
    }
    
    //  Unlock so the lock's won't block actions done in the onAfterDelete
    oAction.unlock();
      
    //  Call specific handler
    if(typeof(oAction._oContext.fHandler) == "function"){
        oAction._oContext.fHandler.call((oAction._oContext.oEnv ? oAction._oContext.oEnv : null), new vdf.events.JSEvent(this, oEventInfo));
    }
      
    this.onAfterDbCall.fire(this, oEventInfo);
},


// - - - - - - - - - - ACTION FORWARDING - - - - - - - - - - 

/*
Performs a find on this field. The find is performed by the Data Dictionary on 
the fields main index. Note that the find is send asynchronously! If no field is 
given the last active field is used.

@param  sFindMode       Findmode used for the find
@param  oField          Field for the find (optional)
@return True if request is sent
*/
doFind : function(sFindMode, oField){
    try{
        if(typeof oField === "object" && oField.bIsField){
            return oField.doFind(sFindMode);
        }else{
            if(typeof this.oActiveField === "object" && this.oActiveField.bIsField){
                return this.oActiveField.doFind(sFindMode);
            }else{
                throw new vdf.errors.Error(5146, "No active field to perform operation", this);
            }
        }
    }catch (oErr){
        vdf.errors.handle(oErr);
    }
    
    return false;
},

/*
Forwards a findByRowId request to the correct Data Dictionary. Note that this 
action is performed asynchronously!

@param  sTable  Name of the table.
@param  sRowId  Serialized rowid.
@return True if succesfully send.
*/
doFindByRowId : function(sTable, sRowId){
    try{
        sTable = sTable.toLowerCase();
        if(this.oDDs[sTable].bIsDD){
            return this.oDDs[sTable].doFindByRowId(sRowId);
        }    
    }catch (oErr){
        vdf.errors.handle(oErr);
    }
    
    return false;
},

/*
Performs a save. The save is performed on the server DD or on the DD with the 
given name. Note that the save is performed asynchronously.

@param  sTable  (optional) Table to perform the save on.
@return True if save was successfully send.
*/
doSave : function(sTable){
    try{
        if(typeof(sTable) === "string"){
            sTable = sTable.toLowerCase();
            if(this.oDDs[sTable].bIsDD){
                return this.oDDs[sTable].doSave();
            }else{
				throw new vdf.errors.Error(5137, "Table unknown", this, [sTable, "vdf.core.Form(doSave)"]);
            } 
        }else{
            if(typeof this.oActiveField === "object" && this.oActiveField.bIsField){
                return this.oActiveField.doSave();
            }else{
                return this.oServerDD.doSave();
            }
        }
    }catch (oErr){
        vdf.errors.handle(oErr);
    }
    
    return false;
},

/*
Performs a clear. The clear is performed on the server DD or on the DD with the 
given name. Note that the clear is performed asynchronously.

@param  sTable  (optional) Table to perform clear on.
@return True if clear was successfully send.
*/
doClear : function(sTable){
    try{
        if(typeof(sTable) === "string"){
            sTable = sTable.toLowerCase();
            if(this.oDDs[sTable].bIsDD){
                return this.oDDs[sTable].doClear();
            }else{
                throw new vdf.errors.Error(5137, "Table unknown", this, [sTable, "vdf.core.Form(doClear)"]);
            }
        }else{
            if(typeof this.oActiveField === "object" && this.oActiveField.bIsField){
                return this.oActiveField.doClear();
            }else{
                return this.oServerDD.doClear();
            }
        }
    }catch (oErr){
        vdf.errors.handle(oErr);
    }

    return false;
},

/*
Performs a clear all. The clear is performed on the server DD or on the DD with 
the given name. Note that the clear is performed asynchronously.

@param  sTable  (optional) Table to perform clear on.
@return True if clear was successfully send.
*/
doClearAll : function(sTable){
    try{
        if(typeof(sTable) === "string"){
            sTable = sTable.toLowerCase();
            if(this.oDDs[sTable].bIsDD){
                return this.oDDs[sTable].doClearAll();
            }else{
				throw new vdf.errors.Error(5137, "Table unknown", this, [sTable, "vdf.core.Form(doClearAll)"]);
            }
        }else{
            if(typeof this.oActiveField === "object" && this.oActiveField.bIsField){
                return this.oActiveField.doClearAll();
            }else{
                return this.oServerDD.doClearAll();
            }
        }
    }catch (oErr){
        vdf.errors.handle(oErr);
    }

    return false;
},

/*
Performs a delete. The delete is performed on the server DD or on the DD with 
the given name.

@param  sTable  (optional) Table to perform the delete on.
@return True if delete was succesfully send.
*/
doDelete : function(sTable){
    try{
        if(typeof(sTable) === "string"){
            sTable = sTable.toLowerCase();
            if(this.oDDs[sTable].bIsDD){
                return this.oDDs[sTable].doDelete();
            }else{
				throw new vdf.errors.Error(5137, "Table unknown", this, [sTable, "vdf.core.Form(doDelete)"]);
            }
        }else{
            if(typeof this.oActiveField === "object" && this.oActiveField.bIsField){
                return this.oActiveField.doDelete();
            }else{
                return this.oServerDD.doDelete();
            }
        }
    }catch (oErr){
        vdf.errors.handle(oErr);
    }
    
    return false;
}


});