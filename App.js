import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar 
} from "react-native";
import Slider from "@react-native-community/slider";

// ─── Constants ────────────────────────────────────────────────────
const PASSWORD = "Aryan@1436#";
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const NORMAL_TIMETABLE = [
  { id:"n1",  time:"00:00 – 00:30", subject:"Exercise",            icon:"💪" },
  { id:"n2",  time:"00:30 – 03:00", subject:"Lecture (Time 1)",    icon:"🎧" },
  { id:"n3",  time:"07:00 – 08:00", subject:"Sub Revision",        icon:"📖" },
  { id:"n4",  time:"08:00 – 13:00", subject:"Class & H.W",         icon:"🏫" },
  { id:"n5",  time:"13:30 – 15:00", subject:"H.W / PYQ's",         icon:"📝" },
  { id:"n6",  time:"15:00 – 17:00", subject:"Sub 1 Questions",     icon:"🧠" },
  { id:"n7",  time:"17:00 – 19:00", subject:"Sub 2 Questions",     icon:"⚡" },
  { id:"n8",  time:"19:00 – 20:00", subject:"Error & Sub Revision",icon:"🔍" },
  { id:"n9",  time:"22:00 – 23:00", subject:"Lecture (Time 2)",    icon:"🎧" },
  { id:"n10", time:"23:00 – 00:00", subject:"Laptop Learning",     icon:"💻" },
];

const HOLIDAY_TIMETABLE = [
  { id:"h1",  time:"00:00 – 00:30", subject:"Exercise",            icon:"💪" },
  { id:"h2",  time:"00:30 – 03:00", subject:"Lecture (Time 1)",    icon:"🎧" },
  { id:"h3",  time:"08:00 – 09:00", subject:"Get Ready",           icon:"🌅" },
  { id:"h4",  time:"09:00 – 12:00", subject:"Mock Test",           icon:"📋" },
  { id:"h5",  time:"13:00 – 16:00", subject:"Mock Test Analysis",  icon:"📊" },
  { id:"h6",  time:"17:00 – 19:00", subject:"Sub 1 Questions",     icon:"🧠" },
  { id:"h7",  time:"19:00 – 21:00", subject:"NCERT",               icon:"📚" },
  { id:"h8",  time:"22:00 – 22:30", subject:"Lecture (Time 2)",    icon:"🎧" },
  { id:"h9",  time:"22:30 – 00:00", subject:"Laptop Learning",     icon:"💻" },
];

const HABITS = [
  {id:"hab1", name:"Morning Workout", icon:"💪"},
  {id:"hab2", name:"Read 30 mins",    icon:"📚"},
  {id:"hab3", name:"Drink 8 glasses", icon:"💧"},
  {id:"hab4", name:"No Social Media", icon:"📵"},
  {id:"hab5", name:"Meditate",        icon:"🧘"},
  {id:"hab6", name:"Sleep by 10 PM",  icon:"😴"},
];

function calcSlots(timeStr) {
  try {
    const parts = timeStr.split("–").map(s => s.trim());
    const toMins = t => { const [h,m] = t.split(":").map(Number); return h*60+m; };
    let diff = toMins(parts[1]) - toMins(parts[0]);
    if (diff <= 0) diff += 24*60;
    return Math.max(1, Math.round(diff / 60));
  } catch { return 1; }
}

function dateKey(d) { return d.toISOString().split("T")[0]; }

