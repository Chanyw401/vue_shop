import Vue from 'vue'
import App from './App.vue'
import router from "@/router/router";
import 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './element.js'
import '@/assets/css/global.css'
// 引入图标库
import '@/assets/fonts/iconfont.css'
//引进tree-table插件
import ZkTable from 'vue-table-with-tree-grid'
import axios from 'axios'
//引进富文本插件
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
//引进NProgress包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios.defaults.baseURL = 'http://106.53.73.30:8888/api/private/v1/'
// axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
// axios.defaults.baseURL = 'http://shop.liulongbin.top/api/private/v1/'
// axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
//配置拦截器
axios.interceptors.request.use(config =>{
  //在request拦截器中，展示进度条NProgress.start()
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})

axios.interceptors.response.use(config =>{
  //在response拦截器中，展示进度条NProgress.done()
  NProgress.done()
  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false
//注册Tree-table
Vue.component('tree-table',ZkTable)
//注册全局的富文本编辑器
Vue.use(VueQuillEditor)
//注册格式化时间方法,用到了filter过滤器
Vue.filter('dataFormat',function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2,'0')
  const d = (dt.getDate() + '').padStart(2,'0')
  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
