"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase";

export default function ContentPage() {
  const [tracks, setTracks] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("reports");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: trackData }, { data: reportData }] = await Promise.all([
      supabase.from("tracks").select("id, title, creator, category, plays, is_premium, audio_url").order("plays", { ascending: false }),
      supabase.from("reports").select("*, tracks(title, creator)").eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    setTracks(trackData || []);
    setReports(reportData || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function removeTrack(id) {
    if (!confirm("Remove this track? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("tracks").delete().eq("id", id);
    load();
  }

  async function resolveReport(id, action) {
    const supabase = createClient();
    await supabase.from("reports").update({ status: action }).eq("id", id);
    load();
  }

  const filteredTracks = tracks.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.creator?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: "400", marginBottom: "6px" }}>Content Moderation</h1>
      <p style={{ fontSize: "12px", color: "#555", marginBottom: "24px" }}>Review reports and manage platform content</p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[["reports", `Reports${reports.length > 0 ? ` (${reports.length})` : ""}`], ["tracks", "All Tracks"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: "6px 14px", borderRadius: "999px", fontSize: "11px", border: "1px solid",
            borderColor: tab === key ? "#c9a96e" : "#1a1710",
            background: tab === key ? "rgba(201,169,110,0.1)" : "transparent",
            color: tab === key ? "#c9a96e" : "#555",
          }}>{label}</button>
        ))}
      </div>

      {loading ? <p style={{ color: "#444", fontSize: "13px" }}>Loading…</p> : (
        <>
          {tab === "reports" && (
            reports.length === 0
              ? <p style={{ color: "#444", fontSize: "13px" }}>No pending reports. 🎉</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {reports.map(r => (
                    <div key={r.id} style={{ background: "#0d0b08", border: "1px solid #2a1a1a", borderRadius: "12px", padding: "18px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontSize: "13px", color: "#e8dcc8", marginBottom: "4px" }}>
                            Track: <strong>{r.tracks?.title || r.track_id}</strong> by {r.tracks?.creator || "—"}
                          </p>
                          <p style={{ fontSize: "12px", color: "#777", marginBottom: "8px" }}>{r.reason}</p>
                          <p style={{ fontSize: "10px", color: "#444" }}>{new Date(r.created_at).toLocaleString("en-GB")}</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                          <button onClick={() => resolveReport(r.id, "dismissed")} style={{
                            padding: "6px 12px", borderRadius: "7px", fontSize: "11px",
                            background: "transparent", border: "1px solid #1a1710", color: "#666",
                          }}>Dismiss</button>
                          <button onClick={async () => { await removeTrack(r.track_id); await resolveReport(r.id, "resolved"); }} style={{
                            padding: "6px 12px", borderRadius: "7px", fontSize: "11px",
                            background: "#3a1010", border: "1px solid #5a2020", color: "#e87070",
                          }}>Remove Track</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          )}

          {tab === "tracks" && (
            <>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or creator…"
                style={{ width: "100%", marginBottom: "16px", padding: "9px 14px", borderRadius: "8px", background: "#0d0b08", border: "1px solid #1a1710", color: "#e8dcc8", fontSize: "12px", outline: "none" }}
              />
              <div style={{ background: "#0d0b08", border: "1px solid #1a1710", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1a1710" }}>
                      {["Title", "Creator", "Category", "Plays", ""].map(h => (
                        <th key={h} style={{ padding: "11px 14px", textAlign: "left", color: "#555", fontWeight: "500", fontSize: "10px", letterSpacing: "0.1em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTracks.map(t => (
                      <tr key={t.id} style={{ borderBottom: "1px solid #1a1710" }}>
                        <td style={{ padding: "10px 14px", color: "#e8dcc8", fontStyle: "italic" }}>{t.title}</td>
                        <td style={{ padding: "10px 14px", color: "#888" }}>{t.creator}</td>
                        <td style={{ padding: "10px 14px", color: "#555", fontSize: "11px" }}>{t.category}</td>
                        <td style={{ padding: "10px 14px", color: "#c9a96e" }}>{t.plays?.toLocaleString()}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <button onClick={() => removeTrack(t.id)} style={{
                            padding: "4px 10px", borderRadius: "6px", fontSize: "11px",
                            background: "transparent", border: "1px solid #3a1a1a", color: "#c95050",
                          }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
