<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>活动管理</el-breadcrumb-item>
            <el-breadcrumb-item>活动列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图区域-->
        <el-card>
            <!--搜索与添加区域-->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="handleCurrentChange(1)">
                        <el-button slot="append" icon="el-icon-search" @click="handleCurrentChange(1)"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible= true">添加用户</el-button>
                </el-col>
            </el-row>
            <!--用户列表区域-->
            <el-table :data="userlist" stripe border>
                <!--label是指标题名字，prop是指接口中获取到的数据-->
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template v-slot:default="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template v-slot="scope">
                        <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini"
                                       @click="showEditDialog(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini"
                                       @click="deleteUser(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"
                                        @click="addRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!--分页功能--><!--size-change是*条/页的监听事件，current-change是点击跳转到第几页的事件            -->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :page-size="queryInfo.pagesize"
                    :page-sizes="[1, 2, 3, 4, 5]"
                    :current-page="queryInfo.pagenum"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--添加用户的对话框,下面的prop是指校验规则里的名字-->
        <el-dialog
                title="添加用户" :visible.sync="addDialogVisible"
                width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="ruleFormRef" label-width="70px" class="demo-ruleForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password" type="password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
        <!--修改用户的对话框-->
        <el-dialog
                title="修改用户" :visible.sync="editDialogVisible"
                width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px" class="demo-ruleForm">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
        <!--分配角色的对话框-->
        <el-dialog
                title="分配角色" :visible.sync="setRoleDialogVisible"
                width="50%" @close="addRoleClosed">
            <div>
                <p>当前的用户:{{userInfo.username}}</p>
                <p>当前的角色:{{userInfo.role_name}}</p>
                <p>分配新角色:
                    <el-select v-model="selectedRoleId" placeholder="请选择">
                        <el-option
                                v-for="item in rolesList"
                                :key="item.id"
                                :label="item.roleName"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>

</template>

<script>
  export default {
    name: "Users",
    data() {
      return {
        //获取用户列表的参数对象
        queryInfo: {
          query: '',
          //当前的页数
          pagenum: 1,
          //当前每页显示多少条数据
          pagesize: 2
        },
        userlist: [],
        total: 0,
        //添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        //验证表单的规则对象
        addFormRules: {
          username: [
            {
              required: true, message: '请输入用户名', trigger: 'blur'
            },
            {
              min: 3, max: 10, message: '用户名的长度在3到10之间', trigger: 'blur'
            }
          ],
          password: [
            {
              required: true, message: '请输入密码', trigger: 'blur'
            },
            {
              min: 6, max: 15, message: '密码的长度在6到15之间', trigger: 'blur'
            }
          ],
          email: [
            {
              required: true, message: '请输入邮箱', trigger: 'blur'
            },
            {
              type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change']
            }
          ],
          mobile: [
            {
              required: true, message: '请输入手机号码', trigger: 'blur'
            },
            {
              min: 11, max: 11, message: '手机号码长度为11位数字', trigger: 'blur'
            }
          ],
        },
        //控制添加用户对话框的显示与消失
        addDialogVisible: false,
        //修改用户的对话框
        editDialogVisible: false,
        //编辑用户的信息数据
        editForm: {
          id: '',
          email: '',
          mobile: ''
        },
        //分配角色的对话框
        setRoleDialogVisible: false,
        //分配角色的数据
        userInfo:{},
        //所有角色列表的数据
        rolesList:[],
        selectedRoleId:''
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      //获得用户数据事件
      async getUserList() {
        const {data: res} = await this.$http.get('users', {
          params: this.queryInfo
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        }
        this.userlist = res.data.users
        this.total = res.data.total
        // console.log(res)
      },
      //监听pagesize改变的事件，一页有多少条数据
      handleSizeChange(newSize) {
        // console.log(newSize);
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        // console.log(newPage);
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //监听switch开关状态的改变
      async userStateChanged(userinfo) {
        // console.log(userinfo)
        const {data: res} = await this.$http.put(`users/${userinfo.id.toString()}/state/${userinfo.mg_state.toString()}`)
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$messages.error('用户状态更新失败')
        }
        this.$messages.success('用户状态更新成功')
      },
      //对话框关闭重置表单内容
      addDialogClosed() {
        this.$refs.ruleFormRef.resetFields()
      },
      //点击按钮，添加新用户
      addUser() {
        this.$refs.ruleFormRef.validate(async valid => {
          // console.log(valid)
          if (!valid) return
          //发起添加用户的网络请求
          const {data: res} = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$messages.error('添加新用户失败')
          }
          this.$messages.success('添加新用户成功')
          //将添加对话框消失
          this.addDialogVisible = false
          //更新用户列表信息
          this.getUserList()

        })
      },
      //点击编辑按钮，弹出对话框事件
      async showEditDialog(id) {
        this.editDialogVisible = true
        const {data: res} = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          return this.$messages.error('查询用户信息失败')
        }
        this.editForm = res.data
      },
      //编辑对话框关闭重置表单内容
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //点击编辑按钮
      editUser() {
        this.$refs.editFormRef.validate(async valid => {
          // console.log(valid)
          if (!valid) return
          const {data: res} = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email, mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            this.$messages.error('更新用户信息失败')
          }
          this.$messages.success('更新用户信息成功')
          //关闭编辑对话框
          this.editDialogVisible = false
          //更新编辑后的用户列表信息
          this.getUserList()
        })
      },
      //点击删除按钮,根据ID删除对应的用户信息
      async deleteUser(id) {
        //弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(err =>{return err})
        //如果用户确认删除，则返回字符串值'confirm'
        //如果用户取消删除，则返回字符串值'cancel'
        if(confirmResult !=='confirm'){
          return this.$messages.success('用户已取消删除')
        }
        const {data : res} =await this.$http.delete('users/' + id)
        if(res.meta.status !== 200){return this.$messages.error('删除用户失败')}
        this.$messages.success('成功删除用户')
        //更新用户列表
        this.getUserList()
      },
      //点击分配角色按钮，弹出对话框
      async addRole(userInfos){
        //获取用户信息:
        this.userInfo = userInfos
        const {data:res} = await this.$http.get('roles')
        if(res.meta.status !== 200){return this.$messages.error('获取角色列表失败')}
        this.$messages.success('成功获取所有角色列表')
        //获取所有的角色列表
        this.rolesList = res.data
        this.setRoleDialogVisible = true
      },
      //点击分配角色确定按钮，更新角色
      async saveRoleInfo(){
        if(!this.selectedRoleId){return this.$messages.error('请选择更新角色')}
        const {data : res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
        if(res.meta.status !== 200){return this.$messages.error('更新角色失败')}
        this.$messages.success('成功更新角色')
        this.setRoleDialogVisible = false
        this.getUserList()
      },
      //重置分配角色的内容
      addRoleClosed(){
        // this.userInfo = {}
        this.selectedRoleId = ''
      }
    }
  }
</script>

<style scoped>

</style>