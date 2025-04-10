<template>
  <nav class="navbar">
      <ul>
        
        <li><router-link to="/registroUsuario">Crear cuenta</router-link></li>
        <li><router-link to="/pruebaLogin">Ingresar</router-link></li>
        

        <div>
          <span id="hamburguesa" @click="toggleMenu" class="far fa-user-circle"> </span>
          <nav :class="['menuHamburguesa', { openHamburguesa: menuAbierto }]">
            <span id="cerrarHamburguesa" @click="toggleMenu">&#128938;</span>
            <ul >
              <li id="libienvenido">¡Bienvenido!</li>
              <li class="infocliente">{{ nombreUsuario }}</li>


              <li id="lilinea">-----------------------------------------</li>
              <li class="lihamburguesa"><router-link to="/registroProducto">Registrar Producto</router-link></li>
              
              <li class="lihamburguesa"><router-link to="/modificarProducto">Modificar Producto</router-link></li>
              <li class="lihamburguesa"><router-link to="/eliminarProducto">Eliminar Producto</router-link></li>
              <li class="lihamburguesa"><router-link to="/inventario">Producto Despachados</router-link></li>
              <li class="lihamburguesa"><router-link to="/registroUsuario">Crear cuenta</router-link></li>
              <li class="lihamburguesa"><router-link to="/pruebaLogin">Ingresar Usuario</router-link></li>
             
             
              <li id="lilinea">-----------------------------------------</li>

              <!--<li class="infocliente">{{ nombreUsuario }}<br> {{ emailUsuario }}</li>-->
            </ul>
          </nav>
        </div>


      </ul>
    </nav>
  <div class="detalle-container">
    <!-- Sección del Producto (80%) -->
    <div class="detalle-producto">
      <div class="detalle-imagen">
        <img :src="getImagenUrl(producto.imagen)" alt="Imagen del producto">
      </div>
      <div class="detalle-info">
        <h1>{{ producto.nombre }}</h1>
        <p class="descripcion">{{ producto.descripcion }}</p>
        <p class="stock">Stock: <strong>{{ producto.stock }}</strong></p>
        <p class="precio">Precio: <strong>${{ producto.precio }}</strong></p>
       

        <div class="stock-control">
          <button type="button" @click="decrementarCantidad(producto)">-</button>
          <input v-model="producto.cantidadProducto" type="number" min="1" step="1" required>
          <button type="button" @click="incrementarCantidad(producto)">+</button>
        </div>

        <div class="botones">
          <button class="btn btn-carrito" @click="carritoCompra(producto)">🛒 Agregar al Carrito</button>
          <button class="btn btn-whatsapp" @click="enviarMensajeWhatsapp(producto.nombre)">📲 WhatsApp</button>
        </div>
      </div>
        <!-- Sección de Tarjeta (20%) -->
        <div class="detalle-pago">
          <h2>Pago con Tarjeta</h2>
          <div class="tarjeta-simulada">
            <div class="banco">
              <label>Banco</label>
              <input  type="text" placeholder="Banco" required>
            </div>
            <div class="numero">
              <label>numero</label>
              <input  type="text" placeholder="Número de Tarjeta" maxlength="16" required>
            </div>
            <div class="titular">
              <label>titular</label>
              <input  type="text" placeholder="Nombre del Titular" required>
            </div>
            <div class="fila">
              <div class="vencimiento">
                <label>vencimiento</label>
                <input  type="text" placeholder="MM/YY" maxlength="5" required>
              </div>
              <div class="cvv">
                <label>cvv</label>
                <input  type="text" placeholder="CVV" maxlength="3" required>
              </div>
            </div>
          </div>
          <button class="btn btn-comprar" @click="comprar(producto)">💳 Comprar</button>
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


    <div class="box">
      
      <section class="section-products" id="products">
        <div class="contenedor-sobre-nosotros">
          <div class="cards">
            <ul>
              <li v-for="producto in productosSimilares" :key="producto.id_producto" class="card" @click="irACasa(producto)">
                <div class="card-content">
                  <button class="btn" @click.stop="onModificar(producto.id_producto)">✏️</button>
                  <button class="btn" @click.stop="onEliminar(producto.id_producto)">🗑️</button>
                  <div class="imagen">
                    <img :src="getImagenUrl(producto.imagen)" alt="Imagen">
                  </div>
                  <strong>ID:</strong> {{ producto.id_producto }}<br>
                  <strong>Nombre:</strong> {{ producto.nombre }}<br>
                  <strong>Descripción:</strong> {{ producto.descripcion }}<br>
                  <strong>Precio:</strong> ${{ producto.precio.toFixed(2) }}<br>
                  <strong>Stock:</strong> {{ producto.stock }}<br>
                  <div class="stock-control">
                    <button type="button" @click.stop="decrementarCantidad(producto)">-</button>
                    <input v-model="producto.cantidadProducto" type="number" min="1" step="1" required>
                    <button type="button" @click.stop="incrementarCantidad(producto)">+</button>
                  </div>
                  <button class="btn" @click.stop="comprar(producto)">Compra</button>
                  <button class="btn" @click.stop="carritoCompra(producto)">🛒</button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
    </div>

    

    <section class="location" id="location">
      <h2>¿Dónde Estamos?</h2>
      <p>
        Estamos ubicados en la calle 123, en el corazón de la ciudad. Visítanos para obtener asesoría personalizada y conocer nuestros productos de primera mano. También ofrecemos servicio de entrega a domicilio en toda la ciudad.
      </p>
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
    

    
  
