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
<title>Event Entry -User Report</title>
<!-- #include file="head.inc.asp" -->
</head>
<body>
<!-- #include file="bodytop.inc.asp" -->

<table class="ReportStructureTable">
  <tr>
    <td>
        <h3>User Information Drill Down Report</h3>
      <% If RunReport then '-------------run the report ------------- %>

        <%
        Index      = request("Index")           ' The last selected Index number
        StartRowId = request("Start")
        SelStart1  = request("SelStart1")
        SelStop1   = request("SelStop1")
        oCustomerReport.call "msg_SetHRefName", "CustomerReportZoom.asp"
        oCustomerReport.call "msg_SetCustomer_Number", SelStart1, SelStop1
        EndRowId = oCustomerReport.call("get_RunCustomerReport", Index, StartRowId, MaxRecs)
        %>
	    <table>
	      <tr>
		    <% If StartRowId <>"" then %>
		    <td style="width: 10px;"><a class="ReportNavigation" href="javascript: history.go(-1);" title="Previous page"><<</a></td>
		    <% end if %>
		    <td style="width: 10px"><span class="ReportNavigation">||</span></td>
		    <% If EndRowId <>"" then %>
            <td style="width: 10px"><a class="ReportNavigation" href="UserReport.asp?RunReport=1&amp;Start=<%=EndRowId%>&amp;Index=<%=Index%>" title="Next page">>></a></td>
            <% end if %>
            <td style="width: 645px" align="right"><a class="ReportNavigation" href="UserReport.asp">New Report</a> </td>
		  </tr>
	    </table>   
      <% else  '-------------set up the report ------------- %>
        
        <form action="UserReport.asp" name="form1" autocomplete="off" method="GET" vdfControlType="form" vdfControlName="customer_form" vdfMainTable="customer" vdfServerTable="customer" vdfWebObject="oCustomer">        
          <blockquote>
            <table border="0">
              <tr>
			    <td class="Label" align="right">User Number: From</td>
			    <td class="Label" ><input type="text" size="6" name="SelStart1" value=""><input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfLookupTable="Customer" vdfWebObject="oCustomer" vdfAttachedFields="SelStart1" vdfLookupFields="customer__customer_number, customer__name, customer__address" /> to:<input type="text" size="6" name="SelStop1" value=""><input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfLookupTable="Customer" vdfWebObject="oCustomer" vdfAttachedFields="SelStop1" vdfLookupFields="customer__customer_number, customer__name, customer__address" /></td>
			  </tr>
			  <tr>
			    <td class="Label" align="right">Report Order</td>
			    <td><% iResult = oUserReport.call("get_CreateFindIndexCombo", "Index", "User", Index) %></td>
			  </tr>
		    </table>
		  </blockquote>
          <p>
		    <input class="ButtonNormal" type="submit" name="RunReport"   value="Run Report">
		    <input class="ButtonNormal" type="reset" value="Reset Form">
		  </p>
	    </form>
      <% end if %>
	</td>
  </tr>
</table>

<!-- #include file="bodybottom.inc.asp" -->
</body>
</html>
<!-- #include file="pagebottom.inc.asp" -->