<!-- #include FILE="pagetop.inc.asp" -->
<html>
<head>
<title>Work Hour Time Tracker - Customer</title>

<!-- #include FILE="head.inc.asp" -->

<script type="text/javascript">
    //
    //  Displays the edit dialog and loads the correct data.
    //  
    //  Params:
    //      bClear  If true the dialog is cleared
    //
    function displayEditDialog(bClear){
        var oSelectForm, oPopupForm;
        
        //  Get references to the vdf form objects
        oSelectForm = vdf.getForm("customer_select");
        oPopupForm = vdf.getForm("customer_popup");
        
        //  display the dialog
        var oDialog = new vdf.gui.ModalDialog();
        oDialog.sTitle = "Edit customer";

<% If bEditRights then %>
        oDialog.addButton("save", "Save", "btnSave");
<% End If %>
        oDialog.addButton("close", "Close", "btnClose");
        oDialog.onButtonClick.addListener(onDialogButtonClick);
        
        oDialog.displayDOM(document.getElementById("popup_content"));
        
        //  Load data
        if(bClear){
            oPopupForm.doClear();
        }else{
            oPopupForm.doFindByRowId("customer", oSelectForm.getBufferValue("customer.rowid"));
        }
        
        return true;
    }
    
    //
    //  Handles the onButtonClick event of the modal dialog and initiates the action.
    //
    //  Params:
    //      oEvent  Event object
    //
    function onDialogButtonClick(oEvent){
        switch(oEvent.sButtonName){
            case "close":
                vdf.gui.closeModalDialog();
                break;
            case "save":
                vdf.getForm("customer_popup").doSave();
                break;
        }
    }
    
    //
    //  Handles the onAfterSave event of the customer DD of the popup form and 
    //  if the save was successful we update the select form by performing a 
    //  find by rowid.
    //
    //  Params:
    //      oEvent  Event object with information about the save action.
    //
    function onAfterPopupSave(oEvent){
        var oSelectForm, oPopupForm;

        if(!oEvent.bError){
            oSelectForm = vdf.getForm("customer_select");
            oPopupForm = vdf.getForm("customer_popup");
            
            oSelectForm.doFindByRowId("customer", oPopupForm.getBufferValue("customer.rowid"));
            vdf.gui.closeModalDialog();
        }
    }
    
    //
    //  Handles the onEnter event of the lookup and displays the edit dialog.
    //
    //  Params:
    //      oEvent  Event object
    //
    function onListEnter(oEvent){
        displayEditDialog();
    }

    //
    //  Initialization method of the customer_select form which is called after
    //  the form has initialized. It attaches the onListEnter function to the
    //  onEnter event to the customer_lookup control.
    //  
    //  Params:
    //      oForm   Reference to the form object.
    //
    function initSelectForm(oForm){
        oForm.getControl("customer_lookup").onEnter.addListener(onListEnter);
    }

    //
    //  Initialization method of the customer_popup form which is called after 
    //  that form was initialized. It hides the form (which can only be done 
    //  after initialization because of the tabcontainer.
    //  
    //  Params:
    //      oForm   Reference to the form object.
    //
    function initPopupForm(oForm){
        //  We now set the display to hidden and the visibillity back to visible 
        //  because we are done with the initialization
        document.getElementById("hidden_popup").style.display = "none";
        document.getElementById("hidden_popup").visibillity = "visible";
        
        //  Attach the onAfterPopupSave function to the onAfterSave event of the customer DD
        oForm.getDD("customer").onAfterSave.addListener(onAfterPopupSave);
    }
</script>

</head>
<body>

<!-- #include FILE="bodytop.inc.asp" -->

