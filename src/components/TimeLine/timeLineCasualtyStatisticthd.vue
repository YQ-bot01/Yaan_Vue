<template>
  <div class="pop">
    <div class="pop_header">
      <span class="pop_title">伤亡详情</span>
      <span class="title-time">{{ timestampToTime(currentTime) }}</span>

      <div class="sub-main">
        <el-table :data="statisticInfo"
                  :header-cell-style="tableHeaderColor"
                  :cell-style="tableColor"
                  :row-style="{ height: '37.5px', fontSize: '13px'}"
        >
          <el-table-column label=" " min-width="16px" show-overflow-tooltip>
            <template #default="scope">
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; "
                   class="arrow-container">
<!--                <img src="@/assets/images/arrow.png" alt="统一图片" style="width: 18px; height: 20px;"-->
<!--                     class="arrow-icon">-->
              </div>
            </template>
          </el-table-column>
          <el-table-column
              prop="address"
              label="位置"
              width="80"
              align="center"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="死亡"
              label="死亡"
              width="60"
              align="center"
              :formatter="formatPeople"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="失踪"
              label="失踪"
              width="60"
              :formatter="formatPeople"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="危重伤"
              label="危重伤"
              width="70"
              :formatter="formatPeople"
              show-overflow-tooltip>
          </el-table-column>
          <el-table-column
              prop="重伤"
              label="重伤"
              width="60"
              :formatter="formatPeople"
              show-overflow-tooltip>

          </el-table-column>
          <el-table-column
              prop="轻伤"
              label="轻伤"
              width="60"
              :formatter="formatPeople"
              show-overflow-tooltip>

          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>

</template>
<script>
import * as Cesium from "cesium";
import {getPlotInfos} from "@/api/system/plot.js";
import axios from "axios";
import {ref, watch, onMounted} from "vue";
import {tianDitulocalApi} from "@/utils/server.js";


