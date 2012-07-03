window.onload = function() {
  var width = window.screen.width * 0.8297872339599999;
  var hrWidth = width / 24;
  var tmp = new Date();
  var startDate = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate());
  var endDate = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), 23, 59);
  // === Begin Timeline ===
  var tl, resizeTimerID;
  var bandInfos = [
    Timeline.createBandInfo({
           date: startDate.toString(),
           width:          "90%", 
           intervalUnit:   Timeline.DateTime.HOUR, 
           intervalPixels: hrWidth}),
  Timeline.createBandInfo({
          date: startDate.toString(),
          width:          "10%", 
          intervalUnit:   Timeline.DateTime.DAY, 
          intervalPixels: width})];

  bandInfos[1].syncWith = 0;
  bandInfos[1].highlight = true;
  tl = Timeline.create(document.getElementById("timeline"), bandInfos);
    if (resizeTimerID == null) {
      resizeTimerID = window.setTimeout(function() {
       resizeTimerID = null;
       tl.layout();
    }, 500);
  }
  tl.getBand(0).setMinVisibleDate(startDate);
  tl.getBand(0).setMaxVisibleDate(endDate);
  // === End Timeline ===
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
  name: 'Chrome History',
  search: function (types, text) {
    chrome.history.search({'text': text}, 
      function(historyItems){
        for(var i = 0; i < historyItems.length; ++i){
          console.log(historyItems[i].title);
        }});
  },
};
