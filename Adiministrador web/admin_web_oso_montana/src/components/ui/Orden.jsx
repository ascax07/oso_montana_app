import React, { useState, useContext, useEffect, useRef } from 'react'
import { FirebaseContext } from '../../firebase'
import { Toast } from 'primereact/toast'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MapPin, Phone, CreditCard, Calendar, DollarSign, Banknote, ReceiptText, X } from 'lucide-react'
import jsPDF from 'jspdf'

const Orden = ({ orden, isNew }) => {
  const [mensaje, setMensaje] = useState('')
  const [mostrarBotonConfirmarPago, setMostrarBotonConfirmarPago] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
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
        })
        return
      }

      const fechaIngreso = new Date(fechaPago)
      if (isNaN(fechaIngreso.getTime())) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Fecha de pago inválida.',
          life: 3000
        })
        return
      }

      const fechaIngresoTimestamp = Timestamp.fromDate(fechaIngreso)

      const docRef = doc(db, 'ordenes', id)
      await updateDoc(docRef, {
        confirmarPago: true,
        completado: true,
        fecha_ingreso: fechaIngresoTimestamp,
        tipoPago,
        nombreCliente,
        direccion,
        telefono,
        cedula
      })

      setMensaje('Pago confirmado y orden completada.')
      setMostrarBotonConfirmarPago(false)
      setModalVisible(false)

      toast.current.show({
        severity: 'success',
        summary: 'Pago Confirmado',
        detail: 'El pago ha sido realizado con éxito',
        life: 3000
      })
    } catch (error) {
      console.error("Error al confirmar el pago:", error)
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Hubo un problema al confirmar el pago.',
        life: 3000
      })
    }
  }

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
    const doc = new jsPDF()
    doc.setFontSize(12)
    doc.text(`NOMBRE: ${nombreCliente}`, 10, 10)
    doc.text(`DIRECCIÓN: ${direccion}`, 10, 20)
    doc.text(`TELÉFONO: ${telefono}`, 10, 30)
    doc.text(`C.C: ${cedula}`, 10, 40)
    doc.text(`FECHA: ${new Date(fechaPago).toLocaleString('es-CO')}`, 10, 50)
    doc.text(`CAJERO: ADMINISTRADOR DE LA TIENDA`, 10, 60)
    doc.text(`CANT DESCRIPCION   IMPORTE`, 10, 70)
    doc.text(`==========================`, 10, 75)

    orden.orden.forEach((platillos, index) => {
      doc.text(`${platillos.cantidad} ${platillos.nombre} $${platillos.cantidad * platillos.precio}`, 10, 80 + (index * 10))
    })

    const subtotal = orden.total
    const impuestoConsumo = calcularImpuestoConsumo(subtotal)
    const totalConImpuesto = subtotal + impuestoConsumo

    const numeroProductos = calcularNumeroProductos()

    doc.text(`NO. DE PRODUCTOS: ${numeroProductos}`, 10, 110)
    doc.text(`SUBTOTAL: ${formatearPrecio(subtotal)}`, 10, 120)
    doc.text(`IMPUESTO AL CONSUMO (8%): ${formatearPrecio(impuestoConsumo)}`, 10, 130)
    doc.text(`TOTAL A PAGAR: ${formatearPrecio(totalConImpuesto)}`, 10, 140)
    doc.text(`PAGO CON: ${tipoPago.toUpperCase()}`, 10, 150)
    doc.text(`GRACIAS POR SU COMPRA`, 10, 180)
    doc.text(`https://www.facebook.com/osodelamontanacafe/?locale=es_LA`, 10, 190)

    doc.save(`ticket_orden_oso_de_la_montana_${orden.id}.pdf`)
    
    toast.current.show({
      severity: 'success',
      summary: 'Ticket Generado',
      detail: 'El ticket ha sido generado exitosamente',
      life: 3000
    })
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-neumorph dark:shadow-neumorph-dark overflow-hidden"
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
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">Orden #{orden.id}</h3>
          <div className="space-y-2">
            {orden.orden.map((platillos) => (
              <p key={platillos.nombre} className="text-gray-600 dark:text-gray-300 flex justify-between">
                <span>{platillos.cantidad}x {platillos.nombre}</span>
                <span>{formatearPrecio(platillos.cantidad * platillos.precio)}</span>
              </p>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xl font-bold text-gray-800 dark:text-white flex justify-between">
              <span>Total:</span>
              <span>{formatearPrecio(orden.total)}</span>
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
              className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-neumorph-btn transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Marcar como lista
            </motion.button>
          )}
          {orden.lista && !orden.recogido && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-3 px-4 rounded-lg shadow-neumorph-btn text-center">
              Pendiente por entregar
            </div>
          )}
          {orden.recogido && !orden.confirmarPago && mostrarBotonConfirmarPago && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalVisible(true)}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-neumorph-btn transition duration-300 ease-in-out transform hover:-translate-y-1"
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-neumorph dark:shadow-neumorph-dark p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={cancelarPago}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 flex items-center">
                <ReceiptText className="mr-2" />
                Total: {formatearPrecio(orden.total)}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Operación</label>
                  <select
                    className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-neumorph-inset dark:shadow-neumorph-inset-dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value)}
                  >
                    <option value="pagoNormal">Pago Normal</option>
                    <option value="cotizacion">Cotización</option>
                  </select>
                </div>

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
                    const value =  e.target.value.replace(/\D/g, '')
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

                {modalType === 'pagoNormal' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <DollarSign className="mr-2" /> Tipo de Pago
                      </label>
                      <select
                        className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-neumorph-inset dark:shadow-neumorph-inset-dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
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
                          type="number"
                          value={dineroRecibido}
                          onChange={(e) => {
                            const recibido = parseFloat(e.target.value) || 0
                            setDineroRecibido(recibido >= 0 ? e.target.value : "")
                            calcularCambio(orden.total, recibido)
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
                  </>
                )}

                <AnimatePresence>
                  {mostrarBotonGenerarTicket && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generarTicket}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg shadow-neumorph-btn hover:from-green-500 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
                      >
                        <ReceiptText className="mr-2" /> Generar Ticket
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between space-x-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => confirmarPago(orden.id)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-neumorph-btn hover:from-blue-500 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                  >
                    Confirmar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelarPago}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg shadow-neumorph-btn hover:from-gray-300 hover:to-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-200"
                  >
                    Cancelar
                  </motion.button>
                </div>
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
      className={`w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-neumorph-inset dark:shadow-neumorph-inset-dark focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out ${readOnly ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
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