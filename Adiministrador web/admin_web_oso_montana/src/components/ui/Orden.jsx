import React, { useState, useContext, useEffect, useRef } from 'react';
import { FirebaseContext } from '../../firebase';
import { Toast } from 'primereact/toast';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Phone, CreditCard, Calendar, DollarSign, Banknote, ReceiptText } from 'lucide-react';
import jsPDF from 'jspdf';

const Orden = ({ orden }) => {
  const [mensaje, setMensaje] = useState('');
  const [mostrarBotonConfirmarPago, setMostrarBotonConfirmarPago] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoPago, setTipoPago] = useState('');
  const [dineroRecibido, setDineroRecibido] = useState('');
  const [cambio, setCambio] = useState(0);
  const [fechaPago, setFechaPago] = useState('');
  const [modalType, setModalType] = useState('pagoNormal');
  const [nombreCliente, setNombreCliente] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cedula, setCedula] = useState('');
  const [mostrarBotonGenerarTicket, setMostrarBotonGenerarTicket] = useState(false);
  const { db } = useContext(FirebaseContext);
  const toast = useRef(null);

  useEffect(() => {
    const checkConfirmarPago = async () => {
      if (orden.recogido && !orden.confirmarPago) {
        setMostrarBotonConfirmarPago(true);
      } else {
        setMostrarBotonConfirmarPago(false);
      }
    };

    checkConfirmarPago();
  }, [orden]);

  useEffect(() => {
    // Mostrar botón de generar ticket solo si todos los campos obligatorios están llenos
    if (nombreCliente && direccion && telefono && cedula && tipoPago && fechaPago) {
      setMostrarBotonGenerarTicket(true);
    } else {
      setMostrarBotonGenerarTicket(false);
    }
  }, [nombreCliente, direccion, telefono, cedula, tipoPago, fechaPago]);

  const calcularCambio = (total, recibido) => {
    if (recibido >= total) {
      setCambio(recibido - total);
    } else {
      setCambio(0);
    }
  };

  const marcarComoLista = async (id) => {
    try {
      const docRef = doc(db, 'ordenes', id);
      await updateDoc(docRef, { lista: true });
      console.log("Orden marcada como lista");
    } catch (error) {
      console.error('Error al marcar como lista:', error);
    }
  };

  const confirmarPago = async (id) => {
    try {
      if (!nombreCliente || !direccion || !telefono || !cedula) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe rellenar todos los campos obligatorios.',
          life: 3000
        });
        return;
      }

      if (!tipoPago) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe seleccionar un método de pago.',
          life: 3000
        });
        return;
      }

      if (!fechaPago) {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe seleccionar una fecha y hora de pago.',
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
        cedula
      });

      setMensaje('Pago confirmado y orden completada.');
      setMostrarBotonConfirmarPago(false);
      setModalVisible(false);

      toast.current.show({
        severity: 'success',
        summary: 'Pago Confirmado',
        detail: 'El pago ha sido realizado con éxito',
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
    setModalVisible(false);
    setTipoPago('');
    setDineroRecibido('');
    setCambio(0);
    setFechaPago('');
    setNombreCliente('');
    setDireccion('');
    setTelefono('');
    setCedula('');
    toast.current.show({
      severity: 'warn',
      summary: 'Pago Cancelado',
      detail: 'El pago ha sido cancelado',
      life: 3000
    });
  };

  const formatearPrecio = (precio) => {
    return precio.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const calcularImpuestoConsumo = (total) => {
    return total * 0.08;
  };

  const calcularNumeroProductos = () => {
    return orden.orden.reduce((total, platillo) => total + platillo.cantidad, 0);
  };

  const generarTicket = () => {
    const doc = new jsPDF();
    doc.text(`NOMBRE: ${nombreCliente}`, 10, 10);
    doc.text(`DIRECCIÓN: ${direccion}`, 10, 20);
    doc.text(`TELÉFONO: ${telefono}`, 10, 30);
    doc.text(`C.C: ${cedula}`, 10, 40);
    doc.text(`FECHA: ${new Date(fechaPago).toLocaleString('es-CO')}`, 10, 50);
    doc.text(`CANT DESCRIPCION   IMPORTE`, 10, 60);
    doc.text(`==========================`, 10, 65);


    orden.orden.forEach((platillos, index) => {
      doc.text(`${platillos.cantidad} ${platillos.nombre} $${platillos.cantidad * platillos.precio}`, 10, 70 + (index * 10));
    });

    const subtotal = orden.total;
    const impuestoConsumo = calcularImpuestoConsumo(subtotal);
    const totalConImpuesto = subtotal + impuestoConsumo;

    const numeroProductos = calcularNumeroProductos();

    doc.text(`NO. DE PRODUCTOS: ${numeroProductos}`, 10, 110);
    doc.text(`SUBTOTAL: $${formatearPrecio(subtotal)}`, 10, 120);
    doc.text(`IMPUESTO AL CONSUMO (8%): $${formatearPrecio(impuestoConsumo)}`, 10, 130);
    doc.text(`TOTAL A PAGAR: $${formatearPrecio(totalConImpuesto)}`, 10, 140);
    doc.text(`PAGO CON: ${tipoPago.toUpperCase()}`, 10, 150);

    doc.save(`ticket_orden_${orden.id}.pdf`);
  };

  return (
    <div className="sm:w-1/2 lg:w-1/3 px-2 mb-4">
      <Toast ref={toast} />
      <div className="p-3 shadow-md bg-white">
        <h1 className="text-yellow-600 text-lg font-bold"> {orden.id} </h1>
        {orden.orden.map((platillos) => (
          <p className="text-gray-600" key={platillos.nombre}>
            {" "}
            {platillos.cantidad} {platillos.nombre}{" "}
          </p>
        ))}
        <p className="text-gray-700 font-bold">
          Total a Pagar: {formatearPrecio(orden.total)}
        </p>
        <p className="text-gray-700 font-bold">Mesa {orden.mesa}</p>
        <p className="text-gray-700 font-bold">
          Solicitud cliente: {orden.solicitudCliente}
        </p>
        <p className="text-gray-700 font-bold">
          Fecha: {orden.fecha_ingreso.toDate().toLocaleString('es-CO')}
        </p>

        {!orden.lista && (
          <button
            onClick={() => marcarComoLista(orden.id)}
            type="button"
            className="bg-blue-800 hover:bg-blue-700 w-full mt-5 p-2 text-white uppercase font-bold"
          >
            Marcar como lista
          </button>
        )}

        {orden.lista && !orden.recogido && (
          <div className="bg-yellow-600 w-full mt-5 p-2 text-white uppercase font-bold text-center">
            Pendiente por entregar pedido
          </div>
        )}

        {orden.recogido &&
          !orden.confirmarPago &&
          mostrarBotonConfirmarPago && (
            <button
              onClick={() => setModalVisible(true)}
              type="button"
              className="bg-green-800 hover:bg-green-700 w-full mt-5 p-2 text-white uppercase font-bold"
            >
              Confirmar Pago
            </button>
          )}

        {mensaje && (
          <p className="text-green-600 font-bold mt-4">{mensaje}</p>
        )}
      </div>
      {modalVisible && (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-800 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-2 flex items-center">
          <ReceiptText className="mr-2" />
          Total de la Orden: {formatearPrecio(orden.total)}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Operación</label>
            <select
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition duration-150 ease-in-out"
              value={modalType}
              onChange={(e) => setModalType(e.target.value)}
            >
              <option value="pagoNormal">Pago Normal</option>
              <option value="cotizacion">Cotización</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <User className="mr-2" /> Nombre del Cliente
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition duration-150 ease-in-out"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
            />
            {!nombreCliente && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <MapPin className="mr-2" /> Dirección
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition duration-150 ease-in-out"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
            {!direccion && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <Phone className="mr-2" /> Teléfono
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition duration-150 ease-in-out"
              value={telefono}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setTelefono(value);
              }}
              maxLength={10}
            />
            {!telefono && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
            {telefono && telefono.length < 10 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-yellow-500 text-xs mt-1"
              >
                El número de teléfono debe tener 10 dígitos
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
              <CreditCard className="mr-2" /> Cédula
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition duration-150 ease-in-out"
              value={cedula}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setCedula(value);
              }}
              maxLength={10}
            />
            {!cedula && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
            {cedula && cedula.length < 10 && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-yellow-500 text-xs mt-1"
              >
                La cédula debe tener 10 dígitos
              </motion.p>
            )}
          </div>

          {modalType === 'pagoNormal' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <DollarSign className="mr-2" /> Tipo de Pago
                </label>
                <select
                  className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition duration-150 ease-in-out"
                  value={tipoPago}
                  onChange={(e) => {
                    setTipoPago(e.target.value);
                    if (e.target.value !== "efectivo") {
                      setDineroRecibido("");
                      setCambio(0);
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <Banknote className="mr-2" /> Dinero Recibido
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition duration-150 ease-in-out"
                      value={dineroRecibido}
                      onChange={(e) => {
                        const recibido = parseFloat(e.target.value) || 0;
                        setDineroRecibido(recibido >= 0 ? e.target.value : "");
                        calcularCambio(orden.total, recibido);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <DollarSign className="mr-2" /> Cambio a Devolver
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                      value={formatearPrecio(cambio)}
                      readOnly
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <Calendar className="mr-2" /> Fecha y Hora de Pago
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition duration-150 ease-in-out"
                  value={fechaPago}
                  onChange={(e) => setFechaPago(e.target.value)}
                />
                {!fechaPago && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
              </div>
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
                  className="w-full px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center justify-center"
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
              className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200"
            >
              Confirmar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cancelarPago}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-200"
            >
              Cancelar
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)}
    </div>
  );
};

export default Orden;
