/*
Name:
    vdf.deo.Textarea
Type:
    Prototype
Extends:
    vdf.core.TextField
Revisions:
    2008/01/17  Initial version in the new 2.0 architecture. (HW, DAE)
*/

/*
@require    vdf/core/TextField.js
*/

/*
Constructor of the checkbox that calls the super constructor (of the TextField) 
and applies to the initializer interface (see vdf.core.init).

@param  eTextarea       Reference to the textarea DOM element.
@param  oParentControl  Reference to the parent control.
*/
vdf.deo.Textarea = function Textarea(eTextarea, oParentControl){
    this.TextField(eTextarea, oParentControl);
};
/*
This class implements the textarea field which is a multi line text box. No 
special functionality is added to the super class vdf.core.Field. The 
initialization system will automatically recognizes <textarea elements and will 
create an instance of this class for each occurrence.

@code
<textarea name="customer__comments"></textarea>
@code

*/
vdf.definePrototype("vdf.deo.Textarea", "vdf.core.TextField", {

initValidation : function(bAttachListeners){
    if(typeof(bAttachListeners) === "undefined"){
        bAttachListeners = true;
    }

    //  Maximum length (for text fields without a mask!)
    if(this.iDataLength && this.sMask === "" && bAttachListeners){
        this.addDomListener("keypress", this.preventMaxLength, this);
        //this.addDomListener("paste", this.preventMaxLengthPaste, this);
    }
    
    this.TextField.prototype.initValidation.call(this, bAttachListeners);

},

/*
Gives the focus to the field by giving the focus to the textarea element.
*/
focus : function(){
    vdf.sys.dom.focus(this.eElement);
},

/*
This method is an event listener on the keypress event that prevents the user from entering to many 
characters. Exceptions are special keys and if multiple characters are selected.

@param  oEvent  Event object.
@private
*/
preventMaxLength : function(oEvent){
    if(!oEvent.isSpecialKey() && this.eElement.value.length >= this.iDataLength && vdf.sys.dom.getSelectionLength(this.eElement) <= 0){
        oEvent.stop();
    }
}

/*
Paste solution that only worked for IE and still had issues with line feeds. Chrome works correct 
natively (a paste will fire individual keypress events), for FireFox we couldn't find a sollution.

preventMaxLengthPaste : function(oEvent){
    var sPaste, iVal, iSel, sVal, iPos, iRoom, sNewVal;
    
    sPaste = oEvent.e.clipboardData && oEvent.e.clipboardData.getData ?
        oEvent.e.clipboardData.getData('text/plain') :                // Standard
        window.clipboardData && window.clipboardData.getData ?
        window.clipboardData.getData('Text') :   null;
    
    if(sPaste){
        iPos = vdf.sys.dom.getCaretPosition(this.eElement);
        iSel = vdf.sys.dom.getSelectionLength(this.eElement);
        sVal = this.eElement.value;
        iRoom  =this.iDataLength - sVal.length - iSel;
        
        if(sPaste.length > iRoom){
            this.eElement.value = sVal.substr(0, iPos) + sPaste.substr(0, iRoom) + sVal.substr(iPos + iSel);
            
            var that = this;

            setTimeout(function(){
                vdf.sys.dom.setCaretPosition(that.eElement, iPos + iRoom);
            }, 10);
            
            document.getElementById("debug").innerHTML = iPos;
            oEvent.stop();
        }
    }
}*/


});
