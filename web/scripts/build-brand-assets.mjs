// Writes app/icon.svg (favicon: full-scale cells on an off-white tile, pixel-exact at 16/32px) from the single mark geometry in lib/brand/mark.json.
// The React mark, Apple touch icon and Open Graph image read the same JSON at build time.
// Usage: node scripts/build-brand-assets.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const mark = JSON.parse(readFileSync(resolve(here, "../lib/brand/mark.json"), "utf8"));
const vb = mark.viewBox;
const cells = mark.cells
  .map((c) => `<rect x="${c.x}" y="${c.y}" width="${mark.cellSize}" height="${mark.cellSize}" rx="${mark.radius}" fill="${c.accent ? mark.colors.accent : mark.colors.primary}"/>`)
  .join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}"><title>${mark.name}</title><rect width="${vb}" height="${vb}" rx="5" fill="${mark.colors.tile}"/>${cells}</svg>\n`;
writeFileSync(resolve(here, "../app/icon.svg"), svg);

// Standalone exports for docs, decks and print (public/brand/).
import { mkdirSync } from "node:fs";
const out = resolve(here, "../public/brand");
mkdirSync(out, { recursive: true });
const rects = (fill) => mark.cells.map((c) => `<rect x="${c.x}" y="${c.y}" width="${mark.cellSize}" height="${mark.cellSize}" rx="${mark.radius}" fill="${fill(c)}"/>`).join("");
const wrap = (body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}"><title>${title}</title>${body}</svg>\n`;
writeFileSync(resolve(out, "mark-color.svg"), wrap(rects((c) => (c.accent ? mark.colors.accent : mark.colors.primary)), `${mark.name} — colour`));
writeFileSync(resolve(out, "mark-mono.svg"), wrap(rects(() => "currentColor"), `${mark.name} — monochrome`).replace("<svg ", '<svg fill="currentColor" '));
writeFileSync(resolve(out, "mark-mono-ink.svg"), wrap(rects(() => "#202124"), `${mark.name} — monochrome ink`));
writeFileSync(resolve(out, "app-icon.svg"), svg);
console.log("wrote app/icon.svg and public/brand/{mark-color,mark-mono,mark-mono-ink,app-icon}.svg");
