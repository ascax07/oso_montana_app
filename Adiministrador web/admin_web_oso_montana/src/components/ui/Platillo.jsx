import React, { useContext, useState, useRef } from 'react';
import { FirebaseContext } from '../../firebase';
import { Link } from 'react-router-dom';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Coffee } from 'lucide-react';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Toast } from 'primereact/toast';
import { ThemeContext } from '../ui/ThemeContext';

export default function Platillo({ platillos = [] }) {
    const { db } = useContext(FirebaseContext);
    const { darkMode } = useContext(ThemeContext);
    const [platilloAEliminar, setPlatilloAEliminar] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    const actualizarDisponibilidad = async (id, nuevaExistencia) => {
        try {
            const platilloRef = doc(db, 'productos', id);
            await updateDoc(platilloRef, { existencia: nuevaExistencia });
        } catch (error) {
            console.error('Error al actualizar disponibilidad:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al actualizar disponibilidad', life: 3000 });
        }
    };

    const eliminarPlatillo = (platillo) => {
        setPlatilloAEliminar(platillo);
        setDialogVisible(true);
    };

    const handleConfirmDelete = async () => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'productos', platilloAEliminar.id));
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Platillo eliminado con éxito', life: 3000 });
            setPlatilloAEliminar(null);
        } catch (error) {
            console.error('Error eliminando el platillo:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al eliminar el platillo', life: 3000 });
        } finally {
            setLoading(false);
            setDialogVisible(false);
        }
    };

    const handleCancelDelete = () => {
        setPlatilloAEliminar(null);
        setDialogVisible(false);
        toast.current.show({ severity: 'info', summary: 'Cancelado', detail: 'La acción de eliminación ha sido cancelada', life: 3000 });
    };

    const nameBodyTemplate = (data) => (
        <div className={`font-bold text-lg break-words max-w-28 ${darkMode ? 'text-gray-200' : 'text-black'}`}>{data.nombre}</div>
    );

    const descripcionBodyTemplate = (data) => (
        <div className={`break-words max-w-28 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{data.descripcion}</div>
    );

    const imageBodyTemplate = (data) => (
        <motion.img
            src={data.imagen}
            alt="imagen platillo"
            className={`w-24 h-24 object-cover rounded-lg shadow-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'} hover:scale-105 transition-transform duration-300`}
            whileHover={{ scale: 1.05 }}
        />
    );

    const priceBodyTemplate = (data) => (
        <span className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-black'}`}>
            {data.precio.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
        </span>
    );

    const stockBodyTemplate = (data) => {
        if (!data.stock) {
            return (
                <div className={`${darkMode ? 'bg-blue-900 text-gray-200' : 'bg-blue-200 text-black'} shadow border rounded-full w-full py-2 px-3 leading-tight focus:outline-none transition-colors`}>
                    preparación
                </div>
            );
        }
        return <div className={`font-bold text-lg break-words max-w-28 ${darkMode ? 'text-gray-200' : 'text-black'}`}>{data.stock}</div>;
    };

    const actionBodyTemplate = (data) => (
        <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                    to={`/editar-platillo/${data.id}`}
                    className={`${darkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-[#304b85] hover:bg-[#275f6d]'} text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300`}
                >
                    <Edit2 size={18} className="mr-2" />
                    Editar
                </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    icon={<Trash2 size={18} className="mr-2" />}
                    label="Eliminar"
                    className={`${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-[#853030] hover:bg-[#6d2727]'} text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300`}
                    onClick={() => eliminarPlatillo(data)}
                    disabled={loading}
                />
            </motion.div>
        </div>
    );

    const existenciaBodyTemplate = (data) => (
        <select
            className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-black'} shadow appearance-none border rounded-full w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300`}
            value={data.existencia ? "true" : "false"}
            onChange={(e) => actualizarDisponibilidad(data.id, e.target.value === "true")}
        >
            <option value="true">Disponible</option>
            <option value="false">No Disponible</option>
        </select>
    );

    const header = (
        <div className="flex flex-wrap items-center bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg">
            <div className="flex items-center">
                <Coffee size={24} className="mr-2" />
                <span className="text-2xl font-bold">Lista de Platillos</span>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full px-3 mb-4"
        >
            <Toast ref={toast} />
            <div className={`p-5 shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg hover:shadow-xl transition-shadow duration-300`}>
                <DataTable
                    value={platillos} 
                    header={header}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    tableStyle={{ minWidth: '60rem' }}
                    className={`rounded-lg overflow-hidden ${darkMode ? 'p-datatable-dark' : ''}`}
                    rowClassName={() => darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-100'}
                    paginatorClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} platillos"
                    emptyMessage={<p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No se encontraron platillos.</p>}
                >
                    <Column header="Platillo" body={imageBodyTemplate} headerClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} bodyClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} />
                    <Column header="Nombre" body={nameBodyTemplate} headerClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} bodyClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} />
                    <Column header="Descripción" body={descripcionBodyTemplate} headerClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} bodyClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} />
                    <Column header="Precio" body={priceBodyTemplate} headerClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} bodyClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} />
                    <Column header="Stock" body={stockBodyTemplate} headerClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} bodyClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} />
                    <Column header="Existencia" body={existenciaBodyTemplate} headerClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} bodyClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} />
                    <Column header="Acciones" body={actionBodyTemplate} headerClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} bodyClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''} />
                </DataTable>
            </div>
            <ConfirmDialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                message="¿Estás seguro que deseas eliminar este platillo?"
                header="Confirmar Eliminación"
                icon="pi pi-info-circle"
                accept={handleConfirmDelete}
                reject={handleCancelDelete}
                acceptClassName={`${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-[#853030] hover:bg-[#6d2727]'} text-white`}
                rejectClassName={darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : ''}
                className={darkMode ? 'bg-gray-800 text-gray-200' : ''}
                footer={
                    <div className="flex justify-between">
                        <Button
                            label="Cancelar"
                            onClick={handleCancelDelete}
                            className={`mr-2 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : ''}`}
                        />
                        <Button
                            label="Eliminar"
                            onClick={handleConfirmDelete}
                            className={`${darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-[#853030] hover:bg-[#6d2727]'} text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300`}
                            disabled={loading}
                        />
                    </div>
                }
            />
        </motion.div>
    );
}