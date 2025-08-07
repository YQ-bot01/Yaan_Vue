<template>
  <div>
    <div id="cesiumContainer" class="situation_cesiumContainer">

      <!--      地震列表组件-点击列表“详情”显示专题图列表，二三维一体化——分析研判产出      -->
      <EarthquakeList
          @imag-selected="onImagSelected"
          @selectEq="selectEq"
      ></EarthquakeList>
    </div>
    <!-- 加载中的提示 -->
    <div v-if="loading" class="loading-container">
      <p>正在导出，请稍候...</p>
    </div>
    <!--    专题图预览组件    -->
    <thematicMapPreview
        @ifShowThematicMapDialog="ifShowDialog"
        :imgshowURL="imgshowURL"
        :imgurlFromDate="imgurlFromDate"
        :imgName="imgName"
        :ifShowMapPreview="ifShowMapPreview"
        :selectedEq="selectedEqData"
        :showTypes="showTypes"
        :corners="corners"
        :step="step"
        style="width: 70%"
    ></thematicMapPreview>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from "@/cesium/tool/initCesium.js";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import EarthquakeList from "../../components/ThematicMap/earthquakeList.vue";
import ThematicMapPreview from "../../components/ThematicMap/thematicMapPreview.vue";
import html2canvas from "html2canvas";
import * as turf from '@turf/turf';
import {sampleTerrainMostDetailed} from "cesium";
import {getEqList} from "@/api/system/damageassessment.js";
import layer from "@/cesium/layer.js";


