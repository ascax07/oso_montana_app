import React from 'react';
import { StyleSheet, View , TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
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

                <View style={[styles.navbar, { marginBottom: 9 * -1 }]}>
                    <TouchableOpacity style={styles.navButton}>
                        <Ionicons name="home" size={25} color={'#FFFFFF'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navButton}>
                        <Ionicons name="cart" size={25} color={'#FFFFFF'} />
                    </TouchableOpacity>
                </View>
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
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#853030',
        paddingVertical: 25,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 4,
      },
      navButton: {
        paddingHorizontal: 10,
      },
});

export default NuevaOrden;