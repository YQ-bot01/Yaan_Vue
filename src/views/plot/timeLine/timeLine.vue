<template>
  <div>
    <timeLineTitle
        :centerPoint="centerPoint"
    />
      <div id="cesiumContainer">
        <!--中心标绘信息-->
        <eqCenterPanel
            v-show="eqCenterPanelVisible"
            :position="PanelPosition"
            :popupData="PanelData"
        />
        <!--态势标绘信息-->
        <plotInfoOnlyShowPanel
            v-show="plotShowOnlyPanelVisible"
            :position="PanelPosition"
            :eqThemeName="tableName"
            :eqThemeInfo="eqThemeData"
            :popupData="PanelData"
        />
        <!--聚合标绘信息-->
        <dataSourcePanel
            :visible="dataSourcePopupVisible"
            :position="PanelPosition"
            :popupData="dataSourcePopupData"
        />
      </div>

    <!--    centerPoint经过一次数据库查询，eqid是别的页面传值，eqid传得更快-->
    <timeLinePlay
        :viewer="viewer"
        :eqid="eqid"
        :centerPoint="centerPoint"
        :currentTime="currentTimeString"
        @updatePlots="updatePlots"
    />
    <!--   -->
    <div>
      <div class="pop_left_background">
        <timeLineEmergencyResponse
            :edit="true"
            :eqid="eqid"
            :centerPoint="centerPoint"
            :currentTime="currentTimeString"
        />
        <!--   人员伤亡-左中   -->
        <timeLinePersonnelCasualties
            :eqid="eqid"
            :currentTime="currentTimeString"
        />
        <!--        震中信息组件-->
        <timeLineBaseInfo
            :centerPoint="centerPoint"
        />
      </div>
      <timeLineLegend
          :activeComponent="activeComponent"
          @toggleComponent="toggleComponent"
      />
      <div class="pop_right_background">
        <!--生命线情况-->
        <timeLineLifeLine
            :eqid="eqid"
            :currentTime="currentTimeString"
        />
        <timeLinePlotStatistics
            :plots="plots"
            :currentTime="currentTimeString"
            :startTime="centerPoint.startTime"
            :zoomLevel="plotzoomLevel"
            :isTimeRunning="isTimeRunning"
            :viewCenterCoordinate="viewCenterCoordinate"
            :earthquakeName="centerPoint.earthquakeName"
            :selectedDistrict="selectedDistrict"
        />
        <timeLineMiniMap
            :viewer="viewer"
            :centerPoint="centerPoint"
        />
      </div>
    </div>
  </div>
</template>
<script>
//组件
import timeLineTitle from "@/components/timeLineComponent/timeLineTitle.vue";
import timeLinePlay from "@/components/timeLineComponent/timeLinePlay.vue";
import timeLineEmergencyResponse from "@/components/timeLineComponent/timeLineEmergencyResponse.vue";
import timeLinePersonnelCasualties from "@/components/timeLineComponent/timeLinePersonnelCasualties.vue";
import timeLineBaseInfo from "@/components/timeLineComponent/timeLineBaseInfo.vue";
import timeLineLegend from "@/components/timeLineComponent/timeLineLegend.vue";
import timeLineLifeLine from "@/components/timeLineComponent/timeLineLifeLine.vue";
import timeLinePlotStatistics from "@/components/timeLineComponent/timeLinePlotStatistics.vue";
import timeLineMiniMap from "@/components/timeLineComponent/timeLineMiniMap.vue";
import eqCenterPanel from "@/components/Panel/eqCenterPanel.vue";
import plotInfoOnlyShowPanel from "@/components/Panel/plotInfoOnlyShowPanel";
import dataSourcePanel from "@/components/Panel/dataSourcePanel.vue";

//cesium
import * as Cesium from 'cesium'
import {initCesium} from "@/cesium/tool/initCesium.js";
import CesiumNavigation from "cesium-navigation-es6";

