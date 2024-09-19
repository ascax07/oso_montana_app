import React, { useContext, useState } from 'react';
import { FirebaseContext } from '../../firebase';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ConfirmDialog } from 'primereact/confirmdialog';
import 'primereact/resources/themes/saga-blue/theme.css';  // Asegúrate de incluir el tema de PrimeReact
import 'primereact/resources/primereact.min.css';            // Estilos de PrimeReact
import 'primeicons/primeicons.css';                          // Iconos de PrimeReact

const Platillo = ({ platillo }) => {
    const { firebase } = useContext(FirebaseContext);
    const [platilloAEliminar, setPlatilloAEliminar] = useState(null);
    const [existencia, setExistencia] = useState(platillo.existencia);
    const [dialogVisible, setDialogVisible] = useState(false);

    const actualizarDisponibilidad = async (newExistencia) => {
        try {
            await firebase.db.collection('productos')
                .doc(platillo.id)
                .update({ existencia: newExistencia });
            setExistencia(newExistencia);
        } catch (error) {
            console.log(error);
        }
    }

    const eliminarPlatillo = (platillo) => {
        setPlatilloAEliminar(platillo);
        setDialogVisible(true);
    }

    const handleConfirmDelete = async () => {
        try {
            await firebase.db.collection('productos')
                .doc(platilloAEliminar.id)
                .delete();
            alert('Platillo eliminado con éxito');
            setPlatilloAEliminar(null);
        } catch (error) {
            console.error('Error eliminando el platillo:', error);
            alert('Hubo un error al eliminar el platillo');
        } finally {
            setDialogVisible(false);
        }
    };

    const handleCancelDelete = () => {
        setPlatilloAEliminar(null);
        setDialogVisible(false);
    };

    const formatearPrecio = (precio) => {
        return precio.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const nameBodyTemplate = (data) => (
        <div className="font-bold text-lg break-words max-w-28">{data.nombre}</div>
    );

    const DescripcionBodyTemplate = (data) => (
        <div className="text-gray-700 break-words max-w-28">{data.descripcion}</div>
    );

    const imageBodyTemplate = (data) => (
        <img 
            src={data.imagen} 
            alt="imagen platillo" 
            className="w-24 h-24 object-cover rounded-lg shadow-lg border border-gray-300"
        />
    );

    const priceBodyTemplate = (data) => formatearPrecio(data.precio);

    const statusBodyTemplate = (data) => (
        <Tag value={data.existencia ? "Disponible" : "No Disponible"} severity={data.existencia ? 'success' : 'danger'}></Tag>
    );

    const actionBodyTemplate = (data) => (
        <div className="flex space-x-2">
            <Link 
                to={`/editar-platillo/${data.id}`} 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-lg">
                Editar
            </Link>
            <Button 
                icon="pi pi-trash" 
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow-lg"
                onClick={() => eliminarPlatillo(data)}
            >
                Eliminar
            </Button>
        </div>
    );

    const existenciaBodyTemplate = (data) => (
        <select 
            className="bg-white shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            value={existencia}
            onChange={(e) => actualizarDisponibilidad(e.target.value === "true")}
        >
            <option value="true">Disponible</option>
            <option value="false">No Disponible</option>
        </select>
    );

    const header = (
        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
            <Button icon="pi pi-align-left" r />
            <span className="text-xl text-900 font-bold">Detalles del Platillo</span>
        </div>
    );

    return (
        <div className="w-full px-3 mb-4">
            <div className="p-5 shadow-md bg-white rounded-lg">
                <DataTable value={[platillo]} header={header} tableStyle={{ minWidth: '60rem' }}>
                    <Column header="Nombre" body={nameBodyTemplate}></Column>
                    <Column header="Descripción" body={DescripcionBodyTemplate}></Column>
                    <Column header="Imagen" body={imageBodyTemplate}></Column>
                    <Column field="precio" header="Precio" body={priceBodyTemplate}></Column>
                    <Column field="categoria" header="Categoría"></Column>
                    <Column field="existencia" header="Estado" body={existenciaBodyTemplate}></Column>
                    <Column header="Acciones" body={actionBodyTemplate}></Column>
                </DataTable>
            </div>
            {dialogVisible && (
                <ConfirmDialog 
                    visible={dialogVisible}
                    onHide={() => setDialogVisible(false)}
                    message={`¿Estás seguro que deseas eliminar el platillo ${platilloAEliminar?.nombre}?`}
                    header="Confirmar Eliminación"
                    icon="pi pi-info-circle"
                    accept={handleConfirmDelete}
                    reject={handleCancelDelete}
                    acceptClassName="p-button p-button-success bg-green-500 text-white hover:bg-green-600 border-none rounded-lg px-6 py-3 transition duration-300 ease-in-out mx-2" // Clase para el botón de aceptación
                    rejectClassName="p-button p-button-secondary bg-gray-500 text-white hover:bg-gray-600 border-none rounded-lg px-6 py-3 transition duration-300 ease-in-out mx-2" // Clase para el botón de rechazo
                />
            )}
        </div>
    );
}

export default Platillo;
