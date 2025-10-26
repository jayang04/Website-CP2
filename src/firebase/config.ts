// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy-eMcNJrBT9I_mvY2KR6nG5gIwqUqCj0",
  authDomain: "capstone-project-2-d0caf.firebaseapp.com",
  projectId: "capstone-project-2-d0caf",
  storageBucket: "capstone-project-2-d0caf.firebasestorage.app",
  messagingSenderId: "715849838391",
  appId: "1:715849838391:web:d7e57fbe2fcac61589b4b2",
  measurementId: "G-JVSJY5HFLV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Set auth persistence to LOCAL (persists across browser sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error);
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Export the app instance
export default app;
