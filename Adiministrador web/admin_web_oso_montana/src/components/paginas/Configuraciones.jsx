import React, { useContext, useState, useRef, useEffect } from 'react';
import { FirebaseContext } from '../../firebase';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ThemeContext } from '../ui/ThemeContext';

export default function Component() {
  const { auth, db } = useContext(FirebaseContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const toast = useRef(null);

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      const usuario = auth.currentUser;
      if (usuario) {
        setCorreo(usuario.email);
        try {
          const docRef = doc(db, 'usuarios', usuario.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setNuevoNombre(docSnap.data().nombre);
          } else {
            console.log('No se encontró el documento del usuario.');
          }
        } catch (error) {
          console.error('Error al acceder a la colección usuarios:', error);
        }
      }
    };
    obtenerDatosUsuario();
  }, [auth, db]);

  const manejarActualizarNombre = async () => {
    if (editandoNombre) {
      const docRef = doc(db, 'usuarios', auth.currentUser.uid);
      await setDoc(docRef, { nombre: nuevoNombre }, { merge: true });
      toast.current.show({ severity: 'success', summary: 'Nombre actualizado', detail: 'El nombre se ha cambiado con éxito', life: 3000 });
    }
    setEditandoNombre(!editandoNombre);
  };

  const manejarReinicioContrasena = () => {
    setMostrarDialogo(true);
  };

  const aceptarCambioContrasena = async () => {
    await sendPasswordResetEmail(auth, correo);
    toast.current.show({ severity: 'success', summary: 'Correo enviado', detail: 'Se ha enviado un correo para cambiar la contraseña', life: 3000 });
    setMostrarDialogo(false);
  };

  const rechazarCambioContrasena = () => {
    setMostrarDialogo(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert("Sesión cerrada con éxito");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog
        visible={mostrarDialogo}
        onHide={() => setMostrarDialogo(false)}
        message="¿Está seguro de que desea cambiar su contraseña?"
        header="Confirmación"
        icon="pi pi-exclamation-triangle"
        accept={aceptarCambioContrasena}
        reject={rechazarCambioContrasena}
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} min-h-screen`}
      >
        <motion.h1
          className={`text-4xl font-bold mb-8 text-center ${darkMode ? 'text-red-400' : 'text-[#902a35]'}`}
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          Configuraciones
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-red-400' : 'text-[#902a35]'}`}>Gestión de Cuenta</h2>
            <Divider className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>
          <motion.div
            className="space-y-6"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <label htmlFor="nuevoNombre" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre</label>
              <div className="flex items-center">
                <InputText 
                  id="nuevoNombre" 
                  value={nuevoNombre} 
                  onChange={(e) => setNuevoNombre(e.target.value)} 
                  disabled={!editandoNombre} 
                  className={`flex-grow mr-2 p-2 border-2 ${darkMode ? 'border-red-400 bg-gray-800 text-white' : 'border-[#902a35] bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-[#902a35] transition-all duration-300`} 
                />
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    label={editandoNombre ? "Confirmar" : "Actualizar"} 
                    icon="pi pi-user" 
                    onClick={manejarActualizarNombre} 
                    className={`${darkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-[#902a35] hover:bg-[#7a232d]'} text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out`} 
                  />
                </motion.div>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Actualice su nombre para personalizar su perfil.</p>
            </div>
            <div>
              <label htmlFor="nuevaContrasena" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contraseña</label>
              <div className="flex items-center">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    label="Cambiar" 
                    onClick={manejarReinicioContrasena} 
                    icon="pi pi-lock" 
                    className={`${darkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-[#902a35] hover:bg-[#7a232d]'} text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out`} 
                  />
                </motion.div>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Se le enviara un correo al realizar esta acción y se cerrará la sesión</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Por seguridad, cambie su contraseña regularmente.</p>
            </div>
          </motion.div>
          <motion.div
            className="space-y-6"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <label htmlFor="newEmail" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Correo Electrónico</label>
              <div className="flex items-center">
                <InputText 
                  id="correo" 
                  value={correo} 
                  disabled 
                  className={`flex-grow mr-2 p-2 border-2 ${darkMode ? 'border-red-400 bg-gray-800 text-white' : 'border-[#902a35] bg-white text-gray-800'} rounded-lg focus:ring-2 focus:ring-[#902a35] transition-all duration-300`} 
                />
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    label="" 
                    icon="pi pi-envelope" 
                    className={`${darkMode ? 'bg-red-500 hover:bg-red-600' : 'bg-[#902a35] hover:bg-[#7a232d]'} text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out`} 
                  />
                </motion.div>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Mantenga su correo electrónico actualizado para recibir notificaciones importantes.</p>
            </div>
          </motion.div>
          <div className="col-span-1 md:col-span-2 mt-8">
            <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-red-400' : 'text-[#902a35]'}`}>Preferencias de la Aplicación</h2>
            <Divider className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>
          <motion.div
            className="col-span-1 md:col-span-2"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tema de la Interfaz</h3>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                label={darkMode ? "Cambiar a Tema Claro" : "Cambiar a Tema Oscuro"}
                icon={darkMode ? "pi pi-sun" : "pi pi-moon"}
                onClick={toggleTheme}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-800'} font-bold py-2 px-4 rounded`}
              />
            </motion.div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Personalice la apariencia de la aplicación según su preferencia.</p>
          </motion.div>
          <div className="col-span-1 md:col-span-2 mt-8">
            <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-red-400' : 'text-[#902a35]'}`}>Políticas y Condiciones</h2>
            <Divider className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>
          <motion.div
            className="col-span-1 md:col-span-1"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                label="Ver Política de Privacidad" 
                icon="pi pi-file" 
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-bold py-2 px-4 rounded transition duration-300 ease-in-out`} 
              />
            </motion.div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Revise nuestra política de privacidad para entender cómo protegemos sus datos.</p>
          </motion.div>
          <motion.div
            className="col-span-1 md:col-span-1"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                label="Ver Términos de Servicio" 
                icon="pi pi-file-o" 
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-bold py-2 px-4 rounded transition duration-300 ease-in-out`} 
              />
            </motion.div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Lea nuestros términos de servicio para conocer sus derechos y responsabilidades.</p>
          </motion.div>
          <motion.div
            className="col-span-1 md:col-span-2  mt-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                label="Cerrar Sesión"
                icon="pi pi-sign-out"
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}