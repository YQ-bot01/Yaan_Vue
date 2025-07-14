<template>
  <div ref="chart1" class="chart1">
    <el-carousel height="350px" indicator-position="none">
      <el-carousel-item v-for="(option, index) in chartOptions" :key="index">
        <div :ref="`chartContainer${index}`" class="chart" :style="{ width: '100%', height: '100%' }"></div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const chart1 = ref(null);
const props = defineProps(['eqData']);
const chartOptions = ref([]);
const chartInstances = ref([]);

const calculateMagnitudeData = (data, years) => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years;
    const magnitudeCounts = {
      '<3': Array(years).fill(0),
      '3-4.5': Array(years).fill(0),
      '4.5-6': Array(years).fill(0),
      '≥6': Array(years).fill(0),
    };

    data.forEach(item => {
      const year = new Date(item.occurrenceTime).getFullYear();
      const yearIndex = currentYear - year;

      const mag = parseFloat(item.magnitude); // 转为数字

      if (!isNaN(mag) && year >= startYear && yearIndex >= 0 && yearIndex <= years) {
        if (mag < 3) {
          magnitudeCounts['<3'][yearIndex]++;
        } else if (mag < 4.5) {
          magnitudeCounts['3-4.5'][yearIndex]++;
        } else if (mag < 6) {
          magnitudeCounts['4.5-6'][yearIndex]++;
        } else if (mag>=6){
          magnitudeCounts['≥6'][yearIndex]++;
        }
      }
    });
  console.log("谁干的好事")
  console.log(magnitudeCounts)
  return magnitudeCounts;
};

