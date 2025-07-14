<template>
  <div>
    <el-carousel :autoplay="false" :interval="5000" :initial-index="initialIndex" style="height: 100%;   left: 4px;" indicator-position="none" :key="carouselKey">
      <!-- 余震数量图表 -->
      <el-carousel-item style="height: 100%;">
        <div class="chart-container" style="height: 90%;">
          <img src="@/assets/最新地震余震情况.png" alt="最新地震余震情况" style="width: 127%; height: auto;">
          <span
              style="padding-left: 5px;margin-left: 3%; background: linear-gradient(to right, rgb(218, 45, 45) 0%, rgba(254, 254, 254, 0) 90%); color: white; font-size: 13px;">
            更新时间：{{ updateTime }}
          </span>

          <div ref="aftershockChart" class="chart"></div> <!-- 余震数量图表容器 -->
        </div>
      </el-carousel-item>

      <!-- 各区县人口总数表 -->
      <el-carousel-item>
        <div class="chart-container population-chart-container" >
          <img src="@/assets/各区县人口.png" alt="各区县人口" style="width: 127%; height: auto;">
          <span
              style="padding-left: 5px;margin-left: 3%; background: linear-gradient(to right, rgb(218, 45, 45) 0%, rgba(254, 254, 254, 0) 90%); color: white; font-size: 13px;">
            更新时间：{{ populationDataChartUpdateTime }}
          </span>
          <div ref="populationDataChart" class="chart"></div> <!-- 人口数据图表容器 -->
        </div>
      </el-carousel-item>

      <el-carousel-item>
        <div class="chart-container">
          <img src="@/assets/隐患点.png" alt="隐患点" style="width: 127%; height: auto;">

          <!-- 风险点信息 -->
          <div v-if="riskPointData.length > 0" class="riskPoint" @mouseenter="pauseSlide" @mouseleave="resumeSlide" style="margin-top: -20px">
            <div class="button-top" style="margin-bottom: 5px;">
              <span @click="slideUp" class="white-text">▲</span>
            </div>

            <div class="container" :style="{ transform: `translateY(${translateY.value}px)`, transition: 'transform 0.5s ease' }">
              <el-col>
                <div class="newColCommon">
                  <span class="label">隐患点地点：</span>{{ location || '暂无数据' }}
                </div>
              </el-col>
              <el-col>
                <div class="newColCommon">
                  <span class="label">隐患点类型：</span>{{ riskPointType || '暂无数据' }}
                </div>
              </el-col>
              <el-col>
                <div class="newColCommon">
                  <span class="label">与震中距离：</span>{{ distance ? distance + ' 千米' : '暂无数据' }}
                </div>
              </el-col>
              <el-col>
                <div class="newColCommon">
                  <span class="label">险情等级：</span>{{ riskLevel || '暂无数据' }}
                </div>
              </el-col>
              <el-col>
                <div class="newColCommon">
                  <span class="label">稳定性：</span>{{ stability || '暂无数据' }}
                </div>
              </el-col>
            </div>

            <div class="button-bottom" style="margin-top: 5px;">
              <span @click="slideDown" class="white-text">▼</span>
            </div>
          </div>

          <!-- 如果没有数据，显示暂无数据 -->
          <div v-else class="no-data">
            <div>与震中距离：暂无数据</div>
            <div>隐患点地点：暂无数据</div>
            <div>隐患点类型：暂无数据</div>
            <div>险情等级：暂无数据</div>
            <div>稳定性：暂无数据</div>
          </div>
        </div>
      </el-carousel-item>


    </el-carousel>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { getAftershockMagnitude, getPopulationData, getRiskPoint } from "@/api/system/statistics.js";

const props = defineProps(['lastEq']);
const aftershockChart = ref(null);
const populationDataChart = ref(null);
const updateTime = ref('');
const eqoccurrenceTime = ref('');
const populationDataChartUpdateTime = ref('')

// 避难点
const location = ref('');
const riskPointType = ref('');
const distance = ref('');
const riskLevel = ref('');
const stability = ref('');
const translateY = ref(0); // 用于动画
const currentIndex = ref(0); // 当前显示的隐患点索引
const riskPointData = ref([]); // 存储从 API 获取的隐患点数据
const carouselKey = ref(0)
let myAftershockChart = null; // 余震图表实例
let myPopulationDataChart = null; // 人口数据图表实例

