# Handoff: PCG Production Deployment (Phase 8)
**Date:** 2025-12-14  
**Type:** Deployment  
**Last Updated:** 2025-12-14  
**Status:** ⬜ Not Started  

---

## 🚨 CURRENT STATE

### What's Working ✅
- All V1 features complete (wizard, edit mode, save/load, AI generation, portrait, PDF export)
- Local development environment fully functional
- Backend API endpoints tested and working
- Frontend builds successfully with production config

### What's NOT Working ❌
- **Production deployment not attempted** - This handoff is pre-deployment
- **nginx routing for `/playercharactergenerator`** - Needs to be added
- **Production environment variables** - Need verification
- **Timeout configuration** - Must match StatblockGenerator pattern (120s for AI)

### Critical Lessons from StatblockGenerator Deployment
pcg-phase52-ui
**Issue 1: 504 Gateway Timeout (CRITICAL)**
- **Root Cause:** nginx default 60s timeout too short for AI generation (60-120s)
- **Fix:** Set `proxy_read_timeout 120s` in `@backend` location block
- **Evidence:** `Docs/ProjectDiary/2025/StatblockGenerator/rebuild 10-2025/2025-10-14-504-timeout-fix.md`

**Issue 2: React Router 404 on Direct URL Access**
- **Root Cause:** Missing `try_files $uri $uri/ /index.html` for SPA routes
- **Fix:** Add specific location block for `/playercharactergenerator` route
- **Evidence:** `2025-10-08-statblock-beta-DEPLOYMENT-GUIDE.md` lines 86-95

**Issue 3: API URL Mismatch**
- **Root Cause:** Frontend built with `localhost:7860` instead of production URL
- **Fix:** Build with `REACT_APP_DUNGEONMIND_API_URL=https://www.dungeonmind.net`
- **Evidence:** Deployment guide troubleshooting section

---

## 📋 Pre-Deployment Checklist

### 1. Environment Files ✅/❌

**Required Files:**
- [ ] `DungeonMindServer/.env.production` exists
- [ ] `LandingPage/.env.production` exists (if needed)
- [ ] All API keys present (OpenAI, Cloudflare R2, Firebase)
- [ ] `ENVIRONMENT=production` set correctly
- [ ] `DUNGEONMIND_API_URL=https://www.dungeonmind.net` configured

**Verify:**
```bash
cd /home/drakosfire/Projects/DungeonOverMind/DungeonMindServer
grep ENVIRONMENT .env.production
# Should output: ENVIRONMENT=production

grep DUNGEONMIND_API_URL .env.production
# Should output: DUNGEONMIND_API_URL=https://www.dungeonmind.net
```

---

### 2. Frontend Build Configuration ✅/❌

**Production Build Command:**
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
REACT_APP_DUNGEONMIND_API_URL=https://www.dungeonmind.net pnpm build
```

**Verify Build Output:**
```bash
ls -lh build/
# Should see: index.html, static/js/, static/css/

