// code.js
function initCodeMode() {
    console.log("initCodeMode called");
  
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
  
    const SCREEN_WIDTH = canvas.width;
    const SCREEN_HEIGHT = canvas.height;
  
    let gameState = "start";
  
    // Store code snippets (array of { code, language })
    let codeSnippets = [];

    // We'll store the current snippet text in one string for typing.
    // Example snippet: "function sayHello() {\n  console.log('Hello world');\n}"
    let currentSnippet = "";
    let currentLanguage = ""; // Add this to track the current language
    let typedIndex = 0;

    // Keep track of time allowed, scoring, missed attempts, etc.
    const CODE_TIME = 45000; // 45 seconds or whatever you prefer
    let typedTimeLeft = 0;
  
    let score = 0;
    let missed = 0;
    let level = 1;
    let nextLevelScore = 30;
  
    // High score from localStorage for code mode
    let highScore = parseInt(localStorage.getItem("codeModeHighScore")) || 0;
  
    // Assets
    const backgroundImage = new Image();
    backgroundImage.src = "background.png";
    const scoreSound = new Audio("score.mp3");
    const wrongSound = new Audio("wrong.mp3");
  
    // Glow color
    const GLOW_COLOR = "#00ffff";
  
    // Debug logging
    const DEBUG = true;
    function log(msg) {
        if (DEBUG) console.log(`[Code Mode] ${msg}`);
    }

    // Function to load code snippets from file: code_list.txt
    // The file has a pattern like:
    //   JavaScript
    //   function fibGreet(i8) { return i8 * 2; }
    //   ===
    //   JavaScript
    //   const j = [1,8,5]; ...
    //   ...
    // We can parse each block separated by "===".
    function loadCodeSnippetsFromFile() {
        return fetch('code_list.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load code_list.txt');
                }
                return response.text();
            })
            .then(text => {
                // The file has blocks separated by '==='
                // Each block might look like:
                //   JavaScript
                //   function fib() {...}
                // We parse them into { code, language } objects.
                const rawBlocks = text.split('===');

                let loadedSnippets = [];
                rawBlocks.forEach(block => {
                    // Trim lines
                    let lines = block.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    if (lines.length < 2) return; // Must have at least language + code

                    // The first line is the language, the rest is the code
                    const lang = lines[0];
                    const codeLines = lines.slice(1).join('\n'); // rejoin with \n to preserve multi-line
                    loadedSnippets.push({ code: codeLines, language: lang });
                });

                if (loadedSnippets.length === 0) {
                    throw new Error('No code snippets found in code_list.txt');
                }
                
                log(`Loaded ${loadedSnippets.length} code snippets from file`);
                return loadedSnippets;
            });
    }

    // Attempt to load code snippets from file
    loadCodeSnippetsFromFile()
        .then(snippets => {
            codeSnippets = snippets;
            // If the game is already playing, we can spawn
            if (gameState === "playing") {
                spawnNewSnippet();
            }
        })
        .catch(error => {
            console.error("Error loading code snippets:", error);
            // Fallback code snippets
            codeSnippets = [
                { code: "console.log(\"Hello fallback\");", language: "JavaScript" },
                { code: "print(\"Hello fallback\")", language: "Python" },
                { code: "<p>Fallback snippet</p>", language: "HTML" }
            ];
        });

    // The snippet is multi-line, typedIndex will go char by char

    // spawnNewSnippet picks a random code snippet from codeSnippets
    function spawnNewSnippet() {
        if (level > 1) {
            refreshCodeSnippetsList();
        }

        if (codeSnippets && codeSnippets.length > 0) {
            const snippetObj = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            currentSnippet = snippetObj.code;
            currentLanguage = snippetObj.language; // Store the language
            log(`New code snippet [${snippetObj.language}]:\n${currentSnippet}`);
        } else {
            currentSnippet = "console.log('Default snippet');";
            currentLanguage = "JavaScript"; // Default language
        }

        typedIndex = 0;
        typedTimeLeft = CODE_TIME;
    }

    // refresh code snippets from file occasionally
    function refreshCodeSnippetsList() {
        loadCodeSnippetsFromFile()
            .then(newList => {
                log(`Refreshed code snippet list from file: ${newList.length} items`);
                codeSnippets = newList;
            })
            .catch(err => {
                log(`Error refreshing code snippet list: ${err.message}`);
            });
    }

    function resetGame() {
        score = 0;
        missed = 0;
        level = 1;
        nextLevelScore = 30;

        loadCodeSnippetsFromFile()
            .then(snippets => {
                if (snippets && snippets.length > 0) {
                    codeSnippets = snippets;
                    log("Refreshed code list for new game");
                }
                spawnNewSnippet();
            })
            .catch(() => {
                spawnNewSnippet();
            });
    }

    // drawing code
    function drawHUD() {
      ctx.save();
      const hudGradient = ctx.createLinearGradient(5, 5, 5, 160); // Adjusted height for extra line
      hudGradient.addColorStop(0, "#111");
      hudGradient.addColorStop(1, "#333");
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = hudGradient;
      ctx.fillRect(5, 5, 220, 160); // Adjusted height for extra line
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, 220, 160); // Adjusted height for extra line
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
      
      // Language - add this section to display the language
      ctx.fillStyle = "#00ffcc"; // Distinct color for language
      ctx.fillText(`Lang: ${currentLanguage}`, 15, 155);
  
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
      displayMessage("Typing Code", 74, "white", SCREEN_HEIGHT / 2 - 50);
      displayMessage("Type it before time runs out!", 36, "white", SCREEN_HEIGHT / 2 + 50);
    }

    function showGameOverPopup() {
      document.getElementById("popupScore").textContent = `Final Score: ${score}`;
      document.getElementById("gameOverlay").style.display = "flex";
    }
  
    function hideGameOverPopup() {
      document.getElementById("gameOverlay").style.display = "none";
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
        spawnNewSnippet();
      }
  
      if (score >= nextLevelScore) {
        level++;
        log(`Level up: ${level}`);
        nextLevelScore += 30;
        refreshCodeSnippetsList();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  
      drawHUD();

      // Create a code background box for better visibility
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(SCREEN_WIDTH * 0.1, SCREEN_HEIGHT * 0.35, SCREEN_WIDTH * 0.8, SCREEN_HEIGHT * 0.4);
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 2;
      ctx.strokeRect(SCREEN_WIDTH * 0.1, SCREEN_HEIGHT * 0.35, SCREEN_WIDTH * 0.8, SCREEN_HEIGHT * 0.4);
      ctx.restore();

      // We'll display the code snippet centered
      const lines = currentSnippet.split('\n');

      // Increase font size and use monospace font for code
      const codeFontSize = 26; // Increased from 20px
      const lineHeight = codeFontSize * 1.4; // Increased line spacing

      // Calculate vertical position to center the code block
      const totalHeight = lines.length * lineHeight;
      const startY = SCREEN_HEIGHT / 2 - totalHeight / 2;

      // Use monospace font for code and make it larger
      ctx.font = `${codeFontSize}px 'Courier New', monospace`; 
      ctx.textAlign = "left";

      // Draw entire snippet in faint color
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.shadowBlur = 0;

      // Calculate the width of the longest line for centering
      let maxWidth = 0;
      lines.forEach(line => {
        const width = ctx.measureText(line).width;
        if (width > maxWidth) maxWidth = width;
      });

      // Center position
      const startX = (SCREEN_WIDTH - maxWidth) / 2;

      // Draw all lines
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], startX, startY + i * lineHeight);
      }

      // Now highlight the typed portion in bright color
      ctx.shadowColor = GLOW_COLOR;
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#fff";

      let globalCharIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // typedIndex might surpass the length of this line
        let typedCountForLine = 0;
        if (typedIndex - globalCharIndex > 0) {
          typedCountForLine = Math.min(line.length, typedIndex - globalCharIndex);
        }

        if (typedCountForLine > 0) {
          // typed substring
          const typedSub = line.substring(0, typedCountForLine);
          ctx.fillText(typedSub, startX, startY + i * lineHeight);
        }
        globalCharIndex += line.length;
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

    // Keydown => start or type
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
        if (e.key && e.key.length === 1) {
          // We check the next expected char
          const expectedChar = currentSnippet.charAt(typedIndex);
          log(`Key: "${e.key}" vs Expected: "${expectedChar}"`);

          // NOTE: we compare EXACT, so ' ' vs newlines etc. 
          // If you want to treat \r\n or special keys differently, adapt logic
          if (e.key === expectedChar) {
            typedIndex++;
            draw(); // immediate feedback
            if (typedIndex >= currentSnippet.length) {
              score++;
              if (score > highScore) {
                highScore = score;
                localStorage.setItem("codeModeHighScore", highScore);
              }
              scoreSound.currentTime = 0;
              scoreSound.play().catch(err=>console.error(err));
              spawnNewSnippet();
            }
          } else {
            wrongSound.currentTime = 0;
            wrongSound.play().catch(err=>console.error(err));
            typedIndex = 0; // reset if they typed something wrong
          }
        }
      }
    });

    // Buttons: "Play Again", "Quit"
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

    // Force initial load
    log("Loading initial code snippets from file");
    loadCodeSnippetsFromFile()
        .then(snippets => {
            codeSnippets = snippets;
            log(`Loaded ${codeSnippets.length} initial code snippets from file`);
        })
        .catch(err => {
            log(`Error loading initial code from file: ${err.message}`);
        });
    
    log("Code Mode loaded!");
}

window.initCodeMode = initCodeMode;
