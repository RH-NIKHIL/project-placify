const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Middleware (optional) to authenticate for attribution
function authOptional(req, _res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {}
  }
  next();
}

// Preferred model candidates for image-style SVG JSON generation
const IMAGE_MODEL_CANDIDATES = [
  process.env.GEMINI_IMAGE_MODEL,
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro'
].filter(Boolean);

// Lightweight cached model list for discovery
let cachedImageModels = { ts: 0, data: [] };
async function listImageModels(apiKey) {
  const now = Date.now();
  if (now - cachedImageModels.ts < 5 * 60 * 1000 && cachedImageModels.data.length) return cachedImageModels.data;
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(apiKey);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('list models http ' + resp.status);
    const json = await resp.json();
    const names = (json.models || []).map(m => m.name).filter(Boolean);
    cachedImageModels = { ts: now, data: names };
    return names;
  } catch (e) {
    console.warn('Could not list models for images:', e.message);
    return [];
  }
}

// POST /api/images/generate { prompt }
router.post('/generate', authOptional, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'GEMINI_API_KEY not configured' });

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'prompt is required' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const attempts = [];
    let lastErr;
    let chosenModel = null;
    let raw = '';

    const systemInstruction = `You generate SMALL, clean SVG icons / illustrations. Output ONLY JSON of the form {"svg":"<svg ...>...</svg>"}. Rules: width & height 512, no external references, no scripts, no event handlers, no <foreignObject>. Use flat colors and simple shapes.`;
    const fullPrompt = `${systemInstruction}\nUser prompt: ${prompt.trim()}\nRespond with ONLY JSON.`;

    // Try configured candidates first
    for (const candidate of IMAGE_MODEL_CANDIDATES) {
      try {
        const model = genAI.getGenerativeModel({ model: candidate });
        const result = await model.generateContent(fullPrompt);
        raw = result?.response?.text?.() || '';
        chosenModel = candidate;
        break;
      } catch (err) {
        attempts.push({ model: candidate, error: err.message });
        lastErr = err;
        if (!String(err.message || '').includes('404')) break; // non-404 -> stop early
      }
    }

    // If still not chosen and last error was 404, attempt discovery
    if (!chosenModel && String(lastErr?.message || '').includes('404')) {
      const available = await listImageModels(apiKey);
      const simple = available.map(n => n.split('/').pop());
      const discovered = simple.find(n => /flash/i.test(n)) || simple[0];
      if (discovered) {
        try {
          const model = genAI.getGenerativeModel({ model: discovered });
          const result = await model.generateContent(fullPrompt);
          raw = result?.response?.text?.() || '';
          chosenModel = discovered;
          attempts.push({ model: discovered, discovered: true, success: true });
        } catch (err2) {
          attempts.push({ model: discovered, discovered: true, error: err2.message });
          lastErr = err2;
        }
      }
      if (!chosenModel) {
        return res.status(500).json({
          message: 'Image generation failed after fallbacks & discovery',
          attempts,
          error: lastErr?.message
        });
      }
    } else if (!chosenModel) {
      return res.status(500).json({
        message: 'Image generation failed (no model succeeded)',
        attempts,
        error: lastErr?.message
      });
    }

    // If model returns unexpected HTML (rare), short-circuit
    if (/^<!DOCTYPE|^<html/i.test(raw.trim())) {
      return res.status(502).json({
        message: 'Upstream model returned HTML instead of JSON',
        snippet: raw.slice(0, 200)
      });
    }

    // Extract JSON block
    let jsonText = raw.trim();
    // Remove markdown fences if present
    jsonText = jsonText.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    let svg = '';
    try {
      const parsed = JSON.parse(jsonText);
      svg = (parsed && parsed.svg) ? String(parsed.svg) : '';
    } catch (e) {
      // Try regex fallback to capture <svg>...</svg>
      const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
      if (match) svg = match[0];
    }
    if (!svg) return res.status(500).json({ message: 'Model did not return SVG' });

    // Basic sanitization
    const banned = /(script|onload=|onerror=|foreignObject)/i;
    if (banned.test(svg)) return res.status(400).json({ message: 'Unsafe SVG content detected' });
    // Enforce width/height and xmlns
    svg = svg
      .replace(/<svg([^>]*?)>/i, (m, attrs) => {
        let a = attrs;
        if (!/xmlns=/.test(a)) a += ' xmlns="http://www.w3.org/2000/svg"';
        if (!/width=/.test(a)) a += ' width="512"';
        if (!/height=/.test(a)) a += ' height="512"';
        return `<svg${a}>`;
      });
    // Clamp size
    if (svg.length > 20000) svg = svg.slice(0, 20000) + '<!-- truncated -->';

    // Score update
    if (req.user?.id) {
      try {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { imagesGenerated: 1, score: 3 },
          $set: { lastScoreUpdate: new Date() }
        });
      } catch (_) {}
    }

    res.json({ message: 'ok', model: chosenModel, svg });
  } catch (error) {
    console.error('Gemini SVG generation error:', error);
    res.status(500).json({ message: 'Image generation failed', error: error.message });
  }
});

// POST /api/images/pollinations { prompt }
// Simple proxy to pollinations.ai (returns direct image URL). No API key required.
router.post('/pollinations', authOptional, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ message: 'prompt is required' });
    }

    // Construct Pollinations URL (encode prompt). Pollinations serves images deterministically per prompt.
    const encoded = encodeURIComponent(prompt.trim());
    const imageUrl = `https://pollinations.ai/p/${encoded}`;

    // Optionally increment user score (treat like an image generation)
    if (req.user?.id) {
      try {
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { imagesGenerated: 1, score: 2 }, // Slightly lower score than Gemini SVG (configurable)
          $set: { lastScoreUpdate: new Date() }
        });
      } catch (_) {}
    }

    res.json({ message: 'ok', provider: 'pollinations', imageUrl });
  } catch (error) {
    console.error('Pollinations generation error:', error);
    res.status(500).json({ message: 'Pollinations image generation failed', error: error.message });
  }
});

// Simple debug endpoint to verify connectivity & configuration (no secrets exposed)
router.get('/debug', (req, res) => {
  res.json({
    ok: true,
    hasKey: !!process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_IMAGE_MODEL || 'gemini-1.5-flash'
  });
});

module.exports = router;