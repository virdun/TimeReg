/*
Name:
    vdf.deo.Lookup
Type:
    Prototype
Extends:
    vdf.core.List
Revisions:
    2005/10/24  Created the initial version. (HW, DAE)
    2008/02/15  Started a full rewrite for the 2.0 architecture. (HW, DAE)
*/

/*
@require    vdf/core/List.js
*/

/*
Constructor that applies to the interface required by the initialization system 
(see vdf.core.init). Calls the super constructor of the List.

@param  eElement        Reference to the form DOM element.
@param  oParentControl  Reference to a parent control.
*/
vdf.deo.Lookup = function Lookup(eElement, oParentControl){
    this.List(eElement, oParentControl);
    
    /*
    The CSS class that applied to the currently selected row.
    */
    this.sCssRowSelected = this.getVdfAttribute("sCssRowSelected", "rowselected");
};
/*
The lookup can be used let the user select a record from a list with multiple columns. The lookup 
shares it engine (the super class vdf.core.List) with the grid. The lookup only works inside a form 
and will bind itself to its server DD using the vdfServerTable property. The vdfTable property 
defines on which table the finds should be performed. Within the lookup fields from the main table 
and its server tables can be used. 

Within the HTML the list is defined using a table element having one or two rows. The important row 
is the display row which is defined by adding vdfRowType="display" to the row (tr) element. This row 
can contain Data Entry Objects (usually of the vdf.deo.DOM type) that will be filled with values 
from the record. The display row will be duplicated for each record displayed in the list.

The example below also defines a row with vdfRowType="header". By using the vdfDataBinding property 
within this row the list engine will recognize the columns and allows the user to switch between 
available indexes. If vdfControlType="label" is used to make the element a vdf.core.Label control 
the labels from the Data Dictionary will be displayed without losing the switch index functionality. 
The example below demonstrates this on the address field.

@code
<table vdfControlType="lookup" vdfControlName="customer_lookup" vdfTable="customer" vdfRowLength="10" vdfFocus="true" vdfFixedColumnWidth="true" vdfDetermineWidth="true">
    <tr vdfRowType="header">
        <th vdfDataBinding="customer__customer_number">Number</th>
        <th vdfDataBinding="customer__name">Customer Name</th>
        <th vdfControlType="label" vdfDataBinding="customer__address"> </th>
    </tr>
    <tr vdfRowType="display">
        <td vdfDataBinding="customer__customer_number"></td>
        <td vdfDataBinding="customer__name"></td>
        <td vdfDataBinding="customer__address"></td>
    </tr>
</table>
@code
*/
vdf.definePrototype("vdf.deo.Lookup", "vdf.core.List", {

/*
Augments the select method with the functionality to display the selected row 
as selected. Does this by adding the sCssRowSelected class to the row.

@param  tRow        The snapshot of the row to select.
@param  fFinished   (optional) Function that is called after the select action is 
                finished.
@param  oEnvir      (optional) Environment used when calling fFinished.
*/
select : function(tRow, fFinished, oEnvir){
    tRow.__eRow.className = this.sCssRowSelected + " " + tRow.__eRow.className;
    
    this.List.prototype.select.call(this, tRow, fFinished, oEnvir);
},
/*
Augments the select method with the functionality to display the selected row 
as selected. Does this by removing the sCssRowSelected class from the selected
row.
*/
deSelect : function(){
    if(this.tSelectedRow !== null){
        if(this.tSelectedRow.__eRow.className.match(this.sCssRowSelected)){
             this.tSelectedRow.__eRow.className = this.tSelectedRow.__eRow.className.replace(this.sCssRowSelected, "");
        }
    }
    
    this.List.prototype.deSelect.call(this);
    
    return true;
},

/*
Determines the value of the column in the currently selected record.

@param  sColumn     Data binding string of the column.
@return The value of the column (null if not found).
*/
getSelectedValue : function(sColumn){
    if(this.tSelectedRow !== null){
        return this.tSelectedRow.__oData[sColumn.toLowerCase().replace("__", ".")];
    }
    
    return null;
}

});