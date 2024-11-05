import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../firebase';
import Grafica from '../ui/Grafica';
import GraficaAno from '../ui/GraficaAno';
import { collection, where, onSnapshot, query } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../assets/oso_montana_logo.png';
import img_borde1 from '../../assets/borde1.png';
import img_borde2 from '../../assets/borde2.png';
import { ThemeContext } from '../ui/ThemeContext';


const Graficas = () => {
    const { db } = useContext(FirebaseContext);
    const [datos, setDatos] = useState([]); // Datos detallados para el PDF
    const [datosAgrupados, setDatosAgrupados] = useState([]); // Datos agrupados para las gráficas
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [ano, setAno] = useState(new Date().getFullYear());
    const [mensaje, setMensaje] = useState('');
    const [vista, setVista] = useState('mensual');
    const { darkMode } = useContext(ThemeContext);

    
    useEffect(() => {
        if (!db) return;

        const q = query(
            collection(db, 'ordenes'),
            where('completado', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordenes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Filtramos por mes y año
            const filtrado = ordenes.filter(orden => {
                const fechaIngreso = orden.fecha_ingreso ? orden.fecha_ingreso.toDate() : null;
                if (fechaIngreso) {
                    return (fechaIngreso.getMonth() + 1 === mes) && (fechaIngreso.getFullYear() === ano);
                }
                return false;
            });

            // Agrupamos los datos para las gráficas
            const agrupadoPorFecha = filtrado.reduce((acc, orden) => {
                const fecha = orden.fecha_ingreso ? orden.fecha_ingreso.toDate().toLocaleDateString('es-ES') : '';
                if (!acc[fecha]) {
                    acc[fecha] = 0;
                }
                acc[fecha] += orden.total;
                return acc;
            }, {});

            // Convertimos los datos agrupados a un formato adecuado para las gráficas
            const datosGrafica = Object.keys(agrupadoPorFecha).map(fecha => ({
                fecha,
                total: agrupadoPorFecha[fecha]
            }));

            setDatosAgrupados(datosGrafica); // Actualizamos los datos para la gráfica
            setDatos(filtrado); // Actualizamos los datos detallados para el PDF

            if (datosGrafica.length === 0) {
                setMensaje(`No se han encontrado ingresos para ${mes}/${ano}`);
            } else {
                setMensaje('');
            }
        });

        return () => unsubscribe();
    }, [mes, ano, db]);

    const generarPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        const addDecorativeBorders = () => {
            doc.addImage(img_borde1, 'PNG', 0, 0, pageWidth, 40);
            doc.addImage(img_borde2, 'PNG', 0, pageHeight - 20, pageWidth, 20);
        };

        addDecorativeBorders();

        doc.addImage(logo, 'PNG', 15, 40, 30, 30);

        // Validar que existan datos antes de generar el PDF
        if (datos.length === 0) {
            doc.text('No se encontraron datos para generar el reporte.', 14, 80);
            doc.save(`Reporte_Ingresos_${mes}_${ano}.pdf`);
            return;
        }

        const totalIngresos = datos.reduce((sum, dato) => {
            if (!dato.orden || !Array.isArray(dato.orden)) {
                return sum;
            }
            const subtotal = dato.orden.reduce((s, item) => s + (item.precio * item.cantidad), 0);
            const impuesto = subtotal * 0.08;  // 8% consumption tax
            return sum + subtotal + impuesto;
        }, 0);
        

        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(0, 0, 0);
        doc.text('Resumen Ejecutivo', pageWidth / 2, 50, { align: 'center' });

        doc.setFontSize(18);
        doc.setTextColor(51, 51, 51);
        doc.text('OSO DE LA MONTAÑA', pageWidth / 2, 60, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text('osodelamontana@gmail.com', pageWidth / 2, 68, { align: 'center' });

        doc.setFontSize(12);
        const textoIngresos = `Durante el mes ${mes}/${ano} la cafeteria "Oso de la Montaña" generó un total de $${totalIngresos.toLocaleString('es-CO')} COP en ingresos.`;
        doc.text(textoIngresos, 14, 80, { maxWidth: pageWidth - 28 });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('Detalle de Ventas', pageWidth / 2, 100, { align: 'center' });

        const tableColumn = [
            'Fecha y Hora de Ingreso',
            'Mesa',
            'Método de Pago',
            'Orden',
            'SUBTOTAL',
            'Impuesto al Consumo (8%)',
            'TOTAL PAGADO'
        ];

        const tableRows = datos.map(dato => {
            const fechaIngreso = dato.fecha_ingreso ? dato.fecha_ingreso.toDate().toLocaleString() : '';
            const mesa = dato.mesa || 'N/A';
            const metodoPago = dato.tipoPago || 'Desconocido';
        
            // Validar que dato.orden esté definido y sea un arreglo
            const orden = dato.orden && Array.isArray(dato.orden)
                ? dato.orden.map(item => `${item.cantidad}x ${item.nombre} = $${(item.precio * item.cantidad).toLocaleString('es-CO')}`).join(', ')
                : 'N/A';
        
            const total = dato.total || 0;  // Aquí se toma el campo "total" de la orden
            const impuesto = total * 0.08;  // Impuesto del 8%
            const subtotal = total - impuesto; // SUBTOTAL, resta del impuesto
        
            return [
                fechaIngreso,
                mesa,
                metodoPago,
                orden,  // Orden con formato "cantidad x nombre = total"
                `$${subtotal.toLocaleString('es-CO')}`, // SUBTOTAL sin impuestos
                `$${impuesto.toLocaleString('es-CO')}`, // Impuesto al Consumo (8%)
                `$${total.toLocaleString('es-CO')}` // TOTAL PAGADO con impuesto incluido
            ];
        });
        
        

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 110,
            theme: 'grid',
            styles: { fontSize: 8, font: "helvetica" },
            headStyles: { fillColor: [255, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" }
        });

        doc.addPage();
        addDecorativeBorders(); 
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text('Análisis de Ventas', 14, 20);

        const productoMasVendido = calcularProductoMasVendido(datos);
        const metodoMasUtilizado = calcularMetodoMasUtilizado(datos);

        doc.setFontSize(12);
        doc.text(`• Producto más vendido: ${productoMasVendido}`, 14, 40);
        doc.text(`• Método de pago más utilizado: ${metodoMasUtilizado}`, 14, 50);

        doc.save(`Reporte_Ingresos_${mes}_${ano}.pdf`);
    };

    const calcularProductoMasVendido = (datos) => {
        const conteoProductos = {};

        datos.forEach(dato => {
            if (dato.orden && Array.isArray(dato.orden)) {
                dato.orden.forEach(item => {
                    conteoProductos[item.nombre] = (conteoProductos[item.nombre] || 0) + item.cantidad;
                });
            }
        });

        const productosOrdenados = Object.entries(conteoProductos).sort((a, b) => b[1] - a[1]);
        return productosOrdenados[0] ? productosOrdenados[0][0] : 'N/A';
    };

    const calcularMetodoMasUtilizado = (datos) => {
        const conteoMetodos = {};

        datos.forEach(dato => {
            const metodoPago = dato.tipoPago;
            conteoMetodos[metodoPago] = (conteoMetodos[metodoPago] || 0) + 1;
        });

        const metodosOrdenados = Object.entries(conteoMetodos).sort((a, b) => b[1] - a[1]);
        return metodosOrdenados[0] ? metodosOrdenados[0][0] : 'N/A';
    };

    return (
        <div className="card">
            <div className="mb-4">
            <h1 className="flex mb-5 flex-wrap items-center bg-gradient-to-r from-[#853030] to-[#6d2727] text-white p-4 rounded-t-lg">Graficas de Ingresos</h1>

                <button
                   className={`flex-1 inline-flex justify-center items-center px-4 py-3 mb-5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    darkMode 
                        ? 'bg-red-700 hover:bg-red-600' 
                        : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                    onClick={() => setVista('mensual')}
                >
                    Ver Gráfica Mensual
                </button>
                <button
                 
                    className={`ml-4  flex-1 inline-flex justify-center items-center px-4 py-3 mb-5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        darkMode 
                            ? 'bg-red-700 hover:bg-red-600' 
                            : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                    onClick={() => setVista('anual')}
                >
                    Ver Gráfica Anual
                </button>
            </div>

            {vista === 'mensual' ? (
                <>
                    <div className="mb-4">
                    <h1 className="text-3xl font-light mb-4">Gráficas del mes</h1>

                        <label htmlFor="mes">Mes:</label>
                        <select
                            id="mes"
                            value={mes}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"                            onChange={(e) => setMes(Number(e.target.value))}
                        >
                            {[...Array(12).keys()].map(i => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>

                        <label htmlFor="ano" className="ml-4">Año:</label>
                        <select
                            id="ano"
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                            value={ano}
                            onChange={(e) => setAno(Number(e.target.value))}
                        >
                            {Array.from({ length: 10 }, (_, i) => ano - 5 + i).map(año => (
                                <option key={año} value={año}>{año}</option>
                            ))}
                        </select>
                    </div>

                    {mensaje ? (
                        <p>{mensaje}</p>
                    ) : (
                        <Grafica datos={datosAgrupados} generarPDF={() => generarPDF(datos, mes, ano)} />
                    )}
                </>
            ) : (
                <GraficaAno ano={ano} />
            )}
        </div>
    );
};

export default Graficas;
