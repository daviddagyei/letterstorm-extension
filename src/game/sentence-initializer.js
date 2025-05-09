// This script ensures the sentence generator is initialized before the game starts

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing AI generators...");
    
    // Check API key from localStorage
    const apiKey = localStorage.getItem('mistral_api_key');
    
    // Set Sentence Generator API key if available
    if (window.sentenceGenerator && apiKey) {
        console.log("Setting API key for sentence generator");
        window.sentenceGenerator.setApiKey(apiKey);
        
        // Pre-fetch sentences
        console.log("Pre-fetching sentences...");
        window.sentenceGenerator.fetchSentences(15)
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
    }
    
    // Set Code Generator API key if available
    if (window.codeGenerator && apiKey) {
        console.log("Setting API key for code generator");
        window.codeGenerator.setApiKey(apiKey);
        
        // Pre-fetch code snippets
        console.log("Pre-fetching code snippets...");
        window.codeGenerator.fetchCodeSnippets(10)
            .then(snippets => {
                if (snippets && snippets.length > 0) {
                    console.log(`Successfully pre-fetched ${snippets.length} code snippets`);
                } else {
                    console.warn("No code snippets returned from pre-fetch");
                }
            })
            .catch(error => {
                console.error("Error pre-fetching code snippets:", error);
            });
    }
    
    // Remove the AI settings button part
});
