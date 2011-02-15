<!-- #include file="pagetop.inc.asp" -->
<% '
    ' DayReport (Zoom)
    '
    'Option Explicit

    ' Declare Variables

    Dim DebugMode, Err
    Dim RowId
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

        <h3>DayReport (Zoom)</h3>
        <% 
            RowId = Request("RowId")
            Err = oDayReport.RequestFindByRowId("Timereg", RowId)
        %>

        <table border="0" width="99%" class="ZoomTable">
            <tr>
                <th class="Header" width="20%">Field Name</th>
                <th class="Header">Value</th>
            </tr>
            <tr>
                <th class="Label" width="20%">Customer Name</th>
                <td class="Data">
                    <% = oDayReport.ddValue("Customer.Name") %>
                </td>
            </tr>
            <tr>
                <th class="Label" width="20%">Street Address</th>
                <td class="Data">
                    <% = oDayReport.ddValue("Customer.Address") %>
                </td>
            </tr>
            <tr>
                <th class="Label" width="20%">Zip/Postal Code</th>
                <td class="Data">
                    <% = oDayReport.ddValue("Customer.Zip") %>
                </td>
            </tr>
            <tr>
                <th class="Label" width="20%">City</th>
                <td class="Data">
                    <% = oDayReport.ddValue("Customer.City") %>
                </td>
            </tr>
            <tr>
                <th class="Label" width="20%">Phone Number</th>
                <td class="Data">
                    <% = oDayReport.ddValue("Customer.Phone_Number") %>
                </td>
            </tr>
            <tr>
                <th class="Label" width="20%">E-Mail Address</th>
                <td class="Data">
                    <% = oDayReport.ddValue("Customer.Email_Address") %>
                </td>
            </tr>
        </table>

        <hr />

        <a href="#" onClick="history.go(-1);return false;">Previous Page</a>&nbsp;
        <br />
        <a href="DayReport.asp">New Report</a>


<!-- #include file="bodybottom.inc.asp" -->
</body>
</html>
<!-- #include file="pagebottom.inc.asp" -->