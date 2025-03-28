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
  // Comment out the next line to avoid the error
  // const forgotPasswordLink = document.getElementById('forgot-password');
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
    console.log("Switching to screen:", screen.id);
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
    const rememberMe = document.getElementById('remember-me').checked;
    loginError.textContent = '';
    
    console.log("Attempting to log in with:", email);
    
    // Remember email if requested
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
    
    // Direct Firebase login
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Login successful:", userCredential.user.email);
        startGame(userCredential.user);
      })
      .catch((error) => {
        console.error("Login error:", error.code, error.message);
        loginError.textContent = error.message;
        
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
      });
  });

  // Signup form submission
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username')?.value.trim() || '';
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    signupError.textContent = '';

    if (password !== confirm) {
      signupError.textContent = "Passwords don't match";
      return;
    }
    
    // Add username validation if username field exists
    if (document.getElementById('signup-username')) {
      if (username.length < 3) {
        signupError.textContent = "Username must be at least 3 characters";
        return;
      }
      
      if (!/^[A-Za-z0-9_]+$/.test(username)) {
        signupError.textContent = "Username can only contain letters, numbers, and underscores";
        return;
      }
    }
    
    console.log("Attempting to create account with:", email);
    
    // Disable form while processing
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";
    
    // Create the account
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log("Account created successfully:", userCredential.user.email);
        
        // If username field exists, save it to Firestore
        if (username) {
          const db = firebase.firestore();
          return db.collection('users').doc(userCredential.user.uid).set({
            username: username,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          })
          .catch(error => {
            console.error("Error saving to Firestore:", error);
            throw new Error("Failed to save user to database: " + error.message);
          })
          .then(() => {
            console.log("User data saved successfully to Firestore");
            
            // Store username temporarily
            localStorage.setItem('tempUsername', username);
            
            // Success message and redirect
            showScreen(loginScreen);
            document.getElementById('login-email').value = email;
            loginError.textContent = "Account created! Please login.";
          });
        } else {
          // No username field, just redirect
          showScreen(loginScreen);
          document.getElementById('login-email').value = email;
          loginError.textContent = "Account created! Please login.";
        }
      })
      .catch((error) => {
        console.error("Signup error:", error);
        signupError.textContent = error.message;
      })
      .finally(() => {
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
      });
  });

  // Start the game
  function startGame(user) {
    console.log("Starting game with user:", user ? user.email : "guest");
    
    if (user) {
      // Basic user info
      const userData = {
        uid: user.uid,
        email: user.email
      };
      
      // Use temporary username if available
      const tempUsername = localStorage.getItem('tempUsername');
      if (tempUsername) {
        userData.username = tempUsername;
        localStorage.removeItem('tempUsername'); // Clear after use
        
        // Store and redirect immediately
        console.log("Using temporary username:", tempUsername);
        localStorage.setItem('user', JSON.stringify(userData));
        window.location.href = 'index.html';
        return;
      }
      
      // Try to get username from Firestore
      console.log("Fetching user data from Firestore...");
      firebase.firestore().collection('users').doc(user.uid).get()
        .then(doc => {
          if (doc.exists && doc.data().username) {
            userData.username = doc.data().username;
            console.log("Username loaded from Firestore:", userData.username);
          } else {
            // If no username in database, use email prefix
            userData.username = user.email.split('@')[0];
            console.log("No username in database, using email prefix:", userData.username);
            
            // Save this default username to Firestore for next time
            firebase.firestore().collection('users').doc(user.uid).set({
              username: userData.username,
              email: user.email,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).catch(err => console.error("Error saving default username:", err));
          }
          
          // Store user data and redirect
          localStorage.setItem('user', JSON.stringify(userData));
          window.location.href = 'index.html';
        })
        .catch(error => {
          console.error("Error fetching user document:", error);
          
          // Fallback to email prefix
          userData.username = user.email.split('@')[0];
          console.log("Error getting username, using email prefix:", userData.username);
          
          // Store basic data and redirect
          localStorage.setItem('user', JSON.stringify(userData));
          window.location.href = 'index.html';
        });
    } else {
      // Guest user
      localStorage.setItem('user', JSON.stringify({ 
        isGuest: true,
        username: "Guest"
      }));
      window.location.href = 'index.html';
    }
  }
  
  // Check if user is already logged in
  firebase.auth().onAuthStateChanged(user => {
    console.log("Auth state changed:", user ? "User logged in" : "No user");
    if (user) {
      // User is already logged in, redirect to game
      startGame(user);
    }
  });

  // Load remembered email
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    document.getElementById('login-email').value = rememberedEmail;
    if (document.getElementById('remember-me')) {
      document.getElementById('remember-me').checked = true;
    }
  }
  
  // Add debug info to console
  console.log("Login component initialized");
  if (window.debugFirebase) {
    window.debugFirebase();
  }
});
