<template>
    <div>
        <crumb>
            <el-breadcrumb-item :to="{ path: '/' }" slot="first">首页</el-breadcrumb-item>
            <el-breadcrumb-item slot="second">商品管理</el-breadcrumb-item>
            <el-breadcrumb-item slot="third">参数列表</el-breadcrumb-item>
        </crumb>
        <el-card>
            <el-alert
                    title="注意:只允许为第三级分类设置相关参数" show-icon type="warning" :closable="false">
            </el-alert>
            <!--级联选择器-->
            <el-row class="distyle">
                <el-form label-width="100px">
                    <el-form-item label="选择商品分类">
                        <!--级联选择器-->
                        <el-cascader @change="handleChange" v-model="selectedParamKeys"
                                     :props="cascaderProps" :options="getParentCateList"
                                     clearable></el-cascader>
                    </el-form-item>
                </el-form>
            </el-row>
            <!--标签页-->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <!--动态参数的业务方法-->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" :disabled="this.selectedParamKeys.length == 0"
                               @click="addParamsDialogVisible = true" size="mini">添加参数
                    </el-button>
                    <el-table :data="manyTableData" border stripe>
                        <!--展开式的业务-->
                        <el-table-column type="expand">
                            <!--参数属性的展开-->
                            <template v-slot="scope">
                                <el-tag v-for=" (item,i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i,scope.row)">{{item}}</el-tag>
                                <!--输入框-->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                                        ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!--按钮切换成文本输入框-->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit"
                                           @click="showEditDialog(scope.row.attr_id)">编辑
                                </el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete"
                                           @click="removeEditDialog(scope.row.attr_id)">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!--静态属性的业务方法-->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" @click="addParamsDialogVisible = true"
                               :disabled="this.selectedParamKeys.length == 0">添加属性
                    </el-button>
                    <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <!--参数属性的展开-->
                            <template v-slot="scope">
                                <el-tag v-for=" (item,i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i,scope.row)">{{item}}</el-tag>
                                <!--输入框-->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                                          ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                                          @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!--按钮切换成文本输入框-->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit"
                                           @click="showEditDialog(scope.row.attr_id)">编辑
                                </el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete"
                                           @click="removeEditDialog(scope.row.attr_id)">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!--添加参数的对话框-->
        <el-dialog
                :title=" '添加' + titleText" :visible.sync="addParamsDialogVisible"
                width="50%" @close="addParamsClosed">
            <!--添加参数的表单-->
            <el-form ref="paramsRef" :model="addParamsForm" :rules="addParamsRules" label-width="80px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!--编辑修改参数的对话框-->
        <el-dialog
                :title=" '修改' + titleText" :visible.sync="editParamsDialogVisible"
                width="50%" @close="editParamsClosed">
            <!--添加参数的表单-->
            <el-form ref="editParamsRef" :model="editParamsForm" :rules="editParamsRules" label-width="80px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>
