import 'react-native-gesture-handler';
import React from 'react';
import { NativeBaseProvider } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import NuevaOrden from './views/NuevaOrden';
import Menu from './views/Menu';
import DetallePlatillo from './views/DetallePlatillo';
import FormularioPlatillo from './views/FormularioPlatillo';
import ResumenPedido from './views/ResumenPedido';
import ProgresoPedido from './views/ProgresoPedido';

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
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#853030',
                },
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen
                name="NuevaOrden"
                component={NuevaOrden}
                options={{
                  title: "Nueva Orden",
                  headerTitleAlign: 'center' // Esto centra el título
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
                name="ProgresoPedido"
                component={ProgresoPedido}
                options={{
                  title: "Progreso de Pedido",
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