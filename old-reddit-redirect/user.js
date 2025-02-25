// ==UserScript==
// @name         Reddit to Old Reddit Redirector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically redirects Reddit pages to old.reddit.com
// @author       Jim Chen
// @match        *://*.reddit.com/*
// @exclude      *://old.reddit.com/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/jimchen2/userscripts/refs/heads/main/old-reddit-redirect/user.js
// @downloadURL  https://raw.githubusercontent.com/jimchen2/userscripts/refs/heads/main/old-reddit-redirect/user.js
// ==/UserScript==

(function() {
    'use strict';
    if (window.location.hostname.indexOf('old.reddit.com') === -1) {
        window.location.replace(window.location.href.replace(/\/\/(www\.)?reddit\.com/, '//old.reddit.com'));
    }
})();
