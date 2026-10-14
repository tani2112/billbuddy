# SellCraft — Open-Source AI Product Listing Generator

> **Local, open-weight e-commerce copilot for small business owners, Instagram sellers, resellers, and boutique shops.**  
> Create high-converting SEO titles, product descriptions, 5 key selling points, tags, and Instagram captions in seconds with **100% privacy and zero per-token API fees**.

---

## 1. Project Overview

Small business owners, Instagram sellers, and independent creators spend countless hours writing copy for their catalogs, marketplaces (Etsy, eBay, Shopify, Amazon), and social media. Many cannot afford costly SaaS subscriptions (like Jasper or Copy.ai) or expensive copywriting agencies.

**SellCraft** solves this problem by delivering enterprise-quality listing generation powered by open-weight AI models (such as **Qwen 2.5** and **Llama 3.2**) running locally on the user's machine through **Ollama**.

- **Zero Cloud API Fees:** Generate unlimited listings without an OpenAI/Anthropic subscription or credit card.
- **Total Data Privacy:** Product specs, photos, pricing, and drafts never leave your computer.
- **Multilingual Support:** High-converting copy tailored for English, Hindi, and Hinglish e-commerce sellers.
- **Local Persistence:** Automatic history archiving and bookmarking using SQLite.
- **Marketplace-Ready Export:** 1-click clean formatted TXT download for instant pasting into Etsy, eBay, or Shopify.

---

## 2. Core Features

### 🛒 A. Product Listing Generator Form
- **Product Name & Category:** Handcrafted, Jewelry, Fashion, Home & Living, Beauty, Tech, and more.
- **Features & Specifications:** Dimensions, materials, care instructions, warranty, condition.
- **Target Audience:** Personalize for specific buyer personas (e.g., *gift shoppers, plant parents, college students*).
- **Platform Customization:** Tailored output for **Instagram**, **Etsy**, **eBay**, **Shopify**, and **Amazon**.
- **Copywriting Tone:** *Professional*, *Friendly & Warm*, *Premium & Luxury*, *Persuasive & Urgent*, or *Playful & Witty*.
- **Language Support:** *English*, *Hindi* (Devanagari), and *Hinglish* (conversational social commerce blend).
- **Product Image Upload:** Local image preview (up to 5MB) with optional visual feature detection if an open vision model is installed.

### ⚡ B. Generated Listing Output Cards
Each generation creates 7 distinct, copyable sections:
1. **Primary SEO Product Title:** Keyword-dense, high searchability.
2. **Three Alternative Product Titles:** Short & punchy, feature-dense, and lifestyle/luxury variations for A/B testing.
3. **Structured Product Story & Description:** Emotional hook, problem-solution narrative, and craftsmanship breakdown.
4. **Five Key Selling Points:** Concise, benefit-driven bullets with checkmarks.
5. **Search Keywords & Marketplace Tags:** Searchable keyword chips and 1-click comma-separated export.
6. **Instagram Caption & Hashtags:** Ready-to-post caption with hook, emojis, line breaks, and 15–20 trending hashtags.
7. **Closing Call-to-Action Sentence:** Urgency-driven closing line to drive conversions.

### 💾 C. History & Local Persistence (SQLite)
- Browse, search, and filter past listings by category, platform, or bookmarked favorites.
- Inline modal editor to modify title, description, selling points, or tags before exporting.
- Delete or re-copy any previous listing.

