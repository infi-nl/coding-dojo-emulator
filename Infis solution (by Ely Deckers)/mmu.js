"use strict";

(function (Chip8) {
  Chip8.MMU = function () {
    var ROM_OFFSET             = 0x200,
        _memory                = new Uint8Array(4000),
        _fillPredefinedSprites = function () {
         _memory[0]  = 0xF0; /* 11110000 */
         _memory[1]  = 0x90; /* 10010000 */
         _memory[2]  = 0x90; /* 10010000 */
         _memory[3]  = 0x90; /* 10010000 */
         _memory[4]  = 0xF0; /* 11110000 */

         _memory[5]  = 0x20; /* 00100000 */
         _memory[6]  = 0x60; /* 01100000 */
         _memory[7]  = 0x20; /* 00100000 */
         _memory[8]  = 0x20; /* 00100000 */
         _memory[9]  = 0x70; /* 01110000 */

         _memory[10] = 0xF0; /* 11110000 */
         _memory[11] = 0x10; /* 00010000 */
         _memory[12] = 0xF0; /* 11110000 */
         _memory[13] = 0x80; /* 10000000 */
         _memory[14] = 0xF0; /* 11110000 */

         _memory[15] = 0xF0; /* 11110000 */
         _memory[16] = 0x10; /* 00010000 */
         _memory[17] = 0xF0; /* 11110000 */
         _memory[18] = 0x10; /* 00010000 */
         _memory[19] = 0xF0; /* 11110000 */

         _memory[20] = 0x90; /* 10010000 */
         _memory[21] = 0x90; /* 10010000 */
         _memory[22] = 0xF0; /* 11110000 */
         _memory[23] = 0x10; /* 00010000 */
         _memory[24] = 0x10; /* 00010000 */

         _memory[25] = 0xF0; /* 11110000 */
         _memory[26] = 0x80; /* 10000000 */
         _memory[27] = 0xF0; /* 11110000 */
         _memory[28] = 0x10; /* 00010000 */
         _memory[29] = 0xF0; /* 11110000 */

         _memory[30] = 0xF0; /* 11110000 */
         _memory[31] = 0x80; /* 10000000 */
         _memory[32] = 0xF0; /* 11110000 */
         _memory[33] = 0x90; /* 10010000 */
         _memory[34] = 0xF0; /* 11110000 */

         _memory[35] = 0xF0; /* 11110000 */
         _memory[36] = 0x10; /* 00010000 */
         _memory[37] = 0x20; /* 00100000 */
         _memory[38] = 0x40; /* 01000000 */
         _memory[39] = 0x40; /* 01000000 */

         _memory[40] = 0xF0; /* 11110000 */
         _memory[41] = 0x90; /* 10010000 */
         _memory[42] = 0xF0; /* 11110000 */
         _memory[43] = 0x90; /* 10010000 */
         _memory[44] = 0xF0; /* 11110000 */

         _memory[45] = 0xF0; /* 11110000 */
         _memory[46] = 0x90; /* 10010000 */
         _memory[47] = 0xF0; /* 11110000 */
         _memory[48] = 0x10; /* 00010000 */
         _memory[49] = 0xF0; /* 11110000 */

         _memory[50] = 0xF0; /* 11110000 */
         _memory[51] = 0x90; /* 10010000 */
         _memory[52] = 0xF0; /* 11110000 */
         _memory[53] = 0x90; /* 10010000 */
         _memory[54] = 0x90; /* 10010000 */

         _memory[55] = 0xE0; /* 11100000 */
         _memory[56] = 0x90; /* 10010000 */
         _memory[57] = 0xE0; /* 11100000 */
         _memory[58] = 0x90; /* 10010000 */
         _memory[59] = 0xE0; /* 11100000 */

         _memory[60] = 0xF0; /* 11110000 */
         _memory[61] = 0x80; /* 10000000 */
         _memory[62] = 0x80; /* 10000000 */
         _memory[63] = 0x80; /* 10000000 */
         _memory[64] = 0xF0; /* 11110000 */

         _memory[65] = 0xE0; /* 11100000 */
         _memory[66] = 0x90; /* 10010000 */
         _memory[67] = 0x90; /* 10010000 */
         _memory[68] = 0x90; /* 10010000 */
         _memory[69] = 0xE0; /* 11100000 */

         _memory[70] = 0xF0; /* 11110000 */
         _memory[71] = 0x80; /* 10000000 */
         _memory[72] = 0xF0; /* 11110000 */
         _memory[73] = 0x80; /* 10000000 */
         _memory[74] = 0xF0; /* 11110000 */

         _memory[75] = 0xF0; /* 11110000 */
         _memory[76] = 0x80; /* 10000000 */
         _memory[77] = 0xF0; /* 11110000 */
         _memory[78] = 0x80; /* 10000000 */
         _memory[79] = 0x80; /* 10000000 */
        };

    _fillPredefinedSprites();

    return {
      loadROM: function (rom) { for (var i=0; i<rom.length; i++) { _memory[ROM_OFFSET + i] = rom[i] & 0xFF; } },
      write  : function (address, value) { _memory[address & 0xFFFF] = value & 0xFF; },
      read   : function (address) { return _memory[address & 0xFFFF]; }
    }
  };
}(window.Chip8));
