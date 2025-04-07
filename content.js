// --- Globals ---
let resultPopup = null;
let lastMousePosition = { x: 0, y: 0 };

// --- Helper Functions ---

/**
 * Gets the currently selected text on the page.
 * @returns {string} The selected text.
 */
function getSelectedText() {
  return window.getSelection().toString().trim();
}

/**
 * Gets the main text content of the entire page.
 * Tries to find the main content area, falls back to body text.
 * @returns {string} The page text.
 */
function getPageText() {
    // Prioritize common main content containers
    const mainSelectors = ['main', 'article', '[role="main"]', '#content', '#main', '.content', '.main'];
    let mainElement = null;
    for (const selector of mainSelectors) {
        mainElement = document.querySelector(selector);
        if (mainElement) break;
    }

    const targetElement = mainElement || document.body;
    // Basic text extraction, could be improved (e.g., exclude nav/footer)
    return targetElement.innerText.trim();
}


/**
 * Creates or updates the result popup element.
 * @param {string} text - The text content for the popup.
 * @param {object|null} position - The {x, y} coordinates for the popup. If null, centers it.
 */
function showResultPopup(text, position) {
  // Remove existing popup if any
  if (resultPopup) {
    resultPopup.remove();
  }

  // Create popup element
  resultPopup = document.createElement('div');
  resultPopup.id = 'lumivue-result-popup';
  resultPopup.textContent = text; // Use textContent for security

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.id = 'lumivue-close-button';
  closeButton.textContent = '×'; // Multiplication sign for 'X'
  closeButton.onclick = () => {
    if (resultPopup) {
      resultPopup.remove();
      resultPopup = null;
    }
  };
  resultPopup.appendChild(closeButton);


  // Positioning
  if (position) {
    // Position near the mouse click/selection
    resultPopup.style.position = 'absolute';
    resultPopup.style.left = `${position.x + window.scrollX + 5}px`; // Offset slightly
    resultPopup.style.top = `${position.y + window.scrollY + 5}px`;
  } else {
    // Default to top-center if no position provided
    resultPopup.style.position = 'fixed';
    resultPopup.style.top = '20px';
    resultPopup.style.left = '50%';
    resultPopup.style.transform = 'translateX(-50%)';
  }

  document.body.appendChild(resultPopup);

  // Optional: Auto-remove after a delay? Or only on close click/click outside.
   // Add listener to close popup if clicking outside of it
  document.addEventListener('click', handleClickOutside, true); // Use capture phase
}

/**
 * Closes the popup if a click occurs outside of it.
 * @param {Event} event - The click event.
 */
function handleClickOutside(event) {
    if (resultPopup && !resultPopup.contains(event.target)) {
        resultPopup.remove();
        resultPopup = null;
        document.removeEventListener('click', handleClickOutside, true); // Clean up listener
    }
}


// --- Event Listeners ---

// Keep track of the last mouse position for context menu clicks
document.addEventListener('mousedown', (event) => {
    lastMousePosition = { x: event.clientX, y: event.clientY };
}, true); // Use capture phase to get position before context menu potentially blocks it


// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "displayResult") {
    showResultPopup(request.text, request.position);
  } else if (request.action === "getText") {
    let text = "";
    let position = null; // Position where the action was triggered

    if (request.source === "contextMenu") {
        text = request.selectionText || getPageText(); // Use selection if available, else page
        position = lastMousePosition; // Use the last recorded mouse position
    } else if (request.source === "shortcut") {
        text = getSelectedText() || getPageText(); // Prioritize selection for shortcut too
        // For shortcut, we don't have a specific click position,
        // so we might center it or position relative to selection (more complex)
        // Let's pass null to center it for now.
        position = null;
    }

    sendResponse({ text: text, position: position });
  }
  // Indicate asynchronous response if needed, though not strictly necessary here
  // return true;
});
