/*
Name:
    vdf.core.DEO
Type:
    Prototype
Revisions:
    2008/01/31  Created the initial interface. (HW, DAE)
*/

/*
Constructor that defines the default DEO properties.
*/
vdf.core.DEO = function DEO(eElement, oParentControl){
    this.Control(eElement, oParentControl);
    /*
    Reference to the server data dictionary. Can be set from the HTML API using 
    the sServerTable (html: vdfServerTable) property.
    */
    this.oServerDD = null;
    /*
    Property used during initialization to determine the server data dictionary 
    (see: oServerDD property).
    
    @html
    @htmlbubble
    */
    this.sServerTable = null;
    
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
    
    //  @privates
    this.bIsDEO = true;
    this.oErrorDisplay = null;
    
    this.iLocked = 0;
};
/*
Defines the Data Entry interface that is used by the Data Dictionary. Most 
methods are empty stub methods that should be implemented by the actual object.
*/
vdf.definePrototype("vdf.core.DEO", "vdf.core.Control", {

/*
Is called when the the data dictionary binding needs to be initialized.
*/
bindDD : function(){

},

/*
Several data entry objects need the posibility to work withouth data binding. 
In this cases this method should return false so the Data Dictionary will leave
them alone.

@return True if the DEO has a databinding.
*/
isBound : function(){
    return true;
},

/*
Called by the DD to notify about a buffer update of a specific field.

@param  sTable  Table name.
@param  sField  Field name.
@param  sValue  The new field value.
*/
fieldValueChanged : function(sTable, sField, sValue){

},

/*
Called by the DD to notify about a buffer update.
*/
refresh : function(oAction){

},

/*
Called by the DD to validate the field.

@param  oAction Reference to the action object.
@return Error number (0 if no error occurred, 1 if error occurred without error 
            number).
*/
validate : function(oAction){
    this.update();

    return 0;
},

/*
Called by the DD to make sure that the buffer is up-to-date. The data entry 
object will move its value to the Data Dictionary.
*/
update : function(){

},

/*
Called to get a meta data property.

@param  sProperty   Name of the property.
*/
getMetaProperty : function(sProperty){
    return null;
},

/*
Determines wether the USER has changed the value (since the last time the 
value was set by the system). 

@return True if the field value was changed since the last refresh.
*/
isChanged : function(){
    return false;
},

/*
Locks the DEO object.

@param  bExclusive  If true the lock is exclusive.
@param  oAction     Reference to the action object that performs the lock.
@private
*/
lock : function(bExclusive, oAction){
    this.iLocked++;
},

/*
Unlocks the DEO object.

@param  bExclusive  If true the lock was exclusive.
@param  oAction     Reference to the action object that performed the lock.
@private
*/
unlock : function(bExclusive, oAction){
    this.iLocked--;
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
		"<b>Data binding:</b> ", this.sDataBinding, "<br/>",
		"<b>Server DD:</b> ", (this.oServerDD ? this.oServerDD.sName : "unknown" ),
		"<br/>",
		this.Control.prototype.debugDetails.call(this, oErr)
	];
	
	return aHTML.join("");
}

});