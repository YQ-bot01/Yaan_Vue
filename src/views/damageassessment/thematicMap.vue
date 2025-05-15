<template>
  <div>
    <div id="cesiumContainer" class="situation_cesiumContainer">


      <!-- 右侧表单 -->
      <div class="eqTable">
        <div class="eqListContent" v-if="thisTab === '震害事件'">
          <div style="display: flex">
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
            {{ timestampToTime(eq.occurrenceTime, 'date') }}{{ eq.earthquakeName }}{{eq.magnitude}}级地震
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
              <p>地震震级：{{ selectedTabData.magnitude }}</p>
              <p>震源深度：{{ selectedTabData.depth }}千米</p>
              <p>参考位置：{{ selectedTabData.earthquakeName }}</p>
<!--              <p>信息来源：中国地震预警网[试运行]</p>-->
            </div>

            <div style="height: 10px;background-color: #054576"></div>


            <div class="eqTheme">
              <div class="button themes"
                   style="width: 30%"
                   :class="{ active: isPanelShow.thematicMap }"
                   @click="handlePanel(`thematicMap`)">专题图
              </div>

              <div class="button themes"
                   style="width: 30%"
                   :class="{ active: isPanelShow.report }"
                   @click="handlePanel(`report`); isPreviewShow = false;">灾情报告
              </div>

              <div class="button themes"
                   style="width: 30%"
                   :class="{ active: isPanelShow.instrument }"
                   @click="handlePanel(`instrument`);">台网数据
              </div>
            </div>

            <div style="height: 10px;background-color: #054576"></div>

            <div class="eqTheme" style="margin-top: -15px">
              <a class="button themes" href="http://172.26.86.31:18100" target="_blank">
                产出图件管理
              </a>
            </div>
            <div class="button themes"
                 :class="{ active: isPanelShow.AssistantDecision }"
                 style="height: 45px;margin-top: -15px;margin-bottom: 10px"
                 @click="handlePanel(`AssistantDecision`); isPreviewShow = false;">辅助决策产出
            </div>

            <div class="button themes"
                 :class="{ active: isPanelShow.InstrumentIntensity }"
                 style="height: 45px;margin-top: 15px;margin-bottom: 10px"
                 @click="handlePanel(`InstrumentIntensity`); isPreviewShow = false;">仪器烈度数据
            </div>
            <div class="button themes"
                 :class="{ active: isPanelShow.DownloadAll }"
                 style="height: 45px;margin-top: 15px;margin-bottom: 10px"
                 @click="handlePanel(`DownloadAll`); isPreviewShow = false;">一键下载
            </div>

            <div style="height: 10px;background-color: #054576"></div>
            <el-divider content-position="left">大屏展示</el-divider>

            <div class="eqVisible">
              <div class="button toVisible" @click="navigateToVisualization(this.selectedTabData)"><img
                src="../../assets/icons/svg/druid.svg" style="height: 25px;width: 25px;">可视化大屏展示
              </div>
            </div>
          </div>
        </div>


      </div>

      <div class="eqPanel" v-if="isPanelShow.thematicMap || isPanelShow.report
      || isPanelShow.instrument||isPanelShow.AssistantDecision
      || isPanelShow.InstrumentIntensity">
        <h2>{{ this.outputData.themeName }}</h2>
        <div style="width: 100%;height: calc(100% - 120px);text-align: center;color: #fff;font-size: 16px" v-if="isNoData">
          该地震暂无评估图件产出
        </div>
        <div class="mapItem" v-if="this.outputData.type === `thematicMap`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="map-item"
               @mouseenter="handleOpen(index)" @mouseleave="handleClose()">
            <div class="panelButtons" v-if="showPanelButtonsIndex === index">
              <div class="panelButton download" @click="handleDownloadMap(item.imgUrl)">下载</div>
              <div class="panelButton preview" @click="handleOpenPreview(item.theme, item.imgUrl)">预览</div>
            </div>
            <img :src="item.imgUrl" style="width: 95%; height: 80%;"/>
            <p style="margin: 10px; ">{{ item.theme }}</p>
          </div>
        </div>

        <div class="reportItem" v-if="this.outputData.type === `report`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="report-item" @click="handleDownloadReport(item.docxUrl)">
            <img src="../../assets/images/DamageAssessment/wordIcon.png" style="margin-right: 50px">
            {{ item.theme }}
          </div>
        </div>

        <div class="reportItem" v-if="this.outputData.type === `AssistantDecision`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="report-item" @click="handleJueCeReport(item.docxUrl)">
            <img src="../../assets/images/DamageAssessment/wordIcon.png" style="margin-right: 20px">
            {{ item.theme }}
          </div>
        </div>

        <div class="reportItem" v-if="this.outputData.type === `InstrumentIntensity`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="report-item" @click="handleInstrumentIntensity(item.xlsUrl)">
            <img src="../../assets/images/DamageAssessment/wordIcon.png" style="margin-right: 50px">
            {{ item.theme }}
          </div>
        </div>

        <div class="mapItem" v-if="this.outputData.type === `instrument`">
          <div v-for="(item, index) in outputData.themeData" :key="index" class="map-item"
               @mouseenter="handleOpen(index)" @mouseleave="handleClose()">
            <div class="panelButtons" v-if="showPanelButtonsIndex === index">
              <div class="panelButton download" @click="handleDownloadMap(item.imgUrl)">下载</div>
              <div class="panelButton preview" @click="handleOpenPreview(item.theme, item.imgUrl)">预览</div>
            </div>
            <img :src="item.imgUrl" style="width: 95%; height: 80%;"/>
            <p style="margin: 10px; ">{{ item.theme }}</p>
          </div>
        </div>

      </div>

      <div class="thematicMapPreview" v-if="isPreviewShow">
        <h2>{{ this.imgName }}</h2>
        <img :src="this.imgUrl" style="width: 95%; height: 80%;">
        <div style="display: flex; justify-content: center; align-items: center; margin-top: 5px">
          <el-button type="primary" @click="handleDownloadMap()">下载</el-button>
          <el-button plain type="primary" @click="handleClosePreview()" style="margin-left: 200px;">关闭</el-button>
        </div>
      </div>
    </div>

  </div>

