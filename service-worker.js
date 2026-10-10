/* কিতাব ঘর — service worker
   শুধু নিজের সাইটের ফাইল ক্যাশ করে (network-first, তাই নতুন আপডেট সবসময় আগে আসে)।
   JSONBin, Google Drive, ছবি ইত্যাদি অন্য ডোমেইনের কোনো রিকোয়েস্টে হাত দেয় না। */
const CACHE = 'kitab-ghor-v2';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;     // অন্য ডোমেইন: সরাসরি নেটওয়ার্ক
  if (url.pathname.endsWith('admin.html')) return;     // অ্যাডমিন কখনো ক্যাশ হবে না
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
