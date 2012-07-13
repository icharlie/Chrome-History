( function (window) {
  var ChromeHistory = {
    name: 'Chrome History',
    historyItems: [],
    // TODO: types property is not work now
    // PRAGMA: search chrome history for search button
    buttonSearch: function (types, text, date, callback) {
      stripTime(date);
      chrome.history.search({
          'text': text,
          'startTime': date.getTime(),
          'endTime': date.getTime() + DAY_IN_MILLISECONDS
        },  
        function(historyItems){
          var queue = []; // queue for the history item need to update visitTime
          var initTime = date.getTime(); // get the low bound of time
          var endTime = date.getTime() + DAY_IN_MILLISECONDS; // get the upper bound of time
          ChromeHistory.historyItems = historyItems; // copy history itmes
          // Check the lastVistTime, if the lastVisitTime is not at the same day,
          // we need to query again via chrome.history.getVisists function
          for (var i = 0; i < ChromeHistory.historyItems.length; i += 1) {
            var historyItem = ChromeHistory.historyItems[i];
            if (historyItem.lastVisitTime >= initTime  && historyItem.lastVisitTime < endTime ) {
              ChromeHistory.historyItems[i].visitTime = historyItem.lastVisitTime;
            } else {
              var obj = {};
              obj[i] = ChromeHistory.historyItems[i];
              queue.push(obj);
              chrome.history.getVisits({url: historyItem.url}, function(result) {  
                var target;
                result.forEach(function(r){
                    if (r.visitTime >= initTime  && r.visitTime < endTime ) {
                      target = r;
                    }
                });
                for (var i = 0; i < queue.length; i++) {
                  var item = queue[i];
                  if(item){
                    for (var key in item) {
                      if (item[key].id === target.id) {
                        ChromeHistory.historyItems[key].visitTime = target.visitTime;
                        queue.splice(i, 1);
                      }
                    }
                  }
                }
              });
            }
          }
          // TODO: loading view
          setTimeout( function () {
            if (queue.length !== 0) {
              setTimeout(this, 500);
            } else{
              callback(ChromeHistory.historyItems);
            }
          }, 500);
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
        'maxResults': 999999 
      }, function(historyItems) {

        var queue = []; // queue for the history item need to update visitTime
        var initTime = date.getTime(); // get the low bound of time
        var endTime = date.getTime() + DAY_IN_MILLISECONDS; // get the upper bound of time
        ChromeHistory.historyItems = historyItems; // copy history itmes
        // Check the lastVistTime, if the lastVisitTime is not at the same day,
        // we need to query again via chrome.history.getVisists function
        for (var i = 0; i < ChromeHistory.historyItems.length; i += 1) {
          var historyItem = ChromeHistory.historyItems[i];
          if (historyItem.lastVisitTime >= initTime  && historyItem.lastVisitTime < endTime ) {
            ChromeHistory.historyItems[i].visitTime = historyItem.lastVisitTime;
          } else {
            var obj = {};
            obj[i] = ChromeHistory.historyItems[i];
            queue.push(obj);
            chrome.history.getVisits({url: historyItem.url}, function(result) {  
              var target;
              result.forEach(function(r){
                  if (r.visitTime >= initTime  && r.visitTime < endTime ) {
                    target = r;
                  }
              });
              for (var i = 0; i < queue.length; i++) {
                var item = queue[i];
                if(item){
                  for (var key in item) {
                    if (item[key].id === target.id) {
                      ChromeHistory.historyItems[key].visitTime = target.visitTime;
                      delete queue[i];
                    }
                  }
                }
              }
            });
          }
        }
        var checkQuene = function (data) {
          data.forEach( function (){
            if (ele !== undefined)
             return data; 
          });
          data = [];
          return data;
        };
        setTimeout( function () {
          queue = checkQuene(queue);
          if (queue.length !== 0) {
            setTimeout(this, 500);
          } else{
            drawTimeLine(ChromeHistory.historyItems);
          }
        }, 500);

      
        var drawTimeLine = function(result){
          var data = {};
          var events = [];
          result.forEach(function(r) {
            var event = null;
            var uri = URI(r.url);
            var date = new Date(r.visitTime);
            var key = date.getHours() + date.getMinutes() + uri.scheme() + '://' + uri.host();
            if(data[key]) {
              data[key].count += 1;
            } else {
                //var visitItem = getVisitItem(r, date);
                //var visitDate = visitItem ? new Date(visitItem.visitTime) : new Date(r.lastVisitTime);
                var visitDate = new Date(r.visitTime);
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
        };
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
    display: 40,
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
        r.title = historyItem.title;
        r.url = historyItem.url;
        visitItems.push(r);
      }
    }); 
    return visitItems;
  });
}


function displaySearchHistoryResult(historyItems) {
  $("#result-list").empty();
  historyItems.forEach(function(item){
    var elem = $('<li>');
    var label = $('<label>');
    elem.attr('class', 'entry');
    // Time
    var divT = $('<div>');
    divT.attr('class', 'time');
    // FIXME: get the time by date
    var visitDate = new Date(item.visitTime);
    //var visitDate = new Date(item.lastVisitTime);
    divT.append(ChromeHistory.formatDate(visitDate));
    label.append(divT);
    // link
    var divL = $('<div>');
    divL.attr('class', 'title');
    divL.css('background-image', 'url(chrome://favicon/' + item.url + ')');
    var link = $('<a>').attr({
      href: item.url,
      title: item.title,
      target: '_blank'
    });
    link.text(item.title? item.title : URI(item.url).host());
    divL.append(link);
    label.append(divL);
    elem.append(label);
    $("#result-list").append(elem);
  });
  paginate($("#result-list"));
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
    var allHistoryItems = [];
    ChromeHistory.buttonSearch(types, keyword, date, displaySearchHistoryResult);
  });
};

$(document).ready(function() {
  var today = new Date();
  // PRAGMA: datepicker
  $("#timeline-date").attr("placeholder", $.datepicker.formatDate('mm/dd/yy', today));
  $("#timeline-date").datepicker({
    onSelect: function(dateText, inst) {
      var selectedDate = new Date(dateText);
      ChromeHistory.timelineSearch(selectedDate);
    }});
  // set #timeline half height of window
  $("#timeline, #search").css('height', window.screen.height / 2);
  $("#icon, #result").css('height', $(window).height() - $("#timeline").height());
  stripTime(today);
  ChromeHistory.timelineSearch(today);
});
