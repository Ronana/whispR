"use client";

const shimmer = `
  @keyframes whispr-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
`;

const BASE = {
  background: "linear-gradient(90deg, #1a1710 25%, #252018 50%, #1a1710 75%)",
  backgroundSize: "600px 100%",
  animation: "whispr-shimmer 1.6s ease-in-out infinite",
  borderRadius: "6px",
};

export function Skeleton({ width = "100%", height = "14px", style = {}, radius = "6px" }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ ...BASE, width, height, borderRadius: radius, flexShrink: 0, ...style }} />
    </>
  );
}

/* ─── Presets ─────────────────────────────────────── */

export function SkeletonText({ lines = 1, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 && lines > 1 ? "60%" : "100%"} height="12px" />
      ))}
    </div>
  );
}

export function SkeletonTrackRow({ isMobile = false }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{
        display: "flex", alignItems: "center",
        gap: isMobile ? "10px" : "14px",
        padding: isMobile ? "10px 12px" : "12px 16px",
        borderRadius: "10px",
      }}>
        <Skeleton width={isMobile ? "36px" : "42px"} height={isMobile ? "36px" : "42px"} radius="8px" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton width="55%" height="12px" />
          <Skeleton width="35%" height="10px" />
        </div>
        {!isMobile && <Skeleton width="30px" height="10px" />}
        {!isMobile && <Skeleton width="24px" height="24px" radius="50%" />}
      </div>
    </>
  );
}

export function SkeletonFeaturedCard() {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{
        minWidth: "160px", height: "200px", borderRadius: "14px",
        ...BASE, flexShrink: 0,
      }} />
    </>
  );
}

export function SkeletonStatCard() {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{
        background: "#0d0b08", border: "1px solid #1a1710",
        borderRadius: "10px", padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: "10px",
      }}>
        <Skeleton width="60%" height="10px" />
        <Skeleton width="40%" height="28px" radius="4px" />
      </div>
    </>
  );
}

export function SkeletonTableRow({ cols = 4 }) {
  return (
    <>
      <style>{shimmer}</style>
      <tr style={{ borderBottom: "1px solid #1a1710" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <td key={i} style={{ padding: "12px 16px" }}>
            <Skeleton width={i === 0 ? "140px" : i === cols - 1 ? "60px" : "80px"} height="11px" />
          </td>
        ))}
      </tr>
    </>
  );
}

export function SkeletonAvatar({ size = "64px" }) {
  return <Skeleton width={size} height={size} radius="50%" />;
}

export function FadeIn({ children, duration = 300, style = {} }) {
  return (
    <div style={{
      animation: `whispr-fadein ${duration}ms ease forwards`,
      ...style,
    }}>
      <style>{`@keyframes whispr-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {children}
    </div>
  );
}
