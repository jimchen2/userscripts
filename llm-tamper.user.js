// ==UserScript==
// @name         LMArena Auto Setup
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Auto redirect to direct mode and select Claude Opus model on lmarena.ai
// @author       Jim Chen
// @match        https://lmarena.ai/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Function to wait for element to appear
    function waitForElement(selector, callback, maxAttempts = 20) {
        let attempts = 0;
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            attempts++;
            if (element) {
                clearInterval(interval);
                callback(element);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.log(`Element ${selector} not found after ${maxAttempts} attempts`);
            }
        }, 500);
    }

    // Function to click
    function selectClaudeOpus() {
        // First, find and click the MODEL dropdown button (not the mode selector)
        // Target the button that contains the model text or has model-dropdown data attribute
        waitForElement('button[data-sentry-source-file="model-dropdown.tsx"]', (button) => {
            console.log('Found model dropdown button, clicking...');
            button.click();
            
            // Wait a bit for the dropdown to open
            setTimeout(() => {
                // Look for the Claude Opus option
                const options = document.querySelectorAll('[role="option"]');
                let claudeOption = null;
                
                options.forEach(option => {
                    // Check both the data-value attribute and text content
                    const dataValue = option.getAttribute('data-value');
                    const textContent = option.textContent || '';
                    
                    if (dataValue && dataValue.includes('claude-3-5-sonnet-20241022')) {
                        claudeOption = option;
                    } 
                });
                
                if (claudeOption) {
                    console.log('Found Claude Opus option, clicking...');
                    claudeOption.click();
                } else {
                }
            }, 500);
        });
    }

    // Main logic
    function main() {
        const currentUrl = window.location.href;
        const directModeUrl = 'https://lmarena.ai/?mode=direct';
        const leaderboardUrl = 'https://lmarena.ai/leaderboard';
        
        // Check if we need to redirect
        if (!currentUrl.startsWith(directModeUrl) && !currentUrl.startsWith(leaderboardUrl)) {
            console.log('Redirecting to direct mode...');
            window.location.href = directModeUrl;
            return;
        }
        
        // If we're on the leaderboard, don't do anything else
        if (currentUrl.startsWith(leaderboardUrl)) {
            console.log('On leaderboard page, staying here');
            return;
        }
        
        // If we're on direct mode, select Claude Opus
        if (currentUrl.startsWith(directModeUrl)) {
            console.log('On direct mode, selecting Claude Opus...');
            // Wait a bit for the page to fully load
            setTimeout(() => {
                // Try primary method first
                const modelDropdownButton = document.querySelector('button[data-sentry-source-file="model-dropdown.tsx"]');
                if (modelDropdownButton) {
                    selectClaudeOpus();
                } else {
                }
            }, 1000);
        }
    }

    // Run the main function
    main();
    
})();
