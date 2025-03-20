#!/bin/bash

# Create lib directory if it doesn't exist
mkdir -p lib

# Download Firebase SDK files
curl -o lib/firebase-app-compat.js https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js
curl -o lib/firebase-auth-compat.js https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js

echo "Firebase SDK files downloaded to lib directory"
