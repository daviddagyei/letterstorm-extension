// sentences.js
function initSentenceMode() {
    console.log("initSentenceMode called");
  
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
  
    const SCREEN_WIDTH = canvas.width;
    const SCREEN_HEIGHT = canvas.height;
  
    let gameState = "start";
  
    let sentences = [];
    if (window.sentenceGenerator) {
        try {
            sentences = window.sentenceGenerator.getImmediateSentences(15);
            console.log("AI sentences loaded:", sentences);
        } catch (error) {
            console.error("Error loading AI sentences:", error);
        }
    }
    
    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
        console.log("No AI sentences available, using fallbacks");
        sentences = [
            "The quick brown fox jumps over the lazy dog.",
            "All that glitters is not gold.",
            "Actions speak louder than words.",
            "A picture is worth a thousand words.",
            "The early bird catches the worm.",
            "Don't count your chickens before they hatch.",
            "Practice makes perfect.",
            "Time flies when you're having fun.", 
            "Better late than never.",
            "Two wrongs don't make a right."
        ];
    }
  
    let currentSentence = "";
    let typedIndex = 0;
  
    const DEBUG = true;
    function log(msg) {
        if (DEBUG) console.log(`[Sentence Mode] ${msg}`);
    }
  
    const SENTENCE_TIME = 30000;
    let typedTimeLeft = 0;
  
    let score = 0;
    let missed = 0;
    let level = 1;
    let nextLevelScore = 30;
  
    let highScore = parseInt(localStorage.getItem("sentenceModeHighScore")) || 0;
  
    const backgroundImage = new Image();
    backgroundImage.src = "background.png";
    const scoreSound = new Audio("score.mp3");
    const wrongSound = new Audio("wrong.mp3");
  
    const GLOW_COLOR = "#00ffff";
  
    let sentenceFontSize = 48;
    
    function refreshSentencesList() {
        if (!window.sentenceGenerator) return;
        
        let difficulty = "medium";
        if (level <= 2) difficulty = "easy";
        else if (level >= 5) difficulty = "hard";
            
        log(`Refreshing sentences with difficulty: ${difficulty}`);
        
        window.sentenceGenerator.fetchSentences(15, difficulty)
            .then(newSentences => {
                if (newSentences && newSentences.length > 0) {
                    log(`Got ${newSentences.length} new sentences from AI`);
                    sentences = newSentences;
                }
            })
            .catch(err => {
                log(`Error fetching sentences: ${err.message}`);
            });
    }
  
    function spawnNewSentence() {
        if (level > 1 && window.sentenceGenerator) {
            refreshSentencesList();
        }
        
        if (sentences && sentences.length > 0) {
            currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
            log(`New sentence: "${currentSentence}"`);
        } else {
            currentSentence = "This is a default sentence.";
            log("No sentences available, using default");
        }
        
        typedIndex = 0;
        typedTimeLeft = SENTENCE_TIME;
        sentenceFontSize = pickFittingFontSize(currentSentence);
    }
  
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
  
      ctx.fillStyle = "#00ffff";
      ctx.fillText(`High Score: ${highScore}`, 15, 35);
  
      ctx.fillStyle = "white";
      ctx.fillText(`Score: ${score}`, 15, 65);
  
      ctx.fillStyle = "red";
      ctx.fillText(`Missed: ${missed}`, 15, 95);
  
      ctx.fillStyle = "yellow";
      ctx.fillText(`Level: ${level}`, 15, 125);
  
      ctx.shadowBlur = 0;
  
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
      
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("sentenceModeHighScore", highScore);
        
        if (window.ScoresManager && typeof ScoresManager.saveHighScore === 'function') {
          ScoresManager.saveHighScore("sentenceMode", score)
            .then(success => {
              console.log("Sentence mode score saved to Firestore:", success);
            })
            .catch(error => {
              console.error("Error saving sentence mode score to Firestore:", error);
            });
        }
      }
    }
  
    function hideGameOverPopup() {
      document.getElementById("gameOverlay").style.display = "none";
    }
  
    function resetGame() {
      score = 0;
      missed = 0;
      level = 1;
      nextLevelScore = 30;
      
      if (window.sentenceGenerator) {
          window.sentenceGenerator.fetchSentences(15, "medium")
              .then(newSentences => {
                  if (newSentences && newSentences.length > 0) {
                      sentences = newSentences;
                      log("Refreshed sentences for new game");
                  }
                  spawnNewSentence();
              })
              .catch(() => {
                  spawnNewSentence();
              });
      } else {
          spawnNewSentence();
      }
    }
  
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
        log(`Level up to ${level}`);
        nextLevelScore += 30;
        refreshSentencesList();
      }
    }
  
    function draw() {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  
      drawHUD();
  
      ctx.font = `${sentenceFontSize}px 'Orbitron', sans-serif`;
      ctx.textAlign = "left";
  
      const totalWidth = ctx.measureText(currentSentence).width;
      const centerX = (SCREEN_WIDTH - totalWidth) / 2;
      const centerY = SCREEN_HEIGHT / 2;
  
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText(currentSentence, centerX, centerY);
  
      const typedPart = currentSentence.substring(0, typedIndex);
      
      if (typedIndex > 0) {
          log(`Drawing typed part: "${typedPart}" (${typedIndex}/${currentSentence.length})`);
          
          ctx.shadowColor = GLOW_COLOR;
          ctx.shadowBlur = 20;
          ctx.fillStyle = "#fff";
          ctx.fillText(typedPart, centerX, centerY);
      }
    }
  
    function gameLoop() {
      if (gameState === "playing") {
        update();
        draw();
        requestAnimationFrame(gameLoop);
      }
    }
  
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
  
    window.getCurrentGameState = function() {
      return gameState;
    };
  
    document.addEventListener("keydown", function(e) {
      if (gameState === "start") {
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
        if (e.key && e.key.length === 1) {
          const expectedChar = currentSentence.charAt(typedIndex);
          log(`Key pressed: "${e.key}", Expected: "${expectedChar}"`);
          
          if (e.key === expectedChar) {
            typedIndex++;
            log(`Correct! typedIndex now ${typedIndex}`);
            
            draw();
            
            if (typedIndex >= currentSentence.length) {
              score++;



              let highScore = 0;
              const loadHighScore = () => {
                if (window.ScoresManager) {
                  console.log("Loading letter mode high score from ScoresManager");
                  return ScoresManager.loadHighScore("letterMode")
                    .then(score => {
                      highScore = score;
                      console.log("Letter mode high score loaded:", highScore);
                    })
                    .catch(err => {
                      console.error("Error loading high score:", err);
                      highScore = parseInt(localStorage.getItem("letterModeHighScore")) || 0;
                    });
                } else {
                  console.log("ScoresManager not found, using localStorage");
                  highScore = parseInt(localStorage.getItem("letterModeHighScore")) || 0;
                  return Promise.resolve();
                }
              };
              
              const saveHighScore = (newScore) => {
                if (window.ScoresManager) {
                  console.log("Saving letter mode high score to ScoresManager:", newScore);
                  return ScoresManager.saveHighScore("letterMode", newScore);
                } else {
                  console.log("ScoresManager not found, using localStorage");
                  localStorage.setItem("letterModeHighScore", newScore);
                  return Promise.resolve();
                }
              };

              loadHighScore();




              scoreSound.currentTime = 0;
              scoreSound.play().catch(err=>console.error(err));
              spawnNewSentence();
            }
          } else {
            wrongSound.currentTime = 0;
            wrongSound.play().catch(err=>console.error(err));
            typedIndex = 0;
          }
        }
      }
    });
  
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
  
    if (window.sentenceGenerator) {
        log("Requesting initial AI sentences");
        window.sentenceGenerator.fetchSentences(15)
            .then(newSentences => {
                if (newSentences && newSentences.length > 0) {
                    log(`Got ${newSentences.length} initial sentences from AI`);
                    sentences = newSentences;
                }
            })
            .catch(error => {
                log(`Error getting initial sentences: ${error.message}`);
            });
    } else {
        log("No sentence generator available");
    }
    
    log("Sentence Mode loaded!");
}
  
window.initSentenceMode = initSentenceMode;
