import React, { useEffect, useState, useContext } from 'react';
import { FirebaseContext } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Orden from '../ui/Orden';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { motion } from 'framer-motion';
import { Search, CalendarDays, Filter, RefreshCw, Clock, ListFilter } from 'lucide-react';

const Ordenes = () => {
    const { db } = useContext(FirebaseContext);
    const [ordenes, setOrdenes] = useState([]);
    const [filteredOrdenes, setFilteredOrdenes] = useState([]);
    const [search, setSearch] = useState('');
    const [mesa, setMesa] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const [timeFilter, setTimeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const obtenerOrdenes = () => {
            const q = query(collection(db, 'ordenes'), where('completado', '==', false));
            const unsubscribe = onSnapshot(q, manejarSnapshot);
            return unsubscribe;
        }

        if (db) {
            obtenerOrdenes();
        }
    }, [db]);

    useEffect(() => {
        aplicarFiltros();
    }, [search, mesa, dateRange, timeFilter, statusFilter, ordenes]);

    function manejarSnapshot(snapshot) {
        const ordenes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setOrdenes(ordenes);
        setFilteredOrdenes(ordenes);
    }

    const aplicarFiltros = () => {
        let resultado = ordenes;

        if (search) {
            resultado = resultado.filter(orden =>
                orden.id.toLowerCase().includes(search.toLowerCase()) ||
                orden.orden.some(item => item.nombre.toLowerCase().includes(search.toLowerCase()))
            );
        }

        if (mesa) {
            resultado = resultado.filter(orden => orden.mesa === Number(mesa));
        }

        if (dateRange && dateRange[0] && dateRange[1]) {
            resultado = resultado.filter(orden => {
                const ordenDate = orden.fecha_ingreso.toDate();
                return ordenDate >= dateRange[0] && ordenDate <= dateRange[1];
            });
        }

        if (timeFilter) {
            resultado = resultado.filter(orden => {
                const hours = orden.fecha_ingreso.toDate().getHours();
                if (timeFilter === 'AM') {
                    return hours >= 0 && hours < 12;
                } else if (timeFilter === 'PM') {
                    return hours >= 12 && hours < 24;
                }
                return true; // Si es 'Todos', no filtramos
            });
        }

        if (statusFilter) {
            resultado = resultado.filter(orden => {
                switch (statusFilter) {
                    case 'lista': return orden.lista && !orden.recogido;
                    case 'pendiente': return !orden.lista && !orden.recogido;
                    case 'confirmarPago': return orden.recogido && !orden.confirmarPago;
                    default: return true;
                }
            });
        }

        setFilteredOrdenes(resultado);
    };

    const refreshDateRange = () => {
        setDateRange(null);
    };

    const timeOptions = [
        { label: 'Todos', value: '' },
        { label: 'AM', value: 'AM' },
        { label: 'PM', value: 'PM' }
    ];

    const statusOptions = [
        { label: 'Todos', value: '' },
        { label: 'Lista', value: 'lista' },
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Confirmar Pago', value: 'confirmarPago' }
    ];

    return (
        <>
            <h1 className="flex flex-wrap items-center bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg">Órdenes</h1>

            <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
                            Buscar por ID o platillo
                        </label>
                        <div className="relative">
                            <input
                                id="search"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="mesa" className="text-sm font-medium text-gray-700 mb-1 block">
                            Número de Mesa
                        </label>
                        <div className="relative">
                            <input
                                id="mesa"
                                type="number"
                                value={mesa}
                                onChange={(e) => setMesa(e.target.value)}
                                placeholder="Número de mesa"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                        <label htmlFor="dateRange" className="text-sm font-medium text-gray-700 mb-1 block">
                            Rango de fechas
                        </label>
                        <div className="relative">
                            <Calendar
                                id="dateRange"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.value)}
                                selectionMode="range"
                                readOnlyInput
                                placeholder="Rango de fechas"
                                className="w-full"
                                inputClassName="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Button
                                icon={<RefreshCw className="h-5 w-5" />}
                                onClick={refreshDateRange}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-button-text"
                                tooltip="Refrescar fechas"
                                tooltipOptions={{ position: 'top' }}
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="timeFilter" className="text-sm font-medium text-gray-700 mb-1 block">
                            Seleccionar Hora
                        </label>
                        <div className="relative">
                            <select
                                id="timeFilter"
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="">Seleccionar hora</option>
                                {timeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 mb-1 block">
                            Filtrar por estado
                        </label>
                        <div className="relative">
                            <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="">Filtrar por estado</option>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sm:flex sm:flex-wrap -mx-3">
                {filteredOrdenes.map(orden => (
                    <Orden
                        key={orden.id}
                        orden={orden}
                    />
                ))}
            </div>
        </>
    );
}

export default Ordenes;
