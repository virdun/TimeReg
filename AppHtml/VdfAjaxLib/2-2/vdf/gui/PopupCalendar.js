/*
Name:
    vdf.gui.PopupCalendar
Type:
    Prototype
Revisions:
    2008/10/08  Initial version created after rewriting the Calendar for the 
    2.0 release (HW, DAE)
*/

/*
@require    vdf/gui/Calendar.js
*/


/*
Constructor that applies to the initializer interface.

@param  eElement        DOM element that will open the calendar.
@param  oParentControl  (optional) Parent control like a Form or Grid.
*/
vdf.gui.PopupCalendar = function PopupCalendar(eElement, oParentControl){
    this.Control(eElement, oParentControl);
    
    /*
    The CSS class set to the generated popup calendar.
    */
    this.sCssClass = this.getVdfAttribute("sCssClass", "popupcalendar", true);
    /*
    Optional, the field name or data binding of the data entry object that 
    should be filled with the value and is used to determine the initial date. 
    Requires the popup calendar to be defined inside a Form.
    */
    this.sFieldName = this.getVdfAttribute("sFieldName", null, false);
    /*
    Optional, reference to an input element that should be filled with the 
    picked date and is used to determine the initial date.
    */
    this.eInput = null;
    /*
    If true the popup calendar attaches itself to the onclick event of the 
    opening element. If a sFieldName is given it also sets itself as the lookup 
    object for this field (usually opened using F4).
    */
    this.bAttach = this.getVdfAttribute("bAttach", true, false);
    
    /*
    The date format used when getting and setting the date.
    
    @html
    @htmlbubble
    */
    this.sDateFormat = null;
    /*
    The date mask used for displaying the date (in the the today bar).
    
    @html
    @htmlbubble
    */
    this.sDateMask = null;
    /*
    The date separator used within the date format.
    
    @html
    @htmlbubble
    */
    this.sDateSeparator = null;
    
    /*
    This event is fired if the user presses enter or clicks a date within the 
    calendar. If the event is stopped the date will not be moved to the field 
    and the calendar will not close.
    
    @prop   iYear   The (new) current year.
    @prop   iDate   The (new) current date.
    @prop   iMonth  The (new) current month.
    @prop   sValue  The (new) current date as a string.
    */
    this.onEnter = new vdf.events.JSHandler();
    /*
    This event is fired if the user closes the calendar without selecting a 
    date. If the event is stopped the calendar will not close.
    
    @prop   iYear   The (new) current year.
    @prop   iDate   The (new) current date.
    @prop   iMonth  The (new) current month.
    @prop   sValue  The (new) current date as a string.
    */
    this.onClose = new vdf.events.JSHandler();
    /*
    This event is fired before the popup calendar is displayed. If the event is 
    canceled the calendar will not display.
    */
    this.onBeforeDisplay = new vdf.events.JSHandler();
    /*
    This event is fired after the calendar is displayed. It can be used to 
    change the displayed date using the reference to the vdf.gui.Calendar object.
    
    @prop   oCalendar   Reference to the vdf.gui.Calendar object.
    */
    this.onAfterDisplay = new vdf.events.JSHandler();

    
    // @privates
    this.eContainerDiv = null;
    this.oCalendar = null;
    this.oField = null;
    
    
    //  Find reference to form
    if(oParentControl !== null && typeof(oParentControl) === "object"){
        if(oParentControl.bIsForm){    
            this.oForm = oParentControl;
        }else if(typeof(oParentControl.getForm) === "function"){
            this.oForm = oParentControl.getForm();
        }
    }
};
/*
A wrapper for the vdf.gui.Calendar that displays it as a popup window inside the 
page. It contains the functionality to bind it to a field so it gets and sets 
the value from there. The Calendar can be used by declaring it in the page 
using the vdfControlType="PopupCalendar" or by calling the 
vdf.gui.show_FieldPopupCalendar. It can also work directly on input elements 
using the vdf.gui.show_FieldPopupCalendar method.

Declarative (inside a Form):
@code
<input type="button" vdfControlType="popupcalendar" vdfFieldName="order__date" vdfDisplayToday="false" />
@code
JavaScript API:
@code
<input type="button" onclick="vdf.gui.showPopupCalendar(this, document.getElementById('myspecialdatefield'), 'YYYY/MM/DD');" />
@code
JavaScript API (inside a Form):
@code
<input type="button" onclick="vdf.gui.showPopupCalendar(this, 'orderhea__order_date');" />
@code
*/
vdf.definePrototype("vdf.gui.PopupCalendar", "vdf.core.Control", {

/*
Initialize by finding a reference to the Field object. It tries to find a date 
format and if needed it attaches the onclick of the button and sets itself as 
the oLookup of the field.

@private
*/
formInit : function(){
    var oField;
    
    //  Find a reference to the field
    if(this.sFieldName !== null){
        oField = (this.oForm && this.oForm.getDEO(this.sFieldName)) || vdf.getControl(this.sFieldName);

        if(oField !== null){
            this.oField = oField;
            
            //  Attach to the field object (so it opens on the lookup key (F4))
            if(this.bAttach){
                oField.oLookup = this;
            }
        }
    }
    
     //  Load date format
    if(this.oForm !== null){
        this.sDateFormat = this.getVdfAttribute("sDateFormat", this.oForm.oMetaData.getGlobalProperty("sDateFormat"), true);
        this.sDateMask = this.getVdfAttribute("sDateMask", (this.oField !== null ? this.oField.getMetaProperty("sMask") : this.oForm.oMetaData.getGlobalProperty("sDateFormat")), true);
        this.sDateSeparator = this.getVdfAttribute("sDateSeparator", this.oForm.oMetaData.getGlobalProperty("sDateSeparator"), true);
    }
    
    //  Attach event listeners
    if(this.bAttach){
        vdf.events.addDomListener("click", this.eElement, this.onButtonClick, this);
    }
},  

/*
Displays the calendar popup and tries to load the value into it.

@param  oSource (not used) Source object for the action.
*/
display : function(oSource){
    var eContainerDiv, oCalendar, sValue = "";
    
    if(this.oCalendar === null){
        if(this.onBeforeDisplay.fire(this, {})){
            //  Generate a absolute positioned div in which the calendar should be displayed.
            eContainerDiv = document.createElement("div");
            eContainerDiv.className = this.sCssClass;
            vdf.sys.dom.insertAfter(eContainerDiv, this.eElement);
            
            //  Generate the calendar
            oCalendar = new vdf.gui.Calendar(this.eElement, this);
            oCalendar.eContainerElement = eContainerDiv;
            oCalendar.onEnter.addListener(this.onCalendarEnter, this);
            oCalendar.onClose.addListener(this.onCalendarClose, this);
            oCalendar.bExternal = true;
            this.eElement.oVdfControl = this;
            
            if(this.sDateFormat !== null){
                oCalendar.sDateFormat = this.sDateFormat;
            }
            if(this.sDateMask !== null){
                oCalendar.sDateMask = this.sDateMask;
            }
            if(this.sDateSeparator !== null){
                oCalendar.sDateSeparator = this.sDateSeparator;
            }
            
            oCalendar.construct();
            
            //  Find & set the value
            if(this.oField !== null){
                sValue = this.oField.getValue();
             
            }else if(this.eInput !== null){
                sValue = this.eInput.value;
            }
            
            if(!oCalendar.setValue(sValue)){
                //  If the value is not set display the calendar on the default date (today)
                oCalendar.displayCalendar();
            }
            
            oCalendar.takeFocus();
            
            // for IE <= 6
            vdf.sys.gui.hideSelectBoxes(eContainerDiv, null);
            
            this.eContainerDiv = eContainerDiv;
            this.oCalendar = oCalendar;
            
            this.onAfterDisplay.fire(this, { oCalendar : oCalendar });
        }
    }
},

/*
Hides the popup dialog and fires the onClose.
*/
hide : function(){
    if(this.oCalendar !== null){
        // for IE <= 6
        vdf.sys.gui.displaySelectBoxes(this.eContainerDiv, null);
    
        this.oCalendar.destroy();
        this.oCalendar = null;
        this.eContainerDiv.parentNode.removeChild(this.eContainerDiv);
        this.eContainerDiv = null;

    }
},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    this.hide();
    
    if(this.bHandleOnClick && this.eElement){
        vdf.events.removeDomListener("click", this.eElement, this.onButtonClick);
    }
    this.eElement = null;
    this.eContainerDiv = null;
    
    this.oParentControl = null;
    this.oCalendar = null;
},

/*
Handles the onclick event of the eElement element if attached.

@param  oEvent  Event object

@private
*/
onButtonClick : function(oEvent){
    if(this.oCalendar === null){
        this.display();
    }else{
        this.hide();
    }
},

/*
Handles the onEnter event of the calendar object and hides the calendar after 
loading the value.

@param  oEvent  Event object

@private
*/
onCalendarEnter : function(oEvent){
    var sValue;

    if(this.onEnter.fire(this, { iYear : oEvent.iYear, iMonth : oEvent.iMonth, iDate : oEvent.iDate, sValue : oEvent.sValue })){
        sValue = oEvent.sValue;
        
        this.hide();
        
        if(this.oField !== null){
            this.oField.setValue(sValue);
            this.oField.focus();
        }else if(this.eInput !== null){
            this.eInput.value = sValue;
            vdf.sys.dom.focus(this.eInput);
        }
    }else{
        return false;
    }
},

/*
Handles the onClose event of the calendar and hides the calendar.

@param  oEvent  Event object

@private
*/
onCalendarClose : function(oEvent){
    if(this.onClose.fire(this, { iYear : oEvent.iYear, iMonth : oEvent.iMonth, iDate : oEvent.iDate, sValue : oEvent.sValue })){
        this.hide();
    }else{
        return false;
    }
}

});

