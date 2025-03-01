<script>
import Swal from 'sweetalert2';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';

export default{
    setup(){
        const route = useRoute()
        const query = route.query
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
        const onFilechange = (event) =>{
            fileInput.value = event.target.files[0];
        };

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

        return{
            productoModificado,
            modificadoProducto,
            router,
            onFilechange,
            queryValidar
        };
    }
}

</script>
<template>
<form @submit.prevent="modificadoProducto" class="formulario">
    <div id="tituloheader">
        <h1 id="titulo">REGISTRO</h1>
        <button type="button" @click="router.go(-1)"  id="x">X</button>
        </div>
    <label class="respuesta" v-if="!queryValidar">ID Modificar:
        <input v-model="productoModificado.id_producto_validar" type="text">
    </label>
    <label  class="respuesta">ID Producto:
        <input v-model="productoModificado.id_producto" type="text">
    </label>
    <label class="respuesta">Nombre:
        <input v-model="productoModificado.nombre" type="text" required>
    </label>
    <label class="respuesta">descripcion:
        <input v-model="productoModificado.descripcion" type="text" required>
    </label>
    <label class="respuesta">Precio:
        <input v-model="productoModificado.precio" type="number" required>
    </label>
    <label class="respuesta">Stock:
        <input v-model="productoModificado.stock" type="number" required>
    </label>

    <label class="respuesta">Imagen:
    <input type="file" @change="onFilechange" required>
    </label>

    <button type="submit" class="boton">MODIFCAR</button>

</form>

</template>
<style>

#x {
    background: none; 
    border: none; 
    font-size: 20px; 
    color: #ff5555; 
    cursor: pointer; 
}

.formulario{
    
    width: 20%;
    margin-left: auto;
    margin-right: auto;
}
.respuesta{
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    width: 100%;
}
.boton{
    margin-top: 30px;
    
    display: block;
    width: 100%; 
    box-sizing: border-box;
    
}

.mensaje{
    text-align: center;
    margin-top: 20px;
    background-color: seagreen;
    color:  white;
    width: 20%;
    margin-left: auto;
    margin-right: auto;
}
</style>