<script>
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';

export default {
    setup() {
        const producto = ref({
            id_producto:"",
            nombre: "",
            descripcion: "",
            precio: 0,
            stock: 0,
            
        });
        const message = ref('');

        const insertarProducto = async () => {
            try {
                const respuesta = await axios.post('http://127.0.0.1:8000/insertar/producto', producto.value);
                message.value = respuesta.data.message;
                message.value = Swal.fire({
                    icon: "success",
                    title:"Producto agregado"
                })
            } catch (error) {
                console.error("Error al registrar datos", error);
                let longitudDescripcion = producto.value.descripcion.length
                
                if (longitudDescripcion > 20){
                    message.value = Swal.fire({
                    icon:"warning",
                    title:"Descripcion muy larga", 
                    text: error
                })
                }else{message.value = Swal.fire({
                    icon:"error",
                    title:"ID ya esta utilizado", 
                    text: error
                })}
                
            }
        };

        const router= useRouter();

        
        return {
            producto,
            insertarProducto,
            router
        };
    }
};
</script>

<template>
    
    <form @submit.prevent="insertarProducto" class="formulario">
        <div id="tituloheader">
        <h1 id="titulo">REGISTRO</h1>
        <button type="button" @click="router.go(-1)"  id="x">X</button>
        </div>
        <label class="respuesta">ID Producto:
            <input v-model="producto.id_producto" type="text" required>
        </label>
        <label class="respuesta">Nombre:
            <input v-model="producto.nombre" type="text" required>
        </label>
        <label class="respuesta">descripcion:
            <input v-model="producto.descripcion" type="text" required>
        </label>
        <label class="respuesta">Precio:
            <input v-model="producto.precio" type="number" required>
        </label>
        <label class="respuesta">Stock:
            <input v-model="producto.stock" type="number" required>
        </label>
        <button type="submit" class="boton">Registrar</button>
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
