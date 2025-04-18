<script>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';
import * as jwt_decode from 'jwt-decode';

export default {
  setup() {
    const router = useRouter();

    const isSignUp = ref(false);

    const toggleMode = (modo) => {
      isSignUp.value = modo;
    };

    

    // LOGIN
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
                //const respuesta = await axios.post('http://192.168.80.22:8000/login', login.value);
                
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

    // REGISTRO
    const usuario = ref({
      id_usuario: "",
      nombre: "",
      contraseña: "",
      rol: ""
    });

    const showPassword = ref(false);

    const validarContraseña = (contraseña) => {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;
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
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Bienvenido a tu cuenta'
        });
      } catch (error) {
        console.error("Error al registrar usuario:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error de registro',
          text: 'Usuario ya registrado'
        });
      }
    };
    const recuperarContrasena = () => {
      router.push({name:"correoRecuperacion"})
      //console.log("Recuperar contra")
    }

    return {
      // toggling
      isSignUp,
      toggleMode,

      // login
      login,
      insertarlogin,
      recuperarContrasena,

      // registro
      usuario,
      insertarUsuario,
      showPassword
    };
  }
};
</script>
<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <div class="wrapper">
    <div class="container" :class="{ active: isSignUp }" id="container">
      <!-- REGISTRO -->
      <div class="form-container sign-up">
        <form @submit.prevent="insertarUsuario">
          <h1>Crea tu cuenta !!</h1>
          <div class="social-icons">
            <a href="#" class="icon"><i class="fa-brands fa-google-plus-g"></i></a>
            <a href="#" class="icon"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" class="icon"><i class="fa-brands fa-github"></i></a>
            <a href="#" class="icon"><i class="fa-brands fa-linkedin-in"></i></a>
          </div>
          <span>Usa tu correo para registrarte</span>

          <input v-model="usuario.nombre" type="text" placeholder="Nombre" required />
          <input v-model="usuario.id_usuario" type="email" placeholder="Correo" required />

          <div class="input-password-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="usuario.contraseña"
              placeholder="Contraseña"
              required
            />
            <button type="button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>

          <!----><select v-model="usuario.rol" required class="select-rol">
            <option value="" disabled>Selecciona un rol</option>
            <option value="admin">Admin</option>
            <option value="cliente">Cliente</option>
          </select>

          <button type="submit">Inscribirse</button>
        </form>
      </div>

      <!-- LOGIN -->
      <div class="form-container sign-in">
        <form @submit.prevent="insertarlogin">
          <h1>Iniciar Sesión</h1>
          <div class="social-icons">
            <a href="#" class="icon"><i class="fa-brands fa-google-plus-g"></i></a>
            <a href="#" class="icon"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" class="icon"><i class="fa-brands fa-github"></i></a>
            <a href="#" class="icon"><i class="fa-brands fa-linkedin-in"></i></a>
          </div>
          <span>Usa tu correo y contraseña</span>
          <input v-model="login.id_usuario" type="email" placeholder="Correo" required />
          <input v-model="login.contraseña" type="password" placeholder="Contraseña" required />
          <a href="#" type="button" @click="recuperarContrasena" class="boton-recuperar">¿Olvidaste tu contraseña?</a>
          <button type="submit">Iniciar Sesión</button>
          
        </form>
      </div>

      <!-- TOGGLE -->
      <div class="toggle-container">
        <div class="toggle">
          <div class="toggle-panel toggle-left">
            <h1>¡Bienvenido de nuevo!</h1>
            <p>Ingresa tus datos para acceder a todas las funciones del sitio.</p>
            <button class="hidden" @click="toggleMode(false)">Iniciar Sesión</button>
          </div>
          <div class="toggle-panel toggle-right">
            <h1>¡Hola, Amigo!</h1>
            <p> .. Regístrate para aprovechar todas las funciones del sitio.</p>
            <button class="hidden" @click="toggleMode(true)">Crear Cuenta</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
