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
          alignItems: "center",
          padding: "60px 88px",
          color: "#f1f5f9",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4361ee 100%)",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(76, 201, 240, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(114, 9, 183, 0.25) 0%, transparent 70%)",
          }}
        />
        
        {/* Logo mark */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #4361ee 0%, #3f37c9 50%, #7209b7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "32px",
            boxShadow: "0 8px 32px rgba(67, 97, 238, 0.4)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "white",
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            T
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              right: "14px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#4cc9f0",
              boxShadow: "0 0 12px rgba(76, 201, 240, 0.6)",
            }}
          />
        </div>
        
        {/* Brand name */}
        <div
          style={{
            fontSize: "48",
            fontWeight: "800",
            letterSpacing: "6",
            background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "24px",
          }}
        >
          TECH-UTILITY
        </div>
        
        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            fontSize: "52",
            lineHeight: 1.1",
            fontWeight: "600",
            color: "#e0e7ff",
          }}
        >
          <span>Your private</span>
          <span>tech library</span>
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            marginTop: "32px",
            color: "#a5b4fc",
            fontSize: "24",
            fontWeight: "400",
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          Keep the tools, tips and ideas worth finding again
        </div>
      </div>
    ),
    size
  );
}
