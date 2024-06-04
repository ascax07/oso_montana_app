import React, { useReducer } from 'react';


import PedidoReducer from './pedidosReducer';
import PedidoContext from './pedidosContext';

const PedidoState = props => {


    // Crear state inicial
    const initialState = {
        peido: []
    }

    // useReducer con dispatch  para ejecutar las funciones
    const [state, dispatch] = useReducer(PedidoReducer, initialState);

    return (
        <PedidoContext.Provider
        value={{
            peido: state.peido
        }}
        >
            {props.children}
        </PedidoContext.Provider>
    )


}

export default PedidoState;