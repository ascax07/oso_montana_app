import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Timestamp } from 'firebase/firestore'; // Importa Timestamp para formatear la fecha
import { Tag } from 'primereact/tag'; // Para usar el Tag de estado

const Ingreso = ({ ingreso }) => {
    const formatearFecha = (timestamp) => {
        if (timestamp && timestamp.toDate) { // Verifica que timestamp y toDate estén definidos
            const fecha = timestamp.toDate(); // Convierte el Timestamp a una fecha de JavaScript
            return fecha.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
        }
        return 'Fecha no disponible'; // Valor predeterminado si el timestamp no está definido
    };

    const formatearPrecio = (precio) => {
        return precio.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const fechaBodyTemplate = (rowData) => formatearFecha(rowData.fecha_ingreso);
    const tipoPagoBodyTemplate = (rowData) => <Tag value={rowData.tipoPago} severity="info" />;
    const ordenBodyTemplate = (rowData) => (
        <ul className="list-disc pl-5">
            {rowData.orden.map((platillo, index) => (
                <li key={index}>
                    {platillo.cantidad} {platillo.nombre}
                </li>
            ))}
        </ul>
    );
    const totalBodyTemplate = (rowData) => formatearPrecio(rowData.total);

    const header = (
        <div className="flex justify-between align-items-center">
            <h2 className="text-xl font-bold">Detalles del Ingreso</h2>
        </div>
    );

    return (
        <div className="w-full px-3 mb-4">
            <div className="p-5 shadow-md bg-white rounded-lg">
                <DataTable value={[ingreso]} header={header} tableStyle={{ minWidth: '60rem' }}>
                    <Column field="fecha_ingreso" header="Fecha" body={fechaBodyTemplate}></Column>
                    <Column field="tipoPago" header="Método de Pago" body={tipoPagoBodyTemplate}></Column>
                    <Column field="orden" header="Productos Vendidos" body={ordenBodyTemplate}></Column>
                    <Column field="total" header="Ingreso Total" body={totalBodyTemplate}></Column>
                </DataTable>
            </div>
        </div>
    );
};

export default Ingreso;
