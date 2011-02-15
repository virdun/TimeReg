/*
Name:
    vdf.gui.Calendar
Type:
    Prototype
Revisions:
    2006/07/01  Created the initial version. (HW, DAE)
    2008/10/07  Complete rebuild into the 2.0 structure with focus, key control
    and inline version. (HW, DAE)
*/

/*
@css        Calendar.css
@require    vdf/lang.js
*/

/*
Constructor of the calendar which has the initializer interface.

@param  eElement        Element on which the properties should be loaded (if not 
            modified this is also the container element).
@param  oParentControl  (optional) Parent control
*/
vdf.gui.Calendar = function(eElement, oParentControl){
    var iDay, dToday = new Date();
    
    this.Control(eElement, oParentControl);
    
    /*
    Reference to the DOM element in which the calendar is generated.
    */
    this.eContainerElement = eElement;
    
    /*
    The CSS class that is set to the calendar DOM element.
    */
    this.sCssClass = this.getVdfAttribute("sCssClass", "calendar", false);
    
    /*
    Determines the first day of the week (0 = sunday, 1 = monday).
    */
    this.iStartAt = this.getVdfAttribute("iStartAt", 1, false);
    /*
    The date format used to get and set the date.
    */    
    this.sDateFormat = this.getVdfAttribute("sDateFormat", "mm/dd/yyyy", true);
    /*
    The date separator used within the date format.
    */
    this.sDateSeparator = this.getVdfAttribute("sDateSeparator", "/", true);
    /*
    The date mask that is used to display dates (like in the today bar).
    */
    this.sDateMask = this.getVdfAttribute("sDateMask", this.sDateFormat, true);
    
    /*
    If true days from the previous and next month are added to come 6 full rows 
    of days. This way the calendar component doesn't resize when switching 
    month.
    */
    this.bOutFill = this.getVdfAttribute("bOutFill", true, false);
    /*
    If true the today bar is shown.
    */
    this.bShowToday = this.getVdfAttribute("bShowToday", true, false);
    /*
    If true the week numbers are shown in the first column.
    */
    this.bShowWeekNumber = this.getVdfAttribute("bShowWeekNumber", true, false);
    /*
    If true the calendar is capable of having the focus. This also makes is 
    controllable using the keyboard.
    */
    this.bHoldFocus = this.getVdfAttribute("bHoldFocus", true, false);
    /*
    If true the calendar is displayed with a close button so it can be used as a 
    popup.
    */
    this.bExternal = this.getVdfAttribute("bExternal", false, false);
    /*
    The amount of years shown in the year menu.
    */
    this.iYearMenuLength = this.getVdfAttribute("iYearMenuLength", 9, false);
    /*
    Milliseconds to wait between the autoscroll.
    */
    this.iAutoScrollWait = parseInt(this.getVdfAttribute("iAutoScrollWait", 40, false), 10);
    /*
    Milliseconds to wait before the autoscroll starts.
    */
    this.iAutoScrollStart = parseInt(this.getVdfAttribute("iAutoScrollStart", 400, false), 10);
    /*
    Milliseconds to wait before the menu's hide if the mouse leaves them.
    */
    this.iMenuHideWait = parseInt(this.getVdfAttribute("iMenuHideWait", 1000, false), 10);
    
    /*
    The currently selected date.
    */
    this.iDate = this.getVdfAttribute("iDate", dToday.getDate(), false);
    /*
    The currently selected month.
    */
    this.iMonth = this.getVdfAttribute("iMonth", dToday.getMonth(), false);
    /*
    The currently selected year.
    */
    this.iYear = this.getVdfAttribute("iYear", dToday.getFullYear(), false);
   
    /*
    Fires if the current date changes.
    
    @prop   iYear   The (new) current year.
    @prop   iDate   The (new) current date.
    @prop   iMonth  The (new) current month.
    @prop   sValue  The (new) current date as a string.
    */
    this.onChange = new vdf.events.JSHandler();
    /*
    Fires if the user presses enter or clicks a date.
    
    @prop   iYear   The (new) current year.
    @prop   iDate   The (new) current date.
    @prop   iMonth  The (new) current month.
    @prop   sValue  The (new) current date as a string.
    */
    this.onEnter = new vdf.events.JSHandler();
    /*
    Fires if the user clicks the close button.
    
    @prop   iYear   The (new) current year.
    @prop   iDate   The (new) current date.
    @prop   iMonth  The (new) current month.
    @prop   sValue  The (new) current date as a string.
    */
    this.onClose = new vdf.events.JSHandler();

    //  @privates
    this.aMonthNames = [].concat(vdf.lang.getTranslation("calendar", "monthsLong"));
    this.aMonthNamesShort = [].concat(vdf.lang.getTranslation("calendar", "monthsShort"));
    this.aDaysShort = [].concat(vdf.lang.getTranslation("calendar", "daysShort"));
    this.aDaysLong = [].concat(vdf.lang.getTranslation("calendar", "daysLong"));
    this.oActionKeys = vdf.sys.data.deepClone(vdf.settings.calendarKeys);
    
    //  Scroll to the starting day
    for(iDay = 0; iDay < this.iStartAt; iDay++){
        this.aDaysShort.push(this.aDaysShort.shift());
        this.aDaysLong.push(this.aDaysLong.shift());
    }
    
    
    this.tHideMenu = null;
    this.tScrollTimeout = null;
    this.tUpdateTimeout = null;
    
    this.aDayCells = [];
    this.eMainTable = null;
    this.eYearDiv = null;
    this.eYearSpan = null;
    this.eTodaySpan = null;
    this.eMonthDiv = null;
    this.eMonthSpan = null;
    this.eMonthMenu = null;
    this.eYearMenu = null;
    this.eBtnYearUp = null;
    this.eBtnYearDown = null;
    this.eBtnPrev = null;
    this.eBtnNext = null;
    this.eBtnClose = null;
    this.eContentCell = null;    
    
    this.eBodyTable = null;
    this.eSelectedDay = null;
    this.eFocus = null;
    this.bHasFocus = false;
};
/*
This class contains the implementation of the calendar component that is used 
throughout the system. Although this class can be used directly the 
vdf.gui.PopupCalendar and the vdf.deo.DatePicker are easier to use. For examples 
of how to use the calendar it is advised to look at these components in the help 
file.
*/
vdf.definePrototype("vdf.gui.Calendar", "vdf.core.Control", {

/*
Initializes the calendar by constructing it and displaying the selected month.
*/
init : function(){
    this.construct();
    this.displayCalendar();
},

//  ENGINE

/*
Constructs the calendar by generating the elements. It doesn't generate the 
content.

@private
*/
construct : function(){
    var eTable, eRow, eCell, eBtnPrev, eBtnNext, eMonthSpan, eMonthDiv, eMonthMenu, eLi, eYearSpan, eYearDiv, eYearMenu, eNextSpan, ePrevSpan;
    var iMonth, eBtnYearUp, eBtnYearDown, eTodaySpan, eContentCell, eBtnClose = null, eFocus = null;
     

    eTable = document.createElement("table");
    eTable.cellPadding = 0;
    eTable.cellSpacing = 0;
    eTable.className = this.sCssClass;
    this.eContainerElement.appendChild(eTable);
    
    eRow = eTable.insertRow(0);
    eRow.className = (this.bExternal ? "titlebarextern" : "titlebarintern" );
    
    eCell = eRow.insertCell(0);
    eCell.className = "left";
    
    eCell = eRow.insertCell(1);
    
    //  Previous button
    eBtnPrev = document.createElement("div");
    eBtnPrev.className = "btnprevious";
    ePrevSpan = document.createElement("span");
    eBtnPrev.appendChild(ePrevSpan);
    eCell.appendChild(eBtnPrev);
    vdf.events.addDomListener("click", eBtnPrev, this.onPreviousClick, this);
    
    //  Next button
    eBtnNext = document.createElement("div");
    eBtnNext.className = "btnnext";
    eNextSpan = document.createElement("span");
    eBtnNext.appendChild(eNextSpan);

    eCell.appendChild(eBtnNext);
    vdf.events.addDomListener("click", eBtnNext, this.onNextClick, this);
    
    //  Month picker
    eMonthDiv = document.createElement("div");
    eMonthDiv.className = "btnmonth";
    eCell.appendChild(eMonthDiv);
    
    eMonthSpan = document.createElement("span");
    vdf.sys.dom.setElementText(eMonthSpan, this.aMonthNames[this.iMonth]);
    eMonthDiv.appendChild(eMonthSpan);
    vdf.events.addDomListener("click", eMonthDiv, this.onBtnMonthClick, this);
    
    eMonthMenu = document.createElement("ul");
    for(iMonth = 0; iMonth < 12; iMonth++){
        eLi = document.createElement("li");
        vdf.sys.dom.setElementText(eLi, this.aMonthNames[iMonth]);
        eLi.setAttribute("iMonth", iMonth);
        eMonthMenu.appendChild(eLi);
        vdf.events.addDomListener("click", eLi, this.onMonthClick, this);
    }
    vdf.events.addDomListener("mouseout", eMonthMenu, this.onMonthMenuOut, this);
    vdf.events.addDomListener("mouseover", eMonthMenu, this.onMonthMenuOver, this);
    vdf.events.addDomListener("click", eMonthMenu, this.onSubMenuClick, this);
    eMonthDiv.appendChild(eMonthMenu);
    
    //  Year picker
    eYearDiv = document.createElement("div");
    eYearDiv.className = "btnyear";
    eCell.appendChild(eYearDiv);
    
    eYearSpan = document.createElement("span");
    vdf.sys.dom.setElementText(eYearSpan, this.iYear);
    eYearDiv.appendChild(eYearSpan);
    vdf.events.addDomListener("click", eYearDiv, this.onBtnYearClick, this);
    
    eYearMenu = document.createElement("ul");
    eYearDiv.appendChild(eYearMenu);
    vdf.events.addDomListener("mouseout", eYearMenu, this.onYearMenuOut, this);
    vdf.events.addDomListener("mouseover", eYearMenu, this.onYearMenuOver, this);
    vdf.events.addDomListener("click", eYearMenu, this.onSubMenuClick, this);
    
    eBtnYearUp = document.createElement("li");
    eBtnYearUp.className = "btnyearup";
    eYearMenu.appendChild(eBtnYearUp);
    vdf.events.addDomListener("mousedown", eBtnYearUp, this.onYearBtnUpDown, this);
    vdf.events.addDomListener("mouseup", eBtnYearUp, this.onYearBtnUpStop, this);
    vdf.events.addDomListener("mouseout", eBtnYearUp, this.onYearBtnUpStop, this);
    
    eLi = this.constructYearMenuItem(2009);
    eYearMenu.appendChild(eLi);
    
    eBtnYearDown = document.createElement("li");
    eBtnYearDown.className = "btnyeardown";
    eYearMenu.appendChild(eBtnYearDown);
    vdf.events.addDomListener("mousedown", eBtnYearDown, this.onYearBtnDownDown, this);
    vdf.events.addDomListener("mouseup", eBtnYearDown, this.onYearBtnDownStop, this);
    vdf.events.addDomListener("mouseout", eBtnYearDown, this.onYearBtnDownStop, this);

    //  Close buttn
    if(this.bExternal){
        eBtnClose = document.createElement("div");
        eBtnClose.className = "btnclose";
        eCell.appendChild(eBtnClose);
        vdf.events.addDomListener("click", eBtnClose, this.onBtnClose, this);
    }
    
    eCell = eRow.insertCell(2);
    eCell.className = "right";
    
    
        
    eRow = eTable.insertRow(1);
    eContentCell = eRow.insertCell(0);
    eContentCell.colSpan = 3;
    eContentCell.className = (this.bExternal ? "contentextern" : "contentintern" );
    
    if(this.bShowToday){
        eRow = eTable.insertRow(2);
        eRow.className = (this.bExternal ? "todaybarextern" : "todaybarintern" );
        
        eCell = eRow.insertCell(0);
        eCell.className = "left";
        
        eCell = eRow.insertCell(1);
        vdf.sys.dom.setElementText(eCell, vdf.lang.getTranslation("calendar", "today") + " ");
        
        eTodaySpan = document.createElement("span");
        this.eTodaySpan = eTodaySpan;
        this.updateToday();
        eCell.appendChild(eTodaySpan);
        vdf.events.addDomListener("click", eTodaySpan, this.onTodayClick, this);
        vdf.events.addDomListener("mousedown", eTable, vdf.events.stop);
        
        eCell = eRow.insertCell(2);
        eCell.className = "right";
    }
    
    
    if(this.bHoldFocus){
        eFocus = document.createElement("a");
        eFocus.href = "javascript: vdf.sys.nothing();";
        eFocus.style.textDecoration = "none";
        eFocus.hideFocus = true;
        eFocus.innerHTML = "&nbsp;";
        eFocus.style.position = "absolute";
        eFocus.style.left = "-3000px";
        
        vdf.events.addDomKeyListener(eFocus, this.onKey, this);
        vdf.events.addDomListener("focus", eFocus, this.onFocus, this);
        vdf.events.addDomListener("blur", eFocus, this.onBlur, this);
        
        //  In safari we put the anchor arround the table because it won't get a focus when its not "visible"
        //  TODO: Find a better sollution with less side effects
        // if(vdf.sys.isSafari){
            // this.eContainerElement.insertBefore(eFocus, eTable);
            // eFocus.appendChild(eTable);
        // }else{
            this.eContainerElement.insertBefore(eFocus, eTable);
        // }
        
        this.eFocus = eFocus;
    }
    
    vdf.sys.gui.disableTextSelection(eTable);
    
    this.eMainTable = eTable;
    this.eYearDiv = eYearDiv;
    this.eYearSpan = eYearSpan;
    this.eTodaySpan = eTodaySpan;
    this.eMonthDiv = eMonthDiv;
    this.eMonthSpan = eMonthSpan;
    this.eMonthMenu = eMonthMenu;
    this.eYearMenu = eYearMenu;
    this.eBtnYearUp = eBtnYearUp;
    this.eBtnYearDown = eBtnYearDown;
    this.eBtnPrev = eBtnPrev;
    this.eBtnNext = eBtnNext;
    this.eBtnClose = eBtnClose;
    this.eContentCell = eContentCell;
},

/*
Constructs one year item for the year pulldown menu.

@param  iYear   The full year
@return Li element
@private
*/
constructYearMenuItem : function(iYear){
    var eLi = document.createElement("li");
    eLi.setAttribute("iYear", iYear);
    if(iYear === this.iYear){
        eLi.className = "current";
    }
    vdf.sys.dom.setElementText(eLi, "" + iYear);
    vdf.events.addDomListener("click", eLi, this.onYearClick, this);
    
    return eLi;
},

/*
Updates the today bar. Can be used if the sDateMask property is changed or the 
day is passed.
*/
updateToday : function(){
    var dToday = new Date();
    
    if(this.bShowToday){
        this.eTodaySpan.setAttribute("iDate", dToday.getDate());
        this.eTodaySpan.setAttribute("iMonth", dToday.getMonth());
        this.eTodaySpan.setAttribute("iYear", dToday.getFullYear());
        vdf.sys.dom.setElementText(this.eTodaySpan, vdf.sys.data.applyDateMask(dToday, this.sDateMask, this.sDateSeparator));
    }
},

/*
Generates the calendar for the current month. It does this using the date 
object to make sure that it knows the correct month lengths and so.

@private
*/
displayCalendar : function(){
    var dToday, dEnd, dDate, eTable, eRow, eCell, iDayPointer, iDay;
    var sCSS, iRows, iYear = this.iYear, iMonth = this.iMonth;

    vdf.sys.dom.setElementText(this.eYearSpan, iYear);
    vdf.sys.dom.setElementText(this.eMonthSpan, this.aMonthNames[iMonth]);
    
    //  Generate dates
    dToday = new Date();
    dDate = new Date(iYear, iMonth, 1);
    dEnd = new Date(iYear, (iMonth + 1), 1);

    //    Generate & insert table
    eTable = document.createElement("table");
    eTable.className = "bodytable";
    eTable.cellPadding = 0;
    eTable.cellSpacing = 0;
    
    //  Remove old table & listeners if needed
    if(this.eBodyTable !== null){
        this.eContentCell.removeChild(this.eBodyTable);
        
        for(iDay = 0; iDay < this.aDayCells.length; iDay++){
            vdf.events.removeDomListener("click", this.aDayCells[iDay], this.onDayClick);
        }
        this.aDayCells = [];
    }
    this.eContentCell.appendChild(eTable);
    this.eBodyTable = eTable;
        
    
    //  Header
    eRow = eTable.insertRow(0);
    eRow.className = "header";
    if(this.bShowWeekNumber){
        eCell = eRow.insertCell(0);
        vdf.sys.dom.setElementText(eCell, vdf.lang.getTranslation("calendar", "wk"));
        eCell.className = "weeknumber";
    }
    for(iDay = 0; iDay < 7; iDay++){
        eCell = eRow.insertCell(eRow.cells.length);
        vdf.sys.dom.setElementText(eCell, this.aDaysShort[iDay]);
        
        iDayPointer = (iDay + this.iStartAt > 6 ? iDay + this.iStartAt - 7 : iDay + this.iStartAt);
        if(iDayPointer === 0 || iDayPointer === 6){
            eCell.className = "weekend";
        }
    }
    
    //  Calculate start date
    iDayPointer = dDate.getDay() - this.iStartAt;
    if(iDayPointer < 0){
        iDayPointer = 7 + iDayPointer;
    }
    dDate.setDate(dDate.getDate() - iDayPointer);
    iDayPointer = 0;
    iRows = 0;
    
    //  Loop through the days
    while(dDate < dEnd || (iDayPointer < 7 && iDayPointer !== 0) || (this.bOutFill && iRows < 6)){
        //  Add weeknr & correct daypointere if needed
        if(iDayPointer === 0 || iDayPointer > 6){
            iRows++;
            eRow = eTable.insertRow(eTable.rows.length);
            if(this.bShowWeekNumber){
                eCell = eRow.insertCell(0);
                vdf.sys.dom.setElementText(eCell, this.getWeekNr(dDate));
                eCell.className = "weeknumber";
            }
            iDayPointer = 0;
        }
        
        //  Create cell
        eCell = eRow.insertCell(eRow.cells.length);
        eCell.setAttribute("iDate", dDate.getDate());
        eCell.setAttribute("iMonth", dDate.getMonth());
        eCell.setAttribute("iYear", dDate.getFullYear());
        vdf.sys.dom.setElementText(eCell, dDate.getDate());

        
        //  Determine styles
        sCSS = "day";
        if(dDate.getMonth() !== iMonth){
            sCSS += (sCSS !== "" ? " " : "") + "overflow";
        }
        if(dDate.getDay() === 0|| dDate.getDay() === 6){
            sCSS += (sCSS !== "" ? " " : "") + "weekend";
        }
        if(dDate.getDate() === this.iDate && dDate.getMonth() === this.iMonth && dDate.getFullYear() === this.iYear){
            this.eSelectedDay = eCell;
            sCSS += (sCSS !== "" ? " " : "") + "selected" + (this.bHasFocus ? " focussed" : "");
        }
        if(dDate.getDate() === dToday.getDate() && dDate.getMonth() === dToday.getMonth() && dDate.getFullYear() === dToday.getFullYear()){
            sCSS += (sCSS !== "" ? " " : "") + "today";
        }
        eCell.className = sCSS;
        
        this.aDayCells.push(eCell);
        
        //  Move to the next day
        dDate.setDate(dDate.getDate() + 1);
        iDayPointer++;
    }
    
    vdf.events.addDomListener("click", eTable, this.onDayClick, this);
    
    this.updateSelectedMonth();
},

/*
Updates the month menu so the current month gets the "current" CSS class.

@private
*/
updateSelectedMonth : function(){
    var iElem;
    
    for(iElem = 0; iElem < this.eMonthMenu.childNodes.length; iElem++){
        if(this.eMonthMenu.childNodes[iElem].getAttribute("iMonth") == this.iMonth){
            this.eMonthMenu.childNodes[iElem].className = "current";
        }else{
            this.eMonthMenu.childNodes[iElem].className = "";
        }
    }
},

/*
Scrolls the year menu one year up. It removes one year from the bottom of the 
year menu and adds a new year on top.

@private
*/
scrollYearUp : function(){
    var iYear;

    //  Remove first element
    vdf.events.removeDomListener("click", this.eYearMenu.childNodes[this.eYearMenu.childNodes.length - 2], this.onYearClick);
    this.eYearMenu.removeChild(this.eYearMenu.childNodes[this.eYearMenu.childNodes.length - 2]);
    
    //  Create year item
    iYear = this.eYearMenu.childNodes[1].getAttribute("iYear") - 1;
    this.eYearMenu.insertBefore(this.constructYearMenuItem(iYear), this.eYearMenu.childNodes[1]);
},

/*
Scrolls the year menu one year down. It removes on year from the top of the 
year menu and adds one year at the bottom.

@private
*/
scrollYearDown : function(){
    var iYear;

    //  Remove first element
    vdf.events.removeDomListener("click", this.eYearMenu.childNodes[1], this.onYearClick);
    this.eYearMenu.removeChild(this.eYearMenu.childNodes[1]);
    
    //  Create year item
    iYear = parseInt(this.eYearMenu.childNodes[this.eYearMenu.childNodes.length - 2].getAttribute("iYear"), 10) + 1;
    this.eYearMenu.insertBefore(this.constructYearMenuItem(iYear), this.eYearMenu.childNodes[this.eYearMenu.childNodes.length - 1]);
},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    if(this.eMainTable){
        vdf.events.clearDomListeners(this.eMainTable, true);
        
        this.eMainTable.parentNode.removeChild(this.eMainTable);
        if(this.bHoldFocus){
            vdf.events.clearDomListeners(this.eFocus);
            this.eFocus.parentNode.removeChild(this.eFocus);
        }
    }

    this.eMainTable = null;
    this.eYearSpan = null;
    this.eYearDiv = null;
    this.eTodaySpan = null;
    this.eMonthSpan = null;
    this.eMonthDiv = null;
    this.eMonthMenu = null;
    this.eYearMenu = null;
    this.eBtnYearUp = null;
    this.eBtnYearDown = null;
    this.eBtnPrev = null;
    this.eBtnNext = null;
    this.eBtnClose = null;
    this.eContentCell = null;    

    this.eBodyTable = null;
    this.eSelectedDay = null;
    this.eFocus = null;
    
    if(this.eElement.oVdfControl === this){
        this.eElement.oVdfControl = null;
    }
    this.eElement = null;
    this.eContainerElement = null;
},

/*
Constructs a date string for the given date using the sDateMask property.

@param  iYear   Year.
@param  iMonth  Month.
@param  iDate   Day of the month.
@return String with the given date.
@private
*/
constructDate : function(iYear, iMonth, iDate){
    var sResult = this.sDateMask;

    sResult = sResult.replace('DDD', '<n>');
    sResult = sResult.replace("DD","<e>");
    sResult = sResult.replace("D","<d>");
    sResult = sResult.replace("<e>", vdf.sys.math.padZero(iDate, 2));
    sResult = sResult.replace("<d>", iDate);
    sResult = sResult.replace("MMM","<o>");
    sResult = sResult.replace("MM","<n>");
    sResult = sResult.replace("M","<m>");
    sResult = sResult.replace("<m>", iMonth + 1);
    sResult = sResult.replace("<n>", vdf.sys.math.padZero(iMonth + 1, 2));
    sResult = sResult.replace("<o>", this.aMonthNamesShort[iMonth]);
    sResult = sResult.replace("YYYY", iYear);
    return sResult.replace("YY", vdf.sys.math.padZero(iYear % 100, 2));    
    
},

/*
Determines the week number of the given date object.

@param  dDate   Date object.
@return The week number.
@private
*/
getWeekNr : function(dDate){
    var iYear, iMonth, iDate, dNow, dFirstDay, dThen, iCompensation, iNumberOfWeek;
    
    iYear = dDate.getFullYear();
    iMonth = dDate.getMonth();
    iDate = dDate.getDate();
    dNow = Date.UTC(iYear,iMonth,iDate+1,0,0,0);
    
    dFirstDay = new Date();
    dFirstDay.setFullYear(iYear);
    dFirstDay.setMonth(0);
    dFirstDay.setDate(1);
    dThen = Date.UTC(iYear,0,1,0,0,0);
    iCompensation = dFirstDay.getDay();
    
    if (iCompensation > 3){
        iCompensation -= 4;
    }else{
        iCompensation += 3;
    }
    iNumberOfWeek =  Math.round((((dNow-dThen)/86400000)+iCompensation)/7);
    return iNumberOfWeek;
},

/*
Fires the onChange event.

@private
*/
fireChange : function(){
    this.onChange.fire(this, { iYear : this.iYear, iMonth : this.iMonth, iDate : this.iDate, sValue : this.getValue() });
},

/*
Fires the onEnter event.

@private
*/
fireEnter : function(){
    return !this.onEnter.fire(this, { iYear : this.iYear, iMonth : this.iMonth, iDate : this.iDate, sValue : this.getValue() });
},

/*
Fires the onClose event.

@private
*/
fireClose : function(){
    return !this.onClose.fire(this, { iYear : this.iYear, iMonth : this.iMonth, iDate : this.iDate, sValue : this.getValue() });
},


//  PUBLIC INTERFACE

/*
Takes the focus by giving it to the focus holder element (if available).
*/
takeFocus : function(){
    if(this.eFocus !== null){
        this.eFocus.focus();
    }
},

/*
Selects the given date (updates the display and fires the onChange event).

@param  dDate   Date object
*/
setDate : function(dDate){
    this.iDate = dDate.getDate();
    this.iMonth = dDate.getMonth();
    this.iYear = dDate.getFullYear();
    
    this.displayCalendar();
    this.fireChange();
},

/*
Returns the selected date.

@return Date object with the selected date.
*/
getDate : function(){
    var dDate = new Date(1, 1, 1, 1, 1, 1);
    
    dDate.setFullYear(this.iYear);
    dDate.setMonth(this.iMonth);
    dDate.setDate(this.iDate);
    
    return dDate;
},

/*
Returns the selected date.

@return String with the selected date (according to the sDateMask property).
*/
getValue : function(){
    return vdf.sys.data.parseDateToString(this.getDate(), this.sDateFormat);
},

/*
Parses the given date string using the sDateMask and updates the selected date 
and view.

@param  sValue  Date string according tot the date mask.
@return True if the value could be parsed and is set.
*/
setValue : function(sValue){
    var dDate = vdf.sys.data.parseStringToDate(sValue, this.sDateFormat, this.sDateSeparator);
    
    if(dDate === null){
        dDate = new Date();
    }
    
    this.setDate(dDate);
    
    return true;
},


//  MONTH MENU

/*
Handles the click event of the month button. It displays the month selection 
menu.

@param  oEvent  Event object.
@private
*/
onBtnMonthClick : function(oEvent){
    this.eMonthMenu.style.display = (vdf.sys.gui.getCurrentStyle(this.eMonthMenu).display === "none" ? "block" : "none");
    this.eYearMenu.style.display = "none";
    
    //  Clear hide timeout
    if(this.tHideMenu !== null){
        clearTimeout(this.tHideMenu);
        this.tHideMenu = null;
    }
    
    this.takeFocus();
    oEvent.stop();
},

/*
Handles the click event of a item in the month menu. It selects the clicked 
month and hides the menu.

@param  oEvent  Event object.
@private
*/
onMonthClick : function(oEvent){
    this.eMonthMenu.style.display = "none";
    
    this.iMonth = parseInt(oEvent.getTarget().getAttribute("iMonth"), 10);
    this.takeFocus();
    this.displayCalendar();
    this.fireChange();
    
    //  Clear hide timeout
    if(this.tHideMenu !== null){
        clearTimeout(this.tHideMenu);
        this.tHideMenu = null;
    }
    oEvent.stop();
},

/*
Handles the mouseout event of the month menu. It sets a timer that will hide 
the menu. The iMenuHideWait settings determines if and how long it takes to 
automatically hide the menu.

@param  oEvent  Event object.
@private
*/
onMonthMenuOut : function(oEvent){
    var fHideMonth, oCalendar = this;

    if(this.iMenuHideWait > 0){
        fHideMonth = function(){
            if(oCalendar.eMonthMenu){
                oCalendar.eMonthMenu.style.display = "none";
            }
            oCalendar.tHideMenu = null;
        };
        
        this.tHideMenu = setTimeout(fHideMonth, this.iMenuHideWait);
    }
},

/*
Handles the mouseover event of the month menu. It clears the autohide timer to
prevent the menu from hiding while the mouse points at it.

@param  oEvent  Event object.
@private
*/
onMonthMenuOver : function(oEvent){
    if(this.tHideMenu !== null){
        clearTimeout(this.tHideMenu);
        this.tHideMenu = null;
    }
},

//  YEAR MENU

/*
Handles the mouseout event of the year menu. It sets a timeout that hides the 
menu. The iMenuHideWait property determines if and how long it takes to hide 
the menu.

@param  oEvent  Event object.
@private
*/
onYearMenuOut : function(oEvent){
    var fHideMonth, oCalendar = this;

    if(this.iMenuHideWait > 0){
        fHideMonth = function(){
            if(oCalendar.eYearMenu){
                oCalendar.eYearMenu.style.display = "none";
            }
            oCalendar.tHideMenu = null;
        };
        
        this.tHideMenu = setTimeout(fHideMonth, this.iMenuHideWait);
    }
},

/*
Handles the mouseover event of the year menu. It clears the timeout to make 
sure that the menu isn't disappearing while the mouse points at it.

@param  oEvent  Event object.
@private
*/
onYearMenuOver : function(oEvent){
    //  Clear hide timeout
    if(this.tHideMenu !== null){
        clearTimeout(this.tHideMenu);
        this.tHideMenu = null;
    }
},

/*
Handles the onclick event of the year button. It displays the year menu. It 
also clear the hide timeout to make sure it doesn't hide before the user gets a
change to point at it.

@param  oEvent  Event object.
@private
*/
onBtnYearClick : function(oEvent){
    var iStart, iItem;

    this.eYearMenu.style.display = (vdf.sys.gui.getCurrentStyle(this.eYearMenu).display === "none" ? "block" : "none");
    this.eMonthMenu.style.display = "none";
    
    //  Clear hide timeout
    if(this.tHideMenu !== null){
        clearTimeout(this.tHideMenu);
        this.tHideMenu = null;
    }
    
    //  Clear year menu
    while(this.eYearMenu.childNodes.length > 2){
        vdf.events.removeDomListener("click", this.eYearMenu.childNodes[1], this.onYearClick);
        this.eYearMenu.removeChild(this.eYearMenu.childNodes[1]);
    }
    
    //  Fill year menu
    iStart = this.iYear - Math.round((this.iYearMenuLength - 1) / 2);
    for(iItem = 0; iItem < this.iYearMenuLength; iItem++){
        //  Create year item
        this.eYearMenu.insertBefore(this.constructYearMenuItem(iStart + iItem), this.eYearMenu.childNodes[this.eYearMenu.childNodes.length - 1]);
    }

    this.takeFocus();
    oEvent.stop();
},

/*
Handles the onclick event of a item in the year menu. It selects the year and 
hides the menu.

@param  oEvent  Event object.
@private
*/
onYearClick : function(oEvent){
    this.eYearMenu.style.display = "none";
    
    //  Clear hide timeout
    if(this.tHideMenu !== null){
        clearTimeout(this.tHideMenu);
        this.tHideMenu = null;
    }
    
    this.iYear = parseInt(oEvent.getTarget().getAttribute("iYear"), 10);
    this.takeFocus();
    this.displayCalendar();

    this.fireChange();
    
    oEvent.stop();
},

/*
Handles the mousedown event of the up button in the year menu. It scrolls up 
one step and it starts the timeout that will start the autoscrolling.

@param  oEvent  Event object.
@private
*/
onYearBtnUpDown : function(oEvent){
    var fScrollUp, oCalendar = this;

    fScrollUp = function(){
        oCalendar.scrollYearUp();
        oCalendar.tScrollTimeout = setTimeout(fScrollUp, oCalendar.iAutoScrollWait);
    };
    
    this.eBtnYearUp.className = "btnyearup_down";    
    this.scrollYearUp();
    this.tScrollTimeout = setTimeout(fScrollUp, oCalendar.iAutoScrollStart);
    
    oEvent.stop();
},

/*
Handles the mouseup event of the up button in the year menu. It scrolls up 
one step and it clears the autoscoll timeout.

@param  oEvent  Event object.
@private
*/
onYearBtnUpStop : function(oEvent){
    //  Stop scrolling
    if(this.tScrollTimeout !== null){
        clearTimeout(this.tScrollTimeout);
        this.tScrollTimeout = null;
    }
    
    //  Update display
    this.eBtnYearUp.className = "btnyearup";
    
    //oEvent.stop();
},

/*
Handles the mousedown event of the down button in the year menu. It scrolls 
down one step and it sets the timeout that will start the autoscrolling.

@param  oEvent  Event object.
@private
*/
onYearBtnDownDown : function(oEvent){
    var fScrollUp, oCalendar = this;

    fScrollUp = function(){
        oCalendar.scrollYearDown();
        oCalendar.tScrollTimeout = setTimeout(fScrollUp, oCalendar.iAutoScrollWait);
    };
    
    this.eBtnYearDown.className = "btnyeardown_down";    
    this.scrollYearDown();
    this.tScrollTimeout = setTimeout(fScrollUp, oCalendar.iAutoScrollStart);
    
    oEvent.stop();
},

/*
Handles the mouseup event of the down button in the year menu. It clears the 
timeout that performs the auto scrolling.

@param  oEvent  Event object.
@private
*/
onYearBtnDownStop : function(oEvent){
    //  Stop scrolling
    if(this.tScrollTimeout !== null){
        clearTimeout(this.tScrollTimeout);
        this.tScrollTimeout = null;
    }
    
    //  Update display
    this.eBtnYearDown.className = "btnyeardown";
    
    //oEvent.stop();
},

//  OTHER EVENTS

/*
Handles the onclick event of the next button. It moves to the next month.

@param  oEvent  Event object.
@private
*/
onNextClick : function(oEvent){
    this.iMonth++;
    if(this.iMonth >= 12){
        this.iYear++;
        this.iMonth = 0;
    }

    this.takeFocus();
    this.displayCalendar();
    this.fireChange();
    
    oEvent.stop();
},

/*
Handles the click event of the previouse button and moves to the previous month.

@param  oEvent  Event object.
@private
*/
onPreviousClick : function(oEvent){
    this.iMonth--;
    if(this.iMonth < 0){
        this.iYear--;
        this.iMonth = 11;
    }
    
    this.takeFocus();
    this.displayCalendar();
    this.fireChange();
    
    oEvent.stop();
},

/*
Handles the click event of one of the displayed days in the calendar. It 
selects the day, repaints the calendar and fires the onChange and onEnter 
events.

@param  oEvent  Event object.
@private
*/
onDayClick : function(oEvent){
    var eCell = oEvent.getTarget();
    
    if(eCell.getAttribute("iDate") !==null){
        this.iYear = parseInt(eCell.getAttribute("iYear"), 10);
        this.iMonth = parseInt(eCell.getAttribute("iMonth"), 10);
        this.iDate = parseInt(eCell.getAttribute("iDate"), 10);
       
        this.takeFocus();
        this.displayCalendar();
        
        this.fireChange();
        this.fireEnter();
        
        oEvent.stop();
    }
},

/*
Handles the click event of the "today" date. It selects the current date.

@param  oEvent  Event object.
@private
*/
onTodayClick : function(oEvent){
    var eAnchor = oEvent.getTarget();
    
    this.iYear = parseInt(eAnchor.getAttribute("iYear"), 10);
    this.iMonth = parseInt(eAnchor.getAttribute("iMonth"), 10);
    this.iDate = parseInt(eAnchor.getAttribute("iDate"), 10);
    
    this.takeFocus();
    this.displayCalendar();
    
    this.fireChange();
    this.fireEnter();
    
    oEvent.stop();
},

/*
Handles the keypress event of focus holder element. If the pressed key matches 
one of the keys that are set it performs the action.

@param  oEvent  Event object.
@private
*/
onKey : function(oEvent){
    var dDate, oPressedKey;
    
    //  Generate key object to compare
    oPressedKey = {
        iKeyCode : oEvent.getKeyCode(),
        bCtrl : oEvent.getCtrlKey(),
        bShift : oEvent.getShiftKey(),
        bAlt : oEvent.getAltKey()
    };
    
    if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.dayUp)){ // Up (decrement with 7 days)
        dDate = this.getDate();
        dDate.setDate(dDate.getDate() - 7);
        this.setDate(dDate);
        
        oEvent.stop();
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.dayDown)){ //  Down (increment with 7 days)
        dDate = this.getDate();
        dDate.setDate(dDate.getDate() + 7);
        this.setDate(dDate);
        
        oEvent.stop();
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.dayLeft)){ // Left (decrement with one day)
        dDate = this.getDate();
        dDate.setDate(dDate.getDate() - 1);
        this.setDate(dDate);
        
        oEvent.stop();
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.dayRight)){ // Right (increment with one day)
        dDate = this.getDate();
        dDate.setDate(dDate.getDate() + 1);
        this.setDate(dDate);
        
        oEvent.stop();
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.monthUp)){ //  Month up
        dDate = this.getDate();
        dDate.setMonth(dDate.getMonth() + 1);
        this.setDate(dDate);
        
        oEvent.stop();
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.monthDown)){ //    Month down
        dDate = this.getDate();
        dDate.setMonth(dDate.getMonth() - 1);
        this.setDate(dDate);
        
        oEvent.stop();
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.yearUp)){ //   Year up
        dDate = this.getDate();
        dDate.setFullYear(dDate.getFullYear() + 1);
        this.setDate(dDate);
        
        oEvent.stop();
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.yearDown)){ // Year down
        dDate = this.getDate();
        dDate.setFullYear(dDate.getFullYear() - 1);
        this.setDate(dDate);
        
        oEvent.stop();
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.enter)){ //    Enter
        if(this.fireEnter()){
            oEvent.stop();
        }
    }else if(vdf.sys.ref.matchByValues(oPressedKey, this.oActionKeys.close)){ //    Close
        if(this.fireClose()){
            oEvent.stop();
        }
    }
},

/*
Handles the focus event of the focus holder element. It changes the display to 
"focussed".

@param  oEvent  Event object.
@private
*/
onFocus : function(oEvent){
    if(this.eSelectedDay !== null){
        this.bHasFocus = true;
        this.bLozingFocus = false;
        this.eSelectedDay.className += " focussed";
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
    var oCalendar = this;
    
    if(this.eSelectedDay !== null){
        this.bLozingFocus = true;

        setTimeout(function(){
            if(oCalendar.bLozingFocus){
                oCalendar.bHasFocus = false;
                if(oCalendar.eSelectedDay !== null){
                    oCalendar.eSelectedDay.className = oCalendar.eSelectedDay.className.replace(" focussed", "");
                }
            }
        }, 200);
    }
},

/*
Handles the click event of the close button. It fires the onClose event.

@param  oEvent  Event object.
@private
*/
onBtnClose : function(oEvent){
    if(this.fireClose()){
        oEvent.stop();
    }
},

/*
Stops the click event so it doesn't bubble to the button.

@param oEvent   Event object.
@private
*/
onSubMenuClick : function(oEvent){
    oEvent.stop();
}

});

