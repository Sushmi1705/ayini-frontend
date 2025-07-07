// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ✅ add this

const firebaseConfig = {
  apiKey: "AIzaSyBhnAjFB0INsg1rzmIxbGbrokOqfbJ45wM",
  authDomain: "shopping-65b5a.firebaseapp.com",
  projectId: "shopping-65b5a",
  storageBucket: "shopping-65b5a.firebasestorage.app",
  messagingSenderId: "1034664308080",
  appId: "1:1034664308080:web:6f7ff400d9bf00c456f3b5",
  measurementId: "G-V0X7RJ67NS"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app); // ✅ export this
