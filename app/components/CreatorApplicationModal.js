'use client';
import { useState } from "react";
import { createClient } from "../../lib/supabase";

export default function CreatorApplicationModal({ user, onClose, onSubmitted }) {
  const [reason, setReason] = useState("");
  const [sampleLinks, setSampleLinks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim() || reason.trim().length < 30) {
      setError("Please write at least 30 characters about yourself.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("creator_applications")
      .upsert({
        user_id: user.id,
        reason: reason.trim(),
        sample_links: sampleLinks.trim() || null,
        status: "pending",
      }, { onConflict: "user_id" });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // Update local profile role to pending_creator
    await supabase.from("profiles")
      .update({ role: "pending_creator", updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    setSubmitted(true);
    setSubmitting(false);
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <>
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)", zIndex: 500 }} />
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(420px, 94vw)",
          background: "#100e0a", border: "1px solid #2a2418",
          borderRadius: "16px", zIndex: 501, padding: "40px 32px",
          textAlign: "center", fontFamily: "Georgia, 'Times New Roman', serif",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉️</div>
          <h2 style={{ fontSize: "18px", fontWeight: "normal", color: "#c9a96e", marginBottom: "12px" }}>Application submitted</h2>
          <p style={{ fontSize: "13px", color: "#888", lineHeight: "1.7", marginBottom: "24px" }}>
            Thank you for applying. We review all applications personally and will get back to you within a few days.
          </p>
          <button onClick={onClose} style={{
            padding: "11px 32px",
            background: "linear-gradient(135deg, #c9a96e, #a07840)",
            border: "none", borderRadius: "8px",
            color: "#0d0b08", fontSize: "12px", fontWeight: "bold",
            letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit",
          }}>Done</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)", zIndex: 500 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(480px, 94vw)",
        background: "#100e0a", border: "1px solid #2a2418",
        borderRadius: "16px", zIndex: 501, overflow: "hidden",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #1e1a14" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "normal", color: "#c9a96e", marginBottom: "6px" }}>Become a Creator</h2>
              <p style={{ fontSize: "12px", color: "#666", lineHeight: "1.5" }}>
                Tell us about yourself. We review all applications personally.
              </p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "18px", marginLeft: "12px" }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* What makes you a great creator */}
          <div>
            <label style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.1em", display: "block", marginBottom: "8px" }}>
              ABOUT YOU & YOUR CONTENT *
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Tell us about the kind of content you create, your style, and why you'd like to be a WhispR creator. What makes your voice unique?"
              rows={5}
              maxLength={1000}
              style={{
                width: "100%", background: "#1a1710", border: "1px solid #2a2418",
                color: "#e8dcc8", borderRadius: "8px", padding: "12px",
                fontSize: "13px", fontFamily: "Georgia, serif",
                resize: "none", lineHeight: "1.6", outline: "none",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "10px", color: reason.length < 30 ? "#664" : "#555" }}>
                {reason.length < 30 ? `${30 - reason.length} more characters required` : ""}
              </span>
              <span style={{ fontSize: "10px", color: "#444" }}>{reason.length}/1000</span>
            </div>
          </div>

          {/* Sample links */}
          <div>
            <label style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.1em", display: "block", marginBottom: "8px" }}>
              SAMPLE LINKS <span style={{ color: "#555", fontSize: "10px" }}>(optional)</span>
            </label>
            <textarea
              value={sampleLinks}
              onChange={e => setSampleLinks(e.target.value)}
              placeholder="Links to existing work — SoundCloud, YouTube, personal site, etc. One per line."
              rows={3}
              style={{
                width: "100%", background: "#1a1710", border: "1px solid #2a2418",
                color: "#e8dcc8", borderRadius: "8px", padding: "12px",
                fontSize: "13px", fontFamily: "Georgia, serif",
                resize: "none", lineHeight: "1.6", outline: "none",
              }}
            />
          </div>

          {/* What happens next */}
          <div style={{
            background: "rgba(201,169,110,0.06)", border: "1px solid #2a2418",
            borderRadius: "8px", padding: "14px 16px",
          }}>
            <p style={{ fontSize: "11px", color: "#888", lineHeight: "1.7" }}>
              ✦ Applications are reviewed within 3–5 business days<br />
              ✦ You'll be notified by email when a decision is made<br />
              ✦ Approved creators can upload tracks and earn from their content
            </p>
          </div>

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
            <button onClick={handleSubmit} disabled={submitting || reason.trim().length < 30} style={{
              flex: 2, padding: "11px",
              background: (submitting || reason.trim().length < 30) ? "#2a2418" : "linear-gradient(135deg, #c9a96e, #a07840)",
              border: "none", borderRadius: "8px",
              color: (submitting || reason.trim().length < 30) ? "#555" : "#0d0b08",
              fontSize: "12px", fontWeight: "bold", letterSpacing: "0.1em",
              cursor: (submitting || reason.trim().length < 30) ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}>
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
