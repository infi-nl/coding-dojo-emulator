"use strict";

QUnit.test( "cls (newline before and after)", function (assert) {
  var assembly = String.raw`
cls
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "00E0");
});

QUnit.test( "cls (only newline after)", function (assert) {
  var assembly = String.raw`cls
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "00E0");
});

QUnit.test( "cls (all capitalized)", function (assert) {
  var assembly = String.raw`
CLS
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "00E0");
});

QUnit.test( "ret", function (assert) {
  var assembly = String.raw`
ret
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "00EE");
});

QUnit.test( "cls + ret (2 instructions)", function (assert) {
  var assembly = String.raw`
cls
ret
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "00E0,00EE");
});

QUnit.test( "comment on newline (is ignored)", function (assert) {
  var assembly = String.raw`
; this is a comment
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "");
});

QUnit.test( "comment lines and instructions interspersed", function (assert) {
  var assembly = String.raw`
; this is a comment
; this is a comment
cls
; this is a comment
; this is a comment
ret
; this is a comment
; this is a comment
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "00E0,00EE");
});

QUnit.test( "sys <addr>", function (assert) {
  var assembly = String.raw`
SYS 0x0AF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "00AF");
});

QUnit.test( "jp <addr>", function (assert) {
  var assembly = String.raw`
JP 0x000
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "1000");
});

QUnit.test( "call <addr>", function (assert) {
  var assembly = String.raw`
CALL 0xFFF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "2FFF");
});

QUnit.test( "se <register>, <byte>", function (assert) {
  var assembly = String.raw`
SE VD, 0xEF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "3DEF");
});

QUnit.test( "sne <register>, <byte>", function (assert) {
  var assembly = String.raw`
SNE V5, 0x67
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "4567");
});

QUnit.test( "se <register>, <register>", function (assert) {
  var assembly = String.raw`
SE VA, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "5AF0");
});

QUnit.test( "ld <register>, <byte>", function (assert) {
  var assembly = String.raw`
LD V0, 0x12
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "6012");
});

QUnit.test( "add <register>, <byte>", function (assert) {
  var assembly = String.raw`
ADD V8, 0x9A
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "789A");
});

QUnit.test( "ld <register>, <register>", function (assert) {
  var assembly = String.raw`
LD V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "80F0");
});

QUnit.test( "or <register>, <register>", function (assert) {
  var assembly = String.raw`
OR V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "80F1");
});

QUnit.test( "and <register>, <register>", function (assert) {
  var assembly = String.raw`
AND V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "80F2");
});

QUnit.test( "xor <register>, <register>", function (assert) {
  var assembly = String.raw`
XOR V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "80F3");
});

QUnit.test( "add <register>, <register>", function (assert) {
  var assembly = String.raw`
ADD V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "80F4");
});

QUnit.test( "sub <register>, <register>", function (assert) {
  var assembly = String.raw`
SUB V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "80F5");
});

QUnit.test( "shr <register>, <register>", function (assert) {
  var assembly = String.raw`
SHR V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  // TODO RvH: can we just ignore register 2 ("VF") and return a 0 instead in the opcode?
  assert.equal(opcodes, "80F6");
});

QUnit.test( "shr <register>", function (assert) {
  var assembly = String.raw`
SHR V0
`;

  var opcodes = Assembler.parse(assembly);

  // TODO RvH: does absence of register 2 translate to 0 in the opcode?
  // Probably doesn't matter since it will be ignored anyway.
  assert.equal(opcodes, "8006");
});

QUnit.test( "subn <register>, <register>", function (assert) {
  var assembly = String.raw`
SUBN V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "80F7");
});

QUnit.test( "shl <register>, <register>", function (assert) {
  var assembly = String.raw`
SHL V0, VF
`;

  var opcodes = Assembler.parse(assembly);

  // TODO RvH: can we just ignore register 2 ("VF") and return a 0 instead in the opcode?
  assert.equal(opcodes, "80FE");
});

QUnit.test( "shl <register>", function (assert) {
  var assembly = String.raw`
SHL V0
`;

  var opcodes = Assembler.parse(assembly);

  // TODO RvH: does absence of register 2 translate to 0 in the opcode?
  // Probably doesn't matter since it will be ignored anyway.
  assert.equal(opcodes, "800E");
});

QUnit.test( "sne <register>, <register>", function (assert) {
  var assembly = String.raw`
SNE VA, VF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "9AF0");
});

QUnit.test( "ld I, <addr>", function (assert) {
  var assembly = String.raw`
LD I, 0xCEF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "ACEF");
});

QUnit.test( "jp V0, <addr>", function (assert) {
  var assembly = String.raw`
JP V0, 0xCEF
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "BCEF");
});

QUnit.test( "rnd <register>, <byte>", function (assert) {
  var assembly = String.raw`
RND VA, 0x12
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "CA12");
});

QUnit.test( "drw <register>, <register>, <nibble>", function (assert) {
  var assembly = String.raw`
DRW VA, VB, 0xC
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "DABC");
});

QUnit.test( "skp <register>", function (assert) {
  var assembly = String.raw`
SKP V5
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "E59E");
});

QUnit.test( "sknp <register>", function (assert) {
  var assembly = String.raw`
SKNP V5
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "E5A1");
});

QUnit.test( "ld <register>, DT", function (assert) {
  var assembly = String.raw`
LD VD, DT
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD07");
});

QUnit.test( "ld <register>, K", function (assert) {
  var assembly = String.raw`
LD VD, K
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD0A");
});

QUnit.test( "ld DT, <register>", function (assert) {
  var assembly = String.raw`
LD DT, VD
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD15");
});

QUnit.test( "ld ST, <register>", function (assert) {
  var assembly = String.raw`
LD ST, VD
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD18");
});

QUnit.test( "add I, <register>", function (assert) {
  var assembly = String.raw`
ADD I, VD
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD1E");
});

QUnit.test( "ld F, <register>", function (assert) {
  var assembly = String.raw`
LD F, VD
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD29");
});

QUnit.test( "ld B, <register>", function (assert) {
  var assembly = String.raw`
LD B, VD
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD33");
});

QUnit.test( "ld I, <register>", function (assert) {
  // TODO RvH: or should this be "[I]"?
  var assembly = String.raw`
LD I, VD
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD55");
});

QUnit.test( "ld <register>, I", function (assert) {
  // TODO RvH: or should this be "[I]"?
  var assembly = String.raw`
LD VD, I
`;

  var opcodes = Assembler.parse(assembly);

  assert.equal(opcodes, "FD65");
});
