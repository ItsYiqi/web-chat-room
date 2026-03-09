// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAVxCzievWswxVXBt7oEANI4ruAMDaklPg',
  authDomain: 'monash-chat-94dbb.firebaseapp.com',
  databaseURL:
    'https://monash-chat-94dbb-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'monash-chat-94dbb',
  storageBucket: 'monash-chat-94dbb.firebasestorage.app',
  messagingSenderId: '952391067745',
  appId: '1:952391067745:web:271f17d1c0c763143ba220',
  measurementId: 'G-F1X9928P1E',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Firestore  — messages & rooms
export const rtdb = getDatabase(app); // Realtime DB — typing & presence
export const auth = getAuth(app); // Anonymous auth

// ── Auto sign-in anonymously on first load ──
// Returns a promise that resolves with the User object.
export function ensureAuth(): Promise<User> {
  return new Promise((resolve, reject) => {
    // If already signed in, resolve immediately
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then((cred) => resolve(cred.user))
          .catch(reject);
      }
    });
  });
}