export default {
  name: "thematicMap",
  components: {
    EarthquakeList,
    ThematicMapPreview
  },
  data() {
    return {
      total: 0,
      pageSize: 10,
      currentPage: 1,
      getEqData: [],
      filteredEqData: [],
      pagedEqData: [],

      title: "",
      isFoldShow: true,

      listEqPoints: [], // 列表地震点
      //-----------导出图片----------------
      loading: false, // 控制加载状态


      //向预览组件传递数据
      imgshowURL: null,// 保存预览图片的 URL
      imgurlFromDate: "",
      imgName: '',
      ifShowMapPreview: false, // 是否预览专题图
      selectedEqData: null,
      //这个showTypes注意，1为前端存储的图片，2是截图加自动生成经纬度线，3是三维模型图，就是等高线
      showTypes: 1,

      //下面这两个是经纬度线往子组件穿的数据
      corners:{},
      //下面的是用来解决导出图片边框和经纬度数字展示用的
      step: 0.5,

      // 导出图片时经纬度线用到的
      //还有step也在经纬度这里用到了
      rectangleBounds: [],//按东南西北的顺序存储
      latLonEntities: [], // 用于存储经纬度线实体的数组
      contourSource: null, // 存等高线
    };
  },
  mounted() {
    this.init();
    this.getEq();
  },

  methods: {
    // 获取地震列表并渲染
    getEq() {
      let that = this
      getEqList().then(res => {
        console.log("返回的数据1",res.data)
        let resData = res.data.filter(item =>
            item.earthquakeName.includes("雅安") || Number(item.magnitude) >= 4.0
        )
        that.getEqData = resData
        that.total = resData.length
        let data = []
        for (let i = 0; i < res.data.length; i++) {
          let item = res.data[i]
          item.occurrenceTime = that.timestampToTime(item.occurrenceTime)
          item.magnitude = Number(item.magnitude).toFixed(1)
          item.latitude = Number(item.latitude).toFixed(2)
          item.longitude = Number(item.longitude).toFixed(2)
          data.push(item)
        }

        this.getEqData = data;
        this.filteredEqData = data;
        this.updatePagedEqData();
      });
    },

    // 初始化控件等
    init() {
      let viewer = initCesium(Cesium);
      viewer._cesiumWidget._creditContainer.style.display = "none";
      window.viewer = viewer;
      let options = {};
      options.defaultResetView = Cesium.Cartographic.fromDegrees(
          103.0,
          29.98,
          500000,
          new Cesium.Cartographic()
      );
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(103.0, 29.98, 500000), // 设置经度、纬度和高度
      });
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
      this.renderQueryEqPoints();
      // this.addYaanLayer()
      layer.loadSiChuanCountyLayer();
      window.viewer.camera.changed.addEventListener(this.handleCameraChange);
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
    // 鼠标事件监听
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

        // 判断点击的是不是地震点
        if (Cesium.defined(pickedObject) && pickedObject.id.billboard) {
          pickedObject.id.label._show._value = !pickedObject.id.label._show._value;
        } else {

          this.listEqPoints.forEach(entity => {
            entity.label._show._value = false;
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },


    // 分页数据更新
    updatePagedEqData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      this.pagedEqData = this.filteredEqData.slice(start, end);
      // 清除之前的点并重新添加
      this.renderQueryEqPoints();
    },


    // 地图渲染查询地震点(根据页码、根据搜索框)
    renderQueryEqPoints() {
      // 清空之前的点
      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = []; // 重置 listEqPoints

      this.pagedEqData.forEach(eq => {
        const entity = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude)),
          billboard: {
            image: eqMark,
            width: 20,
            height: 20,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
            depthTest: false,//禁止深度测试但是没有下面那句有用
            disableDepthTestDistance: Number.POSITIVE_INFINITY//不再进行深度测试（真神）
                    },
          label: {
            text: this.timestampToTime(eq.occurrenceTime, 'date') + eq.earthquakeName + eq.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            show: false,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            clampToGround: true,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,  // 左侧对齐
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,   // 底部对齐
          },
          id: eq.eqid
        });
        this.listEqPoints.push(entity);  // 保存实体到 listEqPoints
      });
    },


    locateEq(eq) {
      this.pickEqPoint(eq);
      this.renderQueryEqPoints();

      // 提取地震的经纬度
      const longitude = parseFloat(eq.longitude);
      const latitude = parseFloat(eq.latitude);

      // 设置相机的飞行动作
      window.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 200000), // 目标位置
        orientation: {
          heading: Cesium.Math.toRadians(0.0), // 朝向 (0度)
          pitch: Cesium.Math.toRadians(-90.0), // 俯仰角 (-45度)
          roll: Cesium.Math.toRadians(0.0) // 翻滚角 (0度)
        },
      });
    },

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
    },

    // 模糊匹配地震时间、位置和震级
    filterEq() {
      if (this.title) {
        this.filteredEqData = this.getEqData.filter((eq) => {
          const dateStr = this.timestampToTime(eq.occurrenceTime, 'date');
          const positionStr = eq.earthquakeName;
          const magnitudeStr = eq.magnitude;
          return (
              dateStr.includes(this.title) ||
              positionStr.includes(this.title) ||
              magnitudeStr.includes(this.title)
          );
        });
      } else {
        this.filteredEqData = this.getEqData;
      }
      this.currentPage = 1;
      this.updatePagedEqData();
    },

    pickEqPoint(eq)
    {
      this.listEqPoints.forEach(entity => {
        entity.label._show._value = entity._id === eq.eqid;
        // console.log(entity.label)
      })
    },

    getAssetsFile() {
      this.imgshowURL = new URL(this.imgurlFromDate, import.meta.url).href
    },

    // 遥感影像视角跳转方法
    remoteSensingImagePerspectiveJump(callback) {
      // 确保 Viewer 和数据有效
      if (!window.viewer) {
        console.error("Viewer 未初始化或经纬度数据无效");
        return;
      }
      const longitude = parseFloat(this.selectedEqData.longitude);
      const latitude = parseFloat(this.selectedEqData.latitude);

      if (isNaN(longitude) || isNaN(latitude)) {
        return;
      }

      // 执行相机飞行
      window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 200000), // 高度可以调整
        orientation: {
          heading: Cesium.Math.toRadians(0.0), // 朝向
          pitch: Cesium.Math.toRadians(-90.0), // 俯仰角
          roll: Cesium.Math.toRadians(0.0),   // 翻滚角
        },
        duration: 1, // 飞行时间
        complete: () => {
          console.log("视角跳转完成");
          if (callback && typeof callback === "function") {
            callback(); // 跳转完成后执行回调
          }
        },
        cancel: () => {
          console.log("视角跳转被取消");
        },
      });
    },

    // 地震列表组件传回专题图路径
    onImagSelected(imagData) {


      console.log("imagData",imagData)
      if (!imagData.imgUrl) {
        if (imagData.theme === "遥感影像图") {
          //   调用截图方法
          this.remoteSensingImagePerspectiveJump(() => {
            // this.captureRemoteSensingImage();
            this.exportCesiumScene(imagData.theme)
          });
        }
        if (imagData.theme === "三维模型图") {
          // 显示加载中的提示
          this.loading = true;

          // 检查当前地形服务是否已经是目标地形服务
          const isThirdPartyTerrain = viewer.terrainProvider instanceof Cesium.CesiumTerrainProvider &&
              viewer.terrainProvider._url === Cesium.IonResource.fromAssetId(1)._url;

          if (!isThirdPartyTerrain) {
            const cameraController = viewer.scene.screenSpaceCameraController;
            cameraController.enableRotate = false;
            cameraController.enableZoom = false;
            cameraController.enableTranslate = false;

            // 切换到第三方地形
            const terrainProvider = new Cesium.CesiumTerrainProvider({
              url: Cesium.IonResource.fromAssetId(1),
              requestWaterMask: true,
              requestVertexNormals: true
            });

            // 更新 viewer 的地形服务
            viewer.terrainProvider = terrainProvider;
          }

          // 确保目标点经纬度有效
          const targetLongitude = Number(this.selectedEqData.longitude);
          const targetLatitude = Number(this.selectedEqData.latitude) - 0.02;

          if (!isNaN(targetLongitude) && !isNaN(targetLatitude)) {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(targetLongitude, targetLatitude, 6000),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-25),
                roll: 0
              },
              duration: 5,
              complete: async () => {
                try {
                  console.log("飞跃完成，开始加载等高线");

                  const cameraController = viewer.scene.screenSpaceCameraController;
                  cameraController.enableRotate = false;
                  cameraController.enableZoom = false;
                  cameraController.enableTranslate = false;

                  // 加载等高线
                  await this.addContourLines();
                  console.log("等高线加载完成，开始截图");

                  // 捕捉远程感应图像
                  await this.captureRemoteSensingImage(imagData.theme);
                  console.log("截图成功");

                } catch (error) {
                  // 错误处理
                  if (error.message.includes("加载等高线失败")) {
                    console.error("加载等高线失败:", error);
                  } else {
                    console.error("截图失败:", error);
                  }
                } finally {
                  const cameraController = viewer.scene.screenSpaceCameraController;
                  cameraController.enableRotate = true;
                  cameraController.enableZoom = true;
                  cameraController.enableTranslate = true;

                  // 截图完成后销毁等高线
                  this.destroyContourLines();

                  // 隐藏加载中的提示
                  this.loading = false;
                }
              }
            });
          }
        }
      }
      else {
        console.log("imagData:",imagData.theme)
        this.imgurlFromDate = imagData.imgUrl
        this.imgName = imagData.theme
        this.ifShowMapPreview = true
        this.showTypes = 1
        this.getAssetsFile()
      }
    },
    // 等高线创建
    addContourLines() {
      return new Promise((resolve, reject) => {
        // 确保目标点经纬度有效
        const targetLongitude = Number(this.selectedEqData.longitude);
        const targetLatitude = Number(this.selectedEqData.latitude);
        console.log("------------------------")
        console.log("等高线 targetLongitude", targetLongitude)
        console.log("等高线 targetLatitude", targetLatitude)

        // 定义兴趣区域（AOI），这里用的是一个矩形区域
        const extent = this.createRectangleFromCenter(targetLongitude, targetLatitude, 0.05, 0.05);
        console.log(extent);

        // 生成一个点网格，0.001 是网格的分辨率
        let pointGrid = turf.pointGrid(extent, 0.001, { units: 'degrees' });

        // 生成网格点的 Cartographic 坐标
        let heightArr = [];
        for (let i = 0; i < pointGrid.features.length; i++) {
          heightArr.push(
              Cesium.Cartographic.fromDegrees(
                  pointGrid.features[i].geometry.coordinates[0],
                  pointGrid.features[i].geometry.coordinates[1]
              )
          );
        }

        // 使用 Cesium 提供的地形数据获取这些点的高度信息
        setTimeout(() => {
          sampleTerrainMostDetailed(window.viewer.terrainProvider, heightArr).then((updatedPositions) => {
            // 更新点网格的高度信息
            for (let i = 0; i < pointGrid.features.length; i++) {
              pointGrid.features[i].properties.height = updatedPositions[i]?.height || 0;
            }

            // 获取高度数据并计算等高线
            let testArr = pointGrid.features.map(feature => feature.properties.height);
            testArr.sort((a, b) => a - b); // 排序
            let minHeight = testArr[0];
            let maxHeight = testArr[testArr.length - 1];
            let step = (maxHeight - minHeight) / 10;
            let breaks = [];
            for (let i = 0; i < 10; i++) {
              breaks.push(minHeight + i * step);
            }

            // 使用 Turf.js 生成等高线
            let lines = turf.isolines(pointGrid, breaks, { zProperty: 'height' });

            // 将等高线加载到 Cesium
            Cesium.GeoJsonDataSource.load(lines, {
              stroke: Cesium.Color.WHITE,
              strokeWidth: 3,
              fill: Cesium.Color.WHITE,
              extruded: true,
              clampToGround: true,
            }).then((contourSource) => {
              window.viewer.dataSources.add(contourSource);
              console.log('等高线加载成功');

              // 保存等高线对象，以便后续销毁
              this.contourSource = contourSource;

              // 强制渲染场景，确保所有数据已渲染
              viewer.scene.requestRender();

              // 给渲染一些时间，确保等高线渲染完成
              setTimeout(() => {
                resolve(contourSource); // 等高线加载完成，调用 resolve() 并传递等高线对象
              }, 1000); // 增加延迟确保渲染完成

            }).catch((error) => {
              console.error('加载等高线失败:', error);
              reject(error); // 加载失败，调用 reject()
            });
          }).catch((error) => {
            console.error('获取地形数据失败:', error);
            reject(error); // 如果获取地形数据失败，调用 reject()
          });
        }, 5000); // 延迟执行，确保地形数据加载完成
      });
    },
    // 等高线生成的位置
    createRectangleFromCenter(centerLon, centerLat, width, height) {
      // 计算矩形的边界
      const halfWidth = width / 2;
      const halfHeight = height / 2;

      const southwest = [centerLon - halfWidth, centerLat - halfHeight];  // 左下角
      const northeast = [centerLon + halfWidth, centerLat + halfHeight];  // 右上角
      const northwest = [centerLon - halfWidth, centerLat + halfHeight];  // 左上角
      const southeast = [centerLon + halfWidth, centerLat - halfHeight]; // 右下角


      // 使用 Turf.js 创建矩形的多边形
      // const extent = turf.bboxPolygon([southwest[0], southwest[1], northeast[0], northeast[1]]);

      // 使用 Turf.js 创建矩形（根据左下角和右上角两个对角点）
      const extent = turf.square([southwest[0], southwest[1], northeast[0], northeast[1]]);

      return extent;
},
    // 销毁等高线
    destroyContourLines() {
      if (this.contourSource) {
        // 移除等高线图层
        window.viewer.dataSources.remove(this.contourSource);
        // 清除等高线对象
        this.contourSource = null;
        // 强制渲染场景，确保图层被移除并渲染更新
        window.viewer.scene.requestRender();
        console.log('等高线销毁成功');

      } else {
        console.log('没有等高线可销毁');
      }
    },
    // 截图 Cesium 场景
    captureRemoteSensingImage(name) {
      if (window.viewer && window.viewer.scene) {
        try {
          // 获取 Cesium 场景的 Canvas 图像
          const cesiumCanvas = window.viewer.scene.canvas;
          if (!cesiumCanvas) {
            throw new Error("未找到 Cesium 场景的 Canvas");
          }

          const cesiumImage = cesiumCanvas.toDataURL("image/png"); // Cesium 场景导出为图片
          console.log("Cesium 场景截图生成成功");

          // 将截图结果设置为图片 URL
          this.imgshowURL = cesiumImage;
          this.imgurlFromDate = cesiumImage;
          this.ifShowMapPreview = true;
          this.imgName = name;
          this.showTypes = 3

        } catch (error) {
          console.error("Cesium 场景截图生成失败", error);
        }
      }
    },

    ifShowDialog(val) {
      // console.log("ifShowDialog-----",val)
      this.ifShowMapPreview = false
    },

    selectEq(eq) {
      console.log("选择的数据",eq)
      this.locateEq(eq)
      this.selectedEqData = eq
    },

    // removeData() {
    //   // this.historyEqPoints = [];
    //   // this.historyEqData = [];
    //   this.removeEntitiesByType("historyEq")
    //  this.removeDataSourcesLayer('duanliedai');
    //   this.removeEntitiesByType("ovalCircle")
    //   // this.isHistoryEqPointsShow = false;
    // },

    // 跳转至指挥大屏
    navigateToVisualization(thisEq) {
      const path = `/thd?eqid=${thisEq.eqid}`;
      window.open(path, '_blank');
    },

    // hidden(hidden) {
    //   this.isHistoryEqPointsShow = hidden;
    //   this.isShow = true;
    // },

    // 时间戳转换
    timestampToTime(timestamp, format = "full") {
      let dateObj = new Date(timestamp);
      let year = dateObj.getFullYear();
      let month = dateObj.getMonth() + 1;
      let day = dateObj.getDate();
      let hh = dateObj.getHours();
      let mm = dateObj.getMinutes();
      let ss = dateObj.getSeconds();

      // 去掉前导零
      month = month > 9 ? month : month.toString().replace(/^0/, "");
      day = day > 9 ? day : day.toString().replace(/^0/, "");
      hh = hh > 9 ? hh : "0" + hh;
      mm = mm > 9 ? mm : "0" + mm;
      ss = ss > 9 ? ss : "0" + ss;

      if (format === "date") {
        // 返回仅日期格式
        return `${year}年${month}月${day}日`;
      } else {
        // 返回完整的日期时间格式
        return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
      }
    },



    //--------------------------------------------------下面是导出图片用的方法--------------------------------------------

    //导出图片：简单来讲就是分别获取一下对应的元素，把对应的元素绘制到合成Canvas上，最后把Canvas转换成图片，实现截图。
    async exportCesiumScene(name) {
      // 开始导出时，显示加载动画
      this.loading = true;

      //  1: 禁用 Cesium 相机的交互功能，防止用户在导出时误操作
      const cameraController = viewer.scene.screenSpaceCameraController;
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
        viewer.scene.requestRender();

        //  4: 获取 Cesium 场景的 Canvas 图像
        const cesiumCanvas = viewer.scene.canvas;
        const cesiumImage = cesiumCanvas.toDataURL('image/png');  // Cesium 场景导出为图片

        //  5-7: 分别渲染图例、距离标尺和指南针
        // const legendCanvas = await this.renderElementToCanvas('.noteContainer', '图例');
        const distanceLegendCanvas = await this.renderElementToCanvas('.distance-legend', '距离标尺');
        // const compassCanvas = await this.renderElementToCanvas('.compassContainer', '指南针');

        //  8: 创建一个新的合成 Canvas
        const finalCanvas = this.createFinalCanvas();
        const finalContext = finalCanvas.getContext('2d', {willReadFrequently: true});

        //  9: 将 Cesium 场景绘制到合成 Canvas 上
        await this.drawImageToCanvas(finalContext, cesiumImage, 0, 0);

        //  10-12: 分别绘制图例、距离标尺和指南针到合成 Canvas 上

        // 计算 legendCanvas 的右下角位置，设置 10px 的边距
        // const x = finalCanvas.width - legendCanvas.width - 10; // 计算右侧位置
        // const y = finalCanvas.height - legendCanvas.height - 10; // 计算底部位置

        // 绘制 legendCanvas 到合成 Canvas 的右下角
        // finalContext.drawImage(legendCanvas, x, y);
        finalContext.drawImage(distanceLegendCanvas, 20, finalCanvas.height - distanceLegendCanvas.height - 20);
        // finalContext.drawImage(compassCanvas, finalCanvas.width - compassCanvas.width - 20, 20);

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
          viewer.entities.remove(entity);  // 移除经纬度线
        });
        this.latLonEntities = [];

        this.showTypes = 2
        this.imgName = name;
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

        // 监听渲染循环是否完成
        const checkEntitiesRendered = () => {
          const isRendered = this.latLonEntities.filter(entity => entity.show).length === entityCount;
          if (isRendered) {
            // 等待 Cesium 完成渲染
            const removePostRender = scene.postRender.addEventListener(() => {
              removePostRender(); // 确保只监听一次
              resolve();          // 确保渲染完成后再 resolve
            });
          } else {
            setTimeout(checkEntitiesRendered, 100); // 每100ms检查一次
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
  }
}
</script>

<style scoped lang="less">
.situation_cesiumContainer {
  height: calc(100vh - 50px) !important;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
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
  z-index: 1000;
}

::v-deep .el-divider__text.is-left {
  background-color: #2d3d51;
  color: #fff;
  font-size: 20px;
}

h4, p {
  color: #fff;
}

p {
  font-size: 14px;
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

.PersonalCasualty {
  position: absolute;
  z-index: 20;
  background-color: #2b323a;
  width: 17%;
  height: 50%;
  top: 7.5%;
  right: 22%;
}

.preview-container {
  position: absolute;
  top: 50%;
  left: 40%;
  width: 55%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
}

.preview-image {
  max-width: 100%;
  height: auto;
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
</style>
