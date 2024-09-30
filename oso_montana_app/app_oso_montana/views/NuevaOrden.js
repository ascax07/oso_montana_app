import React from 'react';
import { StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Box, Button, Text, NativeBaseProvider, VStack, HStack, Icon, Pressable, useColorModeValue } from 'native-base';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const NuevaOrden = () => {
    const navigation = useNavigation();
    const primaryColor = '#853030';

    const bgColor = useColorModeValue('warmGray.50', 'coolGray.800');
    const textColor = useColorModeValue('coolGray.800', 'warmGray.50');

    const navegarCarrito = () => {
        navigation.navigate('Pedidos');
    };

    const navegarPerfil = () => {
        navigation.navigate('PerfilUsuario');
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                return true;
            };
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );

    return (  
        <NativeBaseProvider>
            <Box flex={1} bg={bgColor} safeArea>
                <VStack space={5} flex={1} justifyContent="center" alignItems="center" p={5}>
                    <Animated.View entering={FadeIn.delay(300).duration(1000)}>
                        <Text fontSize="4xl" fontWeight="bold" color={primaryColor} textAlign="center" mb={10}>
                            Bienvenido
                        </Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(600).duration(1000)} style={styles.buttonContainer}>
                        <Button
                            size="lg"
                            onPress={() => navigation.navigate('Menu')}
                            bg={primaryColor}
                            _pressed={{ bg: `${primaryColor}CC` }}
                            borderRadius="full"
                            shadow={3}
                            leftIcon={<Icon as={Ionicons} name="add-circle-outline" size="sm" color="white" />}
                        >
                            <Text color="white" fontSize="lg" fontWeight="bold">
                                Crear Nueva Orden
                            </Text>
                        </Button>
                    </Animated.View>
                </VStack>

                <HStack style={styles.navbar} bg={primaryColor} alignItems="center" justifyContent="space-around" safeAreaBottom>
                    <Pressable opacity={1} py="3" flex={1} onPress={() => {}}>
                        <VStack alignItems="center">
                            <Icon as={Ionicons} name="home" size="sm" color="white" />
                            <Text color="white" fontSize="12">Inicio</Text>
                        </VStack>
                    </Pressable>
                    <Pressable opacity={0.5} py="3" flex={1} onPress={navegarCarrito}>
                        <VStack alignItems="center">
                            <Icon as={Ionicons} name="cart" size="sm" color="white" />
                            <Text color="white" fontSize="12">Pedidos</Text>
                        </VStack>
                    </Pressable>
                    <Pressable opacity={0.5} py="3" flex={1} onPress={navegarPerfil}>
                        <VStack alignItems="center">
                            <Icon as={Ionicons} name="person" size="sm" color="white" />
                            <Text color="white" fontSize="12">Perfil</Text>
                        </VStack>
                    </Pressable>
                </HStack>
            </Box>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    navbar: {
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default NuevaOrden;