import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google.
 * Uses signInWithPopup by default. If the browser blocks the popup (e.g. Brave
 * with strict shields), falls back to signInWithRedirect automatically.
 * Returns a Firebase ID token — verified on the backend with Firebase Admin SDK.
 */
export const signInWithGoogle = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);

    let result;
    try {
      // Try popup first (instant, no page reload)
      result = await signInWithPopup(auth, googleProvider);
    } catch (popupErr) {
      // If popup was blocked or failed due to browser policy, fall back to redirect
      const blockedCodes = [
        'auth/popup-blocked',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
      ];
      if (blockedCodes.includes(popupErr.code)) {
        // Redirect triggers a full page reload — the result is caught in
        // AuthContext via getRedirectResult() on mount.
        await signInWithRedirect(auth, googleProvider);
        return null; // Page will reload; caller handles null gracefully
      }
      throw popupErr;
    }

    // Get Firebase ID token — this is what we send to the backend.
    // Firebase Admin SDK on the server verifies this token.
    // This is more reliable than GoogleAuthProvider.credentialFromResult().idToken
    // which can have audience mismatches depending on the OAuth client used.
    const idToken = await result.user.getIdToken();

    return {
      user: result.user,
      idToken,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Call this once on app mount to catch the result of a redirect sign-in.
 * Returns { user, idToken } if we just came back from a redirect, else null.
 */
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    console.error('Redirect result error:', error);
    return null;
  }
};