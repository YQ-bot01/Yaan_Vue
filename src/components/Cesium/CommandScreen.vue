<template>
  <div>
    <!--    灾情预估切换-->
    <div class="thd-listTable" v-if="activeComponent === 'damageThemeAssessment'">
      <div class="pop_right_background" style="width: 100%; height: 100%; z-index: 100;top: 0;overflow: hidden">
        <damageThemeAssessment
            :eqid="eqid"
            :eqqueueId="eqqueueId"
        >
        </damageThemeAssessment>
      </div>
    </div>
    <!--  态势标绘  -->
    <div class="thd-listTable-cesium" v-if="activeComponent === 'cartographicStatistics'">
      <div class="pop_right_background" style="width: 100%; height: 100%; z-index: 100;top: 0;">
        <div class="list-dialog__content" style="height: calc(100% - 30);">
          <timeLineCasualtyStatisticthd
              :zoomLevel="zoomLevel"
              :pointsLayer="plots"
              :currentTime="currentTimeString"
          />
        </div>
      </div>
      <plotSearch
          :eqid="eqid"
          :plotArray="plots"
      ></plotSearch>
    </div>
    <div v-if="activeComponent === 'layerChoose'" class="thd-listTablePint">

      <div class="emergencySelect">
        <div class="emergencyTitles">
          <div v-for="(item, index) in emergencyTitleProperty" :key="index" class="emergencyTitle">
            <img :src="item.icon" :title="item.name" style="height: 31px; width: 31px">
            <span class="emergencyName">{{ item.name }}</span>
          </div>
        </div>

        <div class="emergencyContents">
          <div
              v-for="(item, index) in emergencyTitleProperty"
              :key="index"
              class="emergencyContent"
          >
            <!-- 渲染每个item.content -->
            <div
                v-for="(contentItem, subIndex) in item.content"
                :key="subIndex"
                class="emergencyContentItem"
                :class="{active: contentItem.active}"
                @click="emergencyClick(contentItem)"
            >
              {{ contentItem.name }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="isShowMessage"
           style="position: fixed; top: 150px; left: 50%; transform: translate(-50%, -50%); z-index: 9999; display: flex; align-items: center; justify-content: center; width: 200px; height: 50px; background-color: rgba(13, 50, 95, 0.7);border-radius: 10px;">
        <p style="color: #fff; margin: 0;">请添加受灾点</p>
      </div>

      <!--物资查询-->

      <div class="emergencyPanel" v-if="panels.materialMatching">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">物资查询</h2>
        </div>

        <div class="panelContent"
             style=" gap: 30px;padding-right: 3%;padding-left: 3%;padding-bottom: 5%; width: 100%;display: flex;justify-content: center;align-items: center">
          <el-button @click="searchRescueSupplies" class="cyber-button">
            <span class="glow-text">救·援·物·资</span>
            <div class="gradient-border"></div>
          </el-button>

          <el-button @click="searchRescueForces" class="cyber-button">
            <span class="glow-text">救·援·力·量</span>
            <div class="gradient-border"></div>
          </el-button>

          <el-button @click="searchRescueEquipment" class="cyber-button">
            <span class="glow-text"> 救·援·装·备</span>
            <div class="gradient-border"></div>
          </el-button>
        </div>

        <div style="width: 100%;display: flex;justify-content: center;align-items: center">
          <div class="panelButtons">
            <el-button @click="panels.materialMatching = false">取消</el-button>
            <el-button type="primary" @click="searchAll">
              显示所有物资点
            </el-button>
          </div>
        </div>

      </div>


      <!--救援物资查询-->
      <div class="emergencyPanel" v-if="panels.searchSupplyDialog">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">救援物资查询</h2>
        </div>

        <div class="panelContent">
          <el-form class="panelForm" :model="searchSupplyForm" label-width="80px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="区域">
                  <el-input v-model="searchSupplyForm.county" autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地址">
                  <el-input v-model="searchSupplyForm.address" autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="联系人">
                  <el-input v-model="searchSupplyForm.contactPerson" autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="searchSupplyForm.contactPhone" autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div style="width: 100%;display: flex;justify-content: center;align-items: center">
          <div class="panelButtons">
            <el-button @click="panels.searchSupplyDialog = false">取消</el-button>
            <el-button type="primary" @click="searchSupply">
              查询
            </el-button>
          </div>
        </div>

      </div>


      <!-- 救灾装备查询-->
      <div class="emergencyPanel" v-if="panels.searchEquipmentDialog">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">救灾装备查询</h2>
        </div>

        <div class="panelContent">
          <el-form class="panelForm" :model="equipmentSupplyForm" label-width="80px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="区域">
                  <el-input v-model="equipmentSupplyForm.county" autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地址">
                  <el-input v-model="equipmentSupplyForm.address" autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="联系人">
                  <el-input v-model="equipmentSupplyForm.contactPerson" autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="equipmentSupplyForm.contactPhone" autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div style="width: 100%;display: flex;justify-content: center;align-items: center">
          <div class="panelButtons">
            <el-button @click="panels.searchEquipmentDialog = false">取消</el-button>
            <el-button type="primary" @click="searchEquipment">
              查询
            </el-button>
          </div>
        </div>

      </div>


      <!--救援力量查询-->
      <div class="emergencyPanel" v-if="panels.searchEmergencyTeamDialog">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">救援力量查询</h2>
        </div>

        <div class="panelContent">
          <el-form class="panelForm" :model="searchEmergencyTeamForm" label-width="120px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="级别名称">
                  <el-input v-model="searchEmergencyTeamForm.levelName" autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="队伍类型名称">
                  <el-input v-model="searchEmergencyTeamForm.teamTypeName" autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="队伍人数">
                  <el-input
                      v-model="displayTeamTotalMembers"
                      @input="handleTeamTotalMembersInput"
                      autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地址">
                  <el-input v-model="searchEmergencyTeamForm.address" autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="负责人">
                  <el-input v-model="searchEmergencyTeamForm.personInCharge" autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负责人电话">
                  <el-input v-model="searchEmergencyTeamForm.chargePhone" autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div style="width: 100%;display: flex;justify-content: center;align-items: center">
          <div class="panelButtons">
            <el-button @click="panels.searchEmergencyTeamDialog = false">取消</el-button>
            <el-button type="primary" @click="searchEmergencyTeam">
              查询
            </el-button>
          </div>
        </div>
      </div>


      <!--  路径规划清除实体弹窗    -->
      <div class="emergencyPanel" v-if="panels.showRemove">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">清除实体</h2>
        </div>

        <div class="container" label-width="120px">
          <a href="#" class="button type--C" @click="removePolyline">
            <div class="button__line"></div>
            <div class="button__line"></div>
            <span class="button__text">清除规划</span>
          </a>
          <a href="#" class="button type--A" @click="removePoint">
            <div class="button__line"></div>
            <div class="button__line"></div>
            <span class="button__text">清除障碍</span>
          </a>
          <a href="#" class="button type--B" @click="removeAll">
            <div class="button__line"></div>
            <div class="button__line"></div>
            <span class="button__text">全部清除</span>
          </a>
        </div>


      </div>


      <div class="emergencyPanel" v-if="panels.marchSupplyDialog">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">救援物资匹配</h2>
        </div>

        <div class="panelContent">
          <el-form class="panelForm" :model="searchSupplyForm" label-width="80px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="帐篷">
                  <el-input
                      v-model="displayDisasterTentsCount"
                      @input="handleDisasterTentsInput"
                      placeholder="/件"
                      autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手电筒">
                  <el-input
                      v-model="displayFlashlightsCount"
                      @input="handleFlashlightsInput"
                      placeholder="/件"
                      autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="雨衣">
                  <el-input
                      v-model="displayRaincoatsCount"
                      @input="handleRaincoatsInput"
                      placeholder="/件"
                      autocomplete="off"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="雨鞋">
                  <el-input
                      v-model="displayRainBootsCount"
                      @input="handleRainBootsInput"
                      placeholder="/双"
                      autocomplete="off"/>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div style="width: 100%;display: flex;justify-content: center;align-items: center">
          <div class="panelButtons">
            <el-button @click="panels.marchSupplyDialog = false">取消</el-button>
            <el-button type="primary" @click="marchSupplies">
              查询
            </el-button>
          </div>
        </div>

      </div>

      <div class="emergencyPanel" v-if="panels.searchSupplyByRadiusDialog">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">半径查询</h2>
        </div>

        <div class="panelContent">
          <el-form class="panelForm" :model="searchSupplyForm" ref="searchSupplyForm" :rules="formRules"
                   label-width="80px">
            <el-form-item label="匹配半径"
                          prop="radius"
            >
              <el-input v-model="searchSupplyForm.radius"
                        @input="handleRadiusInput"
                        placeholder="请输入匹配的半径/km"
                        autocomplete="off"
                        style="width: 180px;"/>
            </el-form-item>
          </el-form>
        </div>
        <div style="width: 100%;display: flex;justify-content: center;align-items: center">
          <div class="panelButtons">
            <el-button @click="cancelRadiusQuery()">取消</el-button>
            <el-button type="primary" @click="marchSuppliesByRadius">
              查询
            </el-button>
          </div>
        </div>

      </div>

      <div class="emergencyPanel" v-if="panels.marchRegionsDialog">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">行政区划匹配</h2>
        </div>

        <div class="panelContent" style="padding-right: 5px" v-if="marchRegion">
          <div class="district-buttons">
            <div v-for="district in districts" :key="district.adcode" class="district-button">
              <el-button
                  @click="selectRegions(district)"
                  class="district-button"
                  :class="{ 'selected': selectedRegions.includes(district) }">
                {{ district.name }}
              </el-button>
            </div>
          </div>
        </div>


        <div style="width: 100%;display: flex;justify-content: center;align-items: center">
          <div class="panelButtons">
            <el-button @click="panels.marchRegionsDialog = false">取消</el-button>
            <el-button type="primary" @click="handleDistrictClick">
              查询
            </el-button>
          </div>
        </div>

      </div>

      <div class="emergencyPanel" style="z-index: 100;" v-if="panels.tableVisible">
        <div class="emergencyPanelTop">
          <h2 class="emergencyPanelName">{{
              listField === 'supplies' ? '救援物资' : listField === 'emergencyTeam' ? '救援力量' : listField === 'reserves' ? '救援装备' : ''
            }}</h2>
          <!-- 关闭按钮 -->
          <span class="close-btn" @click="closePanel"
                style="position: absolute; right: 10px; top: 10px; cursor: pointer; font-size: 18px;">
      &times; <!-- 叉号 -->
    </span>
        </div>

        <div class="panelContent" style="padding: 5px;margin-top: -5px">
          <!--     数据列表     -->
          <el-table
              :data="showSuppliesList"
              style="margin-bottom: 5px; text-align: center;height: 20vh"
              :stripe="true"
              :header-cell-style="tableHeaderColor"
              :cell-style="tableColor"
              :row-style="{ height: '40px' }"
              @row-click="showSupplyPoint"
          >
            <!--      救援物资      -->
            <el-table-column
                v-if="listField === 'supplies'"
                v-for="column in listFieldsOfSupplies"
                :key="column.prop"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
                show-overflow-tooltip
            ></el-table-column>
            <!--      救援力量      -->
            <el-table-column
                v-if="listField === 'emergencyTeam'"
                v-for="column in listFieldOfEmergencyTeam"
                :key="column.prop"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
                show-overflow-tooltip
            ></el-table-column>
            <!--      救灾装备      -->
            <el-table-column
                v-if="listField === 'reserves'"
                v-for="column in listFieldOfReserves"
                :key="column.prop"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
                show-overflow-tooltip
            ></el-table-column>
          </el-table>
          <!--     数据列表end     -->
        </div>
        <div style="width: 100%;display: flex;justify-content: center;align-items: center">
          <el-pagination
              v-if="panels.tableVisible"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pageSize"
              layout="total, prev, pager, next, jumper"
              :total="total"
              class="pagination1"
              style="padding: 10px"
          >
          </el-pagination>

        </div>

      </div>

      <div class="emergencyPanelRout" v-if="showTips" style="top: 70%;">
        <div class="emergencyPanelTopRout">
          <h2 class="emergencyPanelNameRout">路径规划</h2>
        </div>

        <div class="panelContent" style="padding-right: 5px;display: initial;">
          <el-row style="    margin-right: 5%;margin-left: 5%;" class="choose">
            <el-button @click="walkStyle" :style="selectedWalk">步行</el-button>
            <el-button @click="driveStyle" :style="selectedDrive">驾驶</el-button>
          </el-row>
          <div slot="header" class="clearfix"
               style="color: white;height: 84px;    margin: 2% 24px 0px;overflow-y: auto;">
            <div>
              全程约 {{ totalRoute }} 米 {{ RouteWay }} 大概需要 {{ RouteTime }}
            </div>
            <div v-if="visibleGuilde">
              <div v-for="(instruction, index) in RouteGuilde" :key="index">
                {{ instruction }}
              </div>
              <div v-if="loading" class="loading">加载中...</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 灾情统计 -->
    <div v-if="activeComponent === 'thematicMapDownload'" class="thd-listTable ">
      <div class="pop_right_background" style="width: 100%; height: 100%; z-index: 100;top: 0;">
        <disasterStatistics
            :eqid="eqid"
            :currentTime="currentTimeString"
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
      <!--      <thematic-map-preview-->
      <!--        v-if="ifShowMapPreview"-->
      <!--        :img-url="imgshowURL"-->
      <!--        :img-name="imgName"-->
      <!--        @close="ifShowThematicMapDialog(false)"-->
      <!--      />-->
    </div>


    <div id="cesiumContainer">
      <!--中心标绘信息-->
      <eqCenterPanel
          v-show="eqCenterPanelVisible"
          :position="PanelPosition"
          :popupData="PanelData"
      />
      <!--态势标绘信息-->
      <plotInfoOnlyShowPanel
          v-show="plotShowOnlyPanelVisible"
          :position="PanelPosition"
          :eqThemeName="tableName"
          :eqThemeInfo="eqThemeData"
          :popupData="PanelData"
      />
      <!--救援队伍、应急物资、避难场所图层标绘点的弹窗-->
      <RouterPanel
          :visible="routerPopupVisible"
          :position="PanelPosition"
          :popupData="routerPanelData"
      />
      <!--聚合标绘信息-->
      <dataSourcePanel
          :visible="dataSourcePopupVisible"
          :position="PanelPosition"
          :popupData="dataSourcePopupData"
      />
    </div>
    <commandScreenTitle
        :eqyear="eqyear"
        :eqmonth="eqmonth"
        :eqday="eqday"
        :centerPoint="centerPoint"
        @toggle-component="toggleComponent"
    />

    <timeLinePlay
        :viewer="viewer"
        :eqid="eqid"
        :centerPoint="centerPoint"
        :currentTime="currentTimeString"
        @updatePlots="updatePlots"
        :stopTimePlay="stopTimePlay"
        :isMarkingLayer="isMarkingLayerLocal"
        @startTimePlay="handleStartTimePlay"
    />

    <!--   灾情总览-->
    <div v-show="showSidebarComponents">
      <div class="pop_left_background">
        <timeLineEmergencyResponse
            :edit="false"
            :eqid="eqid"
            :centerPoint="centerPoint"
            :currentTime="currentTimeString"
        />
        <!--   人员伤亡-左中   -->
        <timeLinePersonnelCasualties
            :eqid="eqid"
            :currentTime="currentTimeString"
        />
        <!--        震中信息组件-->
        <timeLineBaseInfo
            :centerPoint="centerPoint"
        />
      </div>
      <timeLineLegend
          :activeComponent="activeComponent"
          @toggleComponent="toggleComponent"
      />
      <div class="pop_right_background">
        <!--生命线情况-->
        <timeLineLifeLine
            :eqid="eqid"
            :currentTime="currentTimeString"
        />
        <timeLinePlotStatistics
            :plots="plots"
            :currentTime="currentTimeString"
            :startTime="centerPoint.startTime"
            :zoomLevel="zoomLevel"
            :isTimeRunning="isTimeRunning"
            :viewCenterCoordinate="viewCenterCoordinate"
            :earthquakeName="centerPoint.earthquakeName"
            :selectedDistrict="selectedDistrict"
        />
        <timeLineMiniMap
            :viewer="viewer"
            :centerPoint="centerPoint"
        />
      </div>
    </div>

    <!--    两侧组件 end-->


    <!--   断裂带名称div   -->
    <div id="pointLabel"
         style="position: absolute; display: none; background-color: #3d423f; border: 1px solid black; padding: 5px; color: #fff; z-index: 1000; text-align: center;">
    </div>

    <!--经纬度跳转-->
    <div
        style="display: flex; align-items: center; position: absolute; top: 95.25%; left: 0.5%; z-index: 1000; pointer-events: none;">
      <div @click="togglePositionFlyTo" class="positionFlyToButton" style="pointer-events: auto;">
        <img src="../../assets/icons/svg/positionFlyTo.svg" title="经纬度跳转"
             style="width: 31px; height: 31px;">
      </div>
      <div @click="toggleLayerFeatures" class="positionFlyToButton" style="pointer-events: auto; margin-left: 5px;">
        <img src="../../assets/icons/svg/layerFeatures.svg" title="图层要素"
             style="width: 31px; height: 31px;">
      </div>
      <div @click="toggleEqListPanel" class="positionFlyToButton" style="pointer-events: auto; margin-left: 5px;">
        <img src="../../assets/icons/svg/earthquakeList.svg" title="地震列表"
             style="width: 31px; height: 31px;">
      </div>
      <div @click="toggleModelPanel" class="positionFlyToButton" style="pointer-events: auto; margin-left: 5px;">
        <img src="../../assets/icons/svg/2Dand3Dintegration.svg" title="二三维一体化"
             style="width: 31px; height: 31px;">
      </div>
      <div @click="toggleSlopeAnalysis(websock)" class="positionFlyToButton"
           style="pointer-events: auto; margin-left: 5px;" id="slope">
        <img src="../../assets/icons/svg/slopeAnalysis.svg" title="坡面分析"
             style="width: 31px; height: 31px;">
      </div>
    </div>
    <!--   经纬度跳转弹框 -->
    <div class="universalPanel" v-if="showPositionFlyTo">
      <CommandScreenViewJump
          :positionFlyTo="positionFlyTo"
          @positionFlyTo="viewJumpPositionFlyTo"
          :centerPoint="centerPoint"
          @viewJumpSelectedDistrict="viewJumpSelectedDistrict"
          :selectedDistrict="selectedDistrict"
          @stopTimePlay="handleStopTimePlay"
      />
    </div>

    <!--    图层管理弹框-->
    <div class="universalPanel" v-if="showLayerFeatures">
      <div class="panelTop">
        <h2 class="panelName">多源要素图层</h2>
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
            <span v-if="data.name === '资源调度'" class="node-icon">
                <!-- 图层要素的 SVG 图标 -->
                  <svg t="1730574016632" class="icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="6181" width="28" height="28" style="margin-right: 8px;">
                        <path
                            d="M852.6 462.9l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 764.1c-17.3 10.8-39.2 10.8-56.4 0L159.3 560c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 659c17.3 10.8 39.2 10.8 56.4 0l312.2-196 0.1-0.1z m0 156.1l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 920.2c-17.3 10.8-39.2 10.8-56.4 0L159.3 716.1c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 815c17.3 10.8 39.2 10.8 56.4 0l312.2-196h0.1zM540 106.4l324.6 204.1c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 604c-17.3 10.8-39.2 10.8-56.4 0L159.3 399.8c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l324.4-203.7c17.3-10.8 39.2-10.8 56.4 0l-0.1 0.2z"
                            p-id="6182" fill="#ffffff"></path>
                      </svg>
                  <span class="node-text">{{ data.name }}</span>
                </span>
            <span v-if="data.name === '灾损预估'" class="node-icon">
                <!-- 图层要素的 SVG 图标 -->
                  <svg t="1730574016632" class="icon" viewBox="0 0 1024 1024" version="1.1"
                       xmlns="http://www.w3.org/2000/svg" p-id="6181" width="28" height="28" style="margin-right: 8px;">
                        <path
                            d="M852.6 462.9l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 764.1c-17.3 10.8-39.2 10.8-56.4 0L159.3 560c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 659c17.3 10.8 39.2 10.8 56.4 0l312.2-196 0.1-0.1z m0 156.1l12.1 7.6c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 920.2c-17.3 10.8-39.2 10.8-56.4 0L159.3 716.1c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l12.1-7.6L483.9 815c17.3 10.8 39.2 10.8 56.4 0l312.2-196h0.1zM540 106.4l324.6 204.1c24.8 15.6 32.3 48.3 16.7 73.2-4.2 6.7-9.9 12.4-16.7 16.7L540.4 604c-17.3 10.8-39.2 10.8-56.4 0L159.3 399.8c-24.8-15.6-32.3-48.3-16.7-73.2 4.2-6.7 9.9-12.4 16.7-16.7l324.4-203.7c17.3-10.8 39.2-10.8 56.4 0l-0.1 0.2z"
                            p-id="6182" fill="#ffffff"></path>
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
            <el-checkbox
                v-if="ResourceSchedulingLayers.some(item => item.name === data.name)"
                v-model="selectedResourceScheduling"
                :label="data.name"
                @change="updateMapLayers"
            >
              <span>{{ data.name }}</span>
            </el-checkbox>
            <template v-if="DamageAssessmentLayers.some(item => item.name === data.name)">
              <el-checkbox
                  v-if="DamageAssessmentLayers.find(item => item.name === data.name)?.type === 'multipleChoice'"
                  v-model="selectedlayersLocal"
                  :label="data.name"
                  @change="updateMapLayers"
              >
                <span>{{ data.name }}</span>
              </el-checkbox>
              <!--              这里需要使用@click.native.prevent才能实现，仅仅是@click.native会被默认行为所覆盖-->
              <el-radio-group
                  v-else
                  v-model="selectedDisasterEstimate"
                  @click.native.prevent="toggleRadio(data.name)"
              >
                <el-radio :label="data.name">
                  <span>{{ data.name }}</span>
                </el-radio>
              </el-radio-group>
            </template>



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
      <CommandScreenEqList/>
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

    <!-- 坡面分析图例 -->
    <div id="legend" v-if="showSlopeAnalysis"
         style="position: absolute;
           right: 500px;
         z-index:20; bottom: 100px;
         right: 450px; color: #FFFFFF;
         background-color: rgba(0, 0, 0, 0.5);
         padding: 10px; border-radius: 5px;text-align: center;">
      <div v-for="(item, index) in slopeStatistics" :key="index">
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <div
              :style="{ width: '20px', height: '20px', marginRight: '10px', backgroundColor: item.color }">
          </div>
          <span style="width: 80px;text-align: left">{{ item.degree }}</span>
          <span style="text-align: left">{{ item.proportion }}</span>
        </div>
      </div>
    </div>

    <!--    指挥大屏-灾损预估-人员伤亡图例-->
    <div class="people-legend" v-if="showPeopleLegend" style="position: absolute;
           right: 500px;
         z-index:20; bottom: 100px;
         right: 450px; color: #FFFFFF;
         background-color: rgba(0, 0, 0, 0.5);
         padding: 10px; border-radius: 5px;text-align: center;"
    >
      <div class="legend">
        <ul>
          <li v-for="(item, index) in legendItems1" :key="index">
            <span class="legend-span"
                  :style="{ backgroundColor: `rgb(${convertColor(item.color)}, 1)`, width: '24px', height: '9px' }"></span>
            {{ item.label }}
          </li>
        </ul>
      </div>
    </div>

    <!--    指挥大屏-灾损预估-经济损失图例-->
    <div class="economic-legend" v-if="showEconomicLegend" style="position: absolute;
           right: 500px;
         z-index:20; bottom: 100px;
         right: 450px; color: #FFFFFF;
         background-color: rgba(0, 0, 0, 0.5);
         padding: 10px; border-radius: 5px;text-align: center;">
      <div class="legend">
        <ul>
          <li v-for="(item, index) in legendItems2" :key="index">
          <span class="legend-span"
                :style="{ backgroundColor: `rgba(${convertColor(item.color)}, 1)`, width: '24px', height: '9px' }"></span>
            {{ item.label }}
          </li>
        </ul>
      </div>
    </div>

    <!--    指挥大屏-灾损预估-人员伤亡图例-->
    <div class="building-legend" v-if="showBuildingLegend" style="position: absolute;
           right: 500px;
         z-index:20; bottom: 100px;
         right: 450px; color: #FFFFFF;
         background-color: rgba(0, 0, 0, 0.5);
         padding: 10px; border-radius: 5px;text-align: center;">
      <div class="legend">
        <ul>
          <li v-for="(item, index) in legendItems3" :key="index">
          <span class="legend-span"
                :style="{ backgroundColor: `rgba(${convertColor(item.color)}, 1)`, width: '24px', height: '9px' }"></span>
            {{ item.label }}
          </li>
        </ul>
      </div>
    </div>


  </div>
</template>

<script>
//依赖
import * as Cesium from 'cesium'
import CesiumNavigation from "cesium-navigation-es6";
import {getTerrainProviderViewModelsArr, initCesium} from '@/cesium/tool/initCesium.js'

//组件
import commandScreenTitle from "@/components/commandScreenComponent/commandScreenTitle.vue";
//时间轴组件
import timeLinePlay from "@/components/timeLineComponent/timeLinePlay.vue";
import timeLineEmergencyResponse from "@/components/timeLineComponent/timeLineEmergencyResponse.vue";
import timeLinePersonnelCasualties from "@/components/timeLineComponent/timeLinePersonnelCasualties.vue";
import timeLineBaseInfo from "@/components/timeLineComponent/timeLineBaseInfo.vue";
import timeLineLegend from "@/components/timeLineComponent/timeLineLegend.vue";
import timeLineLifeLine from "@/components/timeLineComponent/timeLineLifeLine.vue";
import timeLinePlotStatistics from "@/components/timeLineComponent/timeLinePlotStatistics.vue";
import timeLineMiniMap from "@/components/timeLineComponent/timeLineMiniMap.vue";
//面板
import eqCenterPanel from "@/components/Panel/eqCenterPanel.vue";
import plotInfoOnlyShowPanel from "@/components/Panel/plotInfoOnlyShowPanel";
import dataSourcePanel from "@/components/Panel/dataSourcePanel.vue";
import RouterPanel from "@/components/Panel/RouterPanel.vue";
//左下工具
import CommandScreenViewJump from "@/components/commandScreenComponent/CommandScreenViewJump.vue";


//前后端接口
import {getPlotBelongCounty, getPlotwithStartandEndTime} from '@/api/system/plot'
import {getAllEq, getAllEqList, getEqById, getEqListById, getExcelUploadEarthquake} from '@/api/system/eqlist'
//前端方法
import timeTransfer from "@/cesium/tool/timeTransfer.js";
import timeLine from "@/cesium/timeLine.js";
import {initWebSocket} from '@/cesium/WS.js'


//--未整理---
import cesiumPlot from '@/cesium/plot/cesiumPlot'
import {useCesiumStore} from '@/store/modules/cesium.js'
import centerstar from "@/assets/icons/TimeLine/震中.png";

import eqTable from '@/components/Home/eqtable.vue'
import eqlistTable from '@/components/Home/eqlistTable.vue'
import earthquakeTable from "@/components/Home/earthquakeTable.vue";
import modelTable from '@/components/Home/modelTable.vue'
import {TianDiTuToken} from "@/cesium/tool/config";
import {getEmergency, getFeaturesLayer} from "@/api/system/emergency.js";
import emergencyRescueEquipmentLogo
  from "@/assets/images/EmergencyResourceInformation/emergencyRescueEquipmentLogo.png"; // 抢险救灾设备
import rescueTeamsInfoLogo from '@/assets/images/EmergencyResourceInformation/rescueTeamsInfoLogo.png';
import emergencySheltersLogo from '@/assets/images/emergencySheltersLogo.png';
import layeredShowPlot from '@/components/Cesium/layeredShowPlot.vue'
import {
  addFaultZones,
  addHistoryEqPoints,
  addHospitalLayer, handleTownData,
  addOvalCircles, addVillageLayer,
  handleOutputData, removeDataSourcesLayer, addOCTest
} from "../../cesium/plot/eqThemes.js";
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
import {marchByRegion, searchEmergencyTeamData, searchMaterialData} from "@/api/system/emergency.js";
import axios from "axios";
import damageThemeAssessment from "./damageThemeAssessment.vue";
import disasterStatistics from "./disasterStatistics.vue"
import PlotSearch from "./plotSearch.vue";
import start from "@/assets/start.svg";
import end from "@/assets/end.svg";
import {gcj02towgs84, wgs84togcj02} from "@/api/tool/wgs_gcj_encrypts.js";
import arrow from "@/cesium/drawArrow/drawPlot.js";
import {AmapApiLocal, tianditu} from "@/utils/server.js";
import fileUrl from "@/assets/json/TimeLine/2020年6月1日四川雅安芦山县6.1级地震灾害报告.pdf";
import routePlanningIcon from '../../assets/icons/svg/routePlanning.svg';
import rescueForceMatchingIcon from '../../assets/icons/svg/rescueForceMatching.svg';
import rescueInfoTableIcon from '../../assets/icons/svg/rescueInfoTable.svg';
import disasterReliefSuppliesLogo from "@/assets/images/EmergencyResourceInformation/disasterReliefSuppliesLogo.jpg";
import {
  billboardD,
  CreateSimpleCircle,
  formatTime,
  marchSupplyByCount, pointD, polygonD,
  polylineD,
  selectPoints
} from "@/cesium/route.js";
import {deleteSlopeEntities, toggleSlopeAnalysis} from "@/cesium/slopeAnalysis.js";
import log from "@/views/monitor/job/log.vue";
import sichuanCounty from "@/assets/geoJson/sichuanCounty.json";
import siChuanCity from "@/assets/geoJson/sichuan.json";
// import siChuanProvince from "@/assets/geoJson/siChuanProvince.geojson";

import {getEqTownResult} from "@/api/system/damageassessment";
import CommandScreenEarthquakeList from '@/components/commandScreenComponent/CommandScreenEarthquakeList.vue'
import mapMark from "@/assets/地图标记.png";
import yaAn from "@/assets/geoJson/yaan1.json"
import yaAnVillage from "@/assets/geoJson/yaan.json"
import CommandScreenEqList from "@/components/Cesium/CommandScreenEqList.vue"
import {getModelData} from "@/api/system/tiltPhotography.js";
import layer from "@/cesium/layer.js";
import modelicon from '@/assets/icons/svg/3dmodel04.svg';

export default {
  computed: {
    Edit() {
      return Edit
    },
    // 在父组件中，将 JulianDate 转换为字符串
    currentTimeString() {
      if (this.currentTime) {
        // 使用 Cesium 的函数将 JulianDate 转换为 ISO 字符串
        return Cesium.JulianDate.toIso8601(this.currentTime);
      }
    },
    // 以下方法确保表单字段数据为0时不显示，初始化时数据不为null，不会报错
    displayDisasterTentsCount: {
      get() {
        return this.searchSupplyForm.tents === 0 ? '' : this.searchSupplyForm.tents;
      },
      set(value) {
        this.searchSupplyForm.tents = value === '' ? 0 : Number(value);
      }
    },
    displayFlashlightsCount: {
      get() {
        return this.searchSupplyForm.flashlights === 0 ? '' : this.searchSupplyForm.flashlights;
      },
      set(value) {
        this.searchSupplyForm.flashlights = value === '' ? 0 : Number(value);
      }
    },
    displayRaincoatsCount: {
      get() {
        return this.searchSupplyForm.raincoats === 0 ? '' : this.searchSupplyForm.raincoats;
      },
      set(value) {
        this.searchSupplyForm.raincoats = value === '' ? 0 : Number(value);
      }
    },
    displayRainBootsCount: {
      get() {
        return this.searchSupplyForm.rainBoots === 0 ? '' : this.searchSupplyForm.rainBoots;
      },
      set(value) {
        this.searchSupplyForm.rainBoots = value === '' ? 0 : Number(value);
      }
    },
    displayRadius: {
      get() {
        return this.searchSupplyForm.radius === 0 ? '' : this.searchSupplyForm.radius;
      },
      set(value) {
        this.searchSupplyForm.radius = value === '' ? 0 : value;
      }
    },
    displayTeamTotalMembers: {
      get() {
        return this.searchEmergencyTeamForm.totalMembers === 0 ? '' : this.searchEmergencyTeamForm.totalMembers;
      },
      set(value) {
        this.searchEmergencyTeamForm.totalMembers = value === '' ? 0 : Number(value);
      }
    }
  },
  components: {
    CommandScreenEqList,
    commandScreenTitle, //标头
    //灾情总览
    timeLinePlay,
    timeLineEmergencyResponse,
    timeLinePersonnelCasualties,
    timeLineBaseInfo,
    timeLineLegend,
    timeLineLifeLine,
    timeLinePlotStatistics,
    timeLineMiniMap,
    //灾情总览 end
    //弹框
    RouterPanel,
    eqCenterPanel,
    plotInfoOnlyShowPanel,
    dataSourcePanel,
    //左下工具
    CommandScreenViewJump,

    //--未整理---
    damageThemeAssessment,
    disasterStatistics,
    PlotSearch,
    timeLineCasualtyStatisticthd,
    thematicMapPreview,

    eqTable,
    layeredShowPlot,
    earthquakeTable,
    modelTable,
    eqlistTable,
    CommandScreenEarthquakeList,
  },
  data: function () {
    return {
      siChuanCityEntity: [],
      siChuanCountyEntity: [],
      siChuanVillageEntity: [],


      //时间轴和时间轴的组件
      eqid: '',
      currentTime: new Date(),
      centerPoint: {},
      viewer: '',
      //地震时间年月日-title
      eqyear: '',
      eqmonth: '',
      eqday: '',
      //组件选中展开收起
      activeComponent: 'dataStats',// 默认为数据统计
      //标绘统计组件传值
      lastCameraPosition: Cesium.Cartesian3.ZERO, // 上一次相机的位置，默认值为 (0, 0, 0)
      lastCameraTime: 0,     // 上一次相机位置的时间戳，默认值为 0
      cameraPosition: null,     // 当前相机的位置
      isCameraStopped: false,   // 标记相机是否停止

      stopTimePlay: false,
      isTimeRunning: true,
      plots: [], //用来控制标绘点图层显示隐藏
      zoomLevel: '市', // 初始化缩放层级
      viewCenterCoordinate: {
        lon: null,
        lat: null
      },//视角中心坐标
      //---信息弹框---
      hasUpdatedPosition: false,
      selectedEntityPosition: '', //拾取的点的弹框位置
      eqCenterPanelVisible: false,

      routerPopupVisible: false, // RouterPanel弹窗的显示与隐藏
      plotShowOnlyPanelVisible: false, // TimeLinePanel弹窗的显示与隐藏
      PanelPosition: {x: 0, y: 0}, // TimeLinePanel弹窗的位置
      tableName: "", // plotShowOnlyPanel弹窗的表名
      eqThemeData: {}, // plotShowOnlyPanel弹窗的地震专题数据
      PanelData: {}, // TimeLinePanel弹窗的数据
      routerPanelData: {},
      dataSourcePopupVisible: false, // TimeLinePanel弹窗的显示与隐藏
      dataSourcePopupData: {}, // TimeLinePanel弹窗的数据
      //----------------------------------

      eqqueueId: '',
      store: '',
      //-------------ws---------------------
      websock: null,
      //坡面分析
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
      //-----------------地震列表---------------------
      total: 0,
      pageSize: 6,
      currentPage: 1,
      eqtableData: [],
      eqListData: [],
      //-----------------图层---------------------
      isMarkingLayer: true,
      showlayers: [],
      timeoutlayerActions: null,
      LRDLStatus: false, // 路网

      //------------------按钮下拉框------
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


      activeTab: "thematicMap", // 当前显示的 tab (专题图或报告)
      showSidebarComponents: true,  // 控制两侧组件显示状态
      //-----------------图层要素---------------------
      isExpanded: false,
      ResourceSchedulingLayers: [
        {id: '0', name: '避难场所要素图层'},
        {id: '1', name: '救援队伍分布要素图层'},
        {id: '2', name: '应急物资存储要素图层'},
      ],
      DamageAssessmentLayers: [
        {id: '0', name: '历史地震要素图层',type:'multipleChoice'},
        {id: '1', name: '断裂带要素图层',type:'multipleChoice'},
        {id: '2', name: '烈度圈要素图层',type:'multipleChoice'},
        {id: '3', name: '灾损预估-人员伤亡要素图层'},
        {id: '4', name: '灾损预估-经济损失要素图层'},
        {id: '5', name: '灾损预估-建筑损毁要素图层'},
      ],
      layeritems: [
        {id: '0', name: '标绘点图层'},
        {id: '1', name: '行政区划要素图层'},
        {id: '2', name: '人口密度要素图层'},
        {id: '3', name: '交通网络要素图层'},
        {id: '4', name: '医院要素图层'},
        {id: '5', name: '村庄要素图层'},
      ],
      selectedlayersLocal: ['标绘点图层'],
      // 图层允许单选
      selectedDisasterEstimate: ['灾损预估图层'],
      selectedResourceScheduling: ['资源调度图层'],
      isMarkingLayerLocal: true,
      disasterReserves: [],
      emergencyTeam: [],
      emergencyShelters: [],
      isShowYaanRegionLegend: false, //雅安行政区划图例


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

      // 视角输入经纬度高度跳转------------
      showPositionFlyTo: false,
      positionFlyTo: {
        lon: "", // 经度
        lat: "", // 纬度
      },
      // 坡面分析+距离量算
      isShowSlopeLegend: false,

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
        materialMatching: false, //物资查询dialog是否显示
        searchSupplyDialog: false, // 救援物资查询dialog是否显示
        searchEquipmentDialog: false, // 救援装备查询dialog是否显示
        searchEmergencyTeamDialog: false, // 救援力量查询dialog是否显示

        marchSupplyDialog: false, // 救援物资匹配dialog是否显示__现在的这个页面没用到
        searchSupplyByRadiusDialog: false,  // 半径匹配dialog是否显示
        marchRegionsDialog: false,  //行政区划匹配dialog是否显示
        showRemove: false, //路径规划清除实体框dialog是否显示
      },
      marchRegion: true, // 行政区划匹配——选定匹配区域
      searchSupplyResultDialog: false, // 物资匹配结果dialog是否显示

      ifDrawEllipse: false,
      marchSupplyRadius: 0,
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
        radius: 0.0,  //半径
      },
      formRules: {
        radius: [
          {
            required: true,
            message: '匹配半径不能为空',
            trigger: ['blur', 'change'] // 同时监听失焦和内容变化
          },

          // 数字格式 + 数值范围校验
          {
            validator: (rule, value, callback) => {
              // 空值校验已在第一条规则处理，此处无需重复
              if (value === '') return callback()

              // 检查是否为有效数字
              if (isNaN(value) || !/^-?\d+\.?\d*$/.test(value)) {
                return callback(new Error('必须输入有效数字'))
              }

              // 检查是否大于0
              if (parseFloat(value) <= 0) {
                console.log(parseFloat(value))
                return callback(new Error('匹配半径必须大于0'))
              }

              callback()
            },
            trigger: ['blur', 'change'] // 同时触发
          }
        ]
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
      // 救灾装备查询/匹配表单
      equipmentSupplyForm: {
        county: "",
        address: "",
        contactPerson: "",
        contactPhone: "",
        lifeJacket: 0,
        lifebuoy: 0,
        walkieTalkie: 0,
        portableLight: 0,
        radius: 0.0,  //半径
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
      // 行政区划----------------------------

      selectedRegions: [],
      selectedDataByRegions: {},
      selectedDataByRadius: {},
      selectedDataBySupplies: {},

      //-----------弹窗部分-------------------
      popupPosition: {x: 0, y: 0}, // 弹窗显示位置，传值给子组件
      popupVisible: false, // 弹窗的显示与隐藏，传值给子组件
      popupData: {}, // 弹窗内容，传值给子组件
      tableNameOptions: [],
      eqlistName: '',
      isShowMessage: false,
      searchSupplyBy: false,
      canOperateTimerLine: false,
      wsaddMakers: [],
      wsdeleteMakers: [],
      showLayerFeatures: false,// 图层要素弹框状态
      showEqListPanel: false,// 地震列表弹框状态
      showModelPanel: false,// 三维模型弹框状态
      showSlopeAnalysis: false,// 坡面分析弹框状态

      showPeopleLegend: false, // 指挥大屏-图层管理-人员伤亡图层图例状态
      showBuildingLegend: false, // 指挥大屏-图层管理-建筑损毁图层图例状态
      showEconomicLegend: false, // 指挥大屏-图层管理-经济损失图层图例状态


      props: {
        label: 'name',
        children: 'children',
        disabled: (data, node) => {
          // 只有当节点名为"视角跳转"且是根节点时禁用
          return data.name === '视角跳转' && node.level === 0;
        }
      },
      emergencyTitleProperty: [
        {
          name: "路径规划",
          icon: routePlanningIcon,
          content: [
            {name: "路径规划", action: 'route', active: false},
            {name: "添加障碍区", action: 'addArea', active: false},
            {name: "清空实体", action: 'removeAll', active: false},
            // {name: "清空实体", action: 'panels.showRemove = true', active: false},
          ]
        },
        {
          name: "救援力量匹配",
          icon: rescueForceMatchingIcon,
          content: [
            {name: "物资查询", action: 'panels.materialMatching = true', active: false},
            {name: "行政区划匹配", action: 'panels.marchRegionsDialog = true', active: false},
            {name: "震中半径查询", action: 'searchSuppliesByRadius', active: false}
          ]
        },
        {
          name: "救援信息表",
          icon: rescueInfoTableIcon,
          content: [
            {name: "救援物资", action: 'changeDataList(supplies)', active: true},
            {name: "救援力量", action: 'changeDataList(emergencyTeam)', active: false},
            {name: "救援装备", action: 'changeDataList(reserves)', active: false}
          ]
        }
      ],

      // 指挥大屏-灾损
      layerData: {},// 图层渲染数据
      // 地震专题
      eqThemes: {
        allEles: [
          'historyEq',
          'faultZone',
          'ovalCircle',
          'economicLoss',
          'buildingDamage',
          'personalCasualty',
        ],
        layers: [
          // 'historyEq',
          'economicLoss',
          'buildingDamage',
          'personalCasualty'
        ],
        show: {
          isshowHistoryEqPoints: false,
          isshowRegion: false,
          isshowFaultZone: false,
          isshowOvalCircle: false,
          isshowPersonalCasualty: false,
          isshowBuildingDamage: false,
          isshowEconomicLoss: false,
          isshowHospital: false,
        },
      },
      // 图层数据
      //经济损失economicLoss
      ecoLegendColor: [
        '(255, 234, 203)',
        '(255, 216, 173)',
        '(255, 198, 143)',
        '(254, 167, 88)',
        '(250, 148, 64)',
        '(245, 135, 38)',
        '(240, 120, 20)',
      ],
      //建筑破坏buildingDamage
      bddLegendColor: [
        '(232, 236, 248)',
        '(188, 197, 228)',
        '(114, 143, 199)',
        '(84, 127, 195)',
        '(55, 109, 185)',
        '(28, 96, 174)',
        '(0, 84, 165)',
      ],
      //人员伤亡personalCasualty
      pcLegendColor: [
        '(255, 255, 255, 0)',
        '(254, 204, 203)',
        '(255, 177, 167)',
        '(254, 151, 134)',
        '(253, 128, 106)',
        '(245, 101, 75)',
        '(240, 78, 53)',
        '(231, 50, 31)',
        '(218, 0, 0)',
      ],

      panelData: {
        buildingDamageData: [],
        economicLossData: [],
        personalCasualtyData: [],
      },


      // 指挥大屏-图层管理-灾损预估-图层图例
      legendItems1: [
        {color: '(254, 204, 203)', label: '1-5人'},
        {color: '(255, 177, 167)', label: '6-10人'},
        {color: '(254, 151, 134)', label: '11-20人'},
        {color: '(253, 128, 106)', label: '21-50人'},
        {color: '(245, 101, 75)', label: '51-100人'},
        {color: '(240, 78, 53)', label: '101-250人'},
        {color: '(231, 50, 31)', label: '251-500人'},
        {color: '(218, 0, 0)', label: '> 500人'},
      ],
      legendItems2: [
        {color: '(255, 234, 203)', label: '< 1亿'},
        {color: '(255, 216, 173)', label: '1~5亿'},
        {color: '(255, 198, 143)', label: '5~10亿'},
        {color: '(254, 167, 88)', label: '10~20亿'},
        {color: '(250, 148, 64)', label: '20~50亿'},
        {color: '(245, 135, 38)', label: '50~100亿'},
        {color: '(240, 120, 20)', label: '> 100亿'},
      ],
      legendItems3: [
        {color: '(232, 236, 248)', label: '< 0.1km²'},
        {color: '(188, 197, 228)', label: '0.1~0.5km²'},
        {color: '(114, 143, 199)', label: '0.5~1km²'},
        {color: '(84, 127, 195)', label: '1~2km²'},
        {color: '(55, 109, 185)', label: '2~5km²'},
        {color: '(28, 96, 174)', label: '5~10km²'},
        {color: '(0, 84, 165)', label: '> 10km²'},
      ],

      // 行政区划
      RegionLabels: [],

      // flyToMarker:null,// 经纬度跳转时的定位标记

    };
  },
  created() {
    this.eqid = new URLSearchParams(window.location.search).get('eqid')
    this.eqqueueId = new URLSearchParams(window.location.search).get('eqqueueId')
  },
  mounted() {
    this.init()
    this.initPlot(); // 初始化加载应急数据
    // // ---------------------------------------------------
    this.initWebSocket()
    this.initModelTable(); // 初始化模型table数据
    this.getEq()
    this.getEqList()
    this.outputData()
  },
  beforeUnmount() {
    if (window.viewer) {
      this.clearResource(window.viewer)
      window.viewer = null;
    }
    if (window.smallViewer) {
      this.clearResource(window.smallViewer)
      window.smallViewer = null;
    }
  },
  methods: {
    //------------------地图初始化---------------
    init() {
      let clock;
      let that = this
      getEqListById({id: this.eqid}).then(res => {
        console.log(res)
        //震中标绘点
        this.centerPoint = res

        // 设置中心点的标识和时间信息
        this.centerPoint.plotId = res.eqid
        this.centerPoint.startTime = new Date(this.centerPoint.occurrenceTime)
        this.centerPoint.endTime = new Date(this.centerPoint.startTime.getTime() + 10 * 24 * 3600 * 1000);
        this.currentTime = this.centerPoint.startTime
        this.centerPoint.plotType = "震中"

        this.eqyear = this.centerPoint.startTime.getFullYear()
        this.eqmonth = this.centerPoint.startTime.getMonth() + 1
        this.eqday = this.centerPoint.startTime.getDate()

        // console.log(this.currentTime,"this.currentTime thd")
        clock = new Cesium.Clock({
          startTime: Cesium.JulianDate.fromDate(this.centerPoint.startTime),
          stopTime: Cesium.JulianDate.fromDate(this.centerPoint.endTime),
          currentTime: Cesium.JulianDate.fromDate(this.currentTime),
          clockRange: Cesium.ClockRange.CLAMPED,
        })
        let viewer = initCesium(Cesium, "cesiumContainer", clock)
        viewer._cesiumWidget._creditContainer.style.display = 'none' // 隐藏版权信息
        //取消双击视角定位
        viewer.trackedEntity = undefined;
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
        const terrainProviderViewModels = getTerrainProviderViewModelsArr();
        let isThirdParty = true; // 标记当前是否为第三方地形

        // 倾斜模型加载
        getModelData().then(res => {
          console.log("倾斜模型数据，新加的点，", res)
          // 创建一个数组来保存实体和对应的数据
          const entities = [];

          for (let i = 0; i < res.length; i++) {
            let alltiltPhotography = viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(res[i].geom.coordinates[0], res[i].geom.coordinates[1]),
              layer: "倾斜模型",
              // point: {
              //   pixelSize: 20,
              //   color: Cesium.Color.fromCssColorString("#e0c79b"),
              //   clampToGround: true,
              // },
              billboard: {
                image: modelicon,
                width: 40,
                height: 40,
                // eyeOffset: new Cesium.Cartesian3(0, 0, 0),
                // color: Cesium.Color.WHITE.withAlpha(1),
                // scale: 0.8,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 禁用，导致图标在高度计算或与地形交互时出现闪烁。 原作用：绑定到地形高度,让billboard贴地
                disableDepthTestDistance: Number.POSITIVE_INFINITY
              },
              // 自定义属性，保存对应的数据
              data: res[i],
              // 添加名称属性
              name: res[i].name + "倾斜模型"
            });
            // 将实体保存到数组中
            entities.push(alltiltPhotography);
          }
        })

        // 设置cesium的指南针、比例尺、放大缩小重置
        this.init_cesium_navigation(this.centerPoint.longitude, this.centerPoint.latitude, viewer)

        // 坡度分析绑定地形自动加载地形
        const switchToLocalDEM = () => {
          // 切换地形提供者
          if (isThirdParty) {
            viewer.scene.terrainProvider = terrainProviderViewModels[1].creationCommand(); // 切换到第三方地形
          } else {
            viewer.scene.terrainProvider = terrainProviderViewModels[0].creationCommand(); // 切换到仅底图
          }

          // 更新选中的地形
          viewer.baseLayerPicker.viewModel.selectedTerrain = terrainProviderViewModels[isThirdParty ? 1 : 0];

          // 高亮当前选中的地形
          const currentLayer = document.querySelector(`[title="${isThirdParty ? '第三方地形' : 'WGS84标准球体'}"]`);
          if (currentLayer) {
            currentLayer.classList.add('cesium-baseLayerPicker-selectedItem');
          }

          // 切换标记，准备下次切换
          isThirdParty = !isThirdParty;
        };
        document.getElementById('slope').addEventListener('click', switchToLocalDEM);

        // 绑定按钮点击事件
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

        viewer.clock.multiplier = 3600
        let that = this
        viewer.clock.onTick.addEventListener(function (clock) {
          // console.log(clock.currentTime,"clock.currentTime")
          if (clock.currentTime) {
            that.currentTime = clock.currentTime;
          }
          if (viewer.clockViewModel.shouldAnimate) {
            that.isTimeRunning = true
          } else {
            that.isTimeRunning = false
          }

          //视角中心监测 1秒钟时间不变才更新
          const now = new Date().getTime();
          const currentPosition = viewer.scene.camera.position;
          const hasMoved = !Cesium.Cartesian3.equals(that.lastCameraPosition, currentPosition);

          if (hasMoved) {
            that.lastCameraPosition = Cesium.Cartesian3.clone(currentPosition);
            that.lastCameraTime = now;
            that.hasUpdatedPosition = false; // 重置标志位
          } else {
            if (!that.hasUpdatedPosition) { // 检查是否已经更新过位置
              const elapsedTime = now - that.lastCameraTime;
              if (elapsedTime >= 1000) {
                // console.log("更新视角中心");
                const positionCartographic = viewer.camera.positionCartographic;
                let height = positionCartographic.height;
                that.updateZoomLevel(height);
                let longitude = Cesium.Math.toDegrees(positionCartographic.longitude);
                let latitude = Cesium.Math.toDegrees(positionCartographic.latitude);
                that.viewCenterCoordinate = {
                  lon: longitude,
                  lat: latitude
                };
                that.hasUpdatedPosition = true; // 设置标志位
              }
            }
          }
        });

        viewer.animation.viewModel.timeFormatter = timeTransfer.CesiumTimeFormatter;
        viewer.timeline.makeLabel = timeTransfer.CesiumDateTimeFormatter;

        viewer.animation.viewModel.dateFormatter = timeTransfer.CesiumDateFormatter;

        let realTime = new Date()
        if (realTime > this.centerPoint.startTime && realTime < this.centerPoint.endTime) {
          console.log("还在更新的地震")
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
          document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[3].style = 'visibility:hidden';

        } else {
          console.log("历史地震")
          document.getElementsByClassName('cesium-viewer-animationContainer')[0].style = 'visibility:hidden;z-index:1 ;left:40%;bottom: 3%;';
          document.getElementsByClassName('cesium-animation-rectButton')[0].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[1].style = 'visibility:hidden';
          document.getElementsByClassName('cesium-animation-rectButton')[2].style = 'visibility:hidden';
        }
        document.getElementsByClassName('cesium-timeline-main')[0].style = 'width: 64%; left:18%;right:18%; ';
        document.getElementsByClassName('cesium-timeline-bar')[0].style = 'background:rgba(0, 0, 0, 0.1);';

        window.viewer = viewer
        this.viewer = viewer
        viewer.clock.shouldAnimate = false;
        this.updateMapAndVariableBeforeInit()
        this.entitiesClickPonpHandler()
        this.watchTerrainProviderChanged();//地形监听
        this.handler = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas); // 初始化

        const ellipsoid = viewer.scene.globe.ellipsoid;
        const canvas = viewer.scene.canvas;
        const handler = new Cesium.ScreenSpaceEventHandler(canvas);

        handler.setInputAction((movement) => {
          const cartesian = viewer.camera.pickEllipsoid(
              movement.position,
              ellipsoid
          );
          if (cartesian) {
            const cartographic = ellipsoid.cartesianToCartographic(cartesian);
            this.addSupplyPointCurrently.lat = Cesium.Math.toDegrees(
                cartographic.latitude
            ).toFixed(5);
            this.addSupplyPointCurrently.lng = Cesium.Math.toDegrees(
                cartographic.longitude
            ).toFixed(5);

            if (this.canMarkPoint) {
              this.DialogFormVisible = true;
              this.drawEmergencySite(
                  this.addSupplyPointCurrently.lat,
                  this.addSupplyPointCurrently.lng,
                  Cesium.createGuid(),
                  Cesium.Color.RED
              );
              this.isShowMessage = false;
              this.canMarkPoint = false;
              if (this.searchSupplyBy === 'RadiusDialog') {
                this.panels.materialMatching = false;  //物资查询
                this.panels.searchSupplyDialog = false;// 救援物资查询
                this.panels.searchEquipmentDialog = false;// 救援装备查询
                this.panels.searchEmergencyTeamDialog = false;// 救援力量查询
                this.panels.marchSupplyDialog = false; // 救援物资匹配
                this.panels.marchRegionsDialog = false; //行政区划匹配
                this.panels.tableVisible = false;  //表格显示
                this.panels.searchSupplyByRadiusDialog = true;
              } else if (this.searchSupplyBy === 'RadiusDialog') {
                this.panels.marchSupplyDialog = true;
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      })

    },
    init_cesium_navigation(longitude, latitude, viewer) {
      let options = {}
      // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
      options.enableCompass = true
      // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
      options.enableZoomControls = true
      // 用于启用或禁用比例尺。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
      options.enableDistanceLegend = true
      // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
      options.enableCompassOuterRing = true
      // 重置按钮
      options.defaultResetView = new Cartographic(CesiumMath.toRadians(longitude), CesiumMath.toRadians(latitude), 200000)
      options.resetTooltip = "重置视图";
      options.zoomInTooltip = "放大";
      options.zoomOutTooltip = "缩小";
      //新版必须new CesiumNavigation ,可以查看作者github
      window.navigation = new CesiumNavigation(viewer, options)
      let compass = document.getElementsByClassName('compass')[0]
      compass.addEventListener('dblclick', function () {
        // 设置相机飞行到指北视角
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, viewer.camera.positionCartographic.height), // 目标位置
          orientation: {
            heading: Cesium.Math.toRadians(0), // 朝向正北
            pitch: Cesium.Math.toRadians(-90), // 向下俯视
            roll: 0 // 不倾斜
          },
          duration: 3, // 动画持续时间，单位为秒
          easingFunction: Cesium.EasingFunction.LINEAR // 动画缓动函数
        });
      }, false);
    },
    updateMapAndVariableBeforeInit() {
      timeLine.fly(this.centerPoint.longitude, this.centerPoint.latitude, 60000, 5).then(() => {
        viewer.clockViewModel.shouldAnimate = true;
      });
      timeLine.addDataSourceLayer("pointData")
      timeLine.addDataSourceLayer("label")
      timeLine.addCenterPoint(this.centerPoint)
    },
    updateZoomLevel(cameraHeight) {
      if (cameraHeight < 50000) {
        this.zoomLevel = '区/县'
      } else {
        this.zoomLevel = '市'
      }
    },
    //子-父-子，控制时间轴暂停与播放
    handleStopTimePlay() {
      this.stopTimePlay = true; // 用于控制时间轴停止播放的变量
      console.log(this.stopTimePlay, "this.stopTimePlay")
    },
    handleStartTimePlay() {
      this.stopTimePlay = false;
    },
    //-----------------地图初始化end------------------

    //-----------------数据请求与传值---------------
    // ---物资储备--
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
      getEmergency().then(res => {
        let {emergencyRescueEquipment, disasterReliefSupplies, rescueTeamsInfo} = res;
        console.log('获取到的res', res);

        this.supplyList = disasterReliefSupplies
        this.all.push(disasterReliefSupplies, emergencyRescueEquipment, rescueTeamsInfo)
        this.suppliesList.push(disasterReliefSupplies, emergencyRescueEquipment, rescueTeamsInfo);


        // 调用 `processPoints` 并传递不同的 `tableName`
        // this.processPoints(emergencyRescueEquipment, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
        // this.processPoints(disasterReliefSupplies, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
        // this.processPoints(rescueTeamsInfo, 'emergencyTeam', rescueTeamsInfoLogo, "应急救援力量");


        this.listField = 'supplies'
        this.selectedSuppliesList = this.suppliesList[0]
        this.showIcon = this.selectedSuppliesList;
        this.total = this.selectedSuppliesList.length;
        this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
      });
    },
    //----标绘点（来源数据库）----
    updatePlots(plots) {
      console.log(this.plots, "plots updatePlots")
      this.plots = plots
    },
    //---标绘点（websocket）---
    initWebSocket() {
      let that = this
      this.websock = initWebSocket(this.eqid)
      this.websock.onmessage = function (e) {
        console.log("e commandscreen this.websock.onmessage", e)
        try {
          console.log("从服务器接收到的消息thdtimeline", JSON.parse(e.data))
          let drawType = JSON.parse(e.data).type
          let markOperate = JSON.parse(e.data).operate // 标绘的（add、delete）
          if (markOperate === "add") {
            if (this.eqid === JSON.parse(e.data).data.plot.earthquakeId) {
              let markData = JSON.parse(e.data).data
              markData.plot.longitude = Number(markData.plot.geom.coordinates[0])
              markData.plot.latitude = Number(markData.plot.geom.coordinates[1])
              that.plots.push(markData.plot)
              if (drawType === "point") {
                timeLine.addMakerPoint(markData.plot, "标绘点")
              } else if (drawType === "polyline") {
                timeLine.addPolyline(markData.plot, "标绘点")
              } else if (drawType === "polygon") {
                timeLine.addPolygon(markData.plot, "标绘点")
              } else if (drawType === "arrow") {
                timeLine.addArrow(markData.plot, "标绘点")
              }
            }
          } else if (markOperate === "delete") {
            let polyId = JSON.parse(e.data).id.toString()
            that.plots = that.plots.filter(plot => plot.plotId !== polyId);
            timeLine.deletePointById(polyId, drawType)
          }
        } catch (err) {
          console.log(err, 'ws中catch到错误');
        }
      };
    },
    //----------------数据end---------------
    //----------------处理实体点击事件的弹窗显示逻辑-----------------

    //-------信息面板弹框-----
    entitiesClickPonpHandler() {
      let that = this;
      // 在屏幕空间事件处理器中添加左键点击事件的处理逻辑
      window.viewer.screenSpaceEventHandler.setInputAction(async (click) => {
        // 检查点击位置是否拾取到实体
        let pickedEntity = window.viewer.scene.pick(click.position);
        console.log("点击选择的pickedEntity", pickedEntity)
        window.selectedEntity = pickedEntity?.id;

        // 绑定断裂带信息的 div 元素
        let pointLabelDiv = document.getElementById('pointLabel');
        // 如果拾取到实体
        if (Cesium.defined(pickedEntity)) {
          let entity = window.selectedEntity;
          console.log(entity, "拾取entity")
          // 计算图标的世界坐标
          this.selectedEntityPosition = this.calculatePosition(click.position);
          this.updatePopupPosition(); // 确保位置已更新


          // 如果 entity 没有 _layer 字段，且当前选中图层是特定图层时跳过
          if (!entity._layer && !pickedEntity.id._properties.sourceName) {
            this.eqCenterPanelVisible = false;
            this.routerPopupVisible = false;
            this.plotShowOnlyPanelVisible = false;
            this.dataSourcePopupVisible = false
            return;
          }


          // if (entity._layer === "断裂带") {
          //   //console.log("断裂带")
          //
          //   const faultName = pickedEntity.id.properties.name._value;
          //
          //   if (faultName) {
          //     // 获取点击位置的地理坐标 (Cartesian3)
          //     const cartesian = viewer.scene.pickPosition(click.position);
          //     if (!Cesium.defined(cartesian)) {
          //       return;
          //     }
          //
          //     // 更新 faultInfo 的位置和内容
          //     this.updateFaultInfoPosition(faultName);
          //
          //     // 显示 faultInfo
          //     pointLabelDiv.style.display = 'block';
          //
          //     // 监听地图变化，动态更新 div 的位置
          //     window.viewer.scene.postRender.addEventListener(() => {
          //       this.updateFaultInfoPosition(faultName);
          //     });
          //
          //     //console.log(faultName)
          //   }
          // }
          // 新增判断：跳过行政区划实体
          if (entity._layer === '行政区划') {
            this.plotShowOnlyPanelVisible = false;
            this.dataSourcePopupVisible = false;
            return;
          }
          // 如果点击的是标绘点
          else if (entity._layer === "震中") {
            this.eqCenterPanelVisible = true;
            pointLabelDiv.style.display = 'none';
            this.plotShowOnlyPanelVisible = false;
            this.dataSourcePopupVisible = false
            this.routerPopupVisible = false;
            this.PanelPosition = this.selectedEntityPosition; // 更新位置
            this.PanelData = {}
            this.PanelData = this.extractDataForRouter(entity)
            console.log("PanelData 震中", this.PanelData)
          } else if (entity._layer === "倾斜模型") {

            const terrainProviderViewModels = getTerrainProviderViewModelsArr()
            window.viewer.scene.terrainProvider = terrainProviderViewModels[1].creationCommand();
            window.viewer.baseLayerPicker.viewModel.selectedTerrain = terrainProviderViewModels[1];
            const currentLayer = document.querySelector(`[title="${true ? '第三方地形' : 'WGS84标准球体'}"]`);
            if (currentLayer) {
              currentLayer.classList.add('cesium-baseLayerPicker-selectedItem');
            }
            // 获取实体的自定义属性

            let row = entity.data;
            this.modelInfo.name = row.name
            this.modelInfo.path = row.path
            this.modelInfo.tz = row.tz
            this.modelInfo.rz = row.rz
            this.modelInfo.time = row.time
            this.modelInfo.modelid = row.modelid
            this.modelInfo.tze = row.tze
            this.modelInfo.rze = row.rze

            this.tiltphotographymodel(row);
            goModel(row)
          } else if (entity._layer === "标绘点") {
            this.eqCenterPanelVisible = false;
            pointLabelDiv.style.display = 'none';
            this.plotShowOnlyPanelVisible = true;
            this.dataSourcePopupVisible = false
            this.routerPopupVisible = false;
            this.PanelPosition = this.selectedEntityPosition; // 更新位置
            this.PanelData = {}
            this.eqThemeData = {}
            this.tableName = ""
            this.PanelData = this.extractDataForRouter(entity)
            // console.log("PanelData 标绘点",this.PanelData)

          }
          //救援队伍、避难场所、应急物资
          else if (entity._layer === "避难场所" || entity._layer === "救援队伍分布" || entity._layer === "应急物资存储") {
            this.eqCenterPanelVisible = false;
            pointLabelDiv.style.display = 'none';
            this.routerPopupVisible = true;
            this.dataSourcePopupVisible = false;
            this.plotShowOnlyPanelVisible = false;
            this.PanelPosition = this.selectedEntityPosition;
            this.routerPanelData = this.extractDataForRouter(entity);
          }
          //资源调度——救灾物资储备、雅安应急队伍
          else if (entity._layer === "救灾物资储备" || entity._layer === "雅安应急队伍" || entity._layer === "抢险救灾装备") {
            this.eqCenterPanelVisible = false;
            pointLabelDiv.style.display = 'none';
            this.routerPopupVisible = true;
            this.dataSourcePopupVisible = false;
            this.plotShowOnlyPanelVisible = false;
            this.PanelPosition = this.selectedEntityPosition;
            this.routerPanelData = this.extractDataForRouter(entity);
          } else if (entity._layer === "历史地震") {
            this.eqCenterPanelVisible = false;
            this.dataSourcePopupVisible = false
            this.plotShowOnlyPanelVisible = false
            this.routerPopupVisible = false;

            let labelText = pickedEntity.id.properties._tableName._value;
            //
            if (labelText) {
              // 获取点击位置的地理坐标 (Cartesian3)
              const cartesian = viewer.scene.pickPosition(click.position);
              if (!Cesium.defined(cartesian)) {
                return;
              }
              this.updateFaultInfoPosition(labelText);
              pointLabelDiv.style.display = 'block';
              //     // 监听地图变化，动态更新 div 的位置
              window.viewer.scene.postRender.addEventListener(() => {
                this.updateFaultInfoPosition(labelText);
              });
            }
          }
          // //聚合图标
          else if (Object.prototype.toString.call(entity) === '[object Array]') {
            if (entity[0].entityCollection.owner.name === "label") {
              this.eqCenterPanelVisible = false;
              this.dataSourcePopupVisible = false
              this.plotShowOnlyPanelVisible = false
              this.routerPopupVisible = false;
              pointLabelDiv.style.display = 'none';
            } else {

              //----

              let popupPanelDatatmp = entity.filter(item => item.plottype !== undefined);

              const drawTypes = popupPanelDatatmp.map(obj => obj.plottype);
              console.log(drawTypes)
              this.data = drawTypes.reduce((acc, type) => {
                if (acc[type]) {
                  acc[type] += 1;
                } else {
                  acc[type] = 1;
                }

                return acc;
              }, {});

              this.dataSourcePopupData = Object.entries(this.data).map(([key, value]) => ({
                type: key,
                count: value
              }));

              // this.dataSourcePopupData = entity
              this.dataSourcePopupVisible = true
              this.eqCenterPanelVisible = false;
              this.plotShowOnlyPanelVisible = false
              this.routerPopupVisible = false;
              pointLabelDiv.style.display = 'none';

            }
          } else if (Cesium.defined(pickedEntity) && pickedEntity.id.name) {
            console.log(112211)
            let ray = viewer.camera.getPickRay(click.position);
            let position = viewer.scene.globe.pick(ray, viewer.scene);
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            let latitude = Cesium.Math.toDegrees(cartographic.latitude);
            let longitude = Cesium.Math.toDegrees(cartographic.longitude);

            this.PanelPosition = this.selectedEntityPosition;

            const properties = pickedEntity.id._properties;
            const sourceName = properties.sourceName;

            // 清空标绘数据信息，因为共用一个组件

            // 如果是医院点
            if (sourceName === "hospital") {
              this.tableName = "医院信息";
              this.eqThemeData = {
                "名称": properties._name._value,
                "位置": properties._location._value,
                "医院等级": properties._grade._value,
                "联系电话": properties._tel._value,
                "床铺数量": properties._bed._value,
                "所属单位": properties._membership._value,
                "救护车数量": properties._ambulance._value,
                "血浆数量": properties._plasma._value,
                "葡萄糖数量": properties._surgery_dc._value,
                "医生数量": properties._doctor._value,
                "麻醉剂数量": properties._anesthetis._value,
                "护士数量": properties._nurse._value,
                "地理位置": "经度: " + longitude.toFixed(2) + "°E, 纬度: " + latitude.toFixed(2) + "°N",
              }
              console.log(this.eqThemeData)
            }
            // 如果是村庄点
            else if (sourceName === "village") {
              this.tableName = "村庄信息";
              this.eqThemeData = {
                "名称": properties._NAME._value,
                "经纬度": "经度: " + longitude.toFixed(2) + "°E, 纬度: " + latitude.toFixed(2) + "°N",
              }
            }
            this.plotShowOnlyPanelVisible = true;
          } else {
            this.eqCenterPanelVisible = false;
            this.routerPopupVisible = false;
            this.plotShowOnlyPanelVisible = false;
            this.dataSourcePopupVisible = false
            pointLabelDiv.style.display = 'none';
          }
        }
        //没有拾取到实体
        else {
          // 没有选中实体时隐藏 faultInfo
          pointLabelDiv.style.display = 'none';
          this.eqCenterPanelVisible = false;
          this.routerPopupVisible = false;
          this.plotShowOnlyPanelVisible = false;
          this.dataSourcePopupVisible = false
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 在屏幕空间事件处理器中添加鼠标移动事件的处理逻辑
      window.viewer.screenSpaceEventHandler.setInputAction(movement => {
        // 如果时间线弹窗或路由弹窗可见，则更新弹窗位置
        if (this.eqCenterPanelVisible || this.plotShowOnlyPanelVisible || this.routerPopupVisible || this.dataSourcePopupVisible) {
          this.updatePopupPosition();
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
            const pointLabelDiv = document.getElementById('pointLabel');
            pointLabelDiv.style.left = canvasPosition.x + 'px';
            pointLabelDiv.style.top = canvasPosition.y + 'px';
            pointLabelDiv.innerHTML = `${faultName}`;
            // //console.log(pointLabelDiv)
          }
        }
      });
    }
    ,
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
            this.PanelPosition = {
              x: canvasPosition.x + 10,
              y: canvasPosition.y + 10
            };
          }
        }
      });
    }
    ,
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
    //-------信息面板弹框end-----

    //----视角跳转----

    viewJumpSelectedDistrict(selectedDistrict) {
      this.selectedDistrict = selectedDistrict
    }
    ,
    viewJumpPositionFlyTo(positionFlyTo) {
      this.positionFlyTo = positionFlyTo
    }
    ,

    // viewJumpEndFlag(flag){
    //   this.endFlag=flag
    // },
    //----视角跳转end----
    //------------------未重构----------------------

    outputData() {
      handleOutputData(this.eqid, this.eqqueueId, null, 'thematicMap').then((res) => {
        this.thematicMapitems = res.themeData
        console.log("专题图：", this.thematicMapitems, "diowjdwiodjiwjdijwiodjiwdiojdiwjiojdiojwo")
      })
      handleOutputData(this.eqid, this.eqqueueId, null, 'report').then((res) => {
        this.reportItems = res.themeData
        console.log("报告：", this.reportItems)
      })
    },


    // ------------------------------路径规划+物资匹配---------------------------
    switchPanel(action) {
      // 更新 panels 的状态，先设置所有为 false
      for (let key in this.panels) {
        if (this.panels.hasOwnProperty(key)) {
          this.panels[key] = false;
        }
      }
      console.log(this.panels);  // 这里的 panels 会先被更新为 false

      // 在下次 DOM 更新后执行 handleMenuAction(action)
      this.$nextTick(() => {
        console.log(action);  // 确保 action 的打印是在面板状态更新之后
        this.handleMenuAction(action);  // 在面板状态更新后执行
      });
    }
    ,

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

    // 救援物资查询
    searchRescueSupplies() {
      this.panels.materialMatching = false;
      this.panels.searchSupplyDialog = true;


    }
    ,
    //救援装备查询
    searchRescueEquipment() {
      this.panels.materialMatching = false;
      this.panels.searchEquipmentDialog = true;


    }
    ,
    // 救援力量查询
    searchRescueForces() {
      this.panels.materialMatching = false;
      this.panels.searchEmergencyTeamDialog = true;


    },

    //显示所有物资点(所有点查询)
    searchAll() {
      this.panels.materialMatching = false;
      this.panels.tableVisible = true

      //清除半径查询实体标签
      this.removeAllEmergencySites();
      //清除其他实体标签
      this.removeDistrict();  //清除行政区域

      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(this.showIcon);
      this.removePoints(this.selectedSuppliesList);
      this.removethdRegions()
      this.removeDataSourcesLayer('YaanRegionLayer');


      getEmergency().then(res => {
        let {emergencyRescueEquipment, disasterReliefSupplies, rescueTeamsInfo} = res;
        console.log('获取到的res', res);

        this.supplyList = disasterReliefSupplies
        this.all.push(disasterReliefSupplies, emergencyRescueEquipment, rescueTeamsInfo)
        this.suppliesList.push(disasterReliefSupplies, emergencyRescueEquipment, rescueTeamsInfo);

        // 调用 `processPoints` 并传递不同的 `tableName`
        this.processPoints(emergencyRescueEquipment, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
        this.processPoints(disasterReliefSupplies, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
        this.processPoints(rescueTeamsInfo, 'emergencyTeam', rescueTeamsInfoLogo, "应急救援力量");

        // this.fetSupplyPoints();
        this.listField = 'supplies'
        this.selectedSuppliesList = this.suppliesList[0]
        this.showIcon = this.selectedSuppliesList;
        this.total = this.selectedSuppliesList.length;
        this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
      });

    }
    ,

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
    }
    ,


    //清除行政区划
    removeDistrict() {
      // this.removeDataSourcesLayer('siChuanProvinceRegionLayer');
      this.removethdRegions() //移除区域图层和相关标签
      this.removeDataSourcesLayer('siChuanCityRegionLayer');
      this.removeDataSourcesLayer('sichuanCountyRegionLayer');
      this.removeDataSourcesLayer('yaAnVillageRegionLayer');
    }
    ,

    // 切换数据列表
    changeDataList(param) {
      // console.log(`调用 changeDataList，参数 param = ${param}`);

      this.selectedSuppliesList = [];
      // console.log("已清空 this.selectedSuppliesList");

      // 计算标志位
      let flag1 = Object.keys(this.selectedDataByRegions).length > 0;
      let flag2 = Object.keys(this.selectedDataByRadius).length > 0;
      let flag3 = Object.keys(this.selectedDataBySupplies).length > 0;

      // console.log(`flag1 (selectedDataByRegions 是否有数据) = ${flag1}`);
      // console.log(`flag2 (selectedDataByRadius 是否有数据) = ${flag2}`);
      // console.log(`flag3 (selectedDataBySupplies 是否有数据) = ${flag3}`);

      // 确定数据来源
      let array = flag1 ? 'selectedDataByRegions'
          : flag2 ? 'selectedDataByRadius'
              : flag3 ? 'selectedDataBySupplies'
                  : null;

      // console.log(`确定数据来源 array = ${array}`);

      // 确定字段映射
      const paramMap = {
        supplies: {field: 'supplies', defaultIndex: 0},
        emergencyTeam: {field: 'emergencyTeam', defaultIndex: 2},
        reserves: {field: 'reserves', defaultIndex: 1}
      };

      if (!paramMap[param]) {
        // console.log("无效的参数 param，退出方法");
        return; // 避免无效参数导致的错误
      }

      this.listField = paramMap[param].field;
      // console.log(`设置 this.listField = ${this.listField}`);

      // 选择合适的数据列表
      if (array) {
        // console.log(`尝试从 this.${array} 读取数据`);
        // console.log(`this.${array} 的内容：`, this[array]); // 打印整个对象，检查数据结构

        this.selectedSuppliesList = this[array]?.[paramMap[param].field] ?? this.suppliesList[paramMap[param].defaultIndex];

        // console.log(`从 this.${array}.${paramMap[param].field} 读取的数据为：`, this.selectedSuppliesList);
      } else {
        // console.log("没有匹配的 array，从 this.suppliesList 获取默认值");
        this.selectedSuppliesList = this.suppliesList[paramMap[param].defaultIndex];
      }

      // 赋值并打印结果
      this.showIcon = this.selectedSuppliesList;
      this.total = this.selectedSuppliesList.length;
      // console.log(`最终选中的数据列表（this.selectedSuppliesList）：`, this.selectedSuppliesList);
      // console.log(`this.total = ${this.total}`);

      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
      // console.log("最终分页后的数据（this.showSuppliesList）：", this.showSuppliesList);
    }
    ,


    // 绘制点
    drawEmergencySite(lat, lng, id, color) {
      let point = {
        id: id,
        position: Cesium.Cartesian3.fromDegrees(
            parseFloat(lng),
            parseFloat(lat)
        ),
      };
      this.affectedPoints.push(point);
      if (viewer) {
        viewer.entities.add({
          position: point.position,
          point: {
            pixelSize: 10,
            color: color,
          },
          customType: "emergencySite",
        });
      }
    }
    ,

    removeAllEmergencySites() {
      // console.log(window.viewer.entities.values)
      let entities = window.viewer.entities.values;
      for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].customType === "emergencySite") {
          window.viewer.entities.remove(entities[i]);
        }
      }
      this.removeSuppliesList();
    }
    ,

    // 用于移除物资点
    removeSuppliesList() {
      this.removePoints(this.suppliesList[0]);
      this.removePoints(this.suppliesList[1]);
      this.removePoints(this.suppliesList[2]);
    }
    ,

    // 点击列表某行显示对应标绘点
    showSupplyPoint(row) {
      // console.log("点击了：", row);
      this.showIcon = [];
      this.showIcon.push(row);
      this.removeSuppliesList();
      if (this.showIcon[0].type === "supplies") {
        this.processPoints(this.showIcon, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
      } else if (this.showIcon[0].type === "reserves") {
        this.processPoints(this.showIcon, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
      } else {
        this.processPoints(this.showIcon, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
      }
    }
    ,

    // 救援物资查询
    async searchSupply() {
      //清除其他实体标签
      this.removeAllEmergencySites();
      this.removeDistrict();  //清除行政区域


      let that = this;
      this.activeMenuIndex = '2'

      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removeSuppliesList();
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

      this.panels.tableVisible = true
    }
    ,


    // 救援装备查询
    async searchEquipment() {
      this.panels.searchEquipmentDialog = false

      //清除其他实体标签
      this.removeAllEmergencySites();

      this.removeDistrict();  //清除行政区域


      let that = this;
      this.activeMenuIndex = '2'

      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removeSuppliesList();
      let result = []
      this.ifDrawEllipse = false
      this.selectedSuppliesList = []
      // 字符串部分到后端查询
      let obj = {
        county: this.equipmentSupplyForm.county,
        address: this.equipmentSupplyForm.address,
        contactPerson: this.equipmentSupplyForm.contactPerson,
        contactPhone: this.equipmentSupplyForm.contactPhone,
      }
      await searchMaterialData(obj).then(res => {
        // console.log("search----------",res)
        result = res
        this.selectedSuppliesList = result
      })
      this.drawSupplyPoint('searchReserves')
      this.listField = 'reserves'
      this.activeMenuIndex = '3'
      this.panels.searchSupplyDialog = false
      this.equipmentSupplyForm = {
        county: "",
        address: "",
        contactPerson: "",
        contactPhone: "",
        lifeJacket: 0,
        lifebuoy: 0,
        walkieTalkie: 0,
        portableLight: 0,
        radius: 0.0,  //半径
      }
      // console.log("this.activeMenuIndex--------------------------------",this.activeMenuIndex)

      this.panels.tableVisible = true
    }
    ,

    // 救援力量查询
    async searchEmergencyTeam() {
      //清除其他实体标签
      this.removeAllEmergencySites();

      this.removeDistrict();  //清除行政区域


      let that = this;
      this.activeMenuIndex = '2'

      viewer.entities.values.forEach((entity) => {
        if (entity.ellipse) {
          viewer.entities.remove(entity);
        }
      });
      this.removePoints(that.showIcon);
      this.removePoints(that.selectedSuppliesList);
      this.removeSuppliesList();
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

      this.panels.tableVisible = true
    }
    ,

    // 物资匹配dialog能打开
    async marchSupply() {
      this.addDisasterPoint()
      this.isShowMessage = true
      this.searchSupplyBy = 'marchSupplyDialog'
    }
    ,
    // 物资匹配
    async marchSupplies() {
      this.removeSuppliesList();
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
        countResult = marchSupplyByCount(radiusResult, this.searchSupplyForm)
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
    }
    ,

    // 半径查询
    async searchSuppliesByRadius() {
      this.addDisasterPoint()
      this.isShowMessage = true
      this.searchSupplyBy = 'RadiusDialog'
    }
    ,

    // 通过半径匹配物资
    async marchSuppliesByRadius() {
      const valid = await this.$refs.searchSupplyForm.validate()
      if (!valid) {
        return
      }


      this.panels.tableVisible = true
      this.removeDistrict();  //清除行政区域
      //清除其他实体标签
      this.removeAllEmergencySites();
      this.panels.marchRegionsDialog = false
      this.ifDrawEllipse = true
      // 移除现有的点
      this.removeSuppliesList();
      let result = await this.marchSupplyByRadius(this.suppliesList, this.searchSupplyForm.radius)
      // this.drawSupplyPoint("searchSupplies", this.searchSupplyForm.radius)
      this.selectedDataByRadius = {
        supplies: result[0],
        reserves: result[1],
        emergencyTeam: result[2]
      };
      selectPoints(this.searchSupplyForm.radius, this.addSupplyPointCurrently.lng, this.addSupplyPointCurrently.lat)
      this.processPoints(result[0], 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
      this.processPoints(result[1], 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
      this.processPoints(result[2], 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
      this.listField = 'supplies'
      this.changeDataList('supplies')
      this.panels.searchSupplyByRadiusDialog = false
    }
    ,

    // 半径匹配
    async marchSupplyByRadius(array, radius) {
      // 移除现有的点
      this.removeSuppliesList();
      let result = []
      let suppliesArr = []
      let reservesArr = []
      let emergencyTeamArr = []
      let longitude = parseFloat(this.addSupplyPointCurrently.lng);
      let latitude = parseFloat(this.addSupplyPointCurrently.lat);
      const clickPoint = Cesium.Cartesian3.fromDegrees(longitude, latitude);
      if (Array.isArray(array[0])) {
        array.forEach((arr, index) => {
          arr.forEach((point) => {
            const pointLongitude = parseFloat(point.longitude);
            const pointLatitude = parseFloat(point.latitude);
            const initialPoint = Cesium.Cartesian3.fromDegrees(
                pointLongitude,
                pointLatitude
            );
            // 距离以公里为单位
            const distance = Cesium.Cartesian3.distance(clickPoint, initialPoint) / 1000;
            if (distance < radius) {
              if (index === 0) {
                suppliesArr.push(point);
              } else if (index === 1) {
                reservesArr.push(point);
              } else {
                emergencyTeamArr.push(point);
              }
            }
          });
        })
        result.push(suppliesArr)
        result.push(reservesArr)
        result.push(emergencyTeamArr)
        // }else if(typeof array === 'string'){
      } else {
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
      }
      return result
    }
    ,

    cancelRadiusQuery() {
      this.panels.searchSupplyByRadiusDialog = false;
      this.removeSuppliesList();
      this.removeAllEmergencySites();
    }
    ,

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
        selectPoints(radius, this.addSupplyPointCurrently.lng, this.addSupplyPointCurrently.lat);
      }
      // }

    }
    ,

    // 添加物资点
    addDisasterPoint() {
      if (this.isRouting) {
        this.isRouting = false;
      }
      if (this.isAddingArea) {
        this.isAddingArea = false;
      }
      this.canMarkPoint = true;
    }
    ,
    // 以下方法确保表单字段数据为0时不显示，且初始化时数据不为null，不会报错
    handleDisasterTentsInput(value) {
      this.searchSupplyForm.tents = value === '' ? 0 : Number(value);
    }
    ,
    handleFlashlightsInput(value) {
      this.searchSupplyForm.flashlights = value === '' ? 0 : Number(value);
    }
    ,
    handleRaincoatsInput(value) {
      this.searchSupplyForm.raincoats = value === '' ? 0 : Number(value);
    }
    ,
    handleRainBootsInput(value) {
      this.searchSupplyForm.rainBoots = value === '' ? 0 : Number(value);
    }
    ,
    handleRadiusInput(value) {
      this.searchSupplyForm.radius = value;
    }
    ,
    handleTeamTotalMembersInput() {
      this.searchEmergencyTeamForm.totalMembers = value
    }
    ,

    //- ---------------------

    walkStyle() {
      this.visibleGuilde = false;
      this.RouteTime = formatTime(this.humantime);
      if (this.RouteTime === "0分钟") {
        this.RouteTime = "1分钟";
      }
      this.RouteWay = "步行";
      this.selectedDrive = "backcolor: red";
      this.selectedWalk = "backcolor: white";
    }
    ,
    driveStyle() {
      this.visibleGuilde = true;
      if (this.cartime.includes("0时0分钟")) {
        this.RouteTime = "1分钟";
      } else {
        this.RouteTime = formatTime(this.cartime);
      }
      if (this.RouteTime === "0分钟") {
        this.RouteTime = "1分钟";
      }
      this.RouteWay = "驾驶";
    }
    ,

    route() {
      // console.log("调用了")
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
          billboardD(position, start, billBoardId);
          this.propertiesId.push(billBoardId);  // 将billboardId加入propertiesId数组
        } else {
          billboardD(position, end, billBoardId);
          this.propertiesId.push(billBoardId);  // 将billboardId加入propertiesId数组
        }
        // console.log("333")

        if (that.pos.length === 2) {
          // 已获取两个点，开始路径规划
          let path = "";
          let pathName = [];
          let pathM = 0;

          let from = wgs84togcj02(that.pos[0][0], that.pos[0][1]);
          let end = wgs84togcj02(that.pos[1][0], that.pos[1][1]);
          let avoidArea = "";

          // console.log("444")
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
          // console.log("555")
          axios.get(`${AmapApiLocal}/direction/driving?origin=${from}&destination=${end}&extensions=base&strategy=0&avoidpolygons=${avoidArea}&key=7b0b64174ef6951cc6ee669de03e4f59`)
              .then(res => {
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
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    }
    ,

    // 绘制障碍物点的面与半径的中心点已封装！！！
    // 绘制路径的线
    polylineD(data, propertiesId) {

      // 创建一个唯一的 ID，可以使用当前时间戳或其他唯一标识符
      let uniqueId = Cesium.createGuid(); // 或者使用 Date.now()
      polylineD(data, propertiesId, uniqueId);

      this.propertiesId.push(uniqueId);
    }
    ,

    addArea() {
      if (this.canMarkPoint) {
        this.canMarkPoint = false;
      }
      this.clearHandler(); // 清除之前的监听器
      this.isAddingArea = true; // 设置添加受灾区域标志
      let that = this;

      this.handler.setInputAction((event) => {
        if (!this.isAddingArea) return; // 如果已添加区域，则不执行后续代码

        // 获取点击位置的坐标信息
        let ray = viewer.camera.getPickRay(event.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        let cartographic = Cesium.Cartographic.fromCartesian(position);
        let lon = Cesium.Math.toDegrees(cartographic.longitude);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let ar = CreateSimpleCircle(lon, lat, 50, 24);
        that.areas.push({area: ar, name: "area_" + Date.now()});
        let id = "area_" + Date.now();
        pointD(position, id);
        polygonD(ar, id + "a");
        // 这里是更新路径规划，调用路径更新函数
        if (that.pos.length > 0) {
          that.updateRoute(); // 调用方法重新计算路径并避开新障碍区域
        }

        this.isAddingArea = false; // 添加区域完成，设置标志
        this.clearHandler(); // 移除点击事件监听器
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    ,
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
      }

      // 判断是否已存在第三个数字（ID）
      if (that.propertiesId.length >= 3) {
        // 删除第三个ID
        let thirdId = that.propertiesId[2];
        viewer.entities.removeById(thirdId);  // 移除第三个折线
        that.propertiesId.splice(2, 1);  // 删除 propertiesId 中的第三个 ID
      }

      // 获取起点和终点
      let from = wgs84togcj02(that.pos[0][0], that.pos[0][1]);
      let end = wgs84togcj02(that.pos[1][0], that.pos[1][1]);

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

            // 更新路径
            let pathSegments = path.split(";")
                .map(segment => segment.replace(/"/g, "").split(",").map(Number).filter(seg => !isNaN(seg)))
                .filter(segment => segment.length === 2)
                .map(segment => gcj02towgs84(segment[0], segment[1]));

            pathSegments.unshift(that.pos[0]);
            pathSegments.push(that.pos[1]);

            // 将新的路径绘制到地图上
            that.polylineD(pathSegments, that.propertiesId);  // 传递路径和 id 更新折线
          })
          .catch(error => {
            console.error("路径规划请求失败", error);
          });

      // 显示提示
      that.showTips = true;
      this.isRouting = false;  // 路径规划完成，设置标志
    }
    ,
    clearHandler() {
      // 清除所有之前的 LEFT_CLICK 监听器
      if (this.handler) {
        // console.log("11111111")
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
    }
    ,

    showRemove() {
      panels.showRemove = ture;
    }
    ,


    //清空地图所有实体（包含标绘点）
    removes() {
      viewer.entities.removeAll();
      this.areas = [];
    }
    ,


    //--------路径规划清除实体--------------------
    //全部清除
    removeAll() {
      layer.removeRegionLayerJump()
      this.removeAllEmergencySites(); //删除救援力量的标绘点
      this.removePolyline(); // 先清除路径规划
      this.removePoint(); // 再清除障碍物
      this.removethdRegions() //移除区域图层和相关标签
      // this.removeAllEmergencySites();
      this.removeDistrict();  //清除行政区域
      this.removeSuppliesList();  //清除行政区域物资点
      this.removeOldLabels();   // 清除清除行政区域旧的标签
      // 要素图层复选框跟着变化
      this.selectedlayersLocal = this.selectedlayersLocal.filter(item =>
          item !== '救援队伍分布要素图层' && item !== '应急物资存储要素图层'
      );
      // this.updateMapLayers(); // 确保要素图层同步更新

      // 额外清理数据
      this.areas = [];
      this.propertiesId = [];
      this.showTips = false;
      this.panels.showRemove = false;
    }
    ,

    //删除障碍区域
    removePoint() {
      // 遍历存储的障碍物 ID，删除实体
      this.areas.forEach(area => {
        viewer.entities.removeById(area.name); // 删除点
        viewer.entities.removeById(area.name + "a"); // 删除障碍区域
      });

      // 清空障碍物列表
      this.areas = [];
    }
    ,

    //移除路径规划
    removePolyline() {
      let entities = window.viewer.entities.values;
      for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].selfType === "route") {
          window.viewer.entities.remove(entities[i]);
        }
      }
      this.showTips = false;
    }
    ,

    // ------------------------------路径规划+物资匹配---------------------------


    //----------------------时间轴end
    clearResource(viewer) {
      let gl = viewer.scene.context._gl
      viewer.entities.removeAll()
      // viewer.scene.primitives.removeAll()
      // 不用写这个，viewer.destroy时包含此步，在DatasourceDisplay中
      viewer.destroy()
      gl.getExtension("WEBGL_lose_context").loseContext();
      gl = null
    }
    ,

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
    }
    ,

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
    }
    ,

    /**
     * 设置组件展开的面板互斥,避免堆叠
     * 切换组件的显示状态
     * @param {String} component - 要切换的组件名称
     */
    toggleComponent(component) {
      // 收起图层要素
      // this.isExpanded = false;
      // 清除主题地图预览的显示状态
      // this.isshowThematicMapPreview = null;
      // 清除选择的主题地图
      // this.selectthematicMap = null;

      if (component === 'dataStats') {
        // 切换 showSidebarComponents 以显示/隐藏两侧组件
        this.showSidebarComponents = !this.showSidebarComponents;
      } else if (component !== 'legend') {
        // 点击其他按钮时隐藏侧边栏组件，但图例按钮不会触发隐藏
        this.showSidebarComponents = false;
      }
      // 如果点击的是当前活动组件，则关闭它，否则打开新组件
      this.activeComponent = this.activeComponent === component ? null : component;

      if (this.activeComponent === 'layerChoose') {
        // this.removethdRegions();
        let defaultTable = null;
        this.emergencyTitleProperty.forEach(category => {
          let item = category.content.find(i => i.name === "救援物资");
          if (item) {
            defaultTable = item;
          }
        });
        this.emergencyClick(defaultTable)
        this.showTips = false;
        const hasSiChuanRegionLayer = this.selectedlayersLocal.includes('行政区划要素图层');
        // 如果选定了行政区划要素图层，则移除其他区域图层并添加雅安行政区划图层
        if (hasSiChuanRegionLayer) {
          this.addYaanRegion(hasSiChuanRegionLayer);
        }
      }
      if (this.activeComponent !== 'layerChoose') {
        // this.removeAllEmergencySites();
        this.showTips = false;
      }
    }
    ,

    showThematicMapPreview(item) {
      // item 中包含 name, path
      this.ifShowMapPreview = true
      this.imgurlFromDate = item.imgUrl
      this.imgName = item.theme
      this.showTypes = 1
      this.imgshowURL = new URL(this.imgurlFromDate, import.meta.url).href
    }
    ,

    downloadReport(item) {

      this.$notify({
        title: '报告下载',
        message: '数据正在解析中...',
        duration: 7000, // 设置持续时间
        zIndex: 9999  // 设置 zIndex 来确保通知在最上层
      });

      // 报告下载逻辑
      console.log("报告下载逻辑");
      console.log(item);

      const link = document.createElement("a");
      link.href = item.docxUrl;

      // 对文件名进行编码
      const encodedFileName = encodeURIComponent(item.theme);
      link.download = encodedFileName; // 指定下载的文件名

      console.log("下载链接:", link.href);
      console.log("下载文件名:", link.download);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    ,

    /*
    * 添加地震点
    * 在地图上标绘出历史发生过的地震
    * */
    async addHistoryEqPoints() {
      this.removeEntitiesByType("historyEq");
      console.log("data: eqListData000", this.eqListData);
      if (this.eqListData.length === 0) {
        await this.getEqList(); // 等待数据获取完成
        console.log("data: eqListData", this.eqListData);
      }
      // 现在可以安全地使用 this.eqListData
      addHistoryEqPoints(this.centerPoint, this.eqListData);
    },

    async getEqList() {
      try {
        const res = await getAllEqList();
        this.eqListData = res.data;
        console.log(this.eqListData, res, "getEqList");
        return this.eqListData; // 返回数据
      } catch (error) {
        console.error("Error fetching earthquake list:", error);
        throw error; // 抛出错误以便后续处理
      }
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
    }
    ,

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
    }
    ,

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
      this.removeEntitiesByType("ovalCircleTest")

      // 地震震中位置(经纬度)
      let centerPosition = [this.centerPoint.longitude, this.centerPoint.latitude]

      // 在指定的中心点位置添加新的椭圆圈
      addOCTest(this.eqid, this.eqqueueId, centerPosition)
    }
    ,

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
    }
    ,


    /**
     * 此方法通过调用getAllEq函数从服务器获取所有设备的数据，然后将这些数据赋值给eqtableData属性
     * 同时，成功获取数据后，初始化Cesium相关的viewer、websocket连接和pinia状态管理，以便进行设备位置的标绘
     */
    getEq() {
      let that = this
      getAllEqList().then(res => {
        that.eqtableData = res.data
        // 建立WS

        console.log("that.eqtableData111", res, that.eqtableData)


        // 灾损预估模块数据获取
        const eqTownResultDTO = {
          eqid: this.eqid,
          eqqueueId: this.eqqueueId,
        }

        getEqTownResult(eqTownResultDTO).then((res) => {
          const countyData = handleTownData(res.data)
          console.log(countyData)
          // 提取对应专题数据
          this.panelData.buildingDamageData = countyData.buildingDamageData
          this.panelData.economicLossData = countyData.economicLossData
          this.panelData.personalCasualtyData = countyData.personalCasualtyData

          // 人员伤亡图层所需数据格式
          this.layerData.pcData = JSON.parse(JSON.stringify(
              this.panelData.personalCasualtyData.reduce((acc, item) => {
                acc[item.county] = item.partTotal;
                return acc;
              }, {})
          ));

          // 经济损失图层所需数据格式
          this.layerData.ecoData = this.panelData.economicLossData.reduce((acc, item) => {
            acc[item.county] = item.amount;
            return acc;
          }, {});

          // 建筑损毁图层所需数据格式
          this.layerData.bddData = this.panelData.buildingDamageData.reduce((acc, item) => {
            acc[item.county] = item.size;
            return acc;
          }, {});
        });
      })
    }
    ,


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
    }
    ,


    /**
     * 处理区县点击事件
     * @param {Object} district - 区县对象，包含区县名称和代码等信息
     */
    handleDistrictClick() {
      let district = this.selectedRegions[0]
      this.selectedDataByRegions = []

      this.removeOldLabels();

      //清除半径查询实体标签
      this.removethdRegions()
      this.removeAllEmergencySites();
      // 根据区县代码过滤GeoJSON数据
      let filteredFeatures = sichuanCounty.features.filter(feature => {
        return feature.properties.adcode === district.adcode;
      });
      if (filteredFeatures.length > 0) {

        // console.log("filteredFeatures---------------------------", filteredFeatures)

        this.removeSuppliesList();

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
          strokeWidth: 10,
        });

        // 处理地理空间数据的Promise对象
        geoPromise.then(async (dataSource) => {
          // 将数据源添加到观众的数据显示中
          window.viewer.dataSources.add(dataSource);
          // 保存区域图层以便后续使用
          window.regionLayerJump = dataSource

          // 遍历实体并标记行政区划类型
          dataSource.entities.values.forEach(entity => {
            entity._layer = '行政区划'; // 添加标识属性
          });

          // console.log("filteredFeatures-------------", filteredFeatures[0].geometry.coordinates)
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
              // this.labels.push(labelEntity);
            } else {
              // 如果中心点未定义或格式不正确，输出警告信息
              console.warn('中心点未定义或格式不正确:', feature);
            }
          });


          // 飞行到数据源中的实体位置，以便用户查看
          viewer.flyTo(dataSource.entities.values);

          // // 检查标绘点是否在范围内
          // let boundingBox = this.getBoundingBox(filteredFeatures[0].geometry.coordinates[0]);
          // console.log("边界框:", boundingBox);
          //

        }).catch((error) => {
          // 如果加载GeoJSON数据失败，输出错误信息
          console.error("加载GeoJSON数据失败:", error);
        });

        let obj = {
          regionCode: this.selectedRegions[0].adcode
        }
        marchByRegion(obj).then(res => {
          // console.log("marchByRegion-----------------------", res)
          let supplies = res.insideDisasterReliefSupplies
          let emergencyTeam = res.insideRescueTeamsInfo
          let reserves = res.insideEmergencyRescueEquipment
          this.selectedDataByRegions = {supplies, emergencyTeam, reserves}
          // console.log("selectedDataByRegions--------------------", this.selectedDataByRegions)
          this.processPoints(reserves, 'reserves', emergencyRescueEquipmentLogo, "抢险救灾装备");
          this.processPoints(supplies, 'supplies', disasterReliefSuppliesLogo, "救灾物资储备");
          this.processPoints(emergencyTeam, 'emergencyTeam', rescueTeamsInfoLogo, "雅安应急队伍");
          this.listField = 'supplies'
          this.changeDataList('supplies')
        })
      } else {
        // console.error("未找到对应的区县:", adcode);
      }
      this.selectedRegions = []
      this.panels.marchRegionsDialog = false
    }
    ,

    // **改进的清除方法**
    removeOldLabels() {
      viewer.entities.values.forEach(entity => {
        if (entity.label) {
          viewer.entities.remove(entity);  // **只删除区域标签**
        }
      });
    }
    ,

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
    },

    updateMapLayers() {
      console.log(this.selectedlayersLocal, "selectedlayersLocal")

      // 图层映射：添加与移除图层逻辑
      // name: 图层名；add：添加图层；remove：移除图层
      const layerActions = [
        {
          name: '标绘点图层',
          add: () => {
            this.isMarkingLayerLocal = true;
            timeLine.markerLayerShow(this.plots)
            clearTimeout(this.timeoutlayerActions)
            this.timeoutlayerActions=null
          },
          remove: () => {
            this.isMarkingLayerLocal = false;
            this.timeoutlayerActions=setTimeout(() => {
              timeLine.markerLayerHidden(this.plots);
            }, 1000);
          }
        },
        {
          name: '行政区划要素图层',
          add: this.addYaanRegion,
          remove: () => {
            this.removeDataSourcesLayer('siChuanCityRegionLayer');
            this.removeDataSourcesLayer('sichuanCountyRegionLayer');
            this.removeDataSourcesLayer('yaAnVillageRegionLayer');
            // 移除监听器
            viewer.camera.changed.removeEventListener(this.handleCameraChange);
            this.siChuanCityEntity.forEach(entity => {
              viewer.entities.remove(entity);
            });
            this.siChuanCountyEntity.forEach(entity => {
              viewer.entities.remove(entity);
            });
            this.siChuanVillageEntity.forEach(entity => {
              viewer.entities.remove(entity);
            });
          }
        },
        {
          name: '人口密度要素图层',
          add: this.addPopLayer,
          remove: () => this.removeImageryLayer('PopLayer')
        },
        {
          name: '交通网络要素图层',
          add: this.addTrafficLayer,
          remove: () => {
            this.removeImageryLayer('TrafficLayer');
            this.removeImageryLayer('TrafficTxtLayer');
          }
        },
        {
          name: '应急物资存储要素图层',
          add: () => this.processPoints(this.disasterReserves, 'reserves', emergencyRescueEquipmentLogo, '应急物资存储'),
          remove: () => this.removeEntitiesByType('reserves')
        },
        {
          name: '救援队伍分布要素图层',
          add: () => this.processPoints(this.emergencyTeam, 'emergencyTeam', rescueTeamsInfoLogo, '救援队伍分布'),
          remove: () => this.removeEntitiesByType('emergencyTeam')
        },
        {
          name: '避难场所要素图层',
          add: () => this.processPoints(this.emergencyShelters, 'emergencyShelters', emergencySheltersLogo, '避难场所'),
          remove: () => this.removeEntitiesByType('emergencyShelters')
        },
        {
          name: '历史地震要素图层',
          add: this.addHistoryEqPoints,
          remove: () => this.removeEntitiesByType('historyEq')
        },
        {
          name: '断裂带要素图层',
          add: this.addFaultZone,
          remove: () => {
            if (window.duanliedai) {
              let removeDuanliedai = window.viewer.dataSources.remove(window.duanliedai, true);
              console.log(removeDuanliedai, "removeDuanliedai")
              window.duanliedai = null;
            }
            this.removeDataSourcesLayer('faultZone');
            window.duanliedai = null;
          }
        },
        {
          name: '医院要素图层',
          add: addHospitalLayer,
          remove: () => this.removeDataSourcesLayer('hospital')
        },
        {
          name: '村庄要素图层',
          add: addVillageLayer,
          remove: () => this.removeDataSourcesLayer('village')
        },
        {
          name: '烈度圈要素图层',
          add: this.addOvalCircle,
          remove: () => {
            this.removeEntitiesByType('ovalCircleTest');
            this.removeDataSourcesLayer('ovalCircleTest');
          }
        },
        {
          name: '灾损预估-人员伤亡要素图层',
          add: () => {
            this.removethdRegions();
            this.addThemeLayer(this.layerData.pcData, 'personalCasualty');
            this.showPeopleLegend = true;// 指挥大屏-图层管理-人员伤亡图层图例状态
          },
          remove: () => {
            this.removeDataSourcesLayer('personalCasualty');
            this.showPeopleLegend = false;// 指挥大屏-图层管理-经济损失图层图例状态
            this.removeRegionLabels();
          }
        },
        {
          name: '灾损预估-经济损失要素图层',
          add: () => {
            this.removethdRegions();
            this.addThemeLayer(this.layerData.ecoData, 'economicLoss');
            this.showEconomicLegend = true;// 指挥大屏-图层管理-经济损失图层图例状态
          },
          remove: () => {
            this.removeDataSourcesLayer('economicLoss');
            this.showEconomicLegend = false;// 指挥大屏-图层管理-经济损失图层图例状态
            this.removeRegionLabels();
          }
        },
        {
          name: '灾损预估-建筑损毁要素图层',
          add: () => {
            this.removethdRegions();
            this.addThemeLayer(this.layerData.bddData, 'buildingDamage');
            this.showBuildingLegend = true; // 指挥大屏-图层管理-建筑损毁图层图例状态
          },
          remove: () => {
            this.removeDataSourcesLayer('buildingDamage');
            this.showBuildingLegend = false; // 指挥大屏-图层管理-建筑损毁图层图例状态
            this.removeRegionLabels();
          }
        },
      ];
      layerActions.forEach(layer => {
        if (this.selectedlayersLocal.includes(layer.name) || this.selectedResourceScheduling.includes(layer.name) || this.selectedDisasterEstimate.includes(layer.name)) {
          layer.add();
        } else {
          layer.remove();
        }
      });
    }
    ,
    /**
     * 处理并添加点数据为实体
     *
     * 此函数负责处理点数组，验证数据格式，过滤无效数据，并将有效的点数据添加为实体
     * 它主要用于在地图上标记点，每个点由其经纬度、类型、图标和表格名标识
     *
     * @param {Array} pointArr - 点数据数组，每个点包含经纬度和唯一标识符
     * @param {String} type - 点的类型，用于分类
     * @param {{}} icon - 点的图标，用于在地图上显示
     * @param {String} tableName - 点的表格名，用于数据来源
     */
    processPoints(pointArr, type, icon, tableName) {
      if (!Array.isArray(pointArr)) {
        console.error(`${tableName} 数据格式不正确`, pointArr);
        return;
      }

      pointArr = pointArr.filter(e => e.longitude !== null);

      pointArr.forEach(element => {
        // 检查是否已存在具有相同ID的实体
        let existingEntity = window.viewer.entities.getById(element.uuid);
        if (existingEntity) {
          console.warn(`id为${element.uuid}的实体已存在。跳过此实体`);
          return;
        }
        // 检查经度、纬度和高度是否为有效数值
        if (isNaN(element.longitude) || isNaN(element.latitude)
            || element.longitude < -180 || element.longitude > 180
            || element.latitude < -90 || element.latitude > 90) {
          console.log(`id为${element.uuid}的实体的坐标无效或超出范围`, element.longitude, element.latitude);
          return;
        }
        let longitude = Number(element.longitude);
        let latitude = Number(element.latitude);

        element.type = type;
        element.icon = icon

        let bool = type === 'supplies'

        // 添加实体
        this.addEntity(element, icon, tableName, longitude, latitude, bool);
      });
    }
    ,


    /**
     * 向地图中添加实体对象
     *
     * @param {Object} element - 实体对象，包含实体的各类属性
     * @param {String} icon - 实体的图标URL
     * @param {String} tableName - 实体所在的表名称
     * @param {Number} longitude - 实体的经度
     * @param {Number} latitude - 实体的纬度
     */
    addEntity(element, icon, tableName, longitude, latitude, bool) {
      window.viewer.entities.add({
        uuid: element.uuid,
        position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
        billboard: {
          image: icon,
          width: 40,
          height: 40,
          eyeOffset: new Cesium.Cartesian3(0, 0, 0),
          color: Cesium.Color.WHITE.withAlpha(1),
          scale: 0.8,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 禁用，导致图标在高度计算或与地形交互时出现闪烁。 原作用：绑定到地形高度,让billboard贴地
          depthTest: bool ? true : false, // 让 Cesium 正确处理图标的遮挡关系
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        layer: tableName,
        properties: {
          tableName: tableName, // 动态传入的表名称
          ...element, // 将element对象展开，自动填充所有属性
          longitude: element.longitude,
          latitude: element.latitude
        }
      });
    }
    ,

    /**
     * 移除地图上的标绘点
     */
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
    }
    ,

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
      console.log("removeEntitiesByType", type)
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
    }
    ,

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
    }
    ,


    /**
     * 添加雅安地区图层
     * 此函数负责将雅安地区的地理边界数据加载到3D地图中，并为其添加可视化图层
     * 如果图层已存在，则不会重复添加
     */
    addYaanRegion() {
      // 添加监听器
      viewer.camera.changed.addEventListener(this.handleCameraChange);
      // 初始加载市级图层
      if (!viewer.dataSources.getByName('siChuanCityRegionLayer')[0]) {
        this.loadCityLayer(viewer);
      }
    }
    ,

