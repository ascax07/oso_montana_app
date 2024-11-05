import React, { useState, useContext, useEffect, useRef } from 'react'
import { FirebaseContext } from '../../firebase'
import { Toast } from 'primereact/toast'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MapPin, Phone, CreditCard, Calendar, DollarSign, Banknote, ReceiptText, X, Pencil, Save, Plus, Minus, Trash2 } from 'lucide-react'
import jsPDF from 'jspdf'

const Orden = ({ orden, isNew }) => {
  const [mensaje, setMensaje] = useState('')
  const [mostrarBotonConfirmarPago, setMostrarBotonConfirmarPago] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalEditarVisible, setModalEditarVisible] = useState(false)
  const [productosEditados, setProductosEditados] = useState([])
  const [tipoPago, setTipoPago] = useState('')
  const [dineroRecibido, setDineroRecibido] = useState('')
  const [cambio, setCambio] = useState(0)
  const [fechaPago, setFechaPago] = useState('')
  const [modalType, setModalType] = useState('pagoNormal')
  const [nombreCliente, setNombreCliente] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [cedula, setCedula] = useState('')
  const [mostrarBotonGenerarTicket, setMostrarBotonGenerarTicket] = useState(false)
  const { db } = useContext(FirebaseContext)
  const toast = useRef(null)

  useEffect(() => {
    const checkConfirmarPago = async () => {
      if (orden.recogido && !orden.confirmarPago) {
        setMostrarBotonConfirmarPago(true)
      } else {
        setMostrarBotonConfirmarPago(false)
      }
    }

    checkConfirmarPago()
  }, [orden])

  useEffect(() => {
    if (nombreCliente && direccion && telefono && cedula && tipoPago && fechaPago) {
      setMostrarBotonGenerarTicket(true)
    } else {
      setMostrarBotonGenerarTicket(false)
    }
  }, [nombreCliente, direccion, telefono, cedula, tipoPago, fechaPago])

  const calcularCambio = (total, recibido) => {
    if (recibido >= total) {
      setCambio(recibido - total)
    } else {
      setCambio(0)
    }
  }

  const marcarComoLista = async (id) => {
    try {
      const docRef = doc(db, 'ordenes', id)
      await updateDoc(docRef, { lista: true })
      toast.current.show({
        severity: 'success',
        summary: 'Orden Lista',
        detail: 'La orden ha sido marcada como lista',
        life: 3000
      })
    } catch (error) {
      console.error('Error al marcar como lista:', error)
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo marcar la orden como lista',
        life: 3000
      })
    }
  }

  const confirmarPago = async (id) => {
    try {
        if (!nombreCliente || !direccion || !telefono || !cedula || !tipoPago || !fechaPago) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe rellenar todos los campos obligatorios.',
                life: 3000
            });
            return;
        }

        const fechaIngreso = new Date(fechaPago);
        if (isNaN(fechaIngreso.getTime())) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Fecha de pago inválida.',
                life: 3000
            });
            return;
        }

        const fechaIngresoTimestamp = Timestamp.fromDate(fechaIngreso);

        const docRef = doc(db, 'ordenes', id);
        await updateDoc(docRef, {
            confirmarPago: true,
            completado: true,
            fecha_ingreso: fechaIngresoTimestamp,
            tipoPago,
            nombreCliente,
            direccion,
            telefono,
            cedula,
            orden: productosEditados.length > 0 ? productosEditados : orden.orden
        });

        // Call the generarTicket function here
        generarTicket();

        setMensaje('Pago confirmado y orden completada.');
        setMostrarBotonConfirmarPago(false);
        setModalVisible(false);

        toast.current.show({
            severity: 'success',
            summary: 'Pago Confirmado',
            detail: 'El pago ha sido realizado con éxito y el ticket ha sido generado.',
            life: 3000
        });
    } catch (error) {
        console.error("Error al confirmar el pago:", error);
        toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Hubo un problema al confirmar el pago.',
            life: 3000
        });
    }
};


  const cancelarPago = () => {
    setModalVisible(false)
    setTipoPago('')
    setDineroRecibido('')
    setCambio(0)
    setFechaPago('')
    setNombreCliente('')
    setDireccion('')
    setTelefono('')
    setCedula('')
    toast.current.show({
      severity: 'info',
      summary: 'Pago Cancelado',
      detail: 'El proceso de pago ha sido cancelado',
      life: 3000
    })
  }

  const handleDineroRecibidoChange = (e) => {
    let value = e.target.value;

    // Eliminar caracteres no numéricos (excepto punto o coma)
    value = value.replace(/[^0-9,.]/g, '');

    // Convertir el valor a número y luego formatearlo
    const parsedValue = parseFloat(value.replace(/,/g, '').replace(/\./g, '').replace(',', '.')) || 0;

    // Actualizar el estado con el valor formateado en pesos colombianos
    setDineroRecibido(formatearPrecio(parsedValue)); // Aquí se aplica el formateo al valor numérico
  };


  const formatearPrecio = (precio) => {
    return precio.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const calcularImpuestoConsumo = (total) => {
    return total * 0.08
  }

  const calcularNumeroProductos = () => {
    return orden.orden.reduce((total, platillo) => total + platillo.cantidad, 0)
  }

  const generarTicket = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`NOMBRE: ${nombreCliente}`, 10, 10);
    doc.text(`DIRECCIÓN: ${direccion}`, 10, 20);
    doc.text(`TELÉFONO: ${telefono}`, 10, 30);
    doc.text(`C.C: ${cedula}`, 10, 40);
    doc.text(`FECHA: ${new Date(fechaPago).toLocaleString('es-CO')}`, 10, 50);
    doc.text(`CAJERO: ADMINISTRADOR DE LA TIENDA`, 10, 60);
    doc.text(`CANT DESCRIPCION   IMPORTE`, 10, 70);
    doc.text(`==========================`, 10, 75);

    const productosFinales = productosEditados.length > 0 ? productosEditados : orden.orden;
    productosFinales.forEach((platillo, index) => {
        doc.text(`${platillo.cantidad} ${platillo.nombre} $${platillo.cantidad * platillo.precio}`, 10, 80 + (index * 10));
    });

    const subtotal = productosFinales.reduce((total, platillo) => total + platillo.cantidad * platillo.precio, 0);
    const impuestoConsumo = calcularImpuestoConsumo(subtotal);
    const subtotalSinImpuesto = subtotal - impuestoConsumo;
    const totalConImpuesto = subtotal;
    const numeroProductos = productosFinales.reduce((total, platillo) => total + platillo.cantidad, 0);

    doc.text(`NO. DE PRODUCTOS: ${numeroProductos}`, 10, 110);
    doc.text(`SUBTOTAL: ${formatearPrecio(subtotalSinImpuesto)}`, 10, 120);
    doc.text(`IMPUESTO AL CONSUMO (8%): ${formatearPrecio(impuestoConsumo)}`, 10, 130);
    doc.text(`TOTAL A PAGAR: ${formatearPrecio(totalConImpuesto)}`, 10, 140);
    doc.text(`PAGO CON: ${tipoPago.toUpperCase()}`, 10, 150);
    doc.text(`GRACIAS POR SU COMPRA`, 10, 180);
    doc.text(`https://www.facebook.com/osodelamontanacafe/?locale=es_LA`, 10, 190);

    doc.save(`ticket_orden_oso_de_la_montana_${orden.id}.pdf`);

    // Check if toast.current is defined
    if (toast.current) {
        toast.current.show({
            severity: 'success',
            summary: 'Ticket Generado',
            detail: `Ticket generado exitosamente de la orden: ${orden.id}`,
            life: 3000
        });
    } else {
        console.error("Toast reference is null or undefined");
    }
};



  const handleEditarProductos = () => {
    // Inicializar los productos con las cantidades actuales de la orden
    setProductosEditados(orden.orden.map(platillo => ({
      ...platillo,
      cantidadTemp: platillo.cantidad,  // Guardamos la cantidad original para editar
    })));
    setModalEditarVisible(true);
  }


  const handleChangeCantidad = (index, nuevaCantidad) => {
    // Asegurarse de que la cantidad no sea negativa
    const nuevosProductos = [...productosEditados];
    nuevosProductos[index].cantidadTemp = Math.max(nuevaCantidad, 1); // Evita cantidades negativas
    setProductosEditados(nuevosProductos);
  };

  const guardarCambios = async () => {
    try {
      const nuevosProductos = productosEditados.map(p => ({
        ...p,
        cantidad: p.cantidadTemp
      }))

      const docRef = doc(db, 'ordenes', orden.id)
      await updateDoc(docRef, { orden: nuevosProductos })

      setModalEditarVisible(false)
      toast.current.show({
        severity: 'success',
        summary: 'Cambios Guardados',
        detail: 'Los cambios en los productos han sido guardados exitosamente.',
        life: 3000
      })
    } catch (error) {
      console.error('Error al guardar los cambios:', error)
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron guardar los cambios.',
        life: 3000
      })
    }
  }

  const calcularTotalActual = () => {
    return (productosEditados.length > 0 ? productosEditados : orden.orden)
      .reduce((total, platillo) => total + platillo.cantidad * platillo.precio, 0)
  }

  return (
    <motion.div
      layout
      initial={isNew ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5
      }}
      className="w-full md:w-1/2 lg:w-1/3 p-4"
    >
      <Toast ref={toast} />
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        animate={isNew ? {
          boxShadow: [
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          ]
        } : {}}
        transition={{ repeat: isNew ? 2 : 0, duration: 1 }}
      >
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Orden #{orden.id}</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditarProductos}
              className="p-2 bg-yellow-500 text-white rounded-full shadow-md hover:bg-yellow-600 transition-colors duration-200"
            >
              <Pencil size={20} />
            </motion.button>
          </div>
          <div className="space-y-2">
            {(productosEditados.length > 0 ? productosEditados : orden.orden).map((platillo) => (
              <p key={platillo.nombre} className="text-gray-600 dark:text-gray-300 flex justify-between">
                <span>{platillo.cantidad}x {platillo.nombre}</span>
                <span>{formatearPrecio(platillo.cantidad * platillo.precio)}</span>
              </p>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xl font-bold text-gray-800 dark:text-white flex justify-between">
              <span>Total:</span>
              <span>{formatearPrecio(calcularTotalActual())}</span>
            </p>
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold">Mesa:</span> {orden.mesa}</p>
            <p><span className="font-semibold">Solicitud cliente:</span> {orden.solicitudCliente || 'N/A'}</p>
            <p><span className="font-semibold">Fecha:</span> {orden.fecha_ingreso.toDate().toLocaleString('es-CO')}</p>
          </div>
        </div>
        <div className="px-6 pb-6">
          {!orden.lista && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => marcarComoLista(orden.id)}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-4  rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Marcar como lista
            </motion.button>
          )}
          {orden.lista && !orden.recogido && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-3 px-4 rounded-lg shadow-md text-center">
              Pendiente por entregar
            </div>
          )}
          {orden.recogido && !orden.confirmarPago && mostrarBotonConfirmarPago && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalVisible(true)}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Confirmar Pago
            </motion.button>
          )}
          {mensaje && (
            <p className="mt-4 text-green-500 font-semibold text-center">{mensaje}</p>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={cancelarPago}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 flex items-center">
                <ReceiptText className="mr-2" />
                Confirmar Pago
              </h2>

              <div className="space-y-4">
                <InputField
                  icon={<User className="mr-2" />}
                  label="Nombre del Cliente"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  required
                />

                <InputField
                  icon={<MapPin className="mr-2" />}
                  label="Dirección"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />

                <InputField
                  icon={<Phone className="mr-2" />}
                  label="Teléfono"
                  value={telefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setTelefono(value)
                  }}
                  maxLength={10}
                  required
                />

                <InputField
                  icon={<CreditCard className="mr-2" />}
                  label="Cédula"
                  value={cedula}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setCedula(value)
                  }}
                  maxLength={10}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <DollarSign className="mr-2" /> Tipo de Pago
                  </label>
                  <select
                    className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    value={tipoPago}
                    onChange={(e) => {
                      setTipoPago(e.target.value)
                      if (e.target.value !== "efectivo") {
                        setDineroRecibido("")
                        setCambio(0)
                      }
                    }}
                  >
                    <option value="">Seleccionar</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                  {!tipoPago && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
                </div>

                {tipoPago === "efectivo" && (
                  <>
                    <InputField
                      icon={<Banknote className="mr-2" />}
                      label="Dinero Recibido"
                      type="text"  // Cambiar a 'text' para permitir comas y puntos
                      value={dineroRecibido}  // Este es el valor que se muestra en el campo
                      onChange={(e) => {
                        // Capturar el valor ingresado
                        let value = e.target.value;

                        // Eliminar caracteres no numéricos, excepto el punto y la coma
                        value = value.replace(/[^0-9,.-]/g, '');  // Permitir solo números, coma y punto

                        // Convierte el valor a número (sin formato) para cálculos
                        const parsedValue = parseFloat(value.replace(/,/g, '').replace(/\./g, '').replace(',', '.')) || 0;

                        // Actualiza el valor del estado con el valor formateado
                        setDineroRecibido(formatearPrecio(parsedValue));  // Formatear el valor como COP

                        // Calcular el cambio
                        calcularCambio(calcularTotalActual(), parsedValue);
                      }}
                    />

                    <InputField
                      icon={<DollarSign className="mr-2" />}
                      label="Cambio a Devolver"
                      value={formatearPrecio(cambio)}
                      readOnly
                    />
                  </>
                )}

                <InputField
                  icon={<Calendar className="mr-2" />}
                  label="Fecha y Hora de Pago"
                  type="datetime-local"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                  required
                />

      

                <div className="flex justify-between space-x-4 mt-6">
                <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => confirmarPago(orden.id)}
    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
