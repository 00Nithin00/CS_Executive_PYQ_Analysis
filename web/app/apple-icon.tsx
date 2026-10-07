import { ImageResponse } from "next/og";
import mark from "@/lib/brand/mark.json";

// iOS home-screen icon: the colour mark on the off-white tile (iOS rounds the corners itself).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const unit = 120 / mark.viewBox; // mark occupies the central 120px
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: mark.colors.tile }}>
        <div style={{ position: "relative", width: 120, height: 120, display: "flex" }}>
          {mark.cells.map((c) => (
            <div
              key={`${c.x}-${c.y}`}
              style={{
                position: "absolute",
                left: c.x * unit,
                top: c.y * unit,
                width: mark.cellSize * unit,
                height: mark.cellSize * unit,
                borderRadius: mark.radius * unit,
                background: c.accent ? mark.colors.accent : mark.colors.primary,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
