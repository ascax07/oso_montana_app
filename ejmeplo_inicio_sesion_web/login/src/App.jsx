/* eslint-disable no-unused-vars */
import { useState } from 'react'
// Importando los modulos de firebase 
import appFirebase from '../src/credenciales'
import { getAuth,onAuthStateChanged } from 'firebase/auth'
const auth =getAuth(appFirebase)

// importar nuestros componenetes   
import Login from '../src/componetns/Login'
import Home from '../src/componetns/Home'



import './App.css'

function App() {
  const[usuario,setUsuario] =useState(null)

  onAuthStateChanged(auth,(usuarioFirebase)=>{
    if(usuarioFirebase){
      setUsuario(usuarioFirebase)
    }
    else
    {
      setUsuario(null)
    }
  })
 

  return (
    <div>
      {usuario ? <Home CorreoUsuario = {usuario.email}/> : <Login/>}
 
    </div>
   
  )
}

export default App
