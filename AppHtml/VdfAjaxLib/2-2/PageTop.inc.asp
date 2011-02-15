<%  
    Option Explicit

    Response.CacheControl = "No-cache"
    
    '   AJAX Library settings 
    Dim sAjaxLanguage, sAjaxTheme, sAjaxLibVersion
    sAjaxTheme = "2-2"      '   Defines the theme that is used (is actually a folder name AppHTML\CSS\VdfAjaxLib)
    sAjaxLanguage = "en"    '   Defines the language that is used (defines which file from AppHTML\VdfAjaxLib\2-2\vdf\lang is used)
    
    Dim sSessionKey, iError, bEditRights
    
    '   Find session key and validate session
    iError = 1
    sSessionKey = Request.Cookies("vdfSessionKey")
    
    If (sSessionKey <> Empty and sSessionKey <> "") Then
        iError = oSessionManager.call("get_ValidateSession", sSessionKey)
    End If
    
    '   Create new session if needed
    If (iError > 0) Then
        sSessionKey = oSessionManager.call("get_CreateSession", Request.ServerVariables("REMOTE_ADDR"))
        Response.Cookies("vdfSessionKey") = sSessionKey
    End If

    '   Determine edit rights
    bEditRights = oSessionManager.call("get_HasRights", sSessionKey, "save", "", "")
    If (Not(bEditRights)) Then
        bEditRights = oSessionManager.call("get_HasRights", sSessionKey, "delete", "", "")
    End If    
    
    '   AJAX LIBRARY 2.2 REQUIRES THE STRICT DOCTYPE!!
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">