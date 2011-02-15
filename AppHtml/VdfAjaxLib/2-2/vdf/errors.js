/*
Name:
    vdf.errors
Type:
    Library (object)

Contains:
    vdf.errors.Error
    vdf.errors.FieldError
Revisions:
    2008/01/15  Restructured into the new namespacing and moved functionality 
                back into the Error object. (HW, DAE)
    2007/08/17  Added the try, throw & catch meganism and made global (HW, DAE)
    2006/03/05  Restructured and made compatible with the new error class. 
                (HW,DAE)
    2005/11/11  Created the error meganism displaying field & global errors in 
                a dynamic way. (RT, DAE)
*/

/*
@require    vdf/gui/Balloon.js
@require    vdf/events.js
*/

/*
Handles the errors for the AJAX Library in default and dynamic way. It works 
with error objects that can be thrown using the try, catch, & throw 
construction. The error objects contains the error information and have the 
functionality to display & hide themselves. The Error object represents an 
global error that is displayed in a dialog. The FieldError represents an error 
that is displayed in the page using an error marker that can be any element 
containing the CSS class fieldError and the id "<sDataBinding>__error". 

Difference with normal error systems is that this errors in this system can be
cleared. This is usually the case with field errors. These errors apply until 
the value is rechecked and the errors doesn't apply any more. Advantage is that
the error can be displayed in the page using the error markers and is removed 
when it doesn't apply any more.

Errors are catched by:
@code
try{
    ....
}catch(oError){
    vdf.errors.handle(oError);
}
@code

Errors are thrown like:
@code
throw new vdf.errors.Error(200, "Short description", this);
throw new vdf.errors.FieldError(200, "Short description", oVdfField, this);
@code
Reporting without breaking out of the code:
@code
vdf.errors.handle(new VdfError(200, "Short description", this));
@code
*/
vdf.errors = {

/*
The CSS class set to fields on which an error occurs.
*/
sCSS : "fieldError",

/*
Global error handling method. Makes sure error messages are displayed.

@param  oError  Error object representing the occurred error.
*/
handle : function(oError){
    var bHandle = true, oField, bFieldError;
    
    //  Forward unknown errors (throw them again)
    if(typeof(oError.message) !== "undefined" || typeof(oError.description) !== "undefined"){
        bHandle = false;
        throw oError;
    }
    
    oField = oError.oField;
    bFieldError =(oField && oField.bIsDEO ? true : false);
        
    if(vdf.errors.onError.fire(oError.oSource, { oError : oError, bFieldError : bFieldError })){
        
        //  Field errors are displayed a bit different by default ;)
        if(bFieldError){
            if(!oField.oErrorDisplay){
                oField.oErrorDisplay = new vdf.errors.FieldErrorDisplay(oField);
            }
            
            oField.oErrorDisplay.addError(oError);
        }else{
            oError.display();
        }
    }
},


/*
Clears all errors with the given number on the given field.

@param  iErrorNr   Number of the errors.
@param  oField     The field on which the error occurred.
*/
clear : function(iErrorNr, oField){
    if(oField.oErrorDisplay){
        oField.oErrorDisplay.clearByNr(iErrorNr);
    }
},


/*
Clears all errors on the given field.

@param  oField  The field object.
*/
clearByField : function(oField){
    if(oField.oErrorDisplay){
        oField.oErrorDisplay.clearAll();
    }
},

/*
Handles the errors that are in the array.

@param  aArray  Array with server errors.
@param  oSource Reference to the object in which the error occurred.
@return True if no errors where given.
*/
checkServerError : function(aArray, oSource){
    var i;
    
    for(i = 0; i < aArray.length; i++){
        this.handle(this.createServerError(aArray[i], oSource));
    }
    
    return (aArray.length === 0);
},


/*
Creates a new error object based on the error information struct 
(vdf.dataStructs.TAjaxError).

@param  tErrorInfo  Object with the error information
@param  oSource     Reference to the object in which the error occurred.
@return Error object with the error info given.
*/
createServerError : function(tErrorInfo, oSource){
    var oForm, oField;
    
    if(tErrorInfo.sColumnName !== "" && tErrorInfo.sTableName !== "" && vdf.isAvailable("vdf.core.Form")){
        if(oSource){
            if(oSource.bIsForm){
                oForm = oSource;
            }else if(typeof oSource.getForm === "function"){
                oForm = oSource.getForm();
            }else if(oSource.oForm){
                oForm = oSource.oForm;
            }else if(oSource.eElement){
                oForm = vdf.core.findForm(oSource.eElement);
            }
        }
        
        if(oForm && oForm.bIsForm){
            oField = oForm.getDEO(tErrorInfo.sTableName + "." + tErrorInfo.sColumnName);
            
            if(oField){
                return new vdf.errors.FieldError(tErrorInfo.iNumber, tErrorInfo.sErrorText, oField, null, true);
            }
        }
    }
   
    return new vdf.errors.Error(tErrorInfo.iNumber, tErrorInfo.sErrorText, oSource, null, null, true);
}

};
vdf.require("vdf.events.JSHandler", function(){
    /*
    Fired for each error that the by the VDF AJAX Library error system catches.  
    Stopping the event also stops the default handling.
    
    @code
function myErrorHandler(oEvent){
    if(oEvent.bFieldError){
        if(oEvent.oError.oField.sTable === "customer"){
            //  Do custom error handling
            vdf.gui.alert("Something went wrong with the customer!");
            
            //  Cancel the default error functionallity
            oEvent.stop();
        }
    }
}
    
function myInitForm(){
    vdf.errors.onError.addListener(myErrorHandler);
}
    @code
    
    @prop   oError      Reference to the error object (see: vdf.errors.Error or 
                vdf.errors.FieldError) with information about the error that 
                occurred.
    @prop   bFieldError If true the error is a vdf.errors.FieldError.
    */
    vdf.errors.onError = new vdf.events.JSHandler();
});

