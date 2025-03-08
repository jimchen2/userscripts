// ==UserScript==
// @name         Simple Website Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Blocks specified websites
// @match        *://*.x.com/*
// @match        *://*.instagram.com/*
// @match        *://*.weibo.com/*
// @match        *://*.douban.com/*
// @match        *://*.tieba.baidu.com/*
// @match        *://*.tiebac.baidu.com/*
// @match        *://*.weifan.baidu.com/*
// @match        *://*.nani.baidu.com/*
// @match        *://*.reddit.com/r/China_irl/*
// @match        *://*.huaren.us/*
// @match        *://*.tiktok.com/*
// @match        *://*.pincong.rocks/*
// @match        *://*.douyin.com/*
// @match        *://*.mastodon.social/*
// @match        *://*.bsky.app/*
// @match        *://*.truthsocial.com/*
// @match        *://*.kiwifarms.st/*
// @match        *://*.infowars.com/*
// @match        *://*.zombsroyale.io/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  window.stop();

  alert("WEBSITE BLOCKED\n\nSite blocked by Userscript because it contains extremist contents.\n\nPlease choose healthy alternatives.");
})();