<form action="none" name="form1" autocomplete="off" vdfControlType="form" vdfControlName="customer_select" vdfInitializer="initSelectForm" vdfMainTable="customer" vdfServerTable="customer" vdfWebObject="oCustomer">

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
            <!-- Navigation buttons -->
            <table class="Toolbar" >
                <tr>
                
                    <td class="TextCell"></td>
                    <td class="ButtonCell"><input id="Detail" type="button" class="ButtonNormal" name="detail" value="Detail" onclick="displayEditDialog();" title="Detail (Enter)" /></td>
                <% If (bEditRights) Then %>                
                    <td class="ButtonCell"><input id="Add" type="button" class="ButtonNormal" name="add" value="New" onclick="displayEditDialog(true);" title="New" /></td>
                    <% If (oSessionManager.call("get_HasRights", sSessionKey, "delete", "oCustomer", "")) Then %>
                    <td class="ButtonCell"><input type="button" class="ButtonNormal" name="delete" value="Delete" onclick="vdf.core.findForm(this).doDelete('customer');" title="Delete (Shift - F2)" /></td>
                    <% End If %>
                <% End If %>
                    <td>&nbsp;</td>
                </tr>
            </table>

        </td>
    </tr>
    <tr>
        <td>
            <table style="width: 100%" vdfControlType="lookup" vdfControlName="customer_lookup" vdfMainTable="customer" vdfRowLength="10" vdfReturnCurrent="true" vdfFocus="true" vdfFixedColumnWidth="true">
                <tr vdfRowType="header">
                    <th vdfDataBinding="customer__CustomerId">Number</th>
                    <th vdfDataBinding="customer__name">Customer Name</th>
                    <th vdfDataBinding="customer__address">Address</th>
                </tr>
                <tr vdfRowType="display">
                    <td vdfDataBinding="customer__CustomerId"></td>
                    <td vdfDataBinding="customer__name"></td>
                    <td vdfDataBinding="customer__address"></td>
                </tr>
            </table>
        </td>
    </tr>
 </table>
 </form>

 <div id="hidden_popup" style="visibility: hidden">
    <form action="none" name="form1" autocomplete="off" vdfControlType="form" vdfControlName="customer_popup" vdfInitializer="initPopupForm" vdfMainTable="customer" vdfServerTable="customer" vdfWebObject="oCustomer" id="popup_content" vdfActionKeys="findGT:0, findLT:0, findGE:0, findFirst:0, findLast:0" vdfAutoClearDeoState="false">
     <table>
        <tr>
            <td>
                <div>
                    <table class="EntryTable">
                        <tr>
                            <td class="Label">Customer Number</td>
                            <td class="Data"><input type="text" value="0" name="customer__CustomerId" size="6" /></td>
                        </tr>
                        <tr>
                            <td class="Label">Customer Name</td>
                            <td class="Data"><input type="text" value="" name="customer__name" size="30" /></td>
                        </tr>
                   </table>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <table cellpadding="0" vdfControlType="tabcontainer" vdfDetermineWidth="true">
                    <tr>
                        <td vdfElement="header">
                            <div >
                                <ul>
                                    <li vdfTabName="address"><a href="javascript: vdf.sys.nothing();">Address</a></li>
                                    <li vdfTabName="balances"><a href="javascript: vdf.sys.nothing();">Balances</a></li>
                                    <li vdfTabName="comments"><a href="javascript: vdf.sys.nothing();">Comments</a></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td vdfElement="container">
                            <div vdfTabName="address">
                                <table class="EntryTable">
                                    <tr>
                                        <td class="Label">Street Address</td>
                                        <td class="Data"><input type="text" value="" name="customer__address" size="30" /></td>
                                    </tr>
                                    <tr>
                                        <td class="Label">Active Status</td>
                                        <td class="Data"><input type="radio" value="Y" name="customer__status" checked="checked" />Active<input type="radio" value="N" name="customer__status" origtabindex="0" tabindex="-1"/>Inactive</td>
                                    </tr>
                                    <tr>
                                        <td class="Label">City</td>
                                        <td class="Data"><input type="text" value="" name="customer__city" size="14" /></td>
                                    </tr>
                                    <tr>
                                        <td class="Label">State</td>
                                        <td class="Data"><select name="customer__state" size="1" ></select></td>
                                    </tr>
                                    <tr>
                                        <td class="Label">Zip/Postal Code</td>
                                        <td class="Data"><input type="text" value="" name="customer__zip" size="10" /></td>
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
                                        <td class="Data"><input type="text" value="1000" name="customer__credit_limit" size="8" /></td>
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
</div>

<!-- #INCLUDE FILE="bodybottom.inc.asp" -->

</body>
</html>

<!-- #INCLUDE FILE="pagebottom.inc.asp" -->
