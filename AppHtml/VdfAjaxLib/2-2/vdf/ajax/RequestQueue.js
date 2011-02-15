/*
Name:
    vdf.ajax.RequestQueue
Type:
    Prototype

Revisions:
    2009/02/02  Created the initial version (HW, DAE)
*/

/*
Constructor that initializes the properties.

@param  iLimit  (optional) Maximum ammount of simultanious AJAX calls.
*/
vdf.ajax.RequestQueue = function RequestQueue(iLimit){
    // @public
    /*
    The maximum amount of simultanious sent AJAX calls (0 is unlimited).
    */
    this.iLimit = (iLimit || 0);
    
    // @private
    this.iCurrent = 0;
    this.aQueue = [];
};
/*
The request queue is used for queueing AJAX calls before they are send to the 
server. Using the queue the ammount of calls that are sent at the same time can
be limited. This limits the maximum amount of sessions that are used by VDF 
webapp server (when working with it). This limit can be nessecary to reduce 
the server load and to prevent concurrency.
*/
vdf.definePrototype("vdf.ajax.RequestQueue", {

/*
Adds a request to the queue and checks if any requests can be send immediately.

@param  oCall   HttpRequest (or a subclass) object.
*/
send : function(oCall){
    this.aQueue.push(oCall);
    this.determineSend();
},

/*
Handles the onClose event of the HttpRequest object that is called immediately 
after a response is received.

@params  oEvent  Event object.
@private
*/
onClose : function(oEvent){
    oEvent.oSource.onClose.removeListener(this.onClose);
    this.iCurrent--;
    this.determineSend();
},

/*
Removes a call from the queue (before it is send) so it won't be send any more.

@param  oCall   Reference to the AJAX call.
@private
*/
removeCall : function(oCall){
    var iCall;
    
    for(iCall = 0; iCall < this.aQueue.length; iCall++){
        if(this.aQueue[iCall] === oCall){
            this.aQueue.splice(iCall, 1);
            return;
        }
    }
},

/*
Determines if a new request can be send and if so it sends this request.

@private
*/
determineSend : function(){
    var oCall;

    while(this.aQueue.length > 0 && (this.iCurrent < this.iLimit || this.iLimit <= 0)){
        oCall = this.aQueue.shift();
        this.iCurrent++;
        oCall.onClose.addListener(this.onClose, this);
        oCall.communicate();
    }
}


});