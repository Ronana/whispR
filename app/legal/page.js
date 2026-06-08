import Link from "next/link";

const PAGES = [
  { href: "/legal/terms", label: "Terms & Conditions", desc: "Your agreement with WhispR — accounts, subscriptions, acceptable use." },
  { href: "/legal/privacy", label: "Privacy Policy", desc: "What personal data we collect, why we collect it, and your UK GDPR rights." },
  { href: "/legal/cookies", label: "Cookie Policy", desc: "How we use cookies and how to manage your preferences." },
  { href: "/legal/copyright", label: "Copyright Policy", desc: "How we handle intellectual property and DMCA-equivalent takedown requests." },
  { href: "/legal/guidelines", label: "User Guidelines", desc: "What is and isn't permitted on WhispR for listeners and creators." },
  { href: "/legal/age-verification", label: "Age Verification Policy", desc: "Our approach to confirming users are 18 or older." },
  { href: "/legal/creator-agreement", label: "Creator Agreement", desc: "Additional terms for approved creators who upload content." },
];

export default function LegalIndex() {
  return (
    <div>
      <p style={{ fontSize: "11px", color: "#c9a96e", letterSpacing: "0.15em", marginBottom: "10px" }}>LEGAL</p>
      <h1 style={{ fontSize: "28px", fontWeight: "normal", marginBottom: "10px" }}>Legal Documents</h1>
      <p style={{ color: "#777", fontSize: "14px", marginBottom: "36px" }}>
        WhispR Ltd is committed to transparency. All our policies are listed below.
        Last reviewed: {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {PAGES.map(p => (
          <Link key={p.href} href={p.href} style={{
            display: "block", padding: "18px 20px",
            border: "1px solid #1e1a14", borderRadius: "10px",
            color: "inherit", marginBottom: "8px", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#c9a96e44"; e.currentTarget.style.background = "rgba(201,169,110,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1a14"; e.currentTarget.style.background = "transparent"; }}
          >
            <p style={{ fontSize: "14px", color: "#e8dcc8", marginBottom: "4px" }}>{p.label} →</p>
            <p style={{ fontSize: "12px", color: "#666" }}>{p.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
