import { TRACK_CONFIG, SUBFOLDERS } from "./tracks-config.js";

function toYouTubeEmbedUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace(/^\/+/, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : rawUrl;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${encodeURIComponent(v)}`;
      if (parsed.pathname.startsWith("/embed/")) return rawUrl;
    }
  } catch (_) {}
  if (rawUrl.includes("watch?v=")) return rawUrl.replace("watch?v=", "embed/").split("&")[0];
  if (rawUrl.includes("youtu.be/")) return rawUrl.replace("youtu.be/", "www.youtube.com/embed/").split("?")[0];
  return rawUrl;
}

function getQuestionCount(questions) {
  try {
    if (typeof questions === "string") {
      const p = JSON.parse(questions);
      return Array.isArray(p) ? p.length : (Array.isArray(p?.questions) ? p.questions.length : 0);
    }
    if (Array.isArray(questions)) return questions.length;
    if (questions && Array.isArray(questions.questions)) return questions.questions.length;
  } catch (_) {}
  return 0;
}

export class KalamnesanNav {
  constructor({ containerId, onStartExam, supabaseClient }) {
    this.container = document.getElementById(containerId);
    this.onStartExam = typeof onStartExam === "function" ? onStartExam : () => {};
    this.supabase = supabaseClient;
    this.state = {
      track: null,
      stream: null,
      medium: null,
      subject: null,
      subfolder: null
    };
  }

  async init() {
    if (!this.container) return;
    this.renderHomePage();
    await this.loadDemoExams();
  }

  renderHomePage() {
    if (!this.container) return;
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
      card.addEventListener("click", () => this.selectTrack(card.dataset.track));
    });
  }

  async loadDemoExams() {
    const demoGrid = document.getElementById("knDemoGrid");
    if (!demoGrid) return;

    if (!this.supabase) {
      demoGrid.innerHTML = `<div class="kn-empty">தற்போது மாதிரித் தேர்வுகள் இல்லை.</div>`;
      return;
    }

    try {
      if (typeof this.supabase.rpc === "function") {
        const { data, error } = await this.supabase.rpc("get_demo_exams");
        if (!error && Array.isArray(data) && data.length > 0) {
          this.renderDemoCards(demoGrid, data);
          return;
        }
      }

      if (this.supabase.from) {
        const { data: rows } = await this.supabase
          .from("exams")
          .select("id, title, exam_title, duration_minutes, pre_test_video_url, questions")
          .eq("is_demo", true);
        if (Array.isArray(rows) && rows.length > 0) {
          const mapped = rows.map((r) => ({
            ...r,
            question_count: getQuestionCount(r.questions)
          }));
          this.renderDemoCards(demoGrid, mapped);
          return;
        }
      }

      demoGrid.innerHTML = `<div class="kn-empty">தற்போது மாதிரித் தேர்வுகள் இல்லை.</div>`;
    } catch (_) {
      demoGrid.innerHTML = `<div class="kn-empty">மாதிரித் தேர்வுகளை ஏற்ற முடியவில்லை.</div>`;
    }
  }

  renderDemoCards(demoGrid, list) {
    demoGrid.innerHTML = list.map((exam) => `
      <div class="kn-demo-card">
        <div class="kn-badge">Demo</div>
        <h4>${exam.title || exam.exam_title || "Demo Test"}</h4>
        <p>Questions: ${exam.question_count ?? 0} | Duration: ${exam.duration_minutes ?? 15} mins</p>
        <div class="kn-demo-actions">
          ${exam.pre_test_video_url ? `
            <button type="button" class="kn-btn-video" data-video="${encodeURIComponent(exam.pre_test_video_url)}">▶ Video</button>
          ` : ""}
          <button type="button" class="kn-btn-start-demo" data-exam-id="${encodeURIComponent(exam.id)}">Take Demo</button>
        </div>
      </div>
    `).join("");

    demoGrid.querySelectorAll(".kn-btn-video").forEach((b) => {
      b.addEventListener("click", () => this.showVideoModal(decodeURIComponent(b.dataset.video || "")));
    });
    demoGrid.querySelectorAll(".kn-btn-start-demo").forEach((b) => {
      b.addEventListener("click", () => this.onStartExam(decodeURIComponent(b.dataset.examId || ""), { isDemo: true }));
    });
  }

  selectTrack(trackId) {
    const cfg = TRACK_CONFIG[trackId];
    if (!cfg) return;

    this.state.track = trackId;
    this.state.stream = null;
    this.state.medium = null;
    this.state.subject = null;
    this.state.subfolder = null;

    if (Array.isArray(cfg.streams) && cfg.streams.length > 1) {
      this.renderStreamPicker(cfg);
    } else if (Array.isArray(cfg.streams) && cfg.streams.length === 1) {
      this.selectStream(cfg.streams[0].id);
    } else if (cfg.allowed_mediums.length === 1 && cfg.allowed_mediums[0] === "en") {
      this.state.medium = "en";
      this.renderSubjects();
    } else {
      this.renderMediumPicker(["ta", "en"]);
    }
  }

  renderStreamPicker(cfg) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackTrack">← Back</button>
        <h3>பாடத்திட்டம் / பிரிவைத் தேர்ந்தெடுக்கவும் (Select Board / Stream)</h3>
        <div class="kn-track-grid">
          ${cfg.streams.map((st) => `
            <div class="kn-track-card" data-stream="${st.id}">
              <h4>${st.label_en}</h4>
              <span>${st.label_ta}</span>
              <span class="kn-track-arrow">➔</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    document.getElementById("knBackTrack").onclick = () => {
      this.renderHomePage();
      this.loadDemoExams();
    };
    this.container.querySelectorAll(".kn-track-card").forEach((c) => {
      c.addEventListener("click", () => this.selectStream(c.dataset.stream));
    });
  }

  selectStream(streamId) {
    const cfg = TRACK_CONFIG[this.state.track];
    if (!cfg) return;
    this.state.stream = streamId;

    const streamObj = (cfg.streams || []).find((s) => s.id === streamId);
    const allowed = (streamObj && Array.isArray(streamObj.mediums))
      ? streamObj.mediums
      : cfg.allowed_mediums;

    if (allowed.length === 1 && allowed[0] === "en") {
      this.state.medium = "en";
      this.renderSubjects();
    } else {
      this.renderMediumPicker(allowed);
    }
  }

  renderMediumPicker(allowedMediums = ["ta", "en"]) {
    if (!this.container) return;
    const allowTa = allowedMediums.includes("ta");
    const allowEn = allowedMediums.includes("en");

    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackMedParent">← Back</button>
        <h3>தேர்வு மொழியைத் தேர்ந்தெடுக்கவும் (Select Medium)</h3>
        <div class="kn-medium-grid">
          ${allowTa ? `<div class="kn-med-card" data-med="ta"><h4>தமிழ் வழி (Tamil Medium)</h4></div>` : ""}
          ${allowEn ? `<div class="kn-med-card" data-med="en"><h4>English Medium</h4></div>` : ""}
        </div>
      </div>
    `;
    document.getElementById("knBackMedParent").onclick = () => {
      const cfg = TRACK_CONFIG[this.state.track];
      if (cfg && Array.isArray(cfg.streams) && cfg.streams.length > 1) {
        this.renderStreamPicker(cfg);
      } else {
        this.renderHomePage();
        this.loadDemoExams();
      }
    };
    this.container.querySelectorAll(".kn-med-card").forEach((c) => {
      c.addEventListener("click", () => {
        this.state.medium = c.dataset.med;
        this.renderSubjects();
      });
    });
  }

  renderSubjects() {
    if (!this.container) return;
    const cfg = TRACK_CONFIG[this.state.track];
    if (!cfg) return;

    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackSubParent">← Back</button>
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
    document.getElementById("knBackSubParent").onclick = () => {
      const streamObj = (cfg.streams || []).find((s) => s.id === this.state.stream);
      const allowed = (streamObj && Array.isArray(streamObj.mediums)) ? streamObj.mediums : cfg.allowed_mediums;
      if (allowed.length === 1 && allowed[0] === "en") {
        if (Array.isArray(cfg.streams) && cfg.streams.length > 1) {
          this.renderStreamPicker(cfg);
        } else {
          this.renderHomePage();
          this.loadDemoExams();
        }
      } else {
        this.renderMediumPicker(allowed);
      }
    };
    this.container.querySelectorAll(".kn-subject-card").forEach((c) => {
      c.addEventListener("click", () => {
        this.state.subject = c.dataset.sub;
        this.renderSubfolders();
      });
    });
  }

  renderSubfolders() {
    if (!this.container) return;
    this.state.subfolder = null;
    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackFolderParent">← Back</button>
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
    document.getElementById("knBackFolderParent").onclick = () => this.renderSubjects();
    this.container.querySelectorAll(".kn-subfolder-card").forEach((c) => {
      c.addEventListener("click", () => {
        this.state.subfolder = c.dataset.folder;
        this.loadTestList();
      });
    });
  }

  matchesSelectedSubject(examRow) {
    const subKey = String(this.state.subject || "").toLowerCase();
    if (!subKey) return true;
    const titleUpper = String(examRow.exam_title || examRow.title || "").toUpperCase();
    const isChe = titleUpper.includes("(CHE)") || titleUpper.includes("CHEM");
    const isBio = titleUpper.includes("(BIO)") || titleUpper.includes("BIO");
    if (subKey.includes("chem")) return isChe;
    if (subKey.includes("bio")) return isBio;
    if (subKey.includes("phy") || subKey.includes("sci")) return !isChe && !isBio;
    return true;
  }

  async fetchLegacyMatchingExams() {
    if (!this.supabase || !this.supabase.from) return [];
    try {
      const { data, error } = await this.supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !Array.isArray(data)) return [];

      const gradeNum = this.state.track === "10th" ? 10 : this.state.track === "11th" ? 11 : this.state.track === "12th" ? 12 : null;
      const medUpper = this.state.medium === "en" ? "ENGLISH" : "TAMIL";
      const subfolderKey = this.state.subfolder || "unit_wise";

      return data
        .filter((e) => e.is_published !== false)
        .filter((e) => {
          if (gradeNum && parseInt(e.grade) !== gradeNum) return false;
          const rowMed = String(e.medium || "TAMIL").toUpperCase();
          if (rowMed !== medUpper && rowMed !== "ALL" && rowMed !== "BOTH") return false;

          const rowType = String(e.exam_type || "BOARD").toUpperCase();
          if (this.state.stream === "tn_board" && !rowType.includes("BOARD") && !rowType.includes("STATE")) return false;
          if (this.state.stream === "neet" && !rowType.includes("NEET")) return false;
          if (this.state.stream === "jee" && !rowType.includes("JEE")) return false;

          if (!this.matchesSelectedSubject(e)) return false;

          const rawSub = String(e.sub_category || e.chapter_name || "").toUpperCase();
          const titleText = String(e.exam_title || e.title || "").toUpperCase();

          if (subfolderKey === "pyq") {
            return rawSub.includes("PYQ") || titleText.includes("PYQ");
          }
          if (subfolderKey === "created") {
            return rawSub.includes("CREAT") || rawSub.includes("INTERNAL") || titleText.includes("CREAT") || titleText.includes("உள்");
          }
          if (subfolderKey === "revision") {
            return rawSub.includes("COMBO") || rawSub.includes("MODEL") || titleText.includes("COMBO") || titleText.includes("மாதிரி");
          }
          return !rawSub.includes("PYQ") && !rawSub.includes("CREAT") && !rawSub.includes("COMBO") && !rawSub.includes("MODEL");
        })
        .map((r) => ({
          ...r,
          question_count: r.question_count ?? getQuestionCount(r.questions)
        }));
    } catch (_) {
      return [];
    }
  }

  async loadTestList() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="kn-nav-wrapper">
        <button type="button" class="kn-back-btn" id="knBackTestList">← Back</button>
        <h3>தேர்வுகள் பட்டியல் (Available Tests)</h3>
        <div id="knTestListContainer" class="kn-test-grid">
          <div class="kn-loading">தேர்வுகள் ஏற்றப்படுகின்றன...</div>
        </div>
      </div>
    `;
    document.getElementById("knBackTestList").onclick = () => this.renderSubfolders();

    const container = document.getElementById("knTestListContainer");
    if (!container) return;

    let examsToRender = [];

    try {
      if (this.supabase && typeof this.supabase.rpc === "function") {
        const { data, error } = await this.supabase.rpc("get_exams_by_folder", {
          p_track: this.state.track,
          p_subject: this.state.subject,
          p_subfolder: this.state.subfolder,
          p_medium: this.state.medium
        });
        if (!error && Array.isArray(data) && data.length > 0) {
          examsToRender = data;
        }
      }
    } catch (_) {}

    if (examsToRender.length === 0) {
      examsToRender = await this.fetchLegacyMatchingExams();
    }

    if (examsToRender.length === 0) {
      container.innerHTML = `<div class="kn-empty">இப்பிரிவில் தற்போது தேர்வுகள் எதுவும் பதிவேற்றப்படவில்லை.</div>`;
      return;
    }

    container.innerHTML = examsToRender.map((exam) => `
      <div class="kn-test-card">
        <h4>${exam.title || exam.exam_title || "Physics Test"}</h4>
        <p>வினாக்கள்: ${exam.question_count ?? getQuestionCount(exam.questions)} | நேரம்: ${exam.duration_minutes ?? 15} நிமிடம்</p>
        <div class="kn-test-actions">
          ${exam.pre_test_video_url ? `
            <button type="button" class="kn-btn-video" data-video="${encodeURIComponent(exam.pre_test_video_url)}">▶ முன் தயாரிப்பு வீடியோ</button>
          ` : ""}
          <button type="button" class="kn-btn-start" data-exam-id="${encodeURIComponent(exam.id)}">Start Exam</button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".kn-btn-video").forEach((b) => {
      b.addEventListener("click", () => this.showVideoModal(decodeURIComponent(b.dataset.video || "")));
    });
    container.querySelectorAll(".kn-btn-start").forEach((b) => {
      b.addEventListener("click", () => this.onStartExam(decodeURIComponent(b.dataset.examId || ""), { isDemo: false }));
    });
  }

  showVideoModal(url) {
    const embedUrl = toYouTubeEmbedUrl(url);
    if (!embedUrl) return;

    const modal = document.createElement("div");
    modal.className = "kn-modal-overlay";
    modal.innerHTML = `
      <div class="kn-modal-box">
        <div class="kn-modal-header">
          <h4>Pre-Test Concept Video</h4>
          <button type="button" class="kn-modal-close">✖</button>
        </div>
        <div class="kn-modal-body">
          <iframe width="100%" height="315" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    `;
    modal.querySelector(".kn-modal-close").onclick = () => modal.remove();
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
  }
}
