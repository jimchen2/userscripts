// ==UserScript==
// @name         Bilibili Search and Video Control Shortcuts with Element Blocking
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Press "/" to focus Bilibili search bar, video control shortcuts (Shift+>/<, j,k,l), 0-9 for seeking, and blocks specified elements
// @author       Jim Chen
// @match        *://*.bilibili.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function blockElements() {
        // Create style element to hide specified classes
        const style = document.createElement('style');
       style.textContent = `
            .bili-feed4-layout,
            .header-channel,
            .palette-button-outer.palette-feed4,
            .bili-header__banner,
            .bili-header__channel,
            .bili-header__bar .left-entry,
            .bili-header__bar .right-entry,
            .search-panel,
            .bili-mini-mask,
            #bili-header-container {
                display: none !important;
            }
            .nav-search-input::placeholder {
                color: transparent !important;
            }
        `;
        document.head.appendChild(style);

        // Remove placeholder text directly
        const searchInput = document.querySelector('.nav-search-input');
        if (searchInput) {
            searchInput.removeAttribute('placeholder');
        }
    }

    // Run blocking function when DOM is loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        blockElements();
    } else {
        document.addEventListener('DOMContentLoaded', blockElements);
    }

    // Existing keyboard shortcut functionality
    document.addEventListener('keydown', function(e) {
        // Don't trigger shortcuts when typing in input fields
        if (/input|textarea/i.test(document.activeElement.tagName)) {
            return;
        }

        // Search bar focus shortcut
        if (e.key === '/') {
            e.preventDefault();
            const selector = window.location.href.startsWith('https://search.bilibili.com/')
                ? 'input[placeholder="输入关键字搜索"]'
                : '.nav-search-input';
            const searchInput = document.querySelector(selector);
            if (searchInput) searchInput.focus();
            return;
        }

        // Video control shortcuts
        const video = document.querySelector('video');
        if (!video) return;

        // Number keys 0-9 for seeking (YouTube-like functionality)
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            const percentage = parseInt(e.key) * 10; // Convert 0-9 to 0%-90%
            video.currentTime = (percentage / 100) * video.duration;
            return;
        }

        // Existing video controls
        if (e.shiftKey && e.key === '>') {
            e.preventDefault();
            video.playbackRate = Math.min(video.playbackRate + 0.5, 2);
        } else if (e.shiftKey && e.key === '<') {
            e.preventDefault();
            video.playbackRate = Math.max(video.playbackRate - 0.5, 0.5);
        } else if (e.key === 'j') {
            e.preventDefault();
            video.currentTime = Math.max(video.currentTime - 10, 0);
        } else if (e.key === 'k') {
            e.preventDefault();
            if (video.paused) video.play();
            else video.pause();
        } else if (e.key === 'l') {
            e.preventDefault();
            video.currentTime = Math.min(video.currentTime + 10, video.duration);
        }
    });
})();