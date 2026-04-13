// js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDdZ7FN3uPu3Kb-bpS4Sf2taIvWHnJx7WI",
  authDomain: "creatorshub-6ac91.firebaseapp.com",
  projectId: "creatorshub-6ac91",
  storageBucket: "creatorshub-6ac91.firebasestorage.app",
  messagingSenderId: "382646124375",
  appId: "1:382646124375:web:641f0f611ef09ece1a8812",
  measurementId: "G-4YZNQW1Q1P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

window.firebaseApp = app;
