/*
Name:
    vdf.core.Field
Type:
    Prototype
Extends:
    vdf.ajax.DEO
Revisions:
    2006/01/20  Created the initial prototype that acts as a wrapper for the 
    form field DOM elements. (HW, DAE)
    2008/02/01  Rebuild into the 2.0 structure where the different fields are
    subtracted into their own prototypes. (HW, DAE)
*/

/*
@require    vdf/core/DEO.js
*/


/*
Constructor of the field initializes the properties. It implements the 
interface required by the initializer (see: vdf.core.Initializer).

@param  eElement        Reference to the DOM element that represents the field.
@param  oParentControl  Reference to the parent control.
*/
vdf.core.Field = function Field(eElement, oParentControl){
    this.DEO(eElement, oParentControl);
    
    //  PUBLIC
    
    /*
    Determines the display method that is used to let the user know that the 
    field is locked for an action (like find, save, clear, delete). Possible 
    options are:
    
    "CssClass" The CSS class "locked" is set to the DOM element while the field 
    is locked. The animation framework will determine which properties can be 
    animated. 
    
    "FadeOverlay" An overlay DIV element is created and inserted behind the DOM 
    element that represents the field. After unlocking this DIV elements opacity 
    is faded to 0%.
    
    "None" No visual animation will be displayed.
    */
    this.sLockDisplay = this.getVdfAttribute("sLockDisplay", this.getVdfAttribute("sDisplayLock", "CssClass", true), true);
    /*
    The amount of milliseconds the animation displayed when locking the field 
    will take. Note that if the action for which the field is locked finishes 
    before the animation is finished it will stop the lock animation and start 
    the unlock animation immediately. 
    */
    this.iLockDuration = this.getVdfAttribute("iLockDuration", 400, true);
    /*
    The name of the CSS class used when the sLockDisplay property is set to 
    "CssClass". 
    */
    this.sLockClass = this.getVdfAttribute("sLockClass", "locked", true);
    
    /*
    If this property is set to false the error icon next to the field won’t be 
    displayed any more. Errors will still be displayed using the underline and 
    the balloon (which will be aligned on the field itself instead of the icon). 
    If fields are used within the grid this property will default to false.
    */
    this.bDisplayErrorIcon = this.getVdfAttribute("bDisplayErrorIcon", (!this.oParentControl || vdf.sys.ref.getType(this.oParentControl) !== "Grid"), true);
    
    /*
    Reference to the lookup object that is opened if the lookupkey (usually F4) 
    is used. Can be a vdf.gui.PopupCalendar or a vdf.core.LookupDialog. Is null 
    if no one is available.
    */
    this.oLookup = null;
    
    //  Validation properties (will be inialized later due to meta data request)
    /*
    If true each time the user tabs out of a field a asynchronous AJAX call is 
    sent to validate the new field value. Validation errors that occur on the 
    server and are created in the proper way are displayed in the error 
    balloons. The bValidateServer property defaults to true if a 
    Field_Validate_msg is set for the database field to which the field is 
    bound.
    
    The following example shows how a validation method can be assigned to a 
    field in a Visual DataFlex Data Dictionary. This line is usually located in 
    the Construct_Object of the Data Dictionary.
@code
Set Field_Validate_msg Field Orderhea.ORDER_DATE to get_ValidateOrderDate
@code
    
    The following example shows how a field error can be created. If this method 
    is used the error is shown in a vdf.gui.Balloon within the AJAX Library. If 
    the Error command or the UserError procedure the error is displayed in the a 
    vdf.gui.ModalDialog.
@code
Function ValidateOrderDate Integer iColumn Date dValue Returns Boolean
    Boolean bResult
    Date dMyDate
    
    Sysdate dMyDate
    
    If (DateGetYear(dValue) < DateGetYear(dMyDate)) Begin
        Send Data_set_error iColumn DFERR_OPERATOR "It is not allowed to create or modify dates in a previous year!"
        Move True to bResult    
    End
    
    Function_Return bResult
End_Function
@code
    
    @html
    */
    this.bValidateServer = null;
    /*
    The data type of the field ("ascii", "bcd", "date"). This value defaults the 
    database field to which the field is bound.
    
    @html
    */
    this.sDataType = null;
    /*
    The default value which is set during page load.
    
    @html
    */
    this.sDefaultValue = null;
    /*
    If true all characters entered are transformed to uppercase. Defaults to the 
    DD_CAPSLOCK field option in VDF.
    
    @html
    */
    this.bCapslock = null;
    /*
    If true the changed state won't be set to true automatically if the field 
    value changes. Defaults to the DD_NOPUT field option in VDF.
    
    @html
    */
    this.bNoPut = null;
    /*
    A combination of bNoPut and bNoEnter. The user can't edit the value and the 
    changed state isn't set to true if the value changes (using the setValue 
    method). Defaults to the DD_DISPLAYONLY field option in VDF.
    
    @html
    */
    this.bDisplayOnly = null; 
    /*
    If true the field will be displayed as disabled and the user will not be 
    able to edit the value. Defaults to the DD_NOENTER field option in VDF.
    
    @html
    */
    this.bNoEnter = null;
    /*
    If true the user will not be able to edit the value if a record is found. 
    Defaults to the DD_SKIPFOUND field option in VDF.
    
    @html
    */
    this.bSkipFound = null;
    
    /*
    If true the field is required. Defaults to the DD_REQUIRED field option in 
    VDF.
    
    @html
    */
    this.bRequired = null;
    /*
    If set it makes sure the field values entered match the check values. The 
    values should be given pipe separated like "VAL1|VAL2|VAL3". Defaults to the 
    check validation value of the DD in VDF.
    
    @html
    */
    this.sCheck = null;
    /*
    If true the field values should be found. Defaults to the DD_FINDREQ field 
    option in VDF.
    
    @html
    */
    this.bFindReq = null;
    /*
    The minimum value required for this field. Defaults to the minimum value of 
    the range validation type in VDF.
    
    @html
    */
    this.sMinValue = null;
    /*
    The maximum value required for the field. Defaults to the maximum value of 
    the range validaiton type in the VDF.
    
    @html
    */
    this.sMaxValue = null;
    
    /*
    Fired each time the field is validated (which can be triggered by a save or 
    by the user tabbing out of a field). If the event is stopped the validation 
    is assumed to be failed.
    
    The example below shows how this event can be used to create a custom 
    client-side validation method. Note that field errors need to be cleared the 
    next time the validation is performed!
@code
function myInitForm(oForm){
    oForm.getDEO("customer__credit_limit").onValidate.addListener(onValidateCustomerCreditLimit);
}

function onValidateCustomerCreditLimit(oEvent){
    var oField = oEvent.oSource;

    if(parseInt(oField.getValue(), 10) > 5000){
        vdf.errors.handle(new vdf.errors.FieldError(901, "Credit limits above 5000 are not allowed!", oField));
        oEvent.stop();
    }else{
        vdf.errors.clear(901, oField);
    }
}
@code
    
    @prop   bWaitAutoFind   True if an autofind request is still standing out on 
            the background. If true properties like required and find required 
            should not be validated.
    */
    this.onValidate = new vdf.events.JSHandler();
    /*
    Fired each time the value of the field is changed.
    
    @prop   sValue  The new value of the field.
    */
    this.onChange = new vdf.events.JSHandler();
    
    //  @privates
    this.bIsField = true;
    this.bHasFocus = false;
    this.sOrigValue = null;
    this.sDisplayValue = this.getValue();
    this.eOverlay = null;
    this.sFadeOrigColor = null;
    this.sFadeColor = null;
    
    //  Init databinding
    this.detectBinding();
    
    //  Register to parent as data entry object
    if(oParentControl !== null && typeof(oParentControl.addDEO) == "function"){
        oParentControl.addDEO(this);
    }
};
/*
Central prototype with basic functionality that is generic for all field types. 
Most specific field type prototypes (like vdf.deo.CheckBox and vdf.deo.Select) 
override several methods with field specific functionality. The Data Entry 
Object (vdf.core.DEO) interface is implemented so the fields can be used within 
a vdf.core.Form.

Contains functionality like the key handlers for the find / clear / save /delete 
actions. Generic field validations are implemented here. If a custom field type 
is implemented it is advised to extend this class with the type specific 
functionality.
*/
vdf.definePrototype("vdf.core.Field", "vdf.core.DEO", {

/*
@private
*/
bFocusable : true,

/*
Called by the form after the basic meta data is loaded so the field can 
initialize itself. It attaches event listeners.

@private
*/
formInit : function(){
    var sStatusHelp;
    
    //  Load validation properties
    this.bValidateServer = this.getMetaProperty("bValidateServer");
    this.sDataType = this.getMetaProperty("sDataType");
    this.bCapslock = this.getMetaProperty("bCapslock");
    this.bNoPut = this.getMetaProperty("bNoPut");
    this.bDisplayOnly = this.getMetaProperty("bDisplayOnly");
    this.bNoEnter = this.getMetaProperty("bNoEnter");
    this.bSkipFound = this.getMetaProperty("bSkipFound");
    
    this.bRequired = this.getMetaProperty("bRequired");
    this.sCheck = this.getMetaProperty("sCheck");
    this.bFindReq = this.getMetaProperty("bFindReq");
    
    this.sMinValue = this.getMetaProperty("sMinValue");
    this.sMaxValue = this.getMetaProperty("sMaxValue");

    this.sDataType = this.getMetaProperty("sDataType");
    this.sDefaultValue = this.getMetaProperty("sDefaultValue");    
    
    //  Add DOM listeners
    this.addDomListener("focus", this.onFocus, this);
    this.addDomListener("blur", this.onBlur, this);
    this.addDomListener("change", this.onElemChange, this);
    if(this.oForm.bAttachKeyActions){
        this.addKeyListener(this.onKey, this);
    }
    
    //  Update the display value
    this.sDisplayValue = this.getValue();
    
    //  Set the title to the statushelp (if not set)
    if(this.getAttribute("title") === null){
        sStatusHelp = this.getMetaProperty("sStatusHelp");
        if(sStatusHelp){
            this.setAttribute("title", sStatusHelp);
        }
    }
    
    if(this.sDefaultValue !== "" && this.sDefaultValue !== null){
        this.setValue(this.sDefaultValue, false, true);
    }
    
    this.initDisplayLock();
},

/*
Properly removes DOM listeners and references.
*/
destroy : function(){
    if(this.eElement){
        vdf.events.clearDomListeners(this.eElement);
    }
    this.eOverlay = null;
},

/*
Handles the onChange event of the DOM element that belongs to the field. It 
calls the update function that informs the DD of this change.

@param  oEvent  Event object.
@private
*/
onElemChange : function(oEvent){
    this.update();
},

/*
Handles the keypress event of the DOM element that belongs to the field. It 
executes the action that belongs the key. The event is stopped if an action is 
executed.

@param  oEvent  Event object.
@private
*/
onKey : function(oEvent){
    var oPressedKey = {
        iKeyCode : oEvent.getKeyCode(),
        bCtrl : oEvent.getCtrlKey(),
        bShift : oEvent.getShiftKey(),
        bAlt : oEvent.getAltKey()
    };
    
    //vdf.log("Keypress code: " + oPressedKey.iKeyCode + " ctrl: " + oPressedKey.bCtrl + " shift: " + oPressedKey.bShift + " alt: " + oPressedKey.bAlt);
    
    try{
        if(this.oForm.oActionKeys){
            if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.findGT)){ 
                this.doFind(vdf.GT);  // F8:  find next
                oEvent.stop();
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.findLT)){ 
                this.doFind(vdf.LT);  // F7:  find previous
                oEvent.stop();
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.findGE)){ 
                this.doFind(vdf.GE);  // F9:  find equal
                oEvent.stop();
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.save)){ 
                this.doSave();        // F2:  save
                oEvent.stop();
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.clear)){ 
                this.doClear();       // F5:  clear
                oEvent.stop();
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.clearAll)){ 
                this.doClearAll();    // Crtl - F5:  clear all
                oEvent.stop();
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.lookup)){ 
                if(this.oLookup !== null){  // F4:  lookup
                    this.oLookup.display(this);
                    oEvent.stop();
                }
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.findFirst)){ 
                this.doFind(vdf.FIRST); // ctrl - home: find first
                oEvent.stop();
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.findLast)){ 
                this.doFind(vdf.LAST);  // ctrl - end:  find last
                oEvent.stop();
            }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oForm.oActionKeys.remove)){ 
                this.doDelete();      // shift - F2:  delete
                oEvent.stop();
            }
        }
        /*
                case 13:
                    if(this.oForm.doEnter()){
                        e.stop();
                    }
                    break;
            }
        }
        */
    }catch (oError){
        vdf.errors.handle(oError);
    }
},

