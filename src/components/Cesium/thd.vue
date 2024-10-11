<template>
  <div>
    <!--    地震列表切换-->
    <!--    <div class="eqlist-button">-->
    <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="toggleComponent('eqList')">地震列表</el-button>-->
    <!--    </div>-->
    <div class="thd-eqtable" v-if="activeComponent === 'eqList'">
      <eqTable :eqData="tableData"/>
    </div>

    <!--   图层要素-->
    <!--    <div class="layer-button">-->
    <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="toggleComponent('layerChoose')">图层要素</el-button>-->
    <!--    </div>-->
    <div v-if="activeComponent === 'layerChoose'" class="dropdown expanded">
      <el-checkbox-group v-model="selectedlayersLocal" @change="updateMapLayers" class="grid-container">
        <el-checkbox
            v-for="item in layeritems"
            :key="item.id"
            :label="item.name"
            style="margin:0 0;"
        >
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
      <div @click="toggleExpand"
           style="cursor: pointer; text-align: center; margin-top: 10px; display: flex; justify-content: flex-end;">
      </div>
    </div>

    <div v-if="activeComponent === 'thematicMapDownload'" class="dropdown expanded">
      <el-radio-group v-model="selectthematicMap" @change="updatethematicMap" class="grid-container">
        <el-radio
            v-for="item in thematicMapitems"
            :key="item.id"
            :label="item.name"
            style="margin: 0 0;color:white"
        >
          {{ item.name }}
        </el-radio>
      </el-radio-group>
      <div @click="toggleExpand"
           style="cursor: pointer; text-align: center; margin-top: 10px; display: flex; justify-content: flex-end;">
      </div>
    </div>
    <div v-if="activeComponent === 'reportDownload'" class="dropdown expanded">
      <el-radio-group v-model="selectReportItem" @change="updateReportItem" class="grid-container">
        <el-radio
            v-for="item in reportItems"
            :key="item.id"
            :label="item.name"
            style="margin: 0 0;color:white"
        >
          {{ item.name }}
        </el-radio>
      </el-radio-group>
      <div @click="toggleExpand"
           style="cursor: pointer; text-align: center; margin-top: 10px; display: flex; justify-content: flex-end;">
      </div>
    </div>


    <!--    行政区划-->
    <!--    <div class="regionjump-button">-->
    <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="toggleComponent('Regionjump')">行政区划</el-button>-->
    <!--    </div>-->
    <div v-if="activeComponent === 'Regionjump'" class="dropdown expanded">
      <div class="district-buttons">
        <div class="city-button">
          <el-button @click="addYaanImageryDistrict">雅安市</el-button>
        </div>
        <div class="city-button">
          <el-button @click="backcenter">回到震中</el-button>
        </div>
      </div>
      <!-- 下属区县按钮 -->
      <div class="district-buttons">
        <div v-for="district in districts" :key="district.adcode" class="district-button">
          <el-button @click="handleDistrictClick(district)">{{ district.name }}</el-button>
        </div>
      </div>
    </div>

    <!--报告产出按钮-->
    <!--    <div class="button-container">-->
    <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="takeScreenshot">报告产出</el-button>-->
    <!--    </div>-->
    <!--    <div class="thematic-button">-->
    <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="">专题图下载</el-button>-->
    <!--    </div>-->
    <!--    <div class="back-button">-->
    <!--      <el-button class="el-button&#45;&#45;primary" size="small" @click="backToHome">返回首页</el-button>-->
    <!--    </div>-->


    <!--    title-->
    <div class="eqtitle">
      <span
          class="eqtitle-text_eqname">{{ this.eqyear }}年{{ this.eqmonth }}月{{
          this.eqday
        }}日{{ this.centerPoint.earthquakeName }}{{ this.centerPoint.magnitude }}级地震</span>
    </div>
    <!--    title end-->

    <div>
      <el-menu
          class="el-menu-vertical-demo"
          mode="horizontal"
          background-color="#293038"
          text-color="#fff"
          active-text-color="#537BB7FF"
          style="position: absolute;
                  top: 4.3%;z-index: 20;
                  height: 45px;width: 25%;
                  margin: 0;padding: 0;
                  left: 1%;border-radius:3px;text-align: center"
      >
        <el-menu-item index="1" @click="toggleComponent('eqList')" style="width: 90px;">地震列表</el-menu-item>
        <el-menu-item index="2" @click="toggleComponent('layerChoose')" style="width: 90px;">图层要素</el-menu-item>
        <el-menu-item index="3" @click="toggleComponent('Regionjump')" style="width: 90px;">视角跳转</el-menu-item>
        <!--      <el-menu-item index="4" @click="takeScreenshot" style="width: 100px;">分析图件产出</el-menu-item>-->
        <el-menu-item index="4" @click="toggleComponent('reportDownload')" style="width: 90px;">分析图件产出</el-menu-item>
        <el-menu-item index="5" @click="toggleComponent('thematicMapDownload')" style="width: 90px;">专题图下载</el-menu-item>
        <el-menu-item index="6">返回首页</el-menu-item>
      </el-menu>
    </div>

        <!--    box包裹地图，截图需要-->
        <div id="box" ref="box">
            <div id="cesiumContainer">
                <!-- TimeLinePanel 弹窗 -->
                <TimeLinePanel
                        :visible="timelinePopupVisible"
                        :position="timelinePopupPosition"
                        :popupData="timelinePopupData"
                />
            </div>
        </div>
        <!-- RouterPanel 弹窗 -->
        <RouterPanel
                :visible="routerPopupVisible"
                :position="routerPopupPosition"
                :popupData="routerPopupData"
        />

        <!-- 进度条-->
        <div class="bottom">
            <!--      播放暂停按钮-->
            <div class="play">
                <img class="play-icon" src="../../assets/icons/TimeLine/后退箭头.png" @click="backward"/>
                <img class="play-icon" src="../../assets/icons/TimeLine/播放.png" v-if="!isTimerRunning"
                     @click="toggleTimer"/>
                <img class="pause-icon" src="../../assets/icons/TimeLine/暂停.png" v-if="isTimerRunning"
                     @click="toggleTimer"/>
                <img class="play-icon" src="../../assets/icons/TimeLine/前进箭头.png" @click="forward"/>
            </div>

      <div class="time-ruler" @mousedown="startDrag" @mouseenter="isDragging = true"
           @mouseleave="isDragging = true">
        <div class="time-ruler-line" @click="jumpToTime">
          <div class="time-progress" :style="{ width: `${currentTimePosition}%` }"></div>
          <div class="time-slider" :style="{ left: `${currentTimePosition-0.5}%` }"></div>
          <!--          <div class="time-slider" :style="{ left: `${currentTimePosition}%` }"></div>-->
        </div>
        <!-- speedButton 和 chooseSpeed 放在一起 -->
        <span class="speedButton">{{ speedOption }}</span>
        <div class="chooseSpeed">
          <option v-for="option in speedOptions" :key="option" @click="selectSpeed(option)">
            {{ option }}
          </option>
        </div>
      </div>

            <!--      时间点-->
            <div class="current-time-info">
                <span class="timelabel">{{ this.timestampToTime(this.eqstartTime) }}</span>
            </div>

            <div class="end-time-info">
                <div class="timelabel">
                    <span>{{ this.timestampToTime(this.currentTime) }}</span>
                    <span> / </span>
                    <span> {{ this.timestampToTime(this.eqendTime) }}</span>
                </div>
            </div>
        </div>
        <!-- 进度条 end-->

        <!--    两侧组件-->
        <!--   应急响应-左上   -->
        <timeLineEmergencyResponse
                :eqid="eqid"
                :currentTime="currentTime"
        />
        <!--   人员伤亡-左中   -->
        <timeLinePersonnelCasualties
                :eqid="eqid"
                :currentTime="currentTime"
        />
        <!--   救援出队-左下   -->
        <timeLineRescueTeam
                :eqid="eqid"
                :currentTime="currentTime"
        />
        <!--  新闻-右上  -->
        <div>
            <news
                    :eqid="eqid"
                    :currentTime="currentTime"
                    @ifShowDialog="ifShowDialog"
                    @detailedNews="detailedNews"
            ></news>
        </div>
        <!--      新闻弹框-->
        <div>
            <news-dialog
                    :showDetailedNewsDialog="showDetailedNewsDialog"
                    :showingNewsContent="showingNewsContent"
                    @hideNewsDialog="hideNewsDialog"
            ></news-dialog>
        </div>
        <!--      缩略图-->
        <div>
            <mini-map></mini-map>
        </div>

        <timeLineLegend
                :activeComponent="activeComponent"
                @toggleComponent="toggleComponent"
        ></timeLineLegend>
        <!--    两侧组件 end-->


        <!--   行政区划要素图层图例   -->
        <div id="legend"
             style="display: none;position: absolute;
           z-index:20; bottom: 100px;
           right: 450px; color: #FFFFFF;
           background-color: rgba(0, 0, 0, 0.5);
           padding: 10px; border-radius: 5px;text-align: center;">
            <h4 style="margin-bottom: 5px; margin-top: 0; padding:0;justify-content: center">颜色图例</h4>
        </div>

        <!--   断裂带名称div   -->
        <div id="faultInfo"
             style="position: absolute; display: none; background-color: #3d423f; border: 1px solid black; padding: 5px; color: #fff; z-index: 1; text-align: center;">
        </div>
        <thematicMapPreview
                @ifShowThematicMapDialog="ifShowThematicMapDialog"
                :imgshowURL="imgshowURL"
                :imgurlFromDate="imgurlFromDate"
                :imgName="imgName"
                :ifShowMapPreview="ifShowMapPreview"
        ></thematicMapPreview>
    </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getPlotwithStartandEndTime} from '@/api/system/plot'
import {getAllEq, getEqById} from '@/api/system/eqlist'
import cesiumPlot from '@/cesium/plot/cesiumPlot'

import {useCesiumStore} from '@/store/modules/cesium.js'
import centerstar from "@/assets/icons/TimeLine/震中.png";
import TimeLinePanel from "@/components/Cesium/TimeLinePanel.vue";
import newsDialog from "@/components/TimeLine/newsDialog.vue";
import timeLineEmergencyResponse from "@/components/TimeLine/timeLineEmergencyResponse.vue"
import timeLinePersonnelCasualties from "@/components/TimeLine/timeLinePersonnelCasualties.vue"
import timeLineRescueTeam from "@/components/TimeLine/timeLineRescueTeam.vue"
import MiniMap from "@/components/TimeLine/miniMap.vue";
import News from "@/components/TimeLine/news.vue";
import timeLineLegend from "@/components/TimeLine/timeLineLegend.vue";

//报告产出
import fileUrl from "@/assets/json/TimeLine/2020年6月1日四川雅安芦山县6.1级地震灾害报告.pdf"
import commonPanel from "@/components/Cesium/CommonPanel";

import eqTable from '@/components/Home/eqtable.vue'

import yaan from '@/assets/geoJson/yaan.json'

import {TianDiTuToken} from "@/cesium/tool/config";
import {getFeaturesLayer} from "@/api/system/emergency.js";
import emergencyRescueEquipmentLogo from '@/assets/images/disasterReliefSuppliesLogo.jpg';
import rescueTeamsInfoLogo from '@/assets/images/rescueTeamsInfoLogo.png';
import emergencySheltersLogo from '@/assets/images/emergencySheltersLogo.png';
import RouterPanel from "@/components/Cesium/RouterPanel.vue";

import {addFaultZones, addHistoryEqPoints, addOvalCircles} from "../../cesium/plot/eqThemes.js";

