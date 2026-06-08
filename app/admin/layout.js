"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "◈" },
  { href: "/admin/applications", label: "Applications", icon: "✦" },
  { href: "/admin/users", label: "Users", icon: "◉" },
  { href: "/admin/content", label: "Content", icon: "▣" },
];

export default function AdminLayout({ children }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/"); return; }
      const { data: profile } = await supabase
        .from("profiles").select("role").eq("user_id", user.id).single();
      if (profile?.role === "admin") {
        setAuthorized(true);
      } else {
        router.replace("/");
      }
      setChecking(false);
    })();
  }, []);

  if (checking) return (
    <div style={{ background: "#0a0806", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "system-ui, sans-serif", fontSize: "13px" }}>
      Verifying access…
    </div>
  );

  if (!authorized) return null;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#080604", color: "#e8dcc8", minHeight: "100vh", display: "flex" }}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } a { text-decoration: none; } button { font-family: inherit; cursor: pointer; }`}</style>

      {/* Sidebar */}
      <aside style={{ width: "200px", flexShrink: 0, background: "#0d0b08", borderRight: "1px solid #1a1710", padding: "24px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #1a1710" }}>
          <Link href="/" style={{ color: "#c9a96e", fontSize: "16px" }}>Whisp<strong>R</strong></Link>
          <p style={{ fontSize: "9px", color: "#444", letterSpacing: "0.15em", marginTop: "4px" }}>ADMIN</p>
        </div>
        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 10px", borderRadius: "8px", fontSize: "12px",
                background: active ? "rgba(201,169,110,0.1)" : "transparent",
                color: active ? "#c9a96e" : "#666",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: "14px" }}>{icon}</span>{label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1710" }}>
          <Link href="/" style={{ fontSize: "11px", color: "#444" }}>← Back to app</Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
