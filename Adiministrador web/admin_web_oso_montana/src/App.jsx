import React from 'react';
import { Routes, Route } from 'react-router-dom';
import firebase from './firebase';
import FirebaseContext from './firebase/context';
import Ordenes from './components/paginas/Ordenes';
import Menu from './components/paginas/Menu';
import NuevoPlatillo from './components/paginas/NuevoPlatillo';
import Sidebar from './components/ui/Sidebar';
import EditarPlatillo from './components/paginas/EditarPlatillo';
import Mesas from './components/paginas/Mesas';
import NuevaMesa from './components/paginas/NuevaMesa';
import EditarMesa from './components/paginas/EditarMesa';
import Ingresos from './components/paginas/Ingresos';
import Graficas from './components/paginas/Graficas';


import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';           // Estilos generales de PrimeReact
import 'primeicons/primeicons.css';                         // Iconos


function App() {
  return (
    <FirebaseContext.Provider value={{ firebase }}>
      <div className="md:flex min-h-screen">
        <Sidebar />
        <div className="md:w-3/5 xl:w-4/5 p-6">
          <Routes>
            <Route path="/" element={<Ordenes />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/nuevo-platillo" element={<NuevoPlatillo />} />
            <Route path="/editar-platillo/:id" element={<EditarPlatillo />} />
            <Route path="/mesas" element={<Mesas />} />
            <Route path="/nueva-mesa" element={<NuevaMesa />} />
            <Route path="/editar-mesa/:id" element={<EditarMesa />} />
            <Route path="/ingresos" element={<Ingresos />} />
            <Route path="/graficas" element={<Graficas />} />


          </Routes>
        </div>
      </div>
    </FirebaseContext.Provider>
  );
}

export default App
