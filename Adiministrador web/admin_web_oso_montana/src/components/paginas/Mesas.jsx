import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Mesa from '../ui/Mesa';
import CategoriaMesas from '../paginas/filtroCategorias/CategoriaMesas';

const Mesas = () => {
  const [mesas, guardarMesas] = useState([]);
  const [mesasFiltradas, guardarMesasFiltradas] = useState([]);
  const { db } = useContext(FirebaseContext);



  useEffect(() => {
    const obtenerMesas = () => {
        if (db) {
            const mesasCollection = collection(db, 'mesas'); // Usar 'collection' para obtener la referencia
            onSnapshot(mesasCollection, manejarSnapshot); // Usar 'onSnapshot' con la referencia de la colección
        }
    };
    obtenerMesas();
}, [db]);


  function manejarSnapshot(snapshot) {
    const mesas = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    guardarMesas(mesas);
    guardarMesasFiltradas(mesas); // Inicialmente mostrar todas las mesas
  }

  const filtrarUbicacion = (ubicacion) => {
    if (ubicacion) {
      const mesasFiltradas = mesas.filter(mesa => mesa.ubicacion === ubicacion);
      guardarMesasFiltradas(mesasFiltradas);
    } else {
      guardarMesasFiltradas(mesas); // Mostrar todas si no hay filtro
    }
  };

  return (
    <>
      <h1 className="text-3xl font-light mb-4">Mesas</h1>
      <Link to="/nueva-mesa" className="bg-blue-800 hover:bg-blue-700 inline-block mb-5 p-2 text-white uppercase font-bold">
        Agregar Mesa
      </Link>

      {/* Componente de categorías para filtrar */}
      <CategoriaMesas filtrarUbicacion={filtrarUbicacion} />

      {mesasFiltradas.map(mesa => (
        <Mesa key={mesa.id} mesa={mesa} />
      ))}
    </>
  );
};

export default Mesas;
