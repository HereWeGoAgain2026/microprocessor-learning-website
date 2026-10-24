/* ==========================================================================
   CACHE SIMULATOR (DIRECT, 2-WAY, 4-WAY, FULLY ASSOCIATIVE)
   Tag/Index/Offset decomposition, LRU/FIFO replacement, hits and misses
   ========================================================================== */

export class CacheSim {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.mapping = 'direct';       // 'direct', '2way', '4way', 'fully'
    this.policy = 'lru';          // 'lru', 'fifo'
    this.totalLines = 8;
    this.blockSize = 32;          // bytes
    this.addressBits = 16;
    this.accessCounter = 0;
    this.hits = 0;
    this.misses = 0;
    this.lastAccess = null;
    this.history = [];
    this.initCache();
    this.render();
  }

  getWays() {
    switch (this.mapping) {
      case 'direct': return 1;
      case '2way': return 2;
      case '4way': return 4;
      case 'fully': return this.totalLines;
    }
  }

  getNumSets() {
    return Math.max(1, Math.floor(this.totalLines / this.getWays()));
  }

  getOffsetBits() {
    return Math.round(Math.log2(this.blockSize));
  }

  getIndexBits() {
    const sets = this.getNumSets();
    return sets > 1 ? Math.round(Math.log2(sets)) : 0;
  }

  getTagBits() {
    return this.addressBits - this.getIndexBits() - this.getOffsetBits();
  }

  initCache() {
    this.numSets = this.getNumSets();
    this.ways = this.getWays();
    this.sets = [];
    for (let s = 0; s < this.numSets; s++) {
      const setWays = [];
      for (let w = 0; w < this.ways; w++) {
        setWays.push({
          valid: 0,
          tag: 0,
          blockNum: null,
          lastUsed: 0,
          arrival: 0
        });
      }
      this.sets.push(setWays);
    }
    this.accessCounter = 0;
    this.hits = 0;
    this.misses = 0;
    this.lastAccess = null;
    this.history = [];
  }

  access(address) {
    this.accessCounter++;
    const addr = address & 0xffff;
    const offsetBits = this.getOffsetBits();
    const indexBits = this.getIndexBits();
    const tagBits = this.getTagBits();

    const offset = addr & ((1 << offsetBits) - 1);
    const setIndex = indexBits > 0 ? (addr >>> offsetBits) & ((1 << indexBits) - 1) : 0;
    const tag = (addr >>> (offsetBits + indexBits)) & ((1 << tagBits) - 1);
    const blockNum = addr >>> offsetBits;

    const set = this.sets[setIndex];
    let hitWay = -1;

    // Check for Hit
    for (let w = 0; w < this.ways; w++) {
      if (set[w].valid === 1 && set[w].tag === tag) {
        hitWay = w;
        break;
      }
    }

    let isHit = hitWay !== -1;
    let evictedBlock = null;

    if (isHit) {
      this.hits++;
      set[hitWay].lastUsed = this.accessCounter;
    } else {
      this.misses++;
      // Find empty slot or victim
      let targetWay = -1;
      for (let w = 0; w < this.ways; w++) {
        if (set[w].valid === 0) {
          targetWay = w;
          break;
        }
      }

      if (targetWay === -1) {
        // Eviction required
        if (this.policy === 'lru') {
          let minUsed = Infinity;
          for (let w = 0; w < this.ways; w++) {
            if (set[w].lastUsed < minUsed) {
              minUsed = set[w].lastUsed;
              targetWay = w;
            }
          }
        } else {
          // FIFO
          let minArrival = Infinity;
          for (let w = 0; w < this.ways; w++) {
            if (set[w].arrival < minArrival) {
              minArrival = set[w].arrival;
              targetWay = w;
            }
          }
        }
        evictedBlock = set[targetWay].blockNum;
      }

      set[targetWay].valid = 1;
      set[targetWay].tag = tag;
      set[targetWay].blockNum = blockNum;
      set[targetWay].lastUsed = this.accessCounter;
      set[targetWay].arrival = this.accessCounter;
      hitWay = targetWay;
    }

    this.lastAccess = {
      addr,
      tag,
      setIndex,
      offset,
      blockNum,
      isHit,
      hitWay,
      evictedBlock
    };

    const logEntry = `Access 0x${addr.toString(16).toUpperCase().padStart(4, '0')} (Block #${blockNum}) → Set ${setIndex}, Tag 0x${tag.toString(16).toUpperCase()} → ${isHit ? '✓ HIT (Way ' + hitWay + ')' : '✗ MISS' + (evictedBlock !== null ? ' [Evicted Block #' + evictedBlock + ']' : '')}`;
    this.history.unshift(logEntry);
    if (this.history.length > 8) this.history.pop();

    this.render();
  }

  render() {
    if (!this.container) return;

    const total = this.hits + this.misses;
    const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(1) : '0.0';
    const tagBits = this.getTagBits();
    const indexBits = this.getIndexBits();
    const offsetBits = this.getOffsetBits();

    this.container.innerHTML = `
      <div class="paper-card card-ivory">
        <div class="tape-banner tape-cyan tape-pinned">CACHE MEMORY MAPPING SIMULATOR</div>

        <div style="margin-top: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="font-family: var(--font-body); font-weight: 800; font-size: 15px;">
            Test Direct-Mapped, Set-Associative, and Fully Associative mapping with LRU / FIFO.
          </div>
          <button class="tactile-btn btn-sm" id="btn-cache-reset">Clear Cache</button>
        </div>

        <!-- Configuration Selector Bar -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; align-items: center;">
          <div style="display: flex; gap: 6px; align-items: center;">
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 800;">Mapping:</span>
            <button class="tactile-btn btn-sm ${this.mapping === 'direct' ? 'btn-primary' : ''}" data-mapping="direct">Direct Mapped</button>
            <button class="tactile-btn btn-sm ${this.mapping === '2way' ? 'btn-primary' : ''}" data-mapping="2way">2-Way Set Assoc</button>
            <button class="tactile-btn btn-sm ${this.mapping === '4way' ? 'btn-primary' : ''}" data-mapping="4way">4-Way Set Assoc</button>
            <button class="tactile-btn btn-sm ${this.mapping === 'fully' ? 'btn-primary' : ''}" data-mapping="fully">Fully Associative</button>
          </div>

          <div style="display: flex; gap: 6px; align-items: center; margin-left: auto;">
            <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 800;">Policy:</span>
            <button class="tactile-btn btn-sm ${this.policy === 'lru' ? 'btn-accent' : ''}" data-policy="lru">LRU</button>
            <button class="tactile-btn btn-sm ${this.policy === 'fifo' ? 'btn-accent' : ''}" data-policy="fifo">FIFO</button>
          </div>
        </div>

        <!-- Address Bit Structure Breakdown -->
        <div class="address-breakdown-box" style="margin-bottom: 20px;">
          <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--ink-black); margin-bottom: 4px;">
            16-BIT ADDRESS PARTITION: [TAG: ${tagBits} bits | INDEX: ${indexBits} bits | OFFSET: ${offsetBits} bits]
          </div>
          <div class="address-bar-visual">
            <div class="address-chunk chunk-dir" style="flex: ${tagBits};">
              <span class="chunk-tag">TAG</span>
              <span class="chunk-val">${tagBits} Bits</span>
            </div>
            ${indexBits > 0 ? `
              <div class="address-chunk chunk-page" style="flex: ${indexBits};">
                <span class="chunk-tag">SET INDEX</span>
                <span class="chunk-val">${indexBits} Bits</span>
              </div>
            ` : ''}
            <div class="address-chunk chunk-offset" style="flex: ${offsetBits};">
              <span class="chunk-tag">BLOCK OFFSET</span>
              <span class="chunk-val">${offsetBits} Bits (${this.blockSize}B Block)</span>
            </div>
          </div>
        </div>

        <!-- Input Address & Preset Streams -->
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 20px;">
          <input type="text" id="cache-addr-input" placeholder="Hex address (e.g. 0040)" 
                 style="width: 140px; padding: 8px 12px; font-family: var(--font-mono); font-size: 14px; font-weight: 800; border: var(--border-thin); border-radius: 4px;" />
          <button class="tactile-btn btn-primary btn-sm" id="btn-cache-access">Access Memory</button>

          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 800; margin-left: 8px;">Run Streams:</span>
          <button class="tactile-btn btn-sm" data-cache-stream="0000,0020,0040,0020,0080,0000">Locality Loop (Hits)</button>
          <button class="tactile-btn btn-sm btn-danger" data-cache-stream="0000,0100,0200,0300,0000">Conflict Thrash (Misses)</button>
          <button class="tactile-btn btn-sm" data-cache-stream="0010,0030,0050,0070,0090,00B0">Sequential Blocks</button>
        </div>

        <!-- Live Metrics Bar -->
        <div class="cache-stats-bar">
          <div class="cache-stat-pill">
            <span class="stat-label">Total References</span>
            <span class="stat-value">${total}</span>
          </div>
          <div class="cache-stat-pill">
            <span class="stat-label">Cache Hits</span>
            <span class="stat-value" style="color: var(--pentium-mint-dark);">${this.hits}</span>
          </div>
          <div class="cache-stat-pill">
            <span class="stat-label">Cache Misses</span>
            <span class="stat-value" style="color: var(--pentium-coral);">${this.misses}</span>
          </div>
          <div class="cache-stat-pill">
            <span class="stat-label">Hit Ratio</span>
            <span class="stat-value" style="color: var(--pentium-cyan);">${hitRate}%</span>
          </div>
        </div>

        <!-- Cache Lines Matrix Table -->
        <div class="cache-table-wrapper" style="margin-bottom: 20px;">
          <table class="cache-table">
            <thead>
              <tr>
                <th>Set #</th>
                ${Array.from({ length: this.ways }).map((_, w) => `
                  <th>Way ${w} (Valid | Tag | Block)</th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${this.sets.map((setWays, sIdx) => {
                const isSelectedSet = this.lastAccess && this.lastAccess.setIndex === sIdx;
                const highlightClass = isSelectedSet ? (this.lastAccess.isHit ? 'highlight-hit' : 'highlight-miss') : '';

                return `
                  <tr class="${highlightClass}">
                    <td style="font-weight: 900; background: var(--card-slate);">Set ${sIdx}</td>
                    ${setWays.map((w, wIdx) => {
                      const isTargetWay = isSelectedSet && this.lastAccess.hitWay === wIdx;
                      return `
                        <td style="${isTargetWay ? 'border: 2px solid var(--pentium-cyan); font-weight: 900;' : ''}">
                          ${w.valid === 1 ? `
                            <span class="tactile-chip chip-mint" style="padding:1px 6px; font-size:10px;">V=1</span>
                            Tag: <strong>0x${w.tag.toString(16).toUpperCase()}</strong>
                            <span style="color:var(--ink-muted); font-size:10px;">(Block #${w.blockNum})</span>
                          ` : `
                            <span style="color:#94a3b8; font-style:italic;">Empty (V=0)</span>
                          `}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Access History Log -->
        <div style="background: var(--pentium-slate-dark); color: #fff; border-radius: 6px; padding: 12px; font-family: var(--font-mono); font-size: 11px;">
          <div style="color: var(--pentium-yellow); font-weight: 900; margin-bottom: 6px;">ACCESS TRACE AUDIT:</div>
          <div>
            ${this.history.length ? this.history.map(h => `<div>${h}</div>`).join('') : '<span style="color:#64748b;">No memory references recorded yet.</span>'}
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    // Reset
    const resetBtn = document.getElementById('btn-cache-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => { this.initCache(); this.render(); });

    // Mapping toggles
    const mapBtns = this.container.querySelectorAll('[data-mapping]');
    mapBtns.forEach(b => {
      b.addEventListener('click', () => {
        this.mapping = b.getAttribute('data-mapping');
        this.initCache();
        this.render();
      });
    });

    // Policy toggles
    const polBtns = this.container.querySelectorAll('[data-policy]');
    polBtns.forEach(b => {
      b.addEventListener('click', () => {
        this.policy = b.getAttribute('data-policy');
        this.render();
      });
    });

    // Single access
    const accessBtn = document.getElementById('btn-cache-access');
    const input = document.getElementById('cache-addr-input');
    if (accessBtn && input) {
      accessBtn.addEventListener('click', () => {
        const val = parseInt(input.value, 16);
        if (!isNaN(val)) {
          this.access(val);
          input.value = '';
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = parseInt(input.value, 16);
          if (!isNaN(val)) {
            this.access(val);
            input.value = '';
          }
        }
      });
    }

    // Stream buttons
    const streamBtns = this.container.querySelectorAll('[data-cache-stream]');
    streamBtns.forEach(b => {
      b.addEventListener('click', () => {
        const addrs = b.getAttribute('data-cache-stream').split(',').map(s => parseInt(s, 16));
        addrs.forEach(a => this.access(a));
      });
    });
  }
}
