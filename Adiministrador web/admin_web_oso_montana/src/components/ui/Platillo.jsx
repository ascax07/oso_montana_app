import React, { useContext, useRef } from 'react';
import { FirebaseContext } from '../../firebase';
import { Link } from 'react-router-dom';

const Platillo = ({ platillo }) => {

    // Existencia ref para acceder al valor directamente
    const existenciaRef = useRef(platillo.existencia);

    // Context de Firebase para cambios en la BD
    const { firebase } = useContext(FirebaseContext);

    const { id, nombre, imagen, existencia, categoria, precio, descripcion } = platillo;

    // Modificar el estado del platillo en Firebase
    const actualizarDisponibilidad = () => {
        const existencia = (existenciaRef.current.value === "true");

        try {
            firebase.db.collection('productos')
                .doc(id)
                .update({
                    existencia
                });
        } catch (error) {
            console.log(error);
        }
    }

    // Eliminar el platillo de Firebase
    const eliminarPlatillo = async () => {
        const confirmar = window.confirm(`¿Estás seguro que deseas eliminar el platillo ${nombre}?`);
        if (confirmar) {
            try {
                await firebase.db.collection('productos')
                    .doc(id)
                    .delete();
                alert('Platillo eliminado con éxito');
            } catch (error) {
                console.error('Error eliminando el platillo:', error);
                alert('Hubo un error al eliminar el platillo');
            }
        }
    }

    // Formatear el precio en pesos colombianos
    const formatearPrecio = (precio) => {
        return precio.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP',
            minimumFractionDigits: 0, // No mostrar dígitos decimales mínimos
            maximumFractionDigits: 0  // No mostrar dígitos decimales máximos
        });
    };

    return (
        <div className="w-full px-3 mb-4">
            <div className="p-5 shadow-md bg-white">
                <div className="lg:flex">
                    <div className="lg:w-5/12 xl:w-3/12">
                        <img src={imagen} alt="imagen platillo" />

                        <div className="sm:flex sm:-mx-2 pl-2">
                            <label className="block mt-5 sm:w-2/4">
                                <span className="block text-gray-800 mb-2">Existencia</span>
                                <select 
                                    className="bg-white shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                                    value={existencia}
                                    ref={existenciaRef}
                                    onChange={actualizarDisponibilidad}
                                >
                                    <option value="true">Disponible</option>
                                    <option value="false">No Disponible</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    <div className="lg:w-7/12 xl:w-9/12 pl-5">
                        <p className="font-bold text-2xl text-yellow-600 mb-4">{nombre}</p>
                        <p className="text-gray-600 mb-4">Categoría: {''}
                            <span className="text-gray-700 font-bold">{categoria.toUpperCase()}</span>
                        </p>
                        <p className="text-gray-600 mb-4">Descripcion: {''}
                            <span className="text-gray-700 font-bold">{formatearPrecio(descripcion)}</span>
                        </p>
                        <p className="text-gray-600 mb-4">Precio: {''}
                            <span className="text-gray-700 font-bold">{formatearPrecio(precio)}</span>
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <Link to={`/editar-platillo/${id}`} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow">
                                Editar Platillo
                            </Link>
                            <button 
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow"
                                onClick={eliminarPlatillo}
                            >
                                Eliminar Platillo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Platillo;
