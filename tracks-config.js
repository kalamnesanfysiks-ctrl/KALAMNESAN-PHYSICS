export const TRACK_CONFIG = {
  "10th": {
    label_en: "10th Standard",
    label_ta: "10-ஆம் வகுப்பு",
    allowed_mediums: ["ta", "en"],
    default_medium: "ta",
    streams: [
      { id: "tn_board", label_en: "State Board TN", label_ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம்", mediums: ["ta", "en"] },
      { id: "neet_bridge", label_en: "NEET Foundation / Bridge", label_ta: "நீட் அடிப்படைப் பயிற்சி", mediums: ["ta", "en"] },
      { id: "jee_bridge", label_en: "JEE Foundation / Bridge", label_ta: "ஜே.இ.இ அடிப்படைப் பயிற்சி", mediums: ["ta", "en"] },
      { id: "ncert", label_en: "NCERT (English Only)", label_ta: "NCERT (ஆங்கில வழி மட்டும்)", mediums: ["en"] },
      { id: "icse", label_en: "ICSE (English Only)", label_ta: "ICSE (ஆங்கில வழி மட்டும்)", mediums: ["en"] }
    ],
    subjects: [
      { id: "physics", label_en: "Physics", label_ta: "இயற்பியல்" },
      { id: "chemistry", label_en: "Chemistry", label_ta: "வேதியியல்" },
      { id: "biology", label_en: "Biology", label_ta: "உயிரியல்" },
      { id: "maths", label_en: "Mathematics", label_ta: "கணிதம்" }
    ]
  },
  "11th": {
    label_en: "11th Standard",
    label_ta: "11-ஆம் வகுப்பு",
    allowed_mediums: ["ta", "en"],
    default_medium: "ta",
    streams: [
      { id: "tn_board", label_en: "State Board TN", label_ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம்", mediums: ["ta", "en"] },
      { id: "neet", label_en: "NEET", label_ta: "நீட் (NEET)", mediums: ["ta", "en"] },
      { id: "jee", label_en: "JEE", label_ta: "ஜே.இ.இ (JEE)", mediums: ["ta", "en"] },
      { id: "ncert", label_en: "NCERT (English Only)", label_ta: "NCERT (ஆங்கில வழி மட்டும்)", mediums: ["en"] },
      { id: "icse", label_en: "ICSE (English Only)", label_ta: "ICSE (ஆங்கில வழி மட்டும்)", mediums: ["en"] }
    ],
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
    streams: [
      { id: "tn_board", label_en: "State Board TN", label_ta: "தமிழ்நாடு மாநிலப் பாடத்திட்டம்", mediums: ["ta", "en"] },
      { id: "neet", label_en: "NEET", label_ta: "நீட் (NEET)", mediums: ["ta", "en"] },
      { id: "jee", label_en: "JEE", label_ta: "ஜே.இ.இ (JEE)", mediums: ["ta", "en"] },
      { id: "ncert", label_en: "NCERT (English Only)", label_ta: "NCERT (ஆங்கில வழி மட்டும்)", mediums: ["en"] },
      { id: "icse", label_en: "ICSE (English Only)", label_ta: "ICSE (ஆங்கில வழி மட்டும்)", mediums: ["en"] }
    ],
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
    streams: [
      { id: "ug_trb_stream", label_en: "UG TRB (English Only)", label_ta: "UG TRB (ஆங்கில வழி மட்டும்)", mediums: ["en"] }
    ],
    subjects: [
      { id: "physics", label_en: "Physics", label_ta: "இயற்பியல்" }
    ]
  },
  "pg_trb": {
    label_en: "PG TRB Physics",
    label_ta: "PG TRB இயற்பியல்",
    allowed_mediums: ["en"],
    default_medium: "en",
    streams: [
      { id: "pg_trb_stream", label_en: "PG TRB (English Only)", label_ta: "PG TRB (ஆங்கில வழி மட்டும்)", mediums: ["en"] }
    ],
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
