/*
Name:
    vdf.sys
Type:
    Library(object)

Revisions:
    2005/09/01  Created the initial version with a basic set of browser
    independent functions. (HW, DAE)

    2006/11/05  Restructured into dom, events, data, gui categories. (HW, DAE)

    2007/12/14  Converted into 2.0 structure. It is now called vdf.sys and the
    events functionallity is moved to a separate vdf.events version. (HW, DAE)

*/

/*
An important part of the Visual DataFlex AJAX Library is the layer that is build
between the browser and the engine. Its main goal is to straighten out the
differences between the supported browsers. It contains a lot of functionality
that cover the various parts of client side web development.
*/

vdf.sys = {

/*
If true the browser is supposed to be safari or part of the safari family.
*/
isSafari : false,
/*
True if the browser seems to be Google Chrome.
*/
isChrome : false,
/*
True if the browser seems to be Opera.
*/
isOpera : false,
/*
If true the browser is supposed to be part of the mozilla family (usually
FireFox).
*/
isMoz : false,
/*
True if the browser seems to be Internet Explorer. Also true if we where not
able to detect the browser type properly (if browser unknown threat it as IE
policy).
*/
isIE : false,
/*
True if the WebKit layout engine is used (Safari & Chrome).
*/
isWebkit : false,

/*
Indicates the browser version.
*/
iVersion : 0,

/*
The reflection library contains functionality related to prototypes, objects
and functions. Some of this functionality is closely related to the Visual DataFlex
AJAX Library and might not work on objects from outside the library.
*/
ref : {

/*
Determines the object type using "typeof" and for objects it tries to determine
the constructorname.

@param  oObject     Reference to the object of which the type should be determined.
@return The type of the object ("object", "function", "array", "undefined", ..).
*/
getType : function(oObject){
    var sType = typeof(oObject);

    if(sType === "object"){
        if(oObject === null || typeof(oObject) === "undefined"){
            sType = "null";
        }else if(oObject.constructor === Array){
            sType = "array";
        }else if(oObject.constructor === Date){
            sType = "date";
        }else{
            sType = this.getConstructorName(oObject);
        }
    }

    return sType;
},

/*
It tries to determine the name of the constructor of the object. If the
constructor is not found "object" is returned.

@param  oObject     Reference to the object of which we want to determine the
        constructor name.
@return String with the constructorname ("object" if not found).
*/
getConstructorName : function(oObject){
    var sName = this.getMethodName(oObject.constructor);

    if(sName === ""){
        sName = "object";
    }

    return sName;
},

/*
Determines the name of the given function by converting the function its string
definition.

@param  fFunction   Reference to the function.
@return Name of the function ("unknownType" if not able to determine).
*/
getMethodName : function(fFunction){
    var sString;

    try {
        sString = fFunction.toString();
        return sString.substring(sString.indexOf("function") + 8, sString.indexOf('(')).replace(/ /g,'');
    }catch(e){
        return "";
    }
},

/*
Matches two objects by their value. Note that it matches property objects by
reference and not by value!

@param  oObj1   Object.
@param  oObj2   Object to match against.
@return True if the objects are the same.
*/
matchByValues : function(oObj1, oObj2){
    var sProp;

    if(oObj1 !== oObj2){
        //  Check if no null values given
        if(oObj1 === null || typeof(oObj1) === "undefined" || oObj2 === null || typeof(oObj2) === "undefined"){
            return false;
        }

        //  Check if properties match
        for(sProp in oObj1){
            if(typeof(oObj2[sProp]) === "undefined" || oObj1[sProp] !== oObj2[sProp]){
                return false;
            }
        }

        for(sProp in oObj2){
            if(typeof(oObj1[sProp]) === "undefined" || oObj1[sProp] !== oObj2[sProp]){
                return false;
            }
        }
    }

    return true;

},

/*
Determines the global scope object. Within browsers this usually is the window
object.

@return Reference to the global scope object.
*/
getGlobalObject : function(){
    return (function(){
        return this;
    }).call(null);
},

/*
Finds the (nested) object property by a path string (like "vdf.core.List")
without using an eval. Always starts at the global object.

@param  sPath   Path to the property (like "vdf.core.List").
@return The property (null if not found).
*/
getNestedObjProperty : function(sPath){
    var aParts, oProp, iPart;

    //  Split into parts
    aParts = sPath.split(".");

    //  We start our search at the global object
    oProp = vdf.sys.ref.getGlobalObject();

    //  Loop through parts and object properties
    for(iPart = 0; iPart < aParts.length; iPart++){
        if(typeof oProp === "object" && oProp !== null){
            oProp = oProp[aParts[iPart]];
        }else{
            return null;
        }
    }

    return oProp;
}

},

/*
The math library contains functionality to perform calculations.
*/
math : {
/*
Fills out the given number with zero's until it has the required amount of digits.

@param  iNum    Number to convert.
@param  iDigits Number of digits.
@return String with the number outfilled with zero's.
*/
padZero : function(iNum, iDigits)
{
    var sResult = "" + iNum;

    while(sResult.length < iDigits){
        sResult = "0" + sResult;
    }

    return sResult;
},

/*
Removes duplicate values from the array.

@param  aSet    Array with values.
*/
unique : function(aSet){
    var i, x, n, y, aResult = [];
    o:for(i = 0, n = aSet.length; i < n; i++){
        for(x = 0, y = aResult.length; x < y; x++){
            if(aResult[x] === aSet[i]){
                continue o;
            }
        }
        aResult[aResult.length] = aSet[i];
    }
    return aResult;
}

},

/*
Functionality for data conversions and other data related functions.
*/
data : {

/*
Applies the date mask on the date. It parses it into an Date object first then
it applies the mask.

@param  dValue          The date object.
@param  sDateSeparator  Separator character that will be used in the date mask.
@return String with the masked data.
*/
applyDateMask : function(dValue, sMask, sDateSeparator){
    return sMask.replace(/(m{1,4}|d{1,4}|yyyy|yy|\/)/gi, function (sValue, iPos){

        switch(sValue.toLowerCase()){
            case "m":
                return dValue.getMonth() + 1;
            case "mm":
                return vdf.sys.math.padZero(dValue.getMonth() + 1, 2);
            case "mmm":
                return vdf.sys.string.copyCase(vdf.lang.translations.calendar.monthsShort[dValue.getMonth()], sValue);
            case "mmmm":
                return vdf.sys.string.copyCase(vdf.lang.translations.calendar.monthsLong[dValue.getMonth()], sValue);

            case "d":
                return dValue.getDate();
            case "dd":
                return vdf.sys.math.padZero(dValue.getDate(), 2);
            case "ddd":
                return vdf.sys.string.copyCase(vdf.lang.translations.calendar.daysShort[dValue.getDay()], sValue);
            case "dddd":
                return vdf.sys.string.copyCase(vdf.lang.translations.calendar.daysLong[dValue.getDay()], sValue);

            case "yy":
                return vdf.sys.math.padZero(dValue.getFullYear() % 100, 2);
            case "yyyy":
                return vdf.sys.math.padZero(dValue.getFullYear(), 4);

            case "/":
                return sDateSeparator;
        }

        return sValue;
    });
},

/*
Parses a date string into a Date object using the given format.

@param  sValue          String date (that confirms the format).
@param  sFormat         Date format (basic date format).
@param  sDateSeparator  Separator character used in the date format.
@return Date object representing the date (returns 1970/01/01 if no value given).
*/
parseStringToDate : function(sValue, sFormat, sDateSeparator){
    var dResult, dToday, iChar, aMask, aData, sChar, iPart, iDate, iMonth, iYear;

    sFormat = sFormat.toLowerCase();

    if(vdf.sys.string.trim(sValue) === ""){
        return null;
    }

    //  Determine separator if its not given
    if(typeof sDateSeparator !== "string"){
        for(iChar = 0; iChar < sFormat.length; iChar++){
            sChar = sFormat.charAt(iChar).toLowerCase();
            if(sChar !== "m" && sChar !== "d" && sChar !== "y"){
                sDateSeparator = sChar;
                break;
            }
        }
    }

    //  Split the date
    aMask = sFormat.toLowerCase().split(sDateSeparator);
    aData = sValue.toLowerCase().split(sDateSeparator);

    //  Loop throught the parts finding the year, date and month
    for(iPart = 0; iPart < aData.length && iPart < aMask.length; iPart++){
        switch(aMask[iPart]){
            case "d":
            case "dd":
                iDate = parseInt(aData[iPart], 10);
                break;
            case "m":
            case "mm":
                iMonth = parseInt(aData[iPart], 10);
                break;
            case "yy":
                iYear = parseInt(aData[iPart], 10);
                iYear = (iYear > 50 ? iYear + 1900 : iYear + 2000);
                break;
            case "yyyy":
                iYear = parseInt(aData[iPart], 10);
                break;
        }
    }

    //  Set the determined values to the new data object, decrement if to high
    dResult = new Date(1, 1, 1, 1, 1, 1);
    dToday = new Date();

    //  Year
    if(iYear){
        if(iYear > 9999){
            iYear = 9999;
        }
        if(iYear < -9999){
            iYear = 0;
        }
        dResult.setFullYear((iYear > 9999 ? 9999 : (iYear < 0 ? 0 : iYear)));
    }else{
        dResult.setFullYear(dToday.getFullYear());
    }

    //  Month
    if(iMonth){
        dResult.setMonth((iMonth < 0 ? 0 : (iMonth > 12 ? 11 : iMonth - 1)));
    }else{
        dResult.setMonth(dToday.getMonth());
    }

    //  Date
    if(iDate){
        iDate = (iDate < 1 ? 1 : (iDate > 31 ? 31 : iDate));
    }else{
        iDate = dToday.getDate();
    }

    //  Make sure that it didn't shifted the month (retry and reduce the day until it doesn't);
    iMonth = dResult.getMonth();
    iYear = dResult.getFullYear();
    dResult.setDate(iDate);
    while(dResult.getMonth() !== iMonth){
        dResult.setFullYear(iYear);
        dResult.setMonth(iMonth);
        iDate--;
        dResult.setDate(iDate);
    }





    return dResult;
},

/*
Generates a string for the given date using the given format.

@param  dValue      Data object.
@param  sFormat     Date format (basic date format).
@return String representing the given date.
*/
parseDateToString : function(dValue, sFormat){
    return this.applyDateMask(dValue, sFormat, "/");
},

/*
Deep clones JSON style objects by calling itself recursively.

@param  oObj    Object to clone.
@return A clone of the object.
*/
deepClone : function(oObj){
    var oResult = null, sProp, i;


    if(typeof(oObj) === "object"){
        if(oObj.constructor === Array){
            oResult = [];

            for(i = 0; i < oObj.length; i++){
                oResult.push(this.deepClone(oObj[i]));
            }
        }else{
            oResult = { };

            for(sProp in oObj){
                //  TODO: Think about adding hasOwnProperty check here
                oResult[sProp] = this.deepClone(oObj[sProp]);
            }
        }
    }else{
        oResult = oObj;
    }

    return oResult;
},

/*
Loops through the array and removes all items that match the given object.

@param  aArray  Reference to the array.
@param  oObj    Object reference or value to remove.
*/
removeFromArray : function(aArray, oObj){
    var i;
    
    for(i = 0; i < aArray.length; i++){
        if(aArray[i] === oObj){
            aArray.splice(i, 1);
        }
    }
}

},

/*
Functionality related to parsing XML and to ease the use of the XML DOM.
*/
xml : {

/*
Parses a SOAP date / time string (YYYY-MM-DDTHH:MM:SS.mmm) into a JavaScript
date object.

Example string: "2008-01-07T13:02:23.203".

@param  sDate   String in the SOAP date / time format.
@return JavaScript Date object with the given value.
*/
parseSoapDate : function(sDate){
    var dDate, aParts;

    dDate = new Date();
    aParts = sDate.split(/[\-T:.]/);

    dDate.setFullYear(aParts[0]);
    dDate.setMonth(aParts[1]);
    dDate.setDate(aParts[2]);
    if(aParts.length > 3){
        dDate.setHours(aParts[3]);
        dDate.setMinutes(aParts[4]);
        dDate.setSeconds(aParts[5]);
        dDate.setMilliseconds(aParts[6]);
    }else{
        dDate.setHours(0);
        dDate.setMinutes(0);
        dDate.setSeconds(0);
        dDate.setMilliseconds(0);
    }

    return dDate;
},

/*
Returns the name of a XML node without the prefix.

@param  oNode   XML node.
@return Name of node without prefix.
*/
getNodeName : function(oNode){
    //return oNode.nodeName.substr(oNode.nodeName.indexOf(":") + 1);
    return oNode.nodeName.replace(/.*:/, "");
},

/*
Parses the XML in the string into a new XML document. For microsoft it uses the
ActiveX object.

@param  sString String containing the XML.
@return Reference to the XML document.
*/
parseXmlString : function(sString){
    var oDoc = null, oParser;

    if(window.DOMParser){
        // code for Mozilla, Firefox, Opera, etc.
        oParser = new DOMParser();
        oDoc = oParser.parseFromString(sString, "text/xml");
    }else if(window.ActiveXObject){
        // code for IE
        oDoc=new ActiveXObject("Microsoft.XMLDOM");
        oDoc.async="false";
        oDoc.loadXML(sString);
    }else{
        throw new vdf.errors.Error(0, "Browser doesn't support XML parsing!");
    }

    return oDoc;
},

/*
Creates the xml request object used for sending xml requests to the server. On
IE >=6 the activex object should be used, other browsers have the native
version of the object. On IE it first tries to create the version 2 of the
element, if this fails the older version will be used.

@return XMLHttpRequest object
*/
getXMLRequestObject : function(){
    var oResult = null;

    if(window.XMLHttpRequest){
        //  code for Mozilla, Opera, WebKit, IE7+
        oResult = new XMLHttpRequest();
    }else if(window.ActiveXObject){
        //  code for IE6-
        try {
            oResult = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                oResult = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                throw new vdf.errors.Error(0, "Browser doesn't support the XMLHttpRequest!");
            }
        }
    }

    return oResult;
},

/*
Finds child elements with the given name. For a strange reason the
nodenames get the 'm:' addition. The internet explorer needs this addition
to find the node by name while firefox won't find it with the addition.

@param  oNode       XML Element to search in.
@param  sNodeName   Name of the searched node.
@param  sPrefix     (default: "m")
@return Array with the found nodes.
*/
find : function(oNode, sNodeName, sPrefix){
    var aResult;

    if(typeof(sPrefix) === "undefined"){
        sPrefix = "m";
    }

    //  FF also requires prefix since version 3 so the version check is removed, this makes firefox 2 and older perform finds always twice, so upgrade!
    aResult = oNode.getElementsByTagName(sPrefix + ":" + sNodeName);

    if(aResult === null || typeof(aResult) === "undefined" || aResult.length === 0){
        aResult = oNode.getElementsByTagName(sNodeName);
    }

    return aResult;
},

/*
Returns the content of the searched node.

@param  oNode       Node to search.
@param  sNodeName   Name of node to gind.
@return Content of the node ("" if not found).
*/
findContent : function(oNode, sNodeName, sPrefix){
    var oXml, result = "";

    oXml = this.find(oNode, sNodeName, sPrefix)[0];

    if(oXml !== null && typeof(oXml) !== "undefined"){
        for (var iCount=0; iCount<oXml.childNodes.length; iCount++){
            result += oXml.childNodes[iCount].nodeValue;
        }
    }

    if(typeof(result) === "undefined"){
        result = "";
    }

    return result;
}

},

