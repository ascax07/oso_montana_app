// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBymuWRaLpQ-mV8sH0WMaDMCySJWy3ZN7c",
  authDomain: "login-proyecto-eba86.firebaseapp.com",
  projectId: "login-proyecto-eba86",
  storageBucket: "login-proyecto-eba86.appspot.com",
  messagingSenderId: "670741447305",
  appId: "1:670741447305:web:729726b6adcb03c287bc58"
};

// Initialize Firebase  
const appFirebase = initializeApp(firebaseConfig);
export default appFirebase