</template>

<script>
import * as Cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "../../cesium/tool/initCesium.js";
import {
  getEqList, getEqOutPutJueCe, getEqOutPutJueCes,
  getEqOutputMaps,
  getEqOutputReports
} from "../../api/system/damageassessment.js";
// import yaan from "../../assets/geoJson/yaan1.json";
import {handleOutputData, timestampToTime} from "../../cesium/plot/eqThemes.js";
import eqMark from "@/assets/images/DamageAssessment/eqMark.png";
// import yaAnVillage from "@/assets/geoJson/yaan.json";
// import yaAnTown from "@/assets/geoJson/yaan1.json";
import timeLine from "@/cesium/timeLine.js";
import layer from "@/cesium/layer.js";
import JSZip from 'jszip';

export default {
  components: {},

  data() {
    return {
      isTerrainLoading: false,
      viewer: null,
      thisTab: "震害事件",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      eqData: [],
      filteredEqData: [],
      pagedEqData: [],

      eqid: "",
      eqqueueId: "",
      earthquakeFullName: "",

      selectedEntityPosition: '',
      selectedTabData: null,
      selectedEqPoint: null,
      title: "",
      // 地震专题
      isPanelShow: {
        thematicMap: false,
        report: false,
        instrument: false,
        AssistantDecision:false,
        InstrumentIntensity:false,
        DownloadAll:false,
      },
      isPreviewShow: false,
      // 记录当前显示的 panelButtons 索引，默认为 null
      showPanelButtonsIndex: null,
      // 列表地震
      listEqPoints: [],
      // 行政区划
      RegionLabels: [],

      // 产出数据
      outputData: {},
      imgName: '',
      imgUrl: '',

      isNoData: false,

      // cesium实体
      // yaAnVillageEntity: [],
      // yaAnTownEntity: [],
    };
  },

  mounted() {
    this.init();
    this.getEq();
    this.viewer = new Cesium.Viewer("cesiumContainer");
  },

  beforeUnmount() {
    console.log("111", window.viewer)
    if (window.viewer) {
      let viewer = window.viewer
      let gl = viewer.scene.context._gl
      viewer.entities.removeAll()

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
    // 获取地震列表并渲染
    getEq() {
      const eqListDTO = {
        pageNum: 1,
        pageSize: 10,
      }
      getEqList(eqListDTO).then((res) => {
        let resData = res.data.filter(item =>
            item.earthquakeName.includes("雅安") || Number(item.magnitude) >= 4
        )
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
      layer.loadSiChuanCountyLayer();
      window.viewer.camera.changed.addEventListener(this.handleCameraChange);
      this.renderQueryEqPoints();
    },

    // 注册鼠标事件监听
    initMouseEvents() {
      // 鼠标移动时设置指针样式
      window.viewer.screenSpaceEventHandler.setInputAction((movement) => {
        const pickedObject = window.viewer.scene.pick(movement.endPosition);
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          document.body.style.cursor = 'pointer';
        } else {
          document.body.style.cursor = 'default';
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      // 鼠标点击事件
      window.viewer.screenSpaceEventHandler.setInputAction((click) => {
        const pickedObject = window.viewer.scene.pick(click.position);
        this.selectedEntityPosition = this.calculatePosition(click.position);
        // 与断裂带名称div绑定
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          pickedObject.id.label._show._value = !pickedObject.id.label._show._value;
        }
        // 如果点击其他位置，隐藏所有地震点的标签，并关闭 faultInfoDiv
        else {
          if (this.selectedEqPoint) {
            this.selectedEqPoint.label._show._value = false;
          }
          this.listEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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

        // Cesium.GeoJsonDataSource.load(yaAnTown, {
        //   clampToGround: false,
        //   stroke: Cesium.Color.ORANGE,
        //   strokeWidth: 4,
        //   fill: Cesium.Color.TRANSPARENT,
        // }).then(dataSource => {
        //   viewer.dataSources.add(dataSource);
        //   dataSource.name = 'yaAnTownRegionLayer1';
        //
        //   // 添加区域标签
        //   yaAnTown.features.forEach(feature => {
        //     const firstPolygon = feature.geometry.coordinates[0][0];
        //     const positions = firstPolygon.map(vertex => Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]));
        //     const centroid = this.calculateCentroid(positions);
        //
        //     const regionLabel = viewer.entities.add({
        //       position: centroid,
        //       label: {
        //         text: feature.properties.name || '未命名',
        //         font: '18px sans-serif',
        //         fillColor: Cesium.Color.WHITE,
        //         outlineColor: Cesium.Color.BLACK,
        //         outlineWidth: 2,
        //         style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        //         verticalOrigin: Cesium.VerticalOrigin.CENTER,
        //         horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        //         pixelOffset: new Cesium.Cartesian2(0, 0),
        //       }
        //     });
        //     this.RegionLabels.push(regionLabel);
        //
        //   });
        // }).catch(error => {
        //   console.error("加载市级图层失败:", error);
        // });

        this.listEqPoints.push(entity);
      });
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


    /**
     * 移除数据源图层
     *
     * 本函数通过指定的图层名称，从当前窗口的 viewer 数据源中移除该图层如果图层存在，则会被成功移除
     * 此操作用于清理或更新地图显示，确保地图界面的准确性和时效性
     *
     * @param {string} layerName - 图层名称，用于标识特定的图层
     */
    removeDataSourcesLayer(layerName) {
      // 通过图层名称获取数据源对象如果存在，则执行移除操作
      const dataSource = window.viewer.dataSources.getByName(layerName)[0];
      if (dataSource) {
        window.viewer.dataSources.remove(dataSource);
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
      // console.log("pagedEqData:", this.pagedEqData)

      // 清除之前的点并重新添加
      // viewer.entities.removeAll();
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

    // 切换到对应面板
    toTab(eq) {
      // console.log(eq)
      this.isNoData = false
      this.thisTab = `${eq.earthquakeName} ${eq.magnitude}级地震`;
      this.eqid = eq.eqid
      this.eqqueueId = eq.eqqueueId
      this.earthquakeFullName = eq.earthquakeFullName

      /**
       *  下面的
       *  "T2024110313362251182600"
       *  需要改成传eq.eqid
       *  并且需要改后端调用的接口
       */

      if (this.thisTab !== '震害事件') {

        // 查找与选项卡名称匹配的地震数据
        this.selectedTabData = this.eqData.find(
            eq => eq.eqid === this.eqid
        );
        // 如果找到对应数据，调用定位函数
        if (this.selectedTabData) {
          this.selectEqPoint();
          // console.log(this.selectedTabData)
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

    handlePanel(type) {
      for (const key in this.isPanelShow) {
        if (this.isPanelShow.hasOwnProperty(key)) {
          if (key !== type && this.isPanelShow[key] === true) {
            this.isPanelShow[key] = false;
          }
        }
      }

      this.isPanelShow[type] = !this.isPanelShow[type];


      if( this.isPanelShow.AssistantDecision){
        handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, type).then((res) => {

          console.log("评估结果",res)

          this.outputData.themeName = res.themeName;

          this.outputData.themeData = res.themeData;
          this.outputData.type = type;

          this.isNoData = res.themeData.length === 0;
        });
      }
      else if (this.isPanelShow.thematicMap || this.isPanelShow.report) {
        getEqOutputMaps(this.eqid, this.eqqueueId).then((res) => {
          console.log("专题图", res.data)
        })

        getEqOutputReports(this.eqid, this.eqqueueId).then((res) => {
          console.log("灾情报告", res.data)
        })

        // getEqOutPutJueCes(this.eqid, this.eqqueueId).then((res)=>{
        //   console.log("决策报告",res.data)
        // })

        console.log("开始进行评估------------------------")

        handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, type).then((res) => {
          console.log("评估结果",res)
          this.outputData.themeName = res.themeName;
          this.outputData.themeData = res.themeData;
          this.outputData.type = type;
          this.isNoData = res.themeData.length === 0;
        });
      }
      else if(this.isPanelShow.instrument) {
        this.isNoData = false
        this.outputData.themeData = [
          {
            imgUrl:"http://10.16.7.69/image/instrument/仪器地震烈度分布图.jpeg",
            theme:"仪器地震烈度分布图"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/台站峰值加速度分布图.jpeg",
            theme:"台站峰值加速度分布图"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/台站峰值速度分布图.jpeg",
            theme:"台站峰值速度分布图"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/台站仪器地震烈度分布图.jpeg",
            theme:"台站仪器地震烈度分布图"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/3.0秒加速度反应谱(gal).jpeg",
            theme:"3.0秒加速度反应谱(gal)"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/1.0秒加速度反应谱(gal).jpeg",
            theme:"1.0秒加速度反应谱(gal)"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/0.3秒加速度反应谱(gal).jpeg",
            theme:"0.3秒加速度反应谱(gal)"
          },
          {
            imgUrl:"http://10.16.7.69/image/instrument/乡镇仪器地震烈度分布.jpeg",
            theme:"乡镇仪器地震烈度分布"
          },
        ]
        this.outputData.type = 'instrument';
        this.outputData.themeName = '2022年06月01日四川雅安市芦山县6.1级地震-台网数据';
      }
      else if(this.isPanelShow.InstrumentIntensity){
        this.isNoData = false
        this.outputData.themeData = [
          {
            xlsUrl:"http://10.16.7.69/image/instrument/20220601170008_乡镇仪器烈度报告_IEM.xls",
            theme:"乡镇仪器烈度报告"
          },
          {
            xlsUrl:"http://10.16.7.69/image/instrument/20220601170008_县市仪器烈度报告_IEM.xls",
            theme:"县市仪器烈度报告"
          },
          {
            xlsUrl:"http://10.16.7.69/image/instrument/FJ20220601170008_1_烈度速报产品.docx",
            theme:"仪器烈度速报产品"
          },
        ];
        this.outputData.type = 'InstrumentIntensity';
        this.outputData.themeName = '2022年06月01日四川雅安市芦山县6.1级地震-仪器烈度数据';
      }
      else if(this.isPanelShow.DownloadAll){
        this.downloadAll()
      }
      else{
        console.log("无图片数据")
      }
    },
    // downloadAll() {
    //   // 提示用户下载开始
    //   let startNotify=this.$notify({
    //     title: '一键下载',
    //     message: '正在下载所有报告和专题图，请稍候...',
    //     duration: 0, // 持续显示
    //     zIndex: 9999,
    //   });
    //
    //   let allUrls = [];
    //
    //   // 创建 JSZip 实例
    //   const zip = new JSZip();
    //
    //   Promise.all([
    //     handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, 'AssistantDecision'),
    //     handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, 'thematicMap'),
    //     handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, 'report')
    //
    //   ]).then(([res1, res2, res3]) => {
    //     console.log(res1,"辅助决策报告")
    //     // 创建文件夹
    //     const assistantDecisionFolder = zip.folder('辅助决策报告');
    //     const thematicMapFolder = zip.folder('专题图');
    //     const reportFolder = zip.folder('灾情简报');
    //
    //     // 处理 AssistantDecision 的结果
    //     this.outputData.themeName = res1.themeName;
    //     this.outputData.themeData = res1.themeData;
    //     res1.themeData.forEach(item => {
    //       if (item.docxUrl) {
    //         allUrls.push({ url: item.docxUrl, folder: assistantDecisionFolder });
    //       }
    //     });
    //
    //     // 处理专题图的结果
    //     this.outputData.themeName = res2.themeName;
    //     this.outputData.themeData = res2.themeData;
    //     res2.themeData.forEach(item => {
    //       if (item.imgUrl) {
    //         allUrls.push({ url: item.imgUrl, folder: thematicMapFolder });
    //       }
    //     });
    //
    //     // 处理报告的结果
    //     this.outputData.themeName = res3.themeName;
    //     this.outputData.themeData = res3.themeData;
    //     res3.themeData.forEach(item => {
    //       if (item.docxUrl) {
    //         allUrls.push({ url: item.docxUrl, folder: reportFolder });
    //       }
    //     });
    //
    //     // 下载每个文件并添加到对应的文件夹中
    //     const downloadPromises = allUrls.map((entry, index) => {
    //       return fetch(entry.url, {
    //         method: 'GET',
    //         headers: {
    //           'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, // 如果需要认证
    //         },
    //       })
    //           .then(response => {
    //             if (!response.ok) {
    //               console.log(entry.url, "下载失败");
    //               throw new Error(`下载失败: ${response.status}`);
    //             }
    //             return response.blob();
    //           })
    //           .then(blob => {
    //             // 获取文件名
    //             const fileName = entry.url.split('/').pop() || `file_${index}.unknown`;
    //             entry.folder.file(fileName, blob); // 将文件添加到对应的文件夹中
    //           })
    //           .catch(error => {
    //             console.error('下载失败:', error);
    //             return Promise.reject(error); // 如果下载失败，返回一个拒绝的 Promise
    //           });
    //     });
    //
    //     // 等待所有文件下载完成
    //     Promise.all(downloadPromises)
    //         .then(() => {
    //           // 生成 ZIP 文件
    //           zip.generateAsync({ type: 'blob' })
    //               .then(blob => {
    //                 const url = window.URL.createObjectURL(blob);
    //                 const a = document.createElement('a');
    //                 a.href = url;
    //                 a.download = this.earthquakeFullName+'.zip'; // 设置 ZIP 文件名
    //                 document.body.appendChild(a);
    //                 a.click();
    //                 document.body.removeChild(a);
    //                 window.URL.revokeObjectURL(url); // 释放 URL 对象
    //
    //                 // 提示用户下载完成
    //                 this.$notify({
    //                   title: '一键下载完成',
    //                   message: '所有文件已打包下载完成',
    //                   type: 'success',
    //                   duration: 5000,
    //                 });
    //                 startNotify.close()
    //                 this.isPanelShow.DownloadAll=false
    //               });
    //
    //         })
    //         .catch(error => {
    //           console.error('打包下载失败:', error);
    //           this.$notify({
    //             title: '下载失败',
    //             message: '部分文件下载失败，请检查网络或重试',
    //             type: 'error',
    //             duration: 5000,
    //           });
    //           startNotify.close()
    //           this.isPanelShow.DownloadAll=false
    //         });
    //   }).catch((error) => {
    //     console.error("Error fetching data:", error);
    //     this.$notify({
    //       title: '下载失败',
    //       message: '获取数据失败，请检查网络或重试',
    //       type: 'error',
    //       duration: 5000,
    //     });
    //
    //     startNotify.close()
    //     this.isPanelShow.DownloadAll=falses
    //   });
    // },
    downloadAll() {
      // 提示用户下载开始
      let startNotify = this.$notify({
        title: '一键下载',
        message: '正在下载所有报告和专题图，请稍候...',
        duration: 0, // 持续显示
        zIndex: 9999,
      });

      let allUrls = [];

      // 创建 JSZip 实例
      const zip = new JSZip();

      Promise.all([
        handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, 'AssistantDecision'),
        handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, 'thematicMap'),
        handleOutputData(this.eqid, this.eqqueueId, this.earthquakeFullName, 'report')
      ]).then(([res1, res2, res3]) => {
        console.log(res1, "辅助决策报告");

        // 创建文件夹
        const assistantDecisionFolder = zip.folder('辅助决策报告');
        const thematicMapFolder = zip.folder('专题图');
        const reportFolder = zip.folder('灾情简报');

        // 处理 AssistantDecision 的结果
        this.outputData.themeName = res1.themeName;
        this.outputData.themeData = res1.themeData;
        res1.themeData.forEach(item => {
          if (item.docxUrl) {
            allUrls.push({ url: item.docxUrl, folder: assistantDecisionFolder });
          }
        });

        // 处理专题图的结果
        this.outputData.themeName = res2.themeName;
        this.outputData.themeData = res2.themeData;
        res2.themeData.forEach(item => {
          if (item.imgUrl) {
            allUrls.push({ url: item.imgUrl, folder: thematicMapFolder });
          }
        });

        // 处理报告的结果
        this.outputData.themeName = res3.themeName;
        this.outputData.themeData = res3.themeData;
        res3.themeData.forEach(item => {
          if (item.docxUrl) {
            allUrls.push({ url: item.docxUrl, folder: reportFolder });
          }
        });

        // 下载每个文件并添加到对应的文件夹中
        const downloadPromises = allUrls.map((entry, index) => {
          return fetch(entry.url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, // 如果需要认证
            },
          })
              .then(response => {
                if (!response.ok) {
                  console.log(entry.url, "下载失败");
                  throw new Error(`下载失败: ${response.status}`);
                }
                return response.blob();
              })
              .then(blob => {
                // 获取文件名
                const fileName = entry.url.split('/').pop() || `file_${index}.unknown`;
                entry.folder.file(fileName, blob); // 将文件添加到对应的文件夹中
              })
              .catch(error => {
                console.error('下载失败:', error);
                return null; // 返回 null，而不是拒绝的 Promise
              });
        });

        // 等待所有文件下载完成
        Promise.all(downloadPromises)
            .then(() => {
              // 生成 ZIP 文件
              zip.generateAsync({ type: 'blob' })
                  .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = this.earthquakeFullName + '.zip'; // 设置 ZIP 文件名
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url); // 释放 URL 对象

                    // 提示用户下载完成
                    this.$notify({
                      title: '一键下载完成',
                      message: '所有文件已打包下载完成',
                      type: 'success',
                      duration: 5000,
                    });
                    startNotify.close();
                    this.isPanelShow.DownloadAll = false;
                  });
            })
            .catch(error => {
              console.error('打包下载失败:', error);
              this.$notify({
                title: '下载失败',
                message: '部分文件下载失败，请检查网络或重试',
                type: 'error',
                duration: 5000,
              });
              startNotify.close();
              this.isPanelShow.DownloadAll = false;
            });
      }).catch((error) => {
        console.error("Error fetching data:", error);
        this.$notify({
          title: '下载失败',
          message: '获取数据失败，请检查网络或重试',
          type: 'error',
          duration: 5000,
        });
        startNotify.close();
        this.isPanelShow.DownloadAll = false;
      });
    },
    handleOpen(index) {
      this.showPanelButtonsIndex = index;
    },

    handleClose() {
      this.showPanelButtonsIndex = null; // 当鼠标移出时隐藏所有的 panelButtons
    },

    handleDownloadMap(imgUrl) {
      this.$notify({
        title: '专题图下载',
        message: '数据正在解析中...',
        duration: 7000, // 设置持续时间
        zIndex: 9999  // 设置 zIndex 来确保通知在最上层
      });

      // 如果传入了 imgUrl，则使用传入的 URL，否则使用 this.imgUrl
      const imageUrl = imgUrl || this.imgUrl;

      if (imageUrl) {
        // 使用 fetch 获取图片数据
        fetch(imageUrl)
            .then(response => response.blob()) // 将响应转换为 Blob 对象
            .then(blob => {
              // 创建一个隐藏的 <a> 元素用于下载
              const a = document.createElement('a');
              const url = URL.createObjectURL(blob); // 创建 Blob URL
              a.href = url; // 设置 href 为 Blob URL
              a.download = imageUrl.split('/').pop(); // 使用 URL 的最后一部分作为文件名
              a.style.display = 'none'; // 隐藏 <a> 标签
              document.body.appendChild(a); // 将 <a> 标签添加到页面
              a.click(); // 触发点击事件，开始下载
              document.body.removeChild(a); // 下载后移除 <a> 标签
              URL.revokeObjectURL(url); // 释放 Blob URL
            })
            .catch(error => {
              this.$notify({
                title: '错误',
                message: '图片下载失败，请检查 URL 或网络连接',
                type: 'error',
                duration: 5000
              });
              console.error('下载失败:', error);
            });
      } else {
        this.$notify({
          title: '错误',
          message: '图片 URL 不存在，无法下载',
          type: 'error',
          duration: 5000
        });
      }
    },

    handleOpenPreview(imgName, imgUrl) {
      this.isPreviewShow = true;
      this.imgName = imgName;
      this.imgUrl = imgUrl;
    },

    handleClosePreview() {
      this.isPreviewShow = false;
    },

    handleDownloadReport(docxUrl) {
      this.$notify({
        title: '灾情报告下载',
        message: '数据正在解析中...',
        duration: 7000, // 设置持续时间
        zIndex: 9999  // 设置 zIndex 来确保通知在最上层
      });
      const a = document.createElement('a');
      a.href = docxUrl;
      a.download = docxUrl.split('/').pop();
      a.click();
      document.body.removeChild(a);
    },
    handleJueCeReport(docxUrl) {
      console.log("handleJueCeReport docxUrl",docxUrl)
      this.$notify({
        title: '辅助决策报告下载',
        message: '数据正在解析中...',
        duration: 7000,
        zIndex: 9999
      });
      console.log("localStorage.getItem('token')",localStorage.getItem('token'));
      // 使用 fetch 获取文件数据
      fetch(docxUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, // 如果有 Token，携带身份认证
        }
      })
          .then(response => {
            if (!response.ok) {
              throw new Error(`下载失败: ${response.status}`);
            }
            return response.blob(); // 转换为 Blob
          })
          .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docxUrl.split('/').pop(); // 设置文件名
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url); // 释放 URL 对象
          })
          .catch(error => {
            this.$notify({
              title: '下载失败',
              message: error.message,
              type: 'error',
              duration: 5000
            });
          });
    },
    handleInstrumentIntensity(xlsUrl){
      this.$notify({
        title: '仪器烈度报告下载',
        message: '数据正在解析中...',
        duration: 7000,
        zIndex: 9999
      });

      const a = document.createElement('a');
      a.href = xlsUrl;
      a.download = xlsUrl.split('/').pop();
      a.click();
      document.body.removeChild(a);
    },


    // -----------------------------------------------------------------------------------------------------------------
    // 功能按钮区块
    // -----------------------------------------------------------------------------------------------------------------

    // 选中地震后返回
    back() {
      for (const key in this.isPanelShow) {
        if (this.isPanelShow.hasOwnProperty(key)) {
          if (this.isPanelShow[key] === true) {
            this.isPanelShow[key] = false;
          }
        }
      }
      this.isPreviewShow = false;
      this.thisTab = '震害事件';
      this.selectedTabData = null;
      this.outputData = {}
      this.renderQueryEqPoints();
      //视角回雅安
      const position = Cesium.Cartesian3.fromDegrees(
        103.0,
        29.98,
        500000
      );
      viewer.camera.flyTo({destination: position,})
    },

    // 跳转至指挥大屏
    navigateToVisualization(thisEq) {
      const path = `/thd?eqid=${thisEq.eqid}&eqqueueId=${thisEq.eqqueueId}`;
      window.open(path, '_blank');
    },

    // -----------------------------------------------------------------------------------------------------------------
    // 地震专题与渲染(图层专题需要在 工具函数 addThemeLayer() 中处理)
    // -----------------------------------------------------------------------------------------------------------------


    // -----------------------------------------------------------------------------------------------------------------
    // 工具函数
    // -----------------------------------------------------------------------------------------------------------------

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
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
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
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
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
  height: 100px;
  clear: both;
  display: flex;
  justify-content: center;
  align-items: center;
}

