<template>
    <div>
        <!--面包屑导航-->
        <crumb>
            <el-breadcrumb-item :to="{ path: '/' }" slot="first">首页</el-breadcrumb-item>
            <el-breadcrumb-item slot="second">商品管理</el-breadcrumb-item>
            <el-breadcrumb-item slot="third">参数列表</el-breadcrumb-item>
        </crumb>
        <!--面包屑导航-->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!--        商品列表区域-->
            <el-table :data="orderList" stripe border>
                <!--label是指标题名字，prop是指接口中获取到的数据-->
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number" width="400px"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="140px"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" width="100px">
                    <template v-slot:default="scope">
                        <el-tag type="warning" v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="100px">
                    <template v-slot="scope">
                        <i class="el-icon-error" v-if="scope.row.is_send ==='否'" style="color: indianred"></i>
                        <i class="el-icon-success" v-else style="color: lightgreen"></i>
                    </template>
                </el-table-column>
                <el-table-column label="下单时间">
                    <!-- scope.row.add_time | dataFormat  这个用法就是将scope.row.add_time传到dataFormat进行加工，转换成时间格式，再将其渲染出来-->
                    <template v-slot="scope">{{scope.row.create_time | dataFormat}}</template>
                </el-table-column>
                <el-table-column label="操作" width="140px">
                    <!--                <template v-slot="scope">-->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                    <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    <!--                </template>-->
                </el-table-column>
            </el-table>
            <!--分页列表区域-->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                           :page-size="queryInfo.pagesize" :page-sizes="[5, 10, 12, 15, 20]" :total="total"
                           :current-page="queryInfo.pagenum" layout="total, sizes, prev, pager, next, jumper">
            </el-pagination>
        </el-card>
        <!--添加城市的对话框-->
        <el-dialog
                title="添加城市" :visible.sync="addCityDialogVisible"
                width="50%" @close="addCityClosed">
            <!--添加参数的表单-->
            <el-form ref="addressRef" :model="addressForm" :rules="addressFormRules" label-width="80px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader v-model="addressForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCityDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCityDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
        <!--展示物流信息的对话框-->
        <el-dialog title="物流信息" :visible.sync="addProgressDialogVisible" width="60%" >
            <el-timeline>
                <el-timeline-item
                        v-for="(activity, index) in progressData" :key="index"
                        :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
  import Crumb from "@/common/Crumb";
  // import cityData from "../orders/cityData"
  export default {
    name: "Orders",
    components: {Crumb},
    data() {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10,
        },
        total: 0,
        orderList: [],
        addCityDialogVisible: false,
        addressForm: {
          address1: [],
          address2: '',
        },
        addressFormRules: {
          address1:[
            {required:true,message:'请选择省市区/县',trigger:'blur'}
          ],
          address2:[
            {required:true,message:'请填写具体地址',trigger:'blur'}
          ],
        },
        addProgressDialogVisible : false,
        //物流信息的数据(因为接口不能用，所以用死数据)
        progressData:[
          {
            "time": "2018-05-10 09:39:00",
            "ftime": "2018-05-10 09:39:00",
            "context" : "已签收，感谢使用顺丰，期待再次为您服务",
            "location" : ""
          },
          {
            "time": "2018-05-10 08:23:00",
            "ftime": "2018-05-10 08:24:00",
            "context" : "[北京市]北京市海淀区育新先去营业点派件员 顺丰速运 96338正在为您派件",
            "location" : ""
          },
          {
            "time": "2018-05-10 07:39:00",
            "ftime": "2018-05-10 07:39:00",
            "context" : "快递到达[北京海淀育新小区营业点]",
            "location" : ""
          },
          {
            "time": "2018-05-10 02:03:00",
            "ftime": "2018-05-10 02:03:00",
            "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
            "location": ""
          },
          {
            "time": "2018-05-09 23:05:00",
            "ftime": "2018-05-09 23:05:00",
            "context": "快件到达 [北京顺义集散中心]",
            "location": ""
          },
          {
            "time": "2018-05-09 21:21:00",
            "ftime": "2018-05-09 21:21:00",
            "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
            "location": ""
          },
          {
            "time": "2018-05-09 13:07:00",
            "ftime": "2018-05-09 13:07:00",
            "context": "顺丰速运 已收取快件",
            "location": ""
          },
          {
            "time": "2018-05-09 12:25:03",
            "ftime": "2018-05-09 12:25:03",
            "context": "卖家发货",
            "location": ""
          },
          {
            "time": "2018-05-09 12:22:24",
            "ftime": "2018-05-09 12:22:24",
            "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
            "location": ""
          },
          {
            "time": "2018-05-08 21:36:04",
            "ftime": "2018-05-08 21:36:04",
            "context": "商品已经下单",
            "location": ""
          }
        ],
      }
    },
    created() {
      this.getOrderList()
    },
    methods: {
      async getOrderList() {
        const {data: res} = await this.$http.get('orders', {params: this.queryInfo})
        if (res.meta.status !== 200) {
          this.$messages.error('获取订单列表失败')
        }
        this.$messages.success('成功获取订单列表')
        this.total = res.data.total
        this.orderList = res.data.goods
        // console.log(res.data)
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getOrderList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getOrderList()
      },
      //点击编辑展开对话框
      showBox() {
        this.addCityDialogVisible = true

      },
      //关闭对话框重置数据
      addCityClosed(){
        this.$refs.addressRef.resetFields()
      },
      //展开物流信息对话框
      showProgressBox(){
        this.addProgressDialogVisible = true
        //由于接口数据错误，这里就不具体写物流信息的业务逻辑了
      }


    }
  }
</script>

<style scoped>

</style>