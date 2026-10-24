/* ==========================================================================
   MICROPROCESSOR INTERACTIVE LEARNING PLATFORM - CORE ENGINE
   State Management, Routing, 7-Part Lesson Flow, and Persistence
   ========================================================================== */

import { CURRICULUM } from './data/curriculum.js';
import { GLOSSARY } from './data/glossary.js';
import { QUIZ_BANK } from './data/quizzes.js';
import { CHEATSHEETS } from './data/cheatsheets.js';

import { RegisterSim } from './simulators/registerSim.js';
import { AluBitwiseSim } from './simulators/aluBitwiseSim.js';
import { SegmentationSim } from './simulators/segmentationSim.js';
import { PagingSim } from './simulators/pagingSim.js';
import { CombinedTranslationSim } from './simulators/combinedTranslationSim.js';
import { CacheSim } from './simulators/cacheSim.js';
import { AmatSim } from './simulators/amatSim.js';

class MicroprocessorApp {
  constructor() {
    this.currentView = 'dashboard';
    this.currentTopicId = 'm2-intro';
    this.activeSimulators = {};
    this.audioEnabled = false;

    // Load LocalStorage State
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
    } catch (e) {
      console.warn('LocalStorage unavailable, using in-memory state.');
    }
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

  // Synthesized Web Audio API sound effects (no external mp3 files needed)
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {}
  }

  playPopSound(freq = 440, type = 'sine', duration = 0.06) {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
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

  playStampSound() {
    this.playPopSound(180, 'triangle', 0.12);
  }

  initDOM() {
    // Top header breadcrumb
    this.breadcrumbRoot = document.getElementById('bc-root');
    this.breadcrumbActive = document.getElementById('bc-active');

    // Sidebar progress
    this.progressFill = document.getElementById('sidebar-progress-fill');
    this.progressPct = document.getElementById('sidebar-progress-pct');

    // Drawer elements
    this.glossaryDrawer = document.getElementById('drawer-glossary');
    this.bookmarksDrawer = document.getElementById('drawer-bookmarks');
    this.drawerBackdrop = document.getElementById('drawer-backdrop');
  }

  bindEvents() {
    // Navigation items
    document.querySelectorAll('[data-view-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        const view = el.getAttribute('data-view-nav');
        const topic = el.getAttribute('data-topic-target');
        this.navigate(view, topic);
        this.playPopSound(520);

        // Close mobile sidebar if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Mobile nav toggle
    const mobToggle = document.getElementById('btn-mobile-nav');
    const sidebar = document.getElementById('sidebar');
    if (mobToggle && sidebar) {
      mobToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Sound toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.audioEnabled = !this.audioEnabled;
        soundBtn.classList.toggle('btn-active', this.audioEnabled);
        soundBtn.innerHTML = this.audioEnabled ? '<span>🔊</span> <span class="label">Sound ON</span>' : '<span>🔇</span> <span class="label">Sound</span>';
        if (this.audioEnabled) this.playPopSound(660);
      });
    }

    // Drawers
    const btnGlossary = document.getElementById('btn-open-glossary');
    const btnBookmarks = document.getElementById('btn-open-bookmarks');
    const btnCloseGlossary = document.getElementById('btn-close-glossary');
    const btnCloseBookmarks = document.getElementById('btn-close-bookmarks');

    if (btnGlossary) btnGlossary.addEventListener('click', () => this.openDrawer('glossary'));
    if (btnBookmarks) btnBookmarks.addEventListener('click', () => this.openDrawer('bookmarks'));
    if (btnCloseGlossary) btnCloseGlossary.addEventListener('click', () => this.closeDrawers());
    if (btnCloseBookmarks) btnCloseBookmarks.addEventListener('click', () => this.closeDrawers());
    if (this.drawerBackdrop) this.drawerBackdrop.addEventListener('click', () => this.closeDrawers());

    // Search bar
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  }

  navigate(view, topicId = null) {
    this.currentView = view;
    this.state.lastView = view;

    // Hide all view sections
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));

    // Highlight sidebar active item
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      const match = btn.getAttribute('data-view-nav') === view;
      btn.classList.toggle('active', match);
    });

    const targetSec = document.getElementById(`view-${view}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

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
    const totalTopics = Object.keys(CURRICULUM).length;
    const completed = this.state.completedTopics.length;
    const pct = Math.min(100, Math.round((completed / totalTopics) * 100));

    if (this.progressFill) this.progressFill.style.width = `${pct}%`;
    if (this.progressPct) this.progressPct.innerText = `${pct}%`;
  }

  // ========================================================================
  // VIEW RENDERERS
  // ========================================================================

  renderDashboard() {
    const dash = document.getElementById('view-dashboard');
    if (!dash) return;

    const totalTopics = Object.keys(CURRICULUM).length;
    const completedCount = this.state.completedTopics.length;
    const bookmarkedCount = this.state.bookmarks.length;

    dash.innerHTML = `
      <!-- Welcome Hero Banner in Pentium Tactile Style -->
      <div class="paper-card card-ivory" style="margin-bottom: 28px; position: relative; overflow: visible;">
        <div class="tape-banner tape-yellow tape-pinned">INTEL PENTIUM SUPERSCALAR ARCHITECTURE LAB</div>

        <div style="display: flex; gap: 30px; align-items: center; flex-wrap: wrap; margin-top: 10px;">
          <!-- Left Mascot Cutout (Matching video happy CPU character) -->
          <div style="width: 140px; height: 160px; background: var(--pentium-coral); border: var(--border-heavy); border-radius: 14px; box-shadow: var(--shadow-md); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transform: rotate(-2deg); flex-shrink: 0;">
            <!-- Golden CPU Pins -->
            <div style="position: absolute; top: -10px; left: 10px; right: 10px; display: flex; justify-content: space-between;">
              ${Array.from({length: 6}).map(() => `<div style="width: 10px; height: 10px; background: var(--pentium-yellow); border: 2px solid var(--ink-black);"></div>`).join('')}
            </div>
            <!-- Face -->
            <div style="font-family: var(--font-display); font-size: 11px; background: #fff; border: 2px solid #000; padding: 2px 6px; box-shadow: 2px 2px 0 #000; margin-bottom: 8px;">PENTIUM</div>
            <div style="display: flex; gap: 18px; margin-bottom: 6px;">
              <div style="width: 18px; height: 18px; background: #fff; border: 2.5px solid #000; border-radius: 50%; position: relative;">
                <div style="width: 6px; height: 6px; background: #000; border-radius: 50%; position: absolute; top: 4px; left: 4px;"></div>
              </div>
              <div style="width: 18px; height: 18px; background: #fff; border: 2.5px solid #000; border-radius: 50%; position: relative;">
                <div style="width: 6px; height: 6px; background: #000; border-radius: 50%; position: absolute; top: 4px; left: 4px;"></div>
              </div>
            </div>
            <!-- Smile / Shout Mouth -->
            <div style="width: 36px; height: 16px; background: #7f1d1d; border: 2.5px solid #000; border-radius: 0 0 16px 16px;"></div>
            <!-- Yellow Tie -->
            <div style="position: absolute; bottom: -18px; width: 22px; height: 32px; background: var(--pentium-yellow); border: 2px solid #000; clip-path: polygon(25% 0%, 75% 0%, 100% 75%, 50% 100%, 0% 75%);"></div>
          </div>

          <!-- Hero Text -->
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
              <button class="tactile-btn btn-primary" data-view-nav="module2" data-topic-target="m2-intro">
                Start Module II (Instructions) →
              </button>
              <button class="tactile-btn btn-accent" data-view-nav="module3" data-topic-target="m3-seg">
                Explore Module III (Memory) →
              </button>
              <button class="tactile-btn" data-view-nav="lab">
                Open Interactive Lab 🛠️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px;">
        <div class="paper-card" style="padding: 18px;">
          <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); text-transform: uppercase;">Topics Completed</div>
          <div style="font-family: var(--font-mono); font-size: 30px; font-weight: 900; color: var(--ink-black); margin-top: 4px;">
            ${completedCount} / ${totalTopics}
          </div>
          <div style="font-size: 12px; color: var(--ink-muted); margin-top: 4px;">${Math.round((completedCount/totalTopics)*100)}% Syllabus Coverage</div>
        </div>

        <div class="paper-card" style="padding: 18px;">
          <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-yellow); text-transform: uppercase;">Saved Bookmarks</div>
          <div style="font-family: var(--font-mono); font-size: 30px; font-weight: 900; color: var(--ink-black); margin-top: 4px;">
            ${bookmarkedCount}
          </div>
          <div style="font-size: 12px; color: var(--ink-muted); margin-top: 4px;">Saved for Revision</div>
        </div>

        <div class="paper-card" style="padding: 18px;">
          <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-mint-dark); text-transform: uppercase;">Interactive Simulators</div>
          <div style="font-family: var(--font-mono); font-size: 30px; font-weight: 900; color: var(--ink-black); margin-top: 4px;">
            7 Active
          </div>
          <div style="font-size: 12px; color: var(--ink-muted); margin-top: 4px;">Full Hardware Models</div>
        </div>

        <div class="paper-card" style="padding: 18px;">
          <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-coral); text-transform: uppercase;">Exam Readiness</div>
          <div style="font-family: var(--font-mono); font-size: 30px; font-weight: 900; color: var(--ink-black); margin-top: 4px;">
            ${this.calculateExamGrade()}
          </div>
          <div style="font-size: 12px; color: var(--ink-muted); margin-top: 4px;">Based on Quiz Scores</div>
        </div>
      </div>

      <!-- Syllabus Module Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 24px; margin-bottom: 32px;">
        <!-- Module II Card -->
        <div class="paper-card card-slate tilt-left" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div class="screw-head screw-tl"></div>
          <div class="screw-head screw-tr"></div>
          <div>
            <div class="tape-banner tape-cyan" style="margin-bottom: 12px;">MODULE II SYLLABUS</div>
            <h2 style="font-family: var(--font-body); font-size: 22px; font-weight: 900; color: var(--ink-black); margin-bottom: 8px;">
              Instruction Set Architecture
            </h2>
            <p style="font-size: 13px; color: var(--ink-muted); line-height: 1.5; margin-bottom: 14px;">
              Machine instructions, execution cycle, data movement, binary arithmetic, flags, bitwise logic, control flow, string operations, and 8086 vs 80386DX comparison.
            </p>
            <div style="display: flex; flex-direction: column; gap: 6px; font-family: var(--font-mono); font-size: 12px; font-weight: 700;">
              <div>• 4.1 Intro to Instruction Sets & Anatomy</div>
              <div>• 4.2 Data Movement (MOV, PUSH/POP, LEA, XCHG)</div>
              <div>• 4.3 Binary Arithmetic (ADD, SUB, MUL, DIV, CF vs OF)</div>
              <div>• 4.4 Logical & Shifts (AND, XOR, SHL, SAR, ROL)</div>
              <div>• 4.5 Control Transfer (JMP, CALL/RET, LOOP, INT)</div>
              <div>• 4.6 Strings & XLAT Translation</div>
              <div>• 4.7 Flag Control Instructions</div>
              <div>• 5.0 Self-Study: 8086 vs 80386DX Systems Architecture</div>
            </div>
          </div>
          <div style="margin-top: 20px;">
            <button class="tactile-btn btn-primary" style="width: 100%;" data-view-nav="module2" data-topic-target="m2-intro">
              Enter Module II →
            </button>
          </div>
        </div>

        <!-- Module III Card -->
        <div class="paper-card card-slate tilt-right" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div class="screw-head screw-tl"></div>
          <div class="screw-head screw-tr"></div>
          <div>
            <div class="tape-banner tape-coral" style="margin-bottom: 12px;">MODULE III SYLLABUS</div>
            <h2 style="font-family: var(--font-body); font-size: 22px; font-weight: 900; color: var(--ink-black); margin-bottom: 8px;">
              Memory Management & Cache Memory
            </h2>
            <p style="font-size: 13px; color: var(--ink-muted); line-height: 1.5; margin-bottom: 14px;">
              8086 segmentation, 80386DX protected mode descriptors, 2-level paging, combined translation pipeline, direct-mapped, set-associative, LRU/FIFO, and AMAT optimization.
            </p>
            <div style="display: flex; flex-direction: column; gap: 6px; font-family: var(--font-mono); font-size: 12px; font-weight: 700;">
              <div>• 6.1 Segmentation (Physical = Seg × 16 + Offset)</div>
              <div>• 6.2 Paging Architecture (10-10-12 Decomposition & CR3)</div>
              <div>• 6.3 Combined Translation: Segmentation + Paging</div>
              <div>• 6.4 Segmentation Versus Paging Matrix</div>
              <div>• 7.1 Cache Fundamentals & Hierarchy</div>
              <div>• 7.2 Direct-Mapped Cache Simulation</div>
              <div>• 7.3 Associative & 7.4 Set-Associative Caches</div>
              <div>• 7.5 Cache Replacement Algorithms (LRU vs FIFO)</div>
              <div>• 7.6 Cache Performance & AMAT Formula</div>
            </div>
          </div>
          <div style="margin-top: 20px;">
            <button class="tactile-btn btn-danger" style="width: 100%;" data-view-nav="module3" data-topic-target="m3-seg">
              Enter Module III →
            </button>
          </div>
        </div>
      </div>
    `;

    // Re-bind buttons inside dynamic content
    dash.querySelectorAll('[data-view-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const view = el.getAttribute('data-view-nav');
        const topic = el.getAttribute('data-topic-target');
        this.navigate(view, topic);
      });
    });
  }

  calculateExamGrade() {
    const scores = Object.values(this.state.quizScores);
    if (!scores.length) return 'Ready';
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    if (avg >= 90) return 'Distinction 🏆';
    if (avg >= 75) return 'First Class ⭐';
    if (avg >= 50) return 'Pass ✓';
    return 'Revising 📖';
  }

  // ========================================================================
  // MODULE II & III LESSON VIEW RENDERER (7-Part Pillar Structure)
  // ========================================================================

  renderModuleView(moduleKey, topicId) {
    const container = document.getElementById(`view-${moduleKey}`);
    if (!container) return;

    const topic = CURRICULUM[topicId] || CURRICULUM[moduleKey === 'module2' ? 'm2-intro' : 'm3-seg'];
    this.currentTopicId = topic.id;

    // Filter subtopics for the tabs strip
    const topicsInModule = Object.values(CURRICULUM).filter(t => t.module === moduleKey);

    const isBookmarked = this.state.bookmarks.includes(topic.id);
    const isCompleted = this.state.completedTopics.includes(topic.id);

    this.updateBreadcrumbs(moduleKey === 'module2' ? 'Module II: Instruction Set' : 'Module III: Memory & Cache', `${topic.number} ${topic.title}`);

    container.innerHTML = `
      <!-- Horizontal Subtopic Tabs -->
      <div class="module-tabs-strip">
        ${topicsInModule.map(t => {
          const isActive = t.id === topic.id;
          const isDone = this.state.completedTopics.includes(t.id);
          return `
            <button class="module-tab-btn ${isActive ? 'active' : ''}" data-switch-topic="${t.id}">
              <span>${t.number}</span>
              <span>${t.title.split(' ')[0]}</span>
              ${isDone ? '<span style="color:var(--pentium-mint-dark);">✓</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Main Lesson Card -->
      <div class="paper-card lesson-card">
        <!-- Pinned Persona Tag -->
        <div class="tape-banner tape-${topic.badgeColor} tape-pinned">${topic.badge}</div>

        <!-- Lesson Header -->
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

        <!-- 7-Part Interactive Pillars Strip -->
        <div class="lesson-pill-grid">
          <div class="lesson-part-pill active" data-pill-pane="understand">
            <span class="part-letter">PART A</span>
            <span class="part-name">Understand</span>
          </div>
          <div class="lesson-part-pill" data-pill-pane="visualize">
            <span class="part-letter">PART B</span>
            <span class="part-name">Visualize</span>
          </div>
          <div class="lesson-part-pill" data-pill-pane="stepByStep">
            <span class="part-letter">PART C</span>
            <span class="part-name">Step by Step</span>
          </div>
          <div class="lesson-part-pill" data-pill-pane="tryIt">
            <span class="part-letter">PART D</span>
            <span class="part-name">Try It Yourself</span>
          </div>
          <div class="lesson-part-pill" data-pill-pane="workedExample">
            <span class="part-letter">PART E</span>
            <span class="part-name">Worked Example</span>
          </div>
          <div class="lesson-part-pill" data-pill-pane="testYourself">
            <span class="part-letter">PART F</span>
            <span class="part-name">Test Yourself</span>
          </div>
          <div class="lesson-part-pill" data-pill-pane="revise">
            <span class="part-letter">PART G</span>
            <span class="part-name">Revise</span>
          </div>
        </div>

        <!-- Pane A: Understand -->
        <div class="step-pane active" id="pane-understand">
          <div style="font-family: var(--font-body); font-size: 20px; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">
            ${topic.understand.headline}
          </div>
          <div style="font-size: 14px; line-height: 1.7; color: var(--ink-black); margin-bottom: 20px;">
            ${this.formatMarkdownText(topic.understand.body)}
          </div>
          <div style="background: var(--card-slate); border: var(--border-thin); border-radius: 6px; padding: 14px;">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); margin-bottom: 6px;">
              KEY CONCEPT HIGHLIGHTS:
            </div>
            <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
              ${topic.understand.keyTakeaways.map(k => `<li>${k}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Pane B: Visualize -->
        <div class="step-pane" id="pane-visualize">
          <div style="font-family: var(--font-body); font-size: 18px; font-weight: 800; margin-bottom: 8px;">
            ${topic.visualize.title}
          </div>
          <p style="font-size: 13px; color: var(--ink-muted); margin-bottom: 16px;">
            ${topic.visualize.description}
          </p>
          <div id="lesson-embedded-visualizer">
            <!-- Render visual diagram depending on topic -->
            ${this.renderTopicDiagram(topic)}
          </div>
        </div>

        <!-- Pane C: Step by Step -->
        <div class="step-pane" id="pane-stepByStep">
          <div style="font-family: var(--font-body); font-size: 18px; font-weight: 800; margin-bottom: 16px;">
            Numbered Execution Stages
          </div>
          <div class="pipeline-stages-track" style="flex-direction: column; gap: 12px;">
            ${topic.stepByStep.map(st => `
              <div class="pipeline-stage-card" style="padding: 16px;">
                <div class="stage-header">
                  <span>STAGE ${st.step}</span>
                  <span class="stage-chip-status">Hardware Cycle</span>
                </div>
                <div class="stage-title">${st.title}</div>
                <div class="stage-desc" style="font-size: 13px;">${st.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pane D: Try It Yourself (Active Hardware Simulator) -->
        <div class="step-pane" id="pane-tryIt">
          <div id="lesson-interactive-sandbox-container"></div>
        </div>

        <!-- Pane E: Worked Example -->
        <div class="step-pane" id="pane-workedExample">
          <div style="background: var(--card-white); border: var(--border-heavy); border-radius: 8px; padding: 22px; box-shadow: var(--shadow-md); position: relative;">
            <div class="rubber-stamp stamp-green" style="position: absolute; top: 16px; right: 16px;">
              ${topic.workedExample.verifiedStamp || 'VERIFIED ✓'}
            </div>
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-cyan); margin-bottom: 6px;">
              UNIVERSITY EXAM WORKED PROBLEM
            </div>
            <div style="font-family: var(--font-body); font-size: 16px; font-weight: 800; margin-bottom: 16px; padding-right: 120px;">
              ${topic.workedExample.problem}
            </div>
            <div class="calc-step-flow">
              ${topic.workedExample.solution.map(s => `
                <div class="calc-formula-line">
                  <span>${s}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Pane F: Test Yourself (Interactive Quiz Check) -->
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

        <!-- Pane G: Revise -->
        <div class="step-pane" id="pane-revise">
          <div style="font-family: var(--font-body); font-size: 18px; font-weight: 800; margin-bottom: 12px;">
            Exam Takeaways & Revision Traps
          </div>
          <div style="background: var(--card-white); border: var(--border-thin); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-sm); margin-bottom: 16px;">
            <div style="font-family: var(--font-mono); font-size: 11px; font-weight: 900; color: var(--pentium-mint-dark); margin-bottom: 8px;">
              MUST-KNOW EXAM POINTS:
            </div>
            <ul style="padding-left: 20px; font-size: 13px; line-height: 1.6;">
              ${topic.revise.examTips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
          <div class="exam-trap-box">
            <div class="trap-header">⚠️ COMMON EXAM TRAP TO AVOID:</div>
            <div>${topic.revise.traps}</div>
          </div>
        </div>

        <!-- Next / Previous Lesson Navigation Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed rgba(120, 113, 108, 0.4); flex-wrap: wrap; gap: 12px;">
          ${this.getPrevTopic(topic.id) ? `
            <button class="tactile-btn btn-sm" data-switch-topic="${this.getPrevTopic(topic.id).id}">
              ← Previous: ${this.getPrevTopic(topic.id).number}
            </button>
          ` : '<div></div>'}
          ${this.getNextTopic(topic.id) ? `
            <button class="tactile-btn btn-primary btn-sm" data-switch-topic="${this.getNextTopic(topic.id).id}">
              Next: ${this.getNextTopic(topic.id).number} →
            </button>
          ` : '<div></div>'}
        </div>
      </div>
    `;

    // Bind subtopic buttons
    container.querySelectorAll('[data-switch-topic]').forEach(b => {
      b.addEventListener('click', () => {
        const targetId = b.getAttribute('data-switch-topic');
        this.navigate(moduleKey, targetId);
      });
    });

    // Bind 7-part pillar tabs
    container.querySelectorAll('[data-pill-pane]').forEach(p => {
      p.addEventListener('click', () => {
        container.querySelectorAll('.lesson-part-pill').forEach(el => el.classList.remove('active'));
        container.querySelectorAll('.step-pane').forEach(el => el.classList.remove('active'));
        p.classList.add('active');
        const paneId = p.getAttribute('data-pill-pane');
        const targetPane = document.getElementById(`pane-${paneId}`);
        if (targetPane) targetPane.classList.add('active');

        // Mount simulator if user clicked "Try It Yourself"
        if (paneId === 'tryIt') {
          this.mountSimulatorForTopic(topic.id, 'lesson-interactive-sandbox-container');
        }

        this.playPopSound(480);
      });
    });

    // Bind bookmark toggle
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
          this.playStampSound();
        }
        this.saveState();
      });
    }

    // Bind mark complete
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
          this.playStampSound();
        }
        this.saveState();
      });
    }

    // Bind lesson quiz
    const quizOpts = container.querySelectorAll('[data-lesson-opt-idx]');
    const explBox = document.getElementById('lesson-quiz-explanation');
    quizOpts.forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = Number(btn.getAttribute('data-lesson-opt-idx'));
        quizOpts.forEach(b => {
          b.disabled = true;
          const idx = Number(b.getAttribute('data-lesson-opt-idx'));
          if (idx === topic.quiz.correctIndex) {
            b.classList.add('correct');
          } else if (idx === chosen) {
            b.classList.add('incorrect');
          }
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

  getPrevTopic(currentId) {
    const keys = Object.keys(CURRICULUM);
    const idx = keys.indexOf(currentId);
    return idx > 0 ? CURRICULUM[keys[idx - 1]] : null;
  }

  getNextTopic(currentId) {
    const keys = Object.keys(CURRICULUM);
    const idx = keys.indexOf(currentId);
    return idx < keys.length - 1 ? CURRICULUM[keys[idx + 1]] : null;
  }

  formatMarkdownText(str) {
    return str
      .replace(/### (.*)/g, '<h4 style="font-family:var(--font-body); font-size:16px; font-weight:800; margin-top:14px; margin-bottom:6px; color:var(--ink-black);">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--pentium-yellow-pale); padding:2px 5px; border-radius:3px; font-family:var(--font-mono); font-size:12px; font-weight:800;">$1</code>')
      .replace(/\n\n/g, '<br/><br/>');
  }

  renderTopicDiagram(topic) {
    if (topic.id === 'm2-intro') {
      return `
        <div style="background: var(--card-white); border: var(--border-thick); border-radius: 8px; padding: 20px; box-shadow: var(--shadow-sm);">
          <div style="font-family: var(--font-mono); font-size: 12px; font-weight: 900; margin-bottom: 12px; color: var(--pentium-cyan);">
            INSTRUCTION ANATOMY: MOV AX, [BX + SI + 04H]
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 120px; background: var(--pentium-cyan-pale); border: 2px solid var(--pentium-cyan); border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 800; color: var(--pentium-cyan);">OPCODE</div>
              <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 900;">MOV</div>
              <div style="font-size: 11px; margin-top: 4px;">Data Transfer Command</div>
            </div>
            <div style="flex: 1; min-width: 140px; background: var(--pentium-yellow-pale); border: 2px solid var(--pentium-brown); border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 800; color: var(--pentium-brown);">DESTINATION</div>
              <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 900;">AX</div>
              <div style="font-size: 11px; margin-top: 4px;">16-bit Accumulator</div>
            </div>
            <div style="flex: 2; min-width: 200px; background: var(--pentium-mint-pale); border: 2px solid var(--pentium-mint-dark); border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-family: var(--font-mono); font-size: 10px; font-weight: 800; color: var(--pentium-mint-dark);">SOURCE MEMORY OPERAND</div>
              <div style="font-family: var(--font-mono); font-size: 18px; font-weight: 900;">[BX + SI + 04H]</div>
              <div style="font-size: 11px; margin-top: 4px;">Effective Address = BX + SI + 04H</div>
            </div>
          </div>
        </div>
      `;
    }
    return `
      <div style="background: var(--card-white); border: var(--border-thin); border-radius: 6px; padding: 16px; font-family: var(--font-mono); font-size: 13px;">
        Visual hardware mapping prepared. Switch to the <strong>Try It Yourself</strong> tab to experiment with the active simulator.
      </div>
    `;
  }

  mountSimulatorForTopic(topicId, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';

    if (topicId.startsWith('m2-datamov') || topicId === 'm2-intro') {
      new RegisterSim(containerId);
    } else if (topicId.startsWith('m2-arith') || topicId.startsWith('m2-logic') || topicId.startsWith('m2-flags')) {
      new AluBitwiseSim(containerId);
    } else if (topicId.startsWith('m3-seg') || topicId.startsWith('m2-arch-compare')) {
      new SegmentationSim(containerId);
    } else if (topicId.startsWith('m3-paging')) {
      new PagingSim(containerId);
    } else if (topicId.startsWith('m3-combined')) {
      new CombinedTranslationSim(containerId);
    } else if (topicId.startsWith('m3-direct') || topicId.startsWith('m3-associative') || topicId.startsWith('m3-set') || topicId.startsWith('m3-replacement') || topicId.startsWith('m3-cache-fundamentals')) {
      new CacheSim(containerId);
    } else if (topicId.startsWith('m3-cache-perf') || topicId.startsWith('m3-memory-hierarchy')) {
      new AmatSim(containerId);
    } else {
      new RegisterSim(containerId);
    }
  }

  // ========================================================================
  // INTERACTIVE LAB BENCHES VIEW
  // ========================================================================

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

      <!-- Bench Switcher Buttons -->
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
        case 'reg': new RegisterSim(c); break;
        case 'alu': new AluBitwiseSim(c); break;
        case 'seg': new SegmentationSim(c); break;
        case 'paging': new PagingSim(c); break;
        case 'combined': new CombinedTranslationSim(c); break;
        case 'cache': new CacheSim(c); break;
        case 'amat': new AmatSim(c); break;
      }
    };

    lab.querySelectorAll('[data-lab-bench]').forEach(b => {
      b.addEventListener('click', () => switchBench(b.getAttribute('data-lab-bench')));
    });

    switchBench('reg');
  }

  // ========================================================================
  // PRACTICE ZONE & EXAM CENTER VIEW
  // ========================================================================

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

      <!-- Mode Selector -->
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

      const questions = QUIZ_BANK.filter(q => {
        if (filter === 'all') return true;
        return q.module === filter;
      });

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

      // Bind buttons
      list.querySelectorAll('[data-pq-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const qId = btn.getAttribute('data-pq-id');
          const chosen = Number(btn.getAttribute('data-pq-idx'));
          const q = QUIZ_BANK.find(item => item.id === qId);

          const card = document.getElementById(`quiz-card-${qId}`);
          if (card) {
            card.querySelectorAll('[data-pq-id]').forEach(b => {
              b.disabled = true;
              const idx = Number(b.getAttribute('data-pq-idx'));
              if (idx === q.correctIndex) {
                b.classList.add('correct');
              } else if (idx === chosen) {
                b.classList.add('incorrect');
              }
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

  // ========================================================================
  // REVISION & CHEAT SHEETS VIEW
  // ========================================================================

  renderCheatSheets() {
    const cs = document.getElementById('view-cheatsheet');
    if (!cs) return;

    cs.innerHTML = `
      <div class="lesson-section-title">
        <div>
          <h2>Revision Cheat Sheets & Reference Cards</h2>
          <div class="lesson-subtitle">Summary tables, instruction sets, addressing formulas, and cache equations</div>
        </div>
      </div>

      <!-- Instruction Quick Reference Table -->
      <div class="paper-card" style="margin-bottom: 24px;">
        <div class="tape-banner tape-cyan tape-pinned">8086 & 80386DX INSTRUCTION SET SUMMARY</div>
        <div class="cache-table-wrapper" style="margin-top: 14px;">
          <table class="cache-table">
            <thead>
              <tr>
                <th>Mnemonic</th>
                <th>Operands</th>
                <th>Description</th>
                <th>Flags Modified</th>
                <th>CPU Mode</th>
              </tr>
            </thead>
            <tbody>
              ${CHEATSHEETS.instructions.map(i => `
                <tr>
                  <td style="font-weight: 900; color: var(--pentium-cyan);">${i.mnemonic}</td>
                  <td>${i.operands}</td>
                  <td>${i.desc}</td>
                  <td>${i.flags}</td>
                  <td>${i.mode}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Addressing Modes Card -->
      <div class="paper-card" style="margin-bottom: 24px;">
        <div class="tape-banner tape-yellow tape-pinned">8086 ADDRESSING MODES CHEAT SHEET</div>
        <div class="cache-table-wrapper" style="margin-top: 14px;">
          <table class="cache-table">
            <thead>
              <tr>
                <th>Addressing Mode</th>
                <th>Example Assembly</th>
                <th>Effective Address (EA) Formula</th>
                <th>Default Segment</th>
              </tr>
            </thead>
            <tbody>
              ${CHEATSHEETS.addressingModes.map(a => `
                <tr>
                  <td style="font-weight: 900;">${a.mode}</td>
                  <td><code>${a.example}</code></td>
                  <td>${a.eaFormula}</td>
                  <td>${a.defaultSeg}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Status & Control Flags Summary Matrix -->
      <div class="paper-card" style="margin-bottom: 24px;">
        <div class="tape-banner tape-coral tape-pinned">16-BIT FLAGS REGISTER MATRIX</div>
        <div class="cache-table-wrapper" style="margin-top: 14px;">
          <table class="cache-table">
            <thead>
              <tr>
                <th>Bit</th>
                <th>Flag</th>
                <th>Name</th>
                <th>Type</th>
                <th>Condition to Set to 1</th>
              </tr>
            </thead>
            <tbody>
              ${CHEATSHEETS.flagsMatrix.map(f => `
                <tr>
                  <td>Bit ${f.bit}</td>
                  <td style="font-weight: 900; color: var(--pentium-coral);">${f.flag}</td>
                  <td>${f.name}</td>
                  <td><span class="tactile-chip ${f.type === 'Status' ? 'chip-cyan' : 'chip-yellow'}">${f.type}</span></td>
                  <td>${f.setWhen}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Memory & Cache Equations -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        <div class="paper-card">
          <div class="tape-banner tape-mint tape-pinned">MEMORY MANAGEMENT FORMULAS</div>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px; font-family: var(--font-mono); font-size: 12px;">
            ${CHEATSHEETS.memoryFormulas.map(m => `
              <div style="background: var(--card-slate); border-left: 3px solid var(--pentium-cyan); padding: 8px 10px; border-radius: 4px;">
                <div style="font-weight: 800; color: var(--ink-black);">${m.name}</div>
                <div style="color: var(--pentium-cyan); margin-top: 2px;">${m.formula}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="paper-card">
          <div class="tape-banner tape-yellow tape-pinned">CACHE MEMORY EQUATIONS</div>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px; font-family: var(--font-mono); font-size: 12px;">
            ${CHEATSHEETS.cacheFormulas.map(c => `
              <div style="background: var(--card-slate); border-left: 3px solid var(--pentium-amber); padding: 8px 10px; border-radius: 4px;">
                <div style="font-weight: 800; color: var(--ink-black);">${c.name}</div>
                <div style="color: var(--pentium-brown); margin-top: 2px;">${c.formula}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // ========================================================================
  // DRAWERS & SEARCH ENGINE
  // ========================================================================

  openDrawer(drawerType) {
    this.closeDrawers();
    if (drawerType === 'glossary') {
      this.renderGlossaryDrawer();
      if (this.glossaryDrawer) this.glossaryDrawer.classList.add('open');
    } else if (drawerType === 'bookmarks') {
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

    content.innerHTML = `
      <input type="text" id="glossary-search-input" placeholder="Search technical terms..." 
             style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-size: 13px; font-weight: 700; border: var(--border-thin); border-radius: 4px; box-shadow: 2px 2px 0 #000; margin-bottom: 14px;" />
      <div id="glossary-list-filtered" style="display: flex; flex-direction: column; gap: 10px;">
        ${GLOSSARY.map(g => `
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
        const query = e.target.value.toLowerCase();
        const filtered = GLOSSARY.filter(g => g.term.toLowerCase().includes(query) || g.definition.toLowerCase().includes(query));
        const list = document.getElementById('glossary-list-filtered');
        if (list) {
          list.innerHTML = filtered.map(g => `
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
          const t = CURRICULUM[id];
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
        const id = el.getAttribute('data-jump-bookmark');
        const mod = el.getAttribute('data-jump-mod');
        this.closeDrawers();
        this.navigate(mod, id);
      });
    });
  }

  handleSearch(query) {
    if (!query || query.trim().length < 2) return;
    const q = query.toLowerCase().trim();

    // Check topics
    const matchingTopics = Object.values(CURRICULUM).filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.subtitle.toLowerCase().includes(q) ||
      t.understand.body.toLowerCase().includes(q)
    );

    if (matchingTopics.length > 0) {
      const top = matchingTopics[0];
      this.navigate(top.module, top.id);
    }
  }
}

// Instantiate on window load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MicroprocessorApp();
});
