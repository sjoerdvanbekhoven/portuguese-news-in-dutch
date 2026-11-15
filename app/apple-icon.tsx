import { ImageResponse } from "next/og";
import { GALO_BODY, GALO_LEGS } from "@/components/galo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Thuisscherm-icoon voor iOS. Bewust vierkant en zonder rand: iOS legt er zelf de
 * afgeronde maskervorm overheen. Een eigen rand of afronding zou binnen dat masker
 * hoekig ogen.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f3f78",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 64 64" style={{ marginLeft: -6, marginTop: 2 }}>
          <path fillRule="evenodd" d={GALO_BODY} fill="#f3eee3" />
          <path d={GALO_LEGS} fill="#f3eee3" />
        </svg>
      </div>
    ),
    size,
  );
}
