const CACHE_NAME = 'autopay-africa-v2'
const OFFLINE_SHELL = ['/manifest.webmanifest', '/pwa-icon.svg', '/favicon.svg', '/icons.svg']

function isSameOrigin(url) {
  return url.origin === self.location.origin
}

function isApiRequest(url) {
  return url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')
}

function isHashedAsset(url) {
  return url.pathname.startsWith('/assets/')
}

function isStaticShell(url) {
  return OFFLINE_SHELL.includes(url.pathname)
}

function canCacheResponse(response) {
  return response && response.ok && response.type === 'basic'
}

async function cachePut(request, response) {
  if (!canCacheResponse(response)) return
  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response.clone())
}

async function networkFirst(request, { offlineFallback } = {}) {
  try {
    const response = await fetch(request)
    if (canCacheResponse(response)) {
      await cachePut(request, response)
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached

    if (offlineFallback) {
      const fallback = await caches.match(offlineFallback)
      if (fallback) return fallback
    }

    throw error
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (canCacheResponse(response)) {
    await cachePut(request, response)
  }
  return response
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (!isSameOrigin(url)) return
  if (isApiRequest(url)) return

  // Hashed Vite bundles must use normal network caching — never SW cache-first.
  if (isHashedAsset(url)) return

  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(networkFirst(request, { offlineFallback: '/' }))
    return
  }

  if (isStaticShell(url)) {
    event.respondWith(cacheFirst(request))
  }
})
