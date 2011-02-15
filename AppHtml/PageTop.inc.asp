<!-- #include File="VdfAjaxLib/2-2/pagetop.inc.asp" -->
<%

    Dim bUserLoggedIn, sLoginName, bValidSession
'    
'    '   Get session & login info
    bUserLoggedIn = True
    sLoginName = ""
    bEditRights = True
'   
    bValidSession = (oSessionManager.call("get_FindSessionInfo", sSessionKey) <> 0)
    If (bValidSession) Then
        bUserLoggedIn = (oSessionManager.DDValue("User.UserId") <> "0")
        sLoginName = oSessionManager.DDValue("User.LoginName")
        bEditRights = (oSessionManager.DDValue("User.EditRights") = "Y")
    Else
        bUserLoggedIn = False
        sLoginName = ""
        bEditRights = False
    End If
      
%>

