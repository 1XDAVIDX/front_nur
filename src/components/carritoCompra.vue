<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  setup() {
    const decode = JSON.parse(localStorage.getItem('access_token'));
    const idusuario = decode.id_usuario;
    const router = useRouter();
    const pedido = ref([]);

    const facturapedido = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/carritoProductos');
        pedido.value = respuesta.data;
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

    return {
      pedido,
      onQuitar,
      onComprar,
      router,
      comprarMultiple,
    };
  },
};

</script>
<template>
  <div class="box">
    <nav class="navbar">
      <ul>
        <li><button type="button" @click="router.go(-1)" id="x">INICIO</button></li>
      </ul>
    </nav>

    <h2>¡Tus compras!</h2>

    <section class="section-products" id="products">
      <div class="contenedor-checkout">
        <!-- Columna izquierda: productos -->
        <div class="productos-lista">
          <h3>Carrito de Compras</h3>
          <ul>
            <li v-for="i in pedido" :key="i" class="producto-item">
              <div class="info-producto">
                <img src="https://placekitten.com/150/150" alt="Producto" />
                <div class="detalle">
                  <p><b>ID Compra:</b> {{ i.id_carrito }}</p>
                  <p><b>ID Usuario:</b> {{ i.id_usuario }}</p>
                  <p><b>ID Producto:</b> {{ i.id_producto }}</p>
                  <p><b>Cantidad:</b> {{ i.cantidad }}</p>
                  <p><b>Total:</b> ${{ i.total }}</p>
                  <div class="acciones">
                    <button class="btn" @click="onQuitar(i.id_carrito)">🗑</button>
                    <button class="botn" @click="onComprar(i.id_producto, i.cantidad, i.id_carrito)">Comprar</button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Columna derecha: resumen -->
        <div class="resumen-pedido">
          <h3>Resumen del Pedido</h3>
          <p><strong>Productos en carrito:</strong> {{ pedido.length }}</p>
          <p><strong>Total general:</strong> ${{ calcularTotal }}</p>
          <button class="botn resumen-boton" @click="comprarMultiple">Comprar todos</button>
          <p class="nota">No se cobrará hasta confirmar en la siguiente página</p>
        </div>
      </div>
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

/* NAVBAR */
.navbar {
  background-color: #333;
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.navbar ul {
  display: flex;
  justify-content: center;
  gap: 20px;
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