/*
Handles the onFocus event of the DOM element that belongs to this field and 
sets the current field as the active field on the form. Sets the bHasFocus 
indicator to true.

@param  oEvent  Event object.
@private
*/
onFocus : function(oEvent){
    this.bHasFocus = true;
    this.oForm.oActiveField = this;
},

/*
Handles the onFocus event of the DOM element that belongs to this field. 
Switches the bHasFocus indicator to false.

@param  oEvent  Event object.
@private
*/
onBlur : function(oEvent){
    this.bHasFocus = false;
},

/*
Gives the focus to the field (or actually the DOM element to which this field 
belongs).

@param  bSelect (optional) If true the content of the field will be selected.
*/
focus : function(bSelect){
    vdf.sys.dom.focus(this.eElement, bSelect);
},

/*
Determines the current value of the field. Overriden in some of the actual field 
implementations.

@return The current field value.
*/
getValue : function(){
    return this.eElement.value;
},

/*
Updates the value of the field.

@param  sValue          The new value.
@param  bNoNotify       (optional) If true the DD is not updated with this change.
@param  bResetChange    (optional) If true the display changed is cleared.
*/
setValue : function(sValue, bNoNotify, bResetChange){
    this.eElement.value = sValue;
    
    if(!bNoNotify){
        this.update();
    }
    
    this.onChange.fire(this, { "sValue" : sValue });
    
    this.sOrigValue = sValue;
    
    if(bResetChange){
        this.sDisplayValue = this.getValue();
    }
},

