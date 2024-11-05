import React, { useState, useContext } from 'react';
import { Tag } from 'primereact/tag';
import { ThemeContext } from '../../ui/ThemeContext';

const CategoriaPlatillo = ({ filtrarCategoria }) => {
    const { darkMode } = useContext(ThemeContext);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        filtrarCategoria(category, searchQuery);
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        filtrarCategoria(selectedCategory, query);
    };

    return (
        <div className={`flex flex-col md:flex-row items-center justify-center gap-4 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex w-full md:w-1/2 items-center">
                <Tag value="Buscar" className={`${darkMode ? 'bg-red-900' : 'bg-red-700'} text-white px-6 py-3 h-full`} />
                <input
                    type="text"
                    placeholder="Buscar platillo..."
                    className={`w-full px-4 py-2 border-2 ${
                        darkMode 
                        ? 'bg-gray-700 text-white border-gray-600 focus:border-red-600' 
                        : 'bg-white text-black border-gray-300 focus:border-red-800'
                    } focus:outline-none transition-colors duration-300 rounded-r-lg`}
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="relative inline-block w-full md:w-1/4">
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className={`w-full px-4 py-2 border-2 ${
                        darkMode 
                        ? 'bg-gray-700 text-white border-gray-600 focus:border-red-600' 
                        : 'bg-white text-black border-gray-300 focus:border-red-800'
                    } focus:outline-none transition-colors duration-300 rounded-lg appearance-none`}
                >
                    <option value="">Selecciona una categoría</option>
                    <option value="cafe_caliente">cafe caliente</option>
                    <option value="cafe_frio">cafe frio</option>
                    <option value="helados">helados</option>
                    <option value="bebida">Bebida</option>
                    <option value="postre">Postre</option>
                    <option value="merienda">merienda</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                        className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                        ></path>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default CategoriaPlatillo;