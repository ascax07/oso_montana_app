import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore'; // Importar las funciones correctas
import Platillo from "../ui/Platillo";
import CategoriaPlatillo from '../../components/paginas/filtroCategorias/CategoriaPlatillo';
import { motion } from 'framer-motion';


const Menu = () => {
    // Definir el state para los platillos
    const [platillos, guardarPlatillos] = useState([]);
    const [platillosFiltrados, guardarPlatillosFiltrados] = useState([]);

    const { db } = useContext(FirebaseContext);

    // Consultar la base de datos al cargar
    useEffect(() => {
        const obtenerPlatillos = () => {
            if (db) {
                const productosCollection = collection(db, 'productos'); // Usar 'collection' para obtener la referencia
                onSnapshot(productosCollection, manejarSnapshot); // Usar 'onSnapshot' con la referencia de la colección
            }
        };
        obtenerPlatillos();
    }, [db]);

    // Snapshot para manejar los datos en tiempo real
    function manejarSnapshot(snapshot) {
        const platillos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Guardar los resultados en el state
        guardarPlatillos(platillos);
        guardarPlatillosFiltrados(platillos);  // Inicialmente mostrar todos
    }

    // Filtrar los platillos por categoría
    const filtrarCategoria = (categoria, searchQuery) => {
        let platillosFiltrados = platillos;
    
        if (categoria) {
            platillosFiltrados = platillosFiltrados.filter(platillo => platillo.categoria === categoria);
        }
    
        if (searchQuery) {
            platillosFiltrados = platillosFiltrados.filter(platillo =>
                platillo.nombre.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    
        guardarPlatillosFiltrados(platillosFiltrados);
    };
    
    return (
        <>
             <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full px-3 mb-4"
    >
            <h1 className="flex flex-wrap items-center bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg">Menú</h1>
            <Link to="/nuevo-platillo" className="flex-1 inline-flex justify-center items-center px-4 py-3 mb-5 mt-5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Agregar Platillo
            </Link>

            {/* Componente de categorías para filtrar */}
            <CategoriaPlatillo filtrarCategoria={filtrarCategoria} />

            {/* Pasar platillosFiltrados al componente Platillo */}
            {platillosFiltrados.length > 0 && (
                <Platillo platillos={platillosFiltrados} />
            )}
            </motion.div>
        </>
    );
};

export default Menu;
