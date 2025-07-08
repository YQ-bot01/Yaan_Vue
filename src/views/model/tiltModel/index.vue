<template>
  <div>
    <div id="cesiumContainer" v-if="pageStatus">
      <el-form class="tool-container-1">
        <el-row>
          <div class="modelAdj" style="margin-top: 5px">模型调整</div>
          <el-button type="primary" @click="showSelectModel=!showSelectModel">
            <span v-if="showSelectModel">
              隐藏工具
            </span>
            <span v-if="!showSelectModel">
              显示工具
            </span>
          </el-button>
          <el-button type="primary" @click="findModel">找到模型</el-button>
          <el-button type="primary" @click="showArrowModel">{{ showArrowText }}</el-button>
          <!--        <el-button class="el-button--primary" @click="isTerrainLoaded">地形是否加载</el-button>-->
          <el-button type="primary" @click="hideModel">{{ modelStatusContent }}</el-button>
          <!--        <el-button type="primary" @click="openDialog('新增')">新增模型</el-button>-->
          <el-button type="primary" @click="updataPosition">更新位置</el-button>
        </el-row>
      </el-form>
      <el-form class="button-container" v-show="showSelectModel" style="display: flex; flex-direction: column;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <div class="modelAdj">模型选择</div>
          <el-input
              v-model="queryParams"
              placeholder="请输入搜索信息"
              clearable
              style="width: 200px; margin-right: 10px;"
              @keyup.enter="handleQuery"
          />
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </div>
        <el-table :data="tableData" style="width: 100%; margin-bottom: 5px" :header-cell-style="tableHeaderColor"
                  :cell-style="tableColor" @row-click="">
          <el-table-column prop="name" label="模型名称" width="180px" show-overflow-tooltip></el-table-column>
          <el-table-column prop="tz" label="模型中心高度(米)" width="140px"></el-table-column>
          <el-table-column prop="tze" label="模型中心高度(米)" width="140px"></el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button type="text" :icon="Edit" @click="changeModel(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div>
          <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total, prev, pager, next, jumper"
              :total="total">
          </el-pagination>
        </div>
      </el-form>
      <el-form class="tool-container" v-show="showSelectModel">
        <el-row>
          <!--        <br>-->
          <span style="color: white">调整高度</span>
          <el-slider
              v-model="tz"
              show-input
              :max="2000"
              :min="-2000"
              :step="10"
              @change="changeHeight(tz)"
          >
          </el-slider>
        </el-row>
        <el-row>
          <!--        <br>-->
          <span style="color: white">绕Z轴旋转模型</span>
          <el-slider
              v-model="rz"
              show-input
              :max="180"
              :min="-180"
              :step="1"
              @change="changeRotationZ(rz)"
          >
          </el-slider>
        </el-row>
        <el-row>
          <!--        <br>-->
          <span style="color: white">调整模型透明度</span>
          <el-slider
              v-model="opacity"
              show-input
              :max="100"
              :min="0"
              :step="1"
              @change="changeOpacity(opacity)"
          >
          </el-slider>
        </el-row>
        <el-row>
          <el-col :span="8">
            <span style="color: white">经度：<span id="longitudeShow"></span>°</span>
          </el-col>
          <el-col :span="8">
            <span style="color: white">纬度：<span id="latitudeShow"></span>°</span>
          </el-col>
          <el-col :span="8">
            <span style="color: white">视角高：<span id="altitudeShow"></span>km</span>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>

</template>

<script setup>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {getTerrainProviderViewModelsArr, initCesium} from '@/cesium/tool/initCesium.js'
import {Edit, Delete} from '@element-plus/icons-vue'

import {
  addModelApi,
  deleteModel,
  getAllModel,
  updataModel,
  updataModelNoElevation,
  updataModelElevation, querytiltModelData,
} from '@/api/system/model.js'
// import tiltTable from '@/components/Model/tiltModel/tiltTable.vue'
import {ElMessageBox} from 'element-plus';
import {ElMessage} from 'element-plus';
import {CustomShader} from "cesium";

