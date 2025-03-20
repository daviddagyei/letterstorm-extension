document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const welcomeScreen = document.getElementById('welcome-screen');
  const loginScreen = document.getElementById('login-screen');
  const signupScreen = document.getElementById('signup-screen');
  
  const guestButton = document.getElementById('guest-button');
  const loginOptionButton = document.getElementById('login-option-button');
  const gotoSignupLink = document.getElementById('goto-signup');
  const gotoLoginLink = document.getElementById('goto-login');
  const backToWelcome1 = document.getElementById('back-to-welcome-1');
  const backToWelcome2 = document.getElementById('back-to-welcome-2');
  
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');

  // Check if user is already logged in
  checkAuthState().then(user => {
    if (user) {
      // User is already logged in, redirect to game
      startGame(user);
    }
  });

  // Helper to show a specific screen
  function showScreen(screen) {
    welcomeScreen.classList.remove('active');
    loginScreen.classList.remove('active');
    signupScreen.classList.remove('active');
    screen.classList.add('active');
  }

  // Play as guest
  guestButton.addEventListener('click', () => {
    startGame(null);
  });

  // Show login options
  loginOptionButton.addEventListener('click', () => {
    showScreen(loginScreen);
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

    loginWithEmail(email, password)
      .then(user => {
        startGame(user);
      })
      .catch(error => {
        loginError.textContent = error.message;
      });
  });

  // Signup form submission
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

    createAccount(email, password)
      .then(() => {
        // Redirect to login after successful signup
        showScreen(loginScreen);
        document.getElementById('login-email').value = email;
        loginError.textContent = "Account created! Please login.";
      })
      .catch(error => {
        signupError.textContent = error.message;
      });
  });

  // Start the game
  function startGame(user) {
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
});
