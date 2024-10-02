<template>
    <section class="cards">
      <ul>
        <li v-for="producto in data" :key="producto.id_producto" class="card">
          <div class="card-content">
            <div class="imagen">
              
            </div>
            <strong>ID:</strong> {{ producto.id_producto }}<br>
            <strong>Nombre:</strong> {{ producto.nombre }}<br>
            <strong>Descripción:</strong> {{ producto.descripcion }}<br>
            <strong>Precio:</strong> ${{ producto.precio.toFixed(2) }}<br>
            <strong>Stock:</strong> {{ producto.stock }}<br>
          </div>
        </li>
      </ul>
    </section>
</template>
  
<script>
  import axios from 'axios';
  import { ref, onMounted } from 'vue';
  
  export default {
    setup() {
      const data = ref([]);
      const consultaProducto = async () => {
        try {
          const respuesta = await axios.get('http://127.0.0.1:8000/consultarProductos');
          data.value = respuesta.data;
        } catch (error) {
          console.log("No se cargaron los datos", error);
        }
      };
  
      onMounted(consultaProducto);
      return { data };
    }
  };
</script>
  
<style scoped>
  .cards {
    background-color: rgb(250, 245, 245);
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  
  ul {
    display: flex;
    flex-wrap: wrap; 
    list-style: none;
    padding: 0;
    justify-content: center;
    gap: 20px;
  }
  
  .card {
    background-color: rgb(255, 255, 255);
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    padding: 20px;
    width: 300px;
    text-align: left;
  }
  
  .card-content {
    font-family: 'Arial', sans-serif;
  }
  
  .imagen {
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    margin-bottom: 15px;
    background-color: rgb(60, 231, 55);
  }
  
  .imagen img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  strong {
    color: rgb(0, 153, 255);
  }
  
 
</style>