import {
  goModel,
  findModel,
  showArrow,
  hide,
  // changeHeight,
  // changeRotationZ,
  // changeOpacity,
  isTerrainLoaded,
  transferModel,
  rotationModel
} from '@/cesium/model.js';
import layer from "@/cesium/layer.js";
import Point from "@/cesium/plot/Point.js";


let pageStatus = ref(true)
let tz = ref(0)
let rz = ref(0)
let originRz = 0
let originTz = 0
let opacity = ref(100)
let showArrowValue = false
let showArrowText = ref("显示坐标轴")
let modelStatus = true
let modelStatusContent = ref("隐藏当前模型")
let modelName = ''
let queryParams = ref('');  // 搜索框关键字
const terrainProviderViewModels = getTerrainProviderViewModelsArr()

//----------------------------model table---------------------------------------
let currentPage = ref(1)
let pageSize = ref(5) // 每页最大显示5条
let total = ref(0)
let modelList = []
let tableData = ref([])
//------------------------------dialog对话框--------------------------------------
let title = ref("")
let dialogFormVisible = ref(false)
let modelInfo = reactive({
  name: null, path: null, rz: null, tz: null, rze: null, tze: null, time: null, modelid: null
})
//-------------------------------------------------------------------------------
let showSelectModel = ref(true)
// -----------------------------------------------------------------------------

onMounted(() => {
  init()
  watchTerrainProviderChanged()
  initModelTable()
})

onBeforeUnmount(() => {
  if (window.viewer != null) {
    let viewer = window.viewer
    let gl = viewer.scene.context._gl
    viewer.entities.removeAll()
    // viewer.scene.primitives.removeAll()
    viewer.destroy()
    gl.getExtension("WEBGL_lose_context").loseContext();
    gl = null
    window.viewer = null;
  }
})


