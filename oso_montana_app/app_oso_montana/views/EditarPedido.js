import React, { useContext, useState, useEffect, useRef } from 'react';
import { Alert, Animated } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Button,
  Center,
  useToast,
  Icon,
  Input,
  NativeBaseProvider,
  Divider,
  extendTheme,
  Heading,
  Modal,
  Pressable,
  FlatList,
  IconButton,
  ScrollView,
} from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc, collection, onSnapshot, getDoc, runTransaction } from 'firebase/firestore';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import firebase from '../firebase';
import PedidoContext from '../context/pedidos/pedidosContext';

const theme = extendTheme({
  colors: {
    primary: {
      600: '#853030',
      700: '#6d2727',
    },
  },
});

const EditarPedido = () => {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [platillosDisponibles, setPlatillosDisponibles] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [platilloSeleccionado, setPlatilloSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const route = useRoute();
  const pedidoId = route.params?.pedidoId;
  const toast = useToast();
  const navigation = useNavigation();
  const { actualizarStock } = useContext(PedidoContext);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchPedido = async () => {
      if (!pedidoId) {
        console.error('pedidoId is undefined');
        setLoading(false);
        return;
      }

      const pedidoRef = doc(firebase.db, 'ordenes', pedidoId);
      
      try {
        const docSnapshot = await getDoc(pedidoRef);
        if (docSnapshot.exists()) {
          setPedido({ id: docSnapshot.id, ...docSnapshot.data() });
        } else {
          console.error('El pedido no existe');
        }
      } catch (error) {
        console.error('Error fetching pedido:', error);
      }
      setLoading(false);
    };

    const fetchPlatillos = () => {
      const platillosRef = collection(firebase.db, 'productos');
      return onSnapshot(platillosRef, (snapshot) => {
        const platillosList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlatillosDisponibles(platillosList);
        const categoriasUnicas = [...new Set(platillosList.map(p => p.categoria))];
        setCategorias(categoriasUnicas);
      });
    };

    fetchPedido();
    const unsubscribePlatillos = fetchPlatillos();

    return () => {
      if (unsubscribePlatillos) unsubscribePlatillos();
    };
  }, [pedidoId]);

  const handleActualizarPedido = async () => {
    if (!pedido || !pedido.orden || pedido.orden.length === 0) {
      Alert.alert('Error', 'Debes agregar al menos un platillo antes de guardar los cambios.');
      return;
    }

    try {
      const pedidoRef = doc(firebase.db, 'ordenes', pedidoId);
      await updateDoc(pedidoRef, { ...pedido });
      toast.show({
        title: "Éxito",
        description: "El pedido ha sido actualizado",
        status: "success",
      });
      navigation.goBack(); 
    } catch (error) {
      console.error('Error al actualizar el pedido:', error);
      toast.show({
        title: "Error",
        description: "No se pudo actualizar el pedido",
        status: "error",
      });
    }
  };

  const agregarNuevoPlatillo = async () => {
    if (!platilloSeleccionado) {
      Alert.alert('Error', 'Por favor selecciona un platillo.');
      return;
    }

    try {
      await runTransaction(firebase.db, async (transaction) => {
        const platilloRef = doc(firebase.db, 'productos', platilloSeleccionado.id);
        const platilloDoc = await transaction.get(platilloRef);

        if (!platilloDoc.exists()) {
          throw new Error('El platillo no existe');
        }

        const platilloData = platilloDoc.data();
        const stockActual = platilloData.stock;

        if (stockActual !== undefined && stockActual < cantidad) {
          throw new Error(`Solo hay ${stockActual} unidades disponibles de ${platilloSeleccionado.nombre}.`);
        }

        const nuevoStock = stockActual !== undefined ? stockActual - cantidad : undefined;

        if (nuevoStock !== undefined) {
          transaction.update(platilloRef, { stock: nuevoStock });
        }

        const nuevoItem = {
          ...platilloSeleccionado,
          cantidad: cantidad,
          total: platilloSeleccionado.precio * cantidad,
          stock: nuevoStock,
        };

        const ordenActualizada = pedido.orden ? [...pedido.orden] : [];
        const index = ordenActualizada.findIndex(item => item.id === nuevoItem.id);
        if (index !== -1) {
          ordenActualizada[index].cantidad += cantidad;
          ordenActualizada[index].total += nuevoItem.total;
          ordenActualizada[index].stock = nuevoStock;
        } else {
          ordenActualizada.push(nuevoItem);
        }

        setPedido(prevPedido => ({ ...prevPedido, orden: ordenActualizada }));
      });

      setPlatilloSeleccionado(null);
      setCantidad(1);
      setShowModal(false);

      toast.show({
        title: "Platillo agregado",
        description: `Se ha agregado ${cantidad} ${platilloSeleccionado.nombre} al pedido`,
        status: "success",
      });
    } catch (error) {
      console.error('Error al agregar platillo:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handlePlatilloSelect = (platillo) => {
    setPlatilloSeleccionado(platillo);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (loading) {
    return (
      <Center flex={1}>
        <Text>Cargando pedido...</Text>
      </Center>
    );
  }

  if (!pedido) {
    return (
      <Center flex={1}>
        <Text>No se pudo cargar el pedido.</Text>
      </Center>
    );
  }

  return (
    <NativeBaseProvider theme={theme}>
      <Box flex={1} bg="coolGray.50" safeArea>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Box p={4}>
            <VStack space={4}>
              <Heading size="xl" color="#853030">Editar Pedido - Mesa {pedido.mesa}</Heading>

              {pedido.orden && pedido.orden.map((platillo, index) => (
                <Box key={`${platillo.id}-${index}`} bg="white" rounded="lg" shadow={2} p={4}>
                  <HStack space={4} alignItems="center">
                    <Image size="lg" rounded="md" source={{ uri: platillo.imagen }} alt={platillo.nombre} />
                    <VStack flex={1}>
                      <Text bold fontSize="lg">{platillo.nombre}</Text>
                      <Text>Precio: ${platillo.precio.toLocaleString()}</Text>
                      <Text bold color="#853030">Cantidad: {platillo.cantidad}</Text>
                      {platillo.stock !== undefined && (
                        <Text color="gray.500">Stock disponible: {platillo.stock}</Text>
                      )}
                      <Text mt={2} fontWeight="bold" color="#853030">Total: ${platillo.total.toLocaleString()}</Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}

              <Divider my={2} />

              <Box mt={4}>
                <Text fontWeight="bold" mb={2}>Solicitud del Cliente:</Text>
                <Input
                  placeholder="Escribe la solicitud"
                  value={pedido.solicitudCliente}
                  onChangeText={(text) => setPedido(prev => ({ ...prev, solicitudCliente: text }))}
                  bg="white"
                  rounded="lg"
                  borderColor="coolGray.300"
                />
              </Box>

              <Button
                onPress={() => setShowModal(true)}
                mt={4}
                bg="#853030"
                _pressed={{ bg: "#6d2727" }}
                leftIcon={<Icon as={Ionicons} name="add-circle-outline" size="sm" color="white" />}
              >
                Agregar un nuevo platillo
              </Button>

              <Button
                onPress={handleActualizarPedido}
                mt={4}
                bg="#853030"
                _pressed={{ bg: "#6d2727" }}
                leftIcon={<Icon as={Ionicons} name="save-outline" size="sm" color="white" />}
              >
                Guardar Cambios
              </Button>
            </VStack>
          </Box>
        </ScrollView>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="full">
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Agregar Nuevo Platillo</Modal.Header>
            <Modal.Body>
              <VStack space={4}>
                <Text fontWeight="bold">Selecciona una categoría:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack space={2}>
                    {categorias.map((categoria) => (
                      <Pressable
                        key={categoria}
                        onPress={() => setCategoriaSeleccionada(categoria)}
                        bg={categoriaSeleccionada === categoria ? "#853030" : "coolGray.100"}
                        px={4}
                        py={2}
                        rounded="full"
                      >
                        <Text color={categoriaSeleccionada === categoria ? "white" : "coolGray.800"}>
                          {categoria}
                        </Text>
                      </Pressable>
                    ))}
                  </HStack>
                </ScrollView>

                {categoriaSeleccionada && (
                  <FlatList
                    data={platillosDisponibles.filter(p => p.categoria === categoriaSeleccionada)}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <Pressable 
                        onPress={() => handlePlatilloSelect(item)}
                        bg={platilloSeleccionado?.id === item.id ? "coolGray.200" : "white"}
                        p={2}
                        rounded="md"
                        mb={2}
                      >
                        <HStack space={3} alignItems="center">
                          <Image
                            source={{ uri: item.imagen }}
                            alt={item.nombre}
                            size="sm"
                            rounded="md"
                          />
                          <VStack flex={1}>
                            <Text fontWeight="bold">{item.nombre}</Text>
                            <Text>${item.precio.toLocaleString()}</Text>
                            {item.stock !== undefined && (
                              <Text color={item.stock > 0 ? "green.600" : "red.600"}>
                                Stock: {item.stock}
                              </Text>
                            )}
                          </VStack>
                          {platilloSeleccionado?.id === item.id && (
                            <Icon as={AntDesign} name="checkcircle" color="green.500" size="sm" />
                          )}
                        </HStack>
                      </Pressable>
                    )}
                  />
                )}

                {platilloSeleccionado && (
                  <Animated.View style={{ opacity: fadeAnim }}>
                    <VStack space={3} bg="coolGray.100" p={4} rounded="md">
                      <Image
                        source={{ uri: platilloSeleccionado.imagen }}
                        alt={platilloSeleccionado.nombre}
                        size="2xl"
                        rounded="lg"
                      />
                      <Text fontWeight="bold" fontSize="xl">{platilloSeleccionado.nombre}</Text>
                      <Text>{platilloSeleccionado.descripcion}</Text>
                      <Text fontWeight="bold" color="#853030">
                        ${platilloSeleccionado.precio.toLocaleString()}
                      </Text>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontWeight="bold">Cantidad:</Text>
                        <HStack space={2} alignItems="center">
                          <IconButton
                            icon={<Icon as={AntDesign} name="minuscircleo" />}
                            onPress={() => setCantidad(prev => Math.max(1, prev - 1))}
                            size="sm"
                            variant="ghost"
                          />
                          <Text fontSize="lg" fontWeight="bold">{cantidad}</Text>
                          <IconButton
                            icon={<Icon as={AntDesign} name="pluscircleo" />}
                            onPress={() => {
                              if (platilloSeleccionado.stock === undefined || cantidad < platilloSeleccionado.stock) {
                                setCantidad(prev => prev + 1);
                              } else {
                                Alert.alert('Stock insuficiente', `Solo hay ${platilloSeleccionado.stock} unidades disponibles.`);
                              }
                            }}
                            size="sm"
                            variant="ghost"
                          />
                        </HStack>
                      </HStack>
                      <Button onPress={agregarNuevoPlatillo} mt={2}>
                        Agregar al Pedido
                      </Button>
                    
                    </VStack>
                  </Animated.View>
                )}
              </VStack>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      </Box>
    </NativeBaseProvider>
  );
};

export default EditarPedido;