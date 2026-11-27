import { TRACK_CONFIG, SUBFOLDERS } from "./tracks-config.js";

export class KalamnesanNav {
  constructor({ containerId, onStartExam, supabaseClient }) {
    this.container = document.getElementById(containerId);
    this.onStartExam = onStartExam;
    this.supabase = supabaseClient;
    this.state = {
      track: null,
      medium: null,
      subject: null,
      subfolder: null
    };
  }

  async init() {
    this.renderHomePage();
    await this.loadDemoExams();
  }

  renderHomePage() {
    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <section class="kn-demo-section" id="knDemoSection">
          <div class="kn-section-header">
            <h3>🎯 Free Demo Tests (மாதிரித் தேர்வுகள்)</h3>
            <p>கட்டணமின்றி மாதிரித் தேர்வுகளை எழுதிப் பாருங்கள்</p>
          </div>
          <div class="kn-demo-grid" id="knDemoGrid">
            <div class="kn-loading">மாதிரித் தேர்வுகள் ஏற்றப்படுகின்றன...</div>
          </div>
        </section>

        <section class="kn-tracks-section">
          <div class="kn-section-header">
            <h3>📚 வகுப்புகள் & தேர்வுகள் (Choose Category)</h3>
          </div>
          <div class="kn-track-grid">
            ${Object.entries(TRACK_CONFIG).map(([key, item]) => `
              <div class="kn-track-card" data-track="${key}">
                <h4>${item.label_en}</h4>
                <span>${item.label_ta}</span>
                <span class="kn-track-arrow">➔</span>
              </div>
            `).join("")}
          </div>
        </section>
      </div>
    `;

    this.container.querySelectorAll(".kn-track-card").forEach((card) => {
      card.addEventListener("click", () => {
        this.selectTrack(card.dataset.track);
      });
    });
  }

  async loadDemoExams() {
    const demoGrid = document.getElementById("knDemoGrid");
    try {
      const { data, error } = await this.supabase.rpc("get_demo_exams");
      if (error || !data || data.length === 0) {
        demoGrid.innerHTML = `<div class="kn-empty">தற்போது மாதிரித் தேர்வுகள் இல்லை.</div>`;
        return;
      }

      demoGrid.innerHTML = data.map((exam) => `
        <div class="kn-demo-card">
          <div class="kn-badge">Demo</div>
          <h4>${exam.title || exam.exam_title}</h4>
          <p>Questions: ${exam.question_count} | Duration: ${exam.duration_minutes} mins</p>
          <div class="kn-demo-actions">
            ${exam.pre_test_video_url ? `
              <button type="button" class="kn-btn-video" data-video="${exam.pre_test_video_url}">▶ Video</button>
            ` : ""}
            <button type="button" class="kn-btn-start-demo" data-exam-id="${exam.id}">Take Demo</button>
          </div>
        </div>
      `).join("");

      demoGrid.querySelectorAll(".kn-btn-video").forEach((b) => {
        b.addEventListener("click", () => this.showVideoModal(b.dataset.video));
      });
      demoGrid.querySelectorAll(".kn-btn-start-demo").forEach((b) => {
        b.addEventListener("click", () => this.onStartExam(b.dataset.examId, { isDemo: true }));
      });
    } catch (e) {
      demoGrid.innerHTML = `<div class="kn-empty">மாதிரித் தேர்வுகளை ஏற்ற முடியவில்லை.</div>`;
    }
  }

  selectTrack(trackId) {
    this.state.track = trackId;
    const cfg = TRACK_CONFIG[trackId];

    if (cfg.allowed_mediums.length === 1 && cfg.allowed_mediums[0] === "en") {
      this.state.medium = "en";
      this.renderSubjects();
    } else {
      this.renderMediumPicker(cfg);
    }
  }

  renderMediumPicker(cfg) {
    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackTrack">← Back</button>
        <h3>தேர்வு மொழியைத் தேர்ந்தெடுக்கவும் (Select Medium)</h3>
        <div class="kn-medium-grid">
          <div class="kn-med-card" data-med="ta">
            <h4>தமிழ் வழி (Tamil Medium)</h4>
          </div>
          <div class="kn-med-card" data-med="en">
            <h4>English Medium</h4>
          </div>
        </div>
      </div>
    `;
    document.getElementById("knBackTrack").onclick = () => this.renderHomePage();
    this.container.querySelectorAll(".kn-med-card").forEach((c) => {
      c.addEventListener("click", () => {
        this.state.medium = c.dataset.med;
        this.renderSubjects();
      });
    });
  }

