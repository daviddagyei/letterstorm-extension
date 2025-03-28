class SentenceGenerator {
    constructor() {
        this._sentences = [];
        this._difficultyLevel = "medium";
        this._lastFetchTime = 0;
        this._fetchInProgress = false;
        this._apiKey = "";
        
        // Initialize with sentences from Mistral AI
        this._initializeWithMistralSentences();
    }

    _initializeWithMistralSentences() {
        // Attempt to get sentences from Mistral API during initialization
        this.fetchSentences(15, "medium")
            .then(sentences => {
                console.log("Initial sentences loaded from Mistral AI");
            })
            .catch(err => {
                console.warn("Couldn't fetch initial sentences", err);
            });
    }

    setApiKey(key) {
        this._apiKey = key;
        // Try to fetch sentences immediately when API key is set
        if (key) {
            this.fetchSentences(15, this._difficultyLevel);
        }
        return this;
    }

    async fetchSentences(num = 10, difficulty = "medium") {
        if (this._fetchInProgress) {
            return this._getRandomSelection(num);
        }

        const now = Date.now();
        const minimumInterval = 30000; // 30 seconds between API calls
        
        if (now - this._lastFetchTime < minimumInterval) {
            return this._getRandomSelection(num);
        }
        
        this._fetchInProgress = true;
        this._difficultyLevel = difficulty;
        
        try {
            // Only use Mistral API
            if (!this._apiKey) {
                throw new Error("No API key provided for Mistral AI");
            }
            
            const difficultyPrompts = {
                "easy": "short and simple sentences (3-5 words)",
                "medium": "moderate length sentences (6-12 words)",
                "hard": "more complex sentences (13-20 words)"
            };
            
            const prompt = difficultyPrompts[difficulty] || difficultyPrompts.medium;
            
            const mistralResponse = await this._callMistralAPI(num, prompt);
            if (mistralResponse && mistralResponse.length > 0) {
                this._sentences = mistralResponse;
                this._lastFetchTime = now;
                console.log("Successfully fetched new sentences from Mistral AI");
            } else {
                throw new Error("Received empty response from Mistral API");
            }
        } catch (error) {
            console.error("Error fetching sentences:", error);
        } finally {
            this._fetchInProgress = false;
        }
        
        return this._getRandomSelection(num);
    }
    
    async _callMistralAPI(numSentences, prompt) {
        const apiUrl = "https://api.mistral.ai/v1/chat/completions";
        
        const requestBody = {
            model: "mistral-tiny",
            messages: [
                {
                    role: "system",
                    content: `Generate ${numSentences} unique, meaningful, complete English ${prompt} suitable for typing practice. Each must be a proper sentence with a subject and verb. Return only a JSON array of strings with no explanation.`
                },
                {
                    role: "user",
                    content: `Create ${numSentences} interesting, varied English sentences for typing practice. Make sure each one is a complete sentence with proper grammar. Examples: "The quick brown fox jumps over the lazy dog." "Life is what happens when you're busy making other plans."`
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
            // Try to parse as JSON array
            return JSON.parse(content);
        } catch (jsonError) {
            // Fallback to parsing as text
            return this._parseTextAsSentences(content, numSentences);
        }
    }
    
    _parseTextAsSentences(content, limit) {
        const lines = content.trim().split('\n');
        const sentences = [];
        
        for (const line of lines) {
            let sentence = line.trim();
            
            // Skip empty lines and very short text (not likely to be sentences)
            if (!sentence || sentence.length < 5) continue;
            
            // Remove numbering, dashes, quotes, etc.
            sentence = sentence.replace(/^\d+[\.\)]\s*/, ''); // Remove "1. " or "1) "
            sentence = sentence.replace(/^[-*•]\s*/, ''); // Remove "- " or "* " or "• "
            
            // Remove surrounding quotes
            if ((sentence.startsWith('"') && sentence.endsWith('"')) || 
                (sentence.startsWith("'") && sentence.endsWith("'"))) {
                sentence = sentence.substring(1, sentence.length - 1);
            }
            
            // Ensure sentence has proper capitalization and punctuation
            if (sentence.length > 0 && !/[.!?]$/.test(sentence)) {
                sentence += '.'; // Add period if missing ending punctuation
            }
            
            // Ensure first letter is capitalized
            if (sentence.length > 0) {
                sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
            }
            
            if (sentence.length >= 5) { // Minimum sentence length check
                sentences.push(sentence);
                if (sentences.length >= limit) break;
            }
        }
        
        // If we got no valid sentences, return default ones
        if (sentences.length === 0) {
            return [
                "The quick brown fox jumps over the lazy dog.",
                "Life is what happens when you're busy making other plans.",
                "Today is a beautiful day for typing practice.",
                "Learning to type quickly requires consistent practice.",
                "Every expert was once a beginner."
            ];
        }
        
        return sentences;
    }
    
    _getRandomSelection(count) {
        // If no sentences are available, return an empty array
        // This will trigger the sentence.js to use its own fallbacks
        if (this._sentences.length === 0) {
            return [];
        }
        
        const shuffled = [...this._sentences].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, this._sentences.length));
    }
    
    getImmediateSentences(count) {
        return this._getRandomSelection(count);
    }
    
    setDifficulty(level) {
        const validLevels = ["easy", "medium", "hard"];
        if (validLevels.includes(level)) {
            this._difficultyLevel = level;
        }
        return this;
    }
}

// Create the generator instance
const sentenceGenerator = new SentenceGenerator();

// Make the generator available globally
window.sentenceGenerator = sentenceGenerator;

// Try to fetch sentences right away if we have an API key in config
if (typeof AI_CONFIG !== 'undefined' && AI_CONFIG.MISTRAL_API_KEY) {
    sentenceGenerator.setApiKey(AI_CONFIG.MISTRAL_API_KEY);
}
