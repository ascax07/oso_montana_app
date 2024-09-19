import React, { useContext, useState } from 'react';
import { FirebaseContext } from '../../firebase';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import 'primereact/resources/themes/saga-blue/theme.css';  // Tema de PrimeReact
import 'primereact/resources/primereact.min.css';            // Estilos de PrimeReact
import 'primeicons/primeicons.css';                          // Iconos de PrimeReact

const Mesa = ({ mesa }) => {
  const { id, numero, capacidad, disponible, ubicacion } = mesa;
  
  // Estado para manejar el valor de disponibilidad
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

  const disponibilidadBodyTemplate = (data) => (
    <select
      className="bg-white shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
      value={data.disponible}
      onChange={(e) => actualizarDisponibilidad(e)}
    >
      <option value={true}>Sí</option>
      <option value={false}>No</option>
    </select>
  );

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <span className="text-xl text-900 font-bold">Detalles de la Mesa</span>
    </div>
  );

  return (
    <div className="w-full px-3 mb-4">
      <div className="p-5 shadow-md bg-white rounded-lg">
        <DataTable value={[mesa]} header={header} tableStyle={{ minWidth: '60rem' }}>
          <Column header="Número" body={(data) => data.numero}></Column>
          <Column header="Capacidad" body={(data) => data.capacidad}></Column>
          <Column header="Ubicación" body={(data) => data.ubicacion}></Column>
          <Column header="Disponibilidad" body={disponibilidadBodyTemplate}></Column>
          <Column
            header="Acciones"
            body={(data) => (
              <div className="flex space-x-2">
                <Link
                  to={`/editar-mesa/${data.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-lg"
                >
                  Editar Mesa
                </Link>
                <Button
                  icon="pi pi-trash"
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow-lg"
                  onClick={eliminarMesa}
                >
                  Eliminar Mesa
                </Button>
              </div>
            )}
          ></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default Mesa;
