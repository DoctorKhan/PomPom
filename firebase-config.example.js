// Firebase Configuration Template for PomPom App
// Copy this file to firebase-config.js and fill in your actual values

// Firebase configuration - get these values from your Firebase project console
window.__firebase_config = JSON.stringify({
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
});

// App ID for PomPom - this creates a namespace in your Firebase project
window.__app_id = "pompom-app";

console.log("🐕 PomPom Firebase configuration loaded!");
console.log("🔥 Using Firebase project:", JSON.parse(window.__firebase_config).projectId);
console.log("📦 App namespace: pompom-app");

// Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or use existing one
// 3. Go to Project Settings > General > Your apps
// 4. Add a web app or use existing one
// 5. Copy the config values above
// 6. Enable Authentication > Anonymous sign-in
// 7. Enable Firestore Database
// 8. Set up Firestore security rules (see README.md)
