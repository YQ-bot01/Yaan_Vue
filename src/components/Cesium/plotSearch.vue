<template>
  <div class="eqTable" v-show="isLeftShow">
    <div class="eqListContent">
      <div class="pop">
        <div class="pop_header">
          <span class="pop_title">标绘查询</span>
        </div>
      </div>
      <div style="display: flex">
        <!-- 搜索框 -->
        <el-input v-model="title" placeholder="请输入搜索内容" class="query" @input="filterEq" clearable>
        </el-input>
      </div>
      <!-- 地震列表 -->
      <div class="eqList">
        <div v-if="noDataMessage" class="no-data-message">
          {{ noDataMessage }}
        </div>
        <div v-for="plot in pagedEqData" :key="plot.plotInfo.eqid" class="eqCard" @click="locateEq(plot)">
          <!-- 圆圈震级 -->
          <div style="width: 55px">
            <div class="eqMagnitude">
              <img width="30px" height="30px" :src="'http://localhost:8080'+'/uploads/PlotsPic/' +plot.plotInfo.icon+ '.png?t=' + new Date().getTime()" alt="暂无符号">
            </div>
          </div>

          <!--地震名称与简要信息-->
          <div class="eqText">
                        <span
                            class="eqTitle">
                        {{ plot.plotInfo.plotType }}
                        </span>
            <br/>
            <!--             伤亡和出队信息-->
            <div class="disaster-info">
              <!-- 标绘类型 -->
              <div>
                <span class="info-label">所属地点 :{{ plot.plotInfo.belongCity }}{{ plot.plotInfo.belongCounty }} {{ plot.plotInfo.belongTown }}</span>
              </div>

              <!-- 伤亡人数 -->
              <div v-if="plot.plotInfo.plotType === '轻伤人员' ||plot.plotInfo.plotType === '重伤人员'||plot.plotInfo.plotType === '危重伤人员'||plot.plotInfo.plotType === '死亡人员' ">
                <span class="info-label large-text">伤亡人员：</span><span class="highlight highlight-danger large-text">{{ plot.plotTypeInfo.newCount }} 人</span>
              </div>

              <!-- 出队信息 -->
              <div v-if="plot.plotInfo.plotType === '已出发队伍'|| plot.plotInfo.plotType === '正在参与队伍'||plot.plotInfo.plotType === '待命队伍' &&((plot.plotTypeInfo && plot.plotTypeInfo.personnelCount)||(plot.plotTypeInfo && plot.plotTypeInfo.teamName))"  style="display: flex; align-items: center;">
                <span class="info-label"  v-if="plot.plotTypeInfo && plot.plotTypeInfo.teamName">队伍名称:</span>
                <div class="team-name-wrapper">
                  <span class="highlight highlight-info team-name" v-if="plot.plotTypeInfo && plot.plotTypeInfo.teamName">{{ plot.plotTypeInfo.teamName }}</span>
                </div>
                <span class="info-label large-text"  v-if="plot.plotTypeInfo && plot.plotTypeInfo.personnelCount">出队人数：</span>
                <span class="highlight highlight-success large-text" v-if="plot.plotTypeInfo && plot.plotTypeInfo.personnelCount">{{ plot.plotTypeInfo.personnelCount }} 人</span>
              </div>
            </div>

            <!-- 地点、道路、POI 和经纬度 -->
            <div class="location-info">
              <div style="display: flex; align-items: center;">
                <strong>具体地点：</strong>
                <div class="local-place-wrapper">
                  <span class="info-label small-text local-place">{{ plot.plotInfo.locationAddress }} （{{ plot.plotInfo.locationAddressPosition }}方向 {{ plot.plotInfo.locationAddressDistance }} 米）</span>
                </div>
              </div>
              <span class="info-label small-text"><strong>附近道路：</strong>{{ plot.plotInfo.locationRoad }} （距离 {{ plot.plotInfo.locationRoadDistance }} 米）</span>
              <br>
              <span class="info-label small-text"><strong>标绘经纬：</strong>{{ parseFloat(plot.plotInfo.longitude).toFixed(2) }}°E, {{ parseFloat(plot.plotInfo.latitude).toFixed(2) }}°N</span>
              <br>
              <span class="info-label small-text"><strong>时间范围：</strong>{{this.timestampToTimeChina(plot.plotInfo.startTime)}}-{{this.timestampToTimeChina(plot.plotInfo.endTime)}}</span>
              <br>
            </div>
          </div>

          <!-- 详情按钮 -->
          <!--          <div class="eqTapToInfo" @click="toTab(eq)">详情</div>-->
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
  </div>
  <div class="fold" :style="{ width: isFoldUnfolding ? '30px' : '10px' }" @mouseenter="isFoldUnfolding = true"
       @mouseleave="isFoldUnfolding = false" v-show="isFoldShow" @click="isLeftShow = false,isFoldShow = false">
    <img src="../../assets/icons/TimeLine/收起展开箭头右.png" v-if="isFoldUnfolding"
         style="height: 60%;width: 60%;">
  </div>
  <div class="button unfold" v-show="isLeftShow === false" @click="isLeftShow=true,isFoldShow=true">
    <img src="../../assets/icons/TimeLine/收起展开箭头左.png" style="height: 60%;width: 60%;cursor: pointer">
  </div>
