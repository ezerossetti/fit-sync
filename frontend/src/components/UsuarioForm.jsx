import { useState } from "react";
import usuarioService from "../services/usuario.service";

export default function UsuarioForm({ onUsuarioCreated }) {
  const [form, setForm] = useState({ nombre: "", email: "", rol: "cliente", activo: true });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.email.trim()) { setError("Nombre y email son obligatorios"); return; }
    setLoading(true); setError(null);
    try {
      await usuarioService.create(form);
      setSuccess(true);
      setForm({ nombre: "", email: "", rol: "cliente", activo: true });
      setTimeout(() => setSuccess(false), 2500);
      onUsuarioCreated?.();
    } catch {
      setError("Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.iconBox}><span style={{ fontSize: 20 }}>👤</span></div>
        <div>
          <h2 style={styles.cardTitle}>Nuevo Usuario</h2>
          <p style={styles.cardSubtitle}>Registrá un usuario en FitSync</p>
        </div>
      </div>

      {success && <div style={styles.successBanner}>✓ Usuario creado exitosamente</div>}
      {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

      <div style={styles.grid2}>
        <div style={styles.field}>
          <label style={styles.label}>Nombre <span style={{ color: "#7ad0ff" }}>*</span></label>
          <input style={styles.input} type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="ej: Martín López" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Email <span style={{ color: "#7ad0ff" }}>*</span></label>
          <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} placeholder="martin@email.com" />
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Rol</label>
        <select style={styles.input} name="rol" value={form.rol} onChange={handleChange}>
          <option value="cliente">Cliente</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <label style={styles.checkboxRow}>
        <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} style={{ accentColor: "#29B0E8" }} />
        <span style={styles.checkboxLabel}>Usuario activo</span>
      </label>

      <button onClick={handleSubmit} disabled={loading} style={loading ? styles.btnDisabled : styles.btn}>
        {loading ? "Guardando..." : "Crear Usuario"}
      </button>
    </div>
  );
}

const styles = {
  card: { background: "#16181D", border: "1px solid rgba(41,176,232,0.1)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 20 },
  cardHeader: { display: "flex", alignItems: "center", gap: 12 },
  iconBox: { background: "rgba(10,46,110,0.3)", borderRadius: 10, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 20, fontWeight: 600, color: "#e3e2df", margin: 0 },
  cardSubtitle: { fontSize: 14, color: "#8e909b", margin: 0 },
  successBanner: { background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)", color: "#1D9E75", padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600 },
  errorBanner: { background: "rgba(147,0,10,0.2)", border: "1px solid rgba(255,180,171,0.3)", color: "#ffb4ab", padding: "10px 14px", borderRadius: 8, fontSize: 14 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#c4c6d2", textTransform: "uppercase" },
  input: { background: "#0d0f0d", border: "1px solid #1f201e", borderRadius: 8, padding: "10px 14px", color: "#e3e2df", fontSize: 16, fontFamily: "Lexend, sans-serif", outline: "none" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  checkboxLabel: { fontSize: 14, color: "#c4c6d2" },
  btn: { background: "#0A2E6E", color: "#F4F3F0", border: "none", borderRadius: 8, padding: "14px 0", fontSize: 16, fontWeight: 600, fontFamily: "Lexend, sans-serif", cursor: "pointer", width: "100%" },
  btnDisabled: { background: "#1f201e", color: "#8e909b", border: "none", borderRadius: 8, padding: "14px 0", fontSize: 16, fontWeight: 600, fontFamily: "Lexend, sans-serif", cursor: "not-allowed", width: "100%" },
};
