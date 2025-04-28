<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  data(){
  return {
      menuAbierto: false,
      
    };
},
methods:{
    toggleMenu() {
      this.menuAbierto = !this.menuAbierto;
    },
},
  setup() {
    const memoria = JSON.parse(localStorage.getItem('access_token'))
    const decode = JSON.parse(localStorage.getItem('access_token'));
    const idusuario = decode.id_usuario;
    const router = useRouter();
    const pedido = ref([]);
    const rolUsuario = memoria?.rol

    const facturapedido = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/carritoProductos');
        if (idusuario) {
          pedido.value = respuesta.data.filter(item => item.id_usuario === idusuario);
        } else {
          pedido.value = []; // No muestra nada
        }
      } catch (error) {
        console.log('No se cargaron los datos ', error);
      }
    };

    const comprarMultiple = async () => {
      try {
        const compraMultiple = await axios.post(
          'http://127.0.0.1:8000/carritoMultiple/' + idusuario
        );
        Swal.fire({
          icon: 'success',
          title: 'Pedidos Hechos',
        });
        router.go(0);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar la compra',
        });
      }
    };

    // ✅ Confirmar y eliminar producto
    const onQuitar = async (id_carrito) => {
      const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Este producto se eliminará del carrito.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });

      if (confirmacion.isConfirmed) {
        try {
          await axios.delete('http://127.0.0.1:8000/quitar/' + id_carrito);
          Swal.fire({
            icon: 'success',
            title: 'Producto eliminado del carrito',
            timer: 1500,
            showConfirmButton: false,
          });
          facturapedido(); // Actualizar lista de productos
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: 'No se pudo eliminar el producto',
          });
        }
      }
    };

    const onComprar = (productoId, cantidad, id_carrito) => {
      router.push({
        path: '/comprar',
        query: {
          productoId: productoId,
          cantidad: cantidad,
          id_carrito: id_carrito,
        },
      });
    };

    onMounted(() => {
      facturapedido();
    });

    const calcularTotal = computed(() => {
      return pedido.value.reduce((acumulador, item) => acumulador + item.total, 0);
    });

    return {
      pedido,
      onQuitar,
      onComprar,
      router,
      comprarMultiple,
      rolUsuario,
      calcularTotal
    };
  },
};

</script>
<template>
  <div class="box">
    <nav class="navbar"> 
      <ul>
        <li class="logo-item">
          <img src="./img/logo.png" alt="Logo" class="logo-small" @click="router.go(-1)">
        </li>
      </ul>
       <div class="navbar-right">

  <!-- Icono de hamburguesa a la derecha -->
  <span id="hamburguesa" @click="toggleMenu" class="far fa-user-circle"></span>

          <nav :class="['menuHamburguesa', { openHamburguesa: menuAbierto }]">
            <span id="cerrarHamburguesa" @click="toggleMenu">&#128938;</span>
            <ul>
              <li id="libienvenido">¡Bienvenido!</li>
              <li class="infocliente">{{ nombreUsuario }}</li>
              <li id="lilinea">-----------------------------------------</li>
              <li class="menuInfoCliente" @click="abrirModalUsuario"><i class="fas fa-user-edit"></i> PERFIL</li>
              <li class="lihamburguesa" v-if="rolUsuario === 'admin'">
                <router-link to="/registroProducto">
                  <i class="fas fa-box"></i> Registrar Producto
                </router-link>
              </li>
              <li class="lihamburguesa" v-if="rolUsuario === 'admin'">
                <router-link to="/modificarProducto">
                  <i class="fas fa-edit"></i> Modificar Producto
                </router-link>
              </li>
              <li class="lihamburguesa" v-if="rolUsuario === 'admin'">
                <router-link to="/eliminarProducto">
                  <i class="fas fa-trash-alt"></i> Eliminar Producto
                </router-link>
              </li>
              <li class="lihamburguesa" v-if="rolUsuario === 'admin'">
                <router-link to="/inventario">
                  <i class="fas fa-clipboard-list"></i> Producto Despachados
                </router-link>
              </li>         
              <li class="lihamburguesa"><router-link to="/pruebaLogin"><i class="fas fa-sign-in-alt"></i> Ingresar Usuario</router-link></li>
              <li class="lihamburguesa"><button type="button" class="btn btn-save" @click="cerrarSesion">cerrar Sesión</button></li>
              <li id="lilinea">-----------------------------------------</li>
            </ul>
          </nav>
        </div>
    </nav>


    <h2>¡Tus compras!</h2>

    <section class="section-products" id="products">
      <div class="contenedor-checkout">
        <!-- Columna izquierda: productos -->
        <div class="productos-lista">
  <h3>Carrito de Compras</h3>

  <ul v-if="pedido.length > 0">
    <li v-for="i in pedido" :key="i.id_carrito" class="producto-item">
      <div class="info-producto">
        <img src="https://placekitten.com/150/150" alt="Producto" />
        <div class="detalle">
          
          
          <p><b>ID Producto:</b> {{ i.id_producto }}</p>
          <p><b>Cantidad:</b> {{ i.cantidad }}</p>
          <p><b>Total:</b>  {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(i.total) }}</p>
          <div class="acciones">
            <button class="btn" @click="onQuitar(i.id_carrito)">🗑</button>
            <button class="botn" @click="onComprar(i.id_producto, i.cantidad, i.id_carrito)">Comprar</button>
          </div>
        </div>
      </div>
    </li>
  </ul>

  <!-- Mensaje si no hay productos -->
  <p v-if="pedido.length === 0" class="mensaje-vacio">
  <i class="fas fa-shopping-cart"></i> No hay productos agregados
