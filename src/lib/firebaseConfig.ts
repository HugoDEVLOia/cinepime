
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// It's best practice to store these in environment variables

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Check if Firebase config keys are present
if (typeof window !== 'undefined' && (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY")) {
  console.warn(
    "Firebase API Key is missing or is a placeholder. " +
    "Please set NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file. " +
    "Refer to .env.local.example for the required environment variables."
  );
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Analytics if supported
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then(supported => {
    if (supported && firebaseConfig.measurementId && firebaseConfig.measurementId !== "YOUR_FIREBASE_MEASUREMENT_ID") {
      getAnalytics(app);
    }
  });
}


export { app };
