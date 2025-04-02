function initCodeMode() {
    console.log("initCodeMode called");
  
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
  
    const SCREEN_WIDTH = canvas.width;
    const SCREEN_HEIGHT = canvas.height;
  
    let gameState = "start";
  
    // Try to get code snippets from generator
    let codeSnippets = [];
    if (window.codeGenerator) {
        try {
            codeSnippets = window.codeGenerator.getImmediateSnippets(10);
            console.log("Retrieved code snippets:", codeSnippets);
        } catch (error) {
            console.error("Error loading code snippets:", error);
        }
    }
    
    // Default to fallbacks if needed
    if (!codeSnippets || !Array.isArray(codeSnippets) || codeSnippets.length === 0) {
        console.log("No code snippets available, using fallbacks");
        codeSnippets = [
            { 
                code: "function sayHello() {\n  console.log('Hello world');\n}", 
                language: "javascript" 
            },
            { 
                code: "def calculate_sum(a, b):\n  return a + b", 
                language: "python" 
            },
            { 
                code: "<div class=\"container\">\n  <p>Content goes here</p>\n</div>", 
                language: "html" 
            }
        ];
    }
  
    let currentSnippet = { code: "", language: "" };
    let typedIndex = 0;
  
    const CODE_TIME = 60000; // 20 seconds for code snippet
    let typedTimeLeft = 0;
  
    let score = 0;
    let missed = 0;
    let level = 1;
    let nextLevelScore = 25;
    let lastSnippetRefresh = 0;
  
    // High score from localStorage
    let highScore = parseInt(localStorage.getItem("codeModeHighScore")) || 0;
  
    // Assets
    const backgroundImage = new Image();
    backgroundImage.src = "background.png";
    const scoreSound = new Audio("score.mp3");
    const wrongSound = new Audio("wrong.mp3");
  
    // Visual settings
    const GLOW_COLOR = "#00ffff";
    const FONT_SIZE = 20;
    const LINE_HEIGHT = 30;
    const CODE_COLORS = {
        javascript: "#f7df1e",
        python: "#3572A5",
        html: "#e34c26",
        css: "#563d7c",
        default: "#ffffff"
    };
  
    // Prepare code for display - flattening multiline code
    function prepareCodeForDisplay(code) {
        return code.replace(/\n/g, " ").replace(/\s+/g, " ");
    }
  
    // Refresh code snippets based on level
    function refreshCodeSnippetsList() {
        if (!window.codeGenerator) return;
        
        const now = Date.now();
        if (now - lastSnippetRefresh > 30000) { // 30 seconds
            lastSnippetRefresh = now;
            
            let difficulty = "medium";
            if (level <= 2) difficulty = "easy";
            else if (level >= 5) difficulty = "hard";
                
            console.log(`Refreshing code snippets with difficulty: ${difficulty}`);
            
            window.codeGenerator.setDifficulty(difficulty)
                .fetchCodeSnippets(10)
                .then(newSnippets => {
                    if (newSnippets && newSnippets.length > 0) {
                        console.log(`Got ${newSnippets.length} new code snippets`);
                        codeSnippets = newSnippets;
                    }
                })
                .catch(err => {
                    console.error(`Error fetching code snippets: ${err.message}`);
                });
        }
    }
  
    function spawnNewSnippet() {
        refreshCodeSnippetsList();
        
        if (codeSnippets && codeSnippets.length > 0) {
            currentSnippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            console.log(`New snippet in ${currentSnippet.language}:\n${currentSnippet.code}`);
            
            // Flatten the code for single-line display
            currentSnippet.flatCode = prepareCodeForDisplay(currentSnippet.code);
        } else {
            currentSnippet = { 
                code: "console.log('Hello world');", 
                language: "javascript",
                flatCode: "console.log('Hello world');"
            };
            console.log("No snippets available, using default");
        }
        
        typedIndex = 0;
        typedTimeLeft = CODE_TIME;
        codeFontSize = pickFittingFontSize(currentSnippet.flatCode);
    }
  
    // picks a font size so the code snippet fits within ~80% of the canvas width
    function pickFittingFontSize(text) {
        let fontSize = 32; // Start with a reasonable size for code
        const maxWidth = SCREEN_WIDTH * 0.8;
        
        ctx.font = `${fontSize}px 'Courier New', monospace`;
        let width = ctx.measureText(text).width;
        
        while (fontSize >= 14 && width > maxWidth) {
            fontSize--;
            ctx.font = `${fontSize}px 'Courier New', monospace`;
            width = ctx.measureText(text).width;
        }
        
        return fontSize;
    }
  
    function drawHUD() {
        ctx.save();
        const hudGradient = ctx.createLinearGradient(5, 5, 5, 160);
        hudGradient.addColorStop(0, "#111");
        hudGradient.addColorStop(1, "#333");
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = hudGradient;
        ctx.fillRect(5, 5, 220, 160);
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, 220, 160);
        ctx.restore();
  
        ctx.font = "24px 'Orbitron', sans-serif";
        ctx.textAlign = "left";
        ctx.shadowColor = "blue";
        ctx.shadowBlur = 10;
  
        // HUD elements
        ctx.fillStyle = "#00ffff";
        ctx.fillText(`High Score: ${highScore}`, 15, 35);
  
        ctx.fillStyle = "white";
        ctx.fillText(`Score: ${score}`, 15, 65);
  
        ctx.fillStyle = "red";
        ctx.fillText(`Missed: ${missed}`, 15, 95);
  
        ctx.fillStyle = "yellow";
        ctx.fillText(`Level: ${level}`, 15, 125);
        
        // Language
        ctx.fillStyle = CODE_COLORS[currentSnippet.language] || CODE_COLORS.default;
        ctx.fillText(`Lang: ${currentSnippet.language}`, 15, 155);
  
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
        displayMessage("Code Typing Challenge", 64, "white", SCREEN_HEIGHT / 2 - 80);
        displayMessage("Type the code snippets before time runs out!", 28, "white", SCREEN_HEIGHT / 2);
        displayMessage("Press any key to start", 24, "yellow", SCREEN_HEIGHT / 2 + 40);
    }
  
    function showGameOverPopup() {
        document.getElementById("popupScore").textContent = `Final Score: ${score}`;
        document.getElementById("gameOverlay").style.display = "flex";
    }
  
    function hideGameOverPopup() {
        document.getElementById("gameOverlay").style.display = "none";
    }
  
    function resetGame() {
        score = 0;
        missed = 0;
        level = 1;
        nextLevelScore = 25;
        lastSnippetRefresh = 0;
        refreshCodeSnippetsList();
        spawnNewSnippet();
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
            console.log(`Level up to ${level}`);
            nextLevelScore += 25;
            refreshCodeSnippetsList();
        }
    }
  
    function draw() {
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        ctx.drawImage(backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  
        drawHUD();
        
        // Draw code background with language color
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(50, SCREEN_HEIGHT / 2 - 50, SCREEN_WIDTH - 100, 100);
        ctx.strokeStyle = CODE_COLORS[currentSnippet.language] || CODE_COLORS.default;
        ctx.lineWidth = 2;
        ctx.strokeRect(50, SCREEN_HEIGHT / 2 - 50, SCREEN_WIDTH - 100, 100);
        ctx.restore();
        
        // Draw code
        ctx.font = `${codeFontSize}px 'Courier New', monospace`;
        ctx.textAlign = "left";
        
        // Measure text for centering
        const totalWidth = ctx.measureText(currentSnippet.flatCode).width;
        const centerX = Math.max(60, (SCREEN_WIDTH - totalWidth) / 2);
        const centerY = SCREEN_HEIGHT / 2;
        
        // Draw untypes code in gray
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText(currentSnippet.flatCode, centerX, centerY);
        
        // Draw typed code with language color glow
        if (typedIndex > 0) {
            const typedPart = currentSnippet.flatCode.substring(0, typedIndex);
            ctx.shadowColor = CODE_COLORS[currentSnippet.language] || GLOW_COLOR;
            ctx.shadowBlur = 15;
            ctx.fillStyle = "#ffffff";
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
  
    // Pause/Resume
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
  
    // Keydown handler
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
                const expectedChar = currentSnippet.flatCode.charAt(typedIndex);
                console.log(`Key pressed: "${e.key}", Expected: "${expectedChar}"`);
                
                if (e.key === expectedChar) {
                    typedIndex++;
                    console.log(`Correct! typedIndex now ${typedIndex}`);
                    
                    // Force a draw update for better feedback
                    draw();
                    
                    if (typedIndex >= currentSnippet.flatCode.length) {
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
                    // Wrong key
                    wrongSound.currentTime = 0;
                    wrongSound.play().catch(err=>console.error(err));
                    typedIndex = 0; // Reset typing progress
                }
            }
        }
    });
  
    // Buttons
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
    
    console.log("Code Mode loaded!");
}
  
window.initCodeMode = initCodeMode;