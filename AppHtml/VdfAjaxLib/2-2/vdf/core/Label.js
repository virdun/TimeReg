/*
Name:
    vdf.core.Label
Type:
    Prototype
Revisions:
    2010/03/18  Initial version. (HW, DAE)
*/

/*
@require    vdf/core/Field.js
*/

/*
Constructor that calls the super constructor (of the Label) and applies to the 
initializer interface (see vdf.core.init).

@param  eElement        Reference to the DOM element.
@param  oParentControl  Reference to the parent control.
*/
vdf.core.Label = function Label(eElement, oParentControl){
    this.Control(eElement, oParentControl);
    
    /*
    The data binding type ("D" for database field, "E" for expression, "R" for 
    rowid, "U" for user data field).
    
    @html
    */
    this.sDataBindingType = null;
    /*
    The data binding string that is used to bind the field to a data source. If 
    not set the "name" attribute is used.
    
    @html
    */
    this.sDataBinding = null;
    /*
    The table to which the data entry object is bound (if the data binding type 
    is "D").
    */
    this.sTable = null;
    /*
    The field to which the data entry object is bound (if the data binding type 
    is "D").
    */
    this.sField = null;
    /*
    If set to false the label won’t load the label from the Data Dictionary 
    settings by default.
    */
    this.bAutoLabel = this.getVdfAttribute("bAutoLabel", true, false);
    /*
    This property determines which label will be displayed. There are three 
    options that determine which label will be loaded from the Data Dictionary. 
    The options are:  "shortlabel", "longlabel", "statushelp.
    */
    this.sType = this.getVdfAttribute("sType", "shortlabel", true);
    
    //  @privates
    this.bIsLabel = true;
    
    //  Nasty: Call method of Field in context of this object.
    vdf.core.Field.prototype.detectBinding.call(this);
};
/*
This class defines the label control that can be used to dynamically load labels 
from the Data Dictionary settings. The data binding can be defined in exactly 
the same way as with Data Entry Objects. If using the label control within the 
header of a grid it will recognize the field and attach listeners to it if the 
field is indexed. Note that the label can only be used within in a vdf.core.Form 
or vdf.core.FormMeta. The initialization system has a shortcut for this field so 
vdfControlType="label" can be used to define this control as well. The label 
control can be used on any element that can contain text (like <div, <span, <td, …).

@code
<span vdfControlType="vdf.core.Label" vdfDataBinding="customer.name"></span>
@code
*/
vdf.definePrototype("vdf.core.Label", "vdf.core.Control", {


/*
Called by the Form to initialize the Data Entry Object. Augments the formInit 
with functionality to use decription values.

@private
*/
formInit : function(){
    if(this.bAutoLabel){
        this.determineLabel();
    }
},

/*
Dynamically determines the label according to the data binding and data 
dictionary properties. For expression fields the new label will be "Expression" 
and for non data bound fields the value will be "Unknown".
*/
determineLabel : function(){
    var sLabel;
    
    switch(this.sType.toLowerCase()){
        case "shortlabel":
            sLabel = this.oForm.oMetaData.getFieldProperty("sShortLabel", this.sTable, this.sField);
            break;
        case "statushelp":
            sLabel = this.oForm.oMetaData.getFieldProperty("sStatusHelp", this.sTable, this.sField);
            break;
        case "longlabel":
            sLabel = this.oForm.oMetaData.getFieldProperty("sLongLabel", this.sTable, this.sField);
            break;
    }
    if(sLabel === null || sLabel === ""){
        if (this.sDataBindingType === "D"){
            sLabel = vdf.sys.string.copyCase(this.sField, "Xx");
        }else if(this.sDataBindingType === "E"){
            sLabel = "Expression";
        }else{
            sLabel = "Unknown";
        }
    }
    this.setLabel(sLabel);
},

/*
Loads a meta data property for the field to which the label is bound.

@private
*/
getMetaProperty : function(sProp){
    //  Nasty: Call method of Field in context of this object.
    return vdf.core.Field.prototype.getMetaProperty.call(this, sProp);
},

/*
@return The current label.
*/
getLabel : function(){
    return vdf.sys.dom.getElementText(this.eElement);
},

/*
Changes the label.

@param  sLabel      The new label text.
*/
setLabel : function(sLabel){
    vdf.sys.dom.setElementText(this.eElement, sLabel);
}

});
