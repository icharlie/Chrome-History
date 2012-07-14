(function(){

  var Common = {
    stripTime: function (date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    }
  };
  window.Common = Common;
})();
