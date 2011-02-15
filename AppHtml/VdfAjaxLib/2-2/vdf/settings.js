/*
Name:
    vdf.settings
Type:
    Library(object)
Revisions:
    2008/10/05  Created the initial version and so added the support for it in 
    the further library. (HW, DAE)
*/


/*
Using the settings object the AJAX Library default settings can be configured. 
This object contains a JSON notation with the settings that are available. Most 
settings are key codes and are used to attach listeners for default behavior. 
These settings can be modified in the settings.js file itself but note that the 
file is overwritten during upgrades. The best way to override these settings is 
by using the following code in your own includes or pages (after the AJAX 
Library includes).

@code
//  Change the search key of the lookup from ctrl-f to crtl-s
vdf.settings.listKeys.search = {
    iKeyCode : 83,
    bCtrl : true,
    bShift : false,
    bAlt : false
};
@code

Note that this code should be executed (advised to be placed/included directly 
in the <head> element) before the List object is initialized.
*/
vdf.settings = {
    /*
    Numeric value that limits the amount of concurrent web service calls that 
    are made by the AJAX Library from the browser. Zero or lower means that the 
    amount of concurrent calls is unlimited.
    */
    iAjaxConcurrencyLimit : 2,

    /*
    The keys that are used by the vdf.core.Form for the default actions.
    */
    formKeys : {
        findGT : {
            iKeyCode : 119,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        findLT : {
            iKeyCode : 118,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        findGE : {
            iKeyCode : 120,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        findFirst : {
            iKeyCode : 36,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        findLast : {
            iKeyCode : 35,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        save : {
            iKeyCode : 113,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        clear : {
            iKeyCode : 116,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        clearAll : {
            iKeyCode : 116,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        remove : {
            iKeyCode : 113,
            bCtrl : false,
            bShift : true,
            bAlt : false
        },
        lookup : {
            iKeyCode : 115,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    
    /*
    The keys that are used by the vdf.core.List engine. The deriving prototypes 
    vdf.deo.Grid and vdf.deo.Lookup will also use these settings.
    */
    listKeys : {
        scrollUp : {
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        scrollDown : {
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        scrollPageUp : {
            iKeyCode : 33,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        scrollPageDown : {
            iKeyCode : 34,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        scrollTop : {
            iKeyCode : 36,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        scrollBottom : {
            iKeyCode : 35,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        search : {
            iKeyCode : 70,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        enter : {
            iKeyCode : 13,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    
    /*
    The keys used by the vdf.gui.Calendar control. The vdf.gui.PopupCalendar and 
    vdf.deo.DatePicker also use these settings.
    */
    calendarKeys : {
        dayUp : {
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        dayDown : {
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        dayLeft : {
            iKeyCode : 37,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        dayRight : {
            iKeyCode : 39,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        monthUp : {
            iKeyCode : 33,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        monthDown : {
            iKeyCode : 34,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        yearUp : {
            iKeyCode : 33,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        yearDown : {
            iKeyCode : 34,
            bCtrl : true,
            bShift : false,
            bAlt : false
        },
        enter : {
            iKeyCode : 13,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        close : {
            iKeyCode : 27,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    },
    
    /*
    The keys that are used by the vdf.gui.TreeView component.
    */
    treeKeys : {
        moveUp : {
            iKeyCode : 38,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        moveDown : {
            iKeyCode : 40,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        collapse : {
            iKeyCode : 37,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        extend : {
            iKeyCode : 39,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        moveFirst : {
            iKeyCode : 36,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        moveLast : {
            iKeyCode : 35,
            bCtrl : false,
            bShift : false,
            bAlt : false
        },
        enter : {
            iKeyCode : 13,
            bCtrl : false,
            bShift : false,
            bAlt : false
        }
    }
};
vdf.register("vdf.settings");