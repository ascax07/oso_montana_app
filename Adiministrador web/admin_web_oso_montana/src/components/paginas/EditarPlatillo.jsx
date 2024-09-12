/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const MAX_FILE_SIZE_MB = 2; // Tamaño máximo del archivo en MB

const EditarPlatillo = () => {
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [urlimagen, setUrlimagen] = useState('');
  const [errorGlobal, setErrorGlobal] = useState('');
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID del platillo a editar

  // Configuración del formulario usando Formik
  const formik = useFormik({
    initialValues: {
      nombre: '',
      precio: '',
      categoria: '',
      descripcion: '',
      imagen: ''
    },
    validationSchema: Yup.object({
      nombre: Yup.string().min(3, 'Los platillos deben tener al menos 3 caracteres.').required('El nombre del platillo es obligatorio.'),
      precio: Yup.number().min(1, 'Debes agregar un número.').required('El precio es obligatorio.'),
      categoria: Yup.string().required('La categoría es obligatoria.'),
      descripcion: Yup.string().min(10, 'La descripción debe ser más larga.').required('La descripción es obligatoria.'),
      imagen: Yup.string().required('La imagen es obligatoria.')
    }),
    onSubmit: async (platillo) => {
      if (!urlimagen) {
        setErrorGlobal('Hubo un error: no has seleccionado ninguna imagen.');
        return;
      }
    
      const confirmUpdate = window.confirm('¿Estás seguro de que quieres actualizar este platillo?');
    
      if (confirmUpdate) {
        try {
          platillo.imagen = urlimagen;
          await updateDoc(doc(db, 'productos', id), platillo);
          window.alert('Platillo actualizado con éxito.');
          navigate('/menu');
        } catch (error) {
          console.error(error);
          window.alert('Hubo un error al actualizar el platillo.');
        }
      }
    }
    
  });

  // Función para cargar el platillo al iniciar el componente
  useEffect(() => {
    const fetchPlatillo = async () => {
      try {
        const docRef = doc(db, 'productos', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          formik.setValues(data);
          setUrlimagen(data.imagen);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };
    fetchPlatillo();
  }, [id]);

  const handleUploadStart = () => {
    setSubiendo(true);
    setProgreso(0);
  };

  const handleUploadError = (error) => {
    setSubiendo(false);
    console.error(error);
  };

  const handleUploadSuccess = async (filename) => {
    try {
      const url = await getDownloadURL(ref(storage, `productos/${filename}`));
      setUrlimagen(url);
      setSubiendo(false);
      formik.setFieldValue('imagen', url);
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
        alert('La imagen debe ser menor de 2MB.');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Solo se permiten archivos JPG o PNG.');
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

  return (
    <>
      <h1 className="text-3xl font-light mb-4">Editar Platillo</h1>
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-3xl">
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                Nombre
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="nombre"
                type="text"
                {...formik.getFieldProps('nombre')}
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" role="alert">
                  <p className="font-bold">Hubo un error:</p>
                  <p>{formik.errors.nombre}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="precio">
                Precio
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="precio"
                type="number"
                {...formik.getFieldProps('precio')}
              />
              {formik.touched.precio && formik.errors.precio && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" role="alert">
                  <p className="font-bold">Hubo un error:</p>
                  <p>{formik.errors.precio}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoria">Categoría</label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="categoria"
                {...formik.getFieldProps('categoria')}
              >
                <option value="">-- Seleccione --</option>
                <option value="desayuno">Desayuno</option>
                <option value="comida">Comida</option>
                <option value="cena">Cena</option>
                <option value="postre">Postre</option>
                <option value="bebida">Bebida</option>
              </select>
              {formik.touched.categoria && formik.errors.categoria && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" role="alert">
                  <p className="font-bold">Hubo un error:</p>
                  <p>{formik.errors.categoria}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="descripcion"
                rows="4"
                {...formik.getFieldProps('descripcion')}
              />
              {formik.touched.descripcion && formik.errors.descripcion && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" role="alert">
                  <p className="font-bold">Hubo un error:</p>
                  <p>{formik.errors.descripcion}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imagen">
                Imagen
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="imagen"
                type="file"
                accept="image/jpeg, image/png"
                onChange={(event) => {
                  formik.setFieldValue('imagen', event.currentTarget.files[0]);
                  handleFileUpload(event); // Llama a la función de subida cuando se selecciona un archivo
                }}
              />
              {subiendo && (
                <div className="loader-container mt-2">
                  <div className="loader"></div>
                </div>
              )}
              {/* Muestra la imagen subida y establece su tamaño */}
              {urlimagen && (
                <div className="mt-2">
                  <img
                    src={urlimagen}
                    alt="Imagen subida"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </div>
              )}
              {formik.touched.imagen && formik.errors.imagen && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" role="alert">
                  <p className="font-bold">Hubo un error:</p>
                  <p>{formik.errors.imagen}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditarPlatillo;
