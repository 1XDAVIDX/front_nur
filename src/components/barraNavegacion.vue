<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    localStorage.clear();
    const router = useRouter();
    const data = ref([]);

  
    const consultaProducto = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/consultarProductos');
        data.value = respuesta.data;
      } catch (error) {
        console.log("No se cargaron los datos", error);
      }
    };

    const getImagenUrl = (path) =>{
      return `http://127.0.0.1:8000/${path}`;
    }
    

    onMounted(consultaProducto);

    // Comentarios de clientes
    const comentarios = ref([
      { nombre: 'Juan Pérez', comentario: 'Excelente servicio, productos de alta calidad.' },
      { nombre: 'Maria García', comentario: 'Muy satisfecha con mi compra, atención rápida y amable.' },
      { nombre: 'Carlos Ramírez', comentario: 'Gran variedad de productos para todas las mascotas.' },
      { nombre: 'Sofía López', comentario: 'El envío fue rápido y los productos llegaron en buen estado.' },
      { nombre: 'Fernando González', comentario: 'Buenos precios y excelente atención al cliente.' }
    ]);
    const onComprar = (productoId) => {
      router.push({ path: '/comprar', query: { productoId: productoId } });
    }
    const onAgregarCarrito = (productoId) =>{
      router.push({ path: '/agregarCarrito', query: { productoId: productoId } });
    }

    return {
      data,
      comentarios,
      getImagenUrl,
      onComprar,
      
      onAgregarCarrito
    };
  }
};
</script>

