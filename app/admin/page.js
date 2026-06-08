"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase";
import { SkeletonStatCard, FadeIn } from "../../components/Skeleton";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const now = new Date();
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: totalUsers },
        { count: totalTracks },
        { count: totalSubs },
        { count: pendingApps },
        { count: newUsers },
        { data: playsData },
        { count: pendingReports },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("tracks").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("creator_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("tracks").select("plays"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const totalPlays = playsData?.reduce((sum, t) => sum + (Number(t.plays) || 0), 0) || 0;
      setStats({ totalUsers, totalTracks, totalSubs, pendingApps, newUsers, totalPlays, pendingReports });
    })();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: "400", marginBottom: "6px" }}>Dashboard</h1>
      <p style={{ fontSize: "12px", color: "#555", marginBottom: "28px" }}>Platform overview</p>

      {!stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
          {Array.from({ length: 7 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <FadeIn>
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px", marginBottom: "32px" }}>
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Active Subs" value={stats.totalSubs} accent />
            <StatCard label="Total Tracks" value={stats.totalTracks} />
            <StatCard label="Total Plays" value={stats.totalPlays?.toLocaleString()} />
            <StatCard label="New This Week" value={stats.newUsers} />
            <StatCard label="Pending Apps" value={stats.pendingApps} warn={stats.pendingApps > 0} href="/admin/applications" />
            <StatCard label="Open Reports" value={stats.pendingReports} warn={stats.pendingReports > 0} href="/admin/content" />
          </div>

          <div style={{ background: "#0d0b08", border: "1px solid #1a1710", borderRadius: "12px", padding: "20px 24px" }}>
            <p style={{ fontSize: "11px", color: "#555", letterSpacing: "0.1em", marginBottom: "14px" }}>QUICK ACTIONS</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <QuickLink href="/admin/applications" label="Review Applications" count={stats.pendingApps} />
              <QuickLink href="/admin/content" label="Moderation Queue" count={stats.pendingReports} />
              <QuickLink href="/admin/users" label="Manage Users" />
            </div>
          </div>
        </>
        </FadeIn>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, warn, href }) {
  const content = (
    <div style={{
      background: "#0d0b08", border: `1px solid ${warn ? "#8c3030" : accent ? "#2a2418" : "#1a1710"}`,
      borderRadius: "10px", padding: "16px 18px", cursor: href ? "pointer" : "default",
      transition: "border-color 0.2s",
    }}>
      <p style={{ fontSize: "11px", color: warn ? "#c95050" : accent ? "#c9a96e" : "#555", letterSpacing: "0.08em", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontSize: "28px", color: warn ? "#e87070" : accent ? "#c9a96e" : "#e8dcc8", fontWeight: "300" }}>{value ?? "—"}</p>
    </div>
  );
  return href ? <a href={href} style={{ textDecoration: "none" }}>{content}</a> : content;
}

function QuickLink({ href, label, count }) {
  return (
    <a href={href} style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      padding: "8px 14px", borderRadius: "8px",
      background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.15)",
      color: "#c9a96e", fontSize: "12px", textDecoration: "none",
    }}>
      {label}
      {count > 0 && <span style={{ background: "#c9a96e", color: "#0d0b08", borderRadius: "999px", fontSize: "10px", padding: "1px 6px", fontWeight: "700" }}>{count}</span>}
    </a>
  );
}
