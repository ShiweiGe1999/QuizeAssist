# 🎓 QuizAssist

<p align="center">
  <strong>Enterprise-Grade AI Quiz Assistant, Study Accelerator & Real-Time Explanation Engine</strong>
</p>

<p align="center">
  <a href="https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js">
    <img src="https://img.shields.io/badge/⚡_One--Click_Install-Tampermonkey-00b894?style=for-the-badge&logo=tampermonkey&logoColor=white" alt="One-Click Install in Tampermonkey" />
  </a>
  <a href="https://github.com/ShiweiGe1999/QuizeAssist/releases">
    <img src="https://img.shields.io/badge/Version-2.4.0-3b82f6?style=for-the-badge&logo=github&logoColor=white" alt="Version 2.4.0" />
  </a>
  <a href="https://buymeacoffee.com/shiweige" target="_blank">
    <img src="https://img.shields.io/badge/Support_Project-Buy_Me_a_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-Zero_Telemetry-success?style=flat-square" alt="Zero Telemetry" />
  <img src="https://img.shields.io/badge/API_Keys-Client--Side_Encrypted-blue?style=flat-square" alt="Client-Side Key Isolation" />
  <img src="https://img.shields.io/badge/Architecture-Shadow_DOM_v1-orange?style=flat-square" alt="Shadow DOM Isolation" />
  <img src="https://img.shields.io/badge/Supported_LMS-Canvas_%7C_Blackboard_%7C_Moodle_%7C_Quizlet_%7C_Custom-6c5ce7?style=flat-square" alt="LMS Supported" />
  <img src="https://img.shields.io/badge/LLM_Providers-OpenAI_%7C_Claude_%7C_Gemini_%7C_Ollama-d63031?style=flat-square" alt="LLMs Supported" />
</p>

---

<p align="center">
  <img src="assets/actual_ui_hero.png" alt="QuizAssist Floating Dock and Live Question Highlight" width="100%" />
</p>

---

## ⚡ Direct 1-Click Installation (Recommended)

