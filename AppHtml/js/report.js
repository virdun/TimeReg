$(document).ready(function(){

        fillStats();
        $('#show_stats').click(function(){
          fillStats();
        });
        function fillStats() {
          	var currentTime = new Date();
          	var start = $('#start_date').val();
          	var end = $('#end_date').val();
          	var startDate = dateToTime(start);
          	var endDate = dateToTime(end);
          	
          	$('#stats').html('');
          	
            //console.log(startDate + ' <= ' + endDate);    
            if (startDate <= endDate) {
                //currentTime = startDate;
                //while (currentTime <= endDate) {
                    //console.log(startDate);
                    
                    urlStr  = 'http://90.184.164.241/timer/ajax.asp'
                            + '?module=Project&view=interval_report'
                            + '&userid=' + $('#user_id').val()
                            + '&start_date=' + jDateToStrDate(startDate)
                            + '&end_date=' + jDateToStrDate(endDate)
                            + '&' + new String (Math.random()).substring (2, 11)
                            + '&format=json&callback=?'
                            ;
                    //$('#debug').val(urlStr);
                    $.ajax({url: urlStr,
                                cache: true,
                                dataType: "jsonp",
                                success: function(projectList){
                                    //projList = projectList.split(',');
                                    var projCont;
                                    var len = projectList.days.length;
                                    for (d = 0; d < len; d++) {
                               	        i = 0;
                                        projCont += '<table style="width: 920px;">';
                                        projCont += '<tr><td colspan="4" style="border-bottom: 1px solid #333333;"><b>' + projectList.days[d].date + '</b></td></tr>';
                                        projCont += '<tr><th style="width: 200px;">Project</th><th></th><th style="width: 50px;">Sessions</th><th style="width: 50px;">Time</th></tr>';
                               	        //while (projList[i].project_id != undefined) {
                               	        var sessions = 0;
                               	        var minutes = 0;
                               	        for (key in projectList.days[d].list) { 
                               	          //element = projList[i].split('|');
                                          projCont += '<tr style="background: #dddddd;"><td>' + projectList.days[d].list[key].name + '</td><td>' + projectList.days[d].list[key].comments + '</td><td>' + projectList.days[d].list[key].stops + '</td><td>' + projectList.days[d].list[key].time + '</td></tr>';
                                          sessions += parseInt(projectList.days[d].list[key].stops);
                                          time = projectList.days[d].list[key].time.split(':');
                                          minutes += parseInt(time[1]) + 60 * parseInt(time[0]);
                               	          //i++;
                                        }
                                        time = secondsToTime(minutes * 60);
                                        projCont += '<tr><th>Total</th><th></th><th>' + sessions + '</th><th>' + time + '</th></tr>';
                                        projCont += '</table><hr />';
                                        projCont = $('#stats').html() + projCont;
                                    }
                                    $('#stats').html(projCont);
                                    $('#stats').show();
                              }
                    });
                    //currentTime.setDate(currentTime.getDate()+1);
                //}
            } else {
                alert('Start date must be before end date!');
            }
        }

        function jDateToStrDate(currentTime) {
            var month = currentTime.getMonth() + 1;
            var day = currentTime.getDate();
            var year = currentTime.getFullYear();
            if (day < 10) day = "0" + day;
            if (month < 10) month = "0" + month;
            return day + "-" + month + "-" + year;
        }
        
        function dateToTime(date){
            var dateArr = date.split('-');
            var year = dateArr[2];
            var month = dateArr[1];
            var day = dateArr[0];
            var time = new Date();
            time.setYear(year);
            time.setMonth(month-1);
            time.setDate(day);
            return time;
        }
        function secondsToTime(secs) {
            var hours = Math.floor(secs / (60 * 60));
           
            var divisor_for_minutes = secs % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);
         
            var divisor_for_seconds = divisor_for_minutes % 60;
            var seconds = Math.ceil(divisor_for_seconds);
           
            if (hours < 10) hours = "0" + hours;
            if (minutes < 10) minutes = "0" + minutes;

            return hours + ':' + minutes;
        }

});