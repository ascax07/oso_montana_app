import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';

const Grafica = ({ datos }) => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    const generarDatosGrafica = () => {
        // Extraemos las fechas y los totales de las ventas
        const labels = datos.map(dato => dato.fecha);
        const totalVentas = datos.map(dato => dato.total);

        const data = {
            labels: labels, // Fechas agrupadas
            datasets: [
                {
                    label: 'Total de Ventas',
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
            <Chart type="bar" data={chartData} options={chartOptions} />
        </div>
    );
};

export default Grafica;
