<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'

export default {
  name: "orthophotographViewer",
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
    },
    addOrthophotographViewer(){
      let url = this.$route.query.url
      let layers = this.$route.query.layers
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


      // 设置背景透明
      // window.viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

      // 确保WebGL上下文支持透明度
      // window.viewer.scene.context._gl.getContextAttributes().alpha = true;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 5000), // 设置经度、纬度和高度
        duration:1
      });
    }

  }
}
</script>

<template>
  <div id="cesiumContainer"></div>
</template>

<style scoped>
#cesiumContainer{
  width: 100%;
  height: 100%;
}
</style>
