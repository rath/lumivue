/**
 * Returns the default system prompt.
 * @returns {string} The default system prompt.
 */
export function getDefaultSystemPrompt() {
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
  `.trim();
}

export function getDefaultMaxTokens() {
  return 1000;
}

export function getDefaultTemperature() {
  return 0.6;
}

export const GROQ_MODELS = [
  {
    "model": "Llama 4 Scout (17Bx16E)",
    "code": "meta-llama/llama-4-scout-17b-16e-instruct",
    "speed": 460,
    "price_input": "$0.11",
    "price_output": "$0.34"
  },
  {
    "model": "Llama 4 Maverick (17Bx128E)",
    "code": null,
    "speed": null,
    "price_input": "$0.50",
    "price_output": "$0.77"
  },
  {
    "model": "DeepSeek R1 Distill Llama 70B",
    "code": "deepseek-r1-distill-llama-70b",
    "speed": 275,
    "price_input": "$0.75",
    "price_output": "$0.99"
  },
  {
    "model": "DeepSeek R1 Distill Qwen 32B 128k",
    "code": "deepseek-r1-distill-qwen-32b",
    "speed": 140,
    "price_input": "$0.69",
    "price_output": "$0.69"
  },
  {
    "model": "Qwen 2.5 32B Instruct 128k",
    "code": "qwen-2.5-32b",
    "speed": 200,
    "price_input": "$0.79",
    "price_output": "$0.79"
  },
  {
    "model": "Qwen 2.5 Coder 32B Instruct 128k",
    "code": "qwen-2.5-coder-32b",
    "speed": 390,
    "price_input": "$0.79",
    "price_output": "$0.79"
  },
  {
    "model": "Qwen QwQ 32B (Preview) 128k",
    "code": "qwen-qwq-32b",
    "speed": 400,
    "price_input": "$0.29",
    "price_output": "$0.39"
  },
  {
    "model": "Mistral Saba 24B",
    "code": "mistral-saba-24b",
    "speed": 330,
    "price_input": "$0.79",
    "price_output": "$0.79"
  },
  {
    "model": "Llama 3.2 1B (Preview) 8k",
    "code": "llama-3.2-1b-preview",
    "speed": 3100,
    "price_input": "$0.04",
    "price_output": "$0.04"
  },
  {
    "model": "Llama 3.2 3B (Preview) 8k",
    "code": "llama-3.2-3b-preview",
    "speed": 1600,
    "price_input": "$0.06",
    "price_output": "$0.06"
  },
  {
    "model": "Llama 3.3 70B Versatile 128k",
    "code": "llama-3.3-70b-versatile",
    "speed": 275,
    "price_input": "$0.59",
    "price_output": "$0.79"
  },
  {
    "model": "Llama 3.1 8B Instant 128k",
    "code": "llama-3.1-8b-instant",
    "speed": 750,
    "price_input": "$0.05",
    "price_output": "$0.08"
  },
  {
    "model": "Llama 3 70B 8k",
    "code": "llama3-70b-8192",
    "speed": 330,
    "price_input": "$0.59",
    "price_output": "$0.79"
  },
  {
    "model": "Llama 3 8B 8k",
    "code": "llama3-8b-8192",
    "speed": 1250,
    "price_input": "$0.05",
    "price_output": "$0.08"
  },
  {
    "model": "Gemma 2 9B 8k",
    "code": "gemma2-9b-it",
    "speed": 500,
    "price_input": "$0.20",
    "price_output": "$0.20"
  },
  {
    "model": "Llama Guard 3 8B 8k",
    "code": "llama-guard-3-8b",
    "speed": 765,
    "price_input": "$0.20",
    "price_output": "$0.20"
  },
  {
    "model": "Llama 3.3 70B SpecDec 8k",
    "code": "llama-3.3-70b-specdec",
    "speed": 1600,
    "price_input": "$0.59",
    "price_output": "$0.99"
  }
];
