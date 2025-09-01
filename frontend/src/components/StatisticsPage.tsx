import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Alert, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Log } from '../utils/logging';

interface StatsData {
  totalClicks: number;
  originalUrl: string;
  creationDate: string;
  expiryDate: string;
  clickDetails: Array<{
    timestamp: string;
    referrer: string;
    location: string;
  }>;
}

export default function StatisticsPage() {
  const [statsCode, setStatsCode] = useState('');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!statsCode.trim()) {
      setError('Please enter a shortcode');
      return;
    }

    setLoading(true);
    setError('');
    setStats(null);
    
    // Extract just the shortcode if it's a full URL
    let cleanShortcode = statsCode.trim();
    if (cleanShortcode.includes('http://')) {
      cleanShortcode = cleanShortcode.split('/').pop() || cleanShortcode;
    }

    try {
      const response = await fetch(`http://localhost:3001/shorturls/${cleanShortcode}`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        Log("frontend", "info", "api", "Statistics retrieved successfully");
      } else {
        setError('Shortcode not found');
        Log("frontend", "error", "api", "Statistics not found");
      }
    } catch {
      setError('Network error');
      Log("frontend", "error", "api", "Network error getting statistics");
    } finally {
      setLoading(false);
    }
  };

  const clearStats = () => {
    setStatsCode('');
    setStats(null);
    setError('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary">
        Statistics
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Enter a shortcode to view detailed click analytics and usage statistics.
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Shortcode"
          value={statsCode}
          onChange={(e) => setStatsCode(e.target.value)}
          placeholder="e.g. abc123 or full URL"
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={fetchStats}
          disabled={loading || !statsCode.trim()}
        >
          {loading ? 'Loading...' : 'Get Statistics'}
        </Button>
        <Button variant="outlined" onClick={clearStats}>
          Clear
        </Button>
      </Box>

      {stats && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            URL Statistics
          </Typography>
          
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography sx={{ mb: 1 }}>
              <strong>Original URL:</strong> {stats.originalUrl}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Total Clicks:</strong> {stats.totalClicks}
            </Typography>
            <Typography sx={{ mb: 1 }}>
              <strong>Created:</strong> {new Date(stats.creationDate).toLocaleString()}
            </Typography>
            <Typography>
              <strong>Expires:</strong> {new Date(stats.expiryDate).toLocaleString()}
            </Typography>
          </Box>

          {stats.clickDetails && stats.clickDetails.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Detailed Click Data
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Timestamp</strong></TableCell>
                    <TableCell><strong>Source/Referrer</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.clickDetails.map((click, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{click.referrer || 'Direct'}</TableCell>
                      <TableCell>{click.location || 'Unknown'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#f9f9f9', borderRadius: 1 }}>
              <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                No clicks recorded yet for this shortened URL
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
}
