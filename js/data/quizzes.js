/* ==========================================================================
   QUIZ & PRACTICE ZONE QUESTION BANK
   Syllabus-aligned questions for university exam readiness
   ========================================================================== */

export const QUIZ_BANK = [
  // ========================================================================
  // MODULE II — INSTRUCTION SET
  // ========================================================================
  {
    id: 'q-m2-01',
    module: 'module2',
    topic: 'm2-intro',
    difficulty: 'beginner',
    question: 'In the 8086 microprocessor, which architectural unit calculates the physical address and fetches instruction bytes into the prefetch queue?',
    options: [
      'Execution Unit (EU)',
      'Bus Interface Unit (BIU)',
      'Arithmetic Logic Unit (ALU)',
      'Instruction Decoder'
    ],
    correctIndex: 1,
    explanation: 'The Bus Interface Unit (BIU) handles all memory and I/O bus transactions, calculates 20-bit physical addresses using the formula CS × 16 + IP, and keeps the 6-byte instruction prefetch queue full.'
  },
  {
    id: 'q-m2-02',
    module: 'module2',
    topic: 'm2-datamov',
    difficulty: 'beginner',
    question: 'Which of the following 8086 operations is strictly illegal in a single machine instruction?',
    options: [
      'MOV AX, [BX + SI]',
      'MOV [1000H], [2000H]',
      'XCHG AX, BX',
      'PUSH DX'
    ],
    correctIndex: 1,
    explanation: 'x86 architecture does not support direct memory-to-memory data transfers with MOV. One operand must be loaded into a register first (e.g. MOV AX, [2000H] then MOV [1000H], AX).'
  },
  {
    id: 'q-m2-03',
    module: 'module2',
    topic: 'm2-datamov',
    difficulty: 'intermediate',
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
    id: 'q-m2-04',
    module: 'module2',
    topic: 'm2-arith',
    difficulty: 'beginner',
    question: 'Which status flag is NOT affected by the INC (increment) or DEC (decrement) instructions in the 8086 CPU?',
    options: [
      'Zero Flag (ZF)',
      'Overflow Flag (OF)',
      'Carry Flag (CF)',
      'Sign Flag (SF)'
    ],
    correctIndex: 2,
    explanation: 'INC and DEC modify ZF, SF, OF, AF, and PF, but deliberately preserve the Carry Flag (CF) unchanged so they can be safely used as loop counters without destroying the carry of multi-precision ADC/SBB additions.'
  },
  {
    id: 'q-m2-05',
    module: 'module2',
    topic: 'm2-arith',
    difficulty: 'intermediate',
    question: 'If register AL contains 7FH (+127 decimal) and BL contains 01H (+1 decimal), what will be the state of the Carry Flag (CF) and Overflow Flag (OF) after executing "ADD AL, BL"?',
    options: [
      'CF = 1, OF = 0',
      'CF = 0, OF = 1',
      'CF = 1, OF = 1',
      'CF = 0, OF = 0'
    ],
    correctIndex: 1,
    explanation: '7FH (0111 1111B) + 01H (0000 0001B) = 80H (1000 0000B). There is no carry out of bit 7, so CF = 0. However, adding two positive two\'s complement numbers produced a negative number (MSB=1), which is a signed overflow. Therefore, OF = 1.'
  },
  {
    id: 'q-m2-06',
    module: 'module2',
    topic: 'm2-logic',
    difficulty: 'intermediate',
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
    id: 'q-m2-07',
    module: 'module2',
    topic: 'm2-control',
    difficulty: 'intermediate',
    question: 'Which conditional jump instruction should be used after a CMP instruction when comparing unsigned numbers to branch if operand 1 is greater than operand 2?',
    options: [
      'JG (Jump if Greater)',
      'JA (Jump if Above)',
      'JGE (Jump if Greater or Equal)',
      'JS (Jump if Sign)'
    ],
    correctIndex: 1,
    explanation: 'In x86 assembly, "Above" and "Below" (JA, JB, JAE, JBE) are strictly for unsigned comparisons (evaluating CF and ZF). "Greater" and "Less" (JG, JL, JGE, JLE) are for signed two\'s complement comparisons (evaluating SF, OF, and ZF).'
  },
  {
    id: 'q-m2-08',
    module: 'module2',
    topic: 'm2-string',
    difficulty: 'advanced',
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
    id: 'q-m2-09',
    module: 'module2',
    topic: 'm2-flags',
    difficulty: 'beginner',
    question: 'Which instruction clears the Direction Flag (DF = 0), causing string instructions to auto-increment pointers?',
    options: [
      'STD',
      'CLD',
      'CLC',
      'CMC'
    ],
    correctIndex: 1,
    explanation: 'CLD (Clear Direction Flag) sets DF = 0, causing SI and DI to auto-increment during string operations. STD (Set Direction Flag) sets DF = 1 (auto-decrement).'
  },
  {
    id: 'q-m2-10',
    module: 'module2',
    topic: 'm2-arch-compare',
    difficulty: 'intermediate',
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

  // ========================================================================
  // MODULE III — MEMORY MANAGEMENT & CACHE
  // ========================================================================
  {
    id: 'q-m3-01',
    module: 'module3',
    topic: 'm3-seg',
    difficulty: 'beginner',
    question: 'In an 8086 microprocessor, what is the 20-bit physical address if the Code Segment register CS = 3000H and Instruction Pointer IP = 0450H?',
    options: [
      '30450H',
      '34500H',
      '03450H',
      '300450H'
    ],
    correctIndex: 0,
    explanation: 'Physical Address = Segment × 10H + Offset = 30000H + 0450H = 30450H.'
  },
  {
    id: 'q-m3-02',
    module: 'module3',
    topic: 'm3-seg',
    difficulty: 'intermediate',
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
    id: 'q-m3-03',
    module: 'module3',
    topic: 'm3-paging',
    difficulty: 'intermediate',
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
    id: 'q-m3-04',
    module: 'module3',
    topic: 'm3-combined',
    difficulty: 'advanced',
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
    id: 'q-m3-05',
    module: 'module3',
    topic: 'm3-seg-vs-paging',
    difficulty: 'intermediate',
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
    id: 'q-m3-06',
    module: 'module3',
    topic: 'm3-direct-mapping',
    difficulty: 'intermediate',
    question: 'A direct-mapped cache has 128 cache lines, and each block is 32 bytes. In a 32-bit physical address, how many bits are used for the Index and Offset fields?',
    options: [
      'Offset = 5 bits, Index = 7 bits',
      'Offset = 6 bits, Index = 8 bits',
      'Offset = 32 bits, Index = 128 bits',
      'Offset = 4 bits, Index = 7 bits'
    ],
    correctIndex: 0,
    explanation: 'Offset bits = log2(Block size in bytes) = log2(32) = 5 bits. Index bits = log2(Number of cache lines) = log2(128) = 7 bits. (Tag bits = 32 - 7 - 5 = 20 bits).'
  },
  {
    id: 'q-m3-07',
    module: 'module3',
    topic: 'm3-set-associative',
    difficulty: 'advanced',
    question: 'A 4-way set-associative cache has a total of 256 cache lines. How many sets does this cache contain, and how many bits are required for the Set Index?',
    options: [
      '256 sets (8 bits)',
      '128 sets (7 bits)',
      '64 sets (6 bits)',
      '32 sets (5 bits)'
    ],
    correctIndex: 2,
    explanation: 'Number of sets = Total Lines / Associativity = 256 / 4 = 64 sets. Index bits = log2(64) = 6 bits.'
  },
  {
    id: 'q-m3-08',
    module: 'module3',
    topic: 'm3-replacement-algos',
    difficulty: 'intermediate',
    question: 'Which cache replacement policy selects for eviction the block that was referenced the furthest in the past?',
    options: [
      'FIFO (First-In, First-Out)',
      'LRU (Least Recently Used)',
      'LFU (Least Frequently Used)',
      'Random Replacement'
    ],
    correctIndex: 1,
    explanation: 'LRU (Least Recently Used) tracks the recency of accesses and evicts the block that has gone unreferenced for the longest time, exploiting temporal locality.'
  },
  {
    id: 'q-m3-09',
    module: 'module3',
    topic: 'm3-cache-perf',
    difficulty: 'intermediate',
    question: 'A computer system has a cache Hit Time of 2 ns, a Miss Rate of 5% (0.05), and a Miss Penalty to main memory of 80 ns. What is the Average Memory Access Time (AMAT)?',
    options: [
      '4.0 ns',
      '6.0 ns',
      '8.2 ns',
      '4.2 ns'
    ],
    correctIndex: 1,
    explanation: 'AMAT = Hit Time + (Miss Rate × Miss Penalty) = 2 ns + (0.05 × 80 ns) = 2 ns + 4 ns = 6.0 ns.'
  },
  {
    id: 'q-m3-10',
    module: 'module3',
    topic: 'm3-memory-hierarchy',
    difficulty: 'advanced',
    question: 'In a Write-Back cache policy, what is the role of the "Dirty bit" associated with each cache line?',
    options: [
      'It indicates that the line has invalid data and must be cleared.',
      'It indicates that the cache line has been modified by a CPU write and must be copied back to main memory upon eviction.',
      'It tracks whether parity errors occurred on the address bus.',
      'It enables the LRU replacement algorithm for that specific block.'
    ],
    correctIndex: 1,
    explanation: 'In Write-Back caches, writes modify only the cache line and mark Dirty = 1. When that block is eventually evicted, the controller inspects the Dirty bit; if Dirty = 1, it writes the modified line to main memory; if Dirty = 0, no memory write is needed.'
  }
];
