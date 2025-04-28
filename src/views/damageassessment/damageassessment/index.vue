<template>
  <div>
    <div id="cesiumContainer" class="situation_cesiumContainer">
      <!--  小组件  -->
      <!--    <div class="layers">-->
      <!--      <div class="layer" title="雅安市行政区划" @click="toggleYaanLayer"><img src="../../../assets/images/DamageAssessment/yaanRegion.png"></div>-->
      <!--    </div>-->

      <!-- 左侧表单 -->
      <div class="eqTable" v-show="isLeftShow">

        <div class="eqListContent" v-if="thisTab === '震害事件'">
          <div class="eqTop">
            <!-- 搜索框 -->
            <el-input v-model="title" placeholder="请输入地震名称" class="query" @input="filterEq" clearable>
            </el-input>
          </div>
          <!-- 地震列表 -->
          <div class="eqList">
            <div v-for="eq in pagedEqData" :key="eq.eqid" class="eqCard" @click="toTab(eq)">
              <!-- 圆圈震级 -->
              <div style="width: 55px">
                <div class="eqMagnitude"
                     :style="{ backgroundColor: eq.magnitude >= 2.0 && eq.magnitude < 6.0 ? '#f0aa2e' : 'red' }">
                  {{ eq.magnitude }}
                </div>
              </div>

              <!-- 地震名称与简要信息 -->
              <div class="eqText">
          <span
            class="eqTitle">
            {{ timestampToTime(eq.occurrenceTime, 'date') }}{{ eq.earthquakeName }}{{ eq.magnitude }}级地震
          </span>
                <br/>
                <span style="color: #fff; font-size: 13px; display: inline-block; margin-top: 5px;">
            发震时刻：{{ timestampToTime(eq.occurrenceTime, "fullDateTime") }}<br/>
            参考位置：{{ eq.earthquakeName }}<br/>
            震中经纬：{{ eq.longitude }}°E, {{ eq.latitude }}°N<br/>
            震源深度：{{ eq.depth }}千米<br/>
                  地震类型：{{ eq.eqType === 'Z' ? '真实地震' : (eq.eqType === 'Y' ? '演练地震' : '测试地震') }}
          </span>
              </div>
              <!-- 详情按钮 -->
              <div class="eqTapToInfo" @click="toTab(eq)">详情</div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              small
              layout="total, prev, pager, next"
              :total="filteredEqData.length"
              :page-size="pageSize"
              :current-page.sync="currentPage"
              @current-change="handleCurrentChange"
              style="margin: 0 20px"
            />
          </div>
        </div>

        <!--   指定地震   -->
        <div class="thisEq" v-if="thisTab !== '震害事件' && selectedTabData">
          <div class="eqInfo">
            <div style="height: 30px;display: flex;align-items: center">
              <div class="button return" @click="back()">返回</div>
            </div>
            <div style="height: 10px;background-color: #054576"></div>
            <el-divider content-position="left">
              <!--            <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 15px; width: 15px;">-->
              地震信息
            </el-divider>
            <div style="padding: 1px 20px 10px 20px">
              <!-- 显示选项卡内容 -->
              <h4>地震名称：{{ selectedTabData.earthquakeName }}</h4>
              <p>发震时刻：{{ timestampToTime(selectedTabData.occurrenceTime, "fullDateTime") }}</p>
              <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
              <p>地震震级：{{ selectedTabData.magnitude }}级</p>
              <p>震源深度：{{ selectedTabData.depth }}千米</p>
              <p>参考位置：{{ selectedTabData.earthquakeName }}</p>
            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <el-divider content-position="left"> 地震专题</el-divider>

            <div class="eqTheme">
              <div class="button themes region"
                   :class="{ active: eqThemes.show.isshowRegion }"
                   @click="handleToggleYaanLayer"> 行政区划
              </div>
              <div class="button themes history" :class="{ active: eqThemes.show.isshowHistoryEqPoints }"
                   @click="showHistoryEqPoints()"> 历史地震
              </div>
              <div class="button themes faultZone" :class="{ active: eqThemes.show.isshowFaultZone }"
                   @click="showFaultZone()"> 断裂带
              </div>
              <div class="button themes circle" :class="{ active: eqThemes.show.isshowOvalCircle }"
                   @click="showOvalCircle()"> 烈度圈
              </div>
              <div class="button themes personDeath" :class="{ active: eqThemes.show.isshowPersonalCasualty }"
                   @click="showPersonalCasualty()"> 人员伤亡
              </div>
              <div class="button themes buildingDamage" :class="{ active: eqThemes.show.isshowBuildingDamage }"
                   @click="showBuildingDamage()"> 建筑破坏
              </div>
              <div class="button themes economicLoss" :class="{ active: eqThemes.show.isshowEconomicLoss }"
                   @click="showEconomicLoss()"> 经济损失
              </div>
              <div class="button themes hospital" :class="{ active: eqThemes.show.isshowHospital }"
                   @click="showHospital"> 医院
              </div>
              <div class="button themes school" :class="{ active: eqThemes.show.isshowVillage }"
                   @click="showVillage"> 村庄
              </div>
            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <el-divider content-position="left">大屏展示</el-divider>

            <div class="eqVisible">
              <div class="button toVisible" @click="navigateToVisualization(this.selectedTabData)"><img
                src="../../../assets/icons/svg/druid.svg" style="height: 25px;width: 25px;">可视化大屏展示
              </div>
            </div>

          </div>
        </div>

      </div>
      <div class="fold" :style="{ width: isFoldUnfolding ? '30px' : '10px' }" @mouseenter="isFoldUnfolding = true"
           @mouseleave="isFoldUnfolding = false" v-show="isFoldShow" @click="isLeftShow = false,isFoldShow = false">
        <img src="../../../assets/icons/TimeLine/收起展开箭头右.png" v-if="isFoldUnfolding"
             style="height: 60%;width: 60%;">
      </div>
      <div class="button unfold" v-show="isLeftShow === false" @click="isLeftShow=true,isFoldShow=true">
        <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 60%;width: 60%;cursor: pointer">
      </div>

      <!-- 底部面板(考虑代码差异性过大，设计成子组件形式) -->
      <div class="panel" v-if="eqPanel.isHistoryEqPanelShow">
        <historyEqPanel
          :eqData="eqData"
          :selectedTabData="selectedTabData"
          @flyTo="flyTo"
        />
      </div>

      <div class="panel" v-if="eqPanel.isBuildingDamagePanelShow">
        <buildingDamagePanel
          :buildingDamageData="panelData.buildingDamageData"
          :selectedTabData="selectedTabData"
        />
      </div>

      <div class="panel" v-if="eqPanel.isEconomicLossPanelShow">
        <economicLossPanel
          :economicLossData="panelData.economicLossData"
          :selectedTabData="selectedTabData"
        />
      </div>

      <div class="panel" v-if="eqPanel.isPersonalCasualtyPanelShow">
        <personalCasualtyPanel
          :personalCasualtyData="panelData.personalCasualtyData"
          :selectedTabData="selectedTabData"
        />
      </div>

      <div class="button showPanel" v-if="!eqPanel.isHistoryEqPanelShow && isShow"
           @click="unfoldInfo(this.currentTab)">
        展开专题详情
      </div>
    </div>

    <!--  断裂带名称div  -->
    <div id="faultInfo"
         style="position: absolute; display: none; background-color: #3d423f; border: 1px solid black; padding: 5px; color: #fff; z-index: 1; text-align: center;"></div>

    <!--  选项卡  -->
    <div class="tabs" v-if="shouldShowTabs">
      <div v-for="(tab, index) in tabs" :key="tab" class="tabItem"
           :class="{ active: currentTab === tab }" @click="changeTab(tab)">
        <span>{{ tab }}</span>
        <span class="closeIcon" @click.stop="removeTab(tab, index)">×</span>
      </div>

      <div class="hidden"
           style="float: right;width: 30px;height: 30px;border: #1f2d3d 2px solid;margin: 5px 338px 5px auto;display: flex;align-items: center;justify-content: center;color: #fff;font-size: 50px;cursor: pointer;"
           @click="hidden()"> -
      </div>
    </div>

    <plotInfoOnlyShowPanel
      v-show="popupVisible"
      :position="popupPosition"
      :eqThemeName="tableName"
      :eqThemeInfo="popupData"
    />

  </div>

