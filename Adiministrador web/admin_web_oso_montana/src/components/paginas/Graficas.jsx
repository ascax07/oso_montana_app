import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../firebase'; // Se importa el contexto de Firebase
import Grafica from '../ui/Grafica';
import GraficaAno from '../ui/GraficaAno'; // Importa el nuevo componente
import * as XLSX from 'xlsx';
import { collection, where, onSnapshot } from 'firebase/firestore'; // Asegúrate de importar los métodos correctos de Firestore

const Graficas = () => {
    const { db } = useContext(FirebaseContext); // Se obtiene `db` desde el contexto de Firebase
    const [datos, setDatos] = useState([]);
    const [mes, setMes] = useState(new Date().getMonth() + 1); // Mes actual (1-12)
    const [ano, setAno] = useState(new Date().getFullYear()); // Año actual
    const [mensaje, setMensaje] = useState(''); // Estado para manejar el mensaje de ausencia de datos
    const [vista, setVista] = useState('mensual'); // Estado para controlar la vista

    useEffect(() => {
        if (!db) return; // Verificar si `db` está disponible

        const unsubscribe = onSnapshot(
            collection(db, 'ordenes'),
            where('completado', '==', true), // Filtramos solo las órdenes completadas
            (snapshot) => {
                const ordenes = snapshot.docs.map(doc => doc.data());

                // Filtrar por el mes y año seleccionados
                const filtrado = ordenes.filter(orden => {
                    const fechaIngreso = orden.fecha_ingreso ? orden.fecha_ingreso.toDate() : null; // Verificar si existe fecha_ingreso
                    if (fechaIngreso) {
                        return (fechaIngreso.getMonth() + 1 === mes) && (fechaIngreso.getFullYear() === ano);
                    }
                    return false; // Si no tiene fecha_ingreso, no lo incluimos en el filtrado
                });

                // Agrupar las órdenes por fecha y sumar el total de ventas por día
                const agrupadoPorFecha = filtrado.reduce((acc, orden) => {
                    const fecha = orden.fecha_ingreso.toDate().toLocaleDateString('es-ES');
                    if (!acc[fecha]) {
                        acc[fecha] = 0; // Inicializa el total en 0 si no existe la fecha
                    }
                    acc[fecha] += orden.total; // Sumar el total de la orden al total del día
                    return acc;
                }, {});

                // Convertir el objeto agrupado en un array de datos para la gráfica
                const datosAgrupados = Object.keys(agrupadoPorFecha).map(fecha => ({
                    fecha,
                    total: agrupadoPorFecha[fecha],
                }));

                setDatos(datosAgrupados);

                // Mostrar mensaje si no hay datos
                if (datosAgrupados.length === 0) {
                    setMensaje(`No se han encontrado ingresos para ${mes}/${ano}`);
                } else {
                    setMensaje('');
                }
            }
        );

        // Cleanup function to unsubscribe from the snapshot listener
        return () => unsubscribe();
    }, [mes, ano, db]); // Actualizar cuando cambie el mes, año o `db`

    // Función para exportar datos a un archivo Excel
    const generarExcel = () => {
        const wb = XLSX.utils.book_new();

        // Creamos la hoja de trabajo
        const ws = XLSX.utils.aoa_to_sheet([
            ['Ingresos Oso de la Montaña'], // Encabezado principal
            [`Mes: ${mes}`, `Año: ${ano}`], // Mes y Año
            [], // Espacio vacío
            ['Fecha', 'Total'], // Títulos de columnas
            ...datos.map(dato => [dato.fecha, dato.total]), // Datos de la tabla
            [], // Espacio vacío
            ['Total de Ventas', { t: 'n', f: `SUM(B5:B${datos.length + 4})` }] // Total de ventas
        ]);

        // Ajustar el ancho de las columnas
        ws['!cols'] = [{ wch: 15 }, { wch: 10 }]; // Ajustar ancho de columnas

        // Agregar la hoja de trabajo al libro
        XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');

        // Guardar el archivo
        XLSX.writeFile(wb, `Ingresos_${mes}_${ano}.xlsx`);
    };

    return (
        <div className="card">
            <h1 className="text-3xl font-light mb-4">Gráficas - {mes}/{ano}</h1>

            <div className="mb-4">
                <button
                    className={`px-4 py-2 ${vista === 'mensual' ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded`}
                    onClick={() => setVista('mensual')}
                >
                    Ver Gráfica Mensual
                </button>
                <button
                    className={`ml-4 px-4 py-2 ${vista === 'anual' ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded`}
                    onClick={() => setVista('anual')}
                >
                    Ver Gráfica Anual
                </button>
            </div>

            {vista === 'mensual' ? (
                <>
                    <div className="mb-4">
                        <label htmlFor="mes">Mes:</label>
                        <select
                            id="mes"
                            value={mes}
                            onChange={(e) => setMes(Number(e.target.value))}
                        >
                            {[...Array(12).keys()].map(i => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>

                        <label htmlFor="ano" className="ml-4">Año:</label>
                        <select
                            id="ano"
                            value={ano}
                            onChange={(e) => setAno(Number(e.target.value))}
                        >
                            {Array.from({ length: 10 }, (_, i) => ano - 5 + i).map(año => (
                                <option key={año} value={año}>{año}</option>
                            ))}
                        </select>

                        <button
                            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={generarExcel}
                        >
                            Generar Excel
                        </button>
                    </div>

                    {mensaje ? (
                        <p>{mensaje}</p> // Muestra el mensaje si no hay datos
                    ) : (
                        <Grafica datos={datos} /> // Muestra la gráfica si hay datos
                    )}
                </>
            ) : (
                <GraficaAno ano={ano} /> // Muestra la gráfica anual
            )}
        </div>
    );
};

export default Graficas;