/*
Functions that ease the access of cookies.
*/
cookie : {

/*
Places a cookie.

@param  sVar	Name of cookie variable.
@param  sValue	Value of cookie variable.
*/
set : function(sVar, sValue){
    var date = new Date();
    
    date.setDate(date.getDate()+2);

    document.cookie = sVar + "=" + sValue + "; expires=" + date.toGMTString();	
},

/*
Removes cookie by expiring.

@param  sVar	Name of cookie variable.
*/
del : function(sVar){
    var date = new Date();
    
    date.setTime(date.getTime()-1);

    document.cookie = sVar + "=; expires=" + date.toGMTString();		
},

/*
Fetches cookie value.

@param  sVar		Name of cookie variable.
@param  sDefault	Variable to return when not found.
@return Value of the cookie variable (sDefault if not found).
*/
get : function(sVar, sDefault){
    var sResult = null, aVars, aVar, iVar;
    
    if(document.cookie){
        aVars = document.cookie.split(';');
        
        for(iVar = 0; iVar < aVars.length && sResult === null; iVar++){
            aVar = aVars[iVar].split('=');
            
            if(aVar.length > 1){
                if(vdf.sys.string.trim(aVar[0]) === vdf.sys.string.trim(sVar)){
                    sResult = aVar[1];	
                }
            }
        }
    }
    
    if(sResult !== null){
        return sResult;
    }else{
        return sDefault;
    }
}


},

