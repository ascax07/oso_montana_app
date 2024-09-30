import React, { useState, useEffect } from 'react';
import { Box, Button, Text, VStack, NativeBaseProvider, Spinner, HStack, Icon, Pressable } from 'native-base';
import { Alert, BackHandler } from 'react-native'; 
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { query, where, collection, onSnapshot } from 'firebase/firestore'; 
import { Ionicons } from "@expo/vector-icons";
import firebase from '../firebase';
import { useColorModeValue } from 'native-base';
import {  useFocusEffect } from '@react-navigation/native';


const PerfilUsuario = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);

  const primaryColor = '#853030';
  const bgColor = useColorModeValue('warmGray.50', 'coolGray.800');
  const textColor = useColorModeValue('coolGray.800', 'warmGray.50');

  useEffect(() => {
    const auth = firebase.auth;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const usuariosRef = collection(firebase.db, 'usuarios');
        const q = query(usuariosRef, where('uid', '==', currentUser.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            setNombre(userData.nombre);
            if (!userData.activo) {
              Alert.alert(
                'Sesión inhabilitada',
                'Tu sesión ha sido inhabilitada, por favor comuníquese con el administrador.',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      await signOut(firebase.auth);
                      navigation.navigate('IniciarSesion');
                    },
                  },
                ]
              );
            }
          } else {
            console.log("No se encontró el documento del usuario en Firestore");
          }
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          onPress: async () => {
            try {
              await signOut(firebase.auth);
              Alert.alert('Sesión cerrada', 'Has cerrado la sesión exitosamente.');
              navigation.navigate('IniciarSesion');
            } catch (error) {
              Alert.alert('Error', 'Hubo un error al cerrar la sesión.');
            }
          },
        },
      ]
    );
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


  if (loading) {
    return (
      <NativeBaseProvider>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" color="primary.500" />
        </Box>
      </NativeBaseProvider>
    );
  }

  return (
    <NativeBaseProvider>
      <Box flex={1} bg={bgColor} safeArea>
        <Box flex={1} justifyContent="center" p={5}>
          {user ? (
            <VStack space={4}>
              <Text fontSize="lg" fontWeight="bold">Perfil de Usuario</Text>
              <Text>Nombre: {nombre || 'No disponible'}</Text>
              <Text>Correo: {user.email}</Text>
              <Button onPress={handleCerrarSesion} colorScheme="red">
                <Text style={{ color: '#FFF' }}>Cerrar Sesión</Text>
              </Button>
            </VStack>
          ) : (
            <Text>No se ha encontrado información del usuario</Text>
          )}
        </Box>

        {/* Navbar */}
        <HStack style={styles.navbar} bg={primaryColor} alignItems="center" justifyContent="space-around" safeAreaBottom>
          <Pressable opacity={0.5} py="3" flex={1} onPress={() => navigation.navigate('NuevaOrden')}>
            <VStack alignItems="center">
              <Icon as={Ionicons} name="home" size="sm" color="white" />
              <Text color="white" fontSize="12">Inicio</Text>
            </VStack>
          </Pressable>
          <Pressable opacity={0.5} py="3" flex={1} onPress={() => navigation.navigate('Pedidos')}>
            <VStack alignItems="center">
              <Icon as={Ionicons} name="cart" size="sm" color="white" />
              <Text color="white" fontSize="12">Pedidos</Text>
            </VStack>
          </Pressable>
          <Pressable opacity={1} py="3" flex={1} onPress={() => navigation.navigate('PerfilUsuario')}>
            <VStack alignItems="center">
              <Icon as={Ionicons} name="person" size="sm" color="white" />
              <Text color="white" fontSize="12">Perfil</Text>
            </VStack>
          </Pressable>
        </HStack>
      </Box>
    </NativeBaseProvider>
  );
};

const styles = {
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
};

export default PerfilUsuario;
