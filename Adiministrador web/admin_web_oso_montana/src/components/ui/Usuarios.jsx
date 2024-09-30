import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const Usuarios = () => {
    const { db } = useContext(FirebaseContext);
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const obtenerUsuarios = () => {
            const usuariosCollection = collection(db, 'usuarios');
            onSnapshot(usuariosCollection, (snapshot) => {
                const usuariosData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filtrar solo usuarios con rol 'mesero' o 'cocinero'
                const usuariosFiltrados = usuariosData.filter(usuario => 
                    usuario.rol === 'mesero' || usuario.rol === 'cocinero'
                );

                setUsuarios(usuariosFiltrados);
            });
        };

        obtenerUsuarios();
    }, [db]);
    
    // Función para actualizar el estado activo en Firestore
    const actualizarEstadoActivo = async (id, nuevoEstado) => {
        try {
            const usuarioRef = doc(db, 'usuarios', id);
            await updateDoc(usuarioRef, { activo: nuevoEstado });
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
        }
    };

    // Función para renderizar el select de estado activo/inactivo
    const estadoBodyTemplate = (data) => (
        <select
            className="bg-white shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            value={data.activo ? "true" : "false"}
            onChange={(e) => actualizarEstadoActivo(data.id, e.target.value === "true")}
        >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
        </select>
    );

    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Usuarios Registrados</h2>
            <DataTable value={usuarios} paginator rows={5} rowsPerPageOptions={[5, 10, 25]}>
                <Column field="nombre" header="Nombre"></Column>
                <Column field="email" header="Correo"></Column>
                <Column field="rol" header="Rol"></Column>
                <Column header="Estado" body={estadoBodyTemplate}></Column>
            </DataTable>
        </div>
    );
};

export default Usuarios;
