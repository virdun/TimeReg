$(document).ready(function() {
    var $calendar = $('#calendar');
    var id = 10;
   
    //$.getJSON('/Calendar/WebService.wso/getData/JSON?startDate=2009-10-01&endDate=2009-11-01&' + new String (Math.random()).substring (2, 11),
    //function (eventData){
       $calendar.weekCalendar({
          timeslotsPerHour : 4,
          allowCalEventOverlap : true,
          overlapEventsSeparate: true,
          firstDayOfWeek : 1,
          businessHours :{start: 8, end: 18, limitDisplay: true },
          daysToShow : 7,
          height : function($calendar) {
             return $(window).height() - $("h1").outerHeight() - 1;
          },
          eventRender : function(calEvent, $event) {
             if (calEvent.end.getTime() < new Date().getTime()) {
                $event.css("backgroundColor", "#aaa");
                $event.find(".wc-time").css({
                   "backgroundColor" : "#999",
                   "border" : "1px solid #888"
                });
             }
          },
          draggable : function(calEvent, $event) {
             return calEvent.readOnly != true;
          },
          resizable : function(calEvent, $event) {
             return calEvent.readOnly != true;
          },
          eventNew : function(calEvent, $event) {
                var start, end;
                $('<div id="dim_background" style="display: none;"></div>').appendTo('body');
                $('#dim_background')
                .css({
                    'height' : $(document).height(),
                    'position' : 'fixed',
                    'top' : '0px',
                    'left' : '0px',
                    'border' : '1px solid #333333',
                    'background' : '#333333',
                    'opacity' : '0.4',
                    'width' : '100%',
                    'z-index' : '1'
                 })
                .show();
                $(window).bind('resize', function(){
                    $('#dim_background').css('height', $(window).height());
                });
                $('#edit_event')
                .corner()
                .draggable()
                .addClass('ui-corner-all')
                .css({
                    'position' : 'fixed',
                    'border' : '1px solid #83f7fd',
                    'background' : '#ffffff',
                    'z-index' : '2',
                    'height' : '400px',
                    'width' : '400px',
                    'top' : '50%',
                    'left' : '50%',
                    'margin-top' : '-200px',
                    'margin-left' : '-200px',
                    'padding' : '10px'
                })
                .show();
               $('[name="Event__Id"]').val('');
                var oForm = vdf.getForm("event_form");
                oForm.getDD("event").onAfterClear.addListener(after_clear);
                oForm.doClear();
//                oForm.doFind(vdf.EQ);
                function after_clear(oEvent) {
                    oEvent.oSource.onAfterClear.removeListener(after_clear);
                    //alert(calEvent.id);
                    $('[name="Event__Title"]').val(calEvent.id);
                    //$('[name="Event__Title"]').val('');
                    $('[name="Event__Text"]').val('');
                    
                    start = calEvent.start;
                    end = calEvent.end;
                    
                    //alert(start);
                    //vdfCal = vdf.gui.PopupCalendar;
                    //alert(oForm.getVdfAttribute("sDateFormat", "mm/dd/yyyy", true));
                    var dateFormat = oForm.oMetaData.getGlobalProperty("sDateFormat");
                    dateFormat = dateFormat.replace("yyyy", "yy");
                    //alert(dateFormat);
                    
                    $('[name="Event__Start_Date"]').val($.datepicker.formatDate(dateFormat, calEvent.start));
                    $('[name="Event__End_Date"]').val($.datepicker.formatDate(dateFormat, calEvent.start));
                    
                    hour   = (calEvent.start.getHours() < 10 ? '0' : '') + calEvent.start.getHours();
                    minute = (calEvent.start.getMinutes() < 10 ? '0' : '') + calEvent.start.getMinutes();
                    $('[name="Event__Start_Time"]').val(hour + ':' + minute);
                    
                    hour   = (calEvent.end.getHours() < 10 ? '0' : '') + calEvent.end.getHours();
                    minute = (calEvent.end.getMinutes() < 10 ? '0' : '') + calEvent.end.getMinutes();
                    $('[name="Event__End_Time"]').val(hour + ':' + minute);
                }
                $('#save_event2').click(function() {
                    //alert('saving... ' + calEvent.id);
                    var oForm = vdf.getForm("event_form");
                    oForm.getDD("event").onAfterSave.addListener(after_saving);
                    oForm.doSave("event");
                    function after_saving(oEvent) {
                        //optionally you could remove the listener right away
                        oEvent.oSource.onAfterSave.removeListener(after_saving);
                        
                        //$calendar.weekCalendar("removeUnsavedEvents");
                        if(oEvent.bError){
                            alert("An error occurred!");
                        }else{

                            //alert($('[name="Event__Id"]').val() + ' ' + start);
                            calEvent.id = $('[name="Event__Id"]').val();
                            //calEvent.start = start; //$('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__Start_Time"]').val()+ ':00';
                            //calEvent.end = end; //$('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__End_Time"]').val()+ ':00';
                            //alert($('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__Start_Time"]').val()+ ':00');
                            //alert(start);
                            var data = dateConverter($('[name="Event__Start_Date"]').val());
                            //var data = dat.split('-');
                            var year = parseInt(data[2], 10);
                            var month = parseInt(data[1], 10)-1;
                            var day = parseInt(data[0], 10);

                            var tim = $('[name="Event__Start_Time"]').val()+ ':00';
                            var data = tim.split(':');
                            var hours = parseInt(data[0], 10);
                            var minutes = parseInt(data[1], 10);
                            //alert(year+', '+month+', '+day+', '+hours+', '+minutes);
                            calEvent.start = new Date(year,month,day,hours,minutes,0);
                            //calEvent.start = new Date($('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__Start_Time"]').val()+ ':00');

                            var data = dateConverter($('[name="Event__Start_Date"]').val());
                            //var dat = $('[name="Event__Start_Date"]').val();
                            //var data = dat.split('-');
                            var year = parseInt(data[2], 10);
                            var month = parseInt(data[1], 10)-1;
                            var day = parseInt(data[0], 10);

                            var tim = $('[name="Event__End_Time"]').val()+ ':00';
                            var data = tim.split(':');
                            var hours = parseInt(data[0], 10);
                            var minutes = parseInt(data[1], 10);
                            calEvent.end = new Date(year,month,day,hours,minutes,0);
                            
                            //alert(calEvent.start + " = " + start);
                            
                            //calEvent.start = $('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__Start_Time"]').val()+ ':00';
                            //calEvent.end = $('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__End_Time"]').val()+ ':00';
                            calEvent.title = $('[name="Event__Title"]').val();
                            calEvent.body = $('[name="Event__Text"]').val();
                            calEvent.text = $('[name="Event__Text"]').val();
                            calEvent.user_color = $('[name="User__Color"]').val();
                            calEvent.user_name = $('[name="User__Name"]').val();
                            calEvent.customer_name = $('[name="Customer__Name"]').val();
                            
                            //alert ($('[name="User__UserId"]').val());
                            //calEvent.removeClass();
                            //calEvent.addClass('cal-event ui-corner-all ui-resizable ui-draggable');
                            $calendar.weekCalendar("removeUnsavedEvents");
                            $calendar.weekCalendar("updateEvent", calEvent);
        
                            $('#dim_background').remove();
                            $('#edit_event').hide();

                        }
                    };
                    $('#save_event2').unbind('click');
                });
                
                $('#delete_button').hide();
                $('#cancel_button').click(function(){
                        $('#dim_background').remove();
                        $('#edit_event').hide();
                        $calendar.weekCalendar("removeUnsavedEvents");
                });
                $(document).keydown(function(e){
                    if (e.keyCode == 27) {
                        $('#dim_background').remove();
                        $('#edit_event').hide();
                        $calendar.weekCalendar("removeUnsavedEvents");
                    }
                });
              
              //alert();
          },
          eventDrop : function(calEvent, $event) {
              $('[name="Event__Id"]').val(calEvent.id);
              $('[name="Event__Id"]').focus();
              //Call find equal on the Event__id
              var oForm = vdf.getForm("event_form");
              oForm.getDD("event").onAfterFind.addListener(after_find);
              
              oForm.getDD("event").Id = calEvent.id;
               //var oField = oForm.oSource;
                //oForm.oSource.sTable = 'event';
                //oForm.oSource.sField = 'id';
              //oForm.doFind(vdf.EQ, oForm.oSource);
              oForm.doFind(vdf.EQ, oForm.getDEO("event.id"));

            function after_find(oEvent) {
                oEvent.oSource.onAfterFind.removeListener(after_find);
                if (oEvent.bError) {
                    alert("An error occurred!");
                } else {
                    setTimeout(function(){
                        var dateFormat = oForm.oMetaData.getGlobalProperty("sDateFormat");
                        dateFormat = dateFormat.replace("yyyy", "yy");

                        $('[name="Event__Start_Date"]').val($.datepicker.formatDate(dateFormat, calEvent.start));
                        $('[name="Event__End_Date"]').val($.datepicker.formatDate(dateFormat, calEvent.start));
                        
                        hour   = (calEvent.start.getHours() < 10 ? '0' : '') + calEvent.start.getHours();
                        minute = (calEvent.start.getMinutes() < 10 ? '0' : '') + calEvent.start.getMinutes();
                        $('[name="Event__Start_Time"]').val(hour + ':' + minute);
                        
                        hour   = (calEvent.end.getHours() < 10 ? '0' : '') + calEvent.end.getHours();
                        minute = (calEvent.end.getMinutes() < 10 ? '0' : '') + calEvent.end.getMinutes();
                        $('[name="Event__End_Time"]').val(hour + ':' + minute);
                        
                        var oForm = vdf.getForm("event_form");
                        oForm.doSave("event");
                    }, 100);
                }
            }
          },
          eventResize : function(calEvent, $event) {
              $('[name="Event__Id"]').val(calEvent.id);
              $('[name="Event__Id"]').focus();
              //Call find equal on the Event__id
              var oForm = vdf.getForm("event_form");
              oForm.getDD("event").onAfterFind.addListener(after_find);
              //oForm.doFind(vdf.EQ);
              oForm.doFind(vdf.EQ, oForm.getDEO("event.id"));
             
              function after_find(oEvent) {
                    oEvent.oSource.onAfterFind.removeListener(after_find);
                    if(oEvent.bError){
                        alert("An error occurred!");
                    }else{
                        setTimeout(function(){
                            var dateFormat = oForm.oMetaData.getGlobalProperty("sDateFormat");
                            dateFormat = dateFormat.replace("yyyy", "yy");

                            $('[name="Event__Start_Date"]').val($.datepicker.formatDate(dateFormat, calEvent.start));
                            $('[name="Event__End_Date"]').val($.datepicker.formatDate(dateFormat, calEvent.start));
                            
                            hour   = (calEvent.start.getHours() < 10 ? '0' : '') + calEvent.start.getHours();
                            minute = (calEvent.start.getMinutes() < 10 ? '0' : '') + calEvent.start.getMinutes();
                            $('[name="Event__Start_Time"]').val(hour + ':' + minute);
                            
                            hour   = (calEvent.end.getHours() < 10 ? '0' : '') + calEvent.end.getHours();
                            minute = (calEvent.end.getMinutes() < 10 ? '0' : '') + calEvent.end.getMinutes();
                            $('[name="Event__End_Time"]').val(hour + ':' + minute);
                            
                            var oForm = vdf.getForm("event_form");
                            oForm.doSave("event");
                        }, 100);
                    }
              }
          },
          eventClick : function(calEvent, $event) {
                
                if (calEvent.readOnly) {
                    return;
                }
                var start, end;
                $('<div id="dim_background" style="display: none;"></div>').appendTo('body');
                $('#dim_background')
                .css({
                        'height' : $(document).height(),
                        'position' : 'fixed',
                        'top' : '0px',
                        'left' : '0px',
                        'border' : '1px solid #333333',
                        'background' : '#333333',
                        'opacity' : '0.4',
                        'width' : '100%',
                        'z-index' : '1'
                })
                .show();
                $(window).bind('resize', function(){
                    $('#dim_background').css('height', $(window).height());
                });
                $('#edit_event')
                .corner()
                .draggable()
                .addClass('ui-corner-all')
                .css({
                    'position' : 'fixed',
                    'border' : '1px solid #83f7fd',
                    'background' : '#ffffff',
                    'z-index' : '2',
                    'height' : '400px',
                    'width' : '400px',
                    'top' : '50%',
                    'left' : '50%',
                    'margin-top' : '-200px',
                    'margin-left' : '-200px',
                    'padding' : '10px'
                })
                .show();

                //$('[name="Event__Id"]').val(calEvent.id);
                //$('[name="Event__Id"]').focus();
                
                //Call find equal on the Event__id
                var oForm = vdf.getForm("event_form");
                oForm.getDD("event").onAfterFind.addListener(after_find);
                oForm.setBufferValue("event.id", calEvent.id);
                oForm.doFind(vdf.EQ, oForm.getDEO("event.id"));
                //oForm.doFind(vdf.EQ);
                function after_find(oEvent) {
                    oEvent.oSource.onAfterFind.removeListener(after_find);
                    
                    //alert(calEvent.id);
                    $('[name="Event__Title"]').val(calEvent.title);
                    //$('[name="Event__Title"]').val('');
                    $('[name="Event__Text"]').val(calEvent.text);
                    
                    start = calEvent.start;
                    end = calEvent.end;
                    
                    //alert(start);
                    var dateFormat = oForm.oMetaData.getGlobalProperty("sDateFormat");
                    dateFormat = dateFormat.replace("yyyy", "yy");
                    
                    $('[name="Event__Start_Date"]').val($.datepicker.formatDate(dateFormat, calEvent.start));
                    $('[name="Event__End_Date"]').val($.datepicker.formatDate(dateFormat, calEvent.start));
                    
                    hour   = (calEvent.start.getHours() < 10 ? '0' : '') + calEvent.start.getHours();
                    minute = (calEvent.start.getMinutes() < 10 ? '0' : '') + calEvent.start.getMinutes();
                    $('[name="Event__Start_Time"]').val(hour + ':' + minute);
                    
                    hour   = (calEvent.end.getHours() < 10 ? '0' : '') + calEvent.end.getHours();
                    minute = (calEvent.end.getMinutes() < 10 ? '0' : '') + calEvent.end.getMinutes();
                    $('[name="Event__End_Time"]').val(hour + ':' + minute);
                }                    
                $('#save_event2').click(function() {
                    //alert('saving... ' + calEvent.id);
                    var oForm = vdf.getForm("event_form");
                    oForm.getDD("event").onAfterSave.addListener(after_saving);
                    oForm.doSave("event");
                    function after_saving(oEvent) {
                        //  optionally you could remove the listener right away
                        oEvent.oSource.onAfterSave.removeListener(after_saving);
                       
                        //$calendar.weekCalendar("removeUnsavedEvents");
                        if(oEvent.bError){
                            alert("An error occurred!");
                        }else{

                            //alert($('[name="Event__Id"]').val() + ' ' + start);
                            calEvent.id = $('[name="Event__Id"]').val();

                            //var dat = $('[name="Event__Start_Date"]').val();
                            //var data = dat.split('-');
                            var data = dateConverter($('[name="Event__Start_Date"]').val());
                            var year = data[0];
                            var month = parseInt(data[1], 10)-1;
                            var day = parseInt(data[2], 10);

                            var tim = $('[name="Event__Start_Time"]').val()+ ':00';
                            var data = tim.split(':');
                            var hours = parseInt(data[0], 10);
                            var minutes = parseInt(data[1], 10);
                            //alert(year+', '+month+', '+day+', '+hours+', '+minutes);
                            calEvent.start = new Date(year,month,day,hours,minutes,0);
                            //calEvent.start = new Date($('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__Start_Time"]').val()+ ':00');

                            //var dat = $('[name="Event__Start_Date"]').val();
                            //var data = dat.split('-');
                            var data = dateConverter($('[name="Event__Start_Date"]').val());
                            var year = data[0];
                            var month = parseInt(data[1], 10)-1;
                            var day = parseInt(data[2], 10);

                            var tim = $('[name="Event__End_Time"]').val()+ ':00';
                            var data = tim.split(':');
                            var hours = parseInt(data[0], 10);
                            var minutes = parseInt(data[1], 10);
                            calEvent.end = new Date(year,month,day,hours,minutes,0);
                            
                            //calEvent.start = start; //$('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__Start_Time"]').val()+ ':00';
                            //calEvent.end = end; //$('[name="Event__Start_Date"]').val() + ' ' + $('[name="Event__End_Time"]').val()+ ':00';
                            calEvent.title = $('[name="Event__Title"]').val();
                            calEvent.body = $('[name="Event__Text"]').val();
                            calEvent.text = $('[name="Event__Text"]').val();
                            calEvent.user_color = $('[name="User__Color"]').val();
                            calEvent.user_name = $('[name="User__Loginname"]').val();
                            calEvent.customer_name = $('[name="Customer__Name"]').val();
                            //alert ($('[name="User__UserId"]').val());
                            
                            //calEvent.removeClass();
                            //calEvent.addClass('cal-event ui-corner-all ui-resizable ui-draggable');
                            
                            //$calendar.weekCalendar("removeUnsavedEvents");
                            $calendar.weekCalendar("updateEvent", calEvent);
        
                            $('#dim_background').remove();
                            $('#edit_event').hide();
                            //this.data();

                        }
                    };
                    $('#save_event2').unbind('click');
                    //alert();
                
                });
                $('#delete_button').show();
                $('#delete_button').click(function(){
                //alert('saving... ' + calEvent.id);
                var oForm = vdf.getForm("event_form");
                oForm.getDD("event").onAfterDelete.addListener(after_delete);
                oForm.doDelete("event");
                function after_delete(oEvent) {
                    //  optionally you could remove the listener right away
                    oEvent.oSource.onAfterDelete.removeListener(after_delete);
                   
                    //$calendar.weekCalendar("removeUnsavedEvents");
                    if(oEvent.bError){
                        alert("An error occurred!");
                    }else{

                        
                        $calendar.weekCalendar("removeEvent", calEvent.id);
                        
                        $('#dim_background').remove();
                        $('#edit_event').hide();

                        //setTimeout(function(){
                            //$calendar.weekCalendar("refresh");
                        //}, 100);
                    }
                };
                $('#delete_button').unbind('click');
                //alert();
            
                });
                $('#cancel_button').click(function(){
                        $('#dim_background').remove();
                        $('#edit_event').hide();
                        $calendar.weekCalendar("removeUnsavedEvents");
                });
                $(document).keydown(function(e){
                    if (e.keyCode == 27) {
                        $('#dim_background').remove();
                        $('#edit_event').hide();
                        $calendar.weekCalendar("removeUnsavedEvents");
                    }
                });
            
                
          },
          eventMouseover : function(calEvent, $event) {
          },
          eventMouseout : function(calEvent, $event) {
          },
          noEvents : function() {
    
          },
          //data : eventData
          data : function(start, end, callback) {
              var d = new Date(start.getTime());
              var sdate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
              var d = new Date(end.getTime());
              var edate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
              $.getJSON('WebService.wso/getData/JSON?startDate='+sdate+'&endDate='+edate+'&' + new String (Math.random()).substring (2, 11), {
                  start: sdate,
                  end: edate
              },  function(result) {
                  callback(result);
              });
          }
      });

   function resetForm($dialogContent) {
      $dialogContent.find("input").val("");
      $dialogContent.find("textarea").val("");
   }

   /*
    * Sets up the start and end time fields in the calendar event
    * form for editing based on the calendar event being edited
    */
   function setupStartAndEndTimeFields($startTimeField, $endTimeField, calEvent, timeslotTimes) {

      for (var i = 0; i < timeslotTimes.length; i++) {
         var startTime = timeslotTimes[i].start;
         var endTime = timeslotTimes[i].end;
         var startSelected = "";
         if (startTime.getTime() === calEvent.start.getTime()) {
            startSelected = "selected=\"selected\"";
         }
         var endSelected = "";
         if (endTime.getTime() === calEvent.end.getTime()) {
            endSelected = "selected=\"selected\"";
         }
         $startTimeField.append("<option value=\"" + startTime + "\" " + startSelected + ">" + timeslotTimes[i].startFormatted + "</option>");
         $endTimeField.append("<option value=\"" + endTime + "\" " + endSelected + ">" + timeslotTimes[i].endFormatted + "</option>");

      }
      $endTimeOptions = $endTimeField.find("option");
      $startTimeField.trigger("change");
   }

   var $endTimeField = $("select[name='end']");
   var $endTimeOptions = $endTimeField.find("option");

   //reduces the end time options to be only after the start time options.
   $("select[name='start']").change(function() {
      var startTime = $(this).find(":selected").val();
      var currentEndTime = $endTimeField.find("option:selected").val();
      $endTimeField.html(
            $endTimeOptions.filter(function() {
               return startTime < $(this).val();
            })
      );

      var endTimeSelected = false;
      $endTimeField.find("option").each(function() {
         if ($(this).val() === currentEndTime) {
            $(this).attr("selected", "selected");
            endTimeSelected = true;
            return false;
         }
      });

      if (!endTimeSelected) {
         //automatically select an end date 2 slots away.
         $endTimeField.find("option:eq(1)").attr("selected", "selected");
      }

   });
    
    // Not a good practice 
    dateFormat = 'yy-mm-dd';
    
    $(".datepicker").datepicker({ dateFormat: dateFormat, firstDay: 1 });
    $(".ui-datepicker").css({'z-index' : '20'});
    //$('.datepicker').datepicker('option',  'altFormat', 'dd-mm-yy' );
    //$.datepicker.formatDate('dd-mm-yy', new Date(2007, 1 - 1, 26));

    function dateConverter(date) {
        var data = date.split('-');
        if (data.length == 1) {
          data = date.split('/');
        }
        if (data.length == 1) {
          alert('Failed converting date.');
          exit;
        }
        
        //alert(date + ' ' + data[0].length);
        if (data[2].length == 4) {
            return data;
        } else {
            return data.reverse();
        }
        //alert('Converting');
    }

});
