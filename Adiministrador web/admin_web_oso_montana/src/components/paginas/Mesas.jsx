import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Mesa from '../ui/Mesa';

const Mesas = () => {
  // Definir el state para las mesas
  const [mesas, guardarMesas] = useState([]);

  const { firebase } = useContext(FirebaseContext);

  // Consultar la base de datos al cargar
  useEffect(() => {
    const obtenerMesas = () => {
      firebase.db.collection('mesas').onSnapshot(manejarSnapshot);
    };
    obtenerMesas();
  }, []);

  // Snapshot nos permite utilizar la base de datos en tiempo real de firestore
  function manejarSnapshot(snapshot) {
    const mesas = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    // Almacenar los resultados en el state
    guardarMesas(mesas);
  }

  return (
    <>
      <h1 className="text-3xl font-light mb-4">Mesas</h1>
      <Link to="/nueva-mesa" className="bg-blue-800 hover:bg-blue-700 inline-block mb-5 p-2 text-white uppercase font-bold">
        Agregar Mesa
      </Link>

      {mesas.map(mesa => (
        <Mesa key={mesa.id} mesa={mesa} />
      ))}
    </>
  );
};

export default Mesas;
