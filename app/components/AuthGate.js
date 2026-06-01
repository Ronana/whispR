'use client';
import { useState } from "react";
import { createClient } from "../../lib/supabase";

const supabase = createClient();

const REDIRECT_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback`
    : "https://www.whispraudio.com/auth/callback";

export default function AuthGate({ onAuth }) {
  const [mode, setMode] = useState("signin"); // signin | signup | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "error"|"success", text }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ type: "error", text: error.message });
      else onAuth();
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage({ type: "error", text: error.message });
      else setMessage({ type: "success", text: "Check your email to confirm your account." });
    } else {
      // magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: REDIRECT_URL },
      });
      if (error) setMessage({ type: "error", text: error.message });
      else setMessage({ type: "success", text: "Magic link sent — check your inbox." });
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: REDIRECT_URL },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      setLoading(false);
    }
    // on success: browser redirects away
  };

  const tabStyle = (active) => ({
    background: "none",
    border: "none",
    borderBottom: active ? "1px solid #c9966a" : "1px solid transparent",
    padding: "8px 0",
    color: active ? "#c9966a" : "#555",
    fontSize: "10px",
    letterSpacing: "0.15em",
    fontFamily: "Georgia, 'Times New Roman', serif",
    cursor: "pointer",
    transition: "all 0.2s",
  });

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid #2a2418",
    borderRadius: "4px",
    padding: "12px 14px",
    color: "#f0e6d0",
    fontSize: "13px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const primaryBtn = {
    width: "100%",
    padding: "13px",
    background: loading ? "rgba(201,150,106,0.4)" : "linear-gradient(135deg, #c9966a, #a07840)",
    border: "none",
    borderRadius: "4px",
    color: "#0a0806",
    fontSize: "11px",
    letterSpacing: "0.15em",
    fontWeight: "bold",
    fontFamily: "Georgia, 'Times New Roman', serif",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 20px rgba(201,150,106,0.2)",
  };

  const oauthBtn = (icon) => ({
    flex: 1,
    padding: "11px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #2a2418",
    borderRadius: "4px",
    color: "#aaa",
    fontSize: "12px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s",
    letterSpacing: "0.05em",
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "#0a0806",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, 'Times New Roman', serif",
    }}>
      <style>{`
        .auth-input:focus { border-color: #c9966a !important; }
        .auth-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(201,150,106,0.35) !important; }
        .auth-oauth:hover:not(:disabled) { border-color: #3a3020 !important; color: #c9966a !important; }
        .auth-link:hover { color: #c9966a !important; }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "700px", height: "700px",
        background: "radial-gradient(circle, rgba(201,150,106,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        width: "100%", maxWidth: "380px",
        padding: "0 24px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "44px", height: "44px",
            background: "linear-gradient(135deg, #c9966a, #8c6030)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            fontSize: "18px",
            boxShadow: "0 0 30px rgba(201,150,106,0.2)",
          }}>〜</div>
          <div style={{ fontSize: "22px", color: "#f0e6d0" }}>
            Whisp<span style={{ color: "#c9966a", fontWeight: "bold" }}>R</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "28px", borderBottom: "1px solid #1a1710" }}>
          <button style={tabStyle(mode === "signin")} onClick={() => { setMode("signin"); setMessage(null); }}>SIGN IN</button>
          <button style={tabStyle(mode === "signup")} onClick={() => { setMode("signup"); setMessage(null); }}>CREATE ACCOUNT</button>
          <button style={tabStyle(mode === "magic")} onClick={() => { setMode("magic"); setMessage(null); }}>MAGIC LINK</button>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          {mode !== "magic" && (
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          {message && (
            <p style={{
              fontSize: "12px",
              color: message.type === "error" ? "#c97a6a" : "#6ac9a9",
              letterSpacing: "0.03em",
              lineHeight: "1.5",
            }}>{message.text}</p>
          )}

          <button className="auth-primary" type="submit" disabled={loading} style={primaryBtn}>
            {loading ? "..." : mode === "signin" ? "SIGN IN" : mode === "signup" ? "CREATE ACCOUNT" : "SEND MAGIC LINK"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#1a1710" }} />
          <span style={{ fontSize: "10px", color: "#444", letterSpacing: "0.1em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "#1a1710" }} />
        </div>

        {/* OAuth buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="auth-oauth"
            onClick={() => handleOAuth("google")}
            disabled={loading}
            style={oauthBtn()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            className="auth-oauth"
            onClick={() => handleOAuth("apple")}
            disabled={loading}
            style={oauthBtn()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        <p style={{
          marginTop: "28px", textAlign: "center",
          fontSize: "10px", color: "#3a3020", letterSpacing: "0.08em",
        }}>
          BY SIGNING IN YOU AGREE TO OUR TERMS OF SERVICE
        </p>
      </div>
    </div>
  );
}
