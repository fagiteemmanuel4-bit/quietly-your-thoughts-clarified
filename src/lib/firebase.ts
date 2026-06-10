import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArBDm6emEJemq5mmsZwUgoht_0Gp8EAxk",
  authDomain: "owlid-368e0.firebaseapp.com",
  projectId: "owlid-368e0",
  storageBucket: "owlid-368e0.firebasestorage.app",
  messagingSenderId: "279706120494",
  appId: "1:279706120494:web:76e53da06e40f5b76b0abf",
  measurementId: "G-CS1SHGQ9C2",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
