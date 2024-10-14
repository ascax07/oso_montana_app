import React, { useReducer, useContext } from 'react';
import PedidoReducer from './pedidosReducer';
import PedidoContext from './pedidosContext';
import FirebaseContext from '../firebase/firebaseContext';
import {
    SELECCIONAR_PRODUCTO,
    CONFIRMAR_ORDENAR_PLATILLO,
    MOSTRAR_RESUMEN,
    ELIMINAR_PRODUCTO,
    PEDIDO_ORDENADO
} from '../../types';

const PedidoState = props => {
    const [state, dispatch] = useReducer(PedidoReducer, {
        pedido: [],
        platillo: null,
        total: 0,
        idpedido: '',
    });

    const { actualizarStock } = useContext(FirebaseContext);

    const seleccionarPlatillo = platillo => {
        dispatch({ 
            type: SELECCIONAR_PRODUCTO,
            payload: platillo
        });
    }

    const guardarPedido = pedido => {
        dispatch({
            type: CONFIRMAR_ORDENAR_PLATILLO,
            payload: pedido
        });
    }

    const mostrarResumen = total => {
        dispatch({
            type: MOSTRAR_RESUMEN,
            payload: total
        });
    }

    const eliminarProducto = id => {
        dispatch({
            type: ELIMINAR_PRODUCTO,
            payload: id
        });
    }

    const pedidoRealizado = id => {
        dispatch({
            type: PEDIDO_ORDENADO,
            payload: id
        });
    }

    const verificarYActualizarStock = async () => {
        let stockSuficiente = true;
        let productosActualizados = {};

        for (let platillo of state.pedido) {
            if (platillo.stock !== undefined) {
                if (platillo.cantidad > platillo.stock) {
                    stockSuficiente = false;
                    break;
                } else {
                    productosActualizados[platillo.id] = platillo.stock - platillo.cantidad;
                }
            }
        }

        if (stockSuficiente) {
            await actualizarStock(productosActualizados);
        }

        return stockSuficiente;
    }

    return (
        <PedidoContext.Provider
            value={{
                pedido: state.pedido,
                platillo: state.platillo,
                total: state.total,
                idpedido: state.idpedido,
                seleccionarPlatillo,
                guardarPedido,
                mostrarResumen,
                eliminarProducto,
                pedidoRealizado,
                verificarYActualizarStock
            }}
        >
            {props.children}
        </PedidoContext.Provider>
    )
}

export default PedidoState;