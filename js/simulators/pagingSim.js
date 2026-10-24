/* ==========================================================================
   PAGING SIMULATOR (80386DX TWO-LEVEL PAGING)
   10-10-12 Address Decomposition, CR3 Page Directory, and Page Faults
   ========================================================================== */

export class PagingSim {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.linearAddress = 0x00403014;
    this.cr3 = 0x00100000; // Physical base of Page Directory
    this.pdePresent = 1;
    this.ptePresent = 1;
    this.mockFrameBase = 0x2A000000;
    this.render();
  }

  toHex8(num) {
    return (num >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  toHex3(num) {
    return (num & 0xfff).toString(16).toUpperCase().padStart(3, '0');
  }

  render() {
    if (!this.container) return;

    const addr = this.linearAddress >>> 0;
    const pdi = (addr >>> 22) & 0x3ff;   // 10 bits: 31-22
    const pti = (addr >>> 12) & 0x3ff;   // 10 bits: 21-12
    const offset = addr & 0xfff;         // 12 bits: 11-0

    const pdeAddr = (this.cr3 + (pdi * 4)) >>> 0;
    const pageTableBase = 0x00200000 + (pdi * 0x1000);
    const pteAddr = (pageTableBase + (pti * 4)) >>> 0;
    const physAddr = (this.mockFrameBase | offset) >>> 0;

    const isFault = (!this.pdePresent) || (!this.ptePresent);

    this.container.innerHTML = `
      <div class="paper-card card-ivory">
        <div class="tape-banner tape-yellow tape-pinned">80386DX TWO-LEVEL PAGING ENGINE</div>

        <div style="margin-top: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
            Decompose 32-bit linear addresses into 10-bit Directory, 10-bit Page Table, and 12-bit Offset.
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="tactile-btn btn-sm ${this.pdePresent && this.ptePresent ? 'btn-success' : 'btn-danger'}" id="btn-toggle-present">
              ${isFault ? '🚨 SIMULATE: PAGE FAULT (#PF)' : '✓ STATUS: ALL PAGES PRESENT'}
            </button>
          </div>
        </div>

        <!-- Linear Address Input & Presets -->
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px;">
          <label style="font-family: var(--font-mono); font-size: 12px; font-weight: 900; color: var(--pentium-cyan);">
            32-BIT LINEAR ADDRESS:
          </label>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="text" id="input-linear-addr" value="${this.toHex8(addr)}" maxlength="8"
                   style="width: 120px; padding: 8px 12px; font-family: var(--font-mono); font-size: 16px; font-weight: 900; border: var(--border-thin); border-radius: 4px;" />
            <span style="font-family: var(--font-mono); font-weight: 800;">H</span>
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="tactile-btn btn-sm" data-paging-preset="00403014">00403014H (PDI 1, PTI 3)</button>
            <button class="tactile-btn btn-sm" data-paging-preset="12345678">12345678H (Exam Case)</button>
            <button class="tactile-btn btn-sm" data-paging-preset="C0008020">C0008020H (High OS)</button>
            <button class="tactile-btn btn-sm" data-paging-preset="00000000">00000000H (Base 0)</button>
          </div>
        </div>

        <!-- 32-Bit Address Breakdown Visual Bar -->
        <div class="address-breakdown-box">
          <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--ink-black); margin-bottom: 6px;">
            CLASSIC 80386DX 10 - 10 - 12 ADDRESS BIT DECOMPOSITION
          </div>
          <div class="address-bar-visual">
            <div class="address-chunk chunk-dir" style="flex: 10;">
              <span class="chunk-tag">PDI (DIR INDEX)</span>
              <span class="chunk-val">${pdi} (0x${pdi.toString(16).toUpperCase()})</span>
              <span class="chunk-bits">Bits 31–22 (10 bits)</span>
            </div>
            <div class="address-chunk chunk-page" style="flex: 10;">
              <span class="chunk-tag">PTI (PAGE INDEX)</span>
              <span class="chunk-val">${pti} (0x${pti.toString(16).toUpperCase()})</span>
              <span class="chunk-bits">Bits 21–12 (10 bits)</span>
            </div>
            <div class="address-chunk chunk-offset" style="flex: 12;">
              <span class="chunk-tag">PAGE OFFSET</span>
              <span class="chunk-val">${offset} (0x${this.toHex3(offset)})</span>
              <span class="chunk-bits">Bits 11–0 (12 bits)</span>
            </div>
          </div>
        </div>

        <!-- Two-Level Walk Pipeline -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- Level 1: Page Directory -->
          <div style="background: var(--card-white); border: var(--border-thick); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan);">
                LEVEL 1: PAGE DIRECTORY (CR3)
              </span>
              <span class="tactile-chip chip-cyan">CR3: ${this.toHex8(this.cr3)}H</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 12px; line-height: 1.6;">
              <div>• Directory Entry Selected: <strong>PDE #${pdi}</strong></div>
              <div>• Physical Address: CR3 + (${pdi} × 4) = <strong>${this.toHex8(pdeAddr)}H</strong></div>
              <div>• Present Bit (P): <strong>${this.pdePresent ? '1 (In Memory)' : '0 (NOT PRESENT)'}</strong></div>
              <div>• Points to Page Table Base: <strong>${this.toHex8(pageTableBase)}H</strong></div>
            </div>
          </div>

          <!-- Level 2: Page Table -->
          <div style="background: var(--card-white); border: var(--border-thick); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-purple);">
                LEVEL 2: PAGE TABLE
              </span>
              <span class="tactile-chip chip-purple">PTI: #${pti}</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 12px; line-height: 1.6;">
              <div>• Page Table Entry: <strong>PTE #${pti}</strong></div>
              <div>• Physical Address: PTBase + (${pti} × 4) = <strong>${this.toHex8(pteAddr)}H</strong></div>
              <div>• Present Bit (P): <strong>${this.ptePresent ? '1 (Page in RAM)' : '0 (PAGE FAULT)'}</strong></div>
              <div>• Physical Page Frame Base: <strong>${this.toHex8(this.mockFrameBase)}H</strong></div>
            </div>
          </div>
        </div>

        <!-- Outcome / Fault Banner -->
        <div style="padding: 16px 20px; border-radius: 8px; border: var(--border-heavy); box-shadow: var(--shadow-md); ${isFault ? 'background: var(--pentium-coral-pale); border-color: var(--pentium-coral);' : 'background: var(--pentium-mint-pale); border-color: var(--pentium-mint);'}">
          ${isFault ? `
            <div style="font-family: var(--font-display); font-size: 15px; color: var(--pentium-crimson); margin-bottom: 4px;">
              🚨 HARDWARE EXCEPTION 14: PAGE FAULT (#PF)
            </div>
            <div style="font-family: var(--font-mono); font-size: 13px; color: var(--ink-black);">
              The requested page is not present in physical RAM (Present bit = 0). The CPU pushes an error code to the stack, loads <strong>CR2 = ${this.toHex8(addr)}H</strong> (faulting linear address), and invokes the OS Page Fault Handler to swap the 4 KB page from disk.
            </div>
          ` : `
            <div style="font-family: var(--font-display); font-size: 15px; color: var(--pentium-mint-dark); margin-bottom: 4px;">
              ✓ TRANSLATION SUCCESSFUL — 32-BIT PHYSICAL ADDRESS
            </div>
            <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 900; color: var(--ink-black);">
              Physical Address = Frame Base (${this.toHex8(this.mockFrameBase)}H) + Offset (${this.toHex3(offset)}H) = 
              <span style="color: var(--pentium-mint-dark); font-size: 19px;">${this.toHex8(physAddr)}H</span>
            </div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted); margin-top: 4px;">
              Page Frame Span: ${this.toHex8(this.mockFrameBase)}H to ${this.toHex8(this.mockFrameBase + 4095)}H (4,096 bytes).
            </div>
          `}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const input = document.getElementById('input-linear-addr');
    if (input) {
      input.addEventListener('input', () => {
        const val = parseInt(input.value, 16);
        if (!isNaN(val)) {
          this.linearAddress = val >>> 0;
          this.render();
        }
      });
    }

    const toggleBtn = document.getElementById('btn-toggle-present');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (this.ptePresent === 1) {
          this.ptePresent = 0;
        } else {
          this.ptePresent = 1;
        }
        this.render();
      });
    }

    const presets = this.container.querySelectorAll('[data-paging-preset]');
    presets.forEach(b => {
      b.addEventListener('click', () => {
        const val = parseInt(b.getAttribute('data-paging-preset'), 16);
        this.linearAddress = val >>> 0;
        this.ptePresent = 1;
        this.render();
      });
    });
  }
}
