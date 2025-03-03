<template>
  <div ref="grafico" style="width: 100%; height: 400px;"></div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import * as echarts from "echarts";

export default {
  props: {
    productosVendidos: Array, // Recibe los datos desde el padre
  },
  setup(props) {
    const grafico = ref(null);

    const dibujarGrafico = () => {
      if (!grafico.value || !props.productosVendidos.length) return;

      const chart = echarts.init(grafico.value);
      const opciones = {
        title: { text: "Productos más vendidos", left: "center",textStyle:{ color : "red", fontSize:25} },
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: { orient: "vertical", left: "right",top: "10%", textStyle: { fontSize: 16, fontWeight: "bold" } },
        series: [
          {
            name: "Ventas",
            type: "pie",
            radius: "90%",
            label: {
              show: true, // Asegura que se muestren los nombres
              fontSize: 14, 
              fontWeight: "bold" 
            },
            
            top: 100,
            
            data: props.productosVendidos.map(p => ({ name: p.nombre_producto, value: p.cantidad })),
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)"}
            }
          }
        ]
      };

      chart.setOption(opciones);
    };

    watch(() => props.productosVendidos, dibujarGrafico, { deep: true });

    onMounted(dibujarGrafico);

    return { grafico };
  },
};
</script>
