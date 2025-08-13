// Firebase Configuration for PomPom App
// This uses the same Firebase project as the AIHD app for shared infrastructure

// Firebase configuration - using the existing AIHD Firebase project
window.__firebase_config = JSON.stringify({
  apiKey: "AIzaSyBgQEdzhCj1kJOlUZiC_FT2vRzwQFUEoHk",
  authDomain: "aihd-b0b5b.firebaseapp.com", 
  projectId: "aihd-b0b5b",
  storageBucket: "aihd-b0b5b.appspot.com",
  messagingSenderId: "589093465635",
  appId: "1:589093465635:web:0014f36fec8f9891254b96"
});

// App ID for PomPom - this will create a separate namespace in the same Firebase project
window.__app_id = "pompom-app";

console.log("🐕 PomPom Firebase configuration loaded!");
console.log("🔥 Using Firebase project: aihd-b0b5b");
console.log("📦 App namespace: pompom-app");