</template>

<script>
import * as Cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "@/cesium/tool/initCesium.js";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import HistoryEqPanel from "../../../components/DamageAssessment/historyEqPanel.vue";
import PersonalCasualtyPanel from "../../../components/DamageAssessment/personalCasualtyPanel.vue";
import yaanCounty from "@/assets/geoJson/yaan1.json";
import yaanTown from "@/assets/geoJson/yaan.json";
import {
  addFaultZones,
  addHistoryEqPoints, addOCTest,
  addOvalCircles,
  computeOvalCircles,
  addHospitalLayer,
  handleTownData, removeDataSourcesLayer, timestampToTime, addVillageLayer
} from "../../../cesium/plot/eqThemes.js";
import BuildingDamagePanel from "../../../components/DamageAssessment/buildingDamagePanel.vue";
import {
  getEqList,
  getEqTownResult
} from "../../../api/system/damageassessment.js";
import EconomicLossPanel from "../../../components/DamageAssessment/economicLossPanel.vue";
import plotInfoOnlyShowPanel from "@/components/Panel/plotInfoOnlyShowPanel.vue";

import timeLine from "@/cesium/timeLine.js";
export default {
  components: {
    plotInfoOnlyShowPanel,
    PersonalCasualtyPanel,
    EconomicLossPanel,
    BuildingDamagePanel,
    HistoryEqPanel,
  },

  data() {
    return {
      isTerrainLoading: false,
      yaanLayerRequire: "",
      viewer: null,
      thisTab: "震害事件",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      eqData: [],
      filteredEqData: [],
      pagedEqData: [],

      selectedEntityPosition: '',
      selectedTabData: null,
      selectedEqPoint: null,
      historyEqPoints: [],

      title: "",
      isLeftShow: true,
      isFoldShow: true,
      isFoldUnfolding: false,
      isShow: false,

      faultzonelines: [],
      OvalCirclelayer: [],

      // 地震专题
      eqThemes: {
        allEles: [
          'historyEq',
          'faultZone',
          'ovalCircle',
          'economicLoss',
          'buildingDamage',
          'personalCasualty',
        ],
        layers: [
          'historyEq',
          'economicLoss',
          'buildingDamage',
          'personalCasualty',
          'ovalCircleTest',
          'faultZone'
        ],
        show: {
          isshowHistoryEqPoints: false,
          isshowRegion: false,
          isshowFaultZone: false,
          isshowOvalCircle: false,
          isshowPersonalCasualty: false,
          isshowBuildingDamage: false,
          isshowEconomicLoss: false,
          isshowHospital: false,
          isshowVillage: false,
        },
      },

      // 面板显隐
      eqPanel: {
        isHistoryEqPanelShow: false,
        isBuildingDamagePanelShow: false,
        isEconomicLossPanelShow: false,
        isPersonalCasualtyPanelShow: false
      },

      // 面板数据
      panelData: {
        economicLossData: [],
        buildingDamageData: [],
        personalCasualtyData: [],
      },

      PersonalCasualtyNum: 0,
      yaancasual: false,
      yaanitemcasual: [],

      //选项卡
      tabs: [],
      currentTab: "",

      // 列表地震
      listEqPoints: [],

      // 行政区划
      RegionLabels: [],
      sichuanRegionLabels: [],

      // 图层数据
      //经济损失economicLoss

      ecoLegendColor: [
        '(255, 234, 203)',
        '(255, 216, 173)',
        '(255, 198, 143)',
        '(254, 167, 88)',
        '(250, 148, 64)',
        '(245, 135, 38)',
        '(240, 120, 20)',
      ],

      //建筑破坏buildingDamage

      bddLegendColor: [
        '(232, 236, 248)',
        '(188, 197, 228)',
        '(114, 143, 199)',
        '(84, 127, 195)',
        '(55, 109, 185)',
        '(28, 96, 174)',
        '(0, 84, 165)',
      ],

      //人员伤亡personalCasualty

      pcLegendColor: [
        '(255, 255, 255, 0)',
        '(254, 204, 203)',
        '(255, 177, 167)',
        '(254, 151, 134)',
        '(253, 128, 106)',
        '(245, 101, 75)',
        '(240, 78, 53)',
        '(231, 50, 31)',
        '(218, 0, 0)',
      ],

      // 图层专题需要处理的数据
      layerData: {
        ecoData: {},
        bddData: {},
        pcData: {},
        ecoTownData: {},
        bddTownData: {},
        pcTownData: {},
      },

      // 映射
      tabMapping: {
        "历史地震": ['isHistoryEqPanelShow', 'isshowHistoryEqPoints', 'historyEq'],
        "建筑破坏": ['isBuildingDamagePanelShow', 'isshowBuildingDamage', 'buildingDamage', 'bddData', 'bddTownData'],
        "经济损失": ['isEconomicLossPanelShow', 'isshowEconomicLoss', 'economicLoss', 'ecoData', 'ecoTownData'],
        "人员伤亡": ['isPersonalCasualtyPanelShow', 'isshowPersonalCasualty', 'personalCasualty', 'pcData', 'pcTownData']
      },

      // 弹窗
      tableName: '',
      selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件

      //当前图层等级（区县/乡镇）
      currentLayer: '',
    };
  },

  mounted() {
    this.init();
    this.getEq();
    this.viewer = new Cesium.Viewer("cesiumContainer");
    this.addEventListeners();
  },

  computed: {
    // 选项卡显隐
    shouldShowTabs() {
      return Object.values(this.eqPanel).some(value => value);
    }
  },

  beforeUnmount() {
    console.log("111", window.viewer)
    if (window.viewer) {
      let viewer = window.viewer
      let gl = viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      console.log("webglcontext 已清除")
      gl = null
      window.viewer = null;
    }
  },

  methods: {
    timestampToTime,

    // 不知道为什么要在上面这里导入，可能是template里面的调用要这么搞？？？

    // 初始化要做的
    // -----------------------------------------------------------------------------------------------------------------
    addEventListeners() {
      viewer.camera.changed.addEventListener(this.handleCameraChange);
      // 延迟绑定事件，确保控件已经加载
      this.$nextTick(() => {
        const baseLayerContainer = document.querySelector(
          ".cesium-baseLayerPicker-dropDown"
        );

        if (baseLayerContainer) {
          // 事件代理监听点击事件
          baseLayerContainer.addEventListener("click", (event) => {
            const clickedIcon = event.target.closest(
              ".cesium-baseLayerPicker-itemIcon"
            );
            const clickedLabel = event.target.closest(
              ".cesium-baseLayerPicker-itemLabel"
            );

            if (clickedIcon || clickedLabel) {
              console.log("是否加载了地形图：", this.isTerrainLoaded())
              this.isTerrainLoading = this.isTerrainLoaded()
              this.toggleYaanLayer(this.yaanLayerRequire)
            }
          });
        }
      });
    },

    handleCameraChange() {
      const LAYER_HEIGHT_EDGE = 200000; // 区县与乡镇级图层的高度边界
      const height = viewer.camera.positionCartographic.height; // 获取相机高度
      // console.log(height);

      // 判断是否需要切换图层
      if (height >= LAYER_HEIGHT_EDGE && this.currentLayer !== 'county') {
        this.currentLayer = 'county'; // 更新状态
        this.toggleYaanLayer('county'); // 切换到区县图层
      } else if (height < LAYER_HEIGHT_EDGE && this.currentLayer !== 'town') {
        this.currentLayer = 'town'; // 更新状态
        this.toggleYaanLayer('town'); // 切换到乡镇图层
      }
    },

    // 获取地震列表并渲染
    getEq() {
      const eqListDTO = {
        pageNum: 1,
        pageSize: 10,
      }
      getEqList(eqListDTO).then((res) => {
        // console.log(res)
        let resData = res.data.filter(item =>
            item.earthquakeName.includes("雅安") || Number(item.magnitude) >= 4
        )
        console.log("灾损过滤后4.0", resData)
        let data = resData.map((item) => ({
          ...item,
          occurrenceTime: timestampToTime(item.occurrenceTime, "full"),
          magnitude: Number(item.magnitude).toFixed(1),
          latitude: Number(item.latitude).toFixed(2),
          longitude: Number(item.longitude).toFixed(2),
        }));
        this.eqData = data;
        this.filteredEqData = data;
        this.updatePagedEqData();
        // console.log("data:", data)
      });
    },

    // 初始化Cesium
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

      this.initMouseEvents();
    },

    // 注册鼠标事件监听
    initMouseEvents() {
      const faultInfoDiv = document.getElementById('faultInfo');
      // 鼠标点击事件
      window.viewer.screenSpaceEventHandler.setInputAction((click) => {
        let pickedObject = window.viewer.scene.pick(click.position);
        window.selectedEntity = pickedObject?.id;
        this.selectedEntityPosition = this.calculatePosition(click.position);
        console.log(pickedObject,"拾取点")

        if(Cesium.defined(pickedObject)){
          // 如果是历史地震点
          if (pickedObject.id._layer && pickedObject.id._layer === '历史地震') {
            pickedObject.id.label._show._value = !pickedObject.id.label._show._value;
            this.popupVisible = false;
          }
          //医院或村庄
          else if(pickedObject.id._properties.sourceName&&(pickedObject.id._properties.sourceName === "hospital" || pickedObject.id._properties.sourceName === "village")) {
              let ray = viewer.camera.getPickRay(click.position);
              let position = viewer.scene.globe.pick(ray, viewer.scene);
              let cartographic = Cesium.Cartographic.fromCartesian(position);
              let latitude = Cesium.Math.toDegrees(cartographic.latitude);
              let longitude = Cesium.Math.toDegrees(cartographic.longitude);

              // 如果有地形加载，更新高度
              let height = 0;
              if (this.isTerrainLoaded()) {
                height = viewer.scene.globe.getHeight(cartographic);
              }
              this.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
              const properties = pickedObject.id._properties;
              const sourceName = properties.sourceName;

              // 如果是医院点
              if (sourceName === "hospital") {
                this.tableName = "医院信息";
                this.popupData = {
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
              }
              // 如果是村庄点
              else if (sourceName === "village") {
                console.log(properties,"properties 村庄")
                this.tableName = "村庄信息";


                this.popupData = {
                  "名称": properties._O_Name._value,
                  "地理位置": "经度: " +  properties._O_Lng._value.toFixed(2) + "°E, 纬度: " + properties._O_Lat._value.toFixed(2) + "°N",
                }
                // console.log()
                const lines = properties._O_Com._value.split("\n");
                lines.forEach((line) => {
                  const [key, value] = line.split("：");
                  // 过滤掉不需要的键值对
                  if (key.trim() !== "统计用区划代码" && key.trim() !== "城乡分类代码") {
                    // 将键值对存储到 parsedData 对象中
                    this.popupData[key.trim()] = value.trim();
                  }
                });
              }
            console.log(this.popupData)
              this.popupVisible = true;
              this.updatePopupPosition();
            }
          //其他情况关闭其他弹框
          else {
            this.popupVisible = false;
            if (this.selectedEqPoint) {
              this.selectedEqPoint.label._show._value = false;
            }
            this.listEqPoints.forEach(entity => {
              entity.label._show._value = false;
            });
            this.historyEqPoints.forEach(entity => {
              entity.label._show._value = false;
            });
            // 隐藏 faultInfoDiv
            faultInfoDiv.style.display = 'none';
          }
        }
        // !Cesium.defined(pickedObject) 如果点击其他位置，隐藏所有地震点的标签，并关闭 faultInfoDiv
        else {
          this.popupVisible = false;
          if (this.selectedEqPoint) {
            this.selectedEqPoint.label._show._value = false;
          }
          this.listEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
          this.historyEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
          // 隐藏 faultInfoDiv
          faultInfoDiv.style.display = 'none';
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      //鼠标移动事件
      window.viewer.screenSpaceEventHandler.setInputAction((movement) => {
        // 鼠标移动时设置指针样式
        const pickedObject = window.viewer.scene.pick(movement.endPosition);
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
        // 确保在地图拖动时弹窗位置更新
        if (this.popupVisible && window.selectedEntity) {
          this.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      // 确保在地图拖动时弹窗位置更新
      // window.viewer.screenSpaceEventHandler.setInputAction(movement => {
      //   if (this.popupVisible && window.selectedEntity) {
      //     this.updatePopupPosition();
      //   }
      // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      // Enable depth testing so things behind the terrain disappear.
      viewer.scene.globe.depthTestAgainstTerrain = true;
    },

    // 地图渲染查询地震点(根据页码、根据搜索框)
    renderQueryEqPoints() {
      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = [];
      this.pagedEqData.forEach(eq => {
        const entity = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude)),
          billboard: {
            image: eqMark,
            width: 20,
            height: 20,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
          },
          label: {
            text: timestampToTime(eq.occurrenceTime, 'date') + eq.earthquakeName + eq.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            show: false,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: eq.eqid,
        });
        this.listEqPoints.push(entity);
      });
    },

    // 雅安行政区划
    toggleYaanLayer(require) {
      // console.log(111)
      this.removeLayers(['YaanCounty', 'YaanTown'])
      this.RegionLabels.forEach(label => {
        window.viewer.entities.remove(label);
      });
      this.RegionLabels = [];
      if (require === "county") {
        this.yaanLayerRequire = require
        // console.log("1123", this.yaanLayerRequire)
        this.eqThemes.show.isshowRegion = true;
        let geoPromise = Cesium.GeoJsonDataSource.load(yaanCounty, {
          // clampToGround: true, //贴地显示
          clampToGround: false, //贴地显示
          stroke: Cesium.Color.YELLOW,
          strokeWidth: 4,
        });
        geoPromise.then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          dataSource.name = 'YaanCounty';
          // 遍历 GeoJSON 的每个 feature
          yaanCounty.features.forEach((feature) => {

            // 获取第一个多边形的所有顶点
            const firstPolygon = feature.geometry.coordinates[0]; // 第一个多边形
            const firstRing = firstPolygon[0]; // 第一个多边形的外环

            // 将经纬度转换为 Cartesian3 数组
            const positions = firstRing.map(vertex => {
              return Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]);
            });

            // 计算多边形的质心
            let centroid = Cesium.Cartesian3.ZERO;
            positions.forEach(pos => {
              centroid = Cesium.Cartesian3.add(centroid, pos, new Cesium.Cartesian3());
            });

            centroid = Cesium.Cartesian3.divideByScalar(centroid, positions.length, new Cesium.Cartesian3());

            // 创建一个新的 Entity 并添加 label
            let entity = window.viewer.entities.add(new Cesium.Entity({
              position: centroid,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name || 'Default Name', // 如果没有 name 属性，使用默认名称
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                clampToGround: true,
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0, 0, -10000),
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000),
              })
            }));
            this.RegionLabels.push(entity);
          });





          //雅安行政区加载 end
        })
      } else if (require === "town") {

        // 乡镇级
        this.yaanLayerRequire = require
        // console.log("1123", this.yaanLayerRequire)
        this.eqThemes.show.isshowRegion = true;
        let geoPromise = Cesium.GeoJsonDataSource.load(yaanTown, {
          clampToGround: false, //贴地显示
          stroke: Cesium.Color.ORANGE,
          fill: Cesium.Color.WHITE.withAlpha(0.0),
          strokeWidth: 4,
        });
        geoPromise.then((dataSource) => {
          window.viewer.dataSources.add(dataSource);
          dataSource.name = 'YaanTown';
          // 遍历 GeoJSON 的每个 feature
          yaanTown.features.forEach((feature) => {
            // console.log(feature.properties.name)
            // 获取第一个多边形的所有顶点
            const firstPolygon = feature.geometry.coordinates[0]; // 第一个多边形
            const firstRing = firstPolygon[0]; // 第一个多边形的外环

            // 将经纬度转换为 Cartesian3 数组
            const positions = firstRing.map(vertex => {
              return Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]);
            });

            // 计算多边形的质心
            let centroid = Cesium.Cartesian3.ZERO;
            positions.forEach(pos => {
              centroid = Cesium.Cartesian3.add(centroid, pos, new Cesium.Cartesian3());
            });

            centroid = Cesium.Cartesian3.divideByScalar(centroid, positions.length, new Cesium.Cartesian3());

            // 创建一个新的 Entity 并添加 label
            let entity = window.viewer.entities.add(new Cesium.Entity({
              position: centroid,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name || 'Default Name', // 如果没有 name 属性，使用默认名称
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                clampToGround: true,
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0, 0, -10000),
                // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000),
              })
            }));
            this.RegionLabels.push(entity);
          });
          //雅安行政区加载 end
        })

      } else if (require === "remove") {
        this.yaanLayerRequire = require;
        // console.log("1123", this.yaanLayerRequire)
        this.eqThemes.show.isshowRegion = false;
        this.removeLayers(['YaanRegionLayer']);


      }
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 分页查询区块
    // -----------------------------------------------------------------------------------------------------------------

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
    },

    // 分页数据更新
    updatePagedEqData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      this.pagedEqData = this.filteredEqData.slice(start, end);

      // 清除之前的点并重新添加
      // viewer.entities.removeAll();
      this.toggleYaanLayer("county")
      this.renderQueryEqPoints();
    },

    // 模糊匹配地震时间、位置和震级
    filterEq() {
      if (this.title) {
        this.filteredEqData = this.eqData.filter((eq) => {
          const dateStr = timestampToTime(eq.occurrenceTime, 'date');
          const positionStr = eq.earthquakeName;
          const magnitudeStr = eq.magnitude;
          return (
            dateStr.includes(this.title) ||
            positionStr.includes(this.title) ||
            magnitudeStr.includes(this.title)
          );
        });
      } else {
        this.filteredEqData = this.eqData;
      }
      this.currentPage = 1;
      this.updatePagedEqData();
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 面板模块
    // -----------------------------------------------------------------------------------------------------------------

    // 选中列表地震后：右侧面板模块

    // 切换到对应面板
    toTab(eq) {
      this.thisTab = `${eq.earthquakeName} ${eq.magnitude}级地震`;

      /**
       *  下面的
       *  "T2024110313362251182600"
       *  需要改成传eq.eqid
       *  并且需要改后端调用的接口
       */

      const eqTownResultDTO = {
        eqid: eq.eqid,
        eqqueueId: eq.eqqueueId
      }

      console.log(eqTownResultDTO)

      getEqTownResult(eqTownResultDTO).then((res) => {
        const resultData = handleTownData(res.data)
        console.log("handleTownData resultData",resultData)
        // 提取对应专题数据
        this.panelData.buildingDamageData = resultData.buildingDamageData
        this.panelData.economicLossData = resultData.economicLossData
        this.panelData.personalCasualtyData = resultData.personalCasualtyData

        this.layerData.bddTownData = resultData.townBuildingDamage.reduce((acc, curr) => {
          acc[curr.town] = curr.size;
          return acc;
        }, {});
        this.layerData.ecoTownData = resultData.townEconomicLoss.reduce((acc, curr) => {
          acc[curr.town] = curr.amount;
          return acc;
        }, {});
        this.layerData.pcTownData = JSON.parse(JSON.stringify(
          resultData.townPersonalCasualty.reduce((acc, curr) => {
            acc[curr.town] = curr.partTotal;
            return acc;
          }, {})
        ));

        console.log(this.layerData.bddTownData)
        console.log(this.layerData.pcTownData)
        console.log(this.layerData.ecoTownData)

      });
      if (this.thisTab !== '震害事件') {

        // 查找与选项卡名称匹配的地震数据
        this.selectedTabData = this.eqData.find(
          eq => `${eq.earthquakeName} ${eq.magnitude}级地震` === this.thisTab
        );
        // 如果找到对应数据，调用定位函数
        if (this.selectedTabData) {
          this.selectEqPoint();
        }
      }
    },

    selectEqPoint() {
      if (this.selectedTabData) {
        this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
        this.listEqPoints = [];

        // 避免选择同一选项卡时重复生成实体导致重叠
        window.viewer.entities.remove(this.selectedEqPoint);

        // 提取 selectedEqPoint
        this.selectedEqPoint = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            Number(this.selectedTabData.longitude),
            Number(this.selectedTabData.latitude)
          ),
          billboard: {
            image: eqMark,
            width: 25,
            height: 25,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          },
          label: {
            text: timestampToTime(this.selectedTabData.occurrenceTime, 'date') +
              this.selectedTabData.earthquakeName +
              this.selectedTabData.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            showBackground: true,
            show: true,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: this.selectedTabData.id
        });
        timeLine.fly(Number(this.selectedTabData.longitude), Number(this.selectedTabData.latitude), 200000)
      }
    },


    pickEqPoint(eq) {
      this.listEqPoints.forEach(entity => {
        entity.label._show._value = entity._id === eq.eqid;
      })
    },

    // 选中图层专题后：选项卡模块

    // 添加新选项卡changeTab
    addTab(panel) {
      this.tabs.push(panel)
      this.changeTab(panel);
    },

    // 切换选项卡
    changeTab(tabName) {
      // 将中文 tab 映射到相应的数据和图层类型
      const tabMapping = {
        '经济损失': {data: this.layerData.ecoData, type: "economicLoss", townData: this.layerData.ecoTownData},
        '建筑破坏': {data: this.layerData.bddData, type: "buildingDamage", townData: this.layerData.bddTownData},
        '人员伤亡': {data: this.layerData.pcData, type: "personalCasualty", townData: this.layerData.pcTownData}
      };

      this.currentTab = tabName;
      // 根据 tabName 加载对应的图层数据和类型
      if (tabMapping[tabName]) {
        this.addThemeLayer(tabMapping[tabName].data, tabMapping[tabName].townData, tabMapping[tabName].type);
      }

      const tab = this.transferTab(tabName)[0];
      // 如果 tabs 中包含该 tabName，打开对应面板，否则添加 tab
      if (this.tabs.includes(tabName)) {
        this.eqPanel[tab] = true;
      } else {
        this.addTab(tabName);
      }

      // 关闭其他面板，保留当前 tab 面板
      Object.keys(this.eqPanel).forEach(key => {
        this.eqPanel[key] = (key === tab);
      });
    },

    // 删除选项卡
    removeTab(tabName, index) {
      const [panel, info, layerType, dataKey] = this.transferTab(tabName);

      // console.log(this.transferTab(tabName));

      if (tabName in this.tabMapping) {
        // 通过映射对象清理对应数据
        this.layerData[dataKey] = {};
        this.removeEntitiesByType([layerType]);
        this.removeLayers([layerType]);
      }

      // 多个：删除当前选项卡
      if (this.currentTab === this.tabs[index] && this.tabs.length !== 1) {

        this.eqPanel[panel] = false;
        this.eqThemes.show[info] = false;

        const nextTabIndex = this.tabs[index - 1] ? index - 1 : index + 1;
        this.currentTab = this.tabs[nextTabIndex];
        const [nextPanel, , nextLayer, nextData, nextTownData] = this.transferTab(this.currentTab);

        this.eqPanel[nextPanel] = true;
        this.addThemeLayer(this.layerData[nextData], this.layerData[nextTownData], nextLayer);

      }
      // 多个：删除的不是当前选项卡
      else if (this.tabs.length !== 1 && this.currentTab !== this.tabs[index]) {

        this.eqThemes.show[info] = false;
      }
      // 单个：删除最后的选项卡
      else if (this.tabs.length === 1) {
        this.eqPanel[panel] = false;
        this.eqThemes.show[info] = false;
        this.toggleYaanLayer('county');
      }

      // 移除选项卡
      this.tabs.splice(index, 1);
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 功能按钮区块
    // -----------------------------------------------------------------------------------------------------------------

    // 选中地震后返回
    back() {
      this.toggleYaanLayer('remove')
      this.tabs = []
      this.thisTab = '震害事件';
      this.selectedTabData = null;
      this.PersonalCasualtyNum = 0;
      this.yaancasual = false;
      this.yaanitemcasual = [];

      this.layerData = {
        ecoData: {},
        bddData: {},
        pcData: {},
        ecoTownData: {},
        bddTownData: {},
        pcTownData: {}
      }

      const faultInfoDiv = document.getElementById('faultInfo');
      faultInfoDiv.style.display = 'none';

      // this.removeEntitiesByType(["historyEq", "faultZone", "ovalCircleTest"])
      // this.removeLayers(["ovalCircleTest"]);
      this.renderLayer("", true)

      const setValues = (obj, value) => {
        Object.keys(obj).forEach(key => {
          obj[key] = value;
        });
      };
      setValues(this.eqThemes.show, false);
      setValues(this.eqPanel, false);
      setValues(this.panelData, []);

      this.toggleYaanLayer('county')
      this.renderQueryEqPoints()
      //视角回雅安
      const position = Cesium.Cartesian3.fromDegrees(
        103.0,
        29.98,
        500000
      );
      viewer.camera.flyTo({destination: position})
    },

    flyTo(lonAndLat, eqid) {
      const position = Cesium.Cartesian3.fromDegrees(
        lonAndLat[0],
        lonAndLat[1],
        10000
      );
      viewer.camera.flyTo({destination: position});

      let historyEntities = viewer.entities.values.filter(entity => {
        const type = entity.properties?.type?.getValue(); // 获取 properties.type 的值
        return type === "historyEq"; // 过滤出 type 为 historyEq 的实体
      });

      // console.log(666, eqid)

      for (let i = historyEntities.length - 1; i >= 0; i--) {
        if (historyEntities[i]._billboard !== undefined) {
          historyEntities[i]._label._show._value = historyEntities[i]._id === eqid;
          console.log(historyEntities[i]._id)
          if (historyEntities[i]._id === eqid) {
            // console.log(555)
          }
        }
      }
    },

    // 跳转至指挥大屏
    navigateToVisualization(thisEq) {
      const path = `/thd?eqid=${thisEq.eqid}&eqqueueId=${thisEq.eqqueueId}`;
      window.open(path, '_blank');
    },

    // 专题面板最小化
    hidden() {
      Object.keys(this.eqPanel).forEach(panel => {
        this.eqPanel[panel] = false;
      });
      this.isShow = true;
    },

    // 专题面板展开
    unfoldInfo(currentTab) {
      const tab = this.transferTab(currentTab)[0]
      this.eqPanel[tab] = true;
      this.isShow = false;
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 地震专题与渲染(图层专题需要在 工具函数 addThemeLayer() 中处理)
    // -----------------------------------------------------------------------------------------------------------------


    // 历史地震(半径50km以内)
    showHistoryEqPoints() {
      const tabName = "历史地震"

      if (!this.tabs.includes('历史地震')) {
        this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
        this.eqThemes.show.isshowHistoryEqPoints = true; // 切换状态
        this.eqPanel.isHistoryEqPanelShow = true;

        if (this.eqThemes.show.isshowHistoryEqPoints) {
          this.addTab(tabName)
        } else {
          this.removeEntitiesByType(["historyEq"]); // 切换为隐藏时，移除历史地震
        }
      } else {
        this.renderQueryEqPoints()
        this.removeEntitiesByType(["historyEq"]); // 切换为隐藏时，移除历史地震
        const index = this.tabs.indexOf(tabName);
        this.removeTab(tabName, index)
      }
    },

    // 断裂带(半径200km以内)
    showFaultZone() {
      this.eqThemes.show.isshowFaultZone = !this.eqThemes.show.isshowFaultZone;
      if (this.eqThemes.show.isshowFaultZone) {
        addFaultZones(this.selectedTabData)
      } else {
        removeDataSourcesLayer('faultZone');
        const faultInfoDiv = document.getElementById('faultInfo');
        faultInfoDiv.style.display = 'none';
      }
    },
    // 医院
    showHospital() {
      this.eqThemes.show.isshowHospital = !this.eqThemes.show.isshowHospital;
      if (this.eqThemes.show.isshowHospital) {
        addHospitalLayer()
      } else {
        removeDataSourcesLayer('hospital');
      }
    },

    // 村庄
    showVillage() {
      this.eqThemes.show.isshowVillage = !this.eqThemes.show.isshowVillage;
      if (this.eqThemes.show.isshowVillage) {
        addVillageLayer()
      } else {
        removeDataSourcesLayer('village');
      }
    },

    // 烈度圈
    showOvalCircle() {
      this.eqThemes.show.isshowOvalCircle = !this.eqThemes.show.isshowOvalCircle;
      if (this.eqThemes.show.isshowOvalCircle) {
        const centerPosition = [parseFloat(this.selectedTabData.longitude), parseFloat(this.selectedTabData.latitude)];
        addOCTest(this.selectedTabData.eqid, this.selectedTabData.eqqueueId, centerPosition)
      } else {
        this.removeLayers(["ovalCircleTest"])
        this.removeEntitiesByType(["ovalCircleTest"]);
      }
    },

    // 建筑破坏
    showBuildingDamage() {
      const tabName = "建筑破坏";
      const type = "buildingDamage";
      this.eqThemes.show.isshowBuildingDamage = !this.eqThemes.show.isshowBuildingDamage;

      if (this.eqThemes.show.isshowBuildingDamage) {
        this.addTab(tabName);

        // console.log("建筑破坏数据：", this.panelData.buildingDamageData)
        this.layerData.bddData = this.panelData.buildingDamageData.reduce((acc, item) => {
          acc[item.county] = item.size;
          return acc;
        }, {});

        this.addThemeLayer(this.layerData.bddData, this.layerData.bddTownData, type);

        if (this.eqThemes.show.isshowRegion) {
          this.toggleYaanLayer(this.currentLayer);
        }

      } else {
        const index = this.tabs.indexOf(tabName);
        this.removeTab(tabName, index);
        this.removeLayers([type]);
        this.removeEntitiesByType([type]);
        this.layerData.bddData = {};
        if (!this.eqThemes.show.isshowEconomicLoss && !this.eqThemes.show.isshowBuildingDamage && !this.eqThemes.show.isshowPersonalCasualty && this.eqThemes.show.isshowRegion && this.tabs.length > 0) {
          this.toggleYaanLayer(this.currentLayer);
        }
      }
    },

    // 经济损失
    showEconomicLoss() {
      const tabName = "经济损失";
      const type = "economicLoss";
      this.eqThemes.show.isshowEconomicLoss = !this.eqThemes.show.isshowEconomicLoss;

      if (this.eqThemes.show.isshowEconomicLoss) {
        this.addTab(tabName);

        console.log("经济损失数据：", this.panelData.economicLossData)

        // 将经济损失数据整理为适合的格式
        this.layerData.ecoData = this.panelData.economicLossData.reduce((acc, item) => {
          acc[item.county] = item.amount;
          return acc;
        }, {});

        // 添加主题图层并等待其完成
        this.addThemeLayer(this.layerData.ecoData, this.layerData.ecoTownData, type);

        console.log(this.layerData.ecoData)

        if (this.eqThemes.show.isshowRegion) {
          this.toggleYaanLayer(this.currentLayer);
        }
      } else {
        const index = this.tabs.indexOf(tabName);
        this.removeTab(tabName, index);
        this.removeLayers([type]);
        this.removeEntitiesByType([type]);
        this.layerData.ecoData = {};
        if (!this.eqThemes.show.isshowEconomicLoss && !this.eqThemes.show.isshowBuildingDamage && !this.eqThemes.show.isshowPersonalCasualty && this.eqThemes.show.isshowRegion && this.tabs.length > 0) {
          this.toggleYaanLayer(this.currentLayer);
        }
      }
    },

    // 人员伤亡评估
    showPersonalCasualty() {
      const tabName = "人员伤亡";
      const type = "personalCasualty";
      this.eqThemes.show.isshowPersonalCasualty = !this.eqThemes.show.isshowPersonalCasualty;
      if (this.eqThemes.show.isshowPersonalCasualty) {
        this.addTab(tabName);

        // // 将人员伤亡数据整理为适合的格式
        this.layerData.pcData = JSON.parse(JSON.stringify(
          this.panelData.personalCasualtyData.reduce((acc, item) => {
            acc[item.county] = item.partTotal;
            return acc;
          }, {})
        ));

        // console.log(111, this.layerData.pcData);

        // 添加主题图层并等待其完成
        this.addThemeLayer(this.layerData.pcData, this.layerData.pcTownData, type)
        if (this.eqThemes.show.isshowRegion) {
          this.toggleYaanLayer(this.currentLayer);
        }

      } else {
        const index = this.tabs.indexOf(tabName);
        this.removeTab(tabName, index);
        this.removeLayers([type]);
        this.removeEntitiesByType([type]);
        this.layerData.pcData = {};
        if (!this.eqThemes.show.isshowEconomicLoss && !this.eqThemes.show.isshowBuildingDamage && !this.eqThemes.show.isshowPersonalCasualty && this.eqThemes.show.isshowRegion && this.tabs.length > 0) {
          this.toggleYaanLayer(this.currentLayer);
        }
      }
    },

    //
    // -----------------------------------------------------------------------------------------------------------------
    // 工具函数
    // -----------------------------------------------------------------------------------------------------------------

    // 检查条件并调用相应的 toggleYaanLayer 方法
    handleToggleYaanLayer() {
      const {isshowPersonalCasualty, isshowBuildingDamage, isshowEconomicLoss, isshowRegion} = this.eqThemes.show;
      if (isshowRegion) {
        this.toggleYaanLayer('remove');
      } else if (isshowPersonalCasualty || isshowBuildingDamage || isshowEconomicLoss) {
        this.toggleYaanLayer('county');
      } else {
        this.toggleYaanLayer('county');
      }
    },

    // 10.6 渲染图层
    addThemeLayer(layerData, layerTownData, type) {

      console.log(layerTownData)

      this.removeEntitiesByType([type]);
      this.removeLayers([type]);
      this.renderLayer("", true);

      const themeData = this.currentLayer === 'county' ? layerData : layerTownData;

      if (themeData === layerData) {
        const entries = Object.entries(themeData);
        const counties = entries.map(([key]) => key);
        const numbers = entries.map(([, value]) => value);
        const layerName = `${type}`;

        // 加载 yaanCounty.json 数据
        Cesium.GeoJsonDataSource.load(yaanCounty, {
            clampToGround: true,
          }
        ).then((geoJsonDataSource) => {
          viewer.dataSources.add(geoJsonDataSource);
          geoJsonDataSource.name = layerName;

          const entities = geoJsonDataSource.entities.values;

          entities.forEach((entity) => {
            const countyName = entity.name;

            // 如果县区存在于传入的 themeData 中
            if (counties.includes(countyName)) {
              const index = counties.indexOf(countyName);
              const number = numbers[index];

              let colorIndex, legendColorArray;

              // 根据不同的图层类型计算颜色索引
              if (type === 'economicLoss') {
                colorIndex = this.getColorIndex(number, this.ecoLegendColor, [10000, 50000, 100000, 200000, 500000, 1000000]);
                legendColorArray = this.ecoLegendColor;
              } else if (type === 'buildingDamage') {
                colorIndex = this.getColorIndex(number, this.bddLegendColor, [0.1, 0.5, 1, 2, 5, 10]);
                legendColorArray = this.bddLegendColor;
              } else if (type === 'personalCasualty') {
                if (number < 1) {
                  this.setPolygonTransparent(entity);
                  return;
                }
                colorIndex = this.getColorIndex(number, this.pcLegendColor, [1, 5, 10, 20, 50, 100, 250, 500]);
                legendColorArray = this.pcLegendColor;
              }

              // 设置填充颜色和边框
              this.setPolygonColor(entity, legendColorArray[colorIndex]);
              // 添加标签
              // this.addRegionLabel(entity, countyName, type);
            } else {
              // 如果县区不在 themeData 中，设置为透明并隐藏边线
              this.setPolygonTransparent(entity);
            }
          });

          this.renderLayer(type, false);
        });
      }

      else if (themeData === layerTownData) {
        const entries = Object.entries(themeData);
        const towns = entries.map(([key]) => key);
        const numbers = entries.map(([, value]) => value);
        const layerName = `${type}`;

        // 加载 yaanCounty.json 数据
        Cesium.GeoJsonDataSource.load(yaanTown, {
            clampToGround: true,
          }
        ).then((geoJsonDataSource) => {
          viewer.dataSources.add(geoJsonDataSource);
          geoJsonDataSource.name = layerName;

          const entities = geoJsonDataSource.entities.values;

          entities.forEach((entity) => {
            const townName = entity.name;

            // 如果县区存在于传入的 themeData 中
            if (towns.includes(townName)) {
              const index = towns.indexOf(townName);
              const number = numbers[index];

              let colorIndex, legendColorArray;

              // 根据不同的图层类型计算颜色索引
              if (type === 'economicLoss') {
                colorIndex = this.getColorIndex(number, this.ecoLegendColor, [10000, 50000, 100000, 200000, 500000, 1000000]);
                legendColorArray = this.ecoLegendColor;
              } else if (type === 'buildingDamage') {
                colorIndex = this.getColorIndex(number, this.bddLegendColor, [0.1, 0.5, 1, 2, 5, 10]);
                legendColorArray = this.bddLegendColor;
              } else if (type === 'personalCasualty') {
                if (number < 1) {
                  this.setPolygonTransparent(entity);
                  return;
                }
                colorIndex = this.getColorIndex(number, this.pcLegendColor, [1, 5, 10, 20, 50, 100, 250, 500]);
                legendColorArray = this.pcLegendColor;
              }

              // 设置填充颜色和边框
              this.setPolygonColor(entity, legendColorArray[colorIndex]);
              // 添加标签
              // this.addRegionLabel(entity, townName, type);
            } else {
              // 如果县区不在 themeData 中，设置为透明并隐藏边线
              this.setPolygonTransparent(entity);
            }
          });

          this.renderLayer(type, false);
        });
      }
    },

    // 获取颜色索引
    getColorIndex(number, legendColor, threshold) {
      for (let i = 0; i < threshold.length; i++) {
        if (number < threshold[i]) return i;
      }
      // 超过最大阈值，使用最后一个颜色
      return legendColor.length - 1;
    },

    // 设置填充颜色和边框
    setPolygonColor(entity, colorString) {
      const rgb = this.getRgbFromColorString(colorString);
      entity.polygon.material = Cesium.Color.fromBytes(rgb[0], rgb[1], rgb[2], 150);
      entity.polygon.outline = true;
      entity.polygon.outlineColor = Cesium.Color.WHITE;
    },

    // 将字符串颜色解析为 RGB 数组
    getRgbFromColorString(colorString) {
      return colorString
        .replace('(', '')
        .replace(')', '')
        .split(',')
        .map((c) => parseInt(c.trim()));
    },

    // 设置为透明
    setPolygonTransparent(entity) {
      entity.polygon.material = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0);
      entity.polygon.outline = false;
    },


    // 将中文转化成对应要用的属性，[0]为控制对应底部面板展示，[1]为控制对应右侧信息展示，[2]为图层专题名，[3]为专题数据
    // 目前使用映射处理，如果有新增，请先在this.tabMapping处注册
    transferTab(tabName) {
      return this.tabMapping[tabName] || [];
    },

    // 更新 faultInfo 的位置
    updateFaultInfoPosition(faultName) {
      this.$nextTick(() => {
        if (this.selectedEntityPosition) {
          const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            window.viewer.scene,
            Cesium.Cartesian3.fromDegrees(this.selectedEntityPosition.x, this.selectedEntityPosition.y, this.selectedEntityPosition.z)
          );
          if (canvasPosition) {
            const faultInfoDiv = document.getElementById('faultInfo');
            faultInfoDiv.style.left = canvasPosition.x + 'px';
            faultInfoDiv.style.top = canvasPosition.y + 'px';
            faultInfoDiv.innerHTML = `${faultName}`;
          }
        }
      });
    },

    // 计算点击位置的经纬度
    calculatePosition(clickPosition) {
      let ray = viewer.camera.getPickRay(clickPosition);
      let position = viewer.scene.globe.pick(ray, viewer.scene);
      let cartographic = Cesium.Cartographic.fromCartesian(position);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude);
      let height = this.isTerrainLoaded() ? viewer.scene.globe.getHeight(cartographic) : 0;

      return {
        x: longitude,
        y: latitude,
        z: height
      };
    },

    // 判断地形是否加载完毕
    isTerrainLoaded() {
      let terrainProvider = window.viewer.terrainProvider;
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        return true;
      }
      return false;
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 公用函数
    // -----------------------------------------------------------------------------------------------------------------

    //根据类型移除实体
    removeEntitiesByType(types) {
      let entities = window.viewer.entities.values;
      for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].properties?.type && types.includes(entities[i].properties.type.getValue())) {
          window.viewer.entities.remove(entities[i]);
        }
      }
    },

    // 专门用来移除指定图层
    removeLayers(layersToRemove) {
      // layersToRemove 是一个数组
      layersToRemove.forEach(layerName => {
        // 获取所有与 layerName 匹配的 DataSource
        let matchingLayers = window.viewer.dataSources._dataSources.filter(layer => layer._name === layerName);
        // 遍历匹配的 DataSource 并删除
        matchingLayers.forEach(layer => {
          window.viewer.dataSources.remove(layer);
        });
      });
    },

    // 专门用来渲染指定图层，同时去掉（隐藏/销毁）其他图层
    renderLayer(layerToRender, flag) {
      // layerToRender 是一个变量
      const layersToRemove = this.eqThemes.layers.filter(layer => layer !== layerToRender);
      if (flag) {
        this.removeLayers(layersToRemove);
        this.removeEntitiesByType(layersToRemove)
      }

    },

    // 更新弹窗的位置
    updatePopupPosition() {
      // 笛卡尔3转笛卡尔2（屏幕坐标）
      const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        window.viewer.scene,
        this.selectedEntityHighDiy
      );
      if (canvasPosition) {
        this.popupPosition = {
          x: canvasPosition.x, //+ 20,
          y: canvasPosition.y, //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
      }
    },

    // 时间戳转换已移至eqTheme.js
    // -----------------------------------------------------------------------------------------------------------------

  }
};

