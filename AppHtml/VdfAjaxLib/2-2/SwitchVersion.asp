<%
    Option Explicit

    '   Store the setting
    If Request.ServerVariables("REQUEST_METHOD") = "POST" Then
        If (Request("ajaxlib") = "full") Then 
            Response.cookies("ajaxlib") = "full"
        ElseIf (Request("ajaxlib") = "debug") Then
            Response.cookies("ajaxlib") = "debug"
        Else 
            Response.cookies("ajaxlib") = ""
        End If
        Response.cookies("ajaxlib").Expires = Date() + 5
    End If
    
    Dim sFull, sDebug, sDepl
    If (Request.cookies("ajaxlib") = "full") Then 
        sFull = " checked=""checked"""
    ElseIf (Request.cookies("ajaxlib") = "debug") Then
        sDebug = " checked=""checked"""
    Else 
        sDepl = " checked=""checked"""
    End If
%>
 
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
 
    <title>Visual DataFlex AJAX Library Version Switch</title>
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <meta name="author" content="Data Access Europe B.V.">
 
</head>
<body>
<p>This page can be used to switch between the different AJAX Library deployment 
methods. The value is stored in a cookie and as long as this cookie exists (5 
days) this version of the AJAX Library will be used.</p>

<form action="SwitchVersion.asp" method="post">
<p>
    <input type="radio" name="ajaxlib" value="full"<%=sFull %>/><b>full version</b>. All components in separate JavaScript files. Should only be used during development on fast connections. (arround 1 MB)<br />
    <input type="radio" name="ajaxlib" value="debug"<%=sDebug %>/><b>debug version</b> All components concatenated into a single JavaScript file without multi line comments. Should be used to debug after deployment over slower connections. (arround 600 KB)<br />
    <input type="radio" name="ajaxlib" value=""<%=sDepl %>/><b>deployment version</b> All components concatenated and minified into a single JavaScript file. Should be used after development. (less than 300KB)<br />
</p>
<p>
    <input type="submit" name="store" value="Save"/>
</p>
<form>
</body>
</html>
 

