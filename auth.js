// Authentication functions using Firebase
const auth = firebase.auth();

// Check if user is logged in
function checkAuthState() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      resolve(user);
    });
  });
}

// Login with email and password
function loginWithEmail(email, password) {
  return auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user;
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      throw error;
    });
}

// Create new account
function createAccount(email, password) {
  return auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user;
    })
    .catch((error) => {
      console.error("Signup error:", error.message);
      throw error;
    });
}

// Logout
function logout() {
  return auth.signOut();
}
