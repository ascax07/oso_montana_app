import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Mesa from '../ui/Mesa';
import CategoriaMesas from '../paginas/filtroCategorias/CategoriaMesas';

const Mesas = () => {
  const [mesas, guardarMesas] = useState([]);
  const [mesasFiltradas, guardarMesasFiltradas] = useState([]);
  const { firebase } = useContext(FirebaseContext);

  useEffect(() => {
    const obtenerMesas = () => {
      const unsuscribe = collection(firebase.db, 'mesas');
      onSnapshot(unsuscribe, manejarSnapshot);
    };
    obtenerMesas();
  }, [firebase]);

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