// 定义命名函数
    handleCameraChange() {
      // 定义相机高度阈值
      const CITY_LAYER_HEIGHT = 1000000; // 市级图层的高度阈值
      const COUNTY_LAYER_HEIGHT = 100000; // 区县级图层的高度阈值
      const VILLAGE_LAYER_HEIGHT = 10000; // 道路级图层的高度阈值

      const height = viewer.camera.positionCartographic.height; // 获取相机高度
      console.log("当前相机高度:", height);

      // 根据高度动态加载或移除图层
      if (height > CITY_LAYER_HEIGHT) {
        // 移除区县级和道路级标签
        this.siChuanCountyEntity.forEach(entity => {
          viewer.entities.remove(entity);
        });

        this.siChuanVillageEntity.forEach(entity => {
          viewer.entities.remove(entity);
        });

        // 加载市级图层
        if (!viewer.dataSources.getByName('siChuanCityRegionLayer')[0]) {
          this.loadCityLayer(viewer);
        }
        // 移除区县级和道路级图层
        this.removeDataSourcesLayer('sichuanCountyRegionLayer');
        this.removeDataSourcesLayer('yaAnVillageRegionLayer');
      } else if (height > COUNTY_LAYER_HEIGHT) {
        // 移除市级和道路级标签
        this.siChuanCityEntity.forEach(entity => {
          viewer.entities.remove(entity);
        });

        this.siChuanVillageEntity.forEach(entity => {
          viewer.entities.remove(entity);
        });
        // 加载区县级图层
        if (!viewer.dataSources.getByName('sichuanCountyRegionLayer')[0]) {
          this.loadCountyLayer(viewer);
        }
        // 移除道路级图层
        this.removeDataSourcesLayer('yaAnVillageRegionLayer');
        this.removeDataSourcesLayer('siChuanCityRegionLayer');
      } else if (height > VILLAGE_LAYER_HEIGHT) {
        // 移除市级和区县级标签
        this.siChuanCityEntity.forEach(entity => {
          viewer.entities.remove(entity);
        });

        this.siChuanCountyEntity.forEach(entity => {
          viewer.entities.remove(entity);
        });
        // 加载道路级图层
        if (!viewer.dataSources.getByName('yaAnVillageRegionLayer')[0]) {
          this.loadVillageLayer(viewer);
        }
        this.removeDataSourcesLayer('siChuanCityRegionLayer');
        this.removeDataSourcesLayer('sichuanCountyRegionLayer');
      }
    }
    ,

