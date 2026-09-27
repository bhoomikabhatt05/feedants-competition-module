"use strict";

const H = 3600 * 1000;
const D = 24 * H;

function base() {
  return {
    title: "Feedants Classical Dance",
    category: "Dance",
    format: "Multi-Win",
    certificateNote: "Winners get certificate",
    // Demo stand-in cover (public sample photo) — the real competition banner goes here.
    coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Bharatanatyam_on_stage_%282022%29.jpg/960px-Bharatanatyam_on_stage_%282022%29.jpg",
    prizeVideoUrl: "",
    prizePool: 1500,
    entryFee: 99,
    capacity: 20,
    bookedSpots: 1,
    judge: {
      name: "Manju Dubey",
      role: "Judge",
      bio: "Professional Kathak Dancer",
      experience: "12+ Years of Experience",
      avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Utthara_Unni_Soorya_Parampara_Bharatanatyam_Dancer.jpg",
      // Demo stand-in video (public sample file) — the real judge video URL goes here.
      introVideoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    },
    previousWinners: [
      // Demo stand-in photos/videos (public samples) — real media URLs go here.
      { name: "Riya Shah", rankLabel: "1st Winner", thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Utthara_Unni_Bharatanatyam_Dance_Festival_2.jpg", videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4" },
      { name: "Aarav Mehta", rankLabel: "1st Winner", thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Utthara_Unni_Bharatanatyam_Dance_Festival_3.jpg", videoUrl: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4" },
      { name: "Neha Verma", rankLabel: "2nd Winner", thumbnailUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/Utthara_Unni_Bharatanatyam_Dance_Festival_6.jpg/960px-Utthara_Unni_Bharatanatyam_Dance_Festival_6.jpg", videoUrl: "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4" },
      { name: "Ishita Chou", rankLabel: "3rd Winner", thumbnailUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Utthara_Unni_Bharatanatyam_Dance_Festival_7.jpg/960px-Utthara_Unni_Bharatanatyam_Dance_Festival_7.jpg", videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4" },
    ],
    about: "This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent.",
    aboutMore: " Express your passion through traditional dance. Record a 2–5 min classical performance, upload it during the submission window, and get judged by experts.",
    judgingParameters: [
      { name: "Technique & Posture", description: "Accuracy, control and execution of dance movements.", weight: 30 },
      { name: "Rhythm & Timing", description: "Staying on beat and matching the music throughout.", weight: 25 },
      { name: "Expression & Stage Presence", description: "Emotional expression, storytelling and connection with the performance.", weight: 25 },
      { name: "Costume & Authenticity", description: "Traditional attire and authentic classical style.", weight: 20 },
    ],
    rules: [
      "Open to all age groups; solo entries only.",
      "Performance must be 2–5 minutes, classical styles only.",
      "Only contributions from paid participants will be considered for judging.",
      "One entry per registered user; plagiarism leads to disqualification.",
      "Refund as per policy if the competition is cancelled.",
    ],
    rewards: [
      { position: 1, label: "1st Winner", amount: 550 },
      { position: 2, label: "2nd Winner", amount: 300 },
      { position: 3, label: "3rd Winner", amount: 240 },
      { position: 4, label: "4th Winner", amount: 200 },
      { position: 5, label: "5th Winner", amount: 130 },
      { position: 6, label: "6th Winner", amount: 80 },
    ],
    referral: { link: "https://feedants.com/r/referral123", codePrefix: "FEED", perSignupReward: 10 },
  };
}

function seedDoc() {
  const now = Date.now();
  const d = (days, h = 12, m = 0) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + days);
    dt.setHours(h, m, 0, 0);
    return dt;
  };
  return {
    ...base(),
    slug: "feedants-classical-dance",
    coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Bharatanatyam_on_stage_%282022%29.jpg/960px-Bharatanatyam_on_stage_%282022%29.jpg",
    prizeVideoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4",
    dates: {
      // Registration closes ~1d 6h from now so the countdown is always alive
      registerBefore: new Date(now + ((26 * 60 + 28) * 60 + 32) * 1000 + 1 * D),
      submissionStarts: d(-21, 4, 0),
      submissionEnds: d(3, 23, 55),
      resultDate: d(5, 23, 50),
    },
  };
}