const initChart = async () => {
  const currentYear = new Date().getFullYear();
  const threeYearMagnitudes = calculateMagnitudeData(props.eqData, 3);
  const tenYearMagnitudes = calculateMagnitudeData(props.eqData, 10);

  // 以下是流光折线图的一些配置的
  var data1 = tenYearMagnitudes['<3'];
  var data2 = tenYearMagnitudes['3-4.5'];
  var data3 = tenYearMagnitudes['4.5-6'];
  var data4 = tenYearMagnitudes['≥6'];

  var json = {
    chart0: {
      xcategory: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
      low: data1,
      lowLine: [],
    }
  };
  var json2 = {
    chart0: {
      xcategory: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
      low: data2,
      lowLine: [],
    }
  };
  var json3 = {
    chart0: {
      xcategory: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
      low: data3,
      lowLine: [],
    }
  };
  var json4 = {
    chart0: {
      xcategory: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()),
      low: data4,
      lowLine: [],
    }
  };

  var zrUtil = echarts.util;
  zrUtil.each(json.chart0.xcategory, function(item, index) {
    json.chart0.lowLine.push([{
      coord: [index, json.chart0.low[index]]
    }, {
      coord: [index + 1, json.chart0.low[index + 1]]
    }]);
  });
  zrUtil.each(json.chart0.xcategory, function(item, index) {
    json2.chart0.lowLine.push([{
      coord: [index, json2.chart0.low[index]]
    }, {
      coord: [index + 1, json2.chart0.low[index + 1]]
    }]);
  });
  zrUtil.each(json.chart0.xcategory, function(item, index) {
    json3.chart0.lowLine.push([{
      coord: [index, json3.chart0.low[index]]
    }, {
      coord: [index + 1, json3.chart0.low[index + 1]]
    }]);
  });
  zrUtil.each(json.chart0.xcategory, function(item, index) {
    json4.chart0.lowLine.push([{
      coord: [index, json4.chart0.low[index]]
    }, {
      coord: [index + 1, json4.chart0.low[index + 1]]
    }]);
  });
  // ----------------------------------------------------------------------------------------------

  // 这是柱状图的一些配置
  let arr = [];
  let list = [];
  let series = [];
  let legend = [];
  let fontSize = 16;
  let barWidth = 12;
  let barGap = 60;
  let maxList = [];
  let volumeDetailData= [
    {
      name: "<3",
      data: threeYearMagnitudes['<3'],
    },
    {
      name: "3-4.5",
      data: threeYearMagnitudes['3-4.5'],
    },
    {
      name: "4.5-6",
      data: threeYearMagnitudes['4.5-6'],
    },
    {
      name: "≥6",
      data: threeYearMagnitudes['≥6'],
    },
  ]
  let max = 0; //背景最大值取y轴刻度线（最后注释部分）
  let colorStartList = ["transparent", "transparent"];
  let colorLeftList = ["#000", "#000", "#000","#000"];
  let colorTopList = ["#ffcb00", "#15faff", "#FFA07A","#FF6A4D"];
  let colorEndList = ["#ffcb00", "#15faff", "#FFA07A","#FF6A4D"];
  let chartObj = {
    series:volumeDetailData,
    chartList: Array.from({ length: 3 }, (_, i) => (currentYear - i).toString()).reverse(),
  };
  let allData = [];
  chartObj.series.forEach(item => {
    allData = allData.concat(item.data); // 合并所有数据点
  });

  max = Math.max(...allData);
  function colorRgba(str, alpha) {
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = str.toLowerCase();
    if (sColor == "transparent") {
      return "transparent";
    }
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor
              .slice(i, i + 1)
              .concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      var sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      return "rgba(" + sColorChange.join(",") + "," + alpha + ")";
    } else {
      return sColor;
    }
  }
  if (chartObj.series && chartObj.series.length) {
    chartObj.series.forEach((ele, i) => {
      arr = arr.concat(ele.data);
    });
    maxList = chartObj.series[0].data.map(() => {
      return max;
    });
    list = chartObj.series[0].data.map((item, index) => {
      return 1;
    });
    chartObj.series.forEach((item, index) => {
      legend.push({
        name: item.name,
        bottom: "-1%",
        itemStyle: {
          color: colorEndList[index % colorEndList.length],
        },
      });
      //背景顶部切片
      series.push({
        data: maxList,
        type: "pictorialBar",
        barMaxWidth: 12,
        itemStyle: {
          color: colorEndList[index],
          opacity: 0.1,
        },
        tooltip: {
          show: false,
        },
        symbolPosition: "end",
        symbol: "diamond",
        symbolOffset: [
          (-0.5 * (chartObj.series.length - 1) +
              index +
              -0.5 * barGap * 0.01 * (chartObj.series.length - 1) +
              barGap * 0.01 * index) *
          barWidth,
          "-50%",
        ],
        symbolSize: [barWidth, barWidth * 0.4],
        zlevel: -1,
      });
      //底部切片
      series.push({
        data: list,
        color: colorStartList[index % colorStartList.length],
        type: "pictorialBar",
        tooltip: {
          show: false,
        },
        barMaxWidth: 12,
        symbol: "diamond",
        symbolOffset: [
          (-0.5 * (chartObj.series.length - 1) +
              index +
              -0.5 * barGap * 0.01 * (chartObj.series.length - 1) +
              barGap * 0.01 * index) *
          barWidth,
          "50%",
        ],
        symbolSize: [barWidth, barWidth * 0.5],
      });

      //实际数据顶部切片
      series.push({
        data: item.data,
        type: "pictorialBar",
        tooltip: {
          show: false,
        },
        barMaxWidth: 12,
        color: colorTopList[index],
        symbolPosition: "end",
        symbol: "diamond",
        symbolOffset: [
          (-0.5 * (chartObj.series.length - 1) +
              index +
              -0.5 * barGap * 0.01 * (chartObj.series.length - 1) +
              barGap * 0.01 * index) *
          barWidth,
          "-50%",
        ],
        symbolSize: [barWidth, barWidth * 0.4],
        zlevel: 2,
      });
      //实际数据侧边切片
      series.push({
        data: item.data,
        type: "pictorialBar",
        tooltip: {
          show: false,
        },
        barMaxWidth: 12,
        color: {
          x: 0,
          y: 1,
          x2: 0,
          y2: 0,
          type: "linear",
          global: false,
          colorStops: [
            {
              offset: 0,
              color: "transparent",
            },
            {
              offset: 0.2,
              color: colorRgba(
                  colorLeftList[index % colorLeftList.length],
                  0.2
              ),
            },
            {
              offset: 1,
              color: colorRgba(
                  colorLeftList[index % colorLeftList.length],
                  0.3
              ),
            },
          ],
        },
        symbolPosition: "end",
        symbol: "rect",
        symbolSize: [barWidth / 2, "100%"],
        symbolOffset: [
          (-0.5 * (chartObj.series.length - 1) +
              index +
              -0.5 * barGap * 0.01 * (chartObj.series.length - 1) +
              barGap * 0.01 * index -
              0.25) *
          barWidth,
          0,
        ],
        zlevel: 1,
      });
      //柱子
      series.push({
        data: item.data,
        type: "bar",
        name: item.name,
        barGap: barGap + "%",
        barWidth: barWidth,
        barMaxWidth: 12,
        label: {
          show: false,
          position: "top",
          distance: fontSize * 0.3,
          textStyle: {
            color: colorEndList[index % colorEndList.length],
            fontSize: fontSize,
          },
          // formatter: function (a, b) {
          //     return a.value==0?'':a.value;
          // },
        },
        showBackground: false,
        backgroundStyle: {
          color: {
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            type: "linear",
            global: false,
            colorStops: [
              {
                offset: 0,
                color: colorStartList[index % colorStartList.length],
              },
              {
                offset: 0.2,
                color: colorRgba(
                    colorEndList[index % colorEndList.length],
                    0.2
                ),
              },
              {
                offset: 1,
                color: colorRgba(
                    colorEndList[index % colorEndList.length],
                    1
                ),
              },
            ],
          },
          opacity: 0.1,
        },
        itemStyle: {
          color: {
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            type: "linear",
            global: false,
            colorStops: [
              {
                offset: 0,
                color: colorStartList[index % colorStartList.length],
              },
              {
                offset: 0.2,
                color: colorRgba(
                    colorEndList[index % colorEndList.length],
                    0.2
                ),
              },
              {
                offset: 1,
                color: colorRgba(
                    colorEndList[index % colorEndList.length],
                    1
                ),
              },
            ],
          },
        },
      });
    });
  }

  // --------------------------------------------------------------------------------------------------

  chartOptions.value = [
    // 流光折现图
    {
      title: {
        text: '四川省近十年历史地震震级',
        left: '5%',
        textStyle: {
          color: '#15faff',
          fontSize: 16,
          fontWeight: 'bold',
          textShadow: '2px 2px 10px rgba(0, 255, 255, 0.5)',
        },
      },
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
        formatter: function(params) {
          var result = params[0].name + '年<br>';
          params.forEach(function(item) {
            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>';
            // 直接展示数据，并添加单位（次）
            result += item.seriesName + ": " + item.data + " 次<br>";
          });
          return result;
        }
      },
      legend: {
        data: ['<3', '3-4.5', '4.5-6', '≥6'],
        textStyle: {
          fontSize: 10,
          color: 'rgb(0,253,255,0.6)'
        },
        top: '7%',
        right: '0%'
      },
      grid: {
        bottom: 65,
        left: 60,
        right: 25,
      },
      xAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: '#15faff',
          },
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true
        },
        data: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()).reverse(),
      },
      yAxis: {
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#4b4d64'
          }
        },
        axisLabel: {
          formatter: '{value} ',
          textStyle: { //改变刻度字体样式
            color: '#ffffff'
          }
        },
      },
      series: [
        {
        name: '<3',
        type: 'line',
        // smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(255, 204,1, .9)'
            }, {
              offset: 0.8,
              color: 'rgba(6, 8, 41,.1)'
            }], false),
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 10
          }
        },
        itemStyle: {
          normal: {
            color: '#ffcb00'
          }
        },
        data: data1
      },
        {
          name: '<3',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          smooth: true,
          symbol: 'circle',
          effect: {
            show: true,
            smooth: true,
            period: 2,
            symbolSize: 8
          },
          lineStyle: {
            normal: {
              color: '#ffcb00',
              width: 0,
              opacity: 0,
              curveness: 0,
            }
          },
          data: json.chart0.lowLine
        },
        {
          name: '3-4.5',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(21, 250, 255,.9)'
              }, {
                offset: 0.8,
                color: 'rgba(6, 8, 41,.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: '#15faff'
            }
          },
          data: data2
        },
        {
          name: '3-4.5',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          smooth: true,
          symbol: 'circle',
          effect: {
            show: true,
            smooth: true,
            period: 2,
            symbolSize: 8
          },
          lineStyle: {
            normal: {
              color: '#15faff',
              width: 0,
              opacity: 0,
              curveness: 0,
            }
          },
          data: json2.chart0.lowLine
        },
        {
          name: '4.5-6',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgb(255, 160, 122)'
              }, {
                offset: 0.8,
                color: 'rgba(6, 8, 41,.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: '#FFA07A'
            }
          },
          data: data3
        },
        {
          name: '4.5-6',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          smooth: true,
          symbol: 'circle',
          effect: {
            show: true,
            smooth: true,
            period: 2,
            symbolSize: 8
          },
          lineStyle: {
            normal: {
              color: '#FFA07A',
              width: 0,
              opacity: 0,
              curveness: 0,
            }
          },
          data: json3.chart0.lowLine
        },
        {
          name: '≥6',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(255, 99, 71)'
              }, {
                offset: 0.8,
                color: 'rgba(6, 8, 41,.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: '#FF6A4D'
            }
          },
          data: data4
        },
        {
          name: '≥6',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          smooth: true,
          symbol: 'circle',
          effect: {
            show: true,
            smooth: true,
            period: 2,
            symbolSize: 8
          },
          lineStyle: {
            normal: {
              color: '#FF6A4D',
              width: 0,
              opacity: 0,
              curveness: 0,
            }
          },
          data: json4.chart0.lowLine
        },
      ]
    },
    // 3d柱图
    {
      title:{
        text: '四川省近三年历史地震震级',
        left: '5%',
        textStyle: {
          color: '#15faff',
          fontSize: 16,
          fontWeight: 'bold',
          textShadow: '2px 2px 10px rgba(0, 255, 255, 0.5)',
        },
      },
      grid: {
        // top: 100,
        left: 30,
        right: 25,
        bottom: 40,
        containLabel: true,
      },
      legend: {
        selectedMode: false,
        icon: "rect",
        itemWidth: 15,
        itemHeight: 13,
        right: '0%',
        top: '7%',
        itemGap: 20,
        textStyle: {
          color: "#BCE6FF",
          fontSize: 10
        },
      },
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
        formatter: function(params) {
          var result = params[0].name + '年<br>';
          params.forEach(function(item,index) {
            // 使用item.color来显示图例的颜色
            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + colorEndList[index] + '"></span>';
            // 显示图例名称和对应的值
            result += item.seriesName + ": " + item.data + " 次<br>";
          });
          return result;
        }
      },
      xAxis: {
        data: chartObj.chartList,
        type: "category",
        axisLine: {
          show: true,
          lineStyle: {
            color: "rgba(118, 169, 250, .8)",
          },
        },
        axisLabel: {
          show: true,
          fontSize: fontSize,
          color: "#15faff",
          interval: 0, //使x轴文字显示全
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        interval: 0,
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "rgba(118, 169, 250, .5)",
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: "#C5E5F9",
            fontSize: 12,
            margin: 5,
          },
        },
      ],
      series: series,
    },
    // 流光折现图
    {
      title: {
        text: '四川省近十年历史地震震级',
        left: '5%',
        textStyle: {
          color: '#15faff',
          fontSize: 16,
          fontWeight: 'bold',
          textShadow: '2px 2px 10px rgba(0, 255, 255, 0.5)',
        },
      },
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
        formatter: function(params) {
          var result = params[0].name + '年<br>';
          params.forEach(function(item) {
            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + item.color + '"></span>';
            // 直接展示数据，并添加单位（次）
            result += item.seriesName + ": " + item.data + " 次<br>";
          });
          return result;
        }
      },
      legend: {
        data: ['<3', '3-4.5', '4.5-6', '≥6'],
        textStyle: {
          fontSize: 10,
          color: 'rgb(0,253,255,0.6)'
        },
        top: '7%',
        right: '0%'
      },
      grid: {
        bottom: 65,
        left: 60,
        right: 25,
      },
      xAxis: {
        axisLine: {
          show: true,
          lineStyle: {
            color: '#15faff',
          },
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true
        },
        data: Array.from({ length: 10 }, (_, i) => (currentYear - i).toString()).reverse(),
      },
      yAxis: {
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#4b4d64'
          }
        },
        axisLabel: {
          formatter: '{value} ',
          textStyle: { //改变刻度字体样式
            color: '#ffffff'
          }
        },
      },
      series: [
        {
          name: '<3',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(255, 204,1, .9)'
              }, {
                offset: 0.8,
                color: 'rgba(6, 8, 41,.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: '#ffcb00'
            }
          },
          data: data1
        },
        {
          name: '<3',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          smooth: true,
          symbol: 'circle',
          effect: {
            show: true,
            smooth: true,
            period: 2,
            symbolSize: 8
          },
          lineStyle: {
            normal: {
              color: '#ffcb00',
              width: 0,
              opacity: 0,
              curveness: 0,
            }
          },
          data: json.chart0.lowLine
        },
        {
          name: '3-4.5',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(21, 250, 255,.9)'
              }, {
                offset: 0.8,
                color: 'rgba(6, 8, 41,.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: '#15faff'
            }
          },
          data: data2
        },
        {
          name: '3-4.5',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          smooth: true,
          symbol: 'circle',
          effect: {
            show: true,
            smooth: true,
            period: 2,
            symbolSize: 8
          },
          lineStyle: {
            normal: {
              color: '#15faff',
              width: 0,
              opacity: 0,
              curveness: 0,
            }
          },
          data: json2.chart0.lowLine
        },
        {
          name: '4.5-6',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgb(255, 160, 122)'
              }, {
                offset: 0.8,
                color: 'rgba(6, 8, 41,.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: '#FFA07A'
            }
          },
          data: data3
        },
        {
          name: '4.5-6',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          smooth: true,
          symbol: 'circle',
          effect: {
            show: true,
            smooth: true,
            period: 2,
            symbolSize: 8
          },
          lineStyle: {
            normal: {
              color: '#FFA07A',
              width: 0,
              opacity: 0,
              curveness: 0,
            }
          },
          data: json3.chart0.lowLine
        },
        {
          name: '≥6',
          type: 'line',
          // smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(255, 99, 71)'
              }, {
                offset: 0.8,
                color: 'rgba(6, 8, 41,.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowBlur: 10
            }
          },
          itemStyle: {
            normal: {
              color: '#FF6A4D'
            }
          },
          data: data4
        },
        {
          name: '≥6',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 1,
          smooth: true,
          symbol: 'circle',
          effect: {
            show: true,
            smooth: true,
            period: 2,
            symbolSize: 8
          },
          lineStyle: {
            normal: {
              color: '#FF6A4D',
              width: 0,
              opacity: 0,
              curveness: 0,
            }
          },
          data: json4.chart0.lowLine
        },
      ]
    },
    // 3d柱图
    {
      title:{
        text: '四川省近三年历史地震震级',
        left: '5%',
        textStyle: {
          color: '#15faff',
          fontSize: 16,
          fontWeight: 'bold',
          textShadow: '2px 2px 10px rgba(0, 255, 255, 0.5)',
        },
      },
      grid: {
        // top: 100,
        left: 30,
        right: 25,
        bottom: 40,
        containLabel: true,
      },
      legend: {
        selectedMode: false,
        icon: "rect",
        itemWidth: 15,
        itemHeight: 13,
        right: '0%',
        top: '7%',
        itemGap: 20,
        textStyle: {
          color: "#BCE6FF",
          fontSize: 10
        },
      },
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
        formatter: function(params) {
          var result = params[0].name + '年<br>';
          params.forEach(function(item,index) {
            // 使用item.color来显示图例的颜色
            result += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + colorEndList[index] + '"></span>';
            // 显示图例名称和对应的值
            result += item.seriesName + ": " + item.data + " 次<br>";
          });
          return result;
        }
      },
      xAxis: {
        data: chartObj.chartList,
        type: "category",
        axisLine: {
          show: true,
          lineStyle: {
            color: "rgba(118, 169, 250, .8)",
          },
        },
        axisLabel: {
          show: true,
          fontSize: fontSize,
          color: "#15faff",
          interval: 0, //使x轴文字显示全
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        interval: 0,
      },
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "rgba(118, 169, 250, .5)",
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: "#C5E5F9",
            fontSize: 12,
            margin: 5,
          },
        },
      ],
      series: series,
    },
  ];

  await nextTick();

  chartInstances.value.forEach(instance => instance?.dispose());
  chartInstances.value = [];

  const chartContainers = chart1.value.querySelectorAll('.chart');
  chartContainers.forEach(container => {
    container.innerHTML = '';
  });

  chartOptions.value.forEach((option, index) => {
    const chartContainer = chart1.value.querySelectorAll('.chart')[index];
    if (chartContainer) {
      const chartInstance = echarts.init(chartContainer);
      chartInstance.setOption(option);
      chartInstances.value[index] = chartInstance;
      console.log(`Initialized chart ${index + 1}:`, chartInstance);
    }
  });

  console.log('Current Chart Instances:', chartInstances.value.length);
};

onMounted(async () => {
  await initChart();
});

watch(() => props.eqData, async () => {
  await initChart();
}, { deep: true });
</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
}
</style>
