function initLetterMode() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
  
    const SCREEN_WIDTH = canvas.width;
    const SCREEN_HEIGHT = canvas.height;
  
    let LETTER_FALL_SPEED = 5;
    const NEW_LETTER_INTERVAL = 1000; // Spawn a new letter every second
  
    let letters = [];
    let particles = []; // For explosion effects
    let score = 0;
    let missedLetters = 0;
    let level = 1;
    let nextLevelScore = 30; // Increase level every 30 points
    let gameState = "start"; // "start", "playing", "paused", or "gameover"
    let letterInterval;
  
    const backgroundImage = new Image();
    backgroundImage.src = "background.png";
  
    // Load sounds
    const scoreSound = new Audio("score.mp3");
    const wrongSound = new Audio("wrong.mp3");
  
    const GLOW_COLOR = "#00ffff";
  
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
  
    class Letter {
      constructor() {
        this.char = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
        this.x = Math.floor(Math.random() * (SCREEN_WIDTH - 50));
        this.y = -50;
      }
      move() {
        this.y += LETTER_FALL_SPEED;
      }
      draw() {
        ctx.font = "74px 'Orbitron', sans-serif";
        ctx.textAlign = "left";
        ctx.shadowColor = GLOW_COLOR;
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#fff";
        ctx.fillText(this.char, this.x, this.y);
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
      ctx.fillText(`Missed: ${missedLetters}`, 15, 65);
      
      ctx.fillStyle = "yellow";
      ctx.fillText(`Level: ${level}`, 15, 95);
      
      ctx.shadowBlur = 0;
    }
  
    function displayMessage(text, fontSize, color, y) {
      ctx.font = `${fontSize}px 'Orbitron', sans-serif`;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.fillText(text, SCREEN_WIDTH / 2, y);
      ctx.shadowBlur = 0;
    }
  
    // Updated startScreen: does not reference any pause button.
    function startScreen() {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      displayMessage("Falling Letters", 74, "white", SCREEN_HEIGHT / 2 - 50);
      displayMessage("Press any key to start", 36, "white", SCREEN_HEIGHT / 2 + 50);
    }
  
    function gameOverScreen() {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      displayMessage("Game Over", 74, "red", SCREEN_HEIGHT / 2 - 50);
      displayMessage(`Final Score: ${score}`, 36, "white", SCREEN_HEIGHT / 2 + 50);
    }
  
    function showGameOverPopup() {
      clearInterval(letterInterval);
      document.getElementById("popupScore").textContent = `Final Score: ${score}`;
      document.getElementById("gameOverlay").style.display = "flex";
    }
  
    function hideGameOverPopup() {
      document.getElementById("gameOverlay").style.display = "none";
    }
  
    function resetGame() {
      letters = [];
      particles = [];
      score = 0;
      missedLetters = 0;
      level = 1;
      LETTER_FALL_SPEED = 5;
      nextLevelScore = 30;
    }
  
    function update() {
      for (let i = letters.length - 1; i >= 0; i--) {
        letters[i].move();
        if (letters[i].y > SCREEN_HEIGHT) {
          letters.splice(i, 1);
          missedLetters++;
          if (missedLetters >= 3) {
            gameState = "gameover";
            showGameOverPopup();
          }
        }
      }
      
      if (score >= nextLevelScore) {
        level++;
        nextLevelScore += 30;
        LETTER_FALL_SPEED += 2;
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
      
      letters.forEach(letter => letter.draw());
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
  
    // Global exposure for pause/resume.
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
  
    // Process key events.
    document.addEventListener("keydown", function letterModeKeyHandler(e) {
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
        startLetterSpawn();
        requestAnimationFrame(gameLoop);
      } else if (gameState === "playing") {
        let matched = false;
        for (let i = 0; i < letters.length; i++) {
          if (e.key.toUpperCase() === letters[i].char) {
            createExplosion(letters[i].x + 20, letters[i].y - 20);
            letters.splice(i, 1);
            score++;
            scoreSound.currentTime = 0;
            scoreSound.play().catch((error) => { console.error("Audio playback error:", error); });
            matched = true;
            break;
          }
        }
        if (!matched) {
          wrongSound.currentTime = 0;
          wrongSound.play().catch((error) => { console.error("Wrong sound playback error:", error); });
        }
      }
    });
  
    document.getElementById("playAgain").addEventListener("click", () => {
      hideGameOverPopup();
      gameState = "playing";
      resetGame();
      startLetterSpawn();
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
  
    function startLetterSpawn() {
      clearInterval(letterInterval);
      letterInterval = setInterval(() => {
        if (gameState === "playing") {
          letters.push(new Letter());
        }
      }, NEW_LETTER_INTERVAL);
    }
  
    backgroundImage.onload = () => {
      if (gameState === "start") {
        startScreen();
      }
    };
  }
  