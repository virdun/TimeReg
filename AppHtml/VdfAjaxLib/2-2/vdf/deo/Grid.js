/*
Name:
    vdf.deo.Grid
Type:
    Prototype
Extends:
    vdf.core.List
Revisions:
    2005/10/24  Created the initial version. (HW, DAE)
    2008/02/15  Started a full rewrite for the 2.0 architecture. (HW, DAE)
*/

/*
@require    vdf/core/List.js
*/

/*
Constructor that applies to the interface required by the initialization system 
(see vdf.core.init). Calls the super constructor of the List.

@param  eElement        Reference to the form DOM element.
@param  oParentControl  Reference to a parent control.
*/
vdf.deo.Grid = function Grid(eElement, oParentControl){
    this.List(eElement, oParentControl);

    /*
    If true the grid will be able to hold the focus. Defaults to false because 
    the fields in the grid are usually already able to have the focus.
    */
    this.bHoldFocus         = this.getVdfAttribute("bHoldFocus", false);
    /*
    If true the grid will take the focus. Defaults to false because the fields 
    inside the grid already have this functionallity.
    */
    this.bFocus             = this.getVdfAttribute("bFocus", false);
    /*
    If true the grid will always display an empty row at the end which can be 
    used to add a new record.
    */
    this.bDisplayNewRow     = this.getVdfAttribute("bDisplayNewRow", true);
    /*
    This property determines if the grid will try to save the record if another row is selected. If 
    no changes are made no save will be performed.
    */
    this.bAutoSaveState     = this.getVdfAttribute("bAutoSaveState", true);
    /*
    This property determines if the grid will try to save the record when losing focus. If no 
    changes are made no save will be performed. Please note that this can cause validation errors to 
    display if the user leaves the grid.
    */
    this.bAutoSaveOnBlur    = this.getVdfAttribute("bAutoSaveOnBlur", false);
    /*
    If true the column width is locked after initialization. Usually this isn't 
    nesecary with grids because the fields do make sure the the column width 
    is correct.
    */
    this.bFixedColumnWidth  = this.getVdfAttribute("bFixedColumnWidth", false);
    /*
    The CSS class that is set to the edit row of the grid.
    */
    this.sCssRowEdit        = this.getVdfAttribute("sCssRowEdit", "rowedit");
    
    /*
    Fired if the grid lozes the focus.
    */
    this.onBlur = new vdf.events.JSHandler();
    /*
    Fired if the grid receives the focus.
    */
    this.onFocus = new vdf.events.JSHandler();
    /*
    Fires before the grid tries to save a row. If stopped the save is cancelled.
    */
    this.onConfirmSave = new vdf.events.JSHandler();
    /*
    Fires before the grid tries to clear a row to its orrigional values. If 
    stopped the clear is cancelled.
    */
    this.onConfirmClear = new vdf.events.JSHandler();
    /*
    Fires before the grid scrolls to the next row if the user tabs out of the 
    last field. If stopped the scrolldown is cancelled, note that if stopped the 
    focus will stay on the "hidden" focus anchor.
    
    @private
    */
    this.onBeforeTabToNextRow = new vdf.events.JSHandler();
    
    //  @privates
    this.aFields = [];
    //  If the focus moves to one of the elements (or the children) in this array the autosave is not performed
    this.aAutoSaveStateExceptions = [];
    
    this.bSaveAction = false;
    this.oSaveInitiator = null;
    this.oSaveFinished = null;
    
    this.eEditRow = null;
    
    this.bHasFocus = false;
    this.bDetectBlur = true;
    this.bDetermineBlur = false;
    this.bSkipAutoSave = false;
    
};
/*
This class contains the implementation of the Grid component. It extends the vdf.core.List with the 
functionality to editor the selected row. The Grid implements the Data Entry Object interface 
(defined in vdf.core.DEO) so the vdf.core.ClientDataDictionary will is able to send it refresh 
messages. Important in this is the sServerTable property which defines to which DDO the grid will 
register itself. The Grid should be used within a vdf.core.Form component to be able to work 
properly.

Within the HTML the Grid can be declared using a table which should have at least a display row and 
an edit row. The display row is duplicated for all the records that are displayed by the grid. Data 
Entry Objects within the row (usually DOM fields) should be used to display the values of the record 
based on their data binding. The edit row represents the selected row of the grid and should also 
contain Data Entry Objects to display the record values and to allow the user to edit them. The 
DEO's used in the edit row are registered at the form like regular fields and will behave like 
regular fields. The vdfRowType attribute should be used on the row (tr) element so the grid engine 
knows which row is being defined. For the display and edit row these are vdfRowType="display" and 
vdfRowType="edit".

The third row type that can be used is the vdfRowType="header". If the vdfDataBinding is used within 
this row the list engine will allow the user to change the index by clicking this element. To use 
one of the labels from the data dictionary the vdfControlType="label" can be added to this element 
without breaking the switch index functionality. This system replaces the bAutoLabel functionality 
from the older versions. So in the example below the th element will be filled with the short_label 
from the Data Dictionary.

@code
<table vdfControlType="grid" vdfControlName="numbers_grid" vdfTable="numbers" vdfServerTable="numbers" vdfAlwaysInOrder="false" vdfRowLength="8">
    <tr vdfRowType="header">
        <th vdfDataBinding="numbers__phone_number">Phone Number</th>
        <th vdfControlType="label" vdfDataBinding="numbers__description"> </th>
    </tr>
    <tr vdfRowType="display">
        <td vdfDataBinding="numbers__phone_number">&nbsp;</td>
        <td vdfDataBinding="numbers__description">&nbsp;</td>
    </tr>
    <tr vdfRowType="edit">
        <td>
            <input type="text" size="20" name="numbers__phone_number" value="" />
        </td>
        <td>
            <select name="numbers__description" id="numbers__description"></select>                                         
        </td>
    </tr>
</table>
@code

The example above shows a simple grid displaying two fields from the numbers table. Important 
properties here are the vdfTable and the vdfServerTable. The main table is the table on which 
the finds are actually performed. The vdfAlwaysInOrder is set to false because else wise the grid 
would expect new records always to stay on the bottom (which is the case with hidden auto number 
fields like in the Order Entry grid example).
*/
vdf.definePrototype("vdf.deo.Grid", "vdf.core.List", {

/*
@private
*/
initializeComponents : function(){
    var iField, eHiddenAnchor;
    
    //  Check for elements
    if(!this.eEditRow){
        throw new vdf.errors.Error(5139, "Edit row is required", this);
    }
    
    //  Call super
    this.List.prototype.initializeComponents.call(this);
    
    //  Add key listeners
    for(iField = 0; iField < this.aFields.length; iField++){
        this.aFields[iField].addKeyListener(this.onKey, this);
        this.aFields[iField].addDomListener("focus", this.onFieldFocus, this);
    }
    
    //  Attach events that are going to determine the global grid blur event
    if(vdf.sys.isMoz){  //  Mozilla doesn't bubble focus & blur events and hasn't got a FocusIn or FocusOut
        vdf.events.addDomCaptureListener("blur", this.eElement, this.onTableBlur, this);
        vdf.events.addDomCaptureListener("focus", document, this.onCaptureWinFocus, this);
    }else if(window.addEventListener){ // Other browsers with W3C event system have DOMFocusIn & DOMFocusOut that bbuble
        vdf.events.addDomListener("DOMFocusIn", document, this.onWinFocus, this);
        vdf.events.addDomListener("DOMFocusIn", this.eElement, this.onTableFocus, this);
        vdf.events.addDomListener("DOMFocusOut", this.eElement, this.onTableBlur, this);
    }else{ // IE bubbles focusin and focusout
        vdf.events.addDomListener("focusin", document, this.onWinFocus, this);
        vdf.events.addDomListener("focusin", this.eElement, this.onTableFocus, this);
        vdf.events.addDomListener("focusout", this.eElement, this.onTableBlur, this);
    }
    
    if(this.aFields.length > 0){
        eHiddenAnchor = document.createElement("a");
        eHiddenAnchor.href = "javascript: vdf.sys.nothing();";
        eHiddenAnchor.style.textDecoration = "none";
        eHiddenAnchor.hideFocus = true;
        eHiddenAnchor.innerHTML = "&nbsp;";
        eHiddenAnchor.style.position = "absolute";
        eHiddenAnchor.style.left = "-3000px";
        
        //vdf.sys.dom.insertAfter(eHiddenAnchor, this.eElement);
        
        this.aFields[this.aFields.length - 1].insertElementAfter(eHiddenAnchor);
        vdf.events.addDomListener("focus", eHiddenAnchor, this.onHiddenAnchorFocus, this);
    }
    
    
    //  Add onclear listener to create our own clear functionallity
    this.oServerDD.onBeforeClear.addListener(this.onServerBeforeClear, this);
    this.oServerDD.onBeforeDelete.addListener(this.onServerBeforeDelete, this);
    

    
    //  Set classname
    this.eEditRow.className = this.sCssRowEdit;
},

/*
Properly destroys the grid.
*/
destroy : function(){
    this.List.prototype.destroy.call(this);
    
    this.eEditRow = null;
    
    //  Manually remove the document listeners
    if(vdf.sys.isMoz){
        vdf.events.removeDomCaptureListener("focus", document, this.onCaptureWinFocus);
    }else if(window.addEventListener){
        vdf.events.removeDomListener("DOMFocusIn", document, this.onWinFocus);
    }else{
        vdf.events.removeDomListener("focusin", document, this.onWinFocus);
    }
},

// - - - - - - - - - - - BLUR / FOCUS DETECTION - - - - - - - - - - - 

/*
If a blur is bubbled / captured on the table we remember this for possible 
focus events.

@param  oEvent  The event object.
@private
*/
onTableBlur : function(oEvent){
    if(this.bDetectBlur){
        this.bDetermineBlur = true;
    }
},

/*
The mozilla window focus is fetched here and we try to to determine if the 
target is part of the grid (if not the focus left the grid so we execute the 
blur) by searching the parent elements for the table element. We set 
bDetermineBlur to false before executing the blur to prevent looping.

@param  oEvent  The event object.
@private
*/
onCaptureWinFocus : function(oEvent){
    var eElement = oEvent.getTarget();
    
    if(this.bDetectBlur && this.bDetermineBlur && !vdf.sys.dom.isParent(eElement, this.eElement)){
        this.bDetermineBlur = false;
        
        if(this.isAutoSaveStateException(eElement)){
            this.bSkipAutoSave = true;
            this.doBlur();
            this.bDetermineBlur = true;
        }else{
            this.doBlur();
            this.bDetermineBlur = false;
        }
    }else{
        this.bDetermineBlur = false;
    }
},

/*
If a focus bubbles to the window and bDetermineBlur is (still) true we know
that an element outside the grid has received the focus so the grid has lost 
it. It executes the blur functionallity after bDetermineBlur is set to false to 
prevent looping.

@param  oEvent  The event object.
@private
*/
onWinFocus : function(oEvent){
    if(this.bDetectBlur && this.bDetermineBlur){
        this.bDetermineBlur = false;
        
        if(this.isAutoSaveStateException(oEvent.getTarget())){
            this.bSkipAutoSave = true;
            this.doBlur();
            this.bDetermineBlur = true;
        }else{
            this.doBlur();
            this.bDetermineBlur = false;
        }
    }else{
        this.bDetermineBlur = false;
    }
},

/*
If focus bubbles to the table we know that the focus is still in the grid and 
we set bDetermineBlur to false so onWinFocus won't execute the grids blur 
functionallity.

@param  oEvent  The event object.
@private
*/
onTableFocus : function(oEvent){
    this.bDetermineBlur = false;
},

/*
Handles the field focus event and calls doFocus if the grid wasn't having the 
focus already.

@param  oEvent  Event object.
@private
*/
onFieldFocus : function(oEvent){
    if(!this.bHasFocus){
        this.doFocus();
    }
},

/*
Sets the bHasFocus property to true and fires the onFocus event.

@private
*/
doFocus : function(){
    this.bHasFocus = true;
    
    //  Set focussed style
    if(this.eElement.tBodies[0].className.match("focussed") === null){
        this.eElement.tBodies[0].className += " focussed";
    }
    
    this.onFocus.fire(this);
},


/*
Determines wether we should save and fires the onBlur event.
@private
*/
doBlur : function(){
    this.bHasFocus = false;
    
    //  Remove focussed style
    this.eElement.tBodies[0].className = this.eElement.tBodies[0].className.replace("focussed", "");
    
    this.onBlur.fire(this);

    if(!this.bSkipAutoSave && this.bAutoSaveOnBlur){
        return this.determineSave();
    }
    this.bSkipAutoSave = false;
},

/*
Determines if the element is (inside) one of the save state exception zones of 
the page.

@param  eElement    Reference to a DOM element.
@private
*/
isAutoSaveStateException : function(eElement){
    var iCur;
    
    //  Make sure we are not running loose
    if(eElement === null || this.aAutoSaveStateExceptions.length === 0){
        return false;
    }
    
    //  Check if the element is in the array
    for(iCur = 0; iCur < this.aAutoSaveStateExceptions.length; iCur++){
        if(eElement === this.aAutoSaveStateExceptions[iCur]){
            return true;
        }
    }
    
    //  Move to parent
    if(typeof(eElement.parentNode) !== "undefined"){
        return this.isAutoSaveStateException(eElement.parentNode);
    }else{
        return false;
    }
},

// - - - - - - - - - - - CORE FUNCTIONALLITY - - - - - - - - - - - 

/*
Augments the select function with the editrow functionallity.

@param  tRow        Structure representing the row to select.
@param  sField      (optional) Databinding of the field to select.
@param  fFinished   (optional) Function that is called after the select action is 
                finished.
@param  oEnvir      (optional) Environment used when calling fFinished.
*/
select : function(tRow, sField, fFinished, oEnvir){
    var oField, fFunction, iField;
    
    //  Tempolary disable the blur detection.
    this.bDetectBlur = false;
    
    this.eEditRow.className = this.sCssRowEdit + " " + (tRow.__eDisplayRow.className.match(this.sCssRowEven) !== null ? this.sCssRowEven : this.sCssRowOdd);

        //  Set the field values already so it looks less 'flashy'
    for(iField = 0; iField < this.aFields.length; iField++){
        if(tRow.__oData[this.aFields[iField].sDataBinding]){
            this.aFields[iField].setValue(tRow.__oData[this.aFields[iField].sDataBinding], true);
        }
    }

    
    vdf.sys.dom.swapNodes(tRow.__eRow, this.eEditRow);
    tRow.__eRow = this.eEditRow;
    
    
    //  We need to give the focus back to the field
    oField = null;
    fFunction = function(){
        oField.focus(true);
    };
    
    //  If a data binding is given we use that field (if we can find it)
    if(sField){
        for(iField = 0; iField < this.aFields.length; iField++){
            if(this.aFields[iField].sDataBinding === sField){
                oField = this.aFields[iField];
                break;
            }
        }
    }
    
    //  Else we use the last active field of the form
    if(this.oForm.oActiveField && oField === null){
        for(iField = 0; iField < this.aFields.length; iField++){
            if(this.oForm.oActiveField === this.aFields[iField]){
                oField = this.oForm.oActiveField;
            }
        }
    }
    
    //  Set a timeout to do the change
    if(oField){
        oField.focus(true);
        setTimeout(fFunction, 50);
    }    
    
    //  Call super
    this.List.prototype.select.call(this, tRow, sField, fFinished, oEnvir);
    
    this.bDetectBlur = true;
},


/*
Handles the onBeforeClear of the server DD. If something else initiated the 
clear we perform our own clear and cancel the DD clear.

@param  oEvent  Event object.
@private
*/
onServerBeforeClear : function(oEvent){
    if(oEvent.oInitiator !== this ){
        if(this.isDataChanged()){
            if(this.confirmClear()){
                this.select(this.tSelectedRow);
            }
        }
        
        oEvent.stop();
    }
},

/*
Handles the onBeforeDelete of the server DD. If the new row is selected wo do a 
clear instead of a delete.

@param  oEvent  Event object.
@private
*/
onServerBeforeDelete : function(oEvent){
    if(this.tSelectedRow === this.tNewRecord){
        if(this.isDataChanged()){
            if(this.confirmClear()){
                this.select(this.tSelectedRow);
            }
        }
        
        oEvent.stop();
    }    
},

/*
Checks if the user has changed the data of the grid.

@return True if the current row / record is supposed to be changed.
*/
isDataChanged : function(){
    return this.oServerDD.isChanged((this.tSelectedRow === this.tNewRecord ? null : this.tSelectedRow), true);
},

/*
Augments the deselect function with with the autosave check and the editrow 
functionallity.

@return True if the row succesfully deselected.
*/
deSelect : function(){
    
    //  Check if save should be performed
    if(this.bSaveAction && this.determineSave()){
        return false;
    }else{
        //  Replace the editrow with the orrigional row
        this.bDetectBlur = false;
        
        vdf.sys.dom.swapNodes(this.eEditRow, this.tSelectedRow.__eDisplayRow);
        this.tSelectedRow.__eRow = this.tSelectedRow.__eDisplayRow;
    
        this.List.prototype.deSelect.call(this);
    
        this.bDetectBlur = true;
        return true;
    }
},

/*
Handles the focus event of the hidden anchor. If the grid already had the focus 
it moves the selection one row down. If not it gives the focus to the last 
focusable field of the grid.

@param  oEvent  Event object.
@private
*/
onHiddenAnchorFocus : function(oEvent){
    var iField, oAction;
    
    if(this.bHasFocus){
        if(this.onBeforeTabToNextRow.fire(this)){
            //  Give first focusable field the focus
            for(iField = 0; iField < this.aFields.length; iField++){
                if(this.aFields[iField].bFocusable){
                    this.aFields[iField].focus(true);
                    this.oForm.oActiveField = this.aFields[iField];
                    break;
                }
            }
            
            //  If the newrow is selected we need to save and the scrolldown because scrolldown doesn't perform a save if it cancels
            if(this.tSelectedRow === this.tNewRecord){
                oAction = new vdf.core.Action("save", this.oForm, this, this.oServerDD, true);
                oAction.onFinished.addListener(function(oEvent){
                    this.scrollDown();
                }, this);
                this.oServerDD.doSave(oAction);
            }else{
                this.scrollDown();
            }
        }
    }else{
        //  Forward focus to the last (focusable) field
        for(iField = this.aFields.length - 1; iField >= 0; iField--){
            if(this.aFields[iField].bFocusable){
                this.aFields[iField].focus(true);
                break;
            }
        }
    }
},

// - - - - - - - - - - - AUTOSAVE - - - - - - - - - - - 

/*
Stores the reference to the action function and the arguments and sets 
bSaveAction to true. Then it calls the action function which will usually call 
the deSelect function that checks if a save should be done because bSaveAction 
is true and can call the action function again if the save completed 
succesfully.

@param  fSaveAction     Reference to the action function (like scrollUp).
@param  aSaveArguments  The arguments array with the argumetents for calling the 
            action function.
@return The result of the action function.
@private
*/
saveAction : function(fSaveAction, aSaveArguments){
    var result;
    
    this.bSaveAction = true;
    this.oSaveInitator = { fAction : fSaveAction, aArguments : aSaveArguments };

    result = fSaveAction.apply(this, aSaveArguments);
    
    this.bSaveAction = false;
    return result;
},

/*
@private
*/
scrollUp : function(){
    return this.saveAction(this.List.prototype.scrollUp, arguments);
},

/*
@private
*/
scrollDown : function(){
    return this.saveAction(this.List.prototype.scrollDown, arguments);
},

/*
@private
*/
scrollTop : function(){
    return this.saveAction(this.List.prototype.scrollTop, arguments);
},

/*
@private
*/
scrollBottom : function(){
    return this.saveAction(this.List.prototype.scrollBottom, arguments);
},

/*
@private
*/
scrollPageUp : function(){
    return this.saveAction(this.List.prototype.scrollPageUp, arguments);
},

/*
@private
*/
scrollPageDown : function(){
    return this.saveAction(this.List.prototype.scrollPageDown, arguments);
},

/*
@private
*/
scrollToRow : function(){
    return this.saveAction(this.List.prototype.scrollToRow, arguments);
},

/*
@private
*/
scrollToRowID : function(){
    return this.saveAction(this.List.prototype.scrollToRowID, arguments);
},

/*
@private
*/
determineSave : function(){
    var oAction;

    if(this.bAutoSaveState && this.isDataChanged()){
        if(this.confirmSave()){
            this.bDetectBlur = false;
            if(this.bSaveAction){
                this.oSaveFinished = this.oSaveInitator;
            }else{
                this.oSaveFinished = null;
            }
            
            oAction = new vdf.core.Action("save", this.oForm, this, this.oServerDD, true);
            oAction.onFinished.addListener(this.onAfterSave, this);
            this.oServerDD.doSave(oAction);
            
            return true;
        }
    }
    
    return false;
    
},

/*
@private
*/
onAfterSave : function(oEvent){
    if(!oEvent.bError){
        if(this.oSaveFinished !== null){
            this.oSaveFinished.fAction.apply(this, this.oSaveFinished.aArguments);
        }
    }
    this.bDetectBlur = true;
},

/*
@private
*/
confirmSave : function(){
    var bResult = false;
    
    this.bDetectBlur = false;
    bResult = this.onConfirmSave.fire(this);
    this.bDetectBlur = true;
    
    return bResult;
},

/*
Gives the developer a chance to display his own "Abandon changes?" message by 
firing the onConfirmClear event.

@return True if the onConfirmClear event was not cancelled.
@private
*/
confirmClear : function(){
    var bResult = false;
    
    this.bDetectBlur = false;
    bResult = this.onConfirmClear.fire(this);
    this.bDetectBlur = true;
    
    return bResult;
},

/*
Is called when a field is added to the list. If it is a header or display 
field it is added to the administration after initialisation.

@param  eRow        Dom row element in which field is located.
@param  sRowType    Type of the row ("display"/"header").
@param  oField      The Field to initialize.
@return True if the field should be forwarded to the form.
     
@private
*/
checkField : function(eRow, sRowType, oField){
    if(sRowType === "edit"){
        if(this.eEditRow === null){
            this.eEditRow = eRow;
        }
        
        this.aFields.push(oField);
        
        return true;
    }else{
        return this.List.prototype.checkField.call(this, eRow, sRowType, oField);
    }
}


});
