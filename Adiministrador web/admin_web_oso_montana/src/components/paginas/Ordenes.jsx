import React, { useEffect, useState, useContext } from 'react';
import { FirebaseContext } from '../../firebase'; // Asegúrate de que FirebaseContext exporta `db`
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Importa los métodos correctos de Firestore
import Orden from '../ui/Orden';

const Ordenes = () => {

    // context con las operaciones de firebase
    const { db } = useContext(FirebaseContext); // Asegúrate de que db está en el contexto

    // state con las ordenes
    const [ordenes, guardarOrdenes] = useState([]);

    useEffect(() => {
        const obtenerOrdenes = () => {
            const q = query(collection(db, 'ordenes'), where('completado', '==', false));
            const unsubscribe = onSnapshot(q, manejarSnapshot); // Usa `onSnapshot` con la consulta

            return unsubscribe; // Devuelve la función para limpiar el listener al desmontar el componente
        }

        if (db) {
            obtenerOrdenes();
        }
    }, [db]); // Asegúrate de que `db` es parte de las dependencias

    function manejarSnapshot(snapshot) {
        const ordenes = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                ...doc.data()
            };
        });

        guardarOrdenes(ordenes);
    }

    return ( 
        <>
            <h1 className="text-3xl font-light mb-4">Ordenes</h1>

            <div className="sm:flex sm:flex-wrap -mx-3">
                {ordenes.map(orden => (
                    <Orden
                        key={orden.id}
                        orden={orden}
                    />
                ))}
            </div>
        </>
     );
}

export default Ordenes;
