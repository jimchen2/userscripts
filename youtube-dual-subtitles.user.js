// ==UserScript==
// @name         YouTube Dual Subtitles
// @namespace    http://tampermonkey.net/
// @version      2.2.1
// @license      Unlicense
// @description  Add DUAL SUBStitles to YouTube videos
// @author       Jim Chen
// @homepage     https://jimchen.me
// @match        https://*.youtube.com/*
// @run-at       document-idle
// ==/UserScript==
(function () {
  const isMobile = location.href.startsWith("https://m.youtube.com");
  const subtitleButtonSelector = isMobile ? ".ytmClosedCaptioningButtonButton" : ".ytp-subtitles-button";

  if (location.href.startsWith("https://www.youtube.com")) {
    document.addEventListener("yt-navigate-finish", () => {
      handleVideoNavigation();
    });
    handleVideoNavigation();
  } else if (isMobile) {
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

    const languageCheckPassed = await checkLanguageCode();
    if (!languageCheckPassed) return;

    const subtitleURL = await extractSubtitleUrl();
    if (subtitleURL == null) return;
    const subtitleButton = document.querySelector(subtitleButtonSelector);
    if (subtitleButton && subtitleButton.getAttribute("aria-pressed") === "true") subtitleButton.click();
    const url = new URL(subtitleURL);
    if (!url.searchParams.has("kind")) url.searchParams.set("kind", "asr");
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

  function checkLanguageCode() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 5;

      const intervalId = setInterval(() => {
        attempts++;
        console.log(`[DUAL SUBS] Language check attempt ${attempts}/${maxAttempts}`);

        try {
          const languageCode = document.querySelector("#movie_player").getPlayerResponse().captions
            .playerCaptionsTracklistRenderer.captionTracks[0].languageCode;

          if (languageCode) {
            if (languageCode.includes("de")) {
              console.log("[DUAL SUBS] Language check passed:", languageCode);
              clearInterval(intervalId);
              resolve(true);
              return;
            } else {
              console.log("[DUAL SUBS] Language code does not contain 'de':", languageCode);
              clearInterval(intervalId);
              resolve(false);
              return;
            }
          }
        } catch (error) {
          console.log("[DUAL SUBS] Language check failed with error:", error);
        }

        if (attempts >= maxAttempts) {
          console.log("[DUAL SUBS] Language check failed after all attempts. Skipping.");
          clearInterval(intervalId);
          resolve(false);
        }
      }, 1000);
    });
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

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let timedtextUrl = null;
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) {
        console.log(`[DUAL SUBS] Waiting 1000ms before attempt ${attempt + 1}...`);
        await delay(1000);
      }

      console.log(`[DUAL SUBS] Attempt ${attempt + 1}/${maxAttempts}: Double toggle and listen...`);
      console.log(`[DUAL SUBS] 111`);
      const subtitleButton = document.querySelector(subtitleButtonSelector);
      console.log(`[DUAL SUBS] 222`);
      if (!subtitleButton) {
        console.log("[DUAL SUBS] Subtitle button not found, skipping attempt");
        continue;
      }
      subtitleButton.click();
      console.log(`[DUAL SUBS] 333`);
      subtitleButton.click();
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
