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
                Swal.fire({
                    title: "Enviando...",
                    text: "Por favor, espera mientras Enviamos el codigo al correo.",
                    allowOutsideClick: false,
                    didOpen: () => {
                    Swal.showLoading(); 
                    },
                });
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
        const validarContrasena = (password) => {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
            return regex.test(password);
        };
        const guardarCambiosUsuario = async () => {

            const password = nuevaContrasena.value.contraseña;

            if (!validarContrasena(password)) {
                Swal.fire({
                    icon: "warning",
                    title: "Contraseña inválida",
                    text: "Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial.",
                });
                return;
            }
            try {
            const respuesta = await axios.put(`http://127.0.0.1:8000/editar/usuario/${comprobarEmail.value.destinatario}`, nuevaContrasena.value);
            Swal.fire({
            icon: "success",
            title: "Datos Actualizados",
            text: "se recomienda volver a iniciar sesión para ver los cambios", 
            }).then(() => {
                cerrarModalUsuario();
                router.push({ path: '/pruebaLogin' });
            
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
    <div class="auth-wrapper">
      <!-- Paso 1: Email -->
      <section class="auth-card" v-if="!mostrarFormularioContrasena && !codigoVerificado">
        <h1 class="auth-title">Recuperación de Contraseña</h1>
        <form @submit.prevent="apiEmail" class="form-section">
          <div class="form-group">
            <label for="email" class="form-label">Correo Electrónico</label>
            <input type="email" v-model="comprobarEmail.destinatario" id="email" required class="form-input" />
          </div>
          <button type="submit" class="btn-primary">Enviar Código</button>
        </form>
      </section>
  
      <!-- Paso 2: Código -->
      <section class="auth-card" v-if="mostrarFormularioContrasena && !codigoVerificado">
        <h2 class="auth-title">Verificación de Código</h2>
        <form @submit.prevent="verificarCodigo" class="form-section">
          <label class="form-label">Ingrese el código enviado</label>
          <div class="code-group">
            <input v-for="(char, index) in codigoIngresado" :key="index" v-model="codigoIngresado[index]" maxlength="1" class="code-input" />
          </div>
          <button type="submit" class="btn-primary">Verificar Código</button>
        </form>
      </section>
  
      <!-- Paso 3: Nueva contraseña -->
      <section class="auth-card" v-if="codigoVerificado">
        <h2 class="auth-title">Nueva Contraseña</h2>
        <form @submit.prevent="guardarCambiosUsuario" class="form-section">
          <div class="form-group">
            <label for="newPass" class="form-label">Contraseña Nueva</label>
            <input type="password" v-model="nuevaContrasena.contraseña" id="newPass" required class="form-input" />
          </div>
          <button type="submit" class="btn-primary">Actualizar</button>
        </form>
      </section>
    </div>
  </template>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background-color: #f2f4f8;
  min-height: 100vh;
}

.auth-card {
  background: #fff;
  max-width: 480px;
  width: 100%;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.auth-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 24px;
  text-align: center;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 6px;
}

.form-input {
  padding: 12px;
  font-size: 1rem;
  border-radius: 10px;
  border: 1px solid #dcdcdc;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: #fcfcfc;
}

.form-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 6px rgba(52, 152, 219, 0.2);
  outline: none;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.code-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.code-input {
  width: 48px;
  height: 56px;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  border: 2px solid #ccc;
  border-radius: 10px;
  transition: border-color 0.3s, box-shadow 0.3s;
  background-color: #f5f6fa;
}

.code-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.25);
  background-color: white;
  outline: none;
}

@media (max-width: 600px) {
  .auth-card {
    padding: 28px 20px;
  }

  .code-input {
    width: 42px;
    height: 50px;
    font-size: 1.5rem;
  }

  .btn-primary {
    font-size: 0.95rem;
  }
}
</style>