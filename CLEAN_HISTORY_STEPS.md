# Git History Cleaning Guide

## Current Situation
- Repository: https://github.com/Jalalians99/Car_Maintenance_Mobile_App.git
- Exposed files with API keys:
  - app.json (commits: ad7ee64, ae3ca72)
  - src/config/firebase.ts
  - src/screens/other/WorkshopFinderScreen.tsx

## Method: Using Git Filter-Branch

### Step 1: Create Backup
```bash
git branch backup-before-cleanup
```

### Step 2: Remove Sensitive Files from History
```bash
# Remove app.json from all history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app.json" \
  --prune-empty --tag-name-filter cat -- --all

# Remove firebase.ts history (will be re-added with env vars)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/config/firebase.ts" \
  --prune-empty --tag-name-filter cat -- --all

# Remove WorkshopFinderScreen.tsx history (will be re-added with env vars)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/screens/other/WorkshopFinderScreen.tsx" \
  --prune-empty --tag-name-filter cat -- --all
```

### Step 3: Clean Up References
```bash
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 4: Force Push to Remote
```bash
git push origin --force --all
git push origin --force --tags
```

### Step 5: Add Back the Cleaned Files
```bash
git add .gitignore app.config.js src/config/firebase.ts src/screens/other/WorkshopFinderScreen.tsx .env.example SECURITY_SETUP.md
git commit -m "Secure API keys using environment variables"
git push
```

## IMPORTANT WARNINGS

1. **Force Push Warning**: This will rewrite history for everyone who has cloned the repo
2. **Collaborators**: All collaborators must delete and re-clone the repository
3. **Forks**: Anyone who forked your repo still has the old keys
4. **GitHub Cache**: GitHub may cache the old data for some time

## Security Recommendation

Even after cleaning history, you should:
1. Revoke/regenerate your API keys (safest option)
2. Set up API key restrictions in Google Cloud Console
3. Monitor your API usage for unauthorized activity

