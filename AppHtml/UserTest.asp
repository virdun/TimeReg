<!-- #Include FILE="VdfAjaxLib/2-2/PageTop.inc.asp" -->
<html>
<head>
    <title>AJAX Web Application</title>

    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <meta name="GENERATOR" content="Visual DataFlex Studio">

    <!-- Global stylesheet -->
    <link rel="stylesheet" href="Css/WebApp.css" type="text/css">
    <link rel="stylesheet" media="print" href="Css/Print.css" type="text/css">

    <!-- #include File="VdfAjaxLib/2-2/Includes.inc.asp" -->

</head>

<body>

    <form action="none" name="User_form" autocomplete="off" vdfControlType="form" vdfControlName="User_form" vdfMainTable="User" vdfServerTable="User" vdfWebObject="oUserTest">
        <!-- Status fields -->
        <input type="hidden" name="Company__rowid" value="" />
        <input type="hidden" name="User__rowid" value="" />

        <table width="100%">
            <tr>
                <td>
                    <h3>UserTest</h3>
                </td>
            </tr>
            <tr>
                <td>
                    <!-- Include the toolbar for the Find buttons, etc -->
                    <!-- #Include FILE="VdfAjaxLib/2-2/Toolbar.inc.asp" -->
                </td>
            </tr>
            <tr>
                <td>
                    <div>
                        <table class="EntryTable">
                            <tr>
                                <td class="Label">Userid</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Userid" title="Userid." size="8" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oUserTest" vdfLookupTable="User" vdfLookupFields="user__userid, user__loginname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Loginname</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Loginname" title="Loginname." size="20" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oUserTest" vdfLookupTable="User" vdfLookupFields="user__loginname" />
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
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oUserTest" vdfLookupTable="User" vdfLookupFields="user__firstname, user__lastname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Lastname</td>
                                <td class="Data"><input type="text" value="" name="User__Lastname" title="Lastname." size="50" /></td>
                            </tr>
                            <tr>
                                <td class="Label">Companyid</td>
                                <td>
                                    <input class="Data" type="text" value="" name="Company__Companyid" title="Companyid." size="8" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oUserTest" vdfLookupTable="Company" vdfLookupFields="company__companyid, company__name" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Name</td>
                                <td>
                                    <input class="Data" type="text" value="" name="Company__Name" title="Name." size="20" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oUserTest" vdfLookupTable="Company" vdfLookupFields="company__name" />
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>

    </form>

</body>

</html>
