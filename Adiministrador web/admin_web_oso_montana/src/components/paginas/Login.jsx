
import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coffee, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { FirebaseContext } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import oso_montana_logo from '../../assets/oso_montana_logo.png'; // Ajusta la ruta según la ubicación de tu componente


export default function Component() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { auth, db } = useContext(FirebaseContext)
  const navigate = useNavigate()

  // Función para validar los caracteres permitidos
const validateInput = (input) => {
  const regex = /^[a-zA-Z0-9@.]*$/; // Solo permite letras, números, @ y puntos
  return regex.test(input);
}



const validatePassword = (password) => {
  // Expresión regular para permitir letras, números y algunos caracteres especiales
  const regex = /^[A-Za-z0-9@#$%^&+=!*]*$/;
  return regex.test(password); // Devuelve true si es válida, false si no lo es
};


const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const rol = docSnap.data().rol;
      if (rol === "administrador") {
        navigate('/');
      } else {
        setError("No tienes permiso para acceder a esta página.");
        await auth.signOut();
      }
    } else {
      setError("Usuario no encontrado en la base de datos.");
      await auth.signOut();
    }
  } catch (error) {
    // Manejando errores específicos de Firebase Authentication
    switch (error.code) {
      case 'auth/user-not-found':
        setError("No se encontró ningún usuario con este correo.");
        break;
      case 'auth/wrong-password':
        setError("La contraseña es incorrecta.");
        break;
      case 'auth/invalid-email':
        setError("El formato del correo es inválido.");
        break;
      default:
        setError("el usuario no esta registrado o la contraseña es invalida");
        break;
    }
  } finally {
    setIsLoading(false);
  }
};

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-100 rounded-3xl shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] p-12 max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className="bg-[#902a35] p-6 rounded-full inline-block shadow-[inset_5px_5px_10px_#902a35,inset_-5px_-5px_10px_#902a35]"
          >
            <img src={oso_montana_logo} alt="Coffee" className="h-20 w-20 rounded-full" />
          </motion.div>
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900">Oso de  la montaña </h2>
          <p className="mt-2 text-sm text-gray-600">Inicia sesión  como administrador </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#853030] focus:border-transparent focus:z-10 sm:text-sm transition duration-300 ease-in-out shadow-[inset_2px_2px_5px_#bebebe,inset_-3px_-3px_7px_#ffffff]"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (validateInput(value)) {
                      setEmail(value); // Actualiza el estado solo si es válido
                      setError(null); // Limpia el mensaje de error
                    } else {
                      setError("El correo contiene caracteres no permitidos."); // Mensaje de error si el input no es válido
                    }
                  }}/>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#853030] focus:border-transparent focus:z-10 sm:text-sm transition duration-300 ease-in-out shadow-[inset_2px_2px_5px_#bebebe,inset_-3px_-3px_7px_#ffffff]"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (validatePassword(value)) {
                      setPassword(value); // Actualiza el estado si la contraseña es válida
                      setError(null); // Limpia el mensaje de error
                    } else {
                      setError("La contraseña contiene caracteres no permitidos."); // Mensaje de error
                    }
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#853030] focus:ring-[#853030] border-gray-300 rounded shadow-[inset_1px_1px_2px_#bebebe,inset_-1px_-1px_2px_#ffffff]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Recuérdame
              </label>
            </div>

            <div className="text-sm">
              <a href="#"
                onClick={() => navigate('/recuperar-contraseña')} className="font-medium text-[#853030] hover:text-[#ff9966] transition duration-300 ease-in-out">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-gray-400' : 'bg-[#902a35]'
                } hover:bg-[#902a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#902a35] transition duration-300 ease-in-out transform hover:scale-105 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </div>

        </form>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center shadow-[inset_2px_2px_5px_#f8d7da,inset_-2px_-2px_5px_#fff5f5]"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}