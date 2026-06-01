'use client';
import { useState, useEffect } from "react";

export default function AgeGate({ onConfirm }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const confirmed = localStorage.getItem("whispr_age_confirmed");
    if (!confirmed) {
      setVisible(true);
    } else {
      onConfirm();
    }
  }, [onConfirm]);

  const handleConfirm = () => {
    localStorage.setItem("whispr_age_confirmed", "true");
    setVisible(false);
    onConfirm();
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#0a0806",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      <style>{`
        .age-gate-confirm:hover {
          background: linear-gradient(135deg, #d4a87a, #b08040) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 30px rgba(201,150,106,0.4) !important;
        }
        .age-gate-decline:hover {
          border-color: #555 !important;
          color: #888 !important;
        }
      `}</style>

      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(201,150,106,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        textAlign: "center",
        maxWidth: "420px",
        padding: "0 24px",
      }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, #c9966a, #8c6030)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "22px",
            boxShadow: "0 0 40px rgba(201,150,106,0.25)",
          }}>〜</div>
          <div style={{ fontSize: "28px", color: "#f0e6d0", letterSpacing: "0.05em" }}>
            Whisp<span style={{ color: "#c9966a", fontWeight: "bold" }}>R</span>
          </div>
        </div>

        <div style={{
          width: "40px", height: "1px",
          background: "linear-gradient(90deg, transparent, #c9966a, transparent)",
          margin: "0 auto 36px",
        }} />

        <h1 style={{
          fontSize: "20px", fontWeight: "normal",
          color: "#f0e6d0", letterSpacing: "0.04em",
          marginBottom: "14px", lineHeight: "1.5",
        }}>
          This content is for<br />
          <span style={{ color: "#c9966a", fontStyle: "italic" }}>adults only.</span>
        </h1>
        <p style={{
          fontSize: "13px", color: "#888",
          lineHeight: "1.7", marginBottom: "44px",
          letterSpacing: "0.02em",
        }}>
          WhispR is an adult audio platform. By continuing,
          you confirm you are 18 years of age or older.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <button
            className="age-gate-confirm"
            onClick={handleConfirm}
            style={{
              width: "100%",
              padding: "14px 32px",
              background: "linear-gradient(135deg, #c9966a, #a07840)",
              border: "none", borderRadius: "4px",
              color: "#0a0806", fontSize: "12px",
              letterSpacing: "0.15em", fontWeight: "bold",
              fontFamily: "Georgia, 'Times New Roman', serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 20px rgba(201,150,106,0.25)",
            }}
          >
            I AM 18 OR OLDER — ENTER
          </button>
          <button
            className="age-gate-decline"
            onClick={() => window.location.href = "https://www.google.com"}
            style={{
              background: "none",
              border: "1px solid #2a2418",
              borderRadius: "4px",
              padding: "10px 32px",
              color: "#555", fontSize: "11px",
              letterSpacing: "0.12em",
              fontFamily: "Georgia, 'Times New Roman', serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            EXIT
          </button>
        </div>

        <p style={{
          marginTop: "36px", fontSize: "10px",
          color: "#444", letterSpacing: "0.08em",
          lineHeight: "1.6",
        }}>
          BY ENTERING YOU AGREE TO OUR TERMS OF SERVICE.<br />
          YOUR CHOICE WILL BE REMEMBERED ON THIS DEVICE.
        </p>
      </div>
    </div>
  );
}
