<script>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';

export default {
    setup() {
        const usuario = ref({
            id_usuario:"",
            nombre: "",
            email: "",
            contraseña: "",
            rol:""
            
        });
        const message = ref('');

        const insertarUsuario = async () => {
            try {
                const respuesta = await axios.post('http://127.0.0.1:8000/insertar/usuario', usuario.value);
                message.value = respuesta.data.message;
                message.value = Swal.fire({
                    icon:'success',
                    title:'Inicio de sesión exitoso',
                    text:'Bienvenido a tu cuenta'
                    });
            } catch (error) {
                console.error("Error al registrar datos", error);
                message.value = Swal.fire({
                        icon:'error',
                        title:'Error de iniciode sesion',
                        text:'Usuario ya registrado' 

                    });
            }
        };
        const router = useRouter();
        
        return {
            usuario,
            insertarUsuario,
            router
        };
    }
};
</script>

<template>
    <form @submit.prevent="insertarUsuario" class="formulario">
        <div id="tituloheader">
        <h1 id="titulo">INICIO SESIÓN</h1>
        <button type="button" @click="()=>router.go(-1)"  id="x">X</button>
        </div>
        <label class="respuesta">ID usuario:
            <input v-model="usuario.id_usuario" type="text" required>
        </label>
        <label class="respuesta">Nombre:
            <input v-model="usuario.nombre" type="text" required>
        </label>
        <label class="respuesta">Correo:
            <input v-model="usuario.email" type="email" required>
        </label>
        <label class="respuesta">Contraseña:
            <input v-model="usuario.contraseña" type="password" required>
        </label>
        <label class="respuesta">Rol:
            <input v-model="usuario.rol" type="text">
        </label>
        <button type="submit" class="boton">Registrar</button>
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
    top: 20%; 
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