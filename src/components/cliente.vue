<script>
import axios from 'axios';
import { ref, onMounted,computed  } from 'vue';
import { useRouter } from 'vue-router';
import GraficoPastel from "@/components/GraficoPastel.vue"; 
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
  
  components: { 
    GraficoPastel  
  },
  data(){
    return {
        menuAbierto: false,
        modalAbierto: false,
        productoSeleccionado: null
        
      };
  },
  methods: {
    
      irACasa(producto) {
        this.$router.push({ path: '/casa', query: { id: producto.id_producto } });
      },
      toggleMenu() {
        this.menuAbierto = !this.menuAbierto;
      },
      abrirModal(producto) {
        this.productoSeleccionado = producto;
        this.modalAbierto = true;
      },

      cerrarModal() {
        this.modalAbierto = false;
      }
    },
  setup() {
    
    const memoria = JSON.parse(localStorage.getItem('access_token'))
    const idlocalestore = memoria?.id_usuario;
    const nombreUsuario = memoria?.nombre
    const emailUsuario = memoria?.email
    const router = useRouter();
    const data = ref([]);
    
    

    
    // Consultar productos comprados de la base de datos
    const pedido = ref({});
    const usuariosPaginados = ref([]);
    const paginaActual = ref(1);
    const usuariosPorPagina = 1;

    const totalPaginas = computed(() =>
      Math.ceil(Object.keys(pedido.value).length / usuariosPorPagina)
    );

    const actualizarPaginado = () => {
      const usuarios = Object.entries(pedido.value);
      const inicio = (paginaActual.value - 1) * usuariosPorPagina;
      const fin = inicio + usuariosPorPagina;
      usuariosPaginados.value = usuarios.slice(inicio, fin);
    };

    const facturapedido = async () => {
      try {
        const respuesta = await axios.get("http://127.0.0.1:8000/compra");
        const compras = respuesta.data;

        const comprasAgrupadas = compras.reduce((acc, compra) => {
          if (!acc[compra.id_usuario]) {
            acc[compra.id_usuario] = [];
          }
          acc[compra.id_usuario].push(compra);
          return acc;
        }, {});

        pedido.value = comprasAgrupadas;
        actualizarPaginado();
      } catch (error) {
        console.log("No se cargaron los datos", error);
      }
    };

    const cambiarPagina = (nuevaPagina) => {
      if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas.value) {
        paginaActual.value = nuevaPagina;
        actualizarPaginado();
      }
    };

    // despachar pedido
    const factura = ref({})

    const pedidoHecho = async (id_compra, id_usuario) =>{
            try {
              const respuesta =await axios.delete(`http://127.0.0.1:8000/completada/${id_compra}/${id_usuario}`);
              factura.value = respuesta.data
              console.log("ok",factura.value)
              Swal.fire({
                  icon:"success",
                  title:"Pedido Hecho",
                  text:`Producto: ${factura.value.id_producto} Cantidad:${factura.value.cantidad} Total:${factura.value.total}\nID compra:${factura.value.id_compra} ID Usuario:${factura.value.id_usuario} Nombre:${factura.value.nombre}`
              }).then(() =>{
                router.go(0);
              })
              

            } catch (error) {
                Swal.fire({
                    icon:"error",
                    title:"Datos no son correctos"
                })
            }
    }
    // despachar pedido multiple
    const facturaultiple = ref({})

    const pedidoHechoMultiple = async (id_usuario) => {
      try {
        const respuesta = await axios.delete(`http://127.0.0.1:8000/completadas/${id_usuario}`);
        facturaultiple.value = respuesta.data;
    
        // Actualizar dinámicamente la lista de compras
        delete pedido.value[id_usuario];
    
        if (facturaultiple.value && facturaultiple.value.compras_completadas) {
           Swal.fire({
             icon: "success",
             title: "Pedido Hecho",
             html: `
               <b>Productos Completados:</b> ${facturaultiple.value.compras_completadas
                 .map(c => `${c.nombre_producto} (ID: ${c.id_producto})`)
                 .join(", ")}<br>
               <b>Total:</b> $${facturaultiple.value.compras_completadas
                 .reduce((sum, c) => sum + c.total, 0)
                 .toLocaleString()}
             `
           });
        } else {
           console.error("La respuesta no contiene compras_completadas:", facturaultiple.value);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Datos no son correctos",
          text: error.response?.data?.detail || "Error desconocido"
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

    const onEliminar = async (id) => {
      const resultado = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará el producto de forma permanente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (resultado.isConfirmed) {
        try {
          const respuesta = await axios.delete(`http://127.0.0.1:8000/eliminar/${id}`);
          Swal.fire({
            icon: 'success',
            title: '¡Producto eliminado!',
            text: respuesta.data.message || 'El producto fue eliminado correctamente.'
          });

          // Si necesitas recargar productos después:
          //await cargarProductos();
        } catch (error) {
          console.error("Error al eliminar:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el producto.'
          });
        }
      }
    };

    // comprar producto 
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
          text: "AQui"
        });
      }
    };
    // apache pie grafico
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
    // boton de whatsapp
    function enviarMensajeWhatsapp() {
      const numero = "573508381030";
      const mensaje =encodeURIComponent("Hola, quiero ver el catalogo");
      const url = `https://wa.me/${numero}?text=${mensaje}`;
      window.open(url, "_blank");
    }

    // modal usuario
    const modalUsuarioAbierto = ref(false); // Controla si el modal está abierto
    const datosUsuario = ref({}); // Almacena los datos del usuario
    const abrirModalUsuario = () => {
      datosUsuario.value = {
        nombre: nombreUsuario,
        email: emailUsuario,
        id: idlocalestore,
      };
      modalUsuarioAbierto.value = true;
    };
    const cerrarModalUsuario = () => {
      modalUsuarioAbierto.value = false;
    };
    
    // categorias
    const categorias = ref(['Todos', 'Alimentos', 'accesorios', 'juguetes']);
    const categoriaSeleccionada = ref('Todos');
    const seleccionarCategoria = (categoria) => {
      categoriaSeleccionada.value = categoria;
      consultaProducto();
    };
    // Variables reactivas
    const productosPorPagina = 6; // Número de productos por página
    const paginaActualProductos = ref(1); // Página actual
    const productosPaginados = ref([]); // Productos que se mostrarán en la página actual
    // Total de páginas calculado dinámicamente
    const totalPaginasProductos = computed(() =>
      Math.ceil(data.value.length / productosPorPagina)
    );
    // Función para actualizar los productos paginados
    const actualizarPaginadoProductos = () => {
      const inicio = (paginaActualProductos.value - 1) * productosPorPagina;
      const fin = inicio + productosPorPagina;
      productosPaginados.value = data.value.slice(inicio, fin);
    };
    // Función para cambiar de página
    const cambiarPaginaProductos = (nuevaPagina) => {
      if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasProductos.value) {
        paginaActualProductos.value = nuevaPagina;
        actualizarPaginadoProductos();
      }
    };
    // Función para consultar productos desde la API
    const consultaProducto = async () => {
      try {
        const respuesta = await axios.get("http://127.0.0.1:8000/consultarProductos");
        data.value = respuesta.data.map((item) => ({
          ...item,
          cantidadProducto: 1, // Agregar cantidad inicial
        }));
        // Filtrar productos por categoría
        if (categoriaSeleccionada.value !== "Todos") {
          data.value = data.value.filter(
            (item) => item.categotia === categoriaSeleccionada.value
          );
        }
        actualizarPaginadoProductos(); // Actualizar los productos paginados
      } catch (error) {
        console.log("No se cargaron los datos", error);
      }
    };
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
    
    const onModificar = (productoId)=>{
      router.push({path:'/modificarProducto', query: {productoId: productoId}})
    }
    const onAgregarCarrito = (productoId) =>{
      router.push({ path: '/agregarCarrito', query: { productoId: productoId } });
    }
    //const cantidadCompra = ref(1)
    const incrementarCantidad = ( producto ) =>{
      producto.cantidadProducto++;
    }
    const decrementarCantidad= ( producto ) =>{
      if(producto.cantidadProducto > 1){
        producto.cantidadProducto--;
      }
    }

    return {
      data,
      comentarios,
      getImagenUrl,
      pedido,
      usuariosPaginados,
      paginaActual,
      totalPaginas,
      cambiarPagina, 
      facturapedido,
      productosVendidos,
      //onComprar,
      onEliminar,
      onModificar,
      nombreUsuario,
      emailUsuario,
      idlocalestore,
      modalUsuarioAbierto,
      datosUsuario,
      abrirModalUsuario,
      cerrarModalUsuario,
      enviarMensajeWhatsapp,
      categorias,
      seleccionarCategoria,
      //onAgregarCarrito,
      pedidoHecho,
      incrementarCantidad,
      decrementarCantidad,
      //cantidadCompra
      //compraProducto,
      comprar,
      carritoCompra,
      pedidoHechoMultiple,
      productosPaginados,
      paginaActualProductos,
      totalPaginasProductos,
      cambiarPaginaProductos,

    };
  }
};
</script>

