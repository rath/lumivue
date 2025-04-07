import { getDefaultSystemPrompt } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const systemPromptInput = document.getElementById('systemPrompt');
  const saveButton = document.getElementById('saveButton');
  const resetPromptButton = document.getElementById('resetPromptButton');
  const statusSpan = document.getElementById('status');
  const toggleApiKeyButton = document.getElementById('toggleApiKey');

  // Load saved settings on page load
  chrome.storage.sync.get(['openaiApiKey', 'systemPrompt'], (data) => {
    if (data.openaiApiKey) {
      apiKeyInput.value = data.openaiApiKey;
    }

    if (data.systemPrompt) {
      systemPromptInput.value = data.systemPrompt;
    } else {
      systemPromptInput.value = getDefaultSystemPrompt();
    }
  });

  // Toggle API key visibility
  toggleApiKeyButton.addEventListener('click', () => {
    const icon = toggleApiKeyButton.querySelector('i');
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      apiKeyInput.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  });

  // Reset system prompt to default
  resetPromptButton.addEventListener('click', () => {
    systemPromptInput.value = getDefaultSystemPrompt();
    showStatus('Prompt reset to default. Save to apply changes.', 'blue');
  });

  // Save settings on button click
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const systemPrompt = systemPromptInput.value.trim();

    const settings = {};
    let message = '';

    // Handle API key
    if (apiKey) {
      settings.openaiApiKey = apiKey;
      message += 'API Key saved! ';
    } else {
      // Clear the key if the input is empty
      chrome.storage.sync.remove('openaiApiKey');
      message += 'API Key cleared. ';
    }

    // Handle system prompt
    if (systemPrompt) {
      settings.systemPrompt = systemPrompt;
      message += 'System prompt saved!';
    } else {
      // Set to default if empty
      settings.systemPrompt = getDefaultSystemPrompt();
      message += 'System prompt set to default.';
    }

    // Save all settings
    chrome.storage.sync.set(settings, () => {
      showStatus(message, 'green');
      console.log('Settings saved:', settings);
    });
  });

  // Helper function to show status messages
  function showStatus(message, color) {
    statusSpan.textContent = message;
    statusSpan.style.color = color || 'var(--success-color)';
    statusSpan.classList.add('visible');

    setTimeout(() => {
      statusSpan.classList.remove('visible');
      setTimeout(() => { statusSpan.textContent = ''; }, 300);
    }, 3000);
  }
});
