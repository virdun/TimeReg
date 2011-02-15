<!-- #include FILE="pagetop.inc.asp" -->
<% '
    '  TimeReport
    '
    'Option Explicit ' Force explicit variable declaration.

    ' Declare variables

    Dim MaxRecs, ZoomURL, RunReport
    Dim DebugMode, Index
    Dim StartRowId, EndRowId
    Dim SelStart1, SelStop1
    Dim SelStart2, SelStop2
    Dim SelStart3, SelStop3
    Dim SelStart4, SelStop4
    Dim SelStart5, SelStop5
    Dim SelStart6, SelStop6
    Dim SelStart7, SelStop7

    ' Initialize Standard Information

    MaxRecs = 50 ' maximum records per report
    ZoomURL = "hoursedit.asp" ' name of zoom file. If blank none.
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
    <title>AJAX Web Application</title>
        <meta http-equiv="content-type" content="text/html;charset=iso-8859-1" />
        <meta name="generator" content="Visual DataFlex Studio" />
        <title>TimeReport</title>
        <link rel="STYLESHEET" href="css/WebApp.css" type="text/css" />

    <!-- #include FILE="head.inc.asp" -->
</head>
<body topmargin="5" leftmargin="5">
<!-- #include FILE="bodytop.inc.asp" -->


        <!-- #INCLUDE FILE="inc/ddValue_Constants.inc" -->

        <% ' DebugMode = 1 ' uncomment this for page get/post debug help %>
        <!-- #INCLUDE FILE="inc/DebugHelp.inc" -->

        <%
            If RunReport Then '-------------run the report -------------
        %>

            <h3>TimeReport</h3>

            <% 
                StartRowId = Request ("Start")
                SelStart1 = Request ("SelStart1")
                SelStop1 = Request ("SelStop1")
                SelStart2 = Request ("SelStart2")
                SelStop2 = Request ("SelStop2")
                SelStart3 = Request ("SelStart3")
                SelStop3 = Request ("SelStop3")
                SelStart4 = Request ("SelStart4")
                SelStop4 = Request ("SelStop4")
                SelStart5 = Request ("SelStart5")
                SelStop5 = Request ("SelStop5")
                SelStart6 = Request ("SelStart6")
                SelStop6 = Request ("SelStop6")
                SelStart7 = Request ("SelStart7")
                SelStop7 = Request ("SelStop7")

                oTimeReport.Call "Msg_SetHRefName", ZoomUrl
                oTimeReport.Call "Msg_SetCustomer_Name", SelStart1, SelStop1
                oTimeReport.Call "Msg_SetProject_Name", SelStart2, SelStop2
                oTimeReport.Call "Msg_SetUser_Loginname", SelStart3, SelStop3
                oTimeReport.Call "Msg_SetTimereg_Start_Date", SelStart4, SelStop4
                oTimeReport.Call "Msg_SetTimereg_Start_Time", SelStart5, SelStop5
                oTimeReport.Call "Msg_SetTimereg_End_Date", SelStart6, SelStop6
                oTimeReport.Call "Msg_SetTimereg_End_Time", SelStart7, SelStop7

                EndRowId = oTimeReport.Call ("Get_RunTimeReport", Index, StartRowId, MaxRecs)
            %>
            <% If StartRowId <> "" Then %>
                <a href="#" onClick="history.go(-1);return false;">Previous Page</a>&nbsp;
            <% End If %>

            <% If EndRowId <> "" Then %>
                <a href="TimeReport.asp?RunReport=1&Start=<% =EndRowId %>&Index=<% =Index %>&SelStart1=<% =SelStart1 %>&SelStop1=<% =SelStop1 %>&SelStart2=<% =SelStart2 %>&SelStop2=<% =SelStop2 %>&SelStart3=<% =SelStart3 %>&SelStop3=<% =SelStop3 %>&SelStart4=<% =SelStart4 %>&SelStop4=<% =SelStop4 %>&SelStart5=<% =SelStart5 %>&SelStop5=<% =SelStop5 %>&SelStart6=<% =SelStart6 %>&SelStop6=<% =SelStop6 %>&SelStart7=<% =SelStart7 %>&SelStop7=<% =SelStop7 %>">Next Page</a>
            <% End If %>

            <br />
            <a href="TimeReport.asp">New Report</a>

        <% Else  '-------------set up the report ------------- %>

            <h3>TimeReport</h3>

            <form action="TimeReport.asp" method="get">
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
                            <td class="Label" align="left">Start Date:</td>
                            <td class="Label" align="right">from:</td>
                            <td>
                                <input type="text" size="6" name="SelStart4" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td class="Label" align="right">to:</td>
                            <td>
                                <input type="text" size="6" name="SelStop4" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td class="Label" align="left">Start Time:</td>
                            <td class="Label" align="right">from:</td>
                            <td>
                                <input type="text" size="5" name="SelStart5" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td class="Label" align="right">to:</td>
                            <td>
                                <input type="text" size="5" name="SelStop5" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td class="Label" align="left">End Date:</td>
                            <td class="Label" align="right">from:</td>
                            <td>
                                <input type="text" size="6" name="SelStart6" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td class="Label" align="right">to:</td>
                            <td>
                                <input type="text" size="6" name="SelStop6" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td class="Label" align="left">End Time:</td>
                            <td class="Label" align="right">from:</td>
                            <td>
                                <input type="text" size="5" name="SelStart7" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td class="Label" align="right">to:</td>
                            <td>
                                <input type="text" size="5" name="SelStop7" value="" />
                            </td>
                        </tr>
                        <tr>
                            <td class="Label" align="right">Report Order</td>
                            <td>&nbsp;</td>
                            <td>
                                <select size="1" name="Index">
                                    <option value="1" <% =ShowSelected(Index,1) %> >Userid</option>
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