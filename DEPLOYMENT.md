# Deployment Guide

This document explains how to deploy your Habit Tracker PWA to various platforms.

## Quick Deployment Options

### 1. Netlify (Recommended - Easiest)

1. Fork this repository to your GitHub account
2. Go to [Netlify](https://netlify.com) and sign up
3. Click "New site from Git" and connect your GitHub repository
4. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy! Your app will be available at a `*.netlify.app` URL

### 2. Vercel

1. Fork this repository to your GitHub account
2. Go to [Vercel](https://vercel.com) and sign up
3. Import your repository
4. Vercel will auto-detect settings from `vercel.json`
5. Deploy! Your app will be available at a `*.vercel.app` URL

### 3. GitHub Pages

1. Fork this repository
2. Go to repository Settings → Pages
3. Enable GitHub Actions deployment
4. Push to main branch - the workflow will automatically deploy
5. Your app will be available at `https://yourusername.github.io/habit-streak-rewards/`

### 4. Manual Deployment

For any other hosting provider:

```bash
npm install
npm run build
```

Upload the `dist` folder contents to your web server.

## Mobile App Distribution

### Option A: Progressive Web App (PWA) Installation

Your app is a PWA, so users can install it directly from their browser:

**iPhone/iPad:**
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Long-press the app icon for quick actions (shortcuts)

**Android:**
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Select "Add to Home Screen" or "Install App"
4. Long-press the app icon for quick actions (shortcuts)

**Desktop:**
1. Open the app in Chrome/Edge
2. Look for the install icon in the address bar
3. Click it to install the app
4. Right-click the app icon for quick actions

## Mobile Features

### App Shortcuts (Home Screen Quick Actions)
After installing the PWA, long-press the app icon to access:
- **Quick Check**: Instantly mark habits as complete
- **Rewards Wheel**: Go directly to spin the reward wheel
- **Statistics**: View your progress and stats
- **Add Habit**: Create a new habit quickly

### Smart Notifications
Enable notifications in settings to receive:
- **Milestone Achievements**: Celebrate when you reach streak milestones
- **Streak Warnings**: Get alerts before you lose a streak
- **Quick Actions**: Tap notification buttons to mark habits done or spin the wheel

### Quick Check Mode
Access via:
- App shortcut: "Quick Check"
- Direct URL: `yourapp.com/?quick=true`
- Notification actions: "Mark Done" buttons

Features a streamlined interface for:
- One-tap habit completion
- Progress overview
- Minimal distractions

### Option B: App Store Distribution (Advanced)

For app store distribution, you can use PWA Builder:

1. Go to [PWABuilder.com](https://pwabuilder.com)
2. Enter your app's URL
3. Generate packages for:
   - Microsoft Store (easiest for PWAs)
   - Google Play Store (via Trusted Web Activity)
   - Apple App Store (requires additional native wrapper)

## Environment Variables

No environment variables are required for basic deployment. All data is stored locally in the browser.

## Custom Domain

To use a custom domain:

- **Netlify**: Add your domain in site settings
- **Vercel**: Add your domain in project settings  
- **GitHub Pages**: Add a `CNAME` file to the `public` folder with your domain

## Features Included

✅ **Offline Support**: Works without internet connection  
✅ **Data Export/Import**: Backup and restore functionality  
✅ **PWA Installation**: Can be installed as a native app  
✅ **Mobile Optimized**: Responsive design for all devices  
✅ **Dark Mode**: Automatic theme switching  
✅ **Local Storage**: All data stored locally for privacy  
✅ **Smart Notifications**: Milestone achievements and streak warnings  
✅ **Quick Check Mode**: Fast habit completion via URL shortcuts  
✅ **App Shortcuts**: Multiple quick actions from home screen  
✅ **Deep Linking**: Direct navigation to specific app sections  
✅ **Visual Calendar View**: Monthly calendar showing habit completion patterns  
✅ **Advanced Analytics**: Detailed insights, trends, and performance metrics  
✅ **Enhanced Statistics**: Three-view statistics with tabbed navigation  

## Troubleshooting

### App not installing on mobile
- Ensure HTTPS is enabled (required for PWA)
- Check that all PWA requirements are met
- Verify manifest.json is accessible

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires Node 16+)
- Verify all TypeScript files compile correctly

### Data not persisting
- Check browser storage permissions
- Ensure localStorage is enabled
- Try the export/import feature for manual backup