import React, { useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import {
    NativeBaseProvider,
    Box,
    VStack,
    HStack,
    Button,
    Icon,
    Input,
    Text,
    Center,
    Pressable
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../styles/global';

import IconMaterial from 'react-native-vector-icons/MaterialIcons'; // Importa los íconos

import PedidoContext from '../context/pedidos/pedidosContext';

const FormularioPlatillo = () => {

    // state para cantidades
    const [cantidad, guardarCantidad] = useState(1);
    const [total, guardarTotal] = useState(0);

    // context
    const { platillo, guardarPedido } = useContext(PedidoContext);
    const { precio } = platillo;

    // // redireccionar
    const navigation = useNavigation();

    // En cuanto el componente carga, calcular la cantidad a pagar
    useEffect(() => {
        calcularTotal();
    }, [cantidad]);

    // Calcula el total del platillo por su cantidad
    const calcularTotal = () => {
        const totalPagar = precio * cantidad;
        guardarTotal(totalPagar);
    }

    // Decrementa en uno
    const decrementarUno = () => {
        if (cantidad > 1) {
            const nuevaCantidad = parseInt(cantidad) - 1;
            guardarCantidad(nuevaCantidad);
        }
    }


    // incrementa en uno la cantidad
    const incrementarUno = () => {
        const nuevaCantidad = parseInt(cantidad) + 1;
        guardarCantidad(nuevaCantidad);
    }


     // Confirma si la orden es correcta
     const confirmarOrden = () => {
        Alert.alert(
            '¿Deseas confirmar tu pedido?',
            'Un pedido confirmado ya no se podrá modificar',
            [
                {
                    text: 'Confirmar',
                    onPress: () => {
                        // Almacenar el pedido al pedido principal
                        const pedido = {
                            ...platillo,
                            cantidad,
                            total
                        }

                        // console.log(pedido);
                        guardarPedido(pedido);

                        // Navegar hacia el Resumen
                        navigation.navigate("ResumenPedido");
                    }, 
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        )
    }

    return (
        <NativeBaseProvider>
            <Box style={globalStyles.contenedor}>
                <VStack space={5} style={globalStyles.contenido}>
                    <Text style={globalStyles.titulo}>Cantidad</Text>
                    <HStack space={4} justifyContent="center">
                        <Button
                            onPress={decrementarUno}
                            style={{ width: 60, height: 80, justifyContent: 'center', backgroundColor: '#000' }}
                        >
                            <Icon as={IconMaterial} name="remove" style={{ fontSize: 20 }} />
                        </Button>
                        <Center>
                            <Input
                                w={20}
                                textAlign="center"
                                fontSize={20}
                                value={cantidad.toString()}
                                keyboardType="numeric"
                                onChangeText={cantidad => guardarCantidad(cantidad)}
                            />
                        </Center>
                        <Button
                            onPress={incrementarUno}
                            style={{ width: 60, height: 80, justifyContent: 'center', backgroundColor: '#000' }}
                        >
                            <Icon as={IconMaterial} name="add" style={{ fontSize: 20 }} />
                        </Button>
                    </HStack>
                                                            
                    <Text style={globalStyles.cantidad}>Subtotal: ${total} </Text>
                </VStack>

                <Box safeAreaBottom>
                    <Button
                        onPress={confirmarOrden}
                        style={[globalStyles.boton, { width: '100%' }]}
                    >
                        <Center>
                            <Text style={globalStyles.botonTexto}>Agregar al Pedido</Text>
                        </Center>
                    </Button>
                </Box>
            </Box>
        </NativeBaseProvider>
    );


}

export default FormularioPlatillo;