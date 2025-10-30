import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration - Real project credentials
const firebaseConfig = {
  apiKey: "AIzaSyC73QN2ua2jee2mKneJNxz8bAue7T9B1hg",
  authDomain: "car-workshop-mobile.firebaseapp.com",
  projectId: "car-workshop-mobile",
  storageBucket: "car-workshop-mobile.firebasestorage.app",
  messagingSenderId: "698618172099",
  appId: "1:698618172099:web:61bfa56b7d8f1d602e4876"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, firestore, storage };
export default app;
