<template>
  <el-carousel trigger="click" height="880px" :interval="0" >
    <el-carousel-item>
      <div class="people-item">
        <!--        人员伤亡统计表格-->
        <div class="people-table">
          <div class="pop">
            <div class="pop_header">
              <span class="pop_title">人员伤亡统计表格</span>
            </div>
          </div>
          <div class="statistics">
            <span class="total">雅安地区预估伤亡人数：</span>
            <span class="emphasis"> {{ totalCasualtyNum }} </span>
            <span class="total"> 人</span>
          </div>
          <div class="tables">
            <el-table :data="PCTableData" :height="230" :max-height="230" :row-style="{ height: '46px', backgroundColor: 'transparent' }"
                      :header-cell-style="tableHeaderColor" :cell-style="tableColor">
              <el-table-column type="index" label="序号" align="center" width="60"></el-table-column>
              <el-table-column prop="county" label="雅安市地区" align="center" width="100"></el-table-column>
              <el-table-column prop="casualty.death" label="死亡人数" align="center" width="90"></el-table-column>
              <el-table-column prop="casualty.injury" label="受伤人数" align="center" width="90"></el-table-column>
              <el-table-column prop="casualty.pops" label="受灾人数" align="center" width="90"></el-table-column>
              <el-table-column prop="casualty.buriedCount" label="压埋人数" align="center"></el-table-column>
              <el-table-column prop="casualty.missing" label="失踪人数" align="center"></el-table-column>
              <el-table-column prop="casualty.buriedCount" label="需转移安置人数" align="center"
                               width="120"></el-table-column>
            </el-table>
          </div>
        </div>
        <!--        人员统计chart图-->
        <div class="people-chart">
          <div class="pop">
            <div class="pop_header">
              <span class="pop_title">人员伤亡</span>
            </div>
          </div>
          <div class="panelChart" ref="PCChart"></div>
        </div>
      </div>
    </el-carousel-item>
    <el-carousel-item>
      <div class="economic-item">
        <div class="economic-table">
          <div class="pop">
            <div class="pop_header">
              <span class="pop_title">经济损失统计表格</span>
            </div>
          </div>
          <div class="statistics">
            <span class="total">地震造成经济损失共计约</span>
            <span class="emphasis"> {{ ELTotal}} </span>
            <span class="total">万元</span>
          </div>
          <div class="tables">
            <el-table :data="panelData.economicLossData" :height="230" :max-height="230" :row-style="{ height: '46px' }"
                      :header-cell-style="tableHeaderColor" :cell-style="tableColor">
              <el-table-column type="index" label="序号" align="center" width="60"></el-table-column>
              <el-table-column prop="county" label="区县名称" align="center"></el-table-column>
              <el-table-column prop="amount" label="经济损失 / 万元" align="center"></el-table-column>
            </el-table>
          </div>
        </div>
        <div class="economic-chart">
          <div class="pop">
            <div class="pop_header">
              <span class="pop_title">经济损失</span>
            </div>
          </div>
          <div class="panelChart" ref="ELChart"></div>
        </div>
      </div>
    </el-carousel-item>
    <el-carousel-item>
      <div class="building-item">
        <div class="building-table">
          <div class="pop">
            <div class="pop_header">
              <span class="pop_title">建筑破坏统计表格</span>
            </div>
          </div>
          <div class="statistics">
            <span class="total">地震造成建筑破坏共计约</span>
            <span class="emphasis"> {{ BDTotal }} </span>
            <span class="total">万平方米</span>
          </div>
          <div class="tables">
            <el-table :data="panelData.buildingDamageData" :height="230" :max-height="230" :row-style="{ height: '46px' }"
                      :header-cell-style="tableHeaderColor" :cell-style="tableColor">
              <el-table-column type="index" label="序号" align="center" width="60"></el-table-column>
              <el-table-column prop="county" label="区县名称" align="center"></el-table-column>
              <el-table-column prop="size" label="建筑破坏 / 万m²" align="center"></el-table-column>
            </el-table>
          </div>
        </div>
        <div class="building-chart">
          <div class="pop">
            <div class="pop_header">
              <span class="pop_title">建筑破坏</span>
            </div>
          </div>
          <div class="panelChart" ref="BDChart"></div>
        </div>
      </div>
    </el-carousel-item>
  </el-carousel>

</template>

<script>
import {getDA, getEqTownResult} from "../../api/system/damageassessment.js";
import {handleTownData, timestampToTime} from "../../cesium/plot/eqThemes.js";
import * as echarts from 'echarts';
import * as Cesium from 'cesium';
import eqMark from "@/assets/images/DamageAssessment/eqMark.png";

