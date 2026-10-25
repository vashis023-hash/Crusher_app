// Offline cache for Crusher Plant Log. Bump VERSION when files change so phones pick up the update.
const VERSION = "plantlog-v24";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "logo.png", "tracker-template.xlsx", "firebase-config.js",
  "chart.umd.js", "html2canvas.min.js", "xlsx.full.min.js", "jszip.min.js", "firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === "navigate" || /\/(index\.html|firebase-config\.js)?$/.test(new URL(req.url).pathname);
  if (isPage) {
    // Page: try the network first so updates show at once; use the saved copy when offline.
    e.respondWith(fetch(req, {cache: "no-store"}).then(resp => {
      if (resp.ok) { const copy = resp.clone(); const key = /firebase-config\.js$/.test(new URL(req.url).pathname) ? "firebase-config.js" : "index.html"; caches.open(VERSION).then(c => c.put(key, copy)); }
      return resp;
    }).catch(() => caches.match(/firebase-config\.js$/.test(new URL(req.url).pathname) ? "firebase-config.js" : "index.html")));
    return;
  }
  // Libraries, icons, logo: saved copy first (fast, works offline).
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(resp => {
    if (resp.ok) { const copy = resp.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return resp;
  })));
});
