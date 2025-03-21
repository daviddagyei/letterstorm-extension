// main.js
document.addEventListener('DOMContentLoaded', () => {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  
  // If no user data, redirect to login page
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // If not a guest user, do something...
  if (!user.isGuest) {
    console.log(`Logged in as: ${user.displayName || user.email}`);
  } else {
    console.log('Playing as guest');
  }

  // Welcome overlay -> mode selection
  document.getElementById("openModes").addEventListener("click", () => {
    document.getElementById("welcomeOverlay").style.display = "none";
    document.getElementById("modeOverlay").style.display = "flex";
  });

  document.getElementById("letterMode").addEventListener("click", () => {
    document.getElementById("modeOverlay").style.display = "none";
    // Re-show the canvas
    document.getElementById("gameCanvas").style.display = "block";
  
    if (typeof initLetterMode === "function") {
      initLetterMode();
    }
  });
  
  document.getElementById("wordMode").addEventListener("click", () => {
    document.getElementById("modeOverlay").style.display = "none";
    // Re-show the canvas
    document.getElementById("gameCanvas").style.display = "block";
  
    if (typeof initWordMode === "function") {
      initWordMode();
    }
  });
  
  // *** CHANGE ***
  // Global keydown for space bar: Only pause/resume if the game is "letters" or "words",
  // AND if our getCurrentGameState() says "playing" or "paused".
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault(); // Prevent scrolling the page with space
      if (window.gameMode === "letters" || window.gameMode === "words") {

        // If our letter/word mode code exposes a "getCurrentGameState()"...
        if (typeof getCurrentGameState === "function") {
          const currentState = getCurrentGameState();

          if (currentState === "playing") {
            // Pause the game
            if (typeof pauseCurrentGame === "function") {
              pauseCurrentGame();
            }
            document.getElementById("pauseOverlay").style.display = "flex";

          } else if (currentState === "paused") {
            // Resume the game
            if (typeof resumeCurrentGame === "function") {
              resumeCurrentGame();
            }
            document.getElementById("pauseOverlay").style.display = "none";
          }

          // If "start" or "gameover", do nothing on space.
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
