<template>
  <div>
    <div class="eqtitle">
      <span class="eqtitle-text_eqname">{{ this.title.replace("T", " ") }}级地震</span>
      <div v-for="(menu, index) in menus" :key="index" class="menu-item" @mouseover="showDropdown(index)"
           @mouseleave="hideDropdown(index)" @click="handleMenuAction(menu.action)">
        <div class="menu-label">
          <span v-if="menu.icon" v-html="menu.icon" style="margin-right: 10px"></span>
          {{ menu.name }}
        </div>
        <div v-if="menu.showDropdown && menu.items.length > 0" class="dropdown">
          <div v-for="(item, subIndex) in menu.items" :key="subIndex" class="dropdown-item"
               @click="switchPanel(item.action)">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
    <div id="cesiumContainer" class="situation_cesiumContainer">
      <el-form v-if="showEqList" class="situation_eqTable" @submit.prevent>
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <div class="modelAdj">查询</div>
          <el-input
              v-model="queryParams"
              placeholder="请输入搜索信息"
              clearable
              @keydown.enter="handleQuery"
              style="width: 200px; margin-right: 10px;"
          />
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button @click="showEqList = false">隐藏地震列表</el-button>
        </div>
        <el-table :data="tableData" style="width: 100%;margin-bottom: 5px" :stripe="true"
                  :header-cell-style="tableHeaderColor" :cell-style="tableColor">
          <el-table-column label="序号" width="55">
            <template #default="{ row, column, $index }">
              {{ ($index + 1) + (currentPage - 1) * pageSize }}
            </template>
          </el-table-column>
          <el-table-column prop="time" label="发震时间" width="220">
            <template #default="scope">
              {{ timestampToTimeChina(scope.row.time) }}
            </template>
          </el-table-column>
          <el-table-column prop="earthquakeName" label="位置" width="170">
            <template #default="scope">
              <el-popover placement="top" :width="300" trigger="hover" v-if="scope.row.earthquakeName.length>=10">
                <div>{{ scope.row.earthquakeName }}</div>
                <template #reference>
                  <div>
                    <span class="posInfo">
                      {{ scope.row.earthquakeName }}
                    </span>
                  </div>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="magnitude" label="震级" width="55"/>
          <el-table-column label="地震类型" width="100" show-overflow-tooltip>
            <template #default="{ row }">
              <el-button
                  :type="row.eqType === 'Z' ? 'success' : (row.eqType === 'Y' ? 'danger':'primary')"
                  plain
                  size="mini"
                  style="margin: 0; padding: 2px 8px; border-radius: 4px;"
              >
                {{ row.eqType === 'Z' ? '真实地震' : (row.eqType === 'Y' ? '演练地震' : '测试地震') }}
              </el-button>
            </template>
          </el-table-column>
          <!--        <el-table-column prop="latitude" label="纬度" width="65"></el-table-column>-->
          <!--        <el-table-column prop="depth" label="深度" width="50"></el-table-column>-->
          <el-table-column label="操作" width="75">
            <template #default="scope">
              <el-button
                  size="small"
                  @click="plotAdj(scope.row)">查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="total">
        </el-pagination>
      </el-form>
      <el-form v-if="showToolbar" class="noteContainer">
        <div class="modelAdj">信息标注工具<span style="margin-left: 10px;" @click="showToolbar = false">隐藏工具栏</span></div>
        <el-row>
          <el-col :span="13">
            <el-tree class="plotTool" :data="plotTreeData" :props="defaultProps" @node-click="handleNodeClick"
                     accordion></el-tree>
          </el-col>
          <el-col :span="11">
          <span class="plotTreeItem" v-for="(item,index) in plotTreeClassification" @click="treeItemClick(item)">
            <el-tooltip class="plottreetooltip" effect="dark" :content="item.name" placement="top-start">
<!--              <img :src="'http://59.213.183.7/prod-api/' +'/uploads/PlotsPic/' +item.img+ '.png?t=' + new Date().getTime()"  width="17%" height="43.3px">-->
              <img :src="'http://localhost:8080'+'/uploads/PlotsPic/' +item.img+ '.png?t=' + new Date().getTime()" width="17%" height="43.3px">
            </el-tooltip>
          </span>
          </el-col>
        </el-row>
      </el-form>
      <addMarkCollectionDialog
          :eqOccurrenceTime="eqOccurrenceTime"
          :addMarkDialogFormVisible="addMarkDialogFormVisible"
          @wsSendPoint="wsSendPoint"
          @drawPoints="drawPoints"
          @ifPointAnimate="ifPointAnimation"
          @clearMarkDialogForm="resetAddMarkCollection"
          @sendPlot="sendPlot"
      />
      <addPolylineDialog
          :eqOccurrenceTime="eqOccurrenceTime"
          :addPolylineDialogFormVisible="addPolylineDialogFormVisible"
          @wsSendPoint="wsSendPoint"
          @clearMarkDialogForm="resetPolyline"
          @sendPlot="sendPlot"
      />
      <addPolygonDialog
          :eqOccurrenceTime="eqOccurrenceTime"
          :addPolygonDialogFormVisible="addPolygonDialogFormVisible"
          @wsSendPoint="wsSendPoint"
          @clearMarkDialogForm="resetPolygon"
          @sendPlot="sendPlot"
      />
      <commonPanel
          :visible="popupVisible"
          :position="popupPosition"
          :popupData="popupData"
          :ifedit="true"
          @wsSendPoint="wsSendPoint"
          @closePlotPop="closePlotPop"
          @updateQuery="updateQuery"
      />
      <dataSourcePanel
          :visible="dataSourcePopupVisible"
          :position="dataSourcePopupPosition"
          :popupData="dataSourcePopupData"
      />


      <el-upload
          ref="upload"
          :action="uploadUrl"
          :multiple="false"
          :show-file-list="false"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          :headers="this.headers"
          style="position: absolute;top: 150px;right: 100px;z-index: 100;"
      >
      </el-upload>
      <!-- 提示框 -->
      <el-dialog :visible.sync="successDialogVisible" title="导入成功" width="30%">
        <p>文件已成功导入，以下为导入的概要信息：</p>
        <el-table :data="importSummary" style="width: 100%">
          <el-table-column prop="key" label="属性" width="120"></el-table-column>
          <el-table-column prop="value" label="值"></el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer">
          <el-button @click="successDialogVisible = false">关闭</el-button>
        </div>
      </el-dialog>

      <el-notification v-if="errorMessage" :title="'导入失败'" :message="errorMessage" type="error" duration="5000">
      </el-notification>

      <el-dialog
          v-model="selectVisible"
          width="30%"
          @close="selectVisible=false"
      >
        <template #title>
          <div style="text-align: center;">{{ this.excelPanel }}</div>
        </template>

        <div>
          <div style="display: flex">

            <div style="width: 50%">
              <div>可选择标绘名称</div>
              <el-row>
                <el-tree
                    ref="tree"
                    :data="plotTreeData"
                    :props="defaultProps"
                    show-checkbox
                    node-key="label"
                    @check-change="handleCheck"
                >
                </el-tree>
              </el-row>
            </div>

            <div>
              <div>已选择标绘名称</div>
              <ul>
                <li v-for="(item, index) in selectedNodes" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>

          </div>

          <div style="display: flex">
            <div style="width: 50%">
              <div style="text-align: center;">
                <el-button type="primary" @click="confirmDownload()">确定</el-button>
              </div>
            </div>
            <div style="width: 50%">
              <div style="text-align: center;">
                <el-button type="primary" @click="cancelDownload()">取消</el-button>
              </div>
            </div>
          </div>
        </div>


      </el-dialog>

      <el-button style="position: absolute;top: 90px;left: 10px;z-index: 1;" v-if="!showEqList" @click="showEqList = true">显示地震列表</el-button>
      <el-button style="position: absolute;top: 500px;left: 10px;z-index: 1;" v-if="!showToolbar" @click="showToolbar = true">显示工具栏</el-button>
    </div>
    <!-- Cesium 视图 -->
    <!--    <layeredShowPlot :zoomLevel="zoomLevel" :pointsLayer="pointsLayer"/>-->

    <div class="legend-container" style="position: absolute;bottom: 0;right: 0;" v-if="showLegend">
      <el-table stripe :row-style="{ height: '30px' }" :cell-style="{ padding: '0px' }" :data="legendPlotData"
                style="width: 100%">
        <el-table-column label="图标" width="50">
          <template v-slot="scope">
<!--        <img :src="'http://59.213.183.7/prod-api/' +'/uploads/PlotsPic/' +scope.row.icon+ '.png?t=' + new Date().getTime()" alt="icon" style="width: 20px; height: 20px;"/>-->
            <img :src="'http://localhost:8080'+'/uploads/PlotsPic/' +scope.row.icon+ '.png?t=' + new Date().getTime()" alt="icon" style="width: 20px; height: 20px;"/>
          </template>
        </el-table-column>
        <el-table-column prop="plotType" label="类型" width="180"></el-table-column>
        <el-table-column prop="count" label="数量" width="50"></el-table-column>
      </el-table>
      <div class="compassContainer" ref="compassContainer"></div>
    </div>

    <div v-if="isShowMessageIcon"
         style="position: fixed; top: 150px; left: 50%; transform: translate(-50%, -50%); z-index: 9999; display: flex; align-items: center; justify-content: center; width: 200px; height: 50px; background-color: rgba(13, 50, 95, 0.7);border-radius: 10px;">
      <p style="color: #fff; margin: 0;">您正在进行标绘：</p>
      <img :src="this.messageIcon" style="width: 30px; height: 30px;">
    </div>


    <div v-if="loading" class="loading-container">
      <p>正在导出，请稍候...</p>
    </div>
    <div v-if="loadingupdate" class="loading-container">
      <p>正在导入，请稍候...</p>
    </div>
    <!-- 用于显示统计信息的 div -->


    <div class="dialog-visible" v-show="dialogVisible">
      <div class="dialog-content">
        <span class="dialog-close" @click="dialogVisible = false">×</span>
        <h3>导入数据统计</h3>
        <p>总共导入了 {{ totalCount }} 条标绘数据</p>
        <p>总共花费时间：{{ elapsedTime }} 秒</p>
        <p :class="importStatus === '导入成功' ? 'success' : 'error'">导入状态：{{ importStatus }}</p>
        <button class="dialog-button" @click="dialogVisible = false">确定</button>
      </div>
    </div>


    <!--    专题图预览组件    -->
    <thematicMapPreview
        @ifShowThematicMapDialog="ifShowDialog"
        :imgshowURL="imgshowURL"
        :imgurlFromDate="imgurlFromDate"
        :imgName="imgName"
        :ifShowMapPreview="ifShowMapPreview"
        :showTypes="showTypes"
        :corners="corners"
        :step="step"
    ></thematicMapPreview>
    <!--      地震列表组件-点击列表“详情”显示专题图列表      -->
    <plotSearch
        :eqid="eqid"

        :plotArray="plots"
    ></plotSearch>
<!--    :plotArray="plotArray"-->

  </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {ElMessage} from 'element-plus'
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getExcelPlotInfo, getPlot, getPlotIcon} from '@/api/system/plot'
import {getAllEq, getAllEqList, getEqById, getEqListById} from '@/api/system/eqlist'
import {initWebSocket, websocketonmessage} from '@/cesium/WS.js'
import cesiumPlot from '@/cesium/plot/cesiumPlot'
import addMarkCollectionDialog from "@/components/Cesium/addMarkCollectionDialog"
import addPolylineDialog from "@/components/Cesium/addPolylineDialog.vue"
import addPolygonDialog from '@/components/Cesium/addPolygonDialog'
import commonPanel from "@/components/Cesium/CommonPanel";
import {useCesiumStore} from '@/store/modules/cesium.js'
import centerstar from "@/assets/icons/TimeLine/震中.png";
import Arrow from "@/cesium/drawArrow/drawPlot.js"
import dataSourcePanel from "@/components/Panel/dataSourcePanel.vue";
import {plotType} from "../../../cesium/plot/plotType.js";
import {downloadPlotExcel} from "../../../api/system/excel.js";
import {getToken} from "../../../utils/auth.js";
import * as XLSX from "xlsx";
import layeredShowPlot from '@/components/Cesium/layeredShowPlot.vue'
import html2canvas from "html2canvas";
import {querySituationData} from "@/api/system/model.js";
import plotSearch from '@/components/Cesium/plotSearch.vue'
import ThematicMapPreview from "@/components/ThematicMap/thematicMapPreview.vue";
import {Position} from "@element-plus/icons-vue";
import {TianDiTuToken} from "@/cesium/tool/config.js";
import {tianditu} from "@/utils/server.js";
import timeLine from "@/cesium/timeLine.js";

