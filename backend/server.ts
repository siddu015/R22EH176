import express from 'express';
import cors from 'cors';
import { randomBytes } from 'crypto';
import { Log } from '../logging-middleware/index.ts';

const app = express();
app.use(cors());
app.use(express.json());

const urls = new Map();
const analytics = new Map();

const generateCode = () => randomBytes(3).toString('hex');
const isValidUrl = (url: string) => { try { new URL(url); return true; } catch { return false; } };

// POST /shorturls
app.post('/shorturls', async (req, res) => {
  Log("backend", "info", "route", "Processing URL shortening request");
  
  const { url, validity = 30, shortcode } = req.body;
  
  if (!isValidUrl(url)) {
    Log("backend", "error", "controller", "Invalid URL format");
    return res.status(400).json({ error: "Invalid URL" });
  }

  let code = shortcode || generateCode();
  if (urls.has(code)) {
    return res.status(409).json({ error: "Shortcode exists" });
  }

  const expiry = new Date(Date.now() + validity * 60 * 1000);
  const creationDate = new Date();
  
  urls.set(code, { url, expiry, creationDate });
  analytics.set(code, { clicks: 0, details: [] });
  
  Log("backend", "info", "service", `Generated shortcode: ${code}`);
  
  res.status(201).json({
    shortLink: `http://localhost:3001/${code}`,
    expiry: expiry.toISOString()
  });
});

// GET /:shortcode - Redirect
app.get('/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const data = urls.get(shortcode);
  
  if (!data || new Date() > data.expiry) {
    Log("backend", "error", "handler", "Shortcode not found or expired");
    return res.status(404).json({ error: "Not found" });
  }
  
  const stats = analytics.get(shortcode);
  stats.clicks++;
  stats.details.push({
    timestamp: new Date().toISOString(),
    referrer: req.get('Referrer') || 'Direct',
    location: "India"
  });
  
  Log("backend", "info", "handler", `Redirecting to: ${data.url}`);
  res.redirect(data.url);
});

// GET /shorturls/:shortcode - Stats
app.get('/shorturls/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const data = urls.get(shortcode);
  const stats = analytics.get(shortcode);
  
  if (!data) {
    Log("backend", "error", "handler", "Stats not found");
    return res.status(404).json({ error: "Not found" });
  }
  
  Log("backend", "info", "service", "Returning statistics");
  
  res.json({
    totalClicks: stats.clicks,
    originalUrl: data.url,
    creationDate: data.creationDate.toISOString(),
    expiryDate: data.expiry.toISOString(),
    clickDetails: stats.details
  });
});

app.listen(3001, () => {
  Log("backend", "info", "service", "Server running on port 3001");
  console.log('Server running on port 3001');
});
