<script>
import Swal from 'sweetalert2';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

export default{
    setup(){
        //const id_usu = ref({})
        const decodificado = JSON.parse(localStorage.getItem('access_token'))
        const idlocalestore = decodificado?.id_usuario;
        const verificarUsuario = Boolean(idlocalestore)
        const route = useRoute();
        const verificar = ref({
            id_producto:"",
            id_usuario:idlocalestore,
            cantidad:0
        })
        const comprar = async ()=>{
            const query = route.query;
            try {
                const respuesta =await axios.post("http://127.0.0.1:8000/carrito",{
                    ...verificar.value,
                    id_producto: query.productoId,
                    
                })
                Swal.fire({
                    icon:"success",
                    title:"es aqui",
                    
                })
            } catch (error) {
                Swal.fire({
                    icon:"error",
                    text:"Error al comprar"
                })
            }
        }
        console.log("valores:", idlocalestore )
        const router = useRouter()
        return{
            verificar,
            comprar,
            router,
            verificarUsuario
        }
    }
}
</script>
<template>
<form @submit.prevent="comprar" class="formulario">
        <div id="tituloheader">
        <h1 id="titulo">Carrito De Compras</h1>
        <button type="button" @click="router.go(-1)"  id="x">X</button>
        </div>
        <!-- <label class="respuesta">ID Producto:
            <input v-model="verificar.id_producto" type="text" required>
        </label> -->
        <label v-if="!verificarUsuario" class="respuesta">ID Usuario:
            <input v-model="verificar.id_usuario" type="text" required>
        </label>
        <label class="respuesta">Stock:
            <input v-model="verificar.cantidad" type="number" required>
        </label>
        <button type="submit" class="boton">Agregar</button>
        <RouterLink v-if="!verificarUsuario" to="/registroUsuario">
            <button type="submit" class="boton">No tengo ID</button>
        </RouterLink>
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
</style>