// 控制初始展示的索引
const initialIndex = ref(0); // 当前展示的隐患点索引


// 初始化余震图表
// 注册一个自定义图形（斜角柱状图）
const myShape = {
  x: 0,
  y: 0,
  width: 10, //柱宽
};

// 绘制斜角柱状图的左侧面
const InclinedRoofColumn = echarts.graphic.extendShape({
  shape: myShape,
  buildPath: function (ctx, shape) {
    const xAxisPoint = shape.xAxisPoint;
    const c0 = [shape.x, shape.y - 6]; // 降低柱状图左侧高度，以控制倾斜角度与方向
    const c1 = [shape.x - 10, shape.y];
    const c2 = [xAxisPoint[0] - 10, xAxisPoint[1]];
    const c3 = [xAxisPoint[0], xAxisPoint[1]];
    ctx
        .moveTo(c0[0], c0[1])
        .lineTo(c1[0], c1[1])
        .lineTo(c2[0], c2[1])
        .lineTo(c3[0], c3[1])
        .closePath();
  },
});

// 注册斜角柱状图形
echarts.graphic.registerShape('InclinedRoofColumn', InclinedRoofColumn);

// 初始化余震图表
const initAftershockChart = () => {
  if (!aftershockChart.value) return; // 检查图表容器是否存在

  const option = {
    tooltip: {
      textStyle:{
        color: '#15ecf4'
      },
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          color: '#15ecf4'
        }
      },
      backgroundColor: 'rgba(0,0,0,.8)',
      extraCssText: 'box-shadow: 4px 4px 10px rgba(21, 250, 255,.6);',
      formatter: (params) => {
        return params.map(item => `${item.marker}${item.name}: ${(item.value).toFixed(2)} 次`).join('<br/>');
      },
    },
    grid: {
      left: 20,
      right: 20,
      top: 50,
      bottom: 40,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['3-3.9级', '4-4.9级', '5-5.9级', '     6.0级及以上'],
      axisLabel: {
        color: '#ffffff',
        interval: 0, // 显示所有标签

      },
      axisLine: {
        lineStyle: {
          color: '#8AC4FF',
        },
      },
      axisTick: {
        show: true,
        inside: true,
        length: 2,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        color: '#8AC4FF',
        formatter: (value) => value.toFixed(0) + ' 次',
      },
      axisTick: {
        show: true,
        inside: true,
        length: 2,
        lineStyle: {
          color: '#8AC4FF',
        },
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        type: 'custom', // 使用自定义图形
        renderItem: (params, api) => {
          const location = api.coord([api.value(0), api.value(1)]);
          const point = api.coord([api.value(0), 0]);
          return {
            type: 'group',
            children: [
              {
                type: 'InclinedRoofColumn', // 使用刚才注册的自定义图形
                shape: {
                  api,
                  xValue: api.value(0),
                  yValue: api.value(1),
                  x: location[0] + 5, // 控制柱状图顶部偏移位置，使其居中
                  y: location[1],
                  xAxisPoint: [point[0] + 5, point[1]], // 控制柱状图底部偏移位置，使其居中
                },
                style: {
                  fill: echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#438BFD' },
                    { offset: 0.5, color: '#13B0D7' },
                    { offset: 1, color: '#13B0D7' },
                  ]),
                },
              },
              {
                type: 'image',
                x: location[0] - 16, // 控制图片位置，将其添加到柱状图正中间
                scaleX: 1,
                y: location[1] - 21, // 控制图片位置，将其添加到柱状图最顶端
                style: {
                  image: '', // barHeader 为 UI 给出的发光源切图
                },
              },
            ],
          };
        },
        data: [0, 0, 0, 0], // 初始数据
      },
    ],
  };

  // 初始化 ECharts 实例
  myAftershockChart = echarts.init(aftershockChart.value);
  myAftershockChart.setOption(option);
};


// 更新余震图表
const updateAftershockChart = (data) => {
  if (!myAftershockChart) return; // 检查图表实例是否存在

  // 确保传入的 data 中的每个值都具有默认值，防止 undefined 或 null
  const updatedData = [
    data.magnitude_3_3_9 || 0, // 3-3.9级余震数量
    data.magnitude_4_4_9 || 0, // 4-4.9级余震数量
    data.magnitude_5_5_9 || 0, // 5-5.9级余震数量
    data.magnitude_6_plus || 0 // 6.0级及以上余震数量
  ];

  // 只更新 series 中的数据
  myAftershockChart.setOption({
    series: [{
      name: '余震数量',
      data: updatedData
    }]
  });
};


