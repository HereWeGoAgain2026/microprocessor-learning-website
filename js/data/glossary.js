/* ==========================================================================
   TECHNICAL GLOSSARY: MICROPROCESSOR & MEMORY MANAGEMENT TERMS
   Searchable encyclopedia for university students
   ========================================================================== */

export const GLOSSARY = [
  {
    term: 'Accumulator',
    abbr: 'AX / EAX',
    category: 'Architecture',
    module: 'Module II',
    definition: 'A dedicated general-purpose register implicitly utilized in arithmetic operations, multiplication, division, and I/O port data transfers.'
  },
  {
    term: 'Addressing Mode',
    abbr: 'EA',
    category: 'Instructions',
    module: 'Module II',
    definition: 'The method or formula specifying how the microprocessor calculates the effective address of an operand in memory or registers.'
  },
  {
    term: 'AMAT (Average Memory Access Time)',
    abbr: 'AMAT',
    category: 'Cache',
    module: 'Module III',
    definition: 'The mean latency required to satisfy a memory reference across cache levels: AMAT = Hit Time + (Miss Rate × Miss Penalty).'
  },
  {
    term: 'Auxiliary Carry Flag',
    abbr: 'AF',
    category: 'Flags',
    module: 'Module II',
    definition: 'Status flag set when a carry or borrow occurs out of bit 3 into bit 4 (nibble carry); used by BCD arithmetic instructions (DAA, DAS).'
  },
  {
    term: 'Barrel Shifter',
    abbr: 'ALU',
    category: 'Hardware',
    module: 'Module II',
    definition: 'Hardware logic circuit that can shift or rotate a data word by an arbitrary number of bit positions in a single clock cycle, introduced in the 80386.'
  },
  {
    term: 'Bus Interface Unit',
    abbr: 'BIU',
    category: 'Architecture',
    module: 'Module II',
    definition: 'Subsystem of the 8086 that interfaces with the external memory bus, performs physical address calculations (Seg × 16 + Offset), and fetches instructions into the prefetch queue.'
  },
  {
    term: 'Cache Hit',
    abbr: 'Hit',
    category: 'Cache',
    module: 'Module III',
    definition: 'An event where requested data or instruction at a memory address is already present in a cache line, yielding immediate low-latency access.'
  },
  {
    term: 'Cache Line / Block',
    abbr: 'Block',
    category: 'Cache',
    module: 'Module III',
    definition: 'The minimum atomic unit of data transfer between main memory and cache memory, typically 32 or 64 contiguous bytes in modern x86 architectures.'
  },
  {
    term: 'Cache Miss',
    abbr: 'Miss',
    category: 'Cache',
    module: 'Module III',
    definition: 'An event where requested memory is not found in cache, forcing the processor to stall while loading the block from lower memory levels.'
  },
  {
    term: 'Capacity Miss',
    abbr: '3 C\'s',
    category: 'Cache',
    module: 'Module III',
    definition: 'A cache miss caused by the physical storage capacity of the cache being too small to hold all blocks required by the working set.'
  },
  {
    term: 'Carry Flag',
    abbr: 'CF',
    category: 'Flags',
    module: 'Module II',
    definition: 'Status flag set when an arithmetic operation generates a carry out of the most significant bit (addition) or requires a borrow into the MSB (subtraction).'
  },
  {
    term: 'Compulsory Miss',
    abbr: 'Cold Miss',
    category: 'Cache',
    module: 'Module III',
    definition: 'A cache miss that occurs on the very first access to a block, regardless of cache capacity or associativity.'
  },
  {
    term: 'Conflict Miss',
    abbr: 'Collision Miss',
    category: 'Cache',
    module: 'Module III',
    definition: 'A miss in direct-mapped or set-associative caches when multiple active memory blocks map to the exact same set index and evict each other.'
  },
  {
    term: 'Control Register 3',
    abbr: 'CR3',
    category: 'Paging',
    module: 'Module III',
    definition: 'An 80386DX system control register that stores the 32-bit physical base address of the active Page Directory.'
  },
  {
    term: 'Direct-Mapped Cache',
    abbr: 'Direct Cache',
    category: 'Cache',
    module: 'Module III',
    definition: 'Cache organization where each memory block maps to exactly one specific line index given by: Line = Block Number mod Total Lines.'
  },
  {
    term: 'Direction Flag',
    abbr: 'DF',
    category: 'Flags',
    module: 'Module II',
    definition: 'Control flag in the FLAGS register; when cleared (CLD, DF=0), string pointers auto-increment; when set (STD, DF=1), string pointers auto-decrement.'
  },
  {
    term: 'Dirty Bit',
    abbr: 'D bit',
    category: 'Cache & Paging',
    module: 'Module III',
    definition: 'A tracking bit set by hardware when a cache block or page frame has been modified in local memory and must be written back to backing store upon eviction.'
  },
  {
    term: 'Effective Address',
    abbr: 'EA',
    category: 'Memory',
    module: 'Module II',
    definition: 'The 16-bit or 32-bit offset of an operand within its memory segment, calculated from base registers, index registers, and displacements.'
  },
  {
    term: 'Execution Unit',
    abbr: 'EU',
    category: 'Architecture',
    module: 'Module II',
    definition: 'The subsystem of the 8086 that contains the ALU, general registers, and control logic that decodes and executes instructions fetched by the BIU.'
  },
  {
    term: 'External Fragmentation',
    abbr: 'Ext. Frag.',
    category: 'Segmentation',
    module: 'Module III',
    definition: 'A condition in segmentation where total free memory is sufficient to satisfy a request, but the memory is fragmented into non-contiguous small gaps.'
  },
  {
    term: 'FIFO (First-In, First-Out)',
    abbr: 'FIFO',
    category: 'Cache',
    module: 'Module III',
    definition: 'A cache or buffer replacement policy that evicts the block that arrived earliest in cache, regardless of recent access frequency.'
  },
  {
    term: 'Fully Associative Cache',
    abbr: 'Associative',
    category: 'Cache',
    module: 'Module III',
    definition: 'Cache organization where any memory block can reside in any available line; tags of all lines are compared in parallel simultaneously.'
  },
  {
    term: 'General Protection Fault',
    abbr: '#GP (Int 13)',
    category: 'Protected Mode',
    module: 'Module III',
    definition: 'Hardware CPU exception raised in protected mode when a program violates segment limits, writes to a read-only segment, or accesses higher privilege rings.'
  },
  {
    term: 'Global Descriptor Table',
    abbr: 'GDT',
    category: 'Segmentation',
    module: 'Module III',
    definition: 'An operating system table in 80386 protected mode that holds 8-byte descriptors defining base addresses, limits, and privilege rights for memory segments.'
  },
  {
    term: 'Internal Fragmentation',
    abbr: 'Int. Frag.',
    category: 'Paging',
    module: 'Module III',
    definition: 'Wasted space within an allocated fixed-size block (such as a 4 KiB page) when the requested memory does not fill the entire final block.'
  },
  {
    term: 'Interrupt Vector Table',
    abbr: 'IVT',
    category: 'Control Transfer',
    module: 'Module II',
    definition: 'A 1024-byte table at physical address 00000H–003FFH in 8086 real mode containing 256 four-byte far pointers (CS:IP) for interrupt service routines.'
  },
  {
    term: 'Linear Address',
    abbr: 'Linear',
    category: 'Memory',
    module: 'Module III',
    definition: 'The 32-bit flat address produced after the Segmentation Unit adds segment base to offset, which is then fed into the Paging Unit.'
  },
  {
    term: 'Logical Address',
    abbr: 'Segment:Offset',
    category: 'Memory',
    module: 'Module III',
    definition: 'An address specified as a segment identifier (or selector) and an offset, representing program-visible references before translation.'
  },
  {
    term: 'LRU (Least Recently Used)',
    abbr: 'LRU',
    category: 'Cache',
    module: 'Module III',
    definition: 'A high-efficiency cache replacement policy that selects for eviction the line that has not been accessed for the longest time.'
  },
  {
    term: 'Opcode',
    abbr: 'Opcode',
    category: 'Instructions',
    module: 'Module II',
    definition: 'The portion of a machine instruction that specifies the basic operation (e.g. MOV, ADD) to be executed by the microprocessor.'
  },
  {
    term: 'Overflow Flag',
    abbr: 'OF',
    category: 'Flags',
    module: 'Module II',
    definition: 'Status flag set when a signed two\'s complement arithmetic operation produces a result that exceeds the positive or negative range of the destination.'
  },
  {
    term: 'Page Directory',
    abbr: 'PD / PDE',
    category: 'Paging',
    module: 'Module III',
    definition: 'The top-level table in two-level 80386DX paging; contains 1024 4-byte entries (PDEs) pointing to physical addresses of second-level Page Tables.'
  },
  {
    term: 'Page Fault',
    abbr: '#PF (Int 14)',
    category: 'Paging',
    module: 'Module III',
    definition: 'A CPU hardware exception raised when an instruction references a linear address whose Present bit in PDE or PTE is cleared (P=0).'
  },
  {
    term: 'Page Frame',
    abbr: 'Frame',
    category: 'Paging',
    module: 'Module III',
    definition: 'A contiguous, fixed-size 4096-byte (4 KiB) physical memory slot into which an arbitrary virtual memory page can be mapped.'
  },
  {
    term: 'Page Table',
    abbr: 'PT / PTE',
    category: 'Paging',
    module: 'Module III',
    definition: 'Second-level table in 80386DX paging; contains 1024 4-byte entries (PTEs) mapping 4 KiB virtual pages to physical page frames.'
  },
  {
    term: 'Parity Flag',
    abbr: 'PF',
    category: 'Flags',
    module: 'Module II',
    definition: 'Status flag set if the least significant byte of an arithmetic/logical result contains an even number of 1-bits.'
  },
  {
    term: 'Protected Mode',
    abbr: 'ProtMode',
    category: 'Architecture',
    module: 'Module II & III',
    definition: 'An 80386 operational state supporting 4 GB physical addressing, privilege rings, descriptor-based segmentation, and virtual memory paging.'
  },
  {
    term: 'Real Mode',
    abbr: 'RealMode',
    category: 'Architecture',
    module: 'Module II & III',
    definition: 'The 8086 backward-compatible operating mode with 1 MB physical address limit, no memory protection, and direct segment calculation (Seg × 16).'
  },
  {
    term: 'Segment Descriptor',
    abbr: 'Descriptor',
    category: 'Segmentation',
    module: 'Module III',
    definition: 'An 8-byte record in GDT or LDT that specifies the 32-bit physical base address, 20-bit limit, privilege level (DPL), and type of a protected segment.'
  },
  {
    term: 'Segment Selector',
    abbr: 'Selector',
    category: 'Segmentation',
    module: 'Module III',
    definition: 'A 16-bit value loaded into a segment register in protected mode, consisting of a 13-bit index, 1-bit Table Indicator (TI), and 2-bit RPL.'
  },
  {
    term: 'Set-Associative Cache',
    abbr: 'K-Way',
    category: 'Cache',
    module: 'Module III',
    definition: 'Cache organization dividing cache lines into sets of K ways; a block maps to one set but can occupy any way inside that set.'
  },
  {
    term: 'Sign Flag',
    abbr: 'SF',
    category: 'Flags',
    module: 'Module II',
    definition: 'Status flag that mirrors the most significant bit (MSB) of an arithmetic/logical result; 1 indicates negative, 0 indicates positive.'
  },
  {
    term: 'Spatial Locality',
    abbr: 'Locality',
    category: 'Cache',
    module: 'Module III',
    definition: 'The property where accessing a memory location makes it highly probable that contiguous adjacent addresses will be accessed in the near future.'
  },
  {
    term: 'Temporal Locality',
    abbr: 'Locality',
    category: 'Cache',
    module: 'Module III',
    definition: 'The property where a memory location referenced recently is likely to be referenced repeatedly in the near future (e.g. loop variables).'
  },
  {
    term: 'Translation Lookaside Buffer',
    abbr: 'TLB',
    category: 'Paging',
    module: 'Module III',
    definition: 'A small, ultra-fast fully-associative hardware cache inside the CPU that caches recent virtual-to-physical page translation entries.'
  },
  {
    term: 'Write-Back',
    abbr: 'Copy-Back',
    category: 'Cache',
    module: 'Module III',
    definition: 'A cache write policy where modifications update only the cache line and mark a Dirty bit; main memory is written only when the line is evicted.'
  },
  {
    term: 'Write-Through',
    abbr: 'Write-Thru',
    category: 'Cache',
    module: 'Module III',
    definition: 'A cache write policy where every memory write operation updates both the cache and underlying main memory simultaneously.'
  },
  {
    term: 'XLAT (Translate)',
    abbr: 'XLAT',
    category: 'Instructions',
    module: 'Module II',
    definition: 'An 8086 string instruction that replaces AL with a byte looked up from an array: AL ← DS:[BX + AL].'
  },
  {
    term: 'Zero Flag',
    abbr: 'ZF',
    category: 'Flags',
    module: 'Module II',
    definition: 'Status flag set to 1 if the arithmetic or logical result of an operation is exactly zero; cleared to 0 otherwise.'
  }
];
