import { getDefaultSystemPrompt } from './utils.js';

// --- Constants ---
// const API_URL = 'https://api.openai.com/v1/chat/completions';
// const API_URL = 'http://127.0.0.1:8080/v1/chat/completions';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CONTEXT_MENU_ID = "LUMIVUE_CONTEXT_MENU";

// --- Helper Functions ---

/**
 * Fetches the API key and system prompt from storage.
 * @returns {Promise<Object>} Object containing API key and system prompt.
 */
async function getStoredSettings() {
  const result = await chrome.storage.sync.get(['openaiApiKey', 'systemPrompt']);
  return {
    apiKey: result.openaiApiKey || null,
    systemPrompt: result.systemPrompt || getDefaultSystemPrompt()
  };
}

/**
 * Calls the OpenAI API.
 * @param {string} apiKey - The OpenAI API key.
 * @param {string} text - The text to process.
 * @returns {Promise<string>} The processed text from OpenAI.
 */
async function callOpenAI(apiKey, text, systemPrompt) {
  if (!text || text.trim().length === 0) {
    return "No text provided.";
  }
  if (!apiKey) {
    // Direct the user to the options page if the key is missing
    chrome.runtime.openOptionsPage();
    return "OpenAI API key not set. Please set it in the extension options.";
  }

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
          { role: "system", content: systemPrompt },
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
        position: position,
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
    const settings = await getStoredSettings();
    if (!settings.apiKey) {
        displayResultInContentScript(tab.id, "OpenAI API key not set. Please set it in the extension options.", null);
        chrome.runtime.openOptionsPage();
        return;
    }

    // Send message to content script to get text and position
    chrome.tabs.sendMessage(tab.id, { action: "getText", source: "contextMenu" }, async (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error sending message to content script:", chrome.runtime.lastError.message);
            // Potentially notify the user here if sending fails
            return;
        }
        if (response && response.text) {
            displayResultInContentScript(tab.id, "Processing...", response.position); // Show loading state
            const result = await callOpenAI(settings.apiKey, response.text, settings.systemPrompt);
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
    const settings = await getStoredSettings();
     if (!settings.apiKey) {
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
            const position = response.position || { x: 0, y: 0 };
            displayResultInContentScript(tab.id, "Processing...", position);
            const result = await callOpenAI(settings.apiKey, response.text, settings.systemPrompt);
            displayResultInContentScript(tab.id, result, position);
        } else {
            console.log("No text received from content script for shortcut.");
            displayResultInContentScript(tab.id, "Could not get text from page or selection.", null);
        }
    });
  }
});

