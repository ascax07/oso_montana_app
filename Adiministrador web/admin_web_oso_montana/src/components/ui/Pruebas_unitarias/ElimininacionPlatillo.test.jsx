import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Platillo from '../Platillo'; 
import FirebaseContext from '../../../firebase/context';
import { describe, it, expect, vi } from 'vitest';

describe('Platillo Component - Delete Functionality', () => {
  it('should call firebase delete function when confirm is true', () => {
    const platillo = {
      id: '66qCCqvuK3CKio0Lc1N0',
      nombre: 'torta de chocolate',
      imagen: 'https://example.com/torta_chocolate.png',
      existencia: true,
      categoria: 'postre',
      precio: 5000,
      descripcion: 'torta fría cubierta de chocolate',
    };

    // Mock de la confirmación del navegador
    const mockConfirm = vi.fn().mockReturnValue(true);
    window.confirm = mockConfirm;

    // Mock de la función delete de Firebase
    const mockDelete = vi.fn();
    const mockFirebase = {
      db: {
        collection: () => ({
          doc: () => ({
            delete: mockDelete,
          }),
        }),
      },
    };

    // Renderizar el componente Platillo
    render(
      <MemoryRouter>
        <FirebaseContext.Provider value={{ firebase: mockFirebase }}>
          <Platillo platillo={platillo} />
        </FirebaseContext.Provider>
      </MemoryRouter>
    );

    // Usar getByRole para encontrar el botón de eliminar
    const deleteButton = screen.getByRole('button', { name: /Eliminar Platillo/i });
    fireEvent.click(deleteButton);

    // Verificar que window.confirm fue llamado
    expect(mockConfirm).toHaveBeenCalled();

    // Verificar que la función delete de Firebase fue llamada
    expect(mockDelete).toHaveBeenCalled();
  });
});
