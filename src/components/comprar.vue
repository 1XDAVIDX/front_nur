<script>
import Swal from 'sweetalert2';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const decodificado = JSON.parse(localStorage.getItem('access_token'));
    const idlocalestore = decodificado?.id_usuario;
    const route = useRoute();
    const query = route.query;
    const verificarUsuario = Boolean(idlocalestore);
    const verificarCantidad = Boolean(query.cantidad);
    const verificar = ref({
      id_producto: "",
      id_usuario: idlocalestore,
      cantidad: query?.cantidad || 1 // Establecer valor predeterminado a 1
    });

    const comprar = async () => {
      const query = route.query;
      try {
        const respuesta = await axios.post("http://127.0.0.1:8000/compra", {
          ...verificar.value,
          id_producto: query.productoId,
        });
        Swal.fire({
          icon: "success",
          title: "Compra Exitosa",
          html: `
            <b>ID Compra:</b> ${respuesta.data.id_compra} <br>
            <b>ID Producto:</b> ${respuesta.data.id_producto} <br>
            <b>Nombre Producto:</b> ${respuesta.data.nombre_producto} <br>
            <b>Descripción:</b> ${respuesta.data.descripcion} <br>
            <b>Precio:</b> ${respuesta.data.precio} <br>
            <b>Stock:</b> ${respuesta.data.stock} <br>
            <b>Total:</b> ${respuesta.data.total}
          `,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          text: "Error al comprar"
        });
      }
    };

    const verificar2 = ref({
      id_carrito: query.id_carrito,
    });
    const validarCarrito = Boolean(query.id_carrito);
    const factura = ref({});
    const pedidoHecho = async () => {
      try {
        const respuesta = await axios.delete("http://127.0.0.1:8000/quitar/" + verificar2.value.id_carrito);
        factura.value = respuesta.data;
        Swal.fire({
          icon: "success",
          title: "Pedido Hecho",
          text: "Eliminado Del carrito"
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Datos no son correctos"
        });
      }
    };

    const comprarYEliminar = async () => {
      await comprar();
      if (validarCarrito) {
        await pedidoHecho();
      }
    };

    const incrementarCantidad = () => {
      verificar.value.cantidad++;
    };

    const decrementarCantidad = () => {
      if (verificar.value.cantidad > 1) {
        verificar.value.cantidad--;
      }
    };

    const router = useRouter();
    return {
      verificar,
      comprar,
      router,
      verificarCantidad,
      pedidoHecho,
      comprarYEliminar,
      verificarUsuario,
      incrementarCantidad,
      decrementarCantidad
    };
  }
};
</script>

<template>
  <form @submit.prevent="comprarYEliminar" class="formulario">
    <div id="tituloheader">
      <h1 id="titulo">Comprar</h1>
      <button type="button" @click="router.go(-1)" id="x">X</button>
    </div>
    <label v-if="!verificarUsuario" class="respuesta">ID Usuario:
      <input v-model="verificar.id_usuario" type="text" required>
    </label>
    <label v-if="!verificarCantidad" class="respuesta">Stock: 
      <div class="stock-control">
        <button type="button" @click="decrementarCantidad">-</button>
        <input v-model="verificar.cantidad" type="number" min="1" step="1" required>
        <button type="button" @click="incrementarCantidad">+</button>
      </div>
    </label>
    <button type="submit" class="boton">Comprar</button>
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

.formulario {
  width: 20%;
  margin-left: auto;
  margin-right: auto;
}

.respuesta {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  width: 100%;
}

.boton {
  margin-top: 30px;
  display: block;
  width: 100%; 
  box-sizing: border-box;
}

.stock-control {
  display: flex;
  align-items: center;
}

.stock-control button {
  background-color: #ddd;
  border: 1px solid #ccc;
  padding: 5px 10px;
  cursor: pointer;
}

.stock-control input {
  width: 50px;
  text-align: center;
  margin: 0 5px;
}
</style>