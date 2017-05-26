"use strict";

(function (Chip8) {
  var ROM_OFFSET = 0x200,
      processed  = [],
      ROMParser = (function () {
       var parse  = function (bytes, pc) {
             var buildAddressInstruction  = function (operator) { return { "address": pc, "raw": bytes, "operator": operator, "operand": (bytes & 0xFFF) }; },
                 buildByteInstruction     = function (operator) { return { "address": pc, "raw": bytes, "operator": operator + "_byte", "operand": (bytes & 0xFF), "x": (bytes & 0xF00) >> 8 }; }, 
                 buildJustXInstruction    = function (operator) { return { "address": pc, "raw": bytes, "operator": operator + "_x", "x": (bytes & 0xF00) >> 8 }; }, 
                 buildRegisterInstruction = function (operator) { return { "address": pc, "raw": bytes, "operator": operator + "_reg", "operand": (bytes & 0xFF), "x": (bytes & 0xF00) >> 8, "y": (bytes & 0xF0) >> 4 }; },
                 buildNibbleInstruction   = function (operator) { return { "address": pc, "raw": bytes, "operator": operator + "_nibble", "operand": (bytes & 0xF), "x": (bytes & 0xF00) >> 8, "y": (bytes & 0xF0) >> 4, "nibble": bytes & 0xF }; },
                 buildNoParamInstruction  = function (operator) { return { "address": pc, "raw": bytes, "operator": operator }; },
                 instructionParsers = {
                   0x0000: function () { 
                     var zerosInstructions = {
                       0x00E0: function () { return buildNoParamInstruction("00E0"); }, 
                       0x00EE: function () { return buildNoParamInstruction("00EE"); }, 
                     };

                     if (!(bytes in zerosInstructions)) {
                       return buildAddressInstruction("0nnn");
                     }

                     return zerosInstructions[bytes & 0xFFFF]();
                   },
                   0x1000: function () { return buildAddressInstruction("1nnn"); },
                   0x2000: function () { return buildAddressInstruction("2nnn"); },
                   0x3000: function () { return buildByteInstruction("3xkk"); },
                   0x4000: function () { return buildByteInstruction("4xkk"); },
                   0x5000: function () { return buildRegisterInstruction("5xy0"); },
                   0x6000: function () { return buildByteInstruction("6xkk"); },
                   0x7000: function () { return buildByteInstruction("7xkk"); },
                   0x8000: function () { 
                     var arithmeticInstructions = {
                       0x0: function () { return buildRegisterInstruction("8xy0"); },
                       0x1: function () { return buildRegisterInstruction("8xy1"); },
                       0x2: function () { return buildRegisterInstruction("8xy2"); },
                       0x3: function () { return buildRegisterInstruction("8xy3"); },
                       0x4: function () { return buildRegisterInstruction("8xy4"); },
                       0x5: function () { return buildRegisterInstruction("8xy5"); },
                       0x6: function () { return buildRegisterInstruction("8xy6"); },
                       0x7: function () { return buildRegisterInstruction("8xy7"); },
                       0xE: function () { return buildRegisterInstruction("8xyE"); }
                     };

                    return arithmeticInstructions[bytes & 0xF]();
                   },
                   0x9000: function () { return buildRegisterInstruction("9xy0"); },
                   0xA000: function () { return buildAddressInstruction("Annn"); },
                   0xB000: function () { return buildAddressInstruction("Bnnn"); },
                   0xC000: function () { return buildByteInstruction("Cxkk"); },
                   0xD000: function () { return buildNibbleInstruction("Dxyn"); },
                   0xE000: function () {
                     var skipInstructions = {
                       0x9E: function () { return buildJustXInstruction("Ex9E") },
                       0xA1: function () { return buildJustXInstruction("ExA1") }
                     };

                     return skipInstructions[bytes & 0xFF]();
                   },
                   0xF000: function () {
                     var otherInstructions = {
                       0x07: function () { return buildJustXInstruction("Fx07") },
                       0x0A: function () { return buildJustXInstruction("Fx0A") },
                       0x15: function () { return buildJustXInstruction("Fx15") },
                       0x18: function () { return buildJustXInstruction("Fx18") },
                       0x1E: function () { return buildJustXInstruction("Fx1E") },
                       0x29: function () { return buildJustXInstruction("Fx29") },
                       0x33: function () { return buildJustXInstruction("Fx33") },
                       0x55: function () { return buildJustXInstruction("Fx55") },
                       0x65: function () { return buildJustXInstruction("Fx65") },
                     };

                     return otherInstructions[bytes & 0xFF]();
                   },
                  };

             return instructionParsers[bytes & 0xF000]();
           },
           Parser = {
             parse: function (rom, address) {
               var instruction,
                   isReturn          = false,
                   isConditionalJump = false,
                   isJump            = false,
                   isCall            = false,
                   i                 = 0,
                   instructions      = {},
                   data              = {};


               while (!(address in processed)) {
                instruction = parse((rom[address - ROM_OFFSET] << 8) | rom[address + 1 - ROM_OFFSET], address);

                processed[address] = instruction;

                isJump            = instruction.operator === "1nnn";
                isCall            = instruction.operator === "2nnn";
                isConditionalJump = ["3xkk_byte", "4xkk_byte", "ExA1_x"].indexOf(instruction.operator) > -1;
                isReturn          = instruction.operator === "00EE";

                if (isConditionalJump) {
                  Parser.parse(rom, address + 4);
                }

                if (isCall) {
                  Parser.parse(rom, instruction.operand);
                }

                if (isReturn) { break; }

                if (isJump) {
                  address = instruction.operand;
                  continue;
                }

                address += 2;
               }
             }
           };

       return {
        parse: function (rom) { return Parser.parse(rom, 0x200); }
       };
      }());

   Chip8.Debugger = function (runner, cpu, mmu) {
    var _observers   = [],
        _breakpoints = {};

    return {
     loadROM: function (rom) {
       var i, key;
       processed = {};
 
       ROMParser.parse(rom);

       for (i=0; i<_observers.length; i++) { _observers[i].notify({"type": "LOADED_ROM", "rom": processed}); }
     },
     addObserver: function (observer) {
      _observers.push(observer); 
     },
     toggleBreakpoint: function (address) {
      var i,
          isExistingBreakpoint = address in _breakpoints,
          enableBreakpoint = function () {
           _breakpoints[address] = mmu.read(address);
     
           mmu.write(address, 0xcc);
          },
          disableBreakpoint = function () {
           mmu.write(address, _breakpoints[address]);
           cpu.clearTrapFlag();

           delete _breakpoints[address];
          };

      if (isExistingBreakpoint) {
        disableBreakpoint();
      } else {
        enableBreakpoint();
      }

      for (i=0; i<_observers.length; i++) { _observers[i].notify({"type": "TOGGLED_BREAKPOINT", "isEnabled": !isExistingBreakpoint, "address": address }); }
     },
     handleException: function (e) {
      var i, 
          pc = cpu.getStatus().pc;


      if (e.message === "BREAKPOINT") {
       runner.stop();
       mmu.write(pc, _breakpoints[pc]);

       for (i=0; i<_observers.length; i++) { _observers[i].notify({"type": "ENCOUNTERED_BREAKPOINT", "address": pc}); }
      } else if (e.message === "SINGLE_STEP") {
       runner.step();

       mmu.write(pc, 0xCC);

       for (i=0; i<_observers.length; i++) { _observers[i].notify({"type": "ENCOUNTERED_SINGLE_STEP", "address": pc}); }
      }
     },
     removeBreakPoint: function (address) {
      console.error("not implemented");
     },
     addBreakPointObserver: function (o) {
      _observers.push(o);
     },
     removeBreakPointObserver: function (o) {
      console.error("not implemented");
     }
    };
   };
}(window.Chip8));