</template>


<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import router from './routers/misrutas';
import { watch } from 'vue';

export default {
  data(){
    return {
        menuAbierto: false,
        
      };
  },
  methods:{
    irACasa(producto) {
        this.$router.push({ path: '/casa', query: { id: producto.id_producto } });
        
      },
      toggleMenu() {
        this.menuAbierto = !this.menuAbierto;
      },
  },
  setup() {
    const memoria = JSON.parse(localStorage.getItem('access_token'))
    const route = useRoute();
    const router = useRouter();
    const producto = ref({});
    
    const cantidad = ref(1);

    const categoriaProducto =ref("");
    const productosSimilares = ref([]);

    // Función para enviar mensaje de WhatsApp
    function enviarMensajeWhatsapp(productoNombre) {
      const numero = "573508381030";
      const mensaje =encodeURIComponent("Hola, quiero Más información sobre el producto: " + productoNombre);
      const url = `https://wa.me/${numero}?text=${mensaje}`;
      window.open(url, "_blank");
    }
    
    
    // Algoritmo para encontrar productos similares
    const productoAlgoritmo = async () => {
      try {
        
        const respuesta = await axios.get('http://127.0.0.1:8000/consultarProductos');

        
        const productoClasificado = respuesta.data.filter(
          (p) => p.categotia === categoriaProducto.value && p.id_producto !== producto.value.id_producto
        );

        if (productoClasificado.length > 0) {
          productosSimilares.value = productoClasificado;
          productosSimilares.value.forEach((p) => {
            p.cantidadProducto = 1;
          });
        } else {
          console.warn("No se encontraron productos similares.");
        }
      } catch (error) {
        console.error("Error en productoAlgoritmo:", error);
      }
    };
 
    // producto seleccionado
    const fetchProducto = async (id) => {
      try {
        console.log("id:", id);
        const respuesta = await axios.get('http://127.0.0.1:8000/consultarProductos');
        
        // Buscar el producto correcto en el array
        const productoEncontrado = respuesta.data.find(p => p.id_producto == id); 

        if (productoEncontrado) {
          producto.value = productoEncontrado; 
          producto.value.cantidadProducto = 1;
         
          categoriaProducto.value = producto.value.categotia; 
          

          // Llamar a productoAlgoritmo después de asignar la categoría
          await productoAlgoritmo();
          
        } else {
          console.error("Producto no encontrado");
        }
      } catch (error) {
        console.error("Error fetching producto:", error);
      }
    };

    // incrementar y decrementar cantidad
    const incrementarCantidad = ( producto ) =>{
      producto.cantidadProducto++;
    }
    const decrementarCantidad= ( producto ) =>{
      if(producto.cantidadProducto > 1){
        producto.cantidadProducto--;
      }
    }

    // comprar producto 
    const idlocalestore = memoria?.id_usuario;

    const comprar = async (producto) => {
      try {
        const compraProducto = {
          id_producto: producto.id_producto,
          id_usuario: idlocalestore,
          cantidad: producto.cantidadProducto,
        };

        const respuesta = await axios.post("http://127.0.0.1:8000/compra", compraProducto);
        Swal.fire({
          icon: "success",
          title: "Compra Exitosa",
          html: `
            <b>ID Compra:</b> ${respuesta.data.id_compra} <br>
            <b>ID Producto:</b> ${respuesta.data.id_producto} <br>
            <b>Nombre Producto:</b> ${respuesta.data.nombre_producto} <br>
            <b>Descripción:</b> ${respuesta.data.descripcion} <br>
            <b>Precio:</b> ${respuesta.data.precio} <br>
            <b>Stock:</b> ${respuesta.data.stock} <br>
            <b>Total:</b> ${respuesta.data.total}
          `,
        }).then(()=> { router.go(0);});
      } catch (error) {
        Swal.fire({
          icon: "error",
          text: "Error al comprar",
          html: `
           
            <b>Stock:</b> ${producto.cantidadProducto} <br>
            
          `,
        });
      }
    };

    const carritoCompra = async (producto)=>{
            
            try {
                    const carritoCompra = ref({
                      id_producto: producto.id_producto,
                      id_usuario: idlocalestore,
                      cantidad: producto.cantidadProducto,
                    })
                      const respuesta =await axios.post("http://127.0.0.1:8000/carrito", carritoCompra.value);
                      Swal.fire({
                          icon:"success",
                         
                          
                      })
            } catch (error) {
                      Swal.fire({
                          icon:"error",
                          text:"Error al comprar"
              })
            }
    }
      


    const onAgregarCarrito = (productoId) =>{
      router.push({ path: '/agregarCarrito', query: { productoId: productoId } });
    }

    const getImagenUrl = (path) => {
      return `http://127.0.0.1:8000/${path}`;
    };
    const onEliminar = (productoId)=>{
      router.push({path:'/eliminarProducto', query: {productoId: productoId}})
    }
    const onModificar = (productoId)=>{
      router.push({path:'/modificarProducto', query: {productoId: productoId}})
    }

    onMounted(() => {
      const id = route.query.id;
      console.log("id:",id);
      if (id) {
        fetchProducto(id);
      }
      
    });

    watch(
      () => route.query.id,
        (newId) => {
          if (newId) {
            fetchProducto(newId);
          }
        },
        { immediate: true } // Ejecutar inmediatamente al montar el componente
    );

    return {
      producto,
      cantidad,
      incrementarCantidad,
      decrementarCantidad,
      comprar,
      onAgregarCarrito,
      getImagenUrl,
      productosSimilares,
      enviarMensajeWhatsapp,
      carritoCompra,
      onEliminar,
      onModificar
    };
  }
};
</script>



