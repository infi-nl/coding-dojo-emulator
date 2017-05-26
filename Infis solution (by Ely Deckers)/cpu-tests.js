"use strict";

// TODO ED Test RND Vx, byte
// TODO ED Test SKP Vx
// TODO ED Test SKNP Vx
// TODO ED Test LD Vx, K
// TODO ED Test LD F, Vx

var display = { "getWidth": function () { return 0; }, "getHeight": function () { return 0; } },
    mmu     = new Chip8.MMU(), 
    cpu     = new Chip8.CPU(mmu, display), 
    TestHelper = {
  ROM_OFFSET: 0x200,
  getPC: function () {
    var status = cpu.getStatus();
   
    return status.pc;
  },
  getSP: function () {
    var status = cpu.getStatus();
   
    return status.sp;
  },
  getStackTop: function () {
    var status = cpu.getStatus();

    return status.stack[status.sp];
  },
  getDataRegister: function (register) {
    var status = cpu.getStatus();
   
    return status.register[register];
  },
  getAddressRegister: function (register) {
    var status = cpu.getStatus();
   
    return status.addressRegister;
  },
  getDTRegister: function (register) {
    var status = cpu.getStatus();
   
    return status.dtRegister;
  },
  getSTRegister: function (register) {
    var status = cpu.getStatus();
   
    return status.stRegister;
  },
  setDataRegister: function (register, value) {
    var operation       = 0x6000,
        registerOperand = (register & 0x000F) << 8,
        valueOperand    = value & 0x00FF;

    cpu.process(operation | registerOperand | valueOperand);
  },
  setAddressRegister: function (value) {
    var operation       = 0xA000,
        valueOperand    = value & 0x0FFF;

    cpu.process(operation | valueOperand);
  },
  setDTRegister: function (value) {
    var operation       = 0xF015,
        originalValue   = TestHelper.getDataRegister(0);

    TestHelper.setDataRegister(0, value);

    cpu.process(operation);

    TestHelper.setDataRegister(0, originalValue);
  },
  setPC: function (address) {
    var operation      = 0x1000,
        addressOperand = address & 0x0FFF;

    cpu.process(operation | addressOperand);
  }
};

// TODO ED Add stack limit test
// TODO ED Add CLS instruction


QUnit.test( "[00EE] RET", function (assert) {
  var result321PC, result321SP, result321Stack;

  cpu.reset();

  TestHelper.setPC(0x0123);
  cpu.process(0x2321);

  cpu.process(0x00EE);
  result321PC    = TestHelper.getPC();
  result321SP    = TestHelper.getSP();
  result321Stack = TestHelper.getStackTop();


  assert.equal(result321PC, 0x0125, "PC = 125" );
  assert.equal(result321SP, 0x0000, "SP = 0" );
  assert.equal(result321Stack, 0x0000, "Stack = 0x0000" );
});

QUnit.test( "[1nnn] JP addr", function (assert) {
  var resultPC123, resultPC321;

  cpu.reset();

  cpu.process(0x1123);
  resultPC123 = TestHelper.getPC();
  cpu.process(0x1321);
  resultPC321 = TestHelper.getPC();

  assert.equal(resultPC123, 0x0123, "PC = 123" );
  assert.equal(resultPC321, 0x0321, "PC = 321" );
});

QUnit.test( "[2nnn] CALL addr", function (assert) {
  var result123PC, result123SP, result123Stack, result321PC, result321SP, result321Stack;

  cpu.reset();

  cpu.process(0x2123);
  result123PC    = TestHelper.getPC();
  result123SP    = TestHelper.getSP();
  result123Stack = TestHelper.getStackTop();

  cpu.process(0x2321);
  result321PC    = TestHelper.getPC();
  result321SP    = TestHelper.getSP();
  result321Stack = TestHelper.getStackTop();

  assert.equal(result123PC, 0x0123, "PC = 123" );
  assert.equal(result123SP, 0x0001, "SP = 1" );
  assert.equal(result123Stack, TestHelper.ROM_OFFSET, "Stack = 0x200" );
  assert.equal(result321PC, 0x0321, "PC = 321" );
  assert.equal(result321SP, 0x0002, "SP = 2" );
  assert.equal(result321Stack, 0x0123, "Stack = 0x0123" );
});

