import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { api, getUserId, readCache } from "./src/api";
import { TopBar, TitleCard, JudgeCard, CountdownBar, DatesGrid, WinnersRow, InfoTabs, Rewards, PrizeMoneyCard, ReferCard, HearFromUsers, TEAL, INK, MUTED } from "./src/components/cards";

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
  const [comp, setComp] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | error | content
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [stale, setStale] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [subUrl, setSubUrl] = useState("");
  const [subError, setSubError] = useState("");
  const [referral, setReferral] = useState(null);

  const load = useCallback(async () => {
    try {
      const userId = await getUserId();
      const data = await api.detail(userId);
      setComp(data);
      setStale(false);
      setPhase("content");
      try {
        const ref = await api.referral(userId);
        setReferral(ref);
      } catch {}
    } catch (e) {
      const cached = await readCache();
      if (cached && cached.data) {
        // Offline with previously synced server data — always labelled stale.
        setComp(cached.data);
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

  useEffect(() => { load(); }, [load]);

  const onRegister = async () => {
    try {
      setBusy(true);
      const userId = await getUserId();
      // DEMO/MOCK checkout first (backend-owned; no secrets in app).
      try {
        await api.mockCheckout(userId, comp.entryFee);
      } catch (pe) {
        Alert.alert("Payment failed (DEMO)", pe.message + "\nNo money moved. Retry when ready.");
        return;
      }
      const data = await api.register(userId);
      setComp(data);
      Alert.alert("Registered (DEMO payment)", "Your spot is booked. Mock payment — no real money moved.");
    } catch (e) {
      if (e.code === "FULL") Alert.alert("Competition full", "All spots are booked.");
      else if (e.code === "DUPLICATE") Alert.alert("Already registered", "You already hold a spot.");
      else Alert.alert("Cannot register", e.message);
      load();
    } finally {
      setBusy(false);
    }
  };

  const onUpload = async () => {
    setSubError("");
    const url = subUrl.trim() || `https://example.com/submissions/demo.mp4`;
    if (!/^https?:\/\/.+/i.test(url)) {
      setSubError("Enter a valid http(s) video URL (mp4/mov/webm).");
      return;
    }
    try {
      setBusy(true);
      const userId = await getUserId();
      const data = await api.submit(userId, url, "video/mp4", 50 * 1024 * 1024);
      setComp(data);
      setSubUrl("");
      Alert.alert("Submitted", "Your performance was recorded for judging.");
    } catch (e) {
      setSubError(e.message + " — you can retry.");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "loading") {
    return (
      <View style={st.center}><ActivityIndicator size="large" color={TEAL} /><Text style={st.muted}>Loading competition…</Text><StatusBar style="auto" /></View>
    );
  }

  if (phase === "error") {
    const notFound = errorCode === 404 || /not found/i.test(error);
    return (
      <View style={st.center}>
        <StatusBar style="auto" />
        <Text style={st.errT}>{notFound ? "Competition not found" : "Couldn't load competition"}</Text>
        <Text style={st.muted}>{error}</Text>
        <TouchableOpacity style={st.retry} onPress={() => { setPhase("loading"); load(); }}>
          <Text style={st.retryT}>Retry</Text>
        </TouchableOpacity>
        <Text style={st.muted}>Start backend: cd server && npm run dev</Text>
      </View>
    );
  }

  const cta = comp.isRegistered
    ? { label: "Upload Submission", sub: comp.registration && comp.registration.submittedAt ? `Submitted ✓ ${new Date(comp.registration.submittedAt).toLocaleString()}` : comp.canUploadSubmission ? "Tap to upload below" : "Registered", onPress: null, disabled: true }
    : { label: comp.state === "full" ? "Competition Full" : comp.state === "registration_open" ? `Register Now • ₹${comp.entryFee} (DEMO)` : "Registration Closed", sub: stateMessage(comp.state), onPress: onRegister, disabled: comp.state !== "registration_open" };

  const ctaDisabled = cta.disabled || busy || !cta.onPress;

  return (
    <KeyboardAvoidingView style={st.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={st.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <TopBar lang={lang} setLang={setLang} />
        {stale && (
          <View style={st.offline}>
            <Text style={st.offlineT}>Offline — showing last synced data{error ? `: ${error}` : ""}. Pull to retry.</Text>
          </View>
        )}
        <TitleCard c={comp} />
        <JudgeCard c={comp} onPlay={() => Alert.alert("Intro Video", "Demo: video playback not bundled. URL comes from backend judge.introVideoUrl.")} />
        {comp.state === "registration_open" && (
          <CountdownBar ms={comp.countdown.registrationClosesInMs} onExpiry={load} />
        )}
        {!!stateMessage(comp.state) && comp.state !== "registration_open" && (
          <View style={st.notice}><Text style={st.noticeT}>{stateMessage(comp.state)}</Text></View>
        )}
        <DatesGrid c={comp} />
        <WinnersRow c={comp} />
        <InfoTabs c={comp} />
        <Rewards c={comp} />
        <View style={st.disclaimer}><Text style={st.muted}>ⓘ  <Text style={{ fontWeight: "700" }}>Disclaimer:</Text> Only contributions from paid participants will be considered for judging.</Text></View>
        <PrizeMoneyCard />
        {comp.isRegistered && (
          <View style={st.card}>
            <Text style={st.secT}>Your Submission {comp.canUploadSubmission ? "" : "(opens with submission window)"}</Text>
            <TextInput
              style={st.input}
              placeholder="https://…/performance.mp4"
              value={subUrl}
              onChangeText={setSubUrl}
              autoCapitalize="none"
            />
            {!!subError && <Text style={st.subErr}>{subError}</Text>}
            <TouchableOpacity style={[st.upBtn, (!comp.canUploadSubmission || busy) && st.upBtnOff]} disabled={!comp.canUploadSubmission || busy} onPress={onUpload}>
              <Text style={st.upBtnT}>{busy ? "Uploading…" : "Upload (demo URL recorded by backend)"}</Text>
            </TouchableOpacity>
            {!comp.canUploadSubmission && <Text style={st.muted}>Upload enables automatically when the backend submission window opens.</Text>}
          </View>
        )}
        <ReferCard
          link={(comp.referral && comp.referral.link) || "https://feedants.com/r/"}
          code={referral ? referral.code : comp.referralCode}
          perSignup={(comp.referral && comp.referral.perSignupReward) || 10}
          signupCount={referral ? referral.signupCount : null}
          creditEarned={referral ? referral.creditEarned : null}
        />
        <HearFromUsers />
        <View style={st.ad}><Text style={st.muted}>📢  Ad Here</Text></View>
        <View style={{ height: 130 }} />
      </ScrollView>

      <View style={st.footer}>
        <TouchableOpacity style={[st.cta, ctaDisabled && st.ctaOff]} disabled={ctaDisabled} onPress={cta.onPress || undefined}>
          <Text style={st.ctaT}>{busy ? "Please wait…" : cta.label}</Text>
          {!!cta.sub && <Text style={st.ctaS}>{cta.sub}</Text>}
        </TouchableOpacity>
        <View style={st.nav}>
          {["Home", "Explore", "+", "Competitions", "Profile"].map((n) => (
            <Text key={n} style={[st.navT, n === "Competitions" && st.navOn]}>{n === "+" ? "⊕" : n}</Text>
          ))}
        </View>
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
  offline: { backgroundColor: "#fff4d6", padding: 8, borderRadius: 8, marginBottom: 10 },
  offlineT: { color: "#9a6b00", fontSize: 12 },
  notice: { backgroundColor: "#fff4d6", borderRadius: 10, padding: 12, marginBottom: 12 },
  noticeT: { color: INK, fontWeight: "700" },
  disclaimer: { backgroundColor: "#e8f4f5", borderRadius: 10, padding: 12, marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e6efef" },
  secT: { fontWeight: "800", color: INK, marginBottom: 8 },
  ad: { borderWidth: 1, borderColor: "#e6efef", borderRadius: 10, padding: 14, alignItems: "center", backgroundColor: "#fff" },
  input: { borderWidth: 1, borderColor: "#bfe0e4", borderRadius: 8, padding: 10, marginBottom: 8, backgroundColor: "#fff" },
  subErr: { color: "#b3261e", marginBottom: 8 },
  upBtn: { backgroundColor: TEAL, borderRadius: 8, padding: 12, alignItems: "center", marginBottom: 6 },
  upBtnOff: { backgroundColor: "#9db9bd" },
  upBtnT: { color: "#fff", fontWeight: "800" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#e6efef" },
  cta: { backgroundColor: TEAL, margin: 12, borderRadius: 10, padding: 12, alignItems: "center" },
  ctaOff: { backgroundColor: "#9db9bd" },
  ctaT: { color: "#fff", fontWeight: "800", fontSize: 16 },
  ctaS: { color: "#d7ecee", fontSize: 12 },
  nav: { flexDirection: "row", justifyContent: "space-around", paddingBottom: 18 },
  navT: { color: MUTED, fontWeight: "600" },
  navOn: { color: TEAL, fontWeight: "800" },
});