// 处理余震数据

const handleAftershockData = () => {
  if (props.lastEq) {
    getAftershockMagnitude(props.lastEq.eqid).then((res) => {
      // 更新余震图表
      updateAftershockChart(res);
      // console.log("getAftershockMagnitude", res);

      if(res.submission_deadline) {
        updateTime.value = res.submission_deadline; // 更新时间
      }
      else{
        updateTime.value =eqoccurrenceTime.value; //地震时间

      }
      updateTime.value = formatDate(  updateTime.value);  // 更改时间格式

      // 判断是否有有效余震数据
      const hasAftershockData = !!(res.magnitude_3_3_9 || res.magnitude_4_4_9 || res.magnitude_5_5_9);

      // 设置初始展示的图表
      initialIndex.value = hasAftershockData ? 0 : 1;
      // console.log("initialIndex 值:", initialIndex.value);

      carouselKey.value++; // 更新轮播图

      nextTick(() => {
        // 初始化图表
        initAftershockChart();
        initPopulationDataChart();
        // 更新余震图表并同步更新流光柱状图
        updateAftershockChart(res);

      });
    });
  } else {
    updateTime.value = new Date().toLocaleString(); // 设置当前时间
    updateTime.value = formatDate(  updateTime.value);  // 更改时间格式
    initialIndex.value = 1; // 如果没有lastEq，默认展示静态图
  }
};


// 存储人口数据
const populationData = ref({});

// 处理人口数据
const handlePopulationData = () => {
  getPopulationData().then((res) => {
    // console.log("后端返回的人口数据:", res); // 查看实际返回的数据

    // 确保返回数据是有效的，并且 data 字段存在
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // 提取 `area` 和 `totalPopulation`
      const xAxisData = res.data.map(item => item.area);  // 存储区域名
      const seriesData = res.data.map(item => item.totalPopulation);  // 存储人口数

      populationData.value = { xAxisData, seriesData }; // 格式化存储数据
      // console.log("提取后的数据:", populationData.value);

      populationDataChartUpdateTime.value = res.data[0].updateTime; // 更新时间
      populationDataChartUpdateTime.value = formatDate(  populationDataChartUpdateTime.value);  // 更改时间格式
      initPopulationDataChart(); // 数据加载完成后初始化图表
    } else {
      console.error("返回的数据格式不正确或数据为空", res);
    }
  }).catch(error => {
    console.error("获取人口数据时出错:", error); // 捕获并处理错误
  });
};


