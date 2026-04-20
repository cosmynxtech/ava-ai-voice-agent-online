# AVA-AI-Voice-Agent (Online Only Variant)

This is a streamlined version of the **Asterisk AI Voice Agent** configured to use **only cloud-based AI providers**. The local AI server and local service dependencies have been removed.

## 🚀 Quick Start

### 1. Clone/Copy Project
```bash
cd New_Project
```

### 2. Run Pre-flight Check (Required)
```bash
# This creates .env file and generates JWT_SECRET
# Note: You'll need to customize this for online-only setup
sudo ./preflight.sh --apply-fixes
```

### 3. Configure Cloud Provider Credentials

Edit `.env` and add your AI provider API keys:

```bash
# Pick ONE or MORE providers:

# OpenAI (Recommended for getting started)
OPENAI_API_KEY=sk-...

# Google Gemini Live (Fast, multilingual)
GOOGLE_API_KEY=AIzaSy...

# Deepgram Voice Agent (Enterprise-grade)
DEEPGRAM_API_KEY=...

# Microsoft Azure Speech
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=eastus

# ElevenLabs (Premium TTS)
ELEVENLABS_API_KEY=...
```

### 4. Start the Services

```bash
# Start ai_engine (main agent service)
docker compose up -d --build ai_engine

# Start admin_ui (web dashboard)
docker compose up -d --build admin_ui
```

### 5. Access Admin Dashboard

Open in your browser:
- **Local:** `http://localhost:3003`
- **Remote server:** `http://<server-ip>:3003`

**Default Login:** `admin` / `admin`

⚠️ **Security:** Change the default password immediately and restrict port 3003 via firewall for production use.

## 📋 Supported AI Providers

### Monolithic (Full Agent - Bidirectional)
- **Google Gemini Live** - Fastest response (<1s), 24+ languages
- **Deepgram Voice Agent** - Enterprise with thinking stage, ~8¢/min
- **OpenAI Realtime** - Natural speech-to-speech, 10 voice options

### Modular (Component-Based Pipelines)
| Component | Providers |
|-----------|-----------|
| **STT (Speech-to-Text)** | OpenAI Whisper, Google Speech, Azure Speech, Groq, Deepgram |
| **LLM** | OpenAI, Google Gemini, Azure OpenAI, Telnyx, MiniMax |
| **TTS (Text-to-Speech)** | OpenAI, Google TTS, Azure Speech, ElevenLabs, CAMB AI |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Asterisk/FreePBX                    │
│                   (Your Phone System)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                    AudioSocket or RTP
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
    ┌──────────────────┐               ┌───────────────────┐
    │   ai_engine      │◄──────────────►│   admin_ui        │
    │  (Python)        │  Docker API    │  (React + FastAPI)│
    │  STT → LLM → TTS │               │  Web Dashboard    │
    └─────────┬────────┘               └───────────────────┘
              │
              │ HTTP/gRPC/WebSocket
              │
    ┌─────────▼────────────────────────────────────────┐
    │   Cloud AI Provider (OpenAI, Google, Deepgram)  │
    │        via Internet/API Endpoints                │
    └──────────────────────────────────────────────────┘
```

## 📝 Configuration

### Default Configuration
The default pipeline uses **Google Gemini Live** (fastest, free tier available):

```yaml
# config/ai-agent.yaml
default_provider: google_live
```

### Change Default Provider
Edit `config/ai-agent.yaml`:

```yaml
# Option 1: Use OpenAI Realtime
default_provider: openai_realtime

# Option 2: Use Deepgram
default_provider: deepgram

# Option 3: Create custom pipeline
pipelines:
  my_custom:
    stt: openai_stt
    llm: openai_llm
    tts: elevenlabs_tts
```

### Environment Variables
- All cloud provider API keys go in `.env`
- Audio transport settings in `config/ai-agent.yaml`
- Asterisk connection details in `.env` (ASTERISK_HOST, ASTERISK_ARI_*)

## 🗑️ What's Different from Original?

| Component | Original | Online-Only |
|-----------|----------|-------------|
| **Local AI Server** | ✅ Included | ❌ Removed |
| **docker-compose.yml** | 3 services (ai_engine, local_ai_server, admin_ui) | 2 services (ai_engine, admin_ui) |
| **.env variables** | LOCAL_* for local AI config | All removed/disabled |
| **config/ai-agent.yaml** | default_provider: local_hybrid | default_provider: google_live |
| **Admin UI routes** | /api/local-ai/* endpoints | Disabled |
| **Setup complexity** | GPU setup, model downloads | Just API keys |

## 📚 Documentation

- **Installation:** See original repo at https://github.com/hkjarral/Asterisk-AI-Voice-Agent
- **Configuration Guide:** `config/ai-agent.yaml` (detailed comments)
- **Transport Modes:** AudioSocket, ExternalMedia, WebSocket
- **Troubleshooting:** Check logs with `docker compose logs ai_engine`

## 🔗 Original Project

This is a variant of:
- **Repository:** https://github.com/hkjarral/Asterisk-AI-Voice-Agent
- **Docs:** https://docs.asterisk-ai-voice-agent.com
- **Community:** Discord: https://discord.gg/ysg8fphxUe

## ⚙️ Troubleshooting

### ai_engine won't connect to Asterisk
```bash
# Check Asterisk ARI connection
curl http://ASTERISK_HOST:8088/ari -u ASTERISK_ARI_USERNAME:ASTERISK_ARI_PASSWORD

# Check container logs
docker compose logs ai_engine | tail -50
```

### Admin UI can't reach ai_engine
```bash
# Verify ai_engine is running and healthy
docker compose ps
docker compose exec ai_engine curl http://localhost:15000/health
```

### Cloud provider API errors
```bash
# Verify API key is set and valid
echo $OPENAI_API_KEY
# Test provider connection
docker compose logs ai_engine | grep -i "error\|provider"
```

## 📋 Requirements

- **Docker & Docker Compose** (latest)
- **Python 3.11+** (for ai_engine)
- **Node.js 18+** (for admin_ui frontend build)
- **Asterisk/FreePBX 18+** with ARI enabled
- **Cloud Provider API Keys** (OpenAI, Google, etc.)

No GPU or local models required.

## 📄 License

MIT License - Same as original Asterisk AI Voice Agent project

---

**Last Updated:** April 2026
**Based on:** AVA-AI-Voice-Agent v6.4.1+
