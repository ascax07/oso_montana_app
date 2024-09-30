import React, { useContext } from 'react';
import { FirebaseContext } from '../../firebase'; // Asegúrate de importar tu contexto correctamente
import { useNavigate } from 'react-router-dom';

const Configuraciones = () => {
    const { auth } = useContext(FirebaseContext); // Asegúrate de que 'auth' esté disponible en el contexto
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            if (auth) {
                await auth.signOut(); // Llama a 'signOut' si 'auth' está disponible
                navigate('/login'); // Redirige al login después de cerrar sesión
            } else {
                console.error('Error: auth no está definido');
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-6">Configuraciones</h1>
            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
            >
                Cerrar Sesión
            </button>
        </div>
    );
};

export default Configuraciones;
