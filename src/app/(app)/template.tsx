// A template re-mounts on every navigation (including router.refresh() calls
// triggered by quiz/lesson actions), so a JS-driven mount animation can be
// interrupted mid-flight and get stuck invisible. A pure CSS animation with
// fill-mode "both" always resolves to its end state regardless of timing.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
