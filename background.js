import { getDefaultSystemPrompt, getDefaultMaxTokens, getDefaultTemperature, getDefaultModel } from './utils.js';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CONTEXT_MENU_ID = "LUMIVUE_CONTEXT_MENU";

/**
 * Fetches the API key and system prompt from storage.
 * @returns {Promise<Object>} Object containing API key and system prompt.
 */
async function getStoredSettings() {
  const result = await chrome.storage.sync.get(
    ['apiKey', 'model', 'systemPrompt', 'maxTokens', 'temperature']);
  return {
    apiKey: result.apiKey || null,
    model: result.model || getDefaultModel(),
    systemPrompt: result.systemPrompt || getDefaultSystemPrompt(),
    maxTokens: result.maxTokens !== undefined ? result.maxTokens : getDefaultMaxTokens(),
    temperature: result.temperature !== undefined ? result.temperature : getDefaultTemperature(),
  };
}

/**
 * Calls the OpenRouter API.
 * @param {string} apiKey - The OpenRouter API key.
 * @param {string} text - The text to process.
 * @returns {Promise<string>} The processed text from Groq.
 */
async function callGroq(text, settings) {
  if (!text || text.trim().length === 0) {
    return "No text provided.";
  }
  if (!settings.apiKey) {
    // Direct the user to the options page if the key is missing
    chrome.runtime.openOptionsPage();
    return "OpenRouter API key not set. Please set it in the extension options.";
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: "system", content: settings.systemPrompt },
          { role: "user", content: text },
        ],
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API Error:", errorData);
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || "No response from AI.";

  } catch (error) {
    console.error('Error calling Groq:', error);
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
    }, () => { // Add callback to check for errors
        if (chrome.runtime.lastError) {
            // Log a warning instead of throwing an unhandled error
            console.warn(`LumiVue: Could not send 'displayResult' to tab ${tabId}. Error: ${chrome.runtime.lastError.message}. This might happen on special pages, if the tab was closed, or if the content script isn't ready.`);
            // Optional: Could use chrome.notifications API here if you want to explicitly tell the user
            // chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon48.png', title: 'LumiVue Info', message: `Could not display result on the page. You might need to reload the tab or try on a different page.` });
        }
    });
}

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
        displayResultInContentScript(tab.id, "OpenRouter API key not set. Please set it in the extension options.", null);
        chrome.runtime.openOptionsPage();
        return;
    }

    // Send message to content script to get text and position
    chrome.tabs.sendMessage(tab.id, { action: "getText", source: "contextMenu" }, async (response) => {
        if (chrome.runtime.lastError) {
            // Log a more specific error and attempt to inform the user via the content script (might also fail)
            console.error(`LumiVue: Error sending 'getText' (context menu) to tab ${tab.id}: ${chrome.runtime.lastError.message}.`);
            displayResultInContentScript(tab.id, `Error: Could not communicate with the page. Try reloading the tab or using LumiVue on a different page. (${chrome.runtime.lastError.message})`, null);
            return;
        }
        if (response && response.text) {
            displayResultInContentScript(tab.id, "Processing...", response.position); // Show loading state
            const result = await callGroq(response.text, settings);
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
        displayResultInContentScript(tab.id, "OpenRouter API key not set. Please set it in the extension options.", null);
        chrome.runtime.openOptionsPage();
        return;
    }

    // Send message to content script to get text and position
    chrome.tabs.sendMessage(tab.id, { action: "getText", source: "shortcut" }, async (response) => {
        if (chrome.runtime.lastError) {
            // Log a more specific error and attempt to inform the user via the content script (might also fail)
            console.error(`LumiVue: Error sending 'getText' (shortcut) to tab ${tab.id}: ${chrome.runtime.lastError.message}.`);
            displayResultInContentScript(tab.id, `Error: Could not communicate with the page. Try reloading the tab or using LumiVue on a different page. (${chrome.runtime.lastError.message})`, null);
            return;
        }
        if (response && response.text) {
            const position = response.position || { x: 0, y: 0 };
            displayResultInContentScript(tab.id, "Processing...", position);
            const result = await callGroq(response.text, settings);
            displayResultInContentScript(tab.id, result, position);
        } else {
            console.log("No text received from content script for shortcut.");
            displayResultInContentScript(tab.id, "Could not get text from page or selection.", null);
        }
    });
  }
});

