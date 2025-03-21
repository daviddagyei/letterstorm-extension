#!/bin/bash

# Make sure lib directory exists
mkdir -p lib

# Download Firebase SDK files
curl -o lib/firebase-app-compat.js https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js
curl -o lib/firebase-auth-compat.js https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js
curl -o lib/firebase-firestore-compat.js https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore-compat.js

echo "Firebase libraries downloaded to lib directory"
