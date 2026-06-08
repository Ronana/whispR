'use client';
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";

const DEFAULT_SETTINGS = {
  audioQuality: "High",
  normalizeVolume: true,
  crossfade: false,
  autoplay: true,
  privateSession: false,
  explicitContent: true,
  theme: "Dark",
  compactMode: false,
  shareListening: false,
  personalisation: true,
  language: "en",
};

export default function UserPanel({ user, liked, tracks, history, onClose, onSignOut, onLanguageChange, t }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileTab, setProfileTab] = useState("liked");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsSection, setSettingsSection] = useState("audio");

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
    if (key === "language") onLanguageChange(value);
  };

  const likedTracks = tracks.filter(tr => liked[tr.id]);
  const historyTracks = tracks.filter(tr => history.includes(tr.id));

  const s = t.settings;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onSignOut();
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "340px",
        background: "#100e0a", borderLeft: "1px solid #2a2418",
        zIndex: 301, display: "flex", flexDirection: "column",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #1e1a14" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "#c9a96e", letterSpacing: "0.1em" }}>{t.profile.title}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px" }}>✕</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "linear-gradient(135deg, #c9a96e, #8c6030)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: "bold", color: "#0a0806",
            }}>
              {(user?.user_metadata?.full_name || user?.email || "?")
                .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p style={{ fontSize: "14px", color: "#e8dcc8" }}>{user?.user_metadata?.full_name || "Listener"}</p>
              <p style={{ fontSize: "11px", color: "#666" }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0" }}>
            {["profile", "settings"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: "8px", background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase",
                color: activeTab === tab ? "#c9a96e" : "#555",
                borderBottom: activeTab === tab ? "2px solid #c9a96e" : "2px solid transparent",
              }}>{t.profile.tabs[tab]}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {activeTab === "profile" && (
            <>
              <div style={{ display: "flex", gap: "0", marginBottom: "16px" }}>
                {["liked", "history"].map(tab => (
                  <button key={tab} onClick={() => setProfileTab(tab)} style={{
                    flex: 1, padding: "6px", background: "none", border: "none",
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
                    color: profileTab === tab ? "#c9a96e" : "#555",
                    borderBottom: profileTab === tab ? "1px solid #c9a96e" : "1px solid #1e1a14",
                  }}>{t.tabs[tab]}</button>
                ))}
              </div>
              {profileTab === "liked" && (
                likedTracks.length === 0
                  ? <p style={{ color: "#444", fontSize: "12px", fontStyle: "italic", textAlign: "center", marginTop: "24px" }}>{t.noLikes}</p>
                  : likedTracks.map(tr => (
                    <div key={tr.id} style={{ padding: "10px 0", borderBottom: "1px solid #1a1710", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: "13px", color: "#e8dcc8" }}>{tr.title}</p>
                        <p style={{ fontSize: "11px", color: "#666" }}>{tr.creator}</p>
                      </div>
                      <span style={{ fontSize: "11px", color: "#555" }}>{tr.duration}</span>
                    </div>
                  ))
              )}
              {profileTab === "history" && (
                historyTracks.length === 0
                  ? <p style={{ color: "#444", fontSize: "12px", fontStyle: "italic", textAlign: "center", marginTop: "24px" }}>{t.noHistory}</p>
                  : historyTracks.map(tr => (
                    <div key={tr.id} style={{ padding: "10px 0", borderBottom: "1px solid #1a1710", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: "13px", color: "#e8dcc8" }}>{tr.title}</p>
                        <p style={{ fontSize: "11px", color: "#666" }}>{tr.creator}</p>
                      </div>
                      <span style={{ fontSize: "11px", color: "#555" }}>{tr.duration}</span>
                    </div>
                  ))
              )}
            </>
          )}

          {activeTab === "settings" && (
            <>
              {/* Settings Nav */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
                {Object.entries(s.sections).map(([key, label]) => (
                  <button key={key} onClick={() => setSettingsSection(key)} style={{
                    padding: "4px 12px", borderRadius: "12px", border: "none",
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: "10px", letterSpacing: "0.1em",
                    background: settingsSection === key ? "rgba(201,169,110,0.15)" : "transparent",
                    color: settingsSection === key ? "#c9a96e" : "#555",
                    outline: settingsSection === key ? "1px solid #c9a96e44" : "1px solid #1e1a14",
                  }}>{label.toUpperCase()}</button>
                ))}
              </div>

              {/* Audio */}
              {settingsSection === "audio" && (
                <div>
                  <SettingSelect label={s.audio.label} desc={s.audio.desc}
                    value={settings.audioQuality} options={s.audio.options}
                    onChange={v => updateSetting("audioQuality", v)} />
                  <SettingToggle label={s.normalize.label} desc={s.normalize.desc}
                    value={settings.normalizeVolume} onChange={v => updateSetting("normalizeVolume", v)} />
                </div>
              )}

              {/* Playback */}
              {settingsSection === "playback" && (
                <div>
                  <SettingToggle label={s.crossfade.label} desc={s.crossfade.desc}
                    value={settings.crossfade} onChange={v => updateSetting("crossfade", v)} />
                  <SettingToggle label={s.autoplay.label} desc={s.autoplay.desc}
                    value={settings.autoplay} onChange={v => updateSetting("autoplay", v)} />
                </div>
              )}

              {/* Display */}
              {settingsSection === "display" && (
                <div>
                  <SettingSelect label={s.theme.label} desc={s.theme.desc}
                    value={settings.theme} options={s.theme.options}
                    onChange={v => updateSetting("theme", v)} />
                  <SettingToggle label={s.compact.label} desc={s.compact.desc}
                    value={settings.compactMode} onChange={v => updateSetting("compactMode", v)} />
                </div>
              )}

              {/* Privacy */}
              {settingsSection === "privacy" && (
                <div>
                  <SettingToggle label={s.privateSession.label} desc={s.privateSession.desc}
                    value={settings.privateSession} onChange={v => updateSetting("privateSession", v)} />
                  <SettingToggle label={s.explicit.label} desc={s.explicit.desc}
                    value={settings.explicitContent} onChange={v => updateSetting("explicitContent", v)} />
                  <SettingToggle label={s.shareListening.label} desc={s.shareListening.desc}
                    value={settings.shareListening} onChange={v => updateSetting("shareListening", v)} />
                  <SettingToggle label={s.personalisation.label} desc={s.personalisation.desc}
                    value={settings.personalisation} onChange={v => updateSetting("personalisation", v)} />
                </div>
              )}

              {/* Language */}
              {settingsSection === "language" && (
                <div>
                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "12px", color: "#c9a96e", marginBottom: "2px" }}>{s.language.label}</p>
                    <p style={{ fontSize: "10px", color: "#555", marginBottom: "8px" }}>{s.language.desc}</p>
                    <select
                      value={settings.language}
                      onChange={e => updateSetting("language", e.target.value)}
                      style={{
                        width: "100%", background: "#1a1710", border: "1px solid #2a2418",
                        color: "#e8dcc8", borderRadius: "6px", padding: "8px 10px",
                        fontSize: "12px", fontFamily: "Georgia, serif", cursor: "pointer",
                      }}
                    >
                      {s.language.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sign Out */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e1a14" }}>
          <button onClick={handleSignOut} style={{
            width: "100%", padding: "10px", background: "transparent",
            border: "1px solid #2a2418", borderRadius: "8px",
            color: "#888", fontSize: "12px", letterSpacing: "0.1em",
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          }}>{t.signOut.toUpperCase()}</button>
        </div>
      </div>
    </>
  );
}

function SettingToggle({ label, desc, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
      <div>
        <p style={{ fontSize: "12px", color: "#c9a96e", marginBottom: "2px" }}>{label}</p>
        <p style={{ fontSize: "10px", color: "#555" }}>{desc}</p>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: "36px", height: "20px", borderRadius: "10px", border: "none",
        background: value ? "#c9a96e" : "#2a2418", cursor: "pointer",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: "3px", borderRadius: "50%",
          width: "14px", height: "14px", background: "#0d0b08",
          left: value ? "19px" : "3px", transition: "left 0.2s",
        }} />
      </button>
    </div>
  );
}

function SettingSelect({ label, desc, value, options, onChange }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <p style={{ fontSize: "12px", color: "#c9a96e", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "10px", color: "#555", marginBottom: "8px" }}>{desc}</p>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        width: "100%", background: "#1a1710", border: "1px solid #2a2418",
        color: "#e8dcc8", borderRadius: "6px", padding: "8px 10px",
        fontSize: "12px", fontFamily: "Georgia, serif", cursor: "pointer",
      }}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
