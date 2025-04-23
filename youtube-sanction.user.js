// ==UserScript==
// @name         YouTube Shorts Blocker and Extremist Content Blocker
// @description  Sanctioning YouTube Channels
// @namespace    http://tampermonkey.net/
// @version      1.3
// @author       Jim Chen
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // List of channels to block
  const extremistChannels = [
    "CNN",
    "The Military Show",
    "Jimmy Kimmel Live",
    "Sky News",
    "Brian Tyler Cohen",
    "David Pakman Show",
    "Bernie Sanders",
    "Robert Reich",
    "Fox News",
    "LiveNOW from FOX",
    "Sky News Australia",
    "Donald J Trump",
    "Ben Shapiro",
    "Tucker Carlson",
    "Candace Owens",
    "TV Rain",
    "Телеканал Дождь",
    "NEXTA",
    "NEXTA Live",
    "Алексей Навальный",
    "Навальный LIVE",
    "Ходорковский LIVE",
  ];

  // Channel Page Block
  if (window.location.href.match(/youtube\.com\/((@[^\/]+)|user\/|c\/|channel\/)/)) {
    setTimeout(() => {
      const channelNameElement = document.querySelector(".page-header-view-model-wiz__page-header-title h1.dynamic-text-view-model-wiz__h1");
      if (channelNameElement) {
        const channelName = channelNameElement.textContent.trim();
        if (extremistChannels.some((channel) => channelName.toLowerCase() === channel.toLowerCase())) {
          window.location.href = "https://jw.ustc.edu.cn";
        }
      }
    }, 500);
  }

  const shortsPageRegex = /^https:\/\/www\.youtube\.com\/shorts.*/;
  if (shortsPageRegex.test(window.location.href)) {
    window.location.href = "https://jw.ustc.edu.cn";
  }
  // Function to remove Shorts from feed
  const removeShorts = () => {
    Array.from(document.querySelectorAll(`a[href^="/shorts"]`)).forEach((a) => {
      let parent = a.parentElement;

      while (parent && (!parent.tagName.startsWith("YTD-") || parent.tagName === "YTD-THUMBNAIL")) {
        parent = parent.parentElement;
      }

      if (parent) {
        parent.remove();
      }
    });
  };

  // Function to block channels
  const blockChannels = () => {
    if (window.location.href.match(/youtube\.com\/results/)) {
      const searchRenderers = document.querySelectorAll("ytd-video-renderer");
      searchRenderers.forEach((renderer) => {
        const channelNameElement = renderer.querySelector("ytd-channel-name yt-formatted-string");
        if (channelNameElement && extremistChannels.some((channel) => channelNameElement.textContent.trim().toLowerCase() === channel.toLowerCase())) {
          renderer.remove();
        }
      });
    }

    if (window.location.href.match(/youtube\.com\/watch/)) {
      const recommendedRenderers = document.querySelectorAll("ytd-compact-video-renderer");
      recommendedRenderers.forEach((renderer) => {
        const channelNameElement = renderer.querySelector("ytd-channel-name yt-formatted-string");
        if (channelNameElement && extremistChannels.some((channel) => channelNameElement.textContent.trim().toLowerCase() === channel.toLowerCase())) {
          renderer.remove();
        }
      });
    }
  };

  const runFilters = () => {
    removeShorts();
    blockChannels();
  };

  const observer = new MutationObserver(runFilters);

  // Start observing main app container
  let targetNode = null;

  // Check if we're on mobile or desktop YouTube
  if (window.location.hostname === "m.youtube.com") {
    // Mobile YouTube
    targetNode = document.querySelector("ytm-app");
  } else {
    // Desktop YouTube
    targetNode = document.querySelector("ytd-app");
  }

  if (targetNode) {
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });
  }

  // Initial cleanup
  runFilters();
})();