//前后端
import {getEqListById} from "@/api/system/eqlist.js";
//数据处理方法
import timeTransfer from "@/cesium/tool/timeTransfer.js";
import timeLine from "@/cesium/timeLine.js";
import {Edit} from "@element-plus/icons-vue";
import {goModel, isTerrainLoaded} from "@/cesium/model.js";
import siChuanCity from "@/assets/geoJson/sichuan.json";
import sichuanCounty from "@/assets/geoJson/sichuanCounty.json";
import yaAnVillage from "@/assets/geoJson/yaan.json";
import Arrow from "@/cesium/drawArrow/drawPlot.js";
import layer from "@/cesium/layer.js";


export default {
  name: "TimeLine",
  components: {
    timeLineTitle,
    timeLineMiniMap,
    timeLinePlotStatistics,
    timeLineLifeLine,
    timeLineLegend,
    timeLineBaseInfo,
    timeLinePersonnelCasualties,
    timeLineEmergencyResponse,
    timeLinePlay,
    //弹框
    eqCenterPanel,
    plotInfoOnlyShowPanel,
    dataSourcePanel,
  },
  data: function () {
    return {
      siChuanCityEntity: [],
      siChuanCountyEntity: [],
      siChuanVillageEntity: [],
      eqid: '',
      currentTime: '',
      centerPoint: {},

      //----组件传值---
      //时间轴、缩略图
      viewer: '',

      //图例组件传值-面板展开装状态
      activeComponent: null,
      //标绘统计组件传值
      lastCameraPosition: Cesium.Cartesian3.ZERO, // 上一次相机的位置，默认值为 (0, 0, 0)
      lastCameraTime: 0,     // 上一次相机位置的时间戳，默认值为 0
      cameraPosition: null,     // 当前相机的位置
      isCameraStopped: false,   // 标记相机是否停止

      isTimeRunning: true,
      plots: [],
      plotzoomLevel: '市', // 初始化缩放层级
      viewCenterCoordinate: {
        lon: null,
        lat: null
      },//视角中心坐标
      //----组件传值---end---
      //---信息弹框---
      hasUpdatedPosition: false,
      selectedEntityPosition: '', //拾取的点的弹框位置
      eqCenterPanelVisible: false,
      routerPopupVisible: false, // RouterPanel弹窗的显示与隐藏
      plotShowOnlyPanelVisible: false, // TimeLinePanel弹窗的显示与隐藏
      PanelPosition: {x: 0, y: 0}, // TimeLinePanel弹窗的位置
      tableName: "", // plotShowOnlyPanel弹窗的表名
      eqThemeData: {}, // plotShowOnlyPanel弹窗的地震专题数据
      PanelData: {}, // TimeLinePanel弹窗的数据
      routerPanelData: {},
      dataSourcePopupVisible: false, // TimeLinePanel弹窗的显示与隐藏
      dataSourcePopupData: {}, // TimeLinePanel弹窗的数据
      //----------------------------------


    }
  },
  created() {
    this.eqid = this.$route.params.eqid
    console.log(this.eqid, "this.eqid created father")
  },
  mounted() {
    this.init()
  },
  computed: {
    // 在父组件中，将 JulianDate 转换为字符串
    currentTimeString() {
      if (this.currentTime) {
        // 使用 Cesium 的函数将 JulianDate 转换为 ISO 字符串
        return Cesium.JulianDate.toIso8601(this.currentTime);
      }
      return '';
    }
  },
  methods: {
    init() {
      let clock;
      getEqListById({id: this.eqid}).then(res => {
        console.log(res)
        //震中标绘点
        this.centerPoint = res

        // 设置中心点的标识和时间信息
        this.centerPoint.plotId = res.eqid
        this.centerPoint.startTime = new Date(this.centerPoint.occurrenceTime)
        this.centerPoint.endTime = new Date(this.centerPoint.startTime.getTime() + 10 * 24 * 3600 * 1000);
        this.currentTime = this.centerPoint.startTime
        this.centerPoint.plotType = "震中"

        clock = new Cesium.Clock({
          startTime: Cesium.JulianDate.fromDate(this.centerPoint.startTime),
          stopTime: Cesium.JulianDate.fromDate(this.centerPoint.endTime),
          currentTime: Cesium.JulianDate.fromDate(this.currentTime),
          clockRange: Cesium.ClockRange.CLAMPED,
        })
        let viewer = initCesium(Cesium, "cesiumContainer", clock)
        //取消双击视角定位
        viewer.trackedEntity =undefined;
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
        viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息

        let options = {}
        // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
        // options.defaultResetView = Cesium.Cartographic.fromDegrees(103.00, 29.98, 1000, new Cesium.Cartographic)
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
        //新版必须new  CesiumNavigation ,可以查看作者github
        window.navigation = new CesiumNavigation(viewer, options)
        document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索'
        document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务'
        document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务'

        // 设置相机高度和视角
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(103.00, 29.98, 20000000),//足够高可以看到整个地球
          orientation: {
            // 指向
            heading: 6.283185307179581,
            // 视角
            pitch: -1.5688168484696687,
            roll: 0.0
          }
        });
        viewer.clock.multiplier = 3600
        let that = this
        viewer.clock.onTick.addEventListener(function (clock) {
          that.currentTime = clock.currentTime;
          if (viewer.clockViewModel.shouldAnimate) {
            that.isTimeRunning = true
          } else {
            that.isTimeRunning = false
          }
          //视角中心监测 1秒钟时间不变才更新
          const now = new Date().getTime();
          const currentPosition = viewer.scene.camera.position;
          const hasMoved = !Cesium.Cartesian3.equals(that.lastCameraPosition, currentPosition);

          if (hasMoved) {
            that.lastCameraPosition = Cesium.Cartesian3.clone(currentPosition);
            that.lastCameraTime = now;
            that.hasUpdatedPosition = false; // 重置标志位
          } else {
            if (!that.hasUpdatedPosition) { // 检查是否已经更新过位置
              const elapsedTime = now - that.lastCameraTime;
              if (elapsedTime >= 1000) {
                // console.log("更新视角中心");
                const positionCartographic = viewer.camera.positionCartographic;
                let height = positionCartographic.height;
                that.updatePlotZoomLevel(height);
                let longitude = Cesium.Math.toDegrees(positionCartographic.longitude);
                let latitude = Cesium.Math.toDegrees(positionCartographic.latitude);
                that.viewCenterCoordinate = {
                  lon: longitude,
                  lat: latitude
                };
                that.hasUpdatedPosition = true; // 设置标志位
              }
            }
          }
        });


        viewer.animation.viewModel.timeFormatter = timeTransfer.CesiumTimeFormatter;
        viewer.timeline.makeLabel = timeTransfer.CesiumDateTimeFormatter;
        viewer.animation.viewModel.dateFormatter = timeTransfer.CesiumDateFormatter;

        let realTime = new Date()
        if (realTime > this.centerPoint.startTime && realTime < this.centerPoint.endTime) {
          console.log("还在更新的地震")
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
          document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[3].style = 'visibility:hidden';
        } else {
          console.log("历史地震")
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
          document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:hidden';
        }
        document.getElementsByClassName('cesium-timeline-main')[0].style = 'width: 70%; left:15%;right:15%; ';
        document.getElementsByClassName('cesium-timeline-bar')[0].style = 'background:rgba(0, 0, 0, 0.1);';


        window.viewer = viewer
        this.viewer = viewer
        viewer.clock.shouldAnimate = false;
        this.entitiesClickPonpHandler()
        this.updateMapAndVariableBeforeInit()
        window.viewer.camera.changed.addEventListener(this.handleCameraChange);
      })
    },
    handleCameraChange() {
      // 定义相机高度阈值
      let CITY_LAYER_HEIGHT = 1000000; // 市级图层的高度阈值
      let COUNTY_LAYER_HEIGHT = 100000; // 区县级图层的高度阈值
      let VILLAGE_LAYER_HEIGHT = 10000; // 道路级图层的高度阈值
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
    updatePlotZoomLevel(cameraHeight) {
      if (cameraHeight < 50000) {
        this.plotzoomLevel = '区/县'
      } else {
        this.plotzoomLevel = '市'
      }
    },
    updateMapAndVariableBeforeInit() {
      timeLine.fly(this.centerPoint.longitude, this.centerPoint.latitude, 60000, 5).then(() => {
        viewer.clockViewModel.shouldAnimate = true;
      });
      timeLine.addDataSourceLayer("pointData")
      timeLine.addCenterPoint(this.centerPoint)
    }
    ,

    toggleComponent(component) {
      // 如果点击的是当前活动组件，则关闭它，否则打开新组件
      this.activeComponent = this.activeComponent === component ? null : component;
    }
    ,
    updatePlots(plots) {
      console.log(this.plots, "plots updatePlots")
      this.plots = plots
    },
    //----------------处理实体点击事件的弹窗显示逻辑-----------------

    //-------信息面板弹框-----
    entitiesClickPonpHandler() {
      let that = this;
      // 在屏幕空间事件处理器中添加左键点击事件的处理逻辑
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        // 检查点击位置是否拾取到实体
        let pickedEntity = window.viewer.scene.pick(click.position);
        console.log("点击选择的pickedEntity", pickedEntity)
        window.selectedEntity = pickedEntity?.id;

        // 绑定断裂带信息的 div 元素
        // const faultInfoDiv = document.getElementById('faultInfo');
        // 如果拾取到实体
        if (Cesium.defined(pickedEntity)) {
          let entity = window.selectedEntity;
          console.log(entity, "拾取entity")




          // 计算图标的世界坐标
          this.selectedEntityPosition = this.calculatePosition(click.position);
          this.updatePopupPosition(); // 确保位置已更新

          // if (entity._layer === "断裂带") {
          //   //console.log("断裂带")
          //
          //   const faultName = pickedEntity.id.properties.name._value;
          //
          //   if (faultName) {
          //     // 获取点击位置的地理坐标 (Cartesian3)
          //     const cartesian = viewer.scene.pickPosition(click.position);
          //     if (!Cesium.defined(cartesian)) {
          //       return;
          //     }
          //
          //     // 更新 faultInfo 的位置和内容
          //     this.updateFaultInfoPosition(faultName);
          //
          //     // 显示 faultInfo
          //     faultInfoDiv.style.display = 'block';
          //
          //     // 监听地图变化，动态更新 div 的位置
          //     window.viewer.scene.postRender.addEventListener(() => {
          //       this.updateFaultInfoPosition(faultName);
          //     });
          //
          //     //console.log(faultName)
          //   }
          // }
          // 如果点击的是标绘点
          if (entity._layer === "震中") {
            this.eqCenterPanelVisible = true;
            this.plotShowOnlyPanelVisible = false;
            this.dataSourcePopupVisible = false
            this.routerPopupVisible = false;
            this.PanelPosition = this.selectedEntityPosition; // 更新位置
            this.PanelData = {}
            this.PanelData = this.extractDataForRouter(entity)
            console.log("PanelData 震中", this.PanelData)
          } else if (entity._layer === "倾斜模型") {

            // 获取实体的自定义属性

            let row = entity.data;
            this.modelInfo.name = row.name
            this.modelInfo.path = row.path
            this.modelInfo.tz = row.tz
            this.modelInfo.rz = row.rz
            this.modelInfo.time = row.time
            this.modelInfo.modelid = row.modelid
            this.modelInfo.tze = row.tze
            this.modelInfo.rze = row.rze

            this.tiltphotographymodel(row);
            goModel(row)
          } else if (entity._layer === "标绘点") {
            this.eqCenterPanelVisible = false;
            this.plotShowOnlyPanelVisible = true;
            this.dataSourcePopupVisible = false
            this.routerPopupVisible = false;
            this.PanelPosition = this.selectedEntityPosition; // 更新位置
            this.PanelData = {}
            this.eqThemeData = {}
            this.tableName = ""
            this.PanelData = this.extractDataForRouter(entity)
            // console.log("PanelData 标绘点",this.PanelData)

          }
          //救援队伍、避难场所、应急物资
          else if (entity._layer === "避难场所" || entity._layer === "救援队伍分布" || entity._layer === "应急物资存储") {
            this.eqCenterPanelVisible = false;
            this.routerPopupVisible = true;
            this.dataSourcePopupVisible = false;
            this.plotShowOnlyPanelVisible = false;
            this.PanelPosition = this.selectedEntityPosition;
            this.routerPanelData = this.extractDataForRouter(entity);
          }
          //资源调度——救灾物资储备、雅安应急队伍
          else if (entity._layer === "救灾物资储备" || entity._layer === "雅安应急队伍" || entity._layer === "抢险救灾装备") {
            this.eqCenterPanelVisible = false;
            this.routerPopupVisible = true;
            this.dataSourcePopupVisible = false;
            this.plotShowOnlyPanelVisible = false;
            this.PanelPosition = this.selectedEntityPosition;
            this.routerPanelData = this.extractDataForRouter(entity);
          }
          // //聚合图标
          else if (Object.prototype.toString.call(entity) === '[object Array]') {
            if (entity[0].entityCollection.owner.name === "label") {
              this.eqCenterPanelVisible = false;
              this.dataSourcePopupVisible = false
              this.plotShowOnlyPanelVisible = false
              this.routerPopupVisible = false;
            } else {

              //----

              let popupPanelDatatmp = entity.filter(item => item.plottype !== undefined);

              const drawTypes = popupPanelDatatmp.map(obj => obj.plottype);
              console.log(drawTypes)
              this.data = drawTypes.reduce((acc, type) => {
                if (acc[type]) {
                  acc[type] += 1;
                } else {
                  acc[type] = 1;
                }

                return acc;
              }, {});

              this.dataSourcePopupData = Object.entries(this.data).map(([key, value]) => ({
                type: key,
                count: value
              }));

              // this.dataSourcePopupData = entity
              this.dataSourcePopupVisible = true
              this.eqCenterPanelVisible = false;
              this.plotShowOnlyPanelVisible = false
              this.routerPopupVisible = false;

            }
          } else if (Cesium.defined(pickedEntity) && pickedEntity.id.name) {
            console.log(112211)
            let ray = viewer.camera.getPickRay(click.position);
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);

            this.PanelPosition = this.selectedEntityPosition;

            const properties = pickedEntity.id._properties;
            const sourceName = properties.sourceName;

            // 清空标绘数据信息，因为共用一个组件
            // this.PanelData = {}
            // 如果是医院点
            if (sourceName === "hospital") {
              this.tableName = "医院信息";
              this.eqThemeData = {
                "名称": properties._name._value,
                "位置": properties._location._value,
                "医院等级": properties._grade._value,
                "联系电话": properties._tel._value,
                "床铺数量": properties._bed._value,
                "所属单位": properties._membership._value,
                "救护车数量": properties._ambulance._value,
                "血浆数量": properties._plasma._value,
                "葡萄糖数量": properties._surgery_dc._value,
                "医生数量": properties._doctor._value,
                "麻醉剂数量": properties._anesthetis._value,
                "护士数量": properties._nurse._value,
                "地理位置": "经度: " + longitude.toFixed(2) + "°E, 纬度: " + latitude.toFixed(2) + "°N",
              }
              console.log(this.eqThemeData)
            }
            // 如果是村庄点
            else if (sourceName === "village") {
              this.tableName = "村庄信息";
              this.eqThemeData = {
                "名称": properties._NAME._value,
                "经纬度": "经度: " + longitude.toFixed(2) + "°E, 纬度: " + latitude.toFixed(2) + "°N",
              }
            }
            this.plotShowOnlyPanelVisible = true;
          }
          //断裂带
          else {
            // 如果不是标绘点或路标
            this.eqCenterPanelVisible = false;
            this.routerPopupVisible = false;
            this.plotShowOnlyPanelVisible = false;
            this.dataSourcePopupVisible = false
          }
        }
        //没有拾取到实体
        else {
          // 没有选中实体时隐藏 faultInfo
          // faultInfoDiv.style.display = 'none';
          this.eqCenterPanelVisible = false;
          this.routerPopupVisible = false;
          this.plotShowOnlyPanelVisible = false;
          this.dataSourcePopupVisible = false
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 在屏幕空间事件处理器中添加鼠标移动事件的处理逻辑
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        // 如果时间线弹窗或路由弹窗可见，则更新弹窗位置
        if (this.eqCenterPanelVisible || this.plotShowOnlyPanelVisible || this.routerPopupVisible || this.dataSourcePopupVisible) {
          this.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    /**
     * 计算点击位置的经纬度和高度
     *
     * @param {Object} clickPosition - 点击位置的屏幕坐标
     * @returns {Object} - 返回一个对象，包含经度(x)、纬度(y)和高度(z)
     */
    calculatePosition(clickPosition) {
      // 根据点击位置获取射线
      let ray = viewer.camera.getPickRay(clickPosition);
      // 用射线在场景中拾取位置
      let position = viewer.scene.globe.pick(ray, viewer.scene);
      // 将拾取的位置转换为地理坐标
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      // 将地理坐标的经纬度转换为度数
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      // 根据地形是否加载来获取高度
      let height = isTerrainLoaded() ? viewer.scene.globe.getHeight(cartographic) : 0;

      // 返回计算得到的经纬度和高度
      return {
        x: longitude, // 经度
        y: latitude,  // 纬度
        z: height     // 高度
      };
    },
    /**
     * 更新断裂带信息在画布上的位置
     * 此方法用于根据选定的实体位置，更新显示断裂带信息的div在画布上的位置
     * @param {string} faultName - 断裂带的名称，将被显示在故障信息div中
     */
    updateFaultInfoPosition(faultName) {
      this.$nextTick(() => {
        if (this.selectedEntityPosition) {
          // //console.log(this.selectedEntityPosition)
          const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              window.viewer.scene,
              Cesium.Cartesian3.fromDegrees(this.selectedEntityPosition.x, this.selectedEntityPosition.y, this.selectedEntityPosition.z)
          );
          if (canvasPosition) {
            const faultInfoDiv = document.getElementById('faultInfo');
            faultInfoDiv.style.left = canvasPosition.x + 'px';
            faultInfoDiv.style.top = canvasPosition.y + 55 + 'px';
            faultInfoDiv.innerHTML = `${faultName}`;
            // //console.log(faultInfoDiv)
          }
        }
      });
    },
    /**
     * 更新弹窗位置
     * 该方法用于更新路由和时间线弹窗在地图上的位置
     * 它通过将选中的实体位置转换为屏幕坐标来实现
     */
    updatePopupPosition() {
      // 使用$nextTick确保DOM更新后才执行位置计算
      this.$nextTick(() => {
        // 检查是否有选中的实体位置
        if (this.selectedEntityPosition) {
          // 将地理坐标转换为窗口坐标
          const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              window.viewer.scene,
              Cesium.Cartesian3.fromDegrees(this.selectedEntityPosition.x, this.selectedEntityPosition.y, this.selectedEntityPosition.z)
          );
          // 如果转换成功，则更新弹窗位置
          if (canvasPosition) {
            this.PanelPosition = {
              x: canvasPosition.x + 10,
              y: canvasPosition.y + 10
            };
          }
        }
      });
    },
    /**
     * 提取实体属性用于路由
     *
     * 此函数旨在根据实体的属性名称，动态地从实体对象中提取相应的属性值，
     * 并将其组织成一个新的对象返回这对于构建动态路由或者进行属性比较等操作非常有用
     *
     * @param {Object} entity - 需要提取属性的实体对象，包含properties属性，其中包含可动态提取的属性
     * @returns {Object} 返回一个新对象，该对象的属性和值根据entity.properties.propertyNames动态生成
     */
    extractDataForRouter(entity) {
      let properties = {};
      entity.properties.propertyNames.forEach(name => {
        properties[name] = entity.properties[name].getValue();
      });
      return properties;
    },

  }
}


</script>
<style scoped>

#cesiumContainer {
  height: calc(100vh - 106px);
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.pop_left_background {
  top: 11%;
  left: 1%;
  height: 77vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(90deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(44, 69, 94, 0) 100%);
}

.pop_right_background {
  top: 11%;
  right: 1%;
  height: 77vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

:deep(.timelineLegend) {
  width: 19vw;
  bottom: 12%;
}

:deep(.timelineLegend.open) {
  width: 33%;
  bottom: 8%;
  height: 82%;
}

:deep(.legend-item) {
  margin-bottom: 7px;
}

:deep(.distance-legend) {
  bottom: 1% !important;
}

:deep(.cesium-baseLayerPicker-dropDown-visible) {
  z-index: 100 !important;
  background-color: #2b323a;
}

:deep(.cesium-baseLayerPicker-dropDown) {
  right: 9px !important;
  width: 398px !important;
  height: 310px !important;
}
</style>
