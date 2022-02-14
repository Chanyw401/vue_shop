<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图-->
        <el-card>
            <!--添加角色按钮-->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!--角色列表区域-->
            <el-table :data="roleList" stripe border>
                <!--label是指标题名字，prop是指接口中获取到的数据-->
                <!--                展开渲染角色权限-->
                <el-table-column type="expand">
                    <template v-slot:default="scope">
                        <el-row v-for="(item1,i1) in scope.row.children" :class="['bd_bottom',i1 === 0 ?'bd_top':'']"
                                :key="item1.id">
                            <!--渲染一级权限-->
                            <el-col :span="5">
                                <el-tag closable>{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--渲染二级和三级权限-->
                            <el-col :span="19">
                                <el-row v-for="(item2,i2) in item1.children" :key="item2.id"
                                        :class="[i2 === 0?'':'bd_top']">
                                    <el-col :span="6">
                                        <el-tag type="success" closable>{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id"
                                                closable
                                                @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="320px">
                <template v-slot="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                    <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">编辑权限
                    </el-button>
                </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!--分配权限的对话框-->
        <el-dialog title="编辑权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!--树形组件 :data是绑定数据,:props是绑定树形属性，里面有data的数据-->
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id"
                     default-expand-all :default-checked-keys="defId" ref="treeRef"	></el-tree>
            <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
  export default {
    name: "Role",
    data() {
      return {
        roleList: [],
        setRightDialogVisible:false,
        rightsList:[],
        treeProps:{
          children:'children',
          label:'authName'
        },
        //获取三级权限的id
        defId:[],
        //当前即将分配角色的id
        roleId:''
      }
    },
    created() {
      this.getRoleList()
    },
    methods: {
      //获取角色数据
      async getRoleList() {
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$messages.error('获取角色列表失败')
        }
        // this.$messages.success('成功获取角色列表')
        this.roleList = res.data
        // console.log(this.roleList)
      },
      //根据ID删除对应的权限
      async removeRightById(role, rightId) {
        const rightsResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(err => {
          return err
        })
        //如果用户确认删除，则返回字符串值'confirm'
        //如果用户取消删除，则返回字符串值'cancel'
        if (rightsResult !== 'confirm') {
          return this.$messages.success('用户已取消删除')
        }
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$messages.error('删除权限失败')
        }
        this.$messages.success('成功删除权限')

        //this.getRoleList() 这里不直接刷新权限列表数据，因为直接刷新会导致展开的列表直接关闭，
        // 我们在这里用 “将删除后的数据直接赋给role.children”,children是保存权限数据的位置
        role.children = res.data
      },
      //点击编辑权限弹出对话框
      async showSetRightDialog(role) {
        //保存权限的id
        this.roleId = role.id
        //展示获取所有权限的数据
        const {data : res} = await this.$http.get('rights/tree')
        if(res.meta.status !== 200){return this.$messages.error('获取权限数据失败')}
        this.$messages.success('成功获取所有权限数据')
        this.rightsList = res.data
        this.setRightDialogVisible = true
        //调用获取三级权限id的方法
        this.getLeafKeys(role,this.defId)
      },
      //获取三级权限的id,通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys中
      getLeafKeys(node,arr){
        //这里是指因为三级权限已经没有children属性，所以如果此时不包含children，说明已经是三级权限节点
        if(!node.children){return arr.push(node.id)}
        //接着遍历在一级、二级权限下的三级权限节点
        node.children.forEach(item =>{this.getLeafKeys(item,arr)})
      },
      //监听对话框关闭时权限数据的清空
      setRightDialogClosed(){
        this.defId = []
      },
      //监听添加权限，点击确定的方法
      async allotRights(){
        const keys = [
          //这里获取的就是用户点击添加或删除的数据
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()]
        const idArr = keys.join(',')
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids : idArr})
        if(res.meta.status !== 200){return this.$messages.error('添加权限失败')}
        this.$messages.success('成功添加权限')
        this.getRoleList()
        this.setRightDialogVisible = false
      }

    }
  }
</script>

<style scoped>
    /*为顶部加一条线*/
    .bd_top {
        border-top: solid 1px #eeeeee;
    }

    /*为底部加一条线*/
    .bd_bottom {
        border-bottom: solid 1px #eeeeee;

    }

    .el-tag {
        margin: 6px;
    }

    .el-row {
        display: flex;
        align-items: center;
    }


</style>