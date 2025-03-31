<template>
  <div class="personalCasualtyPanel">

    <div class="panelLegend">
      <span>图例（人数）</span>
      <ul>
        <li v-for="(item, index) in legendItems" :key="index">
          <span
            :style="{ backgroundColor: `rgba(${convertColor(item.color)}, 1)`, width: '40px', height: '15px' }"></span>
          {{ item.label }}
        </li>
      </ul>
    </div>

    <div class="panelTable">
      <div class="text" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="margin: 0 auto">
          <span>雅安地区预估伤亡总数：</span>
          <span class="emphasis">{{ totalCasualtyNum }} 人</span>
        </span>
      </div>
      <div class="table">
        <el-table :data="tableData" :height="180" :max-height="180" stripe
                  :header-cell-style="tableHeaderColor" :cell-style="tableColor" :row-style="{ height: '46px' }">
          <el-table-column prop="county" label="雅安市地区" align="center" width="100"></el-table-column>
          <el-table-column prop="casualty.death" label="死亡人数" align="center" width="90"></el-table-column>
          <el-table-column prop="casualty.injury" label="受伤人数" align="center" width="90"></el-table-column>
          <el-table-column prop="casualty.pops" label="受灾人数" align="center" width="90"></el-table-column>
          <el-table-column prop="casualty.buriedCount" label="压埋人数" align="center"></el-table-column>
          <el-table-column prop="casualty.missing" label="失踪人数" align="center"></el-table-column>
          <el-table-column prop="casualty.buriedCount" label="需转移安置人数" align="center" width="120"></el-table-column>
        </el-table>
      </div>
    </div>

    <div class="panelChart" ref="chart" ></div>

    <div class="panelEqInfo">
    <span style="color: #409eff;font-size: 18px">{{ selectedTabData.earthquakeName }} {{
        selectedTabData.magnitude
      }}级地震</span>
      <div style="padding: 1px 20px 10px 20px">
        <p>发震时刻：{{ timestampToTime(this.selectedTabData.occurrenceTime, "fullDateTime") }}</p>
        <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
        <p>地震震级：{{ selectedTabData.magnitude }}</p>
        <p>震源深度：{{ selectedTabData.depth }}千米</p>
      </div>
    </div>

  </div>

</template>

<script>
import * as echarts from "echarts";
import {timestampToTime} from "../../cesium/plot/eqThemes.js";

export default {
  props: {
    personalCasualtyData: {
      type: Object,
      required: true,
    },
    selectedTabData: Object,

    chartDisplay:Boolean,
  },
  data() {
    return {
      tableData: [], // 存储表格数据
      totalCasualtyNum: 0, // 伤亡人数之和
      legendItems: [
        { color: '(254, 204, 203)', label: '1-5人' },
        { color: '(255, 177, 167)', label: '6-10人' },
        { color: '(254, 151, 134)', label: '11-20人' },
        { color: '(253, 128, 106)', label: '21-50人' },
        { color: '(245, 101, 75)', label: '51-100人' },
        { color: '(240, 78, 53)', label: '101-250人' },
        { color: '(231, 50, 31)', label: '251-500人' },
        { color: '(218, 0, 0)', label: '> 500人' },
      ],


    };
  },
  mounted() {
    this.loadTableData();
    this.$nextTick(() => {
      this.initChart();
    });
  },
  watch: {
    personalCasualtyData: {
      handler() {
        this.loadTableData();
        this.$nextTick(() => {
          this.initChart();
        });
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    timestampToTime,
    initChart() {
      // 检查是否有数据和chart DOM
      if ( !this.personalCasualtyData || !this.$refs.chart) {
        return;
      }

      // 获取图表 DOM 元素
      const chartDom = this.$refs.chart;
      const myChart = echarts.init(chartDom);

      // 准备数据
      const tableData = this.personalCasualtyData.sort((a, b) => b.partTotal - a.partTotal);
      const counties = tableData.map(item => item.county);

      // 提取堆叠数据
      const deaths = tableData.map(item => item.casualty.death || 0);
      const injuries = tableData.map(item => item.casualty.injury || 0);
      const missings = tableData.map(item => item.casualty.missing || 0);
      const buriedCounts = tableData.map(item => item.casualty.buriedCount || 0);

      // 设置图表配置项
      const option = {
        title: {
          text: '雅安市人员伤亡',
          left: 'center',
          textStyle: {
            color: '#fff', // 设置标题颜色为白色
          },
        },
        legend: {
          data: ['死亡人数', '受伤人数', '失踪人数', '压埋人数'],
          top: '8%',
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
          left: '5%',
          right: '5%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: counties,
          name: '',
          axisLabel: {
            color: '#fff', // 设置X轴标签颜色为白色
          },
          nameTextStyle: {
            color: '#fff', // 设置X轴名称颜色为白色
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
          },
          {
            name: '失踪人数',
            type: 'bar',
            stack: '总数',
            data: missings,
            itemStyle: {
              color: '#f1634b',
            },
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
          },
        ],
      };

      // 使用刚指定的配置项和数据显示图表
      myChart.setOption(option);
    },
    loadTableData() {
      if (this.personalCasualtyData) {
        this.tableData = this.personalCasualtyData;
        this.totalCasualtyNum = this.personalCasualtyData.reduce((sum, item) => sum + (item.partTotal || 0), 0);
      } else {
        this.tableData = [{name: '暂无数据', num: '0'}];
        this.totalCasualtyNum = 0;
      }
    },
    convertColor(colorString) {
      return colorString.replace(/[()]/g, '').split(',').map(c => parseInt(c.trim())).join(', ');
    },
    tableHeaderColor() {
      return {
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#555555',
        'background-color': '#293038 !important',
        'color': '#fff',
        'padding': '0',
        'text-align': 'center',
      };
    },
    tableColor({rowIndex}) {
      if (rowIndex % 2 === 1) {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#313a44',
          'color': '#fff',
          'padding': '10',
        };
      } else {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#304156',
          'color': '#fff',
          'padding': '10',
        };
      }
    },
  },
};
</script>

<style scoped>
.personalCasualtyPanel {
  display: flex;
  flex-direction: row;
  height: 250px;
  z-index: 1;
}

.panelEqInfo {
  width: 300px;
  height: 250px;
  z-index: 2;
  background-color: rgba(45, 61, 81, 0.8);
  border-right: #000 2px solid;
}

.panelTable {
  width: 540px;
}

.panelLegend {
  width: 180px;
  height: 100%;
  padding: 5px 0 0 10px;
}

.panelChart {
  border-right: #000 2px solid;
  width: 600px;
  height: 100%;
}

.panelLegend, .panelTable, .panelEqInfo {
  padding: 10px;
  border-right: #000 2px solid;
}

.table {
  margin-top: 10px;
}

.emphasis {
  font-size: 20px;
  color: orange;
  font-weight: bold;
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
  margin: 10px 0;
  color: #fff;
  width: 100%;
  height: 15px;
  font-size: 14px;
}

p {
  color: #fff;
}
</style>
