// Minimal UI-label dictionary (static labels only — competition data always comes from the backend).
// Covers the main section chrome; amounts, names, dates and states stay exactly as served.
const STR = {
  back: { en: "Go back", hi: "वापस जाएं" },
  loading: { en: "Loading competition…", hi: "प्रतियोगिता लोड हो रही है…" },
  importantDates: { en: "Important Dates", hi: "महत्वपूर्ण तिथियाँ" },
  previousWinners: { en: "Previous Winners", hi: "पिछले विजेता" },
  rewards: { en: "Rewards", hi: "पुरस्कार" },
  about: { en: "About Competition", hi: "प्रतियोगिता परिचय" },
  judging: { en: "Judging Parameters", hi: "निर्णय मानदंड" },
  rules: { en: "Rules & Eligibility", hi: "नियम व पात्रता" },
  referTitle: { en: "Refer & Earn more discount", hi: "रेफ़र करें और छूट पाएं" },
  hearTitle: { en: "Hear From Our Users", hi: "हमारे उपयोगकर्ताओं की राय" },
  hearSub: { en: "See what participants say about Feedants", hi: "देखें प्रतिभागी फ़ीडेंट्स के बारे में क्या कहते हैं" },
};

export function makeT(lang) {
  const k = lang === "हिंदी" ? "hi" : "en";
  return (key) => (STR[key] && STR[key][k]) || key;
}
