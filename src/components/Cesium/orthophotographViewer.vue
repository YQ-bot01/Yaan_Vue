<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import layer from "@/cesium/layer.js";

export default {
  name: "orthophotographViewer",
  data(){
    return{
      LRDLStatus: true, // 路网
    }
  },
  mounted() {
    this.init();
  },
  beforeUnmount() {
    if (window.viewer){
      let viewer=window.viewer
      let gl=viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除")
      gl=null
      window.viewer = null;
    }
  },
  methods: {
    init() {
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = "none";
      window.viewer = viewer;
      let options = {};
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(103.0, 29.98, 500000), // 设置经度、纬度和高度
      });
      options.defaultResetView = Cesium.Cartographic.fromDegrees(
          103.0,
          29.98,
          500000,
          new Cesium.Cartographic()
      );
      options.enableCompass = true;
      options.enableZoomControls = true;
      options.enableDistanceLegend = true;
      options.enableCompassOuterRing = true;
      options.resetTooltip = "重置视图";
      options.zoomInTooltip = "放大";
      options.zoomOutTooltip = "缩小";
      window.navigation = new CesiumNavigation(viewer, options);
      document.getElementsByClassName("cesium-geocoder-input")[0].placeholder =
          "请输入地名进行搜索";
      document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[0].innerHTML =
          "影像服务";
      document.getElementsByClassName("cesium-baseLayerPicker-sectionTitle")[1].innerHTML =
          "地形服务";

      viewer.scene.globe.depthTestAgainstTerrain = false;
      this.addOrthophotographViewer()
      layer.loadYaAnVillageLayer();
      window.viewer.camera.changed.addEventListener(this.handleCameraChange);
      layer.addTrafficLayer()
    },
    handleCameraChange() {
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
      }
      else {
        layer.removeSichuanCityLayer()
        layer.removeSiChuanCountyLayer()
        // 加载乡镇级图层
        layer.loadYaAnVillageLayer();
      }
    },
    addOrthophotographViewer(){
      let url = this.$route.query.url
      let layers = this.$route.query.layers
      console.log(url,layer,"url,layer")
      let lon = parseFloat(this.$route.query.lon )
      let lat = parseFloat(this.$route.query.lat )
      window.viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapServiceImageryProvider({
            url,
            layers,
            parameters: {
              service: 'WMS', // 指定服务类型为WMS
              format: 'image/png', // 指定返回的图像格式为PNG
              transparent: true // 启用透明背景
            }
          })
      );
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 5000), // 设置经度、纬度和高度
        duration:1
      });
    },
    TrafficLayer(){
      if(this.LRDLStatus){
        layer.removeTrafficLayer()
      }
      else{
        layer.addTrafficLayer()
      }
      this.LRDLStatus=!this.LRDLStatus
    },
    addAllOrthophotographViewer(){
      let url = this.$route.query.url
      let layers = "yaan:yaan_dom"
      window.viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapServiceImageryProvider({
            url,
            layers,
            parameters: {
              service: 'WMS', // 指定服务类型为WMS
              format: 'image/png', // 指定返回的图像格式为PNG
              transparent: true // 启用透明背景
            }
          })
      );
    },
  }
}
</script>

<template>
  <div>
    <div id="cesiumContainer"></div>
    <div class="modelAdj">
      <el-button type="primary" @click="TrafficLayer">交通网络</el-button>
      <el-button type="primary" @click="addAllOrthophotographViewer">雅安市高精度正射影像一键加载</el-button>

    </div>
  </div>
</template>

<style scoped>
#cesiumContainer{
  width: 100vw;
  height: 100vh;
}
.modelAdj {
  position: absolute;
  top:3vh;
  left: 1vb;
}
</style>
