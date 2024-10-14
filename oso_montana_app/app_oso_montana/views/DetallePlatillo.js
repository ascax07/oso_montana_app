import React, { useState, useContext, useEffect } from 'react';
import { Dimensions, StyleSheet, Alert } from 'react-native';
import { NativeBaseProvider, Box, Text, VStack, HStack, Button, Icon, Input, Pressable, useColorModeValue, Image, Center } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import PedidoContext from '../context/pedidos/pedidosContext';
import FirebaseContext from '../context/firebase/firebaseContext';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, interpolate, useAnimatedScrollHandler } from 'react-native-reanimated';
import { doc, onSnapshot } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const DetalleFormularioPlatillo = () => {
    const { platillo, guardarPedido } = useContext(PedidoContext);
    const { firebase } = useContext(FirebaseContext);
    const [nombre, setNombre] = useState(platillo.nombre);
    const [imagen, setImagen] = useState(platillo.imagen);
    const [descripcion, setDescripcion] = useState(platillo.descripcion);
    const [precio, setPrecio] = useState(platillo.precio);
    const [id, setId] = useState(platillo.id);
    const navigation = useNavigation();
    const [cantidad, setCantidad] = useState(1);
    const [total, setTotal] = useState(precio);
    const [disponible, setDisponible] = useState(platillo.stock);
    const [showingAlert, setShowingAlert] = useState(false);
    const [tieneStock, setTieneStock] = useState('stock' in platillo);

    const primaryColor = '#853030';
    const bgColor = useColorModeValue('warmGray.50', 'coolGray.900');
    const textColor = useColorModeValue('coolGray.800', 'warmGray.50');
    const cardBgColor = useColorModeValue('white', 'coolGray.800');

    const scrollY = useSharedValue(0);
    const imageHeight = useSharedValue(height * 0.4);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        }
    });

    const imageStyle = useAnimatedStyle(() => {
        const scale = interpolate(scrollY.value, [-100, 0], [1.1, 1], { extrapolateRight: 'clamp' });
        return {
            transform: [{ scale }],
            height: interpolate(scrollY.value, [0, 200], [imageHeight.value, height * 0.3], { extrapolateRight: 'clamp' })
        };
    });

    const headerStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, 100], [0, 1], { extrapolateRight: 'clamp' })
    }));

    useEffect(() => {
        const platilloRef = doc(firebase.db, 'productos', id);

        const unsubscribe = onSnapshot(platilloRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const updatedData = docSnapshot.data();

                setNombre(updatedData.nombre);
                setImagen(updatedData.imagen);
                setDescripcion(updatedData.descripcion);
                setPrecio(updatedData.precio);
                setTieneStock('stock' in updatedData);
                if (tieneStock) {
                    setDisponible(updatedData.stock);
                }
            }
        }, (error) => {
            console.error("Error al obtener actualizaciones en tiempo real: ", error);
        });

        return () => unsubscribe();
    }, [id, firebase]);

    useEffect(() => {
        setTotal(precio * cantidad);
    }, [cantidad, precio]);

    const decrementarUno = () => {
        if (cantidad > 1) {
            setCantidad(cantidad - 1);
        }
    };

    const incrementarUno = () => {
        if (!tieneStock || (disponible > 0 && cantidad < disponible)) {
            setCantidad(cantidad + 1);
        } else if (!showingAlert) {
            setShowingAlert(true);
            Alert.alert('Stock insuficiente', 'No hay más stock disponible de este producto.', [
                { text: 'OK', onPress: () => setShowingAlert(false) }
            ]);
        }
    };

    const confirmarOrden = () => {
        if (tieneStock && disponible === 0) {
            Alert.alert('No hay stock', 'No hay stock de este producto en este momento.');
            return;
        }

        Alert.alert(
            '¿Deseas confirmar tu pedido?',
            'Un pedido confirmado ya no se podrá modificar',
            [
                {
                    text: 'Confirmar',
                    onPress: () => {
                        const pedido = {
                            id,
                            nombre,
                            imagen,
                            descripcion,
                            precio,
                            cantidad,
                            total,
                            tieneStock,
                            disponible: tieneStock ? disponible : null
                        };
                        guardarPedido(pedido);
                        navigation.navigate('ResumenPedido');
                    }
                },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    return (
        <NativeBaseProvider>
            <Box flex={1} bg={bgColor}>
                <Animated.View style={[styles.header, headerStyle]}>
                    <Text fontSize="xl" fontWeight="bold" color={textColor}>
                        {nombre}
                    </Text>
                </Animated.View>

                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <Animated.View style={[styles.imageContainer, imageStyle]}>
                        <Image source={{ uri: imagen }} alt={nombre} style={styles.image} resizeMode="cover" />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.duration(800).delay(300)}>
                        <Box bg={cardBgColor} borderTopRadius="3xl" mt="-40px" pt={6} px={6}>
                            <VStack space={4}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                                        {nombre}
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" color={primaryColor}>
                                        ${precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </Text>
                                </HStack>

                                <Text fontSize="md" color={useColorModeValue('coolGray.600', 'coolGray.400')}>
                                    {descripcion}
                                </Text>

                                {tieneStock ? (
                                    disponible > 0 ? (
                                        <HStack justifyContent="space-between" alignItems="center" mt={2}>
                                            <Text fontSize="lg" fontWeight="bold" color={primaryColor}>
                                                Stock disponible:
                                            </Text>
                                            <Text fontSize="lg" color={textColor}>
                                                {disponible} unidades
                                            </Text>
                                        </HStack>
                                    ) : (
                                        <Text fontSize="lg" fontWeight="bold" color="red.500">
                                            Producto agotado
                                        </Text>
                                    )
                                ) : null}

                                <Box bg={useColorModeValue('coolGray.100', 'coolGray.700')} p={4} borderRadius="xl">
                                    <HStack justifyContent="space-between" alignItems="center">
                                        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                                            Cantidad
                                        </Text>
                                        <HStack space={2} alignItems="center">
                                            <Pressable onPress={decrementarUno}>
                                                <Center bg={primaryColor} w={10} h={10} borderRadius="full">
                                                    <Icon as={MaterialIcons} name="remove" size="sm" color="white" />
                                                </Center>
                                            </Pressable>
                                            <Input
                                                w={16}
                                                textAlign="center"
                                                fontSize="lg"
                                                value={cantidad.toString()}
                                                keyboardType="numeric"
                                                onChangeText={text => {
                                                    const newCantidad = parseInt(text) || 1;
                                                    if (!tieneStock || newCantidad <= disponible) {
                                                        setCantidad(newCantidad);
                                                    } else if (!showingAlert) {
                                                        setShowingAlert(true);
                                                        Alert.alert('Stock insuficiente', 'No hay más stock disponible de este producto.', [
                                                            { text: 'OK', onPress: () => setShowingAlert(false) }
                                                        ]);
                                                    }
                                                }}
                                                borderColor={primaryColor}
                                                _focus={{
                                                    borderColor: primaryColor,
                                                    backgroundColor: `${primaryColor}10`
                                                }}
                                            />
                                            <Pressable onPress={incrementarUno}>
                                                <Center bg={primaryColor} w={10} h={10} borderRadius="full">
                                                    <Icon as={MaterialIcons} name="add" size="sm" color="white" />
                                                </Center>
                                            </Pressable>
                                        </HStack>
                                    </HStack>
                                </Box>

                                <HStack justifyContent="space-between" alignItems="center">
                                    <Text fontSize="xl" fontWeight="semibold" color={textColor}>
                                        Total
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" color={primaryColor}>
                                        ${total.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </Text>
                                </HStack>
                            </VStack>
                        </Box>
                    </Animated.View>
                </Animated.ScrollView>

                <Animated.View entering={FadeInDown.duration(800).delay(600)} style={styles.bottomContainer}>
                    <Button
                        onPress={confirmarOrden}
                        bg={primaryColor}
                        _pressed={{ bg: `${primaryColor}CC` }}
                        rounded="full"
                        py={4}
                        _text={{ fontSize: "lg", fontWeight: "bold" }}
                        leftIcon={<Icon as={Ionicons} name="cart-outline" size="sm" color="white" />}
                    >
                        Agregar al Pedido
                    </Button>
                </Animated.View>
            </Box>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageContainer: {
        width: width,
        height: height * 0.4,
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '100%'
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }
});

export default DetalleFormularioPlatillo;