// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaPdjZMizfT1Z4n4Z-dwnineVpOI8LLng",
  authDomain: "ledge-safe.firebaseapp.com",
  projectId: "ledge-safe",
  storageBucket: "ledge-safe.firebasestorage.app",
  messagingSenderId: "753281378347",
  appId: "1:753281378347:web:4096ee71dccc336aa8226e",
  measurementId: "G-FVY8RNHLBT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);