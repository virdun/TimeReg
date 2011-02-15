/*
Name:
    vdf.ajax.PriorityPipe
Type:
    Prototype

Revisions:
    2008/01/23  Created the initial version (HW, DAE)
*/

/*
Constructor that initializes the properties.

@param  sUrl    (optional)URL that is set to all requests send through the pipe.
@param  sXmlNS  (optional) XML namespace set to all requests send through the pipe.
*/
vdf.ajax.PriorityPipe = function PriorityPipe(sUrl, sXmlNS){
    // @publics
    /*
    If set this URL is set to all the calls that are send using this pipe.
    */
    this.sUrl = sUrl;
    /*
    If set this XML namespace is set to all calls that are send using this pipe.
    */
    this.sXmlNS = sXmlNS;
    
    // @privates
    this.aQueue = [];
};
/*
The prioritypipe can be seen as a pipe to the server where requests can't 
overtake requests with a higher priority. To do this all requests that are send 
are stored in a queue and the handling method checks wether the "real" handling 
method can be called. Another behavior of the pipe is that it automatically 
sets the url and namespace for the request.

An usage example is the MetaData object where problems would occur if requests 
for field data would overtake requests for the wo data.
*/
vdf.definePrototype("vdf.ajax.PriorityPipe", {

/*
Adds the call to the queue and makes sure it is send.

@param  oCall       The request (SoapCall / VdfCall / HttpRequest).
@param  iPriority   Priority of the request.
@param  fHandler    Function called when the response is received.
*/
send : function(oCall, iPriority, fHandler, oEnv){
    var oRequest;
    
    oRequest = { oCall : oCall, iPriority : iPriority, fHandler : fHandler, oEnv : oEnv };
    

    //  Do settings if needed
    if(this.sUrl !== null && typeof(this.sUrl) !== "undefined"){
        oCall.sUrl = this.sUrl;
    }
    if(this.sXmlNS !== null && typeof(this.sXmlNS) !== "undefined"){
        oCall.sXmlNS = this.sXmlNS;
    }
    
    oCall.onFinished.addListener(this.onResponse, this);
    this.aQueue.push(oRequest);
    oCall._oRequest = oRequest;
    oCall.send(true);
},

/*
Handles the onFinished event of the request. It sets the bFinished of the 
request that is finished to true and loops through the queue and calls the 
handlers for all the requests that are finished. 

@param  oEvent  Event object containing a reference to the request object.
@private
*/
onResponse : function(oEvent){
    var i, iHigh = 0, oRequest = oEvent.oSource._oRequest;
    
    //  Current request is finished
    oRequest.bFinished = true;
    oRequest.oEvent = oEvent;
    
    //  Loop through the queue
    for(i = 0; i < this.aQueue.length; i++){
        //  If the priority isn't lower than the highest priority seen call the handler and remove from the queue
        if(this.aQueue[i].bFinished && this.aQueue[i].iPriority >= iHigh){
            this.aQueue[i].fHandler.call(this.aQueue[i].oEnv, this.aQueue[i].oEvent);
            this.aQueue.splice(i, 1);
            i--;
        }
        //  Remember the highest priority
        if(i >= 0 && iHigh < this.aQueue[i].iPriority){
            iHigh = this.aQueue[i].iPriority;
        }
    }
}


});