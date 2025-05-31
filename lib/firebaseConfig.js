// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Firebase Auth for authentication
import { Firestore, getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCoo2W-24VarxaUqWSDkf0uB0q11ZPRJY",
  authDomain: "recapp-1be9e.firebaseapp.com",
  projectId: "recapp-1be9e",
  storageBucket: "recapp-1be9e.firebasestorage.app",
  messagingSenderId: "251595405084",
  appId: "1:251595405084:web:ae04219c8cedc4fc876cd9",
  measurementId: "G-56MHXF29W7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Auth
const db = getFirestore(app);

export { db, auth }; // Export the auth object for use in your app