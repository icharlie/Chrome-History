window.onload = function() {
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