</script>

<style scoped lang="less">
.situation_cesiumContainer {
  height: calc(100vh - 50px) !important;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

// 左侧地震面板
.eqTable {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 333px;
  height: calc(100% - 50px);
  z-index: 3;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

.closeIcon {
  margin-left: 10px;
  cursor: pointer;
}

// 开关
.fold {
  position: absolute;
  top: 50px;
  right: 333px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 50px;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
  -webkit-border-top-left-radius: 10px;
  -webkit-border-bottom-left-radius: 10px;
  cursor: pointer;
  z-index: 4;
  transition: width 0.3s ease; /* 宽度过渡动画 */
}

.unfold {
  position: absolute;
  top: 50px;
  right: 0;
  width: 30px;
  height: 40px;
  background-color: rgba(48, 65, 86, 0.5);
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

// 搜索框
.query {
  width: calc(100% - 40px);
  margin: 10px 10px 10px 30px;
}

// 地震列表
.eqList {
  position: relative;
  height: calc(85vh - 90px);
  overflow-y: auto;
}

.eqTop {
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.eqCard {
  display: flex;
  height: 125px;
  border-bottom: #0d325f 2px solid;
  cursor: pointer;
}

.eqCard:hover {
  box-shadow: 0 0 15px #007fde, inset 0 0 25px #06b7ff;
  transition: all 0.3s;
}

// 圆圈震级
.eqMagnitude {
  display: flex;
  height: 35px;
  width: 35px;
  margin: 10px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 18px;
}

// 地震简要文本信息
.eqText {
  padding-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
}

.eqTitle {
  display: inline-block;
  max-width: 260px;
  position: relative;
  transform: translateX(0);
  will-change: transform;
  color: #409eff;
  font-size: 15px;
}

.eqText .eqTitle:hover {
  transform: translateX(-50%);
  transition: transform 5.0s ease;
}

.eqText .eqTitle {
  transition: none;
}

// 详情按钮
.eqTapToInfo {
  position: absolute;
  right: 10px;
  margin-top: 70px;
  width: 60px;
  height: 30px;
  border: #0d325f 1.5px solid;
  border-radius: 5px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.eqTapToInfo:hover {
  border: #2aa4f1 1.5px solid;
  color: #2aa4f1;
  transition: all 0.3s;
}

// 分页容器
.pagination {
  position: absolute;
  bottom: 0;
  width: 333px;
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
  border: 2px solid #FFFFFF; /* 白色边框 */
}

::v-deep .pagination .el-pagination__total {
  color: white;
}

// 指定地震面板
.thisEq {
  height: 100%;
  overflow: auto;
}

.return {
  width: 40px;
  height: 25px;
  border: #fff 1px solid;
  border-radius: 8px;
  font-size: 12px;
  margin-left: auto; /* 使按钮靠右 */
}

.return:hover {
  border-color: #409eff;
  color: #409eff;
  transition: all 0.3s;
}

.eqTheme {
  height: 150px;
  padding-left: 30px;
  margin: 0 auto;
  clear: both;
}

.themes {
  float: left;
  position: relative;
  margin: 5px 15px 10px 0;
  font-size: 15px;
  height: 22%;
  width: 28%;
  border: #fff 1px solid;
  cursor: pointer;
}

.themes:hover {
  background-color: #409eff;
  border: none;
}

.themes.active {
  background-color: #409eff;
  border: none;
}

// 大屏展示
.eqVisible {
  display: flex;
  height: 80px;
  width: 100%;
  justify-content: center;
  text-align: center;
  align-items: center;
}

.toVisible {
  margin-bottom: 0;
  width: 200px;
  height: 50px;
  border: #fff 1px solid;
  border-radius: 25px;
  font-size: 18px;
}

.toVisible:hover {
  color: #409eff;
  border-color: #409eff;
  transition: all 0.3s;
}

// 选项卡
.tabs {
  position: absolute;
  bottom: 250px;
  height: 42px;
  width: 100%;
  background-color: rgba(45, 61, 81, 0.8);
  border-bottom: #000 2px solid;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  z-index: 0;
}

.tab {
  display: flex;
  width: calc(100% - 30px);
  height: 40px;
  background-color: #2d3d51;
  color: #fff;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.tabItem {
  float: left;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #0d325f;
  height: 40px;
  padding: 0 10px;
  white-space: nowrap;
}

.tabItem.active {
  background-color: #409eff;
}

// 底部面板
.panel {
  position: absolute;
  width: 100%;
  height: 250px;
  bottom: 0;
  z-index: 2;
  background-color: rgba(45, 61, 81, 0.8);
}

.showPanel {
  position: absolute;
  left: 10px;
  bottom: 0;
  width: 120px;
  height: 40px;
  background-color: #2d3d51;
  -webkit-border-top-left-radius: 10px;
  -webkit-border-top-right-radius: 10px;
  z-index: 2;
}

.showPanel:hover {
  color: #2aa4f1;
  transition: all 0.3s;
}

.layers {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 4;
}

.layer {
  width: 25px;
  height: 25px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.PersonalCasualty {
  position: absolute;
  z-index: 20;
  background-color: #2b323a;
  width: 17%;
  height: 50%;
  top: 7.5%;
  right: 22%;
}

::v-deep .el-divider__text.is-left {
  box-shadow: 0 0 10px #007fde, inset 0 0 15px #06b7ff;
  background-color: #2d3d51;
  color: #fff;
  font-size: 20px;
}

// 滚动条样式
::-webkit-scrollbar-thumb {
  background-color: #2980b9;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #3498db;
}

::-webkit-scrollbar-track {
  background-color: #2d3d51;
}

// 公共按钮，居中与字体颜色
.button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

span {
  color: #fff;
}

h4, p {
  color: #fff;
}

p {
  font-size: 14px;
}


::v-deep .el-scrollbar {
  background-color: #2d3d51;
}

::v-deep .el-table__header-wrapper {
  background-color: #2d3d51;
}

::v-deep .el-table__inner-wrapper::before {
  display: none;
}

:deep(.cesium-baseLayerPicker-dropDown-visible) {
  z-index: 100 !important;
  background-color: #2b323a;
}

:deep(.cesium-baseLayerPicker-dropDown) {
  right: -5px !important;
}

::v-deep .compass {
  position: absolute;
  top: 20px;
  left: 20px;
}

::v-deep .navigation-controls {
  position: absolute;
  top: 120px;
  left: 53px;
}

:deep(.distance-legend) {
  bottom: 7% !important;
}
</style>
