import React, { useEffect, useState, useContext } from 'react';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { Tag } from 'primereact/tag';
import { ChartLineIcon, CalendarIcon } from "lucide-react";
import { motion } from 'framer-motion';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { ThemeContext } from '../ui/ThemeContext';

export default function Ingresos() {
    const { db } = useContext(FirebaseContext);
    const { darkMode } = useContext(ThemeContext);

    const [ingresos, setIngresos] = useState([]);
    const [filteredIngresos, setFilteredIngresos] = useState([]);
    const [search, setSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [dateRange, setDateRange] = useState(null);
    const [sortField, setSortField] = useState('fecha_ingreso');
    const [sortOrder, setSortOrder] = useState(-1);
    const [dateRangeEnabled, setDateRangeEnabled] = useState(true);

    useEffect(() => {
        const obtenerIngresos = () => {
            if (db) {
                const ingresosQuery = query(
                    collection(db, 'ordenes'),
                    where('completado', '==', true)
                );

                onSnapshot(ingresosQuery, snapshot => {
                    const ingresosData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setIngresos(ingresosData);
                    setFilteredIngresos(ingresosData);
                });
            }
        };
        obtenerIngresos();
    }, [db]);

    useEffect(() => {
        filtrarIngresos();
    }, [search, paymentMethod, dateRange, sortField, sortOrder, ingresos]);

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
        <div className={`text-lg break-words max-w-28 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            {rowData.tipoPago}
        </div>
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
        <span className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            {formatearPrecio(rowData.total)}
        </span>
    );

    const filtrarIngresos = () => {
        const query = search.toLowerCase();

        const filtrados = ingresos.filter(ingreso => {
            const tipoPagoMatch = ingreso.tipoPago && ingreso.tipoPago.toLowerCase().includes(query);
            const ordenMatch = ingreso.orden && ingreso.orden.some(platillo =>
                platillo.nombre && platillo.nombre.toLowerCase().includes(query)
            );
            const paymentMethodMatch = paymentMethod ? ingreso.tipoPago === paymentMethod : true;
            const dateRangeMatch = dateRangeEnabled && dateRange ?
                (ingreso.fecha_ingreso.toDate() >= dateRange[0] && ingreso.fecha_ingreso.toDate() <= dateRange[1]) : true;

            return (tipoPagoMatch || ordenMatch) && paymentMethodMatch && dateRangeMatch;
        });

        const sortedIngresos = [...filtrados].sort((a, b) => {
            if (sortField === 'fecha_ingreso') {
                return sortOrder * (a.fecha_ingreso.toDate() - b.fecha_ingreso.toDate());
            }
            return 0;
        });

        setFilteredIngresos(sortedIngresos);
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const onSort = (event) => {
        setSortField(event.sortField);
        setSortOrder(event.sortOrder);
    };

    const sortOptions = [
        { label: 'Más reciente', value: 'recent', className: darkMode ? 'text-white' : '' },
        { label: 'Más antiguo', value: 'oldest', className: darkMode ? 'text-white' : '' }
    ];

    const onSortChange = (e) => {
        if (e.value === 'recent') {
            setSortField('fecha_ingreso');
            setSortOrder(-1);
        } else if (e.value === 'oldest') {
            setSortField('fecha_ingreso');
            setSortOrder(1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full px-3 mb-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
        >
            <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
                <h1 className={`flex items-center ${darkMode ? 'bg-gradient-to-r from-red-900 to-red-700' : 'bg-gradient-to-r from-[#853030] to-[#6d2727]'} text-white p-4 rounded-t-lg mb-5`}>
                    <ChartLineIcon className="w-6 h-6 mr-2" /> Ingresos
                </h1>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                    <div className="flex w-full md:w-1/2 items-center">
                        <Tag value="Buscar" className={`${darkMode ? 'bg-red-900' : 'bg-[#853030]'} text-white px-6 py-3 h-full`} />
                        <InputText
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por método de pago o nombre del platillo"
                            className={`w-full px-4 py-2 border-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} focus:outline-none ${darkMode ? 'focus:border-red-600' : 'focus:border-[#853030]'} transition-colors duration-300 rounded-r-lg`}
                        />
                    </div>

                    <div className="relative inline-block w-full md:w-1/4">
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className={`w-full px-4 py-2 border-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} focus:outline-none ${darkMode ? 'focus:border-red-600' : 'focus:border-[#853030]'} transition-colors duration-300 rounded-lg appearance-none`}
                        >
                            <option value="">Todos los métodos de pago</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg
                                className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col md:flex-row items-center justify-center gap-6 mb-8 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg shadow-md border-2 ${darkMode ? 'border-gray-600' : 'border-primary'}`}>
                    <div className="flex flex-col md:flex-row items-center w-full md:w-2/3 space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex items-center space-x-2 w-full md:w-auto">
                            <Checkbox
                                inputId="dateRangeEnabled"
                                checked={dateRangeEnabled}
                                onChange={(e) => setDateRangeEnabled(e.checked)}
                                className={`border-2 rounded-lg transition-all duration-300 
                                        ${dateRangeEnabled ? 'bg-blue-500 border-blue-600' : `${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                                        focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                style={{ width: '20px', height: '20px' }} 
                            />

                            <label htmlFor="dateRangeEnabled" className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
                                <CalendarIcon className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-300' : 'text-primary'}`} />
                                Filtrar por fecha
                            </label>
                        </div>
                        <Calendar
                            value={dateRange}
                            onChange={(e) => setDateRange(e.value)}
                            selectionMode="range"
                            readOnlyInput
                            placeholder="Seleccionar rango de fechas"
                            className={`w-full md:w-64 border-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-primary bg-white'} rounded ${darkMode ? 'p-inputtext-dark' : ''}`}
                            disabled={!dateRangeEnabled}
                        />
                    </div>
                    <Dropdown
                        value={sortOrder === -1 ? 'recent' : 'oldest'}
                        options={sortOptions}
                        onChange={onSortChange}
                        placeholder="Ordenar por fecha"
                        className={`w-full md:w-1/3 border-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-primary bg-white'} rounded ${darkMode ? 'p-dropdown-dark' : ''}`}
                    />
                </div>

                <DataTable
                    value={filteredIngresos.slice(first, first + rows)}
                    paginator={false}
                    responsiveLayout="scroll"
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={onSort}
                    className={`${darkMode ? 'p-datatable-dark bg-gray-800 text-gray-100' : 'bg-white'}`}
                    rowClassName={() => darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'hover:bg-gray-100'}
                >
                    <Column field="fecha_ingreso" header="Fecha" body={fechaBodyTemplate} sortable 
                            headerClassName={darkMode ? 'bg-gray-800 text-gray-100' : ''}
                            bodyClassName={darkMode ? 'bg-gray-700 text-gray-100' : ''}></Column>
                    <Column field="tipoPago" header="Método de Pago" body={tipoPagoBodyTemplate}
                            headerClassName={darkMode ? 'bg-gray-800 text-gray-100' : ''}
                            bodyClassName={darkMode ? 'bg-gray-700 text-gray-100' : ''}></Column>
                    <Column field="orden" header="Productos Vendidos" body={ordenBodyTemplate}
                            headerClassName={darkMode ? 'bg-gray-800 text-gray-100' : ''}
                            bodyClassName={darkMode ? 'bg-gray-700 text-gray-100' : ''}></Column>
                    <Column field="total" header="Ingreso Total" body={totalBodyTemplate}
                            headerClassName={darkMode ? 'bg-gray-800 text-gray-100' : ''}
                            bodyClassName={darkMode ? 'bg-gray-700 text-gray-100' : ''}></Column>
                </DataTable>

                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={filteredIngresos.length}
                    onPageChange={onPageChange}
                    rowsPerPageOptions={[5, 10, 20]}
                    className={`mt-4 ${darkMode ?    'p-paginator-dark bg-gray-800 text-gray-100' : 'bg-white'}`}
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ingresos"
                />
            </div>
        </motion.div>
    );
}