QUnit.test( "[3xkk] SE Vx, byte", function (assert) {
  var pcStart, pcDiffEqual, pcDiffNotEqual;

  cpu.reset();

  TestHelper.setDataRegister(0, 0x42);
  pcStart = TestHelper.getPC();

  cpu.process(0x3042);

  pcDiffEqual = TestHelper.getPC() - pcStart;

  TestHelper.setDataRegister(0, 0x08);
  pcStart = TestHelper.getPC();

  cpu.process(0x3042);

  pcDiffNotEqual = TestHelper.getPC() - pcStart;
  

  assert.equal(pcDiffEqual, 0x04, "Skip when equal values" );
  assert.equal(pcDiffNotEqual, 0x02, "Don't skip when inequal values" );
});

QUnit.test( "[4xkk] SNE Vx, byte", function (assert) {
  var pcStart, pcDiffEqual, pcDiffNotEqual;

  cpu.reset();

  TestHelper.setDataRegister(0, 0x42);
  pcStart = TestHelper.getPC();

  cpu.process(0x4042);

  pcDiffEqual = TestHelper.getPC() - pcStart;

  TestHelper.setDataRegister(0, 0x08);
  pcStart = TestHelper.getPC();

  cpu.process(0x4042);

  pcDiffNotEqual = TestHelper.getPC() - pcStart;
  

  assert.equal(pcDiffEqual, 0x02, "Skip when equal values" );
  assert.equal(pcDiffNotEqual, 0x04, "Don't skip when inequal values" );
});

QUnit.test( "[5xy0] SE Vx, Vy", function (assert) {
  var pcStart, pcDiffEqual, pcDiffNotEqual;

  cpu.reset();

  TestHelper.setDataRegister(0, 0x42);
  TestHelper.setDataRegister(1, 0x42);

  pcStart = TestHelper.getPC();

  cpu.process(0x5010);

  pcDiffEqual = TestHelper.getPC() - pcStart;


  TestHelper.setDataRegister(0, 0x42);
  TestHelper.setDataRegister(1, 0x08);

  pcStart = TestHelper.getPC();

  cpu.process(0x5010);

  pcDiffNotEqual = TestHelper.getPC() - pcStart;
  

  assert.equal(pcDiffEqual, 0x04, "Skip when equal values" );
  assert.equal(pcDiffNotEqual, 0x02, "Don't skip when inequal values" );
});

QUnit.test( "[6xkk] LD Vx, byte", function (assert) {
  cpu.reset();

  cpu.process(0x6042);

  assert.equal( TestHelper.getDataRegister(0x00), 0x42, "LD 0, 0x42 = 0x42" );
});

QUnit.test( "[7xkk] ADD Vx, byte", function (assert) {
  var result0ADD1, result0ADD1F, result0ADD255, result0ADD255F, result1ADD255, result1ADD255F;

  cpu.reset();

  TestHelper.setDataRegister(0, 0);

  cpu.process(0x7001);

  result0ADD1  = TestHelper.getDataRegister(0x00);
  result0ADD1F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 0);

  cpu.process(0x70FF);
  
  result0ADD255  = TestHelper.getDataRegister(0x00);
  result0ADD255F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 1);

  cpu.process(0x70FF);

  result1ADD255  = TestHelper.getDataRegister(0x00);
  result1ADD255F = TestHelper.getDataRegister(0x0F);


  assert.equal(result0ADD1, 1, "ADD 0,0; V0 = 0" );
  assert.equal(result0ADD1F, 0, "ADD 0,0; VF = 0" );
  assert.equal(result0ADD255, 255, "ADD 0,255; V0 = 255" );
  assert.equal(result0ADD255F, 0, "ADD 0,255; VF = 0" );
  assert.equal(result1ADD255, 0, "ADD 1,255; V0 = 0" );
  assert.equal(result1ADD255F, 0, "ADD 1,255; VF = 0" );
});

