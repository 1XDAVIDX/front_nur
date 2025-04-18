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

      const opciones = {
        title: {
          //text: "Productos más vendidos",
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
          orient: "horizontal",
          bottom: 10,
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
              show: window.innerWidth > 500,
              formatter: '{name|{b}}',
              rich: {
                name: {
                  fontSize: 13,
                  color: '#333',
                  lineHeight: 18,
                  width: 100, // controla el ancho máximo de texto
                  overflow: 'break',
                },
                value: {
                  fontSize: 12,
                  color: '#999',
                },
              },
            },
            labelLine: {
              length: 20,
              length2: 10,
              smooth: true,
            },
            data: props.productosVendidos.map(p => ({
              name: p.nombre_producto,
              value: p.cantidad
            })),
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
