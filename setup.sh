#!/bin/bash

# PomPom Setup Script
# This script helps you set up the configuration files safely

echo "🐕 PomPom Setup Script"
echo "======================"
echo ""

# Check if firebase-config.js already exists
if [ -f "firebase-config.js" ]; then
    echo "⚠️  firebase-config.js already exists!"
    echo "   If you want to reconfigure, delete it first:"
    echo "   rm firebase-config.js"
    echo ""
else
    echo "📋 Setting up Firebase configuration..."
    
    # Copy the example file
    if [ -f "firebase-config.example.js" ]; then
        cp firebase-config.example.js firebase-config.js
        echo "✅ Created firebase-config.js from template"
        echo ""
        echo "📝 Next steps:"
        echo "   1. Go to https://console.firebase.google.com/"
        echo "   2. Create a new project or use existing one"
        echo "   3. Enable Authentication > Anonymous sign-in"
        echo "   4. Enable Firestore Database"
        echo "   5. Get your web app config from Project Settings"
        echo "   6. Edit firebase-config.js with your actual values"
        echo ""
    else
        echo "❌ firebase-config.example.js not found!"
        exit 1
    fi
fi

# Check .gitignore
if grep -q "firebase-config.js" .gitignore; then
    echo "✅ firebase-config.js is properly excluded from git"
else
    echo "⚠️  Adding firebase-config.js to .gitignore for security"
    echo "firebase-config.js" >> .gitignore
fi

echo ""
echo "🔐 Security Notes:"
echo "   • firebase-config.js contains sensitive data and won't be committed to git"
echo "   • Users will add their own Groq API keys via the Settings modal"
echo "   • See README-SECURITY.md for complete security setup"
echo ""

echo "🚀 Ready to run:"
echo "   ./run"
echo ""
echo "🌐 Then visit: http://localhost:8000"
