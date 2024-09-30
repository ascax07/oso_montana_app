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

const Platillo = ({ platillos }) => {
    const { db } = useContext(FirebaseContext);
    const [platilloAEliminar, setPlatilloAEliminar] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [loading, setLoading] = useState(false); // Estado para manejar la carga
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
        setLoading(true); // Inicia el estado de carga
        try {
            await deleteDoc(doc(db, 'productos', platilloAEliminar.id));
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Platillo eliminado con éxito', life: 3000 });
            setPlatilloAEliminar(null);
        } catch (error) {
            console.error('Error eliminando el platillo:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al eliminar el platillo', life: 3000 });
        } finally {
            setLoading(false); // Finaliza el estado de carga
            setDialogVisible(false);
        }
    };

    const handleCancelDelete = () => {
        setPlatilloAEliminar(null);
        setDialogVisible(false);
        toast.current.show({ severity: 'info', summary: 'Cancelado', detail: 'La acción de eliminación ha sido cancelada', life: 3000 });
    };

    const nameBodyTemplate = (data) => (
        <div className="font-bold text-lg break-words max-w-28">{data.nombre}</div>
    );

    const descripcionBodyTemplate = (data) => (
        <div className="text-gray-700 break-words max-w-28">{data.descripcion}</div>
    );

    const imageBodyTemplate = (data) => (
        <motion.img
            src={data.imagen}
            alt="imagen platillo"
            className="w-24 h-24 object-cover rounded-lg shadow-lg border border-gray-300 hover:scale-105 transition-transform duration-300"
            whileHover={{ scale: 1.05 }}
        />
    );

    const priceBodyTemplate = (data) => (
        <span className="text-lg font-semibold text-black">{data.precio.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
    );

    const actionBodyTemplate = (data) => (
        <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                    to={`/editar-platillo/${data.id}`}
                    className="bg-[#304b85] hover:bg-[#275f6d] text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300"
                >
                    <Edit2 size={18} className="mr-2" />
                    Editar
                </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                    icon={<Trash2 size={18} className="mr-2" />}
                    label="Eliminar"
                    className="bg-[#853030] hover:bg-[#6d2727] text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300"
                    onClick={() => eliminarPlatillo(data)}
                    disabled={loading} // Deshabilitar el botón si está en carga
                />
            </motion.div>
        </div>
    );

    const existenciaBodyTemplate = (data) => (
        <select
            className="bg-white shadow appearance-none border rounded-full w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline transition-colors duration-300"
            value={data.existencia ? "true" : "false"}
            onChange={(e) => actualizarDisponibilidad(data.id, e.target.value === "true")}
        >
            <option value="true">Disponible</option>
            <option value="false">No Disponible</option>
        </select>
    );

    const header = (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg">
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
            <div className="p-5 shadow-lg bg-white rounded-lg hover:shadow-xl transition-shadow duration-300">
                <DataTable
                    value={platillos} 
                    header={header}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    tableStyle={{ minWidth: '60rem' }}
                    className="rounded-lg overflow-hidden"
                >
                    <Column header="Platillo" body={imageBodyTemplate} />
                    <Column header="Nombre" body={nameBodyTemplate} />
                    <Column header="Descripción" body={descripcionBodyTemplate} />
                    <Column header="Precio" body={priceBodyTemplate} />
                    <Column header="Existencia" body={existenciaBodyTemplate} />
                    <Column header="Acciones" body={actionBodyTemplate} />
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
                footer={
                    <div className="flex justify-between">
                        <Button
                            label="Cancelar"
                            onClick={handleCancelDelete}
                            className="mr-2"
                        />
                        <Button
                            label="Eliminar"
                            onClick={handleConfirmDelete}
                            className="bg-[#853030] hover:bg-[#6d2727] text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300"
                            disabled={loading} // Deshabilitar el botón de confirmación
                        />
                    </div>
                }
            />
        </motion.div>
    );
};

export default Platillo;