//专题图
import {MapPicUrl,ReportUrl} from "@/assets/json/thematicMap/PicNameandLocal.js"
import thematicMapPreview from "@/components/ThematicMap/thematicMapPreview.vue";
export default {
    components: {
        thematicMapPreview,
        RouterPanel,
        TimeLinePanel,
        News,
        MiniMap,
        timeLineEmergencyResponse,
        timeLinePersonnelCasualties,
        timeLineRescueTeam,
        timeLineLegend,
        newsDialog,
        commonPanel,
        eqTable,
    },
    data: function () {
        return {
// -----------弹窗们的状态变量-------------
            selectedEntityHighDiy: null, // 存储弹窗的位置
            routerPopupVisible: false, // RouterPanel弹窗的显示与隐藏
            routerPopupPosition: {x: 0, y: 0}, // RouterPanel弹窗的位置
            routerPopupData: {}, // RouterPanel弹窗的数据

            timelinePopupVisible: false, // TimeLinePanel弹窗的显示与隐藏
            timelinePopupPosition: {x: 0, y: 0}, // TimeLinePanel弹窗的位置
            timelinePopupData: {}, // TimeLinePanel弹窗的数据
            //----------------------------------
            eqid: '',
            // viewer: '',
            store: '',
            //地震时间年月日
            eqyear: '',
            eqmonth: '',
            eqday: '',

            // 震中点数据结构
            centerPoint: {
                plotid: 'center',
                earthquakeName: '',
                // position: '',
                // time:'',
                starttime: '',
                endtime: '',
                magnitude: '',
                longitude: '',
                latitude: '',
                height: '',
                depth: '',
                plottype: '震中'
            },

            // 新闻组件
            showingNewsContent: {
                id: '',
                time: '',
                content: '',
                img: '',
            },
            showDetailedNewsDialog: false,

            //时间轴时间
            // ifShowData: false,
            // timelineTotalDurationMinutes:10380,
            timelineAdvancesNumber: 2076,  //总分钟数（取5的倍数）/5 =总前进次数  默认值2076（符合芦山） 结束时间2022-06-08 22:00:00
            eqstartTime: '',
            currentTime: '',
            eqendTime: '',
            tmpeqendTime: '',//默认的地震结束时间
            realTime: new Date(),
            //时间轴当前进度条节点位置
            // currentTimePosition: 0,
            currentTimePosition: 100,
            //时间轴当前前进步
            currentNodeIndex: 2076,
            realtimeinterval: null,
            intervalId: null,
            eqendtimeinterval: null,
            // 倍速
            currentSpeed: 1,
            showSpeedOptions: false,
            speedOption: '1X',
            speedOptions: ['1X', '2X', '4X'],

            //是否记载到view上，已经存在则不再添加
            plotisshow: {},
            //包括最早出现时间，最晚结束时间的标绘点信息
            plots: [],
            //时间轴暂停播放状态
            isTimerRunning: false,
            //时间轴拖拽
            isDragging: false,
            dragStartX: 0,

            smallViewer: null,

            //-------------ws---------------------
            websock: null,
            //-----------------地震列表---------------------
            // eqListShow: false,
            //-地震列表---------------------------------
            total: 0,
            pageSize: 6,
            currentPage: 1,
            tableData: [],
            //-----------------图层---------------------
            // iflayerChoose: false,
            isMarkingLayer: true,
            showlayers: [],
            //-----------------图层---------------------
            LRDLStatus: false, // 路网
            // districtLayer: null,
            //------------------按钮下拉框------
            // visible: false,
            districts: [
                {adcode: 511802, name: "雨城区"},
                {adcode: 511803, name: "名山区"},
                {adcode: 511822, name: "荥经县"},
                {adcode: 511823, name: "汉源县"},
                {adcode: 511824, name: "石棉县"},
                {adcode: 511825, name: "天全县"},
                {adcode: 511826, name: "芦山县"},
                {adcode: 511827, name: "宝兴县"},
            ],
            geojsonData: [],
            labels: [],  // 保存标签实体的引用
            regionLayer111: null,

            activeComponent: null,
            //-----------------图层要素---------------------
            isExpanded: false,
            layeritems: [
                {id: '0', name: '标绘点图层'},
                {id: '1', name: '行政区划要素图层'},
                {id: '2', name: '人口密度要素图层'},
                {id: '3', name: '交通网络要素图层'},
                {id: '4', name: '避难场所要素图层'},
                {id: '5', name: '救援队伍分布要素图层'},
                {id: '6', name: '应急物资存储要素图层'},
                {id: '7', name: '历史地震要素图层'},
                {id: '8', name: '断裂带要素图层'},
            ],
            selectedlayersLocal: ['标绘点图层'],
            isMarkingLayerLocal: false,
            disasterReserves: [],
            emergencyTeam: [],
            emergencyShelters: [],

      //专题图下载
      thematicMapitems:[],
      selectthematicMap:'',
      isshowThematicMapPreview:'',
      imgshowURL:'',
      imgurlFromDate:'',
      imgName:'',
      ifShowMapPreview: false, // 是否预览专题图
      //专题图下载end

      //报告产出
      reportItems:[],
      selectReportItem:'',

    };
  },
  created() {
    this.eqid = new URLSearchParams(window.location.search).get('eqid')
    this.thematicMapitems = MapPicUrl.filter(item => item.eqid === this.eqid);
    this.reportItems=ReportUrl.filter(item => item.eqid === this.eqid);
    // console.log(this.thematicMapitems);
  },
  mounted() {
    this.init()
    this.getEqInfo(this.eqid)

        this.initPlot(); // 初始化加载应急数据
        // // ---------------------------------------------------
        // // 生成实体点击事件的handler
        this.entitiesClickPonpHandler()
        this.watchTerrainProviderChanged()
        // if(this.eqid === 'be3a5ea48dfda0a2251021845f17960b'){
        //     this.ifShowData = true
        // }
    },
  beforeDestroy() {
    if (window.viewer){
      this.clearResource(window.viewer)
      window.viewer = null;
    }
    if (window.smallViewer){
      this.clearResource(window.smallViewer)
      window.smallViewer = null;
    }
  },
    // 图层要素
    methods: {
      clearResource(viewer){
        let gl=viewer.scene.context._gl
        viewer.entities.removeAll()
        // viewer.scene.primitives.removeAll()
        // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
        viewer.destroy()
        gl.getExtension("WEBGL_lose_context").loseContext();
        gl=null
      },
        /**
         * 计算复选框列表的高度
         * 此函数用于动态计算一组复选框堆叠后的总高度，考虑了复选框的高度和它们之间的间距
         *
         * @returns {number} 返回复选框列表的总高度
         */
        getHeight() {
            // 每个复选框的高度
            const checkboxHeight = 50;
            // 复选框之间的间距值
            const margin = 10;
            // console.log(this.layeritems.length/2 , this.layeritems.length%2)
            // 输出用于校验的计算结果，帮助理解复选框数量如何影响高度计算
            console.log(((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) * checkboxHeight) + ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) - 1) * margin)
            // 返回复选框列表的总高度，包括所有复选框的高度和它们之间的间距
            return ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) * checkboxHeight) + ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) - 1) * margin;
        },

      /**
       * 图层要素 切换展开状态
       *
       * 此方法用于切换组件的展开和收起状态当用户点击展开按钮时，会触发此方法它通过取反当前的展开状态来改变组件的展开/收起状态
       *
       * @returns {void} 无返回值
       */
    toggleExpand() {
      console.log("Toggle expand clicked");
      this.isExpanded = !this.isExpanded;
    },

      /**
       * 设置组件展开的面板互斥,避免堆叠
       * 切换组件的显示状态
       * @param {String} component - 要切换的组件名称
       */
      toggleComponent(component) {
          // 收起图层要素
          this.isExpanded = false;
          // 清除主题地图预览的显示状态
          this.isshowThematicMapPreview = null;
          // 清除选择的主题地图
          this.selectthematicMap = null;

          // 如果点击的是当前活动组件，则关闭它，否则打开新组件
          this.activeComponent = this.activeComponent === component ? null : component;

          // 如果激活的组件是地震列表，则获取地震数据
          if (this.activeComponent === 'eqList') {
              this.getEq();
          }
      },
    // 初始化控件等
    init() {
      // console.log(this.eqid)
      let viewer = initCesium(Cesium)
      viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
      window.viewer = viewer
      // this.viewer=window.viewer
      let options = {}
      // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
      // options.defaultResetView = Cesium.Cartographic.fromDegrees(103.00, 29.98, 1000, new Cesium.Cartographic)
      // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
      options.enableCompass = false
      // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
      options.enableZoomControls = false
      // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
      options.enableDistanceLegend = true
      // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      options.enableCompassOuterRing = false
      options.resetTooltip = "重置视图";
      options.zoomInTooltip = "放大";
      options.zoomOutTooltip = "缩小";
      //新版必须new  CesiumNavigation ,可以查看作者github
      window.navigation = new CesiumNavigation(viewer, options)
      document.getElementsByClassName('cesium-geocoder-input')[0].placeholder = '请输入地名进行搜索'
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[0].innerHTML = '影像服务'
      document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')[1].innerHTML = '地形服务'

            //经纬度查询
            let that = this

            let canvas = viewer.scene.canvas;
            //具体事件的实现
            let ellipsoid = viewer.scene.globe.ellipsoid;
            let handler = new Cesium.ScreenSpaceEventHandler(canvas);
            handler.setInputAction(function (movement) {
                //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
                let cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    //将笛卡尔三维坐标转为地图坐标（弧度）
                    let cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                    //将地图坐标（弧度）转为十进制的度数
                    let latString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
                    let logString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
                    // 获取相机的海拔高度作为视角高度/km
                    let altiString = (viewer.camera.positionCartographic.height / 1000).toFixed(2);
                    // console.log(latString);
                    // console.log(logString);
                    // console.log(altiString);
                    that.getPopDesity(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude))
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


            // 创建缩略图视图器实例
            let smallMapContainer = document.getElementById('smallMapContainer');
            let smallViewer = initCesium(Cesium, smallMapContainer)
            window.smallViewer = smallViewer
            smallViewer._cesiumWidget._creditContainer.style.display = 'none'
            let smallOptions = {}
            smallOptions.enableCompass = false
            smallOptions.enableZoomControls = false
            smallOptions.enableDistanceLegend = false
            smallOptions.enableCompassOuterRing = false
            smallOptions.geocoder = false
            smallOptions.homeButton = false
            smallOptions.sceneModePicker = false
            smallOptions.timeline = false
            smallOptions.navigationHelpButton = false
            smallOptions.animation = false
            smallOptions.infoBox = false
            smallOptions.fullscreenButton = false
            smallOptions.showRenderState = false
            smallOptions.selectionIndicator = false
            smallOptions.baseLayerPicker = false
            smallOptions.selectedImageryProviderViewModel = viewer.imageryLayers.selectedImageryProviderViewModel
            smallOptions.selectedTerrainProviderViewModel = viewer.terrainProviderViewModel
            window.navigation = new CesiumNavigation(smallViewer, smallOptions)
            smallMapContainer.getElementsByClassName('cesium-viewer-toolbar')[0].style.display = 'none';
            // that.smallViewer = new Cesium.Viewer(smallMapContainer, {
            //   // 隐藏所有控件
            //   geocoder: false,
            //   homeButton: false,
            //   sceneModePicker: false,
            //   timeline: false,
            //   navigationHelpButton: false,
            //   animation: false,
            //   infoBox: false,
            //   fullscreenButton: false,
            //   showRenderState: false,
            //   selectionIndicator: false,
            //   baseLayerPicker: false,
            //   selectedImageryProviderViewModel: viewer.imageryLayers.selectedImageryProviderViewModel,
            //   selectedTerrainProviderViewModel: viewer.terrainProviderViewModel
            // });
            // 隐藏缩略图视图器的版权信息
            smallViewer._cesiumWidget._creditContainer.style.display = 'none';

            // 同步主视图器的相机到缩略图视图器
            function syncCamera() {
                const camera1 = viewer.scene.camera;
                const camera2 = smallViewer.scene.camera;

                camera2.setView({
                    destination: camera1.positionWC,
                    orientation: {
                        heading: camera1.heading,
                        pitch: camera1.pitch,
                        roll: camera1.roll
                    }
                });
            }

            // 监听主视图器的相机变化
            viewer.scene.camera.changed.addEventListener(syncCamera);

            // 每帧渲染时同步缩略图视图
            viewer.scene.postRender.addEventListener(function () {
                smallViewer.scene.requestRender(); // 确保缩略图更新
            });

            // 初始同步
            syncCamera();
        },

        /**
         * 取地震信息+开始结束当前时间初始化
         * @param {string} eqid - 地震ID
         */
        getEqInfo(eqid) {
            // 调用接口根据ID获取地震信息
            getEqById({id: eqid}).then(res => {
                console.log("thd eqid---------------", eqid)
                //震中标绘点
                this.centerPoint = res
                // console.log(res)
                // console.log(res)
                // 设置中心点的标识和时间信息
                this.centerPoint.plotid = "center"
                this.centerPoint.starttime = new Date(res.occurrenceTime)
                // this.centerPoint.endtime=new Date(this.centerPoint.starttime.getTime() + this.timelineAdvancesNumber*5*60*1000+1000);
                //默认结束时间（设置得大一点，防止按时间渲染随时间长度更新消失了）10天
                this.centerPoint.endtime = new Date(this.centerPoint.starttime.getTime() + 10 * 24 * 36000 * 1000);
                // console.log(this.centerPoint.starttime,this.centerPoint.endtime,this.timelineAdvancesNumber)
                //变量初始化
                this.eqstartTime = this.centerPoint.starttime
                this.eqyear = this.eqstartTime.getFullYear()
                this.eqmonth = this.eqstartTime.getMonth() + 1
                this.eqday = this.eqstartTime.getDate()
                // 计算结束时间 结束时间为开始后72小时，单位为毫秒
                //默认结束时间 方便展示设置成芦山的时间  要改！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
                this.tmpeqendTime = new Date(this.centerPoint.starttime.getTime() + 2076 * 5 * 60 * 1000);
                // this.realTime = new Date(); //真实时间
                //
                // 根据当前时间和地震结束时间计算时间线推进数量
                if (this.realTime < this.tmpeqendTime) {
                    this.eqendTime = new Date(this.realTime)
                    this.timelineAdvancesNumber = ((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (5 * 60 * 1000);
                    this.currentNodeIndex = this.timelineAdvancesNumber
                } else {
                    this.eqendTime = this.tmpeqendTime
                }
                this.currentTime = this.eqendTime

                // 获取地震数据并更新地图和变量
                this.getEq()
                this.checkIfOvalCircleLayer();
                this.updateMapandVariablebeforInit()

            })

        },

        /*
        * 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
        * */
        timestampToTime(timestamp) {
            let DateObj = new Date(timestamp)

            let year = DateObj.getFullYear()
            let month = DateObj.getMonth() + 1
            let day = DateObj.getDate()
            let hh = DateObj.getHours()
            let mm = DateObj.getMinutes()
            let ss = DateObj.getSeconds()
            month = month > 9 ? month : '0' + month
            day = day > 9 ? day : '0' + day
            hh = hh > 9 ? hh : '0' + hh
            mm = mm > 9 ? mm : '0' + mm
            ss = ss > 9 ? ss : '0' + ss
            // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
            return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
        },

        /*
        * 更新地图中心视角，更新变量：地震起止时间，渲染点
        * */
        updateMapandVariablebeforInit() {
            viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(
                    parseFloat(this.centerPoint.geom.coordinates[0]),
                    parseFloat(this.centerPoint.geom.coordinates[1]),
                    120000),
                orientation: {
                    // 指向
                    heading: 6.283185307179581,
                    // 视角
                    pitch: -1.5688168484696687,
                    roll: 0.0
                }
            });
            //加载中心点
            viewer.entities.add({

                position: Cesium.Cartesian3.fromDegrees(
                    parseFloat(this.centerPoint.geom.coordinates[0]),
                    parseFloat(this.centerPoint.geom.coordinates[1]),
                    parseFloat(this.centerPoint.height || 0)
                ),
                billboard: {
                    image: centerstar,
                    width: 40,
                    height: 40,
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                    scale: 0.8,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    depthTest: false,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                },
                label: {
                    text: this.centerPoint.earthquakeName,
                    show: true,
                    font: '14px sans-serif',
                    fillColor: Cesium.Color.RED,        //字体颜色
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -16),
                },
                id: this.centerPoint.plotid,
                plottype: "震中",
                layer: "标绘点"
            });
            smallViewer.entities.removeAll();
            smallViewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(
                    parseFloat(this.centerPoint.geom.coordinates[0]),
                    parseFloat(this.centerPoint.geom.coordinates[1]),
                    parseFloat(this.centerPoint.height || 0)
                ),
                billboard: {
                    image: centerstar,
                    width: 40,
                    height: 40,
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                    scale: 0.8,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    depthTest: false,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                },
                label: {
                    text: this.centerPoint.earthquakeName,
                    show: true,
                    font: '10px sans-serif',
                    fillColor: Cesium.Color.RED,        //字体颜色
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -16),
                },
                id: this.centerPoint.plotid,
                plottype: "震中",
            });

            this.xuanran(this.eqid)
        },
        //请求控制（当前时间还在地震应急处置时间内，就每分钟发送一共查询请求，如果以及大于结束时间，只请求一次就行）

        /**
         * 根据指定的eqid渲染数据
         * 此方法主要负责针对特定的eqid获取并渲染数据，包括初始化渲染和动态更新数据
         * @param {string} eqid - 需要渲染的数据的唯一标识符
         */
        xuanran(eqid) {
            // 获取特定eqid的带有开始和结束时间的绘图数据
            this.getPlotwithStartandEndTime(eqid)
            // 初始化定时器，用于定期从数据库请求新的绘图数据
            this.intimexuanran(eqid)
        },

        /**
         * 触发地震渲染更新
         * @param {string} eqid - 地震ID
         */
        intimexuanran(eqid) {
            // 每5分钟触发一次更新
            if (this.realTime < this.tmpeqendTime) {
                console.log("还在更新的地震")
                // 当实时时间位置为100%且没有定时器运行时，启动定时器
                if (!this.isTimerRunning && this.currentTimePosition === 100) {
                    // 检查是否已经有定时器在运行
                    if (!this.realtimeinterval) {
                        // 设置定时器，每5秒执行一次
                        this.realtimeinterval = setInterval(() => {
                            // 如果时间位置不再为100%，停止定时器
                            if (this.currentTimePosition !== 100) {
                                clearInterval(this.realtimeinterval); // 停止定时器
                                this.realtimeinterval = null; // 清除引用
                                return; // 跳出当前循环
                            }
                            // 更新结束时间和当前时间，并计算时间轴进度和节点数量
                            this.getPlotwithStartandEndTime(eqid) //取标绘点，更新标绘点
                            this.eqendTime = new Date()
                            this.currentTime = this.eqendTime
                            this.timelineAdvancesNumber = ((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (5 * 60 * 1000);
                            this.currentNodeIndex = this.timelineAdvancesNumber
                        }, 5000);
                    }

                    // 当没有结束时间定时器运行时，启动定时器
                    if (!this.eqendtimeinterval) {
                        // 设置定时器，每秒执行一次
                        this.eqendtimeinterval = setInterval(() => {
                            // 如果时间位置不再为100%，停止定时器
                            if (this.currentTimePosition !== 100) {
                                clearInterval(this.eqendtimeinterval); // 停止定时器
                                this.eqendtimeinterval = null; // 清除引用
                                return; // 跳出当前循环
                            }
                            // 更新结束时间和当前时间
                            this.eqendTime = new Date()
                            this.currentTime = this.eqendTime
                        }, 1000);
                    }
                }
            } else {
                console.log("过去的地震")
            }
        },

        /**
         * 根据设备ID获取带有起止时间的绘图信息
         * @param {string} eqid - 设备ID
         */
        getPlotwithStartandEndTime(eqid) {
            // 调用接口获取特定设备的绘图信息
            getPlotwithStartandEndTime({eqid: eqid}).then(res => {

                // 显示标记，追加新的点 （增）
                console.log(res, "res")
                // 遍历返回的绘图信息，检查每个点是否已存在，如果不存在则添加
                res.forEach(item => {
                    const plotexists = this.plots.some(plot => plot.plotId === item.plotId);
                    if (!plotexists) {
                        this.plotisshow[item.plotId] = 0;
                    }
                })

                // 删除的点删除  （删）
                // 创建一个当前绘图ID的集合
                const currentPlotIds = new Set(res.map(item => item.plotId));
                // 移除不再存在的 plotid
                for (const plotId in this.plotisshow) {
                    if (!currentPlotIds.has(plotId)) {
                        // 删除 plotisshow 中的项
                        delete this.plotisshow[plotId];
                        // 从 viewer 中移除对应的点
                        viewer.entities.removeById(plotId);
                    }
                }


                // 更新数组信息（包括点的起止时间、属性信息） （改）
                // 更新this.plots数组中的数据
                this.plots = res
                // 遍历更新后的绘图信息，确保每个点都有起止时间
                this.plots.forEach(item => {
                    if (!item.endTime) {
                        // 为没有结束时间的点设置默认结束时间
                        item.endTime = new Date(this.eqstartTime.getTime() + 10 * 24 * 36000 * 1000);
                    }
                    if (!item.startTime) {
                        // 为没有开始时间的点设置默认开始时间
                        item.startTime = this.eqstartTime;
                    }
                })
                // 将 item 添加到 this.plots
                // this.plots.push(item);
                // 检查当前 item 是否已经存在于 this.plots 中
                // const plotexists = this.plots.some(plot => plot.plotid === item.plotid);
                // if(!plotexists){
                //   // 设置 endtime 和 starttime
                //   if (!item.endtime) {
                //     // item.endtime = new Date(this.eqendTime.getTime() + 5000);
                //     item.endtime = new Date(this.eqstartTime.getTime() + 10*24*36000*1000);
                //   }
                //   if (!item.starttime) {
                //     item.starttime = this.eqstartTime;
                //   }
                //   // 将 item 添加到 this.plots
                //   this.plots.push(item);
                //   // 初始化 plotisshow
                //
                // }
                // })
                // 更新绘图
                this.updatePlot()


                // 开启时间轴
                // this.initTimerLine();
                //   if(this.ifShowData){
                //       this.initTimerLine();
                //   }else{
                //       this.isTimerRunning = false
                //   }
            })
        },
        /*
        * 更新标绘点
        * */
        updatePlot() {
            // 原始代码：console.log(this.plots)
            // 创建一个指向当前上下文的变量，用于在闭包中访问this
            let that = this
            // --------------------------点绘制------------------------------
            // 过滤出绘制类型为点的plots
            let pointArr = this.plots.filter(e => e.drawtype === 'point')
            console.log("点渲染", pointArr)

            let points = [];
            // 遍历点数组，处理每个点的绘制或删除
            pointArr.forEach(item => {
                // 获取当前时间
                const currentDate = new Date(this.currentTime);
                // 获取点的开始和结束时间
                const startDate = new Date(item.startTime);
                const endDate = new Date(item.endTime);

                // 如果点应该显示
                if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
                    this.plotisshow[item.plotId] = 1;

                    // 创建点数据
                    let point = {
                        earthquakeId: item.earthquakeId,
                        plotId: item.plotId,
                        time: item.creationTime.replace("T", " "),
                        plotType: item.plotType,
                        drawtype: item.drawtype,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        height: item.elevation,
                        icon: item.icon
                    };
                    points.push(point); // 收集点数据
                }
                // 如果点应该消失
                if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
                    this.plotisshow[item.plotId] = 0;
                    // console.log(item.plotId, "end");

                // 从 dataSource 中删除点
                if (window.pointDataSource) {
                  const entityToRemove = window.pointDataSource.entities.getById(item.plotId);
                  const ellipseEntityToRemove = window.pointDataSource.entities.getById((item.plotId+'_ellipse'));
                  console.log("entityToRemove",entityToRemove)
                  if (entityToRemove) {
                    window.pointDataSource.entities.remove(entityToRemove); // 移除点
                  }
                  if(ellipseEntityToRemove){
                      window.pointDataSource.entities.remove(ellipseEntityToRemove); // 移除标绘点的动画实体
                  }
                }
              }
            });
            // 批量渲染点
            if (points.length > 0) {
              console.log("")
              cesiumPlot.drawPoints(points,true);
            }

            //--------------------------线绘制------------------------------
            // 根据当前时间和显示状态过滤并更新线条数据
            let polylineArr = this.plots.filter(e => e.drawtype === 'polyline')
            console.log("polylineArr", polylineArr)

            let filteredPolylineArr = []; // 用于存储符合条件的线条数据

            polylineArr.forEach(item => {
                console.log("isshow", this.plotisshow)
                // that.drawPolyline(item)
                const currentDate = new Date(this.currentTime);
                console.log(currentDate)
                const startDate = new Date(item.startTime);
                const endDate = new Date(item.endTime);
                // 检查线条的显示状态和时间范围
                if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
                    this.plotisshow[item.plotId] = 1
                    filteredPolylineArr.push(item); // 收集符合条件的线条
                }
                // 处理线条消失的逻辑
                if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
                    this.plotisshow[item.plotId] = 0
                    // console.log(item.plotId,"end")
                    viewer.entities.removeById(item.plotId)
                    /*因为封装好渲染线的函数中，将每个点都进行了渲染，清除时也要将每个点清除*/
                    for (let i = 0; i < item.geom.coordinates.length; i++) {
                        viewer.entities.removeById(item.plotId + 'point' + (i + 1))
                    }
                }

            })
            // console.log("filteredPolylineArr",filteredPolylineArr)
            // 将过滤后的线条数据传递给绘制函数
          if (points.length > 0) {
            cesiumPlot.getDrawPolyline(filteredPolylineArr)
          }


            //--------------------------面绘制------------------------------
            // 过滤出绘制类型为多边形的数据
            let polygonArr = this.plots.filter(e => e.drawtype === 'polygon')
            // 用于存储符合条件的多边形数据
            let filteredPolygonArr = [];

            // 遍历多边形数据，根据时间判断是否显示
            polygonArr.forEach(item => {
                // 获取当前时间、多边形的开始时间和结束时间
                const currentDate = new Date(this.currentTime);
                const startDate = new Date(item.startTime);
                const endDate = new Date(item.endTime);
                // 如果当前时间在多边形的开始和结束时间内，且多边形未显示，则添加到显示列表
                if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
                    this.plotisshow[item.plotId] = 1
                    filteredPolygonArr.push(item);// 收集符合条件的面
                }
                // 如果当前时间不在多边形的开始和结束时间内，且多边形正在显示，则从显示列表移除并删除实体
                if ((endDate <= currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
                    this.plotisshow[item.plotId] = 0
                    console.log(item.geom.coordinates, "endPOlygon")
                    viewer.entities.removeById(item.plotId)
                    /*因为封装好渲染面的函数中，将每个点都进行了渲染，清除时也要将每个点清除*/
                    // let coords = item.geom.coordinates[0]
                    // for (let i = 0; i < coords.length; i++) {
                    //   console.log(i)
                    //   viewer.entities.removeById(item.plotId + 'point' + (i + 1))
                    //   console.log("wanchan")
                    // }
                }
            })

            // 将符合条件的多边形数据按plotId分组
            let polygonMap = {};
            filteredPolygonArr.forEach(item => {
                if (!polygonMap[item.plotId]) {
                    polygonMap[item.plotId] = [];
                }
                polygonMap[item.plotId].push(item);
            });
          if (points.length > 0) {
            // 遍历分组后的多边形数据，调用绘制多边形的函数进行渲染
            Object.keys(polygonMap).forEach(plotId => {
              let polygonData = polygonMap[plotId];
              console.log("polygonData", polygonData)
              cesiumPlot.getDrawPolygon(polygonData)
            });
          }
        },

        //时间轴操作-----------------------------------------------
        // 暂停播放切换
        toggleTimer() {
            // 如果计时器未运行，则初始化计时器线
            if (!this.isTimerRunning) {
                this.initTimerLine();
            } else {
                // 如果计时器正在运行，则停止计时器
                this.stopTimer();
            }
        },

        /**
         * 初始化计时线
         * 启动计时器，每隔一段时间更新当前时间位置
         */
        initTimerLine() {
            // 标记计时器为运行状态
            this.isTimerRunning = true;

            // 播放一遍完成（停止，如果计算结果超过，设为最大值）
            if (this.currentTimePosition >= 100) {
                this.currentTimePosition = 0;
                this.currentTime = this.eqstartTime;
                this.currentNodeIndex = 0;
            }

            // 每隔100毫秒更新一次当前时间
            this.intervalId = setInterval(() => {
                this.updateCurrentTime();
            }, 100);
        },
        //updateCurrentTime 循环执行

        /**
         * 更新当前时间
         * 此方法用于模拟时间进度条的前进，根据当前速度和节点索引更新当前时间
         * 如果时间进度达到终点，将停止时间进度条并触发相关事件
         * 否则，将根据当前节点索引计算实际时间，并更新时间轴上的标绘点
         */
        updateCurrentTime() {
            // 根据当前速度和节点索引计算新的节点索引，实现时间的前进
            this.currentNodeIndex = (this.currentNodeIndex + 1 * this.currentSpeed) % this.timelineAdvancesNumber //前进timelineAdvancesNumber次，每次5分钟，
            // 计算时间进度条的当前位置增量
            let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed //进度条每次前进
            this.currentTimePosition += tmp;

            // 检查是否达到或超过终点
            if (this.currentTimePosition >= 100) {
                // 达到终点时的处理
                this.currentTimePosition = 100;
                this.currentTime = this.eqendTime
                this.stopTimer();
                this.isTimerRunning = false
                this.intimexuanran(this.eqid)
                // this.xuanran(this.eqid)
            } else {
                // 未达到终点时的处理
                this.currentTimePosition = this.currentTimePosition % 100
                // 根据当前节点索引计算实际时间
                this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
                // 根据是否需要显示标绘层来更新图层
                if (this.isMarkingLayer) {
                    this.updatePlot()
                } else {
                    this.MarkingLayerRemove()
                }
                // end 图层控制 是否显示标绘点（时间轴仍然需要往前）
            }
            // 其他情况的处理（代码中未实现）
            // else{
            //   this.eqendTime=realTime
            //   this.timelineAdvancesNumber=
            // }
        },


        /**
         * 时间轴停止
         * 此方法用于停止当前正在运行的定时器它通过清除间隔标识并重置相关状态来实现
         * 定时器停止后，不会再执行任何操作，确保资源得到正确释放
         */
        stopTimer() {
            // 清除定时器
            clearInterval(this.intervalId);
            // 重置定时器标识为null
            this.intervalId = null;
            // 设置定时器运行状态为false
            this.isTimerRunning = false;

            // console.log("stopTimer")
        },

        /**
         * 前进一步函数，用于模拟时间线前进
         * 该函数通过增加当前节点索引来实现时间线的前进，并更新当前的时间位置和时间
         * 当达到终点时，会重置当前时间位置为100，并停止计时器
         * @param {number} this.currentNodeIndex 当前节点索引，用于指示时间线上的位置
         * @param {number} this.timelineAdvancesNumber 时间线前进的总次数，用于计算节点索引
         * @param {number} this.currentSpeed 当前速度，用于计算时间位置的增加量
         * @param {number} this.currentTimePosition 当前时间位置，表示进度条的当前位置
         * @param {Date} this.currentTime 当前时间，表示当前的时间点
         * @param {boolean} this.isTimerRunning 计时器是否运行中，用于控制时间线的前进
         * @param {string} this.eqendTime 结束时间，表示时间线的终点
         * @param {string} this.eqid 地震ID，用于在渲染时标识地震
         * @param {Date} this.eqstartTime 开始时间，表示时间线的起点
         * @param {function} this.intimexuanran 渲染函数，根据地震ID渲染地震效果
         * @param {function} this.updatePlot 更新图表函数，用于在时间线前进时更新图表
         */
        forward() {
            // 更新当前节点索引，使用模运算确保索引在合法范围内
            this.currentNodeIndex = (this.currentNodeIndex + 1) % this.timelineAdvancesNumber
            // 计算进度条每次前进的量
            let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed
            // 增加当前时间位置
            this.currentTimePosition += tmp;
            // 当达到或超过终点时
            if (this.currentTimePosition >= 100) {
                // 重置当前时间位置为100
                this.currentTimePosition = 100;
                // 设置当前时间为结束时间
                this.currentTime = this.eqendTime
                // 停止计时器
                this.isTimerRunning = false
                // 调用渲染函数，传入地震ID
                this.intimexuanran(this.eqid)
                // this.xuanran(this.eqid)
            } else {
                // 当未达到终点时，对当前时间位置取模确保值在合法范围内
                this.currentTimePosition = this.currentTimePosition % 100
                // 计算新的时间点，每次增加5分钟
                let newTime = new Date(this.currentTime);
                this.currentTime = newTime.setMinutes(newTime.getMinutes() + 5);
                // 更新图表
                this.updatePlot()
            }
            // console.log("========================",this.currentTime)
        },

        /**
         * 后退函数，用于在时间线上向后移动
         * 该函数通过调整当前节点索引和当前时间位置来实现后退
         * 当前时间位置达到0时，停止计时器
         * 否则，根据当前时间位置和节点索引计算新的时间位置和实际时间
         * 并更新图表显示
         */
        backward() {
            // 减小当前节点索引，并根据时间线前进次数取模，以实现循环效果
            this.currentNodeIndex = (this.currentNodeIndex - 1) % this.timelineAdvancesNumber
            // 计算每次后退的进度百分比
            let tmp = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentSpeed
            // 减小当前时间位置
            this.currentTimePosition -= tmp;
            // 当前时间位置小于等于0时，重置当前时间位置和时间，并停止计时器
            if (this.currentTimePosition <= 0) {
                this.currentTimePosition = 0;
                this.currentTime = this.eqstartTime
                this.isTimerRunning = false
            } else {
                // 否则，更新当前时间位置
                this.currentTimePosition = this.currentTimePosition % 100
                // 计算新的时间，这里简化处理，直接减去5分钟
                let newTime = new Date(this.currentTime);
                this.currentTime = newTime.setMinutes(newTime.getMinutes() - 5);
                // 更新图表显示
                this.updatePlot()
            }
        },

        /**
         * 根据用户点击的时间轴位置，跳转到相应的场景
         * @param {MouseEvent} event - 鼠标点击事件
         */
        jumpToTime(event) {
            // 获取时间轴的矩形区域，用于计算点击位置对应的进度
            const timeRulerRect = event.target.closest('.time-ruler').getBoundingClientRect();
            // 计算点击位置相对于时间轴左边缘的距离
            const clickedPosition = event.clientX - timeRulerRect.left;
            // 根据点击位置计算当前时间进度的百分比
            this.currentTimePosition = (clickedPosition / timeRulerRect.width) * 100;
            // 更新时间进度条的宽度，以反映当前时间进度
            this.$el.querySelector('.time-progress').style.width = `${this.currentTimePosition}%`;
            // 根据当前时间进度百分比和总步骤数计算当前步骤索引
            this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber) // Assuming 672 is the total number of steps
            // console.log(this.currentTimePosition,this.timelineAdvancesNumber,"jumpToTime")
            // 根据当前步骤索引计算当前时间，假设每个步骤代表5分钟
            this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
            // console.log("this.currentTime jumpToTime",this.currentTime)
            if (this.currentTimePosition >= 100) {
                // 当时间进度达到或超过100%时，重置为100%
                this.currentTimePosition = 100;
                // 设置当前时间为结束时间
                this.currentTime = this.eqendTime
                // 停止计时器
                this.stopTimer();
                // 更新计时器运行状态标志为false
                this.isTimerRunning = false
                // 调用 intimexuanran 方法，传入地震ID
                this.intimexuanran(this.eqid)
                // this.xuanran(this.eqid)
            } else {
                // 如果时间进度未达到100%，则更新图表
                this.updatePlot();
            }
        },

        /**
         * 时间轴的开始拖拽事件处理函数
         * 该函数用于初始化拖拽操作，记录拖拽开始的位置，并设置拖拽过程中的事件监听器
         * 同时，为了防止在拖拽过程中选中内容，设置了禁止选择的CSS样式
         *
         * @param {MouseEvent} event - 鼠标事件对象，包含拖拽开始时的坐标信息
         */
        startDrag(event) {
            this.isDragging = true; // 标记当前开始进入拖拽状态
            this.dragStartX = event.clientX; // 记录拖拽开始时的鼠标 X 坐标
            document.addEventListener('mousemove', this.drag); // 在文档上添加鼠标移动事件监听器，用于处理拖拽过程
            document.addEventListener('mouseup', this.stopDrag); // 在文档上添加鼠标抬起事件监听器，用于结束拖拽
            // 添加禁用选择的 CSS 样式
            document.body.style.userSelect = 'none';
            document.body.style.WebkitUserSelect = 'none';
            document.body.style.MozUserSelect = 'none';
            document.body.style.msUserSelect = 'none';
        },

        /**
         * 处理鼠标拖动事件
         * @param {MouseEvent} event - 鼠标拖动事件对象
         */
        drag(event) {
            // 如果没有拖动，则不执行后续操作
            if (!this.isDragging) return;
            // 获取时间尺的矩形信息
            const timeRulerRect = this.$el.querySelector('.time-ruler').getBoundingClientRect();
            // 计算鼠标点击位置相对于时间尺左边缘的水平距离
            const clickedPosition = Math.max(timeRulerRect.left, Math.min(event.clientX, timeRulerRect.right)) - timeRulerRect.left;
            // 计算新的进度位置百分比
            const newPosition = (clickedPosition / timeRulerRect.width) * 100;
            // 更新当前时间进度位置
            this.currentTimePosition = newPosition;
            // 更新当前节点索引，根据时间线的总进度数进行比例转换
            this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber);
            // 根据开始时间和当前节点索引计算当前时间
            // 注意：此处将时间增量从15分钟调整为5分钟
            this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
            // 更新时间进度条的宽度，以反映新的进度位置
            this.$el.querySelector('.time-progress').style.width = `${newPosition}%`;
        },

        /**
         * 停止拖拽操作
         * 当用户释放鼠标按钮时调用此方法，以重置拖拽状态并停止监听鼠标事件
         */
        stopDrag() {
            // 重置isDragging状态，表示不再拖拽中
            this.isDragging = false;
            // 移除鼠标移动事件监听器，防止拖拽结束后鼠标移动事件继续触发
            document.removeEventListener('mousemove', this.drag);
            // 移除鼠标释放事件监听器，释放后不再需要此事件处理函数
            document.removeEventListener('mouseup', this.stopDrag);

            // 当currentTimePosition达到或超过100时，进行特殊处理
            if (this.currentTimePosition >= 100) {
                // 将currentTimePosition和currentTime设置为结束时间
                this.currentTimePosition = 100;
                this.currentTime = this.eqendTime;
                // 停止计时器
                this.stopTimer();
                // this.isTimerRunning = false
                // this.xuanran(this.eqid)
                // 调用另一个方法进行处理，传入eqid作为参数
                this.intimexuanran(this.eqid)
            } else {
                // 如果不满足上述条件，调用updatePlot方法更新图表
                this.updatePlot();
            }
            // 恢复默认的选择行为
            document.body.style.userSelect = 'auto';
            document.body.style.WebkitUserSelect = 'auto';
            document.body.style.MozUserSelect = 'auto';
            document.body.style.msUserSelect = 'auto';
        },

        /**
         * 选择时间轴的播放倍速
         *
         * @param {string} speed - 速度的字符串表示，格式为"数字-单位"，如"50-米/秒"
         */
        selectSpeed(speed) {
            // 直接赋值速度选项
            this.speedOption = speed
            // 解析速度字符串中的数字部分，并转换为浮点数作为实际的速度值
            this.currentSpeed = parseFloat(speed.split('-')[0])
            // console.log("-----------------------",this.currentSpeed)
        },
        //时间轴end-------------


        /**
         * 处理实体点击事件的弹窗显示逻辑
         */
        entitiesClickPonpHandler() {
            let that = this;
            // 在屏幕空间事件处理器中添加左键点击事件的处理逻辑
            window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {

                // 检查点击位置是否拾取到实体
                let pickedEntity = window.viewer.scene.pick(click.position);
                window.selectedEntity = pickedEntity?.id;

                // 获取故障信息的 div 元素
                const faultInfoDiv = document.getElementById('faultInfo');

                // 如果拾取到实体
                if (Cesium.defined(pickedEntity)) {
                    let entity = window.selectedEntity;
                  // console.log(entity,"entity======================")
                    // 计算图标的世界坐标
                    this.selectedEntityPosition = this.calculatePosition(click.position);
                    this.updatePopupPosition(); // 确保位置已更新

                    // 如果点击的是断裂带
                    if (entity._layer === "断裂带") {
                        // 获取断裂带的 name 属性
                        const faultName = pickedEntity.id.properties.name._value;

                        // 获取点击位置的地理坐标 (Cartesian3)
                        const cartesian = viewer.scene.pickPosition(click.position);
                        if (!Cesium.defined(cartesian)) {
                            return;
                        }

                        // 将地理坐标 (Cartesian3) 转换为屏幕坐标 (二维)
                        const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, cartesian);

                        // 显示 div 并将其定位到点击位置
                        faultInfoDiv.innerHTML = `${faultName}`;
                        faultInfoDiv.style.display = 'block';
                        faultInfoDiv.style.left = screenPosition.x + 'px';
                        faultInfoDiv.style.top = screenPosition.y + 'px';

                        // 监听地图变化，动态更新 div 的位置
                        window.viewer.scene.postRender.addEventListener(() => {
                            const updatedScreenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, cartesian);
                            if (updatedScreenPosition) {
                                faultInfoDiv.style.left = updatedScreenPosition.x + 'px';
                                faultInfoDiv.style.top = updatedScreenPosition.y + 'px';
                            }
                        });
                    } else {
                        faultInfoDiv.style.display = 'none';
                    }

                    // 如果点击的是标绘点
                    if (entity._layer === "标绘点") {
                        this.timelinePopupVisible = true;
                        this.timelinePopupPosition = this.selectedEntityPopupPosition; // 更新位置
                        // this.timelinePopupData = this.extractDataForTimeline(entity);
                      this.timelinePopupData={}
                      this.timelinePopupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
                        this.routerPopupVisible = false;
                    } else if (entity._billboard) {
                        // 如果点击的是路标
                        this.routerPopupVisible = true;
                        this.routerPopupPosition = this.selectedEntityPopupPosition; // 更新位置
                        this.routerPopupData = this.extractDataForRouter(entity);

                        this.timelinePopupVisible = false;
                    } else {
                        // 如果不是标绘点或路标
                        this.routerPopupVisible = false;
                        this.timelinePopupVisible = false;
                    }
                } else {
                    // 没有选中实体时隐藏 faultInfo
                    faultInfoDiv.style.display = 'none';
                    this.routerPopupVisible = false;
                    this.timelinePopupVisible = false;
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            // 在屏幕空间事件处理器中添加鼠标移动事件的处理逻辑
            window.viewer.screenSpaceEventHandler.setInputAction(movement => {
                // 如果时间线弹窗或路由弹窗可见，则更新弹窗位置
                if (this.timelinePopupVisible || this.routerPopupVisible) {
                    this.updatePopupPosition();
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        },

        /*
        * 添加地震点
        * 在地图上标绘出历史发生过的地震
        * */
        addHistoryEqPoints() {
            // 先清除historyEq实体
            this.removeEntitiesByType("historyEq")
            addHistoryEqPoints(this.centerPoint, this.tableData)
        },

        /**
         * 断裂带加载  200千米以内
         * 在当前中心点位置添加故障区域对象，同时移除现有的故障区域对象
         */
        addFaultZone() {
            // 移除当前所有故障区域实体
            this.removeEntitiesByType("faultZone")
            // 在中心点位置添加新的故障区域
            addFaultZones(this.centerPoint)
        },


        /**
         * 检查并确定是否添加烈度圈要素图层
         * 此函数通过计算长轴的长度来决定是否需要向图层列表中添加烈度圈要素图层
         */
        checkIfOvalCircleLayer() {
            // 计算长轴公式：4.0293 + 1.3003 * 中心点震级 - 3.6404 * 对数(10)
            // 公式用于估算烈度圈的长轴长度，以决定是否添加相应的图层
            let longAxis = 4.0293 + 1.3003 * parseFloat(this.centerPoint.magnitude) - 3.6404 * Math.log10(10); // 计算 longAxis

            // 如果计算得到的长轴长度大于等于6，则向图层列表中添加烈度圈要素图层
            // 烈度圈要素图层的添加基于长轴长度的判断，用于在地图上显示特定的烈度范围
            if (Math.floor(longAxis) >= 6) {
                this.layeritems.push({id: '9', name: '烈度圈要素图层'});
            }
        },

        /**
         * 添加椭圆圈
         *
         * 此方法首先通过类型移除所有现有的椭圆圈实体，然后在指定的中心点位置添加新的椭圆圈
         * 这确保了界面上只会显示最新的一组椭圆圈，避免了图形的叠加和混乱
         *
         * @param {String} type - 实体的类型，用于标识需要移除的实体
         * @param {Object} centerPoint - 椭圆圈的中心点对象，决定了新添加的椭圆圈的位置
         */
        addOvalCircle() {

            // 移除所有已存在的椭圆圈实体，以避免重复添加
            this.removeEntitiesByType("ovalCircle")

            // 在指定的中心点位置添加新的椭圆圈
            addOvalCircles(this.centerPoint)
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
            let height = this.isTerrainLoaded() ? viewer.scene.globe.getHeight(cartographic) : 0;

            // 返回计算得到的经纬度和高度
            return {
                x: longitude, // 经度
                y: latitude,  // 纬度
                z: height     // 高度
            };
        },


        /**
         * 更新故障信息在画布上的位置
         * 此方法用于根据选定的实体位置，更新显示故障信息的div在画布上的位置
         * @param {string} faultName - 故障的名称，将被显示在故障信息div中
         */
        updateFaultInfoPosition(faultName) {
            this.$nextTick(() => {
                if (this.selectedEntityPosition) {
                    // 将选定实体的经纬度坐标转换为窗口坐标系下的位置
                    const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
                        window.viewer.scene,
                        Cesium.Cartesian3.fromDegrees(this.selectedEntityPosition.x, this.selectedEntityPosition.y, this.selectedEntityPosition.z)
                    );
                    if (canvasPosition) {
                        // 获取故障信息的div元素
                        const faultInfoDiv = document.getElementById('faultInfo');
                        // 更新故障信息div的位置和内容
                        faultInfoDiv.style.left = canvasPosition.x + 'px';
                        faultInfoDiv.style.top = canvasPosition.y + 'px';
                        faultInfoDiv.innerHTML = `${faultName}`; // 更新内容
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
                        this.routerPopupPosition = {
                            x: canvasPosition.x + 10,
                            y: canvasPosition.y + 10
                        };
                        this.timelinePopupPosition = {
                            x: canvasPosition.x + 10,
                            y: canvasPosition.y + 10
                        };
                    }
                }
            });
        },

        /**
         * 提取实体数据用于时间线
         *
         * 此函数的目的是将给定的实体对象转换为一个包含特定属性的新对象，
         * 这些属性包括实体的ID、实体的类型以及一个中心点坐标这些信息对于在时间线上
         *
         * @param {Object} entity - 需要提取数据的实体对象，通常包含id和plottype属性
         * @returns {Object} 返回一个新对象，包含plotid、plotname和centerPoint属性
         */
        extractDataForTimeline(entity) {
          console.log(entity,"===================")
            return {
                plotid: entity.id,
                plotname: entity.plottype,
                centerPoint: this.centerPoint,
                drawtype:entity.drawtype,
            };
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


        /**
         * 显示新闻详细内容
         * @param {Object} val - 要显示的新闻内容对象
         */
        detailedNews(val) {
            // console.log("detailedNews-----",val)
            this.showingNewsContent = val

        },

        /**
         * 控制详细新闻对话框的显示与隐藏
         * @param {boolean} val - 控制对话框显示（true）或隐藏（false）的布尔值
         */
        ifShowDialog(val) {
            // console.log("ifShowDialog-----",val)
            this.showDetailedNewsDialog = val
        },

        /**
         * 隐藏新闻对话框
         * @param {boolean} val - 控制对话框显示（true）或隐藏（false）的布尔值
         */
        hideNewsDialog(val) {
            // console.log("showDetailedNewsDialog-----",val)
            this.showDetailedNewsDialog = val
        },

        /**
         * 截图功能
         * 此功能通过创建一个链接元素并模拟点击来触发文件下载
         */
        takeScreenshot() {
            const link = document.createElement('a');
            link.href = fileUrl
            link.download = '2020年6月1日四川雅安芦山县6.1级地震灾害报告.pdf';
            link.click();
        },

        backToHome() {

        },


        /**
         * 检查地形是否已加载
         * cesium自身接口scene.terrainProviderChanged(只读),当地形发生变化时(添加高程)触发
         * 不能用watch来监视scene.terrainProviderChanged,会造成堆栈溢出（内存溢出）
         * 该方法通过检查当前地形提供者的类型来确定地形是否已经加载
         * 如果地形提供者是椭球地形提供者(EllipsoidTerrainProvider)，则视为地形未加载
         * 如果地形提供者已定义且不是椭球地形提供者，则视为地形已加载
         *
         * @returns {Boolean} 返回地形是否已加载的状态
         */
        isTerrainLoaded() {
            // 获取当前的地形提供者
            let terrainProvider = window.viewer.terrainProvider;
            // 检查地形提供者是否是椭球地形提供者
            if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
                // 在控制台输出地形未加载的信息
                // console.log("地形未加载")
                return false;
            } else if (Cesium.defined(terrainProvider)) {
                // console.log("地形已加载")
                return true;
            }
            // console.log("地形未加载")
            return false;
        },

        /**
         * 监听地形提供器变化
         * 当地形提供器发生变化时，此方法将被触发
         * 根据modelName的值设置不同的高度，并尝试查找地形
         * 如果地形已加载，则使用一组预设高度；如果地形未加载，则使用另一组预设高度
         * 目前，高度设置和查找地形的方法被注释掉，需要在适当时候启用或移除
         */
        watchTerrainProviderChanged() {
            let that = this
            window.viewer.scene.terrainProviderChanged.addEventListener(terrainProvider => {
                this.popupVisible = false // 地形改变时关闭弹窗
                let tzs = []
                if (that.modelName === 1) {
                    tzs[0] = 9
                    tzs[1] = -567
                } else {
                    tzs[0] = 15
                    tzs[1] = -557
                }
                if (that.isTerrainLoaded()) {
                    // that.changeHeight(tzs[0])
                    // that.tz = tzs[0]
                    // that.find()
                } else {
                    // that.changeHeight(tzs[1])
                    // that.tz = tzs[1]
                    // that.find()
                }
            });
        },


        /**
         * 此方法通过调用getAllEq函数从服务器获取所有设备的数据，然后将这些数据赋值给tableData属性
         * 同时，成功获取数据后，初始化Cesium相关的viewer、websocket连接和pinia状态管理，以便进行设备位置的标绘
         */
        getEq() {
            let that = this
            getAllEq().then(res => {
                that.tableData = res
                // 初始化标绘所需的viewer、ws、pinia
                let cesiumStore = useCesiumStore()
                cesiumPlot.init(window.viewer, this.websock, cesiumStore)
                // console.log("that.tableData", that.tableData)
            })
        },


        /**
         * 根据给定的行数据更新视图和WebSocket连接
         * 此函数主要用于在用户选择不同的行时，更新界面上的设备ID（eqid），
         * 并通过WebSocket连接发送新的设备ID以获取相关数据
         *
         * @param {Object} row - 要处理的行数据对象，包含设备ID（eqid）
         */
        plotAdj(row) {
            window.viewer.entities.removeAll(); // 清空当前视图中的所有实体，准备显示新的设备数据
            this.eqid = row.eqid // 更新Vue实例中的设备ID
            this.websock.eqid = this.eqid // 更新WebSocket连接中的设备ID，以便正确地发送和接收数据
        },

        /**
         *  ------------------行政区划--------------------
         * 添加雅安行政区划影像图层
         *
         * 此方法旨在向地图中添加雅安市的行政区划影像图层如果图层已存在，则不会重复添加
         * 使用Cesium库加载GeoJSON数据，并根据图层是否已存在来设置不同的显示样式
         */
        addYaanImageryDistrict() {
            // 移除其他区域图层
            this.removethdRegions()
            // 检查是否已添加“行政区划要素图层”
            if (!this.selectedlayersLocal.includes("行政区划要素图层")) {
                // 加载雅安行政区划的GeoJSON数据，并设置显示样式
                let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
                    clampToGround: true, //贴地显示
                    stroke: Cesium.Color.RED,
                    fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
                    strokeWidth: 4,
                });
                // 处理加载成功的GeoJSON数据
                geoPromise.then((dataSource) => {
                    // 添加 geojson
                    window.regionLayer111 = dataSource;
                    window.viewer.dataSources.add(dataSource);
                    // 给定义好的 geojson 的 name 赋值（这里的 dataSource 就是定义好的geojson）
                    dataSource.name = "thd_yaanregion";
                    // 视角跳转到 geojson
                    viewer.flyTo(dataSource.entities.values);

                }).catch((error) => {
                    // 处理加载失败的情况
                    console.error("加载GeoJSON数据失败:", error);
                });
            } else {
                // 如果图层已存在，加载一个透明的GeoJSON数据，以保持图层的存在而不显示内容
                let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
                    stroke: Cesium.Color.TRANSPARENT,
                    fill: Cesium.Color.TRANSPARENT,
                    markerColor: Cesium.Color.TRANSPARENT,
                    markerSize: 0,
                    strokeWidth: 0,
                    clampToGround: true, //贴地显示
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    depthTest: true,
                });
                // 处理加载成功的透明GeoJSON数据
                geoPromise.then((dataSource) => {
                    window.viewer.dataSources.add(dataSource);
                    viewer.flyTo(dataSource.entities.values);
                }).catch((error) => {
                    // 处理加载失败的情况
                    console.error("加载GeoJSON数据失败:", error);
                });
            }
            // 添加雅安市的标签
            let labelData = {lon: 103.003398, lat: 29.981831, name: "雅安市"};
            let position = Cesium.Cartesian3.fromDegrees(labelData.lon, labelData.lat);
            let labelEntity = viewer.entities.add(new Cesium.Entity({
                position: position,
                label: new Cesium.LabelGraphics({
                    text: labelData.name,
                    scale: 1,
                    font: "bolder 50px sans-serif",
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                    pixelOffset: new Cesium.Cartesian2(0, -60)
                })
            }));
            // 保存标签实体的引用
            this.labels.push(labelEntity);
        },

        /**
         * 处理区县点击事件
         * @param {Object} district - 区县对象，包含区县名称和代码等信息
         */
        handleDistrictClick(district) {
            //清除其他实体标签
            this.removethdRegions()
            // this.visible = false;
            // 根据区县代码过滤GeoJSON数据
            let filteredFeatures = yaan.features.filter(feature => {
                return feature.properties.adcode === district.adcode;
            });
            if (filteredFeatures.length > 0) {

                // 创建一个经过过滤的GeoJSON对象，包含过滤后的特性数据
                let filteredGeoJson = {
                    type: "FeatureCollection",
                    features: filteredFeatures
                };

                // 使用Cesium的GeoJsonDataSource.load方法加载经过过滤的GeoJSON数据
                // 该方法用于将GeoJSON数据转换为Cesium的数据源，以便在3D地图中显示
                // 在加载时，设置了数据源的样式属性，包括边颜色、填充颜色和边宽度
                let geoPromise = Cesium.GeoJsonDataSource.load(filteredGeoJson, {
                    clampToGround: true, //贴地显示
                    stroke: Cesium.Color.RED,
                    fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
                    strokeWidth: 4,
                });

                // 处理地理空间数据的Promise对象
                geoPromise.then((dataSource) => {
                    // 将数据源添加到观众的数据显示中
                    window.viewer.dataSources.add(dataSource);
                    // 保存区域图层以便后续使用
                    window.regionLayer111 = dataSource

                    // 遍历每个过滤后的地理特征
                    filteredFeatures.forEach((feature) => {
                        // 获取特征的中心点坐标
                        let center = feature.properties.center;

                        // 检查中心点是否定义且格式正确
                        if (center && center.length === 2) {
                            // 将地理坐标转换为三维空间中的位置
                            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
                            // 创建并添加标签实体到观众的实体集合中
                            let labelEntity = viewer.entities.add(new Cesium.Entity({
                                position: position,
                                label: new Cesium.LabelGraphics({
                                    text: district.name,  // 标签文本为区域名称
                                    scale: 1,  // 标签缩放比例
                                    font: "bolder 50px sans-serif",  // 标签字体样式
                                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,  // 标签样式为填充和轮廓
                                    fillColor: Cesium.Color.fromCssColorString("#ffffff"),  // 标签填充颜色
                                    pixelOffset: new Cesium.Cartesian2(0, -60)  // 标签像素偏移量，用于调整位置
                                })
                            }));
                            // 保存标签实体的引用，以便后续管理和操作
                            this.labels.push(labelEntity);
                        } else {
                            // 如果中心点未定义或格式不正确，输出警告信息
                            console.warn('中心点未定义或格式不正确:', feature);
                        }
                    });
                    // 飞行到数据源中的实体位置，以便用户查看
                    viewer.flyTo(dataSource.entities.values);
                }).catch((error) => {
                    // 如果加载GeoJSON数据失败，输出错误信息
                    console.error("加载GeoJSON数据失败:", error);
                });
            } else {
                console.error("未找到对应的区县:", adcode);
            }
        },

        /**
         * 移除区域图层和相关标签
         * 此函数负责从地图中移除特定的区域图层和与之关联的图例标签
         */
        removethdRegions() {
            // 检查是否存在名为regionLayer111的图层
            if (window.regionLayer111) {
                // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
                window.viewer.dataSources.remove(window.regionLayer111, true);
                // 清空regionLayer111的引用，以便垃圾回收
                window.regionLayer111 = null;
                // console.log("图层已移除");
            }
            // 获取图例容器，准备清空其内容
            const legend = document.getElementById('legend');
            // 循环移除图例容器中的所有子元素
            while (legend.firstChild) {
                legend.removeChild(legend.firstChild);
            }
            // 遍历标签数组，移除每个标签实体
            this.labels.forEach(label => {
                window.viewer.entities.remove(label);
            });
            // 清空标签引用数组，以便垃圾回收
            this.labels = [];
        },

        /**
         * 飞回到地图中心点（发生地震中心）
         * 该方法首先移除之前绘制的区域，然后计算并飞回到地图中心点的位置
         */
        backcenter() {
            // 移除之前绘制的区域
            this.removethdRegions()

            // 根据经度和纬度创建一个三维坐标点，Z轴设置为120000，以确保视角高度
            const position = Cesium.Cartesian3.fromDegrees(
                parseFloat(this.centerPoint.longitude),
                parseFloat(this.centerPoint.latitude),
                120000,
            );

            // 飞行到计算出的中心点位置
            viewer.camera.flyTo({destination: position,})
        },


        /**
         * 初始化绘制功能 图层要素
         * 该方法通过获取特征图层（features layer）来设置灾害储备、应急队伍和应急避难所的数据
         * 它将这些数据存储在组件的相应属性中
         */
        initPlot() {
            getFeaturesLayer().then(res => {
                // 解构赋值，从响应数据中提取灾害储备、应急队伍和应急避难所的信息
                let {disasterReserves, emergencyTeam, emergencyShelters} = res;
                // 更新组件的灾害储备数据
                this.disasterReserves = disasterReserves;
                // 更新组件的应急队伍数据
                this.emergencyTeam = emergencyTeam;
                // 更新组件的应急避难所数据
                this.emergencyShelters = emergencyShelters;
                // 原注释保留，但实际代码中未调用此方法
                // this.updateMapLayers(); // 根据当前选中的图层显示或隐藏图层
            });
        },

        /*
        * 更新地图图层
        * 点击图层复选框时在地图上展示相应的图层数据
        * */
        updateMapLayers() {
            // this.initPlot()
            // 检查选中的图层中是否包含标绘点图层
            const hasDrawingLayer = this.selectedlayersLocal.includes('标绘点图层');
            // 如果包含标绘点图层
            if (hasDrawingLayer) {
                // 确认标绘图层变更，参数为true表示已选中
                this.handleMarkingLayerChange(true);
                // 更新绘图状态
                this.updatePlot();
            } else {
                // 确认标绘图层变更，参数为false表示未选中
                this.handleMarkingLayerChange(false);
                // 移除标绘图层
                this.MarkingLayerRemove();
            }

            // 检查是否选定了雅安行政区划要素图层
            const hasYaanRegionLayer = this.selectedlayersLocal.includes('行政区划要素图层');
            // 如果选定了行政区划要素图层，则移除其他区域图层并添加雅安行政区划图层
            if (hasYaanRegionLayer) {
                this.removethdRegions();
                this.addYaanRegion();
            } else {
                // 如果未选定行政区划要素图层，则移除其他区域图层和雅安行政区划图层
                this.removethdRegions();
                this.removeDataSourcesLayer('YaanRegionLayer');
            }

            // 检查是否选定了人口密度要素图层
            const hasPopLayer = this.selectedlayersLocal.includes('人口密度要素图层');
            // 如果选定了人口密度要素图层，则添加人口密度图层
            if (hasPopLayer) {
                this.addPopLayer();
            } else {
                // 如果未选定人口密度要素图层，则移除人口密度图层
                this.removeImageryLayer('PopLayer');
            }

            // 检查是否选中了交通网络要素图层
            const hasTrafficLayer = this.selectedlayersLocal.includes('交通网络要素图层');
            // 根据选中情况，添加或移除交通网络要素图层
            if (hasTrafficLayer) {
                this.addTrafficLayer();
            } else {
                this.removeImageryLayer('TrafficLayer');
                this.removeImageryLayer('TrafficTxtLayer');
            }

            // 检查是否选中了应急物资存储要素图层
            const hasReservesLayer = this.selectedlayersLocal.includes('应急物资存储要素图层');
            // 根据选中情况，处理或移除应急物资存储要素图层
            if (hasReservesLayer) {
                this.processPoints(this.disasterReserves, 'reserves', emergencyRescueEquipmentLogo, '应急物资存储');
            } else {
                this.removeEntitiesByType('reserves');
            }

            // 检查是否选定了救援队伍分布要素图层
            const hasEmergencyTeamLayer = this.selectedlayersLocal.includes('救援队伍分布要素图层');
            // 如果选定了救援队伍分布要素图层，则处理救援队伍的点数据
            if (hasEmergencyTeamLayer) {
                this.processPoints(this.emergencyTeam, 'emergencyTeam', rescueTeamsInfoLogo, '救援队伍分布');
            } else {
                // 如果没有选定救援队伍分布要素图层，则移除已有的救援队伍分布实体
                this.removeEntitiesByType('emergencyTeam');
            }

            // 检查是否选定了避难场所要素图层
            const hasEmergencySheltersLayer = this.selectedlayersLocal.includes('避难场所要素图层');
            // 如果选定了避难场所要素图层，则处理避难场所的点数据
            if (hasEmergencySheltersLayer) {
                this.processPoints(this.emergencyShelters, 'emergencyShelters', emergencySheltersLogo, '避难场所');
            } else {
                // 如果没有选定避难场所要素图层，则移除已有的避难场所实体
                this.removeEntitiesByType('emergencyShelters');
            }

            // 检查是否选定了历史地震要素图层
            const hasHistoryEqLayer = this.selectedlayersLocal.includes('历史地震要素图层');
            // 如果选定了历史地震要素图层，则添加历史地震的点数据
            if (hasHistoryEqLayer) {
                this.addHistoryEqPoints();
            } else {
                // 如果没有选定历史地震要素图层，则移除已有的历史地震实体
                this.removeEntitiesByType('historyEq');
            }

            // 判断是否选定了断裂带要素图层
            const hasFaultZoneLayer = this.selectedlayersLocal.includes('断裂带要素图层');
            // 如果选定了断裂带要素图层，则添加断裂带图层
            if (hasFaultZoneLayer) {
                this.addFaultZone();
            } else {
                // 如果未选定断裂带要素图层，则移除断裂带图层
                this.removeEntitiesByType('faultZone');
            }

            // 判断是否选定了烈度圈要素图层
            const hasOvalCircleLayer = this.selectedlayersLocal.includes('烈度圈要素图层');
            // 如果选定了烈度圈要素图层，则添加烈度圈图层
            if (hasOvalCircleLayer) {
                this.addOvalCircle();
            } else {
                // 如果未选定烈度圈要素图层，则移除烈度圈图层
                this.removeEntitiesByType('ovalCircle');
            }

            //视角转化 如果 只有标绘点或者没有选择图层，视角更近（震中），如果有其他要素图层，视角拉高（雅安市）
            if ((this.selectedlayersLocal.length == 1 && hasDrawingLayer) || this.selectedlayersLocal.length == 0) {
                // 创建一个Cartesian3对象，用于表示相机将要飞往的经纬度位置
                const position = Cesium.Cartesian3.fromDegrees(
                    parseFloat(this.centerPoint.longitude),
                    parseFloat(this.centerPoint.latitude),
                    120000,
                );
                // 使用flyTo方法使相机飞往指定的经纬度位置
                viewer.camera.flyTo({destination: position,})
            } else {
                // 当选中的图层数量不满足上述条件时，执行以下逻辑
                // 创建一个Cartesian3对象，用于表示相机将要飞往的默认经纬度位置
                const position = Cesium.Cartesian3.fromDegrees(
                    103.0,
                    29.98,
                    500000,
                );
                // 使用flyTo方法使相机飞往默认的经纬度位置
                viewer.camera.flyTo({destination: position,})
            }
            //视角跳转 end

        },

        /**
         * 处理并添加点数据为实体
         *
         * 此函数负责处理点数组，验证数据格式，过滤无效数据，并将有效的点数据添加为实体
         * 它主要用于在地图上标记点，每个点由其经纬度、类型、图标和表格名标识
         *
         * @param {Array} pointArr - 点数据数组，每个点包含经纬度和唯一标识符
         * @param {String} type - 点的类型，用于分类
         * @param {String} icon - 点的图标，用于在地图上显示
         * @param {String} tableName - 点的表格名，用于数据来源
         */
        processPoints(pointArr, type, icon, tableName) {
            // 检查输入的点数据是否为数组，如果不是则记录错误并退出函数
            if (!Array.isArray(pointArr)) {
                console.error(`${tableName} 数据格式不正确`, pointArr);
                return;
            }

            // 过滤掉经度为null的点
            pointArr = pointArr.filter(e => e.longitude !== null);

            // 遍历每个点数据，进行处理
            pointArr.forEach(element => {
                // 检查当前点的uuid是否已存在于地图实体中，如果存在则记录警告并跳过当前实体
                let existingEntity = window.viewer.entities.getById(element.uuid);
                if (existingEntity) {
                    console.warn(`uuid为${element.uuid}的实体已存在。跳过此实体`);
                    return;
                }

                // 将经度和纬度转换为数值类型，并检查是否为有效值及是否在合法范围内
                let longitude = Number(element.longitude);
                let latitude = Number(element.latitude);
                if (isNaN(longitude) || isNaN(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
                    console.error(`uuid为${element.uuid}的实体的坐标无效或超出范围`, {longitude, latitude});
                    return;
                }

                // 为当前点设置类型，并调用addEntity函数将其添加为地图实体
                element.type = type;
                this.addEntity(element, icon, tableName, longitude, latitude);
            });
        },


        /**
         * 向地图中添加实体对象
         *
         * @param {Object} element - 实体对象，包含实体的各类属性
         * @param {String} icon - 实体的图标URL
         * @param {String} tableName - 实体所在的表名称
         * @param {Number} longitude - 实体的经度
         * @param {Number} latitude - 实体的纬度
         */
        addEntity(element, icon, tableName, longitude, latitude) {
            // 使用Cesium的viewer实例向地图中添加一个实体
            window.viewer.entities.add({
                id: element.uuid, // 实体的唯一标识符，使用元素的UUID
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude), // 实体的地理位置，通过经度和纬度转换为Cartesian3坐标
                billboard: { // 实体的图标配置
                    image: icon, // 图标的URL
                    width: 40, // 图标宽度
                    height: 40, // 图标高度
                    eyeOffset: new Cesium.Cartesian3(0, 0, 0), // 图标相对于位置点的偏移量
                    color: Cesium.Color.WHITE.withAlpha(1), // 图标的颜色和透明度
                    scale: 0.8, // 图标的缩放比例
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 图标高度参考，使图标贴合地面
                    depthTest: false, // 禁用深度测试，防止图标被地形遮挡
                    disableDepthTestDistance: Number.POSITIVE_INFINITY // 设置禁用深度测试的距离为无穷远，确保图标始终不进行深度测试
                },
                properties: { // 实体的属性信息
                    tableName: tableName, // 动态传入的表名称
                    ...element, // 将element对象展开，自动填充所有属性
                    lon: element.longitude, // 实体的经度
                    lat: element.latitude // 实体的纬度
                },
            });
        },

        /**
         * 根据类型删除实体
         *
         * 此函数用于从当前窗口的实体集合中，按指定类型删除所有实体
         * 它通过遍历实体集合，检查每个实体的类型属性，如果匹配给定的类型，则删除该实体
         * 采用倒序遍历以避免删除实体时可能导致的索引变化问题
         *
         * @param {string} type - 要删除的实体类型
         */
        removeEntitiesByType(type) {
            // 获取当前窗口中所有的实体
            let entities = window.viewer.entities.values;
            // 倒序遍历实体数组，以确保删除实体时不会影响遍历
            for (let i = entities.length - 1; i >= 0; i--) {
                // 检查当前实体的类型是否与给定类型匹配
                if (entities[i].properties?.type?.getValue() === type) {
                    // 如果匹配，则移除该实体
                    window.viewer.entities.remove(entities[i]);
                }
            }
        },

        /**
         * 检查指定名称的图层是否存在于地图中
         *
         * @param {string} layerName - 需要检查的图层名称
         * @return {boolean} - 如果图层存在，则返回true；否则返回false
         */
        imageryLayersExists(layerName) {
            // 获取地图中所有的图层
            const layers = viewer.imageryLayers;
            // 遍历所有图层，检查是否存在指定名称的图层
            for (let i = 0; i < layers.length; i++) {
                if (layers.get(i).name === layerName) {
                    // 如果找到指定名称的图层，返回true
                    return true;
                }
            }
            // 如果遍历完所有图层后仍未找到指定名称的图层，返回false
            return false;
        },


        /**
         * 添加雅安地区图层
         * 此函数负责将雅安地区的地理边界数据加载到3D地图中，并为其添加可视化图层
         * 如果图层已存在，则不会重复添加
         */
        addYaanRegion() {
            // 检查是否已存在名为'YaanRegionLayer'的数据源，如果不存在则加载
            if (!window.viewer.dataSources.getByName('YaanRegionLayer')[0]) {
                // 加载GeoJSON格式的雅安地区数据，并设置图层的样式
                let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
                    clampToGround: true, //贴地显示
                    stroke: Cesium.Color.RED,
                    fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
                    strokeWidth: 4,
                });

                // 当数据源加载成功后，执行以下操作
                geoPromise.then((dataSource) => {
                    // 将数据源添加到地图中
                    window.viewer.dataSources.add(dataSource);
                    // 给图层取名字,以便删除时找到
                    dataSource.name = 'YaanRegionLayer';

                    // 定义雅安各区县的颜色和名称
                    const colors = [
                        {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
                        {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
                        {color: Cesium.Color.LIGHTGREEN.withAlpha(0.5), name: '名山区'},
                        {color: Cesium.Color.LAVENDER.withAlpha(0.5), name: '荥经县'},
                        {color: Cesium.Color.ORANGE.withAlpha(0.5), name: '汉源县'},
                        {color: Cesium.Color.CYAN.withAlpha(0.5), name: '石棉县'},
                        {color: Cesium.Color.TAN.withAlpha(0.5), name: '天全县'},
                        {color: Cesium.Color.SALMON.withAlpha(0.5), name: '芦山县'},
                        {color: Cesium.Color.LIGHTBLUE.withAlpha(0.5), name: '宝兴县'},
                    ];
                    // 为每个区县实体设置颜色
                    dataSource.entities.values.forEach((entity, index) => {
                        // 根据实体索引依次从颜色数组中取颜色
                        const colorIndex = index % colors.length; // 通过模运算确保不会超出颜色数组范围
                        const colorMaterial = new Cesium.ColorMaterialProperty(colors[colorIndex].color); // 使用 ColorMaterialProperty 包装颜色
                        entity.polygon.material = colorMaterial; // 设置填充颜色
                        // console.log("--------", index, "----------------", entity)
                    });
                    // console.log("dataSource--------------", dataSource.entities.values.length)

                    // 生成图例
                    const legend = document.getElementById('legend');
                    legend.style.display = 'block';
                    colors.forEach((colorItem, index) => {
                        if (index > 0) {
                            const colorBox = document.createElement('div');
                            colorBox.style.display = 'flex';
                            colorBox.style.alignItems = 'center';
                            colorBox.style.marginBottom = '5px';

                            // 创建颜色方块
                            const colorSquare = document.createElement('div');
                            colorSquare.style.width = '20px';
                            colorSquare.style.height = '20px';
                            colorSquare.style.backgroundColor = colorItem.color.toCssColorString(); // 转换 Cesium 颜色为 CSS 颜色字符串
                            colorSquare.style.marginRight = '10px';

                            // 创建颜色名称标签
                            const colorLabel = document.createElement('span');
                            colorLabel.textContent = colorItem.name;

                            // 将颜色方块和名称加入到图例中
                            colorBox.appendChild(colorSquare);
                            colorBox.appendChild(colorLabel);
                            legend.appendChild(colorBox);
                        }

                    });
                }).catch((error) => {
                    // 如果加载数据源失败，则输出错误信息
                    console.error("加载GeoJSON数据失败:", error);
                });
            }
        },


        /**
         * 添加人口图层
         * 此方法用于在地图中添加一个人口图层，如果该图层已存在，则不进行任何操作
         * 人口图层通过Web Map Service (WMS) 提供，具体配置包括服务URL、图层名称和一些请求参数
         */
        addPopLayer() {
            // 检查是否已存在名为'PopLayer'的图层
            let popLayerexists = this.imageryLayersExists('PopLayer')
            if (!popLayerexists) {
                // 如果不存在，则创建并添加新的WMS图层
                let popLayer = viewer.imageryLayers.addImageryProvider(
                    new Cesium.WebMapServiceImageryProvider({
                        url: 'http://10.16.7.69:9080/geoserver/yaan/wms', // WMS服务的URL
                        layers: 'yaan:pop', // 需要请求的图层名称
                        parameters: {
                            service: 'WMS', // 指定服务类型为WMS
                            format: 'image/png', // 指定返回的图像格式为PNG
                            transparent: true // 启用透明背景
                        }
                    })
                );
                popLayer.name = "PopLayer"; // 设置图层名称为"PopLayer"
            }
        },


        /**
         * 添加交通图层到地图
         * 该方法首先检查是否已经存在名为'TrafficLayer'的图层，如果不存在，则从天地图服务添加交通图层
         * 同样，如果不存在名为'TrafficTxtLayer'的图层，则添加交通注记图层
         */
        addTrafficLayer() {
            // 获取天地图API令牌
            let token = TianDiTuToken;

            // 检查是否存在'TrafficLayer'图层
            let trafficLayerexists = this.imageryLayersExists('TrafficLayer')
            if (!trafficLayerexists) {
                // 创建并添加交通图层
                let trafficLayer = viewer.imageryLayers.addImageryProvider(
                    new Cesium.WebMapTileServiceImageryProvider({
                        // 天地图交通图层的URL模板
                        url:
                            "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                            token,
                        layer: "tdtAnnoLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                    })
                );
                trafficLayer.name = "TrafficLayer"; // 设置名称
            }

            // 检查是否存在'TrafficTxtLayer'图层
            let trafficTxtLayerExists = this.imageryLayersExists('TrafficTxtLayer')
            if (!trafficTxtLayerExists) {
                // 创建并添加交通注记图层
                let traffictxtLayer = viewer.imageryLayers.addImageryProvider(
                    new Cesium.WebMapTileServiceImageryProvider({
                        // 天地图交通注记图层的URL模板
                        url:
                            "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" +
                            token,
                        layer: "tdtAnnoLayer",
                        style: "default",
                        format: "image/jpeg",
                        tileMatrixSetID: "GoogleMapsCompatible",
                        show: false, // 初始状态下不显示注记
                    })
                )
                traffictxtLayer.name = "TrafficTxtLayer"
            }
        },

        /**
         * 移除指定名称的影像图层
         *
         * 该方法旨在从当前 viewer 的影像图层列表中移除第一个匹配给定图层名称的图层
         * 主要用于动态管理地图上的影像图层，提高地图的可读性和性能
         * @param {string} layerName - 要移除的影像图层的名称
         *        图层名称是在添加图层时指定的，用于唯一标识每个图层
         */
        removeImageryLayer(layerName) {
            // 获取当前 viewer 的所有影像图层
            const layers = window.viewer.imageryLayers;
            // 遍历所有图层，寻找与给定名称匹配的图层
            for (let i = 0; i < layers.length; i++) {
                // 当找到名称匹配的图层时
                if (layers.get(i).name === layerName) {
                    // 移除该图层
                    layers.remove(layers.get(i));
                    // 完成移除后即返回，结束函数执行
                    return;
                }
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
        //标绘图层清除-->

        /**
         * 移除标记图层
         * 遍历plots数组，查找并移除每个plot对应的图层实体
         */
        MarkingLayerRemove() {
            // 遍历所有plot
            this.plots.forEach(item => {
              console.log("item",item)
              // 从 dataSource 中删除点
              if (window.pointDataSource) {
                const entityToRemove = window.pointDataSource.entities.getById(item.plotId);
                const ellipseEntityToRemove = window.pointDataSource.entities.getById((item.plotId+'_ellipse'));
                console.log("entityToRemove",entityToRemove)
                if (entityToRemove) {
                  window.pointDataSource.entities.remove(entityToRemove); // 移除点
                }
                if(ellipseEntityToRemove){
                  window.pointDataSource.entities.remove(ellipseEntityToRemove); // 移除标绘点的动画实体
                }
              }

              viewer.entities.removeById(item.plotId);
                    // 标记该plotId对应的图层为隐藏状态
              this.plotisshow[item.plotId] = 0

            })
        },

        /**
         * 处理标记图层切换
         * 当切换到本地标记图层时，如果不存在名为'drawingLayer'的图层，则创建一个新的自定义图层并添加到视图中
         * 当切换到非本地标记图层时，如果存在名为'drawingLayer'的图层，则从视图中移除该图层
         *
         * @param {boolean} isMarkingLayerLocal - 表示是否为本地标记图层
         */
        handleMarkingLayerChange(isMarkingLayerLocal) {
            if (isMarkingLayerLocal) {
                // 如果视图中不存在名为'drawingLayer'的图层，则创建一个新的自定义图层并添加到视图中
                if (!window.viewer.dataSources.getByName('drawingLayer')[0]) {
                    let newLayer = new Cesium.CustomDataSource('drawingLayer');
                    window.viewer.dataSources.add(newLayer);
                    newLayer.show = true;
                    this.isMarkingLayerLocal = true;
                }
            } else {
                // 当切换到非本地标记图层时，将isMarkingLayerLocal设置为false
                this.isMarkingLayerLocal = false;
                // 如果视图中存在名为'drawingLayer'的图层，则从视图中移除该图层
                let dataSource = window.viewer.dataSources.getByName('drawingLayer')[0];
                if (dataSource) {
                    window.viewer.dataSources.remove(dataSource);
                }
            }
        },

        /**
         * 根据经纬度获取人口密度信息
         *
         * 该函数通过调用WMS服务来获取给定经纬度坐标附近的人口密度信息它发送一个HTTP请求，请求类型为GetFeatureInfo，
         * 并指定了相应的查询图层和查询范围（通过bounding box指定）返回的人口密度信息将以JSON格式进行处理
         *
         * @param {number} longitude - 经度坐标，用于指定查询区域的中心点
         * @param {number} latitude - 纬度坐标，用于指定查询区域的中心点
         */
        getPopDesity(longitude, latitude) {
            // WMS服务的URL
            const url = "http://10.16.7.69:9080/geoserver/yaan/wms"
            // 查询区域的边界框大小，用于确定查询区域的范围
            const bboxSize = 0.001
            // 构建URL查询参数
            const urlParams = new URLSearchParams({
                service: 'WMS',
                request: 'GetFeatureInfo',
                version: '1.1.1',
                layers: "yaan:pop",
                query_layers: "yaan:pop",
                bbox: `${longitude - bboxSize},${latitude - bboxSize},${longitude + bboxSize},${latitude + bboxSize}`,
                width: 101,
                height: 101,
                info_format: 'application/json',
                x: 50,
                y: 50,
                srs: 'EPSG:4326',
            })
            // 构建完整的请求URL
            const fullUrl = `${url}?${urlParams.toString()}`;
            // 打印调试信息
            // console.log('GetFeatureInfo URL:', fullUrl);
            // 发送HTTP请求，并处理响应
            fetch(fullUrl).then(response => response.json()).then(data => {
                // 处理返回的数据，这里仅打印出人口密度信息
                // console.log(data.features[0].properties)
            }).catch(error => {
                // 错误处理，打印错误信息
                // console.error('There was an error!', error);
            });
        },


        /**
         * 专题图下载
         * 更新主题地图的预览
         * 当选择了一个主题地图后，显示地图的预览图；如果没有选择，则隐藏预览图
         */
    updatethematicMap(){
      if(this.selectthematicMap){
        this.ifShowMapPreview=true
        const selectedData = MapPicUrl.find(item => item.eqid === this.eqid && item.name===this.selectthematicMap);
        console.log(selectedData)
        this.imgurlFromDate = selectedData.path
        this.imgName=selectedData.name
        // console.log("11111",this.imgurlFromDate, this.imgName)
        this.imgshowURL=new URL(this.imgurlFromDate, import.meta.url).href
        // console.log(this.imgshowURL)
      }
     else{
        this.ifShowMapPreview=false
      }

    },
    ifShowThematicMapDialog(val) {
      this.ifShowMapPreview= val // 是否预览专题图 = val
      if( !val){this.selectthematicMap=null}
    },
    //专题图 end

    //报告产出
    updateReportItem(){
      if(this.selectReportItem){
        console.log(this.selectReportItem)
        const selectedData = ReportUrl.find(item => item.eqid === this.eqid && item.name===this.selectReportItem);
        const link = document.createElement('a');
        link.href = selectedData.path;
        link.download = selectedData.name; // 指定下载的文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
          this.selectReportItem = null;
        }, 1000); // 1000 毫秒后执行
      }
    }


  }
}
</script>

