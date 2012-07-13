$(document).ready(function(){
    chrome.browserAction.onClicked.addListener(function() {
      chrome.tabs.create({'url': 'history.html'});
    });
});
