import 'react-native-gesture-handler';
import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import Views
import NuevaOrden from './views/NuevaOrden';
import Menu from './views/Menu';
import DetallePlatillo from './views/DetallePlatillo';
import FormularioPlatillo from './views/FormularioPlatillo';
import ResumenPedido from './views/ResumenPedido';
import ProgresoPedido from './views/ProgresoPedido';
import Pedidos from './views/Pedidos';
import PerfilUsuario from './views/PerfilUsuario';
import RecuperarContrasena from './views/RecuperarContrasena'; 
import IniciarSesion from './views/IniciarSesion'; 

import Registro from './views/Registro';           // Added Registro

// Import Contexts
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
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#853030',
                },
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              {/* Add the screens here */}
              <Stack.Screen
                name="IniciarSesion" // Add IniciarSesion screen
                component={IniciarSesion}
                options={{
                  title: 'Iniciar Sesión',
                  headerTitleAlign: 'center',
                }}
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
                name="Registro" // Add Registro screen
                component={Registro}
                options={{
                  title: 'Registro',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name="NuevaOrden"
                component={NuevaOrden}
                options={{
                  title: 'Nueva Orden',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name="Menu"
                component={Menu}
                options={{
                  title: 'Nuestro Menú',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name="DetallePlatillo"
                component={DetallePlatillo}
                options={{
                  title: 'Detalle Platillo',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name="FormularioPlatillo"
                component={FormularioPlatillo}
                options={{
                  title: 'Ordenar Platillo',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name="ResumenPedido"
                component={ResumenPedido}
                options={{
                  title: 'Resumen Pedido',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name="ProgresoPedido"
                component={ProgresoPedido}
                options={{
                  title: 'Progreso de Pedido',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name="Pedidos"
                component={Pedidos}
                options={{
                  title: 'Lista de Pedidos',
                  headerTitleAlign: 'center',
                }}
              />

              <Stack.Screen
                name="PerfilUsuario"
                component={PerfilUsuario}
                options={{
                  title: 'Perfil de Usuario',
                  headerTitleAlign: 'center',
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
