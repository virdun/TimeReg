/*
Name:
    vdf.lang
Type:
    Library (object)
Revisions:
    2008/01/15  Create the initial version.
*/

/*
The language library contains the functionality that is used by the AJAX Library 
to load any text that is used within the AJAX Library. Examples are the error 
messages, month names and the default title of the lookup dialog. These 
translations are loaded as JSON JavaScript files and are located in the lang 
directory of the AJAX Library with the file name translations_xx.js. The xx is 
replaced with the language short code like "nl" for dutch or "de" for german.

To use a different language as English include the language GET parameter to the 
main include. Then include the language file (after the library includes).
@code
<script type="text/javascript" src="VdfAjaxLib/2-1/vdf/library_full.js?language=nl"></script>

<script type="text/javascript" src="VdfAjaxLib/2-1/vdf/lang/translations_nl.js"></script>
@code
*/
vdf.lang = {

translations : null,

/*
Method used to fetch a translation using the category and the label. An array 
of replacements can be geven to replaced the {{x}} markers in the text. A 
default text can be given for if the translation isn't found.

@param  sCategory       Name of the category (actually the name of a property of 
        the vdf.lang.translations library object).
@param  sLabel          Name of the translation (actually the name of a property 
        of a category object).
@param  aReplacements   Array with replacements values for the {{0}} {{1}} 
        markers in the translations.
@param  sDefault        (optional) Default text, returned if no translation 
        available.
@return The translation, if not available the default text, if not given the 
        string "[ <sCategory> : <sLabel> ]".
*/
getTranslation : function(sCategory, sLabel, sDefault, aReplacements){
    var oCat, sTrans, iRep;
    
    //  Search category
    if(vdf.lang.translations){
        oCat = vdf.lang.translations[sCategory];
        if(typeof(oCat) !== "undefined"){
            //  Search translation
            sTrans = oCat[sLabel];
            if(typeof(sTrans) !== "undefined"){
                
                //  Replace if replacements given
                if(vdf.sys.ref.getType(aReplacements) == "array"){
                    for(iRep = 0; iRep < aReplacements.length; iRep++){
                        sTrans = sTrans.replace("{{" + iRep + "}}", aReplacements[iRep]);
                    }
                }
                
                //  Return result
                return sTrans;
            }
        }
    }else{
        alert("No language loaded!");
    }
    
    //  Return default
    if(typeof(sDefault) == "undefined"){
        return "[ " + sCategory + " : " + sLabel + " ]";
    }else{
        return sDefault;
    }
},

/*
Loads a language by including the JSON-style package that belongs to the given 
language. This package is included using dynamic JavaScript include system of 
the AJAX Library.

@param  sLanguage   Language code ("nl"=dutch, "en"=english, "de"=deutsch, ...).
*/
loadLanguage : function(sLanguage){
    if(vdf.lang["translations_" + sLanguage.toLowerCase()]){
        vdf.lang.translations = vdf.lang["translations_" + sLanguage.toLowerCase()];
    }else{
        vdf.require("vdf.lang.translations_" + sLanguage.toLowerCase(), function(){
            vdf.lang.translations = vdf.lang["translations_" + sLanguage.toLowerCase()];
        });
    }
}

};

if(vdf.getUrlParameter("language")){
    vdf.lang.loadLanguage(vdf.getUrlParameter("language"));
}else{
    vdf.lang.loadLanguage("en");
}

vdf.register("vdf.lang");

