<!-- #include FILE="pagetop.inc.asp" -->
<html>
<head>
    <title>AJAX Web Application</title>

    <!-- #include FILE="head.inc.asp" -->
</head>
<body>
<!-- #include FILE="bodytop.inc.asp" -->

    <form action="none" name="User_form" autocomplete="off" vdfControlType="form" vdfControlName="User_form" vdfMainTable="User" vdfServerTable="User" vdfWebObject="oUserProj">
        <!-- Status fields -->
        <input type="hidden" name="Company__rowid" value="" />
        <input type="hidden" name="CUSTOMER__rowid" value="" />
        <input type="hidden" name="Project__rowid" value="" />
        <input type="hidden" name="User__rowid" value="" />
        <input type="hidden" name="TimeReg__rowid" value="" />

        <table width="100%">
            <tr>
                <td>
                    <h3>UserProj</h3>
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
                                <td class="Label">Loginname</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Loginname" title="Loginname." size="20" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oUserProj" vdfLookupTable="User" vdfLookupFields="user__loginname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Firstname</td>
                                <td>
                                    <input class="Data" type="text" value="" name="User__Firstname" title="Firstname." size="50" vdfSuggestSource="find" />
                                    <input class="LookupButton" type="button" title="List of all records" tabindex="-1" vdfControlType="lookupdialog" vdfWebObject="oUserProj" vdfLookupTable="User" vdfLookupFields="user__firstname, user__lastname" />
                                </td>
                            </tr>
                            <tr>
                                <td class="Label">Lastname</td>
                                <td class="Data"><input type="text" value="" name="User__Lastname" title="Lastname." size="50" /></td>
                            </tr>
                            <tr>
                                <td class="Label">Mail</td>
                                <td class="Data"><input type="text" value="" name="User__Mail" title="Mail." size="50" /></td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <table class="VdfGrid" vdfControlType="grid" vdfControlName="Userproj_grid" vdfServerTable="Userproj" vdfMainTable="Userproj" vdfIndex="1" vdfRowLength="10" vdfCssEmptyRow="EmptyRow" vdfCssNewRow="NewRow">
                        <tr vdfRowType="header">
                            <% If (bEditRights) Then %>
                            <th>&nbsp;</th>
                            <% End If %>
                            <th vdfDataBinding="Project__Name">Project</th>
                            <th vdfDataBinding="Customer__Name">Customer</th>
                        </tr>
                        <tr vdfRowType="display">
                            <% If (bEditRights) Then %>
                            <td>
                              <% If (oSessionManager.call("get_HasRights", sSessionKey, "delete", "oUserProj", "")) Then %>
                                <input type="button" class="DeleteButton" onclick="vdf.getControl('Userproj_grid').deleteByRow(this);" title="Delete (Shift - F2)">
                              <% End If %>
                            </td>
                            <% End If %>
                            <td vdfDataBinding="Project__Name">&nbsp;</td>
                            <td vdfDataBinding="Customer__Name">&nbsp;</td>
                        </tr>
                        <tr vdfRowType="edit">
                            <% If (bEditRights) Then %>
                            <td>
                              <% If (oSessionManager.call("get_HasRights", sSessionKey, "delete", "oUserProj", "")) Then %>
                                <input type="button" class="DeleteButton" onclick="vdf.core.findForm(this).doDelete('userproj');" title="Delete (Shift - F2)">
                              <% End If %>
                            </td>
                            <% End If %>
                            <td>
                                <input type="text" size="30" name="Project__Name" value="" />
                                <input  class="LookupButton" type="button" 
                                        title="List of all records" 
                                        tabindex="-1" 
                                        vdfControlType="lookupdialog" 
                                        vdfWebObject="oProject" 
                                        vdfLookupTable="Project" 
                                        vdfServerTable="Project"
                                        vdfLookupFields="Project__Name, Customer__Name" />
                            </td>
                            <td>
                                <input type="text" size="30" name="Customer__Name" value="" />
                            </td>
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