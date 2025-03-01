<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  setup() {
    const decode = JSON.parse(localStorage.getItem('access_token'));
    const idusuario = decode.id_usuario
    const router = useRouter();
    const pedido = ref([])
    const facturapedido = async ()=>{
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/carritoProductos');
        pedido.value = respuesta.data
      } catch (error) {
        console.log("No se cargaron los datos ", error);
      }
    }
    const comprarMultiple = async()=>{
      try{
        const compraMultiple =await axios.post("http://127.0.0.1:8000/carritoMultiple/"+idusuario);
        Swal.fire({
                    icon:"success",
                    title:"Pedidos Hechos",
                    
                })
        router.go(0)
      }catch{

      }
    }
    
    onMounted(() =>  {
      
      facturapedido()
      }
    );

    const onQuitar = (id_carrito)=>{
      router.push({path:'/quitarCarrito', query:{id_carrito:id_carrito}})
    }
    const onComprar = (productoId,cantidad,id_carrito) => {
      router.push({ path: '/comprar', query: { productoId: productoId, cantidad:cantidad, id_carrito:id_carrito } });
    }
    return {
      
      pedido,
      onQuitar,
      onComprar,
      router,
      comprarMultiple
    };
  }
};
</script>

<template>


  <div class="box">
    <!-- Header principal -->
    

    <!-- Barra de navegación -->
    <nav class="navbar">
      <ul>
       
        <li><button type="button" @click="router.go(-1)" id="x">INICIO</button></li>
      </ul>
    </nav>
    <h2>¡Tus compras! </h2>

    <section class="section-products" id="products">
     
      <div class="contenedor-sobre-nosotros">
        <img src="" alt="" class="imagen-about-us">
        

          <div class="cards">
            <ul>
              <li v-for="i in pedido" :key="i" class="card">
                <b class="pedidoespacios">ID Compra: {{ i.id_carrito }} </b>
                <b class="pedidoespacios">ID Usuario:{{ i.id_usuario }} </b>       
                <b class="pedidoespacios">ID Producto:{{ i.id_producto }} </b>
                
                <b class="pedidoespacios">Cantida:{{ i.cantidad }} </b>
                <b class="pedidoespacios">Total:{{ i.total }} </b><br>
                <button  class="btn" @click="onQuitar(i.id_carrito)" > - </button>
                <button  class="botn" @click="onComprar(i.id_producto, i.cantidad,i.id_carrito)" > Comprar </button>
                
                
              </li>
            </ul>
        </div>
        <button  class="botn" @click="comprarMultiple">Comprar todos</button>


        
      </div>
    </section>



    <!-- Sección de productos -->
    
    <!-- Sección de lo que hacemos -->
    

    
    
     <!-- Formulario de contacto -->
     <section class="contact-form" id="contact">
      <h2>Comentarios</h2>
      <form>
        
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
<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
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
  color: #FFA500;
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
  color: #FFA500; 
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
  background-color: #FFA500;
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

.botn {
  background-color:green;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
  margin-left:25%;
}

.botn:hover {
  background-color: green;
}


/* Buttons */
.btn {
  background-color:red;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: red;
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
  border-color: #FF8C00;
}

.contact-form button {
  background-color: #FF8C00;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.contact-form button:hover {
  background-color: #FF7000;
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
  color: #FFA500;
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
  background-color: #FFA500;
  color: white;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
}

.footer .btn:hover {
  background-color: #FF7000;
}

.credit {
  text-align: center;
  margin-top: 20px;
  font-size: 1em;
  color: #ccc;
}
</style>