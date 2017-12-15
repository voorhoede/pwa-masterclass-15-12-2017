importScripts('./assets/idb.js');

const CORE_CACHE_NAME = 'core-cache';
const CORE_ASSETS = [
    '/index.css',
    '/index.js',
    '/offline/'
];

// Instantiate IDB
const chatDb = idb.open('chatDb', 1, upgradeDB => {
    upgradeDB.createObjectStore('messages', { keyPath: '' });
});

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
            fetch(request).catch((error) => {
                console.info('HTML fetch failed. Return offline fallback', error);
                return caches.open(CORE_CACHE_NAME).then(cache => cache.match('/offline/'))
            })
        )
    }
});

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


/**
 * Get all messages from local message database
 *
 * @returns {Promise}
 */
function getAllMessagesFromStore() {
    return chatDb.then(db => db.transaction('messages', 'readwrite').objectStore('messages').getAll());
}

/**
 * Sends all chat messages from local message database to server
 *
 * @returns {Promise}
 */
function sendChats() {
    let entryIds = [];
    return getAllMessagesFromStore()
        .then(entries => {
            return Promise.all(entries.map(entry => {
                const message = entry.data;
                return sendSingleChat(message)
                    .then(response => {
                        if (response.ok) {
                            return chatDb
                        } else {
                            const err = new Error(`Couldn’t send ${message.id} :(`);
                            err.status = response.status;
                            err.statusText = response.statusText;
                            throw err;
                        }
                    })
                    .then(db => db.transaction('messages', 'readwrite').objectStore('messages').delete(message.id))
                    .then(() => console.info(`Sent ${message.id} to server, deleted from local db!`))
                    .then(() => ({ id: message.id, status: 'Sent' }))
                    .catch(err => {
                        console.error(err);
                        return { id: message.id, status: 'Failed' };
                    })
            }))
        });
}

/**
 * Send a chat message to the server
 *
 * @param  {Object} message Chat message, as defined in message-form.js
 * @returns {Promise}
 */
function sendSingleChat(message) {
    return fetch('/messages/send?ajax=true', {
        method: 'post',
        headers: new Headers({
            'content-type': 'application/json'
        }),
        body: JSON.stringify(message),
        credentials: 'include'
    });
}

/**
 * Sends a postmessage to all clients
 *
 * @param  {String} message
 * @returns {Promise}
 */
function postMessage(message){
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            return new Promise((resolve, reject) => {
                const msgChannel = new MessageChannel();
                msgChannel.port1.onmessage = event => {
                    if (event.data.error) {
                        reject(event.data.error);
                    } else {
                        resolve(event.data);
                    }
                };
                client.postMessage(message, [msgChannel.port2]);
            });
        });
    });
}