/*
Determines wether the user has changed the value (since the last time the 
value was set by the system). 

@return True if the field value was changed since the last refresh.
*/
isChanged : function(){
    return this.getValue() !== this.sDisplayValue;
},

/*
Inserts a element in the DOM after the fields element(s).

@param  eElement    The new element to insert.
@private
*/
insertElementAfter : function(eElement){
    if(this.oLookup && typeof this.oLookup.eElement === "object" && this.eElement.parentNode === this.oLookup.eElement.parentNode){
        vdf.sys.dom.insertAfter(eElement, this.oLookup.eElement);
    }else{
        vdf.sys.dom.insertAfter(eElement, this.eElement);
    }
    
    //this.eElement.parentNode.appendChild(eElement);
    
},

/*
Can be used to fetch meta data properties. First it tries to load the property
from the element, if it is not available there it loads the property from the 
meta data (if a form is available and the field is bound to a database field).

@param  sProp   Name of the meta data property.
@return Property value (null if not available)
*/
getMetaProperty : function(sProp){
    //  Note: The vdf.core.Label class also uses this method

    var sForeign = "bAutoFind, bAutoFindGE, bDisplayOnly, bFindReq, bNoEnter, bNoPut, bSkipFound";
    var sResult = this.getVdfAttribute(sProp, null, false);

    if(sResult === null && this.oForm && this.oForm.oMetaData){
        if(this.sDataBindingType === "D"){
            sResult = this.oForm.oMetaData.getFieldProperty(sProp, this.sTable, this.sField);
            
            //  If this propery has a foreign equalivant and this field is foreign and origional value is false load the foreign value
            if((!sResult || sResult === "false") && sForeign.match(sProp) !== null && this.isForeign()){
                sProp = "b" + "Foreign_" + sProp.substr(1);
                sResult = this.oForm.oMetaData.getFieldProperty(sProp, this.sTable, this.sField);
            }
        }else if(this.sDataBindingType === "E"){
            //  Hardcode display only for expression fields!
            if(sProp === "bDisplayOnly"){
                sResult = "true";
            }
        }
    }
    
    //  Convert string to boolean
    if(sResult == "true"){
        return true;
    }else if(sResult == "false"){
        return false;
    }else{
        return sResult;
    }
},