// 初始化人口数据图表
const initPopulationDataChart = () => {
  // console.log("人口数据图表容器:", populationDataChart.value); // 调试容器是否存在
  // console.log("人口数据:", populationData.value); // 调试人口数据

  if (!populationDataChart.value || !populationData.value) return;

  const { xAxisData, seriesData } = populationData.value; // 解构提取数据

  // 注册自定义的倾斜屋顶柱状图
  const myShape = {
    x: 0,
    y: 0,
    width: 10, // 柱宽
  };

  const InclinedRoofColumn = echarts.graphic.extendShape({
    shape: myShape,
    buildPath: function (ctx, shape) {
      const xAxisPoint = shape.xAxisPoint;
      const c0 = [shape.x, shape.y - 6]; // 降低柱状图左侧高度以控制倾斜角度与倾斜方向
      const c1 = [shape.x - 10, shape.y];
      const c2 = [xAxisPoint[0] - 10, xAxisPoint[1]];
      const c3 = [xAxisPoint[0], xAxisPoint[1]];
      ctx
          .moveTo(c0[0], c0[1])
          .lineTo(c1[0], c1[1])
          .lineTo(c2[0], c2[1])
          .lineTo(c3[0], c3[1])
          .closePath();
    },
  });
  echarts.graphic.registerShape('InclinedRoofColumn', InclinedRoofColumn);

  // 初始化echarts实例
  const myPopulationDataChart = echarts.init(populationDataChart.value);

  // 定义固定的渐变色
  const gradient = echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: '#438BFD' }, // 上端颜色
    { offset: 0.5, color: '#13B0D7' }, // 中间颜色
    { offset: 1, color: '#13B0D7' },  // 下端颜色
  ]);

  const option = {
    tooltip: {
      textStyle:{
        color: '#15ecf4'
      },
      trigger: 'axis',
      axisPointer: {
        lineStyle: {
          color: '#15ecf4'
        }
      },
      backgroundColor: 'rgba(0,0,0,.8)',
      extraCssText: 'box-shadow: 4px 4px 10px rgba(21, 250, 255,.6);',
      formatter: (params) => {
        // 在 tooltip 中为每个数据值前添加颜色圆点，以万人为单位
        return params.map(item => `${item.marker}${item.name}: ${(item.value / 10000).toFixed(2)} 万人`).join('<br/>');
      }
    },
    grid: {
      left: 13,
      right: 30,
      top: 30,
      bottom: 50,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        color: '#ffffff', // 设置 X 轴标签的颜色为白色
        formatter: (value) => value.split("").join("\n")
      },
      axisTick: {
        alignWithLabel: true,
        inside: true,
        length: 2,
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          fontSize: 6,
          color: '#8AC4FF',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisTick: {
        show: true,
        inside: true,
        length: 2,
        lineStyle: {
          color: '#8AC4FF',
        },
      },
      axisLabel: {
        fontSize: 11,
        color: '#8AC4FF',
        formatter: function(value) {
          return (value / 10000).toFixed(0) + ' 万人'; // 转换为万人单位并保留两位小数
        },
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        type: 'custom',
        renderItem: (params, api) => {
          const location = api.coord([api.value(0), api.value(1)]);
          const point = api.coord([api.value(0), 0]);

          return {
            type: 'group',
            children: [
              {
                type: 'InclinedRoofColumn', // 使用自定义图形
                shape: {
                  api,
                  xValue: api.value(0),
                  yValue: api.value(1),
                  x: location[0] + 5, // 控制柱状图顶部偏移位置，使居中
                  y: location[1],
                  xAxisPoint: [point[0] + 5, point[1]], // 控制柱状图底部偏移位置，使居中
                },
                style: {
                  fill: gradient,  // 设置静态渐变色
                  shadowColor: 'rgba(0, 0, 0, 0.3)', // 设置阴影效果
                  shadowBlur: 10, // 模糊阴影
                  shadowOffsetX: 3,
                  shadowOffsetY: 3,
                },
              },
              // 添加发光效果（如果需要）
              {
                type: 'image',
                x: location[0] - 16, // 控制图片位置，将其添加到柱状图正中间
                scaleX: 1,
                y: location[1] - 21, // 控制图片位置，将其添加到柱状图最顶端
                style: {
                  image: "", // 替换成实际的图片路径
                },
              },
            ],
          };
        },
        data: seriesData, // 使用原数据
        animationDuration: 2000, // 设置动画的时长，单位是毫秒
        animationEasing: 'easeOutQuart', // 设置动画的缓动效果
        animationDelay: (idx) => idx * 300, // 设置每个柱状图动画延迟，形成逐一上升的效果
      },
    ],
  };

  myPopulationDataChart.setOption(option);
};


// 避难点
// 获取隐患点数据
const handleRiskPoint = () => {
  getRiskPoint(props.lastEq.eqid).then((res) => {

    if (res && res.data && res.data.length > 0) {
      riskPointData.value = res.data; // 将数据存入数组
      updateRiskPointInfo(); // 更新初始隐患点数据
    } else {
      console.warn("没有找到隐患点数据", res.data);
    }
  }).catch((error) => {
    console.error("获取隐患点数据时出错:", error);
  });
};

// 更新显示的隐患点信息
const updateRiskPointInfo = () => {
  const currentRiskPoint = riskPointData.value[currentIndex.value];

  if (currentRiskPoint) {
    location.value = currentRiskPoint.location;
    riskPointType.value = currentRiskPoint.riskPointType;
    distance.value = currentRiskPoint.distance;
    riskLevel.value = currentRiskPoint.riskLevel;
    stability.value = currentRiskPoint.stability;
  }
};

// 滑动显示下一个隐患点
const slideRiskPoints = () => {
  const totalPoints = riskPointData.value.length;
  if (totalPoints > 0) {
    translateY.value = -(currentIndex.value * 70); // 每个隐患点占用 70px 高度

    // 更新当前隐患点数据
    updateRiskPointInfo();

    // 如果到了最后一条数据，重置为第一条
    if (currentIndex.value === totalPoints - 1) {
      setTimeout(() => {
        currentIndex.value = 0;
        translateY.value = 0;
        updateRiskPointInfo();
      }, 500);
    } else {
      currentIndex.value++;
    }
  }
};

