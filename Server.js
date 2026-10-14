const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const FILE = process.env.DATA_FILE || path.join(__dirname, 'scores.json');
const MODES = ['service', 'challenge'];   // free drive is not scored
const MAX_SCORE = 5000;                   // sanity cap (5 stations)

let scores = [];
try { scores = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { scores = []; }
const save = () => fs.writeFile(FILE, JSON.stringify(scores), () => {});

const app = express();
app.use(cors());                          // set origin to your GitHub Pages URL to lock it down
app.use(express.json({ limit: '2kb' }));

// simple per-IP rate limit: 10 submissions per minute
const hits = new Map();
setInterval(() => hits.clear(), 60000);
const limit = (req, res, next) => {
  const n = (hits.get(req.ip) || 0) + 1;
  hits.set(req.ip, n);
  n > 10 ? res.status(429).json({ error: 'Too many requests' }) : next();
};

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/scores', (req, res) => {
  const mode = req.query.mode;
  const list = scores
    .filter(s => !mode || s.mode === mode)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  res.json(list);
});

app.post('/api/scores', limit, (req, res) => {
  const { name, score, mode } = req.body || {};
  const clean = String(name || '').replace(/[^\w \-.]/g, '').trim().slice(0, 16);
