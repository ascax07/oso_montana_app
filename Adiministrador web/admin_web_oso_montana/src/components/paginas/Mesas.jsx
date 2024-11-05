import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import Mesa from '../ui/Mesa';
import CategoriaMesas from '../paginas/filtroCategorias_busquedas/CategoriaMesas';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { motion } from 'framer-motion';
import { ThemeContext } from '../ui/ThemeContext';

const Mesas = () => {
    const [mesas, guardarMesas] = useState([]);
    const [mesasFiltradas, guardarMesasFiltradas] = useState([]);
    const { db } = useContext(FirebaseContext);
    const { darkMode } = useContext(ThemeContext);

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
            const mesaRef = doc(db, 'mesas', id);
            await updateDoc(mesaRef, { disponible: nuevaDisponibilidad });
        } catch (error) {
            console.error('Error al actualizar disponibilidad:', error);
        }
    };

    const disponibilidadBodyTemplate = (data) => (
        <div
            className={`shadow border rounded-full w-full py-2 px-3 leading-tight focus:outline-none transition-colors duration-300 ${data.disponible
                    ? (darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800")
                    : (darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800")
                }`}
        >
            {data.disponible ? "Disponible" : "Ocupada"}
        </div>
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
            className={`w-full px-3 mb-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
        >
            <>
                <h1 className="flex mb-5 flex-wrap items-center bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg">Mesas</h1>

                <Link
                    to="/nueva-mesa"
                    className={`flex-1 inline-flex justify-center items-center px-4 py-3 mb-5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${darkMode
                            ? 'bg-red-700 hover:bg-red-600'
                            : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                    Agregar Mesa
                </Link>

                <CategoriaMesas filtrarCategoria={filtrarCategoria} />

                <div className="w-full px-3 mb-4">
                    <div className={`p-5 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                        <DataTable
                            value={mesasFiltradas}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 20]}
                            className={`${darkMode ? 'p-datatable-dark' : ''}`}
                            emptyMessage={<p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No se encontraron mesas</p>}
                            style={{
                                backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                color: darkMode ? '#F3F4F6' : '#111827',
                            }}
                            paginatorClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} mesas"
                        >
                            <Column
                                field="numero"
                                header="Número"
                                style={{
                                    backgroundColor: darkMode ? '#374151' : '#F3F4F6',
                                    color: darkMode ? '#F3F4F6' : '#111827',
                                }}
                            ></Column>
                            <Column
                                field="capacidad"
                                header="Capacidad"
                                style={{
                                    backgroundColor: darkMode ? '#374151' : '#F3F4F6',
                                    color: darkMode ? '#F3F4F6' : '#111827',
                                }}
                            ></Column>
                            <Column
                                field="ubicacion"
                                header="Ubicación"
                                style={{
                                    backgroundColor: darkMode ? '#374151' : '#F3F4F6',
                                    color: darkMode ? '#F3F4F6' : '#111827',
                                }}
                            ></Column>
                            <Column
                                header="Disponibilidad"
                                body={disponibilidadBodyTemplate}
                                style={{
                                    backgroundColor: darkMode ? '#374151' : '#F3F4F6',
                                    color: darkMode ? '#F3F4F6' : '#111827',
                                }}
                            ></Column>
                            <Column
                                header="Acciones"
                                body={(data) => <Mesa mesa={data} />}
                                style={{
                                    backgroundColor: darkMode ? '#374151' : '#F3F4F6',
                                    color: darkMode ? '#F3F4F6' : '#111827',
                                }}
                            ></Column>
                        </DataTable>
                    </div>
                </div>
            </>
        </motion.div>
    );
};

export default Mesas;