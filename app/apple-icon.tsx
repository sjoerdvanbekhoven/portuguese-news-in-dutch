import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Thuisscherm-icoon voor iOS (iOS gebruikt geen SVG-iconen). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #c2552e 0%, #8f3417 100%)",
          color: "#f7f3ec",
        }}
      >
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>PT</div>
        <div style={{ fontSize: 26, marginTop: 6, opacity: 0.85 }}>in het kort</div>
      </div>
    ),
    size,
  );
}
