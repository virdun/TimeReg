<!-- #include FILE="pagetop.inc.asp" -->
<%  
    Dim RowId
    RowId = Request ("RowId") ' If a record Id was passed
%>
<html>
<head>
    <title>AJAX Web Application</title>
        <meta http-equiv="content-type" content="text/html;charset=iso-8859-1" />
        <meta name="generator" content="Visual DataFlex Studio" />
        <title>TimeReport</title>
        <link rel="STYLESHEET" href="css/WebApp.css" type="text/css" />

    <!-- #include FILE="head.inc.asp" -->

</head>

<body topmargin="5" leftmargin="5">
<!-- #include FILE="bodytop.inc.asp" -->
    <form action="none" name="TimeReg_form" autocomplete="off" vdfControlType="form" vdfControlName="TimeReg_form" vdfMainTable="TimeReg" vdfServerTable="TimeReg" vdfWebObject="oHoursEdit">
        <!-- Status fields -->
        <input type="hidden" name="Company__rowid" value="" />
        <input type="hidden" name="CUSTOMER__rowid" value="" />
        <input type="hidden" name="Project__rowid" value="" />
        <input type="hidden" name="User__rowid" value="" />
        <input type="hidden" name="TimeReg__rowid" value="<%=rowid%>" />
        <table width="100%">
            <tr>
                <td>
                    <h3>HoursEdit</h3>
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
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oHoursEdit" vdfLookupTable="CUSTOMER" vdfLookupFields="customer__name, customer__customerid" />
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
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oHoursEdit" vdfLookupTable="User" vdfLookupFields="user__loginname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Start Date</td>
                                <td>
                                    <input class="Data" type="text" value="" name="Timereg__Start_Date" title="Start Date." size="10" />
                                    <input class="CalendarButton" type="button" vdfControlType="PopupCalendar" vdfFieldName="Timereg__Start_Date" title="Pick a date" tabindex="-1" />
                                </td>
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
                            <tr>
                                <td class="Label">Comments</td>
                                <td Class="Data"><textarea name="Timereg__Comments" title="Comments." cols="60" rows="5"></textarea></td>
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