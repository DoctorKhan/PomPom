const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.', {
    // Serve index.html for all routes (SPA support)
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Rate limiting for AI requests
const userRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 50; // 50 requests per hour per IP

function checkRateLimit(ip) {
    const now = Date.now();
    const userReqs = userRequests.get(ip) || [];
    
    // Clean old requests
    const recentReqs = userReqs.filter(time => now - time < RATE_LIMIT_WINDOW);
    
    if (recentReqs.length >= RATE_LIMIT_MAX) {
        return false;
    }
    
    recentReqs.push(now);
    userRequests.set(ip, recentReqs);
    return true;
}

// Groq API proxy endpoint
app.post('/api/groq', async (req, res) => {
    try {
        // Rate limiting
        const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
        if (!checkRateLimit(clientIP)) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: 3600 
            });
        }

        // Validate request
        if (!req.body || !req.body.messages) {
            return res.status(400).json({ error: 'Invalid request format' });
        }

        // Check if Groq API key is configured
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            return res.status(503).json({ 
                error: 'AI service not configured. Please contact the administrator.' 
            });
        }

        // Prepare request to Groq
        const groqRequest = {
            model: req.body.model || 'llama-3.1-8b-instant',
            messages: req.body.messages,
            max_tokens: Math.min(req.body.max_tokens || 500, 1000), // Cap at 1000 tokens
            temperature: req.body.temperature || 0.7,
            stream: false
        };

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groqRequest),
            timeout: 30000 // 30 second timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'AI service temporarily unavailable' 
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Groq proxy error:', error);
        res.status(500).json({ 
            error: 'AI service error. Please try again.' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        groqConfigured: !!process.env.GROQ_API_KEY
    });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🐕 PomPom server running on port ${PORT}`);
    console.log(`🔥 Firebase config: ${process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not configured'}`);
    console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? 'configured' : 'not configured'}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
});
