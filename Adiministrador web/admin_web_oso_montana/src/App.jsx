import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase/firebase'; // Firebase Auth y Firestore
import { doc, getDoc } from 'firebase/firestore'; // Importa los métodos necesarios de Firestore
import Ordenes from './components/paginas/Ordenes';
import Menu from './components/paginas/Menu';
import NuevoPlatillo from './components/paginas/NuevoPlatillo';
import Sidebar from './components/ui/Sidebar';  // Solo una vez
import EditarPlatillo from './components/paginas/EditarPlatillo';
import Mesas from './components/paginas/Mesas';
import NuevaMesa from './components/paginas/NuevaMesa';
import EditarMesa from './components/paginas/EditarMesa';
import Ingresos from './components/paginas/Ingresos';
import Graficas from './components/paginas/Graficas';
import Login from './components/paginas/Login';
import Configuraciones from './components/paginas/Configuraciones';

import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';           
import 'primeicons/primeicons.css';     

function App() {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Obtenemos el documento del usuario en Firestore para verificar el rol
          const docRef = doc(db, "usuarios", user.uid); // Usa el método doc correctamente
          const docSnap = await getDoc(docRef); // Usamos getDoc para obtener el documento

          if (docSnap.exists()) {
            const datosUsuario = docSnap.data();
            if (datosUsuario.rol === "administrador") {
              setUsuario(user);
              setRol("administrador");
            } else {
              setUsuario(null);  // El rol no es administrador
            }
          } else {
            setUsuario(null); // Usuario no encontrado en Firestore
          }
        } catch (error) {
          console.error("Error al verificar el rol:", error);
        }
      } else {
        setUsuario(null);
      }
      setCargando(false); // Terminamos de cargar cuando termina la verificación
    });

    return () => unsubscribe();
  }, []);

  if (cargando) {
    return <p>Cargando...</p>;
  }

  const RutaPrivada = ({ children }) => {
    return usuario && rol === "administrador" ? children : <Navigate to="/login" />;
  };

  return (
    <div className="md:flex min-h-screen">
      {usuario && <Sidebar />}
      <div className="md:w-3/5 xl:w-4/5 p-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaPrivada><Ordenes /></RutaPrivada>} />
          <Route path="/menu" element={<RutaPrivada><Menu /></RutaPrivada>} />
          <Route path="/nuevo-platillo" element={<RutaPrivada><NuevoPlatillo /></RutaPrivada>} />
          <Route path="/editar-platillo/:id" element={<RutaPrivada><EditarPlatillo /></RutaPrivada>} />
          <Route path="/mesas" element={<RutaPrivada><Mesas /></RutaPrivada>} />
          <Route path="/nueva-mesa" element={<RutaPrivada><NuevaMesa /></RutaPrivada>} />
          <Route path="/editar-mesa/:id" element={<RutaPrivada><EditarMesa /></RutaPrivada>} />
          <Route path="/ingresos" element={<RutaPrivada><Ingresos /></RutaPrivada>} />
          <Route path="/graficas" element={<RutaPrivada><Graficas /></RutaPrivada>} />
          <Route path="/configuraciones" element={<RutaPrivada><Configuraciones /></RutaPrivada>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
