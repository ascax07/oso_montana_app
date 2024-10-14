import 'react-native-gesture-handler';
import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Registro from './views/Registro';
import IniciarSesion from './views/IniciarSesion';
import RecuperarContrasena from './views/RecuperarContrasena';

import PerfilUsuario from './views/PerfilUsuario';

import NuevaOrden from './views/NuevaOrden';
import Menu from './views/Menu';
import DetallePlatillo from './views/DetallePlatillo';
import FormularioPlatillo from './views/FormularioPlatillo';
import ResumenPedido from './views/ResumenPedido';
import Pedidos from './views/Pedidos';
import ProgresoPedido from './views/ProgresoPedido';
import EditarPedido from './views/EditarPedido';



//Components
import BotonResumen from './components/ui/BotonResumen';

// Importar state de context
import FirebaseState from './context/firebase/firebaseState';
import PedidoState from './context/pedidos/pedidoState';

const Stack = createStackNavigator();

const App = () => {
  return (
    <FirebaseState>
      <PedidoState>
        <NativeBaseProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="IniciarSesion" // Aquí configuramos la vista inicial
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#853030',
                },
                headerTitleStyle: {
                  fontWeight: 'bold',
                  color: '#ffffff',
                },
              }}
            >
              <Stack.Screen
                name="IniciarSesion"
                component={IniciarSesion}
                options={{ title: 'Iniciar Sesión', headerTitleAlign: 'center' }}
              />

              <Stack.Screen
                name="Recuperar_contrasena"
                component={RecuperarContrasena}
                options={{
                  title: 'Recuperar Contraseña',
                  headerTitleAlign: 'center',
                }}
              />



              <Stack.Screen
                name="Registro"
                component={Registro}
                options={{ title: 'Crear Cuenta', headerTitleAlign: 'center' }}
              />


              <Stack.Screen
                name="NuevaOrden"
                component={NuevaOrden}
                options={{
                  title: "Nueva Orden",
                  headerTitleAlign: 'center',
                  headerLeft: null,  // Deshabilita el botón de retroceso
                  gestureEnabled: false // También desactiva el gesto de deslizar para volver atrás
                }}
              />

              <Stack.Screen
                name="PerfilUsuario"
                component={PerfilUsuario}
                options={{
                  title: "Perfil Usuario",
                  headerTitleAlign: 'center',
                  headerLeft: null,  // Deshabilita el botón de retroceso
                  gestureEnabled: false // También desactiva el gesto de deslizar para volver atrás
                }}
              />

              <Stack.Screen
                name="Menu"
                component={Menu}
                options={{
                  title: "Nuestro Menu",
                  headerTitleAlign: 'center', // Esto centra el título
                  headerRight: props => <BotonResumen />
                }}
              />

              <Stack.Screen
                name="DetallePlatillo"
                component={DetallePlatillo}
                options={{
                  title: "Detalle Platillo",
                  headerTitleAlign: 'center' // Esto centra el título
                }}
              />

              <Stack.Screen
                name="FormularioPlatillo"
                component={FormularioPlatillo}
                options={{
                  title: "Ordenar Platillo",
                  headerTitleAlign: 'center' // Esto centra el título
                }}
              />

              <Stack.Screen
                name="ResumenPedido"
                component={ResumenPedido}
                options={{
                  title: "Resumen Pedido",
                  headerTitleAlign: 'center' // Esto centra el título
                }}
              />

              <Stack.Screen
                name="Pedidos"
                component={Pedidos}
                options={{
                  title: "Pedidos",
                  headerTitleAlign: 'center',// Esto centra el título
                  headerLeft: null,  // Deshabilita el botón de retroceso
                  gestureEnabled: false // También desactiva el gesto de deslizar para volver atrás
                }}
              />

              <Stack.Screen
                name="ProgresoPedido"
                component={ProgresoPedido}
                options={{
                  title: "Progreso de Pedido",
                  headerTitleAlign: 'center' // Esto centra el título
                }}
              />

              <Stack.Screen
                name="EditarPedido"
                component={EditarPedido}
                options={{
                  title: "Editar  Pedido",
                  headerTitleAlign: 'center' // Esto centra el título
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </NativeBaseProvider>
      </PedidoState>
    </FirebaseState>
  );
};

export default App;