/*
Specific functionallity for manipulating the Document Object Model (DOM).
*/
dom : {

/*
List of elements that are tababble.

@private
*/
aTabbableTags : ["A","BUTTON","TEXTAREA","INPUT","IFRAME", "SELECT"],
/*
@private
*/
oTabbableTags : {"A" : true,"BUTTON" : true,"TEXTAREA" : true,"INPUT" : true,"IFRAME" : true, "SELECT" : true},

/*
Sets the text / content of the element.

@param  eElement    DOM Element.
@param  sValue      The new text.
*/
setElementText : function(eElement, sValue){
    if(sValue === " "){
        eElement.innerHTML = "&nbsp;";
    }else{
        if(typeof(eElement.innerText) !== "undefined"){
            eElement.innerText = sValue;
        }else{
            eElement.textContent = sValue;
        }
    }
},

/*
Gets the text / content of the element.

@param  eElement    DOM Element.
@return The content text.
*/
getElementText : function(eElement){
     if(typeof(eElement.innerText) !== "undefined"){
        return eElement.innerText;
    }else{
        return eElement.textContent;
    }
},

/*
This is a browser independent method to fetch the outerHTML of a DOM element. If the browser doesn’t 
support the outerHTML property the method will generate a temporary element and use the innerHTML 
attribute.

@param  eElem   Reference to a DOM element.
@return The outerHTML of the element (null if not available).
*/
getOuterHTML : function(eElem){
	var eParent, eFake, sHTML;
	
	if(eElem.outerHTML){
		return eElem.outerHTML;
	}else if(eElem.parentNode){
		eParent = eElem.parentNode;
		eFake = document.createElement(eParent.tagName);

		eFake.appendChild(eElem);
		sHTML = eFake.innerHTML;
		eParent.appendChild(eElem);

		return sHTML;
	}else{
		return null;
	}
},

/*
Makes an exact clone of the given element and its sub element. It uses the 
cloneNode method of the DOM but goes through the structure to "repair" the 
flaws of the cloneNode method.

@param  eOrig   The element to clone.
@return Clone of the element (and its children).
*/
deepClone : function(eOrig){
    var eClone, fChecker;

    eClone = eOrig.cloneNode(true);
    
    fChecker = function(eClone, eOrig){
        var iChild;
        
        if(eClone.tagName === "SELECT" || eClone.tagName === "TEXTAREA"){
            eClone.value = eOrig.value;
        }
        
        for(iChild = 0; iChild < eClone.childNodes.length; iChild++){
            if(eClone.childNodes[iChild].nodeType !== 3 && eClone.childNodes[iChild].nodeType !== 8){
                fChecker(eClone.childNodes[iChild], eOrig.childNodes[iChild]);
            }
        }
    };
    
    fChecker(eClone, eOrig);
    
    return eClone;
},

/*
Replaces the node with the new one.

@param  eOrig   DOM Node to be replaced.
@param  eNew    New DOM node.
*/
swapNodes : function(eOrig, eNew){
    if (eOrig){
        if (eNew){
            if(typeof(eOrig.replaceNode) !== "undefined"){
                eOrig.replaceNode(eNew);
            }else{
                eOrig.parentNode.replaceChild(eNew, eOrig);
            }
        }
    }
},

/*
Inserts the new element into the DOM after the given element.

@param eNewElement  The new element to insert.
@param eElement     The element to insert after.
*/
insertAfter : function(eNewElement, eElement){
    if(eElement.nextSibling !== null){
        eElement.parentNode.insertBefore(eNewElement, eElement.nextSibling);
    }else{
        eElement.parentNode.appendChild(eNewElement);
    }
},

/*
Recursive function that checks if the searched element is a parent of the
start element.

@param  eStart  Start element.
@param  eSearch Searched element.
@return True if the searched element is a parent.
*/
isParent : function(eStart, eSearch){
    if(eStart === null){
        return false;
    }else if(eStart === eSearch){
        return true;
    }else if(typeof(eStart.parentNode) !== "undefined"){
        return this.isParent(eStart.parentNode, eSearch);
    }else{
        return false;
    }
},

/*
Returns the a parent object (or itself) with the requested tagname

@param  eElem       Element where to startt the search.
@param  sTagName    Tagname of searched object.
@return First parent with the given tagname (null if not found).
*/
searchParent : function(eElem, sTagName){
    sTagName = sTagName.toUpperCase();

    if(eElem.tagName === sTagName){
        return eElem;
    }else if(typeof(eElem.parentNode) !== "undefined" && eElem !== document){
        return this.searchParent(eElem.parentNode, sTagName);
    }else{
        return null;
    }
},

/*
Recursive method that bubbles up in the dom structure until it finds a dom
element with the given (vdf) attribute.

@param  eElement        The element to search.
@param  sAttribute      The attribute to search.
@param  sSearchValue    (optional) The value to search.
@return The found element (null if not found).
*/
searchParentByVdfAttribute : function(eElement, sAttribute, sSearchValue){
    if(eElement !== window.document){
        var sValue = vdf.getDOMAttribute(eElement, sAttribute, null);

        if(sValue !== null && (sValue === sSearchValue || sSearchValue === null || typeof(sSearchValue) === "undefined")){
            return eElement;
        }else if(eElement.parentNode !== null){
            return this.searchParentByVdfAttribute(eElement.parentNode, sAttribute, sSearchValue);
        }
    }

    return null;
},

/*
Gives the focus to the given element. It has a try catch block because some
browsers tend to throw strange errors here. It also calls the setActive method
if it is available.

@param  eElement    Reference to the DOM element that should receive the focus.
@param  bSelect     If true the content of the element will also be selected.
*/
focus : function(eElement, bSelect){
    try {
        eElement.focus();
        if(bSelect && eElement.select){
            eElement.select();
        }
    } catch (err) {
        //ignore focus error
    }

    if(typeof(eElement.setActive) === "function"){
        eElement.setActive();
    }
},

/*
Tries to determine the current caret position of the text field.

@param  eField  Reference to the field DOM element.
@return The caret position (0 if not found).
*/
getCaretPosition : function(eField) {
    // Initialize
    var oSelection, oSelection2, iSelection;

    try{
        // IE Support
        if(document.selection){
            if (eField.tagName.toLowerCase() == "textarea"){
                oSelection = document.selection.createRange();
                oSelection2 = oSelection.duplicate();
                
                oSelection2.moveToElementText(eField);
                oSelection2.setEndPoint('StartToEnd', oSelection);
                
                return eField.value.length - oSelection2.text.length
            }else{
                // Set focus on the element
                eField.focus();

                // To get cursor position, get empty selection range
                oSelection = document.selection.createRange();

                iSelection = oSelection.text.length;

                // Move selection start to 0 position
                oSelection.moveStart('character', -eField.value.length);

                // The caret position is selection length
                return oSelection.text.length - iSelection;
            }
        }else if(eField.selectionStart || eField.selectionStart == '0'){  // Firefox support
            return eField.selectionStart;
        }

    }catch (e){

    }

    // Return results
    return 0;
},

/*
Determines the length of the selection.

@param  eField  Reference to a DOM element (usually a input type="text").
@return Length of the selection (0 if no selection).
*/
getSelectionLength : function(eField){
    var oBookmark, oSelection;

    try{
        if(eField.selectionStart || eField.selectionStart === 0){ //  Mozilla / Opera / Safari / Chrome
            return eField.selectionEnd - eField.selectionStart;
        }else if(document.selection){ //  Internet Explorer
            oBookmark = document.selection.createRange().getBookmark();
            oSelection = eField.createTextRange();
            oSelection.moveToBookmark(oBookmark);

            return oSelection.text.length;
        }
    }catch (e){

    }

    return 0;
},


/*
Changes the caret position of the text field to the given position.

@param  eField  Reference to the field.
@param  iCaretPos   The new caret position.
*/
setCaretPosition : function(eField, iCaretPos){
    try{

        // IE Support
        if(document.selection){

            // Set focus on the element
            eField.focus();

            // Create empty selection range
            var oSel = document.selection.createRange();

            // Move selection start and end to 0 position
            oSel.moveStart('character', -eField.value.length);
            oSel.moveEnd('character', -eField.value.length);

            // Move selection start and end to desired position
            oSel.moveStart('character', iCaretPos);
            oSel.select();
        }else if(eField.selectionStart || eField.selectionStart == '0'){ // Firefox support
            eField.selectionStart = iCaretPos;
            eField.selectionEnd = iCaretPos;
            eField.focus();
        }
    }catch (e){

    }
},

/*
Gives the focus to the first focusable child element that can receive the
focus. Is a recursive method that loops through the DOM.

@param  eElement    Reference to the DOM element.
@return First child element that can receive the focus.
*/
getFirstFocusChild : function(eElement){
    var eResult = null;

    if(typeof(eElement.tagName) === "string"){
        if(this.oTabbableTags[eElement.tagName] === true){
            return eElement;
        }
    }

    //  Scan child elements
    vdf.sys.dom.loopChildren(eElement, function(eChild){
        eResult = this.getFirstFocusChild(eChild);

        if(eResult !== null){
            return false;
        }
    }, this);

    return eResult;
},

/*
This methods loops through the child elements of the DOM element and calls the 
worker method for each child element. Using this method will reduce the amount 
of code in the components and keep all checks on a single place. If the worker 
method returns false the next children won't be processed any more.

@param  eElement    Reference to the element.
@param  fWorker     Method to call for each child.
@param  oEnv        (optional) Environment object used when calling the worker.
@return False if worker stopped processing the children.
*/
loopChildren : function(eElement, fWorker, oEnv){
    var iChild;

    //  Go into children
    if(eElement.childNodes){
        for(iChild = 0; iChild < eElement.childNodes.length; iChild++){
            if(eElement.childNodes[iChild].nodeType !== 3 && eElement.childNodes[iChild].nodeType !== 8){
                if(fWorker.call((oEnv ? oEnv : this), eElement.childNodes[iChild]) === false){
                    return false;
                }
            }
        }
    }
    
    return true;
}
},

