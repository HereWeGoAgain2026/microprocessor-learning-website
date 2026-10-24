/* ==========================================================================
   MICROPROCESSOR INTERACTIVE LEARNING PLATFORM - UNIFIED BUNDLE
   Self-contained: Runs seamlessly on file:// protocol and all web servers
   ========================================================================== */

(function () {
  'use strict';

  // ==========================================================================
  // 1. DATA: GLOSSARY
  // ==========================================================================
  const GLOSSARY = [
    { term: 'Accumulator', abbr: 'AX / EAX', category: 'Architecture', module: 'Module II', definition: 'A dedicated general-purpose register implicitly utilized in arithmetic operations, multiplication, division, and I/O port data transfers.' },
    { term: 'Addressing Mode', abbr: 'EA', category: 'Instructions', module: 'Module II', definition: 'The method or formula specifying how the microprocessor calculates the effective address of an operand in memory or registers.' },
    { term: 'AMAT (Average Memory Access Time)', abbr: 'AMAT', category: 'Cache', module: 'Module III', definition: 'The mean latency required to satisfy a memory reference across cache levels: AMAT = Hit Time + (Miss Rate × Miss Penalty).' },
    { term: 'Auxiliary Carry Flag', abbr: 'AF', category: 'Flags', module: 'Module II', definition: 'Status flag set when a carry or borrow occurs out of bit 3 into bit 4 (nibble carry); used by BCD arithmetic instructions (DAA, DAS).' },
    { term: 'Barrel Shifter', abbr: 'ALU', category: 'Hardware', module: 'Module II', definition: 'Hardware logic circuit that can shift or rotate a data word by an arbitrary number of bit positions in a single clock cycle, introduced in the 80386.' },
    { term: 'Bus Interface Unit', abbr: 'BIU', category: 'Architecture', module: 'Module II', definition: 'Subsystem of the 8086 that interfaces with the external memory bus, performs physical address calculations (Seg × 16 + Offset), and fetches instructions into the prefetch queue.' },
    { term: 'Cache Hit', abbr: 'Hit', category: 'Cache', module: 'Module III', definition: 'An event where requested data or instruction at a memory address is already present in a cache line, yielding immediate low-latency access.' },
    { term: 'Cache Line / Block', abbr: 'Block', category: 'Cache', module: 'Module III', definition: 'The minimum atomic unit of data transfer between main memory and cache memory, typically 32 or 64 contiguous bytes in modern x86 architectures.' },
    { term: 'Cache Miss', abbr: 'Miss', category: 'Cache', module: 'Module III', definition: 'An event where requested memory is not found in cache, forcing the processor to stall while loading the block from lower memory levels.' },
    { term: 'Capacity Miss', abbr: '3 C\'s', category: 'Cache', module: 'Module III', definition: 'A cache miss caused by the physical storage capacity of the cache being too small to hold all blocks required by the working set.' },
    { term: 'Carry Flag', abbr: 'CF', category: 'Flags', module: 'Module II', definition: 'Status flag set when an arithmetic operation generates a carry out of the most significant bit (addition) or requires a borrow into the MSB (subtraction).' },
    { term: 'Compulsory Miss', abbr: 'Cold Miss', category: 'Cache', module: 'Module III', definition: 'A cache miss that occurs on the very first access to a block, regardless of cache capacity or associativity.' },
    { term: 'Conflict Miss', abbr: 'Collision Miss', category: 'Cache', module: 'Module III', definition: 'A miss in direct-mapped or set-associative caches when multiple active memory blocks map to the exact same set index and evict each other.' },
    { term: 'Control Register 3', abbr: 'CR3', category: 'Paging', module: 'Module III', definition: 'An 80386DX system control register that stores the 32-bit physical base address of the active Page Directory.' },
    { term: 'Direct-Mapped Cache', abbr: 'Direct Cache', category: 'Cache', module: 'Module III', definition: 'Cache organization where each memory block maps to exactly one specific line index given by: Line = Block Number mod Total Lines.' },
    { term: 'Direction Flag', abbr: 'DF', category: 'Flags', module: 'Module II', definition: 'Control flag in the FLAGS register; when cleared (CLD, DF=0), string pointers auto-increment; when set (STD, DF=1), string pointers auto-decrement.' },
    { term: 'Dirty Bit', abbr: 'D bit', category: 'Cache & Paging', module: 'Module III', definition: 'A tracking bit set by hardware when a cache block or page frame has been modified in local memory and must be written back to backing store upon eviction.' },
    { term: 'Effective Address', abbr: 'EA', category: 'Memory', module: 'Module II', definition: 'The 16-bit or 32-bit offset of an operand within its memory segment, calculated from base registers, index registers, and displacements.' },
    { term: 'Execution Unit', abbr: 'EU', category: 'Architecture', module: 'Module II', definition: 'The subsystem of the 8086 that contains the ALU, general registers, and control logic that decodes and executes instructions fetched by the BIU.' },
    { term: 'External Fragmentation', abbr: 'Ext. Frag.', category: 'Segmentation', module: 'Module III', definition: 'A condition in segmentation where total free memory is sufficient to satisfy a request, but the memory is fragmented into non-contiguous small gaps.' },
    { term: 'FIFO (First-In, First-Out)', abbr: 'FIFO', category: 'Cache', module: 'Module III', definition: 'A cache or buffer replacement policy that evicts the block that arrived earliest in cache, regardless of recent access frequency.' },
    { term: 'Fully Associative Cache', abbr: 'Associative', category: 'Cache', module: 'Module III', definition: 'Cache organization where any memory block can reside in any available line; tags of all lines are compared in parallel simultaneously.' },
    { term: 'General Protection Fault', abbr: '#GP (Int 13)', category: 'Protected Mode', module: 'Module III', definition: 'Hardware CPU exception raised in protected mode when a program violates segment limits, writes to a read-only segment, or accesses higher privilege rings.' },
    { term: 'Global Descriptor Table', abbr: 'GDT', category: 'Segmentation', module: 'Module III', definition: 'An operating system table in 80386 protected mode that holds 8-byte descriptors defining base addresses, limits, and privilege rights for memory segments.' },
    { term: 'Internal Fragmentation', abbr: 'Int. Frag.', category: 'Paging', module: 'Module III', definition: 'Wasted space within an allocated fixed-size block (such as a 4 KiB page) when the requested memory does not fill the entire final block.' },
    { term: 'Interrupt Vector Table', abbr: 'IVT', category: 'Control Transfer', module: 'Module II', definition: 'A 1024-byte table at physical address 00000H–003FFH in 8086 real mode containing 256 four-byte far pointers (CS:IP) for interrupt service routines.' },
    { term: 'Linear Address', abbr: 'Linear', category: 'Memory', module: 'Module III', definition: 'The 32-bit flat address produced after the Segmentation Unit adds segment base to offset, which is then fed into the Paging Unit.' },
    { term: 'Logical Address', abbr: 'Segment:Offset', category: 'Memory', module: 'Module III', definition: 'An address specified as a segment identifier (or selector) and an offset, representing program-visible references before translation.' },
    { term: 'LRU (Least Recently Used)', abbr: 'LRU', category: 'Cache', module: 'Module III', definition: 'A high-efficiency cache replacement policy that selects for eviction the line that has not been accessed for the longest time.' },
    { term: 'Opcode', abbr: 'Opcode', category: 'Instructions', module: 'Module II', definition: 'The portion of a machine instruction that specifies the basic operation (e.g. MOV, ADD) to be executed by the microprocessor.' },
    { term: 'Overflow Flag', abbr: 'OF', category: 'Flags', module: 'Module II', definition: 'Status flag set when a signed two\'s complement arithmetic operation produces a result that exceeds the positive or negative range of the destination.' },
    { term: 'Page Directory', abbr: 'PD / PDE', category: 'Paging', module: 'Module III', definition: 'The top-level table in two-level 80386DX paging; contains 1024 4-byte entries (PDEs) pointing to physical addresses of second-level Page Tables.' },
    { term: 'Page Fault', abbr: '#PF (Int 14)', category: 'Paging', module: 'Module III', definition: 'A CPU hardware exception raised when an instruction references a linear address whose Present bit in PDE or PTE is cleared (P=0).' },
    { term: 'Page Frame', abbr: 'Frame', category: 'Paging', module: 'Module III', definition: 'A contiguous, fixed-size 4096-byte (4 KiB) physical memory slot into which an arbitrary virtual memory page can be mapped.' },
    { term: 'Page Table', abbr: 'PT / PTE', category: 'Paging', module: 'Module III', definition: 'Second-level table in 80386DX paging; contains 1024 4-byte entries (PTEs) mapping 4 KiB virtual pages to physical page frames.' },
    { term: 'Parity Flag', abbr: 'PF', category: 'Flags', module: 'Module II', definition: 'Status flag set if the least significant byte of an arithmetic/logical result contains an even number of 1-bits.' },
    { term: 'Protected Mode', abbr: 'ProtMode', category: 'Architecture', module: 'Module II & III', definition: 'An 80386 operational state supporting 4 GB physical addressing, privilege rings, descriptor-based segmentation, and virtual memory paging.' },
    { term: 'Real Mode', abbr: 'RealMode', category: 'Architecture', module: 'Module II & III', definition: 'The 8086 backward-compatible operating mode with 1 MB physical address limit, no memory protection, and direct segment calculation (Seg × 16).' },
    { term: 'Segment Descriptor', abbr: 'Descriptor', category: 'Segmentation', module: 'Module III', definition: 'An 8-byte record in GDT or LDT that specifies the 32-bit physical base address, 20-bit limit, privilege level (DPL), and type of a protected segment.' },
    { term: 'Segment Selector', abbr: 'Selector', category: 'Segmentation', module: 'Module III', definition: 'A 16-bit value loaded into a segment register in protected mode, consisting of a 13-bit index, 1-bit Table Indicator (TI), and 2-bit RPL.' },
    { term: 'Set-Associative Cache', abbr: 'K-Way', category: 'Cache', module: 'Module III', definition: 'Cache organization dividing cache lines into sets of K ways; a block maps to one set but can occupy any way inside that set.' },
    { term: 'Sign Flag', abbr: 'SF', category: 'Flags', module: 'Module II', definition: 'Status flag that mirrors the most significant bit (MSB) of an arithmetic/logical result; 1 indicates negative, 0 indicates positive.' },
    { term: 'Spatial Locality', abbr: 'Locality', category: 'Cache', module: 'Module III', definition: 'The property where accessing a memory location makes it highly probable that contiguous adjacent addresses will be accessed in the near future.' },
    { term: 'Temporal Locality', abbr: 'Locality', category: 'Cache', module: 'Module III', definition: 'The property where a memory location referenced recently is likely to be referenced repeatedly in the near future (e.g. loop variables).' },
    { term: 'Translation Lookaside Buffer', abbr: 'TLB', category: 'Paging', module: 'Module III', definition: 'A small, ultra-fast fully-associative hardware cache inside the CPU that caches recent virtual-to-physical page translation entries.' },
    { term: 'Write-Back', abbr: 'Copy-Back', category: 'Cache', module: 'Module III', definition: 'A cache write policy where modifications update only the cache line and mark a Dirty bit; main memory is written only when the line is evicted.' },
    { term: 'Write-Through', abbr: 'Write-Thru', category: 'Cache', module: 'Module III', definition: 'A cache write policy where every memory write operation updates both the cache and underlying main memory simultaneously.' },
    { term: 'XLAT (Translate)', abbr: 'XLAT', category: 'Instructions', module: 'Module II', definition: 'An 8086 string instruction that replaces AL with a byte looked up from an array: AL ← DS:[BX + AL].' },
    { term: 'Zero Flag', abbr: 'ZF', category: 'Flags', module: 'Module II', definition: 'Status flag set to 1 if the arithmetic or logical result of an operation is exactly zero; cleared to 0 otherwise.' }
  ];

  // ==========================================================================
  // 2. DATA: CHEATSHEETS
  // ==========================================================================
  const CHEATSHEETS = {
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
    memoryFormulas: [
      { name: '8086 Real Mode Physical Address', formula: 'Physical Address = (Segment × 16) + Offset = (Segment × 10H) + Offset' },
      { name: '80386DX Linear Address', formula: 'Linear Address = Segment Base Address (from GDT/LDT descriptor) + Offset' },
      { name: '80386DX 2-Level Paging Split', formula: '32-Bit Linear = [Page Dir Index: 10 bits | Page Table Index: 10 bits | Offset: 12 bits]' },
      { name: 'Page Offset to Page Size', formula: 'Page Size = 2^12 = 4096 bytes = 4 KiB' },
      { name: 'Combined Address Flow', formula: 'Logical Address [Selector:Offset] → Segmentation → Linear Address → Paging → Physical Address' }
    ],
    cacheFormulas: [
      { name: 'Direct Mapped Cache Line', formula: 'Line Index = (Memory Block Number) mod (Total Cache Lines)' },
      { name: 'Block Offset Bits', formula: 'Offset Bits = log2(Block Size in bytes)' },
      { name: 'Line / Set Index Bits', formula: 'Index Bits = log2(Number of Sets or Lines)' },
      { name: 'Tag Bits', formula: 'Tag Bits = Total Address Bits - Index Bits - Offset Bits' },
      { name: 'AMAT (Average Memory Access Time)', formula: 'AMAT = Hit Time + (Miss Rate × Miss Penalty)' },
      { name: 'Miss Rate', formula: 'Miss Rate = 1 - Hit Rate = Misses / Total Accesses' }
    ]
  };

  // ==========================================================================
  // 3. DATA: QUIZ BANK
  // ==========================================================================
  const QUIZ_BANK = [
    {
      id: 'q-m2-01', module: 'module2', topic: 'm2-intro', difficulty: 'beginner',
      question: 'In the 8086 microprocessor, which architectural unit calculates the physical address and fetches instruction bytes into the prefetch queue?',
      options: ['Execution Unit (EU)', 'Bus Interface Unit (BIU)', 'Arithmetic Logic Unit (ALU)', 'Instruction Decoder'],
      correctIndex: 1,
      explanation: 'The Bus Interface Unit (BIU) handles all memory and I/O bus transactions, calculates 20-bit physical addresses using the formula CS × 16 + IP, and keeps the 6-byte instruction prefetch queue full.'
    },
    {
      id: 'q-m2-02', module: 'module2', topic: 'm2-datamov', difficulty: 'beginner',
      question: 'Which of the following 8086 operations is strictly illegal in a single machine instruction?',
      options: ['MOV AX, [BX + SI]', 'MOV [1000H], [2000H]', 'XCHG AX, BX', 'PUSH DX'],
      correctIndex: 1,
      explanation: 'x86 architecture does not support direct memory-to-memory data transfers with MOV. One operand must be loaded into a register first (e.g. MOV AX, [2000H] then MOV [1000H], AX).'
    },
    {
      id: 'q-m2-03', module: 'module2', topic: 'm2-datamov', difficulty: 'intermediate',
      question: 'How do the Stack Pointer (SP) and stack memory behave when executing a "PUSH AX" instruction on an 8086?',
      options: [
        'Data is written to SS:SP first, then SP is incremented by 2.',
        'SP is decremented by 2 first, then AX is written to SS:SP.',
        'Data is written to SS:SP first, then SP is decremented by 2.',
        'SP is incremented by 2 first, then AX is written to SS:SP.'
      ],
      correctIndex: 1,
      explanation: 'In x86, the stack grows downwards toward lower memory addresses. PUSH decrements SP by 2 first, then deposits the 16-bit word into memory at SS:SP.'
    },
    {
      id: 'q-m2-04', module: 'module2', topic: 'm2-arith', difficulty: 'beginner',
      question: 'Which status flag is NOT affected by the INC (increment) or DEC (decrement) instructions in the 8086 CPU?',
      options: ['Zero Flag (ZF)', 'Overflow Flag (OF)', 'Carry Flag (CF)', 'Sign Flag (SF)'],
      correctIndex: 2,
      explanation: 'INC and DEC modify ZF, SF, OF, AF, and PF, but deliberately preserve the Carry Flag (CF) unchanged so they can be safely used as loop counters without destroying the carry of multi-precision ADC/SBB additions.'
    },
    {
      id: 'q-m2-05', module: 'module2', topic: 'm2-arith', difficulty: 'intermediate',
      question: 'If register AL contains 7FH (+127 decimal) and BL contains 01H (+1 decimal), what will be the state of the Carry Flag (CF) and Overflow Flag (OF) after executing "ADD AL, BL"?',
      options: ['CF = 1, OF = 0', 'CF = 0, OF = 1', 'CF = 1, OF = 1', 'CF = 0, OF = 0'],
      correctIndex: 1,
      explanation: '7FH (0111 1111B) + 01H (0000 0001B) = 80H (1000 0000B). There is no carry out of bit 7, so CF = 0. However, adding two positive two\'s complement numbers produced a negative number (MSB=1), which is a signed overflow. Therefore, OF = 1.'
    },
    {
      id: 'q-m2-06', module: 'module2', topic: 'm2-logic', difficulty: 'intermediate',
      question: 'What is the principal difference between the SHR (Shift Right) and SAR (Shift Arithmetic Right) instructions?',
      options: [
        'SHR shifts left, whereas SAR shifts right.',
        'SHR inserts 0 into the MSB, while SAR replicates the original sign bit (MSB).',
        'SAR updates the Zero Flag, while SHR never modifies flags.',
        'SHR can only shift by 1 bit, whereas SAR can shift by arbitrary counts.'
      ],
      correctIndex: 1,
      explanation: 'SHR is a logical shift that fills the leftmost bit (MSB) with 0. SAR is an arithmetic shift designed for signed numbers that preserves the sign by copying the existing MSB into vacated positions, performing true signed division by 2.'
    },
    {
      id: 'q-m2-07', module: 'module2', topic: 'm2-control', difficulty: 'intermediate',
      question: 'Which conditional jump instruction should be used after a CMP instruction when comparing unsigned numbers to branch if operand 1 is greater than operand 2?',
      options: ['JG (Jump if Greater)', 'JA (Jump if Above)', 'JGE (Jump if Greater or Equal)', 'JS (Jump if Sign)'],
      correctIndex: 1,
      explanation: 'In x86 assembly, "Above" and "Below" (JA, JB, JAE, JBE) are strictly for unsigned comparisons (evaluating CF and ZF). "Greater" and "Less" (JG, JL, JGE, JLE) are for signed two\'s complement comparisons (evaluating SF, OF, and ZF).'
    },
    {
      id: 'q-m2-08', module: 'module2', topic: 'm2-string', difficulty: 'advanced',
      question: 'In string instructions like MOVSB, which register is implicitly paired with the Extra Segment (ES) register to address the destination, and can this segment assignment be overridden?',
      options: [
        'SI is used, and it can be overridden using a segment prefix.',
        'DI is used, and it CANNOT be overridden by any segment prefix.',
        'BX is used, and it can be overridden to DS.',
        'BP is used, and it can be overridden to SS.'
      ],
      correctIndex: 1,
      explanation: 'In all x86 string operations, the destination pointer is hardwired to ES:DI. Unlike the source pointer (which defaults to DS:SI but can be prefixed with ES, CS, or SS), the destination must always reside in ES; segment override prefixes are hardware-ignored or disallowed on destination strings.'
    },
    {
      id: 'q-m2-09', module: 'module2', topic: 'm2-flags', difficulty: 'beginner',
      question: 'Which instruction clears the Direction Flag (DF = 0), causing string instructions to auto-increment pointers?',
      options: ['STD', 'CLD', 'CLC', 'CMC'],
      correctIndex: 1,
      explanation: 'CLD (Clear Direction Flag) sets DF = 0, causing SI and DI to auto-increment during string operations. STD (Set Direction Flag) sets DF = 1 (auto-decrement).'
    },
    {
      id: 'q-m2-10', module: 'module2', topic: 'm2-arch-compare', difficulty: 'intermediate',
      question: 'How large is the physical address space accessible by an Intel 80386DX microprocessor, compared to the Intel 8086?',
      options: [
        '80386DX: 16 MB; 8086: 1 MB',
        '80386DX: 4 GB; 8086: 1 MB',
        '80386DX: 64 MB; 8086: 640 KB',
        '80386DX: 1 GB; 8086: 1 MB'
      ],
      correctIndex: 1,
      explanation: 'The 8086 has a 20-bit address bus yielding 2^20 bytes = 1 MB. The 80386DX has a 32-bit address bus yielding 2^32 bytes = 4 GB.'
    },
    {
      id: 'q-m3-01', module: 'module3', topic: 'm3-seg', difficulty: 'beginner',
      question: 'In an 8086 microprocessor, what is the 20-bit physical address if the Code Segment register CS = 3000H and Instruction Pointer IP = 0450H?',
      options: ['30450H', '34500H', '03450H', '300450H'],
      correctIndex: 0,
      explanation: 'Physical Address = Segment × 10H + Offset = 30000H + 0450H = 30450H.'
    },
    {
      id: 'q-m3-02', module: 'module3', topic: 'm3-seg', difficulty: 'intermediate',
      question: 'In 80386DX protected mode, what information does a 16-bit Segment Selector contain?',
      options: [
        'The upper 16 bits of the 32-bit physical base address.',
        'A 13-bit Descriptor Table Index, a 1-bit Table Indicator (TI), and a 2-bit Requested Privilege Level (RPL).',
        'A 10-bit Page Directory index and 6-bit limit.',
        'The linear address base shifted right by 16 bits.'
      ],
      correctIndex: 1,
      explanation: 'In protected mode, segment registers hold Selectors: Bits 15–3 hold the 13-bit Index into GDT or LDT (up to 8192 descriptors), Bit 2 is TI (0=GDT, 1=LDT), and Bits 1–0 hold RPL (0 to 3).'
    },
    {
      id: 'q-m3-03', module: 'module3', topic: 'm3-paging', difficulty: 'intermediate',
      question: 'In the classic 80386DX two-level paging architecture with 4 KiB pages, how is a 32-bit linear address decomposed for translation?',
      options: [
        'Bits 31–20 (12-bit Dir), Bits 19–8 (12-bit Page Table), Bits 7–0 (8-bit Offset)',
        'Bits 31–22 (10-bit Dir), Bits 21–12 (10-bit Page Table), Bits 11–0 (12-bit Offset)',
        'Bits 31–16 (16-bit Dir), Bits 15–12 (4-bit Page Table), Bits 11–0 (12-bit Offset)',
        'Bits 31–24 (8-bit Dir), Bits 23–16 (8-bit Page Table), Bits 15–0 (16-bit Offset)'
      ],
      correctIndex: 1,
      explanation: 'The 80386DX uses a 10-10-12 decomposition: 10 bits for Page Directory Index (1024 PDEs), 10 bits for Page Table Index (1024 PTEs), and 12 bits for Page Offset (2^12 = 4096 bytes = 4 KiB).'
    },
    {
      id: 'q-m3-04', module: 'module3', topic: 'm3-combined', difficulty: 'advanced',
      question: 'During combined address translation on an 80386DX (Segmentation + Paging), what happens if the offset of a memory reference exceeds the Segment Limit in its GDT descriptor?',
      options: [
        'A Page Fault (Interrupt 14) is immediately generated by the Paging Unit.',
        'A General Protection Fault (#GP, Interrupt 13) is raised, and the Paging Unit is never invoked.',
        'The address wraps around within the segment without error.',
        'The CPU switches automatically back to Real Mode.'
      ],
      correctIndex: 1,
      explanation: 'Segmentation precedes Paging. If the offset violates the segment limit, the Segmentation Unit generates a General Protection Fault (#GP, Interrupt 13) before linear address formation, terminating translation prior to the Paging Unit.'
    },
    {
      id: 'q-m3-05', module: 'module3', topic: 'm3-seg-vs-paging', difficulty: 'intermediate',
      question: 'Which of the following statements accurately contrasts memory fragmentation in segmentation versus paging?',
      options: [
        'Paging suffers from external fragmentation, while segmentation suffers from internal fragmentation.',
        'Segmentation suffers from external fragmentation, while paging suffers from internal fragmentation.',
        'Both segmentation and paging completely eliminate all forms of fragmentation.',
        'Segmentation causes internal fragmentation only when pages are 4 KiB.'
      ],
      correctIndex: 1,
      explanation: 'Because segments are variable in size, allocating and freeing them leaves variable gaps between segments (external fragmentation). Paging allocates fixed 4 KiB frames (eliminating external fragmentation), but if a process needs 5 KB, two 4 KB pages are allocated, wasting 3 KB internally in the second page (internal fragmentation).'
    },
    {
      id: 'q-m3-06', module: 'module3', topic: 'm3-direct-mapping', difficulty: 'intermediate',
      question: 'A direct-mapped cache has 128 cache lines, and each block is 32 bytes. In a 32-bit physical address, how many bits are used for the Index and Offset fields?',
      options: ['Offset = 5 bits, Index = 7 bits', 'Offset = 6 bits, Index = 8 bits', 'Offset = 32 bits, Index = 128 bits', 'Offset = 4 bits, Index = 7 bits'],
      correctIndex: 0,
      explanation: 'Offset bits = log2(Block size in bytes) = log2(32) = 5 bits. Index bits = log2(Number of cache lines) = log2(128) = 7 bits. (Tag bits = 32 - 7 - 5 = 20 bits).'
    },
    {
      id: 'q-m3-07', module: 'module3', topic: 'm3-set-associative', difficulty: 'advanced',
      question: 'A 4-way set-associative cache has a total of 256 cache lines. How many sets does this cache contain, and how many bits are required for the Set Index?',
      options: ['256 sets (8 bits)', '128 sets (7 bits)', '64 sets (6 bits)', '32 sets (5 bits)'],
      correctIndex: 2,
      explanation: 'Number of sets = Total Lines / Associativity = 256 / 4 = 64 sets. Index bits = log2(64) = 6 bits.'
    },
    {
      id: 'q-m3-08', module: 'module3', topic: 'm3-replacement-algos', difficulty: 'intermediate',
      question: 'Which cache replacement policy selects for eviction the block that was referenced the furthest in the past?',
      options: ['FIFO (First-In, First-Out)', 'LRU (Least Recently Used)', 'LFU (Least Frequently Used)', 'Random Replacement'],
      correctIndex: 1,
      explanation: 'LRU (Least Recently Used) tracks the recency of accesses and evicts the block that has gone unreferenced for the longest time, exploiting temporal locality.'
    },
    {
      id: 'q-m3-09', module: 'module3', topic: 'm3-cache-perf', difficulty: 'intermediate',
      question: 'A computer system has a cache Hit Time of 2 ns, a Miss Rate of 5% (0.05), and a Miss Penalty to main memory of 80 ns. What is the Average Memory Access Time (AMAT)?',
      options: ['4.0 ns', '6.0 ns', '8.2 ns', '4.2 ns'],
      correctIndex: 1,
      explanation: 'AMAT = Hit Time + (Miss Rate × Miss Penalty) = 2 ns + (0.05 × 80 ns) = 2 ns + 4 ns = 6.0 ns.'
    },
    {
      id: 'q-m3-10', module: 'module3', topic: 'm3-memory-hierarchy', difficulty: 'advanced',
      question: 'In a Write-Back cache policy, what is the role of the "Dirty bit" associated with each cache line?',
      options: [
        'It indicates that the line has invalid data and must be cleared.',
        'It indicates that the cache line has been modified by a CPU write and must be copied back to main memory upon eviction.',
        'It tracks whether parity errors occurred on the address bus.',
        'It enables the LRU replacement algorithm for that specific block.'
      ],
      correctIndex: 1,
      explanation: 'In Write-Back caches, writes modify only the cache line and set its Dirty bit. The line is written to main memory only when it is evicted to make room for a new block.'
    }
  ];

  // Expose global modules object so app can reference
  window.APP_DATA = {
    GLOSSARY,
    CHEATSHEETS,
    QUIZ_BANK
  };

  console.log('Pentium Lab: Unified data module initialized successfully.');
})();
