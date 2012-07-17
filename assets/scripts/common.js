(function(){

  var Common = {
    stripTime: function (date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    },
    sortByTime: function(a, b) {
      a = a.dates;
      b = b.dates;

      var aEnd = a[a.length - 1].getTime();
      var bEnd = b[b.length - 1].getTime();
      if (aEnd != bEnd) {
          return aEnd - bEnd;
      }
      return a[0].getTime() - b[0].getTime();
    },
    filter: function(events, cond) {
        tmpEvents = [];
        for (var i = 0; i < events.length; i++) {
            var tmpDates = [];
            for (var j = 0; j < events[i].dates.length; j++) {
                var curTime = events[i].dates[j].getTime();
                if (curTime >= cond.startTime && curTime <= cond.endTime) {
                    tmpDates.push(events[i].dates[j]);
                }
            }
            // FIXME: create event structure
            if (tmpDates.length > 0) {
              tmpEvent = events[i];
              tmpEvent.dates = tmpDates;
              tmpEvents.push(tmpEvent);
            }
        }
        events = tmpEvents;
    }
  };
  window.Common = Common;
})();
