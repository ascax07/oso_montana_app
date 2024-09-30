import React, { useContext, useState, useRef } from 'react';
import { FirebaseContext } from '../../firebase';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Edit2, Trash2 } from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const Mesa = ({ mesa }) => {
  const { id, numero, capacidad, disponible, ubicacion } = mesa;
  const [disponibilidad, setDisponibilidad] = useState(disponible);
  const { db } = useContext(FirebaseContext);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [mesaAEliminar, setMesaAEliminar] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de carga
  const toast = useRef(null);

  const actualizarDisponibilidad = async (event) => {
    const nuevaDisponibilidad = event.target.value === 'true';
    setDisponibilidad(nuevaDisponibilidad);
    try {
      const mesaRef = doc(db, 'mesas', id);
      await updateDoc(mesaRef, {
        disponible: nuevaDisponibilidad,
      });
    } catch (error) {
      console.log('Error actualizando la disponibilidad:', error);
    }
  };

  const confirmarEliminacion = (mesa) => {
    setMesaAEliminar(mesa);
    setDialogVisible(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true); // Activa el estado de carga
    try {
      const mesaRef = doc(db, 'mesas', mesaAEliminar.id);
      await deleteDoc(mesaRef);
      toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Mesa eliminada con éxito', life: 3000 });
    } catch (error) {
      console.error('Error eliminando la mesa:', error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al eliminar la mesa', life: 3000 });
    } finally {
      setDialogVisible(false);
      setMesaAEliminar(null);
      setLoading(false); // Desactiva el estado de carga
    }
  };

  const handleCancelDelete = () => {
    setDialogVisible(false);
    setMesaAEliminar(null);
  };

  return (
    <div className="flex space-x-2">
      <Toast ref={toast} />
      <ConfirmDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        message={`¿Estás seguro que deseas eliminar la mesa ${mesaAEliminar?.numero}?`}
        header="Confirmar Eliminación"
        icon="pi pi-exclamation-triangle"
        footer={
          <div className="flex justify-between">
            <Button
              label="Cancelar"
              className="bg-gray-300 hover:bg-gray-400 text-black rounded px-4 py-2 mr-2"
              onClick={handleCancelDelete}
              disabled={loading} // Deshabilitar el botón de cancelar si está en carga
            />
            <Button
              label="Eliminar"
              className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2"
              onClick={handleConfirmDelete}
              disabled={loading} // Deshabilitar el botón de eliminar si está en carga
            />
          </div>
        }
      />
      <Link
        to={`/editar-mesa/${id}`}
        className="bg-[#304b85] hover:bg-[#275f6d] text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300"
      >
        <Edit2 size={18} className="mr-2" />
        Editar
      </Link>
      <Button
        icon={<Trash2 size={18} className="mr-2" />}
        label="Eliminar"
        className="bg-[#853030] hover:bg-[#6d2727] text-white py-2 px-4 rounded-full shadow-lg flex items-center justify-center transition-colors duration-300"
        onClick={() => confirmarEliminacion(mesa)}
        disabled={loading} // Deshabilitar el botón de eliminar si está en carga
      />
    </div>
  );
};

export default Mesa;
