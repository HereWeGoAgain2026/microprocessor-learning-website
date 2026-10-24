/* ==========================================================================
   REGISTER & STACK SIMULATOR (8086 / 80386DX)
   Interactive execution of MOV, PUSH, POP, XCHG, LEA, INC, DEC
   ========================================================================== */

export class RegisterSim {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.initialState = {
      AX: 0x1234,
      BX: 0x5678,
      CX: 0x0005,
      DX: 0x0000,
      SI: 0x0200,
      DI: 0x0400,
      BP: 0x0150,
      SP: 0x0100,
      CS: 0x1000,
      DS: 0x2000,
      SS: 0x3000,
      ES: 0x4000
    };
    this.registers = { ...this.initialState };
    this.stackMemory = {}; // physical address -> value
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

  toHex4(num) {
    return (num & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  }

  toHex2(num) {
    return (num & 0xff).toString(16).toUpperCase().padStart(2, '0');
  }

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
        if (this.registers[arg2] !== undefined) {
          val = this.registers[arg2];
        } else if (!isNaN(parseInt(arg2, 16))) {
          val = parseInt(arg2, 16) & 0xffff;
        } else {
          return;
        }
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
        // LEA BX, [SI + 0040H]
        if (arg1 && this.registers[arg1] !== undefined) {
          const base = this.registers.SI;
          const ea = (base + 0x0040) & 0xffff;
          this.registers[arg1] = ea;
          this.lastChanged = arg1;
          logMsg = `LEA ${arg1}, [SI + 0040H] → Computed EA ${this.toHex4(base)}H + 0040H = ${this.toHex4(ea)}H into ${arg1}`;
        }
        break;
      }

      default:
        logMsg = `Instruction "${op}" simulated.`;
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

        <!-- Preset Quick Execution Buttons -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <button class="tactile-btn btn-sm btn-primary" data-cmd="MOV AX, BX">MOV AX, BX</button>
          <button class="tactile-btn btn-sm" data-cmd="MOV CX, 0020H">MOV CX, 0020H</button>
          <button class="tactile-btn btn-sm btn-accent" data-cmd="PUSH AX">PUSH AX</button>
          <button class="tactile-btn btn-sm btn-accent" data-cmd="POP DX">POP DX</button>
          <button class="tactile-btn btn-sm" data-cmd="XCHG AX, BX">XCHG AX, BX</button>
          <button class="tactile-btn btn-sm" data-cmd="INC AX">INC AX</button>
          <button class="tactile-btn btn-sm" data-cmd="LEA BX, [SI+40H]">LEA BX, [SI+40H]</button>
        </div>

        <!-- Custom Command Line Input -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <input type="text" id="reg-cmd-input" placeholder="Enter instruction, e.g. MOV DX, 1234H or PUSH CX" 
                 style="flex: 1; padding: 10px 14px; font-family: var(--font-mono); font-size: 13px; font-weight: 700; border: var(--border-thin); border-radius: 6px; box-shadow: 2px 2px 0 #000; outline: none;" />
          <button class="tactile-btn btn-primary" id="btn-run-reg-cmd">Step Exec</button>
        </div>

        <!-- General Purpose Registers -->
        <div class="register-bank" id="reg-bank-display">
          ${this.renderRegisterSlots()}
        </div>

        <!-- Stack & Status Output Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 16px;">
          <!-- Stack Frame View -->
          <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 14px; box-shadow: var(--shadow-sm);">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); text-transform: uppercase; margin-bottom: 8px;">
              LIFO Stack Frame (SS = ${this.toHex4(this.registers.SS)}H, SP = <span id="stack-sp-val">${this.toHex4(this.registers.SP)}H</span>)
            </div>
            <div id="stack-frame-list" style="font-family: var(--font-mono); font-size: 12px; display: flex; flex-direction: column; gap: 4px; max-height: 140px; overflow-y: auto;">
              ${this.renderStackItems()}
            </div>
          </div>

          <!-- Execution History Log -->
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
        <div class="register-slot ${isHigh ? 'highlighted' : ''}" id="reg-slot-${r.name}">
          <div class="reg-label">
            <span>${r.name}</span>
            <span class="reg-desc">${r.desc}</span>
          </div>
          <div class="reg-value">${this.toHex4(r.val)}H</div>
          ${r.hasHalves ? `
            <div class="reg-subdivisions">
              <div class="reg-sub-half">${r.name[0]}H: ${this.toHex2(hi)}</div>
              <div class="reg-sub-half">${r.name[0]}L: ${this.toHex2(lo)}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  renderStackItems() {
    const keys = Object.keys(this.stackMemory).sort((a, b) => Number(a) - Number(b));
    if (!keys.length) {
      return '<div style="color: #94a3b8; font-style: italic;">Stack is currently empty. Execute PUSH to add items.</div>';
    }

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
    if (hist) {
      hist.innerHTML = this.history.map(h => `<div>> ${h}</div>`).join('');
    }
  }

  attachEvents() {
    const resetBtn = document.getElementById('btn-reset-reg');
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    const runBtn = document.getElementById('btn-run-reg-cmd');
    const input = document.getElementById('reg-cmd-input');
    if (runBtn && input) {
      runBtn.addEventListener('click', () => {
        if (input.value) {
          this.execute(input.value);
          input.value = '';
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value) {
          this.execute(input.value);
          input.value = '';
        }
      });
    }

    const presetBtns = this.container.querySelectorAll('[data-cmd]');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        this.execute(cmd);
      });
    });
  }
}
