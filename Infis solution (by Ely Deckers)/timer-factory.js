"use strict";

(function (TimerFactory) {
  var Timer = function (interval) {
    var worker    = new Worker("timer-worker.js"),
        observers = [];

    worker.postMessage({ action: "updateInterval", parameters: interval });

    worker.onmessage = function (message) {
     if (message.data === "tick") {
       observers.forEach(function (observer) { observer.notify(); });
     }
    };
   
    return {
      addListener: function (observer) { observers.push(observer); },
      start: function () { worker.postMessage("start"); },
      stop: function () { worker.postMessage("stop"); }
    };
  };

  TimerFactory.create = function (interval) { return new Timer(interval); }
}(window.TimerFactory = window.TimerFactory || {}));