export default {
  components: {
    Position,
    ThematicMapPreview,
    dataSourcePanel,
    addMarkCollectionDialog, commonPanel, addPolygonDialog, addPolylineDialog, layeredShowPlot, plotSearch
  },
  data: function () {
    return {
      //----------menu选择框----------------
      menus: [
        {
          name: '标绘数据导入导出',
          icon: `<svg t="1731159828946" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5849" width="32" height="32"><path d="M521.092741 500.408889c0-139.994074-111.540148-253.458963-249.135408-253.458963S22.821926 360.414815 22.821926 500.408889a258.322963 258.322963 0 0 0 14.52563 85.366518c21.973333 62.677333 94.971259 168.571259 218.638222 317.805037 0.839111 0.96237 1.801481 1.92 2.763852 2.768593 8.884148 7.324444 21.968593 6.120296 29.174518-2.768593 123.543704-149.001481 196.304593-254.900148 218.396445-317.330963a255.454815 255.454815 0 0 0 14.772148-85.840592z m-249.135408 84.522667c-45.866667 0-83.086222-37.82163-83.086222-84.522667S226.090667 416 271.957333 416s83.081481 37.82637 83.081482 84.408889c-0.118519 46.701037-37.214815 84.522667-83.081482 84.522667z m432.474074-83.446519c0.602074 0.720593 1.208889 1.322667 1.801482 1.801482 5.883259 4.92563 14.767407 4.081778 19.693037-1.801482 83.081481-100.252444 132.062815-171.448889 146.958222-213.475556a173.302519 173.302519 0 0 0 9.841778-57.870222c0-94.132148-75.036444-170.491259-167.604148-170.491259-92.572444 0-167.604148 76.245333-167.604148 170.491259 0 19.569778 3.242667 39.021037 9.723259 57.391408 14.881185 42.145185 63.872 113.464889 147.190518 213.95437z m10.690371-328.25363c30.852741 0 55.826963 25.453037 55.826963 56.789334 0 31.454815-24.978963 56.907852-55.826963 56.907852-30.857481 0-55.831704-25.453037-55.831704-56.907852-0.004741-31.454815 24.969481-56.789333 55.831704-56.789334z m230.878815 515.915852c-75.278222-28.695704-166.888296-21.371259-200.026074-122.823111h-56.192s-28.340148 98.569481 230.528 174.212741c144.080593 49.943704-75.761778 263.186963-489.623704 112.497778l-48.507259 58.112s246.97837 116.100741 478.577777 32.298666 162.446222-224.881778 85.24326-254.298074z" fill="#ffffff"></path></svg>`,
          items: [
            {name: '下载导入标绘数据模板', action: "showSelect(import)"},
            {name: '导出当前地震标绘数据', action: "showSelect(export)"},
            {name: '上传当前地震标绘数据', action: 'triggerUpload'}
          ],
          action: '',
          showDropdown: false,
        },
        {
          name: '导出专题图',
          icon: `<svg class="svg-icon" aria-hidden="true" style="width: 32px;height: 32px"><use xlink:href="#icon-dict" fill=""></use></svg>`,
          items: [],
          action: 'exportCesiumTheme',
          showDropdown: false,
        },
      ],
      panels: {
        tableVisible: true, // 显示表格
      },
      successDialogVisible: false, // 控制成功提示框显示
      errorMessage: "", // 错误信息提示
      importSummary: [], // 导入文件的概要信息

      // 用于控制弹窗显示与否
      dialogVisible: false,
      totalCount: 0,  // 总导入数据条数
      elapsedTime: 0,  // 花费时间
      importStatus: '',  // 导入状态
      //-----------标绘部分--------------
      polylineStatus: 0,//0 标绘线未激活状态，1 激活状态
      typeList: null,// 点标注控件根据此数据生成
      refenceTypeList: null,//用来对照弹窗中类型的中文
      message: null, // 添加点标绘的时候的弹窗相关
      addMarkDialogFormVisible: false, // dian标绘信息填写对话框的显示和隐藏
      addPolylineDialogFormVisible: false,// xian标绘信息填写对话框的显示和隐藏
      addPolygonDialogFormVisible: false,// mian标绘信息填写对话框的显示和隐藏
      showMarkCollection: false, // 点标绘控件的显示和隐藏
      openAddStatus: true, // 用来控制添加billboard按钮的状态，点一次后只有添加完点才能再点击
      ifPointAnimate: false, // 说明是否为新标绘的点
      //-----------弹窗部分--------------
      selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件

      dataSourcePopupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      dataSourcePopupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      dataSourcePopupData: [], // 弹窗内容，传值给子组件

      //--------------------------------------------------
      showPolygon: false, // y面的删除按钮
      showPolyline: false,// 线的删除按钮
      // ---------------------------------------------------
      plotPicture: [],
      //-------------ws---------------------
      websock: null,
      //-----------------------------------
      plotTreeData: [
        {
          label: '现场救援类',
          children: [
            {
              label: 'I类（救援力量类）',
            },
            {
              label: 'II类（救援行动类）',
            },
          ]
        },
        {
          label: '次生灾害类',
          children: [
            {
              label: 'I类（次生地质灾害）',
            },
            {
              label: 'II类（建筑物破坏类）',
            },
            {
              label: 'III类（交通设施破坏类）',
            },
            {
              label: 'IV类（生命线工程破坏类）',
            },
            {
              label: 'V类（水利工程破坏类）',
            },
            {
              label: 'VI类（安全生产事故类）',
            },
          ]
        },
        {
          label: '应急避难类',
          children: [
            {
              label: 'I类（应急避难功能区类）',
            },
            // {
            //   label: 'II类（应急避难设施设备类）',
            // },
            // {
            //   label: 'III类（应急避难场所类）',
            // },
          ]
        },
        // {
        //   label: '量算工具',
        // }
      ],
      copiedPlotTreeData: [],
      defaultProps: {
        label: 'label',
        children: 'children',
      },
      plotTreeClassification: [],
      //----------------------------------
      total: 0,
      pageSize: 5,
      currentPage: 1,
      getEqData: [],
      tableData: [],
      //----------------------------------
      eqid: '',
      title: '',
      popupVisiblePolygon: false,
      defaultInputValue: '',
      clickEvent: null,// 用于存储点击事件对象
      //----------------------------------
      // 震中点数据结构
      centerPoint: {
        plotid: 'center',
        earthquakeName: '',
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
      //----------------------------------
      renderedPlotIds: new Set(), // 用于存储已经渲染的 plotid
      //----------------------------------
      zoomLevel: '市', // 初始化缩放层级
      pointsLayer: [], //传到子组件
      //----------------------------------
      plotList: [], // 用于指定地震标绘点导出
      plots: [],
      selectVisible: false,
      selectedNodes: [], // 用于存储选中的节点信息

      uploadUrl: '',
      headers: {
        Authorization: "Bearer " + getToken()
      },
      fieldMapping: [],
      excelContent: [],
      excelPanel: '',
      // ----------------------------------
      legendTableData: [],

      //-----------导出图片----------------
      loading: false, // 控制加载状态
      loadingupdate:false,//上传
      //向预览组件传递数据
      imgshowURL: null,// 保存预览图片的 URL
      imgurlFromDate: "",
      imgName: '',
      ifShowMapPreview: false, // 是否预览专题图
      //这个showTypes注意，1为前端存储的图片，2是截图加自动生成经纬度线，3是三维模型图，就是等高线\
      selectedEqData: null,
      showTypes: 1,

      //下面这两个是经纬度线往子组件穿的数据
      corners: {},
      //下面的是用来解决导出图片边框和经纬度数字展示用的
      step: 0.5,

      // 导出图片时经纬度线用到的
      //还有step也在经纬度这里用到了
      rectangleBounds: [],//按东南西北的顺序存储
      latLonEntities: [], // 用于存储经纬度线实体的数组
      //下面的是用来解决导出图片边框和经纬度数字展示用的
      divBoxCount: 0,
      flexPercentages: [],
      points: [],
      //-------------
      legendPlotData: [],
      showLegend: false,
      eqInfo: {},
      sheet: [],
      sheetData: {},
      isLoaded: false,
      downloadConfirmed: false,
      isShowMessageIcon: false,
      messageIcon: '',
      queryParams: '',  // 搜索框关键字

      //--------------搜索框内容更新--
      plotArray: [],

      //--------------控制显隐--
      showEqList: true,
      showToolbar: true,

      eqOccurrenceTime: '',
    };
  },

  mounted() {
    // 初始化地图
    this.init()
    // 生成实体点击事件的handler
    this.entitiesClickPonpHandler()
    this.watchTerrainProviderChanged()
    // 干四件事获取地震列表、获取最新地震的eqid、设置websocket的eqid、渲染已有的标绘
    this.getEq()
    // 获取标绘图片
    this.getPlotPicture()
    this.initTree()
  },

  beforeUnmount() {
    // console.log("111", window.viewer)
    if (window.viewer) {
      Arrow.disable();
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

  watch: {
    isLoaded(val) {
      if (val && this.downloadConfirmed) {
        this.downloadExcel()
      }
    }
  },

  // unmounted() {
  //   this.websock.close()
  // },
  methods: {

    updateQuery() {
      let tempEqid = this.eqid;
      this.eqid = "";
      this.$nextTick(() => {
        this.eqid = tempEqid;
      });
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
      // 创建并添加交通图层
      let trafficLayer = viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            // 天地图交通图层的URL模板
            // url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" + token,
            url: `${tianditu}/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=${token}`,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg", // 根据实际返回的图像格式调整
            tileMatrixSetID: "w", // 如果URL中已经指定了tileMatrixSet，则此参数可能不是必需的
            show: true
          })
      );

      // 检查是否存在'TrafficTxtLayer'图层
      // 创建并添加交通注记图层
      let traffictxtLayer = viewer.imageryLayers.addImageryProvider(
          new Cesium.WebMapTileServiceImageryProvider({
            // 天地图交通注记图层的URL模板
            // url: "http://t0.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
            //     TianDiTuToken,
            url: `${tianditu}/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=${TianDiTuToken}`,
            layer: "tdtAnnoLayer",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: false // 初始状态下不显示图层
          })
      )
    },

    initTree() {
      const highestAndSecondLabels = [];
      this.copiedPlotTreeData = this.plotTreeData
      this.copiedPlotTreeData.forEach(item => {
        // 添加最高级label
        highestAndSecondLabels.push(item.label);
        // 添加每个子项的label
        if (item.children) {
          item.children.forEach(child => {
            highestAndSecondLabels.push(child.label);
          });
        }
      });
    },

    downloadExcel() {
      const plotBTO = {
        sheets: this.sheet,
        excelContent: this.excelContent
      };
      console.log(plotBTO,"plotBTO downloadExcel")

      // console.log("sheet:",sheet)

      downloadPlotExcel(plotBTO).then(res => {
        const blob = new Blob([res], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // console.log(this.excelContent)

        const formattedTitle = this.title
            // 删除时间部分，例如 T17:07:10 或 11:07:10
            .replace(/\s?T?\d{2}:\d{2}:\d{2}/, "")
            // 然后将日期部分 2024-05-27 转换为 2024年5月27日
            .replace(/^(\d{4})-(\d{2})-(\d{2})/, (match, year, month, day) =>
                `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日`
            );

        const excelTitle = this.excelContent.length > 0 ? `${formattedTitle}级地震-标绘数据` : "标绘数据模板";

        // console.log("标题：",excelTitle)

        link.setAttribute('download', `${excelTitle}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        this.excelContent = []
        this.selectVisible = false;
        this.selectedNodes = [];
        // 获取当前勾选的节点
        const checkedNodes = this.$refs.tree.getCheckedNodes();

        // 逐个取消勾选
        checkedNodes.forEach(node => {
          this.$refs.tree.setChecked(node, false);
        });

        this.isLoaded = false
        this.downloadConfirmed = false
        this.loading = false
        console.log("this.loading，模板下载结束",this.loading)
      })
    },

    // 初始化控件等
    init() {
      let viewer = initCesium(Cesium)
      Arrow.disable();
      Arrow.init(viewer);
      viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
      // 监听相机高度并更新 zoomLevel
      viewer.camera.changed.addEventListener(() => {
        const cameraHeight = viewer.camera.positionCartographic.height
        this.updateZoomLevel(cameraHeight)
      })
      window.viewer = viewer
      let options = {}
      // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
      options.defaultResetView = Cesium.Cartographic.fromDegrees(103.00, 29.98, 1500, new Cesium.Cartographic)
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
      this.addTrafficLayer()
    },
    // 初始化ws
    initWebsocket() {
      // console.log("this.eqid---------------------", this.eqid)
      this.websock = initWebSocket(this.eqid)
      this.websock.onmessage = websocketonmessage;//涉及功能导入功能
    },
    // 获取本次地震数据库中的数据渲染到地图上
    initPlot(eqid) {
      this.pointsLayer = []
      let that = this
      getPlot({eqid}).then(res => {
        let data = res

        that.plotList = data
        that.plots = data
        console.log("数据：", data)

        let pointArr = data.filter(e => e.drawtype === 'point')
        let points = []
        pointArr.forEach(item => {
          if (!that.renderedPlotIds.has(item.plotId)) { // 检查是否已经渲染
            let point = {
              earthquakeId: item.earthquakeId,
              plotId: item.plotId,
              time: item.creationTime.replace("T", " "),
              plotType: item.plotType,
              drawtype: item.drawtype,
              latitude: item.latitude,
              longitude: item.longitude,
              height: item.elevation,
              icon: item.icon,
            }
            points.push(point)
            that.renderedPlotIds.add(item.plotId);
          }
        })
        that.drawPoints(points, false)
        that.pointsLayer = [...points]
        console.log(that.pointsLayer)
        let polylineArr = data.filter(e => e.drawtype === 'polyline');
        console.log("pointArr", pointArr)
        console.log("polylineArr", polylineArr)
        // 过滤掉已经渲染的项
        let unrenderedPolylineArr = polylineArr.filter(item => !that.renderedPlotIds.has(item.plotId));

        // 标记未渲染的项为已渲染
        unrenderedPolylineArr.forEach(item => {
          that.renderedPlotIds.add(item.plotId); // 标记为已渲染
        });

        // 只绘制未渲染的线条
        if (unrenderedPolylineArr.length > 0) {
          cesiumPlot.getDrawPolyline(unrenderedPolylineArr); // 只绘制当前未渲染的线条
        }

        // 处理多边形数据
        let polygonArr = data.filter(e => e.drawtype === 'polygon');
        // console.log('index.polygonArr', polygonArr)
        let polygonMap = {};
        polygonArr.forEach(item => {
          if (!polygonMap[item.plotId]) {
            polygonMap[item.plotId] = [];
          }
          polygonMap[item.plotId].push(item);
        });
        Object.keys(polygonMap).forEach(plotId => {
          let polygonData = polygonMap[plotId];
          that.getDrawPolygonInfo(polygonData);
        });
        let straightArr = data.filter(e => e.drawtype === 'straight');
        Arrow.showStraightArrow(straightArr)
        console.log("straightArr----------------", straightArr)

        let attackArr = data.filter(e => e.drawtype === 'attack');
        Arrow.showAttackArrow(attackArr)

        let pincerArr = data.filter(e => e.drawtype === 'pincer');
        Arrow.showPincerArrow(pincerArr)
        // // 长轮询逻辑：等待一段时间后继续请求
        // setTimeout(() => {
        //   fetchData(); // 递归调用以实现长轮询
        // }, 5000); // 设置 5 秒的轮询间隔（可以根据需求调整）
      })
    },

    showSelect(flag) {
      this.selectVisible = true
      this.initializeTreeChildren(flag)
      // console.log("数据：",this.excelContent)
    },

    handleCheck() {
      const checkedNodes = this.$refs.tree.getCheckedNodes();

      // 提取所有的最高级和第二级的label
      const highestAndSecondLabels = [];
      this.copiedPlotTreeData = this.plotTreeData
      this.copiedPlotTreeData.forEach(item => {
        // 添加最高级label
        highestAndSecondLabels.push(item.label);
        // 添加每个子项的label
        if (item.children) {
          item.children.forEach(child => {
            highestAndSecondLabels.push(child.label);
          });
        }
      });

      // 过滤掉最高级和第二级的label
      this.selectedNodes = checkedNodes
          .map(node => node.label)
          // 过滤掉最高级和第二级的 label
          .filter(label => !highestAndSecondLabels.includes(label));
    },

    confirmDownload() {
      this.loading = true
      console.log(this.loading,"this.loading 导出")
      this.sheet = this.selectedNodes.map(node => {
        const typeKey = Object.keys(plotType).find(key => plotType[key].name === node);
        const fields = [];

        console.log("typeKey",typeKey)
        console.log(fields)

        // 指定类型列表
        const specialTypes = [
          "unsearchedArea", "searchedArea", "unrescuedArea", "rescuedArea", "rescueArea",
          "straightArrows", "attackArrows", "pincerArrows",
          "collapse", "landslide", "mudslide", "groundFissure", "landSubsidence", "groundCollapse",
          "restrictedHighway", "impassableHighway", "impassableRailways",
          "unavailableTransmissionAndDistributionLines", "unusableGasPipeline", "unavailableWaterSupplyNetwork"
        ];
        // 根据 typeKey 动态设置 fields.unshift
        if (specialTypes.includes(typeKey)) {
          fields.unshift(
              {name: "绘制类型", type: "text"},
              {name: "经纬度集合", type: "text"},
              {name: "高程", type: "text"},
              {name: "角度", type: "text"},
              {name: "开始时间", type: "text"},
              {name: "结束时间", type: "text"},

              {name: "标注所在省", type: "text"},
              {name: "标注所在市", type: "text"},
              {name: "标注所在区县", type: "text"},
              {name: "标注所在城镇", type: "text"},

              {name: "标注附近具体地址", type: "text"},
              {name: "标注附近具体地址所在方向", type: "text"},
              {name: "标注附近具体的地址距离(米)", type: "text"},

              {name: "标注附近poi名称", type: "text"},
              {name: "标注附近poi距离(米)", type: "text"},
              {name: "标注附近道路", type: "text"},
              {name: "标注附近道路距离(米)", type: "text"},
          );
        }
        else {
          fields.unshift(
              {name: "绘制类型", type: "text"},
              {name: "经度", type: "text"},
              {name: "纬度", type: "text"},
              {name: "高程", type: "text"},
              {name: "角度", type: "text"},
              {name: "开始时间", type: "text"},
              {name: "结束时间", type: "text"},

              {name: "标注所在省", type: "text"},
              {name: "标注所在市", type: "text"},
              {name: "标注所在区县", type: "text"},
              {name: "标注所在城镇", type: "text"},

              {name: "标注附近具体地址", type: "text"},
              {name: "标注附近具体地址所在方向", type: "text"},
              {name: "标注附近具体的地址距离(米)", type: "text"},

              {name: "标注附近poi名称", type: "text"},
              {name: "标注附近poi距离(米)", type: "text"},
              {name: "标注附近道路", type: "text"},
              {name: "标注附近道路距离(米)", type: "text"},
          );
        }

        if (typeKey) {
          const typeData = plotType[typeKey];
          console.log("typeData:",typeData)
          for (const [key, value] of Object.entries(typeData)) {
            if (value.name !== undefined && value.type !== undefined) {
              // 仅处理有 content 的字段或 type 为 text 的 字段
              const field = {
                name: value.name,
                type: value.type,
              };
              // console.log("field", field)
              if (value.type !== 'text' && value.content) {
                field.content = value.content;
              }
              fields.push(field);
              // console.log(fields, "fields")
            }
          }
        }

        const endTimeIndex = fields.findIndex(field => field.name === "标注附近道路距离");
        if (endTimeIndex !== -1 && endTimeIndex + 1 < fields.length) {
          fields.splice(endTimeIndex + 1, 1);
        }

        return {
          name: node,
          fields: fields
        };
      });
      this.downloadConfirmed = true

      if (this.isLoaded) {
        this.downloadExcel()
      }
      // console.log(this.sheet)
    },

    cancelDownload() {
      this.excelContent = []
      this.selectVisible = false;
      this.selectedNodes = []
      this.isLoaded = false;
      this.loading = false;


      console.log(this.$refs.tree.getCheckedKeys())
      // 逐个取消勾选
      this.$refs.tree.setCheckedNodes([])
      this.$refs.tree.setCurrentKey(null)
    },

    // 新方法展示与点击节点相关的name字段
    initializeTreeChildren(flag) {
      // console.log(flag)
      if (flag === 'export') {

        this.excelPanel = "标绘点数据导出"

        const plotIds = this.plotList.map(plot => plot.plotId);
        const plotTypes = this.plotList.map(plot => plot.plotType);

        getExcelPlotInfo(plotIds, plotTypes).then(res => {
          console.log(res)

          // 提取 excelContent
          const excelContent = res.filter(item => item.plotInfo).map(item => {
            const {plotInfo, plotTypeInfo} = item;

            // 先提取绘制类型
            const drawTypeMap = new Map([
              ["point", "点"],
              ["polyline", "线"],
              ["polygon", "面"],
              ["attack", "攻击箭头"],
              ["straight", "直线箭头"],
              ["pincer", "钳击箭头"]
            ]);

            // 提取 plotTypeInfo 中的字段
            const plotTypeFields = plotInfo.plotType ? Object.values(plotType).find(team => team.name === plotInfo.plotType) : null;
            const filteredPlotTypeInfo = Object.keys(plotTypeFields).filter(key => key !== 'name')
                .reduce((obj, key) => {
                  if (plotTypeInfo&&plotTypeInfo[key] !== undefined) {
                    obj[plotTypeFields[key].name] = plotTypeInfo[key];
                  }
                  return obj;
                }, {});

            const formattedCoordinates = plotInfo.geom.coordinates
                // 判断 coordinates 是否为二维数组，如果是，则处理每个坐标对
                .map(coord => {
                  if (Array.isArray(coord)) {
                    if (coord.length === 2) {
                      // 如果是简单的坐标对（[经度, 纬度]），直接格式化
                      return `(${coord[0]}, ${coord[1]})`;
                    } else if (Array.isArray(coord[0]) && coord[0].length === 2) {
                      // 如果是一个包含多个坐标对的数组，处理其中的每个坐标对
                      return coord.map(subCoord => `(${subCoord[0]}, ${subCoord[1]})`).join("、");
                    }
                  }
                  return '';  // 如果格式不符合要求，则返回空字符串
                })
                .filter(coord => coord !== '')  // 过滤掉无效的空字符串
                .join("、");  // 使用中文顿号连接

            // 返回提取的字段
            return {
              "绘制类型": drawTypeMap.get(plotInfo.drawtype) || "未知类型",
              "标绘类型": plotInfo.plotType,
              "经度": plotInfo.longitude,
              "纬度": plotInfo.latitude,
              "经纬度集合": formattedCoordinates,
              "高程": plotInfo.elevation,
              "角度": plotInfo.angle,
              "开始时间": plotInfo.startTime ? plotInfo.startTime.replace("T", " ") : "", // 检查是否为 null 或 undefined
              "结束时间": plotInfo.endTime ? plotInfo.endTime.replace("T", " ") : "", // 同样检查
              "标注所在省":plotInfo.belongProvince,
              "标注所在市": plotInfo.belongCity,
              "标注所在区县": plotInfo.belongCounty,
              "标注所在城镇": plotInfo.belongTown,
              "标注附近具体地址": plotInfo.locationAddress,
              "标注附近具体地址所在方向": plotInfo.locationAddressPosition,
              "标注附近具体的地址距离(米)": plotInfo.locationAddressDistance,
              "标注附近poi名称": plotInfo.loocationPoi,
              "标注附近poi距离(米)": plotInfo.locationPoiDistance,
              "标注附近道路": plotInfo.locationRoad,
              "标注附近道路距离(米)": plotInfo.locationRoadDistance,
              ...filteredPlotTypeInfo, // 保留 plotTypeInfo 中的字段
            };
          });
          // console.log(excelContent)

          // 将数据调整为目标格式
          this.excelContent = excelContent.reduce((acc, item) => {
            const plotName = item["标绘类型"];
            const plotData = {
              "绘制类型": item["绘制类型"],
              "经度": item["经度"],
              "纬度": item["纬度"],
              "经纬度集合": item["经纬度集合"],
              "高程": item["高程"],
              "角度": item["角度"],
              "开始时间": item["开始时间"],
              "结束时间": item["结束时间"],

              // "标注所在省": item["标注所在省"],
              // "标注所在市": item["标注所在市"],
              // "标注所在区县": item["标注所在区县"],
              // "标注所在城镇": item["标注所在城镇"],
              // "标注附近具体地址": item["标注附近具体地址"],
              // "标注附近具体地址所在方向": item["标注附近具体地址所在方向"],
              // "标注附近具体的地址距离(米)": item["标注附近具体的地址距离(米)"],
              // "标注附近poi名称": item["标注附近poi名称"],
              // "标注附近poi距离(米)": item["标注附近poi距离(米)"],
              // "标注附近道路": item["标注附近道路"],
              // "标注附近道路距离(米)": item["标注附近道路距离(米)"],

              // 将 plotTypeInfo 中的其他字段加入
              ...Object.fromEntries(
                  Object.entries(item).filter(([key]) => !["绘制类型", "标绘类型", "经度", "纬度", "经纬度集合", "高程", "角度", "开始时间", "结束时间"].includes(key))
              )
            };

            // 查找已有的标绘名称对象
            const existingPlot = acc.find(plot => plot[plotName]);

            if (existingPlot) {
              // 如果存在，则将新数据推入数组
              existingPlot[plotName].push(plotData);
            } else {
              // 如果不存在，则新建一个对象
              acc.push({
                [plotName]: [plotData]
              });
            }

            return acc;
          }, []);

          console.log("调整后的数据格式:", this.excelContent);
          console.log(888)
          this.isLoaded = true;
        });
      }
      else {
        this.excelPanel = "下载导入标绘模板"
        this.isLoaded = true;
      }

      this.copiedPlotTreeData.forEach(rootNode => {
        if (rootNode.children) {
          rootNode.children.forEach(child => {
            let arr = this.plotPicture.filter(item => item.type === child.label);

            // 去掉过滤逻辑
            child.children = arr.map(item => ({
              label: item.name,
              uuid: item.uuid,
              children: [] // 初始化为空数组
            }));
          });
        }
      });
      this.loading = false;
    },

    beforeUpload(file) {
      this.loadingupdate=true
      const type = file.name.split('.').pop();
      // 获取不带扩展名的文件名
      const filename = file.name.slice(0, file.name.lastIndexOf('.'));

      // console.log(filename)

      const isExcel = (type === "xlsx") || (type === 'xls');

      // console.log(type)
      if (!isExcel) {
        this.$message({
          type: 'error',
          message: '附件格式错误，请重新上传xlsx或xls文件！'
        });
        return false;
      }

      // 创建 FileReader 对象来读取 Excel 文件
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});

        // 检查是否正确读取工作簿内容
        // console.log("工作簿内容：", workbook.Sheets);

        this.sheetData = workbook.Sheets

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 获取第一行第一列内容
        const firstCell = worksheet['A1'];
        if (!firstCell && firstCell !== "绘制类型") {
          this.$message({
                type: 'error',
                message: `文件的第一行数据有误，请检查文件内容！`
              }
          );
        }
      };

      reader.readAsArrayBuffer(file);
      this.uploadUrl = import.meta.env.VITE_APP_BASE_API +`/excel/importPlotExcel/${filename}&${this.eqid}`;
      // this.uploadUrl = `http://localhost:8080/excel/importPlotExcel/${filename}&${this.eqid}&${this.fieldMapping}`;
      return true;
    },

    handleSuccess(response) {
      this.plotArray = []
      const startTime = performance.now();
      console.log(response,"response handleSuccess")
      // 解构 response 中的 plotDataList 和 updatedPlotProperty
      const {plotDataList, updatedPlotProperty} = response.data;
      // 记录开始时间

      console.log(plotDataList)
      console.log(555)
      console.log(updatedPlotProperty)

      // 提取 updatedPlotProperty 中的字段，将括号内的内容解析为对象
      const regex = /\(plotId=([a-f0-9\-]+),\s*(.*)\)/;
      const updatedFields = updatedPlotProperty.map(item => {
        const match = item.match(regex);
        if (match) {
          const plotId = match[1];
          const fields = match[2].split(',').reduce((acc, field) => {
            const [key, value] = field.split('=').map(str => str.trim());
            acc[key] = value;
            return acc;
          }, {});
          return {plotId, ...fields};
        }
        return null;
      }).filter(Boolean); // 过滤掉不匹配的项

      // 将 updatedFields 转为 Map 方便快速查找
      const updatedFieldsMap = updatedFields.reduce((acc, field) => {
        acc[field.plotId] = field;
        return acc;
      }, {});

      // 合并 plotDataList 和 updatedFields
      const mergedData = plotDataList.map(plot => {
        const updatedField = updatedFieldsMap[plot.plotId]; // 获取与 plotId 对应的更新字段
        if (updatedField) {
          return {
            ...plot,
            ...updatedField // 动态合并所有匹配的字段
          };
        }
        return plot; // 如果没有匹配，返回原始 plot 数据
      });

      console.log(777)
      console.log(mergedData)

      // 拆分 mergedData 中的对象
      let splitData = mergedData.map((item) => {
        let {
          earthquakeId,
          plotId,
          creationTime,
          plotType,
          drawtype,
          geomDetails,
          geom,
          longitude,
          latitude,
          elevation,
          icon,
          startTime,
          endTime,
          severity,
          isDeleted,

          ...dynamicFields // 剩下的是动态字段
        } = item;

        let plotInfo = {
          earthquakeId,
          plotId,
          creationTime,
          plotType,
          drawtype,
          geomDetails,
          geom,
          longitude,
          latitude,
          elevation,
          icon,
          startTime,
          endTime,
          severity,
          isDeleted,
        };

        let plotTypeInfo = {
          plotId,
          ...dynamicFields,
        };

        return {plotInfo, plotTypeInfo};
      });

      console.log(333)
      console.log(splitData)

      // 分别存储点、线、面、箭头类格式化数据
      let assemblyPointArray = [];
      let assemblyPolylineArray = [];
      let assemblyPolygonArray = [];
      let assemblyArrowArray = [];

      for (let i = 0; i < splitData.length; i++) {
        const mappedDrawtype = splitData[i].plotInfo.drawtype || "unknown"; // 如果类型未匹配，设置为 "unknown"
        if (splitData[i].plotInfo.drawtype === "point" || splitData[i].plotInfo.drawtype === "点") {
          const plotData = {
            type: "point",
            operate: "add",
            data: {
              plot: {
                earthquakeId: splitData[i].plotInfo.earthquakeId,
                plotId: splitData[i].plotInfo.plotId,
                creationTime: this.timestampToTime(new Date()).replace(" ", "T"),
                plotType: splitData[i].plotInfo.plotType,
                drawtype: "point",
                geom: splitData[i].plotInfo.geom,
                elevation: splitData[i].plotInfo.elevation,
                icon: splitData[i].plotInfo.icon,
                startTime: this.timestampToTime(splitData[i].plotInfo.startTime).replace(" ", "T"),
                endTime: this.timestampToTime(splitData[i].plotInfo.endTime).replace(" ", "T"),
                severity: splitData[i].plotInfo.severity,
                isDeleted: splitData[i].plotInfo.isDeleted,
              },
              plotinfo: {
                ...splitData[i].plotTypeInfo,
              },
            },

          };

          assemblyPointArray.push(plotData); // 存储每个结果
        } else {
          const geomDetails = splitData[i].plotInfo.geomDetails;

          console.log(geomDetails)

          // 将 geomDetails 转换为数组形式的 coordinates
          const coordinates = geomDetails
              .split("、")
              .map(coord => {
                const [lng, lat] = coord
                    .replace(/[()]/g, "")
                    .split(",")
                    .map(Number);
                return [lng, lat];
              });

          if (splitData[i].plotInfo.drawtype === "polyline" || splitData[i].plotInfo.drawtype === "线") {
            console.log("线")
            const plotData = {
              type: "polyline",
              operate: "add",
              data: {
                plot: {
                  earthquakeId: splitData[i].plotInfo.earthquakeId,
                  plotId: splitData[i].plotInfo.plotId,
                  creationTime: this.timestampToTime(new Date()).replace(" ", "T"),
                  plotType: splitData[i].plotInfo.plotType,
                  drawtype: "polyline",
                  geom: {
                    type: "LineString",
                    coordinates: coordinates,
                  },
                  elevation: splitData[i].plotInfo.elevation,
                  icon: splitData[i].plotInfo.icon,
                  startTime: this.timestampToTime(splitData[i].plotInfo.startTime).replace(" ", "T"),
                  endTime: this.timestampToTime(splitData[i].plotInfo.endTime).replace(" ", "T"),
                  severity: splitData[i].plotInfo.severity,
                  isDeleted: splitData[i].plotInfo.isDeleted,
                },
                plotinfo: {
                  ...splitData[i].plotTypeInfo,
                },
              }
            };

            assemblyPolylineArray.push(plotData); // 存储每个结果
          } else if (splitData[i].plotInfo.drawtype === "polygon" || splitData[i].plotInfo.drawtype === "面") {
            console.log("面")
            const plotData = {
              type: "polygon",
              operate: "add",
              data: {
                plot: {
                  earthquakeId: splitData[i].plotInfo.earthquakeId,
                  plotId: splitData[i].plotInfo.plotId,
                  creationTime: this.timestampToTime(new Date()).replace(" ", "T"),
                  plotType: splitData[i].plotInfo.plotType,
                  drawtype: mappedDrawtype,
                  geom: {
                    type: "Polygon",
                    coordinates: [coordinates],
                  },
                  elevation: splitData[i].plotInfo.elevation,
                  icon: splitData[i].plotInfo.icon,
                  startTime: this.timestampToTime(splitData[i].plotInfo.startTime).replace(" ", "T"),
                  endTime: this.timestampToTime(splitData[i].plotInfo.endTime).replace(" ", "T"),
                  severity: splitData[i].plotInfo.severity,
                  isDeleted: splitData[i].plotInfo.isDeleted,
                },
                plotinfo: {
                  ...splitData[i].plotTypeInfo,
                },

              }

            };
            // 如果 angle 属性存在，则将其添加到 plot 中
            if (splitData[i].plotTypeInfo.angle !== undefined) {
              plotData.data.plot.angle = splitData[i].plotTypeInfo.angle;
            }
            assemblyPolygonArray.push(plotData); // 存储每个结果
          } else {
            console.log("箭头")
            const plotData = {
              type: "arrow",
              operate: "add",
              data: {
                plot: {
                  earthquakeId: splitData[i].plotInfo.earthquakeId,
                  plotId: splitData[i].plotInfo.plotId,
                  creationTime: this.timestampToTime(new Date()).replace(" ", "T"),
                  plotType: splitData[i].plotInfo.plotType,
                  drawtype: mappedDrawtype,
                  geom: {
                    type: "MultiPoint",
                    coordinates: coordinates,
                  },
                  elevation: splitData[i].plotInfo.elevation,
                  icon: splitData[i].plotInfo.icon,
                  startTime: this.timestampToTime(splitData[i].plotInfo.startTime).replace(" ", "T"),
                  endTime: this.timestampToTime(splitData[i].plotInfo.endTime).replace(" ", "T"),
                  severity: splitData[i].plotInfo.severity,
                  isDeleted: splitData[i].plotInfo.isDeleted,
                },
                plotinfo: {
                  ...splitData[i].plotTypeInfo,
                },
              }
            };

            assemblyArrowArray.push(plotData); // 存储每个结果
          }
        }

      }
      // 合并所有数组并遍历发送
      [...assemblyPointArray, ...assemblyPolylineArray, ...assemblyPolygonArray, ...assemblyArrowArray].forEach(data => {
        this.wsSendPoint(JSON.stringify(data));
      });
      // 合并所有数据
      // 合并所有数据并只提取 plot 中的 plotId 和 plotType
      const allData = [...assemblyPointArray, ...assemblyPolylineArray, ...assemblyPolygonArray, ...assemblyArrowArray].map(item => {
        return {
          plotId: item.data.plot.plotId,
          plotType: item.data.plot.plotType
        };
      });
      // 提取每个元素的 data 部分
      this.plotArray = allData;

      const totalCount = splitData.length; // 总数据数量
      // 记录开始时间
      const endTime = performance.now();
      const elapsedTime = ((endTime - startTime) / 1000).toFixed(2); // 花费时间（秒）

      // 判断导入是否成功
      const importStatus = totalCount > 0 ? '导入成功' : '导入失败';

      // 更新弹窗的数据
      this.totalCount = totalCount;
      this.elapsedTime = elapsedTime;
      this.importStatus = importStatus;
      // 弹出 Element UI 弹窗
      this.dialogVisible = true;
    },

    convertToDateTimeString(excelDate) {
      if (!excelDate) return null;
      const date = new Date((excelDate - 25569) * 86400 * 1000);

      // 将小时减去8小时
      date.setHours(date.getHours() - 8);

      // 格式化日期为 "YYYY/MM/DD HH:MM:SS"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    },

    handleData(responseData) {
      // console.log("工作簿内容：", this.sheetData);
      // console.log("响应数据：", responseData);

      const plotIds = responseData;  // 获取 plotIds 数组
      let plotIdIndex = 0;  // 初始化索引来追踪当前 plotId

      const result = Object.keys(this.sheetData).map(sheetName => {
        const sheet = this.sheetData[sheetName];
        const headers = [];
        const rows = [];

        // 提取列标题
        for (const cell in sheet) {
          if (cell[0] !== '!') { // 排除 meta 信息
            const row = cell.match(/\d+/)[0];
            const col = cell.match(/[A-Z]+/)[0];

            if (row === '1') {
              headers.push({col, header: sheet[cell].v});
            }
          }
        }

        // 确定从 H 列开始提取字段
        const startColumnIndex = headers.findIndex(header => header.col === 'H');

        // 提取每一行数据
        for (let i = 2; i <= parseInt(sheet['!ref'].split(':')[1].match(/\d+/)[0]); i++) {
          const rowData = {};
          const plotInfo = {};

          headers.forEach((header, index) => {
            const cellAddress = `${header.col}${i}`;
            if (sheet[cellAddress] && sheet[cellAddress].v !== undefined) {
              let value = sheet[cellAddress].v;

              // 如果是开始时间或结束时间列，转换为精确日期时间格式
              if (header.header === "开始时间" || header.header === "结束时间") {
                value = this.convertToDateTimeString(value);
              }

              rowData[header.header] = value;

              // 从 H 列开始动态填充 plotInfo
              if (index >= startColumnIndex && header.header) { // 只处理从 H 列开始的标题
                plotInfo[header.header] = value;
              }
            }
          });

          // 将 plotInfo 中的字段映射到对应的 plotType 键
          const mappedPlotInfo = {};
          for (const key in plotInfo) {
            for (const teamKey in plotType) {
              const team = plotType[teamKey];
              for (const field in team) {
                if (team[field].name === key) {
                  mappedPlotInfo[field] = plotInfo[key];
                }
              }
            }
          }

          // 仅添加含有有效数据的行
          const hasValidData = Object.values(rowData).some(value => value !== null && value !== undefined && value !== '');
          if (hasValidData) {
            // 获取当前的 plotId，并递增索引
            const plotId = plotIds[plotIdIndex];
            plotIdIndex++;  // 增加索引，确保每行使用不同的 plotId

            const plotIcon = this.plotPicture.find(icon => icon.name === sheetName)?.img;
            rows.push({
              type: "point",
              operate: "add",
              data: {
                plot: {
                  earthquakeId: this.eqid,
                  plotId: plotId,  // 使用从 plotIds 数组中获取的 plotId
                  plotType: sheetName,
                  drawtype: "point",
                  icon: plotIcon,
                  geom: {
                    type: "Point",
                    coordinates: [rowData["经度"], rowData["纬度"]]
                  },
                  elevation: rowData["高程"] || 0,
                  startTime: rowData["开始时间"],
                  endTime: rowData["结束时间"],
                  severity: null,
                  isDeleted: null,
                  creationTime: new Date().toISOString().slice(0, 19)
                },
                plotInfo: Object.keys(mappedPlotInfo).length > 0 ? {...mappedPlotInfo, plotId} : undefined // 只添加非空的 plotInfo
              },
            });
          }
        }

        return rows;
      });

      // 将结果扁平化成单个数组
      const flattenedResult = result.flat();

      // console.log("解析结果：", flattenedResult);

      this.ifPointAnimation(true)

      flattenedResult.forEach(data => {
        this.wsSendPoint(JSON.stringify(data)); // 将 data 转换为 JSON 字符串发送
        this.drawPoints(data.data.plot, true)
      });

      return flattenedResult;
    },

    // =================================================================================================================

    exportCesiumTheme() {

      const targetInfo = Object.keys(this.eqInfo).length === 0 ? this.tableData[0] : this.eqInfo;

      window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            parseFloat(targetInfo.longitude),
            parseFloat(targetInfo.latitude),
            70000
        ),
        orientation: {
          heading: 6.283185307179581,
          pitch: -1.5688168484696687,
          roll: 0.0
        }
      });

      this.showLegend = true;


      this.plotList.forEach(item => {
        const {plotType, icon} = item;

        if (plotType) {
          // 检查 this.legendPlotData 是否已有相同 plotType 的项
          const existingEntry = this.legendPlotData.find(entry => entry.plotType === plotType);

          if (existingEntry) {
            // 如果已有相同 plotType 的项，增加计数
            existingEntry.count += 1;
          } else {
            // 如果没有相同 plotType 的项，添加新项
            this.legendPlotData.push({plotType, count: 1, icon});
          }
        }
      });

      // console.log("标绘数据：",this.legendPlotData);

      setTimeout(() => {
        this.exportCesiumScene()
      }, 3000);
    },

    ifShowDialog(val) {
      this.ifShowMapPreview = false
    },

    async exportCesiumScene() {

      // 开始导出时，显示加载动画
      this.loading = true;

      //  1: 禁用 Cesium 相机交互功能，防止用户在导出时误操作
      const cameraController = window.viewer.scene.screenSpaceCameraController;
      cameraController.enableRotate = false;
      cameraController.enableZoom = false;
      cameraController.enableTranslate = false;

      //  2: 获取地图当前视野范围的经纬度，并加载经纬度线
      this.getLatLonBounds();  // 获取当前视野经纬度范围
      this.addLatLonLines();   // 添加经纬度线
      await this.waitForEntitiesToRender(this.latLonEntities.length);  // 等待经纬度线渲染完成

      try {
        //  3: 等待 Cesium 渲染完成并请求重新渲染
        await this.waitForCesiumRender();
        window.viewer.scene.requestRender();

        //  4: 获取 Cesium 场景的 Canvas 图像
        const cesiumCanvas = window.viewer.scene.canvas;
        const cesiumImage = cesiumCanvas.toDataURL('image/png');  // Cesium 场景导出为图片

        //  5-7: 分别渲染图例、距离标尺和指南针
        const distanceLegendCanvas = await this.renderElementToCanvas('.distance-legend', '距离标尺');
        const compassCanvas = await this.renderElementToCanvas('.compassContainer', '指南针');
        const legendCanvas = await this.renderElementToCanvas('.legend-container', '图例');

        //  8: 创建一个新的合成 Canvas
        const finalCanvas = this.createFinalCanvas();
        const finalContext = finalCanvas.getContext('2d', {willReadFrequently: true});

        //  9: 将 Cesium 场景绘制到合成 Canvas 上
        await this.drawImageToCanvas(finalContext, cesiumImage, 0, 0);

        //  10-12: 分别绘制图例、距离标尺和指南针到合成 Canvas 上

        // 绘制 legendCanvas 到合成 Canvas 的右下角
        // finalContext.drawImage(legendCanvas, x, y);
        finalContext.drawImage(distanceLegendCanvas, 20, finalCanvas.height - distanceLegendCanvas.height - 20);
        finalContext.drawImage(compassCanvas, finalCanvas.width - compassCanvas.width - 20, 20);
        finalContext.drawImage(legendCanvas, finalCanvas.width - legendCanvas.width, finalCanvas.height - legendCanvas.height)

        //  14: 将合成后的 Canvas 转换为图片
        this.imgshowURL = finalCanvas.toDataURL('image/png');
        this.ifShowMapPreview = true

      } catch (error) {
        console.error('导出场景失败:', error);
      } finally {
        //  15: 恢复 Cesium 相机交互，并移除经纬度线
        cameraController.enableRotate = true;
        cameraController.enableZoom = true;
        cameraController.enableTranslate = true;

        this.latLonEntities.forEach(entity => {
          window.viewer.entities.remove(entity);  // 移除经纬度线
        });
        this.latLonEntities = [];
        this.showTypes = 2
        this.imgName = "标绘专题图";
        this.loading = false;
      }
    },

    // 将元素渲染为 Canvas
    async renderElementToCanvas(selector, elementName) {
      const element = document.querySelector(selector);
      return await html2canvas(element, {
        useCORS: true,
        scale: 1,
        backgroundColor: null
      });
    },

    // 创建最终合成的 Canvas
    createFinalCanvas() {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = document.querySelector('#cesiumContainer').offsetWidth;
      finalCanvas.height = document.querySelector('#cesiumContainer').offsetHeight;
      return finalCanvas;
    },

    // 将图像绘制到 Canvas 上
    async drawImageToCanvas(context, imageSrc, x, y) {
      const img = new Image();
      img.src = imageSrc;
      await new Promise(resolve => img.onload = resolve);
      context.drawImage(img, x, y);
    },

    // 等待 Cesium 渲染完成
    waitForCesiumRender() {
      return new Promise(resolve => {
        const scene = viewer.scene;
        const removeListener = scene.postRender.addEventListener(() => {
          removeListener();
          setTimeout(resolve, 500);  // 增加等待时间确保渲染完成
        });
        scene.requestRender();
      });
    },

    // 等待所有经纬度线实体完成渲染，并确保 Cesium 渲染循环完成
    waitForEntitiesToRender(entityCount) {
      return new Promise(resolve => {
        const scene = viewer.scene;

        // 检查实体是否完全渲染
        const checkEntitiesRendered = () => {
          const renderedEntities = this.latLonEntities.filter(entity => {
            return entity.show && entity.polyline && entity.polyline.positions && entity.polyline.positions.getValue();
          });

          if (renderedEntities.length === entityCount) {
            // 等待 Cesium 完成渲染
            const removePostRender = scene.postRender.addEventListener(() => {
              removePostRender(); // 确保只监听一次
              setTimeout(() => resolve(), 200); // 等待额外 200ms，确保渲染稳定
            });
          } else {
            setTimeout(checkEntitiesRendered, 100); // 每 100ms 检查一次
          }
        };

        checkEntitiesRendered();
      });
    },

    // 添加经纬度线到 Cesium 场景
    addLatLonLines() {
      const viewer = window.viewer;
      const alpha = 0.7; // 白色透明度

      // 添加经度或纬度线所用的函数
      const addLines = (start, end, constantCoord, isLongitude) => {
        //start 和 end：表示线段的起始和结束位置。对于经度线，start 和 end 是经度的范围；对于纬度线，是纬度的范围。
        for (let coord = start; coord <= end; coord += this.step) {
          const positions = [];

          // 根据是否是经度线，调整另一个坐标的范围
          //isLongitude：指示当前绘制的是经度线（true）还是纬度线（false）。
          for (let varCoord = isLongitude ? this.rectangleBounds[2] : this.rectangleBounds[0];
               varCoord <= (isLongitude ? this.rectangleBounds[3] : this.rectangleBounds[1]);
               varCoord += this.step) {
            if (isLongitude) {
              positions.push(Cesium.Cartesian3.fromDegrees(coord, varCoord)); // 经度线：lon 固定，lat 变化
            } else {
              positions.push(Cesium.Cartesian3.fromDegrees(varCoord, coord)); // 纬度线：lat 固定，lon 变化
            }
          }

          const entity = viewer.entities.add({
            polyline: {
              positions: positions,
              width: 1,
              material: Cesium.Color.WHITE.withAlpha(alpha),  // 白色透明度稍高
              clampToGround: true
            }
          });
          this.latLonEntities.push(entity); // 将实体存储到数组中
        }
      };
      // 添加经度线
      addLines(this.rectangleBounds[0], this.rectangleBounds[1], 'longitude', true);
      // 添加纬度线
      addLines(this.rectangleBounds[2], this.rectangleBounds[3], 'latitude', false);
    },

    // 获取地图当前视野范围的最东、最西、最南、最北的经纬度，用于经纬度线的绘制
    getLatLonBounds() {
      const viewer = window.viewer;
      const scene = viewer.scene;
      const canvas = scene.canvas;

      const cameraHeight = viewer.camera.positionCartographic.height;
      if (cameraHeight >= 550000) {
        this.step = 2;
      } else if (cameraHeight >= 350000 && cameraHeight < 550000) {
        this.step = 0.7;
      } else if (cameraHeight >= 200000 && cameraHeight < 350000) {
        this.step = 0.5;
      } else if (cameraHeight >= 150000 && cameraHeight < 200000) {
        this.step = 0.4;
      } else if (cameraHeight >= 100000 && cameraHeight < 150000) {
        this.step = 0.3;
      } else if (cameraHeight >= 50000 && cameraHeight < 100000) {
        this.step = 0.2;
      } else if (cameraHeight >= 25000 && cameraHeight < 50000) {
        this.step = 0.1;
      } else if (cameraHeight >= 10000 && cameraHeight < 25000) {
        this.step = 0.05;
      } else if (cameraHeight >= 6000 && cameraHeight < 10000) {
        this.step = 0.02;
      } else if (cameraHeight >= 1500 && cameraHeight < 6000) {
        this.step = 0.01;
      } else if (cameraHeight >= 0 && cameraHeight < 1500) {
        this.step = 0.005;
      }

      // 获取四个角的屏幕坐标
      const topLeft = new Cesium.Cartesian2(0, 0);
      const topRight = new Cesium.Cartesian2(canvas.width, 0);
      const bottomLeft = new Cesium.Cartesian2(0, canvas.height);
      const bottomRight = new Cesium.Cartesian2(canvas.width, canvas.height);

      // 将屏幕坐标转换为地球坐标
      const topLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(topLeft));
      const topRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(topRight));
      const bottomLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(bottomLeft));
      const bottomRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(scene.camera.pickEllipsoid(bottomRight));

      // 用于生成盒子的参数
      this.corners = {
        topStart: Cesium.Math.toDegrees(topLeftCartographic.longitude),
        topEnd: Cesium.Math.toDegrees(topRightCartographic.longitude),
        leftStart: Cesium.Math.toDegrees(bottomLeftCartographic.latitude),
        leftEnd: Cesium.Math.toDegrees(topLeftCartographic.latitude),
        bottomStart: Cesium.Math.toDegrees(bottomLeftCartographic.longitude),
        bottomEnd: Cesium.Math.toDegrees(bottomRightCartographic.longitude)
      };


      this.rectangleBounds[0] = Math.ceil(this.corners.topStart / this.step) * this.step - this.step;
      this.rectangleBounds[1] = Math.floor(this.corners.topEnd / this.step) * this.step + 2 * this.step;
      this.rectangleBounds[2] = Math.ceil(this.corners.leftStart / this.step) * this.step - this.step;
      this.rectangleBounds[3] = Math.floor(this.corners.leftEnd / this.step) * this.step + 2 * this.step;
    },

    // -----------------------------------------------------------------------------------------------------------------

    getCheckedNodes() {
      // 获取所有已选中的节点，包括三级节点
      const checkedNodes = this.$refs.plotTree.getCheckedNodes();
      console.log("Checked nodes:", checkedNodes);
    },

    entityclustering() {
      // window.viewer.dataSource.cl
      let dataSource = new Cesium.CustomDataSource("myData");
      dataSource.entities.add()
      console.log(window.viewer.dataSources.clustering.enabled)
    },
    initPolygon(eqid) {
      let that = this
      getPlot({eqid}).then(res => {
        console.log(res, 8888)
        let data = res
        let polygonArr = data.filter(e => e.drawtype === 'polygon');
        // console.log('index.polygonArr', polygonArr)
        let polygonMap = {};

        polygonArr.forEach(item => {
          if (!polygonMap[item.plotId]) {
            polygonMap[item.plotId] = [];
          }
          polygonMap[item.plotId].push(item);
        });
        Object.keys(polygonMap).forEach(plotId => {
          let polygonData = polygonMap[plotId];
          console.log(polygonData, 8889)
          that.getDrawPolygonInfo(polygonData);
        });
      })
    },
    // 所有entity实体类型点击事件的handler（billboard、polyline、polygon）
    entitiesClickPonpHandler() {
      let that = this
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {

        // 如果正在绘制面，直接返回，不处理点击事件
        // console.log(window.isDrawingPolygon)
        if (window.isDrawingPolygon) return;
        // 1-1 获取点击点的信息（包括）


        let pickedEntity = window.viewer.scene.pick(click.position);
        // console.log("pickedEntity",pickedEntity)
        window.selectedEntity = pickedEntity?.id
        // console.log("entity------------------",window.selectedEntity)

        this.dataSourcePopupVisible = false
        if (window.selectedEntity === undefined) {
          this.popupVisible = false
          this.dataSourcePopupVisible = false
          this.popupData = {}
        }

        console.log(window.selectedEntity)

        if (Object.prototype.toString.call(window.selectedEntity) === '[object Array]' && window.selectedEntity[0]._layers !== "聚合标绘点") {

          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？

          this.updatePopupPosition(); // 更新弹窗的位置
          this.dataSourcePopupData = window.selectedEntity
          this.dataSourcePopupVisible = true
          this.popupVisible = false
        }
        // 2-1 判断点击物体是否为点实体（billboard）
        if (Cesium.defined(pickedEntity) && window.selectedEntity !== undefined && window.selectedEntity._billboard !== undefined) {

          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换data为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            const cesiumPosition = window.selectedEntity.position.getValue(window.viewer.clock.currentTime);//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          // 2-5 更新弹窗位置
          // that.selectedEntity = window.selectedEntity
          // that.popupData = {
          //   type: window.selectedEntity.properties.type?window.selectedEntity.properties.type.getValue():"",
          //   time: window.selectedEntity.properties.time?window.selectedEntity.properties.time.getValue():"",
          //   name: window.selectedEntity.properties.name?window.selectedEntity.properties.name.getValue():"",
          //   lon: window.selectedEntity.properties.lon?window.selectedEntity.properties.lon.getValue():"",
          //   lat: window.selectedEntity.properties.lat?window.selectedEntity.properties.lat.getValue():"",
          //   describe: window.selectedEntity.properties.describe?window.selectedEntity.properties.describe.getValue():"",
          // };
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          this.popupData = {}

          this.popupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
          this.updatePopupPosition(); // 更新弹窗的位置
        } else {
          // this.popupVisible = false; // 隐藏弹窗
          // this.popupData = {}
        }
        // 3-1 选中面时触发
        if (Cesium.defined(pickedEntity) && window.selectedEntity._polygon !== undefined) {
          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            const cesiumPosition = window.selectedEntity.position.getValue(window.viewer.clock.currentTime);//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          this.popupData = {}
          console.log("实体：", window.selectedEntity)
          this.popupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
          this.updatePopupPosition(); // 更新弹窗的位置
          // that.showPolygon = true
          // that.polygonPosition = window.selectedEntity
        } else {
          // this.showPolygon = false
        }
        // 4-1选中线时触发
        if (Cesium.defined(pickedEntity) && window.selectedEntity._polyline !== undefined && window.selectedEntity.properties.data && that.polylineStatus === 0) {

          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            console.log("虚拟位置")
            const cesiumPosition = window.selectedEntity.position;//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          // console.log(window.selectedEntity,123)
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          this.popupData = {}
          this.popupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
          this.updatePopupPosition(); // 更新弹窗的位置
          // let status = cesiumPlot.drawPolylineStatus()
          // if (status === 0) {
          //   that.showPolyline = true
          //   // that.polylinePosition = window.selectedEntity
          // }

        } else {
          // this.showPolyline = false
          // this.popupData = {}
        }
        if (Cesium.defined(pickedEntity) && window.selectedEntity._billboard && window.selectedEntity._id === 'center') {
          console.log("1123")
          // 2-2 获取点击点的经纬度
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          // 2-3 将笛卡尔坐标转换为地理坐标角度,再将地理坐标角度换data为弧度
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);

          // 2-4-1 将经纬度和高度生成新的笛卡尔坐标，用来解决弹窗偏移（不加载地形的情况）
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);// 这种可以存data吗？？？？？？？？？？？？？？？
          // 2-4-2 加载地形时，构建虚拟的已添加实体，让弹窗定位到虚拟的实体上
          if (this.isTerrainLoaded()) {
            const cesiumPosition = window.selectedEntity.position.getValue(window.viewer.clock.currentTime);//获取时间？？？？？？？？？？？？
            let l = Cesium.Cartographic.fromCartesian(position)
            let lon = Cesium.Math.toDegrees(l.longitude)
            let lat = Cesium.Math.toDegrees(l.latitude)
            let hei = l.height
            let height
            // 将笛卡尔坐标转换为地理坐标角度
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            // 将地理坐标角度换为弧度
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);
            height = window.viewer.scene.globe.getHeight(cartographic) // 获取当前位置的高度
            // 将经纬度和高度生成新的笛卡尔坐标
            that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(Number(longitude.toFixed(6)), Number(latitude.toFixed(6)), height);
            // console.log("虚拟位置",{longitude, latitude, height},"真实位置",{lon,lat,hei})
          }
          // 2-5 更新弹窗位置
          // that.selectedEntity = window.selectedEntity
          // that.popupData = {
          //   type: window.selectedEntity.properties.type?window.selectedEntity.properties.type.getValue():"",
          //   time: window.selectedEntity.properties.time?window.selectedEntity.properties.time.getValue():"",
          //   name: window.selectedEntity.properties.name?window.selectedEntity.properties.name.getValue():"",
          //   lon: window.selectedEntity.properties.lon?window.selectedEntity.properties.lon.getValue():"",
          //   lat: window.selectedEntity.properties.lat?window.selectedEntity.properties.lat.getValue():"",
          //   describe: window.selectedEntity.properties.describe?window.selectedEntity.properties.describe.getValue():"",
          // };
          this.popupVisible = false
          this.popupVisible = true; // 显示弹窗
          this.popupData = {}

          this.popupData = window.selectedEntity.properties.centerData ? window.selectedEntity.properties.centerData.getValue() : ""
          this.updatePopupPosition(); // 更新弹窗的位置

        } else {
          let ray = viewer.camera.getPickRay(click.position)
          let position = viewer.scene.globe.pick(ray, viewer.scene)
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);
          let height = 0
          that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        }

      }, Cesium.ScreenSpaceEventType.LEFT_CLICK); //LEFT_DOUBLE_CLICK

      // 必须有这个，拖动地图弹窗位置才会跟着移动
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        if (window.selectedEntity) {
          that.updatePopupPosition(); // 更新弹窗的位置
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },

    // 控制标绘时左侧面板是否禁用：传'none'禁用；传'auto'解禁
    toggleEnable(able) {

      const situationEqTableElements = document.querySelectorAll('.situation_eqTable');
      const noteContainerElements = document.querySelectorAll('.noteContainer');

      situationEqTableElements.forEach(element => {
        element.style.pointerEvents = able;
      });

      noteContainerElements.forEach(element => {
        element.style.pointerEvents = able;
      });
    },

    // 更新弹窗的位置
    updatePopupPosition() {
      // 笛卡尔3转笛卡尔2（屏幕坐标）
      const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(window.viewer.scene, this.selectedEntityHighDiy)
      if (canvasPosition) {
        this.popupPosition = {
          x: canvasPosition.x,//+ 20,
          y: canvasPosition.y //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
        this.dataSourcePopupPosition = {
          x: canvasPosition.x,//+ 20,
          y: canvasPosition.y //- 60 // 假设弹窗应该在图标上方 50px 的位置
        };
      }
    },
    // 关闭弹窗
    closePlotPop() {
      this.popupVisible = !this.popupVisible
    },
    // 获取标绘图片数据
    getPlotPicture() {
      let that = this
      getPlotIcon().then(res => {
        // console.log(res)
        that.plotPicture = res.data
        // 设置plotTree初始样式
        // that.plotTreeClassification = res.filter(item=>item.type==="I类（次生地质灾害）")
      })
    },
    //--------------------------------------

    // 切换地震，渲染切换地震的标绘
    plotAdj(row) {

      console.log("所有信息",row)
      // {
      //   "eqid": "69b02afc-9aa8-4c32-8272-d5672d845c3c",
      //     "eqqueueId": "69b02afc-9aa8-4c32-8272-d5672d845c3c01",
      //     "earthquakeName": "四川省雅安市名山区",
      //     "earthquakeFullName": "2025年03月14日四川省雅安市名山区前进镇6.5级地震",
      //     "eqAddr": "四川省雅安市名山区前进镇",
      //     "magnitude": "6.5",
      //     "intensity": "",
      //     "depth": "12.0",
      //     "occurrenceTime": "2025-03-14T12:55:51",
      //     "eqType": "T",
      //     "source": "2",
      //     "eqAddrCode": "511803",
      //     "townCode": "51180311800000",
      //     "pac": "",
      //     "type": "",
      //     "longitude": "103.20",
      //     "latitude": "30.04",
      //     "geom": null,
      //     "time": "2025-03-14 12:55:51"
      // }

      // {
      //   "eqid": "69b02afc-9aa8-4c32-8272-d5672d845c3c",
      //     "eqqueueId": "69b02afc-9aa8-4c32-8272-d5672d845c3c01",
      //     "earthquakeName": "四川省雅安市名山区",
      //     "earthquakeFullName": "2025年03月14日四川省雅安市名山区前进镇6.5级地震",
      //     "eqAddr": "四川省雅安市名山区前进镇",
      //     "geom": {
      //   "type": "Point",
      //       "coordinates": [
      //     103.2,
      //     30.04
      //   ]
      // },
      //   "intensity": "",
      //     "magnitude": "6.5",
      //     "depth": "12.0",
      //     "occurrenceTime": "2025-03-14T12:55:51",
      //     "eqType": "T",
      //     "source": "2",
      //     "eqAddrCode": "511803",
      //     "townCode": "51180311800000",
      //     "pac": "",
      //     "type": "",
      //     "isDeleted": 0,
      //     "district": "名山区",
      //     "province": "四川省",
      //     "city": "雅安市",
      //     "time": "2025-03-14 12:55:51",
      //     "latitude": "NaN",
      //     "longitude": "NaN"
      // }


      this.eqInfo = row
      // console.log("剩余1：", window.pointDataSource.entities)
      window.viewer.entities.removeAll();
      // 从 dataSource 中删除点
      if (window.pointDataSource) {
        window.pointDataSource.entities.removeAll();
        labeldataSource.entities.removeAll()
      }
      if (window.labeldataSource) {
        window.labeldataSource.entities.removeAll(); // 移除点
      }
      // console.log("剩余2：", window.pointDataSource.entities)
      Arrow.drawArr = []
      // console.log("row",row)
      this.eqid = row.eqid
      this.websock.eqid = this.eqid
      this.renderedPlotIds.clear(); // 清空已渲染 ID 集合
      this.initPlot(row.eqid)
      this.eqOccurrenceTime = row.occurrenceTime.replace('T', ' ') + ':00';
      console.log("更换地震后的时间",this.eqOccurrenceTime)
      this.title = this.timestampToTimeChina(row.occurrenceTime) + row.earthquakeName + row.magnitude

      // 输入框有无内容调用接口不同返回数据格式不同
      let latitude = null
      let longitude = null

      if (!this.queryParams){
        latitude = row.latitude
        longitude = row.longitude
      }else{
        latitude = row.geom.coordinates[1]
        longitude = row.geom.coordinates[0]
      }
      
      window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(parseFloat(longitude), parseFloat(latitude), 60000),
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        }
      });
      this.getEqInfo(this.eqid)
    },
    // 获取地震列表、以及最新地震的eqid、并渲染已有的标绘
    getEq() {
      let that = this
      getAllEqList().then(res => {
        console.log("********************************************************")
        console.log("res", res)
        let resData = res.data.filter(item => item.magnitude >= 5)
        let data = []
        for (let i = 0; i < resData.length; i++) {
          let item = resData[i]
          item.time = resData[i].occurrenceTime.replace("T", " ")
          item.magnitude = Number(item.magnitude).toFixed(1)
          item.latitude = Number(item.latitude).toFixed(2)
          item.longitude = Number(item.longitude).toFixed(2)
          data.push(item)
        }
        that.getEqData = data
        that.total = resData.length
        that.tableData = that.getPageArr()
        that.eqid = that.tableData[0].eqid
        that.eqOccurrenceTime = that.tableData[0].occurrenceTime.replace("T", " ")
        that.title = this.timestampToTimeChina(that.tableData[0].occurrenceTime.replace("T", " ")) + that.tableData[0].earthquakeName + that.tableData[0].magnitude
        window.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(parseFloat(that.tableData[0].longitude), parseFloat(that.tableData[0].latitude), 60000),
          orientation: {
            // 指向
            heading: 6.283185307179581,
            // 视角
            pitch: -1.5688168484696687,
            roll: 0.0
          }
        });
        // 建立WS
        this.initWebsocket()
        // that.websock.eqid = that.eqid
        this.initPlot(that.eqid)
        this.getEqInfo(that.eqid)
        // 初始化标绘所需的viewer、ws、pinia
        let cesiumStore = useCesiumStore()
        cesiumPlot.init(window.viewer, this.websock, cesiumStore)

        console.log("websock:", this.websock)
      })
    },
    // /取地震信息+开始结束当前时间初始化
    getEqInfo(eqid) {
      getEqListById({id: eqid}).then(res => {
        //震中标绘点
        console.log("res", res)
        this.centerPoint = res
        this.centerPoint.plotid = "center"
        this.centerPoint.starttime = new Date(res.occurrenceTime)
        this.centerPoint.endtime = new Date(res.occurrenceTime + (7 * 24 * 60 * 60 * 1000 + 1000));

        //变量初始化
        this.eqstartTime = this.centerPoint.starttime
        this.eqyear = this.eqstartTime.getFullYear()
        this.eqmonth = this.eqstartTime.getMonth() + 1
        this.eqday = this.eqstartTime.getDate()
        // 计算结束时间 结束时间为开始后72小时，单位为毫秒
        this.eqendTime = new Date(this.eqstartTime.getTime() + ((7 * 24 + 5) * 60 * 60 * 1000));
        this.currentTime = this.eqstartTime

        this.updateMapandVariablebeforInit(this.centerPoint)
      })
    },
    //更新地图中心视角，更新变量：地震起止时间，渲染点
    updateMapandVariablebeforInit(data) {
      let centerData = {
        ...data,
        drawtype: data.plotid
      }
      //加载中心点
      viewer.entities.add({
        properties: {
          centerData
        },
        position: Cesium.Cartesian3.fromDegrees(
            parseFloat(this.centerPoint.longitude),
            parseFloat(this.centerPoint.latitude),
            parseFloat(this.centerPoint.height || 0)
        ),

        billboard: {
          image: centerstar,
          width: 60,
          height: 60,
          scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
          disableDepthTestDistance: Number.POSITIVE_INFINITY // 确保 billboard 不被遮挡
        },
        label: {
          text: this.centerPoint.earthquakeName + parseFloat(this.centerPoint.magnitude).toFixed(1) + "级",
          show: true,
          font: '20px sans-serif',
          fillColor: Cesium.Color.RED,        //字体颜色
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小

          disableDepthTestDistance: Number.POSITIVE_INFINITY // 确保 billboard 不被遮挡
        },
        id: this.centerPoint.plotid,
        plottype: "震中",
        layer: "标绘点"
      });
      let that = this
      // that.smallViewer.entities.removeAll();
      // that.smallViewer.entities.add({
      //   position: Cesium.Cartesian3.fromDegrees(
      //       parseFloat(this.centerPoint.longitude),
      //       parseFloat(this.centerPoint.latitude),
      //       parseFloat(this.centerPoint.height || 0)
      //   ),
      //   billboard: {
      //     image: centerstar,
      //     width: 50,
      //     height: 50,
      //   },
      //   label: {
      //     text: this.centerPoint.position,
      //     show: true,
      //     font: '10px sans-serif',
      //     fillColor: Cesium.Color.RED,        //字体颜色
      //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      //     outlineWidth: 2,
      //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      //     pixelOffset: new Cesium.Cartesian2(0, -16),
      //   },
      //   id: this.centerPoint.plotid,
      //   plottype: "震中",
      // });
    },
    // 修改table header的背景色
    tableHeaderColor() {
      return {
        'border-width': '1px',
        'border-style': 'solid',
        'border-color': '#555555',
        'background-color': '#293038 !important', // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
        'color': '#fff',
        'padding': '0',
        'text-align': 'center',
        // 'border-left-color': '#323843',
        // 'border-left-width': '1px',
        // 'border-left-style': 'solid',
        // 'border-right-color': '#323843',
        // 'border-right-width': '1px',
        // 'border-right-style': 'solid',
      }
    },
    // 修改table的背景色
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 === 1) {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#313a44',
          'color': '#fff',
          'padding': '10',
          'text-align': 'center',
          // 'border-left-color': '#323843',
          // 'border-left-width': '1px',
          // 'border-left-style': 'solid',
          // 'border-right-color': '#323843',
          // 'border-right-width': '1px',
          // 'border-right-style': 'solid',
        }
      } else {
        return {
          'border-width': '1px',
          'border-style': 'solid',
          'border-color': '#555555',
          'background-color': '#304156',
          'color': '#fff',
          'padding': '10',
          'text-align': 'center',
          // 'border-left-color': '#323843',
          // 'border-left-width': '1px',
          // 'border-left-style': 'solid',
          // 'border-right-color': '#323843',
          // 'border-right-width': '1px',
          // 'border-right-style': 'solid',
        }
      }
    },
    //数组切片
    getPageArr() {
      let arr = []
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize

      // 确保结束索引不超过总数据量
      if (end > this.total) {
        end = this.total
      }

      // 遍历数据并加入分页数据中
      for (; start < end; start++) {
        if (this.getEqData[start]) {
          // 调试：打印当前访问的数据
          console.log('正在访问的数据索引:', start, '数据:', this.getEqData[start]);
          arr.push(this.getEqData[start])
        } else {
          // 调试：如果数据为空
          console.log('无效数据，跳过索引:', start);
        }
      }

      // 调试：打印当前分页数据
      console.log('当前分页数据:', arr);

      return arr
    },

    //`每页 ${val} 条`
    handleSizeChange(val) {
      this.pageSize = val
      this.tableData = this.getPageArr()
      // console.log(`每页 ${val} 条`);
    },
    // `当前页: ${val}`
    handleCurrentChange(val) {
      this.currentPage = val
      this.tableData = this.getPageArr()
      // console.log(`当前页: ${val}`);
    },
    //--------------tree------------------------

    handleNodeClick(data) {
      if (data.label !== "量算工具") {
        this.plotTreeClassification = []
        let arr = this.plotPicture.filter(item => {
          return item.type === data.label
        })
        this.plotTreeClassification = [...arr]
      } else {
        this.plotTreeClassification = []
      }
    },

    treeItemClick(item) {
      let data = {
        plot: {
          earthquakeId: this.eqid,
          plotId: null,
          drawtype: null,
          icon: null,
          severity: null,
          plotType: null,
          angle: null,
          creationTime: this.timestampToTime(new Date()).replace(" ", "T"),
          elevation: null,
          startTime: null,
          endTime: null,
          isDeleted: false,
          geom: {
            type: "MultiPoint",
            coordinates: null
          }
        },
        plotinfo: null
      }

      let that = this
      // 删除全局视角锁定（解决箭头标绘绘制时双击会聚焦在点上）
      window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
      this.isShowMessageIcon = true
      this.messageIcon = import.meta.env.VITE_APP_BASE_API +'/uploads/PlotsPic/' + item.img + '.png?t=' + new Date().getTime()

      if (item.plottype === '点图层') {
        console.log("点图层")
        this.toggleEnable('none')
        this.openPointPop(item.name, item.img)
      } else if (item.name === '直线箭头') {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          Arrow.drawStraightArrow(data, resolve)
        }).then((res) => {
          this.openPolygonPop(res.plot.plotType, res.plot)
        })
      } else if (item.name === '攻击箭头') {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          Arrow.drawAttackArrow(data, resolve)
        }).then((res) => {
          this.openPolygonPop(res.plot.plotType, res.plot)
        })
      } else if (item.name === '钳击箭头') {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          Arrow.drawPincerArrow(data, resolve)
        }).then((res) => {
          this.openPolygonPop(res.plot.plotType, res.plot)
        })
      } else if (item.plottype === '线图层') {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          this.drawPolyline(item, resolve)
          this.polylineStatus = cesiumPlot.drawPolylineStatus()
        }).then((res) => {
          // console.log("线的什么时候传的res",res)
          let situationPlotData = []// situationplot表中的线数据
          // 使用封装好的 convertToGeoJsonLineStringAndHeights 方法
          let geom = this.convertToGeoJsonLineStringAndHeights(res.pointPosArr);

          // 创建 plotItem 对象
          let plotItem = {
            earthquakeId: that.eqid,
            plotId: res.plotId,
            time: res.timestampArr[0], // 假设传第一个时间点
            plotType: item.name,
            drawtype: "polyline",
            icon: item.img,
            geom: geom.lineString, // 使用封装好的 GeoJSON LineString，包含高度信息
            elevation: 0 || geom.heights[0], // 如果需要单独传海拔可以进一步处理
          };
          // 添加到数据数组
          situationPlotData.push(plotItem);
          that.polylineStatus = cesiumPlot.drawPolylineStatus()
          // let pl = window.viewer.entities.getById(situationPlotData[0].plotid);
          // pl.properties.data = situationPlotData
          // console.log(pl)
          this.openPolylinePop(item.name, situationPlotData)
        })
      } else {
        this.toggleEnable('none')
        new Promise((resolve, reject) => {
          this.drawPolygon(item, resolve)
          this.polygonStatus = cesiumPlot.drawPolygonStatus()
        }).then((res) => {
          // console.log("res",res,item)
          // 调用 convertToGeoJsonLineStringAndHeights 方法，将 res.pointPosArr 转换
          let geoJsonData = this.convertToGeoJsonPolygonAndHeights(res.pointPosArr);

          let situationPlotData = []// situationplot表中的面数据
          // 创建一个新的对象，替换 res 中的 pointPosArr

          let plotItem = {
            ...res,  // 保留 res 中其他属性不变
            geom: geoJsonData.Polygon, // 使用转换后的 GeoJSON LineString
            elevation: 0 || geoJsonData.heights[0], // 单独的高度数组
          };
          // 删除 pointPosArr，替换为 geom 和 heights
          delete plotItem.pointPosArr;

          situationPlotData.push(plotItem)
          console.log("situationPlotData", situationPlotData)
          that.polygonStatus = cesiumPlot.drawPolygonStatus()
          this.openPolygonPop(res.plotType, situationPlotData)
        })
      }
    },

    //--------------点------------------------

    // 打开添加点标绘对话框
    openPointPop(type, img) {
      let that = this;
      let cesiumStore = useCesiumStore();

      if (this.openAddStatus) {
        // 1-1 更改添加点标注按钮状态
        this.openAddStatus = !this.openAddStatus;

        // 1-3 生成点标注的handler
        console.log(111);
        cesiumPlot.initPointHandler(type, img, this.eqid, true).then(res => {
          that.addMarkDialogFormVisible = true;
          this.isShowMessageIcon = false;
          this.messageIcon = '';
          console.log(222);
          this.toggleEnable('auto')
        });
      }
    },
    // 画点
    drawPoint(pointInfo) {
      if (this.ifPointAnimate) {
        cesiumPlot.drawPoint(pointInfo, true)
      } else {
        cesiumPlot.drawPoint(pointInfo)
      }
    },
    drawPoints(pointInfo, bool) {
      cesiumPlot.drawPoints(pointInfo, bool, 5000);
    },

    ifPointAnimation(val) {
      this.ifPointAnimate = val
    },
    // 重置标绘信息填写的绑定数据
    resetAddMarkCollection() {
      let cesiumStore = useCesiumStore()
      new Promise((resolve, reject) => {
        // 1-1 先清空store中的数据，这时触发监听，因为是异步，所以用promise写成同s进行
        cesiumStore.clearData()
        resolve()
      }).then(res => {
        // 2-1 更改添加点标绘按钮状态使其可以点击
        this.openAddStatus = !this.openAddStatus
        // 3-1 关闭弹窗
        this.addMarkDialogFormVisible = !this.addMarkDialogFormVisible
      })
    },
    // ws发送数据（只有点的是在这里）
    wsSendPoint(data) {
      if (JSON.parse(data).operate === "delete") {
        this.plots = this.plots.filter(plot => plot.plotId !== JSON.parse(data).id);
        console.log(this.plots,"this.plots wsSendPoint")
      }
      else if (JSON.parse(data).operate === "add") {
        let markData = JSON.parse(data).data
        markData.plot.longitude = Number(markData.plot.geom.coordinates[0])
        markData.plot.latitude = Number(markData.plot.geom.coordinates[1])
        this.plots.push(markData.plot)
        console.log(this.plots,"this.plots wsSendPoint existingPlot")
        if(this.loadingupdate===true){
          this.loadingupdate=false
        }
      }
      console.log(this.websock, "websock:")
      console.log(data, "wsSendPoint(data)")
      // this.websock.onopen = () => {
      this.websock.send(data)
    },

    //------------线------------
    openPolylinePop(plotType, situationPlotData) {
      this.toggleEnable('auto')
      //*在这里用promise传的值*/
      let that = this
      let cesiumStore = useCesiumStore()
      if (this.openAddStatus) {
        // 1-1 更改添加点标注按钮状态
        this.openAddStatus = !this.openAddStatus
        // 1-2 提示弹窗
        // this.message = ElMessage({
        //   message: '请点击地图添加标注点',
        //   type: 'info',
        //   duration: 0
        // })
        cesiumStore.setPolyilneInfo({plotType, situationPlotData})
        that.addPolylineDialogFormVisible = true
        this.isShowMessageIcon = false;
        this.messageIcon = '';

        // 1-3 生成点标注的handler
        // cesiumPlot.initPointHandler(type, img, this.eqid).then(res => {
        //   that.addMarkDialogFormVisible = true
        //   this.message.close(that.addMarkDialogFormVisible)
        // })
      }
    },
    drawPolyline(info, resolve) {
      cesiumPlot.drawActivatePolyline(info.name, info.img, this.eqid, resolve)
    },
    resetPolyline() {
      let cesiumStore = useCesiumStore()
      new Promise((resolve, reject) => {
        // 1-1 先清空store中的数据，这时触发监听，因为是异步，所以用promise写成同步进行
        cesiumStore.clearPolyilneInfo()
        resolve()
      }).then(res => {
        // 2-1 更改添加点标绘按钮状态使其可以点击
        this.openAddStatus = !this.openAddStatus
        // 3-1 关闭弹窗
        this.addPolylineDialogFormVisible = !this.addPolylineDialogFormVisible
      })
    },
    // 画线
    drawN() {
      cesiumPlot.drawActivatePolyline("量算")
    },
    // 删除线
    deletePolyline() {
      let polyline = window.selectedEntity
      cesiumPlot.deletePolyline(polyline)
      this.showPolyline = false
    },

    //------------面-------------
    openPolygonPop(plotType, situationPlotData) {
      this.toggleEnable('auto')

      let that = this
      let cesiumStore = useCesiumStore()
      if (this.openAddStatus) {
        // 1-1 更改添加点标注按钮状态
        this.openAddStatus = !this.openAddStatus
        // 1-2 提示弹窗
        // this.message = ElMessage({
        //   message: '请点击地图添加标注点',
        //   type: 'info',
        //   duration: 0
        // })
        // console.log("situationPlotData",plotType,situationPlotData)
        cesiumStore.setPolygonInfo({plotType, situationPlotData})
        console.log("123", situationPlotData)
        that.addPolygonDialogFormVisible = true
        this.isShowMessageIcon = false;
        this.messageIcon = '';
        // 1-3 生成点标注的handler
        // cesiumPlot.initPointHandler(type, img, this.eqid).then(res => {
        //   that.addMarkDialogFormVisible = true
        //   this.message.close(that.addMarkDialogFormVisible)
        // })
      }
    },
    drawPolygon(info, resolve) {
      // console.log(info, "面")
      cesiumPlot.drawActivatePolygon(info.name, info.img, this.eqid, resolve)
    },
    //获取数据库数据绘制面
    getDrawPolygonInfo(info) {
      cesiumPlot.getDrawPolygon(info)
    },
    resetPolygon() {
      window.isDrawingPolygon = false;  // 启用标志位
      let cesiumStore = useCesiumStore()
      new Promise((resolve, reject) => {
        // 1-1 先清空store中的数据，这时触发监听，因为是异步，所以用promise写成同步进行
        cesiumStore.clearPolygonInfo()
        resolve()
      }).then(res => {
        // 2-1 更改添加点标绘按钮状态使其可以点击
        this.openAddStatus = !this.openAddStatus
        // 3-1 关闭弹窗
        this.addPolygonDialogFormVisible = !this.addPolygonDialogFormVisible
      })
    },
    // 画面
    drawP() {
      cesiumPlot.drawActivatePolygon("量算面积")
    },
    // 删除面
    deletePolygon() {
      let polygon = window.selectedEntity//this.polygonPosition
      cesiumPlot.deletePolygon(polygon)
      this.showPolygon = false
    },
    showPopup() {
      this.popupVisiblePolygon = true;
    },
    // 处理弹窗确认
    handlePopupConfirm() {
      this.popupVisiblePolygon = false;
    },

    //------------------------------------------------------------------------------

    sendPlot(plotId, plotType) {
      // 初始化存储的数组
      if (!this.plotArray) {
        this.plotArray = [];
      }
      // 将 plotId 和 plotInfo 作为对象存储在数组中
      const plotData = {plotId, plotType};
      this.plotArray = plotData;
      console.log("plotArray", this.plotArray)
      this.plotList.push(plotData)
    },
    // cesium自身接口scene.terrainProviderChanged(只读),当地形发生变化时(添加高程)触发
    // 不能用watch来监视scene.terrainProviderChanged,会造成堆栈溢出（内存溢出）
    isTerrainLoaded() {
      let terrainProvider = window.viewer.terrainProvider;
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        // console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        // 如果terrainProvider已定义，但不是EllipsoidTerrainProvider，
        // 则表示已经设置了其他地形提供者
        // console.log("地形已加载")
        return true;
      }
      // console.log("地形未加载")
      return false;
    },
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
    timestampToTime(timestamp) {
      let DateObj = new Date(timestamp)
      // 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
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
    timestampToTimeChina(timestamp) {
      let DateObj = new Date(timestamp)
      // 将时间转换为 XX年XX月XX日XX时XX分XX秒格式
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
      return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
      // return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    },
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    convertToGeoJsonLineStringAndHeights(pointPosArr) {
      let coordinates = [];
      let heights = [];

      // 遍历 pointPosArr 数组，将 Cartesian 坐标转换为经纬度，并构建坐标数组和高度数组
      pointPosArr.forEach(cartesian => {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let longitude = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let height = cartographic.height; // 高度

        // 将经纬度按 [lon, lat] 形式存入坐标数组
        coordinates.push([longitude, latitude]);

        // 将高度存入高度数组
        heights.push(height);
      });

      // 返回包含 GeoJSON LineString 和高度数组的对象
      return {
        lineString: {
          type: "LineString",
          coordinates: coordinates
        },
        heights: heights // 高度单独返回
      };
    },
    convertToGeoJsonPolygonAndHeights(pointPosArr) {
      let coordinates = [];
      let heights = [];

      // 遍历 pointPosArr 数组，将 Cartesian 坐标转换为经纬度，并构建坐标数组和高度数组
      pointPosArr.forEach(cartesian => {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let longitude = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let height = cartographic.height; // 高度

        // 将经纬度按 [lon, lat] 形式存入坐标数组
        coordinates.push([longitude, latitude]);

        // 将高度存入高度数组
        heights.push(height);
      });

      // 返回包含 GeoJSON LineString 和高度数组的对象
      return {
        Polygon: {
          type: "Polygon",
          coordinates: [coordinates]
        },
        heights: heights // 高度单独返回
      };
    },
    /*获取目前相机所属高度*/
    updateZoomLevel(cameraHeight) {
      // console.log("层级",cameraHeight)
      // 根据相机高度设置 zoomLevel
      if (cameraHeight > 200000) {
        this.zoomLevel = '市'
      } else if (cameraHeight > 70000) {
        this.zoomLevel = '区/县'
      } else if (cameraHeight > 4000) {
        this.zoomLevel = '乡/镇'
      } else {
        this.zoomLevel = '村'
      }
    },

    // 搜索框
    handleQuery() {
      const searchKey = this.queryParams.trim();  // 获取搜索关键字

      // 如果搜索框为空，直接调用 this.getEq()
      if (!searchKey) {
        this.getEq(); // 调用无参数查询的方法
        return;
      }

      // 格式化搜索关键字，转换为后端可以识别的格式（例如：ISO时间字符串）
      const formattedKey = searchKey
          .replace(/年/g, "-")
          .replace(/月/g, "-")
          .replace(/日/g, " ")
          .replace(/时/g, ":")
          .replace(/分/g, ":")
          .replace(/秒/g, "");

      // 根据是否有格式化的搜索关键字来调用不同的查询方法
      const queryPromise = formattedKey ? querySituationData(formattedKey) : querySituationData();

      queryPromise
          .then(res => {
            console.log("获取的数据:", res);

            // 只筛选震中震级大于等于5的数据
            let resData = res.data.filter(item => item.magnitude >= 5);

            // 格式化返回的数据
            this.getEqData = resData.map(item => {
              // 格式化时间：将ISO时间中的'T'替换为' '
              item.time = item.occurrenceTime.replace("T", " ");

              // 格式化震级、纬度和经度
              item.magnitude = Number(item.magnitude).toFixed(1); // 震级保留1位小数
              item.latitude = Number(item.latitude).toFixed(2); // 纬度保留2位小数
              item.longitude = Number(item.longitude).toFixed(2); // 经度保留2位小数

              return item;
            });

            // 更新总数
            this.total = this.getEqData.length;

            // 获取分页数据
            this.tableData = this.getPageArr();
          })
          .catch(error => {
            console.error("查询时出现错误:", error.message || error);
            const errorMessage = error.response?.data?.message || '查询失败，请稍后重试';
            ElMessage.error(errorMessage);  // 弹出错误提示
          });
    },

    // 重置功能
    resetQuery() {
      this.queryParams = '';  // 清空搜索输入框
      this.getEq()
    },
    // ====================导航栏按钮============================
    switchPanel(action) {
      // 更新 panels 的状态，先设置所有为 false
      for (let key in this.panels) {
        if (this.panels.hasOwnProperty(key)) {
          this.panels[key] = false;
        }
      }
      this.toolValue = this.panels.tableVisible ? "隐藏列表" : "显示列表";
      console.log(this.panels);  // 这里的 panels 会先被更新为 false

      // 在下次 DOM 更新后执行 handleMenuAction(action)
      this.$nextTick(() => {
        console.log(action);  // 确保 action 的打印是在面板状态更新之后
        this.handleMenuAction(action);  // 在面板状态更新后执行
      });
    },
    showDropdown(index) {
      this.menus[index].showDropdown = true;
    },
    hideDropdown(index) {
      this.menus[index].showDropdown = false;
    },
    handleMenuAction(action) {
      console.log(action);

      // 判断是否存在对应的方法
      if (this[action]) {
        this[action](); // 无参数调用
      } else if (action.includes('=')) {
        // 解析 action 中的赋值操作
        const [key, value] = action.split('=').map(item => item.trim());

        // 处理类似 panels.searchSupplyDialog = true 这种赋值
        const keys = key.split('.');  // 将属性路径分割成数组，处理多层嵌套属性
        let obj = this;
        for (let i = 0; i < keys.length - 1; i++) {
          obj = obj[keys[i]];  // 遍历到嵌套对象
        }
        // 获取最后一个属性，并进行赋值
        const lastKey = keys[keys.length - 1];
        obj[lastKey] = value === 'true' ? true : value === 'false' ? false : value;

      } else if (action.includes('(') && action.includes(')')) {
        // 解析函数调用和传参
        const [methodName, args] = action.split('(');
        const params = args.replace(')', '').split(',').map(arg => arg.trim());

        // 检查是否存在该方法，并传递参数
        if (this[methodName]) {
          console.log(action)
          console.log(params)
          this[methodName](...params); // 通过展开运算符传递参数
        }
      } else {
        console.log('其他情况：', action);
      }
    },

    // 触发文件选择
    triggerUpload() {
      // this.loading=true
      if (this.$refs.upload) {
        this.$refs.upload.$el.querySelector('input[type="file"]').click();
        // this.loadingupdate=true
      } else {
        console.error("el-upload 未找到");
      }
    },

  }
}
</script>

