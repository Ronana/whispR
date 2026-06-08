export default function PrivacyPage() {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.15em", marginBottom: "10px" }}>LEGAL</p>
      <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "6px" }}>Privacy Policy</h1>
      <p style={{ color: "#555", fontSize: "12px", marginBottom: "36px" }}>WhispR Ltd · Last updated: June 2026 · UK GDPR compliant</p>

      <Section title="1. Who We Are">
        <p>WhispR Ltd ("we", "us", "our") is the data controller for personal data collected through whispraudio.com. Contact us at <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a> for any privacy-related queries.</p>
      </Section>

      <Section title="2. Data We Collect">
        <p><strong style={{ color: "#e8dcc8" }}>Account data:</strong> Email address, username, display name, bio, and profile photo — provided by you on registration or profile edit.</p>
        <p><strong style={{ color: "#e8dcc8" }}>Usage data:</strong> Tracks played, likes, listening history, search queries, and session timestamps — collected automatically to power recommendations and history features.</p>
        <p><strong style={{ color: "#e8dcc8" }}>Payment data:</strong> Subscription status and billing period — we do not store card numbers. Payment processing is handled by our payment processor; their privacy policy applies to card data.</p>
        <p><strong style={{ color: "#e8dcc8" }}>Technical data:</strong> IP address, browser type, device type, and referral URL — collected via server logs and analytics.</p>
        <p><strong style={{ color: "#e8dcc8" }}>Communications:</strong> Any messages you send to legal@whispraudio.com or our support team.</p>
      </Section>

      <Section title="3. Legal Basis for Processing">
        <p><strong style={{ color: "#e8dcc8" }}>Contract performance:</strong> We process your account and payment data to deliver the WhispR service you signed up for (UK GDPR Art. 6(1)(b)).</p>
        <p><strong style={{ color: "#e8dcc8" }}>Legitimate interests:</strong> We process usage data to improve the platform, detect abuse, and secure our systems (Art. 6(1)(f)).</p>
        <p><strong style={{ color: "#e8dcc8" }}>Legal obligation:</strong> We retain certain records to comply with UK tax and regulatory requirements (Art. 6(1)(c)).</p>
        <p><strong style={{ color: "#e8dcc8" }}>Consent:</strong> Non-essential cookies and marketing communications are processed only with your explicit consent (Art. 6(1)(a)), which you may withdraw at any time.</p>
      </Section>

      <Section title="4. How We Use Your Data">
        <ul>
          <li>To create and manage your account.</li>
          <li>To stream audio content and personalise your experience.</li>
          <li>To process subscription payments and manage billing.</li>
          <li>To detect and prevent fraud, abuse, and policy violations.</li>
          <li>To send transactional emails (account confirmations, payment receipts).</li>
          <li>To comply with legal obligations including age verification requirements under the Online Safety Act 2023.</li>
        </ul>
      </Section>

      <Section title="5. Data Sharing">
        <p>We do not sell your personal data. We share data only with:</p>
        <ul>
          <li><strong style={{ color: "#e8dcc8" }}>Supabase Inc.</strong> — database and authentication infrastructure (data processed in EU under Standard Contractual Clauses).</li>
          <li><strong style={{ color: "#e8dcc8" }}>Payment processor</strong> — billing data only, subject to their privacy policy.</li>
          <li><strong style={{ color: "#e8dcc8" }}>Law enforcement</strong> — if required by a valid legal order.</li>
        </ul>
      </Section>

      <Section title="6. Retention">
        <p>We retain account data for as long as your account is active plus 6 years for tax and legal compliance. Listening history is retained for 24 months. You may request earlier deletion (see rights below).</p>
      </Section>

      <Section title="7. Your UK GDPR Rights">
        <p>You have the right to: <strong style={{ color: "#e8dcc8" }}>access</strong> your data · <strong style={{ color: "#e8dcc8" }}>rectify</strong> inaccuracies · <strong style={{ color: "#e8dcc8" }}>erase</strong> your data (right to be forgotten) · <strong style={{ color: "#e8dcc8" }}>restrict</strong> processing · <strong style={{ color: "#e8dcc8" }}>port</strong> your data to another service · <strong style={{ color: "#e8dcc8" }}>object</strong> to processing based on legitimate interests.</p>
        <p>To exercise any right, email <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a>. We will respond within one calendar month. You also have the right to lodge a complaint with the <a href="https://ico.org.uk" target="_blank" rel="noopener">ICO (Information Commissioner's Office)</a>.</p>
      </Section>

      <Section title="8. Cookies">
        <p>See our <a href="/legal/cookies">Cookie Policy</a> for full details on how we use cookies and how to manage your preferences.</p>
      </Section>

      <Section title="9. Security">
        <p>We implement industry-standard security measures including encrypted data transmission (TLS), row-level access controls on our database, and regular security reviews. No system is 100% secure; please use a strong unique password.</p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>We will notify you by email or in-app notice if we make material changes. The "last updated" date at the top of this page reflects the most recent revision.</p>
      </Section>
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
