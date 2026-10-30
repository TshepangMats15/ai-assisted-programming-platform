import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  type Auth,
} from "firebase/auth";

// @ts-ignore Firebase 12 React Native export is missing from its TypeScript declarations
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCM9pCxUEO9y8L3QysXtDLrs2aVxblvkU8",
  authDomain: "itdma-28c29.firebaseapp.com",
  projectId: "itdma-28c29",
  storageBucket: "itdma-28c29.firebasestorage.app",
  messagingSenderId: "645015931725",
  appId: "1:645015931725:web:dcb5c6b105a49c9cb5c504",
};

// Initialize Firebase once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native persistence
let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  if (error?.code === "auth/already-initialized") {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Cloud Firestore Database
const db = getFirestore(app);

// Export Firebase services
export { auth, db, storage };