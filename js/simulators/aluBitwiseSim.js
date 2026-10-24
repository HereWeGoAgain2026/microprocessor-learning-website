/* ==========================================================================
   ALU & BITWISE LOGIC SIMULATOR (8086 / 80386DX)
   Arithmetic operations, bitwise logic, shift/rotate, and full flags engine
   ========================================================================== */

export class AluBitwiseSim {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.op1 = 0x7F;       // Default: +127 decimal
    this.op2 = 0x01;       // Default: +1 decimal
    this.operation = 'ADD';
    this.carryIn = 0;
    this.bitWidth = 8;     // 8-bit or 16-bit
    this.result = 0;
    this.flags = { CF: 0, OF: 0, ZF: 0, SF: 0, AF: 0, PF: 0 };
    this.calculate();
    this.render();
  }

  calculate() {
    const mask = this.bitWidth === 8 ? 0xFF : 0xFFFF;
    const signBit = this.bitWidth === 8 ? 0x80 : 0x8000;
    const a = this.op1 & mask;
    const b = this.op2 & mask;
    let res = 0;
    let cf = 0;
    let of = 0;
    let af = 0;

    switch (this.operation) {
      case 'ADD': {
        const fullSum = a + b;
        res = fullSum & mask;
        cf = fullSum > mask ? 1 : 0;
        // OF = carry into MSB XOR carry out of MSB
        // For signed numbers: adding 2 positives gives negative OR adding 2 negatives gives positive
        const aSign = (a & signBit) !== 0;
        const bSign = (b & signBit) !== 0;
        const rSign = (res & signBit) !== 0;
        of = (aSign === bSign && aSign !== rSign) ? 1 : 0;
        af = ((a & 0x0F) + (b & 0x0F)) > 0x0F ? 1 : 0;
        break;
      }

      case 'ADC': {
        const fullSum = a + b + this.carryIn;
        res = fullSum & mask;
        cf = fullSum > mask ? 1 : 0;
        const aSign = (a & signBit) !== 0;
        const bSign = (b & signBit) !== 0;
        const rSign = (res & signBit) !== 0;
        of = (aSign === bSign && aSign !== rSign) ? 1 : 0;
        af = ((a & 0x0F) + (b & 0x0F) + this.carryIn) > 0x0F ? 1 : 0;
        break;
      }

      case 'SUB':
      case 'CMP': {
        const diff = a - b;
        res = diff & mask;
        cf = a < b ? 1 : 0;
        const aSign = (a & signBit) !== 0;
        const bSign = (b & signBit) !== 0;
        const rSign = (res & signBit) !== 0;
        of = (aSign !== bSign && aSign !== rSign) ? 1 : 0;
        af = (a & 0x0F) < (b & 0x0F) ? 1 : 0;
        break;
      }

      case 'SBB': {
        const diff = a - b - this.carryIn;
        res = diff & mask;
        cf = a < (b + this.carryIn) ? 1 : 0;
        const aSign = (a & signBit) !== 0;
        const bSign = (b & signBit) !== 0;
        const rSign = (res & signBit) !== 0;
        of = (aSign !== bSign && aSign !== rSign) ? 1 : 0;
        af = (a & 0x0F) < ((b & 0x0F) + this.carryIn) ? 1 : 0;
        break;
      }

      case 'AND':
      case 'TEST': {
        res = a & b;
        cf = 0; of = 0; af = 0;
        break;
      }

      case 'OR': {
        res = a | b;
        cf = 0; of = 0; af = 0;
        break;
      }

      case 'XOR': {
        res = a ^ b;
        cf = 0; of = 0; af = 0;
        break;
      }

      case 'NOT': {
        res = (~a) & mask;
        // Flags unaffected by NOT!
        this.result = res;
        return;
      }

      case 'SHL': {
        const count = b & 0x1F;
        cf = count > 0 ? ((a >> (this.bitWidth - count)) & 1) : 0;
        res = (a << count) & mask;
        of = ((res & signBit) !== (a & signBit)) ? 1 : 0;
        break;
      }

      case 'SHR': {
        const count = b & 0x1F;
        cf = count > 0 ? ((a >> (count - 1)) & 1) : 0;
        res = (a >>> count) & mask;
        of = (a & signBit) ? 1 : 0;
        break;
      }

      case 'SAR': {
        const count = b & 0x1F;
        cf = count > 0 ? ((a >> (count - 1)) & 1) : 0;
        // Convert to signed JavaScript integer for true sign extension
        const signedA = this.bitWidth === 8 ? (a << 24) >> 24 : (a << 16) >> 16;
        res = (signedA >> count) & mask;
        of = 0;
        break;
      }

      case 'ROL': {
        const count = (b & 0x07);
        res = ((a << count) | (a >> (this.bitWidth - count))) & mask;
        cf = res & 1;
        of = ((res & signBit) !== 0) ^ (cf === 1) ? 1 : 0;
        break;
      }

      case 'ROR': {
        const count = (b & 0x07);
        res = ((a >> count) | (a << (this.bitWidth - count))) & mask;
        cf = (res & signBit) ? 1 : 0;
        of = ((res & signBit) !== ((res & (signBit >> 1)) << 1)) ? 1 : 0;
        break;
      }
    }

    this.result = res;
    // Calculate Zero Flag (ZF)
    const zf = res === 0 ? 1 : 0;
    // Calculate Sign Flag (SF)
    const sf = (res & signBit) ? 1 : 0;
    // Calculate Parity Flag (PF: 1 if lowest 8 bits contain even number of 1s)
    let pCount = 0;
    let tempByte = res & 0xFF;
    while (tempByte > 0) {
      if (tempByte & 1) pCount++;
      tempByte >>= 1;
    }
    const pf = (pCount % 2 === 0) ? 1 : 0;

    this.flags = { CF: cf, OF: of, ZF: zf, SF: sf, AF: af, PF: pf };
  }

  toBin(val, width) {
    return (val >>> 0).toString(2).padStart(width, '0');
  }

  toHex(val, width) {
    const pad = width === 8 ? 2 : 4;
    return val.toString(16).toUpperCase().padStart(pad, '0');
  }

  render() {
    if (!this.container) return;
    const mask = this.bitWidth === 8 ? 0xFF : 0xFFFF;
    const aBin = this.toBin(this.op1 & mask, this.bitWidth);
    const bBin = this.toBin(this.op2 & mask, this.bitWidth);
    const resBin = this.toBin(this.result & mask, this.bitWidth);

    this.container.innerHTML = `
      <div class="paper-card card-ivory">
        <div class="tape-banner tape-cyan tape-pinned">BINARY ALU & BITWISE WORKBENCH</div>

        <div style="margin-top: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
            Inspect bit-by-bit ALU logic, sign reproduction, and the CF vs OF flag split.
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="tactile-btn btn-sm ${this.bitWidth === 8 ? 'btn-primary' : ''}" id="btn-width-8">8-Bit</button>
            <button class="tactile-btn btn-sm ${this.bitWidth === 16 ? 'btn-primary' : ''}" id="btn-width-16">16-Bit</button>
          </div>
        </div>

        <!-- Operation Selector Pills -->
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px;">
          ${['ADD', 'ADC', 'SUB', 'SBB', 'CMP', 'AND', 'OR', 'XOR', 'NOT', 'TEST', 'SHL', 'SHR', 'SAR', 'ROL', 'ROR'].map(op => `
            <button class="tactile-btn btn-sm ${this.operation === op ? 'btn-accent' : ''}" data-alu-op="${op}">${op}</button>
          `).join('')}
        </div>

        <!-- Interactive Operands Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- Operand 1 (AL / AX) -->
          <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 14px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan);">
                OPERAND 1 (Accumulator ${this.bitWidth === 8 ? 'AL' : 'AX'})
              </span>
              <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 800;">
                Hex: <input type="text" id="op1-hex-input" value="${this.toHex(this.op1, this.bitWidth)}" style="width: 60px; font-family: var(--font-mono); font-weight: 900; text-align: center; border: 1.5px solid #000; border-radius: 4px;" />H
              </span>
            </div>
            <!-- Clickable Bit Row for Operand 1 -->
            <div class="bit-row" id="op1-bit-row">
              ${this.renderBitCells(aBin, 'op1')}
            </div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted); margin-top: 4px;">
              Signed Dec: <strong>${this.toSignedDec(this.op1, this.bitWidth)}</strong> | Unsigned: <strong>${this.op1 & mask}</strong>
            </div>
          </div>

          <!-- Operand 2 (BL / BX or Shift Count) -->
          <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 14px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-purple);">
                OPERAND 2 (${this.bitWidth === 8 ? 'BL' : 'BX'} / Count)
              </span>
              <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 800;">
                Hex: <input type="text" id="op2-hex-input" value="${this.toHex(this.op2, this.bitWidth)}" style="width: 60px; font-family: var(--font-mono); font-weight: 900; text-align: center; border: 1.5px solid #000; border-radius: 4px;" />H
              </span>
            </div>
            <!-- Clickable Bit Row for Operand 2 -->
            <div class="bit-row" id="op2-bit-row">
              ${this.renderBitCells(bBin, 'op2')}
            </div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted); margin-top: 4px;">
              Signed Dec: <strong>${this.toSignedDec(this.op2, this.bitWidth)}</strong> | Unsigned: <strong>${this.op2 & mask}</strong>
            </div>
          </div>
        </div>

        <!-- Carry-In Toggle (for ADC/SBB) -->
        ${['ADC', 'SBB'].includes(this.operation) ? `
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; background: var(--pentium-yellow-pale); border: 2px solid var(--ink-black); border-radius: 6px; padding: 8px 14px;">
            <span style="font-family: var(--font-mono); font-weight: 900; font-size: 12px;">Active Carry-In (CF):</span>
            <button class="tactile-btn btn-sm ${this.carryIn ? 'btn-primary' : ''}" id="btn-toggle-carry-in">
              ${this.carryIn ? 'CF = 1' : 'CF = 0'}
            </button>
          </div>
        ` : ''}

        <!-- Result Visualizer Row -->
        <div style="background: var(--pentium-slate-dark); color: #fff; border: var(--border-thick); border-radius: 8px; padding: 18px; box-shadow: var(--shadow-md); margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 900; color: var(--pentium-yellow);">
              RESULT OF ${this.operation} (${this.toHex(this.op1, this.bitWidth)}H ${this.operation} ${this.toHex(this.op2, this.bitWidth)}H)
            </span>
            <span style="font-family: var(--font-mono); font-size: 16px; font-weight: 900; color: var(--pentium-cyan-light);">
              ${this.toHex(this.result, this.bitWidth)}H
            </span>
          </div>
          <!-- Result Bit Stream -->
          <div class="bit-row" style="color: var(--ink-black);">
            ${this.renderResultBits(resBin)}
          </div>
          <div style="font-family: var(--font-mono); font-size: 12px; display: flex; gap: 20px; margin-top: 8px; color: #94a3b8;">
            <span>Signed Dec: <strong style="color: #fff;">${this.toSignedDec(this.result, this.bitWidth)}</strong></span>
            <span>Unsigned Dec: <strong style="color: #fff;">${this.result & mask}</strong></span>
          </div>
        </div>

        <!-- Status Flags Register Panel -->
        <div style="background: var(--card-white); border: var(--border-thick); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
          <div style="font-family: var(--font-display); font-size: 13px; color: var(--ink-black); margin-bottom: 12px; letter-spacing: 0.05em;">
            STATUS FLAGS GENERATED BY ALU
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 10px;">
            ${this.renderFlagBox('CF', this.flags.CF, 'Carry (Unsigned Ovf)')}
            ${this.renderFlagBox('OF', this.flags.OF, 'Overflow (Signed Ovf)')}
            ${this.renderFlagBox('ZF', this.flags.ZF, 'Zero (Result == 0)')}
            ${this.renderFlagBox('SF', this.flags.SF, 'Sign (MSB == 1)')}
            ${this.renderFlagBox('AF', this.flags.AF, 'Aux Carry (Nibble)')}
            ${this.renderFlagBox('PF', this.flags.PF, 'Parity (Even 1s)')}
          </div>

          <!-- Deep-Dive Explanation Note for Carry vs Overflow -->
          <div style="margin-top: 14px; background: var(--card-slate); border-left: 4px solid var(--pentium-cyan); padding: 8px 12px; font-family: var(--font-mono); font-size: 11px; line-height: 1.5;">
            <strong>Exam Analysis:</strong> 
            ${this.flags.CF ? '<span class="hl-coral">CF=1 (Unsigned overflow occurred)</span>' : '<span class="hl-green">CF=0 (Unsigned math fits)</span>'}; 
            ${this.flags.OF ? '<span class="hl-coral">OF=1 (Signed two\'s complement overflowed!)</span>' : '<span class="hl-green">OF=0 (Signed math valid)</span>'}.
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderBitCells(binStr, prefix) {
    const bits = binStr.split('');
    return bits.map((b, idx) => {
      const bitNum = this.bitWidth - 1 - idx;
      const isActive = b === '1';
      return `
        <div class="bit-cell ${isActive ? 'active' : ''}" data-bit-toggle="${prefix}-${bitNum}">
          <span class="bit-num">${bitNum}</span>
          <span class="bit-val">${b}</span>
        </div>
      `;
    }).join('');
  }

  renderResultBits(binStr) {
    const bits = binStr.split('');
    return bits.map((b, idx) => {
      const bitNum = this.bitWidth - 1 - idx;
      const isActive = b === '1';
      return `
        <div class="bit-cell ${isActive ? 'active' : ''}" style="cursor: default;">
          <span class="bit-num">${bitNum}</span>
          <span class="bit-val">${b}</span>
        </div>
      `;
    }).join('');
  }

  renderFlagBox(name, val, desc) {
    const active = val === 1;
    return `
      <div class="flag-box ${active ? 'flag-active' : ''}" title="${desc}">
        <span class="flag-name">${name}</span>
        <span class="flag-val">${val}</span>
      </div>
    `;
  }

  toSignedDec(val, width) {
    if (width === 8) {
      return (val << 24) >> 24;
    } else {
      return (val << 16) >> 16;
    }
  }

  attachEvents() {
    // Width toggles
    const w8 = document.getElementById('btn-width-8');
    const w16 = document.getElementById('btn-width-16');
    if (w8) w8.addEventListener('click', () => { this.bitWidth = 8; this.calculate(); this.render(); });
    if (w16) w16.addEventListener('click', () => { this.bitWidth = 16; this.calculate(); this.render(); });

    // Operation pills
    const opBtns = this.container.querySelectorAll('[data-alu-op]');
    opBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.operation = btn.getAttribute('data-alu-op');
        this.calculate();
        this.render();
      });
    });

    // Carry in toggle
    const carryBtn = document.getElementById('btn-toggle-carry-in');
    if (carryBtn) {
      carryBtn.addEventListener('click', () => {
        this.carryIn = this.carryIn === 1 ? 0 : 1;
        this.calculate();
        this.render();
      });
    }

    // Hex input boxes
    const op1Hex = document.getElementById('op1-hex-input');
    const op2Hex = document.getElementById('op2-hex-input');
    if (op1Hex) {
      op1Hex.addEventListener('change', () => {
        const val = parseInt(op1Hex.value, 16);
        if (!isNaN(val)) {
          this.op1 = val;
          this.calculate();
          this.render();
        }
      });
    }
    if (op2Hex) {
      op2Hex.addEventListener('change', () => {
        const val = parseInt(op2Hex.value, 16);
        if (!isNaN(val)) {
          this.op2 = val;
          this.calculate();
          this.render();
        }
      });
    }

    // Bit toggles
    const bitCells = this.container.querySelectorAll('[data-bit-toggle]');
    bitCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const [target, bitIdx] = cell.getAttribute('data-bit-toggle').split('-');
        const bit = Number(bitIdx);
        if (target === 'op1') {
          this.op1 ^= (1 << bit);
        } else {
          this.op2 ^= (1 << bit);
        }
        this.calculate();
        this.render();
      });
    });
  }
}
