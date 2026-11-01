import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} — ${site.roles.join(" | ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#050505",
          color: "#F8FAFC",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -60,
            width: 640,
            height: 640,
            borderRadius: 640,
            background: "radial-gradient(circle at 35% 35%, #8B5CF6, #1e1640 55%, #050505 72%)",
            boxShadow: "inset -40px -60px 120px rgba(56,189,248,.45)",
          }}
        />
        <div style={{ fontSize: 28, color: "#A1A1B5", display: "flex" }}>{site.roles.join("  ·  ")}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -4, lineHeight: 0.9 }}>ARIF</div>
          <div style={{ fontSize: 128, fontWeight: 800, letterSpacing: -4, lineHeight: 0.9 }}>SIDDIQUI</div>
          <div style={{ fontSize: 32, marginTop: 28, color: "#C4B5FD" }}>{site.headline}</div>
        </div>
      </div>
    ),
    size,
  );
}
