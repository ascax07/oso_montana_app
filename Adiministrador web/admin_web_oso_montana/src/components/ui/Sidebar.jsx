import React, { useState, useEffect, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Utensils, Grid, DollarSign, ChartArea, HandHelping, Settings, UserCog2 } from "lucide-react";
import { motion } from "framer-motion";
import { FirebaseContext } from '../../firebase';  // Asegúrate de que FirebaseContext exporta `db`
import { collection, onSnapshot } from "firebase/firestore";

export default function Sidebar() {
  const actualLocation = useLocation().pathname;
  const { db } = useContext(FirebaseContext);  // Conexión a Firebase Firestore
  
  // Estados para almacenar los datos traídos de Firebase
  const [mesasOcupadas, setMesasOcupadas] = useState(0);
  const [totalMesas, setTotalMesas] = useState(0);
  const [platosActivos, setPlatosActivos] = useState(0);
  const [ordenesEnProceso, setOrdenesEnProceso] = useState(0);

  useEffect(() => {
    if (db) {
      // Obtener mesas ocupadas y total de mesas
      const unsubscribeMesas = onSnapshot(collection(db, "mesas"), (snapshot) => {
        const mesas = snapshot.docs.map((doc) => doc.data());
        const ocupadas = mesas.filter((mesa) => !mesa.disponible).length;
        setMesasOcupadas(ocupadas);
        setTotalMesas(mesas.length);
      });

      // Obtener platos activos
      const unsubscribePlatos = onSnapshot(collection(db, "productos"), (snapshot) => {
        // Filtrar solo los productos con existencia = true
        const platos = snapshot.docs
          .map((doc) => doc.data())
          .filter((plato) => plato.existencia === true); // Filtro explícito
        
        setPlatosActivos(platos.length); // Actualizar con la cantidad de platos activos
      });
      

      // Obtener órdenes en proceso
      const unsubscribeOrdenes = onSnapshot(collection(db, "ordenes"), (snapshot) => {
        const ordenes = snapshot.docs.map((doc) => doc.data());
        const enProceso = ordenes.filter((orden) => !orden.completado).length;
        setOrdenesEnProceso(enProceso);
      });

      // Limpiar los listeners al desmontar el componente
      return () => {
        unsubscribeMesas();
        unsubscribePlatos();
        unsubscribeOrdenes();
      };
    }
  }, [db]);

  const locations = [
    { to: "/", name: "Órdenes", icon: <HandHelping className="w-6 h-6" /> },
    { to: "/menu", name: "Menú", icon: <Utensils className="w-6 h-6" /> },
    { to: "/mesas", name: "Mesas", icon: <Grid className="w-6 h-6" /> },
    { to: "/ingresos", name: "Ingresos", icon: <DollarSign className="w-6 h-6" /> },
    { to: "/graficas", name: "Graficas", icon: <ChartArea className="w-6 h-6" /> },
    { to: "/gestion-usuarios", name: "Gestion usuarios", icon: <UserCog2 className="w-6 h-6" /> },
    { to: "/configuraciones", name: "Configuraciones", icon: <Settings className="w-6 h-6" /> },
  ];

  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 h-screen bg-red-800 text-white flex flex-col"
    >
      <div className="p-4 flex items-center">
        <h1 className="text-xl font-bold ml-2">Oso De La Montaña</h1>
      </div>
      
      <nav className="flex-grow">
        {locations.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center p-4 m-2 rounded-lg transition-all duration-300 ${
                isActive 
                  ? "bg-white text-red-800" 
                  : "bg-red-800 bg-opacity-50 backdrop-blur-md hover:bg-white hover:text-red-800"
              }`
            }
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-red-900 bg-opacity-50 backdrop-blur-md m-2 rounded-lg"
      >
        <h2 className="font-bold mb-2">Resumen</h2>
        <p className="text-sm">Mesas: {mesasOcupadas}/{totalMesas} ocupadas</p>
        <p className="text-sm">Menú: {platosActivos} platos activos</p>
        <p className="text-sm">Ordenes: {ordenesEnProceso} en proceso</p>
      </motion.div>
    </motion.div>
  );
}
