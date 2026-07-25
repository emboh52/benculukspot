// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9Jckt4kQO62P7d151df-aHtNlzDf8fd4",
  authDomain: "benculukspot.firebaseapp.com",
  projectId: "benculukspot",
  storageBucket: "benculukspot.firebasestorage.app",
  messagingSenderId: "841243141670",
  appId: "1:841243141670:web:b0ffa87fdbfc877824a8e7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);