<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

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

    const datosInventario = async () => {
      try {
        const respuesta = await axios.get('http://127.0.0.1:8000/compraTerminado');
        inventario.value = respuesta.data;

        const agrupado = {};
        inventario.value.forEach(item => {
          if (!agrupado[item.id_usuario]) {
            agrupado[item.id_usuario] = {
              id_usuario: item.id_usuario,
              total: 0
            };
          }
          agrupado[item.id_usuario].total += item.total;
        });

        totalesPorUsuario.value = Object.values(agrupado);
      } catch (error) {
        console.log("No se cargaron los datos ", error);
      }
    };

    const router = useRouter();

    onMounted(() => {
      datosInventario();
    });

    return {
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
          <th>Total Acumulado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in paginatedTotales" :key="usuario.id_usuario">
          <td>{{ usuario.id_usuario }}</td>
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
</template>

<style scoped>
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
