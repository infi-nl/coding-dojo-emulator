"use strict";

(function (Chip8) {
  Chip8.Runner = function (displayCanvasElement) { 
    var _runnerInterval,
        _display       = new Chip8.Display(displayCanvasElement),
        _mmu           = new Chip8.MMU(),
        _cpu           = new Chip8.CPU(_mmu, _display),
        _observers     = [],
        _isROMLoaded   = false,
        _eventObserver = {
         notify: function (eventName, value) { for (var i=0; i<_observers.length; i++) { _observers[i].notify(eventName, value); } }
        },
        _debugger      = new Chip8.Debugger(this, _cpu, _mmu);
  
    _debugger.addObserver(_eventObserver);
  
    
    this.enableDebug  = function () { _cpu.enableDebug(); };
    this.disableDebug = function () { _cpu.disableDebug(); };
  
    this.toggleBreakpoint = function (address) { _debugger.toggleBreakpoint(address); };
  
    this.step    = function () {
        try {
         _cpu.step();
  
         _eventObserver.notify({ "type": "CPU_STEP", "status": _cpu.getStatus() });
        } catch (e) {
         _debugger.handleException(e);
        }
      };
  
    this.isROMLoaded = function () { return _isROMLoaded; };
  
    this.loadROM = function (rom) {
      _cpu.reset();
      _display.clear();
      _mmu.loadROM(rom);
  
      _debugger.loadROM(rom);
  
      _isROMLoaded = true;
    };
  
    this.addObserver = function (o) { _observers.push(o); };
    this.isRunning   = function () { return !!_runnerInterval; };
    this.start       = function () { _runnerInterval = setInterval(this.step, 0); };
    this.stop        = function () { clearInterval(_runnerInterval); _runnerInterval = null; };
    this.reset       = function () { console.error("reset: not implemented"); };
  };
}(window.Chip8));