<template>
    <!-- Barra de navegación secundaria -->
    <nav class="navbar">
      <ul>     
        <li><router-link to="/pruebaLogin">Crear cuenta</router-link></li>
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
              <li class="menuInfoCliente" @click="abrirModalUsuario">                USUARIO
              </li>
              <li id="lilinea">-----------------------------------------</li>
              <!--<li class="infocliente">{{ nombreUsuario }}<br> {{ emailUsuario }}</li>-->
            </ul>
          </nav>
        </div>
      </ul>
    </nav>
    <header>
      <div class="hero">
        <div class="text-container">
            <button class="btn primary">CONTÁCTENOS</button>
            <button class="btn secondary">RESERVAR AHORA</button>
        </div>
        <div class="traveler">
          <img src="./img/Perro.png" alt="Viajera" />
        </div>
      </div>
      <img src="./img/paisaje2.jpg" alt="Fondo de mascotas" class="logo-large" />
    </header>

    <section class="modal" v-if="modalUsuarioAbierto" aria-hidden="!modalUsuarioAbierto">
      <div class="modal__container" role="dialog" aria-labelledby="modalUsuarioTitle">
        <h2 id="modalUsuarioTitle">Editar Información del Usuario</h2>
        <form class="modal__form">
          <div class="form-group">
            <label for="idUsuario">ID:</label>
            <input
              type="text"
              id="idUsuario"
              v-model="datosUsuario.id"
              disabled
            />
          </div>
          <div class="form-group">
            <label for="nombreUsuario">Nombre:</label>
            <input
              type="text"
              id="nombreUsuario"
              v-model="datosUsuario.nombre"
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div class="form-group">
            <label for="emailUsuario">Email:</label>
            <input
              type="email"
              id="emailUsuario"
              v-model="datosUsuario.email"
              placeholder="Ingresa tu email"
            />
          </div>
          <div class="form-group">
            <label for="emailUsuario">Dirección:</label>
            <input
              type="text"
              
              placeholder="Ingresa tu Dirección"
            />
          </div>
          <div class="form-group">
            <label for="Telefono">Telefono:</label>
            <input
                type="text"
                id="Telefono"
                placeholder="Ingresa tu número "
                maxlength="20"
              />
          </div>
          
          <div class="form-group">
            <label for="tarjetaUsuario">Tarjeta:</label>
            <input
                type="text"
                id="tarjetaUsuario"
                placeholder="Ingresa tu número de tarjeta"
                maxlength="16"
              />
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-save" @click="guardarCambios">Guardar Cambios</button>
            <button type="button" class="btn btn-cancel" @click.prevent="cerrarModalUsuario">Cancelar</button>
          </div>
        </form>
      </div>
    </section>
    
    <h2>¡Bienvenido {{nombreUsuario}}!</h2>

    <div class="centro_control">
        <div class="left-section">
            
            <div class="pie_estadistico">
                <GraficoPastel :productosVendidos="productosVendidos" />
            </div>
        </div>
        
    </div>
    <div class="centro_control">
      <div class="right-section">
        <h2>Ventas</h2>
        <div class="cards">
          <ul>
            <li v-for="[usuarioId, compras] in usuariosPaginados" :key="usuarioId">
              <h3>------------------------------------------------------------</h3>
              <h3>ID Usuario: {{ usuarioId }}</h3>
              <ul>
                <li class="card" v-for="compra in compras" :key="compra.id_compra">
                  <b>ID Compra: {{ compra.id_compra }}</b><br>
                  <b>ID Producto: {{ compra.id_producto }}</b><br>
                  <b>Cantidad: {{ compra.cantidad }}</b><br>
                  <b>Total: {{ compra.total.toLocaleString() }}</b><br>
                  <button class="btn" @click="pedidoHecho(compra.id_compra, compra.id_usuario)">Hacer pedido</button>
                </li>
              </ul>
              <h3>Total de compra: <b>${{ compras.reduce((sum, compra) => sum + compra.total, 0).toLocaleString() }}</b></h3>
              <button class="btn-compra-multiple" @click="pedidoHechoMultiple(usuarioId)">Compra Múltiple</button>
              <h3>------------------------------------------------------------</h3>
            </li>
          </ul>
        </div>

        <!-- Paginación -->
        <div class="paginacion">
            <button
              @click="cambiarPagina(paginaActual - 1)"
              :disabled="paginaActual === 1"
              class="boton-paginacion"
            >
              ⬅ Anterior
            </button>

            <button
              v-for="pagina in totalPaginas"
              :key="pagina"
              @click="cambiarPagina(pagina)"
              :class="['boton-paginacion', { activo: pagina === paginaActual }]"
            >
              {{ pagina }}
            </button>

            <button
              @click="cambiarPagina(paginaActual + 1)"
              :disabled="paginaActual === totalPaginas"
              class="boton-paginacion"
            >
              Siguiente ➡
            </button>
          </div>

      </div>
    
    </div>

    <!-- <section class="modal" v-if="modalPedidoAbierto" aria-hidden="!modalPedidoAbierto">
      <div class="modal__container" role="dialog" aria-labelledby="modalPedidoTitle">
        <h2 id="modalPedidoTitle">Detalles del Pedido</h2>
        <div v-if="pedidoSeleccionado">
          <p><strong>ID Compra:</strong> {{ pedidoSeleccionado.id_compra }}</p>
          <p><strong>ID Producto:</strong> {{ pedidoSeleccionado.id_producto }}</p>
          <p><strong>Cantidad:</strong> {{ pedidoSeleccionado.cantidad }}</p>
          <p><strong>Total:</strong> ${{ pedidoSeleccionado.total.toFixed(2) }}</p>
        </div>
        <button class="btn" @click="cerrarModalPedido">Cerrar</button>
      </div>
    </section> -->
    

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
    <div class="box">
      <!-- Sección de productos -->
      <section class="section-products" id="products">
          <div class="cards">
            <ul>
              <li
                v-for="producto in productosPaginados"
                :key="producto.id_producto"
                class="card"
                @click="irACasa(producto)"
              >
                <div class="card-content">
                  <button class="btn" @click.stop="onModificar(producto.id_producto)">✏️</button>
                  <button class="btn" @click.stop="onEliminar(producto.id_producto)">🗑️</button>
                  <div class="imagen">
                    <img :src="getImagenUrl(producto.imagen)" alt="Imagen del producto" />
                  </div>
                  <strong>ID:</strong> {{ producto.id_producto }}<br />
                  <strong>Nombre:</strong> {{ producto.nombre }}<br />
                  <strong>Descripción:</strong> {{ producto.descripcion }}<br />
                  <strong>Precio:</strong> ${{ producto.precio.toFixed(2) }}<br />
                  <strong>Stock:</strong> {{ producto.stock }}<br />
                  <div class="stock-control">
                    <button type="button" @click.stop="decrementarCantidad(producto)">-</button>
                    <input
                      v-model="producto.cantidadProducto"
                      type="number"
                      min="1"
                      step="1"
                      required
                    />
                    <button type="button" @click.stop="incrementarCantidad(producto)">+</button>
                  </div>
                  <button class="btn" @click.stop="abrirModal(producto)">Compra</button>
                  <button class="btn" @click.stop="carritoCompra(producto)">🛒</button>

                
                </div>
              </li>
            </ul>
         
        </div>
      </section>

      <!-- Controles de paginación -->
      <div class="paginacion">
  <button
    @click="cambiarPaginaProductos(paginaActualProductos - 1)"
    :disabled="paginaActualProductos === 1"
    class="boton-paginacion"
  >
    ⬅ Anterior
  </button>

  <button
    v-for="pagina in totalPaginasProductos"
    :key="pagina"
    @click="cambiarPaginaProductos(pagina)"
    :class="['boton-paginacion', { activo: pagina === paginaActualProductos }]"
  >
    {{ pagina }}
  </button>

  <button
    @click="cambiarPaginaProductos(paginaActualProductos + 1)"
    :disabled="paginaActualProductos === totalPaginasProductos"
    class="boton-paginacion"
  >
    Siguiente ➡
  </button>
