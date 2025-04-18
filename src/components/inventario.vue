<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

export default {
  setup() {
    const inventario = ref([]);
    
    const totalesPorUsuario = ref([]);

    const currentPageInventario = ref(1);
    const currentPageTotales = ref(1);
    const itemsPerPage = 10;

    const paginatedInventario = computed(() => {
      const start = (currentPageInventario.value - 1) * itemsPerPage;
      return inventario.value.slice(start, start + itemsPerPage);
    });

    const paginatedTotales = computed(() => {
      const start = (currentPageTotales.value - 1) * itemsPerPage;
      return totalesPorUsuario.value.slice(start, start + itemsPerPage);
    });

    const totalPagesInventario = computed(() => Math.ceil(inventario.value.length / itemsPerPage));
    const totalPagesTotales = computed(() => Math.ceil(totalesPorUsuario.value.length / itemsPerPage));
    const busquedad = ref('');
    const enviarBusqueda = () => {
      datosInventario();
    };
    const datosInventario = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/compraTerminado');
        inventario.value = respuesta.data;

        if (busquedad.value.trim()!== '') {
          inventario.value = inventario.value.filter(item => {
            return item.id_usuario.toLowerCase().includes(busquedad.value.toLowerCase());
          });
          busquedad.value = '';
        } else {
          inventario.value = inventario.value;
          busquedad.value = '';      
        }

        const agrupado = {};
        inventario.value.forEach(item => {
          if (!agrupado[item.id_usuario]) {
            agrupado[item.id_usuario] = {
              id_usuario: item.id_usuario,
              id_productos: [],
              total: 0
            };
          }
          agrupado[item.id_usuario].id_productos.push(item.id_producto);
          agrupado[item.id_usuario].total += item.total;
        });

        totalesPorUsuario.value = Object.values(agrupado);
      } catch (error) {
        console.log("No se cargaron los datos ", error);
      }
    };

    const mostrarModal = ref(false);
    const datosModificar = ref({});
    const abrirModal = (p) => {
      datosModificar.value = { 
        id_CompraTerminada: p.id_CompraTerminada,
        fecha: p.fecha,
        estado: p.estado,
        guiaTranporte: p.guiaTranporte
      };
      mostrarModal.value = true;
    };

    

    const modificarCompraTerminada = async () => {
      try {
        const id = datosModificar.value.id_CompraTerminada;
        const payload = {
          fecha: datosModificar.value.fecha,
          estado: datosModificar.value.estado,
          guiaTranporte: datosModificar.value.guiaTranporte
        };

        const responder= await axios.put(`http://127.0.0.1:8000/editarCompraTer/${id}`, payload);
        
        Swal.fire({
          icon: "success",
          title: "Datos Actualizados"
        }).then(()=> { cerrarModal(); datosInventario();});

       
      } catch (error) {
        console.error("Error al actualizar:", error);
        Swal.fire({
          icon: "error",
          title: "Error al actualizar"
        });
      }
    }
    const cerrarModal = () => {
      mostrarModal.value = false;
    };


    const router = useRouter();

    onMounted(() => {
      datosInventario();
    });

    return {
      mostrarModal,
      abrirModal,
      cerrarModal,
      datosModificar,
      modificarCompraTerminada,
      busquedad,
      enviarBusqueda,
      inventario,
      totalesPorUsuario,
      paginatedInventario,
      paginatedTotales,
      currentPageInventario,
      currentPageTotales,
      totalPagesInventario,
      totalPagesTotales,
      router
    };
  }
};
</script>

