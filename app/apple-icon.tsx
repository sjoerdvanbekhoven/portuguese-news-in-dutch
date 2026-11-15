import { ImageResponse } from "next/og";
import { GALO_PATH } from "@/components/galo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Thuisscherm-icoon voor iOS: blauwe haan op gekalkt wit, met een tegelrandje. */
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
          background: "#f3eee3",
          border: "10px solid #1f3f78",
        }}
      >
        <svg width="128" height="128" viewBox="0 0 64 64">
          <path d={GALO_PATH} fill="#1f3f78" />
        </svg>
      </div>
    ),
    size,
  );
}
