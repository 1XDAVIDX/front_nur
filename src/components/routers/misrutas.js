import { createRouter, createWebHistory } from "vue-router";
import  registroUsuario  from '@/components/registroUsuario.vue';
import registroProducto from "@/components/registroProducto.vue";
import principal from "../principal.vue";
import casa from "../casa.vue";
// import consultaProducto from "../consultaProducto.vue";
import eliminarProducto from "../eliminarProducto.vue";
import modificarProducto from "../modificarProducto.vue";


const routes=[
    {
        path:'/',
        name:'casa',
        component:casa
    },
    {
        path:'/principal',
        name:'principal',
        component:principal
    },
    {
        path:'/registroUsuario',
        name:'registroUsuario',
        component:registroUsuario
    },
    {
        path:'/registroProducto',
        name:'registroProducto',
        component:registroProducto
    },
    // {
    //     path:'/consultaProducto',
    //     name:'consultaProducto',
    //     component:consultaProducto
    // },
    {
        path:'/eliminarProducto',
        name:'eliminarProducto',
        component:eliminarProducto
    },
    {
        path:'/modificarProducto',
        name:'modificarProducto',
        component:modificarProducto
    }
    
]

const router=createRouter({
    history: createWebHistory(),
    routes: routes,
})
export default router