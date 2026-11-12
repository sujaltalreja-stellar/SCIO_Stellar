import React from "react";

// After a new deployment, an open tab may request code files that no longer
// exist. Reload once to pick up the new version instead of showing a blank page.
const RELOAD_KEY = "scio_reloaded_for_update";
function reloadForNewVersion() {
  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return false;
    sessionStorage.setItem(RELOAD_KEY, "1");
  } catch {
    /* storage unavailable: still reload once per page load */
  }
  window.location.reload();
  return true;
}
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (e) => {
    if (reloadForNewVersion()) e.preventDefault();
  });
  // Successful load: allow a future reload after the next deployment.
  window.setTimeout(() => {
    try {
      sessionStorage.removeItem(RELOAD_KEY);
    } catch {
      /* ignore */
    }
  }, 15000);
}
export function lazyWithReload<T extends React.ComponentType<object>>(load: () => Promise<{ default: T }>) {
  return React.lazy(() =>
    load().catch((err) => {
      if (reloadForNewVersion()) return new Promise<{ default: T }>(() => {});
      throw err;
    })
  );
}
