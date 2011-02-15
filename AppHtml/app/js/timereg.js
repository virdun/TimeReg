$(document).ready(function(){
    $('#username').click(function(){
        $('#username').val('');
    });
    $('#password').focus(function(){
        $('#password').val('');
    });
    $('#login_button').bind('tap', function(){
        host = getHost();
        urlStr  = host
                + '?module=User&view=ajax_login'
                + '&username=' + $('#username').val()
                + '&password=' + $('#password').val()
                + '&' + new String (Math.random()).substring (2, 11)
                + '&format=json&callback=?'
                ;
  //$('#username').val(urlStr);
        $.ajax({url: urlStr,
                cache: true,
                dataType: "jsonp",
                success: function(data){
                  $('#username').val(data.user_id);
                  if (data.user_id > 0) {
                                
                    $('#username').val(''); //'OK: ' + data.user_id);
                    //$('#login').hide();
                    $('#userid').val(data.user_id);
                    getListOfProjects(data.user_id);
                    //$('#register').show();
                  } else {
                    $('#username').val('Fail: ' + data.user_id);
                  }
                }
        });
    });
    
    function getListOfProjects(userId) {
        host = getHost();
        $('#stop').hide();
        urlStr  = host
                + '?module=Project&view=project_list'
                + '&userid=' + $('#userid').val()
                + '&' + new String (Math.random()).substring (2, 11)
                + '&format=json&callback=?';
                ;
  
        $.ajax({url: urlStr,
                cache: true,
                dataType: "jsonp",
                success: function(projectList){
           	        //projList = projectList.split(',');
        
           	        i = 0;
           	        projCont = '';
         	          //projCont += '<option value="0" selected="selected">Select</option>';
           	        //while (projList[i].project_id != undefined) {
           	        for (key in projectList.list) { 
           	          //element = projList[i].split('|');
           	          projCont += '<option value="' + projectList.list[key].project_id + '">' + projectList.list[key].name + '</option>';
           	          //i++;
                    }
                    $.mobile.changePage('#register');

                    $('#company_list').empty();
           	        $('#company_list').append(projCont);
           	        //$('#company_list').append(projCont).updateSelect();
           	        //$('#company_list').append(projCont).selectmenu('refresh');
           	        
           	        //$('#company_list').updateSelect();
           	        $('#company_list').selectmenu('refresh');

                    getActive();
           	    }
        });
    }
    
    $('#start').bind('tap', function() {
        host = getHost();
        if ($('#company_list').val() > 0) {
            urlStr  = host
                    + '?module=Project&view=start'
                    + '&userid=' + $('#userid').val()
                    + '&projectid=' + $('#company_list').val()
                    + '&comment=' + $('#comment').val()
                    + '&' + new String (Math.random()).substring (2, 11)
                    + '&format=json&callback=?';
                    ;
      
        $.ajax({url: urlStr,
                cache: true,
                dataType: "jsonp",
                success: function(regId){
         	        //if (regId.ok > 0) {
           	        $('#regid').val(regId);
           	        $('#company_list').hide(); //attr('disabled', 'disabled');
                    $('#project_list').hide(); //attr('disabled', 'disabled').selectmenu('refresh');
           	        $('#selected_project').empty().append($('#company_list :selected').text()).show();
           	        $('#start').hide();
                    $('#stop').show();
                    fillStats();
                	//}
                }
            });
        }
    });

    $('#stop').bind('tap', function() {
        host = getHost();
        urlStr  = host
                + '?module=Project&view=stop'
                + '&userid=' + $('#userid').val()
                + '&projectid=' + $('#company_list').val()
                + '&comment=' + $('#comment').val()
                //+ '&id=' + $('#regid').val()
                + '&' + new String (Math.random()).substring (2, 11)
                + '&format=json&callback=?';
                ;
        //$('#debug').val(urlStr);
        $.ajax({url: urlStr,
                cache: true,
                dataType: "jsonp",
                success: function(success){
           	        $('#debug').val(success.ok);
           	        if (success.ok > 0) {
                        $('#company_list').show(); //removeAttr('disabled');
                        $('#project_list').show(); //attr('disabled', 'disabled').selectmenu('refresh');
               	        $('#selected_project').hide();
                        $('#start').show();
               	        $('#stop').hide();
                        $('#regid').val(0);
                        fillStats();
                		}
                }
        });
    });

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
                + '&format=json&callback=?'
                ;
        //$('#debug').val(urlStr);
        $.ajax({url: urlStr,
                    cache: true,
                    dataType: "jsonp",
                    success: function(projectList){
                        //projList = projectList.split(',');
               	        i = 0;
                        projCont = '<table>';
               	        //while (projList[i].project_id != undefined) {
               	        for (key in projectList.list) {
               	          //element = projList[i].split('|');
                          projCont += '<tr><td>' + projectList.list[key].name + '</td><td>' + projectList.list[key].time + '</td></tr>';
               	          //i++;
                        }
                        projCont += '</table>';
                        $('#stats').html(projCont);
                        $('#stats').show();
                  }
        });
    
    }
    
    function getActive() {
        //$('#debug').val('check active');
        host = getHost();
        urlStr  = host
                + '?module=Project&view=has_open'
                + '&userid=' + $('#userid').val()
                + '&' + new String (Math.random()).substring (2, 11)
                + '&format=json&callback=?';
        
        //$('#debug').val(urlStr);
            $.ajax({url: urlStr,
                    cache: true,
                    dataType: "jsonp",
                    success: function(item){
                        //var arr = list.split(",");
                        //$('#debug').val('Res: ' + item);
                        if (item.has_open > 0) {
                            //$('#regid').val(arr[0]);
                            //$('#debug').val(item);
                            $('#company_list').selectOptions(item.has_open).selectmenu('refresh');
                            $('#company_list').hide(); //attr('disabled', 'disabled').selectmenu('refresh');
                            $('#project_list').hide(); //attr('disabled', 'disabled').selectmenu('refresh');
                   	        $('#selected_project').empty().append($('#company_list :selected').text()).show();
                            $('#start').hide();
                            $('#stop').show();
                            if (item.comment) {
                              $('#comment').val(item.comment);
                            }
                        }
//                        $.mobile.changePage('#register');
                    } 
            });
    
    }
    
    function getHost() {
        return 'http://90.184.164.241/timer/ajax.asp';
        //return 'http://192.168.163.128/TimeReg/ajax.asp';
        //return 'http://localhost/takeamess/ajax.php';
        //return 'http://www.citypolarna.se/takeamess/ajax.php';
    }
    
    $('#logout').bind('tap', function() {
        $('#register').hide();
        $('#stats').hide();
        $('#login').show();
        $('#userid').val(0);
        $('#password').val('Password');
        $('#username').val('Username');
        $('#company_list').selectOptions(0);
        $('#selected_project').hide();
        $('#start').show();
        $('#stop').hide();
         $('#comment').val('');
        DockGadget();
    });
    $.fn.updateSelect = function() {
      return this.each(function() {
        id = $(this).attr('id');
        $('#' + id + '-menu').remove();
        $('#' + id + '-button').remove();
        $(this).unwrap().customSelect();      
      });
    }
});

