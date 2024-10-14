import { doc, onSnapshot } from 'firebase/firestore';
import firebase from './firebase'; // Asegúrate de tener tu Firebase configurado correctamente

// Función para escuchar cambios en un producto en Firestore
const listenToProductChanges = (productId, updateProductCallback) => {
  // Referencia al documento de Firestore
  const productRef = doc(firebase.db, 'productos', productId);

  // Configuramos el listener con onSnapshot para escuchar cambios en tiempo real
  const unsubscribe = onSnapshot(productRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      // Si el documento existe, obtenemos sus datos y los pasamos al callback
      const updatedProduct = docSnapshot.data();
      updateProductCallback(updatedProduct); // Callback para actualizar el estado en el componente
    } else {
      console.log("El producto no existe en la base de datos.");
    }
  }, (error) => {
    console.log("Error al escuchar cambios en el producto: ", error);
  });

  // Devolver el método para desuscribirse del listener
  return unsubscribe;
};

// Función para actualizar un producto en Firestore (por ejemplo, stock)
const updateProductInFirestore = async (productId, updatedData) => {
  const productRef = doc(firebase.db, 'productos', productId);
  try {
    await updateDoc(productRef, updatedData);  // Actualiza el producto en Firestore
    console.log("Producto actualizado con éxito");
  } catch (error) {
    console.error("Error al actualizar el producto: ", error);
  }
};

export { listenToProductChanges, updateProductInFirestore };
