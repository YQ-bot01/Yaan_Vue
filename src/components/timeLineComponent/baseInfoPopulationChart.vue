<template>
    <div class="chart-container">
         <span
             style=" position: absolute;    font-weight: bold;padding-left: 0px;margin-top: 7px; margin-left: 3%; font-size: 14px; color: #fff;">
                            {{populationDataChartUpdateTime}}年各区县 人口情况
                          </span>
      <div ref="pieChart" class="chart"></div>
    </div>

</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, nextTick, watch, defineProps} from 'vue';
import * as echarts from 'echarts';
import {getPopulationData} from "@/api/system/statistics.js";


const props = defineProps({
  centerPoint: String
});

const pieChart = ref(null);
let pieChartInstance = null;

// 人口新饼图数据和初始化
const populationDataChartUpdateTime = ref('');
const populationData = ref({
  xAxisData: [], // 区县
  seriesData: [],  // 人口总数
});

const handlePopulationData = () => {
  getPopulationData().then((res) => {
    console.log("后端返回的人口数据:", res); // 查看实际返回的数据

    // 确保返回数据是有效的，并且 data 字段存在
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // 提取 `area` 和 `totalPopulation`
      const xAxisData = res.data.map(item => item.area);  // 存储区域名
      const seriesData = res.data.map((item) => (item.totalPopulation / 10000).toFixed(2)); // 保留两位小数

      populationData.value = {xAxisData, seriesData}; // 格式化存储数据
      console.log("提取后的人口数据:", populationData.value);

      populationDataChartUpdateTime.value =new Date(res.data[0].updateTime) .getFullYear(); // 更新时间
      // console.log(populationDataChartUpdateTime.value,"populationDataChartUpdateTime")

      // 确保在数据加载完成后初始化图表
      initCharts(); // 现在调用 initCharts
    } else {
      console.error("返回的人口数据格式不正确或数据为空", res);
    }
  }).catch(error => {
    console.error("获取人口数据时出错:", error); // 捕获并处理错误
  });
};

const initCharts = () => {
  if (pieChart.value) {
    pieChartInstance =echarts.init(pieChart.value,{width:'250px',height:'150px'});
    // 找到与 props.earthquakeName 匹配的县区的下标
    const targetIndex = populationData.value.xAxisData.findIndex((item) => item === props.centerPoint.earthquakeName.slice(-3));

    // 根据选中下标动态生成柱状图数据并设置颜色
    const barSeriesData = populationData.value.seriesData.map((value, index) => ({
      value,
      itemStyle: {
        color:
            index === targetIndex
                ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {offset: 0, color: 'rgb(255,156,103)'}, // 红色渐变起点
                  {offset: 0.33, color: 'rgb(253,99,168)'}, // 红色中间色
                  {offset: 0.66, color: 'rgb(255,70,98)'}, // 红色中间色
                  {offset: 1, color: 'rgb(168,12,83)'},     // 红色渐变终点
                ])
                : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {offset: 0, color: 'rgba(113, 226, 135, 1)'}, // 默认渐变起点
                  {offset: 0.33, color: 'rgba(10, 180, 230, 1)'}, // 默认渐变中点 1
                  {offset: 0.66, color: 'rgba(0, 100, 200, 1)'}, // 默认渐变中点 2
                  {offset: 1, color: 'rgba(0, 49, 144, 1)'},    // 默认渐变终点
                ]),
      },
    }));
    console.log(populationData.value, "populationData")
    const pieOption = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b0}: {c0}万',
      },
      grid: {
        left: "16%",
        right: "15%",
        top: "20%",
        bottom: "20%",
      },
      xAxis: {
        type: 'category',
        name: '区县',
        nameTextStyle: {
          color: '#FFFFFF',
          fontSize: 9,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          margin: 6,
          textStyle: {
            color: '#FFFFFF',
            fontSize: 8,
          },
        },
        data: populationData.value.xAxisData,  // 使用动态的 x 轴数据
      },
      yAxis: {
        type: 'value',
        name: '人口（万）',
        nameTextStyle: {
          color: '#FFFFFF',
          fontSize: 9,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#FFFFFF',
          formatter: function (value) {
            return value + ' 万人';  // y轴显示万人单位
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(255,255,255,0.5)',
            width: 1,
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: '柱状图',
          type: 'pictorialBar',
          symbol: 'rect', // 使用矩形作为柱状图形
          barWidth: '50%', // 设置柱宽
          symbolRepeat: true, // 开启重复模式
          symbolMargin: 3, // 矩形之间的间隔
          symbolSize: ['100%', 8], // 每个矩形的宽度和高度
          data: barSeriesData, // 使用动态的 y 轴数据--动态颜色
          z: 5,
        },
        {
          name: '透明间隔',
          type: 'pictorialBar',
          barWidth: '50%',
          symbol: 'rect',
          symbolRepeat: true,
          symbolMargin: 3,
          symbolSize: ['100%', 8],
          itemStyle: {
            normal: {
              color: 'rgba(0, 0, 0, 0)', // 透明色
            },
          },
          data: populationData.value.seriesData, // 使用动态的 y 轴数据
          z: 4, // 透明部分放在渐变层之下
        },
      ],
    };
    // 初始化并设置图表
    pieChartInstance.setOption(pieOption);
  }
};

onMounted(() => {
  nextTick(() => {
    handlePopulationData();
  });
});

onBeforeUnmount(() => {
  if (pieChartInstance) pieChartInstance.dispose();
});

// 监听 props.centerPoint 的变化
watch(() => props.centerPoint, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    initCharts();
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
  top: 0% !important;
  width: 98%;
  height: 98%;
  min-height: 50px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>

