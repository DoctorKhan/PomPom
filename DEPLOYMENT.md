# 🚀 DigitalOcean Deployment Guide

This guide will help you deploy PomPom to DigitalOcean App Platform with shared AI features for your friends.

## 📋 Prerequisites

1. **DigitalOcean Account** - [Sign up here](https://www.digitalocean.com/)
2. **GitHub Repository** - Your PomPom code (can be public!)
3. **Firebase Project** - For real-time sync features
4. **Groq API Key** - For shared AI features

## 🔧 Step 1: Get Your API Keys

### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication** → **Anonymous** sign-in
4. Enable **Firestore Database**
5. Go to **Project Settings** → **General** → **Your apps**
6. Copy your web app configuration values

### Groq API Key
1. Go to [Groq Console](https://console.groq.com/)
2. Create account and get your API key
3. This will be shared among all your friends using the app

## 🚀 Step 2: Deploy to DigitalOcean

### Create New App
1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Choose **GitHub** as source
4. Select your PomPom repository
5. Choose branch (usually `main` or `dev`)

### Configure Build Settings
- **Build Command**: `npm install && ./build.sh`
- **Run Command**: `npm start`
- **Environment**: Node.js
- **HTTP Port**: 8080

### Set Environment Variables
Add these in the **Environment Variables** section:

```bash
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyBgQEdzhCj1kJOlUZiC_FT2vRzwQFUEoHk
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# PomPom Configuration
POMPOM_APP_ID=pompom-app

# Groq AI (Your shared key for friends)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Deploy
1. Click **"Create Resources"**
2. Wait for deployment (usually 2-5 minutes)
3. Your app will be available at: `https://your-app-name.ondigitalocean.app`

## 🔄 Step 3: Replace Existing AIHD App (Optional)

If you want to replace your existing `../aihd` deployment:

### Option A: Update Existing App
1. Go to your existing DigitalOcean app
2. **Settings** → **App Spec**
3. Change the **GitHub repository** to your PomPom repo
4. Update environment variables as above
5. **Save** and redeploy

### Option B: Custom Domain
1. Keep both apps running
2. Point your custom domain to the new PomPom app
3. **Settings** → **Domains** → Add your domain

## 🎯 Step 4: Test Your Deployment

### Verify Everything Works
1. **Visit your app URL**
2. **Create a team session**
3. **Test AI features** (Todos breakdown, suggestions)
4. **Test Firebase sync** (multiple browser tabs)
5. **Share with friends** - they should be able to use AI without setup!

### Health Check
Your app includes a health endpoint: `https://your-app.ondigitalocean.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-01-14T...",
  "groqConfigured": true
}
```

## 🔐 Security Features

✅ **Groq API Key** - Secure server-side, never exposed to browsers  
✅ **Rate Limiting** - 50 AI requests per hour per IP address  
✅ **Firebase Rules** - Only authenticated users can access data  
✅ **CORS Protection** - Prevents unauthorized API usage  

## 🎉 Benefits for Your Friends

- **No setup required** - Just visit the URL and start using
- **AI features work immediately** - Powered by your shared Groq key
- **Real-time collaboration** - Firebase sync across all users
- **Mobile friendly** - Works great on phones and tablets
- **Offline fallback** - Timer works even without internet

## 🛠️ Troubleshooting

### Build Fails
- Check that `build.sh` has execute permissions
- Verify all environment variables are set
- Check build logs in DigitalOcean dashboard

### AI Features Don't Work
- Verify `GROQ_API_KEY` environment variable is set
- Check `/api/health` endpoint shows `groqConfigured: true`
- Monitor rate limits (50 requests/hour per IP)

### Firebase Sync Issues
- Verify all Firebase environment variables are correct
- Check Firestore security rules allow authenticated access
- Enable Anonymous authentication in Firebase Console

## 💰 Cost Estimation

**DigitalOcean App Platform:**
- Basic plan: $5/month (sufficient for small teams)
- Pro plan: $12/month (better performance)

**Groq API:**
- Free tier: 14,400 requests/day
- Paid: $0.27 per 1M tokens (very affordable)

**Firebase:**
- Free tier: 50K reads/writes per day
- Paid: Pay-as-you-go (typically <$1/month for small teams)

## 🎯 Next Steps

1. **Deploy and test** your app
2. **Share the URL** with your friends
3. **Monitor usage** through DigitalOcean and Groq dashboards
4. **Customize** the app further if needed

Your friends will love having a shared productivity app with AI features! 🎉
