/*
Name:
    vdf.ajax.SoapCall
Type:
    Prototype
Extends:
    vdf.ajax.HttpRequest

Revisions:
    2009/06/03  Created the JSONCall based on the SoapCall and the new 
    jsonSerializer which calls the VDF 2009 JSON webservices. (HW, DAE)
    2008/01/16  Created the initial prototype with functionallity from the old 
    XmlRequest object which covered the SoapCall and the HttpRequest 
    functionallity in the 1.x versions. (HW, DAE)
*/

/*
@require    vdf/ajax/HttpRequest.js
@require    vdf/ajax/jsonSerializer.js
*/

/*
Constructor that initializes the settings with the given values.

@param  sFunction   The name of the webservice method that should be called.
@param  oParams     Object with the parameters { <param1> : <value>, <param2>, 
                    <value>}.
@param  sUrl        (default: WebService.wso) Url to the webservice.
*/
vdf.ajax.JSONCall = function SoapCall(sFunction, oParams, sUrl){
    if(typeof(sUrl) == "undefined" || sUrl === null){
        sUrl = "WebService.wso";
    }
    this.HttpRequest(sUrl);
    
    /*
    The webservice function that should be called.
    */
    this.sFunction = sFunction;
    /*
    Object with the function parameters. The property names should match the 
    parameter names.
    */
    this.oParams = ((oParams) ? oParams : {});
    /*
    If set to false a GET request will be made instead of a POST request. It is 
    advised to use POST requests due to limitation in the amount and length of 
    parameters that can be passed in the URL.
    */
    this.bUsePOST = true;
    /*
    If set to false the URL won't be extended with the "methodname/JSON" part. 
    The "methodname/JSON" part is added to the URL since Visual DataFlex web 
    services respond with JSON instead of SOAP if "methodname/JSON" is added.
    */
    this.bExtendURL = true;
};
/*
This class contains the functionality to send an AJAX JSON call to the server. 
It does this according to the standards of the Visual DataFlex JSON services. 
Usually a http POST is made which means that the parameters are added to the 
body of the request but it can also be switched to GET which will add the 
parameters to the URL. Note that only primitive types can be used as parameters. 
This means that only string, integer and boolean types are supported. The return 
value can be a complex type and will be deserialized into an object structure. 
When complex parameters are required the vdf.ajax.SoapCall class should be used 
to send the call.

The choice between vdf.ajax.SoapCall, vdf.ajax.VdfCall and vdf.ajax.JSONCall 
should depend on the type and amount of data that needs to be send and received 
from the server. The vdf.ajax.VdfCall is easier to use but is limited to simple 
types and isn't usable for larger amounts of data. The vdf.ajax.JSONCall is 
faster when receiving larger amounts of data but isn't able send complex data 
types. The vdf.ajax.SoapCall can send and receive complex data types.

Server (inside Web Service Object):
@code
Struct TCarInfo
    String sFullName
    Integer iHorsePower
    String sEngine
End_Struct


{ Published = True  }
{ Description = ""  }
Function CarDetails String sBranch String sType Returns TCarInfo
    TCarInfo tResult
    
    If (sBranch = "BMW" and sType = "X5") Begin
        Move "BMW X5" to tResult.sFullName
        Move 153 to tResult.iHorsePower
        Move "V8 3.0L" to tResult.sEngine
    End
    
    Function_Return tResult
End_Function
@code

Client:
@code
function loadCarDetails(sBranch, sType){
    var oCall;
    
    oCall = new vdf.ajax.JSONCall("AutoDetails");
    oCall.addParam("sBranch", sBranch);
    oCall.addParam("sType", sType);
    oCall.onFinished.addListener(handleCarDetails);
    oCall.send(true);
}

function handleCarDetails(oEvent){
    var oResult = oEvent.oSource.getResponseValue();
    
    if(oResult.sFullName !== ""){
        alert("Car " + oResult.sFullName + " has a " + oResult.sEngine + " with " + String(oResult.iHorsePower) + "HP");
    }else{
        alert("Car not found!");
    }
}

loadCarDetails('BMW', 'X5');
@code
*/
vdf.definePrototype("vdf.ajax.JSONCall", "vdf.ajax.HttpRequest", {

/*
Adds a parameter for the function call. Note that we can only use simple values 
which are all send as string.

@param  sName   Name of the parameter.
@param  sValue  Value of the parameter.
*/
addParam : function(sName, sValue){
    this.oParams[sName] = sValue;
},

/*
Augments the setHeaders method with the functionality that sets the 
"Content-Type" header to "application/x-www-form-urlencoded" when the call is 
made as a POST request.

@param  oLoader     Reference to the XmlHttpRequest object.
@private
*/
setHeaders : function(oLoader){
    this.HttpRequest.prototype.setHeaders.call(this, oLoader);

    if(this.bUsePOST){
        oLoader.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
},

/*
Overrides the orrigional method of HttpRequest 

@private
*/
getData : function(){
    var sParam, aParams = [];

    if(this.bUsePOST){
        //  Append parameters
        for(sParam in this.oParams){
            if(this.oParams.hasOwnProperty(sParam)){
                if(aParams.length > 0){
                    aParams.push("&");
                }
                aParams.push(encodeURIComponent(sParam));
                aParams.push("=");
                aParams.push(encodeURIComponent(String(this.oParams[sParam])));
            }
        }
        
        return aParams.join("");
    }else{
        return null;
    }
},

/*
Augments the getRequestUrl with the functionallity that adds the parameters and 
the /JSON extension.

@return The complete URL to which the request is send.
*/
getRequestUrl : function(){
    var sUrl, sParam, aParams = [];
    
    //  Call super method for start URL
    sUrl = this.HttpRequest.prototype.getRequestUrl.call(this);
    
    //  Append /JSON
    if(sUrl.indexOf("/JSON") >= 0){
        sUrl = sUrl.replace("/JSON", "/" + this.sFunction + "/JSON");
    }else{
        if(sUrl.indexOf("?") >= 0){
            sUrl = sUrl.replace("?", "/" + this.sFunction + "/JSON");
        }else{
            sUrl = sUrl + (sUrl.charAt(sUrl.length - 1) !== "/" ? "/" : "") + this.sFunction + "/JSON";
        }
    }
    
    if(!this.bUsePOST){
        //  Append parameters
        for(sParam in this.oParams){
            if(this.oParams.hasOwnProperty(sParam)){
                aParams.push((aParams.length <= 0 && sUrl.indexOf("?") < 0 ? "?" : "&"));
                aParams.push(encodeURIComponent(sParam));
                aParams.push("=");
                aParams.push(encodeURIComponent(String(this.oParams[sParam])));
            }
        }
    
        //  Return the url
        return sUrl + aParams.join("");
    }else{
        return sUrl;
    }
},

/*
Override getResponseXml to return null.

@return null
*/
getResponseXml : function(){
    return null;
},

/*
Checks if the webservice returned any errors after calling the checkErrors 
method from the super prototype.

@return True if no errors are found.
@private
*/
checkErrors : function(){
    this.HttpRequest.prototype.checkErrors.call(this);

    //  TODO:   Probably check JSON here?
},

/*
Searches the result node in the response and deserializes the value into 
objects.

@return Object presentation of the response.
*/
getResponseValue : function(){
    var sJSON = this.getResponseText();
    
    
    return vdf.ajax.jsonSerializer.deserialize(sJSON);
}

});