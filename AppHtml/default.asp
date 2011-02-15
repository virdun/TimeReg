<!-- #include FILE="pagetop.inc.asp" -->
<%
    Dim iDisplay
    
    '   If get request with action=logout parameter and the user is logged in
    If(Request("REQUEST_METHOD") = "GET" and Request("action") = "logout" and bUserLoggedIn) Then
        
        '   Create new session (Logout creates new session so the activity under
        '   the last account always stays visible in the session table)
        sSessionKey = oSessionManager.call("get_CreateSession", Request.ServerVariables("REMOTE_ADDR"))
        Response.Cookies("vdfSessionKey") = sSessionKey
        
        '   Reset page globals
        bUserLoggedIn = False
        sLoginName = ""
        bEditRights = False
        
        '   Choose display (3 = Logged out) 
        iDisplay = 3
    ElseIf (bUserLoggedIn) Then
        '   Choose display (2 = Already logged in) 
        iDisplay = 2
    Else
        '   Choose display (1 = Login form) 
        iDisplay = 1
    End If
    
    
%>
<html>
<head>
<title>TimeReg system</title>
<!-- #include FILE="head.inc.asp" -->

<link rel="stylesheet" href="Css/Login.css" type="text/css">

<script type="text/javascript">
    //
    //  Sends the login request with the loginname, password en sessionkey.
    //
    function sendLogin(){
        //  Display loading instead of button
        document.getElementById("actions").style.display = "none";
        document.getElementById("loading").style.display = "";
        
        //  Send the request using the remote method invocation service
        var oVdfCall = new vdf.ajax.VdfCall("oSessionManager", "get_UserLogin");
        oVdfCall.bSuppressError = true;
        oVdfCall.addParameter(vdf.sys.cookie.get("vdfSessionKey"));
        oVdfCall.addParameter(document.frmUserLogin.LoginName.value);
        oVdfCall.addParameter(document.frmUserLogin.Password.value);
     
        oVdfCall.onFinished.addListener(handleLogin);
        oVdfCall.send(true);

        //  Return false to cancel the submit
        return false;
    }
    
    //
    //  Handles the login response. Checks for errors and displays them, if no 
    //  errors it will make sure the welcome message is displayed.
    //
    //  Params:
    //      oEvent    The event object.
    //
    function handleLogin(oEvent){
        var oVdfCall = oEvent.oSource, sError = null;
        
        if(oVdfCall.aErrors !== null && oVdfCall.aErrors.length > 0){
            sError = "" + oVdfCall.aErrors[0].iNumber + " : " + oVdfCall.aErrors[0].sErrorText;
        }else{
            if(parseInt(oVdfCall.getReturnValue()) > 0){
                sError = "Login failed, unknown error!";
            }
        }
        
        //  Update the display
        if(sError == null){
            document.getElementById("userlogin__error").innerHTML = "";
            document.getElementById("loginform").style.display = "none";
            document.getElementById("succesful").style.display = "";
            document.getElementById("company-logo").innerHTML = " Logged in as: <b>" + document.frmUserLogin.LoginName.value + '</b> <a href="login.asp?action=logout">[logout]</a>';
        }else{
            document.getElementById("loginname").focus();
            document.getElementById("userlogin__error").innerHTML = sError;
        }
        document.getElementById("loading").style.display = "none";
        document.getElementById("actions").style.display = "";
    }
    
    //
    //  Displays the loginform and hides the other document parts/
    //
    function displayLogin(){
        document.getElementById("succesful").style.display = "none";
        document.getElementById("logoutsuccesful").style.display = "none";
        document.getElementById("loggedin").style.display = "none";
        document.getElementById("loginform").style.display = "";
    }

</script>

</head>

<body<% If(iDisplay = 1) Then %> onload="document.getElementById('loginname').focus();"<% End If %>>

<!-- #include FILE="bodytop.inc.asp" -->


<div>
<h3>TimeReg system</h3>
<p>
Download a gadget of your preference and create an account. And you are ready to register time on your projects.
</p>
<p>
  You can download the gadgets here<br>
  <a href="gadgets/TimeReg.zip">Google Gadget v1.2.003</a><br>
  <a href="gadgets/TimeReg.Gadget.zip">Win7/Vista v1.2.001</a><br>
  <br>
  Or use our mobile app at this location<br>
  <a href="http://timereg.front-it.com/app/">Mobile app v1.2.001</a>
</p>
<p>
  <a href="Register.asp">Register here</a>
</p>
<table>
<tr>
<td valign="top" style="padding: 10px;">
<h4>Google gadget</h4>
<img src="Images/gg_reg.jpg"><br>
<img src="Images/gg_list.jpg">
</td>
<td valign="top"  style="padding: 10px;">
<h4>Windows 7 / Vista gadget</h4>

<img src="Images/wg_reg.jpg"><br>
<img src="Images/wg_list.jpg">
</td>
<td valign="top"  style="padding: 10px;">
<h4>Mobile app</h4>
<img src="Images/mobile_app.jpg"><br>
</td></tr>
</table>
</div>

<!-- #INCLUDE FILE="bodybottom.inc.asp" -->

</body>
</html>

<!-- #INCLUDE FILE="pagebottom.inc.asp" -->