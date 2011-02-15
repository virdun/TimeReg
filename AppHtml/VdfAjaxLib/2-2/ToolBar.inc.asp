            <!-- Navigation buttons -->
            <table class="Toolbar" vdfControlType="vdf.core.Toolbar" vdfName="main_toolbar" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="toolbarCornerLeft">&nbsp;</td>
                    <td class="TextCell"> </td>
                    <td class="ButtonCell"><input id="First" class="NavigationButton" type="button" name="findfirst" value="" onclick="vdf.core.findForm(this).doFind(vdf.FIRST);" title="Find First (Ctrl - Home)" /></td>
                    <td class="ButtonCell"><input id="Previous" class="NavigationButton" type="button" name="findprev" value="" onclick="vdf.core.findForm(this).doFind(vdf.LT);" title="Find Previous (F7)" /></td>
                    <td class="ButtonCell"><input id="Equal" class="NavigationButton" type="button" name="find" value="" onclick="vdf.core.findForm(this).doFind(vdf.GE);" title="Find Equal (F9)" /></td>
                    <td class="ButtonCell"><input id="Next" class="NavigationButton" type="button" name="findnext" value="" onclick="vdf.core.findForm(this).doFind(vdf.GT);" title="Find Next (F8)" /></td>
                    <td class="ButtonCell"><input id="Last" class="NavigationButton" type="button" name="findlast" value="" onclick="vdf.core.findForm(this).doFind(vdf.LAST);" title="Find Last (Ctrl - End)" /></td>
                    <td>&nbsp;</td>
                
                <% If (bEditRights) Then %>
                    <td class="TextCell"> </td>
                    <% If (oSessionManager.call("get_HasRights", sSessionKey, "save", "", "")) Then %>
                    <td class="ButtonCell"><input id="Save" class="NavigationButton" type="button" name="save" value="" onclick="vdf.core.findForm(this).doSave();" title="Save (F2)" /></td>
                    <% End If %>
                    <% If (oSessionManager.call("get_HasRights", sSessionKey, "delete", "", "")) Then %>
                    <td class="ButtonCell"><input id="Delete" class="NavigationButton" type="button" name="delete" value="" onclick="vdf.core.findForm(this).doDelete();" title="Delete (Shift - F2)" /> </td>
                    <% End If %>
                    <% If (oSessionManager.call("get_HasRights", sSessionKey, "clear", "","")) Then %>
                    <td class="ButtonCell"><input id="Clear" class="NavigationButton" type="button" name="clear" value="" onclick="vdf.core.findForm(this).doClear();" title="Clear (F5)" /></td>
                    <td class="ButtonCell"><input id="ClearAll" class="NavigationButton" type="button" name="clearall" value="" onclick="vdf.core.findForm(this).doClearAll();" title="Clear all (Crtl - F5)" /></td>
                    <td>&nbsp;</td>
                    <% End If %>
                <% End If %>
                    <td class="toolbarCornerRight">&nbsp;</td>
				</tr>
            </table>