<style scoped>

.eqtitle {
  position: absolute;
  background: url(@/assets/images/EmergencyResourceInformation/导航栏发光样式.png) no-repeat;
  background-color: #283b4d;
  height: 7%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-size: 51% 100%;
  z-index: 100;
  width: 100%;
}

.eqtitle-text_eqname {
  margin-left: 25px;
  font-weight: 550;
  font-size: 1.8rem;
  position: relative;
  background-repeat: no-repeat;
  color: #fff;
  text-shadow: 0 3px 6px #1973c0;
}

.posInfo {
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.cesium-viewer-navigationContainer {
  display: none !important;
}

.plotTreeItem {
  margin: 3px;
}

.plottreetooltip {
  margin: 4px;
}

.situation_cesiumContainer {
  height: calc(100vh - 50px) !important;
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

.situation_eqTable {
  width: 690px;
  height: 372px;
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 80px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.noteContainer {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  top: 490px;
  left: 10px;
  width: 530px;
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
}

.tool-container {
  position: absolute;
  padding: 10px;
  border-radius: 5px;
  width: 500px;
  top: 90px;
  left: 10px;
  z-index: 10; /* 更高的层级 */
  background-color: rgba(40, 40, 40, 0.7);
}

.modelAdj {
  color: white;
  margin-bottom: 5px;
}


/* 修改element内置css不生效，则需要加上/deep/ */
/* 分页组件调整 */
.el-pagination {
  margin-top: 10px;
  justify-content: center;
}

/* 树形结构调整 */
:deep(.el-pagination>.is-first) {
  color: #FFFFFF !important;
}

.plotTool {
  background: rgb(38 36 36) !important;
  color: #ffffff !important;
}

:deep(.plotTool .el-tree-node__content:hover) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.plotTool .el-tree-node:focus > .el-tree-node__content) {
  background-color: rgb(56, 79, 105) !important;
}

:deep(.el-table--fit .el-table__inner-wrapper:before) {
  width: 0 !important;
}

.download-button,
.cancel-button {
  margin: 5px;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.preview-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 70%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 0px 20px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10000;
}

img {
  max-width: 100%;
  vertical-align: top;
}

.preview-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}

.download-button,
.cancel-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
}

