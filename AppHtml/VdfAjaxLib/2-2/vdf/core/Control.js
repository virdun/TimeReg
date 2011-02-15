/*
Name:
    vdf.core.Control
Type:
    Prototype
Revisions:
    2010/03/18  Initial version. (HW, DAE)
*/

/*
Constructor that initializes the main control properties.

@param  eElement        The DOM element to which the control belongs.
@param  oParentControl  (optional) Reference to a parent control (in which this 
            control is nested).
*/
vdf.core.Control = function Control(eElement, oParentControl){
    /*
    Reference to the DOM element that represents the field in the page.
    */
    this.eElement = eElement;
    /*
    Reference to the parent control (like a tabcontainer, grid or form).
    */
    this.oParentControl = oParentControl;
    /*
    Reference to the Form to which it belongs (null if working outside a form).
    */
    this.oForm = null;
    /*
    The name of the field that is used to identify the field within the form. 
    The getControl function of the Form or the global vdf.getControl functions 
    take this name as a parameter to get a reference to this object.
    
    @html
    */
    this.sName = this.determineName();
	
	// @privates
	this.bIsControl = true;
	
    //  Init DOM reference
    if(this.eElement && !this.eElement.oVdfControl){
        this.eElement.oVdfControl = this;
    }
};
/*
This class is contains the basic functionality used by all widgets that can be 
initialized using the HTML API. Widgets will subclass this class to inherit the 
generic functionality.
*/
vdf.definePrototype("vdf.core.Control",{
/*
Gets a HTML attribute from the DOM element(s) that represents the field.

@param  sName   Name of the attribute.
@return Value of the attribute (null if not set).
*/
getAttribute : function(sName){
    return this.eElement.getAttribute(sName);
},

/*
Sets the HTML attribute to the DOM element(s) that represent the field.

@param  sName   Name of the attribute.
@param  sValue  New value of the attribute.
*/
setAttribute : function(sName, sValue){
    this.eElement.setAttribute(sName, sValue);
},

/*
Changes the className of the DOM element(s) that represent the field.

@param  sNewClass   The new classname.
*/
setCSSClass : function(sNewClass){
    this.eElement.className = sNewClass;
},

/*
Determines the current className of the DOM element(s) that represent the field.

@return The current className.
*/
getCSSClass : function(){
    return this.eElement.className;
},

/*
Disables the field.
*/
disable : function(){
    this.bFocusable = false;
    this.eElement.disabled = true;
},

/*
Enables the field.
*/
enable : function(){
    this.bFocusable = true;
    this.eElement.disabled = false;
},

/*
Adds a dom listener (see vdf.events.addDomListener).

@param  sEvent          Name of the event.
@param  fListener       Function that will handle the event.
@param  oEnvironment    Object in which the listener will work.
*/
addDomListener : function(sEvent, fListener, oEnvironment){
    vdf.events.addDomListener(sEvent, this.eElement, fListener, oEnvironment);
},

/*
Removes a dom listener (see vdf.events.removeDomListener).

@param  sEvent      Name of the event.
@param  fListener   Function that currently handles the event.
*/
removeDomListener : function(sEvent, fListener){
    vdf.events.removeDomListener(sEvent, this.eElement, fListener);
},

/*
Adds a dom key listener (see vdf.events.addDomKeyListener).

@param  fListener       Function that will handle the event.
@param  oEnvironment    Object in which the listener will work.
*/
addKeyListener : function(fListener, oEnvironment){
    vdf.events.addDomKeyListener(this.eElement, fListener, oEnvironment);
},

/*
Removes a dom listener (see vdf.events.removeDomKeyListener).

@param  fListener   Function that currently handles the event.
*/
removeKeyListener : function(fListener){
    vdf.events.removeDomKeyListener(this.eElement, fListener);
},

/*
Inserts a element in the DOM after the fields element(s).

@param  eElement    The new element to insert.
@private
*/
insertElementAfter : function(eElement){
    vdf.sys.dom.insertAfter(eElement, this.eElement);
    
    //this.eElement.parentNode.appendChild(eElement);
    
},

/*
This method gets a VDF HTML attribute from the DOM element(s). Note that the 
first character of the attribute name will be replaced with "vdf".

@param  sName       Name of the attribute.
@param  sDefault    Value returned if the attribute is not available.
*/
getDOMAttribute : function(sName, sDefault){
    if(this.eElement){
        return vdf.getDOMAttribute(this.eElement, sName, sDefault);
    }else{
        return sDefault;
    }
},

/*
This method sets a VDF HTML attribute to the DOM element(s). Note that the first 
character of the attribute name will be replaced with "vdf".

@param  sName       Name of the attribute.
@param  sValue      New value of the attribute.
*/
setDOMAttribute : function(sName, sValue){
    if(this.eElement){
        vdf.setDOMAttribute(this.eElement, sName, sValue);
    }
},

/*
Determines the value of an AJAX Library specific setting on the DOM element that 
belongs to the field. The name of the property is the given name with first 
character replaced by vdf. See vdf.getDOMAttribute for more details.

@param  sName       Name of the attribute.
@param  sDefault    Value returned if the attribute is not set.
@return Value of the attribute (sDefault if not set).
*/
getVdfAttribute : function(sName, sDefault, bBubble){
    var sResult = this.getDOMAttribute(sName, null);
    
    if(sResult === null){
        if((bBubble) && this.oParentControl !== null && typeof(this.oParentControl.getVdfAttribute) == "function"){
            sResult = this.oParentControl.getVdfAttribute(sName, sDefault, true);
        }else if((bBubble) && this.oForm !== null && typeof(this.oForm) !== "undefined"){
            sResult = this.oForm.getVdfAttribute(sName, sDefault, true);
        }else{
            sResult = sDefault;
        }
    }
    
    return sResult;
},

/*
Determines the name of the control. It first looks at the sName (vdfName)
attribute, then at the sControlName (vdfControlName) attribute and then at the
name attribute. If none is found the default is used after it is made unique
with an number.

@return The name of the control.
@private
*/
determineName : function(){
    var sStartName, sName = null, iCount;

    sName = this.getVdfAttribute("sName");
    if(typeof sName === "string"){
        return sName.toLowerCase();
    }
    sName = this.getVdfAttribute("sControlName");
    if(typeof sName === "string"){
        return sName.toLowerCase();
    }

    if(typeof this.eElement === "object" && this.eElement !== null){
        sName = this.eElement.getAttribute("name");
    }
    if(typeof sName !== "string" || sName === ""){
        sName = vdf.sys.ref.getType(this);
    }

    sName = sName.toLowerCase();

    sStartName = sName;
    iCount = 0;
    while(vdf.oControls.hasOwnProperty(sName)){
        iCount++;
        sName = sStartName + "_" + iCount;
    }

    return sName;
},

/*
This method generates HTML displaying details about the object and its current state that can be 
used for debugging purposes. The error system will call this method when handling an error thrown 
with this object as the source to generate the content of the details panel in the error.

@param  oErr    (optional) Reference to the error object.
@return String containing HTML.
*/
debugDetails : function(oErr){
	var aHTML, sSource;
    
    sSource = (this.eElement ? vdf.sys.string.encodeHtml(vdf.sys.dom.getOuterHTML(this.eElement)) : "");
    
    if(sSource.length > 100){
        sSource = sSource.substr(0, 100) + "...";
    }
    
    aHTML = [
		"<b>Control type:</b> ", vdf.sys.ref.getType(this), "<br/>",
		"<b>Control name:</b> ", this.sName, "<br/>",
		"<br />",
		"<b>Control element source:</b><hr />",
		"<pre>", sSource, "</pre>"
	];
	
	return aHTML.join("");
}

});
