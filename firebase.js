// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWXjATxzHGQxoillmUAckA26CxQ6dkQ20",
  authDomain: "twitter-clone-yt-c0ffb.firebaseapp.com",
  projectId: "twitter-clone-yt-c0ffb",
  storageBucket: "twitter-clone-yt-c0ffb.appspot.com",
  messagingSenderId: "27348300371",
  appId: "1:27348300371:web:1680ab1dce5c482fdc0ca6",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();
const auth = getAuth();
const provider = new GoogleAuthProvider();

export { app, db, storage, auth, provider };
