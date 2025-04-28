<template>
  <div class="grafico-container">
    <div ref="grafico" class="grafico-pie"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import * as echarts from "echarts";

export default {
  props: {
    productosVendidos: Array,
  },
  setup(props) {
    const grafico = ref(null);
    let chartInstance = null;
    

    const dibujarGrafico = () => {
      if (!grafico.value || !props.productosVendidos.length) return;

      if (!chartInstance) {
        chartInstance = echarts.init(grafico.value);
        window.addEventListener("resize", () => chartInstance.resize());
      }

      const productosOrdenados = [...props.productosVendidos].sort((a, b) => b.cantidad - a.cantidad);
      const top3 = productosOrdenados.slice(0, 3).map(p => p.nombre_producto);

      const data = props.productosVendidos.map(p => ({
        name: p.nombre_producto,
        value: p.cantidad,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}', // solo el nombre
          fontSize: 13,
          color: '#333',
        },
        labelLine: {
          show: true,
          length: 20,
          length2: 10,
        },
      }));

      const opciones = {
        title: {
          left: "center",
          padding: 0,
          textStyle: {
            color: "#333",
            fontSize: 24,
            fontWeight: "bold",
          },
        },
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} ({d}%)",
        },
        legend: {
          data: top3, // solo los 3 más vendidos
          orient: "horizontal",
          top: 360,
          textStyle: {
            fontSize: 13,
            color: "#666",
          },
        },
        series: [
          {
            name: "Ventas",
            type: "pie",
            radius: ["40%", "75%"],
            avoidLabelOverlap: false,
            label: {
              show: false, // desactivamos el global para usar por ítem
            },
            labelLine: {
              show: false, // también el global
            },
            data,
            emphasis: {
              scale: true,
              itemStyle: {
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.3)",
              },
            },
            animationDuration: 1000,
          },
        ],
      };

      chartInstance.setOption(opciones);
    };

    watch(() => props.productosVendidos, dibujarGrafico, { deep: true });
    onMounted(dibujarGrafico);

    return { grafico };
  },
};
</script>

<style scoped>
.grafico-container {
 
  max-width: 800px;
  margin: auto;
  padding: 1rem;
  
  
}

.grafico-pie {
  width: 100%;
  height: 400px;
  min-height: 300px;
  
}
</style>
