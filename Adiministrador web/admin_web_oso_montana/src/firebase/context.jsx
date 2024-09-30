import { createContext } from 'react';
import { auth, db } from './firebase'; // Asegúrate de que 'auth' está bien importado

const FirebaseContext = createContext({ auth, db }); // Incluye 'auth'

export default FirebaseContext;
