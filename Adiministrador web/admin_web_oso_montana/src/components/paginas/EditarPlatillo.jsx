import React, { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XIcon, ClipboardListIcon } from 'lucide-react';

const MAX_FILE_SIZE_MB = 2;

const EditarPlatillo = () => {
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [urlimagen, setUrlimagen] = useState('');
  const [errorGlobal, setErrorGlobal] = useState('');
  const toast = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();


  const [stockVisible, setStockVisible] = useState(false); // Estado para manejar la visibilidad del stock

  const handleUploadStart = () => {
    setSubiendo(true);
    setProgreso(0);
  };

  const handleUploadError = (error) => {
    setSubiendo(false);
    console.error(error);
    toast.current.show({
      severity: 'error',
      summary: 'Error',
      detail: 'Hubo un problema al subir la imagen.',
      life: 3000
    });
  };

  const handleUploadSuccess = async (filename) => {
    try {
      const url = await getDownloadURL(ref(storage, `productos/${filename}`));
      setUrlimagen(url);
      setSubiendo(false);
      formik.setFieldValue('imagen', url);
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Imagen subida correctamente.',
        life: 3000
      });
    } catch (error) {
      handleUploadError(error);
    }
  };

  const handleProgress = (progress) => {
    setProgreso(progress);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.current.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'La imagen debe ser menor de 2MB.',
          life: 3000
        });
        return;
      }

      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.current.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Solo se permiten archivos JPG o PNG.',
          life: 3000
        });
        return;
      }

      const storageRef = ref(storage, `productos/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      handleUploadStart();

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          handleProgress(progress);
        },
        (error) => {
          handleUploadError(error);
        },
        () => {
          handleUploadSuccess(file.name);
        }
      );
    }
  };

  const handleRemoveImage = () => {
    setUrlimagen('');
    formik.setFieldValue('imagen', '');
  };

  const formik = useFormik({
    initialValues: {
      nombre: '',
      precio: '',
      categoria: '',
      descripcion: '',
      imagen: ''
    },
    validationSchema: Yup.object({
      nombre: Yup.string().min(3, 'El nombre debe tener al menos 3 caracteres.').required('El nombre del platillo es obligatorio.'),
      precio: Yup.number().min(1, 'El precio debe ser mayor a 0.').required('El precio es obligatorio.'),
      categoria: Yup.string().required('La categoría es obligatoria.'),
      descripcion: Yup.string().min(10, 'La descripción debe tener al menos 10 caracteres.').required('La descripción es obligatoria.'),
      imagen: Yup.string().required('La imagen es obligatoria.')
    }),
    onSubmit: async (platillo) => {
      if (!urlimagen) {
        setErrorGlobal('Hubo un error: no has seleccionado ninguna imagen.');
        return;
      }

      confirmDialog({
        message: '¿Estás seguro de que quieres actualizar este platillo?',
        header: 'Confirmación',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          try {
            platillo.imagen = urlimagen;
            await updateDoc(doc(db, 'productos', id), platillo);
            toast.current.show({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Platillo actualizado correctamente.',
              life: 3000
            });
            setTimeout(() => {
              navigate('/menu');
            }, 3000);
          } catch (error) {
            console.error(error);
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Hubo un error al actualizar el platillo.',
              life: 3000
            });
          }
        },
        reject: () => {
          toast.current.show({
            severity: 'info',
            summary: 'Cancelado',
            detail: 'Has cancelado la actualización del platillo.',
            life: 3000
          });
        }
      });
    }
  });

  useEffect(() => {
    const fetchPlatillo = async () => {
      try {
        const docRef = doc(db, 'productos', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          formik.setValues(data);
          setUrlimagen(data.imagen);
          
          // Verificar si el platillo tiene el campo 'stock'
          if (data.stock !== undefined) {
            setStockVisible(true); // Muestra el input de stock
          }
        } else {
          console.log('No such document!');
          toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: 'No se encontró el platillo.',
            life: 3000
          });
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el platillo.',
          life: 3000
        });
      }
    };
    fetchPlatillo();
  }, [id]);

  useEffect(() => {
    if (errorGlobal) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: errorGlobal,
        life: 3000
      });
    }
  }, [errorGlobal]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 py-12 px-4 sm:px-6 lg:px-8"
    >
      <Toast ref={toast} />
      <ConfirmDialog />
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden"
      >
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Editar Platillo</h2>
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            <AnimatePresence>
              {/* Nombre del platillo */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del platillo
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="nombre"
                    id="nombre"
                    {...formik.getFieldProps('nombre')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                    placeholder="Ej. Café Latte"
                  />
                </div>
                {formik.touched.nombre && formik.errors.nombre ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {formik.errors.nombre}
                  </motion.p>
                ) : null}
              </motion.div>

             {/* Input de Stock */}
             {stockVisible && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
              >
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                    name="stock"
                    min="0"
                    {...formik.getFieldProps('stock')} // Asegúrate de incluir esto para gestionar el estado de Formik
                  />
                </div>
              </motion.div>
            )}

              {/* Precio */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
              >
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                  Precio
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="precio"
                    id="precio"
                    {...formik.getFieldProps('precio')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                    placeholder="0.000"
                    aria-describedby="price-currency"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm" id="price-currency">
                      COP
                    </span>
                  </div>
                </div>
                {formik.touched.precio && formik.errors.precio ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {formik.errors.precio}
                  </motion.p>
                ) : null}
              </motion.div>

              {/* Categoría */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              >
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  {...formik.getFieldProps('categoria')}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="cafe_caliente">cafe caliente</option>
                  <option value="cafe_frio">cafe frio</option>
                  <option value="helados">helados</option>
                  <option value="bebida">Bebida</option>
                  <option value="postre">Postre</option>
                  <option value="merienda">merienda</option>
                </select>
                {formik.touched.categoria && formik.errors.categoria ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {formik.errors.categoria}
                  </motion.p>
                ) : null}
              </motion.div>

              {/* Descripción */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              >
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <div className="mt-1">
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    rows={3}
                    {...formik.getFieldProps('descripcion')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                    placeholder="Describe el platillo..."
                  />
                </div>
                {formik.touched.descripcion && formik.errors.descripcion ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {formik.errors.descripcion}
                  </motion.p>
                ) : null}
              </motion.div>

              {/* Imagen */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700">Imagen del platillo</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {!urlimagen ? (
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="imagen"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                        >
                          <span>Sube una imagen</span>
                          <input
                            id="imagen"
                            name="imagen"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG hasta 2MB</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <img
                        src={urlimagen}
                        alt="Vista previa"
                        className="mx-auto h-32 w-auto object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  )}
                </div>
                {subiendo && (
                  <motion.div
                    className="mt-2 h-2 bg-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                {formik.touched.imagen && formik.errors.imagen && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {formik.errors.imagen}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Botones de acción */}
            <motion.div
              className="pt-5"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigate('/menu')}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Guardar Cambios
                </motion.button>
              </div>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditarPlatillo;