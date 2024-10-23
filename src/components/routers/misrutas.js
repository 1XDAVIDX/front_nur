import { createRouter, createWebHistory } from "vue-router";
import  registroUsuario  from '@/components/registroUsuario.vue';
import registroProducto from "@/components/registroProducto.vue";
import eliminarProducto from "../eliminarProducto.vue";
import modificarProducto from "../modificarProducto.vue";
import pruebaLogin from "../pruebaLogin.vue";
import cliente from "@/components/cliente.vue"
import barraNavegacion from "../barraNavegacion.vue";
import admin from "@/components/admin.vue";
import comprar from "../comprar.vue";
import completado from "../completado.vue";


const routes=[
    {
        path:'/',
        name:'barraNavegacion',
        component:barraNavegacion
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

    {
        path:'/eliminarProducto',
        name:'eliminarProducto',
        component:eliminarProducto
    },
    {
        path:'/modificarProducto',
        name:'modificarProducto',
        component:modificarProducto
    },
    {
        path:'/pruebaLogin',
        name:'pruebaLogin',
        component:pruebaLogin
    },
    {
        path:'/cliente',
        name:'cliente',
        component:cliente
    },
    {
        path:'/admin',
        name:'admin',
        component:admin
    },
    {
        path:'/comprar',
        name:'comprar',
        component:comprar
    },
    {
        path:'/completado',
        name:'completado',
        component:completado
    }
    
]

const router=createRouter({
    history: createWebHistory(),
    routes: routes,
})
export default router