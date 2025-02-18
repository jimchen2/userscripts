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
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  document.body.innerHTML = '<div style="font-size: 100px; font-weight: bold;">Site blocked by Userscript.<br>Time to do something more meaningful!</div>';
  window.stop();
})();
