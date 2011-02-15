/*
Name:
    vdf
Type:
    Library(object)
    
The AJAX Library contains a base for developing rich web applications for
Visual DataFlex. The library contains layer that straightens browser
compatibility issues and extends the default JavaScript functionality. Next to
this base the library contains lots of visual controls that help the developer
easily create an interface inside the browser. A set of these controls are data
aware so they can be used to create data entry views and forms that use AJAX to
communicate with the server.
    
Revisions:
    2007/12/14  Created the initial structure and the first edition of dynamic
    library loading using the vdf.require method. (HW, DAE)
*/

/*
@require    vdf/sys.js
@require    vdf/events.js
@require    vdf/settings.js
@require    vdf/lang.js
@require    vdf/errors.js
@require    vdf/core/init.js
*/


/*
The vdf object is the core of the Visual DataFlex AJAX Library. It can be seen 
as namespace because all other components of the AJAX Library are encapsulated 
into the vdf object. The "vdf/Library.js" is also the only JavaScript package 
that needs to be included manually. Other packages will be included 
automatically if the vdf.require function is called.
*/
var vdf = {

//  GLOBALS
/*
String containing the actual version number of the library.
*/
sVersion : "2.2.5.10",
/*
Constant representing the DataFlex findmode "less than".
*/
LT    : "LT",//0,
/*
Constant representing the DataFlex findmode "less than or equal to".
*/
LE    : "LE",//1,
/*
Constant representing the DataFlex findmode "equal to".
*/
EQ    : "EQ",//2,
/*
Constant representing the DataFlex findmode "greater than or equal to".
*/
GE    : "GE",//3,
/*
Constant representing the DataFlex findmode "greater than".
*/
GT    : "GT",//4,
/*
Constant representing the DataFlex findmode "first record".
*/
FIRST : "FIRST_RECORD", //6,
/*
Constant representing the DataFlex findmode "last record".
*/
LAST  : "LAST_RECORD",//7,

//  NAMESPACES
/*
Namespace containing components that can be used as data entry objects inside a 
Form. These prototypes are usually instantiated automatically or using the 
vdfControlType="vdf.deo.Xxx" HTML attribute.
*/
deo : {},
/*
Namespace that contains components used for communication with the server. 
Important are the HttpRequest inheritantance tree and and the xmlSerialize 
object.
*/
ajax : {},
/*
Namespace containing several important components of the Visual DataFlex AJAX Library.
*/
core : {},
/*
Namespace containing graphical components for building interactive user interfaces.
*/
gui : {

/*
Array with Z-Index reservations.

@private
*/
aZReservations : [true],

/*
Used to reserve a new z-index which is always on top of all other components 
that have reserved their z-index.

@return Z-Index number.
*/
reserveZIndex : function(){
    return this.aZReservations.push(true) - 1;
},

/*
Releases a z-index reservation.

@param iIndex  The index to free.
*/
freeZIndex : function(iIndex){
    var iRes;

    this.aZReservations[iIndex] = false;

    for(iRes = this.aZReservations.length - 1; iRes >= 0; iRes--){
        if(!this.aZReservations[iRes]){
            this.aZReservations.pop();
        }else{
            break;
        }
    }
}

},

/*
Control administration (named array of all running controls)

@private
*/
oControls : {},
/*
Form administration (named array of all running forms).

@private
*/
oForms : {},

/*
Is fired for each control that is created.

@event
@prop   oControl    Reference to the newly created control.
@prop   sPrototype  Full name of the prototype used for the control
        (like "vdf.core.Form").
*/
onControlCreated : null,

/*
Fired if a new library is loaded. The event object has the extra property 
sLibrary with the full name of the library.

@event
@prop   sLibrary    The full name of the library that is loaded (like 
        "vdf.core.Form").
*/
onLibraryLoaded : null,

/*
This event is fired if the AJAX Library has finished the initialization of its 
components. That means that it has completely scanned the document for controls 
and has created the required classes for it. It does not mean that controls 
itself have finished their initialization (so the Form can still be loading its 
meta information).

@event
*/
onLoad : null,

/*
Administration of functions that need to be executed after a library is
loaded.

@private
*/
aDependingCode : [],


/*
Searches for a control with the given name. If there are multiple controls with 
the same name the first registered (usually the first in source) control is 
returned. Duplicate names are allowed within a page but not inside a Form (so 
the use of getControl of the vdf.core.Form is more save).

@param  sName    Name of the control.
@return Reference to the control object (null if not found).
*/
getControl : function(sName){
    if(typeof(vdf.oControls[sName.toLowerCase()]) !== "undefined"){
        return vdf.oControls[sName.toLowerCase()];
    }else{
        return null;
    }
},

/*
Searches for a Form with the given name. It is not allowed to have multiple 
forms with the same name on a page.

@param  sName    Name of the form.
@return Reference to the vdf.core.Form object (null if not found).
*/
getForm : function(sName){
    if(typeof(vdf.oForms[sName.toLowerCase()]) !== "undefined"){
        return vdf.oForms[sName.toLowerCase()];
    }else{
        return null;
    }
},

/*
Loops through the namespace structure of the AJAX Library to check if the given
object/prototype/property is available.

@param  sLib    Name of the library (example: "vdf.gui.form")
@return True if the library is found.
*/
isAvailable : function(sLib){
    var aSteps, oCurrent, iStep;

    //  Split library into roadmap
    aSteps = sLib.split(".");

    //  Check if name can be a valid library
    // if(aSteps.length < 2 || aSteps[0] != "vdf"){
        // throw new vdf.errors.Error(142, "Invalid library", null, [sLib]);
    // }

    //  Loop through object structure looking for the library
    oCurrent = window;
    for(iStep = 0; iStep < aSteps.length; iStep++){
        oCurrent = oCurrent[aSteps[iStep]];

        if(typeof(oCurrent) === "undefined"){
            return false;
        }
    }

    return true;
},


/*
Loops through the AJAX Library object structure checking if the component is 
available. If it is not available it adds the given function to the wait 
administration so it is executed after this component has finished loading. 

Note: In the pre-release versions of the AJAX Library 2.0 (before the Beta 4) 
this function also loaded the given component using the dynamic load system. 
With the abandoning of the dynamic load system the functionality and the 
importance of this function has dropped. It should now only be used if a 
component is required that is defined later in the execution process. Calling 
this method without a reference to a function now is obsolete and doesn't do 
anything.

@code
var onMyEvent;

vdf.require("vdf.events", function(){
    onMyEvent = new vdf.events.JSHandler();
}
@code

@param  sLib        The library string (example: "vdf.gui.form").
@param  fWaiting    Function that is executed after the component is available.
*/
require : function(sLib, fWaiting){
    var aSteps, oCurrent, bResult = true, sCurrent, iStep;

    if(arguments.length < 2 || typeof fWaiting !== "function"){
        return;
    }
    
    
    
//    try{

        //  Split library into roadmap
        aSteps = sLib.split(".");

        //  Check if name can be a valid library
        if(aSteps.length < 2 || aSteps[0] != "vdf"){
            throw new vdf.errors.Error(5130, "Invalid library", null, [sLib]);
        }

        //  Loop through object structure looking for the library
        oCurrent = vdf;
        sCurrent = "vdf";
        for(iStep = 1; iStep < aSteps.length; iStep++){
            sCurrent += "." + aSteps[iStep];

            if(typeof(oCurrent) != "undefined"){
                oCurrent = oCurrent[aSteps[iStep]];
            }

            if(typeof(oCurrent) == "undefined"){
                bResult = false;
            }
        }
//    }catch(oError){
//        vdf.err.handle(oError);
//    }

    //  If a waiting function is given we call it now or we queue it..
    if(typeof fWaiting === "function"){
        if(bResult){
            fWaiting(sLib);
        }else{
            vdf.aDependingCode.push({ sLibrary : sLib, fFunction : fWaiting});
        }
    }

    return bResult;
},

/*
Searches the script element that loaded the main library.js package.

@return Reference to the script element (null if not found).
@private
*/
determineLoadScript : function(){
    var aScripts, iScript;

    aScripts = document.getElementsByTagName("script");
    for(iScript = 0; iScript < aScripts.length; iScript++){
        if(aScripts[iScript].src){
            if(aScripts[iScript].src.match(/vdf\/library(-.*)*\.js(\?[a-zA-Z0-9]+=[a-zA-Z0-9%]*(&[a-zA-Z0-9]+=[a-zA-Z0-9%]*)*)?$/)){
                return aScripts[iScript];
            }
        }
    }
    return null;
},

/*
Determines the url from which the main (library.js) package is loaded.

@return Url (string) of which main package is loaded.
*/
determineLoadUrl : function(){
    var eScript = vdf.determineLoadScript();
    
    if(eScript){
        return eScript.src;
    }
    return null;
},

/*
Determines the value of a get parameter passed after the library.js url.

@param  sName   Name of the parameter.
@return String value of the parameter (null if not passed).
*/
getUrlParameter : function(sName){
    var sUrl, aPairs, iPair, sParams;

    sUrl = vdf.determineLoadUrl();
    if(sUrl.indexOf("?") >= 0){
        sParams = sUrl.substr(sUrl.indexOf("?") + 1);

        aPairs = sParams.split("&");

        for(iPair = 0; iPair < aPairs.length; iPair++){
            if(aPairs[iPair].substr(0, sName.length).toLowerCase() === sName.toLowerCase()){
                if(aPairs[iPair].indexOf("=") >= 0){
                    return aPairs[iPair].substr(aPairs[iPair].indexOf("=") + 1).replace("%20", " ");
                }
            }
        }
    }

    return null;
},

/*
Method called by a library to notify the AJAX Library engine that it is loaded. 
If there are no depencies to wait for this wil cause the onLibraryLoaded event 
to fire. Functions given to the require method will also be called. If there 
are libraries depending on this library the register or definePrototype 
method will be called for that library.

@param sLib    The library string (example: vdf.sys.initializer)
*/
register : function(sLib){
    var iWait;

    //  Fire the onLibraryLoaded event
    if(vdf.onLibraryLoaded !== null){
        vdf.onLibraryLoaded.fire(vdf, { sLibrary : sLib });
    }

    iWait = 0;
    for(iWait = 0; iWait < vdf.aDependingCode.length; iWait++){
        if(vdf.aDependingCode[iWait].sLibrary.toLowerCase() === sLib.toLowerCase()){
            try{
                vdf.aDependingCode[iWait].fFunction(sLib);
            }catch(e){
                vdf.errors.handle(e);
            }

            vdf.aDependingCode.splice(iWait, 1);
            iWait--;
        }

    }
},

/*
JavaScript is a prototypal language with lots of different types of notations. 
Within the AJAX Library we decided that we needed a more easy form of 
inheritance with a more readable notation. This method makes it easy to define 
prototypes with inheritance. Note that throughout the documentation prototypes 
will be called classes for the convenience of developers moving from classical 
programming languages.

This method is called with a reference to the constructor an optional super 
constructor (to inherit from) and an object with the prototype definition. The 
prototype.constructor reference is set correctly and a reference to the super 
constructor is stored in prototype[<supername>] so it can be called from the 
sub constructor.

Example of how a prototype should be defined inside the AJAX Library:
@code
vdf.gui.List = function List(oForm){
    this.oForm = oForm;
}
vdf.definePrototype(vdf.gui.List, {

displayRow : function(oRow){
    ..
},

scroll : function(iDirection){
    ..
}
});
@code

Example of how a prototype that extends another prototype should be defined
inside the AJAX Library:
@code
vdf.gui.Grid = function Grid(oForm){
    this.List(oForm);
    this.aFields = [];
}
vdf.definePrototype("vdf.gui.Grid", "vdf.gui.List", {

save : function(){
    ..
}

});
@code

@param  constructor Reference to the constructor function (a string name is 
                    also allowed).
@param  sSuper      (optional)  String name of constructor of the object to 
                    inherit (a string name is also allowed).
@param  oProto      Reference to the object with the new prototype content.
*/
definePrototype : function(constructor, sSuper, oProto){
    var fConstructor, fSuper, oPrototype, fTemp, sProp;

    //  Constructor can be given as string or as reference
    if(typeof(constructor) == "string"){
        if(vdf.sys){
            fConstructor = vdf.sys.ref.getNestedObjProperty(constructor);
        }else{
            fConstructor = eval(constructor);
        }
    }else{
        fConstructor = constructor;
    }

    //  Three parameters means the second points to prototype to extend
    if(arguments.length > 2){ // Three or more parameters means a Prototype to extend is given
        oPrototype = arguments[arguments.length - 1];


        //  The inherited constructor can be given by name in string
        if(typeof(arguments[1]) == "string"){
            //  If the constructor is inside the vdf. we check if it is loaded
            if(arguments[1].substr(0,4) == "vdf."){
                if(!vdf.isAvailable(arguments[1])){

                    alert("Super prototype for '" + constructor + "' must be defined first ('" + arguments[1] + "')");
                    return;
                }
            }

            //  Get a reference to the constructor using eval
            if(vdf.sys){
                fSuper = vdf.sys.ref.getNestedObjProperty(arguments[1]);
            }else{
                fSuper = eval(arguments[1]);
            }
        }else{
            //  The reference can also be given directly
            fSuper = arguments[1];
        }

        //  The third parameter is the prototype object
        oPrototype = arguments[2];

        //  Do the inheritance thing
        fTemp = function(){};
        fTemp.prototype = fSuper.prototype;
        fConstructor.prototype = new fTemp();

        //  Copy in the new methods
        for(sProp in oPrototype){
            if(oPrototype.hasOwnProperty(sProp)){
                fConstructor.prototype[sProp] = oPrototype[sProp];
            }
        }

        //fConstructor.prototype[vdf.sys.ref.getMethodName(fSuper)] = fSuper;
        var sSuperName = fSuper.toString();
        sSuperName = sSuperName.substring(sSuperName.indexOf("function") + 8, sSuperName.indexOf('(')).replace(/ /g,'');
        fConstructor.prototype[sSuperName] = fSuper;
    }if(arguments.length == 2){
        oPrototype = arguments[1];

        fConstructor.prototype = oPrototype;
    }

    fConstructor.prototype.constructor = fConstructor;

    //  If the constructor is given as string and is inside the vdf. object automatically register it.
    if(typeof(constructor) == "string" && constructor.substr(0,4) == "vdf."){
        vdf.register(constructor);
    }
},


/*
Used to get attribute values from DOM elements. It replaces the first character 
(usually determining the type) with "vdf". This is done to make AJAX Library 
attributes recognizable within the HTML code.  The strings "true" and "false" 
are automatically converted to a boolean value.

@param  eElement    The DOM element to read the attribute from.
@param  sProperty   Name of the property to read.
@param  sDefault    (optional) Default value returned if attribute is not set.
@return Value of the attribute (default if not set).
*/
getDOMAttribute : function(eElement, sProperty, sDefault){
    var sResult;

    sProperty = "vdf" + sProperty.substr(1);
    sResult = eElement.getAttribute(sProperty);

    if(sResult === null){
        sResult = sDefault;
    }

    if(typeof(sResult) == "string"){
        if(sResult.toLowerCase() == "true"){
            sResult = true;
        }else if(sResult.toLowerCase() == "false"){
            sResult = false;
        }
    }

    return sResult;
},

/*
Used to set attributes of DOM elements. It uses the naming convention that the 
first character is replaced with "vdf" so that AJAX Library attributes are 
recognizable within the HTML code.

@param  eElement    DOM element to set attribute on.
@param  sProperty   Internal name of the attribute.
@param  sValue      New value for the attribute.
*/
setDOMAttribute : function(eElement, sProperty, sValue){
    sProperty = "vdf" + sProperty.substr(1);
    eElement.setAttribute(sProperty, sValue);
},

/*
@private
*/
lastTime : new Date().getTime(),
/*
@private
*/
aLog : [],

/*
Log method used for development usage. The log is shown on the FireBug console 
with some extra information.

@param  sLog    Text to log.
*/
log : function(sLog){
    var currentTime, time;

    currentTime = new Date().getTime();
    time = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    sLog = "" + currentTime + " : " + time + " : " + sLog;

    vdf.aLog.push(sLog);
    
    try{
        console.log(sLog);
    }catch(e){
    
    }
}

};

//  If events library is loaded we create the global events
vdf.require("vdf.events", function(){
/*
@private
*/
    vdf.onLibraryLoaded = new vdf.events.JSHandler();
/*
@private
*/
    vdf.onControlCreated = new vdf.events.JSHandler();
/*
@private
*/
    vdf.onLoad = new vdf.events.JSHandler();
    
});



//  Register the base library
vdf.register("vdf");
