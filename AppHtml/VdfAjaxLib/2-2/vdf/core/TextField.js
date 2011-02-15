/*
Name:
    vdf.core.TextField
Type:
    Prototype
Extends:
   vdf.core.Field
Revisions:
    2008/11/19  Added the extra layer for the validation stuff. (HW, DAE)
*/

/*
@require    vdf/core/Field.js
*/

/*
Initializes the properties and reads the HTML settings after calling the super 
(Field) constructor. Applies to the initialization interface (see: 
vdf.core.init).

@param  eElement        Reference to the DOM element representing the field.
@param  oParentControl  Reference to the parent control.
*/
vdf.core.TextField = function TextField(eElement, oParentControl){
    this.Field(eElement, oParentControl);
    
    //  Validation properties (are initialized later if meta data is loaded)
    /*
    The decimal sepator that is used. Defaults to the VDF setting.
    
    @html
    @htmlbubble
    */
    this.sDecimalSeparator = null;
    /*
    The thousands sepator that is used. Defaults to the VDF setting.
    
    @html
    @htmlbubble
    */
    this.sThousandsSeparator = null;
    /*
    The date sepator that is used. Defaults to the VDF setting.
    
    @html
    @htmlbubble
    */
    this.sDateSeparator = null;
    /*
    The date format that is used. Defaults to the VDF setting.
    
    @html
    @htmlbubble
    */
    this.sDateFormat = null;
    /*
    The currency symbol that is used. Defaults to the VDF setting.
    
    @html
    @htmlbubble
    */
    this.sCurrencySymbol = null;
    
    /*
    If true all characters entered are transformed to uppercase. Defaults to the 
    DD_CAPSLOCK field option in VDF.
    
    @html
    */
    this.bCapslock = null;
    /*
    If true aan autofind is performed if the user tabs out of the field. 
    Defaults to the DD_AUTOFIND field option in VDF.
    
    @html
    */
    this.bAutoFind = null;
    /*
    If true aan autofind is performed if the user tabs out of the field. 
    Defaults to the DD_AUTOFIND_GE field option in VDF.
    
    @html
    */
    this.bAutoFindGE = null;
    /*
    If true a zero will be displayed as an empty field if it hasn't got the 
    focus. Defaults to the DD_ZERO_SUPPRESS field option in VDF.
    
    @html
    */
    this.bZeroSuppress = null;
    /*
    Used to limit the amount of characters that can be entered in the field. 
    Defaults to the DF_FIELD_LENGTH attribute in VDF.
    
    @html
    */
    this.iDataLength = null;
    /*
    Used to limit the amount of decimals that can be entered in the field. 
    Defaults to the DF_FIELD_PRECISION attribute in VDF.
    
    @html
    */
    this.iPrecision = null;
    
    /*
    The mask type that should be used on the field. If no mask should be applied 
    it should be empty. Options are "win", "cur", "num and "dat". Defaults to 
    the File_Field_Mask_Type property in VDF.
    
    @html
    */
    this.sMaskType = null;
    /*
    The mask string that should be used on this field. Defaults to the 
    File_Field_Mask property in VDF.
    
    @html
    */
    this.sMask = null;
    
    /*
    If false characters in the mask are replaced by spaces.
    */
    this.bMaskChars = this.getVdfAttribute("bMaskChars", true, true);

    
};
/*
Extends the vdf.core.Field with functionallity that is specific for text fields. 
Especially the validation system is extended here with masking and textfield 
specific options.
*/
vdf.definePrototype("vdf.core.TextField", "vdf.core.Field", {

/*
@private
*/
formInit : function(){
    //  Load validation properties
    this.sDecimalSeparator = this.getVdfAttribute("sDecimalSeparator", (this.oForm && this.oForm.oMetaData ? this.oForm.oMetaData.getGlobalProperty("sDecimalSeparator") : ","), true);
    this.sThousandsSeparator = this.getVdfAttribute("sThousandsSeparator", (this.oForm && this.oForm.oMetaData ? this.oForm.oMetaData.getGlobalProperty("sThousandsSeparator") : ","), true);
    this.sDateSeparator = this.getVdfAttribute("sDateSeparator", (this.oForm && this.oForm.oMetaData ? this.oForm.oMetaData.getGlobalProperty("sDateSeparator") : "-"), true);
    this.sDateFormat = this.getVdfAttribute("sDateFormat", (this.oForm && this.oForm.oMetaData ? this.oForm.oMetaData.getGlobalProperty("sDateFormat") : "yyyy-mm-dd"), true);
    this.sCurrencySymbol = this.getVdfAttribute("sCurrencySymbol", (this.oForm && this.oForm.oMetaData ? this.oForm.oMetaData.getGlobalProperty("sCurrencySymbol") : ","), true);
    
    this.bCapslock = this.getMetaProperty("bCapslock");
    this.bAutoFind = this.getMetaProperty("bAutoFind");
    this.bAutoFindGE = this.getMetaProperty("bAutoFindGE");
    this.bZeroSuppress = this.getMetaProperty("bZeroSuppress");
    this.bNoPut = this.getMetaProperty("bNoPut");
    this.iDataLength = this.getMetaProperty("iDataLength");
    this.iPrecision = this.getMetaProperty("iPrecision");    
    
    this.sMaskType = this.getMetaProperty("sMaskType");
    this.sMask = this.getMetaProperty("sMask");

    
    this.Field.prototype.formInit.call(this);
    
    
    this.setCSSClass(this.getCSSClass() + " " + (this.sDataType ? this.sDataType : "ascii") + "_data");
},
    
//  - - - - -   V A L I D A T I O N   - - - - - 

/*
Initializes the validation.

Params:
    bAttachListeners    If true no listeners are attached (for DOM field).
    
@private
*/
initValidation : function(bAttachListeners){
    var iChar, sMask;
    
    if(typeof(bAttachListeners) === "undefined"){
        bAttachListeners = true;
    }
    
    //  Forward call
    this.Field.prototype.initValidation.call(this);
    

    
    //  Auto find
    if(this.bAutoFindGE && bAttachListeners){
        this.addKeyListener(this.onAutoFindGE, this);
    }else if(this.bAutoFind && bAttachListeners){
        this.addKeyListener(this.onAutoFind, this);
    }
    
    //  Data type filters
    if(this.sDataType === "bcd"){
        if(bAttachListeners){
            this.addDomListener("keypress", this.filterNumeric, this);
        }
    }else if(this.sDataType === "date"){
        if(bAttachListeners){
            this.addDomListener("keypress", this.filterDate, this);
            this.addDomListener("blur", this.onBlurDate, this);
        }
    }else{
        //  Maximum length (for text fields without a mask!)
        if(this.iDataLength && this.sMask === ""){
            this.eElement.maxLength = this.iDataLength;
        }
        
        //  Attaches the capslock transformations
        if(this.bCapslock){
            if(vdf.sys.isIE && bAttachListeners){
                this.addDomListener("keypress", this.adjustCapslockIE, this);
            }else{
                this.eElement.style.textTransform = "uppercase";
            }
        }
    }

    //  Zero suppress is implemented in the mask functionallity, if no mask is used the zero is suppressed manually.
    if(this.bZeroSuppress && this.sMaskType !== "num" && this.sDataType === "bcd"){
        this.sMaskOrigValue = this.eElement.value;
        this.bMaskDisplay = true;
        if(bAttachListeners){
            this.addDomListener("focus", this.onFocusZeroSuppress, this);
            this.addDomListener("blur", this.onBlurZeroSuppress, this);
        }
    }

    //  MASK
    if(this.sMask !== ""){
        sMask = this.sMask;
        if(this.sMaskType === "win" || this.sMaskType === ""){   // Mask Window or None
            this.aMaskChars = [];
            
            //  Fill character information array for quick access (also take in account the "\" exception) which is used only by the filterWinMask
            for(iChar = 0; iChar < sMask.length; iChar++){
                var sChar = sMask.charAt(iChar);
                
                if(sChar === "\\" && iChar + 1 < this.sMask.length && (sMask.charAt(iChar + 1) === "#" || sMask.charAt(iChar + 1) === "@" || sMask.charAt(iChar + 1) === "!" || sMask.charAt(iChar + 1) === "*")){
                    iChar++;
                    this.aMaskChars.push({ bEnter : false, bNumeric : false, bAlpha : false, bPunct : false, sChar : sMask.charAt(iChar + 1) });
                }else{
                    this.aMaskChars.push({
                        bEnter : (sChar === "#" || sChar === "@" || sChar === "!" || sChar === "*"),
                        bNumeric : (sChar === "#" || sChar === "*"),
                        bAlpha : (sChar === "@" || sChar === "*"),
                        bPunct : (sChar === "!" || sChar === "*"),
                        sChar : sChar 
                    });
                }
            }
            
            //  Attach listeners
            if(bAttachListeners){
                this.addDomListener("keypress", this.filterWinMask, this);
                
                this.addDomListener("keyup", this.correctWinMask, this);
                this.addDomListener("blur", this.correctWinMask, this);
                this.addDomListener("cut", this.onCutPasteWinMask, this);
                this.addDomListener("paste", this.onCutPasteWinMask, this);
            }
        }else if(this.sMaskType === "cur" || this.sMaskType === "num"){
            this.sMaskOrigValue = this.eElement.value;
            this.bMaskDisplay = true;
            
            //this.eElement.value = this.applyNumMask(this.eElement.value);
            
            if(bAttachListeners){
                this.addDomListener("focus", this.onFocusNumMask, this);
                this.addDomListener("blur", this.onBlurNumMask, this);
            }
        }else if(this.sMaskType === "dat" || this.sMaskType === "dt"){
            this.sMaskOrigValue = this.eElement.value;
            this.bMaskDisplay = true;
            
            if(bAttachListeners){
                this.addDomListener("focus", this.onFocusDateMask, this);
                this.addDomListener("blur", this.onBlurDateMask, this);
            }
        }
    }
},

//  WINDOWS MASK

/*
Applies the windows mask the to the value by adding the mask characters. If 
the value doesn't matches the mask the value isn't completely displayed.

Params:
    sValue  Value to apply the mask on.
Returns:
    Masked value.
    
@private
*/
applyWinMask : function(sValue){
    var iChar = 0, iValChar = 0, aResult = [], bFound, sMask = this.sMask, sChar;
    
    if(sValue === ""){
        return "";
    }
    
    while(iChar < sMask.length){
        sChar = sMask.charAt(iChar);
        
        if(sChar === "\\" && sMask.length > (iChar + 1)){
            aResult.push(sMask.charAt(iChar + 1));
        }else{
            if(sChar === "#" || sChar === "@" || sChar === "!" || sChar === "*"){
                bFound = false;
                while(iValChar < sValue.length && !bFound){
                    if(this.acceptWinChar(sValue.charAt(iValChar), sChar)){
                        aResult.push(sValue.charAt(iValChar));
                        bFound = true;
                    }
                    iValChar++;
                }
                if(!bFound){
                    break;
                }
            }else{
                //  Append mask display character
                aResult.push((this.bMaskChars ? sChar : " "));
            }
        }
        iChar++;
    }
    
    return aResult.join("");
},

/*
Clears the windows mask from the value by removing the mask characters. If the
value doesn't match the mask the value might be returned incomplete.

Params:
    sValue  Value to apply the mask on.
Returns:
    Clean value to store in the database.

@private
*/
clearWinMask : function(sValue){
    var iChar = 0, sResult = "";
    
    while(iChar < sValue.length && iChar < this.aMaskChars.length){
        if(this.aMaskChars[iChar].bEnter || sValue.charAt(iChar) !== (this.bMaskChars ? this.aMaskChars[iChar].sChar : " ")){
            sResult += sValue.charAt(iChar);
        }
        
        iChar++;
    }
    
    return sResult;
},

/*
Checks if the given character is allowed at the given position for windows 
masks.

Params:
    sChar   Character to check.
    iPos    Position to check. 
Returns:
    True if the character is allowed at the given position.

@private
*/
acceptWinChar : function(sValChar, sChar){
    return ((sChar === "#" && sValChar.match(/[0-9]/)) ||
        (sChar === "@" && sValChar.match(/[a-zA-Z]/)) ||
        (sChar === "!" && sValChar.match(/[^a-zA-Z0-9]/)) ||
        sChar === "*");
},

/*
Adds/skips mask characters if the caret is located before them. It cancels 
characters that are not allowed at that position.

Params:
    e   Event object.
@private
*/
filterWinMask : function(e){
    var iPos, iNewPos, sChar;
    
    if(!e.isSpecialKey()){
        iPos = vdf.sys.dom.getCaretPosition(this.eElement);
        sChar = String.fromCharCode(e.getCharCode());
        
        //  Skip no enter characters (add them if they aren't already there)
        iNewPos = iPos;
        while(iNewPos < this.aMaskChars.length && !this.aMaskChars[iNewPos].bEnter){
            if(this.eElement.value.length <= iNewPos){
                this.eElement.value += (this.bMaskBackground ? this.aMaskChars[iNewPos].sChar : " ");
            }
            iNewPos++;
        }
        
        //  Set the new caret position if it is moved
        if(iPos !== iNewPos && iNewPos < this.aMaskChars.length){
            vdf.sys.dom.setCaretPosition(this.eElement, iNewPos);
            iPos = iNewPos;
        }
        
        //  Check if character allowed by mask
        if(iPos >= this.aMaskChars.length || !this.acceptWinChar(sChar, this.aMaskChars[iPos].sChar)){
            e.stop();
        }
    }
},

/*
Corrects the value according to the mask. It tries to preserve the caret 
position and only updates if the value needs to.

Params:
    e   (optional) Event object.
@private
*/
correctWinMask : function(e){
    var iPos, sNewValue;
    
    //  Calculate the correct value
    sNewValue = this.applyWinMask(this.clearWinMask(this.eElement.value));
    
    //  If the correct value is different than the current value update the value (and try to preserve the caret position)
    if(sNewValue !== this.eElement.value){
        iPos = vdf.sys.dom.getCaretPosition(this.eElement);
        this.eElement.value = sNewValue;
        vdf.sys.dom.setCaretPosition(this.eElement, iPos);
    }
},

/*
Handles the onpaste and oncut events. It calls the correctWinMask method with 
a slight delay so the value is actually modified.

TODO: It is possible to perform the copy / paste action by ourself and so get 
rid of the delay.

Params:
    e   Event object.
@private
*/
onCutPasteWinMask : function(e){
    var oField = this;
    
    setTimeout(function(){
        oField.correctWinMask();
    }, 50);
},

//  DATE / DATE TIME

/*
@private
*/
applyDateMask : function(sValue){
    var dDate = vdf.sys.data.parseStringToDate(sValue, this.sDateFormat, this.sDateSeparator);
    
    if(dDate === null){
        return "";
    }

    return vdf.sys.data.applyDateMask(dDate, this.sMask, this.sDateSeparator);
},

/*
Called when the field is focussed. It replaces the value with the origional 
clean value.

Params:
    e   Event object
@private
*/
onFocusDateMask : function(e){
    var bSelect = false;

    this.bMaskDisplay = false;
    if(this.eElement.value !== this.sMaskOrigValue){
        bSelect = (this.eElement.value.length > 0 && vdf.sys.dom.getSelectionLength(this.eElement) > 0);
    
        this.eElement.value = this.sMaskOrigValue;
        
        vdf.sys.dom.focus(this.eElement, bSelect);
    }
},

/*
Called when the field lozes the focus. It replaces the value with the masked 
value storing the current value;

Params:
    e   Event object
@private
*/
onBlurDateMask : function(e){
    this.sMaskOrigValue = this.eElement.value;
    this.eElement.value = this.applyDateMask(this.eElement.value);
    this.bMaskDisplay = true;
},

/*
Handles the keypress event for date fields and filters unwanted characters.

Params:
    e   Event object.
@private
*/
filterDate : function(e){
    var sChar, iCarret, sNumChar, aFormats, aValues, iCur, iStartPos, sCur;

    if(!e.isSpecialKey()){
        sChar = String.fromCharCode(e.getCharCode());
        iCarret = vdf.sys.dom.getCaretPosition(this.eElement);
        sNumChar = "0123456789";
        
        //  Is character allowed?
        if(sNumChar.indexOf(sChar) !== -1 || sChar === this.sDateSeparator){
            //  Make parts arrays
            aFormats = this.sDateFormat.toLowerCase().split(this.sDateSeparator);
            aValues = this.eElement.value.split(this.sDateSeparator);
            
            //  Loop through parts
            iCur = 0; 
            iStartPos = 0;
            while(iCur < aValues.length && iCur < aFormats.length){
                
                //  Determine if carret is inside part
                if(iCarret - iStartPos >= 0 && (iCur + 1 === aValues.length ||  iCarret - iStartPos <= aValues[iCur].length)){
                    sCur = aValues[iCur];
                    
                    if(sChar === this.sDateSeparator){
                        //  Adding a date separator must make valid part before
                        if(iCarret - iStartPos > (aFormats[iCur] === "yyyy" ? 4 : 2) || iCarret - iStartPos <= 0){
                            e.stop();
                            return;
                        }else if(aValues.length >= aFormats.length || sCur.length - (iCarret - iStartPos) > (aFormats[iCur + 1] === "yyyy" ? 4 : 2)){ // There must also be space for a part after
                            e.stop();
                            return;
                        }
                    }else{
                        if(sCur.length >= (aFormats[iCur] === "yyyy" ? 4 : 2)){
                            if(iCur + 1 === aValues.length && aFormats.length > iCur + 1 && sCur.length - (iCarret - iStartPos) < (aFormats[iCur + 1] === "yyyy" ? 4 : 2)){
                                this.eElement.value = this.eElement.value.substring(0, iCarret) + this.sDateSeparator + this.eElement.value.substring(iCarret);
                                vdf.sys.dom.setCaretPosition(this.eElement, iCarret + 1);
                                return;
                            }else{
                                e.stop();
                                return;
                            }
                        }
                    }
                }
                iStartPos += this.sDateSeparator.length + aValues[iCur].length;
                iCur++;
                
            }
        }else{
            e.stop();
        }
        
    }
},

/*
Handles the onblur event for date fields and makes sure a valid date is in the 
field.

Params:
    e   Event object.
@private
*/
onBlurDate : function(e){
    var dDate = vdf.sys.data.parseStringToDate(this.eElement.value, this.sDateFormat, this.sDateSeparator);
    
    if(dDate === null){
        this.eElement.value = "";
    }else{
        this.eElement.value = vdf.sys.data.parseDateToString(dDate, this.sDateFormat, this.sDateSeparator);
    }
},

//  CURRENCY / NUMERIC

/*
Applies a numeric mask to the given value. It asumes the value is given in the 
-3.31 format (eventually with the current decimal separator).

Params:
    sValue  Clean numeric value.
Returns:
    String with the value with the mask applied.

@private
*/
applyNumMask : function(sValue){
    var nValue, aParts, aResult = [], sChar, bEscape, iChar, iNumChar, iCount, sBefore, sDecimals, sMaskBefore, sMaskDecimals = null, sMask = this.sMask; 
    
    if(sValue === ""){
        return "";
    }
    
    this.sMaskOrigValue = sValue;
    
    //  Parse into number
    sValue = sValue.replace(this.sThousandsSeparator, "").replace(this.sDecimalSeparator, ".");
    nValue = parseFloat(sValue);
    if(isNaN(nValue)){ nValue = 0.0; }
    
    //  Zero suppress
    if(nValue === 0.0 && this.bZeroSuppress){
        return "";
    }
    
    //  Determine which mask to use :D
    aParts = sMask.split(";");
    if(nValue < 0.0){
        if(aParts.length > 1){
            sMask = aParts[1];
        }else{
            sMask = "-" + aParts[0];
        }
    }else{
        sMask = aParts[0];
    }

    //  Split into before and and after decimal separator
    aParts = sMask.split(".");
    sMaskBefore = aParts[0];
    if(aParts.length > 1){
        sMaskDecimals = aParts[1];
    }

    
    //  Pre process mask
    var iMaskBefore = 0;
    var iMaskDecimals = 0;
    var bThousands = false;
    var bBefore = true;
    for(iChar = 0; iChar < sMask.length; iChar++){
        switch(sMask.charAt(iChar)){
            case "\\":
                iChar++;
                break;
            case "#":
            case "0":
                if(bBefore){
                    if(iMaskBefore >= 0){
                        iMaskBefore++;
                    }
                }else{
                    if(iMaskDecimals >= 0){
                        iMaskDecimals++;
                    }
                }
                break;
            case "*":
                if(bBefore){
                    iMaskBefore = -1;
                }else{
                    iMaskDecimals = -1;
                }
                break;
            case ",":
                bThousands = true;
                break;
            case ".":
                bBefore = false;
        }
    }
    
    //  Convert number into string with number before and numbers after
    if(iMaskDecimals >= 0){
        nValue = nValue.toFixed(iMaskDecimals);
    }
    sValue = (nValue === 0.0 ? "" : String(nValue));
    aParts = sValue.split(".");
    sBefore = aParts[0];
    if(aParts.length > 1){
        sDecimals = aParts[1];
    }else{
        sDecimals = "";
    }
    if(sBefore.charAt(0) === "-"){
        sBefore = sBefore.substr(1);
    }
    
    //  BEFORE DECIMAL SEPARATOR
    iChar = sMaskBefore.length - 1;
    iNumChar = sBefore.length - 1;
    iCount = 0;
    while(iChar >= 0){
        sChar = sMaskBefore.charAt(iChar);
        bEscape = (iChar > 0 && sMaskBefore.charAt(iChar - 1) === "\\");
        
        if(!bEscape && (sChar === "#" || sChar === "*" || sChar === "0")){
            while(iNumChar >= 0 || sChar === "0"){
                //  Append thousands separator if needed
                if(iCount >= 3){
                    iCount = 0;
                    if(bThousands){
                        aResult.unshift(this.sThousandsSeparator);
                    }
                }
                
                //  Append number
                aResult.unshift((iNumChar >= 0 ? sBefore.charAt(iNumChar) : "0"));
                iNumChar--;
                iCount++;
                
                //  Break out for non repeative characters
                if(sChar === "#" || sChar === "0"){
                    break;
                }
            }
        }else{
            if(sChar === "$" && !bEscape){
                sChar = this.sCurrencySymbol.replace("&euro;", String.fromCharCode(0x20ac)).replace("&#322", String.fromCharCode(0x0142)); // Replace euro and polish html with polish sign..
            }
            if((sChar !== "," && sChar !== "\\") || bEscape){
                aResult.unshift(sChar);
            }
        }
        iChar--;
    }
    
    //  AFTER DECIMAL SEPARATOR
    if(sMaskDecimals !== null){
        aResult.push(this.sDecimalSeparator);
        
        iNumChar = 0;
        for(iChar = 0; iChar < sMaskDecimals.length; iChar++){
            sChar = sMaskDecimals.charAt(iChar);
            bEscape = (iChar > 0 && sMaskBefore.charAt(iChar - 1) === "\\");
            
           
            if(!bEscape && (sChar === "#" || sChar === "*" || sChar === "0")){
                while(iNumChar < sDecimals.length || sChar === "0"){
                    //  Append number
                    aResult.push((iNumChar >= 0 ? sDecimals.charAt(iNumChar) : "0"));
                    iNumChar++;
                    
                    //  Break out for non repeative characters
                    if(sChar === "#" || sChar === "0"){
                        break;
                    }
                }
            }else{
                if(sChar === "$" && !bEscape){
                    sChar = this.sCurrencySymbol;
                }
                if(sChar !== "\\" || bEscape){
                    aResult.push(sChar);
                }
            }
        }
    }
    
    return aResult.join("");
},

/*
Called when the field is focussed. It replaces the value with the origional 
clean value.

Params:
    e   Event object
@private
*/
onFocusNumMask : function(e){
    this.bMaskDisplay = false;
    this.eElement.value = this.sMaskOrigValue;
    
    try{
        this.eElement.select();
    }catch(oError){
    
    }
},

/*
Called when the field lozes the focus. It replaces the value with the masked 
value storing the current value;

Params:
    e   Event object
@private
*/
onBlurNumMask : function(e){
    this.sMaskOrigValue = this.eElement.value;
    this.eElement.value =this.applyNumMask(this.eElement.value);
    this.bMaskDisplay = true;
},

/*
Filters non numeric characters and prevents the user from entering incorrect 
values.

Params:
    e   Event object
@private
*/
filterNumeric : function(e){
    var sValidChars, sChar, iSeparator, iBefore, iDecimals, iMaxBefore, iPos, sValue, iSel;
        
    if(!e.isSpecialKey()){
        sChar = String.fromCharCode(e.getCharCode());
        iPos = vdf.sys.dom.getCaretPosition(this.eElement);
        iSel = vdf.sys.dom.getSelectionLength(this.eElement);
        sValue = this.eElement.value;
        sValidChars = "0123456789";
        
        if(sChar === "-"){
            //  Only allow "-" at the first position
            if(iPos === 0){ 
                //  When at the first position but a caret is already there we allow the user
                if(sValue.indexOf("-") !== -1){
                    vdf.sys.dom.setCaretPosition(this.eElement, 1);
                    e.stop();
                }
            }else{
                e.stop();
            }
        }else if(sChar === this.sDecimalSeparator){
            iSeparator = sValue.indexOf(this.sDecimalSeparator);
            
            if(iPos === iSeparator && iSel === 0){ // If we are at the decimal separator typing a decimal separator we move the caret one position
                vdf.sys.dom.setCaretPosition(this.eElement, iPos + 1);
                e.stop();
            }else if(iSeparator !== -1 && (iSeparator < iPos || iSeparator > (iPos + iSel))){ //    If there is a separator it must be selected
                e.stop();
            }else if(sValue.indexOf("-") >= iPos && sValue.indexOf("-") >= iPos + iSel){ //  Make sure we don't insert before the "-"
                e.stop();
            }else if(sValue.length - iSel - iPos > this.iPrecision){   //  Make sure we don't get to may decimals
                e.stop();
            }else if(this.iPrecision <= 0){ // Are decimals actually allowed?
                e.stop();
            }
        }else if(sValidChars.indexOf(sChar) !== -1){
            //  When we are before the the "-" we move one character forward
            if(iPos === 0 && sValue.indexOf("-") !== -1 && iSel === 0){
                iPos++;
                vdf.sys.dom.setCaretPosition(this.eElement, iPos);
            }
            
            iMaxBefore = this.iDataLength - this.iPrecision;
            
            if(iMaxBefore >= 0 && this.iPrecision >= 0){
                //  Determine separator, numbers before and decimals
                iSeparator = sValue.indexOf(this.sDecimalSeparator);
                iBefore = (iSeparator === -1 ? sValue.length : iSeparator) - (sValue.indexOf("-") === -1 ? 0 : 1);
                iDecimals = (iSeparator === -1 ? 0 : sValue.length - iSeparator - 1);
                
                
                if(iPos <= iSeparator || iSeparator === -1){
                    //  Don't allow to many numbers before (add / move to after decimal separator if we are there and there is room after)
                    if(iBefore >= iMaxBefore){
                        if(iDecimals < this.iPrecision && iSeparator !== -1 && iPos === iSeparator){
                            iPos++;
                            vdf.sys.dom.setCaretPosition(this.eElement, iPos);
                        }else if(iDecimals < this.iPrecision && iSeparator === -1 && iPos === sValue.length){
                            this.eElement.value = sValue + this.sDecimalSeparator;
                        }else{
                            e.stop();
                        }
                    }
                }else if(iDecimals >= this.iPrecision){ //  Don't allow to may decimals!
                    e.stop();
                }
            }
        }else{
            e.stop();
        }
    }
},


//  GLOBAL

/*
Handles the onfocus event when the zero suppress is enabled. It makes sure the 
orrigional value is displayed.

Params:
    e   Event object.
@private
*/
onFocusZeroSuppress : function(e){
    this.bMaskDisplay = false;
    this.eElement.value = this.sMaskOrigValue;
},

/*
Handles the onblur event when zero suppress is enabled. It stores the 
orrigional value and hides the current value if it is zero.

Params:
    e   Event object.
@private    
*/
onBlurZeroSuppress : function(e){
    var nValue;

    this.sMaskOrigValue = this.eElement.value;
    
    //  Parse into number
    nValue = parseFloat(this.eElement.value.replace(this.sThousandsSeparator, "").replace(this.sDecimalSeparator, "."));
    if(isNaN(nValue)){ nValue = 0.0; }
    if(nValue === 0.0){
        this.eElement.value = "";
    }
    this.eElement.value = (this.eElement.value ? this.eElement.value : "");
    this.bMaskDisplay = true;
},

/*
Handles the keypress event when capslock is enabled in IE. It immediately 
uppercases the entered characters.

Params:
    e   Event object.
@private
*/
adjustCapslockIE : function(e){
    //  For IE we can write to the keyCode and so uppercase the character immediately
    e.e.keyCode = String.fromCharCode(e.getCharCode()).toUpperCase().charCodeAt(0);
},

/*
Handles the onkey event and performs the autofind after tabbing out of the 
field.

Params:
    oEvent  Event object.
@private
*/
onAutoFind : function(oEvent){
    var oAction;

    if(oEvent.getKeyCode() == 9 && !oEvent.getShiftKey()){
        if(this.oServerDD && this.sDataBindingType === "D"){
            if(!this.oForm.getDD(this.sTable).hasRecord() || this.getChangedState() || this.isChanged()){
                oAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
                oAction.onFinished.addListener(this.onAfterAutoFind, this);
                this.oServerDD.doFind(vdf.EQ, this, oAction);
            }
        }
    }
},

/*
Handles the onkey event and performs the autofind GE after tabbing out of the 
field.

Params:
    oEvent  Event object.
@private
*/
onAutoFindGE : function(oEvent){
    var oAction;
    
    if(oEvent.getKeyCode() == 9 && !oEvent.getShiftKey()){
        if(this.oServerDD && this.sDataBindingType === "D"){
            if(!this.oForm.getDD(this.sTable).hasRecord() || this.getChangedState() || this.isChanged()){
                oAction = new vdf.core.Action("find", this.oForm, this, this.oServerDD, false);
                oAction.onFinished.addListener(this.onAfterAutoFind, this);
                this.oServerDD.doFind(vdf.GE, this, oAction);
            }
        }
    }
},

/*
Handles the finished event of the autofind action and performs a validate. If 
validation fails it also returns the focus to the field.

Params:
    oEvent  Event object.
@private
*/
onAfterAutoFind : function(oEvent){
    if(this.validate() > 0){
        this.focus();
    }
},

/*
Augments the setValue method with the mask specific functionallity.

@param  sValue          The new value.
@param  bNoNotify       (optional) If true the DD is not updated with this change.
@param  bResetChange    (optional) If true the display changed is cleared.
*/
setValue : function(sValue, bNoNotify, bResetChange){
    var nValue, bSelect = false;
    
    if(this.oForm.oActiveField === this){
        bSelect = (this.eElement.value.length > 0 && vdf.sys.dom.getSelectionLength(this.eElement) > 0);
    }
    
    if(this.bCapslock){
        sValue = sValue.toUpperCase();
    }

    if(this.sMaskType === "win"){
        sValue = this.applyWinMask(sValue);
    }else if(this.sMaskType === "num" || this.sMaskType === "cur"){
        if(this.bMaskDisplay){
            this.sMaskOrigValue = sValue;
            sValue = this.applyNumMask(sValue);
        }
    }else if(this.sMaskType === "dat" || this.sMaskType === "dt"){    
        if(this.bMaskDisplay){
            this.sMaskOrigValue = sValue;
            sValue = this.applyDateMask(sValue);
        }
    }else if(this.bZeroSuppress && this.sDataType === "bcd"){ // Zero suppress
        if(this.bMaskDisplay){
            this.sMaskOrigValue = sValue;
            
            //  Parse into number
            nValue = parseFloat(sValue.replace(this.sThousandsSeparator, "").replace(this.sDecimalSeparator, "."));
            if(isNaN(nValue)){ nValue = 0.0; }
            if(nValue === 0.0){
                sValue = "";
            }
        }
    }
        
    this.Field.prototype.setValue.call(this, sValue, bNoNotify, bResetChange);
    
    if(bSelect){
        vdf.sys.dom.focus(this.eElement, true);
    }
},

/*
Augments the getValue method with the mask specific functionallity.

@return The real field value (which can differ from the displayed value).
*/
getValue : function(){
    var sValue = "";

    if(this.sMaskType === "win"){
        sValue = this.clearWinMask(this.Field.prototype.getValue.call(this));
    }else if(this.sMaskType === "num" || this.sMaskType === "cur"){
        if(this.bMaskDisplay){
            sValue = this.sMaskOrigValue;
        }else{
            sValue = this.Field.prototype.getValue.call(this);
        }
    }else if(this.sMaskType === "num" || this.sMaskType === "cur"){
        if(this.bMaskDisplay){
            sValue = this.sMaskOrigValue;
        }else{
            sValue = this.Field.prototype.getValue.call(this);
        }
    }else if(this.sMaskType === "dat" || this.sMaskType === "dt"){
        if(this.bMaskDisplay){
            sValue = this.sMaskOrigValue;
        }else{
            var dDate = vdf.sys.data.parseStringToDate(this.Field.prototype.getValue.call(this), this.sDateFormat, this.sDateSeparator);
    
            if(dDate === null){
                sValue = "";
            }else{
                sValue = vdf.sys.data.parseDateToString(dDate, this.sDateFormat, this.sDateSeparator);
            }
        }
    }else if(this.bZeroSuppress && this.bMaskDisplay){
        sValue = this.sMaskOrigValue;
    }else{
        sValue = this.Field.prototype.getValue.call(this);
    }
    
    if(this.bCapslock){
        sValue = sValue.toUpperCase();
    }
    
    return sValue;
}


});