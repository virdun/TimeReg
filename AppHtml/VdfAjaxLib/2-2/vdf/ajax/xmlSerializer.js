/*
Name:
    vdf.ajax.xmlSerializer
Type:
    Library (object)
Revisions:
    2008/01/10  Created the first version. (HW, DAE)
*/

/*
Library that contains the functionallity to convert object structures into XML. 
It converts the objects, the containing arrays and the values to XML and back. 
Functions aren't converted. Properties of which the name starts with "__" are 
skipped. When converting from XML to objects it searched for each object to a 
corresponding constructor in the vdf.dataStructs library. If a constructor is 
found it uses this constructor to make sure that when serializing the data 
again the object names are available again. Unfortunately destiction between 
objects and arrays when deserializing has to be made on the prefix.

Important when communicating with VDF web services are the names of objects 
that need to match with the struct names (especially when working with arrays). 
To make sure these names are found using the vdf.sys.ref.getType method the objects 
should be created using a constructor function with the name as function name. 
Also important is the order in which properties are created because this should 
be equal to the order of the structure properties in VDF.

All data that is sent to the server should be build as objects and converted 
using serialization to preserve the correct abstraction level.
*/
vdf.ajax.xmlSerializer = {

/*
Deserializes the XML into an object structure. The XML can be given as XML DOM
structure or as string (which is parsed into a DOM structure). The parsing is 
done recursively.


@param  oSource         XML document (as XML DOM structure or as string).
@param  sMainObjectName (optional) Sometimes the main object can't be solved from 
                        the XML.
@return                 Reference to the object structure.
*/
deSerialize : function(oSource, sMainObjectName){
    var oNode;

    //  If XML is supplied as string we let the browser parse it first
    if(vdf.sys.ref.getType(oSource) == "string"){
        oNode = vdf.sys.xml.parseXmlString(oSource).documentElement;
    }else{
        oNode = oSource;
    }

    return this.switchFromXml(oNode, sMainObjectName);
},

/*
Serializes the object (structure) into an XML string. The parsing done 
recursively so circular references aren't allowed in the data.

@param  oObject     Object of any type to serialize
@param  bTopElem    (default: true) If false the name of the object element itself 
                    isn't generated.
@return String of XML.
*/
serialize : function(oObject, bTopElem){
    var aXml = [];
    
    if(typeof(bTopElem) == "undefined" || bTopElem){
        aXml.push("<");
        aXml.push(vdf.sys.ref.getType(oObject));
        aXml.push(">\n");
    }
    
    this.switchToXml(oObject, aXml);
    
    if(typeof(bTopElem) == "undefined" || bTopElem){
        aXml.push("</");
        aXml.push(vdf.sys.ref.getType(oObject));
        aXml.push(">\n");
    }
    
    return aXml.join("");
},    
    
/*
Switches between the serialization methods for the different types.

@param  object  The object to serialize.
@param  aXml    Reference to the stringbuilder with the XML so far.
@private
*/
switchToXml : function(object, aXml){
    switch(vdf.sys.ref.getType(object)){
        case "array":
            this.arrayToXml(object, aXml);
            break;
        case "string":
            this.stringToXml(object, aXml);
            break;
        case "number":
            this.numberToXml(object, aXml);
            break;
        case "boolean":
            this.booleanToXml(object, aXml);
            break;
        case "date":
            this.dateToXml(object, aXml);
            break;
        case "null":
            break;
        default:
            this.objectToXml(object, aXml);
            break;
    }
},

/*
Loops through the objects properties generating an element for each property 
with the name as its tagname. It calls switchToXml to serialize the content. 
Functions and properties starting with "__" are skipped. The XML is added to 
the stringbuilder.

@param  oObj    Reference to the object to serialize.
@param  aXml    Reference to the stringbuilder with the XML so far.
@private
*/
objectToXml : function(oObj, aXml){
    var sProp;
    
    if(oObj !== null && typeof(oObj) !== "undefined"){
        for(sProp in oObj){
            if(typeof(oObj[sProp]) != "function" && sProp.substr(0, 2) != "__"){
                aXml.push("<");
                aXml.push(sProp);
                aXml.push(">");
                
                this.switchToXml(oObj[sProp], aXml);
                
                aXml.push("</");
                aXml.push(sProp);
                aXml.push(">\n");
            }
        }
    }
},

/*
Loops through the items in the array and creates an XML element for them. It 
uses the vdf.sys.ref.getType to determine the tagname of the elements. switchToXML 
is called serialize the items itself.

@param  aArray  Reference to the array object that needs to be serialized.
@param  aXml    Reference to the stringbuilder with the XML so far.
@private
*/
arrayToXml : function(aArray, aXml){
    var iItem;
    
    for(iItem = 0; iItem < aArray.length; iItem++){
        aXml.push("<");
        aXml.push(vdf.sys.ref.getType(aArray[iItem]));
        aXml.push(">");

        this.switchToXml(aArray[iItem], aXml);
        
        aXml.push("</");
        aXml.push(vdf.sys.ref.getType(aArray[iItem]));
        aXml.push(">\n");
    }
},

/*
Converts a string value into XML. It ads <!CDATA[ elements where needed.

@param sString  The string value to convert to XML.
@param aXml     Reference to the stringbuilder with the XML so far.
@private
*/
stringToXml : function(sString, aXml){
    //  Add CDATA if the value contains special characters
    if(sString.match(/[<>&'"]/) !== null){
        aXml.push("<![CDATA[");
        aXml.push(sString.replace("]]>", "]]>]]><![CDATA["));
        aXml.push("]]>");
    }else{
        aXml.push(sString);
    }
},

/*
Converts the number into a XML string.

@param  nNumber The number to convert.
@param  aXml    Reference to the stringbuilder with the XML so far.
@private
*/
numberToXml : function(nNumber, aXml){
    aXml.push(nNumber.toString());
},

/*
Converts a date object into a XML string according to the SOAP standart.

@param  dDate   Reference to a date object.
@param  aXml    Reference to the stringbuilder with the XML so far.

@private
*/
dateToXml : function(dDate, aXml){
    aXml.push(vdf.sys.math.padZero(dDate.getFullYear(), 4));
    aXml.push("-");
    aXml.push(vdf.sys.math.padZero(dDate.getMonth() + 1, 2));
    aXml.push("-");
    aXml.push(vdf.sys.math.padZero(dDate.getDate(), 2));
    aXml.push("T");
    aXml.push(vdf.sys.math.padZero(dDate.getHours(), 2));
    aXml.push(":");
    aXml.push(vdf.sys.math.padZero(dDate.getMinutes(),2));
    aXml.push(":");
    aXml.push(vdf.sys.math.padZero(dDate.getSeconds(), 2));
    aXml.push(".");
    aXml.push(vdf.sys.math.padZero(dDate.getMilliseconds(), 3));
},

/*
@private

Converts a boolean into a XML string.

@param  bBoolean    Boolean value
@param  aXml        Reference to the stringbuilder with the XML so far.
*/
booleanToXml : function(bBoolean, aXml){
    aXml.push(bBoolean.toString());
},

/*
@private

Detects which type the Xml node represents. Differs between objects, arrays and
values. Unfortunately there no good way to detect if an element is an array or 
an object so it uses the prefix in the name (a = array).

@param  oNode           Reference to a XML element.
@param  sMainObjectName (optional) The name of the main object can be given 
                        because it sometimes isn't available in XML (especially 
                        with web service return values).
@return Object
*/
switchFromXml : function(oNode, sMainObjectName){
    var  bContainer = false, sName, iChild, sPrefix;
    
    //  If a name is given it is used
    if(typeof(sMainObjectName) != "undefined"){
        sName = sMainObjectName;
    }else{
        sName = vdf.sys.xml.getNodeName(oNode);
    }
    
    sPrefix = sName.substr(0, 1);
    
    //  If the name starts with an "a" we assume it is an array
    if(sPrefix === "a"){
        return this.arrayFromXml(oNode);
    }else{
        
        //  Detect if there are child elements
        for(iChild = 0; iChild < oNode.childNodes.length; iChild++){
            if(oNode.childNodes.item(iChild).nodeType == 1){
                bContainer = true;
                break;
            }
        }   
        
        //  If child elements found we assume it is an object, else it must be a value
        if(bContainer){
            return this.objectFromXml(oNode, sMainObjectName);
        }else{
            //  Use the prefix to switch between the different types
            switch(sPrefix){
                case "i":
                    return this.integerFromXml(oNode);
                case "b":
                    return this.booleanFromXml(oNode);
                default:
                    return this.valueFromXml(oNode);
            }
        }
    }
    
},

/*
@private

Deserializes the node into the object it represented. It loops through the 
childnodes and converts them in properties of the object.

@param  oNode       Reference to a XML element representing the object.
@param  sObjectName (optional) Forced object name.
@return Object
*/
objectFromXml : function(oNode, sObjectName){
    var sName, oObject, iChild, oChild, sChild;

    if(sObjectName){
        sName = sObjectName;
    }else{
        sName = vdf.sys.xml.getNodeName(oNode);
    }
    
    if(typeof(vdf.dataStructs) === "object" && typeof(vdf.dataStructs[sName]) === "function"){
        oObject = new vdf.dataStructs[sName]();
    }else{
        oObject = {};
    }
    
    for(iChild = 0; iChild < oNode.childNodes.length; iChild++){
        oChild = oNode.childNodes.item(iChild);
        if(oChild.nodeType == 1){ //    1 = ELEMENT NODE
            sChild = vdf.sys.xml.getNodeName(oChild);
        
            oObject[sChild] = this.switchFromXml(oChild);
        }
    }
    
    return oObject;
},

/*
@private

Converts the XML node into an array.

@param  oNode   Reference to a XML node representing an array.
@return Array.
*/
arrayFromXml : function(oNode){
    var aArray = [], iChild, oChild;
    
    for(iChild = 0; iChild < oNode.childNodes.length; iChild++){
        oChild = oNode.childNodes.item(iChild);
         
        if(oChild.nodeType == 1){ //    1 = ELEMENT NODE
            aArray.push(this.switchFromXml(oChild));
        }
    }
    
    return aArray;
},

/*
@private

Converts a value node into a integer.

@param  oNode   Reference to a XML node representing the value.
@return Value (string)
*/
integerFromXml : function(oNode){
    
    if(oNode.childNodes.length > 0){
        oNode = oNode.firstChild;
    }

    return (oNode.nodeValue !== null ? parseInt(oNode.nodeValue, 10) : 0);
},

/*
@private

Converts a value node into a boolean.

@param  oNode   Reference to a XML node representing the value.
@return Value (string)
*/
booleanFromXml : function(oNode){
    if(oNode.childNodes.length > 0){
        oNode = oNode.firstChild;
    }

    return (typeof(oNode.nodeValue) === "string" ? (oNode.nodeValue.toLowerCase() === "true" || oNode.nodeValue === "1") : oNode.nodeValue);
},

/*
@private

Converts a value node into a value string.

@param  oNode   Reference to a XML node representing the value.
@return Value (string)
*/
valueFromXml : function(oNode){
    var sResult = "", iCount;
    
    if(oNode.childNodes.length > 0){
        for (iCount = 0; iCount < oNode.childNodes.length; iCount++){            
            sResult += (oNode.childNodes[iCount].nodeValue !== null ? oNode.childNodes[iCount].nodeValue : "");
        }
        
        return sResult;
    }else{
        return (oNode.nodeValue !== null ? oNode.nodeValue : "");
    }
}

};

vdf.register("vdf.ajax.xmlSerializer");