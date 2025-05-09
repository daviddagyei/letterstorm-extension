chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "handlePasswordReset") {
      // Handle password reset flow coming from Firebase
      console.log("Received password reset continuation request");
      chrome.tabs.create({ url: chrome.runtime.getURL('login.html') });
      sendResponse({success: true});
    }
  }
);

// Open initial popup when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Timely Tab Extension installed');
});

// Listen for connection issues and try to reconnect
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

// Function to handle Firebase connection errors
function handleFirebaseConnectionError(error) {
  console.error('Firebase connection error:', error);
  
  if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
    connectionAttempts++;
    console.log(`Attempting to reconnect (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})...`);
    
    // Wait for exponential backoff before retrying
    setTimeout(() => {
      // Ping Firebase to test connection
      fetch('https://firestore.googleapis.com/_ah/health')
        .then(response => {
          if (response.ok) {
            console.log('Firebase connection restored');
            connectionAttempts = 0;
          } else {
            throw new Error('Firebase still unavailable');
          }
        })
        .catch(error => {
          handleFirebaseConnectionError(error);
        });
    }, 1000 * Math.pow(2, connectionAttempts));
  } else {
    console.error('Maximum reconnection attempts reached. Using offline mode.');
    // Notify user about offline mode
    chrome.runtime.sendMessage({ action: 'offlineMode' });
  }
}

// Listen for runtime messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkFirebaseConnection') {
    fetch('https://firestore.googleapis.com/_ah/health')
      .then(response => {
        sendResponse({ connected: response.ok });
      })
      .catch(error => {
        handleFirebaseConnectionError(error);
        sendResponse({ connected: false, error: error.message });
      });
    return true; // Keep the messaging channel open for async response
  }
});
