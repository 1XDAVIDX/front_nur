<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
  setup() {
  
    const data = ref([]);
    const images = ref([
      './img/M_arnesdoble7984.jpg',
      './img/imagen2.jpg',
      './img/imagen2.jpg',
      './img/imagen2.jpg',
      './img/imagen2.jpg'
    ]);
    const currentSlide = ref(0);

  
    const consultaProducto = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/consultarProductos');
        data.value = respuesta.data;
      } catch (error) {
        console.log("No se cargaron los datos", error);
      }
    };

    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % images.value.length;
    };
    
    const prevSlide = () => {
      currentSlide.value = (currentSlide.value - 1 + images.value.length) % images.value.length;
    };

    onMounted(consultaProducto);

    // Comentarios de clientes
    const comentarios = ref([
      { nombre: 'Juan Pérez', comentario: 'Excelente servicio, productos de alta calidad.' },
      { nombre: 'Maria García', comentario: 'Muy satisfecha con mi compra, atención rápida y amable.' },
      { nombre: 'Carlos Ramírez', comentario: 'Gran variedad de productos para todas las mascotas.' },
      { nombre: 'Sofía López', comentario: 'El envío fue rápido y los productos llegaron en buen estado.' },
      { nombre: 'Fernando González', comentario: 'Buenos precios y excelente atención al cliente.' }
    ]);

    return {
      data,
      images,
      currentSlide,
      nextSlide,
      prevSlide,
      comentarios
    };
  }
};
</script>

<template>
  <div class="box">
    <!-- Header principal -->
    <header class="main-header">
      <div class="logo-title">
        <img src="./img/logo.jpg" alt="Logo de Mascotas" class="logo">
        <div>
          <h1>Mascotas</h1>
          <h2>Los mejores accesorios para tu mejor amigo</h2>
        </div>
      </div>
      <div class="search-bar">
        <input type="text" placeholder="Buscar productos..." />
        <button>Buscar</button>
      </div>
    </header>

    <!-- Barra de navegación secundaria -->
    <header>
      <nav class="secondary-nav">
        <router-link to="/modificarProducto">Modificar Producto</router-link>
        <router-link to="/eliminarProducto">Eliminar Producto</router-link>
        <router-link to="/registroUsuario">Login</router-link>
        <router-link to="/registroProducto">Registrar Producto</router-link>
      </nav>
    </header>

    <!-- Carrusel de imágenes -->
    <section class="carousel">
      <div class="carousel-container" :style="{ transform: 'translateX(' + (-currentSlide * 100) + '%)' }">
        <div class="carousel-item" v-for="(image, index) in images" :key="index" :style="{ backgroundImage: 'url(' + image + ')' }"></div>
      </div>
      <button class="prev" @click="prevSlide">‹</button>
      <button class="next" @click="nextSlide">›</button>
    </section>

    <!-- Productos -->
    <div>
      <section class="cards">
        <ul>
          <li v-for="producto in data" :key="producto.id_producto" class="card">
            <div class="card-content">
              <div class="imagen"></div>
              <strong>ID:</strong> {{ producto.id_producto }}<br>
              <strong>Nombre:</strong> {{ producto.nombre }}<br>
              <strong>Descripción:</strong> {{ producto.descripcion }}<br>
              <strong>Precio:</strong> ${{ producto.precio.toFixed(2) }}<br>
              <strong>Stock:</strong> {{ producto.stock }}<br>
            </div>
          </li>

          <!-- Comentarios en tarjetas -->
          <li v-for="(comentario, index) in comentarios" :key="index" class="card">
            <div class="card-content">
              <strong>{{ comentario.nombre }}:</strong><br>
              {{ comentario.comentario }}
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- Pie de página -->
    <footer class="main-footer">
      <div class="footer-content">
        <p>&copy; 2024 Mascotas. Todos los derechos reservados.</p>
        <nav class="footer-nav">
          <router-link to="/terminos">Términos y Condiciones</router-link>
          <router-link to="/privacidad">Política de Privacidad</router-link>
          <router-link to="/ayuda">Ayuda</router-link>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

html, body {
  height: 100%;
  margin: 0;
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
}

.box {
  display: flex;
  flex-direction: column;
  min-height: 100vh; 
}

.main-header {
  background-color: #007BFF;
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.logo-title {
  display: flex;
  align-items: center;
}

.logo {
  width: 80px;
  height: 80px;
  margin-right: 20px;
  border-radius: 50px;
}

h1 {
  margin: 0;
  font-size: 1.8em;
  font-weight: 600;
}

h2 {
  margin: 5px 0 0 0;
  font-size: 1em;
  font-weight: 400;
  color: #f1f1f1;
}

.search-bar {
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 4px 0 0 4px;
  font-size: 1em;
}

.search-bar button {
  padding: 12px 16px;
  border: none;
  background-color: #28A745;
  color: white;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-bar button:hover {
  background-color: #218838;
}

/* Barra de navegación secundaria */
.secondary-nav {
  display: flex;
  justify-content: flex-end;
  gap: 30px;
  background-color: #F8C444;
  padding: 15px;
}

.secondary-nav a {
  color: black;
  text-decoration: none;
  font-size: 1.1em;
  font-weight: 500;
}

.secondary-nav a:hover {
  text-decoration: underline;
  color: #007BFF;
}

/* Estilo para el carrito */
#carritocompra {
  margin-left: 95%;
  position: fixed;
  top: 40%;
  height: 60px;
  width: 60px;
  border-radius: 50px;
  background-color: #FFC107; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}


.main-footer {
  background-color: #007BFF;
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 0.9em;
  margin-top: auto;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-nav {
  margin-top: 10px;
}

.footer-nav a {
  margin-right: 15px;
  color: white;
  text-decoration: none;
  font-size: 0.9em;
}

.footer-nav a:hover {
  text-decoration: underline;
  color: #F8C444;
}


.cards {
  background-color: #f8f9fa;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

ul {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  justify-content: center;
  gap: 20px;
}

.card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 280px;
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.card-content {
  font-family: 'Poppins', sans-serif;
}

.imagen {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  margin-bottom: 15px;
  background-color: #f1f1f1;
  border-radius: 10px;
}

.imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

strong {
  color: #007BFF;
}

.secondary-nav {
  display: flex;
  justify-content: center;
  gap: 50px;
  background: #f8c444;
  padding: 15px;
  background-image: url('https://www.svgrepo.com/show/166897/wave.svg');
  background-repeat: no-repeat;
  background-size: cover;
  color: black;
  font-size: 1.1em;
  text-transform: uppercase;
}

.secondary-nav a {
  color: black;
  text-decoration: none;
}

.secondary-nav a:hover {
  text-decoration: underline;
}


.carousel {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  margin-bottom: 50px;
}

.carousel-container {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 500%;
}

.carousel-item {
  min-width: 100%;
  background-size: cover;
  background-position: center;
}

.prev, .next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-size: 2em;
}

.prev {
  left: 10px;
}

.next {
  right: 10px;
}

/* Sección de comentarios */
.comentarios {
  background-color: #f8f9fa;
  padding: 20px;
  margin: 20px 0;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.comentarios h3 {
  margin-bottom: 20px;
  text-align: center;
  color: #007BFF;
}

.comentarios ul {
  list-style-type: none;
  padding: 0;
}

.comentarios li {
  margin-bottom: 15px;
  font-size: 1.1em;
}

.comentarios li strong {
  color: #007BFF;
}

</style>