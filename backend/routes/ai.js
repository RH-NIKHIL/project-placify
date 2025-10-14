const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Preferred model hierarchy (will attempt first configured, then fallbacks)
const PREFERRED_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro'
].filter(Boolean);

function systemPreamble() {
  return `You are an AI assistant inside a job & resume platform. Provide concise, professional, safe answers. If asked for disallowed or sensitive content, politely refuse.`;
}

// Utility: fetch model list (cached for short period)
let cachedModels = { ts: 0, data: [] };
async function listAvailableModels(apiKey) {
  const now = Date.now();
  if (now - cachedModels.ts < 5 * 60 * 1000 && cachedModels.data.length) return cachedModels.data;
  try {
    // Use REST endpoint for listing models
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(apiKey);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`list models http ${resp.status}`);
    const json = await resp.json();
    const names = (json.models || []).map(m => m.name).filter(Boolean);
    cachedModels = { ts: now, data: names };
    return names;
  } catch (e) {
    console.warn('Could not list models (REST):', e.message);
    return [];
  }
}

// Debug endpoint to view models (remove or protect in production)
router.get('/models', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'GEMINI_API_KEY not configured' });
  const list = await listAvailableModels(apiKey);
  res.json({ models: list });
});

// Debug endpoint summarizing current config & cache
router.get('/debug', (req, res) => {
  res.json({
    preferredModels: PREFERRED_MODELS,
    cachedModelCount: cachedModels.data.length,
    cacheAgeMs: Date.now() - cachedModels.ts,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    configuredModelEnv: process.env.GEMINI_MODEL || null
  });
});

router.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY not configured on server' });
    }

  const { messages, forceModel } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages array required' });
    }

    // Keep only last 12 messages to control token usage
    const recent = messages.slice(-12);
    const conversation = recent.map(m => {
      const roleLabel = m.role === 'user' ? 'User' : 'Assistant';
      return `${roleLabel}: ${m.content}`;
    }).join('\n');

    const prompt = `${systemPreamble()}\n\nConversation so far:\n${conversation}\n\nAssistant:`;

    const genAI = new GoogleGenerativeAI(apiKey);

    let lastErr;
    const attempts = [];
    const modelList = forceModel ? [forceModel] : PREFERRED_MODELS;
    for (const candidate of modelList) {
      try {
        const model = genAI.getGenerativeModel({ model: candidate });
        const result = await model.generateContent(prompt);
        const reply = result?.response?.text?.() || '(No response)';
        return res.json({ message: 'ok', model: candidate, forced: !!forceModel, reply });
      } catch (err) {
        lastErr = err;
        attempts.push({ model: candidate, error: err.message });
        // Continue to next candidate if 404 / not found
        if (String(err?.message || '').includes('404')) {
          continue;
        } else {
          break; // other errors (quota, auth) shouldn't keep retrying
        }
      }
    }
    // If all configured fallbacks failed with 404, attempt dynamic discovery
    if (String(lastErr?.message || '').includes('404')) {
      const available = await listAvailableModels(apiKey);
      // API returns names like models/gemini-1.5-flash-latest; extract id after last /
      const simple = available.map(n => n.split('/').pop());
      const preferredId = simple.find(n => /flash/i.test(n)) || simple[0];
      const preferredFull = available.find(m => m.endsWith('/' + preferredId)) || preferredId;
  if (preferredId) {
        try {
          const model = genAI.getGenerativeModel({ model: preferredId });
          const result = await model.generateContent(prompt);
          const reply = result?.response?.text?.() || '(No response)';
          return res.json({ message: 'ok', model: preferredId, modelFull: preferredFull, discovered: true, attempts, reply });
        } catch (err2) {
          lastErr = err2;
          attempts.push({ model: preferredId, error: err2.message });
        }
      }
      return res.status(500).json({
        message: 'AI request failed after fallbacks and discovery',
        tried: PREFERRED_MODELS,
        discovered: simple,
        error: lastErr?.message,
        attempts
      });
    }

    console.error('Gemini chat error (after fallbacks):', lastErr);
    return res.status(500).json({
      message: 'AI request failed after trying available models',
      tried: PREFERRED_MODELS,
      error: lastErr?.message,
      attempts
    });
  } catch (error) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ message: 'AI request failed', error: error.message });
  }
});

module.exports = router;