/*
Functionality to create graphical components.
*/
gui : {

/*
Hides all select boxes behind the object (only on IE 6 and lower).

@param  eObject     The object (mostly DIV)
@param  eContent    DOM Element in which the selects shouldn't hide.
*/
hideSelectBoxes : function(eObject, eContent){
    var iTop, iBottom, iLeft, iRight, oAllSelects, iTopSelect;
    var iBottomSelect, iLeftSelect, iRightSelect, sVisibilityState;
    var iVisibilityCount, i;

    if(typeof(eContent) === "undefined"){
        eContent = null;
    }

    if(typeof(eObject) === "object"){
        // check to see if this is IE version 6 or lower. hide select boxes if so
        if(vdf.sys.isIE && vdf.sys.iVersion <= 6){

            //  Determine coordinates for element
            iTop = this.getAbsoluteOffsetTop(eObject);
            iBottom = iTop + eObject.offsetHeight;
            iLeft = this.getAbsoluteOffsetLeft(eObject);
            iRight = iLeft + eObject.offsetWidth;

            //  Loop through all selects
            oAllSelects = document.getElementsByTagName("select");
            for(i = 0; i < oAllSelects.length; i++){

                //  Check vertical position
                iTopSelect = this.getAbsoluteOffsetTop(oAllSelects[i]);
                iBottomSelect = this.getAbsoluteOffsetTop(oAllSelects[i]) + oAllSelects[i].offsetHeight;
                if(((iTopSelect > iTop && iTopSelect < iBottom) || (iBottomSelect > iTop && iBottomSelect < iBottom)) || (iTopSelect < iTop && iBottomSelect > iBottom)){

                    //  Check horizontal position
                    iLeftSelect= this.getAbsoluteOffsetLeft(oAllSelects[i]);
                    iRightSelect= this.getAbsoluteOffsetLeft(oAllSelects[i]) + oAllSelects[i].offsetWidth;
                    if((iLeftSelect > iLeft && iLeftSelect<iRight || (iRightSelect > iLeft && iRightSelect<iRight)) || (iLeftSelect<iLeft && iRightSelect>iRight)){

                        //  Special check if the select isn't inside the content element
                        if(eContent === null || !vdf.sys.dom.isParent(oAllSelects[i], eContent)){

                            //  Check if already hidden, if so increase visibillity count
                            sVisibilityState = oAllSelects[i].getAttribute("VisibilityState");
                            if(sVisibilityState){
                                iVisibilityCount = parseInt(oAllSelects[i].getAttribute("VisibilityCount"), 10);
                                oAllSelects[i].setAttribute("VisibilityCount",iVisibilityCount+1);
                            }else{
                                //  Hide and store current visibility state
                                if(oAllSelects[i].style.visibility){
                                    sVisibilityState = oAllSelects[i].style.visibility;
                                }else{
                                    sVisibilityState = "";
                                }
                                
                                if(sVisibilityState !== "hidden"){
                                    oAllSelects[i].setAttribute("VisibilityState", sVisibilityState);
                                    oAllSelects[i].setAttribute("VisibilityCount", "1");
                                    oAllSelects[i].style.visibility = "hidden";
                                }
                            }
                        }
                    }
                }
            }
        }
    }
},

/*
Restores all the hidden selectboxes of the function 'hideSelectboxes'.

@param  eObject     The object.
@param  eContent    DOM Element in which the selects aren't hidden.
*/
displaySelectBoxes : function(eObject, eContent){
    var iTop, iBottom, iLeft, iRight, oAllSelects, iTopSelect;
    var iBottomSelect, iLeftSelect, iRightSelect, sVisibilityState;
    var iVisibilityCount, i;

    if(typeof(eContent) === "undefined"){
        eContent = null;
    }

    if(typeof(eObject) === "object"){
        // check to see if this is IE version 6 or lower. display select boxes if so
        if(vdf.sys.isIE && vdf.sys.iVersion <= 6){

            //  Determine dimentions of object
            iTop = this.getAbsoluteOffsetTop(eObject);
            iBottom = iTop + eObject.offsetHeight;
            iLeft = this.getAbsoluteOffsetLeft(eObject);
            iRight = iLeft + eObject.offsetWidth;

            //  Loop through all selects
            oAllSelects = document.getElementsByTagName("select");
            for(i = 0; i < oAllSelects.length; i++){

                //  Check vertical position
                iTopSelect = this.getAbsoluteOffsetTop(oAllSelects[i]);
                iBottomSelect = this.getAbsoluteOffsetTop(oAllSelects[i]) + oAllSelects[i].offsetHeight;
                if(((iTopSelect > iTop && iTopSelect < iBottom) || (iBottomSelect > iTop && iBottomSelect < iBottom)) || (iTopSelect < iTop && iBottomSelect > iBottom)){

                    //  Check horizontal position
                    iLeftSelect = this.getAbsoluteOffsetLeft(oAllSelects[i]);
                    iRightSelect = this.getAbsoluteOffsetLeft(oAllSelects[i]) + oAllSelects[i].offsetWidth;
                    if((iLeftSelect > iLeft && iLeftSelect < iRight || (iRightSelect > iLeft && iRightSelect<iRight)) || (iLeftSelect < iLeft && iRightSelect > iRight)){

                        //  Special check if the select isn't inside the content element
                        if(eContent === null || !vdf.sys.dom.isParent(oAllSelects[i], eContent)){

                            //  Check if hidden, if so decrement counter and redisplay
                            sVisibilityState = oAllSelects[i].getAttribute("VisibilityState");
                            if(typeof sVisibilityState !== "undefined"){
                                iVisibilityCount = parseInt(oAllSelects[i].getAttribute("VisibilityCount"), 10);
                                if(iVisibilityCount <= 1){
                                    oAllSelects[i].removeAttribute("VisibilityCount");
                                    oAllSelects[i].style.visibility = sVisibilityState;
                                    oAllSelects[i].removeAttribute("VisibilityState");
                                }else{
                                    oAllSelects[i].setAttribute("VisibilityCount", iVisibilityCount - 1);	
                                }
                            }
                        }
                    }
                }
            }
        }
    }	
},

/*
Finds all the child elements of the given element that can be focussed and
disables the tabindex by setting a negative value.

@param  eElement    DOM element to search.
*/
disableTabIndexes : function(eElement){
    var iTag, iElem, aElements;

    for(iTag = 0; iTag < vdf.sys.dom.aTabbableTags.length; iTag++){
        aElements = eElement.getElementsByTagName(vdf.sys.dom.aTabbableTags[iTag]);

        for(iElem = 0; iElem < aElements.length; iElem++){
            if(aElements[iElem].getAttribute("_origTabIndex") === null){
                aElements[iElem].setAttribute("_origTabIndex", aElements[iElem].tabIndex);
                aElements[iElem].tabIndex = "-1";
            }
        }
    }
},

/*
Finds all the child elements of the given element that can contain tabs and
restores their tabindex (if it is modified by by the disableTabIndex method).

@param   eElement    DOM element to search.
*/
restoreTabIndexes : function(eElement){
    var iTag, iElem, aElements;

    for(iTag = 0; iTag < vdf.sys.dom.aTabbableTags.length; iTag++){
        aElements = eElement.getElementsByTagName(vdf.sys.dom.aTabbableTags[iTag]);

        for(iElem = 0; iElem < aElements.length; iElem++){
            if(aElements[iElem].getAttribute("_origTabIndex") !== null){
                aElements[iElem].tabIndex = aElements[iElem].getAttribute("_origTabIndex");
                aElements[iElem].removeAttribute("_origTabIndex");
            }
        }
    }
},

/*
Determines the absolute left offset position of the element.

DEPRECATED

@param  eElement    DOM Element.
@return Total left offset of the element.
*/
getAbsoluteOffsetLeft : function(eElement){
    return this.getAbsoluteOffset(eElement).left;
},

/*
Determines the absolute top offset of the element.

DEPRECATED

@param  eElement    DOM Element.
@return Total top offset of the element.

*/
getAbsoluteOffsetTop : function(eElement){
   return this.getAbsoluteOffset(eElement).top;
},

/*
Bubbles up in the dom measuring the total offsets until the next absolute
(or fixed) positioned element in the DOM. This is are values that can be used
as the style.left and style.top to position an absolute (or fixed) element on
the same position.

@param  eElement The object to get offset(s) from.
@return Object { top : 500, left : 500 } with the offset values.
*/
getAbsoluteOffset : function(eElement){
    var oReturn = { left : 0, top : 0 };
    var bFirst = true;

    if (eElement.offsetParent){
        while (eElement && (bFirst || vdf.sys.gui.getCurrentStyle(eElement).position !== "absolute") && vdf.sys.gui.getCurrentStyle(eElement).position !== "fixed" && vdf.sys.gui.getCurrentStyle(eElement).position !== "relative"){
            bFirst = false;
            oReturn.top += eElement.offsetTop;
            oReturn.left += eElement.offsetLeft;
            eElement = eElement.offsetParent;
        }
    }else if (eElement.y){
        oReturn.left += eElement.x;
        oReturn.top += eElement.y;
    }

    return oReturn;

},

/*
@return The full display width (of the frame / window).
*/
getViewportHeight : function(){
    if (typeof(window.innerHeight) !== "undefined"){
        return window.innerHeight;
    }

    if (document.compatMode === "CSS1Compat"){
        return document.documentElement.clientHeight;
    }
    if (document.body){
        return document.body.clientHeight;
    }
    return null;
},

/*
@return The full display height (of the frame / window).
*/
getViewportWidth : function(){
    if (document.compatMode=='CSS1Compat'){
        return document.documentElement.clientWidth;
    }
    if (document.body){
        return document.body.clientWidth;
    }
    if (typeof(window.innerWidth) !== "undefined"){
        return window.innerWidth;
    }
    
    return null;
},

/*
Disables the textselection for the element.

@param  eElement    Reference to DOM element.
*/
disableTextSelection : function(eElement){
    eElement.onselectstart = function() {
        return false;
    };
    eElement.unselectable = "on";
    eElement.style.MozUserSelect = "none";
    eElement.style.cursor = "default";
},

/*
Determines the current opacity of the element.

@param  eElement    Reference to the element
@param  bCurrent    (optional) If true the (slower) current style method is used.
@return Opacity percentage (100 if no opacity setting found).
*/
getOpacity : function(eElement, bCurrent){
    var oStyle = (bCurrent ? vdf.sys.gui.getCurrentStyle(eElement) : eElement.style);

    if(oStyle.opacity){
        return oStyle.opacity * 100;
    }else if(typeof(oStyle.filter) === "string" && oStyle.filter.search("opacity=") >= 0){
        return parseInt(oStyle.filter.substr(oStyle.filter.search("opacity=") + 8, 4), 10);
    }

    return 100;
},

/*
Sets the opacity of the element to the given percentage.

@param  eElement    Reference to the DOM element.
@param  iOpacity    Opacity percentage (0 to 100).
*/
setOpacity : function(eElement, iOpacity){
    if(typeof eElement.style.opacity !== "undefined"){
        eElement.style.opacity = parseFloat(iOpacity) / 100.0;
    }else{
        eElement.style.filter = "alpha(opacity=" + iOpacity + ")";
    }
},

/*
Parses the color string into an color object { iR : <r>, iG : <g>, iB : <b>,
toHex : function(), toRGB : function() } which can be used to calculate with
colors. The string can be in the hex color format ("#FFFFFF") or the rgb format
("rgb(255, 255, 255)").

@param  sString Color string.
@return Object representing the color.
*/
parseColor : function(sString){
    var aBits, rRGB, oResult = { iR : 0, iG : 0, iB : 0 };

    //  Parse color string
    sString = sString.toLowerCase();
    if(sString.charAt(0) == "#"){
        if(sString.length > 4){
            oResult.iR = parseInt(sString.substr(1, 2), 16);
            oResult.iG = parseInt(sString.substr(3, 2), 16);
            oResult.iB = parseInt(sString.substr(5, 2), 16);
        }else{
            oResult.iR = parseInt(sString.substr(1, 2), 16);
            oResult.iG = parseInt(sString.substr(2, 2), 16);
            oResult.iB = parseInt(sString.substr(3, 2), 16);
        }
    }else if(sString.substr(0, 3) === "rgb"){
        rRGB = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
        aBits = rRGB.exec(sString);
        oResult.iR = parseInt(aBits[1], 10);
        oResult.iG = parseInt(aBits[2], 10);
        oResult.iB = parseInt(aBits[3], 10);
    }

    //  Function to create hex
    oResult.toHex = function(){
        var sR = parseInt(this.iR, 10).toString(16);
        var sG = parseInt(this.iG, 10).toString(16);
        var sB = parseInt(this.iB, 10).toString(16);
        if (sR.length == 1){
            sR = '0' + sR;
        }
        if (sG.length == 1){
            sG = '0' + sG;
        }
        if (sB.length == 1){
            sB = '0' + sB;
        }
        return '#' + sR + sG + sB;
    };

    //  Function to create rgb
    oResult.toRGB = function(){
        return 'rgb(' + parseInt(this.iR, 10) + ', ' + parseInt(this.iG, 10) + ', ' + parseInt(this.iB, 10) + ')';
    };

    return oResult;
},

/*
Returns the current or computed style of the DOM element.

@param  eElem    Reference to a DOM element.
@return The browsers current style element.
*/
getCurrentStyle : function(eElem){
    return (typeof(window.getComputedStyle) === "function" ? window.getComputedStyle(eElem, null) : eElem.currentStyle);
},


/*
This method calculates the current style of the given element. It does this 
using the regular getCurrentStyle method but it alters the style to make it more 
browser compliant. Note that this method is significantly slower than the 
regular method. 

@param  eElem   Reference to the DOM element.
@return Object containing the current style of the element.
*/
getPropCurrentStyle : function (eElem){
    var oResult = {}, oStyle, i, sKey, fReplace, sNewKey;
    
    fReplace = function(sAll, sLetter){
        return sLetter.toUpperCase();
    };
    
    oStyle = (typeof(window.getComputedStyle) === "function" ? window.getComputedStyle(eElem, null) : eElem.currentStyle);
    
    if(oStyle.length && oStyle[0] && oStyle[oStyle[0]]){
        for(i = 0; i < oStyle.length; i++){
            sKey = oStyle[i];
            if (typeof(oStyle[sKey]) === 'string'){
                sNewKey = sKey.replace(/\-(\w)/g, fReplace);
                oResult[sNewKey] = oStyle[sKey];
            }
        }
    }else{
        for(sKey in oStyle){
            if (typeof(oStyle[sKey]) === 'string' && isNaN(sKey)){
                oResult[sKey] = oStyle[sKey];
            }
        }
    }
    
    return oResult;
},

/*
Adds one or more classes to the elements className. Make sure the added classes 
aren't already applied.

@param  eElem   The element.
@param  sClass  Space separated list of CSS class names.
*/
addClass : function(eElem, sClass){
    var aClasses, sClassName, i;
    if(eElem.className){
        aClasses = (sClass || "").split(/\s+/);
        sClassName = " " + eElem.className + " ";
        for(i = 0; i < aClasses.length; i++){
            if(sClassName.indexOf(" " + aClasses[i] + " ") < 0){
                sClassName += " " + aClasses[i];
            }
        }
        eElem.className = vdf.sys.string.trim(sClassName);
    }else{
        eElem.className = sClass;
    }
},

/*
Removes one or more classes from the elements className.

@param  eElem   The element.
@param  sClass  Space separated list of CSS class names.
*/
removeClass : function(eElem, sClass){
    var aClasses, sClassName, i;
    if(eElem.className){
        sClass = " " + sClass + " ";
        aClasses = eElem.className.split(/\s+/);
        sClassName = "";
        for(i = 0; i < aClasses.length; i++){
            if(sClass.indexOf(" " + aClasses[i] + " ") < 0){
                sClassName += " " + aClasses[i];
            }
        }
        eElem.className = vdf.sys.string.trim(sClassName);
    }
},

/*
Sets the CSS class of the body element with a class name that indicates the used
browser. The used classnames are vdf-ie, vdf-safari, vdf-chrome, vdf-opera,
vdf-mozilla for the different browsers. For internet explorer the extra
classnames vdf-ie6, vdf-ie7, vdf-ie8 are also attached. Browsers using the
webkit engine (like chrome and safari) also get the vdf-webkit class.

The function is called automatically after loading. It uses the vdf.sys.is.. and
vdf.sys.iVersion indicators to determine browser versions.
*/
initCSS : function(){
    var sClass;

    if(vdf.sys.isIE){
        sClass = "vdf-ie" + (vdf.sys.iVersion <= 6 ? " vdf-ie6" : (vdf.sys.iVersion <= 7 ? " vdf-ie7" : " vdf-ie8"));
    }else if(vdf.sys.isSafari){
        sClass = "vdf-safari";
    }else if(vdf.sys.isChrome){
        sClass = "vdf-chrome";
    }else if(vdf.sys.isOpera){
        sClass = "vdf-opera";
    }else if(vdf.sys.isMoz){
        sClass = "vdf-mozilla";
    }

    if(vdf.sys.isWebkit){
        sClass += " vdf-webkit";
    }

    document.body.className = document.body.className + " " + sClass;
}

},

