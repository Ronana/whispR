'use client';
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { openBillingPortal } from "../../lib/payments";
import ProfileEditModal from "./ProfileEditModal";
import CreatorApplicationModal from "./CreatorApplicationModal";
import CreatorDashboard from "./CreatorDashboard";

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

export default function UserPanel({ user, liked, tracks, history, isPremium, plan, onClose, onSignOut, onLanguageChange, onUpgrade, t, isMobile = false }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileTab, setProfileTab] = useState("liked");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsSection, setSettingsSection] = useState("audio");
  const [portalLoading, setPortalLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("whispr_settings");
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

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
    onSignOut(); onClose();
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try { await openBillingPortal({ userId: user.id }); }
    catch { setPortalLoading(false); }
  };

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Listener";
  const avatarUrl = profile?.avatar_url;
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const isCreator = profile?.role === "creator";
  const isPendingCreator = profile?.role === "pending_creator";

  const tabs = ["profile", "settings", ...(isCreator ? ["creator"] : [])];

  return (
    <>
      {showEditModal && (
        <ProfileEditModal
          user={user}
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}
      {showApplyModal && (
        <CreatorApplicationModal
          user={user}
          onClose={() => setShowApplyModal(false)}
          onSubmitted={() => setProfile(p => ({ ...p, role: "pending_creator" }))}
        />
      )}

      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: isMobile ? "100vw" : "340px",
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

          {/* Avatar + info */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: avatarUrl ? "none" : "linear-gradient(135deg, #c9a96e, #8c6030)",
                overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: "bold", color: "#0a0806",
                border: isPremium ? "2px solid #c9a96e" : "none",
                boxShadow: isPremium ? "0 0 12px rgba(201,169,110,0.4)" : "none",
                cursor: "pointer",
              }} onClick={() => setShowEditModal(true)}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initials
                }
              </div>
              {isPremium && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", fontSize: "9px", background: "#c9a96e", color: "#0a0806", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>♛</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <p style={{ fontSize: "14px", color: "#e8dcc8" }}>{displayName}</p>
                {isPremium && <span style={{ fontSize: "9px", padding: "2px 7px", background: "rgba(201,169,110,0.15)", border: "1px solid #c9a96e44", borderRadius: "10px", color: "#c9a96e" }}>PREMIUM</span>}
                {isCreator && <span style={{ fontSize: "9px", padding: "2px 7px", background: "rgba(140,110,154,0.15)", border: "1px solid #8c6e9a44", borderRadius: "10px", color: "#8c6e9a" }}>CREATOR</span>}
                {isPendingCreator && <span style={{ fontSize: "9px", padding: "2px 7px", background: "rgba(100,100,60,0.2)", border: "1px solid #555", borderRadius: "10px", color: "#888" }}>PENDING</span>}
              </div>
              <p style={{ fontSize: "11px", color: "#555", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.username ? `@${profile.username}` : user?.email}
              </p>
            </div>
          </div>

          {/* Action buttons row */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            <button onClick={() => setShowEditModal(true)} style={{
              flex: 1, padding: "7px 10px", background: "transparent",
              border: "1px solid #2a2418", borderRadius: "7px",
              color: "#888", fontSize: "10px", letterSpacing: "0.08em",
              cursor: "pointer", fontFamily: "inherit",
            }}>Edit Profile</button>

            {!isPremium && (
              <button onClick={onUpgrade} style={{
                flex: 1, padding: "7px 10px",
                background: "rgba(201,169,110,0.1)", border: "1px solid #c9a96e44",
                borderRadius: "7px", color: "#c9a96e", fontSize: "10px",
                letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit",
              }}>♛ Premium</button>
            )}
            {isPremium && (
              <button onClick={handleManageBilling} disabled={portalLoading} style={{
                flex: 1, padding: "7px 10px", background: "transparent",
                border: "1px solid #2a2418", borderRadius: "7px",
                color: "#666", fontSize: "10px", letterSpacing: "0.08em",
                cursor: portalLoading ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}>{portalLoading ? "..." : "Billing"}</button>
            )}
          </div>

          {/* Become a creator CTA */}
          {!isCreator && !isPendingCreator && (
            <button onClick={() => setShowApplyModal(true)} style={{
              width: "100%", padding: "9px", marginBottom: "14px",
              background: "rgba(140,110,154,0.08)", border: "1px solid #8c6e9a33",
              borderRadius: "8px", color: "#8c6e9a", fontSize: "11px",
              letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit",
            }}>🎙️ Apply to become a Creator</button>
          )}
          {isPendingCreator && (
            <div style={{
              width: "100%", padding: "9px", marginBottom: "14px",
              background: "rgba(100,100,60,0.08)", border: "1px solid #55553344",
              borderRadius: "8px", color: "#888", fontSize: "11px",
              letterSpacing: "0.08em", textAlign: "center",
            }}>⏳ Creator application under review</div>
          )}
          {isCreator && profile?.username && (
            <a href={`/creator/${profile.username}`} target="_blank" rel="noopener noreferrer" style={{
              display: "block", width: "100%", padding: "9px", marginBottom: "14px",
              background: "rgba(140,110,154,0.08)", border: "1px solid #8c6e9a33",
              borderRadius: "8px", color: "#8c6e9a", fontSize: "11px",
              letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit",
              textDecoration: "none", textAlign: "center",
            }}>↗ View public profile</a>
          )}

          {/* Tabs */}
          <div style={{ display: "flex" }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: "8px", background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
                color: activeTab === tab ? "#c9a96e" : "#555",
                borderBottom: activeTab === tab ? "2px solid #c9a96e" : "2px solid transparent",
              }}>{tab}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {/* Profile tab */}
          {activeTab === "profile" && (
            <>
              {profile?.bio && (
                <p style={{ fontSize: "12px", color: "#777", lineHeight: "1.7", fontStyle: "italic", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #1a1710" }}>
                  {profile.bio}
                </p>
              )}
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
                      <div><p style={{ fontSize: "13px", color: "#e8dcc8" }}>{tr.title}</p><p style={{ fontSize: "11px", color: "#666" }}>{tr.creator}</p></div>
                      <span style={{ fontSize: "11px", color: "#555" }}>{tr.duration}</span>
                    </div>
                  ))
              )}
              {profileTab === "history" && (
                historyTracks.length === 0
                  ? <p style={{ color: "#444", fontSize: "12px", fontStyle: "italic", textAlign: "center", marginTop: "24px" }}>{t.noHistory}</p>
                  : historyTracks.map(tr => (
                    <div key={tr.id} style={{ padding: "10px 0", borderBottom: "1px solid #1a1710", display: "flex", justifyContent: "space-between" }}>
                      <div><p style={{ fontSize: "13px", color: "#e8dcc8" }}>{tr.title}</p><p style={{ fontSize: "11px", color: "#666" }}>{tr.creator}</p></div>
                      <span style={{ fontSize: "11px", color: "#555" }}>{tr.duration}</span>
                    </div>
                  ))
              )}
            </>
          )}

          {/* Settings tab */}
          {activeTab === "settings" && (
            <>
              <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
                {Object.entries(s.sections).map(([key, label]) => (
                  <button key={key} onClick={() => setSettingsSection(key)} style={{
                    padding: "4px 12px", borderRadius: "12px", border: "none",
                    cursor: "pointer", fontFamily: "inherit", fontSize: "10px", letterSpacing: "0.1em",
                    background: settingsSection === key ? "rgba(201,169,110,0.15)" : "transparent",
                    color: settingsSection === key ? "#c9a96e" : "#555",
                    outline: settingsSection === key ? "1px solid #c9a96e44" : "1px solid #1e1a14",
                  }}>{label.toUpperCase()}</button>
                ))}
              </div>
              {settingsSection === "audio" && (
                <div>
                  <SettingSelect label={s.audio.label} desc={s.audio.desc}
                    value={settings.audioQuality}
                    options={isPremium ? s.audio.options : s.audio.options.slice(0, 2)}
                    onChange={v => updateSetting("audioQuality", v)}
                    premiumNote={!isPremium ? "Very High & Lossless require Premium" : null}
                    onUpgrade={onUpgrade} />
                  <SettingToggle label={s.normalize.label} desc={s.normalize.desc} value={settings.normalizeVolume} onChange={v => updateSetting("normalizeVolume", v)} />
                </div>
              )}
              {settingsSection === "playback" && (
                <div>
                  <SettingToggle label={s.crossfade.label} desc={s.crossfade.desc} value={settings.crossfade} onChange={v => updateSetting("crossfade", v)} />
                  <SettingToggle label={s.autoplay.label} desc={s.autoplay.desc} value={settings.autoplay} onChange={v => updateSetting("autoplay", v)} />
                </div>
              )}
              {settingsSection === "display" && (
                <div>
                  <SettingSelect label={s.theme.label} desc={s.theme.desc} value={settings.theme} options={s.theme.options} onChange={v => updateSetting("theme", v)} />
                  <SettingToggle label={s.compact.label} desc={s.compact.desc} value={settings.compactMode} onChange={v => updateSetting("compactMode", v)} />
                </div>
              )}
              {settingsSection === "privacy" && (
                <div>
                  <SettingToggle label={s.privateSession.label} desc={s.privateSession.desc} value={settings.privateSession} onChange={v => updateSetting("privateSession", v)} />
                  <SettingToggle label={s.explicit.label} desc={s.explicit.desc} value={settings.explicitContent} onChange={v => updateSetting("explicitContent", v)} />
                  <SettingToggle label={s.shareListening.label} desc={s.shareListening.desc} value={settings.shareListening} onChange={v => updateSetting("shareListening", v)} />
                  <SettingToggle label={s.personalisation.label} desc={s.personalisation.desc} value={settings.personalisation} onChange={v => updateSetting("personalisation", v)} />
                </div>
              )}
              {settingsSection === "language" && (
                <div>
                  <p style={{ fontSize: "12px", color: "#c9a96e", marginBottom: "2px" }}>{s.language.label}</p>
                  <p style={{ fontSize: "10px", color: "#555", marginBottom: "8px" }}>{s.language.desc}</p>
                  <select value={settings.language} onChange={e => updateSetting("language", e.target.value)} style={{ width: "100%", background: "#1a1710", border: "1px solid #2a2418", color: "#e8dcc8", borderRadius: "6px", padding: "8px 10px", fontSize: "12px", fontFamily: "Georgia, serif", cursor: "pointer" }}>
                    {s.language.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Creator tab */}
          {activeTab === "creator" && isCreator && (
            <CreatorDashboard user={user} profile={profile} />
          )}
        </div>

        {/* Sign out */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e1a14" }}>
          <button onClick={handleSignOut} style={{
            width: "100%", padding: "10px", background: "transparent",
            border: "1px solid #2a2418", borderRadius: "8px",
            color: "#888", fontSize: "12px", letterSpacing: "0.1em",
            cursor: "pointer", fontFamily: "inherit",
          }}>{t.signOut.toUpperCase()}</button>
        </div>
      </div>
    </>
  );
}

function SettingToggle({ label, desc, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
      <div><p style={{ fontSize: "12px", color: "#c9a96e", marginBottom: "2px" }}>{label}</p><p style={{ fontSize: "10px", color: "#555" }}>{desc}</p></div>
      <button onClick={() => onChange(!value)} style={{ width: "36px", height: "20px", borderRadius: "10px", border: "none", background: value ? "#c9a96e" : "#2a2418", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: "3px", borderRadius: "50%", width: "14px", height: "14px", background: "#0d0b08", left: value ? "19px" : "3px", transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

function SettingSelect({ label, desc, value, options, onChange, premiumNote, onUpgrade }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <p style={{ fontSize: "12px", color: "#c9a96e", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "10px", color: "#555", marginBottom: "8px" }}>{desc}</p>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", background: "#1a1710", border: "1px solid #2a2418", color: "#e8dcc8", borderRadius: "6px", padding: "8px 10px", fontSize: "12px", fontFamily: "Georgia, serif", cursor: "pointer" }}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {premiumNote && <button onClick={onUpgrade} style={{ marginTop: "6px", fontSize: "10px", color: "#c9a96e", background: "none", border: "none", cursor: "pointer", fontFamily: "Georgia, serif", padding: 0 }}>♛ {premiumNote}</button>}
    </div>
  );
}
