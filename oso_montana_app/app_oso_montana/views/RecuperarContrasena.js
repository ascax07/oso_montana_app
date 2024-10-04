import React, { useState, useContext } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Box, Button, Input, VStack, Text, NativeBaseProvider, Icon, Pressable } from 'native-base';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import firebase from '../firebase';

const RecuperarContrasena = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const primaryColor = '#853030';

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingrese su correo electrónico.');
      return;
    }

    setIsLoading(true);

    try {
      const usuariosRef = collection(firebase.db, 'usuarios');
      const q = query(usuariosRef, where('email', '==', email), where('rol', '==', 'mesero'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Send password reset email if the user with the role "mesero" exists
        await sendPasswordResetEmail(firebase.auth, email);
        Alert.alert('Éxito', 'Se ha enviado un correo para restablecer la contraseña.');
        navigation.navigate('IniciarSesion');
      } else {
        Alert.alert('Error', 'No se encontró un mesero registrado con este correo.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al intentar restablecer la contraseña. Inténtelo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NativeBaseProvider>
      <Box flex={1} alignItems="center" justifyContent="center" p={5}>
        <VStack space={4} width="90%">
          <Text fontSize="xl" mb={6} bold>Recuperar Contraseña</Text>
          <Input
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            InputLeftElement={<Icon as={<MaterialIcons name="email" />} size={5} ml={2} />}
            variant="outline"
            borderRadius="full"
          />
          <Button
            onPress={handlePasswordReset}
            isLoading={isLoading}
            isLoadingText="Enviando..."
            borderRadius="full"
            colorScheme="red"
          >
            Restablecer Contraseña
          </Button>
          <Pressable onPress={() => navigation.navigate('IniciarSesion')}>
            <Text color="red.500" mt={4}>Volver a Iniciar Sesión</Text>
          </Pressable>
        </VStack>
      </Box>
    </NativeBaseProvider>
  );
};

export default RecuperarContrasena;
