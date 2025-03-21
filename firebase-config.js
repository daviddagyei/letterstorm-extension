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
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  alert("Error initializing Firebase. See console for details.");
}