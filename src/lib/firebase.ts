// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, writeBatch, runTransaction, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "wagewise-1cvfw",
  "appId": "1:828831346094:web:291f65a32028ee7fd02c3f",
  "storageBucket": "wagewise-1cvfw.firebasestorage.app",
  "apiKey": "AIzaSyB0dK5T8-LEHl2RAcf90CeH-AFePsT1v3k",
  "authDomain": "wagewise-1cvfw.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "828831346094"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
