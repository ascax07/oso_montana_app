import React, { useState, useContext, useEffect, useRef } from 'react';
import { FirebaseContext } from '../../firebase';
import { Toast } from 'primereact/toast'; // Importa el componente Toast
import { Timestamp } from 'firebase/firestore'; // Importa Timestamp

const Orden = ({ orden }) => {
    const [mensaje, setMensaje] = useState('');
    const [mostrarBotonConfirmarPago, setMostrarBotonConfirmarPago] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [tipoPago, setTipoPago] = useState('');
    const [dineroRecibido, setDineroRecibido] = useState('');
    const [cambio, setCambio] = useState(0);
    const [fechaPago, setFechaPago] = useState(''); // Nuevo estado para la fecha de pago
    const { firebase } = useContext(FirebaseContext);
    const toast = useRef(null); // Referencia para el Toast

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

    const calcularCambio = (total, recibido) => {
        if (recibido >= total) {
            setCambio(recibido - total);
        } else {
            setCambio(0);
        }
    };

    const marcarComoLista = async (id) => {
      try {
          // Actualizar el estado de la orden en Firebase, marcándola como lista
          await firebase.db.collection('ordenes').doc(id).update({
              lista: true
          });
          // Aquí podrías manejar cualquier estado o mensaje que necesites mostrar
      } catch (error) {
          console.error('Error al marcar como lista:', error);
      }
  };
  

 const confirmarPago = async (id) => {
    try {
        if (!tipoPago) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar un método de pago.', life: 3000 });
            return;
        }

        if (!fechaPago) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar una fecha y hora de pago.', life: 3000 });
            return;
        }

        const fechaIngreso = new Date(fechaPago);
        if (isNaN(fechaIngreso.getTime())) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Fecha de pago inválida.', life: 3000 });
            return;
        }

        const fechaIngresoTimestamp = Timestamp.fromDate(fechaIngreso);

        // Asegúrate de que esta llamada a Firebase es correcta
        await firebase.db.collection('ordenes').doc(id).update({ 
            confirmarPago: true,
            completado: true,
            fecha_ingreso: fechaIngresoTimestamp 
        });

        setMensaje('Pago confirmado y orden completada.');
        setMostrarBotonConfirmarPago(false);
        setModalVisible(false);

        toast.current.show({ severity: 'success', summary: 'Pago Confirmado', detail: 'El pago ha sido realizado con éxito', life: 3000 });
    } catch (error) {
        console.error("Error al confirmar el pago:", error);
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al confirmar el pago.', life: 3000 });
    }
};

    
    const cancelarPago = () => {
        setModalVisible(false);
        setTipoPago('');
        setDineroRecibido('');
        setCambio(0);
        setFechaPago('');
        toast.current.show({ severity: 'warn', summary: 'Pago Cancelado', detail: 'El pago ha sido cancelado', life: 3000 });
    };
    
    const formatearPrecio = (precio) => {
        return precio.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    return (
      <div className="sm:w-1/2 lg:w-1/3 px-2 mb-4">
        <Toast ref={toast} /> {/* Añadir el componente Toast aquí */}
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
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">
                Total de la Orden: {formatearPrecio(orden.total)}
              </h2>

              <label className="block text-gray-700">Tipo de Pago</label>
              <select
                className="block w-full mt-2 mb-4 p-2 border rounded"
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

              {tipoPago === "efectivo" && (
                <>
                  <label className="block text-gray-700">Dinero Recibido</label>
                  <input
                    type="number"
                    className="block w-full mt-2 mb-4 p-2 border rounded"
                    value={dineroRecibido}
                    onChange={(e) => {
                      const recibido = parseFloat(e.target.value) || 0;
                      setDineroRecibido(recibido >= 0 ? e.target.value : "");
                      calcularCambio(orden.total, recibido);
                    }}
                  />

                  <label className="block text-gray-700">
                    Cambio a Devolver
                  </label>
                  <input
                    type="text" // Cambia a 'text' para mostrar el valor formateado
                    className="block w-full mt-2 mb-4 p-2 border rounded"
                    value={formatearPrecio(cambio)}
                    readOnly
                  />
                </>
              )}

              {/* Nuevo input para seleccionar la fecha y hora de pago */}
              <label className="block text-gray-700">
                Fecha y Hora de Pago
              </label>
              <input
                type="datetime-local"
                className="block w-full mt-2 mb-4 p-2 border rounded"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)} // Actualiza el estado con la fecha y hora seleccionadas
              />

              <div className="flex justify-between">
                <button
                  onClick={() => confirmarPago(orden.id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full mr-2"
                >
                  Confirmar
                </button>
                <button
                  onClick={cancelarPago}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

export default Orden;
