import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, ImageBackground, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { NativeBaseProvider, HStack, Button, Icon, Input, Center } from 'native-base';
import { useNavigation } from '@react-navigation/native'; // Importa el hook
import PedidoContext from '../context/pedidos/pedidosContext';
import colors from '../styles/colors';
import SPACING from '../styles/SPACING';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';

const { height, width } = Dimensions.get('window');

const DetalleFormularioPlatillo = () => {
    // Contexto de pedido
    const { platillo, guardarPedido } = useContext(PedidoContext);
    const { nombre, imagen, descripcion, precio } = platillo;

    // Hook de navegación
    const navigation = useNavigation();

    // Estado para manejar la cantidad y el total
    const [cantidad, setCantidad] = useState(1);
    const [total, setTotal] = useState(precio);

    // Actualizar total cuando cambie la cantidad
    useEffect(() => {
        setTotal(precio * cantidad);
    }, [cantidad]);

    // Funciones para manejar cantidad
    const decrementarUno = () => {
        if (cantidad > 1) {
            setCantidad(cantidad - 1);
        }
    };

    const incrementarUno = () => {
        setCantidad(cantidad + 1);
    };

    // Confirmar el pedido
    const confirmarOrden = () => {
        Alert.alert(
            '¿Deseas confirmar tu pedido?',
            'Un pedido confirmado ya no se podrá modificar',
            [
                {
                    text: 'Confirmar',
                    onPress: () => {
                        const pedido = {
                            ...platillo,
                            cantidad,
                            total
                        };
                        guardarPedido(pedido);
                        // Navegar a la pantalla de resumen del pedido
                        navigation.navigate('ResumenPedido');
                    },
                },
                {
                    text: 'Cancelar',
                    style: 'cancel'
                }
            ]
        );
    };

    return (
        <NativeBaseProvider>
            <ScrollView>
                <SafeAreaView>
                    <ImageBackground
                        source={{ uri: imagen }}
                        style={{
                            height: height / 2 + SPACING * 2,
                            justifyContent: 'space-between',
                        }}
                        imageStyle={{
                            borderRadius: SPACING * 3,
                        }}
                    >
                        <View style={{ flexDirection: 'row', padding: SPACING * 2 }}>
                        </View>

                        <View
                            style={{
                                borderRadius: SPACING * 3,
                                overflow: 'hidden',
                            }}
                        >
                            <BlurView
                                intensity={80}
                                tint="dark"
                                style={{
                                    padding: SPACING * 2,
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontSize: SPACING * 2,
                                            color: colors.white,
                                            fontWeight: '600',
                                            marginBottom: SPACING,
                                        }}
                                    >
                                        {nombre}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: SPACING * 1.8,
                                            color: colors['white-smoke'],
                                            fontWeight: '500',
                                            marginBottom: SPACING,
                                        }}
                                    >
                                        {descripcion}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: SPACING * 1.8,
                                            fontWeight: '700',
                                            marginBottom: SPACING,
                                        }}
                                    >
                                        Precio:
                                        <Text style={{ color: colors.primary }}> $ </Text>
                                        <Text style={{ color: colors.white }}>{precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>

                                    </Text>

                                </View>
                            </BlurView>
                        </View>
                    </ImageBackground>

                    <View
                        style={{
                            padding: SPACING,
                        }}
                    >
                        <HStack space={4} justifyContent="space-between">
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: SPACING * 1.7,
                                    alignSelf: 'center',
                                }}
                            >
                                Subtotal: $ {total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}

                            </Text>
                            <HStack space={2} alignItems="center">
                                <Button
                                    onPress={decrementarUno}
                                    style={{ width: 40, height: 40, justifyContent: 'center', backgroundColor: '#000' }}
                                >
                                    <Icon as={IconMaterial} name="remove" style={{ fontSize: 20, color: '#FFF' }} />
                                </Button>
                                <Center>
                                    <Input
                                        w={12}
                                        textAlign="center"
                                        fontSize={20}
                                        value={cantidad.toString()}
                                        keyboardType="numeric"
                                        onChangeText={text => setCantidad(parseInt(text) || 1)}
                                    />
                                </Center>
                                <Button
                                    onPress={incrementarUno}
                                    style={{ width: 40, height: 40, justifyContent: 'center', backgroundColor: '#000' }}
                                >
                                    <Icon as={IconMaterial} name="add" style={{ fontSize: 20, color: '#FFF' }} />
                                </Button>
                            </HStack>
                        </HStack>
                    </View>
                </SafeAreaView>
            </ScrollView>
            <SafeAreaView
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: SPACING * 5, 
                    paddingHorizontal: 30, 
                }}
            >
                <Button
                    onPress={confirmarOrden}
                    style={{
                        backgroundColor: colors.primary,
                        width: width - SPACING * 6,
                        justifyContent: 'center',
                        borderRadius: SPACING * 2,
                        paddingVertical: SPACING,
                    }}
                    _text={{
                        color: colors.white,
                        fontSize: SPACING * 2,
                        fontWeight: '700',
                    }}
                >
                    Agregar al Pedido
                </Button>
            </SafeAreaView>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({});

export default DetalleFormularioPlatillo;
