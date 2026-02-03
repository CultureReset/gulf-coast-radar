# API Keys Required for GCR Platform

## 🔐 API Keys You Need to Set Up

After cloning this repository, you need to configure your own API keys for full functionality.

---

## 1. OpenAI API Key (For AI Assistant)

**Purpose:** Powers the AI chat assistant
**File:** `js/ai-config.js`
**Get Key:** https://platform.openai.com/api-keys
**Cost:** Pay-as-you-go (~$0.002 per conversation)

**How to Add:**
```bash
# Copy the example file
cp js/ai-config.example.js js/ai-config.js

# Edit js/ai-config.js and replace:
apiKey: 'YOUR_API_KEY_HERE'
# with your actual key:
apiKey: 'sk-proj-YOUR_ACTUAL_KEY_HERE'
```

**What happens without it:**
- AI assistant won't respond to user questions
- Chat interface will show errors

---

## 2. xAI Grok API Key (For AI-Powered Search)

**Purpose:** Makes search understand natural language better
**File:** `js/ai-config.js`
**Get Key:** https://console.x.ai or https://x.ai
**Cost:** Pay-as-you-go (check xAI pricing)

**How to Add:**
```javascript
// In js/ai-config.js, add:
grokApiKey: 'xai-YOUR_ACTUAL_KEY_HERE'
```

**What happens without it:**
- Search still works! But uses basic keyword matching
- No AI-enhanced query understanding
- Less intelligent search results

---

## 3. Google Sheets API (For Data Loading)

**Purpose:** Load business data from Google Sheets
**File:** `js/google-sheets-config.js`
**Get URLs:** Publish your Google Sheets as CSV
**Cost:** FREE

**How to Set Up:**
1. Open your Google Sheet
2. File → Share → Publish to web
3. Select specific tab
4. Change format to "CSV"
5. Copy the URL
6. Add to `js/google-sheets-config.js`

**What happens without it:**
- Data loads from Supabase API instead (preferred method)
- No impact if using backend API

---

## 4. Google Maps API Key (Optional)

**Purpose:** Enhanced map features
**File:** `js/config.js`
**Get Key:** https://console.cloud.google.com/google/maps-apis
**Cost:** FREE tier available (up to $200/month credit)

**How to Add:**
```javascript
// In js/config.js
GOOGLE: {
  MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_KEY',
}
```

**What happens without it:**
- Basic maps using Leaflet.js still work
- No Google Maps specific features

---

## 5. ElevenLabs API Key (Optional)

**Purpose:** Premium AI voices for text-to-speech
**File:** `js/ai-config.js`
**Get Key:** https://elevenlabs.io
**Cost:** ~$0.30 per 1,000 characters

**How to Add:**
```javascript
// In js/ai-config.js
tts: {
  provider: 'elevenlabs',
  apiKey: 'YOUR_ELEVENLABS_KEY',
  voiceId: 'EXAVITQu4vr4xnSDxMaL' // or choose your own
}
```

**What happens without it:**
- Uses free browser voices (still works!)
- Lower quality voice but functional

---

## 🚀 Quick Setup Script

```bash
# 1. Copy example config
cp js/ai-config.example.js js/ai-config.js

# 2. Edit with your keys
nano js/ai-config.js
# or
code js/ai-config.js

# 3. Test your app
open index.html
```

---

## ⚠️ SECURITY IMPORTANT

### DO NOT:
- ❌ Commit `js/ai-config.js` to git (it's in .gitignore)
- ❌ Share your API keys publicly
- ❌ Commit `js/google-sheets-config.js` (it's in .gitignore)
- ❌ Put keys in any file that gets committed

### DO:
- ✅ Keep keys in `ai-config.js` (gitignored)
- ✅ Use environment variables in production
- ✅ Set usage limits on your API keys
- ✅ Monitor your API usage regularly
- ✅ Regenerate keys if exposed

---

## 📊 API Key Priority

### Required for Core Functionality:
1. **OpenAI** - AI assistant won't work without it
2. **Backend API** - Business data loading (not an API key, it's your server)

### Optional but Recommended:
3. **xAI Grok** - Better search experience
4. **Google Maps** - Enhanced maps

### Nice to Have:
5. **ElevenLabs** - Premium voices
6. **Google Sheets** - Alternative data source

---

## 🆘 Troubleshooting

### "AI assistant not responding"
→ Check your OpenAI API key in `js/ai-config.js`

### "Search not using AI"
→ Add xAI Grok key to `js/ai-config.js`

### "API key exposed" error
→ Make sure `js/ai-config.js` is in .gitignore

### "Out of credits"
→ Check your API usage dashboard and add billing

---

## 💰 Estimated Monthly Costs

**Minimal Usage** (~100 visitors/day):
- OpenAI: $5-10/month
- xAI Grok: $3-5/month
- Total: ~$10-15/month

**Medium Usage** (~1,000 visitors/day):
- OpenAI: $30-50/month
- xAI Grok: $20-30/month
- Total: ~$50-80/month

**Heavy Usage** (~10,000 visitors/day):
- OpenAI: $200-300/month
- xAI Grok: $100-150/month
- Total: ~$300-450/month

*Note: Actual costs depend on how much users interact with AI features*

---

## 🔒 Your Exposed Keys (Action Required)

When you cloned this repo, we found exposed keys. You need to:

1. **OpenAI Key** - Go to https://platform.openai.com/api-keys
   - Delete key starting with: `sk-proj-7HEMfug9...`
   - Create new key
   - Add to your local `js/ai-config.js`

2. **xAI Grok Key** - Go to https://console.x.ai
   - Delete key starting with: `xai-Sxa4pTN0...`
   - Create new key
   - Add to your local `js/ai-config.js`

**These keys are now removed from the repo, but you need to regenerate them!**
