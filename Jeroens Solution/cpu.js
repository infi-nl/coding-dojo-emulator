"use strict";

(function (Chip8) {
   Chip8.CPU = function (mmu, display) {
     var _dataRegister, _addressRegister, _dtRegister, _stRegister, _pc, _sp,
         ROM_OFFSET                      = 0x200,
         HARD_CODED_CHARACTER_BYTE_COUNT = 5,
         _isDebugModeEnabled             = false,
         _rng                            = function () { return Math.floor(Math.random() * 255); },
         _setRegister                    = function (register, value) {
           if (!(register in _dataRegister)) {
             throw new Exception("No such register " + register);
           }
  
           _dataRegister[register] = parseInt(value) & 0xFF;
         },
         _setRegisterI    = function (value) { _addressRegister = parseInt(value) & 0xFFFF; },
         _setRegisterDT   = function (value) { _dtRegister = value; },
         _setRegisterST   = function (value) { _stRegister = value; },
         incrementPC      = function () { _pc += 2; },
         DebuggerObservable = (function () {
          var _observers = [];
  
          return {
           addObserver: function (o) { _observers.push(o); },
           notify: function ()  { for (var i=0; i<_observers.length; i++) { _observers[i].notify(); } }
          };
         }()),
         X86StyleBreakpointHandler = (function () {
           var _trapFlag = false;
  
           return {
            clearTrapFlag: function () { _trapFlag = false; },
            step: function (instructionH) {
              if ((instructionH & 0xFF00) === 0xCC00) { _trapFlag = true; throw new Error("BREAKPOINT"); }
        
              if (_trapFlag) { _trapFlag = false; throw new Error("SINGLE_STEP"); }
            }
           };
         }()),
         DisplayBuffer    = (function () {
           var pixelBit,
               width         = display.getWidth(),
               height        = display.getHeight(),
               buffer        = new Uint8Array(width * height),
             reset         = function () { for (var i=0; i<buffer.length; i++) { buffer[i] = 0; } },
               putSpriteByte = function (x, y, pixelByte) {
                 var b, oldValue, newValue, isCollision,
                     index = (y * width) + x;
  
                 for (b=0; b<8; b++) {
                   oldValue = buffer[index + b] & 0x1;
  
                   pixelBit = (pixelByte >> (7 - b)) & 0x1;
                   newValue = (oldValue ^ pixelBit) & 0x1;
  
                   isCollision = (oldValue === 1) && (pixelBit === 1);
  
                   if (isCollision) { _dataRegister[0xF] = 1; }
  
                   buffer[index + b] = newValue;
                 }
               };
  
           reset();
  
           return {
             reset: reset,
             putSprite: function (x, y, pixelBytes) { 
               var i;
  
               _dataRegister[0xF] = 0;
               for (i=0; i<pixelBytes.length; i++) {
                 putSpriteByte(x, y + i, pixelBytes[i]);
               }
 
               display.update(buffer);
             }
           };
         }()),
         KeyWaiter = (function() {
           var _keyWaitRegister,
               _isWaitingForKey = false;
  
           return {
             reset:     function () { _isWaitingForKey = false; },
             isWaiting: function () { return _isWaitingForKey; },
             wait:      function (register) { _isWaitingForKey = true; _keyWaitRegister = register; },
             notify:    function (message) { 
                          if (!_isWaitingForKey || message.action !== "down") { return; }
  
                          _isWaitingForKey = false;
                          _dataRegister[_keyWaitRegister] = message.data;
                        }
           }
         }()),
         Stack = (function () {
           var startAddress   = 0x06A0, // ED As per COSCMAC VIP (http://laurencescotford.co.uk/?p=75)
               endAddress     = 0x06D0,
               currentAddress = function () { return startAddress + (_sp*2); },
               content        = function () {
                 var range = 
                   Array.apply(null, Array((endAddress - startAddress) * 0.5))
                        .map(function (value, index) { return index; });
  
                 return range
                   .map(function (x) { return startAddress + (2 * x); })
                   .map(function (x) { return (mmu.read(x) << 8) | mmu.read(x + 1); });
               };
  
           return {
             getStatus: function () {
               return {
                 currentAddress: currentAddress(),
                 content: content()
               };
             },
             reset: function () { _sp = 0; },
             push: function (value) { 
               if (currentAddress() === endAddress) {
                 throw new Exception("Stack overflow");
               }
  
               _sp++;
  
               mmu.write(currentAddress(), value >> 8);
               mmu.write(currentAddress() + 1, value & 0xFF);
             },
             pop: function () {
               var byteH = mmu.read(currentAddress()) << 8,
                   byteL = mmu.read(currentAddress() + 1);
  
               _sp--;
  
               return byteH | byteL;
             }
           };
         }()),
         ALU = (function () {
           var add          = function (/* add parameters */) {
                 debugger;

                 /* Dont forget about VF */
                 return;
               },
               subtract     = function () {
                
                /* How do you represent a negative number? */

                /* Dont forget about VF */

                debugger;
                return;
               },
               shr          = function () {
                 //shift and rotate

                 debugger;
                 return;
               },
               shl          = function () {
                 //shift and rotate

                 debugger;
                 return;
               },
               instructions = {
                    // OR Vx, Vy
                    0x0001: function () { debugger; return; },
                    // AND Vx, Vy
                    0x0002: function () { debugger; return; },
                    // XOR Vx, Vy
                    0x0003: function () { debugger; return; },
                    // ADD Vx, Vy
                    0x0004: function () { return add(); },
                    // SUB Vx, Vy
                    0x0005: function () { return subtract(); },
                    // SHR Vx{, Vy}
                    0x0006: function () { return shr(); },
                    // SUBN Vx, Vy
                    0x0007: function () { return subtract(); },
                    // SHL Vx{, Vy}
                    0x000E: function () { return shl(); },
              };
  
              return {
                process: function (instruction, operand0, operand1) { return instructions[instruction](operand0, operand1); }
              };
         }()),
         _instructions = {
            0x0000: function (instruction) {
              var instructions = {
                // CLS
                0x00E0: function () { DisplayBuffer.reset(); display.clear(); incrementPC(); },
                // RET
                0x00EE: function () { _pc = Stack.pop(); incrementPC(); }
              };
  
              if (!instructions[instruction & 0x00FF]) {
                console.log("SYS", instruction);
                // SYS
                incrementPC();
                return;
              }
  
              instructions[instruction & 0x00FF]();
            },
            // JP addr
            0x1000: function (instruction) { 
              debugger; 
            },
            // CALL addr
            0x2000: function (instruction) { 

              //looks like JP

              debugger; 
            },
            // SE Vx, byte
            0x3000: function (instruction) {
              debugger;
              //var skipInstruction = 
              //if (skipInstruction) {
                
              //}
            },
            // SNE Vx, byte
            0x4000: function (instruction) {
              //similar to SE

              debugger;
            },
            // SE Vx, Vy
            0x5000: function (instruction) {
              debugger;
            },
            // LD Vx, byte
            0x6000: function (instruction) { 
              debugger; 
            },
            // ADD Vx, byte
            0x7000: function (instruction) { 
              debugger; 
            },
            0x8000: function (instruction) {
              debugger;
              //define these variables
              var registerX      = undefined,
                  registerY      = undefined,
                  registerXValue = undefined,
                  registerYValue = undefined,
                  instructions   = {
                    // LD Vx, Vy
                    0x0000: function () { _dataRegister[registerX] = registerYValue; incrementPC(); },
                    // OR Vx, Vy
                    0x0001: function () { _dataRegister[registerX] = ALU.process(0x0001, registerXValue, registerYValue); incrementPC();},
                    // AND Vx, Vy
                    0x0002: function () { _dataRegister[registerX] = ALU.process(0x0002, registerXValue, registerYValue); incrementPC();},
                    // XOR Vx, Vy
                    0x0003: function () { _dataRegister[registerX] = ALU.process(0x0003, registerXValue, registerYValue); incrementPC();},
                    // ADD Vx, Vy
                    0x0004: function () { _dataRegister[registerX] = ALU.process(0x0004, registerXValue, registerYValue); incrementPC();},
                    // SUB Vx, Vy
                    0x0005: function () { _dataRegister[registerX] = ALU.process(0x0005, registerXValue, registerYValue); incrementPC();},
                    // SHR Vx{, Vy}
                    0x0006: function () { _dataRegister[registerX] = ALU.process(0x0006, registerXValue, registerYValue); incrementPC();},
                    // SUBN Vx, Vy
                    0x0007: function () { _dataRegister[registerX] = ALU.process(0x0007, registerYValue, registerXValue); incrementPC();}, // One is not like the others
                    // SHL Vx{, Vy}
                    0x000E: function () { _dataRegister[registerX] = ALU.process(0x000E, registerXValue, registerYValue); incrementPC();},
                  };
  
              instructions[instruction & 0x000F]();
            },
            // SNE Vx, Vy
            0x9000: function (instruction) {
              debugger;
            },
            // LD I, addr
            0xA000: function (instruction) { 
              /* I = _addressregister */
              debugger; 
            },
            // JP V0, addr
            0xB000: function (instruction) { debugger; },
            // RND Vx, byte
            0xC000: function (instruction) { debugger; /* you can use _rng() here */  },
            // DRW Vx, Vy, nibble
            0xD000: function (instruction) {
              debugger;

              //get coordinates
              //get pixelBytes
  
              DisplayBuffer.putSprite(registerXValue, registerYValue, pixelBytes);
  
              incrementPC();
            },
            0xE000: function (instruction) {
              var registerX      = (instruction >> 8) & 0xF,
                  registerXValue = _dataRegister[registerX],
                  instructions   = {
                    // SKP Vx
                    0x009E: function () { if (Keyboard.getPressedKey() === registerXValue) { incrementPC(); } incrementPC(); },
                    // SKNP Vx
                    0x00A1: function () { if (Keyboard.getPressedKey() !== registerXValue) { incrementPC(); } incrementPC(); },
                  };
  
              instructions[instruction & 0x00FF]();
            },
            0xF000: function (instruction) {
              var registerX      = (instruction >> 8) & 0xF,
                  registerXValue = _dataRegister[registerX],
                  instructions   = {
                    // LD Vx, DT
                    0x0007: function () { debugger; _dataRegister[registerX] = _dtRegister; incrementPC(); },
                    // LD Vx, K
                    0x000A: function () { KeyWaiter.wait(registerX); incrementPC(); },
                    // LD DT, Vx
                    0x0015: function () { _dtRegister = registerXValue; incrementPC(); },
                    // LD ST, Vx
                    0x0018: function () { _stRegister = registerXValue; incrementPC(); },
                    // ADD I, Vx
                    0x001E: function () { _addressRegister = (_addressRegister + registerXValue) & 0xFFFF; incrementPC(); },
                    // LD F, Vx
                    0x0029: function () { _addressRegister = registerXValue * HARD_CODED_CHARACTER_BYTE_COUNT; incrementPC(); },
                    // LD B, Vx
                    0x0033: function () { 
                      mmu.write(_addressRegister,     Math.floor(registerXValue/100) % 10);
                      mmu.write(_addressRegister + 1, Math.floor(registerXValue/10) % 10);
                      mmu.write(_addressRegister + 2, registerXValue % 10);
  
                      incrementPC();
                    },
                    // LD [I], Vx
                    0x0055: function () { for (var i=0; i<=registerX; i++) { mmu.write(_addressRegister + i, _dataRegister[i]); } incrementPC(); },
                    // LD Vx, [I]
                    0x0065: function () { for (var i=0; i<=registerX; i++) { _dataRegister[i] = mmu.read(_addressRegister + i); } incrementPC(); },
                  };
  
              instructions[instruction & 0x00FF]();
            }
          },
          reset = function () {
            _pc              = ROM_OFFSET;
            _sp              = 0;
            _dataRegister    = new Uint8Array(16);
            _addressRegister = 0;
            _dtRegister      = 0;
            _stRegister      = 0;
       
            DisplayBuffer.reset();
            KeyWaiter.reset();
            Stack.reset();
          };
  
  
     DelayTimer.addListener({
      notify: function () { if (_dtRegister === 0) { return; } _dtRegister-- }
     });
  
     SoundTimer.addListener({
      notify: function () { if (_stRegister === 0) { Speaker.disable(); return; } Speaker.enable(); _stRegister--; }
     });
  
     Keyboard.addObserver(KeyWaiter);
  
     reset();

     return {
       getStatus: function () {
         return JSON.parse(JSON.stringify({
           "pc":              _pc,
           "sp":              _sp,
           "stack":           Stack.getStatus().content,
           "register":        _dataRegister,
           "addressRegister": _addressRegister,
           "dtRegister":      _dtRegister,
           "stRegister":      _stRegister,
         }));
       },
       process: function (instruction) {
         if (KeyWaiter.isWaiting()) { return; }
  
         return _instructions[instruction & 0xF000](instruction);
       },
       reset: reset,
    
       enableDebug: function () { _isDebugModeEnabled = true; },
       disableDebug: function () { _isDebugModeEnabled = false; },
    
       clearTrapFlag: function () { X86StyleBreakpointHandler.clearTrapFlag(); },
       step: function () {
         var instructionH = mmu.read(_pc & 0xFFFF) << 8,
             instructionL = mmu.read((_pc + 1) & 0xFFFF);
    
         X86StyleBreakpointHandler.step(instructionH);
    
         DebuggerObservable.notify();      
          
         this.process(instructionH | instructionL);
       }
     };
   };
}(window.Chip8));
