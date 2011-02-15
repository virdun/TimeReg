/*
Name:
    vdf.deo.Password
Type:
    Prototype
Extends:
    vdf.core.TextField
Revisions:
    2009/01/07  Initial version in the new 2.0 architecture. (HW, DAE)
*/

/*
@require    vdf/core/TextField.js
*/

/*
Constructor of that calls the super constructor (of the TextField) and applies to 
the initializer interface (see vdf.core.init).

@param  eText           Reference to the DOM element.
@param  oParentControl  Reference to the parent control.
*/
vdf.deo.Password = function Text(eText, oParentControl){
    this.TextField(eText, oParentControl);
};
/*
This class implements the password field. It extends the vdf.core.TextField.

@code
<input type="password" name="user__password" value="" />
@code
*/
vdf.definePrototype("vdf.deo.Password", "vdf.core.TextField", {


});
