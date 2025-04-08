<template>
  <div class="map">
    <!--    工具-->
    <!--    <div class="tool_container">-->
    <!--      &lt;!&ndash;      <button @click="openTool('paintBrushTool')">画笔</button>&ndash;&gt;-->
    <!--      &lt;!&ndash;      <button @click="clearTool('paintBrushTool')">清除画笔</button>&ndash;&gt;-->
    <!--      &lt;!&ndash;      <button class="_btn" type="button" @click="clearMap()">清空所有</button>&ndash;&gt;-->
    <!--      <button @click="setMapStyle('black')" class="theme">black</button>-->
    <!--      <button @click="setMapStyle('indigo')" class="theme">indigo</button>-->
    <!--      <button @click="resetMapStyle" class="theme">恢复默认</button>-->
    <!--    </div>-->
    <!--指南针-->
    <div class="compassContainer"></div>

    <!-- 指南针容器 -->
    <div class="compassContainer_1">
      <div class="compass-outer-ring" style="width: 85px; height:85px;">
        <svg class="cesium-svgPath-svg" width="80" height="80" viewBox="0 0 145 145">
          <path
            d="m 66.5625,0 0,15.15625 3.71875,0 0,-10.40625 5.5,10.40625 4.375,0 0,-15.15625 -3.71875,0 0,10.40625 L 70.9375,0 66.5625,0 z M 72.5,20.21875 c -28.867432,0 -52.28125,23.407738 -52.28125,52.28125 0,28.87351 23.413818,52.3125 52.28125,52.3125 28.86743,0 52.28125,-23.43899 52.28125,-52.3125 0,-28.873512 -23.41382,-52.28125 -52.28125,-52.28125 z m 0,1.75 c 13.842515,0 26.368948,5.558092 35.5,14.5625 l -11.03125,11 0.625,0.625 11.03125,-11 c 8.9199,9.108762 14.4375,21.579143 14.4375,35.34375 0,13.764606 -5.5176,26.22729 -14.4375,35.34375 l -11.03125,-11 -0.625,0.625 11.03125,11 c -9.130866,9.01087 -21.658601,14.59375 -35.5,14.59375 -13.801622,0 -26.321058,-5.53481 -35.4375,-14.5 l 11.125,-11.09375 c 6.277989,6.12179 14.857796,9.90625 24.3125,9.90625 19.241896,0 34.875,-15.629154 34.875,-34.875 0,-19.245847 -15.633104,-34.84375 -34.875,-34.84375 -9.454704,0 -18.034511,3.760884 -24.3125,9.875 L 37.0625,36.4375 C 46.179178,27.478444 58.696991,21.96875 72.5,21.96875 z m -0.875,0.84375 0,13.9375 1.75,0 0,-13.9375 -1.75,0 z M 36.46875,37.0625 47.5625,48.15625 C 41.429794,54.436565 37.65625,63.027539 37.65625,72.5 c 0,9.472461 3.773544,18.055746 9.90625,24.34375 L 36.46875,107.9375 c -8.96721,-9.1247 -14.5,-21.624886 -14.5,-35.4375 0,-13.812615 5.53279,-26.320526 14.5,-35.4375 z M 72.5,39.40625 c 18.297686,0 33.125,14.791695 33.125,33.09375 0,18.302054 -14.827314,33.125 -33.125,33.125 -18.297687,0 -33.09375,-14.822946 -33.09375,-33.125 0,-18.302056 14.796063,-33.09375 33.09375,-33.09375 z M 22.84375,71.625 l 0,1.75 13.96875,0 0,-1.75 -13.96875,0 z m 85.5625,0 0,1.75 14,0 0,-1.75 -14,0 z M 71.75,108.25 l 0,13.9375 1.71875,0 0,-13.9375 -1.71875,0 z"></path>
        </svg>
      </div>
    </div>

    <div class="map-container">
      <!--    地图-->
      <div @contextmenu.prevent id="emap" class="map_container">


      </div>

      <!-- 自制图例 -->
      <div class="legend">

        <div class="row">
          <!-- 左列（历史，黄色）-->
          <div class="column_left">
            <div
              class="line history"
              v-for="(item, itemIndex) in eqGroups[0].items"
              :key="'history-' + itemIndex"
            >
              {{ item.label }}<span
              :class="[item.type, {'inactive': !seriesVisibility['history-' + item.type]}]"
              @click="toggleSeriesVisibility('history', item.type)"
            ></span>
            </div>
          </div>

          <!-- 右列（最新，红色）-->
          <div class="column_right">
            <div
              class="line latest"
              v-for="(item, itemIndex) in eqGroups[1].items"
              :key="'latest-' + itemIndex"
            >

              {{ item.label }}<span
              :class="[item.type, {'inactive': !seriesVisibility['latest-' + item.type]}]"
              @click="toggleSeriesVisibility('latest', item.type)"
            ></span>
            </div>

          </div>
        </div>
      </div>


      <!-- Cesium 指南针容器 -->
      <div id="cesiumCompassContainer" class="cesium-compass-container"></div>

    </div>
    <!-- 信息窗组件 -->
    <InfoWindow
      v-if="showInfoWindow"
      :infoWindow="mapConfig.infoWindow"
      :data="mapConfig.infoWindowData"
      :style="{left: `${infoWindowPosition.x}px`, top: `${infoWindowPosition.y}px` }"
      @callback="infoWindowCallback"
    />
  </div>

