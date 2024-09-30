import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../firebase'; // Se importa el contexto de Firebase
import { Chart } from 'primereact/chart';
import * as XLSX from 'xlsx'; // Importar XLSX para generar el archivo Excel
import { collection, where, onSnapshot } from 'firebase/firestore'; // Importar las funciones necesarias de Firestore

const GraficaAno = () => {
    const { db } = useContext(FirebaseContext); // Se obtiene `db` directamente desde el contexto
    const [datos, setDatos] = useState([]);
    const [ano, setAno] = useState(new Date().getFullYear()); // Año actual
    const [mensaje, setMensaje] = useState(''); // Estado para manejar el mensaje de ausencia de datos

    useEffect(() => {
        if (!db) return; // Verificar si `db` está disponible antes de intentar acceder a Firestore

        const unsubscribe = onSnapshot(
            collection(db, 'ordenes'), // Acceder a la colección 'ordenes'
            where('completado', '==', true), // Filtrar solo las órdenes completadas
            (snapshot) => {
                const ordenes = snapshot.docs.map(doc => doc.data());

                // Filtramos por el año seleccionado
                const filtrado = ordenes.filter(orden => {
                    const fechaIngreso = orden.fecha_ingreso ? orden.fecha_ingreso.toDate() : null;
                    if (fechaIngreso) {
                        return fechaIngreso.getFullYear() === ano;
                    }
                    return false; // Si no tiene fecha_ingreso, no lo incluimos en el filtrado
                });

                // Agrupar las órdenes por mes y sumar el total de ventas por mes
                const agrupadoPorMes = filtrado.reduce((acc, orden) => {
                    const mes = orden.fecha_ingreso.toDate().getMonth() + 1;
                    if (!acc[mes]) {
                        acc[mes] = 0; // Inicializa el total en 0 si no existe el mes
                    }
                    acc[mes] += orden.total; // Sumar el total de la orden al total del mes
                    return acc;
                }, {});

                // Convertir el objeto agrupado en un array de datos para la gráfica
                const datosAgrupados = [...Array(12).keys()].map(mes => ({
                    mes: mes + 1,
                    total: agrupadoPorMes[mes + 1] || 0,
                }));

                // Actualizar el estado y mensaje
                if (datosAgrupados.every(dato => dato.total === 0)) {
                    setMensaje(`No se han encontrado ingresos para ${ano}`);
                } else {
                    setMensaje('');
                }
                setDatos(datosAgrupados);
            }
        );

        // Cleanup function to unsubscribe from the snapshot listener
        return () => unsubscribe();
    }, [ano, db]); // Actualizar cuando cambie el año o `db`

    const data = {
        labels: datos.map(dato => `Mes ${dato.mes}`),
        datasets: [{
            label: 'Ingresos por Mes',
            data: datos.map(dato => dato.total),
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 1
        }]
    };

    // Función para exportar datos a un archivo Excel
    const generarExcel = () => {
        const wb = XLSX.utils.book_new();

        // Total de ventas del año
        const totalVentasAno = datos.reduce((total, dato) => total + dato.total, 0);

        // Creamos la hoja de trabajo
        const ws = XLSX.utils.aoa_to_sheet([
            ['Ingresos por Año'], // Encabezado principal
            [`Año: ${ano}`], // Año
            [], // Espacio vacío
            ['Mes', 'Total'], // Títulos de columnas
            ...datos.map(dato => [`Mes ${dato.mes}`, dato.total]), // Datos de la tabla
            [], // Espacio vacío
            ['Ventas del Año', totalVentasAno] // Total de ventas del año
        ]);

        // Ajustar el ancho de las columnas
        ws['!cols'] = [{ wch: 15 }, { wch: 10 }]; // Ajustar ancho de columnas

        // Agregar la hoja de trabajo al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');

        // Guardar el archivo
        XLSX.writeFile(wb, `Ingresos_${ano}.xlsx`);
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-light mb-4">Gráfica Anual - {ano}</h2>
            
            <div className="mb-4">
                <label htmlFor="ano" className="mr-2">Año:</label>
                <select
                    id="ano"
                    value={ano}
                    onChange={(e) => setAno(Number(e.target.value))}
                    className="border p-2 rounded"
                >
                    {Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i)).map(año => (
                        <option key={año} value={año}>{año}</option>
                    ))}
                </select>
            </div>

            <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={generarExcel}
            >
                Generar Excel
            </button>

            {mensaje ? (
                <p>{mensaje}</p> // Muestra el mensaje si no hay datos
            ) : (
                <Chart type="bar" data={data} />
            )}
        </div>
    );
};

export default GraficaAno;
