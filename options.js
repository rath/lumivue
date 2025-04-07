document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const statusSpan = document.getElementById('status');

  // Load saved API key on page load
  chrome.storage.sync.get('openaiApiKey', (data) => {
    if (data.openaiApiKey) {
      apiKeyInput.value = data.openaiApiKey;
    }
  });

  // Save API key on button click
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
        statusSpan.textContent = 'API Key saved!';
        statusSpan.style.color = 'green';
        console.log('OpenAI API Key saved.');
        // Optional: Send message to background to verify key (basic check)
        // chrome.runtime.sendMessage({ action: "checkApiKey", key: apiKey });
        setTimeout(() => { statusSpan.textContent = ''; }, 3000); // Clear status after 3s
      });
    } else {
      // Optionally clear the key if the input is empty
      chrome.storage.sync.remove('openaiApiKey', () => {
        statusSpan.textContent = 'API Key cleared.';
        statusSpan.style.color = 'orange';
        console.log('OpenAI API Key cleared.');
        setTimeout(() => { statusSpan.textContent = ''; }, 3000);
      });
    }
  });
});