</div>

    </div>
      

    <section class="sobre-nosotros" id="sobre-nosotros">
    <div class="contenedor-nosotros">
      <div class="imagen-nosotros">
        <img src="./img/Nosotros2.jpeg" alt="Viajeros" />
        <div class="superposicion-video">
          <img src="./img/video.jpg" alt="Vista previa del video" class="miniatura-video" />
          <button class="boton-reproducir">▶</button>
        </div>
        <div class="informacion-contacto">
          <span>Contáctenos</span>
          <p>+1 234 567 890</p>
        </div>
      </div>
      <div class="texto-nosotros">
        <h2>Sobre nosotros</h2>
        <p>
          ¡Es hora de hacer brillar tu negocio! Presenta la información más
          importante al respecto y demuestra por qué tu negocio es único. Deja
          claro qué puede esperar el destinatario de ti y qué beneficios puedes
          aportarle.
        </p>
        <p>
          ¡Es hora de hacer brillar tu negocio! Presenta la información más
          importante al respecto y demuestra por qué tu negocio es único. Deja
          claro qué puede esperar el destinatario de ti y qué beneficios puedes
          aportarle.
        </p>
        <button class="boton primario">CONTÁCTENOS</button>
      </div>
    </div>
  </section>

  <section class="reserva">
    <div class="contenedor-reserva">
      <div class="imagen-reserva">
        <img src="./img/mascotas.jpg" alt="Accesorios para mascotas" />
      </div>
      <div class="formulario-reserva">
        <h2>Compra accesorios para tu mascota</h2>
        <form>
          <div class="campo">
            <label for="producto">Producto</label>
            <input type="text" id="producto" placeholder="Nombre del producto" />
          </div>
          <div class="campo">
            <label for="cantidad">Cantidad</label>
            <input type="number" id="cantidad" placeholder="Cantidad" />
          </div>
          <div class="campo">
            <label for="email">Correo electrónico*</label>
            <input type="email" id="email" placeholder="Correo electrónico" required />
          </div>
          <div class="campo">
            <label for="telefono">Número de teléfono</label>
            <input type="tel" id="telefono" placeholder="Número de teléfono" />
          </div>
          <div class="campo">
            <label for="mensaje">Mensaje</label>
            <textarea id="mensaje" placeholder="Escribe tu mensaje aquí..."></textarea>
          </div>
          <button type="submit" class="boton">ENVIAR PEDIDO</button>
        </form>
      </div>
      <aside class="contacto" id="contacto">
        <h3>Contacto</h3>
        <p><strong>Teléfono:</strong> +1 234 567 890</p>
        <p><strong>Email:</strong> contacto@mascotas.com</p>
        <p><strong>Ubicación:</strong> 123 Calle Pet Lovers, Ciudad, País</p>
        <h3>Horario de atención</h3>
        <p>Lunes - Viernes: 9am a 6pm</p>
        <p>Sábado: 10am a 2pm</p>
      </aside>
    </div>
  </section>

 

                    <div v-if="modalAbierto" class="modal-overlay">
                    <div class="modal-contenido">
                      <button class="cerrar" @click="cerrarModal">✖</button>
                      
                      <h2>Pago con Tarjeta</h2>
                      <p><strong>Producto:</strong> {{ productoSeleccionado?.nombre }}</p>
                      <p><strong>Precio:</strong> ${{ productoSeleccionado?.precio }}</p>

                      <div class="tarjeta-simulada">
                        <div class="banco">
                          <label>Banco</label>
                          <input type="text" placeholder="Banco" required />
                        </div>
                        <div class="numero">
                          <label>Número</label>
                          <input type="text" placeholder="Número de Tarjeta" maxlength="16" required />
                        </div>
                        <div class="titular">
                          <label>Titular</label>
                          <input type="text" placeholder="Nombre del Titular" required />
                        </div>
                        <div class="fila">
                          <div class="vencimiento">
                            <label>Vencimiento</label>
                            <input type="text" placeholder="MM/YY" maxlength="5" required />
                          </div>
                          <div class="cvv">
                            <label>CVV</label>
                            <input type="text" placeholder="CVV" maxlength="3" required />
                          </div>
                        </div>
                      </div>
                      <button class="btn btn-comprar" @click="comprar(productoSeleccionado)">💳 Comprar</button>
                    </div>
                  </div>
              
         
  

  
