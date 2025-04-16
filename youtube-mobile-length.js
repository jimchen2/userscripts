// ==UserScript==
// @name         YouTube Mobile Video Length Filter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a video length filter to YouTube mobile search
// @author       Jim Chen
// @match        https://m.youtube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    function createDurationFilter() {
        const filterContainer = document.querySelector('ytm-search-sub-menu-renderer');
        if (!filterContainer) return;
        if (filterContainer.querySelector('.duration-filter')) return;
        const filterGroup = document.createElement('ytm-search-filter-group-renderer');
        filterGroup.setAttribute('data-has-options', 'true');
        filterGroup.className = 'duration-filter';

        // Create select container
        const ytmSelect = document.createElement('ytm-select');

        // Create select element
        const select = document.createElement('select');
        select.className = 'select';

        // Duration options
        const options = [
            { text: 'Any length', value: '' },
            { text: 'Under 4 minutes', value: 'short' },
            { text: '4-20 minutes', value: 'medium' },
            { text: 'Over 20 minutes', value: 'long' }
        ];

        // Add options to select
        options.forEach(opt => {
            const option = document.createElement('option');
            option.className = 'option';
            if (opt.value === '') option.setAttribute('selected', 'true');

            const span = document.createElement('span');
            span.className = 'yt-core-attributed-string';
            span.setAttribute('role', 'text');
            span.textContent = opt.text;

            option.appendChild(span);
            option.value = opt.value;
            select.appendChild(option);
        });

        // Create dropdown icon - creating without innerHTML
        const icon = document.createElement('c3-icon');
        icon.className = 'select-icon';
        icon.setAttribute('fill-icon', 'false');

        const iconSpan = document.createElement('span');
        iconSpan.className = 'yt-icon-shape yt-spec-icon-shape';

        const iconDiv = document.createElement('div');
        iconDiv.style.width = '100%';
        iconDiv.style.height = '100%';
        iconDiv.style.display = 'block';
        iconDiv.style.fill = 'currentcolor';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('aria-hidden', 'true');
        svg.style.pointerEvents = 'none';
        svg.style.display = 'inherit';
        svg.style.width = '100%';
        svg.style.height = '100%';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'm18 9.28-6.35 6.35-6.37-6.35.72-.71 5.64 5.65 5.65-5.65z');

        svg.appendChild(path);
        iconDiv.appendChild(svg);
        iconSpan.appendChild(iconDiv);
        icon.appendChild(iconSpan);

        // Assemble the components
        ytmSelect.appendChild(select);
        ytmSelect.appendChild(icon);
        filterGroup.appendChild(ytmSelect);

        // Add event listener to handle filter changes
        select.addEventListener('change', function() {
            const currentUrl = new URL(window.location.href);

            // Remove existing duration parameters
            currentUrl.searchParams.delete('sp');

            // Add the selected duration filter if not "Any length"
            if (this.value) {
                let sp;
                switch(this.value) {
                    case 'short':
                        sp = 'EgIYAQ%253D%253D';
                        break;
                    case 'medium':
                        sp = 'EgIYAw%253D%253D';
                        break;
                    case 'long':
                        sp = 'EgIYAg%253D%253D';
                        break;
                }

                if (sp) {
                    currentUrl.searchParams.set('sp', sp);
                }
            }

            // Navigate to the new URL
            window.location.href = currentUrl.toString();
        });

        // Add the new filter to the container
        filterContainer.appendChild(filterGroup);
    }

    // Function to initialize the script
    function init() {
        // Check if we're on a search page
        if (window.location.pathname.includes('/results')) {
            if (document.querySelector('ytm-search-sub-menu-renderer')) {
                createDurationFilter();
            }
            const observer = new MutationObserver((mutations, obs) => {
                if (document.querySelector('ytm-search-sub-menu-renderer')) {
                    createDurationFilter();
                }
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (location.pathname.includes('/results')) {
                setTimeout(createDurationFilter, 1000);
            }
        }
    }).observe(document, {subtree: true, childList: true});
})();
