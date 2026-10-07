// Return-URL validation for ?next=. Only same-origin, path-absolute URLs are allowed.
// Rejects protocol-relative ("//x"), backslash tricks ("/\\x" — browsers treat "\\" as "/"),
// control characters, and anything whose resolved origin differs from ours.
const FALLBACK = "/dashboard";

export function safeNextPath(input: unknown, fallback = FALLBACK): string {
  if (typeof input !== "string" || input.length === 0 || input.length > 512) return fallback;
  if (!input.startsWith("/") || input.startsWith("//") || input.includes("\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(input)) return fallback;
  try {
    const base = "http://same-origin.invalid";
    const url = new URL(input, base);
    if (url.origin !== base) return fallback;
    const out = url.pathname + url.search + url.hash;
    // Re-check after normalisation: "/..//evil.com" resolves to the protocol-relative "//evil.com".
    if (out.startsWith("//") || out.includes("\\")) return fallback;
    return out;
  } catch {
    return fallback;
  }
}
