import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Initialize Gemini AI client lazily/safely
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Background Removal Proxy
  app.post('/api/ai/remove-bg', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/png' } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType,
              },
            },
            {
              text: 'Analyze this image and identify the main subject foreground and background coordinates and dominant subject color bounding box.',
            },
          ],
        },
      });

      res.json({ result: response.text || 'Background analyzed successfully.' });
    } catch (err: any) {
      console.error('AI BG Removal error:', err?.message || err);
      res.status(500).json({ error: err?.message || 'Failed to analyze image background.' });
    }
  });

  // AI Meme Caption Generator
  app.post('/api/ai/meme-caption', async (req, res) => {
    try {
      const { imageBase64, language = 'en' } = req.body;
      const ai = getGenAI();
      const promptText = language === 'hi'
        ? 'इस इमेज के लिए 2 मजेदार हिंदी मीम टेक्स्ट बनाएं (Top text और Bottom text)। JSON में दें: {"topText": "...", "bottomText": "..."}'
        : 'Generate 2 funny meme texts for this image (Top text and Bottom text). Return JSON: {"topText": "...", "bottomText": "..."}';

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
            { text: promptText },
          ],
        },
      });

      res.json({ text: response.text || '' });
    } catch (err: any) {
      console.error('AI Meme caption error:', err?.message || err);
      res.status(500).json({ error: 'Failed to generate meme caption.' });
    }
  });

  // Vite middleware for dev mode vs production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Image Tools Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
