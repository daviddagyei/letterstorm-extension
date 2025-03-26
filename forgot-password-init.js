// Initialize Firebase with configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0suai5DOTZxN2uLe2AmC6-obhVriL3uc",
  authDomain: "letterstorm-15f1c.firebaseapp.com",
  projectId: "letterstorm-15f1c",
  storageBucket: "letterstorm-15f1c.firebasestorage.app",
  messagingSenderId: "1003397295291",
  appId: "1:1003397295291:web:f6d64c9b3bdcf8a1488d9e"
};

// Initialize Firebase immediately
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized");
  } else {
    console.log("Firebase already initialized");
  }
} catch (e) {
  console.error("Firebase init error:", e);
  alert("Error initializing Firebase: " + e.message);
}

// DOM Elements
let emailInput, resetButton, statusBox, resetForm, successPage;

// Show a status message with color coding
function showStatus(message, type = 'info') {
  statusBox.textContent = message;
  statusBox.className = 'status-box ' + type;
}

// Show loading state
function showLoading() {
  resetButton.disabled = true;
  resetButton.innerHTML = 'Sending... <span class="spinner"></span>';
}

// Reset button state
function resetButtonState() {
  resetButton.disabled = false;
  resetButton.textContent = 'Send Reset Link';
}

// Show success page
function showSuccess() {
  resetForm.style.display = 'none';
  successPage.style.display = 'block';
}

// Send password reset email function
function sendResetEmail() {
  console.log("sendResetEmail function called");
  
  const email = emailInput.value.trim();
  if (!email) {
    showStatus('Please enter your email address', 'error');
    return;
  }
  
  // Show sending status
  showStatus('Sending reset email...', 'info');
  showLoading();
  
  try {
    console.log("Attempting to send reset email to", email);
    
    // Make sure Firebase and auth are available
    if (!firebase || !firebase.auth) {
      console.error("Firebase or auth not available");
      showStatus('Firebase authentication not available', 'error');
      resetButtonState();
      return;
    }
    
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        console.log("Password reset email sent successfully");
        showSuccess();
      })
      .catch((error) => {
        console.error("Error sending reset email:", error);
        
        if (error.code === 'auth/user-not-found') {
          // Don't reveal if the account exists for security reasons
          showSuccess();
        } else {
          showStatus(error.message, 'error');
          resetButtonState();
        }
      });
  } catch (e) {
    console.error("Exception in reset email function:", e);
    showStatus('An error occurred: ' + e.message, 'error');
    resetButtonState();
  }
}

// Set up event handlers once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded");
  
  // Initialize DOM elements
  emailInput = document.getElementById('email');
  resetButton = document.getElementById('reset-button');
  statusBox = document.getElementById('status-box');
  resetForm = document.getElementById('reset-form');
  successPage = document.getElementById('success-page');
  
  // Double-check Firebase initialization
  if (!firebase || !firebase.auth) {
    console.error("Firebase not available after DOM load");
    showStatus('Firebase not available. Check your connection.', 'error');
  } else {
    console.log("Firebase available after DOM load");
  }
  
  // Add event listener to reset button
  if (resetButton) {
    resetButton.addEventListener('click', sendResetEmail);
    console.log("Event listener added to button");
  } else {
    console.error("Reset button not found!");
  }
  
  // Check URL for email parameter
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    if (emailFromUrl && emailInput) {
      emailInput.value = emailFromUrl;
      console.log("Email pre-filled from URL:", emailFromUrl);
    }
  } catch (e) {
    console.error("Error parsing URL parameters:", e);
  }
  
  console.log("Setup complete - ready for password reset");
});
