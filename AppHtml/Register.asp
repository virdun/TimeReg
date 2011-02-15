<!-- #include FILE="pagetop.inc.asp" -->
<html>
<head>
    <title>AJAX Web Application</title>

<!-- #include FILE="head.inc.asp" -->
<%
    bUserLoggedIn = True
    bEditRights = True
%>

<script type="text/javascript">

// NOT IN USE AT THE MOMENT

    //
    //  Sends the login request with the loginname, password en sessionkey.
    //
    function sendRegistration(){
        //  Display loading instead of button
        //document.getElementById("actions").style.display = "none";
        document.getElementById("loading").style.display = "";
        
        //  Send the request using the remote method invocation service
        var oVdfCall = new vdf.ajax.VdfCall("oRegister", "get_registerNewUser");
        oVdfCall.bSuppressError = true;
//        oVdfCall.addParameter(vdf.sys.cookie.get("vdfSessionKey"));
        oVdfCall.addParameter(document.User_form.User__Loginname.value);
        oVdfCall.addParameter(document.User_form.User__Password.value);
        oVdfCall.addParameter(document.User_form.User__Firstname.value);
        oVdfCall.addParameter(document.User_form.User__Lastname.value);
        oVdfCall.addParameter(document.User_form.User__Mail.value);
     
        oVdfCall.onFinished.addListener(handleRegistration);
        oVdfCall.send(true);

        //  Return false to cancel the submit
        return false;
    }
    
    //
    //  Handles the registration response. Checks for errors and displays them, if no 
    //  errors it will make sure the welcome message is displayed.
    //
    //  Params:
    //      oEvent    The event object.
    //
    function handleRegistration(oEvent){
        var oVdfCall = oEvent.oSource, sError = null;
        
        if(oVdfCall.aErrors !== null && oVdfCall.aErrors.length > 0){
            sError = "" + oVdfCall.aErrors[0].iNumber + " : " + oVdfCall.aErrors[0].sErrorText;
        }else{
            if(parseInt(oVdfCall.getReturnValue()) > 0){
                sError = "Registration failed, unknown error!";
            }
        }
        
        //  Update the display
        if(sError == null){
            document.getElementById("register__error").innerHTML = "";
            document.getElementById("registration_form").style.display = "none";
            document.getElementById("succesful").style.display = "";
        }else{
            document.getElementById("register__error").innerHTML = sError;
        }
        document.getElementById("loading").style.display = "none";
        //document.getElementById("actions").style.display = "";
    }
    
    //
    //  Displays the loginform and hides the other document parts/
    //
    function displayLogin(){
        document.getElementById("succesful").style.display = "none";
        document.getElementById("registration_form").style.display = "";
    }

</script>

</head>
<body>
<!-- #include FILE="bodytop.inc.asp" -->
<!-- <form action="none" name="User_form" autocomplete="off" class="vdfform" onsubmit="return sendRegistration();"> -->
    <form action="none" name="User_form" autocomplete="off" vdfControlType="form" vdfControlName="User_form" vdfMainTable="User" vdfServerTable="User" vdfWebObject="oRegister">
        <!-- Status fields -->
        <input type="hidden" name="Company__rowid" value="" />
        <input type="hidden" name="User__rowid" value="" />

        <table width="100%">
            <tr>
                <td>
                    <h3>Register</h3>
                </td>
            </tr>
            <tr>
                <td>
                    <!-- Include the toolbar for the Find buttons, etc -->
                    <!-- # I nclude FILE="VdfAjaxLib/2-2/Toolbar.inc.asp" -->
                </td>
            </tr>
            <tr>
                <td>
                    <div>
                        <table class="EntryTable">
                            <tr>
                                <td class="Label">Loginname</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Loginname" title="Loginname." size="20"     />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Password</td>
                                <td class="Data"><input type="text" value="" name="User__Password" title="Password." size="8" /></td>
                            </tr>
                            <tr>
                                <td class="Label">Firstname</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Firstname" title="Firstname." size="50" vdfSuggestSource="find" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Lastname</td>
                                <td class="Data"><input type="text" value="" name="User__Lastname" title="Lastname." size="50" /></td>
                            </tr>
                            <tr>
                                <td class="Label">Mail</td>
                                <td class="Data"><input type="text" value="" name="User__Mail" title="Mail." size="50" /></td>
                            </tr>
                            <tr><td></td>
                            <td style="background: #666666;"><input id="Save" class="NavigationButton" name="save" value="" onclick="vdf.core.findForm(this).doSave();" title="Save (F2)" type="button"></td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>

    </form>

<!-- #INCLUDE FILE="bodybottom.inc.asp" -->

</body>
</html>
<!-- #INCLUDE FILE="pagebottom.inc.asp" -->