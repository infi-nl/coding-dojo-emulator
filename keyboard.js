"use strict";

(function (Keyboard) {
  var pressedKey    = -1, 
      observers     = [], 
      keyCodeKeyMap = {
       48: 0x0,
       49: 0x1,
       50: 0x2,
       51: 0x3,
       52: 0x4,
       53: 0x5,
       54: 0x6,
       55: 0x7,
       56: 0x8,
       57: 0x9,
       65: 0xA,
       66: 0xB,
       67: 0xC,
       68: 0xD,
       69: 0xE,
       70: 0xF
      },
      keyDownHandler = function (e) {
        if (!(e.keyCode in keyCodeKeyMap)) { return; }

        pressedKey = keyCodeKeyMap[e.keyCode];

        observers.forEach(function (observer) {
          observer.notify({action: "down", data: pressedKey});
        });
      },
      keyUpHandler = function (e) {
//        if (!(e.keyCode in keyCodeKeyMap)) { return; }

        console.log("up");
        pressedKey = -1;

        observers.forEach(function (observer) {
          observer.notify({action: "up", data: pressedKey });
        });
      };

  window.addEventListener("keydown", keyDownHandler, false);
  window.addEventListener("keyup", keyUpHandler, false);

  Keyboard.addObserver = function (observer) { observers.push(observer); }

  Keyboard.getPressedKey = function () { return pressedKey; }
}(window.Keyboard = window.Keyboard || {}));
