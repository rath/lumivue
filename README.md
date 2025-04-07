<p align="center">
  <img src="icons/icon128.png" alt="LumiVue Logo" width="128" height="128">
</p>

# LumiVue

LumiVue is a Chrome extension that translates selected text or entire web pages into authentic
Korean male speech using AI.

## Features

- **Text Translation**: Convert any selected text or entire web page into natural Korean speech
- **Context Menu Integration**: Right-click on selected text to translate
- **Keyboard Shortcut**: Use `Ctrl+Shift+E` (or `Command+Shift+E` on Mac) to quickly translate
- **Customizable Settings**: Adjust AI model parameters to suit your needs
- **OpenRouter API Integration**: Powered by OpenRouter's AI models

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The LumiVue icon should appear in your browser toolbar

## Usage

### Basic Usage

1. Select text on any webpage
2. Either:
   - Right-click and select "Help to understand" from the context menu
   - Press `Ctrl+Shift+E` (or `Command+Shift+E` on Mac)
3. A popup will appear with the translated text

### Configuration

1. Click the LumiVue icon in your browser toolbar or right-click and select "Options"
2. Enter your OpenRouter API key
3. Customize the system prompt, model, and other parameters
4. Click "Save Settings"

## Settings

- **API Key**: Your OpenRouter API key (required)
- **Model**: The AI model to use (default: `google/gemini-2.0-flash-001`)
- **System Prompt**: Instructions for the AI on how to translate text
- **Max Tokens**: Maximum length of the AI response (default: 1000)
- **Temperature**: Controls randomness in the AI response (default: 0.6)

## Default System Prompt

The default system prompt instructs the AI to translate text into authentic young Korean male speech
(20s-30s), using casual 반말, characteristic speech elements, and contemporary slang.

## Development

The extension consists of:
- Background script for API communication
- Content script for webpage interaction
- Options page for configuration
- Utility functions for default settings

## License

This project is licensed under the MIT License

