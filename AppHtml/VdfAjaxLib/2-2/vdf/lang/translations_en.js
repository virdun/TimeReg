/*
The english translations that are used by default.

@private
*/
vdf.lang.translations_en = {
    error : {
        5129 : "Reference to form object required in '{{0}}'",                             	// 134 
        5130 : "Invalid library '{{0}}'",                                                 	// 142 
        5131 : "Event listener should be a function (event '{{0}}')",                       // 143 
        5132 : "Control name '{{0}}' already exists within the form '{{1}}'",            	// 144 
        5133 : "Control should have a name",                                             	// 145 
        5134 : "Could not find initialization method '{{0}}'",                           	// 147 
        5135 : 'Unknown controltype (vdfControlType="{{0}}")',                          	// 148 
        5136 : "Field not indexed",                                                      	// 151 
        5137 : "Unknown table '{{0}}'", 					                                // 153 
        5138 : "Unknown field '{{0}}' of table '{{1}}'", 	                                // 154 
                                                                                            
        5139 : "Edit row required for grid",                                             	// 201 
        5140 : "Unknown row type: {{0}}",                                                	// 214 
        5141 : "Tab container without a button: {{0}}",                                  	// 217 
        5142 : "Tab button without a container: {{0}}",                                  	// 218 
        5143 : "Property '{{0}}' is required", 											// New in 2.2
        5144 : "Server table required on a form with fields", 							// New in 2.2
        5145 : "Unknown data binding '{{0}}'", 											// New in 2.2
		5146 : "No active data entry object to perform operation on", 					// New in 2.2
		5147 : "The field '{{0}}' is not indexed", 										// New in 2.2
		5148 : "The field '{{0}}' is not part of the main table", 						// New in 2.2
		5149 : "Invalid HTML used for the control, could not find '{{0}}' element", 	// New in 2.2
		5150 : "Could not find submenu '{{0}}'", 										// New in 2.2
		5151 : "The Node ID '{{0}}' is not unique within the tree", 					// New in 2.2
		
        5124 : "Field requires find",                                                       // 303
        5125 : "Value does not matches one of the options",                              	// 308
        5126 : "Value must be lower than '{{0}}'",                                       	// 310
        5127 : "Value must be higher than '{{0}}'",                                       	// 311
        5128 : "Value is required",                                                      	// 312
        
        5152 : "Could not find response node in response XML",                          	// 501
        5123 : "Unknown error while parsing response XML",			// Changed in 2.2       // 502
        5120 : "HTTP error '{{0}}' occurred while making request", 	// Changed in 2.2    	// 503
        5121 : "Webservice returned soap error '{{0}}'",            // Changed in 2.2       // 504
        5122 : "Error while parsing response XML", 					// New in 2.1           // 505
        
        titleServer : "Error {{0}} occurred on the server!",        // New in 2.2
        title : "Error {{0}} occurred!"
    },
    
    list : {
        search_title : "Search..",
        search_value : "Search value",
        search_column : "Column",
        search : "Search",
        cancel : "Cancel"
    },
    
    lookupdialog : {
        title : "Lookup dialog",
        select : "Select",
        cancel : "Cancel",
        search : "Search",
        lookup : "Lookup"
    },
    
    calendar : {
        today : "Today is",
        wk : "Wk",
        daysShort : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        daysLong : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        monthsShort : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        monthsLong : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    
    global : {
        ok : "OK",
        cancel : "Cancel"
    }
};
vdf.register("vdf.lang.translations_en");