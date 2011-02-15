/*
Name:
    vdf.deo.Radio
Type:
    Prototype
Extends:
    vdf.core.Field
Revisions:
    2008/01/17  Initial version in the new 2.0 architecture. (HW, DAE)
*/

/*
@require    vdf/core/Field.js
*/

/*
Object in which references are maintained to all radio buttons available. Is 
used to "merge" instances based on their name.

@private
*/
vdf.deo.oRadio = { };

/*
Constructor that first checks if there isn't already an object for the given 
radio DOM element. If so it returns that object after adding the element to it.

@param  eRadio          Reference to a input type="radio" DOM element.
@param  oParentControl  (optional) Parent control (usually Form).
*/
vdf.deo.Radio = function Radio(eRadio, oParentControl){
    if(typeof(vdf.deo.oRadio[eRadio.name]) !== "undefined"){
        vdf.deo.oRadio[eRadio.name].addElement(eRadio);
        
        return vdf.deo.oRadio[eRadio.name];
    }else{
        /*
        Object used as a named array that contains references to the radio DOM 
        elements.
        */
        this.oElements = {};
        /*
        Reference to the first radio DOM element.
        */
        this.eFirstElement = eRadio;
        /*
        Reference to the last radio DOM element.
        */
        this.eLastElement = eRadio;
        
        //  @privates
        
        this.addElement(eRadio);
        
        this.Field(eRadio, oParentControl);
        
        vdf.deo.oRadio[eRadio.name] = this;
    }
};
/*
This class contains the implementation of the radio button. It extends the 
vdf.core.Field class and implements the default field API for radio button 
fields. This class is pretty special when compared to other DEO classes because 
it maintains multiple elements. If this class is constructed it will look in the 
global administration of radio fields to see if there is already an instance 
maintaining radio buttons with this name. If an existing instance is found it 
will add the element passed to the constructor to this existing instance. When 
the setValue method is called it will check the <input element have the given 
value. The initialization system will automatically recognizes <input 
type="radio" elements and will create an instance of this class for each 
occurrence (which are automatically merged if the names match).

@code
<input type="radio" name="contacts_status" value="A" />
<input type="radio" name="contacts_status" value="I" />
@code

The code above shows two radio buttons with the same name so they will be seen 
by the framework as a single field.
*/
vdf.definePrototype("vdf.deo.Radio", "vdf.core.Field", {

/*
Called to add a radio element.

@param  eRadio  Reference to the radio DOM element.
@private
*/
addElement : function(eRadio){
    this.eLastElement = eRadio;
    this.oElements[eRadio.value] = eRadio;
},

/*
Overrides the getValue method with the functionality to determine the value by 
looking at which radio is selected.

@return The value.
*/
getValue : function(){
    var sCurrentValue;

    for(sCurrentValue in this.oElements){
        if(typeof(this.oElements[sCurrentValue]) == "object" && this.oElements[sCurrentValue].type.toLowerCase() == "radio"){
            if(this.oElements[sCurrentValue].checked){
                return sCurrentValue;
            }
        }
    }
    
    return "";
},

/*
Overrides the setValue method with radio specific functionallity.

@param  sValue          The new value.
@param  bNoNotify       (optional) If true the DD is not updated with this change.
@param  bResetChange    (optional) If true the display changed is cleared.
*/
setValue : function(sValue, bNoNotify, bResetChange){
    //  If none given select first
    if(sValue === ""){
        this.eFirstElement.checked = true;
    }
    
    //  Try to select
    if(typeof(this.oElements[sValue]) !== "undefined"){
        this.oElements[sValue].checked = true;
    }
    
    if(!bNoNotify){
        this.update();
    }
    
    this.onChange.fire(this, { "sValue" : sValue });
    
    if(bResetChange){
        this.sDisplayValue = this.getValue();
    }
},

getDOMAttribute : function(sName, sDefault){
    var sElement, sValue;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            sValue = vdf.getDOMAttribute(this.oElements[sElement], sName, null);
            
            if(sValue !== null){
                return sValue;
            }
        }
    }
    
    return sDefault;
},