# Verify API URL in built files
grep -r "DUNGEONMIND_API_URL" build/static/js/*.js | head -1
# Should contain: https://www.dungeonmind.net
# NOT: http://localhost:7860
```

**Test Build Locally:**
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
pnpm build
# Should complete without errors
```

---

### 3. Backend Verification ✅/❌

**PCG API Endpoints to Test:**
- [ ] `/api/playercharactergenerator/health` - Health check
- [ ] `/api/playercharactergenerator/save-project` - Save character
- [ ] `/api/playercharactergenerator/list-projects` - List characters
- [ ] `/api/playercharactergenerator/generate` - AI generation (CRITICAL: needs 120s timeout)
- [ ] `/api/playercharactergenerator/constraints` - Get constraints
- [ ] `/api/playercharactergenerator/validate` - Validate character
- [ ] `/api/playercharactergenerator/compute` - Compute derived stats

**Run Backend Tests:**
```bash
cd /home/drakosfire/Projects/DungeonOverMind/DungeonMindServer
uv run pytest playercharactergenerator/tests/ -v
```

---

### 4. nginx Configuration Updates (CRITICAL) ⚠️

**File:** `nginx/dungeonmind.net`

**Add PCG Route (AFTER `/statblockgenerator` block, around line 95):**

```nginx
# Specific route for /playercharactergenerator
location /playercharactergenerator {
    limit_req zone=static burst=20 nodelay;
    
    try_files $uri $uri/ /index.html;
    
    # Enable sub_filter module (keeping consistency with root location)
    sub_filter '"DUNGEONMIND_API_URL_PLACEHOLDER"' '"$DUNGEONMIND_API_URL"';
    sub_filter_once on;
}
```

**Verify `@backend` Location Has Timeout Settings (CRITICAL):**

**Current location (around line 238):**
```nginx
location @backend {
    limit_req zone=api burst=30 nodelay;
    
    proxy_pass http://localhost:7860;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Timeout settings for AI generation endpoints (OpenAI can take 60-120s)
    proxy_connect_timeout 10s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;  # ← CRITICAL: Must be 120s, not 60s default
    
    # ... rest of config
}
```

**If timeout settings are missing, add them:**
```nginx
# Timeout settings for AI generation endpoints (OpenAI can take 60-120s)
proxy_connect_timeout 10s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

**Why:** PCG AI generation (`/api/playercharactergenerator/generate`) can take 60-120 seconds for complex characters. Default 60s timeout causes 504 errors.

**Test nginx Config:**
```bash
cd /home/drakosfire/Projects/DungeonOverMind
sudo nginx -t -c $(pwd)/nginx/dungeonmind.net 2>/dev/null || echo "Will test on server"
```

---

### 5. Docker Compose Verification ✅/❌

**Current Setup:**
- PCG is part of `DungeonMindServer` (not separate service)
- Uses `api-server` on port 7860
- **No changes needed** - Same as StatblockGenerator

**Verify:**
```bash
cd /home/drakosfire/Projects/DungeonOverMind
cat docker-compose.yml | grep -A 5 api-server
# Should show port 7860:7860
```

---

### 6. Firestore Configuration ✅/❌

**Required Collection:**
- [ ] `playercharacter_projects` collection exists
- [ ] Security rules allow authenticated read/write

**Security Rules (Firebase Console):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /playercharacter_projects/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Verify on Server:**
```bash
ssh alan@191.101.14.169
ls -la /var/www/DungeonMind/serviceAccountKey.json
# Should exist
```

---

### 7. Cloudflare R2 Configuration ✅/❌

**Required for Portrait Storage:**
- [ ] R2 bucket exists: `dungeonmind-images` (shared with StatblockGenerator)
- [ ] Public access configured for image URLs
- [ ] R2 credentials in `.env.production`

**Verify Environment Variables:**
```bash
cd /home/drakosfire/Projects/DungeonOverMind/DungeonMindServer
grep CLOUDFLARE .env.production
# Should show:
# CLOUDFLARE_ACCOUNT_ID=...
# CLOUDFLARE_R2_ACCESS_KEY_ID=...
# CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
# CLOUDFLARE_R2_BUCKET=dungeonmind-images
# CLOUDFLARE_R2_PUBLIC_URL=https://images.dungeonmind.net
```

---

## 🚀 Deployment Process

### Step 1: Local Pre-Deployment

#### 1.1 Build Frontend
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage

# Production build with correct API URL
REACT_APP_DUNGEONMIND_API_URL=https://www.dungeonmind.net pnpm build

# Verify build output
ls -lh build/
# Should see: index.html, static/js/, static/css/

# Verify API URL in built files
grep -r "www.dungeonmind.net" build/static/js/*.js | head -1
# Should find production URL
```

#### 1.2 Update nginx Configuration
```bash
cd /home/drakosfire/Projects/DungeonOverMind

# Edit nginx config (add PCG route from Section 4 above)
nano nginx/dungeonmind.net

# Add location block for /playercharactergenerator (see Section 4)
# Verify @backend has timeout settings (120s)
```

#### 1.3 Commit Changes
```bash
cd /home/drakosfire/Projects/DungeonOverMind

git add .
git commit -m "feat(pcg): production deployment prep

- Add nginx routing for /playercharactergenerator
- Verify timeout settings for AI generation (120s)
- Production build configuration"

git push origin main
```

---

### Step 2: Deploy to Production Server

#### 2.1 Transfer Files to Server

**Option A: Use Existing Script (Recommended)**
```bash
cd /home/drakosfire/Projects/DungeonOverMind

# Transfer environment files and docker-compose
./deploy-env.sh

# Expected output:
# DungeonMindServer .env transferred successfully!
# StoreGenerator .env transferred successfully!
# docker-compose.yml transferred successfully!
```

**Option B: Manual rsync (If deploy-env.sh fails)**
```bash
# Sync entire project to server
rsync -avz --progress --delete-after \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.env.development' \
    --exclude='secrets.txt' \
    /home/drakosfire/Projects/DungeonOverMind/ \
    alan@191.101.14.169:/var/www/DungeonMind/

# Transfer specific environment files
scp DungeonMindServer/.env.production alan@191.101.14.169:/var/www/DungeonMind/DungeonMindServer/.env.production
```

#### 2.2 Transfer Frontend Build
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage

# Transfer built frontend
rsync -avz build/ alan@191.101.14.169:/var/www/DungeonMind/LandingPage/build/
```

#### 2.3 Transfer nginx Configuration
```bash
cd /home/drakosfire/Projects/DungeonOverMind/nginx

# Deploy production nginx config
./deploy-config.sh

# Or manually:
scp dungeonmind.net alan@191.101.14.169:/tmp/dungeonmind.net
```

---

### Step 3: Server-Side Deployment

**SSH into Production Server:**
```bash
ssh alan@191.101.14.169
```

#### 3.1 Install nginx Configuration
```bash
# Copy nginx config to sites-available
sudo cp /tmp/dungeonmind.net /etc/nginx/sites-available/dungeonmind.net

# Enable site (if not already enabled)
sudo ln -sf /etc/nginx/sites-available/dungeonmind.net /etc/nginx/sites-enabled/dungeonmind.net

# Test nginx configuration
sudo nginx -t

# Expected output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### 3.2 Rebuild Docker Containers
```bash
cd /var/www/DungeonMind

# Pull latest changes (if using git on server)
git pull origin main

# Rebuild Docker images with production environment
ENVIRONMENT=production sudo docker-compose build

# Should rebuild api-server
```

#### 3.3 Restart Services
```bash
cd /var/www/DungeonMind

# Stop existing containers
sudo docker-compose down

# Start with production environment
ENVIRONMENT=production sudo docker-compose up -d

# Verify containers are running
sudo docker-compose ps

# Expected output:
# dungeonmind_api-server_1    ... Up (healthy)
```

#### 3.4 Reload nginx
```bash
# Reload nginx with new configuration
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# Expected output: active (running)
```

---

### Step 4: Verification & Testing

#### 4.1 Health Checks (Run from Server)
```bash
# API health check
curl -f https://www.dungeonmind.net/health
# Expected: "healthy"

# Frontend health check
curl -f https://www.dungeonmind.net/
# Expected: HTML content

# PCG specific route
curl -f https://www.dungeonmind.net/playercharactergenerator
# Expected: Same HTML (React Router handles routing)
```

#### 4.2 API Endpoint Checks (Run from Your Dev Machine)
```bash
# Check PCG health endpoint
curl -f https://www.dungeonmind.net/api/playercharactergenerator/health
# Expected: {"status": "ok", "service": "playercharactergenerator"}

# Check projects endpoint (requires authentication)
curl -f -X GET https://www.dungeonmind.net/api/playercharactergenerator/list-projects \
    -H "Content-Type: application/json" \
    --cookie "session=YOUR_SESSION_COOKIE"
# Expected: {"projects": [...]}
```

#### 4.3 Browser Testing Checklist

**Open:** https://www.dungeonmind.net/playercharactergenerator

- [ ] Page loads without errors
- [ ] Login/authentication works
- [ ] Can create new character via wizard
- [ ] All 8 wizard steps work (Basic Info → Abilities → Race → Class → Spells → Background → Equipment → Review)
- [ ] Edit mode toggle works (eye/pencil icons)
- [ ] Inline editing works (name, HP, XP, alignment)
- [ ] Complex field clicks open wizard drawer
- [ ] Auto-save works (edit, wait 2 seconds, refresh page, data persists)
- [ ] Manual save works ("Save Project" button shows "Saved" status)
- [ ] Character Roster drawer opens and shows projects
- [ ] AI generation works (Generate tab → enter concept → generates character)
- [ ] AI generation completes without timeout (test with complex character)
- [ ] Portrait generation/upload works
- [ ] PDF export works (Print → Save as PDF)
- [ ] Mobile view works (test on phone or use DevTools)
- [ ] No console errors (F12 → Console tab)

#### 4.4 Backend Logs Review
```bash
# SSH into server
ssh alan@191.101.14.169

# Check Docker logs for errors
sudo docker-compose logs api-server --tail=100

# Look for PCG route activity
sudo docker-compose logs api-server | grep playercharactergenerator

# Check nginx access logs
sudo tail -f /var/log/nginx/access.log | grep playercharactergenerator

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: 504 Gateway Timeout on AI Generation

**Symptom:** AI generation fails with 504 error after ~60 seconds

**Root Cause:** nginx timeout too short (default 60s) for AI generation (60-120s)

**Fix:**
```bash
ssh alan@191.101.14.169
sudo nano /etc/nginx/sites-available/dungeonmind.net

# Find @backend location block (around line 238)
# Ensure these lines exist:
proxy_connect_timeout 10s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;  # ← CRITICAL

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

**Evidence:** `Docs/ProjectDiary/2025/StatblockGenerator/rebuild 10-2025/2025-10-14-504-timeout-fix.md`

---

### Issue 2: 404 on /playercharactergenerator Routes

**Symptom:** Refreshing `/playercharactergenerator` page gives 404

**Root Cause:** nginx not configured for React Router SPA behavior

**Fix:**
```bash
ssh alan@191.101.14.169
sudo nano /etc/nginx/sites-available/dungeonmind.net

# Add location block (after /statblockgenerator, around line 95):
location /playercharactergenerator {
    limit_req zone=static burst=20 nodelay;
    try_files $uri $uri/ /index.html;
    sub_filter '"DUNGEONMIND_API_URL_PLACEHOLDER"' '"$DUNGEONMIND_API_URL"';
    sub_filter_once on;
}

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

---

### Issue 3: API Calls Fail (CORS or 502 errors)

**Symptom:** Console shows "Failed to fetch" or CORS errors

**Root Cause:**
1. Backend not running
2. API URL mismatch
3. nginx proxy not configured

**Fix:**

**Check Backend:**
```bash
ssh alan@191.101.14.169
sudo docker-compose ps
# Ensure api-server is "Up (healthy)"

# If not healthy, check logs
sudo docker-compose logs api-server --tail=50
```

**Check API URL in Frontend:**
```bash
# On your dev machine, check the built frontend
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage/build

# Search for API URL in built files
grep -r "DUNGEONMIND_API_URL" static/js/*.js

# Should contain: https://www.dungeonmind.net
# NOT: http://localhost:7860
```

**Rebuild if Wrong:**
```bash
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
REACT_APP_DUNGEONMIND_API_URL=https://www.dungeonmind.net pnpm build

# Re-deploy frontend
rsync -avz build/ alan@191.101.14.169:/var/www/DungeonMind/LandingPage/build/
```

---

### Issue 4: Auto-Save Not Working

**Symptom:** Changes don't persist after refresh

**Root Cause:**
1. localStorage working but Firestore failing
2. Authentication session expired
3. Backend save endpoint failing

**Debug:**

**Check Browser Console (F12):**
- Should see save status messages: "Saving...", "Saved", or "Error"
- Check for authentication errors

**Check Backend Logs:**
```bash
ssh alan@191.101.14.169
sudo docker-compose logs api-server | grep save-project

# Look for:
# - 401 errors (auth issue)
# - 500 errors (backend issue)
# - Success messages
```

**Check Firestore:**
- Open Firebase Console
- Navigate to Firestore Database
- Look for `playercharacter_projects` collection
- Verify user's projects are saving

---

### Issue 5: AI Generation Takes Too Long

**Symptom:** Generation hangs or times out

**Expected Times:**
- Simple character: 10-30s
- Standard character: 30-60s
- Complex character (all features): 60-120s

**If consistently > 120s:**
1. Check OpenAI API status
2. Check backend logs for errors
3. Verify timeout settings (should be 120s)

**Backend Logs:**
```bash
ssh alan@191.101.14.169
sudo docker-compose logs api-server | grep -A 5 "generate"
# Should show timing logs: "Duration: XX.XXs"
```

---

## ✅ Deployment Success Checklist

When deployment is complete, verify:

- [ ] **Frontend accessible:** https://www.dungeonmind.net/playercharactergenerator loads
- [ ] **Authentication works:** Users can log in
- [ ] **Wizard works:** All 8 steps functional
- [ ] **Edit mode works:** Toggle, inline editing, complex field navigation
- [ ] **Auto-save works:** Changes persist after page refresh
- [ ] **Manual save works:** "Save Project" button shows "Saved" status
- [ ] **Character Roster works:** Can create, load, delete characters
- [ ] **AI generation works:** Completes without timeout (test complex character)
- [ ] **Portrait generation works:** Generate and upload portraits
- [ ] **PDF export works:** Print → Save as PDF produces correct output
- [ ] **Mobile responsive:** UI works on phone (test with DevTools or real device)
- [ ] **No console errors:** Browser console clean (no red errors)
- [ ] **Backend healthy:** `curl https://www.dungeonmind.net/health` returns "healthy"
- [ ] **Docker containers running:** `sudo docker-compose ps` shows "Up (healthy)"
- [ ] **nginx running:** `sudo systemctl status nginx` shows "active (running)"

---

## 📊 Post-Deployment Monitoring

### Key Metrics to Watch

**Server Resources:**
```bash
ssh alan@191.101.14.169

# CPU/Memory usage
htop

# Docker container stats
sudo docker stats

# Disk usage
df -h /var/www
```

**Backend Performance:**
```bash
# Watch backend logs for errors
sudo docker-compose logs -f api-server

# Watch nginx access logs
sudo tail -f /var/log/nginx/access.log | grep playercharactergenerator
```

**User Errors:**
- Monitor browser console errors (ask beta users to report)
- Check Firestore write errors (Firebase Console > Usage)
- Monitor Cloudflare R2 API usage (Cloudflare Dashboard)
- Monitor OpenAI API usage (OpenAI Dashboard)

---

## 🔄 Rollback Plan

If deployment fails and you need to roll back:

### Quick Rollback (Server)
```bash
ssh alan@191.101.14.169
cd /var/www/DungeonMind

# Find latest backup (deploy-env.sh creates backups)
ls -lt /var/www/DungeonMind_backup_*

# Restore from backup
LATEST_BACKUP=$(ls -td /var/www/DungeonMind_backup_* | head -1)
sudo rm -rf /var/www/DungeonMind
sudo cp -r "$LATEST_BACKUP" /var/www/DungeonMind

# Restart services
cd /var/www/DungeonMind
sudo docker-compose down
ENVIRONMENT=production sudo docker-compose up -d

# Reload nginx (with old config if needed)
sudo systemctl reload nginx
```

### Manual Rollback (Frontend Only)
```bash
# On your dev machine, checkout previous commit
cd /home/drakosfire/Projects/DungeonOverMind/LandingPage
git log --oneline -10
# Find last working commit

git checkout <previous-commit-hash>
pnpm build

# Transfer to server
rsync -avz build/ alan@191.101.14.169:/var/www/DungeonMind/LandingPage/build/
```

---

## 📚 Reference Documents

**StatblockGenerator Deployment:**
- `Docs/ProjectDiary/2025/StatblockGenerator/rebuild 10-2025/2025-10-08-statblock-beta-DEPLOYMENT-GUIDE.md` - Complete deployment guide
- `Docs/ProjectDiary/2025/StatblockGenerator/rebuild 10-2025/2025-10-14-504-timeout-fix.md` - Timeout fix details

**nginx Configuration:**
- `nginx/dungeonmind.net` - Production nginx config
- `nginx/README.md` - nginx configuration guide

**Key Scripts:**
- `deploy-env.sh` - Transfer environment files to server
- `nginx/deploy-config.sh` - Deploy nginx configuration
- `docker-compose.yml` - Production Docker orchestration

**Backend Endpoints:**
- `/api/playercharactergenerator/health` - Health check
- `/api/playercharactergenerator/save-project` - Save character
- `/api/playercharactergenerator/list-projects` - List characters
- `/api/playercharactergenerator/generate` - AI generation (needs 120s timeout)
- `/api/playercharactergenerator/constraints` - Get constraints
- `/api/playercharactergenerator/validate` - Validate character
- `/api/playercharactergenerator/compute` - Compute derived stats

---

## 🎓 Lessons Learned (From StatblockGenerator)

1. **Always set explicit nginx timeouts** - Default 60s is too short for AI generation
2. **Cascade timeouts** - Frontend (150s) > nginx (120s) > backend (no limit)
3. **React Router requires try_files** - Must include `/index.html` for SPA routes
4. **Verify API URL in build** - Check built files contain production URL, not localhost
5. **Test timeout scenarios** - Don't assume it works; simulate actual failures
6. **Comprehensive logging** - Timing logs essential for diagnosing timeout issues
7. **User-facing error messages** - Generic errors are useless; provide actionable guidance

---

**Created:** December 14, 2025  
**Status:** Ready for deployment  
**Estimated Deployment Time:** 45-60 minutes  
**Next Steps:** Complete pre-deployment checklist, then follow Step 1-4

