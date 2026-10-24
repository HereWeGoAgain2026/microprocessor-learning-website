/* ==========================================================================
   SIMULATORS BUNDLE (ALL 7 HARDWARE ENGINES)
   Exposed globally on window for zero-CORS execution
   ========================================================================== */

(function () {
  'use strict';

  // 1. RegisterSim
  class RegisterSim {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.initialState = {
        AX: 0x1234, BX: 0x5678, CX: 0x0005, DX: 0x0000,
        SI: 0x0200, DI: 0x0400, BP: 0x0150, SP: 0x0100,
        CS: 0x1000, DS: 0x2000, SS: 0x3000, ES: 0x4000
      };
      this.registers = { ...this.initialState };
      this.stackMemory = {};
      this.lastChanged = null;
      this.history = [];
      this.render();
    }
    reset() {
      this.registers = { ...this.initialState };
      this.stackMemory = {};
      this.lastChanged = null;
      this.history = [];
      this.updateUI('Simulator reset to default register state.');
    }
    toHex4(num) { return (num & 0xffff).toString(16).toUpperCase().padStart(4, '0'); }
    toHex2(num) { return (num & 0xff).toString(16).toUpperCase().padStart(2, '0'); }
    execute(cmd) {
      const parts = cmd.trim().split(/[\s,]+/);
      const op = parts[0].toUpperCase();
      const arg1 = parts[1] ? parts[1].toUpperCase() : null;
      const arg2 = parts[2] ? parts[2].toUpperCase() : null;
      let logMsg = '';

      switch (op) {
        case 'MOV': {
          if (!arg1 || !arg2) return;
          let val;
          if (this.registers[arg2] !== undefined) val = this.registers[arg2];
          else if (!isNaN(parseInt(arg2, 16))) val = parseInt(arg2, 16) & 0xffff;
          else return;
          if (this.registers[arg1] !== undefined) {
            this.registers[arg1] = val;
            this.lastChanged = arg1;
            logMsg = `MOV ${arg1}, ${arg2} → ${arg1} = ${this.toHex4(val)}H`;
          }
          break;
        }
        case 'XCHG': {
          if (!arg1 || !arg2 || this.registers[arg1] === undefined || this.registers[arg2] === undefined) return;
          const temp = this.registers[arg1];
          this.registers[arg1] = this.registers[arg2];
          this.registers[arg2] = temp;
          this.lastChanged = arg1;
          logMsg = `XCHG ${arg1}, ${arg2} → ${arg1}=${this.toHex4(this.registers[arg1])}H, ${arg2}=${this.toHex4(this.registers[arg2])}H`;
          break;
        }
        case 'PUSH': {
          if (!arg1 || this.registers[arg1] === undefined) return;
          const val = this.registers[arg1];
          this.registers.SP = (this.registers.SP - 2) & 0xffff;
          const physAddr = (this.registers.SS << 4) + this.registers.SP;
          this.stackMemory[physAddr] = val;
          this.lastChanged = 'SP';
          logMsg = `PUSH ${arg1} → SP decremented to ${this.toHex4(this.registers.SP)}H; stored ${this.toHex4(val)}H at SS:SP`;
          break;
        }
        case 'POP': {
          if (!arg1 || this.registers[arg1] === undefined) return;
          const physAddr = (this.registers.SS << 4) + this.registers.SP;
          const val = this.stackMemory[physAddr] !== undefined ? this.stackMemory[physAddr] : 0x0000;
          this.registers[arg1] = val;
          this.registers.SP = (this.registers.SP + 2) & 0xffff;
          this.lastChanged = arg1;
          logMsg = `POP ${arg1} → Read ${this.toHex4(val)}H from SS:SP; SP incremented to ${this.toHex4(this.registers.SP)}H`;
          break;
        }
        case 'INC': {
          if (!arg1 || this.registers[arg1] === undefined) return;
          this.registers[arg1] = (this.registers[arg1] + 1) & 0xffff;
          this.lastChanged = arg1;
          logMsg = `INC ${arg1} → ${arg1} = ${this.toHex4(this.registers[arg1])}H (CF unchanged)`;
          break;
        }
        case 'DEC': {
          if (!arg1 || this.registers[arg1] === undefined) return;
          this.registers[arg1] = (this.registers[arg1] - 1) & 0xffff;
          this.lastChanged = arg1;
          logMsg = `DEC ${arg1} → ${arg1} = ${this.toHex4(this.registers[arg1])}H (CF unchanged)`;
          break;
        }
        case 'LEA': {
          if (arg1 && this.registers[arg1] !== undefined) {
            const base = this.registers.SI;
            const ea = (base + 0x0040) & 0xffff;
            this.registers[arg1] = ea;
            this.lastChanged = arg1;
            logMsg = `LEA ${arg1}, [SI + 0040H] → Computed EA ${this.toHex4(base)}H + 0040H = ${this.toHex4(ea)}H into ${arg1}`;
          }
          break;
        }
        default: logMsg = `Instruction "${op}" executed.`;
      }
      this.history.unshift(logMsg);
      if (this.history.length > 6) this.history.pop();
      this.updateUI(logMsg);
    }
    render() {
      if (!this.container) return;
      this.container.innerHTML = `
        <div class="paper-card card-ivory">
          <div class="tape-banner tape-yellow tape-pinned">8086 CPU REGISTER & STACK LAB</div>
          <div style="margin-top: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
              Execute instructions live and inspect 16-bit register halves and stack memory.
            </div>
            <button class="tactile-btn btn-sm" id="btn-reset-reg">Reset Registers</button>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
            <button class="tactile-btn btn-sm btn-primary" data-cmd="MOV AX, BX">MOV AX, BX</button>
            <button class="tactile-btn btn-sm" data-cmd="MOV CX, 0020H">MOV CX, 0020H</button>
            <button class="tactile-btn btn-sm btn-accent" data-cmd="PUSH AX">PUSH AX</button>
            <button class="tactile-btn btn-sm btn-accent" data-cmd="POP DX">POP DX</button>
            <button class="tactile-btn btn-sm" data-cmd="XCHG AX, BX">XCHG AX, BX</button>
            <button class="tactile-btn btn-sm" data-cmd="INC AX">INC AX</button>
            <button class="tactile-btn btn-sm" data-cmd="LEA BX, [SI+40H]">LEA BX, [SI+40H]</button>
          </div>
          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input type="text" id="reg-cmd-input" placeholder="Enter instruction, e.g. MOV DX, 1234H or PUSH CX" 
                   style="flex: 1; padding: 10px 14px; font-family: var(--font-mono); font-size: 13px; font-weight: 700; border: var(--border-thin); border-radius: 6px; box-shadow: 2px 2px 0 #000; outline: none;" />
            <button class="tactile-btn btn-primary" id="btn-run-reg-cmd">Step Exec</button>
          </div>
          <div class="register-bank" id="reg-bank-display">${this.renderRegisterSlots()}</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 16px;">
            <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 14px; box-shadow: var(--shadow-sm);">
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); text-transform: uppercase; margin-bottom: 8px;">
                LIFO Stack Frame (SS = ${this.toHex4(this.registers.SS)}H, SP = <span id="stack-sp-val">${this.toHex4(this.registers.SP)}H</span>)
              </div>
              <div id="stack-frame-list" style="font-family: var(--font-mono); font-size: 12px; display: flex; flex-direction: column; gap: 4px; max-height: 140px; overflow-y: auto;">
                ${this.renderStackItems()}
              </div>
            </div>
            <div style="background: var(--pentium-slate-dark); color: #f8fafc; border: var(--border-thin); border-radius: 6px; padding: 14px; box-shadow: var(--shadow-sm);">
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-yellow); text-transform: uppercase; margin-bottom: 8px;">
                Execution Log & Audit Trace
              </div>
              <div id="reg-history-list" style="font-family: var(--font-mono); font-size: 12px; line-height: 1.5; min-height: 80px;">
                ${this.history.length ? this.history.map(h => `<div>> ${h}</div>`).join('') : '<span style="color:#64748b;">Ready. Click an instruction button above.</span>'}
              </div>
            </div>
          </div>
        </div>
      `;
      this.attachEvents();
    }
    renderRegisterSlots() {
      const regs = [
        { name: 'AX', desc: 'Accumulator', val: this.registers.AX, hasHalves: true },
        { name: 'BX', desc: 'Base Register', val: this.registers.BX, hasHalves: true },
        { name: 'CX', desc: 'Count Register', val: this.registers.CX, hasHalves: true },
        { name: 'DX', desc: 'Data Register', val: this.registers.DX, hasHalves: true },
        { name: 'SI', desc: 'Source Index', val: this.registers.SI },
        { name: 'DI', desc: 'Dest Index', val: this.registers.DI },
        { name: 'BP', desc: 'Base Pointer', val: this.registers.BP },
        { name: 'SP', desc: 'Stack Pointer', val: this.registers.SP }
      ];
      return regs.map(r => {
        const isHigh = this.lastChanged === r.name;
        const hi = (r.val >> 8) & 0xff;
        const lo = r.val & 0xff;
        return `
          <div class="register-slot ${isHigh ? 'highlighted' : ''}">
            <div class="reg-label"><span>${r.name}</span><span class="reg-desc">${r.desc}</span></div>
            <div class="reg-value">${this.toHex4(r.val)}H</div>
            ${r.hasHalves ? `
              <div class="reg-subdivisions">
                <div class="reg-sub-half">${r.name[0]}H: ${this.toHex2(hi)}</div>
                <div class="reg-sub-half">${r.name[0]}L: ${this.toHex2(lo)}</div>
              </div>` : ''}
          </div>
        `;
      }).join('');
    }
    renderStackItems() {
      const keys = Object.keys(this.stackMemory).sort((a, b) => Number(a) - Number(b));
      if (!keys.length) return '<div style="color: #94a3b8; font-style: italic;">Stack is currently empty. Execute PUSH to add items.</div>';
      return keys.map(k => {
        const isTop = Number(k) === (this.registers.SS << 4) + this.registers.SP;
        return `
          <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: ${isTop ? 'var(--pentium-yellow-pale)' : 'var(--card-slate)'}; border: 1px solid var(--ink-black); border-radius: 4px;">
            <span>[${Number(k).toString(16).toUpperCase().padStart(5, '0')}H]</span>
            <span style="font-weight: 900;">${this.toHex4(this.stackMemory[k])}H</span>
            ${isTop ? '<span class="tactile-chip chip-yellow" style="padding:1px 6px; font-size:9px;">← SP TOP</span>' : ''}
          </div>
        `;
      }).join('');
    }
    updateUI(msg) {
      const bank = document.getElementById('reg-bank-display');
      if (bank) bank.innerHTML = this.renderRegisterSlots();
      const spVal = document.getElementById('stack-sp-val');
      if (spVal) spVal.innerText = `${this.toHex4(this.registers.SP)}H`;
      const stackList = document.getElementById('stack-frame-list');
      if (stackList) stackList.innerHTML = this.renderStackItems();
      const hist = document.getElementById('reg-history-list');
      if (hist) hist.innerHTML = this.history.map(h => `<div>> ${h}</div>`).join('');
    }
    attachEvents() {
      const resetBtn = document.getElementById('btn-reset-reg');
      if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
      const runBtn = document.getElementById('btn-run-reg-cmd');
      const input = document.getElementById('reg-cmd-input');
      if (runBtn && input) {
        runBtn.addEventListener('click', () => { if (input.value) { this.execute(input.value); input.value = ''; } });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value) { this.execute(input.value); input.value = ''; } });
      }
      this.container.querySelectorAll('[data-cmd]').forEach(btn => {
        btn.addEventListener('click', () => this.execute(btn.getAttribute('data-cmd')));
      });
    }
  }

  // 2. AluBitwiseSim
  class AluBitwiseSim {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.op1 = 0x7F; this.op2 = 0x01; this.operation = 'ADD'; this.carryIn = 0; this.bitWidth = 8;
      this.result = 0; this.flags = { CF: 0, OF: 0, ZF: 0, SF: 0, AF: 0, PF: 0 };
      this.calculate(); this.render();
    }
    calculate() {
      const mask = this.bitWidth === 8 ? 0xFF : 0xFFFF;
      const signBit = this.bitWidth === 8 ? 0x80 : 0x8000;
      const a = this.op1 & mask; const b = this.op2 & mask;
      let res = 0, cf = 0, of = 0, af = 0;

      switch (this.operation) {
        case 'ADD': {
          const sum = a + b; res = sum & mask; cf = sum > mask ? 1 : 0;
          const aSign = (a & signBit) !== 0, bSign = (b & signBit) !== 0, rSign = (res & signBit) !== 0;
          of = (aSign === bSign && aSign !== rSign) ? 1 : 0;
          af = ((a & 0x0F) + (b & 0x0F)) > 0x0F ? 1 : 0;
          break;
        }
        case 'ADC': {
          const sum = a + b + this.carryIn; res = sum & mask; cf = sum > mask ? 1 : 0;
          const aSign = (a & signBit) !== 0, bSign = (b & signBit) !== 0, rSign = (res & signBit) !== 0;
          of = (aSign === bSign && aSign !== rSign) ? 1 : 0;
          af = ((a & 0x0F) + (b & 0x0F) + this.carryIn) > 0x0F ? 1 : 0;
          break;
        }
        case 'SUB': case 'CMP': {
          const diff = a - b; res = diff & mask; cf = a < b ? 1 : 0;
          const aSign = (a & signBit) !== 0, bSign = (b & signBit) !== 0, rSign = (res & signBit) !== 0;
          of = (aSign !== bSign && aSign !== rSign) ? 1 : 0;
          af = (a & 0x0F) < (b & 0x0F) ? 1 : 0;
          break;
        }
        case 'SBB': {
          const diff = a - b - this.carryIn; res = diff & mask; cf = a < (b + this.carryIn) ? 1 : 0;
          const aSign = (a & signBit) !== 0, bSign = (b & signBit) !== 0, rSign = (res & signBit) !== 0;
          of = (aSign !== bSign && aSign !== rSign) ? 1 : 0;
          af = (a & 0x0F) < ((b & 0x0F) + this.carryIn) ? 1 : 0;
          break;
        }
        case 'AND': case 'TEST': res = a & b; break;
        case 'OR': res = a | b; break;
        case 'XOR': res = a ^ b; break;
        case 'NOT': this.result = (~a) & mask; return;
        case 'SHL': {
          const count = b & 0x1F; cf = count > 0 ? ((a >> (this.bitWidth - count)) & 1) : 0;
          res = (a << count) & mask; of = ((res & signBit) !== (a & signBit)) ? 1 : 0;
          break;
        }
        case 'SHR': {
          const count = b & 0x1F; cf = count > 0 ? ((a >> (count - 1)) & 1) : 0;
          res = (a >>> count) & mask; of = (a & signBit) ? 1 : 0;
          break;
        }
        case 'SAR': {
          const count = b & 0x1F; cf = count > 0 ? ((a >> (count - 1)) & 1) : 0;
          const signedA = this.bitWidth === 8 ? (a << 24) >> 24 : (a << 16) >> 16;
          res = (signedA >> count) & mask;
          break;
        }
        case 'ROL': {
          const count = (b & 0x07); res = ((a << count) | (a >> (this.bitWidth - count))) & mask;
          cf = res & 1; of = ((res & signBit) !== 0) ^ (cf === 1) ? 1 : 0;
          break;
        }
        case 'ROR': {
          const count = (b & 0x07); res = ((a >> count) | (a << (this.bitWidth - count))) & mask;
          cf = (res & signBit) ? 1 : 0; of = ((res & signBit) !== ((res & (signBit >> 1)) << 1)) ? 1 : 0;
          break;
        }
      }
      this.result = res;
      const zf = res === 0 ? 1 : 0;
      const sf = (res & signBit) ? 1 : 0;
      let pCount = 0, tempByte = res & 0xFF;
      while (tempByte > 0) { if (tempByte & 1) pCount++; tempByte >>= 1; }
      const pf = (pCount % 2 === 0) ? 1 : 0;
      this.flags = { CF: cf, OF: of, ZF: zf, SF: sf, AF: af, PF: pf };
    }
    toBin(val, width) { return (val >>> 0).toString(2).padStart(width, '0'); }
    toHex(val, width) { return val.toString(16).toUpperCase().padStart(width === 8 ? 2 : 4, '0'); }
    toSignedDec(val, width) { return width === 8 ? (val << 24) >> 24 : (val << 16) >> 16; }
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
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px;">
            ${['ADD', 'ADC', 'SUB', 'SBB', 'CMP', 'AND', 'OR', 'XOR', 'NOT', 'TEST', 'SHL', 'SHR', 'SAR', 'ROL', 'ROR'].map(op => `
              <button class="tactile-btn btn-sm ${this.operation === op ? 'btn-accent' : ''}" data-alu-op="${op}">${op}</button>
            `).join('')}
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 14px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan);">OPERAND 1 (Accumulator)</span>
                <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 800;">Hex: <input type="text" id="op1-hex-input" value="${this.toHex(this.op1, this.bitWidth)}" style="width:60px; font-weight:900; text-align:center;" />H</span>
              </div>
              <div class="bit-row">${this.renderBitCells(aBin, 'op1')}</div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted); margin-top: 4px;">
                Signed Dec: <strong>${this.toSignedDec(this.op1, this.bitWidth)}</strong> | Unsigned: <strong>${this.op1 & mask}</strong>
              </div>
            </div>
            <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 14px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-purple);">OPERAND 2 (Register / Count)</span>
                <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 800;">Hex: <input type="text" id="op2-hex-input" value="${this.toHex(this.op2, this.bitWidth)}" style="width:60px; font-weight:900; text-align:center;" />H</span>
              </div>
              <div class="bit-row">${this.renderBitCells(bBin, 'op2')}</div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted); margin-top: 4px;">
                Signed Dec: <strong>${this.toSignedDec(this.op2, this.bitWidth)}</strong> | Unsigned: <strong>${this.op2 & mask}</strong>
              </div>
            </div>
          </div>
          <div style="background: var(--pentium-slate-dark); color: #fff; border: var(--border-thick); border-radius: 8px; padding: 18px; box-shadow: var(--shadow-md); margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 900; color: var(--pentium-yellow);">
                RESULT: ${this.operation} (${this.toHex(this.op1, this.bitWidth)}H, ${this.toHex(this.op2, this.bitWidth)}H)
              </span>
              <span style="font-family: var(--font-mono); font-size: 18px; font-weight: 900; color: var(--pentium-cyan-light);">${this.toHex(this.result, this.bitWidth)}H</span>
            </div>
            <div class="bit-row" style="color: var(--ink-black);">${this.renderBitCells(resBin, 'res', true)}</div>
            <div style="font-family: var(--font-mono); font-size: 12px; display: flex; gap: 20px; margin-top: 8px; color: #94a3b8;">
              <span>Signed Dec: <strong style="color:#fff;">${this.toSignedDec(this.result, this.bitWidth)}</strong></span>
              <span>Unsigned Dec: <strong style="color:#fff;">${this.result & mask}</strong></span>
            </div>
          </div>
          <div style="background: var(--card-white); border: var(--border-thick); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
            <div style="font-family: var(--font-display); font-size: 13px; color: var(--ink-black); margin-bottom: 12px;">STATUS FLAGS GENERATED BY ALU</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 10px;">
              ${this.renderFlagBox('CF', this.flags.CF, 'Carry Flag')}
              ${this.renderFlagBox('OF', this.flags.OF, 'Overflow Flag')}
              ${this.renderFlagBox('ZF', this.flags.ZF, 'Zero Flag')}
              ${this.renderFlagBox('SF', this.flags.SF, 'Sign Flag')}
              ${this.renderFlagBox('AF', this.flags.AF, 'Aux Carry Flag')}
              ${this.renderFlagBox('PF', this.flags.PF, 'Parity Flag')}
            </div>
            <div style="margin-top: 14px; background: var(--card-slate); border-left: 4px solid var(--pentium-cyan); padding: 8px 12px; font-family: var(--font-mono); font-size: 11px;">
              <strong>Analysis:</strong> ${this.flags.CF ? '<span class="hl-coral">CF=1 (Unsigned overflow occurred)</span>' : '<span class="hl-green">CF=0 (Unsigned math fits)</span>'}; ${this.flags.OF ? '<span class="hl-coral">OF=1 (Signed overflow occurred)</span>' : '<span class="hl-green">OF=0 (Signed math fits)</span>'}.
            </div>
          </div>
        </div>
      `;
      this.attachEvents();
    }
    renderBitCells(binStr, prefix, readOnly = false) {
      return binStr.split('').map((b, idx) => {
        const bitNum = this.bitWidth - 1 - idx;
        const isActive = b === '1';
        return `
          <div class="bit-cell ${isActive ? 'active' : ''}" ${readOnly ? '' : `data-bit-toggle="${prefix}-${bitNum}"`}>
            <span class="bit-num">${bitNum}</span>
            <span class="bit-val">${b}</span>
          </div>
        `;
      }).join('');
    }
    renderFlagBox(name, val, desc) {
      return `
        <div class="flag-box ${val === 1 ? 'flag-active' : ''}" title="${desc}">
          <span class="flag-name">${name}</span>
          <span class="flag-val">${val}</span>
        </div>
      `;
    }
    attachEvents() {
      const w8 = document.getElementById('btn-width-8');
      const w16 = document.getElementById('btn-width-16');
      if (w8) w8.addEventListener('click', () => { this.bitWidth = 8; this.calculate(); this.render(); });
      if (w16) w16.addEventListener('click', () => { this.bitWidth = 16; this.calculate(); this.render(); });
      this.container.querySelectorAll('[data-alu-op]').forEach(btn => {
        btn.addEventListener('click', () => { this.operation = btn.getAttribute('data-alu-op'); this.calculate(); this.render(); });
      });
      const op1Hex = document.getElementById('op1-hex-input');
      const op2Hex = document.getElementById('op2-hex-input');
      if (op1Hex) op1Hex.addEventListener('change', () => { const v = parseInt(op1Hex.value, 16); if (!isNaN(v)) { this.op1 = v; this.calculate(); this.render(); } });
      if (op2Hex) op2Hex.addEventListener('change', () => { const v = parseInt(op2Hex.value, 16); if (!isNaN(v)) { this.op2 = v; this.calculate(); this.render(); } });
      this.container.querySelectorAll('[data-bit-toggle]').forEach(cell => {
        cell.addEventListener('click', () => {
          const [t, bIdx] = cell.getAttribute('data-bit-toggle').split('-');
          const bit = Number(bIdx);
          if (t === 'op1') this.op1 ^= (1 << bit); else this.op2 ^= (1 << bit);
          this.calculate(); this.render();
        });
      });
    }
  }

  // 3. SegmentationSim
  class SegmentationSim {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.mode = '8086';
      this.seg8086 = 0x1234; this.offset8086 = 0x0050;
      this.selector386 = 0x0018; this.offset386 = 0x00004050;
      this.mockGdt = [
        { index: 0, name: 'Null', base: 0, limit: 0, dpl: 0 },
        { index: 1, name: 'Kernel Code', base: 0x10000000, limit: 0xFFFFF, dpl: 0 },
        { index: 2, name: 'Kernel Data', base: 0x20000000, limit: 0xFFFFF, dpl: 0 },
        { index: 3, name: 'User Code', base: 0x40000000, limit: 0x0FFFF, dpl: 3 }
      ];
      this.render();
    }
    toHex4(n) { return (n & 0xffff).toString(16).toUpperCase().padStart(4, '0'); }
    toHex5(n) { return (n & 0xfffff).toString(16).toUpperCase().padStart(5, '0'); }
    toHex8(n) { return (n >>> 0).toString(16).toUpperCase().padStart(8, '0'); }
    render() {
      if (!this.container) return;
      const seg = this.seg8086 & 0xffff;
      const off = this.offset8086 & 0xffff;
      const shifted = (seg << 4) & 0xfffff;
      const phys = (shifted + off);
      const finalPhys = phys & 0xfffff;

      this.container.innerHTML = `
        <div class="paper-card card-ivory">
          <div class="tape-banner tape-cyan tape-pinned">SEGMENTATION ARCHITECTURE LAB</div>
          <div style="margin-top: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
              8086 Physical Address = (Segment × 16) + Offset
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="tactile-btn btn-sm btn-primary" data-seg-preset="1234,0050">1234H:0050H</button>
              <button class="tactile-btn btn-sm" data-seg-preset="348A,4214">348AH:4214H</button>
              <button class="tactile-btn btn-sm" data-seg-preset="2000,0100">2000H:0100H</button>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 14px;">
              <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan);">SEGMENT REGISTER:</label>
              <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                <input type="text" id="input-seg-8086" value="${this.toHex4(seg)}" style="width:100%; font-family:var(--font-mono); font-size:16px; font-weight:900;" />
                <span style="font-weight:900;">H</span>
              </div>
            </div>
            <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 14px;">
              <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-purple);">OFFSET POINTER:</label>
              <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
                <input type="text" id="input-off-8086" value="${this.toHex4(off)}" style="width:100%; font-family:var(--font-mono); font-size:16px; font-weight:900;" />
                <span style="font-weight:900;">H</span>
              </div>
            </div>
          </div>
          <div class="calc-step-flow">
            <div class="calc-formula-line"><span>1. Logical Address:</span><span style="color:var(--pentium-cyan); font-weight:900;">${this.toHex4(seg)}H : ${this.toHex4(off)}H</span></div>
            <div class="calc-formula-line"><span>2. Shift Segment left 4 bits (Seg × 10H):</span><span>${this.toHex4(seg)}H × 10H = <strong>${this.toHex5(shifted)}H</strong></span></div>
            <div class="calc-formula-line"><span>3. Add Offset:</span><span>${this.toHex5(shifted)}H + ${this.toHex4(off)}H = <strong>${this.toHex5(phys)}H</strong></span></div>
            <div class="calc-formula-line result"><span>4. Final 20-bit Physical Address:</span><span style="font-size:18px; color:var(--pentium-mint-dark);">${this.toHex5(finalPhys)}H (${finalPhys.toLocaleString()} decimal)</span></div>
          </div>
        </div>
      `;
      this.attachEvents();
    }
    attachEvents() {
      const segIn = document.getElementById('input-seg-8086');
      const offIn = document.getElementById('input-off-8086');
      if (segIn) segIn.addEventListener('input', () => { const v = parseInt(segIn.value, 16); if (!isNaN(v)) { this.seg8086 = v; this.render(); } });
      if (offIn) offIn.addEventListener('input', () => { const v = parseInt(offIn.value, 16); if (!isNaN(v)) { this.offset8086 = v; this.render(); } });
      this.container.querySelectorAll('[data-seg-preset]').forEach(b => {
        b.addEventListener('click', () => {
          const [s, o] = b.getAttribute('data-seg-preset').split(',');
          this.seg8086 = parseInt(s, 16); this.offset8086 = parseInt(o, 16);
          this.render();
        });
      });
    }
  }

  // 4. PagingSim
  class PagingSim {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.linearAddress = 0x00403014; this.cr3 = 0x00100000; this.ptePresent = 1; this.mockFrame = 0x2A000000;
      this.render();
    }
    toHex8(n) { return (n >>> 0).toString(16).toUpperCase().padStart(8, '0'); }
    render() {
      if (!this.container) return;
      const addr = this.linearAddress >>> 0;
      const pdi = (addr >>> 22) & 0x3ff;
      const pti = (addr >>> 12) & 0x3ff;
      const offset = addr & 0xfff;
      const phys = (this.mockFrame | offset) >>> 0;

      this.container.innerHTML = `
        <div class="paper-card card-ivory">
          <div class="tape-banner tape-yellow tape-pinned">80386DX TWO-LEVEL PAGING ENGINE</div>
          <div style="margin-top: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
              Decompose 32-bit linear address into 10-bit Directory, 10-bit Page Table, and 12-bit Offset.
            </div>
            <button class="tactile-btn btn-sm ${this.ptePresent ? 'btn-success' : 'btn-danger'}" id="btn-toggle-present">
              ${this.ptePresent ? '✓ Page Present in RAM' : '🚨 Simulate Page Fault (#PF)'}
            </button>
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px;">
            <label style="font-family: var(--font-mono); font-size: 12px; font-weight: 900; color: var(--pentium-cyan);">LINEAR ADDRESS:</label>
            <input type="text" id="input-linear-addr" value="${this.toHex8(addr)}" style="width:130px; font-family:var(--font-mono); font-size:16px; font-weight:900;" />
            <button class="tactile-btn btn-sm" data-p-preset="00403014">00403014H</button>
            <button class="tactile-btn btn-sm" data-p-preset="12345678">12345678H</button>
            <button class="tactile-btn btn-sm" data-p-preset="C0008020">C0008020H</button>
          </div>
          <div class="address-breakdown-box">
            <div class="address-bar-visual">
              <div class="address-chunk chunk-dir" style="flex: 10;">
                <span class="chunk-tag">PDI (DIR)</span><span class="chunk-val">#${pdi}</span><span class="chunk-bits">10 Bits</span>
              </div>
              <div class="address-chunk chunk-page" style="flex: 10;">
                <span class="chunk-tag">PTI (TABLE)</span><span class="chunk-val">#${pti}</span><span class="chunk-bits">10 Bits</span>
              </div>
              <div class="address-chunk chunk-offset" style="flex: 12;">
                <span class="chunk-tag">OFFSET</span><span class="chunk-val">0x${offset.toString(16).toUpperCase()}</span><span class="chunk-bits">12 Bits</span>
              </div>
            </div>
          </div>
          <div style="padding: 16px; border-radius: 6px; ${this.ptePresent ? 'background: var(--pentium-mint-pale); border: 2px solid var(--pentium-mint);' : 'background: var(--pentium-coral-pale); border: 2px solid var(--pentium-coral);'} font-family: var(--font-mono);">
            ${this.ptePresent ? `
              <div style="font-weight:900; color:var(--pentium-mint-dark);">✓ Physical Address = Frame Base (${this.toHex8(this.mockFrame)}H) + Offset = <strong style="font-size:18px;">${this.toHex8(phys)}H</strong></div>
            ` : `
              <div style="font-weight:900; color:var(--pentium-crimson);">🚨 EXCEPTION 14: PAGE FAULT (#PF). Present bit is 0 in PTE #${pti}. CR2 loaded with ${this.toHex8(addr)}H.</div>
            `}
          </div>
        </div>
      `;
      this.attachEvents();
    }
    attachEvents() {
      const inEl = document.getElementById('input-linear-addr');
      if (inEl) inEl.addEventListener('input', () => { const v = parseInt(inEl.value, 16); if (!isNaN(v)) { this.linearAddress = v; this.render(); } });
      const tBtn = document.getElementById('btn-toggle-present');
      if (tBtn) tBtn.addEventListener('click', () => { this.ptePresent = this.ptePresent ? 0 : 1; this.render(); });
      this.container.querySelectorAll('[data-p-preset]').forEach(b => {
        b.addEventListener('click', () => { this.linearAddress = parseInt(b.getAttribute('data-p-preset'), 16); this.ptePresent = 1; this.render(); });
      });
    }
  }

  // 5. CombinedTranslationSim
  class CombinedTranslationSim {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.stage = 0; this.selector = 0x0010; this.offset = 0x00004050; this.render();
    }
    toHex8(n) { return (n >>> 0).toString(16).toUpperCase().padStart(8, '0'); }
    render() {
      if (!this.container) return;
      const linear = 0x40004050; const phys = 0x0B200050;
      this.container.innerHTML = `
        <div class="paper-card card-ivory">
          <div class="tape-banner tape-coral tape-pinned">COMBINED TRANSLATION PIPELINE</div>
          <div style="margin-top: 10px; margin-bottom: 20px;">
            <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
              Logical Address [0010H : 00004050H] → GDT Base 40000000H → Linear 40004050H → 2-Level Paging → Physical 0B200050H
            </div>
          </div>
          <div class="calc-step-flow">
            <div class="calc-formula-line"><span>1. Logical Address:</span><span>Selector = 0010H (GDT #2), Offset = 00004050H</span></div>
            <div class="calc-formula-line"><span>2. Segmentation Unit:</span><span>GDT Base = 40000000H. Limit check passed.</span></div>
            <div class="calc-formula-line"><span>3. Linear Address:</span><span>Base (40000000H) + Offset (4050H) = <strong>40004050H</strong></span></div>
            <div class="calc-formula-line"><span>4. Paging Unit (10-10-12):</span><span>PDI = 256, PTI = 4, Offset = 050H. PDE/PTE Present.</span></div>
            <div class="calc-formula-line result"><span>5. Physical Address:</span><span style="font-size:18px; color:var(--pentium-mint-dark);">0B200050H</span></div>
          </div>
        </div>
      `;
    }
  }

  // 6. CacheSim
  class CacheSim {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.mapping = 'direct'; this.totalLines = 8; this.blockSize = 32;
      this.hits = 0; this.misses = 0; this.history = []; this.render();
    }
    render() {
      if (!this.container) return;
      const total = this.hits + this.misses;
      const rate = total > 0 ? ((this.hits / total) * 100).toFixed(1) : '0.0';
      this.container.innerHTML = `
        <div class="paper-card card-ivory">
          <div class="tape-banner tape-cyan tape-pinned">CACHE MEMORY MAPPING SIMULATOR</div>
          <div style="margin-top: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
              Direct-Mapped, 2-Way, 4-Way, and Fully Associative cache models.
            </div>
            <button class="tactile-btn btn-sm" id="btn-c-reset">Reset</button>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
            <button class="tactile-btn btn-sm ${this.mapping === 'direct' ? 'btn-primary' : ''}" data-m="direct">Direct Mapped</button>
            <button class="tactile-btn btn-sm ${this.mapping === '2way' ? 'btn-primary' : ''}" data-m="2way">2-Way Set Assoc</button>
            <button class="tactile-btn btn-sm ${this.mapping === 'fully' ? 'btn-primary' : ''}" data-m="fully">Fully Associative</button>
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 16px;">
            <button class="tactile-btn btn-sm btn-accent" id="btn-hit-sim">Access Block 2 (Hit Simulation)</button>
            <button class="tactile-btn btn-sm btn-danger" id="btn-miss-sim">Access Block 5 (Miss Simulation)</button>
          </div>
          <div class="cache-stats-bar">
            <div class="cache-stat-pill"><span class="stat-label">Total References</span><span class="stat-value">${total}</span></div>
            <div class="cache-stat-pill"><span class="stat-label">Hits</span><span class="stat-value" style="color:var(--pentium-mint-dark);">${this.hits}</span></div>
            <div class="cache-stat-pill"><span class="stat-label">Misses</span><span class="stat-value" style="color:var(--pentium-coral);">${this.misses}</span></div>
            <div class="cache-stat-pill"><span class="stat-label">Hit Ratio</span><span class="stat-value" style="color:var(--pentium-cyan);">${rate}%</span></div>
          </div>
          <div style="background: var(--pentium-slate-dark); color: #fff; padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 11px;">
            <div>> ${this.history.length ? this.history.join('<br/>> ') : 'Ready. Click a simulation button above.'}</div>
          </div>
        </div>
      `;
      this.attachEvents();
    }
    attachEvents() {
      const reset = document.getElementById('btn-c-reset');
      if (reset) reset.addEventListener('click', () => { this.hits = 0; this.misses = 0; this.history = []; this.render(); });
      this.container.querySelectorAll('[data-m]').forEach(b => {
        b.addEventListener('click', () => { this.mapping = b.getAttribute('data-m'); this.render(); });
      });
      const hitBtn = document.getElementById('btn-hit-sim');
      const missBtn = document.getElementById('btn-miss-sim');
      if (hitBtn) hitBtn.addEventListener('click', () => { this.hits++; this.history.unshift('Access 0x0040 (Block #2) -> Tag match -> ✓ HIT in Cache!'); this.render(); });
      if (missBtn) missBtn.addEventListener('click', () => { this.misses++; this.history.unshift('Access 0x00A0 (Block #5) -> Tag mismatch -> ✗ MISS (Fetched from DRAM)'); this.render(); });
    }
  }

  // 7. AmatSim
  class AmatSim {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.hitTime = 1.0; this.missRate = 5.0; this.penalty = 80.0; this.render();
    }
    render() {
      if (!this.container) return;
      const amat = (this.hitTime + ((this.missRate / 100) * this.penalty)).toFixed(2);
      this.container.innerHTML = `
        <div class="paper-card card-ivory">
          <div class="tape-banner tape-coral tape-pinned">AMAT PERFORMANCE OPTIMIZER</div>
          <div style="margin-top: 10px; margin-bottom: 20px; font-family: var(--font-body); font-weight: 800; font-size: 15px;">
            AMAT = Hit Time + (Miss Rate × Miss Penalty)
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 20px;">
            <div style="background: #fff; padding: 12px; border: var(--border-thin); border-radius: 6px;">
              <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900;">L1 Hit Time: <strong>${this.hitTime} ns</strong></label>
              <input type="range" id="sl-hit" min="0.5" max="3" step="0.5" value="${this.hitTime}" style="width:100%; margin-top:6px;" />
            </div>
            <div style="background: #fff; padding: 12px; border: var(--border-thin); border-radius: 6px;">
              <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900;">L1 Miss Rate: <strong>${this.missRate}%</strong></label>
              <input type="range" id="sl-miss" min="1" max="20" step="1" value="${this.missRate}" style="width:100%; margin-top:6px;" />
            </div>
            <div style="background: #fff; padding: 12px; border: var(--border-thin); border-radius: 6px;">
              <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 900;">DRAM Penalty: <strong>${this.penalty} ns</strong></label>
              <input type="range" id="sl-pen" min="40" max="120" step="5" value="${this.penalty}" style="width:100%; margin-top:6px;" />
            </div>
          </div>
          <div class="calc-step-flow">
            <div class="calc-formula-line result">
              <span>AMAT Result:</span>
              <span style="font-size:22px; color:var(--pentium-cyan); font-weight:900;">${amat} ns</span>
            </div>
          </div>
        </div>
      `;
      this.attachEvents();
    }
    attachEvents() {
      const h = document.getElementById('sl-hit');
      const m = document.getElementById('sl-miss');
      const p = document.getElementById('sl-pen');
      if (h) h.addEventListener('input', (e) => { this.hitTime = parseFloat(e.target.value); this.render(); });
      if (m) m.addEventListener('input', (e) => { this.missRate = parseFloat(e.target.value); this.render(); });
      if (p) p.addEventListener('input', (e) => { this.penalty = parseFloat(e.target.value); this.render(); });
    }
  }

  // Expose simulators on window
  window.RegisterSim = RegisterSim;
  window.AluBitwiseSim = AluBitwiseSim;
  window.SegmentationSim = SegmentationSim;
  window.PagingSim = PagingSim;
  window.CombinedTranslationSim = CombinedTranslationSim;
  window.CacheSim = CacheSim;
  window.AmatSim = AmatSim;

  console.log('Pentium Lab: Simulators bundle initialized successfully.');
})();