setDOMAttribute : function(sName, sValue){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            vdf.setDOMAttribute(this.oElements[sElement], sName, sValue);
        }
    }
},

/*
Loops through the elements until it finds on with the attribute set.

@param  sName   Name of the attribute.
@return Value of the attribute (null if not set)
*/
getAttribute : function(sName){
    var sElement, sValue;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            sValue = this.oElements[sElement].getAttribute(sName);
            
            if(typeof(sValue) !== "undefined" && sValue !== null){
                return sValue;
            }
        }
    }
    return null;
},

/*
Sets the attribute on all radio elements.

@param  sName   Name of the attribute.
@param  sValue  New name of the attribute.
*/
setAttribute : function(sName, sValue){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            this.oElements[sElement].setAttribute(sName, sValue);
        }
    }
},

/*
Adds a DOM listener (see vdf.events.addDomListener) to all the radio buttons.

@param  sEvent          Name of the event.
@param  fListener       Reference to the function that will handle the event.
@param  oEnvironment    Reference to the Object in which the listener will work.
*/
addDomListener : function(sEvent, fListener, oEnvironment){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            vdf.events.addDomListener(sEvent, this.oElements[sElement], fListener, oEnvironment);
        }
    }
},

/*
Removes a dom listener (see vdf.events.removeDomListener).

@param  sEvent      Name of the event.
@param  fListener   Function that currently handles the event.
*/
removeDomListener : function(sEvent, fListener){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            vdf.events.removeDomListener(sEvent, this.eElement, fListener);
        }
    }
},

/*
Adds a dom key listener (see vdf.events.addDomKeyListener).

@param  fListener       Function that will handle the event.
@param  oEnvironment    Object in which the listener will work.
*/
addKeyListener : function(fListener, oEnvironment){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            vdf.events.addDomKeyListener(this.oElements[sElement], fListener, oEnvironment);
        }
    }
},

/*
Removes a dom listener (see vdf.events.removeDomKeyListener).

@param  fListener   Function that currently handles the event.
*/
removeKeyListener : function(fListener){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            vdf.events.removeDomKeyListener(this.oElements[sElement], fListener);
        }
    }
},

/*
Changes the className of the DOM element(s) that represent the field.

@param  sNewClass   The new classname.
*/
setCSSClass : function(sNewClass){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            this.oElements[sElement].className = sNewClass;
        }
    }
},

/*
Determines the current className of the DOM element(s) that represent the field.

@return The current className.
*/
getCSSClass : function(){
    var sElement;
    
    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            return this.oElements[sElement].className;
        }
    }
},

/*
Disables the field.
*/
disable : function(){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            this.oElements[sElement].disabled = true;
        }
    }
    
    this.bFocusable = false;
},

/*
Enables the field.
*/
enabled : function(){
    var sElement;

    for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            this.oElements[sElement].disabled = false;
        }
    }
    
    this.bFocusable = true;
},

/*
Inserts a element in the DOM after the fields element(s).

@param  eElement    The new element to insert.
@private
*/
insertElementAfter : function(eElement){
    vdf.sys.dom.insertAfter(eElement, this.eLastElement);
},

/*
Gives the focus to the field (or actually the DOM element to which this field 
belongs).
*/
focus : function(){
    vdf.sys.dom.focus(this.eFirstElement);
},

/*
Currently contains the displayLock functionallity but we want to move this to 
the Action object to improve the performance. 

@private
*/
displayLock : function(){

},

/*
Currently contains the displayUnlock functionallity but we want to move this to 
the Action object to improve the performance. 

@private
*/
displayUnlock : function(){

},

/*
The destroy method is a generic method that all AJAX Library widgets should 
have. It removes all events handlers and all references between JavaScript and 
the DOM. Next the disabling the components functionality this should prevent 
memory leaks from occurring (especially for older browsers).
*/
destroy : function(){
    var sElement;
    
     for(sElement in this.oElements){
        if(this.oElements.hasOwnProperty(sElement)){
            vdf.events.clearDomListeners(this.oElements[sElement]);
            this.oElements[sElement].oVdfControl = null;
        }
    }
    
    this.oElements = {};
    this.eFirstElement = null;
    this.eLastElement = null;
}


});
