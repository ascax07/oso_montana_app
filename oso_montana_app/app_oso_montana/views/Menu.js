import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, Text, View, TouchableOpacity } from 'react-native';
import { NativeBaseProvider, Box, ScrollView, Image, Pressable } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import FirebaseContext from '../context/firebase/firebaseContext';
import PedidoContext from '../context/pedidos/pedidosContext';
import Categorias from '../components/ui/Categorias';
import colors from '../styles/colors';
import SPACING from '../styles/SPACING';

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

    const itemWidth = (width - (SPACING * 3)) / 2; // Ajusta el ancho para dos columnas

    return (
        <NativeBaseProvider>
            <Box style={{ flex: 1, padding: SPACING }}>
                <View style={{ marginBottom: SPACING * 2 }}>
                    {/* Usa el componente Categorias */}
                    <Categorias
                        categories={categories}
                        activeCategoryId={activeCategoryId}
                        handlePress={handlePress}
                    />
                </View>

                {/* Lista de Platillos */}
                <ScrollView>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {menu.filter(platillo => activeCategoryId === null || platillo.categoria === activeCategoryId)
                            .map((platillo) => {
                                const { imagen, nombre, descripcion, precio, id } = platillo;
                                return (
                                    <Box
                                        key={id}
                                        width={itemWidth} // Usa el ancho calculado para dos columnas
                                        backgroundColor="#000000" // Fondo oscuro para resaltar el contenido
                                        borderRadius={SPACING * 2}
                                        overflow="hidden"
                                        marginBottom={SPACING * 2} // Espacio entre las filas
                                    >
                                        <BlurView
                                            tint="dark"
                                            intensity={95}
                                            style={{ padding: SPACING }}
                                        >
                                            <Image
                                                source={{ uri: imagen }}
                                                alt={nombre}
                                                style={{
                                                    width: '100%',
                                                    height: 150,
                                                    borderRadius: SPACING * 2,
                                                }}
                                            />
                                            <Text
                                                numberOfLines={2}
                                                style={{
                                                    color: colors.white,
                                                    fontWeight: '600',
                                                    fontSize: SPACING * 1.7,
                                                    marginTop: SPACING,
                                                    marginBottom: SPACING / 2,
                                                }}
                                            >
                                                {nombre}
                                            </Text>
                                            <Text
                                                numberOfLines={1}
                                                style={{ color: colors.secondary, fontSize: SPACING * 1.2 }}
                                            >
                                                {descripcion}
                                            </Text>
                                            <Box
                                                flexDirection="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                marginTop={SPACING}
                                            >
                                                <Box flexDirection="row" alignItems="center">
                                                    <Text
                                                        style={{
                                                            color: colors.primary,
                                                            fontSize: SPACING * 1.6,
                                                            marginRight: SPACING / 2,
                                                        }}
                                                    >
                                                        $
                                                    </Text>
                                                    <Text style={{ color: colors.white , fontSize: SPACING * 1.6  }}>{precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
                                                </Box>
                                                <TouchableOpacity
                                                    style={{
                                                        backgroundColor: colors.primary,
                                                        padding: SPACING / 2,
                                                        borderRadius: SPACING,
                                                    }}
                                                    onPress={() => {
                                                        const { existencia, ...platillo2 } = platillo;
                                                        seleccionarPlatillo(platillo2);
                                                        navigation.navigate("DetallePlatillo");
                                                    }}
                                                >
                                                    <Ionicons
                                                        name="add"
                                                        size={SPACING * 2}
                                                        color={colors.white}
                                                    />
                                                </TouchableOpacity>
                                            </Box>
                                        </BlurView>
                                    </Box>
                                );
                            })}
                    </View>
                </ScrollView>
            </Box>
        </NativeBaseProvider>
    );
}

export default Menu;
