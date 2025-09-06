# PomPom ☁️🐕☁️

A productivity timer for remote teams with fluffy cloud spirit!

## What's New

### 🎉 Complete Rebrand from SyncFocus to PomPom
- **New Name**: PomPom (inspired by Cloud Pomeranian dogs and pom poms)
- **Mascot**: Fluffy Cloud Pomeranian ☁️🐕☁️
- **Theme**: Kawaii cloud decorations throughout the app ☁️✨💖
- **Color Scheme**: Soft cloud blues with white accents - peaceful yet energetic
- **Spirit**: Cheerful, fluffy, cloud-like productivity with pom-pom energy

### 🆕 Restored Name Input Screen
- **Team Name Setup**: When you join a session, you first see a name input screen
- **Random Team Names**: Pre-populated with cloud-themed names like "Fluffy Clouds" or "Dreamy Pomeranians"
- **Random User Names**: Pre-populated with fluffy names like "Fluffy Cloud" or "Soft Puff"
- **Editable**: Click on any name field to customize it
- **Smooth Flow**: Click "Start Session! 🎉" to proceed to the timer

### 🎨 Visual Improvements
- **Studio Ghibli Inspired**: Magical atmosphere with soft glowing effects
- **Kawaii Aesthetic**: CSS gradient orbs, floating elements, and gentle animations
- **Cloud Color Scheme**: Soft gradient from light sky blue to deeper sky blue
- **Interactive Decorations**: Floating Totoro-style elements, soot sprites, and magical sparkles
- **Fluffy Cloud Mascot**: Cloud Pomeranian with kawaii image placeholders and emoji fallbacks
- **Enhanced Glassmorphism**: Studio Ghibli-inspired cards with enhanced blur and glow effects
- **Kawaii Buttons**: Soft gradients with hover animations and magical glow
- **Consistent Theming**: Fluffy cloud kawaii spirit meets Studio Ghibli magic

## How to Use

### Running the App
```bash
# Start the main app
./run

# Run UI tests
./run test

# Run Firebase tests
./run firebase
```

### Firebase Setup
The app is configured to use the existing Firebase project from the `aihd` app for shared infrastructure:

```bash
# Set up Firebase (one-time setup)
./setup-firebase.sh

# Or manually:
npm install -g firebase-tools
firebase login
firebase use aihd-b0b5b
firebase deploy --only firestore:rules,firestore:indexes
```

**Firebase Configuration:**
- **Setup**: Copy `firebase-config.example.js` to `firebase-config.js` and add your credentials
- **App Namespace**: `pompom-app` (separate data namespace)
- **Database Path**: `/artifacts/pompom-app/public/data/pompom_sessions/`
- **Authentication**: Anonymous authentication enabled
- **Security**: Firestore rules configured for PomPom sessions
- **⚠️ Security**: See `README-SECURITY.md` for important security setup

### Chrome Extension (Optional)
PomPom includes a Chrome extension that automatically captures Google Meet URLs for seamless sharing with your team.

#### Quick Install
1. **Download**: Get `pompom-extension-v1.0.0.zip` from the repository root
2. **Extract**: Unzip the file to a folder on your computer  
3. **Install**: Open `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the extracted folder
4. **Verify**: Look for the blue "P" icon in your Chrome toolbar

#### Features
- 🔗 **Auto-capture**: Automatically detects Google Meet URLs when you start meetings
- 📤 **Instant sharing**: Shares meeting links with your PomPom team automatically  
- 🔒 **Privacy-focused**: Only monitors Google Meet domains
- ⚡ **Background operation**: Works seamlessly without interfering with your workflow

### Features
1. **Landing Page**: Create or join a session with the new PomPom branding
2. **Name Setup**: Set your team name and personal name with fun defaults
3. **Timer Sessions**: Focus time with Pomeranian spirit
4. **Team Collaboration**: Chat, planning, and participant management
5. **Customizable**: Multiple timer modes and sound settings

## 🔐 Security & Configuration

**⚠️ IMPORTANT**: Before committing this repository publicly, see `README-SECURITY.md` for security setup.

This app can run in two modes:

- Online (with Firebase): Real-time sync for sessions, chat, planner, and participants.
- Offline (no Firebase): Works locally in your browser with basic timer, local chat list, and planner list. No data sync across devices.

### Provide Firebase Config (Online mode)

Inject your Firebase Web config and optional app ID/token via a small script tag before the module script in `index.html` at runtime (e.g., using your hosting template) or by editing the file locally for development:

```html
<script>
	// Paste your Firebase web config here
	window.__firebase_config = JSON.stringify({
		apiKey: "YOUR_API_KEY",
		authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
		projectId: "YOUR_PROJECT_ID",
		storageBucket: "YOUR_PROJECT_ID.appspot.com",
		messagingSenderId: "...",
		appId: "..."
	});
	window.__app_id = 'pompom-default'; // optional, used to namespace Firestore paths
	// window.__initial_auth_token = '...'; // optional custom auth token
</script>
```

If no valid `apiKey` is provided, PomPom automatically falls back to offline mode and disables Firebase features gracefully.

### Routing Notes

For static hosting, PomPom supports hash-based routes. Session URLs look like `/#/my-team`. Clicking “Create session” updates both the path and the hash; on file:// or simple static hosts, the hash route ensures the app still works.

## Technical Changes

### Updated Branding
- App title: `PomPom - A productivity timer for remote teams`
- URL structure: `pompom.io/team-name`
- Storage keys: `pompom_username`, `pompom_sound_enabled`
- Database paths: `pompom_sessions` instead of `syncfocus_sessions`
- App ID: `pompom-default`

### New Components
- `name-input-page`: New screen for team and user name setup
- `populateRandomNames()`: Generates fun, themed random names
- `generateRandomTeamName()`: Creates team names with Pomeranian theme
- `generateRandomUserName()`: Creates user names with pom pom spirit

### Enhanced Animations
- `pom-pom-bounce`: Custom CSS animation for pom pom decorations
- Staggered animation delays for visual appeal
- Consistent theming across all screens

## File Structure
```
├── index.html          # Main PomPom app
├── test.html          # Test suite
├── run               # Run script for local development
└── README.md         # This file
```

## Browser Compatibility
- Modern browsers with ES6+ support
- Requires JavaScript enabled
- Best experience with Chrome, Firefox, Safari, Edge

---

**Made with 🐕 and 🎀 by the PomPom team!**
