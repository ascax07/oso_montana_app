import React, { useEffect, useState, useContext } from 'react';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { Tag } from 'primereact/tag';
import { ChartLineIcon } from "lucide-react";
import { motion } from 'framer-motion';

const Ingresos = () => {
    const { db } = useContext(FirebaseContext);

    const [ingresos, setIngresos] = useState([]);
    const [filteredIngresos, setFilteredIngresos] = useState([]);
    const [search, setSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(''); // Nuevo estado para el método de pago
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);

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

    const fechaBodyTemplate = (rowData) => formatearFecha(rowData.fecha_ingreso);
    // const tipoPagoBodyTemplate = (rowData) => <Tag value={rowData.tipoPago} severity="info" />;
    const tipoPagoBodyTemplate = (rowData) => (


        <div className=" text-lg break-words max-w-28">{rowData.tipoPago}</div>
    );
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

    // Actualizar la función de filtrado para incluir el método de pago
    const filtrarIngresos = () => {
        const query = search.toLowerCase();

        const filtrados = ingresos.filter(ingreso => {
            const tipoPagoMatch = ingreso.tipoPago && ingreso.tipoPago.toLowerCase().includes(query);
            const ordenMatch = ingreso.orden && ingreso.orden.some(platillo =>
                platillo.nombre && platillo.nombre.toLowerCase().includes(query)
            );
            const paymentMethodMatch = paymentMethod ? ingreso.tipoPago === paymentMethod : true;

            return (tipoPagoMatch || ordenMatch) && paymentMethodMatch;
        });

        setFilteredIngresos(filtrados);
    };

    // Filtrar automáticamente cuando cambie la búsqueda o el método de pago
    useEffect(() => {
        filtrarIngresos();
    }, [search, paymentMethod]);

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full px-3 mb-4"
        >
            <div className="p-4">
                <h1 className="flex items-center bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg mb-5">
                    <ChartLineIcon className="w-6 h-6 mr-2" /> Ingresos
                </h1>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                    {/* Search Bar with Tag */}
                    <div className="flex w-full md:w-1/2 items-center">
                        <Tag value="Buscar" className="bg-red-700 text-white px-6 py-3 h-full" />
                        <InputText
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por método de pago o nombre del platillo"
                            className="w-full px-4 py-2 border-2 border-gray-300 focus:outline-none focus:border-red-800 transition-colors duration-300 rounded-r-lg"
                        />
                    </div>

                    {/* Payment Method Dropdown */}
                    <div className="relative inline-block w-full md:w-1/4">
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-300 focus:outline-none focus:border-red-800 transition-colors duration-300 rounded-lg appearance-none bg-white"
                        >
                            <option value="">Todos los métodos de pago</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-gray-600"
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

                <DataTable value={filteredIngresos.slice(first, first + rows)} paginator={false} responsiveLayout="scroll">
                    <Column field="fecha_ingreso" header="Fecha" body={fechaBodyTemplate}></Column>
                    <Column field="tipoPago" header="Método de Pago" body={tipoPagoBodyTemplate}></Column>
                    <Column field="orden" header="Productos Vendidos" body={ordenBodyTemplate}></Column>
                    <Column field="total" header="Ingreso Total" body={totalBodyTemplate}></Column>
                </DataTable>

                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={filteredIngresos.length}
                    onPageChange={onPageChange}
                    rowsPerPageOptions={[5, 10, 20]}
                    className="mt-4"
                />
            </div>
        </motion.div>
    );
};

export default Ingresos;
