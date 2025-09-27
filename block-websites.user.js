// ==UserScript==
// @name         Block Websites
// @namespace    http://tampermonkey.net/
// @version      5.0
// @license      Unlicense
// @description  Block Harmful Websites
// @author       Jim Chen
// @match        *://*.reddit.com/*
// @match        *://*.huaren.us/*
// @match        *://*.aistudio.google.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const blockedSubreddits = ["/r/China_irl/", "/r/LiberalGooseGroup/"];
  if (window.location.hostname.includes("reddit.com")) {
    if (blockedSubreddits.some((sub) => window.location.pathname.includes(sub))) {
      blockSite();
    }
  } else blockSite();

  function blockSite() {
    window.location.replace("https://jw.ustc.edu.cn");
    alert(
      "WEBSITE BLOCKED\n\nSite blocked by Userscript because it contains extremist contents.\n\nPlease choose healthy alternatives."
    );
  }
})();