/** Five distinct demo competitions (stable slugs — seeding is idempotent). */
function stateDemoDocs() {
  const now = Date.now();
  const d = (days, h = 12, m = 0) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + days);
    dt.setHours(h, m, 0, 0);
    return dt;
  };
  const D2 = D;
  return [
    {
      ...base(),
      slug: "urban-photography-challenge",
      title: "Urban Photography Challenge",
      category: "Photography",
      format: "Single-Win",
      certificateNote: "Top 3 get certificates",
      prizePool: 2000,
      entryFee: 49,
      capacity: 50,
      bookedSpots: 12,
      coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Camera-photographer-photography-vintage_%2824326759225%29.jpg/960px-Camera-photographer-photography-vintage_%2824326759225%29.jpg",
      judge: { name: "Arjun Nair", role: "Judge", bio: "Street & Urban Photographer", experience: "8+ Years of Experience", avatarUrl: "", introVideoUrl: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4" },
      dates: {
        registerBefore: new Date(now + 2 * D2),
        submissionStarts: new Date(now - 10 * D2),
        submissionEnds: new Date(now + 9 * D2),
        resultDate: new Date(now + 16 * D2),
      },
      previousWinners: [
        { name: "Kabir Rao", rankLabel: "1st Winner", thumbnailUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/A_woman_stands_outdoors%2C_holding_a_vintage_camera_in_one_hand.jpg/960px-A_woman_stands_outdoors%2C_holding_a_vintage_camera_in_one_hand.jpg", videoUrl: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4" },
        { name: "Sara Khan", rankLabel: "2nd Winner", thumbnailUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/A_vintage_camera_is_placed_on_an_old_map.jpg/960px-A_vintage_camera_is_placed_on_an_old_map.jpg", videoUrl: "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4" },
      ],
      about: "An online street and urban photography challenge open to all skill levels. Shoot your city and tell its story.",
      aboutMore: " Submit 3–5 original urban photographs during the submission window. Judged by professional photographers.",
      judgingParameters: [
        { name: "Composition", description: "Framing, balance and visual structure of the shot.", weight: 35 },
        { name: "Storytelling", description: "How strongly the photo captures urban life.", weight: 30 },
        { name: "Technical Quality", description: "Focus, exposure and post-processing restraint.", weight: 20 },
        { name: "Originality", description: "Fresh perspective on familiar subjects.", weight: 15 },
      ],
      rules: [
        "Open to all ages; individual entries only.",
        "Submit 3–5 original photographs, urban theme only.",
        "Only contributions from paid participants will be considered for judging.",
        "Heavy manipulation beyond basic correction leads to disqualification.",
      ],
      rewards: [
        { position: 1, label: "1st Winner", amount: 900 },
        { position: 2, label: "2nd Winner", amount: 600 },
        { position: 3, label: "3rd Winner", amount: 500 },
      ],
      referral: { link: "https://feedants.com/r/photo123", codePrefix: "PHOTO", perSignupReward: 10 },
    },
    {
      ...base(),
      slug: "indie-music-showcase",
      title: "Indie Music Showcase",
      category: "Music",
      format: "Multi-Win",
      certificateNote: "All finalists get certificates",
      prizePool: 3000,
      entryFee: 149,
      capacity: 30,
      bookedSpots: 9,
      coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Acoustic_Guitar_Solo_%28240361337%29.jpeg/960px-Acoustic_Guitar_Solo_%28240361337%29.jpeg",
      judge: { name: "Devika Menon", role: "Judge", bio: "Independent Singer-Songwriter", experience: "10+ Years of Experience", avatarUrl: "", introVideoUrl: "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4" },
      dates: {
        registerBefore: new Date(now - 2 * D2),
        submissionStarts: new Date(now - 1 * D2),
        submissionEnds: new Date(now + 2 * D2),
        resultDate: new Date(now + 10 * D2),
      },
      previousWinners: [
        { name: "Rohan Das", rankLabel: "1st Winner", thumbnailUrl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/DSCF1138_A_street_musician_sings_and_plays_acoustic_guitar_into_a_microphone_as_evening_settles_in_palm_trees_and_market_stalls_visible_in_the_background.jpg/960px-DSCF1138_A_street_musician_sings_and_plays_acoustic_guitar_into_a_microphone_as_evening_settles_in_palm_trees_and_market_stalls_visible_in_the_background.jpg", videoUrl: "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4" },
      ],
      about: "An online showcase for independent musicians. Upload one original track and perform it live on video.",
      aboutMore: " Any genre welcome. Finalists are featured on the Feedants community playlist.",
      judgingParameters: [
        { name: "Musicality", description: "Melody, harmony and arrangement quality.", weight: 35 },
        { name: "Performance", description: "Delivery, confidence and stage presence on video.", weight: 30 },
        { name: "Originality", description: "Distinct sound and songwriting voice.", weight: 20 },
        { name: "Production", description: "Clarity of the recording and mix.", weight: 15 },
      ],
      rules: [
        "Open to solo artists and duos.",
        "One original track, up to 6 minutes.",
        "Only contributions from paid participants will be considered for judging.",
        "Cover songs are not eligible.",
      ],
      rewards: [
        { position: 1, label: "1st Winner", amount: 1200 },
        { position: 2, label: "2nd Winner", amount: 800 },
        { position: 3, label: "3rd Winner", amount: 500 },
        { position: 4, label: "4th Winner", amount: 300 },
        { position: 5, label: "5th Winner", amount: 200 },
      ],
      referral: { link: "https://feedants.com/r/music123", codePrefix: "MUSIC", perSignupReward: 10 },
    },
    {
      ...base(),
      slug: "digital-art-sprint",
      title: "Digital Art Sprint",
      category: "Art",
      format: "Single-Win",
      certificateNote: "Winners get certificate",
      prizePool: 1200,
      entryFee: 0,
      capacity: 100,
      bookedSpots: 34,
      coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Artist_creating_a_vibrant_painting_of_blue_feathers_in_a_cozy_studio_with_bright_walls_and_flowing_natural_light.jpg/960px-Artist_creating_a_vibrant_painting_of_blue_feathers_in_a_cozy_studio_with_bright_walls_and_flowing_natural_light.jpg",
      judge: { name: "Meera Iyer", role: "Judge", bio: "Digital Illustrator", experience: "6+ Years of Experience", avatarUrl: "", introVideoUrl: "" },
      dates: {
        registerBefore: new Date(now - 9 * D2),
        submissionStarts: new Date(now - 8 * D2),
        submissionEnds: new Date(now - 2 * D2),
        resultDate: new Date(now + 5 * D2),
      },
      previousWinners: [],
      about: "A free weekend digital-art sprint. Theme is announced when submissions open — create and upload within 48 hours.",
      aboutMore: " Any digital medium welcome: illustration, pixel art, 3D renders.",
      judgingParameters: [
        { name: "Theme Fit", description: "How well the piece answers the announced theme.", weight: 40 },
        { name: "Craft", description: "Draftsmanship, colour and composition.", weight: 35 },
        { name: "Originality", description: "Fresh ideas over trends.", weight: 25 },
      ],
      rules: [
        "Free entry, open to all.",
        "One artwork per participant, created during the sprint window.",
        "AI-generated entries must be disclosed and enter a separate track.",
      ],
      rewards: [
        { position: 1, label: "1st Winner", amount: 600 },
        { position: 2, label: "2nd Winner", amount: 400 },
        { position: 3, label: "3rd Winner", amount: 200 },
      ],
      referral: { link: "https://feedants.com/r/art123", codePrefix: "ART", perSignupReward: 10 },
    },
    {
      ...base(),
      slug: "creative-writing-challenge",
      title: "Creative Writing Challenge",
      category: "Writing",
      format: "Multi-Win",
      certificateNote: "Published authors get certificates",
      prizePool: 800,
      entryFee: 29,
      capacity: 40,
      bookedSpots: 5,
      coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Old_typewriter_on_brown_wooden_desk_closeup.jpg/960px-Old_typewriter_on_brown_wooden_desk_closeup.jpg",
      judge: { name: "Anand Prakash", role: "Judge", bio: "Author & Editor", experience: "15+ Years of Experience", avatarUrl: "", introVideoUrl: "" },
      dates: {
        registerBefore: new Date(now - 4 * D2),
        submissionStarts: new Date(now + 2 * D2),
        submissionEnds: new Date(now + 9 * D2),
        resultDate: new Date(now + 16 * D2),
      },
      previousWinners: [],
      about: "A short-fiction challenge. Write a complete story under 1500 words on the announced prompt.",
      aboutMore: " Winning entries are published in the Feedants annual anthology.",
      judgingParameters: [
        { name: "Story", description: "Plot, arc and satisfying resolution.", weight: 35 },
        { name: "Voice", description: "Distinct narrative voice and style.", weight: 30 },
        { name: "Language", description: "Precision and beauty of prose.", weight: 20 },
        { name: "Prompt Fit", description: "Creative use of the announced prompt.", weight: 15 },
      ],
      rules: [
        "Open to all ages; entries in English or Hindi.",
        "One story per participant, under 1500 words.",
        "Only contributions from paid participants will be considered for judging.",
        "Plagiarism leads to disqualification.",
      ],
      rewards: [
        { position: 1, label: "1st Winner", amount: 350 },
        { position: 2, label: "2nd Winner", amount: 250 },
        { position: 3, label: "3rd Winner", amount: 200 },
      ],
      referral: { link: "https://feedants.com/r/write123", codePrefix: "WRITE", perSignupReward: 10 },
    },
    {
      ...base(),
      slug: "demo-state-result-declared",
      title: "Monsoon Dance Fest (Demo Results)",
      category: "Dance",
      format: "Multi-Win",
      certificateNote: "Winners get certificate",
      prizePool: 1000,
      entryFee: 49,
      capacity: 20,
      bookedSpots: 20,
      coverImage: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Khajuraho_Dance_Festival_2025_01.webm/960px--Khajuraho_Dance_Festival_2025_01.webm.jpg",
      judge: { name: "Manju Dubey", role: "Judge", bio: "Professional Kathak Dancer", experience: "12+ Years of Experience", avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Utthara_Unni_Soorya_Parampara_Bharatanatyam_Dancer.jpg", introVideoUrl: "" },
      dates: {
        registerBefore: new Date(now - 20 * D2),
        submissionStarts: new Date(now - 19 * D2),
        submissionEnds: new Date(now - 10 * D2),
        resultDate: new Date(now - 1 * D2),
      },
      previousWinners: [
        { name: "Riya Shah", rankLabel: "1st Winner", thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Utthara_Unni_Bharatanatyam_Dance_Festival_2.jpg", videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4" },
      ],
      about: "A completed demo festival kept so result-declared state can be reviewed.",
      aboutMore: "",
      judgingParameters: [
        { name: "Technique", description: "Control and execution.", weight: 50 },
        { name: "Expression", description: "Stage presence.", weight: 50 },
      ],
      rules: ["Demo event — results already declared."],
      rewards: [
        { position: 1, label: "1st Winner", amount: 600 },
        { position: 2, label: "2nd Winner", amount: 400 },
      ],
      referral: { link: "https://feedants.com/r/demo123", codePrefix: "FEED", perSignupReward: 10 },
    },
  ];
}

function testimonialSeeds(competitionId) {
  return [
    { competition: competitionId, name: "Priya S. (demo)", text: "The registration took a minute and my submission went through without any trouble.", rating: 5, isDemo: true },
    { competition: competitionId, name: "Rahul V. (demo)", text: "Clear dates and quick judging updates. Good experience for a first competition.", rating: 4, isDemo: true },
    { competition: competitionId, name: "Anita K. (demo)", text: "Loved the referral discount and the practice schedule reminders.", rating: 5, isDemo: true },
  ];
}

async function ensureSeeded(Competition) {
  const n = await Competition.countDocuments({ slug: "feedants-classical-dance" });
  if (n === 0) {
    await Competition.create(seedDoc());
    console.log("[db] seeded feedants-classical-dance");
  }
  // Remove legacy same-title demo docs from older seeds so listings stay distinct.
  await Competition.deleteMany({ slug: { $in: ["demo-state-full", "demo-state-registration-closed", "demo-state-submission-open", "demo-state-submission-closed"] } });
  for (const doc of stateDemoDocs()) {
    const exists = await Competition.countDocuments({ slug: doc.slug });
    if (!exists) await Competition.create(doc);
  }
  // Demo/sample testimonials for the flagship competition (clearly marked isDemo).
  const Testimonial = require("./models/Testimonial");
  const flagship = await Competition.findOne({ slug: "feedants-classical-dance" });
  if (flagship && (await Testimonial.countDocuments({ competition: flagship._id })) === 0) {
    await Testimonial.insertMany(testimonialSeeds(flagship._id));
    console.log("[db] seeded demo testimonials");
  }
  // Refresh stale placeholder media from earlier seeds to the curated demo set.
  const staleMedia = (c) =>
    !c ||
    (c.coverImage || "").includes("picsum") ||
    (c.coverImage || "").includes("example.com") ||
    ((c.judge && c.judge.avatarUrl) || "").includes("pravatar") ||
    ((c.judge && c.judge.introVideoUrl) || "").includes("example.com") ||
    ((c.judge && c.judge.introVideoUrl) || "").includes("googleapis.com") ||
    (c.previousWinners || []).some((w) => (w.thumbnailUrl || "").includes("picsum"));
  const freshBySlug = {};
  freshBySlug["feedants-classical-dance"] = seedDoc();
  for (const doc of stateDemoDocs()) freshBySlug[doc.slug] = doc;
  for (const slug of Object.keys(freshBySlug)) {
    const comp = await Competition.findOne({ slug });
    if (comp && staleMedia(comp)) {
      const fresh = freshBySlug[slug];
      comp.coverImage = fresh.coverImage;
      comp.judge.avatarUrl = fresh.judge.avatarUrl;
      comp.judge.introVideoUrl = fresh.judge.introVideoUrl;
      comp.previousWinners = fresh.previousWinners;
      if (!comp.prizeVideoUrl) comp.prizeVideoUrl = fresh.prizeVideoUrl;
      await comp.save();
      console.log(`[db] refreshed demo media for ${slug}`);
    }
  }
}

module.exports = { seedDoc, stateDemoDocs, testimonialSeeds, ensureSeeded };
