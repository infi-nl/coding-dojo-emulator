"use strict";

(function (Speaker) {
  var context    = new AudioContext(),
      isStarted  = false,
      oscillator = context.createOscillator();

  oscillator.frequency.value = 800;

  oscillator.start();

  Speaker.enable  = function () { if (isStarted) { return; } isStarted = true; oscillator.connect(context.destination); },
  Speaker.disable = function () { if (!isStarted) { return; } isStarted = false; oscillator.disconnect(context.destination); }
}(window.Speaker = window.Speaker || {}));
