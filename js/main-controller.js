/* ==========================================================================
   MICROPROCESSOR INTERACTIVE LEARNING PLATFORM - MAIN CONTROLLER
   Zero-CORS standalone execution for desktop browsers and web servers
   ========================================================================== */

(function () {
  'use strict';

  class MicroprocessorApp {
    constructor() {
      this.currentView = 'dashboard';
      this.currentTopicId = 'm2-intro';
      this.audioEnabled = false;

      this.state = this.loadState();
      this.initAudio();
      this.initDOM();
      this.bindEvents();
      this.navigate(this.state.lastView || 'dashboard', this.state.lastTopic || 'm2-intro');
      this.updateProgressMeters();
    }

    loadState() {
      try {
        const saved = localStorage.getItem('microprocessor_lab_state');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return {
        completedTopics: [],
        bookmarks: [],
        quizScores: {},
        lastView: 'dashboard',
        lastTopic: 'm2-intro'
      };
    }

    saveState() {
      try {
        localStorage.setItem('microprocessor_lab_state', JSON.stringify(this.state));
      } catch (e) {}
      this.updateProgressMeters();
    }

    initAudio() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      } catch (e) {}
    }

    playPopSound(freq = 440, type = 'sine', duration = 0.06) {
      if (!this.audioEnabled || !this.audioCtx) return;
      try {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
      } catch (e) {}
    }

    initDOM() {
      this.breadcrumbRoot = document.getElementById('bc-root');
      this.breadcrumbActive = document.getElementById('bc-active');
      this.progressFill = document.getElementById('sidebar-progress-fill');
      this.progressPct = document.getElementById('sidebar-progress-pct');
      this.glossaryDrawer = document.getElementById('drawer-glossary');
      this.bookmarksDrawer = document.getElementById('drawer-bookmarks');
      this.drawerBackdrop = document.getElementById('drawer-backdrop');
    }

    bindEvents() {
      const mobToggle = document.getElementById('btn-mobile-nav');
      const sidebar = document.getElementById('sidebar');
      const sidebarBackdrop = document.getElementById('sidebar-backdrop');
      const btnCloseSidebar = document.getElementById('btn-close-sidebar');

      const setSidebarOpen = (isOpen) => {
        if (!sidebar) return;
        sidebar.classList.toggle('open', isOpen);
        if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active', isOpen);
      };

      if (mobToggle && sidebar) {
        mobToggle.addEventListener('click', () => {
          setSidebarOpen(!sidebar.classList.contains('open'));
        });
      }
      if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => setSidebarOpen(false));
      }
      if (btnCloseSidebar) {
        btnCloseSidebar.addEventListener('click', () => setSidebarOpen(false));
      }

      document.querySelectorAll('[data-view-nav]').forEach(el => {
        el.addEventListener('click', () => {
          const view = el.getAttribute('data-view-nav');
          const topic = el.getAttribute('data-topic-target');
          this.navigate(view, topic);
          this.playPopSound(520);
          setSidebarOpen(false);
        });
      });

      const soundBtn = document.getElementById('btn-toggle-sound');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          this.audioEnabled = !this.audioEnabled;
          soundBtn.classList.toggle('btn-active', this.audioEnabled);
          soundBtn.innerHTML = this.audioEnabled ? '<span>🔊</span> <span class="label">Sound ON</span>' : '<span>🔇</span> <span class="label">Sound</span>';
          if (this.audioEnabled) this.playPopSound(660);
        });
      }

      const btnGlossary = document.getElementById('btn-open-glossary');
      const btnBookmarks = document.getElementById('btn-open-bookmarks');
      const btnCloseGlossary = document.getElementById('btn-close-glossary');
      const btnCloseBookmarks = document.getElementById('btn-close-bookmarks');

      if (btnGlossary) btnGlossary.addEventListener('click', () => this.openDrawer('glossary'));
      if (btnBookmarks) btnBookmarks.addEventListener('click', () => this.openDrawer('bookmarks'));
      if (btnCloseGlossary) btnCloseGlossary.addEventListener('click', () => this.closeDrawers());
      if (btnCloseBookmarks) btnCloseBookmarks.addEventListener('click', () => this.closeDrawers());
      if (this.drawerBackdrop) this.drawerBackdrop.addEventListener('click', () => this.closeDrawers());

      const searchInput = document.getElementById('global-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
      }
    }

    navigate(view, topicId = null) {
      this.currentView = view;
      this.state.lastView = view;

      document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
      document.querySelectorAll('.nav-item-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view-nav') === view);
      });

      const targetSec = document.getElementById(`view-${view}`);
      if (targetSec) targetSec.classList.add('active');

      if (view === 'dashboard') {
        this.renderDashboard();
        this.updateBreadcrumbs('Pentium Lab', 'Home Dashboard');
      } else if (view === 'module2' || view === 'module3') {
        const defaultTopic = view === 'module2' ? 'm2-intro' : 'm3-seg';
        this.currentTopicId = topicId || this.currentTopicId || defaultTopic;
        if (!this.currentTopicId.startsWith(view === 'module2' ? 'm2' : 'm3')) {
          this.currentTopicId = defaultTopic;
        }
        this.state.lastTopic = this.currentTopicId;
        this.renderModuleView(view, this.currentTopicId);
      } else if (view === 'lab') {
        this.renderInteractiveLab();
        this.updateBreadcrumbs('Interactive Sandbox', 'Hardware Lab Benches');
      } else if (view === 'practice') {
        this.renderPracticeZone();
        this.updateBreadcrumbs('Practice Zone', 'University Exam Center');
      } else if (view === 'cheatsheet') {
        this.renderCheatSheets();
        this.updateBreadcrumbs('Revision Center', 'Quick Reference Tables');
      }

      this.saveState();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateBreadcrumbs(root, active) {
      if (this.breadcrumbRoot) this.breadcrumbRoot.innerText = root;
      if (this.breadcrumbActive) this.breadcrumbActive.innerText = active;
    }

    updateProgressMeters() {
      const curriculum = window.CURRICULUM || {};
      const total = Object.keys(curriculum).length || 19;
      const completed = this.state.completedTopics.length;
      const pct = Math.min(100, Math.round((completed / total) * 100));

      if (this.progressFill) this.progressFill.style.width = `${pct}%`;
      if (this.progressPct) this.progressPct.innerText = `${pct}%`;
    }

    renderDashboard() {
      const dash = document.getElementById('view-dashboard');
      if (!dash) return;

      const total = Object.keys(window.CURRICULUM || {}).length || 19;
      const completed = this.state.completedTopics.length;
      const bookmarked = this.state.bookmarks.length;

      dash.innerHTML = `
        <div class="paper-card card-ivory" style="margin-bottom: 28px; position: relative;">
          <div class="tape-banner tape-yellow tape-pinned">INTEL PENTIUM SUPERSCALAR ARCHITECTURE LAB</div>
          <div style="display: flex; gap: 30px; align-items: center; flex-wrap: wrap; margin-top: 10px;">
            <div style="width: 140px; height: 160px; background: var(--pentium-coral); border: var(--border-heavy); border-radius: 14px; box-shadow: var(--shadow-md); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transform: rotate(-2deg); flex-shrink: 0;">
              <div style="position: absolute; top: -10px; left: 10px; right: 10px; display: flex; justify-content: space-between;">
                ${Array.from({length: 6}).map(() => `<div style="width: 10px; height: 10px; background: var(--pentium-yellow); border: 2px solid var(--ink-black);"></div>`).join('')}
              </div>
              <div style="font-family: var(--font-display); font-size: 11px; background: #fff; border: 2px solid #000; padding: 2px 6px; box-shadow: 2px 2px 0 #000; margin-bottom: 8px;">PENTIUM</div>
              <div style="display: flex; gap: 18px; margin-bottom: 6px;">
                <div style="width: 18px; height: 18px; background: #fff; border: 2.5px solid #000; border-radius: 50%; position: relative;">
                  <div style="width: 6px; height: 6px; background: #000; border-radius: 50%; position: absolute; top: 4px; left: 4px;"></div>
                </div>
                <div style="width: 18px; height: 18px; background: #fff; border: 2.5px solid #000; border-radius: 50%; position: relative;">
                  <div style="width: 6px; height: 6px; background: #000; border-radius: 50%; position: absolute; top: 4px; left: 4px;"></div>
                </div>
              </div>
              <div style="width: 36px; height: 16px; background: #7f1d1d; border: 2.5px solid #000; border-radius: 0 0 16px 16px;"></div>
              <div style="position: absolute; bottom: -18px; width: 22px; height: 32px; background: var(--pentium-yellow); border: 2px solid #000; clip-path: polygon(25% 0%, 75% 0%, 100% 75%, 50% 100%, 0% 75%);"></div>
            </div>

            <div style="flex: 1; min-width: 280px;">
              <h1 style="font-family: var(--font-body); font-size: 32px; font-weight: 900; line-height: 1.15; color: var(--ink-black); margin-bottom: 8px;">
                Computer Engineering Syllabus Lab:<br/>
                <span style="color: var(--pentium-cyan);">Module II (Instruction Set)</span> & 
                <span style="color: var(--pentium-coral);">Module III (Memory & Cache)</span>
              </h1>
              <p style="font-size: 15px; color: var(--ink-muted); line-height: 1.5; margin-bottom: 16px;">
                Master microprocessor architecture with tactile step-by-step simulations, bitwise ALUs, 8086 segmentation calculators, 80386DX two-level paging visualizers, multi-way cache maps, and university exam practice questions.
              </p>
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="tactile-btn btn-primary" data-view-nav="module2" data-topic-target="m2-intro">Start Module II (Instructions) →</button>
                <button class="tactile-btn btn-accent" data-view-nav="module3" data-topic-target="m3-seg">Explore Module III (Memory) →</button>
                <button class="tactile-btn" data-view-nav="lab">Open Interactive Lab 🛠️</button>
              </div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
          <div class="paper-card" style="padding: 18px;">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); text-transform: uppercase;">Topics Completed</div>
            <div style="font-family: var(--font-mono); font-size: 30px; font-weight: 900; color: var(--ink-black); margin-top: 4px;">${completed} / ${total}</div>
            <div style="font-size: 12px; color: var(--ink-muted); margin-top: 4px;">${Math.round((completed/total)*100)}% Coverage</div>
          </div>
          <div class="paper-card" style="padding: 18px;">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-yellow); text-transform: uppercase;">Saved Bookmarks</div>
            <div style="font-family: var(--font-mono); font-size: 30px; font-weight: 900; color: var(--ink-black); margin-top: 4px;">${bookmarked}</div>
            <div style="font-size: 12px; color: var(--ink-muted); margin-top: 4px;">Saved for Revision</div>
          </div>
          <div class="paper-card" style="padding: 18px;">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-mint-dark); text-transform: uppercase;">Interactive Simulators</div>
            <div style="font-family: var(--font-mono); font-size: 30px; font-weight: 900; color: var(--ink-black); margin-top: 4px;">7 Active</div>
            <div style="font-size: 12px; color: var(--ink-muted); margin-top: 4px;">Full Hardware Benches</div>
          </div>
          <div class="paper-card" style="padding: 18px;">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-coral); text-transform: uppercase;">Exam Readiness</div>
            <div style="font-family: var(--font-mono); font-size: 26px; font-weight: 900; color: var(--ink-black); margin-top: 4px;">Ready ⭐</div>
            <div style="font-size: 12px; color: var(--ink-muted); margin-top: 4px;">Based on Quiz Scores</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px;">
          <div class="paper-card card-slate tilt-left" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="tape-banner tape-cyan" style="margin-bottom: 12px;">MODULE II SYLLABUS</div>
              <h2 style="font-family: var(--font-body); font-size: 22px; font-weight: 900; margin-bottom: 8px;">Instruction Set Architecture</h2>
              <p style="font-size: 13px; color: var(--ink-muted); line-height: 1.5; margin-bottom: 14px;">
                Machine instructions, execution cycle, data movement, binary arithmetic, flags, bitwise logic, control flow, string operations, and 8086 vs 80386DX comparison.
              </p>
            </div>
            <button class="tactile-btn btn-primary" style="width: 100%;" data-view-nav="module2" data-topic-target="m2-intro">Enter Module II →</button>
          </div>

          <div class="paper-card card-slate tilt-right" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div class="tape-banner tape-coral" style="margin-bottom: 12px;">MODULE III SYLLABUS</div>
              <h2 style="font-family: var(--font-body); font-size: 22px; font-weight: 900; margin-bottom: 8px;">Memory Management & Cache</h2>
              <p style="font-size: 13px; color: var(--ink-muted); line-height: 1.5; margin-bottom: 14px;">
                8086 segmentation, 80386DX protected mode descriptors, 2-level paging, combined translation pipeline, direct-mapped, set-associative, LRU/FIFO, and AMAT optimization.
              </p>
            </div>
            <button class="tactile-btn btn-danger" style="width: 100%;" data-view-nav="module3" data-topic-target="m3-seg">Enter Module III →</button>
          </div>
        </div>
      `;

      dash.querySelectorAll('[data-view-nav]').forEach(el => {
        el.addEventListener('click', () => {
          this.navigate(el.getAttribute('data-view-nav'), el.getAttribute('data-topic-target'));
        });
      });
    }

    renderModuleView(moduleKey, topicId) {
      const container = document.getElementById(`view-${moduleKey}`);
      if (!container) return;

      const curriculum = window.CURRICULUM || {};
      const topic = curriculum[topicId] || curriculum[moduleKey === 'module2' ? 'm2-intro' : 'm3-seg'];
      this.currentTopicId = topic.id;

      const topicsInModule = Object.values(curriculum).filter(t => t.module === moduleKey);
      const isBookmarked = this.state.bookmarks.includes(topic.id);
      const isCompleted = this.state.completedTopics.includes(topic.id);

      this.updateBreadcrumbs(moduleKey === 'module2' ? 'Module II: Instruction Set' : 'Module III: Memory & Cache', `${topic.number} ${topic.title}`);

      container.innerHTML = `
        <div class="module-tabs-strip">
          ${topicsInModule.map(t => `
            <button class="module-tab-btn ${t.id === topic.id ? 'active' : ''}" data-switch-topic="${t.id}">
              <span>${t.number}</span>
              <span>${t.title.split(' ')[0]}</span>
              ${this.state.completedTopics.includes(t.id) ? '<span style="color:var(--pentium-mint-dark);">✓</span>' : ''}
            </button>
          `).join('')}
        </div>

        <div class="paper-card lesson-card">
          <div class="tape-banner tape-${topic.badgeColor} tape-pinned">${topic.badge}</div>
          <div class="lesson-section-title" style="margin-top: 10px;">
            <div>
              <h2>${topic.number} — ${topic.title}</h2>
              <div class="lesson-subtitle">${topic.subtitle}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="tactile-btn btn-sm ${isBookmarked ? 'btn-accent' : ''}" id="btn-toggle-bookmark">
                ${isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
              <button class="tactile-btn btn-sm ${isCompleted ? 'btn-success' : ''}" id="btn-toggle-complete">
                ${isCompleted ? '✓ Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>

          <!-- 7-Part Pillars Grid -->
          <div class="lesson-pill-grid">
            <div class="lesson-part-pill active" data-pill-pane="understand"><span class="part-letter">PART A</span><span class="part-name">Understand</span></div>
            <div class="lesson-part-pill" data-pill-pane="visualize"><span class="part-letter">PART B</span><span class="part-name">Visualize</span></div>
            <div class="lesson-part-pill" data-pill-pane="stepByStep"><span class="part-letter">PART C</span><span class="part-name">Step by Step</span></div>
            <div class="lesson-part-pill" data-pill-pane="tryIt"><span class="part-letter">PART D</span><span class="part-name">Try It Yourself</span></div>
            <div class="lesson-part-pill" data-pill-pane="workedExample"><span class="part-letter">PART E</span><span class="part-name">Worked Example</span></div>
            <div class="lesson-part-pill" data-pill-pane="testYourself"><span class="part-letter">PART F</span><span class="part-name">Test Yourself</span></div>
            <div class="lesson-part-pill" data-pill-pane="revise"><span class="part-letter">PART G</span><span class="part-name">Revise</span></div>
          </div>

          <div class="step-pane active" id="pane-understand">
            <div style="font-family: var(--font-body); font-size: 20px; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">
              ${topic.understand.headline}
            </div>
            <div style="font-size: 14px; line-height: 1.7; color: var(--ink-black); margin-bottom: 20px;">
              ${this.formatMarkdown(topic.understand.body)}
            </div>
            <div style="background: var(--card-slate); border: var(--border-thin); border-radius: 6px; padding: 14px;">
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); margin-bottom: 6px;">KEY CONCEPT HIGHLIGHTS:</div>
              <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
                ${topic.understand.keyTakeaways.map(k => `<li>${k}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="step-pane" id="pane-visualize">
            <div style="font-family: var(--font-body); font-size: 18px; font-weight: 800; margin-bottom: 8px;">${topic.visualize.title}</div>
            <p style="font-size: 13px; color: var(--ink-muted); margin-bottom: 16px;">${topic.visualize.description}</p>
            <div id="lesson-embedded-visualizer">
              <div style="background: var(--card-white); border: var(--border-thick); border-radius: 8px; padding: 20px; box-shadow: var(--shadow-sm);">
                <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 900; color: var(--pentium-cyan); margin-bottom: 12px;">
                  INSTRUCTION / HARDWARE BLUEPRINT: ${topic.title}
                </div>
                <div style="background: var(--card-slate); padding: 16px; border-radius: 6px; font-family: var(--font-mono); font-size: 13px;">
                  Switch to <strong>Part D (Try It Yourself)</strong> to run the interactive simulator bench.
                </div>
              </div>
            </div>
          </div>

          <div class="step-pane" id="pane-stepByStep">
            <div style="font-family: var(--font-body); font-size: 18px; font-weight: 800; margin-bottom: 16px;">Numbered Execution Stages</div>
            <div class="pipeline-stages-track" style="flex-direction: column; gap: 12px;">
              ${topic.stepByStep.map(st => `
                <div class="pipeline-stage-card" style="padding: 16px;">
                  <div class="stage-header"><span>STAGE ${st.step}</span><span class="stage-chip-status">Hardware Cycle</span></div>
                  <div class="stage-title">${st.title}</div>
                  <div class="stage-desc" style="font-size: 13px;">${st.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="step-pane" id="pane-tryIt">
            <div id="lesson-interactive-sandbox-container"></div>
          </div>

          <div class="step-pane" id="pane-workedExample">
            <div style="background: var(--card-white); border: var(--border-heavy); border-radius: 8px; padding: 22px; box-shadow: var(--shadow-md); position: relative;">
              <div class="rubber-stamp stamp-green" style="position: absolute; top: 16px; right: 16px;">
                ${topic.workedExample.verifiedStamp || 'VERIFIED ✓'}
              </div>
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); margin-bottom: 6px;">UNIVERSITY EXAM WORKED PROBLEM</div>
              <div style="font-family: var(--font-body); font-size: 16px; font-weight: 800; margin-bottom: 16px; padding-right: 120px;">
                ${topic.workedExample.problem}
              </div>
              <div class="calc-step-flow">
                ${topic.workedExample.solution.map(s => `
                  <div class="calc-formula-line"><span>${s}</span></div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="step-pane" id="pane-testYourself">
            <div class="quiz-container" style="box-shadow: none; border-width: 2.5px; padding: 18px;">
              <div class="quiz-question-text">${topic.quiz.question}</div>
              <div class="quiz-options-list" id="lesson-quiz-options">
                ${topic.quiz.options.map((opt, i) => `
                  <button class="quiz-option-btn" data-lesson-opt-idx="${i}">
                    <span class="option-badge">${String.fromCharCode(65 + i)}</span>
                    <span>${opt}</span>
                  </button>
                `).join('')}
              </div>
              <div class="quiz-explanation-box" id="lesson-quiz-explanation">
                <strong>Answer Explanation:</strong> ${topic.quiz.explanation}
              </div>
            </div>
          </div>

          <div class="step-pane" id="pane-revise">
            <div style="font-family: var(--font-body); font-size: 18px; font-weight: 800; margin-bottom: 12px;">Exam Takeaways & Revision Traps</div>
            <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm); margin-bottom: 16px;">
              <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-mint-dark); margin-bottom: 8px;">MUST-KNOW EXAM POINTS:</div>
              <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
                ${topic.revise.examTips.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
            <div class="exam-trap-box">
              <div class="trap-header">⚠️ COMMON EXAM TRAP TO AVOID:</div>
              <div>${topic.revise.traps}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed rgba(120, 113, 108, 0.4); flex-wrap: wrap; gap: 12px;">
            ${this.getPrevTopic(topic.id) ? `
              <button class="tactile-btn btn-sm" data-switch-topic="${this.getPrevTopic(topic.id).id}">← Previous: ${this.getPrevTopic(topic.id).number}</button>
            ` : '<div></div>'}
            ${this.getNextTopic(topic.id) ? `
              <button class="tactile-btn btn-primary btn-sm" data-switch-topic="${this.getNextTopic(topic.id).id}">Next: ${this.getNextTopic(topic.id).number} →</button>
            ` : '<div></div>'}
          </div>
        </div>
      `;

      container.querySelectorAll('[data-switch-topic]').forEach(b => {
        b.addEventListener('click', () => this.navigate(moduleKey, b.getAttribute('data-switch-topic')));
      });

      container.querySelectorAll('[data-pill-pane]').forEach(p => {
        p.addEventListener('click', () => {
          container.querySelectorAll('.lesson-part-pill').forEach(el => el.classList.remove('active'));
          container.querySelectorAll('.step-pane').forEach(el => el.classList.remove('active'));
          p.classList.add('active');
          const paneId = p.getAttribute('data-pill-pane');
          const target = document.getElementById(`pane-${paneId}`);
          if (target) target.classList.add('active');
          if (paneId === 'tryIt') {
            this.mountSimulator(topic.id, 'lesson-interactive-sandbox-container');
          }
          this.playPopSound(480);
        });
      });

      const bmBtn = document.getElementById('btn-toggle-bookmark');
      if (bmBtn) {
        bmBtn.addEventListener('click', () => {
          const idx = this.state.bookmarks.indexOf(topic.id);
          if (idx >= 0) {
            this.state.bookmarks.splice(idx, 1);
            bmBtn.classList.remove('btn-accent');
            bmBtn.innerText = '☆ Bookmark';
          } else {
            this.state.bookmarks.push(topic.id);
            bmBtn.classList.add('btn-accent');
            bmBtn.innerText = '★ Bookmarked';
            this.playPopSound(660);
          }
          this.saveState();
        });
      }

      const compBtn = document.getElementById('btn-toggle-complete');
      if (compBtn) {
        compBtn.addEventListener('click', () => {
          const idx = this.state.completedTopics.indexOf(topic.id);
          if (idx >= 0) {
            this.state.completedTopics.splice(idx, 1);
            compBtn.classList.remove('btn-success');
            compBtn.innerText = 'Mark Complete';
          } else {
            this.state.completedTopics.push(topic.id);
            compBtn.classList.add('btn-success');
            compBtn.innerText = '✓ Completed';
            this.playPopSound(720);
          }
          this.saveState();
        });
      }

      const quizOpts = container.querySelectorAll('[data-lesson-opt-idx]');
      const explBox = document.getElementById('lesson-quiz-explanation');
      quizOpts.forEach(btn => {
        btn.addEventListener('click', () => {
          const chosen = Number(btn.getAttribute('data-lesson-opt-idx'));
          quizOpts.forEach(b => {
            b.disabled = true;
            const idx = Number(b.getAttribute('data-lesson-opt-idx'));
            if (idx === topic.quiz.correctIndex) b.classList.add('correct');
            else if (idx === chosen) b.classList.add('incorrect');
          });
          if (explBox) explBox.classList.add('show');
          if (chosen === topic.quiz.correctIndex) {
            this.playPopSound(720);
            if (!this.state.completedTopics.includes(topic.id)) {
              this.state.completedTopics.push(topic.id);
              this.saveState();
            }
          } else {
            this.playPopSound(220, 'sawtooth');
          }
        });
      });
    }

    mountSimulator(topicId, containerId) {
      const el = document.getElementById(containerId);
      if (!el) return;
      el.innerHTML = '';

      if (topicId.startsWith('m2-datamov') || topicId === 'm2-intro') {
        if (window.RegisterSim) new window.RegisterSim(containerId);
      } else if (topicId.startsWith('m2-arith') || topicId.startsWith('m2-logic') || topicId.startsWith('m2-flags')) {
        if (window.AluBitwiseSim) new window.AluBitwiseSim(containerId);
      } else if (topicId.startsWith('m3-seg') || topicId.startsWith('m2-arch-compare')) {
        if (window.SegmentationSim) new window.SegmentationSim(containerId);
      } else if (topicId.startsWith('m3-paging')) {
        if (window.PagingSim) new window.PagingSim(containerId);
      } else if (topicId.startsWith('m3-combined')) {
        if (window.CombinedTranslationSim) new window.CombinedTranslationSim(containerId);
      } else if (topicId.startsWith('m3-direct') || topicId.startsWith('m3-associative') || topicId.startsWith('m3-set') || topicId.startsWith('m3-replacement') || topicId.startsWith('m3-cache-fundamentals')) {
        if (window.CacheSim) new window.CacheSim(containerId);
      } else if (topicId.startsWith('m3-cache-perf') || topicId.startsWith('m3-memory-hierarchy')) {
        if (window.AmatSim) new window.AmatSim(containerId);
      } else {
        if (window.RegisterSim) new window.RegisterSim(containerId);
      }
    }

    renderInteractiveLab() {
      const lab = document.getElementById('view-lab');
      if (!lab) return;

      lab.innerHTML = `
        <div class="lesson-section-title">
          <div>
            <h2>Interactive Microprocessor Lab Sandbox</h2>
            <div class="lesson-subtitle">All 7 hardware simulators unified on dedicated laboratory benches</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
          <button class="tactile-btn btn-sm btn-primary" data-lab-bench="reg">1. Register & Stack Lab</button>
          <button class="tactile-btn btn-sm" data-lab-bench="alu">2. Binary ALU & Flags</button>
          <button class="tactile-btn btn-sm" data-lab-bench="seg">3. 8086 & 386 Segmentation</button>
          <button class="tactile-btn btn-sm" data-lab-bench="paging">4. 386 Two-Level Paging</button>
          <button class="tactile-btn btn-sm" data-lab-bench="combined">5. Combined Address Pipeline</button>
          <button class="tactile-btn btn-sm" data-lab-bench="cache">6. Multi-Way Cache Simulator</button>
          <button class="tactile-btn btn-sm" data-lab-bench="amat">7. AMAT Performance Optimizer</button>
        </div>
        <div id="active-lab-bench-container"></div>
      `;

      const switchBench = (benchKey) => {
        lab.querySelectorAll('[data-lab-bench]').forEach(b => {
          b.classList.toggle('btn-primary', b.getAttribute('data-lab-bench') === benchKey);
        });
        const c = 'active-lab-bench-container';
        const container = document.getElementById(c);
        if (container) container.innerHTML = '';

        switch (benchKey) {
          case 'reg': if (window.RegisterSim) new window.RegisterSim(c); break;
          case 'alu': if (window.AluBitwiseSim) new window.AluBitwiseSim(c); break;
          case 'seg': if (window.SegmentationSim) new window.SegmentationSim(c); break;
          case 'paging': if (window.PagingSim) new window.PagingSim(c); break;
          case 'combined': if (window.CombinedTranslationSim) new window.CombinedTranslationSim(c); break;
          case 'cache': if (window.CacheSim) new window.CacheSim(c); break;
          case 'amat': if (window.AmatSim) new window.AmatSim(c); break;
        }
      };

      lab.querySelectorAll('[data-lab-bench]').forEach(b => {
        b.addEventListener('click', () => switchBench(b.getAttribute('data-lab-bench')));
      });

      switchBench('reg');
    }

    renderPracticeZone() {
      const practice = document.getElementById('view-practice');
      if (!practice) return;

      practice.innerHTML = `
        <div class="lesson-section-title">
          <div>
            <h2>University Examination Practice Zone</h2>
            <div class="lesson-subtitle">Syllabus-aligned multiple choice and numerical address problems</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
          <button class="tactile-btn btn-sm btn-primary" id="btn-quiz-filter-all">All Questions (20)</button>
          <button class="tactile-btn btn-sm" id="btn-quiz-filter-m2">Module II Only (10)</button>
          <button class="tactile-btn btn-sm" id="btn-quiz-filter-m3">Module III Only (10)</button>
        </div>
        <div id="practice-questions-list" style="display: flex; flex-direction: column; gap: 20px;"></div>
      `;

      const renderQuizList = (filter) => {
        const list = document.getElementById('practice-questions-list');
        if (!list) return;

        const bank = (window.APP_DATA && window.APP_DATA.QUIZ_BANK) || [];
        const questions = bank.filter(q => filter === 'all' || q.module === filter);

        list.innerHTML = questions.map((q, idx) => `
          <div class="quiz-container" id="quiz-card-${q.id}">
            <div class="quiz-header">
              <span class="tactile-chip ${q.module === 'module2' ? 'chip-cyan' : 'chip-coral'}">
                ${q.module === 'module2' ? 'MODULE II' : 'MODULE III'} • ${q.difficulty.toUpperCase()}
              </span>
              <span style="font-family: var(--font-mono); font-size: 12px; font-weight: 800;">Question #${idx + 1}</span>
            </div>
            <div class="quiz-question-text">${q.question}</div>
            <div class="quiz-options-list">
              ${q.options.map((opt, oIdx) => `
                <button class="quiz-option-btn" data-pq-id="${q.id}" data-pq-idx="${oIdx}">
                  <span class="option-badge">${String.fromCharCode(65 + oIdx)}</span>
                  <span>${opt}</span>
                </button>
              `).join('')}
            </div>
            <div class="quiz-explanation-box" id="pq-expl-${q.id}">
              <strong>Answer Explanation:</strong> ${q.explanation}
            </div>
          </div>
        `).join('');

        list.querySelectorAll('[data-pq-id]').forEach(btn => {
          btn.addEventListener('click', () => {
            const qId = btn.getAttribute('data-pq-id');
            const chosen = Number(btn.getAttribute('data-pq-idx'));
            const q = bank.find(item => item.id === qId);

            const card = document.getElementById(`quiz-card-${qId}`);
            if (card) {
              card.querySelectorAll('[data-pq-id]').forEach(b => {
                b.disabled = true;
                const idx = Number(b.getAttribute('data-pq-idx'));
                if (idx === q.correctIndex) b.classList.add('correct');
                else if (idx === chosen) b.classList.add('incorrect');
              });
              const expl = document.getElementById(`pq-expl-${qId}`);
              if (expl) expl.classList.add('show');
            }

            if (chosen === q.correctIndex) {
              this.playPopSound(700);
              this.state.quizScores[qId] = 100;
            } else {
              this.playPopSound(200, 'sawtooth');
              this.state.quizScores[qId] = 0;
            }
            this.saveState();
          });
        });
      };

      const bAll = document.getElementById('btn-quiz-filter-all');
      const bM2 = document.getElementById('btn-quiz-filter-m2');
      const bM3 = document.getElementById('btn-quiz-filter-m3');

      if (bAll) bAll.addEventListener('click', () => { bAll.classList.add('btn-primary'); bM2.classList.remove('btn-primary'); bM3.classList.remove('btn-primary'); renderQuizList('all'); });
      if (bM2) bM2.addEventListener('click', () => { bM2.classList.add('btn-primary'); bAll.classList.remove('btn-primary'); bM3.classList.remove('btn-primary'); renderQuizList('module2'); });
      if (bM3) bM3.addEventListener('click', () => { bM3.classList.add('btn-primary'); bAll.classList.remove('btn-primary'); bM2.classList.remove('btn-primary'); renderQuizList('module3'); });

      renderQuizList('all');
    }

    renderCheatSheets() {
      const cs = document.getElementById('view-cheatsheet');
      if (!cs) return;

      const sheets = (window.APP_DATA && window.APP_DATA.CHEATSHEETS) || {};

      cs.innerHTML = `
        <div class="lesson-section-title">
          <div>
            <h2>Revision Cheat Sheets & Reference Cards</h2>
            <div class="lesson-subtitle">Summary tables, instruction sets, addressing formulas, and cache equations</div>
          </div>
        </div>

        <div class="paper-card" style="margin-bottom: 24px;">
          <div class="tape-banner tape-cyan tape-pinned">8086 & 80386DX INSTRUCTION SET SUMMARY</div>
          <div class="cache-table-wrapper" style="margin-top: 14px;">
            <table class="cache-table">
              <thead>
                <tr><th>Mnemonic</th><th>Operands</th><th>Description</th><th>Flags Modified</th><th>CPU Mode</th></tr>
              </thead>
              <tbody>
                ${(sheets.instructions || []).map(i => `
                  <tr>
                    <td style="font-weight: 900; color: var(--pentium-cyan);">${i.mnemonic}</td>
                    <td>${i.operands}</td><td>${i.desc}</td><td>${i.flags}</td><td>${i.mode}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="paper-card" style="margin-bottom: 24px;">
          <div class="tape-banner tape-yellow tape-pinned">8086 ADDRESSING MODES CHEAT SHEET</div>
          <div class="cache-table-wrapper" style="margin-top: 14px;">
            <table class="cache-table">
              <thead>
                <tr><th>Addressing Mode</th><th>Example Assembly</th><th>Effective Address (EA) Formula</th><th>Default Segment</th></tr>
              </thead>
              <tbody>
                ${(sheets.addressingModes || []).map(a => `
                  <tr><td style="font-weight: 900;">${a.mode}</td><td><code>${a.example}</code></td><td>${a.eaFormula}</td><td>${a.defaultSeg}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="paper-card" style="margin-bottom: 24px;">
          <div class="tape-banner tape-coral tape-pinned">16-BIT FLAGS REGISTER MATRIX</div>
          <div class="cache-table-wrapper" style="margin-top: 14px;">
            <table class="cache-table">
              <thead>
                <tr><th>Bit</th><th>Flag</th><th>Name</th><th>Type</th><th>Condition to Set to 1</th></tr>
              </thead>
              <tbody>
                ${(sheets.flagsMatrix || []).map(f => `
                  <tr>
                    <td>Bit ${f.bit}</td><td style="font-weight: 900; color: var(--pentium-coral);">${f.flag}</td>
                    <td>${f.name}</td><td><span class="tactile-chip ${f.type === 'Status' ? 'chip-cyan' : 'chip-yellow'}">${f.type}</span></td>
                    <td>${f.setWhen}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    openDrawer(type) {
      this.closeDrawers();
      if (type === 'glossary') {
        this.renderGlossaryDrawer();
        if (this.glossaryDrawer) this.glossaryDrawer.classList.add('open');
      } else if (type === 'bookmarks') {
        this.renderBookmarksDrawer();
        if (this.bookmarksDrawer) this.bookmarksDrawer.classList.add('open');
      }
      if (this.drawerBackdrop) this.drawerBackdrop.classList.add('open');
      this.playPopSound(500);
    }

    closeDrawers() {
      if (this.glossaryDrawer) this.glossaryDrawer.classList.remove('open');
      if (this.bookmarksDrawer) this.bookmarksDrawer.classList.remove('open');
      if (this.drawerBackdrop) this.drawerBackdrop.classList.remove('open');
    }

    renderGlossaryDrawer() {
      const content = document.getElementById('glossary-drawer-items');
      if (!content) return;

      const list = (window.APP_DATA && window.APP_DATA.GLOSSARY) || [];

      content.innerHTML = `
        <input type="text" id="glossary-search-input" placeholder="Search technical terms..." 
               style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-size: 13px; font-weight: 700; border: var(--border-thin); border-radius: 4px; box-shadow: 2px 2px 0 #000; margin-bottom: 14px;" />
        <div id="glossary-list-filtered" style="display: flex; flex-direction: column; gap: 10px;">
          ${list.map(g => `
            <div style="background: var(--card-white); border: 1.5px solid var(--ink-black); border-radius: 6px; padding: 12px; box-shadow: 2px 2px 0 #000;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="font-family: var(--font-body); font-size: 14px; font-weight: 800;">${g.term}</strong>
                <span class="tactile-chip chip-yellow" style="font-size: 9px;">${g.module}</span>
              </div>
              <div style="font-size: 12px; color: var(--ink-muted); line-height: 1.45;">${g.definition}</div>
            </div>
          `).join('')}
        </div>
      `;

      const searchInput = document.getElementById('glossary-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase();
          const filtered = list.filter(g => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q));
          const fList = document.getElementById('glossary-list-filtered');
          if (fList) {
            fList.innerHTML = filtered.map(g => `
              <div style="background: var(--card-white); border: 1.5px solid var(--ink-black); border-radius: 6px; padding: 12px; box-shadow: 2px 2px 0 #000;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="font-family: var(--font-body); font-size: 14px; font-weight: 800;">${g.term}</strong>
                  <span class="tactile-chip chip-yellow" style="font-size: 9px;">${g.module}</span>
                </div>
                <div style="font-size: 12px; color: var(--ink-muted); line-height: 1.45;">${g.definition}</div>
              </div>
            `).join('');
          }
        });
      }
    }

    renderBookmarksDrawer() {
      const content = document.getElementById('bookmarks-drawer-items');
      if (!content) return;

      const curriculum = window.CURRICULUM || {};

      if (!this.state.bookmarks.length) {
        content.innerHTML = `
          <div style="text-align: center; color: var(--ink-muted); padding: 40px 10px;">
            <div style="font-size: 32px; margin-bottom: 8px;">📑</div>
            <div style="font-weight: 800; font-family: var(--font-body);">No Saved Bookmarks</div>
            <div style="font-size: 12px; margin-top: 4px;">Click the Bookmark button inside any lesson to save it here for fast exam revision.</div>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${this.state.bookmarks.map(id => {
            const t = curriculum[id];
            if (!t) return '';
            return `
              <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 12px; box-shadow: 2px 2px 0 #000; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" data-jump-bookmark="${t.id}" data-jump-mod="${t.module}">
                <div>
                  <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan);">${t.number}</div>
                  <div style="font-family: var(--font-body); font-size: 13px; font-weight: 800;">${t.title}</div>
                </div>
                <span class="tactile-chip chip-cyan" style="font-size: 10px;">Jump →</span>
              </div>
            `;
          }).join('')}
        </div>
      `;

      content.querySelectorAll('[data-jump-bookmark]').forEach(el => {
        el.addEventListener('click', () => {
          this.closeDrawers();
          this.navigate(el.getAttribute('data-jump-mod'), el.getAttribute('data-jump-bookmark'));
        });
      });
    }

    handleSearch(query) {
      if (!query || query.trim().length < 2) return;
      const q = query.toLowerCase().trim();
      const curriculum = window.CURRICULUM || {};
      const matches = Object.values(curriculum).filter(t => 
        t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)
      );
      if (matches.length > 0) {
        this.navigate(matches[0].module, matches[0].id);
      }
    }

    getPrevTopic(currentId) {
      const keys = Object.keys(window.CURRICULUM || {});
      const idx = keys.indexOf(currentId);
      return idx > 0 ? window.CURRICULUM[keys[idx - 1]] : null;
    }

    getNextTopic(currentId) {
      const keys = Object.keys(window.CURRICULUM || {});
      const idx = keys.indexOf(currentId);
      return idx < keys.length - 1 ? window.CURRICULUM[keys[idx + 1]] : null;
    }

    formatMarkdown(str) {
      return str
        .replace(/### (.*)/g, '<h4 style="font-family:var(--font-body); font-size:16px; font-weight:800; margin-top:14px; margin-bottom:6px; color:var(--ink-black);">$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background:var(--pentium-yellow-pale); padding:2px 5px; border-radius:3px; font-family:var(--font-mono); font-size:12px; font-weight:800;">$1</code>')
        .replace(/\n\n/g, '<br/><br/>');
    }
  }

  window.MicroprocessorApp = MicroprocessorApp;

  document.addEventListener('DOMContentLoaded', () => {
    window.app = new MicroprocessorApp();
  });
})();
