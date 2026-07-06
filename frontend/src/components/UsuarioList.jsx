import { useState, useEffect } from "react";
import usuarioService from "../services/usuario.service";

export default function UsuarioList({ refreshTrigger }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    usuarioService
      .getAll()
      .then((data) => { setUsuarios(data || []); setError(null); })
      .catch(() => setError("Error al cargar los usuarios"))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading)
    return <div style={styles.centered}><div style={styles.spinner} /></div>;

  if (error)
    return <div style={styles.errorBox}><span>⚠️</span> {error}</div>;

  if (usuarios.length === 0)
    return <div style={styles.emptyBox}><span style={{ fontSize: 32 }}>👤</span><p style={{ color: "#c4c6d2", marginTop: 8 }}>No hay usuarios registrados.</p></div>;

  return (
    <div>
      <h3 style={styles.sectionLabel}>USUARIOS</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {usuarios.map((u) => (
          <div key={u.id} style={styles.row}>
            <div style={styles.avatar}>
              {u.nombre?.charAt(0).toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <span style={styles.nombre}>{u.nombre}</span>
              <span style={styles.email}>{u.email}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={styles.rolBadge}>{u.rol?.toUpperCase()}</span>
              <span style={{ ...styles.activoBadge, background: u.activo ? "rgba(29,158,117,0.15)" : "rgba(255,152,0,0.1)", color: u.activo ? "#1D9E75" : "#FF9800" }}>
                {u.activo ? "● Activo" : "● Inactivo"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  centered: { display: "flex", justifyContent: "center", padding: "40px 0" },
  spinner: { width: 32, height: 32, border: "3px solid #1f201e", borderTop: "3px solid #29B0E8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  errorBox: { background: "rgba(147,0,10,0.2)", border: "1px solid rgba(255,180,171,0.3)", color: "#ffb4ab", padding: "12px 16px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 },
  emptyBox: { textAlign: "center", padding: "40px 0", color: "#8e909b" },
  sectionLabel: { fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", color: "#8e909b", textTransform: "uppercase", marginBottom: 16 },
  row: { background: "#16181D", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "rgba(10,46,110,0.4)", border: "1px solid rgba(41,176,232,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#7ad0ff", flexShrink: 0 },
  nombre: { display: "block", fontSize: 16, fontWeight: 600, color: "#e3e2df" },
  email: { display: "block", fontSize: 13, color: "#8e909b", marginTop: 2 },
  rolBadge: { fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", background: "rgba(177,197,255,0.1)", color: "#b1c5ff", padding: "3px 8px", borderRadius: 9999 },
  activoBadge: { fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 9999 },
};
