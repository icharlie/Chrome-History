( function (window) {
  var ChromeHistory = {
    name: 'Chrome History',
    historyItems: null,
    // TODO: types property is not work now
    // PRAGMA: search chrome history for search button
    search: function (types, text, date, callback) {
      stripTime(date);
      chrome.history.search({
        'text': text,
        'startTime': date.getTime(),
        'endTime': date.getTime() + DAY_IN_MILLISECONDS
        },  
        function(historyItems){
          ChromeHistory.historyItems = historyItems;
          if (callback) {
            callback.apply(this);
          }
        });
    },
    // PRAGMA: search chrome history for timeline
    timelineSearch: function(date) {
      // calculate timeline canvas top margin.
      var heiStr = $('#timeline').css('height');
      heiStr = heiStr.substring(0, heiStr.length - 2);
      heiInt = parseInt(heiStr, 10);
      heiInt = heiInt - 120;
      // TODO: change maxResults after developing process.
      chrome.history.search({
        'text': '',
        'startTime': date.getTime(),
        'endTime': date.getTime() + DAY_IN_MILLISECONDS,
        'maxResults': 800
      }, function(result) {
        var data = {};
        var events = [];
        result.forEach(function(r) {
          var event = null;
          var uri = URI(r.url);
          var key = uri.scheme() + '://' + uri.host();
          if(data[key]) {
            data[key].count += 1;
          } else {
              //var visitItem = getVisitItem(r, date);
              //var visitDate = visitItem ? new Date(visitItem.visitTime) : new Date(r.lastVisitTime);
              var visitDate = new Date(r.lastVisitTime);
              event = {
                dates: [visitDate],
                title: r.title + '[' + ChromeHistory.formatDate(visitDate) + ']',
                icon: 'chrome://favicon/' + r.url,
                count: 1
                };
              data[key] = event;
          }
        });
        for(var url in data) {
          events.push(data[url]);
        }
        // PRAGMA: Timeline
        $("#timeline-chart").empty();
        
        var timeline = Chronoline.create(document.getElementById("timeline-chart"), events, {
          animated: true,
          tooltips: true,
          topMargin: heiInt,
          scrollable: false,
          startDate: date,
          subSubLabelAttrs: {'font-size': '18pt'},
          mode: CHRONOLINE_MODE.HOUR_DAY
        });

      });    
    },

    formatDate: function(date){
      var hrs = date.getHours();
      var mins = date.getMinutes();
      if (hrs > 12) {
        hrs = hrs - 12;
      }
      if (mins < 10) {
        mins = "0" + mins;
      }

      if (date.getHours() >= 12) {
        return hrs + ":" + mins + " PM";
      } else {
        return hrs + ":" + mins + " AM";    
      }
    }
  };

  // Expose ChromeHistory to the global object
  window.ChromeHistory = ChromeHistory;
})(window);

// PRAGMA: global function
function changePage(ele) {
  //  setting only current page is visible
  ele.find("div[id^=page]").hide();
  ele.find("div[id=page"+ pagination.current +"]").show();
  $("a[href^='#page']").removeAttr('class');
  $("a[href^='#page"+ pagination.current +"']").attr('class', 'active');
}

function paginate(ele) {
  // # of elements
  var counts = ele.children().length;
  window.pagination = {
    count: counts,
    display: 10,
    current: 1
  };
  // clean old link
  var linksDiv = ($("#links").length === 0) ? $("<div id='links'></div>") : $("#links");
  linksDiv.empty();
  // # of pages
  var pageSize = Math.ceil(counts / pagination.display);
  var pages = [];
  var lis = ele.find('li');
  // puts li elements to pages array and wrap into a div
  for (var i = 0; i < pageSize; i += 1) {
    pages[i] = lis.slice(i * pagination.display, (i+1) * pagination.display);
    pages[i].wrapAll("<div id='page" + (i + 1) +"'></div>");
    $("<a href=#page" + (pageSize - i) + ">" + (pageSize - i) + "</a>").insertAfter(ele);
  }

  // create page links
  $("a[href^='#page']").wrapAll(linksDiv);
  $("a[href^='#page']").bind('click', function(e){
    e.preventDefault();
    pagination.current = $(this).text();
    changePage(ele);
  });
  //  setting only current page is visible
  changePage(ele);
}

function getVisitItem(historyItem, date) {
  var visitItems = [];
  var initTime = date.getTime();
  var endTime = date.getTime() + DAY_IN_MILLISECONDS;
  chrome.history.getVisits({url: historyItem.url}, function(result) {  
    result.forEach(function(r){
      var curDate = new Date(r.visitTime);
      var curTime = curDate.getTime() ;
      if (curTime >= initTime  && curTime <= endTime ) {
        visitItems.push(r);
      }
    }); 
  });
  return visitItems[0];
}

window.onload = function() {
  $("#search-button").click(function() {
    $("#result-list").empty();
    var selectedItems = $("#catalog :checkbox:checked");
    var keyword = $("#search-field").val();
    var types = [];
    selectedItems.each(function(idx) {
        types.push($(selectedItems[idx]).val());
      });
    var dateStr = ($("#timeline-date").val() === "") ? $("#timeline-date").attr("placeholder") : $("#timeline-date").val();
    var date = new Date(dateStr);
    ChromeHistory.search(types, keyword, date, function() {
      // display
      ChromeHistory.historyItems.forEach(function(item) {
        var elem = $('<li>');
        var label = $('<label>');
        elem.attr('class', 'entry');
        // Time
        var divT = $('<div>');
        divT.attr('class', 'time');
        var visitItem = getVisitItem(item, date);
        // FIXME: get the time by date
        var visitDate = visitItem ? new Date(visitItem.visitTime) : new Date(item.lastVisitTime);
        divT.append(ChromeHistory.formatDate(visitDate));
        label.append(divT);
        // link
        var divL = $('<div>');
        divL.attr('class', 'title');
        divL.css('background-image', 'url(chrome://favicon/' + item.url + ')');
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
      paginate($("#result-list"));
    });
  });
};
