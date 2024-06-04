import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './config';

class Firebase {
    constructor() {
        // Inicializa la app solo si no hay ninguna inicializada
        if (!getApps().length) {
            initializeApp(firebaseConfig);
        }
        
        // Obtén la instancia de Firestore
        this.db = getFirestore(getApp());
    }
}

const firebase = new Firebase();
export default firebase;