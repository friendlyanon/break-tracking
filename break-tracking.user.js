// ==UserScript==
// @name        Break tracking
// @namespace   intermission
// @include     https://*
// @include     http://*
// @version     1
// @run-at      document-start
// @grant       none
// ==/UserScript==

const w = unsafeWindow || window;

/* this seems to work well for most sites
 * this is also the minimum for mega.co.nz */
const limit = 5;

let accessedSoFar = 0;
const orig = w.navigator, cache = Object.create(null),
implementTrap = function(val, key) {
  if (key in cache) {
    return cache[key];
  }
  else {
    if (accessedSoFar > limit) {
      console.warn(
        "`navigator` was accessed too many times\n",
        `Key: "${key}"\n`,
        'Real value:', orig[key], "\n",
        "Cache:", cache
      );
      throw Symbol();
    }
    else if (Object.keys(this).includes(key)) {
      ++accessedSoFar;
      return (cache[key] = typeof val === "function" ? val.bind(orig) : val);
    }
  }
  return void 0;
},
proxy = () => {
  const objNavigator = Object.create(null);
  for (const key of Object.keys(Object.getPrototypeOf(orig)))
    Object.defineProperty(objNavigator, key, {
      get: implementTrap.bind(objNavigator, orig[key], key),
      enumerable: true
    });
  if (orig.serviceWorker)
    cache.serviceWorker = orig.serviceWorker;
  return objNavigator;
};
Object.defineProperty(w, "navigator", { value: proxy(), enumerable: true });