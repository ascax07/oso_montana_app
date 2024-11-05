import React, { useEffect, useState, useContext } from 'react';
import { Chart } from 'primereact/chart';
import { ThemeContext } from '../ui/ThemeContext';


const Grafica = ({ datos, generarPDF }) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const { darkMode } = useContext(ThemeContext);


    const generarDatosGrafica = () => {
        // Extraemos las fechas y los totales de las ventas
        const labels = datos.map(dato => dato.fecha);
        const totalVentas = datos.map(dato => {
            // Mostrar el total en las graficas cuando el usuario pasa el cursor sobre ellas
            const total = dato.total; 
            return total ; // Retornamos el total 
        });

        const data = {
            labels: labels, // Fechas agrupadas
            datasets: [
                {
                    label: 'Total de ventas del mes',
                    data: totalVentas, // Totales agrupados por fecha
                    backgroundColor: 'rgba(255, 13, 13, 0.562)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 2,
                }
            ]
        };

        const options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    };

    useEffect(() => {
        if (datos.length > 0) {
            generarDatosGrafica();
        }
    }, [datos]);

    return (
        <div className="card">
            <button
                className={`flex-1 inline-flex justify-center items-center px-4 py-3 mb-5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    darkMode 
                        ? 'bg-red-700 hover:bg-red-600' 
                        : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                onClick={generarPDF}
            >
                Generar PDF
            </button>
            <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
    );
};

export default Grafica;
