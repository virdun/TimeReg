/*
Name:
    vdf.core.init
Type:
    Library(object)
Revisions:
    2008/01/04  Created the initial initialization framework which in previous 
    releases was embedden into the VdfForm. (HW, DAE)
*/

/*
@require    vdf/events.js
*/

/*
The initialization system for Visual DataFlex AJAX Library controls. These 
controls are declared in the page by adding vdf.. attributes to DOM elements. 
Controls are defined in the HTML using the vdfControlType attribute. The 
vdfControlType contains the full prototype name (like vdf.core.Form) or one of 
the short names for commonly used controls.

After the browser has finished loading the page and initializing the DOM the 
initializer automatically scans the complete page. A set of functions is also 
available to initialize a part of the DOM or to register custom created 
controls. This can be necessary if parts of the page are generated or are loaded 
manually.
*/
vdf.core.init = {

/*
This method scans the given DOM element and all its children for AJAX Library 
controls and initializes these. AJAX Library controls are declared in the HTML 
using the vdfControlType attribute or the vdfDataBinding attribute. All input, 
select and textarea elements are also considered to be AJAX Library controls.

@param  eStartElement   The DOM element to start the scan.
*/
initializeControls : function(eStartElement){
    var fScan, aControls = [], iControl, oControlShortList, oTagShortList, oTypeShortList;
    
    //  A short list to map short vdfControlType names to longer library paths.
    oControlShortList = {
        "form" : "vdf.core.Form",
        "grid" : "vdf.deo.Grid",
        "lookup" : "vdf.deo.Lookup",
        "label" : "vdf.core.Label",
        "lookupdialog" : "vdf.core.LookupDialog",
        "tabmenu" : "vdf.gui.TabContainer",
        "tabcontainer" : "vdf.gui.TabContainer",
        "datepicker" : "vdf.deo.DatePicker",
        "popupcalendar" : "vdf.gui.PopupCalendar"    
    };

    //  Maps specific tagnames of elements to library paths for controls.
    oTagShortList = {
        "select" : "vdf.deo.Select",
        "textarea" : "vdf.deo.Textarea"
    };

    //  Maps types of input elements to library paths for controls.
    oTypeShortList = {
        "text" : "vdf.deo.Text",
        "radio" : "vdf.deo.Radio",
        "checkbox" : "vdf.deo.Checkbox",
        "hidden" : "vdf.deo.Hidden",
        "password" : "vdf.deo.Password"
    };
    
    //  Recursive DOM scan method that finds and creates controls
    fScan = function(eElement, oParent, oForm){
        var sControlType, oControl, iChild, fConstructor;
        
        //  Detect vdf controls
        sControlType = vdf.getDOMAttribute(eElement, "sControlType", null);
        
        //  Perform special control detection (mostly field detection)
        if(!sControlType){
            if(eElement.tagName === "INPUT"){    //  INPUT elements are mapped on type using the oTagShortList
                sControlType = oTypeShortList[eElement.type.toLowerCase()];
            }else{  //  Other tags are mapped using the oTagShortList
                sControlType = oTagShortList[eElement.tagName.toLowerCase()];
            }
            
            if(typeof(sControlType) === "undefined"){ 
                sControlType = null; 
            }
            
            //  Elements with the sDataBinding are an exception
            if(sControlType === null && vdf.getDOMAttribute(eElement, "sDataBinding", null) !== null){
                sControlType = "vdf.deo.DOM";
            }
        }
        
        //  Add found control to administration
        if(sControlType){
            //  Map name using short list
            if(oControlShortList[sControlType.toLowerCase()]){
                sControlType = oControlShortList[sControlType.toLowerCase()];
            }
            
            //  Check if library is loaded
            if(vdf.isAvailable(sControlType)){
                if(typeof eElement.oVdfControl === "undefined"){
                    //  Search constructor and initialize contorl
                    fConstructor = vdf.sys.ref.getNestedObjProperty(sControlType);
                    oControl = new fConstructor(eElement, (oParent !== null ? oParent : null));
                    
                    //  Register to parent (if interrested
                    if(oParent && typeof(oParent.addChild) === "function"){ //oParent !== null && typeof(oParent.oControl.addChild) === "function"){                                     
                        oParent.addChild(oControl);
                    }
                    //vdf.log("create control: " + oControl.sName + " (" + vdf.sys.ref.getType(oControl) + ")");
                    
                    // Store control references
                    vdf.core.init.registerControl(oControl, sControlType, (oForm ? oForm : null));
                }
            }else{
                throw new vdf.errors.Error(5135, "Unknown control type", this, [sControlType]);
            }
            
            //  Store references
            aControls.push(oControl);
            if(sControlType.toLowerCase() === "vdf.core.form" || sControlType.toLowerCase() === "vdf.core.formmeta" || sControlType.toLowerCase() === "vdf.core.formbase"){
                oForm = oControl;
            }
            oParent = oControl;
        }
        

        //  Scan child elements
        for(iChild = 0; iChild < eElement.childNodes.length; iChild++){
            if(eElement.childNodes[iChild].nodeType !== 3 && eElement.childNodes[iChild].nodeType !== 8){
                fScan(eElement.childNodes[iChild], oParent, oForm);
            }
        }
    
    };

    //  Call the recursive scan method
    if(eStartElement === document.body || typeof(vdf.core.findForm) !== "function"){
        fScan(eStartElement, null, null, true);
    }else{
        fScan(eStartElement, null, vdf.core.findForm(eStartElement), true);
    }
    
    //  Call the init methods
    for(iControl = 0; iControl < aControls.length; iControl++){
        if(typeof(aControls[iControl].init) === "function"){
            try{
                aControls[iControl].init();
            }catch (oError){
                vdf.errors.handle(oError);
            }
        }

    }
    
},


/*
Event listener for the window load event that initializes all controls on the 
page.

@param  oEvent  Reference to a vdf.events.DOMEvent object containing event 
            information.
@private
*/
autoInit : function(oEvent){
    try{
        vdf.core.init.initializeControls(document.body);
        
        vdf.onLoad.fire(vdf.init, {});
    }catch (oErr){
        vdf.errors.handle(oErr);
    }
},


/*
Scans the given DOM element and its childs for controls and destroyes these.

@param  eStartElement  Reference to a vdf.events.DOMEvent object containing 
            event information.
*/
destroyControls : function(eStartElement){
    var oControl, fScan;
    
    fScan = function(eElement){
        var iChild;
        
        if(eElement.oVdfControl){
            oControl = eElement.oVdfControl;
            
            //vdf.log("destroy control: " + oControl.sName + " (" + vdf.sys.ref.getType(oControl) + ")");
            vdf.core.init.destroyControl(oControl);
        }
        
        
        //  Scan child elements
        for(iChild = 0; iChild < eElement.childNodes.length; iChild++){
            if(eElement.childNodes[iChild].nodeType !== 3 && eElement.childNodes[iChild].nodeType !== 8){
                fScan(eElement.childNodes[iChild]);
            }
        }
    };
    
    fScan(eStartElement);
},

/*
Handles the unload event of the window and destroys all objects that where on 
the page to prevent memory leaks.

@param  oEvent  Event object.
@private
*/
autoDestroy : function(oEvent){
    vdf.core.init.destroyControls(document.body);
},

/*
Registers a control in the oControls object and fires the onControlCreated event. 
Eventually throws an error if the name already exists.

@param  oControl    Reference to the control.
@param  sPrototype  Full name of the Prototype of the control (example: 
            "vdf.deo.Grid").
@param  oForm       (optional) Reference to the Form control in which the 
            control is located.
*/
registerControl : function(oControl, sPrototype, oForm){
    if(typeof oControl.sName === "string" && oControl.sName !== ""){
        oControl.sControlType = sPrototype;
    
        if(oControl.hasOwnProperty("bIsForm")){
            //  
            if(vdf.oForms[oControl.sName]){
                if(vdf.oForms[oControl.sName] !== oControl){
                    throw new vdf.errors.Error(5132, "Control name must be unique within the form", this, [oControl.sName]);
                }
            }else{
                vdf.oForms[oControl.sName] = oControl;
            }
        }else{
            //  Register at the form
            if(oForm){
                oControl.oForm = oForm;
                if(oForm.oControls[oControl.sName]){
                    if(oForm.oControls[oControl.sName] !== oControl){
                        throw new vdf.errors.Error(5132, "Control name must be unique within the form", this, [oControl.sName, oForm.sName]);
                    }
                }else{
                    oForm.oControls[oControl.sName] = oControl;
                }
            }
        }

        //  Register globally
        if(vdf.oControls[oControl.sName]){
            //  We allow global name conflicts and only keep the old reference
        }else{
            vdf.oControls[oControl.sName] = oControl;
        }
        
        
        
        vdf.onControlCreated.fire(this, { "oControl" : oControl, sPrototype : sPrototype });
    }else{
        throw new vdf.errors.Error(5133, "Control should have a name", this, [oControl.sName]);
    }
},

/*
Destroys a control. It removes the control from the administration. It also 
calls the destroy method of the control.

@param  oControl    Reference to the control.
*/
destroyControl : function(oControl){
    if(oControl.sName !== null){
        delete vdf.oControls[oControl.sName];
    }
    if(oControl.oForm){
        delete oControl.oForm.oControls[oControl.sName];
    }
    if(oControl.hasOwnProperty("bIsForm")){
        delete vdf.oForms[oControl.sName];
    }

    if(typeof(oControl.destroy) === "function"){
        oControl.destroy();
    }
    if(oControl.eElement){
        if(oControl.eElement.oVdfControl === oControl){
            oControl.eElement.oVdfControl = null;
        }
        delete oControl.eElement;
    }
    
},


/*
Bubbles up in the DOM to find a parent control. If a control type is given it 
will only find controls of that type. Note that the full classname should be 
used and shortnames are not allowed.

@param  eElement        Element to start the search.
@param  sControlType    (optional) Type of control (like: "vdf.deo.Grid").
@reutrn Reference to the JavaScript control object (null if none found).
*/
findParentControl : function(eElement, sControlType){
    //  Initialize control type
    if(!sControlType){
        sControlType = null;
    }
    
    //  Bubble up in the DOM searching for VDF controls
    while(eElement !== null && eElement !== document){
        if(typeof(eElement.oVdfControl) === "object" && (sControlType === null || eElement.oVdfControl.sControlType === sControlType)){
            return eElement.oVdfControl;
        }

        eElement = eElement.parentNode;
    }
    
    //  If nothing found return null
    return null;
}

};

//  Make sure that the autoInit function after the DOM is initialized (Which can be in the future but also can be right now)
if (navigator.appVersion.match("MSIE") && document.readyState === "complete"){
    vdf.core.init.autoInit();
}else{
    //  Attach the listener
    if(window.addEventListener){ // W3C
        window.addEventListener("load", vdf.core.init.autoInit, false);
    }else{ // IE
        window.attachEvent("onload", vdf.core.init.autoInit);
    }
}


vdf.register("vdf.core.init");