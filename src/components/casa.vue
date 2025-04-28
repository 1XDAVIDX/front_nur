<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
      <!-- Buscador estilizado -->
      <li class="contenedor-buscador">
        <form @submit.prevent="realizarBusqueda" class="form-buscador">
          <input
            type="text"
            v-model="busquedaBarra"
            placeholder="Buscar productos..."
            class="input-buscador"
          />
          <button type="submit" class="boton-buscador"><i class="fas fa-search"></i></button>
        </form>
      </li>
    </div>
      <!-- DERECHA: Notificaciones, WhatsApp y Menú -->
  <div class="navbar-right">
    <li class="li_dos contenedor-notificaciones">
        <button @click="mostrarNotificaciones = !mostrarNotificaciones" class="btn-notificaciones">
          <i class="fas fa-bell"></i>
        </button>

        <div v-if="mostrarNotificaciones" class="nube-notificaciones">
          <h3>🔔 Notificaciones</h3>

          <ul>
            <!-- Mensajes simples -->
            <li v-for="(mensaje, index) in mensajes" :key="'mensaje-' + index">
              {{ mensaje }}
            </li>
          </ul>

          <!-- Productos enviados desde API -->
          <div class="productos-stock" v-if="inventario.length > 0">
            <div class="productos-casi-agotados">
              <h3>📦 Productos Enviados</h3>
              <ul>
                <li v-for="i in inventario" :key="i.id_producto">
                  <strong>Nombre:</strong> {{ i.nombre_producto }}<br />
                  <strong>Fecha de envío:</strong> {{ i.fecha }}<br />
                  <strong>Estado:</strong> {{ i.estado }}<br />
                  <strong>Guía Transporte:</strong> {{ i.guiaTranporte }}<br />
                </li>
              </ul>
            </div>
          </div>

          <div v-if="mensajes.length === 0 && inventario.length === 0">
            <p>No hay notificaciones nuevas 🔕</p>
          </div>
        </div>
      </li>

    <router-link to="/whasappControl" class="icono-link">
      <i class="fab fa-whatsapp"></i>
    </router-link>

    <!-- Menú Hamburguesa -->
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
    </div>
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
      <p v-if="producto.categotia === 'accesorios' " class="stock">Tallas:
        <span 
          v-for="talla in tallas" 
          :key="talla" 
          @click="seleccionarTalla(talla)"
          :class="{ seleccionada: talla === tallaSeleccionada }"
          class="talla-item"
        >
          {{ talla }}
        </span>
      </p>
      <p class="stock">Disponibles: <strong>{{ producto.stock }}</strong></p>
      <p class="stock">Categoria: <strong>{{ producto.categotia }}</strong></p>
      <p class="precio">Precio: <strong>{{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(producto.precio) }}</strong></p>
     

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
          
          <div class="numero">
            <label>numero</label>
            <input  type="text" v-model="datosTarjeta.tarjetaCredito" placeholder="Número de Tarjeta" maxlength="16" required>
          </div>
          <div class="titular">
            <label>titular</label>
            <input  type="text"  v-model="datosTarjeta.nombre" placeholder="Nombre del Titular" required>
          </div>
          <div class="fila">
            <div class="vencimiento">
              <label>vencimiento</label>
              <input  type="text" v-model="datosTarjeta.vencimiento" placeholder="MM/YY" maxlength="5" required>
            </div>
            <div class="cvv">
              <label>cvv</label>
              <input  type="text" v-model="datosTarjeta.cvv" placeholder="CVV" maxlength="3" required>
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
                <button v-if="rolUsuario === 'admin'" class="btn" @click.stop="onModificar(producto.id_producto)">✏️</button>
                <button v-if="rolUsuario === 'admin'" class="btn" @click.stop="onEliminar(producto.id_producto)">🗑️</button>
                <div class="imagen">
                  <img :src="getImagenUrl(producto.imagen)" alt="Imagen">
                </div>
                <strong>ID:</strong> {{ producto.id_producto }}<br>
                <strong>Nombre:</strong> {{ producto.nombre }}<br>
                <strong>Descripción:</strong> {{ producto.descripcion }}<br>
                <strong> Precio: </strong> {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(producto.precio) }}<br>
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
    <!-- Controles de paginación -->
    <div class="paginacion">
      <button
        @click="cambiarPaginaSimilares(paginaActualSimilares - 1)"
        :disabled="paginaActualSimilares === 1"
        class="boton-paginacion"
      >
        ⬅ Anterior
      </button>
      <button
        v-for="pagina in totalPaginasSimilares"
        :key="pagina"
        @click="cambiarPaginaSimilares(pagina)"
        :class="['boton-paginacion', { activo: pagina === paginaActualSimilares }]"
      >
        {{ pagina }}
      </button>
      <button
        @click="cambiarPaginaSimilares(paginaActualSimilares + 1)"
        :disabled="paginaActualSimilares === totalPaginasSimilares"
        class="boton-paginacion"
      >
        Siguiente ➡
      </button>
    </div>
    
    
  </div>

  

  <div class="espacio"></div>


  <footer class="footer-mascotas">
    <div class="contenedor-footer">
      <div class="col-footer logo-info">
        <h2><span class="logo-icon">🐾</span>Mascotas</h2>
        <p>
          Somos amantes de las mascotas, ofreciendo productos de calidad para su bienestar.
          Con más de 10 años acompañando a miles de hogares con accesorios, ropa y juguetes para tus peludos.
        </p>
        
      </div>

      <div class="col-footer">
        <h4>TIENDA</h4>
        <ul>
          <li><a href="#">Todas las categorías</a></li>
          <li><a href="#">Accesorios</a></li>
          <li><a href="#">Ropa</a></li>
          <li><a href="#">Juguetes</a></li>
          <li><a href="#">Ofertas</a></li>
        </ul>
      </div>

      <div class="col-footer">
        <h4>INFORMACIÓN</h4>
        <ul>
          <li><a href="#">Políticas de privacidad</a></li>
          <li><a href="#">Términos y condiciones</a></li>
          <li><a href="#">Preguntas frecuentes</a></li>
          <li><a href="#">Reclamos y sugerencias</a></li>
        </ul>
      </div>

      <div class="col-footer">
        <h4>CONTACTO</h4>
        <ul>
          <li>📧 contacto@petzone.com</li>
          <li>📞 311 555 8899</li>
          <li>📍 Calle 12 #34-56, Medellín</li>
        </ul>
        <div class="redes-sociales">
          <a href="#"><img src="./img/youtube.jpg" alt="YouTube" /></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384053.png" alt="Facebook" /></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" alt="Instagram" /></a>
        </div>
      </div>
    </div>
  </footer>

