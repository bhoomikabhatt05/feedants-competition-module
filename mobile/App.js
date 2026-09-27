import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform, Share, BackHandler } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { api, getUserId, readCache, SLUG } from "./src/api";
import { makeT, loadLang, saveLang } from "./src/i18n";
import { HomeScreen, ExploreScreen, CompetitionsScreen, ProfileScreen } from "./src/screens";
import { TopBar, CoverPhoto, TitleCard, JudgeCard, CountdownBar, DatesGrid, WinnersRow, InfoTabs, Rewards, PrizeMoneyCard, ReferCard, HearFromUsers, VideoModal, TestimonialsModal, BottomNav, AdSlot, TEAL, INK, MUTED } from "./src/components/cards";
import { formatDateTime } from "./src/hooks";

export default function App() {
  const [lang, setLangState] = useState("ENG");
  const t = makeT(lang);
  const setLang = (l) => {
    setLangState(l);
    saveLang(AsyncStorage, l);
  };
  useEffect(() => {
    loadLang(AsyncStorage).then(setLangState);
  }, []);

  const [stack, setStack] = useState([{ name: "home" }]);
  const current = stack[stack.length - 1];
  const detailSlug = current.name === "details" ? current.slug : null;

  const stateMessage = (state) => {
    switch (state) {
      case "full": return t("fullMsg");
      case "registration_closed": return t("closedMsg");
      case "submission_open": return t("subOpenMsg");
      case "submission_closed": return t("subClosedMsg");
      case "result_declared": return t("resultsMsg");
      case "cancelled": return t("cancelledMsg");
      default: return "";
    }
  };

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
      Alert.alert(t("shareFailTitle"), t("shareFailMsg"));
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
      setReviews({ visible: true, items: [], loading: false, error: e.message + t("subRetry") });
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
        Alert.alert(t("payFailTitle"), pe.message + "\n" + t("payFailMsg"));
        return;
      }
      const data = await api.register(slug, userId);
      setTarget(data);
      if (slug === SLUG) setFeatured(data);
      Alert.alert(t("regDoneTitle"), t("regDoneMsg"));
    } catch (e) {
      if (e.code === "FULL") Alert.alert(t("fullTitle"), t("fullMsg"));
      else if (e.code === "DUPLICATE") Alert.alert(t("dupTitle"), t("dupMsg"));
      else Alert.alert(t("cantRegister"), e.message);
      load(slug);
    } finally {
      setBusy(false);
    }
  };

  const onRegister = () => comp && doRegister(comp.slug, setComp);

  const centerAction = () => {
    if (!featured) {
      Alert.alert(t("loadingTitle"), t("loadingMsg"));
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
      ? t("submittedTick")
      : stateMessage(featured.state) || t("regClosed");
    Alert.alert(t("joinTitle"), reason);
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
      setSubError(t("subNeedUrl"));
      return;
    }
    if (!/^https?:\/\/.+/i.test(url)) {
      setSubError(t("subInvalid"));
      return;
    }
    try {
      setBusy(true);
      const userId = await getUserId();
      const data = await api.submit(comp.slug, userId, url, "video/mp4", 50 * 1024 * 1024);
      setComp(data);
      setSubUrl("");
      Alert.alert(t("submittedTitle"), t("submittedMsg"));
    } catch (e) {
      setSubError(e.message + t("subRetry"));
    } finally {
      setBusy(false);
    }
  };

  const submitted = !!(comp && comp.registration && comp.registration.submittedAt);
  let cta;
  if (!comp) {
    cta = { label: t("loading"), sub: "", onPress: null, disabled: true };
  } else if (!comp.isRegistered) {
    if (comp.state === "registration_open") {
      cta = { label: `${t("registerNow")} • ₹${comp.entryFee} (DEMO)`, sub: "", onPress: onRegister, disabled: false };
    } else if (comp.state === "full") {
      cta = { label: t("compFull"), sub: stateMessage(comp.state), onPress: null, disabled: true };
    } else if (comp.state === "result_declared") {
      cta = { label: t("resultsAvailable"), sub: stateMessage(comp.state), onPress: null, disabled: true };
    } else {
      cta = { label: t("regClosed"), sub: stateMessage(comp.state), onPress: null, disabled: true };
    }
  } else if (submitted) {
    cta = { label: t("submittedTick"), sub: `${t("submittedTick")} ${new Date(comp.registration.submittedAt).toLocaleString()}`, onPress: null, disabled: true };
  } else if (comp.canUploadSubmission) {
    cta = { label: t("uploadSubmission"), sub: t("tapToFill"), onPress: () => subInputRef.current && subInputRef.current.focus(), disabled: false };
  } else {
    const opens = formatDateTime(comp.dates.submissionStarts);
    cta = { label: t("registered"), sub: t("subOpensOn", { d: opens.date, h: opens.time }), onPress: null, disabled: true };
  }
  const ctaDisabled = cta.disabled || busy || !cta.onPress;

  const navActive = current.name === "details" ? "competitions" : current.name;

  return (
    <KeyboardAvoidingView style={st.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="auto" />
      {current.name === "home" && (
        <HomeScreen t={t} onOpenCompetition={openCompetition} onGo={onGo} />
      )}
      {current.name === "explore" && (
        <ExploreScreen t={t} onOpenCompetition={openCompetition} />
      )}
      {current.name === "competitions" && (
        <CompetitionsScreen t={t} onOpenCompetition={openCompetition} onExplore={() => push({ name: "explore" })} />
      )}
      {current.name === "profile" && (
        <ProfileScreen t={t} lang={lang} setLang={setLang} onOpenCompetition={openCompetition} />
      )}
      {current.name === "details" && phase === "loading" && (
        <View style={st.center}><ActivityIndicator size="large" color={TEAL} /><Text style={st.muted}>{t("loading")}</Text></View>
      )}
      {current.name === "details" && phase === "error" && (
        <View style={st.center}>
          <Text style={st.errT}>{errorCode === 404 || /not found/i.test(error) ? t("errNotFound") : t("errLoad")}</Text>
          <Text style={st.muted}>{error}</Text>
          <TouchableOpacity style={st.retry} onPress={() => { setPhase("loading"); load(detailSlug); }}>
            <Text style={st.retryT}>{t("retry")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.retryGhost} onPress={navBack}>
            <Text style={st.retryGhostT}>{t("backToComp")}</Text>
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
              <Text style={st.offlineT}>{t("offline")}{error ? ` (${error})` : ""}</Text>
            </View>
          )}
          <CoverPhoto uri={comp.coverImage} title={comp.title} t={t} />
          <TitleCard c={comp} t={t} />
          <JudgeCard c={comp} t={t} onPlay={() => openVideo("Judge Intro", comp.judge.introVideoUrl)} />
          {comp.state === "registration_open" && (
            <CountdownBar ms={comp.countdown.registrationClosesInMs} t={t} onExpiry={() => load(comp.slug)} />
          )}
          {!!stateMessage(comp.state) && comp.state !== "registration_open" && (
            <View style={st.notice}><Text style={st.noticeT}>{stateMessage(comp.state)}</Text></View>
          )}
          <DatesGrid c={comp} t={t} />
          <WinnersRow c={comp} t={t} onPlay={(w) => openVideo(w.name, w.videoUrl)} />
          <InfoTabs c={comp} t={t} />
          <Rewards c={comp} t={t} />
          <View style={st.disclaimer}><Text style={st.muted}>ⓘ  <Text style={{ fontWeight: "700" }}>Disclaimer:</Text> {t("disclaimer")}</Text></View>
          <PrizeMoneyCard t={t} onPrizeVideo={() => openVideo(t("prizeTitle"), comp.prizeVideoUrl)} />
          {comp.isRegistered && (
            <View style={st.card}>
              <Text style={st.secT}>{t("yourSubmission")} {comp.canUploadSubmission ? "" : t("subOpensWith")}</Text>
              {submitted && (
                <Text style={st.submitted}>✓ {t("subDone")}{comp.registration.submissionUrl ? `: ${comp.registration.submissionUrl}` : ""}</Text>
              )}
              <TextInput
                ref={subInputRef}
                style={st.input}
                placeholder={t("subPlaceholder")}
                value={subUrl}
                onChangeText={setSubUrl}
                autoCapitalize="none"
              />
              {!!subError && <Text style={st.subErr}>{subError}</Text>}
              <TouchableOpacity style={[st.upBtn, (!comp.canUploadSubmission || busy) && st.upBtnOff]} disabled={!comp.canUploadSubmission || busy} onPress={onUpload}>
                <Text style={st.upBtnT}>{busy ? t("subUploading") : submitted ? t("subUpdate") : t("subUpload")}</Text>
              </TouchableOpacity>
              {!comp.canUploadSubmission && <Text style={st.muted}>{t("subAutoNote")}</Text>}
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
          <AdSlot t={t} />
          <View style={{ height: 190 }} />
        </ScrollView>
      )}

      <VideoModal
        visible={!!video}
        title={video ? video.title : ""}
        url={video ? video.url : ""}
        t={t}
        onClose={() => setVideo(null)}
      />
      <TestimonialsModal
        visible={reviews.visible}
        items={reviews.items}
        loading={reviews.loading}
        error={reviews.error}
        t={t}
        onRetry={openReviews}
        onClose={() => setReviews((r) => ({ ...r, visible: false }))}
      />

      <View style={st.footer}>
        {current.name === "details" && phase === "content" && comp && (
          <TouchableOpacity style={[st.cta, ctaDisabled && st.ctaOff]} disabled={ctaDisabled} onPress={cta.onPress || undefined} accessibilityRole="button" accessibilityLabel={cta.label}>
            <Text style={st.ctaT}>{busy ? t("pleaseWait") : cta.label}</Text>
            {!!cta.sub && <Text style={st.ctaS}>{cta.sub}</Text>}
          </TouchableOpacity>
        )}
        <BottomNav active={navActive} t={t} onGo={onGo} />
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