QUnit.test( "[8xy0] LD Vx,Vy", function (assert) {
  cpu.reset();

  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 8);

  cpu.process(0x8010);

  assert.equal( TestHelper.getDataRegister(0x00),  8, "LD 0,8 = 8" );
});

QUnit.test( "[8xy1] OR Vx, Vy", function (assert) {
  var result0OR0, result1OR0, result0OR1, result1OR1;

  cpu.reset();

  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 0);

  cpu.process(0x8011);

  result0OR0 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 0);

  cpu.process(0x8011);

  result0OR1 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8011);

  result1OR0 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8011);

  result1OR1 = TestHelper.getDataRegister(0x00);

  assert.equal(result0OR0, 0, "OR 0,0 = 0" );
  assert.equal(result0OR1, 1, "OR 0,1 = 1" );
  assert.equal(result1OR0, 1, "OR 1,0 = 1" );
  assert.equal(result1OR1, 1, "OR 1,1 = 1" );
});

QUnit.test( "[8xy2] AND Vx, Vy", function (assert) {
  var result0AND0, result1AND0, result0AND1, result1AND1;

  cpu.reset();

  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 0);

  cpu.process(0x8012);

  result0AND0 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 0);

  cpu.process(0x8012);

  result0AND1 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8012);

  result1AND0 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8012);

  result1AND1 = TestHelper.getDataRegister(0x00);

  assert.equal(result0AND0, 0, "AND 0,0 = 0" );
  assert.equal(result0AND1, 0, "AND 0,1 = 0" );
  assert.equal(result1AND0, 0, "AND 1,0 = 0" );
  assert.equal(result1AND1, 1, "AND 1,1 = 1" );
});

QUnit.test( "[8xy3] XOR Vx, Vy", function (assert) {
  var result0XOR0, result1XOR0, result0XOR1, result1XOR1;

  cpu.reset();

  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 0);

  cpu.process(0x8013);

  result0XOR0 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8013);

  result0XOR1 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 0);

  cpu.process(0x8013);

  result1XOR0 = TestHelper.getDataRegister(0x00);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8013);

  result1XOR1 = TestHelper.getDataRegister(0x00);

  assert.equal(result0XOR0, 0, "XOR 0,0 = 0" );
  assert.equal(result0XOR1, 1, "XOR 0,1 = 1" );
  assert.equal(result1XOR0, 1, "XOR 1,0 = 1" );
  assert.equal(result1XOR1, 0, "XOR 1,1 = 0" );
});

QUnit.test( "[8xy4] ADD Vx, Vy", function (assert) {
  var result0ADD1, result0ADD1F, result0ADD255, result0ADD255F, result1ADD255, result1ADD255F;

  cpu.reset();

  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8014);

  result0ADD1  = TestHelper.getDataRegister(0x00);
  result0ADD1F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 0xFF);

  cpu.process(0x8014);

  result0ADD255  = TestHelper.getDataRegister(0x00);
  result0ADD255F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 0xFF);

  cpu.process(0x8014);

  result1ADD255  = TestHelper.getDataRegister(0x00);
  result1ADD255F = TestHelper.getDataRegister(0x0F);


  assert.equal(result0ADD1, 1, "ADD 0,0; V0 = 0" );
  assert.equal(result0ADD1F, 0, "ADD 0,0; VF = 0" );
  assert.equal(result0ADD255, 255, "ADD 0,255; V0 = 255" );
  assert.equal(result0ADD255F, 0, "ADD 0,255; VF = 0" );
  assert.equal(result1ADD255, 0, "ADD 1,255; V0 = 0" );
  assert.equal(result1ADD255F, 1, "ADD 1,255; VF = 1" );
});

