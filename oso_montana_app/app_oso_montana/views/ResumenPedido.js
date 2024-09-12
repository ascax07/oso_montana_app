/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import {
    NativeBaseProvider,
    Box,
    VStack,
    HStack,
    Image,
    Text,
    Heading,
    Button,
    ScrollView,
    Center,
    Pressable
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../styles/global';
import { collection, addDoc } from 'firebase/firestore';
import firebase from '../firebase';
import PedidoContext from '../context/pedidos/pedidosContext';

const ResumenPedido = () => {
    const navigation = useNavigation();

    // context de pedido
    const { pedido, total, mostrarResumen, eliminarProducto, pedidoRealizado } = useContext(PedidoContext);

    useEffect(() => {
        calcularTotal();
    }, [pedido]);

    const calcularTotal = () => {
        let nuevoTotal = 0;
        nuevoTotal = pedido.reduce((nuevoTotal, articulo) => nuevoTotal + articulo.total, 0);
        mostrarResumen(nuevoTotal);
    };

    // redirecciona a Progreso pedido
    const progresoPedido = () => {
        Alert.alert(
            'Revisa tu pedido',
            'Una vez que realizas tu pedido no podrás cambiarlo',
            [
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        // Crear un objeto
                        const pedidoObj = {
                            tiempoentrega: 0,
                            completado: false,
                            total: Number(total),
                            orden: pedido, // array
                            creado: Date.now()
                        };

                        try {
                            // Agregar el documento a Firestore
                            const pedido = await addDoc(collection(firebase.db, 'ordenes'), pedidoObj);
                            pedidoRealizado(pedido.id);

                            // Redireccionar a progreso pedido
                            navigation.navigate("ProgresoPedido");
                        } catch (error) {
                            console.log(error);
                        }
                    }
                },
                { text: 'Revisar', style: 'cancel' }
            ]
        );
    };

    // Elimina un producto del arreglo de pedido
    const confirmarEliminacion = id => {
        Alert.alert(
            '¿Deseas eliminar este artículo?',
            'Una vez eliminado no se puede recuperar',
            [
                {
                    text: 'Confirmar',
                    onPress: () => {
                        // Eliminar del state
                        eliminarProducto(id);
                    }
                },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    return (
        <NativeBaseProvider>
            <Box style={globalStyles.contenedor}>
                <ScrollView style={globalStyles.contenido}>
                    <Heading style={globalStyles.titulo}>Resumen Pedido</Heading>
                    {pedido.map((platillo, i) => {
                        const { cantidad, nombre, imagen, id, precio } = platillo;
                        return (
                            <Box key={id + i} borderBottomWidth={1} borderColor="coolGray.200" padding={2}>
                                <HStack space={2}>
                                    <Image size="lg" source={{ uri: imagen }} alt={nombre} />
                                    <VStack>
                                        <Text bold>{nombre}</Text>
                                        <Text>Cantidad: {cantidad}</Text>
                                        <Text>Precio: $ {precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>

                                        <Button
                                            onPress={() => confirmarEliminacion(id)}
                                            colorScheme="danger"
                                            mt={4}
                                        >
                                            <Text style={[globalStyles.botonTexto, { color: '#FFF' }]}>Eliminar</Text>
                                        </Button>
                                    </VStack>
                                </HStack>
                            </Box>
                        );
                    })}
                    <Text style={globalStyles.cantidad}>Total a Pagar: $  {total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                    <Button
                        onPress={() => navigation.navigate('Menu')}
                        colorScheme="dark"
                        mt={6}
                    >
                        <Text style={[globalStyles.botonTexto, { color: '#FFF' }]}>Seguir Pidiendo</Text>
                    </Button>
                </ScrollView>

                <Button style={globalStyles.boton} >
                    <Pressable
                        onPress={() => progresoPedido()}
                  
                    >
                        <Center>
                      
                            <Text style={globalStyles.botonTexto}>Ordenar Pedido</Text>
                          
                        </Center>
                    </Pressable>
                </Button>
            </Box>
        </NativeBaseProvider>
    );
}

export default ResumenPedido;