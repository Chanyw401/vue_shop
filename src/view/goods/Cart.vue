<template>
    <div>
        <crumb>
            <el-breadcrumb-item :to="{ path: '/' }" slot="first">首页</el-breadcrumb-item>
            <el-breadcrumb-item slot="second">商品管理</el-breadcrumb-item>
            <el-breadcrumb-item slot="third">商品分页</el-breadcrumb-item>
        </crumb>
        <!--卡片视图区域-->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!--表格-->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false"
                        show-index :expand-type="false" :border="true" :stripe="true">
                <!--是否有效-->
                <template v-slot:isok = 'scope'>
                    <i class="el-icon-success" v-if="scope.row.cat_deleted ===false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color: #8b0000"></i>
                </template>
                <!--排序-->
                <template v-slot:sort = 'scope'>
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
                <!--操作-->
                <template v-slot:operate>
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
            </tree-table>
            <!--分页-->
            <el-pagination
                    @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="this.queryinfo.pagenum" :page-sizes="[3, 5, 6, 10]"
                    :page-size="this.queryinfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>
        <!--添加分类的数据对话框-->
        <el-dialog
                title="添加用户" :visible.sync="addCateDialogVisible"
                width="50%">
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="ruleCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类" >
                    <!--级联选择器-->
                    <el-cascader v-model="selectedKeys" :props="cascaderProps"
                                 :options="getParentCateList" @change="patentCateChanged"
                                 clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogClosed">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
  import Crumb from "@/common/Crumb";

  export default {
    name: "Cart",
    components: {Crumb},
    data() {
      return {
        //查询条件
        queryinfo: {
          type: 3,
          //pagenum指当前页的页数值
          pagenum: 1,
          //pagesize指当前页的条目个数
          pagesize: 1
        },
        //商品分类的数据列表，默认为空
        cateList: [],
        //总数据条数
        total: 0,
        //为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name',
          },
          {
            label:'是否有效',
            type:'template',
            template:'isok'
          },
          {
            label:'排序',
            type:'template',
            template:'sort'
          },
          {
            label:'操作',
            type:'template',
            template:'operate'
          },
        ],
        //是否显示对话框
        addCateDialogVisible: false,
        //添加商品分类的表单对象
        addCateForm:{
          cat_name :'',
          //父级分类的id
          cat_pid: 0,
          //默认等级为一级分类
          cate_level : 0
        },
        //添加商品表单的验证对象
        addCateFormRules:{
          cat_name:[
            {required:true,message:'请输入商品分类名称',trigger:'blur'}
          ]
        },
        //父级分类的数据列表
        getParentCateList:[],
        //指定级联选择器的配置对象:
        cascaderProps:{
          expandTrigger: 'hover',
          value:'cat_id',
          label:'cat_name', //指定选项标签为选项对象的某个属性值
          children:'children',//指定选项的子选项为选项对象的某个属性值
          checkStrictly:'true',
        },
        //选中的父级分类的Id数组
        selectedKeys:[]
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        //获取商品数据
        const {data: res} = await this.$http.get('categories', {params: this.queryinfo})
        if (res.meta.status !== 200) {
          return this.$messages.error('获取商品数据失败')
        }
        this.$messages.success('成功获取商品数据')
        // console.log(res)
        //将商品数据传递到cateList
        this.cateList = res.data.result
        this.total = res.data.total
      },
      //处理页码大小,即选择多少条/页
      handleSizeChange(newSize){
        this.queryinfo.pagesize = newSize
        this.getCateList()
        // console.log(newSize)
      },
      //当前页变动时触发的事件，即点击第几页，跳转到第几页
      handleCurrentChange(newPage){
        this.queryinfo.pagenum = newPage
        this.getCateList()
      },
      //添加对话框
      async addCateDialog(){
        this.addCateDialogVisible = true
        //获取父级分类的数据列表,type为2表示获取前两级的父级数据
        const {data : res} = await this.$http.get('categories',{params:{type : 2}})
        if(res.meta.status !== 200){return this.$messages.error('获取数据列表失败')}
        this.$messages.success('成功获取数据列表')
        //将数据传递到getParentCateList
        // console.log(res.data)
        this.getParentCateList = res.data
      },
      //选择项发生变化触发这个函数
      patentCateChanged(){
        // console.log(this.selectedKeys)
        //如果selectedKeys数组中的length大于0，证明选中的是父级分类，反之则说明没有选中任何父级分类
        if(this.selectedKeys.length > 0){
          //如果选中的是父级分类，那么选中的最后一项就是我们的父级id，因为索引是从0开始的，所以如果长度为2，那么索引值就为1，即length - 1
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          //如果选中第一个，说明此时level为0，length为1，加上输入框的分类，level就变成1，所以用相等就可以了
          this.addCateForm.cate_level = this.selectedKeys.length
        }else{
          //如果没有选中选项，那么cat_pid就为0，它的level也为0
          this.addCateForm.cat_pid = 0
          this.addCateForm.cate_level = 0
        }
      },
      addCate(){
        this.$refs.ruleCateFormRef.validate(async valid =>{
          if(!valid) return
          const {data:res} = await this.$http.post('categories',this.addCateForm)
          if(res.meta.status !== 201){return this.$messages.error('添加分类失败')}
          this.$messages.success('成功添加分类')
          this.getCateList()
          this.addCateDialogVisible = false
        } )

      },
      //关闭对话框时将数据清零
      addCateDialogClosed(){
        this.$refs.ruleCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_pid = 0
        this.addCateForm.cate_level = 0
        this.addCateDialogVisible = false
      }

    }
  }
</script>

<style scoped>
    .treeTable{
        margin-top: 10px;
    }
</style>