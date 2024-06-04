import app from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDZau1l-3qExz_VI9_kb1TdtME1vAEXHC4",
  authDomain: "restaurante-90728.firebaseapp.com",
  projectId: "restaurante-90728",
  storageBucket: "restaurante-90728.appspot.com",
  messagingSenderId: "367777823169",
  appId: "1:367777823169:web:6503eed915867aa6de5740",
  measurementId: "G-S1F3WDCB2R"
};

class Firebase {
  constructor() {
    if (!app.apps.length) {
      app.initializeApp(firebaseConfig);
    }
    this.db = app.firestore();
    this.storage = app.storage();
  }
}

const firebase = new Firebase();
export default firebase;
