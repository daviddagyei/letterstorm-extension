const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create the AI model directory structure
const aiModelDir = path.join(__dirname, 'lib', 'ai_model');

// Create directories if they don't exist
if (!fs.existsSync(path.join(__dirname, 'lib'))) {
    fs.mkdirSync(path.join(__dirname, 'lib'));
    console.log('Created lib directory');
}

if (!fs.existsSync(aiModelDir)) {
    fs.mkdirSync(aiModelDir);
    console.log('Created AI model directory');
}

// Create a readline interface to prompt for API key
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt for Mistral API key
rl.question('Enter your Mistral API key (or press Enter to skip): ', (apiKey) => {
    // Create config.js with the API key
    const configContent = `// Configuration file for AI models
const AI_CONFIG = {
    // Mistral AI API key
    MISTRAL_API_KEY: "${apiKey.trim()}"
};

// Load the API key into the sentence generator if available
if (window.sentenceGenerator && AI_CONFIG.MISTRAL_API_KEY) {
    window.sentenceGenerator.setApiKey(AI_CONFIG.MISTRAL_API_KEY);
}
`;

    fs.writeFileSync(path.join(aiModelDir, 'config.js'), configContent);
    console.log('Created config.js with API key');
    
    rl.close();
});

// Log success message when done
rl.on('close', () => {
    console.log('\nSetup complete! Your AI model files are ready.');
    console.log('Make sure to update the API key in lib/ai_model/config.js if needed.');
});
