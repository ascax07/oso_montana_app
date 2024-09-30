import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore'; // Importar las funciones correctas
import Platillo from "../ui/Platillo";
import CategoriaPlatillo from '../../components/paginas/filtroCategorias/CategoriaPlatillo';

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
    const filtrarCategoria = categoria => {
        if (categoria) {
            const platillosFiltrados = platillos.filter(platillo => platillo.categoria === categoria);
            guardarPlatillosFiltrados(platillosFiltrados);
        } else {
            guardarPlatillosFiltrados(platillos); // Mostrar todos si no hay filtro
        }
    };

    return (
        <>
            <h1 className="text-3xl font-light mb-4">Menú</h1>
            <Link to="/nuevo-platillo" className="bg-blue-800 hover:bg-blue-700 inline-block mb-5 p-2 text-white uppercase font-bold">
                Agregar Platillo
            </Link>

            {/* Componente de categorías para filtrar */}
            <CategoriaPlatillo filtrarCategoria={filtrarCategoria} />

            {platillosFiltrados.map(platillo => (
                <Platillo key={platillo.id} platillo={platillo} />
            ))}
        </>
    );
};

export default Menu;
