import { useState, useEffect, useCallback } from "react";

const START_DATE = new Date("2026-05-19");
const TOTAL_DAYS = 75;
const LS_KEY = "75ss_progress_v1";

const RULES = [
  { id: "workout",     label: "Workout",        icon: " ", note: "1x/day (skip Mondays)",                weekly: false, skipMonday: true },
  { id: "vitamins",    label: "Daily Vitamins",  icon: " ", note: "Every day",                            weekly: false },
  { id: "tea",         label: "1 Tea",           icon: " ", note: "At least 1 cup",                      weekly: false },
  { id: "read",        label: "Read 10 Pages",   icon: " ", note: "10 pages minimum",                    weekly: false },
  { id: "waist",       label: "Waist Train",     icon: " ", note: "5x/week minimum",                     weekly: false },
  { id: "wake",        label: "Up by 12pm",      icon: " ", note: "No sleeping in past noon",            weekly: false },
  { id: "diet",        label: "Clean Diet",      icon: " ", note: "No refined carbs or processed sugar", weekly: false },
  { id: "water",       label: "Drink Water",     icon: " ", note: "80–100 oz daily",                     weekly: false },
  { id: "sweet",       label: "Sweet Treat",     icon: " ", note: "1 allowed this week",                 weekly: true, limit: 1 },
  { id: "carb",        label: "Carb of Choice",  icon: " ", note: "1 allowed this week (bread, rice…)",  weekly: true, limit: 1 },
  { id: "skipworkout", label: "Skip a Workout",  icon: " ", note: "1 rest pass this week (non-Monday)", weekly: true, limit: 1 },
];

const pink       = "#ff3fa4";
const hotPink    = "#ff006e";
const lavender   = "#a855f7";
const sky        = "#38bdf8";
const cardBorder = "#fce7f3";
const textMain   = "#4a1942";
const textSub    = "#9d4a8a";
const textMuted  = "#c9a0c0";

function getDateKey(d)    { return d.toISOString().split("T")[0]; }
function getDayNumber(d)  { return Math.floor((d - START_DATE) / 86400000) + 1; }
function getWeekNumber(d) { return Math.floor(Math.floor((d - START_DATE) / 86400000) / 7) + 1; }
function isMonday(d)      { return d.getDay() === 1; }
function getWeekDates(wn) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(START_DATE);
    d.setDate(START_DATE.getDate() + (wn - 1) * 7 + i);
    return d;
  });
}

function loadData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveData(d) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(d)); return true; }
  catch { return false; }
}

