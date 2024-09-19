import React, { useState } from 'react';
import { Button } from 'primereact/button';
import 'primereact/resources/primereact.min.css';          // Estilos de PrimeReact
import 'primeicons/primeicons.css';                        // Estilos de PrimeIcons

const CategoriaPlatillo = ({ filtrarCategoria }) => {
    // Estado para el botón seleccionado
    const [selectedCategory, setSelectedCategory] = useState('');

    // Función para manejar el clic del botón
    const handleButtonClick = (category) => {
        setSelectedCategory(category);
        filtrarCategoria(category);
    };

    // Función para obtener las clases del botón basado en la categoría seleccionada
    const getButtonClasses = (category) => {
        const baseClasses = 'w-36 h-12 border-2 transition-all ease-in-out duration-300 rounded-lg';
        const activeClasses = selectedCategory === category ? 'bg-red-800 text-white border-red-600 shadow-lg' : 'bg-black text-white border-black';
        return `${baseClasses} ${activeClasses} hover:bg-red-800 hover:border-red-500`;
    };

    return (


        
        <div className="flex flex-wrap justify-center gap-4 mb-4">
               <Button
                label="Todos"
                // icon="pi pi-list" // Icono para mostrar todos
                className={getButtonClasses('')}
                onClick={() => handleButtonClick('')}
            />
            <Button
                label="Comida"
                // icon="pi pi-utensils" // Icono para Comida
                className={getButtonClasses('comida')}
                onClick={() => handleButtonClick('comida')}
                raised
            />
            
            <Button
                label="Cena"
                // icon="pi pi-clock" // Icono para Cena
                className={getButtonClasses('cena')}
                onClick={() => handleButtonClick('cena')}
            />
            <Button
                label="Postre"
                // icon="pi pi-ice-cream" // Icono para Postre
                className={getButtonClasses('postre')}
                onClick={() => handleButtonClick('postre')}
            />
            <Button
                label="Bebida"
                // icon="pi pi-glass" // Icono para Bebida
                className={getButtonClasses('bebida')}
                onClick={() => handleButtonClick('bebida')}
            />
        </div>
    );
};

export default CategoriaPlatillo;