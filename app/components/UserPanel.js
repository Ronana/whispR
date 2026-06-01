'use client';
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";

const DEFAULT_SETTINGS = {
  audioQuality: "high",
  normaliseVolume: true,
  autoplay: true,
  crossfade: false,
  compactList: false,
  showNowPlaying: true,
  privateHistory: false,
  language: "en",
};

const LANGUAGES = [
  { code: "en", label: "English (UK)" },
  { code: "en-us", label: "English (US)" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ja", label: "日本語" },
];

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: "40px", height: "22px", borderRadius: "11px",
      background: value ? "linear-gradient(135deg, #c9966a, #a07840)" : "#2a2418",
      border: "none", cursor: "pointer", position: "relative",
      transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: "3px",
        left: value ? "21px" : "3px",
        width: "16px", height: "16px",
        borderRadius: "50%", background: "#f0e6d0",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: "1px solid #141210",
      gap: "16px",
    }}>
      <div>
        <p style={{ fontSize: "13px", color: "#e8dcc8", marginBottom: description ? "2px" : 0 }}>{label}</p>
        {description && <p style={{ fontSize: "10px", color: "#555", lineHeight: "1.4" }}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <p style={{
      fontSize: "10px", color: "#c9966a",
      letterSpacing: "0.15em", marginBottom: "4px",
      marginTop: "4px",
    }}>{children}</p>
  );
}

export default function UserPanel({ user, liked, tracks, history, onClose, onSignOut }) {
  const [tab, setTab] = useState("profile");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("whispr_settings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("whispr_settings", JSON.stringify(next));
  };

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

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      background: "none", border: "none",
      borderBottom: tab === id ? "1px solid #c9966a" : "1px solid transparent",
      padding: "8px 0", color: tab === id ? "#c9966a" : "#555",
      fontSize: "10px", letterSpacing: "0.15em",
      fontFamily: "Georgia, 'Times New Roman', serif",
      cursor: "pointer", transition: "all 0.2s",
    }}>{label}</button>
  );

  const selectStyle = {
    background: "#1a1710", border: "1px solid #2a2418",
    borderRadius: "4px", color: "#e8dcc8",
    fontSize: "11px", padding: "5px 8px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    cursor: "pointer", outline: "none",
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
      }} />

      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "340px", zIndex: 301,
        background: "#0f0d0a", borderLeft: "1px solid #1e1a14",
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
        <div style={{ padding: "24px 20px 0", borderBottom: "1px solid #1a1710" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: "linear-gradient(135deg, #c9966a, #8c6030)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", color: "#0a0806", fontWeight: "bold", flexShrink: 0,
                boxShadow: "0 0 16px rgba(201,150,106,0.2)",
              }}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "14px", color: "#f0e6d0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                <p style={{ fontSize: "10px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "20px" }}>
            {tabBtn("profile", "PROFILE")}
            {tabBtn("settings", "SETTINGS")}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

          {tab === "profile" && (
            <>
              <SectionHeader>♥ LIKED · {likedTracks.length}</SectionHeader>
              {likedTracks.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#3a3020", fontStyle: "italic", padding: "8px 0 16px" }}>No liked tracks yet</p>
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

              <div style={{ height: "1px", background: "#1a1710", margin: "16px 0" }} />

              <SectionHeader>◷ RECENTLY PLAYED</SectionHeader>
              {historyTracks.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#3a3020", fontStyle: "italic", padding: "8px 0" }}>Nothing played yet</p>
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
            </>
          )}

          {tab === "settings" && (
            <>
              <SectionHeader>AUDIO QUALITY</SectionHeader>
              <SettingRow label="Streaming quality" description="Higher quality uses more data">
                <select
                  value={settings.audioQuality}
                  onChange={e => updateSetting("audioQuality", e.target.value)}
                  style={selectStyle}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </SettingRow>
              <SettingRow label="Normalise volume" description="Set the same volume level for all tracks">
                <Toggle value={settings.normaliseVolume} onChange={v => updateSetting("normaliseVolume", v)} />
              </SettingRow>

              <div style={{ height: "1px", background: "#1a1710", margin: "16px 0 12px" }} />
              <SectionHeader>PLAYBACK</SectionHeader>
              <SettingRow label="Autoplay" description="Continue playing similar tracks when your queue ends">
                <Toggle value={settings.autoplay} onChange={v => updateSetting("autoplay", v)} />
              </SettingRow>
              <SettingRow label="Crossfade" description="Smooth transition between tracks">
                <Toggle value={settings.crossfade} onChange={v => updateSetting("crossfade", v)} />
              </SettingRow>

              <div style={{ height: "1px", background: "#1a1710", margin: "16px 0 12px" }} />
              <SectionHeader>DISPLAY</SectionHeader>
              <SettingRow label="Compact track list" description="Use a tighter layout for browsing">
                <Toggle value={settings.compactList} onChange={v => updateSetting("compactList", v)} />
              </SettingRow>
              <SettingRow label="Show now-playing bar" description="Always show player details at the bottom">
                <Toggle value={settings.showNowPlaying} onChange={v => updateSetting("showNowPlaying", v)} />
              </SettingRow>

              <div style={{ height: "1px", background: "#1a1710", margin: "16px 0 12px" }} />
              <SectionHeader>PRIVACY</SectionHeader>
              <SettingRow label="Private listening history" description="Stop saving what you play to your history">
                <Toggle value={settings.privateHistory} onChange={v => updateSetting("privateHistory", v)} />
              </SettingRow>

              <div style={{ height: "1px", background: "#1a1710", margin: "16px 0 12px" }} />
              <SectionHeader>LANGUAGE</SectionHeader>
              <SettingRow label="Language" description="Changes will apply on next load">
                <select
                  value={settings.language}
                  onChange={e => updateSetting("language", e.target.value)}
                  style={selectStyle}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </SettingRow>
            </>
          )}
        </div>

        {/* Sign out */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1710" }}>
          <button className="signout-btn" onClick={handleSignOut} style={{
            width: "100%", padding: "11px",
            background: "none", border: "1px solid #2a2418",
            borderRadius: "4px", color: "#555", fontSize: "11px",
            letterSpacing: "0.12em",
            fontFamily: "Georgia, 'Times New Roman', serif",
            cursor: "pointer", transition: "all 0.2s",
          }}>
            SIGN OUT
          </button>
        </div>
      </div>
    </>
  );
}
