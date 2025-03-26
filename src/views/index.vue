<template>
  <div class="content-body">
    <div class="header">
      <div class="header-center">
        <span>{{useTitleStore().pageTitle}}</span>
      </div>
      <div class="header-time">
        <span id="time">{{ nowTime }}</span>
      </div>
    </div>

    <div class="content">
      <div class="content-con">


        <div class="center-body">
          <e-map :eq-data="MapData"/>
        </div>

        <div class="left">
          <div class="left-body">
            <div class="left-top public-bg" ref="leftTop">
              <!--              <div class="public-title">最新地震</div>-->
              <img src="@/assets/latestEarthquake.png" alt="最新地震" style="width: 127%; height: auto;">
              <new-info :last-eq="lastEqData"/>
            </div>

            <div class="left-con public-bg" ref="leftCon">
              <!--              <div class="public-title">最新地震受灾人员统计</div>-->
              <img src="@/assets/disasterStats.png" alt="最新地震受灾人员统计" style="width: 125%; height: auto;">
              <chart3 :last-eq="lastEqData"/>
            </div>

            <div class="left-bottom public-bg" ref="leftBottom">
              <chart2 :last-eq="lastEqData"/>
            </div>
          </div>
        </div>


        <div class="right">
          <div class="right-body">
            <div class="right-top public-bg" ref="rightTop">
              <div style="position: relative; width: 100%; height: auto;">
                <!-- 图片 -->
                <img
                  src="@/assets/earthquakeList.png"
                  alt="地震列表"
                  style="width: 90%; height: auto; display: block;"
                >

                <!-- 输入框和按钮 -->
                <div
                  style="position: absolute; top: 5px; left: 120px; display: flex; align-items: center; z-index: 1;"
                >
                  <el-input
                    size="small"
                    style="width: 5vw; font-size: 16px;margin-right: 5px;margin-left: 7px"
                    v-model="requestParams"
                    @keyup.enter="query()"
                  ></el-input>
                  <el-button
                    size="small"
                    style="font-size: 14px;"
                    @click="query()"
                  >查询</el-button>
                  <el-button
                    size="small"
                    style="font-size: 14px;"
                    @click="openQueryFrom()"
                  >筛选</el-button>

                  <!-- 正式和测试按钮，固定不切换 -->
                  <el-button
                    size="small"
                    :type="activeMode === 'Z' ? 'danger' : 'default'"
                    style="font-size: 14px;color:greenyellow;"
                    @click="activeMode = 'Z'"
                  >
                    真实
                  </el-button>
                  <el-button
                    size="small"
                    :type="activeMode === 'Y' || activeMode === 'T' ? 'primary' : 'default'"
                    style="font-size: 14px;color:white;"
                    @click="activeMode = 'Y'"
                  >
                    测试
                  </el-button>
                </div>
              </div>
              <eq-table :eq-data="CeShiTableData"/>
            </div>

            <div class="right-bottom public-bg" ref="rightBottom">
              <img src="@/assets/historyEarthquake.png" alt="历史地震" style="width: 80%; height: auto;">
              <!--              <div class="public-title">历史地震统计(次)</div>-->
              <chart1 :eq-data="EqAll"/>
            </div>
          </div>
        </div>

      </div>
    </div>

    <el-dialog v-model="queryFormVisible" title="筛选" width="28vw" style="top:20vh">
      <el-form :inline="true" :model="formValue">
        <el-form-item label="地震位置">
          <el-input v-model="formValue.earthquakeName" style="width: 23vw;" placeholder="地震位置" clearable/>
        </el-form-item>
        <el-form-item label="发震时间">
          <el-date-picker
            v-model="formValue.occurrenceTime"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :shortcuts="shortcuts"
            style="width: 23vw;"
            value-format="x"
          />
        </el-form-item>
        <el-form-item label="地震震级">
          <el-input v-model="formValue.startMagnitude" style="width: 5vw;"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endMagnitude" style="width: 5vw;"/>
          <span style="margin: 0 10px">(级)</span>
        </el-form-item>
        <el-form-item label="地震深度">
          <el-input v-model="formValue.startDepth" style="width: 5vw"/>
          <span style="margin: 0 10px"> 至 </span>
          <el-input v-model="formValue.endDepth" style="width: 5vw"/>
          <span style="margin: 0 10px">(千米)</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { BorderBox7 as DvBorderBox7, Decoration5 as DvDecoration5 } from '@kjgl77/datav-vue3';
