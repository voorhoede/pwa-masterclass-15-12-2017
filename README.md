# Masterclass Progressive Web Apps

## Project setup

This project serves a chat app which we will enhance into a full fledge Progressive Web App.

* The `src/` directory is served with [Express](https://expressjs.com/).
* Templating is done with [Nunjucks](https://mozilla.github.io/nunjucks/).
* 

## Quick start

This project requires [Node.js](http://nodejs.org/) and [npm](https://npmjs.org/).

After installing dependencies using `npm install` the following scripts are available on all exercise branches:

`npm run ...` | Description
---|---
`build` | Revisions and writes static files from `src/` to `cache/`.
`start` | Starts an [Express.js](http://expressjs.com/) server on `http://localhost:7924` (7924 is "PWAS" in T9).
`dev` | Runs `npm start` and watches server changes.
`watch` | Watches changes and recompiles CSS and JS.

More (sub) tasks are available in [package.json > scripts](package.json).


## Exercises

* 01 - Add manifest & register Service Worker
* 02 - Hijack fetch

* 03 - Precache assets & use cached assets

* 04 - Cache offline page & use offline page
* 05 - Runtime caching

* 06 - Create app shell

* 07 - Enable and receive push notifications
* 08 - Implement background sync

Solutions are linked from each individual exercise.