// ==UserScript==
// @name         YouTube Sanctions
// @description  YouTube Shorts Blocker and Extremist Content Blocker
// @namespace    http://tampermonkey.net/
// @version      1.4
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
    "Times Radio",
    "The Hill",
    "MSNBC",
    "CBS News",
    "Brian Tyler Cohen",
    "David Pakman Show",
    "Bernie Sanders",
    "Robert Reich",
    "Fox News",
    "Fox Business",
    "LiveNOW from FOX",
    "FOX 9 Minneapolis-St. Paul",
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

  // Function to check if we're on a channel page
  function isChannelPage() {
    return window.location.href.match(
      /(?:m\.)?youtube\.com\/(?!(results|watch|feed|playlist|shorts|embed|live|account|gaming|reporthistory|t\/|clip\/|hashtag\/|explore))([^\/\?]+$|(@[^\/]+)|user\/|c\/|channel\/)/
    );
  }

  // Function to check and block channel page
  function checkChannelPage() {
    if (!isChannelPage()) return;
    
    const checkChannelName = () => {
      // For desktop YouTube
      let channelNameElement = document.querySelector(".page-header-view-model-wiz__page-header-title h1.dynamic-text-view-model-wiz__h1");
      
      // For mobile YouTube
      if (!channelNameElement) {
        channelNameElement = document.querySelector("h1.channel-name");
      }
      
      if (channelNameElement) {
        const channelName = channelNameElement.textContent.trim();
        if (channelName) {
          if (extremistChannels.some((channel) => channelName.toLowerCase() === channel.toLowerCase())) {
            window.location.href = "https://jw.ustc.edu.cn";
            return true;
          }
          return true;
        }
      }
      
      // If element not found but we're on a channel page, keep trying
      if (isChannelPage()) {
        setTimeout(checkChannelName, 500); // Retry after 500ms
      }
      return false;
    };
    
    checkChannelName();
  }

  // Check for Shorts page
  function checkShortsPage() {
    const shortsPageRegex = /^https:\/\/(?:www|m)\.youtube\.com\/shorts.*/;
    if (shortsPageRegex.test(window.location.href)) {
      window.location.href = "https://jw.ustc.edu.cn";
    }
  }

  // Function to remove Shorts from feed
  const removeShorts = () => {
    Array.from(document.querySelectorAll(`a[href^="/shorts"]`)).forEach((a) => {
      let parent = a.parentElement;

      while (parent && (!(parent.tagName.startsWith("YTD-") || parent.tagName.startsWith("YTM-")) || parent.tagName === "YTD-THUMBNAIL" || parent.tagName === "YTM-THUMBNAIL")) {
        parent = parent.parentElement;
      }

      if (parent) {
        parent.remove();
      }
    });
  };

  const blockChannels = () => {
    // Check if we're on YouTube search results
    if (window.location.href.match(/youtube\.com\/results/)) {
      if (window.location.href.startsWith("https://m.youtube.com")) {
        const mobileSearchResults = document.querySelectorAll("ytm-compact-video-renderer, ytm-video-with-context-renderer");
        mobileSearchResults.forEach((renderer) => {
          const channelNameElements = renderer.querySelectorAll(".ytm-badge-and-byline-item-byline .yt-core-attributed-string");

          for (const element of channelNameElements) {
            const channelName = element.textContent.trim();
            if (extremistChannels.some((channel) => channelName.toLowerCase() === channel.toLowerCase())) {
              renderer.remove();
              break;
            }
          }
        });
      } else {
        const dismissibleElements = document.querySelectorAll("#dismissible");
        dismissibleElements.forEach((element) => {
          element.remove();
        });

        const searchRenderers = document.querySelectorAll("ytd-video-renderer");
        searchRenderers.forEach((renderer) => {
          const channelNameElement = renderer.querySelector("ytd-channel-name yt-formatted-string");
          if (channelNameElement && extremistChannels.some((channel) => channelNameElement.textContent.trim().toLowerCase() === channel.toLowerCase())) {
            renderer.remove();
          }
        });
      }
    }

    if (window.location.href.match(/youtube\.com\/watch/)) {
      if (window.location.href.startsWith("https://m.youtube.com")) {
        const recommendedRenderers = document.querySelectorAll("ytm-video-with-context-renderer");
        recommendedRenderers.forEach((renderer) => {
          const channelNameElement = renderer.querySelector("ytm-badge-and-byline-renderer .ytm-badge-and-byline-item-byline");
          if (channelNameElement) {
            const channelName = channelNameElement.textContent.trim().toLowerCase();
            if (extremistChannels.some((channel) => channelName === channel.toLowerCase())) {
              renderer.remove();
            }
          }
        });
      } else {
        const recommendedRenderers = document.querySelectorAll("ytd-compact-video-renderer");
        recommendedRenderers.forEach((renderer) => {
          const channelNameElement = renderer.querySelector("ytd-channel-name yt-formatted-string");
          if (channelNameElement && extremistChannels.some((channel) => channelNameElement.textContent.trim().toLowerCase() === channel.toLowerCase())) {
            renderer.remove();
          }
        });
      }
    }
  };

  const runFilters = () => {
    removeShorts();
    blockChannels();
  };

  // Function to run all checks
  function runChecks() {
    checkShortsPage();
    checkChannelPage();
    runFilters();
  }

  // Set up mutation observer for content changes
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

  // Listen for URL changes
  // Override the History API methods
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    runChecks();
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    runChecks();
  };

  // Listen for popstate events (when using back/forward browser buttons)
  window.addEventListener('popstate', runChecks);

  // Initial checks
  runChecks();
})();
