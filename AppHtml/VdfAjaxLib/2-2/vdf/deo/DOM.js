/*
Name:
    vdf.deo.DOM
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
Constructor of that calls the super constructor (of the Field) and applies to 
the initializer interface (see vdf.core.init).

@param  eElement        Reference to the DOM element.
@param  oParentControl  Reference to the parent control.
*/
vdf.deo.DOM = function DOM(eElement, oParentControl){
    this.TextField(eElement, oParentControl);
    
    /*
    If true the displayed value is replaced with the description from the 
    validation table. Note that the complete validation tabe is preloaded.
    */
    this.bUseDescriptionValue = this.getVdfAttribute("bUseDescriptionValue", false);
    
    //  @privates
    this.aDValues = null;
    this.sValue = vdf.sys.dom.getElementText(this.eElement);
};
/*
This class contains the implementation of the DOM data entry object. A DOM field 
is can be used to display a field value (usually from the database) inside any 
element that can contain text. The DOM field is especially used on the display 
row of the Lookups and Grids but can be used anywhere in the page to display 
values. Examples of elements that can be used are the span, div and the td. The 
initialization system of the AJAX Library contains an exception for DOM fields 
so the vdfControlType isn't required on these fields. When a vdfDataBinding 
attribute is found on an element that isn't recognized as one of the data entry 
components it will assume that it is a DOM field.

@code
<span vdfDataBinding="customer.name"></span>
@code
Is short for:
@code
<span vdfControlType="vdf.deo.DOM" vdfDataBinding="customer.name"></span>
@code
*/
vdf.definePrototype("vdf.deo.DOM", "vdf.core.TextField", {

/*
@private
*/
bFocusable : false,

/*
Called by the Form to initialize the Data Entry Object. Augments the formInit 
with functionality to use decription values.

@private
*/
formInit : function(){
    this.TextField.prototype.formInit.call(this);

    if(this.bUseDescriptionValue){
        //  Tell the form to wait for us with finishing initialization
        this.oForm.iInitFinishedStage++;
        
        this.oForm.oMetaData.loadDescriptionValues(this.sDataBinding, this.onDValuesLoaded, this);
    }
},

/*
Called by the Form to initialize the validation system. Calls the super 
initValidation with the bAttachListeners parameter as false.

@private
*/
initValidation : function(){
    this.TextField.prototype.initValidation.call(this, false);
},

/*
Handles the meta data field values response. It displays the values and 
notifies the form that the initialization is completed.

@private
*/
onDValuesLoaded : function(aValues){
    this.aDValues = aValues;
    
    this.oForm.childInitFinished();
},

/*
Overrides the getValue with the functionality to load the original stored 
value.
*/
getValue : function(){
    return this.sValue;
},

/*
Overrides the setValue method with DOM specific functionality like the 
description value & masking system.

@param  sValue      The new value.
@param  bNoNotify       (optional) If true the DD is not updated with this change.
@param  bResetChange    (optional) If true the display changed is cleared.
*/
setValue : function(sValue, bNoNotify, bResetChange){
    var iDV, nValue;
    
    //  Store value
    this.sValue = sValue;
    this.sOrigValue = sValue;
    
    //  Description value translation if needed
    if(this.bUseDescriptionValue && this.aDValues){
        for(iDV = 0; iDV < this.aDValues.length; iDV++){
            if(this.aDValues[iDV].sValue === sValue){
                sValue = this.aDValues[iDV].sDescription;
                break;
            }
        }
    }
    
    //  Apply mask if needed
    if(this.sMaskType === "win"){
        sValue = this.applyWinMask(sValue);
    }else if(this.sMaskType === "num" || this.sMaskType === "cur"){
        sValue = this.applyNumMask(sValue);
    }else if(this.sMaskType === "dat"){
        sValue = this.applyDateMask(sValue);
    }else if(this.sDataType === "bcd" && this.bZeroSupress){    //  Apply zero suppress
        //  Parse into number
        nValue = parseFloat(sValue.replace(this.sThousandsSeparator, "").replace(this.sDecimalSeparator, "."));
        if(isNaN(nValue)){ nValue = 0.0; }
        if(nValue === 0.0){
            sValue = "";
        }
    }
    
    if(sValue === ""){
        sValue = " ";
    }
    
    vdf.sys.dom.setElementText(this.eElement, sValue);
    
    if(!bNoNotify){
        this.update();
    }
    
    this.onChange.fire(this, { "sValue" : sValue });
    
    if(bResetChange){
        this.sDisplayValue = this.getValue();
    }
},

/*
DOM Fields are already readonly so no disabling is needed.
*/
disable : function(){

},

/*
DOM Fields are already readonly so no enabled is needed.
*/
enable : function(){

},

/*
Gives the focus to the field by giving the focus to the input element.
*/
focus : function(){
    //  Can't have focus :S
}

});
