/*
Name:
    vdf.ajax.HttpRequest
Type:
    Prototype
    
Revisions:
    2008/01/15  Restructured into the new namespacing system with the new 
    notation. Moved the soap functionallity to the SoapCall prototype to 
    simplify the usage. (HW, DAE)
    2006/04/24  Upgraded the object with the inline method trick for the 
    onreadystatechange event so the buggy ugly global array sollution isn't 
    necessary any more. (HW, DAE)
    2005/08/15  Created the first version using the array to reference back to 
    object sending the call. (HW, DAE)
*/

/*
@require    vdf/ajax/RequestQueue.js
*/

/*
@private
*/
vdf.ajax.REQUEST_STATE_UNITIALIZED  = 0;
/*
@private
*/
vdf.ajax.REQUEST_STATE_LOADING      = 1;
/*
@private
*/
vdf.ajax.REQUEST_STATE_LOADED       = 2;
/*
@private
*/
vdf.ajax.REQUEST_STATE_INTERACTIVE  = 3;
/*
@private
*/
vdf.ajax.REQUEST_STATE_COMPLETE     = 4;

/*
Constructor creating the properties and initializing them with the given 
attributes.

@param  sUrl    The requested URL.
@param  sData   (optional) String with post data.
*/
vdf.ajax.HttpRequest = function HttpRequest(sUrl, sData){
    if(typeof(sData) === "undefined"){
        sData = null;
    }
    //  Public
    /*
    The URL to which the request is send. Might be relative to the URL of the 
    page.
    */
    this.sUrl = sUrl;
    /*
    If not null this string is send as POST data with the request.
    */
    this.sData = sData;
    /*
    Determines wether the request is send synchronous or asynchronously.
    */
    this.bAsynchronous = true;

    //  Events
    /*
    Called after the response is received. The event object has the 
    sResponseText and the oResponseXml properties that contain the response 
    text and XML.
    
    @prop oResponseXml  Reference to the XML DOM that contains the response.
    @prop sResponseText String with the response text.
    */
    this.onFinished = new vdf.events.JSHandler();
    /*
    Called if an error occured. The event object has the oError object that 
    contains the error object. If the event is stopped the error is not given 
    to the error handling system.
    
    @prop oError    Reference to the error object.
    */
    this.onError = new vdf.events.JSHandler();
    
    // @privates
    this.onClose = new vdf.events.JSHandler();
    
    this.oLoader = null;
};
/*
A basic wrapper for the XmlHttpRequest object. It contains basic functionality 
for sending a HttpRequest using the XmlHttpRequest object. Performs first error 
checks and fires a onFinished event if finished. 

Usage example:
@code
function requestTestData(){
    var oRequest = new vdf.ajax.HttpRequest("TestData.txt", null);
    oRequest.onFinished.addListener(handleTestData);
    oRequest.send(true);
}
function handleTestData(oEvent){
    alert(oEvent.sResponseText);
}
@code
*/
vdf.definePrototype("vdf.ajax.HttpRequest", {

/*
Sends the AJAX request. If the response is received and after error checking 
the onFinished event is fired.

Note that Asynchronous calls might not be send directly because the AJAX 
Library by default limits the amount of concurrent calls.

@param  bAsynchronous   If true the request is made asynchronously.
*/
send : function(bAsynchronous){
    if(typeof bAsynchronous === "boolean"){
        this.bAsynchronous = bAsynchronous;
    }

    if(vdf.ajax.oDefaultQueue && this.bAsynchronous){
        vdf.ajax.oDefaultQueue.send(this);
    }else{
        this.communicate();
    }
},

/*
Performs the actual communication.

@private
*/
communicate : function(){
    var oXmlRequest = this, sData;
    this.oLoader = vdf.sys.xml.getXMLRequestObject();
    sData = this.getData();

    //  If asynchronousattach onreadystatechange function (if synchronous it
    //  is called mannualy)
    if(this.bAsynchronous){
        this.oLoader.onreadystatechange = function(){
            oXmlRequest.onReadyStateChange.call(oXmlRequest);
        };
    }

    //  Open connection, set headers, send request
    this.oLoader.open((sData) ? "POST" : "GET", this.getRequestUrl(), this.bAsynchronous);
    this.setHeaders(this.oLoader);
    this.oLoader.send(sData);
    
    //  If synchronous request call readyStateChange manually (IE won't do 
    //  it)
    if(!this.bAsynchronous){
        this.onReadyStateChange();
    }
},

/*
Called if the readystate of the XmlRequest object changes when the request is 
send asynchrone. If the request is send synchrone this method is called 
manually. The method checks the readyState of the XmlRequest object, calls the 
checkErrors method and fires the onFinished even.

@private
*/
onReadyStateChange : function(){
    var oRequest = this;

    try{
        if(this.oLoader.readyState == vdf.ajax.REQUEST_STATE_COMPLETE){
            if(this.oLoader.status > 0){    //  Scary check but it prevents firefox from throwing the could not parse XML error on page load
                this.onClose.fire(this);
            
                this.checkErrors();
                
                this.onFinished.fire(this, this.getFinishedDetails());
                
                //  Set a timeout to destroy this object
                setTimeout(function(){
                    oRequest.destroy();
                }, 1000);
            }
        }
    }catch (e){
        if(this.onError.fire(this, { oError : e })){
            vdf.errors.handle(e);
        }
    }
    
},

/*
Creates the event object that is fired with the onFinished event.

@private
@return Object with onFinished event information.
*/
getFinishedDetails : function(){
    return { oResponseXml : this.getResponseXml(), sResponseText : this.getResponseText() };
},

/*
Checks if any errors occurred while sending the request using its status 
property.

@param  bSkip500    (optional) If true no error is given on status 500 (some 
                    subclasses can give more detailed information on this error)
@private
*/
checkErrors : function(bSkip500){
    if(this.oLoader.status >= 300 && (!bSkip500 || this.oLoader.status != 500)){
        var aDetails, sDetailHtml = this.oLoader.responseText; 
        
        //  We strip out anything above and below the body element, then we remove style and script elements...
        sDetailHtml = sDetailHtml.replace(/(^(.|\n|\r)*<body.*?>)|(<\/body>(.|\n|\r)*$)/gi, "");
        sDetailHtml = sDetailHtml.replace(/<style(.|\n|\r)*\/style>/gi, "");
        sDetailHtml = sDetailHtml.replace(/<script(.|\n|\r)*\/script>/gi, "");
        
        aDetails = [
            "<b>Target:</b> ", this.sUrl, "<br/>",
            "<b>Full URL:</b> ", this.getRequestUrl(), "<br/>",
            "<b>Status code:</b> ", this.oLoader.status, "<br/>",
            "<b>Status text:</b> ", this.oLoader.statusText, "<br/>",
            "<br />",
            "<hr />",
            sDetailHtml
        ];
        
        throw new vdf.errors.Error(5120, "Received HTTP error", this, [this.oLoader.status, this.oLoader.statusText, this.sUrl], aDetails.join(""));
    }
},

/*
Sets the "custom" headers for the call. Currently empty, we might add custom 
header functionality tot the HttpRequest later.

@param  oLoader Reference to the XmlHttpRequest object.
@private
*/
setHeaders : function(oLoader){
    
},

/*
If a relative URL is given this URL is made absolute using the value of the 
addressbar (window.location.pathname).

@return The complete URL to which the request is send.
*/
getRequestUrl : function(){
    var sPath, iPos;
    
    //  Dynamically find the path to post the data to
    if(this.sUrl.substr(0,7).toLowerCase() != "http://"){
        
        //  Fetch current path (without file)
        sPath = window.location.pathname;
    
        //  In IE modal dialogs the pathname wont start with "/"
        if(sPath.substr(0, 1) != "/"){
            sPath = "/" + sPath;   
        }
        iPos = sPath.lastIndexOf("/");
        if (iPos >= 0){
            sPath = sPath.substring(0, iPos);
        }
        
        //  Create request url
        if (this.sUrl.substr(0, 1) != "/"){
            return sPath + "/" + this.sUrl ;
        }else{
            return sPath + this.sUrl;
        }
    }
    
    return this.sUrl;
},

/*
@return The XML document containing the response XML (null if not valid XML).
*/
getResponseXml : function(){
    return this.oLoader.responseXML;
},

/*
@return String containing the response text.
*/
getResponseText : function(){
    return this.oLoader.responseText;
},

/*
@return The this.sData string, used to make it overloadable.
@private
*/
getData : function(){
    return this.sData;
},

/*
Cancels the request. Note that cancelling requests is dangerous! You don't know 
exactly if the server will still handle the request or not. Never use this on 
requests that manipulate data!
*/
cancel : function(){
    if(this.oLoader !== null){
        this.onClose.fire(this);
        
        this.oLoader.onreadystatechange = function(){ };
        this.oLoader.abort();
        this.oLoader = null;
    }else if(vdf.ajax.oDefaultQueue && this.bAsynchronous){
        vdf.ajax.oDefaultQueue.removeCall(this);
    }
    
    this.onFinished.aListener = [];
},

/*
This method clears the loader object of the call to prevent memory leaking. It 
is called automatically by the handling methods of the call after a timeout of a 
second.
*/
destroy : function(){
    try{
        if(this.oLoader && this.oLoader.onreadystatechange){
            this.oLoader.onreadstatechange = null;
        }
    }catch(oErr){
    
    }
    this.oLoader = null;
}

});

vdf.require("vdf.ajax.RequestQueue", function(){
    /*
    The default queue that (if set) is used for all requests. By default the 
    vdf.ajax.RequestQueue is used with the vdf.settings.iAjaxConcurrencyLimit as 
    limit to the amount of concurrent calls. This is done to limit the amount of 
    stress one user can cause on the server.
    */
    vdf.ajax.oDefaultQueue = new vdf.ajax.RequestQueue((typeof vdf.settings.iAjaxConcurrencyLimit === "number" ? vdf.settings.iAjaxConcurrencyLimit  : 1));
    
    setTimeout(function(){
        /*
        @skip
        */
        vdf.ajax.oDefaultQueue.iLimit = (typeof vdf.settings.iAjaxConcurrencyLimit === "number" ? vdf.settings.iAjaxConcurrencyLimit  : 1);
    }, 100);
});