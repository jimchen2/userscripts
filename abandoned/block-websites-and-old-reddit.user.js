// ==UserScript==
// @name         Block Websites and Old Reddit
// @namespace    http://tampermonkey.net/
// @version      3.0
// @license      Unlicense
// @description  Block Websites and Old Reddit
// @author       Jim Chen
// @match        *://*.reddit.com/*
// @match        *://*.x.com/*
// @match        *://*.instagram.com/*
// @match        *://*.weibo.com/*
// @match        *://*.douban.com/*
// @match        *://*.tieba.baidu.com/*
// @match        *://*.tiebac.baidu.com/*
// @match        *://*.weifan.baidu.com/*
// @match        *://*.nani.baidu.com/*
// @match        *://*.huaren.us/*
// @match        *://*.tiktok.com/*
// @match        *://*.pincong.rocks/*
// @match        *://*.douyin.com/*
// @match        *://*.mastodon.social/*
// @match        *://*.bsky.app/*
// @match        *://*.truthsocial.com/*
// @match        *://*.kiwifarms.st/*
// @match        *://*.stormfront.org/*
// @match        *://*.infowars.com/*
// @match        *://*.zombsroyale.io/*
// @exclude      *://old.reddit.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const blockedSubreddits = ["/r/China_irl/", "/r/LiberalGooseGroup/"];
  if (window.location.hostname.includes("reddit.com")) {
    if (blockedSubreddits.some((sub) => window.location.pathname.includes(sub))) {
      blockSite();
    } else if (window.location.hostname.indexOf("old.reddit.com") === -1) {
      if (!window.location.pathname.match(/\/(?:media|gallery|settings\b|r\/\w+\/s\/)/)) {
        window.location.replace(window.location.href.replace(/\/\/(www\.)?reddit\.com/, "//old.reddit.com"));
      }
    }
  } else blockSite();

  function blockSite() {
    window.location.replace("https://jw.ustc.edu.cn");
    alert("WEBSITE BLOCKED\n\nSite blocked by Userscript because it contains extremist contents.\n\nPlease choose healthy alternatives.");
  }
})();