/*
Displays a popup calender next to the eOpener element and gets and sets the 
value of the field with the given sFieldName.

DEPRECATED (replaced by vdf.gui.showPopupCalendar)!

@param  eOpener         DOM element that opens the calendar.
@param  sFieldName      Name of the field.
@param  sDateFormat     (optional) The date format used to get and set the date 
            from the field.
@param  sDateMask       (optional) Mask used when displaying a date.
@param  sDateSeparator  (optional) Date separator used within the date format.
*/
vdf.gui.show_FieldPopupCalendar = function(eOpener, sFieldName, sDateFormat, sDateMask, sDateSeparator){
    return vdf.gui.showPopupCalendar(eOpener, sFieldName, sDateFormat, sDateMask, sDateSeparator);
};

/*
Displays a popup calendar next to the eOpener element and gets & sets the value
of the eInput element.

DEPRECATED (replaced by vdf.gui.showPopupCalendar)!

@param  eOpener     Element that opens the calendar.
@param  eInput      Input element to get and set the value from.
@param  sDateFormat     (optional) The date format used to get and set the date 
            from the field.
@param  sDateMask       (optional) Mask used when displaying a date.
@param  sDateSeparator  (optional) Date separator used within the date format.
*/
vdf.gui.show_InputPopupCalendar = function(eOpener, eInput, sDateFormat, sDateMask, sDateSeparator){
    return vdf.gui.showPopupCalendar(eOpener, eInput, sDateFormat, sDateMask, sDateSeparator);
};

