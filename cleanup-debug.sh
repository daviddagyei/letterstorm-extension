#!/bin/bash

echo "Cleaning up debugging and troubleshooting files..."

# Remove debugging/troubleshooting files
rm -f debug.js
rm -f fix-login.js
rm -f firebase-test.js
rm -f domain-test.js
rm -f email-test.html
rm -f email-troubleshooting.md
rm -f firebase-email-setup.md
rm -f email-verification.js

echo "Debug files removed."

# Also fix the corrupted login.html by restoring a clean version
# This assumes you have a backup or can get it from your git repository
echo "Tip: Your login.html file appears corrupted. You can restore it from git using:"
echo "git checkout HEAD -- login.html"

echo "Cleanup complete!"
