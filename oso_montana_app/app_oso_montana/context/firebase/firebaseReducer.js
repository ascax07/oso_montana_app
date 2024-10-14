import { OBTENER_PRODUCTOS_EXITO, ACTUALIZAR_STOCK } from '../../types';

export default (state, action) => {
    switch (action.type) {
        case OBTENER_PRODUCTOS_EXITO:
            return {
                ...state,
                menu: action.payload
            }
        case ACTUALIZAR_STOCK:
            return {
                ...state,
                menu: state.menu.map(producto => 
                    action.payload[producto.id] !== undefined
                        ? { ...producto, stock: action.payload[producto.id] }
                        : producto
                )
            }
        default:
            return state;
    }
}