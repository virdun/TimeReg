/*
Name:
    vdf.core.List
Type:
    Prototype
Extends:
    vdf.core.DEO
Revisions:
    2005/10/24  Created the initial version of the List. (HW, DAE)
    2008/01/16  Started a full rewrite of the List engine in the 2.0 structure. 
    (HW, DAE).
*/

/*
@css        list.css
@require    vdf/core/DEO.js
@require    vdf/gui/Scrollbar.js
@require    vdf/core/Form.js
*/

/*
Constructor that applies to the interface required by the initialization system 
(see vdf.core.init).

@param  eElement        Reference to the form DOM element.
@param  oParentControl  Reference to a parent control.
*/
vdf.core.List = function List(eElement, oParentControl){
    var sKey;

    this.DEO(eElement, oParentControl);
    
    //  PUBLIC
    
   
    //  Properties

    /*
    The name of the maintable for the list.
    */
    this.sTable             = this.getVdfAttribute("sTable", this.getVdfAttribute("sMainTable", null, false), true);
    
    /*
    Index that is used for the list. The user can switch indexes by clicking the 
    columns. If not given the initial index will be the index of the first 
    indexed column.
    */
    this.iIndex             = this.getVdfAttribute("iIndex", "", true);
    /*
    If true the index is used in reversed order.
    */
    this.bReverseIndex      = this.getVdfAttribute("bReverseIndex", false, true);
    /*
    The amount of rows displayed in the list.
    */
    this.iLength            = parseInt(this.getVdfAttribute("iLength", this.getVdfAttribute("iRowLength", 10, false), true), 10);
    /*
    The minimum amount of records buffered (above and below the displayed rows).
    */
    this.iMinBuffer         = parseInt(this.getVdfAttribute("iMinBuffer", (this.iLength * 1 + 1), true), 10);
    /*
    The maximum amount of records buffered. 
    */
    this.iMaxBuffer         = parseInt(this.getVdfAttribute("iMaxBuffer", (this.iLength * 3), true), 10);
    /*
    The time (in milliseconds) to wait to try again if a buffer action didn't 
    return a record.
    */
    this.iBufferWait        = parseInt(this.getVdfAttribute("iBufferWait", 1500, true), 10);
    /*
    The time (in milliseconds) to wait before updating the list after the data 
    dictionary called the refresh method.
    */
    this.iRefreshTimeout    = parseInt(this.getVdfAttribute("iRefreshTimeout", 300, true), 10);
    /*
    The CSS class that is set on the table element.
    */
    this.sCssClass          = this.getVdfAttribute("sCssClass", "list", true);
    /*
    The CSS class that is set on the header row.
    */
    this.sCssRowHeader      = this.getVdfAttribute("sCssRowHeader", "rowheader", true);
    /*
    The CSS class that is set on empty rows.
    */
    this.sCssRowEmpty       = this.getVdfAttribute("sCssRowEmpty", "rowempty", true);
    /*
    The CSS class that is set on display rows.
    */
    this.sCssRowDisplay     = this.getVdfAttribute("sCssRowDisplay", "rowdisplay", true);
    /*
    The CSS class that is set on odd rows.
    */
    this.sCssRowOdd         = this.getVdfAttribute("sCssRowOdd", "rowodd");
    /*
    The CSS class that is set on even rows.
    */
    this.sCssRowEven        = this.getVdfAttribute("sCssRowEven", "roweven");
    /*
    The CSS class that is set to header fields with an index.
    */
    this.sCssHeaderIndex    = this.getVdfAttribute("sCssHeaderIndex", "headerindex");
    /*
    The CSS class that is set to header fields of the selected index if the 
    index is reversed.
    */
    this.sCssHeaderReversed = this.getVdfAttribute("sCssHeaderReversed", "headerreversed");
    /*
    The CSS class that is set to header fields of the selected index.
    */
    this.sCssHeaderSelected = this.getVdfAttribute("sCssHeaderSelected", "headerselected");
    
    /*
    If true the list asumes that adding / modifying records won't change the 
    order of the records.
    */
    this.bAlwaysInOrder     = this.getVdfAttribute("bAlwaysInOrder", true, true);
    /*
    If true a change of the selected record always causes a findByRowID. If 
    false the List determines if there are other Data Entry Objects depending on 
    this findByRowId (if not the data dictionary buffer is updated with the 
    buffered list data).
    */
    this.bForceDDSync       = this.getVdfAttribute("bForceDDSync", false, true);
    /*
    If true the list tries to lock the column width during initialization.
    */
    this.bFixedColumnWidth  = this.getVdfAttribute("bFixedColumnWidth", true, true);
    /*
    If true the columns are stretched to the maximum possible value width (using 
    the field lenght) before the column width is locked.
    */
    this.bDetermineWidth    = this.getVdfAttribute("bDetermineWidth", true, true);
    /*
    If true the list we be able to have the focus.
    */
    this.bHoldFocus         = this.getVdfAttribute("bHoldFocus", true, true);
    /*
    If true the list will take the focus after initialization.
    */
    this.bFocus             = this.getVdfAttribute("bFocus", true, true);
    /*
    If true the new row will be displayed at the end of the list (usually true 
    for Grids).
    */
    this.bDisplayNewRow     = this.getVdfAttribute("bDisplayNewRow", false, true);
    /*
    If true a scrollbar (vdf.gui.Scrollbar) is displayed next to the list.
    */
    this.bDisplayScrollbar  = this.getVdfAttribute("bDisplayScrollbar", true, true);
    /*
    If true a loading image is displayed while the list is being filled.
    */
    this.bDisplayLoading    = this.getVdfAttribute("bDisplayLoading", true, true);
    /*
    If true ctrl - f will open the jump into list dialog.
    */
    this.bSearch            = this.getVdfAttribute("bSearch", true, true);
    
    /*
    This property can be used to enable / disable the sorting by clicking on the 
    header indexes. 
    */
    this.bAllowSorting      = this.getVdfAttribute("bAllowSorting", true, true);
    
    /*
    Fired if a row is selected.
    
    @prop   tRow    Reference to the data object with the selected record (See 
                vdf.dataStructs.TAjaxSnapShot).
    */
    this.onSelect           = new vdf.events.JSHandler();
    /*
    Fired if a row is deselected.
    
    @prop   tRow    Reference to the data object with the selected record (See 
                vdf.dataStructs.TAjaxSnapShot).
    */
    this.onDeselect         = new vdf.events.JSHandler();
    /*
    Fired if the enter event occurs (the user double clicks a row or presses 
    enter.
    */
    this.onEnter            = new vdf.events.JSHandler();
    /*
    Fired if the list has finished its initialization.
    */
    this.onInitialized      = new vdf.events.JSHandler();
    /*
    Fired if a new row is added to the list table element. This event can be 
    used to customize the rows that are displayed in the list manually.
    
    @prop   eRow        Reference to the new DOM element. Note that this DOM 
                element is not inserted into the DOM yet!
    @prop   tRow        Reference to the data object representing the inserted 
                record (See vdf.dataStructs.TAjaxSnapShot).
    @prop   bNewRow     True if this row is the new row (the row used to create 
                new rows in a grid).
    @prop   bEmptyRow   True if this row is an empty row.
    */
    this.onNewRow           = new vdf.events.JSHandler();
    
    
    //  @privates
    this.aChildren = []; // Contains references to all children exept for the fields
    this.aHeaderFields = [];
    this.aPrototypeFields = [];
    this.eHeaderRow = null;
    this.ePrototypeRow = null;
    this.eFocus = null;
    this.eLoadingDiv = null;
    this.tSelectedRow = null;
    
    this.tNewRecord = this.initResponseSnapshot(new vdf.dataStructs.TAjaxSnapShot());
    
    this.aDisplay = [];
    this.aBufferBottom = [];
    this.aBufferTop = [];
    this.oActionKeys            = {};
    this.bDDSync = null;
    this.iInsertLocation = -1;
    this.oJumpIntoList = null;
    this.iInitStage = 0;
    this.iDisplayRightPadding = 0;
    
    this.oScrollAction = null;
    this.oFillAction = null;
    this.oBufferAction = null;
    this.oSelectAction = null;
    
    this.sLastBufferUp = null;
    this.iLastBufferUp = 0;

    this.sLastBufferDown = null;
    this.iLastBufferDown = 0;
    
    this.tRefreshTimeout = null;
    this.oRefreshAction = null;
    
    this.bHasFocus = false;
    this.bLozingFocus = false;
    this.tFocusTimeout = null;
    
    
    //  Copy settings
    for(sKey in vdf.settings.listKeys){
        if(typeof(vdf.settings.listKeys[sKey]) == "object"){
            this.oActionKeys[sKey] = vdf.settings.listKeys[sKey];
        }
    }
    
    //  Set classname
    vdf.sys.gui.addClass(this.eElement, this.sCssClass);

    if(this.eElement.getAttribute("cellpadding") === null || this.eElement.getAttribute("cellpadding") === ""){
        this.eElement.cellPadding = 0;
    }
    if(this.eElement.getAttribute("cellspacing") === null || this.eElement.getAttribute("cellspacing") === ""){
        this.eElement.cellSpacing = 0;
    }
    
    if(this.sTable !== null){
        this.sTable = this.sTable.toLowerCase();
    }
    
    //  Register to parent as data entry object
    if(oParentControl !== null && typeof(oParentControl.addDEO) == "function"){
        oParentControl.addDEO(this);
    }
};
/*
Engine of the scrollable list which contains functionallity to scroll and 
buffer records. The engine is used by the vdf.deo.Lookup and the vdf.deo.Grid.
*/
vdf.definePrototype("vdf.core.List", "vdf.core.DEO", {

// - - - - - - - - - - INITIALIZATION - - - - - - - - - - -

/*
Called by the initializer which is an indication that the document scan is 
finished so we can move on to the next step / stage of the initialization.
*/
init : function(){
    if(!this.oForm || this.oForm.sControlType !== "vdf.core.Form"){
        throw new vdf.errors.Error(5129, "Reference to vdf.core.Form required", this, [ this.sName ]);
    }
},

/*
Controls the stages initialization. Is called after each stage so it can 
execute the next.

Stage 0:
- Scanning and receiving the fields.

Stage 1:
- ASynchronous request of field meta data

Stage 2:
- Initialize the (child) components.

Stage 3:
- Asynchronous fill for the first time

@private
*/
initStage : function(){
    switch(this.iInitStage){
        case 1:
            //vdf.log("List: Loading stage 1: Loading field meta data");
            this.loadFieldMetaData();
            break;
        case 2:
            //vdf.log("List: Loading stage 2: Internal initialization");
            this.initializeComponents();
            //this.oForm.childInitFinished();
            break;
        case 3:
            //vdf.log("List: Loading stage 3: Automatic fill");
            this.oForm.childInitFinished();
            this.onInitialized.fire(this, {});
            break;
    }
},

/*
Is called when a field is found that belongs to the VdfList. Calls the 
initField method and forwards the field to the form if needed.

@param  oField          The VdfField object that belongs to the field
@param  sDataBinding    Data bingding of the field

@private
*/
addDEO : function(oField, sDataBinding){
    var bParent = true, eElement = oField.eElement, eRow;
    
    eRow = vdf.sys.dom.searchParentByVdfAttribute(eElement, "sRowType", null);
    
    if(eRow !== null){
        bParent = this.checkField(eRow, vdf.getDOMAttribute(eRow, "sRowType"), oField);
    }
    
    if(bParent){
        if(this.oParentControl !== null && typeof(this.oParentControl.addDEO) === "function"){
            this.oParentControl.addDEO(oField, sDataBinding);
        }else{
            this.oForm.addDEO(oField, sDataBinding);
        }
        
        //  Add it to the children collection so it will get initialized
        this.aChildren.push(oField);
    }else{
        oField.oForm = this.oForm;
    }
},

/*
Is called when a field is added to the list. If it is a header or display 
field it is added to the administration after initialisation.

@param  eRow        Dom row element in which field is located
@param  sRowType    Type of the row ("display"/"header")
@param  oField      The VdfField to initialise  
@return True if the field should be forwarded to the form
    
@private
*/
checkField : function(eRow, sRowType, oField){
    if(sRowType == "header"){
        //  Safe reference to the header row
        if(this.eHeaderRow === null){
            this.eHeaderRow = eRow;
        }
        
        //  Set classname
        if(this.eHeaderRow.className.match(this.sCssRowHeader) === null){
            this.eHeaderRow.className = this.sCssRowHeader;
        }
        
        this.aHeaderFields.push(oField);
    }else if(sRowType == "display"){
        //  Safe reference to the display row
        if(this.ePrototypeRow === null){
            this.ePrototypeRow = eRow;
        }
        
        if(!oField.bIsLabel){
            this.aPrototypeFields.push(oField);
        }
    }else{
        throw new vdf.errors.Error(5140, "Unknown row type", this, [ sRowType ]);
    }
    
    return false;
},

/*
Usually called by the form. Starts the initialization process.

@private
*/
formInit : function(){
    //  Tell the form to wait for us with finishing initialization
    this.oForm.iInitFinishedStage++;
    
    this.iInitStage++;
    this.initStage();
},

/*
It makes a list of all the fields in list and lets the meta data object load 
the basic field meta data for them.

@private
*/
loadFieldMetaData : function(){
    var aFields = [], iHeader, iProto;
    
    for(iHeader = 0; iHeader < this.aHeaderFields.length; iHeader++){
        if(this.aHeaderFields[iHeader].sDataBindingType == "D"){
            aFields.push(this.aHeaderFields[iHeader].sDataBinding);
        }
    }
    
    for(iProto = 0; iProto < this.aPrototypeFields.length; iProto++){
        if(this.aPrototypeFields[iProto].sDataBindingType == "D"){
            aFields.push(this.aPrototypeFields[iProto].sDataBinding);
        }
    }

    this.oForm.oMetaData.loadFieldData(vdf.sys.math.unique(aFields), this.onFieldMetaLoaded, this);
},

/*
Called by the meta data object if the field meta data is loaded. Moves on to 
the next initialization stage.

@private
*/
onFieldMetaLoaded : function(oEvent){
    this.iInitStage++;
    this.initStage();
},

/*
Intializes the components of the list. 
- Intitialization of the fields in the prototype row.
- Intitialization of other children.
- Intitialization of the list itself.
- Creation of the scrollbar.
- Creation of the focus holder DOM element.

@private
*/
initializeComponents : function(){
    var iField, iChild, iRow, oScrollbar, oList, eFocus;

    //  If we don't have a reference to a header row yet we need to make sure to find one..
    if(!this.eHeaderRow){
        for(iRow = 0; iRow < this.eElement.rows.length; iRow++){
            if(vdf.getDOMAttribute(this.eElement.rows[iRow], "sRowType") === "header"){
                this.eHeaderRow = this.eElement.rows[iRow];
                
                //  Set classname
                if(this.eHeaderRow.className.match(this.sCssRowHeader) === null){
                    this.eHeaderRow.className = this.sCssRowHeader;
                }
                break;
            }
        }
    }
    
    
    //  Initialize other children
    for(iChild = 0; iChild < this.aChildren.length; iChild++){
        if(typeof(this.aChildren[iChild].formInit) === "function"){
            this.aChildren[iChild].formInit();
        }
    }

    
    // Initialization of the prototype fields (header fields are not initialized)
    for(iField = 0; iField < this.aPrototypeFields.length; iField++){
        if(typeof(this.aPrototypeFields[iField].formInit) == "function"){
            this.aPrototypeFields[iField].formInit();
        }
        
        if(typeof(this.aPrototypeFields[iField].initValidation) === "function"){
            this.aPrototypeFields[iField].initValidation();
        }
    }
    

    
    //  Determine the current location of the prototype row
    for(iRow = 0; iRow < this.eElement.rows.length; iRow++){
        if(this.eElement.rows[iRow] === this.ePrototypeRow){
            this.iInsertLocation = iRow;
            break;
        }
    }

        
   
    
    //  Initialize scrollbar  
    if(this.bDisplayScrollbar){
        oScrollbar = new vdf.gui.Scrollbar(null, null);
        oScrollbar.eScrollElement = this.eElement;
        oScrollbar.bOverLay = true;
        oScrollbar.init();
        oScrollbar.onScroll.addListener(this.onScroll, this);
        this.oScrollbar = oScrollbar;
        
                
        // oList = this;
        // setTimeout(function(){
            // oList.positionScrollbar();
        // }, 10);
    }
    
    //  Insert & initialize focus holder (A Element) (if needed)
    if(this.bHoldFocus){
        eFocus = document.createElement("a");
        this.eFocus = eFocus;
        eFocus.href = "javascript: vdf.sys.nothing();";
        eFocus.style.textDecoration = "none";
        eFocus.hideFocus = true;
        eFocus.innerHTML = "&nbsp;";
        eFocus.style.position = "absolute";
        eFocus.style.left = "-3000px";
        
        vdf.events.addDomKeyListener(eFocus, this.onKey, this);
        vdf.events.addDomListener("focus", eFocus, this.onFocus, this);
        vdf.events.addDomListener("blur", eFocus, this.onBlur, this);
        this.eElement.parentNode.insertBefore(eFocus, this.eElement);
        
        vdf.events.addDomListener("click", this.eElement, this.onTableClick, this);
        
        if(this.bFocus){
            this.focus();
        }
    }
    
    //  Remove gently from the DOM    
    this.ePrototypeRow.parentNode.removeChild(this.ePrototypeRow); 
    
    //  Take space
    this.displayClear(this.bDetermineWidth);

    //  Set header labels and CSS & index clicks
    this.initializeHeader();
    
    
    //  Lock column width
    if(this.bFixedColumnWidth){
        this.lockColumnWidth();
    }
    if(this.bDetermineWidth){
        this.displayClear(false);
    }
    
    //  Attach events
    vdf.events.addDomMouseWheelListener(this.eElement, this.onMouseWheelScroll, this);
    
    //  Determine sync method
    this.bDDSync = this.determineSync();
    
    this.iInitStage++;
    this.initStage();
    
    this.recalcDisplay(false);
    
    //  Unfortunately we still need to do the uggly positioning work arround
    oList = this;
    setTimeout(function(){
        if(oList.bDisplayScrollbar){
            oList.spaceScrollbar();
        }
    
        oList.recalcDisplay(false);
    }, 300);
},

/*
Removes the references to the DOM and attached event listeners.
*/
destroy : function(){
    if(this.eElement){
        //  Remove the rows and all their listeners..
        vdf.events.clearDomListeners(this.eElement, true);
    }
    
    if(this.eFocus){
        vdf.events.clearDomListeners(this.eFocus);
    }
    
    this.eHeaderRow = null;
    this.ePrototypeRow = null;
    this.eFocus = null;
    this.eLoadingDiv = null;
},

/*
Initialization of the header row. Some dirty work arround are needed for a 
correct style.

@private
*/
initializeHeader : function(){
    var iHeader, oField, iIndex, eDiv;
    

    //  Attach listeners
    for(iHeader = 0; iHeader < this.aHeaderFields.length; iHeader++){
        oField = this.aHeaderFields[iHeader];

        //  Work arround for IE background styles and advanced header designs.
        if(vdf.sys.ref.getType(oField) === "DOM" || oField.bIsLabel){
            eDiv = document.createElement("div");
            eDiv.innerHTML = oField.eElement.innerHTML;
            oField.eElement.innerHTML = "";
            oField.eElement.removeAttribute("oVdfControl");
            oField.eElement.appendChild(eDiv);
            oField.eElement = eDiv;
            eDiv.oVdfControl = oField;
        }
        
        if(this.bAllowSorting){
            if(oField.sTable === this.sTable){
                iIndex = oField.getMetaProperty("iIndex");
                
                if(iIndex !== "" && iIndex !== null && iIndex !== 0){
                    oField.addDomListener("click", this.onIndexClick, this);
                }
            }
        }
    }
    
    //  Update header CSS
    this.displayHeaderCSS();
},

// - - - - - - - - - - DISPLAY FUNCTIONALLITY - - - - - - - - - - -

/*
Sets the correct CSS classes to the header fields to display fields. It makes 
difference between fields that have an index, field that have the selected 
index and fields that have the selected index reversed.
*/
displayHeaderCSS : function(){
    var iHeader, oField, iIndex, iSelectedIndex = this.getIndex();

    for(iHeader = 0; iHeader < this.aHeaderFields.length; iHeader++){
        oField = this.aHeaderFields[iHeader];
        if(this.bAllowSorting){
            if(oField.sTable === this.sTable){
                iIndex = oField.getMetaProperty("iIndex");
                
                 if(iIndex !== "" && iIndex !== null && iIndex !== 0){
                    if(iIndex === iSelectedIndex){
                        if(this.bReverseIndex){
                            oField.eElement.parentNode.className = this.sCssHeaderReversed;
                        }else{
                            oField.eElement.parentNode.className = this.sCssHeaderSelected;
                        }   
                    }else{
                        oField.eElement.parentNode.className = this.sCssHeaderIndex;
                    }
                }
            }
        }
    }
},

/*
Deselects the selected record and then refills the table with empty rows.

@param  bOutfillColumns Fills the columns with a maximum length stretch value.
@private
*/
displayClear : function(bOutfillColumns){
    var iLoop, eTable = this.eElement;
    
    //  Deselect selected row
    if(this.tSelectedRow !== null){
        this.deSelect();
    }
    
    this.aDisplay = [];
    this.aBufferBottom = [];
    this.aBufferTop = [];

    //  Delete all rows
    for(iLoop = eTable.rows.length - 1; iLoop >= 0; iLoop--){
        if(vdf.getDOMAttribute(eTable.rows[iLoop], "sRowType") === "display" || vdf.getDOMAttribute(eTable.rows[iLoop], "sRowType") === "spaceFiller"){
            if(eTable.rows[iLoop].tRow){
                this.destroyRow(eTable.rows[iLoop].tRow);
            }else{
                eTable.deleteRow(iLoop);
            }
        }
    }
    
    //  Fill table with empty rows
    for(iLoop = 0; iLoop < this.iLength; iLoop++){
        if(iLoop === 0 && this.bDisplayNewRow){
            this.insertOnBottom(this.createRow(this.tNewRecord));
            this.aDisplay.push(this.tNewRecord);
        }else{
            this.insertOnBottom(this.createEmptyRow(bOutfillColumns));
        }
    }
    
    //  Select the first record
    if(this.aDisplay.length > 0){
        this.select(this.aDisplay[0]);
    }
},

/*
Refreshes the display according to the buffer values. It asumes that the 
correct amount of rows is in the table!

@private
*/
displayRefresh : function(){
    var iDisplayRow = 0, iRow, sType, eRow;
    
    //  Loop through the rows in the table
    for(iRow = 0; iRow < this.eElement.rows.length; iRow++){
        
        //  Determine the type
        sType = vdf.getDOMAttribute(this.eElement.rows[iRow], "sRowType", null);
        if(sType !== null){
            if(sType === "display" || sType === "spaceFiller"){
                
                //  (re)generate the display row
                if(iDisplayRow < this.aDisplay.length){
                    eRow = this.createRow(this.aDisplay[iDisplayRow]);
                }else{
                    eRow = this.createEmptyRow(false);
                }                
                
                //  Set the CSS class (odd or even)
                eRow.className = eRow.className + " " + (iDisplayRow % 2 === 0 ? this.sCssRowEven : this.sCssRowOdd);
                
                vdf.events.clearDomListeners(this.eElement.rows[iRow]);
                this.eElement.rows[iRow].tRow = null;
                
                vdf.sys.dom.swapNodes(this.eElement.rows[iRow], eRow);
                
                iDisplayRow++;
            }
        }
    }
},

/*
Generates a row based on the prototype row with the data of the given snapshot.

@param  tRow    Snapshot of the row to create.
@return Reference to the created tr DOM element.
@private
*/
createRow : function(tRow){
    var iField, eRow, sVal, iChild;

    //  Set the data
    if(tRow !== this.tNewRecord){
        for(iField = 0; iField < this.aPrototypeFields.length; iField++){
            this.aPrototypeFields[iField].setValue(tRow.__oData[this.aPrototypeFields[iField].sDataBinding]);
        }
    }else{
        for(iField = 0; iField < this.aPrototypeFields.length; iField++){
            sVal = this.aPrototypeFields[iField].getMetaProperty("sDefaultValue");
            this.aPrototypeFields[iField].setValue((sVal !== null ? sVal : ""));
        }
    }
    
    //  Copy the row
    eRow = vdf.sys.dom.deepClone(this.ePrototypeRow);
    
    //  Set the references, attributes and event listeners
    eRow.tRow = tRow;
    tRow.__eRow = eRow;
    tRow.__eDisplayRow = eRow;
    vdf.setDOMAttribute(eRow, "sRowType", "display");
    vdf.events.addDomListener("click", eRow, this.onRowClick, this);
    vdf.events.addDomListener("dblclick", eRow, this.onEnterAction, this);
    
    //  Set the CSS class
    if(this.sCssRowDisplay !== ""){
        eRow.className = this.sCssRowDisplay;
    }
    
    if(this.bDisplayScrollbar && this.iDisplayRightPadding > 0){
        for(iChild = eRow.childNodes.length - 1; iChild >= 0; iChild--){
            if(eRow.childNodes[iChild].tagName === "TD" || eRow.childNodes[iChild].tagName === "TH"){
                eRow.childNodes[iChild].style.paddingRight = this.iDisplayRightPadding + "px";
                break;
            }
        }
    }
    
    //  Give the developer a chance to modify the row
    this.onNewRow.fire(this, { eRow : eRow, tRow : tRow, bNewRow : (tRow === this.tNewRecord), bEmptyRow : false});
    
    return eRow;
},

/*
Destroys the row element and all cross references for the snapshot.

@param  tRow    Reference to the snapshot.
*/
destroyRow : function(tRow){
    vdf.events.clearDomListeners(tRow.__eRow);

    tRow.__eRow.parentNode.removeChild(tRow.__eRow);
    tRow.__eDisplayRow.tRow = null;
    tRow.__eRow = null;
    tRow.__eDisplayRow = null;
},

/*
Generate a table row based on the prototype without data.

@param  bOutfillColumn  If true it fills the row with stretch values (like "WWWW").
@return Reference to the created tr DOM element.    
@private
*/
createEmptyRow : function(bOutfillColumn){
    var iField, eRow;
    
    //  Fill the row
    for(iField = 0; iField < this.aPrototypeFields.length; iField++){
        this.aPrototypeFields[iField].setValue((bOutfillColumn ? this.getStretchValue(this.aPrototypeFields[iField]) : ""), true);
    }
    
    //  Make a copy
    eRow = this.ePrototypeRow.cloneNode(true);
    
    //  Set properties and attach listeners
    vdf.setDOMAttribute(eRow, "sRowType", "spaceFiller");
    if(this.sCssRowEmpty !== ""){
        eRow.className = this.sCssRowEmpty;
    }
    //vdf.events.addDomListener("click", eNewRow, this.onEmptyRowClick, this);
    
    //  Give the developer a change to modify the row
    this.onNewRow.fire(this, { eRow : eRow, tRow : null, bNewRow : false, bEmptyRow : true});
    
    return eRow;
},

/*
Inserts the given row on top of the table. It determines where this is based 
on the last known prototype row.

@param  eRow    Reference to the tr DOM element to insert.
@private
*/
insertOnTop : function(eRow){
    var bOdd = true;

    if(this.aDisplay.length > 0){
        this.aDisplay[0].__eRow.parentNode.insertBefore(eRow, this.aDisplay[0].__eRow);
        bOdd = (this.aDisplay[0].__eDisplayRow.className.match(this.sCssRowOdd) !== null);
    }else{
        if(this.iInsertLocation >= this.eElement.rows.length){
            this.iInsertLocation = this.eElement.rows.length;
        }
        vdf.sys.dom.swapNodes(this.eElement.insertRow(this.iInsertLocation), eRow);
    }
    
    //  Set classname  (odd or even)
    eRow.className = eRow.className + " " + (bOdd ? this.sCssRowEven : this.sCssRowOdd);
},

/*
Inserts the given row on the bottom of the table. It determines where this is 
based on the last known prototype row.

@param  eRow    Reference to the 
@private
*/
insertOnBottom : function(eRow){
    var bOdd = true;

    if(this.aDisplay.length > 0){
        vdf.sys.dom.insertAfter(eRow, this.aDisplay[this.aDisplay.length - 1].__eRow);
        bOdd = (this.aDisplay[this.aDisplay.length - 1].__eDisplayRow.className.match(this.sCssRowOdd) !== null);
    }else{
        if(this.iInsertLocation >= this.eElement.rows.length){
            this.iInsertLocation = this.eElement.rows.length;
        }
        vdf.sys.dom.swapNodes(this.eElement.insertRow(this.iInsertLocation), eRow);
    }
    
    eRow.className = eRow.className + " " + (bOdd ? this.sCssRowEven : this.sCssRowOdd);
},

/*
Removes an empty row from the table.
@private
*/
deleteEmptyRow : function(){
    var iLoop;
    
    for(iLoop = this.eElement.rows.length - 1; iLoop >= 0; iLoop--){
        if(vdf.getDOMAttribute(this.eElement.rows[iLoop], "sRowType") === "spaceFiller"){
            this.eElement.deleteRow(iLoop);
            return;
        }
    }
},

/*
Locks the column width by setting the width of the cell width of the header row
to the current width.
*/
lockColumnWidth : function(){
    var iCol, eRow;    
    
    eRow = (this.eHeaderRow ? this.eHeaderRow : this.eElement.arows[0]);
    
    for(iCol = 0; iCol < eRow.cells.length; iCol++){
        eRow.cells[iCol].style.width = eRow.cells[iCol].clientWidth + "px";
    }
},

/*
Makes room for the scrollbar by setting the paddingRight of all the table rows 
to the width of the scrollbar.

@private
*/
spaceScrollbar : function(){
    var oList, iRow, eRow, eCell, oCurrentStyle, iWidth, iScrollbarWidth, sRowType;

    iScrollbarWidth = this.oScrollbar.determineWidth();
    
    if(iScrollbarWidth > 0){
        for(iRow = 0; iRow < this.eElement.rows.length; iRow++){
            eRow = this.eElement.rows[iRow];
            
            if(eRow.cells.length > 0){
                eCell = eRow.cells[eRow.cells.length - 1];
                oCurrentStyle = vdf.sys.gui.getCurrentStyle(eCell);
                iWidth = parseInt(oCurrentStyle.paddingRight, 10) + iScrollbarWidth;
                sRowType = vdf.getDOMAttribute(eRow, "sRowType");
                eCell.style.paddingRight = iWidth + "px";
                
                
                if(typeof(sRowType) === "string" && (sRowType.toLowerCase() === "display" || sRowType.toLowerCase() === "spacefiller")){
                    this.iDisplayRightPadding = iWidth;
                }
            }
        }
    }else{
        oList = this;
        
        setTimeout(function(){ 
            oList.spaceScrollbar.call(oList); 
        }, 300);
    }
},

/*
Called to recalculate the sizes & position. Usually fired by an element that has 
resized (for some reason). Can bubble up and down. Recalculates the position of 
the scrollbar and calls the scrollbar to resize itself.

@param bDown    If true it bubbles up to parent components.
@private
*/
recalcDisplay : function(bDown){
    var iChild, oCurrentStyle;

    if(this.bDisplayScrollbar && this.oScrollbar){
        oCurrentStyle = vdf.sys.gui.getCurrentStyle(this.eElement);
        
        if(this.eHeaderRow){
            this.oScrollbar.iMarginTop = this.eHeaderRow.offsetHeight + parseInt(this.eHeaderRow.offsetTop, 10);
        }

        //  Calculate right margin (using border size en padding)
        this.oScrollbar.iMarginRight = 0;
        if(!isNaN(parseInt(oCurrentStyle.borderRightWidth, 10))){
            this.oScrollbar.iMarginRight += parseInt(oCurrentStyle.borderRightWidth, 10);
        }
        if(!isNaN(parseInt(oCurrentStyle.paddingRight, 10))){
            this.oScrollbar.iMarginRight += parseInt(oCurrentStyle.paddingRight, 10);
        }
        
        //  Calculate bottom margin (using border size en padding)
        this.oScrollbar.iMarginBottom = 0;
        if(!isNaN(parseInt(oCurrentStyle.borderBottomWidth, 10))){
            this.oScrollbar.iMarginBottom += parseInt(oCurrentStyle.borderBottomWidth, 10);
        }
        if(!isNaN(parseInt(oCurrentStyle.paddingBottom, 10))){
            this.oScrollbar.iMarginBottom += parseInt(oCurrentStyle.paddingBottom, 10);
        }
        
        this.oScrollbar.recalcDisplay(false);
    }
    
    if(bDown){
        for(iChild = 0; iChild < this.aChildren.length; iChild++){
            if(typeof this.aChildren[iChild].recalcDisplay === "function"){
                this.aChildren[iChild].recalcDisplay(bDown);
            }
        }
    }else{
        if(this.oParentControl !== null && typeof(this.oParentControl.recalcDisplay) === "function"){
            this.oParentControl.recalcDisplay(bDown);
        }
    }
},

/*
Updates the scrollbars slider position and enables or disables the scrollbar.

@private
*/
updateScrollbar : function(){
    if(this.bDisplayScrollbar && this.oScrollbar){
        if(this.aDisplay.length > 1){
            this.oScrollbar.enable();
            
            if(this.aBufferTop.length === 0 && this.aDisplay[0] === this.tSelectedRow){
                this.oScrollbar.scrollTop();
            }else if(this.aBufferBottom.length === 0 && this.aDisplay[this.aDisplay.length - 1] === this.tSelectedRow && (!this.bDisplayNewRow || this.aDisplay[this.aDisplay.length - 1] === this.tNewRecord)){
                this.oScrollbar.scrollBottom();
            }else{
                this.oScrollbar.center();
            }
        }else{
            this.oScrollbar.disable();
        }
    }
},

/*
Loops through the rows and sets the Odd & Even CSS classes.

@private
*/
displayRowCSS : function(){
    var iDataRow = 0, iRow, bOdd = true, eElem, sType;

    for(iRow = 0; iRow < this.eElement.rows.length; iRow++){
        sType = vdf.getDOMAttribute(this.eElement.rows[iRow], "sRowType", null);
        
        if(sType === "display" || sType === "spaceFiller" || sType === "edit"){
            eElem = (sType === "edit" ? this.tSelectedRow.__eDisplayRow : this.eElement.rows[iRow]);
            
            if(iDataRow === 0){
                bOdd = (eElem.className.match(this.sCssRowOdd) !== null);
            }else{
                bOdd = !bOdd;
            }
            
            eElem.className = eElem.className.replace(this.sCssRowOdd, "").replace(this.sCssRowEven, "") + " " + (bOdd ? this.sCssRowOdd : this.sCssRowEven);
            
            iDataRow++;
        }
        
    }

},

// - - - - - - - - - - LIST LOGIC - - - - - - - - - - -



/*
Selects the given row by setting it as the selected row. It also loads the 
snapshot into the DD and performs a findByRowId or clear if bSyncDD is true.

@param  tRow        The snapshot of the row to select.
@param  sField      (optional) Databinding of the field to select.
@param  fFinished   (optional) Function that is called after the select action is 
                finished.
@param  oEnvir      (optional) Environment used when calling fFinished.

@private
*/
select : function(tRow, sField, fFinished, oEnvir){
    this.tSelectedRow = tRow;
    
    if(this.oSelectAction !== null){
        this.oSelectAction.cancel();
    }
    
    this.oSelectAction = new vdf.core.Action(null, this.oForm, this, this.oServerDD, false);
    this.oSelectAction.onFinished.addListener(this.onSelectFinished, this);
    if(typeof fFinished === "function"){
        this.oSelectAction.onFinished.addListener(fFinished, oEnvir);
    }
    this.oServerDD.loadSnapshot(this.oSelectAction, tRow, false);
    
    if(this.iInitStage >= 3){   //  We don't need to talk to the DD's during initialization
        if(this.bDDSync || tRow === this.tNewRecord){
            if(tRow !== this.tNewRecord && tRow.__sRowId !== null){
                this.oServerDD.doFindByRowId(tRow.__sRowId, this.oSelectAction);
            }else{
                this.oServerDD.doClear(this.oSelectAction);
            }
        }else{
            this.oServerDD.loadSnapshot(this.oSelectAction, tRow, true);
            
            if(typeof fFinished === "function"){
                fFinished.call(oEnvir);
            }
        }
    }
    
    this.updateScrollbar();
    
    this.returnFocus();
    
    this.onSelect.fire(this, { tRow : tRow });
},

/*
Handles the onFinished event of the select Action and clears the oSelectAction 
property.

@param  oEvent  Event object.

@private
*/
onSelectFinished : function(oEvent){
    this.oSelectAction = null;
},

/*
Deselects the row by clearing the tSelectedRow property.

@private
*/
deSelect : function(){
    var tRow = this.tSelectedRow;
    this.tSelectedRow = null;
    
    this.onDeselect.fire(this, { tRow : tRow });
    
    return true;
},

/*
Scrolls one row up (visually). Doesn't take care of the selected record!

@private
*/
scrollVisualUp : function(){
    var bResult = false, tNewRow, tOldRow;

    if(this.aBufferTop.length > 0){
        //  Insert new row on top
        tNewRow = this.aBufferTop.shift();
        this.insertOnTop(this.createRow(tNewRow));
        this.aDisplay.unshift(tNewRow);
        
        //  Remove the old on the bottom
        tOldRow = this.aDisplay.pop();
        this.destroyRow(tOldRow);
        
        //  If this is the newrow we don't want it in the buffer
        if(tOldRow !== this.tNewRecord){
            this.aBufferBottom.unshift(tOldRow);
        }
        
        bResult = true;
    }
    
    return bResult;
},

/*
Scrolls one row down (visually). Doesn't take care of the selected record!

@private
*/
scrollVisualDown : function(){
    var bResult = false, tNewRow, tOldRow;

    if(this.aBufferBottom.length > 0){
        //  Insert new row on the bottom
        tNewRow = this.aBufferBottom.shift();
        this.insertOnBottom(this.createRow(tNewRow));
        this.aDisplay.push(tNewRow);
        
        //  Remove the old row on the top
        tOldRow = this.aDisplay.shift();
        this.destroyRow(tOldRow);
        this.aBufferTop.unshift(tOldRow);
        
        bResult = true;
    }else if(this.bDisplayNewRow && this.aDisplay[this.aDisplay.length - 1] !== this.tNewRecord){
        //  Insert newrow if needed
        this.insertOnBottom(this.createRow(this.tNewRecord));
        this.aDisplay.push(this.tNewRecord);
        
        //  Remove the old row on the top
        tOldRow = this.aDisplay.shift();
        this.destroyRow(tOldRow);
        this.aBufferTop.unshift(tOldRow);
        
        bResult = true;
    }
    
    return bResult;
},

/*
Moves the selected row one row up. It scrolls one row up visually if needed.
*/
scrollUp : function(){
    var iSelected = this.getSelectedRowNr(), oList = this;
    
    if(iSelected === 0){
        if(this.scrollVisualUp()){
            if(this.deSelect()){
                this.select(this.aDisplay[iSelected]);
            }
        }
        
        setTimeout(function(){
            oList.buffer(-1);
        }, 10);
    }else{
        iSelected--;
        
        if(iSelected < this.aDisplay.length && iSelected >= 0){
            if(this.deSelect()){
                this.select(this.aDisplay[iSelected]);
            }
        }
    }    

},

/*
Moves the selection one row down. Scrolls one row down visually if need.
*/
scrollDown : function(){
    var iSelected = this.getSelectedRowNr(), oList = this;   
    if(iSelected === (this.aDisplay.length - 1)){
        if(this.scrollVisualDown()){
            if(this.deSelect()){
                this.select(this.aDisplay[iSelected]);
            }
        }
        
        setTimeout(function(){
            oList.buffer(1);
        }, 10);
    }else{
        iSelected++;
        
        if(iSelected < this.aDisplay.length && iSelected >= 0){
            if(this.deSelect()){
                this.select(this.aDisplay[iSelected]);
            }
        }
    }
},

/*
Scrolls to the bottom. It does this by refreshing the buffer and updating the 
display. The request for the refresh is made asynchronously and 
handleScrollBottom handles the result.
*/
scrollBottom : function(){
    var oAction, tRequestSet, tEmptyRow;

    if(this.oScrollAction !== null){
        this.oScrollAction.cancel();
    }
    
    //  Deselect selected row
    if(this.deSelect()){
    
        oAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
        if(oAction.lock(this)){
            
            if(this.oSelectAction !== null){
                this.oSelectAction.cancel();
            }
        
            tEmptyRow = this.createEmptySnapshot();
                
            tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
            tRequestSet.sName = "List_ScrollBottom_Find";
            tRequestSet.sRequestType = "find";
            tRequestSet.iMaxRows = this.iLength;
            tRequestSet.sIndex = this.getIndex();
            tRequestSet.sTable = this.sTable;
            tRequestSet.sFindMode = (this.bReverseIndex ? vdf.FIRST : vdf.LAST); // LAST & FIRST are after the first row automatically changed into LT & GT
            tRequestSet.aRows.push(tEmptyRow);
            oAction.addRequestSet(tRequestSet);
            oAction.onResponse.addListener(this.handleScrollBottom, this);
            oAction.send();
        }
    }
},

/*
Handles the response from the scrollbottom request. It loads the response 
snapshots into the buffer and refreshes the display.

@param  oEvent  Event object with the response data.
@private
*/
handleScrollBottom : function(oEvent){
    var iRow, tSet;
    
    this.oScrollAction = null;
    if(!oEvent.bError){
        
        //  Reset buffers
        this.aDisplay = [];
        this.aBufferTop = [];
        this.aBufferBottom = [];
        
        //  Find response set
        tSet = oEvent.tResponseData.aDataSets[0];

        //  Refill buffer
        for(iRow = tSet.aRows.length - 1; iRow >= 0; iRow--){
            this.aDisplay.push(this.initResponseSnapshot(tSet.aRows[iRow]));
        }
        
        //  Insert the empty row
        if(this.bDisplayNewRow){
            //this.tNewRecord = this.initResponseSnapshot(this.createEmptySnapshot());
            this.aDisplay.push(this.tNewRecord);
            if(this.aDisplay.length > this.iLength){
                this.aBufferTop.push(this.aDisplay.shift());
            }
        }
        
        
        //  Refresh display
        this.displayRefresh();
        
        if(this.aDisplay.length > 0){
            this.select(this.aDisplay[this.aDisplay.length - 1]);
        }
        
        //  Reset the buffer to much prevention
        this.sLastBufferUp = null;
        this.sLastBufferDown = null;
        
        //  Buffer if needed
        if(this.aDisplay.length == this.iLength){
            this.buffer(-1);
        }
    }
},

/*
Scrolls to the top by sending a request to refill the list. This request is 
send asynchronously.
*/
scrollTop : function(){
    var oAction, tRequestSet, tEmptyRow;

    if(this.oScrollAction !== null){
        this.oScrollAction.cancel();
    }
    
    if(this.deSelect()){
        oAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
        if(oAction.lock(this)){
            this.oScrollAction = oAction;
            tEmptyRow = this.createEmptySnapshot();
            
            tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
            tRequestSet.sName = "List_ScrollTop_Find";
            tRequestSet.sRequestType = "find";
            tRequestSet.iMaxRows = this.iLength;
            tRequestSet.sIndex = this.getIndex();
            tRequestSet.sTable = this.sTable;
            tRequestSet.sFindMode = (this.bReverseIndex ? vdf.LAST : vdf.FIRST); // LAST & FIRST are after the first row automatically changed into LT & GT
            tRequestSet.aRows.push(tEmptyRow);
            oAction.addRequestSet(tRequestSet);
            
            oAction.onResponse.addListener(this.handleScrollTop, this);
            oAction.send();
        }
    }
},

/*
Handles the response from the scrollTop request by loading the response 
snapshots into the buffer and refreshing the display.

@param  oEvent  Event object that contains the response data.s
@private
*/
handleScrollTop : function(oEvent){
    var iRow, tSet;
    
    this.oScrollAction = null;
    
    if(!oEvent.bError){
        //  Reset buffers
        this.aDisplay = [];
        this.aBufferTop = [];
        this.aBufferBottom = [];
        
        //  Find response set
        tSet = oEvent.tResponseData.aDataSets[0];

        //  Refill buffer
        for(iRow = 0; iRow < tSet.aRows.length; iRow++){
            this.aDisplay.push(this.initResponseSnapshot(tSet.aRows[iRow]));
        }
        
        //  Insert the empty row if needed (and create a new because rowids might have changed)
        if(this.bDisplayNewRow){
            //this.tNewRecord = this.initResponseSnapshot(this.createEmptySnapshot());
            
            if(this.aDisplay.length < this.iLength){
                this.aDisplay.push(this.tNewRecord);
            }
        }
        
        //  Refresh display
        this.displayRefresh();
        
        if(this.aDisplay.length > 0){
            this.select(this.aDisplay[0]);
        }
        
        //  Reset the buffer to much prevention
        this.sLastBufferUp = null;
        this.sLastBufferDown = null;
        
        //  Buffer if needed
        if(this.aDisplay.length == this.iLength){
            this.buffer(1);
        }
    }
},

/*
Scrolls one page down.
*/
scrollPageDown : function(){
    var iScroll = this.iLength, iSelected = this.getSelectedRowNr(), oList = this;
    
    if(this.deSelect()){
        while(iScroll > 0 && this.scrollVisualDown()){
            iScroll--;
        }
        
        while(iSelected < (this.aDisplay.length - 1) && iScroll > 0){
            iScroll--;
            iSelected++;
        }
        
        if(iSelected !== null){
            this.select(this.aDisplay[iSelected]);
        }
        
        setTimeout(function(){
            oList.buffer(1);
        }, 10);
    }
},

/*
Scrolls one page.
*/
scrollPageUp : function(){
    var iScroll = this.iLength, iSelected = this.getSelectedRowNr(), oList = this;
    
    if(this.deSelect()){
        while(iScroll > 0 && this.scrollVisualUp()){
            iScroll--;
        }
        
        while(iSelected > 0 && iScroll > 0){
            iScroll--;
            iSelected--;
        }
        
        if(iSelected !== null){
            this.select(this.aDisplay[iSelected]);
        }
        
        setTimeout(function(){
            oList.buffer(-1);
        }, 10);

    }
    
},

/*
Selects the row of which the DOM element is given.

@param  eRow        Reference to tr DOM element.
@param  sField      (optional) Data binding of the field to select.
@param  fFinished   (optional) Function that is called after the select action is 
                finished.
@param  oEnvir      (optional) Environment used when calling fFinished.
@return True if succesfull.
@private
*/
scrollToRow : function(eRow, sField, fFinished, oEnvir){
    if(eRow.tRow){
        if(eRow.tRow === this.tSelectedRow){
            if(typeof fFinished === "function"){
                fFinished.call(oEnvir);
            }
        }else if(this.deSelect()){
            this.select(eRow.tRow, sField, fFinished, oEnvir);
            
            return true;
        }        
    }
    
    return false;
},

/*
Scrolls to the row with the given rowid. If it can't find it it calls the 
fillByRowId function.

@param  sRowId  Serialized rowid.
*/
scrollToRowId : function(sRowId){
    var iDisplayRow = null, iRow;
    
    if(this.deSelect() || this.tSelectedRow !== null){
        //  Search in top buffer..
        for(iRow = 0; iRow < this.aBufferTop.length; iRow++){
            if(this.aBufferTop[iRow].__sRowId === sRowId){
                //  Scroll up
                while(iRow >= 0){
                    this.scrollVisualUp();
                    iRow--;
                }
                
                iDisplayRow = 0;
                break;
            }
        }
        
        //  Search in displayed rows
        if(iDisplayRow === null){
            for(iRow = 0; iRow < this.aDisplay.length; iRow++){
                if(this.aDisplay[iRow].__sRowId === sRowId){
                    //  Scroll up
                    iDisplayRow = iRow;
                    break;
                }
            }
        }
        
        //  Search in bottom buffer
        if(iDisplayRow === null){
            for(iRow = 0; iRow < this.aBufferBottom.length; iRow++){
                if(this.aBufferBottom[iRow].__sRowId === sRowId){
                    //  Scroll down
                    while(iRow >= 0){
                        this.scrollVisualDown();
                        iRow--;
                    }
                    
                    iDisplayRow = this.aDisplay.length - 1;
                    break;
                }
            }
        }
        
        if(iDisplayRow !== null){
            this.select(this.aDisplay[iDisplayRow]);
        }else{
            this.fillByRowId(sRowId);
        }
    }
},

/*
Sends a request to fill the list.

@param  oAction (optional) Action object to use for the fill.
@private
*/
fill : function(oAction){
    var tRequestSet, tEmptyRow, bContinue = true;
    
    this.cancelRequests();

    if(oAction === null || typeof(oAction) === "undefined"){
        oAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
        bContinue = oAction.lock(this);
    }
    
    if(bContinue){
        this.oFillAction = oAction;
    
        tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
        tEmptyRow = this.createEmptySnapshot();
        tRequestSet.sName = "List_Fill_Find";
        tRequestSet.sRequestType = "find";
        tRequestSet.iMaxRows = this.iLength;
        tRequestSet.sIndex = this.getIndex();
        tRequestSet.sTable = this.sTable;
        tRequestSet.sFindMode = (this.ddHasRecord() ? (this.bReverseIndex ? vdf.LT : vdf.GT) : (this.bReverseIndex ? vdf.LAST : vdf.FIRST) );
        tRequestSet.aRows.push(tEmptyRow);
        oAction.addRequestSet(tRequestSet);
        
        oAction.onResponse.addListener(this.handleFill, this);
        oAction.send();
    }
},

/*
Handles the fill response by loading the received snapshots into the buffer and
updating the display.

@param  oEvent  Event object with response data.
@private
*/
handleFill : function(oEvent){
    var iRow, tSet;

    this.oFillAction = null;
    
    if(!oEvent.bError){
        //  Deselect selected row
        if(this.tSelectedRow !== null){
            this.deSelect();
        }
        
        //  Reset buffers
        this.aDisplay = [];
        this.aBufferTop = [];
        this.aBufferBottom = [];
        
        //  Find response set
        tSet = oEvent.tResponseData.aDataSets[0];
        
        //  Refill buffer
        for(iRow = 0; iRow < tSet.aRows.length; iRow++){
            this.aDisplay.push(this.initResponseSnapshot(tSet.aRows[iRow]));
        }
        
        //  Insert the empty row if needed (and create a new because rowids might have changed)
        if(this.bDisplayNewRow){
            //this.tNewRecord = this.initResponseSnapshot(this.createEmptySnapshot());
            
            if(this.aDisplay.length < this.iLength){
                this.aDisplay.push(this.tNewRecord);
            }
        }
        
        //  Refresh display
        this.displayRefresh();
        
        if(this.aDisplay.length > 0){
            this.select(this.aDisplay[0]);
        }
        
        //  Reset the buffer to much prevention
        this.sLastBufferUp = null;
        this.sLastBufferDown = null;
        
        //  Buffer if needed
        if(this.aDisplay.length == this.iLength){
            this.buffer(1);
        }
    }
},


/*
Sends a request to fill the list. It fills the list bottom up instead of top 
down and selects the last row.

@param  oAction (optional) Action object to use for the fill.
@private
*/
fillBottomUp : function(oAction){
    var tRequestSet, tEmptyRow, bContinue = true;
    
    this.cancelRequests();

    if(oAction === null || typeof(oAction) === "undefined"){
        oAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
        bContinue = oAction.lock(this);
    }
    
    if(bContinue){
        this.oFillAction = oAction;
    
        tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
        tEmptyRow = this.createEmptySnapshot();
        tRequestSet.sName = "List_Fill_FindBottomUp";
        tRequestSet.sRequestType = "find";
        tRequestSet.iMaxRows = this.iLength;
        tRequestSet.sIndex = this.getIndex();
        tRequestSet.sTable = this.sTable;
        tRequestSet.sFindMode = (this.bReverseIndex ? vdf.FIRST : vdf.LAST); // LAST & FIRST are after the first row automatically changed into LT & GT
        tRequestSet.aRows.push(tEmptyRow);
        oAction.addRequestSet(tRequestSet);
        
        oAction.onResponse.addListener(this.handleFillBottomUp, this);
        oAction.send();
    }
},

/*
Handles the fillBottomUp response by loading the received snapshots into the 
buffer and updating the display.

@param  oEvent  Event object with response data.
@private
*/
handleFillBottomUp : function(oEvent){
    var iRow, tSet;

    this.oFillAction = null;
    
    if(!oEvent.bError){
        //  Deselect selected row
        if(this.tSelectedRow !== null){
            this.deSelect();
        }
        
        //  Reset buffers
        this.aDisplay = [];
        this.aBufferTop = [];
        this.aBufferBottom = [];
        
        //  Find response set
        tSet = oEvent.tResponseData.aDataSets[0];

        //  Refill buffer
        for(iRow = tSet.aRows.length - 1; iRow >= 0; iRow--){
            this.aDisplay.push(this.initResponseSnapshot(tSet.aRows[iRow]));
        }
        
        //  Insert the empty row
        if(this.bDisplayNewRow){
            //this.tNewRecord = this.initResponseSnapshot(this.createEmptySnapshot());
            this.aDisplay.push(this.tNewRecord);
            if(this.aDisplay.length > this.iLength){
                this.aBufferTop.push(this.aDisplay.shift());
            }
        }
        
        
        //  Refresh display
        this.displayRefresh();
        
        if(this.aDisplay.length > 0){
            this.select(this.aDisplay[this.aDisplay.length - 1]);
        }
        
        //  Reset the buffer to much prevention
        this.sLastBufferUp = null;
        this.sLastBufferDown = null;
        
        //  Buffer if needed
        if(this.aDisplay.length == this.iLength){
            this.buffer(-1);
        }
    }
},


/*
Fills the list starting with the record of the given rowid. If this record is 
found it will be selected. Note that that the fill request is sent 
asynchronously.

@param  sRowId  String with the serialized rowid.
@param  oAction (optional) Reference to the action object.
*/
fillByRowId : function(sRowId, oAction){
    var iSelected, tEmptyRow, tStatusSet, tRequestSet, bContinue = true;

    this.cancelRequests();

     if(oAction === null || typeof(oAction) === "undefined"){
        oAction = new vdf.core.Action("find", this.oForm, this.oServerDD, false);
        bContinue = oAction.lock(this);
    }
    
    if(bContinue){
        this.oFillAction = oAction;
        
        iSelected = this.getSelectedRowNr();
        tEmptyRow = this.createEmptySnapshot();
        
        tStatusSet = new vdf.dataStructs.TAjaxRequestSet();
        tStatusSet.sName = "List_RefreshByRowId_StatusFind";
        tStatusSet.sRequestType = "findByRowId";
        tStatusSet.iMaxRows = 1;
        tStatusSet.sTable = this.sTable;
        tStatusSet.sFindValue = sRowId;
        tStatusSet.bReturnCurrent = false;
        tStatusSet.aRows.push(tEmptyRow);
        
        
        if(iSelected > 0){
            tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
            tRequestSet.sName = "List_RefreshByRowId_FindTop";
            tRequestSet.sRequestType = "find";
            tRequestSet.iMaxRows = iSelected;
            tRequestSet.sIndex = this.getIndex();
            tRequestSet.sTable = this.sTable;
            tRequestSet.sFindMode = (this.bReverseIndex ? vdf.GT : vdf.LT);
            tRequestSet.bLoadStatus = false;
            tRequestSet.aRows.push(tEmptyRow);
            
            oAction.addRequestSet(tStatusSet);
            oAction.addRequestSet(tRequestSet);
        }
     
        
        tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
        tRequestSet.sName = "List_RefreshByRowId_FindBottom";
        tRequestSet.sRequestType = "find";
        tRequestSet.iMaxRows = this.iLength;
        tRequestSet.sIndex = this.getIndex();
        tRequestSet.sTable = this.sTable;
        tRequestSet.sFindMode = (this.bReverseIndex ? vdf.LT : vdf.GT);
        tRequestSet.bLoadStatus = false;
        tRequestSet.bReturnCurrent = true;
        tRequestSet.aRows.push(tEmptyRow);
        
        oAction.addRequestSet(tStatusSet);
        oAction.addRequestSet(tRequestSet);
        
        oAction.onResponse.addListener(this.handleFillByRowId, this);
        oAction.send();
    }
},

/*
@private
*/
handleFillByRowId : function(oEvent){
    var iSelected = 0, iSet, iRow, tResponseSet;
    
    this.oFillAction = null;
    
    if(!oEvent.bError){
        //  Deselect selected row
        if(this.tSelectedRow !== null){
            iSelected = this.getSelectedRowNr();
            this.deSelect();
        }
        
        //  Reset buffers
        this.aDisplay = [];
        this.aBufferTop = [];
        this.aBufferBottom = [];
        
        
        for(iSet = 0; iSet < oEvent.tResponseData.aDataSets.length; iSet++){
            tResponseSet = oEvent.tResponseData.aDataSets[iSet];
            
            //  Add the findtop result
            if(tResponseSet.sName === "List_RefreshByRowId_FindTop"){
                for(iRow = 0; iRow < tResponseSet.aRows.length; iRow++){
                    this.aDisplay.unshift(this.initResponseSnapshot(tResponseSet.aRows[iRow]));
                }
                
                iSelected = iRow;
            }
            
            //  Add the findbottom
            if(tResponseSet.sName === "List_RefreshByRowId_FindBottom"){
                for(iRow = 0; iRow < tResponseSet.aRows.length; iRow++){
                    if(this.aDisplay.length < this.iLength){
                        this.aDisplay.push(this.initResponseSnapshot(tResponseSet.aRows[iRow]));
                    }else{
                        this.aBufferBottom.push(this.initResponseSnapshot(tResponseSet.aRows[iRow]));
                    }
                }
            }
        }
        
        //  Insert the empty row if needed (and create a new because rowids might have changed)
        if(this.bDisplayNewRow){
            //this.tNewRecord = this.initResponseSnapshot(this.createEmptySnapshot());
            
            if(this.aDisplay.length < this.iLength){
                this.aDisplay.push(this.tNewRecord);
            }
        }
        
        //  Refresh display
        this.displayRefresh();
        
        if(this.aDisplay.length > iSelected){
            this.select(this.aDisplay[iSelected]);
        }else if(this.aDisplay.length > 0){
            this.select(this.aDisplay[0]);
        }
        
        //  Reset the buffer to much prevention
        this.sLastBufferUp = null;
        this.sLastBufferDown = null;
        
        this.buffer(0);
    }
},

/*
Jumps in the index of the given column using the given value. If the given 
column does not exist or is not indexed nothing happens. The list is refilled 
during this action which is done asynchronously.

@param  sBinding    Data binding of the column to find on.
@param  sValue      The value to find on.
*/
findByColumn : function(sBinding, sValue){
    var iIndex, bContinue = true, oAction, iSelected, tEmptyRow, tStatusSet, tRequestSet, sField;

    if(this.sTable === sBinding.substr(0, this.sTable.length)){
        iIndex = this.oForm.oMetaData.getFieldProperty("iIndex", sBinding);
        sField = sBinding.replace("__", ".").substr(this.sTable.length + 1);
        if(iIndex !== null && iIndex !== ""){
            this.cancelRequests();

            if(oAction === null || typeof(oAction) === "undefined"){
                oAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
                bContinue = oAction.lock(this);
            }
            
            if(bContinue){
                this.oFillAction = oAction;
             
                iSelected = this.getSelectedRowNr();
                tEmptyRow = this.createEmptySnapshot(sBinding, sValue);
                                
                tStatusSet = new vdf.dataStructs.TAjaxRequestSet();
                tStatusSet.sName = "List_FindByColumn_Status";
                tStatusSet.sRequestType = "findByField";
                tStatusSet.sFindMode = vdf.GE;
                tStatusSet.iMaxRows = 1;
                tStatusSet.sTable = this.sTable;
                tStatusSet.sColumn = sField;
                tStatusSet.bReturnCurrent = false;
                tStatusSet.aRows.push(tEmptyRow);
                
                
                if(iSelected > 0){
                    tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
                    tRequestSet.sName = "List_FindByColumn_FindTop";
                    tRequestSet.sRequestType = "find";
                    tRequestSet.iMaxRows = iSelected;
                    tRequestSet.sIndex = this.getIndex();
                    tRequestSet.sTable = this.sTable;
                    tRequestSet.sFindMode = (this.bReverseIndex ? vdf.GT : vdf.LT);
                    tRequestSet.bLoadStatus = false;
                    tRequestSet.aRows.push(tEmptyRow);
                    
                    oAction.addRequestSet(tStatusSet);
                    oAction.addRequestSet(tRequestSet);
                }
             
                
                tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
                tRequestSet.sName = "List_FindByColumn_FindBottom";
                tRequestSet.sRequestType = "find";
                tRequestSet.iMaxRows = this.iLength - iSelected;
                tRequestSet.sIndex = this.getIndex();
                tRequestSet.sTable = this.sTable;
                tRequestSet.sFindMode = (this.bReverseIndex ? vdf.LT : vdf.GT);
                tRequestSet.bLoadStatus = false;
                tRequestSet.bReturnCurrent = true;
                tRequestSet.aRows.push(tEmptyRow);
                
                oAction.addRequestSet(tStatusSet);
                oAction.addRequestSet(tRequestSet);
                
                oAction.onResponse.addListener(this.handleFindByColumn, this);
                oAction.send();
                
                
             
            }    
        }else{
            throw new vdf.errors.Error(5147, "Column not in index.", this, [ sBinding ]);
        }
    }else{
        throw new vdf.errors.Error(5148, "Column not in the maintable.", this, [ sBinding ]);
    }
    
},

/*
@private
*/
handleFindByColumn : function(oEvent){
    var iSelected = 0, iSet, iRow, tResponseSet;
    
    this.oFillAction = null;
    
    if(!oEvent.bError){
        //  Deselect selected row
        if(this.tSelectedRow !== null){
            iSelected = this.getSelectedRowNr();
            this.deSelect();
        }
        
        //  Reset buffers
        this.aDisplay = [];
        this.aBufferTop = [];
        this.aBufferBottom = [];
        
        
        for(iSet = 0; iSet < oEvent.tResponseData.aDataSets.length; iSet++){
            tResponseSet = oEvent.tResponseData.aDataSets[iSet];
            
            if(tResponseSet.sName === "List_FindByColumn_FindTop"){
                for(iRow = 0; iRow < tResponseSet.aRows.length; iRow++){
                    this.aDisplay.unshift(this.initResponseSnapshot(tResponseSet.aRows[iRow]));
                }
            }
            
            
            if(tResponseSet.sName === "List_FindByColumn_FindBottom"){
                for(iRow = 0; iRow < tResponseSet.aRows.length; iRow++){
                    this.aDisplay.push(this.initResponseSnapshot(tResponseSet.aRows[iRow]));
                }
            }
        }
        
        //  Insert the empty row if needed (and create a new because rowids might have changed)
        if(this.bDisplayNewRow){
            //this.tNewRecord = this.initResponseSnapshot(this.createEmptySnapshot());
            
            if(this.aDisplay.length < this.iLength){
                this.aDisplay.push(this.tNewRecord);
            }
        }
        
        //  Refresh display
        this.displayRefresh();
        
        if(this.aDisplay.length > iSelected){
            this.select(this.aDisplay[iSelected]);
        }else if(this.aDisplay.length > 0){
            this.select(this.aDisplay[0]);
        }
        
        //  Reset the buffer to much prevention
        this.sLastBufferUp = null;
        this.sLastBufferDown = null;
        
        this.buffer(0);
    }
},


/*
Makes sure the are enough (and not to much) records in the buffer.

@private
*/
buffer : function(iDir){
    var oAction, tRequestSet, sRowId, iTime;
    
    if(this.oBufferAction !== null){
        return;
    }
    
    oAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
    this.oBufferAction = oAction;
    
    
    //  Determine if top buffer needs to be filled
    if(iDir <= 0){
        if(this.aBufferTop.length < this.iMinBuffer && this.aDisplay.length > 0){
            tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
            tRequestSet.sName = "List_BufferTop_Find";
            tRequestSet.sRequestType = "find";
            tRequestSet.iMaxRows = this.iMaxBuffer - this.aBufferTop.length;
            tRequestSet.sIndex = this.getIndex();
            tRequestSet.sTable = this.sTable;
            tRequestSet.sFindMode = (this.bReverseIndex ? vdf.GT : vdf.LT);
            
            //  Determine first record to buffer from
            if(this.aBufferTop.length > 0){
                tRequestSet.aRows.push(this.aBufferTop[this.aBufferTop.length - 1]);
            }else{
                if(this.aDisplay[0] !== this.tNewRecord){
                    tRequestSet.aRows.push(this.aDisplay[0]);
                }
            }
            
            if(tRequestSet.aRows.length > 0){
                //  Make sure we do not keep on trying to find records that are not available more than once per iBufferWait milliseconds
                sRowId = tRequestSet.aRows[0].__sRowId;
                iTime = new Date().getTime();
                if(sRowId !== this.sLastBufferUp || iTime > this.iLastBufferUp + this.iBufferWait){
                    this.sLastBufferUp = sRowId;
                    this.iLastBufferUp = iTime;
                    
                    oAction.addRequestSet(tRequestSet);
                }
            }
        }
    }
    
    if(this.aBufferTop.length > this.iMaxBuffer){
        this.aBufferTop.splice(this.iMaxBuffer, (this.aBufferTop.length - this.iMaxBuffer));
    }
    
    //  Determine if bottom buffer needs to be filled
    if(iDir >= 0){
        if(this.aBufferBottom.length < this.iMinBuffer && this.aDisplay.length > 0){
            tRequestSet = new vdf.dataStructs.TAjaxRequestSet();
            tRequestSet.sName = "List_BufferBottom_Find";
            tRequestSet.sRequestType = "find";
            tRequestSet.iMaxRows = this.iMaxBuffer - this.aBufferBottom.length;
            tRequestSet.sIndex = this.getIndex();
            tRequestSet.sTable = this.sTable;
            tRequestSet.sFindMode = (this.bReverseIndex ? vdf.LT :  vdf.GT);
            
            if(this.aBufferBottom.length > 0){
                tRequestSet.aRows.push(this.aBufferBottom[this.aBufferBottom.length - 1]);
            }else{
                if(this.aDisplay[this.aDisplay.length - 1] !== this.tNewRecord){
                    tRequestSet.aRows.push(this.aDisplay[this.aDisplay.length - 1]);
                }else{
                    if(this.aDisplay.length > 2){
                        tRequestSet.aRows.push(this.aDisplay[this.aDisplay.length - 2]);
                    }
                }
            }
            
            if(tRequestSet.aRows.length > 0){
                //  Make sure we do not keep on trying to find records that are not available more than once per iBufferWait milliseconds
                sRowId = tRequestSet.aRows[0].__sRowId;
                iTime = new Date().getTime();
                if(sRowId !== this.sLastBufferDown || iTime > this.iLastBufferDown + this.iBufferWait){
                    this.sLastBufferDown = sRowId;
                    this.iLastBufferDown = iTime;
                    
                    oAction.addRequestSet(tRequestSet);
                }
            }
        }
    }
    
    if(this.aBufferBottom.length > this.iMaxBuffer){
        this.aBufferBottom.splice(this.iMaxBuffer, (this.aBufferBottom.length - this.iMaxBuffer));
    }

    
    if(oAction.tRequestData.aDataSets.length > 0){
        oAction.onResponse.addListener(this.handleBuffer, this);
        oAction.send();
    }else{
        this.oBufferAction = null;
    }
},

/*
@private
*/
handleBuffer : function(oEvent){
    var tResponseSet, iSet, tNewRow, iRow;

    if(!oEvent.bError){
        for(iSet = 0; iSet < oEvent.tResponseData.aDataSets.length; iSet++){
            tResponseSet = oEvent.tResponseData.aDataSets[iSet];
            
            if(tResponseSet.sName === "List_BufferTop_Find"){
                for(iRow = 0; iRow < tResponseSet.aRows.length; iRow++){
                    tNewRow = this.initResponseSnapshot(tResponseSet.aRows[iRow]);
                
                    if(this.aDisplay.length < this.iLength){
                        this.deleteEmptyRow();
                        this.insertOnTop(this.createRow(tNewRow));
                        this.aDisplay.unshift(tNewRow);
                    }else{  
                        this.aBufferTop.push(tNewRow);
                    }
                }
            }
            
            
            if(tResponseSet.sName === "List_BufferBottom_Find"){
                for(iRow = 0; iRow < tResponseSet.aRows.length; iRow++){
                    tNewRow = this.initResponseSnapshot(tResponseSet.aRows[iRow]);

                    if(this.aDisplay.length < this.iLength){
                        this.deleteEmptyRow();
                        this.insertOnBottom(this.createRow(tNewRow));
                        this.aDisplay.push(tNewRow);
                    }else{  
                        this.aBufferBottom.push(tNewRow);
                    }
                }
            }
        }
        
        this.oBufferAction = null;
        
        this.updateScrollbar();
    }
},

/*
@private
*/
cancelRequests : function(){
    if(this.oFillAction !== null){
        this.oFillAction.cancel();
        this.oFillAction = null;
    }
    if(this.oScrollAction !== null){
        this.oScrollAction.cancel();
        this.oScrollAction = null;
    }
    if(this.oBufferAction !== null){
        this.oBufferAction.cancel();
        this.oBufferAction = null;
    }
    
},

// - - - - - - - - - - DATA ENTRY IMPLEMENTATION - - - - - - - - - - -
/*
@private
*/
bindDD : function(){
    var sServerTable, iProto;
    
    sServerTable = this.getVdfAttribute("sServerTable", null, true);
    if(sServerTable !== null){
        this.oServerDD = this.oForm.oDDs[sServerTable.toLowerCase()];
        this.oServerDD.registerDEO(this);
        
        //  Create fields used by the list in the DD buffers
        for(iProto = 0; iProto < this.aPrototypeFields.length; iProto++){
            if(this.aPrototypeFields[iProto].sDataBindingType == "D"){
                if(this.oForm.oDDs[this.aPrototypeFields[iProto].sTable]){
                    this.oForm.oDDs[this.aPrototypeFields[iProto].sTable].createBufferField(this.aPrototypeFields[iProto].sDataBinding, "D");
                }
            }
        }
    }
},

/*
Refreshes the list (the data and the display).
*/
doRefresh : function(){
    this.refresh();
},

/*
Called by the DD to update the list.

@param  oInvokeAction   (optional) Reference to the action object.
@private
*/
refresh : function(oInvokeAction){

    //  Determine the best refresh method based on the action details and the current situation
    if(oInvokeAction && oInvokeAction.sMode === "save"){
        if(this.bAlwaysInOrder){
            if(this.oServerDD.tStatus.sValue !== this.getSelectedRowId()){
                if(this.tSelectedRow === this.tNewRecord){
                    this.rowRefresh();
                }else{
                    this.fullRefresh(oInvokeAction, true);
                }
            }else{
                this.rowRefresh();
            }
        }else{
            if(this.tSelectedRow === this.tNewRecord){
                this.fullRefresh(oInvokeAction, true, true);
            }else{
                this.fullRefresh(oInvokeAction, true);
            }
        }
    }else if(oInvokeAction && oInvokeAction.sMode === "delete"){
        if(this.oServerDD.tStatus.sValue !== this.getSelectedRowId() && oInvokeAction.oMainDD === this.oServerDD){
            this.rowRefreshDelete();
        }else{
            this.fullRefresh(oInvokeAction, true);
        }
    }else{
        if(oInvokeAction){
            if(oInvokeAction.oInitiator !== this){
                if(this.tSelectedRow === null  || this.oServerDD.tStatus.sValue !== this.getSelectedRowId() || this.oServerDD.tStatus.sValue === "" || !this.bAlwaysInOrder){
                    this.fullRefresh(oInvokeAction, true);
                }else{
                    this.rowRefresh();
                }
            }
        }else{
            this.fullRefresh();
        }
    }
},

/*
@private
*/
rowRefresh : function(){
    var tNewRow, eNewRow, iSelected, tOrigRow;

    iSelected = this.getSelectedRowNr();
    tOrigRow = this.aDisplay[iSelected];
    
    //  Generate a new snapshot
    tNewRow = this.oServerDD.generateExtSnapshot(true);
    tNewRow = this.initResponseSnapshot(tNewRow);
    
    //  If the origional record was the new record and the new record was empty we asume that it was a different save and that we are not involved
    if(tOrigRow === this.tNewRecord && tNewRow.__sRowId === this.tNewRecord.__sRowId){
        return;
    }
       
    
    eNewRow = this.createRow(tNewRow);
    
    //  Update snapshot in buffer

    this.aDisplay[iSelected] = tNewRow;
    this.tSelectedRow = tNewRow;
    tNewRow.__eRow = (tOrigRow.__eRow === tOrigRow.__eDisplayRow ? eNewRow : tOrigRow.__eRow);
    tNewRow.__eDisplayRow = eNewRow;
    eNewRow.className = tOrigRow.__eDisplayRow.className;
    
    //  Update displayed snapshot (if needed)  
    if(tOrigRow.__eDisplayRow.parentNode !== null){
        vdf.sys.dom.swapNodes(tOrigRow.__eDisplayRow, eNewRow);
    }
    
    if(tOrigRow === this.tNewRecord){
        //  If the selected row was a newrow we asume it doesn't exists any more and so we insert the new row on the bottom
        if(this.aDisplay.length < this.iLength){
            this.insertOnBottom(this.createRow(this.tNewRecord));
            this.deleteEmptyRow();
            this.aDisplay.push(this.tNewRecord);
        }
    }else{
        //  Destroy orrigionall snapshot & DOM elements
        tOrigRow.__eDisplayRow.tRow = null;
        tOrigRow.__eDisplayRow = null;
        tOrigRow.__eRow = null;
        
    }
    
    //  Fix Odd & Even CSS classes
    this.displayRowCSS();
    
},

/*
@private
*/
rowRefreshDelete : function(){
    var iSelected, tOldRow, tNewRow;
    
    //  Store selected row number
    iSelected = this.getSelectedRowNr();
    tOldRow = this.tSelectedRow;
    this.deSelect();
    
    //  Remove row from the list
    this.aDisplay.splice(iSelected, 1);
    if(this.aBufferBottom.length > 0){
        //  Insert new row on the bottom
        tNewRow = this.aBufferBottom.shift();
        this.insertOnBottom(this.createRow(tNewRow));
        this.aDisplay.push(tNewRow);
    }else if(this.bDisplayNewRow && this.aDisplay[this.aDisplay.length - 1] !== this.tNewRecord){
        //  Insert newrow if needed
        this.insertOnBottom(this.createRow(this.tNewRecord));
        this.aDisplay.push(this.tNewRecord);
    }else if(this.aBufferTop.length > 0){
        //  Insert new row on top
        tNewRow = this.aBufferTop.shift();
        this.insertOnTop(this.createRow(tNewRow));
        this.aDisplay.unshift(tNewRow);
    }else{
        this.insertOnBottom(this.createEmptyRow(false));
    }
    
    this.destroyRow(tOldRow);
    
    
    //  Select the row that is the closest to the current row
    if(iSelected >= this.aDisplay.length){
        iSelected--;
    } 
    if(iSelected >= 0 && iSelected < this.aDisplay.length){
        this.select(this.aDisplay[iSelected]);
    }
   
    //  Fix Odd & Even CSS classes
    this.displayRowCSS();
},




/*
@private
*/
fullRefresh : function(oInvokeAction, bWait, bBottomUp){
    var bContinue = true;

    if(this.tRefreshTimeout !== null){
        clearTimeout(this.tRefreshTimeout);
    }else{
        this.oRefreshAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
        bContinue = this.oRefreshAction.lock(this);
    }
        
    if(bContinue){
        if(bWait){
            this.fullRefreshWait(bBottomUp);
        }else{
            this.fullRefreshPerform(bBottomUp);
        }
    }
},

/*
@private
*/
fullRefreshWait : function(bBottomUp){
    var oList = this;

    this.tRefreshTimeout = setTimeout(function(){
        oList.fullRefreshPerform.call(oList, bBottomUp);
    }, this.iRefreshTimeout);
},

/*
@private
*/
fullRefreshPerform : function(bBottomUp){
    var sRowId;

    if(this.oServerDD.iLocked > 0){
        this.fullRefreshWait();
    }else{
        this.tRefreshTimeout = null;
    
        if(bBottomUp){
            this.fillBottomUp(this.oRefreshAction);
        }else{
            sRowId = this.oServerDD.getFieldValue(this.sTable, "rowid");
        
            if(sRowId !== null && sRowId !== ""){
                this.fillByRowId(sRowId, this.oRefreshAction);
            }else{
                this.fill(this.oRefreshAction);
            }
        }
    }
},

ddHasRecord : function(){
    var sRowId = this.oServerDD.getFieldValue(this.sTable, "rowid");
        
    return (sRowId !== null && sRowId !== "");
},

// - - - - - - - - - - SPECIFIC FUNCTIONALLITY - - - - - - - - - - -

/* 
Displays the search modal dialog.
*/
displayJumpIntoList : function(){
    var eForm, eTable, eRow, eCell, eInput, iSelect, eSelect, iCol, iIndex, oDialog;
    
    //  Generate elements
    eForm = document.createElement("form");

    eTable = document.createElement("table");
    eTable.className = "EntryTable";
    eForm.appendChild(eTable);
    
    eRow = eTable.insertRow(0);
    eCell = eRow.insertCell(0);
    eCell.className = "Label";
    vdf.sys.dom.setElementText(eCell, vdf.lang.getTranslation("list", "search_value", "Search value"));
    
    eCell = eRow.insertCell(1);
    eCell.className = "Data";
    
    //  Search value input
    eInput = document.createElement("input");
    eInput.type = "text";
    eInput.maxLength = 50;
    eCell.appendChild(eInput);
    
    eRow = eTable.insertRow(1);
    eCell = eRow.insertCell(0);
    eCell.className = "Label";
    vdf.sys.dom.setElementText(eCell, vdf.lang.getTranslation("list", "search_column", "Column"));
    
    eCell = eRow.insertCell(1);
    eCell.className = "Data";
    
    //  Loop through the header fields and generate the select with field indexes
    iSelect = 0;
    eSelect = document.createElement("select");
    for(iCol = 0; iCol < this.aHeaderFields.length; iCol++){
        if(this.aHeaderFields[iCol].sTable === this.sTable){
            iIndex = this.aHeaderFields[iCol].getMetaProperty("iIndex");
                
            if(iIndex !== "" && iIndex !== null && parseInt(iIndex, 10) !== 0){
                eSelect.options[eSelect.options.length] = new Option((this.aHeaderFields[iCol].bIsLabel ? this.aHeaderFields[iCol].getLabel() : this.aHeaderFields[iCol].getValue()), this.aHeaderFields[iCol].sDataBinding);
                
                if(iSelect === 0 && iIndex === this.iIndex){
                    iSelect = eSelect.options.length - 1;
                }
            }
        }
    }
    eSelect.selectedIndex = iSelect;
    eCell.appendChild(eSelect);
    
    oDialog = new vdf.gui.ModalDialog();
    oDialog.sTitle = vdf.lang.getTranslation("list", "search_title", "Search");
    
    oDialog.addButton("search", vdf.lang.getTranslation("list", "search", "Search"), "btnSearch");
    oDialog.addButton("cancel", vdf.lang.getTranslation("list", "cancel", "Cancel"), "btnCancel");
    
    vdf.events.addDomListener("submit", eForm, this.onJumpIntoListFormSubmit, this);
    oDialog.onButtonClick.addListener(this.onJumpIntoListButtonClick, this);
    oDialog.onAfterClose.addListener(this.onJumpIntoListDialogClose, this);
    
    this.oJumpIntoList = { oDialog : oDialog, eFieldSelect : eSelect, eValueText : eInput, eForm : eForm };
    
    oDialog.displayDOM(eForm);
    vdf.sys.dom.focus(eInput);
},

/*
Performs the findByColumn based on the values the user entered in the search 
dialog then it closes it. 

@private
*/
doJumpIntoList : function(){
    if(this.oJumpIntoList){
        this.findByColumn(this.oJumpIntoList.eFieldSelect.value, this.oJumpIntoList.eValueText.value);
        this.oJumpIntoList.oDialog.close();
    }
},

/*
Handles the onSubmit event of the form in the search dialog. It calls 
doJumpIntoList and cancels the event (to cancel the real submit). The submit 
event is used so pressing the enter key also causes the find.

@param  oEvent  Event object.

@private
*/
onJumpIntoListFormSubmit : function(oEvent){
    this.doJumpIntoList();
    
    oEvent.stop();
},

/*
Handles the onButtonClick event of the search dialog. Depending on the name of 
the clicked button ("search" or "cancel") it calls doJumpIntoList or closes the
dialog.

@param  oEvent  Event object.

@private
*/
onJumpIntoListButtonClick : function(oEvent){
    if(this.oJumpIntoList){
        switch(oEvent.sButtonName){
            case "cancel":
                this.oJumpIntoList.oDialog.close();
                break;
            case "search":
                this.doJumpIntoList();
                break;
        }
    }
},

/*
Handles the onAfterClose of the search dialog and clears the handlers and the 
references.

@param  oEvent  Event object.

@private
*/
onJumpIntoListDialogClose : function(oEvent){
    if(this.oJumpIntoList){
        vdf.events.removeDomListener("submit",  this.oJumpIntoList.eForm, this.onJumpIntoListFormSubmit);
        this.oJumpIntoList.oDialog.onButtonClick.removeListener(this.onJumpIntoListButtonClick);
        this.oJumpIntoList.oDialog.onAfterClose.removeListener(this.onJumpIntoListDialogClose);
        
        this.focus();
        
        this.oJumpIntoList = null;
    }
},

/*
Switches to the index that belongs to the field.

@param  oField      Field control.
@param  bReversed   (optional) If true the index will be used in reverse order. If 
                not given it will use false if a new index is given, otherwise 
                it will reverse the index.
*/
switchToFieldIndex : function(oField, bReversed){
    var iIndex;
    
    if(oField.sTable === this.sTable){
        iIndex = oField.getMetaProperty("iIndex");
        
        if(iIndex !== null && iIndex !== ""){
            this.switchIndex(iIndex, bReversed);
        }
    }
},

/*
Switches to the given index.

@param  iIndex      The index number.
@param  bReversed   (optional) If true the index will be used in reverse order. 
            If not given it will use false if a new index is given, otherwise it 
            will reverse the index.
*/
switchIndex : function(iIndex, bReversed){
    if(typeof(bReversed) !== "boolean"){
        if(iIndex === this.iIndex){
            bReversed = !this.bReverseIndex;
        }else{
            bReversed = false;
        }
    }
    
    this.iIndex = iIndex;
    this.bReverseIndex = bReversed;
    
    this.displayHeaderCSS();
    this.fullRefresh();
},

/*
@private
*/
createEmptySnapshot : function(sBinding, sValue){
    var tRow, iField, oField, tField, iDD, sTable;
    
    if(typeof(sBinding) === "undefined"){
        sBinding = null;
    }
    
    //  Create an empty snapshot
    tRow = this.oServerDD.generateExtSnapshot(false);
    
    //  Add the lists field to the snapshot
    for(iField = 0; iField < this.aPrototypeFields.length; iField++){
        oField = this.aPrototypeFields[iField];
        if(oField.isBound()){
            
            //  Create field
            tField = new vdf.dataStructs.TAjaxField();
            tField.sBinding = oField.sDataBinding;
            tField.sType = oField.sDataBindingType;
            
            //  Set value if given
            if(tField.sBinding === sBinding){
                tField.sValue = sValue;
            }
            
            //  Add the field to the snapshot by searching the right DD
            if(oField.sDataBindingType === "D"){
                for(iDD = 0; iDD < tRow.aDDs.length; iDD++){
                    if(tRow.aDDs[iDD].sName === oField.sTable){
                        tRow.aDDs[iDD].aFields.push(tField);
                        tRow.aDDs[iDD].bLight = false;
                        break;
                    }
                }
            }else if(oField.sDataBindingType === "E"){
                sTable = oField.getVdfAttribute("sServerTable", null, true);
                if(sTable !== null){
                    sTable = sTable.toLowerCase();
                
                    for(iDD = 0; iDD < tRow.aDDs.length; iDD++){
                        if(tRow.aDDs[iDD].sName === sTable){
                            tRow.aDDs[iDD].bLight = false;
                            tRow.aDDs[iDD].aFields.push(tField);
                            break;
                        }
                    }
                }
            }
        }
    }
    
    return tRow;
},

/*
@private
*/
initResponseSnapshot : function(tRow){
    var iDD, iField;
    tRow.__oData = { };
    tRow.__sRowId = "";
    
    for(iDD = 0; iDD < tRow.aDDs.length; iDD++){
        for(iField = 0; iField < tRow.aDDs[iDD].aFields.length; iField++){
            tRow.__oData[tRow.aDDs[iDD].aFields[iField].sBinding] = tRow.aDDs[iDD].aFields[iField].sValue;
        }
       
        if(tRow.aDDs[iDD].sName === this.sTable){
            tRow.__sRowId = tRow.aDDs[iDD].tStatus.sValue;
        }
        
        tRow.__oData[tRow.aDDs[iDD].tStatus.sBinding] = tRow.aDDs[iDD].tStatus.sValue;
    }

    return tRow;
},

/*
@private
*/
determineSync : function(){
    return this.oServerDD.hasDependingDEO([ this ]);
},

/*
Determines the selected row number (first row is 0).

@return The selected row number (null if no row is selected).
*/
getSelectedRowNr : function(){
    var iRow;
    
    for(iRow = 0; iRow < this.aDisplay.length; iRow++){
        if(this.aDisplay[iRow] === this.tSelectedRow){
            return iRow;
        }
    }
    
    return null;
},

/*
Determines the rowid of the selected row.

@return String with the serialized rowid (null if no row is selected).
*/
getSelectedRowId : function(){
    return (this.tSelectedRow !== null ? this.tSelectedRow.__sRowId : null);
},

/*
Calculates stretchvalue for the given column. This is a value that has the 
maximum length for the column. Used to determine the fixed column width.

@param  oField  Reference to the field object.
@return Value that has the maximum length

@private
*/
getStretchValue : function(oField){
    var sValue, sType, iLength, iCurrent;
    
    iLength = parseInt(oField.getMetaProperty("iDataLength"), 10);
    sType = oField.getMetaProperty("sDataType");
    sValue = "";

    if(sType == "ascii" || sType == "text"){
        for(iCurrent = 0; iCurrent < iLength; iCurrent++){
            sValue += "W";
        }
    }else if(sType == "bcd"){
        for(iCurrent = 0; iCurrent < iLength; iCurrent++){
            sValue += "8";
        }
        iLength = parseInt(oField.getMetaProperty("iPrecision"), 10);
        if(iLength > 0){
            sValue += this.oForm.getMetaProperty("sDecimalSeparator");
        }
        for(iCurrent = 0; iCurrent < iLength; iCurrent++){
            sValue += "8";
        }
    }else if(sType == "date"){
        sValue = this.oForm.getMetaProperty("sDateFormat").toLowerCase().replace('m','8').replace('y', '8').replace('d', '8');
    }
    
    return sValue;
},

/*
Returns the focus to the list if it had the focus now or withing 200 
milliseconds.

@private
*/
returnFocus : function(){
    //vdf.log("returnFocus (eFocus:" + this.eFocus  + " bHasFocus:" + this.bHasFocus + " bLozingFocus:" + this.bLozingFocus + "");
    if(this.eFocus){
        if(this.bHasFocus || this.bLozingFocus){
            vdf.sys.dom.focus(this.eFocus);
            this.onFocus();
        }
    }
},

/*
Gives the focus to the list.
*/
focus : function(){
    //vdf.log("focus (eFocus:" + this.eFocus  + " bHasFocus:" + this.bHasFocus + " bLozingFocus:" + this.bLozingFocus + "");
    if(this.eFocus !== null){
        vdf.sys.dom.focus(this.eFocus);
        this.onFocus();
    }
},

/*
Moves up into the DOM structure until it finds an element .

@param  eElem   Reference to a DOM element to start the search.
@return Object containing a reference to the row and optionally a data binding of 
        a passed field.
@private
*/
findRowElement : function(eElem){
    var oResult = { eRow : null, sBinding : null };

    while(eElem && eElem !== document){
        if(oResult.sBinding === null && eElem.getAttribute("vdfDataBinding")){
            oResult.sBinding =  eElem.getAttribute("vdfDataBinding");
            oResult.sBinding = (typeof oResult.sBinding === "string" ? oResult.sBinding.replace("__", ".").toLowerCase() : null);
        }
        if(eElem.tagName === "TR" && vdf.getDOMAttribute(eElem, "sRowType")){
            oResult.eRow = eElem;
            return oResult;
        }
        
        eElem = eElem.parentNode;
    }

    return null;
},

/*
Selects the row which contains the given DOM element. If the DOM elements points 
to a field that field will also receive the focus.

@param  eElement    Reference to the DOM element.
*/
selectByRow : function(eElement){
    var oClicked = this.findRowElement(eElement);
    
    if(oClicked && vdf.getDOMAttribute(oClicked.eRow, "sRowType") === "display"){
        this.scrollToRow(oClicked.eRow, oClicked.sBinding);
    }
},

/*
Selects the row that belongs to the given element and deletes the record (after
the select action was finished).

@param  eElement    Reference to a DOM element inside the row to delete.
*/
deleteByRow : function(eElement){
    var oClicked = this.findRowElement(eElement);
   
    return this.scrollToRow(oClicked.eRow, null, function(){
        if(this.oForm.getDD(this.sTable).hasRecord()){
            this.oForm.getDD(this.sTable).doDelete();
        }
    }, this);
},

/*
@private
*/
onRowClick : function(oEvent){
    var oClicked = this.findRowElement(oEvent.getTarget());
    
    if(oClicked && vdf.getDOMAttribute(oClicked.eRow, "sRowType") === "display"){
        this.scrollToRow(oClicked.eRow, oClicked.sBinding);
    }
    
    this.focus();
},

/*
@private
*/
onMouseWheelScroll : function(oEvent){
    var iDelta = oEvent.getMouseWheelDelta();
    
    if(iDelta > 0){
        this.scrollUp();
        oEvent.stop();
    }else if(iDelta < 0){
        this.scrollDown();
        oEvent.stop();
    }
},

/*
@private
*/
onEnterAction : function(){
    if(!this.onEnter.fire(this, null)){
        return true;
    }else if(this.oForm !== null && !this.oForm.onEnter.fire(this, null)){
        return true;
    }
    
    return false;
},

/*
@private
*/
onKey : function(oEvent){
    var oPressedKey = {
        iKeyCode : oEvent.getKeyCode(),
        bCtrl : oEvent.getCtrlKey(),
        bShift : oEvent.getShiftKey(),
        bAlt : oEvent.getAltKey()
    };

    try{
        if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.scrollUp)){ 
            this.scrollUp();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.scrollDown)){ 
            this.scrollDown();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.scrollPageUp)){ 
            this.scrollPageUp();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.scrollPageDown)){ 
            this.scrollPageDown();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.scrollTop)){ 
            this.scrollTop();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.scrollBottom)){ 
            this.scrollBottom();
            oEvent.stop();
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.search)){
            if(this.bSearch){
                this.displayJumpIntoList();
                oEvent.stop();
            }
        }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.enter)){
            if(this.onEnterAction()){
                oEvent.stop();
            }
        }
    }catch (oError){
        vdf.errors.handle(oError);
    }
},

