<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import GraficoPastel from "@/components/GraficoPastel.vue"; 
import '@fortawesome/fontawesome-free/css/all.css';


export default {
  
  components: { 
    GraficoPastel  
  },
  setup() {
    
    const memoria = JSON.parse(localStorage.getItem('access_token'))
    const nombreUsuario = memoria?.nombre
    const emailUsuario = memoria?.email
    const router = useRouter();
    const data = ref([]);
    

    
    const pedido = ref({});
    
    
    const facturapedido = async () => {
    try {
    const respuesta = await axios.get("http://127.0.0.1:8000/compra");
    const compras = respuesta.data;

    // Agrupar por id_usuario
    const comprasAgrupadas = compras.reduce((acc, compra) => {
          if (!acc[compra.id_usuario]) {
            acc[compra.id_usuario] = [];
          }
          acc[compra.id_usuario].push(compra);
          return acc;
        }, {});

        pedido.value = comprasAgrupadas; // Asignamos el objeto agrupado a la variable reactiva
      } catch (error) {
        console.log("No se cargaron los datos", error);
      }
    };


    // apache

    const grafico = ref([]);
    const productosVendidos = ref([]);

    const datosGrafico = async () => {
      try {
        const respuesta = await axios.get("http://127.0.0.1:8000/compra_grafico_ver");
        grafico.value = respuesta.data;

        // Procesar productos más vendidos
        const contador = {};
        grafico.value.forEach(p => {
          if (contador[p.id_producto]) {
            contador[p.id_producto].cantidad += p.cantidad;
          } else {
            contador[p.id_producto] = { nombre_producto: ` ${p.nombre_producto}`, cantidad: p.cantidad };
          }
        });

        productosVendidos.value = Object.values(contador);
        
      } catch (error) {
        console.log("No se cargaron los datos", error);
      }
    };

    

    

    // apache
    
    function enviarMensajeWhatsapp() {
      const numero = "573508381030";
      const mensaje =encodeURIComponent("Hola, quiero ver el catalogo");
      const url = `https://wa.me/${numero}?text=${mensaje}`;
      window.open(url, "_blank");
    }

    


    // remover

    const categorias = ref(['Todos', 'Alimentos', 'accesorios', 'juguetes']);
    const categoriaSeleccionada = ref('Todos');

    const seleccionarCategoria = (categoria) => {
      categoriaSeleccionada.value = categoria;
      consultaProducto();
    };

    const consultaProducto = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/consultarProductos');
        if (categoriaSeleccionada.value === 'Todos') {
          data.value = respuesta.data;
        } else {
          data.value = respuesta.data.filter(item => item.categotia === categoriaSeleccionada.value);
        }
      } catch (error) {
        console.log("No se cargaron los datos", error);
      }
    };

    // remover

    const getImagenUrl = (path) =>{
      return `http://127.0.0.1:8000/${path}`;
    }
    

    onMounted(() =>  {
      consultaProducto(),
      facturapedido(),
      datosGrafico()
      
      
      }
    );

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
    const onEliminar = (productoId)=>{
      router.push({path:'/eliminarProducto', query: {productoId: productoId}})
    }
    const onModificar = (productoId)=>{
      router.push({path:'/modificarProducto', query: {productoId: productoId}})
    }
    const onCompletado = (id_compra, id_usuario)=>{
      router.push({path:'/completado', query : {id_compra:id_compra, id_usuario:id_usuario}})
    }
    const onAgregarCarrito = (productoId) =>{
      router.push({ path: '/agregarCarrito', query: { productoId: productoId } });
    }

    return {
      data,
      comentarios,
      getImagenUrl,
      pedido,
      productosVendidos,
      onComprar,
      onEliminar,
      onModificar,
      onCompletado,
      nombreUsuario,
      emailUsuario,
      enviarMensajeWhatsapp,
      categorias,
      seleccionarCategoria,
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
        <li><router-link to="/categoria">Categoria</router-link></li>
        <li><router-link to="/inventario">Producto Despachados</router-link></li>
        <li><router-link to="/modificarProducto">Modificar Producto</router-link></li>
        <li><router-link to="/eliminarProducto">Eliminar Producto</router-link></li>
        <li><router-link to="/registroUsuario">Crear cuenta</router-link></li>
        <li><router-link to="/pruebaLogin">Ingresar</router-link></li>
        <li><router-link to="/registroProducto">Registrar Producto</router-link></li>
        <li class="infocliente">{{ nombreUsuario }}<br> {{ emailUsuario }}</li>
      </ul>
    </nav>
    
    <h2>¡Bienvenido {{nombreUsuario}}!</h2>

    <div class="centro_control">
        <div class="left-section">
            
            <div class="pie_estadistico">
                <GraficoPastel :productosVendidos="productosVendidos" />
            </div>
        </div>
        <div class="right-section">
          <h2>Ventas</h2>
          <div class="cards">
            <ul>
              <li v-for="(compras, usuarioId) in pedido" :key="usuarioId">
                <h3>--------------------------------------------------------------------------------------------------------------------------------------------------</h3>
                <p><h3>ID Usuario: {{ usuarioId }}</h3></p>
                
                <ul>
                  <li class="card" v-for="compra in compras" :key="compra.id_compra">
                    <b>ID Compra: {{ compra.id_compra }}</b><br>
                    <b>ID Producto: {{ compra.id_producto }}</b><br>
                    <b>Cantidad: {{ compra.cantidad }}</b><br>
                    <b>Total: {{ compra.total }}</b><br>
                    <button class="btn" @click="onCompletado(compra.id_compra, compra.id_usuario)">Hacer pedido</button>
                  </li>
                </ul>
                <p><h3>Total de compra: <b>${{ compras.reduce((sum, compra) => sum + compra.total, 0).toFixed(2) }}</b></h3> </p>
                <h3>--------------------------------------------------------------------------------------------------------------------------------------------------</h3>
              </li>
            </ul>
          </div>
        </div>
    </div>

    <div class="carritocompra">
      <div class="carritoemoti">
        <router-link to="/carritoCompra">🛒</router-link>
      </div>
    </div>

    <div class="whasapp">
      <button @click="enviarMensajeWhatsapp" class="whatsapp-btn">
        <i class="fab fa-whatsapp"></i> 
      </button>
    </div>

    


    <div class="categorias">
      <button 
        v-for="categoria in categorias" 
        :key="categoria" 
        @click="seleccionarCategoria(categoria)"
        :class="{ activo: categoria === categoriaSeleccionada }">
        {{ categoria }}
      </button>
    </div>


    <section class="section-products" id="products">
      
      <div class="contenedor-sobre-nosotros">
        
        
        <div class="cards">
        <ul>
          <li v-for="producto in data" :key="producto.id_producto" class="card">
            <div class="card-content">
              
              <button class="btn" @click="onModificar(producto.id_producto)">✏️</button>
            
              <button class="btn" @click="onEliminar(producto.id_producto)">🗑️</button>
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
      <h2>Mensajeria</h2>
      <form>
        <input type="text" placeholder="Nombre" required>
        <input type="email" placeholder="Correo electrónico" required>
        <textarea placeholder="Mensaje" required></textarea>
        <button type="submit">Enviar</button>
      </form>
    </section>

    <section class="location" id="location">
      <h2>¿Dónde Estamos?</h2>
      <p>
        Estamos ubicados en la calle 123, en el corazón de la ciudad. Visítanos para obtener asesoría personalizada y conocer nuestros productos de primera mano. También ofrecemos servicio de entrega a domicilio en toda la ciudad.
      </p>
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

.carritocompra {
  position: fixed;
  bottom: 90px; 
  right: 20px;
  z-index: 1000;
}

.carritoemoti a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #ff6600; /* Color similar a WhatsApp */
  color: white;
  font-size: 30px;
  border: none;
  border-radius: 50%;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background 0.3s ease-in-out, transform 0.2s;
  text-decoration: none; /* Elimina subrayado */
}

