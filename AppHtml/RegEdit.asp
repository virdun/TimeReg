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

    <form action="none" name="TimeReg_form" autocomplete="off" vdfControlType="form" vdfControlName="TimeReg_form" vdfMainTable="TimeReg" vdfServerTable="TimeReg" vdfWebObject="oRegEdit">
        <!-- Status fields -->
        <input type="hidden" name="Company__rowid" value="" />
        <input type="hidden" name="CUSTOMER__rowid" value="" />
        <input type="hidden" name="Project__rowid" value="" />
        <input type="hidden" name="User__rowid" value="" />
        <input type="hidden" name="TimeReg__rowid" value="" />

        <table width="100%">
            <tr>
                <td>
                    <h3>RegEdit</h3>
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
                                <td class="Label">Customer Name</td>
                                <td>
                                    <input class="Data" type="text" value="" name="Customer__Name" title="Customer Name." size="30" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oRegEdit" vdfLookupTable="CUSTOMER" vdfLookupFields="customer__name, customer__customerid" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Name</td>
                                <td class="Data"><input type="text" value="" name="Project__Name" title="Name." size="30" /></td>
                            </tr>
                            <tr>
                                <td class="Label">Loginname</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Loginname" title="Loginname." size="20" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oRegEdit" vdfLookupTable="User" vdfLookupFields="user__loginname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Start Date</td>
                                <td class="Data"><input type="text" value="" name="Timereg__Start_Date" title="Start Date." size="10" /></td>
                            </tr>
                            <tr>
                                <td class="Label">Start Time</td>
                                <td class="Data"><input type="text" value="" name="Timereg__Start_Time" title="Start Time." size="5" /></td>
                            </tr>
                            <tr>
                                <td class="Label">End Date</td>
                                <td class="Data"><input type="text" value="" name="Timereg__End_Date" title="End Date." size="10" /></td>
                            </tr>
                            <tr>
                                <td class="Label">End Time</td>
                                <td class="Data"><input type="text" value="" name="Timereg__End_Time" title="End Time." size="5" /></td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>

    </form>

<!-- #include file="bodybottom.inc.asp" -->
</body>
</html>
<!-- #include file="pagebottom.inc.asp" -->