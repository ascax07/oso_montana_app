import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Utensils,  Grid, DollarSign, ChartArea , HandHelping } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const actualLocation = useLocation().pathname;
  const locations = [
    { to: "/", name: "Ordenes", icon: <HandHelping className="w-6 h-6" /> },
    { to: "/menu", name: "Menú", icon: <Utensils className="w-6 h-6" /> },
    { to: "/mesas", name: "Mesas", icon: <Grid className="w-6 h-6" /> },
    { to: "/ingresos", name: "Ingresos", icon: <DollarSign className="w-6 h-6" /> },
    { to: "/graficas", name: "Graficas", icon: <ChartArea className="w-6 h-6" /> },

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
        <p className="text-sm">Mesas: 12/20 ocupadas</p>
        <p className="text-sm">Menú: 42 platos activos</p>
        <p className="text-sm">Ordenes: 8 en proceso</p>
      </motion.div>
    </motion.div>
  );
}