/*
Library object that contains several string functions that seem to be missing
the in the ECMAScript standard.
*/
string : {

/*
Removes spaces before and after the given string.

@param  sString	    String to trim.
@return Trimmed string.
*/
trim : function(sString){
    return sString.replace(/^\s+|\s+$/g,"");
},

/*
Removes spaces before the given string.

@param  sString	String to trim.
@return Trimmed string.
*/
ltrim : function(sString){
    return sString.replace(/^\s+/,"");
},

/*
Removes spaces after the given string.

@param  sString	String to trim.
@return Trimmed string.
*/
rtrim : function(sString){
    return sString.replace(/\s+$/,"");
},

/*
Modifies the casing of the value string according to the sample string.

@param  sValue  String of which the casing is adjusted.
@param  sSample String determining the casing.
@return String with the modified casing.
*/
copyCase : function(sValue, sSample){
    var bUpper, iChar, sResult = "";

    for(iChar = 0; iChar < sValue.length; iChar++){
        bUpper = (iChar < sSample.length ? sSample.charAt(iChar) === sSample.charAt(iChar).toUpperCase() : bUpper);

        sResult += (bUpper ? sValue.charAt(iChar).toUpperCase() : sValue.charAt(iChar).toLowerCase());
    }

    return sResult;
},

/*
Encodes special HTML characters so the string can safely be send in an XML message or displayed as 
source in the page.

@param  sValue  String containing HTML code.
@return String containing the encoded HTML.
*/
encodeHtml : function(sValue){
    return (sValue || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

},

/*
Function that doesn't do anything. It is used in some situations where
something needs to be called.
*/
nothing : function(){

}

};


/*
Performing the version checks. In most situations we try to use object
detection, but sometimes we still need version checks.
*/
if(navigator.userAgent.indexOf("Chrome") >= 0){
    vdf.sys.isChrome = true;
    vdf.sys.iVersion = parseFloat(navigator.appVersion.substr(navigator.appVersion.indexOf("Chrome/") + 7));
}else if (navigator.userAgent.indexOf("Safari") >= 0){
    vdf.sys.isSafari = true;
    vdf.sys.iVersion = parseFloat(navigator.appVersion.substr(navigator.appVersion.indexOf("Version/") + 8));
}else if (navigator.product === "Gecko"){
    vdf.sys.isMoz = true;
    vdf.sys.iVersion = parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf("Firefox/") + 8));
}else if (navigator.userAgent.indexOf("Opera") >= 0){
    vdf.sys.isOpera = true;
    vdf.sys.iVersion = parseFloat(navigator.appVersion);
}else{
    vdf.sys.isIE = true;
    vdf.sys.iVersion = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf("MSIE") + 4), 10);
}

if (navigator.userAgent.indexOf("AppleWebKit") >= 0){
    vdf.sys.isWebkit = true;
}

//  Make sure that the autoInit function after the DOM is initialized (Which can be in the future but also can be right now)
if (navigator.appVersion.match("MSIE") && document.readyState === "complete"){
    vdf.sys.gui.initCSS();
}else{
    //  Attach the listener
    if(window.addEventListener){ // W3C
        window.addEventListener("load", vdf.sys.gui.initCSS, false);
    }else{ // IE
        window.attachEvent("onload", vdf.sys.gui.initCSS);
    }
}


vdf.register("vdf.sys");