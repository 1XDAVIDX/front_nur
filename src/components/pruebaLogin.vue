<script>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';


import * as jwt_decode from 'jwt-decode';
//import jwt_decode from 'jwt-decode';

export default {
    setup() {

        function crearCuenta() {
            router.push({name:"registroUsuario"})
        }

        const login = ref({
            id_usuario: "",
            contraseña: "",
        });

        //const message = ref('');
        const mirar = ref({});

        const insertarlogin = async () => {
            try {
                // Realiza la solicitud POST
                const respuesta = await axios.post('http://127.0.0.1:8000/login', login.value);
                
                // Guarda el token en LocalStorage
                const token = respuesta.data.access_token;
                localStorage.setItem('access_token', token);
                console.log(localStorage.getItem('access_token') )

                // Decodifica el token para obtener el rol
                
                const decodedToken = jwt_decode.jwtDecode(token);  // Usando la importación nombrada

                mirar.value = decodedToken.rol; 
                console.log(decodedToken) 
                
                

                // Guarda los datos del token en LocalStorage
                localStorage.setItem('access_token', JSON.stringify(decodedToken));
                const decodificado = JSON.parse(localStorage.getItem('access_token'))
                console.log("valores:", decodificado )


                // Muestra una alerta de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Inicio de sesión exitoso',
                    text: 'Bienvenido a tu cuenta'
                });

                // Redirige al usuario según su rol
                if (mirar.value === "admin") {
                    router.replace({name: "admin"});
                } else if (mirar.value === "cliente") {
                    router.replace({name: "cliente"});
                }

            } catch (error) {
                console.error("Error al registrar datos", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de inicio de sesión',
                    text: 'Usuario No Existe'
                });
            }
        };

        const router = useRouter();

        return {
            login,
            insertarlogin,
            router,
            crearCuenta
        };
    }
};
</script>

<template>
    <form @submit.prevent="insertarlogin" class="formulario">
        <div id="tituloheader">
        <h1 id="titulo">INICIO SESIÓN</h1>
        <button type="button" @click="()=>router.go(-1)"  id="x">X</button>
        </div>
        <label class="respuesta">ID usuario:
            <input v-model="login.id_usuario" type="text" required>
        </label>
        
        <label class="respuesta">Contraseña:
            <input v-model="login.contraseña" type="password" required>
        </label>
        
        <button type="submit" class="boton">Registrar</button>
        <button @click="crearCuenta"  class="boton">No estoy registrado</button>
    </form>
    
</template>

<style>
#x {
    background: none; 
    border: none; 
    font-size: 20px; 
    color: #ff5555; 
    cursor: pointer; 
}

.formulario {
    position: fixed; 
    top: 10%; 
    width: 20%;
    left: 50%; 
    transform: translateX(-50%); 
    background-color: white;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    z-index: 1000; 
}

.respuesta{
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    width: 100%;
}
.boton{
    margin-top: 30px;
    display: block;
    width: 100%; 
    box-sizing: border-box;
}
#tituloheader{
    display: flex;
}

#x{
    background-image: url('./img/x.png');
    background-size: contain;
    margin-left: auto;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
.mensaje{
    text-align: center;
    margin-top: 20px;
    background-color: seagreen;
    color:  white;
    width: 20%;
    margin-left: auto;
    margin-right: auto;
}

</style>
