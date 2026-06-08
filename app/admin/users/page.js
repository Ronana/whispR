"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../../lib/supabase";
import { SkeletonTableRow, FadeIn } from "../../../components/Skeleton";

const ROLES = ["listener", "pending_creator", "creator", "admin", "suspended"];
const ROLE_COLORS = {
  listener: "#555", pending_creator: "#8c7a30", creator: "#c9a96e",
  admin: "#507ac9", suspended: "#c95050",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let q = supabase.from("profiles")
      .select("user_id, display_name, username, role, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (search) {
      q = q.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    const { data } = await q;
    setUsers(data || []);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  async function setRole(userId, role) {
    const supabase = createClient();
    await supabase.from("profiles").update({ role }).eq("user_id", userId);
    load();
  }

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: "400", marginBottom: "6px" }}>Users</h1>
      <p style={{ fontSize: "12px", color: "#555", marginBottom: "24px" }}>Search and manage platform users</p>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by username or display name…"
          style={{
            flex: 1, padding: "9px 14px", borderRadius: "8px",
            background: "#0d0b08", border: "1px solid #1a1710", color: "#e8dcc8",
            fontSize: "12px", outline: "none",
          }}
        />
      </div>

      {loading ? (
        <div style={{ background: "#0d0b08", border: "1px solid #1a1710", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />)}
          </tbody>
        </table>
      </div>
      ) : (
        <>
          <FadeIn><div style={{ background: "#0d0b08", border: "1px solid #1a1710", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1710" }}>
                  {["User", "Role", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: "500", fontSize: "10px", letterSpacing: "0.1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.user_id} style={{ borderBottom: "1px solid #1a1710" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {u.avatar_url
                          ? <img src={u.avatar_url} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
                          : <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1e1a14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#555" }}>◉</div>
                        }
                        <div>
                          <p style={{ color: "#e8dcc8" }}>{u.display_name || "—"}</p>
                          <p style={{ color: "#555", fontSize: "10px" }}>@{u.username || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "10px", color: ROLE_COLORS[u.role] || "#555", border: `1px solid`, borderColor: ROLE_COLORS[u.role] || "#555", padding: "3px 8px", borderRadius: "999px", opacity: 0.8 }}>{u.role}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#555", fontSize: "11px" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <select
                        value={u.role || "listener"}
                        onChange={e => setRole(u.user_id, e.target.value)}
                        style={{
                          background: "#1a1710", border: "1px solid #2a2418", color: "#999",
                          borderRadius: "6px", fontSize: "11px", padding: "4px 8px", cursor: "pointer",
                        }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div></FadeIn>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #1a1710", background: "transparent", color: page === 0 ? "#333" : "#888", fontSize: "12px" }}>
              ← Prev
            </button>
            <span style={{ fontSize: "11px", color: "#444" }}>Page {page + 1}</span>
            <button disabled={users.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #1a1710", background: "transparent", color: users.length < PAGE_SIZE ? "#333" : "#888", fontSize: "12px" }}>
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
