<script>
import Swal from 'sweetalert2';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';


export default {
    setup(){
        const route = useRoute();
        const query = route.query;
        const pregun = Boolean(query?.productoId);
        
        const iD_eliminador = ref({
            id_producto : query.productoId 
        })
        
        const message = ref('');

        const eliminarProducto = async () =>{
            try {
                const respuesta =await axios.delete('http://127.0.0.1:8000/eliminar/' + iD_eliminador.value.id_producto);
                message.value = respuesta.data.message
                message.value = Swal.fire({
                    icon:"success",
                    title:"¡Producto eliminado!"

                    
                    
                });
                
            } catch (error) {
                
                message.value = Swal.fire({
                    icon:"error",
                    title:"Producto no existe"
                });
            }

        };
        const router = useRouter()
        return {
            iD_eliminador,
            eliminarProducto,
            router,
            pregun
            
            
            
        };
    }


};


</script>
<template>
    <form @submit.prevent="eliminarProducto" class="formulario">
        <div id="tituloheader">
        <h1 id="titulo">Eliminar Producto </h1>
        <button type="button" @click="()=>router.go(-1)"  id="x">X</button>
        </div>
        <label v-if="!pregun"  class="respuesta">ID Producto:
            <input v-model="iD_eliminador.id_producto" type="text" required>
        </label>
        <button type="submit" class="boton">Eliminar</button>


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

.formulario {
    
    position: fixed; 
    top: 10%; 
    width: 20%;
    left: 50%; 
    transform: translateX(-50%); 
    background-color: white;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    z-index: 1000; 


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
#tituloheader{
    display: flex;
    
}

#x{
    background-image: url('./img/x.png');
    background-size: contain;
    margin-left: auto;
    width: 40px;
    height: 40px;
    border-radius: 50%;

}

</style>