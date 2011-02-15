/*
Name:
    vdf.deo.DatePicker
Type:
    Prototype
Revisions:
    2008/10/08  Initial version created as extension of the rewritten 2.0 
    vdf.gui.Calendar component (HW, DAE)
*/

/*
@require    vdf/gui/Calendar.js
@require    vdf/core/Field.js
*/

/*
Constructor that calls it super and applies to the initializer interface.

@param  eElement        Reference to the DOM element.
@param  oParentControl  Reference to the parent control.
*/
vdf.deo.DatePicker = function DatePicker(eElement, oParentControl){
    this.Field(eElement, oParentControl);

    /*
    Reference to the vdf.gui.Calendar component.
    */
    this.oCalendar = new vdf.gui.Calendar(eElement, oParentControl);
    

};
/*
This class contains the inline calendar control data entry object. The component 
uses the vdf.gui.Calendar class to display a calendar inside the page. The basic 
data entry object implementation is inherited from the vdf.core.Field class. An 
instance can be created using the HTML declarative API on a div element. The 
example below shows a date picker with a custom name bound to the order_date 
field of the orderhea table.

@code
<div vdfControlType="vdf.deo.DatePicker" vdfName="myCalendar" vdfDataBinding="orderhea__order_date">
</div>
@code
*/
vdf.definePrototype("vdf.deo.DatePicker", "vdf.core.Field", {

/*
Called by the initialization engine to initialize the control. It initializes 
the calendar.
*/
init : function(){
    this.oCalendar.init();
},

/*
Called by the Form to initialize the DEO object. It reads the needed meta data 
properties and attaches the listeners.
*/
formInit : function(){
    if(this.getMetaProperty("sMaskType") === "dat"){
        this.oCalendar.sDateMask = this.getMetaProperty("sMask");
        this.oCalendar.updateToday();
    }
    
    this.oCalendar.onChange.addListener(this.onCalendarChange, this);
    
    this.sDisplayValue = this.getValue();
},

/*
Overrides the getValue method with the functionallity to load the value from the 
calendar.

@return The current value of the calendar.
*/
getValue : function(){
    if(this.oCalendar){
        return this.oCalendar.getValue();
    }else{
        return "";
    }
},

/*
Overrides the setValue method with the functionallity to update the calender.

@param  sValue          The new value (matching the date format).
    bNoNotify       (optional) If true the DD is not updated with this change.
    bResetChange    (optional) If true the display changed is cleared.
*/
setValue : function(sValue, bNoNotify, bNoResetChange){
    this.oCalendar.setValue(sValue);
    
    if(!bNoNotify){
        this.update();
    }

    this.sOrigValue = sValue;
    
    this.onChange.fire(this, { "sValue" : sValue });
    
    if(!bNoResetChange){
        this.sDisplayValue = this.getValue();
    }
},

/*
@private
*/
disable : function(){
    //  TODO: Implement disabled state for calendar
    this.bFocusable = false;
},

/*
@private
*/
enable : function(){
    //  TODO: Implement disabled state for calendar
    this.bFocusable = true;
},

/*
Handles the onchange event of the calender and calls the update function that 
will notify the DD of the new value.

@param  oEvent  Event object.
@private
*/
onCalendarChange : function(oEvent){
    this.update();
    
    this.onChange.fire(this, { "sValue" : oEvent.sValue });
},

/*
Called when the control is locked (because of a find / clear / save / delete 
action).

@private
*/
displayLock : function(){

},

/*
Called when the control is unlocked.

@private
*/
displayUnlock : function(){

},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    if(this.oCalendar){
        this.oCalendar.destroy();
    }
}
});