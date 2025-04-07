import { getDefaultSystemPrompt, getDefaultMaxTokens, getDefaultTemperature, GROQ_MODELS } from './utils.js';

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

  // Load saved settings on page load
  chrome.storage.sync.get(['groqApiKey', 'groqModel', 'systemPrompt', 'maxTokens', 'temperature'], (data) => {
    if (data.groqApiKey) {
      apiKeyInput.value = data.groqApiKey;
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

    // Populate model select dropdown
    populateModelSelect();

    // Set selected model if saved
    if (data.groqModel) {
      document.getElementById('modelSelect').value = data.groqModel;
    }
  });

  // Populate the model select dropdown
  function populateModelSelect() {
    const modelSelect = document.getElementById('modelSelect');

    // Clear existing options
    modelSelect.innerHTML = '';

    // Add models that have a valid code (some models might be previews without codes)
    GROQ_MODELS.forEach(model => {
      if (model.code) {
        const option = document.createElement('option');
        option.value = model.code;
        option.textContent = `${model.model} - ${model.price_input} in / ${model.price_output} out`;
        modelSelect.appendChild(option);
      }
    });

    // Set default to first available model if none selected
    if (!modelSelect.value && modelSelect.options.length > 0) {
      modelSelect.selectedIndex = 0;
    }

    // Add change event listener to automatically save when model is changed
    modelSelect.addEventListener('change', () => {
      saveSettings();
      showStatus('Model updated and settings saved!', 'var(--success-color)');
    });
  }

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
      settings.groqApiKey = apiKey;
    } else {
      // Clear the key if the input is empty
      chrome.storage.sync.remove('groqApiKey');
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
    settings.groqModel = selectedModel;

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
