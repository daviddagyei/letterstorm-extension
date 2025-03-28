// This script ensures the sentence generator is initialized before the game starts

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing sentence generator...");
    
    // Check if we have the sentence generator
    if (!window.sentenceGenerator) {
        console.error("Sentence generator not found!");
        return;
    }
    
    // Set API key from config if available
    if (window.AI_CONFIG && window.AI_CONFIG.MISTRAL_API_KEY) {
        console.log("Setting API key from config");
        window.sentenceGenerator.setApiKey(window.AI_CONFIG.MISTRAL_API_KEY);
    }
    
    // Pre-fetch sentences so they're ready when the game starts
    console.log("Pre-fetching sentences...");
    window.sentenceGenerator.fetchSentences(15, "medium")
        .then(sentences => {
            if (sentences && sentences.length > 0) {
                console.log(`Successfully pre-fetched ${sentences.length} sentences`);
            } else {
                console.warn("No sentences returned from pre-fetch");
            }
        })
        .catch(error => {
            console.error("Error pre-fetching sentences:", error);
        });
});