import { onMounted, ref, reactive, nextTick, watch } from 'vue';
import EMap from '@/components/Home/emap.vue';
import EqTable from '@/components/Home/eqtable.vue';
import NewInfo from '@/components/Home/newInfo.vue';
import Chart1 from '@/components/Home/chart1.vue';
import Chart2 from '@/components/Home/chart2.vue';
import Chart3 from '@/components/Home/chart3.vue';
import {fromEq, fromEqList, getAllEq, queryEq, queryEqList} from '@/api/system/eqlist';
import {getEqList} from "@/api/system/damageassessment.js";
import {useTitleStore} from "../store/index.js";

const nowTime = ref(null);
const tableData = ref([]);
const EqAll = ref([]);
const lastValidEqData = ref(null);

const getEq = () => {
  getEqList().then((res) => {
    console.log("地震数据", res.data)
    EqAll.value = res.data;
    console.log("EqAll.value", EqAll.value)
    tableData.value = res.data;

    lastEqData.value = tableData.value[0];

  });
};

let lastEqData = ref(null);

const requestParams = ref('');
// 当前模式，初始为正式
const activeMode = ref('Z');
const CeShiTableData = computed(() => {
  if (activeMode.value === 'Z') {
    return tableData.value.filter(item => item.eqType === 'Z');
  } else if (activeMode.value === 'Y' || activeMode.value === 'T') {
    return tableData.value.filter(item => item.eqType === 'Y' || item.eqType === 'T');
  }
  return tableData.value;
});
const MapData = computed(() => {
  let filteredData = tableData.value;

  if (activeMode.value === 'Z') {
    filteredData = filteredData.filter(item => item.eqType === 'Z');
  } else if (activeMode.value === 'Y' || activeMode.value === 'T') {
    filteredData = filteredData.filter(item => item.eqType === 'Y' || item.eqType === 'T');
  }
  // 过滤出年份大于等于2000的地震数据
  filteredData = filteredData.filter(item => item.occurrenceTime && new Date(item.occurrenceTime).getFullYear() >= 2000&&item.magnitude >= 3);
  console.log("filterDate2000",filteredData)
  return filteredData;
});


// 监听 MapData 变化，更新 lastEqData
watch(MapData, (newVal) => {
  if (newVal.length > 0&&newVal[0].magnitude>=3) {
    lastValidEqData.value = newVal[0]; // 存储上一次有值的第一条数据
    lastEqData.value = newVal[0];
  } else {
    lastEqData.value = lastValidEqData.value; // 为空时回退到存储值
  }
}, { deep: true, immediate: true });


// 监听 CeShiTableData 变化，更新 lastEqData
watch(CeShiTableData, (newVal) => {
  // console.log(CeShiTableData,"CeShiTableData")
  if (newVal.length > 0&&newVal[0].magnitude>=3) {
    lastValidEqData.value = newVal[0]; // 存储上一次有值的第一条数据
    lastEqData.value = newVal[0];
  } else {
    lastEqData.value = lastValidEqData.value; // 为空时回退到存储值
  }
}, { deep: true, immediate: true });

const queryFormVisible = ref(false);

const borderBoxStyles1 = ref({});
const borderBoxStyles2 = ref({});
const borderBoxStyles3 = ref({});
const borderBoxStyles4 = ref({});
const borderBoxStyles5 = ref({});

// ResizeObserver
const resizeObserver = new ResizeObserver(() => {
  // Adjust styles dynamically instead of using key
  updateStyles();
});

// Element refs
const leftTop = ref(null);
const leftCon = ref(null);
const leftBottom = ref(null);
const rightTop = ref(null);
const rightBottom = ref(null);

const shortcuts = [
  {
    text: '近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: '近一个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: '近三个月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
  {
    text: '近一年',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 360);
      return [start, end];
    },
  },
];

const formValue = reactive({
  earthquakeName: '',
  occurrenceTime: '',
  startMagnitude: '',
  endMagnitude: '',
  startDepth: '',
  endDepth: '',
  startDate: '',
  endDate: '',
});

