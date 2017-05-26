"use strict";

var timerInterval,
    ticker     = function () { self.postMessage("tick"); },
    startTimer = function (interval) { timerInterval = setInterval(ticker, interval); },
    stopTimer  = function () { clearInterval(timerInterval); },
    updateInterval  = function (interval) { stopTimer(); startTimer(interval);  };

self.addEventListener("message", function (message) {
  var handlers = {
   "start": startTimer,
   "stop": stopTimer,
   "updateInterval": updateInterval,
  };

  if (!!handlers[message.data.action]) {
    handlers[message.data.action](message.data.parameters);
  }
});
