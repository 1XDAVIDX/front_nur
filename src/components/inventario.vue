<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
export default{
    setup(){
        const inventario = ref([])
        const datosInventario = async () => {
            try {
                const respuesta = await axios.get('http://127.0.0.1:8000/compraTerminado');
                
                inventario.value = respuesta.data;  
                //inventario.value = respuesta.data.filter(item => item.usuario.idUsuario === 1); 
            } catch (error) {
                console.log("No se cargaron los datos ", error);
            }
        };
        console.log("datos",inventario.value)
        const router = useRouter();
        onMounted(()=>{
            datosInventario();
        })
        return{
            inventario,
            router
        }
    }
}

</script>
<template>
    <button type="button" @click="router.go(-1)" id="x">X</button>
    <div class="tabla">
        <table>
            <thead>
                <tr>
                    <th>ID Compra Terminada</th>
                    <th>ID Compra</th>
                    <th>ID Usuario</th>
                    <th>Producto</th>
                    <th>ID Producto</th>
                    <th>Cantidad</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody class="iteracionInventario">
                <tr v-for="i in inventario" :key="i.id_CT">
                    <td>{{ i.id_CompraTerminada }}</td>
                    <td>{{ i.id_compra }}</td>
                    <td>{{ i.id_usuario }}</td>
                    <td>{{ i.nombre_producto }}</td>
                    <td>{{ i.id_producto }}</td>
                    <td>{{ i.cantidad }}</td>
                    <td>{{ i.total }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style scoped>
.iteracionInventario{
  color:  black;
}
.tabla {
  width: 100%;
  overflow-x: auto; /* Permite el desplazamiento horizontal si la tabla es muy ancha */
  margin: 20px 0;
}

table {
  width: 100%;
  border-collapse: collapse; /* Para que los bordes se fusionen */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sombra para el estilo de tabla */
}

th, td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
  color: #333;
  font-weight: bold;
}

td {
  background-color: #fff;
}

tr:nth-child(even) {
  background-color: #f9f9f9; /* Sombreado para filas pares */
}

tr:hover {
  background-color: #f1f1f1; /* Cambio de color cuando se pasa el mouse sobre una fila */
}

#x {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
}

#x:hover {
  background-color: #ff3333;
}
</style>