.themes {
  width: 45%;
  height: 45%;
  margin: 0 auto;
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

.eqPanel {
  position: absolute;
  top: 50%;
  left: calc(0.5 * (100% - 333px));
  transform: translate(-50%, -50%);
  padding: 0 40px;
  width: 70%;
  height: 70%;
  background-color: #2d3d51;
  z-index: 1;
}

.mapItem {
  width: 100%;
  height: calc(100% - 90px);
  display: flex;
  flex-wrap: wrap; /* 自动换行 */
  overflow-x: auto; /* 显示横向滚动条 */
}

.map-item {
  position: relative;
  width: 25%;
  height: 50%;
  padding: 10px;
  text-align: center;
  border: 1px solid #ddd;
}

.panelButtons {
  position: absolute;
  bottom: 15%;
  width: 91%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: rgba(43, 61, 81, 0.6);
}

.panelButton {
  margin: 0 auto;
  width: 60px;
  height: 25px;
  border-radius: 8px;
  cursor: pointer;
}

handleEveryDownload{
  margin-left:-90px;
  width: 60px;
  height: 25px;
  border-radius: 8px;
  cursor: pointer;
}


.thematicMapPreview {
  position: absolute;
  width: 75%;
  transform: translateX(-50%);
  left: calc(0.5 * (100% - 333px));
  top: 50px;
  height: calc(100% - 20px);
  text-align: center;
  background-color: #2d3d51;
  border-radius: 10px;
  z-index: 4;
}
.preview {
  background-color: #ebf5ff;
  color: #409eff;
}

.download {
  background-color: #409eff;
  color: #fff;
}

.reportItem {
  width: 100%;
  height: calc(100% - 90px);
  text-align: center;
  overflow-y: auto;
}

.report-item {
  display: flex;
  height: 100px;
  padding: 15px;
  cursor: pointer;
  color: #fff;
  font-size: 18px;
  text-align: center;
}

.report-item:hover {
  background-color: #1f5783 !important;
  color: #409eff !important;
}

.report-item:nth-child(odd) {
  background-color: #313a44; /* 奇数项背景颜色 */
}

.report-item:nth-child(even) {
  background-color: #304156; /* 偶数项背景颜色 */
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

h2 {
  text-align: center;
  color: #fff;
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
