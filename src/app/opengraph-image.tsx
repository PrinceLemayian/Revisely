import { ImageResponse } from "next/og";

export const alt = "Revisely - Your campus library, upgraded.";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          color: "#17212b",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "72px 88px",
          position: "relative",
          width: "100%"
        }}
      >
        <div
          style={{
            backgroundImage:
              "linear-gradient(#e7f0ef 1px, transparent 1px), linear-gradient(90deg, #e7f0ef 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            inset: 0,
            opacity: 0.65,
            position: "absolute"
          }}
        />
        <div style={{ display: "flex", position: "relative" }}>
          <div
            style={{
              alignItems: "center",
              background: "#0f7c72",
              borderRadius: 16,
              color: "#ffffff",
              display: "flex",
              fontSize: 38,
              height: 72,
              justifyContent: "center",
              width: 72
            }}
          >
            R
          </div>
          <div style={{ alignItems: "center", display: "flex", fontSize: 34, fontWeight: 700, marginLeft: 18 }}>
            Revisely
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 64, position: "relative" }}>
          <div style={{ color: "#0f7c72", fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
            Built for campus life
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginTop: 20, maxWidth: 920 }}>
            Your campus library, upgraded.
          </div>
          <div style={{ color: "#526275", fontSize: 28, lineHeight: 1.35, marginTop: 28, maxWidth: 850 }}>
            Find notes, past papers, CATs, and assignments, then ask a grounded AI assistant for a hand.
          </div>
        </div>
      </div>
    ),
    size
  );
}
