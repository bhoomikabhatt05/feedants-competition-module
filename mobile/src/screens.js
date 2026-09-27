import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput } from "react-native";
import { api, getUserId, SLUG } from "./api";
import { CompetitionCard, TEAL, INK, MUTED } from "./components/cards";
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
      <View style={st.center}>
        <Text style={st.errT}>Nothing here yet</Text>
        <Text style={st.muted}>{empty}</Text>
      </View>
    );
  }
  return children;
}

export function HomeScreen({ onOpenCompetition, onGo }) {
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const userId = await getUserId();
      setComp(await api.detail(SLUG, userId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView contentContainerStyle={st.body} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={st.hero}>Feedants</Text>
      <Text style={st.sub}>Classical dance competitions, judged by experts.</Text>
      <ScreenState loading={loading} error={error} onRetry={load} loadingText="Loading featured competition…">
        {comp && (
          <CompetitionCard item={comp} onOpen={() => onOpenCompetition(comp.slug)} />
        )}
      </ScreenState>
      {comp && (
        <View style={st.quickRow}>
          <TouchableOpacity style={st.quick} onPress={() => onOpenCompetition(comp.slug)}>
            <Text style={st.quickT}>View details →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.quick} onPress={() => onGo("competitions")}>
            <Text style={st.quickT}>All competitions →</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

export function ListScreen({ title, searchable, onOpenCompetition }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

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
  const shown = q ? items.filter((c) => c.title.toLowerCase().includes(q)) : items;

  return (
    <ScrollView contentContainerStyle={st.body} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={st.hero}>{title}</Text>
      {searchable && (
        <TextInput
          style={st.search}
          placeholder="Search competitions…"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      )}
      <ScreenState
        loading={loading}
        error={error}
        onRetry={load}
        loadingText="Loading competitions…"
        empty={q ? "No competitions match your search." : items.length === 0 ? "No competitions published yet." : ""}
      >
        {shown.map((c) => (
          <CompetitionCard key={c.slug} item={c} onOpen={() => onOpenCompetition(c.slug)} />
        ))}
      </ScreenState>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

export function ProfileScreen() {
  const [userId, setUserId] = useState("");
  const [comp, setComp] = useState(null);
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const id = await getUserId();
      setUserId(id);
      setComp(await api.detail(SLUG, id));
      setReferral(await api.referral(SLUG, id).catch(() => null));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView contentContainerStyle={st.body} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={st.hero}>Profile</Text>
      <Text style={st.sub}>Demo device account — no real user data is stored.</Text>
      <ScreenState loading={loading} error={error} onRetry={load} loadingText="Loading profile…">
        <View style={st.card}>
          <Text style={st.lbl}>Demo user ID</Text>
          <Text style={st.val}>{userId}</Text>
        </View>
        <View style={st.card}>
          <Text style={s2.secT}>My participation</Text>
          <Text style={st.muted}>
            {comp && comp.isRegistered
              ? `Registered for ${comp.title}.`
              : "Not registered for the featured competition yet."}
          </Text>
          {comp && comp.registration && comp.registration.submittedAt && (
            <Text style={st.muted}>Submitted on {new Date(comp.registration.submittedAt).toLocaleString()}.</Text>
          )}
          {comp && (
            <Text style={st.muted}>
              Registration closes {formatDateTime(comp.dates.registerBefore).date} at {formatDateTime(comp.dates.registerBefore).time}.
            </Text>
          )}
        </View>
        {referral && (
          <View style={st.card}>
            <Text style={s2.secT}>My referral</Text>
            <Text style={st.val}>{referral.code}</Text>
            <Text style={st.muted}>{referral.signupCount} signups • ₹{referral.creditEarned} earned (₹{referral.perSignupReward} per real signup).</Text>
          </View>
        )}
      </ScreenState>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s2 = { secT: { fontWeight: "800", color: INK, marginBottom: 8 } };

const st = StyleSheet.create({
  body: { padding: 14, paddingTop: 48, flexGrow: 1 },
  hero: { fontSize: 24, fontWeight: "800", color: INK },
  sub: { color: MUTED, fontSize: 13, marginBottom: 12 },
  center: { alignItems: "center", padding: 32, gap: 10 },
  muted: { color: MUTED, fontSize: 13 },
  errT: { fontSize: 17, fontWeight: "800", color: INK },
  retry: { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 8 },
  retryT: { color: "#fff", fontWeight: "800" },
  quickRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  quick: { flex: 1, backgroundColor: "#fff", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#e6efef" },
  quickT: { color: TEAL, fontWeight: "700" },
  search: { backgroundColor: "#fff", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#e6efef", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e6efef" },
  lbl: { color: MUTED, fontSize: 12 },
  val: { color: INK, fontWeight: "800", fontSize: 15 },
});
