import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCaPdjZMizfT1Z4n4Z-dwnineVpOI8LLng",
  authDomain: "ledge-safe.firebaseapp.com",
  projectId: "ledge-safe",
  storageBucket: "ledge-safe.firebasestorage.app",
  messagingSenderId: "753281378347",
  appId: "1:753281378347:web:4096ee71dccc336aa8226e",
  measurementId: "G-FVY8RNHLBT",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);