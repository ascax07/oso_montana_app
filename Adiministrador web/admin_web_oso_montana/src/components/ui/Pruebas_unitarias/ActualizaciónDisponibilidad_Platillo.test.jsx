import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Platillo from '../Platillo';
import FirebaseContext from '../../../firebase/context';
import { describe, it, expect, vi } from 'vitest';

describe('Platillo Component - Actualización de disponibilidad', () => {
    it('updates availability when selection changes', () => {
        const platillo = {
            id: '66qCCqvuK3CKio0Lc1N0',
            nombre: 'torta de chocolate',
            imagen: 'https://firebasestorage.googleapis.com/v0/b/restaurante-90728.appspot.com/o/productos%2Ftorta_chocolate.png?alt=media&token=defcffeb-aec7-488a-aee0-8ad1a010476a',
            existencia: true, // Inicialmente, el platillo está disponible
            categoria: 'postre',
            precio: 5000,
            descripcion: 'torta fría cubierta de chocolate',
        };

        // Crea un mock para el contexto de Firebase y el método update
        const mockUpdate = vi.fn();
        const mockFirebase = {
            db: {
                collection: () => ({
                    doc: () => ({
                        update: mockUpdate, // Simula el método update
                    }),
                }),
            },
        };

        // Renderiza el componente con FirebaseContext.Provider y MemoryRouter
        render(
            <MemoryRouter>
                <FirebaseContext.Provider value={{ firebase: mockFirebase }}>
                    <Platillo platillo={platillo} />
                </FirebaseContext.Provider>
            </MemoryRouter>
        );

        // Simula el cambio de disponibilidad del platillo (de true a false)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'false' } });

        // Verifica que el método update fue llamado con la nueva disponibilidad
        expect(mockUpdate).toHaveBeenCalledWith({ existencia: false });
    });
});