// 加载市级图层
    loadCityLayer(viewer) {
      Cesium.GeoJsonDataSource.load(siChuanCity, {
        clampToGround: false,
        stroke: Cesium.Color.WHITE,
        strokeWidth: 4,
        fill: Cesium.Color.TRANSPARENT,
      }).then(dataSource => {
        viewer.dataSources.add(dataSource);
        dataSource.name = 'siChuanCityRegionLayer';

        // 添加区域标签
        siChuanCity.features.forEach(feature => {
          const firstPolygon = feature.geometry.coordinates[0][0];
          const positions = firstPolygon.map(vertex => Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]));
          const centroid = this.calculateCentroid(positions);

          const regionLabel = viewer.entities.add({
            position: centroid,
            label: {
              text: feature.properties.name || '未命名',
              font: '18px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              pixelOffset: new Cesium.Cartesian2(0, 0),
            }
          });
          this.siChuanCityEntity.push(regionLabel); // 使用 this.RegionLabels

        });
        console.log("1111111111", this.siChuanCityEntity)
        console.log("市级图层加载成功！");
      }).catch(error => {
        console.error("加载市级图层失败:", error);
      });
    }
    ,

// 加载区县级图层
    loadCountyLayer(viewer) {
      Cesium.GeoJsonDataSource.load(sichuanCounty, {
        clampToGround: false,
        stroke: Cesium.Color.YELLOW,
        strokeWidth: 4,
        fill: Cesium.Color.TRANSPARENT,
      }).then(dataSource => {
        viewer.dataSources.add(dataSource);
        dataSource.name = 'sichuanCountyRegionLayer';

        // 添加区域标签
        sichuanCounty.features.forEach(feature => {
          const firstPolygon = feature.geometry.coordinates[0][0];
          const positions = firstPolygon.map(vertex => Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]));
          const centroid = this.calculateCentroid(positions);
          const regionLabel = viewer.entities.add({
            position: centroid,
            label: {
              text: feature.properties.name || '未命名',
              font: '18px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              pixelOffset: new Cesium.Cartesian2(0, 0),
            }
          });

          this.siChuanCountyEntity.push(regionLabel); // 使用 this.RegionLabels

        });
        console.log("22222222222", this.siChuanCountyEntity)
        console.log("区县级图层加载成功！");
      }).catch(error => {
        console.error("加载区县级图层失败:", error);
      });
    }
    ,

    // 加载道路级图层
    loadVillageLayer(viewer) {
      Cesium.GeoJsonDataSource.load(yaAnVillage, {
        clampToGround: false,
        stroke: Cesium.Color.ORANGE,
        strokeWidth: 4,
        fill: Cesium.Color.TRANSPARENT,
      }).then(dataSource => {
        viewer.dataSources.add(dataSource);
        dataSource.name = 'yaAnVillageRegionLayer';

        // 添加区域标签
        yaAnVillage.features.forEach(feature => {
          const firstPolygon = feature.geometry.coordinates[0][0];
          const positions = firstPolygon.map(vertex => Cesium.Cartesian3.fromDegrees(vertex[0], vertex[1]));
          const centroid = this.calculateCentroid(positions);

          const regionLabel = viewer.entities.add({
            position: centroid,
            label: {
              text: feature.properties.name || '未命名',
              font: '18px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              pixelOffset: new Cesium.Cartesian2(0, 0),
            }
          });
          this.siChuanVillageEntity.push(regionLabel); // 使用 this.RegionLabels
        });
        console.log("33333333333", this.siChuanVillageEntity)

        console.log("道路级图层加载成功！");
      }).catch(error => {
        console.error("加载道路级图层失败:", error);
      });
    }
    ,

