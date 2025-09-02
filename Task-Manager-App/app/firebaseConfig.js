// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASK7-TNtU37XXWDgaK6U3XwqRhf49_IPY",
    authDomain: "task-manager-app-13928.firebaseapp.com",
      projectId: "task-manager-app-13928",
        storageBucket: "task-manager-app-13928.firebasestorage.app",
          messagingSenderId: "18926783373",
            appId: "1:18926783373:web:457d04e80b77bf0b72cbc4"
            };

            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            export const auth = getAuth(app);
            export const db = getFirestore(app);
            