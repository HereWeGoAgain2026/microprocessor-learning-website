/* ==========================================================================
   CURRICULUM BUNDLE (MODULE II & MODULE III)
   Available globally on window.CURRICULUM
   ========================================================================== */

(function () {
  'use strict';

  window.CURRICULUM = {
    // 4.1 Intro
    'm2-intro': {
      id: 'm2-intro', module: 'module2', number: '4.1', title: 'Introduction to Instruction Sets',
      subtitle: 'Machine instructions, execution cycle, opcodes, operands, and addressing modes',
      badge: 'Core Concept', badgeColor: 'cyan',
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
        sampleInstruction: { mnemonic: 'MOV', destination: 'AX', source: '[BX + SI + 04H]', bytes: '8B 40 04', mode: 'Based Indexed Relative Addressing' }
      },
      stepByStep: [
        { step: 1, title: 'Fetch via CS:IP', desc: 'Bus Interface Unit calculates physical address = CS × 16 + IP, fetches opcode bytes 8B 40 04H, and advances IP by 3 bytes.' },
        { step: 2, title: 'Opcode Decoding', desc: 'The decoder recognizes 8BH as a 16-bit register-memory MOV, with destination AX (register field 000B).' },
        { step: 3, title: 'Effective Address (EA) Calculation', desc: 'The ALU adds Base Register (BX) + Source Index (SI) + 8-bit Displacement (04H) to find memory offset.' },
        { step: 4, title: 'Memory Read & Write-Back to AX', desc: 'BIU reads 16-bit word from DS:EA and deposits the value into accumulator register AX. Flags remain unchanged.' }
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

    // 4.2 Data Movement
    'm2-datamov': {
      id: 'm2-datamov', module: 'module2', number: '4.2', title: 'Data Movement Instructions',
      subtitle: 'MOV, PUSH, POP, XCHG, IN, OUT, LEA, LDS, LES, LAHF, and SAHF',
      badge: 'Essential', badgeColor: 'yellow',
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
        { step: 1, title: 'Initial State', desc: 'AX = 1234H, BX = 5678H, SP = 0100H, SS = 2000H. Stack top is empty.' },
        { step: 2, title: 'Execute "PUSH AX"', desc: 'SP is decremented by 2 (SP = 00FEH). Word 1234H is written to physical address SS:SP (20000H + 00FEH = 200FEH).' },
        { step: 3, title: 'Execute "MOV AX, BX"', desc: 'Content of BX (5678H) is copied into AX. Now AX = 5678H, BX = 5678H. SP remains 00FEH. Flags unaffected.' },
        { step: 4, title: 'Execute "POP BX"', desc: 'Word at SS:00FEH (1234H) is loaded into BX. SP is incremented by 2 back to 0100H. Result: BX = 1234H, AX = 5678H.' }
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
        options: ['MOV AX, [BX + DI]', 'PUSH CS', 'MOV DS, 2000H', 'XCHG AH, AL'],
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

    // 4.3 Binary Arithmetic
    'm2-arith': {
      id: 'm2-arith', module: 'module2', number: '4.3', title: 'Binary Arithmetic Instructions',
      subtitle: 'ADD, ADC, SUB, SBB, INC, DEC, MUL, IMUL, DIV, IDIV, NEG, CMP, CBW, and CWD',
      badge: 'Critical Math', badgeColor: 'coral',
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
        description: 'Enter 8-bit or 16-bit numbers, select operations, and observe the carry ripple and flag register updates.'
      },
      stepByStep: [
        { step: 1, title: 'Unsigned vs Signed Scenario', desc: 'Consider AL = 7FH (+127 decimal) and BL = 01H (+1 decimal).' },
        { step: 2, title: 'Execute "ADD AL, BL"', desc: 'Binary calculation: 0111 1111B + 0000 0001B = 1000 0000B (80H).' },
        { step: 3, title: 'Examine Unsigned Perspective (CF)', desc: 'There is NO carry out of bit 7. Therefore, Carry Flag CF = 0. The unsigned value 128 is valid.' },
        { step: 4, title: 'Examine Signed Perspective (OF)', desc: 'Adding two positive numbers (+127 and +1) produced a negative result (bit 7 = 1). Hence, Overflow Flag OF = 1!' }
      ],
      workedExample: {
        problem: 'Demonstrate a 32-bit addition of 0012FFFFH and 00050002H using only 16-bit 8086 registers (DX:AX and CX:BX).',
        solution: [
          'Initial Registers: DX:AX = 0012FFFFH, CX:BX = 00050002H',
          'Step 1: Add low words: ADD AX, BX ; FFFFH + 0002H = 10001H -> AX = 0001H, CF = 1.',
          'Step 2: Add high words with carry: ADC DX, CX ; DX = 0012H + 0005H + 1 = 0018H.',
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
          'CF = Carry out of MSB (Unsigned). OF = (Carry into MSB) XOR (Carry out of MSB) (Signed).',
          'CBW sign-extends AL into AX. CWD sign-extends AX into DX:AX.',
          'Division by zero triggers CPU Exception 0 (Divide Error).'
        ],
        traps: 'Trap: Assuming CMP changes the destination register. CMP only updates the FLAGS register!'
      }
    },

    // 4.4 Logical
    'm2-logic': {
      id: 'm2-logic', module: 'module2', number: '4.4', title: 'Logical Instructions & Bit Manipulation',
      subtitle: 'AND, OR, XOR, NOT, TEST, SHL/SAL, SHR, SAR, ROL, ROR, RCL, and RCR',
      badge: 'Bitwise Power', badgeColor: 'purple',
      understand: {
        headline: 'Bit-Level Logic, Masking, Shifts, and Rotates',
        body: `Logical instructions operate on individual bits in parallel, providing low-level bit masking, flag toggling, and high-speed binary scaling.

### Bitwise Boolean Operations
- **\`AND dest, src\`**: Clears bits (masking). Resets CF and OF to 0.
- **\`OR dest, src\`**: Sets specific bits to 1. Resets CF and OF to 0.
- **\`XOR dest, src\`**: Inverts/toggles bits. \`XOR reg, reg\` is the fastest x86 idiom to clear a register to 0.
- **\`NOT op\`**: One's complement bit inversion. **Does NOT affect any flags!**
- **\`TEST dest, src\`**: Performs \`dest AND src\` internally and sets ZF, SF, PF without modifying \`dest\`.

### Shifts vs Rotates
- **Logical Shifts (\`SHL\` / \`SHR\`)**: Fills vacated bits with 0. Outgoing bit drops into CF.
- **Arithmetic Shift Right (\`SAR\`)**: Replicates the original sign bit (MSB), preserving algebraic sign for division by 2.
- **Rotates (\`ROL\` / \`ROR\` / \`RCL\` / \`RCR\`)**: Rotates bits circularly in a closed loop (RCL/RCR include CF in the loop).`,
        keyTakeaways: [
          'XOR AX, AX clears AX to 0 and clears CF/OF in fewer bytes than MOV AX, 0.',
          'SAR preserves the sign bit (MSB), whereas SHR always injects 0 at MSB.',
          'TEST op, mask sets ZF = 1 if all tested bits are 0.'
        ]
      },
      visualize: {
        diagramType: 'bit-shifter-sim',
        title: 'Interactive Bitwise & Shift Lab',
        description: 'Toggle individual bits on and off and observe SAR sign extension and ROL circular rotation.'
      },
      stepByStep: [
        { step: 1, title: 'Inspect Value', desc: 'Assume AL = 1111 0000B (-16 signed decimal, F0H). Carry flag CF = 0.' },
        { step: 2, title: 'Logical Shift Right: SHR AL, 1', desc: 'Bits move right. MSB receives 0. Bit 0 drops into CF. New AL = 0111 1000B (+120).' },
        { step: 3, title: 'Contrast with SAR AL, 1', desc: 'SAR shifts right, replicating MSB (1). New AL = 1111 1000B (-8 decimal). Signed division valid!' }
      ],
      workedExample: {
        problem: 'Write a short 8086 code sequence to test if bit 3 of register BL is 1, and clear bit 7 of BL.',
        solution: [
          'TEST BL, 08H   ; Performs BL AND 00001000B; sets ZF = 0 if bit 3 is set',
          'JNZ Bit3IsSet  ; Jump if bit 3 is active',
          'AND BL, 7FH    ; Clears bit 7 (AND with 01111111B) while preserving other bits'
        ],
        verifiedStamp: 'VERIFIED ✓'
      },
      quiz: {
        question: 'If register AL contains 1000 0000B (-128 decimal), what will AL contain after executing "SAR AL, 2"?',
        options: ['0010 0000B (+32 decimal)', '1110 0000B (-32 decimal)', '1100 0000B (-64 decimal)', '0100 0000B (+64 decimal)'],
        correctIndex: 1,
        explanation: 'SAR replicates the sign bit (1). After 1 shift: 1100 0000B (-64). After 2 shifts: 1110 0000B (-32).'
      },
      revise: {
        examTips: ['NOT does NOT affect flags, while NEG modifies all status flags.', 'Shifts by count > 1 on 8086 must place count into CL.'],
        traps: 'Trap: Confusing ROL with RCL. RCL includes the Carry Flag as an active bit stage.'
      }
    },

    // 4.5 Control Transfer
    'm2-control': {
      id: 'm2-control', module: 'module2', number: '4.5', title: 'Control Transfer Instructions',
      subtitle: 'JMP, conditional jumps, CALL, RET, LOOP, INT, and IRET',
      badge: 'Program Flow', badgeColor: 'cyan',
      understand: {
        headline: 'Altering Sequential Program Execution in x86',
        body: `Control transfer instructions alter sequential flow by updating the Instruction Pointer (\`IP\`/\`EIP\`) and optionally Code Segment (\`CS\`).

### Classifications
- **Near Jump**: Branches within the same code segment; updates only \`IP\`.
- **Far Jump**: Branches across segments; reloads both \`CS\` and \`IP\`.
- **Conditional Jumps**: Branch based on flag states:
  - *Unsigned*: \`JA\` (Above, \`CF=0 & ZF=0\`), \`JB\` (Below, \`CF=1\`).
  - *Signed*: \`JG\` (Greater, \`ZF=0 & SF=OF\`), \`JL\` (Less, \`SF≠OF\`).
- **CALL and RET**: \`CALL\` pushes return address to stack; \`RET\` pops address back to \`IP\`.
- **LOOP**: Decrements \`CX\`; branches if \`CX ≠ 0\`.
- **INT and IRET**: \`INT n\` pushes \`FLAGS\`, \`CS\`, and \`IP\` to stack. \`IRET\` pops them in reverse order.`,
        keyTakeaways: [
          'Near jumps update IP; Far jumps update CS:IP.',
          'JA/JB are for unsigned values; JG/JL are for signed values.',
          'INT pushes FLAGS, CS, IP to stack (3 words); CALL near pushes only IP (1 word).'
        ]
      },
      visualize: {
        diagramType: 'control-flow-sim',
        title: 'Interactive Assembly Flow & Stack Frame Visualizer',
        description: 'Observe stack frames during CALL and RET, and condition checks for jumps.'
      },
      stepByStep: [
        { step: 1, title: 'CALL Subroutine', desc: 'CPU encounters CALL at IP=1000H. Return address 1003H is pushed onto the stack (SP decrements).' },
        { step: 2, title: 'Execute Procedure', desc: 'IP jumps to target offset 2500H.' },
        { step: 3, title: 'RET Instruction', desc: '1003H is popped off stack into IP; SP increments. Normal execution resumes.' }
      ],
      workedExample: {
        problem: 'Determine if jump is taken: MOV AL, 0F0H; CMP AL, 05H; JL Label1 vs JB Label1.',
        solution: [
          'CMP AL, 05H performs: 0F0H - 05H = 0EBH.',
          'Unsigned (JB): 240 > 5, no borrow occurs -> CF = 0. JB checks CF=1 -> JB IS NOT TAKEN.',
          'Signed (JL): 0F0H = -16, 05H = +5. -16 < +5 -> SF=1, OF=0 (SF ≠ OF). JL IS TAKEN!'
        ],
        verifiedStamp: 'EXAM CLASSIC'
      },
      quiz: {
        question: 'During the execution of an 8086 software interrupt instruction "INT 21H", what exact items are pushed onto the stack by the CPU, and in what order?',
        options: ['First IP, then CS, and finally FLAGS.', 'First FLAGS, then CS, and finally IP.', 'Only CS and IP.', 'AX, BX, CX, DX.'],
        correctIndex: 1,
        explanation: 'CPU pushes: (1) FLAGS register, (2) Code Segment CS, (3) Instruction Pointer IP. IRET pops them in reverse order.'
      },
      revise: {
        examTips: ['LOOP uses CX as implicit counter.', 'Conditional jumps in 8086 are limited to -128 to +127 bytes.'],
        traps: 'Trap: Writing conditional far jumps on 8086. Conditional jumps cannot jump across segments!'
      }
    },

    // 4.6 String
    'm2-string': {
      id: 'm2-string', module: 'module2', number: '4.6', title: 'String and Character Translation Instructions',
      subtitle: 'MOVS, LODS, STOS, CMPS, SCAS, REP prefixes, and XLAT',
      badge: 'Block Memory', badgeColor: 'mint',
      understand: {
        headline: 'High-Speed Block Memory Transfers and Table Lookups',
        body: `String instructions process contiguous blocks of memory with hardware looping and auto-indexing.

### Architectural Pointers
- **Source**: Addressed by \`DS:SI\`.
- **Destination**: Addressed strictly by \`ES:DI\` (**no segment override permitted!**).
- **Direction Flag (\`DF\`)**:
  - \`DF = 0\` (\`CLD\`): Auto-increment pointers forward.
  - \`DF = 1\` (\`STD\`): Auto-decrement pointers backward.

### XLAT (Translate)
Performs lookup table translation: \`AL ← DS:[BX + AL]\`. BX points to the table base, and AL holds the index.`,
        keyTakeaways: [
          'Source string is DS:SI; Destination is ALWAYS ES:DI.',
          'CLD = increment pointers; STD = decrement pointers.',
          'XLAT translates bytes via table: AL ← [BX + AL].'
        ]
      },
      visualize: {
        diagramType: 'string-memory-array-sim',
        title: 'Interactive String Pointer & Memory Array Runner',
        description: 'Watch SI and DI pointers move across memory buffers during REP MOVSB operations.'
      },
      stepByStep: [
        { step: 1, title: 'Setup', desc: 'Source at DS:1000H, Destination at ES:2000H, CX=5, DF=0 (CLD).' },
        { step: 2, title: 'REP Cycle', desc: 'Byte is transferred from [DS:SI] to [ES:DI]. SI and DI increment, CX decrements.' },
        { step: 3, title: 'Finish', desc: 'CX reaches 0; block transfer completes.' }
      ],
      workedExample: {
        problem: 'Translate BCD digit in AL (e.g. 4) to 7-segment display code using XLAT.',
        solution: [
          'TABLE DB 3FH, 06H, 5BH, 4FH, 66H, 6DH, 7DH, 07H, 7FH, 6FH',
          'LEA BX, TABLE  ; BX points to table',
          'MOV AL, 04H    ; Digit 4',
          'XLAT           ; AL receives TABLE[4] = 66H'
        ],
        verifiedStamp: 'VERIFIED ✓'
      },
      quiz: {
        question: 'Which segment register MUST be used to address the destination memory operand in 8086 string operations?',
        options: ['Data Segment (DS)', 'Stack Segment (SS)', 'Extra Segment (ES) — no override permitted', 'Code Segment (CS)'],
        correctIndex: 2,
        explanation: 'Destination string is strictly bound to ES:DI in x86 hardware. No segment overrides are allowed on the destination.'
      },
      revise: {
        examTips: ['Always issue CLD before string operations.', 'XLAT takes no explicit operands in machine code.'],
        traps: 'Trap: Forgetting to initialize ES before string instructions!'
      }
    },

    // 4.7 Flags
    'm2-flags': {
      id: 'm2-flags', module: 'module2', number: '4.7', title: 'Flag Control Instructions & Architecture',
      subtitle: 'CLC, STC, CMC, CLD, STD, CLI, STI, PUSHF, POPF, and 16-bit FLAGS register',
      badge: 'Status & Control', badgeColor: 'yellow',
      understand: {
        headline: 'The Microprocessor Status & Control Flag Register',
        body: `The 8086 \`FLAGS\` register contains 9 active flags:
- **6 Status Flags**: CF (Carry), PF (Parity), AF (Aux Carry), ZF (Zero), SF (Sign), OF (Overflow).
- **3 Control Flags**: TF (Trap debug), IF (Interrupt enable), DF (Direction).

### Flag Instructions
- Carry: \`CLC\` (0), \`STC\` (1), \`CMC\` (toggle).
- Direction: \`CLD\` (0, inc), \`STD\` (1, dec).
- Interrupt: \`CLI\` (disable), \`STI\` (enable).
- Stack: \`PUSHF\` and \`POPF\`.`,
        keyTakeaways: [
          'Status flags reflect ALU results; Control flags direct CPU behavior.',
          'CLI and STI control the maskable INTR pin, not NMI.',
          'PUSHF and POPF allow software to inspect or set any flag.'
        ]
      },
      visualize: {
        diagramType: 'flags-register-sim',
        title: 'Interactive 16-Bit FLAGS Register Explorer',
        description: 'Inspect the bit layout of the FLAGS register and observe flag modifications.'
      },
      stepByStep: [
        { step: 1, title: 'Initial Word', desc: 'FLAGS = 0002H (bit 1 always 1).' },
        { step: 2, title: 'Execute STC', desc: 'Carry flag Bit 0 becomes 1; FLAGS = 0003H.' },
        { step: 3, title: 'Execute STD', desc: 'Direction flag Bit 10 becomes 1.' }
      ],
      workedExample: {
        problem: 'Determine status flags after executing: MOV AL, 50H; SUB AL, 50H.',
        solution: ['50H - 50H = 00H.', 'ZF = 1 (result is 0).', 'SF = 0 (MSB is 0).', 'CF = 0 (no borrow).', 'OF = 0 (no overflow).', 'PF = 1 (even parity).'],
        verifiedStamp: 'VERIFIED ✓'
      },
      quiz: {
        question: 'Which of the following microprocessor flags CANNOT be modified directly by a dedicated 1-byte instruction like CLC or CLI?',
        options: ['Carry Flag (CF)', 'Direction Flag (DF)', 'Interrupt Flag (IF)', 'Zero Flag (ZF)'],
        correctIndex: 3,
        explanation: 'There is no "CLZ" or "STZ" instruction for the Zero Flag. ZF is modified through arithmetic/logic operations or POPF.'
      },
      revise: {
        examTips: ['Status: CF, PF, AF, ZF, SF, OF. Control: TF, IF, DF.'],
        traps: 'Trap: Assuming CLI disables all interrupts. Non-Maskable Interrupts (NMI) cannot be disabled by CLI!'
      }
    },

    // 5.0 Self-Study 8086 vs 80386DX
    'm2-arch-compare': {
      id: 'm2-arch-compare', module: 'module2', number: '5.0', title: 'Self-Study: Intel 8086 vs 80386DX Architecture',
      subtitle: '16-bit vs 32-bit registers, Real Mode vs Protected Mode, and memory capabilities',
      badge: 'Self-Study Master', badgeColor: 'purple',
      understand: {
        headline: 'Architectural Evolution from 16-Bit Real Mode to 32-Bit Protected Mode',
        body: `The transition from 8086 to 80386DX evolved the architecture into a full 32-bit multitasking virtual-memory platform.

### Core Differences
- **Address Bus**: 8086 has 20 bits (1 MB); 80386DX has 32 bits (4 GB).
- **Data Bus**: 8086 has 16 bits; 80386DX has 32 bits.
- **Registers**: EAX, EBX, ECX, EDX, ESI, EDI, ESP, EBP (32 bits).
- **Segments**: Added \`FS\` and \`GS\`.
- **Modes**: Real Mode, Protected Mode (with GDT/LDT descriptors and Privilege Rings 0–3), and Virtual 8086 Mode.
- **Paging**: 80386DX contains an on-chip hardware paging unit (4 KiB pages).`,
        keyTakeaways: [
          '8086 address space: 1 MB; 80386DX address space: 4 GB.',
          '80386DX added FS and GS segment registers.',
          '80386DX introduced hardware two-level paging.'
        ]
      },
      visualize: {
        diagramType: 'cpu-selector-comparison',
        title: 'Interactive CPU Generation Switcher (8086 vs 80386DX)',
        description: 'Compare 16-bit and 32-bit register extensions and memory address spaces.'
      },
      stepByStep: [
        { step: 1, title: '8086 Real Mode', desc: '16-bit registers. Address = Seg × 16 + Offset. Max 1 MB.' },
        { step: 2, title: '386 Protected Mode', desc: '32-bit registers. Segment register holds Selector into GDT/LDT. Linear address translated through Paging Unit. Max 4 GB.' }
      ],
      workedExample: {
        problem: 'Explain why "MOV EAX, [EBX + ECX*4 + 20H]" is legal on 80386DX but invalid on 8086.',
        solution: [
          '1. 32-bit registers EAX, EBX, ECX do not exist on the 16-bit 8086.',
          '2. Scaled indexing (ECX*4) utilizes the 386 SIB byte; 8086 has no scaling hardware.',
          '3. 8086 restricts base registers to BX/BP and index to SI/DI.'
        ],
        verifiedStamp: '386 EXCLUSIVE'
      },
      quiz: {
        question: 'Which of the following features was introduced with the Intel 80386DX and was completely absent in the original 8086 microprocessor?',
        options: ['Bus Interface Unit (BIU)', 'Hardware Paging Unit with two-level translation', 'Stack Segment (SS)', 'Direction Flag (DF)'],
        correctIndex: 1,
        explanation: 'The 80386DX introduced the on-chip Paging Unit (with CR3 and page tables), which was absent in the 8086.'
      },
      revise: {
        examTips: ['Memory limits: 8086 = 1 MB; 80386DX = 4 GB.', 'CR0.PE enables protected mode; CR0.PG enables paging.'],
        traps: 'Trap: Claiming 8086 has 32-bit registers. 8086 registers are strictly 16-bit!'
      }
    },

    // 6.1 Segmentation
    'm3-seg': {
      id: 'm3-seg', module: 'module3', number: '6.1', title: 'Memory Segmentation',
      subtitle: 'Logical addresses, 8086 physical address calculation, and 386 protected mode descriptors',
      badge: 'Memory Core', badgeColor: 'cyan',
      understand: {
        headline: 'Dividing Memory into Modular Logical Segments',
        body: `**Segmentation** divides physical memory into logical modules (Code, Data, Stack).

### 8086 Real-Mode Physical Address Generation
Physical address is 20 bits ($2^{20} = 1\\text{ MB}$), but registers are 16 bits.
The hardware shifts the segment register left by 4 bits (multiplying by 16 or 10H) and adds the 16-bit offset:

$$\\text{Physical Address} = (\\text{Segment} \\times 10\\text{H}) + \\text{Offset}$$

### 80386DX Protected-Mode Segmentation
Segment registers hold a **16-bit Selector**:
- **Index (13 bits)**: Selects 1 of 8192 descriptors in GDT/LDT.
- **TI (1 bit)**: 0 = GDT, 1 = LDT.
- **RPL (2 bits)**: Privilege level (Rings 0 to 3).

The **Descriptor** provides a **32-bit Base Address**, **20-bit Limit**, and **Access Rights** (DPL, Present bit).`,
        keyTakeaways: [
          '8086 physical address formula: Physical = Segment × 16 + Offset.',
          'Real mode segments are limited to 64 KB; 386 segments can span up to 4 GB.',
          'In protected mode, segment registers are Selectors into GDT/LDT.'
        ]
      },
      visualize: {
        diagramType: 'segmentation-calculator-sim',
        title: 'Interactive 8086 & 80386DX Segmentation Calculator',
        description: 'Enter Segment and Offset values to see 20-bit address generation and segment boundaries.'
      },
      stepByStep: [
        { step: 1, title: 'Input Logical Address', desc: 'Segment = 1234H, Offset = 0050H.' },
        { step: 2, title: 'Shift Segment Left 4 Bits', desc: '1234H × 10H = 12340H.' },
        { step: 3, title: 'Add Offset', desc: '12340H + 0050H = 12390H (Physical Address).' }
      ],
      workedExample: {
        problem: 'Calculate physical address for CS = 348AH, IP = 4214H and find segment boundaries.',
        solution: [
          'Physical Address = 348AH × 10H + 4214H = 348A0H + 4214H = 38AB4H.',
          'Starting Address (Offset 0000H) = 348A0H.',
          'Ending Address (Offset FFFFH) = 348A0H + FFFFH = 4489FH (64 KB span).'
        ],
        verifiedStamp: 'EXACT ADDRESS'
      },
      quiz: {
        question: 'In 8086 real mode, if the Data Segment register DS contains 2000H and offset is 0100H, what is the resulting physical memory address?',
        options: ['20100H', '200100H', '21000H', '02100H'],
        correctIndex: 0,
        explanation: 'Physical Address = Segment × 10H + Offset = 20000H + 0100H = 20100H.'
      },
      revise: {
        examTips: ['Always show the multiplication: Segment × 10H + Offset.', 'Segment limit violation in 386 raises #GP (Interrupt 13).'],
        traps: 'Trap: Adding segment and offset directly without shifting! (1234H + 0050H = 1284H is WRONG).'
      }
    },

    // 6.2 Paging
    'm3-paging': {
      id: 'm3-paging', module: 'module3', number: '6.2', title: 'Paging Architecture',
      subtitle: 'Pages, page frames, two-level page directories, and page-table entry structure',
      badge: 'Virtual Memory', badgeColor: 'yellow',
      understand: {
        headline: 'Fixed-Size Memory Allocation and Virtual Memory Management',
        body: `**Paging** divides physical memory into fixed-sized blocks called **page frames** (4 KiB) and maps them to linear virtual pages.

### Two-Level 80386DX Paging
A 32-bit linear address is partitioned into **10-10-12 bits**:
- **Bits 31–22 (10 bits)**: **Page Directory Index (PDI)** (1024 PDEs).
- **Bits 21–12 (10 bits)**: **Page Table Index (PTI)** (1024 PTEs).
- **Bits 11–0 (12 bits)**: **Page Offset** ($2^{12} = 4096\\text{ bytes} = 4\\text{ KiB}$).

**CR3** holds the physical base address of the Page Directory. If the Present bit (\`P\`) is 0 in either PDE or PTE, a **Page Fault (\`#PF\`, Interrupt 14)** occurs.`,
        keyTakeaways: [
          '32-bit linear address is split into 10-bit Directory, 10-bit Page Table, 12-bit Offset (10-10-12).',
          'Standard page size is 4 KiB (4096 bytes).',
          'CR3 register holds the physical address of the Page Directory.'
        ]
      },
      visualize: {
        diagramType: 'paging-simulator-sim',
        title: 'Interactive 80386DX Two-Level Paging Decomposer & PTE Walker',
        description: 'Enter a 32-bit linear address and inspect the 10-10-12 bit fields, PDE, and PTE lookup.'
      },
      stepByStep: [
        { step: 1, title: 'Address Input', desc: 'Linear Address = 00403014H.' },
        { step: 2, title: 'Extract PDI', desc: 'Bits 31–22 = Index 1 (PDE #1 at CR3 + 4).' },
        { step: 3, title: 'Extract PTI', desc: 'Bits 21–12 = Index 3 (PTE #3 in that Page Table).' },
        { step: 4, title: 'Combine with Offset', desc: 'PTE yields physical frame base; combine with 12-bit offset 014H to produce physical address.' }
      ],
      workedExample: {
        problem: 'Deconstruct linear address 12345678H for an 80386DX system into PDI, PTI, and Offset.',
        solution: [
          'Binary: 0001 0010 0011 0100 0101 0110 0111 1000B',
          'PDI (Bits 31-22): 0001 0010 00B = 048H = 72 decimal.',
          'PTI (Bits 21-12): 11 0100 0101B = 345H = 837 decimal.',
          'Offset (Bits 11-0): 0110 0111 1000B = 678H = 1656 decimal.'
        ],
        verifiedStamp: 'BIT-ACCURATE'
      },
      quiz: {
        question: 'In the classic 80386DX two-level paging architecture with 4 KiB pages, how many bits are allocated to PDI, PTI, and Offset?',
        options: ['8, 8, 16 bits', '10, 10, 12 bits', '12, 10, 10 bits', '16, 8, 8 bits'],
        correctIndex: 1,
        explanation: 'The 32-bit linear address is partitioned into 10 bits (PDI), 10 bits (PTI), and 12 bits (Offset).'
      },
      revise: {
        examTips: ['Remember the 10-10-12 split.', 'CR2 receives the faulting linear address on a page fault.'],
        traps: 'Trap: Forgetting that page size determines offset bit width: 4 KB = 2^12, so offset is exactly 12 bits.'
      }
    },

    // 6.3 Combined Translation
    'm3-combined': {
      id: 'm3-combined', module: 'module3', number: '6.3', title: 'Combined Translation: Segmentation + Paging',
      subtitle: 'Logical Address → Segmentation → Linear Address → Paging → Physical Address',
      badge: 'High-Yield Self-Study', badgeColor: 'coral',
      understand: {
        headline: 'The Complete x86 Two-Stage Address Translation Pipeline',
        body: `In 80386DX Protected Mode with Paging enabled:

$$\\text{Logical Address} \\xrightarrow{\\text{Segmentation Unit}} \\text{Linear Address} \\xrightarrow{\\text{Paging Unit}} \\text{Physical Address}$$

1. **Stage 1 (Segmentation)**: Selector indexes GDT/LDT. Checks privilege and limit (failure = \`#GP\` Fault). Generates:
   $$\\text{Linear Address} = \\text{Base} + \\text{Offset}$$
2. **Stage 2 (Paging)**: Linear address is decomposed into PDI, PTI, and Offset. Checks Present bits in PDE and PTE (failure = \`#PF\` Fault). Combines frame base with offset to generate 32-bit physical bus address.`,
        keyTakeaways: [
          'Full pipeline: Logical Address → Linear Address → Physical Address.',
          'Segmentation catches limit/privilege errors; Paging catches missing page frames.',
          'If paging is disabled, Linear Address = Physical Address.'
        ]
      },
      visualize: {
        diagramType: 'combined-pipeline-sim',
        title: 'Interactive End-to-End Address Translation Pipeline',
        description: 'Step forward and backward through the full two-stage translation pipeline.'
      },
      stepByStep: [
        { step: 1, title: 'Logical Address Input', desc: 'Selector = 0010H, Offset = 00004050H.' },
        { step: 2, title: 'Descriptor Lookup', desc: 'GDT[2] provides Base = 40000000H. Limit check passes.' },
        { step: 3, title: 'Linear Address', desc: 'Linear Address = Base + Offset = 40004050H.' },
        { step: 4, title: 'Paging Lookup', desc: 'PDI = 100H, PTI = 004H, Offset = 050H. PDE and PTE verified.' },
        { step: 5, title: 'Physical Address', desc: 'Frame Base (0B200000H) + Offset (050H) = 0B200050H.' }
      ],
      workedExample: {
        problem: 'Trace translation for Selector = 0018H (Base = 20000000H) and Offset = 00001234H. Paging maps linear to frame 00700000H.',
        solution: [
          '1. Linear Address = Base + Offset = 20000000H + 00001234H = 20001234H.',
          '2. Paging Split: PDI = 128 (080H), PTI = 1, Offset = 234H.',
          '3. Physical Address = Frame Base (00700000H) + Offset (234H) = 00700234H.'
        ],
        verifiedStamp: 'PIPELINE PROVEN'
      },
      quiz: {
        question: 'During combined address translation, if an offset exceeds the segment limit in its GDT descriptor, which exception is triggered?',
        options: ['Page Fault (Interrupt 14)', 'General Protection Fault (#GP, Interrupt 13)', 'Divide Error (Interrupt 0)', 'Double Fault'],
        correctIndex: 1,
        explanation: 'Segment limit violations occur in Stage 1 and immediately trigger Exception 13 (#GP). Paging is never reached.'
      },
      revise: {
        examTips: ['Always draw the two-stage flow: Logical -> Segmentation -> Linear -> Paging -> Physical.'],
        traps: 'Trap: Confusing Page Fault with GP Fault. GP faults are segmentation/privilege violations; Page faults are paging violations.'
      }
    },

    // 6.4 Seg vs Paging
    'm3-seg-vs-paging': {
      id: 'm3-seg-vs-paging', module: 'module3', number: '6.4', title: 'Segmentation Versus Paging',
      subtitle: 'Comparative analysis of modularity, fragmentation, protection, and allocation',
      badge: 'Comparison Matrix', badgeColor: 'mint',
      understand: {
        headline: 'Comparing the Two Foundational Memory Management Paradigms',
        body: `### Comparison Summary
- **Block Size**: Segmentation uses **variable sizes**; Paging uses **fixed sizes** (4 KiB).
- **Fragmentation**: Segmentation suffers from **External Fragmentation**; Paging suffers from **Internal Fragmentation**.
- **Visibility**: Segments are visible to programmers (e.g. \`DS:BX\`); Pages are completely transparent.
- **Protection**: Segmentation protects logical modules (code vs data); Paging enforces page-level read/write permissions per 4 KB frame.`,
        keyTakeaways: [
          'Segmentation causes external fragmentation; Paging causes internal fragmentation.',
          'Segments are variable in size; Pages are strictly fixed in size (4 KB).',
          'Modern OSs combine both: flat segmentation with hierarchical paging.'
        ]
      },
      visualize: {
        diagramType: 'fragmentation-visualizer',
        title: 'Interactive External vs Internal Fragmentation Visualizer',
        description: 'Observe how variable-sized segments leave external holes, while fixed pages leave internal waste.'
      },
      stepByStep: [
        { step: 1, title: 'External Fragmentation', desc: 'Variable segment allocations leave scattered free gaps between segments.' },
        { step: 2, title: 'Internal Fragmentation', desc: 'A 50 KB process requires 13 pages of 4 KB = 52 KB. The 2 KB unused tail is internal fragmentation.' }
      ],
      workedExample: {
        problem: 'A process requires 14,000 bytes. With 4 KiB paging, calculate pages allocated and internal fragmentation.',
        solution: [
          'Pages allocated = ceil(14000 / 4096) = 4 pages.',
          'Allocated RAM = 4 × 4096 = 16,384 bytes.',
          'Internal Fragmentation = 16,384 - 14,000 = 2,384 bytes.'
        ],
        verifiedStamp: 'VERIFIED ✓'
      },
      quiz: {
        question: 'Which type of memory fragmentation is primarily associated with fixed-size paging systems?',
        options: ['External fragmentation only', 'Internal fragmentation in the last allocated page frame', 'Segment register fragmentation', 'Both equally'],
        correctIndex: 1,
        explanation: 'Paging eliminates external fragmentation, but creates internal fragmentation in the last allocated page frame.'
      },
      revise: {
        examTips: ['Contrast: Segmentation = Variable + External Frag; Paging = Fixed + Internal Frag.'],
        traps: 'Trap: Claiming that paging suffers from external fragmentation. Paging NEVER has external fragmentation!'
      }
    },

    // 7.1 Cache Fundamentals
    'm3-cache-fundamentals': {
      id: 'm3-cache-fundamentals', module: 'module3', number: '7.1', title: 'Cache Memory Fundamentals & Hierarchy',
      subtitle: 'Locality of reference, memory hierarchy, cache lines, hit ratio, and miss penalty',
      badge: 'Hardware Speed', badgeColor: 'yellow',
      understand: {
        headline: 'Bridging the CPU-DRAM Speed Chasm',
        body: `Cache memory is a small, ultra-fast SRAM buffer directly on the CPU die.

### Locality of Reference
1. **Temporal Locality**: Memory referenced recently will likely be referenced again soon (loops, stack).
2. **Spatial Locality**: Adjacent memory locations are likely to be referenced soon (sequential code, arrays).

### Key Terms
- **Cache Hit / Miss**: Data found or not found in cache.
- **Hit Ratio ($H$)**: Fraction of accesses satisfied by cache ($M = 1 - H$).
- **Miss Penalty**: Extra latency to load a block from DRAM into cache.`,
        keyTakeaways: [
          'Caches rely on temporal and spatial locality.',
          'Data transfers occur in fixed-size blocks (cache lines).',
          'Miss Ratio = 1 - Hit Ratio.'
        ]
      },
      visualize: {
        diagramType: 'memory-hierarchy-pyramid',
        title: 'Interactive Memory Hierarchy Pyramid',
        description: 'Explore the trade-offs between speed, cost per bit, and capacity across the hierarchy.'
      },
      stepByStep: [
        { step: 1, title: 'CPU Request', desc: 'CPU accesses address; L1 cache checks tags.' },
        { step: 2, title: 'Hit or Miss', desc: 'On hit: data delivered in ~1 ns. On miss: request sent to L2, L3, or DRAM.' }
      ],
      workedExample: {
        problem: 'In 10,000 accesses, 9,600 hit in L1 cache. Calculate Hit Ratio and Miss Ratio.',
        solution: [
          'Hit Ratio H = 9,600 / 10,000 = 0.96 (96%).',
          'Miss Ratio M = 400 / 10,000 = 0.04 (4%).'
        ],
        verifiedStamp: 'VERIFIED ✓'
      },
      quiz: {
        question: 'Which type of locality is primarily exploited when a cache fetches an entire 64-byte line upon accessing a single variable?',
        options: ['Temporal Locality', 'Spatial Locality', 'Associative Locality', 'Register Locality'],
        correctIndex: 1,
        explanation: 'Spatial locality states that accessing address X makes nearby addresses likely to be accessed soon. Loading a 64-byte block captures adjacent variables.'
      },
      revise: {
        examTips: ['Hit Ratio H + Miss Ratio M = 1.0 always.'],
        traps: 'Trap: Thinking a cache fetches single bytes. Caches ALWAYS transfer a full cache line!'
      }
    },

    // 7.2 Direct Mapping
    'm3-direct-mapping': {
      id: 'm3-direct-mapping', module: 'module3', number: '7.2', title: 'Direct-Mapped Cache',
      subtitle: 'Tag, index, and block offset breakdown; fixed line mapping and conflict misses',
      badge: 'Cache Mapping', badgeColor: 'cyan',
      understand: {
        headline: 'Mapping Each Memory Block to Exactly One Cache Line',
        body: `In Direct Mapping, each memory block maps to only one specific cache line:

$$\\text{Line Index} = (\\text{Block Number}) \\pmod{\\text{Total Cache Lines}}$$

### Address Split: [Tag | Index | Offset]
- **Offset**: Selects byte inside line ($2^{\\text{Offset}} = \\text{Block Size}$).
- **Index**: Selects the line ($2^{\\text{Index}} = \\text{Total Lines}$).
- **Tag**: Upper bits compared to verify hit.

**Trade-off**: Very fast and simple hardware, but vulnerable to **Conflict Misses** when multiple blocks map to the same line.`,
        keyTakeaways: [
          'Each block maps to one line: Line = Block mod Lines.',
          'Address split: [Tag | Index | Offset].',
          'Direct mapping is fast but vulnerable to conflict thrashing.'
        ]
      },
      visualize: {
        diagramType: 'direct-cache-sim',
        title: 'Interactive Direct-Mapped Cache Simulator',
        description: 'Observe tag/index extraction, line lookups, hits, and conflict evictions.'
      },
      stepByStep: [
        { step: 1, title: 'Access Block 1', desc: '1 mod 4 = Line 1. Block 1 loaded into Line 1.' },
        { step: 2, title: 'Access Block 5', desc: '5 mod 4 = Line 1. Conflict! Block 1 is evicted, Block 5 replaces it.' }
      ],
      workedExample: {
        problem: '16-bit address space, 64 lines, 16-byte blocks. Find bits in Offset, Index, and Tag.',
        solution: [
          'Offset = log2(16) = 4 bits.',
          'Index = log2(64) = 6 bits.',
          'Tag = 16 - 6 - 4 = 6 bits. Layout: [Tag: 6 | Index: 6 | Offset: 4].'
        ],
        verifiedStamp: 'EXACT BITS'
      },
      quiz: {
        question: 'In a direct-mapped cache, what causes a "conflict miss"?',
        options: ['The cache is 100% full.', 'Two or more active blocks map to the exact same cache line index.', 'Invalid address.', 'Wrong replacement policy.'],
        correctIndex: 1,
        explanation: 'Conflict misses occur when multiple blocks map to the same line index, displacing each other repeatedly.'
      },
      revise: {
        examTips: ['Offset = log2(Block size); Index = log2(Lines); Tag = Total - Index - Offset.'],
        traps: 'Trap: Using total cache bytes instead of line count for index bits.'
      }
    },

    // 7.3 Associative Mapping
    'm3-associative-mapping': {
      id: 'm3-associative-mapping', module: 'module3', number: '7.3', title: 'Fully Associative Mapping',
      subtitle: 'Any block in any line; parallel tag comparison, valid bits, and replacement',
      badge: 'Maximum Flexibility', badgeColor: 'purple',
      understand: {
        headline: 'Placing Any Memory Block into Any Available Cache Line',
        body: `In Fully Associative Mapping, any block can reside in any line.

### Address Split: [Tag | Offset]
There is **NO index field** (Index = 0 bits)!
The CPU compares the tag against **all cache lines simultaneously in parallel**.

**Trade-off**: Eliminates conflict misses completely, but requires expensive parallel comparator circuits.`,
        keyTakeaways: [
          'Address split: only [Tag | Offset] (zero index bits!).',
          'Tags of all lines are compared in parallel.',
          'Zero conflict misses, but high hardware cost.'
        ]
      },
      visualize: {
        diagramType: 'associative-cache-sim',
        title: 'Interactive Fully Associative Cache Simulator',
        description: 'Observe parallel tag comparison and LRU replacement when full.'
      },
      stepByStep: [
        { step: 1, title: 'Fill Available Lines', desc: 'Blocks fill lines 0, 1, 2, 3 with no conflict.' },
        { step: 2, title: 'Full Cache', desc: 'When all lines are valid, replacement policy (LRU) evicts the oldest block.' }
      ],
      workedExample: {
        problem: '32-bit address space, 512 lines, 64-byte blocks. Find Tag and Offset bits.',
        solution: [
          'Offset = log2(64) = 6 bits.',
          'Index = 0 bits (Fully Associative).',
          'Tag = 32 - 6 = 26 bits. Layout: [Tag: 26 | Offset: 6].'
        ],
        verifiedStamp: 'VERIFIED ✓'
      },
      quiz: {
        question: 'Why does a fully associative cache NOT have an "Index" field in its address bit breakdown?',
        options: ['Stored in DRAM.', 'Any block can occupy any cache line, so no line index is pre-assigned.', 'Only supports 8-bit CPUs.', 'Tag register generates index.'],
        correctIndex: 1,
        explanation: 'Since any block can sit in any line, no specific line index is predefined.'
      },
      revise: {
        examTips: ['Fully associative address: [Tag | Offset]. Index is always 0.'],
        traps: 'Trap: Calculating index bits for a fully associative cache!'
      }
    },

    // 7.4 Set-Associative
    'm3-set-associative': {
      id: 'm3-set-associative', module: 'module3', number: '7.4', title: 'Set-Associative Mapping',
      subtitle: 'K-way associativity, sets and ways, set index, tag, and balanced hardware design',
      badge: 'Industry Standard', badgeColor: 'coral',
      understand: {
        headline: 'The Golden Compromise: Balancing Speed, Cost, and Hit Rate',
        body: `Lines are grouped into **Sets** of **$K$ Ways**.
- Block maps to one Set: $\\text{Set Index} = \\text{Block} \\pmod{\\text{Total Sets}}$.
- Inside that set, the block can occupy any of the $K$ ways.
- Number of Sets = $\\text{Total Lines} / K$.

In a 2-way set-associative cache, each lookup compares only 2 tags in parallel, providing high hit rates at low hardware cost.`,
        keyTakeaways: [
          'A block maps to a specific set, but can sit in any way inside that set.',
          'Address split: [Tag | Set Index | Offset].',
          'Number of Sets = Total Lines / K.'
        ]
      },
      visualize: {
        diagramType: 'set-associative-sim',
        title: 'Interactive 2-Way / 4-Way Set-Associative Cache Simulator',
        description: 'Watch blocks map to sets and candidate ways, and observe LRU eviction inside sets.'
      },
      stepByStep: [
        { step: 1, title: 'Access Block 1 & 5', desc: 'Both map to Set 1. Block 1 takes Way 0; Block 5 takes Way 1. Both coexist without conflict!' }
      ],
      workedExample: {
        problem: '4-way set-associative, 32 KiB total capacity, 32-byte blocks, 32-bit address. Find Offset, Set Index, and Tag bits.',
        solution: [
          'Total lines = 32,768 / 32 = 1024 lines.',
          'Sets = 1024 / 4 = 256 sets.',
          'Offset = log2(32) = 5 bits.',
          'Set Index = log2(256) = 8 bits.',
          'Tag = 32 - 8 - 5 = 19 bits. Layout: [Tag: 19 | Index: 8 | Offset: 5].'
        ],
        verifiedStamp: 'EXAM CLASSIC'
      },
      quiz: {
        question: 'A 2-way set-associative cache has 64 total cache lines. How many sets does this cache contain?',
        options: ['128 sets', '64 sets', '32 sets', '16 sets'],
        correctIndex: 2,
        explanation: 'Sets = Total Lines / Ways = 64 / 2 = 32 sets.'
      },
      revise: {
        examTips: ['Always compute Sets = Lines / K before index bits.'],
        traps: 'Trap: Using total lines to find index bits in set-associative caches!'
      }
    },

    // 7.5 Replacement Algos
    'm3-replacement-algos': {
      id: 'm3-replacement-algos', module: 'module3', number: '7.5', title: 'Cache Replacement Algorithms',
      subtitle: 'FIFO, LRU, LFU, and Random policies; victim selection and trace comparison',
      badge: 'Algorithms', badgeColor: 'yellow',
      understand: {
        headline: 'Choosing Which Victim Block to Evict When Cache is Full',
        body: `When a set is full, the replacement policy chooses which block to evict:
1. **LRU (Least Recently Used)**: Evicts the block unreferenced for the longest time. Best hit rates.
2. **FIFO (First-In, First-Out)**: Evicts the block that arrived earliest.
3. **Random**: Randomly selects a victim line. Simple hardware.
4. **LFU (Least Frequently Used)**: Evicts the block with the lowest access count.`,
        keyTakeaways: [
          'LRU exploits temporal locality and delivers top hit rates.',
          'FIFO evicts earliest arrivals; simple but ignores recent hits.',
          'Pentium uses Pseudo-LRU (PLRU) tracking bits.'
        ]
      },
      visualize: {
        diagramType: 'replacement-policy-comparator-sim',
        title: 'Interactive Replacement Policy Benchmark (FIFO vs LRU)',
        description: 'Run identical memory access streams side by side and compare hit counts.'
      },
      stepByStep: [
        { step: 1, title: 'Access Sequence', desc: 'Trace 1, 2, 3, 2, 4 through a 3-block cache.' },
        { step: 2, title: 'Hit on 2', desc: 'LRU refreshes block 2 to most-recently-used; FIFO ignores the hit.' }
      ],
      workedExample: {
        problem: 'Trace access sequence 0, 1, 2, 0, 1, 3 for 3 lines with LRU.',
        solution: [
          'Access 0: Miss [0, -, -]',
          'Access 1: Miss [0, 1, -]',
          'Access 2: Miss [0, 1, 2]',
          'Access 0: Hit! [1, 2, 0]',
          'Access 1: Hit! [2, 0, 1]',
          'Access 3: Miss (evict 2): [0, 1, 3]'
        ],
        verifiedStamp: 'TRACE VERIFIED'
      },
      quiz: {
        question: 'Which cache replacement policy evicts the block that has resided in cache the longest, regardless of recent hits?',
        options: ['LRU', 'FIFO', 'LFU', 'Random'],
        correctIndex: 1,
        explanation: 'FIFO evicts strictly based on arrival order.'
      },
      revise: {
        examTips: ['In LRU trace questions, maintain a recency order column.'],
        traps: 'Trap: Forgetting to refresh recency on a HIT in LRU!'
      }
    },

    // 7.6 Cache Performance
    'm3-cache-perf': {
      id: 'm3-cache-perf', module: 'module3', number: '7.6', title: 'Cache Performance & AMAT Optimization',
      subtitle: 'Average Memory Access Time formula, the 3 C\'s of cache misses, and trade-offs',
      badge: 'Performance Formula', badgeColor: 'coral',
      understand: {
        headline: 'Quantifying Memory Subsystem Performance',
        body: `### The AMAT Equation
$$\\text{AMAT} = \\text{Hit Time} + (\\text{Miss Rate} \\times \\text{Miss Penalty})$$

### The 3 C's of Cache Misses
1. **Compulsory (Cold) Misses**: Very first access to a block.
2. **Capacity Misses**: Working set exceeds cache capacity.
3. **Conflict Misses**: Multiple blocks compete for the same set index.`,
        keyTakeaways: [
          'AMAT = Hit Time + (Miss Rate × Miss Penalty).',
          '3 C\'s of misses: Compulsory, Capacity, Conflict.',
          'Multi-level caches reduce miss penalty.'
        ]
      },
      visualize: {
        diagramType: 'amat-calculator-sim',
        title: 'Interactive AMAT Performance Calculator',
        description: 'Adjust sliders for Hit Time, Miss Rate, and Miss Penalty to observe effective access time.'
      },
      stepByStep: [
        { step: 1, title: 'Baseline', desc: 'Hit Time = 1 ns, Miss Rate = 5%, Penalty = 80 ns.' },
        { step: 2, title: 'Compute', desc: 'AMAT = 1 + (0.05 × 80) = 1 + 4 = 5 ns.' }
      ],
      workedExample: {
        problem: 'Hit Time = 1 cycle, Miss Rate = 4%, Miss Penalty = 80 cycles. Calculate AMAT.',
        solution: [
          'AMAT = Hit Time + (Miss Rate × Miss Penalty)',
          'AMAT = 1 + (0.04 × 80) = 1 + 3.2 = 4.2 cycles.'
        ],
        verifiedStamp: 'EXACT FORMULA'
      },
      quiz: {
        question: 'Which of the "3 C\'s" of misses cannot be avoided even if the cache has infinite capacity and full associativity?',
        options: ['Capacity Misses', 'Conflict Misses', 'Compulsory (Cold) Misses', 'Coherence Misses'],
        correctIndex: 2,
        explanation: 'Compulsory misses occur on the very first access to a block when cache starts empty.'
      },
      revise: {
        examTips: ['Use consistent units (cycles or nanoseconds) throughout AMAT calculations.'],
        traps: 'Trap: Forgetting the Hit Time term in AMAT!'
      }
    },

    // 7.7 System Integration
    'm3-memory-hierarchy': {
      id: 'm3-memory-hierarchy', module: 'module3', number: '7.7', title: 'Memory Hierarchy & System Interaction',
      subtitle: 'Bus transactions, cache write policies (Write-Through vs Write-Back), and coherence',
      badge: 'System Integration', badgeColor: 'mint',
      understand: {
        headline: 'Integrating Cache, CPU, and System Memory Buses',
        body: `### Write Policies
1. **Write-Through**: Data is written simultaneously to cache AND main memory. Simple, but slower write performance.
2. **Write-Back**: Data is written only to cache, setting the **Dirty bit ($D$)**. Memory is updated only when the line is evicted, drastically cutting bus traffic.`,
        keyTakeaways: [
          'Write-Through writes immediately to RAM; Write-Back marks a Dirty bit and writes to RAM only upon eviction.',
          'Write-Back significantly reduces memory bus traffic.',
          'Pentium L1 data cache uses Write-Back.'
        ]
      },
      visualize: {
        diagramType: 'write-policy-flow',
        title: 'Interactive Write-Through vs Write-Back Flowchart',
        description: 'Trace write cycles and observe the Dirty bit flip and memory bus writes.'
      },
      stepByStep: [
        { step: 1, title: 'CPU Write', desc: 'CPU writes to cached address.' },
        { step: 2, title: 'Write-Back', desc: 'Line updated in cache; Dirty bit set to 1. Zero bus writes issued.' },
        { step: 3, title: 'Eviction', desc: 'When line is replaced, dirty block is written to DRAM.' }
      ],
      workedExample: {
        problem: 'Compare bus traffic for 100 writes under Write-Through vs Write-Back (1 eviction).',
        solution: [
          'Write-Through: 100 bus transactions.',
          'Write-Back: 1 bus transaction upon eviction (99% bus reduction).'
        ],
        verifiedStamp: '99% EFFICIENCY'
      },
      quiz: {
        question: 'Under a Write-Back cache policy, when is a modified block written back to main memory?',
        options: ['Immediately on every write.', 'Only when the dirty cache line is evicted.', 'Every clock cycle.', 'On page fault.'],
        correctIndex: 1,
        explanation: 'In Write-Back caches, writes modify only the cache line. The block is written to main memory only upon eviction.'
      },
      revise: {
        examTips: ['Dirty bit is only needed in Write-Back caches.'],
        traps: 'Trap: Claiming Write-Through is faster. Write-Through is slower due to waiting for DRAM writes.'
      }
    }
  };

  console.log('Pentium Lab: Curriculum bundle initialized with 19 topics.');
})();