<template>
  <div class="box">
    <!-- Header principal -->
    <header class="main-header" id="home">
      <div class="logo-title">
        <div class="text-on-image">
          <h1 class="header-title">Mascotas</h1>
          <h2 class="header-subtitle">
            Los mejores accesorios y cuidados para tu mejor amigo, ofreciendo productos de calidad, seguridad y bienestar.
          </h2>
        </div>
       
      </div>
      <div class="wave" style="height: 100px; overflow: hidden;">
        <svg viewBox="0 0 700 100" preserveAspectRatio="none" style="height: 100%; width: 100%;">
            <path d="M0,60 C200,120 500,0 700,60 L700,100 L0,100 Z"
                  style="stroke: none; fill: #000;">
            </path>
        </svg>
      </div>
      <img src="./img/logo.png" alt="Logo de" class="logo-large">
    </header>

    <!-- Barra de navegación secundaria -->
    <nav class="navbar">
      <ul>
        
        <li><router-link to="/registroUsuario">Crear cuenta</router-link></li>
        <li><router-link to="/pruebaLogin">Ingresar</router-link></li>
        
        
      </ul>
    </nav>
    <div class="carritocompra">
      <div class="carritoemoti">
        <router-link to="/carritoCompra">🛒</router-link>
      </div>
    </div>
     <!-- Sección de productos -->
     <h2>¡Bienvenido a Mascotas!</h2>
     <p>
        ¿Estás buscando lo mejor para tu compañero peludo? En nuestra tienda, encontrarás más que productos; 
        encontrarás una comunidad de amantes de los animales como tú. 
      </p>
     <section class="section-products" id="products">
      <h2>Nuestro Producto</h2>
      <div class="contenedor-sobre-nosotros">
        <img src="" alt="" class="imagen-about-us">
        <div class="contenido-textos">
          <p>El amor por las mascotas nos une. En Mascotas, somos apasionados por brindar productos de 
            calidad que satisfagan tanto a ti como a tu compañero peludo. Nuestra selección incluye alimentos nutritivos, 
            juguetes divertidos, accesorios prácticos y productos de higiene de las mejores marcas. Pero eso no es todo, 
            también ofrecemos asesoramiento personalizado para ayudarte a elegir los productos más adecuados para las 
            necesidades específicas de tu mascota.¡Visítanos y descubre cómo hacer de tu mascota el miembro más feliz de la familia!</p>
        </div>
        <div class="cards">
        <ul>
          <li v-for="producto in data" :key="producto.id_producto" class="card">
            <div class="card-content">
              
              <div class="imagen">
                <img :src="getImagenUrl(producto.imagen)" alt="Imagen" >
              </div>
              <strong>ID:</strong> {{ producto.id_producto }}<br>
              <strong>Nombre:</strong> {{ producto.nombre }}<br>
              <strong>Descripción:</strong> {{ producto.descripcion }}<br>
              <strong>Precio:</strong> ${{ producto.precio.toFixed(2) }}<br>
              <strong>Stock:</strong> {{ producto.stock }}<br>
              
              <button class="btn" @click="onComprar(producto.id_producto)">Compra</button>
              <button class="btn" @click="onAgregarCarrito(producto.id_producto)">🛒</button>
              
            </div>
          </li>
        </ul>
      </div>
      </div>
    </section>
    <!-- Sección de lo que hacemos -->
    <section class="about-us" id="about">
      <h2>Sobre Nosotros</h2>
      <p>
        ¿Te imaginas un mundo donde tú y tu mascota puedan disfrutar al máximo juntos? En Mascotas, 
        hacemos ese sueño realidad. Nuestra misión es crear una comunidad de amantes de los animales donde 
        puedan encontrar todo lo que necesitan para cuidar de sus compañeros peludos. Desde el momento en que 
        entras en nuestra tienda, te sentirás como en casa. Nuestro equipo de apasionados amantes de los animales 
        estará encantado de ayudarte a encontrar los productos perfectos para tu mascota. 
        Porque sabemos que el vínculo entre tú y tu mascota es especial, y queremos ayudarte a fortalecerlo.
      </p>
    </section>

    <!-- Sección de ubicación -->
    <section class="location" id="location">
      <h2>¿Dónde Estamos?</h2>
      <p>
        Estamos ubicados en la calle 123, en el corazón de la ciudad. Visítanos para obtener asesoría personalizada y conocer nuestros productos de primera mano. También ofrecemos servicio de entrega a domicilio en toda la ciudad.
      </p>
    </section>

    <!-- Sección de comentarios -->
    <section class="comments-section" id="comments">
      <h2>Lo Que Dicen Nuestros Clientes</h2>
      <div class="cards">
        <ul>
          <li v-for="(comentario, index) in comentarios" :key="index" class="card">
            <div class="card-content">
              <strong>{{ comentario.nombre }}:</strong><br>
              {{ comentario.comentario }}
            </div>
          </li>
        </ul>
      </div>
    </section>

     <!-- Formulario de contacto -->
     <section class="contact-form" id="contact">
      <h2>Contáctanos</h2>
      <form>
        <input type="text" placeholder="Nombre" required>
        <input type="email" placeholder="Correo electrónico" required>
        <textarea placeholder="Mensaje" required></textarea>
        <button type="submit">Enviar</button>
      </form>
    </section>


    <!-- Footer -->
    <section class="footer">
      <div class="box-container">
        <div class="box">
          <h3><i class="fas fa-paw"></i> Mascotas</h3>
          <p>Los mejores productos para tus mascotas. Calidad garantizada, amor asegurado.</p>
          <p class="links"><i class="fas fa-clock"></i> Lunes - Viernes</p>
          <p class="days">7:00AM - 11:00PM</p>
        </div>
        <div class="box">
          <h3>Información de Contacto</h3>
          <p><i class="fas fa-phone"></i> 1245-147-2589</p>
          <p><i class="fas fa-envelope"></i> info@mascotas.com</p>
          <p><i class="fas fa-map-marker-alt"></i> Calle 123, Ciudad, País</p>
        </div>
        <div class="box">
          <h3>Newsletter</h3>
          <p>Suscríbete para recibir las últimas novedades</p>
          <input type="email" placeholder="Tu Correo" class="email">
          <a href="#" class="btn">Suscribirse</a>
        
        </div>
      </div>
      <div class="credit">&copy; 2024 Mascotas. Todos los derechos reservados.</div>
    </section>
  </div>