/*
This method can be used to display the PopupCalendar manually. It will create a 
new vdf.gui.PopupCalendar and display it immediately. The oTarget can be used to 
dynamically determine the "target" for the date. It can be passed a field name 
as string, a reference to a Data Entry Object, a reference to a DOM input field 
or a reference to a method. If a method is given it will be attached to the 
onEnter event of the vdf.gui.PopupCalendar.

The following example shows how the showPopupCalendar can be used within a form 
on a Data Entry Object by only passing its name:
@code
<input type="text" name="mydate" vdfDataType="date" />
<input type="button" onclick="vdf.gui.showPopupCalendar(this, 'mydate');"  class="CalendarButton" />
@code

The following example shows how the showPopupCalendar method can be used in 
combination with a handler function:
@code
<script>
function displayCalendar(eBtn){
    var oPopCal = vdf.gui.showPopupCalendar(eBtn, handleCalendarEnter, 'YYYY/MM/DD');
}

function handleCalendarEnter(oEvent){
    vdf.gui.alert("We have picked the date: " + oEvent.sValue);
}
</script>

...

<input type="button" onclick="displayCalendar(this);" />
@code

The following example shows how to use this method outside a form:
@code
<input type="text" id="mydate" size="10" />
<input type="button" onclick="vdf.gui.showPopupCalendar(this, document.getElementById('mydate'), 'YYYY/MM/DD');" class="CalendarButton" />
@code

@param  eOpener         Reference to a DOM element that opened the calendar.
@param  oTarget         This parameter is a dynamic "target" which can be a DEO 
            object, reference to input element, string field name or a function. 
@param  sOptDateFormat      (optional) The date format used to get and set the 
            date from the field.
@param  sOptDateMask        (optional) Mask used when displaying a date.
@param  sOptDateSeparator   (optional) Date separator used within the date format.
*/
vdf.gui.showPopupCalendar = function(eOpener, oTarget, sOptDateFormat, sOptDateMask, sOptDateSeparator, oOptEnvir){
    var oForm = null, oPopCal;
    
    oPopCal = new vdf.gui.PopupCalendar(eOpener, null);
    oPopCal.bAttach = false;
    
    //  The second parameter determines where the value needs to go
    if(typeof(oTarget) === "function"){ //  If it is a function we attach it to the onEnter event
        oPopCal.onEnter.addListener(oTarget, (oOptEnvir ? oOptEnvir : null));
        oForm = vdf.core.findForm(eOpener);
    }else if(typeof(oTarget) === "object"){
        if(oTarget.bIsDEO){ //  Check if it is an VDF Data Entry Object
            oPopCal.oField = oTarget;
            oForm = oTarget.oForm;
        }else{  //  Else we assume it is an input element
            oPopCal.eInput = oTarget;
            oForm = vdf.core.findForm(oTarget);
        }
    }else if(typeof(oTarget) === "string"){ //  A string means fieldname
        oPopCal.sFieldName = oTarget;
        oForm = vdf.core.findForm(eOpener);
    }
    
    oPopCal.oForm = oForm;
    oPopCal.formInit();
    
    if(typeof(sOptDateFormat) === "string"){
        oPopCal.sDateFormat = sOptDateFormat;
    }
    if(typeof(sOptDateMask) === "string"){
        oPopCal.sDateMask = sOptDateMask;
    }
    if(typeof(sOptDateSeparator) === "string"){
        oPopCal.sDateSeparator = sOptDateSeparator;
    }
    oPopCal.display();
    
    return oPopCal;
};