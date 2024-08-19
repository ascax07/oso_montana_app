/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, Fragment } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    NativeBaseProvider,
    Box,
    VStack,
    HStack,
    ScrollView,
    Text,
    Image,
    Pressable
} from 'native-base';
import globalStyles from '../styles/global';

import FirebaseContext from '../context/firebase/firebaseContext';
import PedidoContext from '../context/pedidos/pedidosContext';

const Menu = () => {

    // Context de Firebase 
    const { menu, obtenerProductos } = useContext(FirebaseContext);

    // Context de pedido
    const { seleccionarPlatillo } = useContext(PedidoContext);

    // Hook para redireccionar
    const navigation = useNavigation();

    useEffect(() => {
        obtenerProductos();
    }, []);

    const mostrarHeading = (categoria, i) => {
        if(i > 0 ) {
            const categoriaAnterior = menu[i - 1].categoria;
            if(categoriaAnterior !== categoria) {
                return (
                    <Box style={styles.separador}>
                        <Text style={styles.separadorTexto}> {categoria} </Text>
                    </Box>
                )
            }
        } else {
            return (
                <Box style={styles.separador}>
                    <Text style={styles.separadorTexto}> {categoria} </Text>
                </Box>
            )
        }
    }

    return ( 
        <NativeBaseProvider>
            <Box style={globalStyles.contenedor}>
                <ScrollView style={{ backgroundColor: '#FFF' }}>
                    <VStack space={4}>
                        {menu.map((platillo, i) => {
                            const { imagen, nombre, descripcion, categoria, precio, id } = platillo;
                            return (
                                <Fragment key={id}>
                                    {mostrarHeading(categoria, i)}
                                    <Pressable
                                        onPress={() => {
                                            // Eliminar algunas propiedades del platillo
                                            const { existencia, ...platillo2 } = platillo;
                                            seleccionarPlatillo(platillo2);
                                            navigation.navigate("DetallePlatillo");
                                        }}
                                    >
                                        <HStack alignItems="center" space={3} p={2} borderBottomWidth={1} borderColor="#ccc">
                                            <Image 
                                                source={{ uri: imagen }} 
                                                alt={nombre} 
                                                size="lg"
                                            />
                                            <VStack>
                                                <Text bold>{nombre}</Text>
                                                <Text numberOfLines={2} ellipsizeMode="tail">{descripcion}</Text>
                                                <Text>Precio: ${precio}</Text>
                                            </VStack>
                                        </HStack>
                                    </Pressable>
                                </Fragment>
                            )
                        })}
                    </VStack>
                </ScrollView>
            </Box>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    separador: {
        backgroundColor: '#E5E5E5',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    separadorTexto: {
        color: '#000000',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
})

export default Menu;