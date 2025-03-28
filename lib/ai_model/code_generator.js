class CodeGenerator {
    constructor() {
        this._codeSnippets = [];
        this._difficultyLevel = "medium";
        this._lastFetchTime = 0;
        this._fetchInProgress = false;
        this._apiKey = ""; // Will be set from the same API key as sentence generator
    }
    
    setApiKey(key) {
        this._apiKey = key;
        return this;
    }
    
    async fetchCodeSnippets(num = 10, difficulty = "medium") {
        if (this._fetchInProgress) {
            return this._getRandomSelection(num);
        }
        
        const now = Date.now();
        const minimumInterval = 60000; // 1 minute between API calls
        
        if (now - this._lastFetchTime < minimumInterval) {
            return this._getRandomSelection(num);
        }
        
        this._fetchInProgress = true;
        this._difficultyLevel = difficulty;
        
        try {
            if (!this._apiKey) {
                throw new Error("No API key provided for code generation");
            }
            
            const languages = {
                "easy": ["html", "markdown", "css"],
                "medium": ["javascript", "python", "typescript"],
                "hard": ["rust", "c++", "go"]
            };
            
            // Select languages based on difficulty
            const selectedLanguages = languages[difficulty] || languages.medium;
            
            // Build the prompt based on difficulty
            const codeLength = {
                "easy": "2-3 lines",
                "medium": "3-5 lines",
                "hard": "5-8 lines"
            }[difficulty] || "3-5 lines";
            
            const snippets = await this._callMistralAPI(num, selectedLanguages, codeLength);
            
            if (snippets && snippets.length > 0) {
                this._codeSnippets = snippets;
                this._lastFetchTime = now;
                console.log(`Successfully fetched ${snippets.length} code snippets`);
            }
        } catch (error) {
            console.error("Error fetching code snippets:", error);
        } finally {
            this._fetchInProgress = false;
        }
        
        return this._getRandomSelection(num);
    }
    
    async _callMistralAPI(numSnippets, languages, codeLength) {
        const apiUrl = "https://api.mistral.ai/v1/chat/completions";
        
        const requestBody = {
            model: "mistral-tiny",
            messages: [
                {
                    role: "system",
                    content: `Generate ${numSnippets} short code snippets (${codeLength}) that would be suitable for a typing practice game. Use ${languages.join(', ')} programming languages. Each snippet should be syntactically correct and representative of real code. Return as a JSON array with each item being {code: "...", language: "..."}`
                },
                {
                    role: "user",
                    content: `Create ${numSnippets} short, but realistic code snippets for typing practice. Make them varied and interesting.`
                }
            ],
            temperature: 0.7
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${this._apiKey}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        try {
            // Try to parse as JSON
            const parsedData = JSON.parse(content);
            if (Array.isArray(parsedData)) {
                return parsedData;
            }
            return this._parseTextAsCodeSnippets(content, numSnippets);
        } catch (jsonError) {
            // Fallback to text parsing
            return this._parseTextAsCodeSnippets(content, numSnippets);
        }
    }
    
    _parseTextAsCodeSnippets(content, limit) {
        // This handles parsing non-JSON formatted responses
        const snippets = [];
        const codeBlockRegex = /```(\w+)?\s*([^`]+)```/g;
        
        let match;
        while ((match = codeBlockRegex.exec(content)) !== null && snippets.length < limit) {
            const language = match[1] || "text";
            const code = match[2].trim();
            
            if (code.length > 0) {
                snippets.push({ code, language });
            }
        }
        
        // If we couldn't find code blocks, try parsing line by line
        if (snippets.length === 0) {
            const sections = content.split(/\n\s*\n/);
            
            for (let section of sections) {
                if (snippets.length >= limit) break;
                
                // Try to detect language from section heading
                let language = "text";
                const firstLine = section.split('\n')[0].toLowerCase();
                
                if (firstLine.includes('javascript') || firstLine.includes('js:')) {
                    language = "javascript";
                } else if (firstLine.includes('python') || firstLine.includes('py:')) {
                    language = "python";
                } else if (firstLine.includes('html')) {
                    language = "html";
                } else if (firstLine.includes('css')) {
                    language = "css";
                }
                
                // Remove language heading if detected
                if (language !== "text") {
                    section = section.split('\n').slice(1).join('\n').trim();
                }
                
                if (section.length > 10) {
                    snippets.push({ code: section, language });
                }
            }
        }
        
        // If still no snippets, use fallback
        if (snippets.length === 0) {
            return this._getFallbackSnippets();
        }
        
        return snippets;
    }
    
    _getRandomSelection(count) {
        if (this._codeSnippets.length === 0) {
            return this._getFallbackSnippets();
        }
        
        const shuffled = [...this._codeSnippets].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, this._codeSnippets.length));
    }
    
    getImmediateSnippets(count) {
        return this._getRandomSelection(count);
    }
    
    setDifficulty(level) {
        const validLevels = ["easy", "medium", "hard"];
        if (validLevels.includes(level)) {
            this._difficultyLevel = level;
        }
        return this;
    }
    
    _getFallbackSnippets() {
        return [
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
            },
            { 
                code: ".header {\n  color: #333;\n  font-size: 18px;\n}", 
                language: "css" 
            },
            { 
                code: "for (let i = 0; i < 10; i++) {\n  console.log(i);\n}", 
                language: "javascript" 
            }
        ];
    }
}

// Create the generator instance
const codeGenerator = new CodeGenerator();

// Make the generator available globally
window.codeGenerator = codeGenerator;

// If we have sentence generator's API key, use it
if (window.sentenceGenerator && window.sentenceGenerator._apiKey) {
    codeGenerator.setApiKey(window.sentenceGenerator._apiKey);
}

// Or if we have AI_CONFIG, use that
if (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.MISTRAL_API_KEY) {
    codeGenerator.setApiKey(AI_CONFIG.MISTRAL_API_KEY);
}

// Try to fetch snippets right away
codeGenerator.fetchCodeSnippets();
