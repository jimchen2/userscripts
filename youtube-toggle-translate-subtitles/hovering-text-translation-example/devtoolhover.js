// Find text elements inside elements with class "randomclass"
const textElements = document.querySelectorAll('.randomclass p, .randomclass h2, .randomclass h1');

// Process each text element
textElements.forEach(element => {
  // Get the original text content
  const originalText = element.textContent;
  
  // Split the text into words
  const words = originalText.split(/\s+/);
  
  // Create a new HTML structure with each word in its own span
  const newHtml = words.map(word => 
    `<span class="hoverable-word" style="display:inline-block; margin-right:4px;">${word}</span>`
  ).join(' ');
  
  // Replace the element's content with the new structure
  element.innerHTML = newHtml;
});

// Function to translate text using Google Translate API
async function translateToRussian(text) {
  try {
    // Using the client-side translation approach with fetch API
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ru&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    
    // Google Translate response format is a bit complex - this gets the translation
    const translation = data[0][0][0];
    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    return "Translation failed";
  }
}

// Set up event listeners for the individual word spans
let loggingInterval = null;
let currentElement = null;

document.querySelectorAll('.hoverable-word').forEach(wordSpan => {
  wordSpan.addEventListener('mouseenter', async function() {
    currentElement = this;
    if (loggingInterval) clearInterval(loggingInterval);
    
    const word = this.textContent.trim();
    console.log("Hovering over:", word);
    
    // Translate immediately on hover
    try {
      const translation = await translateToRussian(word);
      console.log(`Translation to Russian: "${word}" → "${translation}"`);
    } catch (error) {
      console.error("Translation failed:", error);
    }
    
    // Set interval for continued hovering
    loggingInterval = setInterval(async () => {
      const currentWord = currentElement.textContent.trim();
      console.log("Still hovering over:", currentWord);
      
      try {
        const translation = await translateToRussian(currentWord);
        console.log(`Translation to Russian: "${currentWord}" → "${translation}"`);
      } catch (error) {
        console.error("Translation failed:", error);
      }
    }, 1000);
  });
  
  wordSpan.addEventListener('mouseleave', function() {
    if (loggingInterval) {
      clearInterval(loggingInterval);
      loggingInterval = null;
    }
    currentElement = null;
  });
});

console.log(`Hover listener with Russian translation set up for individual words within 'randomclass' text elements`);
