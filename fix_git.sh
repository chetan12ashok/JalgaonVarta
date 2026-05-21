#!/bin/bash

# Step 1: Create .gitignore
cat > .gitignore << 'GITIGNORE'
node_modules/
.next/
out/
.firebase/
firebase-debug.log
.env
.env.local
*.tsbuildinfo
next-env.d.ts
.DS_Store
GITIGNORE

# Step 2: Remove node_modules from git tracking (not from disk)
git rm -r --cached node_modules/ 2>/dev/null || true
git rm -r --cached .next/ 2>/dev/null || true
git rm -r --cached .firebase/ 2>/dev/null || true

# Step 3: Commit the removal
git add .gitignore
git add -A
git commit -m "fix: remove node_modules from git tracking"

# Step 4: Configure git to handle large buffers
git config http.postBuffer 524288000

# Step 5: Push
git push -u origin main --force

echo "Done!"