// 计算多边形的质心
    calculateCentroid(positions) {
      let centroid = Cesium.Cartesian3.ZERO;
      positions.forEach(pos => {
        centroid = Cesium.Cartesian3.add(centroid, pos, new Cesium.Cartesian3());
      });
      return Cesium.Cartesian3.divideByScalar(centroid, positions.length, new Cesium.Cartesian3());
    }
    ,

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
    }
    ,


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
    }
    ,

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
    }
    ,

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
    }
    ,
    //标绘图层清除-->

    /**
     * 处理标记图层切换
     * 当切换到本地标记图层时，如果不存在名为'drawingLayer'的图层，则创建一个新的自定义图层并添加到视图中
     * 当切换到非本地标记图层时，如果存在名为'drawingLayer'的图层，则从视图中移除该图层
     *
     * @param {boolean} isMarkingLayerLocal - 表示是否为本地标记图层
     */
    // handleMarkingLayerChange(isMarkingLayerLocal) {
    //   if (isMarkingLayerLocal) {
    //     // 如果视图中不存在名为'drawingLayer'的图层，则创建一个新的自定义图层并添加到视图中
    //     if (!window.viewer.dataSources.getByName('drawingLayer')[0]) {
    //       let newLayer = new Cesium.CustomDataSource('drawingLayer');
    //       window.viewer.dataSources.add(newLayer);
    //       newLayer.show = true;
    //       this.isMarkingLayerLocal = true;
    //     }
    //   } else {
    //     // 当切换到非本地标记图层时，将isMarkingLayerLocal设置为false
    //     this.isMarkingLayerLocal = false;
    //     // 如果视图中存在名为'drawingLayer'的图层，则从视图中移除该图层
    //     let dataSource = window.viewer.dataSources.getByName('drawingLayer')[0];
    //     if (dataSource) {
    //       window.viewer.dataSources.remove(dataSource);
    //     }
    //   }
    // }
    // ,

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
      // const fullUrl = `${url}?${urlParams.toString()}`;
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
    }
    ,


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
        // //console.log(this.imgshowURL)
      } else {
        this.ifShowMapPreview = false
      }

    }
    ,

    showThematicMapDialog(item) {

      console.log("专题图item-> ", item)

      // 显示专题图弹框逻辑
      this.ifShowMapPreview = true;
      this.imgName = item.theme;
      this.imgshowURL = item.imgUrl;
    }
    ,
    ifShowThematicMapDialog(val) {
      this.ifShowMapPreview = val;
      if (!val) {
        this.imgName = "";
        this.imgshowURL = "";
      }
    }
    ,
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
    }
    ,

    //模型调整
    initModelTable() {
      getAllModel().then(res => {
        this.modelList = res
        this.ModelTotal = res.length
        this.modelTableData = this.getPageArr(this.modelList)
      })
    }
    ,
    tiltphotographymodel(row) {
      this.$message({
        showClose: true,
        message: "当前正在浏览 " + row.name + " 倾斜模型",
        duration: 10000,
        offset: 200
      });
    }
    ,
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
    }
    ,
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
    }
    ,
    findModel() {
      findModel()
    }
    ,
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
    }
    ,
    // 修改table 中每行的样式
    tableColor({row, column, rowIndex, columnIndex}) {
      if (rowIndex % 2 == 1) {
        return {
          'background-color': '#ffffff00',
          'padding': '5px 10px',
          'margin': '1',
          'textAlign': 'center'
        }
      } else {
        return {
          'background-color': '#ffffff00',
          'padding': '5px 10px',
          'margin': '1',
          'textAlign': 'center'
        }
      }
    }
    ,
    //数组切片
    getPageArr(data) {
      console.log("🚀 getPageArr() 调用：", data);

      if (!Array.isArray(data) || data.length === 0) {
        console.warn("⚠️ getPageArr() 输入数据无效，返回空数组！");
        return [];
      }

      let arr = [];
      let total = this.ModelTotal || data.length; // 兼容处理
      let start = (this.modelCurrentPage - 1) * this.modelPageSize;
      let end = this.modelCurrentPage * this.modelPageSize;
      if (end > total) {
        end = total;
      }

      console.log(`📌 分页信息：start=${start}, end=${end}, 数据总长度=${total}`);

      for (; start < end && start < data.length; start++) {
        if (!data[start]) continue; // 避免 undefined 访问属性
        data[start].show = false;
        arr.push(data[start]);
      }

      console.log("✅ 最终分页结果：", arr);
      return arr;
    }
    ,

    //`每页 ${val} 条`
    handleSizeChange(val) {
      this.modelPageSize = val
      this.modelTableData = this.getPageArr(this.modelList)
      this.pageSize = val;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    }
    ,
    // `当前页: ${val}`
    handleCurrentChange(val) {
      this.modelCurrentPage = val
      this.modelTableData = this.getPageArr(this.modelList)
      this.currentPage = val;
      this.showSuppliesList = this.getPageArr(this.selectedSuppliesList);
    }
    ,


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

    }
    ,
    handleNodeClick(data) {
      console.log('hhhhhhhhhhhhhh', data);
    }
    ,
    loadNode(node, resolve) {
      // 根节点层
      if (node.level === 0) {
        return resolve([
          {name: '图层要素'},
          {name: '灾损预估'},
          {name: '资源调度'},
        ]);
      }

      // 第一层子节点
      let data = [];
      if (node.data.name === '图层要素') {
        // 返回所有图层项目
        data = this.layeritems.map(item => ({
          name: item.name
        }));
      } else if (node.data.name === '灾损预估') {
        // 返回视角跳转的选项
        data = this.DamageAssessmentLayers.map(item => ({
          name: item.name
        }))
      } else if (node.data.name === '资源调度') {
        // 返回视角跳转的选项
        data = this.ResourceSchedulingLayers.map(item => ({
          name: item.name
        }))
      }

      resolve(data);
    }
    ,
    // 弹框不同时出现
    togglePositionFlyTo() {
      // console.log('1.------------------------------')
      // console.log(this.showPositionFlyTo)
      this.showPositionFlyTo = !this.showPositionFlyTo;
      if (this.showPositionFlyTo) {
        this.showLayerFeatures = false; // 关闭其他弹框
        this.showEqListPanel = false; // 关闭其他弹框
        this.showModelPanel = false; // 关闭其他弹框
        this.showSlopeAnalysis = false; // 关闭其他弹框
      }
    }
    ,
    toggleLayerFeatures() {
      // console.log('2.------------------------------')
      // console.log(this.showLayerFeatures)
      this.showLayerFeatures = !this.showLayerFeatures;
      if (this.showLayerFeatures) {
        this.showPositionFlyTo = false; // 关闭其他弹框
        // layer.removeRegionLayerJump()
        this.showEqListPanel = false; // 关闭其他弹框
        this.showModelPanel = false; // 关闭其他弹框
        this.showSlopeAnalysis = false; // 关闭其他弹框
      }
    }
    ,
    // 控制地震列表显隐
    toggleEqListPanel() {
      this.showEqListPanel = !this.showEqListPanel;
      if (this.showEqListPanel) {
        this.showLayerFeatures = false; // 关闭其他弹框
        this.showPositionFlyTo = false; // 关闭其他弹框
        // layer.removeRegionLayerJump()
        this.showModelPanel = false; // 关闭其他弹框
        this.showSlopeAnalysis = false; // 关闭其他弹框
      }
    }
    ,
    toggleModelPanel() {
      this.showModelPanel = !this.showModelPanel;
      if (this.showModelPanel) {
        this.showLayerFeatures = false; // 关闭其他弹框
        this.showPositionFlyTo = false; // 关闭其他弹框
        // layer.removeRegionLayerJump()
        this.showEqListPanel = false; // 关闭其他弹框
        this.showSlopeAnalysis = false; // 关闭其他弹框
      }
    }
    ,
    toggleSlopeAnalysis(websock) {

      this.showSlopeAnalysis = !this.showSlopeAnalysis;
      if (this.showSlopeAnalysis) {
        // 还原
        this.slopeStatistics = [
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
        ];
        this.showLayerFeatures = false; // 关闭其他弹框
        this.showPositionFlyTo = false; // 关闭其他弹框
        // layer.removeRegionLayerJump()
        this.showEqListPanel = false; // 关闭其他弹框
        this.showModelPanel = false; // 关闭其他弹框
        toggleSlopeAnalysis(websock);
        window.addEventListener('slopeStatisticsUpdated', (e) => {
          const slopeStatistics = e.detail;
          // console.log('接收：:', slopeStatistics);
          this.slopeStatistics = slopeStatistics;
        });
      } else {
        // 删除所有坡面分析实体与图层
        deleteSlopeEntities();
      }
    }
    ,
    emergencyClick(contentItem) {
      // 设置选中效果
      this.emergencyTitleProperty.forEach(title => {
        title.content.forEach(item => {
          item.active = false;
        });
      });
      contentItem.active = true;

      // 触发事件
      this.toggleClick(contentItem.action);
    }
    ,
    toggleClick(action) {

      console.log("事件：", action)

      for (let key in this.panels) {
        if (this.panels.hasOwnProperty(key)) {
          this.panels[key] = false;
        }
      }

      if (this[action]) {
        this[action](); // 无参数调用
        console.log("调用函数1")
        this.panels.tableVisible = false;
      } else if (action.includes('=')) {
        console.log("调用函数2")

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
        console.log("调用函数3")

        this.panels.tableVisible = true;
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
    }
    ,


    // 10.6 渲染图层
    addThemeLayer(layerData, type) {
      this.renderLayer("");
      if (layerData) {
        const entries = Object.entries(layerData);
        const counties = entries.map(([key]) => key);
        const numbers = entries.map(([, value]) => value);
        const layerName = `${type}`;

        // 加载 sichuanCounty.json 数据
        Cesium.GeoJsonDataSource.load(sichuanCounty, {
              clampToGround: true,
            }
        ).then((geoJsonDataSource) => {
          viewer.dataSources.add(geoJsonDataSource);
          geoJsonDataSource.name = layerName;

          const entities = geoJsonDataSource.entities.values;

          entities.forEach((entity) => {
            const countyName = entity.name;

            // 如果县区存在于传入的 layerData 中
            if (counties.includes(countyName)) {
              const index = counties.indexOf(countyName);
              const number = numbers[index];

              let colorIndex, legendColorArray;

              // 根据不同的图层类型计算颜色索引
              if (type === 'economicLoss') {
                colorIndex = this.getColorIndex(number, this.ecoLegendColor, [10000, 50000, 100000, 200000, 500000, 1000000]);
                legendColorArray = this.ecoLegendColor;
              } else if (type === 'buildingDamage') {
                colorIndex = this.getColorIndex(number, this.bddLegendColor, [0.1, 0.5, 1, 2, 5, 10]);
                legendColorArray = this.bddLegendColor;
              } else if (type === 'personalCasualty') {
                if (number < 1) {
                  this.setPolygonTransparent(entity);
                  return;
                }
                colorIndex = this.getColorIndex(number, this.pcLegendColor, [1, 5, 10, 20, 50, 100, 250, 500]);
                legendColorArray = this.pcLegendColor;
              }

              // 设置填充颜色和边框
              this.setPolygonColor(entity, legendColorArray[colorIndex]);
            } else {
              // 如果县区不在 layerData 中，设置为透明并隐藏边线
              this.setPolygonTransparent(entity);
            }
          });
          this.renderLayer(type);
        });
      }
    }
    ,

    // 专门用来移除指定图层
    removeLayers(layersToRemove) {
      // layersToRemove 是一个数组
      layersToRemove.forEach(layerName => {
        // 获取所有与 layerName 匹配的 DataSource
        let matchingLayers = window.viewer.dataSources._dataSources.filter(layer => layer._name === layerName);
        // 遍历匹配的 DataSource 并删除
        matchingLayers.forEach(layer => {
          window.viewer.dataSources.remove(layer);
        });
      });
    }
    ,

    // 专门用来渲染指定图层，同时去掉（隐藏/销毁）其他图层
    renderLayer(layerToRender) {
      // layerToRender 是一个变量
      const layersToRemove = this.eqThemes.layers.filter(layer => layer !== layerToRender);
      this.removeLayers(layersToRemove)
      this.removeEntitiesByType(layersToRemove)
    }
    ,

    // 设置填充颜色和边框
    setPolygonColor(entity, colorString) {
      const rgb = this.getRgbFromColorString(colorString);
      entity.polygon.material = Cesium.Color.fromBytes(rgb[0], rgb[1], rgb[2], 200);
      entity.polygon.outline = true;
      entity.polygon.outlineColor = Cesium.Color.WHITE;
    }
    ,

    // 获取颜色索引
    getColorIndex(number, legendColor, threshold) {
      for (let i = 0; i < threshold.length; i++) {
        if (number < threshold[i]) return i;
      }
      // 超过最大阈值，使用最后一个颜色
      return legendColor.length - 1;
    }
    ,

    // 设置为透明
    setPolygonTransparent(entity) {
      entity.polygon.material = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0);
      entity.polygon.outline = false;
    }
    ,

    // 将字符串颜色解析为 RGB 数组
    getRgbFromColorString(colorString) {
      return colorString
          .replace('(', '')
          .replace(')', '')
          .split(',')
          .map((c) => parseInt(c.trim()));
    }
    ,

    convertColor(colorString) {
      return colorString.replace(/[()]/g, '').split(',').map(c => parseInt(c.trim())).join(', ');
    }
    ,

    removeRegionLabels() {
      this.RegionLabels.forEach((label) => {
        viewer.entities.remove(label);
      });
      this.RegionLabels = []; // 清空数组，防止重复删除
    }
    ,

    closePanel() {
      this.panels.tableVisible = false; // 隐藏面板

    }
    ,

    // 单选框自定义点击选中逻辑，实现单选框可取消选中（组件默认中不包含此功能，所以自定义）
    toggleRadio(value) {
      if (this.selectedDisasterEstimate === value) {
        // 如果当前选中的值等于点击的值，则取消选中
        this.selectedDisasterEstimate = '';
      } else {
        // 否则选中当前值
        this.selectedDisasterEstimate = value;
      }
    }
    ,
  },
  watch: {
    selectedDisasterEstimate(newVal, oldVal) {
      this.updateMapLayers();
    },
  },
}
</script>