//筛选
const onSubmit = () => {
  if (formValue.occurrenceTime !== '') {
    const [startTime, endTime] = formValue.occurrenceTime;
    const startDate = new Date(startTime).toISOString();
    const endDate = new Date(endTime).toISOString();

    formValue.startDate = startDate;
    formValue.endDate = endDate;
  }

  // 构建查询对象
  const queryParams = {
    earthquakeName: formValue.earthquakeName || undefined,
    startTime: formValue.startDate || undefined,
    endTime: formValue.endDate || undefined,
    startMagnitude: formValue.startMagnitude || undefined,
    endMagnitude: formValue.endMagnitude || undefined,
    startDepth: formValue.startDepth || undefined,
    endDepth: formValue.endDepth || undefined,
  };


  console.log("5555555555555555555555555555", queryParams)

  fromEqList(queryParams).then((res) => {
    console.log(tableData,"tableData")
    tableData.value = res;
    lastEqData.value = CeShiTableData.value.length > 0 ? CeShiTableData.value[0] : null;
  });
  queryFormVisible.value = false;
};

const openQueryFrom = () => {
  queryFormVisible.value = true;
};
//查询
const query = () => {
  if (requestParams.value === '') {
    tableData.value = EqAll.value;
    lastEqData.value = CeShiTableData.value.length > 0 ? CeShiTableData.value[0] : null;
    return;
  }
  // queryEq({ queryValue: requestParams.value }).then((res) => {
  queryEqList({queryValue: requestParams.value}).then((res) => {
    console.log(requestParams.value)
    tableData.value = res;
    lastEqData.value = CeShiTableData.value.length > 0 ? CeShiTableData.value[0] : null;
  });
};

const updateTime = () => {
  nowTime.value = now_time();
};

const now_time = () => {
  let myDate = new Date();
  let myYear = myDate.getFullYear(); // 获取完整的年份(4位,1970-????)
  let myMonth = myDate.getMonth() + 1; // 获取当前月份(0-11,0代表1月)
  let myToday = myDate.getDate(); // 获取当前日(1-31)
  let myDay = myDate.getDay(); // 获取当前星期X(0-6,0代表星期天)
  let myHour = myDate.getHours(); // 获取当前小时数(0-23)
  let myMinute = myDate.getMinutes(); // 获取当前分钟数(0-59)
  let mySecond = myDate.getSeconds(); // 获取当前秒数(0-59)
  let week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return (
    myYear +
    '年' +
    fillZero(myMonth) +
    '月' +
    fillZero(myToday) +
    '日' +
    fillZero(myHour) +
    ':' +
    fillZero(myMinute) +
    ':' +
    fillZero(mySecond) +
    week[myDay]
  );
};

const fillZero = (str) => {
  return str < 10 ? '0' + str : str;
};

const updateStyles = () => {
  if (leftTop.value) {
    borderBoxStyles1.value = {
      width: leftTop.value.offsetWidth + 'px',
      height: leftTop.value.offsetHeight + 'px',
    };
  }

  if (leftCon.value) {
    borderBoxStyles2.value = {
      width: leftCon.value.offsetWidth + 'px',
      height: leftCon.value.offsetHeight + 'px',
    };
  }

  if (leftBottom.value) {
    borderBoxStyles3.value = {
      width: leftBottom.value.offsetWidth + 'px',
      height: leftBottom.value.offsetHeight + 'px',
    };
  }

  if (rightTop.value) {
    borderBoxStyles4.value = {
      width: rightTop.value.offsetWidth + 'px',
      height: rightTop.value.offsetHeight + 'px',
    };
  }

  if (rightBottom.value) {
    borderBoxStyles5.value = {
      width: rightBottom.value.offsetWidth + 'px',
      height: rightBottom.value.offsetHeight + 'px',
    };
  }
};


onMounted(() => {
  nextTick(() => {
    if (leftTop.value) resizeObserver.observe(leftTop.value);
    if (leftCon.value) resizeObserver.observe(leftCon.value);
    if (leftBottom.value) resizeObserver.observe(leftBottom.value);
    if (rightTop.value) resizeObserver.observe(rightTop.value);
    if (rightBottom.value) resizeObserver.observe(rightBottom.value);
  });

  setInterval(updateTime, 500);
  getEq();
});

</script>


<style scoped>
.public-bg {
  /*background: rgba(12, 26, 63, 0.3);*/
}

