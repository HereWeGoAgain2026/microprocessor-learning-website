/* ==========================================================================
   SEGMENTATION SIMULATORS
   1. 8086 Real-Mode Physical Address Calculator (Seg × 16 + Offset)
   2. 80386DX Protected-Mode Segment Descriptor Explorer
   ========================================================================== */

export class SegmentationSim {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.mode = '8086'; // '8086' or '386'
    // 8086 State
    this.seg8086 = 0x1234;
    this.offset8086 = 0x0050;
    // 386 Protected Mode State
    this.selector386 = 0x0018; // GDT Index 3, RPL 0
    this.offset386 = 0x00004050;
    this.mockGdt = [
      { index: 0, name: 'Null Descriptor', base: 0x00000000, limit: 0x00000, dpl: 0, p: 0, type: 'Reserved' },
      { index: 1, name: 'Kernel Code (Ring 0)', base: 0x10000000, limit: 0xFFFFF, dpl: 0, p: 1, type: 'Exec/Read' },
      { index: 2, name: 'Kernel Data (Ring 0)', base: 0x20000000, limit: 0xFFFFF, dpl: 0, p: 1, type: 'Read/Write' },
      { index: 3, name: 'User Code (Ring 3)', base: 0x40000000, limit: 0x0FFFF, dpl: 3, p: 1, type: 'Exec/Read' },
      { index: 4, name: 'User Data (Ring 3)', base: 0x50000000, limit: 0x0FFFF, dpl: 3, p: 1, type: 'Read/Write' }
    ];
    this.render();
  }

  toHex4(num) {
    return (num & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  }

  toHex5(num) {
    return (num & 0xfffff).toString(16).toUpperCase().padStart(5, '0');
  }

  toHex8(num) {
    return (num >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="paper-card card-ivory">
        <div class="tape-banner tape-cyan tape-pinned">SEGMENTATION ARCHITECTURE LAB</div>

        <div style="margin-top: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
            Switch between 8086 Real Mode address arithmetic and 80386DX Protected Mode descriptors.
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="tactile-btn btn-sm ${this.mode === '8086' ? 'btn-primary' : ''}" id="btn-seg-8086">8086 Real Mode</button>
            <button class="tactile-btn btn-sm ${this.mode === '386' ? 'btn-primary' : ''}" id="btn-seg-386">80386DX Protected Mode</button>
          </div>
        </div>

        ${this.mode === '8086' ? this.render8086Mode() : this.render386Mode()}
      </div>
    `;

    this.attachEvents();
  }

  render8086Mode() {
    const seg = this.seg8086 & 0xffff;
    const off = this.offset8086 & 0xffff;
    const shiftedSeg = (seg << 4) & 0xfffff;
    const phys = (shiftedSeg + off);
    const wrapNotice = phys > 0xfffff ? '(Address wraps around 1 MB line A20!)' : '';
    const finalPhys = phys & 0xfffff;
    const segStart = (seg << 4) & 0xfffff;
    const segEnd = (segStart + 0xffff) & 0xfffff;

    return `
      <!-- 8086 Calculator Controls -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 14px; box-shadow: var(--shadow-sm);">
          <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); display: block; margin-bottom: 6px;">
            SEGMENT REGISTER (Hex):
          </label>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="text" id="input-seg-8086" value="${this.toHex4(seg)}" maxlength="4"
                   style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-size: 15px; font-weight: 900; border: var(--border-thin); border-radius: 4px;" />
            <span style="font-family: var(--font-mono); font-weight: 800;">H</span>
          </div>
        </div>

        <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 14px; box-shadow: var(--shadow-sm);">
          <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-purple); display: block; margin-bottom: 6px;">
            OFFSET POINTER (Hex):
          </label>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="text" id="input-off-8086" value="${this.toHex4(off)}" maxlength="4"
                   style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-size: 15px; font-weight: 900; border: var(--border-thin); border-radius: 4px;" />
            <span style="font-family: var(--font-mono); font-weight: 800;">H</span>
          </div>
        </div>
      </div>

      <!-- Quick Preset Buttons -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
        <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 800; align-self: center;">Try Exam Presets:</span>
        <button class="tactile-btn btn-sm" data-seg-preset="1234,0050">1234H : 0050H</button>
        <button class="tactile-btn btn-sm" data-seg-preset="348A,4214">348AH : 4214H</button>
        <button class="tactile-btn btn-sm" data-seg-preset="2000,0100">2000H : 0100H</button>
        <button class="tactile-btn btn-sm" data-seg-preset="FFFF,0010">FFFFH : 0010H (Wraparound)</button>
      </div>

      <!-- Step-by-Step Calculation Card -->
      <div class="calc-step-flow">
        <div style="font-family: var(--font-display); font-size: 13px; color: var(--pentium-cyan); margin-bottom: 12px; letter-spacing: 0.05em;">
          8086 PHYSICAL ADDRESS CALCULATION BREAKDOWN
        </div>

        <div class="calc-formula-line">
          <span>1. Logical Address Input:</span>
          <span style="color: var(--pentium-cyan); font-weight: 900;">${this.toHex4(seg)}H : ${this.toHex4(off)}H</span>
        </div>

        <div class="calc-formula-line">
          <span>2. Segment shifted left by 4 bits (Segment × 16 or × 10H):</span>
          <span>${this.toHex4(seg)}H × 10H = <strong>${this.toHex5(shiftedSeg)}H</strong> (Binary: ${seg.toString(2).padStart(16, '0')} 0000)</span>
        </div>

        <div class="calc-formula-line">
          <span>3. Add Effective Offset:</span>
          <span>${this.toHex5(shiftedSeg)}H + ${this.toHex4(off)}H = <strong>${this.toHex5(phys)}H</strong></span>
        </div>

        <div class="calc-formula-line result">
          <span>4. Final 20-Bit Physical Address:</span>
          <span style="font-size: 18px; color: var(--pentium-mint-dark);">${this.toHex5(finalPhys)}H (${finalPhys.toLocaleString()} decimal)</span>
          ${wrapNotice ? `<span class="tactile-chip chip-coral">${wrapNotice}</span>` : ''}
        </div>
      </div>

      <!-- Segment Memory Span Boundaries -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 16px;">
        <div style="background: var(--card-white); border: 2px solid var(--ink-black); border-radius: 6px; padding: 12px;">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 900; color: var(--ink-muted);">SEGMENT BASE (Offset 0000H)</div>
          <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 900;">${this.toHex5(segStart)}H</div>
        </div>
        <div style="background: var(--card-white); border: 2px solid var(--ink-black); border-radius: 6px; padding: 12px;">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 900; color: var(--ink-muted);">CURRENT POINTER (Offset ${this.toHex4(off)}H)</div>
          <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 900; color: var(--pentium-cyan);">${this.toHex5(finalPhys)}H</div>
        </div>
        <div style="background: var(--card-white); border: 2px solid var(--ink-black); border-radius: 6px; padding: 12px;">
          <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 900; color: var(--ink-muted);">SEGMENT LIMIT (Offset FFFFH - 64 KB)</div>
          <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 900;">${this.toHex5(segEnd)}H</div>
        </div>
      </div>
    `;
  }

  render386Mode() {
    const sel = this.selector386 & 0xffff;
    const off = this.offset386 >>> 0;
    const index = (sel >> 3) & 0x1fff;
    const ti = (sel >> 2) & 1; // 0=GDT, 1=LDT
    const rpl = sel & 3;

    const desc = this.mockGdt[index] || {
      index,
      name: `Descriptor #${index}`,
      base: 0x60000000,
      limit: 0x0FFFF,
      dpl: 3,
      p: 1,
      type: 'Read/Write'
    };

    const isLimitExceeded = off > desc.limit;
    const linearAddr = (desc.base + off) >>> 0;

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 14px; box-shadow: var(--shadow-sm);">
          <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); display: block; margin-bottom: 6px;">
            16-BIT SEGMENT SELECTOR (Hex):
          </label>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="text" id="input-sel-386" value="${this.toHex4(sel)}" maxlength="4"
                   style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-size: 15px; font-weight: 900; border: var(--border-thin); border-radius: 4px;" />
            <span style="font-family: var(--font-mono); font-weight: 800;">H</span>
          </div>
        </div>

        <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 14px; box-shadow: var(--shadow-sm);">
          <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-purple); display: block; margin-bottom: 6px;">
            32-BIT OFFSET (Hex):
          </label>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="text" id="input-off-386" value="${this.toHex8(off)}" maxlength="8"
                   style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-size: 15px; font-weight: 900; border: var(--border-thin); border-radius: 4px;" />
            <span style="font-family: var(--font-mono); font-weight: 800;">H</span>
          </div>
        </div>
      </div>

      <!-- Quick Selector Presets -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px;">
        <button class="tactile-btn btn-sm" data-sel-preset="0008,00001000">GDT[1] Kernel Code (RPL 0)</button>
        <button class="tactile-btn btn-sm" data-sel-preset="0010,00002500">GDT[2] Kernel Data (RPL 0)</button>
        <button class="tactile-btn btn-sm" data-sel-preset="001B,00004050">GDT[3] User Code (RPL 3)</button>
        <button class="tactile-btn btn-sm btn-danger" data-sel-preset="001B,000FFFFF">Trigger #GP (Limit Exceeded)</button>
      </div>

      <!-- Selector Bit Breakdown -->
      <div style="background: var(--card-slate); border: var(--border-thin); border-radius: 6px; padding: 14px; margin-bottom: 16px;">
        <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); margin-bottom: 8px;">
          SELECTOR BIT FIELDS (Binary: ${sel.toString(2).padStart(16, '0')})
        </div>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 12px;">
          <span class="tactile-chip chip-cyan">Index (Bits 15-3): ${index} (${desc.name})</span>
          <span class="tactile-chip chip-yellow">TI (Bit 2): ${ti === 0 ? '0 (GDT)' : '1 (LDT)'}</span>
          <span class="tactile-chip chip-purple">RPL (Bits 1-0): Ring ${rpl}</span>
        </div>
      </div>

      <!-- Descriptor Table Lookup Card -->
      <div style="background: var(--card-white); border: var(--border-thick); border-radius: 8px; padding: 18px; box-shadow: var(--shadow-sm); margin-bottom: 16px;">
        <div style="font-family: var(--font-display); font-size: 13px; color: var(--ink-black); margin-bottom: 12px;">
          8-BYTE DESCRIPTOR FETCHED FROM GDT[${index}]
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; font-family: var(--font-mono); font-size: 12px;">
          <div style="background: var(--card-ivory); border: 1.5px solid var(--ink-black); border-radius: 4px; padding: 8px 12px;">
            <div style="font-size: 10px; color: var(--ink-muted);">32-BIT BASE ADDRESS</div>
            <div style="font-weight: 900; font-size: 15px; color: var(--pentium-cyan);">${this.toHex8(desc.base)}H</div>
          </div>
          <div style="background: var(--card-ivory); border: 1.5px solid var(--ink-black); border-radius: 4px; padding: 8px 12px;">
            <div style="font-size: 10px; color: var(--ink-muted);">20-BIT LIMIT</div>
            <div style="font-weight: 900; font-size: 15px;">${this.toHex8(desc.limit)}H</div>
          </div>
          <div style="background: var(--card-ivory); border: 1.5px solid var(--ink-black); border-radius: 4px; padding: 8px 12px;">
            <div style="font-size: 10px; color: var(--ink-muted);">PRIVILEGE / PRESENT</div>
            <div style="font-weight: 900; font-size: 15px;">DPL: Ring ${desc.dpl} | P: ${desc.p}</div>
          </div>
        </div>

        <!-- Limit Validation & Linear Output -->
        <div style="margin-top: 16px; padding: 12px; border-radius: 6px; ${isLimitExceeded ? 'background: var(--pentium-coral-pale); border: 2px solid var(--pentium-coral);' : 'background: var(--pentium-mint-pale); border: 2px solid var(--pentium-mint);'} font-family: var(--font-mono); font-size: 13px;">
          ${isLimitExceeded ? `
            <div style="color: var(--pentium-crimson); font-weight: 900; display: flex; align-items: center; gap: 8px;">
              <span>🚨 EXCEPTION #GP (General Protection Fault, Interrupt 13)!</span>
            </div>
            <div style="font-size: 11px; margin-top: 4px; color: var(--ink-black);">
              Offset ${this.toHex8(off)}H exceeds segment limit ${this.toHex8(desc.limit)}H. Translation aborted by hardware.
            </div>
          ` : `
            <div style="color: var(--pentium-mint-dark); font-weight: 900;">
              ✓ Segment Boundary Check Passed: Offset ${this.toHex8(off)}H ≤ Limit ${this.toHex8(desc.limit)}H
            </div>
            <div style="font-size: 15px; margin-top: 4px; color: var(--ink-black);">
              Computed 32-Bit Linear Address = Base (${this.toHex8(desc.base)}H) + Offset (${this.toHex8(off)}H) = <strong>${this.toHex8(linearAddr)}H</strong>
            </div>
          `}
        </div>
      </div>
    `;
  }

  attachEvents() {
    const btn8086 = document.getElementById('btn-seg-8086');
    const btn386 = document.getElementById('btn-seg-386');
    if (btn8086) btn8086.addEventListener('click', () => { this.mode = '8086'; this.render(); });
    if (btn386) btn386.addEventListener('click', () => { this.mode = '386'; this.render(); });

    // 8086 inputs
    const segIn = document.getElementById('input-seg-8086');
    const offIn = document.getElementById('input-off-8086');
    if (segIn) {
      segIn.addEventListener('input', () => {
        const val = parseInt(segIn.value, 16);
        if (!isNaN(val)) {
          this.seg8086 = val & 0xffff;
          this.render();
        }
      });
    }
    if (offIn) {
      offIn.addEventListener('input', () => {
        const val = parseInt(offIn.value, 16);
        if (!isNaN(val)) {
          this.offset8086 = val & 0xffff;
          this.render();
        }
      });
    }

    // 8086 presets
    const segPresets = this.container.querySelectorAll('[data-seg-preset]');
    segPresets.forEach(b => {
      b.addEventListener('click', () => {
        const [s, o] = b.getAttribute('data-seg-preset').split(',');
        this.seg8086 = parseInt(s, 16);
        this.offset8086 = parseInt(o, 16);
        this.render();
      });
    });

    // 386 inputs
    const selIn = document.getElementById('input-sel-386');
    const off386In = document.getElementById('input-off-386');
    if (selIn) {
      selIn.addEventListener('input', () => {
        const val = parseInt(selIn.value, 16);
        if (!isNaN(val)) {
          this.selector386 = val & 0xffff;
          this.render();
        }
      });
    }
    if (off386In) {
      off386In.addEventListener('input', () => {
        const val = parseInt(off386In.value, 16);
        if (!isNaN(val)) {
          this.offset386 = val >>> 0;
          this.render();
        }
      });
    }

    // 386 presets
    const selPresets = this.container.querySelectorAll('[data-sel-preset]');
    selPresets.forEach(b => {
      b.addEventListener('click', () => {
        const [s, o] = b.getAttribute('data-sel-preset').split(',');
        this.selector386 = parseInt(s, 16);
        this.offset386 = parseInt(o, 16);
        this.render();
      });
    });
  }
}