body {
    background-color: #c9d6ff;
    background: linear-gradient(to right, #e2e2e2, #c9d6ff);
    display: flex;
    justify-content: center;
    align-items: center;    
    height: 100vh;           
    margin: 0;               
}

.wrapper {
  display: flex;
  justify-content: center;  /* Centra horizontalmente */
  align-items: center;       /* Centra verticalmente */
  height: 100vh;             /* Ocupa toda la altura de la pantalla */
  background-color: #c9d6ff;
  background: linear-gradient(to right, #e2e2e2, #c9d6ff);
  margin: 0;                 /* Sin márgenes */
}

/* Contenedor principal */
.container {
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
  width: 70%;
  max-width: 100%;
  height: 480px;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
    background-color: #fff;
    border-radius: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
    position: relative;
    overflow: hidden;
    width: 70%;
    max-width: 100%;
    height: 480px;
    display: flex;
    justify-content: center; /* Centra el contenido dentro del contenedor */
    align-items: center;     /* Alinea verticalmente el contenido */
}


.container p{
    font-size: 24px;
    line-height: 30px;
    letter-spacing: 0.3px;
    margin: 20px 0;
}

.container span{
    font-size: 12px;
}

.container a{
    color: #333;
    font-size: 13px;
    text-decoration: none;
    margin: 15px 0 10px;
}

.container button{
    background-color: #512da8;
    color: #fff;
    font-size: 12px;
    padding: 10px 45px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-top: 10px;
    cursor: pointer;
}

.container button.hidden{
    background-color: transparent;
    border-color: #fff;
}

.container form{
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 40px;
    height: 100%;
}
.container select {
    background-color: #eee;
    border: none;
    margin: 8px 0;
    padding: 10px 15px;
    font-size: 13px;
    border-radius: 8px; /* Bordes redondeados */
    width: 100%;
    outline: none;
    appearance: none; /* Oculta el estilo predeterminado del navegador */
    cursor: pointer; /* Cambia el cursor a tipo seleccionable */
    -webkit-appearance: none; /* Para Safari */
    -moz-appearance: none; /* Para Firefox */
    text-align: center;
}

/* Agregar un icono de flecha en el select */
.container select {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16' fill='%23555555'><path d='M7 10l5 5 5-5z'/></svg>");
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-size: 16px;
    padding-right: 30px; /* Espacio para la flecha */
}

.select-rol {
  color: gray; /* Color del placeholder */
}

.select-rol option[value=""] {
  color: gray; /* Forzar el color del placeholder */
}

.select-rol:valid {
  color: black; /* Cambia el color al seleccionar */
}

.container input{
    background-color: #eee;
    border: none;
    margin: 8px 0;
    padding: 10px 15px;
    font-size: 13px;
    border-radius: 8px;
    width: 100%;
    outline: none;
}

.form-container{
    position: absolute;
    top: 0;
    height: 100%;
    transition: all 0.6s ease-in-out;
}

.sign-in{
    left: 0;
    width: 50%;
    z-index: 2;
}

.container.active .sign-in{
    transform: translateX(100%);
}

.sign-up{
    left: 0;
    width: 50%;
    opacity: 0;
    z-index: 1;
}

.input-password-container {
  display: flex;
  align-items: stretch;  /* Que ambos elementos se estiren para tener el mismo alto */
  width: 100%;
  margin: 8px 0;
  box-sizing: border-box;
}

/* El input ocupa el espacio disponible y se fija en 40px de alto */
.input-password-container input {
  flex: 1;
  height: 40px;
  font-size: 13px;
  padding: 0 15px;  /* Padding horizontal, ya que la altura se define */
  border: none;
  background-color: #eee;
  border-radius: 8px 0 0 8px;
  outline: none;
  box-sizing: border-box;
}

/* El botón tiene un ancho fijo y la misma altura */
.input-password-container button {
  width: 80px;
  height: 38px;
  font-size: 13px;
  border: none;
  background-color: #512da8;
  color: #fff;
  border-radius: 8px ;
  cursor: pointer;
  box-sizing: border-box;
  padding: 10px 0;
}


.container.active .sign-up{
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: move 0.6s;
}

@keyframes move{
    0%, 49.99%{
        opacity: 0;
        z-index: 1;
    }
    50%, 100%{
        opacity: 1;
        z-index: 5;
    }
}

.social-icons{
    margin: 20px 0;
}

.social-icons a{
    border: 1px solid #ccc;
    border-radius: 20%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 0 3px;
    width: 40px;
    height: 40px;
}

.toggle-container{
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: all 0.6s ease-in-out;
    border-radius: 150px 0 0 100px;
    z-index: 1000;
}

.container.active .toggle-container{
    transform: translateX(-100%);
    border-radius: 0 150px 100px 0;
}

.toggle{
    background-color: #512da8;
    height: 100%;
    background: linear-gradient(to right, #5c6bc0, #512da8);
    color: #fff;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: all 0.6s ease-in-out;
}

.container.active .toggle{
    transform: translateX(50%);
}

.toggle-panel{
    position: absolute;
    width: 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 30px;
    text-align: center;
    top: 0;
    transform: translateX(0);
    transition: all 0.6s ease-in-out;
}

.toggle-left{
    transform: translateX(-200%);
}

.container.active .toggle-left{
    transform: translateX(0);
}

.toggle-right{
    right: 0;
    transform: translateX(0);
}

.container.active .toggle-right{
    transform: translateX(200%);
}
</style>