<template>
  <button type="button" @click="router.go(-1)" id="x">X</button>

  
  <div class="tabla">
    <h2>Lista de Compras Terminadas</h2>

    <!-- Buscador estilizado -->
    <ul>
      <li class="contenedor-buscador">
        <form @submit.prevent="enviarBusqueda" class="form-buscador">
          <input
            type="text"
            v-model="busquedad"
            placeholder="Buscar productos..."
            class="input-buscador"
          />
          <button type="submit" class="boton-buscador"><i class="fas fa-search"></i></button>
        </form>
      </li>
    </ul>

    <table>
      <thead>
        <tr>
          <th>ID Compra Terminada</th>
          <th>ID Compra</th>
          <th>ID Usuario</th>
          <th>Producto</th>
          <th>ID Producto</th>
          <th>Cantidad</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Guía Transporte</th>
          <th>Total</th>
          <th>Editarlo</th>
        </tr>
      </thead>
      <tbody class="iteracionInventario">
        <tr v-for="i in paginatedInventario" :key="i.id_CT">
          <td>{{ i.id_CompraTerminada }}</td>
          <td>{{ i.id_compra }}</td>
          <td>{{ i.id_usuario }}</td>
          <td>{{ i.nombre_producto }}</td>
          <td>{{ i.id_producto }}</td>
          <td>{{ i.cantidad }}</td>
          <td>{{ i.fecha }}</td>
          <td>{{ i.estado }}</td>
          <td>{{ i.guiaTranporte }}</td>
          <td>{{ i.total }}</td>
          <td><button @click="abrirModal(i)" class="boton-editar"><i class="fas fa-pencil-alt"></i></button></td>
        </tr>
      </tbody>
    </table>
    <div class="paginacion">
      <button @click="currentPageInventario--" :disabled="currentPageInventario === 1">Anterior</button>
      <span>Página {{ currentPageInventario }} de {{ totalPagesInventario }}</span>
      <button @click="currentPageInventario++" :disabled="currentPageInventario === totalPagesInventario">Siguiente</button>
    </div>
  </div>

  <div class="tabla">
    <h2>Totales por Usuario</h2>
    <table>
      <thead>
        <tr>
          <th>ID Usuario</th>
          <th>ID Producto</th>
          <th>Total Acumulado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in paginatedTotales" :key="usuario.id_usuario">
          <td>{{ usuario.id_usuario }}</td>
          <td>{{ usuario.id_productos.join(', ') }}</td>
          <td>{{ usuario.total }}</td>
          
        </tr>
      </tbody>
    </table>
    <div class="paginacion">
      <button @click="currentPageTotales--" :disabled="currentPageTotales === 1">Anterior</button>
      <span>Página {{ currentPageTotales }} de {{ totalPagesTotales }}</span>
      <button @click="currentPageTotales++" :disabled="currentPageTotales === totalPagesTotales">Siguiente</button>
    </div>
  </div>


  <!-- Modal -->
  <div v-if="mostrarModal" class="modal-overlay">
    <div class="modal-contenido">
      <h3>Editar Compra Terminada</h3>
      <form @submit.prevent="modificarCompraTerminada">
        <div class="form-group">
          <label for="fecha">Fecha:</label>
          <input type="date" id="fecha" v-model="datosModificar.fecha" />
        </div>
        <div class="form-group">
          <label for="estado">Estado:</label>
          <input type="text" id="estado" v-model="datosModificar.estado" />
        </div>
        <div class="form-group">
          <label for="guiaTranporte">Guía Transporte:</label>
          <input type="text" id="guiaTranporte" v-model="datosModificar.guiaTranporte" />
        </div>
        <div class="modal-buttons">
          <button type="submit" class="guardar">Guardar</button>
          <button type="button" @click="cerrarModal" class="cerrar">X</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-contenido {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-contenido h3 {
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

.modal-buttons .guardar {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
}

.modal-buttons .guardar:hover {
  background-color: #45a049;
}

.modal-buttons .cerrar {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
}

.modal-buttons .cerrar:hover {
  background-color: #e53935;
}

.contenedor-buscador{
  padding: 50px;
  display: flex;
  justify-content: right;
}
.iteracionInventario {
  color: black;
}

.tabla {
  width: 100%;
  overflow-x: auto;
  margin: 20px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
  color: #333;
  font-weight: bold;
}

td {
  background-color: #fff;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}

#x {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
}

#x:hover {
  background-color: #ff3333;
}

.paginacion {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.paginacion button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.paginacion button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
