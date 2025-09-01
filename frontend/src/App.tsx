import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Paper, Typography, TextField, Button, Box, Alert, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Log } from './utils/logging';

const theme = createTheme({
  palette: { primary: { main: '#d4761a' }, background: { default: '#fdf5e6', paper: '#fff8dc' } },
});

export default function App() {
  const [url, setUrl] = useState('');
  const [validity, setValidity] = useState(30);
  const [shortcode, setShortcode] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [statsCode, setStatsCode] = useState('');
  const [stats, setStats] = useState<any>(null);

  const shortenUrl = async () => {
    Log("frontend", "info", "api", "Shortening URL");
    try {
      const response = await fetch('http://localhost:3001/shorturls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, validity, shortcode: shortcode || undefined })
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data.shortLink);
        // Auto-extract shortcode for easy stats lookup
        const extractedCode = data.shortLink.split('/').pop();
        setStatsCode(extractedCode || '');
        setError('');
      } else {
        const err = await response.json();
        setError(err.error);
      }
    } catch {
      setError('Network error');
    }
  };

  const fetchStats = async () => {
    if (!statsCode) {
      setError('Enter a shortcode');
      return;
    }
    setError('');
    setStats(null);
    
    // Extract just the shortcode if it's a full URL
    let cleanShortcode = statsCode;
    if (statsCode.includes('http://')) {
      cleanShortcode = statsCode.split('/').pop() || statsCode;
    }

    try {
      const response = await fetch(`http://localhost:3001/shorturls/${cleanShortcode}`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        Log("frontend", "info", "api", "Stats retrieved successfully");
      } else {
        setError('Shortcode not found');
        Log("frontend", "error", "api", "Stats not found");
      }
    } catch {
      setError('Network error');
      Log("frontend", "error", "api", "Network error getting stats");
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(result);
    Log("frontend", "debug", "utils", "Copied URL");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom color="primary">URL Shortener</Typography>
          
          <Box sx={{ mb: 3 }}>
            <TextField fullWidth label="Long URL" value={url} onChange={(e) => setUrl(e.target.value)} sx={{ mb: 2 }} />
            <Box display="flex" gap={2} mb={2}>
              <TextField label="Validity (min)" type="number" value={validity} onChange={(e) => setValidity(Number(e.target.value))} />
              <TextField label="Custom code" value={shortcode} onChange={(e) => setShortcode(e.target.value)} />
            </Box>
            <Button variant="contained" onClick={shortenUrl} disabled={!url} fullWidth>Shorten</Button>
          </Box>

          {result && (
            <Box sx={{ mb: 3 }}>
              <TextField fullWidth value={result} InputProps={{ readOnly: true }} />
              <Button onClick={copyUrl} sx={{ mt: 1 }}>Copy</Button>
            </Box>
          )}

          <Typography variant="h5" sx={{ mb: 2 }}>Statistics</Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Enter a shortcode to view click statistics. When you create a URL above, the shortcode will auto-fill here.
          </Typography>
          <Box display="flex" gap={2} mb={2}>
            <TextField 
              label="Shortcode" 
              value={statsCode} 
              onChange={(e) => setStatsCode(e.target.value)}
              placeholder="e.g. abc123"
              sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={fetchStats} disabled={!statsCode.trim()}>
              Get Stats
            </Button>
          </Box>

          {stats && (
            <Box>
              <Typography><strong>Original URL:</strong> {stats.originalUrl}</Typography>
              <Typography><strong>Total Clicks:</strong> {stats.totalClicks}</Typography>
              <Typography><strong>Created:</strong> {new Date(stats.creationDate).toLocaleString()}</Typography>
              <Typography><strong>Expires:</strong> {new Date(stats.expiryDate).toLocaleString()}</Typography>
              
              {stats.clickDetails.length > 0 ? (
                <Table size="small" sx={{ mt: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Referrer</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.clickDetails.map((click: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{click.referrer || 'Direct'}</TableCell>
                        <TableCell>{click.location || 'Unknown'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography sx={{ mt: 2, fontStyle: 'italic' }}>No clicks yet</Typography>
              )}
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}