/** Public shell: no sidebar, no top bar — just the page. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
