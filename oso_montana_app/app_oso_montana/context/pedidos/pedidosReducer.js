import {
    SELECCIONAR_PRODUCTO,
    CONFIRMAR_ORDENAR_PLATILLO,
    MOSTRAR_RESUMEN,
    ELIMINAR_PRODUCTO,
    PEDIDO_ORDENADO,
    VERIFICAR_Y_ACTUALIZAR_STOCK
} from '../../types'

export default (state, action) => {
    switch (action.type) {
        case SELECCIONAR_PRODUCTO:
            return {
                ...state,
                platillo: action.payload
            }
        case CONFIRMAR_ORDENAR_PLATILLO:
            return {
                ...state,
                pedido: [...state.pedido, action.payload]
            }
        case MOSTRAR_RESUMEN:
            return {
                ...state,
                total: action.payload
            }
        case ELIMINAR_PRODUCTO:
            return {
                ...state,
                pedido: state.pedido.filter(articulo => articulo.id !== action.payload)
            }
        case PEDIDO_ORDENADO:
            return {
                ...state,
                pedido: [],
                total: 0,
                idpedido: action.payload
            }
        case VERIFICAR_Y_ACTUALIZAR_STOCK:
            return {
                ...state,
                pedido: state.pedido.map(platillo => ({
                    ...platillo,
                    stock: action.payload[platillo.id] !== undefined 
                        ? action.payload[platillo.id] 
                        : platillo.stock
                }))
            }
        default:
            return state;
    }
}