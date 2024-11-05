import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../firebase'; // Se importa el contexto de Firebase
import { Chart } from 'primereact/chart';
import jsPDF from 'jspdf'; // Import jsPDF para generar PDF
import 'jspdf-autotable'; // AutoTable para generar tablas en el PDF
import { collection, where, onSnapshot, query } from 'firebase/firestore'; // Importar funciones necesarias de Firestore
import logo from '../../assets/oso_montana_logo.png'; // Logo de la empresa
import img_borde1 from '../../assets/borde1.png'; // Imagen de borde superior
import img_borde2 from '../../assets/borde2.png'; // Imagen de borde inferior
import { ThemeContext } from '../ui/ThemeContext';



const GraficaAno = () => {
    const { db } = useContext(FirebaseContext); // Se obtiene `db` directamente desde el contexto
    const [datos, setDatos] = useState([]);
    const [productosMasVendidos, setProductosMasVendidos] = useState([]);
    const [metodoMasUtilizado, setMetodoMasUtilizado] = useState('');
    const [distribucionCategorias, setDistribucionCategorias] = useState({});
    const [ano, setAno] = useState(new Date().getFullYear()); // Año actual
    const [mensaje, setMensaje] = useState(''); // Estado para manejar el mensaje de ausencia de datos
    const { darkMode } = useContext(ThemeContext);


    // Nuevo estado para guardar el mes con mayor venta
    const [mesConMayorVenta, setMesConMayorVenta] = useState(null);

    useEffect(() => {
        if (!db) return; // Verificar si `db` está disponible antes de intentar acceder a Firestore

        const q = query(
            collection(db, 'ordenes'),
            where('completado', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordenes = snapshot.docs.map(doc => doc.data());

            // Filtramos por el año seleccionado
            const filtrado = ordenes.filter(orden => {
                const fechaIngreso = orden.fecha_ingreso ? orden.fecha_ingreso.toDate() : null;
                return fechaIngreso && fechaIngreso.getFullYear() === ano; // Solo incluir si tiene fecha
            });

            // Agrupar las órdenes por mes y sumar el total de ventas por mes
            const agrupadoPorMes = filtrado.reduce((acc, orden) => {
                const fechaIngreso = orden.fecha_ingreso.toDate();
                const mes = fechaIngreso.getMonth() + 1; // Extraer el mes
                const totalOrden = typeof orden.total === 'number' ? orden.total : 0; // Asegurarse de que sea un número
                const impuesto = totalOrden * 0.08; // Calcular el impuesto del 8%

                // Sumar el total con el impuesto
                const totalConImpuesto = totalOrden + impuesto;

                if (!acc[mes]) {
                    acc[mes] = 0; // Inicializa el total en 0 si no existe el mes
                }
                acc[mes] += totalConImpuesto; // Sumar el total con impuesto al total del mes
                return acc;
            }, {});

            // Calcular el mes con mayor venta
            const mesMayor = Object.entries(agrupadoPorMes).reduce((max, curr) => {
                return curr[1] > max[1] ? curr : max;
            }, [0, 0]);

            setMesConMayorVenta(mesMayor[0]); // Guardar el mes con mayor venta (1-12)

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

            // Calcular productos más vendidos
            const productosCount = {};
            const metodoCount = {};
            const categoriasCount = {};

            filtrado.forEach(orden => {
                orden.orden.forEach(item => {
                    // Contar productos vendidos
                    const nombreProducto = item.nombre;
                    const cantidad = item.cantidad;
                    const categoria = item.categoria; // Asegúrate de que los productos tengan este campo

                    if (!productosCount[nombreProducto]) {
                        productosCount[nombreProducto] = { total: 0, cantidad: 0 };
                    }
                    productosCount[nombreProducto].total += (item.precio * cantidad);
                    productosCount[nombreProducto].cantidad += cantidad;

                    // Contar categorías
                    if (!categoriasCount[categoria]) {
                        categoriasCount[categoria] = 0;
                    }
                    categoriasCount[categoria] += (item.precio * cantidad); // Sumar ingresos por categoría

                    // Contar métodos de pago
                    const metodoPago = orden.tipoPago; // Asegúrate de que existe
                    if (!metodoCount[metodoPago]) {
                        metodoCount[metodoPago] = 0;
                    }
                    metodoCount[metodoPago]++;
                });
            });

            // Obtener productos más vendidos
            const productosArray = Object.entries(productosCount).map(([nombre, { total, cantidad }]) => ({
                nombre,
                total,
                cantidad,
            })).sort((a, b) => b.total - a.total);

            setProductosMasVendidos(productosArray);

            // Obtener método más utilizado
            const metodoMasUtilizado = Object.entries(metodoCount).reduce((a, b) => b[1] > a[1] ? b : a, ['', 0])[0];
            setMetodoMasUtilizado(metodoMasUtilizado);

            // Obtener distribución por categorías
            setDistribucionCategorias(categoriasCount);
        });

        return () => unsubscribe(); // Cleanup
    }, [ano, db]); // Actualizar cuando cambie el año o `db`

    const data = {
        labels: datos.map(dato => `Mes ${dato.mes}`),
        datasets: [{
            label: 'Ingresos del año por mes',
            data: datos.map(dato => dato.total),
            backgroundColor: 'rgba(255, 13, 13, 0.562)',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 1
        }]
    };

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

        if (datos.length === 0) {
            doc.text('No se encontraron datos para generar el reporte.', 14, 80);
            doc.save(`Reporte_Ingresos_${ano}.pdf`);
            return;
        }

        const totalIngresos = datos.reduce((sum, dato) => sum + dato.total, 0);

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
        const textoIngresos = `Durante el año ${ano}, la cafeteria "Oso de la Montaña" generó un total de $${totalIngresos.toLocaleString('es-CO')} COP en ingresos (incluyendo impuestos).`;
        doc.text(textoIngresos, 14, 80, { maxWidth: pageWidth - 28 });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('Detalle de Ingresos por Mes', pageWidth / 2, 100, { align: 'center' });

        const tableColumn = ['Mes', 'Ingresos Totales (incluyendo impuestos)'];
        const tableRows = datos.map(dato => [`Mes ${dato.mes}`, `$${dato.total.toLocaleString('es-CO')}`]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 110,
            theme: 'grid',
            styles: { fontSize: 10, font: "helvetica" },
            headStyles: { fillColor: [255, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" }
        });

        doc.addPage();
        addDecorativeBorders(); // Add borders to new page
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text('Análisis de Ventas', 14, 20);

        // 1. Mes con mayor venta
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('Mes con Mayor Venta', 14, 40);
        doc.setFont("helvetica", "normal");
        doc.text(`El mes con mayor venta es: ${mesConMayorVenta || 'No disponible'}`, 14, 50);

        // 2. Producto más vendido en el mes
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('Producto Más Vendido', 14, 70);
        const productoMasVendido = productosMasVendidos[0];
        if (productoMasVendido) {
            doc.text(`El producto más vendido en el mes de ${mesConMayorVenta} es: ${productoMasVendido.nombre}, con una cantidad de ${productoMasVendido.cantidad} vendida.`, 14, 80);
        } else {
            doc.text('No hay productos vendidos.', 14, 80);
        }

        // 3. Cantidad de productos vendidos en el año
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('Cantidad de Productos Vendidos en el Año', 14, 100);

        const productosVendidosRows = productosMasVendidos.map(producto => [
            producto.nombre,
            producto.cantidad
        ]);

        doc.autoTable({
            head: [['Producto', 'Cantidad Vendida']],
            body: productosVendidosRows,
            startY: 110,
            theme: 'grid',
            styles: { fontSize: 10, font: "helvetica" },
            headStyles: { fillColor: [200, 255, 200], textColor: [0, 0, 0], fontStyle: "bold" }
        });

        // 4. Método más utilizado
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('Método de Pago Más Utilizado', 14, doc.autoTable.previous.finalY + 20);
        doc.setFont("helvetica", "normal");
        doc.text(`Método más utilizado: ${metodoMasUtilizado || 'No disponible'}`, 14, doc.autoTable.previous.finalY + 30);

        // Guardar PDF
        doc.save(`Reporte_Ingresos_${ano}.pdf`);
    };

    return (
        <div className="card">
            <h2 className="text-2xl font-light mb-4">Gráfica Anual - {ano}</h2>
            
            <div className="mb-4">
                <label htmlFor="ano" className=" mr-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400">Año:</label>
                <select
                    id="ano"
                    value={ano}
                    onChange={(e) => setAno(Number(e.target.value))}
                    className="border p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"

                >
                    {Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i)).map(año => (
                        <option key={año} value={año}>{año}</option>
                    ))}
                </select>
            </div>

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

            {mensaje ? (
                <p>{mensaje}</p> // Muestra el mensaje si no hay datos
            ) : (
                <Chart type="bar" data={data} />
            )}
        </div>
    );
};

export default GraficaAno;