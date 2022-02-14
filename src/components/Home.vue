<template>
    <el-container class="home-container">
        <!--头部区域-->
        <el-header>
            <div>
                <img src="../assets/img/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button @click="logout" type="info">退出</el-button>
        </el-header>
        <el-container>
            <!--侧边栏区域 width判断是否为折叠的宽度，是的话为64px，不是为200px-->
            <el-aside :width="isCollapse? '64px':'200px'">
                <div class="toggle-button" @click="toggle_collapse">|||</div>
                <el-menu
                        background-color="#333744" text-color="#fff"
                        active-text-color="#409EFF" unique-opened :collapse="isCollapse"
                        :collapse-transition="false" :router="true" :default-active="activePath">
                    <!--                    一级菜单导航-->
                    <el-submenu :index="item.id.toString()" v-for="item in menulist" :key="item.id">
                        <template slot="title">
                            <i :class="iconObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <!--                        二级菜单-->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children"
                                      :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!--主体区域-->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
  export default {
    name: "Home",
    data() {
      return {
        //左侧菜单数据
        menulist: [],
        //定义左侧图标
        iconObj: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao',
        },
        isCollapse: false,
        //被激活的链接地址
        activePath:''
      }
    },
    created() {
      this.getMenuList(),
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      //获取所有的菜单
      async getMenuList() {
        const {data: res} = await this.$http.get('menus')
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        //这里将数据传递到menulist中
        this.menulist = res.data
      },
      toggle_collapse() {
        this.isCollapse = !this.isCollapse
      },
      //保存链接的激活状态
      saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath)
        this.activePath = activePath
      }

    }
  }
</script>

<style scoped>
    .home-container {
        height: 100%;
    }

    .el-header {
        background-color: #373d41;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        color: #fff;
        font-size: 20px;
        align-items: center;
    }

    .el-header > div {
        display: flex;
        align-items: center;
        padding-left: 2px;
    }

    .el-header > div span {
        margin-left: 5px;
    }

    .el-aside {
        background-color: #333744;
    }

    .el-aside .el-menu {
        border-right: none;
    }

    .el-main {
        background-color: #eaedf1;
    }

    .iconfont {
        margin-right: 10px;
    }

    .toggle-button {
        background-color: #4a5064;
        font-size: 10px;
        line-height: 28px;
        color: #fff;
        text-align: center;
        letter-spacing: 0.2em;
        cursor: pointer;
    }
</style>