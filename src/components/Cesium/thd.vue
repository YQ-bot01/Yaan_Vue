<template>
  <div>
    <!--    地震列表切换-->
    <div class="thd-listTable" v-if="activeComponent === 'eqList'">
      <div class="pop_right_background" style="width: 100%; height: 100%; z-index: 100;top: 0;">
        <damageThemeAssessment
            :eqid="eqid"
            :eqqueueId="eqqueueId"
        >
        </damageThemeAssessment>
      </div>
    </div>
    <!--  态势标绘  -->
    <div class="thd-listTable-cesium" v-if="activeComponent === 'model'">
      <div class="pop_right_background" style="width: 100%; height: 100%; z-index: 100;top: 0;">
        <div class="list-dialog__content" style="height: calc(100% - 30);">
          <timeLineCasualtyStatisticthd
              :zoomLevel="zoomLevel"
              :pointsLayer="pointsLayer"
              :currentTime="currentTime"
          />
        </div>
      </div>
      <plotSearch
          :eqid="eqid"
      ></plotSearch>
    </div>
    <div v-if="activeComponent === 'layerChoose'" class="thd-listTable">
      <div class="pop" style="width: 100%; height: 100%; z-index: 900;">
        <div class="pop_header">
          <span class="pop_title">图层要素</span>
        </div>
        <div class="list-dialog__content" style="height: calc(100% - 40px);">

          <!-- 图层要素可展开 -->
          <el-collapse>
            <el-collapse-item>
              <template #title>
                <div style="display: flex; align-items: center;">
                  <svg t="1730574016632" class="icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="6181" width="28" height="28" style="margin-right: 8px;">
                    <path
                        d="M852.6 462.9l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 764.1c-17.3 10.8-39.2 10.8-56.4 0L159.3 560c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 659c17.3 10.8 39.2 10.8 56.4 0l312.2-196 0.1-0.1z m0 156.1l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 920.2c-17.3 10.8-39.2 10.8-56.4 0L159.3 716.1c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 815c17.3 10.8 39.2 10.8 56.4 0l312.2-196h0.1zM540 106.4l324.6 204.1c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 604c-17.3 10.8-39.2 10.8-56.4 0L159.3 399.8c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l324.4-203.7c17.3-10.8 39.2-10.8 56.4 0l-0.1 0.2z"
                        p-id="6182" fill="#ffffff"></path>
                  </svg>
                  <span>图层管理</span>
                </div>
              </template>
              <el-checkbox-group v-model="selectedlayersLocal" @change="updateMapLayers" class="grid-container">
                <el-checkbox
                    v-for="item in layeritems"
                    :key="item.id"
                    :label="item.name"
                    style="margin: 0 0;"
                >
                  {{ item.name }}
                </el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
          </el-collapse>

          <!-- 视角跳转可展开 -->
          <el-collapse>
            <el-collapse-item>
              <template #title>
                <div style="display: flex; align-items: center;">
                  <svg t="1730573546101" class="icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="2695" width="28" height="28" style="margin-right: 8px;">
                    <path
                        d="M1023.886285 0.170629v223.921795l-248.549211-224.1493 248.549211 0.227505z m-185.814707 347.286381v2.218173c113.013108 69.900911 185.814708 174.610087 185.814707 292.571429 0 210.555876-229.211286 381.298378-512 381.298378-282.731837 0-511.943124-170.742502-511.943123-381.298378 0-113.297489 66.88647-214.59409 172.164408-284.438125V299.851589L505.231764 117.392579l332.839814 182.45901v47.605421zM63.701438 642.246612c0 174.837592 201.114419 317.085092 448.184847 317.085092 247.184181 0 448.241724-142.247501 448.241724-317.085092 0-83.778716-46.752277-159.651633-122.056431-216.357254v283.016219l-333.067319 181.890246-332.839813-181.947123V437.83337c-66.658965 55.340591-108.463008 126.151522-108.463008 204.413242z m183.141524 5.630749l227.78938 132.180404V515.753832L246.842962 383.573428v264.303933z m258.161297-449.606754L277.214879 330.394135l227.78938 132.180404 227.846257-132.180404-227.846257-132.123528z m258.218174 185.302821L535.433053 515.753832v262.768274l227.78938-130.644745V383.573428z"
                        fill="#ffffff" p-id="2696"></path>
                  </svg>
                  <span>视角跳转</span>
                </div>
              </template>
              <!-- 行政区划单选按钮 -->
              <div class="district-buttons">
                <el-radio-group v-model="selectedDistrict" @change="handleDistrictSelect">
                  <el-radio label="雅安市">雅安市</el-radio>
                  <el-radio label="回到震中">回到震中</el-radio>
                </el-radio-group>
              </div>

              <!-- 下属区县单选按钮 -->
              <div class="district-buttons">
                <el-radio-group v-model="selectedDistrict" @change="handleDistrictSelect">
                  <el-radio
                      v-for="district in districts"
                      :key="district.adcode"
                      :label="district.name"
                  >
                    {{ district.name }}
                  </el-radio>
                </el-radio-group>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <!-- 专题图产出 -->
    <div v-if="activeComponent === 'thematicMapDownload'" class="thd-listTable ">
      <div class="pop_right_background" style="width: 100%; height: 100%; z-index: 100;top: 0;">
        <disasterStatistics
            :eqid="eqid"
            :currentTime="currentTime"
            @addJumpNodes="addJumpNodes"
        />
      </div>
    </div>

    <!-- 专题图产出 -->
    <div v-if="activeComponent === 'reportDownload'" class="thd-listTable ">
      <div class="pop" style="width: 100%;height: 100%; z-index: 900; ">
        <div class="pop_header">
          <span class="pop_title">图件产出</span>
        </div>
        <div class="list-dialog__content" style="height: calc(100% - 40px);">
          <!-- 切换按钮 -->
          <div class="toggle-buttons">
            <el-button
                :type="activeTab === 'thematicMap' ? 'primary' : 'default'"
                @click="activeTab = 'thematicMap'"
            >
              专题图预览
            </el-button>
            <el-button
                :type="activeTab === 'report' ? 'primary' : 'default'"
                @click="activeTab = 'report'"
            >
              报告产出
            </el-button>
          </div>
          <!-- 专题图 -->
          <div v-if="activeTab === 'thematicMap'" class="section">
            <div class="grid-container">
              <div
                  v-for="(item, index) in thematicMapitems"
                  :key="index"
                  class="grid-item"
                  @click="showThematicMapDialog(item)"
              >
                <el-card shadow="hover">
                  <img :src="item.imgUrl" :alt="item.theme" class="preview-img"/>
                  <div class="item-info">
                    <p class="item-title">{{ item.theme }}</p>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
          <!-- 报告 -->
          <div v-if="activeTab === 'report'" class="section">
            <div class="grid-container-report">
              <div
                  v-for="(item, index) in reportItems"
                  :key="index"
                  class="grid-item"
              >
                <el-card shadow="hover">
                  <div class="report-preview">
                    <p class="report-name">{{ item.theme }}</p>
                    <div class="report-bottom" @click="downloadReport(item)">
                      下载报告
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 专题图预览弹框 -->
      <thematic-map-preview
          v-if="ifShowMapPreview"
          :img-url="imgshowURL"
          :img-name="imgName"
          @close="ifShowThematicMapDialog(false)"
      />
    </div>

    <!--    box包裹地图，截图需要-->
    <div id="box" ref="box">
      <div id="cesiumContainer">

      </div>
    </div>

    <div class="top-header">
      <div class="system-title">
        {{ this.eqyear }}年{{ this.eqmonth }}月{{ this.eqday }}日<br>{{
          this.centerPoint.earthquakeName
        }}{{ Number(this.centerPoint.magnitude).toFixed(1) }}级地震
      </div>
    </div>
    <div class="logo-menu menue-left">
      <div
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive('dataStats') }"
          title="灾情总览"
          @click="toggleComponent('dataStats')"
      >
        <p>灾情总览</p>
      </div>
      <div
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive('eqList') }"
          title="灾损预估"
          @click="toggleComponent('eqList')"
      >
        <p>灾损预估</p>
      </div>
      <div
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive('model') }"
          title="标绘统计"
          @click="toggleComponent('model')"
      >
        <p>标绘统计</p>
      </div>
    </div>
    <div class="logo-menu menue-right">
      <div
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive('layerChoose') }"
          title="资源调度"
          @click="toggleComponent('layerChoose')"
      >
        <p>资源调度</p>
      </div>
      <div
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive('thematicMapDownload') }"
          title="灾情统计"
          @click="toggleComponent('thematicMapDownload')"
      >
        <p>灾情统计</p>
      </div>
      <div
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive('reportDownload') }"
          title="图件产出"
          @click="toggleComponent('reportDownload')"
      >
        <p>图件产出</p>
      </div>
      <div
          class="logo-menu-tittle"
          :class="{ 'logo-menu-active': isActive('frontPage') }"
          title="返回首页"
          @click="navigateToFrontPage"
      >
        <p>返回首页</p>
      </div>
    </div>

    <div class="logo-left-weather">
      <div class="company-name">{{useTitleStore().pageTitle}}</div>
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
    <div class="logo-right-time">
    </div>
    <div class="left_component"></div>

    <!-- 进度条-->
    <div class="bottom">
      <!--      播放暂停按钮-->
      <div class="play">
        <img class="play-icon" src="../../assets/icons/TimeLine/回到开始.png" @click="returnStart"/>
        <img class="play-icon" src="../../assets/icons/TimeLine/后退箭头.png" @click="backward"/>
        <img class="play-icon" src="../../assets/icons/TimeLine/播放.png" v-show="!isTimerRunning"
             @click="toggleTimer"/>
        <img class="pause-icon" src="../../assets/icons/TimeLine/暂停.png" v-show="isTimerRunning"
             @click="toggleTimer"/>
        <img class="play-icon" src="../../assets/icons/TimeLine/前进箭头.png" @click="forward"/>
      </div>

      <div class="time-ruler" @mousedown="startDrag" @mouseenter="isDragging = true"
           @mouseleave="isDragging = true">
        <div class="time-ruler-line" @click="jumpToTime">
          <div class="time-progress" :style="{ width: `${currentTimePosition}%` }"></div>
          <div class="time-slider" :style="{ left: `${currentTimePosition-0.5}%` }"></div>
        </div>

        <div class="speed-selector" @click="this.showSpeedOptions = !this.showSpeedOptions">
          <span class="speedButton">{{ speedOption }}</span>
          <div class="chooseSpeed" v-if="showSpeedOptions">
            <option
                v-for="option in speedOptions"
                :key="option"
                @click.stop="selectSpeed(option)"
                class="speed-option"
            >
              {{ option }}
            </option>
          </div>
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

    <div class="bottom-footer"></div>

    <!-- 进度条 end-->

    <!--展示弹框伤亡统计-->
    <div id="legend" v-show="isShowYaanRegionLegend"
         style="position: absolute;
           z-index:20; bottom: 100px;
           right: 450px; color: #FFFFFF;
           background-color: rgba(0, 0, 0, 0.5);
           padding: 10px; border-radius: 5px;text-align: center;">
      <div v-for="(colorItem, index) in YaanLegendcolors" :key="index">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div
              style="width: 20px; height: 20px; margin-right: 10px;"
              :style="{ backgroundColor: colorItem.color.toCssColorString() }">
          </div>
          <span>{{ colorItem.name }}</span>
        </div>
      </div>
    </div>

    <!--   断裂带名称div   -->
    <div id="faultInfo"
         style="position: absolute; display: none; background-color: #3d423f; border: 1px solid black; padding: 5px; color: #fff; z-index: 1000; text-align: center;">
    </div>

    <!--经纬度跳转-->
    <div
        style="display: flex; align-items: center; position: absolute; top: 94.75%; left: 1%; z-index: 1000; pointer-events: none;">
      <div @click="togglePositionFlyTo" class="positionFlyToButton" style="pointer-events: auto;">
        <img src="../../assets/icons/svg/positionFlyTo.svg" title="经纬度跳转"
             style="width: 31px; height: 31px;">
      </div>
      <div @click="toggleLayerFeatures" class="positionFlyToButton" style="pointer-events: auto; margin-left: 10px;">
        <img src="../../assets/icons/svg/layerFeatures.svg" title="图层要素"
             style="width: 31px; height: 31px;">
      </div>
      <div @click="toggleEqListPanel" class="positionFlyToButton" style="pointer-events: auto; margin-left: 10px;">
        <img src="../../assets/icons/svg/earthquakeList.svg" title="地震列表"
             style="width: 31px; height: 31px;">
      </div>
      <div @click="toggleModelPanel" class="positionFlyToButton" style="pointer-events: auto; margin-left: 10px;">
        <img src="../../assets/icons/svg/2Dand3Dintegration.svg" title="二三维一体化"
             style="width: 31px; height: 31px;">
      </div>
    </div>
    <!--   经纬度跳转弹框 -->
    <div class="universalPanel" v-if="showPositionFlyTo">
      <div class="panelTop">
        <h2 class="panelName">经纬度跳转</h2>
      </div>
      <div class="panelContent">
        <div>经度：
          <el-input v-model="positionFlyTo.lon" class="positionFlyToInput" @keyup.enter="flyToPosition"
          ></el-input>
          °
        </div>
        <div style="margin-left: 10px">纬度：
          <el-input v-model="positionFlyTo.lat" class="positionFlyToInput"
                    @keyup.enter="flyToPosition"></el-input>
          °
        </div>
      </div>
      <div class="panelButton">
        <el-button class="panelButtons" @click="clearPositionPanel">取消</el-button>
        <el-button class="panelButtons" type="primary" @click="flyToPosition">
          跳转
        </el-button>
      </div>
    </div>

    <!--    图层管理弹框-->
    <div class="universalPanel" v-if="showLayerFeatures">
      <div class="panelTop">
        <h2 class="panelName">图层管理</h2>
      </div>
      <el-tree
          default-expand-all="true"
          ref="tree"
          node-key="id"
          :props="props"
          :load="loadNode"
          :default-checked-keys="selectedlayersLocal"
          lazy
          @check="handleCheckChange"
      >
        <template #default="{ node, data }">
          <!-- 根节点，显示图标和文字 -->
          <div class="tree-node-content">
            <span v-if="data.name === '图层要素'" class="node-icon">
            <!-- 图层要素的 SVG 图标 -->
              <svg t="1730574016632" class="icon" viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="6181" width="28" height="28" style="margin-right: 8px;">
                    <path
                        d="M852.6 462.9l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 764.1c-17.3 10.8-39.2 10.8-56.4 0L159.3 560c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 659c17.3 10.8 39.2 10.8 56.4 0l312.2-196 0.1-0.1z m0 156.1l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 920.2c-17.3 10.8-39.2 10.8-56.4 0L159.3 716.1c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 815c17.3 10.8 39.2 10.8 56.4 0l312.2-196h0.1zM540 106.4l324.6 204.1c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 604c-17.3 10.8-39.2 10.8-56.4 0L159.3 399.8c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l324.4-203.7c17.3-10.8 39.2-10.8 56.4 0l-0.1 0.2z"
                        p-id="6182" fill="#ffffff"></path>
                  </svg>
              <span class="node-text">{{ data.name }}</span>
            </span>
            <span v-else-if="data.name === '视角跳转'" class="node-icon">
            <!-- 视角跳转的 SVG 图标 -->
              <svg t="1730573546101" class="icon" viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" p-id="2695" width="28" height="28" style="margin-right: 8px;">
                    <path
                        d="M1023.886285 0.170629v223.921795l-248.549211-224.1493 248.549211 0.227505z m-185.814707 347.286381v2.218173c113.013108 69.900911 185.814708 174.610087 185.814707 292.571429 0 210.555876-229.211286 381.298378-512 381.298378-282.731837 0-511.943124-170.742502-511.943123-381.298378 0-113.297489 66.88647-214.59409 172.164408-284.438125V299.851589L505.231764 117.392579l332.839814 182.45901v47.605421zM63.701438 642.246612c0 174.837592 201.114419 317.085092 448.184847 317.085092 247.184181 0 448.241724-142.247501 448.241724-317.085092 0-83.778716-46.752277-159.651633-122.056431-216.357254v283.016219l-333.067319 181.890246-332.839813-181.947123V437.83337c-66.658965 55.340591-108.463008 126.151522-108.463008 204.413242z m183.141524 5.630749l227.78938 132.180404V515.753832L246.842962 383.573428v264.303933z m258.161297-449.606754L277.214879 330.394135l227.78938 132.180404 227.846257-132.180404-227.846257-132.123528z m258.218174 185.302821L535.433053 515.753832v262.768274l227.78938-130.644745V383.573428z"
                        fill="#ffffff" p-id="2696"></path>
                  </svg>
              <span class="node-text">{{ data.name }}</span>
            </span>
            <!-- 子节点逻辑保持原有 -->
            <el-checkbox
                v-if="layeritems.some(item => item.name === data.name)"
                v-model="selectedlayersLocal"
                :label="data.name"
                @change="updateMapLayers"
            >
              <span>{{ data.name }}</span>
            </el-checkbox>
            <el-radio-group
                v-else-if="data.name === '回到震中' || data.name === '雅安市' || districts.some(d => d.name === data.name)"
                v-model="selectedDistrict"
            >
              <el-radio :label="data.name" @change="handleDistrictSelect(data.name)">
                <span>{{ data.name }}</span>
              </el-radio>
            </el-radio-group>
          </div>
        </template>
      </el-tree>
    </div>

    <!--    地震列表切换-->
    <div class="universalPanel" v-if="showEqListPanel">
      <!-- 顶部标题栏 -->
      <div class="panelTop">
        <h2 class="panelName">地震列表</h2>
      </div>
      <!-- 内容区域 -->
      <div class="panelContent">
        <div class="thd-Table">
          <eqlistTable :eqData="eqTable"/>
        </div>
      </div>
    </div>

    <!-- 三维模型弹框 -->
    <div class="universalPanel" v-if="showModelPanel">
      <!-- 顶部标题栏 -->
      <div class="panelTop">
        <h2 class="panelName">三维模型</h2>
      </div>
      <!-- 表格内容 -->
      <div class="model-dialog__content">
        <el-table
            :data="modelTableData"
            class="custom-table"
            style="width: 100%; height: 90%;"
            :header-cell-style="tableHeaderColor"
            :cell-style="tableColor"
            :row-style="{ height: '37.5px', fontSize: '13px'}"
        >
          <!-- 模型名称列 -->
          <el-table-column label=" " min-width="20px" show-overflow-tooltip>
            <template #default="scope">
              <div style="display: flex; align-items: center; justify-content: center; height: 100%;"
                   class="arrow-container">
                <div class="arrow-icon"></div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
              prop="name"
              label="模型名称"
              width="auto"
              min-width="130px"
              show-overflow-tooltip
          ></el-table-column>
          <!-- 操作列 -->
          <el-table-column label="操作" width="auto" align="center" min-width="100px" show-overflow-tooltip>
            <template #default="scope">
              <el-button type="text" :icon="Edit" @click="goModel(scope.row)" class="checkBotton">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div>
          <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="modelCurrentPage"
              :page-size="modelPageSize"
              layout="total, prev, pager, next, jumper"
              :total="ModelTotal"
              class="custom-pagination"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <thematicMapPreview
        @ifShowThematicMapDialog="ifShowThematicMapDialog"
        :imgshowURL="imgshowURL"
        :imgurlFromDate="imgurlFromDate"
        :imgName="imgName"
        :ifShowMapPreview="ifShowMapPreview"
        :showTypes="showTypes"
        style="width: 40%"
    ></thematicMapPreview>
    <div class="timelineRunningTimeLabel">
      {{ this.timestampToTimeChinese(this.currentTime) }}
    </div>

    <!--    <div id="legend" v-show="true"-->
    <!--         style="position: absolute;-->
    <!--           right: 500px;-->
    <!--         z-index:20; bottom: 100px;-->
    <!--         right: 450px; color: #FFFFFF;-->
    <!--         background-color: rgba(0, 0, 0, 0.5);-->
    <!--         padding: 10px; border-radius: 5px;text-align: center;">-->
    <!--      <div v-for="(item, index) in slopeStatistics" :key="index">-->
    <!--        <div style="display: flex; align-items: center; margin-bottom: 5px;">-->
    <!--          <div-->
    <!--              :style="{ width: '20px', height: '20px', marginRight: '10px', backgroundColor: item.color }">-->
    <!--          </div>-->
    <!--          <span style="width: 80px;text-align: left">{{ item.degree }}</span>-->
    <!--          <span style="text-align: left">{{ item.proportion }}</span>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->

    <!--    <div style="position: absolute;width: 50px;bottom: 300px;right: 500px;-->
    <!--      z-index:20;padding: 10px; border-radius: 5px;text-align: center;">-->
    <!--      <el-button @click="drawN">量算</el-button>-->
    <!--    </div>-->

    <!--    <div style="position: absolute;width: 200px;bottom: 500px;right: 500px;-->
    <!--      z-index:20;padding: 10px; border-radius: 5px;text-align: center;">-->
    <!--      <el-button @click="route">路径规划</el-button>-->
    <!--    </div>-->
    <!--    <div style="position: absolute;width: 200px;bottom: 450px;right: 500px;-->
    <!--      z-index:20;padding: 10px; border-radius: 5px;text-align: center;">-->
    <!--      <el-button @click="addArea">添加障碍区域</el-button>-->
    <!--    </div>-->
    <!--    <div style="position: absolute;width: 200px;bottom: 400px;right: 500px;-->
    <!--      z-index:20;padding: 10px; border-radius: 5px;text-align: center;">-->
    <!--      <el-button @click="removeAll">清空所有实体</el-button>-->
    <!--    </div>-->


  </div>
</template>

<script>
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {initCesium} from '@/cesium/tool/initCesium.js'
import {getPlotBelongCounty, getPlotwithStartandEndTime} from '@/api/system/plot'
import {getAllEq, getAllEqList, getEqById, getEqListById} from '@/api/system/eqlist'
import cesiumPlot from '@/cesium/plot/cesiumPlot'
import {useCesiumStore} from '@/store/modules/cesium.js'
import centerstar from "@/assets/icons/TimeLine/震中.png";


import fileUrl from "@/assets/json/TimeLine/2020年6月1日四川雅安芦山县6.1级地震灾害报告.pdf"

import eqTable from '@/components/Home/eqtable.vue'
import eqlistTable from '@/components/Home/eqlistTable.vue'
import earthquakeTable from "@/components/Home/earthquakeTable.vue";
import modelTable from '@/components/Home/modelTable.vue'
import yaan from '@/assets/geoJson/yaan1.json'
import {TianDiTuToken} from "@/cesium/tool/config";
import {getFeaturesLayer} from "@/api/system/emergency.js";
import emergencyRescueEquipmentLogo from '@/assets/images/EmergencyResourceInformation/disasterReliefSuppliesLogo.jpg';
import rescueTeamsInfoLogo from '@/assets/images/EmergencyResourceInformation/rescueTeamsInfoLogo.png';
import emergencySheltersLogo from '@/assets/images/emergencySheltersLogo.png';