</template>
<style scoped >

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

header {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.hero {
  display: flex;
  align-items: flex-start; /* Alinea los elementos desde la parte superior */
  justify-content: flex-start;
  
  position: relative;
 
}

.logo-large {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

.text-container {
  position: absolute;
  bottom: 30%; 
  right: 500px;
  margin: 0;
  display: flex;
  flex-direction: row;
  gap: 4px;
}

.badge {
  background: orange;
  padding: 10px 8px;
  border-radius: 5px;
  font-size: 0.9rem;
}

h1 {
  font-size: 2.2rem; /* Tamaño de letra reducido */
  margin: 15px 0;
  color: black;
}

.hero p {
  font-size: 1.2rem; /* Tamaño más pequeño */
  color: #ffffff;
}



.primary {
  background: orange;
  color: white;
  margin-right: 10px;
}

.secondary {
  background: white;
  color: black;
}

.traveler img {
  height: auto;
}
.traveler {
  align-self: flex-end;
  margin-top: 0%; 
  margin-left: 90%;
}
.menuInfoCliente {
  cursor: pointer; 
  transition: background-color 0.3s ease, color 0.3s ease; 
}

.menuInfoCliente:hover {
  color: yellow; 
  
}
/* Botón de Compra Múltiple */
.btn-compra-multiple {
  background-color: #28a745; 
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-compra-multiple:hover {
  background-color: #218838; 
  transform: scale(1.05); /* Efecto de agrandamiento */
}

.btn-compra-multiple:active {
  background-color: #1e7e34; 
  transform: scale(0.95); /* Efecto de reducción al hacer clic */
}

.btn-compra-multiple:focus {
  outline: none;
  box-shadow: 0px 0px 8px rgba(40, 167, 69, 0.8); /* Resaltado al enfocar */
}

/* Modal de usuario */
.modal__container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  text-align: left;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}

.modal__form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alinea los elementos al inicio */
}

.form-group label {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
  text-align: left; /* Asegura que el texto esté alineado a la izquierda */
}

.form-group input {
  width: 100%; /* Asegura que el input ocupe todo el ancho disponible */
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #007bff;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.btn-save {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-save:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-cancel:hover {
  background-color: #c82333;
}

/* Para navegadores Webkit (Chrome, Safari, Edge) quitar las flechas por defecto de number */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.stock-control button {
  background-color: #ddab08; /* Color amarillo */
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.stock-control button:hover {
  background-color: #dd0808; /* Color rojo al pasar el mouse */
}

/* Input de cantidad */
.stock-control input[type="number"] {
  width: 60px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
  margin: 0 5px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal__container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.modal__contenido {
  margin-bottom: 20px;
}

.modal_close {
  cursor: pointer;
  color: #007bff;
  text-decoration: underline;
}

#libienvenido{
  font-size: 40px;
}
#hamburguesa{
    color: whitesmoke;
    position: absolute;
    right: 20px;
  }
#hamburguesa, #cerrarHamburguesa {
    font-size: 3rem;
    font-weight: bolder;
    cursor: pointer;
    user-select: none;
    
}
  
