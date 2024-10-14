import React, { useState, useEffect, useContext } from 'react';
import { RefreshControl, BackHandler, Alert } from 'react-native';
import {
  Box,
  FlatList,
  Text,
  VStack,
  HStack,
  Pressable,
  Icon,
  useTheme,
  StatusBar,
  Heading,
  Badge,
  useToast,
  IconButton,
  Divider,
  Center,
  Modal, // Importar Modal
  Button, // Importar Button
} from 'native-base';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, onSnapshot, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import firebase from '../firebase';
import PedidoContext from '../context/pedidos/pedidosContext';
import { Ionicons } from '@expo/vector-icons';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado para el modal
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null); // Estado para el pedido seleccionado
  const navigation = useNavigation();
  const { pedidoRealizado } = useContext(PedidoContext);
  const { colors } = useTheme();
  const toast = useToast();

  const primaryColor = '#853030';

  useEffect(() => {
    const fetchPedidos = () => {
      const colRef = collection(firebase.db, 'ordenes');
      return onSnapshot(colRef, (snapshot) => {
        const pedidosList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.creado - a.creado);
        setPedidos(pedidosList);
      }, (error) => {
        console.error('Error al obtener pedidos en tiempo real:', error);
        toast.show({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
          status: "error"
        });
      });
    };

    const unsubscribe = fetchPedidos();
    return () => unsubscribe();
  }, []);

  const handleMarcarComoRecogido = async (pedidoId) => {
    try {
      const pedidoRef = doc(firebase.db, 'ordenes', pedidoId);
      await updateDoc(pedidoRef, { recogido: true });
      toast.show({
        title: "Éxito",
        description: "Pedido marcado como recogido",
        status: "success"
      });
    } catch (error) {
      console.error('Error al marcar como recogido:', error);
      toast.show({
        title: "Error",
        description: "No se pudo marcar el pedido como recogido",
        status: "error"
      });
    }
  };

  const handleDespacharMesa = async (pedidoId, mesaNumero) => {
    try {
      const pedidoRef = doc(firebase.db, 'ordenes', pedidoId);
      await updateDoc(pedidoRef, { pedidoDespachado: true });

      const mesaQuery = query(collection(firebase.db, 'mesas'), where('numero', '==', mesaNumero));
      const mesaSnapshot = await getDocs(mesaQuery);

      if (!mesaSnapshot.empty) {
        const mesaDoc = mesaSnapshot.docs[0];
        const mesaRef = doc(firebase.db, 'mesas', mesaDoc.id);
        await updateDoc(mesaRef, { disponible: true });
        toast.show({
          title: "Mesa despachada",
          description: `Mesa ${mesaNumero} ahora está disponible`,
          status: "success"
        });
      } else {
        throw new Error(`No se encontró ninguna mesa con el número: ${mesaNumero}`);
      }
    } catch (error) {
      console.error('Error al despachar mesa o liberar mesa:', error);
      toast.show({
        title: "Error",
        description: "No se pudo despachar la mesa",
        status: "error"
      });
    }
  };

  const renderPedido = ({ item }) => {
    if (!item || item.pedidoDespachado) return null;

    const { id, mesa, lista, recogido, creado } = item;

    return (
      <Pressable onPress={() => navigation.navigate('DetallePedido', { pedidoId: id })}>
        <Box 
          bg="white" 
          shadow={2} 
          rounded="lg" 
          mb={4} 
          overflow="hidden"
        >
          <HStack space={4} p={4} alignItems="center">
            <Center 
              w={16} 
              h={16} 
              bg={primaryColor} 
              rounded="full"
              _text={{ color: "white", fontSize: "xl", fontWeight: "bold" }}
            >
              {mesa}
            </Center>
            <VStack flex={1} space={2}>
              <HStack justifyContent="space-between" alignItems="center">
                <Heading size="md" color={primaryColor}>Mesa {mesa}</Heading>
                <Badge 
                  colorScheme={lista ? (recogido ? "green" : "yellow") : "blue"}
                  variant="subtle" 
                  rounded="full"
                >
                  {lista ? (recogido ? "Recogido" : "Listo") : "Preparando"}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {creado && creado.toDate().toLocaleString()}
              </Text>
              <Pressable 
                onPress={() => {
                  setPedidoSeleccionado(item); // Establecer el pedido seleccionado
                  setShowModal(true); // Mostrar el modal
                }}
              >
                <Text color={primaryColor} fontWeight="bold">Detalles</Text>
              </Pressable>
            </VStack>
          </HStack>
          <Divider />
          <HStack justifyContent="space-around" p={2}>
            {!lista ? (
              <Text fontSize="sm" color="gray.500">Preparando pedido...</Text>
            ) : recogido ? (
              <Pressable 
                flex={1} 
                onPress={() => handleDespacharMesa(id, mesa)}
                _pressed={{ opacity: 0.5 }}
              >
                <HStack space={2} justifyContent="center" alignItems="center">
                  <Icon as={Ionicons} name="checkmark-circle" color={primaryColor} size="sm" />
                  <Text color={primaryColor} fontWeight="bold">Despachar Mesa</Text>
                </HStack>
              </Pressable>
            ) : (
              <Pressable 
                flex={1} 
                onPress={() => handleMarcarComoRecogido(id)}
                _pressed={{ opacity: 0.5 }}
              >
                <HStack space={2} justifyContent="center" alignItems="center">
                  <Icon as={Ionicons} name="hand-left" color={primaryColor} size="sm" />
                  <Text color={primaryColor} fontWeight="bold">Marcar como Recogido</Text>
                </HStack>
              </Pressable>
            )}
          </HStack>
        </Box>
      </Pressable>
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

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
    <Box flex={1} bg="coolGray.100" safeArea>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <VStack space={4} flex={1}>
        <HStack bg={primaryColor} px={4} py={3} justifyContent="space-between" alignItems="center">
          <Heading color="white" size="lm">Actualizar</Heading>
          <IconButton 
            icon={<Icon as={Ionicons} name="refresh" color="white" size="sm" />} 
            onPress={onRefresh}
          />
        </HStack>
        <FlatList
          data={pedidos}
          renderItem={renderPedido}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <Center flex={1} py={20}>
              <Text color="gray.500">No hay pedidos pendientes</Text>
            </Center>
          }
        />
      </VStack>

      {/* Modal para mostrar detalles del pedido */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} _backdrop={{
        _dark: { bg: "coolGray.800" },
        bg: "warmGray.50"
      }}>
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Detalles del Pedido</Modal.Header>
          <Modal.Body>
            {pedidoSeleccionado ? (
              <>
                <Text fontWeight="bold">Mesa: {pedidoSeleccionado.mesa}</Text>
                <Text color="gray.500">Estado: {pedidoSeleccionado.recogido ? "Recogido" : (pedidoSeleccionado.lista ? "Listo" : "Preparando")}</Text>
                <Text>Creado: {pedidoSeleccionado.creado && pedidoSeleccionado.creado.toDate().toLocaleString()}</Text>

                {/* Mostrar la solicitud del cliente */}
                {pedidoSeleccionado.solicitudCliente ? (
                  <Text mt={2} fontWeight="bold">Solicitud del Cliente: {pedidoSeleccionado.solicitudCliente}</Text>
                ) : null}

                {/* Mostrar los platillos seleccionados */}
                <Text mt={4} fontWeight="bold">Platillos:</Text>
                {pedidoSeleccionado.orden && pedidoSeleccionado.orden.length > 0 ? (
                  pedidoSeleccionado.orden.map((platillo, index) => (
                    <Box key={index} mt={2} p={2} bg="gray.100" rounded="md">
                      <Text fontWeight="bold">{platillo.nombre}</Text>
                      <Text>Cantidad: {platillo.cantidad}</Text>
                      <Text>Precio: ${platillo.precio.toLocaleString()}</Text>
                      <Text>Total: ${platillo.total.toLocaleString()}</Text>
                      <Text>Descripción: {platillo.descripcion}</Text>
                    </Box>
                  ))
                ) : (
                  <Text>No hay platillos en esta orden.</Text>
                )}
              </>
            ) : (
              <Text>No se encontraron detalles para este pedido.</Text>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={() => setShowModal(false)}>
                Cancelar
              </Button>

              {/* Si el pedido está en estado Preparando, mostrar el botón Editar */}
              {pedidoSeleccionado && !pedidoSeleccionado.lista && !pedidoSeleccionado.recogido ? (
                <Button onPress={() => {
                  setShowModal(false);
                  navigation.navigate('EditarPedido', { pedidoId: pedidoSeleccionado.id });
                }}>
                  Editar
                </Button>
              ) : (
                <Button onPress={() => setShowModal(false)}>
                  Aceptar
                </Button>
              )}
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Aquí agregamos el navbar */}
      <HStack style={styles.navbar} bg={primaryColor} alignItems="center" justifyContent="space-around" safeAreaBottom>
        <Pressable opacity={0.5} py="3" flex={1} onPress={() => navigation.navigate('NuevaOrden')}>
          <VStack alignItems="center">
            <Icon as={Ionicons} name="home" size="sm" color="white" />
            <Text color="white" fontSize="12">Inicio</Text>
          </VStack>
        </Pressable>
        <Pressable opacity={1} py="3" flex={1}>
          <VStack alignItems="center">
            <Icon as={Ionicons} name="cart" size="sm" color="white" />
            <Text color="white" fontSize="12">Pedidos</Text> 
          </VStack>
        </Pressable>
        <Pressable opacity={0.5} py="3" flex={1} onPress={() => navigation.navigate('PerfilUsuario')}>
          <VStack alignItems="center">
            <Icon as={Ionicons} name="person" size="sm" color="white" />
            <Text color="white" fontSize="12">Perfil</Text>
          </VStack>
        </Pressable>
      </HStack>
    </Box>
  );
};

// Estilos
const styles = {
  navbar: {
    borderTopColor: '#F5F5F5',
    borderTopWidth: 1,
  },
};

export default Pedidos;
