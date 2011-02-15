<%  
    Option Explicit

    Response.CacheControl = "No-cache"
    
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
    
    Dim bUserLoggedIn, sLoginName, bValidSession
    '   Get session & login info
    bUserLoggedIn = True
    sLoginName = ""
    bEditRights = True
    
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

    Dim module, view, UserId, regId, ProjectId, comment
    
    module = request.querystring("module")
    view = request.querystring("view")
    '% ><%=view% ><%
    
    
    
    Response.Write(Request.QueryString("callback") & "(")
    
    if module = "User" and view = "ajax_login" then
    
        Dim UserName, UserPass, LoginOk, tmp
    
        ' get posted information
        UserName = request.querystring("username")
        UserPass = request.querystring("password")
        If UserPass<>"" and UserName<>"" then
           ' call VDF Login_User function. Return non-zero of login
           ' is ok.
           '% >(<%=sSessionKey% >, <%=UserName% >, <%=UserPass% >)<br /><%
           LoginOk = oSessionManager.call("Get_UserLogin",sSessionKey,UserName,UserPass)
           tmp = oSessionManager.call("get_FindSessionInfo", sSessionKey)
           UserId  = oSessionManager.DDValue("User.UserId")
        else
           LoginOk = 0
           UserId = 0
        end if
    
        %>{"user_id": <%=UserId%>}<%
        
    end if
    if module = "Project" and view = "project_list" then
        UserId = request.querystring("userid")
        Dim list
        list = oProject.call("Get_getProjectList", UserId)
        ' list = oSessionManager.call("Get_ProjectList", UserId)
        %>
        <%=list%>
        <%
    end if
    if module = "Project" and view = "start" then
        UserId = request.querystring("userid")
        ProjectId = request.querystring("projectid")
        Comment = request.querystring("comment")
        
        regId = oProject.call("Get_startProject", UserId, ProjectId, Comment)
        %>
        <%=regId%>
        <%
    end if
    if module = "Project" and view = "stop" then
        UserId = request.querystring("userid")
        ProjectId = request.querystring("projectid")
        Comment = request.querystring("comment")

        regId = oProject.call("Get_stopProject", UserId, ProjectId, Comment)
        %>
        {"ok": <%=regId%>}
        <%
    end if
    if module = "Project" and view = "has_open" then
        UserId = request.querystring("userid")

        regId = oProject.call("Get_hasOpen", UserId)
        comment = oProject.call("Get_hasOpenComment", UserId)
        %>
        {"has_open" : <%=regId%>, "comment" : "<%=comment%>"}
        <%
    end if
    if module = "Project" and view = "day_report" then
        Dim RepDate, working
        UserId  = request.querystring("userid")
        RepDate = request.querystring("date")
        working = request.querystring("working")
        
        list = oProject.call("Get_dayReport", UserId, RepDate, working)
        %>
        <%=list%>
        <%
    end if

    if module = "Project" and view = "interval_report" then
        Dim startDate, endDate
        UserId  = request.querystring("userid")
        startDate = request.querystring("start_date")
        endDate = request.querystring("end_date")
        
        list = oProject.call("Get_intervalReport", UserId, startDate, endDate)
        %>
        <%=list%>
        <%
    end if
    
    Response.Write(");")
%>