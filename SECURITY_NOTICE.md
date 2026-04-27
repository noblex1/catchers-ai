# 🔒 Security Notice

## Environment Variables Removed from Repository

**Date:** April 27, 2026

### What Happened
The `.env` files containing sensitive API keys and credentials were accidentally pushed to the repository. They have now been removed from Git tracking.

### Actions Taken
✅ Removed `.env` files from Git tracking  
✅ Updated `.gitignore` files to prevent future commits  
✅ Created `.env.example` templates for setup guidance  
✅ Pushed changes to remote repository  

### ⚠️ IMPORTANT: Rotate Your API Keys

Since the `.env` files were exposed in the Git history, you should **immediately rotate** the following credentials:

#### 1. Google Safe Browsing API Key
- Go to: https://console.cloud.google.com/apis/credentials
- Delete the old key
- Create a new API key
- Update `backend/.env` with the new key

#### 2. VirusTotal API Key
- Go to: https://www.virustotal.com/gui/user/YOUR_USERNAME/apikey
- Regenerate your API key
- Update `backend/.env` with the new key

#### 3. MongoDB Connection String
- Go to: https://cloud.mongodb.com/
- Navigate to Database Access
- Change the password for user: `sharifiddrisu156_db_user`
- Update the connection string in `backend/.env`

### Setup Instructions for New Developers

1. **Copy the example files:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp ml-service/.env.example ml-service/.env
   ```

2. **Fill in your own API keys and credentials**

3. **Never commit `.env` files** - they are now in `.gitignore`

### Git History Cleanup (Optional but Recommended)

The `.env` files still exist in the Git history. To completely remove them:

```bash
# WARNING: This rewrites Git history and requires force push
# Coordinate with your team before doing this

# Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env files from history
java -jar bfg.jar --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This affects all collaborators)
git push origin --force --all
```

### Prevention

- ✅ `.env` files are now in `.gitignore`
- ✅ `.env.example` templates provided
- ✅ Use environment variables for all secrets
- ✅ Never hardcode credentials in source code

### Questions?

If you have any questions about security or need help rotating credentials, please contact the project maintainer.

---

**Remember:** Security is everyone's responsibility. Always double-check before committing sensitive information!
