(window.onload = function() {
  var tl, resizeTimerID;
   var bandInfos = [
   Timeline.createBandInfo({
           width:          "90%", 
           intervalUnit:   Timeline.DateTime.HOUR, 
           intervalPixels: 40
       }),
   Timeline.createBandInfo({
            width:          "10%", 
            intervalUnit:   Timeline.DateTime.DAY, 
            intervalPixels: 160
        })];
  bandInfos[1].syncWith = 0;
  bandInfos[1].highlight = true;
   tl = Timeline.create(document.getElementById("timeline"), bandInfos);
     if (resizeTimerID == null) {
         resizeTimerID = window.setTimeout(function() {
             resizeTimerID = null;
             tl.layout();
         }, 500);
     }
})();