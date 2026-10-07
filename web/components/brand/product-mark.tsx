import mark from "@/lib/brand/mark.json";

export type MarkVariant = "color" | "mono" | "tile";

/**
 * The product symbol ("Evidence Steps"). Geometry lives in lib/brand/mark.json — the single source
 * shared with the favicon, Apple touch icon and Open Graph image.
 *  - color: evergreen cells + one ochre top step (default)
 *  - mono:  every cell in currentColor (one-colour print, embossing, monochrome contexts)
 *  - tile:  color mark on an off-white rounded tile (favicon / app icon, legible on dark tabs)
 */
export function ProductMark({
  size = 28,
  variant = "color",
  title,
  className,
}: {
  size?: number;
  variant?: MarkVariant;
  /** Accessible name. Omit when the mark sits next to the visible product name (decorative). */
  title?: string;
  className?: string;
}) {
  const vb = mark.viewBox;
  const fill = (accent: boolean) => (variant === "mono" ? "currentColor" : accent ? mark.colors.accent : mark.colors.primary);
  return (
    <svg
      viewBox={`0 0 ${vb} ${vb}`}
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      shapeRendering="geometricPrecision"
    >
      {/* tile: full-scale cells on an off-white tile, so the 2-unit margin stays pixel-exact at 16px */}
      {variant === "tile" && <rect width={vb} height={vb} rx="5" fill={mark.colors.tile} />}
      {mark.cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={mark.cellSize} height={mark.cellSize} rx={mark.radius} fill={fill(c.accent)} />
      ))}
    </svg>
  );
}