/*
Handles the focus event of the focus holder element. It changes the display to 
"focussed".

@param  oEvent  Event object.
    
@private
*/
onFocus : function(oEvent){
    //vdf.log("onfocus (eFocus:" + this.eFocus  + " bHasFocus:" + this.bHasFocus + " bLozingFocus:" + this.bLozingFocus + "");
    if(this.tFocusTimeout){
        clearTimeout(this.tFocusTimeout);
        this.tFocusTimeout = null;
    }

    this.bHasFocus = true;
    this.bLozingFocus = false;
    if(this.eElement.tBodies[0].className.match("focussed") === null){
        this.eElement.tBodies[0].className += " focussed";
    }
},

/*
Handles the blur event of the focus holder element. It changes the display to
"not focussed" after a little timeout. This timeout is because the focus 
sometimes flashes away and comes back.

@param  oEvent  Event object.
    
@private
*/
onBlur : function(oEvent){
    var oList = this;
    
    //vdf.log("blur (eFocus:" + this.eFocus  + " bHasFocus:" + this.bHasFocus + " bLozingFocus:" + this.bLozingFocus + "");
    if(this.bHasFocus){
        this.bLozingFocus = true;
        
        if(this.tFocusTimeout){
            clearTimeout(this.tFocusTimeout);
            this.tFocusTimeout = null;
        }
        
        this.tFocusTimeout = setTimeout(function(){
            if(oList.bLozingFocus){
                //vdf.log("blur timeout (eFocus:" + this.eFocus  + " bHasFocus:" + this.bHasFocus + " bLozingFocus:" + this.bLozingFocus + "");
                oList.bHasFocus = false;
                oList.bLozingFocus = false;
                if(oList.eElement){
                    oList.eElement.tBodies[0].className = oList.eElement.tBodies[0].className.replace("focussed", "");
                }
            }
        }, 200);
    }
},

