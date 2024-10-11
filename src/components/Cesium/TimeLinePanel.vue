<template>
  <div class="videoMonitorWin" v-if="visiblePanel" :style="styleObject">
    <div v-if="!showStatus">
      <div class="header-div">
        <span>
          <span>态势标绘信息</span>
        </span>
      </div>
      <el-descriptions :column="2" size="default " border>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              开始时间
            </div>
          </template>
          <div>
            <el-text v-if="plotInfoNew.aditStatus" size="large">{{
                ("" + plotInfoNew.starttime).match('-')
                    ? this.timestampToTime(plotInfoNew.starttime)
                    : (plotInfoNew.starttime !== null ? this.timestampToTime(plotInfoNew.starttime) : "")
              }}
            </el-text>
            <el-date-picker
                v-if="!plotInfoNew.aditStatus"
                v-model="plotInfoNew.starttime"
                type="datetime"
                placeholder="选择日期时间"
                value-format="x"
                size="large">
            </el-date-picker>
          </div>
        </el-descriptions-item>
        <el-descriptions-item>
          <template #label>
            <div class="cell-item">
              结束时间
            </div>
          </template>
          <div>
            <el-text v-if="plotInfoNew.aditStatus" size="large">{{
                ("" + plotInfoNew.endtime).match('-')
                    ? this.timestampToTime(plotInfoNew.endtime)
                    : (plotInfoNew.endtime !== "" ? this.timestampToTime(plotInfoNew.endtime) : "")
              }}
            </el-text>
            <el-date-picker
                v-if="!plotInfoNew.aditStatus"
                v-model="plotInfoNew.endtime"
                type="datetime"
                placeholder="选择日期时间"
                value-format="x"
                size="large">
            </el-date-picker>
          </div>
        </el-descriptions-item>
        <template v-for="(value,key,index) in plotInfoNew.info">
          <el-descriptions-item v-if="value.type ==='text'">
            <template #label>
              <div class="cell-item">
                {{ value.name }}
              </div>
            </template>
            <el-text v-if="plotInfoNew.aditStatus" size="large">{{ value.value }}</el-text>
            <el-input v-if="!plotInfoNew.aditStatus" v-model="value.value" autocomplete="off" size="large"/>
          </el-descriptions-item>
          <el-descriptions-item v-if="value.type ==='select'">
            <template #label>
              <div class="cell-item">
                {{ value.name }}
              </div>
            </template>
            <el-text v-if="plotInfoNew.aditStatus" size="large">{{ value.value }}</el-text>
            <el-select v-if="!plotInfoNew.aditStatus" v-model="value.value" placeholder="" size="large">
              <el-option
                  v-for="item in value.content"
                  :label="item.label"
                  :value="item.label"/>
            </el-select>
          </el-descriptions-item>
        </template>
      </el-descriptions>