/*
Gets the changed state of the field from the Data Dictionary if the field is 
data bound.

@return The changed state of the buffer entry (false if not data bound).
*/
getChangedState : function(){
    if(this.sDataBindingType === "D"){
        return this.oServerDD.getFieldChangedState(this.sTable, this.sField);
    }
    
    return false;
},


/*
Determines wether the field is foreign in this situation.

@return True if foreign, False if not and null if it can't determine.
*/
isForeign : function(){
    if(this.oServerDD !== null){
        return this.oServerDD.isParent(this.oForm.oDDs[this.sTable]);
    }else{
        return null;
    }
},

//  - - - - -   V A L I D A T I O N   - - - - - 

/*
Initializes the validation.

@param  bAttachListeners    If false no listeners will be attached.
@private
*/
initValidation : function(bAttachListeners){
    if(typeof(bAttachListeners) === "undefined"){
        bAttachListeners = true;
    }
    
    //  Disables the field if needed
    if(this.bNoEnter || this.bDisplayOnly || (this.bSkipFound && this.sDataBindingType === "D" && this.oForm.getDD(this.sTable).hasRecord())){
        this.disable();
    }
    
    //  Attaches validation keylistener
    if(bAttachListeners){
        this.addKeyListener(this.onValidateField, this);
    }
},

