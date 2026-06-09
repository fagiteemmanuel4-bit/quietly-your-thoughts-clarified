import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDf1Zg73Sdrdsln7cXiKlLBwmjfb3oOUe0",
  authDomain: "quietly-b8f3a.firebaseapp.com",
  projectId: "quietly-b8f3a",
  storageBucket: "quietly-b8f3a.firebasestorage.app",
  messagingSenderId: "334320507736",
  appId: "1:334320507736:web:690f78d3fa57cb8c96a32d",
  measurementId: "G-4E2XTXB32R",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
