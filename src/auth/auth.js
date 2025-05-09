// Authentication functions using Firebase
console.log("Loading auth.js");

// Direct reference to Firebase Auth
const auth = firebase.auth();
console.log("Firebase auth initialized in auth.js");

// Check if user is logged in
function checkAuthState() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      resolve(user);
    });
  });
}

// Login with email and password
function loginWithEmail(email, password) {
  console.log("Attempting to login with email:", email);
  
  return auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Login successful:", userCredential.user.email);
      return userCredential.user;
    })
    .catch((error) => {
      console.error("Login error:", error.code, error.message);
      throw error;
    });
}

// Create new account with better error handling
function createAccount(email, password) {
  console.log("Attempting to create account with email:", email);
  
  // Ensure Firebase Auth is ready
  if (!firebase.auth) {
    console.error("Firebase Auth not available");
    throw new Error("Firebase Auth is not available");
  }
  
  console.log("Firebase Auth is available, proceeding with account creation");
  
  return auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Account created successfully:", userCredential.user.email);
      return userCredential.user;
    })
    .catch((error) => {
      console.error("Account creation error:", error.code, error.message);
      
      let userMessage;
      switch (error.code) {
        case 'auth/email-already-in-use':
          userMessage = "This email is already registered. Try logging in instead.";
          break;
        case 'auth/invalid-email':
          userMessage = "Please enter a valid email address.";
          break;
        case 'auth/operation-not-allowed':
          userMessage = "Account creation is disabled. Please contact support.";
          break;
        case 'auth/weak-password':
          userMessage = "Please use a stronger password (at least 6 characters).";
          break;
        default:
          userMessage = error.message;
      }
      
      throw new Error(userMessage);
    });
}

// Logout
function logout() {
  console.log("Logging out user");
  
  return auth.signOut()
    .then(() => {
      console.log("User signed out successfully");
    })
    .catch((error) => {
      console.error("Logout error:", error.message);
      throw error;
    });
}
