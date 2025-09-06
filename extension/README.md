# PomPom Meeting Helper Chrome Extension

Automatically captures Google Meet URLs for seamless team collaboration in PomPom sessions.

## 🚀 Features

- **Automatic URL Capture**: Detects when Google Meet creates a new meeting room and captures the real URL
- **Seamless Integration**: Works automatically with PomPom web app
- **Real-time Monitoring**: Monitors Google Meet tabs for URL changes
- **Team Sharing**: Automatically shares captured URLs with your PomPom team
- **Background Operation**: Works silently in the background

## 📦 Installation

### Method 1: Developer Mode (Recommended for now)

1. **Download the extension**:
   - Clone or download the PomPom repository
   - Navigate to the `extension/` folder

2. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the `extension/` folder
   - The extension should now appear in your extensions list

4. **Verify installation**:
   - Visit your PomPom session at `http://localhost:8000`
   - You should see a green "✓ PomPom Extension Active" message

### Method 2: Chrome Web Store (Coming Soon)

The extension will be published to the Chrome Web Store for easier installation.

## 🎯 How It Works

1. **Start a PomPom session** and navigate to the Team tab
2. **Click "📹 Start Meeting"** - this opens Google Meet in a new tab
3. **Extension automatically detects** when Google Meet generates the real meeting URL
4. **URL is captured and shared** in your PomPom chat automatically
5. **Team members can click** the link to join instantly

## 🔧 Permissions

The extension requires these permissions:

- **tabs**: To monitor Google Meet tabs for URL changes
- **activeTab**: To interact with the current tab
- **storage**: To store meeting history and settings
- **host_permissions**: 
  - `https://meet.google.com/*` - To monitor Google Meet pages
  - `http://localhost:8000/*` - To communicate with local PomPom
  - `https://*.pompom.app/*` - To communicate with hosted PomPom

## 🛠️ Development

### File Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── pompom-content.js      # Content script for PomPom pages
├── meet-content.js        # Content script for Google Meet pages
├── injected.js           # Injected script for page context
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── icons/                # Extension icons
└── README.md             # This file
```

### Key Components

- **Background Script**: Monitors tabs and coordinates URL capture
- **Content Scripts**: Handle communication between extension and web pages
- **Injected Script**: Provides API functions to PomPom app
- **Popup**: Shows extension status and recent meetings

## 🐛 Troubleshooting

### Extension not working?

1. **Check installation**: Go to `chrome://extensions/` and verify the extension is enabled
2. **Refresh PomPom**: Reload your PomPom session page
3. **Check permissions**: Ensure the extension has access to the required sites
4. **View console**: Open Developer Tools and check for error messages

### Meeting URLs not captured?

1. **Popup blockers**: Ensure popups are allowed for PomPom
2. **Google account**: Make sure you're signed into Google
3. **Network issues**: Check your internet connection
4. **Extension popup**: Click the extension icon to see status and recent meetings

### Manual fallback

If automatic capture fails, PomPom will show a manual input field where you can paste the meeting URL from your browser.

## 🔒 Privacy

- The extension only monitors Google Meet URLs for capture
- No personal data is collected or transmitted
- Meeting URLs are only shared within your PomPom session
- All data stays local to your browser and PomPom session

## 📝 Version History

### v1.0.0
- Initial release
- Automatic Google Meet URL capture
- PomPom integration
- Background monitoring
- Extension popup with status

## 🤝 Contributing

This extension is part of the PomPom project. To contribute:

1. Fork the PomPom repository
2. Make changes in the `extension/` folder
3. Test thoroughly with PomPom sessions
4. Submit a pull request

## 📄 License

Same license as the main PomPom project.
