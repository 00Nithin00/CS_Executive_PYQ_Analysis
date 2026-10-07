// Re-mounts on every navigation, so the CSS entrance replays per page without blocking first paint.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
