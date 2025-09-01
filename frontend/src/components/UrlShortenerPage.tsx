import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Alert } from '@mui/material';
import { Log } from '../utils/logging';

interface UrlData {
  url: string;
  validity: number;
  shortcode: string;
}

interface UrlResult {
  original: string;
  shortLink: string;
  expiry: string;
}

export default function UrlShortenerPage() {
  const [urls, setUrls] = useState<UrlData[]>([
    { url: '', validity: 30, shortcode: '' },
    { url: '', validity: 30, shortcode: '' },
    { url: '', validity: 30, shortcode: '' },
    { url: '', validity: 30, shortcode: '' },
    { url: '', validity: 30, shortcode: '' }
  ]);
  const [results, setResults] = useState<UrlResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateUrl = (index: number, field: keyof UrlData, value: string | number) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateInputs = (): string | null => {
    const filledUrls = urls.filter(u => u.url.trim());
    
    if (filledUrls.length === 0) {
      return 'Please enter at least one URL';
    }

    for (let i = 0; i < filledUrls.length; i++) {
      const urlData = filledUrls[i];
      
      // Validate URL format
      if (!validateUrl(urlData.url.trim())) {
        return `Invalid URL format in URL #${urls.indexOf(urlData) + 1}`;
      }
      
      // Validate validity as positive integer
      if (urlData.validity <= 0 || !Number.isInteger(urlData.validity)) {
        return `Validity must be a positive integer in URL #${urls.indexOf(urlData) + 1}`;
      }
      
      // Validate shortcode (alphanumeric and reasonable length)
      if (urlData.shortcode && !/^[a-zA-Z0-9]{1,20}$/.test(urlData.shortcode)) {
        return `Shortcode must be alphanumeric (1-20 characters) in URL #${urls.indexOf(urlData) + 1}`;
      }
    }

    return null;
  };

  const shortenUrls = async () => {
    Log("frontend", "info", "api", "Processing multiple URLs concurrently");
    
    // Client-side validation
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    const validUrls = urls.filter(u => u.url.trim());
    setLoading(true);
    setError('');
    setResults([]);

    try {
      // Process all URLs concurrently
      const promises = validUrls.map(async (urlData, index) => {
        const response = await fetch('http://localhost:3001/shorturls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: urlData.url.trim(),
            validity: urlData.validity,
            shortcode: urlData.shortcode.trim() || undefined
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            original: urlData.url.trim(),
            shortLink: data.shortLink,
            expiry: data.expiry
          };
        } else {
          const err = await response.json();
          throw new Error(`URL #${urls.indexOf(urlData) + 1}: ${err.error}`);
        }
      });

      const results = await Promise.all(promises);
      setResults(results);
      Log("frontend", "info", "api", `Successfully shortened ${results.length} URLs`);
    } catch (err: any) {
      setError(err.message);
      Log("frontend", "error", "api", "Failed to shorten URLs");
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    Log("frontend", "debug", "utils", "Copied shortened URL to clipboard");
  };

  const clearAll = () => {
    setUrls([
      { url: '', validity: 30, shortcode: '' },
      { url: '', validity: 30, shortcode: '' },
      { url: '', validity: 30, shortcode: '' },
      { url: '', validity: 30, shortcode: '' },
      { url: '', validity: 30, shortcode: '' }
    ]);
    setResults([]);
    setError('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary">
        URL Shortener
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Enter up to 5 URLs to shorten them concurrently. Each URL can have its own validity period and custom shortcode.
      </Typography>

      {urls.map((urlData, index) => (
        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            URL #{index + 1}
          </Typography>
          
          <TextField
            fullWidth
            label="Original Long URL"
            value={urlData.url}
            onChange={(e) => updateUrl(index, 'url', e.target.value)}
            placeholder="https://example.com/very-long-url"
            sx={{ mb: 2 }}
            required={index === 0}
          />
          
          <Box display="flex" gap={2}>
            <TextField
              label="Validity (minutes)"
              type="number"
              value={urlData.validity}
              onChange={(e) => updateUrl(index, 'validity', Number(e.target.value))}
              sx={{ width: 180 }}
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Preferred Shortcode"
              value={urlData.shortcode}
              onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
              placeholder="custom123"
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      ))}

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={shortenUrls}
          disabled={loading || urls.every(u => !u.url.trim())}
          sx={{ flex: 1 }}
        >
          {loading ? 'Processing...' : 'Shorten URLs'}
        </Button>
        <Button variant="outlined" onClick={clearAll}>
          Clear All
        </Button>
      </Box>

      {/* Display Results */}
      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Shortened URLs
          </Typography>
          {results.map((result, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Original: {result.original}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  value={result.shortLink}
                  InputProps={{ readOnly: true }}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button size="small" onClick={() => copyUrl(result.shortLink)}>
                  Copy
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Expires: {new Date(result.expiry).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
}