.public-title {
  width: calc(100% - 30px);
  height: 30px;
  position: relative;
  top: 0;
  left: 5px;
  color: white;
  padding-left: 16px;
  line-height: 30px;
  font-size: 15px;
}

.public-title:before {
  width: 0px;
  height: 20px;
  top: 5px;
  position: absolute;
  content: "";
  background: #2997e4;
  border-radius: 2px;
  left: 4px;
}

.content-body {
  width: 100%;
  height: 100%;
  background-image: url("@/assets/bg3.png");
  background-size: 100% 100%;
  position: absolute;
}

.header {
  margin-top: 2vh;
  position: absolute;
  display: flex;
  justify-content: center; /* 标题居中对齐 */
  align-items: center;
  height: 22px;
  margin-bottom: 2vh;
  width: 100%; /* 使用 100% 来适应父容器宽度 */
  z-index: 10;
}

.header-center {
  color: #69d1e1; /* 设置字体颜色为 #69d1e1 */
  font-weight: bold;
  font-size: 22px;
  letter-spacing: 2px;
  text-align: center; /* 确保文本在容器内居中 */
  width: 100%; /* 确保 header-center 占满父容器 */
  margin-left: -1.7%;
}

.header-time {
  top: 13px;
  position: absolute;
  color: #73FFFA; /* 使用给定的颜色 */
  right: 7.5vw;
  font-size: 12px; /* 字体稍微变小，提升精致感 */
  font-weight: 300; /* 使用较细的字体粗细 */
  font-family: 'Source Han Sans', '思源黑体', sans-serif; /* 使用思源黑体字体 */
  letter-spacing: 0.5px; /* 增加字母间距，让字体更加通透 */
  line-height: 1.4; /* 调整行高，确保文字看起来不拥挤 */
}

.content {
  left: 7px;
  padding: 3px 16px;
  position: absolute;
  margin-top: 7vh;
  width: 100%;
  height: calc(100% - 62px);
}

.content .content-con {
  height: 100%;
  padding-bottom: 26px;
}

.left {
  position: absolute;
  width: 22%;
  height: 97.8%;
  left: 0.5%;
  float: left;
  /*background-image: url("@/assets/home/黑色遮罩左.png");*/
  background: rgb(2, 0, 36);
  background: linear-gradient(90deg, rgb(4 33 65 / 56%) 32%, rgb(64 106 171 / 6%) 89%);
}

.left-body {
  width: 98%;
  height: 100%;
  margin: 0 0.3%;

}

.left-body .left-top {
  width: 100%;
  height: 30%;
  overflow: hidden;
}

.left-body .left-top .top-body {
  width: 100%;
  height: calc(100% - 25px);
}

.left-body .left-top .top-body .top-left {
  float: left;
  width: 50%;
  height: 100%;
}

.top-left-title {
  width: 100%;
  height: 100%;
  padding: 30px;
  box-sizing: border-box;
}

.top-left-title h6 {
  color: #bad0e2;
}

.top-left-title span {
  margin-top: 30px;
  display: inline-block;
  color: #2aa4f1;
}

.top-left-title span b {
  font-size: 30px;
  letter-spacing: 5px;
}

.top-left-title img {
  width: 80%;
}

.left-body .left-top .top-body .top-right {
  float: left;
  width: 50%;
  height: 100%;
}

.left-body .left-con {
  width: 100%;
  height: 30%;
  margin-top: 1.6%;
  overflow: hidden;
}

.left-body .left-bottom {
  width: 100%;
  height: 44%;
  margin-top: 1.6%;
}

.center-body {
  position: absolute;
  width: 100%;
  height: 100%;
  /*margin: 0 0.3%;*/
  float: left;
}

.center-body .map {
  width: 97%;
  height: 96%;
}

.right {
  position: absolute;
  width: 32.3%;
  left: 66%;
  height: 97.8%;
  float: right;
  margin: 0 0.3%;
  /*background-image: url("@/assets/home/黑色遮罩右.png");*/
  background: rgb(0, 195, 255);
  background: linear-gradient(90deg, rgb(22 105 179 / 9%) 25%, rgb(10 33 75 / 76%) 88%);
}


.right-body {
  width: 98%;
  height: 100%;
  margin: 0 0.3%;
}

.right-body .right-top {
  width: 100%;
  height: 54%;
}

