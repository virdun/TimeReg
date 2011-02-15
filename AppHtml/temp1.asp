<% '
    '  temp1
    '
    Option Explicit ' Force explicit variable declaration.

    ' Declare variables

    Dim MaxRecs, ZoomURL
    Dim RowId, StartRowId, EndRowId
    Dim DebugMode

    ' Initialize Standard Information

    MaxRecs = 50 ' maximum records per report
    ZoomURL = "" ' name of zoom file. If blank none.
    RowId = Request ("RowId") ' if non-zero, only run report for this Id
    StartRowId = Request ("Start") ' if running for all, where to start at
%>

<html>

    <head>
        <meta http-equiv="content-type" content="text/html;charset=iso-8859-1" />
        <meta name="generator" content="Visual DataFlex Studio" />
        <title>temp1</title>
        <link rel="STYLESHEET" href="css/WebApp.css" type="text/css" />
    </head>

    <body topmargin="5" leftmargin="5">

        <!-- #INCLUDE FILE="inc/ddValue_Constants.inc" -->

        <% ' DebugMode = 1 ' uncomment this for page get/post debug help %>
        <!-- #INCLUDE FILE="inc/DebugHelp.inc" -->

        <%
            If RowId <> "" Then
        %>

            <h3>temp1</h3>

            <% 
                otemp1.Call "Msg_SetHRefName", ZoomUrl
            %>
            <%
                EndRowId = otemp1.Call("Get_Runtemp1", RowId)
            %>

            <a href="#" onClick="history.go(-1);return false;">Previous Page</a> &nbsp;

        <%
            Else
        %>
            <h3>temp1</h3>

            <% 
                otemp1.Call "Msg_SetHRefName", ZoomUrl
            %>
            <%
                EndRowId = otemp1.Call("Get_RunAlltemp1", StartRowId, MaxRecs)
            %>

            <%
                If StartRowId <> "" Then
            %>
                <a href="#" onClick="history.go(-1);return false;">Previous Page</a> &nbsp;
            <%
                End If
            %>

            <%
                If EndRowId <> "" Then
            %>
                <a href="temp1.asp?RunReport=1&Start=<%=EndRowId%>">Next Page</a>
            <%
                End If
            %>

        <%
            End If
        %>

    </body>
</html>
