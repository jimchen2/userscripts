// ==UserScript==
// @name         Block Websites
// @namespace    http://tampermonkey.net/
// @version      6.1
// @license      Unlicense
// @description  Block Harmful Websites
// @author       Jim Chen
// @match        *://*.reddit.com/*
// @match        *://*.huaren.us/*
// @match        *://*.aistudio.google.com/*
// @match        *://*.tieba.baidu.com/*
// @run-at       document-start
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/550885/Block%20Websites.user.js
// @updateURL https://update.greasyfork.org/scripts/550885/Block%20Websites.meta.js
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
    window.location.replace("https://docs.google.com/document/d/1GIW1oz-ttAG3B08usdbz758iCgShPd4DWcBis_IBbgM/edit?tab=t.0");
    alert(
      "WEBSITE BLOCKED\n\nSite blocked by Userscript because it contains extremist contents.\n\nPlease choose healthy alternatives."
    );
  }
})();
