// ==UserScript==
// @name         YouTube Dual Subtitles
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @license      Unlicense
// @description  Add DUAL SUBStitles to YouTube videos
// @author       Jim Chen
// @homepage     https://jimchen.me
// @match        https://*.youtube.com/*
// @run-at       document-idle
// ==/UserScript==
(function () {
  if (location.href.startsWith("https://www.youtube.com")) {
    document.addEventListener("yt-navigate-finish", () => {
      handleVideoNavigation();
    });
  } else if (location.href.startsWith("https://m.youtube.com")) {
    let lastUrl = window.location.href.split("#")[0];

    function checkUrlChanged() {
      const currentUrl = window.location.href.split("#")[0];
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        handleVideoNavigation();
      }
    }

    window.addEventListener("popstate", checkUrlChanged);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      const result = originalPushState.apply(this, arguments);
      checkUrlChanged();
      return result;
    };

    history.replaceState = function () {
      const result = originalReplaceState.apply(this, arguments);
      checkUrlChanged();
      return result;
    };

    handleVideoNavigation();
  } else if (location.href.startsWith("https://www.youtube.com/embed")) {
    handleVideoNavigation();
  }

  async function handleVideoNavigation() {
    console.log("[DUAL SUBS] FIRED");
    removeSubs();
    const subtitleURL = await extractSubtitleUrl();
    if (subtitleURL == null) return;
    const subtitleButton = document.querySelector(".ytp-subtitles-button");
    if (subtitleButton && subtitleButton.getAttribute("aria-pressed") === "true") subtitleButton.click();
    const url = new URL(subtitleURL);
    if (!url.searchParams.has("caps")) url.searchParams.set("caps", "asr");
    if (url.searchParams.has("fmt")) {
      url.searchParams.set("fmt", "vtt");
    } else {
      url.searchParams.set("fmt", "vtt");
    }
    url.searchParams.delete("tlang");
    const transUrl = new URL(url);
    transUrl.searchParams.set("tlang", "en");
    const transSub = transUrl.toString();
    console.log(`[DUAL SUBS] transSub ${transSub}`);
    await addOneSubtitle(transSub);
    console.log(`[DUAL SUBS] subtitleURL ${url.toString()}`);
    await addOneSubtitle(url.toString());
  }

  async function extractSubtitleUrl() {
    const listenForTimedtext = () => {
      return new Promise((resolve) => {
        console.log("[DUAL SUBS] Starting listener for subtitles...");

        let lastEntryCount = performance.getEntriesByType("resource").length;
        let foundOne = false;

        const intervalId = setInterval(() => {
          if (foundOne) return;

          const entries = performance.getEntriesByType("resource");
          const newEntries = entries.slice(lastEntryCount);
          lastEntryCount = entries.length;

          for (const entry of newEntries) {
            if (entry.name.includes("timedtext") && entry.name.includes("&pot=")) {
              console.log("[DUAL SUBS] Found timedtext request:", entry.name);
              foundOne = true;
              clearInterval(intervalId);
              resolve(entry.name);
              return;
            }
          }
        }, 500);

        setTimeout(() => {
          if (!foundOne) {
            clearInterval(intervalId);
            resolve(null);
          }
        }, 3000);
      });
    };

    let timedtextUrl = null;
    const maxAttempts = 2;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`[DUAL SUBS] Attempt ${attempt + 1}/${maxAttempts}: Double toggle and listen...`);
      document.querySelector(".ytp-subtitles-button").click();
      document.querySelector(".ytp-subtitles-button").click();
      timedtextUrl = await listenForTimedtext();
      if (timedtextUrl) {
        console.log("[DUAL SUBS] Found timedtext on attempt", attempt + 1);
        break;
      }

      console.log(`[DUAL SUBS] Attempt ${attempt + 1} failed, no timedtext found.`);
    }

    if (!timedtextUrl) {
      console.log("[DUAL SUBS] All attempts failed.");
      return;
    }

    return timedtextUrl;
  }

  async function addOneSubtitle(url, maxRetries = 5, delay = 1000) {
    const video = document.querySelector("video");
    try {
      const response = await fetch(url);
      const subtitleData = (await response.text()).replaceAll("align:start position:0%", "");
      const track = document.createElement("track");
      track.src = "data:text/vtt," + encodeURIComponent(subtitleData);
      await new Promise((resolve) => setTimeout(resolve, delay));
      video.appendChild(track);
      track.track.mode = "showing";
    } catch (error) {
      if (maxRetries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return addOneSubtitle(url, maxRetries - 1, delay * maxRetries);
      }
    }
  }

  function removeSubs() {
    const video = document.getElementsByTagName("video")[0];
    if (!video) return;
    const tracks = video.getElementsByTagName("track");
    Array.from(tracks).forEach(function (ele) {
      ele.track.mode = "hidden";
      ele.parentNode.removeChild(ele);
    });
  }
})();
