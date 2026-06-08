'use client';
import { useState, useRef, useEffect } from "react";
import { createClient } from "../../lib/supabase";

const CATEGORIES = ["Romance", "Slow Burn", "Intense", "Narrative", "ASMR", "Couples"];

export default function CreatorDashboard({ user, profile }) {
  const [myTracks, setMyTracks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Romance");
  const [audioFile, setAudioFile] = useState(null);
  const [audioDuration, setAudioDuration] = useState(null);

  const fileRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("tracks")
      .select("*")
      .eq("creator", profile?.display_name || user.email)
      .order("id", { ascending: false })
      .then(({ data }) => { if (data) setMyTracks(data); });
  }, [user, profile]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) { setError("Please select an audio file."); return; }
    if (file.size > 200 * 1024 * 1024) { setError("File must be under 200MB."); return; }
    setAudioFile(file);
    setError(null);

    // Read duration
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      const m = Math.floor(audio.duration / 60);
      const s = Math.floor(audio.duration % 60);
      setAudioDuration(`${m}:${String(s).padStart(2, "0")}`);
      URL.revokeObjectURL(url);
    });
  };

  const handleUpload = async () => {
    if (!title.trim() || !audioFile) { setError("Title and audio file are required."); return; }
    setUploading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const ext = audioFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(path, audioFile, { upsert: false });

    if (uploadError) { setError(uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("audio").getPublicUrl(path);

    // Insert track record
    const { data: track, error: insertError } = await supabase.from("tracks").insert({
      title: title.trim(),
      creator: profile?.display_name || user.email,
      category,
      duration: audioDuration || "?:??",
      audio_url: urlData.publicUrl,
      plays: 0,
      is_new: true,
      is_premium: false,
    }).select().single();

    if (insertError) { setError(insertError.message); setUploading(false); return; }

    setMyTracks(t => [track, ...t]);
    setTitle(""); setCategory("Romance"); setAudioFile(null); setAudioDuration(null);
    setShowUploadForm(false);
    setSuccess("Track uploaded successfully!");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.12em", marginBottom: "2px" }}>CREATOR DASHBOARD</p>
          <p style={{ fontSize: "12px", color: "#666" }}>{myTracks.length} track{myTracks.length !== 1 ? "s" : ""} published</p>
        </div>
        <button
          onClick={() => { setShowUploadForm(!showUploadForm); setError(null); setSuccess(null); }}
          style={{
            padding: "8px 16px",
            background: showUploadForm ? "transparent" : "linear-gradient(135deg, #c9a96e, #a07840)",
            border: showUploadForm ? "1px solid #2a2418" : "none",
            borderRadius: "8px", color: showUploadForm ? "#666" : "#0d0b08",
            fontSize: "11px", fontWeight: "bold", letterSpacing: "0.1em",
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {showUploadForm ? "Cancel" : "+ Upload Track"}
        </button>
      </div>

      {/* Upload form */}
      {showUploadForm && (
        <div style={{
          background: "rgba(201,169,110,0.04)", border: "1px solid #2a2418",
          borderRadius: "10px", padding: "18px", marginBottom: "20px",
          display: "flex", flexDirection: "column", gap: "14px",
        }}>
          <div>
            <label style={labelStyle}>TRACK TITLE</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your track a name"
              maxLength={100}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>AUDIO FILE</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #2a2418", borderRadius: "8px",
                padding: "20px", textAlign: "center", cursor: "pointer",
                background: audioFile ? "rgba(201,169,110,0.06)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              {audioFile ? (
                <div>
                  <p style={{ fontSize: "13px", color: "#c9a96e" }}>🎵 {audioFile.name}</p>
                  {audioDuration && <p style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>Duration: {audioDuration}</p>}
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "24px", marginBottom: "8px" }}>🎙️</p>
                  <p style={{ fontSize: "12px", color: "#888" }}>Click to select audio file</p>
                  <p style={{ fontSize: "10px", color: "#555", marginTop: "4px" }}>MP3, WAV, M4A · Max 200MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="audio/*" onChange={handleFileSelect} style={{ display: "none" }} />
          </div>

          {error && <div style={{ fontSize: "12px", color: "#e88", padding: "8px 12px", background: "rgba(180,60,60,0.1)", borderRadius: "6px" }}>{error}</div>}
          {success && <div style={{ fontSize: "12px", color: "#8c6", padding: "8px 12px", background: "rgba(60,180,60,0.1)", borderRadius: "6px" }}>{success}</div>}

          <button
            onClick={handleUpload}
            disabled={uploading || !title.trim() || !audioFile}
            style={{
              padding: "11px",
              background: (uploading || !title.trim() || !audioFile) ? "#2a2418" : "linear-gradient(135deg, #c9a96e, #a07840)",
              border: "none", borderRadius: "8px",
              color: (uploading || !title.trim() || !audioFile) ? "#555" : "#0d0b08",
              fontSize: "12px", fontWeight: "bold", letterSpacing: "0.1em",
              cursor: (uploading || !title.trim() || !audioFile) ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {uploading ? "Uploading..." : "Publish Track"}
          </button>
        </div>
      )}

      {success && !showUploadForm && (
        <div style={{ fontSize: "12px", color: "#8c6", padding: "10px 14px", background: "rgba(60,180,60,0.08)", borderRadius: "8px", marginBottom: "16px" }}>
          ✓ {success}
        </div>
      )}

      {/* Track list */}
      {myTracks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: "#444", fontSize: "12px", fontStyle: "italic" }}>
          No tracks yet. Upload your first track above.
        </div>
      ) : myTracks.map(track => (
        <div key={track.id} style={{
          padding: "12px 0", borderBottom: "1px solid #1a1710",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <p style={{ fontSize: "13px", color: "#e8dcc8" }}>{track.title}</p>
              {track.is_new && <span style={{ fontSize: "9px", padding: "1px 6px", background: "rgba(201,169,110,0.2)", borderRadius: "10px", color: "#c9a96e" }}>NEW</span>}
            </div>
            <p style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{track.category} · {track.duration}</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: "12px", color: "#c9a96e" }}>{(track.plays || 0).toLocaleString()}</p>
            <p style={{ fontSize: "10px", color: "#555" }}>plays</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const labelStyle = { fontSize: "10px", color: "#c9a96e", letterSpacing: "0.12em", display: "block", marginBottom: "6px" };
const inputStyle = {
  width: "100%", background: "#1a1710", border: "1px solid #2a2418",
  color: "#e8dcc8", borderRadius: "6px", padding: "9px 12px",
  fontSize: "13px", fontFamily: "Georgia, serif", outline: "none",
};