export default {
  props: {
    eqid: {
      type: String,
      default: null,
    },
    eqqueueId: {
      type: String,
      default: null,
    },
  },
  name: "",
  data() {
    return {
      panelData: {
        buildingDamageData: [],
        economicLossData: [],
        personalCasualtyData: [],
      },

      PCTableData: [],
      totalCasualtyNum: 0,

      ELTableData: [],
      ELTotal: 0,

      BDTableData: [],
      BDTotal: 0,

      // 图层专题需要处理的数据
      layerData: {
        ecoData: {},
        bddData: {},
        pcData: {},
      },
    }
  },
  mounted() {
    this.getData(this.eqid,this.eqqueueId)
  },
  methods: {
    getData(eqid,eqqueueId) {
      getEqTownResult({eqid: eqid, eqqueueId: eqqueueId,}).then((res) => {
        const countyData = handleTownData(res.data)
        console.log("countyData",countyData)
        // 提取对应专题数据
        this.panelData.buildingDamageData = countyData.buildingDamageData
        this.panelData.economicLossData = countyData.economicLossData
        this.panelData.personalCasualtyData = countyData.personalCasualtyData

        this.loadPCData()
        this.loadELData()
        this.loadBDData()

      });
    },/**
     * 缩写：PC-人员伤亡；EL-经济损失；BD-建筑破坏
     */
    // 处理人员伤亡表格数据
    loadPCData() {
      if (this.panelData.personalCasualtyData) {
        this.PCTableData = this.panelData.personalCasualtyData;
        this.totalCasualtyNum = this.panelData.personalCasualtyData.reduce((sum, item) => sum + (item.partTotal || 0), 0);
      } else {
        this.PCTableData = [{name: '暂无数据', num: '0'}];
        this.totalCasualtyNum = 0;
      }

      // 图层所需数据格式
      this.layerData.pcData = JSON.parse(JSON.stringify(
          this.panelData.personalCasualtyData.reduce((acc, item) => {
            acc[item.county] = item.partTotal;
            return acc;
          }, {})
      ));
      console.log("图层人员伤亡",this.layerData.pcData)

      this.initPCChart()
    },

    loadELData() {
      this.panelData.economicLossData.sort((a, b) => b.amount - a.amount);
      this.ELTotal = this.panelData.economicLossData.reduce((acc, cur) => acc + cur.amount, 0).toFixed(2);
      // 提取county:amount对象
      const countyAmountMap = this.panelData.economicLossData.reduce((acc, cur) => {
        acc[cur.county] = cur.amount;
        return acc;
      }, {});

      //图层所需数据格式
      this.layerData.ecoData = this.panelData.economicLossData.reduce((acc, item) => {
        acc[item.county] = item.amount;
        return acc;
      }, {});
      console.log("图层经济损失",this.layerData.ecoData)

      this.initELChart(countyAmountMap)
    },

    loadBDData() {
      this.panelData.buildingDamageData.sort((a, b) => b.size - a.size);

      this.BDTotal = parseFloat(this.panelData.buildingDamageData.reduce((acc, cur) => acc + cur.size, 0).toFixed(2));

      // 提取 county: size 对象
      const countySizeMap = this.panelData.buildingDamageData.reduce((acc, cur) => {
        acc[cur.county] = cur.size;
        return acc;
      }, {});

      //图层所需数据格式
      this.layerData.bddData = this.panelData.buildingDamageData.reduce((acc, item) => {
        acc[item.county] = item.size;
        return acc;
      }, {});
      console.log("图层建筑损毁",this.layerData.bddData)

      this.initBDChart(countySizeMap)
    },

    initPCChart() {
      // 检查是否有数据和chart DOM
      if (!this.panelData.personalCasualtyData || !this.$refs.PCChart) {
        return;
      }

      // 获取图表 DOM 元素
      const chartDom = this.$refs.PCChart;
      const myChart = echarts.init(chartDom);

      // 准备数据
      const tableData = this.panelData.personalCasualtyData.sort((a, b) => b.partTotal - a.partTotal);
      const counties = tableData.map(item => item.county);

      // 提取堆叠数据
      const deaths = tableData.map(item => item.casualty.death || 0);
      const injuries = tableData.map(item => item.casualty.injury || 0);
      const missings = tableData.map(item => item.casualty.missing || 0);
      const buriedCounts = tableData.map(item => item.casualty.buriedCount || 0);

      // 设置图表配置项
      const option = {
        legend: {
          data: ['死亡人数', '受伤人数', '失踪人数', '压埋人数'],
          top: '2%',
          right: '19%',
          textStyle: {
            color: '#fff', // 图例文字颜色
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow', // 鼠标悬停显示为阴影指示
          },
        },
        grid: {
          left: '12%',
          right: '30%',
          bottom: '18%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: counties,
          name: '',
          axisLabel: {
            color: '#fff', // 设置X轴标签颜色为白色
            interval: 0,
          },
          nameTextStyle: {
            color: '#fff', // 设置X轴名称颜色为白色
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            },
            show: false,
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          },
        },
        yAxis: {
          type: 'value',
          name: '伤亡人数',
          min: 0,
          axisLabel: {
            color: '#fff', // 设置Y轴标签颜色为白色
          },
          nameTextStyle: {
            color: '#fff', // 设置Y轴名称颜色为白色
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#1C82C5'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(4, 187, 255, .2)',
              type: 'dashed'
            }
          },
        },
        series: [
          {
            name: '压埋人数',
            type: 'bar',
            stack: '总数',
            data: buriedCounts,
            itemStyle: {
              color: '#f67d69',
            },
            barWidth: 15,
            barGap: 30,
          },
          {
            name: '失踪人数',
            type: 'bar',
            stack: '总数',
            data: missings,
            itemStyle: {
              color: '#f1634b',
            },
            barWidth: 15,
            barGap: 30,
          },
          {
            name: '受伤人数',
            type: 'bar',
            stack: '总数',
            data: injuries,
            itemStyle: {
              color: '#f04e35',
            },
          },
          {
            name: '死亡人数',
            type: 'bar',
            stack: '总数',
            data: deaths,
            itemStyle: {
              color: '#e7321f',
            },
            barWidth: 15,
            barGap: 30,
            // 配置标签
            label: {
              show: true, // 显示标签
              position: 'top', // 标签显示在顶部
              formatter: (params) => {
                const index = params.dataIndex;
                const total = buriedCounts[index] + missings[index] + injuries[index] + deaths[index];
                return total; // 返回总和值
              },
              color: '#f04e35', // 标签字体颜色
              fontSize: 12, // 字体大小
            },
          },
        ],
      };

      // 使用刚指定的配置项和数据显示图表
      myChart.setOption(option);
    },

    initELChart(countyAmountMap) {
      // 获取图表 DOM 元素
      const chartDom = this.$refs.ELChart;
      const myChart = echarts.init(chartDom);

      // 准备数据
      const counties = Object.keys(countyAmountMap);
      const values = Object.values(countyAmountMap);

      // 将区县和对应的经济损失组合成数组
      const countyData = counties.map((county, index) => ({
        county,
        value: values[index],
      }));

      // 按损失值进行排序，获取前八个最大的
      const topCounties = countyData.sort((a, b) => b.value - a.value).slice(0, 8);

      // 提取前六个的区县名和损失值
      const topCountyNames = topCounties.map(item => item.county);
      const topValues = topCounties.map(item => item.value);

      // 设置图表配置项
      const option = {
        tooltip: {},
        grid: {
          left: '15%',
          right: '32%',
          bottom: '25%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: topCountyNames,
          name: '',
          axisLabel: {
            color: '#fff', // 设置X轴标签颜色为白色
            interval: 0,
          },
          nameTextStyle: {
            color: '#fff', // 设置X轴名称颜色为白色
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            },
            show: false,
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          },
        },
        yAxis: {
          type: 'value',
          name: '损失/万元',
          min: 0,
          max: 1000000,
          interval: 200000,
          axisLabel: {
            color: '#fff', // 设置Y轴标签颜色为白色
          },
          nameTextStyle: {
            color: '#fff', // 设置Y轴名称颜色为白色
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#1C82C5'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(4, 187, 255, .2)',
              type: 'dashed'
            }
          },
        },
        series: [
          {
            type: 'bar',
            data: topValues,
            itemStyle: {
              normal: {
                show: true,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: '#ffc68f'
                }, {
                  offset: 1,
                  color: '#f07814'
                }], false),
                barBorderRadius: 0,
                label: {
                  show: true,
                  position: "top",
                  color: '#fa9440',
                  formatter: function (p) {
                    return p.value > 0 ? (p.value) : '';
                  }
                }
              },
            },
            barWidth: 10,
            barGap: 30,
            label: {
              show: true,
              position: 'top',
              color: '#fff',  // 设置数字的颜色
              fontSize: 12,   // 设置字体大小
            },
          },
        ],
      };

      // 使用刚指定的配置项和数据显示图表
      myChart.setOption(option);
    },

    initBDChart(countySizeMap) {
      // 获取图表 DOM 元素
      const chartDom = this.$refs.BDChart;
      const myChart = echarts.init(chartDom);

      // 准备数据
      const counties = Object.keys(countySizeMap);
      const values = Object.values(countySizeMap);

      // 将县和对应的值组合为数组，方便排序和筛选
      const countyData = counties.map((county, index) => ({name: county, value: values[index]}));

      // 按值降序排序，并取前八个
      const topCounties = countyData.sort((a, b) => b.value - a.value).slice(0, 8);

      // 提取前六个的县名和对应值
      const topCountyNames = topCounties.map(item => item.name);
      const topValues = topCounties.map(item => item.value);

      // 设置图表配置项
      const option = {
        tooltip: {},
        grid: {
          left: '15%',
          right: '31%',
          bottom: '25%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: topCountyNames,
          name: '',
          axisLabel: {
            color: '#fff', // 设置X轴标签颜色为白色
            interval: 0,
          },
          nameTextStyle: {
            color: '#fff', // 设置X轴名称颜色为白色
          },
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            },
            show: false,
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          },
        },
        yAxis: {
          type: 'value',
          name: '损坏/万m²',
          min: 0,
          max: 150,
          interval: 30,
          axisLabel: {
            color: '#fff', // 设置Y轴标签颜色为白色
          },
          nameTextStyle: {
            color: '#fff', // 设置Y轴名称颜色为白色
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#1C82C5'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(4, 187, 255, .2)',
              type: 'dashed'
            }
          },
        },
        series: [
          {
            type: 'bar',
            data: topValues,
            itemStyle: {
              normal: {
                show: true,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: '#015CC7'
                }, {
                  offset: 1,
                  color: '#031E3E'
                }], false),
                barBorderRadius: 0,
                label: {
                  show: true,
                  position: "top",
                  color: '#56C1F8',
                  formatter: function (p) {
                    return p.value > 0 ? (p.value) : '';
                  }
                }
              },
            },
            barWidth: 10,
            barGap: 30,
            label: {
              show: true,
              position: 'top',
              color: '#fff',  // 设置数字的颜色
              fontSize: 12,   // 设置字体大小
            },
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表
      myChart.setOption(option);
    },

    tableHeaderColor() {
      return {
        'border': 'none',
        'color': '#409eff',
        'padding': '0',
        'text-align': 'center',
        'background-color': '#ffffff00',
      }
    },
    // 修改table的背景色
    tableColor() {
      return {
        'border': 'none',
        'color': '#fff',
        'padding': '10',
        'background-color': '#ffffff00',
      }
    },
  },
};
</script>

