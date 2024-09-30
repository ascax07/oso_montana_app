import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Agregamos esto

import firebaseConfig from './config';

class Firebase {
  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.auth = getAuth(app); // Instanciamos Auth
  }
}

const firebase = new Firebase();
export default firebase;