<style scoped>
/*地图*/
#cesiumContainer {
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
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
  transform: scale(0.7);
  z-index: 1;
  overflow: hidden;
  right: 23%;
  top: 10%;
}

/* 更改搜索、切换地形图组件位置*/
:deep(.cesium-viewer-toolbar) {
  display: block;
  position: absolute;
  top: 95%;
  left: 12.5%;
  z-index: 999999 !important;
  width: 7%;
}


:deep(.cesium-baseLayerPicker-dropDown) {
  position: absolute;
  bottom: 41px;
  left: -167px !important;
  width: 398px !important;
  height: 310px !important;
}

:deep(.cesium-baseLayerPicker-dropDown-visible) {
  z-index: 100 !important;
  background-color: #2b323a;
}


/*时间轴 头顶时间*/
:deep(.topCurrentTimeLabel) {
  top: 12%;
}


/*左右组件*/
.pop_left_background {
  top: 13%;
  left: 1%;
  height: 80.8vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(90deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(44, 69, 94, 0) 100%);
}


.pop_right_background {
  top: 13%;
  right: 1%;
  height: 80.8vh;
  width: 22%;
  position: absolute;
  background: rgb(4, 20, 34);
  background: linear-gradient(270deg, rgba(4, 20, 34, 1) 0%, rgba(14, 37, 61, 0.9) 41%, rgba(26, 54, 77, 0.75) 66%, rgba(42, 89, 135, 0.45) 88%, rgba(47, 82, 117, 0.3) 95%, rgba(44, 69, 94, 0) 100%);
  z-index: 100;
}

