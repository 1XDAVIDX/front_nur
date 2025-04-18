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
    
    const memoriaRaw = localStorage.getItem('access_token');
    const memoria = memoriaRaw ? JSON.parse(memoriaRaw) : null;


    console.log(memoriaRaw)
    const idlocalestore = memoria?.id_usuario;
    const nombreUsuario = memoria?.nombre
    const tarjetaUsuario = memoria?.tarjetaCredito ;
    const telefonoUsuario = memoria?.telefono ;
    const direccionUsuario = memoria?.direccion;
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
              Swal.fire({
                title: "Procesando...",
                text: "Por favor, espera mientras procesamos tu pedido.",
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading(); 
                },
              });



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

        Swal.fire({
                title: "Procesando...",
                text: "Por favor, espera mientras procesamos tu pedido.",
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading(); 
                },
        });

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
           }).then(() =>{
                router.go(0);
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
          text: "Error al comprar"
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
      if (memoria?.direccion == '') {
            Swal.fire({
              icon: "warning",
              title: "Actualiza tus datos",
              text: "No tienes datos necesarios, por favor ingresa una dirección antes de continuar.",
            });
      }
      datosUsuario.value = {
        id: idlocalestore,
        nombre: nombreUsuario,
        direccion: direccionUsuario,
        tarjetaCredito: tarjetaUsuario,
        telefono: telefonoUsuario,
        
        
      
        
      };
      
      modalUsuarioAbierto.value = true;
    };

    const guardarEnLocalStorage = () => {
      // Obtener los datos existentes en localStorage
      const datosExistentesRaw = localStorage.getItem('access_token');
      const datosExistentes = datosExistentesRaw ? JSON.parse(datosExistentesRaw) : {};

      // Actualizar solo los tres datos específicos
      const datosActualizados = {
        ...datosExistentes, // Mantener los datos existentes
        direccionUsuario: datosUsuario.value.direccion,
        tarjetaUsuario: datosUsuario.value.tarjetaCredito,
        telefonoUsuario: datosUsuario.value.telefono,
      };

      // Guardar los datos actualizados en localStorage
      localStorage.setItem('access_token', JSON.stringify(datosActualizados));

      console.log('Datos actualizados en localStorage:', datosActualizados);
    };

    

    



    const guardarCambiosUsuario = async ()=>{
       try {         
          const respuesta = await axios.put(`http://127.0.0.1:8000/editar/usuario/${idlocalestore}`, datosUsuario.value);
          
          guardarEnLocalStorage();
          

          Swal.fire({
          icon: "success",
          title: "Datos Actualizados",
          
        }).then(()=> { cerrarModalUsuario();});
        } catch (error) {
          console.error("Error al guardar los cambios usuario", error);
        }
      }

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

    const busquedaBarraadmin = ref('');
    const enviarBusqueda = () => {
      consultaProducto();
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
        if(busquedaBarraadmin.value.trim() === ''){
          if (categoriaSeleccionada.value !== 'Todos') {
            data.value = data.value.filter((producto) => producto.categotia === categoriaSeleccionada.value);
            busquedaBarraadmin.value = ''; 
          }

        }else{
          data.value = data.value.filter((producto) => producto.nombre.toLowerCase().includes(busquedaBarraadmin.value.toLowerCase()));
          busquedaBarraadmin.value = ''; 
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

    const mostrarCategorias = ref(false)


    return {
      memoria,
      enviarBusqueda,
      busquedaBarraadmin,
      mostrarCategorias,
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
      guardarCambiosUsuario,
      
      
      
      
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

    <nav class="navbar">
      <ul class="navbar-list">
          <!-- Botón desplegable de categorías -->
        <li class="contenedor-categorias relative">
          <button @click="mostrarCategorias = !mostrarCategorias" class="btn-categorias">
            Categorías <i class="fas fa-chevron-down ml-1"></i>
          </button>

          <!-- Lista desplegable -->
          <ul v-if="mostrarCategorias" class="dropdown-categorias">
            <li v-for="categoria in categorias" :key="categoria">
              <button 
                @click="seleccionarCategoria(categoria); mostrarCategorias = false"
                :class="{ activo: categoria === categoriaSeleccionada }"
                class="item-categoria">
                {{ categoria }}
              </button>
            </li>
          </ul>
        </li>

        <!-- Buscador estilizado -->
        <li class="contenedor-buscador">
          <form @submit.prevent="enviarBusqueda" class="form-buscador">
            <input
              type="text"
              v-model="busquedaBarraadmin"
              placeholder="Buscar productos..."
              class="input-buscador"
            />
            <button type="submit" class="boton-buscador"><i class="fas fa-search"></i></button>
          </form>
        </li>


        <li class="li_dos"><router-link to="/notificaciones"><i class="fas fa-bell"></i> </router-link></li>
        <li class="li_dos"><router-link to="/whasappControl"><i class="fab fa-whatsapp"></i> </router-link></li>
        <!-- Menú hamburguesa -->
        <div>
          <span id="hamburguesa" @click="toggleMenu" class="far fa-user-circle"></span>
          <nav :class="['menuHamburguesa', { openHamburguesa: menuAbierto }]">
            <span id="cerrarHamburguesa" @click="toggleMenu">&#128938;</span>
            <ul>
              <li id="libienvenido">¡Bienvenido!</li>
              <li class="infocliente">{{ nombreUsuario }}</li>

              <li id="lilinea">-----------------------------------------</li>
              <li class="menuInfoCliente" @click="abrirModalUsuario"><i class="fas fa-user-edit"></i> PERFIL</li>
              <li class="lihamburguesa"><router-link to="/registroProducto"><i class="fas fa-box"></i> Registrar Producto</router-link></li>
              <li class="lihamburguesa"><router-link to="/modificarProducto"><i class="fas fa-edit"></i> Modificar Producto</router-link></li>
              <li class="lihamburguesa"><router-link to="/eliminarProducto"><i class="fas fa-trash-alt"></i> Eliminar Producto</router-link></li>
              <li class="lihamburguesa"><router-link to="/inventario"><i class="fas fa-clipboard-list"></i> Producto Despachados</router-link></li>
              <li class="lihamburguesa"><router-link to="/registroUsuario"><i class="fas fa-user-plus"></i> Crear cuenta</router-link></li>
              <li class="lihamburguesa"><router-link to="/pruebaLogin"><i class="fas fa-sign-in-alt"></i> Ingresar Usuario</router-link></li>

              <li id="lilinea">-----------------------------------------</li>
            </ul>
          </nav>
        </div>
      </ul>
    </nav>

    <section class="modal" v-if="modalUsuarioAbierto" aria-hidden="!modalUsuarioAbierto">
      <div class="modal__container" role="dialog" aria-labelledby="modalUsuarioTitle">
        <h2 id="modalUsuarioTitle">Editar Información del Usuario</h2>
        <form class="modal__form">
          
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
              v-model="datosUsuario.id"
              placeholder="Ingresa tu email"
            />
          </div>
          <div class="form-group">
            <label for="emailUsuario">Dirección:</label>
            <input
              type="text"
              v-model="datosUsuario.direccion"
              
              
              placeholder="Ingresa tu Dirección"
            />
          </div>
          <div class="form-group">
            <label for="Telefono">Telefono:</label>
            <input
                type="text"
                id="Telefono"
                v-model="datosUsuario.telefono"
                placeholder="Ingresa tu número "
                maxlength="20"
              />
          </div>
          
          <div class="form-group">
            <label for="tarjetaUsuario">Tarjeta:</label>
            <input
                type="text"
                id="tarjetaUsuario"
                v-model="datosUsuario.tarjetaCredito"
                placeholder="Ingresa tu número de tarjeta"
                maxlength="16"
              />
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-save" @click="guardarCambiosUsuario">Guardar Cambios</button>
            <button type="button" class="btn btn-cancel" @click="cerrarModalUsuario">Cancelar</button>
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
          <button @click="cambiarPagina(paginaActual - 1)" :disabled="paginaActual === 1">Anterior</button>
          <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button @click="cambiarPagina(paginaActual + 1)" :disabled="paginaActual === totalPaginas">Siguiente</button>
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
        <div class="contenedor-sobre-nosotros">
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
        </div>
      </section>

      <!-- Controles de paginación -->
      <div class="paginacion">
        <button
          @click="cambiarPaginaProductos(paginaActualProductos - 1)"
          :disabled="paginaActualProductos === 1"
        >
          Anterior
        </button>
        <span>Página {{ paginaActualProductos }} de {{ totalPaginasProductos }}</span>
        <button
          @click="cambiarPaginaProductos(paginaActualProductos + 1)"
          :disabled="paginaActualProductos === totalPaginasProductos"
        >
          Siguiente
        </button>
      </div>
    </div>
      

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

  <div v-if="modalAbierto" class="modal-overlay">
    <div class="modal-contenido">
      <button class="cerrar" @click="cerrarModal">✖</button>
      
      <h2>Pago con Tarjeta</h2>
       <p><strong>Producto:</strong> {{ productoSeleccionado?.nombre }}</p>
      <p><strong>Precio:</strong> ${{ productoSeleccionado?.precio }}</p>

      <div class="tarjeta-simulada">
        
        <div class="numero">
          <label>Número</label>
          <input type="text"  v-model="memoria.tarjetaCredito" placeholder="Número de Tarjeta" maxlength="16" required />
        </div>
        <div class="titular">
          <label>Titular</label>
          <input type="text" v-model="memoria.nombre" placeholder="Nombre del Titular" required />
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
      <!-- Si hay dirección en memoria -->
      <button 
        v-if="memoria.direccion" 
        class="btn btn-comprar" 
        @click="comprar(productoSeleccionado)">
        💳 Comprar
      </button>

      <!-- Si no hay dirección en memoria -->
      <button 
        v-else 
        class="btn btn-comprar" 
        @click="cerrarModal(); abrirModalUsuario()">
        💳 Comprar
      </button>
    </div>
  </div>
  
</template>
<style >

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}


.li_dos{
  font-size: 1.5em;
 
}

/* Estilos categoria nav */
.contenedor-categorias {
  position: relative;
  display: inline-block;
}

.btn-categorias {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.btn-categorias:hover {
  background-color: #2980b9;
}

.btn-categorias i {
  margin-left: 8px;
  font-size: 12px;
}

.dropdown-categorias {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  margin-top: 10px;
  padding: 10px 0;
  width: 200px;
  display: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.contenedor-categorias:hover .dropdown-categorias {
  display: block;
  opacity: 1;
  transform: translateY(10px);
}

/* Estilo de cada categoría */
.item-categoria {
  background-color: #fff;
  color: #333;
  padding: 10px 20px;
  border: none;
  text-align: left;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
}

.item-categoria:hover {
  background-color: #f0f0f0;
}

.item-categoria.activo {
  background-color: #3498db;
  color: white;
}

.item-categoria:focus {
  outline: none;
}

/* Animación para abrir/cerrar el menú */
.dropdown-categorias {
  display: none;
}

.contenedor-categorias.active .dropdown-categorias {
  display: block;
}
/* Navegador*/
.navbar {
  background-color: #ffffff;
  padding: 10px 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.navbar-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
  list-style: none;
  flex-wrap: wrap;
  gap: 10px;
}



.form-buscador {
  width: 100%;
  max-width: 400px;
  display: flex;
  background-color: #f1f1f1;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
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

/* Modal de pago*/
.modal-overlay  {
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
  cursor: pointer;
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

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}


.menuInfoCliente {
  font-size: 1.2em;
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
    top: 15%;
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
  text-align: left;
}
.pie_estadistico {
  height: 500px;
  width: 500px;
  margin: 0 auto; /* Centra el pie_estadistico */
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

/* Modal de pago */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7); /* Más oscuro para mayor contraste */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-contenido {
  background: #fff;
  padding: 2rem;
  border-radius: 15px; /* Bordes más redondeados */
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3); /* Sombra más pronunciada */
  animation: fadeIn 0.3s ease-in-out; /* Animación de entrada */
}

.cerrar {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s ease;
}

.cerrar:hover {
  color: #dd0808; /* Color rojo al pasar el mouse */
}

.tarjeta-simulada {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px; /* Espaciado uniforme entre los campos */
}

.tarjeta-simulada label :scope {
  font-weight: bold;
  font-size: 14px;
  color: #555;
}

.tarjeta-simulada input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.tarjeta-simulada input:focus {
  border-color: #007bff; /* Azul al enfocar */
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Resaltado al enfocar */
}

.tarjeta-simulada .fila {
  display: flex;
  gap: 10px;
}

.tarjeta-simulada .fila > div {
  flex: 1; /* Divide el espacio equitativamente */
}

.btn-comprar {
  margin-top: 20px;
  background-color: #28a745;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-comprar:hover {
  background-color: #218838;
  transform: scale(1.05); /* Efecto de agrandamiento */
}

.btn-comprar:active {
  background-color: #1e7e34;
  transform: scale(0.95); /* Efecto de reducción al hacer clic */
}

/* Animación de entrada */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

</style>
