// AI Configuration Example
// Copy this file to 'ai-config.js' and add your API key

// To use external AI (OpenAI GPT-4 or Claude):
// 1. Copy this file to ai-config.js
// 2. Add your API key below
// 3. Include ai-config.js BEFORE ai-assistant.js in your HTML
// 4. Include ai-backend.js BEFORE ai-assistant.js in your HTML

// Example HTML setup:
// <script src="js/ai-config.js"></script>
// <script src="js/ai-backend.js"></script>
// <script src="js/ai-assistant.js"></script>

window.AI_CONFIG = {
  // ==========================================
  // AI CHAT CONFIGURATION
  // ==========================================

  // Your API key (KEEP THIS SECRET!)
  apiKey: 'YOUR_API_KEY_HERE', // Get from https://platform.openai.com or https://console.anthropic.com

  // Provider: 'openai' or 'claude'
  provider: 'openai', // Use 'claude' for Anthropic Claude API

  // Optional: Model selection
  model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for faster/cheaper, or 'claude-3-sonnet-20240229'

  // ==========================================
  // GROK (xAI) API KEY FOR SEARCH
  // ==========================================

  // xAI Grok API key for AI-powered search (optional)
  // Get from: https://x.ai or https://console.x.ai
  grokApiKey: 'YOUR_XAI_GROK_API_KEY', // Optional - search works without it but less intelligent

  // ==========================================
  // TEXT-TO-SPEECH VOICE CONFIGURATION
  // ==========================================

  tts: {
    // OPTION 1: Enhanced Browser Voices (FREE)
    // Leave provider commented out to use improved browser voices
    // preset: 'friendly', // Options: 'professional', 'friendly', 'calm', 'energetic'

    // OPTION 2: Premium AI Voices (BEST QUALITY - requires separate API key)

    // ElevenLabs (Most natural AI voices)
    // Get API key from: https://elevenlabs.io
    // Cost: ~$0.30 per 1,000 characters (~$0.01 per response)
    provider: 'elevenlabs',
    apiKey: 'YOUR_ELEVENLABS_API_KEY', // Different from AI chat API key!
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah (warm, friendly female) - or choose from elevenlabs.io/voice-library

    // OpenAI TTS (Very natural voices)
    // Uses same API key as AI chat
    // Cost: ~$0.015 per 1,000 characters (~$0.0005 per response)
    // provider: 'openai',
    // apiKey: 'YOUR_OPENAI_API_KEY', // Can reuse the same key from above
    // voice: 'nova' // Options: alloy, echo, fable, onyx, nova, shimmer

    // VOICE COMPARISONS:
    // Browser (FREE): Decent quality, sounds slightly robotic
    // OpenAI ($): Very good quality, natural intonation
    // ElevenLabs ($$): Best quality, extremely human-like, emotional range
  }
};

// IMPORTANT SECURITY NOTES:
// ⚠️ Never commit ai-config.js to git (add it to .gitignore)
// ⚠️ Never expose your API key in client-side code in production
// ⚠️ In production, proxy API calls through your own backend server
// ⚠️ This setup is for development/testing only

// Example production-safe setup:
// Instead of calling OpenAI/Claude directly from the browser,
// create a backend endpoint that:
// 1. Receives user queries
// 2. Calls OpenAI/Claude with your API key (kept secret on server)
// 3. Returns response to client

// Without external AI (default):
// If you don't configure this, the assistant will use built-in local logic.
// Local logic is free but less intelligent than GPT-4/Claude.
