'use client';
import { useState, useEffect, useCallback, useRef } from "react";
import AgeGate from "./components/AgeGate";
import AuthGate from "./components/AuthGate";
import UserPanel from "./components/UserPanel";
import { createClient } from "../lib/supabase";

const featured = [
  { id: 1, title: "Top Picks For You", subtitle: "Curated to your taste", color: "#c9a96e" },
  { id: 2, title: "New This Week", subtitle: "Fresh voices, fresh stories", color: "#8c6e9a" },
  { id: 3, title: "Most Listened", subtitle: "What everyone's loving", color: "#6e8c7a" },
];

const categories = ["All", "Romance", "Slow Burn", "Intense", "Narrative", "ASMR", "Couples"];

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Home() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [user, setUser] = useState(undefined);
  const [tracks, setTracks] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState({});
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeNav, setActiveNav] = useState("home");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [history, setHistory] = useState([]);

  const audioRef = useRef(null);

  const handleAgeConfirm = useCallback(() => setAgeConfirmed(true), []);
  const handleAuth = useCallback(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);
  const handleSignOut = useCallback(() => {
    setUser(null);
    setLiked({});
    setHistory([]);
  }, []);

  // Auth listener
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load tracks from Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase.from("tracks").select("*").order("id").then(({ data, error }) => {
      if (!error && data) setTracks(data);
    });
  }, []);

  // Load user's likes and history when logged in
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    supabase.from("likes").select("track_id").eq("user_id", user.id).then(({ data }) => {
      if (data) {
        const likedMap = {};
        data.forEach(r => { likedMap[r.track_id] = true; });
        setLiked(likedMap);
      }
    });

    supabase.from("listening_history")
      .select("track_id")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setHistory(data.map(r => r.track_id));
      });
  }, [user]);

  // Audio setup
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setPlaying(false));
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    audio.src = activeTrack.audio_url;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (playing) audio.play().catch(() => {});
  }, [activeTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  const recordHistory = useCallback(async (track) => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from("listening_history").insert({ user_id: user.id, track_id: track.id });
    setHistory(h => [track.id, ...h.filter(id => id !== track.id)].slice(0, 20));
  }, [user]);

  const handlePlay = (track) => {
    if (activeTrack?.id === track.id) {
      setPlaying(!playing);
    } else {
      setActiveTrack(track);
      setPlaying(true);
      recordHistory(track);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePrev = () => {
    if (!tracks.length || !activeTrack) return;
    const idx = tracks.findIndex(t => t.id === activeTrack.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    setActiveTrack(prev);
    setPlaying(true);
    recordHistory(prev);
  };

  const handleNext = () => {
    if (!tracks.length || !activeTrack) return;
    const idx = tracks.findIndex(t => t.id === activeTrack.id);
    const next = tracks[(idx + 1) % tracks.length];
    setActiveTrack(next);
    setPlaying(true);
    recordHistory(next);
  };

  const handleLike = async (track) => {
    const isLiked = liked[track.id];
    setLiked(l => ({ ...l, [track.id]: !isLiked }));
    if (!user) return;
    const supabase = createClient();
    if (isLiked) {
      await supabase.from("likes").delete().eq("user_id", user.id).eq("track_id", track.id);
    } else {
      await supabase.from("likes").insert({ user_id: user.id, track_id: track.id });
    }
  };

  const filteredTracks = activeCategory === "All"
    ? tracks
    : tracks.filter(t => t.category === activeCategory);

  const currentTrack = activeTrack || tracks[2] || tracks[0];
  const progress = duration ? (currentTime / duration) * 100 : 0;

  const initials = (user?.user_metadata?.full_name || user?.email || "?")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  if (user === undefined) return null;

  return (
    <>
      {!ageConfirmed && <AgeGate onConfirm={handleAgeConfirm} />}
      {ageConfirmed && !user && <AuthGate onAuth={handleAuth} />}
      {panelOpen && user && (
        <UserPanel
          user={user}
          liked={liked}
          tracks={tracks}
          history={history}
          onClose={() => setPanelOpen(false)}
          onSignOut={handleSignOut}
        />
      )}
    <div style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      background: "#0d0b08",
      color: "#e8dcc8",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .track-row:hover { background: rgba(201,169,110,0.06) !important; }
        .play-btn:hover { transform: scale(1.08); }
        .nav-item:hover { color: #c9a96e !important; }
        .cat-pill:hover { border-color: #c9a96e !important; color: #c9a96e !important; }
        .card:hover { transform: translateY(-3px); }
        .avatar-btn:hover { box-shadow: 0 0 16px rgba(201,169,110,0.4) !important; }
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>

      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 28px",
        borderBottom: "1px solid #1e1a14",
        background: "#0d0b08",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, #c9a96e, #8c6030)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>〜</div>
          <span style={{ fontSize: "20px", color: "#e8dcc8" }}>
            Whisp<span style={{ color: "#c9a96e", fontWeight: "bold" }}>R</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {["home", "discover", "library"].map(nav => (
            <button key={nav} className="nav-item" onClick={() => setActiveNav(nav)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: activeNav === nav ? "#c9a96e" : "#888",
              fontSize: "12px", letterSpacing: "0.15em",
              textTransform: "uppercase", fontFamily: "inherit",
              borderBottom: activeNav === nav ? "1px solid #c9a96e" : "1px solid transparent",
              paddingBottom: "2px", transition: "color 0.2s",
            }}>{nav}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <button className="avatar-btn" onClick={() => setPanelOpen(true)} style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg, #c9a96e, #8c6030)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "bold", color: "#0a0806",
              fontFamily: "inherit",
              boxShadow: "0 0 10px rgba(201,169,110,0.2)",
              transition: "box-shadow 0.2s",
            }}>{initials}</button>
          )}
          <button style={{
            background: "linear-gradient(135deg, #c9a96e, #a07840)",
            border: "none", borderRadius: "20px",
            padding: "8px 20px", color: "#0d0b08",
            fontSize: "11px", letterSpacing: "0.1em",
            fontWeight: "bold", cursor: "pointer", fontFamily: "inherit",
          }}>PREMIUM</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "28px 28px 120px" }}>
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#888", marginBottom: "6px", textTransform: "uppercase" }}>Good evening</p>
          <h1 style={{ fontSize: "28px", fontWeight: "normal", color: "#e8dcc8" }}>
            Your evening awaits, <span style={{ color: "#c9a96e", fontStyle: "italic" }}>darling.</span>
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "40px" }}>
          {featured.map(f => (
            <div key={f.id} className="card" style={{
              background: `linear-gradient(135deg, ${f.color}22, ${f.color}08)`,
              border: `1px solid ${f.color}30`,
              borderRadius: "12px", padding: "20px", cursor: "pointer",
              transition: "all 0.3s ease",
            }}>
              <p style={{ fontSize: "14px", color: "#e8dcc8", marginBottom: "4px" }}>{f.title}</p>
              <p style={{ fontSize: "11px", color: "#888" }}>{f.subtitle}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} className="cat-pill" onClick={() => setActiveCategory(cat)} style={{
              background: activeCategory === cat ? "rgba(201,169,110,0.15)" : "transparent",
              border: `1px solid ${activeCategory === cat ? "#c9a96e" : "#2a2418"}`,
              borderRadius: "20px", padding: "6px 16px",
              color: activeCategory === cat ? "#c9a96e" : "#888",
              fontSize: "11px", letterSpacing: "0.12em",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}>{cat.toUpperCase()}</button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "normal", letterSpacing: "0.08em", color: "#c9a96e" }}>✦ Featured Stories</h2>
          <span style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em", cursor: "pointer" }}>SEE ALL →</span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "32px 1fr 120px 80px 60px 40px",
          padding: "8px 14px", fontSize: "10px", color: "#555",
          letterSpacing: "0.12em", borderBottom: "1px solid #1a1710",
        }}>
          <span>#</span><span>TITLE</span><span>CREATOR</span><span>CATEGORY</span><span>DURATION</span><span></span>
        </div>

        {tracks.length === 0 ? (
          <div style={{ padding: "40px 14px", textAlign: "center", color: "#444", fontSize: "13px", fontStyle: "italic" }}>
            Loading stories...
          </div>
        ) : filteredTracks.map((track) => {
          const isActive = activeTrack?.id === track.id;
          const isPlaying = isActive && playing;
          return (
            <div key={track.id} className="track-row" style={{
              display: "grid", gridTemplateColumns: "32px 1fr 120px 80px 60px 40px",
              padding: "12px 14px", borderRadius: "8px", alignItems: "center",
              background: isActive ? "rgba(201,169,110,0.08)" : "transparent",
              transition: "background 0.2s", cursor: "default",
            }}>
              <button className="play-btn" onClick={() => handlePlay(track)} style={{
                width: "24px", height: "24px", borderRadius: "50%",
                background: isActive ? "#c9a96e" : "rgba(201,169,110,0.15)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isActive ? "#0d0b08" : "#c9a96e",
                fontSize: "8px", transition: "all 0.2s",
              }}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: isActive ? "#c9a96e" : "#e8dcc8", fontStyle: isActive ? "italic" : "normal" }}>
                    {track.title}
                  </span>
                  {track.is_new && (
                    <span style={{ fontSize: "9px", padding: "1px 6px", background: "rgba(201,169,110,0.2)", borderRadius: "10px", color: "#c9a96e" }}>NEW</span>
                  )}
                  {track.is_premium && <span style={{ color: "#c9a96e", fontSize: "11px" }}>🔒</span>}
                </div>
                {isActive && (
                  <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "16px", marginTop: "4px" }}>
                    {Array.from({ length: 16 }).map((_, j) => (
                      <div key={j} style={{
                        width: "2px", borderRadius: "2px", background: "#c9a96e",
                        height: `${Math.random() * 60 + 20}%`,
                        animation: isPlaying ? `wave ${0.4 + (j % 5) * 0.1}s ease-in-out infinite alternate` : "none",
                        animationDelay: `${j * 0.03}s`,
                      }} />
                    ))}
                  </div>
                )}
                {!isActive && <span style={{ fontSize: "11px", color: "#555" }}>{track.plays} plays</span>}
              </div>
              <span style={{ fontSize: "12px", color: "#888" }}>{track.creator}</span>
              <span style={{ fontSize: "10px", color: "#666" }}>{track.category}</span>
              <span style={{ fontSize: "12px", color: "#555" }}>{track.duration}</span>
              <button onClick={() => handleLike(track)} style={{
                background: "none", border: "none", cursor: "pointer", fontSize: "14px",
                color: liked[track.id] ? "#c9a96e" : "#555",
              }}>♥</button>
            </div>
          );
        })}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#100e0a", borderTop: "1px solid #2a2418",
        padding: "14px 28px", display: "flex", flexDirection: "column",
        gap: "10px", zIndex: 200,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: "#555", minWidth: "36px" }}>
            {formatTime(currentTime)}
          </span>
          <div onClick={handleSeek} style={{
            flex: 1, height: "3px", background: "#2a2418",
            borderRadius: "2px", cursor: "pointer", position: "relative",
          }}>
            <div style={{
              height: "100%", borderRadius: "2px", width: `${progress}%`,
              background: "linear-gradient(90deg, #c9a96e, #e8c080)", transition: "width 0.1s",
            }} />
          </div>
          <span style={{ fontSize: "11px", color: "#555", minWidth: "36px" }}>
            {formatTime(duration)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", color: "#e8dcc8", fontStyle: "italic" }}>{currentTrack?.title}</p>
            <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{currentTrack?.creator}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button onClick={handlePrev} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px" }}>⏮</button>
            <button onClick={() => activeTrack ? setPlaying(!playing) : tracks[0] && handlePlay(tracks[0])} style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "linear-gradient(135deg, #c9a96e, #a07840)",
              border: "none", cursor: "pointer", fontSize: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#0d0b08", boxShadow: "0 0 20px rgba(201,169,110,0.3)",
            }}>{playing ? "⏸" : "▶"}</button>
            <button onClick={handleNext} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px" }}>⏭</button>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "#666" }}>♪</span>
            <div style={{ width: "80px", height: "3px", background: "#2a2418", borderRadius: "2px" }}>
              <div style={{ width: "70%", height: "100%", background: "#c9a96e", borderRadius: "2px" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
