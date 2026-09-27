import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, Share, BackHandler } from "react-native";
import { StatusBar } from "expo-status-bar";
import { api, getUserId, readCache, SLUG } from "./src/api";
import { makeT } from "./src/i18n";
import { HomeScreen, ListScreen, ProfileScreen } from "./src/screens";
import { TopBar, CoverPhoto, TitleCard, JudgeCard, CountdownBar, DatesGrid, WinnersRow, InfoTabs, Rewards, PrizeMoneyCard, ReferCard, HearFromUsers, VideoModal, TestimonialsModal, BottomNav, AdSlot, TEAL, INK, MUTED } from "./src/components/cards";
import { formatDateTime } from "./src/hooks";

function stateMessage(state) {
  switch (state) {
    case "full": return "All spots are booked. Join the waitlist for the next edition.";
    case "registration_closed": return "Registration has closed.";
    case "submission_open": return "Submissions are open — upload your performance.";
    case "submission_closed": return "Submissions closed. Results soon.";
    case "result_declared": return "Results declared. Check winners!";
    case "cancelled": return "This competition was cancelled. Refunds apply.";
    default: return "";
  }
}

export default function App() {
  const [lang, setLang] = useState("ENG");
  const t = makeT(lang);
  const [stack, setStack] = useState([{ name: "home" }]);
  const current = stack[stack.length - 1];
  const detailSlug = current.name === "details" ? current.slug : null;

  // Details-screen state (for whichever competition is open)
  const [comp, setComp] = useState(null);
  const [compSlug, setCompSlug] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | error | content
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [stale, setStale] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [subUrl, setSubUrl] = useState("");
  const [subError, setSubError] = useState("");
  const [referral, setReferral] = useState(null);
  const [video, setVideo] = useState(null); // { title, url } | null
  const [reviews, setReviews] = useState({ visible: false, items: [], loading: false, error: "" });
  // Flagship competition for the center Join action from any screen
  const [featured, setFeatured] = useState(null);
  const subInputRef = useRef(null);
  const pendingFocus = useRef(false);

  const push = (route) => setStack((s) => [...s, route]);
  const navBack = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : [{ name: "competitions" }]));
  }, []);
  const openCompetition = useCallback((slug) => {
    setSubUrl("");
    setSubError("");
    setReferral(null);
    push({ name: "details", slug });
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (stack.length > 1) {
        setStack((s) => s.slice(0, -1));
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length]);

  const load = useCallback(async (slug) => {
    try {
      setError("");
      const userId = await getUserId();
      const data = await api.detail(slug, userId);
      setComp(data);
      setCompSlug(slug);
      setStale(false);
      setPhase("content");
      try {
        setReferral(await api.referral(slug, userId));
      } catch {}
    } catch (e) {
      const cached = await readCache(slug);
      if (cached && cached.data) {
        // Offline with previously synced server data — always labelled stale.
        setComp(cached.data);
        setCompSlug(slug);
        setStale(true);
        setError(e.message);
        setErrorCode(e.code || "");
        setPhase("content");
      } else {
        setError(e.message);
        setErrorCode(e.code || "");
        setPhase("error");
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load details whenever a details route becomes current; load flagship once for Join.
  useEffect(() => {
    if (detailSlug && detailSlug !== compSlug) {
      setPhase("loading");
      load(detailSlug);
    }
  }, [detailSlug, compSlug, load]);
  useEffect(() => {
    getUserId().then((id) => api.detail(SLUG, id).then(setFeatured).catch(() => {}));
  }, []);

  // Focus the submission field when Join sent us here for uploading.
  useEffect(() => {
    if (pendingFocus.current && comp && comp.canUploadSubmission && current.name === "details") {
      pendingFocus.current = false;
      setTimeout(() => subInputRef.current && subInputRef.current.focus(), 400);
    }
  }, [comp, current.name]);

  const openVideo = (title, url) => setVideo({ title, url });

  const referralLink = () => (comp && comp.referral && comp.referral.link) || "https://feedants.com/r/";

  const shareReferral = async () => {
    try {
      const result = await Share.share({ message: `Join me on Feedants! ${referralLink()}` });
      // Dismissing the sheet is not an error — stay silent either way.
      if (result && result.action === Share.sharedAction && comp) {
        const ref = await api.referral(comp.slug, await getUserId()).catch(() => null);
        if (ref) setReferral(ref);
      }
    } catch (e) {
      Alert.alert("Share failed", "Could not open the share sheet. Please try again.");
    }
  };

  const openReviews = async () => {
    if (!comp) return;
    const slug = comp.slug;
    setReviews({ visible: true, items: [], loading: true, error: "" });
    try {
      const items = await api.testimonials(slug);
      setReviews({ visible: true, items, loading: false, error: "" });
    } catch (e) {
      setReviews({ visible: true, items: [], loading: false, error: e.message + " — you can retry." });
    }
  };

  const doRegister = async (slug, setTarget) => {
    try {
      setBusy(true);
      const userId = await getUserId();
      // DEMO/MOCK checkout first (backend-owned; no secrets in app).
      try {
        await api.mockCheckout(userId, (comp && comp.entryFee) || 0);
      } catch (pe) {
        Alert.alert("Payment failed (DEMO)", pe.message + "\nNo money moved. Retry when ready.");
        return;
      }
      const data = await api.register(slug, userId);
      setTarget(data);
      if (slug === SLUG) setFeatured(data);
      Alert.alert("Registered (DEMO payment)", "Your spot is booked. Mock payment — no real money moved.");
    } catch (e) {
      if (e.code === "FULL") Alert.alert("Competition full", "All spots are booked.");
      else if (e.code === "DUPLICATE") Alert.alert("Already registered", "You already hold a spot.");
      else Alert.alert("Cannot register", e.message);
      load(slug);
    } finally {
      setBusy(false);
    }
  };

  const onRegister = () => comp && doRegister(comp.slug, setComp);

  const centerAction = () => {
    if (!featured) {
      Alert.alert("Loading", "Competition data is still loading. Try again in a moment.");
      return;
    }
    if (!featured.isRegistered && featured.canRegister) {
      openCompetition(featured.slug);
      doRegister(featured.slug, (d) => { setFeatured(d); if (compSlug === featured.slug) setComp(d); });
      return;
    }
    if (featured.isRegistered && featured.canUploadSubmission && !featured.registration?.submittedAt) {
      pendingFocus.current = true;
      if (current.name !== "details" || compSlug !== featured.slug) openCompetition(featured.slug);
      else setTimeout(() => subInputRef.current && subInputRef.current.focus(), 100);
      return;
    }
    openCompetition(featured.slug);
    const reason = featured.registration?.submittedAt
      ? "You have already submitted. You can update your submission from the details screen."
      : stateMessage(featured.state) || "Participation is not available right now.";
    Alert.alert("Join", reason);
  };

  const onGo = (key) => {
    if (key === "action") return centerAction();
    if (key === "home") return setStack([{ name: "home" }]);
    if (current.name === key) return;
    push({ name: key });
  };

  const onUpload = async () => {
    if (!comp) return;
    setSubError("");
    const url = subUrl.trim();
    if (!url) {
      setSubError("Paste your performance video URL first (mp4/mov/webm).");
      return;
    }
    if (!/^https?:\/\/.+/i.test(url)) {
      setSubError("Enter a valid http(s) video URL (mp4/mov/webm).");
      return;
    }
    try {
      setBusy(true);
      const userId = await getUserId();
      const data = await api.submit(comp.slug, userId, url, "video/mp4", 50 * 1024 * 1024);
      setComp(data);
      setSubUrl("");
      Alert.alert("Submitted", "Your performance was recorded for judging.");
    } catch (e) {
      setSubError(e.message + " — you can retry.");
    } finally {
      setBusy(false);
    }
  };

  const submitted = !!(comp && comp.registration && comp.registration.submittedAt);
  let cta;
  if (!comp) {
    cta = { label: "Loading…", sub: "", onPress: null, disabled: true };
  } else if (!comp.isRegistered) {
    if (comp.state === "registration_open") {
      cta = { label: `Register Now • ₹${comp.entryFee} (DEMO)`, sub: "", onPress: onRegister, disabled: false };
    } else if (comp.state === "full") {
      cta = { label: "Competition Full", sub: stateMessage(comp.state), onPress: null, disabled: true };
    } else if (comp.state === "result_declared") {
      cta = { label: "Results Available", sub: stateMessage(comp.state), onPress: null, disabled: true };
    } else {
      cta = { label: "Registration Closed", sub: stateMessage(comp.state), onPress: null, disabled: true };
    }
  } else if (submitted) {
    cta = { label: "Submitted ✓", sub: `Submitted ${new Date(comp.registration.submittedAt).toLocaleString()}`, onPress: null, disabled: true };
  } else if (comp.canUploadSubmission) {
    cta = { label: "Upload Submission", sub: "Tap to fill the form below", onPress: () => subInputRef.current && subInputRef.current.focus(), disabled: false };
  } else {
    const opens = formatDateTime(comp.dates.submissionStarts);
    cta = { label: "Registered ✓", sub: `Submission opens ${opens.date} at ${opens.time}`, onPress: null, disabled: true };
  }
  const ctaDisabled = cta.disabled || busy || !cta.onPress;

  const navActive = current.name === "details" ? "competitions" : current.name;

  return (
    <KeyboardAvoidingView style={st.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="auto" />
      {current.name === "home" && (
        <HomeScreen onOpenCompetition={openCompetition} onGo={onGo} />
      )}
      {current.name === "explore" && (
        <ListScreen title="Explore" searchable onOpenCompetition={openCompetition} />
      )}
      {current.name === "competitions" && (
        <ListScreen title="Competitions" searchable={false} onOpenCompetition={openCompetition} />
      )}
      {current.name === "profile" && <ProfileScreen />}
      {current.name === "details" && phase === "loading" && (
        <View style={st.center}><ActivityIndicator size="large" color={TEAL} /><Text style={st.muted}>{t("loading")}</Text></View>
      )}
      {current.name === "details" && phase === "error" && (
        <View style={st.center}>
          <Text style={st.errT}>{errorCode === 404 || /not found/i.test(error) ? "Competition not found" : "Couldn't load competition"}</Text>
          <Text style={st.muted}>{error}</Text>
          <TouchableOpacity style={st.retry} onPress={() => { setPhase("loading"); load(detailSlug); }}>
            <Text style={st.retryT}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.retryGhost} onPress={navBack}>
            <Text style={st.retryGhostT}>← Back to Competitions</Text>
          </TouchableOpacity>
        </View>
      )}
      {current.name === "details" && phase === "content" && comp && (
        <ScrollView
          contentContainerStyle={st.body}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(comp.slug); }} />}
        >
          <TopBar lang={lang} setLang={setLang} t={t} onBack={navBack} />
          {stale && (
            <View style={st.offline}>
              <Text style={st.offlineT}>Offline — showing last synced data{error ? `: ${error}` : ""}. Pull to retry.</Text>
            </View>
          )}
          <CoverPhoto uri={comp.coverImage} title={comp.title} />
          <TitleCard c={comp} />
          <JudgeCard c={comp} onPlay={() => openVideo("Judge Intro", comp.judge.introVideoUrl)} />
          {comp.state === "registration_open" && (
            <CountdownBar ms={comp.countdown.registrationClosesInMs} onExpiry={() => load(comp.slug)} />
          )}
          {!!stateMessage(comp.state) && comp.state !== "registration_open" && (
            <View style={st.notice}><Text style={st.noticeT}>{stateMessage(comp.state)}</Text></View>
          )}
          <DatesGrid c={comp} t={t} />
          <WinnersRow c={comp} t={t} onPlay={(w) => openVideo(w.name, w.videoUrl)} />
          <InfoTabs c={comp} t={t} />
          <Rewards c={comp} t={t} />
          <View style={st.disclaimer}><Text style={st.muted}>ⓘ  <Text style={{ fontWeight: "700" }}>Disclaimer:</Text> Only contributions from paid participants will be considered for judging.</Text></View>
          <PrizeMoneyCard onPrizeVideo={() => openVideo("Prize Money Guide", comp.prizeVideoUrl)} />
          {comp.isRegistered && (
            <View style={st.card}>
              <Text style={st.secT}>Your Submission {comp.canUploadSubmission ? "" : "(opens with submission window)"}</Text>
              {submitted && (
                <Text style={st.submitted}>✓ Submitted{comp.registration.submissionUrl ? `: ${comp.registration.submissionUrl}` : ""}</Text>
              )}
              <TextInput
                ref={subInputRef}
                style={st.input}
                placeholder="https://…/performance.mp4"
                value={subUrl}
                onChangeText={setSubUrl}
                autoCapitalize="none"
              />
              {!!subError && <Text style={st.subErr}>{subError}</Text>}
              <TouchableOpacity style={[st.upBtn, (!comp.canUploadSubmission || busy) && st.upBtnOff]} disabled={!comp.canUploadSubmission || busy} onPress={onUpload}>
                <Text style={st.upBtnT}>{busy ? "Uploading…" : submitted ? "Update Submission (demo URL)" : "Upload (demo URL recorded by backend)"}</Text>
              </TouchableOpacity>
              {!comp.canUploadSubmission && <Text style={st.muted}>Upload enables automatically when the backend submission window opens.</Text>}
            </View>
          )}
          <ReferCard
            link={referralLink()}
            code={referral ? referral.code : comp.referralCode}
            perSignup={(comp.referral && comp.referral.perSignupReward) || 10}
            signupCount={referral ? referral.signupCount : null}
            creditEarned={referral ? referral.creditEarned : null}
            onRefer={shareReferral}
            onShare={shareReferral}
            t={t}
          />
          <HearFromUsers onPress={openReviews} t={t} />
          <AdSlot />
          <View style={{ height: current.name === "details" ? 190 : 110 }} />
        </ScrollView>
      )}

      <VideoModal
        visible={!!video}
        title={video ? video.title : ""}
        url={video ? video.url : ""}
        onClose={() => setVideo(null)}
      />
      <TestimonialsModal
        visible={reviews.visible}
        items={reviews.items}
        loading={reviews.loading}
        error={reviews.error}
        onRetry={openReviews}
        onClose={() => setReviews((r) => ({ ...r, visible: false }))}
      />

      <View style={st.footer}>
        {current.name === "details" && phase === "content" && comp && (
          <TouchableOpacity style={[st.cta, ctaDisabled && st.ctaOff]} disabled={ctaDisabled} onPress={cta.onPress || undefined} accessibilityRole="button" accessibilityLabel={cta.label}>
            <Text style={st.ctaT}>{busy ? "Please wait…" : cta.label}</Text>
            {!!cta.sub && <Text style={st.ctaS}>{cta.sub}</Text>}
          </TouchableOpacity>
        )}
        <BottomNav active={navActive} onGo={onGo} />
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f6fafa" },
  body: { padding: 14, paddingTop: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24, backgroundColor: "#f6fafa" },
  muted: { color: MUTED, fontSize: 13 },
  errT: { fontSize: 18, fontWeight: "800", color: INK },
  retry: { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 28, paddingVertical: 10 },
  retryT: { color: "#fff", fontWeight: "800" },
  retryGhost: { paddingHorizontal: 20, paddingVertical: 8 },
  retryGhostT: { color: TEAL, fontWeight: "700" },
  offline: { backgroundColor: "#fff4d6", padding: 8, borderRadius: 8, marginBottom: 10 },
  offlineT: { color: "#9a6b00", fontSize: 12 },
  notice: { backgroundColor: "#fff4d6", borderRadius: 10, padding: 12, marginBottom: 12 },
  noticeT: { color: INK, fontWeight: "700" },
  disclaimer: { backgroundColor: "#e8f4f5", borderRadius: 10, padding: 12, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e6efef" },
  secT: { fontWeight: "800", color: INK, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#bfe0e4", borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: "#fff" },
  subErr: { color: "#b3261e", marginBottom: 8 },
  submitted: { color: TEAL, fontWeight: "700", marginBottom: 8 },
  upBtn: { backgroundColor: TEAL, borderRadius: 8, padding: 12, alignItems: "center", marginBottom: 6 },
  upBtnOff: { backgroundColor: "#9db9bd" },
  upBtnT: { color: "#fff", fontWeight: "800" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#e6efef" },
  cta: { backgroundColor: TEAL, margin: 12, borderRadius: 10, padding: 12, alignItems: "center" },
  ctaOff: { backgroundColor: "#9db9bd" },
  ctaT: { color: "#fff", fontWeight: "800", fontSize: 16 },
  ctaS: { color: "#d7ecee", fontSize: 12 },
});
