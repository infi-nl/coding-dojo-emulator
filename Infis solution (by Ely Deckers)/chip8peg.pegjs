{	
	var globalParams = {}
	var global  = {};

	var minLogLevel = "debug";
	var logLevels = { "debug": 1, "info": 2, "warn": 3, "error": 4 };

	var logMessages = {};

	var log = function (message, level) {		
		if (level == "always") {
			console.log(message);
		}
		else if (logLevels[minLogLevel] <= logLevels[level]) {
			console.log(message);
		}

		if ((typeof logMessages[level]) == "undefined") {
			logMessages[level] = [];
		}

		logMessages[level].push(message);
	}
}

Instructions
 = nl* 
 instructions:(InstructionWithNewline+) 
 nl*
 {
	 return { opcodes: instructions }; 
 }

InstructionWithNewline
  = Instruction

Instruction
  = Comment
	/ CLS
  / RET
	/ SYS
	/ JP_ADDR / JP_V0
	/ CALL
	/ SE
	/ SNE
	/ LD_V / LD_I_ADDRESS / LD_I_REGISTER_TO_MEMORY / LD_I_REGISTER_FROM_MEMORY
	  / LD_GET_DT / LD_PUT_DT / LD_K / LD_F / LD_B / LD_PUT_ST
	/ ADD / ADD_I
	/ OR
	/ AND
	/ XOR
	/ SUB
	/ SHR
	/ SUBN
	/ SHL
	/ RND
	/ DRW
	/ SKP
	/ SKNP

Comment
  = ";" [^\n\r]* EOL {
		return null;
	}

CLS = "cls"i EOL {
	return "00E0";
}

RET = "ret"i EOL {
	return "00EE";
}

SYS = "SYS"i _ address:Address EOL {
	return "0" + address.value;
}

JP_ADDR = "JP"i _ address:Address EOL {
	return "1" + address.value;
}

JP_V0 = "JP"i _ "V0" ", " address:Address EOL {
	return "B" + address.value;
}

CALL = "CALL"i _ address:Address EOL {
	return "2" + address.value;
}

SE = "SE"i _ vregister:VRegister ", " byteOrVRegister:(Byte / VRegister) {
	if (byteOrVRegister.type == "byte") {
		return "3" + vregister.value + byteOrVRegister.value; 
	}
	if (byteOrVRegister.type == "vregister") {
		return "5" + vregister.value + byteOrVRegister.value + "0";
	}
	throw Error("unexpected type: " + byteOrVRegister.type);
}

SNE = "SNE"i _ vregister:VRegister ", " byteOrVRegister:(Byte / VRegister) {
	if (byteOrVRegister.type == "byte") {
		return "4" + vregister.value + byteOrVRegister.value; 
	}
	if (byteOrVRegister.type == "vregister") {
		return "9" + vregister.value + byteOrVRegister.value + "0";
	}
	throw Error("unexpected type: " + byteOrVRegister.type);
}

LD_V = "LD"i _ vregister:VRegister ", " byteOrVRegister:(Byte / VRegister) {
	if (byteOrVRegister.type == "byte") {
		return "6" + vregister.value + byteOrVRegister.value; 
	}
	if (byteOrVRegister.type == "vregister") {
		return "8" + vregister.value + byteOrVRegister.value + "0";
	}
	throw Error("unexpected type: " + byteOrVRegister.type);
}

LD_I_ADDRESS = "LD"i _ IRegister ", " address:Address {
  return "A" + address.value; 
}

LD_I_REGISTER_TO_MEMORY = "LD"i _ IRegister ", " vregister:VRegister {
  return "F" + vregister.value + "55"; 
}

LD_I_REGISTER_FROM_MEMORY = "LD"i _ vregister:VRegister ", " IRegister {
  return "F" + vregister.value + "65"; 
}

LD_GET_DT = "LD"i _ vregister:VRegister ", " DTRegister {
  return "F" + vregister.value + "07"; 
}

LD_PUT_DT = "LD"i _ DTRegister ", " vregister:VRegister {
  return "F" + vregister.value + "15"; 
}

