import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    NativeBaseProvider,
    Box,
    Text,
    Heading,
    Button,
    Center
} from 'native-base';
import globalStyles from '../styles/global';
import { useNavigation } from '@react-navigation/native';
import PedidoContext from '../context/pedidos/pedidosContext';
import { doc, onSnapshot } from 'firebase/firestore';
import firebase from '../firebase';
import Countdown from 'react-countdown';

const ProgresoPedido = () => {
    const navigation = useNavigation();
    const { idpedido } = useContext(PedidoContext);

    const [tiempo, guardarTiempo] = useState(0);
    const [completado, guardarCompletado] = useState(false);

    useEffect(() => {
        const obtenerProducto = () => {
            const docRef = doc(firebase.db, 'ordenes', idpedido);
            onSnapshot(docRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    guardarTiempo(data.tiempoentrega);
                    guardarCompletado(data.completado);
                }
            });
        };
        obtenerProducto();
    }, [idpedido]);

    // Muestra el countdown en la pantalla
    const renderer = ({ minutes, seconds }) => {
        return (
            <Text style={styles.tiempo}>{minutes}:{seconds}</Text>
        );
    };

    return (
        <NativeBaseProvider>
            <Box style={globalStyles.contenedor}>
                <Center style={[globalStyles.contenido, { marginTop: 10 }]}>
                    {tiempo === 0 && (
                        <>
                            <Text style={{ textAlign: 'center' }}>Hemos recibido tu orden...</Text>
                            <Text style={{ textAlign: 'center' }}>Estamos calculando el tiempo de entrega</Text>
                        </>
                    )}

                    {!completado && tiempo > 0 && (
                        <>
                            <Text style={{ textAlign: 'center' }}>Su orden estará lista en:</Text>
                            <Text> 
                            <Countdown
                                date={Date.now() + tiempo * 60000}
                                renderer={renderer}
                            />
                            </Text>
                        </>
                    )}

                    {completado && (
                        <>
                            <Heading style={styles.textoCompletado}>Orden Lista</Heading>
                            <Heading size="md" style={styles.textoCompletado}>Por favor, pase a recoger su pedido</Heading>

                            <Button
                                onPress={() => navigation.navigate("NuevaOrden")}
                                style={[globalStyles.boton, { marginTop: 100 }]}
                            >
                                <Text style={globalStyles.botonTexto}>Comenzar Una Orden Nueva</Text>
                            </Button>
                        </>
                    )}
                </Center>
            </Box>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    tiempo: {
        marginBottom: 60,
        fontSize: 22,
        textAlign: 'center',
        marginTop: 80,
    },
    textoCompletado: {
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 10,
    }
});

export default ProgresoPedido;