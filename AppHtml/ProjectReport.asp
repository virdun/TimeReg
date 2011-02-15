<!-- #include file="pagetop.inc.asp" -->
<% '
   '  Customer Information Drill Down Report
   '
    Dim MaxRecs, RunReport, Index, StartRowId, SelStart1, SelStop1, EndRowId, iResult
	
    MaxRecs   = 25 ' maximum records per report
    RunReport = (Request("RunReport")<>"")

%>
<html>
<head>
<title>Project Report</title>
<!-- #include file="head.inc.asp" -->
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/report.js"></script>

</head>
<body>
<!-- #include file="bodytop.inc.asp" -->

<table class="ReportStructureTable">
  <tr>
    <td>
        <h3>Project time report</h3>
        <input type="hidden" name="user_id" id="user_id" value="<% response.write oSessionManager.call("GET_getUserId") %>"><br />
        <input type="text" name="customers" id="" value="<% response.write oSessionManager.call("GET_getMyCustomers") %>"><br />
        <input type="text" name="projects" id="" value="<% response.write oSessionManager.call("GET_getMyProjects") %>"><br />
        <% oSessionManager.call("MSG_getMyProjectsDDL") %><br />
        <table>
        <tr><th>Start date: </th><td><input type="text" name="start_date" id="start_date" value="<% response.write date() %>"></td></tr>
        <tr><th>End date: </th><td><input type="text" name="end_date" id="end_date" value="<% response.write date() %>"></td></tr>
        <tr><th></th><td><input type="submit" id="show_stats" value="Run report"></td></tr>
        </table>
        <div id="stats"></div>


	</td>
  </tr>
</table>

<!-- #include file="bodybottom.inc.asp" -->
</body>
</html>
<!-- #include file="pagebottom.inc.asp" -->