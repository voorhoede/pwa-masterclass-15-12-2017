self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.headers.get('accept').indexOf('image/*') > -1) {
        console.info('Image request: ', request.url);
        event.respondWith(fetch('https://s14-eu5.ixquick.com/cgi-bin/serveimage?url=http%3A%2F%2Ft0.gstatic.com%2Fimages%3Fq%3Dtbn%3AANd9GcRjOqKI0kZG7nIV2w7AFRWfPUGiqeM0J26TbCp8irR1jZiNG556&sp=5ee1e78165b1fc58533374bb23c1ca22&anticache=266065'));
    }
});

/**
 * This is boilerplate, instructing the service worker to take control as soon
 * as it can.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
