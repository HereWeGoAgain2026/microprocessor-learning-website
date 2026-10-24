/* ==========================================================================
   COMBINED TRANSLATION PIPELINE SIMULATOR
   Logical Address → Segmentation → Linear Address → Paging → Physical Address
   ========================================================================== */

export class CombinedTranslationSim {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStage = 0; // 0 to 4
    this.faultType = 'none'; // 'none', 'gp-limit', 'page-fault'
    this.selector = 0x0010; // GDT index 2
    this.offset = 0x00004050;
    this.gdtBase = 0x40000000;
    this.gdtLimit = 0x000FFFFF;
    this.frameBase = 0x0B200000;
    this.render();
  }

  toHex8(num) {
    return (num >>> 0).toString(16).toUpperCase().padStart(8, '0');
  }

  toHex4(num) {
    return (num & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  }

  render() {
    if (!this.container) return;

    const sel = this.selector & 0xffff;
    const off = this.offset >>> 0;
    const effectiveLimit = this.faultType === 'gp-limit' ? 0x00002000 : this.gdtLimit;
    const isLimitFault = off > effectiveLimit;

    const linear = (this.gdtBase + off) >>> 0;
    const pdi = (linear >>> 22) & 0x3ff;
    const pti = (linear >>> 12) & 0x3ff;
    const pageOffset = linear & 0xfff;

    const isPageFault = this.faultType === 'page-fault';
    const physical = (this.frameBase | pageOffset) >>> 0;

    const stages = [
      {
        id: 0,
        badge: 'STAGE 1',
        title: 'Logical Address Input',
        desc: `CPU generates a logical reference: Segment Selector = <strong class="hl-cyan">${this.toHex4(sel)}H</strong> (GDT Index 2, RPL 0), Offset = <strong class="hl-yellow">${this.toHex8(off)}H</strong>.`
      },
      {
        id: 1,
        badge: 'STAGE 2',
        title: 'Segmentation & GDT Lookup',
        desc: isLimitFault 
          ? `❌ <span class="hl-coral">Segment Limit Check Failed!</span> Offset ${this.toHex8(off)}H > Limit ${this.toHex8(effectiveLimit)}H. Generates #GP Fault (Int 13).`
          : `GDT[2] provides Base = <strong>${this.toHex8(this.gdtBase)}H</strong> and Limit = <strong>${this.toHex8(effectiveLimit)}H</strong>. Offset check passed (Offset ≤ Limit).`
      },
      {
        id: 2,
        badge: 'STAGE 3',
        title: 'Linear Address Construction',
        desc: isLimitFault 
          ? `Pipeline halted at Segmentation stage due to limit violation.`
          : `Linear Address = Base (${this.toHex8(this.gdtBase)}H) + Offset (${this.toHex8(off)}H) = <strong class="hl-cyan">${this.toHex8(linear)}H</strong>.`
      },
      {
        id: 3,
        badge: 'STAGE 4',
        title: 'Two-Level Paging Lookup',
        desc: isLimitFault 
          ? `Paging unit was not engaged.`
          : isPageFault
            ? `❌ <span class="hl-coral">Page Table Entry Present Bit P = 0!</span> Linear address ${this.toHex8(linear)}H triggers Page Fault (#PF, Int 14).`
            : `PDI = <strong>${pdi}</strong> (Bits 31-22), PTI = <strong>${pti}</strong> (Bits 21-12), Offset = <strong>${this.toHex4(pageOffset)}H</strong> (Bits 11-0). PDE and PTE are present in RAM.`
      },
      {
        id: 4,
        badge: 'STAGE 5',
        title: 'Physical Address Synthesis',
        desc: (isLimitFault || isPageFault)
          ? `No bus cycle issued due to fault exception.`
          : `PTE supplies Frame Base <strong>${this.toHex8(this.frameBase)}H</strong>. Combined with Offset: Final Physical Address = <strong class="hl-green" style="font-size:16px;">${this.toHex8(physical)}H</strong>.`
      }
    ];

    this.container.innerHTML = `
      <div class="paper-card card-ivory">
        <div class="tape-banner tape-coral tape-pinned">COMBINED TRANSLATION PIPELINE (SELF-STUDY SPEC)</div>

        <div style="margin-top: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
            Step through the complete Protected Mode flow from Logical to Physical memory.
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="tactile-btn btn-sm ${this.faultType === 'none' ? 'btn-success' : ''}" id="btn-trans-normal">Normal Translation</button>
            <button class="tactile-btn btn-sm ${this.faultType === 'gp-limit' ? 'btn-danger' : ''}" id="btn-trans-gp">Inject #GP Limit Fault</button>
            <button class="tactile-btn btn-sm ${this.faultType === 'page-fault' ? 'btn-danger' : ''}" id="btn-trans-pf">Inject #PF Page Fault</button>
          </div>
        </div>

        <!-- Stepper Navigation Controls -->
        <div class="pipeline-stepper-controls">
          <div class="stepper-btn-group">
            <button class="tactile-btn btn-sm" id="btn-trans-prev" ${this.currentStage === 0 ? 'disabled' : ''}>← Previous Stage</button>
            <button class="tactile-btn btn-sm btn-primary" id="btn-trans-next" ${this.currentStage === 4 ? 'disabled' : ''}>Next Stage →</button>
            <button class="tactile-btn btn-sm" id="btn-trans-reset">Reset Pipeline</button>
          </div>
          <div class="step-counter-badge">
            STAGE ${this.currentStage + 1} OF 5: ${stages[this.currentStage].title}
          </div>
        </div>

        <!-- Pipeline Stages Conveyor Track -->
        <div class="pipeline-stages-track">
          ${stages.map((st, idx) => {
            const isCurr = this.currentStage === idx;
            const isDone = this.currentStage > idx;
            return `
              <div class="pipeline-stage-card ${isCurr ? 'current' : ''} ${isDone ? 'completed' : ''}" style="cursor: pointer;" data-jump-stage="${idx}">
                <div class="stage-header">
                  <span>${st.badge}</span>
                  ${isDone ? '<span style="color:var(--pentium-mint-dark);">✓ DONE</span>' : ''}
                  ${isCurr ? '<span style="color:var(--pentium-cyan);">● ACTIVE</span>' : ''}
                </div>
                <div class="stage-title">${st.title}</div>
                <div class="stage-desc">${st.desc}</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Current Stage Detailed Dossier -->
        <div style="background: var(--card-white); border: var(--border-heavy); border-radius: 8px; padding: 20px; box-shadow: var(--shadow-md); margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <span style="font-family: var(--font-display); font-size: 15px; color: var(--ink-black);">
              STAGE ${this.currentStage + 1} INSPECTION DOSSIER
            </span>
            <span class="tactile-chip chip-cyan">${stages[this.currentStage].title}</span>
          </div>

          <div style="font-family: var(--font-mono); font-size: 13px; line-height: 1.6;">
            ${this.renderStageDetail(stages[this.currentStage], { sel, off, linear, pdi, pti, pageOffset, physical, isLimitFault, isPageFault })}
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderStageDetail(stage, ctx) {
    switch (this.currentStage) {
      case 0:
        return `
          <div style="background: var(--card-slate); padding: 12px; border-radius: 6px; border: var(--border-thin);">
            <div>• Program requests memory operand via pointer: <strong>[DS:00004050H]</strong></div>
            <div>• Segment Selector (DS) = <strong>${this.toHex4(ctx.sel)}H</strong> (Binary: 0000 0000 0001 0000)</div>
            <div>• Logical Offset = <strong>${this.toHex8(ctx.off)}H</strong></div>
            <div style="margin-top: 6px; color: var(--pentium-cyan); font-weight: 800;">Next: Hardware consults the Global Descriptor Table (GDT).</div>
          </div>
        `;
      case 1:
        return `
          <div style="background: var(--card-slate); padding: 12px; border-radius: 6px; border: var(--border-thin);">
            <div>• Selector Index = 2 (GDT Entry #2 fetched from GDTR base)</div>
            <div>• Base Address = <strong>${this.toHex8(this.gdtBase)}H</strong></div>
            <div>• Segment Limit = <strong>${this.toHex8(this.faultType === 'gp-limit' ? 0x2000 : this.gdtLimit)}H</strong></div>
            ${ctx.isLimitFault ? `
              <div style="color: var(--pentium-crimson); font-weight: 900; margin-top: 8px;">
                🚨 EXCEPTION 13: GENERAL PROTECTION FAULT (#GP). Execution terminates here!
              </div>
            ` : `
              <div style="color: var(--pentium-mint-dark); font-weight: 800; margin-top: 8px;">
                ✓ Bound Check: Offset ${this.toHex8(ctx.off)}H ≤ Limit. Check passed.
              </div>
            `}
          </div>
        `;
      case 2:
        return `
          <div style="background: var(--card-slate); padding: 12px; border-radius: 6px; border: var(--border-thin);">
            <div>• Linear Address Calculation Formula: <strong>Linear = Segment Base + Offset</strong></div>
            <div>• Linear = ${this.toHex8(this.gdtBase)}H + ${this.toHex8(ctx.off)}H = <strong>${this.toHex8(ctx.linear)}H</strong></div>
            <div>• If Paging were disabled (CR0.PG = 0), this would be the physical address.</div>
            <div style="margin-top: 6px; color: var(--pentium-cyan); font-weight: 800;">Next: Paging Unit partitions the 32-bit linear address into 10-10-12 bits.</div>
          </div>
        `;
      case 3:
        return `
          <div style="background: var(--card-slate); padding: 12px; border-radius: 6px; border: var(--border-thin);">
            <div>• 32-Bit Linear Address = <strong>${this.toHex8(ctx.linear)}H</strong></div>
            <div>• Bits 31–22 (PDI): <strong>${ctx.pdi}</strong> (Page Directory Entry #${ctx.pdi})</div>
            <div>• Bits 21–12 (PTI): <strong>${ctx.pti}</strong> (Page Table Entry #${ctx.pti})</div>
            <div>• Bits 11–0 (Offset): <strong>${this.toHex4(ctx.pageOffset)}H</strong> (Byte offset in 4 KB frame)</div>
            ${ctx.isPageFault ? `
              <div style="color: var(--pentium-crimson); font-weight: 900; margin-top: 8px;">
                🚨 EXCEPTION 14: PAGE FAULT (#PF). Present bit is 0. CPU loads CR2 with ${this.toHex8(ctx.linear)}H.
              </div>
            ` : `
              <div style="color: var(--pentium-mint-dark); font-weight: 800; margin-top: 8px;">
                ✓ PDE & PTE Present in RAM. Physical frame base = ${this.toHex8(this.frameBase)}H.
              </div>
            `}
          </div>
        `;
      case 4:
        return `
          <div style="background: var(--card-slate); padding: 12px; border-radius: 6px; border: var(--border-thin);">
            <div>• Physical Page Frame Base: <strong>${this.toHex8(this.frameBase)}H</strong></div>
            <div>• Page Offset: <strong>${this.toHex4(ctx.pageOffset)}H</strong></div>
            <div>• Final Physical Address: Frame Base | Offset = <strong>${this.toHex8(ctx.physical)}H</strong></div>
            <div style="margin-top: 8px; color: var(--pentium-mint-dark); font-weight: 900; font-size: 15px;">
              ✓ Data read/write executed on physical memory bus at address ${this.toHex8(ctx.physical)}H!
            </div>
          </div>
        `;
    }
  }

  attachEvents() {
    const prev = document.getElementById('btn-trans-prev');
    const next = document.getElementById('btn-trans-next');
    const reset = document.getElementById('btn-trans-reset');
    if (prev) prev.addEventListener('click', () => { if (this.currentStage > 0) { this.currentStage--; this.render(); } });
    if (next) next.addEventListener('click', () => { if (this.currentStage < 4) { this.currentStage++; this.render(); } });
    if (reset) reset.addEventListener('click', () => { this.currentStage = 0; this.faultType = 'none'; this.render(); });

    const btnNormal = document.getElementById('btn-trans-normal');
    const btnGp = document.getElementById('btn-trans-gp');
    const btnPf = document.getElementById('btn-trans-pf');
    if (btnNormal) btnNormal.addEventListener('click', () => { this.faultType = 'none'; this.render(); });
    if (btnGp) btnGp.addEventListener('click', () => { this.faultType = 'gp-limit'; this.currentStage = 1; this.render(); });
    if (btnPf) btnPf.addEventListener('click', () => { this.faultType = 'page-fault'; this.currentStage = 3; this.render(); });

    const stageCards = this.container.querySelectorAll('[data-jump-stage]');
    stageCards.forEach(c => {
      c.addEventListener('click', () => {
        this.currentStage = Number(c.getAttribute('data-jump-stage'));
        this.render();
      });
    });
  }
}
