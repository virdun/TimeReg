$(document).ready(function() {
    var $calendar = $('#calendar');
    var id = 10;
   
    $.getJSON('/Calendar/WebService.wso/getData/JSON?startDate=2009-10-01&endDate=2009-11-01&' + new String (Math.random()).substring (2, 11),
    function (eventData){
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
             var $dialogContent = $("#event_edit_container");
             resetForm($dialogContent);
             //var id = $dialogContent.find("select[name='id']").val(calEvent.id);
             var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
             var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
             var titleField = $dialogContent.find("input[name='title']");
             var bodyField = $dialogContent.find("textarea[name='body']");
             
             var oForm = vdf.getForm("event_form");
             oForm.doClear();

             $dialogContent.dialog({
                modal: true,
                title: "New Calendar Event",
                close: function() {
                   $dialogContent.dialog("destroy");
                   $dialogContent.hide();
                   $('#calendar').weekCalendar("removeUnsavedEvents");
                },
                buttons: {
                   save : function() {
//                      $('[name="Event__Id"]').val(calEvent.id);
                      $('[name="Event__Start_Date"]').val($.datepicker.formatDate('yy-mm-dd', calEvent.start));
                      $('[name="Event__End_Date"]').val($.datepicker.formatDate('yy-mm-dd', calEvent.start));
                
                        hour   = (calEvent.start.getHours() < 10 ? '0' : '') + calEvent.start.getHours();
        	            minute = (calEvent.start.getMinutes() < 10 ? '0' : '') + calEvent.start.getMinutes();
                      $('[name="Event__Start_Time"]').val(hour + ':' + minute);
        
                        hour   = (calEvent.end.getHours() < 10 ? '0' : '') + calEvent.end.getHours();
        	            minute = (calEvent.end.getMinutes() < 10 ? '0' : '') + calEvent.end.getMinutes();
                      $('[name="Event__End_Time"]').val(hour + ':' + minute);
                      $('[name="Event__Title"]').val(titleField.val());
                      $('[name="Event__Text"]').val(bodyField.val());
                      
                      //alert($('[name="Event__Title"]').val());

                        function after_saving(oEvent) {
                            //  optionally you could remove the listener right away
                            oEvent.oSource.onAfterSave.removeListener(after_saving);
                           
                            $calendar.weekCalendar("removeUnsavedEvents");
                            if(oEvent.bError){
                                alert("An error occurred!");
                            }else{
                                //alert('Finished success!!!');
                              calEvent.id = $('[name="Event__Id"]').val();
                              calEvent.start = new Date(startField.val());
                              calEvent.end = new Date(endField.val());
                              calEvent.title = titleField.val();
                              calEvent.text = bodyField.val();
            
                              $calendar.weekCalendar("updateEvent", calEvent);
                              $dialogContent.dialog("close");
                            }
                        };
                        var oForm = vdf.getForm("event_form");
                        oForm.getDD("event").onAfterSave.addListener(after_saving);
                        oForm.doSave("event");

                   },
                   cancel : function() {
                      $dialogContent.dialog("close");
                   }
                }
             }).show();
    
             $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
             setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
    
          },
          eventDrop : function(calEvent, $event) {
              $('[name="Event__Id"]').val(calEvent.id);
              //Call find equal on the Event__id
              var oForm = vdf.getForm("event_form");
              oForm.getDD("event").onAfterFind.addListener(after_find);
              oForm.doFind(vdf.EQ);
              
              function after_find(oEvent) {
                    oEvent.oSource.onAfterFind.removeListener(after_find);
                    if(oEvent.bError){
                        alert("An error occurred!");
                    }else{
                        setTimeout(function(){
                            $('[name="Event__Start_Date"]').val($.datepicker.formatDate('yy-mm-dd', calEvent.start));
                            $('[name="Event__End_Date"]').val($.datepicker.formatDate('yy-mm-dd', calEvent.start));
                            
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
              //Call find equal on the Event__id
              var oForm = vdf.getForm("event_form");
              oForm.getDD("event").onAfterFind.addListener(after_find);
              oForm.doFind(vdf.EQ);
              
              function after_find(oEvent) {
                    oEvent.oSource.onAfterFind.removeListener(after_find);
                    if(oEvent.bError){
                        alert("An error occurred!");
                    }else{
                        setTimeout(function(){
                            $('[name="Event__Start_Date"]').val($.datepicker.formatDate('yy-mm-dd', calEvent.start));
                            $('[name="Event__End_Date"]').val($.datepicker.formatDate('yy-mm-dd', calEvent.start));
                            
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
              $('[name="Event__Id"]').val(calEvent.id);
              //Call find equal on the Event__id
              var oForm = vdf.getForm("event_form");
              oForm.getDD("event").onAfterFind.addListener(after_find);
              oForm.doFind(vdf.EQ);
              function after_find(oEvent) {
                     oEvent.oSource.onAfterFind.removeListener(after_find);
                     var $dialogContent = $("#event_edit_container");
                     calEvent.title = $('[name="Event__Title"]').val();
                     calEvent.body = $('[name="Event__Text"]').val();
                     resetForm($dialogContent);
                     var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
                     var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
                     var titleField = $dialogContent.find("input[name='title']").val(calEvent.title);
                     var bodyField = $dialogContent.find("textarea[name='body']").val(calEvent.body);
                     bodyField.val(calEvent.body);

                     $dialogContent.dialog({
                        modal: true,
                        title: "Edit - " + calEvent.title,
                        close: function() {
                           $dialogContent.dialog("destroy");
                           $dialogContent.hide();
                           $('#calendar').weekCalendar("removeUnsavedEvents");
                        },
                        buttons: {
                           save : function() {
                                
                                        calEvent.start = new Date(startField.val());
                                        calEvent.end = new Date(endField.val());
                                        calEvent.title = titleField.val();
                                        calEvent.body = bodyField.val();
                                        $('[name="Event__Start_Date"]').val($.datepicker.formatDate('yy-mm-dd', calEvent.start));
                                        $('[name="Event__End_Date"]').val($.datepicker.formatDate('yy-mm-dd', calEvent.start));
                                        
                                        hour   = (calEvent.start.getHours() < 10 ? '0' : '') + calEvent.start.getHours();
                                        minute = (calEvent.start.getMinutes() < 10 ? '0' : '') + calEvent.start.getMinutes();
                                        $('[name="Event__Start_Time"]').val(hour + ':' + minute);
                                        
                                        hour   = (calEvent.end.getHours() < 10 ? '0' : '') + calEvent.end.getHours();
                                        minute = (calEvent.end.getMinutes() < 10 ? '0' : '') + calEvent.end.getMinutes();
                                        $('[name="Event__End_Time"]').val(hour + ':' + minute);
                                        $('[name="Event__Title"]').val(calEvent.title);
                                        $('[name="Event__Text"]').val(calEvent.body);
                                        
                                        //alert($('[name="Event__Title"]').val());
                                        function after_saving_e(oEvent) {
                                           //alert('after_save_e');
                                            //  optionally you could remove the listener right away
                                            oEvent.oSource.onAfterSave.removeListener(after_saving_e);
                                            $calendar.weekCalendar("removeUnsavedEvents");
                                            if(oEvent.bError){
                                                alert("An error occurred!");
                                            }else{
                                                //alert('Finished success!!!');
                                              /*
                                              calEvent.id = $('[name="Event__Id"]').val();
                                              calEvent.start = new Date(startField.val());
                                              calEvent.end = new Date(endField.val());
                                              calEvent.title = titleField.val();
                                              calEvent.body = bodyField.val();
                                              calEvent.text = bodyField.val();
                                              */
                                              $calendar.weekCalendar("updateEvent", calEvent);
                                              $dialogContent.dialog("close");
                                            }
                                        };
                                        
                                        var oForm = vdf.getForm("event_form");
                                        oForm.getDD("event").onAfterSave.addListener(after_saving_e);
                                        oForm.doSave("event");
        
        
                           },
                           "delete" : function() {
                                var oForm = vdf.getForm("event_form");
                                oForm.doDelete("event");
                              $calendar.weekCalendar("removeEvent", calEvent.id);
                              $dialogContent.dialog("close");
                           },
                           cancel : function() {
                              $dialogContent.dialog("close");
                           }
                        }
                     }).show();
            
                     var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
                     var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
                     $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
                     setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
                     $(window).resize().resize(); //fixes a bug in modal overlay size ??


                }    
    
          },
          eventMouseover : function(calEvent, $event) {
          },
          eventMouseout : function(calEvent, $event) {
          },
          noEvents : function() {
    
          },
          data : eventData
          });
       });

        function pausecomp(millis)
        {
            var date = new Date();
            var curDate = null;
            
            do { curDate = new Date(); }
            while(curDate-date < millis);
        }

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


   var $about = $("#about");

   $("#about_button").click(function() {
      $about.dialog({
         title: "About this calendar demo",
         width: 600,
         close: function() {
            $about.dialog("destroy");
            $about.hide();
         },
         buttons: {
            close : function() {
               $about.dialog("close");
            }
         }
      }).show();
   });


});
