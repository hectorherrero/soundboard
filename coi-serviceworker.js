/* coi-serviceworker — enables SharedArrayBuffer on GitHub Pages and similar hosts.
 * Adapted from https://github.com/gzuidhof/coi-serviceworker (MIT licence).
 *
 * How it works:
 *   1. When loaded as a <script>, it registers itself as a service worker.
 *   2. On the next page load the SW intercepts every fetch response and
 *      injects the COOP + COEP headers that the browser needs to enable
 *      SharedArrayBuffer (required by ffmpeg.wasm).
 *
 * IMPORTANT: the <script> tag that loads this file must appear BEFORE any
 * other scripts so the SW can activate and the page can reload before
 * those scripts execute.
 */
"use strict";

(() => {
  /* ── Service-worker context ────────────────────────────────────────── */
  if (typeof document === "undefined") {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

    self.addEventListener("fetch", (e) => {
      const req = e.request;
      // Pass through opaque requests (cache-only cross-origin) unchanged
      if (req.cache === "only-if-cached" && req.mode !== "same-origin") return;

      e.respondWith(
        fetch(req)
          .then((res) => {
            if (res.status === 0) return res; // opaque response

            const h = new Headers(res.headers);
            h.set("Cross-Origin-Opener-Policy",   "same-origin");
            h.set("Cross-Origin-Embedder-Policy", "require-corp");
            h.set("Cross-Origin-Resource-Policy", "cross-origin");

            return new Response(res.body, {
              status:     res.status,
              statusText: res.statusText,
              headers:    h,
            });
          })
          .catch((err) => console.error("[coi-sw] fetch error:", err))
      );
    });

    return; // stop here — the rest is page-context code
  }

  /* ── Page context ──────────────────────────────────────────────────── */
  const alreadyIsolated = typeof SharedArrayBuffer !== "undefined";
  const isSecure        = location.protocol === "https:" ||
                          location.hostname  === "localhost" ||
                          location.hostname  === "127.0.0.1";

  if (alreadyIsolated || !isSecure) return; // nothing to do

  if (!navigator.serviceWorker) {
    console.warn("[coi-sw] Service workers are not available in this context.");
    return;
  }

  // Register this very script as a service worker
  navigator.serviceWorker
    .register(document.currentScript.src)
    .then((reg) => {
      console.log("[coi-sw] Service worker registered:", reg.scope);
    })
    .catch((err) => {
      console.error("[coi-sw] Registration failed:", err);
    });

  // If the SW is not yet controlling this page, reload once it activates
  if (!navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(() => {
      console.log("[coi-sw] SW active — reloading to enable SharedArrayBuffer…");
      location.reload();
    });
  }
})();
