<script>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';

export default{
    setup(){
        const productoModificado = ref({
            id_producto_validar:"",
            id_producto:"",
            nombre:"",
            descripcion:"",
            precio:0,
            stock:0,
        })
        const message = ref('')
        const modificadoProducto = async ()=>{
            try {
                const respuesta =await axios.put('http://127.0.0.1:8000/modificarProducto/'+ productoModificado.value.id_producto_validar, productoModificado.value);
                message.value = respuesta.data.message
                message.value = Swal.fire({
                    icon:'success',
                    title:'Modificado'
                })
            } catch (error) {
                Swal.fire({
                    icon:"error",
                    title:"Producto no existe"
                })
            }
        }
        const router = useRouter();

        return{
            productoModificado,
            modificadoProducto,
            router
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
    <label class="respuesta" >ID Modificar:
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