import layeredShowPlot from '@/components/Cesium/layeredShowPlot.vue'
import {addFaultZones, addHistoryEqPoints, addOvalCircles, handleOutputData} from "../../cesium/plot/eqThemes.js";
import {MapPicUrl, ReportUrl} from "@/assets/json/thematicMap/PicNameandLocal.js"
import thematicMapPreview from "@/components/ThematicMap/thematicMapPreview.vue";
import {TianDiTuGeocoder} from "../../cesium/tool/geocoder.js";
import arrowImage from "@/assets/images/arrow.png";

import {Edit, Delete} from '@element-plus/icons-vue'
import {
  addModelApi,
  deleteModel,
  getAllModel,
  updataModel,
  updataModelNoElevation,
  updataModelElevation
} from '@/api/system/model.js'
import {
  goModel,
  findModel,
  isTerrainLoaded,
  transferModel,
  rotationModel,
} from '@/cesium/model.js';
import {initWebSocket} from '@/cesium/WS.js'
import Arrow from "@/cesium/drawArrow/drawPlot.js"
import timeLineCasualtyStatisticthd from "@/components/TimeLine/timeLineCasualtyStatisticthd.vue";
import * as turf from "@turf/turf";
import {
  Cartesian3,
  Cartographic, ClassificationType, Color, Entity,
  Math as CesiumMath,
  PolygonHierarchy,
  Rectangle,
  sampleTerrainMostDetailed
} from "cesium";
import {ElMessage, ElMessageBox} from "element-plus";
import {marchByRegion, searchEmergencyTeamData, searchMaterialData} from "../../api/system/emergency.js";
import axios from "axios";
import damageThemeAssessment from "./damageThemeAssessment.vue";
import disasterStatistics from  "./disasterStatistics.vue"
import PlotSearch from "./plotSearch.vue";
import start from "@/assets/start.svg";
import end from "@/assets/end.svg";
import {gcj02towgs84, wgs84togcj02} from "@/api/tool/wgs_gcj_encrypts.js";
import arrow from "@/cesium/drawArrow/drawPlot.js";
import {AmapApiLocal} from "@/utils/server.js";
import {tianditu} from "@/utils/server.js";
import {useTitleStore} from "../../store/index.js";

