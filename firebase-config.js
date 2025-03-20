// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCli2nXBy127AYlWftXd1aTuzlEwtMWy48",
  authDomain: "letstorm-44376.firebaseapp.com",
  projectId: "letstorm-44376",
  storageBucket: "letstorm-44376.firebasestorage.app",
  messagingSenderId: "1020943587605",
  appId: "1:1020943587605:web:5b21831dbf2a0e0dc0f11c",
  measurementId: "G-DY452Z298G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);