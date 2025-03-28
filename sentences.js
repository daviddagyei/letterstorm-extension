// sentences.js
function initSentenceMode() {
    console.log("initSentenceMode called");
  
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
  
    const SCREEN_WIDTH = canvas.width;
    const SCREEN_HEIGHT = canvas.height;
  
    // Game states: "start", "playing", "paused", "gameover"
    let gameState = "start";
  
    // A sample set of sentences
    let sentences = [
      "Hello world",
      "Short but tricky",
      "This is a test to ensure that longer sentences fit the screen properly",
      "Practice makes perfect",
      "Three misses means game over"
    ];
  
    let currentSentence = "";
    let typedIndex = 0;
  
    const SENTENCE_TIME = 10000; // 10 seconds allowed per sentence
    let typedTimeLeft = 0;
  
    let score = 0;
    let missed = 0;
    let level = 1;
    let nextLevelScore = 30;
  
    // High score from localStorage
    let highScore = parseInt(localStorage.getItem("sentenceModeHighScore")) || 0;
  
    // Assets
    const backgroundImage = new Image();
    backgroundImage.src = "background.png";
    const scoreSound = new Audio("score.mp3");
    const wrongSound = new Audio("wrong.mp3");
  
    // Glow color
    const GLOW_COLOR = "#00ffff";
  
    // We store the chosen font size so the sentence fits
    let sentenceFontSize = 48;
  
    // ------------------------------------------------------------
    // spawnNewSentence & dynamic font
    // ------------------------------------------------------------
    function spawnNewSentence() {
      currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
      typedIndex = 0;
      typedTimeLeft = SENTENCE_TIME;
      sentenceFontSize = pickFittingFontSize(currentSentence);
    }
  
    // picks a font size so the sentence fits within ~80% of the canvas width
    function pickFittingFontSize(sentence) {
      let fontSize = 48;
      const maxWidth = SCREEN_WIDTH * 0.8;
      while (fontSize >= 16) {
        ctx.font = `${fontSize}px 'Orbitron', sans-serif`;
        const width = ctx.measureText(sentence).width;
        if (width <= maxWidth) {
          return fontSize;
        }
        fontSize--;
      }
      return 16;
    }
  
    // ------------------------------------------------------------
    // HUD & drawing
    // ------------------------------------------------------------
    function drawHUD() {
      ctx.save();
      const hudGradient = ctx.createLinearGradient(5, 5, 5, 130);
      hudGradient.addColorStop(0, "#111");
      hudGradient.addColorStop(1, "#333");
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = hudGradient;
      ctx.fillRect(5, 5, 220, 130);
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, 220, 130);
      ctx.restore();
  
      ctx.font = "24px 'Orbitron', sans-serif";
      ctx.textAlign = "left";
      ctx.shadowColor = "blue";
      ctx.shadowBlur = 10;
  
      // High Score
      ctx.fillStyle = "#00ffff";
      ctx.fillText(`High Score: ${highScore}`, 15, 35);
  
      // Score
      ctx.fillStyle = "white";
      ctx.fillText(`Score: ${score}`, 15, 65);
  
      // Missed
      ctx.fillStyle = "red";
      ctx.fillText(`Missed: ${missed}`, 15, 95);
  
      // Level
      ctx.fillStyle = "yellow";
      ctx.fillText(`Level: ${level}`, 15, 125);
  
      ctx.shadowBlur = 0;
  
      // Show time left
      const secondsLeft = Math.ceil(typedTimeLeft / 1000);
      ctx.fillText(`Time: ${secondsLeft}s`, SCREEN_WIDTH - 120, 35);
    }
  
    function displayMessage(text, fontSize, color, y) {
      ctx.font = `${fontSize}px 'Orbitron', sans-serif`;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.fillText(text, SCREEN_WIDTH / 2, y);
      ctx.shadowBlur = 0;
    }
  
    function startScreen() {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      displayMessage("Typing Sentences", 74, "white", SCREEN_HEIGHT / 2 - 50);
      displayMessage("Type them before time runs out!", 36, "white", SCREEN_HEIGHT / 2 + 50);
    }
  
    function showGameOverPopup() {
      document.getElementById("popupScore").textContent = `Final Score: ${score}`;
      document.getElementById("gameOverlay").style.display = "flex";
    }
  
    function hideGameOverPopup() {
      document.getElementById("gameOverlay").style.display = "none";
    }
  
    // ------------------------------------------------------------
    // resetGame
    // ------------------------------------------------------------
    function resetGame() {
      score = 0;
      missed = 0;
      level = 1;
      nextLevelScore = 30;
      spawnNewSentence();
    }
  
    // ------------------------------------------------------------
    // update & draw
    // ------------------------------------------------------------
    function update() {
      typedTimeLeft -= 16.7;
      if (typedTimeLeft <= 0) {
        missed++;
        if (missed >= 3) {
          gameState = "gameover";
          showGameOverPopup();
          return;
        }
        spawnNewSentence();
      }
  
      if (score >= nextLevelScore) {
        level++;
        nextLevelScore += 30;
      }
    }
  
    function draw() {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  
      drawHUD();
  
      // We'll draw the entire sentence faint first, then the typed portion in bright.
  
      // We'll do left alignment for the text, but center it by offset
      ctx.font = `${sentenceFontSize}px 'Orbitron', sans-serif`;
      ctx.textAlign = "left";
  
      // measure the total width to center
      const totalWidth = ctx.measureText(currentSentence).width;
      const centerX = (SCREEN_WIDTH - totalWidth) / 2;
      const centerY = SCREEN_HEIGHT / 2;
  
      // draw faint entire sentence
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText(currentSentence, centerX, centerY);
  
      // typed portion in bright color
      const typedPart = currentSentence.substring(0, typedIndex);
  
      ctx.shadowColor = GLOW_COLOR;
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#fff";
      ctx.fillText(typedPart, centerX, centerY);
    }
  
    function gameLoop() {
      if (gameState === "playing") {
        update();
        draw();
        requestAnimationFrame(gameLoop);
      }
    }
  
    // ------------------------------------------------------------
    // Pause/Resume
    // ------------------------------------------------------------
    window.pauseCurrentGame = function() {
      if (gameState === "playing") {
        gameState = "paused";
      }
    };
  
    window.resumeCurrentGame = function() {
      if (gameState === "paused") {
        gameState = "playing";
        requestAnimationFrame(gameLoop);
      }
    };
  
    // so main.js can check for "playing"/"paused"
    window.getCurrentGameState = function() {
      return gameState;
    };
  
    // ------------------------------------------------------------
    // Keydown => start or type
    // ------------------------------------------------------------
    document.addEventListener("keydown", function(e) {
      if (gameState === "start") {
        // unlock audio
        scoreSound.play().then(()=>{
          scoreSound.pause();
          scoreSound.currentTime=0;
        }).catch(err=>console.error(err));
        wrongSound.play().then(()=>{
          wrongSound.pause();
          wrongSound.currentTime=0;
        }).catch(err=>console.error(err));
  
        gameState = "playing";
        resetGame();
        requestAnimationFrame(gameLoop);
      }
      else if (gameState === "playing") {
        // just typed a char, no pause since we do ctrl in main.js
        if (e.key && e.key.length === 1) {
          const expectedChar = currentSentence.charAt(typedIndex);
          if (e.key === expectedChar) {
            typedIndex++;
            if (typedIndex >= currentSentence.length) {
              score++;
              if (score > highScore) {
                highScore = score;
                localStorage.setItem("sentenceModeHighScore", highScore);
              }
              scoreSound.currentTime = 0;
              scoreSound.play().catch(err=>console.error(err));
              spawnNewSentence();
            }
          } else {
            // wrong => reset typedIndex
            wrongSound.currentTime = 0;
            wrongSound.play().catch(err=>console.error(err));
            typedIndex = 0;
          }
        }
      }
    });
  
    // ------------------------------------------------------------
    // Buttons: "Play Again", "Quit" ...
    // ------------------------------------------------------------
    document.getElementById("playAgain").addEventListener("click", () => {
      hideGameOverPopup();
      gameState = "playing";
      resetGame();
      requestAnimationFrame(gameLoop);
    });
  
    function quitGame() {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      displayMessage("Thanks for playing!", 48, "white", SCREEN_HEIGHT / 2);
      setTimeout(() => window.close(), 1500);
    }
  
    document.getElementById("quit").addEventListener("click", () => {
      hideGameOverPopup();
      quitGame();
    });
  
    document.getElementById("closeBtn").addEventListener("click", () => {
      quitGame();
    });
  
    backgroundImage.onload = () => {
      if (gameState === "start") {
        startScreen();
      }
    };
  
    console.log("Sentence Mode loaded!");
  }
  
  window.initSentenceMode = initSentenceMode;
  