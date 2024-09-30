'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { motion, AnimatePresence } from 'framer-motion';

const EditarMesa = () => {
    const [errorGlobal, setErrorGlobal] = useState('');
    const toast = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams();

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
                .max(100, 'La capacidad no puede exceder de 100.')
                .required('La capacidad es obligatoria.'),
            ubicacion: Yup.string().required('La ubicación de la mesa es obligatoria.'),
        }),
        onSubmit: async (mesaActualizada) => {
            confirmDialog({
                message: '¿Estás seguro de que quieres actualizar esta mesa?',
                header: 'Confirmación',
                icon: 'pi pi-exclamation-triangle',
                accept: async () => {
                    try {
                        await updateDoc(doc(db, 'mesas', id), mesaActualizada);
                        toast.current.show({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Mesa actualizada correctamente.',
                            life: 3000
                        });
                        setTimeout(() => {
                            navigate('/mesas');
                        }, 3000);
                    } catch (error) {
                        console.error(error);
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Hubo un error al actualizar la mesa.',
                            life: 3000
                        });
                    }
                },
                reject: () => {
                    toast.current.show({
                        severity: 'info',
                        summary: 'Cancelado',
                        detail: 'Has cancelado la actualización de la mesa.',
                        life: 3000
                    });
                }
            });
        }
    });

    useEffect(() => {
        const fetchMesa = async () => {
            try {
                const docRef = doc(db, 'mesas', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    formik.setValues(data);
                } else {
                    console.log('No such document!');
                    toast.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se encontró la mesa.',
                        life: 3000
                    });
                }
            } catch (error) {
                console.error('Error fetching document:', error);
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar la mesa.',
                    life: 3000
                });
            }
        };
        fetchMesa();
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
                    <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Editar Mesa</h2>
                    <form onSubmit={formik.handleSubmit} className="space-y-8">
                        <AnimatePresence>
                            {/* Número de Mesa */}
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                            >
                                <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
                                    Número de Mesa
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="numero"
                                        id="numero"
                                        {...formik.getFieldProps('numero')}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                                        placeholder="Ej. Mesa 1"
                                    />
                                </div>
                                {formik.touched.numero && formik.errors.numero ? (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-2 text-sm text-red-600"
                                    >
                                        {formik.errors.numero}
                                    </motion.p>
                                ) : null}
                            </motion.div>

                            {/* Capacidad */}
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                            >
                                <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700">
                                    Capacidad
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="number"
                                        name="capacidad"
                                        id="capacidad"
                                        {...formik.getFieldProps('capacidad')}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                                        placeholder="Ej. 4"
                                    />
                                </div>
                                {formik.touched.capacidad && formik.errors.capacidad ? (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-2 text-sm text-red-600"
                                    >
                                        {formik.errors.capacidad}
                                    </motion.p>
                                ) : null}
                            </motion.div>

                            {/* Ubicación */}
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                            >
                                <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">
                                    Ubicación
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="ubicacion"
                                        id="ubicacion"
                                        {...formik.getFieldProps('ubicacion')}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 sm:text-sm"
                                        placeholder="Ej. Terraza"
                                    />
                                </div>
                                {formik.touched.ubicacion && formik.errors.ubicacion ? (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-2 text-sm text-red-600"
                                    >
                                        {formik.errors.ubicacion}
                                    </motion.p>
                                ) : null}
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
                                    onClick={() => navigate('/mesas')}
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
}

export default EditarMesa;