.download-button:hover,
.cancel-button:hover {
  background-color: #2980b9;
}

/* 确保按钮显示在图片的下方正中央 */
.preview-buttons {
  justify-content: center;
  margin-top: 10px;
}

.export-info {
  display: flex;
  justify-content: center;
  background-color: white;
  width: 100%;
}

.img_outbox {
  border: 3px solid black;
  padding: 20px;
}


.main_coantainer {
  border: 3px solid black;
  background-color: white;
}

.top_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.middow {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bottom_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.box {
  width: 19.47px;
}

.top {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.main {
  flex: 1;
  border: 2px solid black;
  align-items: stretch;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bottom_container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.bottom {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.compassContainer {
  position: absolute;
  top: 20px; /* 距离顶部的像素 */
  right: 20px; /* 距离右侧的像素 */
  height: 120px;
  width: 160px;
  background: url(@/assets/compass.png) no-repeat center / cover;
  z-index: 20;
  transform-origin: center; /* 设置旋转中心 */
  transition: transform 0.5s; /* 动画效果 */
}

.loading-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 10px;
  z-index: 10000;
}

/*menu样式*/
.menu-item {
  position: relative;
  height: 100%;
  display: flex;
  width: 12%;
  left: 5%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 16px;
  margin-right: 1rem; /* 每个菜单项之间设置50px的间距 */
}

.menu-label {
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-item:hover .menu-label {
  color: #00aaff;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: rgba(46, 52, 63, 0.87);
  /*padding: 10px;/*/
  display: flex;
  flex-direction: column;
  z-index: 101; /* 设置高于 cesium-viewer 的 z-index */
}

.dropdown-item {
  color: white;
  padding: .7rem;
  cursor: pointer;
  z-index: 101; /* 设置高于 cesium-viewer 的 z-index */
}

.dropdown-item:hover {
  background-color: #1b95ff;
  /*color: #00aaff;*/
}

:deep(.cesium-viewer-toolbar) {
  display: block;
  /*搜索按钮优先级最高，避免被物资搜索框遮盖*/
  z-index: 100;
  position: absolute;
  top: 64px;
  right: 452px;
}

/*导入弹窗*/
.dialog-visible {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dialog-content {
  position: relative;
  width: 400px;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.dialog-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

.dialog-close:hover {
  color: #333;
}

h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}

p {
  margin: 10px 0;
  font-size: 16px;
}

.success {
  color: green;
}

.error {
  color: red;
}

.dialog-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.dialog-button:hover {
  background-color: #66b1ff;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

</style>
