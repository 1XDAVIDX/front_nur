<script>
import axios from 'axios';
import { ref, onMounted,computed  } from 'vue';
import { useRouter } from 'vue-router';
import GraficoPastel from "@/components/GraficoPastel.vue"; 
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';
import carrusel1 from '@/components/img/Banner1.webp'
import carrusel2 from '@/components/img/Banner2.jpeg'
//import carrusel3 from '@/components/img/carrusel3.jpg'

export default {
  
  components: { 
    GraficoPastel  
  },
  data(){
    
    return {
        menuAbierto: false,
        modalAbierto: false,
        productoSeleccionado: null,
        imagenesCarrusel: [carrusel1, carrusel2],
        slideActual: 0,
        intervalo: null

      };
  },
  mounted() {
    this.iniciarCarrusel();
  },
  beforeUnmount() {
    clearInterval(this.intervalo);
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
      },
      iniciarCarrusel() {
      this.intervalo = setInterval(() => {
        this.slideActual = (this.slideActual + 1) % this.imagenesCarrusel.length;
      }, 2000); // cada 4 segundos
      },
      pausar() {
        clearInterval(this.intervalo);
      },
      reanudar() {
        this.iniciarCarrusel();
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
    const rolUsuario = memoria?.rol
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
        if (memoria?.id_usuario) {
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo agregar al carrito.",
                  });
                } else {
                  Swal.fire({
                    icon: "warning",
                    title: "Iniciar sesión",
                    text: "Necesitas iniciar sesión para agregar productos al carrito.",
                  });
                  
                }
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
      const numero = "573123848279";
      const mensaje =encodeURIComponent("Tienes un catalogo?");
      const url = `https://wa.me/${numero}?text=${mensaje}`;
      window.open(url, "_blank");
    }

    // modal usuario

    const modalUsuarioAbierto = ref(false); // Controla si el modal está abierto
    const datosUsuario = ref({}); // Almacena los datos del usuario

    const abrirModalUsuario = () => {
      if (memoria?.direccion == null) {
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
      datosGrafico(),
      datosInventario();
          
      }
    );

    const onComprar = (productoId) => {
      router.push({ path: '/comprar', query: { productoId: productoId } });
    }
    
    const onModificar = (productoId)=>{
      router.push({path:'/modificarProducto', query: {productoId: productoId}})
    }
    const onAgregarCarrito = (productoId) =>{
      router.push({ path: '/agregarCarrito', query: { productoId: productoId } });
    }
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
    const ValidacionSecion = () => {
      Swal.fire({
        title: 'Necesitas iniciar sesión',
       
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        timer: 2000,
        timerProgressBar: true,
      }).then(() => {
        localStorage.clear();
        sessionStorage.clear();
        
        router.push({ path: '/pruebaLogin' });
      });
    };

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

    const comprobarEmail = ref({
            destinatario: "davidgelvez122j@gmail.com",
            asunto: "",
            mensaje: "",
    });
    const apiEmail = async () => {
            try {
               
                const respuesta = await axios.post("http://127.0.0.1:8000/enviar-email", comprobarEmail.value);
                console.log(respuesta.data);
                Swal.fire({
                    icon: "success",
                    title: "Correo enviado",
                    
                }).then(() => {
                   router.go(0);
                });
            } catch (error) {
                console.error("Error al enviar el correo", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo enviar el correo. Intente nuevamente.",
                });                
            }
    };
    const copiarCorreo = () => {
      const email = comprobarEmail.value.destinatario; // Obtén el correo
      if (email) {
        navigator.clipboard.writeText(email).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Correo Copiado',
            text: 'El correo electrónico ha sido copiado al portapapeles.',
          });
        }).catch(err => {
          console.error('Error al copiar el correo:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo copiar el correo al portapapeles.',
          });
        });
      }
    };

    return {
      copiarCorreo,
      comprobarEmail,
      apiEmail,
      datosTarjeta,
      ValidacionSecion,
      inventario,
      mensajes,
      mostrarNotificaciones,
      cerrarSesion,
      memoria,
      enviarBusqueda,
      busquedaBarraadmin,
      mostrarCategorias,
      data,
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
     <header class="pet-hero">
         <div class="hero-curve"></div>
     
         <!-- Huellitas decorativas -->
         <img src="./img/Perro.png" class="paw paw-top-left" alt="paw" />
         <div class="hero-text">
           <p class="subtitle">MASCOTAS</p>
           <h1 class="title">Los Mejores Accesorios para tu Mascota<br />Querida y Bien Cuidada</h1>
           <p class="description">
           Descubre una amplia gama de accesorios de alta calidad que harán la vida de tu mascota más cómoda y divertida.
           </p>
           <button class="shop-btn">COMPRAR AHORA</button>
   
         </div>
      </header>
   

<nav class="navbar">
  <div class="navbar-container">
    <!-- IZQUIERDA: Categorías + Buscador -->
    <div class="navbar-left">
      <!-- Categorías -->
      <div class="contenedor-categorias relative">
        <button @click="mostrarCategorias = !mostrarCategorias" class="btn-categorias">
          Categorías <i class="fas fa-chevron-down ml-1"></i>
        </button>
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
      </div>

      <!-- Buscador -->
      <div class="contenedor-buscador">
        <form @submit.prevent="enviarBusqueda" class="form-buscador">
          <input
            type="text"
            v-model="busquedaBarraadmin"
            placeholder="Buscar productos..."
            class="input-buscador"
          />
          <button type="submit" class="boton-buscador"><i class="fas fa-search"></i></button>
        </form>
      </div>
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


      
      <!-- Menú Hamburguesa -->
      <span id="hamburguesa" @click="toggleMenu" class="far fa-user-circle"></span>
      <nav :class="['menuHamburguesa', { openHamburguesa: menuAbierto }]">
        <span id="cerrarHamburguesa" @click="toggleMenu">&#128938;</span>
        <ul>
          <li id="libienvenido">¡Bienvenido!</li>
          <li class="infocliente">{{ nombreUsuario }}</li>
          <li id="lilinea">-----------------------------------------</li>
          <li class="menuInfoCliente" @click="abrirModalUsuario"><i class="fas fa-user-edit"></i> PERFIL</li>
                <li class="lihamburguesa"><router-link to="/pruebaLogin"><i class="fas fa-sign-in-alt"></i> Ingresar Usuario</router-link></li>
          <li class="lihamburguesa"><button type="button" class="btn btn-save" @click="cerrarSesion">cerrar Sesión</button></li>
          <li id="lilinea">-----------------------------------------</li>
        </ul>
      </nav>
    </div>
  </div>
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
    

    <section class="carrusel">
      <div class="carrusel" @mouseenter="pausar" @mouseleave="reanudar">
    <img :src="imagenesCarrusel[slideActual]" class="carrusel-imagen" alt="Imagen carrusel" />
    
  </div>
    </section>
    
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

    <section class="productos-populares">
      <h2 class="titulo-populares">🐾 TALLAS 🐾</h2>
      
      <div class="contenedor-cartas">
        <div class="carta">
          <img src="./img/labrador.jpg" alt="Labrador">
          <h3>Labrador</h3>
          <button class="boton-principal">Tallas S, M, L</button>
          <button class="boton-secundario">Collar</button>
          <button class="boton-secundario">Correa</button>
          <button class="boton-secundario">Juguete</button>
        </div>

        <div class="carta">
          <img src="./img/pomerania.jpg" alt="Pomerania">
          <h3>Pomerania</h3>
          <button class="boton-principal">Tallas XS, S</button>
          <button class="boton-secundario">Ropa</button>
          <button class="boton-secundario">Bozal Cono</button>
          <button class="boton-secundario">Pelota</button>
        </div>

        <div class="carta">
          <img src="./img/bulldog.jpg" alt="Bulldog">
          <h3>Bulldog</h3>
          <button class="boton-principal">Tallas M, L</button>
          <button class="boton-secundario">Cama</button>
          <button class="boton-secundario">Pechera</button>
          <button class="boton-secundario">arnes</button>
        </div>

        <div class="carta">
          <img src="./img/Golden.jpg" alt="Golden Retriever">
          <h3>Golden Retriever</h3>
          <button class="boton-principal">Tallas L, XL</button>
          <button class="boton-secundario">Chaleco</button>
          <button class="boton-secundario">Bozal</button>
          <button class="boton-secundario">Collar</button>
        </div>

        <div class="carta">
          <img src="./img/Chihuahua.jpg" alt="Chihuahua">
          <h3>Chihuahua</h3>
          <button class="boton-principal">Tallas XXS, XS</button>
          <button class="boton-secundario">Collar Lazo</button>
          <button class="boton-secundario">Chaleco Lona</button>
          <button class="boton-secundario">Collar ahogo</button>
        </div>

        <div class="carta">
          <img src="./img/ShihTzu.jpg" alt="Shih Tzu">
          <h3>Shih Tzu</h3>
          <button class="boton-principal">Tallas S, M</button>
          <button class="boton-secundario">Correa</button>
          <button class="boton-secundario">Pechera</button>
          <button class="boton-secundario">Bozal Cono</button>
        </div>
      </div>
    </section>

    

    <div class="whasapp">
      <button @click="enviarMensajeWhatsapp" class="whatsapp-btn">
        <i class="fab fa-whatsapp"></i> 
      </button>
      <div class="carritoemoti">
        <router-link to="/carritoCompra">🛒</router-link>
      </div>
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
                  <button v-if="memoria?.id_usuario"  class="btn" @click.stop="abrirModal(producto)">Compra</button>
                  <button v-else  class="btn" @click.stop="ValidacionSecion">Compra</button>
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
          class="boton-paginacion"
        >⬅ Anterior
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
        <img src="./img/Nosotros2.jpg" alt="Viajeros" />
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
        
      </div>
    </div>
  </section>

  <section class="reserva">
    <div class="contenedor-reserva">
      <div class="imagen-reserva">
        <img src="./img/mascotas.jpg" alt="Accesorios para mascotas" />
      </div>
      <div class="formulario-reserva">
        <h2>Tienes Dudas?</h2>
        <form @submit.prevent="apiEmail">
          <div class="campo">
            <label for="email">Correo electrónico Mascotas</label>
            <div class="email-container">
              <input type="email" v-model="comprobarEmail.destinatario" id="email" placeholder="Correo electrónico" required readonly />
              <button @click="copiarCorreo" class="btn-copiar">📋 Copiar</button>
            </div>
          </div>
          
          <div class="campo">
            <label for="email">Correo electrónico</label>
            <input type="email" v-model="comprobarEmail.asunto" id="email" placeholder="Correo electrónico" required />
          </div>
          <div class="campo">
            <label for="mensaje">Mensaje</label>
            <textarea id="mensaje" v-model="comprobarEmail.mensaje" placeholder="Escribe tu mensaje aquí..."></textarea>
          </div>
          <button type="submit" class="boton">ENVIAR PEDIDO</button>
        </form>
      </div>
      <aside class="contacto" id="contacto">
        <h3>Contacto</h3>
        <p><strong>Teléfono:</strong> +57 3508381030</p>
        <p><strong>Email:</strong> TiendamascotasR@gmail.com</p>
        <p><strong>Ubicación:</strong>Mosquera Cundinamarca  CL. 17 #12 16</p>
        <h3>Horario de atención</h3>
        <p>Lunes - Viernes: 9am a 6pm</p>
        <p>Sábado: 10am a 2pm</p>
      </aside>
    </div>
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
          <input type="text"  v-model="datosTarjeta.tarjetaCredito" placeholder="Número de Tarjeta" maxlength="16" required />
        </div>
        <div class="titular">
          <label>Titular</label>
          <input type="text" v-model="datosTarjeta.nombre" placeholder="Nombre del Titular" required />
        </div>
        <div class="fila">
          <div class="vencimiento">
            <label>Vencimiento</label>
            <input type="text" v-model="datosTarjeta.vencimiento" placeholder="MM/YY" maxlength="5" required />
          </div>
          <div class="cvv">
            <label>CVV</label>
            <input type="text" v-model="datosTarjeta.cvv" placeholder="CVV" maxlength="3" required />
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
        <li>📧 TiendamascotasR@gmail.com</li>
        <li>📞 +57 3508381030</li>
        <li>📍 mosquera Cundinamarca</li>
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
<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.box{
  background-color: #ffffff;
}

.email-container {
  display: flex;
  align-items: center;
}

.btn-copiar {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.btn-copiar:hover {
  background-color: #45a049;
}

.li_dos {
  font-size: 1.5em;
}

.pet-hero {
  position: relative;
  height: 100vh;
  background-color: #e5954a; /* Color de fondo café */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column; /* Para que el contenido esté en columna */
}

.hero-curve {
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  background: white;
  border-bottom-right-radius: 80% 100%;
  border-top-right-radius: 80% 100%;
  z-index: 1;
}

/* Texto alineado al borde izquierdo y centrado verticalmente */
.hero-text {
  position: absolute;
  left: 5%;
  top: 50%; /* El texto se sube un poco más */
  transform: translateY(-50%);
  z-index: 2;
  max-width: 40%;
  color: #000;
}

/* Estilos del texto */
.subtitle {
  font-size: 0.9rem;
  letter-spacing: 2px;
  color: #333;
  margin-bottom: 1rem;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.description {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
}

.shop-btn {
  padding: 0.75rem 1.5rem;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.shop-btn:hover {
  background-color: #333;
}

/* Huellas */
.paw {
  position: absolute;
  width: 500px;
  z-index: 2;
}

.paw-top-left {
  top: 30px;
  left: 55%;
}

/* Ajuste para la imagen centrada */
.paw-top-left img {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
}

/* Responsive */
@media screen and (max-width: 768px) {
  .pet-hero {
    flex-direction: column-reverse; /* Cambia el orden de los elementos, poniendo la imagen debajo del texto */
  }

  .hero-curve {
    width: 100%;
    height: 50%;
    border-bottom-right-radius: 100% 30%;
    border-bottom-left-radius: 60% 30%;
  }

  .hero-text {
    max-width: 90%;
    left: 5%;
    top: auto;
    transform: none;
    padding-top: 30%;
    text-align: center; /* Centra el texto */
    position: relative;
    z-index: 3; /* Asegura que el texto esté por encima */
  }

  .title {
    font-size: 2.2rem;
  }

  .description {
    font-size: 1rem;
  }

  .shop-btn {
    padding: 0.6rem 1.2rem;
  }

  /* Imagen */
  .paw {
    width: 250px; /* Reduje el tamaño de la imagen */
    
    left: 30%; /* Mueve la imagen un poco más a la izquierda */
    transform: translateX(-50%); /* Centra la imagen */
  }

  .paw-top-left {
    position: relative;
    top: 0; /* La imagen estará abajo del texto */
  }
}

/* NAVBAR BASE */
.navbar {
  background-color: #333;
  padding: 10px 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

/* IZQUIERDA */
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
  max-width: 800px;
}
.contenedor-buscador{
 width: 500px;
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
  background-color: #e0c10f;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.boton-buscador:hover {
  background-color:  #c2a70d;
}

h2 {
  font-size: 2rem; 
  color: #dd0808; 
  text-align: center;
  margin-bottom: 20px; 
}

/* Categoría Nav */
.contenedor-categorias {
  position: relative;
  display: inline-block;
}

.btn-categorias {
  background-color: #e0c10f;
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
  background-color: #e0c10f;
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
  z-index: 999;
}

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

.carrusel { 
  position: relative;
  width: 100%;
  max-width: 100%; /* Usa todo el ancho posible */
  margin: 0 auto;
  padding: 0 74px; /* Márgenes laterales suaves */
  height: 500px; 
  overflow: hidden;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}


.carrusel-imagen {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  top: 50px;
  left: 0;
}

.carrusel-texto {
  position: relative;
  z-index: 2;
  color: white;
  background: rgba(0, 0, 0, 0.404);
  padding: 1rem 2rem;
  border-radius: 10px;
  text-align: center;
  max-width: 80%;
}

.carrusel-texto h2 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.carrusel-texto p {
  font-size: 1.3rem;
  margin: 0;
}

/* Responsive */
@media screen and (max-width: 768px) {
  .carrusel-texto h2 {
    font-size: 1.6rem;
  }

  .carrusel-texto p {
    font-size: 1.1rem;
  }
}

@media screen and (max-width: 480px) {
  .carrusel-texto {
    padding: 0.8rem 1rem;
    max-width: 90%;
  }

  .carrusel-texto h2 {
    font-size: 1.3rem;
  }

  .carrusel-texto p {
    font-size: 1rem;
  }
}

.productos-populares {
  padding: 40px 20px;
  background-color: #eeeaea;
}

.titulo-populares {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #444;
  text-shadow: 1px 1px 2px #ccc;
}

.contenedor-cartas {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columnas fijas */
  gap: 25px;
  padding: 40px;
  max-width: 1200px;
  margin: auto;
}

.carta {
  background-color: #ffffff; /* Gris claro */
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s ease;
}

.carta:hover {
  transform: scale(1.03);
}

.carta img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 10px;
}

.carta h3 {
  margin: 15px 0 10px;
  font-size: 20px;
  font-weight: bold;
}

.boton-principal {
  background-color: #ffa500;
  color: white;
  padding: 10px;
  width: 100%;
  margin: 10px 0;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.boton-secundario {
  background-color: #ddd;
  padding: 8px;
  width: 100%;
  margin: 5px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.boton-secundario:hover {
  background-color: #ccc;
}


@media (max-width: 900px) {
  .contenedor-cartas {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .contenedor-cartas {
    grid-template-columns: 1fr;
  }
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

/* Cards */
.card {
  background-color: #fff;
  border: 1px solid #ffffff;
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

.card-content strong {
  color: #ff6600;
}

/* Sobre Nosotros */
.sobre-nosotros {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  background: #ffffff;
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
  color: rgb(15, 14, 14);
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


/*Reserva*/
/*Reserva*/
.reserva {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
  background: #ffffff;
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
  padding: 17px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  height: 695px; /* Mantener la altura original */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Asegura que el contenido se alinee arriba */
}

.campo {
  margin-bottom: 20px;
  margin-top: -10px; /* Subir el texto de cada campo */
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  margin-top: -10px; /* Subir los labels */
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
.email-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.email-container input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Botón de Copiar */
.btn-copiar {
  background-color: #4caf50;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s ease-in-out;
}

.btn-copiar:hover {
  background-color: #45a049;
  transform: scale(1.05);
}

.btn-copiar:active {
  background-color: #388e3c;
}

.btn-copiar:focus {
  outline: none;
}

.contacto {
  margin-left: 20px;
  flex: 0.6;
  background: #fff;
  padding: 15prgb(0, 0, 0);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  height: auto;
  font-size: 0.85rem; 
  position: relative;
  top: 0px; 
}
.contacto p {
  color:black;
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


/* Carrito */
.carritoemoti {
  bottom: 90px; /* Espacio encima del botón de WhatsApp */
  right: 20px;
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

/* Estilos generales para los botones de categorías */
.categorias {
  display: flex;
  justify-content: center; /* Centrar los botones */
  gap: 15px; /* Espacio entre botones */
  margin: 20px 0;
  flex-wrap: wrap; /* Permite que los botones se ajusten en varias líneas si no hay suficiente espacio */
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
  white-space: nowrap; /* Impide que el texto se divida en varias líneas */
}

/* Estado del botón activo */
.categorias button.activo {
  background-color: #d68600; /* Un naranja más oscuro para el botón activo */
}

/* Efecto hover */
.categorias button:hover {
  background-color: red; /* Cambio a rojo al pasar el mouse */
  transform: scale(1.1); /* Efecto de agrandamiento */
}


/* Estilos generales para ambos botones */
.whasapp,
.carritoemoti {
  position: fixed;
  z-index: 1000;
}


/* WhatsApp */
.whasapp {
  bottom: 20px;
  right: 20px;
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

.infocliente{
  color: white;
  font-size: 25px;
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

@media screen and (max-width: 768px) {
  header {
    height: 400px;
    padding: 20px;
    background-position: center;
    background-size: cover;
  }
 
  .logo-large {
    width: 440px;
    margin-top: 10px;
  }
  .navbar-container {
    padding: 5px ;
    gap: 10px;
  }
  .navbar-left {
    gap: 10px;
  }
  .navbar-right {
    gap: 10px;
    margin-right: 10px;
  }
  .btn-categorias {
    font-size: 10px;
    padding: 5px;
  }
  .dropdown-categorias {
    width: 130px;
  }
  .item-categoria {
    font-size: 12px;
    padding: 8px 5px;
  }
  .form-buscador {
    max-width: 210px;
  }
  .input-buscador {
    font-size: 10px;
    padding: 8px 10px;
  }
  .boton-buscador {
    font-size: 10px;
    padding: 8px 14px;
  }
  .icono-link i {
    font-size: 0.9em;
    margin-right:12px;
  }

  #hamburguesa {
    font-size: 1.6rem;
    top: 20px;
    right: 10px;
  }
  #cerrarHamburguesa {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  .menuHamburguesa {
    width: 75%; 
    padding: 15px;
    text-align: left; 
  }
  .menuHamburguesa ul {
    align-items: flex-start; 
  }
  .menuHamburguesa .lihamburguesa {
    font-size: 1em;
    padding: 8px 0;
    text-align: left;
    width: 100%;
  }
  .menuHamburguesa .lihamburguesa a {
    padding-left: 10px;
    font-size: 1em;
  }
  .menuHamburguesa #libienvenido,
  .menuHamburguesa .infocliente {
    text-align: left;
    padding-left: 10px;
    font-size: 0.95em;
  }
  .menuHamburguesa #lilinea {
    text-align: center;
    font-size: 0.8em;
  }
  .whasapp {
    bottom: 15px;
    right: 15px;
  }
  .whatsapp-btn {
    width: 45px;
    height: 45px;
    font-size: 22px;
  }
  .carritoemoti a {
    width: 45px;
    height: 45px;
    font-size: 22px;
  }
  .sobre-nosotros {
    padding: 30px 20px;
  }
  .contenedor-nosotros {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }
  .imagen-nosotros {
    flex: none;
    width: 100%;
  }
  .superposicion-video {
    position: absolute;
    bottom: 10px;
    left: 180px;
    width: 130px;
    border-radius: 10px;
  }
  .informacion-contacto {
    display: none;
  }
  .texto-nosotros h2 {
    font-size: 1.5rem;
  }
  .texto-nosotros p {
    font-size: 1rem;
    color: #333;
  }
  .boton-reproducir {
    font-size: 1.5rem;
    padding: 8px;
  }
  .boton {
    font-size: 1rem;
    padding: 8px 15px;
  }
  .pie_estadistico {
    width: 100%;
    height: auto;
    max-width: 300px; /* Puedes ajustar esto según tu diseño */
  }
  .categorias {
    justify-content: flex-start; /* Alinea los botones a la izquierda en lugar de centrar */
    gap: 10px; /* Menor espacio entre botones */
  }
  .categorias button {
    padding: 12px 20px; /* Tamaño reducido en dispositivos móviles */
    font-size: 16px; /* Texto ligeramente más pequeño */
  }
  .categorias button {
    padding: 10px 15px; /* Aún más pequeño en pantallas muy pequeñas */
    font-size: 14px; /* Texto aún más pequeño */
  }
  .whatsapp-btn,
  .carritoemoti a {
    width: 60px;
    height: 60px;
    font-size: 22px;
  }
  .whasapp {
    bottom: 15px;
    right: 15px;
  }
  .carritoemoti {
    bottom: 80px; /* Espacio suficiente entre botones */
    right: 15px;
  }
  .reserva {
    padding: 30px 15px;
  }
  .contenedor-reserva {
    flex-direction: column;
    align-items: center;
  }
  .imagen-reserva img {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: 10px;
  }
  .formulario-reserva {
    width: 100%;
    max-width: 500px;
    padding: 15px;
    height: auto;
    box-sizing: border-box;
  }
  .campo {
    margin-bottom: 15px;
  }
  .boton {
    width: 100%;
    padding: 12px;
    font-size: 1.1rem;
  }
  .contacto {
    width: 100%;
    margin-left: 0;
    padding: 15px;
    font-size: 1rem;
  }
  .contenedor-footer {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
}

@media screen and (min-width: 768px) and (max-width: 1024px) {
  /* SOBRE NOSOTROS RESPONSIVE */

  .contenedor-nosotros {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }

  .imagen-nosotros,
  .texto-nosotros {
    flex: 1 1 100%;
  }

  .superposicion-video {
    width: 240px; /* Más pequeña */
    left: 60%; /* Ajustada para mantener posición */
    bottom: 10px; /* Un poco más arriba para evitar desborde */
  }

  .miniatura-video {
    border-radius: 8px;
  }

  .boton-reproducir {
    font-size: 1rem;
    padding: 6px;
  }

  .informacion-contacto {
    font-size: 1.2rem;
    padding: 4px 8px;
    bottom: 5px;
    left: 31%;
    height: auto;
  }

  .texto-nosotros h2 {
    font-size: 1.8rem;
  }

  .texto-nosotros p {
    font-size: 1rem;
  }

  /* RESERVA RESPONSIVE */

  .contenedor-reserva {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .imagen-reserva img {
    max-width: 100%;
    height: auto;
  }

  .formulario-reserva {
    width: 100%;
    height: auto;
  }

  .contacto {
    margin-left: 0;
    width: 100%;
    font-size: 0.9rem;
    top: 0;
  }
}

</style>
