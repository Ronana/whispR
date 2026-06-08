import { createClient } from "../../../lib/supabase";

async function getCreatorData(username) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("role", "creator")
    .maybeSingle();
  if (!profile) return null;

  const { data: tracks } = await supabase
    .from("tracks")
    .select("*")
    .eq("creator", profile.display_name)
    .order("plays", { ascending: false });

  return { profile, tracks: tracks || [] };
}

export default async function CreatorPage({ params }) {
  const { username } = await params;
  const data = await getCreatorData(username);

  if (!data) {
    return (
      <div style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        background: "#0d0b08", color: "#e8dcc8",
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "12px",
      }}>
        <p style={{ fontSize: "48px" }}>〜</p>
        <p style={{ fontSize: "16px", color: "#555", fontStyle: "italic" }}>Creator not found</p>
        <a href="/" style={{ fontSize: "12px", color: "#c9a96e", letterSpacing: "0.1em" }}>← Back to WhispR</a>
      </div>
    );
  }

  const { profile, tracks } = data;
  const initials = (profile.display_name || username)
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const totalPlays = tracks.reduce((sum, t) => sum + (Number(t.plays) || 0), 0);
  const monthlyListeners = totalPlays;

  // Dominant colour from cover — fallback gradient
  const hasCover = !!profile.cover_url;

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#0d0b08", color: "#e8dcc8",
      minHeight: "100vh",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .track-row { transition: background 0.15s ease; cursor: pointer; }
        .track-row:hover { background: rgba(255,255,255,0.06) !important; }
        .track-row:hover .track-num { display: none !important; }
        .track-row:hover .track-play { display: flex !important; }
        .follow-btn { transition: all 0.2s ease; }
        .follow-btn:hover { transform: scale(1.04); border-color: #fff !important; color: #fff !important; }
        @keyframes whispr-fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* ── Nav ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(180deg, rgba(13,11,8,0.9) 0%, transparent 100%)",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, #c9a96e, #8c6030)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>〜</div>
          <span style={{ fontSize: "18px", color: "#e8dcc8" }}>Whisp<span style={{ color: "#c9a96e", fontWeight: "bold" }}>R</span></span>
        </a>
        <a href="/" style={{ fontSize: "11px", color: "#888", letterSpacing: "0.12em" }}>← BACK</a>
      </div>

      {/* ── Hero Banner ── */}
      <div style={{
        position: "relative",
        height: "clamp(280px, 40vw, 440px)",
        overflow: "hidden",
        background: hasCover ? "transparent" : "linear-gradient(135deg, #2a1f0e 0%, #1a1208 50%, #0d0b08 100%)",
      }}>
        {hasCover && (
          <img
            src={profile.cover_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
          />
        )}
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(13,11,8,0.1) 0%, rgba(13,11,8,0.3) 50%, rgba(13,11,8,0.95) 100%)",
        }} />

        {/* Creator name overlay */}
        <div style={{
          position: "absolute", bottom: "28px", left: "32px", right: "32px",
          animation: "whispr-fadein 0.6s ease",
        }}>
          {profile.verified && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a96e, #8c6030)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px",
              }}>✓</div>
              <span style={{ fontSize: "12px", color: "#e8dcc8", fontWeight: "500" }}>Verified by WhispR</span>
            </div>
          )}
          <h1 style={{
            fontSize: "clamp(36px, 7vw, 80px)",
            fontWeight: "900", color: "#fff",
            letterSpacing: "-0.02em", lineHeight: 1,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            marginBottom: "16px",
          }}>
            {profile.display_name || username}
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", fontWeight: "400" }}>
            {monthlyListeners >= 1000
              ? `${(monthlyListeners / 1000).toFixed(1)}K`
              : monthlyListeners.toLocaleString()} monthly listeners
          </p>
        </div>
      </div>

      {/* ── Actions Bar ── */}
      <div style={{
        padding: "24px 32px",
        display: "flex", alignItems: "center", gap: "20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Avatar (small, beside actions) */}
        <div style={{
          width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0,
          background: profile.avatar_url ? "none" : "linear-gradient(135deg, #c9a96e, #8c6030)",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", fontWeight: "700", color: "#0a0806",
          boxShadow: "0 0 0 2px rgba(201,169,110,0.3)",
        }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initials
          }
        </div>

        <button className="follow-btn" style={{
          padding: "8px 24px", borderRadius: "999px",
          background: "transparent", border: "1px solid rgba(255,255,255,0.3)",
          color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600",
          cursor: "pointer", letterSpacing: "0.05em",
        }}>Following</button>

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p style={{ fontSize: "12px", color: "#555" }}>{tracks.length} {tracks.length === 1 ? "story" : "stories"}</p>
        </div>
      </div>

      {/* ── Bio ── */}
      {profile.bio && (
        <div style={{ padding: "20px 32px 0", maxWidth: "600px" }}>
          <p style={{ fontSize: "14px", color: "#888", lineHeight: "1.7", fontStyle: "italic" }}>{profile.bio}</p>
        </div>
      )}

      {/* ── Popular Tracks ── */}
      <div style={{ padding: "28px 32px 80px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#fff", marginBottom: "16px", letterSpacing: "-0.01em" }}>Popular</h2>

        {tracks.length === 0 ? (
          <p style={{ color: "#444", fontSize: "13px", fontStyle: "italic" }}>No stories published yet.</p>
        ) : tracks.map((track, i) => (
          <div key={track.id} className="track-row" style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 1fr 80px",
            alignItems: "center", gap: "12px",
            padding: "10px 14px", borderRadius: "6px",
            background: "transparent",
          }}>
            {/* Number / play icon */}
            <div style={{ textAlign: "center", position: "relative" }}>
              <span className="track-num" style={{ fontSize: "15px", color: i < 3 ? "#c9a96e" : "#666" }}>{i + 1}</span>
              <span className="track-play" style={{ display: "none", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "16px" }}>▶</span>
            </div>

            {/* Title + category */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "6px", flexShrink: 0,
                background: "rgba(201,169,110,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", color: "#c9a96e",
              }}>♪</div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontSize: "15px", color: "#fff", fontWeight: "500",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {track.title}
                  {track.is_new && <span style={{ marginLeft: "8px", fontSize: "9px", padding: "2px 6px", background: "rgba(201,169,110,0.2)", borderRadius: "8px", color: "#c9a96e", verticalAlign: "middle" }}>NEW</span>}
                  {track.is_premium && <span style={{ marginLeft: "6px", fontSize: "9px", padding: "2px 6px", background: "rgba(201,169,110,0.1)", border: "1px solid #c9a96e44", borderRadius: "8px", color: "#c9a96e88", verticalAlign: "middle" }}>✦ PREMIUM</span>}
                </p>
                <p style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{track.category}</p>
              </div>
            </div>

            {/* Duration */}
            <p style={{ fontSize: "13px", color: "#666" }}>{track.duration}</p>

            {/* Plays */}
            <p style={{ fontSize: "13px", color: "#888", textAlign: "right" }}>
              {Number(track.plays) >= 1000
                ? `${(Number(track.plays) / 1000).toFixed(1)}K`
                : track.plays}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
