import React, { useReducer, useEffect } from 'react';

import firebase from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import FirebaseReducer from './firebaseReducer';
import FirebaseContext from './firebaseContext';

import { OBTENER_PRODUCTOS_EXITO } from '../../types';
import _ from 'lodash';



const FirebaseState = props => {

    // Crear state inicial
    const initialState = {
        menu: []
    }

    // useReducer con dispatch para ejecutar las funciones
    const [state, dispatch] = useReducer(FirebaseReducer, initialState);

    const obtenerProductos = () => {
        const colRef = collection(firebase.db, 'productos');
        const colQ = query(colRef, where('existencia', '==', true)); // Filtrar por existencia

        let platillos = [];
        const unsuscribe = onSnapshot(colQ, querySnapshot => {                
            querySnapshot.docs.forEach(doc => {
                platillos.push({
                    id: doc.id,
                    ...doc.data() // Aquí obtenemos todos los datos del documento
                });
            });

            //Ordernar por categoria con lodash
            platillos= _.sortBy(platillos, 'categoria');

            // console.log(platillos)

            //Tenemos los resultados de la base de datos
            dispatch({
                type: OBTENER_PRODUCTOS_EXITO,
                payload: platillos
            });
        });
    }

    // Llamar a obtenerProductos cuando el componente se monte
    useEffect(() => {
        obtenerProductos();
    }, []);

    return (
        <FirebaseContext.Provider
            value={{
                menu: state.menu,
                firebase,
                obtenerProductos
            }}
        >
            {props.children}
        </FirebaseContext.Provider>
    )
}

export default FirebaseState;