/*
Handles the click event of the table and make sure we catch the focus with it.

@param  oEvent  Event object.
@private
*/
onTableClick : function(oEvent){
    this.focus();
},

/*
@private
*/
onIndexClick : function(oEvent){
    var eField = oEvent.getTarget();
    
    if(typeof(eField.oVdfControl) !== "undefined" && (eField.oVdfControl.bIsField || eField.oVdfControl.bIsLabel)){
        this.switchToFieldIndex(eField.oVdfControl, null);
    }
},

/*
@private
*/
onScroll : function(oEvent){
    switch(oEvent.iDirection){
        case vdf.gui.SCROLL_TOP:
            this.scrollTop();
            break;
        case vdf.gui.SCROLL_UP:
            this.scrollPageUp();
            break;
        case vdf.gui.SCROLL_STEP_UP:
            this.scrollUp();
            break;
        case vdf.gui.SCROLL_STEP_DOWN:
            this.scrollDown();
            break;
        case vdf.gui.SCROLL_DOWN:
            this.scrollPageDown();
            break;
        case vdf.gui.SCROLL_BOTTOM:
            this.scrollBottom();
            break;
    }
    
    var oList = this;
    
    setTimeout(function(){
        oList.returnFocus();
    }, 100);
},

/*
Determines the index that is used by the list. If no index is set yet it returns 
the index of the first index column. If no indexed columns are available it 
return index 1.

@return The index currently used.
*/
getIndex : function(){
    var iIndex = this.iIndex, iCol;
    
    if(iIndex === "" || iIndex === null || parseInt(iIndex, 10) === 0){
        for(iCol = 0; iCol < this.aHeaderFields.length; iCol++){
            iIndex = this.aHeaderFields[iCol].getMetaProperty("iIndex");
            
            if(iIndex !== "" && iIndex !== null && parseInt(iIndex, 10) !== 0){
                this.iIndex = iIndex;
                return iIndex;
            }
        }
        
        iIndex = "1";
    }
    
    return iIndex;
},

