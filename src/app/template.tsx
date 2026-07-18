// A template re-mounts on every navigation (including router.refresh() calls
// triggered by quiz/lesson actions), so a JS-driven mount animation can be
// interrupted mid-flight and get stuck invisible. A pure CSS animation with
// fill-mode "both" always resolves to its end state regardless of timing.
//
// Root-level, not (app)-scoped: covers every route in the app (landing, auth,
// and the whole (app) group) with a single mechanism -- a root template already
// remounts on any navigation anywhere beneath it, so a second (app)-scoped
// template would double the animation for internal (app) navigations instead of
// extending coverage.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
