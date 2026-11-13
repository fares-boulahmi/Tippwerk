// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLX6AuodjmObjY9A187GgrGAqn_1nLVOY",
  authDomain: "tippwerk-57169.firebaseapp.com",
  projectId: "tippwerk-57169",
  storageBucket: "tippwerk-57169.firebasestorage.app",
  messagingSenderId: "584482802179",
  appId: "1:584482802179:web:bc186c07ea2e75aa059c36",
  measurementId: "G-8NBW3S984Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// npm install firebase
//npm install -g firebase-tools
