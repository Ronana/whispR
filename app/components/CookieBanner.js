"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("whispr_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept(all) {
    const val = all ? "full" : "essential";
    localStorage.setItem("whispr_cookie_consent", val);
    setVisible(false);
    if (all && analytics) {
      // Load analytics script here when integrated
    }
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
      width: "min(480px, calc(100vw - 32px))",
      background: "#1a1710", border: "1px solid #2e2820",
      borderRadius: "14px", padding: "20px 22px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      zIndex: 9999, fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <p style={{ fontSize: "13px", color: "#e8dcc8", fontWeight: "600" }}>🍪 Cookie Preferences</p>
        <a href="/legal/cookies" style={{ fontSize: "10px", color: "#555" }}>Learn more</a>
      </div>
      <p style={{ fontSize: "11px", color: "#777", marginBottom: "14px", lineHeight: "1.6" }}>
        We use essential cookies to keep you signed in, plus optional analytics cookies to improve the platform. You can customise your choice below.
      </p>

      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={analytics}
          onChange={e => setAnalytics(e.target.checked)}
          style={{ accentColor: "#c9a96e", width: "14px", height: "14px" }}
        />
        <span style={{ fontSize: "11px", color: "#999" }}>Analytics cookies (Google Analytics — anonymised)</span>
      </label>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => accept(false)}
          style={{
            flex: 1, padding: "9px", borderRadius: "8px",
            background: "transparent", border: "1px solid #2e2820",
            color: "#888", fontSize: "12px", cursor: "pointer",
          }}
        >Essential only</button>
        <button
          onClick={() => accept(true)}
          style={{
            flex: 1, padding: "9px", borderRadius: "8px",
            background: "linear-gradient(135deg, #c9a96e, #8c6030)",
            border: "none", color: "#0d0b08", fontSize: "12px",
            fontWeight: "600", cursor: "pointer",
          }}
        >Accept {analytics ? "all" : "& continue"}</button>
      </div>
    </div>
  );
}
