import React, { useContext } from 'react';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';
import Usuarios from '../ui/Usuarios';
import { FirebaseContext } from '../../firebase'; // Contexto de Firebase


export default function Configuraciones() {
  const { auth } = useContext(FirebaseContext);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert("Sesión cerrada con éxito");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Configuraciones</h1>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mb-8"
      >
      <Button
        label="Cerrar Sesión"
        icon="pi pi-sign-out"
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-4"
      />
       </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Usuarios />
      </motion.div>
    </motion.div>
  );
}