vdf.register("vdf.errors");



/*
Constructor that is used to create new error.

@param  iErrorNr            The error number identifying the error.
@param  sLocalDescription   Short description of the error.
@param  oSource             Reference to the object that caused the error.
@param  aReplacements       Array with replacement strings for the error 
        message. The error translations contain markers for extra information
        like names and such.
@param  sDetails            (optional) Long detail text (HTML) displayed in a CollapsePanel.
@param  bServer             (optional) Should be true for server errors.
*/
vdf.errors.Error = function Error(iErrorNr, sLocalDescription, oSource, aReplacements, sDetails, bServer){
    /*
    Error number identifying the error. 
    */
    this.iErrorNr = iErrorNr;
    /*
    This is a reference to the object that threw the error which can be of any 
    type (vdf.core.Form, vdf.core.List, etc..).
    */
    this.oSource = oSource;
    /*
    The content of this property will be displayed in the details panel of the error dialog. HTML 
    can be used to format the text. If this property is not set the details will be generated. 
    */
    this.sDetails = sDetails || null;
    
    /*
    This property should be true for errors that are thrown on the server.
    */
    this.bServerError = bServer || false;
    /*
    This property contains the original error description before the translation system was used to 
    translate the error. 
    */
    this.sLocalDescription = sLocalDescription;
    
    //  Load description from translations
    if(iErrorNr > 0){
        /*
        This is the description of the error which is translated using the 
        translation system. 
        */
        this.sDescription = vdf.lang.getTranslation("error", iErrorNr, sLocalDescription, aReplacements);
    }else{
        /*
        @skip
        */
        this.sDescription = sLocalDescription;
    }
	
	
};
/*
Represents an error that occurred in the AJAX application. It contains the 
information known about the error and the functionallity to display the error.
*/
vdf.definePrototype("vdf.errors.Error", {

/*
This method will display the error in a dialog. If the vdf.gui.ModalDialog is available it will be 
used to display the error, else the browser’s window.alert method will be used. If no error details 
are available they will be generated (using the debugDetails method of the source component). The 
details will be displayed in the details panel of the dialog.
*/
display : function(){
	if(vdf.isAvailable("vdf.gui.ModalDialog")){
		if(!this.sDetails){
			var aHTML = [], oSrc = this.oSource;
			
            aHTML.push(
                "<b>Error location:</b> ", (this.bServerError ? "Server" : "Client"), "<br/>",
				"<b>Error number:</b> ", this.iErrorNr, "<br/>",
				"<b>Error description:</b> ", this.sDescription, "<br/>"
            );
            if(this.sLocalDescription !== this.sDescription){
                aHTML.push("<b>Local description:</b> ", this.sLocalDescription, "<br/>");
            }
            aHTML.push("<br/>");

			this.sDetails = aHTML.join("");
			
			if(typeof(oSrc.debugDetails) === "function"){
				this.sDetails += oSrc.debugDetails(this);
			}else if(oSrc){
				aHTML = [
					"<b>Object type:</b> ", vdf.sys.ref.getType(oSrc), "<br/>"
				];
				
				if(oSrc.sName){
					aHTML.push("<b>Object name:</b> ", oSrc.sName, "<br/>");
				}
				
				this.sDetails += aHTML.join("");
			}
		}
	
        vdf.gui.alert(this.sDescription, vdf.lang.getTranslation("error", (this.bServerError ? "titleServer" : "title"), "Error {{0}} occurred", [ this.iErrorNr ]), this.sDetails);
    }else{
        alert(this.sDescription);
    }
},

/*
Called to clear the error. Does nothing.
*/
clear : function(){

}

});

