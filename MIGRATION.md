# Migration Guide: Original → Online-Only Variant

This document explains what changed when converting the original AVA-AI-Voice-Agent to the online-only variant.

## Summary of Changes

The online-only variant removes **all local AI server functionality** to simplify deployment and reduce system requirements. You now rely exclusively on cloud-based AI providers (OpenAI, Google, Deepgram, Azure, etc.).

## ✂️ Removed Components

### 1. **Local AI Server Service** (`/local_ai_server/`)
- **Status:** ❌ Completely removed
- **What it did:** Provided local STT (Vosk, Sherpa, etc.), LLM (Llama), TTS (Piper, Kokoro)
- **Why removed:** Online providers are faster, easier to maintain, and don't require GPU/large model downloads

### 2. **Docker Service** (`local_ai_server` in docker-compose.yml)
- **Status:** ❌ Removed
- **Impact:** Only 2 services now run:
  - `ai_engine` (Python agent)
  - `admin_ui` (web dashboard)

### 3. **Configuration Variables** (`.env` file)
- **Status:** ❌ All `LOCAL_*` variables disabled
- **Removed variables:**
  ```bash
  LOCAL_WS_URL              # WebSocket endpoint for local AI
  LOCAL_WS_HOST
  LOCAL_WS_PORT
  LOCAL_WS_AUTH_TOKEN
  LOCAL_WS_CONNECT_TIMEOUT
  LOCAL_WS_RESPONSE_TIMEOUT
  LOCAL_WS_CHUNK_MS
  LOCAL_TOOL_CALL_POLICY
  LOCAL_TOOL_GATEWAY_ENABLED
  LOCAL_LOG_LEVEL
  LOCAL_DEBUG
  LOCAL_AI_MODE
  LOCAL_STT_BACKEND
  LOCAL_STT_MODEL_PATH
  LOCAL_LLM_MODEL_PATH
  LOCAL_LLM_CHAT_FORMAT
  LOCAL_LLM_*              # All LLM tuning parameters
  LOCAL_TTS_*              # All TTS parameters
  # ... and ~30 more LOCAL_* variables
  ```

### 4. **Admin UI Backend Routes**
- **Status:** ❌ `/api/local-ai/*` endpoints disabled
- **Affected routes:**
  - `GET/POST /api/local-ai/status` - Local server health
  - `POST /api/local-ai/restart` - Restart local server
  - `POST /api/local-ai/rebuild` - Rebuild local server
  - Model management endpoints
  - Backend selection endpoints

### 5. **Default Configuration** (`config/ai-agent.yaml`)
- **Status:** ⚠️ Changed defaults only
- **Changes:**
  - `default_provider: local_hybrid` → `google_live`
  - Provider fallback list: removed `local` from fallback options
  - Context defaults: changed from `provider: local` to `provider: google_live`

## 📝 Configuration Changes

### Before (Original)
```yaml
# config/ai-agent.yaml
default_provider: local_hybrid

pipelines:
  local_hybrid:
    stt: local_stt
    llm: native_llm
    tts: local_tts
```

### After (Online-Only)
```yaml
# config/ai-agent.yaml
default_provider: google_live

pipelines:
  google_live:
    # Built-in monolithic provider (no explicit config needed)
```

## 🔄 Migration Path

### If you were using **local_hybrid** (local AI):
1. Migrate to a cloud provider:
   - **Easiest:** Google Gemini Live (free tier available)
   - **Fastest latency:** Deepgram Voice Agent
   - **Most familiar:** OpenAI Realtime

2. Update configuration:
   ```yaml
   # config/ai-agent.yaml
   default_provider: google_live  # or deepgram, openai_realtime
   ```

3. Add API keys to `.env`:
   ```bash
   GOOGLE_API_KEY=your-key-here
   ```

### If you were using **hybrid pipelines** (mix of local + cloud):
- These still work with cloud-only components
- Example: `hybrid_elevenlabs` (uses ElevenLabs TTS) works unchanged

### GPU Setup
- **Original:** Required NVIDIA setup for local LLM inference
- **Online-Only:** No GPU needed (all inference on provider servers)
- **Action:** Can remove GPU setup steps from deployment

### Model Downloads
- **Original:** Downloaded 100s of GBs for local models
- **Online-Only:** No model downloads needed
- **Action:** Can skip `/app/models/` directory setup

## 📊 Feature Comparison

| Feature | Original | Online-Only |
|---------|----------|-------------|
| **Local LLM Inference** | ✅ Yes | ❌ No |
| **Offline Operation** | ✅ Yes | ❌ No (requires internet) |
| **Low Latency** | ⚠️ Variable (GPU-dependent) | ✅ Fast (provider-optimized) |
| **Cost** | ⚠️ High (hardware) | ✅ Low (pay-per-use) |
| **Setup Complexity** | 🔴 Complex (GPU, models) | 🟢 Simple (API keys only) |
| **Maintenance** | 🟡 Medium | 🟢 Low |
| **Privacy** | ✅ Full (on-premise) | ⚠️ Cloud-dependent |
| **Scaling** | Limited by hardware | ✅ Unlimited (provider handles) |

## 🚀 Deployment Changes

### Original Setup
```bash
# Complex: preflight → GPU setup → model download → docker-compose
./preflight.sh --apply-fixes
export ASTERISK_GID=$(id -g asterisk)
# GPU setup steps...
docker compose -f docker-compose.yml -f docker-compose.gpu.yml build
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d
```

### Online-Only Setup
```bash
# Simple: copy .env, add API keys, run docker-compose
cp .env.example .env
# Edit .env and add OPENAI_API_KEY, GOOGLE_API_KEY, etc.
docker compose up -d --build
```

## 🔐 Security Implications

| Aspect | Original | Online-Only |
|--------|----------|-------------|
| **Data Residency** | On-premise (full control) | Cloud provider (per their privacy policy) |
| **Network Traffic** | Asterisk ← → Local AI | Asterisk ← → Local → Cloud API |
| **Credential Exposure** | Local auth tokens | API keys (never in git, .env only) |
| **Compliance** | Full control (HIPAA, etc.) | Depends on provider |

**Recommendation:** For regulated industries, verify cloud provider SOC2/HIPAA compliance before using.

## ✅ Testing After Migration

After migrating to the online-only variant, verify:

1. **Docker Services Running**
   ```bash
   docker compose ps
   # Should show: ai_engine, admin_ui (2 services)
   ```

2. **Configuration Valid**
   ```bash
   docker compose logs ai_engine | grep -i "error\|loading"
   ```

3. **Provider Connectivity**
   ```bash
   # Test OpenAI endpoint
   curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
   ```

4. **Make Test Call**
   - Use Admin UI Setup Wizard
   - Make inbound call to test extension
   - Verify call logs in Call History

## 📞 Support

- **Original Project:** https://github.com/hkjarral/Asterisk-AI-Voice-Agent
- **Discord Community:** https://discord.gg/ysg8fphxUe
- **Issues:** Report on GitHub or Discord

## Rollback

If you need to revert to the original with local AI support:
1. Clone the original repository: `https://github.com/hkjarral/Asterisk-AI-Voice-Agent`
2. Reuse your `.env` file
3. Use original docker-compose setup

---

**Last Updated:** April 2026
**Version:** Based on AVA-AI-Voice-Agent v6.4.1+
