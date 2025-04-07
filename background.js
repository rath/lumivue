// --- Constants ---
// const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CONTEXT_MENU_ID = "LUMIVUE_CONTEXT_MENU";

// --- Helper Functions ---

/**
 * Fetches the API key from storage.
 * @returns {Promise<string|null>} The API key or null if not found.
 */
async function getApiKey() {
  const result = await chrome.storage.sync.get('openaiApiKey');
  return result.openaiApiKey || null;
}

/**
 * Calls the OpenAI API.
 * @param {string} apiKey - The OpenAI API key.
 * @param {string} text - The text to process.
 * @returns {Promise<string>} The processed text from OpenAI.
 */
async function callOpenAI(apiKey, text) {
  if (!text || text.trim().length === 0) {
    return "No text provided.";
  }
  if (!apiKey) {
    // Direct the user to the options page if the key is missing
    chrome.runtime.openOptionsPage();
    return "OpenAI API key not set. Please set it in the extension options.";
  }

  // Simple prompt for summarization/explanation
  const system_prompt = String.raw`
You are a specialized AI assistant that translates text into Korean, using language that reflects how Korean boys in their 20s-30s typically communicate.

Your tasks:
1. First, understand and analyze the provided text thoroughly
2. Translate what you read into Korean, adopting the natural speech patterns, vocabulary, and tone that would be used by Korean men in their 20s-30s

Guidelines for the Korean translation:
- Use casual but respectful Korean (반말 mixed with some 존댓말 where appropriate)
- Incorporate contemporary Korean slang and expressions popular among young adult Korean males
- Include some shortened words and contractions common in digital communication
- Use sentence-ending particles like "~야", "~임", "~ㅋㅋ" when appropriate
- Match the energy level and directness typical in male peer-to-peer communication
- Make it sound authentic and natural, as if a Korean man is explaining something to his friends

Your output should be translated Korean text, without any additional commentary or explanation. Just the translation.
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: system_prompt },
          { role: "user", content: text },
        ],
        max_tokens: 500,
        temperature: 0.6,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || "No response from AI.";

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return `Error: ${error.message}`;
  }
}

/**
 * Sends a message to the content script to display the result.
 * @param {number} tabId - The ID of the tab to send the message to.
 * @param {string} resultText - The text to display.
 * @param {object|null} position - The position {x, y} to display the popup near, or null for page center.
 */
function displayResultInContentScript(tabId, resultText, position) {
    chrome.tabs.sendMessage(tabId, {
        action: "displayResult",
        text: resultText,
        position: position // Pass position info
    });
}


// --- Event Listeners ---

// Create Context Menu on install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Help to understand",
    contexts: ["selection", "page"] // Show for selection and page clicks
  });
  console.log("LumiVue context menu created.");
});

// Listen for Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && tab?.id) {
    const apiKey = await getApiKey();
    if (!apiKey) {
        displayResultInContentScript(tab.id, "OpenAI API key not set. Please set it in the extension options.", null);
        chrome.runtime.openOptionsPage();
        return;
    }

    // Send message to content script to get text and position
    chrome.tabs.sendMessage(tab.id, { action: "getText", source: "contextMenu", selectionText: info.selectionText }, async (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error sending message to content script:", chrome.runtime.lastError.message);
            // Potentially notify the user here if sending fails
            return;
        }
        if (response && response.text) {
            displayResultInContentScript(tab.id, "Processing...", response.position); // Show loading state
            const result = await callOpenAI(apiKey, response.text);
            displayResultInContentScript(tab.id, result, response.position);
        } else {
            console.log("No text received from content script or context menu.");
            displayResultInContentScript(tab.id, "Could not get text from page.", null);
        }
    });
  }
});


// Listen for Keyboard Shortcut
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "trigger-lumivue" && tab?.id) {
    const apiKey = await getApiKey();
     if (!apiKey) {
        displayResultInContentScript(tab.id, "OpenAI API key not set. Please set it in the extension options.", null);
        chrome.runtime.openOptionsPage();
        return;
    }

    // Send message to content script to get text and position
    chrome.tabs.sendMessage(tab.id, { action: "getText", source: "shortcut" }, async (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error sending message to content script:", chrome.runtime.lastError.message);
            return;
        }
        if (response && response.text) {
            displayResultInContentScript(tab.id, "Processing...", response.position); // Show loading state
            const result = await callOpenAI(apiKey, response.text);
            displayResultInContentScript(tab.id, result, response.position);
        } else {
            console.log("No text received from content script for shortcut.");
             displayResultInContentScript(tab.id, "Could not get text from page or selection.", null);
        }
    });
  }
});

// Listen for messages (e.g., from options page to check key validity)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkApiKey") {
    // Optional: Implement a basic check if the key looks valid or even make a test API call
    // For now, just acknowledge
    console.log("Received checkApiKey request (implementation pending).");
    sendResponse({ status: "received" });
    return true; // Indicates asynchronous response (optional here)
  }
});
