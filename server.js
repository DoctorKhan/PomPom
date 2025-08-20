require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Avoid favicon 404 noise in console during local development
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check
app.get('/api/health', (req, res) => {
  const groqConfigured = !!process.env.GROQ_API_KEY;
  res.json({ status: 'ok', groqConfigured, timestamp: new Date().toISOString() });
});

// Groq proxy
app.post('/api/groq', async (req, res) => {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) return res.status(503).json({ error: 'AI service not configured. Please contact the administrator.' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
      }
      if (response.status === 400) {
        console.error('Groq API 400 Bad Request:', errorData);
        return res.status(400).json({ error: errorData.error?.message || 'Bad request to Groq API. Please check your prompt or input format.' });
      }
      console.error(`Groq API error ${response.status}:`, errorData);
      return res.status(response.status).json({ error: errorData.error?.message || `Groq API error ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Groq API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test logging endpoint
app.post('/api/test-log', (req, res) => {
  try {
    const { level, message, timestamp, testName, data } = req.body;
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      level: level || 'info',
      testName: testName || 'unknown',
      message,
      data
    };

    const logLine = `[${logEntry.timestamp}] ${logEntry.level.toUpperCase()} [${logEntry.testName}] ${logEntry.message}${logEntry.data ? ' | ' + JSON.stringify(logEntry.data) : ''}\n`;

    // Append to test log file
    fs.appendFileSync('test-results.log', logLine);

    // Also log to console for immediate feedback
    console.log(`TEST LOG: ${logLine.trim()}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Test logging error:', error);
    res.status(500).json({ error: 'Failed to log test result' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🐕 PomPom Server running on http://localhost:${PORT}`);
  console.log(`🚀 Groq API configured: ${!!process.env.GROQ_API_KEY}`);
});

