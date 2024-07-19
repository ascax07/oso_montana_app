import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, Button, Text, NativeBaseProvider } from 'native-base';
import globalStyles from '../styles/global';
import { useNavigation } from '@react-navigation/native';

const NuevaOrden = () => {

    const navigation = useNavigation();


    return (  
        <NativeBaseProvider>
            <Box style={globalStyles.contenedor}>
                <Box style={[globalStyles.contenido, styles.contenido]}>
                    <Button
                        style={globalStyles.boton}
                        block
                        onPress={ () => navigation.navigate('Menu')  }
                    >
                        <Text style={globalStyles.botonTexto}>Crear Nueva Orden</Text>
                    </Button>
                </Box>
            </Box>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    contenido: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    }
});

export default NuevaOrden;