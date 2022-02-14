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
            <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
            <div id="main" style="width: 600px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
  import Crumb from "@/common/Crumb";
  //导入echarts插件
  import * as echarts from 'echarts';
  //深拷贝
  import _ from 'lodash'
  export default {
    name: "Report",
    components: {Crumb},
    data(){
        return {
          options: {
            title: {
              text: '用户来源'
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                label: {
                  backgroundColor: '#E9EEF3'
                }
              }
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: [
              {
                boundaryGap: false
              }
            ],
            yAxis: [
              {
                type: 'value'
              }
            ]
          }
        }
    },
    created(){

    },
    async mounted(){
      // 3.基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main'));
      const {data : res} = await this.$http.get('reports/type/1')
      if(res.meta.status !== 200){return this.$messages.error('获取折线图数据失败')}
      this.$messages.success('成功获取折线图数据')
      //4.准备数据和配置项,将服务器数据和配置项合并
      const result = _.merge(res.data,this.options)
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(result);
    },
    methods:{

    }
  }
</script>

<style scoped>

</style>
<!--1.先git branch查看当前分支 2.再git status查看状态 3.紧接着 git add . 将代码提交到本地仓库
4.git commit -m "完成了功能报表的开发" 5.git push提交到码云 6.合并到master git checkout master
git merge report(分支的名字)  最后git push-->