</template>

<script>
import red from '@/assets/star2.gif';
import yellow from '@/assets/yellow3.png';
import {ref, onMounted, watch, onBeforeUnmount} from 'vue';
import InfoWindow from './emap/infowindow.vue'; //信息窗口 在后面


import sichuan from '@/assets/geoJson/data.json'; // 导入四川的 GeoJSON 数据
import yaan from '@/assets/geoJson/yaan1.json'

import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import {Edit, Delete} from '@element-plus/icons-vue'


// 图例分类
const eqGroups = ref([
  {
    type: 'history',
    items: [
      {type: 'moderate', label: '历史4.5 - 6级'},
      {type: 'major', label: '历史6级以上'}
    ]
  },
  {
    type: 'latest',
    items: [
      {type: 'slight', label: '最新4.5级以下'},
      {type: 'moderate', label: '最新4.5 - 6级'},
      {type: 'major', label: '最新6级以上'}
    ]
  }
]);

// 用于存储系列的可见性状态
const seriesVisibility = ref({
  'history-moderate': true,
  'history-major': true,
  'latest-slight': true,
  'latest-moderate': true,
  'latest-major': true
});

export default {
  components: {InfoWindow},
  props: ['eqData'],

  setup(props) {
    const showInfoWindow = ref(false);  //信息框
    // const props = defineProps(['eqData']);
    const latestEqData = ref([]);  //最新数据初始化
    const historyEqData = ref([]);  //历史数据初始化

    const infoWindowPosition = ref({x: 0, y: 0}); //信息窗的初始位置
    const weight = ref(210); // 默认weight值

    const countriesOverlay = ref(null); // 用于存储 overlay 实例

    const earthquakeMarkers = ref([]); // 存储地震点标记对象



    // 数据分组
    const dataGroups = ref({
      latestSlight: [],
      latestModerate: [],
      latestMajor: [],
      historyModerate: [],
      historyMajor: []
    });

    const mapConfig = ref({
      map: null, //地图容器
      infoWindow: null, //信息窗口
      infoWindowData: {}, //信息窗口数据
      showInfoWindow: false, //信息窗口显示
      paintBrushTool: null, // 画笔工具实例
      isDrawing: false, // 是否正在绘制中
    });

    onMounted(() => {
      if (window.d3) {
        console.log("D3 is loaded!", window.d3);
      } else {
        console.error("D3 is not loaded.");
      }

      if (window.T && window.T.D3Overlay) {
        console.log("T.D3Overlay is loaded!", window.T.D3Overlay);
        initMap();
      } else {
        console.error("T.D3Overlay is not defined. Make sure D3SvgOverlay.js is loaded.");
      }

    });

    watch(() => props.eqData, () => {
      console.log("11111111111",props.eqData)
      if (props.eqData.length > 0) {
        latestEqData.value = [props.eqData[0]]; // 只取最新的一个
        historyEqData.value = props.eqData.slice(1); // 剩下的为历史数据

        // console.log("你好：", props.eqData)

        // 处理数据分组
        processData();
        // initMap(); // 初始化地图
        addMarkers();//标点
      }
    }, { immediate: true, deep: true });

    const processData = () => {
      //处理最新地震数据，映射成适合 ECharts 使用的格式
      const latestData = latestEqData.value.map(item => ({
        position: item.earthquakeName,  //位置
        magnitude: parseFloat(item.magnitude),  //震级
        longitude: item.longitude || item.geom.coordinates[0],  //经度
        latitude: item.latitude || item.geom.coordinates[1],  //纬度
        // 数据库表中time字段院数据为2015-01-03 08:16:20，
        // 但渲染在前端会出现个'T'，
        // 也就变成了2015-01-03T08:16:20，
        // 故以此将其删去
        time: item.occurrenceTime.replace("T", " "),  //时间
        depth: item.depth,  //深度
        eqType: item.eqType,  //地震类型
      }));

      //将历史地震数据 historyEqData 转换为合适的格式。
      const historyData = historyEqData.value.map(item => ({
        position: item.earthquakeName,
        magnitude: parseFloat(item.magnitude),
        longitude: item.longitude || item.geom.coordinates[0],
        latitude: item.latitude || item.geom.coordinates[1],
        time: item.occurrenceTime.replace("T", " "),
        depth: item.depth,
        eqType: item.eqType,  //地震类型
      }));
      // 根据震级分类
      dataGroups.value.latestSlight = latestData.filter(item => item.magnitude < 4.5);
      dataGroups.value.latestModerate = latestData.filter(item => item.magnitude >= 4.5 && item.magnitude < 6);
      dataGroups.value.latestMajor = latestData.filter(item => item.magnitude >= 6);
      dataGroups.value.historyModerate = historyData.filter(item => item.magnitude >= 4.5 && item.magnitude < 6);
      dataGroups.value.historyMajor = historyData.filter(item => item.magnitude >= 6);



    };


    // 初始化地图
    // 将地图挂载到 emap 容器中，并通过 centerAndZoom 设置中心点和缩放级别。
    const initMap = () => {
      processData();
      // 通过 T.Map 创建一个新的天地图实例，并将地图绑定到页面中 ID 为 'emap' 的 DOM 元素上。
      // mapConfig.value.map 是一个可变的 mapConfig 对象，里面存放了地图的实例。

      mapConfig.value.map = new T.Map('emap');
      // 设置地图的中心点和缩放级别。
      mapConfig.value.map.centerAndZoom(new T.LngLat(103.00, 30.00), 8);


      // 创建 D3Overlay 实例
      countriesOverlay.value = new T.D3Overlay(init, redraw);

      // 添加 overlay 到地图
      mapConfig.value.map.addOverLay(countriesOverlay.value);
      countriesOverlay.value.bringToBack();


      // // 添加地图类型控件
      // const mapTypeControl = new T.Control.MapType();
      // mapConfig.value.map.addControl(mapTypeControl);

      // 设置地图的初始主题为 indigo
      setMapStyle('indigo');

      // // **添加指南针控件**
      // const navigationControl = new T.Control.Navigation();
      // mapConfig.value.map.addControl(navigationControl);

      // 创建比例尺控件对象
      const scale = new T.Control.Scale();
      // 添加比例尺控件
      mapConfig.value.map.addControl(scale);
      // 确认比例尺控件是否添加成功
      // console.log('Scale control added:', scale);


      // // 初始化画笔工具
      // mapConfig.value.paintBrushTool = new T.PolylineTool(mapConfig.value.map, {
      //   color: 'red', // 线条颜色
      //   weight: 2,    // 线条宽度
      //   opacity: 0.8, // 透明度
      //   keepdrawing: false,
      // });

      // addMarkers();//标点

//        // 初始化指南针
//       const cesiumViewer = new Cesium.Viewer('cesiumCompassContainer', {
//         animation: false,
//         timeline: false,
//         homeButton: false,
//         sceneModePicker: false,
//         navigationHelpButton: false,
//       });
//
// // 使用导航插件
//       CesiumNavigation(cesiumViewer, {
//         enableCompass: true,
//         enableZoomControls: true,
//         enableDistanceLegend: true,
//         enableCompassOuterRing: true,
//       });
//
//       // 设置透明背景以仅显示指南针
//       cesiumViewer.container.backgroundColor = 'transparent';
//       // cesiumViewer.scene.screenSpaceCameraController.enableInputs = false; // 禁用地图控制
//
//       compass.viewModel.headingChanged.addEventListener(function(heading) {
//         // 更新UI显示当前方向
//       });

      initMapAfter();//加载地图后方法
      // 添加鼠标悬停事件监听
      // mapConfig.value.map.addEventListener('mousemove', onMapMouseMove);
    };

    const initMapAfter = () => {
      // 初始化地图后的操作
    };

    // onBeforeUnmount(() => {
    //   // 清理逻辑
    //   if (countriesOverlay.value) {
    //     countriesOverlay.value.remove();
    //   }
    // });

    // ------------------------行政区划


    // 初始化函数
    function init(sel, transform) {
      const pathGenerator = d3.geo.path(transform.projection);  // 使用投影函数

      const upd = sel.selectAll('path.geojson').data(sichuan.features); // 使用四川的 GeoJSON 数据

      upd.enter()
        .append('path')
        .attr("class", "sichuan")
        .attr('d', pathGenerator) // 设置路径
        // .attr('stroke', 'rgba(143,79,14,0.99)') // 边界线颜色
        .attr('stroke', '#05CEE5') // 边界线颜色
        .attr('stroke-width', '1px') // 边界线宽度
        // .attr('fill', 'rgba(89,26,12,0.5)') // 或者使用其他颜色
        .attr('fill', 'rgba(5, 206, 229, 0.3)') // 或者使用其他颜色
        // .attr('fill', (d, i) => d3.hsl(Math.random() * 360, 0.9, 0.5)) // 区域填充颜色,d3.hsl(Math.random() * 360, 0.9, 0.5)。这将会给每个区域随机生成一个颜色，
        .attr('fill-opacity', 0.3); // 区域填充透明度

      // 添加区域名称
      const textUpd = sel.selectAll('text.region-label').data(sichuan.features);

      // sichuan.features.forEach(feature => {
      //   console.log('Feature Name------------------------------:', feature.properties.name);
      // });


      textUpd.enter()
        .append('text')
        .attr('class', 'region-label')
        .attr('x', d => pathGenerator.centroid(d)[0])  // 获取中心位置的 x 坐标
        .attr('y', d => pathGenerator.centroid(d)[1])  // 获取中心位置的 y 坐标
        .attr('dy', '.35em')  // 使文本在 y 方向居中
        .attr('font-size', '13px')  // 文本大小
        .attr('fill', '#54aade')  // 文本颜色
        .attr('text-anchor', 'middle')  // 文本水平居中
        .text(d => d.properties.name);  // 显示区域名称


      // 绘制雅安的行政区划
      const yaanUpd = sel.selectAll('path.yaan').data(yaan.features);
      yaanUpd.enter()
        .append('path')
        .attr("class", "yaan")  // 设置类名
        .attr('d', pathGenerator) // 设置路径
        // .attr('stroke', '#05CEE5') // 边界线颜色
        .attr('stroke', 'rgba(255,173,84,0.99)') // 边界线颜色
        .attr('stroke-width', '2px')
        // .attr('fill', 'rgba(5, 206, 229, 0.3)') // 或者使用其他颜色
        .attr('fill', 'rgba(89,26,12,0.5)') // 或者使用其他颜色
        .attr('fill-opacity', 0.3);  //透明度

      // 添加雅安区域名称
      const yaanTextUpd = sel.selectAll('text.yaan-label').data(yaan.features);
      yaanTextUpd.enter()
        .append('text')
        .attr('class', 'yaan-label')
        .attr('x', d => pathGenerator.centroid(d)[0])
        .attr('y', d => pathGenerator.centroid(d)[1])
        .attr('dy', '.35em')
        .attr('font-size', '13px')
        .attr('fill', '#cef1f6')  // 雅安区域名称颜色
        .attr('text-anchor', 'middle')
        .text(d => d.properties.name); // 显示区域名称

      // 更新文本位置
      updateTextPositions(sel, transform);


    }

    function updateTextPositions(sel, transform) {
      sel.selectAll('text.region-label')
        .attr('x', d => transform.pathFromGeojson.centroid(d)[0])
        .attr('y', d => transform.pathFromGeojson.centroid(d)[1]);

      sel.selectAll('text.yaan-label')
        .attr('x', d => transform.pathFromGeojson.centroid(d)[0])
        .attr('y', d => transform.pathFromGeojson.centroid(d)[1]);
    }

    // 重绘函数
    function redraw(sel, transform) {
      // 更新四川路径
      sel.selectAll('path.sichuan').each(function (d) {
        // console.log("Selected path:", this); // 检查当前选择的路径
        d3.select(this).attr('d', transform.pathFromGeojson(d)); // 使用 transform 更新路径
      });

      // 更新文本位置
      updateTextPositions(sel, transform);

      // 更新雅安路径
      sel.selectAll('path.yaan').each(function (d) {
        // console.log("Selected yaan path:", this); // 检查当前选择的雅安路径
        d3.select(this).attr('d', transform.pathFromGeojson(d)); // 使用 transform 更新路径
      });
    }


    //---------------------------------------------------------------------------------------


    // // 启动画笔工具
    // const openTool = (toolName) => {
    //   if (toolName === 'paintBrushTool' && mapConfig.value.paintBrushTool) {
    //     mapConfig.value.isDrawing = true;
    //     mapConfig.value.paintBrushTool.open();
    //
    //     // 监听鼠标事件
    //     mapConfig.value.map.addEventListener('mousedown', stopEvent);
    //     mapConfig.value.map.addEventListener('mouseup', handleMouseUp);
    //   }
    // };
    //
    // // 停止事件传播
    // const stopEvent = (event) => {
    //   event.stopPropagation();
    // };
    //
    //
    // // 鼠标松开时的处理
    // const handleMouseUp = () => {
    //   mapConfig.value.isDrawing = false; // 关闭绘制状态
    //   mapConfig.value.map.removeEventListener('mousedown', stopEvent);
    //   mapConfig.value.map.removeEventListener('mouseup', handleMouseUp);
    // };
    //
    // // 清除画笔工具绘制的内容
    // const clearTool = (toolName) => {
    //   if (toolName === 'paintBrushTool' && mapConfig.value.paintBrushTool) {
    //     mapConfig.value.paintBrushTool.clear(); // 清除已绘制的线条
    //     mapConfig.value.isDrawing = false;
    //
    //     // 移除鼠标事件监听
    //     mapConfig.value.map.removeEventListener('mousedown', stopEvent);
    //     mapConfig.value.map.removeEventListener('mouseup', handleMouseUp);
    //   }
    // };

    // 标准图层--black/indigo
    const setMapStyle = (style) => {
      if (mapConfig.value.map) {
        mapConfig.value.map.setStyle(style);
      } else {
        console.error("Map instance not initialized.");
      }
    };

    // 标准图层--恢复默认
    const resetMapStyle = () => {
      if (mapConfig.value.map) {
        mapConfig.value.map.removeStyle();
      } else {
        console.error("Map instance not initialized.");
      }
    };

// ----------------------------添加地震点------------------------------------------------
    // 添加标记
    const addMarkers = () => {
      // 清除当前所有标记
      // clearMarkers();

      clearEarthquakeMarkers(); // 先清除之前的地震点

      // 先添加历史地震标记（黄色）
      Object.keys(seriesVisibility.value).forEach(key => {
        if (key.startsWith('history') && seriesVisibility.value[key]) {
          const [group, type] = key.split('-');
          console.log(dataGroups.value)
          dataGroups.value[`${group}${capitalize(type)}`].forEach(item => {
            addMarker1(item.longitude, item.latitude, 'yellow', getMarkerSize(type), item);
          });
        }
      });

      // 然后添加最新地震标记（红色）
      Object.keys(seriesVisibility.value).forEach(key => {
        if (key.startsWith('latest') && seriesVisibility.value[key]) {
          const [group, type] = key.split('-');
          dataGroups.value[`${group}${capitalize(type)}`].forEach(item => {
            addMarker1(item.longitude, item.latitude, 'red', getMarkerSize(type), item);
          });
        }
      });
    };

    const clearMarkers = () => {
      mapConfig.value.map.clearOverLays() // 清除所有覆盖物
      // 这里应该实现清除当前所有标记的逻辑
      // 例如，使用 mapConfig.value.map.removeMarker(marker) 来移除标记
    };

    const clearEarthquakeMarkers = () => {
      earthquakeMarkers.value.forEach(marker => {
        mapConfig.value.map.removeOverLay(marker); // 从地图中移除标记
      });
      earthquakeMarkers.value = []; // 清空数组
    };



    // 点击图例中的点 在地图上点的展示消失效果
// ECharts中图例(legend)不支持分别定义图形大小，
// 故通过该函数与自制的图例div配合实现legend自带的筛选效果

    const toggleSeriesVisibility = (groupType, itemType) => {
      // const key = `${groupType}-${itemType}`;
      // seriesVisibility.value[key] = !seriesVisibility.value[key]; // 切换可见性
      // addMarkers(); // 根据新的可见性状态更新标记
    };
    const getMarkerSize = type => (type === 'slight' ? 'small' : type === 'moderate' ? 'medium' : 'large');
    const capitalize = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };


    const addMarker1 = (lng, lat, color, size, item) => {
      let iconUrl;
      let iconSize;
      let zIndexOffset;

      // 根据类型和大小选择图标样式
      if (color === 'red') {
        iconUrl = red;
        zIndexOffset = 99;
        switch (size) {
          case 'small':
            iconSize = new T.Point(26, 26);
            break;
          case 'medium':
            iconSize = new T.Point(36, 36);
            break;
          case 'large':
            iconSize = new T.Point(46, 46);
            break;
          default:
            iconSize = new T.Point(36, 36);
        }
      } else {
        iconUrl = yellow;
        zIndexOffset = 0;
        switch (size) {
          case 'small':
            iconSize = new T.Point(10, 10);
            break;
          case 'medium':
            iconSize = new T.Point(20, 20);
            break;
          case 'large':
            iconSize = new T.Point(30, 30);
            break;
          default:
            iconSize = new T.Point(20, 20);
        }
      }


      // 自定义标记点图标
      const markerObj = {
        icon: new T.Icon({
          iconUrl: iconUrl,
          iconSize: iconSize,
          iconAnchor: new T.Point(iconSize.x / 2, iconSize.y), // 图标中心对准位置
          opacity: 0.1, // 设置透明度

        }),
        zIndexOffset: zIndexOffset
      };

      // 创建标记并添加到地图
      const marker = new T.Marker(returnLnglat([lng, lat]), markerObj);


      // 添加点击事件处理器
      addClickHandler(marker, {lng, lat});

// 添加悬停事件
      marker.addEventListener('mouseover', (e) => {
        // console.log(e.originalEvent.relatedTarget.offsetHeight, e.originalEvent.relatedTarget.offsetWidth)
        // console.log(e)
        showInfoWindow.value = true;
        mapConfig.value.infoWindowData = item;
        // console.log("weight.value*********", weight.value)

        infoWindowPosition.value.x = e.containerPoint.x - 130// 获取鼠标位置
        infoWindowPosition.value.y = e.containerPoint.y - 190 // 获取鼠标位置
        // console.log("item-----------------", item)
        // 创建信息窗口对象
        mapConfig.value.infoWindow = new T.InfoWindow(
          document.querySelector('#infoWindow'),
          {offset: new T.Point(0, -20), closeButton: false}
        );
        // setTimeout(() => {
        //   mapConfig.value.map.openInfoWindow(mapConfig.value.infoWindow);  //打开信息窗口
        // }, 0);

      });


// // 添加鼠标移开事件，关闭信息窗
      marker.addEventListener('mouseout', () => {
        mapConfig.value.map.closeInfoWindow();
        showInfoWindow.value = false;
        // infoWindowPosition.value.x = 0//-  weight.value; // 获取鼠标位置
        // infoWindowPosition.value.y = -550//- 330; // 获取鼠标位置
      });

      // **存储标记对象**
      earthquakeMarkers.value.push(marker);

      // 添加到地图
      mapConfig.value.map.addOverLay(marker);


    };


    // 添加点击事件返回，将中心点变为点击点
    const addClickHandler = (marker, params) => {
      marker.addEventListener('click', (e) => {
        mapConfig.value.map.setZoom(12); // 设置缩放级别
        mapConfig.value.map.panTo(returnLnglat(e.lnglat)); //将地图的中心点变换到指定的地理坐标


      });
    };


    // 信息窗口点击回调
    const infoWindowCallback = (data) => {
      console.log('信息窗口点击回调', data);
      closeInfoWindow();// 关闭信息弹窗
    };

    // 关闭信息弹窗
    const closeInfoWindow = () => {
      if (mapConfig.value.infoWindow) {
        mapConfig.value.infoWindow.closeInfoWindow();
      }
    };


    // 清除地图
    const clearMap = (type) => {
      switch (type) {
        case 'marker':
          if (mapConfig.value.marker) {
            mapConfig.value.map.removeOverLay(mapConfig.value.marker) // 移除覆盖物到地图上
            mapConfig.value.marker = null
          }
          break
        default:
          mapConfig.value.map.clearOverLays() // 清除所有覆盖物


          // 清除信息窗口
          if (mapConfig.value.infoWindow) {
            mapConfig.value.infoWindow.closeInfoWindow()
          }
          break
      }
    };

    // 自适应标记覆盖物到合适范围
    const reset = (drawType) => {
      let mapData = '';
      switch (drawType) {
        case 'marker':
          mapData = [mapConfig.value.marker.getLngLat()];
          break;
        case 'markerCluster':
          // 获取所有标记点的经度和纬度坐标
          let allLng = 0;
          let allLat = 0;
          const tempMarkerClusterArr = mapConfig.value.map.getOverlays();
          tempMarkerClusterArr.forEach((element) => {
            allLng += element.or.lng;
            allLat += element.or.lat;
          });

          // 计算中心点的经纬度坐标
          const centerLng = allLng / tempMarkerClusterArr.length;
          const centerLat = allLat / tempMarkerClusterArr.length;

          // 模拟计算有误差，固定写某个经纬度和层级
          mapConfig.value.map.centerAndZoom(returnLnglat([centerLng, centerLat]), 7);
          break;
        default:
          break;
      }

      mapConfig.value.map.setViewport(mapData); // 适应范围
    };

    // 返回天地图经纬度对象
    const returnLnglat = (data) => {
      let x, y = null;
      switch (typeof data) {
        case 'string':
          const lnglat = data.split(',');
          x = lnglat[0];
          y = lnglat[1];
          break;
        case 'object':
          if (data && data.lng) {
            x = data.lng;
            y = data.lat;
          } else {
            x = data[0];
            y = data[1];
          }
          break;
        default:
          break;
      }
      return new T.LngLat(x, y);
    };


    return {

      mapConfig,
      showInfoWindow,  //信息窗
      // openTool,  //画笔
      // clearTool,  //清除画笔
      setMapStyle,
      reset,
      returnLnglat,
      resetMapStyle,
      clearMap,
      infoWindowCallback,
      eqGroups,
      seriesVisibility,
      toggleSeriesVisibility,
      infoWindowPosition,
      countriesOverlay,//行政
      clearEarthquakeMarkers,//清除标绘点
    };
  },
};
</script>
<style lang="scss" scoped>
//cesium指南针
.map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center; /* 可选，用于居中地图和图例 */
  border-radius: 31px !important; /* 添加圆角 */
}