/*
Key listeners that performs validation when user presses tab. Cancels the event
if validation fails.

@param  oEvent  Event object.
@private
*/
onValidateField : function(oEvent){
    if(oEvent.getKeyCode() == 9 && !oEvent.getShiftKey()){
        if(this.validate(true) > 0){
            oEvent.stop();
        }else{
            if(this.bValidateServer){
                this.validateServer();
            }
        }
    }
},

/*
Performs the client-side validation after firing the onValidate event.

@param  bWaitAutoFind   If true the find required (bFindReq) won't be validated.
@return Error number or 0 if validation succesfull and 1 if developer cancelled 
    onValidate.
*/
validate : function(bWaitAutoFind){
    var aValues, sValue, iResult, bCheck, bRequired = true, iVal, bResult;
    
    vdf.errors.clearByField(this);
    
    iResult = this.DEO.prototype.validate.call(this);
    sValue = this.getValue();
    
    //  Fire the onValidate event
    if(!this.onValidate.fire(this, { bWaitAutoFind : (bWaitAutoFind && (this.bAutoFind || this.bAutoFindGE)) })){
        iResult = 1;
    }
    
    //  Required...
    if(this.bRequired){
        if((this.sDataType === "bcd" && (parseInt(sValue, 10) === 0 || sValue === "") ) || this.sDataType !== "bcd" && sValue === ""){
            vdf.errors.handle(new vdf.errors.FieldError(5128, "Required", this));
            iResult = (iResult > 0 ? iResult : 5128);
            bRequired = false;
        }else{
            vdf.errors.clear(5128, this);
        }
    }
    
    //  Check values
    if(this.sCheck){
        aValues = this.sCheck.split("|");
        bCheck = false;
        
        for(iVal = 0; iVal < aValues.length && !bCheck; iVal++){
            bCheck = (sValue === aValues[iVal]);
        }
        
        if(bCheck){
            vdf.errors.clear(5125, this);
        }else{
            vdf.errors.handle(new vdf.errors.FieldError(5125, "Unmatched check value", this));
            iResult = (iResult > 0 ? iResult : 5125);
        }
    }
    
    //  Find required (if autofind or autofindge are enabled it doesn't validate findrequired yet to prevent errors from flashing before autofind is finished)
    if((bWaitAutoFind && !this.bAutoFind && !this.bAutoFindGE && this.bFindReq) || (!bWaitAutoFind && this.bFindReq)){
        if(this.oServerDD && this.sDataBindingType === "D"){
            if(this.oForm.getDD(this.sTable).hasRecord() && !this.getChangedState() && !this.isChanged()){
                vdf.errors.clear(5124, this);
            }else{
                vdf.errors.handle(new vdf.errors.FieldError(5124, "Find required", this));
                bResult = false;
                iResult = (iResult > 0 ? iResult : 5124);
            }

        }
    }
    
    //  Min / Max value
    if(this.sMaxValue || this.sMaxValue === 0){
        if((this.sDataType === "bcd" && parseFloat(sValue) <= parseFloat(this.sMaxValue)) || (this.sDataType !== "bcd" && sValue > this.sMaxValue) || sValue === ""){
            vdf.errors.clear(5126, this);
        }else{
            vdf.errors.handle(new vdf.errors.FieldError(5126, "Maximum value", this, [this.sMaxValue]));
            iResult = (iResult > 0 ? iResult : 5126);
        }
    }
    if(this.sMinValue || this.sMinValue === 0){
        if((this.sDataType === "bcd" && parseFloat(sValue) >= parseFloat(this.sMinValue)) || (this.sDataType !== "bcd" && sValue > this.sMinValue) || sValue === ""){
            vdf.errors.clear(5127, this);
        }else{
            vdf.errors.handle(new vdf.errors.FieldError(5127, "Minimum value", this, [this.sMinValue]));
            iResult = (iResult > 0 ? iResult : 5127);
        }
    }
    
    
    
    return iResult;
},

