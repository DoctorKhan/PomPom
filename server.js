const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    const groqConfigured = !!process.env.GROQ_API_KEY;
    res.json({
        status: 'ok',
        groqConfigured,
        timestamp: new Date().toISOString()
    });
});

// Groq API proxy endpoint
app.post('/api/groq', async (req, res) => {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        
        if (!groqApiKey) {
            return res.status(503).json({
                error: 'AI service not configured. Please contact the administrator.'
            });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 429) {
                return res.status(429).json({
                    error: 'Rate limit exceeded. Please try again later.'
                });
            }
            return res.status(response.status).json({
                error: errorData.error?.message || `Groq API error ${response.status}`
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Groq API proxy error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🐕 PomPom Server running on http://localhost:${PORT}`);
    console.log(`🚀 Groq API configured: ${!!process.env.GROQ_API_KEY}`);
});
