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
            categotia:"",
            
        });
        const fileInput =  ref(null);
        const onFilechange = (event) =>{
            fileInput.value = event.target.files[0];
        };

        const insertarProducto = async () => {
            const formData = new FormData();
            formData.append("id_producto", producto.value.id_producto);
            formData.append("nombre", producto.value.nombre);
            formData.append("descripcion", producto.value.descripcion);
            formData.append("precio", producto.value.precio);
            formData.append("stock", producto.value.stock);
            formData.append("categotia", producto.value.categotia);
            if (fileInput.value){
                formData.append("file", fileInput.value);
            }
            try {
                const respuesta = await axios.post('http://127.0.0.1:8000/insertar/producto', formData,{
                    headers:{
                        'Content-Type': 'multipart/form-data'
                    },
                });
                Swal.fire({
                    icon: "success",
                    title:"Producto agregado"
                })
            } catch (error) {
                console.error("Error al registrar datos", error);
                let longitudDescripcion = producto.value.descripcion.length
                
                if (longitudDescripcion > 20){
                    Swal.fire({
                    icon:"warning",
                    title:"Descripcion muy larga", 
                    text: error
                })
                }else{ Swal.fire({
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
            router,
            onFilechange
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
        <label class="respuesta">Categoría:
            <select v-model="producto.categotia" required>
                <option value="juguetes">Juguetes</option>
                <option value="accesorios">Accesorios</option>
            </select>
        </label>

        <label class="respuesta">Imagen:
            <input type="file" @change="onFilechange"/>
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
