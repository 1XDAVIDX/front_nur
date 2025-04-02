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
import carritoCompra from "../carritoCompra.vue";
import agregarCarrito from "../agregarCarrito.vue";
import quitarCarrito from "../quitarCarrito.vue";
import inventario from "../inventario.vue";
import inventarioCliente from "../inventarioCliente.vue";
import casa from "@/components/casa.vue";



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
        component: comprar
    },
    {
        path:'/completado',
        name:'completado',
        component:completado
    },
    {
        path:'/carritoCompra',
        name:'carritoCompra',
        component:carritoCompra
    },
    {
        path:'/agregarCarrito',
        name:'agregarCarrito',
        component:agregarCarrito
    },
    {
        path:'/quitarCarrito',
        name:'quitarCarrito',
        component:quitarCarrito
    }
    ,
    {
        path:'/inventario',
        name:'inventario',
        component:inventario
    }
    ,
    {
        path:'/inventarioCliente',
        name:'inventarioCliente',
        component:inventarioCliente
    }
    ,
    {
        path:'/casa',
        name:'casa',
        component:casa
    }

    
    
    
    
    
]

const router=createRouter({
    history: createWebHistory(),
    routes: routes,
})
export default router