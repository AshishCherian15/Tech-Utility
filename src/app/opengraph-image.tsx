import { ImageResponse } from "next/og";

export const alt = "Tech-Utility — Your Private Tech Library";
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
          justifyContent: "center",
          padding: "88px",
          color: "#f1f5f9",
          background: "linear-gradient(135deg, #080c14 0%, #111827 60%, #0b2440 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ color: "#60a5fa", fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>TECH-UTILITY</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 28, fontSize: 76, lineHeight: 1.05, fontWeight: 700 }}>
          <span>Your private</span>
          <span>tech library.</span>
        </div>
        <div style={{ marginTop: 28, color: "#cbd5e1", fontSize: 28 }}>
          Keep the tools, tips and ideas worth finding again.
        </div>
      </div>
    ),
    size
  );
}
