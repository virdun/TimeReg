/*
The dutch translations.

@private
*/
vdf.lang.translations_nl = {
    error : {
        5129 : "Verwijzing naar het Form object verplicht in {{0}}",
        5130 : "Onbekende library '{{0}}'",
        5131 : "Event listener moet een functie zijn (event: '{{0}}')",
        5132 : "Control naam '{{0}}' bestaat al binnen het form '{{1}}'",
        5133 : "Control moet een naam hebben",
        5134 : "Intializatie methode niet gevonden '{{0}}'",
		5135 : 'Onbekend controltype (vdfControlType="{{0}}")',
        5136 : "Field bevat geen index",
        5137 : "Onbekende tabel '{{0}}' gebruikt in '{{1}}'",
        5138 : "Onbekend veld '{{0}}' binnen tabel '{{1}}' gebruikt in '{{2}}'",
        
        5139 : "Edit rij verplicht binnen grid",
        5140 : "Onbekend rowtype: {{0}}",
        5141 : "Tab container zonder knop: {{0}}",
        5142 : "Tab knop zonder container: {{0}}",
        5143 : "Property '{{0}}' is verplicht", 										// New in 2.2
        5144 : "De server tabel (vdfServerTable) is verplicht op een form met velden",	// New in 2.2
        5145 : "Onbekende data binding '{{0}}'", 										// New in 2.2
		5146 : "Er is geen actief veld (Data Entry Object) om de actie op uit te voeren", // New in 2.2
		5147 : "Het veld '{{0}}' is niet geïndexeerd", 										// New in 2.2
		5148 : "Het veld '{{0}}' maakt geen deel uit van de hoofd tabel (vdfMainTable)", // New in 2.2
		5149 : "Invalide HTML gebruikt voor het control, kon element '{{0}}' niet vinden",
		5150 : "Kon het submenu '{{0}}' niet vinden", 										// New in 2.2
		5151 : "Het Node ID '{{0}}' moet uniek zijn binnen de tree", 					// New in 2.2
        
        5124 : "Veld vereist een gevonden record",
        5125 : "Waarde komt niet overeen met een van de opties",                              	
        5126 : "Waarde moet lager zijn dan {{0}}",
        5127 : "Waarde moet hoger zijn dan {{0}}",
		5128 : "Waarde is verplicht",
		
		5152 : "Kon geen response node vinden in de ontvangen XML",
        5123 : "Onbekende fout bij het parsen van de ontvangen XML",
		5120 : "HTTP fout '{{0}}' bij het verzenden van het bericht",
		5121 : "Soap fout '{{0}}' ontvangen van de server",
		5122 : "Fout bij het parsen van de ontvangen XML",
        
        titleServer : "Error {{0}} occurred on the server!",                            // New in 2.2
        title : "Fout {{0}}!"
    },
    
    list : {
        search_title : "Zoeken..",
        search_value : "Zoek waarde",
        search_column : "Kolom",
        search : "Zoeken",
        cancel : "Annuleren"
    },
    
    lookupdialog : {
        title : "Lookup dialoog",
        select : "Selecteren",
        cancel : "Annuleren",
        search : "Zoeken",
        lookup : "Lookup"
    },
    
    calendar : {
        today : "Vandaag is",
        wk : "Wk",
        daysShort : ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"],
        daysLong : ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
        monthsShort : ["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
        monthsLong : ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"]
    },
    
    global : {
        ok : "OK",
        cancel : "Annuleren"
    }
};
vdf.register("vdf.lang.translations_nl");