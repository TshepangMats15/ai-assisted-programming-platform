// Import Firebase functions
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCM9pCxUEO9y8L3QysXtDLrs2aVxblvkU8",
  authDomain: "itdma-28c29.firebaseapp.com",
  projectId: "itdma-28c29",
  storageBucket: "itdma-28c29.firebasestorage.app",
  messagingSenderId: "645015931725",
  appId: "1:645015931725:web:dcb5c6b105a49c9cb5c504",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export authentication so we can use it in other files
export { auth };
