import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../../firebase/config';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const MAX_FILE_SIZE_MB = 2; // Tamaño máximo del archivo en MB

const NuevoPlatillo = () => {
  // Estados para manejar el proceso de subida de la imagen
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [urlimagen, setUrlimagen] = useState(''); // URL de la imagen subida
  const [errorGlobal, setErrorGlobal] = useState('');
  const navigate = useNavigate();

  // Maneja el inicio de la subida de la imagen
  const handleUploadStart = () => {
    setSubiendo(true);
    setProgreso(0);
  };

  // Maneja errores durante la subida
  const handleUploadError = (error) => {
    setSubiendo(false);
    console.error(error);
  };

  // Maneja el éxito de la subida y obtiene la URL de la imagen
  const handleUploadSuccess = async (filename) => {
    try {
      const url = await getDownloadURL(ref(storage, `productos/${filename}`));
      setUrlimagen(url); // Almacena la URL de la imagen subida
      setSubiendo(false);
      formik.setFieldValue('imagen', url); // Actualiza el campo 'imagen' en el formulario
    } catch (error) {
      handleUploadError(error);
    }
  };

  // Maneja el progreso de la subida de la imagen
  const handleProgress = (progress) => {
    setProgreso(progress);
  };

  // Maneja la subida del archivo seleccionado
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validación del tamaño del archivo
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert('La imagen debe ser menor de 2MB.');
        return;
      }

      // Validación del tipo de archivo
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

  // Configuración del formulario usando Formik
  const formik = useFormik({
    initialValues: {
      nombre: '',
      precio: '',
      categoria: '',
      descripcion: '',
      imagen: '' // Campo para la URL de la imagen
    },
    validationSchema: Yup.object({
      nombre: Yup.string().min(3, 'Los platillos deben tener al menos 3 caracteres.').required('El nombre del platillo es obligatorio.'),
      precio: Yup.number().min(1, 'Debes agregar un número.').required('El precio es obligatorio.'),
      categoria: Yup.string().required('La categoría es obligatoria.'),
      descripcion: Yup.string().min(10, 'La descripción debe ser más larga.').required('La descripción es obligatoria.'),
      imagen: Yup.string().required('La imagen es obligatoria.') // Validación para la imagen
    }),
    onSubmit: async (platillo) => {
      if (!urlimagen) {
        setErrorGlobal('Hubo un error: no has seleccionado ninguna imagen.');
        return;
      }
      try {
        platillo.existencia = true;
        platillo.imagen = urlimagen;
        await addDoc(collection(db, 'productos'), platillo);
        navigate('/menu');
      } catch (error) {
        console.error(error);
      }
    }
  });

  return (
    <>
      <h1 className="text-3xl font-light mb-4">Agregar platillos</h1>
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-3xl">
          <form onSubmit={formik.handleSubmit}>
            {/* Campos de formulario */}
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
            <button type="submit" className="btn">
              <span data-text="Agregar Platillo">Agregar Platillo</span>
            </button>
            </div>
          </form>
        </div>
      </div>
      <style jsx>{`
    .loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .loader {
      font-weight: bold;
      font-family: monospace;
      display: inline-grid;
      font-size: 30px;
    }
    .loader:before,
    .loader:after {
      content: "subiendo imagen....";
      grid-area: 1/1;
      -webkit-mask-size: 1.5ch 100%, 100% 100%;
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: l36-1 1s infinite;
    }
    .loader:before {
      -webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
    }
    .loader:after {
      -webkit-mask-image: linear-gradient(#000 0 0);
      animation: l36-1 1s infinite, l36-2 0.2s infinite cubic-bezier(0.5, 200, 0.5, -200);
    }
    @keyframes l36-1 {
      0% {
        -webkit-mask-position: 0 0, 0 0;
      }
      20% {
        -webkit-mask-position: 0.5ch 0, 0 0;
      }
      40% {
        -webkit-mask-position: 100% 0, 0 0;
      }
      60% {
        -webkit-mask-position: 4.5ch 0, 0 0;
      }
      80% {
        -webkit-mask-position: 6.5ch 0, 0 0;
      }
      100% {
        -webkit-mask-position: 2.5ch 0, 0 0;
      }
    }
    @keyframes l36-2 {
      100% {
        transform: translateY(0.2px);
      }
    }
    .notification {
      display: inline-block;
      font-size: 15px;
      padding: 0.7em 2.7em;
      letter-spacing: 0.06em;
      position: relative;
      font-family: inherit;
      border-radius: 0.6em;
      overflow: hidden;
      line-height: 1.4em;
      border: 2px solid #000000;
      background: linear-gradient(to right, rgba(27, 253, 156, 0.1) 1%, transparent 40%, transparent 60%, rgba(27, 253, 156, 0.1) 100%);
      color: #000000;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4), 0 0 9px 3px rgba(0, 0, 0, 0.1);
      animation: notification-animation 2s linear infinite;
    }
    @keyframes notification-animation {
      0% {
        background-position: 0% 50%;
      }
      100% {
        background-position: 100% 50%;
      }
    }
    .btn {
      background: transparent;
      border: 1px solid #141414;
      outline: none;
      padding: 12px 80px;
      height: 50px;
      border-radius: 100px;
      overflow: hidden;
      transform: scaleX(1);
      transition: transform 0.5s cubic-bezier(0.4, 0, 0, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      position: relative;
    }

    .btn:hover {
      animation: animate-scaleX 0.6s cubic-bezier(0.4, 0, 0, 1);
      background: transparent;
    }

    .btn::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      background: black;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0, 1),
        border-radius 0.5s cubic-bezier(0.4, 0, 0, 1);
      width: 100%;
      height: 100%;
      border-radius: 50% 50% 0 0;
      transform: translateY(100%);
    }

    .btn:hover::after {
      transform: translateY(0%);
      border-radius: 0;
    }

    .btn span {
      font-size: 20px;
      font-weight: 500;
      overflow: hidden;
      position: relative;
      color: black;
    }

    .btn span:after {
      width: 100%;
      height: 100%;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0, 1);
      content: attr(data-text);
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      left: 50%;
      bottom: 0;
      z-index: 1;
      transform: translate(-50%, 100%);
      color: white;
    }
    .btn:hover span:after {
      transform: translate(-50%, 0);
    }

    .btn:focus {
      outline: none;
    }

    @keyframes animate-scaleX {
      0% {
        transform: scaleX(1);
      }
      50% {
        transform: scaleX(1.05);
      }
      100% {
        transform: scaleX(1);
      }
    }
  `}</style>
    </>
  );
};

export default NuevoPlatillo;
