export default function TermsPage() {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.15em", marginBottom: "10px" }}>LEGAL</p>
      <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "6px" }}>Terms & Conditions</h1>
      <p style={{ color: "#555", fontSize: "12px", marginBottom: "36px" }}>WhispR Ltd · Last updated: June 2026 · Effective: June 2026</p>

      <Section title="1. About WhispR">
        <p>WhispR is an adult audio streaming platform operated by <strong>WhispR Ltd</strong>, a company registered in England and Wales. Our registered address and contact details are available on request at <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a>.</p>
        <p>WhispR is strictly an <strong>18+ platform</strong>. By accessing the platform you represent that you are at least 18 years of age.</p>
      </Section>

      <Section title="2. Acceptance of Terms">
        <p>By creating an account or accessing whispraudio.com you agree to these Terms in full. If you do not agree, you must not use the platform. We may update these Terms at any time; continued use after notification of changes constitutes acceptance.</p>
      </Section>

      <Section title="3. Accounts">
        <p>You must provide accurate information when registering. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorised access at <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a>.</p>
        <p>You may not create multiple accounts to circumvent suspensions or bans. WhispR reserves the right to suspend or terminate accounts that violate these Terms.</p>
      </Section>

      <Section title="4. Subscriptions & Payments">
        <p>Premium access is available via a monthly subscription. Prices are displayed on the upgrade screen and are inclusive of VAT where applicable. Subscriptions auto-renew monthly unless cancelled before the renewal date.</p>
        <p>Refunds are issued at our discretion. To request a refund, contact <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a> within 14 days of charge. Refunds are not available once substantial use of premium content has occurred in the billing period.</p>
      </Section>

      <Section title="5. Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>Access the platform if you are under 18 years of age.</li>
          <li>Share your account credentials with any third party.</li>
          <li>Reproduce, redistribute, or resell any content from WhispR without written permission.</li>
          <li>Upload content you do not own or have rights to distribute.</li>
          <li>Upload or request content involving minors, non-consensual scenarios, or real identifiable individuals without their consent.</li>
          <li>Use automated tools to scrape, download, or reproduce platform content.</li>
          <li>Attempt to circumvent age verification or premium access controls.</li>
          <li>Engage in harassment, abuse, or threatening behaviour toward other users or creators.</li>
        </ul>
      </Section>

      <Section title="6. Creator Content">
        <p>Creators who upload content to WhispR retain copyright in their original works but grant WhispR a non-exclusive, worldwide, royalty-free licence to host, stream, and promote that content on the platform. Creators are bound by the additional <a href="/legal/creator-agreement">Creator Agreement</a>.</p>
        <p>WhispR may remove content at any time that violates our <a href="/legal/guidelines">User Guidelines</a> or applicable law.</p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>The WhispR name, logo, platform design, and all proprietary software are owned by WhispR Ltd. You may not use them without prior written consent. See our <a href="/legal/copyright">Copyright Policy</a> for takedown procedures.</p>
      </Section>

      <Section title="8. Disclaimers & Limitation of Liability">
        <p>The platform is provided "as is." WhispR does not warrant uninterrupted availability. To the fullest extent permitted by English law, WhispR Ltd's aggregate liability for any claim is limited to the total subscription fees paid by you in the 12 months preceding the claim.</p>
        <p>Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.</p>
      </Section>

      <Section title="9. Governing Law">
        <p>These Terms are governed by the laws of England and Wales. Any dispute shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
      </Section>

      <Section title="10. Contact">
        <p>Questions about these Terms: <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a></p>
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
