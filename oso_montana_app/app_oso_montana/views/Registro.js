import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet } from 'react-native';
import { Box, Button, Input, Text, VStack, NativeBaseProvider, HStack, Icon, Pressable, useColorModeValue, ScrollView } from 'native-base';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import firebase from '../firebase';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Registro = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [nombre, setNombre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue('warmGray.50', 'coolGray.800');
  const textColor = useColorModeValue('coolGray.800', 'warmGray.50');
  const placeholderColor = useColorModeValue('coolGray.400', 'coolGray.400');
  const primaryColor = '#853030';

  const handleRegistro = async () => {
    // Verificar si todos los campos están llenos
    if (!email || !nombre || !contraseña || !confirmarContraseña) {
      Alert.alert('Atención', 'Debes rellenar todos los campos');
      return;
    }
  
    if (contraseña.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
  
  
  
    if (contraseña !== confirmarContraseña) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(firebase.auth, email, contraseña);
      const { user } = userCredential;
  
      await addDoc(collection(firebase.db, 'usuarios'), {
        uid: user.uid,
        email: user.email,
        nombre,
        rol: 'mesero',
        activo: false
      });
  
      Alert.alert('Éxito', 'Usuario registrado correctamente');
      navigation.navigate('IniciarSesion');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Este correo electrónico ya está registrado. Intenta con otro.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
      } else if (error.code === 'auth/network-request-failed') {
        Alert.alert('Error', 'Error de red. Verifica tu conexión a Internet.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <NativeBaseProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bg={bgColor}>
        <Box flex={1} justifyContent="center" alignItems="center" p={5}>
          <Animated.View entering={FadeInDown.delay(200).duration(1000)} style={styles.formContainer}>
            <VStack space={4} alignItems="center" width={width * 0.8}>
              <Text fontSize="3xl" fontWeight="bold" color={primaryColor} mb={6}>
                Crear Cuenta
              </Text>
              <Input
                w="100%"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                InputLeftElement={
                  <Icon as={<MaterialIcons name="email" />} size={5} ml={2} color={placeholderColor} />
                }
                borderRadius="full"
                fontSize="md"
                color={textColor}
                placeholderTextColor={placeholderColor}
                _focus={{
                  borderColor: primaryColor,
                  backgroundColor: `${primaryColor}10`,
                }}
              />
              <Input
                w="100%"
                placeholder="Nombre completo"
                value={nombre}
                onChangeText={setNombre}
                InputLeftElement={
                  <Icon as={<MaterialIcons name="person" />} size={5} ml={2} color={placeholderColor} />
                }
                borderRadius="full"
                fontSize="md"
                color={textColor}
                placeholderTextColor={placeholderColor}
                _focus={{
                  borderColor: primaryColor,
                  backgroundColor: `${primaryColor}10`,
                }}
              />
              <Input
                w="100%"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={contraseña}
                onChangeText={setContraseña}
                InputLeftElement={
                  <Icon as={<MaterialIcons name="lock" />} size={5} ml={2} color={placeholderColor} />
                }
                InputRightElement={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Icon as={<MaterialIcons name={showPassword ? "visibility" : "visibility-off"} />} size={5} mr={2} color={placeholderColor} />
                  </Pressable>
                }
                borderRadius="full"
                fontSize="md"
                color={textColor}
                placeholderTextColor={placeholderColor}
                _focus={{
                  borderColor: primaryColor,
                  backgroundColor: `${primaryColor}10`,
                }}
              />
              <Input
                w="100%"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar Contraseña"
                value={confirmarContraseña}
                onChangeText={setConfirmarContraseña}
                InputLeftElement={
                  <Icon as={<MaterialIcons name="lock" />} size={5} ml={2} color={placeholderColor} />
                }
                InputRightElement={
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Icon as={<MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} />} size={5} mr={2} color={placeholderColor} />
                  </Pressable>
                }
                borderRadius="full"
                fontSize="md"
                color={textColor}
                placeholderTextColor={placeholderColor}
                _focus={{
                  borderColor: primaryColor,
                  backgroundColor: `${primaryColor}10`,
                }}
              />
              <Button
                w="100%"
                onPress={handleRegistro}
                isLoading={isLoading}
                isLoadingText="Registrando..."
                borderRadius="full"
                bg={primaryColor}
                _pressed={{ bg: `${primaryColor}CC` }}
                mt={4}
              >
                <Text color="white" fontSize="md" fontWeight="bold">
                  Registrarse
                </Text>
              </Button>
              <HStack mt={4}>
                <Text fontSize="sm" color={textColor}>¿Ya tienes una cuenta? </Text>
                <Pressable onPress={() => navigation.navigate('IniciarSesion')}>
                  <Text fontSize="sm" color={primaryColor} fontWeight="bold">
                    Inicia sesión
                  </Text>
                </Pressable>
              </HStack>
            </VStack>
          </Animated.View>
        </Box>
      </ScrollView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: width * 0.9,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Registro;