<!--      <div class="collapseFooter">-->
<!--        <el-button v-if="!plotInfoNew.aditStatus && addStatus" type="success" round-->
<!--                   @click="addCommitPlotInfo(plotInfoNew)">新增-->
<!--        </el-button>-->
<!--        <el-button v-if="plotInfoNew.aditStatus && !addStatus" type="warning" round-->
<!--                   @click="beforeUpdataPlotInfo(plotInfoNew)">修改-->
<!--        </el-button>-->
<!--        <el-button v-if="!plotInfoNew.aditStatus && !addStatus" type="success" round-->
<!--                   @click="updataPlotInfo(plotInfoNew)">提交-->
<!--        </el-button>-->
<!--        <el-button v-if="plotInfoNew.aditStatus && !addStatus" type="danger" round-->
<!--                   @click="deletePlot">删除-->
<!--        </el-button>-->
<!--      </div>-->
      <!--        <el-descriptions :column="2" size="default " border>-->

      <!--        </el-descriptions>-->


      <!--      <el-scrollbar height="400px">-->
      <!--        <el-timeline>-->
      <!--          <el-timeline-item v-for="(activity, index) in plotInfoActivities" :key="index">-->
      <!--            <el-collapse v-model="activeNames" @change="">-->
      <!--              <el-collapse-item :name="index">-->
      <!--                <template #title>-->
      <!--                  <div>-->
      <!--                    &lt;!&ndash;此处首先判断starttime是日期形式还是时间戳形式；前者则直接显示；后者则再判断是否为null，不是null则把时间戳转成日期形式，是null则为空&ndash;&gt;-->
      <!--                    &lt;!&ndash;用来解决新增时下面的span显示时间戳的问题&ndash;&gt;-->
      <!--                    <span style="margin-left: 10px;font-size: 16px">-->
      <!--                      {{("" + activity.starttime).match('-')-->
      <!--                            ? activity.starttime-->
      <!--                            : (activity.starttime !== null ? activity.starttime : "") }}-->
      <!--                    </span>-->
      <!--                    &lt;!&ndash;                    <span style="margin-left: 20px">自定义内容 </span>&ndash;&gt;-->
      <!--                  </div>-->
      <!--                </template>-->
      <!--                <div>-->
      <!--                  <el-descriptions :column="2" size="default " border>-->
      <!--                    <el-descriptions-item>-->
      <!--                      <template #label>-->
      <!--                        <div class="cell-item">-->
      <!--                          开始时间-->
      <!--                        </div>-->
      <!--                      </template>-->
      <!--                      <div>-->
      <!--                        <el-text v-if="activity.aditStatus" size="large">{{-->
      <!--                            ("" + activity.starttime).match('-')-->
      <!--                                ? activity.starttime-->
      <!--                                : (activity.starttime !== null ? activity.starttime : "")-->
      <!--                          }}</el-text>-->
      <!--                        <el-date-picker-->
      <!--                            v-if="!activity.aditStatus"-->
      <!--                            v-model="activity.starttime"-->
      <!--                            type="datetime"-->
      <!--                            placeholder="选择日期时间"-->
      <!--                            value-format="x"-->
      <!--                            size="large">-->
      <!--                        </el-date-picker>-->
      <!--                      </div>-->
      <!--                    </el-descriptions-item>-->
      <!--                    <el-descriptions-item>-->
      <!--                      <template #label>-->
      <!--                        <div class="cell-item">-->
      <!--                          结束时间-->
      <!--                        </div>-->
      <!--                      </template>-->
      <!--                      <div>-->
      <!--                        <el-text v-if="activity.aditStatus" size="large">{{-->
      <!--                            ("" + activity.endtime).match('-')-->
      <!--                                ? activity.endtime-->
      <!--                                : (activity.endtime !== "" ? activity.endtime : "")-->
      <!--                          }}</el-text>-->
      <!--                        <el-date-picker-->
      <!--                            v-if="!activity.aditStatus"-->
      <!--                            v-model="activity.endtime"-->
      <!--                            type="datetime"-->
      <!--                            placeholder="选择日期时间"-->
      <!--                            value-format="x"-->
      <!--                            size="large">-->
      <!--                        </el-date-picker>-->
      <!--                      </div>-->
      <!--                    </el-descriptions-item>-->
      <!--                  </el-descriptions>-->

      <!--                  <el-descriptions :column="2" size="default " border>-->
      <!--                    <template v-for="(value,key,index) in activity.info">-->
      <!--                      <el-descriptions-item v-if="value.type ==='text'">-->
      <!--                        <template #label>-->
      <!--                          <div class="cell-item">-->
      <!--                            {{ value.name }}-->
      <!--                          </div>-->
      <!--                        </template>-->
      <!--                          <el-text v-if="activity.aditStatus" size="large" >{{ value.value }}</el-text>-->
      <!--                          <el-input v-if="!activity.aditStatus" v-model="value.value" autocomplete="off" size="large"/>-->
      <!--                      </el-descriptions-item>-->
      <!--                      <el-descriptions-item v-if="value.type ==='select'">-->
      <!--                        <template #label>-->
      <!--                          <div class="cell-item">-->
      <!--                            {{ value.name }}-->
      <!--                          </div>-->
      <!--                        </template>-->
      <!--                        <el-text v-if="activity.aditStatus" size="large">{{ value.value }}</el-text>-->
      <!--                        <el-select v-if="!activity.aditStatus" v-model="value.value" placeholder="" size="large">-->
      <!--                          <el-option-->
      <!--                              v-for="item in value.content"-->
      <!--                              :label="item.label"-->
      <!--                              :value="item.label"/>-->
      <!--                        </el-select>-->
      <!--                      </el-descriptions-item>-->
      <!--                    </template>-->
      <!--                  </el-descriptions>-->
      <!--                </div>-->
      <!--                <div class="collapseFooter">-->
      <!--                  <el-button v-if="!activity.aditStatus && addStatus" type="success" round-->
      <!--                             @click="addCommitPlotInfo(activity)">新增-->
      <!--                  </el-button>-->
      <!--                  <el-button v-if="activity.aditStatus && !addStatus" type="warning" round-->
      <!--                             @click="beforeUpdataPlotInfo(activity)">修改-->
      <!--                  </el-button>-->
      <!--                  <el-button v-if="!activity.aditStatus && !addStatus" type="success" round-->
      <!--                             @click="updataPlotInfo(activity)">提交-->
      <!--                  </el-button>-->
      <!--                  <el-button v-if="activity.aditStatus && !addStatus" type="danger" round-->
      <!--                             @click="deletePlotInfo(activity)">删除-->
      <!--                  </el-button>-->
      <!--                </div>-->
      <!--              </el-collapse-item>-->
      <!--            </el-collapse>-->
      <!--          </el-timeline-item>-->
      <!--        </el-timeline>-->
      <!--      </el-scrollbar>-->
    </div>
  </div>
