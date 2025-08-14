# Security Configuration for PomPom

## 🔐 Sensitive Information

This repository contains references to sensitive information that should **NOT** be committed to public repositories:

### Firebase Configuration
- **File**: `firebase-config.js` (excluded from git)
- **Contains**: Firebase API keys, project IDs, and other credentials
- **Template**: Use `firebase-config.example.js` as a template

### Groq API Keys
- **Storage**: Stored in browser localStorage only
- **User Input**: Users enter their own Groq API keys via Settings modal
- **Not Committed**: No API keys are stored in the codebase

## 🛡️ Security Setup

### 1. Firebase Configuration
```bash
# Copy the example file
cp firebase-config.example.js firebase-config.js

# Edit with your actual Firebase credentials
# Get these from: https://console.firebase.google.com/
```

### 2. Firebase Security Rules
Set up Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PomPom app data
    match /artifacts/pompom-app/public/data/pompom_sessions/{sessionId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Environment Variables (Optional)
For production deployments, consider using environment variables:

```bash
# .env (also excluded from git)
FIREBASE_API_KEY=your_api_key_here
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

## 🚀 Deployment

### Static Hosting (GitHub Pages, Netlify, Vercel)
1. Set up your `firebase-config.js` with your credentials
2. Deploy the repository
3. Users will need to add their own Groq API keys via the Settings modal

### Server Deployment
Consider using environment variables and server-side configuration for production deployments.

## ⚠️ Important Notes

- **Never commit** `firebase-config.js` to public repositories
- **Firebase API keys** for web apps are not secret (they're client-side), but should still be protected
- **Groq API keys** are user-provided and stored locally only
- **Use Firebase Security Rules** to protect your Firestore data
- **Enable only necessary Firebase services** (Auth, Firestore)

## 🔍 What's Safe to Commit

✅ **Safe**:
- `firebase-config.example.js` (template with placeholder values)
- All HTML, CSS, and JavaScript code
- Documentation and README files
- Configuration templates

❌ **Never Commit**:
- `firebase-config.js` (actual credentials)
- Any files containing real API keys
- User data or session information
- Private keys or certificates
