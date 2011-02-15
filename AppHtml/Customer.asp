<!-- #include FILE="pagetop.inc.asp" -->
<html>
<head>
<title>Work Hour Time Tracker - Customer</title>

<!-- #include FILE="head.inc.asp" -->

</head>

<body>
<!-- #include FILE="bodytop.inc.asp" -->
<form action="none" name="form1" autocomplete="off" vdfControlType="form" vdfControlName="customer_form" vdfMainTable="customer" vdfServerTable="customer" vdfWebObject="oCustomer">
<!-- Status fields -->
<input type="hidden" name="customer__rowid" value="" />

<table width="100%">
    <tr>
        <td>
            <% if (bEditRights) then %>
                <h3>Customer Entry and Maintenance</h3>
            <% else %>
                <h3>Customer Query</h3>
            <% end if %>
        </td>
    </tr>
    <tr>
        <td>
<!-- #INCLUDE FILE="toolbar.inc.asp" -->
        </td>
    </tr>
        <tr>
        <td>
            <div>
                <table class="EntryTable">
                    <tr>
                        <td class="Label">Customer Number</td>
                        <td class="Data">
                            <input type="text" value="0" name="customer__CustomerId" size="6" />
                            <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfLookupTable="Customer" vdfWebObject="oCustomer" vdfLookupFields="customer__CustomerId, customer__name, customer__address" />
                        </td>
                    </tr>
                    <tr>
                        <td class="Label">Customer Name</td>
                        <td class="Data"><input type="text" value="" name="customer__name" size="30" vdfSuggestSource="find" /></td>
                    </tr>
               </table>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <table cellpadding="0" cellspacing="0" vdfControlType="tabcontainer">
                <tr>
                    <td vdfElement="header">
                        <div>
                            <ul>
                                <li vdfTabName="address"><a href="javascript: vdf.sys.nothing();">Address</a></li>
                                <li vdfTabName="balances"><a href="javascript: vdf.sys.nothing();">Balances</a></li>
                                <li vdfTabName="comments"><a href="javascript: vdf.sys.nothing();">Comments</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td vdfElement="container" class="container">
                        <div vdfTabName="address">
                            <table class="EntryTable">
                                <tr>
                                    <td class="Label">Street Address</td>
                                    <td class="Data"><input type="text" value="" name="customer__address" size="30" /></td>
                                </tr>
                                <tr>
                                    <td class="Label">Active Status</td>
                                    <td class="Data"> <input checked="checked" name="customer__status" value="Y" type="radio">Active <input class="ascii_data" name="customer__status" value="N" type="radio">Inactive</td>
                                </tr>
                                <tr>
                                    <td class="Label">City</td>
                                    <td class="Data"><input type="text" value="" name="customer__city" size="14" /></td>
                                </tr>
                                <tr>
                                    <td class="Label">Zip/Postal Code</td>
                                    <td class="Data"><input type="text" value="" name="customer__zip" size="10"/></td>
                                </tr>
                                <tr>
                                    <td class="Label">Phone Number</td>
                                    <td class="Data"><input type="text" value="" name="customer__phone_number" size="20" /></td>
                                </tr>
                                <tr>
                                    <td class="Label">Fax Number</td>
                                    <td class="Data"><input type="text" value="" name="customer__fax_number" size="20" /></td>
                                </tr>
                                <tr>
                                    <td class="Label">E-Mail Address</td>
                                    <td class="Data"><input type="text" value="" name="customer__email_address" size="30" /></td>
                                </tr>
                            </table>
                        </div>
                        <div vdfTabName="balances">
                            <table class="EntryTable">
                                <tr>
                                    <td class="Label">Credit Limit</td>
                                    <td class="Data"><input type="text" value="1000" name="customer__credit_limit" size="20" /></td>
                                </tr>
                                <tr>
                                    <td class="Label">Total Purchases</td>
                                    <td class="Data"><input type="text" value="0" name="customer__purchases" readonly="readonly" size="8" /></td>
                                </tr>
                                <tr>
                                    <td class="Label">Balance Due</td>
                                    <td class="Data"><input type="text" value="0" name="customer__balance" readonly="readonly" size="8" /></td>
                                </tr>
                            </table>
                        </div>
                        <div vdfTabName="comments">
                            <table class="EntryTable">
                                <tr>
                                    <td class="Label">Comments</td>
                                    <td class="Data"><textarea name="customer__comments" cols="60" rows="5"></textarea></td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</form>

<!-- #INCLUDE FILE="bodybottom.inc.asp" -->

</body>
</html>
<!-- #INCLUDE FILE="pagebottom.inc.asp" -->