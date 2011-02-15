/*
Name:
    vdf.core.Toolbar
Type:
    Prototype
Revisions:
    2009/05/07  Initial version created to properly support the autosavestate of 
    the grid and return the focus. (HW, DAE)
*/


/*
Constructor that applies to the interface of the initialization system (see 
vdf.core.init).

@param  eElement        DOM element representing the toolbar.
@param  oParentControl  (optional) Reference to a parent control.
*/
vdf.core.Toolbar = function Toolbar(eElement, oParentControl){
    this.Control(eElement, oParentControl);

    /*
    Reference to the form on which the toolbar actions are applied. If 
    vdf.core.findForm will respect this setting when used inside the toolbar. 
    Can be set from HTML using the name of the Form (vdfForm="customer_form") 
    and from JavaScript using the reference (oToolbar.oForm = oCustomerForm). 
    Defaults to the Form in which the toolbar is nested.
    
    @html
    */
    this.oForm              = this.getVdfAttribute("oForm", null, false);

    /*
    If true the toolbar returns the focus to the last focused element on the 
    page after the onclick is fired. This only works if the onclick is not 
    cancelled. Also cancels the focus event on the toolbar (so the autosavestate 
    functionality of the Grid is blocked).
    */
    this.bReturnFocus       = this.getVdfAttribute("bReturnFocus", true, false);
    
    
    //  @privates
    this.eLastFocus = null;
};
/*
Toolbar component that makes a toolbar pointer only by automatically returning 
the focus to the last focused field after a click. It also makes it easier to 
have a toolbar outside of a form and switching between forms. The 
vdf.core.findForm is adjusted so if it is used inside the toolbar it will 
respect the oForm property of the Toolbar. An example of such a toolbar:

@code
<table class="Toolbar" vdfControlType="vdf.core.Toolbar" vdfName="main_toolbar" vdfForm="sizes_form">
    <tr>
        <td class="TextCell"> </td>
        <td class="ButtonCell"><input id="First" type="button" name="findfirst" value="" onclick="vdf.core.findForm(this).doFind(vdf.FIRST);" /></td>
        <td class="ButtonCell"><input id="Previous" type="button" name="findprev" value="" onclick="vdf.core.findForm(this).doFind(vdf.LT);" /></td>
        <td class="ButtonCell"><input id="Equal" type="button" name="find" value="" onclick="vdf.core.findForm(this).doFind(vdf.GE);" /></td>
        <td class="ButtonCell"><input id="Next" type="button" name="findnext" value="" onclick="vdf.core.findForm(this).doFind(vdf.GT);" /></td>
        <td class="ButtonCell"><input id="Last" type="button" name="findlast" value="" onclick="vdf.core.findForm(this).doFind(vdf.LAST);" /></td>
        <td>&nbsp;</td>
    
        <td class="TextCell"> </td>
        <td class="ButtonCell"><input id="Save" type="button" name="save" value="" onclick="vdf.core.findForm(this).doSave();"/></td>
        <td class="ButtonCell"><input id="Delete" type="button" name="delete" value="" onclick="vdf.core.findForm(this).doDelete();" /> </td>
        <td class="ButtonCell"><input id="Clear" type="button" name="clear" value="" onclick="vdf.core.findForm(this).doClear();" /></td>
        <td>&nbsp;</td>
    </tr>
</table>

@code
*/
vdf.definePrototype("vdf.core.Toolbar", "vdf.core.Control", {

/*
Initializes the toolbar by determining the initial form reference and attaching 
the nessecary events listeners.
*/
init : function(){
    //  Determine the form to be used
    if(this.oForm){
        if(typeof this.oForm === "string"){
            this.oForm = vdf.getForm(this.oForm);
        }
    }else{
        this.oForm = vdf.core.findForm(this.eElement);
    }
    
    
    //  Attach return focus functionallity
    if(this.bReturnFocus){
        if(vdf.sys.isMoz){  //  Mozilla doesn't bubble focus & blur events and hasn't got a FocusIn or FocusOut
            vdf.events.addDomCaptureListener("focus", document, this.onCaptureWinFocus, this);
        }else if(window.addEventListener){ // Other browsers with W3C event system have DOMFocusIn & DOMFocusOut that bbuble
            vdf.events.addDomListener("DOMFocusIn", this.eElement, this.onToolbarFocus, this);
            vdf.events.addDomListener("DOMFocusIn", document, this.onWinFocus, this);
        }else{ // IE bubbles focusin and focusout
            vdf.events.addDomListener("focusin", this.eElement, this.onToolbarFocus, this);
            vdf.events.addDomListener("focusin", document, this.onWinFocus, this);
        }
        
        vdf.events.addDomListener("click", this.eElement, this.onToolbarClick, this);
    }
},

/*
Mozilla doesn't bubble the focus event so we need to capture it and check if it 
orriginates from inside the toolbar and cancel it if it is. This check is slower 
but still is more correct as making the grid toolbar aware. Goal is to make sure 
the focus event doesn't reaches any elements that might take action on it. We 
also store which element was focussed for later usage.

@param  oEvent  Event object.
@private
*/
onCaptureWinFocus : function(oEvent){
    var oToolbar, eTarget = oEvent.getTarget();

    oToolbar = vdf.core.init.findParentControl(eTarget, this.sControlType);
    if(oToolbar !== null){
        oEvent.stop();
    }else{
        this.eLastFocus = eTarget;
    }
},

/*
Store the focussed element so we can return the focus later on.

@param  oEvent  Event object.
@private
*/
onWinFocus : function(oEvent){
    var eTarget = oEvent.getTarget();
    this.eLastFocus = eTarget;
},

/*
Other browsers bubble the focus event so we can simply stop it if it bubbles out 
of the toolbar. By stopping this event other controls can do anything with it.

@param  oEvent  Event object.
@private
*/
onToolbarFocus : function(oEvent){
    oEvent.stop();
},

/*
Handles the click event if it bubbles from one of the buttons to the toolbar and 
returns the focus to the last focussed element.

@param  oEvent  Event object.
@private
*/
onToolbarClick : function(oEvent){
    var eFocus = this.eLastFocus;
    
    if(eFocus && typeof eFocus.focus !== "undefined"){
        setTimeout(function(){
            vdf.sys.dom.focus(eFocus);
        }, 30);
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
        
        if(vdf.sys.isMoz){
            vdf.events.removeDomCaptureListener("focus", document, this.onCaptureWinFocus);
        }else if(window.addEventListener){
            vdf.events.removeDomListener("DOMFocusIn", document, this.onWinFocus);
        }else{
            vdf.events.removeDomListener("focusin", document, this.onWinFocus);
        }
    }
}

});