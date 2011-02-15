/*
Name:
    vdf.dataStructs
Type:
    Library (object)

Revisions:
    2008/01/10  Created the first version. (HW, DAE)
*/

/*
This library contains the definitions of the data structures that are used
withing the AJAX Library to store data. It matches the serverside structs from
the VDF WebApplication. The structs are used to store data which can easilly be
serialized (to XML) and send to the server. The vdf.ajax.xmlSerializer requires
the usage of these structs because it needs function names in the constructor.
*/
vdf.dataStructs = {

/*
Error that might belong to a specific field.
*/
TAjaxError : function TAjaxError(){
    this.iNumber = null;
    this.iLine = null;
    this.sTableName = null;
    this.sColumnName = null;
    this.sErrorText = null;
},

//
// A C T I O N   R E Q U E S T S
//

/*
User data field.
*/
TAjaxUserData : function TAjaxUserData(){
    this.sName = null;
    this.sValue = "";
},

/*
Structure representing a field within a snapshot or the ClientDataDictionary.
*/
TAjaxField : function TAjaxField(){
    this.__isField = true;
    this.sBinding = null;   //  Expression or <field>.<value>
    this.sType = "D";       //  "D" for database field "E" for expression "R" for rowid
    this.sValue = "";     //  Current value for the field
    this.bChanged = false;  //  True if the value is changed
},

/*
Structure representing a data dictionary within a snapshot.
*/
TAjaxDD : function TAjaxDD(){
    this.sName = null;
    this.tStatus = null;
    this.bLight = false;
    this.aFields = [];
},

/*
Structure representing a buffer snapshot container.
*/
TAjaxSnapShot : function TAjaxSnapShot(){
    this.aDDs = [];
},

//  RESPONSE DATA

/*
Structure representing a response of an action request set.
*/
TAjaxResponseSet : function TAjaxResponseSet(){
    this.sName = null;
    this.sResponseType = null;
    this.sResponseValue = null;
    
    this.sTable = null;
    this.sColumn = null;
    this.iRows = null;
    this.bFound = null;
    this.aRows = [];
    this.aUserData = [];
},

/*
Structure representing a response of an action request.
*/
TAjaxResponseData : function TAjaxResponseData(){
    this.aDataSets = [];
    this.aUserData = [];
    this.aErrors = [];
},

//  REQUEST DATA
/*
Structure representing a single action within an action request.
*/
TAjaxRequestSet : function TAjaxRequestSet(){
    this.sName = null;
    this.sRequestType = null;
    
    this.sMethod = null;
    this.asParams = [];

    this.iMaxRows = 1;
    this.sTable = null;
    this.sColumn = null;
    this.sIndex = null;
    this.sFindMode = null;
    this.sFindValue = null;
    this.bReturnCurrent = false;
    this.bLoadStatus = true;

    this.aRows = [];
    this.aUserData = [];
},

/*
Structure representing a action request containing multiple actions.
*/
TAjaxRequestData : function TAjaxRequestData(){
    this.sSessionKey = null;
    this.sWebObject = null;
    this.aDataSets = [];
    this.aUserData = [];
},

//  FIELD VALIDATION

/*
Structure representing a field validation request.
*/
TAjaxValidationRequest : function TAjaxValidationRequest(){
    this.sSessionKey = null;
    this.sWebObject = null;
    this.sFieldName = null;
    this.tRow = null;
},

/*
Structure representing a field validation response.
*/
TAjaxValidationResponse : function TAjaxValidationResponse(){
    this.sFieldName = null;
    this.sFieldValue = null;
    this.iError = null;
    this.aErrors = null;
},


//
// M E T A   D A T A
//

/*
Structure representing the meta data of a data dictionary.
*/
TAjaxMetaDD : function TAjaxMetaDD(){
    // Structure contains information about a table and an array with column information.
    this.sName = null;
    this.sDriverName = null;
    this.aServers = [];
    this.sConstrainFile = null;
    this.bValidate_Foreign_File_State = null;
},

/*
Structure representing the meta data of a web object.
*/
TAjaxMetaWO : function TAjaxMetaWO(){
    this.sName = null;
    this.sDateMask = null;
    this.sDecimalSeparator = null;
    this.iDate4_State = null;
    this.iEpoch = null;

    this.aDDs = [];
    this.aErrors = [];
},

/*
Structure representing the meta data of a field.
*/
TAjaxMetaField : function TAjaxMetaField(){
    this.sName = null;
    this.sTable = null;

    this.bAutoFind = null;
    this.bAutoFindGE = null;
    this.bCapsLock = null;
    this.bDisplayOnly = null;
    this.bFindReq = null;
    this.bNoEnter = null;
    this.bNoPut = null;
    this.bRequired = null;
    this.bSkipFound = null;
    this.bZeroSuppress = null;
    this.bForeign_AutoFind = null;
    this.bForeign_AutoFindGE = null;
    this.bForeign_DisplayOnly = null;
    this.bForeign_FindReq = null;
    this.bForeign_NoEnter = null;
    this.bForeign_NoPut = null;
    this.bForeign_SkipFound = null;
    this.bValidateServer = null;

    this.iDataLength = null;
    this.iIndex = null;
    this.iPrecision = null;
    this.sCheck = null;
    this.sDataType = null;
    this.sDefaultValue = null;
    this.sMaskType = null;
    this.sMask = null;
    this.sMaxValue = null;
    this.sMinValue = null;
    this.sChecked = null;
    this.sUnchecked = null;
    this.sShortLabel = null;
    this.sStatusHelp = null;
},

/*
Structure representing the response to a fields meta data request.
*/
TAjaxMetaFields : function TAjaxMetaFields(){
    this.aFields = [];
    this.aErrors = [];
},

/*
Structure representing an extra property in the meta data.
*/
TAjaxMetaProperty : function TAjaxMetaProperty(){
    this.sProperty = null;
    this.sValue = null;
},

/*
Structure representing the result of an extra property request for a field.
*/
TAjaxMetaPropField : function TAjaxMetaPropField(){
    this.sTable = null;
    this.sField = null;
    this.aProperties = [];
},

/*
Structure representing the result of an extra property request.
*/
TAjaxMetaProperties : function TAjaxMetaProperties(){
    this.aFields = [];
    this.aErrors = [];
},

/*
Structure representing a description value.
*/
TAjaxDescriptionValue : function TAjaxDescriptionValue(){
    this.sValue = null;
    this.sDescription = null;
},

/*
Structure representing the response for a description values request.
*/
TAjaxMetaDescriptionValues : function TAjaxMetaDescriptionValues(){
    this.sTable = null;
    this.sField = null;
    this.aValues = [];
    this.aErrors = [];
},

//
// R E M O T E   M E T H O D   I N V O C A T I O N
//
/*
Structure representing the result of a remote method invocation 
(vdf.ajax.VdfCall) response.
*/
TAjaxRMIResponse : function TAjaxRMIResponse(){
    this.sReturnValue = null;
    this.aErrors = [];
},

//
// A J A X   T R E E   V I E W
//
TAjaxTreeNode : function TAjaxTreeNode(){
	this.sName = null;
	this.sAltText = null;
    
    this.sId = null;
    this.sValue = null;
    this.sIconClass = null;
    this.sParentId = null;
    this.bExpanded = false;
    this.bHasChildren = false;
    
    this.__aSubItems = [];
    this.__tParent = null;
    this.__eElement = null;
    this.__eSubMenuRow = null;
    this.__eSubMenuTable = null;
    this.__fSelectHandler = null;
    this.__oSelectEnv = null;
    
    this.__bChildrenLoaded = false;
    this.__bIsLoading = false;
}

};
vdf.register("vdf.dataStructs");