QUnit.test( "[8xy5] SUB Vx, Vy", function (assert) {
  var result0SUB1, result0SUB1F, result1SUB1, result1SUB1F, result255SUB1, result255SUB1F;

  cpu.reset();

  TestHelper.setDataRegister(0, 0);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8015);

  result0SUB1  = TestHelper.getDataRegister(0x00);
  result0SUB1F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8015);

  result1SUB1  = TestHelper.getDataRegister(0x00);
  result1SUB1F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 0xFF);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8015);

  result255SUB1  = TestHelper.getDataRegister(0x00);
  result255SUB1F = TestHelper.getDataRegister(0x0F);


  assert.equal(result0SUB1, 255, "SUB 0,1; V0 = 255" );
  assert.equal(result0SUB1F, 0, "SUB 0,1; VF = 0" );
  assert.equal(result1SUB1, 0, "SUB 1,1; V0 = 0" );
  assert.equal(result1SUB1F, 1, "SUB 1,1; VF = 1" );
  assert.equal(result255SUB1, 254, "SUB 255,1; V0 = 254" );
  assert.equal(result255SUB1F, 1, "SUB 255,1; VF = 1" );
});

QUnit.test( "[8xy6] SHR Vx{, Vy}", function (assert) {
  var result255SHR, result255SHRF, result254SHR, result254SHRF, result255SHR, result255SHRF;

  cpu.reset();

  TestHelper.setDataRegister(0, 0xFF);

  cpu.process(0x8016);

  result255SHR  = TestHelper.getDataRegister(0x00);
  result255SHRF = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 0xFE);

  cpu.process(0x8016);

  result254SHR  = TestHelper.getDataRegister(0x00);
  result254SHRF = TestHelper.getDataRegister(0x0F);


  assert.equal(result255SHR, 0x7F, "SHR 255; V0 = 127" );
  assert.equal(result255SHRF, 1, "SHR 255; VF = 1" );
  assert.equal(result254SHR, 0x7F, "SHR 254; V0 = 127" );
  assert.equal(result254SHRF, 0, "SHR 254; VF = 0" );
});

QUnit.test( "[8xy7] SUBN Vx, Vy", function (assert) {
  var result0SUBN1, result0SUBN1F, result1SUBN1, result1SUBN1F, result255SUBN1, result255SUBN1F;

  cpu.reset();

  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 0);

  cpu.process(0x8017);

  result0SUBN1  = TestHelper.getDataRegister(0x00);
  result0SUBN1F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 1);

  cpu.process(0x8017);

  result1SUBN1  = TestHelper.getDataRegister(0x00);
  result1SUBN1F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setDataRegister(1, 0xFF);

  cpu.process(0x8017);

  result255SUBN1  = TestHelper.getDataRegister(0x00);
  result255SUBN1F = TestHelper.getDataRegister(0x0F);


  assert.equal(result0SUBN1, 255, "SUBN 0,1; V0 = 255" );
  assert.equal(result0SUBN1F, 0, "SUBN 0,1; VF = 0" );
  assert.equal(result1SUBN1, 0, "SUBN 1,1; V0 = 0" );
  assert.equal(result1SUBN1F, 1, "SUBN 1,1; VF = 1" );
  assert.equal(result255SUBN1, 254, "SUBN 255,1; V0 = 0" );
  assert.equal(result255SUBN1F, 1, "SUBN 255,1; VF = 1" );
});

QUnit.test( "[8xy6] SHL Vx{, Vy}", function (assert) {
  var result255SHL, result255SHLF, result127SHL, result127SHLF, result255SHL, result255SHLF;

  cpu.reset();

  TestHelper.setDataRegister(0, 0xFF);

  cpu.process(0x801E);

  result255SHL  = TestHelper.getDataRegister(0x00);
  result255SHLF = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 0x7F);

  cpu.process(0x801E);

  result127SHL  = TestHelper.getDataRegister(0x00);
  result127SHLF = TestHelper.getDataRegister(0x0F);


  assert.equal(result255SHL, 0xFE, "SHL 255; V0 = 254" );
  assert.equal(result255SHLF, 1, "SHL 255; VF = 1" );
  assert.equal(result127SHL, 0xFE, "SHL 127; V0 = 254" );
  assert.equal(result127SHLF, 0, "SHL 127; VF = 0" );
});