<style scoped>

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

.credit {
  margin-top: 20px;
  font-size: 14px;
  opacity: 0.8;
}
/* Diseño principal */
.detalle-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  width: 100%;
}

/* Sección del Producto (80%) */
.detalle-producto {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30px;
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
}

.detalle-imagen img {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  border-radius: 10px;
}

.detalle-info {
  flex: 1;
  text-align: left; /* Alinea todo el texto a la izquierda */
  
}

.detalle-info h1 {
  font-size: 26px; /* Aumenta el tamaño del nombre */
  font-weight: bold;
  margin-bottom: 15px;
}

.descripcion {
  font-size: 18px; /* Aumenta el tamaño de la descripción */
  color: #444;
  margin-bottom: 15px;
  
  text-align: start;
  height: 100px;
}

.precio, .stock {
  font-size: 20px; /* Aumenta el tamaño del precio y stock */
  font-weight: bold;
  margin-bottom: 10px;
  
  text-align: start;
}

/* Controles de stock */
.stock-control {
  display: flex;
  align-items: right;
  margin: 15px 0;
}

.stock-control button {
  background-color: #ddab08;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.3s;
}

.stock-control button:hover {
  background-color: #dd0808;
}

.stock-control input {
  width: 50px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  font-size: 16px;
  margin: 0 5px;
}

/* Botones */
.botones {
  margin-top: 15px;
}

.btn {
  border: none;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.3s;
}

.btn-carrito {
  background-color: #007bff;
  color: white;
}

.btn-carrito:hover {
  background-color: #0056b3;
}

.btn-whatsapp {
  background-color: #25D366;
  color: white;
  margin-left: 10px;
}

.btn-whatsapp:hover {
  background-color: #1EBE57;
}






/* Sección de Pago (20%) */
.detalle-pago {
  width: 25%;
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.detalle-pago h2 {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* Tarjeta Simulada */
.tarjeta-simulada {
  width: 100%;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: "Arial", sans-serif;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}


.tarjeta-simulada input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}




/* Botón de compra */
.btn-comprar {
  width: 100%;
  background-color: #28a745;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 15px;
}

.btn-comprar:hover {
  background-color: #218838;
}
.tarjeta-simulada label {
  display: block; /* Hace que el label ocupe toda la línea */
  text-align: left; /* Alinea el texto del label a la izquierda */
  margin-bottom: 3px; /* Espacio entre el label y el input */
  font-weight: bold; /* Resalta los labels */
  font-size: 14px; /* Ajusta el tamaño del label */
}

/* Estilos para los inputs */
.tarjeta-simulada input {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-align: left; /* Asegura que el texto dentro del input esté alineado a la izquierda */
}

/* Ajuste de filas para vencimiento y CVV */
.fila {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.fila div {
  flex: 1;
}



</style>