export default {
  computed: {
    Edit() {
      return Edit
    },
  },
  components: {
    damageThemeAssessment,
    disasterStatistics,
    PlotSearch,
    timeLineCasualtyStatisticthd,
    thematicMapPreview,

    eqTable,
    layeredShowPlot,
    earthquakeTable,
    modelTable,
    eqlistTable
  },
  data: function () {
    return {
// -----------弹窗们的状态变量-------------

      //----------------------------------
      eqid: '',
      eqqueueId: '',
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
        content: '',
        earthquakeId: '',
        image: '',
        publishTime: '',
        sourceName: '',
        sourceLogo: '',
        title: '',
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
      currentTimePosition: 0,
      // currentTimePosition: 100,
      //时间轴当前前进步
      // currentNodeIndex: 2076,
      currentNodeIndex: 0,
      realtimeinterval: null,
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
      jumpTimes: [],
      jumpNodes: {},
      // smallViewer: null,

      //-------------ws---------------------
      websock: null,
      //-----------------地震列表---------------------
      // eqListShow: false,
      //-地震列表---------------------------------
      total: 0,
      pageSize: 6,
      currentPage: 1,
      eqtableData: [],
      //-----------------图层---------------------
      // iflayerChoose: false,
      isMarkingLayer: true,
      showlayers: [],
      //-----------------图层---------------------
      LRDLStatus: false, // 路网
      // districtLayer: null,
      //------------------按钮下拉框------
      // visible: false,
      selectedDistrict: '', // 用于追踪选中的复选框
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
      regionLayerJump: null,

      activeComponent: 'dataStats',// 默认为数据统计
      activeTab: "thematicMap", // 当前显示的 tab (专题图或报告)
      showSidebarComponents: true,  // 控制两侧组件显示状态
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
      isMarkingLayerLocal: true,
      disasterReserves: [],
      emergencyTeam: [],
      emergencyShelters: [],
      isShowYaanRegionLegend: false, //雅安行政区划图例

      // 定义雅安各区县的颜色和名称
      YaanLegendcolors: [
        {color: Cesium.Color.GOLD.withAlpha(0.5), name: '雨城区'},
        {color: Cesium.Color.LIGHTGREEN.withAlpha(0.5), name: '名山区'},
        {color: Cesium.Color.LAVENDER.withAlpha(0.5), name: '荥经县'},
        {color: Cesium.Color.ORANGE.withAlpha(0.5), name: '汉源县'},
        {color: Cesium.Color.CYAN.withAlpha(0.5), name: '石棉县'},
        {color: Cesium.Color.TAN.withAlpha(0.5), name: '天全县'},
        {color: Cesium.Color.SALMON.withAlpha(0.5), name: '芦山县'},
        {color: Cesium.Color.LIGHTBLUE.withAlpha(0.5), name: '宝兴县'},
      ],

      //专题图下载
      thematicMapitems: [],
      selectthematicMap: '',
      isshowThematicMapPreview: '',
      imgshowURL: '',
      imgurlFromDate: '',
      imgName: '',
      ifShowMapPreview: false, // 是否预览专题图
      //这个showTypes注意，1为前端存储的图片，2是截图加自动生成经纬度线，3是三维模型图，就是等高线
      showTypes: 1,

      //专题图下载end

      //报告产出
      reportItems: [],
      selectReportItem: '',

      //----------------------------model table---------------------------------------
      modelCurrentPage: 1,
      modelPageSize: 15,
      ModelTotal: 0,
      modelTableData: [],
      modelList: [],
      modelInfo: {
        name: null,
        path: null,
        rz: null,
        tz: null,
        rze: null,
        tze: null,
        time: null,
        modelid: null
      },
      zoomLevel: '市', // 初始化缩放层级
      pointsLayer: [], //传到子组件
      stopTimeforAddEntityOneIndex: 6000,
      timelinePopupShowCenterStrart: true,
      intervalIdcolor: null,
      isfirst: false,
      // 视角输入经纬度高度跳转------------
      showPositionFlyTo: false,
      positionFlyTo: {
        lon: "", // 经度
        lat: "", // 纬度
      },
      // 坡面分析+距离量算
      ifSlopeAnalyze: false,
      ifDistanceMeasure: false,
      polygonPos: [], // 存储包围盒坐标
      slopes: [], // 存储坡度信息
      fxValues: [],
      fyValues: [],
      slopeCounts: [0, 0, 0, 0, 0], // 坡度范围计数
      totalCells: 0, // 总格子数
      clickCount: 0,
      firstClickPosition: null,
      secondClickPosition: null,
      isShowSlopeLegend: false,
      slopeStatistics: [
        {
          degree: '< 15°',
          color: '#00FF00',
          proportion: ''
        },
        {
          degree: '15°- 30°',
          color: '#FFFF00',
          proportion: ''
        },
        {
          degree: '30°- 45°',
          color: '#FFCC00',
          proportion: ''
        },
        {
          degree: '45°- 60°',
          color: '#FF7F00',
          proportion: ''
        },
        {
          degree: '> 60°',
          color: '#FF0000',
          proportion: ''
        }
      ],


      // 路径规划+物资匹配
      // ---------------------------------------------
      handler: null, // 创建共享的 handler
      isRouting: false, // 路径规划是否在进行中
      isAddingArea: false, // 是否在添加受灾区域
      propertiesId: [],  // 存储之前创建的实体（点和折线）的ID
      pos: [],
      areas: [],
      RouteTime: " ", //全程所需时间
      RouteWay: " ", //行进方式
      showTips: false, //路径弹窗
      totalRoute: "", //全长
      cartime: "", //临时变量
      humantime: "", //临时变量
      visibleGuilde: false, //驾驶时导航显示
      selectedDrive: "",
      selectedWalk: "",
      RouteGuilde: [],
      loading: false,
      // 资源快速匹配
      showSuppliesList: [],
      selectedSuppliesList: [],
      showIcon: [],
      activeMenuIndex: '3', // 显示的一级菜单 eg.路径规划、物资匹配
      isCollapsed: false, // 控制是否收缩

      panels: {
        tableVisible: true, // 显示表格
        searchSupplyDialog: false, // 物资查询dialog是否显示
        searchEmergencyTeamDialog: false, // 救援力量查询dialog是否显示
        marchSupplyDialog: false, // 物资匹配dialog是否显示
        searchSupplyByRadiusDialog: false,  // 半径匹配dialog是否显示
        marchRegionsDialog: false,  //行政区划匹配dialog是否显示
      },

      searchSupplyResultDialog: false, // 物资匹配结果dialog是否显示

      ifDrawEllipse: false,
      marchSupplyRadius: 0,
      toolValue: "隐藏列表",
      routeValue: "隐藏路径规划",
      showSupply: "显示所有物资点",
      // total: 0,
      // pageSize: 5,
      // currentPage: 1,
      addSupplyPointCurrently: {
        lng: 0,
        lat: 0,
        count: 0,
        position: "",
        type: "",
        tel: "",
      },
      // 物资查询/匹配表单
      searchSupplyForm: {
        county: "",
        address: "",
        contactPerson: "",
        contactPhone: "",
        tents: 0,
        raincoats: 0,
        rainBoots: 0,
        flashlights: 0,
        radius: 0.0,
      },
      // 救援力量表单
      searchEmergencyTeamForm: {
        levelName: '',
        teamTypeName: '',
        totalMembers: 0,
        address: '',
        personInCharge: '',
        chargePhone: ''
      },
      inputRadius: "",
      inputData: '',
      canMarkPoint: false,
      DialogFormVisible: false,
      affectedPoints: [{lng: 103.0058, lat: 29.9794, position: "a"}],
      // 救援物资字段
      listFieldsOfSupplies: [
        {prop: 'county', label: '区域', width: 120},
        {prop: 'address', label: '地址', width: 150},
        {prop: 'contactPerson', label: '联系人', width: 100},
        {prop: 'contactPhone', label: '联系电话', width: 120},
        {prop: 'tents', label: '帐篷总数量', width: 100},
        {prop: 'raincoats', label: '雨衣总数量', width: 100},
        {prop: 'rainBoots', label: '雨鞋总数量', width: 100},
        {prop: 'flashlights', label: '手电筒总数量', width: 130}
      ],
      // 救灾装备字段
      listFieldOfReserves: [
        {prop: 'county', label: '区域', width: 120},
        {prop: 'address', label: '地址', width: 200},
        {prop: 'contactPerson', label: '联系人', width: 80},
        {prop: 'contactPhone', label: '联系电话', width: 120},
        {prop: 'lifeJacket', label: '救生衣', width: 80},
        {prop: 'lifebuoy', label: '救生圈', width: 80},
        {prop: 'walkieTalkie', label: '对讲机', width: 80},
        {prop: 'portableLight', label: '照明灯', width: 80}
      ],
      // 救援力量字段
      listFieldOfEmergencyTeam: [
        // { prop: 'county', label: '所属机构', width: 200, tooltip: true },
        {prop: 'levelName', label: '级别名称', width: 150},
        {prop: 'teamTypeName', label: '队伍类型名称', width: 160},
        {prop: 'totalMembers', label: '队伍人数', width: 80},
        {prop: 'address', label: '地址', width: 200},
        {prop: 'personInCharge', label: '负责人'},
        {prop: 'chargePhone', label: '负责人电话', width: 200},
      ],
      listField: '',  // 判断显示哪个列表
      suppliesList: [],
      supplyList: [],
      all: [],
      // labels: [],  // 保存标签实体的引用
      // regionLayerJump: null,
      // 行政区划----------------------------
      // districts: [
      //     {adcode: 511802, name: "雨城区"},
      //     {adcode: 511803, name: "名山区"},
      //     {adcode: 511822, name: "荥经县"},
      //     {adcode: 511823, name: "汉源县"},
      //     {adcode: 511824, name: "石棉县"},
      //     {adcode: 511825, name: "天全县"},
      //     {adcode: 511826, name: "芦山县"},
      //     {adcode: 511827, name: "宝兴县"},
      // ],
      selectedRegions: [],
      selectedDataByRegions: {},

      //-----------弹窗部分-------------------
      // selectedEntityHighDiy: null,
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件
      tableNameOptions: [],
      eqlistName: '',
      canOperateTimerLine: false,
      wsaddMakers: [],
      wsdeleteMakers: [],
      viewCenterCoordinate: null,
      showLayerFeatures: false,// 图层要素弹框状态

      showModelPanel: false,// 三维模型弹框状态
      props: {
        label: 'name',
        children: 'children',
        disabled: (data, node) => {
          // 只有当节点名为"视角跳转"且是根节点时禁用
          return data.name === '视角跳转' && node.level === 0;
        }
      },
    };
  },
  created() {
    this.eqid = new URLSearchParams(window.location.search).get('eqid')
    this.eqqueueId = new URLSearchParams(window.location.search).get('eqqueueId')
    // this.thematicMapitems = MapPicUrl.filter(item => item.eqid === this.eqid);
    // console.log(this.thematicMapitems)
    // this.reportItems = ReportUrl.filter(item => item.eqid === this.eqid);

  },
  mounted() {
    this.init()
    this.initModelTable(); // 初始化模型table数据
    this.watchTerrainProviderChanged();
    this.getEqInfo(this.eqid)
    this.getEq()
    this.getPlotwithStartandEndTime(this.eqid)
    this.initPlot(); // 初始化加载应急数据
    // // ---------------------------------------------------
    this.outputData()
    // // 生成实体点击事件的handler
    this.entitiesClickPonpHandler()
    this.handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas); // 初始化
    // this.addSlopeCanvas()
    console.log("thematicMapitems:", this.thematicMapitems);
  },
  beforeUnmount() {
    if (window.viewer) {
      this.clearResource(window.viewer)
      window.viewer = null;
    }
  },
  methods: {
    useTitleStore,

    outputData() {
      handleOutputData(this.eqid, this.eqqueueId, null, 'thematicMap').then((res) => {
        this.thematicMapitems = res.themeData
        console.log("专题图：", this.thematicMapitems,"diowjdwiodjiwjdijwiodjiwdiojdiwjiojdiojwo")
      })
      handleOutputData(this.eqid, this.eqqueueId, null, 'report').then((res) => {
        this.reportItems = res.themeData
        console.log("报告：", this.reportItems)
      })
    },

    // 初始化控件等
    async init() {
      this.isfirst = true
      let viewer = initCesium(Cesium)
      viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息

      viewer.camera.changed.addEventListener(() => {
        const positionCartographic = viewer.camera.positionCartographic
        var height = positionCartographic.height;
        this.updateZoomLevel(height)
        var longitude = Cesium.Math.toDegrees(positionCartographic.longitude);
        var latitude = Cesium.Math.toDegrees(positionCartographic.latitude);
        this.viewCenterCoordinate = {
          lon: longitude,
          lat: latitude
        }
        // console.log(this.viewCenterCoordinate,"this.viewCenterCoordinate thd")
      })
      window.viewer = viewer
      Arrow.disable();
      Arrow.init(viewer);

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
      // 设置相机高度和视角
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(103.00, 29.98, 20000000),//足够高可以看到整个地球
        orientation: {
          // 指向
          heading: 6.283185307179581,
          // 视角
          pitch: -1.5688168484696687,
          roll: 0.0
        }
      });

      let that = this;
      let canvas = viewer.scene.canvas;
      // 具体事件的实现
      let handler = new Cesium.ScreenSpaceEventHandler(canvas);

      console.log("111111");
      handler.setInputAction((movement) => {
        // 使用 pickPosition 获取地球表面的位置
        let cartesian = viewer.scene.pickPosition(movement.position);
        let ray = viewer.camera.getPickRay(movement.position)
        let position = viewer.scene.globe.pick(ray, viewer.scene)
        if (Cesium.defined(cartesian)) {
          // 将笛卡尔三维坐标转为地图坐标（弧度）
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          // 将地图坐标（弧度）转为十进制的度数
          let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
          if (that.ifSlopeAnalyze) {
            let geom = this.cartographicToGeoJSON(cartographic)
            console.log("geom----", geom)
            // 获取地形的海拔高度（米）
            let height = cartographic.height.toFixed(2);
            if (!this.firstClickPosition) {
              this.firstClickPosition = {longitude, latitude}
              console.log("第一个点：", this.firstClickPosition)
              this.drawSite(position)
            } else if (!this.secondClickPosition) {
              this.secondClickPosition = {longitude, latitude}
              console.log("第二个点：", this.secondClickPosition)
              this.drawSite(position)
              // 计算矩形的两个角点并打印
              this.printRectangleCoordinates(this.firstClickPosition, this.secondClickPosition);
              // 重置点击位置
              this.firstClickPosition = null;
              this.secondClickPosition = null;
            }
          }

          // 示例：调用一个自定义方法处理数据
          that.getPopDesity(longitude, latitude);
        } else {
          console.log("未拾取到有效地形点");
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


      this.initWebSocket()
      this.initcesiumPlot()
    },
    initWebSocket() {
      let that = this
      this.websock = initWebSocket(this.eqid)
      this.websock.eqid = this.eqid

      this.websock.onmessage = function (e) {
        console.log("e this.websock.onmessage", e)
        try {
          console.log("从服务器接收到的消息thdtimeline", JSON.parse(e.data))
          //上传表（）
          // if(JSON.parse(e.data).operateType==="excel"){
          //   let
          // }
          // // 标绘点
          // else{
            let markType = JSON.parse(e.data).type
            let markOperate = JSON.parse(e.data).operate // 标绘的（add、delete）
            if (markOperate === "add") {
              if (this.eqid === JSON.parse(e.data).data.plot.earthquakeId) {
                let markData = JSON.parse(e.data).data
                if (!that.isTimerRunning && that.currentTimePosition >= 100) {
                  //标绘点
                  that.wsAddMakerFunc(markType, markData)
                }
                //播放或播放暂停
                else {
                  that.wsaddMakers.push({markType: markType, markData: markData})
                }
              }
            }
            else if (markOperate === "delete") {
              let id = JSON.parse(e.data).id.toString()
              if (!that.isTimerRunning && that.currentTimePosition >= 100) {
                that.wsDeleteMakerFunc(id,markType)
              }
              else{
                that.wsdeleteMakers.push({id: id, markType: markType})
              }
            }
          // }

        } catch (err) {
          console.log(err, 'ws中catch到错误');
        }
      };
    },
    wsAddMakerFunc(type, data) {
      // console.log(data.plot,"data.plot wsadd")
      data.plot.longitude = Number(data.plot.geom.coordinates[0])
      data.plot.latitude = Number(data.plot.geom.coordinates[1]),
          this.plots.push(data.plot)
      this.plotisshow[data.plot.plotId] = 1
      var jumpnode = Math.ceil((new Date() - new Date(this.eqstartTime.getTime())) / (5 * 60 * 1000))
      // console.log(jumpnode,"jumpnode")
      this.timelineAdvancesNumber = jumpnode + 1
      this.jumpNodes[jumpnode] = 1

      this.currentNodeIndex = this.timelineAdvancesNumber
      if (type === "point") {
        cesiumPlot.drawPoints(data.plot, true, 3000);
      }
      else if (type === "polyline") {
        cesiumPlot.getDrawPolyline([data.plot])
      }
      else if (type === "polygon") {
        cesiumPlot.getDrawPolygon([data.plot]);
      }
      else if (type === "arrow") {
        if (data.plot.plotType === "攻击箭头") {
          arrow.showAttackArrow([data.plot])
        } else if (data.plot.plotType === "钳击箭头") {
          arrow.showPincerArrow([data.plot])
        } else if (data.plot.plotType === "直线箭头") {
          arrow.showStraightArrow([data.plot])
        }
      }
    },
    wsDeleteMakerFunc(id,markType){
      this.plotisshow[id] = 0
      if (markType === "point") {
        console.log('1111111111111111111111111111123123')
        cesiumPlot.deletePointById(id);
      }
      else if (markType === "polyline") {
        let polyline = window.viewer.entities.getById(id)
        let polylinePosition = polyline.properties.getValue(Cesium.JulianDate.now())//用getvalue时添加时间是不是用来当日志的？
        polylinePosition.pointPosition.forEach((item, index) => {
          window.viewer.entities.remove(item)
        })
        window.viewer.entities.remove(polyline)
      }
      else if (markType === "polygon") {
        window.viewer.entities.removeById(id)
      }
      else if (markType === "arrow") {
        Arrow.clearById(id)
      }
    },
    initcesiumPlot() {
      let cesiumStore = useCesiumStore()
      cesiumPlot.init(window.viewer, this.websock, cesiumStore)
    },

    cartographicToGeoJSON(cartographic) {
      // 将 Cesium.Cartographic 弧度转换为 GeoJSON 所需的度
      let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
      let lat = Cesium.Math.toDegrees(cartographic.latitude);  // 纬度

      // 返回 GeoJSON 格式的 Point 对象
      return {
        "type": "Point",
        "coordinates": [lon, lat]
      };
    },

    /**
     * 取地震信息+开始结束当前时间初始化
     * @param {string} eqid - 地震ID
     */
    getEqInfo(eqid) {
      getEqListById({id: eqid}).then(res => {
        //震中标绘点
        this.centerPoint = res
        // 设置中心点的标识和时间信息
        this.centerPoint.plotid = "center"
        this.centerPoint.starttime = new Date(res.occurrenceTime)
        this.centerPoint.endtime = new Date(this.centerPoint.starttime.getTime() + 10 * 24 * 36000 * 1000);
        //变量初始化
        this.eqstartTime = this.centerPoint.starttime
        this.eqyear = this.eqstartTime.getFullYear()
        this.eqmonth = this.eqstartTime.getMonth() + 1
        this.eqday = this.eqstartTime.getDate()
        // 计算结束时间 结束时间为开始后72小时，单位为毫秒
        //默认结束时间 方便展示设置成芦山的时间  要改！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
        this.tmpeqendTime = new Date(this.centerPoint.starttime.getTime() + this.timelineAdvancesNumber * 5 * 60 * 1000);
        // 根据当前时间和地震结束时间计算时间线推进数量
        if (this.realTime < this.tmpeqendTime) {
          this.eqendTime = new Date(this.realTime)
          this.timelineAdvancesNumber = ((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (5 * 60 * 1000);
        }
        else {
          this.eqendTime = this.tmpeqendTime
        }
        this.currentTime = this.eqstartTime
        for (let i = 0; i < this.timelineAdvancesNumber; i++) {
          this.jumpNodes[i] = 0;
        }

        // 获取地震数据并更新地图和变量
        this.checkIfOvalCircleLayer();
        this.updateMapandVariablebeforInit()

      })
    },
    /*
    * 更新地图中心视角，更新变量：地震起止时间，渲染点
    * */
    updateMapandVariablebeforInit() {
      this.flyToCenter()
      setTimeout(() => {
        this.flashingCenter()
        setTimeout(() => {
          this.toggleTimer() //模拟播放时间轴
        }, 3000);
      }, 3000);
    },
    /**
     * 根据指定的eqid渲染数据
     * 此方法主要负责针对特定的eqid获取并渲染数据，包括初始化渲染和动态更新数据
     * @param {string} eqid - 需要渲染的数据的唯一标识符
     */
    ifUpdateEndTime(eqid) {
      if (this.realTime < this.tmpeqendTime) {
        //console.log("还在更新的地震")
        // 当实时时间位置为100%且没有定时器运行时，启动定时器
        if (!this.isTimerRunning && this.currentTimePosition === 100) {
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
          let that = this
          //处理websocket的标绘
          // console.log(this.wsaddMakers,"this.wsaddMakers")
          if (this.wsaddMakers.length > 0) {
            this.wsaddMakers.forEach((item) => {
              let markType = item.markType
              let markData = item.markData
              that.wsAdd(markType, markData)
            })
            this.wsaddMakers = []
          }
          if(this.wsdeleteMakers.length>0){
            this.wsdeleteMakers.forEach((item) => {
              let id = item.id
              let markType = item.markType
              that.wsDeleteMakerFunc(id,markType)
            })
            this.wsdeleteMakers = []
          }
        }
      } else {
        //console.log("过去的地震")
      }
    },
    getPlotwithStartandEndTime(eqid) {
      // 调用接口获取特定设备的绘图信息
      getPlotwithStartandEndTime({eqid: eqid}).then(res => {
        // 显示标记，追加新的点 （增）
        //console.log(res, "getPlotwithStartandEndTime")
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
          if (!item.endTime || new Date(item.endTime) < new Date(this.eqstartTime) || new Date(item.endTime) <= new Date(item.startTime)) {
            // 为没有结束时间的点设置默认结束时间
            item.endTime = new Date(this.eqstartTime.getTime() + 20 * 24 * 36000 * 1000);  //20天 错误时间设置结束时间地震发生20天以后
          }
          // if (!item.startTime || new Date(item.startTime) < new Date(this.eqstartTime)) {
          if (!item.startTime) {
            // 为没有开始时间的点设置默认开始时间
            item.startTime = this.eqstartTime;
          }

          var jumpnode1 = Math.ceil((new Date(item.startTime) - new Date(this.eqstartTime)) / (5 * 60 * 1000))//5分钟一个节点
          this.jumpNodes[jumpnode1] = 1
          var jumpnode2 = Math.ceil((new Date(item.endTime) - new Date(this.eqstartTime)) / (5 * 60 * 1000))//5分钟一个节点
          this.jumpNodes[jumpnode2] = 1
        })
        // 更新绘图
        let pointArr = this.plots.filter(e => e.drawtype === 'point')
        this.pointsLayer = [...pointArr]
        //console.log("获取 pointsLayer", this.pointsLayer)
      })
    },
    //控制视角跳转的递归函数
    flyPointsForOneIndex(points) {
      if (this.timelinePopupVisible) {
        this.timelinePopupVisible = false
      }
      let timeEachPoint = 0
      points.forEach((point) => {
        timeEachPoint = timeEachPoint + 3000 / this.currentSpeed  //在选定倍速下每个点闪烁的秒数
        let flytime = (timeEachPoint / 1000 - 1) < 2 ? timeEachPoint : 2
        viewer.scene.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
              parseFloat(point.longitude),
              parseFloat(point.latitude),
              20000),
          orientation: {
            heading: 6.283185307179581,
            pitch: -1.5688168484696687,
            roll: 0.0
          },
          duration: flytime // 飞行动画持续时间（秒）
        });

        if (this.isTimerRunning) {
          setTimeout(() => {
          }, timeEachPoint); // 根据速度计算每个点的延迟时间
        } else {
          return;
        }

      });
    },

    //绘制图层管理的标绘点图层中的标绘点
    updatePlotOnce(type) {
      // 创建一个指向当前上下文的变量，用于在闭包中访问this
      // --------------------------点绘制------------------------------
      // 过滤出绘制类型为点的plots
      let pointArr = this.plots.filter(e => e.drawtype === 'point')
      //console.log("点渲染", pointArr)

      let points = [];

      // 遍历点数组，处理每个点的绘制或删除
      pointArr.forEach(item => {
        // 获取当前时间
        const currentDate = new Date(this.currentTime);
        // 获取点的开始和结束时间
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // //console.log("time", startDate, currentDate, endDate)
        // 如果点应该显示
        // 如果点应该显示
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          // //console.log("item.plotId add", item.plotId)
          this.plotisshow[item.plotId] = 1;

          // 创建点数据
          let point = {
            earthquakeId: item.earthquakeId,
            plotId: item.plotId,
            startTime: item.startTime,
            endTime: item.endTime,
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
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          // //console.log("item.plotId del", item.plotId)
          this.plotisshow[item.plotId] = 0;
          cesiumPlot.deletePointById(item.plotId);
        }
      });
      // 批量渲染点 + 非初始化状态渲染标会点动画
      if (points.length > 0) {
        if (this.timelinePopupShowCenterStrart) {
          this.centerMarkOpacityTo1(); // 取消闪烁，设置中心标记透明度为 1
          clearInterval(this.intervalIdcolor); // 清除闪烁动画定时器
          this.timelinePopupShowCenterStrart = false; // 关闭标记的初始化状态
          this.timelinePopupVisible = false; // 隐藏时间线弹窗
        }


        if (type == false) {
          // 场景：适用于不需要动画的场景，例如静态点的渲染。
          this.stopTimeforAddEntityOneIndex = 5000; // 固定动画时间
          cesiumPlot.drawPoints(points, false, 5000); // 绘制点，无动画
        } else if (type == "3") {
          // 场景：特殊标识的点（例如分类编号为 3 的点）需要默认动画的渲染。
          // //console.log("333 update")
          this.stopTimeforAddEntityOneIndex = 5000; // 固定动画时间
          cesiumPlot.drawPoints(points, true, 5000); // 绘制点，启用动画
        } else {
          this.stopTimeforAddEntityOneIndex = (5000 * points.length) / this.currentSpeed; // 动态计算动画时间
          cesiumPlot.drawPoints(points, true, this.stopTimeforAddEntityOneIndex); // 绘制点，启用动画
          this.flyPointsForOneIndex(points, 0); // 控制点的飞行动画效果
        }
      }
      //--------------------------线绘制------------------------------
      // 根据当前时间和显示状态过滤并更新线条数据
      let polylineArr = this.plots.filter(e => e.drawtype === 'polyline')
      //console.log("polylineArr", polylineArr)

      let filteredPolylineArr = []; // 用于存储符合条件的线条数据

      polylineArr.forEach(item => {
        // //console.log("isshow", this.plotisshow)
        // that.drawPolyline(item)
        const currentDate = new Date(this.currentTime);
        // //console.log(currentDate)
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 检查线条的显示状态和时间范围
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          filteredPolylineArr.push(item); // 收集符合条件的线条
        }
        // 处理线条消失的逻辑
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          viewer.entities.removeById(item.plotId)
          for (let i = 0; i < item.geom.coordinates.length; i++) {
            viewer.entities.removeById(item.plotId + 'point' + (i + 1))
          }
        }

      })
      if (filteredPolylineArr.length > 0) {
        cesiumPlot.getDrawPolyline(filteredPolylineArr)
        console.log(filteredPolylineArr, "filteredPolylineArr")
        viewer.scene.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
              parseFloat(filteredPolylineArr[0].geom.coordinates[0][0]),
              parseFloat(filteredPolylineArr[0].geom.coordinates[0][1]),
              30000),
          orientation: {
            // 指向
            heading: 6.283185307179581,
            // 视角
            pitch: -1.5688168484696687,
            roll: 0.0
          },
          duration: 3 // 飞行动画持续时间（秒）
        });
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
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          viewer.entities.removeById(item.plotId)
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

      // 遍历分组后的多边形数据，调用绘制多边形的函数进行渲染
      Object.keys(polygonMap).forEach(plotId => {
        let polygonData = polygonMap[plotId];
        cesiumPlot.getDrawPolygon(polygonData)
      });

      //--------------------------箭头绘制------------------------------
      let straightArrShow = []
      let straightArr = this.plots.filter(e => e.drawtype === 'straight');
      straightArr.forEach(item => {
        // 获取当前时间、多边形的开始时间和结束时间
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 如果当前时间在多边形的开始和结束时间内，且多边形未显示，则添加到显示列表
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          // Arrow.showStraightArrow(item)
          straightArrShow.push(item);// 收集符合条件的面
        }
        // 如果当前时间不在多边形的开始和结束时间内，且多边形正在显示，则从显示列表移除并删除实体
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          Arrow.clearById(item.plotId)
        }
      })
      if (straightArrShow.length > 0) {
        Arrow.showStraightArrow(straightArrShow)
      }

      let attackArrShow = []
      let attackArr = this.plots.filter(e => e.drawtype === 'attack');
      attackArr.forEach(item => {
        // 获取当前时间、多边形的开始时间和结束时间
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 如果当前时间在多边形的开始和结束时间内，且多边形未显示，则添加到显示列表
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          // Arrow.showStraightArrow(item)
          attackArrShow.push(item);// 收集符合条件的面
        }
        // 如果当前时间不在多边形的开始和结束时间内，且多边形正在显示，则从显示列表移除并删除实体
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          Arrow.clearById(item.plotId)
        }
      })
      if (attackArrShow.length > 0) {
        Arrow.showAttackArrow(attackArr)
      }


      let pincerArrShow = []
      let pincerArr = this.plots.filter(e => e.drawtype === 'pincer');
      pincerArr.forEach(item => {
        // 获取当前时间、多边形的开始时间和结束时间
        const currentDate = new Date(this.currentTime);
        const startDate = new Date(item.startTime);
        const endDate = new Date(item.endTime);
        // 如果当前时间在多边形的开始和结束时间内，且多边形未显示，则添加到显示列表
        if (startDate <= currentDate && endDate >= currentDate && this.plotisshow[item.plotId] === 0) {
          this.plotisshow[item.plotId] = 1
          // Arrow.showStraightArrow(item)
          pincerArrShow.push(item);// 收集符合条件的面
        }
        // 如果当前时间不在多边形的开始和结束时间内，且多边形正在显示，则从显示列表移除并删除实体
        if ((endDate < currentDate || startDate > currentDate) && this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          Arrow.clearById(item.plotId)
        }
      })
      if (pincerArrShow.length > 0) {
        Arrow.showPincerArrow(pincerArr)
      }
    },


    // ------------------------------坡面分析---------------------------
    // 绘制点
    drawSite(clickedPoint) {
      if (window.viewer) {
        window.viewer.entities.add({
          position: clickedPoint,
          point: {
            pixelSize: 10,
            color: Cesium.Color.RED,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度
            depthTest: false, // 禁止深度测试
            disableDepthTestDistance: Number.POSITIVE_INFINITY // 不再进行深度测试
          },
        });
      }
    },
    // 计算矩形的四个角点
    printRectangleCoordinates(firstPoint, secondPoint) {
      const minLon = Math.min(firstPoint.longitude, secondPoint.longitude);
      const maxLon = Math.max(firstPoint.longitude, secondPoint.longitude);
      const minLat = Math.min(firstPoint.latitude, secondPoint.latitude);
      const maxLat = Math.max(firstPoint.latitude, secondPoint.latitude);

      this.addSlopeCanvas(minLon, maxLon, minLat, maxLat)
    },
    // 坡面分析
    // addSlopeCanvas(){
    addSlopeCanvas(minLon, maxLon, minLat, maxLat) {
      // 测试区域
      // const extent = turf.square([100.64, 28.22, 100.69, 28.27]);
      // const extent = turf.square([minLon, minLat, maxLon, maxLat]);
      const extent = [minLon, minLat, maxLon, maxLat]
      // const extent = [102.94, 30.37, 102.99, 30.42]
      // 获取包围盒坐标
      const polygonPos = turf.getCoord(extent);
      // const polygonPos = [minLon, minLat, maxLon, maxLat];
      this.polygonPos = polygonPos;

      const rectangle = Rectangle.fromDegrees(...polygonPos);
      // //console.log("----------",rectangle)
      const width = 20; // 横向点数
      const height = 20; // 纵向点数
      const positions = [];

      // 格网度数
      const dx = (polygonPos[2] - polygonPos[0]) / width;
      const dy = (polygonPos[3] - polygonPos[1]) / height;

      // 格网距离
      const ddx =
          Cartesian3.distance(
              Cartesian3.fromDegrees(polygonPos[0], polygonPos[1]),
              Cartesian3.fromDegrees(polygonPos[2], polygonPos[1])
          ) / width;
      const ddy =
          Cartesian3.distance(
              Cartesian3.fromDegrees(polygonPos[0], polygonPos[1]),
              Cartesian3.fromDegrees(polygonPos[0], polygonPos[3])
          ) / height;

      //console.log("111111")
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const longitude = CesiumMath.toDegrees(
              CesiumMath.lerp(rectangle.west, rectangle.east, x / (width - 1))
          );
          const latitude = CesiumMath.toDegrees(
              CesiumMath.lerp(rectangle.north, rectangle.south, y / (height - 1))
          );

          // 八连通点
          positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude)); // w
          positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude - dy / 2)); // ws
          positions.push(Cartographic.fromDegrees(longitude, latitude + dy / 2)); // n
          positions.push(Cartographic.fromDegrees(longitude - dx / 2, latitude + dy / 2)); // wn
          positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude)); // e
          positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude + dy / 2)); // en
          positions.push(Cartographic.fromDegrees(longitude, latitude - dy / 2)); // s
          positions.push(Cartographic.fromDegrees(longitude + dx / 2, latitude - dy / 2)); // es

          // 顶点
          positions.push(Cartographic.fromDegrees(longitude, latitude)); // mid
        }
      }

      //console.log("222222")
      const slopes = [];
      const fxValues = [];
      const fyValues = [];

      // 创建等值线区域
      // let extent = [120, 30, 120.1, 30.1];
      let heightArr = [];
      // 等高线生成效果与控制点是否精细有关
      let pointGrid = turf.pointGrid(extent, 0.001, {
        units: "degrees",
      });

      // //console.log(pointGrid.features, "pointGrid.features");
      for (let i = 0; i < pointGrid.features.length; i++) {
        heightArr.push(
            Cesium.Cartographic.fromDegrees(
                pointGrid.features[i].geometry.coordinates[0],
                pointGrid.features[i].geometry.coordinates[1]
            )
        );
      }

      // //console.log(window.viewer.terrainProvider)
      setTimeout(() => {
        // //console.log(viewer._cesiumWidget.terrainProvider,viewer.terrainProvider)
        // sampleTerrainMostDetailed(viewer._cesiumWidget.terrainProvider, positions).then((updatedPositions) => {

        let arr = positions.concat(heightArr)
        sampleTerrainMostDetailed(viewer._cesiumWidget.terrainProvider, arr).then((updatedPositions) => {
          let slopes = [];
          let fxValues = [];
          let fyValues = [];
          let heightArr = [];
          let testArr = [];
          let breaks = [];

          // 遍历 positions 部分，计算坡度和方向
          for (let i = 0; i < updatedPositions.length; i += 9) {
            if (i + 8 >= updatedPositions.length) break; // 防止越界

            const westHeight = updatedPositions[i + 0].height;
            const westSouthHeight = updatedPositions[i + 1].height;
            const northHeight = updatedPositions[i + 2].height;
            const westNorthHeight = updatedPositions[i + 3].height;
            const eastHeight = updatedPositions[i + 4].height;
            const eastNorthHeight = updatedPositions[i + 5].height;
            const southHeight = updatedPositions[i + 6].height;
            const eastSouthHeight = updatedPositions[i + 7].height;

            const fx =
                (westSouthHeight +
                    2 * southHeight +
                    eastSouthHeight -
                    (westNorthHeight + 2 * northHeight + eastNorthHeight)) /
                (8 * ddx);
            const fy =
                (eastNorthHeight +
                    2 * eastHeight +
                    eastSouthHeight -
                    (westNorthHeight + 2 * westHeight + westSouthHeight)) /
                (8 * ddy);

            const slope = Math.atan(Math.sqrt(fx ** 2 + fy ** 2));
            slopes.push(slope);
            fxValues.push(fx);
            fyValues.push(fy);
          }

          // 更新材质（假设 createMaterial 是用户自定义的函数）
          //console.log("Slope calculations complete");
          this.slopes = slopes;
          this.fxValues = fxValues;
          this.fyValues = fyValues;
          this.createMaterial();

          // 创建 pointGrid 并计算等高线
          let pointGrid = turf.pointGrid(extent, 0.001, {units: "degrees"});
          for (let i = positions.length; i < updatedPositions.length; i++) {
            heightArr.push(updatedPositions[i]); // 收集剩余位置的高度数据
          }

          // 将高度数据更新到 pointGrid
          for (let i = 0; i < pointGrid.features.length; i++) {
            pointGrid.features[i].properties.height = heightArr[i]?.height || 0;
            testArr.push(heightArr[i]?.height || 0);
          }

          // 计算 breaks
          testArr.sort((a, b) => a - b);
          let minHeight = testArr[0];
          let maxHeight = testArr[testArr.length - 1];
          let step = (maxHeight - minHeight) / 10;
          for (let i = 0; i < 10; i++) {
            breaks.push(minHeight + i * step);
          }

          // 使用 turf.js 生成等高线
          let lines = turf.isolines(pointGrid, breaks, {zProperty: "height"});

          // 平滑等高线
          lines.features.forEach((feature) => {
            let coords = feature.geometry.coordinates;
            let lineCoords = [];
            coords.forEach((coord) => {
              let line = turf.lineString(coord);
              let curve = turf.bezierSpline(line);
              lineCoords.push(curve.geometry.coordinates);
            });
            feature.geometry.coordinates = lineCoords;
          });

          // 加载等高线到 Cesium
          Cesium.GeoJsonDataSource.load(lines, {
            stroke: Cesium.Color.RED,
            strokeWidth: 3,
            fill: Cesium.Color.RED,
            extruded: true,
            clampToGround: true,
          })
              .then((contourSource) => {
                window.viewer.dataSources.add(contourSource);
                //console.log("Contour lines added successfully");
              })
              .catch((error) => {
                console.error("Error loading GeoJSON data:", error);
              });
        });

      }, 5000)

    },
    // 添加坡面实体
    createMaterial() {
      // //console.log('坡度计算完成，材质生成逻辑在此实现');
      const canvas = this.toCanvas();
      // //console.log("this.slopes-------------",this.slopes)
      //console.log("666666")
      const positions = [
        Cartesian3.fromDegrees(this.polygonPos[0], this.polygonPos[1]),
        Cartesian3.fromDegrees(this.polygonPos[0], this.polygonPos[3]),
        Cartesian3.fromDegrees(this.polygonPos[2], this.polygonPos[3]),
        Cartesian3.fromDegrees(this.polygonPos[2], this.polygonPos[1]),
      ];
      window.viewer.entities.add({
        polygon: {
          hierarchy: new PolygonHierarchy(positions),
          material: new Cesium.ImageMaterialProperty({
            image: canvas,
          }),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,// 绑定到地形高度,让billboard贴地
          depthTest: false,//禁止深度测试但是没有下面那句有用
          disableDepthTestDistance: Number.POSITIVE_INFINITY,//不再进行深度测试（真神）
          classificationType: ClassificationType.BOTH,
        },
      });

      this.ifSlopeAnalyze = false

      //console.log("7777777")
      const position = Cesium.Cartesian3.fromDegrees(
          100.69,
          28.22,
          50000
      );
      // viewer.camera.flyTo({destination: position,})
    },
    // 设置坡面箭头、等高线材质
    toCanvas() {
      //console.log("444444");
      const w = 20;
      const h = 20;
      const canvas = document.createElement("canvas");
      canvas.width = 2000; // 放大画布以便观察
      canvas.height = 2000;
      this.totalCells = w * h;
      const ctx = canvas.getContext("2d");
      const cellSize = canvas.width / w;

      this.slopeCounts = [0, 0, 0, 0, 0];
      const bitmap = new Uint8ClampedArray(w * h * 4); // 每像素 RGBA

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const slopeIndex = y * w + x;
          const slope = this.slopes[slopeIndex];
          const fx = this.fxValues[slopeIndex]; // x方向坡度分量
          const fy = this.fyValues[slopeIndex]; // y方向坡度分量

          let color;
          let rangeIndex;

          // 根据坡度范围分配颜色
          if (slope < Math.PI / 18) {
            rangeIndex = 0;
            color = Color.fromCssColorString("#00FF00").withAlpha(0.4); // 浅绿色，透明度增大
          } else if (slope < Math.PI / 12) {
            rangeIndex = 1;
            color = Color.fromCssColorString("#FFFF00").withAlpha(0.4); // 黄色，透明度增大
          } else if (slope < Math.PI / 6) {
            rangeIndex = 2;
            color = Color.fromCssColorString("#FFCC00").withAlpha(0.4); // 橙色，透明度增大
          } else if (slope < Math.PI / 4) {
            rangeIndex = 3;
            color = Color.fromCssColorString("#FF7F00").withAlpha(0.4); // 橘红色，透明度增大
          } else {
            rangeIndex = 4;
            color = Color.fromCssColorString("#FF0000").withAlpha(0.4); // 红色，透明度增大
          }
          this.slopeCounts[rangeIndex]++;

          // 绘制背景颜色
          ctx.fillStyle = color.toCssColorString();
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);


          // 绘制箭头：主线加箭头头部
          const centerX = x * cellSize + cellSize / 2;
          const centerY = y * cellSize + cellSize / 2;

          const arrowLength = cellSize / 2; // 调整箭头长度
          let norm = Math.sqrt(fx ** 2 + fy ** 2) || 1; // 防止除以 0

          if (fx * fy > 0) {
            norm = -norm
          }

          const directionX = fx / norm; // 反方向，确保箭头指向下坡
          const directionY = fy / norm;

          // 起点和终点的偏移量
          const offsetX = directionX * arrowLength * 0.5;
          const offsetY = directionY * arrowLength * 0.5;

          const startX = centerX - offsetX;
          const startY = centerY - offsetY;
          const endX = centerX + offsetX;
          const endY = centerY + offsetY;

          // 绘制箭头主线
          ctx.strokeStyle = "yellow"; // 箭头为黄色
          ctx.lineWidth = 5; // 增加箭头线条宽度
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // 绘制箭头头部（三角形）
          const arrowHeadSize = 10; // 调整箭头头部大小
          const headX1 = endX - arrowHeadSize * (directionX - directionY);
          const headY1 = endY - arrowHeadSize * (directionY + directionX);
          const headX2 = endX - arrowHeadSize * (directionX + directionY);
          const headY2 = endY - arrowHeadSize * (directionY - directionX);

          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(headX1, headY1);
          ctx.lineTo(headX2, headY2);
          ctx.closePath();
          ctx.fillStyle = "yellow"; // 箭头头部为黄色
          ctx.fill();
        }
      }

      const slopeRatios = this.slopeCounts.map(count => (count / this.totalCells * 100).toFixed(2) + "%");
      //console.log("坡度范围比例：", slopeRatios);
      this.slopeStatistics[0].proportion = slopeRatios[0];
      this.slopeStatistics[1].proportion = slopeRatios[1];
      this.slopeStatistics[2].proportion = slopeRatios[2];
      this.slopeStatistics[3].proportion = slopeRatios[3];
      this.slopeStatistics[4].proportion = slopeRatios[4];

      const imageData = new ImageData(bitmap, w, h);
      ctx.putImageData(imageData, 0, 0); // 直接覆盖
      //console.log("555555");
      return canvas;
    },
    // ------------------------------坡面分析结束---------------------------

    // ------------------------------距离量算---------------------------
    // 画线
    drawN() {
      this.ifDistanceMeasure = true
      if (this.ifDistanceMeasure) {
        let result = cesiumPlot.drawActivatePolyline("量算")
        //console.log("量算-----结果1：",result)
        this.ifDistanceMeasure = false
      }
    },
    // ------------------------------路径规划+物资匹配---------------------------
    handleEqListChange() {
      if (this.eqlistName) {
        getEqListById({'id': this.eqlistName}).then(async res => {
          window.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(parseFloat(res.longitude), parseFloat(res.latitude), 40000),
            orientation: {
              // 指向
              heading: 6.283185307179581,
              // 视角
              pitch: -1.5688168484696687,
              roll: 0.0
            }
          });

          window.viewer.entities.removeAll();
          let result = []
          let longitude = parseFloat(res.longitude);
          let latitude = parseFloat(res.latitude);
          const clickPoint = Cesium.Cartesian3.fromDegrees(longitude, latitude);
          this.all.forEach((item) => {
            item.forEach((point) => {
              const pointLongitude = parseFloat(point.longitude);
              const pointLatitude = parseFloat(point.latitude);
              const initialPoint = Cesium.Cartesian3.fromDegrees(
                  pointLongitude,
                  pointLatitude
              );
              // 距离以公里为单位
              const distance = Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000;
              if (distance < 10) {
                result.push(point);
              }
            })
          });
          let reservesArr = []
          let suppliesArr = []
          let emergencyTeamArr = []
          result.forEach((item) => {
            if (item.type === "reserves") {
              reservesArr.push(item);
            } else if (item.type === "supplies") {
              suppliesArr.push(item);
            } else if (item.type === "emergency") {
              emergencyTeamArr.push(item);
            }
          });

          this.processPoints(suppliesArr, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
          this.processPoints(reservesArr, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
          this.processPoints(emergencyTeamArr, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");

          //  画圆
          const position = Cesium.Cartesian3.fromDegrees(
              parseFloat(res.longitude),
              parseFloat(res.latitude)
          );
          viewer.entities.values.forEach((entity) => {
            if (entity.ellipse) {
              viewer.entities.remove(entity);
            }
          });
          viewer.entities.add({
            position: position,
            ellipse: {
              semiMajorAxis: parseFloat("10") * 1000,
              semiMinorAxis: parseFloat("10") * 1000,
              material: Cesium.Color.GREEN.withAlpha(0.4),
            },
          });
          viewer.entities.add({
            position: position,
            ellipse: {
              semiMajorAxis: parseFloat("5") * 1000,
              semiMinorAxis: parseFloat("5") * 1000,
              material: Cesium.Color.GREEN.withAlpha(0.7),
            },
          });
          viewer.entities.add({
            position: position,
            billboard: {
              image: centerstar,
              width: 60,
              height: 60,
              scaleByDistance: new Cesium.NearFarScalar(500, 1, 5e5, 0.1), // 近大远小
              disableDepthTestDistance: Number.POSITIVE_INFINITY // 确保 billboard 不被遮挡
            },
            label: {
              text: res.earthquakeName + parseFloat(res.magnitude).toFixed(1) + "级",
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
            id: res.plotid,
            plottype: "震中",
            layer: "标绘点"
          });
        })
      }
    },
    getEarthquake() {
      getExcelUploadEarthquake().then(res => {
        if (res.data === null) {
          ElMessage.error("地震列表无数据")
        }
        this.tableNameOptions = res.map(file => {
              const eqid = file.split(' - ')[0]?.trim();
              const details = file.split(' - ')[1]?.trim();
              // 提取 `-` 后面的部分
              return {
                label: details, // 使用提取的部分作为标签
                value: eqid// 选择值为 ID
              }
            }
        )
      })
    },
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
    // 导航栏按钮
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
    /** 计算两个坐标的距离，单位米 **/
    Distance(lng1, lat1, lng2, lat2) {
      //采用Haversine formula算法，高德地图的js计算代码，比较简洁 https://www.cnblogs.com/ggz19/p/7551088.html
      let d = Math.PI / 180;
      let f = lat1 * d,
          h = lat2 * d;
      let i = lng2 * d - lng1 * d;
      let e =
          (1 - Math.cos(h - f) + (1 - Math.cos(i)) * Math.cos(f) * Math.cos(h)) /
          2;
      return 2 * 6378137 * Math.asin(Math.sqrt(e));
    },
    sortedSuppliesList() {
      // 按照 tents 排序
      this.showSuppliesList = this.showSuppliesList
          .slice()
          .sort((a, b) => b.tents - a.tents);
    },
    toggleTable() {

      if (!this.panels.tableVisible) {
        for (let key in this.panels) {
          if (this.panels.hasOwnProperty(key)) {
            this.panels[key] = false;
          }
        }
      }

      this.panels.tableVisible = !this.panels.tableVisible;
      this.toolValue = this.panels.tableVisible ? "隐藏列表" : "显示列表";

    },
    toggleRoute() {
      this.showTips = !this.showTips;
      this.routeValue = this.showTips ? "隐藏路径规划" : "显示路径规划";
    },


    // init() {
    //     let that = this;
    //     let viewer = initCesium(Cesium);
    //     viewer._cesiumWidget._creditContainer.style.display = "none"; // 隐藏版权信息
    //     window.viewer = viewer;
    //     let options = {};
    //     options.defaultResetView = Cesium.Cartographic.fromDegrees(
    //         103.0,
    //         29.98,
    //         1500,
    //         new Cesium.Cartographic()
    //     );
    //     options.enableCompass = true;
    //     options.enableZoomControls = true;
    //     options.enableDistanceLegend = true;
    //     options.enableCompassOuterRing = true;
    //     options.resetTooltip = "重置视图";
    //     options.zoomInTooltip = "放大";
    //     options.zoomOutTooltip = "缩小";
    //     window.navigation = new CesiumNavigation(viewer, options);
    //     document.getElementsByClassName("cesium-geocoder-input")[0].placeholder =
    //         "请输入地名进行搜索";
    //     document.getElementsByClassName(
    //         "cesium-baseLayerPicker-sectionTitle"
    //     )[0].innerHTML = "影像服务";
    //     document.getElementsByClassName(
    //         "cesium-baseLayerPicker-sectionTitle"
    //     )[1].innerHTML = "地形服务";
    //
    //     this.clickCount += 1;
    //
    //     const ellipsoid = viewer.scene.globe.ellipsoid;
    //     const canvas = viewer.scene.canvas;
    //     const handler = new Cesium.ScreenSpaceEventHandler(canvas);
    //
    //     let token = "34d101b55f6166c49c42aed5a7ed345c";
    //     viewer.imageryLayers.addImageryProvider(
    //         new Cesium.WebMapTileServiceImageryProvider({
    //             url:
    //                 "http://59.255.48.160:81/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
    //                 token,
    //             layer: "tdtAnnoLayer",
    //             style: "default",
    //             format: "image/jpeg",
    //             tileMatrixSetID: "GoogleMapsCompatible",
    //         })
    //     );
    //     //影像注记
    //     viewer.imageryLayers.addImageryProvider(
    //         new Cesium.WebMapTileServiceImageryProvider({
    //             url:
    //                 "http://59.255.48.160:81/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" +
    //                 token,
    //             layer: "tdtAnnoLayer",
    //             style: "default",
    //             format: "image/jpeg",
    //             tileMatrixSetID: "GoogleMapsCompatible",
    //             show: false,
    //         })
    //     );
    //
    //     handler.setInputAction((movement) => {
    //         const cartesian = viewer.camera.pickEllipsoid(
    //             movement.position,
    //             ellipsoid
    //         );
    //         if (cartesian) {
    //             const cartographic = ellipsoid.cartesianToCartographic(cartesian);
    //             this.addSupplyPointCurrently.lat = Cesium.Math.toDegrees(
    //                 cartographic.latitude
    //             ).toFixed(5);
    //             this.addSupplyPointCurrently.lng = Cesium.Math.toDegrees(
    //                 cartographic.longitude
    //             ).toFixed(5);
    //
    //             if (this.canMarkPoint) {
    //                 this.DialogFormVisible = true;
    //                 this.drawSite(
    //                     this.addSupplyPointCurrently.lat,
    //                     this.addSupplyPointCurrently.lng,
    //                     this.clickCount,
    //                     Cesium.Color.RED
    //                 );
    //                 // console.log("已添加标注点");
    //                 this.canMarkPoint = false;
    //             }
    //         }
    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // },

    // initPlot() {
    //
    //     getEmergency().then(res => {
    //         let {emergencyRescueEquipment, disasterReliefSupplies, rescueTeamsInfo} = res;
    //         console.log('获取到的res', res);
    //
    //         this.supplyList = disasterReliefSupplies
    //         this.all.push(disasterReliefSupplies, emergencyRescueEquipment, rescueTeamsInfo)
    //         this.suppliesList.push(disasterReliefSupplies, emergencyRescueEquipment, rescueTeamsInfo);
    //
    //         // 调用 `processPoints` 并传递不同的 `tableName`
    //         this.processPoints(emergencyRescueEquipment, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
    //         this.processPoints(disasterReliefSupplies, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
    //         this.processPoints(rescueTeamsInfo, 'emergencyTeam', rescueTeamsInfoLogo, "应急救援力量");
    //
    //         // this.fetSupplyPoints();
    //         this.listField = 'supplies'
    //         this.selectedSuppliesList = this.suppliesList[0]
    //         this.showIcon = this.selectedSuppliesList;
    //         this.total = this.selectedSuppliesList.length;
    //         this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    //     });
    // },

    // processPoints(pointArr, type, icon, tableName) {
    //     if (!Array.isArray(pointArr)) {
    //         console.error(`${tableName} 数据格式不正确`, pointArr);
    //         return;
    //     }
    //
    //     pointArr = pointArr.filter(e => e.longitude !== null);
    //
    //     pointArr.forEach(element => {
    //         // 检查是否已存在具有相同ID的实体
    //         let existingEntity = window.viewer.entities.getById(element.uuid);
    //         if (existingEntity) {
    //             console.warn(`id为${element.uuid}的实体已存在。跳过此实体`);
    //             return;
    //         }
    //         // 检查经度、纬度和高度是否为有效数值
    //         if (isNaN(element.longitude) || isNaN(element.latitude)
    //             || element.longitude < -180 || element.longitude > 180
    //             || element.latitude < -90 || element.latitude > 90) {
    //             console.log(`id为${element.uuid}的实体的坐标无效或超出范围`, element.longitude, element.latitude);
    //             return;
    //         }
    //         let longitude = Number(element.longitude);
    //         let latitude = Number(element.latitude);
    //
    //         element.type = type;
    //         element.icon = icon
    //
    //         let bool = type === 'supplies' ? true : false
    //
    //         // 添加实体
    //         this.addEntity(element, icon, tableName, longitude, latitude, bool);
    //     });
    // },

    // addEntity(element, icon, tableName, longitude, latitude, bool) {
    //     window.viewer.entities.add({
    //         uuid: element.uuid,
    //         position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    //         billboard: {
    //             image: icon,
    //             width: 40,
    //             height: 40,
    //             eyeOffset: new Cesium.Cartesian3(0, 0, 0),
    //             color: Cesium.Color.WHITE.withAlpha(1),
    //             scale: 0.8,
    //             heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 禁用，导致图标在高度计算或与地形交互时出现闪烁。 原作用：绑定到地形高度,让billboard贴地
    //             depthTest: bool ? true : false, // 让 Cesium 正确处理图标的遮挡关系
    //             disableDepthTestDistance: Number.POSITIVE_INFINITY
    //         },
    //         properties: {
    //             tableName: tableName, // 动态传入的表名称
    //             ...element, // 将element对象展开，自动填充所有属性
    //             longitude: element.longitude,
    //             latitude: element.latitude
    //         }
    //     });
    // },

    // isTerrainLoaded() {
    //     let terrainProvider = window.viewer.terrainProvider;
    //     if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
    //         // console.log("地形未加载")
    //         return false;
    //     } else if (Cesium.defined(terrainProvider)) {
    //         // 如果terrainProvider已定义，但不是EllipsoidTerrainProvider，
    //         // 则表示已经设置了其他地形提供者
    //         // console.log("地形已加载")
    //         return true;
    //     }
    //     // console.log("地形未加载")
    //     return false;
    // },

    // entitiesClickPonpHandler() {
    //     let that = this;
    //     // 处理点击事件
    //     window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
    //         // 获取点击位置的实体
    //         let pickedEntity = window.viewer.scene.pick(click.position);
    //         window.selectedEntity = pickedEntity?.id;
    //
    //         if (Cesium.defined(pickedEntity)) {
    //             let entity = window.selectedEntity;
    //
    //             // 判断实体类型并处理
    //             if (entity._billboard) {
    //                 // 获取点击点的经纬度
    //                 let ray = viewer.camera.getPickRay(click.position);
    //                 let position = viewer.scene.globe.pick(ray, viewer.scene);
    //                 let cartographic = Cesium.Cartographic.fromCartesian(position);
    //                 let latitude = Cesium.Math.toDegrees(cartographic.latitude);
    //                 let longitude = Cesium.Math.toDegrees(cartographic.longitude);
    //
    //                 // 如果有地形加载，更新高度
    //                 let height = 0;
    //                 if (this.isTerrainLoaded()) {
    //                     height = viewer.scene.globe.getHeight(cartographic);
    //                 }
    //
    //                 // 更新弹窗位置
    //                 that.selectedEntityHighDiy = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    //
    //                 // that.popupData = entity.properties;
    //
    //                 // 解析 properties 以获取实际的数据
    //                 let properties = {};
    //                 entity.properties.propertyNames.forEach(name => {
    //                     properties[name] = entity.properties[name].getValue();
    //                 });
    //                 that.popupData = properties;
    //                 console.log("entity.properties作为弹窗数据:", that.popupData);
    //
    //                 this.popupVisible = true;
    //                 this.updatePopupPosition();
    //             } else {
    //                 this.popupVisible = false;
    //             }
    //
    //             // 处理面实体
    //             if (entity._polygon) {
    //                 that.showPolygon = true;
    //             } else {
    //                 that.showPolygon = false;
    //             }
    //
    //             // 处理线实体
    //             if (entity._polyline) {
    //                 let status = cesiumPlot.drawPolylineStatus();
    //                 that.showPolyline = (status === 0);
    //             } else {
    //                 that.showPolyline = false;
    //             }
    //         } else {
    //             this.popupVisible = false;
    //         }
    //
    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //
    //     // 确保在地图拖动时弹窗位置更新
    //     window.viewer.screenSpaceEventHandler.setInputAction(movement => {
    //         if (that.popupVisible && window.selectedEntity) {
    //             that.updatePopupPosition();
    //         }
    //     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // },

    //--------------------弹窗----------------------
    // 判断是否有高程
    // 更新弹窗的位置
    // updatePopupPosition() {
    //     // 笛卡尔3转笛卡尔2（屏幕坐标）
    //     const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
    //         window.viewer.scene,
    //         this.selectedEntityHighDiy
    //     );
    //     if (canvasPosition) {
    //         this.popupPosition = {
    //             x: canvasPosition.x, //+ 20,
    //             y: canvasPosition.y, //- 60 // 假设弹窗应该在图标上方 50px 的位置
    //         };
    //     }
    // },

    //-----------附近资源快速匹配----------
    //-----------行政区划匹配-------------

    // 行政区划匹配dialog选中函数
    selectRegions(district) {
      const index = this.selectedRegions.indexOf(district);
      if (index === -1) {
        this.selectedRegions = []
        this.selectedRegions.push(district); // 添加选中
      } else {
        this.selectedRegions.splice(index, 1); // 取消选中
      }
    },

    // removethdRegions() {
    //     // 检查是否存在名为regionLayerJump的图层
    //     if (window.regionLayerJump) {
    //         // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
    //         window.viewer.dataSources.remove(window.regionLayerJump, true);
    //         // 清空regionLayerJump的引用，以便垃圾回收
    //         window.regionLayerJump = null;
    //
    //
    //         // console.log("图层已移除");
    //     }
    //     // this.isShowYaanRegionLegend = false;
    //     // 获取图例容器，准备清空其内容
    //     // const legend = document.getElementById('legend');
    //     // 循环移除图例容器中的所有子元素
    //     // while (legend.firstChild) {
    //     //     legend.removeChild(legend.firstChild);
    //     // }
    //     // 遍历标签数组，移除每个标签实体
    //     this.labels.forEach(label => {
    //         window.viewer.entities.remove(label);
    //     });
    //     // 清空标签引用数组，以便垃圾回收
    //     this.labels = [];
    // },

    // removethdRegions() {
    //     // 检查是否存在名为regionLayerJump的图层
    //     if (window.regionLayerJump) {
    //         // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
    //         window.viewer.dataSources.remove(window.regionLayerJump, true);
    //         // 清空regionLayerJump的引用，以便垃圾回收
    //         window.regionLayerJump = null;
    //
    //
    //         // console.log("图层已移除");
    //     }
    //     // this.isShowYaanRegionLegend = false;
    //     // 获取图例容器，准备清空其内容
    //     // const legend = document.getElementById('legend');
    //     // 循环移除图例容器中的所有子元素
    //     // while (legend.firstChild) {
    //     //     legend.removeChild(legend.firstChild);
    //     // }
    //     // 遍历标签数组，移除每个标签实体
    //     this.labels.forEach(label => {
    //         window.viewer.entities.remove(label);
    //     });
    //     // 清空标签引用数组，以便垃圾回收
    //     this.labels = [];
    // },

    // removeDataSourcesLayer(layerName) {
    //     // 通过图层名称获取数据源对象如果存在，则执行移除操作
    //     const dataSource = window.viewer.dataSources.getByName(layerName)[0];
    //     if (dataSource) {
    //         window.viewer.dataSources.remove(dataSource);
    //     }
    // },

    // 切换数据列表
    changeDataList(param) {
      this.selectedSuppliesList = []
      let flag = Object.keys(this.selectedDataByRegions).length === 0 ? false : true

      if (param === 'supplies') {
        this.listField = 'supplies'
        this.selectedSuppliesList = flag ? this.selectedDataByRegions.suppliesArr : this.suppliesList[0]
      } else if (param === 'emergencyTeam') {
        this.listField = 'emergencyTeam'
        this.selectedSuppliesList = flag ? this.selectedDataByRegions.emergencyTeamArr : this.suppliesList[2]
      } else {
        this.listField = 'reserves'
        this.selectedSuppliesList = flag ? this.selectedDataByRegions.reservesArr : this.suppliesList[1]
      }
      this.showIcon = this.selectedSuppliesList;
      this.total = this.selectedSuppliesList.length;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    },
    // changeDataList(param) {
    //     console.log("11111111111111111")
    //     this.selectedSuppliesList = []
    //     let flag1 = Object.keys(this.selectedDataByRegions).length === 0 ? false : true
    //     let flag2 = Object.keys(this.selectedDataByRadius).length === 0 ? false : true
    //     let flag3 = Object.keys(this.selectedDataBySupplies).length === 0 ? false : true
    //     let array
    //
    //     if(flag1){
    //         array = 'selectedDataByRegions'
    //     }else if(flag2){
    //         array = 'selectedDataByRadius'
    //     }else if(flag3){
    //         array = 'selectedDataBySupplies'
    //     }
    //     if (param === 'supplies') {
    //         this.listField = 'supplies'
    //         // this.selectedSuppliesList = flag ? this.selectedDataByRegions.suppliesArr : this.suppliesList[0]
    //         this.selectedSuppliesList = (flag1 || flag2 || flag3) === true ? this[array].supplies : this.suppliesList[0]
    //         // this.selectedSuppliesList = this[array].suppliesArr
    //     } else if (param === 'emergencyTeam') {
    //         this.listField = 'emergencyTeam'
    //         // this.selectedSuppliesList = flag ? this.selectedDataByRegions.emergencyTeamArr : this.suppliesList[2]
    //         //   this.selectedSuppliesList = this[array].emergencyTeamArr
    //         this.selectedSuppliesList = (flag1 || flag2 || flag3) === true ? this[array].emergencyTeam : this.suppliesList[2]
    //     } else {
    //         this.listField = 'reserves'
    //         // this.selectedSuppliesList = flag ? this.selectedDataByRegions.reservesArr : this.suppliesList[1]
    //         //   this.selectedSuppliesList = this[array].reservesArr
    //         this.selectedSuppliesList = (flag1 || flag2 || flag3) === true ? this[array].reserves : this.suppliesList[1]
    //     }
    //     this.showIcon = this.selectedSuppliesList;
    //     this.total = this.selectedSuppliesList.length;
    //     this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    //
    //     //   console.log("111")
    //     //   this.selectedSuppliesList = []
    //     //   let flag = Object.keys(this.selectedDataByRegions).length === 0 ? false : true
    //     //
    //     //   console.log("flag:",flag)
    //     //   if (param === 'supplies') {
    //     //       this.listField = 'supplies'
    //     //       this.selectedSuppliesList = flag ? this.selectedDataByRegions.suppliesArr : this.suppliesList[0]
    //     //   } else if (param === 'emergencyTeam') {
    //     //       this.listField = 'emergencyTeam'
    //     //       this.selectedSuppliesList = flag ? this.selectedDataByRegions.emergencyTeamArr : this.suppliesList[2]
    //     //   } else {
    //     //       this.listField = 'reserves'
    //     //       this.selectedSuppliesList = flag ? this.selectedDataByRegions.reservesArr : this.suppliesList[1]
    //     //   }
    //     //   console.log("this.listField:",this.listField)
    //     //   this.showIcon = this.selectedSuppliesList;
    //     //   this.total = this.selectedSuppliesList.length;
    //     //   this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    // },

    // 绘制点
    // drawSite(lat, lng, id, color) {
    //     let point = {
    //         id: id,
    //         position: Cesium.Cartesian3.fromDegrees(
    //             parseFloat(lng),
    //             parseFloat(lat)
    //         ),
    //     };
    //     this.affectedPoints.push(point);
    //     if (viewer) {
    //         viewer.entities.add({
    //             position: point.position,
    //             point: {
    //                 pixelSize: 10,
    //                 color: color,
    //             },
    //         });
    //     }
    // },

    // 点击列表某行显示对应标绘点
    showSupplyPoint(row) {
      console.log("点击了：", row);
      this.showIcon = [];
      this.showIcon.push(row);
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      if (this.showIcon[0].type === "supplies") {
        this.processPoints(this.showIcon, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
      } else if (this.showIcon[0].type === "reserves") {
        this.processPoints(this.showIcon, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
      } else {
        this.processPoints(this.showIcon, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
      }
    },

    // 移除地图上的标绘点
    removePoints(entityArr) {
      entityArr.forEach((entity) => {
        // console.log("-----", entity);
        let uuid = entity.uuid;
        window.viewer.entities.values.forEach((existingEntity) => {
          if (existingEntity.uuid === uuid) {
            window.viewer.entities.remove(existingEntity);
          }
        });
      });
    },

    // 显示所有标绘点
    showAllSupplyPoints() {
      let that = this;
      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removethdRegions()
      this.removeDataSourcesLayer('YaanRegionLayer');
      this.initPlot()
    },

    // 物资查询
    async searchSupply() {
      let that = this;
      this.activeMenuIndex = '2'
      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      let result = []
      this.ifDrawEllipse = false
      this.selectedSuppliesList = []
      // 字符串部分到后端查询
      let obj = {
        county: this.searchSupplyForm.county,
        address: this.searchSupplyForm.address,
        contactPerson: this.searchSupplyForm.contactPerson,
        contactPhone: this.searchSupplyForm.contactPhone,
      }
      await searchMaterialData(obj).then(res => {
        // console.log("search----------",res)
        result = res
        this.selectedSuppliesList = result
      })
      this.drawSupplyPoint('searchSupplies')
      this.listField = 'supplies'
      this.activeMenuIndex = '3'
      this.panels.searchSupplyDialog = false
      this.searchSupplyForm = {
        county: "",
        address: "",
        contactPerson: "",
        contactPhone: "",
        tents: 0,
        raincoats: 0,
        rainBoots: 0,
        flashlights: 0,
        radius: 0.0,
      }
      // console.log("this.activeMenuIndex--------------------------------",this.activeMenuIndex)
    },

    // 救援力量查询
    async searchEmergencyTeam() {
      let that = this;
      this.activeMenuIndex = '2'
      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      this.ifDrawEllipse = false
      this.selectedSuppliesList = []
      await searchEmergencyTeamData(this.searchEmergencyTeamForm).then(res => {
        this.selectedSuppliesList = res
        console.log("-------------------", this.selectedSuppliesList)

      })
      this.drawSupplyPoint('searchEmergencyTeam')
      this.listField = 'emergencyTeam'
      this.activeMenuIndex = '4'
      this.panels.searchEmergencyTeamDialog = false
      this.searchEmergencyTeamForm = {
        levelName: '',
        teamTypeName: '',
        totalMembers: 0,
        address: '',
        personInCharge: '',
        chargePhone: ''
      }
    },

    // 物资匹配dialog能打开
    async marchSupply() {
      if (this.addSupplyPointCurrently.lat === 0) {
        await ElMessageBox.alert('请先添加受灾点。', '提示', {
          confirmButtonText: '确认',
        });
      } else {
        this.panels.marchSupplyDialog = true
      }
      // this.addDisasterPoint()
      // this.isShowMessage = true
      // this.searchSupplyBy = 'marchSupplyDialog'
    },
    // 物资匹配
    async marchSupplies() {
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      let result = this.supplyList
      let radiusResult = []
      let countResult = []
      this.selectedSuppliesList = []
      // console.log("result-------------------",result)
      let i = 1.0
      let flag = false
      while (i < 15.0 && !flag) {
        radiusResult = await this.marchSupplyByRadius(result, i)
        // console.log("radiusResult-------------------",radiusResult)
        countResult = this.marchSupplyByCount(radiusResult)
        // console.log("countResult-------------------", countResult);
        if (countResult.length > 0) {
          flag = true
          this.marchSupplyRadius = i
        }
        i++
      }
      if (flag) {
        this.selectedSuppliesList = countResult
        await ElMessageBox.alert(`物资匹配成功！查询半径为 ${i - 1} 公里。`, '提示', {
          confirmButtonText: '确认',
        });
        this.ifDrawEllipse = true
        this.drawSupplyPoint("searchSupplies", this.marchSupplyRadius)
      } else {
        this.selectedSuppliesList = []
        await ElMessageBox.alert('15公里范围内未匹配到合适的物资。', '提示', {
          confirmButtonText: '确认',
        });
      }
      // this.selectedDataBySupplies.supplies = countResult
      // this.selectedDataBySupplies.emergencyTeam = []
      // this.selectedDataBySupplies.reserves = []
      // this.listField = 'supplies'
      // this.changeDataList('supplies')
      this.panels.marchSupplyDialog = false
    },

    // 半径查询
    async searchSuppliesByRadius() {
      if (this.addSupplyPointCurrently.lat === 0) {
        await ElMessageBox.alert('请先添加受灾点。', '提示', {
          confirmButtonText: '确认',
        });
      } else {
        this.panels.searchSupplyByRadiusDialog = true
      }
      // this.addDisasterPoint()
      // this.isShowMessage = true
      // this.searchSupplyBy = 'RadiusDialog'
    },

    // 通过半径匹配物资
    async marchSuppliesByRadius() {
      this.ifDrawEllipse = true
      this.selectedSuppliesList = await this.marchSupplyByRadius(this.supplyList, this.searchSupplyForm.radius)
      this.drawSupplyPoint("searchSupplies", this.searchSupplyForm.radius)
      this.panels.searchSupplyByRadiusDialog = false

      // this.ifDrawEllipse = true
      // // 移除现有的点
      // this.removePoints(this.suppliesList[0]);
      // this.removePoints(this.suppliesList[1]);
      // this.removePoints(this.suppliesList[2]);
      // let result = await this.marchSupplyByRadius(this.suppliesList, this.searchSupplyForm.radius)
      // // this.drawSupplyPoint("searchSupplies", this.searchSupplyForm.radius)
      // this.selectedDataByRadius = {
      //     supplies: result[0],
      //     reserves: result[1],
      //     emergencyTeam: result[2]
      // };
      // this.selectPoints(this.searchSupplyForm.radius)
      // this.processPoints(result[0], 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
      // this.processPoints(result[1], 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
      // this.processPoints(result[2], 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
      // this.listField = 'supplies'
      // this.changeDataList('supplies')
      // this.panels.searchSupplyByRadiusDialog = false
    },
    // 半径匹配
    async marchSupplyByRadius(array, radius) {
      // 移除现有的点
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
      let result = []
      let longitude = parseFloat(this.addSupplyPointCurrently.lng);
      let latitude = parseFloat(this.addSupplyPointCurrently.lat);
      const clickPoint = Cesium.Cartesian3.fromDegrees(longitude, latitude);
      array.forEach((point) => {
        const pointLongitude = parseFloat(point.longitude);
        const pointLatitude = parseFloat(point.latitude);
        const initialPoint = Cesium.Cartesian3.fromDegrees(
            pointLongitude,
            pointLatitude
        );
        // 距离以公里为单位
        const distance = Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000;
        if (distance < radius) {
          result.push(point);
        }
      });
      return result
    },
// async marchSupplyByRadius(array, radius) {
    //     // 移除现有的点
    //     this.removePoints(this.suppliesList[0]);
    //     this.removePoints(this.suppliesList[1]);
    //     this.removePoints(this.suppliesList[2]);
    //     let result = []
    //     let suppliesArr = []
    //     let reservesArr = []
    //     let emergencyTeamArr = []
    //     let longitude = parseFloat(this.addSupplyPointCurrently.lng);
    //     let latitude = parseFloat(this.addSupplyPointCurrently.lat);
    //     const clickPoint = Cesium.Cartesian3.fromDegrees(longitude, latitude);
    //     if(Array.isArray(array[0])){
    //         array.forEach((arr,index) => {
    //             arr.forEach((point) => {
    //                 const pointLongitude = parseFloat(point.longitude);
    //                 const pointLatitude = parseFloat(point.latitude);
    //                 const initialPoint = Cesium.Cartesian3.fromDegrees(
    //                     pointLongitude,
    //                     pointLatitude
    //                 );
    //                 // 距离以公里为单位
    //                 const distance = Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000;
    //                 if (distance < radius) {
    //                     if(index === 0){
    //                         suppliesArr.push(point);
    //                     }else if(index === 1){
    //                         reservesArr.push(point);
    //                     }else{
    //                         emergencyTeamArr.push(point);
    //                     }
    //                 }
    //             });
    //         })
    //         result.push(suppliesArr)
    //         result.push(reservesArr)
    //         result.push(emergencyTeamArr)
    //         // }else if(typeof array === 'string'){
    //     }else{
    //         array.forEach((point) => {
    //             const pointLongitude = parseFloat(point.longitude);
    //             const pointLatitude = parseFloat(point.latitude);
    //             const initialPoint = Cesium.Cartesian3.fromDegrees(
    //                 pointLongitude,
    //                 pointLatitude
    //             );
    //             // 距离以公里为单位
    //             const distance = Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000;
    //             if (distance < radius) {
    //                 result.push(point);
    //             }
    //         });
    //     }
    //     return result
    // },
    // 通过目标数量匹配物资
    marchSupplyByCount(array) {
      let tents = 0
      let raincoats = 0
      let rainBoots = 0
      let flashlights = 0
      let flag = false
      let bool1 = this.searchSupplyForm.tents > 0 ? false : true
      let bool2 = this.searchSupplyForm.raincoats > 0 ? false : true
      let bool3 = this.searchSupplyForm.rainBoots > 0 ? false : true
      let bool4 = this.searchSupplyForm.flashlights > 0 ? false : true
      let resultArray = []
      array.forEach((ele) => {
        if (ele.tents === 0) {
          bool1 = true
        }
        if (ele.raincoats === 0) {
          bool2 = true
        }
        if (ele.rainBoots === 0) {
          bool3 = true
        }
        if (ele.flashlights === 0) {
          bool4 = true
        }
        if (!bool1 || !bool2 || !bool3 || !bool4) {
          tents += ele.tents;
          raincoats += ele.raincoats;
          rainBoots += ele.rainBoots;
          flashlights += ele.flashlights;
          // console.log("rainBoots=====-----",rainBoots)
          if (tents >= this.searchSupplyForm.tents
              && raincoats >= this.searchSupplyForm.raincoats
              && rainBoots >= this.searchSupplyForm.rainBoots
              && flashlights >= this.searchSupplyForm.flashlights) {
            flag = true;
          }
          resultArray.push(ele)
        }
      });
      // console.log("flag-----------------",flag)
      if (flag) {
        return resultArray
      } else {
        return []
      }
    },

    drawSupplyPoint(param, radius) {
      this.total = this.selectedSuppliesList.length;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
      this.removePoints(this.showIcon);
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
            parseFloat(this.addSupplyPointCurrently.lng),
            parseFloat(this.addSupplyPointCurrently.lat)
        ),
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
        },
      });
      this.showIcon = [];
      this.showIcon = this.selectedSuppliesList;
      // console.log("this.selectedSuppliesList---------",this.selectedSuppliesList)
      let reservesArr = []  // 抢险救灾装备
      let suppliesArr = []  // 救灾物资储备
      let emergencyTeamArr = []  // 救援力量
      if (param === 'searchSupplies') {
        this.showIcon.forEach((item) => {
          suppliesArr.push(item)
        })
      } else if (param === 'searchEmergencyTeam') {
        this.showIcon.forEach((item) => {
          emergencyTeamArr.push(item)
        })
      } else if (param === 'searchReserves') {
        this.showIcon.forEach((item) => {
          reservesArr.push(item)
        })
      } else {
        this.showIcon.forEach((item) => {
          if (item.type === "reserves") {
            reservesArr.push(item);
          } else if (item.type === "supplies") {
            suppliesArr.push(item);
          } else if (item.type === "emergency") {
            emergencyTeamArr.push(item);
          }
        });
      }
      this.processPoints(suppliesArr, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
      this.processPoints(reservesArr, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
      this.processPoints(emergencyTeamArr, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
      if (this.ifDrawEllipse) {
        this.selectPoints(radius);
      }
      // }

    },
    // 查询指定范围内的物资点

    selectPoints(radius) {
      if (!isNaN(parseFloat(radius))) {
        radius = parseFloat(radius) * 1000;

        // 将经纬度转换为 Cartesian3 类型
        const position = Cesium.Cartesian3.fromDegrees(
            parseFloat(this.addSupplyPointCurrently.lng),
            parseFloat(this.addSupplyPointCurrently.lat)
        );
        viewer.entities.values.forEach((entity) => {
          if (entity.ellipse) {
            viewer.entities.remove(entity);
          }
        });
        viewer.entities.add({
          position: position,
          ellipse: {
            semiMajorAxis: radius,
            semiMinorAxis: radius,
            material: Cesium.Color.GREEN.withAlpha(0.5),
          },
        });
      }
    },
    // 添加物资点
    addDisasterPoint() {
      if (this.isRouting) {
        this.isRouting = false;
      }
      if (this.isAddingArea) {
        this.isAddingArea = false;
      }
      this.canMarkPoint = true;
    },
    // 以下方法确保表单字段数据为0时不显示，且初始化时数据不为null，不会报错
    handleDisasterTentsInput(value) {
      this.searchSupplyForm.tents = value === '' ? 0 : Number(value);
    },
    handleFlashlightsInput(value) {
      this.searchSupplyForm.flashlights = value === '' ? 0 : Number(value);
    },
    handleRaincoatsInput(value) {
      this.searchSupplyForm.raincoats = value === '' ? 0 : Number(value);
    },
    handleRainBootsInput(value) {
      this.searchSupplyForm.rainBoots = value === '' ? 0 : Number(value);
    },
    handleRadiusInput(value) {
      this.searchSupplyForm.radius = value;
    },
    handleTeamTotalMembersInput() {
      this.searchEmergencyTeamForm.totalMembers = value
    },
    // ---------------------------------------------------------------------

    // getPageArr(arr) {
    //     let newArr = [];
    //     let start = (this.currentPage - 1) * this.pageSize;
    //     let end = this.currentPage * this.pageSize;
    //     if (end > this.total) {
    //         end = this.total;
    //     }
    //     for (; start < end; start++) {
    //         newArr.push(arr[start]);
    //     }
    //     return newArr;
    // },

    // handleSizeChange(val) {
    //     this.pageSize = val;
    //     this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    // },

    // handleCurrentChange(val) {
    //     this.currentPage = val;
    //     this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    // },

    // tableHeaderColor() {
    //     return {
    //         "border-width": "1px",
    //         "border-style": "solid",
    //         "border-color": "#555555",
    //         "background-color": "#293038 !important", // 此处是elemnetPlus的奇怪bug，header-cell-style中背景颜色不加!important不生效
    //         color: "#fff",
    //         padding: "0",
    //         "text-align": "center",
    //     };
    // },

    // 修改table header的背景色

    // tableColor({row, column, rowIndex, columnIndex}) {
    //     if (rowIndex % 2 == 1) {
    //         return {
    //             "border-width": "1px",
    //             "border-style": "solid",
    //             "border-color": "#555555",
    //             "background-color": "#313a44",
    //             color: "#fff",
    //             padding: "0",
    //             "text-align": "center",
    //         };
    //     } else {
    //         return {
    //             "border-width": "1px",
    //             "border-style": "solid",
    //             "border-color": "#555555",
    //             "background-color": "#304156",
    //             color: "#fff",
    //             padding: "0",
    //             "text-align": "center",
    //         };
    //     }
    // },

    //- ---------------------
    /** 以坐标点为中心，简单粗略的创建一个指定半径的圆，半径单位米，pointCount为构建圆的坐标点数（比如24个点，点越多越圆，最少3个点），返回构成圆的坐标点数组 **/
    CreateSimpleCircle(lng, lat, radius, pointCount) {
      //球面坐标不会算，转换成三角坐标简单点，经度代表值大约：0.01≈1km 0.1≈10km 1≈100km 10≈1000km
      let km = radius / 1000;
      let a = km < 5 ? 0.01 : km < 50 ? 0.1 : km < 500 ? 1 : 10;
      let b = this.Distance(lng, lat, lng + a, lat);
      let c = this.Distance(lng, lat, lng, lat + a);
      let rb = (radius / b) * a;
      let rc = (radius / c) * a;
      let arr = [];
      let n = 0,
          step = 360.0 / pointCount,
          N = 360 - step / 2; //注意浮点数±0.000000001的差异
      for (let i = 0; n < N; i++, n += step) {
        let x = lng + rb * Math.cos((n * Math.PI) / 180);
        let y = lat + rc * Math.sin((n * Math.PI) / 180);
        arr[i] = [x, y];
      }
      arr.push([arr[0][0], arr[0][1]]); //闭环
      return arr;
    },
    formatTime(minutes) {
      const hours = Math.floor(minutes / 60); // 计算小时数
      const remainingMinutes = Math.round(minutes % 60); // 计算剩余的分钟数并四舍五入
      return `${hours > 0 ? hours + '小时' : ''}${remainingMinutes}分钟`;
    },
    walkStyle() {
      this.visibleGuilde = false;
      this.RouteTime = this.formatTime(this.humantime);
      if (this.RouteTime === "0分钟") {
        this.RouteTime = "1分钟";
      }
      this.RouteWay = "步行";
      this.selectedDrive = "backcolor: red";
      this.selectedWalk = "backcolor: white";
    },
    driveStyle() {
      this.visibleGuilde = true;
      if (this.cartime.includes("0时0分钟")) {
        this.RouteTime = "1分钟";
      } else {
        this.RouteTime = this.formatTime(this.cartime);
      }
      if (this.RouteTime === "0分钟") {
        this.RouteTime = "1分钟";
      }
      this.RouteWay = "驾驶";
    },

    onScroll(event) {
      const container = event.target;
      const bottom = container.scrollHeight === container.scrollTop + container.clientHeight;
      if (bottom && !this.loading) {
        this.loadMoreGuide();
      }
    },
    async loadMoreGuide() {
      this.loading = true;
      try {
        // 调用API获取更多的指南数据
        const newGuides = await this.fetchMoreGuides();
        this.RouteGuilde = [...this.RouteGuilde, ...newGuides];
      } catch (error) {
        console.error('Failed to load more guides', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchMoreGuides() {
      // 实现调用API逻辑
      return []; // 返回新的指南数据
    },
    route() {
      if (this.canMarkPoint) {
        this.canMarkPoint = false;
      }
      this.clearHandler(); // 清除之前的监听器
      this.isRouting = true; // 设置路径规划标志
      let that = this;
      that.pos = [];
      let propertiesId = that.propertiesId
      // 在开始新的路径规划前，先清除之前的实体（点和折线）
      propertiesId.forEach(id => {
        viewer.entities.removeById(id); // 根据之前的propertiesId移除实体
      });
      this.propertiesId = []; // 清空propertiesId，为新的路径规划准备

      console.log("111")
      this.handler.setInputAction((event) => {
        console.log("1.5 1.5")
        if (!this.isRouting) return; // 如果路径规划已完成，则不执行后续代码

        // 获取点击位置的坐标信息
        let ray = viewer.camera.getPickRay(event.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        let cartographic = Cesium.Cartographic.fromCartesian(position);
        let lon = Cesium.Math.toDegrees(cartographic.longitude);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);

        console.log("222")
        that.pos.push([lon, lat]);
        let billBoardId = Date.now();
        if (that.pos.length === 1) {
          that.billboardD(position, start, billBoardId);
          this.propertiesId.push(billBoardId);  // 将billboardId加入propertiesId数组
        } else {
          that.billboardD(position, end, billBoardId);
          this.propertiesId.push(billBoardId);  // 将billboardId加入propertiesId数组
        }
        console.log("333")

        if (that.pos.length === 2) {
          // 已获取两个点，开始路径规划
          let path = "";
          let pathName = [];
          let pathM = 0;

          let from = wgs84togcj02(that.pos[0][0], that.pos[0][1]);
          let end = wgs84togcj02(that.pos[1][0], that.pos[1][1]);
          let avoidArea = "";

          console.log("444")
          // 添加受灾区域逻辑
          if (that.areas.length > 0) {
            let area = JSON.parse(JSON.stringify(that.areas));
            for (let i = 0; i < area.length; i++) {
              for (let j = 0; j < area[i].area.length; j += 2) {
                avoidArea += wgs84togcj02(area[i].area[j][0], area[i].area[j][1]) + ";";
              }
              avoidArea += "|";
            }
            avoidArea = avoidArea.substring(0, avoidArea.length - 1);
          }
          console.log("555")
          axios.get(`${AmapApiLocal}/direction/driving?origin=${from}&destination=${end}&extensions=base&strategy=0&avoidpolygons=${avoidArea}&key=7b0b64174ef6951cc6ee669de03e4f59`)
              .then(res => {
                console.log("666")
                pathM += parseInt(res.data.route.paths[0].distance);
                res.data.route.paths[0].steps.forEach(step => {
                  pathName.push(step.instruction);
                  path += step.polyline + ";";
                });

                let pathSegments = path.split(";")
                    .map(segment =>
                        segment
                            .replace(/"/g, "")  // 去除双引号
                            .split(",")  // 按逗号分割成经纬度数组
                            .map(Number)  // 将字符串转换为数字
                            .filter(seg => !isNaN(seg))  // 去除无效数字
                    )
                    .filter(segment => segment.length === 2)
                    .map(segment => gcj02towgs84(segment[0], segment[1]))
// 在pathSegments数组开头插入起点
                pathSegments.unshift(that.pos[0]);

// 在pathSegments数组结尾添加终点
                pathSegments.push(that.pos[1]);
                that.polylineD(pathSegments, propertiesId);
                console.log("777")
                this.cartime = (parseFloat(res.data.route.paths[0].duration) / 60).toFixed(2);
                this.humantime = (pathM * 0.7 / 60).toFixed(2);
                this.driveStyle();
                this.walkStyle();
                this.totalRoute = pathM;
                this.RouteGuilde = pathName;
              })

          that.showTips = true;
          this.isRouting = false; // 路径规划完成，设置标志
          this.clearHandler(); // 移除点击事件监听器
          const showRouteDiv = document.querySelector('.showRoute');
          if (showRouteDiv) {
            showRouteDiv.style.display = 'initial'; // 设置 display 为初始值
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    },
    //绘制路径的线
    polylineD(data, propertiesId) {
      let arr = [];
      for (let i = 0; i < data.length; i++) {
        let c3 = Cesium.Cartesian3.fromDegrees(data[i][0], data[i][1]);
        // let cartographic = Cesium.Cartographic.fromDegrees(data[i][0],data[i][1])
        // let cartesian3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic)
        arr.push(c3);
      }

      // 创建一个唯一的 ID，可以使用当前时间戳或其他唯一标识符
      let uniqueId = Cesium.createGuid(); // 或者使用 Date.now()

      viewer.entities.add({
        id: uniqueId,  // 为每个折线实体指定唯一的 id
        polyline: {
          positions: arr,
          width: 10,
          depthFailMaterial: Cesium.Color.YELLOW,
          clampToGround: true,
        },
        properties: {
          propertiesId,
        },
      });
      this.propertiesId.push(uniqueId);
    },
    //绘制障碍物点的面
    polygonD(positions, id) {
      let arr = [];
      for (let i = 0; i < positions.length; i++) {
        let a = Cesium.Cartesian3.fromDegrees(positions[i][0], positions[i][1]);
        arr.push(a);
      }
      let polygon = new Entity({
        id: id,
        polygon: {
          hierarchy: arr,
          material: new Cesium.Color.fromCssColorString("#FFD700").withAlpha(
              0.2
          ),
          clampToGround: true,
        },
        properties: {},
      });
      viewer.entities.add(polygon);
    },
    //绘制半径的中心点
    pointD(position, id) {
      return viewer.entities.add({
        id: id,
        position: position,
        point: {
          pixelSize: 20,
          color: Cesium.Color.RED,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
          depthTest: false, //禁止深度测试但是没有下面那句有用
          disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）
        },
      });
    },
    //路径规划
    billboardD(position, img, billBoardId) {
      viewer.entities.add({
        id: billBoardId,
        position: position,
        billboard: {
          image: img,
          // width: 25,//图片宽度,单位px
          // height: 25,//图片高度，单位px // 会影响point大小，离谱
          // eyeOffset: new Cesium.Cartesian3(-1, 1, 0),//与坐标位置的偏移距离
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 绑定到地形高度,让billboard贴地
          depthTest: false, //禁止深度测试但是没有下面那句有用
          disableDepthTestDistance: Number.POSITIVE_INFINITY, //不再进行深度测试（真神）
        },
      });
    },
    addArea() {
      console.log("00")
      if (this.canMarkPoint) {
        this.canMarkPoint = false;
      }
      this.clearHandler(); // 清除之前的监听器
      this.isAddingArea = true; // 设置添加受灾区域标志
      let that = this;

      this.handler.setInputAction((event) => {
        console.log("11")
        if (!this.isAddingArea) return; // 如果已添加区域，则不执行后续代码

        // 获取点击位置的坐标信息
        let ray = viewer.camera.getPickRay(event.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        let cartographic = Cesium.Cartographic.fromCartesian(position);
        let lon = Cesium.Math.toDegrees(cartographic.longitude);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let ar = that.CreateSimpleCircle(lon, lat, 50, 24);
        that.areas.push({area: ar, name: "area_" + Date.now()});
        let id = "area_" + Date.now();
        that.pointD(position, id);
        that.polygonD(ar, id + "a");
        // 这里是更新路径规划，调用路径更新函数
        if (that.pos.length > 0) {
          that.updateRoute(); // 调用方法重新计算路径并避开新障碍区域
          console.log("66")
        }

        this.isAddingArea = false; // 添加区域完成，设置标志
        this.clearHandler(); // 移除点击事件监听器
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    // 更新路径的函数
    updateRoute() {
      let that = this;
      let avoidArea = "";

      // 重新生成障碍区域
      if (that.areas.length > 0) {
        let area = JSON.parse(JSON.stringify(that.areas));
        for (let i = 0; i < area.length; i++) {
          for (let j = 0; j < area[i].area.length; j += 2) {
            avoidArea += wgs84togcj02(area[i].area[j][0], area[i].area[j][1]) + ";";
          }
          avoidArea += "|";
        }
        avoidArea = avoidArea.substring(0, avoidArea.length - 1);
        console.log("22")
      }

      // 判断是否已存在第三个数字（ID）
      if (that.propertiesId.length >= 3) {
        // 删除第三个ID
        let thirdId = that.propertiesId[2];
        viewer.entities.removeById(thirdId);  // 移除第三个折线
        that.propertiesId.splice(2, 1);  // 删除 propertiesId 中的第三个 ID
      }

      console.log("asdasdasd", that.pos)
      // 获取起点和终点
      let from = wgs84togcj02(that.pos[0][0], that.pos[0][1]);
      let end = wgs84togcj02(that.pos[1][0], that.pos[1][1]);
      console.log("33")

      // 请求路径规划
      axios.get(`${AmapApiLocal}/direction/driving?origin=${from}&destination=${end}&extensions=base&strategy=0&avoidpolygons=${avoidArea}&key=7b0b64174ef6951cc6ee669de03e4f59`)
          .then(res => {
            // 处理路径返回的数据，更新路径
            let pathM = parseInt(res.data.route.paths[0].distance);
            let pathName = [];
            let path = "";
            res.data.route.paths[0].steps.forEach(step => {
              pathName.push(step.instruction);
              path += step.polyline + ";";
            });

            console.log("44")
            // 更新路径
            let pathSegments = path.split(";")
                .map(segment => segment.replace(/"/g, "").split(",").map(Number).filter(seg => !isNaN(seg)))
                .filter(segment => segment.length === 2)
                .map(segment => gcj02towgs84(segment[0], segment[1]));

            pathSegments.unshift(that.pos[0]);
            pathSegments.push(that.pos[1]);
            console.log("55")

            // 将新的路径绘制到地图上
            that.polylineD(pathSegments, that.propertiesId);  // 传递路径和 id 更新折线
          })
          .catch(error => {
            console.error("路径规划请求失败", error);
          });

      // 显示提示
      that.showTips = true;
      this.isRouting = false;  // 路径规划完成，设置标志
    },
    clearHandler() {
      // 清除所有之前的 LEFT_CLICK 监听器
      if (this.handler) {
        console.log("11111111")
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
    },
    removeAll() {
      viewer.entities.removeAll();
      this.areas = [];
    },
    removePoint() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      let that = this;
      that.pos = [];  // 清空路径点
      handler.setInputAction(async (click) => {
        let pickedEntity = window.viewer.scene.pick(click.position);
        // let entity = window.selectedEntity = pickedEntity?.id
        let entity = pickedEntity?.id;
        if (Cesium.defined(pickedEntity) && entity._point !== undefined) {
          let id = entity.id;
          that.areas = that.areas.filter((area) => area.name !== id);
          viewer.entities.remove(entity);
          viewer.entities.removeById(id + "a");
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    removePolyline() {
      let handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
      );
      handler.setInputAction(async (click) => {
        let pickedEntity = window.viewer.scene.pick(click.position);
        let entity = (window.selectedEntity = pickedEntity?.id);
        if (
            Cesium.defined(pickedEntity) &&
            window.selectedEntity._polyline !== undefined
        ) {
          let propertiesId = entity.properties.propertiesId._value;
          for (let i = 0; i < propertiesId.length; i++) {
            console.log(propertiesId[i], propertiesId[i] + "");
            viewer.entities.removeById(propertiesId[i] + "");
          }
          viewer.entities.remove(entity);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //绑定点击事件
    //    bubbleTips(position) {
    //     if (!viewer) {
    //         console.error("Viewer is not initialized.");
    //         return;
    //     }
    //     // 文字内容
    //     var text = "Citizens Bank Park";
    //     // 添加背景面板
    //     var backgroundPanel = viewer.entities.add({
    //         position: position,
    //         billboard: {
    //             // 使用 CSS 样式的背景图像或在下面的代码中可以选择不同的背景图
    //             image: bubbleImg,
    //             pixelOffset: new Cesium.Cartesian2(0, -80), // 需要根据实际需要调整偏移
    //             width: 200, // 固定宽度或根据内容计算
    //             height: 100, // 固定高度或根据内容计算
    //         },
    //     });

    //     // 添加标签
    //     var label = viewer.entities.add({
    //         position: position,
    //         label: {
    //             text: text,
    //             font: "16pt Arial",
    //             style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    //             fillColor: Cesium.Color.WHITE,
    //             outlineColor: Cesium.Color.GRAY,
    //             outlineWidth: 2,
    //             verticalOrigin: Cesium.VerticalOrigin.CENTER,
    //             pixelOffset: new Cesium.Cartesian2(0, -30), // 根据背景面板的高度调整标签的位置
    //             showBackground: true,
    //             backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
    //             backgroundPadding: new Cesium.Cartesian2(10, 6)
    //         }
    //     });

    //     // 添加点击事件处理（可选）
    //     viewer.screenSpaceEventHandler.setInputAction(function (click) {
    //         var pick = viewer.scene.pick(click.position);
    //         if (Cesium.defined(pick) && (pick.id === backgroundPanel || pick.id === label)) {
    //             console.log("Label or background panel clicked");
    //         }
    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // }

    initTool(frameDiv) {
      if (this.isInit) {
        return 0;
      }
      //弹窗容器div
      const rightdiv = document.createElement("DIV");
      rightdiv.className = "tooltipdiv-right";
      rightdiv.style = `
      position:absolute;
      width:200px;
      min-height:100px;
      max-height:300px;
      background:#fff;
      border-radius:4px;
      box-shadow: 2px 4px 5px #888888;
      `;

      //弹窗箭头div
      const arrow = document.createElement("DIV");
      arrow.className = "tooltip-arrow";
      arrow.style = `
      position:absolute;
      left:-24px;
      top:38px;
      width:0;
      height:0;
      border-top: 12px solid transparent;
      border-right: 12px solid #fff;
      border-bottom: 12px solid transparent;
      border-left: 12px solid transparent;`;
      rightdiv.appendChild(arrow);
      //标题div
      const title = document.createElement("DIV");
      title.className = "tooltipdiv-inner";
      title.style = `
      width:100%;
      height:25px;
      line-height:25px;
      text-align:center;
      background:red;
      `;
      rightdiv.appendChild(title);

      //内容div
      const content = document.createElement("DIV");
      content.className = "tooltipdiv-content";
      content.style = `
      width:200px;
      box-sizing:border-box;
      padding:10px 0 10px 10px;
      overflow-y:scroll;
      word-break:break-all;
      `;
      rightdiv.appendChild(content);

      this.addDiv = rightdiv;
      this.addtitle = title;
      this.addcontent = content;
      frameDiv.appendChild(rightdiv);

      this.isInit = true;
    },

    // ------------------------------路径规划+物资匹配---------------------------

    toggleTimer() {
      if (this.isTimerRunning) {
        this.canOperateTimerLine = true
        // 如果计时器正在运行，则停止计时器
        this.stopTimer();
        clearInterval(this.intervalIdcolor)
        this.centerMarkOpacityTo1()
      } else {
        // 如果计时器未运行，启动计时器
        if (this.currentTimePosition >= 100 || this.currentTimePosition <= 0) {
          this.isTimerRunning = true
          this.initTimerLine();  // 重新初始化时间轴
          let that = this
          setTimeout(() => {
            this.canOperateTimerLine = true
            that.bofang();  // 调用播放方法
          }, 3000);
        }
        this.startPlayback(); // 开始播放
      }
    },

    startPlayback() {
      this.canOperateTimerLine = true
      this.flyToCenter()
      this.isTimerRunning = true;
      this.bofang(); // 调用播放方法
    },


    returnStart() {
      this.isTimerRunning = false;
      // 初始化
      this.currentTimePosition = 0;
      this.currentTime = this.eqstartTime;
      this.currentNodeIndex = 0;
      // 从 dataSource 中删除点
      this.plots.forEach(item => {
        if (this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          cesiumPlot.deleteMakerById(item.plotId, item.drawtype, item.plotType);
        }
      })
      this.flyToCenter()
      // setTimeout(() => {
      this.flashingCenter()
      // }, 3000);
    },
    /**
     * 初始化计时线
     * 启动计时器，每隔一段时间更新当前时间位置
     */
    initTimerLine() {
      this.isfirst = false
      // console.log(this.jumpTimes,"this.jumpTimes")
      if (this.jumpTimes) {
        this.jumpTimes.forEach(item => {
          var jumpnode = Math.ceil((new Date(item) - new Date(this.eqstartTime.getTime())) / (5 * 60 * 1000))//5分钟一个节点
          this.jumpNodes[jumpnode] = 1
        })
      }
      // 标记计时器为运行状态
      this.isTimerRunning = true;
      // 初始化
      this.currentTimePosition = 0;
      this.currentTime = this.eqstartTime;
      this.currentNodeIndex = 0;
      // 从 dataSource 中删除点
      this.plots.forEach(item => {
        if (this.plotisshow[item.plotId] === 1) {
          this.plotisshow[item.plotId] = 0
          cesiumPlot.deleteMakerById(item.plotId, item.drawtype, item.plotType);
        }
      })
      this.flyToCenter()
      setTimeout(() => {
        this.flashingCenter()
      }, 3000);
    },
    bofang() { //正向播放
      this.isfirst = false
      if (!this.isTimerRunning) { //根据次数跳出
        this.stopTimer();   // 如果计时器未运行，则停止
        return;
      } else {
        // 更新一次时间轴位置
        let flag = this.updateCurrentTimeOnce();
        if (flag) {
          if (this.isMarkingLayer) {
            // 更新标注
            this.updatePlotOnce(true)
            setTimeout(() => {
              this.bofang();
            }, this.stopTimeforAddEntityOneIndex / this.currentSpeed);// 考虑倍速播放
          } else {
            this.MarkingLayerRemove() // 移除标注层
          }
        }
      }
    },
    updateCurrentTimeOnce() {
      let flag = 1
      let i = this.currentNodeIndex + 1;
      for (; i <= this.timelineAdvancesNumber; i++) {
        if (this.jumpNodes[i] === 1) {
          flag = 1
          break;
        }
      }

      if (i >= this.timelineAdvancesNumber) {
        flag = 0
        this.initEnd()
      }

      if (flag === 1) {
        let tmpTime = new Date(this.eqstartTime.getTime() + i * 5 * 60 * 1000);
        if (tmpTime <= this.eqendTime) {
          this.currentNodeIndex = i //前进timelineAdvancesNumber次，每次5分钟，
          this.currentTimePosition = 100.0 / (this.timelineAdvancesNumber * 1.0) * i;
          this.currentTime = tmpTime
        } else {
          flag = 0
          this.initEnd()
        }
        // 根据是否需要显示标绘层来更新图层
      }
      return flag
    },
    /**
     * 时间轴停止
     * 此方法用于停止当前正在运行的定时器它通过清除间隔标识并重置相关状态来实现
     * 定时器停止后，不会再执行任何操作，确保资源得到正确释放
     */
    stopTimer() {
      this.isfirst = true
      this.isTimerRunning = false;
      this.centerMarkOpacityTo1() // 恢复中心标记透明度
      this.ifUpdateEndTime() // 更新结束时间
    },
    initEnd() {
      this.currentTimePosition = 100;
      this.currentNodeIndex = Math.ceil(((new Date(this.eqendTime).getTime() + 5 * 60 * 1000) - new Date(this.eqstartTime).getTime()) / (5 * 60 * 1000));
      this.currentTime = this.eqendTime
      this.updatePlotOnce(false)
      setTimeout(() => {
        this.stopTimer()
        this.flyToCenterhigh()
      }, 3000);
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
      if (this.canOperateTimerLine) {
        this.isfirst = false
        let flag = this.updateCurrentTimeOnce();
        if (flag) {
          if (this.isMarkingLayer) {
            this.updatePlotOnce("3")
            this.isTimerRunning = false;
          } else {
            this.MarkingLayerRemove()
          }
        }
      }
    },

    /**
     * 后退函数，用于在时间线上向后移动
     * 该函数通过调整当前节点索引和当前时间位置来实现后退
     * 当前时间位置达到0时，停止计时器
     * 否则，根据当前时间位置和节点索引计算新的时间位置和实际时间
     * 并更新图表显示
     */
    backward() {
      if (this.canOperateTimerLine) {
        this.isfirst = false
        let flag = 0
        let i = this.currentNodeIndex - 1;
        for (; i >= 0; i--) {
          // console.log()
          if (this.jumpNodes[i] === 1) {
            console.log(i, "i")
            flag = 1;
            break;
          }
        }
        //回退到最开始
        if (i <= 0) {
          flag = 0
          this.currentTimePosition = 0;
          this.currentNodeIndex = 0
          this.currentTime = this.eqstartTime

          this.stopTimer();
          this.plots.forEach(item => {
            if (this.plotisshow[item.plotId] === 1) {
              this.plotisshow[item.plotId] = 0
              cesiumPlot.deletePointById(item.plotId);
            }
          })
        }
        //更新到下一跳
        if (flag === 1) {
          let currentTimeTmp = new Date(this.eqstartTime.getTime() + i * 5 * 60 * 1000);
          //最后5分钟，不满5分钟的，再回退一跳
          if (currentTimeTmp >= this.eqendTime) {
            this.backward()
          } else {
            this.currentNodeIndex = i //前进timelineAdvancesNumber次，每次5分钟，
            this.currentTimePosition = 100.0 / (this.timelineAdvancesNumber * 1.0) * this.currentNodeIndex;
            this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
            // 根据是否需要显示标绘层来更新图层
            this.updatePlotOnce("3")
          }
          this.isTimerRunning = false;
        }
      }

    },

    /**
     * 根据用户点击的时间轴位置，跳转到相应的场景
     * @param {MouseEvent} event - 鼠标点击事件
     */
    jumpToTime(event) {
      if (this.canOperateTimerLine) {
        this.isfirst = false
        let currentTimeTmp = this.currentTime
        // 获取时间轴的矩形区域，用于计算点击位置对应的进度
        const timeRulerRect = event.target.closest('.time-ruler').getBoundingClientRect();
        // 计算点击位置相对于时间轴左边缘的距离
        const clickedPosition = event.clientX - timeRulerRect.left;

        // 限制点击位置在 [0, timeRulerRect.width] 之间
        if (this.clickedPosition < 0) this.clickedPosition = 0;
        if (this.clickedPosition > timeRulerRect.width) this.clickedPosition = timeRulerRect.width;


        // 根据点击位置计算当前时间进度的百分比
        this.currentTimePosition = (clickedPosition / timeRulerRect.width) * 100;
        // 更新时间进度条的宽度，以反映当前时间进度
        this.$el.querySelector('.time-progress').style.width = `${this.currentTimePosition}%`;
        // 根据当前时间进度百分比和总步骤数计算当前步骤索
        this.currentNodeIndex = Math.max(0, Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber));
        // Assuming 672 is the total number of steps
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
          // this.intimexuanran(this.eqid)

        } else if (this.currentTimePosition <= 0) {
          this.currentTime = this.eqstartTime;
          this.currentTimePosition = 0; // 同步更新 currentTimePosition
        } else {
          if (currentTimeTmp > this.currentTime) {
            this.updatePlotOnce("3")
          } else {
            this.updatePlotOnce("3")
          }
        }

        // 如果计算出的 currentTime 早于 eqstartTime，则重置为 eqstartTime
        if (this.currentTime < this.eqstartTime) {
          this.currentTime = this.eqstartTime;
          this.currentTimePosition = 0; // 同步更新 currentTimePosition
        }
        // 计算 currentTime 时，确保它不晚于 eqendTime
        if (this.currentTime > this.eqendTime) {
          this.currentTime = this.eqendTime;
          this.currentTimePosition = 100; // 同步更新 currentTimePosition
        }

        this.isTimerRunning = false;
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
      if (this.canOperateTimerLine) {

        this.isfirst = false
        this.isDragging = true; // 标记当前开始进入拖拽状态
        this.dragStartX = event.clientX; // 记录拖拽开始时的鼠标 X 坐标
        document.addEventListener('mousemove', this.drag); // 在文档上添加鼠标移动事件监听器，用于处理拖拽过程
        document.addEventListener('mouseup', this.stopDrag(this.currentTime)); // 在文档上添加鼠标抬起事件监听器，用于结束拖拽
        // 添加禁用选择的 CSS 样式
        document.body.style.userSelect = 'none';
        document.body.style.WebkitUserSelect = 'none';
        document.body.style.MozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
      }
    },

    /**
     * 处理鼠标拖动事件
     * @param {MouseEvent} event - 鼠标拖动事件对象
     */
    drag(event) {
      if (this.canOperateTimerLine) {

        // 如果没有拖动，则不执行后续操作
        if (!this.isDragging) return;
        // 获取时间尺的矩形信息
        const timeRulerRect = this.$el.querySelector('.time-ruler').getBoundingClientRect();
        // 计算鼠标点击位置相对于时间尺左边缘的水平距离
        const clickedPosition = Math.max(timeRulerRect.left, Math.min(event.clientX, timeRulerRect.right)) - timeRulerRect.left;
        // 计算新的进度位置百分比
        const newPosition = (clickedPosition / timeRulerRect.width) * 100;
        // 更新当前节点索引，根据时间线的总进度数进行比例转换

        // 更新时间进度条的宽度，以反映新的进度位置

        // 更新当前时间进度位置
        this.currentTimePosition = newPosition;
        // this.$el.querySelector('.time-progress').style.width = `${newPosition}%`;
        // this.$el.querySelector('.time-slider').style.left = `${this.currentTimePosition - 0.5}%`;
      }
    },

    /**
     * 停止拖拽操作
     * 当用户释放鼠标按钮时调用此方法，以重置拖拽状态并停止监听鼠标事件
     */
    stopDrag(time) {
      if (this.canOperateTimerLine) {

        this.currentNodeIndex = Math.floor((this.currentTimePosition / 100) * this.timelineAdvancesNumber);
        // 根据开始时间和当前节点索引计算当前时间
        // 注意：此处将时间增量从15分钟调整为5分钟
        this.currentTime = new Date(this.eqstartTime.getTime() + this.currentNodeIndex * 5 * 60 * 1000);
        // let timetmp=this.currentTime
        // 重置isDragging状态，表示不再拖拽中
        this.isDragging = false;
        // 移除鼠标移动事件监听器，防止拖拽结束后鼠标移动事件继续触发
        document.removeEventListener('mousemove', this.drag);
        // 移除鼠标释放事件监听器，释放后不再需要此事件处理函数
        document.removeEventListener('mouseup', this.stopDrag);

        // 当currentTimePosition达到或超过100时，进行特殊处理
        if (this.currentTimePosition >= 100) {
          this.currentTimePosition = 100;
          this.currentTime = this.eqendTime;
          this.stopTimer();
          // this.intimexuanran(this.eqid)
        } else {
          if (time > this.currentTime) {
            this.updatePlotOnce("3")
          } else {
            this.updatePlotOnce("3")
          }
        }
        // 恢复默认的选择行为
        document.body.style.userSelect = 'auto';
        document.body.style.WebkitUserSelect = 'auto';
        document.body.style.MozUserSelect = 'auto';
        document.body.style.msUserSelect = 'auto';
        this.isTimerRunning = false;
      }
    },

    /**
     * 选择时间轴的播放倍速
     *
     * @param {string} speed - 速度的字符串表示，格式为"数字-单位"，如"50-米/秒"
     */
    //视角跳转和倍速有关
    selectSpeed(speed) {
      // 直接赋值速度选项
      this.speedOption = speed
      // 解析速度字符串中的数字部分，并转换为浮点数作为实际的速度值
      this.currentSpeed = parseFloat(speed.split('-')[0])
      this.showSpeedOptions = false
      if (this.isTimerRunning) {
        // 如果计时器正在运行，重新设置播放速度
        this.toggleTimer();
        this.toggleTimer();
      }
    },


    //飞到震中
    flyToCenter() {
      if (this.selectedEntity && (this.timelinePopupVisible || this.routerPopupVisible || this.dataSourcePopupVisible)) {
        window.viewer.screenSpaceEventHandler.setInputAction(movement => {
          this.updatePopupPosition();
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
      // 飞行动画持续时间（秒）
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            // parseFloat(this.centerPoint.geom.coordinates[0]),
            // parseFloat(this.centerPoint.geom.coordinates[1]),
            parseFloat(this.centerPoint.longitude),
            parseFloat(this.centerPoint.latitude),
            30000),
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
    flyToCenterhigh() {
      if (this.selectedEntity && (this.timelinePopupVisible || this.routerPopupVisible || this.dataSourcePopupVisible)) {
        window.viewer.screenSpaceEventHandler.setInputAction(movement => {
          this.updatePopupPosition();
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
      // 飞行动画持续时间（秒）
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            // parseFloat(this.centerPoint.geom.coordinates[0]),
            // parseFloat(this.centerPoint.geom.coordinates[1]),
            parseFloat(this.centerPoint.longitude),
            parseFloat(this.centerPoint.latitude),
            200000),
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
    //震中红色中心点闪烁
    flashingCenter() {
      //震中点闪烁
      let data = {
        ...this.centerPoint,
        drawtype: "center"
      }
      this.timelinePopupVisible = false;
      // 清除已有的闪烁定时器
      if (this.intervalIdcolor) {
        clearInterval(this.intervalIdcolor);
      }
      // 震中点标记（大视图）
      let centerMark = viewer.entities.getById(this.centerPoint.plotid);
      if (!centerMark) {

        centerMark = viewer.entities.add({
          // 配置震中标记的各项属性（位置、图标、标签等）
          properties: {
            data
          },
          position: Cesium.Cartesian3.fromDegrees(
              // parseFloat(this.centerPoint.geom.coordinates[0]),
              // parseFloat(this.centerPoint.geom.coordinates[1]),
              parseFloat(this.centerPoint.longitude),
              parseFloat(this.centerPoint.latitude),
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
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            color: Cesium.Color.WHITE.withAlpha(1),//颜色
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
      }
      let colorFactor = 1.0;
      this.intervalIdcolor = setInterval(() => {
        colorFactor = colorFactor === 1.0 ? 0.5 : 1.0; // 在颜色之间切换
      }, 500);
      centerMark.billboard.color = new Cesium.CallbackProperty(() => {
        return Cesium.Color.fromCssColorString(`rgba(255, 255, 255, ${colorFactor})`); // 动态改变颜色
      }, false)
      //震中面板展开+跟随地图移动
      this.timelinePopupShowCenterStrart = true
      let position = centerMark.position.getValue(Cesium.JulianDate.now());
      let screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, position);
      this.timelinePopupPosition = {
        x: screenPosition.x + 10,
        y: screenPosition.y + 10
      };
      this.timelinePopupVisible = true;
      this.timelinePopupData = data
      this.selectedEntity = centerMark
      this.selectedEntityPosition = {
        // x: this.centerPoint.geom.coordinates[0], // 经度
        // y: this.centerPoint.geom.coordinates[1],  // 纬度
        x: this.centerPoint.longitude, // 经度
        y: this.centerPoint.latitude,  // 纬度
        z: 0     // 高度
      };
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        // 如果时间线弹窗或路由弹窗可见，则更新弹窗位置
        if (this.timelinePopupVisible || this.routerPopupVisible || this.dataSourcePopupVisible) {
          this.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    //取消闪烁，透明度到1
    centerMarkOpacityTo1() {
      let centerMark = window.viewer.entities.getById(this.centerPoint.plotid);
      centerMark.billboard.color = Cesium.Color.WHITE.withAlpha(1)//颜色
      let smallcenterMark = smallViewer.entities.getById(this.centerPoint.plotid);
      smallcenterMark.billboard.color = Cesium.Color.WHITE.withAlpha(1)//颜色
    },
    addJumpNodes(val) {
      val.forEach(item => {
        this.jumpTimes.push(item)
      })
    },
    updateZoomLevel(cameraHeight) {
      if (cameraHeight < 50000) {
        this.zoomLevel = '区/县'
      } else {
        this.zoomLevel = '市'
      }
    },

    //----------------------时间轴end
    clearResource(viewer) {
      this.isTimerRunning = false;
      let gl = viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      gl = null
    },
    // 关闭弹窗
    closePlotPop() {
      this.timelinePopupVisible = !this.timelinePopupVisible
    },
    // ws发送数据（只有点的是在这里）
    wsSendPoint(data) {
      this.websock.send(data)
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
      // //console.log(this.layeritems.length/2 , this.layeritems.length%2)
      // 输出用于校验的计算结果，帮助理解复选框数量如何影响高度计算
      //console.log(((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) * checkboxHeight) + ((parseInt(this.layeritems.length / 2) + this.layeritems.length % 2) - 1) * margin)
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
      //console.log("Toggle expand clicked");
      this.isExpanded = !this.isExpanded;
    },


    /**
     * 跳转首页
     */
    navigateToFrontPage() {
      this.$router.push({
        name: 'Index'
      });
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

      if (component === 'dataStats') {
        // 切换 showSidebarComponents 以显示/隐藏两侧组件
        this.showSidebarComponents = !this.showSidebarComponents;
      } else if (component !== 'legend') {
        // 点击其他按钮时隐藏侧边栏组件，但图例按钮不会触发隐藏
        this.showSidebarComponents = false;
      }
      // 如果点击的是当前活动组件，则关闭它，否则打开新组件
      this.activeComponent = this.activeComponent === component ? null : component;

      // 如果激活的组件是地震列表，则获取地震数据
      if (this.activeComponent === 'eqList') {

      }
      if (this.activeComponent === 'layerChoose') {
        this.removethdRegions();
        const hasYaanRegionLayer = this.selectedlayersLocal.includes('行政区划要素图层');
        // 如果选定了行政区划要素图层，则移除其他区域图层并添加雅安行政区划图层
        if (hasYaanRegionLayer) {
          this.addYaanRegion();
        }
      }
    },
    isActive(component) {
      return this.activeComponent === component; // 检查是否为活动组件
    },

    showThematicMapPreview(item) {
      // item 中包含 name, path
      this.ifShowMapPreview = true
      this.imgurlFromDate = item.path
      this.imgName = item.name
      this.showTypes = 1
      this.imgshowURL = new URL(this.imgurlFromDate, import.meta.url).href

      console.log("showThematicMapPreview",this.imgshowURL, this.imgName)

    },
    downloadReport(item) {
      this.$notify({
        title: '报告下载',
        message: '数据正在解析中...',
        duration: 7000, // 设置持续时间
        zIndex: 9999  // 设置 zIndex 来确保通知在最上层
      });
      // 报告下载逻辑
      console.log("报告下载逻辑")
      console.log(item)
      const link = document.createElement("a");
      console.log(link)
      link.href = item.docxUrl;
      console.log(link.href)
      // link.href = `${urlBase}${item.path}`;
      link.download = item.theme; // 指定下载的文件名
      console.log(link.download)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    timestampToTimeChinese(timestamp) {
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
      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`
    },

    /**
     * 处理实体点击事件的弹窗显示逻辑
     */
    entitiesClickPonpHandler() {
      let that = this;
      // 在屏幕空间事件处理器中添加左键点击事件的处理逻辑
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        // 检查点击位置是否拾取到实体
        let pickedEntity = window.viewer.scene.pick(click.position);
        //console.log("点击选择的pickedEntity", pickedEntity)
        window.selectedEntity = pickedEntity?.id;

        // 绑定断裂带信息的 div 元素
        const faultInfoDiv = document.getElementById('faultInfo');
        // 如果拾取到实体
        if (Cesium.defined(pickedEntity)) {
          let entity = window.selectedEntity;
          //console.log(entity, "entity")
          // 计算图标的世界坐标
          this.selectedEntityPosition = this.calculatePosition(click.position);
          this.updatePopupPosition(); // 确保位置已更新
          const pickedObject = window.viewer.scene.pick(click.position);

          if (entity._layer === "断裂带") {
            //console.log("断裂带")

            const faultName = pickedObject.id.properties.name._value;

            if (faultName) {
              // 获取点击位置的地理坐标 (Cartesian3)
              const cartesian = viewer.scene.pickPosition(click.position);
              if (!Cesium.defined(cartesian)) {
                return;
              }

              // 更新 faultInfo 的位置和内容
              this.updateFaultInfoPosition(faultName);

              // 显示 faultInfo
              faultInfoDiv.style.display = 'block';

              // 监听地图变化，动态更新 div 的位置
              window.viewer.scene.postRender.addEventListener(() => {
                this.updateFaultInfoPosition(faultName);
              });

              //console.log(faultName)
            }
          }
          // 如果点击的是标绘点
          else if (entity._layer === "标绘点") {
            this.timelinePopupVisible = true;
            this.timelinePopupPosition = this.selectedEntityPosition; // 更新位置
            this.timelinePopupData = {}
            this.timelinePopupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
            this.dataSourcePopupVisible = false
            this.routerPopupVisible = false;
          }
          //聚合图标
          else if (Object.prototype.toString.call(entity) === '[object Array]') {
            if (entity[0].entityCollection.owner.name === "label") {
              this.dataSourcePopupVisible = false
              this.timelinePopupVisible = false
              this.routerPopupVisible = false;
            } else {
              this.dataSourcePopupData = entity
              this.dataSourcePopupVisible = true
              this.timelinePopupVisible = false
              this.routerPopupVisible = false;

            }
          }
          //救援队伍、避难场所、应急物资
          else if (entity._billboard) {
            this.routerPopupVisible = true;
            this.timelinePopupPosition = this.selectedEntityPosition;
            this.routerPopupData = this.extractDataForRouter(entity);
            this.dataSourcePopupVisible = false
            this.timelinePopupVisible = false;
          }
          //箭头标绘
          else if (entity._polygon) {
            this.timelinePopupVisible = true;
            this.timelinePopupPosition = this.selectedEntityPosition;
            this.timelinePopupData = {}
            this.timelinePopupData = window.selectedEntity.properties.data ? window.selectedEntity.properties.data.getValue() : ""
            this.dataSourcePopupVisible = false
            this.routerPopupVisible = false;
          } else {
            // 如果不是标绘点或路标
            this.routerPopupVisible = false;
            this.timelinePopupVisible = false;
            this.dataSourcePopupVisible = false
          }
        }
        //没有拾取到实体
        else {
          // 没有选中实体时隐藏 faultInfo
          faultInfoDiv.style.display = 'none';
          this.routerPopupVisible = false;
          this.timelinePopupVisible = false;
          this.dataSourcePopupVisible = false
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 在屏幕空间事件处理器中添加鼠标移动事件的处理逻辑
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        // 如果时间线弹窗或路由弹窗可见，则更新弹窗位置
        if (this.timelinePopupVisible || this.routerPopupVisible || this.dataSourcePopupVisible) {
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
      console.log("data:", this.eqtableData)
      addHistoryEqPoints(this.centerPoint, this.eqtableData)
    },

    /**
     * 断裂带加载  200千米以内
     * 在当前中心点位置添加故障区域对象，同时移除现有的故障区域对象
     */
    addFaultZone() {
      // 移除当前所有故障区域实体
     this.removeDataSourcesLayer('duanliedai');
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
      let height = isTerrainLoaded() ? viewer.scene.globe.getHeight(cartographic) : 0;

      // 返回计算得到的经纬度和高度
      return {
        x: longitude, // 经度
        y: latitude,  // 纬度
        z: height     // 高度
      };
    },


    /**
     * 更新断裂带信息在画布上的位置
     * 此方法用于根据选定的实体位置，更新显示断裂带信息的div在画布上的位置
     * @param {string} faultName - 断裂带的名称，将被显示在故障信息div中
     */
    updateFaultInfoPosition(faultName) {
      this.$nextTick(() => {
        if (this.selectedEntityPosition) {
          // //console.log(this.selectedEntityPosition)
          const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              window.viewer.scene,
              Cesium.Cartesian3.fromDegrees(this.selectedEntityPosition.x, this.selectedEntityPosition.y, this.selectedEntityPosition.z)
          );
          if (canvasPosition) {
            const faultInfoDiv = document.getElementById('faultInfo');
            faultInfoDiv.style.left = canvasPosition.x + 'px';
            faultInfoDiv.style.top = canvasPosition.y + 55 + 'px';
            faultInfoDiv.innerHTML = `${faultName}`;
            // //console.log(faultInfoDiv)
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
            this.dataSourcePopupPosition = {
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
      return {
        plotid: entity.id,
        plotname: entity.plottype,
        centerPoint: this.centerPoint
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
      // //console.log("detailedNews-----",val)
      this.showingNewsContent = val

    },

    /**
     * 控制详细新闻对话框的显示与隐藏
     * @param {boolean} val - 控制对话框显示（true）或隐藏（false）的布尔值
     */
    ifShowDialog(val) {
      // //console.log("ifShowDialog-----",val)
      this.showDetailedNewsDialog = val
    },

    /**
     * 隐藏新闻对话框
     * @param {boolean} val - 控制对话框显示（true）或隐藏（false）的布尔值
     */
    hideNewsDialog(val) {
      // //console.log("showDetailedNewsDialog-----",val)
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
        // //console.log("地形未加载")
        return false;
      } else if (Cesium.defined(terrainProvider)) {
        // //console.log("地形已加载")
        return true;
      }
      // //console.log("地形未加载")
      return false;
    },


    /**
     * 此方法通过调用getAllEq函数从服务器获取所有设备的数据，然后将这些数据赋值给eqtableData属性
     * 同时，成功获取数据后，初始化Cesium相关的viewer、websocket连接和pinia状态管理，以便进行设备位置的标绘
     */
    getEq() {
      let that = this
      getAllEqList().then(res => {
        that.eqtableData = res
        // 建立WS

        // //console.log("that.eqtableData", that.eqtableData)
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
     * 此方法旨在向地图中添加雅安市的行政区划影像图层如果图层已存在，则不会重复添加
     * 使用Cesium库加载GeoJSON数据，并根据图层是否已存在来设置不同的显示样式
     */
    addYaanImageryDistrict() {
      // 移除其他区域图层
      this.removethdRegions()
      this.removeDataSourcesLayer('YaanRegionLayer');

      let geoPromise = Cesium.GeoJsonDataSource.load(yaan, {
        clampToGround: true, //贴地显示
        stroke: Cesium.Color.RED,
        fill: Cesium.Color.SKYBLUE.withAlpha(0.5),
        strokeWidth: 4,
      });
      // 处理加载成功的GeoJSON数据
      geoPromise.then((dataSource) => {
        // 添加 geojson
        window.regionLayerJump = dataSource;
        window.viewer.dataSources.add(dataSource);
        // 给定义好的 geojson 的 name 赋值（这里的 dataSource 就是定义好的geojson）
        dataSource.name = "thd_yaanregion";
        // 视角跳转到 geojson
        viewer.flyTo(dataSource.entities.values);

      }).catch((error) => {
        // 处理加载失败的情况
        console.error("加载GeoJSON数据失败:", error);
      });

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
      this.removeDataSourcesLayer('YaanRegionLayer');
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
          window.regionLayerJump = dataSource

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
      // 检查是否存在名为regionLayerJump的图层
      if (window.regionLayerJump) {
        // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
        window.viewer.dataSources.remove(window.regionLayerJump, true);
        // 清空regionLayerJump的引用，以便垃圾回收
        window.regionLayerJump = null;


        // //console.log("图层已移除");
      }
      this.isShowYaanRegionLegend = false;
      // 获取图例容器，准备清空其内容
      // const legend = document.getElementById('legend');
      // 循环移除图例容器中的所有子元素
      // while (legend.firstChild) {
      //     legend.removeChild(legend.firstChild);
      // }
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
    * 视角跳转互斥复选框
    * 每次只能选中一个视角，其他复选框默认关闭
    * */
    handleDistrictSelect(districtName) {
      // 清除其他实体标签
      this.removethdRegions();
      this.removeDataSourcesLayer('YaanRegionLayer');

      // 根据选中的区域进行处理
      if (districtName === '雅安市') {
        this.addYaanImageryDistrict();
      } else if (districtName === '回到震中') {
        this.backcenter();
      } else {
        const district = this.districts.find(d => d.name === districtName);
        if (district) {
          this.handleDistrictClick(district);
        }
      }
    },
    updateMapLayers() {
      // 检查选中的图层中是否包含标绘点图层
      const hasDrawingLayer = this.selectedlayersLocal.includes('标绘点图层');
      // 如果包含标绘点图层
      if (hasDrawingLayer) {
        // 确认标绘图层变更，参数为true表示已选中
        this.handleMarkingLayerChange(true);
        // 更新绘图状态
        this.updatePlotOnce(true);
        // this.updatePlotOnce(false);
      } else {
        // 确认标绘图层变更，参数为false表示未选中
        this.handleMarkingLayerChange(false);
        // 移除所有已存在的椭圆圈实体，以避免重复添加
        // this.removeEntitiesByType("ovalCircle")
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
        if (window.duanliedai) {
          // 从viewer的数据源中移除图层，第二个参数为true表示强制移除
          window.viewer.dataSources.remove(window.duanliedai, true);
          // 清空regionLayerJump的引用，以便垃圾回收
          window.duanliedai = null;
          // //console.log("图层已移除");
        }
        // 如果未选定断裂带要素图层，则移除断裂带图层
       this.removeDataSourcesLayer('duanliedai');
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
            // //console.log("--------", index, "----------------", entity)
          });
          // //console.log("dataSource--------------", dataSource.entities.values.length)

          // 生成图例
          this.isShowYaanRegionLegend = true;
          // const legend = document.getElementById('legend');
          // legend.style.display = 'block';
          // colors.forEach((colorItem, index) => {
          //     if (index > 0) {
          //         const colorBox = document.createElement('div');
          //         colorBox.style.display = 'flex';
          //         colorBox.style.alignItems = 'center';
          //         colorBox.style.marginBottom = '5px';
          //
          //         // 创建颜色方块
          //         const colorSquare = document.createElement('div');
          //         colorSquare.style.width = '20px';
          //         colorSquare.style.height = '20px';
          //         colorSquare.style.backgroundColor = colorItem.color.toCssColorString(); // 转换 Cesium 颜色为 CSS 颜色字符串
          //         colorSquare.style.marginRight = '10px';
          //
          //         // 创建颜色名称标签
          //         const colorLabel = document.createElement('span');
          //         colorLabel.textContent = colorItem.name;
          //
          //         // 将颜色方块和名称加入到图例中
          //         colorBox.appendChild(colorSquare);
          //         colorBox.appendChild(colorLabel);
          //         legend.appendChild(colorBox);
          //     }
          //
          // });
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
      let baseURL = import.meta.env.VITE_APP_API_URL
      // 检查是否已存在名为'PopLayer'的图层
      let popLayerexists = this.imageryLayersExists('PopLayer')
      if (!popLayerexists) {
        // 如果不存在，则创建并添加新的WMS图层
        let popLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.WebMapServiceImageryProvider({
              url: baseURL + '/geoserver/yaan/wms', // WMS服务的URL
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
              // url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=" + token,
              url: `${tianditu}/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&tk=${token}`,
              layer: "tdtAnnoLayer",
              style: "default",
              format: "image/jpeg", // 根据实际返回的图像格式调整
              tileMatrixSetID: "w", // 如果URL中已经指定了tileMatrixSet，则此参数可能不是必需的
              show: true
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
        //console.log("item", item)
        // 从 dataSource 中删除点
        if (window.pointDataSource) {
          const entityToRemove = window.pointDataSource.entities.getById(item.plotId);
          const ellipseEntityToRemove = window.pointDataSource.entities.getById((item.plotId + '_ellipse'));

          //将标绘点实体删除
          this.plotisshow[item.plotId] = 0;
          cesiumPlot.deletePointById(item.plotId);

          //console.log("entityToRemove", entityToRemove)
          if (entityToRemove) {
            window.pointDataSource.entities.remove(entityToRemove); // 移除点
          }
          if (ellipseEntityToRemove) {
            window.pointDataSource.entities.remove(ellipseEntityToRemove); // 移除标绘点的动画实体
          }
        }

        //将标绘点实体删除
        // viewer.entities.removeById(item.plotId);
        // // 标记该plotId对应的图层为隐藏状态
        // this.plotisshow[item.plotId] = 0

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
     * @param {string} longitude - 经度坐标，用于指定查询区域的中心点
     * @param {string} latitude - 纬度坐标，用于指定查询区域的中心点
     */
    getPopDesity(longitude, latitude) {
      let baseURL = import.meta.env.VITE_APP_API_URL
      // WMS服务的URL
      const url = baseURL + '/geoserver/yaan/wms'
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
      // //console.log('GetFeatureInfo URL:', fullUrl);
      // 发送HTTP请求，并处理响应
      fetch(fullUrl).then(response => response.json()).then(data => {
        // 处理返回的数据，这里仅打印出人口密度信息
        // //console.log(data.features[0].properties)
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
    updatethematicMap() {
      if (this.selectthematicMap) {
        this.ifShowMapPreview = true
        const selectedData = MapPicUrl.find(item => item.eqid === this.eqid && item.name === this.selectthematicMap);
        //console.log(selectedData)
        this.imgurlFromDate = selectedData.path
        this.imgName = selectedData.name
        this.showTypes = 1
        // //console.log("11111",this.imgurlFromDate, this.imgName)
        this.imgshowURL = new URL(this.imgurlFromDate, import.meta.url).href
        console.log("updatethematicMap",this.imgshowURL, this.imgName)
      } else {
        this.ifShowMapPreview = false
      }

    },

    // 飞到目标位置
    flyToPosition() {
      const lon = parseFloat(this.positionFlyTo.lon);
      const lat = parseFloat(this.positionFlyTo.lat);

      if (!isNaN(lon) && !isNaN(lat)) {
        window.viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(lon, lat, 3000),
          duration: 2, // 飞行时间
        });
      } else {
        this.$message.error("请输入有效的经度、纬度和高度值！");
      }
    },

    clearPositionPanel() {
      this.positionFlyTo.lon = ''
      this.positionFlyTo.lat = ''
      this.showPositionFlyTo = false
    },
    showThematicMapDialog(item) {
      console.log("专题图弹窗逻辑",item)
      // 显示专题图弹框逻辑
      this.ifShowMapPreview = true;
      this.imgName = item.name;
      this.imgshowURL = item.path;
    },
    ifShowThematicMapDialog(val) {
      this.ifShowMapPreview = val;
      if (!val) {
        this.imgName = "";
        this.imgshowURL = "";
      }
    },
    //专题图 end

    //报告产出
    updateReportItem() {
      if (this.selectReportItem) {
        //console.log(this.selectReportItem)
        const selectedData = ReportUrl.find(item => item.eqid === this.eqid && item.name === this.selectReportItem);
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
    },

    //模型调整
    initModelTable() {
      getAllModel().then(res => {
        this.modelList = res
        this.ModelTotal = res.length
        this.modelTableData = this.getPageArr(this.modelList)
      })
    },
    goModel(row) {
      this.modelInfo.name = row.name
      this.modelInfo.path = row.path
      this.modelInfo.tz = row.tz
      this.modelInfo.rz = row.rz
      this.modelInfo.time = row.time
      this.modelInfo.modelid = row.modelid
      this.modelInfo.tze = row.tze
      this.modelInfo.rze = row.rze
      goModel(row)
    },
    watchTerrainProviderChanged() {
      window.viewer.scene.terrainProviderChanged.addEventListener(terrainProvider => {
        if (isTerrainLoaded()) {
          transferModel(window.modelObject, 0, 0, this.modelInfo.tze, 100)
          rotationModel(window.modelObject, this.modelInfo.rze)
          findModel()
        } else {
          transferModel(window.modelObject, 0, 0, this.modelInfo.tz, 100)
          rotationModel(window.modelObject, this.modelInfo.rz)
          findModel()
        }
      });
    },
    findModel() {
      findModel()
    },
    // 修改table的header的样式
    tableHeaderColor() {
      return {
        'background': 'linear-gradient(180deg, rgba(27,60,108,0.09) 0%, rgba(20,83,174,1) 100%)',
        'color': '#fff',
        'text-align': 'center',
        'font-size': '13px',
        'padding': '0',
        'margin': '0'
      }
    },
    // 修改table 中每行的样式
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 == 1) {
        return {
          'background-color': '#ffffff00',
          'padding': '0',
          'margin': '1'
        }
      } else {
        return {
          'background-color': '#ffffff00',
          'padding': '0',
          'margin': '1'
        }
      }
    },
    //数组切片
    getPageArr(data) {
      let arr = []
      let start = (this.modelCurrentPage - 1) * this.modelPageSize
      let end = this.modelCurrentPage * this.modelPageSize
      if (end > this.ModelTotal) {
        end = this.ModelTotal
      }
      for (; start < end; start++) {
        data[start].show = false
        arr.push(data[start])
      }
      return arr
    },
    //`每页 ${val} 条`
    handleSizeChange(val) {
      this.modelPageSize = val
      this.modelTableData = this.getPageArr(this.modelList)
    },
    // `当前页: ${val}`
    handleCurrentChange(val) {
      this.modelCurrentPage = val
      this.modelTableData = this.getPageArr(this.modelList)
    },
    //model style end
    /*获取目前相机所属高度*/




    // ------------------------------图层要素---------------------------------------------------
    handleCheckChange(data, checked, indeterminate) {
      console.log('handleCheckChange triggered', {data, checked, indeterminate});

      // 获取当前所有选中的具体图层节点
      const selectedLayers = this.$refs.tree.getCheckedNodes(false)
          .filter(node => this.layeritems.some(item => item.name === node.name))
          .map(node => node.name);

      console.log("selectedLayers:", selectedLayers);

      // 只有当选中的是 layeritems 中的图层节点时,才更新选中的图层列表和地图图层
      if (selectedLayers.length > 0) {
        this.selectedlayersLocal = selectedLayers;
        this.updateMapLayers(); // 更新地图图层
      }

    },
    handleNodeClick(data) {
      console.log('hhhhhhhhhhhhhh', data);
    },
    loadNode(node, resolve) {
      // 根节点层
      if (node.level === 0) {
        return resolve([
          {name: '图层要素'},
          {name: '视角跳转'}
        ]);
      }

      // 第一层子节点
      let data = [];
      if (node.data.name === '图层要素') {
        // 返回所有图层项目
        data = this.layeritems.map(item => ({
          name: item.name
        }));
      } else if (node.data.name === '视角跳转') {
        // 返回视角跳转的选项
        data = [
          {name: '回到震中'},
          {name: '雅安市'},
          ...this.districts.map(district => ({
            name: district.name
          }))
        ];
      }

      resolve(data);
    },
    // 弹框不同时出现
    togglePositionFlyTo() {
      // console.log('1.------------------------------')
      // console.log(this.showPositionFlyTo)
      this.showPositionFlyTo = !this.showPositionFlyTo;
      if (this.showPositionFlyTo) {
        this.showLayerFeatures = false; // 关闭其他弹框
        this.showEqListPanel = false; // 关闭其他弹框
        this.showModelPanel = false; // 关闭其他弹框
      }
    },
    toggleLayerFeatures() {
      // console.log('2.------------------------------')
      // console.log(this.showLayerFeatures)
      this.showLayerFeatures = !this.showLayerFeatures;
      if (this.showLayerFeatures) {
        this.showPositionFlyTo = false; // 关闭其他弹框
        this.showEqListPanel = false; // 关闭其他弹框
        this.showModelPanel = false; // 关闭其他弹框
      }
    },
    // 控制地震列表显隐
    toggleEqListPanel() {
      this.showEqListPanel = !this.showEqListPanel;
      if (this.showEqListPanel) {
        this.showLayerFeatures = false; // 关闭其他弹框
        this.showPositionFlyTo = false; // 关闭其他弹框
        this.showModelPanel = false; // 关闭其他弹框
      }
    },
    toggleModelPanel() {
      this.showModelPanel = !this.showModelPanel;
      if (this.showModelPanel) {
        this.showLayerFeatures = false; // 关闭其他弹框
        this.showPositionFlyTo = false; // 关闭其他弹框
        this.showEqListPanel = false; // 关闭其他弹框
      }
    },
  }
}
</script>

<style scoped>
.menue-left {
  left: 9%;
}

.logo-menu .logo-menu-active {
  box-shadow: 0 0 15px #007fde, inset 0 0 25px #06b7ff;
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

.logo-menu {
  position: absolute;
  top: 6px;
  display: flex;
}

.menue-right {
  right: 3%;
}

.logo-left-weather {
  color: #fff;
  position: absolute;
  top: 5px;
  left: 9px;
}

.logo-left-time {
  position: absolute;
  top: 2.3vh;
  left: 1vw;
  width: 9vw;
}

.logo-right-time {
  position: absolute;
  top: 2.3vh;
  right: 1vw;
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

.pop-dialog .pop-dialog__content {
  height: 100%;
  overflow: auto;
  background-color: #1d3043;
}

.pop-dialog {
  height: 5.5rem;
}

.preview-dialog {
  position: absolute;
  top: 50px;
  right: 20px;
  width: 300px;
  height: 300px;
  background: #333;
  border: 1px solid #fff;
  z-index: 1000;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  background: #1c84c6;
  color: #fff;
  padding: 5px 10px;
}

.preview-content {
  padding: 10px;
  text-align: center;
}

.toggle-buttons {
  display: flex;
  gap: 35px;
  margin-bottom: 10px;
  width: 60%;
  margin-top: 10px;
  left: 19%;
  position: relative;
}

.section {
  margin-bottom: 20px;
  overflow-y: auto; /* 启用垂直滚动条 */
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #fff;
}

.grid-container {
  flex-wrap: wrap;
  height: 69vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 创建2列，等宽 */
  gap: 8px; /* 列间距 */
  padding: 5px;
}

.grid-container-report {
  height: auto; /* 内容高度根据内容自适应 */
  display: grid;
  flex-wrap: wrap;
  grid-template-columns: repeat(2, 1fr); /* 创建2列，等宽 */
  gap: 8px; /* 列间距 */
  padding: 5px;
}

.report-name {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.report-bottom {
  color: #d8cc0e;
  text-align: right;
}

.el-card {
  background-color: #ffffff47;
}

:deep(.el-card__body) {
  padding: 10px 10px 0px 10px !important;
}

.grid-item {
  width: calc(100% - 7px);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保图片显示完整 */
  border-radius: 5px;
}

.item-info {
  text-align: center;
  margin-top: 5px;
}

.item-title {
  font-size: 0.9rem;
  color: #fff;
  margin-bottom: 9px;
  margin-top: 3px;
}

.el-card__body {
  padding: 10px 10px 0px 10px !important;
}

.report-list {
  list-style: none;
  padding: 0;
}

.report-item {
  margin-bottom: 10px;
}

.report-item a {
  color: #1c84c6;
  text-decoration: underline;
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


.top-header {
  height: 24vh;
  width: 100%;
  background: url(@/assets/images/CommandScreen/导航栏底图.png) no-repeat;
  background-size: 100% 100%;
  top: 0%;
  position: absolute;
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

.bottom-footer {
  width: 100%;
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  height: 12vh;
  background: url(/src/assets/images/CommandScreen/导航栏底部.png) 47% 116% no-repeat;
}

.pop_left_background {
  top: 13%;
  left: 1%;
  height: 80.8vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(90deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(44, 69, 94, 0) 100%);
}

:deep(.pop_right_background) {
  top: 13%;
  right: 1%;
  height: 80.8vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
  z-index: 100;
}

#box {
  height: 99vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  overflow-y: hidden;
}

#cesiumContainer {
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.current-time-info {
  position: absolute;
  bottom: 3%;
  width: 30%;
  left: 12%;
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
  margin-left: -4%;
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

.speed-selector {
  position: absolute;
  cursor: pointer;
  display: inline-block;
  right: -12%;
  bottom: -50%;
}

.speedButton {
  padding: 2px 20px;
  background-color: #dddddd; /* 蓝色背景 */
  border-radius: 30px; /* 椭圆框 */
  text-align: center;
  color: #1b6cd0; /* 文字颜色 */

}

.chooseSpeed {
  position: absolute;
  bottom: 100%; /* 向上展开 */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  background-color: #dddddd; /* 蓝色背景 */
  padding: 5px 0;
  border-radius: 6px; /* 椭圆框 */
  min-width: 100%; /* 确保下拉菜单宽度至少与按钮一样宽 */
  z-index: 1000; /* 确保下拉菜单在最上层 */
}

.speed-option {
  padding: 2px 20px;
  color: #1b6cd0; /* 文字颜色 */
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.speed-option:hover,
.speed-option:focus {
  background-color: #71a8e3; /* 蓝色背景 */
}

.speed-option.selected {
  background-color: #71a8e3; /* 选中项更深的蓝色 */
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

.thd-listTable {
  width: 26.5%;
  top: 13%;
  height: 79%;
  z-index: 30;
  right: 0.3%;
  position: absolute;
}

:deep(.thd-Table ) {
  top: 8%;
  z-index: 30;
  width: 100%;
  height: 85% !important;
  left: -3%;
  position: absolute;
}

.thd-listTable-cesium {
  width: 22.5%;
  top: 13%;
  height: 79%;
  z-index: 30;
  right: 0.3%;
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

.pop {
  position: absolute;
  width: 100%;
  z-index: 0;
  border-color: #05709d;
  background: rgb(4, 20, 34);
  /*background: rgba(47, 82, 117, 0.3) 88%;*/
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

.pop_header {
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

:deep(.search-results) {
  z-index: 99 !important;
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



.modelAdj {
  color: #FFFFFF;
  margin-bottom: 5px;
  margin-right: 10px;
  display: inline-block; /* 确保元素显示在同一行 */
  border: 1px solid #ffffff; /* 边框宽度、样式和颜色 */
  padding: 5px; /* 可选：添加内边距 */
}

.el-pagination {
  margin-top: 10px;
  justify-content: center;
}

:deep(.el-pagination__total) {
  color: #FFFFFF;
}

:deep(.el-pagination>.is-last) {
  color: #FFFFFF;
}

/* 更改搜索、切换地形图组件位置*/
:deep(.cesium-viewer-toolbar) {
  display: block;
  position: absolute;
  top: 94.5%;
  left: 9.5%;
  z-index: 100;
}

.cesium-viewer-geocoderContainer .cesium-geocoder-input {
  border: solid 1px #444;
  background-color: rgba(40, 40, 40, 0.7);
  color: white;
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 32px;
  margin: 0;
  padding: 0 32px 0 0;
  box-sizing: border-box;
  transition: width ease-in-out 0.25s, background-color 0.2s ease-in-out;
  border-radius: 14%;
}

:deep(.cesium-viewer-geocoderContainer .search-results) {
  position: absolute; /* 确保下拉框位置相对于父容器 */
  bottom: 100%; /* 将下拉框移到搜索框的上方 */
  transform: translateY(-5px); /* 可选：向上移动一些距离 */
  z-index: 999; /* 确保下拉框在其他元素之上 */
}

/* 更改比例尺位置 */
:deep(.distance-legend) {
  bottom: 1% !important;
  pointer-events: auto;
  position: absolute;
  border-radius: 15px;
  padding-left: 5px;
  padding-right: 5px;
  height: 30px;
  right: 1%;
  top: 94%;
  width: 125px;
  box-sizing: content-box;
}

/* 更改指南针位置 */
:deep(.compass) {
  pointer-events: auto;
  position: absolute;
  width: 94px;
  height: 94px;
  transform: scale(0.6);
  z-index: 500;
  overflow: hidden;
  left: 6.5%;
  top: 91.5%;
}

.table {
  width: 100%;
  height: 98%;
  margin-bottom: 8px;
  text-align: center;
}

:deep(.el-table__body-wrapper) {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: rgba(23, 54, 76, 0);
}

/* 设置“图层要素”样式 */
:deep(.collapse ) {
  font-size: 16px; /* 标题字号 */
  font-weight: bold; /* 标题加粗 */
  color: white; /* 标题文字颜色 */
  background-color: rgba(22, 53, 77, 0.9); /* 背景色 */
  border: none !important; /* 取消边框 */
}

:deep(.el-collapse-item ) {
}

:deep(.el-checkbox__label ) {
  background-color: rgba(22, 53, 77, 0.9); /* 背景色 */
  color: white; /* 内容文字颜色 */
  font-size: 14px; /* 内容字号 */
  padding: 10px; /* 内容内边距 */
}

:deep(.el-collapse-item__header ) {
  background-color: rgba(41, 68, 89, 0.9); /* 背景色 */
  color: #ffffff; /* 内容文字颜色 */
  font-size: 16px; /* 内容字号 */
  padding: 10px; /* 内容内边距 */
  font-weight: 580;
}

:deep(.el-collapse-item__wrap) {
  background-color: rgba(22, 53, 77, 0.9); /* 背景色 */
  color: #ffffff; /* 内容文字颜色 */
}

:deep(.el-collapse-item__content) {
  padding: 10px;
}

:deep(.el-radio) {
  background-color: rgba(22, 53, 77, 0); /* 背景色设为透明 */
  color: #ffffff; /* 内容文字颜色 */
}

/* 影像服务-弹框样式 */
:deep(.cesium-baseLayerPicker-dropDown) {
  left: 3px !important;
  bottom: 41px;
  width: 398px !important;
  height: 310px !important;
}

.timelineRunningTimeLabel {
  background-color: #163253;
  border-radius: 20px;
  height: 6%;
  width: 20%;
  top: 12%;
  position: absolute;
  z-index: 50;
  color: #FFFFFF;
  font-size: 23px;
  left: 41%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 整个滚动条 */
::-webkit-scrollbar {
  width: 6px; /* 滚动条的宽度 */
  height: 12px; /* 滚动条的高度，对水平滚动条有效 */
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

.personbutton {
  position: absolute;
  z-index: 60;
  top: 20.5%;
  left: 31%;
}

.el-button {
  font-size: 1rem !important; /* 调整按钮字体大小 */
  width: 60%; /* 使按钮宽度自适应 */
  height: 3vh;
}

:deep(.el-button--primary) {
  border-color: #fff42e; /* 白色边框 */
  background-color: #1a3749;
  color: #ffeb02; /* 白色字体 */
}

:deep(.el-button--primary):hover {
  background-color: rgba(255, 255, 255, 0.2); /* 可选：鼠标悬浮时的背景色 */
}

:deep(.el-button--primary):active {
  background-color: rgba(255, 255, 255, 0.4); /* 可选：鼠标按下时的背景色 */
}

:deep(.timelineLegend) {
  width: 22vw;
}

:deep(.new-panel) {
  top: 6%;
  left: 112%;
  width: 218%;
}

:deep(.detailedNews) {
  width: 221%;
  height: 69%;
  top: 6%;
  right: 112%;
  z-index: 80;
}

:deep(.news-title:after) {
  top: 21%;
}

:deep(.timelineLegend.open) {
  width: 33%;
}

:deep(.eldriver) {
  width: 300px;
}

.positionFlyToButton {
  width: 32px;
  height: 32px;
  background-color: #303336;
  border: #444444 solid 1px;
  border-radius: 14%;
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.positionFlyToButton:hover {
  color: #fff;
  fill: #fff;
  background: #48b;
  border-color: #aef;
  box-shadow: 0 0 8px 3px #48b; /* 添加发光特效 */
}

.positionFlyToButton:first-child {
  top: 90%;
  left: 1%;
}

.positionFlyToButton:nth-child(2) {
  top: 94%;
  left: 1%;
}

.universalPanel {
  position: absolute;
  left: 1%;
  bottom: 6%;
  width: 450px;
  border-radius: 5px;
  background: rgb(0, 195, 255);
  background: linear-gradient(90deg, rgb(22 105 179 / 9%) 25%, rgb(10 33 75 / 76%) 88%);
  color: #fff;
  z-index: 100;
  top: 110px;
  right: 0;
  z-index: 100;
}

.panelTop {
  top: 0.5%;
  height: 3.8vh;
  position: relative;
  background-image: url("@/assets/images/CommandScreen/标题底图.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.panelName {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  position: relative;
  top: 26%;
  left: 7%;
}

.panelContent {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 15px;
  width: 100%;
  margin-top: 30px;
}

.panelButton {
  padding: 0 0 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.panelButtons {
  width: 30%;
  height: 30px;
}

.universalPanel {
  position: absolute;
  top: 110px;
  right: 0;
  width: 450px;
  border-radius: 5px;
  background-color: rgba(53, 59, 67, 0.8);
  z-index: 100;
}

.panelTop {
  width: 100%;
  padding: 10px;
  height: 50px;
  border-radius: 5px;
  background-color: rgba(40, 59, 77, 0.8);
}

.panelName {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  position: relative;
  margin: 0;
}

/* 表格内容样式 */
.model-dialog__content {
  height: calc(100% - 41px);
  padding: 11px;
  overflow: auto;
  line-height: 41px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 500;
}

:deep(.checkBotton) {
  font-size: .8rem !important;
}

:deep(.el-table) {
  --el-table-border: 0;
  background-color: transparent; /* 表格背景透明 */
}

:deep(.el-table--default .cell) {
  padding: 0 4px;
}

:deep(.el-table tr) {
  background: #ffffff00;
  color: #ffffff;
  font-weight: 1000;
  position: relative;
  transition: box-shadow 0.3s ease; /* 添加过渡效果 */
}

/* 初始隐藏箭头图标 */
.arrow-icon {
  display: none; /* 默认隐藏 */
  width: 18px;
  height: 20px;
  background: url("@/assets/images/arrow.png") no-repeat center;
  background-size: contain;
}

/* 鼠标悬浮在行时显示箭头图标 */
:deep(.el-table tr:hover) .arrow-icon {
  display: block; /* 行 hover 时显示箭头图标 */
}

:deep(.el-table tr:hover) {
  background: linear-gradient(0deg, rgba(38, 166, 221, 0.9) 30%, rgba(230, 247, 255, 1) 100%);
  font-weight: 1000;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  box-shadow: 0 0 8px 2px rgba(48, 140, 255, 1);
}

/* 表格自定义样式 */
.custom-table {
  text-align: center;
}

:deep(.el-table__inner-wrapper::before) {
  width: 0;
}

:deep(.eqTable) {
  bottom: -55px;
  height: calc(100% - 153px);
  width: 100%;
  right: 1%;
}

:deep(.eqList) {
  height: calc(69vh - 181px);
}

:deep(.pagination) {
  z-index: 999;
  width: 100%;
  border-color: #05709d;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
}

:deep(.eqCard:hover) {
  box-shadow: 0 0 15px #007fde, inset 0 0 25px #06b7ff;
  background: transparent;
  transition: all 0.3s;
}

/* 左下角视角按钮样式 */
.el-tree {
  margin-top: 8px;
  font-size: 20px;
  --el-tree-node-content-height: 30px;
  --el-tree-text-color: #f6f7f9;
  --el-tree-node-hover-bg-color: rgb(24, 39, 70); /* 修改为透明的绿色 */
  background-color: transparent; /* 背景设置为透明 */
}

/deep/ [data-v-6c1071c6] .el-checkbox__label {
  background: transparent;
  color: white;
  font-size: 15px;
  padding: 10px;
}

/deep/ [data-v-6c1071c6] [data-v-6c1071c6] .el-radio {
  background-color: rgba(22, 53, 77, 0);
  color: #f6f7f9;
  font-size: 19px;
}

.el-radio__label {
  font-size: 15px;
  padding-left: 8px;
}

.el-radio[data-v-6c1071c6] {
  --el-radio-font-size: 15px;
}

.el-tree-node__content:hover {
  background-color: transparent;
}

.tree-node-content {
  display: flex;
  align-items: center;
}

.node-icon {
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tree-node-content {
  display: flex;
  align-items: center;
}

.icon {
  width: 30px;
  height: 30px;
  margin-right: 4px;
  fill: currentColor;
}

.node-text {
  display: inline-block;
  vertical-align: middle;
  color: #ffffff;
}

.el-tree-node {
  outline: none;
  white-space: nowrap;
  margin-top: 5px;
}

/deep/ [data-v-6c1071c6] [data-v-6c1071c6] .el-checkbox__label {
  background: transparent;
  color: white;
  font-size: 15px;
  padding: 12px;
}
</style>
