/*
Name:
    vdf.core.FormBase
Type:
    Prototype
Revisions:
    2009/07/31  Separated the vdf.core.Form functionallity over three classes 
    which allows developers to use specific functionallity of the Form / 
    AJAX Library. (HW, DAE)
*/

/*
Constructor of the FormBase which applies to the interface required by the 
initialization system (vdf.core.init). Application developers usually don't need 
to use this constructor but will declare the object in HTML using the 
vdfControlType="vdf.code.FormBase" class.

@param  eElement        Reference to the form DOM element.
@param  oParentControl  (optional) Reference to a control in which the Form is 
        nested.
@param  bSkipInit       (optional) If true the initialization won't be started 
        which is used by subclasses so they can create properties before the 
        initialization starts.
*/
vdf.core.FormBase = function FormBase(eElement, oParentControl, bSkipInit){
    this.Control(eElement, oParentControl);
  
    /*
    The CSS class that is set on the form element.
    */
    this.sCssClass              = this.getVdfAttribute("sCssClass", "vdfform", false);
    
    /*
    Name of the initializer method. Might be encapsulated inside an global 
    object (like myObj.mySub.myFunct). This method is called after the form and 
    its child controls are finished with their initialization.
    
@code
<script type="text/javascript">
    function myInitializer(oForm){
        ...
    }
</script>

<form vdfControlType="form" vdfName="MyForm" vdfInitializer="myInitializer" ..>
    ...
</form>
@code
    */
    this.sInitializer           = this.getVdfAttribute("sInitializer", null);
    
    /*
    If true the focus will be given to the first field after initialization.
    */
    this.bAutoFocusFirst        = this.getVdfAttribute("bAutoFocusFirst", true);
    
    /*
    If true the form fields will be validated before the form is submitted. The 
    submit will be canceled if validation errors occur. Note that this system 
    doesn't work with DD validations.
    */
    this.bValidateOnSubmit      = this.getVdfAttribute("bValidateOnSubmit", true, false);
    
    //  EVENTS
    
    /*
    Fired after the form has finished its initialization.
    */
    this.onInitialized          = new vdf.events.JSHandler();
    /*
    Fired if the user presses enter or double clicks inside a lookup.
    */
    this.onEnter                = new vdf.events.JSHandler();
    

    
    //  @privates
    this.aDEOs                  = [];
    
    
    this.aChildren              = [];
    this.oControls              = {};
    
    //  Private properties
    this.oActiveField           = null;
    this.iInitStage             = 1;
    this.iInitFinishedStage     = 3;
    this.bIsForm                = true;
    this.eElement.oVdfControl   = this;
    
    
    
    //  Set classname
    vdf.sys.gui.addClass(this.eElement, this.sCssClass);
    
    if(this.bValidateOnSubmit){
        vdf.events.addDomListener("submit", this.eElement, this.onSubmitValidate, this);
    }
    
    if(!bSkipInit){
        //  Start the loading proces
        this.initStage();
    }
};
/*
Most basic version of the Form class which contains the functionality to manage 
an initialize the fields (Data Entry Objects) and their initialization. It 
doesn't load meta data and also doesn't build a DDO structure. Should be used on 
forms when the AJAX Library validation functionally is need but not the 
"overhead" of the complete form. It can attach itself to the onSubmit event so a 
validation will be performed before the form is submitted.

@code
<form vdfControlType="mybasicform" vdfName="basicform" method="POST" action="savedata.asp">
    <input name="customfield" type="datafield" vdfDataType="bcd" vdfDataLength="5" vdfPrecision="2" vdfRequired="2" />
    <input type="submit" name="submit" value="Post data" />
</form>
@code

The example shows a simple form with a single field that will be posted. By 
setting the properties this field will be handled and validated like a numeric 
field and is required.
*/
vdf.definePrototype("vdf.core.FormBase", "vdf.core.Control", {

/*
Initialization stage that initializes the child components.

@private
*/
initStageChildren : function(){
    //vdf.log("Form: Loading stage " + this.iInitStage + ": Child intialization");
   
    //  Init childs
    this.initChilds();
},

/*
Initialization stage that calls the application initializer and gives the focus 
to the first field.

@private
*/
initStageFinalize : function(){
    //vdf.log("Form: Loading stage " + this.iInitStage + ": Calls initializers");
    this.callInitializers();
    
    if(this.oActiveField && this.bAutoFocusFirst){
        this.oActiveField.focus();
    }
},

/*
Initialization is done in three stages where stages can contain multiple tasks.

Stage 1:
    1 - The document is scanned further and fields are added to the form.
    
Stage 2:
    2 - Child objects (lists / grids / lookups) can initialize themself

Stage 3:
    x - The initialized are fired

@private
*/
initStage : function(){
    switch(this.iInitStage){
        case 1:
            //  wait for children
            break;
        case 2:
            this.initStageChildren();
            break;
        case this.iInitFinishedStage:
            this.initStageFinalize();
            break;
            
            
    }
},

/*
Called by the initializer which is an indication that the document scan is 
finished so we can move on to the next step / stage of the initialization.
*/
init : function(){
    this.iInitStage++;
    this.initStage();
},

/*
Called by the DEO objects to register themself.

@private
*/
addDEO : function(oDeo){
    this.aDEOs.push(oDeo);
    oDeo.oForm = this;
    
    if(this.oActiveField === null && oDeo.bFocusable){
        this.oActiveField = oDeo;
    }
},

/*
The last step of the initialization which initializes the fields and the 
validation.

@private
*/
initChilds : function(){
    var iDEO;

    this.formInit();
    
    //  Init fields
    for(iDEO = 0; iDEO < this.aDEOs.length; iDEO++){
        this.aDEOs[iDEO].update();
        
        if(typeof(this.aDEOs[iDEO].initValidation) == "function"){
            this.aDEOs[iDEO].initValidation();
        }
    }
    
    //vdf.log("Finished state: " + this.iInitFinishedStage);
    
    //  Move on to the next stage
    this.iInitStage++;
    this.initStage();
    
},

/*
Called when a child has finished initialization. It increases the 
initialization stage counter and moves on with the next step.

@private
*/
childInitFinished : function(){
    this.iInitStage++;
    this.initStage();
},

/*
Throws the onInitialized event and calls the initializer (if one is set).

@private
*/
callInitializers : function(){
    var fInitializer  = null;
    
    //  Throw the onInitialized event
    this.onInitialized.fire(this, null);
    
    if(typeof this.sInitializer === "string"){
        fInitializer = vdf.sys.ref.getNestedObjProperty(this.sInitializer);
        
        //  Call the function
        if(typeof fInitializer === "function"){
            fInitializer(this);
        }else{
            throw new vdf.errors.Error(5134, "Init method not found '{{0}}'", this, [ this.sInitializer ]);
        }
    }
},


// - - - - - - - - - - CENTRAL FUNCTIONALITY - - - - - - - - - - 

/*
Can be used to fetch global meta data properties. It is a stub method since 
FormBase doesn't support meta data, it will look for the property on the form 
element.

@param  sProp   Name of the meta data property.
@return Property value (null if not available)
*/
getMetaProperty : function(sProp){
    return this.getVdfAttribute(sProp, null);
},

/*
It searches for the DEO with the given name. The name can be the control name 
or the data binding.

@param  sName   Name of the DEO or the data binding ("customer.name").
@return Reference to the data entry object (null if not found).
*/
getDEO : function(sName){
    var i;
    
    for(i = 0; i < this.aDEOs.length; i++){
        if((this.aDEOs[i].sName !== null && this.aDEOs[i].sName.toLowerCase() === sName.toLowerCase()) || (this.aDEOs[i].sDataBinding !== null && this.aDEOs[i].sDataBinding === sName.toLowerCase())){
            return this.aDEOs[i];
        }
    }
    
    return null;
},

// - - - - - - - - - - CONTAINER FUNCTIONALITY - - - - - - - - - - 

/*
Searches for a control within the form. Should be used with multiple views per 
page systems.

@param  sName   Name of the searched control.
@return Reference to the control (null if not found).
*/
getControl : function(sName){
    if(typeof(this.oControls[sName.toLowerCase()]) !== "undefined"){
        return this.oControls[sName.toLowerCase()];
    }else{
        return null;
    }
},

/*
Called by the initializer if a nested control is found. Adds the control into 
the aChildren array so it will get bubbling event messages.

@param  oControl    Reference to the control object.
*/
addChild : function(oControl){
    this.aChildren.push(oControl);
},

/*
Calls the formInit function on the children so they can do their intialization.
Usually used if the childs initialization requires meta data to be loaded or DD
structures to be initialized.

@private
*/
formInit : function(){
    var iChild;
    
    for(iChild = 0; iChild < this.aChildren.length; iChild++){
        if(typeof(this.aChildren[iChild].formInit) === "function"){
            this.aChildren[iChild].formInit();
        }
    }
},

/*
Called to recalculate the sizes & position. Usually fired by an element that has 
resized (for some reason). Can bubble up and down.

@param bDown    If true it bubbles up to parent components.
@private
*/
recalcDisplay : function(bDown){
    var iChild;

    if(bDown){
        for(iChild = 0; iChild < this.aChildren.length; iChild++){
            if(typeof this.aChildren[iChild].recalcDisplay === "function"){
                this.aChildren[iChild].recalcDisplay(bDown);
            }
        }
    }else{
        if(this.oParentControl !== null && typeof(this.oParentControl.recalcDisplay) === "function"){
            this.oParentControl.recalcDisplay(bDown);
        }
    }
},

/*
(Recursive) Called to determine if parent elements need to wait with messing 
with the DOM (especially hiding stuff) because the children are still 
initializing and need to do some pixel calculation.

@return Amount of children that need waiting.
@private
*/
waitForCalcDisplay : function(){
    var iChild, iWait = 0;
    
    for(iChild = 0; iChild < this.aChildren.length; iChild++){
        if(typeof(this.aChildren[iChild].waitForCalcDisplay) === "function"){
            iWait =  iWait + this.aChildren[iChild].waitForCalcDisplay();
        }
    }
    
    return iWait;
},

// - - - - - - - - - - VALIDATION FUNCTIONALITY - - - - - - - - - - 

/*
Validates all the Data Entry Objects in the Form separately. Note that this 
doesn't execute server side & ClientDataDictionary.onValidate validations.

@return Error number (0 if no errors occurred).
*/
validate : function(){
    var iResult = 0, iDeo, iError;
    
    for(iDeo = 0; iDeo < this.aDEOs.length; iDeo++){
        iError = this.aDEOs[iDeo].validate();
        
        if(iError > 0 && iResult === 0){
            iResult = iError;
        }
    }
    
    return iResult;
},

/*
Handles the onSubmit event of the Form and performs a validation. If errors 
occur the submit is cancelled.

@param  oEvent  Event object.
@private
*/
onSubmitValidate : function(oEvent){
    if(this.validate() > 0){
        oEvent.stop();
    }
},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    if(this.eElement){
        vdf.events.clearDomListeners(this.eElement);
    }
}

}); 
