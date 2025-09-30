// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";

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
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Export the app instance
export default app;
