import React, { useState, useContext } from 'react';
import { FirebaseContext } from '../../firebase'; // Asegúrate de tener tu contexto de Firebase
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Autenticación de Firebase
import { doc, getDoc } from 'firebase/firestore'; // Firestore

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { auth, db } = useContext(FirebaseContext); // Extraemos auth y db del contexto
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Autenticación del usuario con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar el rol del usuario en Firestore
      const docRef = doc(db, "usuarios", user.uid); // Obtenemos el documento de la colección "usuarios"
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const rol = docSnap.data().rol;

        if (rol === "administrador") {
          // Si el rol es "administrador", redirigimos a la página principal
          navigate('/');
        } else {
          // Si no es administrador, mostramos un mensaje de error y cerramos la sesión
          setError("No tienes permiso para acceder a esta página.");
          await auth.signOut(); // Cerramos sesión automáticamente
        }
      } else {
        setError("Usuario no encontrado en la base de datos.");
        await auth.signOut(); // Cerrar sesión si no se encuentra el usuario en Firestore
      }
    } catch (error) {
      // Manejamos cualquier error de autenticación
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
};

export default Login;
