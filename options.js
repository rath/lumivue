import { getDefaultSystemPrompt, getDefaultMaxTokens, getDefaultTemperature, getDefaultModel } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const systemPromptInput = document.getElementById('systemPrompt');
  const maxTokensInput = document.getElementById('maxTokens');
  const maxTokensValue = document.getElementById('maxTokensValue');
  const temperatureInput = document.getElementById('temperature');
  const temperatureValue = document.getElementById('temperatureValue');
  const saveButton = document.getElementById('saveButton');
  const resetPromptButton = document.getElementById('resetPromptButton');
  const statusSpan = document.getElementById('status');
  const toggleApiKeyButton = document.getElementById('toggleApiKey');
  const modelField = document.getElementById('modelSelect');
  const modelList = document.getElementById('modelList');

  // Function to fetch models from OpenRouter API
  async function fetchModels() {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data) {
        modelList.innerHTML = '';
        data.data.forEach(model => {
          const option = document.createElement('option');
          option.value = model.id;
          // Format pricing information if available
          let pricingText = '';
          if (model.pricing) {
            const promptPrice = (parseFloat(model.pricing.prompt) * 1000000).toFixed(2);
            const completionPrice = (parseFloat(model.pricing.completion) * 1000000).toFixed(2);
            pricingText = ` (In️ $${promptPrice}, Out️ $${completionPrice}) / 1M tokens`;
          }
          option.textContent = `${model.name || model.id}${pricingText}`;
          modelList.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  }

  // Load saved settings on page load
  chrome.storage.sync.get(['apiKey', 'model', 'systemPrompt', 'maxTokens', 'temperature'], (data) => {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }

    if (data.systemPrompt) {
      systemPromptInput.value = data.systemPrompt;
    } else {
      systemPromptInput.value = getDefaultSystemPrompt();
    }

    // Set max tokens with default fallback
    const maxTokens = data.maxTokens !== undefined ? data.maxTokens : getDefaultMaxTokens();
    maxTokensInput.value = maxTokens;
    maxTokensValue.textContent = maxTokens;

    // Set temperature with default fallback
    const temperature = data.temperature !== undefined ? data.temperature : getDefaultTemperature();
    temperatureInput.value = temperature;
    temperatureValue.textContent = temperature;

    modelField.value = data.model ?? getDefaultModel();
    fetchModels();
  });

  // Update displayed values when sliders change
  maxTokensInput.addEventListener('input', () => {
    maxTokensValue.textContent = maxTokensInput.value;
  });

  temperatureInput.addEventListener('input', () => {
    temperatureValue.textContent = temperatureInput.value;
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

  // Function to save all settings
  function saveSettings() {
    const apiKey = apiKeyInput.value.trim();
    const systemPrompt = systemPromptInput.value.trim();
    const maxTokens = parseInt(maxTokensInput.value);
    const temperature = parseFloat(temperatureInput.value);
    const selectedModel = document.getElementById('modelSelect').value;

    const settings = {};

    // Handle API key
    if (apiKey) {
      settings.apiKey = apiKey;
    } else {
      // Clear the key if the input is empty
      chrome.storage.sync.remove('apiKey');
    }

    // Handle system prompt
    if (systemPrompt) {
      settings.systemPrompt = systemPrompt;
    } else {
      // Set to default if empty
      settings.systemPrompt = getDefaultSystemPrompt();
    }

    settings.maxTokens = maxTokens;
    settings.temperature = temperature;
    settings.model = selectedModel;

    chrome.storage.sync.set(settings, () => {
      console.log('Settings saved:', settings);
    });
  }

  // Save settings on button click
  saveButton.addEventListener('click', () => {
    saveSettings();
    showStatus('Settings saved successfully!', 'var(--success-color)');
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
