#!/bin/bash

echo "Step 1: Increase git buffer..."
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M
git config core.compression 9

echo "Step 2: Remove node_modules from entire git history..."
git filter-branch --force --index-filter \
  'git rm -r --cached --ignore-unmatch node_modules .next .firebase' \
  --prune-empty --tag-name-filter cat -- --all

echo "Step 3: Clean up refs..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Step 4: Force push clean history..."
git push origin main --force

echo "✅ Done! Repo is now clean."