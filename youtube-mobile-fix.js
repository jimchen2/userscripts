// ==UserScript==
// @name         YouTube Mobile Fix
// @namespace    http://tampermonkey.net/
// @version      1.3  
// @description  Adds a Duration filter (Under 4m, 4-20m, Over 20m) to the m.youtube.com search results page.
// @author       Jim Chen
// @match        https://m.youtube.com/results*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const DURATION_FILTER_ID = 'userscript-duration-filter';

    // --- Configuration ---
    const durationOptions = {
        'any': { text: 'Duration', sp: null },
        'short': { text: 'Under 4 minutes', sp: 'EgQQARgB' },
        'medium': { text: '4 - 20 minutes', sp: 'EgQQARgD' },
        'long': { text: 'Over 20 minutes', sp: 'EgQQARgC' }
    };

    // --- Core Logic ---

    function addDurationFilter(filterBar) {
        if (document.getElementById(DURATION_FILTER_ID)) {
            return;
        }

        // 1. Create the filter group structure
        const filterGroup = document.createElement('ytm-search-filter-group-renderer');
        filterGroup.setAttribute('data-has-options', 'true');
        filterGroup.id = DURATION_FILTER_ID;

        const selectWrapper = document.createElement('ytm-select');
        const selectElement = document.createElement('select');
        selectElement.className = 'select';

        // 2. Create and add options
        Object.keys(durationOptions).forEach(key => {
            const optionInfo = durationOptions[key];
            const optionElement = document.createElement('option');
            optionElement.className = 'option';
            optionElement.value = key;

            const spanElement = document.createElement('span');
            spanElement.className = 'yt-core-attributed-string';
            spanElement.setAttribute('role', 'text');
            spanElement.textContent = optionInfo.text; // Use textContent, safer than innerHTML

            optionElement.appendChild(spanElement);
            selectElement.appendChild(optionElement);
        });

        // 3. Clone the dropdown icon (avoids TrustedHTML error)
        const existingIcon = filterBar.querySelector('c3-icon.select-icon');
        let iconClone = null;
        if (existingIcon) {
            iconClone = existingIcon.cloneNode(true); // Deep clone the existing icon
        } else {
            console.warn("Could not find existing icon to clone. Filter might look slightly off.");
            iconClone = document.createElement('c3-icon'); // Create empty element if clone fails
            iconClone.className = 'select-icon';
            iconClone.setAttribute('fill-icon', 'false');
        }


        // 4. Assemble the elements
        selectWrapper.appendChild(selectElement);
        if (iconClone) { // Only append if we successfully created/cloned it
           selectWrapper.appendChild(iconClone);
        }
        filterGroup.appendChild(selectWrapper);

        const existingFilters = filterBar.querySelectorAll('ytm-search-filter-group-renderer');
        if (existingFilters.length > 0) {
            filterBar.insertBefore(filterGroup, existingFilters[existingFilters.length - 1]); // Insert before the last one (usually upload date)
        } else {
            filterBar.appendChild(filterGroup); // Fallback: append if no others found
        }
        console.log('Duration filter added.');

        selectElement.addEventListener('change', function() {
            const selectedKey = this.value;
            const selectedSp = durationOptions[selectedKey].sp;
            navigateToNewUrl(selectedSp);
        });

        setSelectedOptionFromUrl(selectElement);
    }

    function navigateToNewUrl(durationSpValue) {
        const currentUrl = new URL(window.location.href);
        const params = currentUrl.searchParams;

        if (durationSpValue) {
            params.set('sp', durationSpValue);
            console.log(`Setting sp parameter to: ${durationSpValue}`);
        } else {
            const currentSp = params.get('sp');
            let knownDurationSp = false;
            for (const key in durationOptions) {
                if (durationOptions[key].sp && durationOptions[key].sp === currentSp) { // Check if sp exists before comparing
                    knownDurationSp = true;
                    break;
                }
            }
            if (knownDurationSp) {
                 params.delete('sp');
                 console.log('Removing duration-specific sp parameter.');
            } else {
                console.log('Keeping existing non-duration sp parameter when selecting Any Duration.');
            }
        }

        if (!params.has('search_query')) {
             console.warn("Search query parameter missing! Attempting to preserve.");
             const queryInput = document.querySelector('input[name="search_query"], input#search'); // Try common selectors
             if(queryInput && queryInput.value) {
                 params.set('search_query', queryInput.value);
             } else {
                // Try getting from URL path if it's like /results/search_query/QUERY
                const pathParts = currentUrl.pathname.split('/');
                if (pathParts.length > 2 && pathParts[1] === 'results' && pathParts[2] === 'search_query') {
                     params.set('search_query', decodeURIComponent(pathParts[3]));
                }
             }
        }

        currentUrl.search = params.toString();

        if (window.location.href !== currentUrl.toString()) {
            window.location.href = currentUrl.toString();
        } else {
            console.log("URL unchanged, skipping navigation.");
        }
    }

    function setSelectedOptionFromUrl(selectElement) {
        const currentUrl = new URL(window.location.href);
        const currentSp = currentUrl.searchParams.get('sp');

        let foundMatch = false;
        if (currentSp) {
            for (const key in durationOptions) {
                if (durationOptions[key].sp === currentSp) {
                    selectElement.value = key;
                    foundMatch = true;
                    break;
                }
            }
        }

        if (!foundMatch) {
             selectElement.value = 'any'; // Default to 'any' if no match or no sp param
        }
    }

    const targetSelector = 'ytm-search-sub-menu-renderer';

    const observer = new MutationObserver((mutationsList, obs) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    // Check if the added node itself is the target or contains the target
                    if (node.nodeType === Node.ELEMENT_NODE) {
                         if (node.matches(targetSelector) || node.querySelector(targetSelector)) {
                            const filterBar = document.querySelector(targetSelector);
                             if (filterBar && !document.getElementById(DURATION_FILTER_ID)) {
                                addDurationFilter(filterBar);
                             }
                         }
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const initialFilterBar = document.querySelector(targetSelector);
    if (initialFilterBar && !document.getElementById(DURATION_FILTER_ID)) {
        addDurationFilter(initialFilterBar);
    }

})();