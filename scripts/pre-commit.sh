#!/bin/sh
# Pre-commit hook to clean up secrets in example/App.tsx

echo "Running pre-commit cleanup..."
node scripts/cleanup-example.js

# Re-add App.tsx to the commit if it was modified
git add example/App.tsx
