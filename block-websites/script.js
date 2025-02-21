// ==UserScript==
// @name         Simple Website Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Blocks specified websites
// @match        *://*.x.com/*
// @match        *://*.instagram.com/*
// @match        *://*.weibo.com/*
// @match        *://*.douban.com/*
// @match        *://*.bilibili.com/*
// @match        *://*.baidu.com/*
// @match        *://*.huaren.us/*
// @match        *://*.tiktok.com/*
// @match        *://*.douyin.com/*
// @run-at       document-start
// @grant        none
// @updateURL    https://raw.githubusercontent.com/jimchen2/userscripts/refs/heads/main/block-websites/script.js
// @downloadURL  https://raw.githubusercontent.com/jimchen2/userscripts/refs/heads/main/block-websites/script.js
// ==/UserScript==

(function () {
  "use strict";
  window.stop();
})();