/*
Performs server side validation (if the field is bound to a database field) 
using the ValidateField method. This is done asynchronously so no result is 
returned. If an error occurred on the server it is displayed and the cursor is 
returned to the field.
*/
validateServer : function(){
    var tRequest, oCall;

    if(this.oServerDD && this.sDataBindingType === "D"){
        
        
        //  Update buffer
        this.update();
        
        //  Generate request
        tRequest = new vdf.dataStructs.TAjaxValidationRequest();
        tRequest.sSessionKey = vdf.sys.cookie.get("vdfSessionKey");
        tRequest.sWebObject = this.oForm.sWebObject;
        tRequest.sFieldName = this.sDataBinding;
        tRequest.tRow = this.oServerDD.generateExtSnapshot(true);
        
        //  Send request
        oCall = new vdf.ajax.SoapCall("ValidateField", { tRequest : tRequest }, this.oForm.sWebServiceUrl);
        oCall.onFinished.addListener(this.handleValidateServer, this);
        oCall.send(true);
    }
},

/*
Handles the response from the field validation request. It first clears server 
validation errors that where still standing out, then it displays returned 
errors. If the validation failed the focus will be returned to the field.

@param  oEvent  Event object.
@private
*/
handleValidateServer : function(oEvent){
    var iError, tResponse = oEvent.oSource.getResponseValue("TAjaxValidationResponse");
    
    if(tResponse.sFieldValue == this.getValue()){
        for(iError = 0; iError < tResponse.aErrors.length; iError++){
            vdf.errors.handle(vdf.errors.createServerError(tResponse.aErrors[iError], this));
        }
        
        if(tResponse.iError !== 0){
            this.focus();
        }
    }
},

//  - - - - -   D E O   - - - - - 

