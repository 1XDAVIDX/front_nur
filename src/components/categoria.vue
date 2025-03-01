<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const opcionesCategoria = ['juguetes', 'accesorios','todos']; 
const categoriaEnviar = ref(""); 

const onCategoriaProducto = () => {
    router.go(-1)
    localStorage.setItem('tipo_categoria', JSON.stringify({ categoria: categoriaEnviar.value }));

};
</script>

<template>
  <form @submit.prevent="onCategoriaProducto">
    <label class="respuesta">Categoría:
      <select v-model="categoriaEnviar" required>
        <option disabled value="">Seleccione una categoría</option>
        <option v-for="opcion in opcionesCategoria" :key="opcion" :value="opcion">
          {{ opcion }}
        </option>
      </select>
    </label>
    <button type="submit">Enviar</button>
  </form>
</template>