.menuHamburguesa {
    background-color:  #333;
    width: 20%;
    position: fixed;
    top: 0;
    right: -100%;
    bottom: 0;
    color: white;
    text-align: right;
    padding: 20px;
    transition: left 0.3s ease-in-out;
}
  
.menuHamburguesa ul {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  
}

.menuHamburguesa .lihamburguesa {
  list-style: none;
  width: 100%;
  text-align: center;
  padding: 10px 0;
  color: white; /* Color blanco por defecto */
  font-size: 1.2em; /* Tamaño de fuente */
  transition: color 0.3s ease; /* Transición suave para el color del texto */
}


.menuHamburguesa .lihamburguesa:hover {
  color: #FFFF00;
}

.menuHamburguesa .lihamburguesa a {
  color: inherit; 
  text-decoration: none; 
  display: block; 
  padding: 10px; 
  transition: color 0.3s ease; 
}

.menuHamburguesa .lihamburguesa a:hover {
  color: #FFFF00; 
}
  
.openHamburguesa {
    right: 0;
}

.carritocompra {
  position: fixed;
  top: 800px;
  bottom: 20px; 
  right: 30px;
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

/*paginacion */
.paginacion {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 2rem;
}

.boton-paginacion {
  padding: 8px 12px;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 40px;
}

.boton-paginacion:hover:not(:disabled) {
  background-color: #e0f7fa;
}

.boton-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.boton-paginacion.activo {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.centro_control {
  display: flex;
  justify-content: center; /* Centra el contenido horizontalmente */
  align-items: flex-start;
  width: 100%; /* Ocupa el 100% del contenedor padre */
  margin: 20px auto;
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 10px;
  background: #f9f9f9;
}

.left-section, .right-section  {
  width: 100%; /* Ocupa el 100% del contenedor padre */
  padding: 10px;
  text-align: center;
}
.pie_estadistico {
  height: 500px;
  width: 500px;
  margin: 0 auto; /* Centra el pie_estadistico */
}

/* Modal de pago*/
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-contenido {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  position: relative;
}

.cerrar {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
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
  color: white;
  font-size: 25px;
}

body {
  font-family: 'Poppins', sans-serif;
  background-color: #f5f5f5;

  line-height: 1.6;
}

h1, h2, h3 {
  font-weight: 700;
  color: #000000;
}

a {
  text-decoration: none;
  color: inherit;
}

ul {
  list-style: none;
  padding: 0;
}

/* Navbar */
.navbar {
  padding: 15px 0;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 70px;
}

.navbar ul {
  display: flex;
  
  justify-content: center;
  gap: 10px;
}

.navbar ul li a {
  color: white;
  font-size: 1.1em;
  font-weight: 500;
  padding: 10px;
  transition: color 0.3s;
}

.navbar ul li a:hover {
  color: #fffb00;
}

/* Sobre Nosotros */
.sobre-nosotros {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  background: #f9f9f9;
}

.contenedor-nosotros {
  display: flex;
  max-width: 1200px;
  gap: 50px;
  align-items: center;
}

.imagen-nosotros {
  position: relative;
  flex: 1;
}

.imagen-nosotros img {
  width: 100%;
  border-radius: 10px;
}

.superposicion-video {
  position: absolute;
  bottom: 1px;
  left: 74%;
  width: 200px;
  border-radius: 10px;
  overflow: hidden;
}

.miniatura-video {
  width: 100%;
  display: block;
  border-radius: 10px;
}

.boton-reproducir {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  padding: 10px;
  font-size: 1.2rem;
  cursor: pointer;
}

.informacion-contacto {
  position: absolute;
  bottom: 1%;
  left: 49%;
  background: orange;
  padding: 5px;
  border-radius: 5px;
  height: 15%;
  color: white;
  font-weight: bold;
}

.texto-nosotros {
  flex: 1;
}

.texto-nosotros h2 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.texto-nosotros p {
  margin-bottom: 10px;
  color: #000000;
}

.boton {
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.primario {
  background: orange;
  color: white;
  border-radius: 5px;
}

/* Preguntas Frecuentes */

.preguntas-frecuentes {
  background: url('./img/fondo.jpg') no-repeat center center/cover;
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.contenedor {
  max-width: 800px;
  margin: auto;
}

h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.acordeon {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pregunta {
  background: rgba(25, 31, 110, 0.5);
  padding: 15px;
  border-radius: 5px;
  text-align: left;
}

.pregunta-titulo {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.icono {
  font-size: 1.2rem;
}

.respuesta {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  margin-top: 5px;
  border-radius: 5px;
}

/*Reserva*/
.reserva {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  background: #f9f9f9;
}

.contenedor-reserva {
  display: flex;
  max-width: 1100px; 
  align-items: flex-start; 
}

.imagen-reserva img {
  width: 100%;
  max-width:470px; 
  height: 110%;
  max-height: 110%;
  border-radius: 10px;
}

.formulario-reserva {
  flex: 1;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  height: 750px; /* Más largo */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Distribuye los elementos */
}

.campo {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.boton {
  background: orange;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.contacto {
  margin-left: 20px;
  flex: 0.6;
  background: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  height: auto;
  font-size: 0.85rem; 
  position: relative;
  top: 0px; 
}
</style>


