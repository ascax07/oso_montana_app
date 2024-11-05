import React, { useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { ThemeContext } from '../ui/ThemeContext';
import { motion } from 'framer-motion';
import { ChartLineIcon } from 'lucide-react';

const Ingreso = ({ ingreso }) => {
    const { darkMode } = useContext(ThemeContext);

    const formatearFecha = (timestamp) => {
        if (timestamp && timestamp.toDate) {
            const fecha = timestamp.toDate();
            return fecha.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
        }
        return 'Fecha no disponible';
    };

    const formatearPrecio = (precio) => {
        return precio.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const fechaBodyTemplate = (rowData) => (
        <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
            {formatearFecha(rowData.fecha_ingreso)}
        </span>
    );

    const tipoPagoBodyTemplate = (rowData) => (
        <Tag 
            value={rowData.tipoPago} 
            severity={darkMode ? "warning" : "info"}
            className={darkMode ? 'bg-yellow-700 text-yellow-100' : ''}
        />
    );

    const ordenBodyTemplate = (rowData) => (
        <ul className={`list-disc pl-5 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            {rowData.orden.map((platillo, index) => (
                <li key={index}>
                    {platillo.cantidad} {platillo.nombre}
                </li>
            ))}
        </ul>
    );

    const totalBodyTemplate = (rowData) => (
        <span className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
            {formatearPrecio(rowData.total)}
        </span>
    );

    const header = (
        <div className={`flex flex-wrap items-center ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-[#853030] to-[#6d2727]'} text-white p-4 rounded-t-lg`}>
            <div className="flex items-center">
                <ChartLineIcon size={24} className="mr-2" />
                <span className="text-2xl font-bold">Detalles del Ingreso</span>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full px-3 mb-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
        >
            <div className={`p-5 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                <DataTable 
                    value={[ingreso]} 
                    header={header} 
                    tableStyle={{ minWidth: '60rem' }}
                    className={`${darkMode ? 'p-datatable-dark' : ''}`}
                    emptyMessage={<p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No se encontraron ingresos</p>}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ingresos"
                    paginatorClassName={darkMode ? 'bg-gray-800 text-gray-200' : ''}
                >
                    <Column 
                        field="fecha_ingreso" 
                        header="Fecha" 
                        body={fechaBodyTemplate}
                        headerClassName={darkMode ? 'bg-gray-700 text-gray-200' : ''}
                        bodyClassName={darkMode ? 'bg-gray-800 text-gray-300' : ''}
                    />
                    <Column 
                        field="tipoPago" 
                        header="Método de Pago" 
                        body={tipoPagoBodyTemplate}
                        headerClassName={darkMode ? 'bg-gray-700 text-gray-200' : ''}
                        bodyClassName={darkMode ? 'bg-gray-800 text-gray-300' : ''}
                    />
                    <Column 
                        field="orden" 
                        header="Productos Vendidos" 
                        body={ordenBodyTemplate}
                        headerClassName={darkMode ? 'bg-gray-700 text-gray-200' : ''}
                        bodyClassName={darkMode ? 'bg-gray-800 text-gray-300' : ''}
                    />
                    <Column 
                        field="total" 
                        header="Ingreso Total" 
                        body={totalBodyTemplate}
                        headerClassName={darkMode ? 'bg-gray-700 text-gray-200' : ''}
                        bodyClassName={darkMode ? 'bg-gray-800 text-gray-300' : ''}
                    />
                </DataTable>
            </div>
        </motion.div>
    );
};

export default Ingreso;