/*
Name:
    vdf.deo.Text
Type:
    Prototype
Extends:
    vdf.core.TextField
Revisions:
    2008/01/17  Initial version in the new 2.0 architecture. (HW, DAE)
*/

/*
@require    vdf/core/TextField.js
*/

/*
Constructor of that calls the super constructor (of the Textfield) and applies to 
the initializer interface (see vdf.core.init).

@param  eText           Reference to the DOM element.
@param  oParentControl  Reference to the parent control.
*/
vdf.deo.Text = function Text(eText, oParentControl){
    this.TextField(eText, oParentControl);
    
    /*
    The main configuration option of the suggestion lists that the AJAX Library 
    can display while the user is typing in the field. Each character that the 
    user types will cause a refresh of the list that is displayed filtered on 
    the new value of the field. Using the cursor and the mouse the new value can 
    be selected which will optionally result in a find GE.
    
    This option defines from where the suggestions are loaded. Note that the 
    option should be set before the initialization (from the HTML). The 
    following options can be used:
    
    "none" : Disables the suggestion list functionality.
    
    "find" : The values are loaded from the server using a find request while 
    the user is typing. A find GE is performed on the field. The client-side 
    data dictionary structure is not used for this request.
    
    "validationtable" : The values are loaded from the validation table. Both 
    values and descriptions will be displayed. The table is loaded completely 
    during initialization of the page.
    
    "custom" : The values are loaded from the JavaScript array (see: 
    aSuggestValues property).
    
@code
<input type="text" value="" name="customer__name" size="30" vdfSuggestSource="find" />
@code
    */
    this.sSuggestSource         = this.getVdfAttribute("sSuggestSource", "none");
    /*
    If this property is set to true a find GE will be performed if the user 
    selects a value from the suggestion list. This find will be executed using 
    the client-side data dictionaries.
    */
    this.bSuggestAutoFind       = this.getVdfAttribute("bSuggestAutoFind", (this.sSuggestSource.toLowerCase() == "find"));
    /*
    If this property is set to true the width of the suggestion box will be locked to the width of the field.
    */
    this.bSuggestStaticWidth    = this.getVdfAttribute("bSuggestStaticWidth", true);
    /*
    Used to load the aSuggestValues from the HTML.
    
    @private
    */
    this.sSuggestValues         = this.getVdfAttribute("sSuggestValues", "");
    /*
    Determines the maximum amount of suggestions displayed in the suggestion 
    list. 
    */
    this.iSuggestLength         = this.getVdfAttribute("iSuggestLength", 10);
    /*
    Determines the table which is used to load the values from is sSuggestSource 
    is set to "find". Defaults to the table to which the field is bound.
    */
    this.sSuggestSourceTable    = this.getVdfAttribute("sSuggestSourceTable", this.sTable);
    /*
    Determines the field which is used to load the values from is sSuggestSource 
    is set to "find". Defaults to the field to which the DEO is bound.
    */
    this.sSuggestSourceField    = this.getVdfAttribute("sSuggestSourceField", this.sField);
    /*
    When the sSuggestSource is set to "custom" this property will be used to 
    load the values / descriptions from. If set from HTML it should be set to a 
    comma separated list of values, when set from JavaScript it should be set to 
    an array of objects with sValue and sDescription properties.

@code
<input type="text" name="testfield" vdfSuggestSource="custom" vdfSuggestValues="value 1, value 2, value 3" />
@code
    The example above sets a custom list of suggestion values from the HTML.
@code
function myInitForm(oForm){
    var oField = oForm.getControl("testfield");
    
    oField.aSuggestValues.push({ sValue : "value 4" });
    oField.aSuggestValues.push({ sValue : "value 5" });
    oField.aSuggestValues.push({ sValue : "value 6" });
}
…
<input type="text" name="testfield" vdfSuggestSource="custom" vdfSuggestValues="value 1, value 2, value 3" />
@code
    The example above shows how values can be added from HTML.
@code
function myInitForm(oForm){
    var oField = oForm.getControl("testfield");
    
    oField.aSuggestValues = [
        { sValue : "testvalue", sDescription : "Value used for testing!" },
        { sValue : "value", sDescription : "Another value used for testing.." },
        { sValue : "value2", sDescription : "Value used for testing!" },
        { sValue : "value3", sDescription : "Value used for testing!" }
    ];
}
…
<input type="text" name="testfield" vdfSuggestSource="custom" />
@code
    The example above shows how a complete new list of values and descriptions can be set from HTML.
    
    @html
    */
    this.aSuggestValues         = null;
    
    /*
    Fired when the user selects one of the values in the suggestion list before 
    the value is placed in the field. When the event is stopped / cancelled then 
    the value will not be placed in the field and the (optional) find will not 
    be performed.
    
    @prop   sValue  The selected value.
    */
    this.onSuggestFinish  = new vdf.events.JSHandler();
    /*
    Event that is fired before the suggestion list is displayed. If the 
    sSuggestSource property is set to "find" the event will be fired before the 
    find GE request is send to the server. If the event is stopped / cancelled 
    the suggestion list will not be displayed at all.

    @prop   sValue  The current value of the data entry object.
    */
    this.onSuggestDisplay = new vdf.events.JSHandler();
    
    //  @privates
    this.sSuggestPrevValue      = null;
    this.tSuggestDisplay        = null;
    this.tSuggestHide           = null;
    this.eSuggestDiv            = null;
    
    this.sSuggestSource = this.sSuggestSource.toLowerCase();
    if(this.sSuggestSourceTable){
        this.sSuggestSourceTable = this.sSuggestSourceTable.toLowerCase();
    }
    if(this.sSuggestSourceField){
        this.sSuggestSourceField = this.sSuggestSourceField.toLowerCase();
    }
};
/*
This class implements the default text field. It extends the vdf.core.Field so 
it inherits the DEO API required by the vdf.core.ClientDataDictionary. This 
class contains the implementation of the suggestion list functionality which is 
able to display a list of options while the user is typing into the field. These 
options can be selected to find a record right away. The most important property 
for configuring this functionality is sSuggestSource.

@code
<input type="text" name="customer__name" value="" vdfSuggestSource="find" />
@code 
*/
vdf.definePrototype("vdf.deo.Text", "vdf.core.TextField", {

//  - - - - - - - - - - SuggestionList - - - - - - - - - - 
/*
Called by the form to initialize the data entry object.

@private
*/
formInit : function(){
    var aValues, iValue;

    if(typeof this.TextField.prototype.formInit === "function"){
        this.TextField.prototype.formInit.call(this);
    }
    
    if(this.sSuggestSource.toLowerCase() !== "none"){
        //  Attach keylistener
        this.addKeyListener(this.onSuggestFieldKeyPress, this);
        this.addDomListener("blur", this.onSuggestFieldBlur, this);

        if(this.sSuggestSource.toLowerCase() == "validationtable"){
            //  Fetch descriptionvalues and clone so we can manipulate them
            //this.aSuggestValues = browser.data.clone(this.oVdfForm.getVdfFieldAttribute(this, "aDescriptionValues"));
            //  Tell the form to wait for us with finishing initialization
            this.oForm.iInitFinishedStage++;
            
            this.oForm.oMetaData.loadDescriptionValues(this.sDataBinding, this.onSuggestDVLoaded, this);
            
            
        }else if(this.sSuggestSource.toLowerCase() == "custom"){
            //  Fetch values JSON style and add them to the array
            this.aSuggestValues = [];
            
            aValues = eval("([" + this.sSuggestValues + "])");
            for(iValue = 0; iValue < aValues.length; iValue++){
                if(aValues[iValue] !== ""){
                    this.aSuggestValues.push({ sValue : aValues[iValue] });
                }
            }
            
            //  Sort items alphabetically
            this.aSuggestValues.sort(this.suggestCompare);
        }
    }
},

/*
@private
*/
onSuggestDVLoaded : function(aValues){
    this.aSuggestValues = vdf.sys.data.deepClone(aValues);
    this.aSuggestValues.sort(this.suggestCompare);
    
    this.oForm.childInitFinished();
},


/*
Displays / Updates the suggestionlist. Uses the value in aSuggestOptions or
with the find source sends a find request.
*/
suggestDisplay : function(){
    var oDD, oAction, tRequestSet, tSnapshot, tField, iDD;
    
    try{
        //  Without value no suggest list should be displayed
        if(this.eElement.value !== "" && this.onSuggestDisplay.fire(this, { sValue : this.eElement.value })){
            
            //  For validation and custom use the already loaded values.
            if(this.sSuggestSource == "validationtable" || this.sSuggestSource == "custom"){
                this.suggestBuildList(this.aSuggestValues, this.eElement.value);
            }else if(this.sSuggestSource == "find" && this.oForm.doFind){
                oDD = this.oForm.getDD(this.sSuggestSourceTable);
                
                oAction = new vdf.core.Action("find", this.oForm, this, oDD, false);
                
                tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
                tRequestSet.sName = "SuggestFind";
                tRequestSet.sRequestType = "findByField";
                tRequestSet.iMaxRows = this.iSuggestLength;
                tRequestSet.sTable = this.sSuggestSourceTable;
                tRequestSet.sColumn = this.sSuggestSourceField;
                tRequestSet.sFindMode = vdf.GE;
                tRequestSet.bReturnCurrent = false;
            
                tSnapshot = oDD.generateExtSnapshot(false);
                for(iDD = 0; iDD < tSnapshot.aDDs.length; iDD++){
                    if(tSnapshot.aDDs[iDD].sName === this.sSuggestSourceTable){
                        tField = new vdf.dataStructs.TAjaxField();
                        tField.sBinding = this.sSuggestSourceTable + "." + this.sSuggestSourceField;
                        tField.sValue = this.eElement.value;
                        tSnapshot.aDDs[iDD].aFields.push(tField);
                        break;
                    }
                }
                tRequestSet.aRows.push(tSnapshot);
                
                oAction.addRequestSet(tRequestSet);
                oAction.onResponse.addListener(this.suggestHandleFind, this);
                oAction.send();
                
            }
        }else{
            if(this.eSuggestDiv !== null){
                this.suggestHide();
            }
        }
    }catch(oError){
        vdf.errors.handle(oError);
    }
},


/*
Handles the find for the suggestlist. Builds a list of the find results in
the [ { sValue : "", sDescription : "" }, { sVal... ] format. And calls the 
suggestBuildList method to dislay it.

@param  oEvent  The event object.
@private
*/
suggestHandleFind : function(oEvent){
    var tResponseSet, iRow, iDD, tSnapshot, aList = [];
    
    if(!oEvent.bError){
        tResponseSet = oEvent.tResponseData.aDataSets[0];
        for(iRow = 0; iRow < tResponseSet.aRows.length; iRow++){
            tSnapshot = tResponseSet.aRows[iRow];
            
            for(iDD = 0; iDD < tSnapshot.aDDs.length; iDD++){
                if(tSnapshot.aDDs[iDD].sName === this.sSuggestSourceTable){
                    aList.push({sValue : tSnapshot.aDDs[iDD].aFields[0].sValue, sDescription : null});
                    break;
                }
            }
        }
      
        // go display the suggestion list
        this.suggestBuildList(aList, this.eElement.value);
    }
},

/*


Builds the suggest list according to the given list of possible values by 
checking them agains the current input value. Only displays the items of 
which the value matches. Displays the descriptionvalue if this is available
in the list.

@param  aCompleteList   The list of possible values (should already be sorted)
@param  sValue          The current value of the field to which the values are
            checked.
@private
*/
suggestBuildList : function(aCompleteList, sValue){
    var aList, eSuggestDiv, eElement, eTable, iLength, eRow, eCell, sNewSelectedValue = null, iNewSelectedItem = -1, iItem;
    
    iLength = sValue.length;
    sValue = sValue.toLowerCase();
    aList = [];
    eElement = this.eElement;
    
    //  Fetch items that match against the value from the list
    for(iItem = 0; iItem < aCompleteList.length; iItem++){
        if(aCompleteList[iItem].sValue.substr(0, iLength).toLowerCase() == sValue){
            aList.push(aCompleteList[iItem]);
        }
    }
    
    //  Remove a list if it already exists
    if(this.eSuggestDiv !== null){
        //  IE =< 6  have select list z-index bug
        vdf.sys.gui.displaySelectBoxes(this.eSuggestDiv);
    
        this.eSuggestDiv.parentNode.removeChild(this.eSuggestDiv);
        this.eSuggestDiv.eTable = null;
        this.eSuggestDiv = null;
    }
    
    //  Only generate if items are found
    if(aList.length > 0){
    
        //  Generate div and table
        eSuggestDiv = document.createElement("div");
        eSuggestDiv.className = "vdfSuggest";
        eElement.parentNode.style.position = "relative";
        if (vdf.sys.isIE){
            eSuggestDiv.style.top = (eElement.offsetHeight + 2) + "px";
            eSuggestDiv.style.left = "1px";
        }
        
        eTable = document.createElement("table");
        eTable.cellSpacing = 0;

        
        if(this.bSuggestStaticWidth){
            eSuggestDiv.style.width = (eElement.offsetWidth - 2) + "px";
            eTable.style.width = "100%";
        }
        
        vdf.sys.dom.insertAfter(eSuggestDiv, eElement);
        eSuggestDiv.appendChild(eTable);
        
        
        //  For each item generate the row
        for(iItem = 0; iItem < aList.length && iItem < this.iSuggestLength; iItem++){
            eRow = eTable.insertRow(eTable.rows.length);
            eRow.setAttribute("iNum", iItem);
            eRow.setAttribute("sValue", aList[iItem].sValue);
            
            eCell = eRow.insertCell(0);
            eCell.innerHTML = "<b>" + aList[iItem].sValue.substr(0, iLength) + "</b>" + aList[iItem].sValue.substr(iLength);
            
            //  Add description if available
            if(aList[iItem].sDescription !== null){
                eCell = eRow.insertCell(1);
                vdf.sys.dom.setElementText(eCell, aList[iItem].sDescription);
            }
            
            if(aList[iItem].sValue == this.sSuggestSelectedValue){
                eRow.className = "selected";
                sNewSelectedValue = aList[iItem].sValue;
                iNewSelectedItem = iItem;
            }
            
            vdf.events.addDomListener("mouseover", eRow, this.onSuggestMouseOver, this);
            vdf.events.addDomListener("click", eRow, this.onSuggestMouseClick, this);
        }
        
        this.eSuggestDiv = eSuggestDiv;
        this.eSuggestDiv.eTable = eTable;
        
        //  IE =< 6  have select list z-index bug
        vdf.sys.gui.hideSelectBoxes(this.eSuggestDiv);
    }
    
    this.sSuggestSelectedValue = sNewSelectedValue;
    this.iSuggestSelectedItem = iNewSelectedItem;
},

/*
Removes the suggest list if one is displayed.
*/
suggestHide : function(){
    try{
        if(this.eSuggestDiv !== null){
            //  IE =< 6  have select list z-index bug
            vdf.sys.gui.displaySelectBoxes(this.eSuggestDiv);
            this.eSuggestDiv.parentNode.removeChild(this.eSuggestDiv);
            this.eSuggestDiv.eTable = null;
            this.eSuggestDiv = null;
            this.sSuggestSelectedValue = null;
            this.iSuggestSelectedItem = -1;
        }
    }catch(oError){
        vdf.errors.handle(oError);
    }
},

/*
Sets the selected value to the form, performs a FindByField if need and 
hides the suggest list.    
*/
suggestFinish : function(){
    if(this.sSuggestSelectedValue !== null){
        if(this.onSuggestFinish.fire(this, { sValue : this.sSuggestSelectedValue })){
            this.setValue(this.sSuggestSelectedValue);
            this.sSuggestPrevValue = this.sSuggestSelectedValue.toLowerCase();
            if(this.bSuggestAutoFind){
                this.doFind(vdf.GE);
            }
        }
        this.focus();
    }
    
    this.suggestHide();
},

/*
Moves the selects the next or the previous row in the suggest list.

@param  bDown   If true the next row is selected else the previous.
*/
suggestMoveSelection : function(bDown){
    var eTable, iSelectItem, iRow;
    
    eTable = this.eSuggestDiv.eTable;
    iSelectItem = this.iSuggestSelectedItem;
  
    //  Calculate which row to select
    if(bDown){
        iSelectItem++;
        if(iSelectItem >= eTable.rows.length){
            iSelectItem = eTable.rows.length - 1;
        }
    }else{
        iSelectItem--;
        if(iSelectItem < -1){
            iSelectItem = eTable.rows.length - 1;
        }else if(iSelectItem == -1){
            iSelectItem = 0;
        }
    }

    //  Loop through the rows and update the styles and get the values of the new selected row
    for(iRow = 0; iRow < eTable.rows.length; iRow++){
        if(iRow == iSelectItem){
            eTable.rows[iRow].className = "selected";
            this.sSuggestSelectedValue = eTable.rows[iRow].getAttribute("sValue"); 
            this.iSuggestSelectedItem = eTable.rows[iRow].getAttribute("iNum");
        }else{
            eTable.rows[iRow].className = "";
        }
    }
},

/*
Selects a list item using the given row element.

@param  eRow    The row element to select.
@private
*/
suggestSelectRow : function(eRow){
    var eTable, iRow;
    
    eTable = this.eSuggestDiv.eTable;
    
    //  Loop through the rows and update the styles and get the values of the new selected row
    for(iRow = 0; iRow < eTable.rows.length; iRow++){
        if(eTable.rows[iRow] == eRow){
            eTable.rows[iRow].className = "selected";
            this.sSuggestSelectedValue = eTable.rows[iRow].getAttribute("sValue"); 
            this.iSuggestSelectedItem = eTable.rows[iRow].getAttribute("iNum");
        }else{
            eTable.rows[iRow].className = "";
        }
    }
},    

/*
Called if a key is pressed in the field. If a special key (tab, escape, 
enter, arrow up/down) a special action is undertakenh, otherwise the list 
is updated (unless the key is in the special keys list).

@param  oEvent  The event object.
@return True if special action is done.
@private
*/
onSuggestFieldKeyPress : function(oEvent){
    var iKeyCode = oEvent.getKeyCode(), oField = this;

    if(this.eSuggestDiv !== null && !oEvent.getShiftKey() && !oEvent.getCtrlKey() && !oEvent.getAltKey()){
        if (iKeyCode == 27 || iKeyCode == 9){ // escape/tab hides the list
            this.suggestHide();
            return;
        }else if (iKeyCode == 13){ // enter selects the value
            this.suggestFinish();
            oEvent.stop();
            return;
        }else if(iKeyCode == 38 || iKeyCode==40){ // Up and down go trough the list
            this.suggestMoveSelection(iKeyCode == 40);
            oEvent.stop();
            return;
        }
    }
    
    if(this.sSuggestPrevValue !== this.eElement.value.toLowerCase()){
        this.sSuggestPrevValue = this.eElement.value.toLowerCase();
        
        //  Set a timeout so the list wont show immediately
        if(this.tSuggestHide !== null){
            clearTimeout(this.tSuggestHide);
        }
        this.tSuggestDisplay = setTimeout(function(){
            oField.tSuggestDisplay = null;
            oField.suggestDisplay();
        }, 200);
    }
},


/*
@private

Is called when the the field is blurred (loses the focus). If the suggest 
list is enabled it sets a timeout to hide to list.

@param  oEvent  Event object.
*/
onSuggestFieldBlur : function(oEvent){
    var oField = this;

    //  Suggest keyaction
    if(this.sSuggestSource.toLowerCase() !== "none"){
        if(this.tSuggestDisplay !== null){
            clearTimeout(this.tSuggestDisplay);
        }
        this.tSuggestHide = setTimeout(function(){ 
            oField.suggestHide(); 
        }, 500);
    }
},

/*
Is called by the array sort method. Compares two suggestionlist objects 
{ sValue : "value" , sDescription : "descr" } and determines using their 
value in which order the belong.

@param  oSuggestion1    First suggestion object.
@param  oSuggestion2    Second suggestion object.
@return 1 if value the first belongs after the last, -1 if the first belongs 
        before the last, 0 if a problem occured.
@private
*/
suggestCompare : function(oSuggestion1, oSuggestion2){
    var sValue1, sValue2;
    
    sValue1 = oSuggestion1.sValue.toUpperCase();
    sValue2 = oSuggestion2.sValue.toUpperCase();
    try{
        if (sValue1 > sValue2){
            return 1;
        }
        if (sValue2 > sValue1){
            return -1;
        }
    }catch(e){

    }
    return 0;
},

/*
@private

Handles the mouseover event of the suggest list rows and selects the row 
that the mouse goes over.

@param  oEvent  Event object.
*/
onSuggestMouseOver : function(oEvent){
    var eSource;
 
    eSource = oEvent.getTarget();
    
    eSource = vdf.sys.dom.searchParent(eSource, "tr");
    if(eSource === null){
        return;
    }
    
    this.suggestSelectRow(eSource);
},

/*
@private

Handles the mouseclick event of the suggest list rows. Makes sure the row 
is selected and calls the finish method.

@param  oEvent  Event object.
*/
onSuggestMouseClick : function(oEvent){
    var eSource;
 
    eSource = oEvent.getTarget();
    
    eSource = vdf.sys.dom.searchParent(eSource, "tr");
    if(eSource === null){
        return;
    }
    
    this.suggestSelectRow(eSource);
    this.suggestFinish();
}


});
