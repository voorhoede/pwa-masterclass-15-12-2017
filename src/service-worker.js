const CORE_CACHE_NAME = 'core-cache';
const CORE_ASSETS = [
    '/index.css',
    '/index.js',
    '/offline/'
];

// Precache static assets
self.addEventListener('install', event => {
    console.log('installing sw');
    event.waitUntil(caches.open(CORE_CACHE_NAME)
        .then(cache => cache.addAll(CORE_ASSETS))
        .then(() => self.skipWaiting())
    );
});

// Delete outdated core caches
self.addEventListener('activate', event => {
    console.log('activating sw');
    event.waitUntil(
        caches.open(CORE_CACHE_NAME).then(cache => {
            return cache.keys().then(requests => {
                const outdatedCoreCaches = requests.filter(request => {
                    return !CORE_ASSETS.includes(getPathName(request.url));
                });

                console.info('Deleting outdated core caches', outdatedCoreCaches);
                outdatedCoreCaches.map(cacheName => {
                    return cache.delete(cacheName)
                });
            })
        }).then(() => self.clients.claim())
    );
});


self.addEventListener('fetch', event => {
    const request = event.request;
    if (isCoreGetRequest(request)) {
        console.info('Core get request: ', request.url);
        event.respondWith(caches.open(CORE_CACHE_NAME)
            .then(cache => cache.match(request.url)))
    } else if (isHtmlGetRequest(request)) {
        console.info('HTML get request', request.url);
        event.respondWith(
            tryCacheThenNetwork(request, 'html-cache').catch((error) => {
                console.info('HTML fetch failed. Return offline fallback', error);
                return caches.open(CORE_CACHE_NAME).then(cache => cache.match('/offline/'))
            })
        )
    }
});


/**
 * Tries to get a response for a request from cache storage. If it can't find one, get the response from the network.
 *
 * @param {Object} request		The request object
 * @param {String} cacheName	The unique cache key in cache storage
 * @returns {Promise}			Resolves with response object
 */
function tryCacheThenNetwork(request, cacheName) {
    if (!cacheName) {
        return fetch(request);
    }
    return caches.open(cacheName)
        .then(cache => cache.match(request))
        .then(response => response ? response : fetchAndCache(request, cacheName))
}

/**
 * Fetch a request from the network an save it in cache storage
 *
 * @param {Object} request		The request object
 * @param {String} cacheName	The unique cache key in cache storage
 * @returns {Promise}			Resolves with response object
 */
function fetchAndCache(request, cacheName) {
    return fetch(request).then(response => {
        if (response.type !== 'opaqueredirect') { // filter out unauthenticated redirects
            return caches.open(cacheName)
                .then(cache => cache.put(request, response.clone()))
                .then(() => response);
        } else {
            return response;
        }
    })
}

/**
 * Checks if a request is a core GET request
 *
 * @param {Object} request		The request object
 * @returns {Boolean}			Boolean value indicating whether the request is in the core mapping
 */
function isCoreGetRequest(request) {
    return request.method === 'GET' && CORE_ASSETS.indexOf(getPathName(request.url)) > -1;
}

/**
 * Checks if a request is a GET and HTML request
 *
 * @param {Object} request		The request object
 * @returns {Boolean}			Boolean value indicating whether the request is a GET and HTML request
 */
function isHtmlGetRequest(request) {
    return request.method === 'GET' && (request.headers.get('accept') !== null && request.headers.get('accept').indexOf('text/html') > -1);
}

/**
 * Get a pathname from a full URL by stripping off domain
 *
 * @param {Object} requestUrl		The request object, e.g. https://www.mydomain.com/index.css
 * @returns {String}			    Relative url to the domain, e.g. index.css
 */
function getPathName(requestUrl) {
    const url = new URL(requestUrl);
    return url.pathname;
}