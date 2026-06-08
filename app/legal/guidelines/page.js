export default function GuidelinesPage() {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.15em", marginBottom: "10px" }}>LEGAL</p>
      <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "6px" }}>User Guidelines</h1>
      <p style={{ color: "#555", fontSize: "12px", marginBottom: "36px" }}>WhispR Ltd · Last updated: June 2026</p>

      <Section title="Who WhispR is For">
        <p>WhispR is an adult audio platform for users aged 18 and over. All content on the platform is intended for consenting adults. By using WhispR you confirm you meet this age requirement.</p>
      </Section>

      <Section title="Permitted Content">
        <p>Creators may upload original adult audio content including erotic fiction, guided intimacy, ASMR, and similar genres, provided:</p>
        <ul>
          <li>All depicted or implied participants are adults aged 18 or over.</li>
          <li>Content is fictional or involves consenting participants.</li>
          <li>You own or have the right to distribute the content.</li>
          <li>Content does not depict real, identifiable individuals without their documented consent.</li>
        </ul>
      </Section>

      <Section title="Prohibited Content">
        <p>The following are strictly prohibited and will result in immediate content removal and account termination, and may be reported to law enforcement:</p>
        <ul>
          <li><strong style={{ color: "#e8654a" }}>Child sexual abuse material (CSAM)</strong> — any content that sexualises individuals under 18, including fictional or age-ambiguous portrayals.</li>
          <li><strong style={{ color: "#e8654a" }}>Non-consensual scenarios</strong> — content that glorifies or encourages real-world sexual violence or coercion.</li>
          <li><strong style={{ color: "#e8654a" }}>Real persons without consent</strong> — audio purporting to feature identifiable real individuals in sexual contexts without their express, documented consent.</li>
          <li><strong style={{ color: "#e8654a" }}>Harassment</strong> — content targeting or doxing specific individuals.</li>
          <li><strong style={{ color: "#e8654a" }}>Illegal content</strong> — anything prohibited under the laws of England and Wales or the user's jurisdiction.</li>
        </ul>
      </Section>

      <Section title="Listener Behaviour">
        <p>Listeners must not attempt to record, redistribute, or commercially exploit platform content. Sharing account credentials is prohibited. Use the platform's like and history features; do not attempt to scrape or bulk download content.</p>
      </Section>

      <Section title="Reporting">
        <p>If you encounter content you believe violates these Guidelines, use the in-platform report function or email <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a>. We investigate all reports promptly.</p>
      </Section>

      <Section title="Enforcement">
        <p>Violations may result in content removal, account suspension, or permanent ban, at WhispR's sole discretion. We cooperate fully with law enforcement where required, including under the Online Safety Act 2023.</p>
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
