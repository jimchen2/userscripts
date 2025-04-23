// ==UserScript==
// @name         Reddit to Old Reddit Redirector
// @namespace    http://tampermonkey.net/
// @version      2.1
// @license      Unlicense
// @description  Automatically redirects Reddit pages to old.reddit.com, excluding media and other problematic URLs
// @author       Jim Chen (with tweaks)
// @match        *://*.reddit.com/*
// @exclude      *://old.reddit.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  if (window.location.hostname.indexOf("old.reddit.com") === -1) {
    if (!window.location.pathname.match(/\/(?:media|gallery|settings\b|r\/\w+\/s\/)/)) {
      window.location.replace(window.location.href.replace(/\/\/(www\.)?reddit\.com/, "//old.reddit.com"));
    }
  }
})();
