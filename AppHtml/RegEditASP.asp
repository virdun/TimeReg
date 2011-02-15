<!-- #include FILE="pagetop.inc.asp" -->
<% '
    '  RegEditASP
    '
'    Option Explicit ' Force explicit variable declaration.

    ' Declare variables

    Dim Index, RunReport
    Dim RowId
    Dim CheckFieldChange, DebugMode, FieldError

    ' Initialize Standard Information

    Index = Request("Index") ' The last selected Index number
    RowId = Request ("RowId") ' If a record Id was passed
    RunReport = (Request ("RunReport")<>"") ' If run report was selected
%>

<html>
<head>
    <title>AJAX Web Application</title>
        <meta http-equiv="content-type" content="text/html;charset=iso-8859-1" />
        <meta name="generator" content="Visual DataFlex Studio" />
        <title>RegEditASP</title>
        <link rel="STYLESHEET" href="css/WebApp.css" type="text/css" />

    <!-- #include FILE="head.inc.asp" -->
</head>
<body topmargin="5" leftmargin="5">
<!-- #include FILE="bodytop.inc.asp" -->


        <% CheckFieldChange=oRegEditASP.Call("Get_peFieldMultiUser") %>
        <!-- #INCLUDE FILE="inc/SetChangedStates-script.inc" -->

        <!-- #INCLUDE FILE="inc/ddValue_Constants.inc" -->

        <% ' DebugMode = 1 ' uncomment this for page get/post debug help %>
        <!-- #INCLUDE FILE="inc/DebugHelp.inc" -->

        <h3>RegEditASP</h3>

        <% 
            oRegEditASP.Call "Set_pbReportErrors", 1 'Normally show any errors that occur
            'We either find a record, or clear the WBO
            If RowId <> "" Then
                Err = oRegEditASP.RequestFindbyRowId( "Timereg", RowId)
            Else 
                Err = oRegEditASP.RequestClear("Timereg",1)
            End If

            ' process various buttons that might have been pressed.
            ' only support Post submissions
            If Request ("Request_Method") = "POST" Then

                If Request ("Clear") <> "" Then
                    Err = oRegEditASP.RequestClear("Timereg",1)
                End If

                If Request ("Save") <> "" then
                    oRegEditASP.Call "Set_pbReportErrors", 0
                    Err = oRegEditASP.RequestSave("Timereg")
                    If Err = 0 Then
                        Response.Write("<center><h4>Timereg Record Saved</h4> </center>")
                    Else
                        Response.Write("<font color=""red"">")
                        Response.Write("<center><h4>Could not save changes. Errors Occurred</h4> </center>")
                        oRegEditASP.Call "Msg_ReportAllErrors"
                        Response.Write("</font>")
                    End If
                End If

                If Request("Delete") <> "" Then
                    oRegEditASP.Call "Set_pbReportErrors", 0
                    Err = oRegEditASP.RequestDelete("Timereg")
                    If Err = 0 Then
                        Response.Write("<center><h4>The record has been deleted.</h4></center>")
                    Else
                        Response.Write("<font color=""red"">")
                        Response.Write("<center><h4>The record could not be deleted.</h4></center>")
                        oRegEditASP.Call "Msg_ReportAllErrors"
                        Response.Write("</font>")
                    End If
                End If

                ' note we use the Index variable we created above
                If Request("FindPrev") <> "" Then Err = oRegEditASP.RequestFind("Timereg", Index, LT)
                If Request("Find") <> "" Then Err = oRegEditASP.RequestFind("Timereg", Index, GE)
                If Request("FindNext") <> "" Then  Err = oRegEditASP.RequestFind("Timereg", Index, GT)
                If Request("FindFirst") <> "" Then  Err = oRegEditASP.RequestFind("Timereg", Index, FIRST_RECORD)
                If Request("FindLast") <> "" Then Err = oRegEditASP.RequestFind("Timereg", Index, LAST_RECORD)

            End If

            ' Create function To return selected String for design time find Index
            Function ShowSelected (Index , Item)
                If CStr (Index) = CStr (Item) Then 
                    ShowSelected = "selected=""selected"""
                Else
                    ShowSelected = ""
                End If
            End Function

        %>

        <form action="RegEditASP.asp" method="post" name="Timereg" OnSubmit="SetChangedStates(this)">

            <% ' You MUST have a hidden Rowid field for each DDO in your WBO %>
            <input type="hidden" size="15" name="Company__Rowid" value="<% =oRegEditASP.DDValue("Company.Rowid") %>" />
            <input type="hidden" size="15" name="Customer__Rowid" value="<% =oRegEditASP.DDValue("Customer.Rowid") %>" />
            <input type="hidden" size="15" name="Project__Rowid" value="<% =oRegEditASP.DDValue("Project.Rowid") %>" />
            <input type="hidden" size="15" name="User__Rowid" value="<% =oRegEditASP.DDValue("User.Rowid") %>" />
            <input type="hidden" size="15" name="Timereg__Rowid" value="<% =oRegEditASP.DDValue("Timereg.Rowid") %>" />

            <% ' This is needed if you need field level change state checking %>
            <input type="hidden" name="ChangedStates" value="" />

            <p class="Toolbar">
                Find 
                <input class="ActionButton" type="submit" name="FindFirst" value="&lt;&lt;" />
                <input class="ActionButton" type="submit" name="FindPrev" value="&lt;" />
                <input class="ActionButton" type="submit" name="Find" value="=" />
                <input class="ActionButton" type="submit" name="FindNext" value="&gt;" />
                <input class="ActionButton" type="submit" name="FindLast" value="&gt;&gt;" />
                <input class="ActionButton" type="submit" name="RunReport" value="List" />
                 By 
                <select size="1" name="Index">
                    <option value="1" <% =ShowSelected(Index,1) %> >Userid</option>
                    <option value="2" <% =ShowSelected(Index,2) %> >Start Date</option>
                </select>

            &nbsp;&nbsp;
                <input class="ActionButton" type="submit" name="Save" value="Save" />
                <input class="ActionButton" type="submit" name="Delete" value="Delete" />
                <input class="ActionButton" type="submit" name="Clear" value="Clear" />
            </p>

            <blockquote class="EntryBlock">

                <table border="0" class="EntryTable">
                    <tr>
                        <% FieldError=oRegEditASP.DDValue("Customer.Name", DDFIELDERROR) %>
                        <td class="Label">
                            <% If FieldError <> "" Then Response.Write ("<font color=""red"">") %>
                            Customer Name
                            <% If FieldError <> "" Then Response.Write ("</font>") %>
                        </td>
                        <td class="Data">
                            <input type="text" size="30" title="" name="Customer__Name" value="<% =oRegEditASP.DDValue("Customer.Name") %>" />
                        </td>
                        <% If FieldError <> "" Then %>
                            <td class="Error">
                                <% =FieldError %>
                            </td>
                        <% End If %>
                    </tr>
                    <tr>
                        <% FieldError=oRegEditASP.DDValue("Project.Name", DDFIELDERROR) %>
                        <td class="Label">
                            <% If FieldError <> "" Then Response.Write ("<font color=""red"">") %>
                            Name
                            <% If FieldError <> "" Then Response.Write ("</font>") %>
                        </td>
                        <td class="Data">
                            <input type="text" size="30" title="" name="Project__Name" value="<% =oRegEditASP.DDValue("Project.Name") %>" />
                        </td>
                        <% If FieldError <> "" Then %>
                            <td class="Error">
                                <% =FieldError %>
                            </td>
                        <% End If %>
                    </tr>
                    <tr>
                        <% FieldError=oRegEditASP.DDValue("User.Loginname", DDFIELDERROR) %>
                        <td class="Label">
                            <% If FieldError <> "" Then Response.Write ("<font color=""red"">") %>
                            Loginname
                            <% If FieldError <> "" Then Response.Write ("</font>") %>
                        </td>
                        <td class="Data">
                            <input type="text" size="20" title="" name="User__Loginname" value="<% =oRegEditASP.DDValue("User.Loginname") %>" />
                        </td>
                        <% If FieldError <> "" Then %>
                            <td class="Error">
                                <% =FieldError %>
                            </td>
                        <% End If %>
                    </tr>
                    <tr>
                        <% FieldError=oRegEditASP.DDValue("Timereg.Start_Date", DDFIELDERROR) %>
                        <td class="Label">
                            <% If FieldError <> "" Then Response.Write ("<font color=""red"">") %>
                            Start Date
                            <% If FieldError <> "" Then Response.Write ("</font>") %>
                        </td>
                        <td class="Data">
                            <input type="text" size="6" title="" name="Timereg__Start_Date" value="<% =oRegEditASP.DDValue("Timereg.Start_Date") %>" />
                        </td>
                        <% If FieldError <> "" Then %>
                            <td class="Error">
                                <% =FieldError %>
                            </td>
                        <% End If %>
                    </tr>
                    <tr>
                        <% FieldError=oRegEditASP.DDValue("Timereg.Start_Time", DDFIELDERROR) %>
                        <td class="Label">
                            <% If FieldError <> "" Then Response.Write ("<font color=""red"">") %>
                            Start Time
                            <% If FieldError <> "" Then Response.Write ("</font>") %>
                        </td>
                        <td class="Data">
                            <input type="text" size="5" title="" name="Timereg__Start_Time" value="<% =oRegEditASP.DDValue("Timereg.Start_Time") %>" />
                        </td>
                        <% If FieldError <> "" Then %>
                            <td class="Error">
                                <% =FieldError %>
                            </td>
                        <% End If %>
                    </tr>
                    <tr>
                        <% FieldError=oRegEditASP.DDValue("Timereg.End_Date", DDFIELDERROR) %>
                        <td class="Label">
                            <% If FieldError <> "" Then Response.Write ("<font color=""red"">") %>
                            End Date
                            <% If FieldError <> "" Then Response.Write ("</font>") %>
                        </td>
                        <td class="Data">
                            <input type="text" size="6" title="" name="Timereg__End_Date" value="<% =oRegEditASP.DDValue("Timereg.End_Date") %>" />
                        </td>
                        <% If FieldError <> "" Then %>
                            <td class="Error">
                                <% =FieldError %>
                            </td>
                        <% End If %>
                    </tr>
                    <tr>
                        <% FieldError=oRegEditASP.DDValue("Timereg.End_Time", DDFIELDERROR) %>
                        <td class="Label">
                            <% If FieldError <> "" Then Response.Write ("<font color=""red"">") %>
                            End Time
                            <% If FieldError <> "" Then Response.Write ("</font>") %>
                        </td>
                        <td class="Data">
                            <input type="text" size="5" title="" name="Timereg__End_Time" value="<% =oRegEditASP.DDValue("Timereg.End_Time") %>" />
                        </td>
                        <% If FieldError <> "" Then %>
                            <td class="Error">
                                <% =FieldError %>
                            </td>
                        <% End If %>
                    </tr>
                </table>

            </blockquote>

        </form>

        <hr />

        <a href="#" onClick="history.go(-1);return false;">Previous Page</a>&nbsp;
        <br />
        <a href="DayReport.asp">New Report</a>



<!-- #include file="bodybottom.inc.asp" -->
</body>
</html>
<!-- #include file="pagebottom.inc.asp" -->