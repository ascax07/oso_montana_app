import React, { useContext, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { NativeBaseProvider, Box, ScrollView, Image, Text, VStack, HStack, Pressable, Icon, useColorModeValue, Center } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import FirebaseContext from '../context/firebase/firebaseContext';
import PedidoContext from '../context/pedidos/pedidosContext';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Menu = ({ navigation }) => {
    const { menu, obtenerProductos } = useContext(FirebaseContext);
    const { seleccionarPlatillo } = useContext(PedidoContext);
    const [activeCategoryId, setActiveCategoryId] = useState(null);

    const categories = [...new Set(menu.map(platillo => platillo.categoria))];

    useEffect(() => {
        obtenerProductos();
    }, []);

    const handlePress = (categoria) => {
        setActiveCategoryId(categoria);
    };

    const itemWidth = width * 0.42; // Slightly smaller for more spacing

    const bgColor = useColorModeValue('warmGray.50', 'coolGray.900');
    const cardBgColor = useColorModeValue('white', 'coolGray.800');
    const textColor = useColorModeValue('coolGray.800', 'warmGray.50');
    const secondaryTextColor = useColorModeValue('coolGray.600', 'coolGray.400');
    const primaryColor = '#853030';

    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    return (
        <NativeBaseProvider>
            <Box flex={1} bg={bgColor} safeArea>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack space={6} p={4}>    
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <HStack space={3}>
                                {categories.map((category, index) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => handlePress(category)}
                                        bg={activeCategoryId === category ? primaryColor : 'coolGray.100'}
                                        px={5}
                                        py={3}
                                        rounded="full"
                                        shadow={activeCategoryId === category ? 3 : 1}
                                    >
                                        <Text
                                            color={activeCategoryId === category ? 'white' : 'coolGray.800'}
                                            fontWeight="medium"
                                            fontSize="md"
                                        >
                                            {category}
                                        </Text>
                                    </Pressable>
                                ))}
                            </HStack>
                        </ScrollView>

                        <Animated.View layout={Layout.springify()}>
                            <HStack flexWrap="wrap" justifyContent="space-between">
                                {menu.filter(platillo => activeCategoryId === null || platillo.categoria === activeCategoryId)
                                    .map((platillo) => {
                                        const { imagen, nombre, descripcion, precio, id } = platillo;
                                        return (
                                            <AnimatedPressable
                                                key={id}
                                                entering={FadeInRight}
                                                exiting={FadeOutLeft}
                                                onPress={() => {
                                                    const { existencia, ...platillo2 } = platillo;
                                                    seleccionarPlatillo(platillo2);
                                                    navigation.navigate("DetallePlatillo");
                                                }}
                                                width={itemWidth}
                                                mb={6}
                                            >
                                                <Box
                                                    bg={cardBgColor}
                                                    rounded="2xl"
                                                    shadow={4}
                                                    overflow="hidden"
                                                >
                                                    <Image
                                                        source={{ uri: imagen }}
                                                        alt={nombre}
                                                        height={160}
                                                        width={itemWidth}
                                                    />
                                                    <VStack p={4} space={2}>
                                                        <Text
                                                            fontSize="lg"
                                                            fontWeight="bold"
                                                            color={textColor}
                                                            numberOfLines={1}
                                                        >
                                                            {nombre}
                                                        </Text>
                                                        <Text
                                                            fontSize="sm"
                                                            color={secondaryTextColor}
                                                            numberOfLines={2}
                                                        >
                                                            {descripcion}
                                                        </Text>
                                                        <HStack justifyContent="space-between" alignItems="center" mt={2}>
                                                            <Text
                                                                fontSize="xl"
                                                                fontWeight="bold"
                                                                color={primaryColor}
                                                            >
                                                                ${precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                            </Text>
                                                            <Center
                                                                bg={primaryColor}
                                                                rounded="full"
                                                                p={2}
                                                                shadow={2}
                                                            >
                                                                <Icon
                                                                    as={Ionicons}
                                                                    name="add"
                                                                    size="md"
                                                                    color="white"
                                                                />
                                                            </Center>
                                                        </HStack>
                                                    </VStack>
                                                </Box>
                                            </AnimatedPressable>
                                        );
                                    })}
                            </HStack>
                        </Animated.View>
                    </VStack>
                </ScrollView>
            </Box>
        </NativeBaseProvider>
    );
}

export default Menu;