// ─── Core App Component ───────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw]             = useState("");
  const [pwErr, setPwErr]       = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [tab, setTab]           = useState("today");

  // In-memory data store representation for mobile context stability
  const [dayTypes, setDayTypes] = useState({});
  const [tasks, setTasks]       = useState({});
  const [habits, setHabits]     = useState({});

  const [selDate, setSelDate]   = useState(new Date());
  const [newInputs, setNewInputs] = useState({});

  const selKey = dateKey(selDate);
  const dayType = dayTypes[selKey] || null;
  const tt = dayType === "normal" ? NORMAL_TIMETABLE : dayType === "holiday" ? HOLIDAY_TIMETABLE : [];

  const handleUnlock = () => {
    if (pw === PASSWORD) {
      setUnlocked(true);
      setPwErr(false);
    } else {
      setPwErr(true);
      setPw("");
    }
  };

  const lockDayType = type => {
    if (dayTypes[selKey]) return;
    setDayTypes(p => ({ ...p, [selKey]: type }));
  };

  const addTask = (sid, idx) => {
    const k = `${selKey}-${sid}-${idx}`;
    const val = (newInputs[k] || "").trim();
    if (!val) return;
    setTasks(p => ({ ...p, [k]: { text: val, pct: 0 } }));
    setNewInputs(p => ({ ...p, [k]: "" }));
  };

  const setPct = (sid, idx, pct) => {
    const k = `${selKey}-${sid}-${idx}`;
    setTasks(p => ({ ...p, [k]: { ...p[k], pct: Math.round(pct) } }));
  };

  const toggleHabit = id => {
    const hk = `${selKey}-${id}`;
    setHabits(p => ({ ...p, [hk]: !p[hk] }));
  };

  // Computations
  const totalSlots = tt.reduce((a, s) => a + calcSlots(s.time), 0);
  const allSlotKeys = tt.flatMap(s => Array.from({ length: calcSlots(s.time) }, (_, i) => `${selKey}-${s.id}-${i}`));
  const filledTasks = allSlotKeys.map(k => tasks[k]).filter(Boolean);
  const dayPct = totalSlots === 0 ? 0 : Math.round(filledTasks.reduce((a, t) => a + (t.pct || 0), 0) / totalSlots);
  const completedHabitsCount = HABITS.filter(h => habits[`${selKey}-${h.id}`]).length;

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.lockContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.lockCard}>
          <Text style={{ fontSize: 50, marginBottom: 10 }}>🔐</Text>
          <Text style={styles.lockTitle}>Aryan's Planner</Text>
          <Text style={styles.lockSub}>Enter password to continue</Text>
          
          <TextInput 
            secureTextEntry={!showPw}
            value={pw}
            onChangeText={setPw}
            placeholder="Password"
            placeholderTextColor="#bbb"
            style={[styles.input, pwErr && { borderColor: "#e53e3e" }]}
          />
          
          {pwErr && <Text style={styles.errorText}>❌ Wrong password. Try again.</Text>}
          
          <TouchableOpacity onPress={handleUnlock} style={styles.unlockBtn}>
            <Text style={styles.unlockBtnText}>Unlock 🚀</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aryan's Planner 📅</Text>
        <TouchableOpacity onPress={() => setUnlocked(false)} style={styles.lockBadge}>
          <Text style={styles.lockBadgeText}>🔒 Lock</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        {[{k:"today", l:"Today"}, {k:"habits", l:"Habits"}].map(t => (
          <TouchableOpacity 
            key={t.k} 
            onPress={() => setTab(t.k)} 
            style={[styles.tabItem, tab === t.k && styles.activeTabItem]}
          >
            <Text style={[styles.tabText, tab === t.k && styles.activeTabText]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {tab === "today" && (
          <View style={{ padding: 16 }}>
            {/* Header Info */}
            <View style={styles.dateRow}>
              <View>
                <Text style={styles.bigDay}>{selDate.getDate()}</Text>
                <Text style={styles.subDayText}>{WEEK_DAYS[selDate.getDay()]}, {MONTHS_FULL[selDate.getMonth()]}</Text>
              </View>
              {dayType && (
                <View style={[styles.typeTag, { backgroundColor: dayType==="normal"?"#FF6B00":"#4CAF50" }]}>
                  <Text style={styles.typeTagText}>{dayType==="normal"?"📚 Normal":"🎉 Holiday"}</Text>
                </View>
              )}
            </View>

            {/* Selector Option */}
            {!dayType && (
              <View style={styles.setupCard}>
                <Text style={styles.setupText}>⚠️ Select day configuration</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <TouchableOpacity onPress={() => lockDayType("normal")} style={[styles.choiceBtn, { backgroundColor: "#FF6B00" }]}>
                    <Text style={styles.choiceBtnText}>📚 Normal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => lockDayType("holiday")} style={[styles.choiceBtn, { backgroundColor: "#4CAF50" }]}>
                    <Text style={styles.choiceBtnText}>🎉 Holiday</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Metrics Section */}
            {dayType && (
              <View style={styles.metricCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.metricTitle}>Day Completion</Text>
                  <Text style={styles.metricHighlight}>{dayPct}%</Text>
                </View>
                <View style={styles.barBacking}>
                  <View style={[styles.barFilling, { width: `${dayPct}%` }]} />
                </View>
              </View>
            )}

            {/* Schedules Rendering */}
            {dayType && tt.map((slot, si) => {
              const slotsCount = calcSlots(slot.time);
              return (
                <View key={slot.id} style={styles.scheduleCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderTitle}>{slot.icon} {slot.subject}</Text>
                    <Text style={styles.cardHeaderTime}>{slot.time}</Text>
                  </View>
                  <View style={{ padding: 12 }}>
                    {Array.from({ length: slotsCount }).map((_, idx) => {
                      const taskKey = `${selKey}-${slot.id}-${idx}`;
                      const currentTask = tasks[taskKey];
                      return (
                        <View key={idx} style={{ marginTop: idx > 0 ? 12 : 0 }}>
                          {currentTask ? (
                            <View style={styles.taskWrapper}>
                              <Text style={styles.taskLabel}>{currentTask.text}</Text>
                              <View style={styles.sliderRow}>
                                <Slider
                                  style={{ flex: 1, height: 40 }}
                                  minimumValue={0}
                                  maximumValue={100}
                                  step={5}
                                  value={currentTask.pct || 0}
                                  minimumTrackTintColor="#FF6B00"
                                  maximumTrackTintColor="#FFE0C0"
                                  thumbTintColor="#FF6B00"
                                  onValueChange={v => setPct(slot.id, idx, v)}
                                />
                                <Text style={styles.sliderBubble}>{currentTask.pct || 0}%</Text>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.inputRow}>
                              <TextInput
                                placeholder="Add specific objective..."
                                placeholderTextColor="#999"
                                style={styles.innerEntry}
                                value={newInputs[taskKey] || ""}
                                onChangeText={txt => setNewInputs(p => ({ ...p, [taskKey]: txt }))}
                              />
                              <TouchableOpacity onPress={() => addTask(slot.id, idx)} style={styles.plusAction}>
                                <Text style={styles.plusActionText}>+</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {tab === "habits" && (
          <View style={{ padding: 16 }}>
            <Text style={styles.sectionHeading}>🔥 Daily Routines</Text>
            
            <View style={styles.routineBanner}>
              <Text style={styles.routineBannerTitle}>Progress Framework</Text>
              <Text style={styles.routineBannerCount}>{completedHabitsCount} / {HABITS.length}</Text>
            </View>

            <View style={styles.gridContainer}>
              {HABITS.map(h => {
                const isActive = habits[`${selKey}-${h.id}`];
                return (
                  <TouchableOpacity 
                    key={h.id} 
                    onPress={() => toggleHabit(h.id)}
                    style={[styles.gridCell, isActive && styles.gridCellActive]}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 4 }}>{h.icon}</Text>
                    <Text style={[styles.gridCellLabel, isActive && { color: "#fff" }]}>{h.name}</Text>
                    <Text style={{ fontSize: 16, marginTop: 4 }}>{isActive ? "✅" : "⭕"}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Native Layout Style Declarations ──────────────────────────────
const styles = StyleSheet.create({
  lockContainer: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  lockCard: { width: 300, padding: 24, borderWidth: 2, borderColor: "#FF6B00", borderRadius: 20, alignItems: "center", backgroundColor: "#fff" },
  lockTitle: { fontSize: 22, fontWeight: "900", color: "#FF6B00", marginVertical: 4 },
  lockSub: { fontSize: 13, color: "#bbb", marginBottom: 20 },
  input: { width: "100%", padding: 12, borderWidth: 1.5, borderColor: "#FFD0A8", borderRadius: 10, marginBottom: 10, backgroundColor: "#FFF8F3", color: "#333", textAlign: "center" },
  errorText: { color: "#e53e3e", fontSize: 12, marginBottom: 10 },
  unlockBtn: { width: "100%", padding: 14, backgroundColor: "#FF6B00", borderRadius: 10, alignItems: "center" },
  unlockBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  container: { flex: 1, backgroundColor: "#FFFAF5" },
  header: { backgroundColor: "#FF6B00", padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#fff", fontWeight: "900", fontSize: 16 },
  lockBadge: { backgroundColor: "rgba(255,255,255,0.25)", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  lockBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#FFE8D6" },
  tabItem: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 3, borderColor: "transparent" },
  activeTabItem: { borderColor: "#FF6B00" },
  tabText: { color: "#999", fontSize: 13, fontWeight: "600" },
  activeTabText: { color: "#FF6B00", fontWeight: "800" },
  dateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 },
  bigDay: { fontSize: 54, fontWeight: "900", color: "#FF6B00" },
  subDayText: { fontSize: 13, color: "#666", fontWeight: "600" },
  typeTag: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  typeTagText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  setupCard: { padding: 16, backgroundColor: "#FFF0E6", borderRadius: 12, borderWidth: 1.5, borderColor: "#FFB347", borderStyle: "dashed" },
  setupText: { fontWeight: "700", color: "#FF6B00", fontSize: 13, textAlign: "center" },
  choiceBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  choiceBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  metricCard: { padding: 14, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#FFE0C0", marginBottom: 16 },
  metricTitle: { fontSize: 13, fontWeight: "700", color: "#333" },
  metricHighlight: { fontSize: 20, fontWeight: "900", color: "#FF6B00" },
  barBacking: { height: 10, backgroundColor: "#FFE8D6", borderRadius: 5, marginTop: 8, overflow: "hidden" },
  barFilling: { height: "100%", backgroundColor: "#FF6B00" },
  scheduleCard: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#FFE0C0", overflow: "hidden", marginBottom: 12 },
  cardHeader: { backgroundColor: "#FF6B00", padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardHeaderTitle: { color: "#fff", fontWeight: "700", fontSize: 13 },
  cardHeaderTime: { color: "#fff", fontSize: 11, opacity: 0.9 },
  taskWrapper: { backgroundColor: "#FFFAF5", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#FFE0C0" },
  taskLabel: { fontSize: 13, fontWeight: "600", color: "#333" },
  sliderRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  sliderBubble: { marginLeft: 8, backgroundColor: "#FF6B00", color: "#fff", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, fontSize: 11, fontWeight: "800" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  innerEntry: { flex: 1, padding: 8, borderWidth: 1, borderColor: "#FFD0A8", borderRadius: 8, backgroundColor: "#FFFAF5", fontSize: 12, color: "#333" },
  plusAction: { backgroundColor: "#FF6B00", width: 34, height: 34, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  plusActionText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  sectionHeading: { fontSize: 16, fontWeight: "800", color: "#333", marginBottom: 4 },
  routineBanner: { backgroundColor: "#FF6B00", padding: 16, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  routineBannerTitle: { color: "#fff", fontWeight: "700", fontSize: 13 },
  routineBannerCount: { color: "#fff", fontWeight: "900", fontSize: 20 },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  gridCell: { width: "48%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#FFE0C0", borderRadius: 14, padding: 16, alignItems: "center" },
  gridCellActive: { backgroundColor: "#FF6B00", borderColor: "#FF6B00" },
  gridCellLabel: { fontSize: 12, fontWeight: "700", color: "#444", textAlign: "center" }
});
