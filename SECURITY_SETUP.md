# Security Setup Guide

## API Keys Protection

This project has been configured to protect sensitive API keys from being exposed in the public repository.

### What Was Done

1. **Environment Variables**: All API keys are now stored in a `.env` file that is NOT committed to version control.

2. **Configuration Files**:
   - Converted `app.json` to `app.config.js` to support environment variables
   - Updated `src/config/firebase.ts` to use environment variables
   - Updated `src/screens/other/WorkshopFinderScreen.tsx` to use environment variables

3. **Git Protection**:
   - Added `.env` to `.gitignore` to prevent accidental commits
   - Created `.env.example` as a template for other developers

### For New Developers

If you're cloning this repository:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your own API keys in the `.env` file:
   - **Google Maps API Key**: Get from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - **Firebase Configuration**: Get from [Firebase Console](https://console.firebase.google.com/)

3. Never commit the `.env` file to version control!

### Environment Variables Used

- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key for location services
- `EXPO_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### Before Pushing to GitHub

**IMPORTANT**: Make sure to verify that `.env` is not being tracked:

```bash
git status
```

If you see `.env` in the list, run:
```bash
git rm --cached .env
```

Then commit the removal:
```bash
git add .gitignore
git commit -m "Remove .env from tracking"
```

### Additional Security Recommendations

1. **Restrict API Keys**: In Google Cloud Console and Firebase Console, restrict your API keys to:
   - Specific domains (for web)
   - Specific app bundle IDs (for iOS/Android)
   - Specific APIs only

2. **Monitor Usage**: Regularly check your API usage in the respective consoles to detect any unauthorized use.

3. **Rotate Keys**: If you ever accidentally commit API keys to a public repository, immediately:
   - Revoke/delete the exposed keys
   - Generate new keys
   - Update your local `.env` file

4. **Git History**: If keys were previously committed, they exist in git history. Consider:
   - Using tools like `git-filter-branch` or `BFG Repo-Cleaner` to remove them from history
   - Or create a fresh repository with the cleaned codebase

