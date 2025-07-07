// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBhnAjFB0INsg1rzmIxbGbrokOqfbJ45wM",
  authDomain: "shopping-65b5a.firebaseapp.com",
  projectId: "shopping-65b5a",
  storageBucket: "shopping-65b5a.firebasestorage.app",
  messagingSenderId: "1034664308080",
  appId: "1:1034664308080:web:6f7ff400d9bf00c456f3b5",
  measurementId: "G-V0X7RJ67NS"
});

const messaging = firebase.messaging();
