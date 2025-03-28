// Configuration file for AI models - DO NOT COMMIT API KEYS TO REPOSITORY
const AI_CONFIG = {
    // Mistral AI API key (replace with your actual key)
    MISTRAL_API_KEY: "3Pr5ZU5dfUm9PLByOMEHJMJmDUWTrxTC"
};

// Function to manually set the API key at runtime
function setMistralApiKey(key) {
    if (!key || typeof key !== 'string' || key.trim() === '') {
        console.error("Invalid API key provided");
        return false;
    }
    
    AI_CONFIG.MISTRAL_API_KEY = key.trim();
    console.log("API key set successfully");
    
    // Update sentence generator if it exists
    if (window.sentenceGenerator && typeof window.sentenceGenerator.setApiKey === 'function') {
        window.sentenceGenerator.setApiKey(AI_CONFIG.MISTRAL_API_KEY);
        console.log("API key passed to sentence generator");
        return true;
    }
    
    return false;
}

// Attempt to load API key from local storage if available
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Use the key from config as default
        if (AI_CONFIG.MISTRAL_API_KEY && window.sentenceGenerator) {
            window.sentenceGenerator.setApiKey(AI_CONFIG.MISTRAL_API_KEY);
            console.log("Set API key from config");
        }
        
        // Try to get from local storage (if available)
        const savedKey = localStorage.getItem('mistral_api_key');
        if (savedKey) {
            console.log("Found saved API key in storage");
            setMistralApiKey(savedKey);
        }
    } catch (e) {
        console.error("Error loading API key from storage:", e);
    }
});

// Make the function globally available
window.setMistralApiKey = setMistralApiKey;
