document.addEventListener('DOMContentLoaded', () => {
  console.log("Login page loaded");
  
  // Check if Firebase is properly initialized
  if (typeof firebase === 'undefined') {
    console.error("Firebase is not defined! Make sure Firebase SDK is loaded.");
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Firebase SDK not loaded. Please check your network connection and try again.</div>';
    return;
  }
  
  // Get DOM elements
  const welcomeScreen = document.getElementById('welcome-screen');
  const loginScreen = document.getElementById('login-screen');
  const signupScreen = document.getElementById('signup-screen');
  
  const guestButton = document.getElementById('guest-button');
  const loginOptionButton = document.getElementById('login-option-button');
  const scoreboardButton = document.getElementById('scoreboard-button');
  const gotoSignupLink = document.getElementById('goto-signup');
  const gotoLoginLink = document.getElementById('goto-login');
  const backToWelcome1 = document.getElementById('back-to-welcome-1');
  const backToWelcome2 = document.getElementById('back-to-welcome-2');
  
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');

  // Helper to show a specific screen
  function showScreen(screen) {
    welcomeScreen.classList.remove('active');
    loginScreen.classList.remove('active');
    signupScreen.classList.remove('active');
    screen.classList.add('active');
  }

  // Play as guest
  guestButton.addEventListener('click', () => {
    console.log("Play as guest clicked");
    startGame(null);
  });

  // Show login options
  loginOptionButton.addEventListener('click', () => {
    console.log("Play as user clicked");
    showScreen(loginScreen);
  });
  
  // View scoreboard
  scoreboardButton.addEventListener('click', () => {
    console.log("View scoreboard clicked");
    window.location.href = 'scoreboard.html';
  });

  // Navigation between screens
  gotoSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(signupScreen);
  });

  gotoLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(loginScreen);
  });

  backToWelcome1.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(welcomeScreen);
  });

  backToWelcome2.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(welcomeScreen);
  });

  // Login form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    loginError.textContent = '';
    
    console.log("Attempting to log in with:", email);
    
    // Direct Firebase login
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Login successful:", userCredential.user.email);
        startGame(userCredential.user);
      })
      .catch((error) => {
        console.error("Login error:", error.code, error.message);
        loginError.textContent = error.message;
      });
  });

  // Signup form submission - USING DIRECT FIREBASE
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    signupError.textContent = '';

    if (password !== confirm) {
      signupError.textContent = "Passwords don't match";
      return;
    }
    
    console.log("Attempting to create account with:", email);
    
    // Direct Firebase account creation instead of using auth.js
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Account created successfully:", userCredential.user.email);
        // Redirect to login after successful signup
        showScreen(loginScreen);
        document.getElementById('login-email').value = email;
        loginError.textContent = "Account created! Please login.";
      })
      .catch((error) => {
        console.error("Signup error:", error.code, error.message);
        signupError.textContent = error.message;
      });
  });

  // Start the game
  function startGame(user) {
    console.log("Starting game with user:", user ? user.email : "guest");
    if (user) {
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0]
      }));
    } else {
      localStorage.setItem('user', JSON.stringify({ isGuest: true }));
    }
    
    // Redirect to the game page
    window.location.href = 'index.html';
  }
  
  // Check if user is already logged in
  firebase.auth().onAuthStateChanged(user => {
    console.log("Auth state changed:", user ? "User logged in" : "No user");
    if (user) {
      // User is already logged in, redirect to game
      startGame(user);
    }
  });
});
