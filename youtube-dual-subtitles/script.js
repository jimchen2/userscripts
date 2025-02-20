// ==UserScript==
// @name         YouTube Dual Subtitles for French, German, Russian, Ukrainian
// @namespace    http://tampermonkey.net/
// @version      1.1
// @license      Unlicense
// @description  Add dual subtitles to YouTube videos
// @author       Jim Chen
// @homepage     https://jimchen.me
// @supportURL   https://github.com/jimchen2/youtube-dual-subtitles/issues
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://cdn.jimchen.me/*
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/jimchen2/userscripts/refs/heads/main/youtube-dual-subtitles/script.js
// @downloadURL  https://raw.githubusercontent.com/jimchen2/userscripts/refs/heads/main/youtube-dual-subtitles/script.js
// ==/UserScript==
(function () {
  "use strict";

  console.log("[Dual Subs] Script initialized");

  let processingSubtitles = false;

  async function handleVideoNavigation() {
    console.log("[Dual Subs] Navigation detected");
    if (!isYouTubeVideo()) {
      console.log("[Dual Subs] Isn't YouTube Video");
      return;
    }
    if (processingSubtitles) return;
    processingSubtitles = true;
    removeSubs();
    await processSubtitles();
    processingSubtitles = false;
  }

  async function processSubtitles() {
    console.log("[Dual Subs] Starting subtitle processing");

    const playerData = await new Promise((resolve) => {
      const checkForPlayer = () => {
        console.log("[Dual Subs] Trying to get Caption Data");
        let ytAppData;
        if (window.location.href.startsWith("https://www.youtube")) ytAppData = document.getElementsByTagName("ytd-app");
        else ytAppData = document.getElementsByTagName("ytm-app");
        const captionData = ytAppData[0].data?.playerResponse?.captions?.playerCaptionsTracklistRenderer.captionTracks;
        if (captionData) {
          console.log("[Dual Subs] Successfully retrieved caption data");
          resolve(captionData);
        } else {
          console.log("[Dual Subs] Caption data not found, retrying");
          setTimeout(checkForPlayer, 1000);
        }
      };
      checkForPlayer();
    });

    if (!playerData) {
      console.log("[Dual Subs] No player data available");
      return;
    }

    await addSubtitles(playerData);
  }

  async function addSubtitles(playerData) {
    console.log("[Dual Subs] Finding auto-generated track");

    const hasForeignTrack = playerData.some((track) => ["a.ru", "a.uk", "a.de", "a.fr", ".ru", ".uk", ".de", ".fr"].includes(track.vssId));

    if (hasForeignTrack) {
      const autoGeneratedTrack = playerData.find((track) => ["a.ru", "a.uk", "a.de", "a.fr"].includes(track.vssId));
      const manualTrack = playerData.find((track) => [".ru", ".uk", ".de", ".fr"].includes(track.vssId));
      const otherTrack = autoGeneratedTrack || manualTrack;
      if (!otherTrack) {
        console.log("[Dual Subs] I am not learning the language of the video");
        return;
      }
      await addOneSubtitle(`${otherTrack.baseUrl}&fmt=vtt&tlang=en`);
      await addOneSubtitle(`${otherTrack.baseUrl}&fmt=vtt`);
    } else {
      const otherTrack = playerData.find((track) => ["a.en", "en"].includes(track.vssId));
      await addOneSubtitle(`${otherTrack.baseUrl}&fmt=vtt`);
      await addOneSubtitle(`${otherTrack.baseUrl}&fmt=vtt&tlang=de`);
    }
  }

  async function addOneSubtitle(url, maxRetries = 5, delay = 1000) {
    const video = document.querySelector("video");

    try {
      console.log(`[Dual Subs] Fetching subtitles`);
      const response = await fetch(url);
      const subtitleData = (await response.text()).replaceAll("align:start position:0%", "");
      const track = document.createElement("track");
      track.src = "data:text/vtt," + encodeURIComponent(subtitleData);
      await new Promise((resolve) => setTimeout(resolve, delay));
      video.appendChild(track);
      track.track.mode = "showing";
      console.log(`[Dual Subs] Successfully added one subtitle`);
    } catch (error) {
      if (maxRetries > 0) {
        console.log(`[Dual Subs] Retrying... (${maxRetries} attempts remaining)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return addOneSubtitle(url, maxRetries - 1, delay);
      }
    }
  }

  function isYouTubeVideo() {
    const url = window.location.href;

    const videoPatterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?/, // Regular youtube.com/watch
      /^https?:\/\/(www\.)?youtube\.com\/embed\//, // Embedded videos
      /^https?:\/\/m\.youtube\.com\/watch\?/, // Mobile youtube
    ];

    // Return true if any pattern matches
    return videoPatterns.some((pattern) => pattern.test(url));
  }

  function removeSubs() {
    console.log("[Dual Subs] Attempting to remove subtitles");
    const video = document.getElementsByTagName("video")[0];
    if (!video) return;
    const tracks = video.getElementsByTagName("track");
    Array.from(tracks).forEach(function (ele) {
      ele.track.mode = "hidden";
      ele.parentNode.removeChild(ele);
    });
    console.log(`[Dual Subs] Successfully removed ${tracks.length} subtitle track(s)`);
  }

  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      handleVideoNavigation();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  handleVideoNavigation();
})();
