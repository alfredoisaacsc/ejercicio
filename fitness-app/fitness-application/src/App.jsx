import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://imvebqiowdcfxxxlchgp.supabase.co";
const SUPABASE_KEY = "sb_publishable_HiwpVtf5AMQyTIBxtSblrA_6e31W73L";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const DAY_COLORS = { 1: "#6C63FF", 2: "#00C896", 3: "#FF6B6B", 4: "#FFB347" };
const DAYS_OF_WEEK = ["L", "M", "X", "J", "V", "S", "D"];

// YouTube video IDs por ejercicio (puedes reemplazar con los tuyos)
const YOUTUBE_IDS = {
  "Press mancuernas": "VmB1G1K7v94",
  "Apertura con mancuernas": "eozdVDA78K0",
  "Fondos en banco": "dips-fondos",
  "Elevaciones laterales": "3VcKaXpzqRo",
  "Rotaciones externas con banda": "YmEl5LXFzEM",
  "Face pull": "eIq5CB9JfKE",
  "Isométrico de brazo": null,
  "Sentadilla goblet": "MxsFDhcyFyE",
  "Peso muerto rumano": "JCXUYuzwNrM",
  "Prensa de pierna": "IZxyjW7MPJQ",
  "Curl femoral tumbado": "1Tq3QdYUuHs",
  "Plancha": "ASdvSqt0T2Q",
  "Crunch en polea": "AV5PnNXGVZs",
  "Jalón al pecho": "CAwf7n6Luuc",
  "Remo con mancuerna": "roCP2ef7atI",
  "Remo en polea baja": "GZbfZ033f74",
  "Reverse fly": "QENKPHhQVi4",
  "Curl de bíceps con barra": "ykJmrZ5v0Oo",
  "Curl martillo": "zC3nLlEvin4",
  "Tríceps en polea": "2-LAMcpzODU",
  "Extensión de tríceps sobre cabeza": "nRiJVZDpdL0",
  "Curl de muñeca": "wrist-curl",
};

