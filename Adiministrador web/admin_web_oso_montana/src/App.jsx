import React, { useEffect, useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import Ordenes from "./components/paginas/Ordenes";
import Menu from "./components/paginas/Menu";
import NuevoPlatillo from "./components/paginas/NuevoPlatillo";
import Sidebar from "./components/ui/Sidebar";
import EditarPlatillo from "./components/paginas/EditarPlatillo";
import Mesas from "./components/paginas/Mesas";
import NuevaMesa from "./components/paginas/NuevaMesa";
import EditarMesa from "./components/paginas/EditarMesa";
import Ingresos from "./components/paginas/Ingresos";
import Graficas from "./components/paginas/Graficas";
import Login from "./components/paginas/Login";
import RecuperarContrasena from "./components/paginas/RecuperarContrasena";
import GestionUsuarios from "./components/paginas/GestionUsuarios";
import Configuraciones from "./components/paginas/Configuraciones";
import { ThemeProvider, ThemeContext } from "./components/ui/ThemeContext";

import "primereact/resources/themes/tailwind-light/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function AppContent() {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const datosUsuario = docSnap.data();
            if (datosUsuario.rol === "administrador") {
              setUsuario(user);
              setRol("administrador");
            } else {
              setUsuario(null);
            }
          } else {
            setUsuario(null);
          }
        } catch (error) {
          console.error("Error al verificar el rol:", error);
        }
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-semibold text-gray-800">Cargando...</div>
      </div>
    );
  }

  const RutaPrivada = ({ children }) => {
    return usuario && rol === "administrador" ? children : <Navigate to="/login" />;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {usuario && rol === "administrador" ? (
        <div className={`md:flex ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <Sidebar />
          <div className="md:w-3/5 xl:w-4/5 p-6">
            <Routes>
              <Route path="/" element={<RutaPrivada><Ordenes /></RutaPrivada>} />
              <Route path="/menu" element={<RutaPrivada><Menu /></RutaPrivada>} />
              <Route path="/nuevo-platillo" element={<RutaPrivada><NuevoPlatillo /></RutaPrivada>} />
              <Route path="/editar-platillo/:id" element={<RutaPrivada><EditarPlatillo /></RutaPrivada>} />
              <Route path="/mesas" element={<RutaPrivada><Mesas /></RutaPrivada>} />
              <Route path="/nueva-mesa" element={<RutaPrivada><NuevaMesa /></RutaPrivada>} />
              <Route path="/editar-mesa/:id" element={<RutaPrivada><EditarMesa /></RutaPrivada>} />
              <Route path="/ingresos" element={<RutaPrivada><Ingresos /></RutaPrivada>} />
              <Route path="/graficas" element={<RutaPrivada><Graficas /></RutaPrivada>} />
              <Route path="/gestion-usuarios" element={<RutaPrivada><GestionUsuarios /></RutaPrivada>} />
              <Route path="/configuraciones" element={<RutaPrivada><Configuraciones /></RutaPrivada>} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="w-full max-w-md">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar-contraseña" element={<RecuperarContrasena />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;