export default function App() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayKey    = getDateKey(today);
  const dayNum      = getDayNumber(today);
  const isActive    = dayNum >= 1 && dayNum <= TOTAL_DAYS;
  const currentWeek = isActive ? getWeekNumber(today) : 1;

  const [data,         setData]         = useState(() => loadData());
  const [saveStatus,   setSaveStatus]   = useState("saved");
  const [view,         setView]         = useState("today");
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  // Auto-refresh at midnight
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const ms = midnight - now;
    const t = setTimeout(() => window.location.reload(), ms);
    return () => clearTimeout(t);
  }, []);

  const getChecked    = (dk, id) => !!data[dk]?.[id];
  const getWeekChecks = (wn, id) => getWeekDates(wn).filter(d => getChecked(getDateKey(d), id)).length;
  const getDayScore   = (date) => {
    const key = getDateKey(date), mon = isMonday(date);
    const applicable = RULES.filter(r => !r.weekly && !(r.skipMonday && mon));
    return { checked: applicable.filter(r => getChecked(key, r.id)).length, total: applicable.length };
  };

  const toggle = useCallback((dk, id) => {
    setData(prev => {
      const updated = {
        ...prev,
        [dk]: { ...(prev[dk] || {}), [id]: !(prev[dk]?.[id]) }
      };
      const ok = saveData(updated);
      setSaveStatus(ok ? "saved" : "error");
      return updated;
    });
  }, []);

  const todayMon    = isMonday(today);
  const weeklyRules = RULES.filter(r => r.weekly);
  const dailyRules  = RULES.filter(r => !r.weekly);
  const elapsed     = Math.max(0, Math.min(dayNum - 1, TOTAL_DAYS));
  const pct         = Math.round((elapsed / TOTAL_DAYS) * 100);

  const saveLabel =
    saveStatus === "error" ? " Not saved" : " Auto-saved";
  const saveLabelColor =
    saveStatus === "error" ? "#ffb3b3" : "rgba(255,255,255,0.85)";

  return (
    <div style={{ minHeight: "100vh", background: "#fdf4ff", backgroundImage: "radial-gradient(ellipse at 15% 0%,#fce4f8 0%,transparent 55%),radial-gradient(ellipse at 85% 5%,#ede9fe 0%,transparent 50%)", fontFamily: "'Georgia',serif", color: textMain }}>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(120deg,#ff3fa4 0%,#a855f7 55%,#38bdf8 100%)", padding: "26px 24px 18px", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 4px 30px rgba(255,63,164,0.3)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.07em", color: "#fff", margin: 0, textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,0.15)" }}> 75 Semi Soft</h1>
              {isActive && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>Day {dayNum} of {TOTAL_DAYS}</span>}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: saveLabelColor, letterSpacing: "0.02em" }}>
              {saveLabel}
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ height: 9, background: "rgba(255,255,255,0.28)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#fff,#fce7f3)", borderRadius: 99, transition: "width 0.6s ease", boxShadow: "0 0 12px rgba(255,255,255,0.5)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>May 19</span>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{pct}% done </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>Aug 2</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            {["today","week","overview"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: "8px 0", background: view === v ? "#fff" : "rgba(255,255,255,0.18)", color: view === v ? hotPink : "rgba(255,255,255,0.88)", border: "none", borderRadius: 20, fontSize: 12, fontFamily: "inherit", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", fontWeight: view === v ? 700 : 500, boxShadow: view === v ? "0 2px 12px rgba(255,0,110,0.25)" : "none" }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 52px" }}>

        {/* ===== TODAY ===== */}
        {view === "today" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: textSub, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
              {!isActive && <div style={{ fontSize: 14, color: pink, marginTop: 8 }}>
                {dayNum < 1 ? `Challenge starts May 19 — ${Math.abs(dayNum-1)} days away! ` : "Challenge complete! "}
              </div>}
            </div>

            <div style={{ marginBottom: 22 }}>
              <SectionLabel>Daily Rules</SectionLabel>
              {dailyRules.map(rule => {
                const skip = rule.skipMonday && todayMon;
                return <CheckRow key={rule.id} rule={rule} checked={getChecked(todayKey, rule.id)} skipped={skip} onToggle={() => !skip && toggle(todayKey, rule.id)} />;
              })}
            </div>

            <div>
              <SectionLabel>Weekly Allowances — Week {currentWeek}</SectionLabel>
              {weeklyRules.map(rule => {
                const used = getWeekChecks(currentWeek, rule.id);
                const atLimit = used >= rule.limit;
                return <CheckRow key={rule.id} rule={rule} checked={getChecked(todayKey, rule.id)} disabled={!getChecked(todayKey, rule.id) && atLimit} onToggle={() => toggle(todayKey, rule.id)} badge={`${used}/${rule.limit} used`} badgeAlert={atLimit} />;
              })}
            </div>

            {isActive && (() => {
              const { checked, total } = getDayScore(today);
              const done = checked === total;
              return (
                <div style={{ marginTop: 26, padding: "22px 20px", background: done ? "linear-gradient(135deg,#ff3fa4,#a855f7)" : "linear-gradient(135deg,#fdf4ff,#fff0f8)", borderRadius: 20, textAlign: "center", boxShadow: done ? "0 8px 32px rgba(255,63,164,0.4)" : "0 2px 12px rgba(200,100,160,0.1)", border: done ? "none" : `1px solid ${cardBorder}` }}>
                  <div style={{ fontSize: 38, fontWeight: 700, color: done ? "#fff" : pink }}>{checked}/{total}</div>
                  <div style={{ fontSize: 13, color: done ? "rgba(255,255,255,0.92)" : textSub, marginTop: 4, letterSpacing: "0.05em" }}>
                    {done ? "You're THAT girl today! " : "tasks completed today"}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== WEEK ===== */}
        {view === "week" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => setSelectedWeek(w => Math.max(1,w-1))} style={navBtnStyle}>← Prev</button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 700, background: "linear-gradient(90deg,#ff3fa4,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Week {selectedWeek}</div>
                <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>
                  {getWeekDates(selectedWeek)[0].toLocaleDateString("en-US",{month:"short",day:"numeric"})} – {getWeekDates(selectedWeek)[6].toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                </div>
              </div>
              <button onClick={() => setSelectedWeek(w => Math.min(11,w+1))} style={navBtnStyle}>Next →</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 24 }}>
              {getWeekDates(selectedWeek).map(date => {
                const key = getDateKey(date);
                const { checked, total } = getDayScore(date);
                const ratio = total === 0 ? 0 : checked / total;
                const isTod = key === todayKey, isFuture = date > today;
                const dl = ["Su","Mo","Tu","We","Th","Fr","Sa"];
                return (
                  <div key={key} style={{ textAlign: "center", padding: "10px 4px", borderRadius: 14, background: isTod ? "linear-gradient(135deg,#fff0f8,#f3e8ff)" : "#fff", border: `2px solid ${isTod ? pink : cardBorder}`, boxShadow: isTod ? "0 4px 18px rgba(255,63,164,0.2)" : "0 1px 4px rgba(200,100,160,0.06)" }}>
                    <div style={{ fontSize: 9, color: textMuted, marginBottom: 4 }}>{dl[date.getDay()]}</div>
                    <div style={{ fontSize: 13, color: isTod ? pink : textSub, fontWeight: isTod ? 700 : 400, marginBottom: 6 }}>{date.getDate()}</div>
                    {!isFuture && total > 0 && (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: `conic-gradient(${pink} ${ratio*360}deg,#fce7f3 0deg)`, margin: "0 auto 2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", background: isTod ? "#fff0f8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 8, color: ratio === 1 ? pink : textMuted }}>{ratio === 1 ? "✦" : checked}</span>
                        </div>
                      </div>
                    )}
                    {isFuture && <div style={{ fontSize: 10, color: cardBorder }}>·</div>}
                  </div>
                );
              })}
            </div>

            <SectionLabel>Allowances This Week</SectionLabel>
            {weeklyRules.map(rule => {
              const used = getWeekChecks(selectedWeek, rule.id);
              return (
                <div key={rule.id} style={{ display: "flex", alignItems: "center", padding: "14px 16px", marginBottom: 8, background: "#fff", border: `1px solid ${cardBorder}`, borderRadius: 14, gap: 12, boxShadow: "0 2px 8px rgba(200,100,160,0.07)" }}>
                  <span style={{ fontSize: 22 }}>{rule.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: textMain, fontWeight: 600 }}>{rule.label}</div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>Limit: {rule.limit}/week</div>
                  </div>
                  <div style={{ padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, background: used >= rule.limit ? "#fff0f0" : "#f0fff8", color: used >= rule.limit ? "#e84a4a" : "#22c55e", border: `1px solid ${used >= rule.limit ? "#fca5a5" : "#86efac"}` }}>
                    {used}/{rule.limit}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== OVERVIEW ===== */}
        {view === "overview" && (
          <div>
            <SectionLabel>All 75 Days</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 4, marginBottom: 28 }}>
              {Array.from({ length: TOTAL_DAYS }, (_, i) => {
                const date = new Date(START_DATE); date.setDate(START_DATE.getDate() + i);
                const key = getDateKey(date);
                const { checked, total } = getDayScore(date);
                const ratio = total === 0 ? 0 : checked / total;
                const isTod = key === todayKey, isFuture = date > today, isPerfect = !isFuture && ratio === 1;
                return (
                  <div key={key} title={`Day ${i+1}: ${date.toLocaleDateString()}`} style={{ aspectRatio: "1", borderRadius: 7, background: isFuture ? "#fce7f3" : isPerfect ? "linear-gradient(135deg,#ff3fa4,#a855f7)" : ratio > 0 ? `rgba(255,63,164,${0.15+ratio*0.45})` : "#fce7f3", border: isTod ? `2px solid ${hotPink}` : "1px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: isPerfect ? "#fff" : isFuture ? cardBorder : textMuted, boxShadow: isPerfect ? "0 2px 8px rgba(255,63,164,0.3)" : "none" }}>
                    {i+1}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
              {[
                { label: "Perfect Days", value: Array.from({length: Math.max(0,dayNum-1)},(_,i)=>i).filter(i=>{ const d=new Date(START_DATE); d.setDate(START_DATE.getDate()+i); const {checked,total}=getDayScore(d); return checked===total&&total>0; }).length, color: pink },
                { label: "Days Done",    value: Math.max(0,Math.min(dayNum-1,TOTAL_DAYS)), color: lavender },
                { label: "Days Left",   value: Math.max(0,TOTAL_DAYS-Math.max(0,dayNum-1)), color: sky },
              ].map(stat => (
                <div key={stat.label} style={{ flex: 1, minWidth: 80, padding: "16px 10px", background: "#fff", border: `1px solid ${cardBorder}`, borderRadius: 16, textAlign: "center", boxShadow: "0 2px 10px rgba(200,100,160,0.1)" }}>
                  <div style={{ fontSize: 30, color: stat.color, fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ fontSize: 10, color: textMuted, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <SectionLabel>The Rules </SectionLabel>
            {RULES.map(rule => (
              <div key={rule.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", marginBottom: 8, background: "#fff", border: `1px solid ${cardBorder}`, borderRadius: 14, boxShadow: "0 2px 8px rgba(200,100,160,0.06)" }}>
                <span style={{ fontSize: 20, marginTop: 1 }}>{rule.icon}</span>
                <div>
                  <div style={{ fontSize: 14, color: textMain, fontWeight: 600 }}>{rule.label}</div>
                  <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{rule.note}</div>
                </div>
                {rule.weekly && <span style={{ marginLeft: "auto", fontSize: 10, color: pink, background: "#fff0f8", border: `1px solid ${cardBorder}`, padding: "2px 10px", borderRadius: 10, whiteSpace: "nowrap", fontWeight: 600 }}>Weekly</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c084fc", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #fce7f3", fontWeight: 700 }}>{children}</div>;
}

function CheckRow({ rule, checked, skipped, disabled, onToggle, badge, badgeAlert }) {
  return (
    <div onClick={!skipped && !disabled ? onToggle : undefined} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", marginBottom: 8, background: checked ? "linear-gradient(135deg,#fff0f8,#f3e8ff)" : skipped ? "#fafafa" : "#fff", border: `1.5px solid ${checked ? "#f9a8d4" : "#fce7f3"}`, borderRadius: 14, cursor: skipped||disabled ? "default" : "pointer", opacity: skipped ? 0.45 : disabled ? 0.5 : 1, transition: "all 0.15s", userSelect: "none", boxShadow: checked ? "0 4px 16px rgba(255,63,164,0.13)" : "0 1px 4px rgba(200,100,160,0.06)" }}>
      <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, border: `2px solid ${checked ? pink : "#f9a8d4"}`, background: checked ? "linear-gradient(135deg,#ff3fa4,#a855f7)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", boxShadow: checked ? "0 2px 10px rgba(255,63,164,0.4)" : "none" }}>
        {checked && <span style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{rule.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: checked ? pink : skipped ? "#ccc" : textMain, lineHeight: 1.3 }}>
          {rule.label}{skipped && <span style={{ fontSize: 11, color: "#ccc", marginLeft: 8, fontWeight: 400 }}>Rest day </span>}
        </div>
        <div style={{ fontSize: 11, color: textMuted, marginTop: 2 }}>{rule.note}</div>
      </div>
      {badge && <div style={{ fontSize: 11, fontWeight: 700, color: badgeAlert ? "#e84a4a" : "#22c55e", background: badgeAlert ? "#fff0f0" : "#f0fff8", border: `1px solid ${badgeAlert ? "#fca5a5" : "#86efac"}`, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>{badge}</div>}
    </div>
  );
}

const navBtnStyle = { background: "#fff0f8", border: "1.5px solid #fce7f3", color: "#ff3fa4", padding: "7px 16px", borderRadius: 20, fontSize: 12, fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.04em", fontWeight: 700, boxShadow: "0 2px 8px rgba(255,63,164,0.12)" };