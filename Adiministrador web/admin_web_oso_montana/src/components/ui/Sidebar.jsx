import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
    const actualLocation = useLocation().pathname;
    const locations = [
        { to: "/", name: "Ordenes" },
        { to: "/menu", name: "Menú" },
    ];

    return (
        <div className="md:w-2/5 xl:w-1/5 bg-red-800"> 
            <div className="p-6">
                <p className="uppercase text-white text-2xl tracking-wide text-center font-bold">Oso De La Montaña App</p>

                <p className="mt-3 text-white">Administra tu local en las siguientes opciones:</p>
            
                <nav>
                    {locations.map((value, index) => (
                        <div key={index} className="my-2">
                            <NavLink
                                className={`p-1 block ${value.to === actualLocation ? "text-yellow-400" : "text-gray-400"} hover:bg-yellow-500 hover:text-gray-900`}
                                to={value.to}
                            >
                                {value.name}
                            </NavLink>
                        </div>
                    ))}
                </nav>
            </div>
        </div>
    );
}

export default Sidebar;