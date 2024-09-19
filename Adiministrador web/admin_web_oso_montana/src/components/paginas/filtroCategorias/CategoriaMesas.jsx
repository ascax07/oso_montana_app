import React, { useState } from 'react';
import { Button } from 'primereact/button'; // Suponiendo que estás usando PrimeReact

const CategoriaMesas = ({ filtrarUbicacion }) => {
  const [selectedUbicacion, setSelectedUbicacion] = useState('');

  const handleButtonClick = (ubicacion) => {
    setSelectedUbicacion(ubicacion);
    filtrarUbicacion(ubicacion);
  };

  const getButtonClasses = (ubicacion) => {
    const baseClasses = 'w-36 h-12 border-2 transition-all ease-in-out duration-300 rounded-lg';
    const activeClasses = selectedUbicacion === ubicacion ? 'bg-red-800 text-white border-red-600 shadow-lg' : 'bg-black text-white border-black';
    return `${baseClasses} ${activeClasses} hover:bg-red-800 hover:border-red-500`;
  };

  return (
    
    <div className="flex flex-wrap justify-center gap-4 mb-4">

<Button
        label="Todos"
        className={getButtonClasses('')}
        onClick={() => handleButtonClick('')}
      />

      <Button
        label="Primer Piso"
        className={getButtonClasses('primer piso')}
        onClick={() => handleButtonClick('primer piso')}
      />
      <Button
        label="Segundo Piso"
        className={getButtonClasses('segundo piso')}
        onClick={() => handleButtonClick('segundo piso')}
      />
   
    </div>
  );
};

export default CategoriaMesas;