/*灾情总览组件*/
:deep(.timelineLegend) {
  width: 22vw;
}

:deep(.timelineLegend.open) {
  width: 33%;
}

:deep(.legend-item) {
  margin-bottom: 7px;
}

/*未整理*/

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
  overflow-x: hidden;
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

/*·························································*/


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


.thd-listTablePint {
  width: 26.5%;
  top: 13%;
  height: 79%;
  z-index: 30;
  right: 0.3%;
  display: flex;
  flex-direction: column;
  gap: 10px; /* 弹窗间距 */
  position: absolute;
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

/*图层要素选项颜色改为白色*/
.el-checkbox {
  color: #FFFFFF;
}

/*行政区划按钮样式*/
.district-buttons {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  justify-content: space-between;
}

.district-button {
  flex: 0 0 20%; /* 每行5个按钮 */
  display: flex;
  justify-content: center;
  margin: 0 4px 20px 10px; /* 调整按钮之间的间距 */
}

.district-button.selected {
  border: none;
  background-color: #409eff; /* 选中按钮的背景色 */
  color: white; /* 选中按钮的文字颜色 */
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
  font-size: x-small;
}

:deep(.el-pagination__total) {
  color: #FFFFFF;
}

:deep(.el-pagination>.is-last) {
  color: #FFFFFF;
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

/* 设置"图层要素"样式 */
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
  border: 2px solid #fcfcfc; /* 滑块的边框和轨道相同的颜色，可以制造"边距"的效果 */
}

.personbutton {
  position: absolute;
  z-index: 60;
  top: 20.5%;
  left: 31%;
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
  width: 450px;
  border-radius: 5px;
  background: rgb(0, 195, 255);
  background: linear-gradient(90deg, rgb(22 105 179 / 9%) 25%, rgb(10 33 75 / 76%) 88%);
  color: #fff;
  z-index: 100;
  top: 130px;
  right: 0;
  background-color: rgba(53, 59, 67, 0.8);
  height: 80.8vh;
  overflow-y: auto;
  overflow-x: hidden;
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
  padding-right: 3%;
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
  display: flex; /* 让按钮横向排列 */
  justify-content: space-between; /* 按钮左右分布 */
  align-items: center;
  width: auto; /* 适应内容 */
  gap: 12px; /* 按钮之间的间距 */
  padding: 0 16px 16px 0; /* 保留原来的 padding */
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
  overflow-x: hidden;
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
  height: 80.8vh;
  overflow: auto;
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

/* 资源调度样式头 */
.emergencySelect {
  position: absolute;
  right: 0;
  width: 35vw;
  height: 30vh;
  background-color: #293d4f;
  z-index: 900;
}

.emergencyTitles {
  height: 25%;
  background-color: #47b0f8;
  display: flex;
}

.emergencyTitle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  border-right: 1.5px solid #ffffff;
  margin: 0 auto;
}

.emergencyTitle:last-child {
  border-right: none;
}

.emergencyName {
  color: #fff;
  margin-left: 5px;
  font-size: 16px;
}

.emergencyContents {
  width: 100%;
  display: flex;
  height: 75%;
}

.emergencyContent {
  flex: 1;
  height: 100%;
  border-right: 1.5px solid #ffffff;
}

.emergencyContent:last-child {
  border-right: none;
}

.emergencyContentItem {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% / 3);
  color: #fff;
  border-bottom: 1.5px solid #ffffff;
  cursor: pointer;
}

