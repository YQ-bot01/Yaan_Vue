<template>
  <div class="timelineLegend" :class="{ 'open': activeComponent === 'legend' }">
    <div class="legend-header" @click="toggleLegend">
      <p class="legend-title" :class="{ 'centered': activeComponent === 'legend' }">图例</p>
      <span class="toggle-icon">{{ activeComponent === 'legend' ? '▼' : '▲' }}</span>
    </div>

    <div class="legend-items" v-if="activeComponent === 'legend'">
      <div class="legend-item">
        <img class="legend-img" src="@/assets/icons/TimeLine/震中.png" />
        <span class="legend-label">震中</span>
      </div>

      <div v-for="item in getPicData" :key="item.label" class="legend-item">
        <div v-if="item.img && item.img !== ''">
          <img  class="legend-img" :src="'http://59.213.183.7/prod-api/' +'/uploads/PlotsPic/' + item.img+ '.png?t=' + new Date().getTime()" alt="暂无符号">
<!--          <img  class="legend-img" :src="'http://localhost:8080'+'/uploads/PlotsPic/' + item.img+ '.png?t=' + new Date().getTime()" alt="暂无符号">-->

        </div>
        <span class="legend-label">{{ item.name }}</span>
      </div>

      <div class="legend-item">
        <img class="legend-img" src="@/assets/icons/TimeLine/聚合图标.png" />
        <span class="legend-label">聚合信息</span>
      </div>
<!--      用于填满图例表，不可删除。  删除则导致最后一行中间为空-->
      <div class="legend-item">
        <span class="legend-label"></span>
        <img class="legend-img" />
      </div>
    </div>

    <div class="legend-items-close" v-if="activeComponent !== 'legend'">
      <div class="close-items-row">
        <div class="close-item">
          <img class="legend-img" src="@/assets/icons/TimeLine/震中.png" />
          <span class="legend-label">震中</span>
        </div>
        <div class="close-item">
          <img class="legend-img" src="@/assets/icons/TimeLine/重伤人员.png" />
          <span class="legend-label">重伤人员</span>
        </div>
        <div class="close-item">
          <img class="legend-img" src="@/assets/icons/TimeLine/泥石流.png" />
          <span class="legend-label">泥石流</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { getPlotIcon } from "@/api/system/plot.js";


export default {
  props: ['activeComponent'],
  data() {
    return {
      getPicData: [],
    };
  },
  mounted() {
    this.getPlotPicture();
  },
  methods: {
    toggleLegend() {
      const newComponent = this.activeComponent === 'legend' ? null : 'legend';
      if (newComponent === 'legend') {
        this.$emit('toggleComponent', 'legend');  // 只在切换到 legend 展开 时触发
      } else {
        this.$emit('toggleComponent', 'legend');  // 只在切换到 legend 收缩 时触发
      }
    },
    getPlotPicture() {
      let that=this
      getPlotIcon().then(res => {
        that.getPicData = res.data;
      });
    }
  }
};
</script>

<style scoped>
.timelineLegend {
  width: 26vw;
  height: 4%;
  left: 1%;
  bottom: 9.8%;
  padding: 0px;
  position: absolute;
  background-color: rgba(40, 40, 40, 0.7);
  box-sizing: border-box;
  color: white;
  z-index: 99;
  transition: width 0.3s ease-in-out, height 0.3s ease-in-out, bottom 0.3s ease-in-out;
  background-color: rgb(22, 53, 77,0.9);
  backdrop-filter: none!important;
  background: linear-gradient(90deg, rgba(4,20,34,1) 0%, rgba(14,37,61,0.9) 41%, rgba(26,54,77,0.95) 66%, rgba(42,89,135,0.85) 84%, rgba(44,69,94,0.8) 100%);
}

.timelineLegend.open {
  width: 32%;
  height: 81%;
  bottom: 9%;
  right: 1%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.legend-header {
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  width: 100%;
  position: relative;
  height: 3.8vh;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.close-items-row {
  display: flex; /* 使用 flex 布局 */
  justify-content: space-between; /* 在两项之间留出空间 */
  width: 100%; /* 确保占满整个容器 */
  position: relative;
  left: 4%;
  margin-top: 2%;
}

.legend-items-close {
  display: flex;
  flex-wrap: wrap; /* 设置子元素换行 */
  justify-content: space-between; /* 两列均分 */
  align-items: flex-start;
  padding-top: 0;
  position: relative;
  top:-10%;
  width: 100%;
}

.close-item {
  display: flex;
  align-items: flex-start;
  width: 50%; /* 每个子元素占父容器的一半 */
  margin-bottom: 10px; /* 调整间距 */
}

.legend-title {
  text-align: center;
  left: 7%;
  position: relative;
}

.legend-title.centered {
  text-align: center;
}

.toggle-icon {
  margin-left: 10px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  justify-content: space-between; /* 子项均匀分布 */
  max-height: 93%;
  overflow-y: auto;
  width: 100%;
  padding: 7px;
}

.legend-img {
  max-height: 20px;
  max-width: 20px;
}

.legend-item {
  width: 33%; /* 每个子项占据父容器的三分之一 */
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.legend-label {
  font-size: 0.9rem;
  text-indent: 0.5em;
}
/* 整个滚动条 */
::-webkit-scrollbar {
  width: 6px;               /* 滚动条的宽度 */
  height: 12px;              /* 滚动条的高度，对水平滚动条有效 */
}
/* 滚动条轨道 */
::-webkit-scrollbar-track {
  border-radius: 10px;
  background: #008aff70; /* 轨道的背景颜色 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #1f9dca; /* 滑块的背景颜色 */
  border: 2px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造“边距”的效果 */
}
</style>