  renderSubjects() {
    const cfg = TRACK_CONFIG[this.state.track];
    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackMed">← Back</button>
        <h3>பாடத்தைத் தேர்ந்தெடுக்கவும் (Choose Subject)</h3>
        <div class="kn-track-grid">
          ${cfg.subjects.map((s) => `
            <div class="kn-subject-card" data-sub="${s.id}">
              <h4>${this.state.medium === "ta" ? s.label_ta : s.label_en}</h4>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    document.getElementById("knBackMed").onclick = () => this.selectTrack(this.state.track);
    this.container.querySelectorAll(".kn-subject-card").forEach((c) => {
      c.addEventListener("click", () => {
        this.state.subject = c.dataset.sub;
        this.renderSubfolders();
      });
    });
  }

  renderSubfolders() {
    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackSub">← Back</button>
        <h3>பிரிவைத் தேர்ந்தெடுக்கவும் (Select Test Folder)</h3>
        <div class="kn-folder-grid">
          ${SUBFOLDERS.map((f) => `
            <div class="kn-subfolder-card" data-folder="${f.id}">
              <span class="kn-f-icon">${f.icon}</span>
              <h4>${this.state.medium === "ta" ? f.label_ta : f.label_en}</h4>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    document.getElementById("knBackSub").onclick = () => this.renderSubjects();
    this.container.querySelectorAll(".kn-subfolder-card").forEach((c) => {
      c.addEventListener("click", () => {
        this.state.subfolder = c.dataset.folder;
        this.loadTestList();
      });
    });
  }

  async loadTestList() {
    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackFolder">← Back</button>
        <h3>தேர்வுகள் பட்டியல் (Available Tests)</h3>
        <div id="knTestListContainer" class="kn-test-grid">
          <div class="kn-loading">தேர்வுகள் ஏற்றப்படுகின்றன...</div>
        </div>
      </div>
    `;
    document.getElementById("knBackFolder").onclick = () => this.renderSubfolders();

    const container = document.getElementById("knTestListContainer");
    const { data, error } = await this.supabase.rpc("get_exams_by_folder", {
      p_track: this.state.track,
      p_subject: this.state.subject,
      p_subfolder: this.state.subfolder,
      p_medium: this.state.medium
    });

    if (error || !data || data.length === 0) {
      container.innerHTML = `<div class="kn-empty">இப்பிரிவில் தற்போது தேர்வுகள் எதுவும் பதிவேற்றப்படவில்லை.</div>`;
      return;
    }

    container.innerHTML = data.map((exam) => `
      <div class="kn-test-card">
        <h4>${exam.title || exam.exam_title}</h4>
        <p>வினாக்கள்: ${exam.question_count} | நேரம்: ${exam.duration_minutes} நிமிடம்</p>
        <div class="kn-test-actions">
          ${exam.pre_test_video_url ? `
            <button type="button" class="kn-btn-video" data-video="${exam.pre_test_video_url}">▶ முன் தயாரிப்பு வீடியோ</button>
          ` : ""}
          <button type="button" class="kn-btn-start" data-exam-id="${exam.id}">Start Exam</button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".kn-btn-video").forEach((b) => {
      b.addEventListener("click", () => this.showVideoModal(b.dataset.video));
    });
    container.querySelectorAll(".kn-btn-start").forEach((b) => {
      b.addEventListener("click", () => this.onStartExam(b.dataset.examId, { isDemo: false }));
    });
  }

  showVideoModal(url) {
    let embedUrl = url;
    if (url.includes("watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      embedUrl = url.replace("youtu.be/", "www.youtube.com/embed/");
    }

    const modal = document.createElement("div");
    modal.className = "kn-modal-overlay";
    modal.innerHTML = `
      <div class="kn-modal-box">
        <div class="kn-modal-header">
          <h4>Pre-Test Concept Video</h4>
          <button type="button" class="kn-modal-close">✖</button>
        </div>
        <div class="kn-modal-body">
          <iframe width="100%" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    `;
    modal.querySelector(".kn-modal-close").onclick = () => modal.remove();
    document.body.appendChild(modal);
  }
}
