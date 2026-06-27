const CACHE_NAME = 'autopay-africa-v1'
const APP_SHELL = ['/', '/manifest.webmanifest', '/pwa-icon.svg']
const STATIC_EXTENSIONS = ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff2']

function shouldCache(request) {
  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return false
  if (url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')) return false
  if (url.pathname === '/' || APP_SHELL.includes(url.pathname)) return true

  return STATIC_EXTENSIONS.some((extension) => url.pathname.endsWith(extension))
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') return
  if (!shouldCache(request)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match('/'))
    }),
  )
})
