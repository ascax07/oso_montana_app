import React, { useState, useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FirebaseContext } from '../../firebase';
import { motion } from 'framer-motion';
import { Table, Users, MapPin, Plus, X } from 'lucide-react';
import { Toast } from 'primereact/toast';

const NuevaMesa = () => {
    const [errorGlobal, setErrorGlobal] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);  // Para bloquear el botón después de enviar
    const navigate = useNavigate();
    const { db } = useContext(FirebaseContext);  // Extraemos db correctamente
    const toast = React.useRef(null);

    const formik = useFormik({
        initialValues: {
            numero: '',
            capacidad: '',
            ubicacion: 'primer piso'  // Valor predeterminado para la ubicación
        },
        validationSchema: Yup.object({
            numero:  Yup.number() .min(1, 'El precio debe ser mayor a 0.') .max(10, 'El numero de mesas debe ser menor a 10').required('El número de mesa es obligatorio.'),
            capacidad: Yup.number()
                .min(1, 'La capacidad debe ser al menos 1.') .max(4, 'La capacidad debe ser menor a 4')
                .required('La capacidad es obligatoria.'),
            ubicacion: Yup.string().required('La ubicación de la mesa es obligatoria.'),
        }),
        onSubmit: async (mesa) => {
            setErrorGlobal('');
            setIsSubmitting(true);

            try {
                // Verificar si ya existe una mesa con el mismo número en la misma ubicación
                const mesaExistenteQuery = query(
                    collection(db, 'mesas'),
                    where('numero', '==', mesa.numero),
                    where('ubicacion', '==', mesa.ubicacion)
                );
                const mesaExistenteSnapshot = await getDocs(mesaExistenteQuery);

                if (!mesaExistenteSnapshot.empty) {
                    // Si ya existe, mostrar un Toast y no agregar la mesa
                    toast.current.show({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'Ya existe una mesa con ese número en esa ubicación.',
                        life: 3000
                    });
                    setIsSubmitting(false);
                    return;
                }

                // Agregar la nueva mesa si no existe duplicado
                await addDoc(collection(db, 'mesas'), mesa);
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Mesa agregada con éxito.',
                    life: 3000
                });
                setTimeout(() => navigate('/mesas'), 3000);
            } catch (error) {
                console.error(error);
                setErrorGlobal('Hubo un error al agregar la mesa.');
                setIsSubmitting(false);
            }
        }
    });

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8"
        >
            <Toast ref={toast} />
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="max-w-md mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden"
            >
                <div className="px-4 py-5 sm:p-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Agregar Mesa</h1>
                    {errorGlobal && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5 rounded-lg shadow-md" 
                            aria-live="assertive"
                        >
                            <p className="font-bold">Hubo un error:</p>
                            <p>{errorGlobal}</p>
                        </motion.div>
                    )}
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Número de Mesa */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="numero">
                                Número de Mesa
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Table className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                                    id="numero"
                                    type="number"
                                    {...formik.getFieldProps('numero')}
                                />
                            </div>
                            {formik.touched.numero && formik.errors.numero && (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-2 text-sm text-red-600"
                                >
                                    {formik.errors.numero}
                                </motion.p>
                            )}
                        </div>

                        {/* Capacidad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="capacidad">
                                Capacidad
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                                    id="capacidad"
                                    type="number"
                                    {...formik.getFieldProps('capacidad')}
                                />
                            </div>
                            {formik.touched.capacidad && formik.errors.capacidad && (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-2 text-sm text-red-600"
                                >
                                    {formik.errors.capacidad}
                                </motion.p>
                            )}
                        </div>

                        {/* Ubicación */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="ubicacion">
                                Ubicación de Mesa
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                                    id="ubicacion"
                                    {...formik.getFieldProps('ubicacion')}
                                >
                                    <option value="primer piso">Primer piso</option>
                                    <option value="segundo piso">Segundo piso</option>
                                </select>
                            </div>
                            {formik.touched.ubicacion && formik.errors.ubicacion && (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-2 text-sm text-red-600"
                                >
                                    {formik.errors.ubicacion}
                                </motion.p>
                            )}
                        </div>

                        {/* Botones de Agregar y Cancelar */}
                        <div className="flex items-center justify-between space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={isSubmitting}  // Bloquear el botón si está enviando
                                className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                }`}
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                {isSubmitting ? 'Agregando...' : 'Agregar Mesa'}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => navigate('/mesas')}
                                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <X className="mr-2 h-5 w-5" />
                                Cancelar
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default NuevaMesa;