.emergencyContentItem:hover {
  box-shadow: 0 0 15px #007fde, inset 0 0 25px #06b7ff;
  transition: all 0.3s;
}

.emergencyContentItem:last-child {
  border-bottom: none;
}

.emergencyContentItem.active {
  box-shadow: 0 0 15px #007fde, inset 0 0 25px #06b7ff;
}

.panelButtons {
  padding: 0 16px 16px 0;
}

.emergencyPanel {
  position: absolute;
  top: 30vh;
  right: 0;
  width: 35vw;
  border-radius: 5px;
  background-color: rgba(53, 59, 67, 0.8);
  z-index: 100;
}

.emergencyPanelTop {
  width: 100%;
  padding: 10px;
  height: 44px;
  border-radius: 5px;
  background-color: rgba(40, 59, 77, 0.8);
}

.emergencyPanelName {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  position: relative;
  margin: 0;
}


.emergencyPanelRout {
  position: absolute;
  right: 0;
  width: 35vw;
  border-radius: 5px;
  background-color: rgba(53, 59, 67, 0.8);
  z-index: 100;
  margin-top: 58px; /* 可调整间距 */
}

.emergencyPanelTopRout {
  width: 100%;
  padding: 10px;
  height: 39px;
  border-radius: 5px;
  background-color: rgba(40, 59, 77, 0.8);
}