</template>

<script>
import {getExcelPlotInfo, getPlot, getPlotIcon} from '@/api/system/plot'
import * as Cesium from "cesium";
import eqMark from '@/assets/images/DamageAssessment/eqMark.png';
import yaan from "@/assets/geoJson/yaan1.json";
import axios from "axios";
import {tianDitulocalApi} from "@/utils/server.js";
import timeTransfer from "@/cesium/tool/timeTransfer.js";

export default {
  name: "plotSearch",
  props: {
    eqid: {
      type: String,
      default: null,
    },
    plotArray: {
      type: Array, // 指定类型为数组
      default: () => [], // 使用空数组作为默认值
    },
  },
  watch: {
    eqid: {
      immediate: true, // 如果 `eqid` 在初始时就有值，立即调用
      handler(newEqid, oldEqid) {
        if (newEqid !== oldEqid && this.eqid !== null) {
          // console.log(`eqid 发生变化：${oldEqid} => ${newEqid}`);
          this.getPlot({ eqid: newEqid }); // 传递 eqid 对象
        }
      },
    },
    plotArray: {
      handler(newData) {
        console.log(newData,"newData plotArray")
        this.getPlot({ plotArray: newData });
      },
      deep: true, // 深度监听
    },
  },
  data() {
    return {
      plots:[],
      isFoldShow: true,
      isFoldUnfolding: false,
      isLeftShow: true,

      noDataMessage: null,
      // 列表地震
      listEqPoints: [],
      // 行政区划
      RegionLabels: [],
      title: "",
      // selectPlotData: [],
      filteredEqData: [], //所有应该显示的点
      pagedEqData: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,

    }
  },
  mounted() {
    this.getPlot(this.eqid)
  },
  methods : {
    async getPlot(params) {
      console.log("params",params)
      try {
        // 判断是通过 eqid 还是 plotArray 调用
        if (params.eqid) {
          // console.log("通过 eqid 获取数据", params.eqid);
          this.plots = [];
          this.filteredEqData = [];
          // 获取 plot 数据
          let res = await getPlot({ eqid: params.eqid });
          this.plots=res
          this.filteredEqData=this.plots
          console.log("通过 eqid 获取数据",res)
          if (!res || res.length === 0) {
            this.pagedEqData = [];
            this.filteredEqData = [];
            // this.selectPlotData = [];
            this.noDataMessage = "该地震暂无标绘数据";
            return;
          }
          this.noDataMessage = null;
          await this.updatePagedEqData()
        }

        if (params.plotArray) {
          this.plots = [];
          this.filteredEqData = [];
          console.log("通过 plotArray 获取数据", params.plotArray);
          let plotArray = Array.isArray(params.plotArray)
              ? params.plotArray
              : [params.plotArray]; // 如果不是数组，则转为数组
          this.plots=plotArray
          // this.plots=[...this.plots,...plotArray]
          this.filteredEqData=this.plots
          console.log(this.plots,"params.plotArray")
          this.noDataMessage = null;
          await this.updatePagedEqData()
        }
      } catch (error) {
        console.error("获取地震列表或处理失败:", error);
      }
    },
    async updatePagedEqData(){
      const start = (this.currentPage - 1) * this.pageSize;
      const end = this.currentPage * this.pageSize;
      let pagedEqDatatmp = this.filteredEqData.slice(start, end);
      const batchPlotIds = pagedEqDatatmp.map((plot) => plot.plotId);
      const batchPlotTypes = pagedEqDatatmp.map((plot) => plot.plotType);
      const batchData = await getExcelPlotInfo(batchPlotIds, batchPlotTypes);
      console.log("updatedRes processDataEqid",batchData)

      let pagedEqDatatmpArr=[]
      batchData.forEach(item=>{
        console.log(item.plotInfo.plotType,"item.plotInfo.plotTypem")
        if(item.plotInfo.plotType==="直线箭头"||item.plotInfo.plotType==="攻击箭头"||item.plotInfo.plotType==="钳击箭头"){
          item.plotInfo.icon=item.plotInfo.plotType
        }
        pagedEqDatatmpArr.push(item)
      })
      this.pagedEqData=pagedEqDatatmpArr
    },


    locateEq(plot) {
      // 提取标绘的经纬度
      const longitude = parseFloat(plot.plotInfo.longitude);
      const latitude = parseFloat(plot.plotInfo.latitude);
      // 飞行动画持续时间（秒）
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            longitude, latitude,
            5000),
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        },
        duration: 3 // 飞行动画持续时间（秒）
      });

    },

    // 模糊匹配地震时间、位置和震级
    filterEq() {
      if (this.title) {
        const keyword = this.title.toLowerCase(); // 转为小写以支持不区分大小写的匹配
        this.filteredEqData = this.plots.filter((eq) => {
          console.log("eq this.plots.filter",eq)
          // 拼接 locationInfo 的相关字段
          // const locationInfoStr = `${eq.plotInfo?.belongProvince || ''} ${eq.plotInfo?.belongCity || ''} ${eq.plotInfo?.belongCounty || ''} ${eq.plotInfo?.belongTown || ''} ${eq.plotInfo?.locationAddress || ''} ${eq.plotInfo?.loocationPoi || ''} ${eq.plotInfo?.locationRoad|| ''}`.toLowerCase();
          const locationInfoStr = `${eq.belongProvince || ''} ${eq.belongCity || ''} ${eq.belongCounty || ''} ${eq.belongTown || ''} ${eq.locationAddress || ''} ${eq.loocationPoi || ''} ${eq.locationRoad|| ''}`.toLowerCase();

          // 拼接 plotInfo 的相关字段
          const plotInfoStr = `${eq.plotType || ''} ${eq.damageForm || ''} ${eq.usageType || ''}`.toLowerCase();

          // 动态拼接 plotTypeInfo 中的所有字段
          // const plotTypeInfoStr = Object.entries(eq.plotTypeInfo || {})
          //     .map(([key, value]) => `${key}: ${value || ''}`) // 转成键值对字符串
          //     .join(' ')
          //     .toLowerCase();

          // 其他需要匹配的字段
          const magnitudeStr = `${eq.magnitude || ''}`.toLowerCase();
          const drawTypeStr = `${eq.drawtype || ''}`.toLowerCase();

          // 模糊匹配
          return (
              locationInfoStr.includes(keyword) ||
              plotInfoStr.includes(keyword) ||
              // plotTypeInfoStr.includes(keyword) ||
              magnitudeStr.includes(keyword) ||
              drawTypeStr.includes(keyword)
          );
        });
        console.log(keyword,"keyword")
      }
      else {
        this.filteredEqData = this.plots; // 如果没有输入内容，返回全部数据
      }

      this.currentPage = 1; // 重置分页
      console.log("this.filteredEqData filterEq",this.filteredEqData)
      this.updatePagedEqData(); // 更新分页数据
    },

    // 分页改变事件
    handleCurrentChange(page) {
      this.currentPage = page;
      this.updatePagedEqData();
    },
    // 时间戳转换
    timestampToTimeChina(timestamp){
      return timeTransfer.timestampToTimeChina(timestamp)
    },
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
  }
}
</script>

