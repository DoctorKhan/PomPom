#!/bin/bash

echo "🔧 Building PomPom for production..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate firebase-config.js from environment variables
echo "🔥 Generating Firebase configuration..."
cat > firebase-config.js << EOF
// Auto-generated Firebase configuration for production
window.__firebase_config = JSON.stringify({
  apiKey: "${FIREBASE_API_KEY}",
  authDomain: "${FIREBASE_AUTH_DOMAIN}",
  projectId: "${FIREBASE_PROJECT_ID}",
  storageBucket: "${FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${FIREBASE_APP_ID}"
});

window.__app_id = "${POMPOM_APP_ID:-pompom-app}";
console.log("🐕 PomPom production config loaded!");
console.log("🤖 AI features: Server-side Groq integration enabled");
EOF

echo "✅ Production configuration generated"
echo "🚀 Build complete - ready for deployment!"
