import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function normalizeMessages(body) {
  if (Array.isArray(body.messages)) return body.messages;
  if (typeof body.prompt === 'string') return [{ role: 'user', content: body.prompt }];
  throw new Error('Missing prompt or messages');
}

function createDeepSeekApi(env) {
  const apiKey = env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
  const apiBase = env.DEEPSEEK_API_BASE || process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';
  const model = env.DEEPSEEK_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

  async function complete(body) {
    const messages = normalizeMessages(body);
    const upstream = await fetch(`${apiBase.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: body.temperature ?? 0.7,
        stream: false,
      }),
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = null; }

    if (!upstream.ok) {
      const err = new Error(data?.error?.message || data?.message || text || 'DeepSeek request failed');
      err.statusCode = upstream.status;
      throw err;
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      const err = new Error('DeepSeek returned an empty response');
      err.statusCode = 502;
      throw err;
    }

    return content;
  }

  function statusPayload() {
    return {
      enabled: !!apiKey,
      provider: 'deepseek',
      model,
    };
  }

  return async function deepSeekApi(req, res, next) {
    if (!req.url.startsWith('/api/ai/')) return next();

    if (req.url.startsWith('/api/ai/status')) {
      sendJson(res, 200, statusPayload());
      return;
    }

    if (req.url.startsWith('/api/ai/complete-jsonp')) {
      const url = new URL(req.url, 'http://localhost');
      const callback = url.searchParams.get('callback') || '';
      if (!/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(callback)) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.end('throw new Error("Invalid JSONP callback");');
        return;
      }
      if (!apiKey) {
        const payload = JSON.stringify({ error: 'DEEPSEEK_API_KEY is not configured', provider: 'deepseek', model }).replace(/</g, '\\u003c');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.end(`${callback}(${payload});`);
        return;
      }
      try {
        const body = JSON.parse(url.searchParams.get('payload') || '{}');
        const content = await complete(body);
        const payload = JSON.stringify({ content, provider: 'deepseek', model }).replace(/</g, '\\u003c');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.end(`${callback}(${payload});`);
      } catch (err) {
        const payload = JSON.stringify({ error: err.message || 'AI request failed', provider: 'deepseek', model }).replace(/</g, '\\u003c');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.end(`${callback}(${payload});`);
      }
      return;
    }

    if (!req.url.startsWith('/api/ai/complete')) return next();
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }
    if (!apiKey) {
      sendJson(res, 503, { error: 'DEEPSEEK_API_KEY is not configured' });
      return;
    }

    try {
      const body = await readJsonBody(req);
      const content = await complete(body);
      sendJson(res, 200, { content, provider: 'deepseek', model });
    } catch (err) {
      sendJson(res, err.statusCode || 500, { error: err.message || 'AI request failed', provider: 'deepseek', model });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const deepSeekApi = createDeepSeekApi(env);

  return {
    plugins: [
      react({
        jsxRuntime: 'classic',
      }),
      {
        name: 'deepseek-api',
        transformIndexHtml() {
          const payload = JSON.stringify({
            enabled: !!(env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY),
            provider: 'deepseek',
            model: env.DEEPSEEK_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
          }).replace(/</g, '\\u003c');
          return [
            {
              tag: 'script',
              attrs: {},
              children: `window.__AI_STATUS__=${payload};`,
              injectTo: 'head',
            },
          ];
        },
        configureServer(server) {
          server.middlewares.use(deepSeekApi);
        },
        configurePreviewServer(server) {
          server.middlewares.use(deepSeekApi);
        },
      },
    ],
    server: {
      port: 4175,
      strictPort: false,
    },
  };
});
