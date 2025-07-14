<template>
  <div>
      <div class="grid-container">
        <el-button class="export-button" @click="pdfdown">导出</el-button>
      </div>
      <el-checkbox-group v-model="selecteddownMap">
        <el-checkbox v-for="item in thematicMapitems" :key="item.id" :label="item.name">{{ item.name }}</el-checkbox>
      </el-checkbox-group>
    </div>

</template>

<script>
import html2canvas from "html2canvas";
import * as Cesium from 'cesium'
export default {
  props: ['hiddenElement','eqstartTime','viewerthematic','plotisshow'],
  watch: {
    hiddenElement(newVal) {
      this.hiddenElement = newVal;
    },
    eqstartTime(newVal) {
      this.eqstartTime = newVal;
    },
    viewerthematic(newVal) {
      this.viewerthematic = newVal;
    },
    plotisshow(newVal) {
      this.plotflaglocal = JSON.parse(JSON.stringify(newVal)); // 深拷贝
    },
  },
  data() {
    return {
      thematicMapitems: [
        {id: '0', name: '遥感影像图'},
        {id: '1', name: '三维模型图'},
        {id: '2', name: '正射影像图'},
        {id: '3', name: '行政区划图'},
        {id: '4', name: '人口密度图'},
        {id: '5', name: '交通网络图'},
        {id: '6', name: '避难场所图'},
        {id: '7', name: '救援队伍分布图'},
        {id: '8', name: '应急物资存储图'},
      ],
      selecteddownMap: [],
      plotflaglocal: JSON.parse(JSON.stringify(this.plotisshow)), // 深拷贝
    };
  },
  methods: {
    pdfdown() {
      const hasMarkingLayer = this.selecteddownMap.includes('遥感影像图');
      if (hasMarkingLayer) {
        // console.log("hasMarkingLayer")
        this.downMarking()
      }
    },


    async downMarking(){

      //7天截图
      let time=new Date(this.eqstartTime).getTime()+7*24*60*60*1000
      Object.keys(this.plotflaglocal).forEach(key => {
        this.plotflaglocal[key] = 0;
      });
      this.$emit('updatePlot',time,this.viewerthematic, this.plotflaglocal); // 通知父组件
      // 等待地图渲染
      await this.waitForMapToRender();
      // 截图
      html2canvas(this.hiddenElement).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'screenshot.png';
        link.click();
        this.viewerthematic.entities.removeAll();
      });

    },

    waitForMapToRender() {
      return new Promise((resolve) => {
      // 等待一段时间，确保地图渲染完成
        setTimeout(() => {
          resolve();
        }, 1000); // 可以根据需要调整延迟
      });
    }
  }
}


</script>



<style scoped>

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 创建2列，等宽 */
  gap: 8px; /* 列间距 */
}
.export-button {
  margin-bottom: 10px; /* 可选：调整按钮与复选框之间的间距 */
  width:100%;
}


</style>
