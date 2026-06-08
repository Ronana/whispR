'use client';
import { useState } from "react";
import { PLAN, initiateCheckout } from "../../lib/payments";

export default function PremiumModal({ user, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { url } = await initiateCheckout({ userId: user.id, userEmail: user.email });
      window.location.href = url;
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 400,
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(480px, 92vw)",
        background: "#100e0a",
        border: "1px solid #2a2418",
        borderRadius: "16px",
        zIndex: 401,
        overflow: "hidden",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}>
        {/* Gold gradient header */}
        <div style={{
          background: "linear-gradient(135deg, #c9a96e22, #8c603010)",
          borderBottom: "1px solid #2a2418",
          padding: "28px 28px 24px",
          textAlign: "center",
          position: "relative",
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: "14px", right: "16px",
            background: "none", border: "none", color: "#555",
            cursor: "pointer", fontSize: "18px",
          }}>✕</button>

          {/* Crown icon */}
          <div style={{
            width: "52px", height: "52px", margin: "0 auto 14px",
            background: "linear-gradient(135deg, #c9a96e, #8c6030)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
            boxShadow: "0 0 24px rgba(201,169,110,0.4)",
          }}>♛</div>

          <h2 style={{ fontSize: "22px", fontWeight: "normal", color: "#e8dcc8", marginBottom: "6px" }}>
            {PLAN.name}
          </h2>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
            <span style={{ fontSize: "32px", color: "#c9a96e" }}>{PLAN.price}</span>
            <span style={{ fontSize: "13px", color: "#888" }}>/ {PLAN.period}</span>
          </div>
          <p style={{ fontSize: "11px", color: "#555", marginTop: "6px", letterSpacing: "0.1em" }}>
            Cancel any time
          </p>
        </div>

        {/* Perks list */}
        <div style={{ padding: "24px 28px" }}>
          <p style={{ fontSize: "10px", color: "#666", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "14px" }}>
            Everything included
          </p>
          {PLAN.perks.map((perk, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 0",
              borderBottom: i < PLAN.perks.length - 1 ? "1px solid #1a1710" : "none",
            }}>
              <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>{perk.icon}</span>
              <span style={{ fontSize: "13px", color: "#e8dcc8" }}>{perk.label}</span>
              <span style={{ marginLeft: "auto", color: "#c9a96e", fontSize: "14px" }}>✓</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "0 28px 28px" }}>
          {error && (
            <div style={{
              background: "rgba(180,60,60,0.15)", border: "1px solid #4a2020",
              borderRadius: "8px", padding: "10px 14px",
              fontSize: "12px", color: "#e88", marginBottom: "14px",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: loading
                ? "#2a2418"
                : "linear-gradient(135deg, #c9a96e, #a07840)",
              border: "none", borderRadius: "10px",
              color: loading ? "#555" : "#0d0b08",
              fontSize: "13px", fontWeight: "bold",
              letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Redirecting..." : "Upgrade to Premium"}
          </button>

          <p style={{
            fontSize: "10px", color: "#444", textAlign: "center",
            marginTop: "12px", lineHeight: "1.5",
          }}>
            By subscribing you confirm you are 18 or older and agree to our Terms of Service.
            Payment processed securely.
          </p>
        </div>
      </div>
    </>
  );
}