/*
@private
*/
lock : function(bExclusive, oAction){
    var oOffset;

    if(oAction !== this.oSelectAction){
        this.iLocked++;
    }
    
    if(this.bDisplayLoading){
        if(this.iLocked > 0){
            //  Generate loading div
            if(this.eLoadingDiv === null){
                this.eLoadingDiv = document.createElement("div");
                vdf.sys.dom.insertAfter(this.eLoadingDiv, this.eElement);
                //document.body.appendChild(this.eLoadingDiv);
                this.eLoadingDiv.className = this.sCssClass + "_loading";
                this.eLoadingDiv.style.zIndex = vdf.gui.reserveZIndex();
            }
            this.eLoadingDiv.style.display = "";

            oOffset = vdf.sys.gui.getAbsoluteOffset(this.eElement);
            this.eLoadingDiv.style.left = oOffset.left + "px";
            this.eLoadingDiv.style.top = oOffset.top + "px";
            this.eLoadingDiv.style.width = this.eElement.clientWidth + "px";
            this.eLoadingDiv.style.height = this.eElement.clientHeight + "px";
        }
    }
},

/*
@private
*/
unlock : function(bExclusive, oAction){
    if(oAction !== this.oSelectAction){
        this.iLocked--;

        if(this.bDisplayLoading && this.iLocked <= 0){
            this.eLoadingDiv.style.display = "none";
        }
    }
},

