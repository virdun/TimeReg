/*
Name:
    vdf.deo.Checkbox
Type:
    Prototype
Extends:
    vdf.core.Field
Revisions:
    2008/01/17  Initial version in the new 2.0 architecture. (HW, DAE)
*/

/*
@require    vdf/core/Field.js
*/

/*
Constructor of the checkbox that calls the super constructor (of the Field) and 
applies to the initializer interface (see vdf.core.init).

@param  eCheckbox       Reference to the checkbox DOM element.
@param  oParentControl  Reference to the parent control.
*/
vdf.deo.Checkbox = function Checkbox(eCheckbox, oParentControl){
    this.Field(eCheckbox, oParentControl);
    
    /*
    The value that is returned if the checkbox is checked and is recognized as 
    the checked value if the value is set. The default value is loaded from the 
    VDF property File_Field_CheckBox_Value.
    
    @html
    */
    this.sChecked = "Y";
    /*
    The value that is returned if the checkbox is not checked and is recognized 
    and the unchecked value if it iset. The default value is loaded from the 
    VDF property File_Field_CheckBox_Value.
    
    @html
    */
    this.sUnchecked = "N";
};
/*
This class defines checkbox data entry object. The basic functionality is 
inherited from the vdf.core.Field class. Custom functionality is added to 
support the checked and unchecked values. The initialization system will 
automatically instantiate this class for each <input type="checkbox" element 
found on the page.

@code
<input type="checkbox" name="customer__active" />
@code
*/
vdf.definePrototype("vdf.deo.Checkbox", "vdf.core.Field", {

/*
Called by the form to initialize the component.
*/
formInit : function(){
    this.Field.prototype.formInit.call(this);

    //  Load meta data values
    this.sChecked = (this.getMetaProperty("sChecked") || this.sChecked);
    this.sUnchecked = (this.getMetaProperty("sUnchecked") || this.sUnchecked);
    
    //  Update the display value
    this.sDisplayValue = this.getValue();
},

/*
Overrides the getValue with the checkbox specific functionallity.

@return The value of the checkbox.
*/
getValue : function(){
    return (this.isChecked() ? this.sChecked : this.sUnchecked);
},

/*
Overrides the setValue method with the checkbox specific functionallity.

@param  sValue          The new value.
@param  bNoNotify       (optional) If true the DD should not be updated with 
            this change.
@param  bResetChange    (optional) If true the display changed is cleared.
*/
setValue : function(sValue, bNoNotify, bResetChange){
    this.eElement.checked = (sValue == this.sChecked);
    this.eElement.defaultChecked  = (sValue == this.sChecked);

    this.sOrigValue = sValue;
    
    if(!bNoNotify){
        this.update();
    }

    this.onChange.fire(this, { "sValue" : sValue });
    
    if(bResetChange){
        this.sDisplayValue = this.getValue();
    }
},

/*
This method determines the current state of the checkbox.

@return True will be returned if the checkbox is checked, false if it is not.
*/
isChecked : function(){
    return this.eElement.checked;
}

});
