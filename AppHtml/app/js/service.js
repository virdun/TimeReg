//----------------------------------------------
// THIS CODE IS NOT APPROVED FOR USE IN/ON ANY OTHER UI ELEMENT OR PRODUCT COMPONENT. 
// Copyright (c) 2009 Microsoft Corporation. All rights reserved.
//----------------------------------------------

var gTimeStampLastRefreshAvailable = false;
var gTimeToNextRefresh = 1; // default to 1 minute
var gTimeStampLastRefresh = null;

////////////////////////////////////////////////////////////////////////////////
//
// IsCurrencyDataFresh ( )
//
// return true if currency data last pulled is still fresh
// Also, if the data is still fresh, update global gTimeToNextRefresh to indicate time in minutes when refresh must be triggered to get fresh data
////////////////////////////////////////////////////////////////////////////////
function IsCurrencyDataFresh( )
{
 if ( gTimeStampLastRefreshAvailable && gTimeStampLastRefresh !== undefined && gTimeStampLastRefresh !== null )
 {
	var ageLastRefresh = calculateAge( gTimeStampLastRefresh );
	var serviceRefreshInterval = g_oService.RefreshInterval();
	var ageLastRefreshInterval = ageLastRefresh.minutesAge + ( ageLastRefresh.hoursAge * 60 );

	if ( ageLastRefresh.daysAge !== 0 || ageLastRefreshInterval > serviceRefreshInterval )
	{
	return false;
	}
	else
	{
	gTimeToNextRefresh = serviceRefreshInterval - ageLastRefreshInterval;
	if ( gTimeToNextRefresh < 1 )
	{
		gTimeToNextRefresh = 1;
	}
	return true;
	}
 }
 else
 {
	return false;
 }
}



function CurrencyService() {
	var me = this;
	
	// Private members
	var m_oService;
	var m_oCurrencyData;
	
	this.hsCurrencies;
	this.OnDataReady = null;
	
	function FireOnDataReady(oData) 
	{
		me.OnDataReady(oData);
	}
	
	function OnDataReady(data) {
		// Reset the state of the service
		me.IsAvailable = false;
		me.hsCurrencies = new Array();
		
		if(data === undefined) {
			data = null;
		}
		
		if((data !== null) && ((data.RetCode == 200) || (data.RetCode == 1507))) {
			m_oCurrencyData = data;
			
			// Massage the currency data to make it
			// more readable to work with for a 
			// currency converter.
			for(var i=0; i < data.Count; i++) {
				var currency = new Object();
				
				currency.Symbol = data.Item(i).Symbol;
				currency.Name = getLocalizedString(data.Item(i).Symbol);
				currency.PerDollar = data.Item(i).Last;
				currency.NameForSorting = data.Item(i).LCMapName(currency.Name);
				
				me.hsCurrencies[data.Item(i).Symbol] = currency;
			}
			
			me.IsAvailable = true;
		}
		
		FireOnDataReady(data);
	}
	
	this.IsAvailable = false;
	
	this.Convert = function(fFromAmount, sFromSymbol, sToSymbol) {
		if(fFromAmount == '')
			fFromAmount = 0;
		var decimals = 0;
		if (System.Gadget.docked)
		{
			decimals = 3;
		}
		else
		{
			decimals = 5;
		}
		if(m_oService != null) {
			return '' + m_oCurrencyData.Convert(fFromAmount, sFromSymbol, sToSymbol, decimals).replace(/^\s+/g, '').replace(/\s+$/g, '');
		} else { 
		FireOnDataReady(null);
		return 0;
		}
	}
	
	this.GetCurrencies = function() {

		if ( g_oService.IsAvailable )
		{
		loadSettings();
		}

		if ( IsCurrencyDataFresh ( ) )
		{
		g_oTimer = setTimeout( "g_oService.GetCurrencies()" , gTimeToNextRefresh * 60 * 1000 );
		return;
		}

		
		if (m_oService != null) 
			m_oService.GetCurrencies();
		else
			FireOnDataReady(null);
	}
	
	this.RefreshInterval = function()
	{
		if (m_oService != null)
		{
			return m_oService.RefreshInterval;
		}
		else
		{
			return -1;
		}
	}	
	
	// Constructor
	function Initialize() {
		
		try {
			var oMSN = new ActiveXObject("wlsrvc.WLServices");
			m_oService = oMSN.GetService("Currency");
			m_oService.OnDataReady = OnDataReady;
		} catch (objException) {
			m_oService = null;
		}
	}
	
	Initialize();
}

