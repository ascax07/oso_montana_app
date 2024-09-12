import React, { useContext, useState } from 'react';
import { FirebaseContext } from '../../firebase';
import { Link } from 'react-router-dom';

const Mesa = ({ mesa }) => {
  const { id, numero, capacidad, disponible, ubicacion } = mesa;
  
  // Cambia useRef por useState para manejar el valor de disponibilidad
  const [disponibilidad, setDisponibilidad] = useState(disponible);

  const { firebase } = useContext(FirebaseContext);

  const actualizarDisponibilidad = async (event) => {
    const nuevaDisponibilidad = event.target.value === 'true';
    setDisponibilidad(nuevaDisponibilidad);
    try {
      await firebase.db.collection('mesas').doc(id).update({
        disponible: nuevaDisponibilidad,
      });
    } catch (error) {
      console.log('Error actualizando la disponibilidad:', error);
    }
  };

  const eliminarMesa = async () => {
    const confirmar = window.confirm(`¿Estás seguro que deseas eliminar la mesa ${numero}?`);
    if (confirmar) {
      try {
        await firebase.db.collection('mesas').doc(id).delete();
        alert('Mesa eliminada con éxito');
      } catch (error) {
        console.error('Error eliminando la mesa:', error);
        alert('Hubo un error al eliminar la mesa');
      }
    }
  };

  return (
    <div className="w-full px-3 mb-4">
      <div className="p-5 shadow-md bg-white">
        <div className="lg:flex">
          <div className="lg:w-7/12 xl:w-9/12 pl-5">
            <div className="font-bold text-2xl text-yellow-600 mb-4">Mesa {numero}</div>
            <div className="text-gray-600 mb-4">
              Capacidad: <span className="text-gray-700 font-bold">{capacidad}</span>
            </div>
            <div className="text-gray-600 mb-4">
              Ubicación: <span className="text-gray-700 font-bold">{ubicacion}</span>
            </div>
            <div className="text-gray-600 mb-4">
              Disponible:
              <span className="text-gray-700 font-bold">
                <select
                  className="bg-white shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  value={disponibilidad}
                  onChange={actualizarDisponibilidad}
                >
                  <option value={true}>Sí</option>
                  <option value={false}>No</option>
                </select>
              </span>
            </div>
            <div className="flex space-x-4 mt-6">
              <Link to={`/editar-mesa/${id}`} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow">
                Editar Mesa
              </Link>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow"
                onClick={eliminarMesa}
              >
                Eliminar Mesa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mesa;
