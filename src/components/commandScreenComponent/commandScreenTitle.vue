<!--
    指挥大屏顶部导航栏
  -->
<template>
    <div class="top-header">
      <div class="system-title">
        {{ this.eqyear }}年{{ this.eqmonth }}月{{ this.eqday }}日<br>{{
          this.centerPoint.earthquakeName
        }}{{ Number(this.centerPoint.magnitude).toFixed(1) }}级地震
      </div>

    <div class="logo-menu menue-left">
      <div
          v-for="item in menuItems"
          :key="item.title"
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive(item.component) }"
          :title="item.title"
          @click="toggleComponent(item.component)"
      >
        <p>{{ item.title }}</p>
      </div>
    </div>
    <div class="logo-menu menue-right">
      <div
          v-for="item in rightMenuItems"
          :key="item.title"
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive(item.component) }"
          :title="item.title"
          @click="item.component === 'frontPage' ? navigateToFrontPage() : toggleComponent(item.component)"
      >
        <p>{{ item.title }}</p>
      </div>
    </div>
    <div class="logo-left-weather">
      <div class="company-name">雅安市地震应急信息服务技术支撑平台</div>
      <!-- 以下是实时获取时间的代码 -->
      <div class="logo-left-time">
        <div class="logo-time-hour">
                    <span class="pop-icon">
                      <svg width="20" height="20" viewBox="0 0 48 48">
                        <path
                            d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
                            fill="none" stroke="#BEE1FF" stroke-width="4"></path>
                        <path d="M24.0084 12.0001L24.0072 24.0089L32.4866 32.4883" stroke="#BEE1FF" stroke-width="4"
                              stroke-linecap="round"></path>
                      </svg>
                    </span>
          <span id="current-time">--:--:--</span>
        </div>
        <div class="logo-time-year" id="current-date">----</div>
      </div>

    </div>
    </div>
</template>

<script>
export default {
  props:['centerPoint'],
  watch: {
    centerPoint(newVal) {
      this.eqyear = this.centerPoint.startTime.getFullYear()
      this.eqmonth = this.centerPoint.startTime.getMonth() + 1
      this.eqday = this.centerPoint.startTime.getDate()
    }
  },
  data() {
    return {
      eqyear:'',
      eqmonth:'',
      eqday:'',
      menuItems: [
        {title: '灾情总览', component: 'dataStats'},
        {title: '灾损预估', component: 'damageThemeAssessment'},
        {title: '标绘统计', component: 'cartographicStatistics'},
      ],
      rightMenuItems: [
        {title: '资源调度', component: 'layerChoose'},
        {title: '灾情统计', component: 'thematicMapDownload'},
        {title: '图件产出', component: 'reportDownload'},
        {title: '返回首页', component: 'frontPage'},
      ],
    };
  },
  mounted() {
    this.startRealTimeClock('current-time', 'current-date');//菜单栏左上角实时获取时间
  },
  methods: {
    isActive(component) {
      return this.activeComponent === component;
    },
    toggleComponent(component) {
      this.$emit('toggle-component', component);
    },
    navigateToFrontPage() {
      this.$router.push({
        name: 'Index'
      });
    },
    //   菜单栏左上角实时获取时间代码
    startRealTimeClock(timeElementId, dateElementId) {
      function updateTime() {
        const now = new Date();
        const time = now.toLocaleTimeString('zh-CN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        const date = now.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          weekday: 'long'
        });
        document.getElementById(timeElementId).textContent = time;
        document.getElementById(dateElementId).textContent = date;
      }
      updateTime();
      setInterval(updateTime, 1000);
    },
  },
};
</script>

<style scoped>

.top-header {
  height: 24vh;
  width: 101%;
  background: url(@/assets/images/CommandScreen/导航栏底图.png) no-repeat;
  background-size: 100% 100%;
  top: 0%;
  position: absolute;
}

.system-title {
  font-size: 1.9rem;
  font-family: math;
  color: #fff;
  letter-spacing: 5px;
  text-align: center;
  position: relative;
  margin-top: 5px;
  font-weight: 900;
}

.logo-menu {
  position: absolute;
  top: 6px;
  display: flex;
}

.menue-left {
  left: 9%;
}

.menue-right {
  right: 3%;
}

.logo-menu-tittle {
  color: #fff;
  height: 3.5vh;
  width: 4.5vw;
  margin-right: 12px;
  margin-top: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url(/src/assets/images/CommandScreen/发光框.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.logo-menu .logo-menu-active {
  box-shadow: 0 0 15px #007fde, inset 0 0 25px #06b7ff;
}

@media screen and (max-width: 1490px) {
  .logo-menu-tittle {
    width: 92px !important;
  }
}

@media screen and (max-width: 1835px) {
  .logo-menu-tittle {
    width: 86px !important;
    font-size: 16px !important;
  }
}

.logo-left-weather {
  background-color: #1ab394;
  color: #fff;
  position: absolute;
  top: 5px;
  left: 9px;
}

.company-name {
  position: absolute;
  width: 17vw;
  top: 24%;
  font-weight: 700;
  font-size: .8rem;
  color: #51d1ff;
  line-height: 22px;
  letter-spacing: 2px;
  text-shadow: 0px 0px 20px #51f9ff;
}

.logo-left-time {
  position: absolute;
  top: 2.3vh;
  left: 1vw;
  width: 9vw;
}

.logo-time-hour {
  font-size: 17px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0px 2px 6px #123756;
  background: linear-gradient(0deg, #bee1ff, #fff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pop-icon {
  margin-right: 10px;
  margin-left: 6px;
  vertical-align: middle;
}

.logo-time-year {
  font-size: 12px;
  font-weight: 500;
  color: #cdcdcd;
}
</style>
