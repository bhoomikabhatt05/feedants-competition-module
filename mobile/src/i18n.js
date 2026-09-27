import AsyncStorage from "@react-native-async-storage/async-storage";

// Central UI-label dictionary (static labels only — competition data always
// comes from the backend and is never translated). t(key, vars) with {n}/{a}/{b}.
const STR = {
  back: { en: "Go back", hi: "वापस जाएं" },
  loading: { en: "Loading competition…", hi: "प्रतियोगिता लोड हो रही है…" },
  retry: { en: "Retry", hi: "पुनः प्रयास करें" },
  close: { en: "Close", hi: "बंद करें" },
  // Nav
  home: { en: "Home", hi: "होम" },
  explore: { en: "Explore", hi: "एक्सप्लोर" },
  join: { en: "Join", hi: "जुड़ें" },
  competitions: { en: "Competitions", hi: "प्रतियोगिताएं" },
  profile: { en: "Profile", hi: "प्रोफ़ाइल" },
  // Details header
  prizePool: { en: "Prize Pool", hi: "पुरस्कार राशि" },
  entryFee: { en: "Entry Fee", hi: "प्रवेश शुल्क" },
  spotsLeft: { en: "Only {n} spots left", hi: "केवल {n} स्थान बचे" },
  booked: { en: "{a} / {b} Booked", hi: "{a} / {b} बुक" },
  judge: { en: "Judge", hi: "निर्णायक" },
  demoPhoto: { en: "Demo photo", hi: "डेमो फ़ोटो" },
  mediaUnavailable: { en: "Media unavailable", hi: "मीडिया उपलब्ध नहीं" },  introVideo: { en: "Intro Video", hi: "परिचय वीडियो" },
  regClosesIn: { en: "Registration closes in", hi: "रजिस्ट्रेशन बंद होने में" },
  hurry: { en: "Hurry up!", hi: "जल्दी करें!" },
  importantDates: { en: "Important Dates", hi: "महत्वपूर्ण तिथियाँ" },
  registerBefore: { en: "Register Before", hi: "रजिस्टर करें" },
  submissionStarts: { en: "Submission Starts", hi: "सबमिशन शुरू" },
  submissionEnds: { en: "Submission Ends", hi: "सबमिशन समाप्त" },
  resultDate: { en: "Result Date", hi: "परिणाम तिथि" },
  previousWinners: { en: "Previous Winners", hi: "पिछले विजेता" },
  winnersSoon: { en: "Winners will be announced after results.", hi: "परिणाम के बाद विजेताओं की घोषणा होगी।" },
  about: { en: "About Competition", hi: "प्रतियोगिता परिचय" },
  judging: { en: "Judging Parameters", hi: "निर्णय मानदंड" },
  rules: { en: "Rules & Eligibility", hi: "नियम व पात्रता" },
  viewMore: { en: "View more ▼", hi: "और देखें ▼" },
  viewLess: { en: "View less ▲", hi: "कम देखें ▲" },
  rewards: { en: "Rewards", hi: "पुरस्कार" },
  allPositions: { en: "(All Positions)", hi: "(सभी स्थान)" },
  disclaimer: { en: "Only contributions from paid participants will be considered for judging.", hi: "निर्णय में केवल भुगतान किए गए प्रतिभागियों की प्रविष्टियों पर विचार होगा।" },
  prizeTitle: { en: "How will you receive prize money?", hi: "पुरस्कार राशि कैसे मिलेगी?" },
  prizeSub: { en: "Watch video to know more", hi: "जानने के लिए वीडियो देखें" },
  refundTitle: { en: "Refund policy", hi: "रिफंड नीति" },
  secureBy: { en: "Secure payments powered by", hi: "सुरक्षित भुगतान द्वारा संचालित" },
  referTitle: { en: "Refer & Earn more discount", hi: "रेफ़र करें और छूट पाएं" },
  copyLink: { en: "Copy Link", hi: "लिंक कॉपी करें" },
  copied: { en: "Copied!", hi: "कॉपी हो गया!" },
  copyFail: { en: "Copy failed — long-press the link to copy manually.", hi: "कॉपी विफल — मैन्युअल कॉपी के लिए लिंक दबाकर रखें।" },
  share: { en: "Share", hi: "शेयर करें" },
  referNow: { en: "Refer Now", hi: "अभी रेफ़र करें" },
  hearTitle: { en: "Hear From Our Users", hi: "हमारे उपयोगकर्ताओं की राय" },
  hearSub: { en: "See what participants say about Feedants", hi: "देखें प्रतिभागी फ़ीडेंट्स के बारे में क्या कहते हैं" },
  adTitle: { en: "Advertisement", hi: "विज्ञापन" },
  adSub: { en: "Demo Ad Placement — reserved for sponsors", hi: "डेमो विज्ञापन स्थान — प्रायोजकों हेतु आरक्षित" },
  // Submission
  yourSubmission: { en: "Your Submission", hi: "आपका सबमिशन" },
  subOpensWith: { en: "(opens with submission window)", hi: "(सबमिशन विंडो के साथ खुलेगा)" },
  subPlaceholder: { en: "https://…/performance.mp4", hi: "https://…/performance.mp4" },
  subNeedUrl: { en: "Paste your performance video URL first (mp4/mov/webm).", hi: "पहले अपने प्रदर्शन वीडियो का URL डालें (mp4/mov/webm)।" },
  subInvalid: { en: "Enter a valid http(s) video URL (mp4/mov/webm).", hi: "मान्य http(s) वीडियो URL डालें (mp4/mov/webm)।" },
  subUploading: { en: "Uploading…", hi: "अपलोड हो रहा है…" },
  subUpload: { en: "Upload (demo URL recorded by backend)", hi: "अपलोड करें (बैकएंड डेमो URL दर्ज करेगा)" },
  subUpdate: { en: "Update Submission (demo URL)", hi: "सबमिशन अपडेट करें (डेमो URL)" },
  subAutoNote: { en: "Upload enables automatically when the backend submission window opens.", hi: "बैकएंड सबमिशन विंडो खुलते ही अपलोड सक्षम होगा।" },
  subRetry: { en: "— you can retry.", hi: "— पुनः प्रयास कर सकते हैं।" },
  subDone: { en: "Submitted", hi: "जमा हो गया" },
  // CTA / states
  registerNow: { en: "Register Now", hi: "अभी रजिस्टर करें" },
  compFull: { en: "Competition Full", hi: "प्रतियोगिता फुल" },
  regClosed: { en: "Registration Closed", hi: "रजिस्ट्रेशन बंद" },
  registered: { en: "Registered ✓", hi: "रजिस्टर्ड ✓" },
  uploadSubmission: { en: "Upload Submission", hi: "सबमिशन अपलोड करें" },
  submittedTick: { en: "Submitted ✓", hi: "जमा ✓" },
  resultsAvailable: { en: "Results Available", hi: "परिणाम उपलब्ध" },
  tapToFill: { en: "Tap to fill the form below", hi: "नीचे फ़ॉर्म भरने हेतु टैप करें" },
  subOpensOn: { en: "Submission opens {d} at {h}", hi: "सबमिशन {d} को {h} बजे खुलेगा" },
  fullMsg: { en: "All spots are booked. Join the waitlist for the next edition.", hi: "सभी स्थान बुक हैं। अगले संस्करण की प्रतीक्षा सूची में जुड़ें।" },
  closedMsg: { en: "Registration has closed.", hi: "रजिस्ट्रेशन बंद हो गया है।" },
  subOpenMsg: { en: "Submissions are open — upload your performance.", hi: "सबमिशन खुले हैं — अपना प्रदर्शन अपलोड करें।" },
  subClosedMsg: { en: "Submissions closed. Results soon.", hi: "सबमिशन बंद। परिणाम जल्द।" },
  resultsMsg: { en: "Results declared. Check winners!", hi: "परिणाम घोषित। विजेता देखें!" },
  cancelledMsg: { en: "This competition was cancelled. Refunds apply.", hi: "यह प्रतियोगिता रद्द हुई। रिफंड लागू।" },
  // Screens / errors
  offline: { en: "Offline — showing last synced data. Pull to retry.", hi: "ऑफ़लाइन — अंतिम सिंक डेटा दिख रहा है। पुनः हेतु खींचें।" },
  errNotFound: { en: "Competition not found", hi: "प्रतियोगिता नहीं मिली" },
  errLoad: { en: "Couldn't load competition", hi: "प्रतियोगिता लोड नहीं हुई" },
  // Dialogs
  payFailTitle: { en: "Payment failed (DEMO)", hi: "भुगतान विफल (डेमो)" },
  payFailMsg: { en: "No money moved. Retry when ready.", hi: "कोई राशि नहीं कटी। तैयार होने पर पुनः प्रयास करें।" },
  regDoneTitle: { en: "Registered (DEMO payment)", hi: "रजिस्टर्ड (डेमो भुगतान)" },
  regDoneMsg: { en: "Your spot is booked. Mock payment — no real money moved.", hi: "आपका स्थान बुक। मॉक भुगतान — कोई वास्तविक राशि नहीं कटी।" },
  fullTitle: { en: "Competition full", hi: "प्रतियोगिता फुल" },
  dupTitle: { en: "Already registered", hi: "पहले से रजिस्टर्ड" },
  dupMsg: { en: "You already hold a spot.", hi: "आपके पास पहले से स्थान है।" },
  cantRegister: { en: "Cannot register", hi: "रजिस्टर नहीं हो सका" },
  submittedTitle: { en: "Submitted", hi: "जमा हो गया" },
  submittedMsg: { en: "Your performance was recorded for judging.", hi: "आपका प्रदर्शन निर्णय हेतु दर्ज हो गया।" },
  shareFailTitle: { en: "Share failed", hi: "शेयर विफल" },
  shareFailMsg: { en: "Could not open the share sheet. Please try again.", hi: "शेयर शीट नहीं खुली। पुनः प्रयास करें।" },
  loadingTitle: { en: "Loading", hi: "लोड हो रहा है" },
  pleaseWait: { en: "Please wait…", hi: "कृपया प्रतीक्षा करें…" },  loadingMsg: { en: "Competition data is still loading. Try again in a moment.", hi: "प्रतियोगिता डेटा लोड हो रहा है। क्षण भर में पुनः प्रयास करें।" },
  joinTitle: { en: "Join", hi: "जुड़ें" },
  backToComp: { en: "← Back to Competitions", hi: "← प्रतियोगिताओं पर वापस" },
  // Video modal
  play: { en: "Play", hi: "चलाएं" },
  pause: { en: "Pause", hi: "रोकें" },
  videoFail: { en: "Video failed to load. Check your connection and retry.", hi: "वीडियो लोड नहीं हुआ। कनेक्शन जांचें और पुनः प्रयास करें।" },
  videoUnavailable: { en: "Video unavailable", hi: "वीडियो उपलब्ध नहीं" },
  videoUnavailableSub: { en: "This competition does not currently provide a video. Please check back later.", hi: "इस प्रतियोगिता में अभी कोई वीडियो नहीं है। बाद में देखें।" },
  demoVideoNote: { en: "Demo sample video — the real video URL comes from the backend.", hi: "डेमो नमूना वीडियो — असली वीडियो URL बैकएंड से आएगा।" },
  // Testimonials
  reviewsLoading: { en: "Loading reviews…", hi: "समीक्षाएं लोड हो रही हैं…" },
  noReviews: { en: "No reviews yet — be the first to participate.", hi: "अभी कोई समीक्षा नहीं — पहले भाग लें।" },
  sampleReview: { en: "sample review", hi: "नमूना समीक्षा" },
  // Screens
  tagline: { en: "Classical dance competitions, judged by experts.", hi: "विशेषज्ञों द्वारा परखी शास्त्रीय नृत्य प्रतियोगिताएं।" },
  discover: { en: "Discover Your Stage", hi: "अपना मंच खोजें" },
  meetWinners: { en: "Meet the Winners", hi: "विजेताओं से मिलें" },
  howItWorks: { en: "How It Works", hi: "यह कैसे काम करता है" },
  step1T: { en: "Register", hi: "रजिस्टर करें" },
  step1S: { en: "Pick a competition and book your spot.", hi: "प्रतियोगिता चुनें और स्थान बुक करें।" },
  step2T: { en: "Perform & Submit", hi: "प्रदर्शन व सबमिट" },
  step2S: { en: "Upload your performance in the window.", hi: "विंडो में अपना प्रदर्शन अपलोड करें।" },
  step3T: { en: "Win Rewards", hi: "पुरस्कार जीतें" },
  step3S: { en: "Get judged, win prizes and certificates.", hi: "निर्णय पाएं, पुरस्कार व प्रमाणपत्र जीतें।" },
  referBannerSub: { en: "Earn ₹10 for every friend who registers. Tap to learn more.", hi: "रजिस्टर करने वाले हर मित्र पर ₹10 पाएं। जानने हेतु टैप करें।" },
  viewDetails: { en: "View details →", hi: "विवरण देखें →" },
  allCompetitions: { en: "All competitions →", hi: "सभी प्रतियोगिताएं →" },
  searchPh: { en: "Search competitions…", hi: "प्रतियोगिताएं खोजें…" },
  featured: { en: "Featured", hi: "चुनिंदा" },
  closingSoon: { en: "Closing Soon", hi: "जल्द बंद हो रही" },
  recentlyAdded: { en: "Recently Added", hi: "हाल में जुड़ी" },
  browseByCat: { en: "Browse by Category", hi: "श्रेणी अनुसार देखें" },
  noMatch: { en: "No competitions match your search.", hi: "आपकी खोज से कोई प्रतियोगिता नहीं मिली।" },
  nonePublished: { en: "No competitions published yet.", hi: "अभी कोई प्रतियोगिता प्रकाशित नहीं।" },
  fAll: { en: "All", hi: "सभी" },
  fRegistered: { en: "Registered", hi: "रजिस्टर्ड" },
  fSubmitting: { en: "Submitting", hi: "सबमिट हो रही" },
  fSubmitted: { en: "Submitted", hi: "जमा" },
  fCompleted: { en: "Completed", hi: "पूर्ण" },
  emptyJoin: { en: "You haven't joined any competitions yet.", hi: "आप अभी किसी प्रतियोगिता में शामिल नहीं हुए।" },
  exploreBtn: { en: "Explore Competitions", hi: "प्रतियोगिताएं देखें" },
  viewCompetition: { en: "View Competition", hi: "प्रतियोगिता देखें" },
  continueSubmission: { en: "Continue Submission", hi: "सबमिशन जारी रखें" },
  viewSubmission: { en: "View Submission", hi: "सबमिशन देखें" },
  // Profile
  demoParticipant: { en: "Demo Participant", hi: "डेमो प्रतिभागी" },
  demoAccount: { en: "Demo account — no real user data is stored.", hi: "डेमो खाता — कोई वास्तविक उपयोगकर्ता डेटा संग्रहीत नहीं।" },
  demoUserId: { en: "Demo user ID", hi: "डेमो उपयोगकर्ता ID" },
  myParticipation: { en: "My participation", hi: "मेरी भागीदारी" },
  myReferral: { en: "My referral", hi: "मेरा रेफ़रल" },
  myCompetitions: { en: "My Competitions", hi: "मेरी प्रतियोगिताएं" },
  mySubmissions: { en: "My Submissions", hi: "मेरे सबमिशन" },
  referrals: { en: "Referrals", hi: "रेफ़रल" },
  settings: { en: "Settings", hi: "सेटिंग्स" },
  language: { en: "English / हिंदी", hi: "English / हिंदी" },
  aboutApp: { en: "About", hi: "परिचय" },
  help: { en: "Help", hi: "सहायता" },
  statRegistered: { en: "Registered", hi: "रजिस्टर्ड" },
  statSubmissions: { en: "Submissions", hi: "सबमिशन" },
  statInProgress: { en: "In Progress", hi: "प्रगति पर" },
  statResults: { en: "Results", hi: "परिणाम" },
  copyCode: { en: "Copy Code", hi: "कोड कॉपी करें" },
  aboutText: { en: "Feedants Competition Module — Full-Stack Development Internship technical assignment. React Native + Express + MongoDB.", hi: "फ़ीडेंट्स प्रतियोगिता मॉड्यूल — फुल-स्टैक डेवलपमेंट इंटर्नशिप तकनीकी असाइनमेंट। React Native + Express + MongoDB।" },
  helpText: { en: "Register for a competition, upload your performance video URL during the submission window, and track results here. Payments and sample media are demo-only.", hi: "प्रतियोगिता में रजिस्टर करें, सबमिशन विंडो में प्रदर्शन वीडियो URL अपलोड करें और परिणाम यहीं देखें। भुगतान व नमूना मीडिया डेमो हैं।" },
};

export function makeT(lang) {
  const k = lang === "हिंदी" ? "hi" : "en";
  return (key, vars) => {
    let s = (STR[key] && STR[key][k]) || key;
    if (vars) for (const v of Object.keys(vars)) s = s.replace(`{${v}}`, String(vars[v]));
    return s;
  };
}

const LANG_KEY = "feedants_lang";

export async function loadLang(AsyncStorage) {
  try {
    const v = await AsyncStorage.getItem(LANG_KEY);
    return v === "हिंदी" ? "हिंदी" : "ENG";
  } catch {
    return "ENG";
  }
}

export async function saveLang(AsyncStorage, lang) {
  try {
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch {}
}
