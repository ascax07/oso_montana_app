/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react"
import appFirebase from "../credenciales"
import { getAuth,signOut } from "firebase/auth"
const auth =getAuth(appFirebase)

const Home = ({ CorreoUsuario }) => {
  return (
    <div>
      <h2 className="text-center">Bienvendio  Usuario{CorreoUsuario} <button className="btn btn-danger" onClick={()=>signOut(auth)}>
        cerrar sesión</button> </h2>
    </div>

  )
}

export default Home
