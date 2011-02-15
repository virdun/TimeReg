<!-- #include FILE="pagetop.inc.asp" -->
<html>
<% '
    Dim MaxRecs, ZoomURL, RunReport
    Dim DebugMode, Index
    Dim StartRowId, EndRowId
    Dim SelCustomer
    Dim UserStart, UserStop
    Dim ProjStart, ProjStop
    Dim StartDate, StopDate
    Dim SelStart1, SelStop1
    Dim SelStart2, SelStop2
    Dim SelStart3, SelStop3
    Dim SelStart4, SelStop4
    Dim SelStart5, SelStop5
    Dim SelStart6, SelStop6
    Dim SelStart7, SelStop7

    MaxRecs = 50 ' maximum records per report
    ZoomURL = "hoursedit.asp" ' name of zoom file. If blank none.
    RunReport = (Request ("RunReport") <> "")
    Index = Request ("Index")' The last selected Index number

%>
<head>
    <title>AJAX Web Application</title>

    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
    <meta name="GENERATOR" content="Visual DataFlex Studio">

    <!-- Global stylesheet -->
    <link rel="stylesheet" href="Css/WebApp.css" type="text/css">
    <link rel="stylesheet" media="print" href="Css/Print.css" type="text/css">

    <!-- #include File="VdfAjaxLib/2-2/Includes.inc.asp" -->

    <!-- #include FILE="head.inc.asp" -->
</head>

<body>
<!-- #include FILE="bodytop.inc.asp" -->
        <%
            If RunReport Then '-------------run the report -------------
        %>

            <h3>Project report</h3>

            <% 
                StartRowId = Request ("Start")
                SelCustomer = Request ("customer__Name")
                UserStart = Request ("User__Userid")
                UserStop = Request ("User__Userid")
                ProjStart = Request ("Project__Projectid")
                ProjStop = Request ("Project__Projectid")
                StartDate = Request ("SelStartDate")
                StopDate = Request ("SelStopDate")
                SelStart4 = Request ("SelStart4")
                SelStop4 = Request ("SelStop4")
                SelStart5 = Request ("SelStart5")
                SelStop5 = Request ("SelStop5")
                SelStart6 = Request ("SelStart6")
                SelStop6 = Request ("SelStop6")
                SelStart7 = Request ("SelStart7")
                SelStop7 = Request ("SelStop7")

                oTimeReport.Call "Msg_SetHRefName", ZoomUrl
                oTimeReport.Call "Msg_SetCustomer_Name", SelCustomer, SelCustomer
                oTimeReport.Call "Msg_SetProject_ID", ProjStart, ProjStop
                oTimeReport.Call "Msg_SetUser_LoginID", UserStart, UserStop
                oTimeReport.Call "Msg_SetTimereg_Start_Date", StartDate, StopDate
 '               oTimeReport.Call "Msg_SetTimereg_Start_Time", SelStart5, SelStop5
 '               oTimeReport.Call "Msg_SetTimereg_End_Date", SelStart6, SelStop6
 '               oTimeReport.Call "Msg_SetTimereg_End_Time", SelStart7, SelStop7

                EndRowId = oTimeReport.Call ("Get_RunTimeReport", Index, StartRowId, MaxRecs)
            %>
            <% If StartRowId <> "" Then %>
                <a href="#" onClick="history.go(-1);return false;">Previous Page</a>&nbsp;
            <% End If %>

            <% If EndRowId <> "" Then %>
                <a href="TimeReport.asp?RunReport=1&Start=<% =EndRowId %>&Index=<% =Index %>&SelStart1=<% =SelStart1 %>&SelStop1=<% =SelStop1 %>&SelStart2=<% =SelStart2 %>&SelStop2=<% =SelStop2 %>&SelStart3=<% =SelStart3 %>&SelStop3=<% =SelStop3 %>&SelStart4=<% =SelStart4 %>&SelStop4=<% =SelStop4 %>&SelStart5=<% =SelStart5 %>&SelStop5=<% =SelStop5 %>&SelStart6=<% =SelStart6 %>&SelStop6=<% =SelStop6 %>&SelStart7=<% =SelStart7 %>&SelStop7=<% =SelStop7 %>">Next Page</a>
            <% End If %>

            <br />
            <a href="ProjectsDetailsInterface.asp">New Report</a>

        <% Else  '-------------set up the report ------------- %>

    <form action="" name="UserProj_form" autocomplete="off" vdfControlType="form" vdfControlName="UserProj_form" vdfMainTable="UserProj" vdfServerTable="UserProj" vdfWebObject="oProjectsDetailsInterface">
        <!-- Status fields -->
        <input type="hidden" name="Company__rowid" value="" />
        <input type="hidden" name="CUSTOMER__rowid" value="" />
        <input type="hidden" name="Project__rowid" value="" />
        <input type="hidden" name="User__rowid" value="" />
        <input type="hidden" name="UserProj__rowid" value="" />

        <table width="100%">
            <tr>
                <td>
                    <h3>Project Report</h3>
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
                                <td colspan="3">
                                    <input class="Data" type="text" value="" name="Customer__Name" title="Customer Name." size="51" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oProjectsDetailsInterface" vdfLookupTable="CUSTOMER" vdfLookupFields="customer__name, customer__customerid" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Projectid</td>
                                <td>
                                    <input class="Data" type="text" value="" name="Project__Projectid" title="Projectid." size="5" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oProjectsDetailsInterface" vdfLookupTable="Project" vdfLookupFields="project__projectid, project__name" />
                                </td>
                                <td class="Label">Name</td>
                                <td class="Data"><input type="text" value="" name="Project__Name" title="Name." size="20" /></td>
                            </tr>

                            <tr>
                                <td class="Label">Userid</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Userid" title="Userid." size="8" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oProjectsDetailsInterface" vdfLookupTable="User" vdfLookupFields="user__userid, user__loginname" />
                                </td>
                                <td class="Label">Loginname</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Loginname" title="Loginname." size="20" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oProjectsDetailsInterface" vdfLookupTable="User" vdfLookupFields="user__loginname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label" align="left">Start Date:</td>
                                <td>
                                    <input type="text" size="10" name="SelStartDate" value="" />
                                    <input class="CalendarButton" type="button" vdfControlType="PopupCalendar" vdfFieldName="SelstartDate" title="Pick a date" tabindex="-1" />
                                </td>                           
                                <td class="Label" align="left">End Date:</td>
                                <td>
                                    <input type="text" size="10" name="SelStopDate" value="" />
                                    <input class="CalendarButton" type="button" vdfControlType="PopupCalendar" vdfFieldName="SelstopDate" title="Pick a date" tabindex="-1" />
                                </td>
                            </tr>
                        
                        </table>
                    </div>
                </td>
            </tr>
        </table>
        <p>
            <input class="ActionButton" type="submit" name="RunReport" value="Run Report" />
            <input class="ActionButton" type="reset" value="Reset Form" />
        </p>

    </form>
        <% End If %>

<!-- #include file="bodybottom.inc.asp" -->
</body>
</html>
<!-- #include file="pagebottom.inc.asp" -->