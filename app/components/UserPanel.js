'use client';
import { createClient } from "../../lib/supabase";

export default function UserPanel({ user, liked, tracks, history, onClose, onSignOut }) {
  const initials = (user?.user_metadata?.full_name || user?.email || "?")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Listener";
  const email = user?.email || "";

  const likedTracks = tracks.filter(t => liked[t.id]);
  const historyTracks = history.map(id => tracks.find(t => t.id === id)).filter(Boolean);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onSignOut();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
      }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "320px", zIndex: 301,
        background: "#0f0d0a",
        borderLeft: "1px solid #1e1a14",
        display: "flex", flexDirection: "column",
        fontFamily: "Georgia, 'Times New Roman', serif",
        animation: "slideIn 0.25s ease",
      }}>
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .panel-track:hover { background: rgba(201,169,110,0.06) !important; }
          .signout-btn:hover { border-color: #c9966a !important; color: #c9966a !important; }
        `}</style>

        {/* Header */}
        <div style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid #1a1710",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <span style={{ fontSize: "10px", color: "#555", letterSpacing: "0.15em" }}>YOUR PROFILE</span>
            <button onClick={onClose} style={{
              background: "none", border: "none", color: "#555",
              cursor: "pointer", fontSize: "18px", lineHeight: 1,
            }}>×</button>
          </div>

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "linear-gradient(135deg, #c9966a, #8c6030)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", color: "#0a0806", fontWeight: "bold",
              boxShadow: "0 0 20px rgba(201,150,106,0.2)",
              flexShrink: 0,
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "15px", color: "#f0e6d0", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </p>
              <p style={{ fontSize: "11px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 20px" }}>

          {/* Liked tracks */}
          <div style={{ padding: "20px 20px 0" }}>
            <p style={{ fontSize: "10px", color: "#c9966a", letterSpacing: "0.15em", marginBottom: "12px" }}>
              ♥ LIKED · {likedTracks.length}
            </p>
            {likedTracks.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#3a3020", fontStyle: "italic" }}>No liked tracks yet</p>
            ) : likedTracks.map(t => (
              <div key={t.id} className="panel-track" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", borderRadius: "6px", transition: "background 0.2s",
              }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#e8dcc8" }}>{t.title}</p>
                  <p style={{ fontSize: "10px", color: "#666" }}>{t.creator}</p>
                </div>
                <span style={{ fontSize: "10px", color: "#555" }}>{t.duration}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#1a1710", margin: "20px 0" }} />

          {/* History */}
          <div style={{ padding: "0 20px" }}>
            <p style={{ fontSize: "10px", color: "#888", letterSpacing: "0.15em", marginBottom: "12px" }}>
              ◷ RECENTLY PLAYED
            </p>
            {historyTracks.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#3a3020", fontStyle: "italic" }}>Nothing played yet</p>
            ) : historyTracks.map((t, i) => (
              <div key={`${t.id}-${i}`} className="panel-track" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", borderRadius: "6px", transition: "background 0.2s",
              }}>
                <div>
                  <p style={{ fontSize: "13px", color: "#e8dcc8" }}>{t.title}</p>
                  <p style={{ fontSize: "10px", color: "#666" }}>{t.creator}</p>
                </div>
                <span style={{ fontSize: "10px", color: "#555" }}>{t.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1710" }}>
          <button className="signout-btn" onClick={handleSignOut} style={{
            width: "100%", padding: "11px",
            background: "none",
            border: "1px solid #2a2418",
            borderRadius: "4px",
            color: "#555", fontSize: "11px",
            letterSpacing: "0.12em",
            fontFamily: "Georgia, 'Times New Roman', serif",
            cursor: "pointer",
            transition: "all 0.2s",
          }}>
            SIGN OUT
          </button>
        </div>
      </div>
    </>
  );
}
