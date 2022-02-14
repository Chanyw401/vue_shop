import Vue from 'vue'
import Router from 'vue-router'
import Login from "@/components/Login";
// const Login = () => import('@/view/goods/Login')
import Home from "@/components/Home";
// const Home = () => import('@/view/goods/Home')
import Welcome from "@/components/Welcome";
// const Welcome = () => import('@/view/goods/Welcome')

import Users from "@/view/user/Users";
// const Users = () => import('@/view/goods/Users')

import Rights from "@/view/power/Rights";
// const Rights = () => import('@/view/goods/Rights')

import Role from "@/view/power/Role";
// const Role = () => import('@/view/goods/Role')

import Params from "@/view/goods/Params";
// const Params = () => import('@/view/goods/Params')

import Goods from "@/view/goods/Goods";
// const Goods = () => import('@/view/goods/Goods')

import Add from "@/view/goods/Add";
// const Add = () => import('@/view/goods/Add')

import Orders from "@/view/orders/Orders";
// const Orders = () => import('@/view/goods/Orders')

import Report from "@/view/report/Report";
// const Report = () => import('@/view/goods/Report')

// import Cart from "@/view/goods/Cart";
const Cate = () => import('@/view/goods/Cart')
Vue.use(Router)


const router =  new Router({
  routes:[
    {path:'', redirect:'/login'},
    {path:'/login', component:Login},
    {
      path:'/home', component: Home,
      redirect: '/welcome',
      children:[
        {path:'/welcome', component:Welcome},
        {path: '/users',component: Users},
        {path:'/rights',component: Rights},
        {path: '/roles',component: Role},
        {path: '/categories',component: Cate},
        {path:'/params',component: Params},
        {path:'/goods',component: Goods},
        {path:'/goods/add',component: Add},
        {path:'/orders',component: Orders},
        {path:'/reports',component: Report}
      ]
    },
  ],
  mode:'history',
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if(to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr)  return next('/login')
  next()
})


export default router