.emergencyPanelNameRout {
  color: #FFFFFF;
  font-size: 1.1rem;
  font-weight: 550;
  position: relative;
  margin: 0;
}

.emergencyPanel,
.emergencyPanelRout {
  border-radius: 5px;
  background-color: rgba(53, 59, 67, 0.8);
}


::v-deep .panelForm .el-form-item__label {
  color: #FFF;
}

/* 资源调度样式尾 */

/*指挥大屏-图层管理-灾害预估图例样式*/
.legend {
  width: 7rem;
  padding: 5px 0 0 10px;
}

ul {
  padding: 0;
}

li {
  display: flex;
  margin: 3px 0;
  color: #fff;
  width: 100%;
  height: 15px;
  line-height: 15px;
  font-size: 12px;
}

.legend-span {
  color: #fff;
  font-size: 14px;
  margin-right: 10px;
}


.choose {
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  flex-direction: row;
  align-content: space-around;
  align-items: flex-start;


}


/*路径规划——清楚实体按钮样式*/
.container {
  width: 100%;
  height: 68px;
  display: flex;
  flex-direction: row; /* 改为行布局 */
  justify-content: center;
  align-items: center;
  gap: 20px; /* 按钮之间的间距 */
}

.button:not(:last-child) {
  margin-bottom: 0; /* 移除按钮之间的垂直间距 */
}

/* 其他样式保持不变 */
.type--A {
  --line_color: #a6a4a4;
  --back_color: #ffecf6;
}

.type--B {
  --line_color: #a97bc0;
  --back_color: #e9ecff;
}

.type--C {
  --line_color: #479ecb;
  --back_color: #defffa;
}

.button {
  position: relative;
  z-index: 0;
  width: 240px;
  height: 56px;
  text-decoration: none;
  font-size: 14px;
  font-weight: bold;
  color: var(--line_color);
  letter-spacing: 2px;
  transition: all 0.3s ease;
  overflow: hidden; /* 确保背景色不会溢出 */
  background: transparent; /* 初始背景透明 */
}

.button__text {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.button::before,
.button::after,
.button__text::before,
.button__text::after {
  content: "";
  position: absolute;
  height: 3px;
  border-radius: 2px;
  background: var(--line_color);
  transition: all 0.5s ease;
}

.button::before {
  top: 0;
  left: 54px;
  width: calc(100% - 56px * 2 - 16px);
}

.button::after {
  top: 0;
  right: 54px;
  width: 8px;
}

.button__text::before {
  bottom: 0;
  right: 54px;
  width: calc(100% - 56px * 2 - 16px);
}

.button__text::after {
  bottom: 0;
  left: 54px;
  width: 8px;
}

.button__line {
  position: absolute;
  top: 0;
  width: 56px;
  height: 100%;
  overflow: hidden;
  transition: border-width 0.3s ease; /* 添加边框宽度过渡 */
}

.button__line::before {
  content: "";
  position: absolute;
  top: 0;
  width: 150%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 300px;
  border: solid 3px var(--line_color);
  border: solid 3px var(--line_color); /* 初始边框宽度 */
  background: transparent; /* 初始背景透明 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.button__line:nth-child(1),
.button__line:nth-child(1)::before {
  left: 0;
}

.button__line:nth-child(2),
.button__line:nth-child(2)::before {
  right: 0;
}

.button:hover {
  letter-spacing: 6px;
}

.button:hover::before,
.button:hover .button__text::before {
  width: 8px;
}

.button:hover::after,
.button:hover .button__text::after {
  width: calc(100% - 56px * 2 - 16px);
}


/*资源调度--叉形按钮的样式*/
.close-btn {
  font-size: 24px;
  color: #edf4ff;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: red; /* 鼠标悬停时颜色变红 */
}


/*物资查询的按钮*/
.cyber-button {
  /* 基础样式 */
  position: relative;
  background: linear-gradient(135deg, #0a2840 0%, #1a4a6e 50%, #0a2840 100%);
  color: #7df9ff; /* 科技蓝荧光色 */
  border: none;
  padding: 24px 48px;
  border-radius: 2px;
  font-size: 16px;
  font-family: 'Segoe UI', sans-serif;
  text-transform: uppercase;
  letter-spacing: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 15px;
  /*box-shadow: 0 0 15px rgba(94, 234, 255, 0.3);*/
}

/* 荧光文字效果 */
.glow-text {
  text-shadow: 0 0 -1px #7df9ff, 0 0 20px #7df9ff;
  position: relative;
  z-index: 2;
}

/* 动态渐变边框 */
.gradient-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg,
  #7df9ff 0%,
  rgba(125, 249, 255, 0) 30%,
  rgba(125, 249, 255, 0) 70%,
  #7df9ff 100%
  );
  border-radius: 4px;
  animation: borderFlow 3s linear infinite;
  mask: linear-gradient(#fff 0 0) content-box,
  linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 2px;
}

/* 悬停特效 */
.cyber-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(94, 234, 255, 0.5),
  0 4px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg,
  #0a2840 0%,
  #1a4a6e 50%,
  #0a2840 100%
  );
}

/* 点击动画 */
.cyber-button:active {
  transform: translateY(1px);
  box-shadow: 0 0 10px rgba(94, 234, 255, 0.3),
  0 2px 10px rgba(0, 0, 0, 0.2);
}

/* 边框流光动画 */
@keyframes borderFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

</style>
