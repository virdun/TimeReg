/*
The danish translations.
provided by Torben Lund, DataPower

@private
*/
vdf.lang.translations_da = {
    error : {
        5129 : "Reference til form object påkrævet i {{0}}",
        5130 : "Ugyldigt library: {{0}}",
        5131 : "Listener skal være en funktion (event: {{0}})",
        5132 : "Kontrol navn '{{0}}' eksisterer allerede i formen '{{1}}'",
        5133 : "Kontrol skal have et navn",
        5134 : "Kunne ikke finde initialization metode '{{0}}'",
        5135 : 'Ukendt kontroltype (vdfControlType="{{0}}").',
        5136 : "Felt ikke indekseret",
        5137 : "Ukendt tabel {{0}}",
        5138 : "Ukendt felt {{0}} i tabel {{1}}",

        5139 : "Edit linie påkrævet for grid",
        5140 : "Ukendt linie type: {{0}}",
        5141 : "Tab container uden en knap: {{0}}",
        5142 : "Tab knap uden en container: {{0}}",
        5143 : "Property '{{0}}' er påkrævet",
        5144 : "Server tabel påkrævet på en form med felter",
        5145 : "Ukendt data binding '{{0}}'",
        5146 : "Intet aktivt data entry object at udføre operationen på",
        5147 : "Feltet '{{0}}' er ikke indekseret",				
        5148 : "Feltet '{{0}}' er ikke del af main tabellen",
        5149 : "Ugyldig HTML anvendt til kontrollen, kunne ikke finde '{{0}}' element",
        5150 : "Kunne ikke finde submenu '{{0}}'", 
        5151 : "Node ID '{{0}}' er ikke unik inden for træet", 

        5124 : "Felt kræver find",
        5125 : "Værdien matcher ikke en af mulighederne",
        5126 : "Værdien skal være under {{0}}",
        5127 : "Værdien skal være over {{0}}",
        5128 : "Værdi er påkrævet",

        5152 : "Kunne ikke finde response node i response XML",
        5123 : "Kunne ikke parse response XML",
        5120 : "HTTP fejl '{{0}}' opstod ved forespørgsel",
        5121 : "Webservice returnerede soap fejl '{{0}}'",
        5122 : "Fejl under parsing af response XML",

        titleServer : "Fejl {{0}} opstod på serveren!",
        title : "Fejl {{0}} opstod!"
    },

    list : {
        search_title : "Søg..",
        search_value : "Søge værdi",
        search_column : "Kolonne",
        search : "Søg",
        cancel : "Afbryd"
    },

    lookupdialog : {
        title : "Søgeliste",
        select : "Vælg",
        cancel : "Afbryd",
        search : "Søg",
        lookup : "Søgning"
    },

    calendar : {
        today : "I dag er",
        wk : "Uge",
        daysShort : ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],
        daysLong : ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredgy", "Lørdag"],
        monthsShort : ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
        monthsLong : ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"]
    },

    global : {
        ok : "OK",
        cancel : "Afbryd"
    }
};
vdf.register("vdf.lang.translations_da");