export default {
  name: "layeredShowPlot",
  props: {
    zoomLevel: {
      type: String,
      default: '市'
    },
    pointsLayer: {
      type: Array,
      default: () => []
    },
    currentTime: {
      type: String,
      default: ''
    },
  },
  setup(props) {
    const isDataReady = ref(false);
    const entityGroups = ref({
      cityEntities: [],
      districtOrCountyEntities: [],
      townshipEntities: [],
      villageEntities: []
    });
    const labelText = ref('11');
    const statisticInfo = ref([]);
    const groupedEntities = {
      cityEntities: [],
      districtOrCountyEntities: [],
      townshipEntities: [],
      villageEntities: []
    };

    // const plotInfo=ref([])
    const resInfo = ref([]);


    // 监视 zoomLevel 和 pointsLayer
    watch(
        () => props.pointsLayer,
        (newVal) => {
          console.log("Updated pointsLayer:", newVal);
          getRescueActionCasualtiesPlotAndInfo(newVal);

        },
        {deep: true}
    );

    watch(
        () => props.zoomLevel,
        (val) => {
          if (!isDataReady.value) {
            getRescueActionCasualtiesPlotAndInfo(props.pointsLayer);
          }
          showStatisticInfo(val)
        },
        {immediate: true}
    );
    watch(
        () => props.currentTime,
        (val) => {
          console.log("currentTimeupodate statistic:", val);
          console.log(isDataReady, "isDataReady")
          if (!isDataReady.value) {
            getRescueActionCasualtiesPlotAndInfo(props.pointsLayer);
          }
          // if (isDataReady.value) {
          updateTime(val);
          // }
        },
        {
          immediate: true
        }
    );

    function formatPeople(row, column, value) {
      return value + '人';
    }

// 实现 Cesium 实体的切换显示
    function toggleEntities(entityName, show) {
      if (entityGroups.value[entityName] !== undefined) {
        entityGroups.value[entityName].forEach(entity => {
          entity.show = show;
        });
      } else {
        console.error(`Entity ${entityName} is undefined.`);
      }
    }

    async function getRescueActionCasualtiesPlotAndInfo(pointsLayer) {

      const filteredPoints = pointsLayer
          .filter(data => ["死亡人员", "危重伤人员", "重伤人员", "轻伤人员"].includes(data.plotType))
      ;
      // console.log(filteredPoints, 'filteredPoints')
      const locationDataArray = await Promise.all(filteredPoints.map(async data => {
        const {plotId, plotType, longitude, latitude, startTime, endTime} = data;

        try {
          const locationInfo = await getReverseGeocode(longitude, latitude);
          return {longitude, latitude, plotId, plotType, locationInfo, startTime, endTime};
        } catch (error) {
          console.error(`Failed to get location info for plotId ${plotId}:`, error);
          return null;
        }
      }));
      // console.log(locationDataArray, 'locationDataArray')
      const validLocationData = locationDataArray.filter(item => item !== null);
      resInfo.value = []
      // console.log("resInfo.value000", resInfo.value)
      await Promise.all(validLocationData.map(async data => {

        const {locationInfo, plotId, plotType, longitude, latitude, startTime, endTime} = data;

        resInfo.value.push({...await getPlotInfos({plotId, plotType}), locationInfo: locationInfo});
      }));

      // console.log("resInfo.value111", resInfo.value)
      isDataReady.value = true;
      updateTime(props.currentTime)
    }

    function updateTime(currentTime) {

      groupedEntities.cityEntities = []
      groupedEntities.districtOrCountyEntities = []
      groupedEntities.townshipEntities = []
      groupedEntities.villageEntities = []
      const levels = [
        {group: groupedEntities.cityEntities, key: 'city'},
        {group: groupedEntities.districtOrCountyEntities, key: 'county'},
        {group: groupedEntities.townshipEntities, key: 'town'},
        {group: groupedEntities.villageEntities, key: 'address'}
      ];

      let shifdata = []
      // console.log(resInfo.value,"resInfo.value222"); // 查看筛选结果
      resInfo.value.forEach(item => {
        let startTime = new Date(item.plotInfo.startTime);
        let current = new Date(currentTime);
        if (startTime <= current) {
          shifdata.push(item)
        }
      })
      // console.log(shifdata, "shifdata"); // 查看筛选结果

      shifdata.forEach(pointdata => {
        let plotId = pointdata.plotInfo.plotId
        let plotType = pointdata.plotInfo.plotType
        let longitude = pointdata.plotInfo.longitude
        let latitude = pointdata.plotInfo.latitude
        let plotTypeInfo = pointdata.plotTypeInfo
        levels.forEach(({group, key}) => {
          let entityGroup = group.find(g => g[key] === pointdata.locationInfo[key]);
          if (!entityGroup) {
            entityGroup = {[key]: pointdata.locationInfo[key], data: []};
            group.push(entityGroup);
          }
          entityGroup.data.push({
            plotId,
            plotType,
            longitude,
            latitude,
            plotTypeInfo
          });
        });
      })
      // console.log("groupedEntities", groupedEntities)
      const processStats = (entities) => {
        entities.forEach(group => {
          // console.log(group,"group")
          const casualtyStats = {};
          let totalNewCount = 0;
          group.data.forEach(entry => {
            const status = entry.plotTypeInfo?.casualtyStatus;
            const count = entry.plotTypeInfo?.newCount || 0;
            if (status) {
              casualtyStats[status] = (casualtyStats[status] || 0) + count;
            }
            totalNewCount += count;
          });
          group.casualtyStats = casualtyStats;
          group.totalNewCount = totalNewCount;
        });
      };
      processStats(groupedEntities.cityEntities);
      processStats(groupedEntities.districtOrCountyEntities);
      processStats(groupedEntities.townshipEntities);
      processStats(groupedEntities.villageEntities);
      showStatisticInfo(props.zoomLevel)
    }

    function showStatisticInfo(zoomLevel) {
      // console.log("showStatisticInfo", zoomLevel)
      switch (zoomLevel) {
        case '市':
          pushStatisticInfo(groupedEntities.cityEntities, 200000)
          break;
        case '区/县':
          pushStatisticInfo(groupedEntities.districtOrCountyEntities, 40000)
          break;
        case '乡/镇':
          pushStatisticInfo(groupedEntities.townshipEntities, 4000)
          break;
        case '村':
          pushStatisticInfo(groupedEntities.villageEntities, 2000)
          break;
        default:
          pushStatisticInfo(groupedEntities.cityEntities, 200000)
          break;
      }
    }


    function pushStatisticInfo(entitys, height) {
      // console.log("pushStatisticInfo", entitys, height)
      statisticInfo.value = []
      entitys.forEach(entity => {
        let casualtyStatsTemplate = {
          死亡: 0,
          失踪: 0,
          危重伤: 0,
          重伤: 0,
          轻伤: 0,
          address: '',
          latitude: '',
          longitude: '',
          height: '',
          plotId: '',
        };
        let casualtyStats = entity.casualtyStats;
        let address = entity.city || entity.county || entity.town || entity.address || "地址未知";
        // let position = Cesium.Cartesian3.fromDegrees(entity.data[0].longitude, entity.data[0].latitude);
        // 给定的对象
        let givenCasualtyStats = {
          ...casualtyStats,
          address: address,
          latitude: entity.data[0].latitude,
          longitude: entity.data[0].longitude,
          // position: position,
          height: height,
          plotId: entity.data[0].plotId,
        };
        // 将给定的对象转换为与 casualtyStatsTemplate 相同的属性名称
        let one = Object.keys(casualtyStatsTemplate).reduce((acc, key) => {
          acc[key] = givenCasualtyStats[key] || 0;
          return acc;
        }, {});
        statisticInfo.value.push(one)
        // console.log(statisticInfo, "statisticInfo")
      })
    }


    async function getReverseGeocode(lon, lat) {
      try {
        const response = await axios.get(`${tianDitulocalApi}/geocoder`, {
          params: {
            postStr: JSON.stringify({lon, lat, ver: 1}),
            type: 'geocode',
            tk: '80eb284748e84ca6c70468c906f0c889'
          }
        });
        return response.data.result.addressComponent;
      } catch (error) {
        console.error("逆地理编码失败:", error);
        return null;
      }
    }


    const tableHeaderColor = () => ({
      'background': 'linear-gradient(180deg, rgba(27,60,108,0.09) 0%, rgba(20,83,174,1) 100%)',
      'color': '#fff',
      'text-align': 'center',
      'font-size': '13px',
      'padding': '0',
      'margin': '0'
    });

    const tableColor = ({rowIndex}) => {
      // const backgroundColor = rowIndex % 2 === 1 ? '#313a44' : '#304156';
      return {
        // 'border-width':'1px',
        // 'border-style':'solid',
        // 'border-color': '#555555',
        'background-color': '#ffffff00',
        // 'color': '#ffffff00',
        'padding': '0',
        'margin': '1'
      };
    };

    function timestampToTime(timestamp) {
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
      return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`
      // return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    }

    return {
      entityGroups,
      toggleEntities,
      getRescueActionCasualtiesPlotAndInfo,
      statisticInfo,
      formatPeople,
      tableHeaderColor,
      tableColor,
      timestampToTime
    };
  }
}
;
</script>

<style scoped>
.pop {
  position: absolute;
  /*top: 19.5%;*/
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

.title-time {
  right: 1%;
  position: absolute;
  top: 16%;
  font-size: 0.9rem;
  font-weight: normal;
  font-family: 'myFirstFont', sans-serif;
  color: #ffffff;
}

.sub-main {
  overflow-y: hidden;
  overflow-x: hidden;
  margin-top: 6%;
  margin-left: 3%;
  width: 94%;
}

:deep(.el-table__header-wrapper) {
  background-color: rgb(25 56 77 / 33%);
}

:deep(.el-table__body-wrapper) {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: rgba(23, 54, 76, 0);
}

/* 设置“图层要素”样式 */
:deep(.collapse ) {
  overflow-y: auto;
  overflow-x: hidden;
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


/*表格页面样式*/
:deep(.el-table__inner-wrapper::before) {
  width: 0
}

:deep(.el-table) {
  --el-table-bg-color: ''
}

:deep(.el-pagination) {
  --el-pagination-item-gap: 6px;
}

:deep(.el-table--default .cell) {
  padding: 0 4px
}


:deep(.el-table tr) {
  background: #ffffff00;
  font-weight: 1000;
}

:deep(.el-table) {
  --el-table-border: 0px solid;
}


/*默认状态*/
:deep(.el-table tr) {
  background: #ffffff00;
  color: #ffffff;
  font-weight: 1000;
  position: relative;
  transition: box-shadow 0.3s ease; /* 添加过渡效果 */
}

:deep(.el-table tr:hover) {
  background: linear-gradient(0deg, rgba(38, 166, 221, 0.9) 30%, rgba(230, 247, 255, 1) 100%);
  font-weight: 1000;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  box-shadow: 0 0 8px 2px rgba(48, 140, 255, 1); /* 使用渐变阴影 */

}

/* 添加样式来控制箭头图标显示与隐藏 */
.arrow-icon {
  display: none; /* 初始状态下箭头不显示 */
}

/* 鼠标悬浮在行上时，显示箭头图标 */
:deep(.el-table tr:hover) .arrow-icon {
  display: inline-block; /* 显示箭头 */
}


</style>

