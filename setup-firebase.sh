#!/bin/bash

echo "🐕 Setting up Firebase for PomPom App..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "🔥 Firebase CLI found!"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase..."
    firebase login
fi

echo "✅ Firebase authentication successful!"

# List available projects
echo "📋 Available Firebase projects:"
firebase projects:list

echo ""
echo "🎯 PomPom is configured to use the existing 'aihd-b0b5b' project"
echo "   This allows sharing infrastructure while keeping data separate"
echo ""

# Set the project
echo "🔧 Setting Firebase project..."
firebase use aihd-b0b5b

# Deploy Firestore rules and indexes
echo "📜 Deploying Firestore rules and indexes..."
firebase deploy --only firestore:rules,firestore:indexes

echo ""
echo "✅ Firebase setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run './run' to start the PomPom app"
echo "   2. Test creating a session and joining with multiple users"
echo "   3. Verify real-time sync is working"
echo ""
echo "🔧 Optional: Deploy to Firebase Hosting"
echo "   Run: firebase deploy --only hosting"
echo "   Your app will be available at: https://aihd-b0b5b.web.app"
echo ""
echo "🐕 Happy PomPom-ing! 🎀"