</template>
<style >

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.carritoemoti{
  font-size: 2em;
  text-align: center;
}
.carritocompra{
  height: 50px;
  width: 50px;
  background-color: orangered;
  border-radius: 50%;
  position: sticky;
  top:100px;
  margin-top: 50px;
  margin-left: 95%;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

h1, h2, h3 {
  font-weight: 700;
  color: #333;
}

a {
  text-decoration: none;
  color: inherit;
}

ul {
  list-style: none;
  padding: 0;
}

/* Header */
header {
  background: linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(50, 50, 50, 0.8)), url('../img/portada.jpg') no-repeat center/cover;
  color: #fff;
  text-align: center;
  height: 600px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.header-title {
  font-size: 3.5em;
  font-weight: bold;
  color: #FFA500;
  margin-bottom: 10px;
}

.header-subtitle {
  font-size: 1.6em;
  max-width: 600px;
  color: #fffb00;
}

/* Navbar */
.navbar {
  background-color: #333;
  padding: 15px 0;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar ul {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.navbar ul li a {
  color: #dd0808;
  font-size: 1.1em;
  font-weight: 500;
  padding: 10px;
  transition: color 0.3s;
}

.navbar ul li a:hover {
  color: #fffb00;
}

/* Wave */
.wave {
  background-image: url('https://www.svgrepo.com/show/166897/wave.svg');
  height: 80px;
  background-size: cover;
  position: absolute;
  bottom: 0;
  width: 100%;
}

h2 {
  font-size: 2.5em; 
  color: #dd0808; 
  text-align: center;
  margin-bottom: 20px; 
}


p {
  font-size: 1.2em;
  text-align: center;
  max-width: 800px; 
  margin: 0 auto 40px; 
  line-height: 1.6;
  color: #333;
}
/* Sections */
.section {
  padding: 60px 20px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.section h2 {
  font-size: 2.5em;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
  position: relative;
}

.section h2::after {
  content: '';
  width: 80px;
  height: 3px;
  background-color: #dd0808;
  display: block;
  margin: 8px auto 0;
  border-radius: 4px;
}

.section p {
  font-size: 1.1em;
  color: #555;
  max-width: 800px;
  margin: 0 auto 20px;
  line-height: 1.8;
}

.section-products .cards ul {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

/* Cards */
.card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 280px;
  text-align: left;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.2);
}
.cards ul {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  list-style: none;
}

.card-content strong {
  color: #ff6600;
}

/* Buttons */
.btn {
  background-color: #ddab08;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #dd0808;
}

/* Contact Form */
.contact-form form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.contact-form input,
.contact-form textarea {
  width: 60%;
  padding: 12px;
  font-size: 1em;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: #dd0808;
}

.contact-form button {
  background-color: #dd0808;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.contact-form button:hover {
  background-color: #dd0808;
}

/* Footer */
.footer {
  background-color: #333;
  color: white;
  padding: 40px 20px;
}

.footer .box-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.footer .box {
  flex-basis: 25%;
  margin-bottom: 20px;
}

.footer h3 {
  font-size: 1.5em;
  color: #dd0808;
  margin-bottom: 20px;
}

.footer p,
.footer .links,
.footer .days {
  font-size: 1em;
  margin-bottom: 10px;
  color: white;
}

.footer .btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #dd0808;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
}

.footer .btn:hover {
  background-color: #dd0808;
}

.credit {
  text-align: center;
  margin-top: 20px;
  font-size: 1em;
  color: #ccc;
}
.card .imagen img {
  width: 100%;
  height: auto; /* Mantiene la proporción */
  max-height: 200px; /* Limita la altura máxima */
  object-fit: contain; /* Ajusta la imagen para que se vea completa sin cortar */
  border-radius: 8px;
  margin-bottom: 10px;
}
</style>
