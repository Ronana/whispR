export default function CopyrightPage() {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.15em", marginBottom: "10px" }}>LEGAL</p>
      <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "6px" }}>Copyright Policy</h1>
      <p style={{ color: "#555", fontSize: "12px", marginBottom: "36px" }}>WhispR Ltd · Last updated: June 2026</p>

      <Section title="1. WhispR's Intellectual Property">
        <p>The WhispR name, logo, platform design, user interface, and proprietary software are owned by WhispR Ltd and protected by copyright, trade mark, and other intellectual property laws of England and Wales. You may not reproduce, modify, or distribute them without prior written consent.</p>
      </Section>

      <Section title="2. Creator Content">
        <p>Creators retain full copyright in their uploaded audio works. By uploading, creators grant WhispR Ltd a non-exclusive, worldwide, royalty-free licence to host, stream, transcode, and promote their content within the platform. This licence terminates when content is removed, subject to cached or backup copies being deleted within 30 days.</p>
      </Section>

      <Section title="3. Reporting Infringement">
        <p>If you believe content on WhispR infringes your copyright, submit a written notice to <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a> including:</p>
        <ul>
          <li>Your full name and contact information.</li>
          <li>A description of the copyrighted work you claim has been infringed.</li>
          <li>The URL or specific location of the allegedly infringing content.</li>
          <li>A statement that you have a good faith belief the use is not authorised.</li>
          <li>A statement that the information in your notice is accurate and, under penalty of perjury, that you are the copyright owner or authorised to act on their behalf.</li>
          <li>Your physical or electronic signature.</li>
        </ul>
        <p>We will respond within 5 business days and, where appropriate, remove or disable access to the content.</p>
      </Section>

      <Section title="4. Counter-Notice">
        <p>If you believe your content was removed in error, you may submit a counter-notice to <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a> with: your contact details, identification of the removed content, a statement under penalty of perjury that you have a good faith belief the content was removed in error, and your consent to the jurisdiction of English courts.</p>
      </Section>

      <Section title="5. Repeat Infringers">
        <p>WhispR will terminate the accounts of users who are found to be repeat infringers of third-party copyright.</p>
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
