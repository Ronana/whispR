export default function CookiesPage() {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.15em", marginBottom: "10px" }}>LEGAL</p>
      <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "6px" }}>Cookie Policy</h1>
      <p style={{ color: "#555", fontSize: "12px", marginBottom: "36px" }}>WhispR Ltd · Last updated: June 2026 · UK PECR compliant</p>

      <Section title="1. What Are Cookies">
        <p>Cookies are small text files stored on your device when you visit a website. They allow us to recognise your browser and remember certain information about your session and preferences.</p>
      </Section>

      <Section title="2. Cookies We Use">
        <CookieTable rows={[
          ["sb-access-token", "Strictly Necessary", "Supabase", "Session", "Keeps you logged in. The platform cannot function without this."],
          ["sb-refresh-token", "Strictly Necessary", "Supabase", "Session", "Refreshes your authentication session automatically."],
          ["whispr_cookie_consent", "Strictly Necessary", "WhispR", "1 year", "Stores your cookie consent decision so we don't ask again."],
          ["whispr_lang", "Functional", "WhispR", "1 year", "Remembers your language preference."],
          ["whispr_age_confirmed", "Functional", "WhispR", "Session", "Records age gate acknowledgement for the current session."],
          ["_ga, _gid", "Analytics", "Google Analytics", "2 years / 24h", "Aggregate, anonymised traffic analytics. Only loaded with consent."],
        ]} />
      </Section>

      <Section title="3. Your Choices">
        <p>When you first visit WhispR you are shown a cookie consent banner. <strong style={{ color: "#e8dcc8" }}>Strictly necessary</strong> cookies cannot be declined as they are required for the platform to function. <strong style={{ color: "#e8dcc8" }}>Functional</strong> and <strong style={{ color: "#e8dcc8" }}>analytics</strong> cookies are only set if you accept them.</p>
        <p>You can change your preferences at any time via the <strong style={{ color: "#e8dcc8" }}>Cookie Settings</strong> button in your profile panel, or by clearing cookies in your browser settings. Note that clearing all cookies will sign you out.</p>
      </Section>

      <Section title="4. Third-Party Cookies">
        <p>We use Google Analytics (with IP anonymisation enabled) to understand aggregate platform usage. Google may set cookies on your device if you consent. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google's Privacy Policy</a> for details.</p>
      </Section>

      <Section title="5. UK PECR Compliance">
        <p>We comply with the UK Privacy and Electronic Communications Regulations 2003 (PECR). We do not place non-essential cookies without your prior informed consent. Our consent mechanism records your choice and timestamp.</p>
      </Section>

      <Section title="6. Contact">
        <p>Cookie questions: <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a></p>
      </Section>
    </div>
  );
}

function CookieTable({ rows }) {
  return (
    <div style={{ overflowX: "auto", marginTop: "8px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
        <thead>
          <tr>
            {["Name", "Category", "Set by", "Duration", "Purpose"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #2a2418", color: "#666", fontWeight: "500", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #1a1710" }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", color: j === 1 ? "#c9a96e" : "#999", fontFamily: j === 0 ? "monospace" : "inherit" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "16px", color: "#c9a96e", fontFamily: "system-ui, sans-serif", fontWeight: "600", marginBottom: "12px", letterSpacing: "0.02em" }}>{title}</h2>
      <div style={{ fontSize: "13px", color: "#bbb", display: "flex", flexDirection: "column", gap: "10px" }}>
        {children}
      </div>
    </div>
  );
}
