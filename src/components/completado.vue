<script>
import Swal from 'sweetalert2';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default{
    setup(){
        const verificar = ref({
            id_compra:0,
            id_usuario:""
        })
        const factura = ref({})
        const pedidoHecho = async () =>{
            try {
                const respuesta =await axios.delete("http://127.0.0.1:8000/completada/"+verificar.value.id_compra+"/"+verificar.value.id_usuario);
                factura.value = respuesta.data
                console.log("ok",factura.value)
                Swal.fire({
                    icon:"success",
                    title:"Pedido Hecho",
                    text:`Producto: ${factura.value.id_producto} Cantidad:${factura.value.cantidad} Total:${factura.value.total}\nID compra:${factura.value.id_compra} ID Usuario:${factura.value.id_usuario} Nombre:${factura.value.nombre} Correo:${factura.value.email}`
                })

            } catch (error) {
                Swal.fire({
                    icon:"error",
                    title:"Datos no son correctos"
                })
            }
        }
        const router = useRouter()
        return{
            verificar,
            pedidoHecho,
            factura,
            router
        }
    }
}
</script>
<template>
    <form @submit.prevent="pedidoHecho" class="formulario">
        <div id="tituloheader">
            <h1 id="titulo">Proceso Pedido</h1>
            <button type="button" @click="router.go(-1)" id="x">X</button>
        </div>
        <label class="respuesta">ID Compra:
            <input v-model="verificar.id_compra" type="number" required>
        </label>
        <label class="respuesta">ID Usuario:
            <input v-model="verificar.id_usuario" type="text" required>
        </label>
        <button type="submit" class="boton">Completado</button>
    </form>
</template>

<style>
.formulario {
    width: 100%;
    max-width: 400px; /* Ancho máximo */
    margin: 40px auto; /* Centrado vertical */
    padding: 20px; /* Espaciado interno */
    border-radius: 10px; /* Bordes redondeados */
    background-color: #f9f9f9; /* Color de fondo */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Sombra */
}

#tituloheader {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#titulo {
    font-size: 24px; /* Tamaño del texto */
    color: #333; /* Color del texto */
}

#x {
    background: none; 
    border: none; 
    font-size: 20px; 
    color: #ff5555; 
    cursor: pointer; 
}

.respuesta {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    width: 100%;
}

.respuesta label {
    margin-bottom: 10px; /* Espaciado entre las etiquetas */
    font-weight: bold; /* Negrita para las etiquetas */
    color: #555; /* Color de las etiquetas */
}

.respuesta input {
    padding: 10px; /* Espaciado interno */
    border: 1px solid #ccc; /* Borde del input */
    border-radius: 5px; /* Bordes redondeados */
    transition: border 0.3s; /* Transición suave para el borde */
}

.respuesta input:focus {
    border-color: #007BFF; /* Color del borde al enfocar */
    outline: none; /* Sin contorno */
}

.boton {
    margin-top: 30px;
    padding: 10px; /* Espaciado interno */
    background-color: #007BFF; /* Color de fondo */
    color: white; /* Color del texto */
    border: none; /* Sin borde */
    border-radius: 5px; /* Bordes redondeados */
    cursor: pointer; /* Cursor pointer para indicar interactividad */
    transition: background-color 0.3s; /* Transición suave para el fondo */
}

.boton:hover {
    background-color: #0056b3; /* Color de fondo al pasar el mouse */
}
</style>

