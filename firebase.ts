
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAGryEYpmr8bcaiOuycWeNGJm34xxFfGg",
  authDomain: "akshayproject-7cba9.firebaseapp.com",
  projectId: "akshayproject-7cba9",
  storageBucket: "akshayproject-7cba9.firebasestorage.app",
  messagingSenderId: "1075399037249",
  appId: "1:1075399037249:web:699a6a2f13c13784bf91c0",
  measurementId: "G-FTXMRKWY4C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
