export default function CreatorAgreementPage() {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.15em", marginBottom: "10px" }}>LEGAL</p>
      <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "6px" }}>Creator Agreement</h1>
      <p style={{ color: "#555", fontSize: "12px", marginBottom: "36px" }}>WhispR Ltd · Last updated: June 2026 · Applies to all approved WhispR creators</p>

      <Section title="1. Who This Applies To">
        <p>This Creator Agreement applies to any user whose WhispR creator application has been approved by WhispR Ltd ("we"). It supplements the <a href="/legal/terms">Terms & Conditions</a> and <a href="/legal/guidelines">User Guidelines</a>, which also apply in full. In the event of conflict, this Agreement takes precedence for creators.</p>
      </Section>

      <Section title="2. Eligibility">
        <p>To become a creator you must be aged 18 or over, have the legal right to publish adult audio content in your jurisdiction, and have submitted an application approved by WhispR. We reserve the right to revoke creator status at any time if eligibility criteria are no longer met.</p>
      </Section>

      <Section title="3. Content Standards">
        <p>As a creator you warrant that:</p>
        <ul>
          <li>All uploaded content is your original work or you hold the rights to distribute it.</li>
          <li>No content depicts, implies, or references individuals under 18 in a sexual context.</li>
          <li>Any real persons featured have provided documented, explicit, informed consent.</li>
          <li>You will retain consent records and provide them to WhispR on request.</li>
          <li>Content does not violate the laws of England and Wales or any applicable jurisdiction.</li>
          <li>You will not use AI-generated audio purporting to be a real, identifiable person without their consent.</li>
        </ul>
      </Section>

      <Section title="4. Licence Grant">
        <p>By uploading content you grant WhispR Ltd a non-exclusive, worldwide, royalty-free licence to host, stream, transcode, cache, and promote your content on the platform and in marketing materials. You retain copyright. This licence terminates on removal of the content, subject to Section 5.</p>
      </Section>

      <Section title="5. Removal & Termination">
        <p>You may delete your own content at any time. WhispR may remove content that violates this Agreement or applicable law without notice. Cached copies will be deleted within 30 days of removal. Creators who repeatedly violate content standards will have their creator status revoked permanently.</p>
      </Section>

      <Section title="6. Revenue Sharing (Future)">
        <p>WhispR does not currently offer a paid revenue-sharing programme. When such a programme is introduced, creators who are enrolled will receive updated terms covering payment schedules, minimum thresholds, and tax obligations. By continuing to use the platform, creators acknowledge this future possibility and agree to opt-in to any revenue programme separately.</p>
      </Section>

      <Section title="7. Representations & Warranties">
        <p>You represent that: you have the legal capacity to enter into this agreement; you are not subject to any court order or contractual restriction that would prevent you from uploading the content; and the information in your creator application was truthful and accurate.</p>
      </Section>

      <Section title="8. Indemnity">
        <p>You agree to indemnify and hold harmless WhispR Ltd, its officers, and employees from any claims, damages, or expenses (including legal fees) arising from: your content, your breach of this Agreement, or your infringement of any third-party right.</p>
      </Section>

      <Section title="9. Contact">
        <p>Creator-related queries: <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a></p>
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