.cesium-compass-container {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 150px;
  height: 150px;
  pointer-events: none; /* 防止遮挡天地图的交互 */
}


/* 自定义 比例尺 */

:deep(.tdt-bottom .tdt-control-scale ) {
  margin-bottom: 25px;
}

:deep(.tdt-left .tdt-control-scale ) {
  margin-left: 300px;
}


//公里及其对应的白线
:deep(.tdt-control-scale-line ) {
  border: 3px solid #f8f4f4;
  color: #faf8f8;
  border-top: none;
  line-height: 2.1;
  padding: 2px 5px 1px;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}


//英制单位（英里）及其对应的黑线
:deep(.tdt-control-scale-linebottom  ) {
  display: none; /* 隐藏该元素 */
}


////指南针外框
.compassContainer_1 {
  position: absolute;
  margin-right: 31%;
  top: 18px;
  right: 24px;
  z-index: 10;
  width: 130px !important;
  height: 130px !important;
  cursor: pointer;
}

.cesium-svgPath-svg {
  fill: #ece6e6; /* 你可以根据需求更改颜色 */
}


//指南针
.compassContainer {
  position: absolute;
  margin-right: 31%;
  top: 40.4px;
  right: 91.2px;
  height: 40px;
  width: 40px;
  background: url(../../assets/指北针_5.png) no-repeat 0 0 / cover;
  z-index: 20;
  //transform: rotate(45deg); /* 使图片旋转 45 度 */
}

