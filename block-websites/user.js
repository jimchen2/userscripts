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
// ==/UserScript==

(function () {
  "use strict";
  window.stop();
})();