</template>
<script>
import {Delete, Edit} from '@element-plus/icons-vue'
import {plotType as plotTypeDialog } from '@/cesium/plot/plotType.js'
import {getPlotInfos, addPlotInfo, deletePlotAndInfo, deletePlotInfo, updataPlotInfo} from '@/api/system/plot.js'
import arrow from "@/cesium/drawArrow/drawPlot.js";

export default {
  data() {
    return {
      visiblePanel: null,
      positionEntity: {x: 0, y: 0},
      popupPanelData: {}, // 存储这当前标绘点在situationplot表中的信息
      //--------------------
      showStatus: false,
      plotInfoActivities: [], // 存储当前标绘点的多有situationplotinfo表信息
      activeNames: [], // 对应每个el-collapse-item标签的name，数组中有谁，谁展开。（我使用的index是整型）
      addStatus: false,
      plotInfoNew: {
        starttime: null,
        endtime: null,
        info: null,
        id: null,
        aditStatus: true,
      }
    }
  },
  props: [
    'popupData', 'position', 'visible'
  ],
  watch: {
    visible() {
      this.visiblePanel = this.visible
    },
    popupData: {
      deep: true,
      handler() {
        this.popupPanelData = this.popupData
        console.log(this.popupPanelData,"this.popupPanelData===")
        this.plotInfoActivities = []
        // 必须把生成对应标绘的html模板代码（下面的for循环），写在watch的popupData中，不能写在visible中。
        // 在执行顺序上，visible比popupData快。导致在判断this.popupPanelData.plottype === plotType[item].name时，
        // popupPanelData是空，判断一定时false，造成第一次点击弹窗无法渲染对应标绘的html模板。
        // 可能时因为开启深度监听的原因（deep: true）。
        // console.log("this.popupPanelData.drawtype",this.popupPanelData)
        if (this.visiblePanel) {
          if (this.popupPanelData.drawtype === 'straight' || this.popupPanelData.drawtype === 'attack' || this.popupPanelData.drawtype === 'pincer') {

          } else if (this.popupPanelData.drawtype) {
            this.getPlotInfo(this.popupPanelData.plotId,this.popupPanelData.plotType)
          } else {
            if (this.popupPanelData[0].drawtype === 'polyline') {
              // console.log(this.popupPanelData[0], 987)
              this.getPlotInfo(this.popupPanelData[0].plotId,this.popupPanelData[0].plotType)
            }else {
              // console.log(this.popupPanelData[0], 987)
              this.getPlotInfo(this.popupPanelData[0].plotId,this.popupPanelData[0].plotType)
            }
          }
        }
      }
    },
    position() {
      this.positionEntity = this.position
    },
  },
  computed: {
    // 调整弹框位置
    styleObject() {
      return {
        positionEntity: "absolute",
        left: `${this.positionEntity.x}px`,
        top: `${this.positionEntity.y}px`
      };
    }
  },
  methods: {
    // 标绘信息修改按钮
    beforeUpdataPlotInfo(activity) {
      activity.aditStatus = !activity.aditStatus
      // 把做时间戳转换成yyyy-mm-dd hh:mm:ss格式，这样在修改界面的el-date-picker就不会显示时间轴了
      // 然后在updataPlotInfo中提交时再把yyyy-mm-dd hh:mm:ss格式转成时间轴存库
      activity.starttime = this.timestampToTime(activity.starttime)//new Date(activity.starttime).getTime();
      activity.endtime = this.timestampToTime(activity.endtime)//new Date(activity.endtime).getTime();
    },
    // 提交修改的标绘信息
    updataPlotInfo(activity) {
      console.log("activity",activity)
      let that = this
      // 创建一个新的对象，只保留字段和它们的 value 值
      let typeInfoValues = {};
      if (activity.info) {
        for (let key in activity.info) {
          if (activity.info.hasOwnProperty(key) && activity.info[key].hasOwnProperty('value')) {
            typeInfoValues[key] = activity.info[key].value;
          }
        }
      }
      activity.aditStatus = !activity.aditStatus
      let plotId = activity.plotId
      let plotType = activity.plotType

      updataPlotInfo({ plotId, plotType }, typeInfoValues).then(res => {
        that.getPlotInfo(plotId,plotType);
      });
    },
    // 删除标绘信息
    deletePlotInfo(activity) {
      let id = activity.uuid
      let that = this
      deletePlotInfo({id}).then(res => {
        that.getPlotInfo(that.popupPanelData.plotid)
      })
    },
    // 删除标绘点
    deletePlot() {
      let arraw = false

      let data = {
        plotId: null,
        plotType: null
      }

      if (this.popupPanelData.drawtype === 'point') {
        data.plotId = this.popupPanelData.plotId
        data.plotType = this.popupPanelData.plotType
      } else if (this.popupPanelData.drawtype === 'straight') {
        arraw = true
        data.plotId = this.popupPanelData.plotId
        data.plotType = this.popupPanelData.plotType
      } else if (this.popupPanelData.drawtype === 'attack') {
        arraw = true
        data.plotId = this.popupPanelData.plotId
        data.plotType = this.popupPanelData.plotType
      } else if (this.popupPanelData.drawtype === 'pincer') {
        arraw = true
        data.plotId = this.popupPanelData.plotId
        data.plotType = this.popupPanelData.plotType
      } else {
        if (this.popupPanelData[0].drawtype === 'polyline') {
          data.plotId = this.popupPanelData[0].plotId
          data.plotType = this.popupPanelData[0].plotType
        } else {
          data.plotId = this.popupPanelData[0].plotId
          data.plotType = this.popupPanelData[0].plotType
        }
      }

      deletePlotInfo(data).then(res => {
        // 从 dataSource 中删除点
        window.viewer.entities.removeById(data.plotId)
        if (window.pointDataSource) {
          const entityToRemove = window.pointDataSource.entities.getById(data.plotId);
          console.log("entityToRemove", entityToRemove)
          if (entityToRemove) {
            window.pointDataSource.entities.remove(entityToRemove); // 移除点
          }
        }
        if (arraw) {
          arrow.clearById(data.plotId)
        }
        this.$emit('closePlotPop')
      })
    },
    // 打开添加标绘信息
    addPlotInfo() {
      this.addStatus = !this.addStatus
      let data = {
        starttime: null,
        endtime: null,
        info: null,
        aditStatus: false,
        id: this.guid()
      }
      for (let item in plotTypeDialog) {
        if (this.popupPanelData.plottype === plotTypeDialog[item].name) {
          // 深拷贝
          data.info = JSON.parse(JSON.stringify(plotTypeDialog[item]))
          break;
        }
      }
      this.plotInfoActivities.push(data)
      // 使新增的折叠面板处于打开状态
      this.activeNames[0] = this.plotInfoActivities.length - 1
    },
    // 提交添加标绘信息
    addCommitPlotInfo(activity) {
      let that = this
      activity.aditStatus = !activity.aditStatus
      let data = {
        plotid: this.popupPanelData.plotid,
        starttime: activity.starttime,
        endtime: activity.endtime,
        info: JSON.stringify(activity.info),
        id: activity.id
      }
      addPlotInfo(data).then(res => {
        that.getPlotInfo(that.popupPanelData.plotid)
        that.addStatus = !this.addStatus
      })
    },
    // 点击标绘点后获取此标绘点的所有标绘信息
    getPlotInfo(plotId,plotType) {
      // console.log("点击获取",plotId,plotType)
      let that = this;
      // 1. 请求获取标绘点信息
      getPlotInfos({ plotId, plotType }).then(res => {
        console.log("点击获取",res)
        // 2. 初始化 item 对象，存储标绘信息
        let item = {
          starttime: null,
          endtime: null,
          info: null,
          uuid: null,
          aditStatus: true,
          plotId: null,
          plotType:null
        };

        // 3. 处理标绘点的开始和结束时间
        item.starttime = that.timestampToTime(res.plotInfo.startTime);
        item.endtime = res.plotInfo.endTime ? that.timestampToTime(res.plotInfo.endTime) : "";
        item.plotId = plotId;
        item.plotType = plotType;
        // 4. 初始化类型信息
        let typeInfo = {};

        // 5. 根据 plotType 生成对应类型的 dialog
        for (let key in plotTypeDialog) {
          if (res.plotInfo.plotType === plotTypeDialog[key].name) {
            // 深拷贝 plotTypeDialog 中的对应类型到 typeInfo
            typeInfo = JSON.parse(JSON.stringify(plotTypeDialog[key]));
            break; // 找到对应类型后跳出循环
          }
        }

        // 6. 将获取到的 plotTypeInfo 值赋给 typeInfo
        if (res.plotTypeInfo) {
          for (let key in typeInfo) {
            // 如果 plotTypeInfo 中存在对应字段，则直接赋值
            if (res.plotTypeInfo[key] !== undefined) {
              typeInfo[key].value = res.plotTypeInfo[key]; // 直接赋值
            }
          }
        }

        // 7. 将处理后的 typeInfo 赋值给 item.info
        item.info = typeInfo;

        // 8. 设置 item.id
        item.uuid = res.plotTypeInfo.uuid;

        // 9. 将 item 添加到 plotInfoActivities 数组中
        that.plotInfoActivities.push(item);

        // 10. 更新 plotInfoNew 为最新的标绘信息
        that.plotInfoNew = that.plotInfoActivities[0];
      })
    },
    // 删除标注
    deletePoint() {
      this.$emit('closePlotPop')
      this.$emit('wsSendPoint', JSON.stringify({type: "point", operate: "delete", id: window.selectedEntity.id}))
    },
    // 时间戳转换成日期格式，将时间戳转换成 xx年xx月xx日xx时xx分xx秒格式，
    // 形参timestamp必须时整型时间戳，字符串类型时间戳得到的时NaN。
    timestampToTime(timestamp) {
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
      // return `${year}年${month}月${day}日${hh}时${mm}分${ss}秒`
      return `${year}-${month}-${day} ${hh}:${mm}:${ss}`
    },
    // 生成uuid
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }
};
</script>
<style>
.el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell {
  /*width: 43px!important;*/
}

