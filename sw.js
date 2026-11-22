/* PageWhisper service worker: offline app shell + cached Kokoro library code.
   The Kokoro model files themselves are cached by transformers.js, not here. */
const VERSION = "v7";
const SHELL = "pw-shell-" + VERSION;
const LIBS = "pw-libs-v2";
const SHELL_FILES = [
  "./", "./index.html", "./manifest.json",
  "./tts-worker.js", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"
];
const LIB_HOSTS = ["cdn.jsdelivr.net", "unpkg.com"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await Promise.all(SHELL_FILES.map(f => c.add(f).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if ((k.startsWith("pw-shell-") && k !== SHELL) || (k.startsWith("pw-libs-") && k !== LIBS)) await caches.delete(k);
    await self.clients.claim();
  })());
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Kokoro / ONNX runtime code from the CDNs: cache-first so the app can start offline.
  if (LIB_HOSTS.includes(url.hostname)) {
    e.respondWith((async () => {
      const c = await caches.open(LIBS);
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok) c.put(req, res.clone());
      return res;
    })());
    return;
  }

  if (url.origin !== self.location.origin) return; // fetch services, Hugging Face, proxies: never touched

  // The speech worker script: network first so an update never mismatches the page, cache when offline.
  if (req.destination === "worker") {
    e.respondWith((async () => {
      const c = await caches.open(SHELL);
      try {
        const res = await Promise.race([fetch(req.url, { cache: "no-cache" }), timeout(4000)]);
        if (res && res.ok) c.put(req, res.clone());
        return res;
      } catch { return (await c.match(req)) || Response.error(); }
    })());
    return;
  }

  // Page loads: network first (so updates arrive), fall back to cache when offline or slow.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const c = await caches.open(SHELL);
      try {
        // "no-cache" makes the browser revalidate instead of serving a copy up to 10 minutes old (GitHub Pages default).
        const res = await Promise.race([fetch(req.url, { cache: "no-cache" }), timeout(4000)]);
        if (res && res.ok) c.put("./index.html", res.clone());
        return res;
      } catch {
        return (await c.match("./index.html")) || (await c.match("./")) || Response.error();
      }
    })());
    return;
  }

  // Other same-origin files (icons, manifest): cache first, refresh in the background.
  e.respondWith((async () => {
    const c = await caches.open(SHELL);
    const hit = await c.match(req);
    const net = fetch(req).then(res => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })());
});
