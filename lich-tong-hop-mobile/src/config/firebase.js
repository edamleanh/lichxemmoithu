// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCfBIsyq2N5mFDJwmcu-ISUs4cKIMlUwn4",
  authDomain: "lickxemmoithu.firebaseapp.com", 
  projectId: "lickxemmoithu",
  storageBucket: "lickxemmoithu.firebasestorage.app",
  messagingSenderId: "1068842530441",
  appId: "1:1068842530441:web:be4f3432ae9cd24ae3f858",
  measurementId: "G-MWTMBCQ677"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

export default app