LD_K = "LD"i _ vregister:VRegister ", " "K" {
  return "F" + vregister.value + "0A"; 
}

LD_F = "LD"i _ "F" ", " vregister:VRegister {
  return "F" + vregister.value + "29"; 
}

LD_B = "LD"i _ "B" ", " vregister:VRegister {
  return "F" + vregister.value + "33"; 
}

LD_PUT_ST = "LD"i _ "ST" ", " vregister:VRegister {
  return "F" + vregister.value + "18"; 
}

ADD = "ADD"i _ vregister:VRegister ", " byteOrVRegister:(Byte / VRegister) {
	if (byteOrVRegister.type == "byte") {
		return "7" + vregister.value + byteOrVRegister.value; 
	}
	if (byteOrVRegister.type == "vregister") {
		return "8" + vregister.value + byteOrVRegister.value + "4";
	}
	throw Error("unexpected type: " + byteOrVRegister.type);
}

ADD_I = "ADD"i _ IRegister ", " vregister:VRegister {
  return "F" + vregister.value + "1E"; 
}

OR = "OR"i _ vregister1:VRegister ", " vregister2:VRegister {
		return "8" + vregister1.value + vregister2.value + "1";
}

AND = "AND"i _ vregister1:VRegister ", " vregister2:VRegister {
		return "8" + vregister1.value + vregister2.value + "2";
}

XOR = "XOR"i _ vregister1:VRegister ", " vregister2:VRegister {
		return "8" + vregister1.value + vregister2.value + "3";
}

SUB = "SUB"i _ vregister1:VRegister ", " vregister2:VRegister {
		return "8" + vregister1.value + vregister2.value + "5";
}

SUBN = "SUBN"i _ vregister1:VRegister ", " vregister2:VRegister {
		return "8" + vregister1.value + vregister2.value + "7";
}

SHR = "SHR"i _ vregister1:VRegister optional:(", " VRegister)? {
		if (optional !== null) {
			return "8" + vregister1.value + optional[1].value + "6";
		}
		return "8" + vregister1.value + "0" + "6";
}

SHL = "SHL"i _ vregister1:VRegister optional:(", " VRegister)? {
		if (optional !== null) {
			return "8" + vregister1.value + optional[1].value + "E";
		}
		return "8" + vregister1.value + "0" + "E";
}

RND = "RND"i _ vregister:VRegister ", " byte:Byte {
		return "C" + vregister.value + byte.value;
}

DRW = "DRW"i _ vregister1:VRegister ", " vregister2:VRegister ", " nibble:Nibble {
		return "D" + vregister1.value + vregister2.value + nibble.value;
}

SKP = "SKP"i _ vregister:VRegister {
		return "E" + vregister.value + "9E";
}

SKNP = "SKNP"i _ vregister:VRegister {
		return "E" + vregister.value + "A1";
}

VRegister
  = "V" d:HexDigit {
		return {
			type: "vregister",
			value: d
		};
	}

IRegister
  = "I" {
		return {
			type: "iregister"
		};
	}

DTRegister
  = "DT" {
		return {
			type: "dtregister"
		};
	}

Byte
  = "0x"i h:HexDigits2 {
		return {
			type: "byte",
			value: h
		};
	}

Address
  = "0x"i h:HexDigits3 {
		return {
			type: "address",
			value: h
		};
	}

Nibble
  = "0x"i h:HexDigit {
		return {
			type: "nibble",
			value: h
		};
	}

HexDigits2
  = d1:HexDigit d2:HexDigit {
		return d1 + d2;
	}

HexDigits3
  = d1:HexDigit d2:HexDigit d3:HexDigit {
		return d1 + d2 + d3;
	}

HexDigit
	= [0-9A-F]i // TODO RvH: Waarom werkt {3} niet?

_ "whitespace"
  = [ \t]*

nl =
  [\n] 

EOL 
 = [\n\r]{1,2} / !.

// AnyChar =
// 	.*

// http://stackoverflow.com/questions/16883443/assembly-language-parser-implementation
// https://groups.google.com/forum/#!topic/pegjs/Votinwk5g7c
// single line comments
