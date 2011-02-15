$(document).ready(function(){
    $('#username').click(function(){
        $('#username').val('');
    });
    $('#password').focus(function(){
        $('#password').val('');
    });
    $('#login_button').click(function(){
        host = getHost();
        urlStr  = host
                + '?module=User&view=ajax_login'
                + '&username=' + $('#username').val()
                + '&password=' + $('#password').val()
                + '&' + new String (Math.random()).substring (2, 11)
                + '&format=json&jsoncallback=?';
  //$('#username').val(urlStr);
        $.get(urlStr,
      	    function(userId){
                //$('#username').val(userId);
                if (userId > 0) {
                              
                  //$('#username').val('OK: ' + data);
                  $('#login').hide();
                  $('#userid').val(userId);
                  getListOfProjects(userId);
                  getActive();
                  $('#register').show();
                } else {
                  //$('#username').val('Fail: ' + data);
                }
        });
    });
    
    function getListOfProjects(userId) {
        host = getHost();
        urlStr  = host
                + '?module=Project&view=project_list'
                + '&userid=' + $('#userid').val()
                + '&' + new String (Math.random()).substring (2, 11)
                ;
  
        $.get(urlStr,
   	    function(projectList){
   	        projList = projectList.split(',');

   	        i = 0;
   	        projCont = '';
   	        while (projList[i] != undefined) {
   	          element = projList[i].split('|');
   	          projCont += '<option value="' + element[0] + '">' + element[1] + '</option>';
   	          i++;
            }
   	        $('#company_list').html(projCont);
        });
    }
    
    $('#start').click(function() {
        host = getHost();
        if ($('#company_list').val() > 0) {
            urlStr  = host
                    + '?module=Project&view=start'
                    + '&userid=' + $('#userid').val()
                    + '&projectid=' + $('#company_list').val()
                    + '&' + new String (Math.random()).substring (2, 11)
                    ;
      
            $.get(urlStr,
       	    function(regId){
       	        $('#regid').val(regId);
       	        $('#company_list').attr('disabled', 'disabled');
       	        $('#start').attr('disabled', 'disabled');
                $('#stop').removeAttr('disabled');
          		if (!System.Gadget.docked) {
                fillStats();
          		}
            });
        }
    });

    $('#stop').click(function() {
        host = getHost();
        urlStr  = host
                + '?module=Project&view=stop'
                + '&userid=' + $('#userid').val()
                + '&projectid=' + $('#company_list').val()
                //+ '&id=' + $('#regid').val()
                + '&' + new String (Math.random()).substring (2, 11)
                ;
        //$('#debug').val(urlStr);
        $.get(urlStr,
   	    function(success){
   	        //$('#debug').val(success + ' ' + new String (Math.random()).substring (2, 11));
   	        if (success > 0) {
                $('#company_list').removeAttr('disabled');
                $('#start').removeAttr('disabled');
       	        $('#stop').attr('disabled', 'disabled');
                $('#regid').val(0);
            		if (!System.Gadget.docked) {
                  fillStats();
            		}
        		}
        });
    });
    
    var oBody = document.body.style;
    oBody.width = '130px';
    oBody.height = '83px';
    

    timeregbackground.style.width = 0;
    timeregbackground.style.height = 0;
    //timeregbackground.src = "url(images/base-docked.png)";
    
    //var gGadgetMode = (System.Gadget !== undefined);

  	// Set initial values needed for dynamic re-sizing of menu and rows
  	g_sBodyHeight = parseInt(document.body.currentStyle.height);
          	
  	//if (gGadgetMode)
  	//{		
    	System.Gadget.settingsUI = "settings.html";
  		System.Gadget.onDock = DockGadget;
  		System.Gadget.onUndock = UndockGadget;
  
  		if (System.Gadget.docked)
  		{
  			DockGadget();
  		}
  		else
  		{
  			UndockGadget();
  		}
  	//}
  	//else
  	//{	
  	//	UndockGadget();
  	//}
////////////////////////////////////////////////////////////////////////////////
//
// Data for gadget in docked state
//
////////////////////////////////////////////////////////////////////////////////
function DockGadget() {
  	var oBody = document.body.style;
  	oBody.width = '130px';
  	oBody.height = '83px';
  
  	$('#message').css({ 'border':'0px solid #990000',
                        'margin':'5px',
                        'width':'120px'});
    
  
  	timeregbackground.style.width = 0;
  	timeregbackground.style.height = 0;
  	timeregbackground.src = "url(images/base-docked.png)";
  
    $('#stats').hide();

}
////////////////////////////////////////////////////////////////////////////////
//
// Data for gadget in undocked state
//
////////////////////////////////////////////////////////////////////////////////
function UndockGadget() {
  	var oBody = document.body.style;
  	oBody.width = '254px';
  	oBody.height = '300px';
  	//oBody.height = (g_sBodyHeight - g_sRowHeight) + (g_sRowCount * g_sRowHeight);
  	
  	$('#message').css({ 'border':'0px solid #990000',
                        'margin':'15px',
                        'margin-top':'100px',
                        'width':'214px'});
  
  	timeregbackground.style.width = 254;
  	timeregbackground.style.height = 300;
  	//timeregbackground.src = "";
  	timeregbackground.src = "url(images/base-undocked-4.png)";
  	
    fillStats();
	
}

function fillStats() {
  	var currentTime = new Date()
    var month = currentTime.getMonth() + 1
    var day = currentTime.getDate()
    var year = currentTime.getFullYear()
    if (day < 10)
    day = "0" + day
    if (month < 10)
    month = "0" + month
    var today = day + "-" + month + "-" + year;

    host = getHost();
    workingCompany = $('#company_list').val();
    if ($('#stop').attr('disabled')) {
        workingCompany = 0;
    }
    urlStr  = host
            + '?module=Project&view=day_report'
            + '&userid=' + $('#userid').val()
            + '&date=' + today
            + '&working=' + workingCompany
            + '&' + new String (Math.random()).substring (2, 11)
            ;
  
    $.get(urlStr,
    function(projectList){
        projList = projectList.split(',');

        i = 0;
        projCont = '<table>';
        while (projList[i] != undefined) {
          element = projList[i].split('|');
          projCont += '<tr><td>' + element[0] + '</td><td>' + element[1] + '</td></tr>';
          i++;
        }
        projCont += '</table>';
        $('#stats').html(projCont);
        $('#stats').show();
    });

}

function getActive() {
    //$('#debug').val('check active');
    host = getHost();
    urlStr  = host
            + '?module=Project&view=has_open'
            + '&userid=' + $('#userid').val()
            + '&' + new String (Math.random()).substring (2, 11)
            + '&format=json&jsoncallback=?';
    
    //$('#debug').val(urlStr);
    
    $.get(urlStr,
    function(item){
        //var arr = list.split(",");
        //$('#debug').val('Res: ' + item);
        if (item > 0) {
            //$('#regid').val(arr[0]);
            //$('#debug').val(item);
            $('#company_list').selectOptions(item);
            $('#company_list').attr('disabled', 'disabled');
            $('#start').attr('disabled', 'disabled');
            $('#stop').removeAttr('disabled');
        }
    });

}

function getHost() {
    return 'http://192.168.163.128/TimeReg/ajax.asp';
    //return '/ajax.asp';
    //return 'http://localhost/takeamess/ajax.php';
    //return 'http://www.citypolarna.se/takeamess/ajax.php';
}

});

