/*
Name:
    vdf.deo.Hidden
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
Constructor of that calls the super constructor (of the Field) and applies to 
the initializer interface (see vdf.core.init).

@param  eHidden         Reference to the DOM element.
@param  oParentControl  Reference to the parent control.
*/
vdf.deo.Hidden = function Hidden(eHidden, oParentControl){
    this.Field(eHidden, oParentControl);
};
/*
This class implements the hidden field. It extends the vdf.core.Field with 
specific functionality of hidden fields. The hidden fields are mostly used for 
user data fields or for rowid's (althrough it isn't required to define them). 
The initialization system will automatically recognizes <input type="hidden" 
elements and will create an instance of this class for each occurrence.

@code
<input type="hidden" name="customer__rowid" value="" />
@code
*/
vdf.definePrototype("vdf.deo.Hidden", "vdf.core.Field", {

/*
@private
*/
bFocusable : false,

/*
Overrides the focus method because a hidden field can't have the focus.
*/
focus : function(){

},

/*
@private
*/
displayLock : function(){

},

/*
@private
*/
displayUnlock : function(){

},

/*
@private
*/
initDisplayLock : function(){

}

});