QUnit.test( "[Annn] LD I, addr", function (assert) {
  cpu.reset();

  cpu.process(0xA123);
  
  assert.equal(TestHelper.getAddressRegister(), 0x0123, "LD I, 123 = 123" );
});

QUnit.test( "[Bnnn] JP V0, addr", function (assert) {
  cpu.reset();

  TestHelper.setDataRegister(0, 0x42); 
  cpu.process(0xB321);

  assert.equal(TestHelper.getPC(), 0x363, "JP 42, 321 = 363" );
});

QUnit.test( "[Fx07] LD Vx, DT", function (assert) {
  cpu.reset();

  TestHelper.setDTRegister(8);
  cpu.process(0xF007);

  assert.equal(TestHelper.getDataRegister(0), 8, "LD Vx, DT = 8" );
});

QUnit.test( "[Fx15] LD DT, Vx", function (assert) {
  cpu.reset();

  TestHelper.setDataRegister(0, 8);
  cpu.process(0xF015);

  assert.equal(TestHelper.getDTRegister(), 8, "LD DT, Vx = 8" );
});

QUnit.test( "[Fx18] LD ST, Vx", function (assert) {
  cpu.reset();

  TestHelper.setDataRegister(0, 8);
  cpu.process(0xF018);

  assert.equal(TestHelper.getSTRegister(), 8, "LD ST, Vx = 8" );
});

QUnit.test( "[Fx1E] ADD I, Vx", function (assert) {
  var result0ADD1, result0ADD1F, result0ADD255, result0ADD255F, result1ADD255, result1ADD255F;

  cpu.reset();

  TestHelper.setDataRegister(0, 0);
  TestHelper.setAddressRegister(1);

  cpu.process(0xF01E);

  result0ADD1  = TestHelper.getAddressRegister();
  result0ADD1F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 0);
  TestHelper.setAddressRegister(0x0FFF);

  cpu.process(0xF01E);
  
  result0ADD255  = TestHelper.getAddressRegister();
  result0ADD255F = TestHelper.getDataRegister(0x0F);


  TestHelper.setDataRegister(0, 1);
  TestHelper.setAddressRegister(0xFFFF);

  cpu.process(0xF01E);

  result1ADD255  = TestHelper.getAddressRegister();
  result1ADD255F = TestHelper.getDataRegister(0x0F);


  assert.equal(result0ADD1, 1, "ADD 0,0; V0 = 0" );
  assert.equal(result0ADD1F, 0, "ADD 0,0; VF = 0" );
  assert.equal(result0ADD255, 0x0FFF, "ADD 0,4095; V0 = 4095" );
  assert.equal(result0ADD255F, 0, "ADD 0,4095; VF = 0" );
  assert.equal(result1ADD255, 0x1000, "ADD 1,4095; V0 = 4096" );
  assert.equal(result1ADD255F, 0, "ADD 1,4095; VF = 0" );
});

QUnit.test( "[Fx33] LD B, Vx", function (assert) {
  cpu.reset();

  TestHelper.setAddressRegister(0); 
  TestHelper.setDataRegister(0, 0xFF); 
  cpu.process(0xF033);

  assert.equal(mmu.read(0), 2, "LD I, 255, x0 = 2" );
  assert.equal(mmu.read(1), 5, "LD I, 255, x1 = 5" );
  assert.equal(mmu.read(2), 5, "LD I, 255, x2 = 5" );
});

