"use strict";

(function (Assembler) {
    console.log("assembler being executed");
    Assembler.parse = function(assembly) {

        var result = window.chip8peg.parse(assembly);
		var opcodesUnfiltered = result.opcodes;
		// console.dir(opcodesUnfiltered);
		var opcodes = opcodesUnfiltered.filter(o => o != null); // comment regels komen als null terug, dus eruit filteren
		// console.dir(opcodes);

        return opcodes; 
    }
}(window.Assembler = window.Assembler || {}));