function todayStr() { return new Date().toISOString().split("T")[0]; }
function getTodayDayIdx() { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; }

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  screen: {
    width: "100%", maxWidth: 430, margin: "0 auto", minHeight: "100vh",
    background: "#0a0a10", display: "flex", flexDirection: "column",
    fontFamily: "'SF Pro Display', -apple-system, 'Helvetica Neue', sans-serif", color: "#F0EEF8",
  },
  input: {
    width: "100%", boxSizing: "border-box", background: "#111118",
    border: "1px solid #222", borderRadius: 12, color: "#F0EEF8",
    fontSize: 15, padding: "14px 16px", marginBottom: 12, outline: "none",
  },
  btnPrimary: (color = "#6C63FF") => ({
    width: "100%", padding: "15px", borderRadius: 13, background: color,
    color: ["#6C63FF", "#FF6B6B"].includes(color) ? "#fff" : "#000",
    fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer",
  }),
  btnGhost: {
    width: "100%", padding: "13px", borderRadius: 13, background: "transparent",
    color: "#6C63FF", fontSize: 14, border: "1px solid #6C63FF44", cursor: "pointer",
  },
  card: { background: "#111118", border: "1px solid #1e1e2e", borderRadius: 16, padding: "16px 18px", marginBottom: 10 },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ color = "#6C63FF", size = 32 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, padding: 40 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", border: "2px solid #1e1e2e", borderTopColor: color, animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [msg, setMsg] = useState("");

  async function submit() {
    setError(""); setMsg(""); setLoading(true);
    try {
      if (mode === "register") {
        const { error: e } = await sb.auth.signUp({ email, password: pass, options: { data: { nombre } } });
        if (e) throw e;
        setMsg("Revisa tu email para confirmar tu cuenta.");
      } else {
        const { data, error: e } = await sb.auth.signInWithPassword({ email, password: pass });
        if (e) throw e;
        onLogin(data.user);
      }
    } catch (e) { setError(e.message); } finally { setLoading(false); }
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
        {mode === "register" && <input style={S.input} placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} />}
        <input style={S.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={{ ...S.input, marginBottom: 8 }} placeholder="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        {error && <div style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#FF6B6B11", borderRadius: 10 }}>{error}</div>}
        {msg && <div style={{ color: "#00C896", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#00C89611", borderRadius: 10 }}>{msg}</div>}
        <div style={{ height: 10 }} />
        <button style={S.btnPrimary()} onClick={submit} disabled={loading}>{loading ? "..." : mode === "register" ? "Registrarme" : "Entrar"}</button>
        <div style={{ height: 10 }} />
        <button style={S.btnGhost} onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); setMsg(""); }}>
          {mode === "login" ? "¿Sin cuenta? Registrarme" : "¿Ya tengo cuenta? Iniciar sesión"}
        </button>
      </div>
    </div>
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────
function ChangePasswordScreen({ onBack }) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function save() {
    if (pass.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (pass !== confirm) return setError("Las contraseñas no coinciden.");
    setLoading(true); setError(""); setMsg("");
    const { error: e } = await sb.auth.updateUser({ password: pass });
    setLoading(false);
    if (e) setError(e.message);
    else { setMsg("Contraseña actualizada correctamente."); setPass(""); setConfirm(""); }
  }

  return (
    <div style={S.screen}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "52px 28px 40px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13, padding: 0, marginBottom: 24, textAlign: "left" }}>← Volver</button>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#6C63FF", fontWeight: 600, marginBottom: 8 }}>SEGURIDAD</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 28px" }}>Cambiar contraseña</h2>
        <div style={{ fontSize: 11, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>NUEVA CONTRASEÑA</div>
        <input style={S.input} type="password" placeholder="Mínimo 6 caracteres" value={pass} onChange={e => setPass(e.target.value)} />
        <div style={{ fontSize: 11, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>CONFIRMAR CONTRASEÑA</div>
        <input style={{ ...S.input, marginBottom: 20 }} type="password" placeholder="Repite la contraseña" value={confirm} onChange={e => setConfirm(e.target.value)} />
        {error && <div style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#FF6B6B11", borderRadius: 10 }}>{error}</div>}
        {msg && <div style={{ color: "#00C896", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#00C89611", borderRadius: 10 }}>{msg}</div>}
        <button style={S.btnPrimary()} onClick={save} disabled={loading}>{loading ? "Guardando..." : "Actualizar contraseña"}</button>
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileScreen({ user, existing, onDone, onChangePassword }) {
  const [form, setForm] = useState(() => {
    const base = existing || {};
    return {
      nombre: base.nombre || "",
      peso: base.peso || "",
      estatura: base.estatura || "",
      edad: base.edad || "",
      sexo: base.sexo || "masculino",
      experiencia: base.experiencia || "principiante",
      lesiones: base.lesiones || "",
      equipo: Array.isArray(base.equipo) ? base.equipo : (base.equipo ? base.equipo.split(",").map(e => e.trim()).filter(Boolean) : []),
      objetivo: base.objetivo || "masa_muscular",
      preferencias: base.preferencias || "",
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.sexo) return setError("Selecciona tu sexo.");
    setError(""); setLoading(true);
    const toSave = { ...form, peso: +form.peso, estatura: +form.estatura, edad: +form.edad, equipo: (form.equipo || []).join(",") };
    await sb.from("profiles").upsert({ id: user.id, ...toSave });
    setLoading(false);
    onDone(form);
  }

  return (
    <div style={S.screen}>
      <div style={{ flex: 1, overflowY: "auto", padding: "52px 28px 40px" }}>
        {/* Header con botones */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <button onClick={onDone.bind(null, existing || {})} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13, padding: 0 }}>← Volver</button>
          <button onClick={() => sb.auth.signOut()} style={{ background: "none", border: "1px solid #FF6B6B44", borderRadius: 8, padding: "6px 12px", color: "#FF6B6B", fontSize: 12, cursor: "pointer" }}>Salir</button>
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#6C63FF", fontWeight: 600, marginBottom: 8 }}>PERFIL</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>Cuéntanos sobre ti</h2>
        <p style={{ fontSize: 13, color: "#555", marginBottom: 28 }}>La IA usará estos datos para generar tu rutina personalizada.</p>

        {/* Sexo */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 8, letterSpacing: "0.08em" }}>SEXO</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ val: "masculino", label: "♂ Hombre" }, { val: "femenino", label: "♀ Mujer" }].map(op => (
              <button key={op.val} onClick={() => f("sexo", op.val)} style={{ flex: 1, padding: "12px 4px", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: 600, background: form.sexo === op.val ? "#6C63FF" : "#111118", color: form.sexo === op.val ? "#fff" : "#555", border: `1px solid ${form.sexo === op.val ? "#6C63FF" : "#222"}` }}>
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {[{ label: "Nombre", key: "nombre", type: "text", ph: "Tu nombre" }, { label: "Peso (kg)", key: "peso", type: "number", ph: "75" }, { label: "Estatura (cm)", key: "estatura", type: "number", ph: "175" }, { label: "Edad", key: "edad", type: "number", ph: "30" }].map(({ label, key, type, ph }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>{label.toUpperCase()}</div>
            <input style={S.input} type={type} placeholder={ph} value={form[key]} onChange={e => f(key, e.target.value)} />
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 8, letterSpacing: "0.08em" }}>EXPERIENCIA</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["principiante", "intermedio", "avanzado"].map(op => (
              <button key={op} onClick={() => f("experiencia", op)} style={{ flex: 1, padding: "10px 4px", borderRadius: 10, fontSize: 12, cursor: "pointer", fontWeight: 500, background: form.experiencia === op ? "#6C63FF" : "#111118", color: form.experiencia === op ? "#fff" : "#555", border: `1px solid ${form.experiencia === op ? "#6C63FF" : "#222"}` }}>
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>LESIONES / LIMITACIONES</div>
          <textarea style={{ ...S.input, minHeight: 70, resize: "none", fontFamily: "inherit", marginBottom: 0 }} placeholder="Ej: lesión en hombro izquierdo, rodilla derecha..." value={form.lesiones} onChange={e => f("lesiones", e.target.value)} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>EQUIPO DISPONIBLE</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {["Mancuernas", "Barra", "Máquinas", "Bandas elásticas", "Peso corporal", "Kettlebell", "TRX", "Poleas"].map(eq => {
              const sel = (form.equipo || []).includes(eq);
              return (
                <button key={eq} onClick={() => { const cur = form.equipo || []; f("equipo", sel ? cur.filter(e => e !== eq) : [...cur, eq]); }}
                  style={{ padding: "7px 12px", borderRadius: 99, fontSize: 12, cursor: "pointer", fontWeight: 500, background: sel ? "#6C63FF22" : "#111118", color: sel ? "#6C63FF" : "#555", border: `1px solid ${sel ? "#6C63FF" : "#222"}` }}>
                  {eq}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 8, marginTop: 16 }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 8, letterSpacing: "0.08em" }}>OBJETIVO PRINCIPAL</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {[
              { val: "masa_muscular", label: "💪 Masa muscular" },
              { val: "bajar_peso", label: "🔥 Bajar de peso" },
              { val: "tonificar", label: "✦ Tonificar" },
              { val: "resistencia", label: "🏃 Resistencia" },
              { val: "fuerza", label: "⚡ Fuerza" },
              { val: "flexibilidad", label: "🧘 Flexibilidad" },
            ].map(op => {
              const sel = form.objetivo === op.val;
              return (
                <button key={op.val} onClick={() => f("objetivo", op.val)}
                  style={{ padding: "8px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer", fontWeight: 500, background: sel ? "#6C63FF" : "#111118", color: sel ? "#fff" : "#555", border: `1px solid ${sel ? "#6C63FF" : "#222"}` }}>
                  {op.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 8, marginTop: 16 }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>OTRAS PREFERENCIAS (opcional)</div>
          <textarea style={{ ...S.input, minHeight: 70, resize: "none", fontFamily: "inherit", marginBottom: 0 }} placeholder="Ej: prefiero no hacer sentadillas, me gustan los ejercicios funcionales..." value={form.preferencias} onChange={e => f("preferencias", e.target.value)} />
        </div>

        {error && <div style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#FF6B6B11", borderRadius: 10 }}>{error}</div>}
        <button style={{ ...S.btnPrimary(), marginBottom: 10 }} onClick={save} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
        <button onClick={onChangePassword} style={{ ...S.btnGhost, color: "#555", borderColor: "#222" }}>🔒 Cambiar contraseña</button>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

// ─── AI Routine Generator ─────────────────────────────────────────────────────
function AIRoutineScreen({ profile, onDone, onSkip }) {
  const [loading, setLoading] = useState(false);
  const [routine, setRoutine] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  async function generate() {
    setLoading(true); setError("");
    try {
      const equipoArr = Array.isArray(profile.equipo) ? profile.equipo : (profile.equipo ? profile.equipo.split(",").map(e => e.trim()).filter(Boolean) : []);
      const equipoStr = equipoArr.length > 0 ? equipoArr.join(", ") : "gimnasio completo";
      const soloEquipo = equipoArr.length > 0;
      const objetivoLabels = { masa_muscular: "ganar masa muscular e hipertrofia", bajar_peso: "bajar de peso y quemar grasa", tonificar: "tonificar y definir el cuerpo", resistencia: "mejorar resistencia cardiovascular", fuerza: "ganar fuerza máxima", flexibilidad: "mejorar flexibilidad y movilidad" };
      const objetivoStr = objetivoLabels[profile.objetivo] || "mejorar condición física general";

      // Build injury-specific forbidden exercise list
      const lesionesStr = profile.lesiones || "";
      let ejerciciosProhibidos = "";
      if (lesionesStr) {
        const prohibidos = [];
        if (/codo|artrosis|codo/i.test(lesionesStr)) prohibidos.push("flexiones, fondos, press con barra, extensiones de tríceps, dominadas, plancha con apoyo en manos");
        if (/hombro|manguito|labrum/i.test(lesionesStr)) prohibidos.push("press militar, elevaciones frontales, jalón detrás del cuello, remo al mentón");
        if (/rodilla|menisco|ligamento/i.test(lesionesStr)) prohibidos.push("sentadilla profunda, zancadas, saltos, leg press con mucho peso");
        if (/lumbar|espalda baja|hernia/i.test(lesionesStr)) prohibidos.push("peso muerto convencional, sentadilla con barra, buenos días");
        if (/muñeca/i.test(lesionesStr)) prohibidos.push("flexiones, press con barra, curl con barra");
        if (prohibidos.length > 0) {
          ejerciciosProhibidos = `\nEJERCICIOS COMPLETAMENTE PROHIBIDOS por las lesiones (${lesionesStr}):\n${prohibidos.join("\n")}\nNO incluyas ninguno de estos ni ejercicios similares.`;
        }
      }
      const equipoGuia = soloEquipo ? `
RESTRICCIÓN CRÍTICA DE EQUIPO — ESTO ES LO MÁS IMPORTANTE:
El usuario SOLO tiene acceso a: ${equipoStr}.
PROHIBIDO usar cualquier máquina de gimnasio (polea, prensa, jalón, etc.) a menos que esté explícitamente en la lista.
PROHIBIDO sugerir equipamiento que NO esté en la lista anterior.
Ejemplos de ejercicios PERMITIDOS según el equipo:
${equipoArr.includes("Mancuernas") ? "- Mancuernas: press, curl, remo, extensiones, elevaciones, sentadilla goblet" : ""}
${equipoArr.includes("Barra") ? "- Barra: press banca, peso muerto, sentadilla, remo, dominadas con barra" : ""}
${equipoArr.includes("Bandas elásticas") ? "- Bandas: jalón con banda, curl con banda, face pull, glúteo con banda, rotaciones" : ""}
${equipoArr.includes("Peso corporal") ? "- Peso corporal: flexiones, fondos, sentadillas, zancadas, plancha, burpees" : ""}
${equipoArr.includes("Kettlebell") ? "- Kettlebell: swing, goblet squat, press, remo, snatch" : ""}
${equipoArr.includes("TRX") ? "- TRX: remo en suspensión, flexiones TRX, zancadas, core" : ""}
${equipoArr.includes("Máquinas") ? "- Máquinas: todas las máquinas de gimnasio disponibles" : ""}
${equipoArr.includes("Poleas") ? "- Poleas: jalón, polea baja, face pull, extensión tríceps, curl" : ""}
Si un ejercicio requiere equipo que NO está en la lista, SUSTITÚYELO por uno equivalente con el equipo disponible.` : "El usuario tiene acceso a gimnasio completo con todas las máquinas y equipos.";

      const prompt = `Eres un entrenador personal experto. Crea una rutina de gimnasio de 4 días personalizada.

DATOS DEL USUARIO:
- Nombre: ${profile.nombre}
- Sexo: ${profile.sexo || "masculino"}
- Edad: ${profile.edad} años, Peso: ${profile.peso}kg, Estatura: ${profile.estatura}cm
- Nivel: ${profile.experiencia}
- Objetivo: ${objetivoStr}
- Lesiones: ${profile.lesiones || "ninguna"}
- Preferencias: ${profile.preferencias || "ninguna"}

${equipoGuia}

INSTRUCCIONES:
1. ${soloEquipo ? `SOLO usa ejercicios con: ${equipoStr}. NINGÚN otro equipo.` : "Usa cualquier equipo de gimnasio."}
2. Adapta al objetivo: ${objetivoStr}
3. Evita ejercicios que afecten: ${profile.lesiones || "ninguna limitación"}${ejerciciosProhibidos ? `\n${ejerciciosProhibidos}` : ""}
4. ${profile.sexo === "femenino" ? "Mujer: prioriza glúteos, core y piernas con más repeticiones." : "Hombre: equilibra tren superior e inferior para hipertrofia."}

RESPONDE SOLO CON JSON VÁLIDO sin texto extra ni markdown:
{"days":[{"id":1,"nombre":"nombre del día","tag":"etiqueta","color":"#6C63FF","exercises":[{"id":1,"nombre":"nombre ejercicio","series":4,"reps":"10-12","descripcion":"Técnica detallada de ejecución con postura y respiración correcta durante el movimiento.","peso_sugerido":20}]}]}

REGLAS JSON:
- Exactamente 4 días, exactamente 5 ejercicios por día
- Colores FIJOS: día1=#6C63FF día2=#00C896 día3=#FF6B6B día4=#FFB347
- IDs: día1=1-5, día2=101-105, día3=201-205, día4=301-305
- descripcion OBLIGATORIA 80-150 caracteres
- SOLO JSON, sin texto antes ni después`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Eres un entrenador personal. Respondes ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown, sin backticks." },
            { role: "user", content: prompt }
          ],
          max_tokens: 4000,
          temperature: 0.5,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Error de Groq");
      const text = data.choices?.[0]?.message?.content || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (!parsed.days || parsed.days.length === 0) throw new Error("Respuesta inválida");
      setRoutine(parsed);
    } catch (e) {
      setError("Error generando rutina: " + e.message);
      console.error(e);
    } finally { setLoading(false); }
  }

  useEffect(() => { generate(); }, []);

  if (loading) return (
    <div style={S.screen}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <Spinner color="#6C63FF" size={48} />
        <div style={{ marginTop: 24, fontSize: 16, fontWeight: 600, color: "#F0EEF8" }}>Generando tu rutina</div>
        <div style={{ fontSize: 13, color: "#555", marginTop: 8, textAlign: "center" }}>La IA está analizando tu perfil y creando ejercicios adaptados a ti...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={S.screen}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 14, color: "#FF6B6B", textAlign: "center", marginBottom: 24 }}>{error}</div>
        <button style={S.btnPrimary()} onClick={generate}>Reintentar</button>
        <div style={{ height: 12 }} />
        <button style={S.btnGhost} onClick={onSkip}>Usar rutina estándar</button>
      </div>
    </div>
  );

  return (
    <div style={S.screen}>
      <div style={{ padding: "52px 24px 0" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#6C63FF", fontWeight: 600, marginBottom: 8 }}>IA</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Tu rutina está lista</h2>
        <p style={{ fontSize: 13, color: "#555", marginBottom: 20 }}>Generada especialmente para {profile.nombre}. Puedes editarla antes de guardar.</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
        {routine?.days?.map(day => (
          <div key={day.id} style={{ ...S.card, borderColor: day.color + "44" }}>
            <div style={{ fontSize: 11, color: day.color, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Día {day.id} · {day.tag}</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{day.nombre}</div>
            {day.exercises?.map(ex => (
              <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: "1px solid #1a1a1a" }}>
                <div style={{ width: 6, height: 6, borderRadius: 99, background: day.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{ex.nombre}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>{ex.series} series · {ex.reps} reps · {ex.peso_sugerido}kg</div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div style={{ height: 16 }} />
        <button style={S.btnPrimary()} onClick={() => onDone(routine)}>Guardar esta rutina</button>
        <div style={{ height: 10 }} />
        <button style={{ ...S.btnGhost, marginBottom: 8 }} onClick={generate}>Regenerar con IA</button>
        <button style={{ ...S.btnGhost, color: "#555", borderColor: "#222" }} onClick={onSkip}>Usar rutina estándar</button>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen({ user, profile, days, logs, streak, onSelectDay, onLogout, onEditProfile, onRegenerateRoutine }) {
  const today = getTodayDayIdx();
  const todayStr_ = todayStr();
  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const weekLogs = logs.filter(l => { const d = new Date(l.fecha + "T12:00:00"); return d >= weekStart && l.completado; });
  const daysWorked = new Set(weekLogs.map(l => l.fecha)).size;
  const todayDone = logs.filter(l => l.fecha === todayStr_ && l.completado).length;

  function getDayProgress(day) {
    const done = (day.exercises || []).filter(ex => logs.find(l => l.exercise_id === ex.id && l.fecha === todayStr_ && l.completado)).length;
    return { done, total: (day.exercises || []).length };
  }

  return (
    <div style={S.screen}>
      <div style={{ padding: "52px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, color: "#555", marginBottom: 3 }}>Hola,</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{profile?.nombre || user.email.split("@")[0]}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onRegenerateRoutine} style={{ background: "none", border: "1px solid #6C63FF44", borderRadius: 8, padding: "6px 10px", color: "#6C63FF", fontSize: 11, cursor: "pointer" }}>✦ IA</button>
          <button onClick={onEditProfile} style={{ background: "none", border: "1px solid #222", borderRadius: 8, padding: "6px 10px", color: "#555", fontSize: 12, cursor: "pointer" }}>perfil</button>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "#333", fontSize: 12, cursor: "pointer" }}>salir</button>
        </div>
      </div>

      {/* Week strip */}
      <div style={{ padding: "0 24px 20px" }}>
        <div style={{ display: "flex", gap: 7 }}>
          {DAYS_OF_WEEK.map((d, i) => {
            const isToday = i === today;
            const hasLog = weekLogs.some(l => { const wd = new Date(l.fecha + "T12:00:00"); return (wd.getDay() === 0 ? 6 : wd.getDay() - 1) === i; });
            return (
              <div key={i} style={{ flex: 1, aspectRatio: "1", borderRadius: 10, background: isToday ? "#6C63FF" : hasLog ? "#1a1a2e" : "#111118", border: isToday ? "none" : hasLog ? "1px solid #6C63FF55" : "1px solid #1a1a1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <span style={{ fontSize: 10, color: isToday ? "#fff" : "#444", fontWeight: 600 }}>{d}</span>
                {hasLog && <div style={{ width: 4, height: 4, borderRadius: 99, background: isToday ? "#fff" : "#6C63FF" }} />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
        {[
          { label: "Días esta semana", val: daysWorked },
          { label: "Ejercicios hoy", val: todayDone },
          { label: "Racha", val: `🔥 ${streak}` },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#111118", borderRadius: 14, padding: "14px 10px", border: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 4, letterSpacing: "0.06em" }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 24px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "#444", fontWeight: 600, marginBottom: 14 }}>RUTINA SEMANAL</div>
        {days.map((day, idx) => {
          const { done, total } = getDayProgress(day);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isToday = idx === today;
          const color = day.color || DAY_COLORS[day.id] || "#6C63FF";
          return (
            <div key={day.id} onClick={() => onSelectDay(day)} style={{ ...S.card, cursor: "pointer", position: "relative", overflow: "hidden", border: `1px solid ${isToday ? color + "55" : "#1a1a1a"}` }}>
              {isToday && <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color }} />}
              <div style={{ paddingLeft: isToday ? 8 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>Día {day.id} · {day.tag}</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{day.nombre}</div>
                    <div style={{ fontSize: 12, color: "#444", marginTop: 3 }}>{total} ejercicios</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: pct === 100 ? color : "#222" }}>{pct}%</div>
                </div>
                {pct > 0 && <div style={{ marginTop: 10, height: 2, background: "#1e1e1e", borderRadius: 99 }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} /></div>}
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
  const color = day.color || DAY_COLORS[day.id] || "#6C63FF";
  const today_ = todayStr();
  const exercises = day.exercises || [];
  const getLog = id => logs.find(l => l.exercise_id === id && l.fecha === today_);
  const done = exercises.filter(ex => getLog(ex.id)?.completado).length;
  const pct = exercises.length > 0 ? Math.round((done / exercises.length) * 100) : 0;

  return (
    <div style={S.screen}>
      <div style={{ padding: "52px 24px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13, padding: 0, marginBottom: 16 }}>← Volver</button>
        <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Día {day.id} · {day.tag}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>{day.nombre}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#444" }}>{done}/{exercises.length}</div>
          <div style={{ flex: 1, height: 3, background: "#1e1e1e", borderRadius: 99 }}><div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.3s" }} /></div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
        {exercises.map((ex, idx) => {
          const log = getLog(ex.id); const isDone = log?.completado || false;
          const w = log?.peso_usado ?? ex.peso_sugerido ?? 0;
          return (
            <div key={ex.id} style={{ background: isDone ? "#0d1a14" : "#111118", border: `1px solid ${isDone ? color + "44" : "#1a1a1a"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <div onClick={() => onToggle(ex.id, !isDone, w)} style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${isDone ? color : "#333"}`, background: isDone ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                {isDone && <span style={{ color: "#000", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onSelectExercise(idx)}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? "#444" : "#E0DDF5", textDecoration: isDone ? "line-through" : "none" }}>{ex.nombre}</div>
                <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{ex.series} series · {ex.reps} reps</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <input type="number" value={w} onChange={e => onWeightChange(ex.id, +e.target.value)} onClick={e => e.stopPropagation()} style={{ width: 44, textAlign: "center", background: "#1a1a26", border: "1px solid #2a2a3a", borderRadius: 8, color: "#F0EEF8", fontSize: 14, fontWeight: 600, padding: "4px 0", outline: "none" }} />
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

// ─── Media Fallback — asks Groq for a YouTube ID, saves to Supabase ──────────
function MediaFallback({ exNombre, exId, color, userId }) {
  const [ytId, setYtId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    async function findVideo() {
      // 1. Check Supabase first
      const { data } = await sb.from("exercise_videos")
        .select("youtube_id")
        .eq("exercise_id", exId)
        .maybeSingle();

      if (data?.youtube_id) {
        setYtId(data.youtube_id === "none" ? null : data.youtube_id);
        setLoading(false);
        return;
      }

      // 2. Ask Groq
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "Eres un experto en fitness. Responde SOLO con el ID de YouTube (exactamente 11 caracteres), nada más. Si no conoces uno real y válido, responde exactamente: none" },
              { role: "user", content: `ID de YouTube de un video tutorial en español del ejercicio: "${exNombre}". Solo el ID, sin texto.` }
            ],
            max_tokens: 20, temperature: 0,
          })
        });
        const groqData = await res.json();
        const id = (groqData.choices?.[0]?.message?.content || "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
        const validId = id && id.length === 11 && id !== "none" ? id : null;

        // 3. Save to Supabase
        await sb.from("exercise_videos").upsert({
          exercise_id: exId,
          youtube_id: validId || "none",
          source: "ai",
        }, { onConflict: "exercise_id" });

        setYtId(validId);
      } catch { setYtId(null); }
      finally { setLoading(false); }
    }
    findVideo();
  }, [exId, exNombre]);

  if (loading) return (
    <div style={{ borderRadius: 14, aspectRatio: "16/9", background: "#111118", border: "1px solid #1e1e2e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <Spinner color={color} size={24} />
      <div style={{ fontSize: 11, color: "#444" }}>Buscando video...</div>
    </div>
  );

  if (ytId) return (
    showVideo ? (
      <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", background: "#000" }}>
        <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&rel=0`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media" allowFullScreen />
      </div>
    ) : (
      <div onClick={() => setShowVideo(true)} style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", background: "#111118", border: "1px solid #1e1e2e", cursor: "pointer" }}>
        <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={exNombre}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
          onError={() => setYtId(null)}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 20, marginLeft: 3 }}>▶</span>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 11, color: "#aaa" }}>Sugerido por IA · toca para ver</div>
      </div>
    )
  );

  return (
    <div style={{ borderRadius: 14, aspectRatio: "16/9", background: "#111118", border: "1px solid #1e1e2e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <span style={{ fontSize: 36 }}>🏋️</span>
      <span style={{ fontSize: 12, color: "#444" }}>Sin video disponible</span>
    </div>
  );
}

// ─── Exercise Screen ──────────────────────────────────────────────────────────
function ExerciseScreen({ day, startIdx, onBack, logs, onToggle, onWeightChange, onNoteChange, onAllDone, profile, onReplaceExercise }) {
  const [idx, setIdx] = useState(startIdx);
  const [activeSeries, setActiveSeries] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [ytOverrides, setYtOverrides] = useState({});
  const [restTimer, setRestTimer] = useState(null);
  const restRef = useRef(null);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const touchStart = useRef(null);
  const color = day.color || DAY_COLORS[day.id] || "#6C63FF";
  const exercises = day.exercises || [];
  const ex = exercises[idx];
  const today_ = todayStr();
  const getLog = id => logs.find(l => l.exercise_id === id && l.fecha === today_);
  const log = getLog(ex?.id);
  const isDone = log?.completado || false;
  const weight = log?.peso_usado ?? ex?.peso_sugerido ?? 0;

  useEffect(() => {
    setActiveSeries([]);
    setShowVideo(false);
    setShowNotes(false);
    stopTimer();
    const l = getLog(exercises[idx]?.id);
    setNoteText(l?.nota || "");
    if (l?.series_completadas) { try { setActiveSeries(JSON.parse(l.series_completadas)); } catch {} }
  }, [idx]);

  useEffect(() => {
    if (log?.series_completadas) { try { setActiveSeries(JSON.parse(log.series_completadas)); } catch {} }
    setNoteText(log?.nota || "");
  }, [log?.id]);

  useEffect(() => () => stopTimer(), []);

  // Load video overrides from Supabase on mount
  useEffect(() => {
    sb.from("exercise_videos").select("exercise_id, youtube_id").eq("source", "manual").then(({ data }) => {
      if (data) {
        const overrides = {};
        data.forEach(r => { overrides[String(r.exercise_id)] = r.youtube_id === "none" ? null : r.youtube_id; });
        setYtOverrides(overrides);
      }
    });
  }, []);

  function stopTimer() {
    if (restRef.current) clearInterval(restRef.current);
    restRef.current = null;
    setRestTimer(null);
  }

  function startRestTimer(secs = 90) {
    stopTimer();
    setRestTimer(secs);
    restRef.current = setInterval(() => {
      setRestTimer(prev => {
        if (prev <= 1) { clearInterval(restRef.current); restRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function toggleSerie(i) {
    const next = activeSeries.includes(i) ? activeSeries.filter(s => s !== i) : [...activeSeries, i];
    setActiveSeries(next);
    onToggle(ex.id, next.length === ex.series, weight, JSON.stringify(next));
    if (!activeSeries.includes(i)) startRestTimer(90); // start rest when completing a serie
    // Check if all exercises are done
    setTimeout(() => {
      const allDone = exercises.every((e, ei) => {
        if (ei === idx) return next.length === e.series;
        return getLog(e.id)?.completado;
      });
      if (allDone) onAllDone();
    }, 400);
  }

  async function handleReplaceExercise() {
    setReplacing(true);
    try {
      const lesiones = profile?.lesiones || "ninguna";
      const equipo = Array.isArray(profile?.equipo) ? profile.equipo.join(", ") : (profile?.equipo || "gimnasio completo");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Eres un entrenador personal experto. Responde SOLO con JSON válido, sin texto extra." },
            { role: "user", content: `El ejercicio "${ex.nombre}" no es adecuado para un usuario con estas lesiones/limitaciones: "${lesiones}".
Sugiere UN ejercicio alternativo que:
1. Trabaje el mismo grupo muscular (${day.tag})
2. Sea seguro para las lesiones mencionadas
3. Use este equipo disponible: ${equipo}

Responde SOLO con este JSON:
{"nombre":"nombre del ejercicio","series":${ex.series},"reps":"${ex.reps}","descripcion":"Indicación técnica de 80-120 caracteres explicando ejecución correcta y por qué es seguro para la lesión.","peso_sugerido":${ex.peso_sugerido || 0}}` }
          ],
          max_tokens: 300,
          temperature: 0.5,
        })
      });
      const data = await res.json();
      const text = (data.choices?.[0]?.message?.content || "").replace(/```json|```/g, "").trim();
      const newEx = JSON.parse(text);
      onReplaceExercise(idx, { ...newEx, id: ex.id, orden: ex.orden });
    } catch (e) {
      alert("Error al reemplazar ejercicio. Intenta de nuevo.");
    } finally {
      setReplacing(false);
    }
  }

  async function handleEditVideo() {
    const ytInput = window.prompt(`ID de YouTube para "${ex.nombre}"\nEj: dQw4w9WgXcQ\n(deja vacío para quitar el video)`);
    if (ytInput === null) return;
    const newId = ytInput.trim() || "none";
    await sb.from("exercise_videos").upsert({ exercise_id: ex.id, youtube_id: newId, source: "manual" }, { onConflict: "exercise_id" });
    setYtOverrides(prev => ({ ...prev, [String(ex.id)]: newId === "none" ? null : newId }));
    setShowVideo(false);
  }

  if (!ex) return null;
  const ytId = ytOverrides[String(ex.id)] || YOUTUBE_IDS[ex.nombre] || ex.youtube_id;
  const ytValid = ytId && ytId.length > 5 && !["dips-fondos", "wrist-curl"].includes(ytId);

  return (
    <div style={{ ...S.screen, background: "#0a0a10" }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Top nav */}
      <div style={{ padding: "52px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 13, padding: 0 }}>← Lista</button>
        <div style={{ display: "flex", gap: 5 }}>
          {exercises.map((e, i) => {
            const done = getLog(e.id)?.completado;
            return <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 99, cursor: "pointer", background: i === idx ? color : done ? color + "66" : "#222", transition: "width 0.25s" }} />;
          })}
        </div>
        <div style={{ fontSize: 12, color: "#444" }}>{idx + 1}/{exercises.length}</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 24px 40px", overflowY: "auto" }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{day.tag}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.15 }}>{ex.nombre}</h2>
              <div style={{ fontSize: 14, color: "#555" }}>{ex.series} series · {ex.reps} repeticiones</div>
            </div>
            {/* Replace exercise button */}
            <button
              onClick={handleReplaceExercise}
              disabled={replacing}
              style={{ flexShrink: 0, marginLeft: 12, marginTop: 4, background: replacing ? "#1a1a2e" : "#111118", border: `1px solid ${color}44`, borderRadius: 10, padding: "7px 12px", cursor: replacing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              {replacing
                ? <><Spinner color={color} size={12} /><span style={{ fontSize: 11, color: "#555" }}>Buscando...</span></>
                : <><span style={{ fontSize: 13 }}>✦</span><span style={{ fontSize: 11, color, fontWeight: 600 }}>Cambiar</span></>
              }
            </button>
          </div>
        </div>

        {/* Video / Image section */}
        <div style={{ marginBottom: 20 }}>
          {ytValid ? (
            showVideo ? (
              <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", background: "#000" }}>
                <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&rel=0`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media" allowFullScreen />
              </div>
            ) : (
              <div onClick={() => setShowVideo(true)} style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", background: "#111118", border: "1px solid #1e1e2e", cursor: "pointer" }}>
                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={ex.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 20, marginLeft: 3 }}>▶</span>
                  </div>
                </div>
                <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: 11, color: "#aaa" }}>Toca para ver video</div>
              </div>
            )
          ) : (
            <MediaFallback exNombre={ex.nombre} exId={ex.id} color={color} />
          )}

          {/* Edit video link */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={handleEditVideo} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#444", textDecoration: "underline" }}>
              {ytValid ? "✎ cambiar video" : "✎ agregar video de YouTube"}
            </button>
          </div>
        </div>

        {/* Description */}
        <div style={{ ...S.card, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#444", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 8 }}>INDICACIONES</div>
          <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, margin: 0 }}>
            {ex.descripcion?.trim() || "Realiza el movimiento de forma controlada. Mantén la postura correcta durante todo el ejercicio y respira de forma constante."}
          </p>
        </div>

        {/* Series — CLICKABLE */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#444", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 10 }}>SERIES</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Array.from({ length: ex.series }).map((_, i) => {
              const done = activeSeries.includes(i);
              return (
                <button key={i} onClick={() => toggleSerie(i)} style={{ padding: "10px 18px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", background: done ? color : "transparent", color: done ? (["#FFB347", "#00C896"].includes(color) ? "#000" : "#fff") : color, border: `1.5px solid ${done ? color : color + "55"}`, transform: done ? "scale(0.97)" : "scale(1)" }}>
                  {done ? "✓" : ""} Serie {i + 1}
                </button>
              );
            })}
          </div>
          {activeSeries.length > 0 && <div style={{ fontSize: 12, color: "#555", marginTop: 8 }}>{activeSeries.length} de {ex.series} series completadas</div>}
        </div>

        {/* Rest Timer */}
        {restTimer !== null && (
          <div style={{ marginBottom: 16, background: "#111118", borderRadius: 14, padding: "14px 18px", border: `1px solid ${restTimer === 0 ? color + "88" : "#1e1e2e"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "#444", fontWeight: 600, letterSpacing: "0.1em" }}>{restTimer === 0 ? "¡A la siguiente serie!" : "DESCANSO"}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: restTimer === 0 ? color : restTimer <= 10 ? "#FF6B6B" : "#F0EEF8", marginTop: 2 }}>
                {restTimer === 0 ? "✓" : `${Math.floor(restTimer / 60)}:${String(restTimer % 60).padStart(2, "0")}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {restTimer > 0 && (
                <button onClick={() => startRestTimer(restTimer + 30)} style={{ background: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: 8, padding: "6px 10px", color: "#888", fontSize: 11, cursor: "pointer" }}>+30s</button>
              )}
              <button onClick={stopTimer} style={{ background: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: 8, padding: "6px 10px", color: "#FF6B6B", fontSize: 11, cursor: "pointer" }}>✕</button>
            </div>
          </div>
        )}

        {/* Weight control */}
        <div style={{ ...S.card, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", fontWeight: 600 }}>PESO</div>
            <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>modificable</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => onWeightChange(ex.id, Math.max(0, weight - 1))} style={{ width: 34, height: 34, borderRadius: 10, background: "#1e1e2e", border: "1px solid #2a2a3a", color: "#F0EEF8", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <div style={{ textAlign: "center", minWidth: 44 }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>{weight}</span>
              <span style={{ fontSize: 12, color: "#444", marginLeft: 4 }}>kg</span>
            </div>
            <button onClick={() => onWeightChange(ex.id, weight + 1)} style={{ width: 34, height: 34, borderRadius: 10, background: "#1e1e2e", border: "1px solid #2a2a3a", color: "#F0EEF8", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        </div>

        {/* Done button */}
        <button onClick={() => { onToggle(ex.id, !isDone, weight, JSON.stringify(activeSeries)); if (!isDone && idx < exercises.length - 1) setIdx(i => i + 1); }}
          style={{ width: "100%", padding: 16, borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", background: isDone ? "#0d1a14" : color, color: isDone ? color : (["#FFB347", "#00C896"].includes(color) ? "#000" : "#fff"), border: `1.5px solid ${isDone ? color + "55" : "transparent"}` }}>
          {isDone ? "✓ Completado" : "Marcar como hecho"}
        </button>

        {/* Notes */}
        <div style={{ marginTop: 14 }}>
          <button onClick={() => setShowNotes(!showNotes)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: noteText ? color : "#444", display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
            <span>✎</span>
            <span>{noteText ? "Ver nota" : "Agregar nota"} {noteText ? "·" : ""} {noteText ? noteText.slice(0, 30) + (noteText.length > 30 ? "..." : "") : ""}</span>
          </button>
          {showNotes && (
            <div style={{ marginTop: 8 }}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onBlur={() => onNoteChange(ex.id, noteText)}
                placeholder="Ej: sentí tensión en el hombro, aumentar peso la próxima semana..."
                style={{ ...S.input, minHeight: 80, resize: "none", fontFamily: "inherit", fontSize: 13, marginBottom: 0 }}
                autoFocus
              />
              <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>Se guarda automáticamente</div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#2a2a2a" }}>desliza para navegar</div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const DEFAULT_DAYS = [
  { id: 1, nombre: "Pecho + Hombro", tag: "empuje", color: "#6C63FF", orden: 1, exercises: [
    { id: 1, nombre: "Press mancuernas", series: 4, reps: "10-12", descripcion: "Usa 60-70% de tu máximo. No extiendas el codo al 100% en el punto más alto. Pausa 1 segundo en la parte baja para proteger tu cartílago.", peso_sugerido: 14, orden: 1 },
    { id: 2, nombre: "Apertura con mancuernas", series: 3, reps: "12-15", descripcion: "Codos ligeramente flexionados durante todo el movimiento. No dejes que las mancuernas bajen más allá de la línea del torso.", peso_sugerido: 10, orden: 2 },
    { id: 3, nombre: "Fondos en banco", series: 3, reps: "12", descripcion: "Solo con tu propio peso corporal. Si hay molestia en el codo, reemplaza por crossover con banda.", peso_sugerido: 0, orden: 3 },
    { id: 4, nombre: "Elevaciones laterales", series: 4, reps: "15", descripcion: "Banda elástica es ideal: tensión progresiva, sin impacto articular. Mantén el codo ligeramente flexionado.", peso_sugerido: 6, orden: 4 },
    { id: 5, nombre: "Rotaciones externas con banda", series: 3, reps: "15", descripcion: "Esencial para tu hombro. Codo a 90° pegado al cuerpo. Movimiento lento y controlado.", peso_sugerido: 0, orden: 5 },
    { id: 6, nombre: "Face pull", series: 4, reps: "15", descripcion: "Protege el manguito rotador y el labrum. Ancla a la altura de los ojos.", peso_sugerido: 8, orden: 6 },
  ]},
  { id: 2, nombre: "Pierna + Abdomen", tag: "tren inferior", color: "#00C896", orden: 2, exercises: [
    { id: 8, nombre: "Sentadilla goblet", series: 4, reps: "12", descripcion: "Sostén una mancuerna frente al pecho. Rodillas alineadas con los pies, espalda recta.", peso_sugerido: 18, orden: 1 },
    { id: 9, nombre: "Peso muerto rumano", series: 3, reps: "10-12", descripcion: "Bisagra de cadera, no sentadilla. Mantén la barra pegada al cuerpo, espalda neutral.", peso_sugerido: 30, orden: 2 },
    { id: 10, nombre: "Prensa de pierna", series: 4, reps: "15", descripcion: "Pies a la anchura de hombros. No bloquees las rodillas arriba. Rango completo.", peso_sugerido: 60, orden: 3 },
    { id: 11, nombre: "Curl femoral tumbado", series: 3, reps: "12-15", descripcion: "Movimiento lento y controlado. Evita elevar la cadera.", peso_sugerido: 25, orden: 4 },
    { id: 12, nombre: "Plancha", series: 3, reps: "40 seg", descripcion: "Cuerpo en línea recta. Activa el core y los glúteos.", peso_sugerido: 0, orden: 5 },
    { id: 13, nombre: "Crunch en polea", series: 3, reps: "15", descripcion: "Flexión de columna, no de cadera. Contrae el abdomen antes de iniciar.", peso_sugerido: 12, orden: 6 },
  ]},
  { id: 3, nombre: "Espalda + Hombro posterior", tag: "jalón", color: "#FF6B6B", orden: 3, exercises: [
    { id: 14, nombre: "Jalón al pecho", series: 4, reps: "10-12", descripcion: "Agarre prono. Lleva la barra al esternón, no detrás del cuello. Retrae escápulas al bajar.", peso_sugerido: 45, orden: 1 },
    { id: 15, nombre: "Remo con mancuerna", series: 4, reps: "12", descripcion: "Codo pegado al cuerpo, sube hacia la cadera, no el hombro.", peso_sugerido: 20, orden: 2 },
    { id: 16, nombre: "Remo en polea baja", series: 3, reps: "12-15", descripcion: "Siéntate erguido. Retracción escapular completa al final.", peso_sugerido: 35, orden: 3 },
    { id: 17, nombre: "Reverse fly", series: 3, reps: "15", descripcion: "Codos ligeramente flexionados. Activa deltoides posterior y romboides.", peso_sugerido: 8, orden: 4 },
    { id: 18, nombre: "Face pull", series: 3, reps: "15", descripcion: "Ancla a la altura de los ojos. Jala hacia la cara separando los codos.", peso_sugerido: 10, orden: 5 },
  ]},
  { id: 4, nombre: "Brazos + Antebrazo", tag: "aislamiento", color: "#FFB347", orden: 4, exercises: [
    { id: 19, nombre: "Curl de bíceps con barra", series: 4, reps: "10-12", descripcion: "Codos fijos. No uses impulso. Squeeze en la parte alta.", peso_sugerido: 20, orden: 1 },
    { id: 20, nombre: "Curl martillo", series: 3, reps: "12", descripcion: "Agarre neutro. Codos fijos, movimiento lento.", peso_sugerido: 14, orden: 2 },
    { id: 21, nombre: "Tríceps en polea", series: 4, reps: "12-15", descripcion: "Codos pegados al cuerpo. Extiende completamente en la parte baja.", peso_sugerido: 18, orden: 3 },
    { id: 22, nombre: "Extensión de tríceps sobre cabeza", series: 3, reps: "12", descripcion: "Codos apuntando al techo. Estiramiento completo del tríceps.", peso_sugerido: 12, orden: 4 },
    { id: 23, nombre: "Curl de muñeca", series: 3, reps: "15-20", descripcion: "Antebrazo apoyado en el banco, solo mueve la muñeca.", peso_sugerido: 8, orden: 5 },
  ]},
];

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [days, setDays] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appScreen, setAppScreen] = useState("home"); // home | day | exercise | profile | aiRoutine | changePassword
  const [selectedDay, setSelectedDay] = useState(null);
  const [startExIdx, setStartExIdx] = useState(0);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setLoading(false); });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, s) => { setSession(s); if (!s) { setLoading(false); setProfile(null); } });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session?.user) loadAll(); }, [session]);

  async function loadAll() {
    setLoading(true);
    const uid = session.user.id;
    const [{ data: prof }, { data: daysData }, { data: logsData }] = await Promise.all([
      sb.from("profiles").select("*").eq("id", uid).single(),
      sb.from("workout_days").select("*, exercises(*)").order("orden"),
      sb.from("exercise_logs").select("*").eq("user_id", uid),
    ]);

    if (prof) {
      setProfile(prof);
      // Si el usuario tiene rutina IA guardada, usarla en lugar de la estándar
      if (prof.rutina_ia) {
        try {
          const rutina = JSON.parse(prof.rutina_ia);
          setDays(rutina);
          setLoading(false);
          if (logsData) setLogs(logsData);
          return;
        } catch {}
      }
    } else {
      setAppScreen("profile");
    }

    // Rutina estándar desde Supabase o fallback local
    setDays((daysData || DEFAULT_DAYS).map(d => ({
      ...d,
      exercises: (d.exercises || []).sort((a, b) => a.orden - b.orden)
    })));
    if (logsData) setLogs(logsData);
    setLoading(false);
  }

  async function saveAIRoutine(routine) {
    if (!session?.user) return;

    // Asignar IDs únicos a los ejercicios para el tracking de logs
    const daysWithIds = routine.days.map((d, di) => ({
      ...d,
      id: 1000 + di + 1,
      exercises: (d.exercises || []).map((ex, ei) => ({
        ...ex,
        id: 10000 + (di * 100) + ei + 1,
        orden: ei + 1,
      }))
    }));

    // Guardar como JSON en el perfil del usuario
    await sb.from("profiles").update({
      rutina_ia: JSON.stringify(daysWithIds)
    }).eq("id", session.user.id);

    setDays(daysWithIds);
    setAppScreen("home");
  }

  const upsertLog = useCallback(async (exerciseId, completado, pesoUsado, seriesJson, nota) => {
    if (!session?.user) return;
    const today = todayStr();
    const newLog = {
      user_id: session.user.id, exercise_id: exerciseId,
      completado, peso_usado: pesoUsado, fecha: today,
      ...(seriesJson ? { series_completadas: seriesJson } : {}),
      ...(nota !== undefined ? { nota } : {}),
    };
    setLogs(prev => {
      const i = prev.findIndex(l => l.exercise_id === exerciseId && l.fecha === today);
      if (i >= 0) { const n = [...prev]; n[i] = { ...n[i], ...newLog }; return n; }
      return [...prev, { ...newLog, id: `tmp-${exerciseId}` }];
    });
    const { data } = await sb.from("exercise_logs").upsert(newLog, { onConflict: "user_id,exercise_id,fecha" }).select().single();
    if (data) setLogs(prev => {
      const i = prev.findIndex(l => l.exercise_id === exerciseId && l.fecha === today);
      if (i >= 0) { const n = [...prev]; n[i] = data; return n; }
      return [...prev.filter(l => l.id !== `tmp-${exerciseId}`), data];
    });
  }, [session]);

  const handleWeightChange = useCallback(async (exerciseId, peso) => {
    const today = todayStr();
    const ex = logs.find(l => l.exercise_id === exerciseId && l.fecha === today);
    await upsertLog(exerciseId, ex?.completado || false, peso, ex?.series_completadas, ex?.nota);
  }, [logs, upsertLog]);

  // Streak calculation
  function calcStreak() {
    if (!logs.length) return 0;
    const workoutDates = [...new Set(logs.filter(l => l.completado).map(l => l.fecha))].sort().reverse();
    if (!workoutDates.length) return 0;
    let streak = 0;
    let check = new Date(); check.setHours(0,0,0,0);
    for (const date of workoutDates) {
      const d = new Date(date + "T12:00:00");
      const diff = Math.round((check - d) / 86400000);
      if (diff <= 1) { streak++; check = d; }
      else break;
    }
    return streak;
  }
  const streak = calcStreak();

  if (loading) return <div style={S.screen}><Spinner /></div>;
  if (!session) return <LoginScreen onLogin={() => {}} />;
  if (appScreen === "changePassword") return <ChangePasswordScreen onBack={() => setAppScreen("profile")} />;
  if (appScreen === "profile") return <ProfileScreen user={session.user} existing={profile} onDone={p => { setProfile(p); setAppScreen("home"); loadAll(); }} onChangePassword={() => setAppScreen("changePassword")} />;
  if (appScreen === "aiRoutine") return <AIRoutineScreen profile={profile} onDone={saveAIRoutine} onSkip={() => setAppScreen("home")} />;

  if (appScreen === "summary" && selectedDay) {
    const todayLogs = logs.filter(l => l.fecha === todayStr());
    const exercises = selectedDay.exercises || [];
    const doneCount = exercises.filter(ex => todayLogs.find(l => l.exercise_id === ex.id && l.completado)).length;
    const totalVolume = exercises.reduce((sum, ex) => {
      const log = todayLogs.find(l => l.exercise_id === ex.id);
      if (!log?.completado) return sum;
      const series = log.series_completadas ? JSON.parse(log.series_completadas).length : ex.series;
      const repsNum = parseInt(ex.reps) || 10;
      return sum + (series * repsNum * (log.peso_usado || 0));
    }, 0);
    const color = selectedDay.color || "#6C63FF";
    return (
      <div style={S.screen}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>¡Entrenamiento completado!</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 32px" }}>{selectedDay.nombre}</h2>
          <div style={{ display: "flex", gap: 12, width: "100%", marginBottom: 32 }}>
            {[
              { label: "Ejercicios", val: `${doneCount}/${exercises.length}` },
              { label: "Volumen total", val: `${totalVolume.toLocaleString()} kg` },
              { label: "Racha", val: `🔥 ${streak}` },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: "#111118", borderRadius: 14, padding: "14px 8px", border: "1px solid #1e1e1e" }}>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 6, letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.val}</div>
              </div>
            ))}
          </div>
          {streak > 0 && (
            <div style={{ background: "#111118", border: "1px solid #FFB34744", borderRadius: 14, padding: "14px 20px", marginBottom: 28, width: "100%" }}>
              <div style={{ fontSize: 13, color: "#FFB347", fontWeight: 600 }}>🔥 {streak} día{streak !== 1 ? "s" : ""} seguido{streak !== 1 ? "s" : ""}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>¡Sigue así, no rompas la racha!</div>
            </div>
          )}
          <button style={S.btnPrimary(color)} onClick={() => { setAppScreen("home"); setSelectedDay(null); }}>Volver al inicio</button>
          <div style={{ height: 12 }} />
          <button style={{ ...S.btnGhost, color: "#555", borderColor: "#222" }} onClick={() => setAppScreen("day")}>Ver resumen del día</button>
        </div>
      </div>
    );
  }

  if (appScreen === "exercise" && selectedDay) return (
    <ExerciseScreen
      day={selectedDay}
      startIdx={startExIdx}
      onBack={() => setAppScreen("day")}
      logs={logs}
      onToggle={upsertLog}
      onWeightChange={handleWeightChange}
      onNoteChange={(exerciseId, nota) => {
        const today = todayStr();
        const ex = logs.find(l => l.exercise_id === exerciseId && l.fecha === today);
        upsertLog(exerciseId, ex?.completado || false, ex?.peso_usado || 0, ex?.series_completadas, nota);
      }}
      onAllDone={() => setAppScreen("summary")}
      profile={profile}
      onReplaceExercise={(exIdx, newEx) => {
        const updatedDay = { ...selectedDay, exercises: selectedDay.exercises.map((e, i) => i === exIdx ? newEx : e) };
        setSelectedDay(updatedDay);
        setDays(prev => prev.map(d => d.id === selectedDay.id ? updatedDay : d));
        if (profile?.rutina_ia) {
          try {
            const rutina = JSON.parse(profile.rutina_ia);
            const updatedRutina = rutina.map(d => d.id === selectedDay.id ? updatedDay : d);
            sb.from("profiles").update({ rutina_ia: JSON.stringify(updatedRutina) }).eq("id", session.user.id);
          } catch (e) {
            console.warn("No se pudo actualizar rutina_ia en BD:", e.message);
          }
        }
      }}
    />
  );

  if (appScreen === "day" && selectedDay) return (
    <DayScreen day={selectedDay} onBack={() => { setAppScreen("home"); setSelectedDay(null); }}
      onSelectExercise={i => { setStartExIdx(i); setAppScreen("exercise"); }}
      logs={logs} onToggle={upsertLog} onWeightChange={handleWeightChange} />
  );

  return (
    <HomeScreen user={session.user} profile={profile} days={days} logs={logs} streak={streak}
      onSelectDay={d => { setSelectedDay(d); setAppScreen("day"); }}
      onLogout={() => sb.auth.signOut()}
      onEditProfile={() => setAppScreen("profile")}
      onRegenerateRoutine={() => setAppScreen("aiRoutine")}
    />
  );
}