//按钮
.theme {
  color: white;
  background-color: #222;
  font-weight: 500;
  border-radius: 0.5rem;
  font-size: 0.5rem;
  line-height: 2rem;
  cursor: pointer;
  text-align: center;
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
  border: none;
}

.theme:hover {
  background-color: #333;
}

.theme svg {
  display: inline;
  width: 1rem;
  height: 0.7rem;
  margin-right: 0.75rem;
  color: white;
}

.theme:focus svg {
  animation: spin_357 0.5s linear;
}

@keyframes spin_357 {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}


.breathing-marker {
  animation: breathe 1.5s infinite; /* 1.5秒循环动画 */
}


.legend {
  bottom: 0;
  //left: 36.4%;
  left: 34%;
  z-index: 35;
  /* margin-top: 5px; */
  background-color: transparent;
  /* width: 100%; */
  position: fixed;
  top: 93%;
}


///*!*改为左边红右边黄*!*/
//.row {
//  display: flex;
//  //justify-content: space-between; /* 左右分列 */
//  width: 20%;
//}

.row {
  //display: flex; /* 使用 flexbox 使所有元素在一行中显示 */
  display: inline-flex; /* 保持在一行内 */
  flex-wrap: wrap; /* 允许换行 */
  align-items: center; /* 垂直居中对齐 */
  //justify-content: space-between; /* 分散排列 */
  width: 100%; /* 宽度为100% */
}

