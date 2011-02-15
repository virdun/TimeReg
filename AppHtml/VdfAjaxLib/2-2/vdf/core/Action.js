/*
Name:
    vdf.core.Action
Type:
    Prototype
Revisions:
    2008/10/28  Created the initial version. (HW, DAE)  
*/

/*
Constructor of the action object that takes the initial set of information.

@param  sMode           The request ("find"/"save"/"clear"/"delete").
@param  oForm           Reference to the vdf.core.Form object.
@param  oInitiator      Object that initiated the action.
@param  oMainDD         Reference to the mainDD.
@param  bLockExclusive  If true the objects are locked exclusively.
*/
vdf.core.Action = function(sMode, oForm, oInitiator, oMainDD, bLockExclusive){
    /*
    Type of action ("find"/"save"/"clear"/"delete").
    */
    this.sMode = sMode;
    /*
    Reference to the vdf.core.Form object.
    */
    this.oForm = oForm;
    /*
    Reference to the main data dictionary for the action.
    */
    this.oMainDD = oMainDD;
    /*
    Object that initiated the action.
    */
    this.oInitiator = oInitiator;
    /*
    If true the involved objects are locked exclusively.
    */
    this.bLockExclusive = (bLockExclusive);
    /*
    Fires if the response is received from the server.
    */
    this.onResponse = new vdf.events.JSHandler();
    /*
    Fires if the action is finished and the response is handled.
    */
    this.onFinished = new vdf.events.JSHandler();
    
    //  @privates
    this.oRequest = null;    
    this.aLocked = [];
    this.tRequestData = new vdf.dataStructs.TAjaxRequestData();
    
    this.oLockAnim = null;
    this.oUnlockAnim = null;
};
/*
Represents an action that is performed on the server by the DDs or the List. It 
stores information about the request, calls the handlers and keeps track of the 
locking.

@private
*/
vdf.definePrototype("vdf.core.Action", {

/*
Adds a requestset to the action.

@param  tRequestSet     Data object of the type vdf.dataStructs.TAjaxRequestSet.
*/
addRequestSet : function(tRequestSet){
    this.tRequestData.aDataSets.push(tRequestSet);
},

/*
Locks the object for the action.

@param  oObject     Reference to the object (usually DD or DEO)
@return True if the object is locked succesfully.
*/
lock : function(oObject){
    if(oObject.lock(this.bLockExclusive, this) === false){
        this.bLockSucceeded = false;
        return false;
    }else{
        this.aLocked.push(oObject);
        return true;
    }
},

/*
Unlocks all the objects that where involved with the action. It also clear the 
list of locked objects so calling it multiple times won't cause negative lock 
counters.
*/
unlock : function(){
    var iObj;
    
    for(iObj = 0; iObj < this.aLocked.length; iObj++){
        this.aLocked[iObj].unlock(this.bLockExclusive, this);
    }
    
    this.aLocked = [];
    
    if(this.oUnlockAnim){
        this.oUnlockAnim.run();
    }
},

addLockAnim : function(oSet){
    if(!this.oLockAnim){
        this.oLockAnim = new vdf.sys.fx.Animation({});
    }
    this.oLockAnim.addSet(oSet);
},

addUnlockAnim : function(oSet){
    if(!this.oUnlockAnim){
        this.oUnlockAnim = new vdf.sys.fx.Animation({});
    }
    this.oUnlockAnim.addSet(oSet);
},

/*
Sends the action request to the server using a vdf.ajax.SoapCall and the 
settings from the vdf.core.Form object.
*/
send : function(){
    if(!this.bLockSucceeded){
                
        if(this.oLockAnim){
            this.oLockAnim.run();
        }
    
        //  Gather data
        this.tRequestData.sSessionKey = vdf.sys.cookie.get("vdfSessionKey");
        this.tRequestData.sWebObject = this.oForm.sWebObject;
        this.tRequestData.aUserData = this.oForm.getUserData();
        
        this.oRequest = new vdf.ajax.SoapCall("Request", { "tRequestData" : this.tRequestData }, this.oForm.sWebServiceUrl, this.oForm.sXmlNS);
        this.oRequest.onFinished.addListener(this.handleRequest, this);
        this.oRequest.onError.addListener(this.onRequestError, this);
        this.oRequest.send(true);
    }else{
        alert("Locked! Sorry!");
        this.unlock();
    }
},

/*
Handles the request response. It fires the onResponse and onFinished events 
with the request data and makes sure that all errors are given to the error 
system. It also makes sure that the locks are cleared.

@param  oEvent  Event object.
*/
handleRequest : function(oEvent){
    var iError, oEventInfo, tResponseData = oEvent.oSource.getResponseValue("TAjaxResponseData");
    
    oEventInfo = {
        bError : false, 
        iErrorNr : 0, 
        tResponseData : tResponseData, 
        oInitiator : this.oInitiator
    };
    
    try{
        if(tResponseData.aErrors.length === 0){
            this.oForm.setUserData(tResponseData.aUserData);
        }else{
            for(iError = 0; iError < tResponseData.aErrors.length; iError++){
                vdf.errors.handle(vdf.errors.createServerError(tResponseData.aErrors[iError], this.oForm));
            }
            
            oEventInfo.bError = true;
            oEventInfo.iErrorNr = tResponseData.aErrors[0].iNumber;
        }
        
        this.onResponse.fire(this, oEventInfo);
        
        //  Unlock if the onResponse didn't do that..
        if(this.aLocked.length > 0){
            this.unlock();
        }
        
        this.onFinished.fire(this, oEventInfo);
    }catch(oError){
        vdf.errors.handle(oError);
        this.unlock();
    }
},

/*
Handles the onError event which is called if an error occurs. It makes sure the 
components are unlocked.

@param  oEvent  Event object.
*/
onRequestError : function(oEvent){
    var oEventInfo = {
        bError : true, 
        iErrorNr : oEvent.oError.iErrorNr, 
        tResponseData : null, 
        oInitiator : this.oInitiator
    };


    this.onResponse.fire(this, oEventInfo);
    this.unlock();
    this.onFinished.fire(this, oEventInfo);
},

/*
Cancels the request action and unlocks the involved objects.
*/
cancel : function(){
    if(this.oRequest !== null){
        this.oRequest.cancel();
        this.oRequest = null;
        this.unlock();
    }
}

});