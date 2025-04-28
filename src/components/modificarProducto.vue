<script>
import Swal from 'sweetalert2';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';

export default{
    setup(){
        const route = useRoute()
        const query = route.query
        const imagePreviewUrl = ref(null);
        const status = ref(null)
        const productoModificado = ref({
            id_producto_validar: query.productoId,
            id_producto:"",
            nombre:"",
            descripcion:"",
            precio:0,
            stock:0,
            
        })
        
        const queryValidar = Boolean(query?.productoId);
        const fileInput =  ref(null);
        const modificadoProducto = async () => {
            const formData = new FormData();
            formData.append("id_producto", productoModificado.value.id_producto);
            formData.append("nombre", productoModificado.value.nombre);
            formData.append("descripcion", productoModificado.value.descripcion);
            formData.append("precio", productoModificado.value.precio);
            formData.append("stock", productoModificado.value.stock);
            if (fileInput.value){
                formData.append("file", fileInput.value);
            }
            try {

                const respuesta = await axios.put(
                    `http://127.0.0.1:8000/modificarProducto/${productoModificado.value.id_producto_validar}`, formData,{
                    headers:{
                        'Content-Type': 'multipart/form-data'
                    },
                });

                status.value = respuesta.status
                Swal.fire({ icon: 'success', title: 'Modificado' });
                
            
            
            }catch (error) {
                if (error.response) {
                    status.value = error.response.status; // Capturar el estado del error
                    if (status.value === 500) {
                        Swal.fire({ icon: 'error', title: 'ID ya utilizado' });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Producto no existe' });
                    }
                } else {
                    Swal.fire({ icon: 'error', title: 'Error en la conexión al servidor' });
                }
            }
        };

        const router = useRouter();
        const onFilechange = (event) => {
        const file = event.target.files[0];
        fileInput.value = file;
        if (file) {
            imagePreviewUrl.value = URL.createObjectURL(file);
        } else {
            imagePreviewUrl.value = null;
        }
    };


    return {
  productoModificado,
  modificadoProducto,
  router,
  onFilechange,
  queryValidar,
  imagePreviewUrl
};

    }
}

</script>
<template>
    <div class="formulario-container">
      <form @submit.prevent="modificadoProducto" class="formulario">
        <div class="titulo-header">
          <h1 id="titulo">REGISTRO</h1>
          <button type="button" @click="router.go(-1)" class="cerrar">X</button>
        </div>
  
        <div class="formulario-grid">
          <div class="columna">
            <div class="campo">
              <label>ID Modificar:</label>
              <input v-if="!queryValidar" v-model="productoModificado.id_producto_validar" type="text">
            </div>
  
            <div class="campo">
              <label>ID Producto:</label>
              <input v-model="productoModificado.id_producto" type="text">
            </div>
  
            <div class="campo">
              <label>Nombre:</label>
              <input v-model="productoModificado.nombre" type="text" required>
            </div>
          </div>
  
          <div class="columna">
            <div class="campo">
              <label>Descripcion:</label>
              <input v-model="productoModificado.descripcion" type="text" required>
            </div>
  
            <div class="campo">
              <label>Precio:</label>
              <input v-model="productoModificado.precio" type="number" required>
            </div>
  
            <div class="campo">
              <label>Stock:</label>
              <input v-model="productoModificado.stock" type="number" required>
            </div>
          </div>
  
          <div class="columna">
            <div class="campo">
              <label>Imagen:</label>
              <input type="file" @change="onFilechange" required>
              <div class="imagen-preview" v-if="imagePreviewUrl">
                <p>Previsualización:</p>
                <img :src="imagePreviewUrl" alt="Previsualización de imagen" />
              </div>

            </div>
          </div>
        </div>
  
        <button type="submit" class="boton">MODIFICAR</button>
      </form>
    </div>
  </template>
  
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
  