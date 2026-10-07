import { ImageResponse } from "next/og";
import mark from "@/lib/brand/mark.json";
import { SITE } from "@/lib/config/site";

// Default social card for every page (pages may override). Name and tagline come from SITE.
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const unit = 168 / mark.viewBox;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FAFAF7", padding: "72px 80px", color: "#202124" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ position: "relative", width: 168, height: 168, display: "flex" }}>
            {mark.cells.map((c) => (
              <div
                key={`${c.x}-${c.y}`}
                style={{ position: "absolute", left: c.x * unit, top: c.y * unit, width: mark.cellSize * unit, height: mark.cellSize * unit, borderRadius: mark.radius * unit, background: c.accent ? mark.colors.accent : mark.colors.primary }}
              />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>{SITE.name}</div>
            <div style={{ fontSize: 30, color: "#6B7280", marginTop: 4 }}>{SITE.descriptor}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid #E7E5E0", paddingTop: 36 }}>
          <div style={{ fontSize: 52, fontWeight: 600, letterSpacing: -1 }}>{SITE.tagline}</div>
          <div style={{ fontSize: 26, color: "#6B7280", marginTop: 12 }}>Official ICSI resources and structured examination analysis.</div>
        </div>
      </div>
    ),
    size,
  );
}
