import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../firebase';
import { ThemeContext } from '../ui/ThemeContext';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { motion } from 'framer-motion';
import { UsersIcon } from 'lucide-react';

const Usuarios = () => {
    const { db } = useContext(FirebaseContext);
    const { darkMode } = useContext(ThemeContext);
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const obtenerUsuarios = () => {
            const usuariosCollection = collection(db, 'usuarios');
            onSnapshot(usuariosCollection, (snapshot) => {
                const usuariosData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const usuariosFiltrados = usuariosData.filter(usuario => 
                    usuario.rol === 'mesero' || usuario.rol === 'cocinero'
                );

                setUsuarios(usuariosFiltrados);
            });
        };

        obtenerUsuarios();
    }, [db]);
    
    const actualizarEstadoActivo = async (id, nuevoEstado) => {
        try {
            const usuarioRef = doc(db, 'usuarios', id);
            await updateDoc(usuarioRef, { activo: nuevoEstado });
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
        }
    };

    const estadoBodyTemplate = (data) => (
        <select
            className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'} shadow appearance-none border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`}
            value={data.activo ? "true" : "false"}
            onChange={(e) => actualizarEstadoActivo(data.id, e.target.value === "true")}
        >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
        </select>
    );

    const header = (
        <div className="flex flex-wrap items-center bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg">
            <div className="flex items-center">
                <UsersIcon size={24} className="mr-2" />
                <span className="text-2xl font-bold">Usuarios Registrados</span>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full px-3 mb-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
        >
            <div className={`p-5 shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg hover:shadow-xl transition-shadow duration-300`}>
                <DataTable 
                    value={usuarios} 
                    paginator 
                    rows={5} 
                    rowsPerPageOptions={[5, 10, 25]}
                    header={header}
                    className={`rounded-lg overflow-hidden ${darkMode ? 'p-datatable-dark' : ''}`}
                    rowClassName={() => darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'hover:bg-gray-100'}
                    paginatorClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                >
                    <Column 
                        field="nombre" 
                        header="Nombre" 
                        headerClassName={darkMode ? 'bg-gray-800 text-gray-200 border-b border-gray-700' : ''}
                        bodyClassName={darkMode ? 'bg-gray-700 text-gray-200 border-b border-gray-600' : ''}
                    />
                    <Column 
                        field="email" 
                        header="Correo" 
                        headerClassName={darkMode ? 'bg-gray-800 text-gray-200 border-b border-gray-700' : ''}
                        bodyClassName={darkMode ? 'bg-gray-700 text-gray-200 border-b border-gray-600' : ''}
                    />
                    <Column 
                        field="rol" 
                        header="Rol" 
                        headerClassName={darkMode ? 'bg-gray-800 text-gray-200 border-b border-gray-700' : ''}
                        bodyClassName={darkMode ? 'bg-gray-700 text-gray-200 border-b border-gray-600' : ''}
                    />
                    <Column 
                        header="Estado" 
                        body={estadoBodyTemplate}
                        headerClassName={darkMode ? 'bg-gray-800 text-gray-200 border-b border-gray-700' : ''}
                        bodyClassName={darkMode ? 'bg-gray-700 text-gray-200 border-b border-gray-600' : ''}
                    />
                </DataTable>
            </div>
        </motion.div>
    );
};

export default Usuarios;