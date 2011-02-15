/*
Name:
    vdf.core.MetaData
Type:
    Prototype


Revisions:
    2008/01/25  Complete rebuild of the meta data system. The data is loaded in
    stages to optimize loading times and is static between the instances so 
    nothing has to be loaded twice. The new version is ready for the 2.0 
    framework system. (HW, DAE)
    2005/10/24  Created the initial meta data system (called VdfInfo) (HW, DAE)
*/

/*
@require    vdf/dataStructs.js
@require    vdf/ajax/SoapCall.js
@require    vdf/ajax/PriorityPipe.js
*/

/*
Static meta data, used by all the instances.

@private
*/
vdf.core.oMetaData = {};

/*
Constructor, initializes the properties and event & pipe objects.

@param  sWebObject      Name of the webobject of which the meta data should be 
            loaded.
@param  sWebServiceUrl  (optional) The url of the web service.
@private
*/
vdf.core.MetaData = function MetaData(sWebObject, sWebServiceUrl, sXmlNS){
    this.sWebObject = sWebObject;
    
    this.oPipe = new vdf.ajax.PriorityPipe(sWebServiceUrl, sXmlNS);
};
/*
Provides the meta data used by the other components. This meta data contains 
the DDO structure of the WO and a lot of fields settings. The loading is done 
on three levels, first the global WO data including the DDO structure is 
loaded, then fields with their basic properties can be loaded and then special 
properties can be loaded.

All the Meta Data is stored in a static variable so it is shared between the 
different instances of the MetaData prototype.

@private
*/
vdf.definePrototype("vdf.core.MetaData", {

/*
Loads the global data (if needed) by sending calling the MetaDataWO webservice 
method.

@param  fHandler    Method called when the loading is finished.
@param  oEnv        (optional)Environment for the handler method.
*/
loadGlobalData : function(fHandler, oEnv){
    var oCall;

    //  Check if meta data for this WO isn't already loaded / loading
    if(vdf.core.oMetaData[this.sWebObject] !== undefined){
        //  If loading we add ourself to the listeners else we call the handler directly
        if(typeof(vdf.core.oMetaData[this.sWebObject].bLoading) === "boolean"){
            vdf.core.oMetaData[this.sWebObject].aWaiting.push({ oEnv : oEnv, fHandler : fHandler });
        }else{
            fHandler.call(oEnv);
        }
    }else{
        //  Create tempolary object with array with handling methods
        vdf.core.oMetaData[this.sWebObject] = { bLoading : true, aWaiting : [ { oEnv : oEnv, fHandler : fHandler } ] };
        
        //  Create and send request
        oCall = new vdf.ajax.JSONCall("MetaDataWO", { sSessionKey : vdf.sys.cookie.get("vdfSessionKey"), sWebObject :  this.sWebObject, sVersion : vdf.sVersion });
        this.oPipe.send(oCall, 3, this.handleGlobalData, this);
    }
},

/*
Handles the response with the global meta data. Checks for errors and maps the 
DDs in the stucture to a "named array" (an object). Then it stores the result.

@param  oEvent  Event object.
*/
handleGlobalData : function(oEvent){
    var i, tResponse = oEvent.oSource.getResponseValue("TAjaxMetaWO"), aWaiting;
    
    //  Check for errors
    if(vdf.errors.checkServerError(tResponse.aErrors, this)){
    
        //  Remap DDs by their name in oDDs
        tResponse.oDDs = { };
        for(i = 0; i < tResponse.aDDs.length; i++){
            tResponse.oDDs[tResponse.aDDs[i].sName] = tResponse.aDDs[i];
            tResponse.aDDs[i].oFields = { };
        }
        
        //  Store result
        aWaiting = vdf.core.oMetaData[this.sWebObject].aWaiting;
        vdf.core.oMetaData[this.sWebObject] = tResponse;

        for(i = 0; i < aWaiting.length; i++){
            aWaiting[i].fHandler.call(aWaiting[i].oEnv);
        }
    }
},

/*
Loads the meta data for the given fields.

@param  aFields     Array with field names.
@param  fHandler    Method called when the loading is finished.
@param  oEnv        (optional)Environment for the handler method.
*/
loadFieldData : function(aFields, fHandler, oEnv){
    var oMeta = this.getMetaData(), oCall, aParts, iField;
    
    //  Remove fields that are already loaded
    if(oMeta !== null){
        for(iField = 0; iField < aFields.length; iField++){
            aFields[iField] = aFields[iField].replace("__", ".").toLowerCase();
            aParts = aFields[iField].split(".");
            if(typeof(oMeta.oDDs[aParts[0]]) !== "undefined" && typeof(oMeta.oDDs[aParts[0]].oFields[aParts[1]]) !== "undefined"){
                aFields.splice(iField, 1);
                iField--;
            }
        }
    }
    
    if(aFields.length > 0){
        //  If fields left send request for these
        oCall = new vdf.ajax.JSONCall("MetaDataFields", { sSessionKey : vdf.sys.cookie.get("vdfSessionKey"), sWebObject : this.sWebObject, "sFields" : aFields.join("|") });
        oCall._fHandler = fHandler;
        oCall._oEnv = oEnv;
        this.oPipe.send(oCall, 2, this.handleFieldData, this);
    }else{
        //  If all already available call "listener"
        fHandler.call(oEnv);
    }
},

/*
Handles the response of the field data request by storing references.

@param  oEvent  Event object.
*/
handleFieldData : function(oEvent){
    var oMeta, tResponse, aFields, iField;
    
    oMeta = this.getMetaData();
    tResponse = oEvent.oSource.getResponseValue("TAjaxMetaFields");
    
    //  Check for errors
    if(vdf.errors.checkServerError(tResponse.aErrors, this)){
        aFields = tResponse.aFields;
        
        //  Push in the right structure
        for(iField = 0; iField < aFields.length; iField++){
            if(!oMeta.oDDs[aFields[iField].sTable].oFields[aFields[iField].sName]){
                oMeta.oDDs[aFields[iField].sTable].oFields[aFields[iField].sName] = aFields[iField];        
            }
        }
        
        oEvent.oSource._fHandler.call(oEvent.oSource._oEnv);
    }
},

/*
Loads a set of properties for a set of fields.

@param  aFields     Array of field names.
@param  aProperties Array of property names.
@param  fHandler    Method called when the loading is finished.
@param  oEnv        (optional)Environment for the handler method.
*/
loadFieldProperties : function(aFields, aProperties, fHandler, oEnv){
    var oCall, iField;
    
    //  Naming convention
    for(iField = 0; iField < aFields.length; iField++){
        aFields[iField] = aFields[iField].replace("__", ".").toLowerCase();
    }
    
    //  Create and send the request
    oCall = new vdf.ajax.SoapCall("MetaDataProperties", { sSessionKey : vdf.sys.cookie.get("vdfSessionKey"), sWebObject : this.sWebObject, "aFields" : aFields, "aProperties" : aProperties});
    oCall._fHandler = fHandler;
    oCall._oEnv = oEnv;
    this.oPipe.send(oCall, 1, this.handleFieldProperties, this);
},

/*
Handles the response of the field properties request by storing the properties 
on the field object and calling the handler method.

@param  oEvent  Event object from the request.
*/
handleFieldProperties : function(oEvent){
    var oMeta, tResponse, iField, tField, iProp, oField;
    
    oMeta = this.getMetaData();
    tResponse = oEvent.oSource.getResponseValue("TAjaxMetaProperties");
    
    //  Check for errors
    if(vdf.errors.checkServerError(tResponse.aErrors, this)){
    
        //  Push in the right structure
        for(iField = 0; iField < tResponse.aFields.length; iField++){
            tField = tResponse.aFields[iField];
            
            //  Find the table object in the data structure
            if(typeof(oMeta.oDDs[tField.sTable]) !== "undefined"){
                if(oMeta.oDDs[tField.sTable].oFields[tField.sField]){
                    oField = oMeta.oDDs[tField.sTable].oFields[tField.sField];
                    
                    //  Add the loaded properties
                    for(iProp = 0; iProp < tField.aProperties.length; iProp++){
                        oField[tField.aProperties[iProp].sProperty] = tField.aProperties[iProp].sValue;
                    }
                        
                }else{
                    throw new vdf.errors.Error(5138, "Unknown field", this, [ tField.sField, tField.sTable, "vdf.core.MetaData(handleFieldProperties)" ]);
                }            
            }else{
                throw new vdf.errors.Error(5137, "Unknown table", this, [ tField.sTable, "vdf.core.MetaData(handleFieldProperties)" ]);
            }
        }
        
        oEvent.oSource._fHandler.call(oEvent.oSource._oEnv);
    }
},


/*
Loads the description values for a field (if needed). The given handler is 
called when the values are available.

@param  sField  Name of the field.
@param  fHandler    Method called when the loading is finished.
@param  oEnv        (optional)Environment for the handler method.
*/
loadDescriptionValues : function(sField, fHandler, oEnv){
    var oCall, sTable, aParts, oCurrent, oMeta;
    
    //  Determine current value
    oMeta = this.getMetaData();

    //  Split field name into table and column
    aParts = sField.replace("__", ".").toLowerCase().split(".");
    sField = aParts[1];
    sTable = aParts[0];

    //  Get current value
    oCurrent = this.getFieldProperty("aDescriptionValues", sTable, sField);
    
    if(oCurrent){
        //  If it is currently loading we register as waiting
        if(oCurrent.hasOwnProperty("bLoading")){
            oCurrent.aWaiting.push({oEnv : oEnv, fHandler : fHandler});
        }else{
            //  Else we directly call the handling function
            fHandler.call(oEnv, oCurrent);
        }
    }else{
        //  Set tempolary object
        if(typeof(oMeta.oDDs[sTable]) !== "undefined"){
            if(oMeta.oDDs[sTable].oFields[sField]){
                oMeta.oDDs[sTable].oFields[sField].aDescriptionValues = { bLoading : true, aWaiting : [ { oEnv : oEnv, fHandler : fHandler } ] };
                
                //  Send request
                oCall = new vdf.ajax.JSONCall("MetaDataDescriptionValues", { sSessionKey : vdf.sys.cookie.get("vdfSessionKey"), sWebObject : this.sWebObject, "sField" : sTable + "." + sField});
                this.oPipe.send(oCall, 1, this.handleDescriptionValues, this);
            }else{
                throw new vdf.errors.Error(5138, "Unknown field", this, [ sField, sTable, "vdf.core.MetaData(loadDescriptionValues)" ]);
            }            
        }else{
            throw new vdf.errors.Error(5137, "Unknown table", this, [ sTable, "vdf.core.MetaData(loadDescriptionValues)" ]);
        }
    }
},

/*
Handles the response of the description values request by storing the 
description values in the aDescriptionValues property of the field. The 
description values are given as a parameter to the handler method.

@param  oEvent  Event object from the soapcall.
*/
handleDescriptionValues : function(oEvent){
    var oMeta, tResponse, oLoading, iHandler;
    
    oMeta = this.getMetaData();
    tResponse = oEvent.oSource.getResponseValue("TAjaxMetaDescriptionValues");
    
    
    oLoading = oMeta.oDDs[tResponse.sTable].oFields[tResponse.sField].aDescriptionValues;
    oMeta.oDDs[tResponse.sTable].oFields[tResponse.sField].aDescriptionValues = tResponse.aValues;
    
    if(oLoading.hasOwnProperty("bLoading")){
        for(iHandler = 0; iHandler < oLoading.aWaiting.length; iHandler++){
            oLoading.aWaiting[iHandler].fHandler.call(oLoading.aWaiting[iHandler].oEnv, tResponse.aValues);
        }
    }
},

/*
@param  sProp   Name of the requested property
@return Property value (null if not found)
*/
getGlobalProperty : function(sProp){
    return this.getMetaData()[sProp];
},

/*
@param  sProp   Name of the requested property
@param  sTable  Name of the table
@return  Value of the requested property (null if not found)
*/
getDDProperty : function(sProp, sTable){
    var oMeta = this.getMetaData();
    
    if(typeof(oMeta.oDDs[sTable]) !== "undefined"){
        return oMeta.oDDs[sTable][sProp];
    }
    
    return null;
},

/*
@param  sProp   Name of the requested property.
@param  sTable  Name of the table.
@param  sField  (optional) Name of the field, if not given sTable should contain 
            <table>__<field>.
@return  Value of the requested field property (null if not found)
*/
getFieldProperty : function(sProp, sTable, sField){
    var oMeta = this.getMetaData(), sResult = null;
    
    if(typeof(sField) == "undefined"){
        var aParts = sTable.replace("__", ".").split(".");
        sField = aParts[1];
        sTable = aParts[0];
    }
    
    if(typeof(oMeta.oDDs[sTable]) !== "undefined"){
        if(typeof(oMeta.oDDs[sTable].oFields[sField]) !== "undefined"){
            sResult = oMeta.oDDs[sTable].oFields[sField][sProp];
            
            if(typeof(sResult) == "undefined"){
                sResult = null;
            }
        }
    }
    
    return sResult;
},


/*
@private

@return  The meta data object for the WO this instance is assigned to.
*/
getMetaData : function(){
    var oMeta = vdf.core.oMetaData[this.sWebObject];
    
    if(typeof(oMeta) !== "undefined"){
        return oMeta;
    }
    
    return null;
}

});
