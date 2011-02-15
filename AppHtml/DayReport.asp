<!-- #include file="pagetop.inc.asp" -->
<% '
    '  DayReport
    '
    'Option Explicit ' Force explicit variable declaration.

    ' Declare variables

    Dim MaxRecs, ZoomURL, RunReport
    Dim DebugMode, Index
    Dim StartRowId, EndRowId
    Dim SelStart1, SelStop1
    Dim SelStart2, SelStop2
    Dim SelStart3, SelStop3

    ' Initialize Standard Information

    MaxRecs = 50 ' maximum records per report
    ZoomURL = "RegEdit.asp" '"DayReportZoom.asp" ' name of zoom file. If blank none.
    RunReport = (Request ("RunReport") <> "")
    Index = Request ("Index")' The last selected Index number

    ' Create function To return selected String for design time find Index
    Function ShowSelected (Index , Item)
        If CStr (Index) = CStr (Item) Then 
            ShowSelected = "selected=""selected"""
        Else
            ShowSelected = ""
        End If
    End Function


%>

<html>
<head>
<title>Work Hour Time Tracker - Customer Report</title>
<!-- #include file="head.inc.asp" -->
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/report.js"></script>

</head>
<body>
<!-- #include file="bodytop.inc.asp" -->

        <!-- #INCLUDE FILE="inc/ddValue_Constants.inc" -->

        <% ' DebugMode = 1 ' uncomment this for page get/post debug help %>
        <!-- #INCLUDE FILE="inc/DebugHelp.inc" -->

        <%
            If RunReport Then '-------------run the report -------------
        %>

            <h3>DayReport</h3>

            <% 
                StartRowId = Request ("Start")
                SelStart1 = Request ("SelStart1")
                SelStop1 = Request ("SelStop1")
                SelStart2 = Request ("SelStart2")
                SelStop2 = Request ("SelStop2")
                SelStart3 = Request ("SelStart3")
                SelStop3 = Request ("SelStop3")

                oDayReport.Call "Msg_SetHRefName", ZoomUrl
                oDayReport.Call "Msg_SetCustomer_Name", SelStart1, SelStop1
                oDayReport.Call "Msg_SetProject_Name", SelStart2, SelStop2
                oDayReport.Call "Msg_SetUser_Loginname", SelStart3, SelStop3

                EndRowId = oDayReport.Call ("Get_RunDayReport", Index, StartRowId, MaxRecs)
            %>
            <% If StartRowId <> "" Then %>
                <a href="#" onClick="history.go(-1);return false;">Previous Page</a>&nbsp;
            <% End If %>

            <% If EndRowId <> "" Then %>
                <a href="DayReport.asp?RunReport=1&Start=<% =EndRowId %>&Index=<% =Index %>&SelStart1=<% =SelStart1 %>&SelStop1=<% =SelStop1 %>&SelStart2=<% =SelStart2 %>&SelStop2=<% =SelStop2 %>&SelStart3=<% =SelStart3 %>&SelStop3=<% =SelStop3 %>">Next Page</a>
            <% End If %>

            <br />
            <a href="DayReport.asp">New Report</a>

        <% Else  '-------------set up the report ------------- %>

            <h3>DayReport</h3>

            <form action="DayReport.asp" method="get">
                <blockquote>

                    <table border="0">
                        <tr>
                            <td class="Label" align="left">Customer Name:</td>
                            <td class="Label" align="right">from:</td>
                            <td>
                                <input type="text" size="30" name="SelStart1" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td class="Label" align="right">to:</td>
                            <td>
                                <input type="text" size="30" name="SelStop1" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td class="Label" align="left">Name:</td>
                            <td class="Label" align="right">from:</td>
                            <td>
                                <input type="text" size="30" name="SelStart2" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td class="Label" align="right">to:</td>
                            <td>
                                <input type="text" size="30" name="SelStop2" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td class="Label" align="left">Loginname:</td>
                            <td class="Label" align="right">from:</td>
                            <td>
                                <input type="text" size="20" name="SelStart3" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td class="Label" align="right">to:</td>
                            <td>
                                <input type="text" size="20" name="SelStop3" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td class="Label" align="right">Report Order</td>
                            <td>&nbsp;</td>
                            <td>
                                <select size="1" name="Index">
                                    <option value="1" <% =ShowSelected(Index,1) %> >Userid</option>
                                    <option value="3" <% =ShowSelected(Index,3) %> >Projectid</option>
                                    <option value="2" <% =ShowSelected(Index,2) %> >Start Date</option>
                                </select>
                            </td>
                        </tr>
                    </table>

                </blockquote>

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