</template>


<script>
import axios from 'axios';
import { ref, onMounted,computed } from 'vue';
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
  const rolUsuario = memoria?.rol
  const cantidad = ref(1);

  const categoriaProducto =ref("");
  const productosSimilares = ref([]);

  



  

  

  // Función para enviar mensaje de WhatsApp
  function enviarMensajeWhatsapp(productoNombre) {
    const numero = "573123848279";
    const mensaje =encodeURIComponent("tienes el producto" + productoNombre);
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
  }
  
  const data = ref([]);
  // Algoritmo para encontrar productos similares
  const productoAlgoritmo = async () => {
    try {
      
      const respuesta = await axios.get('http://127.0.0.1:8000/consultarProductos');
      data.value = respuesta.data; // Guardar todos los productos en data
      
      
      const productoClasificado = respuesta.data.filter(
        (p) => p.categotia === categoriaProducto.value && p.id_producto !== producto.value.id_producto
      );

      if (productoClasificado.length > 0) {
        productosSimilares.value = productoClasificado;
        productosSimilares.value.forEach((p) => {
          p.cantidadProducto = 1;
        });

        actualizarPaginadoProductos();

      
      } else {
        console.warn("No se encontraron productos similares.");
      }
    } catch (error) {
      console.error("Error en productoAlgoritmo:", error);
    }
  };
  
  const busquedaBarra = ref('');
  const realizarBusqueda = () => {
    console.log("Texto de búsqueda:", busquedaBarra.value);
    fetchProducto(); 
  };
  // producto seleccionado
  const fetchProducto = async (id) => {
    try {
      console.log("id:", id);
      const respuesta = await axios.get('http://127.0.0.1:8000/consultarProductos');
      const productos = respuesta.data;
      

      let productoEncontrado;
      
      if (busquedaBarra.value.trim() === '') {
        
        productoEncontrado = productos.find(p => p.id_producto == id);
        busquedaBarra.value= ''; 
      } else {
        
        productoEncontrado = productos.find(p => p.nombre.toLowerCase().includes(busquedaBarra.value.toLowerCase()));
        busquedaBarra.value= ''; 
      }
      
      // Buscar el producto correcto en el array
      //const productoEncontrado = respuesta.data.find(p => p.id_producto == id); 

      //const productoEncontrado = respuesta.data.find(p => p.nombre == id); 

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
  const datosTarjeta = ref({
    nombre: memoria?.nombre,
    tarjetaCredito: memoria?.tarjetaCredito,
    vencimiento: "",
    cvv: ""
  });

  const comprar = async (producto) => {
    const { tarjetaCredito, nombre, vencimiento, cvv } = datosTarjeta.value;

    if (!tarjetaCredito || !nombre || !vencimiento || !cvv) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos antes de continuar.',
      });
      return;
    }
    try {
      const compraProducto = {
        id_producto: producto.id_producto,
        id_usuario: idlocalestore,
        cantidad: producto.cantidadProducto,
      };
      Swal.fire({
                title: "Procesando...",
                text: "Por favor, espera mientras procesamos tu pedido.",
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading(); 
                },
      });

      const respuesta = await axios.post("http://127.0.0.1:8000/compra", compraProducto);
      Swal.fire({
        icon: "success",
        title: "Compra Exitosa",
        text:"Revisa tu bandeja de correo para ver el detalle de tu compra, en la notificaciones  estan detalles de tu envio",
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
    datosInventario();
    
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
  const cerrarSesion = () => {
      Swal.fire({
        title: 'Cerrando sesión...',
       
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        localStorage.clear();
        sessionStorage.clear();
        router.push({ path: '/cliente' }).then(() => {
          location.reload();
        });
      });
    };

  const tallas = ref(["XS", "S", "M", "L", "XL"]); // Lista de tallas
  const tallaSeleccionada = ref(""); // Talla seleccionada

  const seleccionarTalla = (talla) => {
    tallaSeleccionada.value = talla; // Actualiza la talla seleccionada
  };

  const inventario = ref([]);
  const mostrarNotificaciones = ref(false);
  const mensajes = ref(["Hola 👋"]); // Puedes cambiarlo por tus propios mensajes

   

  const datosInventario = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/compraTerminado');
        inventario.value = respuesta.data.filter(item => item.id_usuario === idlocalestore);
      } catch (error) {
        console.log("No se cargaron los datos ", error);
      }
  };

  const productosPorPaginaSimilares = 1; // Número de productos por página
  const paginaActualSimilares = ref(1); // Página actual
  const productosPaginadosSimilares = ref([]); // Productos que se mostrarán en la página actual

    // Total de páginas calculado dinámicamente
    const totalPaginasSimilares = computed(() =>
      Math.ceil(productosSimilares.value.length / productosPorPaginaSimilares)
    );

    // Función para actualizar los productos paginados
    const actualizarPaginadoSimilares = () => {
      const inicio = (paginaActualSimilares.value - 1) * productosPorPaginaSimilares;
      const fin = inicio + productosPorPaginaSimilares;
      productosPaginadosSimilares.value = productosSimilares.value.slice(inicio, fin);
    };

    // Función para cambiar de página
    const cambiarPaginaSimilares = (nuevaPagina) => {
      if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasSimilares.value) {
        paginaActualSimilares.value = nuevaPagina;
        actualizarPaginadoSimilares();
      }
    };

  return {
    productosPaginadosSimilares, // Retorna los productos similares paginados
    paginaActualSimilares, // Retorna la página actual de productos similares
    totalPaginasSimilares, // Retorna el total de páginas de productos similares
    cambiarPaginaSimilares,
    inventario,
    mensajes,
    mostrarNotificaciones,
    tallas,
    tallaSeleccionada,
    seleccionarTalla,
    cerrarSesion,
    rolUsuario,
    datosTarjeta,
    memoria,
    realizarBusqueda,
    busquedaBarra,
    
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

.contenedor-buscador {
  display: flex;
  justify-content: center; /* Centra horizontalmente */
  align-items: center; /* Centra verticalmente */
  margin: 0 auto; /* Centra el contenedor en la página */
  width: 100%; /* Asegura que ocupe todo el ancho disponible */
}

.form-buscador {
  display: flex;
  background-color: #f1f1f1;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  max-width: 600px; /* Ajusta el ancho máximo del buscador */
  width: 100%; /* Asegura que ocupe todo el ancho disponible */
}

.input-buscador {
  flex: 1;
  padding: 10px 15px;
  border: none;
  outline: none;
  font-size: 15px;
  background-color: transparent;
}

.boton-buscador {
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.boton-buscador:hover {
  background-color: #0056b3;
}

/* Elimina los estilos predeterminados de listas */
.navbar-left ul,
.navbar-left li {
  list-style: none; /* Elimina los puntos de las listas */
  padding: 0;
  margin: 0;
}
.espacio{
  height: 50px;
}
.footer-mascotas {
  background-color: #333;
  color: #fff;
  padding: 40px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 17px;
}

.contenedor-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: auto;
  gap: 30px;
}

.col-footer {
  flex: 1;
  min-width: 220px;
}

.col-footer h4{
  font-size: 18px;
  border-bottom: 2px solid #d32f2f;
  display: inline-block;
  margin-bottom: 15px;
  color: #fff;
}

.col-footer ul {
  list-style: none;
  padding: 0;
}

.col-footer ul li {
  margin-bottom: 12px;
  font-size: 22px;
}

.col-footer ul li a, p {
  color: #ffffff;
  text-decoration: none;
  font-size: 20px;
}

.col-footer ul li a:hover {
  color: #fff;
}

.logo-info h2{
  font-size: 26px;
  margin-bottom: 12px;
  color: #fff;
  padding: 0px 30px;
}

.logo-icon {
  font-size: 30px;
  margin-right: 6px;
}

.btn-ubicacion {
  margin-top: 20px;
  padding: 12px 22px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
}

.redes-sociales a {
  display: inline-block;
  margin-right: 12px;
}

.redes-sociales img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}


.tallas {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.talla-item {
  padding: 10px 15px;
  border: 2px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.talla-item:hover {
  border-color: #007bff;
  background-color: #e6f0ff;
}

.talla-item.seleccionada {
  border-color: black;
  background-color: #d9d9d9;
  font-weight: bold;
}

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

.navbar-left {
display: flex;
align-items: center;
gap: 10px;

}
/* DERECHA */
.navbar-right {
display: flex;
align-items: center;
gap: 20px;
margin-right:80px;
margin-top: 0.5%;
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

/* Buscador */
.form-buscador {
display: flex;
background-color: #f1f1f1;
border-radius: 25px;
overflow: hidden;
box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
max-width: 400px;
}

.input-buscador {
flex: 1;
padding: 10px 15px;
border: none;
outline: none;
font-size: 15px;
background-color: transparent;
}

.boton-buscador {
padding: 10px 20px;
border: none;
background-color: #007bff;
color: white;
font-size: 16px;
cursor: pointer;
transition: background 0.3s;
}

.boton-buscador:hover {
background-color: #0056b3;
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
color: #333;
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
width: 26%;
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