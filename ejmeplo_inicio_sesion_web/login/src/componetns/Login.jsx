/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import Imagen from "../assets/cafe.jpg";
import ImagenProfile from "../assets/Oso-de-la-montaña.png"
import appFirebase from '../credenciales.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth(appFirebase);

const Login = () => {
    const [registrando, setRegistrando] = useState(false);

    const functAutenticacion = async (e) => {
        e.preventDefault();
        const correo = e.target.correo.value;
        const contraseña = e.target.password.value;

        if (registrando) {
            try {
                await createUserWithEmailAndPassword(auth, correo, contraseña);

            } catch (error) {
                alert("Asegurese que la contraseña tenga mas de 8 caracteres ")

            }
        

        } else {
            try {
                await signInWithEmailAndPassword(auth, correo, contraseña);
            } catch (error) {
                alert("El correo o la constraseña son incorrectos ")

            }
        }


    }


    return (
        <div className="container-fluid">
            <div className="row">
                {/* Columna del formulario */}
                <div className="">
                    <div className="Padre">
                        <div className="card card-body shadow-lg">
                            <img src= {ImagenProfile} alt="" className="estilo-profile"/>
                            <form onSubmit={functAutenticacion}>
                                <input type="text" placeholder="Ingresar Correo" className="cajatexto" id="correo" />
                                <input type="password" placeholder="Ingresar la Contraseña" className="cajatexto" id="password" />
                                <button className="btnform">{registrando ? "Regístrate" : "Inicia Sesión"}</button>
                            </form>
                            <h4 className="texto">
                                {registrando ? "Si ya tienes cuenta " : "No tienes cuenta "}
                                <button className="btnswicth" onClick={() => setRegistrando(!registrando)}>
                                    {registrando ? "Inicia sesión" : "Regístrate"}
                                </button>
                            </h4>
                        </div>
                    </div>
                </div>
                {/* Columna de la imagen
                <div className="col-md-4 d-flex justify-content-center align-items-center">
                    <img src={Imagen} alt="Oso de la montaña" className="tamaño-imagen img-fluid" />
                </div> */}
            </div>
        </div>
    );
};

export default Login;
