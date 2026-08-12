import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration from screenshot
const firebaseConfig = {
  apiKey: "AIzaSyA1JMnw0lnR4WGFT9TtnWiFZsyaGvuSU0",
  authDomain: "skycuts-ff449.firebaseapp.com",
  projectId: "skycuts-ff449",
  storageBucket: "skycuts-ff449.firebasestorage.app",
  messagingSenderId: "535549316425",
  appId: "1:535549316425:web:d4cce77a1f8840cea95e98",
  measurementId: "G-J2XQ05ZQ8P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Sign-In Helper Function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // User credentials received
    const user = result.user;
    console.log("Logged in user details:", {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid
    });
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error.message);
    throw error;
  }
};