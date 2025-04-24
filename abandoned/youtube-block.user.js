// ==UserScript==
// @name         YouTube Blocker
// @description  YouTube Blocker
// @namespace    http://tampermonkey.net/
// @version      2.1
// @author       Jim Chen
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @grant        none
// ==/UserScript==

// Functionality
// 1. Block Videos for Search Results
// 2. Block Shorts for Search Results
// 3. Block Videos for Recommendation
// 4. Block Shorts for Recommendation
// 5. Block Channels Homepage

(function () {
  "use strict";

  // List of channels to block
  const blockedChannels = [
    "CNN",
    "The Military Show",
    "Jimmy Kimmel Live",
    "FOX 5 New York",
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
    "Bloomberg News",
    "PBS NewsHour",
    "DW News",
    "FRANCE 24 English",
    "Bloomberg Television",
    "euronews",
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
    "24 Канал",
    "FREEДOM",
    "5 канал",
    "RFU News — Reporting from Ukraine",
    "Kanal13",
    "Hindustan Times",
    "ABC News",
    "WION",
  ];

  function checkChannelPage() {
    const getChannelName = (title) => title.replace(/ - YouTube$/, "");

    const checkTitle = () => {
      const title = document.querySelector("title");
      if (title) {
        const channelName = getChannelName(title.textContent);
        if (blockedChannels.includes(channelName)) window.location.href = "https://jw.ustc.edu.cn";
        return;
      }
    };

    checkTitle();
  }
  function checkShortsPage() {
    if (window.location.pathname.startsWith("/shorts/")) window.location.href = "https://jw.ustc.edu.cn";
  }
  const removeShorts = () => {
    const shortsLinks = document.querySelectorAll('a[href^="/shorts"]');
    shortsLinks.forEach((link) => {
      // WARNING: PLATFORM SPECIFIC FEATURE, MAY BREAK IN THE FUTURE
      const itemElement = link.closest(`
              ytm-shorts-lockup-view-model
          `);

      if (itemElement) {
        console.log(itemElement);
        itemElement.remove();
      }
    });
  };

  const blockChannelsInList = (renderers, channelSelector) => {
    renderers.forEach((renderer) => {
      const channelNameElement = renderer.querySelector(channelSelector);
      let channelName = "";
      if (channelNameElement) channelName = channelNameElement.textContent.trim();
      if (channelName && blockedChannels.some((blocked) => channelName === blocked)) {
        renderer.remove();
      }
    });
  };

  const blockChannels = () => {
    const isMobile = window.location.hostname === "m.youtube.com";

    if (window.location.pathname === "/results") {
      // Search Results
      if (isMobile) {
        // WARNING: PLATFORM SPECIFIC FEATURE, MAY BREAK IN THE FUTURE
        blockChannelsInList(document.querySelectorAll("ytm-compact-video-renderer, ytm-video-with-context-renderer"), ".ytm-badge-and-byline-item-byline");
      } else {
        // WARNING: PLATFORM SPECIFIC FEATURE, MAY BREAK IN THE FUTURE
        blockChannelsInList(document.querySelectorAll("ytd-video-renderer"), "#channel-name #text-container yt-formatted-string a");
      }
    } else if (window.location.pathname === "/watch") {
      // Watch Page (Recommendations)
      if (isMobile) {
        // WARNING: PLATFORM SPECIFIC FEATURE, MAY BREAK IN THE FUTURE
        blockChannelsInList(document.querySelectorAll("ytm-video-with-context-renderer"), ".ytm-badge-and-byline-item-byline");
      } else {
        // WARNING: PLATFORM SPECIFIC FEATURE, MAY BREAK IN THE FUTURE
        blockChannelsInList(document.querySelectorAll("#related ytd-compact-video-renderer"), "#channel-name #text");
      }
    }
  };

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const runFilters = () => {
    console.log("FILTERS RUNNING"); // Indicate filters are actually executing
    removeShorts();
    blockChannels();
  };

  const debouncedRunFilters = debounce(runFilters, 500);

  // WARNING: PLATFORM SPECIFIC FEATURE, MAY BREAK IN THE FUTURE
  // Copy from above basically
  const relevantSelectors = [
    "ytd-video-renderer",
    "ytd-compact-video-renderer",
    "ytm-shorts-lockup-view-model", // Shorts
    "ytm-video-with-context-renderer",
  ].join(",");

  // Smarter Mutation Observer Callback
  const observerCallback = (mutationsList) => {
    let needsFilter = false;
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches(relevantSelectors) || node.querySelector(relevantSelectors)) {
              needsFilter = true;
              break;
            }
          }
        }
      }
      if (needsFilter) {
        break;
      }
    }

    if (needsFilter) {
      debouncedRunFilters();
    }
  };

  const observer = new MutationObserver(observerCallback);

  const startObserver = () => {
    const targetNode = document.querySelector("ytd-app, ytm-app");
    if (targetNode) {
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
      });
      runFilters();
    } else {
      setTimeout(startObserver, 500);
    }
  };

  window.addEventListener("yt-navigate-finish", (event) => {
    checkShortsPage();
    checkChannelPage();
    runFilters();
  });

  requestAnimationFrame(startObserver);
})();
