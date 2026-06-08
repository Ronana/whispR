"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";
import { Skeleton, FadeIn } from "../../../components/Skeleton";

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("creator_applications")
      .select("*, profiles!creator_applications_user_id_fkey(display_name, username, avatar_url)")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    setApps(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function decide(app, decision) {
    const supabase = createClient();
    await supabase.from("creator_applications").update({
      status: decision, reviewed_at: new Date().toISOString(),
    }).eq("id", app.id);
    if (decision === "approved") {
      await supabase.from("profiles").update({ role: "creator" }).eq("user_id", app.user_id);
    } else {
      await supabase.from("profiles").update({ role: "listener" }).eq("user_id", app.user_id);
    }
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: "400", marginBottom: "6px" }}>Creator Applications</h1>
      <p style={{ fontSize: "12px", color: "#555", marginBottom: "24px" }}>Review and decide on creator applications</p>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {["pending", "approved", "rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 14px", borderRadius: "999px", fontSize: "11px", border: "1px solid",
            borderColor: filter === s ? "#c9a96e" : "#1a1710",
            background: filter === s ? "rgba(201,169,110,0.1)" : "transparent",
            color: filter === s ? "#c9a96e" : "#555",
            letterSpacing: "0.08em", textTransform: "capitalize",
          }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: "#0d0b08", border: "1px solid #1a1710", borderRadius: "12px", padding: "20px 22px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <Skeleton width="32px" height="32px" radius="50%" />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Skeleton width="140px" height="12px" />
                  <Skeleton width="80px" height="10px" />
                </div>
              </div>
              <Skeleton width="100%" height="10px" />
              <Skeleton width="80%" height="10px" style={{ marginTop: "6px" }} />
            </div>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <p style={{ color: "#444", fontSize: "13px" }}>No {filter} applications.</p>
      ) : (
        <FadeIn><div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {apps.map(app => (
            <div key={app.id} style={{ background: "#0d0b08", border: "1px solid #1a1710", borderRadius: "12px", padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    {app.profiles?.avatar_url && (
                      <img src={app.profiles.avatar_url} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                    )}
                    <div>
                      <p style={{ fontSize: "14px", color: "#e8dcc8" }}>{app.profiles?.display_name || "Unknown"}</p>
                      <p style={{ fontSize: "11px", color: "#555" }}>@{app.profiles?.username || "—"} · {new Date(app.created_at).toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: "#999", lineHeight: "1.6", marginBottom: "8px" }}>{app.reason}</p>
                  {app.sample_links && (
                    <p style={{ fontSize: "11px", color: "#555" }}>
                      Links: {app.sample_links.split(/\s+/).map((l, i) => (
                        <a key={i} href={l} target="_blank" rel="noopener" style={{ color: "#c9a96e", marginRight: "8px" }}>{l}</a>
                      ))}
                    </p>
                  )}
                </div>
                {filter === "pending" && (
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button onClick={() => decide(app, "rejected")} style={{
                      padding: "7px 14px", borderRadius: "8px", fontSize: "12px",
                      background: "transparent", border: "1px solid #3a1a1a", color: "#c95050",
                    }}>Reject</button>
                    <button onClick={() => decide(app, "approved")} style={{
                      padding: "7px 14px", borderRadius: "8px", fontSize: "12px",
                      background: "linear-gradient(135deg, #c9a96e, #8c6030)", border: "none", color: "#0d0b08", fontWeight: "600",
                    }}>Approve</button>
                  </div>
                )}
                {filter !== "pending" && (
                  <span style={{ fontSize: "11px", color: filter === "approved" ? "#50c97a" : "#c95050", border: `1px solid ${filter === "approved" ? "#1a3a24" : "#3a1a1a"}`, padding: "4px 10px", borderRadius: "999px" }}>
                    {filter}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div></FadeIn>
      )}
    </div>
  );
}
