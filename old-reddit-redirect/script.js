// ==UserScript==
// @name         Reddit to Old Reddit Redirector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically redirects Reddit pages to old.reddit.com
// @author       Jim Chen
// @match        *://*.reddit.com/*
// @exclude      *://old.reddit.com/*
// @grant        none
// ==/UserScript==

(function () {
  if (window.location.hostname.indexOf("old.reddit.com") === -1) {
    window.location.replace(window.location.href.replace(/\/\/(www\.)?reddit\.com/, "//old.reddit.com"));
  }
})();
