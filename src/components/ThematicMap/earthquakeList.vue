<template>
  <div class="eqTable" v-show="isLeftShow">
    <div class="eqListContent" v-if="currentTab === '震害事件'">
      <div style="display: flex">
        <!-- 搜索框 -->
        <el-input v-model="title" placeholder="请输入地震名称" class="query" @input="filterEq" clearable>
        </el-input>
      </div>
      <!-- 地震列表 -->
      <div class="eqList">
        <div v-for="eq in pagedEqData" :key="eq.eqid" class="eqCard" @click="locateEq(eq)">
          <!-- 圆圈震级 -->
          <div style="width: 55px">
            <div class="eqMagnitude"
                 :style="{ backgroundColor: eq.magnitude >= 4.5 && eq.magnitude < 6.0 ? '#f0aa2e' : 'red' }">
              {{ eq.magnitude }}
            </div>
          </div>

          <!--地震名称与简要信息-->
          <div class="eqText">
                        <span
                            class="eqTitle">
                          {{ timestampToTime(eq.occurrenceTime, 'date') }}{{ eq.earthquakeName }}
                        </span>
            <br/>
            <span style="color: #fff; font-size: 13px; display: inline-block; margin-top: 5px;">
                            发震时刻：{{ this.timestampToTime(eq.occurrenceTime, "fullDateTime") }}<br/>
                            参考位置：{{ eq.earthquakeName }}<br/>
                            震中经纬：{{ eq.longitude }}°E, {{ eq.latitude }}°N<br/>
                            震源深度：{{ eq.depth }}千米
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
    <div class="thisEq" v-if="currentTab !== '震害事件' && selectedTabData">
      <div class="eqInfo">
        <div style="height: 30px;display: flex;align-items: center">
          <div class="button return" @click="back()">返回</div>
        </div>
        <div style="height: 10px;background-color: #054576"></div>
        <el-divider content-position="left">
          <!--            <img src="../../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 15px; width: 15px;">-->
          地震信息
        </el-divider>
        <div style="padding: 1px 20px 10px 20px;color: white">
          <!-- 显示选项卡内容 -->
          <h4>地震名称：{{ selectedTabData.earthquakeName }}</h4>
          <p>发震时刻：{{ this.timestampToTime(selectedTabData.occurrenceTime, "fullDateTime")  }}</p>
          <p>震中经纬：{{ selectedTabData.longitude }}°E, {{ selectedTabData.latitude }}°N</p>
          <p>地震震级：{{ selectedTabData.magnitude }}级</p>
          <p>震源深度：{{ selectedTabData.depth }}千米</p>
          <p>参考位置：{{ selectedTabData.earthquakeName }}</p>
        </div>

        <div style="height: 10px;background-color: #054576"></div>

        <el-divider content-position="left"> 专题图</el-divider>

        <div :style="{height: ((thematicMapData.length+1)/2 * 80) + 'px' }">
          <div class="eqTheme">
            <div class="button themes history"
                 style="width: 120px;"
                 v-for="item in thematicMapData"
                 :key="item.theme"
                 @click="previewMap(item)"> {{ item.theme }}
            </div>
          </div>
        </div>

        <div style="height: 10px;background-color: #054576"></div>
        <el-divider content-position="left"> 灾情报告</el-divider>
        <div class="eqTheme">
          <div class="button themes history"
               v-for="(item,index) in reportData"
               style="width: 120px;font-size: 14px;"
               @click="handleDownloadReport(item.docxUrl)"
          >{{ item.theme }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DisasterDamageAssessmentImageData
  from "../../assets/images/ThematicMap/DisasterDamageAssessment/LuShan/DisasterDamageAssessmentImageData.json"
import TwoAndThreeDIntegrationImageData
  from "../../assets/images/ThematicMap/TwoAndThreeDIntegration/LuShan/TwoAndThreeDIntegrationImageData.json"
import {getAllEq, getAllEqList} from "../../api/system/eqlist.js";
import * as Cesium from "cesium";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import yaan from "@/assets/geoJson/yaan1.json";
import {handleOutputData} from "../../cesium/plot/eqThemes.js";
import {getEqList} from "@/api/system/damageassessment.js";

export default {
  name: "earthquakeList",
  props: [
    'thematicMapClass'
  ],
  data() {
    return {
      isLeftShow: true,
      isHistoryEqPointsShow: false,
      currentTab: '震害事件', // 默认选项卡设置为『震害事件』
      // 列表地震
      listEqPoints: [],

      // 行政区划
      RegionLabels: [],
      sichuanRegionLabels: [],
      title: "",
      thematicMapData: [],
      reportData: [],
      filteredEqData: [],
      pagedEqData: [],
      getEqData: [],
      selectedTabData: null,

      total: 0,
      pageSize: 10,
      currentPage: 1,
      selectedEqPoint: '',
    }
  },
  mounted() {
    this.getEq()
  },
  methods: {
    handlePanel(type) {
      console.log(this.selectedTabData, "this.selectedEqData")
      if (type == 'thematicMap') {

        handleOutputData(this.selectedTabData.eqid, this.selectedTabData.eqqueueId, this.selectedTabData.earthquakeFullName, type).then((res) => {
          console.log("res.themeData", res.themeData)
          this.thematicMapData = res.themeData
          this.$emit('outputDataimgs', res.themeData);
          if (this.selectedTabData.eqid == "be3a5ea4-8dfd-a0a2-2510-21845f17960b") {
            this.thematicMapData.push({
              theme: "坡面分析图",
              imgUrl: "/ThematicMap/TwoAndThreeDIntegration/LuShan/GradeAnalysis.jpg"
            })
          }
          this.thematicMapData.push({theme: "遥感影像图", imgUrl: ""})
          this.thematicMapData.push({theme: "三维模型图", imgUrl: ""})


          // console.log(res)
          // this.outputDataimgs.themeData = res.themeData;
          // console.log(this.outputDataimgs.themeData)
        });

      }
      if (type == 'report') {
        handleOutputData(this.selectedTabData.eqid, this.selectedTabData.eqqueueId, this.selectedTabData.earthquakeFullName, type).then((res) => {
          this.reportData = res.themeData
          console.log(this.reportData, "this.reportData")
          // this.outputDatareports = res.themeData;
          // console.log(this.outputDatareports.themeData)
          this.$emit('outputDatareports', res.themeData); // 发送eq数据到父组件
        });

      }
    },


    // 根据父组件传值来判断调用哪些专题图
    // fetch() {
    //   // if (this.thematicMapClass === 'DisasterDamageAssessment') {
    //   //   this.thematicMapData = DisasterDamageAssessmentImageData
    //   //   this.reportData = this.disasterDamageAssessmentReport
    //   // }
    //   // else {
    //   //   this.thematicMapData = TwoAndThreeDIntegrationImageData
    //   //   this.reportData = this.twoAndThreeDIntegrationReport
    //   // }
    // },
    handleDownloadReport(docxUrl) {
      const a = document.createElement('a');
      a.href = docxUrl;
      a.download = docxUrl.split('/').pop();
      a.click();
      document.body.removeChild(a);
    },

    // exportCesiumScene(item,index) {
    //     if(index === 2){
    //         this.$emit('generateReport', this.selectedTabData)
    //     }
    //   if (item.path) {
    //     const link = document.createElement('a');
    //     link.href = item.docxUrl;
    //     link.download = item.theme; // 指定下载的文件名
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //   }
    // },
    getAssetsFile() {
      this.imgshowURL = new URL(this.imgurlFromDate, import.meta.url).href
    },
    // 获取地震列表并渲染
    getEq() {
      let that = this
      getEqList().then(res => {
        console.log("返回的数据1", res.data)
        let resData = res.data.filter(item =>
            item.earthquakeName.includes("雅安") || Number(item.magnitude) >= 4
        )
        console.log("过滤后", resData)
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
        // console.log("data:", data)
      });
    },
    // 分页数据更新
    updatePagedEqData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      this.pagedEqData = this.filteredEqData.slice(start, end);
      // console.log("pagedEqData:", this.pagedEqData)

      // 清除之前的点并重新添加
      viewer.entities.removeAll();
      this.renderQueryEqPoints();
    },

    // 地图渲染查询地震点(根据页码、根据搜索框)
    renderQueryEqPoints() {
      // this.eqThemes.show.isshowOvalCircle = false

      this.listEqPoints.forEach(entity => window.viewer.entities.remove(entity));
      this.listEqPoints = [];

      this.pagedEqData.forEach(eq => {
        const entity = window.viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(Number(eq.longitude), Number(eq.latitude)),
          billboard: {
            image: eqMark,
            width: 20,
            height: 20,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
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
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: eq.eqid
        });
        yaan.features.forEach((feature) => {
          let center = feature.properties.center;

          if (center && center.length === 2) {
            let position = Cesium.Cartesian3.fromDegrees(center[0], center[1]);
            let regionlabel = viewer.entities.add(new Cesium.Entity({
              position: position,
              label: new Cesium.LabelGraphics({
                text: feature.properties.name,
                scale: 1,
                font: '18px Sans-serif',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                fillColor: Cesium.Color.fromCssColorString("#ffffff"),
                pixelOffset: new Cesium.Cartesian2(0, 0),
                eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
              })
            }));
            this.RegionLabels.push(regionlabel)
          }
        })
        this.listEqPoints.push(entity);
      });
    },


    locateEq(eq) {
      this.$emit('selectEq', eq);
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

    // 将选中的专题图信息传给父组件
    previewMap(item) {
      // console.log("111111111111")
      // console.log(item)
      this.$emit('imag-selected', item);
    },

    back() {
      this.currentTab = '震害事件';
      this.selectedTabData = null;
      //视角回雅安
      const position = Cesium.Cartesian3.fromDegrees(
          103.0,
          29.98,
          500000
      );
      viewer.camera.flyTo({destination: position,})

      // this.removeData()
    },

    toTab(eq) {
      this.currentTab = `${eq.earthquakeName} ${eq.magnitude}级地震`;
      if (this.currentTab !== '震害事件') {

        // 查找与选项卡名称匹配的地震数据
        this.selectedTabData = this.getEqData.find(
            eq => `${eq.earthquakeName} ${eq.magnitude}级地震` === this.currentTab
        );
        // 如果找到对应数据，调用定位函数
        if (this.selectedTabData) {
          this.selectEqPoint();
          this.$emit('selectEq', eq); // 发送eq数据到父组件

          this.handlePanel('thematicMap')
          this.handlePanel('report')
        }
      }
    },

    selectEqPoint() {
      if (this.selectedTabData) {

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
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            eyeOffset: new Cesium.Cartesian3(0, 0, -5000)
          },
          label: {
            text: this.timestampToTime(this.selectedTabData.occurrenceTime, 'date') +
                this.selectedTabData.earthquakeName +
                this.selectedTabData.magnitude + '级地震',
            font: '18px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            showBackground: true,
            show: true,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            eyeOffset: new Cesium.Cartesian3(0, 0, -10000)
          },
          id: this.selectedTabData.id
        });
      }
    },

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
    },
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
      } else if (format === "fullDateTime") {
        return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`;
      } else {
        // 返回完整的日期时间格式
        return `${year}-${month}-${day} ${hh}:${mm}:${ss}`;
      }
    },
  }
}
</script>

<style scoped>
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

.query {
  width: calc(100% - 40px);
  margin: 10px 10px 10px 30px;
}

.eqList {
  position: relative;
  height: calc(85vh - 90px);
  overflow-y: auto;
}


.eqCard {
  display: flex;
  height: 110px;
  border-bottom: #0d325f 2px solid;
  cursor: pointer;
}

.eqCard:hover {
  box-shadow: 0 0 15px #007fde, inset 0 0 25px #06b7ff;
  transition: all 0.3s;
}

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

.thisEq {
  height: 100%;
  overflow: auto;
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #fff;
  margin-top: 2px;
  width: 60px;
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
  height: 170px;
  padding-left: 40px;
  margin: 0 auto;
  clear: both;
}

.themes {
  float: left;
  position: relative;
  margin: 5px 15px 15px 0;
  font-size: 15px;
  height: 35%;
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

::v-deep .el-divider__text.is-left {
  box-shadow: 0 0 10px #007fde, inset 0 0 15px #06b7ff;
  background-color: #2d3d51;
  color: #fff;
  font-size: 20px;
}

::-webkit-scrollbar-thumb {
  background-color: #2980b9;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #3498db;
}

::-webkit-scrollbar-track {
  background-color: #2d3d51;
}

</style>
