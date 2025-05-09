// This file ensures Firebase is set up correctly
console.log("Firebase setup starting...");

// Check if we need to download Firebase libraries
function checkFirebaseLibraries() {
  return new Promise((resolve, reject) => {
    // Check if the lib directory exists with Firebase files
    fetch('lib/firebase-app-compat.js', { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          console.warn("Firebase libraries not found, need to download them");
          downloadFirebaseLibraries().then(resolve).catch(reject);
        } else {
          console.log("Firebase libraries already exist");
          resolve();
        }
      })
      .catch(error => {
        console.warn("Error checking Firebase libraries:", error);
        downloadFirebaseLibraries().then(resolve).catch(reject);
      });
  });
}

// Function to download Firebase libraries using fetch
function downloadFirebaseLibraries() {
  console.log("Downloading Firebase libraries...");
  
  const createLibFolder = () => {
    return fetch('createLib.php', { method: 'POST' })
      .catch(err => console.error("Error creating lib folder:", err));
  };
  
  const downloadFile = (url, filename) => {
    return fetch(url)
      .then(response => response.text())
      .then(content => {
        localStorage.setItem(`firebase_${filename}`, content);
        console.log(`Downloaded ${filename}`);
      })
      .catch(err => console.error(`Failed to download ${filename}:`, err));
  };

  return createLibFolder()
    .then(() => Promise.all([
      downloadFile('https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js', 'app-compat.js'),
      downloadFile('https://www.gstatic.com/firebasejs/9.6.0/firebase-auth-compat.js', 'auth-compat.js')
    ]));
}

// Display a helpful error message
function displayFirebaseError(error) {
  const errorElement = document.createElement('div');
  errorElement.style.backgroundColor = '#f8d7da';
  errorElement.style.color = '#721c24';
  errorElement.style.padding = '10px';
  errorElement.style.margin = '10px';
  errorElement.style.borderRadius = '5px';
  errorElement.innerHTML = `
    <h3>Firebase Error</h3>
    <p>${error.message || 'Failed to initialize Firebase'}</p>
    <p>Please make sure you've downloaded the Firebase libraries.</p>
    <button id="retryFirebase">Retry</button>
  `;
  
  document.body.prepend(errorElement);
  
  document.getElementById('retryFirebase').addEventListener('click', () => {
    errorElement.remove();
    window.location.reload();
  });
}

// Initialize Firebase when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, checking Firebase setup...");
  
  try {
    // Check if Firebase is already available
    if (typeof firebase !== 'undefined' && firebase.app) {
      console.log("Firebase is already initialized");
      return;
    }
    
    console.log("Firebase needs to be set up");
    checkFirebaseLibraries()
      .then(() => {
        console.log("Firebase libraries are ready");
        // Firebase libraries should now be loaded from the lib directory
      })
      .catch(error => {
        console.error("Failed to set up Firebase:", error);
        displayFirebaseError(error);
      });
  } catch (error) {
    console.error("Error in Firebase setup:", error);
    displayFirebaseError(error);
  }
});
