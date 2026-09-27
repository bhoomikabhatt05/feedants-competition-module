import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Modal, ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useVideoPlayer, VideoView } from "expo-video";
import { formatMs, useCountdown, formatDateTime } from "../hooks";

export const TEAL = "#0e7482";
export const INK = "#0b2b33";
export const MUTED = "#6b8a91";

export function TopBar({ lang, setLang }) {
  return (
    <View style={s.topRow}>
      <Text style={s.back}>←  {lang === "हिंदी" ? "वापस जाएं" : "Go back"}</Text>
      <View style={s.langWrap}>
        {["ENG", "हिंदी"].map((l) => (
          <TouchableOpacity key={l} onPress={() => setLang(l)} style={[s.lang, lang === l && s.langOn]}>
            <Text style={[s.langT, lang === l && s.langTOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function TitleCard({ c }) {
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
        <View style={s.statCol}><Text style={s.lbl}>Prize Pool</Text><Text style={s.prize}>₹ {Number(c.prizePool).toLocaleString("en-IN")}</Text></View>
        <View style={s.statCol}><Text style={s.lbl}>Entry Fee</Text><Text style={s.fee}>₹ {c.entryFee}</Text></View>
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={s.spots}>👥  Only {c.spotsLeft} spots left</Text>
          <View style={s.bar}><View style={[s.barFill, { width: `${Math.min(100, (c.bookedSpots / Math.max(1, c.capacity)) * 100)}%` }]} /></View>
          <Text style={s.booked}>{c.bookedSpots} / {c.capacity} Booked</Text>
        </View>
      </View>
    </View>
  );
}

export function JudgeCard({ c, onPlay }) {
  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={s.avatar}><Text style={{ fontSize: 28 }}>👩🏽</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.lbl}>Judge</Text>
          <Text style={s.judgeName}>{c.judge.name}</Text>
          <Text style={s.muted}>{c.judge.bio}</Text>
          <Text style={s.muted}>{c.judge.experience}</Text>
        </View>
        <TouchableOpacity style={{ alignItems: "center" }} onPress={onPlay}>
          <View style={s.play}><Text style={{ color: TEAL }}>▶</Text></View>
          <Text style={s.muted}>Intro Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function CountdownBar({ ms, onExpiry }) {
  const left = useCountdown(ms, onExpiry);
  return (
    <View style={s.countBar}>
      <View style={s.countRow}>
        <Text>⏳</Text>
        <Text style={s.countLbl}>Registration closes in</Text>
        <Text style={s.hurry}>⏱ Hurry up!</Text>
      </View>
      <Text style={s.countT}>{formatMs(left)}</Text>
    </View>
  );
}

export function DatesGrid({ c }) {
  const cells = [
    ["Register Before", c.dates.registerBefore],
    ["Submission Starts", c.dates.submissionStarts],
    ["Submission Ends", c.dates.submissionEnds],
    ["Result Date", c.dates.resultDate],
  ];
  return (
    <View style={s.card}>
      <Text style={s.secT}>Important Dates</Text>
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

export function WinnersRow({ c, onPlay }) {
  return (
    <View style={s.card}>
      <Text style={s.secT}>Previous Winners</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(c.previousWinners || []).length === 0 && (
          <Text style={s.muted}>Winners will be announced after results.</Text>
        )}
        {(c.previousWinners || []).map((w, i) => (
          <View key={i} style={s.win}>
            <TouchableOpacity style={s.thumb} onPress={() => onPlay && onPlay(w)}>
              <View style={s.winPlay}><Text style={{ color: "#fff", fontSize: 10 }}>▶</Text></View>
            </TouchableOpacity>
            <Text style={s.winN}>{w.name}</Text>
            <Text style={s.winR}>{w.rankLabel}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function InfoTabs({ c }) {
  const [tab, setTab] = useState("about");
  const [more, setMore] = useState(false);
  return (
    <View style={s.card}>
      <View style={s.tabs}>
        {[["about", "About Competition"], ["judge", "Judging Parameters"], ["rules", "Rules & Eligibility"]].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setTab(k)}>
            <Text style={[s.tab, tab === k && s.tabOn]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === "about" && (
        <Text style={s.muted}>{c.about}{more ? c.aboutMore : ""}{" "}
          <Text style={s.link} onPress={() => setMore(!more)}>{more ? "View less ▲" : "View more ▼"}</Text>
        </Text>
      )}
      {tab === "judge" && (c.judgingParameters || []).map((p, i) => <Text key={i} style={s.muted}>• {p}</Text>)}
      {tab === "rules" && (c.rules || []).map((p, i) => <Text key={i} style={s.muted}>• {p}</Text>)}
    </View>
  );
}

export function Rewards({ c }) {
  return (
    <View style={s.card}>
      <Text style={s.secT}>Rewards <Text style={s.muted}>(All Positions)</Text></Text>
      {(c.rewards || []).map((r) => (
        <View key={r.position} style={s.rwRow}>
          <Text>🏆  {r.label}</Text>
          <Text style={s.rwAmt}>₹ {r.amount}</Text>
        </View>
      ))}
    </View>
  );
}

export function PrizeMoneyCard() {
  return (
    <View style={s.row2}>
      <View style={[s.card, { flex: 1 }]}>
        <Text style={s.secT}>▶  How will you receive prize money?</Text>
        <Text style={s.muted}>Watch video to know more</Text>
      </View>
      <View style={[s.card, { flex: 1 }]}>
        <Text style={s.secT}>🛡 Refund policy</Text>
        <Text style={s.muted}>🛡 Secure payments powered by</Text>
        <Text style={{ fontWeight: "800", color: INK }}>Razorpay <Text style={s.demoTag}>DEMO/MOCK</Text></Text>
        <Text style={s.muted}>No secrets in app — backend verifies.</Text>
      </View>
    </View>
  );
}

export function ReferCard({ link, code, perSignup, signupCount, creditEarned, onRefer, onShare }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const copy = async () => {
    setCopyError("");
    try {
      await Clipboard.setStringAsync(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyError("Copy failed — long-press the link to copy manually.");
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
      <Text style={s.secT}>📢 Refer & Earn more discount</Text>
      <Text style={s.linkBox} numberOfLines={1}>{link}</Text>
      {!!code && <Text style={s.muted}>Your backend code: <Text style={{ fontWeight: "800", color: INK }}>{code}</Text></Text>}
      {!!copyError && <Text style={s.copyErr}>{copyError}</Text>}
      <View style={s.btnRow}>
        <TouchableOpacity style={s.copyBtn} onPress={copy}>
          <Text style={s.copyT}>{copied ? "Copied!" : "Copy Link"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.copyBtn} onPress={share}>
          <Text style={s.copyT}>Share</Text>
        </TouchableOpacity>
        <View style={s.referCta}>
          <TouchableOpacity style={s.referBtn} onPress={onRefer}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Refer Now</Text>
          </TouchableOpacity>
          <Text style={s.muted}>You earn ₹{perSignup} per real signup{signupCount != null ? ` • ${signupCount} so far (₹${creditEarned})` : ""}</Text>
        </View>
      </View>
      <Text style={s.muted}>Reward is credited only when a referred user completes registration — never on link click.</Text>
    </View>
  );
}

export function HearFromUsers({ onPress }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.rowBetween}>
        <View>
          <Text style={s.secT}>💬 Hear From Our Users</Text>
          <Text style={s.muted}>See what participants say about Feedants</Text>
        </View>
        <Text style={{ fontSize: 18 }}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function PlayerView({ url }) {
  const [playing, setPlaying] = useState(false);
  const player = useVideoPlayer(url, (p) => {
    p.play();
    setPlaying(true);
  });
  const toggle = () => {
    if (playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
    }
  };
  return (
    <View>
      <VideoView style={s.video} player={player} nativeControls contentFit="contain" allowsPictureInPicture />
      <View style={s.videoBtns}>
        <TouchableOpacity style={s.playToggle} onPress={toggle}>
          <Text style={s.playToggleT}>{playing ? "❚❚  Pause" : "▶  Play"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.muted}>Demo sample video — the real performance video URL comes from the backend.</Text>
    </View>
  );
}

export function VideoModal({ visible, title, url, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.rowBetween}>
            <Text style={s.secT}>{title || "Video"}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeT}>✕ Close</Text>
            </TouchableOpacity>
          </View>
          {!url || !/^https?:\/\/.+/i.test(url) ? (
            <View style={s.unavail}>
              <Text style={s.unavailT}>Video unavailable</Text>
              <Text style={s.muted}>This competition does not currently provide a video. Please check back later.</Text>
            </View>
          ) : (
            <PlayerView url={url} />
          )}
        </View>
      </View>
    </Modal>
  );
}

export function TestimonialsModal({ visible, items, loading, error, onRetry, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.rowBetween}>
            <Text style={s.secT}>💬 Hear From Our Users</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeT}>✕ Close</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={s.centerBox}><ActivityIndicator size="large" color={TEAL} /><Text style={s.muted}>Loading reviews…</Text></View>
          )}
          {!loading && !!error && (
            <View style={s.centerBox}>
              <Text style={s.copyErr}>{error}</Text>
              <TouchableOpacity style={s.retryBtn} onPress={onRetry}>
                <Text style={s.retryT}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loading && !error && (items || []).length === 0 && (
            <Text style={s.muted}>No reviews yet — be the first to participate.</Text>
          )}
          {!loading && !error && (items || []).map((t, i) => (
            <View key={i} style={s.quote}>
              <Text style={s.stars}>{"★".repeat(t.rating || 5)}{"☆".repeat(5 - (t.rating || 5))}</Text>
              <Text style={s.quoteT}>"{t.text}"</Text>
              <Text style={s.muted}>— {t.name}{t.isDemo ? " · sample review" : ""}</Text>
            </View>
          ))}
        </View>
      </View>
    </Modal>
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
  thumb: { width: 100, height: 80, borderRadius: 10, backgroundColor: "#c96f2e", alignItems: "center", justifyContent: "center" },
  winPlay: { width: 28, height: 28, borderRadius: 14, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
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
});