<style scoped>
.eqtitle {
    background-color: #0d325f;
    width: 100%;
    height: 33px;
    display: flex;
    align-items: center; /* 垂直居中 */
    font-weight: bold; /* 文字加粗 */
}

.eqtitle-text_eqname {
    color: white;
    font-size: 18px;
    font-weight: bold;
    margin-left: 30px;
    margin-right: 60%;
}

#box {
    height: calc(100vh - 33px);
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

#cesiumContainer {
    height: calc(100vh - 33px);
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.current-time-info {
    position: absolute;
    bottom: 3%;
    width: 30%;
    left: 8%;
}

.end-time-info {
    position: absolute;
    bottom: 3%;
    width: 45%;
    right: 0%;
}

.end-time-info .timelabel span:nth-child(2) {
    margin: 0 5px; /* 分隔符前后的间隔 */
}

.timelabel {
    color: #ffffff;
}

/*·························································*/
.bottom {
    height: 8%;
    width: 50%;
    left: 27%;
    bottom: 5%;
    position: absolute;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.play {
    width: 4%;
    height: 100%;
    margin-left: 1%;
    display: flex;
    align-items: center;
}

.play-icon,
.pause-icon {
    width: 100%;
    margin-right: 4px;
    height: auto;
    cursor: pointer;
}

#speedSelect {
    left: -103px;
    position: relative;
    padding: 5px;
    font-size: 14px;
}