// - - - - - - - - - - CONTAINER FUNCTIONALITY - - - - - - - - - - 

/*
Called by the initializer if a nested control is found. Adds the control into 
the aChildren array so it will get bubbling event messages.

@param  oControl    Reference to the control object.
@private
*/
addChild : function(oControl){
    var eRow, bParent;
    
    if(!(oControl.bIsField)){
        if(oControl.bIsLabel){
            eRow = vdf.sys.dom.searchParentByVdfAttribute(oControl.eElement, "sRowType", null);
    
            if(eRow !== null){
                bParent = this.checkField(eRow, vdf.getDOMAttribute(eRow, "sRowType"), oControl);
            }
        }
        this.aChildren.push(oControl);
    }
},


// formInit is defined above
/*
Calls the formInit function on the children so they can do their initalization.
Usually used if the childs initialization requires meta data to be loaded or DD
structures to be initialized.

formInit : function(){
    var iChild;
    
    for(iChild = 0; iChild < this.aChildren.length; iChild++){
        if(typeof(this.aChildren[iChild].formInit) === "function"){
            this.aChildren[iChild].formInit();
        }
    }
},
*/



// recalcDisplay is defined above

/*
(Recursive) Called to determine if parent elements need to wait with messing 
with the DOM (especially hiding stuff) because the children are still 
initializing and need to do some pixel calculation. 

@return Amount of children that need waiting (including ourself so always 1+)
@private
*/
waitForCalcDisplay : function(){
    var iChild, iWait = 1;
    
    for(iChild = 0; iChild < this.aChildren.length; iChild++){
        if(typeof(this.aChildren[iChild].waitForCalcDisplay) === "function"){
            iWait =  iWait + this.aChildren[iChild].waitForCalcDisplay();
        }
    }
    
    return iWait;
}



});
