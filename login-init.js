// This file replaces the inline scripts from login.html

// Check if Firebase is properly loaded
function checkFirebaseAvailability() {
  if (typeof firebase === 'undefined') {
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Firebase SDK not loaded. Please check your network connection and try again.</div>';
    return false;
  } else {
    console.log("Firebase SDK loaded successfully");
    
    if (firebase.auth) {
      console.log("Firebase Auth is available");
      return true;
    } else {
      document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Firebase Auth not loaded. Please check your extensions permissions.</div>';
      return false;
    }
  }
}

// Run the check once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  checkFirebaseAvailability();
});
