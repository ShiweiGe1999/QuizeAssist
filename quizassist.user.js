// ==UserScript==
// @name         QuizAssist - AI Quiz Solver & Explainer
// @namespace    https://github.com/ShiweiGe1999/QuizeAssist
// @version      2.6.0
// @description  Intelligent AI Quiz Assistant with Auto-Solve, Keyboard Shortcuts, and Step-by-Step Explanations.
// @author       QuizAssist Team
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js
// @downloadURL  https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @connect      *
// @connect      raw.githubusercontent.com
// @connect      github.com
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  /**
   * =========================================================================
   * CONSTANTS, VERSION & LATEST MODEL PRESETS
   * =========================================================================
   */
  const SCRIPT_VERSION = '2.6.0';
  const UPDATE_URL = 'https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js';
  const DOWNLOAD_URL = 'https://raw.githubusercontent.com/ShiweiGe1999/QuizeAssist/main/quizassist.user.js';

  const MODEL_PRESETS = {
    claude: [
      { id: 'claude-opus-5-5', name: 'Claude Opus 5.5 (Frontier Autonomous Reasoning)' },
      { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5 (Recommended / Balanced Intelligence)' },
      { id: 'claude-sonnet-5', name: 'Claude Sonnet 5 (Frontier High-Speed Workhorse)' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5 (High-Speed Inference)' },
      { id: 'claude-3-7-sonnet-latest', name: 'Claude 3.7 Sonnet (Hybrid Thinking)' },
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet (Classic Standard)' },
      { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku (Legacy Fast)' }
    ],
    openai: [
      { id: 'gpt-6.1-sol', name: 'GPT-6.1 Sol (Recommended / High-Efficiency Frontier)' },
      { id: 'gpt-6-astra', name: 'GPT-6 Astra (Frontier Flagship / Deep Deliberation)' },
      { id: 'gpt-6-luna', name: 'GPT-6 Luna (Lightweight Fast)' },
      { id: 'o3', name: 'o3 (Frontier Math & Deep Logic Reasoning)' },
      { id: 'o3-mini', name: 'o3-mini (High-Speed STEM Reasoning)' },
      { id: 'gpt-4o', name: 'GPT-4o (Classic Multimodal Standard)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Cost-Effective Fast Standard)' }
    ],
    gemini: [
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Recommended / Frontier Fast Deliberation)' },
      { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro (Frontier Complex Reasoning & STEM)' },
      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite (Ultra-Low Latency & High Throughput)' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Proven Fast Workhorse)' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Deep Adaptive Reasoning)' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (General Multimodal Standard)' }
    ]
  };

  const DEFAULT_CONFIG = {
    enabled: true,
    allowedDomains: ['*'],
    activeProvider: 'claude',
    claudeApiKey: '',
    claudeModel: 'claude-opus-5-5',
    openaiApiKey: '',
    openaiModel: 'gpt-6.1-sol',
    geminiApiKey: '',
    geminiModel: 'gemini-3.8-flash',
    customApiKey: '',
    customEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    customModel: 'meta-llama/llama-3.1-70b-instruct',
    temperature: 0.1,
    stealthMode: false,
    cacheEnabled: true,
    autoSolveOnLoad: false,
    autoClickAnswers: false,
    autoSolveDelay: 1.5,
    solveShortcut: 'Alt+S',
    toggleAutoShortcut: 'Alt+A',
    hideShortcut: 'Alt+H',
    domainProfiles: {
      'default': {
        questionContainer: '.question, .quiz-question, .q-item, [role="radiogroup"], fieldset, .form-group',
        questionText: '.question-text, .q-title, .prompt, legend, h3, h4, p',
        answerOption: '.option, .choice, .answer, .form-check, label',
        answerText: '.option-text, .choice-label, span, label'
      }
    }
  };

  /**
   * =========================================================================
   * UPDATE MANAGER
   * =========================================================================
   */
  class UpdateManager {
    static async checkForUpdates() {
      return new Promise((resolve) => {
        try {
          GM_xmlhttpRequest({
            method: 'GET',
            url: UPDATE_URL + '?t=' + Date.now(),
            timeout: 10000,
            onload: (res) => {
              if (res.status >= 200 && res.status < 300) {
                const match = res.responseText.match(/@version\s+([0-9.]+)/i);
                if (match && match[1]) {
                  const remoteVer = match[1].trim();
                  const isNewer = this.compareVersions(remoteVer, SCRIPT_VERSION) > 0;
                  resolve({ success: true, isNewer, latestVersion: remoteVer, currentVersion: SCRIPT_VERSION });
                  return;
                }
              }
              resolve({ success: false, currentVersion: SCRIPT_VERSION });
            },
            onerror: () => resolve({ success: false, currentVersion: SCRIPT_VERSION }),
            ontimeout: () => resolve({ success: false, currentVersion: SCRIPT_VERSION })
          });
        } catch (e) {
          resolve({ success: false, currentVersion: SCRIPT_VERSION });
        }
      });
    }

    static compareVersions(v1, v2) {
      const p1 = v1.split('.').map(n => parseInt(n, 10) || 0);
      const p2 = v2.split('.').map(n => parseInt(n, 10) || 0);
      for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const num1 = p1[i] || 0;
        const num2 = p2[i] || 0;
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
      }
      return 0;
    }
  }

  /**
   * =========================================================================
   * CONFIG & STORAGE MANAGER
   * =========================================================================
   */
  class ConfigManager {
    static get() {
      try {
        const stored = GM_getValue('quizassist_config', null);
        if (!stored) return { ...DEFAULT_CONFIG };
        const parsed = JSON.parse(stored);
        const config = {
          ...DEFAULT_CONFIG,
          ...parsed,
          domainProfiles: { ...DEFAULT_CONFIG.domainProfiles, ...(parsed.domainProfiles || {}) }
        };

        // Auto-migrate obsolete or invalid model identifiers from previous versions
        if (config.openaiModel === 'gpt-6.1' || config.openaiModel === 'gpt-6.1-mini') {
          config.openaiModel = 'gpt-6.1-sol';
        } else if (config.openaiModel === 'o4-mini') {
          config.openaiModel = 'o3-mini';
        }
        if (config.geminiModel === 'gemini-3.8-pro') {
          config.geminiModel = 'gemini-3.1-pro';
        }
        return config;
      } catch (e) {
        console.error('[QuizAssist] Error reading config:', e);
        return { ...DEFAULT_CONFIG };
      }
    }

    static save(config) {
      try {
        GM_setValue('quizassist_config', JSON.stringify(config));
      } catch (e) {
        console.error('[QuizAssist] Error saving config:', e);
      }
    }

    static update(partial) {
      const current = this.get();
      const updated = { ...current, ...partial };
      this.save(updated);
      return updated;
    }

    static getDomainProfile(hostname = window.location.hostname) {
      const config = this.get();
      if (config.domainProfiles && config.domainProfiles[hostname]) {
        return config.domainProfiles[hostname];
      }
      return config.domainProfiles['default'] || DEFAULT_CONFIG.domainProfiles['default'];
    }

    static setDomainProfile(hostname, profile) {
      const config = this.get();
      if (!config.domainProfiles) config.domainProfiles = {};
      config.domainProfiles[hostname] = profile;
      this.save(config);
    }

    static isDomainAllowed(hostname = window.location.hostname) {
      const config = this.get();
      if (!config.enabled) return false;
      const domains = config.allowedDomains || ['*'];
      if (domains.includes('*')) return true;

      return domains.some(pattern => {
        if (pattern === hostname) return true;
        if (pattern.startsWith('*.') && hostname.endsWith(pattern.slice(2))) return true;
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
          return regex.test(hostname);
        }
        return false;
      });
    }

    static toggleDomain(hostname = window.location.hostname) {
      const config = this.get();
      let domains = [...(config.allowedDomains || [])];
      const index = domains.indexOf(hostname);
      if (index >= 0) {
        domains.splice(index, 1);
      } else {
        domains.push(hostname);
      }
      config.allowedDomains = domains;
      this.save(config);
      return domains.includes(hostname) || domains.includes('*');
    }
  }

  /**
   * =========================================================================
   * CACHE MANAGER
   * =========================================================================
   */
  class CacheManager {
    static hashString(str) {
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return 'qa_hash_' + Math.abs(hash);
    }

    static get(questionText, options) {
      const config = ConfigManager.get();
      if (!config.cacheEnabled) return null;
      try {
        const key = this.hashString(questionText.trim() + '||' + options.map(o => o.trim()).join(';;'));
        const cached = GM_getValue(key, null);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        console.warn('[QuizAssist] Cache read error:', e);
      }
      return null;
    }

    static set(questionText, options, result) {
      const config = ConfigManager.get();
      if (!config.cacheEnabled) return;
      try {
        const key = this.hashString(questionText.trim() + '||' + options.map(o => o.trim()).join(';;'));
        GM_setValue(key, JSON.stringify(result));
      } catch (e) {
        console.warn('[QuizAssist] Cache write error:', e);
      }
    }

    static clearAll() {
      try {
        const keys = GM_listValues();
        let count = 0;
        keys.forEach(k => {
          if (k.startsWith('qa_hash_')) {
            GM_deleteValue(k);
            count++;
          }
        });
        return count;
      } catch (e) {
        console.error('[QuizAssist] Cache clear error:', e);
        return 0;
      }
    }

    static count() {
      try {
        const keys = GM_listValues();
        return keys.filter(k => k.startsWith('qa_hash_')).length;
      } catch (e) {
        return 0;
      }
    }
  }

  /**
   * =========================================================================
   * AI CLIENT ENGINE
   * =========================================================================
   */
  class AIClient {
    static async solveQuestion(question, options, overrideConfig = null, bypassCache = false) {
      if (!bypassCache) {
        const cached = CacheManager.get(question, options);
        if (cached) {
          return { ...cached, isCached: true };
        }
      }

      const baseConfig = ConfigManager.get();
      const config = overrideConfig ? { ...baseConfig, ...overrideConfig } : baseConfig;
      const provider = config.activeProvider;

      let rawResult = null;
      switch (provider) {
        case 'claude':
          rawResult = await this.callClaude(config, question, options);
          break;
        case 'openai':
          rawResult = await this.callOpenAI(config, question, options);
          break;
        case 'gemini':
          rawResult = await this.callGemini(config, question, options);
          break;
        case 'custom':
          rawResult = await this.callCustom(config, question, options);
          break;
        default:
          throw new Error(`Unknown AI Provider: ${provider}`);
      }

      const normalizedResult = this.normalizeResult(rawResult, options);

      if (!bypassCache && normalizedResult && normalizedResult.correctIndexes && normalizedResult.correctIndexes.length > 0) {
        CacheManager.set(question, options, normalizedResult);
      }

      return normalizedResult;
    }

    static isReasoningModel(modelName) {
      if (!modelName) return false;
      return /^(o1|o3|o4|o5|gpt-6|gpt-5)/i.test(modelName.trim());
    }

    static buildPrompt(question, options) {
      const formattedOptions = options.map((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        return `[${i}] (Option ${letter}): ${opt}`;
      }).join('\n');

      return `You are an expert educational tutor for QuizAssist.
Carefully analyze the following quiz question and possible answer choices:

QUESTION:
${question}

OPTIONS:
${formattedOptions}

INSTRUCTIONS:
1. Identify the 0-indexed integer(s) of ALL correct answer(s).
   - For single-choice questions: return a single index (e.g. [0]).
   - For multi-select questions (e.g. "Select all that apply", multiple checkboxes): return ALL correct indexes in the array (e.g. [0, 2]).
2. Provide a confidence score between 1 and 100.
3. Provide a clear, thoughtful explanation of why the selected answer(s) are correct.
4. For every incorrect option, provide a concise explanation of why it is eliminated/distractor.

You MUST respond strictly with a valid JSON object in the following format with NO trailing commas:
{
  "correctIndexes": [0],
  "confidence": 98,
  "explanation": "Detailed step-by-step reasoning...",
  "eliminations": [
    { "index": 1, "reason": "Why option 1 is incorrect..." },
    { "index": 2, "reason": "Why option 2 is incorrect..." }
  ]
}`;
    }

    static parseJsonResponse(rawText) {
      try {
        let cleaned = rawText.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
        }
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(cleaned);
      } catch (err) {
        console.error('[QuizAssist] Failed to parse JSON from AI response:', rawText);
        throw new Error('AI returned an invalid JSON structure. Check provider output.');
      }
    }

    static normalizeResult(raw, options) {
      if (!raw) raw = {};
      const numOptions = options.length;
      let indexes = [];

      let candidates = raw.correctIndexes || raw.correct_indexes || raw.correctIndex || raw.correct_index || raw.correctAnswer || raw.answer || [];
      if (!Array.isArray(candidates)) {
        candidates = [candidates];
      }

      candidates.forEach(cand => {
        if (typeof cand === 'number') {
          if (cand >= numOptions && cand === numOptions) {
            indexes.push(cand - 1);
          } else if (cand >= 0 && cand < numOptions) {
            indexes.push(cand);
          }
        } else if (typeof cand === 'string') {
          const str = cand.trim().toUpperCase();
          if (/^[A-Z]$/.test(str)) {
            const idx = str.charCodeAt(0) - 65;
            if (idx >= 0 && idx < numOptions) indexes.push(idx);
          } else if (/^OPTION\s*([A-Z0-9]+)/i.test(str)) {
            const match = str.match(/^OPTION\s*([A-Z0-9]+)/i);
            const token = match[1];
            if (/^[A-Z]$/.test(token)) {
              const idx = token.charCodeAt(0) - 65;
              if (idx >= 0 && idx < numOptions) indexes.push(idx);
            } else if (!isNaN(parseInt(token))) {
              const num = parseInt(token);
              if (num >= 0 && num < numOptions) indexes.push(num);
              else if (num > 0 && num <= numOptions) indexes.push(num - 1);
            }
          } else {
            const lowerCand = cand.toLowerCase().trim();
            const matchedIdx = options.findIndex(opt => {
              const optLower = opt.toLowerCase().trim();
              return optLower === lowerCand || optLower.includes(lowerCand) || lowerCand.includes(optLower);
            });
            if (matchedIdx !== -1) indexes.push(matchedIdx);
          }
        }
      });

      indexes = Array.from(new Set(indexes));

      if (indexes.length === 0) {
        indexes = [0];
      }

      return {
        correctIndexes: indexes,
        confidence: typeof raw.confidence === 'number' ? Math.min(100, Math.max(1, raw.confidence)) : 95,
        explanation: raw.explanation || 'The model selected this option based on domain principles.',
        eliminations: Array.isArray(raw.eliminations) ? raw.eliminations : []
      };
    }

    static async callClaude(config, question, options) {
      const apiKey = config.claudeApiKey?.trim();
      if (!apiKey) throw new Error('Claude API key is not configured. Open QuizAssist Settings (\u2699\uFE0F).');
      const model = config.claudeModel?.trim() || 'claude-opus-5-5';
      const url = 'https://api.anthropic.com/v1/messages';

      const prompt = this.buildPrompt(question, options);
      const payload = {
        model: model,
        max_tokens: 3000,
        system: "You are an expert quiz solver. Respond solely with a raw JSON object complying with the user schema.",
        messages: [{ role: "user", content: prompt }]
      };

      const response = await this.requestWithRetry('POST', url, {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      }, JSON.stringify(payload));

      const json = JSON.parse(response.responseText);
      if (json.error) {
        throw new Error(`Claude API Error: ${json.error.message || JSON.stringify(json.error)}`);
      }
      
      const textBlock = json.content?.find(b => b.type === 'text') || json.content?.[0];
      const text = textBlock?.text;
      if (!text) throw new Error('No text response returned by Claude.');
      return this.parseJsonResponse(text);
    }

    static async callOpenAI(config, question, options) {
      const apiKey = config.openaiApiKey?.trim();
      if (!apiKey) throw new Error('OpenAI API key is not configured. Please enter your API key.');
      let model = config.openaiModel?.trim() || 'gpt-6.1-sol';
      if (model === 'gpt-6.1' || model === 'gpt-6.1-mini') model = 'gpt-6.1-sol';
      if (model === 'o4-mini') model = 'o3-mini';
      const url = 'https://api.openai.com/v1/chat/completions';
      const prompt = this.buildPrompt(question, options);

      const isReasoning = this.isReasoningModel(model);

      const buildPayload = (omitTemp = true, useUserOnly = false) => {
        const sysMsg = "You are an expert quiz solver that responds exclusively in JSON format complying with the provided schema.";
        let messages = [];

        if (useUserOnly || isReasoning) {
          messages = [
            { role: isReasoning ? "developer" : "user", content: isReasoning ? sysMsg : `${sysMsg}\n\n${prompt}` }
          ];
          if (isReasoning) {
            messages.push({ role: "user", content: prompt });
          }
        } else {
          messages = [
            { role: "system", content: sysMsg },
            { role: "user", content: prompt }
          ];
        }

        const payload = {
          model: model,
          response_format: { type: "json_object" },
          messages: messages
        };

        if (!isReasoning && !omitTemp) {
          payload.temperature = config.temperature ?? 0.1;
        }

        if (isReasoning) {
          payload.max_completion_tokens = 3000;
        } else {
          payload.max_tokens = 3000;
        }

        return payload;
      };

      let lastErr = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const omitTemperature = isReasoning || attempt >= 1;
        const useUserOnly = attempt >= 2;
        const payload = buildPayload(omitTemperature, useUserOnly);

        try {
          const response = await this.requestWithRetry('POST', url, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }, JSON.stringify(payload));

          const json = JSON.parse(response.responseText);
          if (json.error) {
            throw new Error(`OpenAI API Error: ${json.error.message || JSON.stringify(json.error)}`);
          }
          const text = json.choices?.[0]?.message?.content;
          if (!text) throw new Error('No answer content returned by OpenAI.');
          return this.parseJsonResponse(text);
        } catch (err) {
          lastErr = err;
          const msg = (err.message || '').toLowerCase();
          if (msg.includes('temperature') || msg.includes('unsupported value') || msg.includes('system') || msg.includes('developer') || msg.includes('max_tokens')) {
            console.warn(`[QuizAssist] OpenAI parameter rejection detected on attempt ${attempt + 1}. Retrying with adapted parameters...`, msg);
            continue;
          }
          throw err;
        }
      }

      throw lastErr;
    }

    static async callGemini(config, question, options) {
      const apiKey = config.geminiApiKey?.trim();
      if (!apiKey) throw new Error('Gemini API key is not configured. Please enter your API key.');
      let model = (config.geminiModel?.trim() || 'gemini-3.8-flash').replace(/^models\//, '');
      if (model === 'gemini-3.8-pro') model = 'gemini-3.1-pro';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const prompt = this.buildPrompt(question, options);
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await this.requestWithRetry('POST', url, { 'Content-Type': 'application/json' }, JSON.stringify(payload));
      const json = JSON.parse(response.responseText);
      if (json.error) {
        throw new Error(`Gemini API Error: ${json.error.message || JSON.stringify(json.error)}`);
      }
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response text returned by Gemini.');
      return this.parseJsonResponse(text);
    }

    static async callCustom(config, question, options) {
      const endpoint = config.customEndpoint?.trim();
      if (!endpoint) throw new Error('Custom endpoint URL is not configured. Open QuizAssist Settings (\u2699\uFE0F).');
      const model = config.customModel?.trim() || 'meta-llama/llama-3.1-70b-instruct';
      const apiKey = config.customApiKey?.trim() || '';

      const prompt = this.buildPrompt(question, options);
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const payload = {
        model: model,
        temperature: config.temperature ?? 0.1,
        messages: [
          { role: "system", content: "You are an expert quiz solver that responds exclusively in JSON format." },
          { role: "user", content: prompt }
        ]
      };

      const response = await this.requestWithRetry('POST', endpoint, headers, JSON.stringify(payload));
      const json = JSON.parse(response.responseText);
      if (json.error) {
        throw new Error(`Custom API Error: ${json.error.message || JSON.stringify(json.error)}`);
      }
      const text = json.choices?.[0]?.message?.content;
      if (!text) throw new Error('No response returned by custom endpoint.');
      return this.parseJsonResponse(text);
    }

    static async requestWithRetry(method, url, headers, data, maxRetries = 2) {
      let delay = 1200;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await this.request(method, url, headers, data);
        } catch (err) {
          const isTransient = /429|500|502|503|504|timeout|network/i.test(err.message || '');
          if (isTransient && attempt < maxRetries) {
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            continue;
          }
          throw err;
        }
      }
    }

    static request(method, url, headers, data) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method,
          url,
          headers,
          data,
          timeout: 30000,
          onload: (res) => {
            if (res.status >= 200 && res.status < 300) {
              resolve(res);
            } else {
              try {
                const errObj = JSON.parse(res.responseText);
                reject(new Error(errObj.error?.message || errObj.message || `HTTP ${res.status}: ${res.statusText}`));
              } catch (e) {
                reject(new Error(`HTTP ${res.status}: ${res.statusText} - ${res.responseText.substring(0, 150)}`));
              }
            }
          },
          onerror: () => reject(new Error('Network request failed. Check internet connection or CORS settings.')),
          ontimeout: () => reject(new Error('API request timed out (30s).'))
        });
      });
    }

    static async testConnection(provider, customSettings = {}) {
      const baseConfig = ConfigManager.get();
      const config = { ...baseConfig, ...customSettings, activeProvider: provider };

      switch (provider) {
        case 'claude':
          if (!config.claudeApiKey?.trim()) {
            throw new Error('Claude API key is empty. Please enter your API key.');
          }
          break;
        case 'openai':
          if (!config.openaiApiKey?.trim()) {
            throw new Error('OpenAI API key is empty. Please enter your API key.');
          }
          break;
        case 'gemini':
          if (!config.geminiApiKey?.trim()) {
            throw new Error('Gemini API key is empty. Please enter your API key.');
          }
          break;
        case 'custom':
          if (!config.customEndpoint?.trim()) {
            throw new Error('Custom endpoint URL is empty. Please enter the endpoint URL.');
          }
          break;
      }

      const testQ = "What is the capital of France?";
      const testOpts = ["Berlin", "Madrid", "Paris", "Rome"];
      return await this.solveQuestion(testQ, testOpts, config, true);
    }
  }

  /**
   * =========================================================================
   * DOM EXTRACTOR & SELECTOR ENGINE
   * =========================================================================
   */
  class DOMExtractor {
    static isElementVisible(el) {
      if (!el) return false;
      try {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        if (el.closest('[hidden], [aria-hidden="true"], .hidden, .hide, .collapse:not(.show), .tab-pane:not(.active), .carousel-item:not(.active)')) {
          return false;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          return false;
        }
      } catch (e) {}
      return true;
    }

    static isQuestionSolved(q) {
      if (!q || !q.container) return false;
      const solvedText = q.container.getAttribute('data-qa-solved-text');
      if (solvedText && q.questionText && solvedText.trim() === q.questionText.trim()) {
        const hasExplainBtn = !!q.container.querySelector('.qa-explain-trigger');
        const hasHighlight = !!q.container.querySelector('[data-qa-highlighted="true"]');
        if (hasExplainBtn || hasHighlight) {
          return true;
        }
      }
      return false;
    }

    static getQuestions(onlyUnsolved = false) {
      const profile = ConfigManager.getDomainProfile();
      let containers = [];

      try {
        if (profile.questionContainer) {
          containers = Array.from(document.querySelectorAll(profile.questionContainer));
        }
      } catch (e) {
        console.warn('[QuizAssist] Error with custom container selector, falling back to heuristics:', e);
      }

      if (containers.length === 0) {
        containers = this.detectContainersHeuristically();
      }

      // Filter containers that are currently visible in the DOM
      containers = containers.filter(c => this.isElementVisible(c));

      const parsedQuestions = containers.map((container, index) => {
        return this.parseQuestionContainer(container, profile, index);
      }).filter(q => q && q.questionText && q.options.length >= 2);

      if (onlyUnsolved) {
        return parsedQuestions.filter(q => !this.isQuestionSolved(q));
      }

      return parsedQuestions;
    }

    static parseQuestionContainer(container, profile, index) {
      let qTextEl = null;
      if (profile.questionText) {
        qTextEl = container.querySelector(profile.questionText);
      }
      if (!qTextEl) {
        qTextEl = container.querySelector('.question-text, .q-title, .title, legend, h3, h4, strong, p') || container.firstElementChild;
      }

      const questionText = qTextEl ? qTextEl.innerText.trim() : '';

      let optionEls = [];
      if (profile.answerOption) {
        optionEls = Array.from(container.querySelectorAll(profile.answerOption));
      }
      if (optionEls.length === 0) {
        const inputs = Array.from(container.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
        if (inputs.length >= 2) {
          optionEls = inputs.map(input => input.closest('label') || input.parentElement);
        } else {
          optionEls = Array.from(container.querySelectorAll('.option, .choice, .answer, li, label'));
        }
      }

      optionEls = optionEls.filter((el, idx, self) => el && self.indexOf(el) === idx);

      const options = optionEls.map(optEl => {
        let text = '';
        if (profile.answerText) {
          const textEl = optEl.querySelector(profile.answerText);
          if (textEl) text = textEl.innerText.trim();
        }
        if (!text) {
          text = optEl.innerText.trim();
        }
        return text;
      });

      return {
        id: `qa_q_${index}`,
        container,
        questionText,
        optionElements: optionEls,
        options
      };
    }

    static detectContainersHeuristically() {
      const inputGroups = new Map();
      const allInputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');

      allInputs.forEach(input => {
        const parent = input.closest('fieldset, form, div.question, div[class*="question"], div[class*="item"], div[class*="card"], li') || input.parentElement?.parentElement;
        if (parent) {
          if (!inputGroups.has(parent)) inputGroups.set(parent, []);
          inputGroups.get(parent).push(input);
        }
      });

      const validContainers = [];
      for (const [container, inputs] of inputGroups.entries()) {
        if (inputs.length >= 2 && !validContainers.includes(container)) {
          validContainers.push(container);
        }
      }

      return validContainers;
    }
  }

  /**
   * =========================================================================
   * VISUAL SELECTOR PICKER HUD
   * =========================================================================
   */
  class SelectorPicker {
    static active = false;
    static currentStep = 0;
    static tempProfile = {
      questionContainer: '',
      questionText: '',
      answerOption: '',
      answerText: ''
    };
    static targetElements = {
      container: null,
      questionText: null,
      answerOption: null
    };

    static steps = [
      { key: 'questionContainer', title: 'Step 1/3: Click the Question Container', hint: 'Click the outer card/box that wraps the question and all choices.' },
      { key: 'questionText', title: 'Step 2/3: Click the Question Text', hint: 'Click the element containing the question text or prompt.' },
      { key: 'answerOption', title: 'Step 3/3: Click any Single Answer Option', hint: 'Click on one of the answer choice items (e.g. choice A, B, or radio row).' }
    ];

    static start(onComplete, onCancel) {
      if (this.active) return;
      this.active = true;
      this.currentStep = 0;
      this.onComplete = onComplete;
      this.onCancel = onCancel;

      this.createHUD();
      this.bindEvents();
    }

    static createHUD() {
      const hud = document.createElement('div');
      hud.id = 'quizassist-picker-hud';
      hud.innerHTML = `
        <div class="qa-hud-content" style="background: rgba(30, 30, 29, 0.96); border: 1px solid rgba(217, 119, 87, 0.4); border-radius: 16px; padding: 16px 20px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); color: #fbfaf8;">
          <div class="qa-hud-badge" style="font-family: 'Charter', Georgia, serif; font-size: 13px; color: #d97757; font-weight: 700; margin-bottom: 6px;">\uD83C\uDFAF Selector Picker</div>
          <div class="qa-hud-title" id="qa-hud-title" style="font-size: 15px; font-weight: 600; color: #fbfaf8; margin-bottom: 4px;">${this.steps[0].title}</div>
          <div class="qa-hud-hint" id="qa-hud-hint" style="font-size: 12px; color: #b5b0a6; margin-bottom: 12px;">${this.steps[0].hint}</div>
          <div class="qa-hud-actions" style="display: flex; gap: 8px;">
            <button id="qa-hud-skip" class="qa-btn qa-btn-secondary" style="background: #2b2b28; color: #fbfaf8; border: 1px solid #3a3834; padding: 6px 12px; border-radius: 8px; cursor: pointer;">Skip / Auto</button>
            <button id="qa-hud-cancel" class="qa-btn qa-btn-danger" style="background: #991b1b; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer;">Cancel</button>
          </div>
        </div>
      `;

      Object.assign(hud.style, {
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '2147483647'
      });

      document.body.appendChild(hud);

      hud.querySelector('#qa-hud-cancel').addEventListener('click', () => this.cancel());
      hud.querySelector('#qa-hud-skip').addEventListener('click', () => this.nextStep(null));
    }

    static updateHUD() {
      const step = this.steps[this.currentStep];
      if (!step) return;
      const titleEl = document.getElementById('qa-hud-title');
      const hintEl = document.getElementById('qa-hud-hint');
      if (titleEl) titleEl.innerText = step.title;
      if (hintEl) hintEl.innerText = step.hint;
    }

    static bindEvents() {
      this.onMouseOver = (e) => {
        if (!this.active) return;
        const target = e.target;
        if (target.closest('#quizassist-picker-hud') || target.closest('quiz-assist-host')) return;
        e.stopPropagation();
        this.highlightElement(target);
      };

      this.onClick = (e) => {
        if (!this.active) return;
        const target = e.target;
        if (target.closest('#quizassist-picker-hud') || target.closest('quiz-assist-host')) return;
        e.preventDefault();
        e.stopPropagation();

        this.handleElementSelected(target);
      };

      document.addEventListener('mouseover', this.onMouseOver, true);
      document.addEventListener('click', this.onClick, true);
    }

    static highlightElement(el) {
      if (this.currentHoverEl && this.currentHoverEl !== el) {
        this.currentHoverEl.style.outline = this.currentHoverEl.__qaOldOutline || '';
      }
      this.currentHoverEl = el;
      el.__qaOldOutline = el.style.outline;
      el.style.outline = '3px solid #d97757';
      el.style.cursor = 'crosshair';
    }

    static handleElementSelected(el) {
      if (this.currentHoverEl) {
        this.currentHoverEl.style.outline = this.currentHoverEl.__qaOldOutline || '';
      }

      let selector = '';
      if (this.currentStep === 0) {
        this.targetElements.container = el;
        selector = this.generateOptimalSelector(el, document);
        this.tempProfile.questionContainer = selector;
      } else if (this.currentStep === 1) {
        this.targetElements.questionText = el;
        selector = this.generateOptimalSelector(el, this.targetElements.container || document);
        this.tempProfile.questionText = selector;
      } else if (this.currentStep === 2) {
        this.targetElements.answerOption = el;
        selector = this.generateOptimalSelector(el, this.targetElements.container || document);
        this.tempProfile.answerOption = selector;
      }

      this.nextStep(selector);
    }

    static nextStep(selector) {
      this.currentStep++;
      if (this.currentStep >= this.steps.length) {
        this.finish();
      } else {
        this.updateHUD();
      }
    }

    static generateOptimalSelector(el, context = document) {
      if (!el || el === document.body || el === document.documentElement) return '';

      if (el.getAttribute('data-testid')) {
        return `[data-testid="${el.getAttribute('data-testid')}"]`;
      }
      if (el.getAttribute('role')) {
        return `[role="${el.getAttribute('role')}"]`;
      }

      const classes = Array.from(el.classList).filter(c => {
        return !c.match(/^[a-z0-9]{8,}$/i) && !c.includes('active') && !c.includes('hover') && !c.includes('focus');
      });

      if (classes.length > 0) {
        const classSelector = '.' + classes.slice(0, 2).join('.');
        try {
          if (context.querySelectorAll(classSelector).length > 0) {
            return classSelector;
          }
        } catch (e) {}
      }

      return el.tagName.toLowerCase();
    }

    static finish() {
      this.cleanup();
      const hostname = window.location.hostname;
      ConfigManager.setDomainProfile(hostname, this.tempProfile);
      if (this.onComplete) this.onComplete(this.tempProfile);
    }

    static cancel() {
      this.cleanup();
      if (this.onCancel) this.onCancel();
    }

    static cleanup() {
      this.active = false;
      document.removeEventListener('mouseover', this.onMouseOver, true);
      document.removeEventListener('click', this.onClick, true);
      if (this.currentHoverEl) {
        this.currentHoverEl.style.outline = this.currentHoverEl.__qaOldOutline || '';
      }
      const hud = document.getElementById('quizassist-picker-hud');
      if (hud) hud.remove();
    }
  }

  /**
   * =========================================================================
   * HIGHLIGHTER & EXPLANATION FLOW (QUIZASSIST BRAND)
   * =========================================================================
   */
  class Highlighter {
    static highlightedElements = [];
    static explainButtons = [];
    static isHidden = false;

    static setInputElementChecked(input, shouldBeChecked) {
      if (!input) return;
      try {
        const isCheckbox = input.type === 'checkbox';
        const isRadio = input.type === 'radio';

        if (isCheckbox) {
          if (shouldBeChecked && !input.checked) {
            input.click();
            if (!input.checked) {
              const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set;
              if (setter) setter.call(input, true);
              else input.checked = true;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } else if (!shouldBeChecked && input.checked) {
            input.click();
            if (input.checked) {
              const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set;
              if (setter) setter.call(input, false);
              else input.checked = false;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        } else if (isRadio) {
          if (shouldBeChecked && !input.checked) {
            input.click();
            if (!input.checked) {
              const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set;
              if (setter) setter.call(input, true);
              else input.checked = true;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }
      } catch (err) {
        console.warn('[QuizAssist] Error setting input state:', err);
      }
    }

    static highlight(qData, aiResult) {
      const config = ConfigManager.get();
      const isStealth = config.stealthMode;
      const { correctIndexes } = aiResult;

      if (Array.isArray(correctIndexes)) {
        // Highlight all correct choices
        correctIndexes.forEach(idx => {
          const optEl = qData.optionElements[idx];
          if (!optEl) return;

          this.highlightedElements.push({
            el: optEl,
            isStealth: isStealth,
            origBg: optEl.style.backgroundColor,
            origBorder: optEl.style.borderBottom,
            origOutline: optEl.style.outline,
            origBoxShadow: optEl.style.boxShadow
          });

          if (isStealth) {
            optEl.style.borderBottom = '2px solid rgba(91, 185, 140, 0.75)';
            optEl.style.borderRadius = '4px';
          } else {
            optEl.style.backgroundColor = 'rgba(91, 185, 140, 0.14)';
            optEl.style.outline = '2px solid #5bb98c';
            optEl.style.borderRadius = '8px';
            optEl.style.boxShadow = '0 0 14px rgba(91, 185, 140, 0.28)';
            optEl.style.transition = 'all 0.3s ease';
          }

          optEl.setAttribute('data-qa-highlighted', 'true');
        });

        // Auto-Click / Select Answer choices if enabled (handles multi-checkboxes & radios)
        if (config.autoClickAnswers && qData.optionElements && qData.optionElements.length > 0) {
          qData.optionElements.forEach((optEl, idx) => {
            if (!optEl) return;
            const shouldBeChecked = correctIndexes.includes(idx);
            const input = optEl.querySelector('input[type="radio"], input[type="checkbox"]') ||
                          (optEl.tagName && optEl.tagName.toLowerCase() === 'input' ? optEl : null);

            if (input) {
              this.setInputElementChecked(input, shouldBeChecked);
            } else if (shouldBeChecked) {
              const isAriaChecked = optEl.getAttribute('aria-checked') === 'true';
              if (!isAriaChecked) {
                try { optEl.click(); } catch (e) {}
              }
            } else if (!shouldBeChecked) {
              const isAriaChecked = optEl.getAttribute('aria-checked') === 'true';
              if (isAriaChecked) {
                try { optEl.click(); } catch (e) {}
              }
            }
          });
        }
      }

      this.attachExplainButton(qData, aiResult);
    }

    static attachExplainButton(qData, aiResult) {
      let existingBtn = qData.container.querySelector('.qa-explain-trigger');
      if (existingBtn) existingBtn.remove();

      const btn = document.createElement('button');
      btn.className = 'qa-explain-trigger';
      const confScore = aiResult.confidence ? `${aiResult.confidence}%` : 'QuizAssist';
      btn.innerHTML = `<span>\uD83D\uDCA1 Explain</span><span class="qa-badge" style="background: rgba(0,0,0,0.25); padding: 1px 6px; border-radius: 10px; font-size: 11px;">${confScore}</span>`;
      btn.title = 'Click to open QuizAssist solution and explanation breakdown';

      Object.assign(btn.style, {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        margin: '10px 0',
        padding: '6px 14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '12px',
        fontWeight: '600',
        color: '#ffffff',
        background: 'linear-gradient(135deg, #d97757 0%, #b8593a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(217, 119, 87, 0.35)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        zIndex: '10'
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 4px 12px rgba(217, 119, 87, 0.45)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 2px 8px rgba(217, 119, 87, 0.35)';
      });

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        UIManager.showExplanationModal(qData, aiResult);
      });

      const qTextEl = qData.container.querySelector('.question-text, .q-title, legend, h3, h4, p') || qData.container.firstElementChild;
      if (qTextEl && qTextEl.parentElement) {
        qTextEl.insertAdjacentElement('afterend', btn);
      } else {
        qData.container.prepend(btn);
      }

      this.explainButtons.push(btn);
    }

    static toggleVisibility() {
      this.isHidden = !this.isHidden;

      this.explainButtons.forEach(btn => {
        if (btn) btn.style.display = this.isHidden ? 'none' : 'inline-flex';
      });

      this.highlightedElements.forEach(item => {
        if (item.el) {
          if (this.isHidden) {
            item.el.style.backgroundColor = item.origBg || '';
            item.el.style.borderBottom = item.origBorder || '';
            item.el.style.outline = item.origOutline || '';
            item.el.style.boxShadow = item.origBoxShadow || '';
          } else {
            if (item.isStealth) {
              item.el.style.borderBottom = '2px solid rgba(91, 185, 140, 0.75)';
            } else {
              item.el.style.backgroundColor = 'rgba(91, 185, 140, 0.14)';
              item.el.style.outline = '2px solid #5bb98c';
              item.el.style.boxShadow = '0 0 14px rgba(91, 185, 140, 0.28)';
            }
          }
        }
      });

      return this.isHidden;
    }
  }

  /**
   * =========================================================================
   * UI MANAGER (QUIZASSIST BRAND DESIGN SYSTEM)
   * =========================================================================
   */
  class UIManager {
    static hostElement = null;
    static shadowRoot = null;
    static isDockVisible = true;
    static isSolving = false;
    static autoSolveObserver = null;
    static autoSolveDebounceTimer = null;
    static hasBoundNavigationEvents = false;

    static init() {
      if (this.hostElement) return;

      this.hostElement = document.createElement('quiz-assist-host');
      this.hostElement.id = 'quiz-assist-root';
      this.shadowRoot = this.hostElement.attachShadow({ mode: 'open' });
      document.body.appendChild(this.hostElement);

      this.injectStyles();
      this.renderFloatingDock();
      this.renderSettingsModal();
      this.renderExplanationModal();
      this.initKeyboardShortcuts();
      this.initAutoSolve();
    }

    static injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        * { 
          box-sizing: border-box; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
        }

                /* QuizAssist Warm Glass Floating Dock */
        .qa-dock {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(30, 30, 29, 0.94);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(217, 119, 87, 0.25);
          border-radius: 40px;
          padding: 6px 10px;
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45), 0 0 1px rgba(217, 119, 87, 0.3);
          z-index: 2147483640;
          transition: box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
          user-select: none;
        }
        .qa-dock:hover {
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55), 0 0 16px rgba(217, 119, 87, 0.25);
          border-color: rgba(217, 119, 87, 0.4);
        }
        .qa-dock.hidden {
          display: none !important;
        }
        .qa-dock.dragging {
          cursor: grabbing !important;
          opacity: 0.94;
          box-shadow: 0 18px 46px rgba(0, 0, 0, 0.7), 0 0 24px rgba(217, 119, 87, 0.4) !important;
          border-color: rgba(217, 119, 87, 0.6) !important;
        }
        .qa-dock-drag-handle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          color: rgba(255, 255, 255, 0.35);
          font-size: 14px;
          padding: 2px 4px;
          border-radius: 6px;
          letter-spacing: -1px;
          transition: all 0.15s ease;
          user-select: none;
          touch-action: none;
        }
        .qa-dock-drag-handle:hover {
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.08);
        }
        .qa-dock.dragging .qa-dock-drag-handle {
          cursor: grabbing !important;
          color: #d97757;
        }
        .qa-dock-content {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .qa-dock-btn-collapse {
          padding: 4px 6px;
          font-size: 14px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          line-height: 1;
          margin-left: 2px;
        }
        .qa-dock-btn-collapse:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }
        .qa-dock-btn-expand {
          font-size: 12px;
          font-weight: 700;
          color: #d97757;
          padding: 5px 10px;
          background: rgba(217, 119, 87, 0.12);
          border: 1px solid rgba(217, 119, 87, 0.35);
          border-radius: 16px;
          cursor: pointer;
          display: none;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .qa-dock-btn-expand:hover {
          background: rgba(217, 119, 87, 0.25);
          border-color: rgba(217, 119, 87, 0.6);
          color: #ffffff;
          transform: scale(1.04);
        }
        .qa-dock.collapsed {
          padding: 5px 8px;
          gap: 6px;
          border-radius: 24px;
        }
        .qa-dock.collapsed .qa-dock-content,
        .qa-dock.collapsed .qa-dock-btn-collapse {
          display: none !important;
        }
        .qa-dock.collapsed .qa-dock-btn-expand {
          display: inline-flex !important;
        }
        .qa-dock-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #fbfaf8;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s ease;
          gap: 6px;
          text-decoration: none;
        }
        .qa-dock-btn:hover { 
          background: rgba(255, 255, 255, 0.08); 
          color: #ffffff; 
        }
        
        /* Primary Solve Button */
        .qa-dock-btn.primary { 
          background: #d97757; 
          color: #ffffff; 
          box-shadow: 0 2px 8px rgba(217, 119, 87, 0.35);
        }
        .qa-dock-btn.primary:hover { 
          background: #c36545; 
          box-shadow: 0 4px 12px rgba(217, 119, 87, 0.45);
        }
        .qa-dock-btn:disabled { 
          opacity: 0.5; 
          cursor: not-allowed; 
        }
        
        .qa-dock-btn-auto {
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
        }
        .qa-dock-btn-auto.active {
          background: rgba(91, 185, 140, 0.18);
          border-color: rgba(91, 185, 140, 0.5);
          color: #5bb98c;
          box-shadow: 0 0 10px rgba(91, 185, 140, 0.2);
        }

        .qa-dock-coffee-btn {
          background: rgba(255, 221, 0, 0.12);
          border: 1px solid rgba(255, 221, 0, 0.3);
          color: #ffdd00;
          padding: 7px 11px;
          font-size: 13px;
        }
        .qa-dock-coffee-btn:hover {
          background: rgba(255, 221, 0, 0.22);
          border-color: rgba(255, 221, 0, 0.6);
          color: #fff;
          transform: translateY(-1px);
        }

        .qa-dock-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #5bb98c;
          margin-left: 4px;
        }
        .qa-dock-status.inactive { background: #ef4444; }

        /* QuizAssist Modal Backdrop & Card */
        .qa-modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(24, 24, 23, 0.72);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2147483645;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .qa-modal-backdrop.open { opacity: 1; pointer-events: auto; }

        .qa-modal-card {
          background: #242422;
          color: #fbfaf8;
          border: 1px solid rgba(217, 119, 87, 0.25);
          border-radius: 18px;
          width: 90%;
          max-width: 680px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), 0 0 1px rgba(217, 119, 87, 0.3);
          transform: translateY(12px) scale(0.98);
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .qa-modal-backdrop.open .qa-modal-card { transform: translateY(0) scale(1); }
        
        .qa-modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #1e1e1d;
        }
        .qa-modal-title { 
          font-family: 'Charter', 'Iowan Old Style', 'Palatino', Georgia, serif;
          font-size: 18px; 
          font-weight: 700; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          color: #fbfaf8;
        }
        .qa-close-btn {
          background: none;
          border: none;
          color: #a8a29e;
          font-size: 22px;
          cursor: pointer;
          border-radius: 8px;
          padding: 4px 8px;
          line-height: 1;
        }
        .qa-close-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }
        .qa-modal-body { padding: 22px 24px; overflow-y: auto; font-size: 14px; line-height: 1.6; }
        
        .qa-modal-footer {
          padding: 14px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          background: #1e1e1d;
        }

        /* QuizAssist Tabs */
        .qa-tabs { 
          display: flex; 
          border-bottom: 1px solid rgba(255, 255, 255, 0.08); 
          margin-bottom: 18px; 
          gap: 4px;
        }
        .qa-tab-btn {
          background: none;
          border: none;
          color: #a8a29e;
          padding: 8px 16px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.15s ease;
        }
        .qa-tab-btn:hover { color: #fbfaf8; }
        .qa-tab-btn.active { 
          color: #d97757; 
          border-bottom-color: #d97757; 
        }
        .qa-tab-pane { display: none; }
        .qa-tab-pane.active { display: block; }

        .qa-form-group { margin-bottom: 16px; }
        .qa-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #c4bfb6;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .qa-input, .qa-select {
          width: 100%;
          background: #181817;
          border: 1px solid #3a3834;
          color: #fbfaf8;
          border-radius: 10px;
          padding: 9px 13px;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .qa-input:focus, .qa-select:focus {
          border-color: #d97757;
          box-shadow: 0 0 0 2px rgba(217, 119, 87, 0.25);
        }
        .qa-help { font-size: 11.5px; color: #8c857b; margin-top: 5px; }
        .qa-checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          margin-bottom: 12px;
          cursor: pointer;
          color: #ece8e1;
        }
        
        .qa-btn {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .qa-btn-primary { 
          background: #d97757; 
          color: #fff; 
          box-shadow: 0 2px 6px rgba(217, 119, 87, 0.3);
        }
        .qa-btn-primary:hover { background: #c36545; }
        .qa-btn-secondary { 
          background: #2f2e2c; 
          color: #ece8e1; 
          border: 1px solid #3d3b37;
        }
        .qa-btn-secondary:hover { background: #3c3a36; }
        .qa-btn-danger { background: #991b1b; color: #fff; }
        .qa-btn-danger:hover { background: #7f1d1d; }

        /* Coffee Support Button */
        .qa-btn-coffee {
          background: #ffdd00;
          color: #181816 !important;
          border: 1px solid rgba(0, 0, 0, 0.15);
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(255, 221, 0, 0.25);
          text-decoration: none;
        }
        .qa-btn-coffee:hover {
          background: #f0cf00;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 221, 0, 0.35);
        }

        .qa-badge-shortcut {
          display: inline-block;
          background: #2b2b28;
          border: 1px solid #45433e;
          color: #ece8e1;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 11px;
          font-family: monospace;
          margin-left: 6px;
        }

        .qa-conf-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 12px;
          font-size: 11.5px;
          font-weight: 700;
          background: rgba(91, 185, 140, 0.15);
          color: #5bb98c;
          border: 1px solid rgba(91, 185, 140, 0.35);
        }
        .qa-box-correct {
          background: rgba(91, 185, 140, 0.1);
          border: 1px solid rgba(91, 185, 140, 0.3);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }
        .qa-elimination-card {
          background: rgba(217, 119, 87, 0.08);
          border-left: 3px solid #d97757;
          padding: 10px 14px;
          border-radius: 6px;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .qa-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background: #242422;
          color: #fbfaf8;
          border: 1px solid rgba(217, 119, 87, 0.3);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 500;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: qaFadeIn 0.2s ease;
        }
        @keyframes qaFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      this.shadowRoot.appendChild(style);
    }

        static renderFloatingDock() {
      const isAllowed = ConfigManager.isDomainAllowed();
      const config = ConfigManager.get();

      const dock = document.createElement('div');
      dock.className = 'qa-dock';
      dock.id = 'qa-floating-dock';

      dock.innerHTML = `
        <div class="qa-dock-drag-handle" id="qa-dock-drag" title="Drag to reposition dock (Double-click to toggle collapse)">\u22EE\u22EE</div>
        <div class="qa-dock-status ${isAllowed ? '' : 'inactive'}" id="qa-dock-status" title="${isAllowed ? 'QuizAssist Active on this domain' : 'QuizAssist Disabled on this domain'}"></div>
        <div class="qa-dock-content" id="qa-dock-content">
          <button class="qa-dock-btn primary" id="qa-btn-solve" title="Manual Solve (${config.solveShortcut || 'Alt+S'})">\u26A1 Solve</button>
          <button class="qa-dock-btn qa-dock-btn-auto ${config.autoSolveOnLoad ? 'active' : ''}" id="qa-btn-toggle-auto" title="Toggle Auto-Solve Mode (${config.toggleAutoShortcut || 'Alt+A'})">${config.autoSolveOnLoad ? '\uD83D\uDFE2 Auto' : '\u26AA Manual'}</button>
          <button class="qa-dock-btn" id="qa-btn-picker" title="\uD83C\uDFAF Pick: Calibrate Selectors (Optional fallback for custom portals)">\uD83C\uDFAF Pick</button>
          <button class="qa-dock-btn" id="qa-btn-settings" title="Settings">\u2699\uFE0F</button>
          <a href="https://buymeacoffee.com/shiweige" target="_blank" rel="noopener noreferrer" class="qa-dock-btn qa-dock-coffee-btn" title="Buy me a coffee \u2615">\u2615</a>
        </div>
        <button class="qa-dock-btn qa-dock-btn-collapse" id="qa-btn-collapse" title="Collapse / Minimize dock">\u2212</button>
        <button class="qa-dock-btn qa-dock-btn-expand" id="qa-btn-expand" title="Click to expand QuizAssist dock" style="display: none;">\u26A1 QA</button>
      `;

      this.shadowRoot.appendChild(dock);

      dock.querySelector('#qa-btn-solve').addEventListener('click', () => this.handleSolveClick({ isAuto: false, silent: false }));
      dock.querySelector('#qa-btn-toggle-auto').addEventListener('click', () => this.toggleAutoSolveMode());
      dock.querySelector('#qa-btn-picker').addEventListener('click', () => this.handlePickerClick());
      dock.querySelector('#qa-btn-settings').addEventListener('click', () => this.openSettingsModal());

      this.initDockDraggable(dock);
      this.initDockCollapse(dock);
    }

    static initDockDraggable(dock) {
      const dragHandle = dock.querySelector('#qa-dock-drag');
      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;
      let hasMoved = false;

      const restorePosition = () => {
        try {
          const saved = GM_getValue('qa_dock_pos', null);
          if (saved) {
            const pos = JSON.parse(saved);
            const rect = dock.getBoundingClientRect();
            const w = rect.width || 360;
            const h = rect.height || 48;
            const maxLeft = Math.max(8, window.innerWidth - w - 8);
            const maxTop = Math.max(8, window.innerHeight - h - 8);
            const left = Math.min(Math.max(8, pos.left), maxLeft);
            const top = Math.min(Math.max(8, pos.top), maxTop);
            dock.style.left = `${left}px`;
            dock.style.top = `${top}px`;
            dock.style.right = 'auto';
            dock.style.bottom = 'auto';
          }
        } catch (e) {
          console.warn('[QuizAssist] Error restoring dock position:', e);
        }
      };

      restorePosition();

      window.addEventListener('resize', () => {
        if (dock.style.left && dock.style.left !== 'auto') {
          const rect = dock.getBoundingClientRect();
          const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
          const maxTop = Math.max(8, window.innerHeight - rect.height - 8);
          const curLeft = parseFloat(dock.style.left) || rect.left;
          const curTop = parseFloat(dock.style.top) || rect.top;
          dock.style.left = `${Math.min(Math.max(8, curLeft), maxLeft)}px`;
          dock.style.top = `${Math.min(Math.max(8, curTop), maxTop)}px`;
        }
      });

      const onPointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        isDragging = true;
        hasMoved = false;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;

        const rect = dock.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        dock.style.left = `${initialLeft}px`;
        dock.style.top = `${initialTop}px`;
        dock.style.right = 'auto';
        dock.style.bottom = 'auto';

        dock.classList.add('dragging');
        document.addEventListener('mousemove', onPointerMove, { passive: false });
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          hasMoved = true;
        }

        const rect = dock.getBoundingClientRect();
        const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
        const maxTop = Math.max(8, window.innerHeight - rect.height - 8);

        const newLeft = Math.min(Math.max(8, initialLeft + deltaX), maxLeft);
        const newTop = Math.min(Math.max(8, initialTop + deltaY), maxTop);

        dock.style.left = `${newLeft}px`;
        dock.style.top = `${newTop}px`;
      };

      const onPointerUp = () => {
        if (!isDragging) return;
        isDragging = false;
        dock.classList.remove('dragging');

        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);

        if (hasMoved) {
          const rect = dock.getBoundingClientRect();
          try {
            GM_setValue('qa_dock_pos', JSON.stringify({ left: rect.left, top: rect.top }));
          } catch (e) {}
        }
      };

      if (dragHandle) {
        dragHandle.addEventListener('mousedown', onPointerDown);
        dragHandle.addEventListener('touchstart', onPointerDown, { passive: true });
      }

      dock.addEventListener('mousedown', (e) => {
        if (e.target.closest('button, a, input, select, textarea')) return;
        onPointerDown(e);
      });
      dock.addEventListener('touchstart', (e) => {
        if (e.target.closest('button, a, input, select, textarea')) return;
        onPointerDown(e);
      }, { passive: true });
    }

    static initDockCollapse(dock) {
      const collapseBtn = dock.querySelector('#qa-btn-collapse');
      const expandBtn = dock.querySelector('#qa-btn-expand');
      const dragHandle = dock.querySelector('#qa-dock-drag');

      const isCollapsedSaved = () => {
        try {
          return GM_getValue('qa_dock_collapsed', false) === true;
        } catch (e) {
          return false;
        }
      };

      const setCollapsed = (collapsed, save = true) => {
        if (collapsed) {
          dock.classList.add('collapsed');
        } else {
          dock.classList.remove('collapsed');
          const rect = dock.getBoundingClientRect();
          if (dock.style.left && dock.style.left !== 'auto') {
            const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
            const curLeft = parseFloat(dock.style.left) || rect.left;
            if (curLeft > maxLeft) {
              dock.style.left = `${maxLeft}px`;
            }
          }
        }
        if (save) {
          try {
            GM_setValue('qa_dock_collapsed', collapsed);
          } catch (e) {}
        }
      };

      if (isCollapsedSaved()) {
        setCollapsed(true, false);
      }

      if (collapseBtn) {
        collapseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          setCollapsed(true);
        });
      }

      if (expandBtn) {
        expandBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          setCollapsed(false);
        });
      }

      dock.addEventListener('click', (e) => {
        if (dock.classList.contains('collapsed') && !e.target.closest('#qa-dock-drag')) {
          setCollapsed(false);
        }
      });

      if (dragHandle) {
        dragHandle.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          setCollapsed(!dock.classList.contains('collapsed'));
        });
      }
    }

    static resetDockPosition() {
      const dock = this.shadowRoot?.getElementById('qa-floating-dock');
      if (dock) {
        dock.style.left = 'auto';
        dock.style.top = 'auto';
        dock.style.bottom = '24px';
        dock.style.right = '24px';
        try {
          GM_deleteValue('qa_dock_pos');
        } catch (e) {}
        this.showToast('Dock position reset to bottom-right', 'info');
      }
    }

    static toggleVisibility() {
      const isHidden = Highlighter.toggleVisibility();
      const dock = this.shadowRoot.getElementById('qa-floating-dock');
      if (dock) {
        if (isHidden) {
          dock.classList.add('hidden');
        } else {
          dock.classList.remove('hidden');
          this.showToast('QuizAssist revealed', 'info');
        }
      }
    }

    static updateDockStatus() {
      const isAllowed = ConfigManager.isDomainAllowed();
      const statusEl = this.shadowRoot.getElementById('qa-dock-status');
      if (statusEl) {
        statusEl.className = `qa-dock-status ${isAllowed ? '' : 'inactive'}`;
        statusEl.title = isAllowed ? 'QuizAssist Active on this domain' : 'QuizAssist Disabled on this domain';
      }
    }

    static updateAutoSolveButton() {
      const config = ConfigManager.get();
      const autoBtn = this.shadowRoot?.getElementById('qa-btn-toggle-auto');
      if (autoBtn) {
        if (config.autoSolveOnLoad) {
          autoBtn.className = 'qa-dock-btn qa-dock-btn-auto active';
          autoBtn.innerHTML = '\uD83D\uDFE2 Auto';
          autoBtn.title = `Auto-Solve Active (${config.toggleAutoShortcut || 'Alt+A'} to switch to manual)`;
        } else {
          autoBtn.className = 'qa-dock-btn qa-dock-btn-auto';
          autoBtn.innerHTML = '\u26AA Manual';
          autoBtn.title = `Manual Mode Active (${config.toggleAutoShortcut || 'Alt+A'} to enable auto-solve)`;
        }
      }
      const chk = this.shadowRoot?.getElementById('cfg-auto-solve');
      if (chk) chk.checked = !!config.autoSolveOnLoad;
    }

    static toggleAutoSolveMode() {
      const config = ConfigManager.get();
      const newState = !config.autoSolveOnLoad;
      ConfigManager.update({ autoSolveOnLoad: newState });
      this.updateAutoSolveButton();

      if (newState) {
        this.showToast('Auto-Solve Mode: ON \uD83D\uDFE2', 'success');
        this.startAutoSolveObserver();
        this.handleSolveClick({ isAuto: true, silent: false });
      } else {
        this.showToast('Auto-Solve Mode: OFF (Manual Mode) \u26AA', 'info');
        this.stopAutoSolveObserver();
      }
    }

    static showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = 'qa-toast';
      const icon = type === 'success' ? '\u2705' : type === 'error' ? '\u274C' : '\u2139\uFE0F';
      toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
      this.shadowRoot.appendChild(toast);
      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    static async handleSolveClick(options = {}) {
      const { isAuto = false, silent = false } = options;

      if (!ConfigManager.isDomainAllowed()) {
        if (isAuto) return;
        const enable = confirm(`QuizAssist is not currently enabled for "${window.location.hostname}". Would you like to enable it now?`);
        if (enable) {
          ConfigManager.toggleDomain(window.location.hostname);
          this.updateDockStatus();
        } else {
          return;
        }
      }

      if (this.isSolving) return;

      const questions = DOMExtractor.getQuestions(isAuto);
      if (questions.length === 0) {
        if (!silent) {
          const allQuestions = DOMExtractor.getQuestions(false);
          if (allQuestions.length > 0) {
            this.showToast('All detected questions are already solved!', 'info');
          } else {
            this.showToast('No quiz questions detected. Try configuring selectors in Settings or using the "Pick" tool.', 'error');
          }
        }
        return;
      }

      this.isSolving = true;
      const solveBtn = this.shadowRoot.getElementById('qa-btn-solve');
      if (solveBtn) {
        solveBtn.disabled = true;
        solveBtn.innerText = `Solving (${questions.length})...`;
      }

      let solvedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        try {
          if (solveBtn) solveBtn.innerText = `Solving ${i + 1}/${questions.length}...`;
          const result = await AIClient.solveQuestion(q.questionText, q.options);
          Highlighter.highlight(q, result);
          if (q.container) {
            q.container.dataset.qaSolved = 'true';
            q.container.setAttribute('data-qa-solved', 'true');
            q.container.setAttribute('data-qa-solved-text', q.questionText.trim());
          }
          solvedCount++;
        } catch (err) {
          console.error(`[QuizAssist] Error solving question #${i + 1}:`, err);
          errorCount++;
        }
      }

      this.isSolving = false;
      if (solveBtn) {
        solveBtn.disabled = false;
        solveBtn.innerText = '\u26A1 Solve';
      }

      if (errorCount > 0 && solvedCount === 0) {
        if (!silent) this.showToast('Failed to solve questions. Please check your API key & provider settings.', 'error');
      } else if (solvedCount > 0) {
        const msg = isAuto ? `\u26A1 Auto-solved ${solvedCount} question(s)!` : `Highlighted ${solvedCount} question(s)!`;
        this.showToast(msg, 'success');
      }
    }

    static handlePickerClick() {
      SelectorPicker.start(
        (profile) => {
          this.showToast('Selectors captured and saved successfully for this domain!', 'success');
        },
        () => {
          this.showToast('Selector picker cancelled.', 'info');
        }
      );
    }

    /**
     * KEYBOARD SHORTCUTS MANAGER
     */
    static initKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        const isInputField = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

        if (isInputField && !e.altKey && !e.ctrlKey) return;

        const config = ConfigManager.get();
        const solveCombo = (config.solveShortcut || 'Alt+S').toUpperCase().replace(/\s+/g, '');
        const autoCombo = (config.toggleAutoShortcut || 'Alt+A').toUpperCase().replace(/\s+/g, '');
        const hideCombo = (config.hideShortcut || 'Alt+H').toUpperCase().replace(/\s+/g, '');

        const pressed = [];
        if (e.ctrlKey) pressed.push('CTRL');
        if (e.altKey) pressed.push('ALT');
        if (e.shiftKey) pressed.push('SHIFT');
        if (e.metaKey) pressed.push('META');

        const key = e.key.toUpperCase();
        if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) {
          pressed.push(key);
        }
        const currentCombo = pressed.join('+');

        if (currentCombo === solveCombo) {
          e.preventDefault();
          e.stopPropagation();
          this.handleSolveClick({ isAuto: false, silent: false });
        } else if (currentCombo === autoCombo) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleAutoSolveMode();
        } else if (currentCombo === hideCombo) {
          e.preventDefault();
          e.stopPropagation();
          this.toggleVisibility();
        }
      }, true);
    }

    /**
     * AUTO-SOLVE CONTROLLER & NAVIGATION OBSERVER
     */
    static scheduleAutoSolveCheck(delay = 400) {
      const config = ConfigManager.get();
      if (!config.autoSolveOnLoad || !ConfigManager.isDomainAllowed() || this.isSolving) return;

      if (this.autoSolveDebounceTimer) clearTimeout(this.autoSolveDebounceTimer);
      this.autoSolveDebounceTimer = setTimeout(() => {
        const activeConfig = ConfigManager.get();
        if (activeConfig.autoSolveOnLoad && ConfigManager.isDomainAllowed() && !this.isSolving) {
          const unsolved = DOMExtractor.getQuestions(true);
          if (unsolved.length > 0) {
            this.handleSolveClick({ isAuto: true, silent: true });
          }
        }
      }, delay);
    }

    static startAutoSolveObserver() {
      if (this.autoSolveObserver || !window.MutationObserver) return;

      this.autoSolveObserver = new MutationObserver((mutations) => {
        let hasExternalMutation = false;
        for (const m of mutations) {
          const target = m.target;
          if (target && (target.nodeName === 'QUIZ-ASSIST-HOST' || target.id === 'quizassist-root' || target.closest?.('#quizassist-root, quiz-assist-host'))) {
            continue;
          }
          hasExternalMutation = true;
          break;
        }
        if (!hasExternalMutation) return;

        this.scheduleAutoSolveCheck(500);
      });

      this.autoSolveObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden', 'aria-hidden', 'aria-selected', 'data-active', 'data-state']
      });

      if (!this.hasBoundNavigationEvents) {
        this.hasBoundNavigationEvents = true;

        // 1. SPA History & Hash changes
        window.addEventListener('popstate', () => this.scheduleAutoSolveCheck(400));
        window.addEventListener('hashchange', () => this.scheduleAutoSolveCheck(400));

        try {
          const origPush = history.pushState;
          if (origPush) {
            history.pushState = function(...args) {
              const res = origPush.apply(this, args);
              window.dispatchEvent(new Event('qa-navigation'));
              return res;
            };
          }
          const origReplace = history.replaceState;
          if (origReplace) {
            history.replaceState = function(...args) {
              const res = origReplace.apply(this, args);
              window.dispatchEvent(new Event('qa-navigation'));
              return res;
            };
          }
        } catch (e) {}

        window.addEventListener('qa-navigation', () => this.scheduleAutoSolveCheck(400));

        // 2. Global click interception for "Next" / "Submit" / pagination controls
        document.addEventListener('click', (e) => {
          const btn = e.target.closest('button, a, input[type="button"], input[type="submit"], [role="button"], [class*="next" i], [id*="next" i], [class*="pagination" i], [class*="step" i], [class*="nav" i]');
          if (!btn) return;
          if (btn.closest('quiz-assist-host') || btn.closest('#quizassist-root')) return;

          const activeConfig = ConfigManager.get();
          if (!activeConfig.autoSolveOnLoad || !ConfigManager.isDomainAllowed()) return;

          // When user clicks Next, schedule staggered checks for instant and delayed/AJAX transitions
          this.scheduleAutoSolveCheck(350);
          setTimeout(() => this.scheduleAutoSolveCheck(50), 900);
          setTimeout(() => this.scheduleAutoSolveCheck(50), 1700);
        }, true);
      }
    }

    static stopAutoSolveObserver() {
      if (this.autoSolveObserver) {
        this.autoSolveObserver.disconnect();
        this.autoSolveObserver = null;
      }
      if (this.autoSolveDebounceTimer) {
        clearTimeout(this.autoSolveDebounceTimer);
        this.autoSolveDebounceTimer = null;
      }
    }

    static initAutoSolve() {
      const config = ConfigManager.get();
      if (!config.autoSolveOnLoad || !ConfigManager.isDomainAllowed()) return;

      this.startAutoSolveObserver();

      const delayMs = Math.max(500, (config.autoSolveDelay || 1.5) * 1000);
      setTimeout(() => {
        const activeConfig = ConfigManager.get();
        if (activeConfig.autoSolveOnLoad && ConfigManager.isDomainAllowed()) {
          this.handleSolveClick({ isAuto: true, silent: true });
        }
      }, delayMs);
    }

    static renderExplanationModal() {
      const modal = document.createElement('div');
      modal.className = 'qa-modal-backdrop';
      modal.id = 'qa-explain-modal';

      modal.innerHTML = `
        <div class="qa-modal-card">
          <div class="qa-modal-header">
            <div class="qa-modal-title">
              <span>\uD83D\uDCA1 QuizAssist Solution & Explanation</span>
              <span id="qa-explain-conf-badge" class="qa-conf-badge">98% Confidence</span>
            </div>
            <button class="qa-close-btn" id="qa-explain-close">&times;</button>
          </div>
          <div class="qa-modal-body" id="qa-explain-body"></div>
          <div class="qa-modal-footer">
            <a href="https://buymeacoffee.com/shiweige" target="_blank" rel="noopener noreferrer" class="qa-btn qa-btn-coffee" style="margin-right: auto;">\u2615 Buy me a coffee</a>
            <button class="qa-btn qa-btn-secondary" id="qa-explain-dismiss">Close</button>
          </div>
        </div>
      `;

      this.shadowRoot.appendChild(modal);

      modal.querySelector('#qa-explain-close').addEventListener('click', () => modal.classList.remove('open'));
      modal.querySelector('#qa-explain-dismiss').addEventListener('click', () => modal.classList.remove('open'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    static showExplanationModal(qData, aiResult) {
      const modal = this.shadowRoot.getElementById('qa-explain-modal');
      const body = this.shadowRoot.getElementById('qa-explain-body');
      const confBadge = this.shadowRoot.getElementById('qa-explain-conf-badge');

      if (confBadge) {
        const conf = aiResult.confidence || 95;
        confBadge.innerText = `${conf}% Confidence`;
        confBadge.style.color = conf >= 85 ? '#5bb98c' : conf >= 70 ? '#fbbf24' : '#f87171';
      }

      const correctIndices = aiResult.correctIndexes || [];
      const correctTexts = correctIndices.map(idx => {
        const letter = String.fromCharCode(65 + idx);
        return `<strong>Option ${letter} [${idx + 1}]:</strong> ${qData.options[idx] || ''}`;
      }).join('<br>');

      let elimHtml = '';
      if (Array.isArray(aiResult.eliminations) && aiResult.eliminations.length > 0) {
        elimHtml = `
          <div style="margin-top: 18px;">
            <div class="qa-label" style="color: #d97757; font-family: 'Charter', Georgia, serif; font-size: 13px;">Distractor Elimination Breakdown:</div>
            ${aiResult.eliminations.map(item => {
              const optIndex = item.index ?? 0;
              const letter = String.fromCharCode(65 + optIndex);
              return `
                <div class="qa-elimination-card">
                  <strong style="color: #fbfaf8;">Option ${letter} [${optIndex + 1}]:</strong> ${item.reason}
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      body.innerHTML = `
        <div style="margin-bottom: 12px; font-weight: 600; color: #a8a29e; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.5px;">Question:</div>
        <div style="font-family: 'Charter', 'Iowan Old Style', Georgia, serif; font-size: 16px; font-weight: 600; margin-bottom: 18px; color: #fbfaf8; line-height: 1.5;">${qData.questionText}</div>
        
        <div class="qa-box-correct">
          <div class="qa-label" style="color: #5bb98c; font-family: 'Charter', Georgia, serif; font-size: 13px;">\u2705 Correct Answer:</div>
          <div style="font-size: 14.5px; color: #ecfdf5; margin-top: 4px;">${correctTexts || 'See highlighted choice'}</div>
        </div>

        <div style="margin-top: 16px;">
          <div class="qa-label" style="color: #d97757; font-family: 'Charter', Georgia, serif; font-size: 13px;">QuizAssist Step-by-Step Reasoning:</div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px; color: #ece8e1; white-space: pre-wrap; font-size: 13.5px; line-height: 1.65;">${aiResult.explanation || 'No detailed explanation provided.'}</div>
        </div>

        ${elimHtml}
      `;

      modal.classList.add('open');
    }

    /**
     * SETTINGS MODAL
     */
    static renderSettingsModal() {
      const modal = document.createElement('div');
      modal.className = 'qa-modal-backdrop';
      modal.id = 'qa-settings-modal';

      modal.innerHTML = `
        <div class="qa-modal-card" style="max-width: 660px;">
          <div class="qa-modal-header">
            <div class="qa-modal-title">\u2699\uFE0F QuizAssist Configuration</div>
            <button class="qa-close-btn" id="qa-settings-close">&times;</button>
          </div>
          <div class="qa-modal-body">
            <div class="qa-tabs">
              <button class="qa-tab-btn active" data-tab="tab-provider">\uD83E\uDD16 AI Providers</button>
              <button class="qa-tab-btn" data-tab="tab-selectors">\uD83C\uDFAF Selectors & Site</button>
              <button class="qa-tab-btn" data-tab="tab-general">\u26A1 Modes & Triggers</button>
            </div>

            <!-- Tab 1: AI Providers -->
            <div class="qa-tab-pane active" id="tab-provider">
              <div class="qa-form-group">
                <label class="qa-label">Active Provider</label>
                <select class="qa-select" id="cfg-active-provider">
                  <option value="claude">Claude (Claude Opus 5.5, Sonnet 5.5)</option>
                  <option value="openai">OpenAI (GPT-6.1 Sol, GPT-6 Astra, o3)</option>
                  <option value="gemini">Google Gemini (Gemini 3.8 Flash, 3.1 Pro, 2.5 Flash)</option>
                  <option value="custom">Custom / OpenAI-Compatible (Ollama, OpenRouter)</option>
                </select>
              </div>

              <!-- Claude Sub-form -->
              <div id="cfg-group-claude" class="provider-subgroup">
                <div class="qa-form-group">
                  <label class="qa-label">Claude API Key</label>
                  <input type="password" class="qa-input" id="cfg-claude-key" placeholder="sk-ant-..." />
                  <div class="qa-help">Enter your API key to connect QuizAssist.</div>
                </div>
                <div class="qa-form-group">
                  <label class="qa-label">Model Selection</label>
                  <select class="qa-select" id="cfg-claude-model-select">
                    ${MODEL_PRESETS.claude.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                    <option value="custom">Custom Model Name...</option>
                  </select>
                  <input type="text" class="qa-input" id="cfg-claude-model-custom" style="margin-top: 6px; display: none;" placeholder="e.g. claude-opus-5-5" />
                </div>
              </div>

              <!-- OpenAI Sub-form -->
              <div id="cfg-group-openai" class="provider-subgroup" style="display:none;">
                <div class="qa-form-group">
                  <label class="qa-label">OpenAI API Key</label>
                  <input type="password" class="qa-input" id="cfg-openai-key" placeholder="sk-..." />
                  <div class="qa-help">Supports GPT-6.1 Sol, GPT-6 Astra, o3, o3-mini, and GPT-4o series.</div>
                </div>
                <div class="qa-form-group">
                  <label class="qa-label">Model Selection</label>
                  <select class="qa-select" id="cfg-openai-model-select">
                    ${MODEL_PRESETS.openai.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                    <option value="custom">Custom Model Name...</option>
                  </select>
                  <input type="text" class="qa-input" id="cfg-openai-model-custom" style="margin-top: 6px; display: none;" placeholder="e.g. gpt-6.1-sol" />
                </div>
              </div>

              <!-- Gemini Sub-form -->
              <div id="cfg-group-gemini" class="provider-subgroup" style="display:none;">
                <div class="qa-form-group">
                  <label class="qa-label">Gemini API Key</label>
                  <input type="password" class="qa-input" id="cfg-gemini-key" placeholder="AIzaSy..." />
                  <div class="qa-help">Enter your Google Gemini API key.</div>
                </div>
                <div class="qa-form-group">
                  <label class="qa-label">Model Selection</label>
                  <select class="qa-select" id="cfg-gemini-model-select">
                    ${MODEL_PRESETS.gemini.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                    <option value="custom">Custom Model Name...</option>
                  </select>
                  <input type="text" class="qa-input" id="cfg-gemini-model-custom" style="margin-top: 6px; display: none;" placeholder="e.g. gemini-3.8-flash" />
                </div>
              </div>

              <!-- Custom / OpenRouter Sub-form -->
              <div id="cfg-group-custom" class="provider-subgroup" style="display:none;">
                <div class="qa-form-group">
                  <label class="qa-label">Endpoint URL</label>
                  <input type="text" class="qa-input" id="cfg-custom-endpoint" placeholder="https://openrouter.ai/api/v1/chat/completions" />
                </div>
                <div class="qa-form-group">
                  <label class="qa-label">API Key (Optional for local)</label>
                  <input type="password" class="qa-input" id="cfg-custom-key" placeholder="Bearer key..." />
                </div>
                <div class="qa-form-group">
                  <label class="qa-label">Model Name</label>
                  <input type="text" class="qa-input" id="cfg-custom-model" placeholder="meta-llama/llama-3.1-70b-instruct" />
                </div>
              </div>

              <div class="qa-form-group" style="margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08);">
                <button class="qa-btn qa-btn-secondary" id="cfg-test-connection">\uD83D\uDD0C Test AI Connection</button>
                <span id="cfg-test-result" style="font-size: 12px; margin-left: 10px; font-weight: 500;"></span>
              </div>
            </div>

            <!-- Tab 2: Selectors & Site -->
            <div class="qa-tab-pane" id="tab-selectors">
              <div class="qa-form-group">
                <label class="qa-label">Current Domain Profile</label>
                <div style="font-size: 13px; color: #d97757; margin-bottom: 8px;"><code>${window.location.hostname}</code></div>
                <button class="qa-btn qa-btn-primary" id="cfg-launch-picker" style="width: 100%; margin-bottom: 12px;">\uD83C\uDFAF Launch Visual Selector Picker</button>
              </div>

              <div class="qa-form-group">
                <label class="qa-label">Question Container Selector</label>
                <input type="text" class="qa-input" id="cfg-sel-container" placeholder=".question-card" />
              </div>

              <div class="qa-form-group">
                <label class="qa-label">Question Text Selector (Relative)</label>
                <input type="text" class="qa-input" id="cfg-sel-qtext" placeholder=".question-title" />
              </div>

              <div class="qa-form-group">
                <label class="qa-label">Answer Item Selector (Relative)</label>
                <input type="text" class="qa-input" id="cfg-sel-option" placeholder=".choice-item, label" />
              </div>

              <div class="qa-form-group">
                <label class="qa-label">Answer Text Selector (Optional)</label>
                <input type="text" class="qa-input" id="cfg-sel-atext" placeholder=".choice-text" />
              </div>
            </div>

            <!-- Tab 3: Modes & Triggers -->
            <div class="qa-tab-pane" id="tab-general">
              <label class="qa-checkbox-row">
                <input type="checkbox" id="cfg-auto-solve" />
                <span><strong>\uD83E\uDD16 Auto-Solve Mode:</strong> Automatically solve questions on page load and dynamic quiz navigation</span>
              </label>

              <label class="qa-checkbox-row" style="margin-left: 20px;">
                <input type="checkbox" id="cfg-auto-click" />
                <span><strong>\u26A1 Auto-Click / Select Answer:</strong> Automatically select/check the correct radio button or choice</span>
              </label>

              <div class="qa-form-group" style="margin-left: 24px; margin-bottom: 14px;">
                <label class="qa-label">Auto-Solve Delay (seconds)</label>
                <input type="number" step="0.5" min="0.5" max="10" class="qa-input" id="cfg-auto-solve-delay" style="max-width: 120px;" value="1.5" />
                <div class="qa-help">Wait time before automatically solving after page load or dynamic quiz changes.</div>
              </div>

              <div class="qa-form-group" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
                <label class="qa-label">\u2328\uFE0F Keyboard Shortcuts</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                  <div>
                    <span style="font-size: 12px; color: #a8a29e; display: block; margin-bottom: 4px;">Manual Solve</span>
                    <input type="text" class="qa-input" id="cfg-solve-shortcut" placeholder="Alt+S" value="Alt+S" />
                  </div>
                  <div>
                    <span style="font-size: 12px; color: #a8a29e; display: block; margin-bottom: 4px;">Toggle Auto-Solve</span>
                    <input type="text" class="qa-input" id="cfg-toggle-auto-shortcut" placeholder="Alt+A" value="Alt+A" />
                  </div>
                  <div>
                    <span style="font-size: 12px; color: #a8a29e; display: block; margin-bottom: 4px;">Panic / Hide</span>
                    <input type="text" class="qa-input" id="cfg-hide-shortcut" placeholder="Alt+H" value="Alt+H" />
                  </div>
                </div>
                <div class="qa-help">Click an input and press any key combo to record. Alt-combinations work anywhere on the page.</div>
              </div>

              <label class="qa-checkbox-row" style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
                <input type="checkbox" id="cfg-stealth-mode" />
                <span>Stealth Mode (Subtle underlines/dots, no glowing borders)</span>
              </label>

              <label class="qa-checkbox-row">
                <input type="checkbox" id="cfg-cache-enabled" />
                <span>Response Caching (0 tokens on revisits & instant recall)</span>
              </label>

              <label class="qa-checkbox-row">
                <input type="checkbox" id="cfg-domain-enabled" />
                <span>Enable QuizAssist on this domain (<code>${window.location.hostname}</code>)</span>
              </label>

              <div class="qa-form-group" style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
                <label class="qa-label">Allowed Domains Whitelist</label>
                <input type="text" class="qa-input" id="cfg-allowed-domains" placeholder="*, *.instructure.com, quizlet.com" />
                <div class="qa-help">Use '*' for all domains, or comma-separated domain patterns.</div>
              </div>

                            <div class="qa-form-group">
                <label class="qa-label">Cache Management</label>
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 8px;">
                  <span id="cfg-cache-count-label" style="font-size: 13px; color: #a8a29e;">0 items cached</span>
                  <button class="qa-btn qa-btn-danger" id="cfg-clear-cache">Clear Cache</button>
                </div>
              </div>

              <!-- Dock Position & Reset -->
              <div class="qa-form-group" style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
                <label class="qa-label">\uD83D\uDCCD Floating Dock Position</label>
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 8px;">
                  <span style="font-size: 13px; color: #a8a29e;">Drag using the <strong>&#8942;&#8942;</strong> handle to move anywhere on screen.</span>
                  <button class="qa-btn qa-btn-secondary" id="cfg-reset-dock-pos">Reset Position</button>
                </div>
              </div>

              <!-- Version & Updates Section -->
              <div class="qa-form-group" style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
                <label class="qa-label">Version & Updates</label>
                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 10px 14px; border-radius: 10px;">
                  <div>
                    <span style="font-size: 13.5px; color: #fbfaf8; font-weight: 600;">QuizAssist v${SCRIPT_VERSION}</span>
                    <span id="cfg-update-status" style="display: block; font-size: 12px; color: #a8a29e; margin-top: 2px;">Automatic Tampermonkey background updates active</span>
                  </div>
                  <button class="qa-btn qa-btn-secondary" id="cfg-check-update">\uD83D\uDD04 Check for Updates</button>
                </div>
              </div>
            </div>
          </div>
          <div class="qa-modal-footer">
            <a href="https://buymeacoffee.com/shiweige" target="_blank" rel="noopener noreferrer" class="qa-btn qa-btn-coffee" style="margin-right: auto;">\u2615 Buy me a coffee</a>
            <button class="qa-btn qa-btn-secondary" id="qa-settings-cancel">Cancel</button>
            <button class="qa-btn qa-btn-primary" id="qa-settings-save">Save Settings</button>
          </div>
        </div>
      `;

      this.shadowRoot.appendChild(modal);

      const tabBtns = modal.querySelectorAll('.qa-tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          modal.querySelectorAll('.qa-tab-pane').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          modal.querySelector(`#${btn.getAttribute('data-tab')}`).classList.add('active');
        });
      });

      const provSelect = modal.querySelector('#cfg-active-provider');
      provSelect.addEventListener('change', () => {
        const val = provSelect.value;
        modal.querySelectorAll('.provider-subgroup').forEach(el => el.style.display = 'none');
        const activeSub = modal.querySelector(`#cfg-group-${val}`);
        if (activeSub) activeSub.style.display = 'block';
        const testRes = modal.querySelector('#cfg-test-result');
        if (testRes) testRes.innerText = '';
      });

      ['claude', 'openai', 'gemini'].forEach(p => {
        const select = modal.querySelector(`#cfg-${p}-model-select`);
        const customInput = modal.querySelector(`#cfg-${p}-model-custom`);
        select.addEventListener('change', () => {
          if (select.value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
          } else {
            customInput.style.display = 'none';
          }
        });
      });

      // Shortcut key recorder helpers
      ['cfg-solve-shortcut', 'cfg-toggle-auto-shortcut', 'cfg-hide-shortcut'].forEach(id => {
        const input = modal.querySelector(`#${id}`);
        input.addEventListener('keydown', (e) => {
          e.preventDefault();
          const pressed = [];
          if (e.ctrlKey) pressed.push('Ctrl');
          if (e.altKey) pressed.push('Alt');
          if (e.shiftKey) pressed.push('Shift');
          if (e.metaKey) pressed.push('Meta');
          const key = e.key.toUpperCase();
          if (!['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) {
            pressed.push(key);
          }
          if (pressed.length > 0) {
            input.value = pressed.join('+');
          }
        });
      });

      modal.querySelector('#cfg-launch-picker').addEventListener('click', () => {
        modal.classList.remove('open');
        this.handlePickerClick();
      });

      modal.querySelector('#cfg-test-connection').addEventListener('click', async () => {
        const btn = modal.querySelector('#cfg-test-connection');
        const testRes = modal.querySelector('#cfg-test-result');
        testRes.innerText = 'Testing connection...';
        testRes.style.color = '#fbbf24';
        btn.disabled = true;
        btn.innerText = '\u23F3 Testing...';

        const provider = provSelect.value;
        const getModel = (prov) => {
          const selEl = modal.querySelector(`#cfg-${prov}-model-select`);
          if (!selEl) return '';
          const sel = selEl.value;
          if (sel === 'custom') {
            const customVal = modal.querySelector(`#cfg-${prov}-model-custom`)?.value?.trim();
            return customVal || MODEL_PRESETS[prov]?.[0]?.id || '';
          }
          return sel;
        };

        try {
          const customSettings = {
            claudeApiKey: modal.querySelector('#cfg-claude-key')?.value?.trim() || '',
            claudeModel: getModel('claude'),
            openaiApiKey: modal.querySelector('#cfg-openai-key')?.value?.trim() || '',
            openaiModel: getModel('openai'),
            geminiApiKey: modal.querySelector('#cfg-gemini-key')?.value?.trim() || '',
            geminiModel: getModel('gemini'),
            customEndpoint: modal.querySelector('#cfg-custom-endpoint')?.value?.trim() || '',
            customApiKey: modal.querySelector('#cfg-custom-key')?.value?.trim() || '',
            customModel: modal.querySelector('#cfg-custom-model')?.value?.trim() || '',
          };

          if (provider === 'claude' && !customSettings.claudeApiKey) {
            throw new Error('Please enter your Claude API key first.');
          }
          if (provider === 'openai' && !customSettings.openaiApiKey) {
            throw new Error('Please enter your OpenAI API key first.');
          }
          if (provider === 'gemini' && !customSettings.geminiApiKey) {
            throw new Error('Please enter your Gemini API key first.');
          }
          if (provider === 'custom' && !customSettings.customEndpoint) {
            throw new Error('Please enter your Custom Endpoint URL first.');
          }

          await AIClient.testConnection(provider, customSettings);
          testRes.innerText = 'Connected Successfully! \u2705';
          testRes.style.color = '#5bb98c';
        } catch (err) {
          testRes.innerText = `Error: ${err.message}`;
          testRes.style.color = '#f87171';
        } finally {
          btn.disabled = false;
          btn.innerText = '\uD83D\uDD0C Test AI Connection';
        }
      });

      modal.querySelector('#cfg-reset-dock-pos')?.addEventListener('click', () => {
        this.resetDockPosition();
      });

      modal.querySelector('#cfg-clear-cache').addEventListener('click', () => {
        const count = CacheManager.clearAll();
        modal.querySelector('#cfg-cache-count-label').innerText = '0 items cached';
        this.showToast(`Cleared ${count} cached quiz items.`, 'success');
      });

      // Update check handler
      modal.querySelector('#cfg-check-update').addEventListener('click', async () => {
        const btn = modal.querySelector('#cfg-check-update');
        const statusEl = modal.querySelector('#cfg-update-status');
        btn.disabled = true;
        btn.innerText = 'Checking...';
        statusEl.innerText = 'Checking GitHub for updates...';
        statusEl.style.color = '#fbbf24';

        const res = await UpdateManager.checkForUpdates();
        btn.disabled = false;
        btn.innerText = '\uD83D\uDD04 Check for Updates';

        if (res.isNewer) {
          statusEl.innerHTML = `<span style="color: #5bb98c; font-weight: 600;">New version v${res.latestVersion} available!</span> <a href="${DOWNLOAD_URL}" target="_blank" style="color: #d97757; font-weight: 700; margin-left: 6px; text-decoration: underline;">Install Update</a>`;
          this.showToast(`\uD83D\uDE80 New QuizAssist update v${res.latestVersion} available!`, 'success');
        } else if (res.success) {
          statusEl.innerHTML = `<span style="color: #5bb98c;">You are on the latest version (v${res.currentVersion}) \u2705</span>`;
          this.showToast('QuizAssist is up to date!', 'success');
        } else {
          statusEl.innerHTML = `<span style="color: #a8a29e;">Installed: v${SCRIPT_VERSION} (Unable to reach update server)</span>`;
          this.showToast('Could not reach update server. Check your connection.', 'info');
        }
      });

      modal.querySelector('#qa-settings-save').addEventListener('click', () => {
        this.saveSettingsFromModal();
        modal.classList.remove('open');
        this.showToast('Settings saved successfully!', 'success');
      });

      modal.querySelector('#qa-settings-close').addEventListener('click', () => modal.classList.remove('open'));
      modal.querySelector('#qa-settings-cancel').addEventListener('click', () => modal.classList.remove('open'));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('open');
      });
    }

    static openSettingsModal() {
      const config = ConfigManager.get();
      const profile = ConfigManager.getDomainProfile();
      const modal = this.shadowRoot.getElementById('qa-settings-modal');

      modal.querySelector('#cfg-active-provider').value = config.activeProvider;
      const testRes = modal.querySelector('#cfg-test-result');
      if (testRes) testRes.innerText = '';

      // Claude setup
      modal.querySelector('#cfg-claude-key').value = config.claudeApiKey || '';
      const cModel = config.claudeModel || 'claude-opus-5-5';
      const cSel = modal.querySelector('#cfg-claude-model-select');
      const cCust = modal.querySelector('#cfg-claude-model-custom');
      if (Array.from(cSel.options).some(o => o.value === cModel)) {
        cSel.value = cModel;
        cCust.style.display = 'none';
      } else {
        cSel.value = 'custom';
        cCust.value = cModel;
        cCust.style.display = 'block';
      }

      // OpenAI setup
      modal.querySelector('#cfg-openai-key').value = config.openaiApiKey || '';
      const oModel = config.openaiModel || 'gpt-6.1-sol';
      const oSel = modal.querySelector('#cfg-openai-model-select');
      const oCust = modal.querySelector('#cfg-openai-model-custom');
      if (Array.from(oSel.options).some(o => o.value === oModel)) {
        oSel.value = oModel;
        oCust.style.display = 'none';
      } else {
        oSel.value = 'custom';
        oCust.value = oModel;
        oCust.style.display = 'block';
      }

      // Gemini setup
      modal.querySelector('#cfg-gemini-key').value = config.geminiApiKey || '';
      const gModel = config.geminiModel || 'gemini-3.8-flash';
      const gSel = modal.querySelector('#cfg-gemini-model-select');
      const gCust = modal.querySelector('#cfg-gemini-model-custom');
      if (Array.from(gSel.options).some(o => o.value === gModel)) {
        gSel.value = gModel;
        gCust.style.display = 'none';
      } else {
        gSel.value = 'custom';
        gCust.value = gModel;
        gCust.style.display = 'block';
      }

      // Custom setup
      modal.querySelector('#cfg-custom-endpoint').value = config.customEndpoint || '';
      modal.querySelector('#cfg-custom-key').value = config.customApiKey || '';
      modal.querySelector('#cfg-custom-model').value = config.customModel || '';

      // Active tab display
      modal.querySelectorAll('.provider-subgroup').forEach(el => el.style.display = 'none');
      const activeSub = modal.querySelector(`#cfg-group-${config.activeProvider}`);
      if (activeSub) activeSub.style.display = 'block';

      // Selectors
      modal.querySelector('#cfg-sel-container').value = profile.questionContainer || '';
      modal.querySelector('#cfg-sel-qtext').value = profile.questionText || '';
      modal.querySelector('#cfg-sel-option').value = profile.answerOption || '';
      modal.querySelector('#cfg-sel-atext').value = profile.answerText || '';

      // General, Modes & Shortcuts
      modal.querySelector('#cfg-auto-solve').checked = !!config.autoSolveOnLoad;
      modal.querySelector('#cfg-auto-click').checked = !!config.autoClickAnswers;
      modal.querySelector('#cfg-auto-solve-delay').value = config.autoSolveDelay || 1.5;
      modal.querySelector('#cfg-solve-shortcut').value = config.solveShortcut || 'Alt+S';
      modal.querySelector('#cfg-toggle-auto-shortcut').value = config.toggleAutoShortcut || 'Alt+A';
      modal.querySelector('#cfg-hide-shortcut').value = config.hideShortcut || 'Alt+H';
      modal.querySelector('#cfg-domain-enabled').checked = ConfigManager.isDomainAllowed();
      modal.querySelector('#cfg-stealth-mode').checked = !!config.stealthMode;
      modal.querySelector('#cfg-cache-enabled').checked = config.cacheEnabled !== false;
      modal.querySelector('#cfg-allowed-domains').value = (config.allowedDomains || ['*']).join(', ');

      modal.querySelector('#cfg-cache-count-label').innerText = `${CacheManager.count()} items cached`;
      modal.querySelector('#cfg-test-result').innerText = '';

      modal.classList.add('open');
    }

    static saveSettingsFromModal() {
      const modal = this.shadowRoot.getElementById('qa-settings-modal');
      const hostname = window.location.hostname;

      const domainsRaw = modal.querySelector('#cfg-allowed-domains').value;
      const domains = domainsRaw.split(',').map(s => s.trim()).filter(Boolean);

      const domainEnabled = modal.querySelector('#cfg-domain-enabled').checked;
      if (domainEnabled && !domains.includes(hostname) && !domains.includes('*')) {
        domains.push(hostname);
      } else if (!domainEnabled && domains.includes(hostname)) {
        const idx = domains.indexOf(hostname);
        if (idx >= 0) domains.splice(idx, 1);
      }

      const getModel = (prov) => {
        const sel = modal.querySelector(`#cfg-${prov}-model-select`).value;
        if (sel === 'custom') {
          const customVal = modal.querySelector(`#cfg-${prov}-model-custom`).value.trim();
          return customVal || MODEL_PRESETS[prov]?.[0]?.id || '';
        }
        return sel;
      };

      const updated = {
        activeProvider: modal.querySelector('#cfg-active-provider').value,
        claudeApiKey: modal.querySelector('#cfg-claude-key').value.trim(),
        claudeModel: getModel('claude'),
        openaiApiKey: modal.querySelector('#cfg-openai-key').value.trim(),
        openaiModel: getModel('openai'),
        geminiApiKey: modal.querySelector('#cfg-gemini-key').value.trim(),
        geminiModel: getModel('gemini'),
        customEndpoint: modal.querySelector('#cfg-custom-endpoint').value.trim(),
        customApiKey: modal.querySelector('#cfg-custom-key').value.trim(),
        customModel: modal.querySelector('#cfg-custom-model').value.trim(),
        autoSolveOnLoad: modal.querySelector('#cfg-auto-solve').checked,
        autoClickAnswers: modal.querySelector('#cfg-auto-click').checked,
        autoSolveDelay: parseFloat(modal.querySelector('#cfg-auto-solve-delay').value) || 1.5,
        solveShortcut: modal.querySelector('#cfg-solve-shortcut').value.trim() || 'Alt+S',
        toggleAutoShortcut: modal.querySelector('#cfg-toggle-auto-shortcut').value.trim() || 'Alt+A',
        hideShortcut: modal.querySelector('#cfg-hide-shortcut').value.trim() || 'Alt+H',
        stealthMode: modal.querySelector('#cfg-stealth-mode').checked,
        cacheEnabled: modal.querySelector('#cfg-cache-enabled').checked,
        allowedDomains: domains
      };

      const profile = {
        questionContainer: modal.querySelector('#cfg-sel-container').value.trim(),
        questionText: modal.querySelector('#cfg-sel-qtext').value.trim(),
        answerOption: modal.querySelector('#cfg-sel-option').value.trim(),
        answerText: modal.querySelector('#cfg-sel-atext').value.trim()
      };
      ConfigManager.setDomainProfile(hostname, profile);

      ConfigManager.update(updated);
      this.updateDockStatus();
      this.updateAutoSolveButton();

      if (updated.autoSolveOnLoad && ConfigManager.isDomainAllowed()) {
        this.startAutoSolveObserver();
      } else {
        this.stopAutoSolveObserver();
      }

      const solveBtn = this.shadowRoot.getElementById('qa-btn-solve');
      if (solveBtn) solveBtn.title = `Manual Solve (${updated.solveShortcut})`;
    }
  }

  /**
   * =========================================================================
   * INITIALIZATION & TAMPERMONKEY MENU COMMANDS
   * =========================================================================
   */
  function initialize() {
    if (typeof GM_registerMenuCommand !== 'undefined') {
      const config = ConfigManager.get();
      GM_registerMenuCommand(`\u26A1 Solve Quiz Questions (${config.solveShortcut || 'Alt+S'})`, () => UIManager.handleSolveClick({ isAuto: false, silent: false }));
      GM_registerMenuCommand(`\uD83D\uDD04 Toggle Auto-Solve Mode (${config.toggleAutoShortcut || 'Alt+A'})`, () => UIManager.toggleAutoSolveMode());
      GM_registerMenuCommand(`\uD83D\uDC41\uFE0F Toggle Stealth / Panic Hide (${config.hideShortcut || 'Alt+H'})`, () => UIManager.toggleVisibility());
      GM_registerMenuCommand('\uD83C\uDFAF Visual Selector Picker', () => UIManager.handlePickerClick());
      GM_registerMenuCommand('\u2699\uFE0F QuizAssist Settings', () => UIManager.openSettingsModal());
      GM_registerMenuCommand('\uD83D\uDD04 Check for Script Updates', async () => {
        const res = await UpdateManager.checkForUpdates();
        if (res.isNewer) {
          if (confirm(`A new version of QuizAssist (v${res.latestVersion}) is available!\n\nWould you like to install the update now?`)) {
            window.open(DOWNLOAD_URL, '_blank');
          }
        } else if (res.success) {
          alert(`QuizAssist is up to date (v${res.currentVersion}) \u2705`);
        } else {
          alert('Unable to reach the update server. Please check your internet connection.');
        }
      });
      GM_registerMenuCommand('\u2615 Buy Me a Coffee', () => window.open('https://buymeacoffee.com/shiweige', '_blank'));
      GM_registerMenuCommand('\uD83D\uDDD1\uFE0F Clear Response Cache', () => {
        const count = CacheManager.clearAll();
        alert(`Cleared ${count} cached quiz items.`);
      });
    }

    UIManager.init();

    // Periodic daily non-intrusive update check
    try {
      const lastCheck = parseInt(GM_getValue('qa_last_update_check', '0'), 10) || 0;
      const now = Date.now();
      if (now - lastCheck > 24 * 60 * 60 * 1000) {
        GM_setValue('qa_last_update_check', now.toString());
        setTimeout(async () => {
          const res = await UpdateManager.checkForUpdates();
          if (res.isNewer) {
            UIManager.showToast(`\uD83D\uDE80 QuizAssist v${res.latestVersion} is available! Open Settings to update.`, 'info');
          }
        }, 5000);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