> [!TIP]
> **Prerequisite:** Ensure you have the [Tampermonkey browser extension](https://www.tampermonkey.net/) (Chrome, Edge, Firefox, Brave, Safari, or Opera) installed.

### Click the button below to install or update instantly:

<p align="center">
  <a href="https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js">
    <img src="https://img.shields.io/badge/👉_INSTALL_QUIZASSIST_NOW_(v2.4.0)-CLICK_HERE-00b894?style=for-the-badge&logo=tampermonkey&logoColor=white" height="48" alt="Install QuizAssist Now" />
  </a>
</p>

<p align="center">
  Direct Installation URL:  
  <code><a href="https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js">https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js</a></code>
</p>

1. **Click the installation link above.** Tampermonkey will automatically detect the userscript and open the native installation dialog.
2. Click **"Install"** (or **"Update"**).
3. Open any quiz portal or test page (e.g. [`test_quiz.html`](test_quiz.html)).
4. Click the **⚙️ (Settings)** icon on the QuizAssist dock to enter your API credentials or local model endpoint.
5. You're ready to solve with `Alt + S` or full hands-free `🟢 Auto` mode!

---

## 📋 Table of Contents

- [⚡ Direct 1-Click Installation](#-direct-1-click-installation-recommended)
- [✨ Key Enterprise Features](#-key-enterprise-features)
- [🚀 Quick Start Guide](#-quick-start-guide)
- [🎮 Operational Modes & Triggers](#-operational-modes--triggers)
- [🧠 LLM Orchestration & Supported Models](#-llm-orchestration--supported-models)
- [🎯 Visual Selector Studio (Any LMS / Custom DOM)](#-visual-selector-studio-any-lms--custom-dom)
- [🏗️ Enterprise Architecture & Security Posture](#️-enterprise-architecture--security-posture)
- [⌨️ Keyboard Shortcuts Reference](#️-keyboard-shortcuts-reference)
- [🔄 Automated Updates & Lifecycle Management](#-automated-updates--lifecycle-management)
- [⚠️ Academic Integrity & Ethical Use Policy](#️-academic-integrity--ethical-use-policy)
- [☕ Support the Maintainer](#-support-the-maintainer)

---

## ✨ Key Enterprise Features

- **Multi-Provider LLM Orchestration:** Seamless integration with **OpenAI** (`gpt-6.1-sol`, `gpt-6-astra`, `o3-mini`, `gpt-4o`), **Anthropic Claude** (`claude-opus-5-5`, `claude-3-7-sonnet-20250219`), **Google Gemini** (`gemini-3.8-flash`, `gemini-2.5-pro`), and **Local / Self-Hosted** endpoints (`Ollama`, `vLLM`, `LM Studio`, `OpenRouter`).
- **Live Connection Diagnostics:** Test provider connectivity, API keys, and custom base URLs directly within the settings dialog before saving configurations.
- **Zero-Token Client Cache:** Solved quiz items are securely cached in private browser memory. Revisiting previous questions consumes **0 API tokens** with instantaneous recall.
- **Draggable & Collapsible Floating Dock:** Warm-glass floating dock with drag-and-drop repositioning (`⋮⋮` handle), coordinate persistence across page loads, and a single-click collapse toggle (`−` / `⚡ QA`) to keep quiz viewports unobstructed.
- **Interactive Visual Selector Studio:** Built-in 4-step interactive DOM picker allowing zero-code setup on custom, proprietary, or corporate Learning Management Systems (LMS).
- **Stealth & Panic Safeguards:** Global `Alt + H` toggle for immediate hide/reveal, with optional Stealth Mode replacing glowing outlines with subtle dotted indicators.
- **Step-by-Step Pedagogical Explanations:** Deep reasoning modal with confidence percentages, detailed justification for the correct choice, and distractor-by-distractor elimination logic.
- **Dynamic Single-Page Application (SPA) Observer:** Real-time DOM mutation monitoring with intelligent debouncing to detect and solve asynchronously loaded question cards.

---

## 🚀 Quick Start Guide

### Option 1: Direct Automatic Install (10 Seconds)
1. Ensure the [Tampermonkey extension](https://www.tampermonkey.net/) is active in your browser.
2. Click the [One-Click Installation Link](https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js).
3. Tampermonkey opens the verification view. Click **Install**.

### Option 2: Manual Installation (Air-Gapped / Custom Environments)
1. Open your browser's Tampermonkey Dashboard.
2. Click the **Utilities** tab or the **+** (New Script) button.
3. Copy the full content of [`quizassist.user.js`](quizassist.user.js) and paste it into the editor.
4. Press `Ctrl + S` (`Cmd + S` on macOS) to save and activate.

### Initial Configuration
1. Navigate to any supported quiz platform or open the bundled [`test_quiz.html`](test_quiz.html).
2. The sleek QuizAssist floating dock will appear in the bottom-right corner.
3. Click the **⚙️ (Settings)** icon to open the configuration center.
4. Choose your preferred AI provider, paste your API key, and click **🔌 Test AI Connection** to verify live communication.
5. Click **Save Settings**.

---

## 🎮 Operational Modes & Triggers

QuizAssist is built for maximum flexibility, supporting on-demand study assistance and fully autonomous solving workflows:

| Trigger / Action | Mechanism | Behavior |
| :--- | :--- | :--- |
| **Manual Solve** | Click **`⚡ Solve`** or press **`Alt + S`** | Parses visible questions, queries the active LLM, highlights the target answer in emerald green, and injects a step-by-step reasoning badge. |
| **Auto-Solve Toggle** | Click **`⚪ Manual`** / **`🟢 Auto`** or press **`Alt + A`** | Activates continuous autonomous monitoring. New questions on load or dynamically rendered across SPA steps solve automatically. |
| **Autonomous Selection** | Enabled in **⚙️ Settings** | Automatically simulates user interaction to select the radio button or checkbox matching the AI's answer. |
| **Stealth / Panic Hide** | Press **`Alt + H`** | Instantly hides the floating dock and all on-screen highlight cards. Pressing `Alt + H` again instantly restores them. |
| **Dock Repositioning** | Drag **`⋮⋮`** Handle | Reposition the dock anywhere on screen. Position coordinates are saved persistently in browser storage. |
| **Dock Collapse / Expand** | Click **`−`** or **`⚡ QA`** | Minimizes the dock into an unobtrusive micro-pill; double-click the drag handle or click the pill to restore the full dock. |

---

## 🧠 LLM Orchestration & Supported Models

QuizAssist incorporates specialized system prompts engineered to enforce strict JSON schemas across diverse model architectures:

### 1. Anthropic Claude
- **Presets:** `claude-opus-5-5`, `claude-3-7-sonnet-20250219`, `claude-3-5-haiku-20241022`
- **Protocol:** Anthropic Messages API (`/v1/messages`)
- **Key Features:** Exceptional reasoning depth, complex STEM problem solving, and comprehensive distractor analysis.

### 2. OpenAI
- **Presets:** `gpt-6.1-sol`, `gpt-6-astra`, `o3-mini`, `gpt-4o`, `gpt-4o-mini`
- **Protocol:** Chat Completions API (`/v1/chat/completions`) with `json_object` response format enforcement.
- **Key Features:** High-speed inference with cost-optimized models (`o3-mini`, `gpt-4o-mini`).

### 3. Google Gemini
- **Presets:** `gemini-3.8-flash`, `gemini-2.5-pro`, `gemini-2.0-flash`, `gemini-1.5-pro`
- **Protocol:** Google Generative Language API (`v1beta`) with structured `application/json` response MIME types.
- **Key Features:** Ultra-low latency, generous rate limits, and multimodal reasoning capabilities.

### 4. Custom & Self-Hosted (Air-Gapped Privacy)
- **Compatibility:** Ollama, LM Studio, vLLM, LocalAI, OpenRouter, Groq, Mistral AI.
- **Protocol:** Standard OpenAI-compatible `/chat/completions` endpoint.
- **Configuration:** Set custom base URL (e.g. `http://localhost:11434/v1/chat/completions`) and model name (e.g. `llama3.1:70b`, `deepseek-r1`).

---

## 🎯 Visual Selector Studio (Any LMS / Custom DOM)

QuizAssist features universal heuristics that automatically detect standard quiz question patterns (Canvas LMS, Blackboard, Moodle, Brightspace, Quizlet, Google Forms, Typeform, WebAssign).

For proprietary portals, enterprise training systems, or custom platforms:

```
[ Click 🎯 Pick ] ──► [ Click Question Card ] ──► [ Click Question Title ] ──► [ Click First Choice ] ──► [ Click Choice Text ] ──► [ Auto-Saved! ]
```

1. Click **`🎯 Pick`** on the dock (or **Launch Visual Selector Picker** in Settings).
2. The **Interactive HUD** will guide you step-by-step:
   - **Step 1:** Click any container card wrapping a full question.
   - **Step 2:** Click the question text / prompt.
   - **Step 3:** Click any answer choice element (radio label or container).
   - **Step 4:** Click the inner answer label text (or click *Skip*).
3. QuizAssist generates optimized, resilient CSS selectors scoped specifically to the current domain and persists them automatically.

---

## 🏗️ Enterprise Architecture & Security Posture

QuizAssist adheres to strict zero-trust, privacy-first engineering standards:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Target Web Page (Host DOM)                      │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │             #quizassist-root (Shadow DOM v1 Closed)            │   │
│   │   ┌───────────────────────┐    ┌───────────────────────────┐   │   │
│   │   │  Warm Glass Dock      │    │  Reasoning & Settings     │   │   │
│   │   │  (Drag / Collapse)    │    │  Modals                   │   │   │
│   │   └───────────────────────┘    └───────────────────────────┘   │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                    (GM_xmlhttpRequest Cross-Origin)
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │  Direct Secure Transport (HTTPS TLS 1.3)                │
        │  To: Anthropic / OpenAI / Gemini / Self-Hosted LLM      │
        │  Payload: Stripped Question Prompt & Choices Only       │
        └─────────────────────────────────────────────────────────┘
```

- **Zero Third-Party Telemetry:** QuizAssist contains zero tracking scripts, zero analytics, zero external logging, and zero intermediary proxy servers. Requests travel **directly** from your browser to your configured AI provider via secure HTTPS.
- **Local Storage Isolation:** All configurations, encrypted API keys, domain profiles, and cache databases are stored strictly in your browser's private Tampermonkey sandbox (`GM_setValue` / `GM_getValue`).
- **Encapsulated Shadow DOM Styling:** The UI is rendered inside a dedicated Shadow DOM root (`#quizassist-root`), ensuring full isolation from host stylesheets and preventing CSS bleed in either direction.
- **Domain Whitelisting & Control:** Whitelist specific hostnames (e.g. `canvas.instructure.com`, `mycourses.edu`) or enable global wildcards (`*`) to ensure execution only where explicitly authorized.
- **Safe 7-Bit ASCII Encoding:** All UI strings and symbols use explicit Unicode escape sequences (`\uXXXX`), guaranteeing flawless rendering regardless of host page encoding (`UTF-8`, `Windows-1252`, `ISO-8859-1`, or `GBK`).

---

## ⌨️ Keyboard Shortcuts Reference

All hotkeys can be customized with single-press key recording in **⚙️ Settings** → **Modes & Triggers**:

| Default Shortcut | Function | Description |
| :---: | :--- | :--- |
| **`Alt + S`** | **Manual Solve** | Triggers AI solving for all visible, unsolved questions on the page. |
| **`Alt + A`** | **Toggle Auto-Solve** | Cycles between Manual mode (`⚪`) and Autonomous Auto-Solve mode (`🟢`). |
| **`Alt + H`** | **Panic / Stealth Hide** | Instantly hides the floating dock and all answer highlights from view. |

---

## 🔄 Automated Updates & Lifecycle Management

Never miss critical quiz detector updates, new LLM models, or feature enhancements:

1. **Automated Background Sync:** Tampermonkey automatically queries `@updateURL` every 24 hours. When a new release is pushed to GitHub, Tampermonkey updates QuizAssist silently without overwriting your saved keys or custom domain profiles.
2. **Instant In-App Update Verification:** Open **⚙️ Settings** → **Version & Updates** and click **`🔄 Check for Updates`**. QuizAssist queries GitHub releases in real time and offers instant 1-click upgrade prompts.
3. **Permanent Direct Install Link:**
   ```
   https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js
   ```

---

## ⚠️ Academic Integrity & Ethical Use Policy

> **IMPORTANT NOTICE:**  
> QuizAssist is developed and distributed strictly for **educational self-study, homework verification, and pedagogical research purposes**.
>
> - **Recommended Use:** Use QuizAssist as a study companion to verify practice problems, check your comprehension after completing exercises independently, and learn from detailed distractor explanations.
> - **Prohibited Use:** Do **not** use QuizAssist on proctored exams, timed assessments, graded tests, or any academic evaluation where unauthorized aids or external assistants are disallowed.
> - **User Responsibility:** Users bear sole legal and institutional responsibility for complying with their school or university honor codes, institutional academic honesty policies, and website terms of service. The authors and maintainers do not endorse, facilitate, or condone academic dishonesty.

---

## ☕ Support the Maintainer

QuizAssist is an independent open-source project maintained with ❤️ for students, researchers, and lifelong learners worldwide.

If QuizAssist has accelerated your learning workflow or saved you hours of study time, supporting ongoing development is warmly appreciated:

<p align="center">
  <a href="https://buymeacoffee.com/shiweige" target="_blank">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-shiweige-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
  <br><br>
  👉 <strong><a href="https://buymeacoffee.com/shiweige">buymeacoffee.com/shiweige</a></strong>
</p>

---

<p align="center">
  <sub>QuizAssist • Released under the MIT License • Built with Modern Web Standards & Shadow DOM v1</sub>
</p>