.time-ruler {
    position: relative;
    width: 69%;
    height: 8px;
    left: -15%;
    background-color: #ddd;
    border-radius: 4px;
    margin: 0 1%;
    cursor: pointer;
    flex-direction: row;
}

.speedButton {
    position: relative;
    left: 102%;
    color: white;
    top: -50%;
}

/* 原有的 chooseSpeed 样式 */
.chooseSpeed {
    width: 40px;
    height: 60px;
    position: absolute;
    padding: 0 0px 5px;
    border-radius: 3px;
    top: -65px;
    left: 97%;
    z-index: 30; /* 更高的层级 */
    background-color: rgba(40, 40, 40, 0.7);
    color: white;
    text-align: center;
    display: none; /* 默认隐藏 */
}

/* 当 mouse hover speedButton 时显示 chooseSpeed */
.speedButton:hover + .chooseSpeed,
.chooseSpeed:hover {
    display: block;
}

.time-ruler-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.time-progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #196cd2;
    border-radius: 4px;
    /*transition: width 0.1s ease;*/
}

.time-slider {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #fff;
    border: 2px solid #196cd2;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    /*transition: left 0.1s ease;*/
}

.tmp {
    position: absolute;
    top: 0%;
    width: 100%;
    height: 100%;
    padding: 10px;
    border-radius: 5px;
    right: 0%;
    z-index: 1;
    background-color: rgba(40, 40, 40, 0.3);
}

