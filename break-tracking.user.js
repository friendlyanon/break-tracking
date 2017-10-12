// ==UserScript==
// @name      Break tracking
// @namespace intermission
// @include   https://*
// @include   http://*
// @version   2
// @run-at    document-start
// @grant     none
// ==/UserScript==

const w = unsafeWindow || window;
const {console} = w;

const checkNeeds = () => {
  let ret = 4; // default access limit
  switch(location.host) { // add new cases below as needed
   case "mega.co.nz":
   case "mega.nz":
   case "www.twitch.tv":
   case "twitch.tv":
   case "vid.me":
    ret = 5;
    break;
   case "twitter.com":
   case "outlook.live.com":
    ret = 6;
    break;
   case "mail.cock.li":
    ret = 9;
    break;
  } // don't edit below!
  return ret;
};
const limit = checkNeeds();

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
        "Real value:", orig[key], "\n",
        "Cache:", cache, "\n",
        "Stack trace:"
      );
      console.trace();
      throw Symbol();
    }
    else if (key in Object(this)) {
      ++accessedSoFar;
      return (cache[key] = typeof val === "function" ? val.bind(orig) : val);
    }
  }
  return void 0;
},
proxy = () => {
  const objNavigator = Object.create(null);
  const setThrow = () => { throw Symbol(); };
  for (let i = 0, arr = Object.keys(Object.getPrototypeOf(orig)), len = arr.length, key; i < len && ((key = arr[i]) || true); ++i)
    Object.defineProperty(objNavigator, key, {
      get: implementTrap.bind(objNavigator, orig[key], key),
      set: setThrow,
      enumerable: true
    });
  if (orig.serviceWorker)
    cache.serviceWorker = orig.serviceWorker;
  return objNavigator;
};
Object.defineProperty(w, "navigator", { value: proxy(), enumerable: true });
w.addEventListener("revealCache", e => {
  if (e.target != e.currentTarget)
    return;
  console.log(cache);
});
