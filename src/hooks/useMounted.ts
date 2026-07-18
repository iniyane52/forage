import { useSyncExternalStore } from "react";

function subscribeNever() {
  return () => {};
}
function getMountedSnapshot() {
  return true;
}
function getServerMountedSnapshot() {
  return false;
}

/**
 * useSyncExternalStore, not useState+useEffect: React's own recommended way to read a
 * client-only value without an effect-triggered setState cascade. The server snapshot
 * is always false, the client snapshot always true, so hydration's first client render
 * matches the server exactly and only flips after -- same convention as ScrollHero.tsx's
 * useIsDesktop(). Needed anywhere a component branches its returned tree on a value
 * (like useReducedMotion()) that SSR can't read: without this gate, a client that
 * already prefers reduced motion can disagree with the server on the very first paint,
 * which is a real hydration mismatch, not just a cosmetic flash.
 */
export function useMounted() {
  return useSyncExternalStore(subscribeNever, getMountedSnapshot, getServerMountedSnapshot);
}