function getEqInfo(eqid) {
  getEqListById({id: eqid}).then(res => {
    eqoccurrenceTime.value=res.occurrenceTime
  })
}
// 控制滚动的定时器
let slideInterval = null;

// 启动轮播
const startSlide = () => {
  slideInterval = setInterval(slideRiskPoints, 4000);
};

// 暂停滚动
const pauseSlide = () => {
  clearInterval(slideInterval);
};

// 恢复滚动
const resumeSlide = () => {
  startSlide();
};

const slideUp = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = riskPointData.value.length - 1; // 到达顶部后回到最后一个
  }
  updateRiskPointInfo();
};

const slideDown = () => {
  if (currentIndex.value < riskPointData.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // 到达底部后回到第一个
  }
  updateRiskPointInfo();
};

// 监听lastEq属性的变化，调用处理余震数据的函数
watch(() => props.lastEq,() => {
  handleAftershockData();
  // handleRiskPoint();
  getEqInfo(props.lastEq.eqid)
});

// 窗口大小调整时重新调整图表大小
const resizeChart = () => {
  if (myAftershockChart) {
    myAftershockChart.resize(); // 调整余震图表大小
  }
  if (myPopulationDataChart) {
    myPopulationDataChart.resize(); // 调整人口数据图表大小
  }
};

// 组件挂载后执行初始化
import { nextTick } from 'vue';
import {getEqById, getEqListById} from "@/api/system/eqlist.js";

onMounted(async () => {
  await nextTick(); // 等待 DOM 更新
  initAftershockChart(); // 初始化余震图表
  initPopulationDataChart(); // 初始化人口数据图表
  handleAftershockData(); // 处理余震数据
  handlePopulationData(); // 处理人口数据
  window.addEventListener('resize', resizeChart); // 监听窗口大小变化
  resumeSlide();
  // console.log(props.lastEq.eqid,"props.lastEq.eqid")
  console.log(props.lastEq)
  // getEqInfo(props.lastEq.eqid)
  // getEqInfo()
});

// 组件卸载前移除监听器
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart); // 移除监听器
  clearInterval(slideInterval); // 组件卸载前清除定时器
});


function formatDate(date) {
  // 如果 date 为 null 或空字符串，返回 null 或其他适合的空值
  if (!date) {
    return null;  // 或者返回 ''，取决于你需要的返回值
  }

  const d = new Date(date);

  // 如果 date 无法解析为有效日期，返回 null 或其他默认值
  if (isNaN(d.getTime())) {
    return null;  // 或者返回 '无效日期'
  }

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');  // 月份从0开始，因此要加1
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}
</script>

<style scoped>

/* 通用图表容器 */
.chart-container {
  position: relative;
  width: 100%;
  height: 252px;
  left: 1%;
  /*height: 400px; !* 明确设置图表高度 *!*/
}

.chart {
  height: 100%; /* 图表占满容器高度 */
  margin-top: -20px; /* 向上调整图表位置 */
}

.population-chart-container {
  width: 100%;
  height: 90%; /* 确保人口图表占满容器 */
  margin-top: 0x;
}

/* 标题样式 */
.public-title {
  position: relative;
  width: calc(100% - 30px);
  height: 30px;
  color: #fff;
  padding-left: 16px;
  line-height: 30px;
  font-size: 15px;
  left: 5px;
}

.public-title:before {
  content: "";
  position: absolute;
  width: 4px;
  height: 20px;
  top: 10px;
  left: 5px;
  background: #2997e4;
  border-radius: 2px;
}

/* 字体样式 */
.newColCommon {
  font-size: 16px;
  line-height: 1.5;
  color: #f5f5f5; /* 近似白色的字体颜色 */
}

/* 标签字体 */
.label {
  font-weight: bold; /* 标签加粗 */
}

/* 风险点容器 */
.riskPoint .container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0; /* Ensure no margin is applied */

}

.button-top {
  text-align: center;
  margin: 5px 0;
}
.button-bottom {
  text-align: center;
}
.white-text {
  color: white;
}
/* 3. 没有数据时的显示样式 */
.no-data {
  margin-top: -7px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #ffffff;
  font-size: 16px;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  gap: 15px; /* 增加行与行之间的间距 */

}


.no-data div {
  margin: 5px 0;
}

</style>
