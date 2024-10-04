import React, { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FirebaseContext } from '../../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Mail, AlertCircle } from 'lucide-react';
import oso_montana_logo from '../../assets/oso_montana_logo.png';

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { auth, db } = useContext(FirebaseContext);
  const navigate = useNavigate();
  const toast = useRef(null);


    // Función para validar los caracteres permitidos
const validateInput = (input) => {
  const regex = /^[a-zA-Z0-9@.]*$/; // Solo permite letras, números, @ y puntos
  return regex.test(input);
}

// Función modificada para manejar el cambio en el campo de correo
const handleEmailChange = (e) => {
  const value = e.target.value;
  if (validateInput(value)) {
    setEmail(value);
    setError(null);
  } else {
    setError("El correo contiene caracteres no permitidos.");
  }
};

  const showConfirmDialog = () => {
    confirmDialog({
      message: '¿Estás seguro de que quieres restablecer tu contraseña?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: handlePasswordReset,
      reject: () => {},
      acceptLabel: 'Sí, restablecer',
      rejectLabel: 'Cancelar'
    });
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const q = query(collection(db, "usuarios"), where("email", "==", email), where("rol", "==", "administrador"));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await sendPasswordResetEmail(auth, email);
        toast.current.show({severity:'success', summary: 'Éxito', detail:'Se ha enviado un correo para restablecer la contraseña.', life: 3000});
        
        setTimeout(() => {
          setIsLoading(false);
          navigate('/login');
        }, 5000);
      } else {
        setError('No hay un administrador registrado con este correo.');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Hubo un error al procesar la solicitud. Inténtalo de nuevo más tarde.');
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <Toast ref={toast} position="top-center" />
      <ConfirmDialog />
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
            <img src={oso_montana_logo} alt="Oso de la montaña" className="h-20 w-20 rounded-full" />
          </motion.div>
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900">Recuperar Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresa tu correo electrónico para restablecer tu contraseña</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); showConfirmDialog(); }} className="mt-8 space-y-6">
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
                  }}                />
              </div>
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-gray-400' : 'bg-[#902a35]'
              } hover:bg-[#902a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#902a35] transition duration-300 ease-in-out transform hover:scale-105 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Restablecer Contraseña'
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
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-gray-300 text-black font-semibold rounded-lg hover:bg-gray-400 transition duration-300 ease-in-out transform hover:scale-105 shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff]"
          >
            Volver a Iniciar Sesión
          </button>
        </div>
      </motion.div>
    </div>
  );
}