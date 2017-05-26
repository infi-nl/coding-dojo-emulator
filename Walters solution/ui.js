"use strict";

(function (Chip8) {
  Chip8.UI = function (emulatorElement) { 
    var startButtonEl    = emulatorElement.getElementsByClassName("start")[0],
        stepButtonEl     = emulatorElement.getElementsByClassName("step")[0],
        resetButtonEl    = emulatorElement.getElementsByClassName("reset")[0],
        cpuStatusPanelEl = emulatorElement.getElementsByClassName("cpuStatusPanel")[0],
        debugPanelEl     = emulatorElement.getElementsByClassName("debugPanel")[0],
        romSelectorEl    = emulatorElement.getElementsByClassName("romSelector")[0],
        displayCanvasEl  = emulatorElement.getElementsByClassName("display")[0],
        cpuStatusPanelEl = emulatorElement.getElementsByClassName("cpuStatusPanel")[0],
        addrominputEl    = emulatorElement.getElementsByClassName("addrom-input")[0],
        addrombuttonEl   = emulatorElement.getElementsByClassName("addrom-button")[0],
        runner           = new Chip8.Runner(displayCanvasEl),
        isRunning        = false,
        isLoading        = false,
        stop             = function () { runner.stop(); startButtonEl.innerHTML = "Continue"; },
        toggleStartStop  = function () {
          if (!runner.isROMLoaded()) { restart();  return; }

          if (runner.isRunning()) { stop(); return; }

          continuerunner();
        },
        continuerunner = function () { if (!runner.isRunning()) { runner.start(); startButtonEl.innerHTML = "Pause"; } },
        restart       = function () {
          if (isLoading) { return; }

          isLoading = true;
          ROMReader.read(romSelectorEl.value, function (data) {
        //  runner.loadROM([0x6278, 0xa500, 0x6301, 0x6401, 0xf10a, 0x00e0, 0xf218, 0xf129, 0xd345, 0x1200]);
        //  runner.loadROM([0x62, 0x78, 0xa5, 0x00, 0x63, 0x01, 0x64, 0x01, 0xf1, 0x0a, 0x00, 0xe0, 0xf2, 0x18, 0xf1, 0x29, 0xd3, 0x45, 0x12, 0x00]);
        //  runner.loadROM([0x00, 0xE0, 0x60, 0x05, 0x62, 0x01, 0x63, 0x0A, 0xF3, 0x29, 0x61, 0x00, 0x00, 0xE0, 0xD0, 0x15, 0x81, 0x24, 0x31, 0x3F, 0x12, 0x0C, 0x12, 0x0A]);
            runner.stop();
            runner.loadROM(data);

            startButtonEl.innerHTML = "Start";

            isLoading = false;
          }, function() { isLoading = false; });
        },
        addrom = function() {
          var romname = addrominputEl.value;
          var splitted = romname.split(".");
          if(!splitted[1] || splitted[1] !== "rom") {
            alert("Romname should end with .rom");
            return;
          }
          
          var newOption = document.createElement("option");
          newOption.value = romname;
          newOption.text  = splitted[0];
          romSelectorEl.appendChild(newOption);
        },
        Printer    = {
         print: function (instruction) {
           var buildHex = function (value) {
                return value.toString(16).toUpperCase();
               }, 
               buildPaddedHex = function (value, pad) {
                return (pad + buildHex(value)).slice(-1 * pad.length);
               },
               buildGroupHex = function (value) {
                 var upper = (value & 0xFF00) >> 8,
                     lower = value & 0xFF;

                 return buildPaddedHex(upper, "00") + " " + buildPaddedHex(lower, "00");
               },
               buildPaddedLine = function (value, pad) {
                return (value + pad).slice(0, pad.length);
               },
               buildLine = function (value, pad) {
                return buildPaddedLine(value, "                ");
               },
               instructionLineBuilders = {
                 "0nnn":        function () { return buildLine("SYS  0x" + buildPaddedHex(instruction.operand, "000")); },
                 "00E0":        function () { return buildLine("CLS"); },
                 "00EE":        function () { return buildLine("RET"); },
                 "1nnn":        function () { return buildLine("JP   0x" + buildPaddedHex(instruction.operand, "000")); },
                 "2nnn":        function () { return buildLine("CALL 0x" + buildPaddedHex(instruction.operand, "000")); },
                 "3xkk_byte":   function () { return buildLine("SE   V" + buildHex(instruction.x) + ", 0x" + buildPaddedHex(instruction.operand, "00")); },
                 "4xkk_byte":   function () { return buildLine("SNE  V" + buildHex(instruction.x) + ", 0x" + buildPaddedHex(instruction.operand, "00")); },
                 "6xkk_byte":   function () { return buildLine("LD   V" + buildHex(instruction.x) + ", 0x" + buildPaddedHex(instruction.operand, "00")); },
                 "7xkk_byte":   function () { return buildLine("ADD  V" + buildHex(instruction.x) + ", 0x" + buildPaddedHex(instruction.operand, "00")); },
                 "8xy0_reg":    function () { return buildLine("LD   V" + buildHex(instruction.x) + ", V" + buildHex(instruction.y)); },
                 "8xy2_reg":    function () { return buildLine("AND  V" + instruction.x.toString(16).toUpperCase() + ", V" + instruction.y.toString(16).toUpperCase()); },
                 "8xy3_reg":    function () { return buildLine("XOR  V" + buildHex(instruction.x) + ", V" + buildHex(instruction.y)); },
                 "8xy4_reg":    function () { return buildLine("ADD  V" + buildHex(instruction.x) + ", V" + buildHex(instruction.y)); },
                 "8xy5_reg":    function () { return buildLine("SUB  V" + buildHex(instruction.x) + ", V" + buildHex(instruction.y)); },
                 "8xyE_reg":    function () { return buildLine("SHL  V" + buildHex(instruction.x) + "{, V" + buildHex(instruction.y) + "}"); },
                 "9xy0_reg":    function () { return buildLine("SNE  V" + buildHex(instruction.x) + ", V" + buildHex(instruction.y)); },
                 "Annn":        function () { return buildLine("LD   I, 0x" + buildPaddedHex(instruction.operand, "000")); },
                 "Cxkk_byte":   function () { return buildLine("RND  V" + buildHex(instruction.x) + ", 0x" + buildPaddedHex(instruction.operand, "00")); },
                 "Dxyn_nibble": function () { return buildLine("DRW  V" + buildHex(instruction.x) + ", V" + buildHex(instruction.y) + ", 0x" + buildHex(instruction.operand)); },
                 "ExA1_x":      function () { return buildLine("SKNP V" + buildHex(instruction.x)); },
                 "Ex9E_x":      function () { return buildLine("SKP  V" + buildHex(instruction.x)); },
                 "Fx07_x":      function () { return buildLine("LD   V" + buildHex(instruction.x) + ", DT"); },
                 "Fx0A_x":      function () { return buildLine("LD   V" + buildHex(instruction.x) + ", K"); },
                 "Fx15_x":      function () { return buildLine("LD   DT, V" + buildHex(instruction.x)); },
                 "Fx18_x":      function () { return buildLine("LD   ST, V" + buildHex(instruction.x)); },
                 "Fx1E_x":      function () { return buildLine("ADD  I, V" + buildHex(instruction.x)); },
                 "Fx29_x":      function () { return buildLine("LD   F, V" + buildHex(instruction.x)); },
                 "Fx33_x":      function () { return buildLine("LD   B, V" + buildHex(instruction.x)); },
                 "Fx55_x":      function () { return buildLine("LD   [I], V" + buildHex(instruction.x)); },
                 "Fx65_x":      function () { return buildLine("LD   V" + buildHex(instruction.x) + ", [I]"); },
               },
               line = 
                 buildGroupHex(instruction.address) + "    " +
                 instructionLineBuilders[instruction.operator]() + "    ; " +
                 buildGroupHex(instruction.raw);

           return line;
         }
        },
        _debugPanel    = (function () {
          var initializeLineClickHandler = function (lineElements) {
               var i, lineEl;

               for (i=0; i<lineElements.length; i++) {
                 lineEl = lineElements[i];

                 lineEl.onclick = function (e) {
                  runner.toggleBreakpoint(e.target.dataset.address);
                 };
                }
              };


          return {
           notify: function (message) {
             var i, key, rom, lineEl, lineElements, offset;

             if (message.type === "LOADED_ROM") {
              rom = message.rom;
 
              debugPanelEl.innerHTML = "";
              for (key in message.rom) {
               debugPanelEl.innerHTML += "<span class=\"line\" data-address=\"" + key + "\">" + Printer.print(rom[key]) + "</span>\n";
              } 

              lineElements = debugPanelEl.getElementsByClassName("line");
              initializeLineClickHandler(lineElements);
             } else if (message.type === "TOGGLED_BREAKPOINT") {
              lineElements = debugPanelEl.getElementsByClassName("line");

              lineEl = 
               Array.prototype.find.call(lineElements,
                function (x) { return x.dataset.address == message.address; });

              lineEl.classList.remove("breakpoint");
              if (message.isEnabled) {
               lineEl.classList.add("breakpoint");
              }
             } else if (message.type === "ENCOUNTERED_BREAKPOINT") {
              startButtonEl.innerHTML = "Continue";
             } else if (message.type === "CPU_STEP") {
              lineElements = debugPanelEl.getElementsByClassName("line");

              for (i=0; i<lineElements.length; i++) { lineElements[i].classList.remove("pc"); }

              lineEl = 
               Array.prototype.find.call(lineElements,
                function (x) { return x.dataset.address == message.status.pc; });

              if (!lineEl) { console.error(message.status.pc); }
              lineEl.classList.add("pc");

              lineEl.scrollIntoView();

              cpuStatusPanelEl.getElementsByClassName("pc")[0].innerText = message.status.pc.toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v0")[0].innerText = message.status.register[0x0].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v1")[0].innerText = message.status.register[0x1].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v2")[0].innerText = message.status.register[0x2].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v3")[0].innerText = message.status.register[0x3].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v4")[0].innerText = message.status.register[0x4].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v5")[0].innerText = message.status.register[0x5].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v6")[0].innerText = message.status.register[0x6].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v7")[0].innerText = message.status.register[0x7].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v8")[0].innerText = message.status.register[0x8].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("v9")[0].innerText = message.status.register[0x9].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("vA")[0].innerText = message.status.register[0xA].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("vB")[0].innerText = message.status.register[0xB].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("vC")[0].innerText = message.status.register[0xC].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("vD")[0].innerText = message.status.register[0xD].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("vE")[0].innerText = message.status.register[0xE].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("vF")[0].innerText = message.status.register[0xF].toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("vI")[0].innerText = message.status.addressRegister.toString(16).padStart(4, "0000");
              cpuStatusPanelEl.getElementsByClassName("dt")[0].innerText = message.status.dtRegister.toString(16).padStart(2, "0"); 
              cpuStatusPanelEl.getElementsByClassName("st")[0].innerText = message.status.stRegister.toString(16).padStart(2, "0"); 
              return;
             }
            }
          };
        }()),
        ROMReader     = {
          read: function (path, succesCallback, failedCallback) {
            var buffer, view, i,
                xhr = new XMLHttpRequest();

              xhr.responseType = 'arraybuffer';
              xhr.open("GET", path, true);
              xhr.onreadystatechange = function () {
              if(xhr.readyState === 4) {
                if(xhr.status === 200 || xhr.status == 0) {
                  buffer   = new Uint8Array( xhr.response );

                  succesCallback(buffer);
                } else {
                  alert("Can't find ROM at: " + path);
                  failedCallback();
                }
              } 
            }

            xhr.send();
          }
        };

    romSelectorEl.onchange = restart;
    startButtonEl.onclick = toggleStartStop;

    stepButtonEl.onclick  = function () { stop(); runner.step();  }
    resetButtonEl.onclick = restart;

    addrombuttonEl.onclick = addrom;

    runner.addObserver(_debugPanel);
  };
}(window.Chip8));
