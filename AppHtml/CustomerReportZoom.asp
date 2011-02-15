<!-- #include file="pagetop.inc.asp" -->
<% '
   '  Customer Information Drill Down Report (Zoom)
   '
   Dim RowID, iErr, EndRowId
   
   RowID = Request("RowId")
%>

<html>
<head>
<title>Work Hour Time Tracker - Customer Report Zoom</title>
<!-- #include file="head.inc.asp" -->
</head>

<body>
<!-- #include file="bodytop.inc.asp" -->
<form action="none" autocomplete="off" vdfControlType="form" vdfControlName="customer_form" vdfMainTable="customer" vdfServerTable="customer" vdfWebObject="oCustomer" vdfAttachVdfKeyActions="false">

    <!-- Status fields -->
    <div style="display: none;">
        <input type="hidden" size="15" name="customer__rowid" value="<%=RowId%>" />
        <input type="hidden" size="15" name="salesp__rowid" value="" />
        <input type="hidden" size="15" name="orderhea__rowid" id="orderhea__rowid" value="" />
    </div>
    
    <table class="ReportStructureTable">
      <tr>
        <td>
          <h3>Customer Information Drill Down Report (Zoom)</h3>
        </td>
      </tr>
      <tr>
        <td>
          &nbsp;
        </td>
      </tr>
      <tr>
        <td>
          <table border="0" class="ZoomTable">
            <tr>
              <td class="Label" width="20%">Customer Number</td>
              <td class="Data" vdfDataBinding="customer__customer_number"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Customer Name</td>
              <td class="Data" vdfDataBinding="customer__name"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Active Status</td>
              <td class="Data" vdfDataBinding="customer__status" vdfUseDescriptionValue="true"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Street Address</td>
              <td class="Data" vdfDataBinding="customer__address"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">City</td>
              <td class="Data" vdfDataBinding="customer__city"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">State</td>
              <td class="Data" vdfDataBinding="customer__state" vdfUseDescriptionValue="true"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Zip/Postal Code</td>
              <td class="Data" vdfDataBinding="customer__zip"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Phone Number</td>
              <td class="Data" vdfDataBinding="customer__phone_number"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Fax Number</td>
              <td class="Data" vdfDataBinding="customer__fax_number"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">E-Mail Address</td>
              <td class="Data" vdfDataBinding="customer__email_address"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Credit Limit</td>
              <td class="Data" vdfDataBinding="customer__credit_limit"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Total Purchases</td>
              <td class="Data" vdfDataBinding="customer__purchases"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Balance Due</td>
              <td class="Data" vdfDataBinding="customer__balance"></td>
            </tr>
            <tr>
              <td class="Label" width="20%">Comments</td>
              <td class="Data" vdfDataBinding="customer__comments"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
</form>

<!-- #include file="bodybottom.inc.asp" -->
</body>
</html>

<!-- #include file="pagebottom.inc.asp" -->