/*
Constructor that takes a reference to the field as parameter.

@param  oField  Reference to the field of which this object will display the 
        errors.
@private
*/
vdf.errors.FieldErrorDisplay = function FieldErrorDisplay(oField){
    this.oField = oField;
    this.aErrors = [];
    
    // @privates
    this.oBalloon = null;
    this.eBtnSpan = null;
    this.eBalloonElem = null;
    this.sOrigCSS = null;
};
/*
Displays the field errors for one field. It uses the vdf.gui.Balloon to do this.

@private
*/
vdf.definePrototype("vdf.errors.FieldErrorDisplay", {

/*
Clears all displayed errors for this field.
*/
clearAll : function(){
    this.aErrors = [];
    this.update();
},

/*
Clears all errors with the given error number for this field.

@param  iErrorNr    The error number.
*/
clearByNr : function(iErrorNr){
    var iErr;
    
    for(iErr = 0; iErr < this.aErrors.length; iErr++){
        if(this.aErrors[iErr].iErrorNr === iErrorNr){
            this.aErrors.splice(iErr, 1);
            break;
        }
    }
    
    this.update();
},

/*
Displays an error for this field.

@param  oError  Error object (vdf.errors.FieldError).
*/
addError : function(oError){
    var iErr, bAdd = true;
    
    for(iErr = 0; iErr < this.aErrors.length; iErr++){
        if(this.aErrors[iErr].iErrorNr === oError.iErrorNr){
            bAdd = false;
            break;
        }
    }
    
    if(bAdd){
        this.aErrors.unshift(oError);
    }
    
    this.update();
},

/*
Displays the error balloon.

@private
*/
display : function(){
    var eBtnSpan, oBalloon;
    
    if(this.oField.bDisplayErrorIcon){
        //  Generate error thingy
        eBtnSpan = document.createElement("span");
        eBtnSpan.innerHTML = "&nbsp;";
        eBtnSpan.className = "fieldErrorIcon";
        this.oField.insertElementAfter(eBtnSpan);
        this.eBtnSpan = eBtnSpan;
        this.eBalloonElem = eBtnSpan;
    }else{
        this.eBtnSpan = null;
        this.eBalloonElem = this.oField.eElement;
    }
    
    //  Update CSS
    this.sOrigCSS = this.oField.getCSSClass();
    if(this.sOrigCSS.indexOf(vdf.errors.sCSS) < 0){
        if(this.sOrigCSS !== ""){
            this.oField.setCSSClass(this.sOrigCSS + " " + vdf.errors.sCSS);
        }else{
            this.oField.setCSSClass(vdf.errors.sCSS);
        }
    }else{
        this.sOrigCSS = null;
    }
    
    //  Make sure the correct tabs are displayed to display the error
    this.displayTabs();
    
    //  Generate balloon control
    oBalloon = new vdf.gui.Balloon(this.eBalloonElem, this.oField.oParentControl);
    oBalloon.sContent = this.generateText();
    oBalloon.bDisplay = true; 
    oBalloon.bAttachHover = true;
    if(this.oField.bDisplayErrorIcon){
        oBalloon.bAttachClick = true;
    }else{
        oBalloon.bAttachClick = false;
        oBalloon.sAlignHoriz = "left";
    }
    oBalloon.init();
    this.oBalloon = oBalloon;
    
    vdf.core.init.registerControl(oBalloon, "vdf.gui.Balloon");
    
    
},

/*
Updates the display (created / updates / removes the ballon).
*/
update : function(){
    if(this.oBalloon){
        if(this.aErrors.length > 0){
            this.oBalloon.setContent(this.generateText());
            this.displayTabs();
            this.oBalloon.display();
        }else{
            this.remove();
        }
    }else{
        if(this.aErrors.length > 0){
            this.display();
        }
    }
},

/*
Makes sure the tab with the field is displayed.

@private
*/
displayTabs : function(){
    //  Make sure that it is displayed (even if it is on another tab)
    if(this.eBtnSpan){
        if(vdf.isAvailable("vdf.gui.TabContainer")){
            vdf.gui.displayTabsWithElement(this.eBtnSpan);
        }
    }
},

/*
Generates the text for the error balloon by concatenating the error 
descriptions.

@private
*/
generateText : function(){
    var iErr, sResult = "";
    
    for(iErr = 0; iErr < this.aErrors.length; iErr++){
        sResult +=  (iErr > 0 ? "<br/>" : "") + '<span class="fieldErrorText">' + this.aErrors[iErr].sDescription + '</span>';
    }
    
    return sResult;
},

/*
Removes the error ballong.

@private
*/
remove : function(){
    if(this.oBalloon){
        vdf.core.init.destroyControl(this.oBalloon);
        this.oBalloon = null;
        
        if(this.eBtnSpan){
            this.eBtnSpan.parentNode.removeChild(this.eBtnSpan);
            this.eBtnSpan = null;
        }
        
        if(this.sOrigCSS){
            this.oField.setCSSClass(this.sOrigCSS);
        }
    }
}

});



