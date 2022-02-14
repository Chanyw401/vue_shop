<template>
    <div>
    <!--面包屑导航-->
    <crumb>
        <el-breadcrumb-item :to="{ path: '/' }" slot="first">首页</el-breadcrumb-item>
        <el-breadcrumb-item slot="second">商品管理</el-breadcrumb-item>
        <el-breadcrumb-item slot="third">参数列表</el-breadcrumb-item>
    </crumb>
    <!--面包屑导航-->
    <el-row :gutter="20">
        <el-col :span="7">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
            </el-input>
        </el-col>
        <el-col :span="4">
            <el-button type="primary" @click="goAddGoodsComp">添加商品</el-button>
        </el-col>
    </el-row>
    <!--商品列表区域-->
    <el-table :data="goodLists" stripe border>
            <!--label是指标题名字，prop是指接口中获取到的数据-->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="商品名称" prop="goods_name" width="700px"></el-table-column>
            <el-table-column label="商品价格(元)" prop="goods_price" width="140px"></el-table-column>
            <el-table-column label="商品重量" prop="goods_weight" width="100px"></el-table-column>
            <el-table-column label="创建时间">
<!-- scope.row.add_time | dataFormat  这个用法就是将scope.row.add_time传到dataFormat进行加工，转换成时间格式，再将其渲染出来-->
                <template v-slot="scope">{{scope.row.add_time | dataFormat}}</template>
            </el-table-column>
            <el-table-column label="操作" width="140px">
                <template v-slot="scope">
                    <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                   @click="deleteGoods(scope.row.goods_id)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
    <!--分页列表区域-->
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :page-size="queryInfo.pagesize" :page-sizes="[5, 10, 12, 15, 20]" :total="total"
        :current-page="queryInfo.pagenum" layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
    </div>
</template>

<script>
    import Crumb from "@/common/Crumb";
  export default {
    name: "Goods",
    components:{Crumb},
    data(){
      return {
        //查询参数对象
        queryInfo:{
          query: '',
          pagenum : 1,
          pagesize : 10
        },
        //商品列表
        goodLists:[],
        total:0
      }
    },
    created(){
      this.getGoodsList()
    },
    methods:{
      //根据分页获取相应的总商品列表(包括商品和分页和总数)
      async getGoodsList(){
        const {data:res} = await this.$http.get('goods',{params:this.queryInfo})
        if(res.meta.status !== 200){return this.$messages.error('获取商品列表失败')}
        this.$messages.success('成功获取商品列表')
        // console.log(res.data)
        //这是获取商品数据
        this.goodLists = res.data.goods
        //商品总数
        this.total = res.data.total
      },
      handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      //点击删除按钮,根据ID删除对应的商品信息
      async deleteGoods(id) {
        //弹框询问用户是否删除商品数据
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
        const {data : res} =await this.$http.delete(`goods/${id}`)
        if(res.meta.status !== 200){return this.$messages.error('删除商品失败')}
        this.$messages.success('成功删除商品')
        //更新用户列表
        await this.getGoodsList()
      },
      //点击编辑按钮，跳转到添加商品的组件
      goAddGoodsComp(){
        this.$router.push('/goods/add')
      }
    }
  }
</script>

<style scoped>

</style>