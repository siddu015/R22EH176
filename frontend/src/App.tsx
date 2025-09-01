import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Paper, Tabs, Tab, Box } from '@mui/material';
import UrlShortenerPage from './components/UrlShortenerPage';
import StatisticsPage from './components/StatisticsPage';

const theme = createTheme({
  palette: { primary: { main: '#d4761a' }, background: { default: '#fdf5e6', paper: '#fff8dc' } },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
    </div>
  );
}

export default function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                color: 'primary.main',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }
            }}
          >
            <Tab label="URL Shortener" />
            <Tab label="Statistics" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <UrlShortenerPage />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <StatisticsPage />
          </TabPanel>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}