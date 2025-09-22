// ==UserScript==
// @name         YouTube Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0.13
// @license      Unlicense
// @description  Add dual subtitles to YouTube videos
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
    console.log("[DUAL SUB] FIRED");
    const { url: subtitleURL, language } = await extractSubtitleUrl();
    if (subtitleURL == null) return;
    removeSubs();
    const url = new URL(subtitleURL);
    if (url.searchParams.has("tlang")) url.searchParams.set("tlang", "en");
    else url.searchParams.append("tlang", "en");
    await addOneSubtitle(url.toString());
    await addOneSubtitle(subtitleURL);
  }

  async function extractSubtitleUrl() {
    document.querySelector(".ytp-subtitles-button").click();
    const timedtextUrl = await new Promise((resolve, reject) => {
      console.log('Starting listener for subtitles"...');

      let lastEntryCount = performance.getEntriesByType("resource").length;
      let foundOne = false;

      const intervalId = setInterval(() => {
        if (foundOne) {
          console.log("[DUAL SUB] FOUND ONE");
          return;
        }

        const entries = performance.getEntriesByType("resource");
        const newEntries = entries.slice(lastEntryCount);
        lastEntryCount = entries.length;

        for (const entry of newEntries) {
          if (entry.name.includes("timedtext") && entry.name.includes("&pot=")) {
            console.log("[DUAL SUB] Found timedtext request:", entry.name);
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
          console.log("[DUAL SUB] Listener stopped after 3 seconds (no timedtext requests found).");
        }
      }, 3000);
    });

    if (!timedtextUrl) return;
    let url = new URL(timedtextUrl);
    url.searchParams.set("fmt", "vtt");
    return { url: url.toString(), language: "en" };
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
