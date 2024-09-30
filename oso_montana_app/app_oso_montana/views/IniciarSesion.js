import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet } from 'react-native';
import { Box, Button, Input, Text, VStack, NativeBaseProvider, HStack, Icon, Pressable, useColorModeValue, Center, Image } from 'native-base';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { query, where, getDocs, collection } from 'firebase/firestore';
import firebase from '../firebase';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const IniciarSesion = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue('warmGray.50', 'coolGray.800');
  const textColor = useColorModeValue('coolGray.800', 'warmGray.50');
  const placeholderColor = useColorModeValue('coolGray.400', 'coolGray.400');
  const primaryColor = '#853030'; // Nuevo color primario

  const handleIniciarSesion = async () => {
    if (!email || !contraseña) {
      Alert.alert('Error', 'Por favor ingrese el correo y la contraseña');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(firebase.auth, email, contraseña);
      const { user } = userCredential;

      const usuariosRef = collection(firebase.db, 'usuarios');
      const q = query(usuariosRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.activo) {
          Alert.alert('Éxito', 'Inicio de sesión exitoso');
          navigation.navigate('NuevaOrden');
        } else {
          Alert.alert('Permiso denegado', 'No tiene permiso para acceder. Por favor comuníquese con el administrador.');
        }
      } else {
        Alert.alert('Error', 'Usuario no registrado, por favor cree una cuenta.');
      }
    } catch (error) {
      console.log("Error de autenticación:", error);
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'Usuario no registrado, por favor cree una cuenta.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Contraseña incorrecta.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NativeBaseProvider>
      <Box flex={1} bg={bgColor} alignItems="center" justifyContent="center">
        <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
          <Image
            source={require('../components/ui/imagenes/logo_oso_montana.png')} // Adjust the path to your assets folder
            alt=""
            size="xl"
            mb={10}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000)} style={styles.formContainer}>
          <VStack space={5} alignItems="center" width={width * 0.8}>
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
            <Button
              w="100%"
              onPress={handleIniciarSesion}
              isLoading={isLoading}
              isLoadingText="Iniciando sesión..."
              borderRadius="full"
              bg={primaryColor}
              _pressed={{ bg: `${primaryColor}CC` }}
            >
              <Text color="white" fontSize="md" fontWeight="bold">
                Iniciar Sesión
              </Text>
            </Button>
            <HStack mt={4}>
              <Text fontSize="sm" color={textColor}>¿No tienes una cuenta? </Text>
              <Pressable onPress={() => navigation.navigate('Registro')}>
                <Text fontSize="sm" color={primaryColor} fontWeight="bold">
                  Crea una
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </Animated.View>
      </Box>
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

export default IniciarSesion;