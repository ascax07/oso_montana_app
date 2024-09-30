import React, { useContext, useState, useEffect } from 'react';
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
    Pressable,
    Select,
    TextArea,
    IconButton,
    Divider,
    useTheme,
    StatusBar,
    Fab,
    extendTheme,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import firebase from '../firebase';
import PedidoContext from '../context/pedidos/pedidosContext';
import { Ionicons } from '@expo/vector-icons';

// Extender el tema de NativeBase para incluir nuestro color personalizado
const theme = extendTheme({
    colors: {
        primary: {
            600: '#853030',
            700: '#6d2727', // Un tono más oscuro para estados presionados
        },
    },
});

const ResumenPedido = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const { pedido, total, mostrarResumen, eliminarProducto, pedidoRealizado } = useContext(PedidoContext);
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [nombreMesa, setNombreMesa] = useState('');
    const [mesasDisponibles, setMesasDisponibles] = useState([]);
    const [solicitudCliente, setSolicitudCliente] = useState('');

    useEffect(() => {
        calcularTotal();
        obtenerMesas();
    }, [pedido]);

    const calcularTotal = () => {
        let nuevoTotal = pedido.reduce((total, articulo) => total + articulo.total, 0);
        mostrarResumen(nuevoTotal);
    };

    const obtenerMesas = async () => {
        try {
            const colRef = collection(firebase.db, 'mesas');
            const mesasSnapshot = await getDocs(colRef);
            const mesas = mesasSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(mesa => mesa.disponible);
            setMesasDisponibles(mesas);
        } catch (error) {
            console.error("Error al obtener mesas:", error);
        }
    };

    const handleSelectMesa = async (id) => {
        setSelectedMesa(id);
        const mesaRef = doc(firebase.db, 'mesas', id);
        try {
            const mesaDoc = await getDoc(mesaRef);
            if (mesaDoc.exists()) {
                setNombreMesa(mesaDoc.data().numero);
            }
        } catch (error) {
            console.error('Error al obtener información de la mesa:', error);
        }
    };

    const Pedidos = () => {
        if (!nombreMesa) {
            Alert.alert('Mesa no seleccionada', 'Por favor selecciona una mesa antes de proceder con el pedido.');
            return;
        }

        Alert.alert(
            'Revisa tu pedido',
            'Una vez que realizas tu pedido no podrás cambiarlo',
            [
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        const pedidoObj = {
                            tiempoentrega: 0,
                            completado: false,
                            total: Number(total),
                            orden: pedido,
                            mesa: nombreMesa,
                            solicitudCliente,
                            creado: serverTimestamp(), // Timestamp de Firebase
                            fecha_ingreso: serverTimestamp(), // Campo 'fecha_ingreso' como timestamp del servidor
                            lista: false // Nuevo campo 'lista' de tipo booleano
                        };

                        try {
                            const pedidoRef = await addDoc(collection(firebase.db, 'ordenes'), pedidoObj);
                            pedidoRealizado(pedidoRef.id);

                            if (selectedMesa) {
                                const mesaRef = doc(firebase.db, 'mesas', selectedMesa);
                                await updateDoc(mesaRef, { disponible: false });
                            }

                            navigation.navigate("Pedidos");
                        } catch (error) {
                            console.log(error);
                        }
                    }
                },
                { text: 'Revisar', style: 'cancel' }
            ]
        );
    };

    const confirmarEliminacion = id => {
        Alert.alert(
            '¿Deseas eliminar este artículo?',
            'Una vez eliminado no se puede recuperar',
            [
                { text: 'Confirmar', onPress: () => eliminarProducto(id) },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    return (
        <NativeBaseProvider theme={theme}>
            <StatusBar backgroundColor="#853030" barStyle="light-content" />
            <Box flex={1} bg="coolGray.50">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <VStack space={4} p={4}>
                        <Heading size="xl" color="#853030">Resumen del Pedido</Heading>
                        {pedido.map((platillo, i) => {
                            const { cantidad, nombre, imagen, id, precio } = platillo;
                            return (
                                <Box key={id + i} bg="white" rounded="lg" shadow={2} p={4}>
                                    <HStack space={4} alignItems="center">
                                        <Image size="lg" rounded="md" source={{ uri: imagen }} alt={nombre} />
                                        <VStack flex={1}>
                                            <Text bold fontSize="lg">{nombre}</Text>
                                            <Text>Cantidad: {cantidad}</Text>
                                            <Text bold color="#853030">$ {precio.toLocaleString('es-CO')}</Text>
                                        </VStack>
                                        <IconButton
                                            icon={<Ionicons name="trash-outline" size={24} color="#853030" />}
                                            onPress={() => confirmarEliminacion(id)}
                                        />
                                    </HStack>
                                </Box>
                            );
                        })}
                        <Divider my={2} />
                        <HStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="xl" bold>Total a Pagar:</Text>
                            <Text fontSize="2xl" bold color="#853030">$ {total.toLocaleString('es-CO')}</Text>
                        </HStack>
                        <Select
                            selectedValue={selectedMesa}
                            minWidth="200"
                            placeholder="Selecciona una mesa"
                            onValueChange={handleSelectMesa}
                            bg="white"
                            rounded="lg"
                            _selectedItem={{
                                bg: "rgba(133, 48, 48, 0.1)",
                                endIcon: <Ionicons name="checkmark" size={20} color="#853030" />
                            }}
                        >
                            {mesasDisponibles.map((mesa) => (
                                <Select.Item label={`Mesa ${mesa.numero}`} value={mesa.id} key={mesa.id} />
                            ))}
                        </Select>
                        <TextArea
                            placeholder="Escribe aquí tu solicitud especial..."
                            value={solicitudCliente}
                            onChangeText={setSolicitudCliente}
                            h={20}
                            bg="white"
                            rounded="lg"
                            borderColor="coolGray.300"
                        />
                        <Button
                            onPress={() => navigation.navigate('Menu')}
                            leftIcon={<Ionicons name="add-circle-outline" size={20} color="white" />}
                            bg="#853030"
                            _pressed={{ bg: "#6d2727" }}
                        >
                            Seguir Pidiendo
                        </Button>
                    </VStack>
                </ScrollView>
                <Fab
                    renderInPortal={false}
                    shadow={2}
                    size="lg"
                    icon={<Ionicons name="restaurant-outline" size={24} color="white" />}
                    label="Ordenar Pedido"
                    onPress={Pedidos}
                    bg="#853030"
                    _pressed={{ bg: "#6d2727" }}
                />
            </Box>
        </NativeBaseProvider>
    );
}

export default ResumenPedido;
