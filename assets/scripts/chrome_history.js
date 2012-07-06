window.onload = function() {
  $("#search-button").click(function() {
        var selectedItems = $("#catalog :checkbox:checked");
        var keyword = $("#search-field").val();
        var types = [];
        selectedItems.each(function(idx) {
            types.push($(selectedItems[idx]).val());
          });
        ChromeHistory.search(types, keyword, function() {
          // display
          // TODO: paginate
          ChromeHistory.historyItems.forEach(function(item) {
            var elem = $('<li>');
            var label = $('<label>');
            elem.attr('class', 'entry');
            // Time
            var divT = $('<div>');
            divT.attr('class', 'time');
            divT.append(formateDate(new Date(item.lastVisitTime)));
            label.append(divT);
            // link
            var divL = $('<div>');
            divT.attr('class', 'title');
            divT.css('background-image', 'chrome://favicon/' + item.url);
            var link = $('<a>').attr({
              href: item.url,
              title: item.title
            });
            link.text(item.title? item.title : URI(item.url).host());
            divL.append(link);
            label.append(divL);
            elem.append(label);
            $("#result-list").append(elem);
          });          
        });
    });
};

function formateDate (date) {
  var hrs = date.getHours();
  if (hrs > 12) {
    hrs = hrs - 12
    return hrs + ":" + date.getMinutes() + " PM";
  } else if (hrs == 12) {
    return hrs + ":" + date.getMinutes() + " PM";
  } else {
    return hrs + ":" + date.getMinutes() + " AM";    
  }
}

var ChromeHistory = {
  name: 'Chrome History',
  historyItems: null,
  // TODO: types property is not work now
  search: function (types, text, callback) {
    var today = new Date(); 
    stripTime(today);
    chrome.history.search({
      'text': text,
      'startTime': today.getTime(),
      'endTime': today.getTime() + DAY_IN_MILLISECONDS
      },  
      function(historyItems){
        ChromeHistory.historyItems = historyItems;
        if (callback) {
          callback.apply(this)
        }
      });
  },
};
