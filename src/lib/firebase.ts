import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import {
  initializeFirestore,
  Firestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCaGjVWmFFW4Dx9AieAbwspYYw2EXnT75I',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gym-log-f206e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gym-log-f206e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gym-log-f206e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '264623077152',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:264623077152:web:0e7b098df7b4b8c7bd8945',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-0WQV1H37R8',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_api_key' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id'
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    // Initialize Firestore with persistent IndexedDB multi-tab cache and ignore undefined properties
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      ignoreUndefinedProperties: true,
    });

    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      }).catch((err) => {
        console.warn('Analytics initialization failed:', err);
      });
    }
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
  }
}

export { app, db, analytics };
