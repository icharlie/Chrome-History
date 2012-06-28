window.onload = function() {
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
  $("#search-button").click(function() {
        var selectedItems = $("#catalog :checkbox:checked");
        var keyword = $("#search-field").val();
        selectedItems.each(function(idx) {
            console.log($(selectedItems[idx]).val());
          });
        ChromeHistory.search("", keyword);
    });
};


var ChromeHistory = {
  search: function (types, text) {
    chrome.history.search({'text': text}, 
      function(historyItems){
        for(var i = 0; i < historyItems.length; ++i){
          console.log(historyItems[i].title);
        }});
  },
};
