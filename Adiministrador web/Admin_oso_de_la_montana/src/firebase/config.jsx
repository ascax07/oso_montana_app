// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';



const firebaseConfig = {
    apiKey: "AIzaSyDZau1l-3qExz_VI9_kb1TdtME1vAEXHC4",
    authDomain: "restaurante-90728.firebaseapp.com",
    projectId: "restaurante-90728",
    storageBucket: "restaurante-90728.appspot.com",
    messagingSenderId: "367777823169",
    appId: "1:367777823169:web:6503eed915867aa6de5740",
    measurementId: "G-S1F3WDCB2R"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    export { app, auth, db, storage };