.column_left {
  display: inline-flex; /* 保持在一行内 */
}

.column_right {
  display: inline-flex; /* 保持在一行内 */

}


.line {
  display: flex;
  align-items: center; /* 圆点与文本垂直居中对齐 */
  color: white;
  margin-top: 5px; /* 添加间距 */
  font-size: 14px;
  width: 120px;
}

.line span {
  //display: flex;
  display: inline-flex; /* 保持在一行内 */
  align-items: center; /* 圆点在其父容器中垂直居中 */
  /*display: inline-block; !* 确保点是块级元素 *!*/
  border-radius: 50%; /* 确保点是圆形 */
  margin-right: 10px;
}

.latest span {
  background-color: #ed2a2a; /* 红色 */
}

.history span {
  background-color: #f0a72e; /* 黄色 */
}

//
//.inactive {
//  background-color: #888 !important; /* 灰色 */
//}

.line span {
  display: inline-flex; /* 使用 inline-flex 使得文本与圆点在一行 */
  align-items: center; /* 垂直居中 */
}

.line .slight {
  width: 10px; /* 小点的宽度 */
  height: 10px; /* 小点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 7px;
  margin-right: 10px; /* 圆点和文本之间的间距 */
}

.line .moderate {
  width: 15px; /* 中等点的宽度 */
  height: 15px; /* 中等点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 5px;
  margin-right: 10px; /* 圆点和文本之间的间距 */
}

