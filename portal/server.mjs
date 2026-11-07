import http from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = Number(process.env.PORT || 8088);
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const home = readFileSync(path.join(ROOT, 'index.html'));
const services = [
  { id: 'osiris', url: 'http://osiris:3000/', label: 'OSIRIS' },
  { id: 'freellmapi', url: 'http://freellmapi:3001/api/ping', label: 'FreeLLMAPI' },
  { id: 'ollama', url: `${OLLAMA_URL}/api/tags`, label: 'Ollama' },
  { id: 'openwebui', url: 'http://open-webui:8080/', label: 'Open WebUI' },
  { id: 'searxng', url: 'http://searxng:8080/', label: 'SearXNG' },
  { id: 'qdrant', url: 'http://qdrant:6333/healthz', label: 'Qdrant' },
];
function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'",
  });
  res.end(body);
}
async function readJson(req, limit = 65536) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > limit) throw new Error('request_too_large');
  }
  try { return JSON.parse(raw); } catch { throw new Error('invalid_json'); }
}
async function getModels() {
  const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`ollama_${response.status}`);
  const data = await response.json();
  return Array.isArray(data.models) ? data.models.map(m => m.name).filter(x => typeof x === 'string') : [];
}
async function route(req, res) {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'",
    });
    res.end(home);
    return;
  }
  if (req.method === 'GET' && url.pathname === '/healthz') {
    json(res, 200, { ok: true }); return;
  }
  if (req.method === 'GET' && url.pathname === '/api/status') {
    const results = await Promise.all(services.map(async svc => {
      try {
        const resp = await fetch(svc.url, { signal: AbortSignal.timeout(1600) });
        return { id: svc.id, label: svc.label, online: resp.status < 500 };
      } catch { return { id: svc.id, label: svc.label, online: false }; }
    }));
    json(res, 200, { services: results, checkedAt: new Date().toISOString() }); return;
  }
  if (req.method === 'GET' && url.pathname === '/api/models') {
    try { json(res, 200, { models: await getModels() }); }
    catch { json(res, 503, { error: 'Ollama მიუწვდომელია', models: [] }); }
    return;
  }
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    try {
      const data = await readJson(req);
      if (typeof data.model !== 'string' || data.model.length > 200 ||
          !Array.isArray(data.messages) || data.messages.length < 1 || data.messages.length > 20 ||
          !data.messages.every(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.length <= 6000)) {
        json(res, 400, { error: 'მოთხოვნის არასწორი ფორმატი' }); return;
      }
      const models = await getModels();
      if (!models.includes(data.model)) {
        json(res, 400, { error: 'მოდელი დაყენებული არ არის. ჯერ ჩამოტვირთე Ollama-ს მოდელი.' }); return;
      }
      const reply = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(120000),
        body: JSON.stringify({ model: data.model, messages: data.messages, stream: false, options: { num_predict: 900 } }),
      });
      if (!reply.ok) throw new Error(`ollama_${reply.status}`);
      const result = await reply.json();
      json(res, 200, { message: result.message?.content || '' });
    } catch (err) {
      json(res, ['invalid_json', 'request_too_large'].includes(err.message) ? 400 : 502,
        { error: err.message === 'request_too_large' ? 'შეტყობინება ძალიან დიდია' : 'AI-ს პასუხი ვერ მივიღეთ' });
    }
    return;
  }
  json(res, 404, { error: 'not_found' });
}
http.createServer((req, res) => {
  route(req, res).catch(() => json(res, 500, { error: 'internal_error' }));
}).listen(PORT, '0.0.0.0', () => console.log(`Portal listening on ${PORT}`));
