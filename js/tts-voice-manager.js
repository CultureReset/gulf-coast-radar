// Enhanced Text-to-Speech Voice Manager
// Supports both browser voices (free) and premium AI voices (ElevenLabs, OpenAI)

class TTSVoiceManager {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.selectedVoice = null;
    this.voiceMode = 'browser'; // 'browser' or 'premium'
    this.premiumProvider = null; // 'elevenlabs' or 'openai'
    this.apiKey = null;
    this.elevenLabsVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - warm female voice (default)

    // Voice quality presets (more natural settings)
    this.voicePresets = {
      professional: { rate: 0.95, pitch: 0.98, volume: 1.0 },
      friendly: { rate: 0.92, pitch: 1.0, volume: 1.0 },
      calm: { rate: 0.85, pitch: 0.95, volume: 0.95 },
      energetic: { rate: 1.05, pitch: 1.02, volume: 1.0 }
    };

    this.currentPreset = 'friendly';
    this.init();
  }

  async init() {
    // Check for premium TTS configuration
    if (window.AI_CONFIG && window.AI_CONFIG.tts) {
      const ttsConfig = window.AI_CONFIG.tts;

      if (ttsConfig.provider === 'elevenlabs' && ttsConfig.apiKey) {
        this.voiceMode = 'premium';
        this.premiumProvider = 'elevenlabs';
        this.apiKey = ttsConfig.apiKey;
        this.elevenLabsVoiceId = ttsConfig.voiceId || this.elevenLabsVoiceId;
        console.log('✅ Premium TTS enabled: ElevenLabs');
      } else if (ttsConfig.provider === 'openai' && ttsConfig.apiKey) {
        this.voiceMode = 'premium';
        this.premiumProvider = 'openai';
        this.apiKey = ttsConfig.apiKey;
        console.log('✅ Premium TTS enabled: OpenAI');
      } else if (ttsConfig.preset) {
        this.currentPreset = ttsConfig.preset;
      }
    }

    // If using browser voices, select the best available voice
    if (this.voiceMode === 'browser') {
      await this.selectBestBrowserVoice();
    }
  }

  async selectBestBrowserVoice() {
    return new Promise((resolve) => {
      // Wait for voices to load
      const loadVoices = () => {
        const voices = this.synthesis.getVoices();

        if (voices.length === 0) {
          setTimeout(loadVoices, 100);
          return;
        }

        // Priority order for best voices (most natural sounding first)
        const preferredVoices = [
          // Google voices (best quality - very natural)
          'Google US English',
          'Google UK English Female',
          'Google UK English Male',

          // Apple Premium voices (iOS/macOS - excellent quality)
          'Samantha (Premium)',
          'Ava (Premium)',
          'Allison (Premium)',
          'Susan (Premium)',

          // Apple Enhanced voices
          'Samantha (Enhanced)',
          'Alex (Enhanced)',

          // Apple Standard voices
          'Samantha',
          'Alex',
          'Victoria',
          'Ava',
          'Nicky',
          'Susan',

          // Microsoft Natural voices (Windows 10/11 - good quality)
          'Microsoft Aria Online (Natural) - English (United States)',
          'Microsoft Guy Online (Natural) - English (United States)',
          'Microsoft Jenny Online (Natural) - English (United States)',

          // Microsoft standard voices
          'Microsoft Zira - English (United States)',
          'Microsoft David - English (United States)',
          'Microsoft Mark - English (United States)',

          // Fallback to any English voice
          voices.find(v => v.lang.startsWith('en-')),
        ];

        // Find the first available preferred voice
        for (const preferredName of preferredVoices) {
          const voice = voices.find(v =>
            typeof preferredName === 'string' ? v.name === preferredName : v === preferredName
          );

          if (voice) {
            this.selectedVoice = voice;
            console.log(`✅ Selected voice: ${voice.name} (${voice.lang})`);
            resolve(voice);
            return;
          }
        }

        // Last resort: use first English voice
        this.selectedVoice = voices.find(v => v.lang.startsWith('en-')) || voices[0];
        console.log(`⚠️ Using fallback voice: ${this.selectedVoice?.name}`);
        resolve(this.selectedVoice);
      };

      // Start loading
      if (this.synthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        this.synthesis.addEventListener('voiceschanged', loadVoices);
      }
    });
  }

  // Preprocess text for better pronunciation - converts symbols to spoken words
  preprocessText(text) {
    let processed = text;

    // Fix currency: "$15" → "15 dollars", "$99.99" → "99.99 dollars"
    processed = processed.replace(/\$(\d+(?:\.\d{2})?)/g, '$1 dollars');
    processed = processed.replace(/\$/g, ' dollars '); // Remaining $ symbols

    // Fix percentage: "25%" → "25 percent"
    processed = processed.replace(/(\d+)%/g, '$1 percent');
    processed = processed.replace(/%/g, ' percent ');

    // Fix common symbols to words
    processed = processed.replace(/&/g, ' and ');
    processed = processed.replace(/@/g, ' at ');
    processed = processed.replace(/\+/g, ' plus ');
    processed = processed.replace(/=/g, ' equals ');
    processed = processed.replace(/\*/g, ' '); // Remove asterisks (usually formatting)
    processed = processed.replace(/#(\d+)/g, 'number $1'); // #5 → "number 5"
    processed = processed.replace(/#(\w+)/g, 'hashtag $1'); // #food → "hashtag food"
    processed = processed.replace(/#/g, ' '); // Remove remaining hashtags

    // Fix quotes - remove them for cleaner speech
    processed = processed.replace(/["'"'"]/g, '');

    // Fix brackets/braces - remove them
    processed = processed.replace(/[(){}\[\]]/g, ' ');

    // Fix slashes
    processed = processed.replace(/\//g, ' or '); // "beef/chicken" → "beef or chicken"

    // Fix pipes
    processed = processed.replace(/\|/g, ' or ');

    // Fix underscores and dashes in contexts (not between numbers)
    processed = processed.replace(/_/g, ' ');

    // Fix time: "3-5 PM" → "3 to 5 PM" (more natural)
    processed = processed.replace(/(\d+)-(\d+)\s*(PM|AM|pm|am)/gi, '$1 to $2 $3');

    // Fix ranges: "10-15" → "10 to 15" (but avoid affecting phone numbers)
    processed = processed.replace(/(\d+)-(\d+)(?!\d)/g, '$1 to $2');

    // Fix ordinal numbers for better pronunciation
    processed = processed.replace(/\b1st\b/gi, 'first');
    processed = processed.replace(/\b2nd\b/gi, 'second');
    processed = processed.replace(/\b3rd\b/gi, 'third');
    processed = processed.replace(/\b(\d+)th\b/gi, '$1th');

    // Clean up multiple spaces that may have been introduced
    processed = processed.replace(/\s+/g, ' ').trim();

    return processed;
  }

  async speak(text, onStart, onEnd, onError) {
    // Preprocess text for better pronunciation
    const cleanedText = this.preprocessText(text);

    if (this.voiceMode === 'premium') {
      return this.speakPremium(cleanedText, onStart, onEnd, onError);
    } else {
      return this.speakBrowser(cleanedText, onStart, onEnd, onError);
    }
  }

  speakBrowser(text, onStart, onEnd, onError) {
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply voice preset
    const preset = this.voicePresets[this.currentPreset] || this.voicePresets.friendly;
    utterance.rate = preset.rate;
    utterance.pitch = preset.pitch;
    utterance.volume = preset.volume;

    // Set selected voice
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // Event handlers
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    this.synthesis.speak(utterance);
  }

  async speakPremium(text, onStart, onEnd, onError) {
    if (onStart) onStart();

    try {
      let audioUrl;

      if (this.premiumProvider === 'elevenlabs') {
        audioUrl = await this.generateElevenLabsSpeech(text);
      } else if (this.premiumProvider === 'openai') {
        audioUrl = await this.generateOpenAISpeech(text);
      }

      // Play the audio
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // Clean up
        if (onEnd) onEnd();
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        if (onError) onError(error);
      };

      await audio.play();

    } catch (error) {
      console.error('Premium TTS error:', error);
      console.log('⚠️ Falling back to browser TTS');

      // Fallback to browser TTS
      this.speakBrowser(text, onStart, onEnd, onError);
    }
  }

  async generateElevenLabsSpeech(text) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.elevenLabsVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }

  async generateOpenAISpeech(text) {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'nova', // Options: alloy, echo, fable, onyx, nova, shimmer
        speed: 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }

  cancel() {
    this.synthesis.cancel();
  }

  setPreset(presetName) {
    if (this.voicePresets[presetName]) {
      this.currentPreset = presetName;
      console.log(`🎙️ Voice preset changed to: ${presetName}`);
    }
  }

  // Get available voices info
  getBrowserVoices() {
    return this.synthesis.getVoices().map(v => ({
      name: v.name,
      lang: v.lang,
      isDefault: v.default
    }));
  }
}

// Export for use in AI assistant
window.TTSVoiceManager = TTSVoiceManager;
