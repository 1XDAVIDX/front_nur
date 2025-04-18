<template>
    <div class="formulario-container">
      <form @submit.prevent="insertarProducto" class="formulario">
        <div class="titulo-header">
          <h1 class="titulo">Registro de Producto</h1>
          <button type="button" @click="router.go(-1)" class="cerrar">✖</button>
        </div>
  
        <!-- Contenedor en 3 columnas -->
        <div class="formulario-grid">
          <!-- Columna 1 -->
          <div class="columna">
            <label class="campo">
              ID Producto:
              <input v-model="producto.id_producto" type="text" required />
            </label>
            <label class="campo">
              Nombre:
              <input v-model="producto.nombre" type="text" required />
            </label>
            <label class="campo">
              Descripción:
              <input v-model="producto.descripcion" type="text" required />
            </label>
          </div>
  
          <!-- Columna 2 -->
          <div class="columna">
            <label class="campo">
              Precio:
              <input v-model="producto.precio" type="number" required />
            </label>
            <label class="campo">
              Stock:
              <input v-model="producto.stock" type="number" required />
            </label>
            <label class="campo">
              Categoría:
              <select v-model="producto.categotia" required>
                <option disabled value="">Selecciona una categoría</option>
                <option value="juguetes">Juguetes</option>
                <option value="accesorios">Accesorios</option>
              </select>
            </label>
          </div>
  
          <!-- Columna 3 -->
          <div class="columna">
            <label class="campo">
              Imagen:
              <input type="file" @change="onFilechange" />
            </label>
            <div v-if="imagenPreview" class="imagen-preview">
              <p>Previsualización:</p>
              <img :src="imagenPreview" alt="Previsualización" />
            </div>
          </div>
        </div>
  
        <button type="submit" class="boton">Registrar Producto</button>
      </form>
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import { ref } from 'vue';
  
  export default {
    setup() {
      const router = useRouter();
      const producto = ref({
        id_producto: "",
        nombre: "",
        descripcion: "",
        precio: 0,
        stock: 0,
        categotia: "",
      });
  
      const fileInput = ref(null);
      const imagenPreview = ref(null);
  
      const onFilechange = (event) => {
        const file = event.target.files[0];
        fileInput.value = file;
        if (file) {
          imagenPreview.value = URL.createObjectURL(file);
        }
      };
  
      const insertarProducto = async () => {
        const formData = new FormData();
        formData.append("id_producto", producto.value.id_producto);
        formData.append("nombre", producto.value.nombre);
        formData.append("descripcion", producto.value.descripcion);
        formData.append("precio", producto.value.precio);
        formData.append("stock", producto.value.stock);
        formData.append("categotia", producto.value.categotia);
  
        if (fileInput.value) {
          formData.append("file", fileInput.value);
        }
  
        try {
          await axios.post("http://127.0.0.1:8000/insertar/producto", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
  
          Swal.fire({
            icon: "success",
            title: "Producto agregado",
            timer: 1500,
            showConfirmButton: false,
          });
  
          router.go(-1);
        } catch (error) {
          const longitudDescripcion = producto.value.descripcion.length;
          Swal.fire({
            icon: longitudDescripcion > 20 ? "warning" : "error",
            title: longitudDescripcion > 20 ? "Descripción muy larga" : "ID ya está utilizado",
            text: "Por favor revisa los datos ingresados.",
          });
        }
      };
  
      return {
        producto,
        insertarProducto,
        router,
        onFilechange,
        imagenPreview,
      };
    },
  };
  </script>
  
  
  <style scoped>
  /* Contenedor que centra el formulario y permite scroll */
  .formulario-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    padding: 60px 16px;
    background-color: #f9f9f9;
    box-sizing: border-box;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  
  /* Estilos del formulario */
  .formulario {
    width: 100%;
    max-width: 900px; /* Ancho suficiente para 3 columnas */
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  .titulo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .titulo {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .cerrar {
    background: none;
    border: none;
    font-size: 1.3rem;
    color: #f44336;
    cursor: pointer;
  }
  
  /* Contenedor Grid para 3 columnas */
  .formulario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  /* Cada columna se organiza de forma vertical */
  .columna {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  /* Estilos para cada campo */
  .campo {
    display: flex;
    flex-direction: column;
  }
  
  /* Estilos para inputs y select */
  .campo input,
  .campo select {
    padding: 0.6rem;
    margin-top: 0.5rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    width: 100%;
  }
  
  /* Botón de envío */
  .boton {
    padding: 0.9rem;
    width: 100%;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .boton:hover {
    background-color: #388e3c;
  }
  
  /* Estilos para la previsualización de imagen */
  .imagen-preview {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 0.6rem;
  }
  
  .imagen-preview p {
    margin-bottom: 0.5rem;
  }
  
  .imagen-preview img {
    max-width: 100%;
    max-height: 150px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  </style>