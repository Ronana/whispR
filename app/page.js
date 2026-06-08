'use client';
import { useState, useEffect, useCallback, useRef } from "react";
import AgeGate from "./components/AgeGate";
import AuthGate from "./components/AuthGate";
import UserPanel from "./components/UserPanel";
import PremiumModal from "./components/PremiumModal";
import CookieBanner from "./components/CookieBanner";
import { createClient } from "../lib/supabase";
import { getT } from "../lib/translations";
import { getPlan } from "../lib/payments";
import { SkeletonTrackRow, SkeletonFeaturedCard, FadeIn } from "./components/Skeleton";

const featured = [
  { id: 1, color: "#c9a96e" },
  { id: 2, color: "#8c6e9a" },
  { id: 3, color: "#6e8c7a" },
];

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
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeNav, setActiveNav] = useState("home");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [language, setLanguage] = useState("en");
  const [isPremium, setIsPremium] = useState(false);
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const [creatorProfiles, setCreatorProfiles] = useState({});
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("whispr_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch {}
  }, []);

  const t = getT(language);
  const plan = getPlan(language);
  const clearSearch = () => setSearch("");

  useEffect(() => { setActiveCategory(null); }, [language]);

  const handleAgeConfirm = useCallback(() => setAgeConfirmed(true), []);
  const handleAuth = useCallback(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);
  const handleSignOut = useCallback(() => {
    setUser(null); setLiked({}); setHistory([]); setIsPremium(false);
  }, []);
  const handleLanguageChange = useCallback((lang) => setLanguage(lang), []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("tracks").select("*").order("id").then(({ data, error }) => {
      if (!error && data) {
        setTracks(data);
        // Load creator profiles for avatars + links
        supabase.from("profiles")
          .select("display_name, username, avatar_url")
          .eq("role", "creator")
          .then(({ data: profiles }) => {
            if (profiles) {
              const map = {};
              profiles.forEach(p => { map[p.display_name] = p; });
              setCreatorProfiles(map);
            }
          });
      }
    });
  }, []);

  useEffect(() => {
    if (!user) { setIsPremium(false); return; }
    const supabase = createClient();
    supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setIsPremium(data?.status === "active"));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from("likes").select("track_id").eq("user_id", user.id).then(({ data }) => {
      if (data) { const map = {}; data.forEach(r => { map[r.track_id] = true; }); setLiked(map); }
    });
    supabase.from("listening_history").select("track_id").eq("user_id", user.id)
      .order("played_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setHistory(data.map(r => r.track_id)); });
  }, [user]);

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
    audio.src = activeTrack.audio_url; audio.load();
    setCurrentTime(0); setDuration(0);
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
    if (activeTrack?.id === track.id) setPlaying(!playing);
    else { setActiveTrack(track); setPlaying(true); recordHistory(track); }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const handlePrev = () => {
    if (!tracks.length || !activeTrack) return;
    const idx = tracks.findIndex(t => t.id === activeTrack.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    setActiveTrack(prev); setPlaying(true); recordHistory(prev);
  };

  const handleNext = () => {
    if (!tracks.length || !activeTrack) return;
    const idx = tracks.findIndex(t => t.id === activeTrack.id);
    const next = tracks[(idx + 1) % tracks.length];
    setActiveTrack(next); setPlaying(true); recordHistory(next);
  };

  const handleLike = async (track) => {
    const isLiked = liked[track.id];
    setLiked(l => ({ ...l, [track.id]: !isLiked }));
    if (!user) return;
    const supabase = createClient();
    if (isLiked) await supabase.from("likes").delete().eq("user_id", user.id).eq("track_id", track.id);
    else await supabase.from("likes").insert({ user_id: user.id, track_id: track.id });
  };

  const handleDownload = async (track) => {
    if (!isPremium) { setShowPremiumModal(true); return; }
    const a = document.createElement("a");
    a.href = track.audio_url;
    a.download = `${track.title} - ${track.creator}.mp3`;
    a.click();
  };

  const activeCat = activeCategory ?? t.categories[0];
  const query = search.trim().toLowerCase();
  const filteredTracks = (activeCat === t.categories[0]
    ? tracks
    : tracks.filter(tr => tr.category === activeCat))
    .filter(tr => !query || tr.title.toLowerCase().includes(query) || tr.creator.toLowerCase().includes(query) || tr.category.toLowerCase().includes(query));

  const currentTrack = activeTrack || tracks[2] || tracks[0];
  const progress = duration ? (currentTime / duration) * 100 : 0;
  const initials = (user?.user_metadata?.full_name || user?.email || "?")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // Bottom padding: player (96px) + mobile bottom nav (56px) if mobile
  const mainPaddingBottom = isMobile ? "168px" : "120px";

  if (user === undefined) return null;

  return (
    <>
      {!ageConfirmed && <AgeGate onConfirm={handleAgeConfirm} />}
      {ageConfirmed && !user && <AuthGate onAuth={handleAuth} />}
      {panelOpen && user && (
        <UserPanel
          user={user} liked={liked} tracks={tracks} history={history}
          isPremium={isPremium} plan={plan}
          onClose={() => setPanelOpen(false)} onSignOut={handleSignOut}
          onLanguageChange={handleLanguageChange}
          onUpgrade={() => { setPanelOpen(false); setShowPremiumModal(true); }}
          t={t} isMobile={isMobile}
        />
      )}
      {showPremiumModal && (
        <PremiumModal user={user} language={language} plan={plan} onClose={() => setShowPremiumModal(false)} />
      )}

      <div style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        background: "#0d0b08", color: "#e8dcc8",
        minHeight: "100vh", display: "flex", flexDirection: "column",
      }}>
        <style>{`
          @keyframes whispr-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          .track-row { transition: background 0.2s ease; }
          .track-row:hover { background: rgba(201,169,110,0.05) !important; }
          .card:hover { transform: translateY(-2px); }
          .play-btn { transition: transform 0.15s ease, background 0.2s ease !important; }
          .play-btn:hover { transform: scale(1.08) !important; }
          .play-btn:active { transform: scale(0.95) !important; }
          .bottom-nav-btn { transition: color 0.2s ease !important; }

          * { box-sizing: border-box; margin: 0; padding: 0; }
          .track-row:hover { background: rgba(201,169,110,0.06) !important; }
          .play-btn:hover { transform: scale(1.08); }
          .nav-item:hover { color: #c9a96e !important; }
          .cat-pill:hover { border-color: #c9a96e !important; color: #c9a96e !important; }
          .card:hover { transform: translateY(-3px); }
          .avatar-btn:hover { box-shadow: 0 0 16px rgba(201,169,110,0.4) !important; }
          .premium-btn:hover { opacity: 0.85; }
          .search-input:focus { border-color: #c9a96e88 !important; outline: none; }
          .search-clear:hover { color: #c9a96e !important; }
          .bottom-nav-btn:hover { color: #c9a96e !important; }
          @keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #2a2418; border-radius: 2px; }
        `}</style>

        {/* ── Top Nav ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "14px 16px" : "18px 28px",
          borderBottom: "1px solid #1e1a14",
          background: "#0d0b08", position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #c9a96e, #8c6030)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>〜</div>
            <span style={{ fontSize: isMobile ? "18px" : "20px", color: "#e8dcc8" }}>Whisp<span style={{ color: "#c9a96e", fontWeight: "bold" }}>R</span></span>
          </div>

          {/* Desktop nav links */}
          {!isMobile && (
            <div style={{ display: "flex", gap: "24px" }}>
              {["home", "discover", "library"].map(nav => (
                <button key={nav} className="nav-item" onClick={() => setActiveNav(nav)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: activeNav === nav ? "#c9a96e" : "#888",
                  fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase",
                  fontFamily: "inherit",
                  borderBottom: activeNav === nav ? "1px solid #c9a96e" : "1px solid transparent",
                  paddingBottom: "2px", transition: "color 0.2s",
                }}>{t.nav[nav]}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px" }}>
            {user && (
              <button className="avatar-btn" onClick={() => setPanelOpen(true)} style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a96e, #8c6030)",
                border: isPremium ? "2px solid #c9a96e" : "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "bold", color: "#0a0806", fontFamily: "inherit",
                boxShadow: isPremium ? "0 0 14px rgba(201,169,110,0.5)" : "0 0 10px rgba(201,169,110,0.2)",
                transition: "box-shadow 0.2s", position: "relative", flexShrink: 0,
              }}>
                {initials}
                {isPremium && (
                  <span style={{ position: "absolute", top: "-4px", right: "-4px", fontSize: "9px", background: "#c9a96e", color: "#0a0806", borderRadius: "50%", width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>♛</span>
                )}
              </button>
            )}
            <button className="premium-btn" onClick={() => setShowPremiumModal(true)} style={{
              background: isPremium ? "transparent" : "linear-gradient(135deg, #c9a96e, #a07840)",
              border: isPremium ? "1px solid #c9a96e44" : "none",
              borderRadius: "20px", padding: isMobile ? "6px 12px" : "8px 20px",
              color: isPremium ? "#c9a96e" : "#0d0b08",
              fontSize: "10px", letterSpacing: "0.1em", fontWeight: "bold",
              cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s", flexShrink: 0,
            }}>
              {isPremium ? "♛" : (isMobile ? "PRO" : t.premium)}
            </button>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div style={{ padding: isMobile ? "10px 16px" : "12px 28px", borderBottom: "1px solid #1e1a14", background: "#0d0b08" }}>
          <div style={{ position: "relative", maxWidth: isMobile ? "100%" : "480px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#444", pointerEvents: "none" }}>🔍</span>
            <input
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search titles, creators, categories..."
              style={{
                width: "100%", background: "#1a1710",
                border: "1px solid #2a2418", borderRadius: "20px",
                padding: "9px 36px", color: "#e8dcc8",
                fontSize: isMobile ? "16px" : "13px",
                fontFamily: "Georgia, 'Times New Roman', serif",
                transition: "border-color 0.2s",
              }}
            />
            {search && (
              <button className="search-clear" onClick={clearSearch} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "#555",
                cursor: "pointer", fontSize: "16px", lineHeight: 1, transition: "color 0.2s",
              }}>✕</button>
            )}
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, overflow: "auto", padding: isMobile ? `20px 16px ${mainPaddingBottom}` : `28px 28px ${mainPaddingBottom}` }}>

          {/* Hero */}
          <div style={{ marginBottom: isMobile ? "24px" : "36px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.25em", color: "#c9a96e88", marginBottom: "8px", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>{t.greeting}</p>
            <h1 style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: "300", color: "#e8dcc8", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {t.hero} <span style={{ color: "#c9a96e", fontStyle: "italic", fontWeight: "400" }}>{t.heroCta}</span>
            </h1>
            {!isMobile && <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, #c9a96e, transparent)", marginTop: "14px" }} />}
          </div>

          {/* Featured cards — 1 col mobile, 3 col desktop */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "12px", marginBottom: isMobile ? "24px" : "40px",
          }}>
            {!tracksLoaded ? (
              Array.from({ length: isMobile ? 1 : 3 }).map((_, i) => (
                <SkeletonFeaturedCard key={i} />
              ))
            ) : featured.map((f, i) => (
              {(() => {
                const icons = ["〜", "✦", "♪"];
                const descs = ["New this week", "Editor's picks", "Top played"];
                return (
                  <div key={f.id} className="card" style={{
                    background: `linear-gradient(135deg, ${f.color}18 0%, ${f.color}06 100%)`,
                    border: `1px solid ${f.color}25`,
                    borderRadius: "14px", padding: isMobile ? "14px 16px" : "22px",
                    cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    display: "flex", alignItems: isMobile ? "center" : "flex-start",
                    flexDirection: isMobile ? "row" : "column",
                    gap: isMobile ? "12px" : "14px",
                    animation: "whispr-fadein 0.4s ease forwards",
                    position: "relative", overflow: "hidden",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${f.color}18`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{
                      width: isMobile ? "40px" : "48px", height: isMobile ? "40px" : "48px",
                      borderRadius: "10px", flexShrink: 0,
                      background: `${f.color}20`, border: `1px solid ${f.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: isMobile ? "18px" : "22px", color: f.color,
                    }}>{icons[i]}</div>
                    <div>
                      <p style={{ fontSize: isMobile ? "13px" : "15px", color: "#e8dcc8", fontWeight: "500", marginBottom: "3px" }}>{t.featuredCards[i].title}</p>
                      {!isMobile && <p style={{ fontSize: "11px", color: "#666" }}>{descs[i]}</p>}
                    </div>
                    {/* Decorative bg circle */}
                    {!isMobile && <div style={{
                      position: "absolute", right: "-20px", bottom: "-20px",
                      width: "80px", height: "80px", borderRadius: "50%",
                      background: `${f.color}08`,
                    }} />}
                  </div>
                );
              })()}
            ))}
          </div>

          {/* Category pills — horizontal scroll on mobile */}
          <div style={{
            display: "flex", gap: "8px", marginBottom: "20px",
            overflowX: isMobile ? "auto" : "visible",
            flexWrap: isMobile ? "nowrap" : "wrap",
            paddingBottom: isMobile ? "4px" : "0",
            WebkitOverflowScrolling: "touch",
          }}>
            {t.categories.map(cat => (
              <button key={cat} className="cat-pill" onClick={() => setActiveCategory(cat)} style={{
                background: activeCat === cat ? "rgba(201,169,110,0.15)" : "transparent",
                border: `1px solid ${activeCat === cat ? "#c9a96e" : "#2a2418"}`,
                borderRadius: "20px", padding: "6px 16px",
                color: activeCat === cat ? "#c9a96e" : "#888",
                fontSize: "11px", letterSpacing: "0.12em",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>{cat.toUpperCase()}</button>
            ))}
          </div>

          {/* Track list header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "3px", height: "18px", background: "linear-gradient(180deg, #c9a96e, #8c6030)", borderRadius: "2px" }} />
              <h2 style={{ fontSize: "15px", fontWeight: "500", letterSpacing: "0.06em", color: "#e8dcc8", fontFamily: "system-ui, sans-serif" }}>{t.featured.title}</h2>
            </div>
            <span style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#c9a96e"}
              onMouseLeave={e => e.currentTarget.style.color = "#555"}
            >{t.featured.seeAll}</span>
          </div>

          {/* Column headers — hidden on mobile */}
          {!isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "32px 44px 1fr 160px 80px 60px 40px 32px", padding: "8px 14px", fontSize: "10px", color: "#555", letterSpacing: "0.12em", borderBottom: "1px solid #1a1710" }}>
              <span>#</span><span></span><span>{t.cols.title}</span><span>{t.cols.creator}</span><span>{t.cols.category}</span><span>{t.cols.duration}</span><span></span><span></span>
            </div>
          )}

          {/* Tracks */}
          {!tracksLoaded ? (
            <div>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonTrackRow key={i} isMobile={isMobile} />)}
            </div>
          ) : filteredTracks.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#444", fontSize: "13px", fontStyle: "italic" }}>
              No results for &ldquo;{search}&rdquo; —{" "}
              <button onClick={clearSearch} style={{ background: "none", border: "none", color: "#c9a96e", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontStyle: "italic" }}>clear search</button>
            </div>
          ) : filteredTracks.map((track) => {
            const isActive = activeTrack?.id === track.id;
            const isPlaying = isActive && playing;

            if (isMobile) {
              return (
                <div key={track.id} className="track-row" style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 4px", borderBottom: "1px solid #1a1710",
                  background: isActive ? "rgba(201,169,110,0.08)" : "transparent",
                  transition: "background 0.2s",
                }}>
                  <button className="play-btn" onClick={() => handlePlay(track)} style={{
                    width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                    background: isActive ? "#c9a96e" : "rgba(201,169,110,0.15)",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isActive ? "#0d0b08" : "#c9a96e", fontSize: "14px",
                  }}>{isPlaying ? "⏸" : "▶"}</button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", color: isActive ? "#c9a96e" : "#e8dcc8", fontStyle: isActive ? "italic" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</span>
                      {track.is_new && <span style={{ fontSize: "9px", padding: "1px 5px", background: "rgba(201,169,110,0.2)", borderRadius: "8px", color: "#c9a96e", flexShrink: 0 }}>NEW</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                      {(() => {
                        const cp = creatorProfiles[track.creator];
                        const initials2 = (track.creator || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                        const nameEl = (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <div style={{
                              width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                              background: cp?.avatar_url ? "none" : "rgba(201,169,110,0.2)",
                              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "7px", color: "#c9a96e",
                            }}>
                              {cp?.avatar_url ? <img src={cp.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials2}
                            </div>
                            <span style={{ fontSize: "11px", color: cp ? "#c9a96e" : "#666" }}>{track.creator}</span>
                          </div>
                        );
                        return cp?.username
                          ? <a href={`/creator/${cp.username}`} style={{ textDecoration: "none" }}>{nameEl}</a>
                          : nameEl;
                      })()}
                      <span style={{ fontSize: "11px", color: "#555" }}>· {track.duration}</span>
                    </div>
                    {isActive && isPlaying && (
                      <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "12px", marginTop: "4px" }}>
                        {Array.from({ length: 12 }).map((_, j) => (
                          <div key={j} style={{ width: "2px", borderRadius: "1px", background: "#c9a96e", height: `${Math.random() * 60 + 20}%`, animation: `wave ${0.4 + (j % 5) * 0.1}s ease-in-out infinite alternate`, animationDelay: `${j * 0.04}s` }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleLike(track)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: liked[track.id] ? "#c9a96e" : "#444", flexShrink: 0, padding: "4px" }}>♥</button>
                </div>
              );
            }

            return (
              <div key={track.id} className="track-row" style={{
                display: "grid", gridTemplateColumns: "32px 44px 1fr 160px 80px 60px 40px 32px",
                padding: "12px 14px", borderRadius: "8px", alignItems: "center",
                background: isActive ? "rgba(201,169,110,0.08)" : "transparent", transition: "background 0.2s",
              }}>
                <button className="play-btn" onClick={() => handlePlay(track)} style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: isActive ? "#c9a96e" : "rgba(201,169,110,0.15)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isActive ? "#0d0b08" : "#c9a96e", fontSize: "8px", transition: "all 0.2s",
                }}>{isPlaying ? "⏸" : "▶"}</button>
                {/* Track art */}
                <div style={{
                  width: "38px", height: "38px", borderRadius: "6px", flexShrink: 0,
                  background: isActive ? "rgba(201,169,110,0.2)" : "rgba(201,169,110,0.07)",
                  border: isActive ? "1px solid #c9a96e44" : "1px solid #1e1a14",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", color: isActive ? "#c9a96e" : "#333",
                }}>♪</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", color: isActive ? "#c9a96e" : "#e8dcc8", fontStyle: isActive ? "italic" : "normal" }}>{track.title}</span>
                    {track.is_new && <span style={{ fontSize: "9px", padding: "1px 6px", background: "rgba(201,169,110,0.2)", borderRadius: "10px", color: "#c9a96e" }}>NEW</span>}
                    {track.is_premium && <span style={{ color: "#c9a96e", fontSize: "11px" }}>🔒</span>}
                  </div>
                  {isActive && (
                    <div style={{ display: "flex", alignItems: "center", gap: "2px", height: "16px", marginTop: "4px" }}>
                      {Array.from({ length: 16 }).map((_, j) => (
                        <div key={j} style={{ width: "2px", borderRadius: "2px", background: "#c9a96e", height: `${Math.random() * 60 + 20}%`, animation: isPlaying ? `wave ${0.4 + (j % 5) * 0.1}s ease-in-out infinite alternate` : "none", animationDelay: `${j * 0.03}s` }} />
                      ))}
                    </div>
                  )}
                  {!isActive && <span style={{ fontSize: "11px", color: "#555" }}>{Number(track.plays) >= 1000 ? `${(Number(track.plays)/1000).toFixed(1)}K` : track.plays} plays</span>}
                </div>
                {(() => {
                  const cp = creatorProfiles[track.creator];
                  const initials2 = (track.creator || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                  const inner = (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                        background: cp?.avatar_url ? "none" : "linear-gradient(135deg, #c9a96e44, #8c603044)",
                        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "9px", color: "#c9a96e",
                      }}>
                        {cp?.avatar_url
                          ? <img src={cp.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : initials2}
                      </div>
                      <span style={{ fontSize: "12px", color: cp ? "#c9a96e" : "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.creator}</span>
                    </div>
                  );
                  return cp?.username
                    ? <a href={`/creator/${cp.username}`} style={{ textDecoration: "none", transition: "opacity 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.75"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >{inner}</a>
                    : inner;
                })()}
                <span style={{ fontSize: "10px", color: "#666" }}>{track.category}</span>
                <span style={{ fontSize: "12px", color: "#555" }}>{track.duration}</span>
                <button onClick={() => handleLike(track)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: liked[track.id] ? "#c9a96e" : "#555" }}>♥</button>
                <button onClick={() => handleDownload(track)} title={isPremium ? "Download" : "Premium feature"} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#333", transition: "color 0.2s" }}>
                  {isPremium ? "⬇" : "🔒"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Mobile bottom nav bar ── */}
        {isMobile && (
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            height: "56px",
            background: "#0a0806", borderTop: "1px solid #1e1a14",
            display: "flex", alignItems: "center", justifyContent: "space-around",
            zIndex: 198, paddingBottom: "env(safe-area-inset-bottom)",
          }}>
            {[
              { key: "home", icon: "⌂", label: t.nav.home },
              { key: "discover", icon: "◎", label: t.nav.discover },
              { key: "library", icon: "♫", label: t.nav.library },
            ].map(({ key, icon, label }) => (
              <button key={key} className="bottom-nav-btn" onClick={() => setActiveNav(key)} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                color: activeNav === key ? "#c9a96e" : "#555",
                fontSize: "10px", letterSpacing: "0.08em", padding: "6px 0",
                transition: "color 0.2s",
              }}>
                <span style={{ fontSize: "18px", lineHeight: 1 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Player bar ── */}
        <div style={{
          position: "fixed",
          bottom: isMobile ? "56px" : "0",
          left: 0, right: 0,
          background: "#100e0a", borderTop: "1px solid #2a2418",
          padding: isMobile ? "10px 16px" : "14px 28px",
          display: "flex", flexDirection: "column", gap: isMobile ? "8px" : "10px",
          zIndex: 199,
        }}>
          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: "#555", minWidth: "32px" }}>{formatTime(currentTime)}</span>
            <div onClick={handleSeek} style={{ flex: 1, height: isMobile ? "4px" : "3px", background: "#2a2418", borderRadius: "2px", cursor: "pointer" }}>
              <div style={{ height: "100%", borderRadius: "2px", width: `${progress}%`, background: "linear-gradient(90deg, #c9a96e, #e8c080)", transition: "width 0.1s" }} />
            </div>
            <span style={{ fontSize: "11px", color: "#555", minWidth: "32px", textAlign: "right" }}>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: isMobile ? "14px" : "13px", color: "#e8dcc8", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTrack?.title}</p>
              <p style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{currentTrack?.creator}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "24px" : "20px" }}>
              <button onClick={handlePrev} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: isMobile ? "20px" : "16px", padding: "4px" }}>⏮</button>
              <button onClick={() => activeTrack ? setPlaying(!playing) : tracks[0] && handlePlay(tracks[0])} style={{
                width: isMobile ? "50px" : "44px", height: isMobile ? "50px" : "44px", borderRadius: "50%",
                background: "linear-gradient(135deg, #c9a96e, #a07840)",
                border: "none", cursor: "pointer", fontSize: isMobile ? "20px" : "18px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0d0b08", boxShadow: "0 0 20px rgba(201,169,110,0.3)",
              }}>{playing ? "⏸" : "▶"}</button>
              <button onClick={handleNext} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: isMobile ? "20px" : "16px", padding: "4px" }}>⏭</button>
            </div>
            {!isMobile && (
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", color: "#666" }}>♪</span>
                <div style={{ width: "80px", height: "3px", background: "#2a2418", borderRadius: "2px" }}>
                  <div style={{ width: "70%", height: "100%", background: "#c9a96e", borderRadius: "2px" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cookie Banner ── */}
      <CookieBanner />

      {/* ── Legal Footer ── */}
      {!isMobile && (
        <div style={{
          position: "fixed", bottom: "96px", left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: "16px",
          fontSize: "10px", color: "#2e2820", zIndex: 100, pointerEvents: "none",
        }}>
          {[
            ["Terms", "/legal/terms"],
            ["Privacy", "/legal/privacy"],
            ["Cookies", "/legal/cookies"],
            ["Guidelines", "/legal/guidelines"],
            ["Legal", "/legal"],
          ].map(([label, href]) => (
            <a key={href} href={href} style={{ color: "#2e2820", pointerEvents: "all", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#555"}
              onMouseLeave={e => e.currentTarget.style.color = "#2e2820"}
            >{label}</a>
          ))}
        </div>
      )}
    </>
  );
}
