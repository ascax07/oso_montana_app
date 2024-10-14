import React, { useReducer, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import firebase from '../../firebase';
import FirebaseReducer from './firebaseReducer';
import FirebaseContext from './firebaseContext';
import { OBTENER_PRODUCTOS_EXITO, ACTUALIZAR_STOCK } from '../../types';
import _ from 'lodash';

const FirebaseState = (props) => {
    const initialState = {
        menu: [],
    };

    const [state, dispatch] = useReducer(FirebaseReducer, initialState);

    const obtenerProductos = () => {
        const colRef = collection(firebase.db, 'productos');
        const colQ = query(colRef, where('existencia', '==', true));

        const unsubscribe = onSnapshot(colQ, (querySnapshot) => {
            const platillos = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const sortedPlatillos = _.sortBy(platillos, 'categoria');

            dispatch({
                type: OBTENER_PRODUCTOS_EXITO,
                payload: sortedPlatillos,
            });
        }, (error) => {
            console.error("Error al obtener productos: ", error);
        });

        return unsubscribe;
    };

    // Nueva función para actualizar el stock
    const actualizarStock = async (productosActualizados) => {
        try {
            for (const [id, nuevoStock] of Object.entries(productosActualizados)) {
                const platilloRef = doc(firebase.db, 'productos', id);
                await updateDoc(platilloRef, { stock: nuevoStock });
            }
            dispatch({
                type: ACTUALIZAR_STOCK,
                payload: productosActualizados,
            });
        } catch (error) {
            console.error("Error al actualizar el stock: ", error);
        }
    };

    useEffect(() => {
        const unsubscribe = obtenerProductos();
        return () => unsubscribe();
    }, []);

    return (
        <FirebaseContext.Provider
            value={{
                menu: state.menu,
                firebase,
                obtenerProductos,
                actualizarStock,
            }}
        >
            {props.children} 
        </FirebaseContext.Provider>
    );
};

export default FirebaseState;