.cell-item {
  width: 100%;
  text-align: center;
}

.collapseFooter {
  float: right;
  margin: 10px;
}

.el-input {
  --el-input-width: 140px !important;
}

.el-select {
  /* 此版本下的select下拉框跟inline属性有bug，当设置inline时，select的宽度会丢失，因此需要手动设置 */
  --el-select-width: 140px !important;
}

.header-div {
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.box-card {
  margin-bottom: 5px;
}

.videoMonitorWin {
  position: absolute;
  width: 800px;
  padding: 20px;
  z-index: 10;
  background-color: rgba(40, 40, 40, 0.7);
  border: 2px solid #18c9dc;
}

.ponpTitle {
  font-size: 23px;
  text-align: center;
  color: white;
  margin-bottom: 10px;
}

.ponpTable {
  text-align: center;
  color: white;
  margin-bottom: 10px;
}

.ponpTable td {
  padding: 10px;
}

.info-item :nth-child(1) {
  width: 15%;
  border-color: #293966;
  border-top-style: solid;
  border-top-width: 2px;
  background-color: #293966;
  margin-bottom: 2px;
  align-content: center;
}

.info-item :nth-child(2) {
  width: 60%;
  border-color: #4d5469;
  border-top-style: solid;
  border-top-width: 2px;
  background-color: #4d5469;
  margin-bottom: 2px;
}

</style>
