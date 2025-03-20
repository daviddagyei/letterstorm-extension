#!/bin/bash

# Make sure lib directory exists
mkdir -p lib

# Download additional Firebase libraries for Firestore
curl -o lib/firebase-firestore-compat.js https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore-compat.js

echo "Firestore library downloaded to lib directory"
