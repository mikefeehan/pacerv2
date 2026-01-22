# PACER Backend Deployment Guide

## Overview
The PACER app uses Strava OAuth for activity uploads. Since Strava doesn't accept Expo's proxy redirects reliably, we need a backend OAuth callback handler. This guide walks you through deploying it to Vercel.

## Why This Is Needed
- Strava requires exact redirect URI matching between what's registered and what the app sends
- Expo's `auth.expo.io` proxy is no longer reliably supported by Strava
- A dedicated backend ensures consistent OAuth flow in development and production

## Step 1: Fork or Create Your Backend Repository

You have two options:

### Option A: Deploy from This Monorepo (Recommended for Launch)
If you want everything in one place:

1. Push this repo to GitHub
2. Go to https://vercel.com
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Vercel will auto-detect the `api/` folder

### Option B: Deploy Just the Backend
For a dedicated backend server:

1. Create a new repository with just the `api/` folder
2. Add `package.json`:
```json
{
  "private": true,
  "scripts": {
    "dev": "vercel dev",
    "build": "tsc"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Step 2: Deploy to Vercel

1. **Sign up for Vercel**: https://vercel.com (free tier is sufficient)
2. **Connect GitHub**: Click "Continue with GitHub" to authenticate
3. **Import Project**: Select your repository
4. **Configure Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add `STRAVA_CLIENT_ID` (from https://www.strava.com/settings/api)
   - Add `STRAVA_CLIENT_SECRET` (from https://www.strava.com/settings/api)
5. **Deploy**: Click "Deploy" - Vercel will automatically build and deploy

## Step 3: Update Strava App Settings

1. Go to https://www.strava.com/settings/api
2. Update "Authorization Callback Domain" to your Vercel domain:
   - If deployed from monorepo: `your-project.vercel.app`
   - The full redirect URI will be: `https://your-project.vercel.app/api/strava-callback`

## Step 4: Update Your Mobile App

In the Vibecode ENV tab, add:
```
EXPO_PUBLIC_STRAVA_OAUTH_BACKEND=https://your-project.vercel.app
```

Replace `your-project` with your actual Vercel project name.

## Step 5: Test the OAuth Flow

1. Restart your app (or reload in Vibecode)
2. Go to Strava Connect screen
3. Click "Connect Strava"
4. You should be able to log in and authorize the app
5. Check the LOGS tab to verify the tokens are received

## Troubleshooting

### "redirect_uri invalid" Error
- Make sure Strava's Authorization Callback Domain matches your Vercel domain
- No trailing slashes or paths - just the domain

### App Not Receiving Tokens
- Check Vercel function logs (vercel.com → Project → Functions)
- Verify `STRAVA_CLIENT_ID` and `STRAVA_CLIENT_SECRET` are set correctly
- Check app logs (LOGS tab in Vibecode) for error messages

### For App Store Launch
- Get a custom domain (optional but recommended for branding)
- Update Strava settings to use your custom domain
- Update `EXPO_PUBLIC_STRAVA_OAUTH_BACKEND` in Vibecode to point to your domain

## Production Checklist
- [ ] Backend deployed to Vercel with prod environment variables
- [ ] Strava app settings updated with correct callback domain
- [ ] Mobile app ENV variable points to production backend
- [ ] OAuth flow tested end-to-end
- [ ] Error handling verified (what happens if user cancels?)
- [ ] Tokens properly stored and refreshed on the mobile app
- [ ] Ready for App Store submission
