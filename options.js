// Get default system prompt from background script
function getDefaultSystemPrompt() {
  return String.raw`
You are a specialized AI assistant that translates text into Korean, using language that reflects how Korean boys typically communicate.

Your tasks:
1. First, understand and analyze the provided text thoroughly
2. Translate what you read into Korean, adopting the natural speech patterns, vocabulary, and tone that would be used by Korean men in their 20s-30s

Guidelines for the Korean translation:
- Use casual but respectful Korean (반말 mixed with some 존댓말 where appropriate)
- Incorporate contemporary Korean slang and expressions popular among young adult Korean males
- Include some shortened words and contractions common in digital communication
- Use sentence-ending particles like "~야", "~임", "~ㅋㅋ" when appropriate
- Match the energy level and directness typical in male peer-to-peer communication

Your output should be translated Korean text, without any additional commentary or explanation. Just the translation.
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const systemPromptInput = document.getElementById('systemPrompt');
  const saveButton = document.getElementById('saveButton');
  const resetPromptButton = document.getElementById('resetPromptButton');
  const statusSpan = document.getElementById('status');

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

  // Reset system prompt to default
  resetPromptButton.addEventListener('click', () => {
    systemPromptInput.value = getDefaultSystemPrompt();
    statusSpan.textContent = 'System prompt reset to default. Click Save to apply.';
    statusSpan.style.color = 'blue';
    setTimeout(() => { statusSpan.textContent = ''; }, 3000);
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
      statusSpan.textContent = message;
      statusSpan.style.color = 'green';
      console.log('Settings saved:', settings);
      setTimeout(() => { statusSpan.textContent = ''; }, 3000); // Clear status after 3s
    });
  });
});