<style scoped>
.eqTable {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 425px;
  height: calc(100% - 63px);
  z-index: 100;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

.query {
  width: calc(100% - 20px);
  margin: 10px;
}

.eqList {
  position: relative;
  height: calc(85vh - 100px);
  overflow-y: auto;
}

.eqCard {
  display: flex;
  height: 155px;
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
}

.eqTitle {
  display: inline-block;
  max-width: 260px;
  position: relative;
  transform: translateX(0);
  will-change: transform;
  color: #409eff;
  font-size: 17px;
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
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
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
  height: 30%;
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

::-webkit-scrollbar-thumb {
  background-color: #2980b9;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #3498db;
}

::-webkit-scrollbar-track {
  background-color: #2d3d51;
}

/*开关*/
.fold {
  position: absolute;
  top: 63px;
  right: 423px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 36px;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
  -webkit-border-top-left-radius: 10px;
  -webkit-border-bottom-left-radius: 10px;
  cursor: pointer;
  z-index: 4;
  transition: width 0.3s ease; /* 宽度过渡动画 */
}

.unfold {
  position: absolute;
  top: 63px;
  right: 0;
  width: 30px;
  height: 40px;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%,rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
  cursor: pointer;
  z-index: 2;
  margin: 0;
}

/* 统一行内展示 */

.disaster-info span {
  display: inline-block;
  font-size: 14px;
  margin-right: 10px;
  line-height: 1.6;
}

.disaster-info{
  margin-top: 6px;
}

.location-info span {
  display: inline-block;
  font-size: 12px;
  margin-right: 15px; /* 每段内容间距 */
  line-height: 1.6;
}

/* 伤亡和出队样式 */
.large-text {
  font-size: 16px; /* 伤亡人员和出队人数字体更大 */
  font-weight: bold;
}
.team-name {
  transform: translateX(0);
  will-change: transform;
  display: inline-block;
  position: relative;
}
/* 队伍名称换行处理 */
.team-name:hover{
  transform: translateX(-70%);
  transition: transform 5.0s ease;
}
.team-name{
  transition: none;
}

.info-label {
  color: #ccc;
  font-weight: bold;
  margin-right: 5px;
}

/* 为 team-name 添加限制和动画区域 */
.team-name-wrapper {
  display: inline-block; /* 不换行 */
  position: relative;
  max-width: 200px; /* 设置宽度限制 */
  overflow: hidden; /* 超出内容隐藏 */
  white-space: nowrap; /* 防止内容换行 */
  margin-right: 10px; /* 间距调整 */
}
.highlight {
  font-weight: bold;
}

.highlight-danger {
  color: #e74c3c; /* 红色，突出危险 */
}

.highlight-success {
  color: #2ecc71; /* 绿色，突出安全或出队人数 */
}

.highlight-info {
  color: #3498db; /* 蓝色，突出队伍名称 */
}

/* 地点、道路、POI 和经纬度部分 */
.location-info span strong {
  color: #ffd700; /* 金黄色，强调重要信息 */
}
.location-info strong {
  display: inline-block;
  font-size: 12px;
  color: #ffd700; /* 金黄色，强调重要信息 */
}
/*地点名称*/
.local-place {
  transform: translateX(0);
  will-change: transform;
  display: inline-block;
  position: relative;
}
/* 地点名称 */
.local-place:hover{
  transform: translateX(-50%);
  transition: transform 5.0s ease;
}

.local-place{
  transition: none;
}

/* 为 local-place 添加限制和动画区域 */
.local-place-wrapper {
  display: inline-block; /* 不换行 */
  position: relative;
  max-width: 200px; /* 设置宽度限制 */
  overflow: hidden; /* 超出内容隐藏 */
  white-space: nowrap; /* 防止内容换行 */
  margin-right: 10px; /* 间距调整 */
}

.no-data-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 18px;
  text-align: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.6); /* 半透明背景 */
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 101; /* 确保提示信息显示在上层 */
}

.pop {
  width: 100%;
  z-index: 20;
}

.pop_header {
  top: -10%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.pop_title {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  top: 15%;
  position: relative;
  left: 7%;
}
</style>
