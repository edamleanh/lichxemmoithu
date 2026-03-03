import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

// Configuration from src/config/firebase.js
const firebaseConfig = {
  authDomain: "lickxemmoithu.firebaseapp.com", 
  projectId: "lickxemmoithu", 
  storageBucket: "lickxemmoithu.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function dumpTelemetry() {
  try {
    const querySnapshot = await getDocs(collection(db, 'unknown_teams'));
    
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Found ${results.length} unknown_teams records:`);
    console.log(JSON.stringify(results, null, 2));

    // Exit cleanly
    process.exit(0);

  } catch (error) {
    console.error("Error reading from Firebase:", error);
    process.exit(1);
  }
}

dumpTelemetry();