.title-nav .top5-ul {
  width: calc(100% - 20px);
  height: calc(100% - 30px);
  padding: 10px;
}

.title-nav .top5-ul ul {
  width: 100%;
  height: 100%;
}

.title-nav .top5-ul ul, li {
  list-style: none;
}

.title-nav .top5-ul ul > li {
  width: 100%;
  height: 20%;
  color: #ffffff;
  line-height: 68px;
  justify-content: center;
}

.title-nav .top5-ul ul li span {
  margin-left: 3%;
  font-size: 14px;
}

.title-nav .top5-ul ul li span:nth-child(1) {
  color: #EB6841;
  font-style: oblique;
  display: inline-block;
  text-align: center;
  font-size: 20px;
}

.title-nav .top5-ul ul li span:nth-child(2) {
  width: 10%;
  display: inline-block;
  text-align: center;
  height: 30px;
  line-height: 30px;
  vertical-align: center;
  border-radius: 5px;
  color: #ffffff;
}

.title-nav .top5-ul ul li:nth-child(1) span:nth-child(2), .title-nav .top5-ul ul li:nth-child(2) span:nth-child(2), .title-nav .top5-ul ul li:nth-child(3) span:nth-child(2) {
  background: #d89346;
}

.title-nav .top5-ul ul li:nth-child(4) span:nth-child(2), .title-nav .top5-ul ul li:nth-child(5) span:nth-child(2) {
  background: #1db5ea;
}

.title-nav .top5-ul ul li span:nth-child(3) {
  /*width: 15%;*/
  display: inline-block;
  text-align: center;
}

.title-nav .top5-ul ul li span:nth-child(4) {
  /*width: 15%;*/
  display: inline-block;
  text-align: center;
}

.title-nav .top5-ul ul li span:nth-child(5) {
  display: inline-block;
  text-align: center;
}

.title-nav .top5-ul ul li span:nth-child(6) {
  display: inline-block;
  text-align: center;
}

.right-body .right-bottom {
  width: 100%;
  height: 45%;
  margin-top: 1%;
}


/* 新增样式 */
.content-body {

  /*background: linear-gradient(135deg, #1e1e2f, #2b2d42);*/
  color: #e0e0e0;
  font-family: 'Roboto', sans-serif;
}

.public-bg {
  /*background: rgba(30, 30, 47, 0.9);*/
  //border-radius: 10px;
  //box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.public-title {
  color: #00eaff;
  font-weight: bold;
  text-shadow: 0 0 5px #00eaff;
}

.el-input,
.el-button {
  border-radius: 5px;
}


.el-button:hover {
  background-color: #006f8c;
}

.dv-border-box7 {
  border: 1px solid #00eaff;
  animation: glow 1.5s infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px #00eaff;
  }
  to {
    box-shadow: 0 0 20px #00eaff;
  }
}

#time {
  color: #00eaff;
  font-size: 1.2em;
  font-weight: bold;
}

/* 新增高科技感样式 */
.content-body {
  /*background: linear-gradient(135deg, #0f0c29, #483fa1, #24243e);*/
  color: #ffffff;
  font-family: 'Orbitron', sans-serif;
}

/*!*边框蓝线*!
.public-bg {
  background: rgba(20, 20, 50, 0.85);
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
  border: 1px solid #0ff;
}*/


/*字体蓝光*/
/*.public-title {*/
/*  color: #0ff;*/
/*  font-weight: 700;*/
/*  text-shadow: 0 0 10px #0ff, 0 0 20px #00f, 0 0 30px #0ff;*/
/*}*/

.el-input,
.el-button {
  border-radius: 8px;
  border: none;
}

.el-button {

  background: linear-gradient(45deg, #2c3364, #0ff);
  color: #dce9fa;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.5);
}

.dv-border-box7 {
  border: 1px solid #0ff;
  animation: neonGlow 2s infinite alternate;
  box-shadow: 0 0 15px #00eaff, 0 0 30px #0ff inset;
}

@keyframes neonGlow {
  from {
    box-shadow: 0 0 10px #00eaff;
  }
  to {
    box-shadow: 0 0 25px #00eaff;
  }
}

#time {
  color: #0ff;
  font-size: 1.5em;
  font-weight: 700;
  text-shadow: 0 0 5px #00eaff;
}


</style>