.major {
  width: 20px; /* 大点的宽度 */
  height: 20px; /* 大点的高度 */
  border-radius: 50%; /* 圆形 */
  margin-left: 5px;
  margin-right: 1px; /* 圆点和文本之间的间距 */
}


// 工具栏
.tool_container {
  padding: 20px;

  ._btn {
    border: none;
    border-radius: 3px;
    padding: 8px 12px;
    font-size: 12px;
    line-height: 1;
    background-color: #1890ff;
    color: #fff;

    &:not(:first-of-type) {
      margin-left: 15px;
    }
  }
}


.map_container {
  width: 100%;
  height: 100%;
  margin-top: 2px;
  z-index: 0;
  // 移除默认左下角logo文字  ———— ::v-deep不行的话用/deep/
  ::v-deep .tdt-control-copyright {
    display: none !important;
    opacity: 0 !important;
  }

  //  /deep/ .tdt-control-container {
  //    display: none !important;
  //  }

  // 自定义右键菜单
  ::v-deep #contextMenu {
    position: absolute;
    z-index: 4;
    background: #fff;
    border-radius: 2px;

    .menu-item {
      height: 35px;
      line-height: 35px;
      word-break: break-all;
      padding: 0 10px;
      font-size: 12px;
      min-width: 60px;
      text-align: center;
      white-space: nowrap;

      &:hover {
        background-color: #f3f3ee;
      }
    }
  }
}
</style>

