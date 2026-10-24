/* ==========================================================================
   MICROPROCESSOR ENGINEERING CURRICULUM: MODULE II & MODULE III
   Comprehensive, syllabus-aligned educational content for University exams
   ========================================================================== */

export const CURRICULUM = {
  // ========================================================================
  // MODULE II — INSTRUCTION SET
  // ========================================================================
  'm2-intro': {
    id: 'm2-intro',
    module: 'module2',
    number: '4.1',
    title: 'Introduction to Instruction Sets',
    subtitle: 'Machine instructions, execution cycle, opcodes, operands, and addressing modes',
    badge: 'Core Concept',
    badgeColor: 'cyan',

    understand: {
      headline: 'What is a Microprocessor Instruction?',
      body: `A **machine instruction** is an elementary command given to the microprocessor CPU that commands it to perform a specific binary operation on data stored in internal registers, system memory, or external I/O ports.

The **instruction set** of a microprocessor represents its total vocabulary—the complete collection of all machine language instructions that the CPU's internal microcode or hardwired decoding logic can understand and execute.

### The Anatomy of an Instruction
Every machine instruction is comprised of two foundational components:
1. **Opcode (Operation Code)**: Tells the processor *WHAT* operation to execute (e.g., \`ADD\`, \`MOV\`, \`SUB\`, \`CMP\`).
2. **Operands**: Tell the processor *WHERE* the data is located or *WHICH* data to manipulate (registers, immediate constants, or memory locations).

### The Instruction Execution Cycle
Every instruction passes through a continuous hardware pipeline loop:
1. **Fetch**: The Bus Interface Unit (BIU) fetches the instruction bytes from memory addressed by Code Segment (\`CS\`) and Instruction Pointer (\`IP\`), loading them into the prefetch queue.
2. **Decode**: The Execution Unit (EU) decodes the opcode, identifying required ALU circuits, register operands, and addressing modes.
3. **Execute**: The ALU executes the operation (addition, logical AND, pointer modification).
4. **Store / Write-Back**: Results are written back to destination registers or memory, and status flags in the \`FLAGS\` register are updated.`,
      keyTakeaways: [
        'An opcode determines the operation; operands supply or receive data.',
        '8086 uses 16-bit registers with a 1 MB real-mode memory space.',
        '80386DX expanded registers to 32-bit (EAX, EBX, etc.) with a 4 GB address space.'
      ]
    },

    visualize: {
      diagramType: 'instruction-anatomy',
      title: 'Interactive Instruction Anatomy Explorer',
      description: 'Click different parts of the instruction below to inspect how the CPU decodes opcodes, destination operands, and source operands.',
      sampleInstruction: {
        mnemonic: 'MOV',
        destination: 'AX',
        source: '[BX + SI + 04H]',
        bytes: '8B 40 04',
        mode: 'Based Indexed Relative Addressing'
      }
    },

    stepByStep: [
      {
        step: 1,
        title: 'Fetch via CS:IP',
        desc: 'Bus Interface Unit calculates physical address = CS × 16 + IP, fetches opcode bytes 8B 40 04H, and advances IP by 3 bytes.'
      },
      {
        step: 2,
        title: 'Opcode Decoding',
        desc: 'The decoder recognizes 8BH as a 16-bit register-memory MOV, with destination AX (register field 000B).'
      },
      {
        step: 3,
        title: 'Effective Address (EA) Calculation',
        desc: 'The ALU adds Base Register (BX) + Source Index (SI) + 8-bit Displacement (04H) to find memory offset.'
      },
      {
        step: 4,
        title: 'Memory Read & Write-Back to AX',
        desc: 'BIU reads 16-bit word from DS:EA and deposits the value into accumulator register AX. Flags remain unchanged.'
      }
    ],

    workedExample: {
      problem: 'Deconstruct the instruction "ADD ECX, [EDX + 10H]" in 80386DX architecture. Identify mnemonic, destination, source, addressing mode, and execution effect.',
      solution: [
        'Mnemonic / Opcode: ADD (Binary addition with flag updates).',
        'Destination Operand: ECX (32-bit general-purpose accumulator/counter register).',
        'Source Operand: [EDX + 10H] (32-bit dword located in memory).',
        'Addressing Mode: Register Relative (Based) Addressing with 32-bit displacement 10H.',
        'Execution Effect: Memory dword at DS:[EDX + 10H] is fetched, added to ECX, and the 32-bit sum replaces ECX. Flags CF, OF, ZF, SF, PF, and AF are updated.'
      ],
      verifiedStamp: '80386DX VALID'
    },

    quiz: {
      question: 'Which of the following statements correctly distinguishes an opcode from an operand in microprocessor architecture?',
      options: [
        'An opcode holds the memory address, while operands specify the ALU logic function.',
        'An opcode specifies the machine operation to perform, while operands specify the target data or locations.',
        'Opcode size varies between 16 and 64 bits, while operands are always fixed at 8 bits.',
        'The opcode is only decoded during the write-back phase of the instruction cycle.'
      ],
      correctIndex: 1,
      explanation: 'The opcode (operation code) instructs the CPU execution unit which operation to execute (such as MOV, ADD, JMP). Operands provide the source values, registers, or memory addresses acted upon.'
    },

    revise: {
      examTips: [
        'In university exams, always define instruction execution as a 4-phase cycle: Fetch, Decode, Execute, and Store/Write-back.',
        'Always specify whether an instruction belongs to 16-bit 8086 or 32-bit 80386DX when writing register sizes.',
        'Remember that MOV instructions in x86 never allow memory-to-memory direct transfers in a single instruction!'
      ],
      traps: 'Trap: Writing "MOV [1000H], [2000H]". This is ILLEGAL on x86 architecture. One operand MUST be a register or immediate constant.'
    }
  },

  // ========================================================================
  // 4.2 DATA MOVEMENT INSTRUCTIONS
  // ========================================================================
  'm2-datamov': {
    id: 'm2-datamov',
    module: 'module2',
    number: '4.2',
    title: 'Data Movement Instructions',
    subtitle: 'MOV, PUSH, POP, XCHG, IN, OUT, LEA, LDS, LES, LAHF, and SAHF',
    badge: 'Essential',
    badgeColor: 'yellow',

    understand: {
      headline: 'Transferring Bytes, Words, and Doublewords Across Subsystems',
      body: `Data movement instructions transfer data between registers, memory, stack, and I/O ports without altering arithmetic status flags.

### Core Instructions
1. **\`MOV dest, src\`**: Copies data from source to destination (\`dest ← src\`).
   - *Restrictions*: No memory-to-memory moves; no immediate value into segment registers (\`MOV DS, 1000H\` is illegal; must load through \`AX\`); \`CS\` cannot be destination.
2. **\`PUSH src\` / \`POP dest\`**: Manipulates the LIFO stack. \`PUSH\` decrements Stack Pointer (\`SP\` by 2 in 8086, \`ESP\` by 4 in 386) then writes data. \`POP\` reads data then increments \`SP\`/\`ESP\`.
3. **\`XCHG op1, op2\`**: Exchanges contents of two registers or register and memory. Cannot exchange two memory locations.
4. **\`IN\` and \`OUT\`**: Reads/writes data to microprocessor I/O ports via the accumulator (\`AL\`/\`AX\`/\`EAX\`). Port address is either immediate 8-bit (\`00H–FFH\`) or held in 16-bit register \`DX\` (\`0000H–FFFFH\`).
5. **\`LEA reg, [mem]\`**: *Load Effective Address*. Computes the offset address of the memory operand and stores the pointer itself into the register (does NOT fetch the data!).
6. **\`LDS reg, [mem]\` & \`LES reg, [mem]\`**: Loads 32-bit far pointer: lower 16 bits into the general register, upper 16 bits into \`DS\` or \`ES\`.
7. **\`LAHF\` & \`SAHF\`**: Load/Store \`AH\` from/to lower 8 bits of the \`FLAGS\` register (SF, ZF, AF, PF, CF).`,
      keyTakeaways: [
        'MOV, PUSH, POP, LEA, and XCHG do NOT affect status flags (CF, ZF, SF, OF, etc.).',
        'Stack grows downwards in memory toward lower addresses.',
        'LEA calculates address arithmetic (e.g., LEA BX, [SI+20H]) without touching memory contents.'
      ]
    },

    visualize: {
      diagramType: 'register-memory-sim',
      title: 'Interactive Register & Stack Simulator',
      description: 'Execute MOV, PUSH, POP, and XCHG operations live. Observe stack pointer changes and memory stack frames.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Initial State',
        desc: 'AX = 1234H, BX = 5678H, SP = 0100H, SS = 2000H. Stack top is empty.'
      },
      {
        step: 2,
        title: 'Execute "PUSH AX"',
        desc: 'SP is decremented by 2 (SP = 00FEH). Word 1234H is written to physical address SS:SP (20000H + 00FEH = 200FEH).'
      },
      {
        step: 3,
        title: 'Execute "MOV AX, BX"',
        desc: 'Content of BX (5678H) is copied into AX. Now AX = 5678H, BX = 5678H. SP remains 00FEH. Flags unaffected.'
      },
      {
        step: 4,
        title: 'Execute "POP BX"',
        desc: 'Word at SS:00FEH (1234H) is loaded into BX. SP is incremented by 2 back to 0100H. Result: BX = 1234H, AX = 5678H (effectively exchanged!).'
      }
    ],

    workedExample: {
      problem: 'Analyze what happens during: (1) LEA BX, [SI + 0040H] vs (2) MOV BX, [SI + 0040H]. Given SI = 0200H, and memory at DS:0240H contains value 99AAH.',
      solution: [
        'Case 1: LEA BX, [SI + 0040H]',
        '  Calculates Effective Address: EA = SI + 0040H = 0200H + 0040H = 0240H.',
        '  Loads the calculated address into BX: BX = 0240H.',
        'Case 2: MOV BX, [SI + 0040H]',
        '  Calculates EA = 0240H, then reads memory word from DS:0240H.',
        '  Loads the data value into BX: BX = 99AAH.',
        'Conclusion: LEA loads the pointer offset itself; MOV loads the contents residing at that offset.'
      ],
      verifiedStamp: 'VERIFIED ✓'
    },

    quiz: {
      question: 'Which of the following 8086 instructions is INVALID and will cause an assembler error?',
      options: [
        'MOV AX, [BX + DI]',
        'PUSH CS',
        'MOV DS, 2000H',
        'XCHG AH, AL'
      ],
      correctIndex: 2,
      explanation: 'In 8086 architecture, an immediate value cannot be moved directly into any segment register (DS, ES, SS, CS). One must first load the constant into a general-purpose register (e.g. MOV AX, 2000H) and then MOV DS, AX.'
    },

    revise: {
      examTips: [
        'Remember that PUSH CS is valid, but POP CS is strictly ILLEGAL because changing CS arbitrarily would corrupt program flow without proper IP alignment.',
        'XCHG between two memory locations is NOT supported in a single instruction.',
        'IN and OUT must use AL for 8-bit port transfers and AX for 16-bit transfers.'
      ],
      traps: 'Trap: Forgetting that PUSH decrements SP BEFORE writing, whereas POP reads memory and increments SP AFTERWARDS.'
    }
  },

  // ========================================================================
  // 4.3 BINARY ARITHMETIC INSTRUCTIONS
  // ========================================================================
  'm2-arith': {
    id: 'm2-arith',
    module: 'module2',
    number: '4.3',
    title: 'Binary Arithmetic Instructions',
    subtitle: 'ADD, ADC, SUB, SBB, INC, DEC, MUL, IMUL, DIV, IDIV, NEG, CMP, CBW, and CWD',
    badge: 'Critical Math',
    badgeColor: 'coral',

    understand: {
      headline: 'Integer Operations, Carry vs Overflow, and Multi-Precision Math',
      body: `The 8086 and 80386DX arithmetic units perform signed (two's complement) and unsigned addition, subtraction, multiplication, and division.

### Addition and Subtraction
- **\`ADD dest, src\`**: \`dest ← dest + src\`. Updates CF, OF, ZF, SF, AF, PF.
- **\`ADC dest, src\`**: *Add with Carry*: \`dest ← dest + src + CF\`. Essential for chaining 32-bit or 64-bit multi-precision additions.
- **\`SUB dest, src\`**: \`dest ← dest - src\`. Sets CF if borrow occurs (\`src > dest\` unsigned).
- **\`SBB dest, src\`**: *Subtract with Borrow*: \`dest ← dest - src - CF\`.
- **\`INC op\` / \`DEC op\`**: Increments/decrements operand by 1. **CRITICAL EXAM POINT**: INC and DEC update OF, ZF, SF, AF, PF, but **DO NOT AFFECT CF (Carry Flag)**!
- **\`NEG op\`**: Two's complement negation (\`0 - op\`). Sets CF = 1 unless operand was 0.
- **\`CMP dest, src\`**: Performs \`dest - src\` internally, updates flags (CF, ZF, SF, OF), but **discards the numeric result**. Used before conditional jumps.

### Unsigned vs Signed Multiplication & Division
- **\`MUL src\`** (Unsigned) & **\`IMUL src\`** (Signed):
  - 8-bit operand: \`AX ← AL × src\`
  - 16-bit operand: \`DX:AX ← AX × src\` (DX holds high word, AX holds low word).
  - 32-bit operand (386): \`EDX:EAX ← EAX × src\`.
- **\`DIV src\`** (Unsigned) & **\`IDIV src\`** (Signed):
  - 16-bit dividend in \`AX\`: Quotient in \`AL\`, Remainder in \`AH\`.
  - 32-bit dividend in \`DX:AX\`: Quotient in \`AX\`, Remainder in \`DX\`.
  - If quotient exceeds destination register capacity, a **Divide Error (Interrupt 0)** is triggered!

### Carry Flag (CF) vs Overflow Flag (OF)
- **Carry Flag (CF)**: Set when there is a carry out of the Most Significant Bit (MSB) or borrow into MSB. Signifies unsigned arithmetic overflow.
- **Overflow Flag (OF)**: Set when the result exceeds positive or negative limit of signed two's complement numbers (e.g. adding two positive numbers yields a negative sign bit).`,
      keyTakeaways: [
        'CF is for unsigned overflow; OF is for signed two\'s complement overflow.',
        'INC and DEC never modify the Carry Flag (CF), making them safe inside loop counters that chain ADC/SBB.',
        'Multiplication doubles the bit width of operands (8-bit × 8-bit = 16-bit result in AX).'
      ]
    },

    visualize: {
      diagramType: 'alu-bitwise-sim',
      title: 'Interactive Binary Arithmetic & Flags Sandbox',
      description: 'Enter 8-bit or 16-bit hexadecimal or decimal numbers, select ADD, SUB, ADC, or SBB, and watch the binary carry chain and flag register updates.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Unsigned vs Signed Scenario',
        desc: 'Consider AL = 7FH (+127 decimal) and BL = 01H (+1 decimal).'
      },
      {
        step: 2,
        title: 'Execute "ADD AL, BL"',
        desc: 'Binary calculation: 0111 1111B + 0000 0001B = 1000 0000B (80H).'
      },
      {
        step: 3,
        title: 'Examine Unsigned Perspective (CF)',
        desc: 'There is NO carry out of bit 7. Therefore, Carry Flag CF = 0. The unsigned value 128 is valid.'
      },
      {
        step: 4,
        title: 'Examine Signed Perspective (OF)',
        desc: 'Adding two positive numbers (+127 and +1) produced a negative result (bit 7 = 1, which represents -128 in two\'s complement). Hence, Overflow Flag OF = 1!'
      }
    ],

    workedExample: {
      problem: 'Demonstrate a 32-bit addition of 0012FFFFH and 00050002H using only 16-bit 8086 registers (DX:AX and CX:BX).',
      solution: [
        'Initial Registers:',
        '  Operand 1: DX = 0012H, AX = FFFFH',
        '  Operand 2: CX = 0005H, BX = 0002H',
        'Step 1: Add low words without carry:',
        '  ADD AX, BX   ; FFFFH + 0002H = 10001H',
        '  AX receives 0001H; Carry Flag CF is set to 1.',
        'Step 2: Add high words with carry:',
        '  ADC DX, CX   ; DX = 0012H + 0005H + CF(1) = 0018H.',
        'Final 32-bit Sum: DX:AX = 00180001H. CF = 0, OF = 0.'
      ],
      verifiedStamp: 'EXACT RESULT'
    },

    quiz: {
      question: 'Why does the INC instruction not affect the Carry Flag (CF) in the 8086 microprocessor?',
      options: [
        'Because INC is purely a logical instruction, not an arithmetic one.',
        'To allow INC to be used as a loop index variable without corrupting the Carry Flag during multi-word ADC/SBB chains.',
        'Because the 8086 ALU hardware lacks a carry generation line for increments.',
        'INC only affects the Zero Flag and parity flag.'
      ],
      correctIndex: 1,
      explanation: 'Preserving the Carry Flag during INC/DEC allows programmers to write loops that perform multi-precision addition (ADC) where an index register like SI or BX is incremented without destroying the carry produced by previous additions.'
    },

    revise: {
      examTips: [
        'Always remember: CF = Carry out of MSB (Unsigned check). OF = (Carry into MSB) XOR (Carry out of MSB) (Signed check).',
        'CBW (Convert Byte to Word) sign-extends AL into AX. CWD (Convert Word to Doubleword) sign-extends AX into DX:AX.',
        'Division by zero or division result overflow immediately triggers hardware CPU Exception 0 (Divide Error).'
      ],
      traps: 'Trap: Assuming CMP changes the destination register. CMP only updates the FLAGS register; registers remain unchanged!'
    }
  },

  // ========================================================================
  // 4.4 LOGICAL INSTRUCTIONS
  // ========================================================================
  'm2-logic': {
    id: 'm2-logic',
    module: 'module2',
    number: '4.4',
    title: 'Logical Instructions & Bit Manipulation',
    subtitle: 'AND, OR, XOR, NOT, TEST, SHL/SAL, SHR, SAR, ROL, ROR, RCL, and RCR',
    badge: 'Bitwise Power',
    badgeColor: 'purple',

    understand: {
      headline: 'Bit-Level Logic, Masking, Shifts, and Rotates',
      body: `Logical instructions operate on individual bits in parallel, providing low-level bit masking, flag toggling, and high-speed binary scaling.

### Bitwise Boolean Operations
- **\`AND dest, src\`**: Clears bits (masking). Any bit AND 0 = 0; bit AND 1 = unchanged. Resets CF and OF to 0.
- **\`OR dest, src\`**: Sets specific bits to 1. Bit OR 1 = 1; bit OR 0 = unchanged. Resets CF and OF to 0.
- **\`XOR dest, src\`**: Inverts/toggles bits. \`XOR reg, reg\` is the fastest x86 idiom to clear a register to 0.
- **\`NOT op\`**: One's complement bit inversion. **Does NOT affect any flags!**
- **\`TEST dest, src\`**: Performs \`dest AND src\` internally and sets ZF, SF, PF without modifying \`dest\`. Used to test if a bit is 1.

### Shifts vs Rotates
- **Logical Shifts (\`SHL\` / \`SHR\`)**:
  - \`SHL dest, count\`: Shifts bits left, fills vacated right bits with 0. Outgoing MSB enters CF. (Multiplies unsigned by $2^n$).
  - \`SHR dest, count\`: Shifts bits right, fills vacated left bits with 0. Outgoing LSB enters CF. (Divides unsigned by $2^n$).
- **Arithmetic Shift Right (\`SAR\`)**:
  - Shifts bits right, but **replicates the original sign bit (MSB)**. Preserves the algebraic sign of signed integers during division by $2^n$.
- **Rotates (\`ROL\` / \`ROR\` / \`RCL\` / \`RCR\`)**:
  - \`ROL\` / \`ROR\`: Rotates bits circularly in a closed loop through the register; bit copied to CF.
  - \`RCL\` / \`RCR\`: Rotates bits through the 9-bit/17-bit loop that includes the **Carry Flag** as an active bit stage.`,
      keyTakeaways: [
        'XOR AX, AX clears AX to 0 and clears CF/OF in fewer bytes than MOV AX, 0.',
        'SAR preserves the sign bit (MSB), whereas SHR always injects 0 at MSB.',
        'TEST op, mask sets ZF = 1 if all tested bits are 0; ZF = 0 if any tested bit is 1.'
      ]
    },

    visualize: {
      diagramType: 'bit-shifter-sim',
      title: 'Interactive 8-Bit / 16-Bit Bitwise & Shift Lab',
      description: 'Toggle individual bits on and off. Watch in real time how SAR replicates sign bits, ROL wraps around, and RCL routes bits through the Carry Flag.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Inspect Value',
        desc: 'Assume AL = 1111 0000B (-16 signed decimal, F0H). Carry flag CF = 0.'
      },
      {
        step: 2,
        title: 'Logical Shift Right: SHR AL, 1',
        desc: 'Bits move right. MSB receives 0. Bit 0 (0) drops into CF. New AL = 0111 1000B (+120). The sign was destroyed!'
      },
      {
        step: 3,
        title: 'Contrast with SAR AL, 1',
        desc: 'Reset AL to 1111 0000B. SAR shifts right, but replicates the MSB (1). New AL = 1111 1000B (-8 decimal). Signed division by 2 is correct!'
      },
      {
        step: 4,
        title: 'Rotate Through Carry: RCL AL, 1',
        desc: 'Every bit moves left. Former CF (0) enters bit 0. Outgoing bit 7 (1) becomes the new Carry Flag. AL = 1111 0000B, CF = 1.'
      }
    ],

    workedExample: {
      problem: 'Write a short 8086 code sequence to test if bit 3 of register BL is 1, and clear bit 7 of BL while keeping all other bits intact.',
      solution: [
        '; 1. Test bit 3 of BL (mask = 00001000B = 08H)',
        'TEST BL, 08H      ; Performs BL AND 08H; sets ZF = 0 if bit 3 is 1',
        'JNZ  Bit3IsSet    ; Jump if bit 3 is active',
        '',
        '; 2. Clear bit 7 of BL (mask = 01111111B = 7FH)',
        'AND  BL, 7FH      ; Bit 7 AND 0 = 0; bits 0-6 remain unchanged'
      ],
      verifiedStamp: 'VERIFIED ✓'
    },

    quiz: {
      question: 'If register AL contains 1000 0000B (-128 decimal), what will AL contain after executing "SAR AL, 2"?',
      options: [
        '0010 0000B (+32 decimal)',
        '1110 0000B (-32 decimal)',
        '1100 0000B (-64 decimal)',
        '0100 0000B (+64 decimal)'
      ],
      correctIndex: 1,
      explanation: 'SAR (Shift Arithmetic Right) replicates the sign bit (1). After 1 shift right: 1100 0000B. After 2 shifts right: 1110 0000B (E0H), which equals -32 decimal (-128 / 4 = -32).'
    },

    revise: {
      examTips: [
        'Shift instructions with count > 1 on the 8086 must place the shift count into register CL (e.g. SHL AX, CL). 80386DX allowed immediate shift counts like SHL AX, 4.',
        'Remember that NOT does not modify any flags, but NEG modifies all status flags including CF.'
      ],
      traps: 'Trap: Confusing ROL with RCL. ROL rotates only within the register; RCL treats the Carry Flag as an extra bit in the loop.'
    }
  },

  // ========================================================================
  // 4.5 CONTROL TRANSFER INSTRUCTIONS
  // ========================================================================
  'm2-control': {
    id: 'm2-control',
    module: 'module2',
    number: '4.5',
    title: 'Control Transfer Instructions',
    subtitle: 'JMP, conditional jumps, CALL, RET, LOOP, INT, and IRET',
    badge: 'Program Flow',
    badgeColor: 'cyan',

    understand: {
      headline: 'Altering Sequential Program Execution in x86',
      body: `Normally, the CPU executes instructions sequentially by automatically incrementing the Instruction Pointer (\`IP\`/\`EIP\`). Control transfer instructions modify \`IP\` and optionally Code Segment (\`CS\`) to branch, loop, call subroutines, or handle interrupts.

### Classification of Transfers
1. **Unconditional Jump (\`JMP target\`)**:
   - **Near Jump (Intrasegment)**: Target resides in the same code segment. Only \`IP\` is updated.
     - *Short*: Relative displacement between -128 and +127 bytes.
     - *Near*: 16-bit displacement (-32768 to +32767 bytes).
   - **Far Jump (Intersegment)**: Target resides in a different code segment. Both \`CS\` and \`IP\` are reloaded from memory or immediate far address.
2. **Conditional Jumps (\`Jcc\`)**:
   - Evaluate status flags set by previous arithmetic or comparison instructions.
   - *Unsigned Jumps*: \`JA\` (Above, \`CF=0 & ZF=0\`), \`JB\` (Below, \`CF=1\`), \`JAE\` / \`JBE\`.
   - *Signed Jumps*: \`JG\` (Greater, \`ZF=0 & SF=OF\`), \`JL\` (Less, \`SF≠OF\`), \`JGE\` / \`JLE\`.
   - *Flag-specific*: \`JZ\` / \`JE\` (\`ZF=1\`), \`JNZ\` / \`JNE\` (\`ZF=0\`), \`JC\` (\`CF=1\`), \`JO\` (\`OF=1\`), \`JS\` (\`SF=1\`).
3. **Subroutines (\`CALL\` and \`RET\`)**:
   - \`CALL\`: Pushes the return address (\`IP\` for near CALL, \`CS\` and \`IP\` for far CALL) onto the stack, then branches to the target procedure.
   - \`RET\`: Pops the return address off the stack back into \`IP\` (and \`CS\` if far RET), resuming caller execution.
4. **Loop Instructions (\`LOOP\`, \`LOOPZ\`, \`LOOPNZ\`)**:
   - \`LOOP target\`: Decrements \`CX\` (\`CX ← CX - 1\`). If \`CX ≠ 0\`, jumps to target. Does not affect flags.
5. **Software Interrupts (\`INT n\` and \`IRET\`)**:
   - \`INT n\`: Pushes \`FLAGS\`, then \`CS\`, then \`IP\` onto the stack. Clears IF and TF, then loads \`CS:IP\` from Interrupt Vector Table entry $n \times 4$.
   - \`IRET\`: Pops \`IP\`, \`CS\`, and \`FLAGS\` from the stack to cleanly restore pre-interrupt state.`,
      keyTakeaways: [
        'Near jumps only update IP; Far jumps update both CS and IP.',
        'Use JA/JB for unsigned comparisons; use JG/JL for signed two\'s complement comparisons.',
        'INT pushes 3 words to stack: FLAGS, CS, IP. CALL near pushes only 1 word: IP.'
      ]
    },

    visualize: {
      diagramType: 'control-flow-sim',
      title: 'Interactive Assembly Flow & Stack Frame Visualizer',
      description: 'Step through a conditional loop and subroutine call. Watch the Instruction Pointer, Stack frames, and condition flag checks live.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Calling a Subroutine (Near CALL)',
        desc: 'Current IP = 1000H, SP = 0200H. The CPU encounters "CALL CalcSum" located at offset 2500H.'
      },
      {
        step: 2,
        title: 'Stack Pushes Next Sequential IP',
        desc: 'Return address (1003H, size of CALL instruction + 3 bytes) is pushed to stack: SP decrements to 01FEH, SS:01FEH stores 1003H.'
      },
      {
        step: 3,
        title: 'Branch to Subroutine',
        desc: 'IP is loaded with target offset 2500H. Execution continues at CalcSum.'
      },
      {
        step: 4,
        title: 'Return from Subroutine (RET)',
        desc: 'Subroutine finishes and executes "RET". Word 1003H is popped off stack into IP; SP restores to 0200H. Execution resumes after the CALL.'
      }
    ],

    workedExample: {
      problem: 'Analyze whether the conditional jump is taken after executing: MOV AL, 0F0H; CMP AL, 05H; JL Label1 vs JB Label1.',
      solution: [
        'CMP AL, 05H performs: 0F0H - 05H = 0EBH.',
        'Unsigned analysis (for JB):',
        '  0F0H = 240 decimal; 05H = 5 decimal.',
        '  Since 240 > 5, no borrow occurs; Carry Flag CF = 0.',
        '  JB checks if CF = 1. Since CF = 0, JB IS NOT TAKEN.',
        'Signed analysis (for JL):',
        '  0F0H = -16 decimal; 05H = +5 decimal.',
        '  Since -16 < +5, the result is less than 5. Sign flag SF = 1, Overflow OF = 0 (SF ≠ OF).',
        '  JL checks if SF ≠ OF. Since 1 ≠ 0, JL IS TAKEN!'
      ],
      verifiedStamp: 'EXAM CLASSIC'
    },

    quiz: {
      question: 'During the execution of an 8086 software interrupt instruction "INT 21H", what exact items are pushed onto the stack by the CPU, and in what order?',
      options: [
        'First IP, then CS, and finally FLAGS.',
        'First FLAGS, then CS, and finally IP.',
        'Only CS and IP; flags are saved in internal shadow registers.',
        'First AX, BX, CX, DX, then CS:IP.'
      ],
      correctIndex: 1,
      explanation: 'When an interrupt occurs, the 8086 pushes: (1) FLAGS register, (2) Code Segment register CS, and (3) Instruction Pointer IP. The matching IRET pops them in exact reverse order (IP, then CS, then FLAGS).'
    },

    revise: {
      examTips: [
        'In 8086, the LOOP instruction uses CX as its implicit counter; in 80386DX, 32-bit address mode uses ECX.',
        'Conditional jumps on the 8086 are strictly SHORT jumps (-128 to +127 bytes). 80386DX introduced near conditional jumps with 16/32-bit displacements.',
        'Remember the difference between JA/JB (unsigned, uses CF) and JG/JL (signed, uses SF and OF).'
      ],
      traps: 'Trap: Writing a conditional jump expecting a far branch on the 8086. On 8086, conditional jumps CANNOT jump to another segment!'
    }
  },

  // ========================================================================
  // 4.6 STRING & TRANSLATION INSTRUCTIONS
  // ========================================================================
  'm2-string': {
    id: 'm2-string',
    module: 'module2',
    number: '4.6',
    title: 'String and Character Translation Instructions',
    subtitle: 'MOVS, LODS, STOS, CMPS, SCAS, REP prefixes, and XLAT',
    badge: 'Block Memory',
    badgeColor: 'mint',

    understand: {
      headline: 'High-Speed Block Memory Transfers and Table Lookups',
      body: `String instructions are specialized x86 operations optimized to process contiguous blocks of bytes, words, or doublewords in memory with a single instruction or repeat prefix.

### Architectural String Registers
- **Source Pointer**: Addressed by Segment:Offset = \`DS:SI\` (or \`ESI\` in 386).
- **Destination Pointer**: Addressed strictly by \`ES:DI\` (or \`EDI\` in 386). **ES segment cannot be overridden for destination strings!**
- **Count Register**: Addressed by \`CX\` (or \`ECX\`).
- **Direction Flag (\`DF\`)**:
  - \`DF = 0\` (\`CLD\` instruction): String pointers **auto-increment** (moves forward from low to high memory).
  - \`DF = 1\` (\`STD\` instruction): String pointers **auto-decrement** (moves backward from high to low memory).

### The Five Primitive String Operations
1. **\`MOVSB / MOVSW / MOVSD\`**: Copies byte/word/dword from \`DS:SI\` to \`ES:DI\`, then updates SI and DI by 1, 2, or 4.
2. **\`LODSB / LODSW\`**: Loads memory at \`DS:SI\` into accumulator \`AL\` / \`AX\`, then updates SI.
3. **\`STOSB / STOSW\`**: Stores accumulator \`AL\` / \`AX\` into memory at \`ES:DI\`, then updates DI. (Commonly used to fill memory buffers).
4. **\`CMPSB / CMPSW\`**: Compares byte/word at \`DS:SI\` with \`ES:DI\` (\`[SI] - [DI]\`), updates flags, and increments/decrements SI and DI.
5. **\`SCASB / SCASW\`**: Scans string: compares \`AL\` / \`AX\` with byte/word at \`ES:DI\`, updates flags, and updates DI.

### Repeat Prefixes
- **\`REP\`**: Repeats string operation while \`CX ≠ 0\` (used with MOVS, STOS).
- **\`REPE / REPZ\`**: Repeat while Equal / Zero (\`CX ≠ 0\` AND \`ZF = 1\`) (used with CMPS, SCAS to find first mismatch).
- **\`REPNE / REPNZ\`**: Repeat while Not Equal / Not Zero (\`CX ≠ 0\` AND \`ZF = 0\`) (used to scan for a specific character).

### Character Translation: \`XLAT\`
The \`XLAT\` (or \`XLATB\`) instruction performs lightning-fast code translation (e.g. ASCII to EBCDIC or 7-segment display lookup).
- Syntax: \`XLAT\` (or \`XLAT [table]\`)
- Operation: \`AL ← DS:[BX + AL]\`
- \`BX\` holds the starting 16-bit offset of the lookup table.
- \`AL\` holds the unsigned index (0 to 255). The byte at that table entry replaces \`AL\`. No flags are modified!`,
      keyTakeaways: [
        'Source string is DS:SI; Destination string is ALWAYS ES:DI (no segment override allowed for ES).',
        'CLD sets DF=0 (pointers increment forward); STD sets DF=1 (pointers decrement backward).',
        'XLAT translates bytes using AL as index into a table pointed to by BX: AL ← [BX + AL].'
      ]
    },

    visualize: {
      diagramType: 'string-memory-array-sim',
      title: 'Interactive String Pointer & Memory Array Runner',
      description: 'Watch SI and DI pointers glide across memory buffers during REP MOVSB and scan operations based on Direction Flag DF.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Buffer Copy Setup',
        desc: 'Source string "HELLO" at DS:1000H. Destination buffer at ES:2000H. CX = 5, DF = 0 (CLD).'
      },
      {
        step: 2,
        title: 'First REP MOVSB Cycle',
        desc: 'Byte "H" (48H) is read from DS:1000H and written to ES:2000H. SI increments to 1001H, DI increments to 2001H. CX decrements to 4.'
      },
      {
        step: 3,
        title: 'Subsequent Cycles',
        desc: 'Bytes "E", "L", "L", "O" are copied consecutively. SI reaches 1005H, DI reaches 2005H.'
      },
      {
        step: 4,
        title: 'Termination',
        desc: 'CX reaches 0000H. The CPU terminates the REP loop. The entire string transfer took only 1 instruction line.'
      }
    ],

    workedExample: {
      problem: 'Configure an XLAT lookup routine to convert a 4-bit BCD digit (0–9) stored in AL into its corresponding 7-segment display cathode code.',
      solution: [
        '; Lookup table storing 7-segment codes for digits 0 to 9:',
        'TABLE DB 3FH, 06H, 5BH, 4FH, 66H, 6DH, 7DH, 07H, 7FH, 6FH',
        '',
        '; Code segment execution:',
        'LEA BX, TABLE     ; BX points to base of 7-segment table',
        'MOV AL, 04H       ; We wish to convert digit 4',
        'XLAT              ; AL ← [BX + 04H] = TABLE[4] = 66H',
        '; Result: AL now contains 66H (7-segment bit pattern for digit 4).'
      ],
      verifiedStamp: 'VERIFIED ✓'
    },

    quiz: {
      question: 'Which segment register MUST be used to address the destination memory operand in 8086 string operations (such as MOVSB or STOSB)?',
      options: [
        'Data Segment (DS)',
        'Stack Segment (SS)',
        'Extra Segment (ES) — no segment override is permitted',
        'Code Segment (CS)'
      ],
      correctIndex: 2,
      explanation: 'In x86 string operations, the destination operand is strictly bound to the Extra Segment (ES) via ES:DI. Unlike the source operand (which can be overridden from DS to ES, CS, or SS), hardware prohibits segment overrides on the destination.'
    },

    revise: {
      examTips: [
        'Always issue CLD (Clear Direction Flag) before string operations unless intentionally walking backwards with STD.',
        'SCASB compares AL with [ES:DI] and updates flags, making REPNE SCASB the standard assembly idiom for finding string length (strlen).',
        'XLAT takes no explicit operands in its machine code opcode (D7H); BX and AL are implicit.'
      ],
      traps: 'Trap: Forgetting that ES must be initialized before using string instructions. If ES is garbage, your string write will corrupt random memory!'
    }
  },

  // ========================================================================
  // 4.7 FLAG CONTROL INSTRUCTIONS
  // ========================================================================
  'm2-flags': {
    id: 'm2-flags',
    module: 'module2',
    number: '4.7',
    title: 'Flag Control Instructions & Architecture',
    subtitle: 'CLC, STC, CMC, CLD, STD, CLI, STI, PUSHF, POPF, and 16-bit FLAGS register',
    badge: 'Status & Control',
    badgeColor: 'yellow',

    understand: {
      headline: 'The Microprocessor Status & Control Flag Register',
      body: `The 8086 has a 16-bit \`FLAGS\` register containing 9 active flags divided into two distinct functional categories:
1. **Status Flags (6 flags)**: Reflect the algebraic outcome of the most recent arithmetic or logical operation.
2. **Control Flags (3 flags)**: Alter the operational behavior of the microprocessor CPU.

### The 6 Status Flags
- **CF (Carry Flag, bit 0)**: Set if there is a carry out of MSB (addition) or borrow into MSB (subtraction).
- **PF (Parity Flag, bit 2)**: Set if the lowest 8 bits of the result contain an **even number of 1s**.
- **AF (Auxiliary Carry Flag, bit 4)**: Set if there is a carry out of bit 3 into bit 4 (nibble carry). Used by BCD instructions (\`DAA\`, \`DAS\`).
- **ZF (Zero Flag, bit 6)**: Set if the result of an operation is exactly zero.
- **SF (Sign Flag, bit 7)**: Replicates the MSB of the result (1 = negative, 0 = positive).
- **OF (Overflow Flag, bit 11)**: Set if signed two's complement integer overflow occurs.

### The 3 Control Flags
- **DF (Direction Flag, bit 10)**: Controls auto-increment (\`DF=0\`) or auto-decrement (\`DF=1\`) in string instructions.
- **IF (Interrupt Enable Flag, bit 9)**: When 1, CPU responds to maskable hardware interrupts on the \`INTR\` pin. When 0, INTR interrupts are ignored.
- **TF (Trap Flag, bit 8)**: When 1, CPU enters single-step debugging mode, firing Interrupt 1 after every single instruction.

### Flag Control Instructions
- **Carry Flag Control**: \`CLC\` (Clear CF to 0), \`STC\` (Set CF to 1), \`CMC\` (Complement / Toggle CF).
- **Direction Flag Control**: \`CLD\` (Clear DF to 0), \`STD\` (Set DF to 1).
- **Interrupt Flag Control**: \`CLI\` (Clear IF to 0 / Disable interrupts), \`STI\` (Set IF to 1 / Enable interrupts).
- **Stack Flag Transfers**: \`PUSHF\` (pushes 16-bit FLAGS to stack) and \`POPF\` (pops word from stack into FLAGS register).`,
      keyTakeaways: [
        'Status flags are updated automatically by ALU operations; Control flags are set explicitly by programmers.',
        'PUSHF and POPF allow software to inspect or modify all flags, including the Trap Flag (TF).',
        'CLI and STI control the hardware INTR pin; they do NOT disable Non-Maskable Interrupts (NMI).'
      ]
    },

    visualize: {
      diagramType: 'flags-register-sim',
      title: 'Interactive 16-Bit FLAGS Register Explorer',
      description: 'Inspect the bit layout of the 8086 FLAGS register. Toggle flags, execute CLC, STC, STD, and observe before/after hex words.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Initial Flag Word',
        desc: 'FLAGS register = 0002H (standard reserved bit 1 is always 1 in 8086). All status flags are 0.'
      },
      {
        step: 2,
        title: 'Execute "STC"',
        desc: 'Set Carry Flag: Bit 0 changes from 0 to 1. FLAGS register becomes 0003H.'
      },
      {
        step: 3,
        title: 'Execute "STD"',
        desc: 'Set Direction Flag: Bit 10 changes from 0 to 1. String pointers will now auto-decrement.'
      },
      {
        step: 4,
        title: 'Execute "PUSHF" followed by "POPF"',
        desc: 'Current flag state is saved to stack. Can be safely restored after critical routines.'
      }
    ],

    workedExample: {
      problem: 'Determine the state of ZF, SF, CF, and OF after executing: MOV AL, 50H; SUB AL, 50H.',
      solution: [
        'Operation: 50H - 50H = 00H.',
        'Zero Flag (ZF): Result is exactly zero → ZF = 1.',
        'Sign Flag (SF): MSB of 00H is 0 → SF = 0.',
        'Carry Flag (CF): No borrow required (50H is not smaller than 50H) → CF = 0.',
        'Overflow Flag (OF): 80 - 80 = 0. No signed overflow occurred → OF = 0.',
        'Parity Flag (PF): 00H has zero 1-bits (even number) → PF = 1.'
      ],
      verifiedStamp: 'VERIFIED ✓'
    },

    quiz: {
      question: 'Which of the following microprocessor flags can CANNOT be modified directly by a dedicated 1-byte opcode instruction like CLC or CLI?',
      options: [
        'Carry Flag (CF)',
        'Direction Flag (DF)',
        'Interrupt Flag (IF)',
        'Zero Flag (ZF)'
      ],
      correctIndex: 3,
      explanation: 'CF has CLC/STC/CMC, DF has CLD/STD, and IF has CLI/STI. However, there is no "CLZ" or "STZ" instruction for the Zero Flag (ZF); ZF can only be modified through arithmetic/logical operations or by pushing values and using POPF.'
    },

    revise: {
      examTips: [
        'Status flags: CF (0), PF (2), AF (4), ZF (6), SF (7), OF (11).',
        'Control flags: TF (8), IF (9), DF (10).',
        'Bits 1, 3, 5, 12, 13, 14, 15 are reserved on the 8086. In 80386DX, bit 12-13 became IOPL (I/O Privilege Level) and bit 14 became NT (Nested Task).'
      ],
      traps: 'Trap: Assuming CLI disables all interrupts. NMI (Non-Maskable Interrupt, Interrupt 2) cannot be disabled by CLI!'
    }
  },

  // ========================================================================
  // 5.0 SELF-STUDY: 8086 VS 80386DX ARCHITECTURE
  // ========================================================================
  'm2-arch-compare': {
    id: 'm2-arch-compare',
    module: 'module2',
    number: '5.0',
    title: 'Self-Study: Intel 8086 vs 80386DX Architecture',
    subtitle: '16-bit vs 32-bit registers, Real Mode vs Protected Mode, and memory capabilities',
    badge: 'Self-Study Master',
    badgeColor: 'purple',

    understand: {
      headline: 'Architectural Evolution from 16-Bit Real Mode to 32-Bit Protected Mode',
      body: `The transition from the Intel 8086 (1978) to the Intel 80386DX (1985) represents one of the most significant architectural leaps in computing history, evolving from a simple single-tasking real-mode microprocessor into a full 32-bit multitasking virtual-memory powerhouse.

### Key Architectural Differences

| Feature | Intel 8086 | Intel 80386DX |
| :--- | :--- | :--- |
| **Data Bus Width** | 16-bit | 32-bit |
| **Address Bus Width** | 20-bit | 32-bit |
| **Physical Address Space** | 1 MB ($2^{20}$ bytes) | 4 GB ($2^{32}$ bytes) |
| **General Purpose Registers**| 16-bit (AX, BX, CX, DX) | 32-bit (EAX, EBX, ECX, EDX) + sub-registers |
| **Pointers & Indexes** | 16-bit (SP, BP, SI, DI, IP) | 32-bit (ESP, EBP, ESI, EDI, EIP) |
| **Segment Registers** | 4 (CS, DS, SS, ES) | 6 (CS, DS, SS, ES + **FS, GS**) |
| **Operating Modes** | Real Mode only | Real Mode, **Protected Mode**, Virtual 8086 |
| **Memory Management** | Segmentation only (fixed 64 KB segments) | Segmentation (variable size up to 4 GB) + **Paging** |
| **Instruction Prefetch Queue**| 6 Bytes | 16 Bytes |
| **Barrel Shifter** | Multi-bit shift takes $n$ clocks | Built-in barrel shifter shifts in 1 clock cycle |

### Real Mode vs Protected Mode
- **Real Mode (8086 default)**: Segments are fixed at maximum 64 KiB, base address is calculated simply by shifting segment register left by 4 bits (\`Seg × 16\`). No memory protection; any program can overwrite OS code or crash the hardware.
- **Protected Mode (80386DX)**: Segment registers hold **16-bit Selectors** that point into Descriptor Tables (GDT / LDT). Descriptors define 32-bit Base, 20-bit Limit (up to 4 GB with 4 KB granularity), and **Privilege Rings (Rings 0 to 3)** with access rights. Memory violation immediately triggers a General Protection Fault (\`#GP\`).`,
      keyTakeaways: [
        '8086 address bus is 20-bit (1 MB); 80386DX address bus is 32-bit (4 GB).',
        '80386DX added two new segment registers: FS and GS.',
        '80386DX supports hardware paging with 4 KiB page frames.'
      ]
    },

    visualize: {
      diagramType: 'cpu-selector-comparison',
      title: 'Interactive CPU Generation Switcher (8086 vs 80386DX)',
      description: 'Switch between the 8086 and 80386DX views to inspect register bit expansion, segment register additions (FS/GS), and address bus scaling.'
    },

    stepByStep: [
      {
        step: 1,
        title: '8086 Register Architecture',
        desc: '16-bit Accumulator AX can be split into AH (high 8 bits) and AL (low 8 bits). Pointers SP, BP, SI, DI are strictly 16-bit.'
      },
      {
        step: 2,
        title: '80386DX Register Expansion',
        desc: 'General registers are extended to 32 bits with the "E" prefix: EAX. The lower 16 bits remain accessible as AX, and lower 8 bits as AH/AL for backward compatibility.'
      },
      {
        step: 3,
        title: 'Addressing Mode Generalization',
        desc: 'In 8086, only BX, BP, SI, and DI could be used inside memory brackets [ ]. In 80386DX, ANY 32-bit general register can serve as base or index (with optional scaling factor of 1, 2, 4, or 8).'
      },
      {
        step: 4,
        title: 'Protected Mode Descriptors',
        desc: 'Instead of base = Seg × 16, segment registers load an index into GDT/LDT. Hardware enforces segment limits and privilege rings.'
      }
    ],

    workedExample: {
      problem: 'Explain why the instruction "MOV EAX, [EBX + ECX*4 + 20H]" is legal on an Intel 80386DX but invalid on an Intel 8086.',
      solution: [
        '1. 32-bit Registers: EAX, EBX, ECX do not exist on the 16-bit 8086.',
        '2. Scaled Index: ECX*4 uses the 80386DX Scale-Index-Base (SIB) byte (scaling by 1, 2, 4, or 8). 8086 has no scaling hardware.',
        '3. Base Register Restrictions: On 8086, only BX and BP could be base registers, and only SI and DI could be index registers. 80386DX allows any 32-bit register (except ESP as index).'
      ],
      verifiedStamp: '386 EXCLUSIVE'
    },

    quiz: {
      question: 'Which of the following features was introduced with the Intel 80386DX and was completely absent in the original 8086 microprocessor?',
      options: [
        'Bus Interface Unit (BIU) and Execution Unit (EU)',
        'Hardware Paging Unit with two-level page translation',
        'Stack Segment (SS) and Code Segment (CS)',
        'Support for the Direction Flag (DF)'
      ],
      correctIndex: 1,
      explanation: 'The 80386DX introduced the on-chip Paging Unit (supporting two-level address translation via CR3, Page Directory, and Page Tables). The 8086 had only a real-mode segmentation unit.'
    },

    revise: {
      examTips: [
        'Remember the exact memory limits: 8086 = 1 MB (20 address lines). 80386DX = 4 GB (32 address lines).',
        '80386DX introduced CR0 (with PE bit to enable protected mode and PG bit to enable paging) and CR3 (page directory base register).',
        'FS and GS segment registers were added in the 80386DX.'
      ],
      traps: 'Trap: Claiming that 8086 has a 32-bit EAX register. 8086 only has 16-bit AX!'
    }
  },

  // ========================================================================
  // MODULE III — MEMORY MANAGEMENT
  // ========================================================================
  'm3-seg': {
    id: 'm3-seg',
    module: 'module3',
    number: '6.1',
    title: 'Memory Segmentation',
    subtitle: 'Logical addresses, 8086 physical address calculation, and 386 protected mode descriptors',
    badge: 'Memory Core',
    badgeColor: 'cyan',

    understand: {
      headline: 'Dividing Memory into Modular Logical Segments',
      body: `**Segmentation** is a memory management technique in which physical memory is divided into variable-sized logical blocks called **segments** (e.g., Code Segment, Data Segment, Stack Segment).

### Why Segmentation?
1. **Modularity**: Programs can separate executable code (\`CS\`), data structures (\`DS\`), stack frames (\`SS\`), and extra string buffers (\`ES\`).
2. **Relocatability**: Code can be placed anywhere in physical memory without changing internal offset references.
3. **Protection & Sharing**: In protected mode, multiple programs can share read-only code segments while keeping private data segments isolated.

### 8086 Real-Mode Physical Address Generation
The 8086 has a 20-bit physical address bus ($2^{20} = 1,048,576$ bytes = 1 MB), but internal registers are only 16-bit!
To generate a 20-bit address from two 16-bit values, the hardware shifts the **Segment Register left by 4 bits** (multiplying by 16 or 10H) and adds the 16-bit **Offset**:

$$\\text{Physical Address} = (\\text{Segment} \\times 10\\text{H}) + \\text{Offset}$$

- Maximum segment size: $2^{16} = 64\\text{ KiB}$.
- Example notation: \`1234H:0050H\`.

### 80386DX Protected-Mode Segmentation
In 80386DX Protected Mode, the segment register is no longer multiplied by 16! Instead, it holds a **16-bit Segment Selector**:
- **Index (13 bits)**: Selects one of $2^{13} = 8192$ descriptors in the descriptor table.
- **TI (Table Indicator, 1 bit)**: 0 = Global Descriptor Table (GDT), 1 = Local Descriptor Table (LDT).
- **RPL (Requested Privilege Level, 2 bits)**: Ring 0 (Kernel) to Ring 3 (User).

The selected **8-byte Segment Descriptor** supplies:
- **32-bit Base Address**: Any physical location in 4 GB address space.
- **20-bit Segment Limit**: Specifies maximum size (up to 4 GB with 4 KB Granularity bit \`G=1\`).
- **Access Rights Byte**: Present bit (\`P\`), Privilege Level (\`DPL\`), Executable/Read/Write permissions.`,
      keyTakeaways: [
        '8086 physical address formula: Physical = Segment × 16 + Offset.',
        'Real mode segments are limited to 64 KB; 80386DX protected mode segments can span up to 4 GB.',
        'In protected mode, the segment register is a Selector into GDT or LDT.'
      ]
    },

    visualize: {
      diagramType: 'segmentation-calculator-sim',
      title: 'Interactive 8086 & 80386DX Segmentation Calculator',
      description: 'Enter any hexadecimal Segment and Offset. Watch the hardware shift by 4 bits, add offset, and verify legal address boundaries.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Input Logical Address',
        desc: 'Given Segment = 1234H, Offset = 0050H.'
      },
      {
        step: 2,
        title: 'Shift Segment Left by 4 Bits (× 16)',
        desc: '1234H shifted left by 4 bits (1 hex digit) = 12340H.'
      },
      {
        step: 3,
        title: 'Add the 16-bit Offset',
        desc: '12340H + 0050H = 12390H.'
      },
      {
        step: 4,
        title: '20-bit Physical Address Output',
        desc: 'Physical Address = 12390H (74,640 in decimal). The bus places 12390H on address lines A19–A0.'
      }
    ],

    workedExample: {
      problem: 'Calculate the physical address for: (a) CS = 348AH and IP = 4214H. (b) What are the starting and ending physical addresses of this code segment?',
      solution: [
        'Part (a): Physical Address = CS × 16 + IP',
        '  CS × 10H = 348A0H',
        '  Offset IP =  4214H',
        '  Sum = 348A0H + 4214H = 38AB4H.',
        'Part (b): Segment Boundaries (64 KB span):',
        '  Starting Address (Offset 0000H) = 348A0H + 0000H = 348A0H.',
        '  Ending Address (Offset FFFFH) = 348A0H + FFFFH = 4489FH.'
      ],
      verifiedStamp: 'EXACT ADDRESS'
    },

    quiz: {
      question: 'In 8086 real mode, if the Data Segment register DS contains 2000H and the effective address offset is 0100H, what is the resulting 20-bit physical memory address?',
      options: [
        '20100H',
        '200100H',
        '21000H',
        '02100H'
      ],
      correctIndex: 0,
      explanation: 'Physical Address = Segment × 10H + Offset = 20000H + 0100H = 20100H.'
    },

    revise: {
      examTips: [
        'Always show the shift step in exams: "Segment × 16 + Offset" or "Segment × 10H + Offset".',
        'If the calculated address exceeds FFFFFH on the 8086, it wraps around to 00000H (address line A20 wrap).',
        'In 80386DX protected mode, a segment limit violation immediately generates Exception 13 (#GP General Protection Fault).'
      ],
      traps: 'Trap: Adding segment and offset directly without shifting! (1234H + 0050H = 1284H is completely WRONG; it must be 12340H + 0050H = 12390H).'
    }
  },

  // ========================================================================
  // 6.2 PAGING
  // ========================================================================
  'm3-paging': {
    id: 'm3-paging',
    module: 'module3',
    number: '6.2',
    title: 'Paging Architecture',
    subtitle: 'Pages, page frames, two-level page directories, and page-table entry structure',
    badge: 'Virtual Memory',
    badgeColor: 'yellow',

    understand: {
      headline: 'Fixed-Size Memory Allocation and Virtual Memory Management',
      body: `**Paging** is a memory management mechanism that breaks physical memory into fixed-sized blocks called **page frames** (typically 4 KiB) and maps them to contiguous **pages** in virtual memory.

### Why Paging?
- **Eliminates External Fragmentation**: Any free physical frame can be allocated to any virtual page.
- **Virtual Memory & Swapping**: Inactive pages can be saved to disk. When accessed, a **Page Fault (\`#PF\`, Interrupt 14)** brings the page back into RAM.
- **Protection**: Each page table entry carries Read/Write (\`R/W\`) and User/Supervisor (\`U/S\`) permissions.

### Classic 80386DX Two-Level Paging Architecture
The 80386DX uses standard 4 KiB ($2^{12} = 4096$ bytes) pages. A single linear page table for 4 GB would take 4 MB of contiguous RAM!
To avoid this overhead, the 80386DX organizes translation into a **two-level hierarchical tree**:

A 32-bit linear address is decomposed into three distinct fields:
- **Bits 31–22 (10 bits)**: **Page Directory Index (PDI)**. Selects 1 of 1024 Page Directory Entries in the Page Directory.
- **Bits 21–12 (10 bits)**: **Page Table Index (PTI)**. Selects 1 of 1024 Page Table Entries in the referenced Page Table.
- **Bits 11–0 (12 bits)**: **Page Offset**. Points to the exact byte within the 4096-byte page frame.

### The Role of CR3 and Entries
- **Control Register 3 (\`CR3\`)**: Holds the 32-bit physical base address of the active Page Directory.
- **Page Table Entry (PTE) Bits**:
  - **Bits 31–12**: Physical Frame Base Address (upper 20 bits).
  - **Bit 0 (P)**: **Present Bit** (1 = page is in RAM; 0 = page fault!).
  - **Bit 1 (R/W)**: 0 = Read-only, 1 = Read/Write.
  - **Bit 2 (U/S)**: 0 = Supervisor (Ring 0-2), 1 = User (Ring 3).
  - **Bit 5 (A)**: Accessed bit (set by CPU when read).
  - **Bit 6 (D)**: Dirty bit (set by CPU when written to).`,
      keyTakeaways: [
        '32-bit linear address is split into: 10-bit Directory, 10-bit Page Table, 12-bit Offset (10-10-12).',
        'Standard page size is 4 KiB (4096 bytes).',
        'CR3 register holds the physical address of the Page Directory.'
      ]
    },

    visualize: {
      diagramType: 'paging-simulator-sim',
      title: 'Interactive 80386DX Two-Level Paging Decomposer & PTE Walker',
      description: 'Enter any 32-bit linear address (e.g., 00403014H). See the address split into 10-bit PDI, 10-bit PTI, and 12-bit offset, then follow the page table lookup.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Input Linear Address',
        desc: 'Linear Address = 00403014H. Binary: 0000 0000 0100 0000 0011 0000 0001 0100B.'
      },
      {
        step: 2,
        title: 'Extract Page Directory Index (Bits 31-22)',
        desc: 'Bits 31–22: 0000000001B = Index 1. Hardware accesses Page Directory Entry #1 at CR3 + (1 × 4).'
      },
      {
        step: 3,
        title: 'Extract Page Table Index (Bits 21-12)',
        desc: 'Bits 21–12: 0000000011B = Index 3. Hardware accesses Page Table Entry #3 in that Page Table.'
      },
      {
        step: 4,
        title: 'Extract Offset & Build Physical Address',
        desc: 'PTE supplies physical frame base (e.g. 2A000000H). Offset (Bits 11–0) = 014H. Physical Address = 2A000014H.'
      }
    ],

    workedExample: {
      problem: 'Deconstruct linear address 12345678H for an 80386DX system into Page Directory Index, Page Table Index, and Offset.',
      solution: [
        '1. Convert 12345678H to 32-bit binary:',
        '   0001 0010 0011 0100 0101 0110 0111 1000B',
        '2. Separate into 10 - 10 - 12 bits:',
        '   PDI (Bits 31-22): 0001 0010 00B = 048H = 72 decimal.',
        '   PTI (Bits 21-12): 11 0100 0101B = 345H = 837 decimal.',
        '   Offset (Bits 11-0): 0110 0111 1000B = 678H = 1656 decimal.',
        'Conclusion: PDE #72 points to Page Table; PTE #837 points to Page Frame; offset is 678H.'
      ],
      verifiedStamp: 'BIT-ACCURATE'
    },

    quiz: {
      question: 'In the classic 80386DX two-level paging architecture with 4 KiB pages, how many bits are allocated to the Page Directory Index, Page Table Index, and Page Offset, respectively?',
      options: [
        '8 bits, 8 bits, 16 bits',
        '10 bits, 10 bits, 12 bits',
        '12 bits, 10 bits, 10 bits',
        '16 bits, 8 bits, 8 bits'
      ],
      correctIndex: 1,
      explanation: 'The 32-bit linear address is partitioned into: 10 bits for the Page Directory Index (1024 entries), 10 bits for the Page Table Index (1024 entries), and 12 bits for the Page Offset (2^12 = 4096 bytes = 4 KiB).'
    },

    revise: {
      examTips: [
        'Always remember the "10-10-12" split for 80386DX 32-bit paging.',
        'If the Present bit (P, bit 0) in either PDE or PTE is 0, the CPU aborts instruction execution and raises a Page Fault (Exception 14).',
        'CR2 register automatically receives the linear address that caused the page fault to assist the OS page fault handler.'
      ],
      traps: 'Trap: Forgetting that page sizes determine offset bit width: 4 KB = 2^12, so offset is exactly 12 bits.'
    }
  },

  // ========================================================================
  // 6.3 COMBINED TRANSLATION: SEGMENTATION + PAGING
  // ========================================================================
  'm3-combined': {
    id: 'm3-combined',
    module: 'module3',
    number: '6.3',
    title: 'Combined Translation: Segmentation + Paging',
    subtitle: 'Logical Address → Segmentation → Linear Address → Paging → Physical Address',
    badge: 'High-Yield Self-Study',
    badgeColor: 'coral',

    understand: {
      headline: 'The Complete x86 Two-Stage Address Translation Pipeline',
      body: `When an 80386DX operates in Protected Mode with Paging enabled (\`CR0.PG = 1\` and \`CR0.PE = 1\`), every memory access passes through a strict two-stage pipeline:

$$\\text{Logical Address} \\xrightarrow{\\text{Segmentation Unit}} \\text{Linear Address} \\xrightarrow{\\text{Paging Unit}} \\text{Physical Address}$$

### Stage 1: Segmentation Translation (Logical to Linear)
1. The program issues a **Logical Address** consisting of a **16-bit Segment Selector** (in CS, DS, SS, etc.) and a **32-bit Offset**.
2. Hardware checks Selector Table Indicator (\`TI\`) and extracts the index into GDT or LDT.
3. Hardware fetches the 8-byte **Segment Descriptor**:
   - Validates privilege: \`CPL / RPL ≤ DPL\`. (If invalid → \`#GP\` General Protection Fault).
   - Validates offset boundary: \`Offset ≤ Limit\`. (If exceeded → \`#GP\` Fault).
4. **Calculates 32-bit Linear Address**:
   $$\\text{Linear Address} = \\text{Segment Base Address} + \\text{Offset}$$

### Stage 2: Paging Translation (Linear to Physical)
If paging is disabled (\`PG = 0\`), Linear Address = Physical Address directly.
If paging is enabled (\`PG = 1\`):
1. Hardware takes the 32-bit Linear Address and reads \`CR3\` (Page Directory Base).
2. **Bits 31–22 (10 bits)** index into Page Directory to fetch PDE:
   - Validates Present bit \`P = 1\`. (If \`P = 0\` → \`#PF\` Page Fault).
3. **Bits 21–12 (10 bits)** index into Page Table to fetch PTE:
   - Validates Present bit \`P = 1\` and permissions \`R/W\` and \`U/S\`. (If invalid → \`#PF\` Page Fault).
4. **Extracts 20-bit Page Frame Base** from PTE.
5. **Combines with lower 12-bit Offset**:
   $$\\text{Physical Address} = (\\text{Frame Base} \\ \\& \\ \\text{FFF00000H}) \\ | \\ (\\text{Linear Address} \\ \\& \\ 00000FFFH)$$`,
      keyTakeaways: [
        'Complete address sequence: Logical Address → Linear Address → Physical Address.',
        'Segmentation catches privilege/limit errors; Paging catches missing page frames / swapping needs.',
        'If paging is disabled (CR0.PG = 0), linear addresses are identical to physical addresses.'
      ]
    },

    visualize: {
      diagramType: 'combined-pipeline-sim',
      title: 'Interactive End-to-End Address Translation Pipeline',
      description: 'Follow a real logical address through GDT lookup, linear generation, CR3 directory walk, and physical address construction.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Logical Address Input',
        desc: 'Selector = 0010H (GDT index 2, RPL=0), Offset = 00004050H.'
      },
      {
        step: 2,
        title: 'Descriptor Lookup & Limit Check',
        desc: 'GDT Entry #2 has Base = 40000000H, Limit = 000FFFFFH. Offset 4050H is within limit. Check passes.'
      },
      {
        step: 3,
        title: 'Linear Address Generation',
        desc: 'Linear Address = Base (40000000H) + Offset (00004050H) = 40004050H.'
      },
      {
        step: 4,
        title: 'Two-Level Paging Lookup',
        desc: 'PDI = 100H (256), PTI = 004H (4), Offset = 050H. PDE and PTE are present. PTE supplies Frame 0B200000H.'
      },
      {
        step: 5,
        title: 'Final Physical Address Construction',
        desc: 'Physical Address = 0B200000H + 050H = 0B200050H. Memory bus fetches data.'
      }
    ],

    workedExample: {
      problem: 'Trace translation for Selector = 0018H (GDT descriptor with Base = 20000000H) and Offset = 00001234H. Paging is active: linear address maps to frame 00700000H.',
      solution: [
        'Step 1: Calculate Linear Address',
        '  Linear Address = Base + Offset = 20000000H + 00001234H = 20001234H.',
        'Step 2: Paging Decomposition',
        '  Binary: 0010 0000 0000 0000 0001 0010 0011 0100B',
        '  PDI (bits 31-22) = 0010 0000 00B = 080H (128 decimal).',
        '  PTI (bits 21-12) = 00 0000 0001B = 001H (1 decimal).',
        '  Page Offset (bits 11-0) = 0010 0011 0100B = 234H.',
        'Step 3: Construct Physical Address',
        '  Given Frame Base = 00700000H.',
        '  Physical Address = 00700000H + 234H = 00700234H.'
      ],
      verifiedStamp: 'PIPELINE PROVEN'
    },

    quiz: {
      question: 'In 80386DX protected mode, if a program attempts to access an offset that exceeds the Segment Limit specified in its descriptor, which exception is triggered before paging even begins?',
      options: [
        'Interrupt 14 (Page Fault)',
        'Interrupt 13 (General Protection Fault #GP)',
        'Interrupt 0 (Divide Error)',
        'Interrupt 8 (Double Fault)'
      ],
      correctIndex: 1,
      explanation: 'Segment limit violations occur in Stage 1 (the Segmentation Unit) and immediately trigger Exception 13 (General Protection Fault #GP). Paging (Stage 2) is never reached.'
    },

    revise: {
      examTips: [
        'Always draw the two-stage diagram in exam questions: [Selector:Offset] → Segmentation → [Linear Address] → Paging → [Physical Address].',
        'Distinct terminology: Logical = Selector:Offset; Linear = Flattened address before paging; Physical = Actual bus signals.',
        'Modern OSs like Linux and Windows configure GDT descriptors with Base = 0 and Limit = 4 GB (flat model), effectively bypassing segmentation so Linear Address == Logical Offset.'
      ],
      traps: 'Trap: Confusing Page Fault with General Protection Fault. GP faults are segmentation/privilege violations; Page faults are paging/table violations.'
    }
  },

  // ========================================================================
  // 6.4 SEGMENTATION VERSUS PAGING
  // ========================================================================
  'm3-seg-vs-paging': {
    id: 'm3-seg-vs-paging',
    module: 'module3',
    number: '6.4',
    title: 'Segmentation Versus Paging',
    subtitle: 'Comparative analysis of modularity, fragmentation, protection, and allocation',
    badge: 'Comparison Matrix',
    badgeColor: 'mint',

    understand: {
      headline: 'Comparing the Two Foundational Memory Management Paradigms',
      body: `Computer architecture students frequently confuse segmentation and paging because both map logical addresses to physical space. However, they serve fundamentally different purposes in operating system design.

### Comprehensive Comparison Matrix

| Dimension | Segmentation | Paging |
| :--- | :--- | :--- |
| **Basic Concept** | Divides memory into user-visible logical modules (code, data, stack). | Divides memory into fixed-size physical frames invisible to programmer. |
| **Size of Blocks** | **Variable size** (depends on programmer code size). | **Fixed size** (typically 4 KiB in x86). |
| **Programmer Visibility** | Visible to programmer/compiler (e.g. \`DS:BX\`). | Completely transparent to application programmer. |
| **Address Structure** | Two-dimensional: \`Segment:Offset\`. | One-dimensional linear address decomposed into \`Page + Offset\`. |
| **Fragmentation** | Suffers from **External Fragmentation** (variable holes). | Suffers from **Internal Fragmentation** (unused tail of last 4K page). |
| **Protection & Sharing** | Excellent for sharing logical units (e.g., shared math library function). | Page-level access rights (\`R/W\`, \`U/S\`) per 4 KB frame. |
| **Hardware Overhead** | Simpler descriptor tables, but complex dynamic memory allocation. | Requires Page Directories, Page Tables, and high-speed TLB cache. |`,
      keyTakeaways: [
        'Segmentation causes external fragmentation; Paging causes internal fragmentation.',
        'Segments are variable in size; Pages are strictly fixed in size (4 KB).',
        'Modern operating systems combine both: flat segmentation with hierarchical paging.'
      ]
    },

    visualize: {
      diagramType: 'fragmentation-visualizer',
      title: 'Interactive External vs Internal Fragmentation Visualizer',
      description: 'Observe how variable-sized segments leave stranded memory holes (external fragmentation), while fixed pages waste space only at the last block tail.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'External Fragmentation in Segmentation',
        desc: 'Process A (40 KB) and Process B (60 KB) are allocated. Process A terminates, leaving a 40 KB gap. A new 50 KB process cannot fit, even if total free RAM > 50 KB!'
      },
      {
        step: 2,
        title: 'Elimination via Paging',
        desc: 'The 50 KB process is divided into 13 pages of 4 KB each. Pages can be placed in any non-contiguous frames across memory. No external gaps!'
      },
      {
        step: 3,
        title: 'Internal Fragmentation in Paging',
        desc: 'The process needs 50 KB. 13 pages × 4 KB = 52 KB allocated. 2 KB in the final page is unused. This wasted remainder is internal fragmentation.'
      }
    ],

    workedExample: {
      problem: 'A process requires 14,000 bytes of memory. If a system uses 4 KiB paging, calculate: (a) Number of pages allocated, (b) Amount of internal fragmentation.',
      solution: [
        'Page size = 4 KiB = 4096 bytes.',
        'Part (a): Number of pages = ceil(14000 / 4096) = ceil(3.418) = 4 pages.',
        'Part (b): Total allocated memory = 4 × 4096 = 16,384 bytes.',
        '  Internal fragmentation = Allocated - Required = 16,384 - 14,000 = 2,384 bytes.'
      ],
      verifiedStamp: 'VERIFIED ✓'
    },

    quiz: {
      question: 'Which type of memory fragmentation is primarily associated with fixed-size paging systems?',
      options: [
        'External fragmentation only',
        'Internal fragmentation in the last allocated page frame',
        'Segment register fragmentation',
        'Both external and internal fragmentation equally'
      ],
      correctIndex: 1,
      explanation: 'Paging completely eliminates external fragmentation because any free 4 KB frame can satisfy any page request. However, it experiences internal fragmentation if a process\'s memory requirement does not land on an exact multiple of 4096 bytes.'
    },

    revise: {
      examTips: [
        'Always contrast: Segmentation = Variable size + External fragmentation; Paging = Fixed size + Internal fragmentation.',
        'Remember that average internal fragmentation per process is roughly Page Size / 2 (2 KB for 4 KB pages).'
      ],
      traps: 'Trap: Claiming that paging suffers from external fragmentation. Paging NEVER has external fragmentation!'
    }
  },

  // ========================================================================
  // 7.1 CACHE FUNDAMENTALS & HIERARCHY
  // ========================================================================
  'm3-cache-fundamentals': {
    id: 'm3-cache-fundamentals',
    module: 'module3',
    number: '7.1',
    title: 'Cache Memory Fundamentals & Hierarchy',
    subtitle: 'Locality of reference, memory hierarchy, cache lines, hit ratio, and miss penalty',
    badge: 'Hardware Speed',
    badgeColor: 'yellow',

    understand: {
      headline: 'Bridging the CPU-DRAM Speed Chasm',
      body: `Modern CPU cores can execute multiple instructions per nanosecond, but main memory (DRAM) takes 50 to 100 nanoseconds to respond. **Cache memory** is a small, ultra-fast static RAM (SRAM) buffer situated directly adjacent to or inside the CPU core to hold frequently accessed instructions and data.

### The Principle of Locality of Reference
Caches work because computer programs do not access memory randomly. They exhibit two strong patterns:
1. **Temporal Locality (Locality in Time)**: If a memory location is accessed once, it is likely to be accessed again in the near future (e.g., loop variables, subroutine code).
2. **Spatial Locality (Locality in Space)**: If a memory location is accessed, nearby memory locations are likely to be accessed soon (e.g., sequential instruction execution, array traversal).

Because of spatial locality, caches never transfer individual bytes; they always fetch a contiguous block called a **cache line / block** (commonly 32 or 64 bytes).

### The Classical Memory Hierarchy
1. **CPU Registers**: ~0.5 ns latency, < 1 KB capacity.
2. **L1 Cache (Separate I-Cache & D-Cache)**: ~1 ns latency, 32–64 KB per core.
3. **L2 Cache**: ~3–5 ns latency, 256–512 KB per core.
4. **L3 Cache (Shared LLC)**: ~10–15 ns latency, 8–32 MB shared across cores.
5. **Main Memory (DRAM)**: ~50–100 ns latency, 8–64 GB.
6. **Secondary Storage (SSD/NVMe)**: ~10–100 μs latency, Terabytes.

### Key Metrics
- **Cache Hit**: Requested data word is found in cache.
- **Cache Miss**: Requested data word is not in cache; must be fetched from lower memory.
- **Hit Ratio ($H$)**: Fraction of memory accesses satisfied by cache ($0.0 \\le H \\le 1.0$).
- **Miss Ratio ($M$)**: $M = 1 - H$.
- **Miss Penalty**: Total extra latency to bring the missing block from DRAM into cache.`,
      keyTakeaways: [
        'Caches rely on temporal locality (time) and spatial locality (space).',
        'Data transfers between memory and cache occur in fixed-size blocks (cache lines).',
        'Miss Ratio = 1 - Hit Ratio.'
      ]
    },

    visualize: {
      diagramType: 'memory-hierarchy-pyramid',
      title: 'Interactive Memory Hierarchy Pyramid',
      description: 'Explore the trade-offs between speed, cost per bit, proximity, and storage capacity from Registers down to NVMe Storage.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'CPU Memory Request',
        desc: 'CPU issues read for address 1000H. L1 cache checks its directory tags.'
      },
      {
        step: 2,
        title: 'Cache Hit Scenario',
        desc: 'Tag matches and Valid bit = 1. Data is returned in ~1 ns (1 clock cycle). No bus transaction.'
      },
      {
        step: 3,
        title: 'Cache Miss Scenario',
        desc: 'Tag mismatch. CPU pipeline stalls. Request forwarded to L2, L3, or DRAM.'
      },
      {
        step: 4,
        title: 'Line Replacement & Update',
        desc: 'Entire 64-byte block containing 1000H is fetched from DRAM, placed in cache, and tag updated. CPU resumes.'
      }
    ],

    workedExample: {
      problem: 'In a program with 10,000 memory accesses, 9,600 hit in the L1 cache. Calculate: (a) Hit ratio, (b) Miss ratio, (c) Miss percentage.',
      solution: [
        'Total accesses = 10,000. Total hits = 9,600.',
        'Part (a): Hit Ratio H = Hits / Total = 9,600 / 10,000 = 0.96 (96%).',
        'Part (b): Misses = 10,000 - 9,600 = 400. Miss Ratio M = 400 / 10,000 = 0.04 (4%).',
        'Part (c): Miss Percentage = 4%.'
      ],
      verifiedStamp: 'VERIFIED ✓'
    },

    quiz: {
      question: 'Which type of locality is primarily exploited when a cache fetches an entire 64-byte line upon accessing a single variable in an array?',
      options: [
        'Temporal Locality',
        'Spatial Locality',
        'Associative Locality',
        'Instruction Register Locality'
      ],
      correctIndex: 1,
      explanation: 'Spatial locality states that accessing memory at address X makes it highly likely that nearby addresses (X+1, X+2) will be accessed soon. Loading an entire cache block captures adjacent array elements.'
    },

    revise: {
      examTips: [
        'Hit Ratio H + Miss Ratio M = 1.0 always.',
        'Remember that modern CPUs have separate L1 Instruction (I-Cache) and L1 Data (D-Cache) (Harvard architecture at L1) to prevent resource conflicts.'
      ],
      traps: 'Trap: Thinking a cache fetches just the single requested byte. Caches ALWAYS transfer a full cache line!'
    }
  },

  // ========================================================================
  // 7.2 DIRECT MAPPING
  // ========================================================================
  'm3-direct-mapping': {
    id: 'm3-direct-mapping',
    module: 'module3',
    number: '7.2',
    title: 'Direct-Mapped Cache',
    subtitle: 'Tag, index, and block offset breakdown; fixed line mapping and conflict misses',
    badge: 'Cache Mapping',
    badgeColor: 'cyan',

    understand: {
      headline: 'Mapping Each Memory Block to Exactly One Cache Line',
      body: `In a **Direct-Mapped Cache**, each block of main memory maps to **exactly one specific cache line**. The mapping is determined by modulo arithmetic:

$$\\text{Cache Line} = (\\text{Memory Block Number}) \\pmod{\\text{Total Cache Lines}}$$

### Address Decomposition
To look up an address, the binary address is partitioned into three fields:
1. **Tag**: Upper bits stored in the cache line directory to distinguish which memory block currently occupies the line.
2. **Index (Line Number)**: Identifies which specific cache line to inspect ($2^{\\text{Index bits}} = \\text{Number of lines}$).
3. **Block (Word) Offset**: Identifies the exact byte or word inside the block ($2^{\\text{Offset bits}} = \\text{Block size in bytes}$).

### Hardware Check
1. The CPU extracts the **Index** bits and selects that single cache line.
2. It checks: Is \`Valid = 1\` AND does \`Stored Tag == Address Tag\`?
   - If **YES**: **HIT!** The Word Offset extracts the desired data.
   - If **NO**: **MISS!** The existing line is evicted, and the new block is loaded.

### Pros and Cons
- **Advantages**: Simple hardware; very fast lookup; no replacement algorithm needed (only 1 candidate line!).
- **Disadvantages**: Suffers heavily from **Conflict Misses** (thrashing). If two frequently accessed variables happen to map to the same line index, they will repeatedly kick each other out even if the rest of the cache is completely empty!`,
      keyTakeaways: [
        'Each memory block maps to only one line: Line = Block mod Lines.',
        'Address split: [Tag | Index | Offset].',
        'Direct mapping is fast and simple but vulnerable to conflict thrashing.'
      ]
    },

    visualize: {
      diagramType: 'direct-cache-sim',
      title: 'Interactive Direct-Mapped Cache Simulator',
      description: 'Configure cache lines and block size. Submit memory addresses and watch tag/index extraction, line lookups, hits, and conflict evictions.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Cache Configuration',
        desc: 'Consider a cache with 4 lines (Lines 0, 1, 2, 3) and 16-byte blocks (Offset = 4 bits, Index = 2 bits).'
      },
      {
        step: 2,
        title: 'Access Address 0010H (Block 1)',
        desc: 'Index = 1, Tag = 00H. Line 1 is empty (Valid=0) → MISS. Block 1 is loaded into Line 1 with Tag 00H.'
      },
      {
        step: 3,
        title: 'Access Address 0050H (Block 5)',
        desc: '5 mod 4 = Line 1. Tag = 01H. Line 1 has Tag 00H → CONFLICT MISS! Block 1 is evicted, Block 5 replaces it.'
      },
      {
        step: 4,
        title: 'Re-access Address 0010H',
        desc: 'Maps back to Line 1. Tag 01H ≠ 00H → CONFLICT MISS again! This ping-pong thrashing illustrates the direct mapping weakness.'
      }
    ],

    workedExample: {
      problem: 'A computer has a 16-bit address space. The direct-mapped cache has 64 lines, and each block is 16 bytes. Calculate the number of bits in: (a) Offset, (b) Index, (c) Tag.',
      solution: [
        'Total Address Bits = 16.',
        'Part (a): Block size = 16 bytes = 2^4 bytes → Offset = 4 bits.',
        'Part (b): Number of cache lines = 64 lines = 2^6 lines → Index = 6 bits.',
        'Part (c): Tag bits = Total - Index - Offset = 16 - 6 - 4 = 6 bits.',
        'Address Layout: [Tag: 6 bits | Index: 6 bits | Offset: 4 bits].'
      ],
      verifiedStamp: 'EXACT BITS'
    },

    quiz: {
      question: 'In a direct-mapped cache, what causes a "conflict miss"?',
      options: [
        'The cache is completely 100% full.',
        'Two or more active memory blocks map to the exact same cache line index, evicting each other.',
        'The address is invalid or outside RAM boundaries.',
        'The replacement algorithm picks the wrong victim line.'
      ],
      correctIndex: 1,
      explanation: 'Conflict misses (or collision misses) occur in direct-mapped and set-associative caches when multiple memory blocks map to the same set/line index, repeatedly displacing each other even when other lines in the cache are empty.'
    },

    revise: {
      examTips: [
        'Formula: Offset bits = log2(Block Size in bytes); Index bits = log2(Total Cache Lines); Tag = Address bits - Index - Offset.',
        'Direct mapping does NOT require LRU or FIFO replacement policies because there is zero choice of where to place a block.'
      ],
      traps: 'Trap: Using total cache size instead of line count for index bits. Index is log2(Number of LINES), not cache bytes!'
    }
  },

  // ========================================================================
  // 7.3 ASSOCIATIVE MAPPING
  // ========================================================================
  'm3-associative-mapping': {
    id: 'm3-associative-mapping',
    module: 'module3',
    number: '7.3',
    title: 'Fully Associative Mapping',
    subtitle: 'Any block in any line; parallel tag comparison, valid bits, and replacement',
    badge: 'Maximum Flexibility',
    badgeColor: 'purple',

    understand: {
      headline: 'Placing Any Memory Block into Any Available Cache Line',
      body: `In a **Fully Associative Cache**, there are no line index restrictions. Any block of main memory can be placed into **any available cache line**.

### Address Decomposition
Because there is no index, the address is partitioned into only **two fields**:
1. **Tag**: All upper address bits except the block offset.
2. **Block Offset**: Lower bits pointing to the specific byte/word inside the block.

### Hardware Tag Comparison
When the CPU requests an address:
1. It compares the address **Tag against the tags of ALL cache lines simultaneously in parallel** using associative hardware comparator circuits.
2. If any valid line matches: **HIT!**
3. If no line matches: **MISS!** If an empty line exists, the block is loaded there. If all lines are full, a **replacement algorithm (such as LRU or FIFO)** selects a victim line to evict.

### Pros and Cons
- **Advantages**: Completely eliminates conflict misses! Maximum possible hit ratio for a given cache size.
- **Disadvantages**: High hardware cost and power consumption. Comparing tags against dozens or hundreds of lines in parallel requires complex comparator gates and slows down cycle time. Generally used only for small caches (e.g. TLB).`,
      keyTakeaways: [
        'Address split: only [Tag | Offset] (zero index bits!).',
        'Tags of all cache lines are compared simultaneously in parallel.',
        'Zero conflict misses, but high hardware cost limits it to small caches like the TLB.'
      ]
    },

    visualize: {
      diagramType: 'associative-cache-sim',
      title: 'Interactive Fully Associative Cache Simulator',
      description: 'Observe parallel tag comparison across all lines. See blocks fill empty slots first, then trigger replacement policies when full.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Empty Cache State',
        desc: 'Fully associative cache with 4 lines. All Valid bits = 0.'
      },
      {
        step: 2,
        title: 'Insert Blocks 1, 5, 9, 13',
        desc: 'Each block is placed in lines 0, 1, 2, 3 successively. In direct mapping, they would have conflicted on line 1!'
      },
      {
        step: 3,
        title: 'Access Block 17 (Cache is Full)',
        desc: 'All 4 comparator lines report mismatch. A miss occurs.'
      },
      {
        step: 4,
        title: 'Execute LRU Replacement',
        desc: 'Line with the oldest access time is selected as the victim, evicted, and replaced with Block 17.'
      }
    ],

    workedExample: {
      problem: 'A computer system uses 32-bit addresses. The fully associative cache has 512 lines and each block is 64 bytes. Calculate the number of bits in the Tag and Offset fields.',
      solution: [
        'Total Address Bits = 32.',
        'Block Size = 64 bytes = 2^6 bytes → Offset = 6 bits.',
        'In Fully Associative cache, Index bits = 0 (no index).',
        'Tag bits = 32 - Offset = 32 - 6 = 26 bits.',
        'Address Layout: [Tag: 26 bits | Offset: 6 bits].'
      ],
      verifiedStamp: 'VERIFIED ✓'
    },

    quiz: {
      question: 'Why does a fully associative cache NOT have an "Index" field in its address bit breakdown?',
      options: [
        'Because memory blocks are stored in DRAM instead of SRAM.',
        'Because any memory block can reside in any cache line, so no specific line index is pre-assigned.',
        'Because fully associative caches only support 8-bit processors.',
        'Because the tag register performs automatic index generation.'
      ],
      correctIndex: 1,
      explanation: 'In fully associative mapping, a memory block is free to occupy any cache line. Since there is no predefined subset of lines to examine, an index field is unnecessary; the CPU compares the tag against all lines simultaneously.'
    },

    revise: {
      examTips: [
        'Address structure: [Tag | Offset]. There is NO index field.',
        'Fully associative mapping gives the lowest miss rate, but requires N hardware comparators for N lines.'
      ],
      traps: 'Trap: Calculating index bits for a fully associative cache! Always remember Index = 0 bits.'
    }
  },

  // ========================================================================
  // 7.4 SET-ASSOCIATIVE MAPPING
  // ========================================================================
  'm3-set-associative': {
    id: 'm3-set-associative',
    module: 'module3',
    number: '7.4',
    title: 'Set-Associative Mapping',
    subtitle: 'K-way associativity, sets and ways, set index, tag, and balanced hardware design',
    badge: 'Industry Standard',
    badgeColor: 'coral',

    understand: {
      headline: 'The Golden Compromise: Balancing Speed, Cost, and Hit Rate',
      body: `**Set-Associative Mapping** combines the best attributes of Direct Mapping and Fully Associative Mapping. It is the architecture used by almost all real-world microprocessors (including the Intel Pentium, Core, and Xeon series).

### How Sets and Ways Work
The cache lines are grouped into **$S$ Sets**, where each set contains **$K$ Lines (called Ways)**:
- This is referred to as a **$K$-way Set-Associative Cache**.
- A memory block maps to **one specific Set** using modulo arithmetic:
  $$\\text{Set Index} = (\\text{Block Number}) \\pmod{\\text{Total Sets}}$$
- Inside that set, the block can be placed in **any of the $K$ ways**.

### Address Decomposition
1. **Tag**: Upper bits compared in parallel only against the $K$ ways of the selected set.
2. **Set Index**: Identifies which specific set to inspect ($2^{\\text{Index bits}} = \\text{Number of Sets}$).
3. **Block Offset**: Identifies byte/word inside the line ($2^{\\text{Offset bits}} = \\text{Block size}$).

### Comparison Spectrum
- If $K = 1$: **Direct Mapped Cache** (1 way per set; $S = \\text{Total lines}$).
- If $K = \\text{Total lines}$: **Fully Associative Cache** (1 set containing all lines).
- In a **2-Way Set-Associative Cache** (like the original Pentium L1 cache), only 2 comparators are needed per lookup, drastically reducing hardware complexity while eliminating the majority of conflict misses.`,
      keyTakeaways: [
        'A block maps to a specific set, but can sit in any way inside that set.',
        'Address split: [Tag | Set Index | Offset].',
        'Number of Sets = Total Lines / K (where K is ways).'
      ]
    },

    visualize: {
      diagramType: 'set-associative-sim',
      title: 'Interactive 2-Way / 4-Way Set-Associative Cache Simulator',
      description: 'Switch between 2-Way and 4-Way associativity. Enter addresses to see which set lights up and watch tag matching inside the candidate ways.'
    },

    stepByStep: [
      {
        step: 1,
        title: '2-Way Set Associative Setup',
        desc: '8 lines divided into 4 sets (Set 0, 1, 2, 3), each with Way 0 and Way 1.'
      },
      {
        step: 2,
        title: 'Access Block 1 and Block 5',
        desc: 'Both blocks map to Set 1 (1 mod 4 = 1; 5 mod 4 = 1). In direct mapping, they conflicted. Here, Block 1 occupies Way 0 and Block 5 occupies Way 1. BOTH HIT!'
      },
      {
        step: 3,
        title: 'Access Block 9 (Set 1 is Full)',
        desc: 'Block 9 also maps to Set 1. Since both ways are occupied, LRU selects the least recently used way in Set 1 for eviction.'
      }
    ],

    workedExample: {
      problem: 'A 4-way set-associative cache has a total capacity of 32 KiB. The block size is 32 bytes, and the physical address is 32 bits. Calculate: (a) Total cache lines, (b) Number of sets, (c) Bits for Offset, Set Index, and Tag.',
      solution: [
        'Part (a): Total lines = Total Cache Size / Block Size = 32,768 / 32 = 1024 lines.',
        'Part (b): Number of sets = Total lines / Associativity = 1024 / 4 = 256 sets.',
        'Part (c): Address Bits:',
        '  Offset bits = log2(32 bytes) = 5 bits.',
        '  Set Index bits = log2(256 sets) = 8 bits.',
        '  Tag bits = 32 - Index - Offset = 32 - 8 - 5 = 19 bits.',
        'Address Layout: [Tag: 19 bits | Set Index: 8 bits | Offset: 5 bits].'
      ],
      verifiedStamp: 'EXAM CLASSIC'
    },

    quiz: {
      question: 'A 2-way set-associative cache has 64 total cache lines. How many sets does this cache contain?',
      options: [
        '128 sets',
        '64 sets',
        '32 sets',
        '16 sets'
      ],
      correctIndex: 2,
      explanation: 'Number of sets = Total Lines / Associativity (Ways) = 64 lines / 2 ways = 32 sets. (Index bits = log2(32) = 5 bits).'
    },

    revise: {
      examTips: [
        'Always calculate Sets = Total Lines / K before computing index bits.',
        'Pentium L1 cache uses 8 KB 2-way set-associative I-cache and 8 KB 2-way set-associative D-cache with 32-byte lines.'
      ],
      traps: 'Trap: Using total lines to find index bits in set-associative caches. You MUST divide by the number of ways first!'
    }
  },

  // ========================================================================
  // 7.5 CACHE REPLACEMENT ALGORITHMS
  // ========================================================================
  'm3-replacement-algos': {
    id: 'm3-replacement-algos',
    module: 'module3',
    number: '7.5',
    title: 'Cache Replacement Algorithms',
    subtitle: 'FIFO, LRU, LFU, and Random policies; victim selection and trace comparison',
    badge: 'Algorithms',
    badgeColor: 'yellow',

    understand: {
      headline: 'Choosing Which Victim Block to Evict When Cache is Full',
      body: `When a cache miss occurs in an associative or set-associative cache and all candidate ways in the set are full, the CPU must evict an existing block to make room. The **replacement algorithm** determines which block is sacrificed.

### Primary Replacement Policies
1. **LRU (Least Recently Used)**:
   - **Rule**: Evicts the block that has not been accessed for the longest period of time.
   - **Rationale**: Based on temporal locality—if a block was used recently, it will likely be used again.
   - **Implementation**: Requires hardware timestamp counters or age bits (e.g. Pseudo-LRU bit trees in Intel processors).
2. **FIFO (First-In, First-Out)**:
   - **Rule**: Evicts the block that has been in the cache for the longest time, regardless of how recently it was accessed.
   - **Implementation**: Simple round-robin circular pointer per set. Lower hardware cost, but can evict heavily used variables.
3. **Random Replacement**:
   - **Rule**: Randomly chooses a victim way using a pseudo-random number generator.
   - **Implementation**: Very low hardware complexity. Surprisingly effective in high-associativity caches (8-way or 16-way).
4. **LFU (Least Frequently Used)**:
   - **Rule**: Evicts the block with the lowest access count.
   - **Drawback**: Old blocks that accumulated high counts early can stay forever even if no longer needed.`,
      keyTakeaways: [
        'LRU exploits temporal locality and generally delivers the highest hit rates.',
        'FIFO evicts the oldest arrived block; simple to build but can suffer from poor hit rates.',
        'Intel Pentium uses Pseudo-LRU (PLRU) tracking bits to approximate true LRU at lower circuit cost.'
      ]
    },

    visualize: {
      diagramType: 'replacement-policy-comparator-sim',
      title: 'Interactive Replacement Policy Benchmark (FIFO vs LRU)',
      description: 'Run identical memory access streams through FIFO and LRU side by side. Compare hit counts, misses, and victim selection in real time.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Access Stream Setup',
        desc: 'Consider a 3-block cache and reference sequence: 1, 2, 3, 2, 4.'
      },
      {
        step: 2,
        title: 'Initial Fills: 1, 2, 3',
        desc: 'Blocks 1, 2, and 3 are loaded into empty cache slots (3 compulsory misses).'
      },
      {
        step: 3,
        title: 'Hit on Block 2',
        desc: 'Block 2 is accessed: HIT! Under LRU, Block 2 is refreshed to most-recently-used. Under FIFO, arrival age is unchanged.'
      },
      {
        step: 4,
        title: 'Access Block 4 (Miss & Eviction)',
        desc: 'FIFO evicts Block 1 (oldest arrival). LRU evicts Block 1 (least recently accessed). If stream next requested 2, LRU hits while FIFO would risk evicting 2!'
      }
    ],

    workedExample: {
      problem: 'Trace an access sequence: 0, 1, 2, 0, 1, 3, 0, 3, 1, 2 for a fully associative cache with 3 lines using LRU. Determine total hits and misses.',
      solution: [
        'Access 0: Miss [0, -, -]',
        'Access 1: Miss [0, 1, -]',
        'Access 2: Miss [0, 1, 2]',
        'Access 0: HIT!  [1, 2, 0] (0 refreshed)',
        'Access 1: HIT!  [2, 0, 1] (1 refreshed)',
        'Access 3: Miss (evict 2): [0, 1, 3]',
        'Access 0: HIT!  [1, 3, 0]',
        'Access 3: HIT!  [1, 0, 3]',
        'Access 1: HIT!  [0, 3, 1]',
        'Access 2: Miss (evict 0): [3, 1, 2]',
        'Total Accesses: 10. Hits: 5. Misses: 5. Hit Ratio: 50%.'
      ],
      verifiedStamp: 'TRACE VERIFIED'
    },

    quiz: {
      question: 'Which cache replacement policy evicts the block that has resided in cache the longest, regardless of how often or how recently it was accessed?',
      options: [
        'LRU (Least Recently Used)',
        'FIFO (First-In, First-Out)',
        'LFU (Least Frequently Used)',
        'Random Replacement'
      ],
      correctIndex: 1,
      explanation: 'FIFO (First-In, First-Out) tracks strictly the arrival order of blocks. The earliest arrived block is evicted first, ignoring recent hits.'
    },

    revise: {
      examTips: [
        'In university trace questions, always maintain an explicit "recency order" column to track LRU states clearly.',
        'Belady\'s Anomaly (where increasing cache size increases misses) can occur in FIFO, but NEVER in LRU (because LRU is a stack algorithm).'
      ],
      traps: 'Trap: Forgetting to refresh the recency order during a HIT in LRU. A hit MUST make that block the most recently used!'
    }
  },

  // ========================================================================
  // 7.6 CACHE PERFORMANCE & AMAT
  // ========================================================================
  'm3-cache-perf': {
    id: 'm3-cache-perf',
    module: 'module3',
    number: '7.6',
    title: 'Cache Performance & AMAT Optimization',
    subtitle: 'Average Memory Access Time formula, the 3 C\'s of cache misses, and trade-offs',
    badge: 'Performance Formula',
    badgeColor: 'coral',

    understand: {
      headline: 'Quantifying Memory Subsystem Performance',
      body: `Cache memory performance determines whether a multi-GHz processor runs at full speed or sits idle waiting for memory bus cycles.

### The AMAT Equation
The fundamental metric for memory subsystem performance is **Average Memory Access Time (AMAT)**:

$$\\text{AMAT} = \\text{Hit Time} + (\\text{Miss Rate} \\times \\text{Miss Penalty})$$

Where:
- **Hit Time ($t_{\\text{hit}}$)**: Time to deliver data on a cache hit (typically 1–4 cycles for L1).
- **Miss Rate ($M$)**: Fraction of memory accesses that miss ($M = 1 - \\text{Hit Rate}$).
- **Miss Penalty ($t_{\\text{miss}}$)**: Time spent retrieving data from slower memory.

For a multi-level cache system (L1 and L2):
$$\\text{AMAT} = t_{\\text{hit, L1}} + M_{\\text{L1}} \\times (t_{\\text{hit, L2}} + M_{\\text{L2}} \\times t_{\\text{DRAM}})$$

### The 3 C's of Cache Misses
Hill and Smith classified all cache misses into **The 3 C's**:
1. **Compulsory Misses (Cold Misses)**: Occur on the very first access to a memory block. Unavoidable unless hardware prefetching is used.
2. **Capacity Misses**: Occur because physical cache capacity cannot hold all blocks needed by the active working set. Reduced by increasing cache size.
3. **Conflict Misses (Collision Misses)**: Occur in direct-mapped or set-associative caches when multiple blocks compete for the same set index. Reduced by increasing associativity (ways).`,
      keyTakeaways: [
        'AMAT = Hit Time + (Miss Rate × Miss Penalty).',
        'The 3 C\'s of misses: Compulsory (first time), Capacity (cache too small), Conflict (set collision).',
        'Multi-level caches reduce miss penalty by inserting L2 and L3 between L1 and DRAM.'
      ]
    },

    visualize: {
      diagramType: 'amat-calculator-sim',
      title: 'Interactive AMAT Performance & Trade-Off Calculator',
      description: 'Adjust sliders for Hit Time, Miss Rate, and Miss Penalty. Watch the real-time calculation and effective CPU performance breakdown.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'Baseline System Parameters',
        desc: 'Hit Time = 1 ns (1 clock cycle). Miss Rate = 5% (0.05). Miss Penalty = 100 ns.'
      },
      {
        step: 2,
        title: 'Calculate AMAT',
        desc: 'AMAT = 1 ns + (0.05 × 100 ns) = 1 ns + 5 ns = 6 ns.'
      },
      {
        step: 3,
        title: 'Evaluate Performance Impact',
        desc: 'Even with a 95% hit rate, the 5% misses increased the effective access time from 1 ns to 6 ns (a 6× slowdown!).'
      },
      {
        step: 4,
        title: 'Optimize with L2 Cache',
        desc: 'Add L2 cache with 10 ns latency and 90% hit rate. Miss penalty drops from 100 ns to 19 ns. AMAT becomes 1.95 ns!'
      }
    ],

    workedExample: {
      problem: 'A processor has a CPU cycle time of 1 ns. L1 cache hit time is 1 cycle. The miss penalty to main memory is 80 cycles. If the L1 miss rate is 4%, calculate: (a) AMAT in cycles, (b) AMAT in nanoseconds.',
      solution: [
        'Given: Hit Time = 1 cycle, Miss Rate = 0.04, Miss Penalty = 80 cycles.',
        'Part (a): AMAT = Hit Time + (Miss Rate × Miss Penalty)',
        '  AMAT = 1 + (0.04 × 80) = 1 + 3.2 = 4.2 cycles.',
        'Part (b): Cycle time = 1 ns → AMAT = 4.2 × 1 ns = 4.2 ns.'
      ],
      verifiedStamp: 'EXACT FORMULA'
    },

    quiz: {
      question: 'Which of the "3 C\'s" of cache misses cannot be avoided even if the cache has infinite storage capacity and fully associative mapping?',
      options: [
        'Capacity Misses',
        'Conflict Misses',
        'Compulsory (Cold) Misses',
        'Coherence Misses'
      ],
      correctIndex: 2,
      explanation: 'Compulsory misses (also called cold-start misses) occur the very first time a memory block is requested by the processor. Even an infinitely large cache starts empty and must experience compulsory misses on first references.'
    },

    revise: {
      examTips: [
        'Always state consistent units (either all in nanoseconds or all in clock cycles) when calculating AMAT.',
        'Remember that increasing cache block size reduces compulsory misses (spatial locality), but can increase conflict misses if total cache capacity is fixed.'
      ],
      traps: 'Trap: Forgetting the Hit Time term in AMAT! AMAT is Hit Time + (Miss Rate × Penalty), NOT just Miss Rate × Penalty.'
    }
  },

  // ========================================================================
  // 7.7 MEMORY HIERARCHY & SYSTEM OPTIMIZATION
  // ========================================================================
  'm3-memory-hierarchy': {
    id: 'm3-memory-hierarchy',
    module: 'module3',
    number: '7.7',
    title: 'Memory Hierarchy & System Interaction',
    subtitle: 'Bus transactions, cache write policies (Write-Through vs Write-Back), and coherence',
    badge: 'System Integration',
    badgeColor: 'mint',

    understand: {
      headline: 'Integrating Cache, CPU, and System Memory Buses',
      body: `The interaction between cache and system memory requires careful synchronization, especially when writes occur.

### Cache Write Policies
When the CPU writes to a memory location that is cached:
1. **Write-Through**:
   - Data is written **simultaneously to both the cache AND main memory**.
   - *Pros*: Memory is always up-to-date and consistent. Simple design.
   - *Cons*: Slower write speed; saturates system memory bus.
2. **Write-Back (Copy-Back)**:
   - Data is written **only to the cache**. The cache line's **Dirty bit ($D$) is set to 1**.
   - Main memory is only updated when the dirty line is later evicted from cache!
   - *Pros*: Drastically reduces bus traffic and speeds up write operations.
   - *Cons*: Main memory can hold stale data until flush; complex recovery on power failure.

### Write Miss Policies
- **Write Allocate**: On a write miss, the block is fetched into cache, then written to. (Typically paired with Write-Back).
- **No-Write Allocate (Write Around)**: On a write miss, data is written directly to main memory without bringing the block into cache. (Typically paired with Write-Through).`,
      keyTakeaways: [
        'Write-Through writes immediately to both cache and RAM; Write-Back marks a Dirty bit and writes to RAM only upon eviction.',
        'Write-Back significantly reduces memory bus traffic and is standard on modern CPUs.',
        'Intel Pentium L1 data cache uses Write-Back.'
      ]
    },

    visualize: {
      diagramType: 'write-policy-flow',
      title: 'Interactive Write-Through vs Write-Back Flowchart',
      description: 'Trace memory write cycles under Write-Through and Write-Back policies. Watch the dirty bit flip and observe when memory bus writes fire.'
    },

    stepByStep: [
      {
        step: 1,
        title: 'CPU Issues Write Request',
        desc: 'CPU writes value 55AAH to cached address 1000H.'
      },
      {
        step: 2,
        title: 'Write-Back Execution',
        desc: 'Cache line is updated instantly. Line\'s Dirty bit is set to 1. Zero memory bus traffic generated!'
      },
      {
        step: 3,
        title: 'Subsequent Read/Write Hits',
        desc: 'All further accesses to 1000H happen at full L1 speed.'
      },
      {
        step: 4,
        title: 'Eviction & Write-Back to DRAM',
        desc: 'Hours later, an eviction occurs. The hardware checks Dirty=1, writes the 64-byte line to DRAM, and clears the line.'
      }
    ],

    workedExample: {
      problem: 'Compare the memory bus traffic for 100 write operations to the same memory address under: (a) Write-Through policy, (b) Write-Back policy with 1 eviction.',
      solution: [
        'Part (a): Write-Through policy:',
        '  Every single write updates main memory directly.',
        '  Total bus writes = 100 bus transactions.',
        'Part (b): Write-Back policy:',
        '  All 100 writes update only the L1 cache line (Dirty bit = 1).',
        '  When the line is finally evicted, a single block write occurs.',
        '  Total bus writes = 1 bus transaction!',
        'Conclusion: Write-Back reduced bus traffic by 99%.'
      ],
      verifiedStamp: '99% EFFICIENCY'
    },

    quiz: {
      question: 'Under a Write-Back cache policy, when is a modified block written back to main memory?',
      options: [
        'Immediately on every write instruction.',
        'Only when the dirty cache line is selected for eviction by the replacement algorithm.',
        'Every clock cycle during instruction decode.',
        'Only when a page fault occurs.'
      ],
      correctIndex: 1,
      explanation: 'In a Write-Back cache, writes modify only the cache line and set its Dirty bit. The line is written to main memory only when it is evicted to make room for a new block.'
    },

    revise: {
      examTips: [
        'Dirty bit (Modified bit) is only needed in Write-Back caches. Write-Through caches never need a dirty bit.',
        'The original Pentium uses a Write-Through policy for its L1 Instruction Cache (since code is read-only) and a MESI-protocol Write-Back policy for its L1 Data Cache.'
      ],
      traps: 'Trap: Claiming Write-Through is faster. Write-Through is actually slower because every write waits for DRAM!'
    }
  }
};
