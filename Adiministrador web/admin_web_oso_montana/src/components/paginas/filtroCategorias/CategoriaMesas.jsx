import React, { useState } from 'react';
import { Tag } from 'primereact/tag';

const CategoriaMesas = ({ filtrarCategoria }) => {
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
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
            {/* Search Bar with Tag */}
            <div className="flex w-full md:w-1/2 items-center">
                <Tag value="Buscar" className="bg-red-700 text-white px-6 py-3 h-full" />
                <input
                    type="text"
                    placeholder="Buscar mesa por numero o capacidad..."
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:outline-none focus:border-red-800 transition-colors duration-300 rounded-r-lg"
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Category Dropdown */}
            <div className="relative inline-block w-full md:w-1/4">
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2 border-2 border-gray-300 focus:outline-none focus:border-red-800 transition-colors duration-300 rounded-lg appearance-none bg-white"
                >
                    <option value="">Todas las ubicaciones</option>
                    <option value="primer piso">primer piso</option>
                    <option value="segundo piso">segundo piso</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                        className="w-4 h-4 text-gray-600"
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

export default CategoriaMesas;