/*
Detects if a data binding is set on the field. The sDataBinding attribute is 
first checked. If this isn't set it checks if the name is database field name 
so this will be used. It uses a regular expression to differ between direct 
field bindings and regular expressions.

@private
*/
detectBinding : function(){
    //  Note: The vdf.core.Label also uses this method

    var aParts, sBinding, sType;

    sBinding = this.getVdfAttribute("sDataBinding", null, false);
    sType = this.getVdfAttribute("sDataBindingType", null, false);

    //  Use name for binding if none given
    if(sBinding === null){
        sBinding = this.getAttribute("name");
    }
    //  Uppercase type
    if(sType !== null){
        sType = sType.toUpperCase();
    }
    
    if(sBinding !== null){
        if((sType === "R" || sType === "D" || sType === null) && sBinding.replace("__", ".").match(/^[a-zA-Z][a-zA-Z0-9_@#]*\.[a-zA-Z][a-zA-Z0-9_@#]*$/)){
            //  Regular database fields must apply to the <table>(.|__)<field> format
            
            //  Clean binding and split into table and field name.
            sBinding = sBinding.replace("__", ".").toLowerCase();
            aParts = sBinding.split(".");
            
            //  Save binding data
            this.sTable = aParts[0];
            this.sField = aParts[1];
            this.sDataBinding = sBinding;
            this.sDataBindingType = (this.sField == "rowid" ? "R" : "D");
        }else if((sBinding.match(/^[eE]\:[a-zA-Z][a-zA-Z0-9_@#]*$/) && (sType === "E" || sType === null)) || (sBinding.match(/^[a-zA-Z][a-zA-Z0-9_@#]*$/) && sType === "E")){
            //  Expression fields start with a "e:<functionname>" or have their data binding name explicitly set to "E"
            if(sBinding.substr(0, 2).toUpperCase() === "E:"){
                sBinding = sBinding.substr(2);
            }
            
            this.sDataBindingType = "E";
            this.sDataBinding = sBinding.toLowerCase();
        }else{  
            //  Else we assume it is a user data field
            this.sDataBindingType = "U";
            this.sDataBinding = sBinding.toLowerCase();
        }
    }
    
    
    
},

/*
Called by the form to create the DEO - DDO relation after the DDO structure is 
completed. It searches for the Server DD and registers itself there.

@private
*/
bindDD : function(){
    var sServerTable;

    if(this.oForm !== null){
        //  Detect server dd
        sServerTable = this.getVdfAttribute("sServerTable", null, true);
        if(sServerTable !== null){
            this.oServerDD = this.oForm.oDDs[sServerTable.toLowerCase()];
        }
        
        //  Register...
        if(this.sDataBindingType === "U"){
            this.oForm.registerUserDataField(this);
        }else{
            if(this.oServerDD){
                this.oServerDD.registerDEO(this);
            }
        }
    }
},

/*
Determines if the field is data bound.

@return True if databinding found.
*/
isBound : function(){
    return this.sDataBindingType !== null && this.sDataBindingType !== "U";
},

/*
Called by the DD to notify about a buffer update of a specific field. If the 
value belongs to this field the field value is updated.

@param  sTable  Table name.
@param  sField  Field name.
@param  sValue  The new field value.
*/
fieldValueChanged : function(sTable, sField, sValue){
    if(this.sTable === sTable && this.sField === sField){
        this.setValue(sValue, true, false);
    }
},

/*
Called by the Data Dictionary if the whole buffer is updated. If the field is 
data bound the field will request its enw new value from the Data Dictionary.
*/
refresh : function(oAction){
    if(this.sDataBindingType === "E") {
        this.setValue(this.oServerDD.getExpressionValue(this.sDataBinding), true, true);
    }else{
        this.setValue(this.oServerDD.getFieldValue(this.sTable, this.sField), true, true);
    }
    
    if(this.bSkipFound && this.sDataBindingType === "D"){
        if(this.oForm.getDD(this.sTable).hasRecord()){
            this.disable();
        }else{
            this.enable();
        }
    }
},

/*
Called when the lock animation is finished. Cleans stuff up.

@private
*/
displayLockAniFinished : function(){
    this.oAniCurLock = null;
},

/*
Called when the unlock animation is finished. Cleans stuff up.

@private
*/
displayUnlockAniFinished : function(){
    this.oAniCurLock = null;
    
    if(this.sLockDisplay === "FadeOverlay"){
        //  Hide the overlay element
        this.eOverlay.style.display ="none";
    }
},

/*
Initializes the lock and unlock animations (creates the animation objects that 
will be used).

@private
*/
initDisplayLock : function(){
    if(this.sLockDisplay === "CssClass"){
        //  Create lock animation based on adding the CSS class
        this.oAniSetLock = vdf.sys.fx.animAddClass(this.eElement, this.sLockClass, this.iLockDuration, this.displayLockAniFinished, this);
        
        //  Create unlock animation based on removing the CSS class
        vdf.sys.gui.addClass(this.eElement, this.sLockClass);
        this.oAniSetUnlock = vdf.sys.fx.animRemoveClass(this.eElement, this.sLockClass, this.iLockDuration, this.displayUnlockAniFinished, this);
        vdf.sys.gui.removeClass(this.eElement, this.sLockClass);
    }else if(this.sLockDisplay === "FadeOverlay"){
        //  Create the overlay div
        if(this.eOverlay === null){
            this.eOverlay = document.createElement("div");
            this.eOverlay.className = "locked_overlay";
            vdf.sys.dom.insertAfter(this.eOverlay, this.eElement);
        }
        var oOffset = vdf.sys.gui.getAbsoluteOffset(this.eElement);
        this.eOverlay.style.display = "none";
        this.eOverlay.style.top = oOffset.top + "px";
        this.eOverlay.style.left = oOffset.left + "px";
        this.eOverlay.style.width = this.eElement.offsetWidth + "px";
        this.eOverlay.style.height = this.eElement.offsetHeight + "px";
        vdf.sys.gui.setOpacity(this.eOverlay, 0);
        
        //  Create lock animation (fade in)
        this.oAniSetLock  = new vdf.sys.fx.Set({
            aEffects : [{
                eTarget : this.eOverlay,
                sType : "opacity",
                sTo : "70",
                iDuration : this.iLockDuration,
                fFinished : this.displayLockAniFinished,
                oFinishEnv  : this
            }]
        });
        
        //  Create unlock animation (fade out)
        this.oAniSetUnlock  = new vdf.sys.fx.Set({
            aEffects : [{
                eTarget : this.eOverlay,
                sType : "opacity",
                sTo : "0",
                iDuration : this.iLockDuration,
                fFinished : this.displayUnlockAniFinished,
                oFinishEnv  : this
            }]
        });
    }
},


/*
Stops lock / unlock animations if they are running and adds the lock animation 
to the action object. The action object will start them together with the other 
field animations.

@private
*/
displayLock : function(oAction){
    //  Stop running animation
    if(this.oAniCurLock){
        this.oAniCurLock.stop(true);
        this.oAniCurLock = null;
    }
    
    //  Add lock animation
    if(this.oAniSetLock){
        this.oAniCurLock = this.oAniSetLock;
        oAction.addLockAnim(this.oAniSetLock);
    }
    
    
    if(this.sLockDisplay === "FadeOverlay"){
        //  Hide the overlay element.
        this.eOverlay.style.display ="";
    }
        
    return;    
},

/*
Stops lock / unlock animations if they are running and adds the unlock animation 
to the action object. The action object will start them together with the other 
field animations.

@private
*/
displayUnlock : function(oAction){
    //  Stop running animation
    if(this.oAniCurLock){
        this.oAniCurLock.stop(true);
        this.oAniCurLock = null;
    }
    
    //  Add unlock animation
    if(this.oAniSetUnlock){
        this.oAniCurLock = this.oAniSetUnlock;
        oAction.addUnlockAnim(this.oAniSetUnlock);
    }
    
    return;  
},

/*
Updates the DEO buffer with the current value.
*/
update : function(){
    if((this.sDataBindingType === "D" || this.sDataBindingType === "R") && this.oServerDD !== null){
        //  If value is changed we give the new value to the DD and if bNoPut or bDisplayOnly is true we tell it not to update the changed-state
        var sValue = this.getValue();
        if(sValue != this.sOrigValue){
            this.oServerDD.setFieldValue(this.sTable, this.sField, sValue, (this.bNoPut || this.bDisplayOnly));
        }
    }
},

/*
Called to lock the field.

@param  bExclusive  True if the field is locked exclusively.
@param  oAction     Reference to the vdf.core.Action object for which the field 
            is locked.
@private
*/
lock : function(bExclusive, oAction){
    if(this.iLocked === 0){
        this.displayLock(oAction);
    }
    
    this.iLocked++;
},

/*
Called to unlock the field.

@param  bExclusive  True if the field was locked exclusively.
@param  oAction     Reference to the vdf.core.Action object for which the field 
            was locked.
@private
*/
unlock : function(bExclusive, oAction){
    this.iLocked--;
    
    if(this.iLocked === 0){
        this.displayUnlock(oAction);
    }
},

// - - - - - - - - - - ACTION FORWARDING - - - - - - - - - - 

/*
Performs a find on this field. The find is performed by the Data Dictionary on 
the fields main index. Note that the find is send asynchronously!

@param  sFindMode   Mode to use with the find.
*/
doFind : function(sFindMode){
    if(this.oServerDD !== null){
        this.oServerDD.doFind(sFindMode, this);
    }
},

/*
Forwards a delete to the server DD of the field. Note that the delete is performed 
asynchronously! 
*/
doDelete : function(){
    if(this.oServerDD !== null){
        this.oServerDD.doDelete();
    }
},

/*
Forwards the save action to the server DD. Note that the save is performed 
asynchronously.
*/
doSave : function(){
    if(this.oServerDD !== null){
        this.oServerDD.doSave();
    }
},

/*
Forwars the clear action to the server DD. Note that the clear is perfomed 
asynchronously.
*/
doClear : function(){
    if(this.oServerDD !== null){
        this.oServerDD.doClear();
    }
},

/*
Forwars the clear all action to the server DD. Note that the clear is perfomed 
asynchronously.
*/
doClearAll : function(){
    if(this.oServerDD !== null){
        this.oServerDD.doClearAll();
    }
},

/*
This method generates HTML displaying details about the object and its current state that can be 
used for debugging purposes. The error system will call this method when handling an error thrown 
with this object as the source to generate the content of the details panel in the error.

@param  oErr    (optional) Reference to the error object.
@return String containing HTML.
*/
debugDetails : function(oErr){

	var aHTML = [
		"<b>Value:</b> ", vdf.sys.string.encodeHtml(this.getValue()), "<br/>",
		this.DEO.prototype.debugDetails.call(this, oErr)
	];
	
	return aHTML.join("");
}



});
