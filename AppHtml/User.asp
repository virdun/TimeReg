<!-- #include FILE="pagetop.inc.asp" -->
<html>
<head>
    <title>AJAX Web Application</title>

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
        oSelectForm = vdf.getForm("user_select");
        oPopupForm = vdf.getForm("user_popup");
        
        //  display the dialog
        var oDialog = new vdf.gui.ModalDialog();
        oDialog.sTitle = "Edit user";

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
            oPopupForm.doFindByRowId("user", oSelectForm.getBufferValue("user.rowid"));
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
                vdf.getForm("user_popup").doSave();
                break;
        }
    }
    
    //
    //  Handles the onAfterSave event of the user DD of the popup form and 
    //  if the save was successful we update the select form by performing a 
    //  find by rowid.
    //
    //  Params:
    //      oEvent  Event object with information about the save action.
    //
    function onAfterPopupSave(oEvent){
        var oSelectForm, oPopupForm;

        if(!oEvent.bError){
            oSelectForm = vdf.getForm("user_select");
            oPopupForm = vdf.getForm("user_popup");
            
            oSelectForm.doFindByRowId("user", oPopupForm.getBufferValue("user.rowid"));
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
    //  Initialization method of the user_select form which is called after
    //  the form has initialized. It attaches the onListEnter function to the
    //  onEnter event to the user_lookup control.
    //  
    //  Params:
    //      oForm   Reference to the form object.
    //
    function initSelectForm(oForm){
        oForm.getControl("user_lookup").onEnter.addListener(onListEnter);
    }

    //
    //  Initialization method of the user_popup form which is called after 
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
        
        //  Attach the onAfterPopupSave function to the onAfterSave event of the user DD
        oForm.getDD("user").onAfterSave.addListener(onAfterPopupSave);
    }
</script>

</head>
<body>
<!-- #include FILE="bodytop.inc.asp" -->

<form action="none" name="form1" autocomplete="off" vdfControlType="form" vdfControlName="user_select" vdfInitializer="initSelectForm" vdfMainTable="user" vdfServerTable="user" vdfWebObject="oUser">

<!-- Status fields -->
<input type="hidden" name="user__rowid" value="" />

<table width="100%">
    <tr>
        <td>
            <% if (bEditRights) then %>
                <h3>user Entry and Maintenance</h3>
            <% else %>
                <h3>user Query</h3>
            <% end if %>
        </td>
    </tr>
    <tr>
        <td>
            <!-- Navigation buttons -->
            <table class="Toolbar" >
                <tr>
                
                    <td class="TextCell"></td>
                    <!--<td class="ButtonCell"><input id="Detail" type="button" class="ButtonNormal" name="detail" value="Detail" onclick="displayEditDialog();" title="Detail (Enter)" /></td>-->
                <% If (bEditRights) Then %>                
                    <!--<td class="ButtonCell"><input id="Add" type="button" class="ButtonNormal" name="add" value="New" onclick="displayEditDialog(true);" title="New" /></td>-->
                    <% If (oSessionManager.call("get_HasRights", sSessionKey, "delete", "oUser", "")) Then %>
                    <!--<td class="ButtonCell"><input type="button" class="ButtonNormal" name="delete" value="Delete" onclick="vdf.core.findForm(this).doDelete('user');" title="Delete (Shift - F2)" /></td>-->
                    <% End If %>
                <% End If %>
                    <td>&nbsp;</td>
                </tr>
            </table>

        </td>
    </tr>
    <tr>
        <td>
            <table style="width: 100%" vdfControlType="lookup" vdfControlName="user_lookup" vdfMainTable="user" vdfRowLength="10" vdfReturnCurrent="true" vdfFocus="true" vdfFixedColumnWidth="true">
                <tr vdfRowType="header">
                    <th vdfDataBinding="user__loginname">LoginName</th>
                    <th vdfDataBinding="user__firstname">First Name</th>
                    <th vdfDataBinding="user__lastname">Last Name</th>
                </tr>
                <tr vdfRowType="display">
                    <td vdfDataBinding="user__loginname"></td>
                    <td vdfDataBinding="user__firstname"></td>
                    <td vdfDataBinding="user__lastname"></td>
                </tr>
            </table>
        </td>
    </tr>
 </table>
 </form>



 <div id="hidden_popup" style="visibility: hidden">
    <form   action="none" 
            name="form1" 
            autocomplete="off" 
            vdfControlType="form" 
            vdfControlName="user_popup" 
            vdfInitializer="initPopupForm" 
            vdfMainTable="user" 
            vdfServerTable="user" 
            vdfWebObject="oUser" 
            id="popup_content" 
            vdfActionKeys="findGT:0, findLT:0, findGE:0, findFirst:0, findLast:0" 
            vdfAutoClearDeoState="false">

        <!-- Status fields -->
        <input type="hidden" name="Company__rowid" value="" />
        <input type="hidden" name="user__rowid" value="" />

        <table width="100%">
            <tr>
                <td>
                    <h3>User</h3>
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
                                <td class="Label">Login Name</td>
                                <td class="Data"><input type="text" value="" name="user__LoginName" title="LoginName." size="30" /></td>
                            </tr>
                            <tr>
                                <td class="Label">First Name</td>
                                <td class="Data"><input type="text" value="" name="user__FirstName" title="FirstName." size="30" /></td>
                            </tr>
                            <tr>
                                <td class="Label">Last Name</td>
                                <td class="Data"><input type="text" value="" name="user__LastName" title="LastName." size="30" /></td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>

    </form>
</div>
</body>
</html>
