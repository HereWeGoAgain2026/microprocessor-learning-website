/* ==========================================================================
   AMAT PERFORMANCE & MEMORY HIERARCHY SIMULATOR
   Interactive calculation of Average Memory Access Time and L1/L2 trade-offs
   ========================================================================== */

export class AmatSim {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.l1HitTime = 1.0;      // ns
    this.l1MissRate = 5.0;     // %
    this.dramPenalty = 80.0;   // ns
    this.enableL2 = false;
    this.l2HitTime = 8.0;      // ns
    this.l2MissRate = 15.0;    // %
    this.render();
  }

  calculate() {
    const l1Miss = this.l1MissRate / 100.0;
    if (!this.enableL2) {
      // Single-level cache
      const amat = this.l1HitTime + (l1Miss * this.dramPenalty);
      return {
        amat: amat.toFixed(2),
        penaltyComponent: (l1Miss * this.dramPenalty).toFixed(2),
        slowdown: (amat / this.l1HitTime).toFixed(2),
        dramAccesses: (l1Miss * 100).toFixed(1)
      };
    } else {
      // Multi-level cache with L2
      const l2Miss = this.l2MissRate / 100.0;
      const l2Penalty = this.l2HitTime + (l2Miss * this.dramPenalty);
      const amat = this.l1HitTime + (l1Miss * l2Penalty);
      return {
        amat: amat.toFixed(2),
        l2Penalty: l2Penalty.toFixed(2),
        penaltyComponent: (l1Miss * l2Penalty).toFixed(2),
        slowdown: (amat / this.l1HitTime).toFixed(2),
        dramAccesses: (l1Miss * l2Miss * 100).toFixed(2)
      };
    }
  }

  render() {
    if (!this.container) return;

    const data = this.calculate();

    this.container.innerHTML = `
      <div class="paper-card card-ivory">
        <div class="tape-banner tape-coral tape-pinned">AMAT PERFORMANCE OPTIMIZER</div>

        <div style="margin-top: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
            AMAT = Hit Time + (Miss Rate × Miss Penalty). Explore real-time memory trade-offs.
          </div>
          <button class="tactile-btn btn-sm ${this.enableL2 ? 'btn-primary' : ''}" id="btn-toggle-l2">
            ${this.enableL2 ? '✓ L2 Cache Enabled' : '+ Insert L2 Cache'}
          </button>
        </div>

        <!-- Interactive Sliders Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; margin-bottom: 24px;">
          <!-- L1 Hit Time Slider -->
          <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 14px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; font-weight: 900; margin-bottom: 8px;">
              <span>L1 HIT TIME (t_hit):</span>
              <span style="color: var(--pentium-cyan); font-size: 15px;">${this.l1HitTime} ns</span>
            </div>
            <input type="range" id="slider-l1-hit" min="0.5" max="4.0" step="0.5" value="${this.l1HitTime}" style="width: 100%;" />
            <div style="font-size: 11px; color: var(--ink-muted); margin-top: 4px;">Typical on-chip L1 access latency (1 clock cycle).</div>
          </div>

          <!-- L1 Miss Rate Slider -->
          <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 14px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; font-weight: 900; margin-bottom: 8px;">
              <span>L1 MISS RATE (M):</span>
              <span style="color: var(--pentium-coral); font-size: 15px;">${this.l1MissRate}%</span>
            </div>
            <input type="range" id="slider-l1-miss" min="1.0" max="25.0" step="1.0" value="${this.l1MissRate}" style="width: 100%;" />
            <div style="font-size: 11px; color: var(--ink-muted); margin-top: 4px;">Percentage of references that miss L1 cache.</div>
          </div>

          <!-- DRAM Miss Penalty Slider -->
          <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 14px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; font-weight: 900; margin-bottom: 8px;">
              <span>DRAM MISS PENALTY:</span>
              <span style="color: var(--pentium-brown); font-size: 15px;">${this.dramPenalty} ns</span>
            </div>
            <input type="range" id="slider-dram-penalty" min="40" max="150" step="5" value="${this.dramPenalty}" style="width: 100%;" />
            <div style="font-size: 11px; color: var(--ink-muted); margin-top: 4px;">Round-trip latency to fetch a block from main memory.</div>
          </div>
        </div>

        <!-- Optional L2 Configuration Controls -->
        ${this.enableL2 ? `
          <div style="background: var(--pentium-yellow-pale); border: 2px solid var(--ink-black); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-brown); margin-bottom: 8px;">
              LEVEL 2 (L2) CACHE INTERMEDIATE STAGE
            </div>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 160px;">
                <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 800;">L2 Hit Time: <strong>${this.l2HitTime} ns</strong></label>
                <input type="range" id="slider-l2-hit" min="4" max="16" step="1" value="${this.l2HitTime}" style="width: 100%;" />
              </div>
              <div style="flex: 1; min-width: 160px;">
                <label style="font-family: var(--font-mono); font-size: 11px; font-weight: 800;">L2 Local Miss Rate: <strong>${this.l2MissRate}%</strong></label>
                <input type="range" id="slider-l2-miss" min="5" max="30" step="1" value="${this.l2MissRate}" style="width: 100%;" />
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Result AMAT Card -->
        <div style="background: var(--card-white); border: var(--border-heavy); border-radius: 8px; padding: 22px; box-shadow: var(--shadow-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
            <span style="font-family: var(--font-display); font-size: 15px; color: var(--ink-black);">
              COMPUTED AVERAGE MEMORY ACCESS TIME (AMAT)
            </span>
            <span class="tactile-chip chip-coral" style="font-size: 14px;">Slowdown: ${data.slowdown}×</span>
          </div>

          <div style="font-family: var(--font-mono); font-size: 26px; font-weight: 900; color: var(--pentium-cyan); margin-bottom: 8px;">
            AMAT = ${data.amat} ns
          </div>

          <div class="calc-step-flow" style="margin-top: 14px;">
            <div class="calc-formula-line">
              <span>Equation:</span>
              <span>AMAT = Hit Time + (Miss Rate × Miss Penalty)</span>
            </div>
            <div class="calc-formula-line result">
              <span>Calculation:</span>
              <span>${this.l1HitTime} ns + (${(this.l1MissRate/100).toFixed(2)} × ${this.enableL2 ? data.l2Penalty : this.dramPenalty} ns) = <strong>${data.amat} ns</strong></span>
            </div>
          </div>

          <!-- Plain English Explanation -->
          <div style="font-size: 13px; line-height: 1.55; color: var(--ink-black); margin-top: 12px; background: var(--card-slate); border-left: 4px solid var(--pentium-cyan); padding: 10px 14px;">
            <strong>Architectural Insight:</strong> Although <strong>${100 - this.l1MissRate}%</strong> of memory accesses return in just <strong>${this.l1HitTime} ns</strong>, the remaining <strong>${this.l1MissRate}%</strong> of misses to slow DRAM drag average memory latency up to <strong>${data.amat} ns</strong>. 
            Only <strong>${data.dramAccesses}%</strong> of all processor requests actually reach DRAM bus pins.
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const l1Hit = document.getElementById('slider-l1-hit');
    const l1Miss = document.getElementById('slider-l1-miss');
    const dramPen = document.getElementById('slider-dram-penalty');
    const toggleL2 = document.getElementById('btn-toggle-l2');

    if (l1Hit) l1Hit.addEventListener('input', (e) => { this.l1HitTime = parseFloat(e.target.value); this.render(); });
    if (l1Miss) l1Miss.addEventListener('input', (e) => { this.l1MissRate = parseFloat(e.target.value); this.render(); });
    if (dramPen) dramPen.addEventListener('input', (e) => { this.dramPenalty = parseFloat(e.target.value); this.render(); });
    if (toggleL2) toggleL2.addEventListener('click', () => { this.enableL2 = !this.enableL2; this.render(); });

    if (this.enableL2) {
      const l2Hit = document.getElementById('slider-l2-hit');
      const l2Miss = document.getElementById('slider-l2-miss');
      if (l2Hit) l2Hit.addEventListener('input', (e) => { this.l2HitTime = parseFloat(e.target.value); this.render(); });
      if (l2Miss) l2Miss.addEventListener('input', (e) => { this.l2MissRate = parseFloat(e.target.value); this.render(); });
    }
  }
}
