import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Share, Image } from "react-native";
import * as Clipboard from "expo-clipboard";
import { api, getUserId, SLUG } from "./api";
import { CompetitionCard, TEAL, INK, MUTED } from "./components/cards";
import { coverFor, WINNER_PHOTOS } from "./fallbackImages";
import { formatDateTime } from "./hooks";

function ScreenState({ loading, error, empty, onRetry, loadingText, children }) {
  if (loading) {
    return (
      <View style={st.center}><ActivityIndicator size="large" color={TEAL} /><Text style={st.muted}>{loadingText || "Loading…"}</Text></View>
    );
  }
  if (error) {
    return (
      <View style={st.center}>
        <Text style={st.errT}>Couldn't load</Text>
        <Text style={st.muted}>{error}</Text>
        <TouchableOpacity style={st.retry} onPress={onRetry}>
          <Text style={st.retryT}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (empty) {
    return (
      <View style={st.emptyState}>
        <Text style={st.errT}>Nothing here yet</Text>
        <Text style={st.muted}>{empty}</Text>
      </View>
    );
  }
  return <View style={st.listWrap}>{children}</View>;
}

export function HomeScreen({ t, onOpenCompetition, onGo }) {
  const [featured, setFeatured] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const userId = await getUserId();
      const [f, all] = await Promise.all([api.detail(SLUG, userId), api.list()]);
      setFeatured(f);
      setItems(all);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const open = items.filter((c) => c.state === "registration_open");
  const closing = [...open]
    .sort((a, b) => new Date(a.dates.registerBefore) - new Date(b.dates.registerBefore))
    .slice(0, 5);
  const cats = [...new Set(items.map((c) => c.category))].slice(0, 6);
  const winners = (featured && featured.previousWinners) || [];

  return (
    <ScrollView contentContainerStyle={st.body} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={st.brand}>Feedants</Text>
      <Text style={st.hero}>{t("discover")}</Text>
      <Text style={st.sub}>{t("tagline")}</Text>
      <ScreenState loading={loading} error={error} onRetry={load} loadingText={t("loading")}>
        {open.length > 0 && (
          <View>
            <Text style={st.secT}>{t("featured")}</Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={300}
              decelerationRate="fast"
            >
              {open.slice(0, 5).map((c) => (
                <View key={c.slug} style={st.heroCard}>
                  <CompetitionCard item={c} t={t} onOpen={() => onOpenCompetition(c.slug)} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        {closing.length > 0 && (
          <View>
            <Text style={st.secT}>{t("closingSoon")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {closing.map((c) => (
                <View key={c.slug} style={st.railCard}>
                  <CompetitionCard item={c} t={t} onOpen={() => onOpenCompetition(c.slug)} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        {cats.length > 0 && (
          <View>
            <Text style={st.secT}>{t("browseByCat")}</Text>
            <View style={st.catGrid}>
              {cats.map((cat) => {
                const n = items.filter((c) => c.category === cat).length;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={st.catCard}
                    onPress={() => onGo("explore")}
                    accessibilityRole="button"
                    accessibilityLabel={cat}
                  >
                    <Image source={coverFor(cat)} style={st.catImg} resizeMode="cover" />
                    <Text style={st.catName}>{cat}</Text>
                    <Text style={st.muted}>{n} {n === 1 ? "event" : "events"}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        {winners.length > 0 && (
          <View>
            <Text style={st.secT}>{t("meetWinners")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {winners.map((w, i) => (
                <WinnerMini key={`${w.name}-${i}`} w={w} fb={WINNER_PHOTOS[i % WINNER_PHOTOS.length]} onOpen={() => onOpenCompetition(featured.slug)} />
              ))}
            </ScrollView>
          </View>
        )}
        <Text style={st.secT}>{t("howItWorks")}</Text>
        <View style={st.steps}>
          {[[t("step1T"), t("step1S")], [t("step2T"), t("step2S")], [t("step3T"), t("step3S")]].map(([title, sub], i) => (
            <View key={i} style={st.step}>
              <View style={st.stepNum}><Text style={st.stepNumT}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={st.stepT}>{title}</Text>
                <Text style={st.muted}>{sub}</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={st.referBanner} onPress={() => onOpenCompetition(SLUG)} accessibilityRole="button" accessibilityLabel={t("referTitle")}>
          <Text style={st.referBannerT}>📢 {t("referTitle")}</Text>
          <Text style={st.referBannerS}>{t("referBannerSub")}</Text>
        </TouchableOpacity>
      </ScreenState>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function WinnerMini({ w, fb, onOpen }) {
  const [failed, setFailed] = useState(false);
  return (
    <TouchableOpacity style={st.mini} onPress={onOpen} accessibilityRole="button" accessibilityLabel={w.name}>
      {w.thumbnailUrl && !failed ? (
        <Image source={{ uri: w.thumbnailUrl }} style={st.miniImg} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <Image source={fb} style={st.miniImg} resizeMode="cover" />
      )}
      <Text style={st.miniN} numberOfLines={1}>{w.name}</Text>
      <Text style={st.miniR}>{w.rankLabel}</Text>
    </TouchableOpacity>
  );
}

const ALL_CATS = ["Dance", "Music", "Art", "Photography", "Writing"];

export function ExploreScreen({ t, onOpenCompetition }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      setItems(await api.list());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const q = query.trim().toLowerCase();
  const matchQ = (c) => !q || c.title.toLowerCase().includes(q);
  const matchC = (c) => !cat || c.category === cat;
  const open = items.filter((c) => c.state === "registration_open");
  const closingSoon = [...open]
    .sort((a, b) => new Date(a.dates.registerBefore) - new Date(b.dates.registerBefore))
    .slice(0, 3);
  const recent = [...items]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);
  const browse = items.filter((c) => matchQ(c) && matchC(c));
  const cats = [ ...new Set([...ALL_CATS, ...items.map((c) => c.category)]) ];

  return (
    <ScrollView contentContainerStyle={st.body} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={st.hero}>{t("explore")}</Text>
      <TextInput
        style={st.search}
        placeholder={t("searchPh")}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />
      <ScreenState
        loading={loading}
        error={error}
        onRetry={load}
        loadingText={t("loading")}
        empty={items.length === 0 ? t("nonePublished") : ""}
      >
        <Text style={st.secT}>{t("featured")}</Text>
        {open.slice(0, 1).map((c) => (
          <CompetitionCard key={c.slug} item={c} t={t} onOpen={() => onOpenCompetition(c.slug)} />
        ))}
        <Text style={st.secT}>{t("closingSoon")}</Text>
        {closingSoon.map((c) => (
          <CompetitionCard key={c.slug} item={c} t={t} onOpen={() => onOpenCompetition(c.slug)} />
        ))}
        <Text style={st.secT}>{t("recentlyAdded")}</Text>
        {recent.map((c) => (
          <CompetitionCard key={c.slug} item={c} t={t} onOpen={() => onOpenCompetition(c.slug)} />
        ))}
        <Text style={st.secT}>{t("browseByCat")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chips}>
          {[{ k: "", l: t("fAll") }, ...cats.map((c) => ({ k: c, l: c }))].map((chip) => (
            <TouchableOpacity
              key={chip.k || "all"}
              style={[st.chip, cat === chip.k && st.chipOn]}
              onPress={() => setCat(chip.k)}
              accessibilityRole="button"
              accessibilityState={{ selected: cat === chip.k }}
            >
              <Text style={[st.chipT, cat === chip.k && st.chipTOn]}>{chip.l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {browse.length === 0 && <Text style={st.muted}>{t("noMatch")}</Text>}
        {browse.map((c) => (
          <CompetitionCard key={`b-${c.slug}`} item={c} t={t} onOpen={() => onOpenCompetition(c.slug)} />
        ))}
      </ScreenState>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const PART_FILTERS = ["all", "registered", "submitting", "submitted", "completed"];

function RemoteCover({ uri, category, style }) {
  const [failed, setFailed] = useState(false);
  const src = uri && !failed ? { uri } : coverFor(category);
  return (
    <Image
      source={src}
      style={style}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

function PartCard({ c, t, action, onOpen }) {
  return (
    <TouchableOpacity style={st.partCard} onPress={onOpen} accessibilityRole="button" accessibilityLabel={c.title}>
      <RemoteCover uri={c.coverImage} category={c.category} style={st.partCover} />
      <Text style={st.partTitle}>{c.title}</Text>
      <Text style={st.partMeta}>{c.category} • {c.state}</Text>
      <Text style={st.partMeta}>
        {t("registerBefore")}: {formatDateTime(c.dates.registerBefore).date}
      </Text>
      <TouchableOpacity style={st.partBtn} onPress={onOpen}>
        <Text style={st.partBtnT}>{action} →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function partOf(m) {
  // m: { competition, status, submissionUrl, submittedAt }
  if (m.status !== "registered") return "completed";
  if (m.submittedAt) return "submitted";
  const st8 = m.competition && m.competition.state;
  if (st8 === "submission_open") return "submitting";
  if (st8 === "result_declared" || st8 === "submission_closed" || st8 === "cancelled") return "completed";
  return "registered";
}

export function CompetitionsScreen({ t, onOpenCompetition, onExplore }) {
  const [items, setItems] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const userId = await getUserId();
      const [all, my] = await Promise.all([api.list(), api.mine(userId)]);
      setItems(all);
      setMine(my);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const partBySlug = {};
  for (const m of mine) {
    if (m.competition && m.competition.slug) partBySlug[m.competition.slug] = m;
  }

  const shown = items
    .map((c) => ({ c, m: partBySlug[c.slug] || null }))
    .filter(({ m }) => filter === "all" || (m ? partOf(m) === filter : false));

  const chipsRow = { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 8 };
  const chip = {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eef3f4",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    flexGrow: 0,
    flexShrink: 0,
    marginRight: 8,
  };
  const chipOn = { backgroundColor: TEAL };
  const chipT = { color: INK, fontWeight: "600", fontSize: 13 };
  const chipTOn = { color: "#fff" };

  return (
    <ScrollView contentContainerStyle={st.body} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={st.hero}>{t("competitions")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipsRow}>
        {PART_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[chip, filter === f && chipOn]}
            onPress={() => setFilter(f)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === f }}
          >
            <Text style={[chipT, filter === f && chipTOn]}>{t("f" + f[0].toUpperCase() + f.slice(1))}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScreenState
        loading={loading}
        error={error}
        onRetry={load}
        loadingText={t("loading")}
        empty={items.length === 0 ? t("nonePublished") : shown.length === 0 ? t("noMatch") : ""}
      >
        {items.length === 0 ? (
          <TouchableOpacity style={st.retry} onPress={onExplore} accessibilityRole="button" accessibilityLabel={t("exploreBtn")}>
            <Text style={st.retryT}>{t("exploreBtn")}</Text>
          </TouchableOpacity>
        ) : (
          shown.map(({ c, m }) => {
            const action = m
              ? m.submittedAt
                ? t("viewSubmission")
                : c.canUploadSubmission
                  ? t("continueSubmission")
                  : t("viewCompetition")
              : c.canRegister
                ? t("registerNow")
                : t("viewCompetition");
            return (
              <PartCard key={String(c.id || c.slug)} c={c} t={t} action={action} onOpen={() => onOpenCompetition(c.slug)} />
            );
          })
        )}
      </ScreenState>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

export function ProfileScreen({ t, lang, setLang, onOpenCompetition, onExplore }) {
  const [userId, setUserId] = useState("");
  const [mine, setMine] = useState([]);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [info, setInfo] = useState(null); // { title, text } | null

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const id = await getUserId();
      setUserId(id);
      setMine(await api.mine(id));
      setReferral(await api.referral(SLUG, id).catch(() => null));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const registered = mine.filter((m) => m.status === "registered");
  const submissions = mine.filter((m) => m.submittedAt);
  const inProgress = mine.filter((m) => m.status === "registered" && !m.submittedAt);
  const results = mine.filter((m) => m.competition && m.competition.state === "result_declared");

  const copyCode = async () => {
    if (!referral) return;
    try {
      await Clipboard.setStringAsync(referral.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  const shareCode = async () => {
    if (!referral) return;
    try {
      await Share.share({ message: `Join me on Feedants with code ${referral.code}! https://feedants.com/r/${referral.code}` });
    } catch {}
  };

  return (
    <ScrollView contentContainerStyle={st.body} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={st.hero}>{t("profile")}</Text>
      <View style={st.whoRow}>
        <View style={st.bigAvatar}><Text style={{ fontSize: 30, color: TEAL, fontWeight: "800" }}>{(userId || "U").slice(0, 1).toUpperCase()}</Text></View>
        <View>
          <Text style={st.whoName}>{t("demoParticipant")}</Text>
          <Text style={st.muted}>{t("demoAccount")}</Text>
        </View>
      </View>
      <ScreenState loading={loading} error={error} onRetry={load} loadingText={t("loading")}>
        <View style={st.card}>
          <Text style={st.lbl}>{t("demoUserId")}</Text>
          <Text style={st.val} numberOfLines={1}>{userId}</Text>
        </View>
        <View style={st.sumRow}>
          {[[t("statRegistered"), registered.length], [t("statSubmissions"), submissions.length], [t("statInProgress"), inProgress.length], [t("statResults"), results.length]].map(([l, n]) => (
            <View key={l} style={st.sum}>
              <Text style={st.sumN}>{n}</Text>
              <Text style={st.sumL}>{l}</Text>
            </View>
          ))}
        </View>
        <Text style={st.secT}>{t("myCompetitions")}</Text>
        {registered.length === 0 && <Text style={st.muted}>{t("emptyJoin")}</Text>}
        {registered.map((m) => (
          <TouchableOpacity key={String(m.competition.id)} style={st.partCard} onPress={() => onOpenCompetition(m.competition.slug)}>
            <Text style={st.partTitle}>{m.competition.title}</Text>
            <Text style={st.partMeta}>{m.competition.state} • {t("registerBefore")}: {formatDateTime(m.competition.dates.registerBefore).date}</Text>
            <Text style={st.partBtnT}>{m.submittedAt ? t("viewSubmission") : m.competition.canUploadSubmission ? t("continueSubmission") : t("viewCompetition")} →</Text>
          </TouchableOpacity>
        ))}
        <Text style={st.secT}>{t("mySubmissions")}</Text>
        {submissions.length === 0 && <Text style={st.muted}>—</Text>}
        {submissions.map((m) => (
          <View key={String(m.competition.id)} style={st.partCard}>
            <Text style={st.partTitle}>{m.competition.title}</Text>
            <Text style={st.muted} numberOfLines={1}>{m.submissionUrl}</Text>
            <Text style={st.muted}>{new Date(m.submittedAt).toLocaleString()}</Text>
          </View>
        ))}
        {referral && (
          <View style={st.card}>
            <Text style={st.secT}>{t("myReferral")}</Text>
            <Text style={st.val}>{referral.code}</Text>
            <Text style={st.muted}>{referral.signupCount} {t("referrals")} • ₹{referral.creditEarned}</Text>
            <View style={st.btnRow}>
              <TouchableOpacity style={st.smallBtn} onPress={copyCode} accessibilityRole="button" accessibilityLabel={t("copyCode")}>
                <Text style={st.smallBtnT}>{copied ? t("copied") : t("copyCode")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.smallBtn} onPress={shareCode} accessibilityRole="button" accessibilityLabel={t("share")}>
                <Text style={st.smallBtnT}>{t("share")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <Text style={st.secT}>{t("settings")}</Text>
        <View style={st.card}>
          <View style={st.setRow}>
            <Text style={st.setLbl}>{t("language")}</Text>
            <View style={st.langWrap}>
              {["ENG", "हिंदी"].map((l) => (
                <TouchableOpacity key={l} onPress={() => setLang(l)} style={[st.lang, lang === l && st.langOn]} accessibilityRole="button" accessibilityLabel={l}>
                  <Text style={[st.langT, lang === l && st.langTOn]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={st.setRow} onPress={() => setInfo({ title: t("aboutApp"), text: t("aboutText") })}>
            <Text style={st.setLbl}>{t("aboutApp")}</Text><Text>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.setRow} onPress={() => setInfo({ title: t("help"), text: t("helpText") })}>
            <Text style={st.setLbl}>{t("help")}</Text><Text>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.setRow} onPress={() => setInfo({ title: t("demoUserId"), text: t("demoAccount") })}>
            <Text style={st.setLbl}>{t("demoUserId")}</Text><Text>›</Text>
          </TouchableOpacity>
          {!!info && (
            <View style={st.infoBox}>
              <Text style={st.partTitle}>{info.title}</Text>
              <Text style={st.muted}>{info.text}</Text>
              <TouchableOpacity onPress={() => setInfo(null)}><Text style={st.closeInfo}>{t("close")} ✕</Text></TouchableOpacity>
            </View>
          )}
        </View>
      </ScreenState>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  body: { padding: 14, paddingTop: 48, flexGrow: 1 },
  brand: { fontSize: 13, fontWeight: "800", color: TEAL, letterSpacing: 2 },
  hero: { fontSize: 24, fontWeight: "800", color: INK },
  sub: { color: MUTED, fontSize: 13, marginBottom: 12 },
  secT: { fontWeight: "800", color: INK, marginVertical: 8 },
  center: { alignItems: "center", padding: 32, gap: 10 },
  emptyState: { alignItems: "center", paddingTop: 28, paddingBottom: 24, gap: 8 },
  listWrap: { flexGrow: 0, alignItems: "stretch", justifyContent: "flex-start" },
  muted: { color: MUTED, fontSize: 13 },
  errT: { fontSize: 17, fontWeight: "800", color: INK },
  retry: { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 8 },
  retryT: { color: "#fff", fontWeight: "800" },
  quickRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  heroCard: { width: 300, marginRight: 4 },
  railCard: { width: 260, marginRight: 4 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: { width: "48%", backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#e6efef", overflow: "hidden", marginBottom: 2 },
  catImg: { width: "100%", height: 64 },
  catName: { fontWeight: "800", color: INK, fontSize: 12, paddingHorizontal: 8, paddingTop: 6 },
  catCount: { color: MUTED, fontSize: 11, paddingHorizontal: 8, paddingBottom: 8, paddingTop: 2 },
  mini: { width: 110, marginRight: 12 },
  miniImg: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#dfe9ea" },
  miniN: { fontWeight: "700", color: INK, fontSize: 12, marginTop: 4, textAlign: "center" },
  miniR: { color: TEAL, fontSize: 11, textAlign: "center" },
  steps: { gap: 8, marginBottom: 4 },
  step: { flexDirection: "row", gap: 10, backgroundColor: "#fff", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#e6efef", alignItems: "center" },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: TEAL, alignItems: "center", justifyContent: "center" },
  stepNumT: { color: "#fff", fontWeight: "800" },
  stepT: { fontWeight: "800", color: INK },
  referBanner: { backgroundColor: "#e7f6ec", borderRadius: 12, padding: 14, marginTop: 8 },
  referBannerT: { fontWeight: "800", color: INK, fontSize: 15 },
  referBannerS: { color: MUTED, fontSize: 13, marginTop: 2 },
  search: { backgroundColor: "#fff", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#e6efef", marginBottom: 4 },
  chips: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 8 },
  chip: { height: 40, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#eef3f4", alignItems: "center", justifyContent: "center", alignSelf: "flex-start", flexGrow: 0, flexShrink: 0, marginRight: 8 },
  chipOn: { backgroundColor: TEAL },
  chipT: { color: INK, fontWeight: "600", fontSize: 13 },
  chipTOn: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e6efef" },
  lbl: { color: MUTED, fontSize: 12 },
  val: { color: INK, fontWeight: "800", fontSize: 15 },
  partCard: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#e6efef", overflow: "hidden", padding: 12 },
  partCover: { width: "100%", height: 120, borderRadius: 8, backgroundColor: "#dfe9ea", marginBottom: 8 },
  partTitle: { fontWeight: "800", color: INK, fontSize: 15, flexShrink: 1 },
  partMeta: { color: MUTED, fontSize: 13, flexShrink: 1 },
  partBtn: { marginTop: 8, alignSelf: "flex-start", backgroundColor: "#e8f4f5", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  partBtnT: { color: TEAL, fontWeight: "700" },
  whoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  bigAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#e8f4f5", alignItems: "center", justifyContent: "center" },
  whoName: { fontSize: 18, fontWeight: "800", color: INK },
  sumRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  sum: { flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#e6efef", alignItems: "center" },
  sumN: { fontSize: 20, fontWeight: "800", color: TEAL },
  sumL: { fontSize: 11, color: MUTED, textAlign: "center" },
  btnRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  smallBtn: { borderWidth: 1, borderColor: TEAL, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  smallBtnT: { color: TEAL, fontWeight: "700" },
  setRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f0f4f4" },
  setLbl: { color: INK, fontWeight: "600" },
  langWrap: { flexDirection: "row", backgroundColor: "#eef3f4", borderRadius: 16, padding: 2 },
  lang: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, minHeight: 32, lineHeight: 20, alignItems: "center", justifyContent: "center" },
  langOn: { backgroundColor: TEAL },
  langT: { color: INK, fontWeight: "700", fontSize: 13, lineHeight: 20 },
  langTOn: { color: "#fff" },
  infoBox: { backgroundColor: "#f6fafa", borderRadius: 8, padding: 10, marginTop: 8 },
  closeInfo: { color: TEAL, fontWeight: "700", marginTop: 6 },
});
