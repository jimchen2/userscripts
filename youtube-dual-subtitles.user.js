// ==UserScript==
// @name         YouTube Dual Subtitles
// @namespace    http://tampermonkey.net/
// @version      2.2.10
// @license      Unlicense
// @description  Add DUAL SUBStitles to YouTube videos
// @author       Jim Chen
// @homepage     https://jimchen.me
// @match        https://*.youtube.com/*
// @run-at       document-idle
// ==/UserScript==
(function () {
  const isMobile = location.href.startsWith("https://m.youtube.com");
  let fired = false;
  let currentVideoID = extractYouTubeVideoID();

  if (location.href.startsWith("https://www.youtube.com")) {
    document.addEventListener("yt-navigate-finish", () => {
      handleVideoNavigation();
    });
    handleVideoNavigation();
  } else if (isMobile) {
    window.addEventListener("popstate", handleVideoNavigation);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      const result = originalPushState.apply(this, arguments);
      handleVideoNavigation();
      return result;
    };

    history.replaceState = function () {
      const result = originalReplaceState.apply(this, arguments);
      handleVideoNavigation();
      return result;
    };

    handleVideoNavigation();
  } else if (location.href.startsWith("https://www.youtube.com/embed")) {
    handleVideoNavigation();
  }

  function ensureVideoPlaying() {
    const video = document.querySelector("video");
    if (video && video.paused) {
      console.log("[DUAL SUBS] Video was paused, attempting to play...");
      video.play();
    }
  }

  function extractYouTubeVideoID() {
    const url = window.location.href;
    const patterns = {
      standard: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:[^?&]+&)*v=([^&]+)/,
      embed: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
      mobile: /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([^&]+)/,
    };

    let videoID = null;
    if (patterns.standard.test(url)) {
      videoID = url.match(patterns.standard)[1];
    } else if (patterns.embed.test(url)) {
      videoID = url.match(patterns.embed)[1];
    } else if (patterns.mobile.test(url)) {
      videoID = url.match(patterns.mobile)[1];
    }
    return videoID;
  }

  async function handleVideoNavigation() {
    console.log("handleVideoNavigation called");
    const newVideoID = extractYouTubeVideoID();
    if (!newVideoID) {
      console.log("[DUAL SUBS] Not on a video page, returning");
      currentVideoID = null;
      fired = false;
      return;
    }
    if (newVideoID !== currentVideoID) {
      console.log("[DUAL SUBS] Video ID changed, resetting fired variable");
      console.log("[DUAL SUBS] Previous Video ID:", currentVideoID);
      console.log("[DUAL SUBS] New Video ID:", newVideoID);
      currentVideoID = newVideoID;
      fired = false;
    }

    if (fired == true) return;

    fired = true;
    console.log("[DUAL SUBS] FIRED");
    removeSubs();

    const languageCheckPassed = await checkLanguageCode();
    if (!languageCheckPassed) return;

    const subtitleURL = await extractSubtitleUrl();
    if (subtitleURL == null) return;
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
    console.log("[DUAL SUBS] AAA");
    const subtitleButtonSelector = isMobile ? ".ytmClosedCaptioningButtonButton" : ".ytp-subtitles-button";
    const subtitleButton = document.querySelector(subtitleButtonSelector);
    console.log("[DUAL SUBS] BBB");
    if (subtitleButton && subtitleButton.getAttribute("aria-pressed") === "true") {
      console.log("[DUAL SUBS] YouTube's subtitle is switched on, switching it off...");
      subtitleButton.click();
    }
    console.log("[DUAL SUBS] CCC");
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
        const initialEntryCount = performance.getEntriesByType("resource").length;
        setTimeout(() => {
          const entries = performance.getEntriesByType("resource");
          const newEntries = entries.slice(initialEntryCount);
          for (const entry of newEntries) {
            if (entry.name.includes("timedtext") && entry.name.includes("&pot=")) {
              console.log("[DUAL SUBS] Found timedtext request:", entry.name);
              resolve(entry.name);
              return;
            }
          }

          // No timedtext request found
          resolve(null);
        }, 500);
      });
    };

    const isMobile = location.href.startsWith("https://m.youtube.com");
    const subtitleButtonSelector = isMobile ? ".ytmClosedCaptioningButtonButton" : ".ytp-subtitles-button";

    if (isMobile) document.querySelector("#movie_player").click();

    // Start listening BEFORE clicking
    const timedtextPromise = listenForTimedtext();

    async function findSubtitleButtonWithRetry(subtitleButtonSelector, maxAttempts = 3, delayMs = 1000) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const subtitleButton = document.querySelector(subtitleButtonSelector);
        if (subtitleButton) return subtitleButton;
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
      return null;
    }

    const subtitleButton = await findSubtitleButtonWithRetry(subtitleButtonSelector);
    if (!subtitleButton) return;

    // Rapidly toggle the button twice, result in a req to the url
    // (failed req is fine, we just want the url)
    subtitleButton.click();
    subtitleButton.click();

    // Now wait for the result
    const timedtextUrl = await timedtextPromise;

    setTimeout(() => ensureVideoPlaying(), 500);
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
    console.log(`[DUAL SUBS] Removing Subtitles.`);
    const video = document.getElementsByTagName("video")[0];
    if (!video) return;
    const tracks = video.getElementsByTagName("track");
    console.log(`[DUAL SUBS] Removing tracks ${tracks}.`);
    Array.from(tracks).forEach(function (ele) {
      ele.track.mode = "hidden";
      ele.parentNode.removeChild(ele);
    });
  }
})();
