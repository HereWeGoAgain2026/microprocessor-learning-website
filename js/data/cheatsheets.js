/* ==========================================================================
   REVISION CHEAT SHEETS & QUICK REFERENCE TABLES
   High-density review charts for exams
   ========================================================================== */

export const CHEATSHEETS = {
  // 1. Core Instructions Reference
  instructions: [
    { mnemonic: 'MOV', operands: 'dest, src', desc: 'Transfer byte, word, or dword', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'PUSH', operands: 'src', desc: 'Decrement SP/ESP, push word/dword', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'POP', operands: 'dest', desc: 'Pop word/dword from stack, increment SP', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'XCHG', operands: 'op1, op2', desc: 'Exchange register/memory contents', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'LEA', operands: 'reg, [mem]', desc: 'Load Effective Address offset into reg', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'ADD', operands: 'dest, src', desc: 'Binary addition (dest ← dest + src)', flags: 'CF, OF, ZF, SF, AF, PF', mode: '8086 / 386' },
    { mnemonic: 'ADC', operands: 'dest, src', desc: 'Add with carry (dest ← dest + src + CF)', flags: 'CF, OF, ZF, SF, AF, PF', mode: '8086 / 386' },
    { mnemonic: 'SUB', operands: 'dest, src', desc: 'Binary subtraction (dest ← dest - src)', flags: 'CF, OF, ZF, SF, AF, PF', mode: '8086 / 386' },
    { mnemonic: 'SBB', operands: 'dest, src', desc: 'Subtract with borrow (dest - src - CF)', flags: 'CF, OF, ZF, SF, AF, PF', mode: '8086 / 386' },
    { mnemonic: 'INC', operands: 'op', desc: 'Increment operand by 1 (CF preserved!)', flags: 'OF, ZF, SF, AF, PF (CF=unchanged)', mode: '8086 / 386' },
    { mnemonic: 'DEC', operands: 'op', desc: 'Decrement operand by 1 (CF preserved!)', flags: 'OF, ZF, SF, AF, PF (CF=unchanged)', mode: '8086 / 386' },
    { mnemonic: 'CMP', operands: 'dest, src', desc: 'Compare operands (internal dest - src)', flags: 'CF, OF, ZF, SF, AF, PF', mode: '8086 / 386' },
    { mnemonic: 'MUL', operands: 'src', desc: 'Unsigned multiply (AX ← AL*src or DX:AX ← AX*src)', flags: 'CF, OF (ZF, SF, AF, PF undef)', mode: '8086 / 386' },
    { mnemonic: 'DIV', operands: 'src', desc: 'Unsigned divide (Quotient in AL/AX, Rem in AH/DX)', flags: 'All flags undefined', mode: '8086 / 386' },
    { mnemonic: 'AND', operands: 'dest, src', desc: 'Bitwise logical AND; clears CF and OF to 0', flags: 'CF=0, OF=0, ZF, SF, PF', mode: '8086 / 386' },
    { mnemonic: 'OR', operands: 'dest, src', desc: 'Bitwise logical OR; clears CF and OF to 0', flags: 'CF=0, OF=0, ZF, SF, PF', mode: '8086 / 386' },
    { mnemonic: 'XOR', operands: 'dest, src', desc: 'Bitwise logical XOR; clears CF and OF to 0', flags: 'CF=0, OF=0, ZF, SF, PF', mode: '8086 / 386' },
    { mnemonic: 'NOT', operands: 'op', desc: 'One\'s complement bit inversion', flags: 'None (flags unaffected!)', mode: '8086 / 386' },
    { mnemonic: 'TEST', operands: 'dest, src', desc: 'Logical compare (dest AND src, no store)', flags: 'CF=0, OF=0, ZF, SF, PF', mode: '8086 / 386' },
    { mnemonic: 'SHL / SAL', operands: 'dest, count', desc: 'Shift logical / arithmetic left, fills 0s', flags: 'CF receives out-bit, OF, ZF, SF, PF', mode: '8086 / 386' },
    { mnemonic: 'SHR', operands: 'dest, count', desc: 'Shift logical right, fills 0s at MSB', flags: 'CF receives out-bit, OF, ZF, SF, PF', mode: '8086 / 386' },
    { mnemonic: 'SAR', operands: 'dest, count', desc: 'Shift arithmetic right, replicates sign bit', flags: 'CF receives out-bit, OF, ZF, SF, PF', mode: '8086 / 386' },
    { mnemonic: 'ROL / ROR', operands: 'dest, count', desc: 'Rotate bits circularly left or right', flags: 'CF receives bit, OF', mode: '8086 / 386' },
    { mnemonic: 'RCL / RCR', operands: 'dest, count', desc: 'Rotate bits through Carry Flag', flags: 'CF active in loop, OF', mode: '8086 / 386' },
    { mnemonic: 'JMP', operands: 'target', desc: 'Unconditional jump (short, near, far)', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'JZ / JE', operands: 'target', desc: 'Jump if Zero / Jump if Equal (ZF = 1)', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'JNZ / JNE', operands: 'target', desc: 'Jump if Not Zero (ZF = 0)', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'JA / JB', operands: 'target', desc: 'Unsigned jumps: Above (CF=0&ZF=0) / Below (CF=1)', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'JG / JL', operands: 'target', desc: 'Signed jumps: Greater (ZF=0&SF=OF) / Less (SF≠OF)', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'CALL', operands: 'target', desc: 'Push return address to stack, branch', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'RET', operands: '[popBytes]', desc: 'Pop return address from stack to IP/CS', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'LOOP', operands: 'target', desc: 'Decrement CX; jump if CX ≠ 0', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'MOVSB/W/D', operands: 'None', desc: 'Move string from DS:SI to ES:DI', flags: 'None (SI/DI updated by DF)', mode: '8086 / 386' },
    { mnemonic: 'XLAT', operands: 'None', desc: 'Translate byte: AL ← DS:[BX + AL]', flags: 'None', mode: '8086 / 386' },
    { mnemonic: 'CLC / STC', operands: 'None', desc: 'Clear (CF=0) or Set (CF=1) Carry Flag', flags: 'CF updated', mode: '8086 / 386' },
    { mnemonic: 'CLD / STD', operands: 'None', desc: 'Clear (DF=0, inc) or Set (DF=1, dec) Direction', flags: 'DF updated', mode: '8086 / 386' },
    { mnemonic: 'CLI / STI', operands: 'None', desc: 'Clear (IF=0) or Set (IF=1) Interrupt Enable', flags: 'IF updated', mode: '8086 / 386' }
  ],

  // 2. 8086 Addressing Modes
  addressingModes: [
    { mode: 'Immediate', example: 'MOV AX, 1234H', eaFormula: 'Operand in instruction code', defaultSeg: 'CS' },
    { mode: 'Register', example: 'MOV AX, BX', eaFormula: 'Operand in register', defaultSeg: 'None' },
    { mode: 'Direct', example: 'MOV AX, [1000H]', eaFormula: 'EA = Displacement (1000H)', defaultSeg: 'DS' },
    { mode: 'Register Indirect', example: 'MOV AX, [BX]', eaFormula: 'EA = [BX], [BP], [SI], or [DI]', defaultSeg: 'DS (BP uses SS)' },
    { mode: 'Based', example: 'MOV AX, [BX + 04H]', eaFormula: 'EA = Base Register (BX/BP) + Disp', defaultSeg: 'DS (BP uses SS)' },
    { mode: 'Indexed', example: 'MOV AX, [SI + 04H]', eaFormula: 'EA = Index Register (SI/DI) + Disp', defaultSeg: 'DS' },
    { mode: 'Based Indexed', example: 'MOV AX, [BX + SI]', eaFormula: 'EA = Base (BX/BP) + Index (SI/DI)', defaultSeg: 'DS (BP uses SS)' },
    { mode: 'Based Indexed Relative', example: 'MOV AX, [BX + SI + 08H]', eaFormula: 'EA = Base + Index + Disp', defaultSeg: 'DS (BP uses SS)' }
  ],

  // 3. Flags Summary Matrix
  flagsMatrix: [
    { bit: 0, flag: 'CF', name: 'Carry Flag', type: 'Status', setWhen: 'Carry out of MSB (add) or borrow into MSB (sub)' },
    { bit: 2, flag: 'PF', name: 'Parity Flag', type: 'Status', setWhen: 'Low 8 bits of result contain even number of 1s' },
    { bit: 4, flag: 'AF', name: 'Auxiliary Carry', type: 'Status', setWhen: 'Carry out of bit 3 to bit 4 (BCD nibble carry)' },
    { bit: 6, flag: 'ZF', name: 'Zero Flag', type: 'Status', setWhen: 'Result of operation is exactly equal to zero' },
    { bit: 7, flag: 'SF', name: 'Sign Flag', type: 'Status', setWhen: 'MSB of result is 1 (negative signed value)' },
    { bit: 8, flag: 'TF', name: 'Trap Flag', type: 'Control', setWhen: 'Single-step debug mode (Interrupt 1 after each instruction)' },
    { bit: 9, flag: 'IF', name: 'Interrupt Flag', type: 'Control', setWhen: '1 = CPU responds to maskable INTR pin interrupts' },
    { bit: 10, flag: 'DF', name: 'Direction Flag', type: 'Control', setWhen: '0 = String pointers auto-increment; 1 = auto-decrement' },
    { bit: 11, flag: 'OF', name: 'Overflow Flag', type: 'Status', setWhen: 'Signed two\'s complement arithmetic overflow occurs' }
  ],

  // 4. Memory Management Equations
  memoryFormulas: [
    { name: '8086 Real Mode Physical Address', formula: 'Physical Address = (Segment × 16) + Offset = (Segment × 10H) + Offset' },
    { name: '80386DX Linear Address', formula: 'Linear Address = Segment Base Address (from GDT/LDT descriptor) + Offset' },
    { name: '80386DX 2-Level Paging Split', formula: '32-Bit Linear = [Page Dir Index: 10 bits | Page Table Index: 10 bits | Offset: 12 bits]' },
    { name: 'Page Offset to Page Size', formula: 'Page Size = 2^12 = 4096 bytes = 4 KiB' },
    { name: 'Combined Address Flow', formula: 'Logical Address [Selector:Offset] → Segmentation → Linear Address → Paging → Physical Address' }
  ],

  // 5. Cache Mapping Equations
  cacheFormulas: [
    { name: 'Direct Mapped Cache Line', formula: 'Line Index = (Memory Block Number) mod (Total Cache Lines)' },
    { name: 'Block Offset Bits', formula: 'Offset Bits = log2(Block Size in bytes)' },
    { name: 'Line / Set Index Bits', formula: 'Index Bits = log2(Number of Sets or Lines)' },
    { name: 'Tag Bits', formula: 'Tag Bits = Total Address Bits - Index Bits - Offset Bits' },
    { name: 'AMAT (Average Memory Access Time)', formula: 'AMAT = Hit Time + (Miss Rate × Miss Penalty)' },
    { name: 'Miss Rate', formula: 'Miss Rate = 1 - Hit Rate = Misses / Total Accesses' }
  ]
};
