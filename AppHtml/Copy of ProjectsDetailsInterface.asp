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

    <form action="none" name="UserProj_form" autocomplete="off" vdfControlType="form" vdfControlName="UserProj_form" vdfMainTable="UserProj" vdfServerTable="UserProj" vdfWebObject="oProjectsDetailsInterface">
        <!-- Status fields -->
        <input type="hidden" name="Company__rowid" value="" />
        <input type="hidden" name="CUSTOMER__rowid" value="" />
        <input type="hidden" name="Project__rowid" value="" />
        <input type="hidden" name="User__rowid" value="" />
        <input type="hidden" name="UserProj__rowid" value="" />

        <table width="100%">
            <tr>
                <td>
                    <h3>ProjectsDetailsInterface</h3>
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
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oProjectsDetailsInterface" vdfLookupTable="User" vdfLookupFields="user__userid, user__loginname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Loginname</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Loginname" title="Loginname." size="20" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oProjectsDetailsInterface" vdfLookupTable="User" vdfLookupFields="user__loginname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Projectid</td>
                                <td>
                                    <input class="Data" type="text" value="" name="Project__Projectid" title="Projectid." size="8" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oProjectsDetailsInterface" vdfLookupTable="Project" vdfLookupFields="project__projectid, project__name" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Name</td>
                                <td class="Data"><input type="text" value="" name="Project__Name" title="Name." size="30" /></td>
                            </tr>
                            <tr>
                                <td class="Label">Customer Name</td>
                                <td>
                                    <input class="Data" type="text" value="" name="Customer__Name" title="Customer Name." size="30" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oProjectsDetailsInterface" vdfLookupTable="CUSTOMER" vdfLookupFields="customer__name, customer__customerid" />
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
