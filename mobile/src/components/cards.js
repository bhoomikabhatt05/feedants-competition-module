import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Modal, ActivityIndicator, Image } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEventListener } from "expo";
import { formatMs, useCountdown, formatDateTime } from "../hooks";

export const TEAL = "#0e7482";
export const INK = "#0b2b33";
export const MUTED = "#6b8a91";

export function TopBar({ lang, setLang, t, onBack }) {
  return (
    <View style={s.topRow}>
      <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back" style={s.backBtn}>
        <Text style={s.back}>←  {t("back")}</Text>
      </TouchableOpacity>
      <View style={s.langWrap}>
        {["ENG", "हिंदी"].map((l) => (
          <TouchableOpacity key={l} onPress={() => setLang(l)} accessibilityRole="button" accessibilityLabel={l} style={[s.lang, lang === l && s.langOn]}>
            <Text style={[s.langT, lang === l && s.langTOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function CoverPhoto({ uri, title }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[s.cover, s.coverFallback]}>
        <Text style={s.coverFallbackT}>🎭  {title}</Text>
      </View>
    );
  }
  return (
    <Image source={{ uri }} style={s.cover} resizeMode="cover" onError={() => setFailed(true)} accessibilityLabel="Competition cover" />
  );
}

export function TitleCard({ c, t }) {
  return (
    <View style={s.card}>
      <View style={s.rowBetween}>
        <Text style={s.title}>{c.title}</Text>
        {c.isRegistered ? (
          <View style={s.regBadge}><Text style={s.regBadgeT}>✓ Registered</Text></View>
        ) : null}
      </View>
      <View style={s.chipRow}>
        <View style={s.chip}><Text style={s.chipT}>{c.category}</Text></View>
        <View style={s.chip}><Text style={s.chipT}>{c.format}</Text></View>
        <Text style={s.cert}>🏆  {c.certificateNote}</Text>
      </View>
      <View style={s.statsRow}>
        <View style={s.statCol}><Text style={s.lbl}>{t("prizePool")}</Text><Text style={s.prize}>₹ {Number(c.prizePool).toLocaleString("en-IN")}</Text></View>
        <View style={s.statCol}><Text style={s.lbl}>{t("entryFee")}</Text><Text style={s.fee}>₹ {c.entryFee}</Text></View>
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={s.spots}>👥  {t("spotsLeft", { n: c.spotsLeft })}</Text>
          <View style={s.bar}><View style={[s.barFill, { width: `${Math.min(100, (c.bookedSpots / Math.max(1, c.capacity)) * 100)}%` }]} /></View>
          <Text style={s.booked}>{t("booked", { a: c.bookedSpots, b: c.capacity })}</Text>
        </View>
      </View>
    </View>
  );
}

export function JudgeCard({ c, t, onPlay }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <View style={s.card}>
      <View style={s.row}>
        {c.judge.avatarUrl && !imgFailed ? (
          <Image source={{ uri: c.judge.avatarUrl }} style={s.avatarImg} onError={() => setImgFailed(true)} />
        ) : (
          <View style={s.avatar}><Text style={{ fontSize: 28 }}>👩🏽</Text></View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.lbl}>{t("judge")}</Text>
          <Text style={s.judgeName}>{c.judge.name}</Text>
          <Text style={s.muted}>{c.judge.bio}</Text>
          <Text style={s.muted}>{c.judge.experience}</Text>
          <Text style={s.demoMini}>{t("demoPhoto")}</Text>
        </View>
        <TouchableOpacity style={{ alignItems: "center" }} onPress={onPlay} accessibilityRole="button" accessibilityLabel={t("introVideo")}>
          <View style={s.play}><Text style={{ color: TEAL }}>▶</Text></View>
          <Text style={s.muted}>{t("introVideo")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function CountdownBar({ ms, t, onExpiry }) {
  const left = useCountdown(ms, onExpiry);
  return (
    <View style={s.countBar}>
      <View style={s.countRow}>
        <Text>⏳</Text>
        <Text style={s.countLbl}>{t("regClosesIn")}</Text>
        <Text style={s.hurry}>⏱ {t("hurry")}</Text>
      </View>
      <Text style={s.countT}>{formatMs(left)}</Text>
    </View>
  );
}

export function DatesGrid({ c, t }) {
  const cells = [
    [t("registerBefore"), c.dates.registerBefore],
    [t("submissionStarts"), c.dates.submissionStarts],
    [t("submissionEnds"), c.dates.submissionEnds],
    [t("resultDate"), c.dates.resultDate],
  ];
  return (
    <View style={s.card}>
      <Text style={s.secT}>{t("importantDates")}</Text>
      <View style={s.grid}>
        {cells.map(([label, iso]) => {
          const { date, time } = formatDateTime(iso);
          return (
            <View key={label} style={s.cell}>
              <Text style={s.lbl}>{label}</Text>
              <Text style={s.cellD}>{date}</Text>
              <Text style={s.cellD}>{time}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function WinnersRow({ c, t, onPlay }) {
  return (
    <View style={s.card}>
      <Text style={s.secT}>{t("previousWinners")}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(c.previousWinners || []).length === 0 && (
          <Text style={s.muted}>{t("winnersSoon")}</Text>
        )}
        {(c.previousWinners || []).map((w, i) => (
          <WinnerThumb key={i} w={w} onPlay={onPlay} />
        ))}
      </ScrollView>
    </View>
  );
}

function WinnerThumb({ w, onPlay }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={s.win}>
      <TouchableOpacity
        style={s.thumbBtn}
        onPress={() => onPlay && onPlay(w)}
        accessibilityRole="button"
        accessibilityLabel={`Play video by ${w.name}`}
      >
        {w.thumbnailUrl && !failed ? (
          <Image source={{ uri: w.thumbnailUrl }} style={s.thumb} resizeMode="cover" onError={() => setFailed(true)} />
        ) : (
          <View style={[s.thumb, s.thumbFallback]} />
        )}
        <View style={s.winPlay}><Text style={{ color: "#fff", fontSize: 10 }}>▶</Text></View>
      </TouchableOpacity>
      <Text style={s.winN} numberOfLines={1}>{w.name}</Text>
      <Text style={s.winR}>{w.rankLabel}</Text>
    </View>
  );
}

export function InfoTabs({ c, t }) {
  const [tab, setTab] = useState("about");
  const [more, setMore] = useState(false);
  const tabs = [["about", t("about")], ["judge", t("judging")], ["rules", t("rules")]];
  return (
    <View style={s.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
        {tabs.map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
            <Text style={[s.tab, tab === k && s.tabOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {tab === "about" && (
        <Text style={s.muted}>{c.about}{more ? c.aboutMore : ""}{" "}
          <Text style={s.link} onPress={() => setMore(!more)}>{more ? t("viewLess") : t("viewMore")}</Text>
        </Text>
      )}
      {tab === "judge" && (c.judgingParameters || []).map((p, i) => (
        <View key={i} style={s.param}>
          <Text style={s.paramName}>
            {typeof p === "string" ? p : p.name}{typeof p !== "string" && p.weight != null ? ` — ${p.weight}%` : ""}
          </Text>
          {typeof p !== "string" && !!p.description && <Text style={s.muted}>{p.description}</Text>}
        </View>
      ))}
      {tab === "rules" && (c.rules || []).map((p, i) => <Text key={i} style={s.muted}>• {p}</Text>)}
    </View>
  );
}

export function Rewards({ c, t }) {
  return (
    <View style={s.card}>
      <Text style={s.secT}>{t("rewards")} <Text style={s.muted}>(All Positions)</Text></Text>
      {(c.rewards || []).map((r) => (
        <View key={r.position} style={s.rwRow}>
          <Text>🏆  {r.label}</Text>
          <Text style={s.rwAmt}>₹ {r.amount}</Text>
        </View>
      ))}
    </View>
  );
}

export function PrizeMoneyCard({ t, onPrizeVideo }) {
  return (
    <View style={s.row2}>
      <TouchableOpacity style={[s.card, { flex: 1 }]} onPress={onPrizeVideo} accessibilityRole="button" accessibilityLabel={t("prizeTitle")}>
        <Text style={s.secT}>▶  {t("prizeTitle")}</Text>
        <Text style={s.muted}>{t("prizeSub")}</Text>
      </TouchableOpacity>
      <View style={[s.card, { flex: 1 }]}>
        <Text style={s.secT}>🛡 {t("refundTitle")}</Text>
        <Text style={s.muted}>🛡 {t("secureBy")}</Text>
        <Text style={{ fontWeight: "800", color: INK }}>Razorpay <Text style={s.demoTag}>DEMO/MOCK</Text></Text>
        <Text style={s.muted}>No secrets in app — backend verifies.</Text>
      </View>
    </View>
  );
}

export function ReferCard({ link, code, perSignup, signupCount, creditEarned, onRefer, onShare, t }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const copy = async () => {
    setCopyError("");
    try {
      await Clipboard.setStringAsync(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyError(t("copyFail"));
    }
  };
  const share = async () => {
    if (onShare) return onShare();
    try {
      await Share.share({ message: `Join me on Feedants! ${link}` });
    } catch {}
  };
  return (
    <View style={[s.card, { backgroundColor: "#e7f6ec" }]}>
      <Text style={s.secT}>📢 {t("referTitle")}</Text>
      <Text style={s.linkBox} numberOfLines={1}>{link}</Text>
      {!!code && <Text style={s.muted}>Your backend code: <Text style={{ fontWeight: "800", color: INK }}>{code}</Text></Text>}
      {!!copyError && <Text style={s.copyErr}>{copyError}</Text>}
      <View style={s.btnRow}>
        <TouchableOpacity style={s.copyBtn} onPress={copy} accessibilityRole="button" accessibilityLabel={t("copyLink")}>
          <Text style={s.copyT}>{copied ? t("copied") : t("copyLink")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.copyBtn} onPress={share} accessibilityRole="button" accessibilityLabel={t("share")}>
          <Text style={s.copyT}>{t("share")}</Text>
        </TouchableOpacity>
        <View style={s.referCta}>
          <TouchableOpacity style={s.referBtn} onPress={onRefer} accessibilityRole="button" accessibilityLabel={t("referNow")}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{t("referNow")}</Text>
          </TouchableOpacity>
          <Text style={s.muted}>You earn ₹{perSignup} per real signup{signupCount != null ? ` • ${signupCount} so far (₹${creditEarned})` : ""}</Text>
        </View>
      </View>
      <Text style={s.muted}>Reward is credited only when a referred user completes registration — never on link click.</Text>
    </View>
  );
}

export function HearFromUsers({ onPress, t }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} accessibilityRole="button" accessibilityLabel={t("hearTitle")}>
      <View style={s.rowBetween}>
        <View>
          <Text style={s.secT}>💬 {t("hearTitle")}</Text>
          <Text style={s.muted}>{t("hearSub")}</Text>
        </View>
        <Text style={{ fontSize: 18 }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function PlayerView({ url, t }) {
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const player = useVideoPlayer({ uri: url }, (p) => {
    p.play();
  });
  useEventListener(player, "playingChange", (e) => setPlaying(!!e.isPlaying));
  useEventListener(player, "statusChange", (e) => setStatus(e.status || "readyToPlay"));
  const toggle = () => {
    if (playing) player.pause();
    else player.play();
  };
  if (status === "error") {
    return (
      <View style={s.centerBox}>
        <Text style={s.copyErr}>{t("videoFail")}</Text>
        <TouchableOpacity
          style={s.retryBtn}
          onPress={() => { setStatus("loading"); setAttempt((a) => a + 1); }}
          accessibilityRole="button"
          accessibilityLabel={t("retry")}
        >
          <Text style={s.retryT}>{t("retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View key={attempt}>
      <View>
        <VideoView style={s.video} player={player} nativeControls contentFit="contain" allowsPictureInPicture />
        {status !== "readyToPlay" && (
          <View style={s.videoLoading}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
      <View style={s.videoBtns}>
        <TouchableOpacity style={s.playToggle} onPress={toggle} accessibilityRole="button" accessibilityLabel={playing ? t("pause") : t("play")}>
          <Text style={s.playToggleT}>{playing ? `❚❚  ${t("pause")}` : `▶  ${t("play")}`}</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.muted}>{t("demoVideoNote")}</Text>
    </View>
  );
}

export function VideoModal({ visible, title, url, t, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.rowBetween}>
            <Text style={s.secT}>{title || "Video"}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel={t("close")}>
              <Text style={s.closeT}>✕ {t("close")}</Text>
            </TouchableOpacity>
          </View>
          {!url || !/^https?:\/\/.+/i.test(url) ? (
            <View style={s.unavail}>
              <Text style={s.unavailT}>{t("videoUnavailable")}</Text>
              <Text style={s.muted}>{t("videoUnavailableSub")}</Text>
            </View>
          ) : (
            <PlayerView url={url} t={t} />
          )}
        </View>
      </View>
    </Modal>
  );
}

export function TestimonialsModal({ visible, items, loading, error, t, onRetry, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.rowBetween}>
            <Text style={s.secT}>💬 {t("hearTitle")}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose} accessibilityRole="button" accessibilityLabel={t("close")}>
              <Text style={s.closeT}>✕ {t("close")}</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={s.centerBox}><ActivityIndicator size="large" color={TEAL} /><Text style={s.muted}>{t("reviewsLoading")}</Text></View>
          )}
          {!loading && !!error && (
            <View style={s.centerBox}>
              <Text style={s.copyErr}>{error}</Text>
              <TouchableOpacity style={s.retryBtn} onPress={onRetry} accessibilityRole="button" accessibilityLabel={t("retry")}>
                <Text style={s.retryT}>{t("retry")}</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loading && !error && (items || []).length === 0 && (
            <Text style={s.muted}>{t("noReviews")}</Text>
          )}
          {!loading && !error && (items || []).length > 0 && (
            <ScrollView style={s.quoteList} showsVerticalScrollIndicator={false}>
              {(items || []).map((t2, i) => (
                <View key={i} style={s.quote}>
                  <Text style={s.stars}>{"★".repeat(t2.rating || 5)}{"☆".repeat(5 - (t2.rating || 5))}</Text>
                  <Text style={s.quoteT}>"{t2.text}"</Text>
                  <Text style={s.muted}>— {t2.name}{t2.isDemo ? ` · ${t("sampleReview")}` : ""}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

export function AdSlot({ t }) {
  return (
    <View style={s.adSlot}>
      <Text style={s.adSlotT}>{t("adTitle")}</Text>
      <Text style={s.adSlotS}>{t("adSub")}</Text>
    </View>
  );
}

const NAV_DEFS = [
  { key: "home", icon: "⌂", labelKey: "home" },
  { key: "explore", icon: "🔍", labelKey: "explore" },
  { key: "action", icon: "⊕", labelKey: "join" },
  { key: "competitions", icon: "🏆", labelKey: "competitions" },
  { key: "profile", icon: "👤", labelKey: "profile" },
];

export function BottomNav({ active, t, onGo }) {
  return (
    <View style={s.navBar}>
      {NAV_DEFS.map((n) => {
        const on = active === n.key;
        return (
          <TouchableOpacity
            key={n.key}
            style={s.navItem}
            onPress={() => onGo(n.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t(n.labelKey)}
          >
            <Text style={[s.navIcon, on && s.navOn]}>{n.icon}</Text>
            <Text style={[s.navT, on && s.navOn]}>{t(n.labelKey)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function stateBadge(state) {
  switch (state) {
    case "registration_open": return "Open";
    case "full": return "Full";
    case "registration_closed": return "Closed";
    case "submission_open": return "Submitting";
    case "submission_closed": return "Judging";
    case "result_declared": return "Results";
    default: return state;
  }
}

export function CompetitionCard({ item, t, onOpen }) {
  const [failed, setFailed] = useState(false);
  return (
    <TouchableOpacity
      style={s.compCard}
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
    >
      {item.coverImage && !failed ? (
        <Image source={{ uri: item.coverImage }} style={s.compCover} resizeMode="cover" onError={() => setFailed(true)} />
      ) : (
        <View style={[s.compCover, s.coverFallback]}><Text style={s.coverFallbackT}>🎭</Text></View>
      )}
      <View style={s.compBody}>
        <View style={s.rowBetween}>
          <Text style={s.compTitle} numberOfLines={1}>{item.title}</Text>
          <View style={s.stateBadge}><Text style={s.stateBadgeT}>{stateBadge(item.state)}</Text></View>
        </View>
        <Text style={s.muted}>{item.category} • {item.format}</Text>
        <View style={s.compStats}>
          <Text style={s.compPrize}>₹ {Number(item.prizePool).toLocaleString("en-IN")}</Text>
          <Text style={s.muted}>₹{item.entryFee} {t("entryFee").toLowerCase()}</Text>
          <Text style={s.spots}>{t("spotsLeft", { n: item.spotsLeft })}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  back: { fontSize: 16, fontWeight: "700", color: INK },
  langWrap: { flexDirection: "row", backgroundColor: "#eef3f4", borderRadius: 16, padding: 2 },
  lang: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
  langOn: { backgroundColor: TEAL },
  langT: { color: INK, fontWeight: "700" },
  langTOn: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e6efef" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  row2: { flexDirection: "row", gap: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800", color: INK, flex: 1 },
  regBadge: { backgroundColor: "#e8f4f5", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "#bfe0e4", marginLeft: 8, flexShrink: 0 },
  regBadgeT: { color: TEAL, fontWeight: "700" },
  chipRow: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 },
  chip: { backgroundColor: "#f1f5f6", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  chipT: { fontWeight: "600", color: INK },
  cert: { color: TEAL, fontWeight: "600" },
  statsRow: { flexDirection: "row", alignItems: "flex-end", gap: 16, marginTop: 4 },
  statCol: { flexShrink: 0 },
  lbl: { color: MUTED, fontSize: 12 },
  prize: { color: TEAL, fontSize: 26, fontWeight: "800" },
  fee: { color: INK, fontSize: 22, fontWeight: "800" },
  spots: { color: TEAL, fontWeight: "700", fontSize: 12 },
  bar: { height: 6, backgroundColor: "#d7e9eb", borderRadius: 4, marginVertical: 6 },
  barFill: { height: 6, backgroundColor: TEAL, borderRadius: 4 },
  booked: { color: MUTED, fontSize: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#f3e2d3", alignItems: "center", justifyContent: "center" },
  judgeName: { fontWeight: "800", fontSize: 16, color: INK },
  muted: { color: MUTED, fontSize: 13 },
  play: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e8f4f5", alignItems: "center", justifyContent: "center" },
  countBar: { backgroundColor: "#e8f4f5", borderRadius: 10, padding: 12, marginBottom: 12 },
  countRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  countLbl: { fontWeight: "700", color: INK, flex: 1 },
  countT: { color: TEAL, fontWeight: "800", fontSize: 20, letterSpacing: 0.5 },
  hurry: { color: TEAL, fontWeight: "700" },
  secT: { fontWeight: "800", color: INK, marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%", paddingVertical: 8 },
  cellD: { color: TEAL, fontWeight: "700" },
  win: { width: 110, marginRight: 12 },
  thumb: { width: 100, height: 80, borderRadius: 10, backgroundColor: "#dfe9ea" },
  thumbBtn: { borderRadius: 10 },
  thumbFallback: { backgroundColor: "#dfe9ea", alignItems: "center", justifyContent: "center" },
  winPlay: { position: "absolute", alignSelf: "center", top: 26, width: 28, height: 28, borderRadius: 14, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  winN: { fontWeight: "700", color: INK, fontSize: 12, marginTop: 4 },
  winR: { color: TEAL, fontSize: 11 },
  tabs: { flexDirection: "row", marginBottom: 8, gap: 4 },
  tab: { flex: 1, textAlign: "center", color: MUTED, fontWeight: "600", fontSize: 12, paddingBottom: 6 },
  tabOn: { color: TEAL, borderBottomWidth: 2, borderColor: TEAL },
  link: { color: TEAL, fontWeight: "700" },
  rwRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderColor: "#f0f4f4" },
  rwAmt: { color: TEAL, fontWeight: "800" },
  linkBox: { borderWidth: 1, borderColor: "#bfe0e4", borderRadius: 8, padding: 8, color: TEAL, backgroundColor: "#fff", marginVertical: 8 },
  copyBtn: { borderWidth: 1, borderColor: TEAL, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  copyT: { color: TEAL, fontWeight: "700" },
  btnRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  referCta: { flex: 1, alignItems: "flex-end", minWidth: 140 },
  referBtn: { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10, marginBottom: 4 },
  demoTag: { backgroundColor: "#fff4d6", color: "#9a6b00", fontSize: 10, fontWeight: "800", paddingHorizontal: 6, borderRadius: 4 },
  copyErr: { color: "#b3261e", marginBottom: 8 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: "85%" },
  closeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#f1f5f6" },
  closeT: { color: INK, fontWeight: "700" },
  video: { width: "100%", aspectRatio: 16 / 9, borderRadius: 10, backgroundColor: "#000", marginVertical: 8 },
  videoBtns: { flexDirection: "row", marginBottom: 8 },
  playToggle: { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  playToggleT: { color: "#fff", fontWeight: "800" },
  unavail: { backgroundColor: "#f6fafa", borderRadius: 10, padding: 20, alignItems: "center", marginVertical: 8 },
  unavailT: { fontWeight: "800", color: INK, fontSize: 16, marginBottom: 4 },
  centerBox: { alignItems: "center", padding: 20, gap: 10 },
  retryBtn: { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 8 },
  retryT: { color: "#fff", fontWeight: "800" },
  quote: { borderBottomWidth: 1, borderColor: "#f0f4f4", paddingVertical: 10 },
  stars: { color: "#e8a100", fontWeight: "700", marginBottom: 2 },
  quoteT: { color: INK, marginBottom: 4 },
  quoteList: { maxHeight: 320 },
  demoMini: { color: MUTED, fontSize: 11, fontStyle: "italic" },
  param: { marginBottom: 8 },
  paramName: { color: INK, fontWeight: "700", fontSize: 13 },
  cover: { width: "100%", height: 168, borderRadius: 12, marginBottom: 12, backgroundColor: "#dfe9ea" },
  coverFallback: { backgroundColor: "#0e7482", alignItems: "center", justifyContent: "center" },
  coverFallbackT: { color: "#fff", fontWeight: "800", fontSize: 16 },
  avatarImg: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#f3e2d3" },
  adSlot: { backgroundColor: "#f1f5f6", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginBottom: 12 },
  adSlotT: { color: MUTED, fontWeight: "700", fontSize: 12 },
  adSlotS: { color: MUTED, fontSize: 11 },
  navBar: { flexDirection: "row", borderTopWidth: 1, borderColor: "#e6efef", backgroundColor: "#fff", paddingBottom: 18, paddingTop: 6 },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 4 },
  navIcon: { fontSize: 20, color: MUTED },
  navT: { color: MUTED, fontWeight: "600", fontSize: 11 },
  navOn: { color: TEAL, fontWeight: "800" },
  compCard: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e6efef", overflow: "hidden" },
  compCover: { width: "100%", height: 130, backgroundColor: "#dfe9ea" },
  compBody: { padding: 12 },
  compTitle: { fontSize: 16, fontWeight: "800", color: INK, flex: 1 },
  stateBadge: { backgroundColor: "#e8f4f5", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  stateBadgeT: { color: TEAL, fontWeight: "700", fontSize: 11 },
  compStats: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  compPrize: { color: TEAL, fontWeight: "800", fontSize: 16 },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
});
