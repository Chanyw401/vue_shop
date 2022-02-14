<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>活动管理</el-breadcrumb-item>
            <el-breadcrumb-item>活动列表</el-breadcrumb-item>
        </el-breadcrumb>
       <!--卡片视图-->
        <el-card>
       <!--权限列表-->
            <el-table
                    :data="rightsList" border stripe style="width: 100%">
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column
                        prop="authName" label="权限名称" >
                </el-table-column>
                <el-table-column
                        prop="path" label="路径" >
                </el-table-column>
                <el-table-column prop="level" label="权限等级">
                    <template v-slot:default="scope">
                            <el-tag type="success" v-if="scope.row.level == '0'">等级一</el-tag>
                            <el-tag type="primary" v-else-if="scope.row.level == '1'">等级二</el-tag>
                            <el-tag type="warning" v-else-if="scope.row.level == '2'">等级三</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
  export default {
    name: "Rights",
    data(){
      return {
        rightsList:[]
      }
    },
    created(){
      this.getRightsList()
    },
    methods:{
      async getRightsList(){
        const { data:res} = await this.$http.get('rights/list')
        if(res.meta.status !== 200){
          return this.$messages.error('获取权限失败')
        }
        this.$messages.success('获取权限成功')
        this.rightsList = res.data
        // console.log(this.rightsList)
      }
    }
  }
</script>

<style scoped>

</style>