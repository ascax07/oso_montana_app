import React, { useContext } from 'react';
import { Image } from 'react-native';
import {
    NativeBaseProvider,
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Card,
    Button,
    Center
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../styles/global';

import PedidoContext from '../context/pedidos/pedidosContext';



const DetallePlatillo = () => {

    // Pedido context
    const { platillo } = useContext(PedidoContext);
    const { nombre, imagen, descripcion, precio } = platillo;


    //Redireccionar 
    const navigation = useNavigation();

    return (
        <NativeBaseProvider>
            <Box style={globalStyles.contenedor}>
                <VStack style={globalStyles.contenido}>
                    <Heading style={globalStyles.titulo}>{nombre}</Heading >
                    <Card>
                        <VStack>
                            <Center>
                                <Image style={globalStyles.imagen} source={{ uri: imagen }} />

                                <Text style={{ marginTop: 10 }}>{descripcion}</Text>
                                <Text style={globalStyles.cantidad} >Precio: $ {precio}</Text>
                            </Center>
                        </VStack>
                    </Card>
                </VStack>
                <Box safeAreaBottom>
                    <Button
                        onPress={() => navigation.navigate("FormularioPlatillo")}
                        style={[globalStyles.boton, { width: '100%' }]}
                    >
                        <Center>
                            <Text style={globalStyles.botonTexto}>Ordenar Platillo</Text>
                        </Center>
                    </Button>
                </Box>
            </Box>
        </NativeBaseProvider>

    );

}

export default DetallePlatillo;