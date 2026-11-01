import { ImageResponse } from "next/og";

export const alt = "KnowVa — verified academic resources";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #050b14 0%, #0f1b2d 55%, #111c37 100%)",
          color: "#e7eefc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 52%, #7c3aed 100%)",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 32 32">
              <g fill="none" stroke="#ffffff" strokeWidth={3.1} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 7.6v16.8" />
                <path d="M9 16l8-8.2" />
                <path d="M9 16l4.6 5.4L23 11.3" />
              </g>
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
              Know<span style={{ color: "#2dd4bf" }}>Va</span>
            </div>
            <div style={{ fontSize: 18, color: "#8aa0c0", letterSpacing: 3, textTransform: "uppercase" }}>
              Verified academic resources
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -2,
            }}
          >
            Find trusted notes.
            <br />
            <span style={{ color: "#5eead4" }}>Publish with confidence.</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#9fb3d1" }}>
            One platform for students, lecturers and academic administrators.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 20, color: "#c7d6ee" }}>
          <div style={{ display: "flex", padding: "12px 20px", borderRadius: 14, background: "rgba(45,212,191,0.14)", border: "1px solid rgba(45,212,191,0.35)" }}>
            Student portal
          </div>
          <div style={{ display: "flex", padding: "12px 20px", borderRadius: 14, background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.35)" }}>
            Lecturer portal
          </div>
          <div style={{ display: "flex", padding: "12px 20px", borderRadius: 14, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
            Super admin
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