### 📊 D. Seller Dashboard
- Live metrics: Total listings generated, saved favorites, active AI model, and privacy status.
- Distribution breakdown by platform and category.
- Recent products list with 1-click copy, view, and TXT export actions.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       SellCraft Web UI                      │
│        (React 18 + Vite + TypeScript + Tailwind CSS)        │
│    - Dashboard, Generator Form, Result Cards, Saved Archive │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API (port 5173 -> 8000)
┌──────────────────────────────▼──────────────────────────────┐
│                    SellCraft FastAPI Backend                │
│    - /api/generate   - /api/listings   - /api/health        │
│    - /api/dashboard  - /api/analyze-image                   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     SQLite Local Database   ││     Ollama Local Inference    │
│         (sellcraft.db)      ││   (http://localhost:11434/35)│
│  - Listings, Stats, Bookmarks││   - qwen2.5:1.5b (Default)   │
│  - 100% On-Disk Persistence ││   - llama3.2 / llama3.2-vision│
└─────────────────────────────┘└──────────────────────────────┘
```

---

## 4. Prerequisites

- **OS:** Ubuntu 20.04 / 22.04 / 24.04 LTS (or any standard Linux distribution)
- **Python:** 3.10+ (tested on Python 3.14)
- **Node.js:** v18+ or v20+
- **Ollama:** v0.3.0+

---

## 5. Installation & Setup (Ubuntu Linux)

### Step 1: Install & Start Ollama
```bash
# 1. Install Ollama via official installer
curl -fsSL https://ollama.com/install.sh | sh

# 2. Download the recommended open-weight Qwen model (986 MB)
ollama pull qwen2.5:1.5b

# Optional: Download alternative or vision models
ollama pull qwen2.5:3b
ollama pull llama3.2:latest
ollama pull llama3.2-vision:latest

# 3. Start Ollama daemon (if not already running as a systemd service)
ollama serve
```

### Step 2: Clone & Configure Repository
```bash
cd /path/to/SellCraft
cp .env.example .env
```

### Step 3: Setup Backend (Python FastAPI)
```bash
# Create virtual environment
python3 -m venv backend/venv

# Activate virtual environment
source backend/venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# Start backend server on port 8000
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

### Step 4: Setup Frontend (React + Vite)
```bash
# Open a new terminal tab and enter frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```

Now open **`http://localhost:5173`** in your browser!

---

## 6. Environment Variables (`.env`)

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | Auto-detected (`http://localhost:11435` or `11434`) | Ollama API endpoint |
| `OLLAMA_MODEL` | `qwen2.5:1.5b` | Default open-weight language model |
| `OLLAMA_VISION_MODEL` | `llama3.2-vision:latest` | Vision model for photo inspection |
| `OLLAMA_TIMEOUT` | `120.0` | Max inference timeout in seconds |
| `DB_PATH` | `./sellcraft.db` | Path to SQLite database file |
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL for frontend |

---

## 7. Running Backend Tests

SellCraft includes automated test coverage for health diagnostics, schema validation, CRUD operations, TXT exports, and offline Ollama error handling.

Run pytest using:
```bash
PYTHONPATH=. ./backend/venv/bin/pytest backend/tests/test_api.py -v
```

---

## 8. Why Open-Source AI? (Theme & Rationale)

1. **Eliminating the "Token Tax":** Small shop owners operating on thin margins cannot afford recurring per-request API fees. Local inference makes listing generation completely free after the initial download.
2. **Customer & Catalog Privacy:** Proprietary cloud LLMs routinely store prompts and user inputs for retraining. SellCraft ensures confidential recipes, artisan formulas, unpublished collections, and buyer personas never leave your computer.
3. **Offline Reliability:** Once model weights are downloaded, SellCraft operates during internet outages or in remote craft workshops.
4. **Customizability & Portability:** You are not locked into one vendor. Swap models anytime between Qwen, Llama, Mistral, or custom fine-tuned LoRA checkpoints.

### Honest Trade-offs:
- **Hardware Resources:** Local inference requires computer RAM (or GPU VRAM). `qwen2.5:1.5b` is our default because it runs quickly and smoothly even on laptops with 4GB-8GB RAM.
- **Model Output Quality:** Larger models (3B-7B) offer richer vocabulary at the expense of slower token generation on CPU-only machines.

---

## 9. Freemium Business Model (Roadmap)

SellCraft is architected for a sustainable freemium model:
- **Community Edition (Current MVP):** 100% Free and Open-Source. Unlimited local generation, local SQLite persistence, and TXT export.
- **Pro Cloud Edition (Proposed Roadmap):** Optional cloud batch processing (100 products from CSV), direct 1-click sync to Shopify/Etsy APIs, and fine-tuned brand voice models.

*MVP Notice: Payments are intentionally not implemented for the MVP; the community edition is fully functional and free.*

---

## 10. License
MIT License. Built for independent sellers and creators everywhere.
