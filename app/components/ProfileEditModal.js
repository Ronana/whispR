'use client';
import { useState, useRef } from "react";
import { createClient } from "../../lib/supabase";

export default function ProfileEditModal({ user, profile, onClose, onSave }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [usernameError, setUsernameError] = useState(null);
  const fileRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Avatar must be under 2MB"); return; }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) { setError(uploadError.message); setUploading(false); return; }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl + `?t=${Date.now()}`);
    setUploading(false);
  };

  const validateUsername = (val) => {
    if (val && !/^[a-z0-9_]{3,30}$/.test(val)) {
      setUsernameError("3–30 characters, lowercase letters, numbers and underscores only");
    } else {
      setUsernameError(null);
    }
  };

  const handleSave = async () => {
    if (usernameError) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const updates = {
      user_id: user.id,
      display_name: displayName.trim() || null,
      username: username.trim().toLowerCase() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: "user_id" });

    if (upsertError) {
      if (upsertError.message.includes("unique")) {
        setError("That username is already taken.");
      } else {
        setError(upsertError.message);
      }
      setSaving(false);
      return;
    }

    onSave({ ...profile, ...updates });
    onClose();
  };

  const initials = (displayName || user?.email || "?")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)", zIndex: 500 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(440px, 94vw)",
        background: "#100e0a", border: "1px solid #2a2418",
        borderRadius: "16px", zIndex: 501,
        fontFamily: "Georgia, 'Times New Roman', serif",
        overflow: "hidden",
      }}>
        <div style={{ padding: "24px 24px 0", borderBottom: "1px solid #1e1a14", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "normal", color: "#c9a96e", letterSpacing: "0.08em" }}>Edit Profile</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px" }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: avatarUrl ? "none" : "linear-gradient(135deg, #c9a96e, #8c6030)",
                overflow: "hidden", cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px dashed #2a2418", position: "relative",
              }}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "22px", fontWeight: "bold", color: "#0a0806" }}>{initials}</span>
              }
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0, transition: "opacity 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ fontSize: "20px" }}>{uploading ? "⏳" : "📷"}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "#e8dcc8", marginBottom: "4px" }}>Profile photo</p>
              <p style={{ fontSize: "11px", color: "#555" }}>Click to upload · Max 2MB</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
            </div>
          </div>

          {/* Display name */}
          <Field label="Display name">
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="How you appear to others"
              maxLength={50}
              style={inputStyle}
            />
          </Field>

          {/* Username */}
          <Field label="Username" note={usernameError || "Your public URL: whispraudio.com/creator/username"} noteError={!!usernameError}>
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              <span style={{ fontSize: "12px", color: "#555", padding: "8px 10px", background: "#0d0b08", border: "1px solid #2a2418", borderRight: "none", borderRadius: "6px 0 0 6px" }}>@</span>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); validateUsername(e.target.value); }}
                placeholder="yourname"
                maxLength={30}
                style={{ ...inputStyle, borderRadius: "0 6px 6px 0", borderLeft: "none" }}
              />
            </div>
          </Field>

          {/* Bio */}
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell listeners a little about yourself..."
              maxLength={200}
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: "1.5" }}
            />
            <span style={{ fontSize: "10px", color: "#444", textAlign: "right", display: "block", marginTop: "4px" }}>{bio.length}/200</span>
          </Field>

          {error && (
            <div style={{ background: "rgba(180,60,60,0.15)", border: "1px solid #4a2020", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#e88" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "11px", background: "transparent",
              border: "1px solid #2a2418", borderRadius: "8px",
              color: "#666", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || uploading || !!usernameError} style={{
              flex: 2, padding: "11px",
              background: (saving || uploading || usernameError) ? "#2a2418" : "linear-gradient(135deg, #c9a96e, #a07840)",
              border: "none", borderRadius: "8px",
              color: (saving || uploading || usernameError) ? "#555" : "#0d0b08",
              fontSize: "12px", fontWeight: "bold", letterSpacing: "0.1em",
              cursor: (saving || uploading || usernameError) ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}>
              {saving ? "Saving..." : uploading ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, note, noteError, children }) {
  return (
    <div>
      <label style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>{label.toUpperCase()}</label>
      {children}
      {note && <p style={{ fontSize: "10px", color: noteError ? "#e88" : "#555", marginTop: "4px" }}>{note}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#1a1710", border: "1px solid #2a2418",
  color: "#e8dcc8", borderRadius: "6px", padding: "9px 12px",
  fontSize: "13px", fontFamily: "Georgia, serif", outline: "none",
};
