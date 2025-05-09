// Scores manager for Firebase Firestore integration
console.log("Loading scores-manager.js");

const ScoresManager = (() => {
  let db = null;
  let currentUser = null;

  function initialize() {
    try {
      if (typeof firebase === 'undefined') {
        console.error("Firebase is not defined!");
        return false;
      }

      if (!firebase.firestore) {
        console.error("Firebase Firestore is not available!");
        return false;
      }

      db = firebase.firestore();
      console.log("Firestore initialized successfully");
      
      // Try to get current user
      currentUser = firebase.auth().currentUser;
      console.log("Current user in ScoresManager:", currentUser ? currentUser.email : "No user");
      
      // Set up auth state listener
      firebase.auth().onAuthStateChanged(user => {
        currentUser = user;
        console.log("Auth state changed in ScoresManager:", user ? user.email : "No user");
      });
      
      return true;
    } catch (error) {
      console.error("Error initializing Firestore:", error);
      return false;
    }
  }

  // Load high score for the current user
  function loadHighScore(gameMode) {
    return new Promise((resolve, reject) => {
      // If no user is logged in or Firestore isn't initialized, use local storage
      if (!currentUser || !db) {
        const localScore = parseInt(localStorage.getItem(`${gameMode}HighScore`)) || 0;
        console.log(`Using local high score for ${gameMode}: ${localScore}`);
        resolve(localScore);
        return;
      }

      // Try to get the high score from Firestore
      db.collection("userScores")
        .doc(currentUser.uid)
        .get()
        .then(doc => {
          if (doc.exists && doc.data()[gameMode]) {
            const firestoreScore = doc.data()[gameMode];
            console.log(`Loaded ${gameMode} high score from Firestore: ${firestoreScore}`);
            
            // Also update local storage as backup
            localStorage.setItem(`${gameMode}HighScore`, firestoreScore);
            
            resolve(firestoreScore);
          } else {
            // No score in Firestore yet, check local storage
            const localScore = parseInt(localStorage.getItem(`${gameMode}HighScore`)) || 0;
            console.log(`No Firestore score found, using local: ${localScore}`);
            
            // If local score exists, save it to Firestore
            if (localScore > 0) {
              saveHighScore(gameMode, localScore);
            }
            
            resolve(localScore);
          }
        })
        .catch(error => {
          console.error(`Error loading high score from Firestore: ${error}`);
          // Fall back to local storage
          const localScore = parseInt(localStorage.getItem(`${gameMode}HighScore`)) || 0;
          resolve(localScore);
        });
    });
  }

  // Save high score to Firestore
  function saveHighScore(gameMode, score) {
    // Always save to local storage as backup
    localStorage.setItem(`${gameMode}HighScore`, score);
    
    // If no user is logged in or Firestore isn't initialized, only use local storage
    if (!currentUser || !db) {
      console.log(`Saved ${gameMode} high score to local storage: ${score}`);
      return Promise.resolve();
    }

    console.log(`Saving ${gameMode} high score to Firestore: ${score}`);
    
    // Save to Firestore using the user's ID
    return db.collection("userScores")
      .doc(currentUser.uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          // Document exists, update it if the score is higher
          const currentScore = doc.data()[gameMode] || 0;
          if (score > currentScore) {
            return db.collection("userScores").doc(currentUser.uid).update({
              [gameMode]: score,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }
        } else {
          // Document doesn't exist, create it
          return db.collection("userScores").doc(currentUser.uid).set({
            userId: currentUser.uid,
            email: currentUser.email,
            [gameMode]: score,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      })
      .then(() => {
        console.log(`High score saved successfully to Firestore`);
      })
      .catch(error => {
        console.error(`Error saving high score to Firestore: ${error}`);
      });
  }

  // Check if a score is higher than the current high score
  function isHighScore(gameMode, score) {
    return loadHighScore(gameMode).then(highScore => {
      return score > highScore;
    });
  }

  // Initialize on script load
  const isInitialized = initialize();

  return {
    loadHighScore,
    saveHighScore,
    isHighScore,
    isInitialized
  };
})();

// Export to global scope
window.ScoresManager = ScoresManager;