// 初始化控件等
  function init() {
  let viewer = initCesium(Cesium)
  viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
  window.viewer = viewer
  let options = {}
  // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.

  options.defaultResetView = Cesium.Cartographic.fromDegrees(103.00, 29.98, 200000, new Cesium.Cartographic)
  // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
  options.enableCompass = true
  // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
  options.enableZoomControls = true
  // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
  options.enableDistanceLegend = true
  // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
  options.enableCompassOuterRing = true
  options.resetTooltip = "重置视图";
  options.zoomInTooltip = "放大";
  options.zoomOutTooltip = "缩小";
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(103.00, 29.98, 20000),//足够高可以看到整个地球
    orientation: {
      // 指向
      heading: 6.283185307179581,
      // 视角
      pitch: -1.5688168484696687,
      roll: 0.0
    }
  });
  //新版必须new  CesiumNavigation ,可以查看作者github
  window.navigation = new CesiumNavigation(viewer, options)
  // document.getElementsByClassName('navigation-control-icon-zoom-in')[0].style.color = '#409EFF'
  // document.getElementsByClassName('navigation-control-icon-zoom-out')[0].style.color = '#409EFF'
  document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索'
  document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务'
  document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务'
  // document.getElementsByClassName('cesium-viewer-cesiumInspectorContainer')[0].style.top = '300px'
  // document.getElementsByClassName('cesium-viewer-cesium3DTilesInspectorContainer')[0].style.top = '600px'
  // 设置鼠标位置经纬度\视角高度实时显示
  let longitudeShow = document.getElementById('longitudeShow');
  let latitudeShow = document.getElementById('latitudeShow');
  let altitudeShow = document.getElementById('altitudeShow');
  let canvas = viewer.scene.canvas;
  //具体事件的实现
  let ellipsoid = viewer.scene.globe.ellipsoid;
  let handler = new Cesium.ScreenSpaceEventHandler(canvas);
  handler.setInputAction(function (movement) {
    //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
    if (cartesian) {
      //将笛卡尔三维坐标转为地图坐标（弧度）
      let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      //将地图坐标（弧度）转为十进制的度数
      let latString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
      let logString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
      // 获取相机的海拔高度作为视角高度/km
      let altiString = (viewer.camera.positionCartographic.height / 1000).toFixed(2);
      longitudeShow.innerHTML = logString;
      latitudeShow.innerHTML = latString;
      altitudeShow.innerHTML = altiString;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  layer.loadYaAnVillageLayer();
  window.viewer.camera.changed.addEventListener(handleCameraChange);
}

  function handleCameraChange() {
    // 定义相机高度阈值
    let CITY_LAYER_HEIGHT = 1000000; // 市级图层的高度阈值
    let COUNTY_LAYER_HEIGHT = 100000; // 区县级图层的高度阈值
    let height = window.viewer.camera.positionCartographic.height; // 获取相机高度
    console.log("当前相机高度:", height);

    // 根据高度动态加载或移除图层
    if (height > CITY_LAYER_HEIGHT) {
      // 移除区县级和道路级标签
      layer.removeSiChuanCountyLayer()
      layer.removeYaAnVillageLayer()
      // 加载市级图层
      layer.loadSichuanCityLayer();
    } else if (height > COUNTY_LAYER_HEIGHT) {
      // 移除市级和道路级标签
      layer.removeSichuanCityLayer()
      layer.removeYaAnVillageLayer()
      // 加载区县级图层
      layer.loadSiChuanCountyLayer();
    } else {
      layer.removeSichuanCityLayer()
      layer.removeSiChuanCountyLayer()
      // 加载乡镇级图层
      layer.loadYaAnVillageLayer();
    }
  }

  function switchToLocalDEM() {
    // 切换地形提供者
    if (true) {
      window.viewer.scene.terrainProvider = terrainProviderViewModels[2].creationCommand(); // 切换到DEM地形
      // window.viewer.scene.terrainProvider = terrainProviderViewModels[1].creationCommand(); // 切换到第三方地形
    } else {
      window.viewer.scene.terrainProvider = terrainProviderViewModels[0].creationCommand(); // 切换到仅底图
    }

    // 更新选中的地形
    window.viewer.baseLayerPicker.viewModel.selectedTerrain = terrainProviderViewModels[true ? 2 : 0];
    //
    // // 高亮当前选中的地形
    const currentLayer = document.querySelector(`[title="${true ? '本地DEM地形' : 'WGS84标准球体'}"]`);
    // 更新选中的地形
    // window.viewer.baseLayerPicker.viewModel.selectedTerrain = terrainProviderViewModels[true ? 1 : 0];

    // 高亮当前选中的地形
    // const currentLayer = document.querySelector(`[title="${true ? '第三方地形' : 'WGS84标准球体'}"]`);
    // console.log("currentLayer",currentLayer)
    if (currentLayer) {
      currentLayer.classList.add('cesium-baseLayerPicker-selectedItem');
    }
  }

  function changeModel(row) {
    switchToLocalDEM()
    if (isTerrainLoaded()) {
      tz.value = row.tze
      rz.value = row.rze
    } else {
      tz.value = row.tz
      rz.value = row.rz
    }

    modelInfo.name = row.name
    modelInfo.path = row.path
    modelInfo.tz = row.tz
    modelInfo.rz = row.rz
    modelInfo.time = row.time
    // modelInfo.modelid = row.modelid
    modelInfo.modelid = row.uuid
    modelInfo.tze = row.tze
    modelInfo.rze = row.rze

    // 模型加载绕点旋转
    new Promise((resolve, reject) => {
      goModel(row)
      resolve()
    }).then(() => {
      let tileset = window.modelObject
      tileset.readyPromise.then(() => {
            let boundingSphere = tileset.boundingSphere;
            let center = boundingSphere.center;
            let cartographic = Cesium.Cartographic.fromCartesian(center);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            rotateCamera({lng: longitude, lat: latitude, pitch: -40, height: 7500, time: 120})
          }
      )
    })
  }

  function rotateCamera(options) {
    let time = options.time
    let position = Cesium.Cartesian3.fromDegrees(options.lng, options.lat, 0.0);
    // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-30度
    let pitch = Cesium.Math.toRadians(options.pitch);
    // 飞行720°所需时间，比如30s, 那么每秒转动度数
    let angle = 720 / time;
    // 给定相机距离点多少距离飞行
    let distance = options.height;
    let startTime = Cesium.JulianDate.fromDate(new Date());

    let stopTime = Cesium.JulianDate.addSeconds(startTime, time, new Cesium.JulianDate());

    viewer.clock.startTime = startTime.clone();  // 开始时间
    viewer.clock.stopTime = stopTime.clone();     // 结速时间
    viewer.clock.currentTime = startTime.clone(); // 当前时间
    viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
    // 相机的当前heading
    let initialHeading = viewer.camera.heading;
    viewer.entities.add({
      id: new Date().getTime(),
      position: Cesium.Cartesian3.fromDegrees(options.lng, options.lat),
      point: {
        pixelSize: 10,//点像素大小
        color: Cesium.Color.RED,//点颜色，不能用rgb等css方法，需要用Cesium.Color
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
    })
    let Exection = function TimeExecution() {
      // 当前已经过去的时间，单位s
      let delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
      // 根据过去的时间，计算偏航角的变化
      let heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;

      viewer.camera.lookAt(position, new Cesium.HeadingPitchRange(heading, pitch, distance));

      if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
        viewer.clock.onTick.removeEventListener(Exection);
      }
    };
    // 鼠标可以通过左击和滚动滚轮结束旋转
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (click) {
      viewer.clock.onTick.removeEventListener(Exection);
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      console.log('LEFT_CLICK')
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handler.setInputAction(function (click) {
      viewer.clock.onTick.removeEventListener(Exection);
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      console.log('WHEEL')
      handler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL)
    }, Cesium.ScreenSpaceEventType.WHEEL)
    viewer.clock.onTick.addEventListener(Exection);
  }

  function showArrowModel() {
    showArrow(showArrowValue)
    if (!showArrowValue) {
      showArrowValue = true
      showArrowText.value = "隐藏坐标轴"
    } else {
      showArrowValue = false
      showArrowText.value = "显示坐标轴"
    }
  }

  function hideModel() {
    hide(modelStatus)
    if (modelStatus) {
      // window.modelObject.show = false
      modelStatus = false
      modelStatusContent.value = '显示当前模型'
    } else {
      // window.modelObject.show = true
      modelStatus = true
      modelStatusContent.value = '隐藏当前模型'
    }
  }


// 更新模型位置
  function updataPosition() {

    if (isTerrainLoaded()) {
      let data = {
        rze: rz.value,
        tze: tz.value,
        uuid: modelInfo.modelid
      }
      console.log(data, "update data")
      updataModelElevation(data).then(res => {
        ElMessage({
          showClose: true,
          message: '加载地形情况下，更新成功',
          type: 'success',
          duration: 2000,
        })
        initModelTable()
      })
    } else {
      let data = {
        rz: rz.value,
        tz: tz.value,
        uuid: modelInfo.modelid
      }
      console.log(data, "update data")
      updataModelNoElevation(data).then(res => {
        ElMessage({
          showClose: true,
          message: '不加载地形情况下，更新成功',
          type: 'success',
          duration: 2000,
        })
        initModelTable()
      })
    }
  }

//监听地形
  function watchTerrainProviderChanged() {
    window.viewer.scene.terrainProviderChanged.addEventListener(terrainProvider => {
      if (isTerrainLoaded()) {
        tz.value = modelInfo.tze
        rz.value = modelInfo.rze
        changeHeight(modelInfo.tze)
        rotationModel(window.modelObject, rz.value)
        findModel()
      } else {
        tz.value = modelInfo.tz
        rz.value = modelInfo.rz
        changeHeight(modelInfo.tz)
        rotationModel(window.modelObject, rz.value)
        findModel()
      }
    });
  }

  function changeHeight(_tz) {
    tz.value = _tz
    transferModel(window.modelObject, 0, 0, _tz, opacity.value)
  }

  function changeRotationZ(_rz) {
    console.log(modelInfo, "modelInfo")
    rz.value = _rz
    rotationModel(window.modelObject, _rz)
  }

  function changeOpacity(_opacity) {
    opacity.value = _opacity
    transferModel(window.modelObject, 0, 0, tz.value, _opacity)
  }

//-----------------------模型table----------------------------

// 初始化模型table数据
  function initModelTable() {
    getAllModel().then(res => {
      console.log(res)
      modelList = res
      total.value = modelList.length
      tableData.value = getPageArr(modelList)
      console.log("modelList, tableData", modelList, tableData)
    })
  }

// 修改table的header的样式
  function tableHeaderColor() {
    return {
      'border-width': '1px',
      'border-style': 'solid',
      'border-color': '#555555',
      'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
      'color': '#fff',
      'padding': '0',
      'text-align': 'center',
      'font-size': '14px'
    }
  }

// 修改table 中每行的样式
  function tableColor({row, column, rowIndex, columnIndex}) {
    if (rowIndex % 2 == 1) {
      return {
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#555555',
        'background-color': '#313a44',
        'color': '#fff',
        'padding': '0',
        'text-align': 'center',
        'font-size': '14px'
      }
    } else {
      return {
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#555555',
        'background-color': '#304156',
        'color': '#fff',
        'padding': '0',
        'text-align': 'center',
        'font-size': '14px'
      }
    }
  }

  /**
   * 分页
   * @param data
   * @returns {*[]}
   */
//数组切片
  function getPageArr(data) {
    let arr = []

    // 打印分页的起始和结束位置
    let start = (currentPage.value - 1) * pageSize.value
    let end = currentPage.value * pageSize.value
    console.log('Start index:', start);  // 打印起始索引
    console.log('End index:', end);      // 打印结束索引

    if (end > total.value) {
      end = total.value
    }

    console.log('Adjusted End index:', end); // 打印调整后的结束索引

    // 遍历数据，打印每个数据项
    for (; start < end; start++) {
      // 检查是否存在数据项
      if (data[start]) {
        console.log('Data item:', data[start]);  // 打印每个数据项
        data[start].show = false
        arr.push(data[start])
      } else {
        console.log('No data at index', start);  // 如果没有数据，打印当前索引
      }
    }
    console.log('Current page data:', arr);  // 打印当前页的数据
    return arr
  }


//`每页 ${val} 条`
  function handleSizeChange(val) {
    pageSize.value = val
    tableData.value = getPageArr(modelList)
    // console.log(`每页 ${val} 条`);
  }

// `当前页: ${val}`
  function handleCurrentChange(val) {
    currentPage.value = val
    tableData.value = getPageArr(modelList)
    // console.log(`当前页: ${val}`);
  }


//----------------------无用法-------------------------------------

// 打开对话框
  function openDialog(titleM, row) {
    if (titleM === "新增") {
      title.value = "新增"
      modelInfo.rz = 0
      modelInfo.tz = 0
      modelInfo.time = '1717743010164'
      modelInfo.modelid = Date.now()
    } else {
      modelInfo.rz = 0
      modelInfo.tz = 0
      modelInfo.time = '1717743010164'
      modelInfo.modelid = row.modelid
      modelInfo.name = row.name
      modelInfo.path = row.path
      title.value = "编辑"
    }
    dialogFormVisible.value = true

  }

// 关闭对话框
  function closeDialog() {
    for (let key in modelInfo) {
      modelInfo[key] = null
    }
    dialogFormVisible.value = false
  }

// 确认提交对话框，添加模型
  function commitDialog() {
    let data = {
      name: modelInfo.name,
      path: modelInfo.path,
      rz: modelInfo.rz,
      tz: modelInfo.tz,
      rze: modelInfo.rze,
      tze: modelInfo.tze,
      time: modelInfo.time,
      modelid: modelInfo.modelid
    }
    if (title.value === "新增") {
      addModelApi(data).then(res => {
        initModelTable()
        for (let key in modelInfo) {
          modelInfo[key] = null
        }
      })
    }
    // else{
    //   updataModel(data).then(res=>{
    //     initModelTable()
    //     for(let key in modelInfo){
    //       modelInfo[key] = null
    //     }
    //     console.log(res,'编辑')
    //   })
    // }
    dialogFormVisible.value = false
  }

// 删除模型
  function deleteM(row) {
    deleteModel({modelid: row.modelid}).then(res => {
      initModelTable()
    })
  }

// 修改模型
  function updataM(row) {
    modelInfo.name = row.name
    modelInfo.path = row.path
    modelInfo.tz = row.tz
    modelInfo.rz = row.rz
    modelInfo.time = row.time
    modelInfo.modelid = row.modelid
    modelInfo.tze = row.tze
    modelInfo.rze = row.rze
    // row.show = !row.show
  }

  function updataMCommit() {
    let data = {
      name: modelInfo.name,
      path: modelInfo.path,
      rz: modelInfo.rz,
      tz: modelInfo.tz,
      rze: modelInfo.rze,
      tze: modelInfo.tze,
      time: modelInfo.time,
      modelid: modelInfo.modelid
    }
    updataModel(data).then(res => {
      initModelTable()
      for (let key in modelInfo) {
        modelInfo[key] = null
      }
      console.log(res, '编辑')
    })
  }

  function selectGltfModel() {
    remove3dData()
    tz.value = 0
    originTz = 0

    let cartesian = new Cesium.Cartesian3.fromDegrees(103.00, 29.98, 0.0)
    let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(cartesian);

    let model = Cesium.Model.fromGltf({
      url: './peilou/万达.gltf',
      modelMatrix: modelMatrix,
      id: 'wanda',
      minimumPixelSize: 128,
      scale: 1,
    })
    window.modelObject = model
    window.viewer.scene.primitives.add(window.modelObject)
    console.log(window.modelObject)
    window.modelObject.readyPromise.then(function () {

      let origin = new Cesium.Cartesian3(0, 0, 1000)
      Cesium.Matrix4.multiplyByPoint(window.modelObject.modelMatrix, origin, origin)
      window.viewer.camera.zoomTo({
        destination: origin,
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        }
      });
    })

  }

  function home() {
    remove3dData()
    viewer.camera.setView({
      // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
      // fromDegrees()方法，将经纬度和高程转换为世界坐标
      destination: Cesium.Cartesian3.fromDegrees(103.00, 29.98, 1500),
      orientation: {
        // 指向
        heading: 6.283185307179581,
        // 视角
        pitch: -1.5688168484696687,
        roll: 0.0
      }
    });
  }

// 搜索按钮
  function handleQuery() {
    const searchKey = queryParams.value.trim();  // 获取搜索关键字

    querytiltModelData(searchKey || undefined)  // 如果没有搜索关键字，传递 `undefined` 获取所有数据
        .then(res => {
          modelList = res.data
          console.log("获取的数据:", modelList); // 打印获取的数据
          total.value = modelList.length;  // 更新分页总数
          tableData.value = getPageArr(modelList);  // 获取分页数据
        })
        .catch(error => {
          console.error("查询时出现错误:", error.message || error);
        });
  }

  function resetQuery() {
    queryParams.value = '';
    initModelTable();// 清空搜索输入框
  }

</script>

<style scoped>
.el-pagination {
  margin-top: 21px;
  justify-content: center;
}

:deep(.el-pagination__total) {
  color: #FFFFFF;
}

:deep(.el-pagination>.is-last) {
  color: #FFFFFF;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  width: 0;
}

.cesium-viewer-navigationContainer {
  display: none !important;
}

.el-tree {
  background: rgb(38 36 36) !important;
  color: #ffffff !important;
}

.el-tree-node__content:hover {
  background-color: rgb(38 36 36) !important;
}

.el-tree-node:focus > .el-tree-node__content {
  background-color: rgb(38 36 36) !important;
}

.plotTreeItem {
  margin: 3px;
}

.plottreetooltip {
  margin: 4px;
}

#cesiumContainer {
  height: calc(100vh - 50px);
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.markCollection {
  position: absolute;
  padding: 10px;
  top: 630px;
  left: 10px;
  background-color: rgba(40, 40, 40, 0.7);
  z-index: 10; /* 更高的层级 */
}

.markCollection span {
  margin: 5px;
  width: 30px;
  height: 30px;
}

.markCollection span:hover {
  cursor: pointer;
}

.noteContainer {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 368px;
  left: 10px;
  width: 500px;
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

.tool-container-1 {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  width: 625px;
  top: 10px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.tool-container {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  width: 560px;
  top: 43%;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.button-container {
  height: 36%;
  width: 560px;
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 65px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.latlon-legend {
  pointer-events: auto;
  position: absolute;
  border-radius: 15px;
  padding-left: 5px;
  padding-right: 5px;
  bottom: 30px;
  height: 30px;
  width: 125px;
  box-sizing: content-box;
}

.modelAdj {
  color: #FFFFFF;
  margin-bottom: 5px;
  margin-right: 10px;
}
</style>
