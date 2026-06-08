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
    .order("id", { ascending: false });

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
  const totalPlays = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  return (
    <div style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      background: "#0d0b08", color: "#e8dcc8",
      minHeight: "100vh",
    }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } .track-row:hover { background: rgba(201,169,110,0.06) !important; }`}</style>

      {/* Nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px", borderBottom: "1px solid #1e1a14",
        position: "sticky", top: 0, background: "#0d0b08", zIndex: 10,
      }}>
        <a href="/" style={{
          display: "flex", alignItems: "center", gap: "10px", textDecoration: "none",
        }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #c9a96e, #8c6030)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>〜</div>
          <span style={{ fontSize: "20px", color: "#e8dcc8" }}>Whisp<span style={{ color: "#c9a96e", fontWeight: "bold" }}>R</span></span>
        </a>
        <a href="/" style={{ fontSize: "11px", color: "#666", letterSpacing: "0.12em", textDecoration: "none" }}>← BACK</a>
      </div>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(180deg, #1a1510 0%, #0d0b08 100%)",
        borderBottom: "1px solid #1e1a14",
        padding: "48px 28px 36px",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", alignItems: "flex-start", gap: "24px" }}>
          {/* Avatar */}
          <div style={{
            width: "96px", height: "96px", borderRadius: "50%", flexShrink: 0,
            background: profile.avatar_url ? "none" : "linear-gradient(135deg, #c9a96e, #8c6030)",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", fontWeight: "bold", color: "#0a0806",
            boxShadow: "0 0 24px rgba(201,169,110,0.25)",
            border: "2px solid #c9a96e44",
          }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: "normal", color: "#e8dcc8" }}>
                {profile.display_name || username}
              </h1>
              <span style={{
                fontSize: "9px", padding: "3px 9px",
                background: "rgba(201,169,110,0.15)", border: "1px solid #c9a96e44",
                borderRadius: "10px", color: "#c9a96e", letterSpacing: "0.1em",
              }}>CREATOR</span>
            </div>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "14px" }}>@{profile.username || username}</p>
            {profile.bio && (
              <p style={{ fontSize: "14px", color: "#999", lineHeight: "1.7", maxWidth: "500px", fontStyle: "italic" }}>
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: "flex", gap: "28px", marginTop: "20px" }}>
              {[
                { label: "Tracks", value: tracks.length },
                { label: "Total plays", value: totalPlays >= 1000 ? `${(totalPlays / 1000).toFixed(1)}K` : totalPlays },
              ].map(stat => (
                <div key={stat.label}>
                  <p style={{ fontSize: "18px", color: "#c9a96e" }}>{stat.value}</p>
                  <p style={{ fontSize: "10px", color: "#555", letterSpacing: "0.1em" }}>{stat.label.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 28px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: "normal", color: "#c9a96e", letterSpacing: "0.1em", marginBottom: "16px" }}>
          ✦ All Stories
        </h2>

        {tracks.length === 0 ? (
          <p style={{ color: "#444", fontSize: "13px", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>
            No tracks published yet.
          </p>
        ) : tracks.map((track) => (
          <div key={track.id} className="track-row" style={{
            display: "flex", alignItems: "center", gap: "16px",
            padding: "14px 12px", borderRadius: "8px",
            borderBottom: "1px solid #1a1710", transition: "background 0.2s",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
              background: "rgba(201,169,110,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", color: "#c9a96e",
            }}>♪</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", color: "#e8dcc8" }}>{track.title}</span>
                {track.is_new && <span style={{ fontSize: "9px", padding: "1px 6px", background: "rgba(201,169,110,0.2)", borderRadius: "10px", color: "#c9a96e" }}>NEW</span>}
              </div>
              <span style={{ fontSize: "11px", color: "#666" }}>{track.category} · {track.duration}</span>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "12px", color: "#888" }}>{(track.plays || 0).toLocaleString()} plays</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
