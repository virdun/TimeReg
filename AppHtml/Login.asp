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
<title>TimeReg - Login</title>
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

<table width="100%">
  <tr>
    <td id="loginform" <% If(iDisplay <> 1) Then %> style="display: none"<% End If %>>
        <h3>Please login to the system</h3>
        <blockquote>
            <div>
		        You will need to log into the system if you wish to add, edit or delete information.
		        You do not need to log into the system if you wish to view data. This capability
		        is extended to all of our guests.
		    </div>
		</blockquote>
        <blockquote class="Error" id="userlogin__error">
            <div></div>        
        </blockquote>
        <form name="frmUserLogin" class="vdfform" action="none" onsubmit="return sendLogin();">
          <blockquote>
            <table border="0" class="EntryTable">
              <tr>
                <td class="Label">Enter User Name: (<em>hint:</em> Try "John")</td>
                <td><input type="text" size="10" name="LoginName" id="loginname" value=""></td>
              </tr>
              <tr>
                <td class="Label">Enter Password: (<em>hint:</em> Try "John")</td>
                <td><input type="password" size="10" name="Password" value=""></td>
              </tr>
              <tr>
                <td>&nbsp;</td>
                <td id="actions"><input class="ButtonNormal" type="submit" value="Ok"></td>
                <td id="loading" style="display: none;">Loading..</td>
              </tr>
            </table>
		  </blockquote>
        </form>
        
        <br>
        <a href="Register.asp">Register here</a>
	</td>
   </tr>
   <tr id="succesful" style="display: none">
    <td>
        <h3>Login succesful</h3>
        <blockquote>
            <div>
                Welcome, you are successfully logged in to our system. You should now be able to
                manipulate data according to your privileges!
            </div>
        </blockquote>
    </td>
  </tr>
  <tr id="logoutsuccesful" <% If(iDisplay <> 3) Then %> style="display: none"<% End If %>>
    <td>
        <h3>Logout succesful</h3>
        <blockquote>
            <div>
                You have successfully logged out of our system. You can now only view data or 
                <a href="javascript: displayLogin()">login</a> again with another account.
            </div>
        </blockquote>
    </td>
  </tr>
  <tr id="loggedin" <% If(iDisplay <> 2) Then %> style="display: none"<% End If %>>
    <td>
        <h3>Already logged in</h3>
        <blockquote>
            <div>
                You are already logged in and should already be able to manipulate data according 
                to your privileges! You can <a href="login.asp?action=logout">logout</a> and 
                login again with another account.
            </div>
        </blockquote>
    </td>
  </tr>
</table>

<!-- #INCLUDE FILE="bodybottom.inc.asp" -->

</body>
</html>

<!-- #INCLUDE FILE="pagebottom.inc.asp" -->