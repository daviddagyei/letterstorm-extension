const firebaseConfig = {
    apiKey: "AIzaSyC0suai5DOTZxN2uLe2AmC6-obhVriL3uc",
    authDomain: "letterstorm-15f1c.firebaseapp.com",
    projectId: "letterstorm-15f1c",
    storageBucket: "letterstorm-15f1c.firebasestorage.app",
    messagingSenderId: "1003397295291",
    appId: "1:1003397295291:web:f6d64c9b3bdcf8a1488d9e",
    measurementId: "G-E3L2PCLN17"
};

try {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
  
  // Initialize Firestore with error handling
  const db = firebase.firestore();
  
  // Set cache settings for better offline support with merge option
  db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    ignoreUndefinedProperties: true,
    merge: true  // Add merge option to prevent host override warning
  });
  
  // Enable offline persistence if needed
  db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
      console.log("Firestore persistence enabled");
    })
    .catch(err => {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore persistence failed - multiple tabs open");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore persistence not supported by browser");
      } else {
        console.error("Firestore persistence error:", err);
      }
    });
  
  // Define error handling for Firestore connections
  db.onSnapshotsInSync(() => {
    console.log("Firestore connected and in sync");
  });
  
  // Add to window object for global access
  window.db = db;
  
} catch (error) {
  console.error("Error initializing Firebase:", error);
  
  // Create a fallback system or show a friendly error
  const errorElement = document.createElement('div');
  errorElement.style.position = 'fixed';
  errorElement.style.top = '10px';
  errorElement.style.left = '10px';
  errorElement.style.backgroundColor = 'red';
  errorElement.style.color = 'white';
  errorElement.style.padding = '10px';
  errorElement.style.borderRadius = '5px';
  errorElement.style.zIndex = '9999';
  errorElement.textContent = 'Firebase connection issue. Please reload or check your internet connection.';
  
  document.body.appendChild(errorElement);
}