.button-container {
    position: absolute;
    z-index: 20;
    top: 6.3%;
    left: 27%;
}

.thematic-button {
    position: absolute;
    z-index: 20;
    top: 6.3%;
    left: 20%;
}

.back-button {
    position: absolute;
    z-index: 20;
    top: 6.3%;
    right: 21%;
}

.draw-button {
    position: absolute;
    z-index: 20;
    top: 6.3%;
    left: 14%;
}

.eqlist-button {
    position: absolute;
    z-index: 20;
    top: 6.3%;
    left: 2%;
}

.layer-button {
    position: absolute;
    z-index: 20;
    top: 6.3%;
    left: 8%;
}

.regionjump-button {
    position: absolute;
    z-index: 20;
    top: 6.3%;
    left: 14%;
}

.layerclear-button {
    position: absolute;
    z-index: 20;
    top: 6.3%;
    left: 20%;
}

.thd-eqtable {
    background-color: #324257;
    width: 30%;
    top: 10%;
    height: 43%;
    z-index: 30;
    left: 1%;
    position: absolute;
}

.dropdown {
  background-color: #333832;
  width: 25%;
  padding: 15px;
  z-index: 30;
  left: 1%;
  top: 10%;
  position: absolute;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease;
}
.dropdown.expanded {
  max-height: 550px; /* 根据实际内容调整 */
  overflow-y: auto;
}
/*图层要素选项颜色改为白色*/
.el-checkbox {
    color: #FFFFFF;
}

