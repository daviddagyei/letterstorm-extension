function initWordMode() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const SCREEN_WIDTH = canvas.width;
  const SCREEN_HEIGHT = canvas.height;

  // Further reduced speed for words mode
  let WORD_FALL_SPEED = 1.0;
  const NEW_WORD_INTERVAL = 3000; // Spawn a new word every 3.0 seconds

  let words = [];
  let particles = [];
  let score = 0;
  let missedWords = 0;
  let level = 1;
  let nextLevelScore = 30;
  let gameState = "start"; // "start", "playing", "paused", or "gameover"
  let wordInterval;
  let currentInput = "";  // Holds the player's typed text

  const backgroundImage = new Image();
  backgroundImage.src = "background.png";

  // Load sounds
  const scoreSound = new Audio("score.mp3");
  const wrongSound = new Audio("wrong.mp3");

  const GLOW_COLOR = "#00ffff";
  let WORDS_LIST = [];

  // Load a large dictionary from an external JSON file.
  fetch(chrome.runtime.getURL('words_dictionary.json'))
    .then(response => response.json())
    .then(data => {
      WORDS_LIST = Object.keys(data);
      // Optionally filter by word length:
      // WORDS_LIST = WORDS_LIST.filter(word => word.length >= 3 && word.length <= 10);
    })
    .catch(error => console.error('Error loading dictionary:', error));

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 3 + 2;
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * 3 + 1;
      this.velocityX = Math.cos(angle) * speed;
      this.velocityY = Math.sin(angle) * speed;
      this.alpha = 1;
    }
    update() {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.alpha -= 0.02;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.fillStyle = GLOW_COLOR;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
      particles.push(new Particle(x, y));
    }
  }

  class Word {
    constructor() {
      let list = WORDS_LIST.length > 0 ? WORDS_LIST : ["hello", "world", "example"];
      this.text = list[Math.floor(Math.random() * list.length)];
      ctx.font = "48px 'Orbitron', sans-serif";
      const textWidth = ctx.measureText(this.text).width;
      const maxX = SCREEN_WIDTH - textWidth;
      this.x = Math.floor(Math.random() * (maxX > 0 ? maxX : 0));
      this.y = -50;
    }
    move() {
      this.y += WORD_FALL_SPEED;
    }
    draw() {
      ctx.font = "48px 'Orbitron', sans-serif";
      ctx.textAlign = "left";
      ctx.shadowColor = GLOW_COLOR;
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#fff";
      ctx.fillText(this.text, this.x, this.y);
      ctx.shadowBlur = 0;
    }
  }

  function drawHUD() {
    ctx.save();
    const hudGradient = ctx.createLinearGradient(5, 5, 5, 105);
    hudGradient.addColorStop(0, "#111");
    hudGradient.addColorStop(1, "#333");
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = hudGradient;
    ctx.fillRect(5, 5, 180, 100);
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, 180, 100);
    ctx.restore();

    ctx.font = "24px 'Orbitron', sans-serif";
    ctx.textAlign = "left";
    ctx.shadowColor = "blue";
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${score}`, 15, 35);
    
    ctx.fillStyle = "red";
    ctx.fillText(`Missed: ${missedWords}`, 15, 65);
    
    ctx.fillStyle = "yellow";
    ctx.fillText(`Level: ${level}`, 15, 95);
    
    ctx.shadowBlur = 0;
    
    ctx.font = "32px 'Orbitron', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(currentInput, SCREEN_WIDTH / 2, SCREEN_HEIGHT - 20);
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
    displayMessage("Typing Words", 74, "white", SCREEN_HEIGHT / 2 - 50);
    displayMessage("Type the words as they appear", 36, "white", SCREEN_HEIGHT / 2 + 50);
  }

  function gameOverScreen() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    displayMessage("Game Over", 74, "red", SCREEN_HEIGHT / 2 - 50);
    displayMessage(`Final Score: ${score}`, 36, "white", SCREEN_HEIGHT / 2 + 50);
  }

  function showGameOverPopup() {
    clearInterval(wordInterval);
    document.getElementById("popupScore").textContent = `Final Score: ${score}`;
    document.getElementById("gameOverlay").style.display = "flex";
  }

  function hideGameOverPopup() {
    document.getElementById("gameOverlay").style.display = "none";
  }

  function resetGame() {
    words = [];
    particles = [];
    score = 0;
    missedWords = 0;
    level = 1;
    WORD_FALL_SPEED = 1.0;
    nextLevelScore = 30;
    currentInput = "";
  }

  function update() {
    for (let i = words.length - 1; i >= 0; i--) {
      words[i].move();
      if (words[i].y > SCREEN_HEIGHT) {
        words.splice(i, 1);
        missedWords++;
        if (missedWords >= 3) {
          gameState = "gameover";
          showGameOverPopup();
        }
      }
    }
    
    if (score >= nextLevelScore) {
      level++;
      nextLevelScore += 30;
      WORD_FALL_SPEED += 0.25; // Increase speed gradually by 0.25
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    
    words.forEach(word => word.draw());
    particles.forEach(p => p.draw());
    drawHUD();
  }

  function gameLoop() {
    if (gameState === "playing") {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }
  }

  // Global pause/resume functions.
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

  // Process key input; no Enter key required.
  document.addEventListener("keydown", function wordModeKeyHandler(e) {
    if (gameState === "start") {
      scoreSound.play().then(() => {
        scoreSound.pause();
        scoreSound.currentTime = 0;
      }).catch((error) => { console.error("Audio unlock error:", error); });
      wrongSound.play().then(() => {
        wrongSound.pause();
        wrongSound.currentTime = 0;
      }).catch((error) => { console.error("Audio unlock error for wrongSound:", error); });
      gameState = "playing";
      resetGame();
      startWordSpawn();
      requestAnimationFrame(gameLoop);
    } else if (gameState === "playing") {
      if (e.key === "Backspace") {
        currentInput = currentInput.slice(0, -1);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        currentInput += e.key;
      }
      if (currentInput.length > 0) {
        let anyPrefix = false;
        let exactMatchIndex = -1;
        for (let i = 0; i < words.length; i++) {
          const wordText = words[i].text.toLowerCase();
          const inputLower = currentInput.toLowerCase();
          if (wordText.startsWith(inputLower)) {
            anyPrefix = true;
          }
          if (wordText === inputLower) {
            exactMatchIndex = i;
            break;
          }
        }
        if (exactMatchIndex !== -1) {
          createExplosion(words[exactMatchIndex].x + 20, words[exactMatchIndex].y - 20);
          words.splice(exactMatchIndex, 1);
          score++;
          scoreSound.currentTime = 0;
          scoreSound.play().catch((error) => { console.error("Audio playback error:", error); });
          currentInput = "";
        } else if (!anyPrefix) {
          wrongSound.currentTime = 0;
          wrongSound.play().catch((error) => { console.error("Wrong sound playback error:", error); });
          currentInput = "";
        }
      }
    }
  });

  document.getElementById("playAgain").addEventListener("click", () => {
    hideGameOverPopup();
    gameState = "playing";
    resetGame();
    startWordSpawn();
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

  function startWordSpawn() {
    clearInterval(wordInterval);
    wordInterval = setInterval(() => {
      if (gameState === "playing") {
        words.push(new Word());
      }
    }, NEW_WORD_INTERVAL);
  }

  backgroundImage.onload = () => {
    if (gameState === "start") {
      startScreen();
    }
  };
}
