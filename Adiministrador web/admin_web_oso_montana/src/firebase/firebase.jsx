import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDZau1l-3qExz_VI9_kb1TdtME1vAEXHC4",
  authDomain: "restaurante-90728.firebaseapp.com",
  projectId: "restaurante-90728",
  storageBucket: "restaurante-90728.appspot.com",
  messagingSenderId: "367777823169",
  appId: "1:367777823169:web:6503eed915867aa6de5740",
  measurementId: "G-S1F3WDCB2R"
};

// Inicializa Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Inicializa los servicios de Firebase
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// Exporta los servicios individualmente
export { auth, db, storage };
