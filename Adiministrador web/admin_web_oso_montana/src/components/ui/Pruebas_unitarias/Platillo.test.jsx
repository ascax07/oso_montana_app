import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; // Importa MemoryRouter
import Platillo from '../Platillo';
import FirebaseContext from '../../../firebase/context'; // Asegúrate de que la ruta sea correcta
import { describe, it, expect } from 'vitest';

describe('Platillo Component', () => {
    it('renders Platillo component with correct data', () => {
        const platillo = {
            id: '66qCCqvuK3CKio0Lc1N0',
            nombre: 'torta de chocolate',
            imagen: 'https://firebasestorage.googleapis.com/v0/b/restaurante-90728.appspot.com/o/productos%2Ftorta_chocolate.png?alt=media&token=defcffeb-aec7-488a-aee0-8ad1a010476a',
            existencia: true,
            categoria: 'postre',
            precio: 5000,
            descripcion: 'torta fría cubierta de chocolate',
        };

        // Crea un mock para el contexto de Firebase
        const mockFirebase = {
            db: {
                collection: () => ({
                    doc: () => ({
                        update: vi.fn(), // Simula el método update (usando vi.fn de Vitest)
                    }),
                }),
            },
        };

        // Envuelve el componente en MemoryRouter y FirebaseContext.Provider
        render(
            <MemoryRouter> {/* Envolvemos con MemoryRouter */}
                <FirebaseContext.Provider value={{ firebase: mockFirebase }}>
                    <Platillo platillo={platillo} />
                </FirebaseContext.Provider>
            </MemoryRouter>
        );

        // Asegúrate de que los datos se rendericen correctamente
        expect(screen.getByText('torta de chocolate')).toBeInTheDocument();
        expect(screen.getByText('POSTRE')).toBeInTheDocument();
        expect(screen.getByText('torta fría cubierta de chocolate')).toBeInTheDocument();
        expect(screen.getByText('$ 5.000')).toBeInTheDocument(); // Cambiar la prueba para coincidir con el formato exacto
    });
});