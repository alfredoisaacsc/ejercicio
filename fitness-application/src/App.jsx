import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://imvebqiowdcfxxxlchgp.supabase.co";
const SUPABASE_KEY = "sb_publishable_HiwpVtf5AMQyTIBxtSblrA_6e31W73L";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const DAY_COLORS = { 1: "#6C63FF", 2: "#00C896", 3: "#FF6B6B", 4: "#FFB347" };
const DAYS_OF_WEEK = ["L", "M", "X", "J", "V", "S", "D"];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}
function getTodayDayIdx() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const S = {
  screen: {
    width: "100%", maxWidth: 430, margin: "0 auto",
    minHeight: "100vh", background: "#0a0a10",
    display: "flex", flexDirection: "column",
    fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif",
    color: "#F0EEF8",
  },
  input: {
    width: "100%", boxSizing: "border-box",
    background: "#111118", border: "1px solid #222",
    borderRadius: 12, color: "#F0EEF8", fontSize: 15,
    padding: "14px 16px", marginBottom: 12, outline: "none",
  },
  btnPrimary: (color = "#6C63FF") => ({
    width: "100%", padding: "15px", borderRadius: 13,
    background: color, color: color === "#6C63FF" ? "#fff" : "#000",
    fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer",
  }),
  btnGhost: {
    width: "100%", padding: "13px", borderRadius: 13,
    background: "transparent", color: "#6C63FF", fontSize: 14,
    border: "1px solid #6C63FF44", cursor: "pointer",
  },
  card: {
    background: "#111118", border: "1px solid #1e1e2e",
    borderRadius: 16, padding: "16px 18px", marginBottom: 10,
  },
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner({ color = "#6C63FF" }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: `2px solid #1e1e2e`, borderTopColor: color,
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit() {
    setError(""); setMsg(""); setLoading(true);
    try {
      if (mode === "register") {
        const { error: e } = await sb.auth.signUp({
          email, password: pass,
          options: { data: { nombre } }
        });
        if (e) throw e;
        setMsg("Revisa tu email para confirmar tu cuenta.");
      } else {
        const { data, error: e } = await sb.auth.signInWithPassword({ email, password: pass });
        if (e) throw e;
        onLogin(data.user);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.screen}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#6C63FF", fontWeight: 600, marginBottom: 8 }}>FITNESS APP</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#F0EEF8", margin: 0, lineHeight: 1.1 }}>
            {mode === "register" ? "Crear\ncuenta" : "Bienvenido\nde nuevo"}
          </h1>
        </div>

        {mode === "register" && (
          <input style={S.input} placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} />
        )}
        <input style={S.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={{ ...S.input, marginBottom: 8 }} placeholder="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />

        {error && <div style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#FF6B6B11", borderRadius: 10 }}>{error}</div>}
        {msg && <div style={{ color: "#00C896", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#00C89611", borderRadius: 10 }}>{msg}</div>}

        <div style={{ marginBottom: 12 }} />
        <button style={S.btnPrimary()} onClick={handleSubmit} disabled={loading}>
          {loading ? "..." : mode === "register" ? "Registrarme" : "Entrar"}
        </button>
        <div style={{ height: 10 }} />
        <button style={S.btnGhost} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMsg(""); }}>
          {mode === "login" ? "¿Sin cuenta? Registrarme" : "¿Ya tengo cuenta? Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}

// ─── Profile Setup Screen ─────────────────────────────────────────────────────
function ProfileScreen({ user, onDone }) {
  const [form, setForm] = useState({ nombre: "", peso: "", estatura: "", edad: "", experiencia: "principiante", lesiones: "" });
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await sb.from("profiles").upsert({ id: user.id, ...form, peso: +form.peso, estatura: +form.estatura, edad: +form.edad });
    setLoading(false);
    onDone({ ...user, profile: form });
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={S.screen}>
      <div style={{ flex: 1, overflowY: "auto", padding: "52px 28px 40px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#6C63FF", fontWeight: 600, marginBottom: 8 }}>PERFIL</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 28px", color: "#F0EEF8" }}>Cuéntanos sobre ti</h2>

        {[
          { label: "Nombre", key: "nombre", type: "text", placeholder: "Tu nombre" },
          { label: "Peso (kg)", key: "peso", type: "number", placeholder: "75" },
          { label: "Estatura (cm)", key: "estatura", type: "number", placeholder: "175" },
          { label: "Edad", key: "edad", type: "number", placeholder: "30" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>{label.toUpperCase()}</div>
            <input style={S.input} type={type} placeholder={placeholder} value={form[key]} onChange={e => f(key, e.target.value)} />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 8, letterSpacing: "0.08em" }}>EXPERIENCIA</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["principiante", "intermedio", "avanzado"].map(op => (
              <button key={op} onClick={() => f("experiencia", op)}
                style={{ flex: 1, padding: "10px 4px", borderRadius: 10, fontSize: 12, cursor: "pointer", fontWeight: 500,
                  background: form.experiencia === op ? "#6C63FF" : "#111118",
                  color: form.experiencia === op ? "#fff" : "#555",
                  border: `1px solid ${form.experiencia === op ? "#6C63FF" : "#222"}`,
                }}>
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>LESIONES / LIMITACIONES</div>
          <textarea
            style={{ ...S.input, minHeight: 80, resize: "vertical", fontFamily: "inherit" }}
            placeholder="Ej: lesión en hombro izquierdo, rodilla derecha..."
            value={form.lesiones}
            onChange={e => f("lesiones", e.target.value)}
          />
        </div>

        <button style={S.btnPrimary()} onClick={save} disabled={loading}>
          {loading ? "Guardando..." : "Guardar y continuar"}
        </button>
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ user, profile, days, logs, onSelectDay, onLogout, onEditProfile }) {
  const today = getTodayDayIdx();
  const todayStr_ = todayStr();

  const todayLogs = logs.filter(l => l.fecha === todayStr_);
  const weekLogs = logs.filter(l => {
    const d = new Date(l.fecha);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    return d >= weekStart;
  });

  const daysWorkedThisWeek = new Set(weekLogs.filter(l => l.completado).map(l => l.fecha)).size;

  function getDayProgress(day) {
    const dayLogs = logs.filter(l => l.completado && l.fecha === todayStr_ && day.exercises?.some(e => e.id === l.exercise_id));
    return { done: dayLogs.length, total: day.exercises?.length || 0 };
  }

  return (
    <div style={S.screen}>
      {/* Header */}
      <div style={{ padding: "52px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 3 }}>Hola,</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{profile?.nombre || user.email.split("@")[0]}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onEditProfile} style={{ background: "none", border: "1px solid #222", borderRadius: 8, padding: "6px 12px", color: "#666", fontSize: 12, cursor: "pointer" }}>perfil</button>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "#444", fontSize: 12, cursor: "pointer" }}>salir</button>
        </div>
      </div>

      {/* Week strip */}
      <div style={{ padding: "0 24px 20px" }}>
        <div style={{ display: "flex", gap: 7, justifyContent: "space-between" }}>
          {DAYS_OF_WEEK.map((d, i) => {
            const isToday = i === today;
            const hasLog = weekLogs.some(l => {
              const wd = new Date(l.fecha + "T12:00:00");
              return (wd.getDay() === 0 ? 6 : wd.getDay() - 1) === i && l.completado;
            });
            return (
              <div key={i} style={{
                flex: 1, aspectRatio: "1", borderRadius: 10,
                background: isToday ? "#6C63FF" : hasLog ? "#1e1e2e" : "#111118",
                border: isToday ? "none" : hasLog ? "1px solid #6C63FF55" : "1px solid #1a1a1a",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
              }}>
                <span style={{ fontSize: 10, color: isToday ? "#fff" : "#444", fontWeight: 600 }}>{d}</span>
                {hasLog && <div style={{ width: 4, height: 4, borderRadius: 99, background: isToday ? "#fff" : "#6C63FF" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
        {[
          { label: "Días esta semana", val: daysWorkedThisWeek },
          { label: "Ejercicios hoy", val: todayLogs.filter(l => l.completado).length },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#111118", borderRadius: 14, padding: "14px 16px", border: "1px solid #1e1e1e" }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Days list */}
      <div style={{ padding: "0 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#444", fontWeight: 600, marginBottom: 14 }}>RUTINA SEMANAL</div>
        {days.map((day, idx) => {
          const { done, total } = getDayProgress(day);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isToday = idx === today;
          const color = DAY_COLORS[day.id] || "#6C63FF";
          return (
            <div key={day.id} onClick={() => onSelectDay(day)}
              style={{ ...S.card, cursor: "pointer", position: "relative", overflow: "hidden", border: `1px solid ${isToday ? color + "44" : "#1e1e1e"}` }}>
              {isToday && <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "2px 0 0 2px" }} />}
              <div style={{ paddingLeft: isToday ? 8 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>Día {day.id} · {day.tag}</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{day.nombre}</div>
                    <div style={{ fontSize: 12, color: "#444", marginTop: 3 }}>{total} ejercicios</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: pct === 100 ? color : "#2a2a2a" }}>{pct}%</div>
                </div>
                {pct > 0 && (
                  <div style={{ marginTop: 10, height: 2, background: "#1e1e1e", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ─── Day Screen ───────────────────────────────────────────────────────────────
function DayScreen({ day, onBack, onSelectExercise, logs, onToggle, onWeightChange }) {
  const color = DAY_COLORS[day.id] || "#6C63FF";
  const today = todayStr();
  const exercises = day.exercises || [];

  function getLog(exId) {
    return logs.find(l => l.exercise_id === exId && l.fecha === today);
  }

  const done = exercises.filter(ex => getLog(ex.id)?.completado).length;
  const pct = exercises.length > 0 ? Math.round((done / exercises.length) * 100) : 0;

  return (
    <div style={S.screen}>
      <div style={{ padding: "52px 24px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13, padding: 0, marginBottom: 16 }}>← Volver</button>
        <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Día {day.id} · {day.tag}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>{day.nombre}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#444" }}>{done}/{exercises.length} completados</div>
          <div style={{ flex: 1, height: 3, background: "#1e1e1e", borderRadius: 99 }}>
            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
        {exercises.map((ex, idx) => {
          const log = getLog(ex.id);
          const isDone = log?.completado || false;
          const w = log?.peso_usado ?? ex.peso_sugerido ?? 0;
          return (
            <div key={ex.id} style={{
              background: isDone ? "#0d1a14" : "#111118",
              border: `1px solid ${isDone ? color + "44" : "#1e1e1e"}`,
              borderRadius: 14, padding: "14px 16px", marginBottom: 8,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div onClick={() => onToggle(ex.id, !isDone, w)}
                style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${isDone ? color : "#333"}`, background: isDone ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                {isDone && <span style={{ color: "#000", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onSelectExercise(idx)}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? "#444" : "#E0DDF5", textDecoration: isDone ? "line-through" : "none" }}>{ex.nombre}</div>
                <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{ex.series} series · {ex.reps} reps</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <input type="number" value={w}
                  onChange={e => onWeightChange(ex.id, +e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{ width: 44, textAlign: "center", background: "#1a1a26", border: "1px solid #2a2a3a", borderRadius: 8, color: "#F0EEF8", fontSize: 14, fontWeight: 600, padding: "4px 0", outline: "none" }}
                />
                <div style={{ fontSize: 9, color: "#444" }}>kg</div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ─── Exercise Screen ──────────────────────────────────────────────────────────
function ExerciseScreen({ day, startIdx, onBack, logs, onToggle, onWeightChange }) {
  const [idx, setIdx] = useState(startIdx);
  const touchStart = useRef(null);
  const color = DAY_COLORS[day.id] || "#6C63FF";
  const exercises = day.exercises || [];
  const ex = exercises[idx];
  const today = todayStr();

  function getLog(exId) { return logs.find(l => l.exercise_id === exId && l.fecha === today); }

  const log = getLog(ex?.id);
  const isDone = log?.completado || false;
  const weight = log?.peso_usado ?? ex?.peso_sugerido ?? 0;

  function handleTouchStart(e) { touchStart.current = e.touches[0].clientX; }
  function handleTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) < 50) return;
    setIdx(i => dx < 0 ? (i + 1) % exercises.length : (i - 1 + exercises.length) % exercises.length);
    touchStart.current = null;
  }

  if (!ex) return null;

  return (
    <div style={{ ...S.screen, background: "#0a0a10" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div style={{ padding: "52px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13, padding: 0 }}>← Lista</button>
        <div style={{ display: "flex", gap: 5 }}>
          {exercises.map((e, i) => {
            const done = getLog(e.id)?.completado;
            return (
              <div key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 18 : 6, height: 6, borderRadius: 99, cursor: "pointer",
                background: i === idx ? color : done ? color + "66" : "#222",
                transition: "width 0.25s",
              }} />
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: "#444" }}>{idx + 1}/{exercises.length}</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 24px 40px", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>{day.tag}</div>
          <h2 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.15 }}>{ex.nombre}</h2>
          <div style={{ fontSize: 14, color: "#555", marginBottom: 28 }}>{ex.series} series · {ex.reps} repeticiones</div>

          <div style={{ ...S.card, marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#444", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 8 }}>INDICACIONES</div>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.65, margin: 0 }}>{ex.descripcion}</p>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Array.from({ length: ex.series }).map((_, i) => (
              <div key={i} style={{ padding: "6px 14px", borderRadius: 99, border: `1px solid ${color}44`, fontSize: 12, color, background: color + "11" }}>
                Serie {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ ...S.card, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", fontWeight: 600 }}>PESO</div>
              <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>modificable</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => onWeightChange(ex.id, Math.max(0, weight - 1))}
                style={{ width: 34, height: 34, borderRadius: 10, background: "#1e1e2e", border: "1px solid #2a2a3a", color: "#F0EEF8", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <div style={{ textAlign: "center", minWidth: 44 }}>
                <span style={{ fontSize: 28, fontWeight: 700 }}>{weight}</span>
                <span style={{ fontSize: 12, color: "#444", marginLeft: 4 }}>kg</span>
              </div>
              <button onClick={() => onWeightChange(ex.id, weight + 1)}
                style={{ width: 34, height: 34, borderRadius: 10, background: "#1e1e2e", border: "1px solid #2a2a3a", color: "#F0EEF8", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>

          <button onClick={() => { onToggle(ex.id, !isDone, weight); if (!isDone && idx < exercises.length - 1) setIdx(i => i + 1); }}
            style={{ width: "100%", padding: 16, borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              background: isDone ? "#0d1a14" : color,
              color: isDone ? color : (color === "#FFB347" ? "#000" : "#fff"),
              border: `1.5px solid ${isDone ? color + "55" : "transparent"}`,
            }}>
            {isDone ? "✓ Completado" : "Marcar como hecho"}
          </button>

          <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#333" }}>desliza para navegar</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [days, setDays] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);
  const [startExIdx, setStartExIdx] = useState(0);
  const [showProfile, setShowProfile] = useState(false);

  // Auth listener
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) { setLoading(false); setProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load data when logged in
  useEffect(() => {
    if (!session?.user) return;
    loadAll();
  }, [session]);

  async function loadAll() {
    setLoading(true);
    const userId = session.user.id;

    const [{ data: prof }, { data: daysData }, { data: logsData }] = await Promise.all([
      sb.from("profiles").select("*").eq("id", userId).single(),
      sb.from("workout_days").select("*, exercises(*)").order("orden"),
      sb.from("exercise_logs").select("*").eq("user_id", userId),
    ]);

    if (prof) setProfile(prof);
    else setShowProfile(true);

    if (daysData) {
      setDays(daysData.map(d => ({
        ...d,
        exercises: (d.exercises || []).sort((a, b) => a.orden - b.orden)
      })));
    }
    if (logsData) setLogs(logsData);
    setLoading(false);
  }

  const upsertLog = useCallback(async (exerciseId, completado, pesoUsado) => {
    if (!session?.user) return;
    const today = todayStr();
    const newLog = { user_id: session.user.id, exercise_id: exerciseId, completado, peso_usado: pesoUsado, fecha: today };

    // Optimistic update
    setLogs(prev => {
      const existing = prev.findIndex(l => l.exercise_id === exerciseId && l.fecha === today);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], ...newLog };
        return next;
      }
      return [...prev, { ...newLog, id: `tmp-${exerciseId}` }];
    });

    const { data } = await sb.from("exercise_logs").upsert(newLog, { onConflict: "user_id,exercise_id,fecha" }).select().single();
    if (data) {
      setLogs(prev => {
        const existing = prev.findIndex(l => l.exercise_id === exerciseId && l.fecha === today);
        if (existing >= 0) { const next = [...prev]; next[existing] = data; return next; }
        return [...prev.filter(l => l.id !== `tmp-${exerciseId}`), data];
      });
    }
  }, [session]);

  const handleWeightChange = useCallback(async (exerciseId, peso) => {
    const today = todayStr();
    const existing = logs.find(l => l.exercise_id === exerciseId && l.fecha === today);
    await upsertLog(exerciseId, existing?.completado || false, peso);
  }, [logs, upsertLog]);

  if (loading) return <div style={S.screen}><Spinner /></div>;
  if (!session) return <LoginScreen onLogin={() => {}} />;
  if (showProfile) return <ProfileScreen user={session.user} onDone={p => { setProfile(p.profile); setShowProfile(false); loadAll(); }} />;

  if (screen === "exercise" && selectedDay) {
    return (
      <ExerciseScreen
        day={selectedDay}
        startIdx={startExIdx}
        onBack={() => setScreen("day")}
        logs={logs}
        onToggle={upsertLog}
        onWeightChange={handleWeightChange}
      />
    );
  }

  if (screen === "day" && selectedDay) {
    return (
      <DayScreen
        day={selectedDay}
        onBack={() => { setScreen("home"); setSelectedDay(null); }}
        onSelectExercise={i => { setStartExIdx(i); setScreen("exercise"); }}
        logs={logs}
        onToggle={upsertLog}
        onWeightChange={handleWeightChange}
      />
    );
  }

  return (
    <HomeScreen
      user={session.user}
      profile={profile}
      days={days}
      logs={logs}
      onSelectDay={d => { setSelectedDay(d); setScreen("day"); }}
      onLogout={() => sb.auth.signOut()}
      onEditProfile={() => setShowProfile(true)}
    />
  );
}
