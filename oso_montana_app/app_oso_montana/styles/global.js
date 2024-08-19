import { Center } from 'native-base';
import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
    contenedor: {
        flex: 10
    },
    contenido: {
        marginHorizontal: '2.5%',
        flex: 1,
    },
    boton: {
        backgroundColor: '#853030',
        borderRadius: 10
    },
    botonTexto: {
        textTransform: 'uppercase',
        fontWeight: 'bold',
        color: '#FFFFFF'
    },
    titulo: {
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 20,
        fontSize: 25
    },
    imagen: {
        height: 300,
        width: '100%'
    },
    cantidad: {
        marginVertical: 20,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold'
    }
})
export default globalStyles;