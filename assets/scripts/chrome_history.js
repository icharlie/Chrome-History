var ChromeHistory = {
  name: 'Chrome History',
  historyItems: null,
  // TODO: types property is not work now
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
  }};

function formateDate (date) {
  var hrs = date.getHours();
  if (hrs > 12) {
    hrs = hrs - 12;
    return hrs + ":" + date.getMinutes() + " PM";
  } else if (hrs == 12) {
    return hrs + ":" + date.getMinutes() + " PM";
  } else {
    return hrs + ":" + date.getMinutes() + " AM";    
  }
}


// PRAGMA: Chrome History
function searchChromeHistory(date) {
    // calculate timeline canvas top margin.
    var heiStr = $('#timeline').css('height');
    heiStr = heiStr.substring(0, heiStr.length - 2);
    heiInt = parseInt(heiStr);
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
            event = {
              dates: [new Date(r.lastVisitTime)],
              title: r.title,
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
}


function changePage(ele) {
  //  setting only current page is visible
  ele.find("div[id^=page]").hide();
  ele.find("div[id=page"+ paginate.current +"]").show();
  $("a[href^='#page']").removeAttr('class');
  $("a[href^='#page"+ paginate.current +"']").attr('class', 'active');
}

function paginate(ele) {
  // # of elements
  var counts = ele.children().length;
  window.pagination = {
    count: counts,
    display: 10,
    current: 1
  };
  // # of pages
  var pageSize = Math.ceil(counts / pagination.display);
  var pages = new Array();
  // puts li elements to pages array and wrap into a div
  for (var i = 0; i < pageSize; i += 1) {
    pages[i] = ele.find('li:lt(' + pagination.display + ')');
    pages[i].wrapAll("<div id='page" + (i + 1) +"'></div>");
    $("<a href=#page" + (pageSize - i) + ">" + (pageSize - i) + "</a>").insertAfter(ele);
  }

  // create page links
  $("a[href^='#page']").wrapAll("<div id='links'></div>");
  $("a[href^='#page']").bind('click', function(e){
    e.preventDefault();
    paginate.current = $(this).text();
    changePage(ele);
  });
  //  setting only current page is visible
  changePage(ele);
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
    var dateStr = ($("#timeline-date").val() == "") ? $("#timeline-date").attr("placeholder") : $("#timeline-date").val();
    var date = new Date(dateStr);
    ChromeHistory.search(types, keyword, date, function() {
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
      paginate($("#result-list"));
    });
  });
};