.carritoemoti a:hover {
  background-color: #d65300;
  transform: scale(1.1);
}

.categorias {
  display: flex;
  justify-content: center; /* Centrar los botones */
  gap: 15px; /* Espacio entre botones */
  margin: 20px 0;
}

.categorias button {
  padding: 15px 25px; /* Tamaño más grande */
  font-size: 18px; /* Texto más grande */
  border: none;
  background-color: orange; /* Botón color naranja */
  color: white; /* Texto blanco */
  cursor: pointer;
  border-radius: 8px; /* Bordes redondeados */
  transition: background 0.3s, transform 0.2s;
}

.categorias button.activo {
  background-color: #d68600; /* Un naranja más oscuro para el botón activo */
}

.categorias button:hover {
  background-color: red; /* Cambio a rojo al pasar el mouse */
  transform: scale(1.1); /* Efecto de agrandamiento */
}


.centro_control {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 80%;
            margin: 20px auto;
            padding: 20px;
            border: 2px solid #ccc;
            border-radius: 10px;
            background: #f9f9f9;
}
.left-section {
    width: 35%;
    padding: 10px;
    text-align: center;
}
.right-section {
    width: 60%;
    padding: 10px;
}
.cards ul {
    list-style: none;
}
.card {
    background: #fff;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 5px;
}
.btn:hover {
    background: #0056b3;
}



.whasapp {
  position: fixed;
  bottom: 20px; 
  right: 20px;  
  z-index: 1000;
}

.whatsapp-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #25D366;
  color: white;
  font-size: 30px;
  border: none;
  border-radius: 50%;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background 0.3s ease-in-out, transform 0.2s;
}

.whatsapp-btn:hover {
  background-color: #1ebe5d;
  transform: scale(1.1);
}
.pie_estadistico{
  height: 500px;
  width: 500px;
  
}
.infocliente{
  color: red;
  font-size: 17px;
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
.btn {
  position: relative;  /* Asegura que el botón esté en su propio contexto de apilamiento */
  z-index: 10;  /* Ajusta el z-index según lo necesario */
}
</style>
