export const TRACK_CONFIG = {
  "10th": {
    label_en: "10th Standard",
    label_ta: "10-ஆம் வகுப்பு",
    allowed_mediums: ["ta", "en"],
    default_medium: "ta",
    boards: ["State Board", "NCERT"],
    subjects: [
      { id: "science", label_en: "Science", label_ta: "அறிவியல்" },
      { id: "maths", label_en: "Mathematics", label_ta: "கணிதம்" }
    ]
  },
  "11th": {
    label_en: "11th Standard",
    label_ta: "11-ஆம் வகுப்பு",
    allowed_mediums: ["ta", "en"],
    default_medium: "ta",
    boards: ["State Board", "NEET", "JEE", "NCERT"],
    subjects: [
      { id: "physics", label_en: "Physics", label_ta: "இயற்பியல்" },
      { id: "chemistry", label_en: "Chemistry", label_ta: "வேதியியல்" },
      { id: "biology", label_en: "Biology", label_ta: "உயிரியல்" },
      { id: "maths", label_en: "Mathematics", label_ta: "கணிதம்" }
    ]
  },
  "12th": {
    label_en: "12th Standard",
    label_ta: "12-ஆம் வகுப்பு",
    allowed_mediums: ["ta", "en"],
    default_medium: "ta",
    boards: ["State Board", "NEET", "JEE", "NCERT"],
    subjects: [
      { id: "physics", label_en: "Physics", label_ta: "இயற்பியல்" },
      { id: "chemistry", label_en: "Chemistry", label_ta: "வேதியியல்" },
      { id: "biology", label_en: "Biology", label_ta: "உயிரியல்" },
      { id: "maths", label_en: "Mathematics", label_ta: "கணிதம்" }
    ]
  },
  "ug_trb": {
    label_en: "UG TRB Physics",
    label_ta: "UG TRB இயற்பியல்",
    allowed_mediums: ["en"],
    default_medium: "en",
    boards: ["TRB"],
    subjects: [
      { id: "physics", label_en: "Physics", label_ta: "இயற்பியல்" }
    ]
  },
  "pg_trb": {
    label_en: "PG TRB Physics",
    label_ta: "PG TRB இயற்பியல்",
    allowed_mediums: ["en"],
    default_medium: "en",
    boards: ["TRB"],
    subjects: [
      { id: "physics", label_en: "Physics", label_ta: "இயற்பியல்" }
    ]
  }
};

export const SUBFOLDERS = [
  { id: "unit_wise", label_en: "Unit-wise Tests", label_ta: "அலகு வாரியான தேர்வுகள்", icon: "📚" },
  { id: "pyq", label_en: "Previous Year Questions (PYQ)", label_ta: "முந்தைய ஆண்டு வினாக்கள்", icon: "🏛️" },
  { id: "created", label_en: "Kalamnesan Master Created", label_ta: "பிரத்யேகமாக உருவாக்கப்பட்டவை", icon: "✨" },
  { id: "revision", label_en: "Quick Revision Tests", label_ta: "திருப்புதல் தேர்வுகள்", icon: "⚡" }
];
