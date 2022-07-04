const APP_PREFIX = 'BudgedTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  './index.html',
  './js/idb.js',
  './js/index.js',
  './css/styles.css',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    // Use caches.open to find the specific caches by name, then add every file from the FILES_TO_CACHE
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('installing cache : ' + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    // Return an array of the cache names (keyList)
    caches.keys().then(function (keyList) {
      // Save them to an array called cacheKeeplist whil also applying a filter method to...
      let cacheKeeplist = keyList.filter(function (key) {
        // ...return the caches that have app prefix
        return key.indexOf(APP_PREFIX);
      });

      // Add the current cache to the keepList by pushing it
      cacheKeeplist.push(CACHE_NAME);

      // Return a Promise that resolves once all old version of the cache have been deleted
      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log('Deleting cache : ' + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

// Listen for the fetch event, log the URL of the requested resource then...
// begin to define how we will response wto the request
self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url);
  // The lines inside responseWith will deliver the resources directly from the cache, otherwise...
  // The resources will be retrieved normally
  e.respondWith(
    // We use .match() to check if the resources already exists in caches
    caches.match(e.request).then(function (request) {
      if (request) {
        // If resources exist, log the URL with a message then return the cached resources
        console.log('responding with cache : ' + e.request.url);
        return request;
      } else {
        // If resources do not exist in cache, allow th resource to be retrieved from the online network as usual
        console.log('file is not cached, fetching : ' + e.request.url);
        return fetch(e.request);
      }
    })
  );
});
