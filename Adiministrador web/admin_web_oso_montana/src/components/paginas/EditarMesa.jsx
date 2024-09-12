import React, { useState, useEffect, useContext } from 'react';  // Agregué useContext
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FirebaseContext } from '../../firebase';

const EditarMesa = () => {
    const [mesa, setMesa] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const { firebase } = useContext(FirebaseContext);  // useContext ahora está importado correctamente

    useEffect(() => {
        const obtenerMesa = async () => {
            const docRef = doc(firebase.db, 'mesas', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setMesa(docSnap.data());
            } else {
                console.log('No existe el documento');
            }
        };
        obtenerMesa();
    }, [id]);

    const formik = useFormik({
        initialValues: mesa || {
            numero: '',
            capacidad: '',
            ubicacion: ''
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            numero: Yup.string().required('El número de mesa es obligatorio.'),
            capacidad: Yup.number()
                .min(1, 'La capacidad debe ser al menos 1.')
                .max(100, 'La capacidad no puede exceder de 100.')
                .required('La capacidad es obligatoria.'),
                ubicacion: Yup.string().required('La ubicación  de la  mesa es obligatorio.'),


        }),
        onSubmit: async (mesaActualizada) => {
            try {
                await updateDoc(doc(firebase.db, 'mesas', id), mesaActualizada);
                alert('Mesa actualizada con éxito.');
                navigate('/mesas');
            } catch (error) {
                console.error(error);
            }
        }
    });

    return (
        <>
            <h1 className="text-3xl font-light mb-4">Editar Mesa</h1>
            <div className="flex justify-center mt-10">
                <div className="w-full max-w-3xl">
                    <form onSubmit={formik.handleSubmit}>
                        {/* Campos del formulario */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numero">
                                Número de Mesa
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="numero"
                                type="number"
                                {...formik.getFieldProps('numero')}
                            />
                            {formik.touched.numero && formik.errors.numero && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
                                    <p className="font-bold">Hubo un error:</p>
                                    <p>{formik.errors.numero}</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacidad">
                                Capacidad
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="capacidad"
                                type="number"
                                {...formik.getFieldProps('capacidad')}
                            />
                            {formik.touched.capacidad && formik.errors.capacidad && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
                                    <p className="font-bold">Hubo un error:</p>
                                    <p>{formik.errors.capacidad}</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ubicacion">
                                Ubicación  de Mesa
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="ubicacion"
                                type="text"
                                {...formik.getFieldProps('ubicacion')}
                            />
                            {formik.touched.ubicacion && formik.errors.ubicacion && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
                                    <p className="font-bold">Hubo un error:</p>
                                    <p>{formik.errors.ubicacion}</p>
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
                                onClick={() => navigate('/mesas')}
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
}

export default EditarMesa;
