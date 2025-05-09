// main.js
document.addEventListener('DOMContentLoaded', () => {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  // If no user data, redirect to login page
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // If not a guest user
  if (!user.isGuest) {
    console.log(`Logged in as: ${user.displayName || user.email}`);
  } else {
    console.log('Playing as guest');
  }

  // Start screen -> mode selection
  document.getElementById("openModes").addEventListener("click", () => {
    document.getElementById("welcomeOverlay").style.display = "none";
    document.getElementById("modeOverlay").style.display = "flex";
  });

  // Return to home
  document.getElementById("returnToHome").addEventListener("click", () => {
    console.log("Returning to home page...");
    // Clear user data
    localStorage.removeItem('user');
    // If user is logged in with Firebase, sign them out
    if (window.firebase && firebase.auth) {
      firebase.auth().signOut().catch(error => {
        console.error("Error signing out:", error);
      });
    }
    window.location.href = 'login.html';
  });

  // Letter mode
  document.getElementById("letterMode").addEventListener("click", () => {
    document.getElementById("modeOverlay").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    window.gameMode = "letters";

    if (typeof initLetterMode === "function") {
      initLetterMode();
    } else {
      console.error("initLetterMode is not defined");
    }
  });

  // Word mode
  document.getElementById("wordMode").addEventListener("click", () => {
    document.getElementById("modeOverlay").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    window.gameMode = "words";

    if (typeof initWordMode === "function") {
      initWordMode();
    } else {
      console.error("initWordMode is not defined");
    }
  });

  // Sentence mode
  document.getElementById("sentenceMode").addEventListener("click", () => {
    document.getElementById("modeOverlay").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    window.gameMode = "sentences";

    if (typeof initSentenceMode === "function") {
      initSentenceMode();
    } else {
      console.error("initSentenceMode is not defined");
    }
  });

  // Code mode
  document.getElementById("codeMode").addEventListener("click", () => {
    document.getElementById("modeOverlay").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    window.gameMode = "code";

    if (typeof initCodeMode === "function") {
      initCodeMode();
    } else {
      console.error("initCodeMode is not defined");
    }
  });

  // Space bar => pause/resume if letters/words/sentences/code
  document.addEventListener("keydown", (e) => {
    // If user presses the "Control" key
    if (e.key === "Control") {
      e.preventDefault();

      // We only do pause/resume if gameMode is letters, words, sentences, or code
      if (["letters", "words", "sentences", "code"].includes(window.gameMode)) {
        if (typeof getCurrentGameState === "function") {
          const currentState = getCurrentGameState();
          if (currentState === "playing") {
            if (typeof pauseCurrentGame === "function") {
              pauseCurrentGame();
            }
            document.getElementById("pauseOverlay").style.display = "flex";
          } else if (currentState === "paused") {
            if (typeof resumeCurrentGame === "function") {
              resumeCurrentGame();
            }
            document.getElementById("pauseOverlay").style.display = "none";
          }
        }
      }
    }
  });

  // Resume button
  document.getElementById("resumeBtn").addEventListener("click", () => {
    if (typeof resumeCurrentGame === "function") {
      resumeCurrentGame();
    }
    document.getElementById("pauseOverlay").style.display = "none";
  });

  // Back to Menu => reload
  document.getElementById("menuBtn").addEventListener("click", () => {
    window.location.reload();
  });

  // Pause overlay Quit
  document.getElementById("pauseQuit").addEventListener("click", () => {
    if (typeof quitGame === "function") {
      quitGame();
    } else {
      window.close();
    }
  });

  // Global Close button => quit
  document.getElementById("closeBtn").addEventListener("click", () => {
    if (typeof quitGame === "function") {
      quitGame();
    } else {
      window.close();
    }
  });
});
