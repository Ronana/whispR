import Link from "next/link";

const PAGES = [
  { href: "/legal/terms", label: "Terms & Conditions" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/cookies", label: "Cookie Policy" },
  { href: "/legal/copyright", label: "Copyright Policy" },
  { href: "/legal/guidelines", label: "User Guidelines" },
  { href: "/legal/age-verification", label: "Age Verification" },
  { href: "/legal/creator-agreement", label: "Creator Agreement" },
];

export default function LegalLayout({ children }) {
  return (
    <div style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      background: "#0d0b08", color: "#e8dcc8",
      minHeight: "100vh", display: "flex", flexDirection: "column",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { color: #c9a96e; text-decoration: none; }
        a:hover { text-decoration: underline; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a2418; border-radius: 2px; }
      `}</style>

      {/* Nav */}
      <div style={{ padding: "16px 28px", borderBottom: "1px solid #1e1a14", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#0d0b08", zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", color: "inherit" }}>
          <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #c9a96e, #8c6030)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>〜</div>
          <span style={{ fontSize: "18px" }}>Whisp<span style={{ color: "#c9a96e", fontWeight: "bold" }}>R</span></span>
        </Link>
        <Link href="/legal" style={{ fontSize: "11px", color: "#666", letterSpacing: "0.1em" }}>← LEGAL</Link>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: "220px", flexShrink: 0, borderRight: "1px solid #1e1a14", padding: "28px 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <p style={{ fontSize: "10px", color: "#555", letterSpacing: "0.15em", marginBottom: "12px" }}>LEGAL DOCUMENTS</p>
          {PAGES.map(p => (
            <Link key={p.href} href={p.href} style={{ fontSize: "12px", color: "#888", padding: "7px 10px", borderRadius: "6px", display: "block", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,169,110,0.08)"; e.currentTarget.style.color = "#c9a96e"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#888"; }}
            >{p.label}</Link>
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: "40px 48px", maxWidth: "760px", lineHeight: "1.8" }}>
          {children}
        </main>
      </div>

      <footer style={{ padding: "20px 28px", borderTop: "1px solid #1e1a14", fontSize: "11px", color: "#444", textAlign: "center" }}>
        © {new Date().getFullYear()} WhispR Ltd · All rights reserved · <Link href="/">whispraudio.com</Link>
      </footer>
    </div>
  );
}
