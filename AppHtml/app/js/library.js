//----------------------------------------------
// THIS CODE IS NOT APPROVED FOR USE IN/ON ANY OTHER UI ELEMENT OR PRODUCT COMPONENT. 
// Copyright (c) 2009 Microsoft Corporation. All rights reserved.
//----------------------------------------------

// Library.js
// ==========
var gGadgetMode = (System.Gadget !== undefined);		

// ~*~*~*~*~*~*~*~*~*
// SETTINGS UTILITIES
// ~*~*~*~*~*~*~*~*~*

// saveSetting(string theSettingName, string aSettingValue)
// ========================================================
function saveSetting(theSettingName, aSettingValue) {
 if (gGadgetMode) {	
	System.Gadget.Settings.write(theSettingName, aSettingValue);
	} else {					
		writeCookie(theSettingName,aSettingValue);
	}
}

// readSetting(string theSettingName)
// ==================================
function readSetting(theSettingName) {
	var retVal = "";
 if (gGadgetMode) {	
	retVal = System.Gadget.Settings.read(theSettingName);
	} else {					
		retVal = readCookie(theSettingName);
	}
	return retVal;
}

// writeCookie(string theCookieName, string aCookieValue) 
// ======================================================
function writeCookie(theCookieName, aCookieValue) {
	var theCookieExpirationDate = new Date ();
	theCookieExpirationDate.setYear(theCookieExpirationDate.getYear() + 1);	// Set cookie to expire in 1 year
	theCookieExpirationDate = theCookieExpirationDate.toGMTString ();			// Convert to GMT
	document.cookie = escape(theCookieName) + "=" + escape(aCookieValue) + "; expires=" + theCookieExpirationDate;
}

// readCookie(string theCookieName) 
// ================================
function readCookie(theCookieName) {
	var aCookieValue = "";
	var theCookies = ("" + document.cookie).split("; ");
	for (var i=0; i < theCookies.length; i++)	{
		if (theCookies[i].indexOf("=") > -1) {	// If we have a non-empty cookie
			var aCookieName = theCookies[i].split("=")[0];	// Extract the Cookie Name
			if (aCookieName == theCookieName) {					// if this is the one we're looking for...
				aCookieValue = theCookies[i].split("=")[1]; // Set that as our return value and get out
				break;
			}
		}
	}
	return aCookieValue; 
}


function showOrHide(oHTMLElement, bShowOrHide) {
	if (typeof(oHTMLElement)=="string") { oHTMLElement = document.getElementById(oHTMLElement); }
	if (oHTMLElement && oHTMLElement.style) {
		oHTMLElement.style.display = (bShowOrHide) ? 'block' : 'none';
	}
}

// getLocalizedString(string key) 
// returns localized string provided a value is available in a localized LCID folder
// ============================== 
function getLocalizedString(key) {
 var retVal = key;
 
 try {
	retVal = L_localizedStrings_Text[key];
	if (retVal === undefined) {
		retVal = null;
	}
 } catch (ex) {
 }
 
 return retVal;
}
