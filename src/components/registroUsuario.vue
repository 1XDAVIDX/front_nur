<script>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';

export default {
    setup() {
        const usuario = ref({
            id_usuario: "",
            nombre: "",
            contraseña: "",
            rol: ""
        });

        const showPassword = ref(false); // Para alternar visibilidad
        const message = ref('');

        const validarContraseña = (contraseña) => {
            // Mínimo 8 caracteres, al menos una letra, un número y un carácter especial
            const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;
            return regex.test(contraseña);
        };

        const insertarUsuario = async () => {
            if (!validarContraseña(usuario.value.contraseña)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Contraseña inválida',
                    text: 'Debe tener al menos 8 caracteres, incluyendo letras, números y un carácter especial.'
                });
                return;
            }

            try {
                const respuesta = await axios.post('http://127.0.0.1:8000/insertar/usuario', usuario.value);
                message.value = Swal.fire({
                    icon: 'success',
                    title: 'Inicio de sesión exitoso',
                    text: 'Bienvenido a tu cuenta'
                });
            } catch (error) {
                console.error("Error al registrar datos", error);
                message.value = Swal.fire({
                    icon: 'error',
                    title: 'Error de inicio de sesión',
                    text: 'Usuario ya registrado'
                });
            }
        };

        const router = useRouter();

        return {
            usuario,
            insertarUsuario,
            router,
            showPassword
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
        
        <label class="respuesta">Nombre:
            <input v-model="usuario.nombre" type="text" required>
        </label>
        <label class="respuesta">Correo:
            <input v-model="usuario.id_usuario" type="email" required>
        </label>
        <label class="respuesta">Contraseña:
            <div style="display: flex; align-items: center;">
                <input 
                    :type="showPassword ? 'text' : 'password'" 
                    v-model="usuario.contraseña" 
                    required 
                    style="flex: 1;"
                >
                <button 
                    type="button" 
                    @click="showPassword = !showPassword" 
                    style="margin-left: 5px; padding: 5px;"
                >
                    {{ showPassword ? 'Ocultar' : 'Mostrar' }}
                </button>
            </div>
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