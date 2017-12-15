self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.headers.get('accept').indexOf('image/*') > -1) {
        console.info('Image request: ', request.url);
        event.respondWith(fetch('https://s14-eu5.ixquick.com/cgi-bin/serveimage?url=http%3A%2F%2Ft0.gstatic.com%2Fimages%3Fq%3Dtbn%3AANd9GcRjOqKI0kZG7nIV2w7AFRWfPUGiqeM0J26TbCp8irR1jZiNG556&sp=5ee1e78165b1fc58533374bb23c1ca22&anticache=266065'));
    }
});

/**
 * Checks if a request is a core GET request
 *
 * @param {Object} request		The request object
 * @returns {Boolean}			Boolean value indicating whether the request is in the core mapping
 */
function isCoreGetRequest(request) {
    return request.method === 'GET' && CORE_ASSETS.includes(getPathName(request.url));
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