</p>

</div>


        <!-- Columna derecha: resumen -->
        <div class="resumen-pedido">
          <h3>Resumen del Pedido</h3>
          <p><strong>Productos en carrito:</strong> {{ pedido.length }}</p>
          <p><strong>Total general: {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(calcularTotal) }}</strong> </p><br>
          <button class="botn resumen-boton" @click="comprarMultiple">Comprar todos</button>
          <p class="nota">No se cobrará hasta confirmar en la siguiente página</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <section class="footer">
      <div class="box-container">
        <div class="box-footer">
          <h3>Mascotas</h3>
          <p>Los mejores productos para tus mascotas. Calidad garantizada, amor asegurado.</p>
          <p class="links"><i class="fas fa-clock"></i> Horario de atención:</p>
          <p class="days">Lunes - Viernes: 7:00 AM - 11:00 PM</p>
        </div>
        <div class="box-footer">
          <h3>Información de Contacto</h3>
          <p><i class="fas fa-phone"></i> 1245-147-2589</p>
          <p><i class="fas fa-envelope"></i> info@mascotas.com</p>
          <p><i class="fas fa-map-marker-alt"></i> Calle 123, Ciudad, País</p>
        </div>
      </div>
      <div class="credit">&copy; 2024 Mascotas. Todos los derechos reservados.</div>
    </section>
  </div>
</template>

<style scoped>
/* GENERAL */
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

h2 {
  font-size: 2.5em;
  color: #FFA500;
  text-align: center;
  margin: 30px 0;
}

ul {
  list-style: none;
  padding: 0;
}
/* Carrito vacío */
.carrito-vacio {
  text-align: center;
  margin-top: 50px;
  color: #999;
}
.carrito-vacio p {
  color:black;
}

.detalle p{
  color:black;
}

.carrito-icono {
  font-size: 4em;
  color: #ccc;
  margin-bottom: 20px;
}
.mensaje-vacio {
  text-align: center;
  font-size: 1.3em;
  color: #888;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.mensaje-vacio i {
  font-size: 2em;
  color: #ccc;
}


/* Ajustes para íconos y hamburguesa juntos */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-right: 10px;
}

.box-footer h3,p{
  color:white;
}

.footer {
  margin-top: 190px; 
  background: #222;
  color: white;
  padding: 50px 20px 20px 20px;
}

/* NAVBAR */
.navbar ul {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin: 0;
  padding: 0 10px;
  flex-wrap: wrap;
}

.imagen-mascota {
  width: auto; 
  height: auto;
}

.logo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  overflow: hidden; 
}

.logo-small {
  gap:15px;
  max-width: 150px;
  max-height: 150px;
  width: auto;
  height: auto;
  cursor: pointer;
  transition: transform 0.3s;
}

.logo-small:hover {
  transform: scale(1.2); /* solo efecto visual */
}

.navbar ul li button {
  background-color: #FFA500;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.navbar ul li button:hover {
  background-color: #FF9900;
}
/* DERECHA */
.navbar-right {
display: flex;
align-items: center;
gap: 20px;
margin-right:80px;
}

.icono-link {
color: white;
font-size: 1.5em;
transition: color 0.3s;
}

.icono-link:hover {
color: #00ffcc;
}

/* Aumentar solo los íconos de notificaciones y WhatsApp */
.icono-link i {
font-size: 1.7em; /* Puedes subir a 2.5em si los quieres más grandes */
transition: color 0.3s;
}

.icono-link i:hover {
color: #00ffcc;
}

/* CONTENEDORES */
.contenedor-checkout {
  display: flex;
  gap: 30px;
  padding: 30px;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
}

.productos-lista {
  flex: 2;
  min-width: 60%;
}

/* PRODUCTO */
.producto-item {
  background: #fff;
  padding: 20px;
  margin-bottom: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  width: 100%;
}

.info-producto {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.info-producto img {
  width: 180px;
  height: 180px;
  border-radius: 10px;
  object-fit: cover;
  background-color: #eee;
}

.detalle {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.acciones {
  margin-top: 10px;
  display: flex;
  gap: 15px;
}

/* RESUMEN */
.resumen-pedido {
  flex: 1;
  min-width: 280px;
  position: sticky;
  top: 100px;
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  height: fit-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.resumen-pedido p {
  margin: 10px 0;
  font-size: 1.1em;
  color: #333;
}

.resumen-pedido h3 {
  margin-bottom: 20px;
}

.resumen-boton {
  width: 100%;
  margin-top: 15px;
}

.nota {
  font-size: 0.9em;
  color: #777;
  margin-top: 10px;
}

/* BOTONES */
.botn {
  background-color: green;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.botn:hover {
  background-color: darkgreen;
}

.btn {
  background-color: red;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: darkred;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .contenedor-checkout {
    flex-direction: column;
    padding: 20px;
  }

  .productos-lista {
    width: 100%;
  }

  .resumen-pedido {
    position: static;
    width: 100%;
    margin-top: 20px;
  }

  .info-producto {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-producto img {
    width: 100%;
    height: auto;
  }

  .acciones {
    justify-content: center;
  }
}

/* FOOTER */
.footer {
  background-color: #333; /* Gris oscuro */
  color: white;
  padding: 20px;
  text-align: center;
}

.box-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.box-footer {
  max-width: 300px;
}

.box-footer h3 {
  color: red; /* Títulos en rojo */
  font-size: 20px;
  margin-bottom: 10px;
}

.box-footer p {
  font-size: 14px;
  line-height: 1.5;
}

</style>