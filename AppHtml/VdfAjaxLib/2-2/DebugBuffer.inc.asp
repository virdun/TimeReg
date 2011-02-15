<script type="text/javascript">
    var bDebugEnabled = false;
    function displayBufferValues(){
        var eTable, eDiv, sName, oForm, eRow, eCell, sDD, oDD, sField;
        eTable = document.createElement("table");
        eTable.className = "debugTable";
        eTable.cellPadding = 0;
        eTable.cellSpacing = 0;
        
        //  Loop through VDF controls search for form objects
        for(sName in vdf.oControls){
            if(typeof(vdf.oControls[sName]) === "object" && vdf.oControls[sName].bIsForm){
                oForm = vdf.oControls[sName];
                
                //  Generate form header
                eRow = eTable.insertRow(eTable.rows.length);
                eCell = eRow.insertCell(0);
                vdf.sys.dom.setElementText(eCell, oForm.sName);
                eCell.className = "formHeader";
                eCell.colSpan = 3;
                
                
                for(sField in oForm.oUserDataFields){
                    if(oForm.oUserDataFields.hasOwnProperty(sField)){
                        displayUserDataField(eTable, oForm.oUserDataFields[sField]);
                    }
                    
                }
                
                //  Loop through DDs
                for(sDD in oForm.oDDs){
                    if(typeof(oForm.oDDs[sDD]) === "object" && oForm.oDDs[sDD].bIsDD){
                        oDD = oForm.oDDs[sDD];
                        
                        //  Generate DD header
                        eRow = eTable.insertRow(eTable.rows.length);
                        eCell = eRow.insertCell(0);
                        eCell.colSpan = 3;
                        vdf.sys.dom.setElementText(eCell, oDD.sName);
                        eCell.className = "ddHeader";
                        
                        //  Loop through fields
                        displayBufferField(eTable, oDD.tStatus, oDD);
                        for(sField in oDD.oBuffer){
                            if(typeof(oDD.oBuffer[sField]) === "object" && oDD.oBuffer[sField].__isField){
                                displayBufferField(eTable, oDD.oBuffer[sField], oDD);
                            }
                        }
                    }
                }
            }
        }
        eDiv = document.getElementById("bufferwindow");
        eDiv.innerHTML = "";
        eDiv.appendChild(eTable);
        
        if(bDebugEnabled){
            setTimeout(displayBufferValues, 1500);
        }
    }
    
    function displayBufferField(eTable, tField, oDD){
        var eRow, eCell, bDisplayChanged = false, iDeo;
        
        
        //  Determine display changed
        for(iDeo = 0; iDeo < oDD.aDEO.length; iDeo++){
            if(oDD.aDEO[iDeo].sDataBindingType === "D"){
                if(oDD.aDEO[iDeo].sDataBinding === tField.sBinding){
                    bDisplayChanged = oDD.aDEO[iDeo].isChanged() || bDisplayChanged;
                }
            }
        }
        
        eRow = eTable.insertRow(eTable.rows.length);
        eCell = eRow.insertCell(0);
        
        vdf.sys.dom.setElementText(eCell, (tField.sBinding.indexOf(".") > 0 ? tField.sBinding.substr(tField.sBinding.indexOf(".") + 1) : tField.sBinding));
        eCell.className = "ddFieldName";
        
        eCell = eRow.insertCell(1);
        vdf.sys.dom.setElementText(eCell, (tField.bChanged ? "true" : "false"));
        
        eCell = eRow.insertCell(2);
        vdf.sys.dom.setElementText(eCell, (bDisplayChanged ? "true" : "false"));
        
        eCell = eRow.insertCell(3);
        vdf.sys.dom.setElementText(eCell, tField.sValue);
    }
    
    function displayUserDataField(eTable, oField){
        var eRow, eCell;
    
        eRow = eTable.insertRow(eTable.rows.length);
        eCell = eRow.insertCell(0);
        
        vdf.sys.dom.setElementText(eCell, oField.sDataBinding);
        eCell.className = "userFieldName";
        
        eCell = eRow.insertCell(1);
        vdf.sys.dom.setElementText(eCell, " ");
        
        eCell = eRow.insertCell(2);
        vdf.sys.dom.setElementText(eCell, oField.isChanged());
        
        eCell = eRow.insertCell(3);
        vdf.sys.dom.setElementText(eCell, oField.getValue());
    }
    
    function toggleDebugWindow(){
        if(bDebugEnabled){
            document.getElementById("bufferwindow").style.display = "none";
            bDebugEnabled = false;
            vdf.sys.dom.setElementText(document.getElementById("debugToggle"), "Show");
        }else{
            document.getElementById("bufferwindow").style.display = "";
            bDebugEnabled = true;
            vdf.sys.dom.setElementText(document.getElementById("debugToggle"), "Hide");
            displayBufferValues();
        }
    }
</script>

<style type="text/css">
#debugBuffer{
    position: fixed;
    top: 40px;
    right: 20px;
    border: 1px solid #A5BCFF;
    padding: 5px;
    width: 350px;
    opacity: 0.7;
    alpha(opacity=70);
    background-color: #FFFFFF;
    z-index: 999;
}

#debugToggle{
    background-color: #47A6FF;
    color: #FFFFFF;
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
    padding: 3px;
}

#bufferwindow{
    overflow: scroll;
    height: 700px;
}

.debugTable td{
    border-left: 1px solid #A5BCFF;
    padding: 2px 5px 2px 5px;
}

.debugTable .formHeader {
    font-weight: bold;
    font-size: 14px;
    
    border-left: none;
}

.debugTable .ddHeader {
    font-weight: bold;
    font-size: 12px;
    padding-left: 15px;
    border-left: none;
}

.debugTable .ddFieldName {
    padding-left: 30px;
    border-left: none;
}

.debugTable .userFieldName {
    padding-left: 15px;
    border-left: none;
}





</style>

<div id="debugBuffer">
    <div id="debugToggle" onclick="toggleDebugWindow();">Show</div>
    <div id="bufferwindow" style="display: none;"></div>
</div>