>
    Confirmar y Generar Ticket
</motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelarPago}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg shadow-md hover:from-gray-300 hover:to-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-200"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalEditarVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setModalEditarVisible(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2">
                Editar Productos
              </h2>

              <div className="space-y-4">
                {productosEditados.map((platillo, index) => (
                  <div key={platillo.nombre} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{platillo.nombre}</span>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChangeCantidad(index, platillo.cantidadTemp - 1)}
                        className="p-1 bg-red-500 text-white rounded-full shadow-md"
                      >
                        <Minus size={16} />
                      </motion.button>
                      <span className="text-gray-700 dark:text-gray-300 w-8 text-center">{platillo.cantidadTemp}</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChangeCantidad(index, platillo.cantidadTemp + 1)}
                        className="p-1 bg-green-500 text-white rounded-full shadow-md"
                      >
                        <Plus size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChangeCantidad(index, 0)}
                        className="p-1 bg-red-500 text-white rounded-full shadow-md"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-xl font-bold text-gray-800 dark:text-white">
                Total: {formatearPrecio(productosEditados.reduce((total, p) => total + p.cantidadTemp * p.precio, 0))}
              </div>

              <div className="flex justify-between space-x-4 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={guardarCambios}  // Llamada a guardar los cambios
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                >
                  <Save size={18} className="inline mr-2" /> Guardar Cambios
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModalEditarVisible(false)}  // Cerrar el modal
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg shadow-md hover:from-gray-300 hover:to-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-200"
                >
                  Cancelar
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const InputField = ({ icon, label, value, onChange, type = "text", required = false, maxLength, readOnly = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
      {icon} {label}
    </label>
    <input
      type={type}
      className={`w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out ${readOnly ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
      value={value}
      onChange={onChange}
      required={required}
      maxLength={maxLength}
      readOnly={readOnly}
    />
    {required && !value && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
    {maxLength && value && value.length < maxLength && (
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-yellow-500 text-xs mt-1"
      >
        Debe tener {maxLength} dígitos
      </motion.p>
    )}
  </div>
)

export default Orden