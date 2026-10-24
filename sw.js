// Offline cache for Crusher Plant Log. Bump VERSION when you upload a new index.html so phones pick it up.
const VERSION = "plantlog-v4";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png",
  "chart.umd.js", "html2canvas.min.js", "xlsx.full.min.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(resp => {
      if (resp.ok && new URL(e.request.url).origin === location.origin) {
        const copy = resp.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return resp;
    }).catch(() => caches.match("index.html")))
  );
});