<script>
  import Crumb from "@/common/Crumb";

  export default {
    name: "Params",
    components: {Crumb},
    data() {
      return {
        //父级分类的数据列表
        getParentCateList: [],
        //指定级联选择器的配置对象:
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name', //指定选项标签为选项对象的某个属性值
          children: 'children',//指定选项的子选项为选项对象的某个属性值
          checkStrictly: 'true',
        },
        //选中的父级分类的Id数组
        selectedParamKeys: [],
        //标签页的数据
        activeName: 'many',
        //动态参数数据
        manyTableData: [],
        //静态属性数据
        onlyTableData: [],
        //控制添加对话框的显隐
        addParamsDialogVisible: false,
        //添加表单的数据对象
        addParamsForm: {
          attr_name: ''
        },
        //参数表单的数据校验规则
        addParamsRules: {
          attr_name: [
            {required: true, message: '请输入参数名称', trigger: 'blur'}
          ]
        },
        //编辑修改表单的数据对象
        editParamsForm: {
          attr_name: ''
        },
        //修改编辑表单的校验规则
        editParamsRules: {
          attr_name: [
            {required: true, message: '请输入参数名称', trigger: 'blur'}
          ]
        },
        //控制编辑对话框的显隐
        editParamsDialogVisible: false,
      }
    },
    computed: {
      //计算三级分类的id值
      cateId() {
        if (this.selectedParamKeys.length === 3) {
          return this.selectedParamKeys[2]
        }
        return null
      },
      //动态计算对话框标题的文本
      titleText() {
        // this.activeName ='many'?'添加动态属性':'添加静态属性'
        if (this.activeName === 'many') {
          return '动态属性'
        } else {
          return '静态属性'
        }
      },
    },
    created() {
      this.getCateLists()
    },
    methods: {
      async getCateLists() {
        this.addCateDialogVisible = true
        //获取父级分类的数据列表,type为2表示获取前两级的父级数据
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$messages.error('获取数据列表失败')
        }
        this.$messages.success('成功获取数据列表')
        //将数据传递到getParentCateList
        // console.log(res.data)
        this.getParentCateList = res.data
      },
      //选项触发变化时，调用这个方法
      handleChange() {
        this.getParamsData()
      },
      //标签页中点击可选选项
      handleClick() {
        this.getParamsData()
      },
      //获取参数的列表数据
      async getParamsData() {
        //如果不是三级分类
        if (this.selectedParamKeys.length !== 3) {
          this.selectedParamKeys = []
          //将动态参数和静态属性的数据清零(如果有时候先进入三级分类，然后重新进入了二级分类，那么如果不将之前三级分类的数据清掉，会影响用户体验)
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        //证明是三级分类,根据所选分类的id和当前所处的面板，获取相应的参数
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {sel: [this.activeName]}
        })
        if (res.meta.status !== 200) {
          return this.$messages.error('获取参数失败')
        }
        //将参数的属性值做切割成数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //单独控制输入框和绑定数值(这是在展开标签那里的业务逻辑)
          item.inputVisible = false
          item.inputValue = ''
        })
        //判断是动态参数的数据还是静态属性的数据
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }


      },
      //监听对话框关闭时的数据重置
      addParamsClosed() {
        this.$refs.paramsRef.resetFields()
      },
      //点击确定按钮，添加参数
      addParams() {
        this.$refs.paramsRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,
            {attr_name: this.addParamsForm.attr_name, attr_sel: this.activeName})
          if (res.meta.status !== 201) {
            return this.$messages.error('添加参数失败')
          }
          this.$messages.success('成功添加参数')
          this.getParamsData()
          this.addParamsDialogVisible = false
        })
      },
      //点击编辑按钮，展示编辑修改的对话框
      async showEditDialog(attr_id) {
        //查询当前参数的信息
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,
          {params: {attr_sel: this.activeName}})
        if (res.meta.status !== 200) {
          return this.$messages.error('查询参数失败')
        }
        // this.$messages.success('成功获取参数')
        //获取
        // console.log(res.data)
        this.editParamsForm = res.data
        this.editParamsDialogVisible = true
      },
      //监听编辑对话框关闭时的数据重置
      editParamsClosed() {
        this.$refs.editParamsRef.resetFields()
      },
      //点击确定按钮，编辑修改参数
      editParams() {
        this.$refs.editParamsRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
            {attr_name: this.editParamsForm.attr_name, attr_sel: this.activeName})
          if (res.meta.status !== 200) {
            return this.$messages.error('修改参数失败')
          }
          this.$messages.success('成功修改参数')
          this.editParamsDialogVisible = false
          this.getParamsData()
        })
      },
      //点击删除按钮，弹出提示弹框
      async removeEditDialog(attr_id) {
        const resultConf = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //用户取消了删除操作
        if (resultConf !== 'confirm') {
          return this.$messages.info('已取消删除')
        }
        //用户删除的业务逻辑
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (res.meta.status !== 200) {
          return this.$messages.error('用户删除参数失败')
        }
        this.$messages.success('用户成功删除参数')
        //更新参数信息
        this.getParamsData()
      },
      //文本框失去了焦点，或者摁下了enter按键时触发该事件
      async handleInputConfirm(row) {
        //当输入的都是空格时进行判断
        if(row.inputValue.trim().length === 0){
          //将文本框清零 然后切换成按钮(即隐藏了文本框)
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        //如果没有return，则说明输入的数据有效，可以进行下一步的业务操作，即可以将输入的数据添加到下面展示的标签中，同时也将数据发送到后端服务器
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        //将数据传送到后端服务器,调用下面的方法：
        await this.saveAttrVals(row)
      },
      //发起请求保存添加或更新删除后的数据业务方法(这里是抽离，方便代码复用)
      async saveAttrVals(row){
        const {data : res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
          {attr_name:row.attr_name, attr_sel:row.attr_sel, attr_vals:row.attr_vals.join(' ')})
        if(res.meta.status !== 200){return this.$messages.error('添加新属性失败')}
        this.$messages.success('成功添加到后台数据和展开列或删除了数据')
      },
      //删除对应的参数可选项
      handleClosed(i,row){
        row.attr_vals.splice(i,1)
        this.saveAttrVals(row)
      },
      //点击按钮，显示文本输入框
      showInput(row) {
        row.inputVisible = true
        //让文本框自动获得焦点: $nextTick()作用:当页面上的元素被重新渲染之后，才会执行后面的回调函数，即当我们点击按钮时会切换到文本框，
        //但可能页面还没渲染好，有可能还处于按钮状态，如果此时执行回调函数可能就会报错，加上这个$nextTick就可以避免这个问题
        this.$nextTick( ()=> {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      }
    }
  }
</script>

<style scoped>
    .distyle {
        margin: 15px 0;
    }
    .input-new-tag{
        width: 120px;
    }
</style>