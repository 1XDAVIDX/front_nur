<script>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';



export default {
    setup() {
        const router = useRouter();
        const cerrarModalUsuario = () => {
            router.push({ name: "login" });
        };
        const comprobarEmail = ref({
            destinatario: "",
            asunto: "Recuperación de contraseña",
            mensaje: "",
        });

        const codigoGenerado = ref("");
        const codigoIngresado = ref(["", "", "", "", "", ""]);


        const generarCodigo = () => {
            return String(Math.floor(100000 + Math.random() * 900000)); 

        };


        const mostrarFormularioContrasena = ref(false);

        const apiEmail = async () => {
            try {
                codigoGenerado.value = generarCodigo();
                comprobarEmail.value.mensaje = `Su código de recuperación es: ${codigoGenerado.value}`;
                const respuesta = await axios.post("http://127.0.0.1:8000/enviar-email", comprobarEmail.value);
                console.log(respuesta.data);
                Swal.fire({
                    icon: "success",
                    title: "Correo enviado",
                    text: `El código de recuperación ha sido enviado a ${comprobarEmail.value.destinatario}`,
                }).then(() => {
                    mostrarFormularioContrasena.value = true; // Mostramos el formulario de contraseña
                });
            } catch (error) {
                console.error("Error al enviar el correo", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo enviar el correo. Intente nuevamente.",
                });                
            }
        };
        const codigoVerificado = ref(false);

        const verificarCodigo = () => {
            const codigoDigitado = codigoIngresado.value.join(""); // Une el array en un string
            if (codigoDigitado === codigoGenerado.value) {
                Swal.fire({
                icon: "success",
                title: "Código correcto",
                text: "Ahora puede ingresar una nueva contraseña",
                });
                codigoVerificado.value = true;
            } else {
                Swal.fire({
                icon: "error",
                title: "Código incorrecto",
                text: "Por favor, verifique el código ingresado.",
                });
            }
        };

        const nuevaContrasena = ref({
            contraseña: "",
        });
        const guardarCambiosUsuario = async () => {
            try {
            const respuesta = await axios.put(`http://127.0.0.1:8000/editar/usuario/${comprobarEmail.value.destinatario}`, nuevaContrasena.value);
            Swal.fire({
            icon: "success",
            title: "Datos Actualizados",
            text: "se recomienda volver a iniciar sesión para ver los cambios", 
            }).then(() => {
            cerrarModalUsuario();
            
            });
            } catch (error) {
            console.error("Error al guardar los cambios usuario", error);
            }
        };

        return {
            comprobarEmail,
            apiEmail,
            nuevaContrasena,
            guardarCambiosUsuario,
            mostrarFormularioContrasena,
            codigoIngresado,
            verificarCodigo,
            codigoVerificado,
        };

    },
};
</script>
<template>
        <!-- Paso 1: Formulario de correo -->
    <div class="container" v-if="!mostrarFormularioContrasena && !codigoVerificado">
        <h1>Recuperación de contraseña</h1>
        <form @submit.prevent="apiEmail" class="formulario">
            <div class="form-group">
                <label for="email" class="form-label">Correo electrónico</label>
                <input type="email" v-model="comprobarEmail.destinatario" class="form-control" id="email" required>
            </div>
            <button type="submit" class="btn">Enviar código</button>
        </form>
    </div>

        <!-- Paso 2: Verificación del código -->
    <div class="container" v-if="mostrarFormularioContrasena && !codigoVerificado">
    <h2>Verificación de código</h2>
    <form @submit.prevent="verificarCodigo" class="formulario">
        <label class="form-label">Ingrese el código recibido por correo</label>
        <div class="code-input-group">
        <input type="text" maxlength="1" class="code-box" v-model="codigoIngresado[0]">
        <input type="text" maxlength="1" class="code-box" v-model="codigoIngresado[1]">
        <input type="text" maxlength="1" class="code-box" v-model="codigoIngresado[2]">
        <input type="text" maxlength="1" class="code-box" v-model="codigoIngresado[3]">
        <input type="text" maxlength="1" class="code-box" v-model="codigoIngresado[4]">
        <input type="text" maxlength="1" class="code-box" v-model="codigoIngresado[5]">
        </div>
        <button type="submit" class="btn">Verificar código</button>
    </form>
    </div>

    <!-- Paso 3: Cambio de contraseña -->
    <div class="container" v-if="codigoVerificado">
        <h2>Actualizar contraseña</h2>
        <form @submit.prevent="guardarCambiosUsuario" class="formulario">
            <div class="form-group">
                <label for="nuevaContrasena" class="form-label">Nueva Contraseña</label>
                <input type="password" v-model="nuevaContrasena.contraseña" class="form-control" id="nuevaContrasena" required>
            </div>
            <button type="submit" class="btn">Actualizar Contraseña</button>
        </form>
    </div>
</template>

<style scoped>
.container {
    background-color: #ffffff;
    width: 100%;
    max-width: 480px;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1, h2 {
    color: #333;
    font-size: 1.8rem;
    margin-bottom: 25px;
    text-align: center;
}

.formulario {
    display: flex;
    flex-direction: column;
    gap: 25px;
    width: 100%;
}

.form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.form-label {
    font-weight: 600;
    color: #444;
    margin-bottom: 10px;
    font-size: 1rem;
    text-align: center;
}

.form-control {
    padding: 12px 15px;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
    width: 100%;
}

.form-control:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15);
}

.btn {
    background-color: #007bff;
    color: #fff;
    padding: 12px;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn:hover {
    background-color: #0056b3;
}

.code-input-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 20px 0;
}

.code-box {
  width: 50px;
  height: 60px;
  font-size: 2rem;
  text-align: center;
  border: 2px solid #ccc;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: #f9f9f9;
}

.code-box:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15);
  background-color: #fff;
}

@media (max-width: 600px) {
  .code-box {
    width: 40px;
    height: 50px;
    font-size: 1.5rem;
  }
}
</style>