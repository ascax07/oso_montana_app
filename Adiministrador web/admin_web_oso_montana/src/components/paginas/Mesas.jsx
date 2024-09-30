import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'; // Add doc and updateDoc
import Mesa from '../ui/Mesa';
import CategoriaMesas from '../paginas/filtroCategorias/CategoriaMesas';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { motion } from 'framer-motion';

const Mesas = () => {
    const [mesas, guardarMesas] = useState([]);
    const [mesasFiltradas, guardarMesasFiltradas] = useState([]);
    const { db } = useContext(FirebaseContext);

    useEffect(() => {
        const obtenerMesas = () => {
            if (db) {
                const mesasCollection = collection(db, 'mesas');
                onSnapshot(mesasCollection, manejarSnapshot);
            }
        };
        obtenerMesas();
    }, [db]);

    function manejarSnapshot(snapshot) {
        const mesas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        guardarMesas(mesas);
        guardarMesasFiltradas(mesas);
    }

    
    const actualizarDisponibilidad = async (id, nuevaDisponibilidad) => {
        try {
            const mesaRef = doc(db, 'mesas', id); // Use doc to reference the specific table
            await updateDoc(mesaRef, { disponible: nuevaDisponibilidad }); // Update the availability
        } catch (error) {
            console.error('Error al actualizar disponibilidad:', error);
        }
    };
    const disponibilidadBodyTemplate = (data) => (
        <select
            className="bg-white shadow appearance-none border rounded-full w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300"
            value={data.disponible ? "true" : "false"}
            onChange={(e) => actualizarDisponibilidad(data.id, e.target.value === "true")}
        >
            <option value="true">Disponible</option>
            <option value="false">No Disponible</option>
        </select>
    );

    const filtrarCategoria = (ubicacion, query) => {
        let mesasFiltradas = mesas;

        if (ubicacion) {
            mesasFiltradas = mesasFiltradas.filter(mesa => mesa.ubicacion === ubicacion);
        }

        if (query) {
            mesasFiltradas = mesasFiltradas.filter(mesa =>
                mesa.numero.toString().includes(query) ||
                mesa.capacidad.toString().includes(query)
            );
        }

        guardarMesasFiltradas(mesasFiltradas);
    };

    return (
        <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full px-3 mb-4"
    >
        <>
            <h1 className="flex mb-5 flex-wrap items-center bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg">Mesas</h1>

            <Link
                to="/nueva-mesa"
                className="flex-1  inline-flex justify-center items-center px-4 py-3 mb-5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Agregar Mesa
            </Link>

            <CategoriaMesas filtrarCategoria={filtrarCategoria} />

            <div className="w-full px-3 mb-4">
                <div className="p-5 shadow-md bg-white rounded-lg">
                    <DataTable value={mesasFiltradas} paginator rows={10} rowsPerPageOptions={[5, 10, 20]}>
                        <Column field="numero" header="Número"></Column>
                        <Column field="capacidad" header="Capacidad"></Column>
                        <Column field="ubicacion" header="Ubicación"></Column>
                        <Column header="Disponibilidad" body={disponibilidadBodyTemplate}></Column>

                        <Column
                            header="Acciones"
                            body={(data) => <Mesa mesa={data} />}
                        ></Column>
                    </DataTable>
                </div>
            </div>
        </>
        </motion.div>
    );
};

export default Mesas;
