<template>
    <div>
        <!--面包屑导航-->
        <crumb>
            <el-breadcrumb-item :to="{ path: '/' }" slot="first">首页</el-breadcrumb-item>
            <el-breadcrumb-item slot="second">商品管理</el-breadcrumb-item>
            <el-breadcrumb-item slot="third">参数列表</el-breadcrumb-item>
        </crumb>
        <!--警告条-->
        <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
        <!--步骤条-->
        <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <!--标签页-->
        <el-card>
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="60px" label-position="top">
                <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave"
                         @tab-click="tabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <!--级联选择器 v-model绑定的是选中的数据 :props是指-->
                            <el-cascader @change="handleChange" v-model="addForm.goods_cat"
                                         :props="cascaderProps" :options="cateList"
                                         clearable></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in getManyData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="item1" v-for="(item1,i1) in item.attr_vals" :key="i1" border>
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in getOnlyData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                                action="http://www.ysqorz.top:8888/api/private/v1/upload" :headers="headerObj"
                                :on-preview="handlePreview" :on-remove="handleRemove"
                                :on-success="handleSuccess" list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                       <!--富文本编辑器组件-->
                        <quill-editor v-model="addForm.good_introduce"></quill-editor>
                       <!--添加商品的按钮-->
                        <el-button type="primary" style="margin-top: 15px" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
<!--        //图片预览-->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="70%">
            <img :src="previewPath" alt="" style="width: 100%">
        </el-dialog>
    </div>
</template>

<script>
  import Crumb from "@/common/Crumb";
  import _ from'lodash'
  export default {
    name: "Add",
    components: {Crumb},
    data() {
      return {
        activeIndex: '0',
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          //商品所属的分类数组
          goods_cat: [],
          //商品详情描述
          good_introduce:'',
          //图片对象数组
          pics: [],
          attrs:[],
        },
        addFormRules: {
          goods_name: {required: true, message: '请输入商品名字', trigger: 'blur'},
          goods_price: {required: true, message: '请输入商品价格', trigger: 'blur'},
          goods_weight: {required: true, message: '请输入商品重量', trigger: 'blur'},
          goods_number: {required: true, message: '请输入商品数量', trigger: 'blur'},
          goods_cat: {required: true, message: '请输入商品描述', trigger: 'blur'},
        },
        //商品分类数据 -->用于级联选择器的数据绑定
        cateList: [],
        //级联选择器的数据
        cascaderProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name', //指定选项标签为选项对象的某个属性值
          children: 'children',//指定选项的子选项为选项对象的某个属性值
          checkStrictly: 'true',
        },
        //动态参数列表数据
        getManyData: [],
        //静态属性列表数据
        getOnlyData: [],
        //图片上传的位置
        // uploadURL:'http://www.ysqorz.top:8888/api/private/v1/upload',
        //图片上传组件的headers请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewVisible : false,
        previewPath:''

      }
    },
    created() {
      this.getCateList()
    },
    computed: {
      cate_id() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$messages.error('获取商品数据失败')
        }
        this.$messages.success('成功获取商品数据')
        this.cateList = res.data
      },
      //级联选择器变化，会触发的函数
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          return this.addForm.goods_cat = []
        }
      },
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$messages.error('请先选择分类')
          return false
        }
      },
      async tabClick() {
        //如果访问的是动态参数面板
        if (this.activeIndex === '1') {
          const {data: res} = await this.$http.get(`categories/${this.cate_id}/attributes`,
            {params: {sel: 'many'}})
          if (res.meta.status !== 200) {
            return this.$messages.error('获取动态参数失败')
          }
          this.$messages.success('成功获取动态参数')
          //获取动态参数列表数据
          this.getManyData = res.data
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          })
        }
        //如果访问的是静态属性面板
        if (this.activeIndex === '2') {
          const {data: res} = await this.$http.get(`categories/${this.cate_id}/attributes`,
            {params: {sel: 'only'}})
          if (res.meta.status !== 200) {
            return this.$messages.error('获取静态属性失败')
          }
          this.$messages.success('成功获取静态属性')
          //获取静态属性列表数据
          this.getOnlyData = res.data
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals: []
          })
        }
      },
      //处理图片预览效果
      handlePreview(file) {
        this.previewPath = file.url
        this.previewVisible = true
      },
      //处理移除图片的操作
      handleRemove(file) {
        //1.获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        //2.从pics数组中获取到这个图片的索引值
        const i = this.addForm.pics.findIndex(x => x.pic === filePath)
        //3.调用数组的是splice方法，把图片信息对象从Pics数组中移除
        this.addForm.pics.splice(i, 1)
      },
      //监听图片上传成功的事件
      handleSuccess(response) {
        const picInfo = {
          //1.得到一个图片信息对象,这里的pic是api文档里写好的名称，不能改，tmp_path也是
          pic: response.data.tmp_path
        }
        //2.将图片信息对象push到pisc数组中
        this.addForm.pics.push(picInfo)
        console.log(this.addForm)
      },
       addGoods(){
        // console.log(this.addForm)
          this.$refs.addFormRef.validate(async valid =>{
          if(!valid){
            return this.$messages.error('请填写必要的表单项')
          }
          //执行添加的业务逻辑  -->在之前级联选择器时，因为要判断级联选择器的等级分类，所以要用到length，此时就必须将goods_cat转换成数组
          //用到了split(' ')方法，但当我们执行添加业务时，此时的goods_cat类型必须为字符串，两者冲突，所以必须将数组转换成字符串，这里我们
          //用到了深拷贝，先将之前的addForm深拷贝，用formDeep来存储，再用join方法进行转换，此时的formDeep与addForm中的goods_cat不一样了
          //先做一个深拷贝cloneDeep
          const formDeep = _.cloneDeep(this.addForm)
          formDeep.goods_cat = formDeep.goods_cat.join(',')
          // //处理动态参数
          // this.manyTableData.forEach(item =>{
          //   const manyInfo = {
          //     attr_id: item.attr_id,
          //     attr_value : item.attr_vals.join(' ')
          //   }
          //   this.addForm.attrs.push(manyInfo)
          // })
          //处理静态属性
          // this.onlyTableData.forEach(item1 =>{
          //   const onlyInfo = {
          //     attr_id: item1.attr_id,
          //     attr_value: item1.attr_vals
          //   }
          //   this.addForm.attrs.push(onlyInfo)
          // })
          // formDeep.attrs = this.addForm.attrs
          console.log(formDeep)
          //发起请求添加商品
          const {data:res} = await this.$http.post('goods',formDeep)
          if(res.meta.status !== 201){return this.$messages.error('添加商品失败')}
          this.$messages.success('成功添加商品')
          await this.$router.push('/goods')

        })
      }
    }
  }
</script>

<style scoped>
    .el-tabs {
        margin-top: 20px;
    }

    .el-checkbox {
        margin: 0 10px 0 0 !important;
    }
</style>