import React, { useEffect, useState, useContext } from 'react';
import { FirebaseContext } from '../../firebase';
import Ingreso from '../ui/Ingreso';
import { ChartLineIcon } from "lucide-react";
import { InputText } from 'primereact/inputtext'; // Para el campo de búsqueda
import { Paginator } from 'primereact/paginator'; // Paginación

const Ingresos = () => {
    // context con las operaciones de firebase
    const { firebase } = useContext(FirebaseContext);

    // state con los ingresos y la paginación
    const [ingresos, guardarIngresos] = useState([]);
    const [filteredIngresos, setFilteredIngresos] = useState([]); // Para los ingresos filtrados
    const [search, setSearch] = useState(''); // Para la búsqueda por nombre o tipo de pago
    const [first, setFirst] = useState(0); // Control del índice para la paginación
    const [rows, setRows] = useState(10); // Control de la cantidad de filas por página

    useEffect(() => {
        const obtenerIngresos = () => {
            firebase.db.collection('ordenes')
                .where('completado', "==", true)
                .onSnapshot(manejarSnapshot);
        }
        obtenerIngresos();
    }, []);

    function manejarSnapshot(snapshot) {
        const ingresos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        guardarIngresos(ingresos);
        setFilteredIngresos(ingresos); // Inicializa con todos los ingresos
    }

    // Filtrar los ingresos según el valor de búsqueda
    const filtrarIngresos = (e) => {
        const query = e.target.value.toLowerCase();
        setSearch(query);

        const filtrados = ingresos.filter(ingreso => {
            // Verificar si tipoPago y orden existen antes de intentar acceder a ellos
            const tipoPagoMatch = ingreso.tipoPago && ingreso.tipoPago.toLowerCase().includes(query);

            const ordenMatch = ingreso.orden && ingreso.orden.some(platillo => 
                platillo.nombre && platillo.nombre.toLowerCase().includes(query)
            );

            // Devuelve true si coincide con el tipo de pago o el nombre del platillo
            return tipoPagoMatch || ordenMatch;
        });

        setFilteredIngresos(filtrados);
    };

    // Controlador de paginación
    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    return (
        <>
            <h1 className="text-3xl font-light mb-4">
                <ChartLineIcon className="w-6 h-6" /> Ingresos
            </h1>

            {/* Campo de búsqueda */}
            <div className="p-inputgroup mb-4">
                <span className="p-inputgroup-addon">Buscar</span>
                <InputText 
                    value={search} 
                    onChange={filtrarIngresos} 
                    placeholder="Buscar por método de pago o nombre del platillo" 
                />
            </div>

            {/* Mostrar la tabla paginada */}
            <div className="sm:flex sm:flex-wrap -mx-3">
                {filteredIngresos.slice(first, first + rows).map(ingreso => (
                    <Ingreso key={ingreso.id} ingreso={ingreso} />
                ))}
            </div>

            {/* Paginación */}
            <Paginator 
                first={first} 
                rows={rows} 
                totalRecords={filteredIngresos.length} 
                onPageChange={onPageChange}
                rowsPerPageOptions={[5, 10, 20]}
            />
        </>
    );
};

export default Ingresos;
