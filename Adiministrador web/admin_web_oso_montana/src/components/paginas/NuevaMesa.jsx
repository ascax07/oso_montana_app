import React, { useState, useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { FirebaseContext } from '../../firebase';

const NuevaMesa = () => {
    const [errorGlobal, setErrorGlobal] = useState('');
    const navigate = useNavigate();
    const { firebase } = useContext(FirebaseContext);

    const formik = useFormik({
        initialValues: {
            numero: '',
            capacidad: '',
            ubicacion: ''
        },
        validationSchema: Yup.object({
            numero: Yup.string().required('El número de mesa es obligatorio.'),
            capacidad: Yup.number()
                .min(1, 'La capacidad debe ser al menos 1.')
                .required('La capacidad es obligatoria.'),
            ubicacion: Yup.string().required('La ubicación de la mesa es obligatoria.'),
        }),
        onSubmit: async (mesa) => {
            try {
                await addDoc(collection(firebase.db, 'mesas'), mesa);
                alert('Mesa agregada con éxito.');
                navigate('/mesas');
            } catch (error) {
                console.error(error);
                setErrorGlobal('Hubo un error al agregar la mesa.');
            }
        }
    });

    return (
        <>
            <h1 className="text-3xl font-light mb-4">Agregar Mesa</h1>
            <div className="flex justify-center mt-10">
                <div className="w-full max-w-3xl">
                    {errorGlobal && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" aria-live="assertive">
                            <p className="font-bold">Hubo un error:</p>
                            <p>{errorGlobal}</p>
                        </div>
                    )}
                    <form onSubmit={formik.handleSubmit}>
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
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" aria-live="assertive">
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
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" aria-live="assertive">
                                    <p className="font-bold">Hubo un error:</p>
                                    <p>{formik.errors.capacidad}</p>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ubicacion">
                                Ubicación de Mesa
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="ubicacion"
                                type="text"
                                {...formik.getFieldProps('ubicacion')}
                            />
                            {formik.touched.ubicacion && formik.errors.ubicacion && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5" aria-live="assertive">
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
                                Agregar Mesa
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

export default NuevaMesa;