<style scoped>
.pop {
  width: 100%;
  z-index: 20;
}

.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 15%;
  position: relative;
  left: 7%;
}

.statistics {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.total {
  color: #fff;
}

.emphasis {
  color: #ffa500;
}

.tables {
  height: 280px;
  padding: 0 30px;
}

:deep(.el-table tr) {
  background: #ffffff00;
  font-weight: 1000;
}

:deep(.el-table td) {
  background: #ffffff00;
  font-weight: 1000;
}

/*表格页面样式*/
:deep(.el-table__inner-wrapper::before) {
  width: 0
}

:deep(.el-table) {
  --el-table-bg-color: ''
}

:deep(.el-table__body-wrapper) {
  --el-table-bg-color: '';
  background-color: transparent !important;
}

/* 滚动条轨道 */
:deep(.el-scrollbar__track) {
  border-radius: 10px;
  background: #008aff70; /* 轨道的背景颜色 */
}

/* 滚动条滑块 */
:deep(.el-scrollbar__thumb) {
  border-radius: 10px;
  background-color: #1f9dca; /* 滑块的背景颜色 */
  border: 2px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造“边距”的效果 */
}

.panelChart {
  width: 500px;
  height: 250px;
}

.people-item {
  width: 530px;
  height: 880px;
}

.legend {
  width: 150px;
  height: 100%;
  padding: 5px 0 0 10px;
}

span {
  color: #fff;
  font-size: 14px;
  margin-right: 10px;
}

ul {
  padding: 0;
}

li {
  display: flex;
  margin: 3px 0;
  color: #fff;
  width: 100%;
  height: 15px;
  line-height: 15px;
  font-size: 12px;
}
</style>