/*
Constructor of the field error.

@param  iErrorNr            The error number.
@param  sLocalDescription   Description of the error (displayed if no 
        translation is available).
@param  oField              Reference to the field to which the error belongs 
        (vdf.core.Field).
@param  aReplacements       (optional) Array with replacements for the error 
        message.
@param  bServer             (optional) Should be true for server errors.       
*/
vdf.errors.FieldError = function FieldError(iErrorNr, sLocalDescription, oField, aReplacements, bServer){
    this.Error(iErrorNr, sLocalDescription, oField.oController, aReplacements);
    
    /*
    Reference to the field (vdf.core.Field) on which the error applies.
    */
    this.oField = oField;
    /*
    This property should be true for errors that are thrown on the server.
    */
    this.bServerError = bServer || false;
    
    // @privates
    this.eBtnSpan = null;
    this.oBalloon = null;
    this.sOrigCSS = null;
};
/*
Extends the error with the field error information and functionallity. Contains
the logic to display the field error in a error marker for the field if 
available.
*/
vdf.definePrototype("vdf.errors.FieldError", "vdf.errors.Error", {

/*
Displays the field error by creating & adding the error span behind the field.
*/
display : function(){
    var sPrefix;
    
 
    sPrefix = ' (field: "' + this.oField.sDataBinding + '")';
    if(this.sDescription.substr(this.sDescription.length - sPrefix.length) !== sPrefix){
        this.sDescription += sPrefix;
    }
    //  Call super display
    this.Error.prototype.display.call(this);
},

/*
Clears the field error by removing the SPAN with the error text and resetting 
the orrigional CSS classname. If no span is created the clear method of the 
super prototype is called.
*/
clear : function(){
    //  Call super clear
    this.Error.prototype.clear.call(this);
}

});