// main.js
document.addEventListener("DOMContentLoaded", () => {
    // When the welcome overlay's button is clicked, hide it and show the mode selection.
    document.getElementById("openModes").addEventListener("click", () => {
      document.getElementById("welcomeOverlay").style.display = "none";
      document.getElementById("modeOverlay").style.display = "flex";
    });
  
    // Mode selection: when the user clicks a mode button,
    // hide the mode overlay and call the corresponding initialization function.
    document.getElementById("letterMode").addEventListener("click", () => {
      document.getElementById("modeOverlay").style.display = "none";
      window.gameMode = "letters";
      if (typeof initLetterMode === "function") {
        initLetterMode();
      } else {
        console.error("initLetterMode() is not defined.");
      }
    });
  
    document.getElementById("wordMode").addEventListener("click", () => {
      document.getElementById("modeOverlay").style.display = "none";
      window.gameMode = "words";
      if (typeof initWordMode === "function") {
        initWordMode();
      } else {
        console.error("initWordMode() is not defined.");
      }
    });
  
    // Global keydown: assign the space bar to toggle pause/resume.
    document.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        e.preventDefault(); // Prevent default space action
        // Only process pause/resume if a game mode is active.
        if (window.gameMode === "letters" || window.gameMode === "words") {
          const pauseOverlay = document.getElementById("pauseOverlay");
          // If the pause overlay is visible, resume; otherwise, pause.
          if (pauseOverlay.style.display === "flex") {
            if (typeof resumeCurrentGame === "function") {
              resumeCurrentGame();
            }
            pauseOverlay.style.display = "none";
          } else {
            if (typeof pauseCurrentGame === "function") {
              pauseCurrentGame();
            }
            pauseOverlay.style.display = "flex";
          }
        }
      }
    });
  
    // Resume button in pause overlay.
    document.getElementById("resumeBtn").addEventListener("click", () => {
      if (typeof resumeCurrentGame === "function") {
        resumeCurrentGame();
      }
      document.getElementById("pauseOverlay").style.display = "none";
    });
  
    // Back to Menu: reload the page to return to the mode selection.
    document.getElementById("menuBtn").addEventListener("click", () => {
      window.location.reload();
    });
  
    // Pause overlay Quit button.
    document.getElementById("pauseQuit").addEventListener("click", () => {
      if (typeof quitGame === "function") {
        quitGame();
      } else {
        window.close();
      }
    });
  
    // Global Close button (quit game).
    document.getElementById("closeBtn").addEventListener("click", () => {
      if (typeof quitGame === "function") {
        quitGame();
      } else {
        window.close();
      }
    });
  });
  