/*行政区划按钮样式*/
.district-buttons {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.city-button, .district-button {
    flex: 0 0 20%; /* 每行5个按钮 */
    display: flex;
    justify-content: center;
    margin: 4px; /* 调整按钮之间的间距 */
}

.el-button {
    font-size: 12px; /* 调整按钮字体大小 */
    padding: 6px 12px; /* 调整按钮内边距 */
    width: 100%; /* 使按钮宽度自适应 */
}

/*弹窗样式*/
.grid-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 创建2列，等宽 */
    gap: 8px; /* 列间距 */
}

/*图层要素选项颜色改为白色*/
.el-checkbox {
    color: #FFFFFF;
}

/* 覆盖 el-tooltip 的宽度 */
.el-tooltip__popper {
    min-width: 150px; /* 设置下拉框的最小宽度 */
    max-width: 200px; /* 设置下拉框的最大宽度 */
}

/* 如果要针对特定的菜单项，可以通过更具体的选择器进行控制 */
.el-menu-item[data-index="5"] .el-tooltip__popper {
    width: 100px; /* 专题图下载的下拉框宽度 */
}

.el-menu-item[data-index="6"] .el-tooltip__popper {
    width: 200px; /* 返回首页的下拉框宽度 */
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

:deep(.distance-legend) {
    bottom: 1% !important;
}


</style>
