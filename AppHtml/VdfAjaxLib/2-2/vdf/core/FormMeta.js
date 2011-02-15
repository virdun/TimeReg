/*
Name:
    vdf.core.FormMeta
Type:
    Prototype
Revisions:
    2009/07/31  Separated the vdf.core.Form functionallity over three classes 
    which allows developers to use specific functionallity of the Form / 
    AJAX Library. (HW, DAE)
*/

/*
Constructor of the FormMeta which applies to the interface required by the 
initialization system (vdf.core.init). Application developers usually don't need 
to use this constructor but will declare the object in HTML using the 
vdfControlType="vdf.code.FormMeta" class.

@param  eElement        Reference to the form DOM element.
@param  oParentControl  (optional) Reference to a control in which the Form is 
        nested.
@param  bSkipInit       (optional) If true the initialization won't be started 
        which is used by subclasses so they can create properties before the 
        initialization starts.
*/
vdf.core.FormMeta = function FormMeta(eElement, oParentControl, bSkipInit){
    this.FormBase(eElement, oParentControl, true);
    
    /*
    Name of the Web Object that belongs to this form. The Form will replicate 
    its DDO structure and find, save, clear & delete actions are performed on 
    that Web Object.
    */
    this.sWebObject             = this.getVdfAttribute("sWebObject", null);
    /*
    The URL to the webservice that can be used to access the Visual DataFlex web 
    application using the AJAX Library interface.
    */
    this.sWebServiceUrl         = this.getVdfAttribute("sWebServiceUrl", "WebService.wso");
    /*
    This property defines the target namespace URI that is used by the web 
    service implementing the AJAX Library interface.  
    */
    this.sXmlNS                 = this.getVdfAttribute("sXmlNS", "http://tempuri.org/");
    /*
    Reference to the meta data object (vdf.core.MetaData).
    */
    this.oMetaData              = new vdf.core.MetaData(this.sWebObject, this.sWebServiceUrl, this.sXmlNS);
    

    
    //  @privates
    this.iInitFinishedStage     = 5;
    
	//	Check required properties
	if(!this.sWebObject){
		throw new vdf.errors.Error(5143, "sWebObject is required", this, [ "sWebObject", "FormMeta" ]);
	}
	
    if(!bSkipInit){
        //  Start the loading proces
        this.initStage();
    }
	
	
};
/*
Version of the Form that is able to load the meta data from the server but 
doesn't build a DDO structure. This light version of the Form should be used 
when creating input forms that consist of (mostly) database fields so the 
business rules from the webapp can be applied but isn't used as a data entry 
view.
*/
vdf.definePrototype("vdf.core.FormMeta", "vdf.core.FormBase", {

// - - - - - - - - - - INITIALIZATION - - - - - - - - - - -

/*
Loads the global meta data.

@private
*/
initStageGlobalMetaFields : function(){
    //vdf.log("Form: Loading stage " + this.iInitStage + ": Global Meta Load & Field Scan");
    //  Load the global meta data
    this.oMetaData.loadGlobalData(this.onGlobalMetaLoaded, this);
    //  The fields add themself when they are created by the Initializer
},

/*
Loads the field meta data.

@private
*/
initStageFieldMeta : function(){
    //vdf.log("Form: Loading stage " + this.iInitStage + ": Field Meta Load");
    
    //  Load field meta data
    this.loadFieldMeta();
},

/*
Initialization is done in three stages where stages can contain multiple tasks.

Stage 1:
    1 - The global meta data is loaded ASynchronously from the server.
    2 - The document is scanned further and fields are added to the form.
    
Stage 2:
    3 - The field meta data is loaded ASynchronously from the server.
Stage 3:
    4 - Child objects (lists / grids / lookups) can initialize themself
    
Stage 4:
    x - The initialized are fired

@private
*/
initStage : function(){
    switch(this.iInitStage){
        case 1:
            this.initStageGlobalMetaFields();
            break;
        case 3:
            this.initStageFieldMeta();
            break;
        case 4:
            this.initStageChildren();
            break;
        case this.iInitFinishedStage:
            this.initStageFinalize();
            
            
    }
},

/*
Handler function called by the Meta Data system if the global meta data is 
loaded. Moves to the next step of the initialization proces.

@private
*/
onGlobalMetaLoaded : function(){
    this.iInitStage++;
    this.initStage();
},

/*
Loads the basic field data.

@private
*/
loadFieldMeta : function(){
    var aFields = [], iDEO;

    for(iDEO = 0; iDEO < this.aDEOs.length; iDEO++){
        if(this.aDEOs[iDEO].sDataBindingType == "D"){
            aFields.push(this.aDEOs[iDEO].sDataBinding);
        }
    }
    
    this.oMetaData.loadFieldData(aFields, this.onFieldMetaLoaded, this);
},

/*
Is called by the MetaData object if the field info is loaded. Moves on to the 
next step / stage of the initialization.

@private
*/
onFieldMetaLoaded : function(){
    this.iInitStage++;
    this.initStage();
},

// - - - - - - - - - - CENTRAL FUNCTIONALITY - - - - - - - - - - 

/*
Can be used to fetch global meta data properties. First it tries to load the 
property from the Form element, if not available there it loads the property 
from the meta data.

@param  sProp   Name of the meta data property.
@return Property value (null if not available)
*/
getMetaProperty : function(sProp){
    var sResult = this.getVdfAttribute(sProp, null);
    
    if(sResult === null){
        sResult = this.oMetaData.getGlobalProperty(sProp);
    }
    
    return sResult;
}

});