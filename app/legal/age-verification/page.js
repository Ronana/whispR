export default function AgeVerificationPage() {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.15em", marginBottom: "10px" }}>LEGAL</p>
      <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "6px" }}>Age Verification Policy</h1>
      <p style={{ color: "#555", fontSize: "12px", marginBottom: "36px" }}>WhispR Ltd · Last updated: June 2026 · Online Safety Act 2023 compliant</p>

      <Section title="1. Our Commitment">
        <p>WhispR is an adult-only platform. We are committed to preventing access by minors in compliance with the <strong style={{ color: "#e8dcc8" }}>Online Safety Act 2023</strong> and associated OFCOM guidance on age assurance for services sharing adult content.</p>
      </Section>

      <Section title="2. Current Age Gate">
        <p>Upon first visit, all users are presented with an age acknowledgement gate requiring confirmation that they are aged 18 or over. While this is a self-declaration mechanism, it forms the first layer of our age assurance approach and creates a clear contractual representation by the user.</p>
      </Section>

      <Section title="3. Account-Level Controls">
        <p>Registration requires a valid email address. We monitor for patterns indicative of underage access (e.g., account recovery requests referencing minors) and will suspend accounts where we have reasonable grounds to believe a user is under 18.</p>
      </Section>

      <Section title="4. Roadmap to Robust Age Verification">
        <p>In line with OFCOM's age assurance trajectory, WhispR intends to implement technically robust age verification before the OFCOM-mandated compliance deadline. This may include:</p>
        <ul>
          <li>Credit card or open banking verification (age inference).</li>
          <li>Mobile network operator age verification.</li>
          <li>Digital identity wallet verification.</li>
        </ul>
        <p>We will update this policy and notify users when enhanced age assurance is introduced.</p>
      </Section>

      <Section title="5. Reporting Underage Users">
        <p>If you have reason to believe a user of WhispR is under 18, please contact <a href="mailto:legal@whispraudio.com">legal@whispraudio.com</a> immediately. We treat all such reports as urgent.</p>
      </Section>

      <Section title="6. Creator Obligations">
        <p>Creators must confirm that all real individuals featured in or identifiable from their content are aged 18 or over, and must retain documentation supporting this. Failure to comply is grounds for immediate account termination and referral to the relevant authorities.</p>
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
