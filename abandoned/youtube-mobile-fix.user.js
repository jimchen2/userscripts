// ==UserScript==
// @name         YouTube Mobile Duration
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Adds a Duration filter (Under 4m, 4-20m, Over 20m) to m.youtube.com search results page using polling.
// @author       Jim Chen
// @match        https://m.youtube.com/results*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const DURATION_FILTER_ID = "userscript-duration-filter";
  const TARGET_SELECTOR = "ytm-search-sub-menu-renderer"; // The element containing the filters
  const MAX_ATTEMPTS = 2;
  const POLL_INTERVAL = 2000;
  let attempts = 0;

  const durationOptions = {
    any: { text: "Duration", sp: null },
    short: { text: "Under 4 minutes", sp: "EgQQARgB" },
    medium: { text: "4 - 20 minutes", sp: "EgQQARgD" },
    long: { text: "Over 20 minutes", sp: "EgQQARgC" },
  };

  function addDurationFilter(filterBar) {
    // Double-check inside function
    if (!filterBar || document.getElementById(DURATION_FILTER_ID)) {
      return;
    }

    const filterGroup = document.createElement("ytm-search-filter-group-renderer");
    filterGroup.setAttribute("data-has-options", "true");
    filterGroup.id = DURATION_FILTER_ID;
    const selectWrapper = document.createElement("ytm-select");
    const selectElement = document.createElement("select");
    selectElement.className = "select"; // Try to match YT styling
    Object.keys(durationOptions).forEach((key) => {
      const optionInfo = durationOptions[key];
      const optionElement = document.createElement("option");
      optionElement.className = "option"; // Try to match YT styling
      optionElement.value = key;
      optionElement.textContent = optionInfo.text;
      selectElement.appendChild(optionElement);
    });
    const currentUrlParams = new URLSearchParams(window.location.search);
    const currentSp = currentUrlParams.get("sp");
    let currentKey = "any"; // Default to 'any'
    for (const key in durationOptions) {
      if (durationOptions[key].sp && durationOptions[key].sp === currentSp) {
        currentKey = key;
        break;
      }
    }
    selectElement.value = currentKey; // Set the dropdown to the current filter
    selectWrapper.appendChild(selectElement);
    filterGroup.appendChild(selectWrapper);
    filterBar.appendChild(filterGroup);
    selectElement.addEventListener("change", function () {
      const selectedKey = this.value;
      const selectedSp = durationOptions[selectedKey].sp;
      navigateToNewUrl(selectedSp);
    });
  }

  function navigateToNewUrl(durationSpValue) {
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;
    const currentSp = params.get("sp"); // Get current SP value before modifying
    let isCurrentSpKnownDuration = false;
    for (const key in durationOptions) {
      if (durationOptions[key].sp && durationOptions[key].sp === currentSp) {
        isCurrentSpKnownDuration = true;
        break;
      }
    }

    if (durationSpValue) {
      params.set("sp", durationSpValue);
    } else {
      if (isCurrentSpKnownDuration) {
        params.delete("sp");
      }
    }

    currentUrl.search = params.toString();
    if (window.location.href !== currentUrl.toString()) window.location.href = currentUrl.toString();
  }

  function tryAddFilter() {
    if (document.getElementById(DURATION_FILTER_ID)) return;
    const filterBar = document.querySelector(TARGET_SELECTOR);

    if (filterBar) {
      addDurationFilter(filterBar);
    } else {
      attempts++;
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(tryAddFilter, POLL_INTERVAL);
      }
    }
  }
  setTimeout(tryAddFilter, 1000);
})();
