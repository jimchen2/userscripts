// ==UserScript==
// @name         LLM tamper tool
// @namespace    http://tampermonkey.net/
// @version      1.0
// @license      Unlicense
// @description  LLM tampering
// @match        *://*.aistudio.google.com/*
// @author       Jim Chen
// @homepage     https://jimchen.me
// @grant        none
// ==/UserScript==

(function() {
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkInterval = setInterval(() => {
                const element = document.querySelector(selector);
                
                if (element) {
                    clearInterval(checkInterval);
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }
            }, 100);
        });
    }

    // Main function
    async function addSystemInstructions() {
        try {
            // Wait for and click the system instructions button
            const button = await waitForElement('button[data-test-system-instructions-card]');
            console.log('Found system instructions button, clicking...');
            button.click();

            // Wait a bit for the dialog to open
            await new Promise(resolve => setTimeout(resolve, 500));

            // Wait for the textarea to appear
            const textarea = await waitForElement('textarea[aria-label="System instructions"]');
            console.log('Found textarea, adding instructions...');

            // Add your custom text here
            const customInstructions = `You are a helpful assistant.
Please be concise and clear in your responses.
Focus on accuracy and provide sources when possible.`;

            // Set the textarea value
            textarea.value = customInstructions;
            
            // Trigger input event to ensure the change is registered
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log('System instructions added successfully!');

        } catch (error) {
            console.error('Error in addSystemInstructions:', error);
        }
    }

    // Run the script after page loads
    // You can adjust the delay or trigger it differently based on your needs
    window.addEventListener('load', () => {
        setTimeout(addSystemInstructions, 2000); // Wait 2 seconds after page load
    });

    // Alternative: Add a keyboard shortcut to trigger it manually
    document.addEventListener('keydown', (e) => {
        // Press Ctrl+Shift+I to trigger the script
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            addSystemInstructions();
        }
    });

})();