QUnit.test( "[Fx55] LD [I], Vx", function (assert) {
  cpu.reset();

  for (var i=0; i<0x10; i++) {
    TestHelper.setDataRegister(i, 0xF - i); 
  }

  cpu.process(0xFF55);

  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0xF), 0x0, "LD [I], F = 0" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0xE), 0x1, "LD [I], E = 1" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0xD), 0x2, "LD [I], D = 2" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0xC), 0x3, "LD [I], C = 3" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0xB), 0x4, "LD [I], B = 4" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0xA), 0x5, "LD [I], A = 5" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x9), 0x6, "LD [I], 9 = 6" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x8), 0x7, "LD [I], 8 = 7" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x7), 0x8, "LD [I], 7 = 8" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x6), 0x9, "LD [I], 6 = 9" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x5), 0xA, "LD [I], 5 = A" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x4), 0xB, "LD [I], 4 = B" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x3), 0xC, "LD [I], 3 = C" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x2), 0xD, "LD [I], 2 = D" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x1), 0xE, "LD [I], 1 = E" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x0), 0xF, "LD [I], 0 = F" );

  mmu.write(TestHelper.getAddressRegister() + 0x00, 0xA);
  mmu.write(TestHelper.getAddressRegister() + 0x01, 0xA);
  mmu.write(TestHelper.getAddressRegister() + 0x02, 0xA);

  TestHelper.setDataRegister(0x00, 0xFF);
  TestHelper.setDataRegister(0x01, 0xFF);
  TestHelper.setDataRegister(0x02, 0xFF);

  cpu.process(0xF155);

  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x00), 0xFF, "LD [I], 0 = 255" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x01), 0xFF, "LD [I], 1 = 255" );
  assert.equal(mmu.read(TestHelper.getAddressRegister() + 0x02), 0x0A, "LD [I], 2 = 10" );
});

QUnit.test( "[Fx65] LD Vx, [I]", function (assert) {
  cpu.reset();

  for (var i=0; i<0x10; i++) {
    mmu.write(i, 0xF - i);
  }

  cpu.process(0xFF65);

  assert.equal(TestHelper.getDataRegister(0xF), 0x0, "LD F, [I] = 0" );
  assert.equal(TestHelper.getDataRegister(0xE), 0x1, "LD E, [I] = 1" );
  assert.equal(TestHelper.getDataRegister(0xD), 0x2, "LD D, [I] = 2" );
  assert.equal(TestHelper.getDataRegister(0xC), 0x3, "LD C, [I] = 3" );
  assert.equal(TestHelper.getDataRegister(0xB), 0x4, "LD B, [I] = 4" );
  assert.equal(TestHelper.getDataRegister(0xA), 0x5, "LD A, [I] = 5" );
  assert.equal(TestHelper.getDataRegister(0x9), 0x6, "LD 9, [I] = 6" );
  assert.equal(TestHelper.getDataRegister(0x8), 0x7, "LD 8, [I] = 7" );
  assert.equal(TestHelper.getDataRegister(0x7), 0x8, "LD 7, [I] = 8" );
  assert.equal(TestHelper.getDataRegister(0x6), 0x9, "LD 6, [I] = 9" );
  assert.equal(TestHelper.getDataRegister(0x5), 0xA, "LD 5, [I] = A" );
  assert.equal(TestHelper.getDataRegister(0x4), 0xB, "LD 4, [I] = B" );
  assert.equal(TestHelper.getDataRegister(0x3), 0xC, "LD 3, [I] = C" );
  assert.equal(TestHelper.getDataRegister(0x2), 0xD, "LD 2, [I] = D" );
  assert.equal(TestHelper.getDataRegister(0x1), 0xE, "LD 1, [I] = E" );
  assert.equal(TestHelper.getDataRegister(0x0), 0xF, "LD 0, [I] = F" );

  TestHelper.setDataRegister(0x0, 0xFF);
  TestHelper.setDataRegister(0x1, 0xFF);
  TestHelper.setDataRegister(0x2, 0xA);

  mmu.write(0x00, 0xFF);
  mmu.write(0x01, 0xFF);
  mmu.write(0x02, 0xFF);

  cpu.process(0xF165);

  assert.equal(TestHelper.getDataRegister(0x0), 0xFF, "LD 0, [I] = 255" );
  assert.equal(TestHelper.getDataRegister(0x1), 0xFF, "LD 1, [I] = 255" );
  assert.equal(TestHelper.getDataRegister(0x2), 0xA, "LD 2, [I] = 10" );
  
});
